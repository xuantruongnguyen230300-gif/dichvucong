import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { linkDvc } from './linkDvc';
import { napNgonNguThuTuc } from './i18n';
import {
  CHI_TIET_KHAI_SINH,
  CHI_TIET_TOI_GIAN,
  DiaChiHienTai,
  dungTrongRouter,
  giaFetchChiTiet,
  taoClientThu,
} from './thuTucMau';
import { ThuTucPopup } from './ThuTucPopup';
import { useMoThuTuc } from './useMoThuTuc';

afterEach(() => vi.unstubAllGlobals());

const TEN_KHAI_SINH = 'Thủ tục đăng ký khai sinh';
const CAU_KHONG_TIM_THAY = 'Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng.';

function TrangThu() {
  const { mo } = useMoThuTuc();
  return (
    <div>
      <h1>Trang thử</h1>
      <button type="button" onClick={() => mo('1.001193')}>
        Xem chi tiết khai sinh
      </button>
      <DiaChiHienTai />
      <ThuTucPopup />
    </div>
  );
}

const diaChi = () => screen.getByTestId('dia-chi').textContent;

async function moSan(ma: string, cacChiTiet = [CHI_TIET_KHAI_SINH, CHI_TIET_TOI_GIAN]) {
  const fetchGia = giaFetchChiTiet(cacChiTiet);
  const kq = dungTrongRouter(<TrangThu />, { diaChi: `/?q=a&ma=${ma}` });
  return { fetchGia, ...kq };
}

