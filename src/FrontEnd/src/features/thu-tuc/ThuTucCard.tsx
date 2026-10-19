import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import { Card, CardActions } from '../../core/components/Card';
import { ExternalLink } from '../../core/components/ExternalLink';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { linkDvc } from './linkDvc';
import { nhanMucDo } from './mucDo';
import { NutMoThuTuc } from './NutMoThuTuc';
import type { MucThuTuc } from './types';
import styles from './ThuTucCard.module.css';

export interface ThuTucCardProps {
  thuTuc: MucThuTuc;
  /** Cấp tiêu đề của tên thủ tục: dưới `h2` của khối thì 3 (mặc định), dưới `h1` của trang thì 2. */
  capTieuDe?: 2 | 3;
}

/** Thẻ một thủ tục: nhãn lĩnh vực + mã, tên, mức độ + thời hạn, "Xem chi tiết" + "Xem và nộp trên Cổng DVC". */
export function ThuTucCard({ thuTuc, capTieuDe = 3 }: ThuTucCardProps) {
  const { t } = useTranslation('thu-tuc');
  const TieuDe = capTieuDe === 2 ? 'h2' : 'h3';
  const nhanMuc = nhanMucDo(t, thuTuc.mucDo);
  const thoiHan = thuTuc.thoiHan !== null && thuTuc.thoiHan.trim() !== '' ? thuTuc.thoiHan : null;

  return (
    <Card as="article">
      <div className={styles.dau}>
        <Badge loai="info">{thuTuc.linhVuc}</Badge>
        <span className={styles.ma}>{thuTuc.ma}</span>
      </div>
      <TieuDe className={styles.ten}>{thuTuc.ten}</TieuDe>
      <div className={styles.nhan}>
        {nhanMuc !== null && <Badge loai={thuTuc.mucDo === 'toan-trinh' ? 'success' : 'warning'}>{nhanMuc}</Badge>}
        {thoiHan !== null && (
          <Badge loai="neutral" bieuTuong={<Clock size={14} />} rutGon>
            {t('the.thoi-han', { thoiHan })}
          </Badge>
        )}
      </div>
      <CardActions>
        <NutMoThuTuc ma={thuTuc.ma} ten={thuTuc.ten} dang="the" />
        <ExternalLink href={linkDvc(thuTuc.ma)} bienThe="nut-accent">
          {t('cong-dvc')}
          {' '}
          <VisuallyHidden>{t('cong-dvc-ten', { ten: thuTuc.ten })}</VisuallyHidden>
        </ExternalLink>
      </CardActions>
    </Card>
  );
}
