ĐẠT

# F03 · Thủ tục thường gặp và popup chi tiết — kết quả kiểm thử (T10)

## Lượt xác nhận (2026-10-14)

- **Kết luận: vẫn ĐẠT** — không ca nào đổi kết quả. `thu-tuc-thuong-gap.spec.ts` **110 đạt**, 0 trượt, 0 bỏ qua; `nhap-lai-pg` (F03 NB-03/04/06/07) chạy riêng với PostgreSQL: 9/9; xUnit trên PostgreSQL thật 1.433/1.433.
- Không có ca nào của F03 phải chỉnh. Số ca và ca Chờ không đổi (7 ca Chờ: thử tay NVDA/TalkBack, Unikey, đen trắng, iOS/Android thật).

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T07 (backend-dev, ui-core-dev, frontend-dev) và F04/F02 đã ghép (danh mục, trang chủ).
- **Kết luận (lượt 1): CHƯA ĐẠT** — F03-TN-02 (L1) và F03-BM-25 (L2) trượt. **Lượt 2 (2026-10-13): ĐẠT** — cả L1 lẫn L2 đã sửa, không ca trượt; xem mục "Chạy lại 2026-10-13".
- Số ca (242) sau lượt 2: Đạt **224** · Đạt một phần **7** · Trượt **0** · Ghi nhận **4** · Chờ **7** · Chưa chạy **0** (tổng 242). Trước lượt 2: Đạt 214 · Trượt 2 · Chờ 15.
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn 7 ca Chờ (thử tay NVDA/TalkBack, Unikey Telex/VNI, chế độ đen trắng, iOS/Android thật). Đổi sang `xong` khi các ca đó đạt.
- Spec đã thêm AC-24…AC-28 và BR-11 sau khi viết `testcases.md`; kỳ vọng các ca bị thay (DC-10/11, DC-26, PO-11, DL-07, HT-20, TK-07) đã được cập nhật theo spec trong phần "Cập nhật T10" ở cuối `testcases.md`.

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

- File e2e mới: `e2e/thu-tuc-thuong-gap.spec.ts` (110 ca), `e2e/nhap-lai-pg.spec.ts` (9 ca dùng chung F02/F03/F04), `e2e/du-lieu/{chung,thuong-gap,danh-muc,trang-chu}.ts`, `e2e/du-lieu/sua_excel.py`; `e2e/ban-build.config.ts` thêm tên tệp vào `testMatch` và hai project `firefox-f02-f04`, `webkit-f02-f04`.

## Bảng ca

