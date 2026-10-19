---
id: C01
ten: Thành phần giao diện dùng chung
spec: spec.md (da-duyet 2026-10-12)
nguon: spec.md; .specify/design-system.md §3–§10 (duyệt 2026-10-12); .specify/design-system-xem-truoc.html và .specify/prototype/index.html (duyệt 2026-10-12); F00 plan §2, §2b; F03 BR-6–BR-9, F04 BR-3, BR-8, F08 BR-5, BR-11, F09 BR-1, BR-4, BR-7
cap_nhat: 2026-10-12
---

# C01 · Thành phần giao diện dùng chung — kế hoạch kỹ thuật

## 1. Tóm tắt

- **Giải quyết:** bộ token và các component lõi mà F02–F09 dùng chung, gồm:
  - cờ chế độ kiosk để component đổi kích thước;
  - trang xem trước thành phần trong app, chỉ có ở bản dev (kế hoạch 3.3).
- **Chạm:** chỉ frontend — `src/FrontEnd/src/core/`, `src/FrontEnd/src/app/`, cấu hình build FE (ui-core-dev). Không đụng DB, BE, công cụ nhập, trợ lý.
- **Thay cho:** F00 T13 (tokens, component lõi, trang xem trước); kế hoạch 3.3, 5.3, 5.4 và phần component của 5.5.
- **Nguồn số đo:**
  - Token, quy cách: design-system §3, §5, §6.
  - Chi tiết design-system không ghi (nền đầu bảng, viền nhãn, màu ô dịch vụ, lớp phủ…): lấy từ CSS của prototype đã duyệt.
  - Prototype khác spec thì theo spec:
    - Khối giữ chỗ của prototype có hiệu ứng chạy liên tục → C01 BR-11 yêu cầu đứng yên.
    - Nút Trước/Sau của prototype chỉ có icon → từ 600 px có thêm chữ (§4.8).
- **Không làm:**
  - Chế độ tối: design-system không định nghĩa → không có `prefers-color-scheme`; đặt `color-scheme: light` để ô nhập không đổi màu theo máy.
  - Sắp xếp theo cột trong `DataTable`: mô tả agent có nhắc, nhưng spec không yêu cầu; F03, F04 giữ thứ tự của dữ liệu.

## 2. Dữ liệu

Không đổi. Không có entity, bảng, migration.

## 3. Hợp đồng với các chức năng (thay cho mục API)

C01 không có endpoint. Hợp đồng gồm ba phần: props của component (§4), khoá i18n (§4.12), và các quy ước DOM/CSS ở §3.2.

### 3.1 Quy ước chung

- **Thư mục:**
  - Mỗi component một thư mục `core/components/<Ten>/`: `<Ten>.tsx`, `<Ten>.module.css`, `<Ten>.test.tsx`, `index.ts`.
  - Không có barrel chung `core/components/index.ts`. Lý do: import CSS Module là side effect, nên import qua barrel kéo CSS của mọi component vào chunk gọi tới.
- **Câu chữ:**
  - Chuỗi chung (Đóng, Thử lại, Trước, Sau, Xoá bộ lọc…): component tự lấy từ `common`.
  - Chuỗi nghiệp vụ (nhãn ô tìm, tên đối tượng, tên cột, chữ trên nút nổi…): feature truyền vào, đã qua `t()` của namespace feature. Kiểu prop là `string`.
  - Biến nội suy đặt tên `so`, không dùng `count`, để i18next không đi tìm khoá số nhiều.
- **CSS:**
  - Chỉ dùng `var(--…)` từ `tokens.css`, không viết giá trị cứng.
  - Cỡ px cố định riêng của từng component (đệm, bo, cỡ icon, độ rộng khung…) lấy theo prototype đã duyệt (`.specify/prototype/index.html`), viết trong CSS Module của component đó; không thêm token cho từng cỡ. Chỉ giá trị dùng chung nhiều nơi mới là token (`--control-height`, `--space-*`, `--radius-*`…).
  - Vùng chạm tối thiểu là token `--target-min: 24px` (BR-1, AC-2): mọi phần tử bấm được có `min-width` và `min-height` bằng token này; AC-2 kiểm bằng e2e (tester).
  - Ngoại lệ là mốc `@media`, vì CSS không cho dùng biến trong media query. Dùng đúng 600 px và 1024 px; JS lấy cùng mốc từ `core/styles/diemGay.ts`.
- **Ghép class:** dùng `core/utils/cx.ts` (vài dòng), không thêm gói `clsx`.
- **Style động** (vd. số cột tối đa của lưới thẻ):
  - Chỉ qua biến CSS gán bằng prop `style` của React. React gán qua CSSOM, nên CSP `style-src 'self'` không chặn.
  - Không `setAttribute('style', …)`, không chèn `<style>` lúc chạy.
- **Hiệu ứng:**
  - `transition` chỉ trên `opacity` và `transform`, dài `var(--duration-fast)` (150 ms) (C01 BR-1).
  - Đổi màu khi rê chuột thì đổi ngay, không có transition.
  - Không `animation` lặp. Không cuộn mượt (`behavior: 'smooth'`).
- **Icon:**
  - Import đích danh từng icon từ `lucide-react` (vd. `import { Search } from 'lucide-react'`).
  - ESLint chặn import cả bộ: `import *`, export `icons`, `DynamicIcon`, `lucide-react/dynamic`.
  - Cỡ 16 px trong nút và nhãn, 20 px khi đứng riêng; nét 2.
  - Icon trang trí luôn có `aria-hidden="true"`. Component lõi tự truyền thuộc tính này, không dựa vào mặc định của thư viện.
- **TanStack Table:** chỉ `core/components/DataTable/BangDuLieu.tsx` được import `@tanstack/react-table`; ESLint chặn mọi chỗ khác (CLAUDE.md).
- **Ref:** React 19 nhận `ref` như prop thường, nên mọi component có phần tử bấm được hay ô nhập đều chuyển `ref` xuống phần tử đó. F06 cần ref để trả con trỏ về nút trợ lý; feature cần ref để đưa con trỏ về ô tìm.

### 3.2 Quy ước dùng chung với F06, F08, F09

| Quy ước | Ai đặt | Ai dùng | Ý nghĩa |
|---|---|---|---|
| class `kiosk` trên `<html>` | `core/kiosk` (§4.4) | `tokens.css`, CSS component | Bật cỡ kiosk (C01 BR-1, design-system §3) |
| `data-nen-dam` | F08 (chân trang), F02 (dải giờ làm việc) | `global.css` | Viền focus màu trắng trên nền xanh đậm (BR-1, AC-1) |
| `data-ngoai-popup` | F09 (nút "Bắt đầu lại") | `Modal` | Phần tử nằm ngoài popup nhưng vẫn bấm được, và là phần tử cuối vòng Tab khi popup mở (BR-9). Phải là **con trực tiếp của `<body>`** (render qua portal), vì khi mở, `Modal` đặt `inert` cho mọi con khác của `<body>` |
| `--fab-clearance` | `tokens.css` | F08 (đệm cuối chân trang) | Chừa chỗ để nút nổi không che chân trang (BR-13, F09 BR-7) |
| `--sticky-offset` | F08 (chiều cao thanh điều hướng dính); mặc định `0px` trong tokens | `DataTable` | `scroll-margin-top` và chiều cao vùng bảng — thanh điều hướng không che đầu danh sách |
| `LienHeProvider` (`soDienThoai`) | F08 (từ thông tin Trung tâm) | `ErrorState`, `EmptyState` | Số điện thoại bấm để gọi trong thông báo lỗi và không có kết quả (BR-11). Không có số (chưa tải được, hoặc chưa có provider) → ẩn dòng số |

## 4. Frontend

### 4.1 Token và kiểu nền — `core/styles/`

`tokens.css`. Giá trị lấy từ design-system §3; mục "bổ sung" lấy từ prototype đã duyệt:

