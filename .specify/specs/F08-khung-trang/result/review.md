ĐẠT

# F08 · Khung trang chung — review phần giao diện (FE)

- Phạm vi lượt này: **chỉ phần FE** của T03–T07: `core/api/trungTam.ts`, `core/duongDan.ts`, `core/hooks/useTieuDeTab.ts`, `core/utils/dinhDang.ts`, `app/layout/*` (`Layout`, `AppHeader`, `DieuHuongChinh`, `AppFooter`, `DacTaTrang`, `LoiTrang`, `LienHeTuTrungTam`, `logo/`), `app/routes.tsx`, `app/router.tsx`, `app/KhongTimThay.tsx`, `app/TrangTam.tsx`, `build/dac-ta-trang.ts`, `index.html`, `vite.config.ts`, `core/i18n/vi/common.json`. Đối chiếu `spec.md`, `plan.md`, `tasks.md`, `CLAUDE.md`.
- **Chưa duyệt (lượt sau; đã duyệt ở mục "review phần backend" cuối file):** BE T01 (`GET /api/trung-tam`), T02 (chèn dữ liệu đặc tả vào HTML), T11 (nguồn Mẫu) và F00 T29 đang được backend-dev sửa. Vì vậy "ĐẠT" ở dòng đầu chỉ có nghĩa cho phần FE; F08 chưa thể chuyển `xong` khi phần BE chưa duyệt. Đã đối chiếu nhanh hợp đồng: các trường của `ThongTinTrungTamDto` (`ThongTinTrungTamDtos.cs`) khớp từng tên và kiểu với `ThongTinTrungTam` ở `trungTam.ts`.
- Kết luận: **0 Chặn · 0 Nên sửa · 6 Góp ý** → **ĐẠT** (phần FE).
- Cách kiểm: đọc mã và test; chạy lệnh; chạy tay bản dev bằng Chromium (Playwright) với `/api/trung-tam` được giả lập, ở 375, 599, 600, 1280 px: dữ liệu chứa HTML/script, link `javascript:`/`data:`, thiếu địa bàn, thiếu cơ quan chủ quản, API lỗi 500 (có `title`, `detail` giả "stack"), chunk trang bị chặn, mạng chậm 3 giây, địa chỉ có `%` sai. Dùng axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).

## Kết quả lệnh

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | Sạch |
| `npm test` | 43 file, 355/355 đạt |
| `npm run build` | Ra `wwwroot`, 0 lỗi `tsc` |
| `.map`, `sourceMappingURL` trong `wwwroot` | Không có |
| `index.html` đã build | Hai thẻ `<script>` đều có `src` (module chính và `trinh-duyet-cu`), không `<style>`, không thuộc tính `style=`/`on…`; còn đủ `<!--dac-ta-->…<!--/dac-ta-->`; có `lang="vi"`, `<title>`, `description` mặc định, `<link rel="icon" href="data:,">` |
| `wwwroot/dac-ta-trang.json` | Có 3 trang + `khongTimThay` + `mauTieuDe`, đúng chữ `common.json` |
| `console.`, `debugger` trong `wwwroot/assets` | 0 (kể cả `vendor`, nên log của React Router không ra ở production) |
| Mã dự án đã obfuscate | `index`, `TrangChu` có tên `_0x…`; `vendor` để nguyên |
| JS tải ban đầu (gzip, số của Vite) | `vendor` 123,78 + `index` 22,95 + `TrangChu` 1,17 + `rolldown-runtime` 0,36 + `vi` 0,09 + `trinh-duyet-cu` 0,42 = **148,8 KB** (≤ 200 KB). Trước F08 là ~126,6 KB — xem Góp ý 5 |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `e2e/smoke.spec.ts` (`dien-thoai`, `kiosk`), không có BE | "đường dẫn lạ → trang không tìm thấy": đạt cả hai. "mở trang chủ": đỏ cả hai vì proxy trả 502 (xem Góp ý 4) |

## Đã kiểm, không có lỗi

**Bảo mật**

