---
id: F02
ten: Trang chủ — kế hoạch kỹ thuật
spec: spec.md (da-duyet → dang-lam 2026-10-13)
cap_nhat: 2026-10-13
---

# F02 · Trang chủ — kế hoạch kỹ thuật

Chuẩn đối chiếu: `CLAUDE.md`; `F08-khung-trang/plan.md` (§3.1 `GET /api/trung-tam`, §4.2 `Layout`, §4.12 bàn giao cho F02); `C01-component-dung-chung/plan.md` (§4.6 `Tile`, `TileGrid`, `Badge`; §4.10 `QueryState`, `Skeleton`); `design-system.md` (§5 `HeroBanner`, `StatusPill`); `prototype/index.html` (`veTrangChu`, `veGioLamViec` — đã duyệt 2026-10-12). Mã thật đã đọc ở `src/FrontEnd/src/{core,app,features/trang-chu}`: `Tile`, `TileGrid`, `Badge`, `QueryState`, `Skeleton`, `useThongTinTrungTam`, `Layout`, `routes.tsx`.

Quyền sở hữu hợp đồng (ba planner chạy song song): F02 **không thêm API**, không thêm bảng. Plan F03 đã có (`F03-thu-tuc-thuong-gap/plan.md` §4.5, §4.8, §4.9): chỗ ghép khối thường gặp đã chốt theo đó (§4.5, §10 A1). Plan F04 chưa có và F02 không dùng API của F04.

## 1. Tóm tắt

Trang chủ `/` gồm bốn khối theo thứ tự của design-system (§ bố cục, "giữ thứ tự"): banner → ô dịch vụ nhanh → thủ tục thường gặp (F03) → giờ làm việc. Đầu trang, điều hướng, chân trang (liên hệ, liên kết hữu ích, mạng xã hội, dòng cập nhật) đã có ở F08; trang chủ không lặp lại địa chỉ, điện thoại, email (spec F02 mục Ngoài).

| Phần | Chạm gì |
|---|---|
| DB | Không đổi, không migration. Dữ liệu ô dịch vụ và giờ làm việc đã nằm ở `o_dich_vu`, `gio_lam_viec` (F01) |
| BE | Không có task. Không endpoint mới. Đọc `GET /api/trung-tam` của F08 (§3) |
| FE `core/` (ui-core-dev) | Thêm dạng `'o'` cho `Skeleton` (khung giữ chỗ lưới ô dịch vụ). Không component mới khác |
| FE `features/trang-chu/` (frontend-dev) | Thay `TrangChu` tạm bằng: `BannerTrangChu`, `KhuODichVu`, `KhoiGioLamViec`, hàm thuần tính giờ, hook đồng hồ, `vi.json` |
| FE `app/` | Không đổi. `app/routes.tsx` (nạp namespace `thu-tuc` ở route `/`) và `Layout` (gắn `PopupTheoDiaChi`) do task của F03 lo (F03 T04, T06), F02 không sửa |
| Trợ lý | Không có task |

Không thêm thư viện. Không dùng `Intl` hay gói múi giờ: giờ Việt Nam tính bằng cộng cố định 7 giờ vào mốc UTC (§4.3).

Không có khối thống kê ở F02: thống kê (số thủ tục cấp xã, cấp tỉnh, số lĩnh vực) của prototype nằm ở trang danh mục (`veDanhMuc`) và thuộc F04, spec F02 không có. Vì vậy F02 không gọi API của F04.

## 2. Dữ liệu

Không có entity, bảng, cột, chỉ mục hay migration mới. Giá trị thật của Cần Giuộc: ô dịch vụ ở `lien-ket.md` §1 (6 ô; 2 ô đầu không có link), giờ làm việc ở `can-giuoc.md` §2 (giờ tạm Thứ Hai – Thứ Sáu, 07:00–11:30 và 13:30–17:00, chờ Trung tâm xác nhận — câu hỏi mở 13). Không chép vào code (BR-1); nhập bằng file F01.

## 3. API — hợp đồng giữa BE và FE

Không có endpoint mới. F02 chỉ đọc `GET /api/trung-tam` (F08 plan §3.1, đã làm — `core/api/trungTam.ts`, hook `useThongTinTrungTam()`, khoá `['trung-tam']`). Cùng khoá với `Layout` (đầu, chân trang) nên **không phát sinh thêm yêu cầu mạng**.

Trường F02 dùng:

| Trường | Dùng ở | Ghi chú |
|---|---|---|
| `ten`, `coQuanChuQuan` | Banner | Nguyên văn; `coQuanChuQuan` trống thì ẩn dòng |
| `oDichVu[]` (`ten`, `bieuTuong`, `url`) | Ô dịch vụ | Theo thứ tự trong dữ liệu. `url` null hoặc sai định dạng → ô thường (C01 BR-12). `moTa` không hiển thị: `Tile` của C01 không có chỗ cho nó và spec không yêu cầu (ghi cho ba-analyst, §10) |
| `gioLamViec[]` (`thu`, `sangTu`, `sangDen`, `chieuTu`, `chieuDen`) | Giờ làm việc | `thu` 1 = Thứ Hai … 7 = Chủ nhật; giờ dạng `"HH:mm"`; chỉ có ngày làm việc (F08 §2) |
| `ghiChuNgayNghi` | Giờ làm việc | Dòng ghi chú; trống thì ẩn |

Lỗi: 404 `khong-tim-thay` (chưa nhập dữ liệu Trung tâm), mất mạng, 429, 500 → xử lý ở §4.6.

