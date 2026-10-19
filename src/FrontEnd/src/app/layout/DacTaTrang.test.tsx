import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteObject } from 'react-router';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { useTieuDeTabTam } from '../../core/hooks/useTieuDeTab';
import { renderApp, type PhanHoiTrungTam } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { DacTaTrang } from './DacTaTrang';
import { handleTrang } from './useKhoaTrang';

const TIEU_DE_MAY_CHU = 'Tiêu đề máy chủ đã chèn';

const tuyen: RouteObject[] = [
  { path: '/', element: <DacTaTrang />, handle: handleTrang('trang-chu') },
  { path: '/thu-tuc', element: <DacTaTrang />, handle: handleTrang('danh-muc') },
  { path: '/linh-vuc', element: <DacTaTrang />, handle: handleTrang('linh-vuc') },
  { path: '*', element: <DacTaTrang />, handle: handleTrang('khong-tim-thay') },
];

const dung = (trungTam: PhanHoiTrungTam, duongDan = '/') => renderApp(tuyen, { trungTam, duongDan });
const voi = (thayDoi: Partial<ThongTinTrungTam>): ThongTinTrungTam => ({ ...TRUNG_TAM_THU, ...thayDoi });
const meta = (khoa: string) => document.head.querySelectorAll(`meta[name="${khoa}"], meta[property="${khoa}"]`);
const noiDung = (khoa: string) => meta(khoa)[0]?.getAttribute('content');

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = TIEU_DE_MAY_CHU;
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.head.innerHTML = '';
});

describe('DacTaTrang — tiêu đề tab (BR-9)', () => {
  it('có dữ liệu: "<Tên trang> – <Tên trung tâm>"', async () => {
    dung(TRUNG_TAM_THU, '/thu-tuc');
    await waitFor(() => expect(document.title).toBe('Danh mục thủ tục – Trung tâm thử A'));
  });

  it('bốn trang có bốn tiêu đề khác nhau', async () => {
    const { router } = dung(TRUNG_TAM_THU, '/');
    const tieuDe: string[] = [];
    await waitFor(() => expect(document.title).toBe('Trang chủ – Trung tâm thử A'));
    for (const duongDan of ['/', '/thu-tuc', '/linh-vuc', '/abc-xyz']) {
      await act(() => router.navigate(duongDan));
      await waitFor(() => expect(document.title).not.toBe(tieuDe.at(-1)));
      tieuDe.push(document.title);
    }
    expect(new Set(tieuDe).size).toBe(4);
    expect(tieuDe.at(-1)).toBe('Không tìm thấy trang – Trung tâm thử A');
  });

  it('đang chờ dữ liệu: giữ tiêu đề máy chủ đã chèn', () => {
    dung('treo', '/thu-tuc');
    expect(document.title).toBe(TIEU_DE_MAY_CHU);
  });

  it('không lấy được dữ liệu: tiêu đề là tên trang', async () => {
    dung('loi-mang', '/thu-tuc');
    await waitFor(() => expect(document.title).toBe('Danh mục thủ tục'));
    expect(meta('DC.title')).toHaveLength(0); // không đụng thẻ đặc tả
  });
});