| Nhóm | Token |
|---|---|
| Màu (design-system) | `--color-primary` `#0b66c2`, `--color-primary-strong` `#074a90`, `--color-primary-soft` `#e8f1fb`, `--color-accent` `#dc2626`, `--color-accent-strong` `#b91c1c`, `--color-bg` `#eef5fc`, `--color-surface` `#ffffff`, `--color-border` `#d3e0ee`, `--color-border-strong` `#6b84a3`, `--color-text` `#0f172a`, `--color-text-muted` `#475569`, `--color-on-primary` `#ffffff`, `--color-success`/`-soft` `#047857`/`#ecfdf5`, `--color-warning`/`-soft` `#92400e`/`#fffbeb`, `--color-danger`/`-soft` `#b91c1c`/`#fef2f2` |
| Màu bổ sung (prototype) | `--color-surface-alt` `#f6f9fd` (đầu bảng), `--color-row-hover` `#f8fbff`, `--color-neutral-soft` `#f1f5f9` (nhãn trung tính), `--color-success-border` `#a7dcc6`, `--color-warning-border` `#f3d48a`, `--color-danger-border` `#f5b5b5`, `--color-overlay` `rgb(15 23 42 / 45%)`, `--color-skeleton` `#e7eef6`, `--color-focus` = `--color-primary`, `--color-focus-on-dark` `#ffffff` |
| Màu ô dịch vụ (prototype) | `--color-tile-indigo` `#4f46e5`, `--color-tile-pink` `#be185d`, `--color-tile-teal` `#0f766e`, `--color-tile-orange` `#c2410c`, `--color-tile-blue` = primary, `--color-tile-navy` = primary-strong. Icon trắng trên các màu này đạt ≥ 5:1 |
| Chữ | `--font-family` `"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; `--font-family-mono` `ui-monospace, "Cascadia Mono", Consolas, monospace`; `--font-size-xs` .6875rem (11px) · `sm` .75rem · `md` .8125rem · `lg` .875rem · `xl` 1.125rem · `2xl` 1.25rem · `3xl` 1.75rem; `--line-height-body` 1.4, `--line-height-heading` 1.25, `--line-height-chat` 1.55 |
| Khoảng cách | `--space-1` 4px · `2` 8px · `3` 12px · `4` 16px · `5` 20px · `6` 24px · `8` 32px |
| Bo góc, bóng | `--radius-sm` 8px · `md` 12px · `lg` 14px · `pill` 999px; `--shadow-sm` `0 1px 4px rgb(15 23 42 / 10%)` · `--shadow-md` `0 4px 16px rgb(15 23 42 / 14%)` |
| Lớp | `--z-header` 10 · `--z-fab` 40 · `--z-chat` 45 (prototype) · `--z-modal` 50 · `--z-kiosk-reset` 55 |
| Chuyển động | `--duration-fast` 150ms · `--easing-standard` ease-out |
| Điều khiển | `--control-height` 2.125rem (34px) · `--chip-height` 1.75rem (28px) · `--fab-height` 44px · `--target-min` 24px (vùng chạm tối thiểu, BR-1/AC-2; không đổi ở kiosk) |
| Bố cục | `--content-max-width` 1280px · `--gutter` 16px (từ 600px: 24px) · `--modal-max-width` 680px · `--fab-clearance` `calc(var(--space-4) + 64px)` · `--sticky-offset` 0px · `--focus-ring-width` 3px · `--focus-ring-offset` 2px |

- Chế độ kiosk, `html.kiosk`:
  - `font-size: 118.75%` (mọi cỡ chữ tính theo `rem` nên tự lớn theo: 13px → khoảng 15,5px);
  - `--control-height: 2.5rem` (≈ 48px), `--chip-height: var(--control-height)`, `--fab-height: max(44px, var(--control-height))`;
  - `--fab-clearance: calc(var(--space-4) + 80px)` (theo prototype).
- Khoảng cách, bo góc tính bằng px như prototype, nên không phóng to ở kiosk.
- `diemGay.ts` — mốc cho JS, khớp với `@media` trong CSS:
  - `DIEM_GAY_DIEN_THOAI = 600`, `DIEM_GAY_MAY_TINH = 1024`;
  - `MQ_DIEN_THOAI = '(max-width: 599.98px)'`, `MQ_MAY_TINH = '(min-width: 1024px)'`.
- `global.css` (sửa; đang có reset tối thiểu):
  - `body`: font, cỡ md, giãn dòng body, nền `--color-bg`, chữ `--color-text`. `:root { color-scheme: light }`.
  - Focus: `:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: var(--focus-ring-offset) }`. `[data-nen-dam] { --color-focus: var(--color-focus-on-dark) }`.
  - `@media (prefers-reduced-motion: reduce)`: tắt mọi `animation`, `transition` (`!important`, có ghi lý do ở chỗ dùng).
  - `html { scrollbar-gutter: stable }`, để khoá cuộn khi mở popup không làm trang giật ngang.
  - `html.khoa-cuon { overflow: hidden }` — `Modal` dùng.
  - Không đặt chiều cao cố định cho khối chứa chữ (chỉ dùng `min-height`), để đạt WCAG 1.4.12 (giãn chữ).
- `main.tsx` import `tokens.css` trước `global.css`.
- Font: font hệ thống, không có tệp font nào. Không `@font-face`, không `@import url(...)`, không CDN.

### 4.2 Gói npm

| Gói | Loại | Lý do | Gzip | Nạp lúc nào |
|---|---|---|---|---|
| `@tanstack/react-table` (bản ổn định mới nhất, hiện 9.x) | dependency | `CLAUDE.md` đã chọn cho grid | Ước ≤ 15 KB; đo ở T08 | Chunk riêng, chỉ khi hiện dạng bảng (§4.8) |
| `lucide-react` (hiện 1.x) | dependency | design-system DS-2. Đóng gói vào bundle, tự host | ≈ 0,3–0,5 KB mỗi icon, phần dùng chung ≈ 1 KB; đo ở T03 | Theo chunk có dùng icon |
| `@testing-library/user-event` | dev | Thử bàn phím (Tab, Shift+Tab, phím cách, Esc) giống người dùng thật | 0 (không vào bản build) | — |
| `@testing-library/jest-dom` | dev | Matcher `toHaveAccessibleName`, `toBeDisabled`, `toHaveAttribute` | 0 | — |
| `@axe-core/playwright` | dev | C01 AC-4, kế hoạch 5.5 | 0 | — |

- Nếu bản 9.x của TanStack Table vướng React 19 hoặc chưa ổn định, dùng 8.x và ghi lý do vào báo cáo.
- Không đưa TanStack Table, lucide-react vào nhóm `vendor` (F00 plan §2: `vendor` chỉ chứa phần lõi chạy ngay lúc khởi động).
- T03 kiểm `lucide-react` có tự thêm `aria-hidden` cho icon không có tên không, rồi ghi lại kết quả. Dù kết quả thế nào, component lõi vẫn tự truyền `aria-hidden`.

### 4.3 Hàm thuần — `core/utils/`

| File | Hàm | Quy tắc |
|---|---|---|
| `phanTrang.ts` | `dayTrang(hienTai: number, tongSo: number): (number \| 'bo-qua')[]` | Trang đầu, trang cuối, trang hiện tại và 1 trang mỗi bên; chỗ hở thay bằng `'bo-qua'` (hiện "…") — BR-8, AC-13 |
| | `chuanHoaSoTrang(tho: string \| null, tongSo: number): number` | Chỉ nhận chuỗi toàn chữ số `> 0`. Ngoài ra (`abc`, `-1`, `0`, `1.5`, `2abc`, rỗng, null) → 1; lớn hơn `tongSo` → `tongSo`; `tongSo` = 0 → 1 (BR-8, AC-14). Không ghi lại địa chỉ |
| | `catTrang<T>(ds, trang, moiTrang): T[]` | Trang n bắt đầu từ mục `moiTrang × (n − 1) + 1` |
| `lienKet.ts` | `phanLoaiLienKet(tho: string \| null \| undefined): { loai: 'web' \| 'dien-thoai' \| 'thu'; href: string } \| null` | Dùng `new URL()`. Chỉ nhận `http:` và `https:` có tên máy; `tel:` có ít nhất 3 chữ số; `mailto:` có dạng `x@y`. Ngoài ra trả `null`: rỗng, `javascript:` (kể cả viết hoa, có khoảng trắng hoặc tab chen giữa), `data:`, `vbscript:`, đường dẫn tương đối, `//host`, URL sai cú pháp (BR-3) |
| | `taoLinkDienThoai(so: string): string \| null` | Giữ chữ số và dấu `+` ở đầu → `tel:…`; dưới 3 chữ số → `null` |
| | `taoLinkEmail(email: string): string \| null` | `mailto:…` khi đúng dạng `x@y` |
| `timKiem.ts` | `ghepChuoiTimKiem(...truong: (string \| null \| undefined)[]): string` | `chuanHoaTimKiem` của các trường, nối bằng dấu cách. Feature gọi một lần khi nạp dữ liệu, hoặc dùng chuỗi đã bỏ dấu BE trả về |
| | `taoBoLocTuKhoa(tuKhoa: string): (chuoiTimKiem: string) => boolean` | Chuẩn hoá từ khoá một lần (`chuanHoaTimKiem` — F00 §4: bỏ dấu, chữ thường, bỏ U+200B–U+200F và U+FEFF, gộp khoảng trắng), rồi tách theo dấu cách. Từ khoá rỗng → luôn `true`. Mỗi từ phải là chuỗi con của `chuoiTimKiem`; thứ tự từ bất kỳ (BR-4, AC-7, AC-8) |
| `cx.ts` | `cx(...lop: (string \| false \| null \| undefined)[]): string` | Ghép class |

### 4.4 Kiosk, hook, liên hệ — `core/kiosk/`, `core/hooks/`, `core/components/LienHe/`

**Chế độ kiosk** (`core/kiosk/cheDoKiosk.ts`, `useCheDoKiosk.ts`):

```ts
export function khoiTaoCheDoKiosk(): void;         // main.tsx gọi 1 lần, trước khi render
export function datCheDoKiosk(bat: boolean): void; // trang xem trước; F09 nếu cần
export function useCheDoKiosk(): boolean;          // useSyncExternalStore
```

- Bật bằng link kiosk (F09 BR-1). Dạng link theo đề xuất ở **Cần hỏi 1** (§9):
  - Địa chỉ có `?kiosk=1` → bật; `?kiosk=0` → tắt.
  - Đọc xong thì xoá tham số khỏi địa chỉ bằng `history.replaceState`, giữ nguyên các tham số khác. Nhờ vậy cờ không lọt vào link chia sẻ, mã QR hay lịch sử.
  - Lưu cờ vào `sessionStorage`, khoá `kiosk` → tải lại trang vẫn ở chế độ kiosk. Đóng tab thì mất, khớp với cấu hình ẩn danh của máy kiosk (F09 BR-6).
  - `sessionStorage` bị chặn → vẫn bật cho lần tải này.
- Bật thì thêm class `kiosk` vào `<html>`. Gọi trước khi render, để trang không hiện cỡ thường rồi mới đổi.
- Không đoán chế độ kiosk theo kích thước màn hình (design-system §3).

**Hook:**

```ts
export function useMediaQuery(query: string): boolean; // useSyncExternalStore + matchMedia

export type CachXem = 'the' | 'bang';
export function useCachXem(): {
  cachXem: CachXem;           // dạng đang hiệu lực
  daChon: CachXem | null;     // lựa chọn đã lưu
  datCachXem: (v: CachXem) => void;
  laDienThoai: boolean;       // < 600 px
};
```

- `useCachXem` (design-system §5 `SegmentedControl`; C01 BR-6; F03 BR-6; F04 BR-9):
  - Dưới 600 px: luôn `'the'`, kể cả khi đã chọn bảng.
  - Từ 600 px: lựa chọn đã lưu (`localStorage`, khoá `cach-xem`). Chưa chọn: `'the'` ở kiosk và ở 600–1023 px; `'bang'` từ 1024 px.
  - Một store chung (`useSyncExternalStore`), để khối thường gặp và danh mục cùng theo một lựa chọn. Nghe thêm sự kiện `storage` để đồng bộ giữa các tab.
  - `localStorage` bị chặn → giữ lựa chọn trong bộ nhớ.

