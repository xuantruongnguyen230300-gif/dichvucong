import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LinhVuc as LinhVucDto } from '../../core/api/linhVuc';
import { taoLinhVuc } from '../../test-utils/danhMucMau';
import { caiGiaoCat, type BoDieuKhienGiaoCat } from '../../test-utils/giaLapGiaoCat';
import { DiaChiHienTai, dungTrongRouter } from '../thu-tuc/thuTucMau';
import type { QuayLinhVuc } from './api/quayLinhVuc';
import { giaiMaQr } from './giaiMaQrThu';
import { napNgonNguLinhVuc } from './i18n';
import { LinhVuc } from './LinhVuc';

beforeAll(napNgonNguLinhVuc);

let giao: BoDieuKhienGiaoCat;
beforeEach(() => {
  giao = caiGiaoCat();
  giaFetch(BA_MUOI_LAM); // mặc định: đủ 75 lĩnh vực, chưa có phân công; test nào cần khác thì gọi lại
});
afterEach(() => {
  giao.go();
  vi.unstubAllGlobals();
});

/** 75 lĩnh vực như dữ liệu mẫu: 3 lĩnh vực có tên thật, 18 chỉ có thủ tục cấp tỉnh, còn lại có thủ tục xã. */
function taoBaMuoiLam(): LinhVucDto[] {
  const them = Array.from({ length: 72 }, (_, i) => {
    const so = String(i + 1).padStart(2, '0');
    return taoLinhVuc(`linh-vuc-thu-${so}`, `Linh vuc thu ${so}`, i < 18 ? 0 : 3, 2);
  });
  return [
    taoLinhVuc('chung-thuc', 'Chứng thực', 4, 0),
    taoLinhVuc('dat-dai', 'Đất đai', 10, 5),
    taoLinhVuc('ho-tich', 'Hộ tịch', 20, 3),
    ...them,
  ];
}
const BA_MUOI_LAM = taoBaMuoiLam();
const CHI_TINH = BA_MUOI_LAM.filter((l) => l.soThuTucXa === 0);

type KieuTraLoi<T> = T | 'loi-mang' | 'loi-he-thong' | 'treo';

