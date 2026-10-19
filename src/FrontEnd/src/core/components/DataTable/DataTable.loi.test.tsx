import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { datKhoMan } from '../../../test-utils/khoMan';
import { DataTable } from './DataTable';
import type { CotBang } from './types';

// Chunk bảng không tải được (mất mạng, hoặc đã triển khai bản mới)
vi.mock('./BangDuLieu', () => {
  throw new Error('Failed to fetch dynamically imported module: /assets/BangDuLieu-abc.js');
});

interface ThuTuc {
  ma: string;
  ten: string;
}
const DS: ThuTuc[] = Array.from({ length: 5 }, (_, i) => ({ ma: `M${i + 1}`, ten: `Thủ tục ${i + 1}` }));
const COT: CotBang<ThuTuc>[] = [{ id: 'ten', tieuDe: 'Tên thủ tục', o: (d) => d.ten }];

function dung() {
  datKhoMan(1280);
  return render(
    <>
      <p>Phần còn lại của trang</p>
      <DataTable
        duLieu={DS}
        khoaDong={(d) => d.ma}
        cachXem="bang"
        cot={COT}
        renderCard={(d, stt) => <article>{`${stt}. ${d.ten}`}</article>}
        tieuDeBang="Danh sách thủ tục"
        soMucMoiTrang={12}
        trang={null}
        onDoiTrang={() => undefined}
      />
    </>,
  );
}

describe('DataTable — chunk bảng lỗi tải (L2)', () => {
  it('chỉ vùng bảng báo lỗi: có Thử lại và Xem dạng thẻ, không lộ thông điệp kỹ thuật, phần còn lại vẫn nguyên', async () => {
    const loi = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    dung();
    const vung = screen.getByRole('region', { name: /^Kết quả, trang 1 trên 1/ });
    const canhBao = await within(vung).findByRole('alert');
    expect(within(canhBao).getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(within(vung).getByRole('button', { name: 'Xem dạng thẻ' })).toBeInTheDocument();
    expect(vung.textContent).not.toMatch(/Failed to fetch|dynamically imported/);
    expect(screen.getByText('Phần còn lại của trang')).toBeInTheDocument();
    loi.mockRestore();
  });

  it('"Xem dạng thẻ" đổi sang thẻ ngay, không nạp bảng nữa', async () => {
    const loi = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    dung();
    await userEvent.click(await screen.findByRole('button', { name: 'Xem dạng thẻ' }));
    expect(screen.getByText('1. Thủ tục 1')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    loi.mockRestore();
  });

  it('"Thử lại" nạp lại; còn lỗi thì vẫn báo lỗi ở vùng bảng', async () => {
    const loi = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    dung();
    await userEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Phần còn lại của trang')).toBeInTheDocument();
    loi.mockRestore();
  });
});
