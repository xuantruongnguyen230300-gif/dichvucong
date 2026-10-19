import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { DUONG_DAN, type KhoaTrang } from '../core/duongDan';
import { napNgonNguDanhMuc } from '../features/danh-muc/i18n';
import { napNgonNguLinhVuc } from '../features/linh-vuc/i18n';
import { napNgonNguThuTuc } from '../features/thu-tuc/i18n';
import { napNgonNguTrangChu } from '../features/trang-chu/i18n';
import { KhongTimThay } from './KhongTimThay';
import { Layout } from './layout/Layout';
import { LoiTrang } from './layout/LoiTrang';
import { handleTrang } from './layout/useKhoaTrang';
import { napNgonNguXemTruoc } from './xem-truoc/i18n';

// Trang nạp lười bằng React.lazy + <Suspense> đặt TRONG <main> của Layout (không dùng `lazy` của route):
// `lazy` của route chặn lần vẽ đầu tới khi chunk về, nên trên mạng chậm cả đầu và chân trang cũng chưa hiện (F08 AC-13).
// Hàm nạp gọi song song import() của trang và nạp câu chữ của tính năng.
const TrangChu = lazy(async () => {
  const [{ TrangChu: ThanhPhan }] = await Promise.all([
    import('../features/trang-chu/TrangChu'),
    napNgonNguTrangChu(),
    napNgonNguThuTuc(), // KhoiThuongGap (F03) có câu chữ ngay khi trang vẽ; khối vẫn tự nạp nếu thiếu
  ]);
  return { default: ThanhPhan };
});

// Danh mục thủ tục (F04): DataTable và popup chi tiết dùng câu chữ của `thu-tuc`, nên nạp cả hai cùng chunk của trang
const DanhMuc = lazy(async () => {
  const [{ DanhMuc: ThanhPhan }] = await Promise.all([
    import('../features/danh-muc/DanhMuc'),
    napNgonNguDanhMuc(),
    napNgonNguThuTuc(),
  ]);
  return { default: ThanhPhan };
});

// Lĩnh vực và mã QR (F05): chunk QrLinhVuc và thư viện QR chỉ nạp khi có ô vào màn hình (nằm trong feature, không ở đây)
const LinhVuc = lazy(async () => {
  const [{ LinhVuc: ThanhPhan }] = await Promise.all([import('../features/linh-vuc/LinhVuc'), napNgonNguLinhVuc()]);
  return { default: ThanhPhan };
});

// Trang xem trước thành phần: chỉ ở bản dev. Vite thay `import.meta.env.DEV` bằng `false` khi build,
// nên nhánh này (và chunk của trang) không vào bản production. Nằm ngoài Layout.
const tuyenXemTruoc: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/design-system',
        HydrateFallback: () => null,
        lazy: async () => {
          const [{ XemTruocThanhPhan }] = await Promise.all([
            import('./xem-truoc/XemTruocThanhPhan'),
            napNgonNguXemTruoc(),
          ]);
          return { Component: XemTruocThanhPhan };
        },
      },
    ]
  : [];

/** Mỗi route con có `handle.trang` (khoá câu chữ, tiêu đề tab, dữ liệu đặc tả) và `ErrorBoundary` riêng: lỗi chỉ thay vùng nội dung. */
const tuyen = (khoa: KhoaTrang, route: RouteObject): RouteObject => ({
  ...route,
  handle: handleTrang(khoa),
  ErrorBoundary: LoiTrang,
});

/** Bảng route của ứng dụng; tách khỏi router.tsx để test dựng router trong bộ nhớ từ cùng bảng này. */
export const cacTuyen: RouteObject[] = [
  ...tuyenXemTruoc,
  {
    path: DUONG_DAN.trangChu,
    Component: Layout,
    ErrorBoundary: LoiTrang,
    children: [
      tuyen('trang-chu', { index: true, Component: TrangChu }),
      tuyen('danh-muc', { path: DUONG_DAN.danhMuc.slice(1), Component: DanhMuc }),
      tuyen('linh-vuc', { path: DUONG_DAN.linhVuc.slice(1), Component: LinhVuc }),
      tuyen('khong-tim-thay', { path: '*', Component: KhongTimThay }),
    ],
  },
];