function phanHoiLoi(status: number, code: string): Response {
  return new Response(JSON.stringify({ code, maTraCuu: 'AB12CD34' }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

/** Giả `fetch` cho hai API của trang; mỗi API có kiểu trả lời riêng. `giai*` trả lời yêu cầu đang treo. */
function giaFetch(linhVuc: KieuTraLoi<LinhVucDto[]>, quay: KieuTraLoi<QuayLinhVuc[]> = []) {
  const dangTreo: { duongDan: string; giai: () => void }[] = [];
  const traLoi = (duongDan: string, kieu: KieuTraLoi<unknown[]>, giaTriTreo?: unknown[]): Promise<Response> => {
    if (kieu === 'loi-mang') return Promise.reject(new TypeError('Failed to fetch'));
    if (kieu === 'loi-he-thong') return Promise.resolve(phanHoiLoi(500, 'loi-he-thong'));
    if (kieu === 'treo') {
      return new Promise<Response>((giai) => dangTreo.push({ duongDan, giai: () => giai(Response.json(giaTriTreo ?? [])) }));
    }
    return Promise.resolve(Response.json(kieu));
  };
  const fn = vi.fn<typeof fetch>().mockImplementation((dau) => {
    const duongDan = String(dau).split('?')[0] ?? '';
    if (duongDan === '/api/linh-vuc') return traLoi(duongDan, linhVuc, BA_MUOI_LAM);
    if (duongDan === '/api/linh-vuc/quay') return traLoi(duongDan, quay);
    return Promise.resolve(phanHoiLoi(404, 'khong-tim-thay'));
  });
  vi.stubGlobal('fetch', fn);
  return Object.assign(fn, {
    giaiTreo: (duongDan: string) =>
      dangTreo
        .splice(0)
        .filter((y) => y.duongDan === duongDan)
        .forEach((y) => y.giai()),
  });
}

/** Dựng trong `act` bất đồng bộ: lần vẽ đầu treo chờ câu chữ (`use`). */
async function dung(diaChi = '/linh-vuc') {
  let ket!: ReturnType<typeof dungTrongRouter>;
  await act(async () => {
    ket = dungTrongRouter(
      <>
        <LinhVuc />
        <DiaChiHienTai />
      </>,
      { diaChi },
    );
  });
  return ket;
}

const luoi = () => screen.findByRole('list', { name: 'Danh sách lĩnh vực' });
const cacO = () => within(screen.getByRole('list', { name: 'Danh sách lĩnh vực' })).getAllByRole('listitem');
const cacQr = (goc: ParentNode = document) => goc.querySelectorAll<SVGSVGElement>('svg[data-qr]');
const tenO = (o: HTMLElement) => within(o).getByRole('link').textContent;
const oTheoTen = (ten: string) => cacO().find((o) => tenO(o) === ten) as HTMLElement;
const oTim = () => screen.getByRole('searchbox', { name: 'Tìm lĩnh vực' });
const diaChi = () => screen.getByTestId('dia-chi').textContent ?? '';
const veXong = (so: number) => waitFor(() => expect(cacQr()).toHaveLength(so));

describe('LinhVuc — bố cục và tìm kiếm', () => {
  it('một h1 ẩn, tiêu đề mục, số lĩnh vực, ô tìm, dòng hướng dẫn, đủ 75 ô', async () => {
    await dung();
    await luoi();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Lĩnh vực và mã QR');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Lĩnh vực và mã QR');
    expect(screen.getByText('75 lĩnh vực')).toBeInTheDocument();
    expect(oTim()).toBeInTheDocument();
    expect(screen.getByText(/In mã QR dán tại quầy/)).toBeInTheDocument();
    expect(cacO()).toHaveLength(75);
  });

  it('mỗi ô có tên, "n cấp xã · m cấp tỉnh" và icon ẩn', async () => {
    await dung();
    await luoi();
    const o = oTheoTen('Hộ tịch');
    expect(within(o).getByText('20 cấp xã · 3 cấp tỉnh')).toBeInTheDocument();
    expect(within(oTheoTen('Linh vuc thu 01')).getByText('0 cấp xã · 2 cấp tỉnh')).toBeInTheDocument();
  });

  it('AC-1: gõ "dat dai" → ra "Đất đai"; số lĩnh vực đổi theo', async () => {
    const user = userEvent.setup();
    await dung();
    await luoi();
    await user.type(oTim(), 'dat dai');
    await waitFor(() => expect(cacO()).toHaveLength(1));
    expect(tenO(cacO()[0]!)).toBe('Đất đai');
    expect(screen.getByText('1 lĩnh vực')).toBeInTheDocument();
  });

  it('từ khoá ghi lên địa chỉ (?q=); mở lại địa chỉ đó thì ô tìm đã điền và lưới đã lọc', async () => {
    const user = userEvent.setup();
    const { unmount } = await dung();
    await luoi();
    await user.type(oTim(), 'ho tich');
    await waitFor(() => expect(diaChi()).toContain('q=ho+tich'));
    unmount();
    await dung('/linh-vuc?q=ho+tich');
    await luoi();
    expect(oTim()).toHaveValue('ho tich');
    expect(cacO().map(tenO)).toEqual(['Hộ tịch']);
  });

  it('không tìm thấy → EmptyState "lĩnh vực" có nút "Xoá bộ lọc"; bấm → ô tìm trống, con trỏ ở ô tìm, đủ 75 ô', async () => {
    const user = userEvent.setup();
    await dung();
    await luoi();
    await user.type(oTim(), 'xyzxyz');
    expect(await screen.findByText("Không tìm thấy lĩnh vực phù hợp với 'xyzxyz'")).toBeInTheDocument();
    expect(screen.getByText('0 lĩnh vực')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));
    expect(oTim()).toHaveValue('');
    expect(oTim()).toHaveFocus();
    expect(cacO()).toHaveLength(75);
  });

  it('dữ liệu rỗng → trang không lỗi, "0 lĩnh vực", thông báo không có lĩnh vực', async () => {
    giaFetch([]);
    await dung();
    expect(await screen.findByText('0 lĩnh vực')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Không tìm thấy lĩnh vực phù hợp')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Danh sách lĩnh vực' })).toBeNull();
  });
});

describe('LinhVuc — liên kết của ô (AC-3)', () => {
  it('bấm ô Chứng thực → danh mục cấp xã đã lọc Chứng thực', async () => {
    const user = userEvent.setup();
    await dung();
    await luoi();
    await user.click(within(oTheoTen('Chứng thực')).getByRole('link'));
    expect(diaChi()).toBe('/thu-tuc?cap=xa&lv=chung-thuc');
  });

  it('ô lĩnh vực chỉ có thủ tục cấp tỉnh → danh mục cấp tỉnh đã lọc lĩnh vực đó', async () => {
    const user = userEvent.setup();
    await dung();
    await luoi();
    const o = oTheoTen('Linh vuc thu 01');
    expect(within(o).getByRole('link')).toHaveAttribute('href', '/thu-tuc?cap=tinh&lv=linh-vuc-thu-01');
    await user.click(within(o).getByRole('link'));
    expect(diaChi()).toBe('/thu-tuc?cap=tinh&lv=linh-vuc-thu-01');
  });
});

