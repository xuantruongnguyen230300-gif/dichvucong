# F08 · Khung trang chung — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`.

Điều kiện bắt đầu:

- Làm ngay: T01 (backend-dev); T03, T04 trừ phần `dac-ta-trang.json` (ui-core-dev); T09 (tester).
- T02 và phần `dac-ta-trang.json` của T04 chờ câu A1 (`plan.md` §10). A1 = (a) thì bỏ T02 và phần đó.
- T05, T06 chờ các task C01 làm `tokens.css`, `Button` (có dạng liên kết nội bộ), `ExternalLink`, `Skeleton`, `ErrorState`, bộ icon, lớp ẩn chữ (`plan.md` §4.10).
- T07 sau T03, T04, T05.
- Đã có: F01 T03 (bảng), F00 T18 (cache `danh-muc` theo lần nhập), F00 T21 (script trình duyệt cũ gọi `GET /api/trung-tam`, đọc `dienThoai`).
- T10 cần dữ liệu nhập bằng F01 T05 (`thu-tuc`) và T07 (`trung-tam`); một số AC chờ F03, F04, F06 (ghi trong T10).
- Các đề xuất nhóm B (`plan.md` §10): **đã chấp nhận 2026-10-12** (người dùng không phản đối B1–B12).
- T11 (thêm 2026-10-12, nguồn dữ liệu Mẫu — F00 plan §9): sau F00 T26; phải xong trước F00 T29.
- db-dev, chatbot-dev, frontend-dev: không có task trong F08.

