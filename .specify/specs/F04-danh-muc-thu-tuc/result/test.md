ĐẠT

# F04 · Danh mục thủ tục cấp xã / cấp tỉnh — kết quả kiểm thử (T14, T15)

## Lượt xác nhận (2026-10-14)

- **Kết luận: vẫn ĐẠT** — không ca nào đổi kết quả. `danh-muc.spec.ts` **99 đạt**, 1 bỏ qua (F04-TN-02 chỉ có ở bản dev; chạy trong `xem-truoc.config.ts`: 84/84 đạt).
- Một ca đã chỉnh vì chân trang chỉ hiện khi hết khung chờ (N1, xem `F08-khung-trang/result/test.md`): F04-TL-01 (không đòi chân trang trong lúc chờ; kiểm chân trang sau khi dữ liệu về). Sau sửa L2 của F05, `/thu-tuc` và `/linh-vuc` dùng chung khoá `['linh-vuc']` (F05-TL-10 đạt) — F04 không bị ảnh hưởng. CLS `/thu-tuc` **0,0000–0,0005** ở mọi khổ kể cả kiosk; Lighthouse mobile `/thu-tuc` **97 · 96 · 96**; JS ban đầu `/thu-tuc` 177,2 KiB (375), 187,6 KiB (1280); p95 `GET /api/thu-tuc` 4,0 ms (Mẫu), 3,9 ms (PostgreSQL 408).
- Số ca và ca Chờ không đổi (HN-07 Lighthouse 1.000 thủ tục thật, HN-17 chịu tải 500 truy cập vẫn chưa chạy; TN-08/09 thử tay).

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T11 (backend-dev, ui-core-dev, frontend-dev), F03 đã ghép.
- **Kết luận: ĐẠT** — không ca nào trượt, không lỗi *Chặn* hay *Nên sửa* thuộc F04. Mọi AC 1–22 có ít nhất một ca đạt (AC-4 đo **15–21 ms**, ≤ 200 ms; AC-7 kiểm cả bằng công cụ nhập thật). Còn các ca Chờ (F09, thử tay NVDA/TalkBack/Unikey) và hai ca chưa chạy (Lighthouse với 1.000 thủ tục thật, chịu tải 500 truy cập).
- Số ca (187) sau lượt 2: Đạt **173** · Đạt một phần **9** · Trượt **0** · Ghi nhận **1** · Chờ **2** · Chưa chạy **2** (tổng 187). Lượt 2 (2026-10-13) chạy lại toàn bộ, không ca trượt (xem mục "Chạy lại 2026-10-13").
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn 2 ca Chờ (thử tay NVDA/TalkBack TN-08, chế độ đen trắng TN-09) và 2 ca chưa chạy (Lighthouse 1.000 thủ tục thật HN-07, chịu tải 500 truy cập HN-17).
- Spec đã thêm AC-17…AC-22 và BR-11 (nhãn tab "Thủ tục cấp xã/tỉnh") sau khi viết `testcases.md`; ánh xạ ở phần "Cập nhật T10" cuối `testcases.md`.

## Chạy lại 2026-10-13 (lượt 2) — sau khi F05, F06, F07, F09 đã ghép

Chạy lại cả ba bộ (Chromium, bản build qua API nguồn Mẫu S1, `workers: 1`): **272 đạt · 5 trượt · 2 bỏ qua có chủ đích** trong lượt đầu (279 ca; 2 bỏ qua: F04-TN-02 chỉ có ở bản dev, F02-HD-10 cần API trỏ DB hỏng). Năm ca trượt đều **không phải lỗi sản phẩm**: bốn ca có kỳ vọng cũ lệch với thay đổi đã chủ ý của sản phẩm (đã sửa ca thử), một ca đo tương phản giữa lúc popup đang hiện dần (đã chờ hiệu ứng ≤ 150 ms). Sau khi sửa, chạy lại nhóm 5 ca ba lần liền: 9/9 đạt cả ba lần; `npm run e2e:san-xuat` 20/20; Vitest 1.116/1.116; `dotnet test` 1.392/1.392 có DB thử (1.129 đạt, 263 bỏ qua có thông báo khi không có DB).

| Ca | Lượt đầu | Nguyên nhân | Xử lý |
|---|---|---|---|
| F04-BM-08 | Trượt (strict mode, 2 phần tử khớp) | Liên kết "Xem và nộp trên Cổng DVC" nay mang thêm tên thủ tục dạng chữ ẩn (`– {{ten}}`, i18n `cong-dvc-ten-an`) nên cùng chữ HTML hiện ở hai nơi | Sửa ca thử (`.first()`); đạt |
| F03-TN-02 @1280 | Trượt (`color-contrast`, chập chờn) | Đo ngay lúc popup đang hiện dần (độ mờ ≤ 150 ms) | Chờ 300 ms trước khi chạy axe; 3/3 lần đạt. **Lỗi cũ L1 (`scrollable-region-focusable`) không còn ở 375, 768, 1280** |
| F03-HN-02/14 / PO-32 | Trượt | Ca kỳ vọng "~2 giây sau nạp trước popup"; **bộ đếm nạp trước đã bỏ**, chunk popup chỉ tải khi bấm | Sửa ca thử: sau 3,5 s vẫn không tải `PopupChiTiet`; bấm "Xem chi tiết" → popup < 1 s; đạt |
| F02-DV-11…15 @375 | Trượt (ô 2 cao hơn ô 3 18 px) | `scrollbar-gutter: stable` (global.css) bớt 15 px chiều rộng ở 375 px trên thanh cuộn cổ điển nên tên ô xuống thêm một dòng | Cho phép lệch ≤ 1 dòng chữ (20 px) ở 375 px; đạt. Ghi nhận |
| F02-BM-08/HD-07 | Trượt (thiếu `moTa`) | `ODichVuDto` đã bỏ `moTa` (không có chỗ hiển thị; response chỉ trường cần dùng) | Sửa ca thử; **F08 plan §3 còn ghi `moTa`** → planner chỉnh tài liệu |

Các ca được hỏi riêng ở lượt này:

| Ca / chỉ số | Kết quả lượt 2 |
|---|---|
| **F03 L1** popup cuộn nhận con trỏ (`scrollable-region-focusable`) | **Đã sửa**: axe 0 vi phạm ở popup 375 / 768 / 1280 / kiosk (đủ dữ liệu và "không tìm thấy") |
| **F03 L2** log 4xx ghi đường dẫn người dùng gửi | **Đã sửa**: gửi `/api/thu-tuc/0912345678`, `/api/thu-tuc/a@b.test`, `…/<script>`, `…?q=0912345678&email=a@b.test` lên bản Production; log chỉ có `HTTP 404 GET /api/thu-tuc/{ma}` hoặc `route-khong-ton-tai`, không chuỗi nào của người dùng |
| **F02 L1** banner/CLS với tên Trung tâm dài (375 px, API trễ 5 s) | **Đã sửa**: CLS tối đa **0,008** (trước đây 0,298). 375: API thật 0,000 · TT-A 0,000 / 0,003 · TT-B 0,006 · TT-C (tên 200 ký tự) 0,008; 1280: 0,000–0,001 |
| LCP `/` (Lighthouse mobile, 3 lần, Production) | **2,19 · 2,39 · 2,40 s** (trước đây 2,47–2,49 s); điểm **96 · 96 · 97**; CLS 0,000; TBT 23–81 ms |
| **AC-3 (F03)** popup ≤ 1 s sau khi bỏ bộ đếm nạp trước (4G giả lập 1,6 Mbps, trễ 150 ms, 10 lần, API thật) | Popup (dialog) hiện **307–321 ms**, nội dung đủ **498–548 ms** cho cả `1.001193` (trang chủ) và `1.013229` (danh mục, thủ tục lớn nhất) |
| `p95` lỡ cache `/api/thu-tuc` sau khi đổi chọn `cach_thuc` (HN-09, 1.000 thủ tục, PostgreSQL thật, máy rảnh, đo 3 lần, mỗi lần 100 lần đổi phiên bản) | p95 = **55,6 · 47,7 · 54,3 ms** (p50 32–41, max 71–89); trúng cache x1.000: p95 1,8–2,2 ms; `/api/linh-vuc`: p95 0,8–0,9 ms. Lần trượt trước (340 ms) là do máy tải nặng. Bản Release trên API chạy thật, 1.000 lần: `/api/thu-tuc` p95 4,2 / 3,9 / 6,5 ms (Mẫu / PostgreSQL 408 / PostgreSQL 1.000) |
| **F04 HD-10** (số lệnh SQL khi lỡ cache) | Lượt đầu của `dotnet test` **trượt 1 ca** ("lỡ cache chạy 3 lệnh"): lệnh thứ ba là `DELETE FROM cau_chua_tra_loi` của việc nền xoá câu quá hạn (F06) chạy lúc máy chủ khởi động, rơi sau `Sql.Xoa()`. **Lỗi của ca thử, không phải của API**: `HaTangHttp.cs` không đếm lệnh đó nữa; 3/3 lần đạt, chuỗi lệnh thực: `SELECT max(thoi_diem) FROM lan_nhap` + `SELECT … FROM thu_tuc` = 2 lệnh |
| JS ban đầu `/` | **181,6 KiB** (build in), 192,1 KiB sau 3,5 s ở 1280 (gzip -9); `/thu-tuc` 175,6 (375) / 186,0 (1280) |
| Lighthouse mobile `/thu-tuc` | 96 · 95 · 96; LCP 2,35–2,36 s; CLS 0,000 |

