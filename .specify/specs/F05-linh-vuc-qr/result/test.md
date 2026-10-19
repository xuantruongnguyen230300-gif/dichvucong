ĐẠT

# F05 · Lĩnh vực và mã QR — kết quả kiểm thử (T11, T12)

## Lượt xác nhận (2026-10-14)

Kết quả mới nhất của F05 nằm ở mục này; các mục bên dưới là lượt 2026-10-13 (giữ để đối chiếu).

- **Kết luận: ĐẠT** — 0 ca trượt, không còn lỗi *Chặn*/*Nên sửa* của F05. Số ca (164): Đạt **120** · Đạt\* **15** · Trượt **0** · Chờ **11** · Chưa chạy **18** (trước: 116 · 15 · 4 · 11 · 18). Bốn ca trượt cũ nay đạt: F05-VE-15, F05-QY-14, F05-HN-11 (CLS) và F05-TL-10 (cache dùng chung).
- `trang_thai` của `spec.md` vẫn `dang-lam`: còn 11 ca Chờ (quét QR bằng điện thoại thật, in 3 cm, NVDA/TalkBack, tài liệu vận hành).
- Playwright `linh-vuc.spec.ts` **84/84** đạt (cả bộ 617 đạt, 2 trượt ở F08/F09 trên bản build, xem bảng "Chạy lại toàn bộ").
- Ngày chạy: 2026-10-14 (lượt xác nhận cuối sau khi dev sửa các lỗi lượt 2026-10-13). Người chạy: tester. Tuần tự, một trình duyệt tại một thời điểm. Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`postgres`); Docker không chạy nên không có Testcontainers (ca DB thật dùng `DbThuNghiem`, biến `ConnectionStrings__DichVuCongTest`).
- Bản kiểm: `npm run build` mới (JS ban đầu **184,9 KiB** gzip) rồi `dotnet publish -c Release` (không `.pdb`/`.map`). Máy chủ: **S1** `https://localhost:7157` (Development, nguồn Mẫu, giới hạn 100000/phút) chạy e2e; **S2** `https://localhost:5443` (Production, giới hạn mặc định 300/60 mỗi phút) cho header, 429, Lighthouse; **S3** `http://localhost:5555` (Production, nguồn PostgreSql, DB tạm `dichvucong_t15` dựng bằng `DuLieuMau` → `dotnet ef database update` → công cụ nhập, có 3 phân công quầy + 3 nhân sự; đã xoá sau khi chạy).

### Xác nhận từng lỗi lượt trước

| Lỗi | Kết quả | Bằng chứng |
|---|---|---|
| L1 CLS khung chờ → lưới | **Đã sửa** | `cls-ma-tran.spec.ts`: `/linh-vuc` 75 và 8 ô ở 375/768/1280/kiosk, API tức thì và trễ 3 s: **0,0000–0,0005** (trước 0,3755 ở 1280); F05-VE-15 (chunk QR trễ 3 s) và F05-QY-14 (quầy trễ 5 s) đạt; Lighthouse CLS 0 |
| L2 `/api/linh-vuc` tải lại khi sang từ `/thu-tuc` | **Đã sửa** | F05-TL-10 đạt: `/api/linh-vuc` không tải lại trong 60 s, `/api/linh-vuc/quay` có tải (khoá `['linh-vuc']` dùng chung, `layDanhMucThuTuc(signal, client)`) |
| L3 chunk `QrLinhVuc-*.js` lỗi làm mất cả lưới | **Đã sửa** | F05-VE-14 (nay là khẳng định, không còn "ghi hành vi"): chặn chunk → lưới vẫn đủ **8 ô**, ô còn tên, **0 QR**, không báo lỗi toàn trang, ô tìm vẫn lọc được |
| L4 quầy treo làm lưới kẹt ở khung chờ | **Đã sửa** | F05-QY-15 (nay khẳng định): quầy không trả lời → lưới 8 ô hiện sau hạn chờ 4 s (< 6,5 s), không dòng quầy, không `role="alert"` |
| L5 (tài liệu) | **Đã chỉnh `testcases.md`** | TL-08 (`h1` ẩn và `h2` cùng chữ "Lĩnh vực và mã QR" — chủ ý), TN-10 (vùng bấm ≥ 24 px theo spec C01 AC-2, không phải 44 px), QY-15, VE-14. `quay` ≤ 0 hoặc kiểu chuỗi: không kiểm lại (tuỳ chọn, BE không gửi) |

### CLS

| CLS bản build (PerformanceObserver) | 375 | 768 | 1280×800 | Kiosk 1080×1920 |
|---|---|---|---|---|
| `/` · API tức thì / trễ 3 s | 0,0005 / 0,0077 | 0,0000 / 0,0083 | 0,0000 / 0,0000 | 0,0043 / 0,0163 |
| `/thu-tuc` · tức thì / trễ 3 s | 0,0005 / 0,0005 | 0,0000 / 0,0000 | 0,0000 / 0,0000 | 0,0000 / 0,0000 |
| `/linh-vuc` 75 ô · tức thì / trễ 3 s | 0,0005 / 0,0005 | 0,0000 / 0,0000 | 0,0000 / 0,0000 | 0,0000 / 0,0000 |
| `/linh-vuc` 8 ô · tức thì / trễ 3 s | 0,0005 / 0,0005 | 0,0000 / 0,0000 | 0,0000 / 0,0000 | 0,0000 / 0,0000 |

Mục tiêu < 0,05: **32/32 đạt** (`e2e/cls-ma-tran.spec.ts`, mới). Trước: `/linh-vuc` 1280 = 0,3755; kiosk `/thu-tuc` 0,176, `/linh-vuc` 0,180.

### Hiệu năng và bảo mật (lượt này)

- Lighthouse mobile 12.8 (Production S2, 3 lần mỗi trang): `/` **96 · 96 · 96** (LCP 2,5 s, TBT 70–90 ms, CLS 0); `/thu-tuc` **97 · 96 · 96** (LCP 2,3 s); `/linh-vuc` **98 · 98 · 98** (LCP 2,1 s); Accessibility, Best practices, SEO đều 100; ngân sách ≥ 85.
- JS tải ban đầu (gzip -9, đo thật lúc 3,5 s): `/` 375 **184,9 KiB** · 1280 **195,3 KiB** (còn 4,7 KiB so với trần 200 KiB — sát) · kiosk **187,5 KiB**; `/thu-tuc` 177,2 · 187,6 · 181,1; `/linh-vuc` 171,3 · 171,3 · 175,1.
- p95 (1.000 lần, bản Release, máy dev): nguồn Mẫu — `GET /api/thu-tuc` **4,0 ms**, `/api/linh-vuc` 1,1, `/api/linh-vuc/quay` 0,8, `/api/trung-tam` 0,9, `/api/tro-ly/chu-de` 0,9, `/api/thu-tuc/{ma}` 1,2, `POST /api/tro-ly/hoi` **6,5 ms**; PostgreSQL 408 thủ tục — 3,9 · 1,0 · 0,8 · 0,7 · 0,7 · 1,1 · **3,7 ms**; ngân sách ≤ 300 ms.
- Bảo mật: giữ nguyên kết quả lượt 2026-10-13 (CSP, 0 yêu cầu ra ngoài, tên lĩnh vực chứa HTML hiện nguyên văn, QR không chứa từ khoá tìm) và kiểm lại bằng số liệu dưới:

| Kiểm tra | Kết quả |
|---|---|
| `curl -I` `/`, `/thu-tuc`, `/api/thu-tuc`, `/api/tro-ly/chu-de`, `/api/linh-vuc`, một tệp `.js`, một 404 `/api/khong-co`, và `http://…:5299/` (307) | **Đạt**: CSP khớp **nguyên văn** `CLAUDE.md` (so chuỗi), HSTS, `nosniff`, Referrer-Policy, Permissions-Policy đủ; **không** header `Server`/`X-Powered-By`/CORS |
| 501 ký tự / 500 ký tự / thân 70 KB / JSON hỏng / `<script>` vào `POST /api/tro-ly/hoi` | **Đạt**: 400 · 200 · 413 · 400 · 200; ProblemDetails, không stack trace (400 còn liệt kê tên trường `CauHoi` bằng tiếng Anh — không lộ gì thêm) |
| Gửi dồn 70 câu trong một phút (S2, mặc định 60/phút) | **Đạt**: 60 × 200 rồi lần **61** → 429 `Retry-After: 60`, `application/problem+json`, `code: qua-nhieu-yeu-cau`; danh mục và trang chủ vẫn 200 |
| Bản build: `.map`, `.pdb`, `sourceMappingURL`, chuỗi kết nối (`Password=`, `Host=localhost`) trong `wwwroot` và bản publish | **Đạt**: 0 |
| CSP/console/yêu cầu ra ngoài (Playwright) | **Đạt**: 0 vi phạm CSP, 0 lỗi console, 0 yêu cầu ra tên miền ngoài trong mọi ca đã chạy |
| `npm audit --omit=dev`, `dotnet list package --vulnerable --include-transitive` | **Đạt**: 0 · không gói nào |

### Chạy lại toàn bộ

| Bộ | Kết quả |
|---|---|
| `npm run lint` · `npm run build` (`tsc -b` gồm `e2e/`) | sạch · sạch |
| `npm test` (Vitest) | **1.150/1.150** (115 tệp). Lần chạy đầu cả bộ có 1 ca đỏ chập chờn (`useDanhSachUrl.tranhGhi` "lặp 10 lần", lần 8: `q` = null), chạy lại đạt; khi chạy 6 tiến trình song song thì 2/6 lần đỏ cùng chỗ (lỗi R1c, mức Thấp) |
| `npm run e2e:san-xuat` | **20/20** (gồm CLS trang chủ ở 375/768/1280/1080×1920 và kiosk, API tức thì và trễ 5 s, < 0,05) |
| Playwright toàn bộ trên bản build (Chromium, S1; `E2E_PG_URL`=S3, `E2E_RL_URL`=S2) | **617 đạt · 2 trượt · 11 bỏ qua** (23 phút). Hai trượt: F09-KB-11 (K5) và F08-TL-04 (N1). Bỏ qua: `nhap-lai-pg` 9 ca (chạy riêng với S3 và thư mục Excel sao: **9/9 đạt**), F04-TN-02 (chỉ có bản dev; chạy trong `xem-truoc.config.ts`: **84/84** đạt), F02-HD-10 (cần API trỏ DB hỏng). `smoke.spec.ts` 4/4. Hai ca R1b (`tranh-ghi-dia-chi`, thêm sau lượt chạy này) và phần kiểm `IconButton` của F07-KS-01b chạy riêng: đạt |
| `dotnet test --solution` **có** `ConnectionStrings__DichVuCongTest` | **1.433/1.433** đạt, 0 bỏ qua (1 m 19 s) |
| `dotnet test --solution` **không** có biến đó | 1.148 đạt · **285 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` · `dotnet list package --vulnerable --include-transitive` | 0 lỗ hổng · không gói nào (cả 5 dự án) |

### Lỗi còn lại của F05

Không có. (Chung cho các trang: lỗi **N1** — chân trang ẩn trong lúc có khung chờ — ghi ở `F08-khung-trang/result/test.md`; F05-TL-01 đã chỉnh để không đòi chân trang hiện trong lúc chờ.)

### Ca thử tay — chờ (không đổi)

QR-17/18 (quét bằng camera iPhone, Android, Zalo từ màn hình máy tính; ghi tên miền đang mở), QR-19/VH-05 (in A4, QR 3 cm, quét bản in), KS-06 (quét QR từ kiosk thật), TK-15 (Unikey Telex/VNI), TN-06 (NVDA/TalkBack qua một ô), VH-01…03, VH-06 (tài liệu vận hành).

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T08 (backend-dev, ui-core-dev, frontend-dev); `review.md` ĐẠT (0 Chặn).
- **Kết luận: CHƯA ĐẠT** — không có lỗi *Chặn*; còn **3 ca trượt** mức *Nên sửa/Thấp* (F05-VE-15 và F05-QY-14: CLS khi khung chờ chuyển sang lưới ở màn hình rộng/cao, F05-TL-10: `/api/linh-vuc` tải lại khi sang từ `/thu-tuc`) và **1 ca trượt do số đo** (F05-HN-11, cùng nguyên nhân CLS). Mọi AC 1–9 có ít nhất một ca đạt; AC-5 (đếm QR theo khung nhìn), AC-7 (cả 75 QR giải mã đúng, 18 lĩnh vực chỉ cấp tỉnh → `cap=tinh`), AC-6/AC-9 (quầy rỗng, quầy lỗi) đạt; Lighthouse mobile `/linh-vuc` 98 · 98 · 98.
- Số ca (164): Đạt **116** · Đạt\* **15** · Trượt **4** · Chờ **11** · Chưa chạy **18** · Ghi nhận **0** (tổng 164). Playwright `linh-vuc.spec.ts`: 84 ca, 81 đạt, 3 trượt. Tích hợp PostgreSQL (T11): 4 ca mới đạt.
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn ca trượt và 11 ca Chờ (quét QR bằng điện thoại thật, in 3 cm, NVDA/TalkBack, tài liệu vận hành BR-5). Đổi sang `xong` khi L1/L2 được sửa và các ca Chờ đạt (ghi tên miền đã dùng khi thử AC-2).
- Tasks: T11 và T12 hoàn tất phần tự động (ca thử tay liệt kê ở cuối).

## Môi trường và cách chạy

- Ngày chạy: 2026-10-13. Người chạy: tester. Chạy **tuần tự, một trình duyệt tại một thời điểm** (`workers: 1`). Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`localhost:5432`). Docker Desktop không chạy nên **không có Testcontainers**: ca cần DB thật dùng DB riêng tạo/xoá bằng `DbThuNghiem` (biến `ConnectionStrings__DichVuCongTest`). Playwright 1.64 (Chromium), Lighthouse 12.8 (mobile mặc định, 3 lần, 4 hạng mục), axe-core 4.13 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).
- Bản kiểm: `npm run build` (đã obfuscate, ra `wwwroot`) và `dotnet publish -c Release` (không `.pdb`/`.map`/`.xml`). Năm tiến trình cùng bản publish:
  - **S1** `https://localhost:7157` — Development, nguồn **Mẫu**, `RateLimiting__DanhMuc=RateLimiting__TroLy=100000`: chạy e2e.
  - **S2** `https://localhost:5443` (và `http://localhost:5299` → 307) — **Production**, nguồn Mẫu, **giới hạn mặc định** (300/phút danh mục, 60/phút trợ lý): header, 429, Lighthouse.
  - **S3** `http://localhost:5555` — Production, nguồn **PostgreSql** (DB `dichvucong_t13`: 408 thủ tục, 75 lĩnh vực, phân công Hộ tịch quầy 3 / Đất đai quầy 4 + nơi tiếp nhận chuyển / Chứng thực quầy 1, 14 nhân sự), giới hạn lớn.
  - **S4** `http://localhost:5666` — như S3 nhưng **1.000 thủ tục** (`dichvucong_t13k`): đo p95.
  - **S5** `http://localhost:5777` — Production, nguồn Mẫu, giới hạn lớn: đo p95 và kích thước JS.
- Biến môi trường: `E2E_BASE_URL` (mặc định `https://localhost:7157`), `E2E_PG_URL` (S3), `E2E_RL_URL` (S2, chỉ ca 60/61 câu/phút), `ConnectionStrings__DichVuCongTest`, `DVC_KETQUA_DO`.
- Lệnh chính (ở `src/FrontEnd`): `npx playwright test -c e2e/ban-build.config.ts <linh-vuc|tro-ly|hien-thi-tro-ly|doc-cau-tra-loi|them-doc-cau-tra-loi|kiosk|bo-sung-kiosk> --project=chromium`; `npm run e2e:san-xuat`; ở gốc repo `dotnet test --solution src/BackEnd/DichVuCong.sln`. Script đo (p95, tải, 429, header, kích thước JS, CLS) nằm ở thư mục tạm của phiên, không commit.

## Kết quả chạy tự động tổng hợp (lượt này)

| Bộ | Kết quả |
|---|---|
| `npm run lint` | sạch |
| `npm test` (Vitest) | **1.116/1.116** (107 tệp). Lượt đầu 1 ca (`dieuHuongThayLichSu` "ngoài kiosk: vẫn PUSH") quá hạn 15 s lúc máy tải nặng; chạy riêng và chạy lại toàn bộ đều đạt |
| `npm run build` (`tsc -b` gồm `e2e/`) | sạch; "JS tải ban đầu ở `/`: 181,6 KiB" |
| `npm run e2e:san-xuat` (bản production obfuscate, preview) | **20/20** |
| Playwright F05 `linh-vuc.spec.ts` (S1, Chromium) | 84 ca: **81 đạt · 3 trượt** (VE-15, QY-14, TL-10) |
| `dotnet test --solution` có `ConnectionStrings__DichVuCongTest` | **1.392/1.392** đạt, 0 bỏ qua |
| `dotnet test --solution` không có DB thử | 1.129 đạt · **263 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | không có gói nào |

## Bảng case

| Nhóm | Số ca | Đạt | Đạt* | Trượt | Chờ | Chưa chạy | Ghi nhận |
|---|---|---|---|---|---|---|---|
| F05-TK · 1. Tìm lĩnh vực (BR-3; AC-1) | 16 | 14 | 1 | 0 | 1 | 0 | 0 |
| F05-LK · 2. Liên kết của ô lĩnh vực và cấp xã / cấp tỉnh (BR-1; AC-3… | 12 | 10 | 2 | 0 | 0 | 0 | 0 |
| F05-QR · 3. Nội dung mã QR (BR-1; AC-2, AC-7, AC-8) | 20 | 13 | 4 | 0 | 3 | 0 | 0 |
| F05-VE · 4. Chỉ vẽ QR cho ô đang hiện (BR-2; AC-4, AC-5) | 17 | 12 | 2 | 1 | 0 | 2 | 0 |
| F05-QY · 5. Quầy trên ô lĩnh vực (BR-4; AC-6, AC-9) | 19 | 18 | 0 | 1 | 0 | 0 | 0 |
| F05-VH · 6. Ghi chú vận hành khi in QR (BR-5) | 6 | 0 | 0 | 0 | 5 | 1 | 0 |
| F05-DC · 7. Địa chỉ trang, tải, lỗi, dữ liệu rỗng | 3 | 3 | 0 | 0 | 0 | 0 | 0 |
| F05-TL · 7. Địa chỉ trang, tải, lỗi, dữ liệu rỗng | 11 | 8 | 0 | 1 | 0 | 2 | 0 |
| F05-KS · 8. Kiosk (F09) — phần của F05 | 6 | 4 | 0 | 0 | 1 | 1 | 0 |
| F05-TN · 9. Trợ năng (WCAG 2.1 AA) | 11 | 8 | 0 | 0 | 1 | 2 | 0 |
| F05-BM · 10. Bảo mật (CLAUDE.md > Bảo mật) | 21 | 15 | 1 | 0 | 0 | 5 | 0 |
| F05-HN · 11. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9; AC-4) | 12 | 7 | 0 | 1 | 0 | 4 | 0 |
| F05-HD · 12. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9; T11) | 10 | 4 | 5 | 0 | 0 | 1 | 0 |
| **Tổng** | **164** | **116** | **15** | **4** | **11** | **18** | **0** |

Ghi chú ký hiệu: **Đạt** = tester đã chạy (Playwright, xUnit trên PostgreSQL thật, script trên bản publish Release) và kết quả đúng kỳ vọng. **Đạt*** = ca thuộc suite Vitest/xUnit của dev, suite xanh nhưng tester chưa đối chiếu từng khẳng định. **Chờ** = cần thiết bị/giọng/trình đọc màn hình thật hoặc tài liệu vận hành chưa có. **Chưa chạy** = chưa có ca tự động tương ứng trong lượt này.

**Ca Đạt (116):** TK: 01–13, 16 · LK: 01–05, 07–10, 12 · QR: 01–02, 04–10, 13–14, 16, 20 · VE: 01–05, 07–08, 11–14, 17 · QY: 01–13, 15–19 · DC: 01–03 · TL: 01–02, 04–08, 11 · KS: 01–03, 05 · TN: 01–02, 04–05, 07–10 · BM: 01–03, 05–10, 12–13, 15–17, 20 · HN: 01–06, 12 · HD: 01, 05–06, 10

**Ca Đạt* (15):** TK: 14 · LK: 06, 11 · QR: 03, 11–12, 15 · VE: 09–10 · BM: 21 · HD: 02–04, 07, 09

Ca không phải Đạt (từng ca):

| Case | AC/BR | Kết quả | Ghi chú |
|---|---|---|---|
| F05-HN-11 | plan §5 (CLS) | Trượt | CLS khi khung chờ → lưới ở 1280×800: 0,3755 (75 ô), 0,108 (8 ô, quầy trễ 5 s); Lighthouse mobile 375: 0,000. Lỗi L1 |
| F05-QY-14 | BR-4 (CLS) | Trượt | CLS khung chờ → lưới 8 ô khi quầy trễ 5 s = 0,108 (> 0,1) ở 1280; khung chờ hiện tới khi cả hai xong (đúng). Lỗi L1 |
| F05-TL-10 | plan §4.3 (cache dùng chung) | Trượt | /api/linh-vuc bị gọi lại khi sang từ /thu-tuc (khoá TanStack riêng ở danhMucThuTuc.ts); /api/linh-vuc/quay có tải (đúng). Lỗi L2 |
| F05-VE-15 | BR-2 (CLS) | Trượt | CLS 375 = 0,0007 (đạt) nhưng 1280×800 = 0,3755 khi chunk QR trễ 3 s (75 ô): chân trang bị đẩy khỏi màn hình. Lỗi L1 · cls: 375: 0.0007 ["163ms 0.0007 A._thuongHieu_11sp8_26 10→3 scrollY=0"]; cls: 1280: 0.3755 ["232ms 0.3755 FOOTER._chanTrang_xfigc_3 496→0 scrollY=0"]; cls: 375: 0.0007 ["163ms 0.000… |
| F05-KS-06 | AC-2 (kiosk thật) | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F05-QR-17 | BR-1, AC-2 (điện thoại thật) | Chờ | thử tay: quét QR bằng iPhone/Android/Zalo (tên miền đang mở, ghi lại khi thử) |
| F05-QR-18 | BR-1, AC-7 (điện thoại thật) | Chờ | thử tay: quét QR bằng iPhone/Android/Zalo (tên miền đang mở, ghi lại khi thử) |
| F05-QR-19 | BR-1 (bản in) | Chờ | thử tay: quét QR bằng iPhone/Android/Zalo (tên miền đang mở, ghi lại khi thử) |
| F05-TK-15 | BR-3 (Telex/VNI) | Chờ | thử tay Unikey Telex/VNI |
| F05-TN-06 | Tên đọc QR | Chờ | thử tay NVDA/TalkBack |
| F05-VH-01 | BR-5 (ý 1) | Chờ | tài liệu vận hành (kế hoạch 8.5) chưa có |
| F05-VH-02 | BR-5 (ý 2) | Chờ | tài liệu vận hành (kế hoạch 8.5) chưa có |
| F05-VH-03 | BR-5 (ý 3) | Chờ | tài liệu vận hành (kế hoạch 8.5) chưa có |
| F05-VH-05 | BR-5 (hệ quả tên miền) | Chờ | thử tay: quét bản in từ 127.0.0.1 |
| F05-VH-06 | BR-5 (quét thử sau in) | Chờ | tài liệu vận hành (kế hoạch 8.5) chưa có |
| F05-BM-04 | plan §3.1 (đầu vào) | Chưa chạy | Gửi |
| F05-BM-11 | plan §6 (tên miền trong QR) | Chưa chạy | curl -k -H "Host: evil.example" https://<máy>/linh-vuc |
| F05-BM-14 | plan §6 (từ khoá) | Chưa chạy | Gõ "khai sinh" rồi quan sát mạng; gõ giả CCCD/điện thoại/email (012345678901, 09123456… |
| F05-BM-18 | plan §6 (lưu trữ) | Chưa chạy | Đọc localStorage, sessionStorage, cookie |
| F05-BM-19 | plan §6 (lỗi) | Chưa chạy | GET /api/linh-vuc/quay |
| F05-HD-08 | F00 §9 | Chưa chạy | chưa chạy e2e F05 trên API PostgreSQL |
| F05-HN-07 | plan §5 | Chưa chạy | Đếm yêu cầu mạng ban đầu |
| F05-HN-08 | plan §5 | Chưa chạy | chưa đo kích thước thô/nén riêng |
| F05-HN-09 | plan §5 | Chưa chạy | Gõ từng phím "lĩnh vực thử" ở 375, mạng 4G giả lập; đo từ phím cuối đến khi dòng số kết q… |
| F05-HN-10 | plan §5 | Chưa chạy | document.querySelectorAll('*').length; performance.memory (Chromium) |
| F05-KS-04 | F09 BR-7 | Chưa chạy | chưa chạy riêng; hành vi "Bắt đầu lại" kiểm ở F09-BL |
| F05-TL-03 | F08 AC-11 | Chưa chạy | Mở rồi bật mạng, "Thử lại" |
| F05-TL-09 | plan §4.3 | Chưa chạy | Xem |
| F05-TN-03 | C01 AC-1 | Chưa chạy | Tab liên tục tới ô thứ 40 |
| F05-TN-11 | C01 AC-3 | Chưa chạy | Xem ô đang focus, ô tìm |
| F05-VE-06 | AC-5 (biên hình học) | Chưa chạy | Cuộn sao cho một ô chỉ lấp ló 1 px ở mép dưới; ô nằm dưới đầu trang dính |
| F05-VE-16 | BR-2, BR-5 (hành vi in khi … | Chưa chạy | Đếm QR trong PDF |
| F05-VH-04 | BR-5 (hành vi in) | Chưa chạy | chưa dựng ca in PDF |

### Số đo đáng ghi (từ các ca Đạt)

- **AC-5 · đếm QR theo khổ 375×667 (VE-01…04)**: đầu trang thấy 2 ô → 2 QR; cuộn từng màn hình: thấy 2/3/4/4 ô → QR tích luỹ 2 → 4 → 7 → 10 → … → cuối trang đủ **75** (mỗi ô đúng một `svg`, cả 18 ô chỉ cấp tỉnh); cuộn ngược lên vẫn 75. QR đầu ở 1280×800 = 10, ở kiosk 1080×1920 = 24 (đúng số ô giao khung nhìn). Không `longtask` nào > 200 ms khi cuộn nhanh tới cuối.
- **AC-7 · giải mã 75/75 QR bằng `jsqr`** (dựng ảnh điểm từ `<path>` trong DOM) = `origin` + `href` của ô; 57 ô `cap=xa`, 18 ô `cap=tinh`; mở 75 địa chỉ `/thu-tuc?cap=…&lv=…`: không lần nào "Không tìm thấy lĩnh vực" hay danh sách rỗng. QR ảnh chụp thật (`element.screenshot` → PNG → canvas → `jsqr`) giải mã đúng ở 375/1280/kiosk × `deviceScaleFactor` 2 và 3, kể cả mã dài nhất 69 ký tự; mã 150 ký tự (link 191 byte) vẫn giải mã được; `forced-colors: active` vẫn giải mã được.
- **AC-2 · tên miền**: QR chứa đúng tên miền/cổng đang mở (`localhost:7157` và `127.0.0.1:7157`), không viết cứng.
- **AC-6 · quầy**: nguồn Mẫu `[]` → không chữ "Quầy", ô cùng hàng cao bằng nhau, không phần tử rỗng; nhập `phan-cong` bằng công cụ nhập thật → "Hộ tịch" quầy 3, ETag đổi, `If-None-Match` cũ trả 200; dòng chỉ có nơi tiếp nhận chuyển không xuất hiện; "HỘ   TỊCH" khớp `ho-tich`.
- **AC-9 · quầy lỗi** (mạng bị chặn, 500, 429): đủ 75 ô và 75 QR khi cuộn, không dòng quầy, không `role="alert"`, không "Thử lại". Chỉ `/api/linh-vuc` lỗi → "Chưa tải được dữ liệu." + "Thử lại" + mã tra cứu.
- **Hành vi ghi nhận**: thân quầy sai hình (`{}`, `null`, `"x"`, thiếu `quay`) → bỏ qua, 8 ô, không lỗi; `quay` là chuỗi `"3"` hiện "Quầy 3"; `quay` 0 và -1 hiện "Quầy 0", "Quầy -1" (BE không bao giờ gửi số này); gõ "ho-tich" (gạch ngang) → 0 ô (tìm theo tên, không theo mã); chunk `QrLinhVuc` bị chặn → cả lưới biến mất kèm thông báo lỗi (xem L3); quầy treo không trả lời → sau 12 s vẫn khung chờ (xem L4).

## Kết quả bảo mật

| Kiểm tra | Kết quả |
|---|---|
| `curl -I` `/` và `/api/tro-ly/chu-de`, và 17 loại phản hồi (HTML, JS, JSON, 404, 405, 413, 429, POST) trên Production https | **Đạt**: CSP đúng nguyên văn `CLAUDE.md`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` đủ; **không** header `Server`/`X-Powered-By`/CORS |
| Playwright `/linh-vuc` (cuộn hết 75 QR): CSP, console, yêu cầu ra ngoài | **Đạt**: 0 vi phạm CSP, 0 lỗi console, 0 yêu cầu tới tên miền ngoài, không `style` nội tuyến ở `svg` QR |
| Đầu vào: tên lĩnh vực chứa HTML/`<img onerror>` (LX), `q` độc hại trên địa chỉ, ô tìm 5.000 ký tự, SQL/regex trong ô tìm | **Đạt**: hiện nguyên văn dạng chữ, 0 hộp thoại, không lỗi, ô giữ ≤ 100 ký tự |
| `GET /api/linh-vuc/quay`: khoá JSON, POST → 405, `?x=1`/`?x=2` cùng thân, ETag + `Cache-Control: no-cache`, rate limit | **Đạt**: chỉ `linhVucMa`, `quay`; 300 lần 200, lần 301 → 429 `Retry-After: 60` |
| Bản build: `.map`, `.pdb`, `.xml`, `sourceMappingURL` | **Đạt**: 0 (`wwwroot` và bản publish) |
| Obfuscate: chunk dự án / thư viện | **Đạt**: `QrLinhVuc-*.js` đã obfuscate; `qr-*.js` (`uqr`) giữ nguyên, không chứa tên hàm dự án |
| `npm audit --omit=dev`, `dotnet list package --vulnerable --include-transitive` | **Đạt**: 0 / không gói nào |
| Chuỗi kết nối (`Password=`, `Host=localhost`) trong `wwwroot`, bản publish, `appsettings*.json` | **Đạt**: không có |
| `dangerouslySetInnerHTML`, `style=` ở `features/linh-vuc` | **Đạt**: không có (chỉ một dòng chú thích) |
| QR không chứa từ khoá tìm: gõ "dat dai" rồi giải mã QR "Đất đai" | **Đạt**: không có `q` |

## Kết quả hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu `/linh-vuc` (gzip -9) 375 và 1280 | **169,1 KiB** (vendor 120,0 · index 28,3 · useDanhSachUrl 6,2 · LinhVuc 5,1 · qr 3,6 · QrLinhVuc 1,8 …) | ≤ 200 KB |
| JS tải ban đầu `/` (lúc load → sau 3,5 s) 375 / 1280 | 149,1 → **181,6** / 149,1 → **192,1** KiB; **không** tải `qr-*`, `QrLinhVuc-*` | ≤ 200 KB, không tăng so với trước F05 |
| Chunk riêng | `qr-*` 3,7 KiB · `QrLinhVuc-*` 1,9 KiB · `LinhVuc-*` 5,2 KiB (gzip -9) | — |
| Lighthouse mobile `/linh-vuc` ×3 (Production) | **98 · 98 · 98**; Accessibility/Best practices/SEO 100; LCP 2,07–2,08 s; TBT 23–35 ms; **CLS 0,000** | ≥ 85, CLS < 0,1 |
| Lighthouse mobile `/` ×3 / `/thu-tuc` ×3 (tham chiếu) | `/`: 96 · 96 · 97 (LCP 2,19–2,40 s) · `/thu-tuc`: 96 · 95 · 96 | ≥ 85 |
| p95 `GET /api/linh-vuc/quay` (1.000 lần, Release) | Mẫu **0,8 ms** · PostgreSQL 408 thủ tục **0,7 ms** · PostgreSQL 1.000 thủ tục **0,7 ms** (p99 ≤ 1,2 ms) | ≤ 300 ms |
| p95 `GET /api/linh-vuc` (1.000 lần) | **1,0 · 1,0 · 1,1 ms** | ≤ 300 ms |
| CLS khung chờ → lưới ở 1280×800 (chunk QR trễ 3 s; 75 ô) | **0,3755** (Trượt, L1) | < 0,1 |
| CLS khung chờ → lưới ở 1280×800 (quầy trễ 5 s; 8 ô) | **0,108** (Trượt, L1) | < 0,1 |
| CLS 375×667 cùng ca | 0,0007 | < 0,1 |
| Kiosk 1080×1920: lưới 4 cột, QR đầu 24, cuộn tới cuối 75 | đạt; axe 0 vi phạm sau khi cuộn hết 75 QR ở 375/768/1280/kiosk | — |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa | **L1** CLS lớn khi khung chờ chuyển sang lưới ở màn hình rộng/cao: khung chờ chỉ có 6 thẻ nên **chân trang đang nằm trong màn hình** rồi bị đẩy ra khi lưới 75 ô về: CLS 0,3755 ở 1280×800 (75 ô), 0,108 (8 ô, quầy trễ 5 s), kiosk 1080×1920 0,180. Lighthouse mobile (375) không bị: 0,000. Cùng nguyên nhân với F09 K1 (`/thu-tuc` kiosk 0,176) | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts linh-vuc --project=chromium -g "F05-VE-15"` (và `-g "F05-QY-14"`); hoặc ghi `layout-shift` của `PerformanceObserver` khi mở `/linh-vuc?kiosk=1` ở 1080×1920 (nguồn: `FOOTER` 1569→0). Gợi ý: khung chờ cao gần bằng nội dung thật (hoặc chân trang chỉ hiện sau khi nội dung xong) | ui-core-dev (`Skeleton`/`Layout`), frontend-dev (`KhungCho` của `LinhVuc.tsx`) |
| Thấp | **L2** Từ `/thu-tuc` sang `/linh-vuc` trong 60 giây, `GET /api/linh-vuc` bị gọi lại: F04 dùng khoá TanStack riêng ở `core/api/danhMucThuTuc.ts`, không phải `['linh-vuc']` như plan F05 §4.3 | `npx playwright test -c e2e/ban-build.config.ts linh-vuc -g "TL-10"` | ui-core-dev (đưa `useLinhVuc`/khoá dùng chung) |
| Thấp | **L3** Chunk `QrLinhVuc-*.js` nạp lỗi (mạng/Cloudflare) làm **cả lưới biến mất** (0 ô, thông báo lỗi của route) thay vì chỉ ô đó hiện khung xám như kỳ vọng VE-14 | chặn `QrLinhVuc-*.js` bằng `page.route` rồi mở `/linh-vuc` (annotation của F05-VE-14: `QR=0, ô=0, thông báo lỗi=2`) | frontend-dev (bọc `QrLinhVuc` trong ranh giới lỗi nhỏ ở `OLinhVuc`) |
| Thấp | **L4** `GET /api/linh-vuc/quay` treo (không trả lời, không lỗi) thì cả lưới kẹt ở khung chờ vô hạn (ghi nhận sau 12 s); `http()` không có hạn chờ (đã nêu ở `review.md` F05, F06) | `page.route('**/api/linh-vuc/quay', () => new Promise(() => {}))`; F05-QY-15 | ui-core-dev (`core/api/http` hạn chờ), frontend-dev (trần chờ riêng cho quầy) |
| Thấp | **L5** (tài liệu/số đo) `h1` ẩn trùng chữ với `h2`: "Lĩnh vực và mã QR" (testcases TL-08 ghi "Lĩnh vực"); vùng bấm ✕ của ô tìm 26×26 px: đạt spec C01 (≥ 24 px) nhưng testcases TN-10 ghi 44 px — testcases sẽ sửa theo spec; `quay` kiểu chuỗi/0/âm FE vẫn hiển thị "Quầy 3/0/-1" (BE không gửi) | F05-TL-07/08/11, F05-TN-10, F05-QY-11 | tester (sửa testcases), frontend-dev (tuỳ chọn: bỏ qua `quay` ≤ 0 hoặc không phải số nguyên) |