- [x] T01 [backend-dev] API `GET /api/trung-tam` (§3.1):
  - `Features/ThongTinTrungTam/`: `ThongTinTrungTamController` (`[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, chỉ `[HttpGet]`), `IThongTinTrungTamService` + `ThongTinTrungTamService` (`LayAsync`, `LayDacTaAsync`; `AsNoTracking` + `Select` ra DTO; 5 truy vấn theo khoá chính §2), các record DTO đúng §3.1, `AddThongTinTrungTam()`.
  - `AddApiServices` gọi `AddThongTinTrungTam()`; `Program.cs` không đổi.
  - Ngày cập nhật = `lan_nhap.thoi_diem` loại `LanNhap.ThuTuc` đổi sang UTC+7; giờ dạng `HH:mm`; hàm thuần `NgayVietNam`, `DinhDangGio`.
  - Chưa có dòng `trung_tam` → 404 `khong-tim-thay`.
  - Giữ đúng đường dẫn `/api/trung-tam` và trường gốc `dienThoai` (F00 T21 đang dùng).
  - file: `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/`, `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs`, `src/BackEnd/DichVuCong.Tests/Api/ThongTinTrungTamTests.cs`
  - xong khi:
    - `dotnet build` sạch, `dotnet test` xanh.
    - Test (service giả, `IPhienBanDuLieu` giả): JSON camelCase đúng tên trường §3.1, `dienThoai` ở gốc, trường null vẫn có; service trả null → 404 có `code` = `khong-tim-thay` và `maTraCuu`; POST → 405; 200 có `ETag` và `Cache-Control: no-cache`; gửi lại `If-None-Match` → 304; vượt giới hạn danh mục → 429.
    - Test hàm thuần: `2026-10-07T17:00:00Z` → `2026-10-08`; `2026-10-07T16:59:59Z` → `2026-10-07`; `07:00` → `"07:00"`.
    - Chạy tay với DB dev đã nhập `trung-tam`: response không có trường nào ngoài §3.1; sửa `lan_nhap.thoi_diem` → yêu cầu kế tiếp có dữ liệu mới.

- [x] T02 [backend-dev] Dữ liệu đặc tả trong HTML khi trả trang (§3.2, §3.3) — **chờ câu A1 = (b)**:
  - `Common/Hosting/ITrangHtml.cs`; `SpaFallback` dùng service này nếu đã đăng ký, không thì trả file như cũ.
  - `Features/ThongTinTrungTam/TrangHtml.cs`: đọc `index.html` và `dac-ta-trang.json` từ web root mỗi lần; chọn trang theo đường dẫn (bỏ `/` cuối, không phân biệt hoa thường, query không ảnh hưởng, không khớp → `khongTimThay`); thay khối `<!--dac-ta-->…<!--/dac-ta-->` bằng đúng tập thẻ §3.3; mọi giá trị qua `HtmlEncoder.Default`; `DC.identifier`, `og:url` = `scheme://host/đường-dẫn`, không có query.
  - `LayDacTaAsync` giữ trong `IMemoryCache` theo `Caching:DacTaTrang` (mặc định 30 giây, thêm vào `CachingOptions` có kiểm khoảng giá trị và vào `appsettings.json`); thời gian chờ DB = `Hosting:ReadyTimeout`; lỗi hoặc quá giờ → log Warning, giữ khối mặc định, trả 200.
  - Không gắn giới hạn tần suất cho trang HTML (`plan.md` §6).
  - file: `src/BackEnd/DichVuCong.Api/Common/Hosting/{ITrangHtml.cs, SpaFallback.cs}`, `src/BackEnd/DichVuCong.Api/Common/Caching/CachingOptions.cs`, `src/BackEnd/DichVuCong.Api/appsettings.json`, `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/`, `src/BackEnd/DichVuCong.Tests/Api/TrangHtmlTests.cs`
  - xong khi:
    - Test với `index.html` có dấu đánh dấu, `dac-ta-trang.json` mẫu và service giả: `/thu-tuc` → `<title>Danh mục thủ tục – Trung tâm thử A</title>`, đủ thẻ §3.3; `/?ma=1.001193` cho HTML giống hệt `/`; `/THU-TUC/` khớp danh mục; `/abc-xyz` → tên trang 404; cơ quan chủ quản trống → `DC.publisher` = tên trung tâm; ngày null → không có `DC.date`; tên chứa `<script>` → đã mã hoá; query không xuất hiện trong HTML.
    - Service ném lỗi → 200, khối mặc định giữ nguyên. Thiếu dấu đánh dấu hoặc thiếu JSON → trả nguyên file; test `SpaFallback` hiện có vẫn xanh.
    - Hai yêu cầu liên tiếp trong 30 giây → service chỉ được gọi một lần.

- [x] T03 [ui-core-dev] [P] Phần `core/` dùng chung (§3.1, §4.1, §4.5, §4.7, câu B1):
  - `core/api/trungTam.ts`: kiểu `ThongTinTrungTam`, `BieuTuongODichVu` đúng §3.1; `layThongTinTrungTam(signal)` qua `http`; hook `useThongTinTrungTam()` (TanStack Query, khoá `['trung-tam']`).
  - `core/duongDan.ts`: `DUONG_DAN` (§4.1).
  - `core/hooks/useTieuDeTab.ts`: `useTieuDeTab`, `useTieuDeTabTam` (§4.7).
  - `core/utils/dinhDang.ts`: `dinhDangNgay('yyyy-MM-dd')` → `dd/mm/yyyy`.
  - Nếu C01 chưa có hàm tạo link điện thoại: `core/utils/lienHe.ts` (giữ chữ số và `+` đầu).
  - file: `src/FrontEnd/src/core/{api/trungTam.ts, duongDan.ts, hooks/useTieuDeTab.ts, utils/dinhDang.ts}` và test cạnh từng file
  - xong khi:
    - `npm test`, `npm run lint`, `tsc` sạch.
    - Test: tiêu đề tạm đè tiêu đề trang, gỡ thì trả lại; đổi tiêu đề trang khi đang có tiêu đề tạm không làm mất tiêu đề tạm; `null` không đổi `document.title`. `dinhDangNgay('2026-10-08')` = `08/10/2026`. Hook gọi đúng `/api/trung-tam`.

- [x] T04 [ui-core-dev] Câu chữ, `index.html`, plugin build (§3.2, §4.7, §4.9, câu B3, B7):
  - `common.json`: các khoá §4.9 với đúng câu của spec (lời miễn trừ BR-7, "Bỏ qua, tới nội dung chính", "Dữ liệu thủ tục cập nhật ngày {{ngay}}", các câu BR-10) và câu B7. Đổi `trang.khong-tim-thay.tieu-de` thành `ten`, sửa chỗ dùng.
  - Bỏ dòng `document.title = …` trong `core/i18n/index.ts`.
  - `index.html`: khối `<!--dac-ta-->…<!--/dac-ta-->` gồm `<title>%TIEU_DE%</title>` và `<meta name="description" content="%MO_TA%">`; `<link rel="icon" href="data:,">`. Plugin `chuTuI18n` chèn thêm `%MO_TA%`.
  - **Chỉ khi A1 = (b):** plugin build phát `dac-ta-trang.json` đúng cấu trúc §3.2, chữ từ `common.json`, đường dẫn từ `core/duongDan.ts`.
  - `build/trinh-duyet-cu.ts`: giữ nguyên hai hằng; sửa chú thích "F08 chưa có plan" thành tham chiếu F08 `plan.md` §3.1.
  - file: `src/FrontEnd/{index.html, vite.config.ts, build/trinh-duyet-cu.ts, build/dac-ta-trang.ts}`, `src/FrontEnd/src/core/i18n/{index.ts, vi/common.json}`, `src/FrontEnd/src/app/KhongTimThay.tsx`
  - xong khi:
    - `npm run build`: `wwwroot/index.html` còn đủ hai dấu đánh dấu, có tiêu đề và mô tả mặc định, không có script/style inline; (A1 = b) `wwwroot/dac-ta-trang.json` có 3 trang + `khongTimThay`, chữ đúng `common.json`.
    - Gõ sai một khoá mới → `tsc` báo lỗi. `npm test`, `npm run lint` sạch.

- [x] T05 [ui-core-dev] `Layout`, đầu trang, điều hướng, router, trang 404 (§4.1–§4.4, §4.6, §4.8, câu B2, B6, B8, B9) — chờ C01 (xem điều kiện ở đầu):
  - `app/layout/Layout.tsx` đúng khung §4.2: liên kết bỏ qua (focus `main`, không đổi địa chỉ), `AppHeader`, `<main id="noi-dung" tabIndex={-1}>` có `Suspense` (fallback `Skeleton` của C01), `AppFooter` (tạm để trống tới T06), chỗ cho nút Trợ lý (F06) và `NutBatDauLai` (F09), `ScrollRestoration` theo `pathname`.
  - `app/layout/AppHeader.tsx`: một liên kết về trang chủ gồm biểu tượng + tên + địa bàn (§4.3); trạng thái đang tải (giữ chiều cao) và lỗi (tên đọc "Trang chủ").
  - Biểu tượng: thư mục `app/layout/logo/` có đúng một file, mặc định `logo.svg` (Landmark trắng trên tròn `#074a90`, ghi chú giấy phép ISC trong file); nạp bằng `import.meta.glob`; `<img width="40" height="40" alt="">`.
  - Điều hướng §4.4: 3 `NavLink`, `aria-current`, nhãn đầy đủ và nhãn ngắn dưới 600px, chia đều, không cuộn ngang, dính đầu khi cuộn.
  - `app/router.tsx`: route §4.1 với `handle.trang`; `React.lazy` + `Suspense` thay `lazy` của route; `ErrorBoundary: LoiTrang` ở route gốc và route con.
  - `app/KhongTimThay.tsx`: tiêu đề + 2 liên kết dạng nút (`Button` của C01). `app/TrangTam.tsx`. `app/layout/LoiTrang.tsx` (`ErrorState` của C01, "Thử lại" tải lại trang).
  - CSS Modules, chỉ dùng token.
  - file: `src/FrontEnd/src/app/{router.tsx, KhongTimThay.tsx, TrangTam.tsx}`, `src/FrontEnd/src/app/layout/{Layout.tsx, AppHeader.tsx, LoiTrang.tsx, *.module.css, logo/logo.svg}`, xoá `src/FrontEnd/src/app/Layout.tsx` cũ; test cạnh file
  - xong khi:
    - Vitest: địa bàn đủ / thiếu một / thiếu cả hai, không thêm chữ nào (AC-14); 3 mục điều hướng, mục đang xem có `aria-current="page"`; tên đọc của "Danh mục", "Lĩnh vực" là nhãn đầy đủ; thư mục logo có đúng 1 file.
    - Chạy tay ở 375px: 3 nhãn ngắn trên một hàng, không cuộn ngang; ở 600px và 1280px nhãn đầy đủ. Tab đầu tiên vào liên kết bỏ qua, Enter → focus ở `main`. `/abc-xyz` → trang 404 có đầu trang và điều hướng.
    - Giả lập mạng chậm: đầu trang và điều hướng hiện trước khi chunk của trang về.
    - `npm run build`: JS tải ban đầu ≤ 200 KB gzip; báo kích thước chunk chính trước và sau task.

- [x] T06 [ui-core-dev] `AppFooter` (§4.5, câu B4, B5, B10) — chờ C01 `ExternalLink`, `Skeleton`; sau T03, T04, T05:
  - Đủ các khối và quy tắc ẩn §4.5; người chịu trách nhiệm hai mẫu câu; ngày bằng `dinhDangNgay`; lời miễn trừ `common:mien-tru`; "© <Tên trung tâm>".
  - Mọi link ngoài, `tel:`, `mailto:` qua `ExternalLink` của C01. Không có dòng nhắc đăng xuất.
  - Đang tải: `Skeleton`; lỗi hoặc 404: chỉ còn lời miễn trừ.
  - Chừa khoảng trống cuối cho nút Trợ lý; ở kiosk chừa thêm cho nút "Bắt đầu lại" (bộ chọn kiosk của C01).
  - Nền xanh đậm, chữ trắng, viền focus trắng.
  - file: `src/FrontEnd/src/app/layout/{AppFooter.tsx, AppFooter.module.css, AppFooter.test.tsx, Layout.tsx}`
  - xong khi:
    - Vitest: đủ 5 mục bắt buộc; cơ quan chủ quản trống → không có dòng đó; chức vụ trống → "Người chịu trách nhiệm nội dung: <họ tên>" không có "–" thừa; bản đồ và mọi mạng xã hội trống → không có mục, không có tiêu đề "Mạng xã hội"; `lienKet` rỗng → không có khối; ngày `2026-10-08` → "Dữ liệu thủ tục cập nhật ngày 08/10/2026"; ngày null → không có dòng; lời miễn trừ đúng câu BR-7; link `javascript:` hiện như chữ thường.
    - Chạy tay: Tab qua chân trang thấy viền focus; cuộn tới cuối, nút Trợ lý không che chữ.

- [x] T07 [ui-core-dev] Tiêu đề tab và dữ liệu đặc tả phía trình duyệt (§3.3, §4.7) — sau T03, T04, T05:
  - `app/layout/DacTaTrang.tsx`: tiêu đề tab "<Tên trang> – <Tên trung tâm>" qua `useTieuDeTab`; cập nhật đúng tập thẻ §3.3 khi đổi trang hoặc khi có dữ liệu; không tạo thẻ trùng; không theo popup.
  - Gắn vào `Layout`.
  - file: `src/FrontEnd/src/app/layout/{DacTaTrang.tsx, DacTaTrang.test.tsx, Layout.tsx}`
  - xong khi:
    - Vitest: đổi trang → tiêu đề và `DC.title`, `description`, `DC.identifier` đổi theo; gọi `useTieuDeTabTam('Thủ tục đăng ký khai sinh')` → tab đổi, thẻ đặc tả giữ tiêu đề trang; gỡ → tab về tiêu đề trang; HTML đã có sẵn thẻ (do máy chủ chèn) → không tạo thêm thẻ trùng; cơ quan chủ quản null → `DC.publisher` = tên trung tâm.
    - Chạy tay: trang chủ, danh mục, lĩnh vực, 404 có 4 tiêu đề tab khác nhau.

- [ ] T08 [code-reviewer] Review F08 (T01–T07) theo `CLAUDE.md`, `plan.md` → `.specify/specs/F08-khung-trang/result/review.md` — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được agent sở hữu sửa.

- [x] T09 [tester] [P] `testcases.md`:
  - BR-1…BR-14, AC-1…AC-21; F00 AC-16 (mở `/abc-xyz`).
  - Ghi rõ AC nào kiểm được sau T07, AC nào chờ chức năng khác (`plan.md` §8: AC-8 phần popup và trợ lý, AC-10, AC-11, AC-12, AC-13 đầy đủ, AC-20 phần popup).
  - Bộ dữ liệu thử soạn riêng (AC-5, AC-14, AC-19), không dựa vào bản đầu dữ liệu thật.
  - Kiểm dữ liệu đặc tả theo hai cách: mở thẳng địa chỉ (đọc HTML máy chủ trả) và đi tới bằng điều hướng (đọc DOM).
  - file: `.specify/specs/F08-khung-trang/testcases.md`
  - xong khi: mỗi BR/AC có ít nhất một ca thử, có cách làm, dữ liệu vào và kết quả mong đợi.

- [x] T10 [tester] Chạy kiểm thử → `.specify/specs/F08-khung-trang/result/test.md` — đã chạy 2026-10-12, kết quả CHƯA ĐẠT (lỗi Chặn L1: CLS chân trang, Lighthouse 84); còn ca Chờ F03/F04/F06/F09 và ca thử tay:
  - Integration với PostgreSQL: `Tests/Integration/ThongTinTrungTam/` (`plan.md` §7).
  - E2E: `e2e/khung-trang.spec.ts`, khổ 375 và 1280; axe-core nếu C01 đã thêm `@axe-core/playwright`, không thì kiểm bằng công cụ trình duyệt.
  - Dữ liệu nhập bằng F01 (cần F01 T05, T07). AC-8 (popup), AC-10, AC-20 (popup) chạy sau F03; AC-11, AC-12, AC-13 đầy đủ sau F04; AC-8 (trợ lý) sau F06.
  - AC-3: thử thật với trình đọc màn hình (NVDA hoặc TalkBack) ở 375px. AC-20: gửi link qua Zalo trên bản triển khai (cần tên miền thật — có thể chờ giai đoạn 8).
  - Nguồn dữ liệu (thêm 2026-10-12, F00 plan §9): AC dùng dữ liệu thử riêng (AC-5, AC-14, AC-19) và AC "nhập lại → đổi" (AC-6, AC-7) chạy với nguồn PostgreSql (profile `https-postgresql`); các AC còn lại chạy được trên nguồn Mẫu, không cần DB.
  - file: `src/BackEnd/DichVuCong.Tests/Integration/ThongTinTrungTam/`, `src/FrontEnd/e2e/khung-trang.spec.ts`, `.specify/specs/F08-khung-trang/result/test.md`
  - xong khi: mọi ca có kết quả. Đạt hết → đổi `trang_thai` của `spec.md` sang `xong`.

- [x] T11 [backend-dev] (thêm 2026-10-12) `ThongTinTrungTamService` đọc qua lớp nguồn dữ liệu (F00 plan §9.3, §9.4; plan này §2, §3.1) — sau F00 T26, trước F00 T29:
  - Thay `AppDbContext` bằng `INguonDuLieu`; `ToListAsync` / `FirstOrDefaultAsync` của EF thay bằng `DanhSachAsync` / `DauTienAsync` của `TruyVan`. Truy vấn (khoá, thứ tự), DTO, hàm thuần `NgayVietNam`, `DinhDangGio` giữ nguyên.
  - Test hợp đồng: lớp trừu tượng `ThongTinTrungTamServiceContract` (chứa các ca; hàm trừu tượng tạo `INguonDuLieu` từ một `TepDuLieuMau`) + lớp con `ThongTinTrungTamServiceTrenMau`. Bộ dữ liệu thử dựng bằng C# ở `Tests/Api/DuLieuThu/`, dùng lại được cho lớp con PostgreSQL của tester (F00 T31).
  - Review ở F00 T30.
  - file: `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/ThongTinTrungTamService.cs`, `src/BackEnd/DichVuCong.Tests/Api/{ThongTinTrungTamServiceContract.cs, ThongTinTrungTamServiceTrenMau.cs, DuLieuThu/}`
  - xong khi:
    - Test trên nguồn Mẫu: đủ trường §3.1; liên kết, ô dịch vụ, giờ làm việc đúng thứ tự khoá; trường trống giữ null; giờ "HH:mm"; ngày cập nhật = `lan_nhap` loại `thu-tuc` đổi sang ngày Việt Nam; không có dòng `thu-tuc` → ngày null; không có `trung_tam` → `LayAsync` và `LayDacTaAsync` trả null.
    - F08 AC-22 (chế độ demo, không DB): nguồn Mẫu dựng từ file có `thoiDiem` = `2026-10-12T09:00Z` → `ngayCapNhatThuTuc` = `2026-10-12` ở cả `LayAsync` và `LayDacTaAsync`, không null. Với file nhúng thật (kiểm ở F00 T29): dòng ngày không trống; HTML của trang chủ có `DC.date` = ngày đó và đủ 6 yếu tố đặc tả; không có trường hay chữ nào báo bản chạy thử.
    - `ThongTinTrungTamService` không còn `using Microsoft.EntityFrameworkCore`, không nhận `AppDbContext`.
    - Test HTTP hiện có (`ThongTinTrungTamTests`, `TrangHtmlTests` — service giả) vẫn xanh. Build sạch; `dotnet test` xanh.
