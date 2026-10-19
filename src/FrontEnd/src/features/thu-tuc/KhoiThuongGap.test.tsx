import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { datKhoMan } from '../../test-utils/khoMan';
import { giaFetchDanhMuc, type PhanHoiDanhMuc } from '../../test-utils/danhMucMau';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { napNgonNguThuTuc } from './i18n';
import { KhoiThuongGap } from './KhoiThuongGap';
import { linkDvc } from './linkDvc';
import { DiaChiHienTai, dungTrongRouter } from './thuTucMau';
import { taoBo16, taoBo43, taoBoKhongThuongGap } from './thuongGapMau';
import { useMoThuTuc } from './useMoThuTuc';

beforeAll(async () => {
  await napNgonNguThuTuc();
});

afterEach(() => vi.unstubAllGlobals());

function Trang() {
  useMoThuTuc(); // như trang thật: có router, không có popup
  return (
    <div>
      <KhoiThuongGap />
      <DiaChiHienTai />
    </div>
  );
}

/** Dựng trong `act` bất đồng bộ: lần vẽ đầu của khối treo chờ câu chữ (`use`), cần `await act` để React thử lại. */
async function dungAsync(diaChi = '/') {
  let kq!: ReturnType<typeof dungTrongRouter>;
  await act(async () => {
    kq = dungTrongRouter(<Trang />, { diaChi });
  });
  return kq;
}

/** Dựng khối với danh mục giả; khổ thẻ (768) để kiểm thẻ trước, bảng kiểm riêng. */
async function dung(phanHoi: PhanHoiDanhMuc, diaChi = '/', rong = 768) {
  datKhoMan(rong);
  const fetchGia = giaFetchDanhMuc(phanHoi);
  const kq = await dungAsync(diaChi);
  return { fetchGia, ...kq };
}

async function dungDayDu(diaChi = '/', rong = 768) {
  const kq = await dung(taoBo43(), diaChi, rong);
  await screen.findByRole('heading', { level: 2, name: 'Thủ tục thường gặp' });
  await screen.findAllByRole('article');
  return kq;
}

const tenCacThe = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);
const soDem = () => screen.getByText(/^Hiển thị \d+\/\d+$/).textContent;
const tim = () => screen.getByRole('searchbox', { name: 'Tìm theo tên, mã thủ tục hoặc lĩnh vực' });
const diaChi = () => screen.getByTestId('dia-chi').textContent ?? '';
const thamSo = () => new URLSearchParams(diaChi().split('?')[1] ?? '');
/**
 * Đưa từ khoá vào ô tìm bằng MỘT sự kiện nhập (dán), không gõ từng phím: mỗi phím làm khối lọc và vẽ lại cả trang thẻ trong jsdom,
 * 16 phím trên máy tải nặng quá 5 giây của `findBy`/`waitFor`. Cái cần kiểm là kết quả theo từ khoá, không phải từng phím.
 */
async function nhapTim(user: ReturnType<typeof userEvent.setup>, tuKhoa: string) {
  await user.click(tim());
  await user.paste(tuKhoa);
}
const chip = (ten: string) => screen.getByRole('button', { name: ten });