```ts
export function useDanhSachUrl(tuyChon?: {
  boLoc?: readonly string[];  // khoá tính là bộ lọc, bị xoá khi "Xoá bộ lọc" (vd. ['lv'], ['lv', 'md'])
  khac?: readonly string[];   // khoá khác: đổi thì về trang 1 nhưng không tính là bộ lọc (vd. tab 'cap' của F04)
  khoaTuKhoa?: string;        // mặc định 'q'
  khoaTrang?: string;         // mặc định 'trang'
}): {
  tuKhoa: string;             // giá trị ô tìm, cập nhật ngay khi gõ
  datTuKhoa: (v: string) => void;
  tuKhoaLoc: string;          // useDeferredValue(tuKhoa) — dùng để lọc
  giaTri: (khoa: string) => string;
  dat: (thay: Record<string, string | null>) => void; // đổi bộ lọc hoặc khoá khác, về trang 1
  trang: string | null;       // số trang thô trên địa chỉ → DataTable chuẩn hoá
  datTrang: (so: number) => void;
  coDieuKien: boolean;        // có từ khoá (sau khi bỏ khoảng trắng) hoặc có bộ lọc
  xoaBoLoc: () => void;       // xoá từ khoá, mọi bộ lọc và số trang; giữ khoá `khac`
};
```

- Mọi lần ghi địa chỉ đều thay mục lịch sử (`replace`), không thêm mục mới. Lý do:
  - BR-8 chỉ cần mở lại địa chỉ (chia sẻ, QR, "Quay lại" từ trang khác) là về đúng trang.
  - Popup có địa chỉ riêng (F03 BR-8) do feature tự thêm mục lịch sử.
- Ô tìm giữ giá trị trong state của hook, không đọc thẳng từ địa chỉ. Hai lý do:
  - Bộ gõ tiếng Việt (Telex, VNI) gửi chuỗi phím xoá rồi gõ lại; ô nhập phải cập nhật đồng bộ thì không mất chữ.
  - Safari giới hạn khoảng 100 lần `replaceState` mỗi 30 giây.
- Vì vậy từ khoá được ghi lên địa chỉ chậm 300 ms sau phím cuối. Trong lúc chờ ghi, `trang` trả `null` (về trang 1 ngay khi đổi từ khoá — BR-4).
- Địa chỉ đổi từ bên ngoài ("Quay lại", "Xoá bộ lọc", F09 "Bắt đầu lại") → ô tìm cập nhật theo.
- Lọc dùng `tuKhoaLoc` (`useDeferredValue`), để ô nhập luôn mượt với khoảng 1.000 thủ tục (F00 BR-9).
- Tên khoá trên địa chỉ do feature đặt. Prototype dùng `q`, `lv`, `md`, `cap`, `trang`, `ma`.
- Hook `useUrlState` hiện có giữ nguyên.

**Liên hệ** (`core/components/LienHe/`):

```ts
export function LienHeProvider(props: { soDienThoai: string | null; children: ReactNode }): JSX.Element;
export function useLienHe(): { soDienThoai: string | null };
```

F08 bọc ứng dụng bằng provider này, lấy số từ thông tin Trung tâm. Chưa có F08 → `null` → thông báo không có dòng số.

### 4.5 Nút — `VisuallyHidden`, `Button`, `IconButton`, `FloatingButton`, `SectionTitle`

```ts
type BienTheNut = 'primary' | 'secondary' | 'ghost' | 'lien-ket';
interface ButtonPropsChung {
  bienThe?: BienTheNut;        // mặc định 'secondary'
  bieuTuong?: ReactNode;       // icon đứng trước chữ
}
interface ButtonNutProps extends ButtonPropsChung, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  to?: never;
  type?: 'button' | 'submit';  // mặc định 'button'
  dangXuLy?: boolean;          // BR-2 "đang xử lý"
  dangBat?: boolean;           // có prop → nút bật/tắt, render aria-pressed
  ref?: Ref<HTMLButtonElement>;
}
// Dạng liên kết nội bộ (thêm 2026-10-12): đi tới trang khác của ứng dụng nên là <a> (BR-2), không phải <button>.
interface ButtonLienKetProps extends ButtonPropsChung, Omit<LinkProps, 'to' | 'className'> {
  to: string;                  // đường dẫn trong ứng dụng, vd. DUONG_DAN.trangChu
  type?: never; dangXuLy?: never; dangBat?: never; disabled?: never;
  ref?: Ref<HTMLAnchorElement>;
}
type ButtonProps = ButtonNutProps | ButtonLienKetProps; // phân biệt bằng có hay không có `to`
export function lopNut(bienThe: BienTheNut | 'accent'): string; // ExternalLink dùng chung class

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'aria-label'> {
  nhan: string;                // bắt buộc → aria-label (BR-1)
  bieuTuong: ReactNode;
  dangBat?: boolean;
  bienThe?: 'secondary' | 'ghost' | 'tren-nen-dam';
  ref?: Ref<HTMLButtonElement>;
}

interface FloatingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  viTri: 'phai' | 'trai';      // phải: trợ lý (F06); trái: "Bắt đầu lại" (F09)
  trenPopup?: boolean;         // true → --z-kiosk-reset (55); mặc định --z-fab (40)
  bieuTuong: ReactNode;
  children: ReactNode;         // chữ hiện ra, feature truyền ("Trợ lý")
  dangMo?: boolean;            // → aria-expanded
  dieuKhien?: string;          // id khung → aria-controls
  ref?: Ref<HTMLButtonElement>;
}

interface SectionTitleProps { cap: 2 | 3; id?: string; children: ReactNode; phu?: ReactNode }
interface VisuallyHiddenProps { children: ReactNode; as?: 'span' | 'div' }
```

- **Button** (design-system §5):
  - Cao `--control-height`, chữ md, đậm 600, đệm ngang `--space-3`, bo `--radius-sm`, `white-space: nowrap` (BR-2).
  - **Dạng liên kết nội bộ** (`to`): render React Router `Link` (`<a href>`), dùng chung class với dạng nút (`lopNut`) nên hình thức giống hệt. Dùng cho "Về trang chủ" / "Danh mục thủ tục" ở trang 404 (F08 BR-10, plan F08 §4.10). Không có `dangXuLy`, `dangBat`, `disabled` (kiểu prop chặn). Link ra ngoài, `tel:`, `mailto:` vẫn dùng `ExternalLink`, không dùng `to`. Test: render `<a>` có `href` đúng; Enter và click đi tới trang; không có `role="button"`; tên đọc là chữ của liên kết.
  - Biến thể `lien-ket` (lấy từ prototype `.link-btn`): trông như liên kết, dùng cho "tên thủ tục — bấm mở popup" trong bảng (BR-7).
  - Không có biến thể `accent` trên `<button>`. Kiểu nhấn chỉ dành cho liên kết "Xem và nộp trên Cổng DVC" (BR-2), qua `ExternalLink`. Kiểu prop chặn sẵn việc dùng sai.
- **Vô hiệu:**
  - `disabled` gốc → Tab bỏ qua; trình đọc màn hình đọc là không dùng được.
  - Hình thức: viền nét đứt và mờ — có dấu hiệu khác màu (BR-1).
- **Đang xử lý:**
  - `aria-disabled="true"`, `aria-busy="true"`; chặn `onClick` và submit. Bấm hai lần nhanh chỉ chạy một lần (AC-5).
  - Vẫn nhận focus, để con trỏ không bị mất (WCAG 2.4.3).
  - Chữ giữ chỗ (`visibility: hidden`), icon `Hourglass` đứng yên đè ở giữa → kích thước không đổi, không có hiệu ứng quay (BR-1).
  - Có chữ ẩn "Đang xử lý" cho trình đọc màn hình.
- **Bật/tắt:**
  - `aria-pressed`. Khi bật: nền đặc, chữ trắng, thêm viền dưới 2 px — dấu hiệu không chỉ dựa vào màu (BR-1, AC-3).
  - Trình đọc màn hình đọc được đang bật hay tắt (AC-5).
- **IconButton:** vuông cạnh `--control-height`; icon 16 px có `aria-hidden`; tên đọc lấy từ `nhan` (prop bắt buộc, thiếu là lỗi `tsc`).
- **FloatingButton:**
  - `position: fixed`, cách góc `--gutter`, cao `--fab-height`, bo `pill`, `--shadow-md`.
  - Có cả icon và chữ (BR-13).
  - Phần chừa chỗ ở cuối trang là việc của F08 (dùng `--fab-clearance`).
- **SectionTitle:** vạch đỏ 4 px + tiêu đề 14 px đậm 700 (design-system §5); `phu` là chỗ đặt số đếm ở bên phải.
- **Truy cập** (WCAG 2.1):
  - 2.1.1: `<button>` thật, Enter và phím cách đều kích hoạt.
  - 2.4.7: viền focus theo §4.1.
  - 4.1.2: tên, vai trò, trạng thái.
  - 1.4.1: không chỉ dựa vào màu.
  - 1.4.3, 1.4.11: tương phản theo token.
  - 2.5.3: tên đọc chứa chữ hiện trên nút.
  - Vùng bấm ≥ 24 × 24 px (AC-2).

### 4.6 Liên kết ngoài, ô dịch vụ, nhãn, thẻ — `ExternalLink`, `Tile`, `TileGrid`, `Badge`, `Card`