- **XSS:** `grep` không có `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacent`, `eval`, `document.write` trong mã dự án (ESLint cũng chặn). Thử tay với tên Trung tâm `Trung tâm <b>thử</b> "A" & <img src=x onerror=alert(1)>`, người chịu trách nhiệm có `<script>alert(1)</script>`, cơ quan `UBND <i>x</i>`: ở đầu trang, chân trang, `<h2>`, `© …`, `document.title` đều hiện **chữ thuần**; không có `<img>` lạ, không hộp thoại nào bật. Các thẻ `meta` đặt bằng thuộc tính `content` (DOM tự mã hoá) — kiểm lại thấy `&lt;b&gt;…`. Chuỗi tiêu đề ghép qua i18next có `escapeValue: false` nhưng chỉ đi vào chữ React, `document.title`, `content` của thẻ; thử `t('…', { ten: '$t(b) {{x}}' })` → giữ nguyên chữ, không lồng khoá, không nội suy lại.
- **Link từ dữ liệu:** `banDo: "javascript:alert(1)"` và liên kết `data:text/html,<script>…` hiện như chữ thường (`<span>`), không có thẻ `<a>`. Link http(s) có `target="_blank" rel="noopener noreferrer"` và chữ "(mở trang mới)". `tel:` dựng lại chỉ còn chữ số (`tel:02723893900`); `mailto:` dựng lại từ phần đường dẫn (bỏ `?cc=…`), không mở tab mới (`AppFooter.tsx:65-68`, `lienKet.ts`).
- **`LoiTrang` không lộ lỗi:** giả lập API trả 500 kèm `title: "secret stack"`, `detail: "System.Exception at X"` → chân trang chỉ còn lời miễn trừ, đầu trang chỉ còn biểu tượng (tên đọc "Trang chủ"), không chữ nào của `title`/`detail`. Chặn tải chunk `TrangChu` → `LoiTrang` hiện trong `<main>`: "Chưa tải được dữ liệu. Có lỗi xảy ra. Vui lòng thử lại.", nút "Thử lại" và số Trung tâm; đầu trang, điều hướng, chân trang vẫn còn; HTML không chứa "Failed to fetch dynamically imported module" hay stack. `LoiTrang` chỉ truyền `loi` cho `ErrorState`, `ErrorState` chỉ dùng `khoaLoi()` (khoá i18n) và `maTraCuu` của lỗi `loi-he-thong` (`ErrorState.tsx:21-30`). Test có ở `Layout.test.tsx:100-125`.
- **Logo:** nạp bằng `import.meta.glob('./logo/*.{svg,png,webp}', { eager: true, query: '?url' })` (`logo.ts`); file 0,6 KB nên Vite nhúng `data:image/svg+xml` — hợp `img-src 'self' data:`, `<img>` không chạy được script; `width`/`height` 40, `alt=""`. File `logo.svg` có ghi chú giấy phép ISC, không có Quốc huy.
- **Plugin `dac-ta-trang` / `chuTuI18n`:** `taoDacTaTrang` chỉ ghép từ `common.json` và `DUONG_DAN_THEO_TRANG`; `JSON.stringify` nên thoát đúng; file chỉ chứa chữ công khai. `escapeHtml` ở `vite.config.ts:57-58` thoát `&`, `<`, `"` — đủ cho nội dung thẻ và thuộc tính dùng `"`; nguồn là `common.json` trong repo, không phải dữ liệu người dùng.
- **Không script/style inline:** `index.html` đã build sạch (bảng trên); không thấy thẻ `<script>` nào do `ScrollRestoration` thêm vào DOM (ở bản dev chỉ có các script của Vite). `style=` trong `app/` chỉ ở `app/xem-truoc/` (dev, không vào bản build).
- **Tài nguyên ngoài:** `link rel="schema.DC" href="https://purl.org/dc/…"` (do `DacTaTrang.tsx:25-31` tạo, đúng plan §3.3) không phải tài nguyên được tải; không CDN, font, ảnh ngoài.
- **Kiến trúc:** `app → core`, `core` không import `app`/`features`; `core/duongDan.ts` là nguồn đường dẫn duy nhất cho router, điều hướng, 404 và plugin build. Icon import đích danh. `Program.cs` không thuộc phạm vi này.
- **Thư viện:** không thêm gói mới trong F08 (plan §1).

**Đúng spec** (chạy tay, trừ khi ghi khác)

