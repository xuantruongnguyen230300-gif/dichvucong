import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RouteObject } from 'react-router';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { renderApp, type PhanHoiTrungTam } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU, TRUNG_TAM_TOI_THIEU } from '../../test-utils/trungTamMau';
import { AppFooter } from './AppFooter';

afterEach(() => vi.unstubAllGlobals());

const MIEN_TRU =
  'Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia.';

const tuyen: RouteObject[] = [{ path: '*', element: <AppFooter /> }];
const dungFooter = (trungTam: PhanHoiTrungTam) => renderApp(tuyen, { trungTam });
/** Chờ dữ liệu về (dòng bản quyền chỉ có khi đã có dữ liệu) rồi trả chân trang. */
const chanDaTai = async () => {
  await screen.findByText(/^©/);
  return screen.getByRole('contentinfo');
};
const voi = (thayDoi: Partial<ThongTinTrungTam>): ThongTinTrungTam => ({ ...TRUNG_TAM_THU, ...thayDoi });

describe('AppFooter — 5 mục bắt buộc (BR-3, AC-5)', () => {
  it('có tên đơn vị, người chịu trách nhiệm, địa chỉ, điện thoại bấm gọi được, email', async () => {
    dungFooter(TRUNG_TAM_THU);
    const chan = await chanDaTai();
    expect(within(chan).getByRole('heading', { level: 2, name: 'Trung tâm thử A' })).toBeInTheDocument();
    expect(within(chan).getByText('Cơ quan chủ quản: Cơ quan thử D')).toBeInTheDocument();
    expect(
      within(chan).getByText('Người chịu trách nhiệm nội dung: Người thử – Giám đốc (dữ liệu thử)'),
    ).toBeInTheDocument();
    expect(within(chan).getByText('Địa chỉ thử')).toBeInTheDocument();
    expect(within(chan).getByRole('link', { name: '0000.000.000' })).toHaveAttribute('href', 'tel:0000000000');
    expect(within(chan).getByRole('link', { name: 'thu@example.gov.vn' })).toHaveAttribute('href', 'mailto:thu@example.gov.vn');
  });

  it('chỉ có 5 mục bắt buộc: không có mục nào khác, không có dấu "–" thừa', async () => {
    dungFooter(TRUNG_TAM_TOI_THIEU);
    const chan = await chanDaTai();
    await within(chan).findByText('Người chịu trách nhiệm nội dung: Người thử'); // chức vụ trống: bỏ cả "– …"
    expect(chan.textContent).not.toContain('–');
    expect(within(chan).queryByText(/Cơ quan chủ quản/)).not.toBeInTheDocument();
    expect(within(chan).queryByText('Xem bản đồ')).not.toBeInTheDocument();
    expect(within(chan).queryByRole('heading', { name: 'Liên kết hữu ích' })).not.toBeInTheDocument();
    expect(within(chan).queryByRole('heading', { name: 'Mạng xã hội' })).not.toBeInTheDocument();
    expect(within(chan).queryByText(/Dữ liệu thủ tục cập nhật/)).not.toBeInTheDocument();
    expect(within(chan).getByRole('heading', { name: 'Địa chỉ và liên hệ' })).toBeInTheDocument();
  });

  it('chức vụ trống thì không có "–", có chức vụ thì có', async () => {
    dungFooter(voi({ chucVuNguoiChiuTrachNhiem: '   ' }));
    expect(await screen.findByText('Người chịu trách nhiệm nội dung: Người thử')).toBeInTheDocument();
  });
});

