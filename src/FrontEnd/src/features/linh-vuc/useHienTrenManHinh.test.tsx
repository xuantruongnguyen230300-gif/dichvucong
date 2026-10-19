import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { caiGiaoCat, type BoDieuKhienGiaoCat } from '../../test-utils/giaLapGiaoCat';
import { useHienTrenManHinh } from './useHienTrenManHinh';

function O({ ten }: { ten: string }) {
  const [ref, daHien] = useHienTrenManHinh<HTMLDivElement>();
  return (
    <div ref={ref} data-testid={ten} data-hien={daHien}>
      {ten}
    </div>
  );
}

const hien = (ten: string) => screen.getByTestId(ten).getAttribute('data-hien');

describe('useHienTrenManHinh (BR-2)', () => {
  let giao: BoDieuKhienGiaoCat;
  beforeEach(() => {
    giao = caiGiaoCat();
  });
  afterEach(() => giao.go());

  it('quan sát với rootMargin 0px, threshold 0, và chỉ một observer cho nhiều phần tử', () => {
    render(
      <>
        <O ten="a" />
        <O ten="b" />
        <O ten="c" />
      </>,
    );
    expect(giao.options).toEqual([{ rootMargin: '0px', threshold: 0 }]);
    expect(giao.dangQuanSat()).toHaveLength(3);
  });

  it('chỉ phần tử hiện ra mới thành true', () => {
    render(
      <>
        <O ten="a" />
        <O ten="b" />
      </>,
    );
    expect(hien('a')).toBe('false');
    act(() => giao.hienRa(screen.getByTestId('a')));
    expect(hien('a')).toBe('true');
    expect(hien('b')).toBe('false');
  });

  it('hiện rồi thì bỏ quan sát, và ẩn đi sau đó không đổi lại false', () => {
    render(<O ten="a" />);
    const a = screen.getByTestId('a');
    act(() => giao.hienRa(a));
    expect(giao.soLan.unobserve).toBeGreaterThanOrEqual(1);
    expect(giao.dangQuanSat()).not.toContain(a);
    act(() => giao.an(a));
    expect(hien('a')).toBe('true');
  });

  it('gỡ khỏi cây khi chưa hiện thì dọn: không còn ai được quan sát', () => {
    const { unmount } = render(
      <>
        <O ten="a" />
        <O ten="b" />
      </>,
    );
    unmount();
    expect(giao.dangQuanSat()).toEqual([]);
    expect(giao.soLan.disconnect).toBeGreaterThanOrEqual(1);
  });

  it('StrictMode (gắn, gỡ, gắn lại) không để sót hay quan sát đôi', () => {
    render(
      <StrictMode>
        <O ten="a" />
      </StrictMode>,
    );
    expect(giao.dangQuanSat()).toHaveLength(1);
    act(() => giao.hienRaHet());
    expect(hien('a')).toBe('true');
    expect(giao.dangQuanSat()).toEqual([]);
  });
});

describe('useHienTrenManHinh — thiếu IntersectionObserver', () => {
  it('true ngay, không quan sát gì', () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    render(<O ten="a" />);
    expect(hien('a')).toBe('true');
  });
});
