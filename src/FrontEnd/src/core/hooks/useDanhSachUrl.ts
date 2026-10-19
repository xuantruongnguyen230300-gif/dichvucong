import { useCallback, useContext, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UNSAFE_DataRouterContext as NguCanhRouter, useSearchParams } from 'react-router';
import { gioiHanTuKhoa } from '../utils/timKiem';

const TRE_GHI_URL_MS = 300;

interface TuyChon {
  /** Khoá tính là bộ lọc, bị xoá khi "Xoá bộ lọc" (vd. ['lv'], ['lv', 'md']). */
  boLoc?: readonly string[];
  /** Khoá khác: đổi thì về trang 1 nhưng không tính là bộ lọc (vd. tab 'cap' của F04). */
  khac?: readonly string[];
  khoaTuKhoa?: string;
  khoaTrang?: string;
}

const MANG_RONG: readonly string[] = [];

/**
 * Trạng thái danh sách lưu trên địa chỉ: từ khoá, bộ lọc, số trang (plan C01 §4.4).
 * - Ô tìm giữ giá trị trong state (bộ gõ tiếng Việt, giới hạn replaceState của Safari). Không bao giờ lấy giá trị từ
 *   địa chỉ đè lên chữ đang gõ, trừ khi địa chỉ đổi từ khoá do bên khác. Từ khoá chỉ được ghi lên địa chỉ chậm 300 ms
 *   sau phím cuối.
 * - Mọi lần ghi đều thay mục lịch sử (replace).
 * - Địa chỉ đổi từ bên ngoài ("Quay lại", "Bắt đầu lại") thì ô tìm cập nhật theo.
 * - Mỗi lần ghi (kể cả lần trễ 300 ms) lấy địa chỉ MỚI NHẤT của router (lần điều hướng đang chờ hoặc địa chỉ đã commit) rồi mới
 *   áp thay đổi của mình lên: điều hướng khác xen vào giữa (mở popup `?ma=`, bộ lọc do nơi khác đặt) không bị ghi đè bằng bản cũ.
 *
 * Lỗi đã gặp (gõ "giay" ra "iay"): bản cũ xoá "đang gõ" ngay khi ghi, trong lúc địa chỉ chưa đổi vì transition của
 * React Router còn chờ; ô tìm quay về từ khoá cũ trên địa chỉ, rồi phím kế tiếp nối vào giá trị cũ đó.
 * Test tái hiện: `useDanhSachUrl.gonhanh.test.tsx`.
 */
