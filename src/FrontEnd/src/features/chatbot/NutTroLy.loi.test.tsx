import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taoBoNap } from './napKhung';
import { NutTroLy } from './NutTroLy';

// Nguồn nạp do test điều khiển (nạp lỗi rồi nạp lại); vẫn qua bộ nhớ đệm promise thật (taoBoNap), mỗi test một bộ.
const { nap, hienTai } = vi.hoisted(() => ({
  nap: vi.fn(),
  hienTai: { boNap: null as null | (() => Promise<unknown>) },
}));
vi.mock('./napKhung', async (goc) => {
  const m = await goc<typeof import('./napKhung')>();
  return { ...m, napKhungTroLy: () => hienTai.boNap?.() };
});

const TEN_NUT = /Trợ lý|tro-ly\.nut/;
const nut = () => screen.getByRole('button', { name: TEN_NUT });
const khung = () => document.getElementById('khung-tro-ly');

function KhungGia({ mo }: { mo: boolean }) {
  return <section id="khung-tro-ly" hidden={!mo} />;
}

beforeEach(() => {
  nap.mockReset();
  hienTai.boNap = taoBoNap(nap);
});

describe('NutTroLy: nạp khung lỗi', () => {
  it('bấm mà nạp lỗi: nút còn nguyên, không mở; bấm lần nữa nạp lại và mở được', async () => {
    nap.mockRejectedValueOnce(new Error('mất mạng')).mockResolvedValue(KhungGia);
    render(<NutTroLy />);

    fireEvent.click(nut());
    await waitFor(() => expect(nap).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(nut()).toHaveAttribute('aria-expanded', 'false'));
    expect(khung()).toBeNull();

    fireEvent.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    expect(nut()).toHaveAttribute('aria-expanded', 'true');
    expect(nap).toHaveBeenCalledTimes(2);
  });

  it('nạp trước (nhấn xuống) mà lỗi: không mở, không lỗi chưa xử lý; bấm sau đó nạp lại được', async () => {
    nap.mockRejectedValueOnce(new Error('mất mạng')).mockResolvedValue(KhungGia);
    render(<NutTroLy />);

    fireEvent.pointerDown(nut());
    await waitFor(() => expect(nap).toHaveBeenCalledTimes(1));
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
    expect(khung()).toBeNull();
    await new Promise((giai) => setTimeout(giai, 0)); // để lỗi nạp trước được quên đi

    fireEvent.click(nut());
    await waitFor(() => expect(khung()).toBeVisible());
    expect(nap).toHaveBeenCalledTimes(2);
  });

  it('đóng lại trong lúc đang nạp: nạp xong khung vẫn ẩn', async () => {
    let giai: (k: typeof KhungGia) => void = () => undefined;
    nap.mockReturnValue(new Promise((r) => (giai = r)));
    render(<NutTroLy />);

    fireEvent.click(nut()); // mở (đang nạp)
    expect(nut()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(nut()); // đóng
    expect(nut()).toHaveAttribute('aria-expanded', 'false');
    giai(KhungGia);
    await waitFor(() => expect(khung()).toBeInTheDocument());
    expect(khung()).not.toBeVisible();
  });
});
