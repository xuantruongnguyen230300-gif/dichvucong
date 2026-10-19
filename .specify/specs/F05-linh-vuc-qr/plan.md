---
id: F05
ten: Lĩnh vực và mã QR — kế hoạch kỹ thuật
spec: spec.md (da-duyet)
nguon: spec.md; CLAUDE.md; nghiep-vu/lien-ket.md §3; nghiep-vu/du-lieu.md (phân công); F00 plan §9 (nguồn dữ liệu, R1–R7), §3 (chunk, obfuscate); F04 plan §3.1 (hợp đồng `GET /api/linh-vuc`, `useLinhVuc`); C01 (Card, EmptyState, QueryState, Skeleton, SearchBox, SectionTitle); F08 plan (route `linh-vuc`, `DUONG_DAN`); prototype/index.html (veLinhVuc, ketQuaLinhVuc, qrMau — đã duyệt); mã nguồn `src/` ngày 2026-10-13
cap_nhat: 2026-10-13 (sửa theo spec đã cập nhật: BR-1 cấp theo thủ tục, BR-5, AC-7/8/9; người dùng chốt câu hỏi mở 41)
---

# F05 · Lĩnh vực và mã QR — kế hoạch kỹ thuật

F05 **dùng lại** `useLinhVuc()` (F04, `core/api/linhVuc.ts`, hợp đồng `GET /api/linh-vuc`) và không định nghĩa lại API đó. Trường mới F05 cần (quầy) **không có** trong hợp đồng F04 nên plan này thêm một endpoint nhỏ riêng, đúng như F04 §3.1 đã ghi ("Không trả quầy: F05 lấy riêng"); phương án thay thế ghi ở §10 câu 2, không sửa plan F04.

## 1. Tóm tắt

Trang `/linh-vuc`: tiêu đề + số lĩnh vực, ô tìm lĩnh vực, lưới ô lĩnh vực. Mỗi ô: tên (bấm cả ô mở danh mục đã lọc), "n cấp xã · m cấp tỉnh", dòng "Quầy X" (chỉ khi có phân công), mã QR. QR chỉ vẽ cho ô đang nằm (một phần) trong màn hình; thư viện QR và đoạn mã vẽ chỉ tải khi có ô cần vẽ.

| Phần | Chạm gì |
|---|---|
| DB | **Không đổi.** Đọc `phan_cong_linh_vuc` đã có (cột `linh_vuc_ma`, `quay`) qua `INguonDuLieu.PhanCongLinhVucs`. Không entity, cột, chỉ mục, migration |
| BE (backend-dev) | `Features/QuayLinhVuc/`: `GET /api/linh-vuc/quay` (cặp mã lĩnh vực → quầy, chỉ lĩnh vực có quầy). Cache `danh-muc` + ETag + giới hạn tần suất `danh-muc` (đã có ở F00; phiên bản dữ liệu đã tính cả lần nhập `phan-cong`) |
| FE `core/` + build (ui-core-dev) | Thêm gói `uqr` + nhóm chunk `qr` riêng trong `vite.config.ts` (không bị obfuscate, không vào `vendor`); thêm gói thử `jsqr` (devDependency); `test-utils/giaLapGiaoCat.ts` (IntersectionObserver giả); nối route, namespace i18n, xoá `TrangTam` |
| FE `features/linh-vuc/` (frontend-dev) | Màn hình, ô lĩnh vực, `QrLinhVuc` (nạp lười), hook vẽ-khi-hiện, hook quầy, hàm lọc, câu chữ `i18n/vi.json` |
| Trợ lý | Không đụng. F06 có đường riêng lấy quầy (F06 BR-3); `IQuayLinhVucService` dùng lại được nếu F06 muốn |

Không đổi `core/components` (dùng sẵn `Card`, `SectionTitle`, `SearchBox`, `EmptyState`, `QueryState`, `Skeleton`, `VisuallyHidden`). Gói mới: `uqr` (runtime), `jsqr` (chỉ test) — lý do và kích thước ở §5.

## 2. Dữ liệu

Không có thay đổi. Dùng các cột đã có:

| Bảng.cột | Dùng cho |
|---|---|
| `linh_vuc`: `ma`, `ten`, `ten_tim_kiem`; `thu_tuc`: `linh_vuc_ma`, `thuoc_danh_muc_xa`, `thuoc_danh_muc_tinh` | Qua `GET /api/linh-vuc` của F04 (tên, số thủ tục mỗi cấp, chuỗi tìm) |
| `phan_cong_linh_vuc`: `linh_vuc_ma` (khoá), `quay` (int, CHECK `> 0`, có thể null) | Qua endpoint mới §3.1 |

- `phan_cong_linh_vuc.linh_vuc_ma` do lệnh nhập `phan-cong` sinh bằng đúng `TiengViet.TaoMaDuongDan(tên lĩnh vực)` như `linh_vuc.ma` (`KiemTraPhanCong.cs`), nên khớp theo mã, không cần khoá ngoại (ERD).
- Dòng phân công có `quay` null (chỉ có nơi tiếp nhận chuyển) → coi như chưa có quầy, không trả. Mã phân công không có trong `linh_vuc` → trả như thường; FE tra theo mã của ô đang hiện nên bỏ qua.
- Chỉ mục: không cần (≤ 75 dòng). Migration: **không có**. db-dev không có task.
- Bản đầu chưa có phân công (dữ liệu thật, dữ liệu mẫu nhúng `phanCongLinhVuc: []`): endpoint trả `[]`, không ô nào có dòng quầy (BR-4, AC-6).

## 3. API — hợp đồng giữa BE và FE

### 3.1 `GET /api/linh-vuc/quay` (mới, F05 sở hữu)

```csharp
// src/BackEnd/DichVuCong.Api/Features/QuayLinhVuc/QuayLinhVucDtos.cs
public sealed record QuayLinhVucDto(
    string LinhVucMa,   // khoá của LinhVucDto.Ma (F04)
    int Quay);          // số nguyên dương
```