describe('LinhVuc — QR chỉ vẽ cho ô đang hiện (BR-2, AC-5)', () => {
  it('chưa ô nào hiện → 0 QR; mỗi ô quan sát bằng rootMargin 0 trên chính ô, một observer chung', async () => {
    await dung();
    await luoi();
    expect(cacQr()).toHaveLength(0);
    expect(giao.options).toEqual([{ rootMargin: '0px', threshold: 0 }]);
    expect(giao.dangQuanSat()).toEqual(cacO());
  });

  it('hiện 3 ô → 3 QR; hiện thêm 2 → 5; hiện hết → 75, mỗi ô đúng một', async () => {
    await dung();
    await luoi();
    const o = cacO();
    act(() => o.slice(0, 3).forEach((x) => giao.hienRa(x)));
    await veXong(3);
    act(() => o.slice(3, 5).forEach((x) => giao.hienRa(x)));
    await veXong(5);
    act(() => giao.hienRaHet());
    await veXong(75);
    for (const x of cacO()) expect(cacQr(x)).toHaveLength(1);
    expect(new Set([...cacQr()].map((s) => s.getAttribute('data-qr'))).size).toBe(75);
  });

  it('ô đã hiện rồi ra khỏi màn hình → QR vẫn còn', async () => {
    await dung();
    await luoi();
    const dau = cacO()[0]!;
    act(() => giao.hienRa(dau));
    await veXong(1);
    act(() => giao.an(dau));
    expect(cacQr()).toHaveLength(1);
  });

  it('mỗi QR đã vẽ có dòng "Quét để xem thủ tục" ngay dưới mã (AC-8); ô chưa vẽ thì chưa có', async () => {
    await dung();
    await luoi();
    expect(screen.queryByText('Quét để xem thủ tục')).toBeNull();
    act(() => giao.hienRaHet());
    await veXong(75);
    expect(screen.getAllByText('Quét để xem thủ tục')).toHaveLength(75);
    const qr = cacQr(oTheoTen('Hộ tịch'))[0]!;
    expect(qr.parentElement?.lastElementChild).toHaveTextContent('Quét để xem thủ tục');
    expect(qr.nextElementSibling).toHaveTextContent('Quét để xem thủ tục');
  });

  it('lọc bớt ô: chỉ còn QR của ô còn lại', async () => {
    const user = userEvent.setup();
    await dung();
    await luoi();
    act(() => giao.hienRaHet());
    await veXong(75);
    await user.type(oTim(), 'chung thuc');
    await waitFor(() => expect(cacO()).toHaveLength(1));
    expect(cacQr()).toHaveLength(1);
  });
});

describe('LinhVuc — nội dung mã QR (AC-2, AC-7)', () => {
  async function veHet() {
    await dung();
    await luoi();
    act(() => giao.hienRaHet());
    await veXong(75);
  }

  it('đủ 75 QR; lĩnh vực chỉ cấp tỉnh giải ra cap=tinh và lv; có thủ tục xã giải ra cap=xa; cùng cấp với liên kết ô', async () => {
    await veHet();
    expect(CHI_TINH).toHaveLength(18);
    const goc = window.location.origin;
    for (const l of [CHI_TINH[0]!, CHI_TINH[17]!]) {
      const o = oTheoTen(l.ten);
      expect(giaiMaQr(cacQr(o)[0]!)).toBe(`${goc}/thu-tuc?cap=tinh&lv=${l.ma}`);
      expect(within(o).getByRole('link')).toHaveAttribute('href', `/thu-tuc?cap=tinh&lv=${l.ma}`);
    }
    const hoTich = oTheoTen('Hộ tịch');
    expect(giaiMaQr(cacQr(hoTich)[0]!)).toBe(`${goc}/thu-tuc?cap=xa&lv=ho-tich`);
    expect(within(hoTich).getByRole('link')).toHaveAttribute('href', '/thu-tuc?cap=xa&lv=ho-tich');
  });

  it('tên miền trong QR là tên miền đang mở trang: đổi sang địa chỉ khác thì QR đổi theo', async () => {
    vi.stubGlobal('location', new URL('https://tracuu.example.gov.vn/linh-vuc'));
    await veHet();
    expect(giaiMaQr(cacQr(oTheoTen('Hộ tịch'))[0]!)).toBe('https://tracuu.example.gov.vn/thu-tuc?cap=xa&lv=ho-tich');
  });

  it('QR có nhãn đọc được cho trình đọc màn hình', async () => {
    await veHet();
    expect(within(oTheoTen('Đất đai')).getByRole('img', { name: 'Mã QR của lĩnh vực Đất đai' })).toBeInTheDocument();
  });
});

