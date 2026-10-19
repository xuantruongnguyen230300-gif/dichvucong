import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NutTroLy } from './NutTroLy';

// Bộ máy dựng khung chạy khi chunk KhungTroLy được nạp lần đầu: đếm để biết khung có bị nạp sớm không.
const { daNapKhung } = vi.hoisted(() => ({ daNapKhung: vi.fn() }));
vi.mock('./KhungTroLy', () => {
  daNapKhung();
  return {
    KhungTroLy: ({ mo, onDong }: { mo: boolean; onDong: () => void }) => (
      <section id="khung-tro-ly" hidden={!mo}>
        <input aria-label="o-nhap" />
        <button type="button" onClick={onDong}>
          dong-khung
        </button>
      </section>
    ),
  };
});

afterEach(() => vi.unstubAllGlobals());

// Khoá `common:tro-ly.nut` do ui-core-dev thêm ở T10; tới lúc đó nút hiện đúng khoá
const TEN_NUT = /Trợ lý|tro-ly\.nut/;
const nut = () => screen.getByRole('button', { name: TEN_NUT });
const khung = () => document.getElementById('khung-tro-ly');

describe('NutTroLy (vỏ)', () => {
  it('chưa bấm: không tải chunk khung, không có yêu cầu mạng, không có khung trong DOM', () => {
    const fetchGia = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchGia);
    render(<NutTroLy />);
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
    expect(nut()).toHaveAttribute('aria-controls', 'khung-tro-ly');
    expect(daNapKhung).not.toHaveBeenCalled();
    expect(fetchGia).not.toHaveBeenCalled();
    expect(khung()).toBeNull();
  });

  it('nhấn xuống nút: nạp trước mã khung nhưng chưa mở', async () => {
    render(<NutTroLy />);
    fireEvent.pointerDown(nut());
    await waitFor(() => expect(daNapKhung).toHaveBeenCalledTimes(1));
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
    expect(khung()).toBeNull();
  });

  it('bấm nút: mở khung (đã nạp một lần duy nhất), aria-expanded đổi', async () => {
    const user = userEvent.setup();
    render(<NutTroLy />);
    await user.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    expect(nut()).toHaveAttribute('aria-expanded', 'true');
    expect(daNapKhung).toHaveBeenCalledTimes(1);
  });

  it('bấm lại: đóng, con trỏ về nút; khung và nội dung đang gõ còn nguyên, mở lại thấy lại', async () => {
    const user = userEvent.setup();
    render(<NutTroLy />);
    await user.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    await user.type(screen.getByLabelText('o-nhap'), 'khai sinh');

    await user.click(nut());
    expect(khung()).not.toBeVisible();
    expect(khung()).toBeInTheDocument();
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
    expect(nut()).toHaveFocus();

    await user.click(nut());
    expect(khung()).toBeVisible();
    expect(screen.getByLabelText('o-nhap')).toHaveValue('khai sinh');
    expect(daNapKhung).toHaveBeenCalledTimes(1);
  });

  it('khung đóng bằng onDong của nó: con trỏ về nút Trợ lý', async () => {
    const user = userEvent.setup();
    render(<NutTroLy />);
    await user.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    await user.click(screen.getByRole('button', { name: 'dong-khung' }));
    expect(khung()).not.toBeVisible();
    expect(nut()).toHaveFocus();
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
  });

  it('khung nằm trong cùng cây với nút (không portal ra <body>), ngay sau nút', async () => {
    const user = userEvent.setup();
    const { container } = render(<NutTroLy />);
    await user.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    expect(container).toContainElement(khung());
    expect(nut().nextElementSibling).toBe(khung());
  });
});