- **Điều hướng, nhãn ngắn, tên đọc (BR-2, AC-3):** 375 px: 3 mục rộng 109 px, một hàng, `nav` không cuộn ngang (`scrollWidth` bằng `clientWidth`), trang không cuộn ngang; nhãn hiện "Trang chủ / Danh mục / Lĩnh vực". 599 px vẫn nhãn ngắn, 600 px và 1280 px nhãn đầy đủ. Cây tiếp cận (`ariaSnapshot`) ở mọi khổ: "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR". Ở dưới 600 px nhãn đầy đủ thành chữ ẩn, nhãn ngắn `aria-hidden` (`DieuHuongChinh.tsx:38-41`, CSS `:50-72`); WCAG 2.5.3 đạt.
- **`aria-current` (BR-1, AC-1):** `/thu-tuc`, `/linh-vuc`, `/THU-TUC/` đánh dấu đúng một mục; `/abc-xyz` không mục nào; gạch dưới 3 px không chỉ dựa vào màu. Thanh dính đầu (`position: sticky`).
- **Mục trống thì ẩn (BR-5, AC-6, AC-19):** dữ liệu tối thiểu (xã null, tỉnh `""`, cơ quan `"  "`, không bản đồ, không liên kết, không mạng xã hội, không ngày) → đầu trang chỉ có tên; chân trang không có dòng cơ quan, bản đồ, khối liên kết, khối mạng xã hội (kể cả tiêu đề), không dòng ngày; không có thẻ `DC.date`; `DC.publisher` bằng tên. Chức vụ có/không → có/không dấu "–" (test `AppFooter.test.tsx:50`).
- **Đầu trang nguyên văn (BR-5, AC-14):** "phường thử B – tỉnh thử C", không có chữ "xã", "tỉnh" nào ghép thêm; thiếu một bên chỉ hiện bên còn lại (test `AppHeader.test.tsx:29-47`).
- **Chân trang (BR-3, 4, 6, 7):** đủ tên đơn vị, người chịu trách nhiệm (kèm chức vụ), địa chỉ, điện thoại bấm gọi, email; ngày "08/10/2026"; lời miễn trừ đúng nguyên văn BR-7 (`common.json:62`); "© <Tên>". Không có dòng nhắc đăng xuất. Chừa chỗ nút nổi: `--fab-clearance` (`tokens.css:95`, kiosk `:107`) dùng ở `AppFooter.module.css:5`.
- **404 (BR-10, AC-9):** `/abc-xyz` hiện "Không tìm thấy trang", hai liên kết `<a>` "Về trang chủ" (`/`) và "Danh mục thủ tục" (`/thu-tuc`), có đủ đầu trang, điều hướng, chân trang, tiêu đề tab "Không tìm thấy trang – <Tên>", không nhắc lại địa chỉ. Địa chỉ có `%` sai (`/Abc%`, `/%E0%A4%A`, `/thu-tuc/%zz`, đưa vào bằng `pushState`) cũng ra trang 404 đầy đủ; chỉ có cảnh báo của React Router ở console bản dev. (Địa chỉ gõ thẳng ở bản dev trả 404 của Vite — không đại diện; việc BE trả `index.html` cho địa chỉ lạ là của T02.)
- **Tiêu đề tab và dữ liệu đặc tả (BR-9, BR-13, AC-17):** bốn trang có bốn tiêu đề "<Tên trang> – <Tên>"; khi đang chờ API giữ tiêu đề máy chủ (không nháy), khi API lỗi dùng tên trang. Đủ tập thẻ plan §3.3 (`DC.title/description/creator/publisher/date/identifier/language`, `og:title/description/url/type`, `link schema.DC`); đổi trang không tạo thẻ trùng (`dcCount` = 1); `DC.identifier`/`og:url` không có query. `useTieuDeTab`/`useTieuDeTabTam`: tạm đè trang, gỡ thì trả lại, dữ liệu về trễ không ghi đè (test `useTieuDeTab.test.ts`, `DacTaTrang.test.tsx:138-160`).
- **Liên kết bỏ qua (BR-12, AC-4):** Tab đầu tiên vào "Bỏ qua, tới nội dung chính" (hiện ở góc trên, có viền focus); Enter → `activeElement` là `<main id="noi-dung">`, địa chỉ không đổi.
- **Nạp lười, khung hiện trước (AC-13, BR-11):** mạng chậm 3 giây: ở 800 ms đầu trang cao 61 px, `<h1>` của trang đã có, chân trang hiện "Đang tải…" + lời miễn trừ; chiều cao đầu trang không đổi khi dữ liệu về (không nhảy bố cục). `React.lazy` + `Suspense` nằm trong `<main>` (`Layout.tsx:33-37`, `routes.tsx:15-21`).
- **ErrorBoundary:** có ở route gốc và từng route con (`routes.tsx:45, 54`); lỗi trang chỉ thay vùng nội dung (thử ở trên).
- **Biểu tượng (BR-14, AC-21):** `logo/` có đúng 1 file, có test (`AppHeader.test.tsx:70`).
- **a11y:** axe 0 vi phạm ở 375 `/`, 375 `/abc-xyz`, 1280 `/linh-vuc`, 1280 `/THU-TUC/`. Không tràn ngang ở 375, 599, 600, 1280.
- **Câu chữ i18n:** không chuỗi hiển thị viết cứng trong `app/` (ESLint `i18next/no-literal-string` sạch); nhãn, mô tả, lời miễn trừ, câu 404 đúng spec và B7.
- **Hợp đồng FE–BE:** route `/api/trung-tam` và các trường `ThongTinTrungTam` khớp `ThongTinTrungTamDtos.cs` (gồm `youTube`, `tikTok`, `ngayCapNhatThuTuc` dạng chuỗi); `useThongTinTrungTam` dùng chung một khoá `['trung-tam']` (có test hai nơi dùng một yêu cầu), không thử lại khi 404.
- **Tái sử dụng:** chân trang dùng `ExternalLink`, `Skeleton`, `VisuallyHidden`, `LienHeProvider` của C01; 404 dùng `Button to`; không chép lại logic C01.

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Góp ý | `src/FrontEnd/src/app/layout/AppFooter.module.css:55` (và `:20, 32, 47`); `AppHeader.module.css:26-27, 33, 52, 56-63`; `DieuHuongChinh.module.css:24`; `Layout.module.css:4` | CSS của `app/` còn màu và cỡ viết cứng: `rgb(255 255 255 / 25%)` (màu), `6px`, `2px`, `12px`, `18px`, `40px`, `200px`, `220px`. `plan.md` F08 §4.5 và design-system §1.5 nói chỉ dùng token. `css.test.ts` chỉ quét `core/components`, nên test không bắt. Giá trị đúng prototype, chưa sai. | Thêm token cho màu đường kẻ trên nền đậm (vd. `--color-on-primary-line`) và chốt chung với Góp ý px của C01: hoặc thêm token, hoặc ghi vào plan rằng cỡ cố định riêng của component được phép; nếu thêm token thì mở rộng `css.test.ts` quét cả `app/**/*.module.css`. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/hooks/useTieuDeTab.ts:46-51` | `datLaiTieuDeTabChoTest` — hàm chỉ để test — nằm trong mã production (cùng loại với `datLaiCachXemChoTest` ở C01). Hiện không vào bản build vì không ai gọi nên bị tree-shake, nhưng vẫn là mã test lẫn trong mã chạy thật. | Chuyển sang `src/test-utils/` (xuất hàm đặt lại từ module bằng một export riêng) hoặc để test tự gỡ hook (`unmount`) rồi kiểm lại. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/app/layout/Layout.tsx:26-44`; `src/FrontEnd/src/app/routes.tsx:45, 54` | `AppHeader`, `AppFooter` nằm trực tiếp trong `Layout`, mà `ErrorBoundary` chỉ có ở cấp route. Nếu đầu hoặc chân trang ném lỗi lúc vẽ (suy từ mã, chưa chạy: vd. API trả sai hợp đồng như thiếu `mangXaHoi`, `lienKet` là `null`, nên `tt.mangXaHoi.zaloOa` ném `TypeError`), `LoiTrang` của route gốc thay **cả Layout**: mất điều hướng, chỉ còn nút "Thử lại". Plan §4.2 nói "`Layout` không bao giờ bị thay bằng trạng thái lỗi". Với dữ liệu đúng hợp đồng thì không xảy ra, nên chỉ Góp ý. | Bọc `AppHeader` và `AppFooter` mỗi cái trong một error boundary nhỏ trả `null` (hoặc khối rỗng); hoặc kiểm hình dạng response trong `layThongTinTrungTam`. | ui-core-dev |
| Góp ý | `src/FrontEnd/e2e/smoke.spec.ts:13, 19` | Ca "mở trang chủ": (1) `toHaveTitle(/Tra cứu thủ tục hành chính/)` chỉ đúng ở khoảnh khắc trước khi API trả — sau đó tiêu đề là "Trang chủ – <Tên Trung tâm>" (có BE) hoặc "Trang chủ" (API lỗi), nên đạt hay không tuỳ thời điểm; (2) `expect(loi).toEqual([])` đỏ khi chưa chạy BE vì proxy trả 502. Đã chạy: 2 đỏ (`dien-thoai`, `kiosk`), ca 404 đạt. | Giả lập `/api/trung-tam` bằng `page.route` (hoặc chạy cùng BE ở chế độ demo) và đổi kỳ vọng tiêu đề thành "Trang chủ – …". Cùng chỗ nên thêm ca e2e của F08 (T09, `e2e/khung-trang.spec.ts`). | tester |
| Góp ý | build (không có file cụ thể) | `plan.md` F08 §5 ước tính khung thêm 6–10 KB gzip; thực tế JS tải đầu từ ~126,6 KB (đo ở review C01 lúc 14:37) lên 148,8 KB (+22 KB: `index` 5,5 → 22,95; `vendor` 119 → 123,8 vì thêm `NavLink`, `Outlet`, `ScrollRestoration`, icon, câu chữ `common`). Còn dư khoảng 51 KB cho F02–F06 và chatbot. T05 yêu cầu báo kích thước trước và sau; chưa thấy ghi ở `tasks.md` hay `plan.md`. | Ghi số đo vào `tasks.md` T05 hoặc `plan.md` §5; theo dõi lại khi F02, F04, F06 nối vào. Nếu thấy cần giảm: kiểm xem `common.json` đã đóng gói bao nhiêu chữ và các icon thực dùng. | planner (ghi số), ui-core-dev (nếu cần giảm) |
| Góp ý | `src/FrontEnd/src/app/layout/logo.ts:13` | Thư mục `logo/` có nhiều hơn 1 file (ví dụ người vận hành thêm `logo.png` mà không xoá `logo.svg`) thì `Object.values(...)[0]` lặng lẽ lấy file đầu theo thứ tự tên, build vẫn xanh; chỉ có `AppHeader.test.tsx:70` bắt, mà test không chạy trong `npm run build`. AC-21 đòi "thay file ảnh → hiện ảnh thử". | Ném lỗi lúc build khi `SO_TEP_LOGO !== 1` (vd. kiểm trong `vite.config.ts` hoặc plugin nhỏ), hoặc ghi cách thay logo ("xoá file cũ") vào tài liệu vận hành. | ui-core-dev |