describe('KhoiThuongGap: hiển thị mặc định', () => {
  it('không có props; tự bọc h2 "Thủ tục thường gặp" và số đếm "Hiển thị 43/43" (AC-8)', async () => {
    expect(KhoiThuongGap.length).toBe(0);
    await dungDayDu();
    const tieuDe = screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' });
    expect(screen.getByRole('region', { name: 'Thủ tục thường gặp' })).toContainElement(tieuDe);
    expect(soDem()).toBe('Hiển thị 43/43');
  });

  it('mặc định chọn "Tất cả"; chỉ có chip của lĩnh vực có thủ tục thường gặp (AC-8)', async () => {
    await dungDayDu();
    const nhom = screen.getByRole('group', { name: 'Lọc theo lĩnh vực' });
    const cacChip = within(nhom).getAllByRole('button').map((b) => b.textContent);
    // thứ tự xuất hiện đầu tiên trong danh sách thường gặp; Tư pháp không có thủ tục thường gặp nên không có chip
    expect(cacChip).toEqual(['Tất cả', 'Hộ tịch', 'Đất đai', 'Thuỷ lợi']);
    expect(chip('Tất cả')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Hộ tịch')).toHaveAttribute('aria-pressed', 'false');
  });

  it('chỉ có thủ tục thường gặp, theo thứ tự thuTuThuongGap: kết hôn trước khai sinh (AC-22)', async () => {
    await dungDayDu();
    const ten = tenCacThe();
    expect(ten).toHaveLength(12);
    expect(ten.slice(0, 2)).toEqual(['Thủ tục đăng ký kết hôn', 'Thủ tục đăng ký khai sinh']);
    expect(ten).not.toContain('Thủ tục đăng ký khai sinh lại');
    expect(ten).not.toContain('Thủ tục chứng thực bản sao');
  });

  it('chọn chip Hộ tịch: vẫn đúng thứ tự dữ liệu (AC-22)', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await user.click(chip('Hộ tịch'));
    await waitFor(() => expect(chip('Hộ tịch')).toHaveAttribute('aria-pressed', 'true'));
    expect(tenCacThe().slice(0, 2)).toEqual(['Thủ tục đăng ký kết hôn', 'Thủ tục đăng ký khai sinh']);
  });

  it('tên thủ tục trên thẻ dưới h2 của khối là h3', async () => {
    await dungDayDu();
    expect(within(screen.getAllByRole('article')[0]!).getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});

describe('KhoiThuongGap: tìm kiếm và chip', () => {
  it('gõ "dang ky the chap" (không dấu) → có "Đăng ký thế chấp" (AC-1)', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await nhapTim(user, 'dang ky the chap');
    await waitFor(() => expect(tenCacThe()).toContain('Thủ tục đăng ký thế chấp quyền sử dụng đất'));
    expect(tenCacThe()).toEqual([
      'Thủ tục đăng ký thế chấp quyền sử dụng đất',
      'Thủ tục xoá đăng ký thế chấp quyền sử dụng đất',
    ]);
    expect(soDem()).toBe('Hiển thị 2/43');
  });

  it('chọn chip "Đất đai" rồi gõ "the chap" → chỉ còn mục Đất đai có "thế chấp"; số đếm đổi (AC-2)', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await user.click(chip('Đất đai'));
    await nhapTim(user, 'the chap');
    await waitFor(() => expect(soDem()).toBe('Hiển thị 2/43'));
    expect(tenCacThe()).toEqual([
      'Thủ tục đăng ký thế chấp quyền sử dụng đất',
      'Thủ tục xoá đăng ký thế chấp quyền sử dụng đất',
    ]);
    // không chip: có thêm mục Thuỷ lợi cũng có "thế chấp"
    await user.click(chip('Tất cả'));
    await waitFor(() => expect(soDem()).toBe('Hiển thị 3/43'));
  });

  it('gõ mã "1.001193" → chỉ khai sinh', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await nhapTim(user, '1.001193');
    await waitFor(() => expect(tenCacThe()).toEqual(['Thủ tục đăng ký khai sinh']));
  });

  it('gõ "ho tich khai sinh" → mục Hộ tịch có "khai sinh" (AC-7)', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await nhapTim(user, 'ho tich khai sinh');
    await waitFor(() => expect(tenCacThe()).toEqual(['Thủ tục đăng ký khai sinh']));
  });

  it('không có kết quả: EmptyState có nút "Xoá bộ lọc"; bấm thì xoá từ khoá và chip, con trỏ về ô tìm', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    await user.click(chip('Đất đai'));
    await nhapTim(user, 'zzzzz');
    await waitFor(() => expect(screen.getByText(/Không tìm thấy thủ tục phù hợp với 'zzzzz'/)).toBeInTheDocument());
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(soDem()).toBe('Hiển thị 0/43');
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(12));
    expect(tim()).toHaveValue('');
    expect(tim()).toHaveFocus();
    expect(chip('Tất cả')).toHaveAttribute('aria-pressed', 'true');
    expect(thamSo().has('lv')).toBe(false);
    expect(thamSo().has('q')).toBe(false);
  });

  it('lĩnh vực lạ hoặc lĩnh vực không có thủ tục thường gặp trên địa chỉ: coi như "Tất cả", không lọc', async () => {
    const { unmount } = await dungDayDu('/?lv=khong-co-that');
    expect(chip('Tất cả')).toHaveAttribute('aria-pressed', 'true');
    expect(soDem()).toBe('Hiển thị 43/43');
    expect(screen.getByRole('region', { name: 'Thủ tục thường gặp' }).textContent).not.toContain('khong-co-that');
    unmount();
    await dungDayDu('/?lv=tu-phap');
    expect(chip('Tất cả')).toHaveAttribute('aria-pressed', 'true');
    expect(soDem()).toBe('Hiển thị 43/43');
  });
});

