import type { UseQueryResult } from '@tanstack/react-query';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { cx } from '../../core/utils/cx';
import styles from './BannerTrangChu.module.css';

/**
 * Banner đầu trang chủ (HeroBanner của design-system): cơ quan chủ quản (ẩn khi trống) · h1 = tên Trung tâm · câu mô tả cố định.
 * Chưa có ảnh trụ sở (DS-5): chỉ chữ trên nền gradient hai điểm bằng token, nên không có gì làm chậm lần hiển thị đầu (BR-5).
 * Đang tải: câu mô tả và h1 (câu dự phòng) hiện ngay, không chờ API (LCP); dòng cơ quan là khối giữ chỗ. Lỗi hoặc 404: h1 hiện câu dự phòng.
 * Chiều cao cố định: tên và cơ quan bị cắt bằng dấu "…" nếu vượt số dòng đã giữ chỗ (tên đầy đủ nằm ở `title`, đầu trang và chân trang),
 * nên dữ liệu về không bao giờ đẩy các khối bên dưới, kể cả với tên rất dài.
 * Lỗi của dữ liệu Trung tâm chỉ báo ở khối ô dịch vụ, không ở đây.
 */
export function BannerTrangChu({ truyVan }: { truyVan: UseQueryResult<ThongTinTrungTam> }) {
  const { t } = useTranslation('trang-chu');
  const idTieuDe = useId();

  const trungTam = truyVan.data;
  const dangTai = !trungTam && (truyVan.isPending || (truyVan.isError && truyVan.isFetching));
  const coQuan = trungTam?.coQuanChuQuan?.trim();
  const ten = trungTam?.ten.trim();

  return (
    <section className={styles.banner} aria-labelledby={idTieuDe}>
      {dangTai ? (
        <span className={cx(styles.cho, styles.choCoQuan)} aria-hidden="true" />
      ) : (
        coQuan && (
          <p className={styles.coQuan} title={coQuan}>
            {coQuan}
          </p>
        )
      )}
      <h1 id={idTieuDe} className={styles.tieuDe} title={ten || undefined}>
        {ten || t('banner.tieu-de-du-phong')}
      </h1>
      <p className={styles.moTa}>{t('banner.mo-ta')}</p>
    </section>
  );
}
