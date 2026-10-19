import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { DUONG_DAN } from '../../core/duongDan';
import { useThongTinTrungTam, type ThongTinTrungTam } from '../../core/api/trungTam';
import { DieuHuongChinh } from './DieuHuongChinh';
import { DUONG_LOGO } from './logo';
import styles from './AppHeader.module.css';

/**
 * Địa bàn = "<xã> – <tỉnh>" nguyên văn từ dữ liệu (BR-5): không ghép thêm chữ "xã", "tỉnh", không tự viết hoa.
 * Thiếu một thì hiện cái còn lại; thiếu cả hai thì không có dòng.
 */
function useDiaBan(trungTam: Pick<ThongTinTrungTam, 'xa' | 'tinh'> | undefined): string {
  const { t } = useTranslation();
  const xa = trungTam?.xa?.trim() ?? '';
  const tinh = trungTam?.tinh?.trim() ?? '';
  if (xa && tinh) return t('dau-trang.dia-ban', { xa, tinh });
  return xa || tinh;
}

/**
 * Đầu trang (BR-1, BR-2, BR-14): biểu tượng + tên Trung tâm + địa bàn, cả cụm là một liên kết về trang chủ; kèm điều hướng chính.
 * Điều hướng là anh em của `<header>` (không nằm trong) để dính đầu màn hình được suốt chiều dài trang.
 * Tên tối đa `--dau-trang-dong-ten` dòng, địa bàn `--dau-trang-dong-dia-ban` dòng (line-clamp; chữ đầy đủ vẫn trong DOM và `title`),
 * và chiều cao tối thiểu của đầu trang tính từ hai số đó: dữ liệu về muộn hay dài đến đâu đầu trang cũng không đổi chiều cao.
 * Đang tải: giữ chiều cao, hiện khối giữ chỗ. Lỗi hoặc chưa có dữ liệu: chỉ còn biểu tượng; liên kết vẫn có tên "Trang chủ".
 */
export function AppHeader() {
  const { t } = useTranslation();
  const { data, isPending } = useThongTinTrungTam();
  const diaBan = useDiaBan(data);

  return (
    <>
      <header className={styles.dauTrang}>
        <div className={styles.khung}>
          <Link to={DUONG_DAN.trangChu} className={styles.thuongHieu}>
            {DUONG_LOGO && <img src={DUONG_LOGO} width={40} height={40} alt="" className={styles.logo} />}
            {data ? (
              <span className={styles.chu}>
                <span className={styles.ten} title={data.ten}>
                  {data.ten}
                </span>{' '}
                {diaBan && (
                  <span className={styles.diaBan} title={diaBan}>
                    {diaBan}
                  </span>
                )}
              </span>
            ) : (
              <>
                {isPending && (
                  <span className={styles.chu} aria-hidden="true">
                    <span className={styles.khoiTen} />
                    <span className={styles.khoiDiaBan} />
                  </span>
                )}
                <VisuallyHidden>{t('trang.trang-chu.ten')}</VisuallyHidden>
              </>
            )}
          </Link>
        </div>
      </header>
      <DieuHuongChinh />
    </>
  );
}
