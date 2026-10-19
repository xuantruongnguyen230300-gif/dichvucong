import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { linkDvc } from '../thu-tuc/linkDvc';
import type { CauTraLoi, ThuTucNgan } from './api/troLy';
import { CauTraLoiView } from './CauTraLoiView';
import { napNgonNguTroLy } from './i18n';
import {
  DAP_AN_DANH_SACH,
  DAP_AN_HO_SO,
  DAP_AN_KHONG_HIEU,
  THU_TUC_KET_HON,
  THU_TUC_KHAI_SINH,
  THU_TUC_KHAI_SINH_LAI,
  TRUNG_TAM_NGAN,
  dapAnThuTuc,
  dungKhungTrongRouter,
} from '../../test-utils/troLyMau';
import { MoThuTucContext } from './view/moThuTucContext';

beforeAll(() => napNgonNguTroLy());

// 10:00 thứ Hai 12/10/2026 giờ Việt Nam = 03:00 UTC; 12:00 cùng ngày = 05:00 UTC
const MUOI_GIO_THU_HAI = Date.UTC(2026, 9, 12, 3, 0);
const MUOI_HAI_GIO_THU_HAI = Date.UTC(2026, 9, 12, 5, 0);
const GIO_THU = [
  { thu: 1, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 2, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 3, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 4, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 5, sangTu: '07:30', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' },
  { thu: 6, sangTu: '07:30', sangDen: '11:30', chieuTu: null, chieuDen: null },
];

function ve(cau: CauTraLoi, luc = MUOI_GIO_THU_HAI, mo: (ma: string) => void = () => undefined) {
  return dungKhungTrongRouter(
    <MoThuTucContext value={mo}>
      <CauTraLoiView cau={cau} luc={luc} />
    </MoThuTucContext>,
  );
}

const trungTam = (muc: Extract<CauTraLoi, { loai: 'trung-tam' }>['muc'], thongTin: Partial<Extract<CauTraLoi, { loai: 'trung-tam' }>['thongTin']>, lienHe: Extract<CauTraLoi, { loai: 'trung-tam' }>['lienHe'] = null): CauTraLoi => ({
  loai: 'trung-tam',
  thuTucDangNoi: null,
  muc,
  thongTin: { coDuLieu: true, diaChi: null, banDo: null, gioLamViec: null, ghiChuNgayNghi: null, dienThoai: null, email: null, lienKet: null, ...thongTin },
  lienHe,
});

const nhieuThuTuc = (n: number): ThuTucNgan[] =>
  Array.from({ length: n }, (_, i) => ({ ...THU_TUC_KHAI_SINH, ma: `1.${String(i).padStart(6, '0')}`, ten: `Thủ tục số ${i}` }));

describe('thu-tuc — bảy mục', () => {
  it('thời hạn: có giá trị; null thì "chưa ghi rõ"', () => {
    const { unmount } = ve(dapAnThuTuc('thoi-han', { thoiHan: '5 ngày làm việc' }));
    expect(screen.getByText('Thời hạn giải quyết: 5 ngày làm việc')).toBeInTheDocument();
    unmount();
    ve(dapAnThuTuc('thoi-han'));
    expect(screen.getByText(/Chưa ghi rõ thời hạn giải quyết/)).toBeInTheDocument();
  });

  it('hồ sơ: bản chính/bản sao và "và n giấy tờ nữa"', () => {
    ve(
      dapAnThuTuc('ho-so', {
        thanhPhanHoSo: [
          { ten: 'Tờ khai', banChinh: 1, banSao: 2 },
          { ten: 'Giấy chứng sinh', banChinh: null, banSao: null },
        ],
        tong: 7,
      }),
    );
    expect(screen.getByText('Tờ khai')).toBeInTheDocument();
    expect(screen.getByText('(1 bản chính, 2 bản sao)')).toBeInTheDocument();
    expect(screen.getByText('và 5 giấy tờ nữa — xem chi tiết')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('hồ sơ không bị cắt thì không có dòng "và n giấy tờ nữa"', () => {
    ve(dapAnThuTuc('ho-so', { thanhPhanHoSo: [{ ten: 'Tờ khai', banChinh: null, banSao: null }] }));
    expect(screen.queryByText(/giấy tờ nữa/)).not.toBeInTheDocument();
  });

  it('phí: có và không', () => {
    const { unmount } = ve(dapAnThuTuc('phi', { phi: 'Lệ phí: 0 VNĐ' }));
    expect(screen.getByText('Phí, lệ phí: Lệ phí: 0 VNĐ')).toBeInTheDocument();
    unmount();
    ve(dapAnThuTuc('phi'));
    expect(screen.getByText('Chưa có thông tin về phí, lệ phí.')).toBeInTheDocument();
  });

  it('nơi nộp có quầy (BR-3): nêu quầy và nơi tiếp nhận chuyển', () => {
    ve(
      dapAnThuTuc('noi-nop', { hinhThucNop: ['Trực tuyến', 'Trực tiếp'] }, { quay: 3, noiTiepNhanChuyen: 'Phòng Tư pháp', trungTam: TRUNG_TAM_NGAN }),
    );
    expect(screen.getByText('Hình thức nộp: Trực tuyến, Trực tiếp')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ nộp tại quầy 3.')).toBeInTheDocument();
    expect(screen.getByText('Nơi tiếp nhận chuyển: Phòng Tư pháp')).toBeInTheDocument();
  });

  it('nơi nộp không có quầy (BR-3): không có chữ "quầy" nào, có "nộp tại <Trung tâm>, địa chỉ …"', () => {
    const { container } = ve(dapAnThuTuc('noi-nop', { hinhThucNop: ['Trực tiếp'] }, { trungTam: TRUNG_TAM_NGAN }));
    expect(screen.getByText('Hồ sơ nộp tại Trung tâm thử A, địa chỉ Địa chỉ thử A.')).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain('quầy');
  });

  it('nơi nộp không có quầy, không có Trung tâm: "nộp tại Trung tâm", vẫn không có "quầy"', () => {
    const { container } = ve(dapAnThuTuc('noi-nop'));
    expect(screen.getByText('Hồ sơ nộp tại Trung tâm.')).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain('quầy');
  });

  it('trình tự, kết quả, căn cứ: chữ thuần giữ xuống dòng, "Hiển thị n/tổng" khi bị cắt', () => {
    const { unmount } = ve(
      dapAnThuTuc('trinh-tu', { trinhTu: [{ truongHop: 'Nộp trực tiếp', noiDung: 'Bước 1.\nBước 2.' }], tong: 4 }),
    );
    expect(screen.getByText('Nộp trực tiếp')).toBeInTheDocument();
    expect(screen.getByText((_, e) => e?.textContent === 'Bước 1.\nBước 2.' && e.tagName === 'SPAN')).toBeInTheDocument();
    expect(screen.getByText('Hiển thị 1/4 — xem đầy đủ trong chi tiết thủ tục.')).toBeInTheDocument();
    unmount();

    const lan2 = ve(dapAnThuTuc('ket-qua', { ketQua: ['Giấy khai sinh'] }));
    expect(screen.getByText('Giấy khai sinh')).toBeInTheDocument();
    lan2.unmount();

    ve(
      dapAnThuTuc('can-cu', {
        canCu: [
          { soKyHieu: 'Luật số 60/2014/QH13', trichYeu: 'Luật Hộ tịch' },
          { soKyHieu: null, trichYeu: 'Thông tư hướng dẫn' },
        ],
      }),
    );
    expect(screen.getByText('Luật số 60/2014/QH13 – Luật Hộ tịch')).toBeInTheDocument();
    expect(screen.getByText('Thông tư hướng dẫn')).toBeInTheDocument();
  });

  it('mục rỗng: câu "chưa có thông tin" theo từng mục', () => {
    const { unmount } = ve(dapAnThuTuc('trinh-tu'));
    expect(screen.getByText('Chưa có thông tin về trình tự thực hiện.')).toBeInTheDocument();
    unmount();
    const lan2 = ve(dapAnThuTuc('ket-qua'));
    expect(screen.getByText('Chưa có thông tin về kết quả.')).toBeInTheDocument();
    lan2.unmount();
    ve(dapAnThuTuc('can-cu'));
    expect(screen.getByText('Chưa có thông tin về căn cứ pháp lý.')).toBeInTheDocument();
  });

  it('thủ tục khác: dòng nhắc và mỗi thủ tục một cặp nút', () => {
    ve(DAP_AN_HO_SO);
    expect(screen.getByText('Nếu không đúng thủ tục, chọn lại bên dưới:')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Xem chi tiết/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /^Xem và nộp trên Cổng DVC/ })).toHaveLength(2);
  });

  it('tên thủ tục dài hơn 90 ký tự bị cắt ở dòng đầu', () => {
    ve(dapAnThuTuc('phi', {}, { thuTuc: { ...THU_TUC_KHAI_SINH, ten: 'x'.repeat(200) } }));
    const dongDau = screen.getByText(/^1\.001193 – x+…$/);
    expect(dongDau.textContent).toHaveLength('1.001193 – '.length + 90 + 1);
  });
});

describe('cặp nút của thủ tục (BR-6)', () => {
  it('"Xem chi tiết" gọi hàm mở popup với đúng mã; tên đọc kèm tên thủ tục', async () => {
    const mo = vi.fn();
    ve(DAP_AN_DANH_SACH, MUOI_GIO_THU_HAI, mo);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Xem chi tiết Thủ tục đăng ký kết hôn' }));
    expect(mo).toHaveBeenCalledExactlyOnceWith(THU_TUC_KET_HON.ma);
  });

  it('liên kết Cổng DVC trùng linkDvc(ma), mở tab mới, rel có noopener noreferrer', () => {
    ve(DAP_AN_DANH_SACH);
    const lienKet = screen.getByRole('link', { name: /Xem và nộp trên Cổng DVC.*Thủ tục đăng ký kết hôn/ });
    expect(lienKet).toHaveAttribute('href', linkDvc(THU_TUC_KET_HON.ma));
    expect(lienKet).toHaveAttribute('target', '_blank');
    expect(lienKet.getAttribute('rel')).toContain('noopener');
    expect(lienKet.getAttribute('rel')).toContain('noreferrer');
    expect(screen.getByRole('link', { name: /đăng ký lại khai sinh/ })).toHaveAttribute('href', linkDvc(THU_TUC_KHAI_SINH_LAI.ma));
  });
});

describe('thu-tuc-danh-sach và chu-de', () => {
  it('danh sách: số thủ tục, mã · cấp · lĩnh vực, mức độ', () => {
    ve(DAP_AN_DANH_SACH);
    expect(screen.getByText('Tìm thấy 2 thủ tục liên quan, sát nhất ở trên cùng:')).toBeInTheDocument();
    expect(screen.getByText('1.000894 · Cấp xã · Hộ tịch')).toBeInTheDocument();
    expect(screen.getByText('1.004884 · Cấp xã, Cấp tỉnh · Hộ tịch')).toBeInTheDocument();
    expect(screen.getByText('Một phần')).toBeInTheDocument();
    expect(screen.getByText('Toàn trình')).toBeInTheDocument();
  });

  it('chủ đề 10 trong 15: ghi tổng 15, hiện 10 thủ tục, gợi ý gõ tên', () => {
    ve({
      loai: 'chu-de',
      thuTucDangNoi: null,
      chuDe: { tenHienThi: 'Xây dựng', linhVuc: 'Hoạt động xây dựng' },
      tong: 15,
      danhSachThuTuc: nhieuThuTuc(10),
      quay: null,
      noiTiepNhanChuyen: null,
      trungTam: TRUNG_TAM_NGAN,
    });
    expect(screen.getByText('Lĩnh vực Hoạt động xây dựng có 15 thủ tục:')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Xem chi tiết/ })).toHaveLength(10);
    expect(screen.getByText('Hiển thị 10/15 thủ tục')).toBeInTheDocument();
    expect(screen.getByText(/Hồ sơ lĩnh vực Hoạt động xây dựng nộp tại Trung tâm thử A/)).toBeInTheDocument();
    expect(screen.getByText('Gõ tên thủ tục để hỏi thêm.')).toBeInTheDocument();
  });

  it('chủ đề tổng 0: "Chưa có thủ tục nào thuộc lĩnh vực này.", không nút nào', () => {
    ve({
      loai: 'chu-de',
      thuTucDangNoi: null,
      chuDe: { tenHienThi: 'Chăn nuôi', linhVuc: 'Chăn nuôi' },
      tong: 0,
      danhSachThuTuc: [],
      quay: null,
      noiTiepNhanChuyen: null,
      trungTam: null,
    });
    expect(screen.getByText('Chưa có thủ tục nào thuộc lĩnh vực này.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('chủ đề có quầy: nêu quầy; không có: không chữ "quầy"', () => {
    const co = ve({
      loai: 'chu-de',
      thuTucDangNoi: null,
      chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' },
      tong: 1,
      danhSachThuTuc: [THU_TUC_KHAI_SINH],
      quay: 3,
      noiTiepNhanChuyen: null,
      trungTam: null,
    });
    expect(screen.getByText('Hồ sơ lĩnh vực Hộ tịch nộp tại quầy 3.')).toBeInTheDocument();
    co.unmount();
    const khong = ve({
      loai: 'chu-de',
      thuTucDangNoi: null,
      chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' },
      tong: 1,
      danhSachThuTuc: [THU_TUC_KHAI_SINH],
      quay: null,
      noiTiepNhanChuyen: null,
      trungTam: null,
    });
    expect(khong.container.textContent?.toLowerCase()).not.toContain('quầy');
  });
});

describe('cau-hoi-mau', () => {
  it('chữ thuần: HTML hiện nguyên văn, xuống dòng giữ nguyên; thủ tục liên quan có cặp nút', () => {
    const { container } = ve({
      loai: 'cau-hoi-mau',
      thuTucDangNoi: null,
      traLoi: 'Dòng một <b>đậm</b>\nDòng hai',
      danhSachThuTuc: [THU_TUC_KHAI_SINH],
    });
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText((_, e) => e?.tagName === 'P' && e.textContent === 'Dòng một <b>đậm</b>\nDòng hai')).toBeInTheDocument();
    expect(screen.getByText('Thủ tục liên quan:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Xem chi tiết/ })).toBeInTheDocument();
  });

  it('không có thủ tục liên quan: chỉ có câu trả lời', () => {
    ve({ loai: 'cau-hoi-mau', thuTucDangNoi: null, traLoi: 'Câu mẫu', danhSachThuTuc: [] });
    expect(screen.getByText('Câu mẫu')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('tên thủ tục có HTML hiện nguyên văn, không thành phần tử', () => {
    const { container } = ve({
      loai: 'thu-tuc-danh-sach',
      thuTucDangNoi: null,
      danhSachThuTuc: [{ ...THU_TUC_KHAI_SINH, ten: '<img src=x onerror=alert(1)>' }],
    });
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });
});

describe('trung-tam', () => {
  it('địa chỉ: có bản đồ thì có liên kết mở tab mới; không có thì chỉ địa chỉ', () => {
    const co = ve(trungTam('dia-chi', { diaChi: 'Địa chỉ thử A', banDo: 'https://maps.example.gov.vn/thu' }));
    expect(screen.getByText('Địa chỉ thử A')).toBeInTheDocument();
    const banDo = screen.getByRole('link', { name: /Xem bản đồ/ });
    expect(banDo).toHaveAttribute('href', 'https://maps.example.gov.vn/thu');
    expect(banDo).toHaveAttribute('target', '_blank');
    co.unmount();
    ve(trungTam('dia-chi', { diaChi: 'Địa chỉ thử B', banDo: null }));
    expect(screen.getByText('Địa chỉ thử B')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('điện thoại bấm được bằng tel:, email bằng mailto:', () => {
    const dt = ve(trungTam('dien-thoai', { dienThoai: '02723 893 900' }));
    expect(screen.getByRole('link', { name: '02723 893 900' })).toHaveAttribute('href', 'tel:02723893900');
    dt.unmount();
    ve(trungTam('email', { email: 'thu@example.gov.vn' }));
    expect(screen.getByRole('link', { name: 'thu@example.gov.vn' })).toHaveAttribute('href', 'mailto:thu@example.gov.vn');
  });

  it('nộp trực tuyến: liên kết đúng địa chỉ trong dữ liệu, mở tab mới', () => {
    ve(trungTam('nop-truc-tuyen', { lienKet: { ten: 'Cổng Dịch vụ công Quốc gia', url: 'https://dichvucong.gov.vn' } }));
    const lienKet = screen.getByRole('link', { name: /Cổng Dịch vụ công Quốc gia/ });
    expect(lienKet).toHaveAttribute('href', 'https://dichvucong.gov.vn/');
    expect(lienKet).toHaveAttribute('target', '_blank');
  });

  it('giờ làm việc 10:00 thứ Hai: các ngày gộp, "Đang trong giờ làm việc"', () => {
    ve(trungTam('gio-lam-viec', { gioLamViec: GIO_THU, ghiChuNgayNghi: 'Nghỉ lễ theo quy định' }), MUOI_GIO_THU_HAI);
    expect(screen.getByText('Thứ Hai – Thứ Sáu')).toBeInTheDocument();
    expect(screen.getByText('Thứ Bảy')).toBeInTheDocument();
    expect(screen.getAllByText('Buổi sáng 07:30 – 11:30')).toHaveLength(2);
    expect(screen.getAllByText('Buổi chiều 13:30 – 17:00')).toHaveLength(1);
    expect(screen.getByText('Nghỉ lễ theo quy định')).toBeInTheDocument();
    expect(screen.getByText('Đang trong giờ làm việc')).toBeInTheDocument();
    expect(screen.queryByText('Ngoài giờ làm việc')).not.toBeInTheDocument();
  });

  it('12:00 thứ Hai: "Ngoài giờ làm việc"; hai đáp án hỏi ở hai thời điểm giữ trạng thái riêng', () => {
    const cau = trungTam('gio-lam-viec', { gioLamViec: GIO_THU });
    dungKhungTrongRouter(
      <>
        <div data-testid="luc-10">
          <CauTraLoiView cau={cau} luc={MUOI_GIO_THU_HAI} />
        </div>
        <div data-testid="luc-12">
          <CauTraLoiView cau={cau} luc={MUOI_HAI_GIO_THU_HAI} />
        </div>
      </>,
    );
    expect(within(screen.getByTestId('luc-10')).getByText('Đang trong giờ làm việc')).toBeInTheDocument();
    expect(within(screen.getByTestId('luc-12')).getByText('Ngoài giờ làm việc')).toBeInTheDocument();
    expect(within(screen.getByTestId('luc-12')).queryByText('Đang trong giờ làm việc')).not.toBeInTheDocument();
  });

  it('chưa có dữ liệu (coDuLieu = false): "chưa có thông tin" + nút gọi, không có giờ hay địa chỉ đoán', () => {
    const { container } = ve(
      trungTam('gio-lam-viec', { coDuLieu: false }, { dienThoai: '02723 893 900', zaloOa: null }),
    );
    expect(screen.getByText('Chưa có thông tin về giờ làm việc.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', 'tel:02723893900');
    expect(screen.queryByRole('link', { name: 'Mở Zalo' })).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Buổi sáng|Đang trong giờ|Ngoài giờ/);
  });

  it('dữ liệu thiếu thật dù coDuLieu = true: rơi về "chưa có thông tin", không để chỗ trống', () => {
    ve(trungTam('dia-chi', { diaChi: '  ' }, { dienThoai: '02723 893 900', zaloOa: null }));
    expect(screen.getByText('Chưa có thông tin về địa chỉ Trung tâm.')).toBeInTheDocument();
  });
});

describe('quay', () => {
  const cauQuay = (rieng: Partial<Extract<CauTraLoi, { loai: 'quay' }>>): CauTraLoi => ({
    loai: 'quay',
    thuTucDangNoi: null,
    muc: 'quay',
    linhVuc: null,
    quay: null,
    noiTiepNhanChuyen: null,
    canBo: [],
    tong: 0,
    trungTam: TRUNG_TAM_NGAN,
    ...rieng,
  });

  it('có quầy: "Hồ sơ lĩnh vực X nộp tại quầy N"', () => {
    ve(cauQuay({ linhVuc: 'Hộ tịch', quay: 3 }));
    expect(screen.getByText('Hồ sơ lĩnh vực Hộ tịch nộp tại quầy 3.')).toBeInTheDocument();
  });

  it('cán bộ phụ trách: tên, chức vụ, quầy, mô tả; "và n cán bộ nữa" khi bị cắt', () => {
    ve(
      cauQuay({
        muc: 'can-bo',
        linhVuc: 'Đất đai',
        quay: 4,
        tong: 12,
        canBo: [{ hoTen: 'Nguyễn Văn A', xungHo: 'Ông', chucVu: 'Chuyên viên', quay: 4, moTa: 'Phụ trách đất đai' }],
      }),
    );
    expect(screen.getByText('Cán bộ phụ trách:')).toBeInTheDocument();
    expect(screen.getByText('Ông Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText(/\(Chuyên viên\)/)).toBeInTheDocument();
    expect(screen.getByText('Phụ trách đất đai')).toBeInTheDocument();
    expect(screen.getByText('và 11 cán bộ nữa')).toBeInTheDocument();
  });

  it('có quầy nhưng chưa có nhân sự: nêu quầy, không có tên cán bộ nào (AC-32)', () => {
    ve(cauQuay({ muc: 'can-bo', linhVuc: 'Đất đai', quay: 4 }));
    expect(screen.getByText('Hồ sơ lĩnh vực Đất đai nộp tại quầy 4.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('không có quầy (BR-3): chỉ "nộp tại Trung tâm", không chữ "quầy", không tên — kể cả khi máy chủ gửi nhầm danh sách cán bộ', () => {
    const { container } = ve(
      cauQuay({ muc: 'can-bo', linhVuc: 'Hộ tịch', quay: null, canBo: [{ hoTen: 'Không được hiện', xungHo: null, chucVu: null, quay: 1, moTa: null }], tong: 1 }),
    );
    expect(screen.getByText('Hồ sơ lĩnh vực Hộ tịch nộp tại Trung tâm thử A, địa chỉ Địa chỉ thử A.')).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain('quầy');
    expect(container.textContent).not.toContain('Không được hiện');
  });

  it('hỏi quầy mà chưa nêu lĩnh vực: "nộp tại Trung tâm" kèm nhắc nêu lĩnh vực hoặc tên thủ tục (AC-33)', () => {
    const { container } = ve(cauQuay({ trungTam: null }));
    expect(screen.getByText('Hồ sơ nộp tại Trung tâm.')).toBeInTheDocument();
    expect(screen.getByText('Bạn cho biết lĩnh vực hoặc tên thủ tục để được hướng dẫn cụ thể hơn.')).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain('quầy');
  });
});

describe('khong-hieu', () => {
  it('câu xin lỗi + nút gọi; không có Zalo khi zaloOa null (AC-23)', () => {
    ve(DAP_AN_KHONG_HIEU);
    expect(screen.getByText(/Xin lỗi, tôi chưa có câu trả lời/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gọi Trung tâm' })).toHaveAttribute('href', 'tel:02723893900');
    expect(screen.queryByRole('link', { name: /Zalo/ })).not.toBeInTheDocument();
  });

  it('có Zalo OA: thêm nút mở Zalo, tab mới, đúng link', () => {
    ve({ loai: 'khong-hieu', thuTucDangNoi: null, lienHe: { dienThoai: '02723 893 900', zaloOa: 'https://zalo.me/thu' } });
    const zalo = screen.getByRole('link', { name: /Mở Zalo/ });
    expect(zalo).toHaveAttribute('href', 'https://zalo.me/thu');
    expect(zalo).toHaveAttribute('target', '_blank');
    expect(zalo.getAttribute('rel')).toContain('noopener');
  });

  it('không có thông tin liên hệ: chỉ câu xin lỗi, không nút nào', () => {
    ve({ loai: 'khong-hieu', thuTucDangNoi: null, lienHe: null });
    expect(screen.getByText(/Xin lỗi/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