**Trạng thái "đang trong giờ làm việc" tính ở FE, không ở BE** (F08 §4.12 để F02 quyết). Lý do: response được output cache theo phiên bản dữ liệu và trình duyệt giữ 304; trường "đang mở" do BE trả sẽ cũ ngay sau giờ chuyển, còn FE đã có đủ dữ liệu giờ từng thứ. FE vừa tính trạng thái vừa hiển thị giờ từ cùng một nguồn nên hai phần không lệch nhau.

## 4. Frontend

### 4.1 Route và khung

- Route `/` (`handle.trang = 'trang-chu'`, `React.lazy` + `Suspense` trong `<main>` của `Layout`): đã có, **không sửa** `routes.tsx` (trừ §4.5). `TrangChu` và `napNgonNguTrangChu` giữ tên và chỗ cũ.
- Tiêu đề tab, dữ liệu đặc tả: F08 `DacTaTrang` đã lo. F02 không đụng.
- Đầu, chân trang nằm ngoài `<main>`, hiện ngay khi JS chạy; trạng thái tải, lỗi của trang chủ chỉ nằm trong `<main>` (F08 BR-11).

### 4.2 Bố cục và cấu trúc tiêu đề

```
<main>
  <BannerTrangChu />                      ← <section>, h1
  <KhuODichVu truyVan />                  ← <section aria-labelledby>, h2 ẩn "Dịch vụ nhanh"
    {/* F09: dòng nhắc đăng xuất — ngay trên TileGrid */}
  <KhoiThuongGap />                       ← F03, tự bọc <section>/h2 "Thủ tục thường gặp" (SectionTitle); ẩn cả khối khi không có thủ tục thường gặp
  <KhoiGioLamViec truyVan />              ← <section aria-labelledby>, h2 "Thời gian làm việc"
</main>
```

- Đúng một `h1` (banner); ba `h2` cho ba khối còn lại. Thứ tự DOM = thứ tự Tab = thứ tự đọc.
- Khoảng cách giữa các khối dùng token (`--space-5`/`--space-6`); trang chủ có `TrangChu.module.css` riêng. Chỉ `var(--…)`, không giá trị màu cứng (`core/styles/css.test.ts` kiểm với `core/`; feature theo cùng quy ước).
- Mọi chữ qua `t()`; namespace `trang-chu` (`features/trang-chu/i18n/vi.json`). Khoá `tieu-de` tạm hiện có được thay bằng các khoá ở §4.7.

### 4.3 Hàm thuần tính giờ — `features/trang-chu/gioLamViec.ts`

Không phụ thuộc React, múi giờ hay `Intl`; test được bằng `Date` dựng từ chuỗi UTC.

```ts
import type { ThongTinTrungTam } from '../../core/api/trungTam';

type GioNgay = ThongTinTrungTam['gioLamViec'][number];

/** Một buổi: giờ nguyên văn "HH:mm" để hiển thị, phút trong ngày để so sánh. */
export interface Khung { tu: string; den: string; phutTu: number; phutDen: number }

/** Các ngày liền nhau có cùng giờ gộp thành một dòng (BR-8). */
export interface NhomGio { tuThu: number; denThu: number; sang: Khung | null; chieu: Khung | null }

/** Thứ và số phút trong ngày theo giờ Việt Nam (UTC+7 cố định, không có giờ mùa hè). */
export function thoiDiemVietNam(luc: Date): { thu: number; phut: number };
/** BR-2, BR-7: đang trong buổi sáng hoặc chiều của đúng ngày hôm đó? Ngày không có dòng giờ = ngày nghỉ. */
export function dangLamViec(gio: readonly GioNgay[], luc: Date): boolean;
/** BR-8: sắp theo thứ, bỏ ngày không có buổi hợp lệ, gộp ngày liền nhau cùng giờ. */
export function gopNgay(gio: readonly GioNgay[]): NhomGio[];
```

Quy tắc cài đặt:

- `thoiDiemVietNam`: `const vn = new Date(luc.getTime() + 7 * 3_600_000)`; `thu = vn.getUTCDay() || 7`; `phut = vn.getUTCHours() * 60 + vn.getUTCMinutes()`. Kết quả không đổi theo múi giờ máy khách (AC-2 trên máy đặt múi giờ khác).
- Chuẩn hoá một ngày (dùng chung cho `dangLamViec` và `gopNgay`, nên trạng thái và dòng giờ không thể lệch nhau): mỗi buổi chỉ tính khi cả hai đầu đúng `^\d{2}:\d{2}$`, giờ 00–23, phút 00–59, và `tu < den`. Buổi hỏng → bỏ qua (không ném lỗi, không hiện chữ lạ). Ngày không còn buổi nào → coi như ngày nghỉ, không có dòng.
- Ranh giới buổi: `phutTu <= phut && phut < phutDen` (đầu gồm, cuối không gồm — như prototype; câu B2 §10).
- `gopNgay`: sắp theo `thu` tăng dần; hai ngày gộp khi `thu` kế tiếp (`denThu + 1`) và hai buổi sáng, hai buổi chiều trùng từng giá trị (cả khi cùng `null`). Thứ Hai và Chủ nhật không nối vòng. Ngày nghỉ chen giữa (vd. thiếu Thứ Tư) cắt nhóm.
- Không xét ngày lễ, Tết (BR-3): ghi chú chỉ để hiển thị.

### 4.4 Đồng hồ — `features/trang-chu/useBayGio.ts`

