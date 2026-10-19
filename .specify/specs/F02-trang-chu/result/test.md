ĐẠT

# F02 · Trang chủ — kết quả kiểm thử (T08, T10)

## Lượt xác nhận (2026-10-14)

- **Kết luận: vẫn ĐẠT** — không ca nào đổi kết quả. `trang-chu.spec.ts` **68 đạt** (1 bỏ qua: F02-HD-10 cần DB hỏng); `nhap-lai-pg` (F02 AC-3/AC-7) chạy riêng với PostgreSQL: 9/9.
- Hai ca đã chỉnh vì chân trang chỉ hiện khi hết khung chờ (xem N1 ở `F08-khung-trang/result/test.md`): F02-BN-06 (không đòi chân trang trong lúc chờ), F02-BC-01… (chờ chân trang hiện rồi mới đọc địa chỉ/điện thoại/email). CLS: `/` **0,0000–0,0163** ở 375/768/1280/kiosk, API tức thì và trễ 3 s; Lighthouse mobile `/` **96 · 96 · 96**; JS ban đầu `/` 184,9 KiB (375), 195,3 KiB (1280, sát trần 200).
- Số ca và ca Chờ không đổi (3 ca Chờ: NVDA/TalkBack DV-16, TN-06; ảnh banner BN-08).

- Ngày chạy: 2026-10-13. Người chạy: tester. T08 (khi chưa ghép F03) và T10 (khối thường gặp đã ghép, F03 T07) gộp thành một lượt vì F03 đã xong trước khi chạy: mọi số đo hiệu năng ở dưới là **đã có khối thường gặp**.
- **Kết luận (lượt 1): CHƯA ĐẠT** — F02-HN-05 trượt (CLS 0,298, lỗi L1). **Lượt 2 (2026-10-13): ĐẠT** — L1 đã sửa (CLS tối đa 0,008), không ca trượt; xem mục "Chạy lại 2026-10-13".
- Số ca (167) sau lượt 2: Đạt **158** · Đạt một phần **4** · Trượt **0** · Ghi nhận **2** · Chờ **3** · Chưa chạy **0** (tổng 167). Trước lượt 2: Đạt 154 · Trượt 1 · Chờ 6.
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn 3 ca Chờ (thử tay NVDA/TalkBack DV-16, TN-06; ảnh banner BN-08 chưa có task). Đổi sang `xong` khi các ca Chờ đạt.
- Spec đã thêm BR-9…BR-11 và AC-10…AC-13 sau khi viết `testcases.md`; ánh xạ ở "Cập nhật T10" cuối `testcases.md`.

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

- File e2e mới: `e2e/trang-chu.spec.ts` (69 ca) + `nhap-lai-pg.spec.ts` (PG-4/5/6 = F02 AC-3, AC-7, GD-11, HD-04/05/06); `e2e/du-lieu/trang-chu.ts` (bộ TT-A…D, G1…G9, O6g, O7, OE).
- Giả thời gian: `page.clock.install({ time })` đặt **trước** `page.goto`; múi giờ máy qua `browser.newContext({ timezoneId })` (8 múi giờ: `Asia/Ho_Chi_Minh`, `UTC`, `America/New_York`, `America/Los_Angeles`, `Pacific/Auckland`, `Pacific/Kiritimati`, `Asia/Kolkata`, `Pacific/Pago_Pago`); 16 mốc UTC I1…I16 của `testcases.md`; ranh giới 06:59/07:00/11:29/11:30/13:29/13:30/16:59/17:00 và nửa đêm.

## Bảng ca