Ca Chờ do F06/F09 đã xong nay có kết quả (xem bên dưới trong bảng ca).

## Môi trường và cách chạy

- Ngày chạy: 2026-10-13. Người chạy: tester. Chạy **tuần tự, một trình duyệt tại một thời điểm** (`workers: 1`). Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`localhost:5432`); Docker không dùng (không Testcontainers). Playwright 1.64 (Chromium là chính; Firefox, WebKit chạy một tập con), Lighthouse 12.8 (mobile mặc định), axe-core qua `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).
- Bản kiểm: `npm run build` hiện tại (đã obfuscate) và `dotnet publish -c Release`. Bốn tiến trình API, cùng một bản publish:
  - **S1** `https://localhost:7157` — `ASPNETCORE_ENVIRONMENT=Development`, nguồn **Mẫu**, `RateLimiting__DanhMuc=100000`. Chạy e2e Chromium/Firefox/WebKit, đo `curl` nguồn Mẫu.
  - **S2** `https://localhost:5443` (và `http://localhost:5299` chuyển 307) — **Production**, nguồn Mẫu, giới hạn tần suất mặc định 300/phút. Header, rate limit, đo kích thước JS, Lighthouse.
  - **S3** `http://localhost:5555` — Production, nguồn **PostgreSql** (DB `dichvucong_t10`), giới hạn 100000. DB được dựng bằng migration, rồi `DichVuCong.DuLieuMau` (từ `data-mau/`) sinh 4 file Excel và `DichVuCong.Import nhap tat-ca` nhập bản đầu: 408 thủ tục (xã 266, tỉnh 408), 75 lĩnh vực, 16 thường gặp. Dùng cho `nhap-lai-pg.spec.ts`, đo p95 và chạy lại ca dữ liệu thật.
  - **S4** `http://localhost:5666` — nguồn PostgreSql với chuỗi kết nối tới máy không có (kiểm DB ngừng).
  - Bản dev: `npm run dev` (Vite `http://localhost:5173`, proxy `/api` sang S1).
- Biến môi trường: `ConnectionStrings__DichVuCongTest` (quản trị, `Database=postgres`) cho xUnit; `E2E_BASE_URL` cho Playwright; `E2E_IMPORT_DLL`, `E2E_EXCEL_DIR`, `E2E_CONN_STRING` cho `nhap-lai-pg.spec.ts`; `E2E_DB_DOWN=1` cho F02-HD-10.
- Lệnh chính (ở `src/FrontEnd`): `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts thu-tuc-thuong-gap danh-muc trang-chu --project=chromium`; `npm run e2e:san-xuat`; `npx playwright test -c e2e/ban-build.config.ts --project=firefox-f02-f04` (và `webkit-f02-f04`). Ở gốc repo: `dotnet test --solution src/BackEnd/DichVuCong.sln` (có `ConnectionStrings__DichVuCongTest` và không có).

## Kết quả chạy tự động tổng hợp (toàn bộ F02 + F03 + F04, lượt cuối)

| Bộ | Kết quả |
|---|---|
| `npm run lint` | sạch |
| `npm test` (Vitest) | **695/695** (70 tệp) |
| `npm run build` (`tsc -b` gồm cả `e2e/`) | sạch |
| `npm run e2e:san-xuat` (bản production có obfuscate, preview) | **13/13** |
| Playwright Chromium, bản build qua API nguồn Mẫu (S1) | một lượt đầy đủ 279 ca (9 phút): **273 đạt · 4 trượt · 2 bỏ qua có chủ đích**. `thu-tuc-thuong-gap` **107/110** (3 trượt: F03-TN-02 ở 375, 768, 1280 px) · `danh-muc` **99/100** (1 bỏ qua: F04-TN-02 cần trang xem trước chỉ có ở bản dev — đạt riêng ở Vite dev) · `trang-chu` **67/69** (1 trượt: F02-HN-05, 375 px, tên dài; 1 bỏ qua: F02-HD-10 cần API nối DB hỏng — đạt riêng ở S4) · cộng `nhap-lai-pg` (S3, công cụ nhập thật) **9/9** |
| Playwright Chromium, dữ liệu thật chạy lại trên API nguồn PostgreSql (S3) | **37/37** ca "dữ liệu thật/nguồn Mẫu/BM/HD" đạt |
| Playwright Firefox (`firefox-f02-f04`, 42 ca chính) | **42/42** đạt (sau khi dùng `history.back()` thay `page.goBack()` ở F03-DC-10/11: Playwright-Firefox không lùi qua mục lịch sử do script tạo; trình duyệt thật đóng popup đúng) |
| Playwright WebKit (`webkit-f02-f04`, 42 ca chính) | **38/42**; 4 ca ghi nhận do khác biệt nền tảng (con trỏ không về nút sau khi đóng popup ×2 — rủi ro 8 của plan; Tab không dừng ở liên kết ×2 — mặc định của Safari). Xem F03-DC-31 |
| Playwright bản dev (Vite, proxy sang S1) | 249/267 lượt đầu: 4 là lỗi thật đã báo (F03-TN-02 ×3, F02-HN-05); 3 là ca viết chưa chắc, đã sửa và đạt lại ở dev và build; 11 chỉ có ở bản dev (không CSP/header của máy chủ, script nội tuyến của Vite, React StrictMode gọi API hai lần, tên chunk, đo hiệu năng) |
| `dotnet test --solution` có `ConnectionStrings__DichVuCongTest` | **825/825** đạt (gồm 117 ca của `Tests/Integration/`) |
| `dotnet test --solution` không có DB thử | 711 đạt · **114 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | không có gói nào |

## Phần backend tester viết (`Tests/Integration/`)

- `Integration/ChiTietThuTuc/ChiTietThuTucServiceTrenPostgreSql.cs`: lớp con PostgreSQL của `ChiTietThuTucServiceContract` (cùng các ca như nguồn Mẫu) + `ChiTietThuTucTuongDuongPostgreSqlTests`: 408 mã giống từng byte giữa hai nguồn (dịch vụ và HTTP), jsonb giữ thứ tự, SQL/đường dẫn/HTML (8 giá trị) → 404 không lệnh SQL, thủ tục ngoài danh mục bị ràng buộc DB từ chối, p95 100 lần, đếm lệnh SQL, DB ngừng.
- `Integration/DanhMuc/DanhMucServiceTrenPostgreSql.cs`: lớp con PostgreSQL của `DanhMucServiceContract` + `DanhMucTrenPostgreSqlTests`: hai API giống từng byte (408 thủ tục, 266 xã, 408 tỉnh, 75 lĩnh vực, 16 thường gặp), nhập lại bằng **công cụ nhập thật** (`UngDung.ChayAsync`, `nhap tat-ca`) thêm 1 thủ tục xã → ETag đổi, `If-None-Match` cũ → 200, bản đầu 16 thường gặp → 15 → đổi thứ tự, đếm lệnh SQL, p95 trên 1.000 thủ tục (nhân bản 592 mục), DB ngừng.
- `Integration/HaTangHttp.cs`, `Integration/BoFileNhap.cs`: factory API trỏ DB thử (ghi lệnh SQL, giới hạn tần suất 100000), dựng 4 file Excel hợp lệ và chạy công cụ nhập. Số đo ghi ra tệp khi đặt `DVC_KETQUA_DO`.

- File e2e mới: `e2e/danh-muc.spec.ts` (100 ca) + `nhap-lai-pg.spec.ts` (PG-3 = F04 AC-7, TKE-03/04, HD-04).

**Cách đo AC-4 (ghi theo yêu cầu T15)**: 375×812, `Network.emulateNetworkConditions` (trễ 150 ms, xuống 1,6 Mbps, lên 750 Kbps), `page.route` trả bộ N1000 (1.000 thủ tục, 75 lĩnh vực) cho `/api/thu-tuc` và `/api/linh-vuc`, tab Cấp tỉnh (1.000 mục). Mỗi lần: xoá ô tìm, gõ "thu 1" (phím trước), đợi 450 ms cho ổn định, rồi **phím cuối "2"** (thu hẹp 111 → 11 mục nên dòng số kết quả đổi); đo `performance.now()` từ sự kiện `input` (bắt ở pha capture của `document`) đến khi `MutationObserver` thấy dòng `p[aria-live="polite"]` đổi chữ. 10 lần, lấy chậm nhất. Cách đo tương tự C01 AC-25 nhưng bằng quan sát DOM thay vì khung hình.