```ts
type BienTheLienKet = 'mac-dinh' | 'dam' | 'nut-accent' | 'nut-secondary';
interface ExternalLinkProps {
  href: string | null | undefined; // thô, lấy từ dữ liệu
  children: ReactNode;             // chữ ghi rõ đích đến (design-system §7)
  bienThe?: BienTheLienKet;        // 'dam': link gọn trong bảng; 'nut-accent': "Xem và nộp trên Cổng DVC"
  ref?: Ref<HTMLAnchorElement>;
}

type MauO = 'indigo' | 'pink' | 'teal' | 'orange' | 'blue' | 'navy';
interface TileProps { ten: string; href: string | null; bieuTuong: ReactNode; mau: MauO }
interface TileGridProps { children: ReactNode }   // <ul role="list">; mỗi Tile tự là <li>

interface BadgeProps {
  loai: 'info' | 'success' | 'warning' | 'neutral';
  children: ReactNode;          // luôn có chữ (BR-10)
  bieuTuong?: ReactNode;
  rutGon?: boolean;             // một dòng + "…", chỉ dùng khi nội dung đầy đủ có ở chỗ khác
  kichThuoc?: 'nho' | 'vua';    // 'vua' = nhãn giờ làm việc của F02 (StatusPill trong design-system)
}

interface CardProps { as?: 'div' | 'article' | 'section' | 'li'; children: ReactNode; className?: string }
interface CardActionsProps { children: ReactNode }
```

- **ExternalLink** (BR-3), xử lý theo `phanLoaiLienKet`:
  - Web: `<a target="_blank" rel="noopener noreferrer">`, icon `ExternalLink` có `aria-hidden`, kèm chữ ẩn "(mở trang mới)". Trang được mở không có `window.opener` và không thấy địa chỉ trang nguồn (AC-6).
  - Số điện thoại, email: `<a href="tel:…">`, `<a href="mailto:…">`; không mở tab mới, không có icon, không có chữ ẩn.
  - `null` (link sai định dạng): `<span>` chữ thường — không `href`, không `role`, Tab bỏ qua (AC-6).
  - Mục không có dữ liệu thì feature không render (F08 BR-5); ExternalLink không tự ẩn.
  - Dòng nhắc đăng xuất ở kiosk thuộc F09 (§11).
- **Tile** (BR-12, design-system §5 `Tile`):
  - Chỉ nhận địa chỉ `http`/`https` (F01 kiểm tra cùng quy tắc).
  - Có link:
    - Cả ô là một `<a>` mở tab mới như trên → mỗi ô Tab dừng một lần.
    - Gồm icon trắng trên ô vuông 36 px màu `--color-tile-*`, tên tối đa 2 dòng, dòng nhỏ "Trang ngoài" kèm icon.
    - Dòng "Trang ngoài" có `aria-hidden`; trình đọc màn hình đọc tên ô + "(mở trang mới)".
    - Rê chuột: đổi viền và bóng ngay, không có transition màu.
  - Không link, hoặc link sai định dạng:
    - `<div>` cùng khung, icon, màu, tên, cùng chiều cao.
    - Không có "Trang ngoài"; không có `role`, `tabindex`, `href`; rê chuột không đổi.
    - Bấm không có gì xảy ra (AC-21).
  - **TileGrid:** 2 cột dưới 600 px, 3 cột ở 600–1023 px, 6 cột từ 1024 px (prototype); ô cùng hàng cao bằng nhau.
- **Badge** (BR-10):
  - `<span>`: không focus được, không có vai trò; nhãn rỗng thì không render.
  - Mặc định chữ dài xuống dòng (vd. nhãn lĩnh vực — AC-17).
  - `rutGon`: một dòng, `text-overflow: ellipsis`, `max-width: 100%`. Trình đọc màn hình vẫn đọc đủ câu.
  - Màu theo prototype: `info` (nền primary-soft), `success`/`warning` có viền, `neutral` (nền neutral-soft).
- **Card:**
  - Nền trắng, viền `--color-border`, bo `--radius-md`, `--shadow-sm`, đệm `--space-3`.
  - `display: flex; flex-direction: column; height: 100%` → thẻ cùng hàng cao bằng nhau.
  - `CardActions`: `margin-top: auto` (nút cuối thẻ thẳng hàng giữa các thẻ), `flex-wrap: wrap`, mỗi nút `flex: 1 1 auto` → thẻ hẹp thì các nút xếp dọc (BR-7, AC-12).
- **Truy cập** (WCAG 2.1):
  - 2.4.4: mục đích liên kết rõ nhờ chữ và chữ ẩn "(mở trang mới)".
  - 3.2.5 (AAA, làm vì spec yêu cầu): báo trước khi mở tab mới.
  - 1.1.1: icon có `aria-hidden`.
  - 1.4.1: Toàn trình / Một phần luôn có chữ.
  - 1.4.10: nhãn không tràn khỏi khung.

### 4.7 Ô tìm, chip, chuyển dạng — `SearchBox`, `ChipGroup`, `Chip`, `SegmentedControl`, `ViewToggle`

```ts
interface SearchBoxProps {
  nhan: string;                // nhãn (bắt buộc), mặc định ẩn bằng VisuallyHidden
  hienNhan?: boolean;
  goiY?: string;               // placeholder — không thay cho nhãn
  giaTri: string;
  onDoi: (giaTri: string) => void;
  soKetQua?: number;           // có → báo số kết quả cho trình đọc màn hình
  maxLength?: number;          // mặc định 100
  ref?: Ref<HTMLInputElement>;
}

interface ChipGroupProps<T extends string> {
  nhan: string;                // aria-label của nhóm
  luaChon: readonly { giaTri: T; nhan: string }[];
  giaTri: T;
  onDoi: (giaTri: T) => void;
}
interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> { daChon?: boolean; children: ReactNode }
// Chip lẻ: câu gợi ý của trợ lý (F06). Không truyền daChon → không có aria-pressed.

interface SegmentedControlProps<T extends string> {
  nhan: string;
  luaChon: readonly { giaTri: T; nhan: string; bieuTuong?: ReactNode }[];
  giaTri: T;
  onDoi: (giaTri: T) => void;
}
interface ViewToggleProps { giaTri: CachXem; onDoi: (v: CachXem) => void }
// ViewToggle = SegmentedControl có sẵn chữ "Dạng thẻ"/"Dạng bảng", icon LayoutGrid/List, nhãn nhóm "Cách hiển thị" (common)
```

- **SearchBox** (BR-4):
  - Phần tử:
    - `<label>` gắn với `<input type="search">`; ẩn nút xoá gốc của trình duyệt.
    - `autoComplete="off"`, `spellCheck={false}`, `enterKeyHint="search"`.
    - Icon kính lúp có `aria-hidden`. Không có nút micro.
  - Nút xoá ✕ (`IconButton`, tên "Xoá từ khoá"):
    - Chỉ hiện khi ô có chữ.
    - Bấm → `onDoi('')`, con trỏ quay lại ô (AC-9).
  - Phím:
    - Enter không gửi form.
    - Esc: để trình duyệt xử lý; khi ô nằm trong popup, Esc đóng popup.
  - Báo số kết quả (WCAG 4.1.3):
    - Vùng `role="status"` ẩn, nội dung "Có {{so}} kết quả." hoặc "Không có kết quả.".
    - Chỉ báo sau khi người dùng đã gõ, khi `soKetQua` đứng yên 500 ms (`useDebounce`); không báo lúc mới mở trang.
    - Con trỏ vẫn ở ô tìm.
- **ChipGroup** (BR-5):
  - Phần tử:
    - `role="group"` + `aria-label`.
    - Mỗi chip là một `<button aria-pressed>`; chỉ một chip được chọn.
    - Chip đang chọn có nền `--color-primary`, chữ trắng, icon `Check` (✓) đứng trước chữ.
    - Cao `--chip-height` (28 px; ở kiosk bằng chiều cao điều khiển) (AC-10, AC-3).
  - Cuộn hàng chip:
    - Hàng chip `overflow-x: auto`; trang không cuộn ngang.
    - Thiết bị có chuột (`@media (hover: hover) and (pointer: fine)`): nút cuộn trái/phải, chỉ hiện khi còn phần bị khuất (ResizeObserver + sự kiện scroll); mỗi lần bấm cuộn khoảng 80% bề rộng, không cuộn mượt.
    - Nút cuộn chỉ hỗ trợ chuột: `tabIndex={-1}`, `aria-hidden="true"`. Bàn phím vẫn tới được mọi chip bằng Tab, trình duyệt tự cuộn chip vào tầm nhìn (BR-1, WCAG 2.1.1). Như vậy không thêm điểm dừng Tab nào biến mất giữa chừng.
  - Trạng thái đọc cho trình đọc màn hình: **Cần hỏi 2** (§9).
- **SegmentedControl / ViewToggle** (BR-6):
  - `role="group"`, hai `<button aria-pressed>` liền nhau.
  - Lựa chọn đang dùng: nền xanh, icon `Check` thay cho icon thường — dấu hiệu không chỉ dựa vào màu (AC-3).
  - Dưới 600 px: `display: none`. Danh sách luôn dạng thẻ (`useCachXem`, `DataTable`).
- **Truy cập** (WCAG 2.1):
  - 1.3.1, 3.3.2: có nhãn.
  - 4.1.2: `aria-pressed`.
  - 4.1.3: thông báo trạng thái.
  - 1.4.10: không cuộn ngang ở 320 CSS px.
  - 2.1.1: dùng được bằng bàn phím.

### 4.8 Phân trang và danh sách — `Pager`, `DataTable`

```ts
interface PagerProps {
  trang: number;               // đã chuẩn hoá
  tongSoTrang: number;
  onDoiTrang: (trang: number) => void;
  nhan?: string;               // mặc định common "Phân trang"
}

interface CotBang<T> {
  id: string;
  tieuDe: string;
  o: (dong: T, stt: number) => ReactNode;  // stt đếm trên cả danh sách, bắt đầu từ 1
  rong?: string;                           // gợi ý độ rộng, vd. '7rem'
  khongXuongDong?: boolean;
}
interface DataTableProps<T> {
  duLieu: readonly T[];        // toàn bộ danh sách đã lọc, đúng thứ tự
  khoaDong: (dong: T) => string;
  cachXem: CachXem;            // thường lấy từ useCachXem()
  cot: readonly CotBang<T>[];
  renderCard: (dong: T, stt: number) => ReactNode;
  tieuDeBang: string;          // <caption> ẩn + tên vùng cuộn
  soMucMoiTrang: number;       // F03: 12, F04: 25
  trang: string | null;        // số trang thô trên địa chỉ (useDanhSachUrl().trang)
  onDoiTrang: (so: number) => void;
  soCotToiDa?: number;         // dạng thẻ; F03 = 4
}
```