| Case | AC | Kết quả | Ghi chú |
|---|---|---|---|
| F02-DV-01 | AC-1, BR-4 | Đạt | PW: F02-DV-01/02/04 (AC-1) · 1280px: 6 ô đúng tên và thứ tự; bấm "Tra cứu hồ sơ" mở tab mới đúng địa chỉ, rel đủ, opener null |
| F02-DV-02 | AC-1, C01 BR-3 | Đạt | PW: F02-DV-01/02/04 (AC-1) · 1280px: 6 ô đúng tên và thứ tự; bấm "Tra cứu hồ sơ" mở tab mới đúng địa chỉ, rel đủ, opener null |
| F02-DV-03 | AC-1 | Đạt | PW: F02-DV-03 · Tab tới ô "Tra cứu hồ sơ", Enter mở tab mới đúng địa chỉ |
| F02-DV-04 | AC-6, BR-1 | Đạt | PW: F02-DV-01/02/04 (AC-1) · 1280px: 6 ô đúng tên và thứ tự; bấm "Tra cứu hồ sơ" mở tab mới đúng địa chỉ, rel đủ, opener null |
| F02-DV-05 | AC-6 | Đạt | PW: F02-DV-05/06 · dữ liệu thật (nguồn Mẫu): 6 ô theo lien-ket.md §1; 4 địa chỉ đúng; bấm từng ô mở tab mới đúng địa chỉ; không tên miền "Đã bỏ" |
| F02-DV-06 | AC-6, BR-6 | Đạt | PW: F02-DV-05/06 · dữ liệu thật (nguồn Mẫu): 6 ô theo lien-ket.md §1; 4 địa chỉ đúng; bấm từng ô mở tab mới đúng địa chỉ; không tên miền "Đã bỏ" |
| F02-DV-07 | AC-3, BR-1 | Đạt | PW `nhap-lai-pg.spec.ts` PG-4: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F02-DV-08 | AC-3 | Đạt | PW: F02-DV-08/09 (AC-3) · O7 hiện 7 ô, ô thứ 7 ở cuối mở tab mới; màu/biểu tượng theo khoá khi đổi vị trí |
| F02-DV-09 | AC-3, plan §4.5 | Đạt | PW: F02-DV-08/09 (AC-3) · O7 hiện 7 ô, ô thứ 7 ở cuối mở tab mới; màu/biểu tượng theo khoá khi đổi vị trí |
| F02-DV-10 | AC-3 (biên) | Đạt | PW: F02-DV-10/21/23 / AC-13 · bieuTuong lạ → biểu tượng mặc định không lỗi; oDichVu [] → không lưới, không ErrorState; moTa không hiện ở đâu |
| F02-DV-11 | AC-8, BR-4 | Đạt | Ô không link cùng rộng với ô có link; cao chênh 3,2 px ở 375 (104,4 vs 107,6) do dòng "Trang ngoài" — 0 ở 1280 (125,8 đều). Cosmetic, xem G2 |
| F02-DV-12 | AC-8 | Đạt | PW: F02-DV-11…15 (AC-8) · 1280px: hai ô không link cùng kích thước, không viền nét đứt/mờ/ghi chú, bấm không làm gì, Tab bỏ qua, không phải link |
| F02-DV-13 | AC-8 | Đạt | PW: F02-DV-11…15 (AC-8) · 1280px: hai ô không link cùng kích thước, không viền nét đứt/mờ/ghi chú, bấm không làm gì, Tab bỏ qua, không phải link |
| F02-DV-14 | AC-8, C01 BR-12 | Đạt | PW: F02-DV-11…15 (AC-8) · 1280px: hai ô không link cùng kích thước, không viền nét đứt/mờ/ghi chú, bấm không làm gì, Tab bỏ qua, không phải link |
| F02-DV-15 | AC-8 | Đạt | PW: F02-DV-11…15 (AC-8) · 1280px: hai ô không link cùng kích thước, không viền nét đứt/mờ/ghi chú, bấm không làm gì, Tab bỏ qua, không phải link |
| F02-DV-16 | AC-8 | Chờ | Thử tay NVDA/TalkBack. PW: hai ô không phải `link`, không `tabindex` (DV-11…15 đạt) |
| F02-DV-17 | BR-4 (độc hại) | Đạt | 7 ô OE hiện như ô thường, không `<a>`; `HTTP://UPPER.example.test` được nhận (chuẩn hoá `http://upper.example.test/`); 0 hộp thoại |
| F02-DV-18 | BR-6 (ghi nhận) | Ghi nhận | F02 không có mã chặn tên miền "Đã bỏ" (plan §6): ô `https://motcua.tayninh.gov.vn` vẫn hiện. BR-6 là quy tắc về dữ liệu — F01 nên từ chối; đã kiểm dữ liệu thật ở DV-06 |
| F02-DV-19 | BR-4 (tên) | Đạt | PW: F02-DV-19 · tên 120 ký tự và có HTML: nguyên văn, tối đa 2 dòng, không làm lưới vỡ (375, 1280) |
| F02-DV-20 | C01 BR-12 | Đạt | Số cột: 375→2, 599→2, 600→3, 768→3, 1023→3, 1024→6, 1280→6, kiosk 1080→6; không cuộn ngang |
| F02-DV-21 | BR-1 | Đạt | PW: F02-DV-10/21/23 / AC-13 · bieuTuong lạ → biểu tượng mặc định không lỗi; oDichVu [] → không lưới, không ErrorState; moTa không hiện ở đâu |
| F02-DV-22 | BR-1 | Đạt | `grep "dichvucong.gov.vn\|cangiuoc\|tayninh"` trong `features/trang-chu`, `core` (không tính test): 0 địa chỉ ô dịch vụ; chỉ một chú thích |
| F02-DV-23 | plan §4.5 | Đạt | PW: F02-DV-10/21/23 / AC-13 · bieuTuong lạ → biểu tượng mặc định không lỗi; oDichVu [] → không lưới, không ErrorState; moTa không hiện ở đâu |
| F02-GL-01 | AC-2, BR-2 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-02 | AC-2 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-03 | AC-2 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-04 | AC-7, BR-7 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-05 | AC-7 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-06 | AC-7 | Đạt | PW: F02-GL-01…06 (AC-2, AC-7) · G1 và G2 ở các mốc I1…I5 |
| F02-GL-07 | AC-5, BR-3 | Đạt | PW: F02-GL-07/08/09/17 (AC-5) · ghi chú ngày nghỉ; 02/9/2026 10:00 vẫn "Đang"; không ghi chú thì không dòng; ngày lễ khác |
| F02-GL-08 | AC-5 | Đạt | PW: F02-GL-07/08/09/17 (AC-5) · ghi chú ngày nghỉ; 02/9/2026 10:00 vẫn "Đang"; không ghi chú thì không dòng; ngày lễ khác |
| F02-GL-09 | AC-5 (biên) | Đạt | PW: F02-GL-07/08/09/17 (AC-5) · ghi chú ngày nghỉ; 02/9/2026 10:00 vẫn "Đang"; không ghi chú thì không dòng; ngày lễ khác |
| F02-GL-10 | BR-2 | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-GL-11 | BR-7 | Đạt | PW: F02-GL-11/12 (BR-7) · G7 mỗi ngày một giờ; G8 chỉ chiều |
| F02-GL-12 | BR-7 | Đạt | PW: F02-GL-11/12 (BR-7) · G7 mỗi ngày một giờ; G8 chỉ chiều |
| F02-GL-13 | BR-2 | Đạt | PW: F02-GL-13 / TL-07 (AC-12, BR-10) · không có dòng giờ nào: ẩn cả khối, không chữ "Ngoài giờ làm việc"; ô dịch vụ và khối thường gặp vẫn hiện |
| F02-GL-14 | BR-2 (biên) | Đạt | G5: buổi hỏng bị bỏ, Thứ Hai chỉ còn "Buổi chiều 13:30 – 17:00", Thứ Bảy – Chủ nhật sáng; không "25:00/NaN/undefined"; nhãn và dòng giờ cùng nguồn |
| F02-GL-15 | BR-2 (nhất quán) | Đạt | PW: F02-GL-14/15 / TL-09 · G5 (buổi hỏng): bỏ buổi hỏng, không "25:00/NaN/undefined", ngày không còn buổi = nghỉ, nhãn và dòng giờ nhất quán |
| F02-GL-16 | BR-2 | Đạt | PW: F02-GL-16 · đồng hồ máy lệch 3 giờ: nhãn theo giờ của máy (hạn chế đã biết), trang không lỗi |
| F02-GL-17 | BR-3 | Đạt | PW: F02-GL-07/08/09/17 (AC-5) · ghi chú ngày nghỉ; 02/9/2026 10:00 vẫn "Đang"; không ghi chú thì không dòng; ngày lễ khác |
| F02-GL-18 | BR-2 | Đạt | Nhãn khớp giờ Việt Nam hiện tại (không giả đồng hồ) |
| F02-RG-01 | BR-2 (biên) | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-RG-02 | BR-2 (biên) | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-RG-03 | BR-2 (biên) | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-RG-04 | BR-2 (biên) | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-RG-05 | BR-2 (biên) | Đạt | PW: F02-GL-10 / RG-01…05 (AC-10) · ranh giới 06:59/07:00, 11:29/11:30, 13:29/13:30, 16:59/17:00 và nửa đêm |
| F02-RG-06 | BR-2 | Đạt | Vitest `gioLamViec.test.ts` + `useBayGio.test.ts`: 48/48 ở `TZ=Asia/Ho_Chi_Minh`, `America/Los_Angeles`, `Pacific/Auckland` |
| F02-MG-01 | AC-2 | Đạt | 48 tổ hợp (8 múi giờ × 6 mốc, G1/G2) đều đúng |
| F02-MG-02 | AC-2 | Đạt | PW: F02-MG-01…05 (AC-2, AC-7) · 8 múi giờ: kết quả không đổi theo múi giờ máy (G1: I1 Đang, I2 Ngoài, I3 Ngoài; G2: I3 Đang, I4 Ngoài, I5 Ngoài) |
| F02-MG-03 | AC-2 | Đạt | PW: F02-MG-01…05 (AC-2, AC-7) · 8 múi giờ: kết quả không đổi theo múi giờ máy (G1: I1 Đang, I2 Ngoài, I3 Ngoài; G2: I3 Đang, I4 Ngoài, I5 Ngoài) |
| F02-MG-04 | AC-7 | Đạt | PW: F02-MG-01…05 (AC-2, AC-7) · 8 múi giờ: kết quả không đổi theo múi giờ máy (G1: I1 Đang, I2 Ngoài, I3 Ngoài; G2: I3 Đang, I4 Ngoài, I5 Ngoài) |
| F02-MG-05 | BR-2 (biên) | Đạt | PW: F02-MG-01…05 (AC-2, AC-7) · 8 múi giờ: kết quả không đổi theo múi giờ máy (G1: I1 Đang, I2 Ngoài, I3 Ngoài; G2: I3 Đang, I4 Ngoài, I5 Ngoài) |
| F02-MG-06 | BR-2 (biên) | Đạt | PW: F02-MG-05…09 · biên: LA (máy là Chủ nhật 20:00), Kiritimati +14 (06:59 VN), Kolkata +5:30 (11:29/11:30), Auckland và New York đổi giờ |
| F02-MG-07 | BR-2 (biên) | Đạt | PW: F02-MG-05…09 · biên: LA (máy là Chủ nhật 20:00), Kiritimati +14 (06:59 VN), Kolkata +5:30 (11:29/11:30), Auckland và New York đổi giờ |
| F02-MG-08 | BR-2 (biên) | Đạt | PW: F02-MG-05…09 · biên: LA (máy là Chủ nhật 20:00), Kiritimati +14 (06:59 VN), Kolkata +5:30 (11:29/11:30), Auckland và New York đổi giờ |
| F02-MG-09 | BR-2 (biên) | Đạt | PW: F02-MG-05…09 · biên: LA (máy là Chủ nhật 20:00), Kiritimati +14 (06:59 VN), Kolkata +5:30 (11:29/11:30), Auckland và New York đổi giờ |
| F02-MG-10 | BR-2 | Đạt | PW: F02-MG-10/11 · giờ trong khối là nguyên văn HH:mm Việt Nam, không đổi theo múi giờ hay locale máy |
| F02-MG-11 | BR-2 | Đạt | PW: F02-MG-10/11 · giờ trong khối là nguyên văn HH:mm Việt Nam, không đổi theo múi giờ hay locale máy |
| F02-MG-12 | BR-2 | Đạt | Cùng lần chạy ba `TZ` của RG-06 |
| F02-GD-01 | AC-9, BR-8 | Đạt | PW: F02-GD-01/02/03 (AC-9) · 1280px: G2 đúng 2 dòng; không dòng Chủ nhật; G1 đúng 1 dòng |
| F02-GD-02 | AC-9 | Đạt | PW: F02-GD-01/02/03 (AC-9) · 1280px: G2 đúng 2 dòng; không dòng Chủ nhật; G1 đúng 1 dòng |
| F02-GD-03 | AC-9 | Đạt | PW: F02-GD-01/02/03 (AC-9) · 1280px: G2 đúng 2 dòng; không dòng Chủ nhật; G1 đúng 1 dòng |
| F02-GD-04 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-05 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-06 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-07 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-08 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-09 | BR-8 | Đạt | PW: F02-GD-04…09 · G3 ngày nghỉ chen giữa; G4 không nối vòng tuần; G9 sắp theo thứ; G7 bảy dòng; G8 chỉ chiều; khác buổi không gộp |
| F02-GD-10 | BR-8 | Đạt | Vitest `gioLamViec.test.ts` (gộp ngày) 48/48 ở ba `TZ` |
| F02-GD-11 | BR-1, BR-8 | Đạt | PW `nhap-lai-pg.spec.ts` PG-4: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F02-GD-12 | BR-1 | Đạt | `grep "07:00\|11:30\|13:30\|17:00"` trong `features/trang-chu` (không tính test): chỉ 1 chú thích |
| F02-DH-01 | BR-2 | Đạt | PW: F02-DH-01/02 (AC-11) · 11:28:30 → 11:30:30 không tải lại: "Đang" → "Ngoài"; 12:59:30 → 13:30:30: "Ngoài" → "Đang"; không thêm yêu cầu mạng |
| F02-DH-02 | BR-2 | Đạt | PW: F02-DH-01/02 (AC-11) · 11:28:30 → 11:30:30 không tải lại: "Đang" → "Ngoài"; 12:59:30 → 13:30:30: "Ngoài" → "Đang"; không thêm yêu cầu mạng |
| F02-DH-03 | BR-2 | Đạt | PW: F02-DH-03 · tab ẩn rồi hiện lại: cập nhật ngay (không chờ bộ đếm) |
| F02-DH-04 | BR-2 | Đạt | PW F02-HN-12 (10 phút tua, đi `/thu-tuc` rồi về `/`, không lỗi) + Vitest `useBayGio.test.ts` (gỡ bộ đếm khi rời trang) |
| F02-DH-05 | BR-2 (kiosk) | Đạt | PW: F02-DH-05/06 / KS-04 · kiosk để yên 15 phút (tua đồng hồ) qua 11:30: đổi nhãn không tải lại; nhãn không phải aria-live |
| F02-DH-06 | plan §4.4 | Đạt | PW: F02-DH-05/06 / KS-04 · kiosk để yên 15 phút (tua đồng hồ) qua 11:30: đổi nhãn không tải lại; nhãn không phải aria-live |
| F02-BN-01 | Mục tiêu | Đạt | PW: F02-BN-01/02 · 1280px: h1 = tên Trung tâm, dòng cơ quan chủ quản, câu mô tả cố định; cơ quan trống thì không dòng |
| F02-BN-02 | Mục tiêu | Đạt | PW: F02-BN-01/02 · 1280px: h1 = tên Trung tâm, dòng cơ quan chủ quản, câu mô tả cố định; cơ quan trống thì không dòng |
| F02-BN-03 | Mục tiêu (biên) | Đạt | PW: F02-BN-03/04 · TT-C (tên 200, cơ quan 120) không tràn; TT-D (HTML) hiện nguyên văn dạng chữ, 0 hộp thoại |
| F02-BN-04 | Mục tiêu (HTML) | Đạt | PW: F02-BN-03/04 · TT-C (tên 200, cơ quan 120) không tràn; TT-D (HTML) hiện nguyên văn dạng chữ, 0 hộp thoại |
| F02-BN-05 | Mục tiêu | Đạt | PW: F02-BN-05 / TL-03/04/05 · API 500, 404, 429: h1 dự phòng "Tra cứu thủ tục hành chính", đúng 1 ErrorState, khối giờ ẩn, khối thường gặp vẫn hiện |
| F02-BN-06 | Mục tiêu | Đạt | API trễ 5 s: câu mô tả hiện ngay; ô dịch vụ và dải giờ là khung giữ chỗ "Đang tải…" rồi nội dung thật |
| F02-BN-07 | BR-5 | Đạt | PW: F02-BN-07 / HN-11 · không ảnh, không font do trang chủ gây ra |
| F02-BN-08 | BR-5 (khi có ảnh) | Chờ | Chờ ảnh banner (chưa có task) |
| F02-BN-09 | Mục tiêu | Đạt | axe `color-contrast` 0 vi phạm ở 375, 1280, kiosk (F02-TN-01/02) |
| F02-BN-10 | Mục tiêu | Đạt | `grep "#hex\|rgb("` trong `features/trang-chu`, `thu-tuc`, `danh-muc` (không tính test): 0 |
| F02-BN-11 | Mục tiêu (ghi nhận) | Ghi nhận | Tên Trung tâm có ở đầu trang (kèm địa bàn) và ở `h1` của banner: người dùng trình đọc màn hình nghe hai lần (rủi ro 7 của plan) |
| F02-BC-01 | Mục tiêu | Đạt | PW: F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ  |
| F02-BC-02 | Mục tiêu | Đạt | PW: F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ  |
| F02-BC-03 | Ngoài phạm vi | Đạt | PW: F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ  |
| F02-BC-04 | Ngoài phạm vi | Đạt | PW: F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ  |
| F02-BC-05 | Mục tiêu (lối vào) | Đạt | PW: F02-BC-05 · điều hướng chính có "Danh mục thủ tục", "Lĩnh vực và mã QR"; trang chủ không lặp lối vào riêng |
| F02-BC-06 | Phạm vi | Đạt | PW: F02-BC-06/07/08 · khối thường gặp rỗng không để khoảng trống; /api/thu-tuc lỗi chỉ ảnh hưởng khối thường gặp; /api/trung-tam lỗi vẫn có khối thường gặ |
| F02-BC-07 | Phạm vi | Đạt | PW: F02-BC-06/07/08 · khối thường gặp rỗng không để khoảng trống; /api/thu-tuc lỗi chỉ ảnh hưởng khối thường gặp; /api/trung-tam lỗi vẫn có khối thường gặ |
| F02-BC-08 | Phạm vi | Đạt | PW: F02-BC-06/07/08 · khối thường gặp rỗng không để khoảng trống; /api/thu-tuc lỗi chỉ ảnh hưởng khối thường gặp; /api/trung-tam lỗi vẫn có khối thường gặ |
| F02-BC-09 | Phạm vi | Đạt | PW: F02-BC-09 · /?ma=1.001193: đúng 1 dialog (do F03), ô dịch vụ ở nền bị vô hiệu |
| F02-BC-10 | Phạm vi | Đạt | PW: F02-BC-01/02/03/04/10/11 · thứ tự DOM banner → dịch vụ nhanh → thường gặp → giờ; h1 + 3 h2; địa chỉ/điện thoại/email đúng 1 lần; không khối thừa; thứ  |
| F02-BC-11 | Phạm vi | Đạt một phần | Không chồng khối ở 375 và 1280 (CLS ≈ 0); chưa đo token khoảng cách |
| F02-TL-01 | F08 BR-11 | Đạt | PW: F02-BN-06 / TL-01 · API trễ 5 giây: câu mô tả hiện ngay, ô dịch vụ là khung giữ chỗ "Đang tải…", sau đó nội dung thật |
| F02-TL-02 | C01 AC-19 | Đạt | PW: F02-TL-02 · /api/trung-tam 500 rồi 200: "Thử lại" ở khối ô dịch vụ làm mới cả đầu/chân trang |
| F02-TL-03 | B6 | Đạt | PW: F02-BN-05 / TL-03/04/05 · API 500, 404, 429: h1 dự phòng "Tra cứu thủ tục hành chính", đúng 1 ErrorState, khối giờ ẩn, khối thường gặp vẫn hiện |
| F02-TL-04 | B6 | Đạt | PW: F02-BN-05 / TL-03/04/05 · API 500, 404, 429: h1 dự phòng "Tra cứu thủ tục hành chính", đúng 1 ErrorState, khối giờ ẩn, khối thường gặp vẫn hiện |
| F02-TL-05 | B6 | Đạt | PW: F02-BN-05 / TL-03/04/05 · API 500, 404, 429: h1 dự phòng "Tra cứu thủ tục hành chính", đúng 1 ErrorState, khối giờ ẩn, khối thường gặp vẫn hiện |
| F02-TL-06 | F08 AC-11 | Đạt | PW: F02-TL-06 (F08 AC-11) · mất mạng sau khi đã tải xong: sang trang khác rồi về "/", "Thử lại" → mất kết nối + số điện thoại; có mạng → nội dung |
| F02-TL-07 | BR-1 | Đạt | PW: F02-GL-13 / TL-07 (AC-12, BR-10) · không có dòng giờ nào: ẩn cả khối, không chữ "Ngoài giờ làm việc"; ô dịch vụ và khối thường gặp vẫn hiện |
| F02-TL-08 | F08 BR-11 | Đạt | PW: F02-TL-08 · chunk TrangChu lỗi tải: LoiTrang trong vùng nội dung, đầu/chân trang còn |
| F02-TL-09 | plan §3 | Đạt | PW: F02-GL-14/15 / TL-09 · G5 (buổi hỏng): bỏ buổi hỏng, không "25:00/NaN/undefined", ngày không còn buổi = nghỉ, nhãn và dòng giờ nhất quán |
| F02-TL-10 | plan §3 | Đạt | PW: F02-TL-09/10 · gioLamViec thiếu khoá/trường lạ không ném lỗi; ghi chú 500 ký tự có <script> hiện nguyên văn, không tràn (375) |
| F02-KS-01 | C01 AC-2 | Đạt | PW: F02-KS-01/06 · kiosk 1080×1920: không cuộn ngang, ô dịch vụ >= 56 px, dải giờ đọc được |
| F02-KS-02 | F09 BR-4 | Đạt | F09-NH-01/02 (kiosk.spec): trang chủ kiosk có đúng 2 dòng "Nhớ đăng xuất khi dùng xong", dòng ô dịch vụ đứng trước ô đầu; không lặp trên từng ô |
| F02-KS-03 | F09 BR-4 | Đạt | F09-NH-21/22/25/26: chỉ ô tới cangiuoc.tayninh.gov.vn hoặc tên miền giả mạo (dichvucong.gov.vn.evil.com, evildichvucong.gov.vn…) → 0 dòng; có ô tới dichvucong.gov.vn → 1 dòng |
| F02-KS-04 | F09 BR-2 | Đạt | PW: F02-DH-05/06 / KS-04 · kiosk để yên 15 phút (tua đồng hồ) qua 11:30: đổi nhãn không tải lại; nhãn không phải aria-live |
| F02-KS-05 | C01 AC-24 | Đạt | F09-NV-10: popup mở ở kiosk, Tab/Shift+Tab đi vòng qua "Bắt đầu lại" ở cuối vòng; Esc chỉ đóng popup |
| F02-KS-06 | C01 AC-2 | Đạt | Kiosk: ô dịch vụ cao 136 px (≥ 56); cỡ chữ dòng giờ 15,4 px |
| F02-TN-01 | C01 AC-4 | Đạt | PW: F02-TN-01/02 · axe 375px: trang chủ 0 vi phạm (đủ dữ liệu, đang tải, lỗi, giờ ẩn, ô rỗng) |
| F02-TN-02 | C01 AC-4 | Đạt | PW: F02-TN-01/02 · axe 375px: trang chủ 0 vi phạm (đủ dữ liệu, đang tải, lỗi, giờ ẩn, ô rỗng) |
| F02-TN-03 | WCAG 1.4.1 | Đạt một phần | Nhãn có icon + chữ (không chỉ màu). Nhìn chế độ đen trắng: chưa chạy |
| F02-TN-04 | C01 AC-1 | Đạt | PW F02-BC-10 (Tab qua 4 ô có link, bỏ hai ô thường) + F02-DV-03 (Enter mở tab mới) |
| F02-TN-05 | plan §4.2 | Đạt | PW: F02-TN-03/05/09/13/14 · nhãn trạng thái có icon + chữ; mỗi khối là section có tên; tên đọc ô chứa chữ nhìn thấy; vùng chạm ô >= 44 px ở 375; dòng giờ  |
| F02-TN-06 | AC-8 | Chờ | Thử tay NVDA/TalkBack |
| F02-TN-07 | WCAG 1.4.10 | Đạt | PW: F02-TN-07/08 · 320 px và giãn chữ: không cuộn ngang, không mất nội dung |
| F02-TN-08 | WCAG 1.4.12 | Đạt | PW: F02-TN-07/08 · 320 px và giãn chữ: không cuộn ngang, không mất nội dung |
| F02-TN-09 | WCAG 2.5.3 | Đạt | PW: F02-TN-03/05/09/13/14 · nhãn trạng thái có icon + chữ; mỗi khối là section có tên; tên đọc ô chứa chữ nhìn thấy; vùng chạm ô >= 44 px ở 375; dòng giờ  |
| F02-TN-10 | C01 BR-1 | Đạt | PW: F02-TN-10 · giảm chuyển động: không có hoạt ảnh chạy sau khi tải; tua đồng hồ không nhấp nháy |
| F02-TN-11 | WCAG 1.4.3 | Đạt | axe `color-contrast` 0 vi phạm (nhãn trạng thái trên dải xanh) ở 375, 1280, kiosk |
| F02-TN-12 | WCAG 2.4.1 | Đạt | PW: F02-TN-12 · "Bỏ qua, tới nội dung chính": Enter đưa con trỏ vào main; Tab kế tới ô dịch vụ đầu có link |
| F02-TN-13 | WCAG 2.5.8 | Đạt | PW: F02-TN-03/05/09/13/14 · nhãn trạng thái có icon + chữ; mỗi khối là section có tên; tên đọc ô chứa chữ nhìn thấy; vùng chạm ô >= 44 px ở 375; dòng giờ  |
| F02-TN-14 | WCAG 1.3.1 | Đạt | PW: F02-TN-03/05/09/13/14 · nhãn trạng thái có icon + chữ; mỗi khối là section có tên; tên đọc ô chứa chữ nhìn thấy; vùng chạm ô >= 44 px ở 375; dòng giờ  |
| F02-BM-01 | CLAUDE.md > Header | Đạt | PW: F02-BM-01 (Development, HTTPS) · header của "/", /api/trung-tam, tài nguyên tĩnh |
| F02-BM-02 | CLAUDE.md | Đạt | PW: F02-BM-02/03/04/09 · 375px: 0 vi phạm CSP, 0 console.error; mọi request cùng gốc; /api/trung-tam đúng 1 lần; rel đủ; không gửi giờ máy |
| F02-BM-03 | CLAUDE.md > Tài nguyên tự host | Đạt | PW: F02-BM-02/03/04/09 · 375px: 0 vi phạm CSP, 0 console.error; mọi request cùng gốc; /api/trung-tam đúng 1 lần; rel đủ; không gửi giờ máy |
| F02-BM-04 | C01 BR-3 | Đạt | PW: F02-BM-02/03/04/09 · 375px: 0 vi phạm CSP, 0 console.error; mọi request cùng gốc; /api/trung-tam đúng 1 lần; rel đủ; không gửi giờ máy |
| F02-BM-05 | plan §6 | Đạt | PW: F02-DV-17/BM-05 · OE: địa chỉ độc hại/sai định dạng hiện như ô thường, không <a>; HTTP viết hoa được nhận; 0 hộp thoại |
| F02-BM-06 | plan §6 | Đạt | PW F02-BN-04, DV-17, TL-10: HTML/`<script>` trong tên, cơ quan, ghi chú hiện nguyên văn; 0 hộp thoại; 0 thẻ sinh ra |
| F02-BM-07 | CLAUDE.md > Không `dangerouslySetInnerHTML` | Đạt | `grep dangerouslySetInnerHTML\|innerHTML` trong `features/trang-chu`: 0; lint sạch |
| F02-BM-08 | plan §6 | Đạt | PW: F02-BM-08/HD-07 · /api/trung-tam: chỉ trường của F08; giờ HH:mm, thu 1–7 |
| F02-BM-09 | plan §6 | Đạt | PW: F02-BM-02/03/04/09 · 375px: 0 vi phạm CSP, 0 console.error; mọi request cùng gốc; /api/trung-tam đúng 1 lần; rel đủ; không gửi giờ máy |
| F02-BM-10 | CLAUDE.md > Mã nguồn | Đạt | Bản build/publish: 0 `.map`/`.pdb`; tên hàm dự án (`gopNgay`, `dangLamViec`, `thoiDiemVietNam`) không còn trong chunk |
| F02-BM-11 | CLAUDE.md > Thư viện | Đạt một phần | `npm audit --omit=dev` 0 lỗ hổng; `dotnet list package --vulnerable` sạch. Không đối chiếu được gói trước F02 |
| F02-BM-12 | CLAUDE.md > API | Đạt | Production, một IP: `/api/trung-tam` 300×200 rồi 30×429 `Retry-After: 60`; HTML `/` vẫn 200 |
| F02-BM-13 | CLAUDE.md > Dữ liệu | Đạt | Bản publish nối DB hỏng: `/api/trung-tam` 500 `loi-he-thong` + `maTraCuu` sau 3,1 s, không có mật khẩu thử trong thân và log; PW HD-10: trang vẫn mở, ErrorState |
| F02-BM-14 | plan §6 (BR-6) | Đạt | F02-DV-05/06: mọi `a[href^=http]` của trang (ô dịch vụ + chân trang) không thuộc `motcua`, `vbdh`, `dichvucong.tayninh.gov.vn` |
| F02-HN-01 | AC-4, F00 BR-9 | Đạt | JS (gzip -9) mở `/` ở 375 px: 173,1 KiB đầu · 180,3 KiB sau 3,5 s (đã gồm F03); 1280 px: 183,6 · 190,7 KiB (≤ 200). Chunk TrangChu 10,5 KiB |
| F02-HN-02 | AC-4 | Đạt | Như HN-01 (đã ghép F03): TrangChu 10,5 KiB (< 30); tổng ≤ 200 KB |
| F02-HN-03 | AC-4 | Đạt | Lighthouse mobile `/` (publish Production, 3 lần): 94 · 95 · 95; CLS 0 |
| F02-HN-04 | AC-4 | Đạt | Như HN-03 (đã ghép F03): 94 · 95 · 95; CLS 0; không cần phương án `?thuongGap=1` |
| F02-HN-05 | plan §5 (CLS) | Đạt | Lượt 2: CLS 375 px — API thật 0,000 · TT-A 0,000/0,003 · TT-B 0,006 · TT-C (tên 200 ký tự + cơ quan 120 ký tự, API trễ 5 s) 0,008; 1280 px 0,000–0,001. Lỗi L1 đã sửa (lượt 1: 0,298) |
| F02-HN-06 | plan §5 (CLS) | Đạt | CLS khi dải giờ 1 dòng (G1) 0,008; 7 dòng (G7) 0,016 (375 px, API trễ 2 s) |
| F02-HN-07 | plan §5 | Đạt | Lượt 2: Lighthouse LCP 2,19–2,40 s (< 2,5 s, trước đây 2,47–2,49); điểm 96 · 96 · 97; phần tử LCP vẫn là h1 tên Trung tâm (xem G1) |
| F02-HN-08 | plan §3, §5 | Đạt | PW: F02-HN-08/13 · "/" gọi /api/trung-tam đúng 1 lần; không tải chunk trợ lý/QR/đọc ở trang chủ |
| F02-HN-09 | F00 BR-9 | Đạt | curl 100 lần: `/api/trung-tam` nguồn Mẫu p50 27,3 · p95 50,7 · max 81,4 ms; PostgreSQL p95 27,1 ms |
| F02-HN-10 | plan §5 | Đạt | Lighthouse FCP 1,9 s (mobile giả lập); PW F02-BN-06: đầu/chân trang và câu mô tả hiện khi API trễ 5 s |
| F02-HN-11 | plan §5 (không ảnh, font) | Đạt | PW: F02-BN-07 / HN-11 · không ảnh, không font do trang chủ gây ra |
| F02-HN-12 | plan §4.4 | Đạt | PW: F02-HN-12 · trang mở 10 phút (đồng hồ giả): không rò bộ đếm (số setInterval không tăng), không lỗi |
| F02-HN-13 | F00 BR-9 | Đạt | PW: F02-HN-08/13 · "/" gọi /api/trung-tam đúng 1 lần; không tải chunk trợ lý/QR/đọc ở trang chủ |
| F02-HN-14 | TT 22/2023 (F00 BR-9) | Đạt | localhost 375 px, không giả lập: tải xong `/` ~1,4 s; DCL 332 ms; LCP 556 ms; yêu cầu chậm nhất 239 ms (< 0,6 s) |
| F02-HD-01 | AC-6 | Đạt | Nguồn Mẫu: `oDichVu` 6 ô theo thứ tự `lien-ket.md` §1 (2 ô `url` null); `gioLamViec` Thứ Hai – Thứ Sáu 07:00–11:30, 13:30–17:00 (PW DV-05/06 + curl) |
| F02-HD-02 | AC-6, F08 | Đạt | PW DV-05/06 chạy trên API nguồn PostgreSql (nhập bằng công cụ nhập): cùng 6 ô, cùng giờ |
| F02-HD-03 | AC-3 | Đạt | Rà xUnit F08 `Integration/ThongTinTrungTam` (IT-04) + PW PG-4: dữ liệu mới ngay sau khi nhập lại, không build lại |
| F02-HD-04 | AC-7, BR-1 | Đạt | PW `nhap-lai-pg.spec.ts` PG-4: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F02-HD-05 | BR-1 | Đạt | PW `nhap-lai-pg.spec.ts` PG-5: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F02-HD-06 | F01 | Đạt | PW `nhap-lai-pg.spec.ts` PG-6: nhập lại bằng công cụ nhập thật trên PostgreSQL, không build lại, không khởi động lại API |
| F02-HD-07 | F08 | Đạt | PW: F02-BM-08/HD-07 · /api/trung-tam: chỉ trường của F08; giờ HH:mm, thu 1–7 |
| F02-HD-08 | F00 BR-16 | Đạt | API nguồn Mẫu giữ nguyên dù DB PostgreSQL nhập lại (xem F03-HD-09) |
| F02-HD-09 | F00 §9 | Đạt | 37 ca PW dữ liệu thật trên API nguồn PostgreSql + toàn bộ trên nguồn Mẫu: cùng kết quả |
| F02-HD-10 | F00 BR-16 | Đạt | PW: F02-HD-10 (F08 IT-05) · PostgreSQL không tới được: HTML vẫn mở, ô dịch vụ ErrorState, banner dự phòng (cần API trỏ DB hỏng: E2E_DB_DOWN=1) |

## Bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Header trên `/`, `/api/trung-tam`, tài nguyên tĩnh (HTTPS Production) | Đạt: CSP đúng nguyên văn, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; không `Server`, `X-Powered-By` |
| Console không lỗi CSP/`console.error`; mọi request cùng gốc; `/api/trung-tam` đúng 1 lần | Đạt ở 375 và 1280 (đã tua đồng hồ, bấm ô) |
| Link ô dịch vụ | Đạt: ô có link `target=_blank` + `rel="noopener noreferrer"`; ô thường không `target`/`rel`; OE (`javascript:`, `data:`, `//evil.example`, rỗng, khoảng trắng, `ftp:`, `https://`) không thành `<a>`; `HTTP://UPPER…` được chuẩn hoá và nhận |
| Dữ liệu có HTML/`<script>` (tên Trung tâm, cơ quan, tên ô, ghi chú ngày nghỉ) | Đạt: nguyên văn dạng chữ, không thẻ sinh ra, 0 hộp thoại |
| `/api/trung-tam` chỉ có trường của F08 | Đạt: 16 khoá; giờ `HH:mm`, `thu` 1–7; `oDichVu` chỉ `ten, moTa, bieuTuong, url`; không `maDonViCongDvc`, `id`, `thuTu`, `tenFile`; `moTa` không hiển thị ở đâu (AC-13) |
| Rate limiting (300/phút) | Đạt: `/api/trung-tam` 300×200 rồi 30×429 `Retry-After: 60`; `/` HTML vẫn 200 |
| Đồng hồ máy khách | Đạt: chỉ ảnh hưởng nhãn hiển thị; không gửi giờ máy; tua đồng hồ không thêm yêu cầu mạng |
| DB ngừng | Đạt: `/api/trung-tam` 500 `loi-he-thong` + `maTraCuu` sau 3,1 s; trang HTML vẫn mở, ErrorState ở ô dịch vụ, banner dự phòng "Tra cứu thủ tục hành chính"; không lộ chuỗi kết nối |
| Mã nguồn bản build/publish | Đạt: 0 `.map`/`.pdb`; tên hàm dự án (`gopNgay`, `dangLamViec`, `thoiDiemVietNam`) đã đổi |
| `npm audit --omit=dev`, `dotnet list package --vulnerable` | 0 lỗ hổng; không gói nào |
| Tên miền "Đã bỏ" | Đạt ở dữ liệu thật và nguồn Mẫu (DV-05/06, BM-14); F02 không có mã chặn (DV-18 ghi nhận) |

## Hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu `/` (gzip -9), đã ghép F03 | 375 px **173,1 KiB** (180,3 KiB sau 3,5 s) · 1280 px **183,6 KiB** (190,7 KiB sau 3,5 s = 195,3 kB) | ≤ 200 KB |
| Chunk TrangChu (gồm F02 + F03) | **10,5 KiB** gzip (< 30) | rủi ro 2 |
| Lighthouse mobile `/` (publish Production, 3 lần) | **94 · 95 · 95**; FCP 1,9 s; LCP 2,47–2,49 s; TBT 110–170 ms; CLS 0; A11y/Best practices/SEO 100 | ≥ 85, CLS < 0,1 |
| CLS (PW), 375 px | API thật 0,001 · TT-A tức thì 0,000 · TT-A trễ 5 s 0,008 · TT-B trễ 5 s 0,012 · **TT-C (tên 200 ký tự) trễ 5 s 0,298 (trượt)** | ≤ 0,05–0,1 |
| CLS (PW), 1280 px | 0,000 · 0,000 · 0,000 · 0,001 · 0,021 | ≤ 0,1 |
| CLS dải giờ 1 dòng / 7 dòng (375, trễ 2 s) | 0,008 / 0,016 | ≤ 0,1 |
| CLS trang chủ ở `san-xuat.spec.ts` (bản production) | ≤ 0,021 mọi khổ, kể cả kiosk 1080×1920 | < 0,05 |
| p95 `/api/trung-tam`, 100 lần | Mẫu p50 27,3 · **p95 50,7** · max 81,4 ms; PostgreSQL p95 **27,1** ms | ≤ 300 ms |
| Tải trang (localhost, 375, không giả lập) | DCL 332 ms; LCP 556 ms; chậm nhất một yêu cầu 239 ms; 17 yêu cầu | TT 22/2023 |
| Ảnh/font do trang chủ | 0 | — |
| Chunk trợ lý/QR/đọc | không tải ở `/` | F00 BR-9 |
| Đồng hồ 10 phút (tua) | không lỗi; chuyển trang đi/về nhãn đúng | một lần vẽ lại mỗi phút |
| 48 tổ hợp múi giờ × mốc | tất cả đúng | — |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Đã sửa (lượt 2, 2026-10-13) | **L1** Banner không giữ chỗ đủ cho tên Trung tâm dài: khi tên 200 ký tự (và cơ quan 120 ký tự) về chậm 5 s, nội dung dưới bị đẩy xuống, CLS 0,298 ở 375 px (1280 px 0,021). Tên thật (46 ký tự) không lỗi (API thật 0,001). `testcases` BN-03/HN-05 kỳ vọng ≤ 0,05 cả với tên dài | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts trang-chu --project=chromium -g "F02-HN-05"` (bộ TT-C). Gợi ý: `min-height` cho banner theo số dòng tên, hoặc cắt tên khi chờ | frontend-dev (`src/FrontEnd/src/features/trang-chu/BannerTrangChu.tsx`, `.module.css`) |
| Góp ý | **G1** Phần tử LCP của `/` là `h1` chứa tên Trung tâm (chờ API) chứ không phải câu mô tả cố định; LCP 2,47–2,49 s (< 2,5 s nhưng sát ngưỡng); `/?ma=…` 2,2–2,6 s | Lighthouse mobile `/` | frontend-dev (ghi nhận) |
| Góp ý | **G2** Ô không link cao hơn ô có link 3,2 px ở 375 px (chênh dòng "Trang ngoài"); 0 ở 1280 | PW F02-DV-11 (log kích thước) | ui-core-dev (`Tile`, cosmetic) |
| Ghi nhận | Popup mở từ trang chủ có lỗi trợ năng L1 của F03 (xem F03/result/test.md) | F03 L1 | ui-core-dev |

## Mơ hồ và hành vi ghi nhận

- Ngày không còn buổi hợp lệ (buổi hỏng) là ngày nghỉ; Thứ Hai trong G5 chỉ còn buổi chiều và vẫn có dòng.
- Thứ Bảy chỉ có buổi sáng không gộp với Thứ Sáu (hai buổi) nên khối hiện ba dòng "Thứ Hai – Thứ Ba", "Thứ Năm – Thứ Sáu", "Thứ Bảy" sau khi xoá giờ Thứ Tư.
- Tên Trung tâm xuất hiện hai lần (đầu trang kèm địa bàn, và `h1` banner): rủi ro 7 của plan.
- Đồng hồ máy lệch 3 giờ → nhãn theo giờ máy (BR-9, hạn chế đã biết).
- Bản dev: React StrictMode gọi `/api/trung-tam` hai lần; không áp cho bản build.

## Ca Chờ và chưa chạy

- **F02-DV-16** — Thử tay NVDA/TalkBack. PW: hai ô không phải `link`, không `tabindex` (DV-11…15 đạt)
- **F02-BN-08** — Chờ ảnh banner (chưa có task)
- **F02-KS-02** — Chờ F09
- **F02-KS-03** — Chờ F09
- **F02-KS-05** — Chờ F09
- **F02-TN-06** — Thử tay NVDA/TalkBack
