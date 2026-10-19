import type { ThongTinTrungTam } from '../core/api/trungTam';

/** Dữ liệu thử (không phải dữ liệu thật của Cần Giuộc): tên có chữ "phường", "tỉnh" để kiểm trang không tự ghép chữ. */
export const TRUNG_TAM_THU: ThongTinTrungTam = {
  ten: 'Trung tâm thử A',
  xa: 'phường thử B',
  tinh: 'tỉnh thử C',
  coQuanChuQuan: 'Cơ quan thử D',
  nguoiChiuTrachNhiem: 'Người thử',
  chucVuNguoiChiuTrachNhiem: 'Giám đốc (dữ liệu thử)',
  diaChi: 'Địa chỉ thử',
  dienThoai: '0000.000.000',
  email: 'thu@example.gov.vn',
  banDo: 'https://maps.example.gov.vn/thu',
  mangXaHoi: { zaloOa: 'https://zalo.example.gov.vn/thu', facebook: null, youTube: null, tikTok: null },
  lienKet: [{ ten: 'Cổng Dịch vụ công Quốc gia', url: 'https://dichvucong.gov.vn' }],
  oDichVu: [{ ten: 'Đánh giá hài lòng', bieuTuong: 'danh-gia', url: null }],
  gioLamViec: [{ thu: 1, sangTu: '07:00', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' }],
  ghiChuNgayNghi: null,
  ngayCapNhatThuTuc: '2026-10-08',
};

/** Chỉ giữ 5 mục bắt buộc: mọi mục không bắt buộc để trống. */
export const TRUNG_TAM_TOI_THIEU: ThongTinTrungTam = {
  ...TRUNG_TAM_THU,
  xa: null,
  tinh: null,
  coQuanChuQuan: null,
  chucVuNguoiChiuTrachNhiem: null,
  banDo: null,
  mangXaHoi: { zaloOa: null, facebook: null, youTube: null, tikTok: null },
  lienKet: [],
  oDichVu: [],
  gioLamViec: [],
  ngayCapNhatThuTuc: null,
};