## Ngoại lệ đã chấp nhận (ghi nhận, không tính lỗi)

- Script trình duyệt cũ ES5 (`build/trinh-duyet-cu.es5.js`) không obfuscate.
- `KhoaTrang` viết tay trong `core/duongDan.ts`, có test `duongDan.test.ts` giữ khớp `common:trang` (kiểm lại: đạt).
- Logo dưới 4 KB nhúng `data:` (kiểm lại: `img-src 'self' data:` hợp lệ).

## Chưa kiểm được (cần ở lượt sau hoặc tester)

- Bản build phục vụ qua BE với header CSP thật: chưa chạy. Quan sát: `ScrollRestoration` không thêm `<script>` vào DOM ở bản dev, nhưng nên mở bản `wwwroot` qua BE và xem Console có báo vi phạm CSP nào không (tester, T09/T10).
- Phần BE: `GET /api/trung-tam` (cache, ETag, 404, 429), `TrangHtml` (thẻ đặc tả trong HTML trả về, `HtmlEncoder`, `DC.identifier` theo `Host`, địa chỉ lạ trả 200 và `index.html`), nguồn Mẫu — để lượt sau theo yêu cầu.
- AC cần dữ liệu nhập thật (AC-5 đến AC-7, AC-15, AC-16, AC-18, AC-22) và popup F03 (AC-20, `useTieuDeTabTam` mới có test đơn vị).

