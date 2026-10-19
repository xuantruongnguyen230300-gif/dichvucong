import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('có vai trò button, tên đúng, mặc định type=button', () => {
    render(<Button>Xem chi tiết</Button>);
    const nut = screen.getByRole('button', { name: 'Xem chi tiết' });
    expect(nut).toHaveAttribute('type', 'button');
    expect(nut).not.toHaveAttribute('aria-pressed');
  });

  it('Enter và phím cách đều kích hoạt', async () => {
    const khiBam = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={khiBam}>Gửi</Button>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(khiBam).toHaveBeenCalledTimes(2);
  });

  it('disabled: không gọi onClick, Tab bỏ qua', async () => {
    const khiBam = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Button disabled onClick={khiBam}>
          A
        </Button>
        <Button>B</Button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(khiBam).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });

  it('dangXuLy: bấm 2 lần nhanh chỉ chạy 1 lần (AC-5)', async () => {
    const khiBam = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Button onClick={khiBam}>Gửi</Button>);
    await user.click(screen.getByRole('button'));
    rerender(
      <Button onClick={khiBam} dangXuLy>
        Gửi
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));
    expect(khiBam).toHaveBeenCalledTimes(1);
  });

  it('dangXuLy: aria-busy, aria-disabled, vẫn nhận focus, có chữ ẩn "Đang xử lý"', async () => {
    const user = userEvent.setup();
    render(<Button dangXuLy>Gửi</Button>);
    const nut = screen.getByRole('button');
    expect(nut).toHaveAttribute('aria-busy', 'true');
    expect(nut).toHaveAttribute('aria-disabled', 'true');
    expect(nut).not.toBeDisabled();
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument();
    await user.tab();
    expect(nut).toHaveFocus();
  });

  it('dangXuLy: không gửi form', async () => {
    const khiGui = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={khiGui}>
        <Button type="submit" dangXuLy>
          Gửi
        </Button>
      </form>,
    );
    await user.click(screen.getByRole('button'));
    expect(khiGui).not.toHaveBeenCalled();
  });

  it('dangBat đúng/sai → aria-pressed tương ứng (AC-5)', () => {
    const { rerender } = render(<Button dangBat>Đọc</Button>);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
    rerender(<Button dangBat={false}>Đọc</Button>);
    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  });

  it('icon trang trí có aria-hidden và ref chuyển xuống nút', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} bieuTuong={<Plus aria-hidden="true" data-testid="icon" />}>
        Thêm
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('dạng liên kết nội bộ (to) render <a> trỏ đúng địa chỉ', () => {
    render(
      <MemoryRouter>
        <Button to="/danh-muc" bienThe="primary">
          Danh mục thủ tục
        </Button>
      </MemoryRouter>,
    );
    const lienKet = screen.getByRole('link', { name: 'Danh mục thủ tục' });
    expect(lienKet).toHaveAttribute('href', '/danh-muc');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
