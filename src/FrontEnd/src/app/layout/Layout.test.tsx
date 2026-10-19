import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHI_TIET_KHAI_SINH } from '../../features/thu-tuc/thuTucMau';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';
import { Skeleton } from '../../core/components/Skeleton';
import { renderApp } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { cacTuyen } from '../routes';
import { Layout } from './Layout';
import { LoiTrang } from './LoiTrang';
import { handleTrang } from './useKhoaTrang';

// Bọc `napGiaoDienKiosk` thật bằng spy: ngoài kiosk phải không có lần nạp nào (F09 AC-4)
const { napKiosk } = vi.hoisted(() => ({ napKiosk: vi.fn() }));
vi.mock('../../core/kiosk/napGiaoDien', async (goc) => {
  const m = await goc<typeof import('../../core/kiosk/napGiaoDien')>();
  napKiosk.mockImplementation(m.napGiaoDienKiosk);
  return { napGiaoDienKiosk: napKiosk };
});

beforeEach(() => {
  napKiosk.mockClear();
  document.head.innerHTML = '';
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Layout — khung chung (AC-1, AC-4, AC-9)', () => {
  it('có đủ vùng: đầu trang, điều hướng, nội dung, chân trang; Tab đầu tiên vào liên kết bỏ qua', async () => {
    const user = userEvent.setup();
    renderApp(cacTuyen, { duongDan: '/thu-tuc', trungTam: TRUNG_TAM_THU });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole('link', { name: 'Bỏ qua, tới nội dung chính' })).toHaveFocus();
  });

  it('thứ tự Tab = thứ tự đọc: bỏ qua → tên Trung tâm → 3 mục điều hướng → nội dung → chân trang', async () => {
    const user = userEvent.setup();
    renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    await screen.findByText(/^©/);
    const dich: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      await user.tab();
      dich.push(document.activeElement?.getAttribute('href') ?? null);
    }
    // bỏ qua → tên Trung tâm → Trang chủ → Danh mục → Lĩnh vực → nút đầu tiên trong nội dung (trang 404)
    expect(dich).toEqual(['#noi-dung', '/', '/', '/thu-tuc', '/linh-vuc', '/']);
    expect(document.activeElement).toHaveAccessibleName('Về trang chủ');
  });

  it('Enter trên liên kết bỏ qua: con trỏ vào <main>, địa chỉ không đổi (BR-12)', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(cacTuyen, { duongDan: '/thu-tuc', trungTam: TRUNG_TAM_THU });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/thu-tuc');
  });

  it('đầu và chân trang nằm ngoài <main> (trạng thái tải chỉ ở vùng nội dung)', () => {
    renderApp(cacTuyen, { duongDan: '/thu-tuc', trungTam: 'treo' });
    const main = screen.getByRole('main');
    expect(main).not.toContainElement(screen.getByRole('banner'));
    expect(main).not.toContainElement(screen.getByRole('navigation'));
    expect(main).not.toContainElement(screen.getByRole('contentinfo'));
  });
});

describe('popup chi tiết thủ tục dùng chung (F03 BR-5)', () => {
  // Nạp trước hai chunk nặng (trang chủ, popup): lần nạp đầu trong jsdom chậm, không để ca đầu tiên tốn thời gian chờ của chính nó
  beforeAll(async () => {
    await Promise.all([import('../../features/trang-chu/TrangChu'), import('../../features/thu-tuc/PopupChiTiet')]);
  }, 60_000);

  /** Chi tiết trả về ngay; mọi API khác (Trung tâm, danh mục) chưa trả lời để test chỉ nhìn popup. */
  const traChiTietNgay = (fetchGia: ReturnType<typeof renderApp>['fetchGia']) =>
    fetchGia.mockImplementation((dau) =>
      String(dau).startsWith('/api/thu-tuc/') ? Promise.resolve(Response.json(CHI_TIET_KHAI_SINH)) : new Promise<Response>(() => undefined),
    );

  it('địa chỉ không có ma: không có hộp thoại và không gọi API chi tiết', async () => {
    const { fetchGia } = renderApp(cacTuyen, { duongDan: '/', trungTam: 'treo' });
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchGia.mock.calls.map((c) => String(c[0])).filter((d) => d.startsWith('/api/thu-tuc/'))).toEqual([]);
  });

  it.each(['/?ma=1.001193', '/thu-tuc?ma=1.001193&lv=ho-tich', '/linh-vuc?ma=1.001193', '/abc-xyz?ma=1.001193'])(
    '%s mở popup đúng thủ tục',
    async (duongDan) => {
      // act có await: trang chủ nạp lười có thể treo lần vẽ đầu, React cần được chờ
      let fetchGia!: ReturnType<typeof renderApp>['fetchGia'];
      await act(async () => {
        fetchGia = renderApp(cacTuyen, { duongDan, trungTam: 'treo' }).fetchGia;
        traChiTietNgay(fetchGia);
      });
      expect(await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' })).toBeInTheDocument();
      expect(fetchGia.mock.calls.map((c) => String(c[0]))).toContain('/api/thu-tuc/1.001193');
    },
  );
});