---

# F08 · Khung trang chung — review phần backend (T08, lượt BE)

**Kết luận phần BE: ĐẠT** (0 Chặn · 2 Nên sửa · 3 Góp ý). Mục này bổ sung cho phần FE ở trên và thay mục "Chưa duyệt" của nó; dòng đầu file giữ `ĐẠT` vì cả hai phần đều không có lỗi Chặn. F08 vẫn chưa chuyển `xong`: còn kết quả tester (T10) và hai lỗi Nên sửa dưới đây.

- Phạm vi: F08 T01 (`GET /api/trung-tam`), T02 (chèn dữ liệu đặc tả vào HTML), T11 (`ThongTinTrungTamService` qua `INguonDuLieu`): `Features/ThongTinTrungTam/*` (controller, service, DTO, `TrangHtml`, đăng ký), `Common/Hosting/{TenMienCongKhai, SpaFallback, ITrangHtml, StaticAssets}`, `wwwroot/dac-ta-trang.json`, `appsettings*.json`, test kèm. Đối chiếu `spec.md`, `plan.md` (§3.1, §3.2, §3.3, §6, B10–B12), `tasks.md`, `CLAUDE.md`. Mốc xem xét: 2026-10-12 khoảng 17:00–17:30; mã BE sau các lần sửa theo review T22.
- Không mở trình duyệt, Playwright hay Lighthouse. Không chạy API thật; kiểm bằng đọc mã, test, và `dotnet publish` ra thư mục tạm.