describe('KhoiThuongGap: phân trang và địa chỉ', () => {
  it('43 mục → 4 trang: 12, 12, 12, 7; trang 2 là mục 13–24 (AC-13)', async () => {
    const user = userEvent.setup();
    await dungDayDu();
    expect(within(screen.getByRole('navigation', { name: 'Phân trang' })).getByRole('button', { name: 'Trang 4' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    await waitFor(() => expect(tenCacThe()[0]).toBe('Thủ tục thường gặp số 13'));
    expect(tenCacThe()).toHaveLength(12);
    expect(tenCacThe()[11]).toBe('Thủ tục thường gặp số 24');
    await user.click(screen.getByRole('button', { name: 'Trang 3' }));
    await waitFor(() => expect(tenCacThe()[0]).toBe('Thủ tục thường gặp số 25'));
    await user.click(screen.getByRole('button', { name: 'Trang 4' }));
    await waitFor(() => expect(tenCacThe()).toHaveLength(7));
  });

  it('ở trang 3 chọn chip khác → về trang 1 (AC-13)', async () => {
    const user = userEvent.setup();
    await dungDayDu('/?trang=3');
    expect(tenCacThe()[0]).toBe('Thủ tục thường gặp số 25');
    await user.click(chip('Hộ tịch'));
    await waitFor(() => expect(thamSo().has('trang')).toBe(false));
    expect(thamSo().get('lv')).toBe('ho-tich');
    expect(tenCacThe()[0]).toBe('Thủ tục đăng ký kết hôn');
  });

  it('q, lv, trang ghi lên địa chỉ bằng replace; mở lại địa chỉ → cùng chip, từ khoá, trang (AC-19)', async () => {
    const user = userEvent.setup();
    const { router, unmount } = await dungDayDu();
    await user.click(chip('Đất đai'));
    await waitFor(() => expect(thamSo().get('lv')).toBe('dat-dai'));
    expect(router.state.historyAction).toBe('REPLACE');
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    await waitFor(() => expect(thamSo().get('trang')).toBe('2'));
    await nhapTim(user, 'thuong gap'); // đổi từ khoá → về trang 1
    await waitFor(() => expect(thamSo().get('q')).toBe('thuong gap'));
    expect(thamSo().has('trang')).toBe(false);
    expect(router.state.historyAction).toBe('REPLACE');

    const url = diaChi();
    unmount();
    await dungDayDu(url);
    expect(chip('Đất đai')).toHaveAttribute('aria-pressed', 'true');
    expect(tim()).toHaveValue('thuong gap');
  });

  it('số trang sai trên địa chỉ → trang 1; quá lớn → trang cuối', async () => {
    const { unmount } = await dungDayDu('/?trang=abc');
    expect(tenCacThe()[0]).toBe('Thủ tục đăng ký kết hôn');
    unmount();
    await dungDayDu('/?trang=99');
    expect(tenCacThe()).toHaveLength(7);
  });
});

describe('KhoiThuongGap: bản đầu 16 mục và trạng thái', () => {
  it('16 mục: "Hiển thị 16/16", 2 trang (12 và 4), chip theo lĩnh vực có mặt (AC-20)', async () => {
    const user = userEvent.setup();
    await dung(taoBo16());
    await screen.findAllByRole('article');
    expect(soDem()).toBe('Hiển thị 16/16');
    expect(tenCacThe()).toHaveLength(12);
    const cacChip = within(screen.getByRole('group', { name: 'Lọc theo lĩnh vực' })).getAllByRole('button').map((b) => b.textContent);
    expect(cacChip).toEqual(['Tất cả', 'Hộ tịch', 'Đất đai', 'Thuỷ lợi']);
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    await waitFor(() => expect(tenCacThe()).toHaveLength(4));
  });

  it('bỏ một mục khỏi dữ liệu → "Hiển thị 15/15" (AC-20)', async () => {
    const bo = taoBo16();
    bo.thuTuc.pop();
    await dung(bo);
    await screen.findAllByRole('article');
    expect(soDem()).toBe('Hiển thị 15/15');
  });

  it('không có thủ tục thường gặp nào → không vẽ cả khối', async () => {
    const { fetchGia } = await dung(taoBoKhongThuongGap());
    await waitFor(() => expect(fetchGia).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByRole('heading', { name: 'Thủ tục thường gặp' })).toBeNull();
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('đang tải: có tiêu đề khối và khung chờ', async () => {
    await dung('treo');
    expect(await screen.findByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('lỗi tải: ErrorState có "Thử lại"; bấm thì tải lại và hiện danh sách', async () => {
    const user = userEvent.setup();
    datKhoMan(768);
    giaFetchDanhMuc('loi-mang');
    await dungAsync();
    const nutThuLai = await screen.findByRole('button', { name: 'Thử lại' });
    expect(screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeInTheDocument();
    giaFetchDanhMuc(taoBo43());
    await user.click(nutThuLai);
    expect(await screen.findAllByRole('article')).toHaveLength(12);
  });
});

describe('KhoiThuongGap: liên kết và mở popup', () => {
  it('mỗi thẻ có đúng một liên kết "Xem và nộp trên Cổng DVC" tới linkDvc; không có nút nộp trực tuyến (AC-10)', async () => {
    await dungDayDu();
    for (const the of screen.getAllByRole('article')) {
      const lienKet = within(the).getAllByRole('link');
      expect(lienKet).toHaveLength(1);
      expect(lienKet[0]).toHaveAccessibleName(/^Xem và nộp trên Cổng DVC/);
      expect(lienKet[0]!.getAttribute('href')).toMatch(/^https:\/\/dichvucong\.gov\.vn\/tra-cuu-thu-tuc\/danh-sach\?keyword=/);
      expect(lienKet[0]).toHaveAttribute('target', '_blank');
      expect(lienKet[0]!.getAttribute('rel')).toContain('noopener');
    }
    expect(screen.getAllByRole('article')[1]).toContainElement(screen.getAllByRole('link', { name: /Xem và nộp trên Cổng DVC/ })[1]!);
    expect(within(screen.getAllByRole('article')[1]!).getByRole('link')).toHaveAttribute('href', linkDvc('1.001193'));
    expect(screen.queryByText(/Nộp trực tuyến/)).toBeNull();
  });

  it('bấm "Xem chi tiết" → địa chỉ có ma, giữ các tham số khác (AC-15)', async () => {
    const user = userEvent.setup();
    await dungDayDu('/?lv=ho-tich');
    const the = screen.getAllByRole('article')[1]!;
    const nut = within(the).getByRole('button', { name: 'Xem chi tiết Thủ tục đăng ký khai sinh' });
    expect(nut).toHaveTextContent('Xem chi tiết');
    await user.click(nut);
    expect(thamSo().get('ma')).toBe('1.001193');
    expect(thamSo().get('lv')).toBe('ho-tich');
  });

  it('thẻ hiện mức độ có chữ và thời hạn; không hiện thời hạn khi chưa ghi rõ', async () => {
    datKhoMan(768);
    const bo = taoBo43();
    const khaiSinh = bo.thuTuc.find((t) => t.ma === '1.001193')!;
    khaiSinh.thoiHan = null;
    giaFetchDanhMuc(bo);
    await dungAsync();
    await screen.findAllByRole('article');
    const the = screen.getAllByRole('article');
    expect(within(the[0]!).getByText('Toàn trình')).toBeInTheDocument();
    expect(within(the[0]!).getByText('Thời hạn: 3 ngày làm việc')).toBeInTheDocument();
    expect(within(the[1]!).queryByText(/Thời hạn/)).toBeNull();
  });
});

describe('KhoiThuongGap: dạng thẻ / bảng theo khổ màn hình (AC-5, AC-12)', () => {
  const laDangThe = () => screen.queryAllByRole('article').length > 0;
  const laDangBang = async () => (await screen.findByRole('table')) !== null;

  it('375: thẻ dù đã lưu "bảng"', async () => {
    window.localStorage.setItem('cach-xem', 'bang');
    await dungDayDu('/', 375);
    expect(laDangThe()).toBe(true);
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('768: thẻ, có nút chuyển dạng', async () => {
    await dungDayDu('/', 768);
    expect(laDangThe()).toBe(true);
    expect(screen.getByRole('group', { name: 'Cách hiển thị' })).toBeInTheDocument();
  });

  it('1280: bảng với 12 dòng, mỗi dòng đúng một liên kết Cổng DVC; bấm tên thủ tục mở popup (AC-10, AC-15)', async () => {
    const user = userEvent.setup();
    datKhoMan(1280);
    giaFetchDanhMuc(taoBo43());
    await dungAsync();
    expect(await laDangBang()).toBe(true);
    const bang = screen.getByRole('table', { name: 'Danh sách thủ tục thường gặp' });
    const hang = within(bang).getAllByRole('row').slice(1);
    expect(hang).toHaveLength(12);
    for (const h of hang) expect(within(h).getAllByRole('link')).toHaveLength(1);
    expect(within(hang[1]!).getByRole('link')).toHaveAttribute('href', linkDvc('1.001193'));
    expect(within(bang).getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'STT',
      'Mã',
      'Tên thủ tục',
      'Lĩnh vực',
      'Mức độ',
      'Cơ quan thực hiện',
      'Cổng DVC',
    ]);
    expect(within(hang[0]!).getAllByRole('cell')[0]).toHaveTextContent('1');
    await user.click(within(hang[1]!).getByRole('button', { name: 'Thủ tục đăng ký khai sinh' }));
    expect(thamSo().get('ma')).toBe('1.001193');
  });

  it('thứ tự kết hôn trước khai sinh cũng ở dạng bảng (AC-22)', async () => {
    datKhoMan(1280);
    giaFetchDanhMuc(taoBo43());
    await dungAsync();
    const bang = await screen.findByRole('table');
    const hang = within(bang).getAllByRole('row').slice(1);
    expect(hang[0]).toHaveTextContent('Thủ tục đăng ký kết hôn');
    expect(hang[1]).toHaveTextContent('Thủ tục đăng ký khai sinh');
  });

  it('kiosk 1080: thẻ', async () => {
    datCheDoKiosk(true);
    await dungDayDu('/', 1080);
    expect(laDangThe()).toBe(true);
  });

  it('chọn bảng ở 1280 rồi thu 375 → thẻ, nới lại → bảng; tải lại vẫn bảng', async () => {
    const user = userEvent.setup();
    datKhoMan(768);
    giaFetchDanhMuc(taoBo43());
    const { unmount } = await dungAsync();
    await screen.findAllByRole('article');
    await user.click(screen.getByRole('button', { name: 'Dạng bảng' }));
    expect(await laDangBang()).toBe(true);
    datKhoMan(375);
    await waitFor(() => expect(laDangThe()).toBe(true));
    datKhoMan(1280);
    expect(await laDangBang()).toBe(true);
    unmount();
    datKhoMan(768);
    giaFetchDanhMuc(taoBo43());
    await dungAsync();
    expect(await laDangBang()).toBe(true);
  });
});
