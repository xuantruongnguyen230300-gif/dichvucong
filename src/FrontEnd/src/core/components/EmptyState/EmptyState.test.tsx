import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LienHeProvider } from '../LienHe';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it("có từ khoá và chip → câu có \"với 'xyzxyz'\", đủ 4 gợi ý, có nút Xoá bộ lọc (AC-20)", async () => {
    const onXoaBoLoc = vi.fn();
    render(
      <LienHeProvider soDienThoai="02723893900">
        <EmptyState doiTuong="thủ tục" tuKhoa="xyzxyz" coBoLoc nutXoaTrenThanhLoc={false} onXoaBoLoc={onXoaBoLoc} />
      </LienHeProvider>,
    );
    expect(screen.getByText("Không tìm thấy thủ tục phù hợp với 'xyzxyz'")).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Kiểm tra lại chính tả hoặc thử từ khoá ngắn hơn.')).toBeInTheDocument();
    expect(screen.getByText('Xoá bộ lọc để tìm trong toàn bộ danh sách.')).toBeInTheDocument();
    expect(screen.getByText('Hỏi Trợ lý thủ tục ở góc phải bên dưới màn hình.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '02723893900' })).toHaveAttribute('href', 'tel:02723893900');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));
    expect(onXoaBoLoc).toHaveBeenCalledTimes(1);
  });

  it('nutXoaTrenThanhLoc → không có nút, gợi ý xoá bộ lọc bằng chữ', () => {
    render(<EmptyState doiTuong="thủ tục" tuKhoa="xyzxyz" coBoLoc nutXoaTrenThanhLoc />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText(/Bấm “Xoá bộ lọc” trên thanh bộ lọc/)).toBeInTheDocument();
  });

  it('chỉ có bộ lọc → câu không có phần "với …"', () => {
    render(<EmptyState doiTuong="thủ tục" tuKhoa="   " coBoLoc nutXoaTrenThanhLoc={false} onXoaBoLoc={() => undefined} />);
    expect(screen.getByText('Không tìm thấy thủ tục phù hợp')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Xoá bộ lọc' })).toBeInTheDocument();
  });

  it('không từ khoá, không lọc → còn 2 gợi ý, không có nút', () => {
    render(<EmptyState doiTuong="lĩnh vực" tuKhoa="" coBoLoc={false} nutXoaTrenThanhLoc={false} onXoaBoLoc={() => undefined} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Hỏi cán bộ tại Trung tâm.')).toBeInTheDocument();
  });

  it('từ khoá <b>abc</b> hiện nguyên chữ, DOM không có thẻ <b> (AC-20)', () => {
    const { container } = render(<EmptyState doiTuong="thủ tục" tuKhoa="<b>abc</b>" coBoLoc={false} nutXoaTrenThanhLoc={false} />);
    expect(screen.getByText("Không tìm thấy thủ tục phù hợp với '<b>abc</b>'")).toBeInTheDocument();
    expect(container.querySelector('b')).toBeNull();
  });

  it('không role=alert', () => {
    render(<EmptyState doiTuong="thủ tục" tuKhoa="a" coBoLoc={false} nutXoaTrenThanhLoc={false} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