```ts
// src/FrontEnd/src/features/linh-vuc/api/quayLinhVuc.ts
export interface QuayLinhVuc {
  linhVucMa: string;
  quay: number;
}
export const API_QUAY_LINH_VUC = '/api/linh-vuc/quay';
export const KHOA_QUAY_LINH_VUC = ['quay-linh-vuc'] as const;
export function useQuayLinhVuc(): UseQueryResult<ReadonlyMap<string, number>>; // mã lĩnh vực → số quầy
```

- Chỉ trả lĩnh vực **đã có quầy** (`Quay != null`). Sắp theo `LinhVucMa` so `StringComparer.Ordinal` (kết quả giống nhau ở hai nguồn dữ liệu — R3). Rỗng → `200` với `[]`.
- Không nhận tham số (query lạ bị bỏ qua, không vào khoá cache — không gắn `[DanhMucQuery]`).
- Mã trả lời, ETag, 304, 405, 429, 500: giống hệt `GET /api/linh-vuc` (F04 §3.1, bảng "Mã trả lời"): policy `danh-muc`, `If-None-Match` khớp phiên bản → 304 trước khi endpoint chạy, `Cache-Control: no-cache`. Lần nhập `phan-cong` ghi một dòng `lan_nhap` nên phiên bản đổi, lần tải kế tiếp thấy quầy mới (F01 BR-9: nhập file phân công thì ô hiện quầy, không sửa code).
- Hook FE: `retry: false` (quầy chỉ là phần thêm; lỗi thì ẩn quầy ngay, không chờ thử lại — §4.3). Dựng `Map` trong `queryFn`.
- Dữ liệu ra trình duyệt: hai trường trên, đều công khai (số quầy in trên bảng chỉ dẫn của Trung tâm). Không `nhan_su`, không `noi_tiep_nhan_chuyen`.

Route `api/linh-vuc/quay` và `api/linh-vuc` là hai template khác nhau ở hai controller; kiểm bằng test cả hai route cùng chạy (T02).

### 3.2 Backend — `src/BackEnd/DichVuCong.Api/Features/QuayLinhVuc/` (backend-dev)

Tên thư mục `QuayLinhVuc` (không dùng `LinhVuc` để khỏi che entity `LinhVuc`, như F04 §3.2).

| File | Nội dung |
|---|---|
| `QuayLinhVucController.cs` | `[ApiController] [Route("api/linh-vuc/quay")]`, một action `[HttpGet] [HttpHead]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]` — giống `LinhVucController` |
| `QuayLinhVucService.cs` | `IQuayLinhVucService` + `QuayLinhVucService(INguonDuLieu)`: `LayAsync(ct)` |
| `QuayLinhVucDtos.cs` | Record ở §3.1 |
| `QuayLinhVucServiceCollectionExtensions.cs` | `AddQuayLinhVuc()` (scoped); `AddApiServices` (`Common/Hosting/ApiHostingExtensions.cs`) gọi; `Program.cs` không đổi |

Truy vấn (F00 §9.4): R1 `nguon.PhanCongLinhVucs.Where(p => p.Quay != null).Select(p => new { p.LinhVucMa, p.Quay }).DanhSachAsync(ct)` (không dùng hàm async của EF); R2 kiểu ẩn danh; R3 sắp theo `LinhVucMa` Ordinal **trong C#** sau khi lấy; dựng DTO với `Quay!.Value`. Không so sánh chuỗi theo văn hoá (R4). `QuyTacTruyVanTests` tự quét thư mục mới.

## 4. Frontend

### 4.1 Route và cấu trúc

- Route `DUONG_DAN.linhVuc` (`/linh-vuc`), `handle.trang = 'linh-vuc'` (đã có). `app/routes.tsx`: đổi `Component` từ `TrangTam` sang `LinhVuc`, nạp bằng `React.lazy` + `napNgonNguLinhVuc()` song song (đúng mẫu `DanhMuc`/`TrangChu`). Không nạp `thu-tuc` (trang này không có thủ tục). `TrangTam` không còn nơi dùng → xoá file và CSS của nó (T08, kiểm lại bằng tìm kiếm).
- Tiêu đề tab, mô tả: `DacTaTrang` của F08 (`common:trang.linh-vuc.*` đã có); F05 không làm.
- Thư mục `src/FrontEnd/src/features/linh-vuc/` (tên theo nghiệp vụ, không dấu):

| File | Nội dung |
|---|---|
| `LinhVuc.tsx` | Export `LinhVuc`. `<h1>` ẩn (`VisuallyHidden`, `common:trang.linh-vuc.ten`) + `QueryState` quanh `LinhVucNoiDung`. Khung chờ: `Skeleton dang="the"` (cùng chiều cao thẻ gần đúng) |
| `LinhVucNoiDung.tsx` | `useLinhVuc()`, `useQuayLinhVuc()`, trạng thái ô tìm; tiêu đề, ô tìm, lưới, trạng thái rỗng |
| `OLinhVuc.tsx` | Một ô: dùng `Card as="li"` |
| `QrLinhVuc.tsx` | **Chỉ chunk nạp lười.** Nhận `link`, `ten`; `import { encode } from 'uqr'` (tĩnh, trong chính file này); dựng `<svg>` |
| `useHienTrenManHinh.ts` | Hook: ref + cờ "đã từng hiện" (§4.4) |
| `linkQr.ts` | `taoLinkDanhMuc(cap, ma)`, `taoLinkQr(goc, ma)` (§4.5) |
| `loc.ts` | `locLinhVuc(ds, tuKhoa)` |
| `api/quayLinhVuc.ts` | Kiểu, hằng, `useQuayLinhVuc` (§3.1) |
| `*.module.css`, `i18n/vi.json`, `i18n/index.ts` | Bố cục (chỉ `var(--…)`), câu chữ, `napNgonNguLinhVuc` giống `features/danh-muc/i18n/index.ts` |

### 4.2 Trạng thái trên địa chỉ

Chỉ có `q` (từ khoá), như prototype và như F02/F04. Dùng `useDanhSachUrl()` của C01 không tham số: từ khoá ghi lên địa chỉ chậm 300 ms bằng `replace`; `url.tuKhoaLoc` (đã `useDeferredValue`) để lọc, `url.tuKhoa` cho ô nhập. Không phân trang (75 ô — AC-5 yêu cầu cuộn một trang liền). `lien-ket.md` §3 mới chỉ ghi `/linh-vuc`: nhờ ba-analyst thêm `?q=` (§10 câu 7).