```ts
/** Trả thời điểm hiện tại, tự cập nhật mỗi `khoangMs` (mặc định 60 000) và ngay khi tab hiện lại. */
export function useBayGio(khoangMs?: number): Date;
```

- `useState(() => new Date())` + `setInterval` + `visibilitychange` (khi `visibilityState === 'visible'` thì cập nhật ngay), gỡ cả hai khi huỷ.
- Chỉ `KhoiGioLamViec` gọi hook này, nên mỗi phút chỉ khối giờ vẽ lại, không kéo theo khối F03.
- Trình duyệt giảm tốc bộ đếm khi tab ẩn; `visibilitychange` bù lại khi người dùng quay lại. Kiosk không bao giờ tải lại trang (F09 BR-2) nên bộ đếm là cách duy nhất giữ trạng thái đúng.
- Độ trễ tối đa 1 phút tại ranh giới giờ là chấp nhận được (lệnh "chọn cách đơn giản"). Không dùng vùng `aria-live` cho trạng thái: nó đổi vài lần mỗi ngày, người dùng trình đọc màn hình đọc được khi tới khối; thông báo tự động mỗi lần đổi chỉ gây nhiễu.
- Chỉ cập nhật trạng thái "đang mở/đã đóng" và dòng giờ. Dữ liệu giờ mới (Trung tâm nhập lại file) trên kiosk theo F08 §4.11 / F09, F02 không tự tải lại dữ liệu.

### 4.5 Khối thành phần

**`BannerTrangChu`** (`HeroBanner` trong design-system):
- Nền gradient hai điểm bằng token (`--color-primary-strong` → `--color-primary`), bo `--radius-lg`, chữ `--color-on-primary`. Không dùng điểm màu thứ ba `#2f86d6` của prototype: chữ trắng trên màu đó chỉ khoảng 3,9:1, trong khi hai token cho ≥ 5,7:1. Gradient chỉ dùng ở nền banner (design-system).
- Nội dung: dòng nhỏ `coQuanChuQuan` (ẩn khi trống) · `<h1>` = `ten` (cỡ `--font-size-2xl`) · một câu mô tả cố định (`banner.mo-ta`, từ i18n).
- Chưa có ảnh trụ sở (DS-5): banner chỉ chữ, nên BR-5 (ảnh không làm chậm lần hiển thị đầu) được thoả vì không có ảnh. Khi Trung tâm cung cấp ảnh sẽ lập task riêng (WebP/AVIF ≤ 150 KB, `width`/`height`, khung giữ chỗ cố định) — câu B1 §10.
- Đang tải: câu mô tả hiện ngay (chữ tĩnh); chỗ `coQuanChuQuan` và `ten` là khối giữ chỗ mờ (`background: currentColor` với độ mờ thấp — không cần token màu mới), `aria-hidden`. Banner đặt `min-height` đủ cho trường hợp có đủ dòng cơ quan và tên dài hai dòng ở 375px, để dữ liệu về không đẩy các khối bên dưới (§5, bài học CLS của F08).
- Lỗi hoặc 404 (không có dữ liệu): `h1` hiện câu dự phòng `banner.tieu-de-du-phong` ("Tra cứu thủ tục hành chính"), không ẩn `h1`.

**`KhuODichVu`** (nhận kết quả `useThongTinTrungTam()` từ `TrangChu`):
- `<section aria-labelledby>` với `h2` ẩn chữ bằng `VisuallyHidden` ("Dịch vụ nhanh"). Không dùng `<nav>`: đã có thanh điều hướng chính; thêm một landmark `nav` chỉ làm trình đọc màn hình rối.
- `QueryState` của C01: `khungCho = <Skeleton dang="o" soMuc={6} />`; lỗi → `ErrorState` (nút "Thử lại" làm mới khoá `['trung-tam']`, nên đầu và chân trang cũng được làm mới). **Đây là nơi duy nhất của trang chủ hiện `ErrorState` cho dữ liệu Trung tâm**, để không có ba thông báo lỗi liền nhau; banner rơi về chữ dự phòng, khối giờ ẩn (§4.6).
- `oDichVu` rỗng → không hiện lưới (khối chỉ có `h2` ẩn); `ErrorState` không hiện vì không phải lỗi.
- Mỗi ô: `<Tile ten={o.ten} href={o.url} bieuTuong={<Icon size={20} />} mau={…} />` trong `<TileGrid>`. `url` null, rỗng hoặc sai định dạng → `Tile` tự hiện ô thường: cùng khung, icon, màu, tên, chiều cao; không "Trang ngoài", không `href`/`role`/`tabindex`, Tab bỏ qua, không viền nét đứt, không mờ (BR-4, AC-8). F02 không viết lại logic này, không tự lọc link: `Tile` dùng `phanLoaiLienKet` (chỉ `http`/`https`).
- Bảng gán icon và màu theo **khoá** `bieuTuong` (không theo vị trí, để thêm hay đổi thứ tự ô không đổi màu — AC-3, AC-6), file `bieuTuongODichVu.tsx`:

  | `bieuTuong` | Icon Lucide | `MauO` |
  |---|---|---|
  | `boc-so` | `Ticket` | `indigo` |
  | `danh-gia` | `Star` | `pink` |
  | `tra-cuu-ho-so` | `Search` | `teal` |
  | `thanh-toan` | `CreditCard` | `orange` |
  | `cong-dvc` | `Landmark` | `blue` |
  | `cong-thong-tin` | `Building2` | `navy` |
  | `lien-ket` | `ExternalLink` | `blue` |

  Kiểu `Record<BieuTuongODichVu, …>` buộc `tsc` báo lỗi nếu union ở `core/api/trungTam.ts` thêm khoá (khoá có ở 3 nơi: `MauExcel.cs` của F01, union, bảng này — F08 §3.1). Khoá lạ lúc chạy (BE sau này thêm khoá mà FE chưa cập nhật) → dùng dòng `lien-ket`, không ném lỗi. Tên icon trên là gợi ý theo prototype; frontend-dev đối chiếu với bộ `lucide-react` đang cài, đổi tên nếu bản đó đặt khác.