## Kết quả lệnh (BE)

| Lệnh | Kết quả |
|---|---|
| `dotnet build src/BackEnd/DichVuCong.sln` | 0 cảnh báo, 0 lỗi |
| `dotnet test --solution src/BackEnd/DichVuCong.sln` | 581 test: 533 đạt, 0 lỗi, 48 bỏ qua (test cần PostgreSQL, thiếu `ConnectionStrings__DichVuCongTest`; nhánh EF của `TruyVan` và test tương đương dữ liệu không chạy trong lượt này) |
| `dotnet list … package --vulnerable --include-transitive` | Không gói nào có lỗ hổng, cả 5 project |
| `dotnet publish -c Release` Api (ra thư mục tạm) | Không `.pdb`, không `.xml`, không `ClosedXML`/`DichVuCong.Import`/`DichVuCong.DuLieuMau`; không `.map` trong `wwwroot`; không `launchSettings.json` |

## Đã kiểm, không có lỗi

**Bảo mật**

- **Mã hoá HTML (XSS), `TrangHtml.cs`:** mọi giá trị chèn đều qua `Ma()` (dòng 125) → `HtmlEncoder.Create(UnicodeRanges.All)` (dòng 36), vẫn mã hoá `< > & " '` và ký tự điều khiển, chỉ để nguyên chữ có dấu. Tên thẻ và tên thuộc tính là hằng; chỉ `content` và nội dung `<title>` nhận giá trị. Query không vào HTML. `DC.identifier`, `og:url` chỉ dựng cho đường dẫn có trong `dac-ta-trang.json` (đường dẫn lạ không bị phản chiếu). Mẫu `{{trang}}`/`{{trungTam}}` thay tuần tự rồi mới mã hoá nên không thoát được. Khác `plan.md` §3.2 ("`HtmlEncoder.Default`") ở chỗ chọn bộ mã hoá; lý do có trong comment, an toàn tương đương.
- **Host injection:** `TenMienCongKhai.HostTinCay` chỉ true khi `AllowedHosts` có ít nhất một tên và không có mục `*`; khi đó middleware host filtering của framework đã loại Host lạ (400) nên Host tới được `TrangHtml` là giá trị tin được. Chưa khai hoặc `*` thì bỏ `og:url`, `DC.identifier` (`TrangHtmlHostTests` phủ cả 3 trường hợp, cả đường dẫn và Host chứa ký tự đặc biệt). `appsettings.json` không còn `AllowedHosts: "*"`.
- **Rate limit:** `/api/trung-tam` có `[EnableRateLimiting(DanhMuc)]` 300/phút/IP, chỉ GET/HEAD (POST → 405). Trang HTML không giới hạn tần suất theo `plan.md` §6 và B12 (đã chấp nhận): DB chỉ bị chạm tối đa mỗi 30 giây vì `LayDuLieuAsync` giữ kết quả trong bộ nhớ; `index.html` và `dac-ta-trang.json` được nhớ theo thời gian sửa và kích thước.
- **Lỗi và log:** lỗi DB khi dựng trang chỉ ghi tên loại lỗi (`LogLoiDacTa`), không ghi message; trang vẫn 200 với khối mặc định, lỗi chỉ nhớ 5 giây. Production không lộ stack trace (đã kiểm ở F00).
- **SQL:** không có câu SQL tự viết trong phần này; toàn LINQ qua `INguonDuLieu`.
- **Phụ thuộc và Program.cs:** `Program.cs` chỉ ghép extension. Service không nhận `AppDbContext`, không `using Microsoft.EntityFrameworkCore` (T11); test kiến trúc xanh.
- **Response không thừa trường:** `ThongTinTrungTamDto` đúng §3.1; không có `MaDonViCongDvc`, `Id`, `ThuTu`, `TenFile`, thời điểm có giờ.