### 4.3 Dữ liệu và lọc

- `useLinhVuc()` (F04) cho tên, số thủ tục, `tenTimKiem`; thứ tự mảng giữ nguyên của API (theo `tenTimKiem`, F04 §3.1). Chung khoá `['linh-vuc']` với danh mục: từ danh mục sang trang này không tải lại trong `staleTime`.
- `useQuayLinhVuc()` song song. Khung chờ hiện tới khi **cả hai** xong (hoặc quầy lỗi): nếu hiện lưới trước rồi dòng quầy chèn vào sau thì ô nhảy chiều cao (CLS). Lỗi chỉ lấy từ `useLinhVuc` (`QueryState`); quầy lỗi (kể cả 429/500) thì coi như không có quầy, **không** báo lỗi, không chữ thay thế (BR-4).
- `locLinhVuc(ds, tuKhoa)`: `taoBoLocTuKhoa(tuKhoa)` (C01, `core/utils/timKiem.ts`) áp lên `tenTimKiem` của từng lĩnh vực — không dấu, nhiều từ, thứ tự bất kỳ (BR-3, C01 BR-4). Giữ thứ tự đầu vào. AC-1: "dat dai" ra "Đất đai" (và mọi lĩnh vực chứa cả hai từ).
- Trạng thái rỗng (không khớp, hoặc dữ liệu chưa có lĩnh vực): `EmptyState` của C01 với `doiTuong` = "lĩnh vực" (`ket-qua.doi-tuong`), `tuKhoa`, `coBoLoc = false`, `nutXoaTrenThanhLoc = false`, `onXoaBoLoc` = xoá từ khoá (trang này không có thanh bộ lọc nên thông báo tự có nút "Xoá bộ lọc" — C01 BR-11). Sau khi xoá, đưa con trỏ về ô tìm (nút vừa biến mất).
- Số lĩnh vực đang hiện: `SectionTitle phu` = "{{so}} lĩnh vực" (số có chấm nghìn qua `dinhDangSo`); thông báo cho trình đọc màn hình do `SearchBox` (`soKetQua = ds.length`, vùng `role="status"` có sẵn). Không thêm vùng `aria-live` thứ hai (tránh đọc hai lần).

### 4.4 Màn hình và quy tắc vẽ QR

Thứ tự (theo prototype): `SectionTitle cap={2}` "Lĩnh vực và mã QR" + số lĩnh vực → khung ô tìm + dòng hướng dẫn ("In mã QR dán tại quầy…" — `huong-dan`) → lưới.

**Ô lĩnh vực** (`OLinhVuc`, `Card as="li"` trong `<ul role="list">` có `aria-label`):

1. Hàng đầu: icon thư mục (`Folder`, `aria-hidden`) + `<Link>` của React Router tới danh mục (§4.5) có chữ là tên lĩnh vực + dòng nhỏ "{{xa}} cấp xã · {{tinh}} cấp tỉnh".
2. Dòng quầy — **chỉ khi** `quay.get(l.ma)` có giá trị: "Quầy {{so}}" (`the.quay`). Không có thì **không render phần tử nào** (không `<p>` rỗng, không `min-height`, không chữ thay thế): ô co lại, không chỗ trống (AC-6). QR đẩy xuống đáy ô bằng `margin-top: auto`, nên các ô cùng hàng vẫn bằng nhau.
3. Khối QR (cuối ô; **mọi ô có QR**, kể cả lĩnh vực chỉ cấp tỉnh — AC-7): khung vuông cố định (9 rem = 144 px) nền `--color-surface`, lề trắng quanh mã; chú thích "Quét để xem thủ tục" ngay dưới mã (BR-1, AC-8).
4. Cả ô bấm được (AC-3 "bấm ô"): liên kết ở hàng đầu mở rộng bằng `::after { position: absolute; inset: 0 }` (ô `position: relative`) — vẫn một điểm dừng Tab, vùng bấm là cả ô kể cả QR. Viền focus vẽ quanh cả ô (`:focus-visible::after`, dùng `--color-focus`, ≥ 3:1), không tắt `outline` mà không thay.

