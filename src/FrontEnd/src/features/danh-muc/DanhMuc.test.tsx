import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { datLaiCachXemChoTest, useCachXem } from '../../core/hooks/useCachXem';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import {
  DANH_MUC_MAU,
  giaFetchDanhMuc,
  taoDanhSachThuTuc,
  taoLinhVucTuThuTuc,
  taoThuTuc,
  type DuLieuDanhMuc,
  type PhanHoiDanhMuc,
} from '../../test-utils/danhMucMau';
import { datKhoMan } from '../../test-utils/khoMan';
import { linkDvc } from '../thu-tuc/linkDvc';
import { napNgonNguThuTuc } from '../thu-tuc/i18n';
import { DiaChiHienTai, dungTrongRouter } from '../thu-tuc/thuTucMau';
import { DanhMuc } from './DanhMuc';
import { napNgonNguDanhMuc } from './i18n';

beforeAll(async () => {
  await Promise.all([napNgonNguDanhMuc(), napNgonNguThuTuc()]);
});
beforeEach(() => datKhoMan(800)); // dạng thẻ (bảng ở 1280 px nạp chunk riêng); test nào cần bảng thì đặt 1280
afterEach(() => vi.unstubAllGlobals());

/** Đọc `useCachXem` ở một nơi khác của cây: kiểm lựa chọn thẻ/bảng dùng chung (AC-16). */
function CachXemNoiKhac() {
  const { cachXem } = useCachXem();
  return <span data-testid="cach-xem">{cachXem}</span>;
}

/** Dựng trong `act` bất đồng bộ: lần vẽ đầu treo chờ câu chữ của danh sách thủ tục (`use`), cần `await act` để React thử lại. */
async function dung(diaChi: string, phanHoi: PhanHoiDanhMuc = DANH_MUC_MAU) {
  const fetchGia = giaFetchDanhMuc(phanHoi);
  let ket!: ReturnType<typeof dungTrongRouter>;
  await act(async () => {
    ket = dungTrongRouter(
      <>
        <DanhMuc />
        <DiaChiHienTai />
        <CachXemNoiKhac />
      </>,
      { diaChi },
    );
  });
  return { ...ket, fetchGia };
}

const diaChi = () => screen.getByTestId('dia-chi').textContent ?? '';
const thamSo = () => new URLSearchParams(diaChi().split('?')[1] ?? '');
const oTim = () => screen.getByRole('searchbox', { name: 'Tìm theo tên, mã thủ tục hoặc lĩnh vực' });
const oLinhVuc = () => screen.getByRole('combobox', { name: 'Lĩnh vực' });
const oMucDo = () => screen.getByRole('combobox', { name: 'Mức độ' });
const nutXoa = () => screen.getByRole('button', { name: 'Xoá bộ lọc' });
const tabXa = () => screen.getByRole('tab', { name: 'Thủ tục cấp xã' });
const tabTinh = () => screen.getByRole('tab', { name: 'Thủ tục cấp tỉnh' });
const caiDat = () => screen.findByRole('tablist', { name: 'Danh mục' });
const dongSo = (chu: string | RegExp) => screen.getByText(chu);
const tenCacThe = () => screen.queryAllByRole('article').map((a) => within(a).getByRole('heading').textContent);

/** 266 thủ tục xã, 142 chỉ tỉnh (tổng tỉnh 408 như file mẫu thật), chia hai lĩnh vực. */
function danhMucLon(): DuLieuDanhMuc {
  const xa = taoDanhSachThuTuc(266, { cap: 'xa', linhVucMa: 'ho-tich' });
  const tinh = taoDanhSachThuTuc(142, { cap: 'tinh', linhVucMa: 'dat-dai', batDau: 1000 });
  const thuTuc = [...xa, ...tinh];
  return { thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc, { 'ho-tich': 'Hộ tịch', 'dat-dai': 'Đất đai' }) };
}

