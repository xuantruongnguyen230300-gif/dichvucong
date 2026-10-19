import type { TFunction } from 'i18next';
import { dangLamViec, gopNgay, type Khung } from '../trang-chu/gioLamViec';
import type { CauTraLoi, ThuTucNgan } from './api/troLy';
import { catChu, coChu } from './view/chu';

type Thu = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type T = TFunction<'chatbot'>;

const DO_DAI_TEN_TOI_DA = 90;

/**
 * Chữ thuần của một đáp án để F07 đọc (plan §6): ghép bằng CÙNG khoá `t()` với giao diện, mỗi ý một dòng.
 * Bỏ nhãn nút (Xem chi tiết, Xem và nộp trên Cổng DVC, Gọi Trung tâm, Mở Zalo), đường dẫn và dòng nhắc đăng xuất.
 * Viết tắt chưa mở rộng: F07 đọc bảng viết tắt. `luc` là thời điểm đáp án đến (giờ làm việc là ảnh chụp lúc hỏi).
 */
export function vanBanDoc(cau: CauTraLoi, t: T, luc: number = Date.now()): string {
  return dongCuaDapAn(cau, t, luc).filter(coChu).join('\n');
}

function dongThuTuc(cacThuTuc: readonly ThuTucNgan[]): string[] {
  return cacThuTuc.map((tt) => tt.ten);
}

function dongNoiNop(t: T, quay: number | null, noiTiepNhan: string | null, trungTam: { ten: string; diaChi: string } | null, linhVuc: string | null): string[] {
  if (quay !== null) {
    const dong = linhVuc ? t('quay.nop-tai-quay-linh-vuc', { linhVuc, quay }) : t('quay.nop-tai-quay', { quay });
    return [dong, noiTiepNhan ? t('quay.noi-tiep-nhan-chuyen', { noi: noiTiepNhan }) : ''];
  }
  if (trungTam) {
    return [
      linhVuc
        ? t('quay.nop-tai-trung-tam-linh-vuc', { linhVuc, ten: trungTam.ten, diaChi: trungTam.diaChi })
        : t('quay.nop-tai-trung-tam', { ten: trungTam.ten, diaChi: trungTam.diaChi }),
    ];
  }
  return [linhVuc ? t('quay.nop-tai-trung-tam-chung-linh-vuc', { linhVuc }) : t('quay.nop-tai-trung-tam-chung')];
}

function dongCuaDapAn(cau: CauTraLoi, t: T, luc: number): string[] {
  switch (cau.loai) {
    case 'thu-tuc': {
      const dong = [t('thu-tuc.dong-dau', { ma: cau.thuTuc.ma, ten: catChu(cau.thuTuc.ten, DO_DAI_TEN_TOI_DA) }), ...dongMucThuTuc(cau, t)];
      if (cau.thuTucKhac.length > 0) dong.push(t('thu-tuc.khac'), ...dongThuTuc(cau.thuTucKhac));
      return dong;
    }
    case 'thu-tuc-danh-sach':
      return [t('thu-tuc.danh-sach', { so: cau.danhSachThuTuc.length }), ...dongThuTuc(cau.danhSachThuTuc)];
    case 'chu-de': {
      if (cau.tong === 0 || cau.danhSachThuTuc.length === 0) return [t('chu-de.rong')];
      const so = cau.danhSachThuTuc.length;
      return [
        t('chu-de.tieu-de', { ten: cau.chuDe.linhVuc, tong: cau.tong }),
        ...dongThuTuc(cau.danhSachThuTuc),
        cau.tong > so ? t('chu-de.hien-thi', { so, tong: cau.tong }) : '',
        ...dongNoiNop(t, cau.quay, cau.noiTiepNhanChuyen, cau.trungTam, cau.chuDe.linhVuc),
        t('chu-de.goi-y-ten'),
      ];
    }
    case 'cau-hoi-mau':
      return [cau.traLoi, ...(cau.danhSachThuTuc.length > 0 ? [t('thu-tuc.lien-quan'), ...dongThuTuc(cau.danhSachThuTuc)] : [])];
    case 'trung-tam':
      return dongTrungTam(cau, t, luc);
    case 'quay': {
      const linhVuc = coChu(cau.linhVuc) ? cau.linhVuc : null;
      if (cau.quay === null) {
        return [...dongNoiNop(t, null, null, cau.trungTam, linhVuc), linhVuc === null ? t('quay.nhac-neu-linh-vuc') : ''];
      }
      const dong = dongNoiNop(t, cau.quay, cau.noiTiepNhanChuyen, cau.trungTam, linhVuc);
      if (cau.muc === 'can-bo') {
        if (cau.canBo.length === 0) dong.push(t('quay.chua-co-can-bo'));
        else {
          dong.push(t('quay.can-bo-tieu-de'));
          for (const cb of cau.canBo) {
            const ten = coChu(cb.xungHo) ? t('quay.can-bo-ten', { xungHo: cb.xungHo, hoTen: cb.hoTen }) : cb.hoTen;
            dong.push(
              [
                ten,
                coChu(cb.chucVu) ? t('quay.can-bo-chuc-vu', { chucVu: cb.chucVu }) : '',
                cb.quay !== null ? t('quay.can-bo-quay', { quay: cb.quay }) : '',
                cb.moTa ?? '',
              ]
                .filter(coChu)
                .join(' '),
            );
          }
          if (cau.tong > cau.canBo.length) dong.push(t('quay.con-can-bo', { so: cau.tong - cau.canBo.length }));
        }
      }
      return dong;
    }
    case 'khong-hieu':
      return [t('khong-hieu.xin-loi')];
  }
}

