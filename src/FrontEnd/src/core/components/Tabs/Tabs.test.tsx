/// <reference types="node" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { idTab, Tabs } from './Tabs';

type Cap = 'xa' | 'tinh';
const LUA_CHON = [
  { giaTri: 'xa', nhan: 'Thủ tục cấp xã' },
  { giaTri: 'tinh', nhan: 'Thủ tục cấp tỉnh' },
] as const;

function Khung({ dau = 'xa', onDoi }: { dau?: Cap; onDoi?: (v: Cap) => void }) {
  const [v, setV] = useState<Cap>(dau);
  return (
    <>
      <Tabs
        nhan="Danh mục"
        luaChon={LUA_CHON}
        giaTri={v}
        onDoi={(m) => {
          setV(m);
          onDoi?.(m);
        }}
        idBang="bang-dm"
      />
      <div role="tabpanel" id="bang-dm" aria-labelledby={idTab('bang-dm', v)}>
        {v}
      </div>
    </>
  );
}

const tab = (ten: string) => screen.getByRole('tab', { name: ten });

describe('Tabs', () => {
  it('tablist có tên; mỗi tab là button role=tab, aria-selected đúng, aria-controls trỏ tới tabpanel', () => {
    render(<Khung />);
    expect(screen.getByRole('tablist', { name: 'Danh mục' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(tab('Thủ tục cấp xã').tagName).toBe('BUTTON');
    expect(tab('Thủ tục cấp xã')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Thủ tục cấp tỉnh')).toHaveAttribute('aria-selected', 'false');
    for (const t of screen.getAllByRole('tab')) expect(t).toHaveAttribute('aria-controls', 'bang-dm');
  });

  it('tabpanel được đặt tên bởi tab đang chọn qua idTab', () => {
    render(<Khung dau="tinh" />);
    expect(screen.getByRole('tabpanel', { name: 'Thủ tục cấp tỉnh' })).toBeInTheDocument();
  });

  it('chỉ tab đang chọn có tabIndex=0 (roving tabindex)', async () => {
    render(<Khung />);
    expect(tab('Thủ tục cấp xã')).toHaveAttribute('tabindex', '0');
    expect(tab('Thủ tục cấp tỉnh')).toHaveAttribute('tabindex', '-1');
    await userEvent.setup().click(tab('Thủ tục cấp tỉnh'));
    expect(tab('Thủ tục cấp xã')).toHaveAttribute('tabindex', '-1');
    expect(tab('Thủ tục cấp tỉnh')).toHaveAttribute('tabindex', '0');
  });

  it('Tab vào danh sách dừng ở tab đang chọn, Tab tiếp rời khỏi danh sách', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Khung dau="tinh" />
        <button type="button">Sau</button>
      </>,
    );
    await user.tab();
    expect(tab('Thủ tục cấp tỉnh')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sau' })).toHaveFocus();
  });

  it('bấm tab khác gọi onDoi; bấm lại tab đang chọn thì không gọi', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    await user.click(tab('Thủ tục cấp xã'));
    expect(onDoi).not.toHaveBeenCalled();
    await user.click(tab('Thủ tục cấp tỉnh'));
    expect(onDoi).toHaveBeenCalledTimes(1);
    expect(onDoi).toHaveBeenCalledWith('tinh');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('tinh');
  });

  it('← → chuyển tab, đưa focus theo và kích hoạt ngay', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(tab('Thủ tục cấp tỉnh')).toHaveFocus();
    expect(tab('Thủ tục cấp tỉnh')).toHaveAttribute('aria-selected', 'true');
    expect(onDoi).toHaveBeenLastCalledWith('tinh');
    await user.keyboard('{ArrowLeft}');
    expect(tab('Thủ tục cấp xã')).toHaveFocus();
    expect(onDoi).toHaveBeenLastCalledWith('xa');
  });

  it('← → đi vòng ở hai đầu', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Thủ tục cấp tỉnh')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Thủ tục cấp xã')).toHaveFocus();
  });

  it('Home và End về tab đầu, tab cuối; ở sẵn tab đó thì không gọi onDoi', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    await user.tab();
    await user.keyboard('{Home}');
    expect(onDoi).not.toHaveBeenCalled();
    await user.keyboard('{End}');
    expect(tab('Thủ tục cấp tỉnh')).toHaveFocus();
    expect(onDoi).toHaveBeenCalledTimes(1);
    await user.keyboard('{Home}');
    expect(tab('Thủ tục cấp xã')).toHaveFocus();
    expect(onDoi).toHaveBeenLastCalledWith('xa');
  });

  it('Enter và phím cách kích hoạt tab đang focus', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    tab('Thủ tục cấp tỉnh').focus();
    await user.keyboard('{Enter}');
    expect(onDoi).toHaveBeenLastCalledWith('tinh');
    tab('Thủ tục cấp xã').focus();
    await user.keyboard(' ');
    expect(onDoi).toHaveBeenLastCalledWith('xa');
  });

  it('phím khác không làm gì', async () => {
    const onDoi = vi.fn();
    const user = userEvent.setup();
    render(<Khung onDoi={onDoi} />);
    await user.tab();
    await user.keyboard('{ArrowDown}a');
    expect(onDoi).not.toHaveBeenCalled();
  });

  it('idTab ổn định', () => {
    expect(idTab('bang', 'xa')).toBe(idTab('bang', 'xa'));
    expect(idTab('bang', 'xa')).not.toBe(idTab('bang', 'tinh'));
    expect(idTab('bang-a', 'xa')).not.toBe(idTab('bang-b', 'xa'));
  });

  it('CSS: tab đang chọn gạch chân đậm và chữ đậm; hai tab chia đều dưới 600 px; cao ≥ --control-height', () => {
    const css = readFileSync(join(import.meta.dirname, 'Tabs.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.tab\[aria-selected='true'\]\s*\{[^}]*border-bottom-color:[^}]*font-weight:\s*700/);
    expect(css).toMatch(/\.tab\s*\{[^}]*flex:\s*1 1 0/);
    expect(css).toMatch(/\.tab\s*\{[^}]*min-height:\s*calc\(var\(--control-height\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
