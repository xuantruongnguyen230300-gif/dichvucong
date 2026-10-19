import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LienHeProvider, useLienHe } from './LienHe';

describe('useLienHe', () => {
  it('trong provider trả đúng số đã truyền', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LienHeProvider soDienThoai="02723893900">{children}</LienHeProvider>
    );
    expect(renderHook(() => useLienHe(), { wrapper }).result.current.soDienThoai).toBe('02723893900');
  });

  it('không có provider → null', () => {
    expect(renderHook(() => useLienHe()).result.current.soDienThoai).toBeNull();
  });
});