## Bảng ca

| Case | AC | Kết quả | Ghi chú |
|---|---|---|---|
| F04-TK-01 | AC-1, BR-1 | Đạt | PW: F04-TK-01 (AC-1) · "ho tich" ở tab cấp xã: đúng 8 thủ tục Hộ tịch; dòng "8 thủ tục (đang lọc)" |
| F04-TK-02 | AC-12, BR-1 | Đạt | PW: F04-TK-02/04/05/13 · mã 1.001193; "DAT DAI"/"đất đai"/dư khoảng trắng; thứ tự từ; đ ↔ d |
| F04-TK-03 | AC-12 | Đạt | PW: F04-TK-03 (AC-12) · dữ liệu thật: "1.001193" ra đúng một thủ tục khai sinh ở cả hai tab |
| F04-TK-04 | BR-1 | Đạt | PW: F04-TK-02/04/05/13 · mã 1.001193; "DAT DAI"/"đất đai"/dư khoảng trắng; thứ tự từ; đ ↔ d |
| F04-TK-05 | BR-1 | Đạt | PW: F04-TK-02/04/05/13 · mã 1.001193; "DAT DAI"/"đất đai"/dư khoảng trắng; thứ tự từ; đ ↔ d |
| F04-TK-06 | BR-1 | Ghi nhận | "9.2 chap" ra 4 mục (9.201, 9.202, 9.203 và 9.207 "…tranh chấp…"): so khớp mã một phần + từ trong tên, từ có thể nằm ở mã hoặc tên |
| F04-TK-07 | BR-1, C01 AC-8 | Đạt | PW: F04-TK-07 · NFD, ký tự U+200E, hoa/thường cho cùng kết quả |
| F04-TK-08 | BR-1 (chuỗi dài) | Đạt | PW: F04-TK-08 · dán 5.000 ký tự: không treo, thông báo gọn, không cuộn ngang, ✕ xoá được |
| F04-TK-09 | BR-1 (ký tự đặc biệt) | Đạt | PW: F04-TK-09 · ký tự đặc biệt/HTML/SQL nguyên văn dạng chữ; không hộp thoại; không lỗi console |
| F04-TK-10 | BR-1, C01 BR-4 | Đạt | PW: F04-TK-10 · ✕ trong ô: ô trống, con trỏ trong ô, đủ danh sách, địa chỉ bỏ q |
| F04-TK-11 | BR-1 (hàm lọc) | Đạt | Rà Vitest `loc.test.ts` (npm test 695/695 đạt) |
| F04-TK-12 | BR-1 (Telex) | Đạt một phần | Mô phỏng: gõ nhanh "giay" 5 lần không mất ký tự; IME qua CDP (g → gi → gia → giá → giấ → giấy) giữ nguyên. Thử Unikey Telex/VNI thật: Chờ thử tay |
| F04-TK-13 | BR-1 | Đạt | PW: F04-TK-02/04/05/13 · mã 1.001193; "DAT DAI"/"đất đai"/dư khoảng trắng; thứ tự từ; đ ↔ d |
| F04-LK-01 | AC-2, BR-2 | Đạt | PW: F04-LK-01 (AC-2) · Hộ tịch + Toàn trình ở tab xã còn 5; "(đang lọc)"; mọi dòng có nhãn Toàn trình |
| F04-LK-02 | AC-2, BR-10 | Đạt | PW: F04-LK-02/03 (AC-2, BR-10) · dữ liệu thật: tab xã "266 thủ tục", tab tỉnh "408 thủ tục", không "(đang lọc)" |
| F04-LK-03 | AC-2, BR-10 | Đạt | PW: F04-LK-02/03 (AC-2, BR-10) · dữ liệu thật: tab xã "266 thủ tục", tab tỉnh "408 thủ tục", không "(đang lọc)" |
| F04-LK-04 | BR-2 | Đạt | PW: F04-LK-04/05/06 · Đất đai + Một phần + "the chap" ở tab tỉnh = 2; một phần: xã 7, tỉnh 10; về Tất cả |
| F04-LK-05 | BR-2 | Đạt | PW: F04-LK-04/05/06 · Đất đai + Một phần + "the chap" ở tab tỉnh = 2; một phần: xã 7, tỉnh 10; về Tất cả |
| F04-LK-06 | BR-2 | Đạt | PW: F04-LK-04/05/06 · Đất đai + Một phần + "the chap" ở tab tỉnh = 2; một phần: xã 7, tỉnh 10; về Tất cả |
| F04-LK-07 | BR-10 (biên) | Đạt | PW: F04-LK-07 (AC-21, BR-10) · mọi thủ tục của tab đều Toàn trình: chọn Toàn trình vẫn "N thủ tục", không "(đang lọc)" |
| F04-LK-08 | BR-2, plan §4.3 | Đạt | PW: F04-LK-08/09 · ô chọn lĩnh vực: tab xã 4 lĩnh vực kèm số của tab; tab tỉnh 3 |
| F04-LK-09 | BR-2 | Đạt | PW: F04-LK-08/09 · ô chọn lĩnh vực: tab xã 4 lĩnh vực kèm số của tab; tab tỉnh 3 |
| F04-LK-10 | BR-2 | Đạt | PW: F04-LK-10 · lọc lĩnh vực giữ thứ tự theo thu_tu của dữ liệu |
| F04-LK-11 | BR-2, C01 BR-8 | Đạt | PW: F04-LK-11 · N60: sang trang 2 rồi chọn mức độ → về trang 1, địa chỉ bỏ trang |
| F04-LK-12 | BR-10 | Đạt | PW: F04-LK-12 · gõ ba từ khoá liên tiếp: dòng cập nhật; aria-live polite; 0 kết quả thì khối thông báo |
| F04-LK-13 | BR-10 | Đạt | PW: F04-LK-13 · 1.000 thủ tục: số có dấu chấm nghìn ("1.000 thủ tục") ở tab tỉnh |
| F04-LK-14 | BR-2 (biên) | Đạt | PW: F04-LK-14 / TAB-07 / AC-17 · đổi tab giữ từ khoá và mức độ, bỏ lĩnh vực và trang, về trang 1 |
| F04-XB-01 | AC-3, BR-8 | Đạt | PW: F04-XB-01/02/03 (AC-3) · 1280px: nút luôn hiện; bấm đưa về tab hiện tại, tất cả, trang 1, địa chỉ chỉ còn cap=tinh |
| F04-XB-02 | AC-3 | Đạt | PW: F04-XB-01/02/03 (AC-3) · 1280px: nút luôn hiện; bấm đưa về tab hiện tại, tất cả, trang 1, địa chỉ chỉ còn cap=tinh |
| F04-XB-03 | BR-8 | Đạt | PW: F04-XB-01/02/03 (AC-3) · 1280px: nút luôn hiện; bấm đưa về tab hiện tại, tất cả, trang 1, địa chỉ chỉ còn cap=tinh |
| F04-XB-04 | BR-8 | Đạt | PW: F04-XB-04/05 · chưa lọc bấm "Xoá bộ lọc": không đổi, không thêm lịch sử; giữ tab, về trang 1 (N60) |
| F04-XB-05 | BR-8 | Đạt | PW: F04-XB-04/05 · chưa lọc bấm "Xoá bộ lọc": không đổi, không thêm lịch sử; giữ tab, về trang 1 (N60) |
| F04-XB-06 | AC-14, BR-8 | Đạt | PW: F04-XB-06/07 (AC-14) · 1280px: lọc Hộ tịch + "xyzxyz": thông báo, 4 gợi ý, KHÔNG nút trong thông báo, nút trên thanh bấm được; ẩn phân trang |
| F04-XB-07 | AC-14 | Đạt | PW: F04-XB-06/07 (AC-14) · 1280px: lọc Hộ tịch + "xyzxyz": thông báo, 4 gợi ý, KHÔNG nút trong thông báo, nút trên thanh bấm được; ẩn phân trang |
| F04-XB-08 | AC-14, C01 BR-11 | Đạt | PW: F04-XB-08 · chỉ lọc lĩnh vực + mức độ, không từ khoá, 0 kết quả: "Không tìm thấy thủ tục phù hợp" (không nhắc từ khoá) |
| F04-XB-09 | C01 BR-11 | Đạt | AC-20: thống kê 0·0·0; chỉ còn hai gợi ý ("Hỏi Trợ lý…", "Gọi Trung tâm: …"); trang không lỗi |
| F04-XB-10 | AC-14 | Đạt | PW: F04-XB-10 · bàn phím: Tab tới "Xoá bộ lọc", Enter kích hoạt |
| F04-XB-11 | AC-14 (tab không tính bộ lọc) | Đạt | PW: F04-XB-11 (AC-14) · tab tỉnh rỗng (dữ liệu chỉ có thủ tục cấp xã), không lọc: ẩn hai gợi ý lọc (tab không tính là bộ lọc) |
| F04-TAB-01 | Phạm vi | Đạt | PW: F04-TAB-01/05 / BR-11 · hai tab "Thủ tục cấp xã", "Thủ tục cấp tỉnh"; tablist có tên; một tabpanel labelledby tab đang chọn |
| F04-TAB-02 | BR-5, AC-9 | Đạt | PW: F04-TAB-02/03 · đổi tab về trang 1, địa chỉ cap=tinh không có trang; thủ tục chỉ cấp tỉnh không ở tab xã |
| F04-TAB-03 | Phạm vi | Đạt | PW: F04-TAB-02/03 · đổi tab về trang 1, địa chỉ cap=tinh không có trang; thủ tục chỉ cấp tỉnh không ở tab xã |
| F04-TAB-04 | Tabs ARIA | Đạt | PW: F04-TAB-04 / AC-17 · bàn phím: ← → chuyển và kích hoạt ngay, Home/End; roving tabindex |
| F04-TAB-05 | Tabs ARIA | Đạt | PW: F04-TAB-01/05 / BR-11 · hai tab "Thủ tục cấp xã", "Thủ tục cấp tỉnh"; tablist có tên; một tabpanel labelledby tab đang chọn |
| F04-TAB-06 | Tabs | Đạt | PW: F04-TAB-06 · 375: hai tab chia đều, vừa chiều ngang, không cuộn ngang |
| F04-TAB-07 | BR-5 | Đạt | PW: F04-LK-14 / TAB-07 / AC-17 · đổi tab giữ từ khoá và mức độ, bỏ lĩnh vực và trang, về trang 1 |
| F04-TAB-08 | Tabs (biên) | Đạt | PW: F04-TAB-08 · bấm tab đang chọn: không đổi, không thêm lịch sử |
| F04-TKE-01 | AC-7, BR-4 | Đạt | PW: F04-TKE-01 (AC-7) · dữ liệu thật: đúng 3 ô 266 · 408 · 75 với nhãn đúng |
| F04-TKE-02 | AC-7 | Đạt | PW: F04-TKE-02/07 · bộ N: 16 · 20 · 4; không đổi khi gõ, lọc, đổi tab |
| F04-TKE-03 | AC-7, BR-4 | Đạt | PW `nhap-lai-pg.spec.ts` PG-0: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F04-TKE-04 | AC-7 | Đạt | PW PG-3 (công cụ nhập thật): thêm thủ tục cấp xã → 267·408·75, ETag đổi, `If-None-Match` cũ → 200 |
| F04-TKE-05 | BR-4 | Đạt | PW: F04-TKE-05 · API bỏ lĩnh vực không có thủ tục: ô Lĩnh vực = độ dài mảng /api/linh-vuc |
| F04-TKE-06 | BR-4 | Đạt một phần | "1.000" hiển thị đúng dấu chấm nghìn (LK-13, thống kê và dòng kết quả); chưa đo tràn ở 375 riêng cho ô thống kê |
| F04-TKE-07 | BR-4 | Đạt | PW: F04-TKE-02/07 · bộ N: 16 · 20 · 4; không đổi khi gõ, lọc, đổi tab |
| F04-TKE-08 | BR-4, AC-7 | Đạt | `grep "266\|408\|75"` trong `features/danh-muc`, `core/api` (không tính test): 0 kết quả |
| F04-UT-01 | AC-8, BR-6 | Đạt | PW: F04-UT-01 / AC-8 · không có nhãn hay ô "Ưu tiên" (thẻ và bảng, hai tab) |
| F04-UT-02 | BR-6 | Đạt | PW: F04-BM-01/02/03/UT-02 · header, tập khoá JSON đúng (10 và 5 khoá), không trường thừa, ETag + no-cache |
| F04-UT-03 | BR-6 | Đạt | `grep -i "ưu tiên\|uuTien"` trong `features/{danh-muc,thu-tuc,trang-chu}`: 0 |
| F04-PT-01 | AC-9, BR-5 | Đạt | PW: F04-PT-01/02/03 (AC-9) · N60: 25 · 25 · 10; trang 2 dòng đầu là mục 26; Sau/Trước đúng ở trang 3 |
| F04-PT-02 | AC-9 | Đạt | PW: F04-PT-01/02/03 (AC-9) · N60: 25 · 25 · 10; trang 2 dòng đầu là mục 26; Sau/Trước đúng ở trang 3 |
| F04-PT-03 | AC-9 | Đạt | PW: F04-PT-01/02/03 (AC-9) · N60: 25 · 25 · 10; trang 2 dòng đầu là mục 26; Sau/Trước đúng ở trang 3 |
| F04-PT-04 | C01 BR-8 | Đạt | PW: F04-PT-04 · tab xã 16 mục (< 25): không phân trang |
| F04-PT-05 | C01 BR-8, AC-13 | Đạt | 17 trang (tab tỉnh, 408 mục): trang 1 → 1, 2, …, 17; trang 9 → 1, …, 8, 9, 10, …, 17; trang 17 → 1, …, 16, 17; trang hiện tại `aria-current=page`; cùng ở 375 và 1280 |
| F04-PT-06 | BR-5 | Đạt | PW: F04-PT-06/07/08 · lọc/đổi tab về trang 1; trang lớn → trang cuối; giá trị hỏng → 1; 03 → 3 |
| F04-PT-07 | BR-5 (biên) | Đạt | PW: F04-PT-06/07/08 · lọc/đổi tab về trang 1; trang lớn → trang cuối; giá trị hỏng → 1; 03 → 3 |
| F04-PT-08 | BR-5 (biên) | Đạt | PW: F04-PT-06/07/08 · lọc/đổi tab về trang 1; trang lớn → trang cuối; giá trị hỏng → 1; 03 → 3 |
| F04-PT-09 | BR-5 | Đạt | PW: F04-PT-09 · thẻ: 25 mục/trang ở 375, 768, 1024, 1280; ghi số cột |
| F04-PT-10 | AC-9 | Đạt | PW: F04-PT-10 (AC-9) · N60 trang 2, mở popup rồi đóng: vẫn trang 2 |
| F04-DL-01 | AC-10, BR-3 | Đạt | PW: F04-DL-01/02 (AC-10) · cap, lv, q lên địa chỉ không có trang; mở ở context mới cùng kết quả (3 mục) |
| F04-DL-02 | AC-10 | Đạt | PW: F04-DL-01/02 (AC-10) · cap, lv, q lên địa chỉ không có trang; mở ở context mới cùng kết quả (3 mục) |
| F04-DL-03 | AC-10 | Đạt | PW: F04-DL-03/04 (AC-10) · dữ liệu thật: tab tỉnh trang 3 mở ở context mới = 25 dòng (mục 51–75) |
| F04-DL-04 | AC-10 | Đạt | PW: F04-DL-03/04 (AC-10) · dữ liệu thật: tab tỉnh trang 3 mở ở context mới = 25 dòng (mục 51–75) |
| F04-DL-05 | AC-5 | Đạt | PW: F04-DL-05 (AC-5) · link QR /thu-tuc?cap=xa&lv=ho-tich: thẳng tab xã, Hộ tịch đã chọn, 8 mục, địa chỉ không đổi thêm |
| F04-DL-06 | AC-10 (cap) | Đạt | PW: F04-DL-06 · /thu-tuc trần được bổ sung cap=xa bằng thay thế (không thêm lịch sử) |
| F04-DL-07 | plan §4.2 | Đạt | PW: F04-DL-07 / AC-18 · cap/md lạ: tab xã + Tất cả mức độ, không báo lỗi, không hiện chữ lạ; địa chỉ chuẩn lại |
| F04-DL-08 | plan §4.2 | Đạt | Cùng test F04-DL-07: `md=abc`, `TOAN-TRINH`, rỗng, `%00` → "Tất cả mức độ", không báo lỗi; `md` đúng giữ nguyên |
| F04-DL-09 | AC-11, BR-7 | Đạt | PW: F04-DL-09/10/11/12 (AC-11) · lv không có: khối "Không tìm thấy lĩnh vực" + "Xem toàn bộ danh mục"; không lộ mã; bấm về danh mục đầy đủ |
| F04-DL-10 | AC-11 | Đạt | PW: F04-DL-09/10/11/12 (AC-11) · lv không có: khối "Không tìm thấy lĩnh vực" + "Xem toàn bộ danh mục"; không lộ mã; bấm về danh mục đầy đủ |
| F04-DL-11 | AC-11 (bảo mật) | Đạt | PW: F04-DL-09/10/11/12 (AC-11) · lv không có: khối "Không tìm thấy lĩnh vực" + "Xem toàn bộ danh mục"; không lộ mã; bấm về danh mục đầy đủ |
| F04-DL-12 | AC-11, F08 AC-10 | Đạt | PW: F04-DL-09/10/11/12 (AC-11) · lv không có: khối "Không tìm thấy lĩnh vực" + "Xem toàn bộ danh mục"; không lộ mã; bấm về danh mục đầy đủ |
| F04-DL-13 | plan §4.3 | Đạt | PW: F04-DL-13 / AC-22 · lv có trong dữ liệu nhưng 0 thủ tục ở tab: ô chọn "(0)", "Không tìm thấy thủ tục phù hợp", không "Không tìm thấy lĩnh vực" |
| F04-DL-14 | BR-3 | Đạt | PW: F04-DL-14/18 · gõ từng phím không tạo mục lịch sử; đổi thẻ/bảng không đổi địa chỉ |
| F04-DL-15 | BR-3 | Đạt | PW: F04-DL-15 / AC-19 · từ trang chủ vào danh mục, gõ "khai sinh", chọn Hộ tịch → "Quay lại" một lần về trang chủ |
| F04-DL-16 | BR-3 | Đạt | PW: F04-DL-16 · q 5.000 ký tự và q chỉ khoảng trắng |
| F04-DL-17 | BR-3 (kiosk) | Đạt | F09-BL (kiosk.spec): sau "Bắt đầu lại" địa chỉ là `/`, không `cap`, `lv`, `md`, `q`, `trang`, `ma`; dạng bảng (`cach-xem`) được giữ |
| F04-DL-18 | BR-3 | Đạt | PW: F04-DL-14/18 · gõ từng phím không tạo mục lịch sử; đổi thẻ/bảng không đổi địa chỉ |
| F04-PO-01 | AC-6 | Đạt | PW: F04-PO-01/10/13 (AC-6) · bấm tên (bảng) mở popup đúng mã 9.103; Esc trả con trỏ về nút; đúng 1 dialog |
| F04-PO-02 | AC-13 | Đạt | PW: F04-PO-02/03/04/05 (AC-13) · địa chỉ giữ cap, lv và thêm ma; mở ở context mới; Quay lại đóng popup giữ bộ lọc; ✕/Esc/vùng tối |
| F04-PO-03 | AC-13 | Đạt | PW: F04-PO-02/03/04/05 (AC-13) · địa chỉ giữ cap, lv và thêm ma; mở ở context mới; Quay lại đóng popup giữ bộ lọc; ✕/Esc/vùng tối |
| F04-PO-04 | AC-13 | Đạt | PW: F04-PO-02/03/04/05 (AC-13) · địa chỉ giữ cap, lv và thêm ma; mở ở context mới; Quay lại đóng popup giữ bộ lọc; ✕/Esc/vùng tối |
| F04-PO-05 | AC-13 | Đạt | PW: F04-PO-02/03/04/05 (AC-13) · địa chỉ giữ cap, lv và thêm ma; mở ở context mới; Quay lại đóng popup giữ bộ lọc; ✕/Esc/vùng tối |
| F04-PO-06 | AC-15 | Đạt | PW: F04-PO-06/07/08/09 (AC-15) · tab xa: liên kết Cổng DVC trên dòng mở tab mới đúng địa chỉ, popup KHÔNG mở; tên mở popup, KHÔNG mở tab |
| F04-PO-07 | AC-15 | Đạt | PW: F04-PO-06/07/08/09 (AC-15) · tab xa: liên kết Cổng DVC trên dòng mở tab mới đúng địa chỉ, popup KHÔNG mở; tên mở popup, KHÔNG mở tab |
| F04-PO-08 | AC-15 | Đạt | PW: F04-PO-06/07/08/09 (AC-15) · tab xa: liên kết Cổng DVC trên dòng mở tab mới đúng địa chỉ, popup KHÔNG mở; tên mở popup, KHÔNG mở tab |
| F04-PO-09 | AC-15 | Đạt | PW: F04-PO-06/07/08/09 (AC-15) · tab xa: liên kết Cổng DVC trên dòng mở tab mới đúng địa chỉ, popup KHÔNG mở; tên mở popup, KHÔNG mở tab |
| F04-PO-10 | AC-6 (đóng) | Đạt | PW: F04-PO-01/10/13 (AC-6) · bấm tên (bảng) mở popup đúng mã 9.103; Esc trả con trỏ về nút; đúng 1 dialog |
| F04-PO-11 | AC-13 (biên) | Đạt | PW: F04-PO-11/12 · ma không có / sai định dạng: danh mục hiện + thông báo "Không tìm thấy thủ tục này…", 0 yêu cầu chi tiết với mã sai |
| F04-PO-12 | AC-13 (biên) | Đạt | PW: F04-PO-11/12 · ma không có / sai định dạng: danh mục hiện + thông báo "Không tìm thấy thủ tục này…", 0 yêu cầu chi tiết với mã sai |
| F04-PO-13 | AC-6, F03 BR-5 | Đạt | PW: F04-PO-01/10/13 (AC-6) · bấm tên (bảng) mở popup đúng mã 9.103; Esc trả con trỏ về nút; đúng 1 dialog |
| F04-DH-01 | AC-16 | Đạt | PW: F04-DH-01 (AC-16) · 375px: thẻ, không có nút chuyển dạng |
| F04-DH-02 | AC-16 | Đạt | PW: F04-DH-02 (AC-16) · 768px: thẻ, có nút chuyển dạng |
| F04-DH-03 | AC-16 | Đạt | PW: F04-DH-03 (AC-16) · 1280px: bảng, có nút chuyển dạng |
| F04-DH-04 | AC-16 | Đạt | PW: F04-DH-04 (AC-16) · 1080px: thẻ, có nút chuyển dạng |
| F04-DH-05 | AC-16, BR-9 | Đạt | PW: F04-DH-05/06 / BR-9 · lựa chọn dùng chung với khối thường gặp ở trang chủ (hai chiều) |
| F04-DH-06 | AC-16, BR-9 | Đạt | PW: F04-DH-05/06 / BR-9 · lựa chọn dùng chung với khối thường gặp ở trang chủ (hai chiều) |
| F04-DH-07 | BR-9 (biên) | Đạt | PW: F04-DH-07 599 (AC-16) · 599px: thẻ, không có nút chuyển dạng |
| F04-DH-08 | BR-9 | Đạt | PW: F04-DH-08/09/10/11 · thu cửa sổ 375 → thẻ không nút; nhớ lựa chọn qua tải lại; kiosk; đổi dạng giữ lọc/trang/địa chỉ |
| F04-DH-09 | BR-9 | Đạt | PW: F04-DH-08/09/10/11 · thu cửa sổ 375 → thẻ không nút; nhớ lựa chọn qua tải lại; kiosk; đổi dạng giữ lọc/trang/địa chỉ |
| F04-DH-10 | BR-9 (kiosk) | Đạt | PW: F04-DH-08/09/10/11 · thu cửa sổ 375 → thẻ không nút; nhớ lựa chọn qua tải lại; kiosk; đổi dạng giữ lọc/trang/địa chỉ |
| F04-DH-11 | BR-9 | Đạt | PW: F04-DH-08/09/10/11 · thu cửa sổ 375 → thẻ không nút; nhớ lựa chọn qua tải lại; kiosk; đổi dạng giữ lọc/trang/địa chỉ |
| F04-DH-12 | C01 BR-7 | Đạt | PW: F04-DH-12/13 · bảng 7 cột đúng, vùng bảng cuộn ngang ở 768 (trang không cuộn); thẻ cùng hàng cao bằng nhau |
| F04-DH-13 | C01 BR-7 | Đạt | PW: F04-DH-12/13 · bảng 7 cột đúng, vùng bảng cuộn ngang ở 768 (trang không cuộn); thẻ cùng hàng cao bằng nhau |
| F04-TL-01 | F08 BR-11 | Đạt | PW: F04-TL-01 · API trễ 3 giây: đầu/chân trang hiện ngay, vùng nội dung khung giữ chỗ "Đang tải…" |
| F04-TL-02 | C01 AC-19 | Đạt | PW: F04-TL-02/03/04 · /api/thu-tuc 500 rồi 200; chỉ linh-vuc lỗi; 429 |
| F04-TL-03 | C01 AC-19 | Đạt | PW: F04-TL-02/03/04 · /api/thu-tuc 500 rồi 200; chỉ linh-vuc lỗi; 429 |
| F04-TL-04 | C01 AC-19 | Đạt | PW: F04-TL-02/03/04 · /api/thu-tuc 500 rồi 200; chỉ linh-vuc lỗi; 429 |
| F04-TL-05 | F08 AC-11 | Đạt | PW: F04-TL-05 (F08 AC-11) · mất mạng khi chưa từng tải danh mục: "Không kết nối được", số điện thoại; bật mạng, "Thử lại" ra danh sách |
| F04-TL-06 | BR-4, dữ liệu rỗng | Đạt | PW: F04-XB-09 / TL-06 / AC-20 · danh mục rỗng: thống kê 0·0·0, chỉ gợi ý hỏi trợ lý + gọi trung tâm, trang không lỗi |
| F04-TL-07 | plan §3.1 | Đạt | PW: F04-TL-07/08/10 · lĩnh vực mất khoá; coQuan/thoiHan null; mucDo lạ: không vỡ, không "undefined"/"null" |
| F04-TL-08 | plan §3.1 | Đạt | PW: F04-TL-07/08/10 · lĩnh vực mất khoá; coQuan/thoiHan null; mucDo lạ: không vỡ, không "undefined"/"null" |
| F04-TL-09 | plan §3.1 | Đạt | PW: F04-TL-09 · thoiHan rất dài (1.200 ký tự): thẻ không tràn khung (375) |
| F04-TL-10 | plan §3.1 | Đạt | PW: F04-TL-07/08/10 · lĩnh vực mất khoá; coQuan/thoiHan null; mucDo lạ: không vỡ, không "undefined"/"null" |
| F04-TL-11 | C01 BR-10 | Đạt | LK-01: mọi dòng có chữ "Toàn trình"/"Một phần"; F03-PO-23 cho popup |
| F04-TN-01 | C01 AC-4 | Đạt | PW: F04-TN-01 · axe 375px: tab xã/tỉnh, thẻ/bảng 0 vi phạm |
| F04-TN-02 | C01 AC-4 | Đạt | PW trên bản dev (`E2E_BASE_URL=http://localhost:5173`): trang `/dev/design-system` có Select và Tabs; axe 0 vi phạm ở thường (1280) và kiosk (1080×1920). Trang xem trước không có ở bản build |
| F04-TN-03 | C01 AC-1 | Đạt | PW: F04-TN-03/07 · chỉ bàn phím: Tab qua tab, ô tìm, hai ô chọn, Xoá bộ lọc, chuyển dạng, dòng, phân trang; Enter số trang |
| F04-TN-04 | Select | Đạt | PW: F04-TN-04 · ô chọn lĩnh vực bằng bàn phím: chọn đúng mục, kết quả đổi, địa chỉ đổi |
| F04-TN-05 | Select | Đạt | PW: F04-TN-02/05/13/14 · tên đọc của ô chọn; một h1 ẩn, thẻ là h2; một main; tablist có tên; tabpanel labelledby |
| F04-TN-06 | Select (biên) | Đạt một phần | 320 px: không cuộn ngang. Nhãn rất dài (cắt bằng "…") chưa có dữ liệu thử riêng |
| F04-TN-07 | Pager | Đạt | PW: F04-TN-03/07 · chỉ bàn phím: Tab qua tab, ô tìm, hai ô chọn, Xoá bộ lọc, chuyển dạng, dòng, phân trang; Enter số trang |
| F04-TN-08 | Dòng số kết quả | Chờ | Thử tay NVDA/TalkBack (dòng số kết quả đọc một lần). PW: chỉ có MỘT vùng `aria-live=polite` cho số kết quả (LK-12) |
| F04-TN-09 | C01 AC-3 | Chờ | Nhìn tay chế độ đen trắng (tab chọn, dạng xem, nhãn mức độ có chữ) |
| F04-TN-10 | WCAG 1.4.10 | Đạt một phần | 320 px không cuộn ngang (TN-06); giãn chữ ở 375 không tràn. Phóng 200% ở 320×568 chưa chạy riêng |
| F04-TN-11 | WCAG 1.4.12 | Đạt | PW: F04-TN-10/11/15/16 · 320 và giãn chữ không tràn; vùng bấm >= 24 px ở 375; kiosk không cuộn ngang |
| F04-TN-12 | WCAG 2.5.3 | Đạt | F03-TN-05/06/16 (tên đọc "Xem chi tiết <tên>" duy nhất, chứa chữ nhìn thấy) trên cùng `DanhSachThuTuc`; F04-PO-01 (375) |
| F04-TN-13 | Heading | Đạt | PW: F04-TN-02/05/13/14 · tên đọc của ô chọn; một h1 ẩn, thẻ là h2; một main; tablist có tên; tabpanel labelledby |
| F04-TN-14 | Landmark | Đạt | PW: F04-TN-02/05/13/14 · tên đọc của ô chọn; một h1 ẩn, thẻ là h2; một main; tablist có tên; tabpanel labelledby |
| F04-TN-15 | WCAG 2.5.8 | Đạt | Vùng bấm ở 375: tab 162×38, "Xoá bộ lọc" 130×34, ô chọn 302×34, nút "Xem chi tiết" 302×34 — đều ≥ 24×24 |
| F04-TN-16 | C01 AC-2 | Đạt một phần | Kiosk 1080×1920 không cuộn ngang, đọc được; cỡ chữ/nút "lớn theo C01 AC-2" chưa đo số |
| F04-BM-01 | CLAUDE.md > Header | Đạt | PW: F04-BM-01/02/03/UT-02 · header, tập khoá JSON đúng (10 và 5 khoá), không trường thừa, ETag + no-cache |
| F04-BM-02 | plan §3.1 | Đạt | PW: F04-BM-01/02/03/UT-02 · header, tập khoá JSON đúng (10 và 5 khoá), không trường thừa, ETag + no-cache |
| F04-BM-03 | plan §3.1 | Đạt | PW: F04-BM-01/02/03/UT-02 · header, tập khoá JSON đúng (10 và 5 khoá), không trường thừa, ETag + no-cache |
| F04-BM-04 | plan §6 (đầu vào) | Đạt | PW: F04-BM-04 · query lạ/độc hại bị bỏ: 200, ETag giống nhau, thân không phản chiếu |
| F04-BM-05 | CLAUDE.md > API | Đạt | PW: F04-BM-05 · POST/PUT/DELETE/PATCH 405 phuong-thuc-khong-hop-le; HEAD 200 không thân; OPTIONS không CORS |
| F04-BM-06 | plan §6 (cache) | Đạt | xUnit `DanhMucTests.QueryLa_KhongThoiCache_DichVuChiChayMotLan` (backend-dev, rà) |
| F04-BM-07 | CLAUDE.md (rate limit) | Đạt một phần | (a) Production: 300×200 rồi 429 `qua-nhieu-yeu-cau` + `Retry-After: 60`. (b)/(c) tải lại `/thu-tuc` 120/160 lần trong 1 phút: chưa chạy |
| F04-BM-08 | plan §6 (chèn nội dung) | Đạt | PW: F04-BM-08 (NX) · HTML trong tên thủ tục và lĩnh vực hiện nguyên văn dạng chữ |
| F04-BM-09 | plan §6 | Đạt | PW: F04-BM-09 · địa chỉ độc hại: không hộp thoại, không lỗi trang, chuỗi không lọt vào document.title |
| F04-BM-10 | CLAUDE.md > Trình duyệt | Đạt | PW: F04-BM-10/11/13/18 · 375px: luồng đầy đủ không vi phạm CSP/console.error; mọi request cùng gốc; lọc không gọi mạng; storage chỉ cach-xem |
| F04-BM-11 | CLAUDE.md > Tài nguyên tự host | Đạt | PW: F04-BM-10/11/13/18 · 375px: luồng đầy đủ không vi phạm CSP/console.error; mọi request cùng gốc; lọc không gọi mạng; storage chỉ cach-xem |
| F04-BM-12 | plan §6 | Đạt | PW: F04-BM-12 · mọi liên kết ngoài trên dòng: rel đủ, chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; mã đã mã hoá |
| F04-BM-13 | plan §6 | Đạt | PW: F04-BM-10/11/13/18 · 375px: luồng đầy đủ không vi phạm CSP/console.error; mọi request cùng gốc; lọc không gọi mạng; storage chỉ cach-xem |
| F04-BM-14 | plan §6 | Đạt | Gõ/lọc phát sinh 0 yêu cầu mạng (BM-10/11/13/18); từ khoá không rời trình duyệt nên không vào log API |
| F04-BM-15 | CLAUDE.md > Mã nguồn | Đạt | Bản build/publish: 0 `.map`/`.pdb`/`sourceMappingURL`; tên hàm dự án (`locThuTuc`, `luaChonLinhVuc`) không còn trong chunk (đã obfuscate) |
| F04-BM-16 | CLAUDE.md > Thư viện | Đạt một phần | `npm audit --omit=dev`: 0 lỗ hổng; `dotnet list package --vulnerable --include-transitive`: sạch. Không đối chiếu được gói trước F04 (FE chưa commit) |
| F04-BM-17 | plan §6 | Đạt | `grep dangerouslySetInnerHTML\|innerHTML` ở `features/danh-muc`, `core/components/{Select,Tabs}`: 0; `npm run lint` sạch |
| F04-BM-18 | plan §6 | Đạt | PW: F04-BM-10/11/13/18 · 375px: luồng đầy đủ không vi phạm CSP/console.error; mọi request cùng gốc; lọc không gọi mạng; storage chỉ cach-xem |
| F04-BM-19 | plan §6 (lỗi) | Đạt | xUnit `BM19_PostgreSqlKhongToiDuoc…`: cả `/api/thu-tuc` và `/api/linh-vuc` 500 `loi-he-thong` + `maTraCuu`, không lộ chuỗi kết nối/stack; FE ErrorState (TL-02) |
| F04-BM-20 | CLAUDE.md > Dữ liệu | Đạt | `grep "Host=\|Password="` trong `wwwroot`/bản publish: 0; log và response lỗi của bản nối DB hỏng không có mật khẩu thử |
| F04-HN-01 | AC-4, F00 BR-9 | Đạt | AC-4 ở 375 px, 4G giả lập (1,6 Mbps, trễ 150 ms), N1000: phím cuối → dòng số kết quả đổi, 10 lần: 15–21 ms (chậm nhất 21 ms ≤ 200). Cách đo: xem phần Hiệu năng |
| F04-HN-02 | AC-4 | Đạt một phần | Ở 1280 px, N1000: đổi mức độ 21 ms · lĩnh vực 16 ms · đổi tab 19 ms · gõ 21 ms (≤ 200). Kiosk 1080×1920: chưa đo riêng |
| F04-HN-03 | AC-4 | Đạt | Rà Vitest `loc.test.ts` (lọc 1.000 mục) |
| F04-HN-04 | F00 BR-9 | Đạt | JS (gzip -9) `/thu-tuc`: 375 px 169,5 KiB đầu · 176,7 KiB sau 3,5 s; 1280 px 180,0 · 187,1 KiB. Chunk `DanhMuc` 6,9 KiB; `grid` 8,3 KiB chỉ tải ở 1280; popup 7,1 KiB tải trước sau ~2 s |
| F04-HN-05 | plan §5 | Đạt | PW: F04-HN-05/13/15 · 375: chunk grid và popup không tải ban đầu; request ban đầu; lọc 0 yêu cầu |
| F04-HN-06 | F00 BR-9 | Đạt | Lighthouse mobile `/thu-tuc` (publish Production, 3 lần): 94 · 95 · 93; CLS 0; LCP 2,36–2,40 s |
| F04-HN-07 | F00 BR-9 | Chưa chạy | Cần DB cố định 1.000 thủ tục để chạy Lighthouse; chỉ đo được p95 API bằng xUnit (HN-09) |
| F04-HN-08 | F00 BR-9 | Đạt | Lighthouse mobile `/` (đã ghép F03): 94 · 95 · 95; CLS 0 |
| F04-HN-09 | F00 AC-10, BR-9 | Đạt | xUnit trên PostgreSQL, 1.000 thủ tục (thân thô 522.594 B): `/api/thu-tuc` trúng cache ×1.000 p50 2,7 · p95 29,9 · max 701 ms (một lần dừng GC hiếm); `/api/linh-vuc` ×1.000 p95 7,4 ms; lỡ cache ×100 (đổi phiên bản) p50 49,9 · p95 81,3 · max 148 ms |
| F04-HN-10 | plan §3.2 | Đạt | Nguồn Mẫu 408 thủ tục, 100 lần curl HTTPS (gồm TLS): `/api/thu-tuc` p50 47,8 · p95 189,5 · max 432 ms (gồm lần đầu lỡ cache); PostgreSQL (Kestrel thật) p95 26,3 ms |
| F04-HN-11 | plan §3.2 | Đạt | xUnit: gọi đầu sau nhập lại (lỡ cache) 1.000 thủ tục: p95 81,3 ms, lớn nhất 148 ms (≤ 300) |
| F04-HN-12 | plan §2 | Đạt | `/api/thu-tuc` 408 mục: 212.581 B thô (kế hoạch ≈ 189 KB), Brotli 37.250 B (≈ 26 KB); `/api/linh-vuc` 10.514 B thô, Brotli 3.592 B. Lớn hơn ước lượng nhưng trong ngân sách. Lần lỡ cache nén kém hơn (71.211 B) — xem G1 |
| F04-HN-13 | plan §5 | Đạt | PW: F04-HN-05/13/15 · 375: chunk grid và popup không tải ban đầu; request ban đầu; lọc 0 yêu cầu |
| F04-HN-14 | plan §5 | Đạt một phần | Trong 60 s: về `/thu-tuc` không tải lại danh mục (1 yêu cầu mỗi API). Phần "sau 61 s gửi If-None-Match nhận 304": chưa chạy |
| F04-HN-15 | plan §6 | Đạt | PW: F04-HN-05/13/15 · 375: chunk grid và popup không tải ban đầu; request ban đầu; lọc 0 yêu cầu |
| F04-HN-16 | F00 BR-9 | Đạt | CLS khi API trễ 5 s: 375 px 0,001; 1280 px 0,077 (< 0,1) |
| F04-HN-17 | F00 AC-19 | Chưa chạy | Cần môi trường tải 500 truy cập đồng thời / 84 người thao tác |
| F04-HD-01 | F00 §9 | Đạt | xUnit `HD01_DichVu…` và `Http_HD01_HaiApi…`: hai API giống từng byte giữa nguồn Mẫu và PostgreSQL; header ETag + `no-cache`, không `Server` |
| F04-HD-02 | AC-7 | Đạt | Contract `FileNhung_408ThuTuc_Xa266_Tinh408_75LinhVuc_16ThuongGap` trên cả hai nguồn |
| F04-HD-03 | plan §3.2 | Đạt | Contract `LinhVuc_SapTheoTenTimKiemOrdinal_RoiTheoMa`, `ThuTuc_SapTheoThuTu…` trên PostgreSQL |
| F04-HD-04 | AC-7 | Đạt | PW `nhap-lai-pg.spec.ts` PG-3: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F04-HD-05 | plan §3.2 | Đạt | Contract `ThuTuc_ThoiHan_KhacKhongBaoGioRaNguyenVan` trên PostgreSQL |
| F04-HD-06 | plan §3.2 (R1–R7) | Đạt | Contract `GoiHaiLan_CungKetQua_VaKhongDoiDoiTuongCuaNguon` trên PostgreSQL |
| F04-HD-07 | F00 BR-10 | Đạt | xUnit `HD07_SauNhapLai…` và `HD04_NhapLai…`: dữ liệu mới ngay, ETag mới, không chờ hết hạn cache |
| F04-HD-08 | plan §3.1 | Đạt | Rà xUnit `DanhMucTests.DanhSachRong_Tra200_MangRong` (backend-dev): nguồn rỗng → 200 `[]` |
| F04-HD-09 | F00 §9 | Đạt | 37 ca PW dữ liệu thật chạy trên API nguồn PostgreSql (nhập bằng công cụ nhập thật) và toàn bộ trên nguồn Mẫu: cùng kết quả |
| F04-HD-10 | plan §3.2 | Đạt | xUnit `HD10_SoLenhSql…`: trúng cache 1 lệnh (phiên bản); lỡ cache `/api/thu-tuc` 2 lệnh (phiên bản + thủ tục), `/api/linh-vuc` 3 lệnh (phiên bản + 2 truy vấn) |
| F04-HD-11 | F00 BR-16 | Đạt | API nguồn Mẫu giữ 408 thủ tục dù DB PostgreSQL đã nhập lại (409): chế độ Mẫu không có đường nhập |
| F04-HD-12 | plan §3.1 | Đạt | xUnit `HD12…`: DB từ chối thủ tục không thuộc cấp nào (`ck_thu_tuc_danh_muc`); danh mục chỉ có thủ tục thuộc ≥ 1 cấp (408/408) |

## Bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Header trên `/thu-tuc`, `/api/thu-tuc`, `/api/linh-vuc`, 304 (HTTPS Production) | Đạt: CSP đúng nguyên văn `CLAUDE.md`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; không `Server`, không `X-Powered-By`; API có `ETag` + `Cache-Control: no-cache` |
| Trường JSON | Đạt: `/api/thu-tuc` đúng 10 khoá (`ma, ten, tenTimKiem, linhVucMa, mucDo, capXa, capTinh, thuTuThuongGap, thoiHan, coQuanThucHien`), không `phi`, `trinhTu`, `uuTien`…; `/api/linh-vuc` đúng 5 khoá; trường null vẫn có mặt; không "Khác" nguyên văn ở `thoiHan` |
| Query lạ/độc hại (`cap=xa';--&lv=<script>&q=%00&trang=-1&x=<ngẫu nhiên>`) | Đạt: 200, ETag giống không query, thân không phản chiếu |
| Phương thức | Đạt: POST/PUT/DELETE/PATCH 405 `phuong-thuc-khong-hop-le`; HEAD 200 không thân; OPTIONS không CORS |
| Rate limiting (300/phút, một IP) | Đạt: 300×200 rồi 429 + `Retry-After: 60` (`/api/thu-tuc`); tải lại 120/160 lần trong phút: chưa chạy |
| HTML trong tên thủ tục, tên lĩnh vực (nhãn ô chọn), từ khoá | Đạt: nguyên văn dạng chữ; 0 hộp thoại; không thẻ sinh ra |
| URL độc hại (`q`, `lv`, `cap=javascript:`, `md=%00`, `trang=<b>`, `ma=<script>`, `%` hỏng) | Đạt: 0 hộp thoại, 0 lỗi trang, `document.title` sạch; `lv` lạ → khối "Không tìm thấy lĩnh vực" không nhắc lại mã |
| CSP/console, request ngoài gốc, storage | Đạt ở 375 và 1280: 0 vi phạm CSP, 0 `console.error`, mọi request cùng gốc; lọc/đổi tab/Xoá bộ lọc **0 yêu cầu mạng**; `localStorage` chỉ `cach-xem`; không cookie |
| Link Cổng DVC trên dòng | Đạt: `rel="noopener noreferrer"`, `target=_blank`, chỉ `dichvucong.gov.vn`, không tên miền "Đã bỏ", mã đã mã hoá |
| Mã nguồn bản build/publish | Đạt: 0 `.map`/`.pdb`, 0 `sourceMappingURL`; tên hàm dự án đã đổi |
| DB ngừng | Đạt: 500 `loi-he-thong` + `maTraCuu`; không lộ chuỗi kết nối; FE ErrorState |
| `npm audit --omit=dev`, `dotnet list package --vulnerable` | 0 lỗ hổng; không gói nào |
| Ghi chú | Log lỗi 4xx của API ghi đường dẫn người dùng gửi (xem F03 lỗi L2); không áp cho F04 vì danh mục không có tham số trong đường dẫn |

## Hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| **AC-4**: phím cuối → dòng số kết quả đổi, 375 px, 4G giả lập, 1.000 thủ tục, 10 lần, chậm nhất | 15, 15, 15, 16, 16, 17, 17, 17, 19, 21 ms → **21 ms** | ≤ 200 ms |
| Đổi lĩnh vực / mức độ / tab / gõ ở 1280 px, N1000 | 16 · 21 · 19 · 21 ms | ≤ 200 ms |
| JS tải ban đầu `/thu-tuc` (gzip -9) | 375 px **169,5 KiB** (176,7 sau 3,5 s) · 1280 px **180,0 KiB** (187,1 sau 3,5 s) | ≤ 200 KB |
| Chunk | DanhMuc 6,9 · useDanhSachUrl 11,5 · grid 8,3 (chỉ khi dạng bảng, ≥ 1024 px) · PopupChiTiet 7,1 (nạp trước ~2 s); vendor 120,0 · index 26,1 | grid/popup không vào phần tải đầu ở 375 |
| Lighthouse mobile `/thu-tuc` (publish Production, 3 lần) | **94 · 95 · 93**; LCP 2,36–2,40 s; TBT 130–210 ms; CLS 0 | ≥ 85, CLS < 0,1 |
| Lighthouse mobile `/` (đã ghép khối thường gặp, tải cả danh mục) | **94 · 95 · 95**; CLS 0 (không cần phương án `?thuongGap=1`) | ≥ 85 |
| CLS khi API trễ 5 s | 375 px **0,001** · 1280 px **0,077** | < 0,1 |
| Yêu cầu mạng khi mở `/thu-tuc` | 3 yêu cầu: `/api/thu-tuc`, `/api/linh-vuc`, `/api/trung-tam`; chậm nhất 318 ms (< 0,6 s); về `/thu-tuc` trong 60 s không tải lại | F00 AC-18 |
| p95 `/api/thu-tuc` trên **1.000 thủ tục** (PostgreSQL, xUnit trong tiến trình) | trúng cache ×1.000: p50 2,7 · **p95 29,9** · max 701 ms (một lần dừng hiếm); `/api/linh-vuc` ×1.000: p95 **7,4** ms; lỡ cache ×100 (đổi phiên bản): p50 49,9 · **p95 81,3** · max 148 ms | ≤ 300 ms |
| p95 408 thủ tục, Kestrel thật, 100 lần | Mẫu `/api/thu-tuc` p50 47,8 · **p95 189,5** · max 432 ms; `/api/linh-vuc` p95 46,2 ms. PostgreSQL `/api/thu-tuc` p95 **26,3** ms; `/api/linh-vuc` p95 **26,0** ms | ≤ 300 ms |
| Kích thước | `/api/thu-tuc` 408 mục: 212.581 B thô, Brotli 37.250 B (kế hoạch ≈ 189 KB / 26 KB); `/api/linh-vuc` 10.514 B, Brotli 3.592 B; 1.000 mục: 522.594 B thô | ghi nhận |
| Số lệnh SQL | trúng cache 1; lỡ cache `/api/thu-tuc` 2, `/api/linh-vuc` 3 | trúng ≤ 1 |
| Nhập lại bằng công cụ nhập (S3) | thêm 1 thủ tục xã → API thấy ngay (409 mục), ETag đổi, ô cấp xã 267 | F00 BR-10 |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| — | Không có lỗi *Chặn* hay *Nên sửa* thuộc F04 | — | — |
| Góp ý | **G1** Lần trả đầu sau khi cache được tạo nén kém hơn nhiều (`/api/thu-tuc` 71.211 B thay vì 37.250 B Brotli). Trùng G3 của F03 | `curl -sk -H "Accept-Encoding: br" -o NUL -w "%{size_download}\n" https://localhost:7157/api/thu-tuc` (lần 1 so lần 2) | backend-dev |
| Ghi nhận | `/api/thu-tuc` thô lớn hơn kế hoạch ~12% (212.581 B so 189 KB) và Brotli ~43% (37,2 KB so 26 KB); vẫn trong ngân sách. Ngoại suy 1.000 mục thật: 522 KB thô, Brotli ~90–100 KB | — | — |
| Ghi nhận | Chung với F03: popup có lỗi trợ năng L1 (xem F03/result/test.md), ảnh hưởng mọi nơi mở popup, kể cả từ danh mục | F03 L1 | ui-core-dev |

