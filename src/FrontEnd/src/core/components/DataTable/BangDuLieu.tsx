import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './DataTable.module.css';
import type { BangDuLieuProps } from './types';

// Bảng chỉ cần mô hình dòng lõi: không sắp xếp, không lọc, không phân trang (DataTable tự cắt trang).
const dacTinh = tableFeatures({});

/**
 * Bảng thật. Đây là file DUY NHẤT import TanStack Table (ESLint chặn nơi khác);
 * muốn đổi thư viện grid thì chỉ sửa ở đây. Nạp lười, chỉ khi hiện dạng bảng.
 */
export default function BangDuLieu<T extends object>({ dong, batDau, khoaDong, cot, tieuDeBang }: BangDuLieuProps<T>) {
  const cotBang = useMemo(() => {
    const ho = createColumnHelper<typeof dacTinh, T>();
    return cot.map((c) =>
      ho.display({
        id: c.id,
        header: c.tieuDe,
        cell: ({ row }) => c.o(row.original, batDau + row.index + 1),
      }),
    );
  }, [cot, batDau]);

  const bang = useTable({
    features: dacTinh,
    columns: cotBang,
    data: dong as T[],
    getRowId: (d) => khoaDong(d),
  });

  return (
    <div className={styles.vungCuon} role="region" aria-label={tieuDeBang} tabIndex={0}>
      <table className={styles.bang}>
        <caption>
          <VisuallyHidden>{tieuDeBang}</VisuallyHidden>
        </caption>
        <thead>
          {bang.getHeaderGroups().map((nhom) => (
            <tr key={nhom.id}>
              {nhom.headers.map((dau) => {
                const c = cot.find((x) => x.id === dau.column.id);
                return (
                  <th
                    key={dau.id}
                    scope="col"
                    className={cx(styles.dauCot, c?.khongXuongDong && styles.khongXuongDong)}
                    style={c?.rong ? { width: c.rong } : undefined}
                  >
                    {dau.isPlaceholder ? null : <bang.FlexRender header={dau} />}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {bang.getRowModel().rows.map((hang) => (
            <tr key={hang.id}>
              {hang.getAllCells().map((o) => {
                const c = cot.find((x) => x.id === o.column.id);
                return (
                  <td key={o.id} className={cx(c?.khongXuongDong && styles.khongXuongDong)}>
                    <bang.FlexRender cell={o} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