**Lưới:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`, `gap: var(--space-3)` (như prototype: 1 cột ở 375 px, 2–3 cột ở máy tính bảng, 4–5 cột ở 1280 px, kiosk 1080 px 4 cột). Không cuộn ngang ở 320 px (tên dài ngắt dòng, `overflow-wrap: anywhere`).

**Vẽ QR chỉ cho ô đang hiện (BR-2, AC-5):**

- `useHienTrenManHinh<T extends Element>(): [ref, daHien]`. Một `IntersectionObserver` dùng chung cả trang (khởi tạo lười ở lần dùng đầu, `rootMargin: '0px'`, `threshold: 0`). Ô nào `isIntersecting` lần đầu thì đặt `daHien = true`, **bỏ quan sát ô đó** (`unobserve`) và không bao giờ trở lại `false`.
- **Quan sát chính ô lĩnh vực** (phần tử `<li>` của `Card`), không quan sát khung QR. Lý do: AC-5 đếm "ô có ít nhất một phần trong màn hình"; QR nằm đáy ô, ô lấp ló mà QR chưa lộ vẫn phải có QR. Prototype quan sát khung QR với `rootMargin: 200px` — **không dùng**, vì sẽ vẽ dư so với AC-5.
- `rootMargin` = 0, không đệm trước: số QR bằng đúng số ô có phần nằm trong khung nhìn. Tester đếm bằng hình học (`getBoundingClientRect`), tránh ca ô chạm đúng mép màn hình (giá trị biên của trình duyệt).
- `daHien` thì render `<Suspense fallback={<KhungQr/>}><QrLinhVuc link ten/></Suspense>`; `QrLinhVuc` là `lazy(() => import('./QrLinhVuc'))` khai ở module cấp trên. `KhungQr` là ô xám cùng kích thước 144 px (không chữ) để không nhảy chiều cao khi QR về.
- Chưa `daHien` → chỉ `KhungQr`; ô cuộn tới thì vẽ. Cuộn ra khỏi màn hình **không** gỡ QR (AC-5: tới cuối trang đủ 75, mỗi ô một QR). Ô bị lọc mất rồi hiện lại: component mới, vẽ lại khi lại hiện (mã hoá ≈ 1 ms).
- Môi trường không có `IntersectionObserver` (jsdom, trình duyệt rất cũ): `daHien = true` ngay (vẽ hết). Test dùng `giaLapGiaoCat.ts` để điều khiển.
- Dấu hiệu cho test/công cụ: mỗi QR đã vẽ là một phần tử `<svg data-qr="{mã lĩnh vực}">`. AC-5 đếm `svg[data-qr]`.

**`QrLinhVuc`:**

- `encode(link, { ecc: 'M', border: 0, boostEcc: true })` → `data: boolean[][]`. Mức sửa lỗi M (15 %) vì mã được in và dán, dễ trầy; `boostEcc` nâng mức khi còn chỗ mà không đổi phiên bản.
- `<svg viewBox="-4 -4 {n+8} {n+8}" role="img" aria-label={t('qr.nhan', {ten})} data-qr={ma} shape-rendering="crispEdges">`: một `<rect>` nền trắng (lề yên tĩnh 4 ô chuẩn) và **một `<path>`** duy nhất cho mọi ô đen, gộp theo dãy liền trong từng hàng (`M x y h n v1 h-n z`). Vector nên in ra giấy nét ở mọi cỡ. Màu: nền `var(--color-surface)`, mã `var(--color-text)` (#0f172a trên #fff, tương phản > 15:1); đặt bằng lớp CSS Module (`fill`), không thuộc tính `style` inline.
- `useMemo` theo `link`. Không `dangerouslySetInnerHTML`: `d` ghép từ số nguyên do chính mã sinh, không có chuỗi người dùng.

### 4.5 Liên kết

Một hàm duy nhất ghép phần đường dẫn (cả liên kết ô và QR dùng, để hai nơi không lệch):

```ts
// features/linh-vuc/linkQr.ts
export type CapLienKet = 'xa' | 'tinh';
/** `/thu-tuc?cap=xa&lv=ho-tich` — đường dẫn từ DUONG_DAN.danhMuc, mã qua encodeURIComponent. */
export function taoLinkDanhMuc(cap: CapLienKet, linhVucMa: string): string;
/** Cấp của lĩnh vực (BR-1): 'xa' nếu soThuTucXa > 0, ngược lại 'tinh'. Dùng chung cho liên kết ô và QR. */
export function capCuaLinhVuc(l: Pick<LinhVuc, 'soThuTucXa'>): CapLienKet;
/** Địa chỉ đầy đủ để in: `${goc}${taoLinkDanhMuc(capCuaLinhVuc(l), l.ma)}`. `goc` = window.location.origin (BR-1). */
export function taoLinkQr(goc: string, l: Pick<LinhVuc, 'ma' | 'soThuTucXa'>): string;
```

- **Cấp (BR-1, AC-3, AC-7; người dùng chốt 2026-10-13):** một hàm `capCuaLinhVuc` duy nhất: `soThuTucXa > 0` → `cap=xa`, ngược lại (chỉ có thủ tục cấp tỉnh — 18/75 trong dữ liệu mẫu) → `cap=tinh`. **QR và liên kết trong ô dùng cùng hàm này**, nên luôn mở cùng một cấp và quét ra không gặp danh sách rỗng. Vẫn đủ 75 QR. Mã lĩnh vực do BE sinh từ tên (`TiengViet.TaoMaDuongDan`), FE chỉ dùng nguyên văn (kebab, ASCII).
- **Liên kết trong ô (AC-3):** `<Link to>` tới `taoLinkDanhMuc(capCuaLinhVuc(l), l.ma)` (điều hướng trong ứng dụng, lịch sử thêm một mục để "Quay lại" về lưới).
- **Tên miền (BR-1, AC-2; đã chốt):** `window.location.origin` lúc vẽ QR — tên miền đang mở trang; không viết cứng, không lấy từ cấu hình. Mở bằng `localhost` thì QR chứa `localhost`. Hệ quả vận hành ở BR-5 (§9 rủi ro 1, 3).
- **Hệ quả của mã sinh từ tên (rủi ro 2):** đổi tên lĩnh vực → mã đổi → QR cũ rơi vào "Không tìm thấy lĩnh vực" của F04 (BR-7, F08 BR-10) kèm nút "Xem toàn bộ danh mục"; không lỗi kỹ thuật.

### 4.6 Câu chữ — `features/linh-vuc/i18n/vi.json` (namespace `linh-vuc`)

| Khoá | Câu |
|---|---|
| `muc.tieu-de` | Lĩnh vực và mã QR |
| `muc.dem` | {{so}} lĩnh vực |
| `huong-dan` | In mã QR dán tại quầy — người dân quét để xem ngay các thủ tục của lĩnh vực đó. |
| `tim.nhan` | Tìm lĩnh vực |
| `danh-sach.nhan` | Danh sách lĩnh vực |
| `ket-qua.doi-tuong` | lĩnh vực |
| `o.so-thu-tuc` | {{xa}} cấp xã · {{tinh}} cấp tỉnh |
| `o.quay` | Quầy {{so}} |
| `qr.nhan` | Mã QR của lĩnh vực {{ten}} |
| `qr.chu-thich` | Quét để xem thủ tục |

Chữ dùng chung có sẵn: `common:trang.linh-vuc.ten`, `common:rong.*`, `common:nut.xoa-bo-loc`, `common:trang-thai.dang-tai`, `common:loi*`. `app/i18n.d.ts` thêm namespace `linh-vuc`. Đã bỏ chữ "(QR mẫu)" của prototype. Tên lĩnh vực hiện nguyên văn từ dữ liệu.

## 5. Hiệu năng

- **Tải dữ liệu:** `GET /api/linh-vuc` (≈ 9 KB thô, 75 dòng; dùng chung cache với danh mục) và `GET /api/linh-vuc/quay` (≤ vài trăm byte; `[]` lúc đầu) song song. Hai yêu cầu có điều kiện (ETag/304) sau lần đầu. p95 ≤ 300 ms: phần lớn trả từ output cache hoặc 304; lỡ cache là một truy vấn nhỏ (≤ 75 dòng).
- **Lọc phía client:** ≤ 75 phép `includes` mỗi từ, không gọi API khi gõ. Lưới 75 ô ≈ 900 nút DOM; chỉ ô hiện mới có `<svg>`.
- **Vẽ QR:** mã hoá + dựng `d` ≈ 1 ms mỗi mã; mỗi `<path>` ≈ 2–4 KB chuỗi. Lúc đầu ở 375×667 chỉ ≈ 3 QR (AC-5), tối đa 75 sau khi cuộn hết (≈ 0,2 MB chuỗi trong bộ nhớ, chấp nhận được).

**Thư viện QR — lựa chọn và so sánh** (đo 2026-10-13: bó bằng rolldown của dự án, minify, `gzip -9`, chỉ phần `encode`, tree-shaken):

| Phương án | gzip | Ghi chú |
|---|---|---|
| **`uqr` 0.1.3** (MIT, không phụ thuộc, `sideEffects: false`, ESM) | **3,8 KB** (10,2 KB thô) | Chọn. Tách thành chunk riêng nên không bị obfuscate |
| `qrcode-generator` 2.0.4 (MIT) | 7,3 KB | Phương án dự phòng. Gấp đôi |
| `qr` (paulmillr) 0.7.2 (MIT hoặc Apache-2.0) | 6,4 KB | Có bản kiểm toán độc lập, nhưng lớn hơn |
| Tự viết bộ sinh QR (byte mode, mức M, phiên bản 1–10: bảng dung lượng, Reed–Solomon, 8 mặt nạ, thông tin định dạng/phiên bản, mẫu căn chỉnh) | ước ≈ 2,5 KB gzip **trước** obfuscate; ước **4–6 KB gzip sau obfuscate** (chuỗi base64 + làm rối luồng, thường nở 2–3 lần) | Không chọn, vì: (1) mã dự án bị obfuscate theo chunk (`build/obfuscate.ts`), nên phình ngang hoặc hơn `uqr`; (2) lỗi chỉ lộ khi in ra mà không quét được — rủi ro vận hành cao, tốn công tạo bộ kiểm; (3) tiết kiệm không đáng kể. Lỗ hổng bảo mật không phải lý do (mã hoá QR không dính mật mã) |

**Vì sao `uqr` phải ở chunk riêng:** plugin obfuscate chạy theo chunk — chunk nào chứa mã `src/` thì bị obfuscate **toàn bộ**, kể cả thư viện lẫn vào (làm phình và có thể hỏng). Thêm nhóm `{ name: 'qr', test: /node_modules[/\\]uqr[/\\]/ }` vào `codeSplitting.groups` của `vite.config.ts` (như nhóm `grid`), để chunk `qr` chỉ có `uqr`, không obfuscate. `vendor` giữ nguyên (không chứa `uqr`). Tải `QrLinhVuc` thì Vite thêm `modulepreload` cho `qr`, hai chunk về song song.

**Gói `jsqr` 1.4.0 (Apache-2.0), chỉ `devDependencies`:** giải mã ma trận QR trong test (vòng: link → `encode` → ảnh điểm → `jsQR` → đúng link) và trong E2E (quét ảnh chụp trang). 0 KB vào bản build. Nếu không muốn thêm thì tester quét tay bằng điện thoại (§10 câu 5). Trước khi phát hành vẫn chạy `npm audit --omit=dev` (CLAUDE.md); `jsqr` không nằm trong phần `--omit=dev`.

**Ngân sách JS (≤ 200 KB gzip lúc mở trang) — ước, từ bản build hiện có trong `wwwroot` (cùng cách đo F00 AC-9):**

| Phần (gzip) | KB |
|---|---|
| Nền: `index` 26,5 + `vendor` 122,8 + runtime 0,4 | 149,7 |
| Chunk dùng chung kéo theo (`useDanhSachUrl` 11,8 — SearchBox, EmptyState, Card…; `IconButton` 3,1) | 14,9 |
| Chunk route F05 (`LinhVuc`, `OLinhVuc`, hook, `loc`) sau obfuscate + câu chữ | ≈ 4–5 |
| `QrLinhVuc` sau obfuscate (≈ 40 dòng) | ≈ 1,5–2 |
| `qr` (`uqr`, không obfuscate) | 3,8 |
| **Tổng, trang `/linh-vuc` sau khi QR đầu tiên vẽ xong** | **≈ 175–178** |

Không có `grid` (TanStack Table) vì trang không có bảng; nên **nhẹ hơn `/`** (≈ 188 KB). Dư ≈ 20 KB so với ngưỡng. T08 đo số thật (từng tệp trong `wwwroot/assets`) ở 375 và 1280 px và ghi vào báo cáo; **vượt 200 KB thì dừng và báo người dùng** trước khi cắt tính năng.

- **Nạp lười (F00 AC-20):** mở `/` không tải `qr` hay `QrLinhVuc`; vào `/linh-vuc` thì tải khi ô đầu tiên hiện. Chunk `QrLinhVuc` chỉ được tham chiếu qua `import()` động (không `import` tĩnh ở đâu khác). E2E kiểm danh sách yêu cầu mạng.
- **CLS:** `KhungQr` và `<svg>` cùng kích thước 144 px; khung chờ giữ chiều cao gần đúng; dòng quầy có/không đã biết trước khi lưới hiện (§4.3).
- CSS Module theo chunk; không CSS-in-JS; không tệp font; không ảnh.

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Chỉ trường hợp đồng F04 (`LinhVucDto`) và `QuayLinhVucDto` (mã, số quầy). Không nhân sự, không nơi tiếp nhận chuyển. Từ khoá lọc phía client, không gửi lên máy chủ, không nhật ký |
| Đầu vào | API không nhận tham số. `q` trên địa chỉ chỉ dùng phía client, ô nhập tối đa 100 ký tự, chỉ so khớp chuỗi |
| Chèn nội dung | Tên lĩnh vực, từ khoá hiển thị bằng nút chữ của React. `<svg>` dựng bằng phần tử React (`<rect>`, `<path d>`), `d` toàn số. Không `dangerouslySetInnerHTML`. Từ khoá trong `EmptyState` là chữ thường (C01) |
| Nội dung QR | Chỉ `origin` của chính trang + đường dẫn cố định + mã kebab đã `encodeURIComponent`. Không dữ liệu cá nhân. Không gọi dịch vụ ngoài tạo QR; thư viện tự host cùng tên miền (CSP `script-src 'self'`) |
| Tên miền trong QR | Khi triển khai `AllowedHosts` khai đích danh (`TenMienCongKhai`, middleware lọc `Host`) nên `window.location.origin` luôn là một trong các tên miền đã khai (BR-1, BR-5) |
| Chuỗi cung ứng | `uqr` không phụ thuộc gói nào; version khoá trong `package-lock.json`; `npm audit --omit=dev` trước khi phát hành |
| CSP | Không script/style inline; màu QR bằng lớp CSS Module (không thuộc tính `style` hay `<style>` nội tuyến) |
| Giới hạn tần suất | Policy `danh-muc` 300/phút/IP; trang mở tốn 2 yêu cầu |
| Lỗi | `ErrorState` hiện câu theo mã (`loi.*`), mã tra cứu chỉ khi `loi-he-thong`; lỗi quầy không hiện ra người dùng |

## 7. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 QR chứa địa chỉ đầy đủ tới danh mục đã lọc; cấp xã nếu có thủ tục xã, cấp tỉnh nếu chỉ có thủ tục tỉnh; đủ 75 QR; tên miền đang mở; chú thích dưới QR | §4.5 (`capCuaLinhVuc`, `taoLinkQr`), §4.4 (`QrLinhVuc`, chú thích) | T05, T06, T07 |
| BR-2 chỉ tạo QR cho ô đang hiện | §4.4 (`useHienTrenManHinh`, nạp lười), §5 | T04, T05, T07, T12 |
| BR-3 tìm trên tên lĩnh vực; rỗng theo C01 BR-11 | §4.3 (`locLinhVuc`, `EmptyState`) | T05, T07 |
| BR-4 quầy từ phân công, ẩn khi chưa có | §2, §3.1, §3.2, §4.3, §4.4 (ô) | T01, T02, T05, T07, T11 |
| AC-1 "dat dai" → Đất đai | §4.3 | T05, T07 |
| AC-2 quét QR "Hộ tịch" → địa chỉ có tên miền đang mở, `cap=xa`, `lv=ho-tich`, mở ra danh mục cấp xã có thủ tục; mở bằng `localhost` thì QR chứa `localhost` | §4.5 (`window.location.origin`), §4.4 | T05, T06, T12 (giải mã ảnh chụp + quét máy thật) |
| AC-3 bấm ô "Chứng thực" → danh mục cấp xã đã lọc; bấm ô lĩnh vực chỉ cấp tỉnh → danh mục cấp tỉnh có thủ tục | §4.4 (liên kết cả ô), §4.5 (`capCuaLinhVuc`) | T05, T07, T12 |
| AC-4 ngân sách hiệu năng; phần QR chỉ tải khi cần | §5 | T03, T08 (đo kích thước), T12 (Lighthouse, mạng) |
| AC-5 75 lĩnh vực: QR = số ô hiện; cuộn tăng đúng; cuối trang đủ 75 (kể cả 18 ô chỉ cấp tỉnh), không ô nào hai QR | §4.4 (quan sát chính ô, `rootMargin` 0, giữ QR đã vẽ, `svg[data-qr]`) | T04, T05, T07, T12 |
| AC-7 QR lĩnh vực chỉ cấp tỉnh chứa `cap=tinh` và `lv`, quét ra danh mục cấp tỉnh có thủ tục; lĩnh vực có thủ tục xã chứa `cap=xa`; đủ 75 QR | §4.5 (`capCuaLinhVuc`) | T05, T06, T07, T12 |
| AC-8 dòng "Quét để xem thủ tục" ngay dưới mỗi QR | §4.4, §4.6 (`qr.chu-thich`) | T07, T12 |
| AC-9 quầy không tải được: lưới và QR đủ, không dòng quầy, không thông báo lỗi, không chỗ trống; chỉ danh sách lĩnh vực lỗi mới báo lỗi | §3.1 (`retry: false`), §4.3 | T05, T07, T12 |
| BR-5 ghi chú vận hành khi in (tên miền chính thức, cuộn hết trang, quét thử) | Không phải chức năng của trang; không đổi BR-2 (§9 rủi ro 1, 3) | Không có task code; T10 ghi vào testcases, T12 quét thử cả hai loại lĩnh vực |
| AC-6 chưa có phân công: không dòng quầy, không chữ thay thế, không chỗ trống; nhập "Hộ tịch quầy 3" → "Quầy 3" không sửa code | §3.1, §4.3, §4.4 | T01, T02, T07, T11, T12 |
| Hai nguồn dữ liệu cho cùng kết quả (R1–R7) | §3.2 | T02, T11 |
| ETag/cache theo lần nhập (cả lần nhập phân công) | §3.1 | T02, T11 |
| WCAG AA | §4.4 (focus, tương phản, tên đọc, `role="img"`) | T07, T12 |
| i18n | §4.6 | T07, T09 |

## 8. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Api/DuLieuThu/QuayLinhVucThu.cs` | backend-dev | Bộ thử bằng C# (`TepDuLieuMau`): có quầy; `Quay` null (bị loại); mã không có trong `linh_vuc`; vài mã sắp lẫn lộn để kiểm thứ tự Ordinal; không dòng nào |
| `Tests/Api/QuayLinhVucServiceContract.cs` + `QuayLinhVucServiceTrenMau.cs` | backend-dev | Hợp đồng dịch vụ (F00 §9.10, R7): chỉ trả dòng có quầy; thứ tự `LinhVucMa` Ordinal; `Quay` đúng; nguồn rỗng → `[]`; ca trên `TepDuLieuMau.Nhung` (phân công rỗng) → `[]` |
| `Tests/Api/QuayLinhVucTests.cs` | backend-dev | Service giả + `IPhienBanDuLieu` giả: JSON camelCase `linhVucMa`, `quay`; 200 có `ETag`, `Cache-Control: no-cache`; `If-None-Match` → 304, service không chạy; đổi phiên bản → 200 mới; POST → 405 `phuong-thuc-khong-hop-le`; vượt giới hạn → 429; query lạ không tạo mục cache; lỗi → 500 `loi-he-thong` có `maTraCuu`; rỗng → `200 []`; **`/api/linh-vuc` vẫn trả danh sách lĩnh vực** (không đụng route) |
| `Tests/Integration/QuayLinhVuc/QuayLinhVucServiceTrenPostgreSql.cs` | tester | Lớp con PostgreSQL của hợp đồng; DTO hai nguồn tuần tự hoá giống từng byte; nhập bằng công cụ nhập file `phan-cong` có "Hộ tịch" quầy 3 → API trả `{linhVucMa:"ho-tich",quay:3}`; `ETag` đổi; nhập file không dòng → `[]` (AC-6) |
| `features/linh-vuc/linkQr.test.ts`, `loc.test.ts`, `useHienTrenManHinh.test.tsx`, `api/quayLinhVuc.test.tsx` | frontend-dev | Link đúng `lien-ket.md` §3, mã lạ được mã hoá; lọc AC-1, nhiều từ, giữ thứ tự; hook: quan sát đúng `rootMargin: '0px'`, bật khi hiện, không về `false`, bỏ quan sát sau khi hiện, dọn khi gỡ, thiếu `IntersectionObserver` → hiện ngay; hook quầy: dựng `Map`, `[]` → rỗng, lỗi không thử lại |
| `QrLinhVuc.test.tsx` | frontend-dev | Giải mã bằng `jsqr` (ma trận → ảnh điểm có lề → `jsQR`) khớp link với ba độ dài (≈ 55, ≈ 100, ≈ 140 byte — mã dài nhất 69 ký tự); `role="img"`, `aria-label`, `data-qr`; đúng một `<path>`; viewBox có lề 4 ô; không thuộc tính `style` |
| `LinhVuc.test.tsx` | frontend-dev | Trong `MemoryRouter` + `fetch` giả: AC-1, AC-3 (địa chỉ `?cap=xa&lv=chung-thuc`; lĩnh vực chỉ cấp tỉnh → `?cap=tinh&lv=…`), AC-5 (giả lập giao cắt: 75 ô, hiện 3 → 3 `svg[data-qr]`; hiện thêm 2 → 5; hiện hết → 75, không ô nào hai), AC-6 (không phân công: không "Quầy", không "Nộp tại Trung tâm"; có "ho-tich" quầy 3 → chỉ ô Hộ tịch có "Quầy 3"), quầy lỗi → lưới vẫn hiện không quầy và không báo lỗi, rỗng → `EmptyState` "lĩnh vực" có nút "Xoá bộ lọc" và con trỏ về ô tìm, lỗi API → `ErrorState` "Thử lại", AC-7 (QR lĩnh vực chỉ cấp tỉnh chứa `cap=tinh` và `lv`, lĩnh vực có thủ tục xã chứa `cap=xa`, cả 75 ô có QR), AC-8 (dòng "Quét để xem thủ tục" ngay dưới mỗi QR), AC-9 (chỉ yêu cầu quầy lỗi: lưới và QR đủ, không dòng quầy, không thông báo; chỉ yêu cầu lĩnh vực lỗi: "Chưa tải được dữ liệu."), AC-2 (QR chứa `window.location.origin`; đổi sang `localhost` thì chứa `localhost`) |
| `e2e/linh-vuc.spec.ts` | tester | Trình duyệt thật, 75 lĩnh vực: AC-1, AC-2 (chụp ảnh QR của "Hộ tịch", giải mã bằng `jsqr` → đúng địa chỉ → mở được), AC-3, AC-5 ở 375×667 (đợi mạng yên rồi đếm; cuộn từng màn), AC-6 (bằng `page.route` cho `/api/linh-vuc/quay`), F00 AC-20 (mở `/` không tải `qr`/`QrLinhVuc`), axe thường và kiosk, không cuộn ngang ở 320 px, phóng 200 % |
| Lighthouse, p95 | tester | `/linh-vuc` mobile ≥ 85 (3 lần, bản `dotnet publish -c Release`); JS tải lúc mở ≤ 200 KB ở 375 và 1280 px; p95 hai API ≤ 300 ms (F00 AC-10) |
| Thử tay | tester | Quét QR bằng iPhone (camera) và Android (camera, Zalo) từ màn hình **và từ bản in** cỡ 3 cm cho mã dài nhất; NVDA đọc ô lĩnh vực và thông báo số kết quả |

