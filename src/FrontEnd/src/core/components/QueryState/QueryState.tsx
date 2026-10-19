import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorState } from '../ErrorState';

export interface QueryStateProps<T> {
  truyVan: UseQueryResult<T>;
  khungCho: ReactNode; // Skeleton có hình dạng của nội dung
  children: (duLieu: T) => ReactNode;
}

/**
 * Một cách xử lý chung cho F02–F06: đang tải → khung chờ; lỗi → ErrorState; xong → nội dung.
 * Bấm "Thử lại" thì chuyển sang khung chờ, rồi hiện kết quả hoặc lỗi (BR-11).
 */
export function QueryState<T>({ truyVan, khungCho, children }: QueryStateProps<T>) {
  if (truyVan.isPending || (truyVan.isError && truyVan.isFetching)) return <>{khungCho}</>;
  if (truyVan.isError) return <ErrorState loi={truyVan.error} onThuLai={() => void truyVan.refetch()} />;
  return <>{children(truyVan.data)}</>;
}
