import { describe, expect, it } from 'vitest';
import { daNapNgonNguLinhVuc, napNgonNguLinhVuc } from './index';

describe('napNgonNguLinhVuc / daNapNgonNguLinhVuc', () => {
  it('chưa nạp thì false; nạp xong thì true (để nơi dùng bỏ `use()` và vẽ ngay, không hiện khung chờ thừa)', async () => {
    expect(daNapNgonNguLinhVuc()).toBe(false);
    const nap = napNgonNguLinhVuc();
    expect(napNgonNguLinhVuc()).toBe(nap); // nhớ promise: gọi lại không nạp lại
    await nap;
    expect(daNapNgonNguLinhVuc()).toBe(true);
  });
});