## 9. Rủi ro

1. **QR in ra gắn tên miền** (BR-1, BR-5; câu hỏi mở 10, chờ đơn vị CNTT): QR chứa `origin` của trang lúc vẽ. In từ máy khác tên miền (localhost, địa chỉ IP, bản thử, tên miền tạm) thì QR trỏ sai và phải in lại; đổi tên miền (kể cả khi xã thành phường — câu hỏi mở 35) thì in lại toàn bộ. Đây là ghi chú vận hành BR-5 (hướng dẫn vận hành, kế hoạch giai đoạn 8), không phải chức năng của trang. Giảm thiểu: `AllowedHosts` đích danh khi triển khai; tester quét thử QR từ bản triển khai.
2. **Mã sinh từ tên:** đổi tên lĩnh vực (tách, gộp, sửa chữ khác dấu cách) → mã đổi → QR đã in hết dùng, rơi vào "Không tìm thấy lĩnh vực" (không lỗi, có nút xem danh mục). Đổi chỉ dấu (Thuỷ/Thủy) hoặc khoảng trắng không đổi mã vì chuẩn hoá. Không có cách chặn ở phía code; cần quy trình: đổi tên lĩnh vực thì in lại QR.
3. **In khi chưa cuộn hết:** QR chỉ vẽ cho ô đã hiện (BR-2), nên in (Ctrl+P) khi chưa cuộn tới cuối thì ô chưa hiện còn trống. Đã thành ghi chú vận hành BR-5 (cuộn hết trang rồi mới in; quét thử vài QR sau khi in, cả lĩnh vực có thủ tục xã và lĩnh vực chỉ cấp tỉnh). BR-2 không đổi: không có `beforeprint`, không có task code.
4. **Lĩnh vực chỉ có cấp tỉnh (18/75 trong dữ liệu mẫu):** đã giải quyết bằng BR-1 mới (QR `cap=tinh`). Còn một rủi ro nhỏ: cấp tính từ `soThuTucXa` lúc vẽ; nếu nhập lại dữ liệu làm lĩnh vực đổi từ chỉ-tỉnh sang có-xã (hoặc ngược lại) thì QR đã in vẫn mở được nhưng có thể rơi vào "(0)" (F04 BR-7), không lỗi kỹ thuật.
5. **QR nhỏ, mã dài:** link ≈ 55–140 byte → phiên bản 4–8 (33–49 ô) cộng lề 4 ô; ở 144 px còn ≈ 2,5–3,5 px mỗi ô. Quét bản in thì ổn; quét từ màn hình điện thoại khác khó với mã dài. Đã tính để tên miền ngắn; tester thử mã dài nhất (§8).
6. **Hình học `IntersectionObserver`:** ô chạm đúng mép màn hình, thanh điều hướng dính che một phần: trình duyệt tính theo hình học, không theo phần bị che. Tester đếm bằng cùng hình học, không bằng mắt.
7. **Obfuscate lẫn thư viện:** nếu chunk `qr` không tách (cấu hình sai) thì `uqr` bị obfuscate theo chunk dự án — phình, có thể hỏng. T03 thêm test cho biểu thức nhóm; T08 kiểm `wwwroot/assets/qr-*.js` không obfuscate và không chứa mã `src/`.
8. **`uqr` mới ở 0.x:** một người bảo trì (unjs), chưa 1.0. Giảm thiểu: khoá version trong lockfile, bộ test giải mã (T06) bắt hồi quy khi nâng version; phương án thay thế `qrcode-generator` (7,3 KB) cùng giao diện `data` nên đổi trong 1 file.
9. **Hai yêu cầu mạng cho một màn hình** (lĩnh vực + quầy). Chấp nhận: hai yêu cầu nhỏ, song song, có ETag. Phương án gộp ở §10 câu 2.
10. **Ký tự vô hình** khi sửa tệp (C01 rủi ro 8): không gõ `\uXXXX` qua Edit; sau khi ghi, `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>`.
11. **Sửa chung tệp với F02, F03, F04:** `app/routes.tsx`, `app/i18n.d.ts`, `package.json`, `vite.config.ts` do ui-core-dev sửa ở nhiều plan; mỗi task đọc lại tệp ngay trước khi sửa.

