import { Suspense, use } from 'react';
import { useTranslation } from 'react-i18next';
import { useDanhMucThuTuc } from '../../core/api/danhMucThuTuc';
import { QueryState } from '../../core/components/QueryState';
import { Skeleton } from '../../core/components/Skeleton';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { daNapNgonNguThuTuc, napNgonNguThuTuc } from '../thu-tuc/i18n';
import styles from './DanhMuc.module.css';
import { DanhMucNoiDung } from './DanhMucNoiDung';
import { KhungChoDanhMuc } from './KhungChoDanhMuc';

/** Khung chờ khi câu chữ chưa về (hiếm: route nạp chunk và câu chữ cùng lúc): chưa có chữ nên chỉ là khối trơn. */
const KhungChoNgonNgu = () => (
  <div className={styles.trang}>
    <Skeleton dang="the" soMuc={12} />
  </div>
);

/**
 * Trang `/thu-tuc` (F04): thống kê, hai tab Cấp xã / Cấp tỉnh, thanh lọc, danh sách thẻ hoặc bảng.
 * Đầu, chân trang, tiêu đề tab và popup chi tiết (`?ma=`) do `Layout` lo. Câu chữ của danh sách thủ tục
 * (namespace `thu-tuc`) tự nạp ở đây; câu chữ `danh-muc` do route nạp (`napNgonNguDanhMuc`).
 */
export function DanhMuc() {
  return (
    <Suspense fallback={<KhungChoNgonNgu />}>
      <DanhMucTai />
    </Suspense>
  );
}

function DanhMucTai() {
  if (!daNapNgonNguThuTuc()) use(napNgonNguThuTuc());
  const { t } = useTranslation('common');
  const truyVan = useDanhMucThuTuc();

  return (
    <div className={styles.trang}>
      <VisuallyHidden>
        <h1>{t('trang.danh-muc.ten')}</h1>
      </VisuallyHidden>
      <QueryState truyVan={truyVan} khungCho={<KhungChoDanhMuc />}>
        {(danhMuc) => <DanhMucNoiDung danhMuc={danhMuc} />}
      </QueryState>
    </div>
  );
}