- Chừa chỗ cho F09: dòng "Nhớ đăng xuất khi dùng xong" đặt **ngay trên `TileGrid`** trong `KhuODichVu`, chỉ ở kiosk và chỉ khi có ít nhất một ô tới `dichvucong.gov.vn` (F09 BR-4). Việc F09 làm; F02 chỉ ghi chú vị trí bằng comment trong mã.

**`KhoiGioLamViec`**:
- Dải nền `--color-primary-strong`, chữ `--color-on-primary`, bo `--radius-md`, thuộc tính `data-nen-dam` (viền focus trắng, C01 §3.2). `<section aria-labelledby>`, `h2` "Thời gian làm việc" với icon đồng hồ.
- Nội dung (khi có dữ liệu):
  1. Trạng thái: `Badge kichThuoc="vua"` — mở: `loai="success"`, icon `CircleCheck`, chữ "Đang trong giờ làm việc"; đóng: `loai="neutral"`, icon `Clock`, chữ "Ngoài giờ làm việc" (BR-2). Có icon và chữ, không chỉ màu.
  2. Danh sách dòng từ `gopNgay(gioLamViec)` (BR-8): mỗi dòng gồm nhãn thứ — một ngày: "Thứ Bảy"; từ hai ngày: "Thứ Hai – Thứ Sáu" (mẫu `gio-lam-viec.khoang`) — rồi "Buổi sáng 07:00 – 11:30" và/hoặc "Buổi chiều 13:30 – 17:00" (buổi nào không có thì không hiện). Ngày nghỉ không có dòng (AC-9: không có dòng Chủ nhật). Giờ hiện nguyên văn `HH:mm` từ dữ liệu.
  3. `ghiChuNgayNghi` nếu có: một dòng chữ riêng ở cuối, không ảnh hưởng trạng thái (BR-3, AC-5).
- `gioLamViec` rỗng, hoặc không còn dòng hợp lệ nào → ẩn cả khối (kể cả trạng thái): không có giờ nào để nói "ngoài giờ" (câu B4 §10).
- Đang tải: dải xanh và tiêu đề hiện ngay; phần bên trong là khối giữ chỗ (aria-hidden) với `min-height` bằng trường hợp thường gặp (một dòng gộp, hai buổi) + chữ ẩn "Đang tải…" cho trình đọc màn hình (khoá `common:trang-thai.dang-tai`). Lỗi (kể cả 404): ẩn cả khối.
- Bố cục: dưới 900px xếp dọc; từ 900px trạng thái nằm cùng hàng với tiêu đề, các dòng giờ xếp ngang hoặc theo lưới. Prototype có một dòng duy nhất (cố định hai buổi); spec BR-8 yêu cầu nhiều dòng nên bố cục phải chịu 1–3 dòng (7 ngày làm việc khác giờ nhau tối đa 7 dòng: vẫn đọc được, không tràn ngang ở 375px).

**Khối thường gặp (F03)** — hợp đồng đã chốt theo `F03/plan.md` §4.5, §4.8, §4.9:
- Import: `import { KhoiThuongGap } from '../thu-tuc/KhoiThuongGap';` (không qua barrel). Component **không có props**, tự bọc `<section>`, tiêu đề `h2` và số đếm "Hiển thị x/y"; tự xử lý đang tải (`Skeleton dang="the"`), lỗi (`ErrorState` + "Thử lại") và rỗng — không có thủ tục thường gặp thì **không vẽ gì** (F02 không cần kiểm).
- F02 chỉ đặt `<KhoiThuongGap />` giữa `KhuODichVu` và `KhoiGioLamViec`. F02 không sở hữu: danh sách, ô tìm, chip, `DataTable`, trạng thái trên địa chỉ (`q`, `lv`, `trang`, `ma`), nhớ dạng thẻ/bảng, `useTieuDeTabTam`.
- **Ranh giới popup:** `PopupTheoDiaChi` (đọc `?ma=`) do F03 gắn vào `Layout` (F03 T06), phục vụ mọi trang. F02 **không mount popup** và không đọc `?ma=`.
- **Câu chữ:** namespace `thu-tuc` do F03 T04 thêm kiểu ở `app/i18n.d.ts` và nạp trong `Promise.all` của route `/` ở `app/routes.tsx`. F02 không sửa hai file đó (không còn task ui-core-dev nào ở phía F02 cho việc này). Giữ `napNgonNguTrangChu` như cũ.
- **Dữ liệu của khối:** F03 gọi `useDanhMucThuTuc()` của F04 (hợp đồng F04 chưa có — F03 plan §10 mục 1). Vì vậy dữ liệu thật của khối chờ F04; F02 chỉ chịu ảnh hưởng ở T09 (ghép) và T10 (đo lại).
- Khối dòng nhắc đăng xuất kiosk "phía trên danh sách" **thuộc F09** (F09 thêm vào component của F03); F02 chỉ chừa vị trí ở khối ô dịch vụ (§4.5).
- Trong lúc F03 chưa xong (T07 của F03), `TrangChu` để chỗ trống có comment ở đúng vị trí; các khối khác chạy độc lập (T05 không chờ F03).

