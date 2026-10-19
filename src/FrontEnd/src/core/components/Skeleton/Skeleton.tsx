import { useTranslation } from 'react-i18next';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useCachXem } from '../../hooks/useCachXem';
import { VisuallyHidden } from '../VisuallyHidden';
import luoi from '../../styles/luoiThe.module.css';
import tile from '../Tile/Tile.module.css';
import { dangKyKhungCho } from './khungCho';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  dang: 'the' | 'bang' | 'dong' | 'o';
  soMuc?: number; // số thẻ / số dòng / số ô
  soCotToiDa?: number; // dạng thẻ: giống DataTable
}

const MAC_DINH = { the: 6, bang: 8, dong: 3, o: 6 } as const;

/**
 * Khung giữ chỗ khi đang tải (BR-11). Khối đứng yên (không animation); trình đọc màn hình chỉ nghe "Đang tải…".
 * `dang="the"` là khung chờ của DANH SÁCH (DataTable): theo dạng xem hiện hành (`useCachXem`) mà vẽ lưới thẻ hoặc bảng,
 * để danh sách thật về không đổi chiều cao (CLS). `dang="bang"` luôn là bảng.
 * Khi có khung chờ, `Layout` ẩn chân trang (xem `khungCho.ts`).
 */
export function Skeleton({ dang, soMuc = MAC_DINH[dang], soCotToiDa = 4 }: SkeletonProps) {
  const { t } = useTranslation('common');
  const { cachXem } = useCachXem();
  const muc = Array.from({ length: soMuc }, (_, i) => i);
  const goc = useRef<HTMLDivElement>(null);

  // Báo cho Layout ẩn chân trang khi đang có khung chờ (trừ trong popup). Layout effect: chân trang ẩn ngay trước lần vẽ đầu.
  useLayoutEffect(() => (goc.current?.closest('[role="dialog"]') ? undefined : dangKyKhungCho()), []);

  let noiDung;
  if (dang === 'bang' || (dang === 'the' && cachXem === 'bang')) {
    // Cùng hình học với bảng thật của DataTable: khung viền, đầu bảng, mỗi dòng cao bằng dòng bảng thật
    noiDung = (
      <div className={styles.bang}>
        <span className={styles.dauBang} />
        {muc.map((i) => (
          <span key={i} className={styles.dongBang}>
            <span className={styles.khoi} data-rong="dong" />
          </span>
        ))}
      </div>
    );
  } else if (dang === 'the') {
    noiDung = (
      <div className={luoi.luoi} style={{ '--so-cot-toi-da': soCotToiDa } as CSSProperties}>
        {muc.map((i) => (
          <div key={i} className={luoi.muc}>
            <div className={styles.the}>
              <span className={styles.khoi} data-rong="vua" />
              <span className={styles.khoi} />
              <span className={styles.khoi} data-rong="ngan" />
              <span className={styles.khoi} data-rong="nhan" />
              <span className={styles.khoi} data-rong="nut" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (dang === 'o') {
    // Cùng lưới 2/3/6 cột, khung và khoảng cách với Tile thật (dùng chung lớp CSS của Tile); cao bằng ô có tên hai dòng
    // và dòng "Trang ngoài" (ô cao nhất), để trang không giật khi dữ liệu về.
    noiDung = (
      <div className={tile.luoi}>
        {muc.map((i) => (
          <div key={i} className={tile.muc}>
            <div className={tile.o}>
              <span className={styles.khoi} data-rong="bieu-tuong" />
              <span className={styles.dongTen}>
                <span className={styles.khoi} data-rong="ten-o" />
                <span className={styles.khoi} data-rong="ten-o-ngan" />
              </span>
              <span className={styles.dongNgoai}>
                <span className={styles.khoi} data-rong="ngoai" />
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    noiDung = (
      <div className={styles.dong}>
        {muc.map((i) => (
          <span key={i} className={styles.khoi} data-rong={i === muc.length - 1 ? 'ngan' : undefined} />
        ))}
      </div>
    );
  }

  return (
    <div ref={goc} aria-busy="true">
      <VisuallyHidden>
        <span role="status">{t('trang-thai.dang-tai')}</span>
      </VisuallyHidden>
      <div aria-hidden="true">{noiDung}</div>
    </div>
  );
}