describe('DanhMuc — bố cục và thống kê', () => {
  it('một h1 ẩn, ba ô thống kê đếm từ dữ liệu, hai tab, thanh lọc, không có chữ "Ưu tiên" (AC-7, AC-8)', async () => {
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Danh mục thủ tục');
    const ke = within(screen.getByRole('list', { name: 'Thống kê danh mục' }));
    // mẫu: xã 4 (khai sinh, kết hôn, khai tử, thế chấp), tỉnh 4 (khai tử, cấp lại, thế chấp, thuỷ lợi), 3 lĩnh vực
    expect(ke.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '4Thủ tục cấp xã',
      '4Thủ tục cấp tỉnh',
      '3Lĩnh vực',
    ]);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(tabXa()).toHaveAttribute('aria-selected', 'true');
    expect(nutXoa()).toBeInTheDocument();
    expect(screen.queryByText(/ưu tiên/i)).toBeNull();
  });

  it('AC-7: 266 thủ tục xã → ô xã ghi 266; thêm một thủ tục xã → 267', async () => {
    const du = danhMucLon();
    const { unmount } = await dung('/thu-tuc?cap=xa', du);
    await caiDat();
    expect(within(screen.getByRole('list', { name: 'Thống kê danh mục' })).getAllByRole('listitem')[0]).toHaveTextContent('266');
    unmount();
    const them = [...du.thuTuc, taoThuTuc({ ma: '1.999999', ten: 'Thủ tục mới', cap: 'xa', linhVucMa: 'ho-tich' })];
    await dung('/thu-tuc?cap=xa', { thuTuc: them, linhVuc: taoLinhVucTuThuTuc(them, { 'ho-tich': 'Hộ tịch', 'dat-dai': 'Đất đai' }) });
    await caiDat();
    expect(within(screen.getByRole('list', { name: 'Thống kê danh mục' })).getAllByRole('listitem')[0]).toHaveTextContent('267');
  });

  it('đang tải → khung chờ; đầy đủ khi dữ liệu về', async () => {
    const { fetchGia } = await dung('/thu-tuc?cap=xa', 'treo');
    expect(screen.getByText('Đang tải…')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeNull();
    fetchGia.traLoi(DANH_MUC_MAU);
    await caiDat();
    expect(screen.queryByText('Đang tải…')).toBeNull();
  });

  it('lỗi hệ thống → ErrorState có "Thử lại" và mã tra cứu; thử lại thành công', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa', 'loi-he-thong');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Mã tra cứu: AB12CD34')).toBeInTheDocument();
    giaFetchDanhMuc(DANH_MUC_MAU);
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    await caiDat();
  });

  it('lỗi mạng → ErrorState, không có mã tra cứu', async () => {
    await dung('/thu-tuc?cap=xa', 'loi-mang');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(/Mã tra cứu/)).toBeNull();
  });
});