describe('trang tạm và trang 404', () => {
  it.each([
    ['/thu-tuc', 'Danh mục thủ tục'],
    ['/linh-vuc', 'Lĩnh vực và mã QR'],
  ])('%s: có tiêu đề h1 của trang (danh mục nạp lười nên chờ)', async (duongDan, ten) => {
    renderApp(cacTuyen, { duongDan, trungTam: 'treo' });
    expect(await within(screen.getByRole('main')).findByRole('heading', { level: 1, name: ten })).toBeInTheDocument();
  });

  it('/abc-xyz: trang 404 có 2 liên kết dạng nút, đủ đầu trang, không nhắc lại địa chỉ (AC-9)', async () => {
    const user = userEvent.setup();
    const { router, container } = renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(main.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/');
    expect(main.getByRole('link', { name: 'Danh mục thủ tục' })).toHaveAttribute('href', '/thu-tuc');
    expect(main.queryByRole('button')).not.toBeInTheDocument(); // đi tới trang khác là liên kết
    expect(container.textContent).not.toContain('abc-xyz');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    await user.click(main.getByRole('link', { name: 'Danh mục thủ tục' }));
    expect(router.state.location.pathname).toBe('/thu-tuc');
  });

  it('trang chủ nạp lười, khung hiện trước (AC-13)', async () => {
    renderApp(cacTuyen, { duongDan: '/', trungTam: 'treo' });
    expect(screen.getByRole('banner')).toBeInTheDocument(); // khung có ngay, trang còn đang nạp
    expect(await screen.findByRole('heading', { level: 1, name: 'Tra cứu thủ tục hành chính' })).toBeInTheDocument();
  });
});

describe('lỗi trong trang (LoiTrang)', () => {
  const Hong = () => {
    throw new Error('Thông điệp nội bộ không được lộ');
  };
  const tuyenLoi = [
    {
      path: '/',
      Component: Layout,
      ErrorBoundary: LoiTrang,
      children: [{ index: true, Component: Hong, ErrorBoundary: LoiTrang, handle: handleTrang('trang-chu') }],
    },
  ];

  it('chỉ thay vùng nội dung: khung còn, câu thân thiện, không lộ thông điệp lỗi, có số gọi Trung tâm', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderApp(tuyenLoi, { duongDan: '/', trungTam: TRUNG_TAM_THU });
    const main = within(screen.getByRole('main'));
    expect(await main.findByRole('alert')).toHaveTextContent('Chưa tải được dữ liệu.');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('Thông điệp nội bộ');
    expect(main.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    await waitFor(() => expect(main.getByRole('link', { name: '0000.000.000' })).toHaveAttribute('href', 'tel:0000000000'));
  });

  it('chưa từng tải được dữ liệu Trung tâm thì ẩn số điện thoại', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderApp(tuyenLoi, { duongDan: '/', trungTam: 'loi-mang' });
    const main = within(screen.getByRole('main'));
    expect(await main.findByRole('alert')).toBeInTheDocument();
    expect(main.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('kiosk trong Layout (F09 BR-7)', () => {
  const TEN_NUT = 'Bắt đầu lại';

  it('ngoài kiosk: không có nút và không nạp chunk kiosk (AC-4, AC-8)', async () => {
    renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    await screen.findByText(/^©/);
    expect(screen.queryByRole('button', { name: TEN_NUT })).not.toBeInTheDocument();
    expect(napKiosk).not.toHaveBeenCalled();
  });

  it('kiosk: đúng một nút, con trực tiếp của <body>, có data-ngoai-popup, là phần tử Tab cuối sau chân trang (AC-8)', async () => {
    datCheDoKiosk(true);
    renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    const nut = await screen.findByRole('button', { name: TEN_NUT });
    expect(screen.getAllByRole('button', { name: TEN_NUT })).toHaveLength(1);
    expect(nut.parentElement).toBe(document.body);
    expect(nut).toHaveAttribute('data-ngoai-popup');
    const chanTrang = await screen.findByText(/^©/);
    // nút đứng sau chân trang trong thứ tự tài liệu
    expect(chanTrang.compareDocumentPosition(nut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const tabDuoc = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter(
      (e) => e.getAttribute('tabindex') !== '-1',
    );
    expect(tabDuoc[tabDuoc.length - 1]).toBe(nut);
  });

  it('kiosk: bấm 3 mục điều hướng không thêm mục lịch sử (REPLACE) — AC-7', async () => {
    const user = userEvent.setup();
    datCheDoKiosk(true);
    const { router } = renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    await screen.findByRole('button', { name: TEN_NUT });
    const dieuHuong = within(screen.getByRole('navigation', { name: 'Điều hướng chính' }));
    await user.click(dieuHuong.getByRole('link', { name: 'Lĩnh vực và mã QR' }));
    expect(router.state.location.pathname).toBe('/linh-vuc');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});

describe('nút Trợ lý trong Layout (F06 T10)', () => {
  const tabDuoc = () =>
    [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter(
      (e) => e.getAttribute('tabindex') !== '-1',
    );

  it('có nút "Trợ lý" ở mọi trang, đóng, trỏ tới khung; chưa bấm thì không có yêu cầu mạng mới', async () => {
    const { fetchGia } = renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    await screen.findByText(/^©/);
    const nut = screen.getByRole('button', { name: 'Trợ lý' });
    expect(nut).toHaveAttribute('aria-expanded', 'false');
    expect(nut).toHaveAttribute('aria-controls', 'khung-tro-ly');
    expect(nut.className).toMatch(/phai/);
    expect(document.getElementById('khung-tro-ly')).toBeNull();
    // chỉ có yêu cầu của đầu/chân trang (Trung tâm); khung, câu chữ và API trợ lý chưa được gọi
    expect(fetchGia.mock.calls.map((c) => String(c[0]))).toEqual(['/api/trung-tam']);
  });

  it('nút Trợ lý đứng sau chân trang, là phần tử Tab cuối trong khung trang; không phá thứ tự Tab trước đó', async () => {
    const user = userEvent.setup();
    renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    const chanTrang = await screen.findByText(/^©/);
    const nut = screen.getByRole('button', { name: 'Trợ lý' });
    expect(chanTrang.compareDocumentPosition(nut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const ds = tabDuoc();
    expect(ds[ds.length - 1]).toBe(nut);

    const dich: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      await user.tab();
      dich.push(document.activeElement?.getAttribute('href') ?? null);
    }
    expect(dich).toEqual(['#noi-dung', '/', '/', '/thu-tuc', '/linh-vuc', '/']);
  });

  it('kiosk: "Trợ lý" (phải) rồi "Bắt đầu lại" (trái) là hai phần tử Tab cuối; hai nút ở hai góc, không che nhau', async () => {
    datCheDoKiosk(true);
    renderApp(cacTuyen, { duongDan: '/abc-xyz', trungTam: TRUNG_TAM_THU });
    const lai = await screen.findByRole('button', { name: 'Bắt đầu lại' });
    const troLy = screen.getByRole('button', { name: 'Trợ lý' });
    const ds = tabDuoc();
    expect(ds.slice(-2)).toEqual([troLy, lai]);
    expect(troLy.className).toMatch(/phai/);
    expect(lai.className).toMatch(/trai/);
    expect(troLy.className).not.toMatch(/trai/);
    expect(lai.className).not.toMatch(/phai/);
  });
});

describe('chân trang ẩn khi trang còn khung chờ (CLS)', () => {
  const boc = () => screen.getByRole('contentinfo', { hidden: true }).parentElement as HTMLElement;
  const tuyenThu = (Trang: () => ReactNode): RouteObject[] => [
    { path: '/', Component: Layout, children: [{ index: true, Component: Trang }] },
  ];

  it('trang có khung chờ: chân trang nằm trong khối ẩn (gỡ khung chờ thì hiện lại: xem khungCho.test.tsx)', async () => {
    renderApp(
      tuyenThu(() => <Skeleton dang="the" />),
      { duongDan: '/', trungTam: TRUNG_TAM_THU },
    );
    expect(boc().className).toMatch(/chanTrangAn/);
  });

  it('trang không có khung chờ: chân trang hiện', async () => {
    renderApp(
      tuyenThu(() => <p>nội dung</p>),
      { duongDan: '/', trungTam: TRUNG_TAM_THU },
    );
    expect(boc().className).not.toMatch(/chanTrangAn/);
  });
});
