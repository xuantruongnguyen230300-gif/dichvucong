import { describe, expect, it, vi } from 'vitest';
import { taoBoNap } from './napKhung';

describe('taoBoNap', () => {
  it('nhiều lần gọi chỉ nạp một lần và trả cùng promise', async () => {
    const nguon = vi.fn().mockResolvedValue('khung');
    const nap = taoBoNap(nguon);
    const a = nap();
    expect(nap()).toBe(a);
    expect(await a).toBe('khung');
    await nap();
    expect(nguon).toHaveBeenCalledTimes(1);
  });

  it('nạp lỗi thì quên đi: lần gọi sau thử lại và thành công', async () => {
    const nguon = vi.fn().mockRejectedValueOnce(new Error('mất mạng')).mockResolvedValue('khung');
    const nap = taoBoNap(nguon);
    await expect(nap()).rejects.toThrow('mất mạng');
    await expect(nap()).resolves.toBe('khung');
    expect(nguon).toHaveBeenCalledTimes(2);
  });
});
