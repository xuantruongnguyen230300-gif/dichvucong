import { useCallback, useEffect, useReducer, useRef } from 'react';
import { laLoiHuy } from '../../core/api/http';
import { hoiChuDe, hoiTroLy, type CauTraLoi } from './api/troLy';
import { lienKetCongDvcDauTien } from './lienKetDapAn';

/** Số tin tối đa giữ trong bộ nhớ; quá thì bỏ tin cũ nhất (F06 plan §5.2). */
export const SO_TIN_TOI_DA = 60;

/** Yêu cầu đã gửi, giữ để "Thử lại" gửi đúng lại. */
export type YeuCau = { loai: 'hoi'; cauHoi: string } | { loai: 'chu-de'; thuTu: number };

export type TinNhanState =
  | { id: number; vai: 'nguoi-dan'; noiDung: string }
  | { id: number; vai: 'tro-ly'; kieu: 'dap-an'; cau: CauTraLoi; luc: number }
  | { id: number; vai: 'tro-ly'; kieu: 'loi'; loi: unknown; yeuCau: YeuCau };

export interface TrangThaiHoiTroLy {
  tinNhan: TinNhanState[];
  dangCho: boolean;
  /** Mã thủ tục đang nói tới; luôn gán lại bằng `thuTucDangNoi` của đáp án mới nhất. Chỉ ở bộ nhớ (BR-13). */
  thuTucDangNoi: string | null;
  /** Liên kết Cổng DVC đầu tiên đã xuất hiện trong hội thoại (cho dòng nhắc đăng xuất của kiosk — một dòng cho cả khung). */
  lienKetCongDvc: string | null;
  /** Đáp án mới nhất từ máy chủ, cho điểm ghép F07; lời chào và tin lỗi không bao giờ vào đây. */
  dapAnMoiNhat: { id: number; cau: CauTraLoi; luc: number } | null;
  tiepTheo: number;
}

type HanhDong =
  | { loai: 'gui'; noiDung: string }
  | { loai: 'thu-lai'; id: number }
  | { loai: 'co-dap-an'; cau: CauTraLoi; luc: number }
  | { loai: 'co-loi'; loi: unknown; yeuCau: YeuCau };

export const TRANG_THAI_DAU: TrangThaiHoiTroLy = {
  tinNhan: [],
  dangCho: false,
  thuTucDangNoi: null,
  lienKetCongDvc: null,
  dapAnMoiNhat: null,
  tiepTheo: 1,
};

const giuTinMoi = (tin: TinNhanState[]) => (tin.length > SO_TIN_TOI_DA ? tin.slice(-SO_TIN_TOI_DA) : tin);

export function reducerHoiTroLy(tt: TrangThaiHoiTroLy, hd: HanhDong): TrangThaiHoiTroLy {
  switch (hd.loai) {
    case 'gui': {
      const tin: TinNhanState = { id: tt.tiepTheo, vai: 'nguoi-dan', noiDung: hd.noiDung };
      return { ...tt, dangCho: true, tinNhan: giuTinMoi([...tt.tinNhan, tin]), tiepTheo: tt.tiepTheo + 1 };
    }
    case 'thu-lai':
      return { ...tt, dangCho: true, tinNhan: tt.tinNhan.filter((t) => t.id !== hd.id) };
    case 'co-dap-an': {
      const id = tt.tiepTheo;
      const tin: TinNhanState = { id, vai: 'tro-ly', kieu: 'dap-an', cau: hd.cau, luc: hd.luc };
      return {
        ...tt,
        dangCho: false,
        tinNhan: giuTinMoi([...tt.tinNhan, tin]),
        // Luôn gán lại bằng giá trị máy chủ trả về (plan §3.2): máy chủ quyết định ngữ cảnh
        thuTucDangNoi: hd.cau.thuTucDangNoi,
        lienKetCongDvc: tt.lienKetCongDvc ?? lienKetCongDvcDauTien(hd.cau),
        dapAnMoiNhat: { id, cau: hd.cau, luc: hd.luc },
        tiepTheo: id + 1,
      };
    }
    case 'co-loi': {
      const id = tt.tiepTheo;
      const tin: TinNhanState = { id, vai: 'tro-ly', kieu: 'loi', loi: hd.loi, yeuCau: hd.yeuCau };
      return { ...tt, dangCho: false, tinNhan: giuTinMoi([...tt.tinNhan, tin]), tiepTheo: id + 1 };
    }
  }
}

