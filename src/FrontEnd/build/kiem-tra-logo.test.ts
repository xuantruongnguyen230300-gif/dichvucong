import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { kiemTraSoLogo } from './kiem-tra-logo.ts';

const tam: string[] = [];
afterEach(() => {
  for (const t of tam.splice(0)) rmSync(t, { recursive: true, force: true });
});

function thuMucCo(...tep: string[]): URL {
  const t = mkdtempSync(join(tmpdir(), 'logo-'));
  tam.push(t);
  for (const ten of tep) writeFileSync(join(t, ten), '');
  return pathToFileURL(t + '/');
}

describe('kiemTraSoLogo', () => {
  it('đúng một tệp ảnh thì qua', () => {
    expect(() => kiemTraSoLogo(thuMucCo('logo.svg'))).not.toThrow();
  });
  it('hai tệp ảnh thì báo lỗi', () => {
    expect(() => kiemTraSoLogo(thuMucCo('a.svg', 'b.png'))).toThrow(/đúng 1 tệp/);
  });
  it('thư mục trống thì báo lỗi', () => {
    expect(() => kiemTraSoLogo(thuMucCo())).toThrow(/hiện có 0/);
  });
});
