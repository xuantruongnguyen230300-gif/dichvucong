import { act, renderHook } from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate, useNavigationType } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDanhSachUrl } from './useDanhSachUrl';

interface GhiNhan {
  search: string;
  loai: string;
}

function dung(diaChiDau: string, tuyChon?: Parameters<typeof useDanhSachUrl>[0]) {
  const lichSu: GhiNhan[] = [];
  const dieuHuong: { current: ReturnType<typeof useNavigate> | null } = { current: null };
  function Theo() {
    const { search } = useLocation();
    const loai = useNavigationType();
    const navigate = useNavigate();
    useEffect(() => {
      dieuHuong.current = navigate;
    }, [navigate]);
    useEffect(() => {
      lichSu.push({ search, loai });
    }, [search, loai]);
    return null;
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[diaChiDau]}>
      <Theo />
      {children}
    </MemoryRouter>
  );
  const ket = renderHook(() => ({ h: useDanhSachUrl(tuyChon), search: useLocation().search }), { wrapper });
  return { ...ket, lichSu, dieuHuong };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const TUY_CHON = { boLoc: ['lv', 'md'], khac: ['cap'] } as const;

describe('useDanhSachUrl', () => {
  it('cắt từ khoá trên địa chỉ về 100 ký tự và 12 từ khi đọc', () => {
    const dai = dung(`/?q=${'x'.repeat(5000)}`);
    expect(dai.result.current.h.tuKhoa).toHaveLength(100);
    const nhieuTu = dung(`/?q=${Array.from({ length: 40 }, (_, i) => `t${i}`).join('+')}`);
    expect(nhieuTu.result.current.h.tuKhoa.split(' ')).toHaveLength(12);
  });

  it('cắt từ khoá khi gõ và khi ghi lên địa chỉ', () => {
    const { result } = dung('/');
    act(() => result.current.h.datTuKhoa('y'.repeat(300)));
    expect(result.current.h.tuKhoa).toHaveLength(100);
    act(() => void vi.advanceTimersByTime(400));
    expect(result.current.search).toBe(`?q=${'y'.repeat(100)}`);
  });

  it('đọc từ khoá, bộ lọc, trang từ địa chỉ', () => {
    const { result } = dung('/?q=khai+sinh&lv=ht&trang=3', TUY_CHON);
    expect(result.current.h.tuKhoa).toBe('khai sinh');
    expect(result.current.h.giaTri('lv')).toBe('ht');
    expect(result.current.h.trang).toBe('3');
  });

  it('đổi bộ lọc hoặc khoá khác → mất trang', () => {
    const { result } = dung('/?lv=ht&trang=3&cap=xa', TUY_CHON);
    act(() => result.current.h.dat({ lv: 'dd' }));
    expect(result.current.search).toBe('?lv=dd&cap=xa');
    expect(result.current.h.trang).toBeNull();

    const b = dung('/?trang=3&cap=xa', TUY_CHON);
    act(() => b.result.current.h.dat({ cap: 'tinh' }));
    expect(b.result.current.search).toBe('?cap=tinh');
  });

  it('đổi từ khoá → mất trang sau khi ghi; trong lúc chờ trang trả null', () => {
    const { result } = dung('/?trang=3', TUY_CHON);
    act(() => result.current.h.datTuKhoa('a'));
    expect(result.current.h.trang).toBeNull();
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.search).toBe('?q=a');
    expect(result.current.h.trang).toBeNull();
  });

  it('datTrang ghi số trang; trang 1 thì bỏ khoá', () => {
    const { result } = dung('/?q=a', TUY_CHON);
    act(() => result.current.h.datTrang(4));
    expect(result.current.search).toBe('?q=a&trang=4');
    act(() => result.current.h.datTrang(1));
    expect(result.current.search).toBe('?q=a');
  });

  it('xoaBoLoc xoá từ khoá, bộ lọc, trang; giữ khoá khác', () => {
    const { result } = dung('/?q=a&lv=ht&md=1&trang=2&cap=xa', TUY_CHON);
    act(() => result.current.h.xoaBoLoc());
    expect(result.current.search).toBe('?cap=xa');
    expect(result.current.h.tuKhoa).toBe('');
  });

  it('xoaBoLoc huỷ từ khoá đang chờ ghi', () => {
    const { result } = dung('/', TUY_CHON);
    act(() => result.current.h.datTuKhoa('abc'));
    act(() => result.current.h.xoaBoLoc());
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.search).toBe('');
    expect(result.current.h.tuKhoa).toBe('');
  });

  it('coDieuKien đúng với từng tổ hợp', () => {
    expect(dung('/', TUY_CHON).result.current.h.coDieuKien).toBe(false);
    expect(dung('/?q=%20%20', TUY_CHON).result.current.h.coDieuKien).toBe(false);
    expect(dung('/?q=a', TUY_CHON).result.current.h.coDieuKien).toBe(true);
    expect(dung('/?lv=ht', TUY_CHON).result.current.h.coDieuKien).toBe(true);
    expect(dung('/?cap=xa', TUY_CHON).result.current.h.coDieuKien).toBe(false);
    expect(dung('/?trang=2', TUY_CHON).result.current.h.coDieuKien).toBe(false);
  });

  it('gõ nhanh 5 ký tự → địa chỉ ghi 1 lần sau 300 ms; ô tìm cập nhật ngay', () => {
    const { result, lichSu } = dung('/?trang=2', TUY_CHON);
    const truoc = lichSu.length;
    for (const [i, v] of ['k', 'kh', 'kha', 'khai', 'khai '].entries()) {
      act(() => result.current.h.datTuKhoa(v));
      expect(result.current.h.tuKhoa).toBe(v);
      expect(result.current.h.trang).toBeNull();
      if (i < 4) act(() => vi.advanceTimersByTime(100));
    }
    expect(lichSu.length).toBe(truoc); // chưa ghi
    expect(result.current.search).toBe('?trang=2');
    act(() => vi.advanceTimersByTime(299));
    expect(result.current.search).toBe('?trang=2');
    act(() => vi.advanceTimersByTime(1));
    expect(lichSu.length).toBe(truoc + 1);
    expect(result.current.search).toBe('?q=khai+');
    expect(result.current.h.tuKhoa).toBe('khai ');
  });

  it('địa chỉ đổi từ bên ngoài → tuKhoa theo', () => {
    const { result, dieuHuong } = dung('/?q=cu', TUY_CHON);
    expect(result.current.h.tuKhoa).toBe('cu');
    act(() => {
      dieuHuong.current?.('/?q=moi');
    });
    expect(result.current.h.tuKhoa).toBe('moi');
    act(() => result.current.h.datTuKhoa('dang-go'));
    act(() => {
      dieuHuong.current?.('/');
    });
    expect(result.current.h.tuKhoa).toBe('');
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.search).toBe(''); // không ghi lại từ khoá cũ
  });

  it('mọi lần ghi đều thay mục lịch sử, không thêm mục mới', () => {
    const { result, lichSu } = dung('/', TUY_CHON);
    act(() => result.current.h.dat({ lv: 'ht' }));
    act(() => result.current.h.datTuKhoa('a'));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.h.datTrang(2));
    act(() => result.current.h.xoaBoLoc());
    const ghiDiaChi = lichSu.slice(1);
    expect(ghiDiaChi.length).toBeGreaterThanOrEqual(4);
    expect(ghiDiaChi.every((g) => g.loai === 'REPLACE')).toBe(true);
  });

  it('dùng khoá từ khoá, trang tuỳ chỉnh', () => {
    const { result } = dung('/?tim=a&p=2', { khoaTuKhoa: 'tim', khoaTrang: 'p' });
    expect(result.current.h.tuKhoa).toBe('a');
    expect(result.current.h.trang).toBe('2');
  });
});