### 4.6 Trạng thái tải, lỗi (BR-11 của F08, C01 BR-11)

| Tình huống | Banner | Ô dịch vụ | Khối giờ |
|---|---|---|---|
| Đang tải lần đầu | Câu mô tả hiện; tên và cơ quan là khối giữ chỗ | `Skeleton dang="o"` | Dải xanh + tiêu đề, bên trong giữ chỗ |
| Có dữ liệu | Đầy đủ | Lưới ô | Trạng thái + dòng giờ + ghi chú |
| Lỗi mạng / 5xx / 404 | `h1` dự phòng | `ErrorState` + "Thử lại" (số điện thoại chỉ hiện nếu đã từng tải được — F08 §4.8) | Ẩn |
| "Thử lại" | — | Quay về khung giữ chỗ (`QueryState`), rồi kết quả | Giữ chỗ → kết quả |

Lỗi của khối F03 độc lập với dữ liệu Trung tâm: F03 hỏng thì ô dịch vụ và giờ làm việc vẫn hiện, và ngược lại.

### 4.7 Câu chữ — `features/trang-chu/i18n/vi.json`

| Khoá | Chữ |
|---|---|
| `banner.mo-ta` | Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ. |
| `banner.tieu-de-du-phong` | Tra cứu thủ tục hành chính |
| `o-dich-vu.tieu-de` | Dịch vụ nhanh |
| `gio-lam-viec.tieu-de` | Thời gian làm việc |
| `gio-lam-viec.sang` · `.chieu` | Buổi sáng · Buổi chiều |
| `gio-lam-viec.khoang` | {{tu}} – {{den}} (dùng cho cả "Thứ Hai – Thứ Sáu" và "07:00 – 11:30") |
| `gio-lam-viec.dang-mo` · `.ngoai-gio` | Đang trong giờ làm việc · Ngoài giờ làm việc (đúng từng chữ như BR-2) |
| `gio-lam-viec.thu.1` … `.7` | Thứ Hai · Thứ Ba · Thứ Tư · Thứ Năm · Thứ Sáu · Thứ Bảy · Chủ nhật |

Khoá `tieu-de` hiện có bị bỏ (chỗ dùng ở `TrangChu` tạm đã thay). `app/i18n.d.ts` đã gắn kiểu theo `vi.json`, gõ sai khoá là lỗi build. Câu chữ đi cùng chunk của trang (đăng ký bằng `napNgonNguTrangChu`), không thêm vào `common`.

### 4.8 Phần dùng từ `core/` và phần phải thêm

| Cần | Dùng | Ghi chú |
|---|---|---|
| Ô dịch vụ | `Tile`, `TileGrid`, `MauO` (có sẵn) | BR-12 của C01 đã cài |
| Nhãn trạng thái | `Badge` (`kichThuoc="vua"` có sẵn) | `StatusPill` của design-system chính là `Badge` này |
| Tải/lỗi | `QueryState`, `ErrorState`, `Skeleton` (có sẵn) | |
| Chữ ẩn | `VisuallyHidden` (có sẵn) | `h2` "Dịch vụ nhanh", "Đang tải…" |
| Icon | `lucide-react`, import đích danh | `Ticket`, `Star`, `Search`, `CreditCard`, `Landmark`, `Building2`, `ExternalLink`, `Clock`, `CircleCheck` |
| Khung giữ chỗ lưới ô | **Mới: `Skeleton dang="o"`** (ui-core-dev, T01) | Cùng lưới 2/3/6 cột và chiều cao tối thiểu của `Tile`, mặc định 6 khối. Đặt ở `core` vì mốc 600/1024px và chiều cao ô là của `Tile`, copy sang feature sẽ lệch dần |

Không thêm component nào khác vào `core/`. Đồng hồ và logic giờ làm việc không có trong `core/` vì đều thuộc nghiệp vụ trang chủ.

## 5. Hiệu năng

- **Tải dữ liệu:** không yêu cầu mạng mới; dùng chung `['trung-tam']` với `Layout` (một yêu cầu, ~2 KB thô, Brotli ~0,7 KB — F08 test). Nhờ đó ô dịch vụ và giờ làm việc cùng hiện với chân trang.
- **Cache:** máy chủ và trình duyệt theo F08 (output cache `danh-muc`, ETag, 304). Cập nhật trên máy mở lâu: chỉ đồng hồ (§4.4); dữ liệu theo F08/F09.
- **Ngân sách JS (≤ 200 KB gzip lúc tải đầu; hiện 143,6 KiB, F08 `result/test.md`):** F02 nằm trong chunk route `/` (đã tính vào "JS tải đầu" khi mở `/`). Ước tính 6–9 KB gzip: bốn component nhỏ, `gioLamViec.ts`, 9 icon (≈ 0,3–0,5 KB mỗi icon), câu chữ `vi.json`. **Hạn mức cho F02: ≤ 10 KB gzip** (chừa chỗ cho F03 và các tính năng sau). T05 báo kích thước tổng (cùng cách đo F00 T09: gzip -9 mọi `.js` tải khi mở `/` ở 375px) trước và sau; vượt hạn mức phải nêu lý do.
- **Lighthouse mobile ≥ 85, CLS < 0,1 (F00 BR-9, F02 AC-4):** bài học F08 L1 là chân trang dịch chuyển khi dữ liệu về. Với F02:
  - Ba khối phụ thuộc dữ liệu đều giữ chỗ bằng chiều cao thật: banner (`min-height`), lưới ô (`Skeleton dang="o"` cao bằng `Tile` thật ở 375/768/1280px, kể cả ô có tên hai dòng và dòng "Trang ngoài"), dải giờ (`min-height` của trường hợp thường gặp).
  - Mục tiêu CLS ≤ 0,05 (có chừa dư so với ngưỡng 0,1), đo với API trễ 5 giây như F08-TL-03 và với API thật, ở 375px và 1280px, cả khi `coQuanChuQuan` trống và khi tên Trung tâm dài.
  - Ô dịch vụ nằm trong màn hình đầu tiên ở 375px nên phần chiều cao ước lượng sai ở đây tính vào CLS; dải giờ nằm dưới màn hình đầu nhưng chân trang nằm dưới nó, nên đổi chiều cao dải giờ khi về dữ liệu cũng có thể đẩy chân trang vào vùng nhìn thấy trên màn hình cao — kiểm cả hai.
  - Không ảnh, không font, không bộ đếm vẽ lại cả trang: LCP là chữ của banner (câu mô tả cố định, hiện ngay khi chunk về, không chờ API).