describe('LinhVuc — quầy (BR-4, AC-6, AC-9)', () => {
  it('chưa có phân công → không ô nào có dòng quầy, không chữ thay thế, không phần tử rỗng', async () => {
    giaFetch(BA_MUOI_LAM, []);
    await dung();
    await luoi();
    act(() => giao.hienRaHet());
    await veXong(75);
    expect(screen.queryByText(/Quầy/)).toBeNull();
    expect(screen.queryByText(/Nộp tại Trung tâm/)).toBeNull();
    expect(screen.queryByText(/Chưa có thông tin quầy/)).toBeNull();
    // mỗi ô chỉ có đúng một đoạn <p>: chú thích dưới QR
    for (const o of cacO()) expect(o.querySelectorAll('p')).toHaveLength(1);
    expect(document.querySelectorAll('p:empty')).toHaveLength(0);
  });

  it('có phân công Hộ tịch quầy 3 → chỉ ô Hộ tịch có "Quầy 3", ô khác không có dòng quầy', async () => {
    giaFetch(BA_MUOI_LAM, [{ linhVucMa: 'ho-tich', quay: 3 }]);
    await dung();
    await luoi();
    expect(screen.getAllByText(/Quầy/)).toHaveLength(1);
    expect(within(oTheoTen('Hộ tịch')).getByText('Quầy 3')).toBeInTheDocument();
    expect(within(oTheoTen('Đất đai')).queryByText(/Quầy/)).toBeNull();
  });

  it('mã phân công không có trong danh sách lĩnh vực → bỏ qua, không lỗi', async () => {
    giaFetch(BA_MUOI_LAM, [{ linhVucMa: 'khong-co', quay: 9 }]);
    await dung();
    await luoi();
    expect(screen.queryByText(/Quầy/)).toBeNull();
  });

  it.each([['500', 'loi-he-thong'], ['mạng', 'loi-mang']] as const)(
    'AC-9: yêu cầu quầy lỗi (%s) → lưới và QR đủ, không dòng quầy, không thông báo lỗi',
    async (_ten, kieu) => {
      giaFetch(BA_MUOI_LAM, kieu);
      await dung();
      await luoi();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByText('Chưa tải được dữ liệu.')).toBeNull();
      act(() => giao.hienRaHet());
      await veXong(75);
      expect(cacO()).toHaveLength(75);
      expect(screen.queryByText(/Quầy/)).toBeNull();
      expect(document.querySelectorAll('p:empty')).toHaveLength(0);
    },
  );

  it('lưới chờ cả hai yêu cầu: danh sách về trước, quầy chưa về → vẫn khung chờ, chưa có ô', async () => {
    const fetchGia = giaFetch(BA_MUOI_LAM, 'treo');
    await dung();
    await screen.findByText('Đang tải…');
    await act(async () => {
      await new Promise((giai) => setTimeout(giai, 50)); // danh sách đã về, quầy còn treo
    });
    expect(screen.getByText('Đang tải…')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Danh sách lĩnh vực' })).toBeNull();
    await act(async () => fetchGia.giaiTreo('/api/linh-vuc/quay'));
    expect(await luoi()).toBeInTheDocument();
    expect(screen.queryByText('Đang tải…')).toBeNull();
  });
});

describe('LinhVuc — lỗi tải danh sách lĩnh vực (C01 BR-11, AC-9)', () => {
  it('chỉ yêu cầu danh sách lĩnh vực lỗi (mạng) → "Chưa tải được dữ liệu." và "Thử lại", không có mã tra cứu', async () => {
    giaFetch('loi-mang', [{ linhVucMa: 'ho-tich', quay: 3 }]);
    await dung();
    expect(await screen.findByRole('alert')).toHaveTextContent('Chưa tải được dữ liệu.');
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(screen.queryByText(/Mã tra cứu/)).toBeNull();
  });

  it('lỗi hệ thống → có mã tra cứu; thử lại thành công thì hiện lưới', async () => {
    const user = userEvent.setup();
    giaFetch('loi-he-thong');
    await dung();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Mã tra cứu: AB12CD34')).toBeInTheDocument();
    giaFetch(BA_MUOI_LAM);
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await luoi()).toBeInTheDocument();
    expect(cacO()).toHaveLength(75);
  });
});
