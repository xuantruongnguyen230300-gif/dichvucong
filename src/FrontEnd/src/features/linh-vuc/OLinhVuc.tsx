import { Folder } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { LinhVuc } from '../../core/api/linhVuc';
import { Card } from '../../core/components/Card';
import { cx } from '../../core/utils/cx';
import { capCuaLinhVuc, taoLinkDanhMuc, taoLinkQr } from './linkQr';
import styles from './OLinhVuc.module.css';
import qrStyles from './QrLinhVuc.module.css';
import { RanhGioiQr } from './RanhGioiQr';
import { useHienTrenManHinh } from './useHienTrenManHinh';

// Chỉ nạp khi có ô cần vẽ; nơi duy nhất tham chiếu QrLinhVuc (và uqr) — không import tĩnh ở đâu khác
const napQr = () => import('./QrLinhVuc');
// `lazy` nhớ cả lần nạp lỗi: sau khi lỗi tạo bản mới để ô được vẽ lại sau đó (lọc/tìm vẽ lại lưới) nạp lại chunk
const qr = { thanhPhan: lazy(napQr) };
const napLaiQr = () => {
  qr.thanhPhan = lazy(napQr);
};

/** Chỗ giữ của mã QR: cùng cỡ 9 rem để ô không nhảy chiều cao khi mã về. */
function KhungQr() {
  return <div className={cx(qrStyles.qr, styles.khungQr)} aria-hidden="true" />;
}

/** Chỗ giữ của mã QR cùng dòng chú thích bên dưới (chú thích rỗng, chỉ giữ chiều cao). */
function KhungQrCoChuThich() {
  return (
    <>
      <KhungQr />
      <span className={styles.chuThich} aria-hidden="true" />
    </>
  );
}

interface OLinhVucProps {
  linhVuc: LinhVuc;
  /** Số quầy; `undefined` = chưa có phân công, không hiện dòng quầy (BR-4). */
  quay: number | undefined;
}

/**
 * Một ô lĩnh vực: tên (cả ô là liên kết tới danh mục đã lọc), số thủ tục mỗi cấp, quầy nếu có, mã QR.
 * Quan sát chính `<li>` để vẽ QR khi ô có một phần trong màn hình (BR-2, AC-5); đã vẽ thì giữ.
 */
export function OLinhVuc({ linhVuc, quay }: OLinhVucProps) {
  const { t } = useTranslation('linh-vuc');
  const [ref, daHien] = useHienTrenManHinh<HTMLLIElement>();

  return (
    <li ref={ref} className={styles.muc}>
      <Card>
        <div className={styles.dau}>
          <span className={styles.bieuTuong} aria-hidden="true">
            <Folder size={18} aria-hidden="true" />
          </span>
          <div className={styles.chu}>
            <Link className={styles.lienKet} to={taoLinkDanhMuc(capCuaLinhVuc(linhVuc), linhVuc.ma)}>
              {linhVuc.ten}
            </Link>
            <span className={styles.soThuTuc}>
              {t('o.so-thu-tuc', { xa: linhVuc.soThuTucXa, tinh: linhVuc.soThuTucTinh })}
            </span>
          </div>
        </div>
        {quay !== undefined && <p className={styles.quay}>{t('o.quay', { so: quay })}</p>}
        <div className={styles.qr}>
          {daHien ? <MaQr linhVuc={linhVuc} /> : <KhungQrCoChuThich />}
        </div>
      </Card>
    </li>
  );
}

/** Mã QR của ô; chunk nạp lỗi thì chỉ còn khung xám (chú thích vẫn giữ chỗ), ô và lưới không bị ảnh hưởng. */
function MaQr({ linhVuc }: { linhVuc: LinhVuc }) {
  const { t } = useTranslation('linh-vuc');
  const QrLinhVuc = qr.thanhPhan;
  return (
    <RanhGioiQr fallback={<KhungQrCoChuThich />} khiLoi={napLaiQr}>
      <Suspense fallback={<KhungQr />}>
        <QrLinhVuc link={taoLinkQr(window.location.origin, linhVuc)} ten={linhVuc.ten} ma={linhVuc.ma} />
      </Suspense>
      <p className={styles.chuThich}>{t('qr.chu-thich')}</p>
    </RanhGioiQr>
  );
}