- **Đồng hồ:** một `setInterval` 60 giây, một lần vẽ lại khối nhỏ mỗi phút; không ảnh hưởng TBT.

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Không thêm. Chỉ dùng trường công khai đã có ở `GET /api/trung-tam` (F08 §6). `moTa` không hiển thị |
| Link độc hại trong ô dịch vụ (`javascript:`, `data:`) | `Tile` lọc bằng `phanLoaiLienKet`: chỉ `http`/`https`; ngoài ra là ô thường, không `href`. F02 không tự tạo thẻ `<a>` |
| Mở tab mới | `Tile` đặt `target="_blank" rel="noopener noreferrer"` (C01 BR-3) |
| Chữ từ dữ liệu | Hiện bằng React (nút chữ), không `dangerouslySetInnerHTML` (ESLint chặn). Tên Trung tâm, tên ô, ghi chú là chuỗi thường |
| Ô dẫn tới hệ thống nội bộ (BR-6) | Là quy tắc về **nội dung dữ liệu** (`lien-ket.md` §1 mục "Đã bỏ"), kiểm bằng test trên dữ liệu thật (AC-6), không có mã chặn trong F02. Nếu muốn chặn ở lúc nhập thì là việc của F01 (ghi cho ba-analyst, §10) |
| Đồng hồ máy khách | Chỉ dùng cho trạng thái hiển thị; không gửi đi đâu, không quyết định quyền gì |
| Giới hạn tần suất, CSP | Không endpoint mới; không script/style inline, biến CSS động (nếu có) gán qua CSSOM (C01 §3.1) |

## 7. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `features/trang-chu/gioLamViec.test.ts` | frontend-dev | `thoiDiemVietNam`: `2026-10-12T03:00:00Z` → thứ 1, 600 phút; `2026-10-11T23:30:00Z` → thứ 1, 390 phút (VN sang ngày mới trước UTC); `2026-10-11T17:00:00Z` → thứ 1, 0 phút. `dangLamViec` với dữ liệu AC-2: 10:00 Hai → true; 12:00 Hai → false; 09:00 Bảy → false; 07:00 → true, 11:30 → false (cuối không gồm), 06:59 → false, 17:00 → false. Dữ liệu AC-7: 09:00 Bảy → true, 14:00 Bảy → false, 09:00 Chủ nhật → false. Dữ liệu không có dòng của thứ → false. Buổi hỏng ("25:00", đầu ≥ cuối, thiếu một đầu) → bỏ qua, không ném lỗi. Ngày 02/9/2026 (Quốc khánh, thứ Tư) 10:00 → true (BR-3). `gopNgay`: AC-9 (Hai–Sáu cùng giờ + Bảy sáng → 2 nhóm); AC-2 → 1 nhóm; ngày nghỉ chen giữa (thiếu Thứ Tư) → 2 nhóm; Thứ Hai và Chủ nhật cùng giờ vẫn tách; dữ liệu không sắp thứ tự vẫn gộp đúng; rỗng → mảng rỗng. Chạy ba lần với `TZ=Asia/Ho_Chi_Minh`, `TZ=America/Los_Angeles`, `TZ=Pacific/Auckland` cho kết quả như nhau |
| `features/trang-chu/useBayGio.test.ts` | frontend-dev | Giả đồng hồ (`vi.useFakeTimers`): sau 60 giây giá trị đổi; `visibilitychange` sang `visible` cập nhật ngay; gỡ khỏi cây thì không còn bộ đếm hay trình nghe |
| `features/trang-chu/KhuODichVu.test.tsx` | frontend-dev | Có link → `<a>` mở tab mới đúng `href`, `rel="noopener noreferrer"`; `url` null / `javascript:alert(1)` / rỗng → không `<a>`, không `tabindex`, không chữ "Trang ngoài"; đúng thứ tự dữ liệu; thêm một ô → thêm một phần tử không sửa mã; mỗi khoá `bieuTuong` ra một icon; khoá lạ không ném lỗi; Tab đi qua không dừng ở ô thường; lỗi → `ErrorState`, "Thử lại" gọi lại API |
| `features/trang-chu/KhoiGioLamViec.test.tsx` | frontend-dev | AC-9: đúng 2 dòng, không có "Chủ nhật"; AC-2: 1 dòng "Thứ Hai – Thứ Sáu"; mỗi trạng thái đúng chữ BR-2; ghi chú có/không; rỗng → không render; đồng hồ giả: qua 11:30 → đổi từ "Đang trong giờ làm việc" sang "Ngoài giờ làm việc" mà không tải lại |
| `features/trang-chu/TrangChu.test.tsx` | frontend-dev | Đúng một `h1`; `coQuanChuQuan` null → không có dòng đó; lỗi API → `h1` dự phòng, `ErrorState` đúng một lần, khối giờ ẩn; đang tải → có khung giữ chỗ cho ô và giờ |
| `core/components/Skeleton/Skeleton.test.tsx` | ui-core-dev | `dang="o"`: mặc định 6 khối, `aria-hidden`, có "Đang tải…" |
| `e2e/trang-chu.spec.ts` | tester | AC-1…AC-9 trên trình duyệt thật: dùng `page.clock` (Playwright) đặt giờ và `timezoneId: 'America/New_York'` / `'Pacific/Auckland'` để kiểm giờ Việt Nam không phụ thuộc múi giờ máy; giả `GET /api/trung-tam` với dữ liệu thử của AC-2, AC-5, AC-7, AC-9 (như F08 T10); bấm ô → sự kiện `popup` đúng URL, không `window.opener`; Tab qua hàng ô; CLS ở 375 và 1280 (API thật và trễ 5 giây); axe-core ở khổ 375, 1280 và kiosk 1080×1920 |
| Lighthouse (tester) | tester | Mobile `/`, 3 lần, bản `dotnet publish -c Release`: ≥ 85, CLS < 0,1; tổng JS gzip ≤ 200 KB (F02 AC-4) — đo lại sau khi ghép F03 |

