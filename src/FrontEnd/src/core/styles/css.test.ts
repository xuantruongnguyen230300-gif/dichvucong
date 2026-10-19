/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Quy ước CSS của lõi (plan C01 §3.1): chỉ biến token, transition chỉ trên opacity/transform, không animation lặp.
const THU_MUC_CORE = join(import.meta.dirname, '..');

function lietKeCss(thuMuc: string): string[] {
  return readdirSync(thuMuc).flatMap((ten) => {
    const duongDan = join(thuMuc, ten);
    if (statSync(duongDan).isDirectory()) return lietKeCss(duongDan);
    return ten.endsWith('.css') ? [duongDan] : [];
  });
}

const tep = lietKeCss(THU_MUC_CORE).map((p) => [p.slice(THU_MUC_CORE.length + 1).replaceAll('\\', '/'), readFileSync(p, 'utf8')] as const);
const tepComponent = tep.filter(([ten]) => ten.startsWith('components/'));

/** Bỏ chú thích để câu giải thích không bị tính. */
const boChuThich = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân khai báo đầu tiên của selector (không có chú thích). */
function thanKhai(css: string, selector: string): string {
  const sach = boChuThich(css);
  const dau = sach.indexOf(`${selector} {`);
  if (dau < 0) throw new Error(`Không thấy ${selector}`);
  return sach.slice(dau, sach.indexOf('}', dau));
}
const css = (ten: string) => tep.find(([t]) => t === ten)![1];

describe('CSS lõi', () => {
  it('tìm thấy CSS để kiểm', () => {
    expect(tep.length).toBeGreaterThan(3);
  });

  it.each(tep)('%s: transition chỉ trên opacity, transform', (_ten, css) => {
    for (const m of boChuThich(css).matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/g)) {
      const khai = m[1]!.replace('!important', '').trim();
      if (khai === 'none') continue;
      const thuocTinh = khai.split(',').map((p) => p.trim().split(/\s+/)[0]);
      expect(thuocTinh.every((p) => p === 'opacity' || p === 'transform')).toBe(true);
    }
  });

  it.each(tep)('%s: không có CDN, @font-face, animation lặp, chế độ tối', (_ten, css) => {
    const sach = boChuThich(css);
    expect(sach).not.toMatch(/@font-face|@import|https?:\/\//);
    expect(sach).not.toMatch(/animation[^:]*:\s*[^;]*infinite/);
    expect(sach).not.toMatch(/prefers-color-scheme/);
  });

  it('SegmentedControl: .nhom không overflow (overflow cắt viền focus của nút)', () => {
    expect(thanKhai(css('components/SegmentedControl/SegmentedControl.module.css'), '.nhom')).not.toMatch(/overflow/);
  });

  it('Chip: hàng cuộn ngang có đệm chứa đủ viền focus', () => {
    const than = thanKhai(css('components/Chip/Chip.module.css'), '.hang');
    expect(than).toMatch(/overflow-x:\s*auto/);
    expect(than).toMatch(/padding:\s*calc\(var\(--focus-ring-width\) \+ var\(--focus-ring-offset\)\)/);
  });

  it('nút/link dạng chữ có vùng bấm tối thiểu --target-min (BR-1, AC-2)', () => {
    expect(thanKhai(css('components/Button/Button.module.css'), '.lienKet')).toMatch(/min-height:\s*var\(--target-min\)/);
    expect(thanKhai(css('components/ExternalLink/ExternalLink.module.css'), '.lienKet')).toMatch(/min-height:\s*var\(--target-min\)/);
    expect(css('styles/tokens.css')).toMatch(/--target-min:\s*24px/);
  });

  it('SearchBox: <input> chiếm hết chiều cao khung (không có vùng chết)', () => {
    expect(thanKhai(css('components/SearchBox/SearchBox.module.css'), '.nhap')).toMatch(/align-self:\s*stretch/);
  });

  it.each(tepComponent)('%s: màu lấy từ token, không viết cứng', (_ten, css) => {
    const sach = boChuThich(css);
    expect(sach).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(sach).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
  });
});