**Pager** (BR-8, design-system §5):

- Hiện gì:
  - Chỉ có 1 trang → không render.
  - `<nav aria-label>` gồm nút Trước, các số theo `dayTrang`, nút Sau. Chỗ "…" là `<span aria-hidden>`.
- Trang hiện tại: `aria-current="page"`, nền đặc, chữ đậm và gạch chân (dấu hiệu không chỉ dựa vào màu, AC-3). Bấm vào trang hiện tại không làm gì.
- Nút số trang: tên đọc "Trang n".
- Trước, Sau:
  - Trang đầu: nút Trước `disabled`; trang cuối: nút Sau `disabled` (AC-5, AC-13).
  - Tên đọc "Trang trước", "Trang sau".
  - Từ 600 px: icon + chữ "Trước", "Sau". Dưới 600 px: chỉ icon, chữ ẩn. Tên đọc vẫn chứa chữ hiện ra (WCAG 2.5.3).
- Kích thước: nút cao và rộng tối thiểu `--control-height`, khoảng cách 4 px.
  - Trường hợp dài nhất là 7 nút và 2 dấu "…", rộng khoảng 294 px — vừa một hàng ở 375 px.
  - Vẫn để `flex-wrap`, phòng khi phóng to 200% (AC-2).

**DataTable** (BR-6, BR-7, BR-8):

- Phân trang:
  - Chuẩn hoá số trang (`chuanHoaSoTrang`), cắt trang (`catTrang`), hiện `Pager` ở dưới.
  - Số trang trên địa chỉ lớn hơn số trang đang có → hiện trang cuối; số không hợp lệ → trang 1 (AC-14).
- Chọn dạng:
  - Dạng thẻ (hoặc điện thoại, kiểm bằng `useMediaQuery(MQ_DIEN_THOAI)`, kể cả khi `cachXem = 'bang'`): `<ul role="list">` các `<li>` chứa `renderCard`. Không nạp TanStack.
  - Dạng bảng: `React.lazy(() => import('./BangDuLieu'))`. Trong lúc nạp, `Skeleton` dạng bảng giữ chỗ.
  - Hai dạng dùng chung `duLieu` và cùng trang → chuyển dạng giữ nguyên trang, thứ tự, từ khoá (BR-6, AC-11).
- **Bảng** (`BangDuLieu.tsx`, file duy nhất import TanStack):
  - Phần tử: `<table>` có `<caption>` ẩn và `<th scope="col">` (trình đọc màn hình đọc tên cột của từng ô). Dòng có nền khi rê chuột.
  - Vùng chứa bảng là khối cuộn hai chiều:
    - `overflow: auto`, `max-height: calc(100dvh - var(--sticky-offset) - var(--space-8))`.
    - Đầu bảng `position: sticky; top: 0` → cuộn danh sách trong vùng vẫn thấy dòng tiêu đề (BR-7).
    - Bảng rộng hơn màn hình thì chỉ vùng bảng cuộn ngang (AC-12).
  - Vùng cuộn có `tabIndex={0}`, `role="region"` và `aria-label` = `tieuDeBang`, để dùng bàn phím cuộn được (WCAG 2.1.1; luật axe `scrollable-region-focusable`).
  - Lý do chọn khối cuộn hai chiều: `position: sticky` chỉ bám theo khối cuộn gần nhất. Khối `overflow-x: auto` để cuộn ngang đã là khối cuộn, nên đầu bảng không thể dính theo cuộn của cả trang (rủi ro 1, §10).
- **Thẻ:**
  - Số cột: dưới 600 px 1 cột; 600–1023 px 2 cột; từ 1024 px `repeat(auto-fill, minmax(max(240px, (100% - (n − 1) × gap) / n), 1fr))`, với n = `soCotToiDa` truyền qua biến CSS; kiosk 2 cột (design-system §3).
  - Thẻ cùng hàng cao bằng nhau (lưới `align-items: stretch` + `Card` cao 100%).
- **Đổi trang do người dùng bấm** (không áp dụng lần tải đầu):
  - Cuộn tới đầu vùng kết quả bằng `scrollIntoView({ block: 'start' })`, không cuộn mượt; `scroll-margin-top: var(--sticky-offset)` (BR-8, AC-13).
  - Theo đề xuất ở **Cần hỏi 3**: con trỏ chuyển tới vùng kết quả (`tabIndex={-1}`, tên đọc "Kết quả, trang {{trang}} trên {{tong}}").

### 4.9 Popup — `Modal`

```ts
interface ModalProps {
  mo: boolean;
  onDong: () => void;              // gọi khi bấm ✕, Esc, hoặc bấm vùng tối
  tieuDe: ReactNode;               // nội dung thẻ tiêu đề, dùng cho aria-labelledby
  capTieuDe?: 2 | 3;               // mặc định 2
  phanTrenTieuDe?: ReactNode;      // nhãn, mã thủ tục… (F03)
  children: ReactNode;             // thân popup, cuộn bên trong
  chanPopup?: ReactNode;           // nút hành động, lời miễn trừ — luôn nhìn thấy
}
```

- **Không dùng `<dialog>.showModal()`.** `showModal()` đưa popup lên top layer và làm mọi phần ngoài popup không tương tác được. Khi đó nút "Bắt đầu lại" của kiosk (nằm ngoài popup, z 55) không bấm được và không vào được vòng Tab, trái với BR-9 và F09 BR-7. Vì vậy tự làm như prototype đã duyệt:
  - Portal vào `<body>`; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` trỏ tới tiêu đề.
- **Khi mở** (BR-9):
  - Lưu phần tử đang có con trỏ (nút đã mở popup).
  - Đưa con trỏ vào khung popup (`tabIndex={-1}`, không vẽ viền focus cho khung) → trình đọc màn hình đọc tiêu đề.
  - Đặt `inert` cho mọi con của `<body>`, trừ popup và các phần tử `[data-ngoai-popup]` (§3.2). Khung trợ lý và nút trợ lý bị `inert` theo.
  - Thêm class `khoa-cuon` vào `<html>` → lăn chuột không cuộn trang phía sau (AC-16).
  - Có đếm số popup đang mở, để popup lồng nhau mở và đóng đúng.
- **Vòng Tab:**
  - Gồm các phần tử bấm được trong popup (đang hiển thị, không `disabled`), rồi tới các `[data-ngoai-popup]` đang hiển thị ở cuối vòng.
  - Tab và Shift+Tab đi vòng (BR-9, AC-15, AC-24).
  - Ngoài kiosk không có phần tử nào mang thuộc tính này, nên vòng Tab chỉ gồm phần tử trong popup.
- **Đóng:**
  - Esc: chỉ popup trên cùng đóng (ngăn xếp popup trong module).
  - Bấm vùng tối: chỉ đóng khi cả `pointerdown` lẫn `click` đều rơi vào vùng tối. Kéo chọn chữ từ trong popup ra ngoài thì không đóng.
  - Nút ✕ (`IconButton`, `common:nut.dong`).
  - "Quay lại" của trình duyệt: feature điều khiển `mo` theo địa chỉ (F03 BR-8). `Modal` không đụng lịch sử trình duyệt.
- **Sau khi đóng:**
  - Gỡ `inert`, gỡ khoá cuộn → trang giữ nguyên vị trí cuộn.
  - Trả con trỏ về phần tử đã lưu, nếu phần tử đó còn trong trang (AC-15).
- **Bố cục:**
  - Rộng tối đa `--modal-max-width`, cao tối đa `calc(100dvh - 2 × var(--space-4))`.
  - Đầu (tiêu đề + ✕) và chân luôn nhìn thấy; thân `overflow: auto; overscroll-behavior: contain`.
  - Dưới 600 px: toàn màn hình, không bo góc (AC-16).
  - Kiosk: vùng tối chừa dải dưới 88 px (prototype), để nút "Bắt đầu lại" không che nút hành động và lời miễn trừ ở chân popup.
  - Lớp `--z-modal` (50): trên nút trợ lý (40) và khung trợ lý (45); dưới nút "Bắt đầu lại" (55) (BR-9).
- **Hiệu ứng:** mở bằng `opacity` + `translateY` 150 ms ease-out; đóng thì gỡ ngay. Máy bật giảm chuyển động → không có hiệu ứng (AC-23).
- **Truy cập** (WCAG 2.1):
  - 2.1.2: không bẫy bàn phím vì Esc luôn đóng.
  - 2.4.3: thứ tự con trỏ.
  - 1.3.1, 4.1.2: vai trò và tên của hộp thoại.
  - 1.4.10: popup toàn màn hình trên điện thoại.

### 4.10 Trạng thái tải, lỗi, không có kết quả — `Skeleton`, `ErrorState`, `EmptyState`, `QueryState`

```ts
interface SkeletonProps { dang: 'the' | 'bang' | 'dong'; soMuc?: number; soCotToiDa?: number }

interface ErrorStateProps { loi: unknown; onThuLai: () => void }

interface EmptyStateProps {
  doiTuong: string;            // "thủ tục", "lĩnh vực" — feature truyền
  tuKhoa: string;              // chữ người dùng gõ
  coBoLoc: boolean;            // có bộ lọc đang chọn (tab của F04 không tính)
  nutXoaTrenThanhLoc: boolean; // F04 = true → không có nút "Xoá bộ lọc" trong thông báo
  onXoaBoLoc?: () => void;     // bắt buộc khi nutXoaTrenThanhLoc = false
}

