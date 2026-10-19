import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import type { CotBang } from '../../core/components/DataTable';
import { ExternalLink } from '../../core/components/ExternalLink';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import styles from './cotThuTuc.module.css';
import { linkDvc } from './linkDvc';
import { nhanMucDo } from './mucDo';
import { NutMoThuTuc } from './NutMoThuTuc';
import type { MucThuTuc } from './types';

/**
 * Cột của bảng thủ tục (ThuTucBang): STT, Mã, Tên thủ tục (bấm mở popup), Lĩnh vực, Mức độ,
 * Cơ quan thực hiện, Cổng DVC. Tiêu đề cột theo ngôn ngữ nên mảng nằm trong `useMemo`, ổn định giữa các lần vẽ.
 */
export function useCotThuTuc(): readonly CotBang<MucThuTuc>[] {
  const { t } = useTranslation('thu-tuc');
  return useMemo(
    () => [
      { id: 'stt', tieuDe: t('bang.stt'), o: (_d, stt) => stt, rong: '4rem', khongXuongDong: true },
      {
        id: 'ma',
        tieuDe: t('bang.ma'),
        o: (d) => <span className={styles.ma}>{d.ma}</span>,
        khongXuongDong: true,
      },
      { id: 'ten', tieuDe: t('bang.ten'), o: (d) => <NutMoThuTuc ma={d.ma} ten={d.ten} dang="bang" /> },
      { id: 'linh-vuc', tieuDe: t('bang.linh-vuc'), o: (d) => d.linhVuc },
      {
        id: 'muc-do',
        tieuDe: t('bang.muc-do'),
        o: (d) => {
          const nhan = nhanMucDo(t, d.mucDo);
          return nhan === null ? t('khong-co') : <Badge loai={d.mucDo === 'toan-trinh' ? 'success' : 'warning'}>{nhan}</Badge>;
        },
        khongXuongDong: true,
      },
      {
        id: 'co-quan',
        tieuDe: t('bang.co-quan'),
        o: (d) => (d.coQuanThucHien !== null && d.coQuanThucHien.trim() !== '' ? d.coQuanThucHien : t('khong-co')),
      },
      {
        id: 'cong-dvc',
        tieuDe: t('bang.cong-dvc'),
        o: (d) => (
          <ExternalLink href={linkDvc(d.ma)} bienThe="dam">
            {t('cong-dvc')}
            {' '}
            <VisuallyHidden>{t('cong-dvc-ten', { ten: d.ten })}</VisuallyHidden>
          </ExternalLink>
        ),
        khongXuongDong: true,
      },
    ],
    [t],
  );
}