function dongMucThuTuc(cau: Extract<CauTraLoi, { loai: 'thu-tuc' }>, t: T): string[] {
  const nd = cau.noiDung;
  switch (cau.muc) {
    case 'thoi-han':
      return [coChu(nd.thoiHan) ? t('thu-tuc.thoi-han', { thoiHan: nd.thoiHan }) : t('thu-tuc.thoi-han-chua-ro')];
    case 'phi':
      return [coChu(nd.phi) ? t('thu-tuc.phi', { phi: nd.phi }) : t('thu-tuc.chua-co.phi')];
    case 'ho-so': {
      const cacGiayTo = nd.thanhPhanHoSo ?? [];
      if (cacGiayTo.length === 0) return [t('thu-tuc.chua-co.ho-so')];
      const dong = cacGiayTo.map((g) => {
        const ban = [
          (g.banChinh ?? 0) > 0 ? t('thu-tuc.so-ban-chinh', { so: g.banChinh }) : '',
          (g.banSao ?? 0) > 0 ? t('thu-tuc.so-ban-sao', { so: g.banSao }) : '',
        ]
          .filter(coChu)
          .join(', ');
        return ban ? `${g.ten} (${ban})` : g.ten;
      });
      const con = nd.tong !== null ? nd.tong - cacGiayTo.length : 0;
      if (con > 0) dong.push(t('thu-tuc.con-giay-to', { so: con }));
      return dong;
    }
    case 'noi-nop': {
      const hinhThuc = (nd.hinhThucNop ?? []).filter(coChu);
      return [
        hinhThuc.length > 0 ? t('thu-tuc.hinh-thuc-nop', { hinhThuc: hinhThuc.join(', ') }) : t('thu-tuc.chua-co.noi-nop'),
        ...dongNoiNop(t, cau.quay, cau.noiTiepNhanChuyen, cau.trungTam, null),
      ];
    }
    case 'trinh-tu': {
      const cacBuoc = (nd.trinhTu ?? []).filter((b) => coChu(b.noiDung) || coChu(b.truongHop));
      if (cacBuoc.length === 0) return [t('thu-tuc.chua-co.trinh-tu')];
      return [
        ...cacBuoc.map((b) => [b.truongHop, b.noiDung].filter(coChu).join(' ')),
        nd.tong !== null && nd.tong > cacBuoc.length ? t('thu-tuc.cat-bot', { so: cacBuoc.length, tong: nd.tong }) : '',
      ];
    }
    case 'ket-qua': {
      const cacKetQua = (nd.ketQua ?? []).filter(coChu);
      if (cacKetQua.length === 0) return [t('thu-tuc.chua-co.ket-qua')];
      return [
        ...cacKetQua,
        nd.tong !== null && nd.tong > cacKetQua.length ? t('thu-tuc.cat-bot', { so: cacKetQua.length, tong: nd.tong }) : '',
      ];
    }
    case 'can-cu': {
      const cacCanCu = (nd.canCu ?? []).filter((c) => coChu(c.soKyHieu) || coChu(c.trichYeu));
      if (cacCanCu.length === 0) return [t('thu-tuc.chua-co.can-cu')];
      return [
        ...cacCanCu.map((c) =>
          coChu(c.soKyHieu) && coChu(c.trichYeu) ? t('thu-tuc.can-cu-noi', { soKyHieu: c.soKyHieu, trichYeu: c.trichYeu }) : (c.soKyHieu ?? c.trichYeu ?? ''),
        ),
        nd.tong !== null && nd.tong > cacCanCu.length ? t('thu-tuc.cat-bot', { so: cacCanCu.length, tong: nd.tong }) : '',
      ];
    }
  }
}

function dongTrungTam(cau: Extract<CauTraLoi, { loai: 'trung-tam' }>, t: T, luc: number): string[] {
  const tt = cau.thongTin;
  const chuaCo = [t('trung-tam.chua-co', { muc: t(`trung-tam.ten-muc.${cau.muc}`) }), t('trung-tam.goi-hoi-truc-tiep')];
  if (!tt.coDuLieu) return chuaCo;

  switch (cau.muc) {
    case 'dia-chi':
      return coChu(tt.diaChi) ? [`${t('trung-tam.dia-chi')} ${tt.diaChi}`] : chuaCo;
    case 'gio-lam-viec': {
      const gio = tt.gioLamViec ?? [];
      const nhom = gopNgay(gio);
      if (nhom.length === 0) return chuaCo;
      const tenThu = (thu: number) => t(`trung-tam.thu.${thu as Thu}`);
      const buoi = (nhan: string, khung: Khung | null) => (khung ? `${nhan} ${t('trung-tam.khoang', { tu: khung.tu, den: khung.den })}` : '');
      return [
        t('trung-tam.gio-lam-viec'),
        ...nhom.map((n) =>
          [
            n.tuThu === n.denThu ? tenThu(n.tuThu) : t('trung-tam.khoang-ngay', { tu: tenThu(n.tuThu), den: tenThu(n.denThu) }),
            buoi(t('trung-tam.sang'), n.sang),
            buoi(t('trung-tam.chieu'), n.chieu),
          ]
            .filter(coChu)
            .join(', '),
        ),
        tt.ghiChuNgayNghi ?? '',
        dangLamViec(gio, new Date(luc)) ? t('trung-tam.dang-mo') : t('trung-tam.ngoai-gio'),
      ];
    }
    case 'dien-thoai':
      return coChu(tt.dienThoai) ? [`${t('trung-tam.dien-thoai')} ${tt.dienThoai}`] : chuaCo;
    case 'email':
      return coChu(tt.email) ? [`${t('trung-tam.email')} ${tt.email}`] : chuaCo;
    case 'nop-truc-tuyen':
      return tt.lienKet ? [`${t('trung-tam.nop-truc-tuyen')} ${tt.lienKet.ten}`] : chuaCo;
  }
}
