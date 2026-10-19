import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, MA_MAT_KET_NOI } from '../../api/http';
import { LienHeProvider } from '../LienHe';
import { ErrorState } from './ErrorState';

const matKetNoi = new ApiError(0, { code: MA_MAT_KET_NOI, title: 'Network', detail: 'fetch failed' });

describe('ErrorState', () => {
  it('mat-ket-noi: đủ tiêu đề, câu theo loại lỗi, nút Thử lại, link tel: từ provider, không có mã tra cứu (AC-19)', async () => {
    const onThuLai = vi.fn();
    render(
      <LienHeProvider soDienThoai="02723893900">
        <ErrorState loi={matKetNoi} onThuLai={onThuLai} />
      </LienHeProvider>,
    );
    const khung = screen.getByRole('alert');
    expect(khung).toHaveTextContent('Chưa tải được dữ liệu.');
    expect(khung).toHaveTextContent('Không kết nối được tới máy chủ');
    expect(screen.getByRole('link', { name: '02723893900' })).toHaveAttribute('href', 'tel:02723893900');
    expect(khung).not.toHaveTextContent('Mã tra cứu');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onThuLai).toHaveBeenCalledTimes(1);
  });

  it('loi-he-thong có maTraCuu → hiện "Mã tra cứu: …"', () => {
    const loi = new ApiError(500, { code: 'loi-he-thong', maTraCuu: 'AB12CD34', title: 'Internal', detail: 'stack' });
    render(<ErrorState loi={loi} onThuLai={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Mã tra cứu: AB12CD34');
  });

  it('không bao giờ hiện mã HTTP, title, detail', () => {
    const loi = new ApiError(500, { code: 'loi-he-thong', maTraCuu: 'AB12CD34', title: 'TieuDeRieng', detail: 'ChiTietRieng' });
    render(<ErrorState loi={loi} onThuLai={() => undefined} />);
    const khung = screen.getByRole('alert');
    expect(khung).not.toHaveTextContent('500');
    expect(khung).not.toHaveTextContent('TieuDeRieng');
    expect(khung).not.toHaveTextContent('ChiTietRieng');
  });

  it('lỗi khác loi-he-thong không hiện mã tra cứu; lỗi lạ dùng câu mặc định', () => {
    const { rerender } = render(
      <ErrorState loi={new ApiError(429, { code: 'qua-nhieu-yeu-cau', maTraCuu: 'XXXXXXXX' })} onThuLai={() => undefined} />,
    );
    expect(screen.getByRole('alert')).not.toHaveTextContent('Mã tra cứu');
    expect(screen.getByRole('alert')).toHaveTextContent('Bạn thao tác quá nhanh');
    rerender(<ErrorState loi={new Error('x')} onThuLai={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Có lỗi xảy ra');
  });

  it('không có provider → không có dòng số', () => {
    render(<ErrorState loi={matKetNoi} onThuLai={() => undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('alert')).not.toHaveTextContent('gọi Trung tâm');
  });
});
