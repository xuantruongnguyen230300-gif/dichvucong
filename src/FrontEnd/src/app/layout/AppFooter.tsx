import { Landmark, Mail, MapPin, Phone, User, type LucideIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useThongTinTrungTam, type ThongTinTrungTam } from '../../core/api/trungTam';
import { ExternalLink } from '../../core/components/ExternalLink';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { dinhDangNgay } from '../../core/utils/dinhDang';
import { taoLinkDienThoai } from '../../core/utils/lienKet';
import styles from './AppFooter.module.css';

const coChu = (giaTri: string | null | undefined): giaTri is string => !!giaTri && giaTri.trim() !== '';

function Dong({ bieuTuong: BieuTuong, children }: { bieuTuong: LucideIcon; children: ReactNode }) {
  return (
    <li className={styles.dong}>
      <BieuTuong size={16} aria-hidden="true" className={styles.bieuTuong} />
      <span>{children}</span>
    </li>
  );
}

function Khoi({ tieuDe, children }: { tieuDe: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className={styles.tieuDeKhoi}>
        {tieuDe}
      </h2>
      <ul className={styles.danhSach}>{children}</ul>
    </section>
  );
}

/** Chân trang theo TT 22/2023 (BR-3–BR-7). Mục trống thì ẩn; khối không còn mục nào thì ẩn cả tiêu đề (BR-5). */
function NoiDung({ tt }: { tt: ThongTinTrungTam }) {
  const { t } = useTranslation();
  const kenh = [
    { khoa: 'zalo-oa', url: tt.mangXaHoi.zaloOa },
    { khoa: 'facebook', url: tt.mangXaHoi.facebook },
    { khoa: 'youtube', url: tt.mangXaHoi.youTube },
    { khoa: 'tiktok', url: tt.mangXaHoi.tikTok },
  ] as const;
  const kenhCoLink = kenh.filter((k) => coChu(k.url));
  const lienKet = tt.lienKet.filter((l) => coChu(l.ten));
  const coQuanChuQuan = coChu(tt.coQuanChuQuan) ? t('chan-trang.co-quan-chu-quan', { ten: tt.coQuanChuQuan }) : '';
  const nguoiChiuTrachNhiem = coChu(tt.chucVuNguoiChiuTrachNhiem)
    ? t('chan-trang.nguoi-chiu-trach-nhiem-chuc-vu', { hoTen: tt.nguoiChiuTrachNhiem, chucVu: tt.chucVuNguoiChiuTrachNhiem })
    : t('chan-trang.nguoi-chiu-trach-nhiem', { hoTen: tt.nguoiChiuTrachNhiem });

  return (
    <div className={styles.luoi}>
      <Khoi tieuDe={tt.ten}>
        {coChu(tt.coQuanChuQuan) && (
          <Dong bieuTuong={Landmark}>
            {coQuanChuQuan}
          </Dong>
        )}
        <Dong bieuTuong={User}>
          {nguoiChiuTrachNhiem}
        </Dong>
      </Khoi>

      <Khoi tieuDe={t('chan-trang.lien-he')}>
        <Dong bieuTuong={MapPin}>
          {tt.diaChi}
        </Dong>
        <Dong bieuTuong={Phone}>
          <ExternalLink href={taoLinkDienThoai(tt.dienThoai)}>{tt.dienThoai}</ExternalLink>
        </Dong>
        <Dong bieuTuong={Mail}>
          <ExternalLink href={`mailto:${tt.email}`}>{tt.email}</ExternalLink>
        </Dong>
        {coChu(tt.banDo) && (
          <Dong bieuTuong={MapPin}>
            <ExternalLink href={tt.banDo}>{t('chan-trang.xem-ban-do')}</ExternalLink>
          </Dong>
        )}
      </Khoi>

      {lienKet.length > 0 && (
        <Khoi tieuDe={t('chan-trang.lien-ket-huu-ich')}>
          {lienKet.map((l) => (
            <li key={`${l.url}|${l.ten}`}>
              <ExternalLink href={l.url}>{l.ten}</ExternalLink>
            </li>
          ))}
        </Khoi>
      )}

      {kenhCoLink.length > 0 && (
        <Khoi tieuDe={t('chan-trang.mang-xa-hoi')}>
          {kenhCoLink.map((k) => (
            <li key={k.khoa}>
              <ExternalLink href={k.url}>{t(`chan-trang.kenh.${k.khoa}`)}</ExternalLink>
            </li>
          ))}
        </Khoi>
      )}
    </div>
  );
}

