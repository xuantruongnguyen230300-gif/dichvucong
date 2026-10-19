import { Folder } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../core/components/Card';
import { SearchBox } from '../../core/components/SearchBox';
import { SectionTitle } from '../../core/components/SectionTitle';
import { dangKyKhungCho } from '../../core/components/Skeleton/khungCho';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { cx } from '../../core/utils/cx';
import styles from './KhungChoLinhVuc.module.css';
import trang from './LinhVuc.module.css';
import oStyles from './OLinhVuc.module.css';
import qrStyles from './QrLinhVuc.module.css';

/** Đủ lấp một màn hình dọc (kiosk 1080×1920, 4 cột): phần dưới màn hình chỉ tốn vài phần tử DOM. */
const SO_O_KHUNG_CHO = 24;
const CAC_O = Array.from({ length: SO_O_KHUNG_CHO }, (_, i) => i);

const khongLam = () => undefined;

/**
 * Khung chờ của `/linh-vuc`: tiêu đề, khung tìm và lưới ô dựng bằng chính các lớp CSS của trang thật (cùng khoảng cách,
 * cùng số cột ở mọi khổ), ô giữ chỗ cao bằng ô thật có tên hai dòng và mã QR 9 rem. Dùng như phần tử con trực tiếp của
 * `.trang` để nhịp khoảng cách đúng bằng trang thật. Chân trang ẩn trong lúc chờ (`dangKyKhungCho`): khung chờ ngắn hơn
 * 75 ô thật nên chân trang mà hiện sẽ bị đẩy khỏi màn hình khi dữ liệu về (CLS).
 */
export function KhungChoLinhVuc() {
  const { t } = useTranslation(['linh-vuc', 'common']);
  useLayoutEffect(() => dangKyKhungCho(), []);

  return (
    <>
      <VisuallyHidden>
        <span role="status">{t('common:trang-thai.dang-tai')}</span>
      </VisuallyHidden>
      {/* Tiêu đề và ô tìm là chính các thành phần thật (không tương tác, ẩn khỏi trình đọc màn hình): cao đúng như thật */}
      <div aria-hidden="true" inert>
        <SectionTitle cap={2}>{t('linh-vuc:muc.tieu-de')}</SectionTitle>
      </div>
      <div className={trang.khungTim} aria-hidden="true" inert>
        <SearchBox nhan={t('linh-vuc:tim.nhan')} goiY={t('linh-vuc:tim.nhan')} giaTri="" onDoi={khongLam} />
        <p className={trang.huongDan}>{t('linh-vuc:huong-dan')}</p>
      </div>
      <ul className={trang.luoi} aria-hidden="true" aria-busy="true">
        {CAC_O.map((i) => (
          <li key={i} className={oStyles.muc}>
            <Card>
              <div className={oStyles.dau}>
                <span className={oStyles.bieuTuong} aria-hidden="true">
                  <Folder size={18} aria-hidden="true" />
                </span>
                <div className={cx(oStyles.chu, styles.chu)}>
                  <span className={cx(styles.dong, styles.dongTen)}>
                    <span className={cx(styles.khoi, styles.tenDai)} />
                  </span>
                  <span className={cx(styles.dong, styles.dongTen)}>
                    <span className={cx(styles.khoi, styles.tenNgan)} />
                  </span>
                  <span className={cx(styles.dong, styles.dongSo)}>
                    <span className={cx(styles.khoi, styles.so)} />
                  </span>
                </div>
              </div>
              <div className={oStyles.qr}>
                <div className={cx(qrStyles.qr, oStyles.khungQr)} />
                <span className={oStyles.chuThich} />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
