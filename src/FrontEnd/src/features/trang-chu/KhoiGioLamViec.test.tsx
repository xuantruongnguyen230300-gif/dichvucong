import type { UseQueryResult } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { napNgonNguTrangChu } from './i18n';
import { KhoiGioLamViec } from './KhoiGioLamViec';

beforeAll(napNgonNguTrangChu);
afterEach(() => vi.useRealTimers());

type GioNgay = ThongTinTrungTam['gioLamViec'][number];
const ngay = (thu: number, sangTu: string | null, sangDen: string | null, chieuTu: string | null, chieuDen: string | null): GioNgay => ({
  thu,
  sangTu,
  sangDen,
  chieuTu,
  chieuDen,
});
const haiDenSau: GioNgay[] = [1, 2, 3, 4, 5].map((thu) => ngay(thu, '07:00', '11:30', '13:30', '17:00'));
const AC7: GioNgay[] = [...haiDenSau, ngay(6, '07:00', '11:30', null, null)];

type Kq = Pick<UseQueryResult<ThongTinTrungTam>, 'data' | 'isPending' | 'isError' | 'isFetching'>;
const coDuLieu = (gioLamViec: GioNgay[], ghiChuNgayNghi: string | null = null): Kq => ({
  data: { ...TRUNG_TAM_THU, gioLamViec, ghiChuNgayNghi },
  isPending: false,
  isError: false,
  isFetching: false,
});
const dangTai: Kq = { data: undefined, isPending: true, isError: false, isFetching: true };
const loi: Kq = { data: undefined, isPending: false, isError: true, isFetching: false };

const dung = (kq: Kq) => render(<KhoiGioLamViec truyVan={kq as UseQueryResult<ThongTinTrungTam>} />);
/** Giờ Việt Nam → mốc thời gian; 2026-10-12 là Thứ Hai. */
const luc = (ngayThang: string, gio: string) => new Date(`${ngayThang}T${gio}:00+07:00`);
const gia = (thoiDiem: Date) => vi.useFakeTimers({ now: thoiDiem, toFake: ['Date', 'setInterval', 'clearInterval'] });
const dongGio = () => within(screen.getByRole('list')).getAllByRole('listitem');

describe('KhoiGioLamViec — dòng giờ', () => {
  it('AC-2: một dòng "Thứ Hai – Thứ Sáu" với hai buổi đúng giờ', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu(haiDenSau));
    const dong = dongGio();
    expect(dong).toHaveLength(1);
    expect(dong[0]).toHaveTextContent('Thứ Hai – Thứ Sáu');
    expect(dong[0]).toHaveTextContent('Buổi sáng07:00 – 11:30');
    expect(dong[0]).toHaveTextContent('Buổi chiều13:30 – 17:00');
  });

  it('AC-9: Hai–Sáu + Thứ Bảy chỉ buổi sáng → đúng 2 dòng, không có "Chủ nhật"', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu(AC7));
    const dong = dongGio();
    expect(dong).toHaveLength(2);
    expect(dong[0]).toHaveTextContent('Thứ Hai – Thứ Sáu');
    expect(dong[1]).toHaveTextContent('Thứ Bảy');
    expect(dong[1]).toHaveTextContent('Buổi sáng07:00 – 11:30');
    expect(dong[1]).not.toHaveTextContent('Buổi chiều');
    expect(document.body).not.toHaveTextContent('Chủ nhật');
  });

  it('một ngày đứng riêng hiện tên thứ, không có dấu "–"', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu([ngay(2, '08:00', '11:00', null, null)]));
    expect(dongGio()[0]).toHaveTextContent(/^Thứ Ba/);
    expect(dongGio()[0]).not.toHaveTextContent('Thứ Ba –');
  });

  it('7 dòng giờ khác nhau → 7 dòng, đủ Chủ nhật', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu([1, 2, 3, 4, 5, 6, 7].map((thu) => ngay(thu, `0${thu}:00`, `1${thu}:00`, null, null))));
    expect(dongGio()).toHaveLength(7);
    expect(dongGio()[6]).toHaveTextContent('Chủ nhật');
  });

  it('dòng giờ hỏng bị bỏ, dòng tốt còn nguyên', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu([ngay(1, '25:00', '26:00', null, null), ...haiDenSau.slice(1)]));
    expect(dongGio()).toHaveLength(1);
    expect(dongGio()[0]).toHaveTextContent('Thứ Ba – Thứ Sáu');
  });
});

