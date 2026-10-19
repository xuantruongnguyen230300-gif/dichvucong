import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { datKhoMan } from '../../../test-utils/khoMan';
import type { CachXem } from '../../hooks/useCachXem';
import { DataTable } from './DataTable';
import type { CotBang } from './types';

const nap = vi.hoisted(() => ({ dem: 0 }));
vi.mock('./BangDuLieu', async (importOriginal) => {
  nap.dem++;
  return await importOriginal();
});

interface ThuTuc {
  ma: string;
  ten: string;
}
const DS: ThuTuc[] = Array.from({ length: 30 }, (_, i) => ({ ma: `M${i + 1}`, ten: `Thủ tục ${i + 1}` }));
const COT: CotBang<ThuTuc>[] = [
  { id: 'stt', tieuDe: 'STT', o: (_d, stt) => stt, khongXuongDong: true },
  { id: 'ma', tieuDe: 'Mã', o: (d) => d.ma },
  { id: 'ten', tieuDe: 'Tên thủ tục', o: (d) => d.ten },
];

function Khung({ dau = 'the', trangDau = null, ds = DS }: { dau?: CachXem; trangDau?: string | null; ds?: ThuTuc[] }) {
  const [cachXem, setCachXem] = useState<CachXem>(dau);
  const [trang, setTrang] = useState<string | null>(trangDau);
  return (
    <>
      <button onClick={() => setCachXem(cachXem === 'the' ? 'bang' : 'the')}>chuyển</button>
      <DataTable
        duLieu={ds}
        khoaDong={(d) => d.ma}
        cachXem={cachXem}
        cot={COT}
        renderCard={(d, stt) => <article>{`${stt}. ${d.ten}`}</article>}
        tieuDeBang="Danh sách thủ tục"
        soMucMoiTrang={12}
        trang={trang}
        onDoiTrang={(n) => setTrang(String(n))}
      />
    </>
  );
}

describe('DataTable', () => {
  it("cachXem='the' → không nạp BangDuLieu; hiện thẻ của trang 1", () => {
    render(<Khung />);
    expect(nap.dem).toBe(0);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(screen.getByText('1. Thủ tục 1')).toBeInTheDocument();
    expect(screen.getByText('12. Thủ tục 12')).toBeInTheDocument();
    expect(screen.queryByText('13. Thủ tục 13')).toBeNull();
  });

  it("'bang' → có <caption>, mọi <th> có scope=col, vùng cuộn có tabIndex=0 và có tên", async () => {
    render(<Khung dau="bang" />);
    const bang = await screen.findByRole('table', { name: 'Danh sách thủ tục' });
    expect(bang.querySelector('caption')).toHaveTextContent('Danh sách thủ tục');
    const dauCot = within(bang).getAllByRole('columnheader');
    expect(dauCot).toHaveLength(3);
    for (const th of dauCot) expect(th).toHaveAttribute('scope', 'col');
    const vungCuon = screen.getByRole('region', { name: 'Danh sách thủ tục' });
    expect(vungCuon).toHaveAttribute('tabindex', '0');
    expect(within(bang).getAllByRole('row')).toHaveLength(13); // 1 dòng tiêu đề + 12 dòng
    expect(within(bang).getByText('Thủ tục 1')).toBeInTheDocument();
  });

  it('STT đếm trên cả danh sách', async () => {
    render(<Khung dau="bang" trangDau="2" />);
    const bang = await screen.findByRole('table');
    const dong = within(bang).getAllByRole('row')[1]!;
    expect(within(dong).getAllByRole('cell')[0]).toHaveTextContent('13');
  });

  it('chuyển thẻ ↔ bảng ở trang 3 → vẫn trang 3, cùng thứ tự (AC-11)', async () => {
    const user = userEvent.setup();
    render(<Khung trangDau="3" />);
    expect(screen.getByText('25. Thủ tục 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 3' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'chuyển' }));
    const bang = await screen.findByRole('table');
    const o = within(bang).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[2]!.textContent);
    expect(o).toEqual(['Thủ tục 25', 'Thủ tục 26', 'Thủ tục 27', 'Thủ tục 28', 'Thủ tục 29', 'Thủ tục 30']);
    expect(screen.getByRole('button', { name: 'Trang 3' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'chuyển' }));
    expect(screen.getByText('25. Thủ tục 25')).toBeInTheDocument();
  });

  it('trang="99" với 3 trang → trang 3; "abc" → trang 1 (AC-14)', () => {
    const { unmount } = render(<Khung trangDau="99" />);
    expect(screen.getByRole('button', { name: 'Trang 3' })).toHaveAttribute('aria-current', 'page');
    unmount();
    render(<Khung trangDau="abc" />);
    expect(screen.getByRole('button', { name: 'Trang 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('trang là số 20 chữ số → trang cuối (AC-14)', () => {
    render(<Khung trangDau="99999999999999999999" />);
    expect(screen.getByRole('button', { name: 'Trang 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('1 trang → không có phân trang (AC-14)', () => {
    render(<Khung ds={DS.slice(0, 5)} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('bấm số trang → gọi onDoiTrang và scrollIntoView; lần render đầu không cuộn (AC-13)', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    expect(screen.getByText('13. Thủ tục 13')).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    // con trỏ chuyển tới vùng kết quả, tên đọc có số trang mới
    const vung = screen.getByRole('region', { name: 'Kết quả, trang 2 trên 3' });
    expect(vung).toHaveFocus();
  });

  it('bấm Sau chuyển trang kế tiếp', async () => {
    const user = userEvent.setup();
    render(<Khung />);
    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(screen.getByRole('button', { name: 'Trang 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('giả lập điện thoại → dạng thẻ dù cachXem=bang', () => {
    datKhoMan(375);
    render(<Khung dau="bang" />);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
  });
});
