/// <reference types="node" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import an from '../VisuallyHidden/VisuallyHidden.module.css';
import { Select, type SelectLuaChon } from './Select';

const LUA_CHON: readonly SelectLuaChon[] = [
  { giaTri: '', nhan: 'Tất cả lĩnh vực' },
  { giaTri: 'ho-tich', nhan: 'Hộ tịch (120)' },
  { giaTri: 'dat-dai', nhan: 'Đất đai (80)' },
];

function Khung({ onDoi }: { onDoi?: (v: string) => void }) {
  const [v, setV] = useState('');
  return (
    <Select
      nhan="Lĩnh vực"
      giaTri={v}
      onDoi={(m) => {
        setV(m);
        onDoi?.(m);
      }}
      luaChon={LUA_CHON}
    />
  );
}

describe('Select', () => {
  it('có <label>: tên đọc của ô chọn là nhãn; nhãn ẩn mặc định', () => {
    render(<Khung />);
    expect(screen.getByRole('combobox', { name: 'Lĩnh vực' })).toBeInTheDocument();
    expect(screen.getByText('Lĩnh vực').closest('label')).toBeInTheDocument();
    expect(screen.getByText('Lĩnh vực')).toHaveClass(an.an!);
  });

  it('hienNhan: nhãn hiện ra và vẫn gắn với ô chọn', () => {
    render(<Select nhan="Mức độ" hienNhan giaTri="" onDoi={() => undefined} luaChon={LUA_CHON} />);
    const nhan = screen.getByText('Mức độ');
    expect(nhan.tagName).toBe('LABEL');
    expect(nhan).not.toHaveClass(an.an!);
    expect(screen.getByRole('combobox', { name: 'Mức độ' })).toBeInTheDocument();
  });

  it('hiện giá trị đang chọn và đủ các lựa chọn', () => {
    render(<Select nhan="Lĩnh vực" giaTri="dat-dai" onDoi={() => undefined} luaChon={LUA_CHON} />);
    expect(screen.getByRole('combobox')).toHaveValue('dat-dai');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Tất cả lĩnh vực', 'Hộ tịch (120)', 'Đất đai (80)']);
  });

  it('đổi giá trị gọi onDoi đúng giá trị (kể cả quay về "tất cả" = "")', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    await user.selectOptions(screen.getByRole('combobox'), 'ho-tich');
    expect(onDoi).toHaveBeenLastCalledWith('ho-tich');
    await user.selectOptions(screen.getByRole('combobox'), 'Tất cả lĩnh vực');
    expect(onDoi).toHaveBeenLastCalledWith('');
    expect(onDoi).toHaveBeenCalledTimes(2);
  });

  it('bàn phím: Tab vào được ô chọn', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('ref chuyển xuống <select>', () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select ref={ref} nhan="Lĩnh vực" giaTri="" onDoi={() => undefined} luaChon={LUA_CHON} />);
    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('mũi tên là icon aria-hidden', () => {
    const { container } = render(<Khung />);
    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('lucide-chevron-down');
  });

  it('CSS: cao --control-height, appearance none, cắt chữ bằng …, vùng bấm ≥ 24 px, không viết cứng màu', () => {
    const css = readFileSync(join(import.meta.dirname, 'Select.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const chon = css.slice(css.indexOf('.chon {'), css.indexOf('}', css.indexOf('.chon {')));
    expect(chon).toMatch(/min-height:\s*var\(--control-height\)/);
    expect(chon).toMatch(/appearance:\s*none/);
    expect(chon).toMatch(/text-overflow:\s*ellipsis/);
    expect(chon).toMatch(/min-width:\s*0/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