**Nghiệp vụ và hợp đồng**

- BR-5/BR-6: ngày cập nhật = `lan_nhap` loại `thu-tuc` đổi sang UTC+7 (`NgayVietNam`), `DC.date` bỏ khi chưa nhập. `lan_nhap` có khoá chính là `loai` nên `DauTienAsync` không cần `OrderBy` ở `LayNgayCapNhatAsync`.
- BR-9/BR-13: tiêu đề "<Tên trang> – <Tên trung tâm>", `description`, `DC.title/description/creator/publisher/date/identifier/language`, `og:*` đúng bảng §3.3; `DC.publisher` rơi về tên Trung tâm khi cơ quan chủ quản trống. Trang không có trong file trả `khongTimThay` với mã HTTP 200 (B11).
- Hợp đồng FE–BE: route, tên và kiểu trường khớp `core/api/trungTam.ts` (đối chiếu lại lượt này).
- Cache: `/api/trung-tam` dùng policy `danh-muc`; khoá cache chứa phiên bản = `max(lan_nhap.thoi_diem)`. Nhập xong (một transaction, cập nhật dòng `lan_nhap` của loại vừa nhập) thì yêu cầu kế tiếp đã đổi khoá và `ETag`. Dữ liệu đặc tả trong HTML cũ tối đa 30 giây theo B12 (đã chấp nhận).
- Hiệu năng: `AsNoTracking` + `Select` ra kiểu ẩn danh/DTO, 5 truy vấn theo khoá chính (tuần tự, cùng DbContext), không N+1; ở nguồn Mẫu là LINQ trên bộ nhớ. Không cần thêm chỉ mục (bảng một dòng hoặc vài dòng).
- Tái sử dụng: dùng `StaticAssets`, `CachePolicies`, `RateLimitPolicies`, `HostingOptions.ReadyTimeout`, `CachingOptions.DacTaTrang`; không chép lại logic của `Common/`.

