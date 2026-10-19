import { render, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';
import { useCoKhungCho } from './khungCho';

describe('khungCho — cờ "trang còn khung chờ" (CLS: Layout ẩn chân trang)', () => {
  it('không có Skeleton: false; có Skeleton: true; gỡ hết: false', () => {
    const { result } = renderHook(() => useCoKhungCho());
    expect(result.current).toBe(false);

    const a = render(<Skeleton dang="the" />);
    expect(result.current).toBe(true);
    const b = render(<Skeleton dang="o" />);
    a.unmount();
    expect(result.current).toBe(true); // còn một khung chờ khác
    b.unmount();
    expect(result.current).toBe(false);
  });

  it('khung chờ trong popup (role=dialog) không tính', () => {
    const { result } = renderHook(() => useCoKhungCho());
    render(
      <div role="dialog" aria-label="popup">
        <Skeleton dang="dong" soMuc={4} />
      </div>,
    );
    expect(result.current).toBe(false);
  });
});