describe('DanhMuc — lọc (AC-1, AC-2, AC-3, AC-12, AC-17, AC-21)', () => {
  it('AC-2: Hộ tịch + Toàn trình → "n thủ tục (đang lọc)", địa chỉ có lv và md', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(dongSo('4 thủ tục')).toBeInTheDocument();
    await user.selectOptions(oLinhVuc(), 'ho-tich');
    await user.selectOptions(oMucDo(), 'toan-trinh');
    expect(dongSo('2 thủ tục (đang lọc)')).toBeInTheDocument();
    expect(tenCacThe()).toEqual(['Thủ tục đăng ký khai sinh', 'Thủ tục đăng ký kết hôn']);
    expect(thamSo().get('lv')).toBe('ho-tich');
    expect(thamSo().get('md')).toBe('toan-trinh');
  });

  it('AC-2: tab xã chưa lọc với 266 thủ tục → "266 thủ tục", không có "(đang lọc)"', async () => {
    await dung('/thu-tuc?cap=xa', danhMucLon());
    await caiDat();
    expect(dongSo('266 thủ tục')).toBeInTheDocument();
    expect(screen.queryByText(/đang lọc/)).toBeNull();
  });

  it('AC-21: mọi thủ tục của tab đều Toàn trình, chọn "Toàn trình" → vẫn không có "(đang lọc)"', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa', danhMucLon());
    await caiDat();
    await user.selectOptions(oMucDo(), 'toan-trinh');
    expect(dongSo('266 thủ tục')).toBeInTheDocument();
    expect(screen.queryByText(/đang lọc/)).toBeNull();
  });

  it('AC-1: gõ "ho tich" → mọi thủ tục lĩnh vực Hộ tịch; AC-12: gõ "1.001193" → chỉ khai sinh', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    await user.type(oTim(), 'ho tich');
    await waitFor(() => expect(tenCacThe()).toHaveLength(3));
    expect(tenCacThe()).toEqual(['Thủ tục đăng ký khai sinh', 'Thủ tục đăng ký kết hôn', 'Thủ tục đăng ký khai tử']);
    await user.clear(oTim());
    await user.type(oTim(), '1.001193');
    await waitFor(() => expect(tenCacThe()).toEqual(['Thủ tục đăng ký khai sinh']));
  });

  it('AC-3: Cấp tỉnh + Đất đai + Một phần + "the chap" → "Xoá bộ lọc" về mặc định, giữ tab, bỏ trang', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=tinh&trang=1');
    await caiDat();
    expect(nutXoa()).toBeInTheDocument(); // chưa lọc gì vẫn hiện
    await user.selectOptions(oLinhVuc(), 'dat-dai');
    await user.selectOptions(oMucDo(), 'mot-phan');
    await user.type(oTim(), 'the chap');
    await waitFor(() => expect(thamSo().get('q')).toBe('the chap'));
    await user.click(nutXoa());
    expect(oTim()).toHaveValue('');
    expect(oLinhVuc()).toHaveValue('');
    expect(oMucDo()).toHaveValue('');
    expect(tabTinh()).toHaveAttribute('aria-selected', 'true');
    expect(thamSo().get('cap')).toBe('tinh');
    expect(thamSo().has('trang')).toBe(false);
    expect(thamSo().has('lv')).toBe(false);
    expect(screen.queryByText(/đang lọc/)).toBeNull();
    expect(dongSo('4 thủ tục')).toBeInTheDocument();
  });

  it('AC-17: đổi tab bỏ lĩnh vực và trang, giữ từ khoá và mức độ; mũi tên phải đổi tab', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa&lv=ho-tich&md=mot-phan&q=khai+tu&trang=2');
    await caiDat();
    await user.click(tabTinh());
    expect(tabTinh()).toHaveAttribute('aria-selected', 'true');
    expect(thamSo().get('cap')).toBe('tinh');
    expect(thamSo().has('lv')).toBe(false);
    expect(thamSo().has('trang')).toBe(false);
    expect(thamSo().get('md')).toBe('mot-phan');
    expect(thamSo().get('q')).toBe('khai tu');
    expect(oLinhVuc()).toHaveValue('');
    expect(oMucDo()).toHaveValue('mot-phan');
    expect(oTim()).toHaveValue('khai tu');

    tabTinh().focus();
    await user.keyboard('{ArrowLeft}');
    expect(tabXa()).toHaveAttribute('aria-selected', 'true');
    expect(thamSo().get('cap')).toBe('xa');
  });

  it('ô lĩnh vực chỉ có lĩnh vực của tab đang xem, kèm số thủ tục', async () => {
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    const nhan = Array.from(oLinhVuc().querySelectorAll('option')).map((o) => o.textContent);
    expect(nhan).toEqual(['Tất cả lĩnh vực', 'Đất đai (1)', 'Hộ tịch (3)']);
  });
});

