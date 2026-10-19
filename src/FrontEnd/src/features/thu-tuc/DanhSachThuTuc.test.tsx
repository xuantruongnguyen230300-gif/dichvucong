import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ThuTucDanhMuc } from '../../core/api/danhMucThuTuc';
import { datKhoMan } from '../../test-utils/khoMan';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { napNgonNguThuTuc } from './i18n';
import khungNhac from './KhungNhacKiosk.module.css';
import { linkDvc } from './linkDvc';
import { CHI_TIET_KHAI_SINH, DiaChiHienTai, dungTrongRouter, giaFetchChiTiet } from './thuTucMau';
import { taoMuc } from './thuongGapMau';
import type { MucThuTuc } from './types';

// Bắt buộc: khai báo chỉ để kiểm lúc biên dịch rằng thủ tục của danh mục (F04) gán được cho kiểu của F03
// theo cấu trúc, nên F04 không phải import kiểu của F03 và ngược lại.
const kiemTraGanDuoc = (d: ThuTucDanhMuc): MucThuTuc => d;

beforeAll(async () => {
  await napNgonNguThuTuc();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const DU_LIEU: MucThuTuc[] = [
  taoMuc({ ma: '1.001193', ten: 'Thủ tục đăng ký khai sinh' }),
  taoMuc({ ma: '1.000894', ten: 'Thủ tục đăng ký kết hôn', mucDo: 'mot-phan', thoiHan: null, coQuanThucHien: null }),
];

function dung(tuyChon: { cachXem?: 'the' | 'bang'; capTieuDeThe?: 2 | 3 } = {}) {
  return dungTrongRouter(
    <div>
      <DanhSachThuTuc
        duLieu={DU_LIEU}
        cachXem={tuyChon.cachXem ?? 'the'}
        tieuDeBang="Danh sách thử"
        soMucMoiTrang={12}
        trang={null}
        onDoiTrang={() => undefined}
        {...(tuyChon.capTieuDeThe ? { capTieuDeThe: tuyChon.capTieuDeThe } : {})}
      />
      <DiaChiHienTai />
    </div>,
  );
}

describe('DanhSachThuTuc', () => {
  it('ThuTucDanhMuc của danh mục gán được cho MucThuTuc', () => {
    expect(typeof kiemTraGanDuoc).toBe('function');
  });

  it('dạng thẻ: tiêu đề tên mặc định h3, capTieuDeThe=2 → h2 (F04 dùng dưới h1)', () => {
    const { unmount } = dung();
    expect(within(screen.getAllByRole('article')[0]!).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Thủ tục đăng ký khai sinh',
    );
    unmount();
    dung({ capTieuDeThe: 2 });
    expect(within(screen.getAllByRole('article')[0]!).getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('thẻ: mức độ, thời hạn, và không hiện thời hạn khi null', () => {
    dung();
    const [khaiSinh, ketHon] = screen.getAllByRole('article');
    expect(within(khaiSinh!).getByText('Toàn trình')).toBeInTheDocument();
    expect(within(khaiSinh!).getByText('Thời hạn: 5 ngày làm việc')).toBeInTheDocument();
    expect(within(ketHon!).getByText('Một phần')).toBeInTheDocument();
    expect(within(ketHon!).queryByText(/Thời hạn/)).toBeNull();
  });

  it('mỗi thẻ đúng một liên kết Cổng DVC, href bằng linkDvc', () => {
    dung();
    for (const [i, the] of screen.getAllByRole('article').entries()) {
      const lienKet = within(the).getAllByRole('link');
      expect(lienKet).toHaveLength(1);
      expect(lienKet[0]).toHaveAttribute('href', linkDvc(DU_LIEU[i]!.ma));
    }
  });

  it('liên kết Cổng DVC có tên truy cập khác nhau theo thủ tục (WCAG 2.4.4), ở thẻ và ở bảng', async () => {
    const { unmount } = dung();
    const the = screen.getAllByRole('link');
    expect(the[0]).toHaveAccessibleName('Xem và nộp trên Cổng DVC — Thủ tục đăng ký khai sinh (mở trang mới)');
    expect(the[1]).toHaveAccessibleName('Xem và nộp trên Cổng DVC — Thủ tục đăng ký kết hôn (mở trang mới)');
    unmount();
    dung({ cachXem: 'bang' });
    const bang = await screen.findByRole('table');
    const lienKet = within(bang).getAllByRole('link');
    expect(lienKet[0]).toHaveAccessibleName('Xem và nộp trên Cổng DVC — Thủ tục đăng ký khai sinh (mở trang mới)');
    expect(lienKet[1]).toHaveAccessibleName('Xem và nộp trên Cổng DVC — Thủ tục đăng ký kết hôn (mở trang mới)');
  });

  it('mức độ lạ từ API: không hiện huy hiệu mức độ và không lộ khoá i18n (thẻ và bảng)', async () => {
    const lap = [taoMuc({ ma: '9.999999', ten: 'Thủ tục thử', mucDo: 'khac' as unknown as MucThuTuc['mucDo'] })];
    const ve = (cachXem: 'the' | 'bang') =>
      dungTrongRouter(
        <DanhSachThuTuc duLieu={lap} cachXem={cachXem} tieuDeBang="Danh sách thử" soMucMoiTrang={12} trang={null} onDoiTrang={() => undefined} />,
      );
    const { unmount } = ve('the');
    expect(screen.getByRole('article').textContent).not.toMatch(/muc-do|khac/);
    unmount();
    ve('bang');
    const bang = await screen.findByRole('table');
    expect(bang.textContent).not.toMatch(/muc-do|khac/);
  });

  it('liên kết Cổng DVC có tên truy cập khác nhau theo thủ tục (WCAG 2.4.4), ở thẻ và ở bảng', async () => {
    const { unmount } = dung();
    const tenThe = screen.getAllByRole('link').map((l) => l.textContent);
    expect(new Set(tenThe).size).toBe(2);
    expect(screen.getAllByRole('link')[0]).toHaveAccessibleName(
      'Xem và nộp trên Cổng DVC — Thủ tục đăng ký khai sinh (mở trang mới)',
    );
    unmount();
    dung({ cachXem: 'bang' });
    const bang = await screen.findByRole('table');
    const ten = within(bang).getAllByRole('link').map((l) => l.textContent);
    expect(new Set(ten).size).toBe(2);
    expect(within(bang).getAllByRole('link')[1]).toHaveAccessibleName(
      'Xem và nộp trên Cổng DVC — Thủ tục đăng ký kết hôn (mở trang mới)',
    );
  });

  it('mức độ lạ từ API: không hiện huy hiệu mức độ và không lộ khoá i18n (thẻ và bảng)', async () => {
    const lap = [taoMuc({ ma: '9.999999', ten: 'Thủ tục thử', mucDo: 'khac' as unknown as MucThuTuc['mucDo'] })];
    const veLap = (cachXem: 'the' | 'bang') =>
      dungTrongRouter(
        <DanhSachThuTuc duLieu={lap} cachXem={cachXem} tieuDeBang="Danh sách thử" soMucMoiTrang={12} trang={null} onDoiTrang={() => undefined} />,
      );
    const { unmount } = veLap('the');
    expect(screen.getByRole('article').textContent).not.toMatch(/muc-do|khac/);
    unmount();
    veLap('bang');
    const bang = await screen.findByRole('table');
    expect(bang.textContent).not.toMatch(/muc-do.khac/);
  });

  it('dạng bảng: ô cơ quan trống hiện "—"; mỗi dòng một liên kết Cổng DVC', async () => {
    dung({ cachXem: 'bang' });
    const bang = await screen.findByRole('table', { name: 'Danh sách thử' });
    const hang = within(bang).getAllByRole('row').slice(1);
    expect(hang).toHaveLength(2);
    expect(within(hang[0]!).getAllByRole('cell')[5]).toHaveTextContent('Ủy ban nhân dân cấp xã');
    expect(within(hang[1]!).getAllByRole('cell')[5]).toHaveTextContent('—');
    for (const h of hang) expect(within(h).getAllByRole('link')).toHaveLength(1);
  });

  it('nút "Xem chi tiết" có tên đọc bắt đầu bằng chữ nhìn thấy và nêu thủ tục', () => {
    dung();
    const nut = screen.getAllByRole('button', { name: /^Xem chi tiết/ })[0]!;
    expect(nut).toHaveAccessibleName('Xem chi tiết Thủ tục đăng ký khai sinh');
    expect(nut).toHaveTextContent('Xem chi tiết');
  });
});

describe('DanhSachThuTuc: nạp trước', () => {
  it('nhấn xuống "Xem chi tiết" hoặc nhận con trỏ thì nạp trước chi tiết; rê chuột thì không', async () => {
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    const user = userEvent.setup();
    dung();
    const nut = screen.getAllByRole('button', { name: /^Xem chi tiết/ })[0]!;
    await user.hover(nut);
    expect(fetchGia).not.toHaveBeenCalled();
    fireEvent.pointerDown(nut);
    await waitFor(() => expect(fetchGia).toHaveBeenCalledTimes(1));
    expect(String(fetchGia.mock.calls[0]![0])).toBe('/api/thu-tuc/1.001193');

    const nutKetHon = screen.getAllByRole('button', { name: /^Xem chi tiết/ })[1]!;
    nutKetHon.focus();
    await waitFor(() => expect(fetchGia).toHaveBeenCalledTimes(2));
    expect(String(fetchGia.mock.calls[1]![0])).toBe('/api/thu-tuc/1.000894');
  });

  it('không có bộ đếm giờ nạp trước chunk popup; rê chuột vào nút thì nạp chunk popup, không gọi API chi tiết', () => {
    const mo = vi.spyOn(window, 'setTimeout');
    const fetchGia = giaFetchChiTiet([CHI_TIET_KHAI_SINH]);
    dung();
    expect(mo.mock.calls.filter((c) => c[1] === 2000)).toHaveLength(0);
    mo.mockRestore();
    fireEvent.pointerEnter(screen.getAllByRole('button', { name: /^Xem chi tiết/ })[0]!);
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('bấm tên thủ tục trong bảng mở popup bằng ma trên địa chỉ', async () => {
    datKhoMan(1280);
    const user = userEvent.setup();
    dung({ cachXem: 'bang' });
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Thủ tục đăng ký kết hôn' }));
    expect(screen.getByTestId('dia-chi').textContent).toBe('/?ma=1.000894');
  });
});

describe('DanhSachThuTuc: dòng nhắc đăng xuất (F09 BR-4)', () => {
  const NHAC = 'Nhớ đăng xuất khi dùng xong';

  it('kiosk, dạng thẻ: đúng MỘT dòng, đứng trước danh sách, không lặp từng thẻ (AC-3)', async () => {
    datCheDoKiosk(true);
    dung();
    const dong = await screen.findByText(NHAC);
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(dong.compareDocumentPosition(screen.getAllByRole('article')[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('kiosk, dạng bảng: đúng MỘT dòng, nằm ngoài bảng', async () => {
    datCheDoKiosk(true);
    datKhoMan(1280);
    dung({ cachXem: 'bang' });
    const bang = await screen.findByRole('table');
    const dong = await screen.findByText(NHAC);
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
    expect(bang).not.toContainElement(dong);
  });

  it('kiosk: dòng nhắc nằm trong khung giữ chỗ một dòng có sẵn từ lần vẽ đầu (chunk kiosk về sau không đẩy danh sách, CLS)', async () => {
    datCheDoKiosk(true);
    const { container } = dung();
    // Ngay lần vẽ đầu, khi chunk kiosk có thể chưa về: khung giữ chỗ đã đứng ngay trên danh sách
    const giuCho = container.querySelector(`.${khungNhac.giuCho!}`);
    expect(giuCho).not.toBeNull();
    expect(giuCho!.nextElementSibling).toContainElement(await screen.findAllByRole('article').then((a) => a[0]!));
    expect(giuCho).toContainElement(await screen.findByText(NHAC));
  });

  it('ngoài kiosk: không có khung giữ chỗ (không chừa dòng trống)', async () => {
    const { container } = dung();
    await screen.findAllByRole('article');
    expect(container.querySelector(`.${khungNhac.giuCho!}`)).toBeNull();
  });

  it('dòng nhắc không phải liên kết và không tab được', async () => {
    datCheDoKiosk(true);
    dung();
    const dong = await screen.findByText(NHAC);
    expect(dong.closest('a, button, [tabindex]')).toBeNull();
  });

  it.each(['the', 'bang'] as const)('ngoài kiosk, dạng %s: không dòng nào (AC-4)', async (cachXem) => {
    datKhoMan(1280);
    dung({ cachXem });
    await screen.findAllByRole(cachXem === 'bang' ? 'table' : 'article');
    expect(screen.queryByText(NHAC)).toBeNull();
  });
});