/**
 * Khối giữ chỗ lúc chờ dữ liệu Trung tâm: cùng lưới, cùng số khối và số dòng điển hình của chân trang thật
 * (đơn vị dòng `lh` nên theo cỡ chữ, kể cả kiosk), để khi dữ liệu về chân trang không đổi chiều cao đáng kể
 * (F08 BR-11, TL-03: CLS ≤ 0,1). Bố cục thật tuỳ dữ liệu nên chỉ xấp xỉ; không phải nội dung.
 */
const KHOI_CHO: readonly (readonly ('1' | '2' | 'lk')[])[] = [
  ['1', '2'], // tên đơn vị: cơ quan chủ quản, người chịu trách nhiệm
  ['2', '1', '1', 'lk'], // liên hệ: địa chỉ, điện thoại, email, bản đồ
  ['lk', 'lk', 'lk'], // liên kết hữu ích
];

function KhoiChoDong() {
  return <span className={styles.khoiCho} data-dong="1" aria-hidden="true" />;
}

function KhungCho() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true">
      <VisuallyHidden>
        <span role="status">{t('trang-thai.dang-tai')}</span>
      </VisuallyHidden>
      <div className={styles.luoi} aria-hidden="true">
        {KHOI_CHO.map((dong, i) => (
          <div key={i}>
            <div className={styles.tieuDeKhoi}>
              {/* khối đầu là tên đơn vị: thường 2 dòng ở cột hẹp */}
              <span className={styles.khoiCho} data-dong={i === 0 ? '2' : '1'} />
            </div>
            <div className={styles.danhSach}>
              {dong.map((kieu, j) => (
                <span key={j} className={styles.khoiCho} data-dong={kieu} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Chân trang tối thiểu khi `AppFooter` lỗi dựng: chỉ còn lời miễn trừ (BR-7). */
export function ChanTrangToiThieu() {
  const { t } = useTranslation();
  return (
    <footer className={styles.chanTrang} data-nen-dam="">
      <div className={styles.khung}>
        <div className={styles.phapLy}>
          <p>{t('mien-tru')}</p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Chân trang: nền xanh đậm, chữ trắng, viền focus trắng (`data-nen-dam`). Đang tải: khối giữ chỗ cao xấp xỉ chân trang thật (không để trang nhảy khi dữ liệu về).
 * Lỗi hoặc chưa có dữ liệu: chỉ còn lời miễn trừ. Chừa khoảng trống cuối cho nút nổi (`--fab-clearance`, kiosk lớn hơn).
 * Không có dòng nhắc đăng xuất (F09 BR-4).
 */
export function AppFooter() {
  const { t } = useTranslation();
  const { data, isPending } = useThongTinTrungTam();
  const ngay = dinhDangNgay(data?.ngayCapNhatThuTuc);
  const cho = !data && isPending;
  const banQuyen = data ? t('chan-trang.ban-quyen', { ten: data.ten }) : '';

  return (
    <footer className={styles.chanTrang} data-nen-dam="">
      <div className={styles.khung}>
        {data ? <NoiDung tt={data} /> : isPending && <KhungCho />}
        <div className={styles.phapLy}>
          {ngay ? <p>{t('chan-trang.cap-nhat', { ngay })}</p> : cho && <KhoiChoDong />}
          <p>{t('mien-tru')}</p>
          {data ? (
            <p>
              {banQuyen}
            </p>
          ) : (
            cho && <KhoiChoDong />
          )}
        </div>
      </div>
    </footer>
  );
}
