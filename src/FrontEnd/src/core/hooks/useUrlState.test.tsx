import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useUrlState } from './useUrlState';

function setup(initialUrl: string, defaultValue?: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({ state: useUrlState('q', defaultValue), search: useLocation().search }),
    { wrapper },
  );
}

describe('useUrlState', () => {
  it('đọc giá trị từ URL, thiếu thì lấy mặc định', () => {
    expect(setup('/?q=abc').result.current.state[0]).toBe('abc');
    expect(setup('/', 'x').result.current.state[0]).toBe('x');
  });

  it('ghi vào URL và giữ nguyên các khoá khác', () => {
    const { result } = setup('/?trang=2');
    act(() => result.current.state[1]('hộ tịch'));
    expect(result.current.state[0]).toBe('hộ tịch');
    expect(new URLSearchParams(result.current.search).get('trang')).toBe('2');
  });

  it('rỗng hoặc bằng mặc định thì bỏ khoá', () => {
    const { result } = setup('/?q=abc', 'x');
    act(() => result.current.state[1]('x'));
    expect(result.current.search).toBe('');
  });
});