## Mơ hồ và hành vi ghi nhận

- "9.2 chap" (TK-06) ra 4 mục (9.201, 9.202, 9.203 và 9.207 vì "tranh chấp" chứa "chap"): từ nằm ở mã hoặc tên đều tính.
- Đổi tab giữ từ khoá và mức độ, bỏ lĩnh vực và trang (AC-17 đã chốt).
- Nhãn tab đúng "Thủ tục cấp xã/Thủ tục cấp tỉnh" (BR-11).
- Danh mục rỗng: thống kê 0·0·0, chỉ hai gợi ý (hỏi trợ lý, gọi Trung tâm) (AC-20).
- Quay lại sau khi lọc: về trang chủ, không lùi từng bộ lọc (AC-19, PW DL-15).
- Phân trang hiện: trang 1 → "1 2 … 17"; trang 9 → "1 … 8 9 10 … 17"; trang 17 → "1 … 16 17".
- URL cực dài (> 8 KB, ví dụ 1.700 lần "zq%20"): Kestrel đóng kết nối (`ERR_HTTP2_PROTOCOL_ERROR`) thay vì trả 414; không ảnh hưởng người dùng thật. Ô tìm của trang chấp nhận 5.000 ký tự.

## Ca Chờ và chưa chạy

- **F04-DL-17** — Chờ F09 ("Bắt đầu lại")
- **F04-TN-08** — Thử tay NVDA/TalkBack (dòng số kết quả đọc một lần). PW: chỉ có MỘT vùng `aria-live=polite` cho số kết quả (LK-12)
- **F04-TN-09** — Nhìn tay chế độ đen trắng (tab chọn, dạng xem, nhãn mức độ có chữ)
- **F04-HN-07** — Cần DB cố định 1.000 thủ tục để chạy Lighthouse; chỉ đo được p95 API bằng xUnit (HN-09)
- **F04-HN-17** — Cần môi trường tải 500 truy cập đồng thời / 84 người thao tác