## Lỗi (phần BE)

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs:66-69` · `src/BackEnd/DichVuCong.Api/Common/Hosting/TenMienCongKhai.cs:5-9` | `CLAUDE.md`: header bảo mật "bắt buộc trên mọi response". Khi `AllowedHosts` đã khai, Host lạ bị `HostFilteringMiddleware` của framework trả 400 **trước** `SecurityHeadersMiddleware` (host filtering được thêm bằng `IStartupFilter`, đứng ngoài pipeline của `UseApiPipeline`). Response đó không có CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, không phải ProblemDetails, không có `maTraCuu`. Suy từ mã của framework, chưa chạy; test hiện tại chỉ kiểm mã 400 và không phản chiếu Host. Rủi ro thực tế thấp (thân là chuỗi cố định), nhưng đây chính là đường mà việc khai `AllowedHosts` dựa vào. | Đặt kiểm tra Host sau `SecurityHeadersMiddleware` để 400 đi qua cùng pipeline: bỏ `HostFilteringStartupFilter` mặc định rồi `app.UseHostFiltering()` sau middleware header (hoặc viết middleware nhỏ dùng `AllowedHosts` và trả ProblemDetails 400). Thêm test: Host lạ → 400 và có đủ 4 header. | backend-dev |
| Nên sửa | `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/TrangHtml.cs:179-197, 95-98, 125-129` | Comment đầu lớp (dòng 16) và `plan.md` §3.2 hứa "mọi lỗi (… hỏng JSON) rơi về nguyên `index.html`", nhưng `PhanTichDacTa` chỉ bắt `JsonException`. Các trường hợp sau ném lỗi khác và làm **mọi** route HTML trả 500: (1) `"trang": null` → `new Dictionary(null, …)` ném `ArgumentNullException` (dòng 189); (2) hai khoá chỉ khác hoa thường (`"/Thu-Tuc"`, `"/thu-tuc"`) → `ArgumentException` do trùng khoá; (3) `"moTa": null` → `Encoder.Encode(null)` ném `ArgumentNullException` ở `Ma()` (dòng 125). Lỗi nằm trước `cache.Set` nên không được nhớ, mỗi yêu cầu đọc và parse lại rồi lại ném. File do build FE phát ra nên xác suất thấp, nhưng một file hỏng làm cả trang không mở được, trái nguyên tắc "trang không bao giờ hỏng" của plan. | Coi các trường hợp trên là file hỏng: trong `PhanTichDacTa` kiểm `file.Trang is null`, từng `TrangDacTa`, `Ten`, `MoTa` khác null, bắt thêm `ArgumentException`; hoặc bao cả lần ghép khối ở `TaoAsync` bằng `try/catch` rơi về `html` + log Warning (không ghi nội dung). Nhớ kết quả "hỏng" theo `BanTep` để không parse lại mỗi yêu cầu. Thêm 3 test cho 3 ca trên. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/TrangHtml.cs:63-72, 79-83` | `DC.identifier`/`og:url` dùng `duongDan` đã `TrimEnd('/')` nhưng giữ nguyên hoa thường của yêu cầu: `/THU-TUC/` cho `og:url="https://host/THU-TUC"` (test `DuongDanHoaThuongVaDauGachCuoi_KhopDanhMuc` chỉ kiểm tiêu đề). Công cụ thu thập thấy nhiều "địa chỉ chuẩn" cho cùng một trang. `//` cũng bị coi là trang chủ. | Dựng địa chỉ từ khoá chuẩn trong `dac-ta-trang.json` (khoá khớp), không từ đường dẫn yêu cầu. Thêm một assert vào test trên. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/TrangHtml.cs:131-157` | Khi cache dữ liệu đặc tả hết hạn, mọi yêu cầu trang đồng thời đều gọi `LayDacTaAsync` (không có khoá một-luồng), mỗi cái chờ tới `ReadyTimeout`; DB sập thì cứ 5 giây lại có một đợt dồn như vậy trên đường không giới hạn tần suất. Mỗi đợt tối đa bằng số yêu cầu đang chờ nên chưa gây hại. | Dùng `SemaphoreSlim` hoặc khoá theo khoá cache để chỉ một yêu cầu làm mới, các yêu cầu khác dùng bản cũ. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Common/Hosting/TenMienCongKhai.cs:11` | Production quên khai `AllowedHosts` thì trang lặng lẽ bỏ `DC.identifier` và `og:url` (BR-13 coi là yếu tố bắt buộc) mà không có dấu hiệu nào lúc khởi động. `CLAUDE.md` có ghi, nhưng không có chỗ nào cảnh báo khi chạy. | Ghi một dòng log Warning lúc khởi động khi môi trường không phải Development và `HostTinCay` là false (như `GhiLogNguonDuLieu` đã làm cho nguồn dữ liệu). | backend-dev |

## Ghi nhận (không tính lỗi)

- `ThongTinTrungTamController` thêm `[HttpHead]` ngoài `[HttpGet]` mà `tasks.md` T01 ghi "chỉ `[HttpGet]`"; comment ở dòng 13 nêu lý do và có test, chấp nhận.
- `<link rel="schema.DC" href="https://purl.org/…">` trong khối đặc tả là siêu dữ liệu, trình duyệt không tải; CSP không bị ảnh hưởng (đã ghi ở T22).
- Bản publish của Api có `appsettings.Development.json` (chỉ nạp ở Development, chỉ có `AllowedHosts`).
- Việc chạy lại với PostgreSQL thật (AC-6, AC-7 "nhập lại thì đổi") thuộc tester (T10, `Tests/Integration/ThongTinTrungTam/`); lượt này không chạy.
