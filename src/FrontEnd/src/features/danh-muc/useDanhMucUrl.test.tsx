import { act, renderHook } from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDanhMucUrl } from './useDanhMucUrl';

interface GhiNhan {
  search: string;
  loai: string;
}

function dung(diaChiDau: string) {
  const lichSu: GhiNhan[] = [];
  function Theo() {
    const { search } = useLocation();
    const loai = useNavigationType();
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
  const ket = renderHook(() => ({ h: useDanhMucUrl(), search: useLocation().search }), { wrapper });
  return { ...ket, lichSu };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDanhMucUrl', () => {
  it('đọc cap, lv, md, q, trang từ địa chỉ', () => {
    const { result } = dung('/thu-tuc?cap=tinh&lv=ho-tich&md=mot-phan&q=khai+sinh&trang=3');
    expect(result.current.h.cap).toBe('tinh');
    expect(result.current.h.linhVucMa).toBe('ho-tich');
    expect(result.current.h.mucDo).toBe('mot-phan');
    expect(result.current.h.tuKhoa).toBe('khai sinh');
    expect(result.current.h.trang).toBe('3');
    expect(result.current.h.coDieuKien).toBe(true);
  });

  it('AC-10: vào địa chỉ trần → ghi cap=xa bằng replace', () => {
    const { result, lichSu } = dung('/thu-tuc');
    expect(result.current.search).toBe('?cap=xa');
    expect(result.current.h.cap).toBe('xa');
    expect(lichSu.at(-1)).toEqual({ search: '?cap=xa', loai: 'REPLACE' });
    // MemoryRouter chỉ có mục đầu rồi mục thay: không thêm mục lịch sử
    expect(lichSu.some((g) => g.loai === 'PUSH')).toBe(false);
  });

  it('cap thiếu hoặc lạ → xa, giữ nguyên trang, ma, lv, q', () => {
    const { result } = dung('/thu-tuc?cap=abc&trang=3&ma=1.001193&lv=ho-tich&q=khai');
    expect(result.current.h.cap).toBe('xa');
    const p = new URLSearchParams(result.current.search);
    expect(p.get('cap')).toBe('xa');
    expect(p.get('trang')).toBe('3');
    expect(p.get('ma')).toBe('1.001193');
    expect(p.get('lv')).toBe('ho-tich');
    expect(p.get('q')).toBe('khai');
  });

  it('địa chỉ có cap hợp lệ thì không bị ghi lại', () => {
    const { result, lichSu } = dung('/thu-tuc?cap=tinh&trang=3');
    expect(result.current.search).toBe('?cap=tinh&trang=3');
    expect(lichSu).toHaveLength(1);
  });

  it('md lạ → tất cả mức độ, không báo lỗi', () => {
    const { result } = dung('/thu-tuc?cap=xa&md=abc');
    expect(result.current.h.mucDo).toBe('');
  });

  it('?cap=tinh&trang=3 → cấp tỉnh, trang thô "3"', () => {
    const { result } = dung('/thu-tuc?cap=tinh&trang=3');
    expect(result.current.h.cap).toBe('tinh');
    expect(result.current.h.trang).toBe('3');
  });

  it('đổi tab: bỏ lĩnh vực và trang, giữ từ khoá và mức độ', () => {
    const { result, lichSu } = dung('/thu-tuc?cap=xa&lv=ho-tich&md=toan-trinh&q=khai&trang=2');
    act(() => result.current.h.doiTab('tinh'));
    const p = new URLSearchParams(result.current.search);
    expect(p.get('cap')).toBe('tinh');
    expect(p.has('lv')).toBe(false);
    expect(p.has('trang')).toBe(false);
    expect(p.get('md')).toBe('toan-trinh');
    expect(p.get('q')).toBe('khai');
    expect(lichSu.at(-1)?.loai).toBe('REPLACE');
  });

  it('bấm lại tab đang chọn thì không đổi địa chỉ', () => {
    const { result } = dung('/thu-tuc?cap=xa&lv=ho-tich&trang=2');
    act(() => result.current.h.doiTab('xa'));
    expect(result.current.search).toBe('?cap=xa&lv=ho-tich&trang=2');
  });

  it('chọn lĩnh vực, mức độ: ghi địa chỉ, về trang 1; chọn "tất cả" xoá khoá', () => {
    const { result } = dung('/thu-tuc?cap=xa&trang=3');
    act(() => result.current.h.datLinhVuc('ho-tich'));
    expect(result.current.search).toBe('?cap=xa&lv=ho-tich');
    act(() => result.current.h.datMucDo('mot-phan'));
    expect(result.current.search).toBe('?cap=xa&lv=ho-tich&md=mot-phan');
    act(() => result.current.h.datLinhVuc(''));
    act(() => result.current.h.datMucDo(''));
    expect(result.current.search).toBe('?cap=xa');
  });

  it('gõ từ khoá ghi lên địa chỉ chậm 300 ms, bỏ trang', () => {
    const { result } = dung('/thu-tuc?cap=xa&trang=3');
    act(() => result.current.h.datTuKhoa('khai sinh'));
    expect(result.current.h.tuKhoa).toBe('khai sinh');
    expect(result.current.search).toBe('?cap=xa&trang=3');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(new URLSearchParams(result.current.search).get('q')).toBe('khai sinh');
    expect(new URLSearchParams(result.current.search).has('trang')).toBe(false);
  });

  it('xoaBoLoc: xoá q, trang, lv, md nhưng giữ cap và ma', () => {
    const { result } = dung('/thu-tuc?cap=tinh&lv=dat-dai&md=mot-phan&q=the+chap&trang=2&ma=1.005132');
    act(() => result.current.h.xoaBoLoc());
    const p = new URLSearchParams(result.current.search);
    expect(p.get('cap')).toBe('tinh');
    expect(p.get('ma')).toBe('1.005132');
    expect(p.has('lv') || p.has('md') || p.has('q') || p.has('trang')).toBe(false);
    expect(result.current.h.coDieuKien).toBe(false);
  });

  it('chỉ có tab (cap) thì chưa tính là đang lọc', () => {
    const { result } = dung('/thu-tuc?cap=tinh');
    expect(result.current.h.coDieuKien).toBe(false);
  });
});