export function useDanhSachUrl(tuChon: TuyChon = {}) {
  const boLoc = tuChon.boLoc ?? MANG_RONG;
  const khoaTuKhoa = tuChon.khoaTuKhoa ?? 'q';
  const khoaTrang = tuChon.khoaTrang ?? 'trang';

  const [params, setParams] = useSearchParams();
  const router = useContext(NguCanhRouter)?.router;
  // Từ khoá trên địa chỉ bị cắt về giới hạn (độ dài, số từ): link dài tuỳ ý không đưa được chữ lên trang
  const urlTuKhoa = gioiHanTuKhoa(params.get(khoaTuKhoa) ?? '');

  // Chữ trong ô tìm: nguồn đúng của những gì người dùng đã gõ
  const [tuKhoa, setTuKhoa] = useState(urlTuKhoa);
  // Chữ trong ô chưa có trên địa chỉ (đang chờ ghi, hoặc đã ghi mà địa chỉ chưa về)
  const dangCho = tuKhoa !== urlTuKhoa;

  // Giá trị mới nhất cho callback chạy muộn (đồng hồ, sự kiện). `gia` ghi ngay trong sự kiện gõ, `params` ghi ngay khi hook ghi
  // địa chỉ; sau commit chỉ cập nhật khi địa chỉ đổi do bên khác hoặc đã về kịp bản mới nhất hook ghi.
  const moiNhat = useRef({ params, gia: tuKhoa });
  // Chuỗi query hook đã ghi mà `params` chưa phản ánh, theo thứ tự ghi
  const diaChiDaGhi = useRef<string[]>([]);
  // Từ khoá trên địa chỉ ở lần commit trước
  const urlDaThay = useRef(urlTuKhoa);

  const dongHo = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const huyDongHo = useCallback(() => {
    clearTimeout(dongHo.current);
    dongHo.current = undefined;
  }, []);
  useEffect(() => huyDongHo, [huyDongHo]);

  // Chạy khi địa chỉ ĐÃ COMMIT một giá trị mới (render nhường cho phím gõ không tính: nó vẫn thấy địa chỉ cũ).
  // - Địa chỉ do chính hook ghi về (muộn, từng giá trị một): bỏ qua, ô tìm đã đúng và có thể đã gõ thêm.
  // - Địa chỉ đổi từ khoá do bên khác ("Quay lại", "Bắt đầu lại"): ô tìm theo địa chỉ, huỷ lần ghi đang chờ.
  useLayoutEffect(() => {
    const chuoi = params.toString();
    const viTri = diaChiDaGhi.current.indexOf(chuoi);
    const cuaHook = viTri >= 0;
    if (cuaHook) diaChiDaGhi.current.splice(0, viTri + 1);
    else diaChiDaGhi.current = [];

    if (!cuaHook && urlTuKhoa !== urlDaThay.current) {
      huyDongHo();
      moiNhat.current.gia = urlTuKhoa;
      // Đồng bộ state với địa chỉ vừa đổi từ bên ngoài, trước khi vẽ ra màn hình
      setTuKhoa(urlTuKhoa);
    }
    urlDaThay.current = urlTuKhoa;
    // Còn lần ghi mới hơn chưa về: giữ bản mới nhất để lần ghi sau không làm mất thay đổi chưa về
    if (diaChiDaGhi.current.length === 0) moiNhat.current.params = params;
  }, [params, urlTuKhoa, huyDongHo]);

  /**
   * Địa chỉ mới nhất tại thời điểm gọi. Có router dữ liệu: lần điều hướng đang chờ hoặc địa chỉ đã commit (`params` của lần
   * vẽ trước có thể cũ hơn). Không có: bản hook tự nhớ.
   */
  const diaChiMoiNhat = useCallback((): URLSearchParams => {
    if (router) {
      const { navigation, location } = router.state;
      return new URLSearchParams((navigation.location ?? location).search);
    }
    return new URLSearchParams(moiNhat.current.params);
  }, [router]);

  /** Ghi `moi` lên địa chỉ và nhớ để nhận ra khi địa chỉ về. */
  const ghiDiaChi = useCallback(
    (moi: URLSearchParams) => {
      const chuoi = moi.toString();
      const cuoi = router ? diaChiMoiNhat().toString() : (diaChiDaGhi.current.at(-1) ?? moiNhat.current.params.toString());
      moiNhat.current.params = moi;
      if (chuoi === cuoi) return; // địa chỉ không đổi: không có gì để chờ
      diaChiDaGhi.current.push(chuoi);
      setParams(moi, { replace: true });
    },
    [router, diaChiMoiNhat, setParams],
  );

  /** Ghi một lần: áp `thay` lên địa chỉ, kèm từ khoá đang chờ, bỏ số trang. */
  const ghi = useCallback(
    (thay: Record<string, string | null>, boQuaTrang = false) => {
      huyDongHo();
      const gia = moiNhat.current.gia;
      const moi = diaChiMoiNhat();
      const ap = (khoa: string, giaTri: string | null) => {
        if (giaTri === null || giaTri.trim() === '') moi.delete(khoa);
        else moi.set(khoa, giaTri);
      };
      ap(khoaTuKhoa, gioiHanTuKhoa(gia));
      for (const [khoa, giaTri] of Object.entries(thay)) ap(khoa, giaTri);
      if (!boQuaTrang) moi.delete(khoaTrang);
      ghiDiaChi(moi);
    },
    [diaChiMoiNhat, ghiDiaChi, huyDongHo, khoaTuKhoa, khoaTrang],
  );

  const datTuKhoa = useCallback(
    (giaTriGo: string) => {
      const v = gioiHanTuKhoa(giaTriGo);
      moiNhat.current.gia = v;
      setTuKhoa(v);
      huyDongHo();
      dongHo.current = setTimeout(() => {
        dongHo.current = undefined;
        ghi({});
      }, TRE_GHI_URL_MS);
    },
    [ghi, huyDongHo],
  );

  const dat = useCallback((thay: Record<string, string | null>) => ghi(thay), [ghi]);

  const datTrang = useCallback(
    (so: number) => ghi({ [khoaTrang]: so > 1 ? String(Math.floor(so)) : null }, true),
    [ghi, khoaTrang],
  );

  const xoaBoLoc = useCallback(() => {
    huyDongHo();
    const moi = diaChiMoiNhat();
    moi.delete(khoaTuKhoa);
    moi.delete(khoaTrang);
    for (const khoa of boLoc) moi.delete(khoa);
    moiNhat.current.gia = '';
    setTuKhoa('');
    ghiDiaChi(moi);
  }, [boLoc, diaChiMoiNhat, ghiDiaChi, huyDongHo, khoaTuKhoa, khoaTrang]);

  const giaTri = useCallback((khoa: string) => params.get(khoa) ?? '', [params]);

  const coBoLoc = boLoc.some((khoa) => (params.get(khoa) ?? '') !== '');
  const tuKhoaLoc = useDeferredValue(tuKhoa);

  return useMemo(
    () => ({
      tuKhoa,
      datTuKhoa,
      tuKhoaLoc,
      giaTri,
      dat,
      // Chữ trong ô chưa có trên địa chỉ: về trang 1 ngay
      trang: dangCho ? null : params.get(khoaTrang),
      datTrang,
      coDieuKien: tuKhoa.trim() !== '' || coBoLoc,
      xoaBoLoc,
    }),
    [tuKhoa, datTuKhoa, tuKhoaLoc, giaTri, dat, dangCho, params, khoaTrang, datTrang, coBoLoc, xoaBoLoc],
  );
}