export interface HoiTroLy {
  trangThai: TrangThaiHoiTroLy;
  /** Gửi một câu hỏi (đã cắt khoảng trắng hai đầu). Trả `true` khi thật sự gửi; rỗng hoặc đang chờ trả `false`. */
  gui: (cauHoi: string) => boolean;
  /** Bấm một chủ đề gợi ý: `tenHienThi` hiện như câu của người dân. */
  guiChuDe: (thuTu: number, tenHienThi: string) => boolean;
  /** Gửi lại đúng yêu cầu của một tin lỗi. */
  thuLai: (idTinLoi: number) => void;
}

/**
 * Hội thoại của khung trợ lý (F06 plan §5.2). Mọi thứ nằm trong bộ nhớ của khung, không lưu storage, không qua TanStack Query:
 * câu hỏi có thể chứa thông tin cá nhân (kiosk dùng chung). Gỡ khung thì huỷ yêu cầu đang bay.
 * Mỗi lúc chỉ một yêu cầu: bấm "Gửi" hai lần nhanh chỉ gửi một câu.
 */
export function useHoiTroLy(): HoiTroLy {
  const [trangThai, dispatch] = useReducer(reducerHoiTroLy, TRANG_THAI_DAU);
  const moiNhat = useRef(trangThai);
  const dangGui = useRef(false);
  const huy = useRef<AbortController | null>(null);

  useEffect(() => {
    moiNhat.current = trangThai;
  });
  useEffect(
    () => () => {
      huy.current?.abort();
    },
    [],
  );

  const chay = useCallback((yeuCau: YeuCau, maThuTuc: string | null) => {
    dangGui.current = true;
    const dieuKhien = new AbortController();
    huy.current = dieuKhien;
    const loiHua =
      yeuCau.loai === 'hoi'
        ? hoiTroLy(yeuCau.cauHoi, maThuTuc, dieuKhien.signal)
        : hoiChuDe(yeuCau.thuTu, maThuTuc, dieuKhien.signal);
    loiHua.then(
      (cau) => {
        dangGui.current = false;
        dispatch({ loai: 'co-dap-an', cau, luc: Date.now() });
      },
      (loi: unknown) => {
        if (laLoiHuy(loi)) return; // khung bị gỡ
        dangGui.current = false;
        dispatch({ loai: 'co-loi', loi, yeuCau });
      },
    );
  }, []);

  const gui = useCallback(
    (cauHoi: string) => {
      const sach = cauHoi.trim();
      if (sach === '' || dangGui.current) return false;
      dispatch({ loai: 'gui', noiDung: sach });
      chay({ loai: 'hoi', cauHoi: sach }, moiNhat.current.thuTucDangNoi);
      return true;
    },
    [chay],
  );

  const guiChuDe = useCallback(
    (thuTu: number, tenHienThi: string) => {
      if (dangGui.current) return false;
      dispatch({ loai: 'gui', noiDung: tenHienThi });
      chay({ loai: 'chu-de', thuTu }, moiNhat.current.thuTucDangNoi);
      return true;
    },
    [chay],
  );

  const thuLai = useCallback(
    (idTinLoi: number) => {
      if (dangGui.current) return;
      const tin = moiNhat.current.tinNhan.find((t) => t.id === idTinLoi);
      if (tin?.vai !== 'tro-ly' || tin.kieu !== 'loi') return;
      dispatch({ loai: 'thu-lai', id: idTinLoi });
      chay(tin.yeuCau, moiNhat.current.thuTucDangNoi);
    },
    [chay],
  );

  return { trangThai, gui, guiChuDe, thuLai };
}
