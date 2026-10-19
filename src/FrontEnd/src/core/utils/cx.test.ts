import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('bỏ giá trị rỗng và nối bằng dấu cách', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });
});
