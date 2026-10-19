import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTieuDeTab, useTieuDeTabTam } from './useTieuDeTab';

beforeEach(() => {
  document.title = 'Tiêu đề có sẵn';
});

describe('useTieuDeTab', () => {
  it('đặt tiêu đề trang', () => {
    renderHook(() => useTieuDeTab('Danh mục – Trung tâm thử'));
    expect(document.title).toBe('Danh mục – Trung tâm thử');
  });

  it('null thì giữ tiêu đề có sẵn', () => {
    renderHook(() => useTieuDeTab(null));
    expect(document.title).toBe('Tiêu đề có sẵn');
  });

  it('tiêu đề tạm đè tiêu đề trang, gỡ thì trả lại', () => {
    renderHook(() => useTieuDeTab('Trang chủ – A'));
    const tam = renderHook(() => useTieuDeTabTam('Thủ tục đăng ký khai sinh'));
    expect(document.title).toBe('Thủ tục đăng ký khai sinh');
    tam.unmount();
    expect(document.title).toBe('Trang chủ – A');
  });

  it('đổi tiêu đề trang khi đang có tiêu đề tạm không làm mất tiêu đề tạm', () => {
    const trang = renderHook(({ t }) => useTieuDeTab(t), { initialProps: { t: 'Trang chủ' } });
    const tam = renderHook(() => useTieuDeTabTam('Thủ tục X'));
    trang.rerender({ t: 'Trang chủ – Trung tâm thử A' }); // dữ liệu Trung tâm về trễ
    expect(document.title).toBe('Thủ tục X');
    tam.unmount();
    expect(document.title).toBe('Trang chủ – Trung tâm thử A');
  });

  it('tiêu đề tạm null thì không làm gì', () => {
    renderHook(() => useTieuDeTab('Trang A'));
    renderHook(() => useTieuDeTabTam(null));
    expect(document.title).toBe('Trang A');
  });

  it('chưa có tiêu đề trang: gỡ tiêu đề tạm thì về tiêu đề có sẵn', () => {
    const tam = renderHook(() => useTieuDeTabTam('Thủ tục X'));
    expect(document.title).toBe('Thủ tục X');
    tam.unmount();
    expect(document.title).toBe('Tiêu đề có sẵn');
  });
});