interface QueryStateProps<T> {
  truyVan: UseQueryResult<T>;  // TanStack Query
  khungCho: ReactNode;         // Skeleton có hình dạng của nội dung
  children: (duLieu: T) => ReactNode;
}
```

- **Skeleton** (BR-11, AC-18):
  - Khối màu `--color-skeleton`, **đứng yên** (không có animation).
  - Các khối có `aria-hidden`. Một vùng `role="status"` ẩn đọc "Đang tải…" (`common:trang-thai.dang-tai`); khối chứa có `aria-busy="true"`.
  - Hình dạng:
    - `the`: lưới thẻ như `DataTable` — nhãn, 2 dòng tên, dòng nhãn phụ, khối nút.
    - `bang`: dòng tiêu đề + n dòng.
    - `dong`: vài dòng chữ.
- **ErrorState** (BR-11, F00 BR-6, BR-7):
  - Nội dung:
    - Dòng chính "Chưa tải được dữ liệu." (`common:loi-tai.tieu-de`).
    - Câu của loại lỗi `t(khoaLoi(loi))` — đã có ở `core/api/loi.ts`.
    - Nút "Thử lại" (`Button` secondary, icon `RefreshCw`).
    - Dòng gọi Trung tâm, số bấm được (`tel:` qua `taoLinkDienThoai`, số lấy từ `useLienHe()`). Không có số → ẩn dòng này.
  - Mã tra cứu:
    - Chỉ hiện khi `loi` là `ApiError` có `code === 'loi-he-thong'` và có `maTraCuu`: "Mã tra cứu: {{ma}}".
    - Lỗi mất kết nối không có mã.
  - Không bao giờ hiện mã HTTP, `title`, `detail` (thuat-ngu, AC-19).
  - `role="alert"` trên khung → trình đọc màn hình tự đọc ngay khi hiện.
  - Hình thức: viền `--color-danger-border`, nền `--color-danger-soft`, icon `CircleAlert`.
- **QueryState** — một cách xử lý chung cho F02–F06 ("cùng câu chữ và hình thức"):
  - Đang tải lần đầu (`isPending`), hoặc đang tải lại sau lỗi (`isError && isFetching`) → `khungCho`.
  - Lỗi (`isError`) → `ErrorState` với `onThuLai = () => refetch()`.
  - Còn lại → `children(data)`.
  - Nhờ vậy bấm "Thử lại" thì chuyển sang đang tải, rồi hiện kết quả hoặc lỗi (BR-11).
- **EmptyState** (BR-11, AC-20):
  - Câu thông báo:
    - Có từ khoá (đã cắt khoảng trắng hai đầu): "Không tìm thấy {{doiTuong}} phù hợp với '{{tuKhoa}}'".
    - Không có từ khoá: "Không tìm thấy {{doiTuong}} phù hợp".
    - Từ khoá hiện bằng nút chữ của React, không phải HTML → gõ `<b>abc</b>` thì hiện nguyên các ký tự.
  - Có điều kiện (từ khoá hoặc bộ lọc):
    - Đủ 4 gợi ý: kiểm tra chính tả; xoá bộ lọc; hỏi trợ lý; gọi Trung tâm (kèm số nếu có).
    - `nutXoaTrenThanhLoc = false` → có thêm nút "Xoá bộ lọc".
    - `nutXoaTrenThanhLoc = true` → gợi ý xoá bộ lọc chỉ bằng chữ, chỉ tới nút trên thanh lọc.
  - Không có điều kiện: chỉ còn 2 gợi ý (hỏi trợ lý, gọi Trung tâm), không có nút.
  - Không `role="alert"` và không lấy con trỏ: con trỏ vẫn ở ô tìm; số kết quả 0 đã được `SearchBox` báo.
  - Sau khi bấm "Xoá bộ lọc", nút này biến mất cùng thông báo. Feature đưa con trỏ về ô tìm qua `ref` của `SearchBox`, để con trỏ không rơi về đầu trang (WCAG 2.4.3).
  - Câu chữ 4 gợi ý: **Cần hỏi 4**.

### 4.11 Trang xem trước thành phần — `/dev/design-system`

- **Vị trí và route:**
  - Mã đặt ở `src/app/xem-truoc/` (ui-core-dev sở hữu `app/`): `XemTruocThanhPhan.tsx`, các khối con, `duLieuMau.ts`, `i18n/vi.json` (namespace `xem-truoc`).
  - Route khai trong `app/router.tsx`, chỉ khi `import.meta.env.DEV`:
    ```ts
    ...(import.meta.env.DEV ? [{ path: 'dev/design-system', lazy: () => import('./xem-truoc/route') }] : [])
    ```
  - Khi build, Vite thay `import.meta.env.DEV` bằng `false`; nhánh đó bị bỏ nên `import()` không tạo chunk. T11 kiểm điều này trên bản build.
  - Bản build mở `/dev/design-system` → `SpaFallback` → trang 404 (F08).
  - Route nằm ngoài `Layout`, nên không phụ thuộc tiến độ F08.
- **Bày toàn bộ token và component ở mọi biến thể, trạng thái** (design-system §10):

  | Khối | Nội dung | AC |
  |---|---|---|
  | Điều khiển | Nút bật/tắt chế độ kiosk (`datCheDoKiosk`, `aria-pressed`) | AC-2, AC-4 |
  | Token | Bảng màu kèm độ tương phản, cỡ chữ, khoảng cách, bo góc, bóng | — |
  | Nút | 4 biến thể × thường / vô hiệu / đang xử lý (bấm → xử lý giả 2 giây) / bật-tắt; IconButton; khối `data-nen-dam` để xem viền focus trắng | AC-1, AC-3, AC-5 |
  | Liên kết | Web, `tel:`, `mailto:`, và một link `javascript:alert(1)` | AC-6 |
  | Ô dịch vụ | Ô có link, ô `href = null`, ô `javascript:alert(1)` | AC-6, AC-21 |
  | Nhãn | Các biến thể, nhãn dài xuống dòng, nhãn rút gọn | AC-17 |
  | Ô tìm + chip + chuyển dạng + DataTable | Khoảng 40 mục mẫu (có "Thủy" và "Thuỷ", có U+200E trong "đăng ký"), 12 mục mỗi trang, trạng thái trên địa chỉ qua `useDanhSachUrl` | AC-7–AC-14 |
  | Phân trang | Pager đứng riêng, 20 trang | AC-13 |
  | Popup | Popup nội dung dài; nút mở popup thứ hai lồng bên trong (Esc chỉ đóng popup trên cùng); ở kiosk có một nút giả mang `data-ngoai-popup`, portal vào `<body>`, ghi rõ "chỉ để thử vòng Tab" | AC-15, AC-16, AC-24 (phần lõi) |
  | Trạng thái | Skeleton 3 dạng; ErrorState cho `mat-ket-noi`, `qua-nhieu-yeu-cau`, `loi-he-thong` (mã tra cứu mẫu); EmptyState các biến thể; một danh sách luôn rỗng có ô tìm (AC-20, gạch cuối) | AC-18–AC-20 |
  | Nút nổi | FloatingButton bên phải (`dangMo` bật/tắt) | AC-22 (phần lõi) |
  | Liên hệ | `LienHeProvider` với số mẫu | AC-19 |

- Chuỗi trên trang đi qua `t()` của namespace `xem-truoc`.
- **Khối "Tìm 1.000 mục" (thêm 2026-10-12, AC-25):** một khối riêng, `SearchBox` + danh sách 1.000 mục sinh bằng mã trong `duLieuMau.ts` (tên có dấu, một phần có U+200E ghép bằng `String.fromCodePoint`; chuỗi tìm chuẩn hoá sẵn bằng `ghepChuoiTimKiem`), lọc bằng `taoBoLocTuKhoa` + `useDeferredValue` — đúng đường lọc mà F03, F04 dùng. Khối có ô hiện số kết quả để e2e biết khi nào xong. Task T15.
- Dữ liệu mẫu đặt trong `duLieuMau.ts` (không phải JSX, nên luật chặn chữ viết thẳng trong JSX không áp). Ký tự vô hình tạo bằng `String.fromCodePoint(0x200e)`, không dán ký tự thật.

### 4.12 Khoá i18n thêm vào `core/i18n/vi/common.json`

| Khoá | Câu |
|---|---|
| `nut.xoa-bo-loc` | Xoá bộ lọc |
| `trang-thai.dang-xu-ly` | Đang xử lý |
| `lien-ket-ngoai.mo-trang-moi` | (mở trang mới) |
| `lien-ket-ngoai.trang-ngoai` | Trang ngoài |
| `tim-kiem.xoa` | Xoá từ khoá |
| `tim-kiem.so-ket-qua` | Có {{so}} kết quả. |
| `tim-kiem.khong-co-ket-qua` | Không có kết quả. |
| `cach-xem.nhan` · `.the` · `.bang` | Cách hiển thị · Dạng thẻ · Dạng bảng |
| `phan-trang.nhan` · `.truoc` · `.sau` · `.trang-truoc` · `.trang-sau` · `.trang-so` | Phân trang · Trước · Sau · Trang trước · Trang sau · Trang {{so}} |
| `danh-sach.vung-ket-qua` | Kết quả, trang {{trang}} trên {{tong}} |
| `loi-tai.tieu-de` · `.goi` · `.ma-tra-cuu` | Chưa tải được dữ liệu. · Cần hỗ trợ, gọi Trung tâm: · Mã tra cứu: {{ma}} |
| `rong.co-tu-khoa` · `.khong-tu-khoa` | Không tìm thấy {{doiTuong}} phù hợp với '{{tuKhoa}}' · Không tìm thấy {{doiTuong}} phù hợp |
| `rong.goi-y.*` | 4 gợi ý — câu theo Cần hỏi 4 |

Đã có, dùng lại: `nut.dong`, `nut.thu-lai`, `trang-thai.dang-tai`, `loi.*`.

## 5. Hiệu năng

- **Ngân sách** (F00 BR-9): JS tải ban đầu ≤ 200 KB gzip, hiện khoảng 124,6 KB.
  - Cách đo: mở `/` ở khổ 375; cộng entry, `vendor`, chunk route trang chủ và các chunk dùng chung kéo theo; nén gzip từng file trong `wwwroot/assets` (như F00 T09).
- **C01 thêm vào phần tải ban đầu:**
  - Kiosk, `useMediaQuery`, `useCachXem`, `LienHeProvider`: dưới 2 KB.
  - Các component layout F08 dùng (FloatingButton, ExternalLink…) và icon của chúng: ước dưới 5 KB.
  - Các component còn lại đi theo chunk của route dùng tới (F02–F05). Ước tổng mọi component lõi 10–15 KB gzip, đã gồm phần phình do obfuscate.
- **TanStack Table:**
  - Nằm trong chunk riêng, chỉ nạp khi hiện dạng bảng.
  - Điện thoại và kiosk (mặc định dạng thẻ) không tải chunk này.
  - Máy tính ≥ 1024 px (mặc định dạng bảng) tải ngay sau chunk trang chủ.
  - Ngân sách vẫn dư: 124,6 + khoảng 15 + khoảng 15 ≈ 155 KB.
- **Icon:** import đích danh từng icon, ESLint chặn import cả bộ.
- **CSS:**
  - CSS Module tách theo chunk; không dùng CSS-in-JS lúc chạy; không có tệp font.
  - Token và kiểu nền khoảng 2 KB, nằm ở CSS ban đầu.
- **Bản build production** không có trang xem trước (§4.11).
- **Tìm kiếm** chạy phía client: chuẩn hoá từ khoá một lần cho mỗi lần gõ; chuỗi tìm của từng mục chuẩn hoá sẵn khi nạp; lọc chạy qua `useDeferredValue` (≤ 200 ms với khoảng 1.000 mục, F00 BR-9).
- **Đo và báo kích thước từng chunk** ở T03 (gói mới), T08 (chunk TanStack), T11 (tổng: trước và sau C01).

## 6. Bảo mật

- **Dữ liệu ra trình duyệt:** C01 không gọi API. Phía trình duyệt chỉ lưu:
  - cờ `kiosk` trong `sessionStorage`;
  - lựa chọn `cach-xem` trong `localStorage`.
  - Không lưu thông tin cá nhân nào.
- **Liên kết từ dữ liệu:**
  - Chỉ nhận `http:`, `https:`, `tel:`, `mailto:` (`phanLoaiLienKet` dùng danh sách cho phép, phân tích bằng `new URL()`).
  - `javascript:`, `data:` và các dạng khác thành chữ thường (BR-3, AC-6).
  - Mọi liên kết ra ngoài có `rel="noopener noreferrer"`.
- **Chèn nội dung:**
  - Không `dangerouslySetInnerHTML` (ESLint đã chặn).
  - Từ khoá và dữ liệu hiện bằng nút chữ React. Câu i18n trả chuỗi thường, không dùng `<Trans>` để dựng HTML.
- **CSP:**
  - Không `<style>` hay `style="…"` chèn ở HTML; biến CSS động gán qua CSSOM (§3.1).
  - Icon là SVG trong bundle; không tài nguyên ngoài, không CDN.
- **Đầu vào:**
  - Ô tìm có `maxLength` 100 và chỉ lọc phía client.
  - Số trang chỉ nhận chuỗi chữ số; giá trị lạ không bao giờ hiện ra trang.
- **Cờ kiosk qua địa chỉ:**
  - Chỉ đổi kích thước giao diện, không mở thêm quyền gì.
  - Tham số bị xoá khỏi địa chỉ ngay khi đọc.
- **Trang xem trước:** chỉ ở bản dev; T11 kiểm trên bản build.
- **Giới hạn tần suất:** không áp dụng, vì C01 không có endpoint.

## 7. Truy vết

| Spec | Phần plan | Task | Kiểm ở |
|---|---|---|---|
| BR-1 quy tắc chung: bàn phím, focus, kích thước, kiosk, tương phản, không chỉ dựa vào màu, câu chữ, tên cho icon, hiệu ứng, giống nhau, không cuộn ngang | §3.1, §4.1, §4.4, §4.5–§4.10 | T01, T03–T10 | T14 trên trang xem trước; trang thật sau F02–F05, F08 |
| BR-2 nút | §4.5 | T05 | T14 |
| BR-3 liên kết ra trang ngoài | §4.3 `lienKet`, §4.6 `ExternalLink` | T02, T06 | T14; "Xem và nộp trên Cổng DVC" sau F03 |
| BR-4 ô tìm kiếm | §4.3 `timKiem`, §4.4 `useDanhSachUrl`, §4.7 `SearchBox` | T02, T04, T07 | T14; F03, F04, F05 |
| BR-5 chip lọc | §4.7 `ChipGroup` | T07 | T14; F03 |
| BR-6 chuyển dạng thẻ/bảng | §4.4 `useCachXem`, §4.7 `ViewToggle`, §4.8 | T04, T07, T08 | T14; F03, F04 |
| BR-7 bảng và thẻ | §4.6 `Card`, §4.8 `DataTable` | T06, T08 | T14 |
| BR-8 phân trang | §4.3 `phanTrang`, §4.4, §4.8 `Pager` | T02, T04, T08 | T14; F03, F04 |
| BR-9 popup | §3.2 `data-ngoai-popup`, §4.9 | T09 | T14; F03 (Quay lại), F09 (nút thật) |
| BR-10 nhãn trạng thái | §4.6 `Badge` | T06 | T14; F03 |
| BR-11 tải, lỗi, không có kết quả | §3.2 `LienHeProvider`, §4.10 | T04, T10 | T14; F02–F06, F08 |
| BR-12 ô dịch vụ | §4.6 `Tile`, `TileGrid` | T06, T11 | T14; F02 |
| BR-13 nút trợ lý nổi | §4.1 (`--fab-clearance`, lớp), §4.5 `FloatingButton` | T01, T05 | F06, F08 |
| AC-1 bàn phím ở 3 trang | §3.1, §4.1 (focus, `data-nen-dam`) | T01, T05–T10 | T14 (xem trước); trang thật sau F02, F04, F05, F08 |
| AC-2 kiosk 1080×1920, vùng bấm ở 375 | §4.1, §4.4 | T01, T04 | T14 |
| AC-3 xem đen trắng | §4.5, §4.7, §4.8, §4.6 | T05–T08 | T14 thử tay |
| AC-4 axe trên trang xem trước | §4.11 | T11 | T14 |
| AC-5 nút: gửi nhanh 2 lần, Trước vô hiệu, bật/tắt | §4.5, §4.8 | T05, T08 | T14; nút "Gửi" sau F06, đọc câu trả lời sau F07 |
| AC-6 liên kết ngoài, `javascript:` | §4.3, §4.6, §4.11 | T02, T06, T11 | T14; Cổng DVC sau F03 |
| AC-7, AC-8 so khớp | §4.3 `timKiem` | T02 | T02 (test đơn vị); trang thật sau F03, F04 |
| AC-9 nút ✕, không có micro | §4.7 | T07 | T14 |
| AC-10 chip | §4.7 | T07 | T14; chip "Đất đai" sau F03 |
| AC-11 chuyển dạng giữ trang, ẩn dưới 600 px | §4.4, §4.7, §4.8 | T04, T07, T08 | T14; F03 |
| AC-12 đầu bảng dính, cuộn ngang trong vùng, thẻ cao bằng nhau | §4.6, §4.8 | T06, T08 | T14 |
| AC-13 dãy trang 20 trang, cuộn về đầu | §4.3, §4.8 | T02, T08 | T14 |
| AC-14 1 trang, trang 99, "abc" | §4.3, §4.8 | T02, T08 | T14 |
| AC-15, AC-16 popup | §4.9 | T09 | T14; F03 |
| AC-17 nhãn | §4.6 | T06 | T14; thẻ thủ tục sau F03 |
| AC-18 đang tải | §4.10 | T10 | T14 |
| AC-19 lỗi | §4.10, §4.4 `LienHe` | T04, T10 | T14 (xem trước); danh mục thật sau F04, F08 |
| AC-20 không có kết quả | §4.4 `xoaBoLoc`, §4.10 | T04, T10, T11 | T14 (gạch cuối); F03, F04, F05 |
| AC-21 ô dịch vụ | §4.6, §4.11 | T06, T11 | T14; trang chủ sau F02 |
| AC-22 nút trợ lý | §4.5 | T05 | Sau F06, F08 |
| AC-23 hiệu ứng | §3.1, §4.1, §4.9 | T01, T05, T09 | T14 |
| AC-24 kiosk: vòng Tab có "Bắt đầu lại" | §3.2, §4.9 | T09 | T14 (nút giả); nút thật sau F09 |
| AC-25 tốc độ ô tìm kiếm: 1.000 mục ≤ 200 ms, 375 px, 4G giả lập, chậm nhất trong 10 lần gõ | §4.3 `timKiem`, §4.7 `SearchBox`, §4.11 khối "Tìm 1.000 mục", §5; cách đo §8 | T07, T15 | T14; F04 AC-4 trên dữ liệu thật |

## 8. Kiểm thử

- **Vitest + Testing Library** (ui-core-dev, mỗi component một tệp `.test.tsx`):
  - Dùng `user-event` cho bàn phím, `jest-dom` cho matcher.
  - Tệp `src/test-setup.ts` giả lập `matchMedia`, `scrollIntoView` (jsdom không có).
  - jsdom không tính bố cục, không thi hành `inert`. Vì vậy test chỉ kiểm thuộc tính và hành vi sự kiện; bố cục, tương phản, vùng bấm kiểm bằng Playwright.
- **Playwright** (tester, `e2e/thanh-phan.spec.ts`), chạy trên `/dev/design-system` qua `npm run dev`:
  - AC-25 (≤ 200 ms): khối "Tìm 1.000 mục" ở khổ 375 px, giả lập 4G (CDP `Network.emulateNetworkConditions`), CPU máy tính thường. Đo từ lúc gõ phím cuối "khai sinh" tới khi số kết quả đổi (`performance.now()` trong trang hoặc `page.waitForFunction`); lặp 10 lần, lấy giá trị chậm nhất, phải ≤ 200 ms. Trang xem trước chỉ có ở bản dev (React bản dev chậm hơn bản build), nên tester ghi rõ cách đo vào `result/test.md`; vượt 200 ms thì tìm nguyên nhân ở `timKiem.ts` / `SearchBox` (ui-core-dev). AC-25 trên dữ liệu thật: F04 AC-4.
  - axe với thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, ở chế độ thường và kiosk, khổ 375 và 1080×1920.
  - Bàn phím: vòng Tab của popup.
  - Không cuộn ngang.
  - Vùng bấm ≥ 24 × 24 px.
  - Giảm chuyển động bằng `emulateMedia({ reducedMotion: 'reduce' })`.
  - Liên kết `javascript:` và ô dịch vụ.
- **Thử tay:** chế độ đen trắng (AC-3); NVDA (AC-10, AC-15, AC-19); bảng hiệu ứng của công cụ dành cho nhà phát triển (AC-23).
- **AC phụ thuộc chức năng khác** — chạy khi chức năng có. `trang_thai` của C01 chỉ chuyển `xong` khi các AC này đạt:

  | AC | Chờ |
  |---|---|
  | AC-1 (3 trang thật), AC-11, AC-17, AC-20 (khối thường gặp) | F02, F03, F08 |
  | AC-19, AC-20 (danh mục) | F04, F08 |
  | AC-20 (lĩnh vực) | F05 |
  | AC-5 (nút "Gửi"), AC-22 | F06 |
  | AC-5 (đọc câu trả lời) | F07 |
  | AC-24 (nút "Bắt đầu lại" thật) | F09 |

## 9. Cần hỏi

Làm theo đề xuất nếu người dùng không phản đối. Người dùng chọn khác thì planner sửa plan trước khi làm lại phần liên quan.

Người dùng không phản đối câu 1–4: **đã chấp nhận 2026-10-12** theo đề xuất ở từng dòng.

| # | Câu hỏi | Phương án | Đề xuất | Ảnh hưởng |
|---|---|---|---|---|
| 1 | **Link kiosk có dạng gì, giữ cờ ở đâu?** F09 BR-1 chỉ ghi "bằng link kiosk riêng; tải lại vẫn giữ" | (a) Thêm `?kiosk=1` vào địa chỉ bất kỳ (tắt bằng `?kiosk=0`); đọc xong xoá khỏi địa chỉ; giữ trong `sessionStorage` — đóng tab là mất, máy khác không bị dính. (b) Đường dẫn riêng `/kiosk`, chuyển về `/` — cần thêm route. (c) Như (a) nhưng giữ trong `localStorage` — bền hơn khi trình duyệt kiosk khởi động lại mà không mở đúng link, nhưng ai bấm nhầm link kiosk trên điện thoại sẽ bị giữ ở chế độ kiosk tới khi mở `?kiosk=0` | (a) — **đã chấp nhận 2026-10-12** | T04 |
| 2 | **Trình đọc màn hình đọc trạng thái chip và nút chuyển dạng thế nào?** Spec ghi đọc là "đã chọn". Design-system và prototype đã duyệt dùng `aria-pressed`; NVDA tiếng Việt đọc tương đương "đã nhấn", không đúng chữ "đã chọn" | (a) Giữ `aria-pressed` như design-system; tester chấp nhận câu đọc mang nghĩa đang chọn. (b) Dùng vai trò nhóm lựa chọn (`radiogroup` / `radio` + `aria-checked`) — đọc "đã chọn", nhưng cả nhóm chỉ một điểm dừng Tab, phải dùng phím mũi tên để chuyển chip, khác BR-1 "tới được bằng Tab". (c) `aria-pressed` + chữ ẩn "đã chọn" — đọc trùng hai lần | (a) — **đã chấp nhận 2026-10-12** | T07; tiêu chí AC-10, BR-6 cho tester |
| 3 | **Bấm sang trang khác thì con trỏ ở đâu?** Spec chỉ ghi "danh sách cuộn về đầu" | (a) Chuyển con trỏ tới đầu vùng kết quả; trình đọc đọc "Kết quả, trang 3 trên 20"; nhấn Tab là vào mục đầu. (b) Giữ con trỏ ở nút vừa bấm; danh sách cuộn lên nên con trỏ nằm ngoài màn hình | (a) — **đã chấp nhận 2026-10-12** | T08 |
| 4 | **Câu chữ 4 gợi ý khi không có kết quả** (BR-11 chỉ nêu ý) | Đề xuất: "Kiểm tra lại chính tả hoặc thử từ khoá ngắn hơn." · "Xoá bộ lọc để tìm trong toàn bộ danh sách." (trang có nút trên thanh lọc: "Bấm “Xoá bộ lọc” trên thanh bộ lọc để tìm trong toàn bộ danh sách.") · "Hỏi Trợ lý thủ tục ở góc phải bên dưới màn hình." · "Gọi Trung tâm: <số>" (không có số: "Hỏi cán bộ tại Trung tâm.") | Như bên trái; duyệt trên trang xem trước — **đã chấp nhận 2026-10-12** | T10 (chỉ sửa `common.json`) |

## 10. Rủi ro

1. **Đầu bảng dính và cuộn ngang** (§4.8): đầu bảng dính trong vùng bảng, không dính theo cuộn của cả trang. Nếu người dùng cuộn cả trang để đỉnh vùng bảng trượt khỏi màn hình, dòng tiêu đề khuất theo.
   - Vùng bảng cao tối đa bằng màn hình và nhận cuộn trước, nên với 12–25 dòng mỗi trang, trường hợp này hiếm.
   - AC-12 kiểm cả hai cách cuộn. Nếu không đạt, phương án thay thế là đầu bảng nhân bản đồng bộ bằng JS — phức tạp hơn, cần quyết lại.
2. **Popup tự làm thay `<dialog>`**: phải tự lo vòng Tab, Esc, `inert`, khoá cuộn.
   - F09 phải render nút "Bắt đầu lại" qua portal làm con trực tiếp của `<body>`, kèm `data-ngoai-popup`.
   - F06 đặt khung trợ lý ở đâu cũng được, vì sẽ bị `inert` khi popup mở.
   - Ghi vào plan F06, F08, F09.
3. **Bộ gõ tiếng Việt và giới hạn `replaceState` của Safari**: đã tách giá trị ô tìm khỏi địa chỉ và ghi địa chỉ trễ (§4.4). Phải thử tay với Unikey (Telex, VNI) trên Chrome, và gõ nhanh trên Safari iOS.
4. **Câu trình đọc màn hình đọc khác chữ trong spec** (Cần hỏi 2): tester cần tiêu chí rõ trước khi chạy AC-10, AC-11.
5. **TanStack Table 9.x mới**: API khác 8.x. Không ổn thì lùi về 8.x (§4.2). Ảnh hưởng chỉ nằm trong `BangDuLieu.tsx`.
6. **Trang xem trước lọt vào bản build** nếu bundler không bỏ nhánh `import.meta.env.DEV`. T11 kiểm bằng cách tìm chuỗi riêng của trang trong `wwwroot`.
7. **Nhiều AC chỉ kiểm được khi có chức năng** (§8): C01 ở `dang-lam` lâu. F00 cũng vậy (F00 plan rủi ro 6).
8. **Ký tự vô hình trong mã và test**: công cụ Edit có thể đổi escape thành ký tự thật, không nhìn thấy khi review. Dùng `String.fromCodePoint(...)` trong test và dữ liệu mẫu; sau khi ghi tệp, tìm U+200B–U+200F, U+FEFF bằng `grep -P` (lệnh cụ thể ở `tasks.md`).

## 11. Ngoài phạm vi C01

| Phần | Thuộc | Ghi chú cho plan đó |
|---|---|---|
| Đầu trang, điều hướng 3 mục, nhãn ngắn dưới 600 px ("Trang chủ · Danh mục · Lĩnh vực", tên đầy đủ cho trình đọc màn hình, `aria-current`), không có nút menu | F08 | Dùng token, `VisuallyHidden`, icon của C01 |
| Liên kết "Bỏ qua, tới nội dung chính", chân trang, trang 404, tiêu đề tab, dữ liệu đặc tả | F08 | Chân trang: `data-nen-dam`, đệm dưới `--fab-clearance`, liên hệ qua `ExternalLink` |
| Cấp số điện thoại cho `LienHeProvider`; đặt `--sticky-offset` theo thanh điều hướng dính | F08 | §3.2 |
| Nút "Bắt đầu lại" | F09 | Dùng `FloatingButton viTri="trai" trenPopup`, portal vào `<body>` + `data-ngoai-popup` |
| Dòng nhắc đăng xuất; nhận biết liên kết tới Cổng DVC (`dichvucong.gov.vn`); xoá trạng thái và lịch sử; giữ bật đọc và dạng xem | F09 | Dòng nhắc dùng ở F02, F03, F04, F06 nên nhiều khả năng đặt ở `core` — khi đó là task ui-core-dev trong plan F09 |
| Khung trợ lý; trả con trỏ về nút trợ lý; nạp lười trợ lý | F06 | Nút "Gửi" dùng `Button dangXuLy`; câu gợi ý dùng `Chip` |
| Nút bật/tắt đọc câu trả lời | F07 | `IconButton dangBat` |
| Thẻ thủ tục, cột bảng, nội dung popup chi tiết, link riêng `?ma=` và "Quay lại", 12 mục mỗi trang, tối đa 4 cột | F03 | |
| Tab cấp xã / cấp tỉnh, ô chọn lĩnh vực và mức độ, thống kê, nút "Xoá bộ lọc" trên thanh lọc, 25 mục mỗi trang | F04 | Cần ô chọn (`Select`) dùng chung → plan F04 thêm task ui-core-dev |
| Lưới lĩnh vực, mã QR | F05 | |
| Banner, giờ làm việc, ánh xạ khoá biểu tượng ô dịch vụ (`boc-so`…`lien-ket`) sang icon và màu `MauO` | F02 | |
| Sắp xếp theo cột, chế độ tối | — | Spec, design-system không yêu cầu |