describe('ThuTucPopup', () => {
  it('không có ma trên địa chỉ: không có popup và không gọi API', async () => {
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    dungTrongRouter(<TrangThu />, { diaChi: '/' });
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('mở thẳng bằng địa chỉ: popup đúng thủ tục, gọi đúng /api/thu-tuc/{ma} (AC-15)', async () => {
    const { fetchGia } = await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' });
    expect(within(hop).getByRole('heading', { level: 2 })).toHaveTextContent('Thủ tục đăng ký khai sinh');
    expect(fetchGia.mock.calls.map((c) => String(c[0]))).toEqual(['/api/thu-tuc/1.001193']);
  });

  it('đang tải: popup hiện ngay với khung chờ, rồi có nội dung (AC-3)', async () => {
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH], 'treo');
    dungTrongRouter(<TrangThu />, { diaChi: '/?ma=1.001193' });
    const hopCho = await screen.findByRole('dialog', { name: 'Đang tải…' });
    expect(within(hopCho).getByRole('status')).toHaveTextContent('Đang tải…');
    fetchGia.traLoi();
    expect(await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' })).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('đủ 7 mục theo thứ tự BR-3 rồi lời miễn trừ (AC-6, AC-23)', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const tieuDe = within(hop)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(tieuDe).toEqual([
      'Thông tin chung',
      'Yêu cầu, điều kiện',
      'Cách thức nộp',
      'Thành phần hồ sơ',
      'Trình tự thực hiện',
      'Kết quả',
      'Căn cứ pháp lý',
    ]);
    const mienTru = within(hop).getByText(/Thông tin chỉ để tham khảo/);
    expect(mienTru).toHaveTextContent(
      'Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia.',
    );
    // Lời miễn trừ nằm sau mục cuối
    const muc = within(hop).getByRole('heading', { name: 'Căn cứ pháp lý' }).closest('section')!;
    expect(muc.compareDocumentPosition(mienTru) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('nhãn đầu popup: lĩnh vực, mức độ có chữ, mã thủ tục', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(within(hop).getByText('Hộ tịch')).toBeInTheDocument();
    expect(within(hop).getByText('Toàn trình')).toBeInTheDocument();
    expect(within(hop).getByText('Mã: 1.001193')).toBeInTheDocument();
  });

  it('thời hạn null: "Chưa ghi rõ — xem trên Cổng DVC Quốc gia"; có thời hạn thì hiện thời hạn', async () => {
    const { unmount } = await moSan('1.001193');
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(screen.getByText('Chưa ghi rõ — xem trên Cổng DVC Quốc gia')).toBeInTheDocument();
    unmount();
    await moSan('2.000815');
    await screen.findByRole('dialog', { name: 'Thủ tục tối giản' });
    expect(screen.getByText('3 ngày làm việc')).toBeInTheDocument();
    expect(screen.queryByText('Chưa ghi rõ — xem trên Cổng DVC Quốc gia')).toBeNull();
  });

  it('giấy tờ (1,0) hiện số bản; (null,null) và (0,0) chỉ có tên (AC-23)', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const ds = within(within(hop).getByRole('heading', { name: 'Thành phần hồ sơ' }).closest('section')!).getAllByRole('listitem');
    expect(ds).toHaveLength(3);
    expect(ds[0]).toHaveTextContent('Tờ khai đăng ký khai sinh');
    expect(ds[0]).toHaveTextContent('Bản chính: 1 · Bản sao: 0');
    expect(ds[1]).toHaveTextContent(/^Giấy chứng sinh$/);
    expect(ds[2]).toHaveTextContent(/^Giấy tờ ghi 0 bản$/);
  });

  it('mục không có dữ liệu thì ẩn hẳn; vẫn có thời hạn và lời miễn trừ (AC-6, AC-23)', async () => {
    await moSan('2.000815');
    const hop = await screen.findByRole('dialog', { name: 'Thủ tục tối giản' });
    expect(within(hop).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Thông tin chung']);
    for (const ten of ['Cơ quan thực hiện', 'Phí, lệ phí', 'Cách nộp']) expect(within(hop).queryByText(ten)).toBeNull();
    expect(within(hop).queryByRole('table')).toBeNull();
    expect(within(hop).getByText(/Thông tin chỉ để tham khảo/)).toBeInTheDocument();
  });

  it('căn cứ pháp lý chỉ là chữ: không có liên kết, không có phần tử Tab được', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const muc = within(hop).getByRole('heading', { name: 'Căn cứ pháp lý' }).closest('section')!;
    expect(muc.querySelector('a, button, [tabindex], input')).toBeNull();
    const dong = within(muc).getAllByRole('listitem');
    expect(dong[0]).toHaveTextContent('Luật số 60/2014/QH13 — Luật Hộ tịch');
    expect(dong[1]).toHaveTextContent(/^Thông tư hướng dẫn$/); // thiếu số ký hiệu: chỉ hiện trích yếu
  });

  it('bảng cách thức có tiêu đề cột, ô trống hiện "—", mô tả là dòng nhỏ', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const bang = within(hop).getByRole('table', { name: 'Cách thức nộp hồ sơ' });
    expect(within(bang).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Hình thức', 'Thời gian', 'Phí, lệ phí']);
    const hang = within(bang).getAllByRole('row');
    expect(hang[1]).toHaveTextContent('Trực tuyến');
    expect(hang[1]).toHaveTextContent('Nộp qua Cổng DVC');
    expect(within(hang[2]!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['Bưu chính', '—', '—']);
  });

  it('đúng một liên kết "Xem và nộp trên Cổng DVC" tới linkDvc, mở trang mới; không có nút nộp trực tuyến (AC-9, AC-10)', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const lienKet = within(hop).getAllByRole('link');
    expect(lienKet).toHaveLength(1);
    expect(lienKet[0]).toHaveAccessibleName(/^Xem và nộp trên Cổng DVC/);
    expect(lienKet[0]).toHaveAttribute('href', linkDvc('1.001193'));
    expect(lienKet[0]).toHaveAttribute('target', '_blank');
    expect(lienKet[0]!.getAttribute('rel')).toContain('noopener');
    expect(lienKet[0]!.getAttribute('rel')).toContain('noreferrer');
    expect(within(hop).queryByRole('button', { name: /Nộp trực tuyến/ })).toBeNull();
    expect(within(hop).queryByRole('link', { name: /Nộp trực tuyến/ })).toBeNull();
  });

  it('tiêu đề tab là tên thủ tục khi popup mở, trở lại như cũ khi đóng (AC-21)', async () => {
    document.title = 'Trang chủ – Trung tâm';
    const user = userEvent.setup();
    await moSan('1.001193');
    await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' });
    await waitFor(() => expect(document.title).toBe('Thủ tục đăng ký khai sinh'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.title).toBe('Trang chủ – Trung tâm');
  });

  it('Esc, nút ✕ và bấm vùng tối đều đóng popup và bỏ ma khỏi địa chỉ (AC-16)', async () => {
    const user = userEvent.setup();
    await moSan('1.001193');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=a');

    await user.click(screen.getByRole('button', { name: 'Xem chi tiết khai sinh' }));
    let hop = await screen.findByRole('dialog');
    await user.click(within(hop).getByRole('button', { name: 'Đóng' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Xem chi tiết khai sinh' }));
    hop = await screen.findByRole('dialog');
    await user.click(hop.parentElement!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=a');
  });

  it('con trỏ trong popup khi mở và trả về nút đã mở khi đóng', async () => {
    const user = userEvent.setup();
    dungTrongRouter(<TrangThu />, { diaChi: '/?q=a' });
    giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const nut = screen.getByRole('button', { name: 'Xem chi tiết khai sinh' });
    await user.click(nut);
    const hop = await screen.findByRole('dialog');
    expect(hop).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(nut).toHaveFocus();
  });

  it('Quay lại của trình duyệt đóng popup và giữ nguyên tham số danh sách (AC-17)', async () => {
    const user = userEvent.setup();
    giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const { router } = dungTrongRouter(<TrangThu />, { diaChi: '/?q=khai+sinh&trang=2' });
    await user.click(screen.getByRole('button', { name: 'Xem chi tiết khai sinh' }));
    await screen.findByRole('dialog');
    await router.navigate(-1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=khai+sinh&trang=2');
  });

  it('kiosk: mở rồi đóng không thêm mục lịch sử', async () => {
    datCheDoKiosk(true);
    const user = userEvent.setup();
    giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const { router } = dungTrongRouter(<TrangThu />, { diaChi: '/?q=a' });
    await user.click(screen.getByRole('button', { name: 'Xem chi tiết khai sinh' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(router.state.historyAction).toBe('REPLACE');
    expect(diaChi()).toBe('/?q=a');
  });
});

describe('ThuTucPopup: mã không có, mã sai, lỗi', () => {
  it('mã không có trong dữ liệu (404): câu không tìm thấy, nút Đóng, không nhắc lại mã (AC-18)', async () => {
    const user = userEvent.setup();
    await moSan('9.999999');
    const hop = await screen.findByRole('dialog', { name: CAU_KHONG_TIM_THAY });
    expect(within(hop).getByRole('heading', { level: 2 })).toHaveTextContent(CAU_KHONG_TIM_THAY);
    expect(hop.textContent).not.toContain('9.999999');
    const nutDong = within(hop).getAllByRole('button', { name: 'Đóng' });
    expect(nutDong.length).toBeGreaterThanOrEqual(1);
    await user.click(nutDong[nutDong.length - 1]!); // nút ở chân popup
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=a');
  });

  it('mã sai định dạng (abc<b>x</b>): không gọi fetch, chữ trên địa chỉ không hiện ra trang (AC-18)', async () => {
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    dungTrongRouter(<TrangThu />, { diaChi: `/?ma=${encodeURIComponent('abc<b>x</b>')}` });
    const hop = await screen.findByRole('dialog', { name: CAU_KHONG_TIM_THAY });
    expect(hop.querySelector('b')).toBeNull();
    expect(hop.textContent).not.toContain('abc');
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('ma rỗng: coi là đang mở, báo không tìm thấy, không gọi fetch', async () => {
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    dungTrongRouter(<TrangThu />, { diaChi: '/?ma=' });
    await screen.findByRole('dialog', { name: CAU_KHONG_TIM_THAY });
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('lỗi mạng: ErrorState có "Thử lại"; bấm thì gọi lại fetch và hiện nội dung', async () => {
    const user = userEvent.setup();
    const client = taoClientThu();
    giaFetchChiTiet([CHI_TIET_KHAI_SINH], 'loi-mang');
    dungTrongRouter(<TrangThu />, { diaChi: '/?ma=1.001193', client });
    const hop = await screen.findByRole('dialog', { name: 'Chi tiết thủ tục' });
    const nutThuLai = await within(hop).findByRole('button', { name: 'Thử lại' });
    expect(within(hop).getByRole('alert')).toBeInTheDocument();
    expect(within(hop).getAllByRole('button', { name: 'Đóng' }).length).toBeGreaterThanOrEqual(1);
    const fetchMoi = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    await user.click(nutThuLai);
    expect(await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' })).toBeInTheDocument();
    expect(fetchMoi).toHaveBeenCalledTimes(1);
  });

  it('câu chữ lấy qua i18n: namespace thu-tuc đã nạp, không hiện khoá thô', async () => {
    await napNgonNguThuTuc();
    await moSan('1.001193');
    await screen.findByRole('dialog');
    expect(document.body.textContent).not.toMatch(/chi-tiet\.|muc\.|thu-tuc:/);
  });
});

describe('ThuTucPopup: mở thẳng bằng link, "Quay lại" ở lại trang (AC-24)', () => {
  it('Quay lại của trình duyệt đóng popup, bỏ ma, giữ tham số khác; mục lịch sử đầu không còn popup', async () => {
    const { router } = await moSan('1.001193');
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(diaChi()).toBe('/?q=a&ma=1.001193'); // địa chỉ không đổi sau khi thêm mục đệm
    await router.navigate(-1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=a');
    // Đã ở mục đầu: lùi nữa không đổi gì (không có mục nào phía trước để rời trang)
    await router.navigate(-1);
    expect(diaChi()).toBe('/?q=a');
    // Tiến lại thì popup mở lại
    await router.navigate(1);
    expect(await screen.findByRole('dialog', { name: TEN_KHAI_SINH })).toBeInTheDocument();
  });

  it('bấm ✕ cũng ở lại trang, địa chỉ bỏ ma', async () => {
    const user = userEvent.setup();
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    await user.click(within(hop).getAllByRole('button', { name: 'Đóng' })[0]!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(diaChi()).toBe('/?q=a');
  });

  it('mục đệm được thêm bằng PUSH, mục hiện tại không còn là mục đầu (không thêm lần hai)', async () => {
    const { router } = await moSan('1.001193');
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const khoaMoThang = router.state.location.key;
    expect(khoaMoThang).not.toBe('default');
    expect(router.state.historyAction).toBe('PUSH');
  });

  it('mục đã có đánh dấu (tải lại sau khi đã thêm mục đệm): không thêm nữa', async () => {
    giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const tuyen = [{ path: '*', element: <TrangThu /> }];
    const router = createMemoryRouter(tuyen, {
      initialEntries: [{ pathname: '/', search: '?ma=1.001193', state: { popupThuTuc: true } }],
    });
    render(
      <QueryClientProvider client={taoClientThu()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(router.state.historyAction).toBe('POP');
    expect(diaChi()).toBe('/?ma=1.001193');
  });

  it('kiosk: mở thẳng không thêm mục đệm (AC-25)', async () => {
    datCheDoKiosk(true);
    const { router } = await moSan('1.001193');
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(router.state.historyAction).toBe('POP');
    expect(router.state.location.key).toBe('default');
  });

  it('không phải mục đầu (đã đi từ trang khác trong trang web tới địa chỉ có ma): không thêm mục đệm', async () => {
    giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const tuyen = [{ path: '*', element: <TrangThu /> }];
    const router = createMemoryRouter(tuyen, { initialEntries: ['/truoc', '/?ma=1.001193'], initialIndex: 1 });
    render(
      <QueryClientProvider client={taoClientThu()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
    await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(router.state.historyAction).toBe('POP');
    await router.navigate(-1);
    await waitFor(() => expect(diaChi()).toBe('/truoc'));
  });
});

describe('ThuTucPopup: dòng nhắc đăng xuất (F09 BR-4)', () => {
  const NHAC = 'Nhớ đăng xuất khi dùng xong';

  it('kiosk: đúng một dòng ở chân popup, đứng trước liên kết Cổng DVC; liên kết vẫn mở ngay, không bước xác nhận (AC-3)', async () => {
    datCheDoKiosk(true);
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    const dong = await within(hop).findByText(NHAC);
    expect(within(hop).getAllByText(NHAC)).toHaveLength(1);
    const lienKet = within(hop).getByRole('link', { name: /Xem và nộp trên Cổng DVC/ });
    expect(dong.compareDocumentPosition(lienKet) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dong.closest('footer')).toBe(lienKet.closest('footer'));
    expect(lienKet).toHaveAttribute('href', linkDvc('1.001193'));
    expect(lienKet).toHaveAttribute('target', '_blank');
    expect(lienKet).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(hop).queryByRole('button', { name: /xác nhận|tiếp tục/i })).toBeNull();
  });

  it('ngoài kiosk: không có dòng (AC-4)', async () => {
    await moSan('1.001193');
    const hop = await screen.findByRole('dialog', { name: TEN_KHAI_SINH });
    expect(within(hop).getByRole('link', { name: /Xem và nộp trên Cổng DVC/ })).toBeInTheDocument();
    expect(screen.queryByText(NHAC)).toBeNull();
  });
});
