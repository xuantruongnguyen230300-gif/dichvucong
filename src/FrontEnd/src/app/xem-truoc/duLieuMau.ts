// Dữ liệu mẫu cho trang xem trước thành phần (chỉ bản dev). Không phải dữ liệu thật.
// Ký tự vô hình tạo bằng String.fromCodePoint, không dán ký tự thật vào mã.
const LRM = String.fromCodePoint(0x200e);
const ZWSP = String.fromCodePoint(0x200b);

export interface ThuTucMau {
  ma: string;
  ten: string;
  linhVuc: 'ho-tich' | 'dat-dai' | 'dang-ky-kinh-doanh' | 'giao-duc';
  mucDo: 'toan-trinh' | 'mot-phan';
  /** Chuỗi tìm kiếm đã chuẩn hoá khi nạp (F00 §4). */
  tim?: string;
}

export const NHAN_LINH_VUC: Record<ThuTucMau['linhVuc'], string> = {
  'ho-tich': 'Hộ tịch',
  'dat-dai': 'Đất đai',
  'dang-ky-kinh-doanh': 'Đăng ký kinh doanh',
  'giao-duc': 'Giáo dục và đào tạo',
};

const LINH_VUC: ThuTucMau['linhVuc'][] = ['ho-tich', 'dat-dai', 'dang-ky-kinh-doanh', 'giao-duc'];

const TEN: string[] = [
  `Đăng k${LRM}ý khai sinh`,
  'Đăng ký khai sinh lưu động',
  'Đăng ký kết hôn',
  'Đăng ký khai tử',
  'Cấp bản sao trích lục hộ tịch',
  'Thay đổi, cải chính hộ tịch',
  'Cấp giấy chứng nhận quyền sử dụng đất lần đầu',
  'Chuyển nhượng quyền sử dụng đất',
  'Đăng ký biến động đất đai',
  'Cấp lại giấy chứng nhận đã mất',
  'Tách thửa đất',
  'Thủy lợi nội đồng: cấp phép xây dựng công trình',
  'Thuỷ sản: đăng ký tàu cá',
  'Đăng ký thành lập hộ kinh doanh',
  'Đăng ký thay đổi nội dung hộ kinh doanh',
  'Tạm ngừng hoạt động hộ kinh doanh',
  'Chấm dứt hoạt động hộ kinh doanh',
  'Cấp giấy phép bán lẻ rượu',
  'Tuyển sinh vào lớp 1',
  'Chuyển trường tiểu học',
  'Xác nhận bảng điểm',
  'Cấp bản sao văn bằng từ sổ gốc',
  'Hỗ trợ chi phí học tập',
  'Miễn giảm học phí',
  `Chứng thực b${ZWSP}ản sao từ bản chính`,
  'Chứng thực chữ ký',
  'Chứng thực hợp đồng giao dịch',
  'Đăng ký tạm trú',
  'Đăng ký thường trú',
  'Xác nhận tình trạng hôn nhân',
  'Cấp giấy xác nhận thông tin cư trú',
  'Đăng ký nhận cha, mẹ, con',
  'Đăng ký giám hộ',
  'Cấp giấy phép xây dựng nhà ở riêng lẻ',
  'Gia hạn giấy phép xây dựng',
  'Điều chỉnh giấy phép xây dựng',
  'Xác nhận hồ sơ hưởng chính sách người có công',
  'Trợ cấp xã hội hằng tháng',
  'Cấp thẻ bảo hiểm y tế cho người nghèo',
  'Đăng ký nuôi con nuôi trong nước',
];

export const THU_TUC_MAU: ThuTucMau[] = TEN.map((ten, i) => ({
  ma: `1.${String(i + 1).padStart(6, '0')}`,
  ten,
  linhVuc: LINH_VUC[i % LINH_VUC.length]!,
  mucDo: i % 3 === 0 ? 'mot-phan' : 'toan-trinh',
}));

/** Một đoạn nội dung dài để thử cuộn trong popup. */
export const DOAN_DAI_MAU: string[] = Array.from(
  { length: 14 },
  (_, i) => `Đoạn ${i + 1}: nội dung mẫu dài để thử cuộn bên trong popup mà tiêu đề và chân popup vẫn nhìn thấy.`,
);

export const SO_DIEN_THOAI_MAU = '02723893900';
export const MA_TRA_CUU_MAU = 'AB12CD34';
export const LINK_XAU_MAU = 'javascript:alert(1)';

// --- Bảng màu kèm độ tương phản ---
export interface CapMau {
  chu: string; // tên token màu chữ
  nen: string; // tên token màu nền
  hexChu: string;
  hexNen: string;
}