| Case | AC | Kết quả | Ghi chú |
|---|---|---|---|
| F03-TK-01 | AC-1, BR-1 | Đạt | PW: F03-TK-01/02 · "dang ky the chap" ra đúng 3 mục Đất đai; bốn cách gõ cho cùng kết quả (AC-1) |
| F03-TK-02 | AC-1, BR-1 | Đạt | PW: F03-TK-01/02 · "dang ky the chap" ra đúng 3 mục Đất đai; bốn cách gõ cho cùng kết quả (AC-1) |
| F03-TK-03 | AC-2 | Đạt | PW: F03-TK-03/04/05 · chip Đất đai + "the chap"; đổi thứ tự thao tác (AC-2) |
| F03-TK-04 | AC-2 | Đạt | PW: F03-TK-03/04/05 · chip Đất đai + "the chap"; đổi thứ tự thao tác (AC-2) |
| F03-TK-05 | AC-2 | Đạt | PW: F03-TK-03/04/05 · chip Đất đai + "the chap"; đổi thứ tự thao tác (AC-2) |
| F03-TK-06 | AC-7, BR-1 | Đạt | PW: F03-TK-06/07 · tìm theo mã: đầy đủ, một phần "1.0011" (AC-28), "9.3" |
| F03-TK-07 | AC-7, BR-1 (biên) | Đạt | AC-28: "1.0011" → 1.001193; "9.3" khớp mã chứa đoạn (≥ 6 mục) |
| F03-TK-08 | AC-7, BR-1 | Đạt | PW: F03-TK-08/09/10 · "ho tich khai sinh" = 13; "dat dai" = 6 (tên lĩnh vực); mã + tên |
| F03-TK-09 | BR-1 | Đạt | PW: F03-TK-08/09/10 · "ho tich khai sinh" = 13; "dat dai" = 6 (tên lĩnh vực); mã + tên |
| F03-TK-10 | BR-1 | Đạt | PW: F03-TK-08/09/10 · "ho tich khai sinh" = 13; "dat dai" = 6 (tên lĩnh vực); mã + tên |
| F03-TK-11 | BR-1, C01 BR-11 | Đạt | PW: F03-TK-11/12 · không có kết quả: thông báo có nút "Xoá bộ lọc" trong thông báo; bấm thì về 43/43 và con trỏ về ô tìm |
| F03-TK-12 | BR-1, C01 BR-11 | Đạt | PW: F03-TK-11/12 · không có kết quả: thông báo có nút "Xoá bộ lọc" trong thông báo; bấm thì về 43/43 và con trỏ về ô tìm |
| F03-TK-13 | BR-1 (biên: chuỗi dài) | Đạt | PW: F03-TK-13 · dán 5.000 ký tự: không treo (<= 200 ms), không cuộn ngang, ✕ xoá được (375) |
| F03-TK-14 | BR-1 (biên: ký tự đặc biệt) | Đạt | PW: F03-TK-14 · ký tự đặc biệt/HTML/SQL: hiện nguyên văn dạng chữ, không hộp thoại, không lỗi, không sinh thẻ |
| F03-TK-15 | BR-1 (dấu) | Đạt | PW: F03-TK-15 · NFD, ký tự U+200E chen giữa, hoa/thường cho cùng kết quả với "dang ky" |
| F03-TK-16 | BR-1 (dấu) | Chờ | Thử tay Unikey Telex/VNI thật. Mô phỏng gõ nhanh + IME qua CDP ở F04-TK-12 đạt |
| F03-TK-17 | BR-1 | Đạt | PW: F03-TK-17 · ✕ trong ô: ô trống, con trỏ vẫn trong ô, 43/43, địa chỉ bỏ q và trang |
| F03-TK-18 | BR-2, AC-8 | Đạt | PW: F03-TK-18/19/20 · chip: Tất cả + 7 lĩnh vực theo thứ tự xuất hiện; một chip chọn; giữ từ khoá |
| F03-TK-19 | BR-2, C01 BR-5 | Đạt | PW: F03-TK-18/19/20 · chip: Tất cả + 7 lĩnh vực theo thứ tự xuất hiện; một chip chọn; giữ từ khoá |
| F03-TK-20 | BR-2 | Đạt | PW: F03-TK-18/19/20 · chip: Tất cả + 7 lĩnh vực theo thứ tự xuất hiện; một chip chọn; giữ từ khoá |
| F03-TK-21 | BR-2 (biên) | Đạt | PW: F03-TK-21 · 375: hàng chip dài vuốt ngang trong hàng, cả trang không cuộn ngang |
| F03-TK-22 | BR-1 (sau nhập) | Đạt | PW `nhap-lai-pg.spec.ts` PG-0b: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-HT-01 | AC-8 | Đạt | PW: F03-HT-01/02/03 · tiêu đề, "Hiển thị 43/43", số đếm theo bộ lọc, y luôn 43 |
| F03-HT-02 | AC-8 | Đạt | PW: F03-HT-01/02/03 · tiêu đề, "Hiển thị 43/43", số đếm theo bộ lọc, y luôn 43 |
| F03-HT-03 | AC-8, BR-7 | Đạt | PW: F03-HT-01/02/03 · tiêu đề, "Hiển thị 43/43", số đếm theo bộ lọc, y luôn 43 |
| F03-HT-04 | AC-13, BR-7 | Đạt | PW: F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1 |
| F03-HT-05 | AC-13 | Đạt | PW: F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1 |
| F03-HT-06 | AC-13 | Đạt | PW: F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1 |
| F03-HT-07 | AC-13 | Đạt | PW: F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1 |
| F03-HT-08 | BR-7 | Đạt | PW: F03-HT-08 · dạng bảng: 12 dòng mỗi trang, trang 4 có 7, dòng đầu trang 2 là mục 13 |
| F03-HT-09 | BR-7 | Đạt | Chip Chứng thực (5 mục) → không hiện phân trang (cùng bước với HT-06) |
| F03-HT-10 | BR-7 | Đạt | PW: F03-HT-04/05/06/07/10 · 4 trang (12,12,12,7); trang 2 đúng mục 13–24; URL; đổi chip/từ khoá về trang 1 |
| F03-HT-11 | AC-14, BR-7 | Đạt | PW: F03-HT-11/12 · số cột thẻ (AC-14): 375→1, 600→2, 768→2/3, 1024+→≤4; mọi hàng đầy; thẻ cùng hàng cao bằng nhau |
| F03-HT-12 | AC-14 (biên) | Đạt | PW: F03-HT-11/12 · số cột thẻ (AC-14): 375→1, 600→2, 768→2/3, 1024+→≤4; mọi hàng đầy; thẻ cùng hàng cao bằng nhau |
| F03-HT-13 | AC-22, BR-10 | Đạt | PW: F03-HT-13/14/15/16 · thứ tự: kết hôn trước khai sinh ở thẻ, bảng, chip Hộ tịch; lọc giữ thứ tự (AC-22) |
| F03-HT-14 | AC-22 | Đạt | PW: F03-HT-13/14/15/16 · thứ tự: kết hôn trước khai sinh ở thẻ, bảng, chip Hộ tịch; lọc giữ thứ tự (AC-22) |
| F03-HT-15 | AC-22, BR-10 | Đạt | PW: F03-HT-13/14/15/16 · thứ tự: kết hôn trước khai sinh ở thẻ, bảng, chip Hộ tịch; lọc giữ thứ tự (AC-22) |
| F03-HT-16 | BR-10 | Đạt | PW: F03-HT-13/14/15/16 · thứ tự: kết hôn trước khai sinh ở thẻ, bảng, chip Hộ tịch; lọc giữ thứ tự (AC-22) |
| F03-HT-17 | AC-22 (dữ liệu) | Đạt | PW `nhap-lai-pg.spec.ts` PG-2: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-HT-18 | AC-22 | Đạt | PW `nhap-lai-pg.spec.ts` PG-2: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-HT-19 | BR-10 | Đạt | PW: F03-HT-19 · 3 mục không thường gặp không xuất hiện kể cả khi tìm đúng mã |
| F03-HT-20 | (plan §10 mục 8) | Đạt | AC-27 / BR-11: cả danh mục rỗng lẫn "không mục nào thường gặp" → không tiêu đề, không "Hiển thị 0/0"; ô dịch vụ, giờ làm việc vẫn hiện (1280, 375) |
| F03-HT-21 | BR-7 | Đạt | PW: F03-HT-21 · chậm 3 giây: khung giữ chỗ 12 thẻ rồi danh sách (375) |
| F03-HT-22 | (C01 BR-11) | Đạt | PW: F03-HT-22/24 · 500 rồi 200: ErrorState trong khối + "Thử lại"; 404/mạng đứt cũng vậy; khối khác không ảnh hưởng |
| F03-HT-23 | Ngoài phạm vi | Đạt | PW: F03-HT-23 · không có nút Chia sẻ, QR, micro, chữ lớn trong khối và popup |
| F03-HT-24 | (C01 AC-18) | Đạt một phần | Đã thử 500 → ErrorState + "Thử lại"; 404 và mất mạng cùng đường `ErrorState` nhưng chưa có ca riêng |
| F03-DH-01 | AC-12, BR-6 | Đạt | PW: F03-DH-01 · 375px: thẻ, không có nút chuyển dạng (AC-12) |
| F03-DH-02 | AC-12 | Đạt | PW: F03-DH-02 · 768px: thẻ, có nút chuyển dạng (AC-12) |
| F03-DH-03 | AC-12 | Đạt | PW: F03-DH-03 · 1280px: bảng, có nút chuyển dạng (AC-12) |
| F03-DH-04 | AC-12 | Đạt | PW: F03-DH-04 · 1080px: thẻ, có nút chuyển dạng (AC-12) |
| F03-DH-05 | AC-12 | Đạt | PW: F03-DH-05 · 1280 chọn bảng → thu 375 (thẻ, không nút) → nới 1280 (bảng) |
| F03-DH-06 | AC-5 | Đạt | PW: F03-DH-06/07/08 · nhớ lựa chọn qua lần tải lại (1280, 768, kiosk) |
| F03-DH-07 | AC-5 (mơ hồ) | Đạt | PW: F03-DH-06/07/08 · nhớ lựa chọn qua lần tải lại (1280, 768, kiosk) |
| F03-DH-08 | BR-6 (kiosk) | Đạt | PW: F03-DH-06/07/08 · nhớ lựa chọn qua lần tải lại (1280, 768, kiosk) |
| F03-DH-09 | BR-6 (biên) | Đạt | PW: F03-DH-09 599 · 599px: thẻ, không có nút chuyển dạng (AC-12) |
| F03-DH-10 | BR-6, C01 BR-6 | Đạt | PW: F03-DH-10 / DL-09 · đổi dạng giữ từ khoá, chip, trang, thứ tự; địa chỉ không đổi |
| F03-DH-11 | BR-6 (biên) | Đạt | PW: F03-DH-11/12 · localStorage lạ → mặc định theo khổ; localStorage chặn ghi → đổi trong phiên, không lỗi |
| F03-DH-12 | BR-6 (biên) | Đạt | PW: F03-DH-11/12 · localStorage lạ → mặc định theo khổ; localStorage chặn ghi → đổi trong phiên, không lỗi |
| F03-DH-13 | BR-6 | Đạt | Chọn thẻ ở danh mục → khối trang chủ cũng thẻ, và ngược lại (PW F04-DH-05/06) |
| F03-DH-14 | BR-6, C01 AC-12 | Đạt | PW: F03-DH-14/15/16 · bảng có đủ cột; thẻ có đủ phần; thủ tục không thời hạn không có nhãn thời hạn |
| F03-DH-15 | BR-6 | Đạt | PW: F03-DH-14/15/16 · bảng có đủ cột; thẻ có đủ phần; thủ tục không thời hạn không có nhãn thời hạn |
| F03-DH-16 | BR-6 | Đạt | PW: F03-DH-14/15/16 · bảng có đủ cột; thẻ có đủ phần; thủ tục không thời hạn không có nhãn thời hạn |
| F03-DH-17 | BR-6, C01 BR-7 | Đạt | PW: F03-DH-17 · tên 300 ký tự trong bảng ở 1024 và 1280: xuống dòng, trang không cuộn ngang |
| F03-PO-01 | AC-3 | Đạt | PW: F03-PO-01 · API chi tiết trễ 2 giây: popup (dialog) hiện ngay với "Đang tải…", sau đó nội dung thật |
| F03-PO-02 | AC-3 | Đạt | PW: F03-PO-02 (AC-3) · bản build + 4G giả lập (1,6 Mbps, trễ 150 ms), API thật: 1.001193 (trang chủ) và 1.013229 (danh mục): dialog và nội dung đủ <= 1 s, |
| F03-PO-03 | BR-3, AC-3 | Đạt | PW: F03-PO-03/04/17/25 · cấu trúc: h2 tên, h3 các mục theo thứ tự, <dl> thông tin chung, đúng một lời miễn trừ, không h1 |
| F03-PO-04 | BR-3 | Đạt | PW: F03-PO-03/04/17/25 · cấu trúc: h2 tên, h3 các mục theo thứ tự, <dl> thông tin chung, đúng một lời miễn trừ, không h1 |
| F03-PO-05 | BR-3, AC-3 | Đạt | PW: F03-PO-05 · dữ liệu thật (nguồn Mẫu): 1.001193 ghi "Chưa ghi rõ", không "1 Khác" (AC-3) |
| F03-PO-06 | BR-3 | Đạt | PW: F03-PO-06/07/08 · thời hạn null → "Chưa ghi rõ…", ô trống "—"; popup tối thiểu không có mục/bảng rỗng, không null/undefined |
| F03-PO-07 | BR-3 | Đạt | PW: F03-PO-06/07/08 · thời hạn null → "Chưa ghi rõ…", ô trống "—"; popup tối thiểu không có mục/bảng rỗng, không null/undefined |
| F03-PO-08 | BR-3 | Đạt | PW: F03-PO-06/07/08 · thời hạn null → "Chưa ghi rõ…", ô trống "—"; popup tối thiểu không có mục/bảng rỗng, không null/undefined |
| F03-PO-09 | AC-23 | Đạt | PW: F03-PO-09/10/11 · yêu cầu điều kiện có/không; số bản chính/sao: (1,0), (0,1), (2,3), trống, (0,0) chỉ tên, (0,2) (AC-23) |
| F03-PO-10 | AC-23 | Đạt | PW: F03-PO-09/10/11 · yêu cầu điều kiện có/không; số bản chính/sao: (1,0), (0,1), (2,3), trống, (0,0) chỉ tên, (0,2) (AC-23) |
| F03-PO-11 | AC-23 (mơ hồ) | Đạt | AC-23 đã chốt: (0,0) và trống → chỉ tên giấy tờ; (0,2) → "Bản chính: 0 · Bản sao: 2" |
| F03-PO-12 | AC-23, BR-3 | Đạt | PW `nhap-lai-pg.spec.ts` PG-0b: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-PO-13 | AC-6, BR-3 | Đạt | PW: F03-PO-13/14/15/16 · căn cứ pháp lý: chữ thuần, không <a>/<button>, Tab nhảy qua; mục ẩn khi trống (AC-6) |
| F03-PO-14 | AC-6 | Đạt | PW: F03-PO-13/14/15/16 · căn cứ pháp lý: chữ thuần, không <a>/<button>, Tab nhảy qua; mục ẩn khi trống (AC-6) |
| F03-PO-15 | AC-6, BR-3 | Đạt | PW: F03-PO-13/14/15/16 · căn cứ pháp lý: chữ thuần, không <a>/<button>, Tab nhảy qua; mục ẩn khi trống (AC-6) |
| F03-PO-16 | AC-6 | Đạt | PW: F03-PO-13/14/15/16 · căn cứ pháp lý: chữ thuần, không <a>/<button>, Tab nhảy qua; mục ẩn khi trống (AC-6) |
| F03-PO-17 | BR-3 (miễn trừ) | Đạt | PW: F03-PO-03/04/17/25 · cấu trúc: h2 tên, h3 các mục theo thứ tự, <dl> thông tin chung, đúng một lời miễn trừ, không h1 |
| F03-PO-18 | BR-3 | Đạt | PW: F03-PO-18/19 · bảng cách thức 3 cột có caption ẩn, th scope; bước có trường hợp in đậm, xuống dòng giữ nguyên |
| F03-PO-19 | BR-3 | Đạt | PW: F03-PO-18/19 · bảng cách thức 3 cột có caption ẩn, th scope; bước có trường hợp in đậm, xuống dòng giữ nguyên |
| F03-PO-20 | BR-3 (ẩn mục) | Đạt | PW: F03-PO-20 · từng trường trống thì đúng mục/dòng đó biến mất |
| F03-PO-21 | BR-3 (biên: rất dài) | Đạt | PW: F03-PO-21 / TN-10 · P-E (tên 300 ký tự, phí 1.700, bước 9,3 KB, 100 giấy tờ) ở 375 và 1280: không cuộn ngang, đủ 100 giấy tờ |
| F03-PO-22 | BR-3 (biên) | Đạt | PW: F03-PO-22 · thủ tục lớn nhất 1.013229 (dữ liệu thật) ở 375: không cuộn ngang, tiêu đề và ✕ luôn thấy khi cuộn thân, bước dài cuộn trong thân |
| F03-PO-23 | BR-3 | Đạt | PW: F03-PO-23/24 · nhãn mức độ luôn có chữ; mucDo lạ không vỡ trang |
| F03-PO-24 | BR-3 (biên) | Ghi nhận | `mucDo` lạ ("khac") không vỡ trang nhưng nhãn hiện khoá i18n thô "muc-do.khac" ("Hộ tịch muc-do.khac Mã: …"). Không xảy ra với API thật (BE chỉ trả 2 giá trị). Xem G1 |
| F03-PO-25 | BR-3 | Đạt | PW: F03-PO-03/04/17/25 · cấu trúc: h2 tên, h3 các mục theo thứ tự, <dl> thông tin chung, đúng một lời miễn trừ, không h1 |
| F03-PO-26 | (plan §4.2) | Đạt | PW: F03-PO-26/27/28 · lỗi 500 → ErrorState + "Đóng" + "Thử lại"; 429; mất mạng rồi có mạng |
| F03-PO-27 | (plan §4.2) | Đạt | PW: F03-PO-26/27/28 · lỗi 500 → ErrorState + "Đóng" + "Thử lại"; 429; mất mạng rồi có mạng |
| F03-PO-28 | (plan §4.2) | Đạt | PW: F03-PO-26/27/28 · lỗi 500 → ErrorState + "Đóng" + "Thử lại"; 429; mất mạng rồi có mạng |
| F03-PO-29 | (plan §5) | Đạt một phần | Đã thử: mở – đóng – mở lại ngay → không gọi lại API chi tiết. Phần "sau 61 s gửi If-None-Match nhận 304" chưa chạy |
| F03-PO-30 | (plan §4.2 key=ma) | Đạt | PW: F03-PO-30 · đổi ma A→B khi A trả muộn: popup B đúng, A về muộn không ghi đè |
| F03-PO-31 | (plan §5) | Đạt | PW: F03-PO-31 · rê chuột không gọi chi tiết; pointerdown/focus gọi 1 lần cho đúng mã trước khi click |
| F03-PO-32 | (plan §5) | Đạt | PW: F03-HN-02/14 / PO-32 · mở "/" ở 375: không tải chunk popup/grid ngay, không ảnh/font do khối; ~2 giây sau mới nạp trước popup |
| F03-PO-33 | BR-5, AC-11 | Đạt | PW: F03-PO-33 / DC-13 / DM-01 · cùng một popup từ thẻ và từ dòng bảng (innerText giống nhau) |
| F03-LK-01 | AC-9, BR-4 | Đạt | PW: F03-LK-01/02/05 · popup: đúng một liên kết, tab mới đúng địa chỉ, rel noopener noreferrer, opener null, trang vẫn ở popup |
| F03-LK-02 | AC-9, BR-4 | Đạt | PW: F03-LK-01/02/05 · popup: đúng một liên kết, tab mới đúng địa chỉ, rel noopener noreferrer, opener null, trang vẫn ở popup |
| F03-LK-03 | AC-10 | Đạt | PW: F03-LK-03/04/10 · thẻ và dòng bảng: đúng 1 liên kết, tab mới, popup chi tiết KHÔNG mở; ba địa chỉ giống nhau |
| F03-LK-04 | AC-10 | Đạt | PW: F03-LK-03/04/10 · thẻ và dòng bảng: đúng 1 liên kết, tab mới, popup chi tiết KHÔNG mở; ba địa chỉ giống nhau |
| F03-LK-05 | AC-10 | Đạt | PW: F03-LK-01/02/05 · popup: đúng một liên kết, tab mới đúng địa chỉ, rel noopener noreferrer, opener null, trang vẫn ở popup |
| F03-LK-06 | AC-10, BR-4 | Đạt | PW: F03-LK-06/07/08/BM-20 · không "Nộp trực tuyến"; mọi href http chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; rel đủ; mã mã hoá URL |
| F03-LK-07 | BR-4 | Đạt | PW: F03-LK-06/07/08/BM-20 · không "Nộp trực tuyến"; mọi href http chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; rel đủ; mã mã hoá URL |
| F03-LK-08 | BR-4 (biên) | Đạt | PW: F03-LK-06/07/08/BM-20 · không "Nộp trực tuyến"; mọi href http chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; rel đủ; mã mã hoá URL |
| F03-LK-09 | BR-4 | Đạt | PW: F03-LK-09 · Tab tới liên kết, Enter mở tab mới; tên đọc bắt đầu bằng chữ nhìn thấy |
| F03-LK-10 | AC-10 (so sánh) | Đạt | PW: F03-LK-03/04/10 · thẻ và dòng bảng: đúng 1 liên kết, tab mới, popup chi tiết KHÔNG mở; ba địa chỉ giống nhau |
| F03-LK-11 | BR-4 (kiosk) | Đạt | F09-NH-06/09 (kiosk.spec): danh sách và popup mỗi nơi đúng một dòng nhắc, không lặp từng liên kết |
| F03-LK-12 | BR-4 (F06) | Đạt | F06-PU-07/08/09/10: mỗi thủ tục trong câu trả lời có cặp nút "Xem chi tiết" + "Xem và nộp trên Cổng DVC" cùng `href` như popup (`linkDvc(ma)`), `rel` noopener noreferrer |
| F03-DC-01 | AC-15, BR-8 | Đạt | PW: F03-DC-01/04 · bấm mở giữ q,trang và thêm ma; ✕ bỏ ma, giữ trang 2, con trỏ về nút đã mở (AC-15, AC-16) |
| F03-DC-02 | AC-15 | Đạt | PW: F03-DC-02/03 · mở link ở context mới: popup mở sẵn, nền đúng từ khoá/trang; /?ma= trần: 43/43 trang 1 (AC-15) |
| F03-DC-03 | AC-15 | Đạt | PW: F03-DC-02/03 · mở link ở context mới: popup mở sẵn, nền đúng từ khoá/trang; /?ma= trần: 43/43 trang 1 (AC-15) |
| F03-DC-04 | AC-16, BR-8 | Đạt | PW: F03-DC-01/04 · bấm mở giữ q,trang và thêm ma; ✕ bỏ ma, giữ trang 2, con trỏ về nút đã mở (AC-15, AC-16) |
| F03-DC-05 | AC-16 | Đạt | PW: F03-DC-05/06/30 · Esc và vùng tối đóng như ✕; nền không đổi (vị trí cuộn) (AC-16) |
| F03-DC-06 | AC-16 | Đạt | PW: F03-DC-05/06/30 · Esc và vùng tối đóng như ✕; nền không đổi (vị trí cuộn) (AC-16) |
| F03-DC-07 | AC-17, BR-8 | Đạt | PW: F03-DC-07/08 · "Quay lại" khi popup mở từ danh sách: popup đóng, ở lại trang 2 với "khai sinh"; Tiến → mở lại (AC-17) |
| F03-DC-08 | AC-17 | Đạt | PW: F03-DC-07/08 · "Quay lại" khi popup mở từ danh sách: popup đóng, ở lại trang 2 với "khai sinh"; Tiến → mở lại (AC-17) |
| F03-DC-09 | BR-8 | Đạt | PW: F03-DC-09 · mở rồi đóng bằng ✕: "Quay lại" sau đó không đưa lại trạng thái "popup mở" |
| F03-DC-10 | BR-8 (biên) | Đạt | AC-24: mở thẳng `/?ma=1.001193`: "Quay lại" đóng popup, ở lại trang chủ, địa chỉ bỏ `ma`; ✕ cũng ở lại. Đạt trên Chromium, Firefox, WebKit |
| F03-DC-11 | BR-8 (biên) | Đạt | AC-24 (làm rõ hành vi): hook đệm lịch sử → "Quay lại" không rời trang web |
| F03-DC-12 | AC-18, F08 AC-10 | Đạt | PW: F03-DC-12/13/15/16 / AC-18 · ma không có: khối vẫn hiện, popup "Không tìm thấy thủ tục này…" + Đóng; không nhắc mã; tiêu đề tab |
| F03-DC-13 | AC-18 | Đạt | PW F03-DC-12/13/15/16: "Đóng" ở thông báo không tìm thấy → địa chỉ bỏ `ma`, danh sách giữ nguyên |
| F03-DC-14 | AC-18, plan §4.2 | Đạt | AC-18/AC-28: mã sai định dạng và độc hại → "Không tìm thấy thủ tục này…", 0 yêu cầu chi tiết, 0 hộp thoại, chữ không hiện ra trang hay tiêu đề |
| F03-DC-15 | AC-18 | Đạt | PW: F03-DC-12/13/15/16 / AC-18 · ma không có: khối vẫn hiện, popup "Không tìm thấy thủ tục này…" + Đóng; không nhắc mã; tiêu đề tab |
| F03-DC-16 | AC-18 (tiêu đề) | Đạt | PW: F03-DC-12/13/15/16 / AC-18 · ma không có: khối vẫn hiện, popup "Không tìm thấy thủ tục này…" + Đóng; không nhắc mã; tiêu đề tab |
| F03-DC-17 | AC-21, BR-8 | Đạt | PW: F03-DC-17/18/19/20 / AC-21 · tiêu đề tab: tên thủ tục khi popup mở, về tiêu đề trang chủ khi đóng; head không đổi |
| F03-DC-18 | AC-21 | Đạt | PW: F03-DC-17/18/19/20 / AC-21 · tiêu đề tab: tên thủ tục khi popup mở, về tiêu đề trang chủ khi đóng; head không đổi |
| F03-DC-19 | AC-21 | Đạt | PW: F03-DC-17/18/19/20 / AC-21 · tiêu đề tab: tên thủ tục khi popup mở, về tiêu đề trang chủ khi đóng; head không đổi |
| F03-DC-20 | AC-21, F08 BR-13 | Đạt | PW: F03-DC-17/18/19/20 / AC-21 · tiêu đề tab: tên thủ tục khi popup mở, về tiêu đề trang chủ khi đóng; head không đổi |
| F03-DC-21 | AC-21, F08 BR-13 | Đạt | PW: F03-DC-21 · HTML máy chủ của /?ma= giống /: không có tên thủ tục |
| F03-DC-22 | BR-8 | Đạt | PW: F03-DC-22/24/25 · ma đổi A→B khi mở: một popup; ma lặp lấy một giá trị; đóng chỉ bỏ ma, giữ tham số khác |
| F03-DC-23 | BR-8, BR-5 | Đạt một phần | Popup mở đúng ở `/thu-tuc?cap&lv&ma=` (PW F04-PO-02…05); `/linh-vuc?ma=` chờ F05 |
| F03-DC-24 | BR-8 (biên) | Đạt | PW: F03-DC-22/24/25 · ma đổi A→B khi mở: một popup; ma lặp lấy một giá trị; đóng chỉ bỏ ma, giữ tham số khác |
| F03-DC-25 | BR-8 (biên) | Đạt | PW: F03-DC-22/24/25 · ma đổi A→B khi mở: một popup; ma lặp lấy một giá trị; đóng chỉ bỏ ma, giữ tham số khác |
| F03-DC-26 | BR-8 (kiosk, plan §4.2) | Đạt | AC-25: kiosk mở popup bằng `replace` (history.length không đổi, không `popupThuTuc`); "Quay lại" đi tới mục trước (`/thu-tuc`), không chỉ đóng popup; ✕, Esc, vùng tối đóng và bỏ `ma` |
| F03-DC-27 | BR-8 (kiosk) | Đạt | F09-BL: sau "Bắt đầu lại" địa chỉ là `/`, không `q`, `lv`, `trang`, `ma`, `history.length` không tăng ở kiosk (F09-LS) |
| F03-DC-28 | AC-4, C01 AC-15 | Đạt | PW: F03-DC-28 / TN-03/04 · bàn phím: Enter mở, con trỏ vào popup, Tab đi vòng trong popup, Esc đóng và trả con trỏ; aria dialog |
| F03-DC-29 | AC-4, C01 AC-16 | Đạt | PW: F03-DC-29 · popup mở: nền không cuộn; sau đóng vị trí cuộn như cũ |
| F03-DC-30 | AC-4 | Đạt | PW: F03-DC-05/06/30 · Esc và vùng tối đóng như ✕; nền không đổi (vị trí cuộn) (AC-16) |
| F03-DC-31 | AC-4 (WebKit) | Ghi nhận | Firefox: con trỏ về đúng nút sau khi đóng (PW). WebKit (Playwright): phím vẫn đúng nhưng con trỏ KHÔNG về nút sau khi đóng popup — đúng rủi ro 8 của plan (Safari không focus nút khi bấm chuột). Thử trên Safari macOS thật: Chờ thử tay |
| F03-DL-01 | AC-19, BR-9 | Đạt | PW: F03-DL-01/02/03/04 (AC-19) · trang 3 có trong URL, mở ở context mới ra cùng 12 mục; chip + từ khoá về trang 1 |
| F03-DL-02 | AC-19 | Đạt | PW: F03-DL-01/02/03/04 (AC-19) · trang 3 có trong URL, mở ở context mới ra cùng 12 mục; chip + từ khoá về trang 1 |
| F03-DL-03 | AC-19 | Đạt | PW: F03-DL-01/02/03/04 (AC-19) · trang 3 có trong URL, mở ở context mới ra cùng 12 mục; chip + từ khoá về trang 1 |
| F03-DL-04 | AC-19 | Đạt | PW: F03-DL-01/02/03/04 (AC-19) · trang 3 có trong URL, mở ở context mới ra cùng 12 mục; chip + từ khoá về trang 1 |
| F03-DL-05 | BR-9 | Đạt | PW: F03-DL-05 · gõ nhanh từng phím không tạo mục lịch sử; địa chỉ cập nhật sau ~300 ms |
| F03-DL-06 | BR-9 | Đạt | PW: F03-DL-06 · trang lạ: abc,0,00,-1,1.5,3abc,trống → trang 1; số lớn → trang cuối; 03 → trang 3 |
| F03-DL-07 | BR-9, plan §10 mục 7 | Đạt | AC-26: `lv` lạ/rỗng/lĩnh vực không có thủ tục thường gặp → "Tất cả", 43/43, không báo lỗi, không lộ mã |
| F03-DL-08 | BR-9 (biên) | Đạt | PW: F03-DL-08/10 · q có <script>, q 5.000 ký tự, q chỉ khoảng trắng, q hoa/thường |
| F03-DL-09 | BR-9, BR-6 | Đạt | PW: F03-DH-10 / DL-09 · đổi dạng giữ từ khoá, chip, trang, thứ tự; địa chỉ không đổi |
| F03-DL-10 | BR-9 | Đạt | PW: F03-DL-08/10 · q có <script>, q 5.000 ký tự, q chỉ khoảng trắng, q hoa/thường |
| F03-DL-11 | BR-9 (kiểm hành vi) | Ghi nhận | Ghi bằng thay thế: `history.length` = 2 sau khi gõ + sang trang 2; "Quay lại" rời trang, không lùi từng bộ lọc |
| F03-DL-12 | BR-9 | Đạt | PW F03-TK-17: bấm ✕ trong ô → địa chỉ bỏ `q` và `trang` |
| F03-DL-13 | BR-9 | Đạt | PW: F03-DL-13 · locale en-US/ja-JP cho cùng kết quả |
| F03-NB-01 | AC-20 | Đạt | PW: F03-NB-01/05 · nguồn Mẫu: "Hiển thị 16/16", 2 trang (12, 4), chip = Tất cả + 5 lĩnh vực, đúng thứ tự (1280, 375) |
| F03-NB-02 | AC-20 | Đạt | PW: F03-NB-02 · bỏ 1 dòng (mục duy nhất của Bảo trợ xã hội) → "Hiển thị 15/15", 2 trang (12, 3), chip Bảo trợ xã hội biến mất |
| F03-NB-03 | AC-20 | Đạt | PW `nhap-lai-pg.spec.ts` PG-0: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-NB-04 | AC-20 | Đạt | PW `nhap-lai-pg.spec.ts` PG-1: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-NB-05 | AC-20 (nguồn Mẫu) | Đạt | PW: F03-NB-01/05 · nguồn Mẫu: "Hiển thị 16/16", 2 trang (12, 4), chip = Tất cả + 5 lĩnh vực, đúng thứ tự (1280, 375) |
| F03-NB-06 | AC-22 | Đạt | PW `nhap-lai-pg.spec.ts` PG-2: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-NB-07 | AC-20 | Đạt | PW `nhap-lai-pg.spec.ts` PG-7: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F03-DM-01 | AC-11, F04 AC-6 | Đạt | PW: F03-PO-33 / DC-13 / DM-01 · cùng một popup từ thẻ và từ dòng bảng (innerText giống nhau) |
| F03-DM-02 | AC-11, F04 AC-13 | Đạt | PW F04-PO-02/03/04/05: giữ `cap`, `lv`, thêm `ma`; đóng → bỏ `ma` |
| F03-DM-03 | AC-11, F06 AC-9 | Đạt | F06-PU-01/06: "Xem chi tiết" trong câu trả lời mở đúng popup (`ma=1.001193`), popup có z-index cao hơn khung, khung/nút Trợ lý `inert`; đóng → khung và hội thoại còn, con trỏ về nút đã bấm (PU-05). Lưu ý R1 (F06 test.md): hiếm khi popup không mở nếu vừa gõ ô tìm |
| F03-DM-04 | BR-5 | Đạt | F06-PU-01/16: Esc một lần chỉ đóng popup, khung trợ lý còn mở |
| F03-DM-05 | BR-5 | Đạt | PW F04-PO-01/10/13: `/thu-tuc?ma=` đúng một `role=dialog` |
| F03-DM-06 | F02 | Đạt | PW F02-BC-01/02: h1 → "Dịch vụ nhanh" → "Thủ tục thường gặp" → "Thời gian làm việc" |
| F03-DM-07 | AC-11 | Đạt | PW F02-BC-06/07/08 + F02-BN-05: lỗi một API chỉ ảnh hưởng khối của nó |
| F03-KS-01 | AC-12, C01 AC-2 | Đạt | PW: F03-KS-01 · kiosk: dạng thẻ, không cuộn ngang, thẻ xếp hàng đầy |
| F03-KS-02 | AC-4 | Đạt | F09-NV-10: Tab/Shift+Tab đi vòng qua các phần tử popup rồi "Bắt đầu lại" ở cuối vòng |
| F03-KS-03 | (axe) | Đạt | PW F03-TN-02 ở 1080×1920 (kiosk): axe 0 vi phạm cả popup đủ dữ liệu và "không tìm thấy" |
| F03-KS-04 | BR-8 | Đạt | PW: F03-DC-26 / KS-04 / AC-25 · kiosk 1080×1920: mở popup không thêm lịch sử; "Quay lại" KHÔNG đóng popup; ✕/Esc/vùng tối đóng và bỏ ma |
| F03-KS-05 | BR-4 | Đạt | F09-NH-09/31: dòng nhắc trong chân popup, một lần, trước liên kết Cổng DVC; bấm mở ngay tab mới |
| F03-KS-06 | BR-6 | Đạt | F09-KT-01: đồng hồ giả 15 phút — không cảnh báo, không đếm ngược, từ khoá, trang, popup còn nguyên |
| F03-BM-01 | plan §3.1, F08 BR-10 | Đạt | PW: F03-BM-01/02/05/07 · mã hợp lệ không tồn tại → 404 problem+json khong-tim-thay, không nhắc lại mã, không stack |
| F03-BM-02 | plan §3.1 | Đạt | Mọi mã sai: 404 `khong-tim-thay` (không 500, không phản chiếu). Ghi nhận: `%00` bị Kestrel từ chối 400 thân rỗng, không có header ứng dụng (xem G2) |
| F03-BM-03 | CLAUDE.md (không nối SQL) | Đạt | xUnit `BM03_MaSaiDinhDang_404_KhongLenhSql_BangNguyenVen` (8 giá trị SQL/đường dẫn/HTML/21 ký tự) trên PostgreSQL: 404, 0 lệnh SQL chạm `thu_tuc`, bảng còn 408 dòng, `1.001193` sau đó vẫn 200; PW BM-02…07 cho nhóm SQL qua HTTP |
| F03-BM-04 | plan §6 | Đạt | PW: F03-BM-02…07 · nhóm sai định dạng/độc hại: không 500, không phản chiếu, nosniff, không Set-Cookie, không Server |
| F03-BM-05 | plan §6 | Đạt | PW: F03-BM-01/02/05/07 · mã hợp lệ không tồn tại → 404 problem+json khong-tim-thay, không nhắc lại mã, không stack |
| F03-BM-06 | plan §6 | Đạt | PW: F03-BM-02…07 · nhóm sai định dạng/độc hại: không 500, không phản chiếu, nosniff, không Set-Cookie, không Server |
| F03-BM-07 | plan §3.1 | Đạt | PW: F03-BM-01/02/05/07 · mã hợp lệ không tồn tại → 404 problem+json khong-tim-thay, không nhắc lại mã, không stack |
| F03-BM-08 | plan §3.1 | Đạt | PW: F03-BM-08 · query lạ bị bỏ; HEAD 200; POST/PUT/DELETE/PATCH 405; OPTIONS không CORS |
| F03-BM-09 | plan §3.1, §6 | Đạt một phần | xUnit `ChiTietThuTucTests.QueryLa_KhongThoiCache…` và `Tra404_KhongBiCache…` đạt (backend-dev, tester rà). 1.000 mã lạ và bộ nhớ tiến trình: chưa đo |
| F03-BM-10 | plan §3.1 | Đạt | PW: F03-BM-10/14 · hai mã khác nhau trả khác nhau; tập khoá JSON đúng 14 khoá, null vẫn có mặt, không trường thừa |
| F03-BM-11 | CLAUDE.md (rate limit) | Đạt | Production HTTPS, một IP: 300 yêu cầu đầu 200, từ #301 429 `qua-nhieu-yeu-cau` + `Retry-After: 60`, ProblemDetails, không stack; HTML `/` vẫn 200 |
| F03-BM-12 | CLAUDE.md | Đạt | PW F03-PO-26/27/28 (429 giả → ErrorState, "Đóng", "Thử lại") + server thật bị 429: `/` vẫn mở |
| F03-BM-13 | CLAUDE.md > Header | Đạt | PW: F03-BM-13 (Development, HTTPS) · header trên HTML, API 200/404/304, tài nguyên tĩnh: CSP nguyên văn, nosniff, Referrer-Policy, Permissions-Policy, khô |
| F03-BM-14 | plan §3.1 | Đạt | PW: F03-BM-10/14 · hai mã khác nhau trả khác nhau; tập khoá JSON đúng 14 khoá, null vẫn có mặt, không trường thừa |
| F03-BM-15 | plan §6 | Đạt | PW: F03-DC-14 / BM-15 / AC-18, AC-28 · mã sai định dạng và độc hại: 0 yêu cầu chi tiết, 0 hộp thoại, 0 lỗi trang, chữ không hiện ra trang |
| F03-BM-16 | plan §6 | Đạt | PW: F03-BM-16 / BM-17 · P-D: HTML/script trong dữ liệu hiện nguyên văn dạng chữ, DOM không sinh thẻ, 0 hộp thoại |
| F03-BM-17 | plan §6 | Đạt | PW: F03-BM-16 / BM-17 · P-D: HTML/script trong dữ liệu hiện nguyên văn dạng chữ, DOM không sinh thẻ, 0 hộp thoại |
| F03-BM-18 | plan §6, CLAUDE.md | Đạt | PW: F03-BM-18/19/22 · 375px: 0 vi phạm CSP, 0 console.error, mọi request cùng gốc, storage chỉ có cach-xem |
| F03-BM-19 | CLAUDE.md > Tài nguyên tự host | Đạt | PW: F03-BM-18/19/22 · 375px: 0 vi phạm CSP, 0 console.error, mọi request cùng gốc, storage chỉ có cach-xem |
| F03-BM-20 | plan §6, CLAUDE.md | Đạt | PW: F03-LK-06/07/08/BM-20 · không "Nộp trực tuyến"; mọi href http chỉ dichvucong.gov.vn, không tên miền "Đã bỏ"; rel đủ; mã mã hoá URL |
| F03-BM-21 | CLAUDE.md > Không `dangerouslySetInnerHTML` | Đạt | `grep dangerouslySetInnerHTML\|innerHTML\|insertAdjacentHTML` trên `features/thu-tuc`, `danh-muc`, `trang-chu`, `core/components/{Select,Tabs,Tile}`: 0 kết quả; `npm run lint` sạch |
| F03-BM-22 | plan §6 | Đạt | PW: F03-BM-18/19/22 · 375px: 0 vi phạm CSP, 0 console.error, mọi request cùng gốc, storage chỉ có cach-xem |
| F03-BM-23 | CLAUDE.md > Mã nguồn | Đạt | Bản build + publish: 0 `.map`, 0 `.pdb`, 0 `.xml`, 0 `sourceMappingURL`; 0 `console`/`debugger`; tên hàm dự án (`laMaHopLe`, `linkDvc`, `useMoThuTuc`, …) không còn trong chunk (đã obfuscate) |
| F03-BM-24 | plan §3.1 (mơ hồ) | Ghi nhận | Tình huống không thể xảy ra trên PostgreSQL: ràng buộc `ck_thu_tuc_danh_muc` từ chối thủ tục không thuộc cấp nào (xUnit `BM24…`). Nguồn Mẫu: `DanhMucServiceTrenMau.ThuTucKhongThuocCapNao_KhongTraRa` (backend-dev). Chi tiết theo mã không lọc theo cấp |
| F03-BM-25 | CLAUDE.md > Dữ liệu | Đạt | Lượt 2: gửi `/api/thu-tuc/0912345678`, `/a@b.test`, `/<script>…`, `?q=0912345678&email=a@b.test` lên Production: log lỗi 4xx chỉ có `HTTP 404 GET /api/thu-tuc/{ma}` hoặc `route-khong-ton-tai`; không query, không chuỗi người dùng, không chuỗi kết nối. L2 đã sửa |
| F03-BM-26 | CLAUDE.md > Thư viện | Đạt một phần | `npm audit --omit=dev`: 0 lỗ hổng; `dotnet list package --vulnerable --include-transitive`: không có. "F03 không thêm gói" không đối chiếu được với trước F03 (FE chưa commit); plan §1 nói không thêm |
| F03-BM-27 | plan §6 (lỗi) | Đạt | xUnit `HD10_PostgreSqlKhongToiDuoc…`: 500 `loi-he-thong` + `maTraCuu`, thân không có chuỗi kết nối/tên máy/stack; PW F03-PO-26: popup ErrorState |
| F03-TN-01 | C01 AC-4 | Đạt | PW: F03-TN-01 · axe 375px: khối thường gặp (thẻ/bảng) 0 vi phạm |
| F03-TN-02 | C01 AC-4 | Đạt | Lượt 2: axe 0 vi phạm ở popup đủ dữ liệu và "không tìm thấy" tại 375, 768, 1280 (và kiosk). L1 (`scrollable-region-focusable`) đã sửa; lỗi `color-contrast` chập chờn ở 1280 ở lượt đầu do đo giữa lúc popup đang hiện dần → chờ 300 ms |
| F03-TN-03 | AC-4, C01 AC-1 | Đạt một phần | Đã thử bàn phím trong popup (Tab vòng, Esc trả con trỏ); thứ tự Tab của cả trang đo ở F04-TN-03 và F02-BC-10 |
| F03-TN-04 | C01 BR-9 | Đạt | PW: F03-DC-28 / TN-03/04 · bàn phím: Enter mở, con trỏ vào popup, Tab đi vòng trong popup, Esc đóng và trả con trỏ; aria dialog |
| F03-TN-05 | WCAG 2.5.3 | Đạt | Tên đọc "Xem chi tiết <tên thủ tục>" duy nhất cho mọi thẻ, chứa chữ nhìn thấy "Xem chi tiết" (WCAG 2.5.3) |
| F03-TN-06 | C01 BR-3 | Đạt | Liên kết Cổng DVC: tên đọc "Xem và nộp trên Cổng DVC (mở trang mới)", bắt đầu bằng chữ nhìn thấy |
| F03-TN-07 | C01 BR-4 | Chờ | Thử tay NVDA (vùng thông báo số kết quả). PW: con trỏ vẫn ở ô tìm khi lọc (TK-11/12 đạt) |
| F03-TN-08 | C01 BR-5, BR-6 | Chờ | Thử tay NVDA/TalkBack (trạng thái chọn của chip và dạng xem). PW: `aria-pressed` đúng (TK-19) |
| F03-TN-09 | C01 AC-3 | Chờ | Nhìn tay chế độ đen trắng. PW: chip chọn có `aria-pressed`, nhãn Toàn trình/Một phần luôn có chữ |
| F03-TN-10 | WCAG 1.4.10 | Đạt | PW: F03-PO-21 / TN-10 · P-E (tên 300 ký tự, phí 1.700, bước 9,3 KB, 100 giấy tờ) ở 375 và 1280: không cuộn ngang, đủ 100 giấy tờ |
| F03-TN-11 | WCAG 1.4.12 | Đạt | PW: F03-TN-11 · giãn chữ (WCAG 1.4.12): thẻ và popup không tràn |
| F03-TN-12 | C01 AC-23 | Đạt một phần | Đã thử `prefers-reduced-motion: reduce`: animation/transition = 0s, mở/đóng không lỗi. Bình thường ≤ 150 ms: chưa đo |
| F03-TN-13 | AC-6 | Chờ | Thử tay trình đọc màn hình (mục Căn cứ pháp lý). PW PO-14: 0 `a/button/[tabindex]`, Tab nhảy qua |
| F03-TN-14 | BR-3 | Chờ | Thử tay NVDA |
| F03-TN-15 | WCAG 1.4.3 | Đạt | axe `wcag2aa` (gồm `color-contrast`) 0 vi phạm ở khối (TN-01) và popup (TN-02 chỉ lỗi `scrollable-region-focusable`, không có `color-contrast`) |
| F03-TN-16 | WCAG 2.5.8 / C01 AC-2 | Đạt | Mọi vùng bấm ≥ 24×24 (C01 AC-2): "Xem chi tiết" 302×34, liên kết Cổng DVC 302×34, chip 65×28, trang 34×34, ✕ ≥ 24. Chưa đạt 44×44 (mục tiêu phụ của testcases) |
| F03-TN-17 | AC-4 | Chờ | Thiết bị iOS/Android thật |
| F03-HN-01 | F00 BR-9, plan §5 | Đạt | Bảng ở phần Hiệu năng: `/` 375 px 173,1 KiB đầu · 180,3 KiB sau 3,5 s; 1280 px 183,6 · 190,7 KiB (≤ 200). Chunk TrangChu 10,5 KiB; không vượt 30 KiB |
| F03-HN-02 | plan §5 | Đạt | PW: F03-HN-02/14 / PO-32 · mở "/" ở 375: không tải chunk popup/grid ngay, không ảnh/font do khối; ~2 giây sau mới nạp trước popup |
| F03-HN-03 | F00 BR-9 | Đạt | Lighthouse mobile `/` (publish Production, 3 lần): 94 · 95 · 95; CLS 0; LCP 2,47–2,49 s; TBT 110–170 ms; không tải font |
| F03-HN-04 | F00 BR-9 | Đạt | Lighthouse mobile `/thu-tuc`: 94 · 95 · 93; CLS 0 |
| F03-HN-05 | plan §5 | Đạt | Lighthouse mobile `/?ma=1.001193`: 95 · 97 · 97; CLS 0; LCP 2,2–2,6 s |
| F03-HN-06 | plan §5 (CLS) | Đạt | PW: F03-HN-06 · CLS khi /api/thu-tuc trễ 5 giây (375px) < 0,1 |
| F03-HN-07 | F00 BR-9, plan §5 | Đạt | curl 100 lần HTTPS (gồm bắt tay TLS): nguồn Mẫu 1.013229 p50 22,4 · p95 44,2 ms; 1.001193 p95 41,3 ms; PostgreSQL (Kestrel thật) p95 26,1 · 24,4 ms |
| F03-HN-08 | F00 BR-9 | Đạt | xUnit trên PostgreSQL, 100 lần: 1.013229 lỡ cache p50 1,9 · p95 3,2 ms, trúng cache p95 1,7 ms; 1.001193 lỡ cache p95 6,4 ms, trúng cache p95 1,1 ms |
| F03-HN-09 | plan §5 | Đạt | xUnit: trúng cache 1 lệnh SQL (phiên bản dữ liệu); lỡ cache 3 lệnh (phiên bản + thủ tục theo khoá + tên lĩnh vực). Lệnh dọn câu chưa trả lời lúc khởi động host không tính |
| F03-HN-10 | plan §2 | Đạt | 1.013229: 55.010 B thô (≤ 56 KB), Brotli 4.974 B; 1.001193: 25.492 B thô, Brotli 6.990 B (kế hoạch ~3 KB nén: lớn hơn nhưng trong ngân sách). Lần trả đầu sau khi cache mới (lỡ cache) nén kém hơn: 18.142 B so với 4.974 B — xem ghi nhận G3 |
| F03-HN-11 | F00 BR-9, F04 AC-4 | Đạt | PW: F03-HN-11 · lọc 43 mục khi gõ "dang ky the chap" ở 375: phím cuối → số đếm đổi, chậm nhất 10 lần (đã gồm debounce) |
| F03-HN-12 | plan §5 | Đạt | PW: F03-HN-12 · gõ, đổi chip, đổi trang: 0 yêu cầu mạng |
| F03-HN-13 | plan §5 | Đạt | PW F02-HN-08/13 và F04-HN-13: `/` chỉ gọi `/api/trung-tam` (1 lần), `/api/thu-tuc`, `/api/linh-vuc`; yêu cầu chậm nhất 239–318 ms (< 0,6 s) ở localhost; F04-HN-14: về `/thu-tuc` trong 60 s không tải lại |
| F03-HN-14 | plan §5 | Đạt | PW: F03-HN-02/14 / PO-32 · mở "/" ở 375: không tải chunk popup/grid ngay, không ảnh/font do khối; ~2 giây sau mới nạp trước popup |
| F03-HN-15 | plan §4.2 | Đạt | PW: F03-HN-15 · 50 lần mở/đóng popup liên tiếp: số nút DOM, trình nghe sự kiện, heap không tăng đều |
| F03-HN-16 | AC-3 | Đạt | PW: F03-HN-16 · mở popup khi chunk đã nạp trước: từ lúc bấm đến khi dialog có trong DOM |
| F03-HD-01 | F00 §9 | Đạt | xUnit `HD01_408Ma_NguonMauVaPostgreSql_CungJsonTungByte` và `Http_HD01_TatCa408Ma_VaHaiDanhMuc…`: 408 mã + 2 danh mục, thân HTTP giống từng byte |
| F03-HD-02 | plan §7 | Đạt | Contract `MaSaiDinhDang_TraNull_VaKhongTruyVanNguon`, `MaKhongCoTrongDuLieu_TraNull`, `NguonRong_TraNull` đạt trên cả nguồn Mẫu và PostgreSQL |
| F03-HD-03 | plan §3.1, rủi ro 3 | Đạt | xUnit `HD03_Jsonb_ThuTuPhanTuGiuNguyen…` và contract `TrinhTuGiayToCanCuCachThuc_GiuNguyenThuTuLuu` trên PostgreSQL; thủ tục lớn nhất bộ nhúng khớp số phần tử |
| F03-HD-04 | plan §3.1 (thời hạn) | Đạt | Contract `ThoiHanThuTucKhongRo…`, `KhongCoThoiHanRo_ThoiHanLaNull` (Khác / 1 Khác / "  3  KHÁC ") đạt trên PostgreSQL |
| F03-HD-05 | plan §3.1 (R2) | Đạt | Contract `GoiHaiLan_CungKetQua_VaKhongDoiDoiTuongCuaNguon` đạt trên PostgreSQL |
| F03-HD-06 | F00 BR-10, F01 | Đạt | xUnit `HD07_SauNhapLai…` (ETag đổi, `If-None-Match` cũ → 200 không 304, phí mới ngay) + PW PG-1/PG-3 với công cụ nhập thật |
| F03-HD-07 | F00 §9, F04 | Đạt | xUnit `HD01_DichVu…` và `Http_HD01_HaiApi…`: `thuTuThuongGap` (16 mục) cùng thứ tự, mảng theo `thu_tuc` giống từng byte |
| F03-HD-08 | F00 §9 | Đạt | 37 ca PW dữ liệu thật (NB, TK-03, TAB-03, LK, BM, DC-21, PO-05, HD…) chạy lại trên API nguồn PostgreSql (đã nhập bằng công cụ nhập thật): 37/37 đạt |
| F03-HD-09 | F00 BR-16 | Đạt | API nguồn Mẫu (Production) giữ 408 thủ tục trong khi DB PostgreSQL đã nhập lại nhiều lần (409 thủ tục): chế độ Mẫu không có đường nhập |
| F03-HD-10 | plan §3.1 | Đạt | xUnit `HD10_PostgreSqlKhongToiDuoc…`: 500 `loi-he-thong`; nguồn Mẫu vẫn 200; bản publish nối DB hỏng: `/api/trung-tam` 500 sau 3,1 s |

## Bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Header trên HTML (`/`, `/?ma=1.001193`, `/thu-tuc`, `/linh-vuc`, 404), API (`/api/thu-tuc/1.001193` 200 và HEAD, `/api/thu-tuc/9.999999` 404, 304 với `If-None-Match`, `/api/thu-tuc`, `/api/linh-vuc`, `/api/trung-tam`) và tài nguyên tĩnh — HTTPS Production | Đạt: CSP đúng nguyên văn `CLAUDE.md`, `Strict-Transport-Security`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; không `Server`, không `X-Powered-By`; API 200 có `ETag` + `Cache-Control: no-cache` (404 chi tiết không có, đúng: không cache 404). HTTP `:5299` → 307 HTTPS |
| Header khi Kestrel từ chối từ tầng giao thức | Ghi nhận G2: `GET /api/thu-tuc/%00` trả 400 thân rỗng, không có header ứng dụng (chỉ `Content-Length`, `Connection`, `Date`); không có `Server`, không phản chiếu gì. `%0a`, `%09`, `%20` cũng 400 nhưng đã qua pipeline (đủ header, ProblemDetails) |
| Mã thủ tục lạ/độc hại cho `GET /api/thu-tuc/{ma}` (30 giá trị: SQL, đường dẫn, HTML, điều khiển, Unicode, percent hỏng, 21/5.000 ký tự) | Đạt: toàn 404 `khong-tim-thay` (một số 400 do Kestrel), không 500, không phản chiếu chuỗi, `nosniff`, không `Set-Cookie`; `1.001193/` trả đúng chi tiết 1.001193, `1.001193.json` 404; chữ số rộng/Ả Rập/U+200B không khớp |
| Không nối SQL (PostgreSQL) | Đạt: 8 giá trị SQL/đường dẫn/HTML → 404, **0 lệnh SQL chạm `thu_tuc`**, bảng còn 408 dòng, chi tiết sau đó vẫn 200 |
| Thân JSON chỉ có trường cần dùng | Đạt: đúng 14 khoá (và khoá con `cachThuc` 4, `trinhTu` 2, `thanhPhanHoSo` 3, `canCu` 2); null vẫn có mặt; không `thuTu`, `trangThaiCongBo`, `maDvc`, `donVi*`, `tenTimKiem`, cờ cấp |
| Phương thức, CORS | Đạt: POST/PUT/DELETE/PATCH 405 `phuong-thuc-khong-hop-le`; OPTIONS (Origin lạ) không `Access-Control-Allow-Origin` |
| Rate limiting (Production, một IP, 300/phút) | Đạt: 300 yêu cầu đầu 200, từ #301 429 `qua-nhieu-yeu-cau` + `Retry-After: 60`, ProblemDetails, không stack; `/` HTML vẫn 200; FE hiện ErrorState nhã nhặn (PO-27) |
| Gửi 501 ký tự / gửi dồn quá giới hạn vào API trợ lý | Chờ F06 |
| Console không lỗi CSP, không `console.error`, không request ra tên miền ngoài | Đạt ở 375 và 1280 (luồng: mở, tìm, chip, đổi dạng, trang 2, popup, Quay lại, mã lạ) |
| Link ngoài | Đạt: mọi `a[target=_blank]` có `rel="noopener noreferrer"`; `href` ngoài chỉ `dichvucong.gov.vn`; không tên miền "Đã bỏ"; mã qua `encodeURIComponent` (`%26`, `%20`, `%2F`, `%23`) |
| XSS: HTML/`<script>`/`javascript:` trong dữ liệu (bộ P-D), trong ô tìm, trong `?q=`, `?ma=`, `?lv=` | Đạt: hiện nguyên văn dạng chữ; không `<script>/<img>/<b>/<a>` sinh ra; 0 hộp thoại; 0 lỗi trang; chuỗi trên địa chỉ không lọt vào `document.title` hay `body` |
| Lưu trữ phía trình duyệt | Đạt: `localStorage` chỉ có `cach-xem`; `sessionStorage` chỉ có `react-router-scroll-positions` (số vị trí cuộn, của React Router) và `kiosk` ở chế độ kiosk; không cookie; từ khoá không rời trình duyệt (0 yêu cầu khi gõ) |
| Mã nguồn bản build/publish | Đạt: 0 `.map`, 0 `.pdb`, 0 `.xml`, 0 `sourceMappingURL`, 0 `console`/`debugger`; tên hàm dự án đã đổi (obfuscate) |
| Chuỗi kết nối | Đạt: không có trong `wwwroot`, bản publish, response lỗi, log (thử mật khẩu giả `BI-MAT-THU-123`: 0) |
| Log ứng dụng | **Trượt (L2)**: query string không ghi, nhưng log lỗi 4xx ghi nguyên đường dẫn do client gửi (kể cả `{ma}` giống số điện thoại/email); xuống dòng đã thay bằng `?`, cắt 200 ký tự |
| `npm audit --omit=dev`, `dotnet list package --vulnerable --include-transitive` | 0 lỗ hổng; không gói nào |

## Hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu, `/` ở 375 px (gzip -9, tổng mọi `.js`) | **173,1 KiB** lúc tải đầu · **180,3 KiB** sau 3,5 s (chunk popup nạp trước) | ≤ 200 KB |
| JS tải ban đầu, `/` ở 1280 px | **183,6 KiB** · **190,7 KiB** (= 195,3 kB) sau 3,5 s; `/?ma=1.001193` 190,7 KiB | ≤ 200 KB |
| Chunk (gzip KiB) | vendor 120,0 · index 26,1 · useDanhSachUrl 11,5 · TrangChu 10,5 · grid 8,3 (chỉ ≥ 1024 px) · PopupChiTiet 7,1 · IconButton 3,0 · BangDuLieu 2,2; trước F03 (F08) 143,6 KiB cho `/` | TrangChu < 30 KB (rủi ro 2) |
| Chunk popup/grid không nằm trong phần tải ban đầu ở 375 | Đạt (popup nạp trước ~2 s sau khi danh sách vẽ; không `modulepreload`) | plan §5 |
| Lighthouse mobile `/` (publish Production, 3 lần) | **94 · 95 · 95**; FCP 1,9 s; LCP 2,47–2,49 s; TBT 110–170 ms; **CLS 0**; Accessibility 100 | ≥ 85, CLS < 0,1 |
| Lighthouse mobile `/thu-tuc` (3 lần) | **94 · 95 · 93**; LCP 2,36–2,40 s; TBT 130–210 ms; CLS 0 | ≥ 85, CLS < 0,1 |
| Lighthouse mobile `/?ma=1.001193` (3 lần) | **95 · 97 · 97**; LCP 2,2–2,6 s; TBT 20–30 ms; CLS 0 | ≥ 85 (ghi nhận) |
| CLS khi `/api/thu-tuc` trễ 5 s (PW) | 375 px **0,001** · 1280 px **0,000** | < 0,1 |
| AC-3: "Xem chi tiết" → popup, 4G giả lập (1,6 Mbps, trễ 150 ms), API thật, 10 lần mỗi mã, chậm nhất | 1.001193: dialog **328 ms**, đủ nội dung **563 ms**; 1.013229 (lớn nhất): dialog **319 ms**, đủ nội dung **523 ms** | ≤ 1 s |
| Mở popup khi chunk đã nạp trước (không mạng) | 6–8 ms (lần đầu 309 ms) | ghi nhận |
| P-E (tên 300 ký tự, bước 9,3 KB, 100 giấy tờ) mở popup | 375 px 256 ms · 1280 px 202 ms (gồm tải trang) | ≤ 1 s |
| Lọc 43 mục khi gõ (phím cuối → số đếm đổi), 10 lần, 375 px | 28–37 ms (chậm nhất **37 ms**) | ≤ 200 ms |
| Dán 5.000 ký tự vào ô tìm (375 px) | kết quả sau 47 ms | không treo |
| Rò rỉ khi mở/đóng popup 50 lần (CDP) | nút DOM 1996 → 1996; trình nghe sự kiện 359 → 359; heap 6,3 → 7,1 MiB | không tăng đều |
| p95 `GET /api/thu-tuc/{ma}`, 100 lần, Kestrel thật | Nguồn Mẫu (HTTPS, gồm TLS) 1.013229 p50 22,4 · **p95 44,2** · max 54,9 ms; 1.001193 p95 **41,3** ms. PostgreSQL 1.013229 p50 15,9 · **p95 26,1** · max 213 ms (một lần đầu); 1.001193 p95 **24,4** ms | ≤ 300 ms |
| p95 trong tiến trình xUnit (PostgreSQL, 100 lần) | lỡ cache 1.013229 p95 3,2 ms, 1.001193 6,4 ms; trúng cache 1,7 / 1,1 ms | ≤ 300 ms |
| p95 `/api/thu-tuc`, `/api/linh-vuc`, `/api/trung-tam` (100 lần) | Mẫu 189,5 · 46,2 · 50,7 ms (lần đầu 432 ms); PostgreSQL 26,3 · 26,0 · 27,1 ms | ≤ 300 ms |
| Số lệnh SQL mỗi yêu cầu chi tiết | trúng cache 1; lỡ cache 3 | trúng ≤ 1, lỡ ≤ 3 |
| Kích thước chi tiết | 1.013229: 55.010 B thô, Brotli 4.974 B (18.142 B ở lần lỡ cache đầu); 1.001193: 25.492 B thô, Brotli 6.990 B (8.682 B lần đầu) | ≤ 56 KB thô |
| Yêu cầu mạng khi mở `/` (localhost, 375 px) | chỉ `/api/trung-tam` (1 lần), `/api/thu-tuc`, `/api/linh-vuc`; chậm nhất 239 ms; DCL 332 ms; LCP 556 ms | mỗi yêu cầu < 0,6 s |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Đã sửa (lượt 2, 2026-10-13) | **L1** Thân popup có thể cuộn nhưng không nhận con trỏ bàn phím: axe `wcag2a` `scrollable-region-focusable` ở phần tử `._than_…` của `Modal` khi nội dung dài (đủ dữ liệu), ở 375, 768, 1280 px (kiosk 1080×1920 không vì nội dung không tràn). Vi phạm tiêu chí axe 0 của C01 AC-4 và F03-TN-02 | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts thu-tuc-thuong-gap --project=chromium -g "F03-TN-02"`; hoặc mở `/?ma=1.001193` ở 375×812, chạy axe → `scrollable-region-focusable`. Gợi ý: cho vùng cuộn `tabIndex={0}` + tên (`aria-labelledby` tiêu đề) hoặc có phần tử focus được trong thân | ui-core-dev (`src/FrontEnd/src/core/components/Modal`) |
| Đã sửa (lượt 2, 2026-10-13) | **L2** Log lỗi 4xx (`DichVuCong.Api.Errors`) ghi nguyên đường dẫn do client gửi, gồm đoạn `{ma}`: vd. `HTTP 404 GET /api/thu-tuc/0912345678`, `…/a@b.test`, `…/<script>alert(1)<%2Fscript>`. Query string không ghi; ký tự điều khiển đã thay bằng `?` và cắt 200 ký tự. `CLAUDE.md` cấm log chứa dữ liệu cá nhân; mã đúng định dạng không lộ gì, nhưng link sai (số điện thoại/email dán vào đường dẫn) sẽ vào log. Gợi ý: ghi mẫu route (`/api/thu-tuc/{ma}`) hoặc băm | `curl -sk "https://localhost:7157/api/thu-tuc/0912345678"` rồi đọc log của API | backend-dev (`src/BackEnd/DichVuCong.Api/Common/Errors/NhatKy.cs` và nơi gọi) |
| Góp ý | **G1** Giá trị `mucDo` lạ (API giả `"khac"`) làm nhãn hiện khoá i18n thô `muc-do.khac` ở thẻ và popup (``t(`muc-do.${mucDo}`)`` không có dự phòng). Không xảy ra với API thật (BE chỉ trả `toan-trinh`/`mot-phan`) | PW F03-PO-24 (log nhãn hiển thị) | frontend-dev (`features/thu-tuc/ThuTucCard.tsx`, `ChiTietThuTuc.tsx`) |
| Góp ý | **G2** `%00` (và chuỗi Kestrel từ chối ở tầng giao thức) → 400 thân rỗng **không có header ứng dụng** (CSP, nosniff, …). Thân rỗng nên không có bề mặt tấn công; `CLAUDE.md` yêu cầu header trên mọi response | `curl -sk -i --path-as-is "https://localhost:7157/api/thu-tuc/%00"` | backend-dev (cân nhắc, có thể chấp nhận) |
| Góp ý | **G3** Lần trả đầu sau khi cache được tạo nén kém: 1.013229 18.142 B thay vì 4.974 B (Brotli); `/api/thu-tuc` 71.211 B thay vì 37.250 B. Chỉ lần đầu của mỗi mục cache | `curl -sk -H "Accept-Encoding: br" -o NUL -w "%{size_download}\n" https://localhost:5443/api/thu-tuc/1.013229` (lần 1 so lần 2) | backend-dev (`Common/Caching`, nén) |

