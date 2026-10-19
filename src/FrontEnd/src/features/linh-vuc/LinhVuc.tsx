import { Suspense, use } from 'react';
import { useTranslation } from 'react-i18next';
import { useLinhVuc } from '../../core/api/linhVuc';
import { QueryState } from '../../core/components/QueryState';
import { Skeleton } from '../../core/components/Skeleton';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { useQuayLinhVuc } from './api/quayLinhVuc';
import { daNapNgonNguLinhVuc, napNgonNguLinhVuc } from './i18n';
import { KhungChoLinhVuc } from './KhungChoLinhVuc';
import styles from './LinhVuc.module.css';
import { LinhVucNoiDung } from './LinhVucNoiDung';

/** Khung chờ khi câu chữ của trang chưa về (hiếm: route nạp chunk và câu chữ cùng lúc): chưa có chữ nên chỉ là khối trơn. */
const KhungChoNgonNgu = () => (
  <div className={styles.trang}>
    <Skeleton dang="the" soMuc={6} />
  </div>
);

const KHONG_CO_QUAY: ReadonlyMap<string, number> = new Map();

/**
 * Trang `/linh-vuc` (F05): lưới lĩnh vực kèm mã QR, ô tìm. Đầu, chân trang, tiêu đề tab do `Layout` lo.
 * Câu chữ (namespace `linh-vuc`) route nạp song song với chunk; ở đây `use()` cùng promise đó cho chắc.
 */
export function LinhVuc() {
  return (
    <Suspense fallback={<KhungChoNgonNgu />}>
      <LinhVucTai />
    </Suspense>
  );
}

function LinhVucTai() {
  if (!daNapNgonNguLinhVuc()) use(napNgonNguLinhVuc());
  const { t } = useTranslation('common');
  const linhVuc = useLinhVuc();
  const quay = useQuayLinhVuc();
  // Chờ cả hai yêu cầu xong rồi mới hiện lưới: dòng quầy chèn vào sau sẽ làm ô nhảy chiều cao.
  // Quầy lỗi thì coi như chưa có quầy: không báo lỗi; chỉ lỗi danh sách lĩnh vực mới báo (BR-4).
  const quayXong = !quay.isPending;

  return (
    <div className={styles.trang}>
      <VisuallyHidden>
        <h1>{t('trang.linh-vuc.ten')}</h1>
      </VisuallyHidden>
      <QueryState truyVan={linhVuc} khungCho={<KhungChoLinhVuc />}>
        {(ds) => (quayXong ? <LinhVucNoiDung linhVuc={ds} quay={quay.data ?? KHONG_CO_QUAY} /> : <KhungChoLinhVuc />)}
      </QueryState>
    </div>
  );
}