Dữ liệu thật cho AC-3, AC-6 (nhập lại file ô dịch vụ) cần công cụ nhập F01 và nguồn PostgreSql, như F08 T10.

## 8. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 ô dịch vụ, giờ từ dữ liệu, không viết cứng | §3, §4.5 (không có giá trị nào trong mã) | T03, T04 |
| BR-2 trạng thái theo giờ Việt Nam | §4.3, §4.4, §4.5 `KhoiGioLamViec` | T02, T04 |
| BR-3 ngày lễ chỉ là ghi chú | §4.3 (không xét ngày lễ), §4.5 | T02, T04 |
| BR-4 ô và link ngoài theo C01 BR-12/BR-3; ô không link là ô thường | §4.5 `KhuODichVu`, §6 | T03 |
| BR-5 ảnh banner không làm chậm lần hiển thị đầu | §4.5 `BannerTrangChu` (chưa có ảnh; khi có: task mới), §5 | T05 |
| BR-6 ô chỉ dẫn tới dịch vụ cho người dân | §6 (quy tắc nội dung dữ liệu) | T08 (kiểm dữ liệu AC-6) |
| BR-7 giờ khác nhau từng thứ, trạng thái theo đúng ngày | §4.3 | T02, T04 |
| BR-8 gộp ngày liền nhau cùng giờ; ngày nghỉ không có dòng | §4.3 `gopNgay`, §4.5 | T02, T04 |
| Mục tiêu: khối thủ tục thường gặp; lối vào F04, F05, F06 | §4.5 (ghép F03); lối vào F04, F05 là thanh điều hướng F08, F06 là nút nổi ở `Layout` — không làm thêm ở trang chủ | T09 |
| Ngoài: khối liên hệ riêng | Không làm (địa chỉ, điện thoại, email ở chân trang F08) | — |
| AC-1 bấm "Tra cứu hồ sơ" → tab mới đúng link | §4.5 | T03 → T08 |
| AC-2 10:00/12:00 Hai, 09:00 Bảy | §4.3 | T02, T04 → T08 |
| AC-3 nhập lại file có ô mới → thêm ô | §4.5 (bảng icon theo khoá, khoá lạ an toàn) | T03 → T08 (PostgreSql) |
| AC-4 hiệu năng trang chủ | §5 | T01, T05 → T08, T10 |
| AC-5 ghi chú ngày nghỉ; 02/9/2026 vẫn "Đang trong giờ" | §4.3, §4.5 | T02, T04 → T08 |
| AC-6 đủ 6 ô theo thứ tự, link đúng, không trỏ tên miền "Đã bỏ" | §4.5, §6 | T03 → T08 |
| AC-7 thêm Thứ Bảy sáng | §4.3 | T02 → T08 |
| AC-8 hai ô không link: vị trí, không chữ phụ, không bấm, Tab bỏ qua, đọc như chữ thường | §4.5 (do `Tile`) | T03 → T08 (axe + NVDA thử tay) |
| AC-9 đúng 2 dòng / 1 dòng, không dòng Chủ nhật | §4.3, §4.5 | T02, T04 → T08 |
| Chạy đúng khi máy khách đặt múi giờ khác | §4.3, §7 | T02 → T08 |
| Cập nhật khi trang mở lâu (kiosk) | §4.4 | T02, T04 → T08 |

## 9. Rủi ro