## Mơ hồ và hành vi ghi nhận

- AC-5 ("ở 1280 chuyển sang bảng"): 1280 mặc định đã là bảng; ca DH-06/07 chứng minh việc nhớ lựa chọn bằng cách chọn dạng ngược mặc định rồi tải lại.
- Tìm theo mã một phần (TK-07, AC-28): "1.0011" ra 1.001193; "9.3" khớp mọi mã chứa đoạn đó (so khớp chuỗi con trên mã).
- Quay lại sau khi lọc/sang trang không có popup (DL-11): `history.length` = 2, ghi bằng thay thế nên "Quay lại" rời trang, không lùi từng bộ lọc (đúng BR-9; F04 AC-19 nêu rõ).
- Kiosk (AC-25): `?kiosk=1` bị xoá khỏi địa chỉ sau khi đọc (cờ lưu `sessionStorage`); ca kiểm class `html.kiosk`, không kiểm `kiosk` trên URL.
- BM-24: thủ tục không thuộc cấp nào không tồn tại được trong PostgreSQL (ràng buộc DB); nguồn Mẫu có xử lý riêng.
- WebKit (Playwright) không trả con trỏ về nút đã mở sau khi đóng popup (DC-31); trình duyệt thật cần thử tay.
- Vùng bấm: "Xem chi tiết" 302×34, chip 65×28, trang 34×34 ở 375 px — đạt ≥ 24×24 (C01 AC-2/WCAG 2.5.8), chưa đạt 44×44 của testcases (mục tiêu phụ).

