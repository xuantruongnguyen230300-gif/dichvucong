/// <reference types="node" />
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import tile from '../Tile/Tile.module.css';
import { datLaiCachXemChoTest } from '../../hooks/useCachXem';
import { datKhoMan } from '../../../test-utils/khoMan';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it.each(['the', 'bang', 'dong', 'o'] as const)('dạng %s: role=status đọc "Đang tải…", khối aria-hidden, khung aria-busy', (dang) => {
    const { container } = render(<Skeleton dang={dang} />);
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    const khoi = container.querySelectorAll('[aria-hidden="true"]');
    expect(khoi.length).toBeGreaterThan(0);
    expect(container.querySelector('[aria-hidden="true"] span')).not.toBeNull();
  });

  it('dạng thẻ có số thẻ theo soMuc', () => {
    datKhoMan(800); // dưới 1024 px: dạng xem mặc định là thẻ
    const { container } = render(<Skeleton dang="the" soMuc={4} />);
    expect(container.querySelectorAll('[data-rong="nut"]')).toHaveLength(4);
  });

  describe('dạng ô dịch vụ (F02)', () => {
    it('mặc định 6 ô, soMuc đổi được', () => {
      const { container, rerender } = render(<Skeleton dang="o" />);
      expect(container.querySelectorAll(`.${tile.o!}`)).toHaveLength(6);
      rerender(<Skeleton dang="o" soMuc={3} />);
      expect(container.querySelectorAll(`.${tile.o!}`)).toHaveLength(3);
    });

    it('dùng chung lưới và khung của Tile (cùng 2/3/6 cột, cùng khoảng cách)', () => {
      const { container } = render(<Skeleton dang="o" />);
      expect(container.querySelector(`.${tile.luoi!}`)).not.toBeNull();
      expect(container.querySelectorAll(`.${tile.muc!} > .${tile.o!}`)).toHaveLength(6);
    });

    it('khối aria-hidden, khung aria-busy, có chữ ẩn "Đang tải…", không có tương tác', () => {
      const { container } = render(<Skeleton dang="o" />);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
      expect(container.querySelector(`.${tile.luoi!}`)?.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(container.querySelector('a, button, [tabindex]')).toBeNull();
    });

    it('chiều cao ô giữ chỗ tính từ token: icon 36 px + tên hai dòng + dòng "Trang ngoài"', () => {
      const css = readFileSync(join(import.meta.dirname, 'Skeleton.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(css).toMatch(/\.dongTen\s*\{[^}]*height:\s*calc\(2 \* var\(--font-size-md\) \* var\(--line-height-body\)\)/);
      expect(css).toMatch(/\.dongNgoai\s*\{[^}]*height:\s*calc\(var\(--font-size-xs\) \* var\(--line-height-body\)\)/);
      expect(css).toMatch(/data-rong='bieu-tuong'\][^}]*height:\s*36px/);
    });

    it('các dạng cũ không đổi: thẻ vẫn 6 khối, không dùng lớp của Tile', () => {
      datKhoMan(800);
      const { container } = render(<Skeleton dang="the" />);
      expect(container.querySelectorAll('[data-rong="nut"]')).toHaveLength(6);
      expect(container.querySelector(`.${tile.o!}`)).toBeNull();
    });
  });

  describe('dạng bảng (khung chờ của danh sách)', () => {
    it('dang="bang": một đầu bảng và đúng soMuc dòng', () => {
      const { container } = render(<Skeleton dang="bang" soMuc={5} />);
      expect(container.querySelectorAll('[class*="dongBang"]')).toHaveLength(5);
      expect(container.querySelectorAll('[class*="dauBang"]')).toHaveLength(1);
    });

    it('dang="the" theo dạng xem: từ 1024 px mặc định là bảng; dạng thẻ đã chọn thì vẫn là thẻ', () => {
      datKhoMan(1280);
      const { container, unmount } = render(<Skeleton dang="the" soMuc={4} />);
      expect(container.querySelectorAll('[class*="dongBang"]')).toHaveLength(4);
      expect(container.querySelector('[data-rong="nut"]')).toBeNull();
      unmount();

      window.localStorage.setItem('cach-xem', 'the');
      datLaiCachXemChoTest();
      const lai = render(<Skeleton dang="the" soMuc={4} />);
      expect(lai.container.querySelectorAll('[data-rong="nut"]')).toHaveLength(4);
    });

    it('chiều cao dòng và đầu bảng tính từ token, khớp bảng thật (dòng 24 px nội dung + 2 padding + viền)', () => {
      const css = readFileSync(join(import.meta.dirname, 'Skeleton.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(css).toMatch(/\.dongBang\s*\{[^}]*height:\s*calc\(24px \+ 2 \* var\(--space-2\) \+ 1px\)/);
      expect(css).toMatch(/\.dauBang\s*\{[^}]*height:\s*calc\(var\(--font-size-sm\) \* var\(--line-height-body\) \+ 2 \* var\(--space-2\) \+ 1px\)/);
    });
  });

  it('CSS không có animation (AC-18)', () => {
    const css = readFileSync(join(import.meta.dirname, 'Skeleton.module.css'), 'utf8');
    const khongChuThich = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(khongChuThich).not.toMatch(/animation|@keyframes/);
  });
});
