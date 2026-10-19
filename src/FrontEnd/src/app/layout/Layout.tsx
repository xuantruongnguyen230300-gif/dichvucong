import { lazy, Suspense, useRef, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, ScrollRestoration } from 'react-router';
import { Skeleton, useCoKhungCho } from '../../core/components/Skeleton';
import { napGiaoDienKiosk } from '../../core/kiosk/napGiaoDien';
import { useCheDoKiosk } from '../../core/kiosk/useCheDoKiosk';
import { NutTroLy } from '../../features/chatbot/NutTroLy';
import { ThuTucPopup } from '../../features/thu-tuc/ThuTucPopup';
import { AppFooter, ChanTrangToiThieu } from './AppFooter';
import { AppHeader } from './AppHeader';
import { DacTaTrang } from './DacTaTrang';
import { LienHeTuTrungTam } from './LienHeTuTrungTam';
import { RanhGioiKhung } from './RanhGioiKhung';
import styles from './Layout.module.css';

// Nút "Bắt đầu lại" và điều hướng thay lịch sử của kiosk (F09): chunk riêng, chỉ nạp khi bật kiosk
const LopKiosk = lazy(() => napGiaoDienKiosk().then((m) => ({ default: m.LopKiosk })));

/**
 * Khung chờ trong lúc chunk của route về. Cao tối thiểu một màn hình: chân trang nằm dưới màn hình đầu ngay từ đầu,
 * nên khi nội dung thật thay vào, chân trang dịch chuyển ngoài tầm nhìn và không tính vào CLS (trên điện thoại,
 * khung chờ ngắn để chân trang nằm giữa màn hình rồi bị đẩy xuống khi trang về: CLS ≈ 0,53).
 */
function KhungCho() {
  return (
    <div className={styles.khungCho}>
      <Skeleton dang="dong" />
    </div>
  );
}

/**
 * Khung chung của mọi trang (F08 §4.2). Thứ tự DOM = thứ tự Tab = thứ tự đọc:
 * liên kết bỏ qua → biểu tượng và tên → 3 mục điều hướng → nội dung → chân trang.
 * Đang tải, lỗi, không có kết quả của trang chỉ nằm trong `<main>`; đầu và chân trang nằm ngoài, hiện ngay khi JS chạy,
 * mỗi bên có ranh giới lỗi riêng (lỗi một bên không kéo sập phần còn lại).
 */
export function Layout() {
  const { t } = useTranslation();
  const vungNoiDung = useRef<HTMLElement>(null);
  const laKiosk = useCheDoKiosk();
  const coKhungCho = useCoKhungCho();

  // Không đổi địa chỉ trang (không thêm #noi-dung): chỉ chuyển con trỏ vào <main>
  const boQua = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    vungNoiDung.current?.focus();
  };

  return (
    <LienHeTuTrungTam>
      <div className={styles.khung}>
        <a href="#noi-dung" className={styles.boQua} onClick={boQua}>
          {t('bo-qua')}
        </a>
        <RanhGioiKhung>
          <AppHeader />
        </RanhGioiKhung>
        <main id="noi-dung" ref={vungNoiDung} tabIndex={-1} className={styles.noiDung}>
          <Suspense fallback={<KhungCho />}>
            <Outlet />
          </Suspense>
        </main>
        {/* Chân trang ẩn khi trang còn khung chờ (CLS): xem core/components/Skeleton/khungCho.ts */}
        <div className={coKhungCho ? styles.chanTrangAn : undefined}>
          <RanhGioiKhung fallback={<ChanTrangToiThieu />}>
            <AppFooter />
          </RanhGioiKhung>
        </div>
        {/* F06: nút Trợ lý nổi (C01 BR-13), góc phải dưới; khung chat nạp lười ở lần bấm đầu. Chân trang đã chừa chỗ (--fab-clearance). */}
        <RanhGioiKhung>
          <NutTroLy />
        </RanhGioiKhung>
        {/* F09: chỉ ở kiosk. LopKiosk vẽ "Bắt đầu lại" thành con trực tiếp của <body> (portal), nên đi sau cả cây này. */}
        {laKiosk && (
          <RanhGioiKhung>
            <Suspense fallback={null}>
              <LopKiosk />
            </Suspense>
          </RanhGioiKhung>
        )}
      </div>
      {/* F03: popup chi tiết thủ tục dùng chung, mở bằng `?ma=` trên mọi trang. Không có `ma` thì không vẽ và không tải gì. */}
      <RanhGioiKhung>
        <ThuTucPopup />
      </RanhGioiKhung>
      <DacTaTrang />
      <ScrollRestoration getKey={(viTri) => viTri.pathname} />
    </LienHeTuTrungTam>
  );
}