## Ca thử tay — chờ (liệt kê gọn)

- QR-17, QR-18: quét QR "Hộ tịch" và một lĩnh vực chỉ cấp tỉnh bằng camera iPhone, camera Android, Zalo — từ **màn hình máy tính**; ghi **tên miền đang mở** khi thử (câu hỏi mở 10, AC-2).
- QR-19, VH-05: in A4, mỗi QR cỡ 3 cm (mã ngắn "ho-tich", mã dài nhất 69 ký tự, một lĩnh vực chỉ cấp tỉnh); quét bản in; mở bằng `127.0.0.1` rồi in để thấy đúng cảnh báo BR-5.
- KS-06: quét QR từ màn hình kiosk thật. TK-15: Unikey Telex/VNI. TN-06: NVDA/TalkBack đi qua một ô (75 hình đọc có gây nhiễu không).
- VH-01…VH-03, VH-06: đối chiếu tài liệu vận hành giai đoạn 8 (kế hoạch 8.5) khi có: tên miền chính thức, cuộn hết trang trước khi in, quét thử cả hai loại lĩnh vực.

## Kết quả từng task

- **T11** (tích hợp PostgreSQL): `Integration/QuayLinhVuc/QuayLinhVucTrenPostgreSqlTests.cs` (mới, 4 ca) + lớp con hợp đồng đã có. Xanh với DB thật; bỏ qua có thông báo khi không có DB thử. Sửa kèm: `BoFileNhap` nhận dữ liệu `phan-cong`/`nhan-su`/viết tắt; `HaTangHttp.cs` không đếm lệnh `DELETE cau_chua_tra_loi` của việc nền F06 (xem ghi chú ở F04 `test.md`).
- **T12** (E2E, hiệu năng): `e2e/linh-vuc.spec.ts`, `e2e/du-lieu/linh-vuc.ts`; Lighthouse, tổng JS, p95 như trên. Ca thử tay: liệt kê ở trên.