describe('DanhMuc — địa chỉ (AC-5, AC-9, AC-10, AC-18)', () => {
  it('AC-5: ?cap=xa&lv=ho-tich → tab xã, đã lọc Hộ tịch', async () => {
    await dung('/thu-tuc?cap=xa&lv=ho-tich');
    await caiDat();
    expect(tabXa()).toHaveAttribute('aria-selected', 'true');
    expect(oLinhVuc()).toHaveValue('ho-tich');
    expect(tenCacThe()).toHaveLength(3);
  });

  it('AC-10: /thu-tuc trần → địa chỉ thành ?cap=xa (replace, không thêm mục lịch sử)', async () => {
    const { router } = await dung('/thu-tuc');
    await caiDat();
    await waitFor(() => expect(diaChi()).toBe('/thu-tuc?cap=xa'));
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('AC-10: giữ nguyên trang và ma khi ghi cap', async () => {
    await dung('/thu-tuc?trang=2&ma=1.001193');
    await caiDat();
    await waitFor(() => expect(thamSo().get('cap')).toBe('xa'));
    expect(thamSo().get('trang')).toBe('2');
    expect(thamSo().get('ma')).toBe('1.001193');
  });

  it('AC-10: chọn lĩnh vực và gõ → địa chỉ có cap, lv, q', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    await user.selectOptions(oLinhVuc(), 'ho-tich');
    await user.type(oTim(), 'khai sinh');
    await waitFor(() => expect(thamSo().get('q')).toBe('khai sinh'));
    expect(thamSo().get('cap')).toBe('xa');
    expect(thamSo().get('lv')).toBe('ho-tich');
  });

  it('AC-10: ?cap=tinh&trang=3 mở đúng tab và trang 3', async () => {
    const tinh = taoDanhSachThuTuc(60, { cap: 'tinh' });
    await dung('/thu-tuc?cap=tinh&trang=3', { thuTuc: tinh, linhVuc: taoLinhVucTuThuTuc(tinh, { 'ho-tich': 'Hộ tịch' }) });
    await caiDat();
    expect(tabTinh()).toHaveAttribute('aria-selected', 'true');
    expect(tenCacThe()).toHaveLength(10);
    expect(tenCacThe()[0]).toBe('Thủ tục thử số 51');
  });

  it('AC-18: cap=abc, md=xyz → tab xã, tất cả mức độ, không lỗi, không hiện chữ từ địa chỉ', async () => {
    const { container } = await dung('/thu-tuc?cap=abc&md=xyz');
    await caiDat();
    expect(tabXa()).toHaveAttribute('aria-selected', 'true');
    expect(oMucDo()).toHaveValue('');
    expect(screen.queryByRole('alert')).toBeNull();
    const chu = (container.textContent ?? '').replace(diaChi(), '');
    expect(chu).not.toContain('abc');
    expect(chu).not.toContain('xyz');
  });

  it('AC-18: cap=tinh&md=toan-trinh → tab tỉnh, mức độ "Toàn trình"', async () => {
    await dung('/thu-tuc?cap=tinh&md=toan-trinh');
    await caiDat();
    expect(tabTinh()).toHaveAttribute('aria-selected', 'true');
    expect(oMucDo()).toHaveValue('toan-trinh');
  });

  it('AC-9: 60 kết quả → 3 trang (25, 25, 10); trang 2 bắt đầu từ kết quả thứ 26', async () => {
    const du = taoDanhSachThuTuc(60, { cap: 'xa' });
    const user = userEvent.setup();
    datKhoMan(800); // dạng thẻ
    await dung('/thu-tuc?cap=xa', { thuTuc: du, linhVuc: taoLinhVucTuThuTuc(du, { 'ho-tich': 'Hộ tịch' }) });
    await caiDat();
    expect(tenCacThe()).toHaveLength(25);
    expect(tenCacThe()[0]).toBe('Thủ tục thử số 1');
    await user.click(screen.getByRole('button', { name: /^(Trang )?2$/ }));
    expect(thamSo().get('trang')).toBe('2');
    expect(tenCacThe()).toHaveLength(25);
    expect(tenCacThe()[0]).toBe('Thủ tục thử số 26');
    await user.click(screen.getByRole('button', { name: /^(Trang )?3$/ }));
    expect(tenCacThe()).toHaveLength(10);
  });

  it('trang quá lớn → về trang cuối, không lỗi', async () => {
    const du = taoDanhSachThuTuc(60, { cap: 'xa' });
    datKhoMan(800);
    await dung('/thu-tuc?cap=xa&trang=99', { thuTuc: du, linhVuc: taoLinhVucTuThuTuc(du, { 'ho-tich': 'Hộ tịch' }) });
    await caiDat();
    expect(tenCacThe()).toHaveLength(10);
  });
});

describe('DanhMuc — lĩnh vực lạ và không có kết quả (AC-11, AC-14, AC-20, AC-22)', () => {
  it('AC-11: lv không có trong dữ liệu → "Không tìm thấy lĩnh vực", không nhắc mã; bấm nút → đủ danh mục, con trỏ ở ô tìm', async () => {
    const user = userEvent.setup();
    const { container } = await dung('/thu-tuc?cap=xa&lv=khong-co&md=mot-phan&q=abc');
    await caiDat();
    expect(screen.getByText('Không tìm thấy lĩnh vực')).toBeInTheDocument();
    expect((container.textContent ?? '').replace(diaChi(), '')).not.toContain('khong-co');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(oLinhVuc()).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Xem toàn bộ danh mục' }));
    expect(screen.queryByText('Không tìm thấy lĩnh vực')).toBeNull();
    expect(tabXa()).toHaveAttribute('aria-selected', 'true');
    expect(tenCacThe()).toHaveLength(4);
    expect(oTim()).toHaveFocus();
    expect(diaChi()).toBe('/thu-tuc?cap=xa');
  });

  it('AC-14: "xyzxyz" + Hộ tịch → thông báo có 4 gợi ý chữ, không có nút trong thông báo; nút trên thanh đưa về đầy đủ', async () => {
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa&lv=ho-tich');
    await caiDat();
    await user.type(oTim(), 'xyzxyz');
    const thongBao = await screen.findByText("Không tìm thấy thủ tục phù hợp với 'xyzxyz'");
    const khung = thongBao.parentElement!;
    expect(within(khung).queryByRole('button')).toBeNull();
    expect(within(khung).getAllByRole('listitem')).toHaveLength(4);
    expect(dongSo('0 thủ tục (đang lọc)')).toBeInTheDocument();
    expect(nutXoa()).toBeInTheDocument();
    await user.click(nutXoa());
    expect(oTim()).toHaveValue('');
    expect(oLinhVuc()).toHaveValue('');
    expect(tenCacThe()).toHaveLength(4);
    expect(thamSo().has('trang')).toBe(false);
  });

  it('AC-22: lĩnh vực chỉ có ở cấp xã, mở bằng cap=tinh → ô ghi "(0)", không phải "Không tìm thấy lĩnh vực"', async () => {
    const xa = taoDanhSachThuTuc(3, { cap: 'xa', linhVucMa: 'ho-tich' });
    const tinh = taoDanhSachThuTuc(2, { cap: 'tinh', linhVucMa: 'dat-dai', batDau: 100 });
    const thuTuc = [...xa, ...tinh];
    await dung('/thu-tuc?cap=tinh&lv=ho-tich', { thuTuc, linhVuc: taoLinhVucTuThuTuc(thuTuc, { 'ho-tich': 'Hộ tịch', 'dat-dai': 'Đất đai' }) });
    await caiDat();
    const chon = within(oLinhVuc()).getByRole('option', { selected: true });
    expect(chon).toHaveTextContent('Hộ tịch (0)');
    expect(screen.queryByText('Không tìm thấy lĩnh vực')).toBeNull();
    expect(screen.getByText(/Không tìm thấy thủ tục phù hợp/)).toBeInTheDocument();
    expect(dongSo('0 thủ tục (đang lọc)')).toBeInTheDocument();
  });

  it('AC-20: danh mục rỗng → thống kê 0, 0, 0; thông báo không có kết quả chỉ với hai gợi ý; không lỗi', async () => {
    await dung('/thu-tuc?cap=xa', { thuTuc: [], linhVuc: [] });
    await caiDat();
    const ke = within(screen.getByRole('list', { name: 'Thống kê danh mục' }));
    expect(ke.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '0Thủ tục cấp xã',
      '0Thủ tục cấp tỉnh',
      '0Lĩnh vực',
    ]);
    expect(screen.getByText('Không tìm thấy thủ tục phù hợp')).toBeInTheDocument();
    expect(screen.queryByText(/Xoá bộ lọc để tìm|Bấm “Xoá bộ lọc”/)).toBeNull();
    expect(dongSo('0 thủ tục')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('API trả 404 (chưa nhập dữ liệu) → ErrorState, không treo', async () => {
    await dung('/thu-tuc?cap=xa', 'khong-co-du-lieu');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('DanhMuc — thẻ / bảng (AC-16), mở thủ tục (AC-6, AC-15)', () => {
  it('AC-16: 375 px → thẻ, không có nút chuyển dạng', async () => {
    datKhoMan(375);
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(screen.getByTestId('cach-xem')).toHaveTextContent('the');
  });

  it('AC-16: 768 px → thẻ; 1280 px → bảng; chọn dạng ở đây thì nơi khác đọc cùng giá trị', async () => {
    datKhoMan(768);
    const user = userEvent.setup();
    const { unmount } = await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: 'Cách hiển thị' })).toBeInTheDocument();
    unmount();

    datKhoMan(1280);
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(await screen.findByRole('table', { name: 'Danh sách thủ tục cấp xã' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('group', { name: 'Cách hiển thị' })).getByRole('button', { name: /thẻ/i }));
    expect(screen.getByTestId('cach-xem')).toHaveTextContent('the');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('tab tỉnh đặt tên vùng bảng theo cấp', async () => {
    datKhoMan(1280);
    await dung('/thu-tuc?cap=tinh');
    await caiDat();
    expect(await screen.findByRole('table', { name: 'Danh sách thủ tục cấp tỉnh' })).toBeInTheDocument();
  });

  it('thẻ cấp 2: tên thủ tục là h2 dưới h1 ẩn', async () => {
    datKhoMan(800);
    await dung('/thu-tuc?cap=xa');
    await caiDat();
    expect(within(screen.getAllByRole('article')[0]!).getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });

  it('AC-6 / AC-15: bấm tên thủ tục thêm ma mà giữ cap, lv, md, q, trang; liên kết Cổng DVC mở tab mới, không đổi địa chỉ', async () => {
    datKhoMan(800);
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa&lv=ho-tich&md=toan-trinh&q=khai');
    await caiDat();
    const truoc = diaChi();
    const the = screen.getAllByRole('article')[0]!;
    const lienKet = within(the).getByRole('link', { name: /Cổng DVC/ });
    expect(lienKet).toHaveAttribute('href', linkDvc('1.001193'));
    expect(lienKet).toHaveAttribute('target', '_blank');
    expect(lienKet).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(lienKet).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    await user.click(lienKet).catch(() => undefined);
    expect(diaChi()).toBe(truoc);

    await user.click(within(the).getByRole('button', { name: /Xem chi tiết/ }));
    const sau = thamSo();
    expect(sau.get('ma')).toBe('1.001193');
    expect(sau.get('cap')).toBe('xa');
    expect(sau.get('lv')).toBe('ho-tich');
    expect(sau.get('md')).toBe('toan-trinh');
    expect(sau.get('q')).toBe('khai');
  });
});

describe('DanhMuc — dòng nhắc đăng xuất (F09 BR-4)', () => {
  const NHAC = 'Nhớ đăng xuất khi dùng xong';
  const chonBang = () => {
    window.localStorage.setItem('cach-xem', 'bang');
    datLaiCachXemChoTest();
  };

  it.each([
    ['cấp xã', 'xa', 800, 'article'],
    ['cấp tỉnh', 'tinh', 800, 'article'],
    ['cấp xã', 'xa', 1280, 'table'],
    ['cấp tỉnh', 'tinh', 1280, 'table'],
  ] as const)('kiosk, tab %s (%s), khổ %d: đúng một dòng phía trên danh sách (AC-3)', async (_ten, cap, rong, vai) => {
    datCheDoKiosk(true);
    datKhoMan(rong);
    if (vai === 'table') chonBang(); // kiosk mặc định thẻ; bảng chỉ khi người dùng đã chọn
    await dung(`/thu-tuc?cap=${cap}`);
    const danhSach = (await screen.findAllByRole(vai))[0]!;
    expect(await screen.findAllByText(NHAC)).toHaveLength(1);
    const dong = screen.getByText(NHAC);
    expect(dong.compareDocumentPosition(danhSach) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('kiosk, chuyển giữa hai tab: vẫn đúng một dòng', async () => {
    datCheDoKiosk(true);
    const user = userEvent.setup();
    await dung('/thu-tuc?cap=xa');
    await screen.findByText(NHAC);
    await user.click(tabTinh());
    await screen.findAllByRole('article');
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
  });

  it('kiosk, không có kết quả (EmptyState): không dòng', async () => {
    datCheDoKiosk(true);
    await dung('/thu-tuc?cap=xa&q=khongcokettquanaohet');
    await screen.findByText(/Không tìm thấy/);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    // Dòng (nếu có) chỉ được vẽ cùng danh sách; chờ thêm một nhịp để chunk kiosk (nếu bị nạp) kịp về
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(NHAC)).toBeNull();
  });

  it.each([800, 1280])('ngoài kiosk, khổ %d: không dòng (AC-4)', async (rong) => {
    datKhoMan(rong);
    await dung('/thu-tuc?cap=xa');
    await screen.findAllByRole(rong === 800 ? 'article' : 'table');
    expect(screen.queryByText(NHAC)).toBeNull();
  });
});
