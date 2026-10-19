import { describe, expect, it, vi } from 'vitest';

// Bộ máy dựng chunk phần đọc chạy khi `import('./docCauTraLoi')` được nạp lần đầu
const { daNap } = vi.hoisted(() => ({ daNap: vi.fn() }));
vi.mock('./docCauTraLoi', () => {
  daNap();
  return { docMoi: vi.fn(), nap: vi.fn() };
});

describe('napPhanDoc (BR-4)', () => {
  it('không nạp chunk cho tới khi được gọi; gọi nhiều lần chỉ nạp một lần', async () => {
    const { napPhanDoc } = await import('./napPhanDoc');
    expect(daNap).not.toHaveBeenCalled();
    const a = napPhanDoc();
    const b = napPhanDoc();
    expect(b).toBe(a);
    await a;
    expect(daNap).toHaveBeenCalledOnce();
    await napPhanDoc();
    expect(daNap).toHaveBeenCalledOnce();
  });
});