describe('AppFooter — mục không bắt buộc', () => {
  it('mạng xã hội: chỉ hiện kênh có link; không kênh nào thì ẩn cả tiêu đề', async () => {
    dungFooter(TRUNG_TAM_THU); // chỉ có Zalo OA
    const chan = await chanDaTai();
    const khoi = within(chan).getByRole('region', { name: 'Mạng xã hội' });
    expect(within(khoi).getAllByRole('link')).toHaveLength(1);
    expect(within(khoi).getByRole('link', { name: /Zalo OA/ })).toBeInTheDocument();
    expect(within(chan).queryByText('Facebook')).not.toBeInTheDocument();
  });

  it('liên kết hữu ích theo thứ tự dữ liệu, mở tab mới an toàn (AC-15)', async () => {
    dungFooter(
      voi({
        lienKet: [
          { ten: 'Cổng thứ nhất', url: 'https://mot.example.gov.vn' },
          { ten: 'Cổng thứ hai', url: 'https://hai.example.gov.vn' },
        ],
      }),
    );
    const chan = await chanDaTai();
    const khoi = within(chan).getByRole('region', { name: 'Liên kết hữu ích' });
    const lienKet = within(khoi).getAllByRole('link');
    expect(lienKet.map((a) => a.getAttribute('href'))).toEqual(['https://mot.example.gov.vn/', 'https://hai.example.gov.vn/']);
    for (const a of lienKet) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('bản đồ có link thì hiện "Xem bản đồ" mở tab mới (AC-16)', async () => {
    dungFooter(TRUNG_TAM_THU);
    const lienKet = await screen.findByRole('link', { name: /Xem bản đồ/ });
    expect(lienKet).toHaveAttribute('href', 'https://maps.example.gov.vn/thu');
    expect(lienKet).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('link sai định dạng (javascript:) chỉ hiện như chữ thường', async () => {
    dungFooter(
      voi({
        banDo: 'javascript:alert(1)',
        lienKet: [{ ten: 'Liên kết xấu', url: 'javascript:alert(1)' }],
      }),
    );
    const chan = await chanDaTai();
    expect(await within(chan).findByText('Liên kết xấu')).toBeInTheDocument();
    expect(within(chan).queryByRole('link', { name: /Liên kết xấu/ })).not.toBeInTheDocument();
    expect(within(chan).getByText('Xem bản đồ')).toBeInTheDocument();
    expect(within(chan).queryByRole('link', { name: /Xem bản đồ/ })).not.toBeInTheDocument();
  });

  it('không có dòng nhắc đăng xuất (F09 BR-4)', async () => {
    dungFooter(TRUNG_TAM_THU);
    const chan = await chanDaTai();
    await within(chan).findByText('Địa chỉ thử');
    expect(chan.textContent).not.toMatch(/đăng xuất/i);
  });
});

describe('AppFooter — dòng cuối (BR-6, BR-7)', () => {
  it('ngày cập nhật dạng dd/mm/yyyy, lời miễn trừ đúng câu, bản quyền theo tên Trung tâm', async () => {
    dungFooter(TRUNG_TAM_THU);
    expect(await screen.findByText('Dữ liệu thủ tục cập nhật ngày 08/10/2026')).toBeInTheDocument();
    expect(screen.getByText(MIEN_TRU)).toBeInTheDocument();
    expect(screen.getByText('© Trung tâm thử A')).toBeInTheDocument();
  });

  it('ngày null thì không có dòng ngày', async () => {
    dungFooter(voi({ ngayCapNhatThuTuc: null }));
    await screen.findByText('© Trung tâm thử A');
    expect(screen.queryByText(/Dữ liệu thủ tục cập nhật/)).not.toBeInTheDocument();
  });
});

describe('AppFooter — đang tải và lỗi', () => {
  it('đang tải: khung chờ và lời miễn trừ', () => {
    dungFooter('treo');
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.getByText(MIEN_TRU)).toBeInTheDocument();
  });

  it.each<PhanHoiTrungTam>(['loi-mang', 'khong-co-du-lieu'])('%s: chỉ còn lời miễn trừ', async (loi) => {
    const { client } = dungFooter(loi);
    await waitFor(() => expect(client.isFetching()).toBe(0));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const chan = screen.getByRole('contentinfo');
    expect(chan.textContent).toBe(MIEN_TRU);
    expect(within(chan).queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('AppFooter — chữ dài không bị cắt (TT 22/2023)', () => {
  const dai = (goc: string) => `${goc} `.repeat(15).trim();

  it('tên, cơ quan, địa chỉ, bản quyền dài: đủ chữ, không cắt bằng title hay line-clamp', async () => {
    const ten = dai('Trung tâm thử');
    const diaChi = dai('Địa chỉ thử');
    const coQuan = `Cơ quan chủ quản: ${dai('Cơ quan thử')}`;
    dungFooter(voi({ ten, coQuanChuQuan: dai('Cơ quan thử'), diaChi }));
    const chan = await chanDaTai();

    const tieuDe = within(chan).getByRole('heading', { level: 2, name: ten });
    const phanTu = [tieuDe, within(chan).getByText(diaChi), within(chan).getByText(coQuan), within(chan).getByText(/^©/)];
    for (const e of phanTu) {
      expect(e).not.toHaveAttribute('title');
      expect(e.className).not.toMatch(/rutGon/);
    }
    expect(within(chan).getByText(/^©/).textContent).toContain(ten);
  });

  it('chuỗi dài không dấu cách vẫn có đủ trong DOM', async () => {
    const diaChi = 'x'.repeat(200);
    dungFooter(voi({ diaChi }));
    const chan = await chanDaTai();
    expect(within(chan).getByText(diaChi).textContent).toBe(diaChi);
  });
});