## Ca Chờ và chưa chạy

- **F03-TK-16** — Thử tay Unikey Telex/VNI thật. Mô phỏng gõ nhanh + IME qua CDP ở F04-TK-12 đạt
- **F03-LK-11** — Chờ F09 (dòng nhắc đăng xuất)
- **F03-LK-12** — Chờ F06 (trợ lý)
- **F03-DC-27** — Chờ F09 ("Bắt đầu lại")
- **F03-DM-03** — Chờ F06
- **F03-DM-04** — Chờ F06
- **F03-KS-02** — Chờ F09 ("Bắt đầu lại" cuối vòng Tab)
- **F03-KS-05** — Chờ F09
- **F03-KS-06** — Chờ F09 (không tự làm mới/cảnh báo)
- **F03-TN-07** — Thử tay NVDA (vùng thông báo số kết quả). PW: con trỏ vẫn ở ô tìm khi lọc (TK-11/12 đạt)
- **F03-TN-08** — Thử tay NVDA/TalkBack (trạng thái chọn của chip và dạng xem). PW: `aria-pressed` đúng (TK-19)
- **F03-TN-09** — Nhìn tay chế độ đen trắng. PW: chip chọn có `aria-pressed`, nhãn Toàn trình/Một phần luôn có chữ
- **F03-TN-13** — Thử tay trình đọc màn hình (mục Căn cứ pháp lý). PW PO-14: 0 `a/button/[tabindex]`, Tab nhảy qua
- **F03-TN-14** — Thử tay NVDA
- **F03-TN-17** — Thiết bị iOS/Android thật