## 10. Cần hỏi

Làm theo đề xuất nếu người dùng không phản đối. Người dùng chọn khác thì planner sửa plan trước khi làm lại phần liên quan.

| # | Câu hỏi | Đề xuất | Ảnh hưởng |
|---|---|---|---|
| 1 | **ĐÃ CHỐT 2026-10-13 (BR-1, AC-2, BR-5).** Tên miền trong QR (câu hỏi mở 10): dùng **`window.location.origin`** lúc vẽ, không cấu hình riêng. Rủi ro (QR gắn tên miền của máy in lúc in) xử lý bằng ghi chú vận hành BR-5. Phương án cấu hình `Hosting:TenMienQr` ở BE: không làm | Chốt: tên miền đang mở trang | §4.5, T05 |
| 2 | **Quầy lấy bằng cách nào** — hợp đồng F04 `LinhVucDto` không có quầy | Endpoint riêng `GET /api/linh-vuc/quay` (§3.1), không động tới hợp đồng và code F04 đã làm xong. **Phương án đơn giản hơn:** thêm `int? Quay` vào `LinhVucDto` của F04 — một yêu cầu, một cache, không phải chờ hai yêu cầu; đổi F04 plan §3.1, DTO C#, kiểu TS, test hợp đồng F04. Nếu chọn, bỏ T01–T02, T11 và `useQuayLinhVuc`; F05 chỉ đọc `l.quay` | T01, T02, T05, T11 |
| 3 | **ĐÃ CHỐT 2026-10-13 (BR-1, AC-3, AC-5, AC-7).** Lĩnh vực chỉ có thủ tục cấp tỉnh (18/75): QR và liên kết ô đều `cap=tinh`; lĩnh vực có thủ tục xã `cap=xa`; vẫn đủ 75 QR | Chốt: `capCuaLinhVuc` (§4.5) | §4.5, T05, T07 |
| 4 | **ĐÃ THÀNH BR-5 (2026-10-13).** In QR khi chưa cuộn hết trang: ghi chú vận hành (cuộn hết trang rồi mới in, in bằng tên miền chính thức, quét thử sau khi in). BR-2 không đổi; không làm `beforeprint` | Chốt: ghi chú vận hành, không có task code | Không có task code |
| 5 | **Gói mới:** `uqr` (runtime, 3,8 KB gzip) và `jsqr` (chỉ test, 0 KB vào bản build) | Dùng cả hai như §5. Không muốn `jsqr` thì bỏ phần giải mã tự động ở T06/T12, tester quét tay bằng điện thoại thật | T03, T06, T12 |
| 6 | **ĐÃ CHỐT 2026-10-13 (BR-1, AC-8).** Chú thích dưới QR: "Quét để xem thủ tục" | Chốt | §4.6, T07 |
| 7 | **Tài liệu nghiệp vụ cần ba-analyst cập nhật** (planner không sửa `nghiep-vu/`): `lien-ket.md` §3 thêm `/linh-vuc?q={từ khoá}`; §4 thêm `GET /api/linh-vuc/quay` (cùng nhắc F04 chưa ghi `GET /api/thu-tuc`, `GET /api/linh-vuc`) | Cập nhật | Không có task |
| 8 | **Quầy lỗi tải (429/500/mạng):** ẩn quầy, hiện lưới như chưa có phân công, không báo lỗi | Quyết định đã áp dụng (§4.3): quầy chỉ là phần thêm; lỗi chính vẫn từ `GET /api/linh-vuc` | §4.3, T05, T07 |
