import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBox } from './SearchBox';

function Khung({ dau = '', soKetQua, khiGui }: { dau?: string; soKetQua?: number; khiGui?: () => void }) {
  const [v, setV] = useState(dau);
  return (
    <form onSubmit={(e) => { e.preventDefault(); khiGui?.(); }}>
      <SearchBox nhan="Tìm thủ tục" giaTri={v} onDoi={setV} soKetQua={soKetQua} />
    </form>
  );
}

describe('SearchBox', () => {
  it('nhãn gắn với ô nhập; không có nút micro', () => {
    render(<Khung />);
    const o = screen.getByRole('searchbox', { name: 'Tìm thủ tục' });
    expect(o).toHaveAttribute('autocomplete', 'off');
    expect(o).toHaveAttribute('maxlength', '100');
    expect(screen.queryByRole('button', { name: /micro|giọng nói/i })).toBeNull();
  });

  it('mỗi ký tự gõ gọi onDoi', async () => {
    const onDoi = vi.fn();
    render(<SearchBox nhan="Tìm" giaTri="" onDoi={onDoi} />);
    await userEvent.setup().type(screen.getByRole('searchbox'), 'abc');
    expect(onDoi).toHaveBeenCalledTimes(3);
  });

  it('nút ✕ chỉ có khi ô có chữ; bấm → onDoi(""), con trỏ vẫn ở ô (AC-9)', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    expect(screen.queryByRole('button', { name: 'Xoá từ khoá' })).toBeNull();
    await user.type(screen.getByRole('searchbox'), 'khai sinh');
    await user.click(screen.getByRole('button', { name: 'Xoá từ khoá' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Xoá từ khoá' })).toBeNull();
  });

  it('Enter không gửi form', async () => {
    const khiGui = vi.fn();
    const user = userEvent.setup();
    render(<Khung khiGui={khiGui} />);
    await user.type(screen.getByRole('searchbox'), 'abc{Enter}');
    expect(khiGui).not.toHaveBeenCalled();
  });

  it('hienNhan hiện nhãn thấy được', () => {
    render(<SearchBox nhan="Tìm thủ tục" hienNhan giaTri="" onDoi={() => undefined} />);
    expect(screen.getByText('Tìm thủ tục')).toBeVisible();
  });

  it('ref chuyển xuống ô nhập', () => {
    let o: HTMLInputElement | null = null;
    render(<SearchBox nhan="Tìm" giaTri="" onDoi={() => undefined} ref={(e) => void (o = e)} />);
    expect(o).toBe(screen.getByRole('searchbox'));
  });
});

describe('SearchBox: báo số kết quả', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('không báo lúc vừa mở', () => {
    render(<Khung dau="" soKetQua={12} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('báo "Có n kết quả." sau khi gõ và đứng yên 500 ms', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { rerender } = render(<SearchBox nhan="Tìm" giaTri="" onDoi={() => undefined} soKetQua={1000} />);
    await user.type(screen.getByRole('searchbox'), 'k');
    rerender(<SearchBox nhan="Tìm" giaTri="k" onDoi={() => undefined} soKetQua={37} />);
    act(() => vi.advanceTimersByTime(499));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('status')).toHaveTextContent('Có 37 kết quả.');
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('báo "Không có kết quả." khi số kết quả là 0', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { rerender } = render(<SearchBox nhan="Tìm" giaTri="" onDoi={() => undefined} soKetQua={5} />);
    await user.type(screen.getByRole('searchbox'), 'x');
    rerender(<SearchBox nhan="Tìm" giaTri="x" onDoi={() => undefined} soKetQua={0} />);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('status')).toHaveTextContent('Không có kết quả.');
  });
});
