import { beforeAll, describe, expect, it } from 'vitest';
import { i18n } from '../../core/i18n';
import type { CauTraLoi } from './api/troLy';
import { napNgonNguTroLy } from './i18n';
import { DAP_AN_DANH_SACH, DAP_AN_HO_SO, DAP_AN_KHONG_HIEU, THU_TUC_KHAI_SINH, TRUNG_TAM_NGAN, dapAnThuTuc } from '../../test-utils/troLyMau';
import { vanBanDoc } from './vanBanDoc';

beforeAll(() => napNgonNguTroLy());
const t = i18n.getFixedT('vi', 'chatbot');
const MUOI_GIO = Date.UTC(2026, 9, 12, 3, 0);

describe('vanBanDoc', () => {
  it('thủ tục: dòng đầu, nội dung mục, thủ tục khác; không nhãn nút', () => {
    const vb = vanBanDoc(DAP_AN_HO_SO, t);
    expect(vb.split('\n')).toEqual([
      '1.001193 – Thủ tục đăng ký khai sinh',
      '- Tờ khai đăng ký khai sinh theo mẫu (1 bản chính)',
      'và 6 giấy tờ nữa — xem chi tiết',
      'Nếu không đúng thủ tục, chọn lại bên dưới:',
      'Thủ tục đăng ký lại khai sinh',
    ]);
  });

  it('danh sách thủ tục', () => {
    expect(vanBanDoc(DAP_AN_DANH_SACH, t).split('\n')).toEqual([
      'Tìm thấy 2 thủ tục liên quan, sát nhất ở trên cùng:',
      'Thủ tục đăng ký kết hôn',
      'Thủ tục đăng ký lại khai sinh',
    ]);
  });

  it('không hiểu: chỉ câu xin lỗi, không nhãn nút gọi/Zalo', () => {
    const vb = vanBanDoc(DAP_AN_KHONG_HIEU, t);
    expect(vb).toMatch(/^Xin lỗi, tôi chưa có câu trả lời/);
    expect(vb).not.toMatch(/Gọi Trung tâm|Mở Zalo/);
  });

  it('thời hạn null: "chưa ghi rõ"', () => {
    expect(vanBanDoc(dapAnThuTuc('thoi-han'), t)).toContain('Chưa ghi rõ thời hạn giải quyết');
  });

  it('quầy: không có quầy thì không có chữ "quầy" và không tên cán bộ (BR-3)', () => {
    const cau: CauTraLoi = {
      loai: 'quay',
      thuTucDangNoi: null,
      muc: 'can-bo',
      linhVuc: 'Hộ tịch',
      quay: null,
      noiTiepNhanChuyen: null,
      canBo: [{ hoTen: 'Không được đọc', xungHo: null, chucVu: null, quay: 1, moTa: null }],
      tong: 1,
      trungTam: TRUNG_TAM_NGAN,
    };
    const vb = vanBanDoc(cau, t);
    expect(vb.toLowerCase()).not.toContain('quầy');
    expect(vb).not.toContain('Không được đọc');
  });

  it('giờ làm việc: trạng thái tính theo lúc đáp án đến', () => {
    const cau: CauTraLoi = {
      loai: 'trung-tam',
      thuTucDangNoi: null,
      muc: 'gio-lam-viec',
      lienHe: null,
      thongTin: {
        coDuLieu: true,
        diaChi: null,
        banDo: null,
        ghiChuNgayNghi: null,
        dienThoai: null,
        email: null,
        lienKet: null,
        gioLamViec: [{ thu: 1, sangTu: '07:30', sangDen: '11:30', chieuTu: null, chieuDen: null }],
      },
    };
    expect(vanBanDoc(cau, t, MUOI_GIO).split('\n')).toEqual([
      'Giờ làm việc của Trung tâm:',
      'Thứ Hai, Buổi sáng 07:30 – 11:30',
      'Đang trong giờ làm việc',
    ]);
    expect(vanBanDoc(cau, t, Date.UTC(2026, 9, 12, 5, 0))).toContain('Ngoài giờ làm việc');
  });

  it('chủ đề tổng 0', () => {
    const cau: CauTraLoi = {
      loai: 'chu-de',
      thuTucDangNoi: null,
      chuDe: { tenHienThi: 'Chăn nuôi', linhVuc: 'Chăn nuôi' },
      tong: 0,
      danhSachThuTuc: [],
      quay: null,
      noiTiepNhanChuyen: null,
      trungTam: null,
    };
    expect(vanBanDoc(cau, t)).toBe('Chưa có thủ tục nào thuộc lĩnh vực này.');
  });

  it('dữ liệu có HTML giữ nguyên văn (chữ thuần)', () => {
    const cau = dapAnThuTuc('phi', { phi: '<b>0</b> đồng' }, { thuTuc: { ...THU_TUC_KHAI_SINH, ten: 'A' } });
    expect(vanBanDoc(cau, t)).toContain('<b>0</b> đồng');
  });
});