describe('KhoiGioLamViec — trạng thái (BR-2)', () => {
  it.each([
    ['2026-10-12', '10:00', 'Đang trong giờ làm việc', 'Ngoài giờ làm việc'],
    ['2026-10-12', '12:00', 'Ngoài giờ làm việc', 'Đang trong giờ làm việc'],
    ['2026-10-17', '09:00', 'Ngoài giờ làm việc', 'Đang trong giờ làm việc'], // AC-2: Thứ Bảy không có dòng giờ
  ])('%s %s → "%s"', (ngayThang, gio, co, khong) => {
    gia(luc(ngayThang, gio));
    dung(coDuLieu(haiDenSau));
    expect(screen.getByText(co)).toBeInTheDocument();
    expect(screen.queryByText(khong)).toBeNull();
  });

  it('AC-7: thêm Thứ Bảy sáng → 09:00 Thứ Bảy đang làm việc', () => {
    gia(luc('2026-10-17', '09:00'));
    dung(coDuLieu(AC7));
    expect(screen.getByText('Đang trong giờ làm việc')).toBeInTheDocument();
  });

  it('máy khách đặt múi giờ khác: tính theo giờ Việt Nam (mốc UTC)', () => {
    gia(new Date('2026-10-12T03:00:00Z')); // Thứ Hai 10:00 Việt Nam, dù máy ở đâu
    dung(coDuLieu(haiDenSau));
    expect(screen.getByText('Đang trong giờ làm việc')).toBeInTheDocument();
  });

  it('đồng hồ đi qua 11:30 giờ Việt Nam → đổi sang "Ngoài giờ làm việc" mà không tải lại', () => {
    gia(luc('2026-10-12', '11:29'));
    dung(coDuLieu(haiDenSau));
    expect(screen.getByText('Đang trong giờ làm việc')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Ngoài giờ làm việc')).toBeInTheDocument();
    expect(screen.queryByText('Đang trong giờ làm việc')).toBeNull();
  });

  it('02/9/2026 (Quốc khánh, Thứ Tư) 10:00 vẫn "Đang trong giờ làm việc" và ghi chú chỉ để hiển thị (BR-3)', () => {
    gia(luc('2026-09-02', '10:00'));
    dung(coDuLieu(haiDenSau, 'Nghỉ lễ, Tết theo quy định.'));
    expect(screen.getByText('Đang trong giờ làm việc')).toBeInTheDocument();
    expect(screen.getByText('Nghỉ lễ, Tết theo quy định.')).toBeInTheDocument();
  });
});

describe('KhoiGioLamViec — ghi chú, rỗng, tải, lỗi', () => {
  it('không có ghi chú (null hoặc chỉ khoảng trắng) → không có đoạn ghi chú', () => {
    gia(luc('2026-10-12', '10:00'));
    const { rerender } = dung(coDuLieu(haiDenSau, null));
    expect(document.querySelector('p')).toBeNull();
    rerender(<KhoiGioLamViec truyVan={coDuLieu(haiDenSau, '   ') as UseQueryResult<ThongTinTrungTam>} />);
    expect(document.querySelector('p')).toBeNull();
  });

  it('có h2 "Thời gian làm việc" đặt tên cho vùng', () => {
    gia(luc('2026-10-12', '10:00'));
    dung(coDuLieu(haiDenSau));
    expect(screen.getByRole('heading', { level: 2, name: 'Thời gian làm việc' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Thời gian làm việc' })).toHaveAttribute('data-nen-dam');
  });

  it('gioLamViec rỗng hoặc không còn dòng hợp lệ → không render gì (kể cả trạng thái)', () => {
    gia(luc('2026-10-12', '10:00'));
    const { container, rerender } = dung(coDuLieu([]));
    expect(container).toBeEmptyDOMElement();
    rerender(<KhoiGioLamViec truyVan={coDuLieu([ngay(1, '25:00', '11:30', null, null)]) as UseQueryResult<ThongTinTrungTam>} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('đang tải → dải và tiêu đề hiện ngay, bên trong giữ chỗ aria-hidden và có "Đang tải…"', () => {
    dung(dangTai);
    const vung = screen.getByRole('region', { name: 'Thời gian làm việc' });
    expect(vung).toHaveAttribute('aria-busy', 'true');
    expect(within(vung).getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByText('Đang trong giờ làm việc')).toBeNull();
    expect(screen.queryByText('Ngoài giờ làm việc')).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('lỗi (kể cả 404) → ẩn cả khối', () => {
    const { container } = dung(loi);
    expect(container).toBeEmptyDOMElement();
  });

  it('lỗi đang thử lại → quay về khung giữ chỗ', () => {
    dung({ ...loi, isFetching: true });
    expect(screen.getByRole('region', { name: 'Thời gian làm việc' })).toHaveAttribute('aria-busy', 'true');
  });
});