1. **Dữ liệu thật của khối thường gặp chờ F04** (hook `useDanhMucThuTuc()`, hợp đồng F04 chưa có): T09 ghép được ngay khi F03 T07 xong, nhưng kiểm trên dữ liệu thật chỉ khi F04 có API. Hợp đồng ghép với F03 đã chốt (§4.5).
2. **Đồng hồ máy khách sai** (kiosk bị lệch giờ, hết pin RTC): trạng thái hiển thị sai dù múi giờ đúng. F02 không dùng giờ máy chủ (thêm phức tạp, mất đồng bộ khi trang mở lâu). Đề nghị ghi vào hướng dẫn vận hành kiosk (F09 BR-6): bật đồng bộ giờ.
3. **CLS**: chiều cao banner, ô dịch vụ có tên hai dòng và dải giờ có số dòng thay đổi (1–7). Giữ chỗ theo trường hợp thường gặp, đo ở cả dữ liệu dài. Giờ làm việc của Cần Giuộc chỉ một dòng, nên chênh lệch hiện chỉ xuất hiện khi Trung tâm nhập nhiều dòng.
4. **Ngân sách JS**: F02 ≤ 10 KB, nhưng F03 cộng thêm trên cùng chunk `/`; khi ghép (T09) phải đo lại tổng; F03 tự ước tính phần của nó (F03 plan §5).
5. **Danh sách khoá biểu tượng có ở 3 nơi** (F08 §3.1). Giảm thiểu bằng `Record<…>` và khoá lạ rơi về `lien-ket`.
6. **Giờ làm việc đang là giờ tạm** (câu hỏi mở 13): đổi bằng nhập lại file, không phải sửa mã. Trước khi chạy thật Trung tâm phải xác nhận.
7. **Trùng tên Trung tâm** ở đầu trang (F08) và `h1` banner: đúng prototype đã duyệt, nhưng người dùng trình đọc màn hình nghe tên hai lần. Giữ theo prototype; đổi `h1` thành "Tra cứu thủ tục hành chính" (khoá `banner.tieu-de-du-phong`) nếu muốn bỏ lặp — sửa một khoá.
8. **Ranh giới 11:30, 17:00**: spec chưa nói (câu B2). Chọn theo prototype; đổi dấu `<` thành `<=` ở một chỗ nếu Trung tâm muốn khác.

## 10. Cần hỏi

### A. Cần trả lời trước khi làm task liên quan (không còn mục nào chặn)

| # | Câu hỏi | Chặn |
|---|---|---|
| A1 | **Hợp đồng ghép khối thủ tục thường gặp (F03)** — **đã chốt theo plan F03 (2026-10-13)**: `KhoiThuongGap` không props, import `../thu-tuc/KhoiThuongGap`, tự bọc `h2`, tự xử lý tải/lỗi/rỗng (không có thủ tục thường gặp → ẩn cả khối), tự nạp namespace `thu-tuc` qua F03 T04 (`routes.tsx`); popup do F03 gắn trong `Layout` (F03 T06); dòng nhắc đăng xuất kiosk thuộc F09. Không còn câu hỏi mở | — |

### B. Đề xuất — làm theo nếu người dùng không phản đối

| # | Nội dung | Đề xuất | Lý do |
|---|---|---|---|
| B1 | Ảnh banner (spec: "nếu có"; BR-5) | Chưa làm cơ chế ảnh. Banner chữ trên nền gradient. Có ảnh trụ sở (DS-5) thì thêm task | Không có ảnh để dùng; design-system DS-5 ghi "banner không ảnh" trong lúc chờ. Tránh viết sẵn mã chưa có dữ liệu thật để thử |
| B2 | Ranh giới buổi: 11:30 và 17:00 | Đầu gồm, cuối không gồm: đúng 11:30 là "Ngoài giờ làm việc" | Theo prototype; spec AC chỉ thử 10:00, 12:00, 09:00 |
| B3 | Trạng thái tính ở FE | FE (§3) | Response có cache, trường "đang mở" do BE trả sẽ cũ |
| B4 | Giờ làm việc rỗng | Ẩn cả khối | Không có giờ nào để hiện, "Ngoài giờ làm việc" luôn đúng sẽ gây hiểu nhầm |
| B5 | Biểu tượng và màu ô dịch vụ | Theo khoá `bieuTuong`, bảng ở §4.5; `moTa` không hiển thị | Ổn định khi đổi thứ tự; `Tile` không có chỗ cho mô tả |
| B6 | Lỗi dữ liệu Trung tâm trên trang chủ | Một `ErrorState` ở khối ô dịch vụ; banner dùng `h1` dự phòng; khối giờ ẩn | Tránh ba thông báo lỗi liên tiếp trên một trang |
| B7 | Gradient banner | Hai điểm, dùng token (`--color-primary-strong` → `--color-primary`) | Tương phản chữ trắng; không thêm token mới |
| B8 | Tên khối giờ | "Thời gian làm việc" (như prototype) | Spec chỉ ghi "khối giờ làm việc" |

### Ghi cho ba-analyst (không chặn)

- Spec F02 BR-6 là quy tắc về nội dung dữ liệu ô dịch vụ, F02 không có mã chặn. Muốn chặn khi nhập (từ chối file có ô trỏ tên miền trong danh sách "Đã bỏ") thì là bổ sung cho F01.
- `o_dich_vu.mo_ta` (F01 §3.4) và `moTa` của API không có nơi hiển thị nào ở F02, F08. Bỏ cột hoặc nêu chỗ dùng.
- design-system §bố cục ghi thêm khối "mạng xã hội" giữa thường gặp và giờ làm việc; spec F02 và F08 BR-5 để mạng xã hội ở chân trang. Plan theo spec.
- Spec F02 chưa nói ranh giới đúng 11:30/17:00 (B2).
