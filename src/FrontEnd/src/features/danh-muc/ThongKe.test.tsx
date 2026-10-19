import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { napNgonNguDanhMuc } from './i18n';
import { ThongKe } from './ThongKe';

beforeAll(napNgonNguDanhMuc);

describe('ThongKe', () => {
  it('đúng 3 ô: cấp xã, cấp tỉnh, lĩnh vực, số kèm nhãn', () => {
    render(<ThongKe soXa={266} soTinh={408} soLinhVuc={75} />);
    const danhSach = screen.getByRole('list', { name: 'Thống kê danh mục' });
    const o = within(danhSach).getAllByRole('listitem');
    expect(o).toHaveLength(3);
    expect(o[0]).toHaveTextContent('266');
    expect(o[0]).toHaveTextContent('Thủ tục cấp xã');
    expect(o[1]).toHaveTextContent('408');
    expect(o[1]).toHaveTextContent('Thủ tục cấp tỉnh');
    expect(o[2]).toHaveTextContent('75');
    expect(o[2]).toHaveTextContent('Lĩnh vực');
  });

  it('AC-7: dữ liệu đổi thành 267 thủ tục xã thì ô xã ghi 267', () => {
    const { rerender } = render(<ThongKe soXa={266} soTinh={408} soLinhVuc={75} />);
    expect(screen.getByText('266')).toBeInTheDocument();
    rerender(<ThongKe soXa={267} soTinh={408} soLinhVuc={75} />);
    expect(screen.getByText('267')).toBeInTheDocument();
    expect(screen.queryByText('266')).not.toBeInTheDocument();
  });

  it('số từ 1.000 có dấu chấm nghìn', () => {
    render(<ThongKe soXa={1000} soTinh={1234} soLinhVuc={5} />);
    expect(screen.getByText('1.000')).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
  });

  it('AC-8: không có ô hay nhãn "Ưu tiên"', () => {
    render(<ThongKe soXa={1} soTinh={2} soLinhVuc={3} />);
    expect(screen.queryByText(/ưu tiên/i)).not.toBeInTheDocument();
  });
});