export const CAP_MAU: CapMau[] = [
  { chu: '--color-text', nen: '--color-bg', hexChu: '#0f172a', hexNen: '#eef5fc' },
  { chu: '--color-text-muted', nen: '--color-bg', hexChu: '#475569', hexNen: '#eef5fc' },
  { chu: '--color-on-primary', nen: '--color-primary', hexChu: '#ffffff', hexNen: '#0b66c2' },
  { chu: '--color-on-primary', nen: '--color-primary-strong', hexChu: '#ffffff', hexNen: '#074a90' },
  { chu: '--color-on-primary', nen: '--color-accent', hexChu: '#ffffff', hexNen: '#dc2626' },
  { chu: '--color-primary', nen: '--color-surface', hexChu: '#0b66c2', hexNen: '#ffffff' },
  { chu: '--color-primary-strong', nen: '--color-primary-soft', hexChu: '#074a90', hexNen: '#e8f1fb' },
  { chu: '--color-success', nen: '--color-success-soft', hexChu: '#047857', hexNen: '#ecfdf5' },
  { chu: '--color-warning', nen: '--color-warning-soft', hexChu: '#92400e', hexNen: '#fffbeb' },
  { chu: '--color-danger', nen: '--color-danger-soft', hexChu: '#b91c1c', hexNen: '#fef2f2' },
  { chu: '--color-on-primary', nen: '--color-tile-indigo', hexChu: '#ffffff', hexNen: '#4f46e5' },
  { chu: '--color-on-primary', nen: '--color-tile-pink', hexChu: '#ffffff', hexNen: '#be185d' },
  { chu: '--color-on-primary', nen: '--color-tile-teal', hexChu: '#ffffff', hexNen: '#0f766e' },
  { chu: '--color-on-primary', nen: '--color-tile-orange', hexChu: '#ffffff', hexNen: '#c2410c' },
];

function doSang(hex: string): number {
  const kenh = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = kenh.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tỉ lệ tương phản WCAG giữa hai màu `#rrggbb`. */
export function tiLeTuongPhan(hexA: string, hexB: string): number {
  const [a, b] = [doSang(hexA), doSang(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const TOKEN_MAU: string[] = [
  '--color-primary',
  '--color-primary-strong',
  '--color-primary-soft',
  '--color-accent',
  '--color-accent-strong',
  '--color-bg',
  '--color-surface',
  '--color-surface-alt',
  '--color-border',
  '--color-border-strong',
  '--color-text',
  '--color-text-muted',
  '--color-success',
  '--color-success-soft',
  '--color-warning',
  '--color-warning-soft',
  '--color-danger',
  '--color-danger-soft',
  '--color-neutral-soft',
  '--color-skeleton',
];

export const TOKEN_CHU: { ten: string; token: string }[] = [
  { ten: 'xs · 11px', token: '--font-size-xs' },
  { ten: 'sm · 12px', token: '--font-size-sm' },
  { ten: 'md · 13px', token: '--font-size-md' },
  { ten: 'lg · 14px', token: '--font-size-lg' },
  { ten: 'xl · 18px', token: '--font-size-xl' },
  { ten: '2xl · 20px', token: '--font-size-2xl' },
  { ten: '3xl · 28px', token: '--font-size-3xl' },
];

export const TOKEN_KHOANG_CACH: string[] = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8'];
export const TOKEN_BO_GOC: string[] = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-pill'];
export const TOKEN_BONG: string[] = ['--shadow-sm', '--shadow-md'];

/** Từ khoá chắc chắn không khớp mục nào, và từ khoá chứa thẻ HTML (phải hiện nguyên chữ). */
export const TU_KHOA_KHONG_KET_QUA = 'xyzxyz';
export const TU_KHOA_HTML = '<b>abc</b>';

// --- Khối "Tìm 1.000 mục" (AC-25) ---
export const SO_MUC_TIM_KIEM = 1000;

const DONG_TU_1000: readonly string[] = [
  'Đăng ký',
  'Cấp',
  'Cấp lại',
  'Thay đổi',
  'Xác nhận',
  'Gia hạn',
  'Chứng thực',
  'Điều chỉnh',
  'Tạm ngừng',
  'Chấm dứt',
];

const DOI_TUONG_1000: readonly string[] = [
  'khai sinh',
  'khai tử',
  'kết hôn',
  'giám hộ',
  'hộ kinh doanh',
  'giấy phép xây dựng',
  'quyền sử dụng đất',
  'thẻ bảo hiểm y tế',
  'trợ cấp xã hội',
  'thường trú',
  'tạm trú',
  'bản sao từ bản chính',
  'chữ ký',
  'hợp đồng giao dịch',
  'văn bằng, chứng chỉ',
  'học phí',
  'thủy lợi nội đồng',
  'thuỷ sản',
  'tàu cá',
  'giấy phép bán lẻ rượu',
  'người có công',
  'nuôi con nuôi',
  'cư trú',
  'hồ sơ địa chính',
  'tình trạng hôn nhân',
];

const HAU_TO_1000: readonly string[] = ['', ' tại cấp xã', ' (trường hợp đặc biệt)', ' qua dịch vụ công trực tuyến'];

export interface MucTimKiem {
  ten: string;
  /** Chuỗi tìm kiếm đã chuẩn hoá khi nạp dữ liệu (F00 §4). */
  tim: string;
}

/**
 * Sinh 1.000 tên thủ tục (10 động từ × 25 đối tượng × 4 hậu tố). Cứ 7 mục thì một mục chèn U+200E
 * vào chữ "ký" của "Đăng ký", cứ 11 mục thì một mục chèn U+200B giữa hai chữ của đối tượng,
 * để thử đúng đường lọc F03/F04 dùng. Ký tự vô hình ghép bằng `String.fromCodePoint`.
 */
export function taoDanhSach1000(): string[] {
  const ten: string[] = [];
  for (const dongTu of DONG_TU_1000) {
    for (const doiTuong of DOI_TUONG_1000) {
      for (const hauTo of HAU_TO_1000) {
        const i = ten.length;
        const dt = dongTu === 'Đăng ký' && i % 7 === 0 ? `Đăng k${LRM}ý` : dongTu;
        const o = i % 11 === 0 ? doiTuong.replace(' ', ` ${ZWSP}`) : doiTuong;
        ten.push(`${dt} ${o}${hauTo}`);
      }
    }
  }
  return ten;
}