describe('DacTaTrang — thẻ dữ liệu đặc tả (BR-13, AC-17, AC-18)', () => {
  it('đủ tập thẻ theo plan §3.3', async () => {
    dung(TRUNG_TAM_THU, '/thu-tuc');
    await waitFor(() => expect(noiDung('DC.title')).toBe('Danh mục thủ tục – Trung tâm thử A'));
    const moTa = 'Danh mục thủ tục hành chính cấp xã, cấp tỉnh: thành phần hồ sơ, thời hạn giải quyết, phí, lệ phí.';
    expect(noiDung('description')).toBe(moTa);
    expect(noiDung('DC.description')).toBe(moTa);
    expect(noiDung('og:description')).toBe(moTa);
    expect(noiDung('og:title')).toBe('Danh mục thủ tục – Trung tâm thử A');
    expect(noiDung('DC.creator')).toBe('Trung tâm thử A');
    expect(noiDung('DC.publisher')).toBe('Cơ quan thử D');
    expect(noiDung('DC.date')).toBe('2026-10-08');
    expect(noiDung('DC.identifier')).toBe(`${window.location.origin}/thu-tuc`);
    expect(noiDung('og:url')).toBe(`${window.location.origin}/thu-tuc`);
    expect(noiDung('DC.language')).toBe('vi');
    expect(noiDung('og:type')).toBe('website');
    expect(document.head.querySelector('link[rel="schema.DC"]')).toHaveAttribute('href', 'https://purl.org/dc/elements/1.1/');
  });

  it('cơ quan chủ quản trống thì DC.publisher = tên trung tâm (AC-19)', async () => {
    dung(voi({ coQuanChuQuan: null }));
    await waitFor(() => expect(noiDung('DC.publisher')).toBe('Trung tâm thử A'));
  });

  it('chưa nhập thủ tục lần nào thì không có DC.date, 5 yếu tố còn lại vẫn đủ', async () => {
    dung(voi({ ngayCapNhatThuTuc: null }));
    await waitFor(() => expect(noiDung('DC.creator')).toBe('Trung tâm thử A'));
    expect(meta('DC.date')).toHaveLength(0);
    expect(noiDung('DC.title')).toBeTruthy();
    expect(noiDung('DC.publisher')).toBeTruthy();
    expect(noiDung('DC.identifier')).toBeTruthy();
  });

  it('đổi trang bằng điều hướng: tiêu đề, mô tả, định danh đổi theo', async () => {
    const { router } = dung(TRUNG_TAM_THU, '/');
    await waitFor(() => expect(noiDung('DC.title')).toBe('Trang chủ – Trung tâm thử A'));
    const moTaTrangChu = noiDung('description');
    await act(() => router.navigate('/linh-vuc'));
    await waitFor(() => expect(noiDung('DC.title')).toBe('Lĩnh vực và mã QR – Trung tâm thử A'));
    expect(noiDung('description')).not.toBe(moTaTrangChu);
    expect(noiDung('DC.identifier')).toBe(`${window.location.origin}/linh-vuc`);
  });

  it('định danh không có query, bỏ "/" cuối', async () => {
    dung(TRUNG_TAM_THU, '/thu-tuc/?ma=1.001193');
    await waitFor(() => expect(noiDung('DC.identifier')).toBe(`${window.location.origin}/thu-tuc`));
    expect(noiDung('og:url')).not.toContain('?');
  });

  it('trang 404: không có DC.identifier, og:url (máy chủ cũng không chèn); gỡ cái của trang trước, quay lại thì có', async () => {
    const { router } = dung(TRUNG_TAM_THU, '/thu-tuc');
    await waitFor(() => expect(noiDung('DC.identifier')).toBe(`${window.location.origin}/thu-tuc`));
    await act(() => router.navigate('/abc-xyz'));
    await waitFor(() => expect(noiDung('DC.title')).toBe('Không tìm thấy trang – Trung tâm thử A'));
    expect(meta('DC.identifier')).toHaveLength(0);
    expect(meta('og:url')).toHaveLength(0);
    expect(noiDung('DC.creator')).toBe('Trung tâm thử A');
    await act(() => router.navigate('/linh-vuc'));
    await waitFor(() => expect(noiDung('DC.identifier')).toBe(`${window.location.origin}/linh-vuc`));
    expect(noiDung('og:url')).toBe(`${window.location.origin}/linh-vuc`);
  });

  it('thẻ máy chủ đã chèn sẵn thì đổi nội dung, không tạo thẻ trùng', async () => {
    document.head.innerHTML = [
      '<meta name="description" content="cũ">',
      '<meta name="DC.title" content="cũ">',
      '<meta property="og:title" content="cũ">',
      '<link rel="schema.DC" href="https://purl.org/dc/elements/1.1/">',
    ].join('');
    dung(TRUNG_TAM_THU, '/thu-tuc');
    await waitFor(() => expect(noiDung('DC.title')).toBe('Danh mục thủ tục – Trung tâm thử A'));
    for (const khoa of ['description', 'DC.title', 'og:title', 'DC.creator', 'DC.identifier']) {
      expect(meta(khoa), khoa).toHaveLength(1);
    }
    expect(document.head.querySelectorAll('link[rel="schema.DC"]')).toHaveLength(1);
  });

  it('không có dữ liệu thì không đụng thẻ có sẵn', async () => {
    document.head.innerHTML = '<meta name="DC.title" content="máy chủ">';
    dung('khong-co-du-lieu', '/thu-tuc');
    await waitFor(() => expect(document.title).toBe('Danh mục thủ tục'));
    expect(noiDung('DC.title')).toBe('máy chủ');
  });
});

describe('DacTaTrang — popup (AC-20)', () => {
  it('tiêu đề tạm chỉ đổi tab, thẻ đặc tả giữ tiêu đề trang; gỡ thì tab về tiêu đề trang', async () => {
    dung(TRUNG_TAM_THU, '/thu-tuc');
    await waitFor(() => expect(document.title).toBe('Danh mục thủ tục – Trung tâm thử A'));
    const popup = renderHook(() => useTieuDeTabTam('Thủ tục đăng ký khai sinh'));
    expect(document.title).toBe('Thủ tục đăng ký khai sinh');
    expect(noiDung('DC.title')).toBe('Danh mục thủ tục – Trung tâm thử A');
    expect(noiDung('og:title')).toBe('Danh mục thủ tục – Trung tâm thử A');
    popup.unmount();
    expect(document.title).toBe('Danh mục thủ tục – Trung tâm thử A');
  });

  it('dữ liệu Trung tâm về trễ khi popup đang mở không ghi đè tên thủ tục', async () => {
    const { fetchGia } = dung('treo', '/thu-tuc');
    const popup = renderHook(() => useTieuDeTabTam('Thủ tục X'));
    expect(document.title).toBe('Thủ tục X');
    await act(async () => fetchGia.traLoi(TRUNG_TAM_THU));
    await waitFor(() => expect(noiDung('DC.title')).toBe('Danh mục thủ tục – Trung tâm thử A'));
    expect(document.title).toBe('Thủ tục X');
    popup.unmount();
    expect(document.title).toBe('Danh mục thủ tục – Trung tâm thử A');
  });
});
