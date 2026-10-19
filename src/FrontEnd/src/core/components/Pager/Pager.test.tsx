import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pager } from './Pager';

const chuCacNut = () =>
  within(screen.getByRole('navigation')).getAllByRole('button').map((b) => b.getAttribute('aria-label'));

describe('Pager', () => {
  it('1 trang → không render', () => {
    const { container } = render(<Pager trang={1} tongSoTrang={1} onDoiTrang={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('trang 1: nút Trước disabled, Sau bấm được (AC-5, AC-13)', () => {
    render(<Pager trang={1} tongSoTrang={20} onDoiTrang={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeEnabled();
    expect(chuCacNut()).toEqual(['Trang trước', 'Trang 1', 'Trang 2', 'Trang 20', 'Trang sau']);
  });

  it('trang cuối: nút Sau disabled', () => {
    render(<Pager trang={20} tongSoTrang={20} onDoiTrang={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeEnabled();
  });

  it('trang 10: dãy 1 … 9 10 11 … 20; chỗ hở là "…" aria-hidden; aria-current đúng trang', () => {
    render(<Pager trang={10} tongSoTrang={20} onDoiTrang={() => undefined} />);
    expect(chuCacNut()).toEqual(['Trang trước', 'Trang 1', 'Trang 9', 'Trang 10', 'Trang 11', 'Trang 20', 'Trang sau']);
    expect(screen.getAllByText('…')).toHaveLength(2);
    for (const dau of screen.getAllByText('…')) expect(dau).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('button', { current: 'page' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Trang 10' })).toHaveAttribute('aria-current', 'page');
  });

  it('nav có tên mặc định "Phân trang" hoặc theo prop nhan', () => {
    const { rerender } = render(<Pager trang={1} tongSoTrang={3} onDoiTrang={() => undefined} />);
    expect(screen.getByRole('navigation', { name: 'Phân trang' })).toBeInTheDocument();
    rerender(<Pager trang={1} tongSoTrang={3} onDoiTrang={() => undefined} nhan="Phân trang danh mục" />);
    expect(screen.getByRole('navigation', { name: 'Phân trang danh mục' })).toBeInTheDocument();
  });

  it('bấm số trang gọi onDoiTrang; bấm trang hiện tại không làm gì', async () => {
    const onDoiTrang = vi.fn();
    const user = userEvent.setup();
    render(<Pager trang={10} tongSoTrang={20} onDoiTrang={onDoiTrang} />);
    await user.click(screen.getByRole('button', { name: 'Trang 10' }));
    expect(onDoiTrang).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Trang 11' }));
    expect(onDoiTrang).toHaveBeenCalledWith(11);
    await user.click(screen.getByRole('button', { name: 'Trang trước' }));
    expect(onDoiTrang).toHaveBeenLastCalledWith(9);
  });

  it('chữ Trước / Sau có trong DOM (CSS ẩn dưới 600 px); tên đọc chứa chữ hiện ra', () => {
    render(<Pager trang={2} tongSoTrang={5} onDoiTrang={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Trang trước' })).toHaveTextContent('Trước');
    expect(screen.getByRole('button', { name: 'Trang sau' })).toHaveTextContent('Sau');
  });
});
