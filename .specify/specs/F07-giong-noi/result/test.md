CHƯA ĐẠT

# F07 · Đọc câu trả lời — kết quả kiểm thử (T09, T10, T11)

## Lượt xác nhận (2026-10-14)

Kết quả mới nhất của F07 nằm ở mục này; các mục bên dưới là lượt 2026-10-13 (giữ để đối chiếu).

- **Kết luận: CHƯA ĐẠT** — chỉ còn **1 ca trượt mức Thấp**: F07-NL-08 (chunk phần đọc `docCauTraLoi-*` **4,15 KiB** gzip -9, mục tiêu 3 KB của plan; trước 3,9 KiB). Đây là quyết định của planner (nâng mục tiêu hoặc rút luật đọc), không phải lỗi chức năng. Số ca (162): Đạt **101** · Đạt\* **31** · Trượt **1** · Chờ **17** · Chưa chạy **11** · Ghi nhận **1** (trước: 100 · 31 · 2 · 17 · 11 · 1). F07-KS-01 nay đạt.
- Playwright `doc-cau-tra-loi.spec.ts` **37/37**, `them-doc-cau-tra-loi.spec.ts` **8/8** (thêm kiểm mọi `IconButton` trong khung ở kiosk). `trang_thai` vẫn `dang-lam`: còn NL-08 và 17 ca Chờ (giọng thật Windows/Android/iPhone/Zalo/kiosk, NVDA/TalkBack).
- Ngày chạy: 2026-10-14 (lượt xác nhận cuối sau khi dev sửa các lỗi lượt 2026-10-13). Người chạy: tester. Tuần tự, một trình duyệt tại một thời điểm. Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`postgres`); Docker không chạy nên không có Testcontainers (ca DB thật dùng `DbThuNghiem`, biến `ConnectionStrings__DichVuCongTest`).
- Bản kiểm: `npm run build` mới (JS ban đầu **184,9 KiB** gzip) rồi `dotnet publish -c Release` (không `.pdb`/`.map`). Máy chủ: **S1** `https://localhost:7157` (Development, nguồn Mẫu, giới hạn 100000/phút) chạy e2e; **S2** `https://localhost:5443` (Production, giới hạn mặc định 300/60 mỗi phút) cho header, 429, Lighthouse; **S3** `http://localhost:5555` (Production, nguồn PostgreSql, DB tạm `dichvucong_t15` dựng bằng `DuLieuMau` → `dotnet ef database update` → công cụ nhập, có 3 phân công quầy + 3 nhân sự; đã xoá sau khi chạy).

### Xác nhận

| Điểm | Kết quả | Bằng chứng |
|---|---|---|
| Nút đọc và `IconButton` ở kiosk 1080×1920 ≥ 48 px (F7-2) | **Đã sửa** | F07-KS-01b: nút đọc ≥ 48 × 48; thêm kiểm mọi nút chỉ có biểu tượng trong khung (đọc, ✕…) ≥ 48 px, danh sách vi phạm rỗng |
| `laLienKetCongDvc("https://DICHVUCONG.GOV.VN./x")` | **Đúng** (viết hoa + dấu chấm cuối là Cổng DVC; `dichvucong.gov.vn..evil.com`, `dichvucong.gov.vn.evil.com.` không) | Vitest `laLienKetCongDvc.test.ts` (9 đúng · 16 sai) và e2e `F09-NH-21…` trên bản đã obfuscate: 1 dòng nhắc và 0 dòng nhắc đúng như kỳ vọng |
| Chunk phần đọc | **Trượt F7-1** (Thấp): 4.150 byte gzip -9 (10,0 KB thô) so mục tiêu 3 KB | `gzip -9 -c wwwroot/assets/docCauTraLoi-*.js \| wc -c` |
| Tải ban đầu không kéo phần đọc | **Đạt**: không có `docCauTraLoi-*` trong tải của `/`; không gọi `/api/tro-ly/viet-tat` khi chưa bật | `doc-cau-tra-loi.spec.ts` |
| Vùng bấm (testcases ghi 44 px, spec C01 ≥ 24 px) | **Đã chỉnh `testcases.md`** TN-04 | — |

- JS tải ban đầu (gzip -9, đo thật lúc 3,5 s): `/` 375 **184,9 KiB** · 1280 **195,3 KiB** (còn 4,7 KiB so với trần 200 KiB — sát) · kiosk **187,5 KiB**; `/thu-tuc` 177,2 · 187,6 · 181,1; `/linh-vuc` 171,3 · 171,3 · 175,1.
- p95 (1.000 lần, bản Release, máy dev): nguồn Mẫu — `GET /api/thu-tuc` **4,0 ms**, `/api/linh-vuc` 1,1, `/api/linh-vuc/quay` 0,8, `/api/trung-tam` 0,9, `/api/tro-ly/chu-de` 0,9, `/api/thu-tuc/{ma}` 1,2, `POST /api/tro-ly/hoi` **6,5 ms**; PostgreSQL 408 thủ tục — 3,9 · 1,0 · 0,8 · 0,7 · 0,7 · 1,1 · **3,7 ms**; ngân sách ≤ 300 ms. (`GET /api/tro-ly/viet-tat` đo ở lượt trước: ≤ 1,2 ms.)
- Bảo mật: không đổi so với lượt 2026-10-13 (văn bản đọc không rời máy, không micro, CSP 0 vi phạm); header, `.map`/`.pdb`, audit:

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

### Lỗi còn lại của F07

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Thấp | **F7-1** chunk `docCauTraLoi-*.js` 4.150 byte gzip -9 > 3 KB (mục tiêu plan; ngân sách JS ban đầu 200 KB không bị ảnh hưởng vì chunk nạp lười) | `gzip -9 -c src/BackEnd/DichVuCong.Api/wwwroot/assets/docCauTraLoi-*.js \| wc -c` | planner (chấp nhận ≈ 4–5 KB hay yêu cầu rút luật đọc), chatbot-dev nếu rút |

Đã đóng: F7-2 (≥ 48 px ở kiosk), F7-3 (testcases).

### Ca thử tay — chờ (không đổi)

GD-16/17/18 (giọng thật Windows/Android/iPhone Safari/Zalo/kiosk; ghi tỷ lệ máy có nút — Cần hỏi 4), DO-05/17/18/20/21, DG-04/16, VT-20, KS-04/05, TN-06/07, MC-08.

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T06 (chatbot-dev); `review.md` ĐẠT (0 Chặn, 0 Nên sửa). Giọng đọc **giả** (Chromium không có giọng tiếng Việt sẵn): `speechSynthesis`/`SpeechSynthesisUtterance` thay bằng bản ghi `getVoices`, `speak`, `cancel`; giọng thật, iPhone, Zalo, NVDA là ca "thử tay — chờ".
- **Kết luận: CHƯA ĐẠT** — không có lỗi *Chặn* hay *Nên sửa*; còn **2 ca trượt mức Thấp** (F07-NL-08: chunk phần đọc 3,9 KB gzip > mục tiêu 3 KB; F07-KS-01: nút đọc ở kiosk 47,5×47,5 px < 48). Mọi AC có ít nhất một ca đạt (AC-1 đọc đáp án, AC-2 "TTHC" → "thủ tục hành chính" mà màn hình vẫn "TTHC", AC-3/AC-8 tắt/đóng khung dừng ngay, AC-4 mặc định tắt, AC-5 máy không giọng cục bộ → ẩn nút không lỗi, AC-6 không micro, AC-7 câu mới dừng câu cũ).
- Số ca (162): Đạt **100** · Đạt\* **31** · Trượt **2** · Chờ **17** · Chưa chạy **11** · Ghi nhận **1** (tổng 162). Playwright: `doc-cau-tra-loi.spec.ts` 37/37, `them-doc-cau-tra-loi.spec.ts` 7 đạt + 1 trượt (KS-01b). Tích hợp PostgreSQL (T09): 3 ca mới + lớp con hợp đồng đạt.
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn 2 ca trượt mức Thấp và 17 ca Chờ (giọng thật Windows/Android/iPhone/Zalo/kiosk, NVDA/TalkBack, nghe câu thật). Đổi sang `xong` khi các ca đó đạt. **Cần hỏi 4** (tỷ lệ máy có nút): chưa đo được, cần máy thật.

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
| `npm test` (Vitest) | **1.116/1.116** (107 tệp) |
| `npm run build` (`tsc -b` gồm `e2e/`) | sạch |
| `npm run e2e:san-xuat` | **20/20** |
| Playwright F07 (S1, Chromium) | `doc-cau-tra-loi.spec.ts` **37/37** · `them-doc-cau-tra-loi.spec.ts` **7 đạt · 1 trượt** (KS-01b) |
| `dotnet test --solution` có `ConnectionStrings__DichVuCongTest` | **1.392/1.392** đạt, 0 bỏ qua |
| `dotnet test --solution` không có DB thử | 1.129 đạt · **263 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` / `dotnet list package --vulnerable --include-transitive` | 0 lỗ hổng / không gói nào |

## Bảng case

| Nhóm | Số ca | Đạt | Đạt* | Trượt | Chờ | Chưa chạy | Ghi nhận |
|---|---|---|---|---|---|---|---|
| F07-GD · 1. Chọn giọng và hiện nút (BR-1, BR-2; AC-5) | 18 | 13 | 2 | 0 | 3 | 0 | 0 |
| F07-BT · 2. Nút bật/tắt, mặc định, nhớ lựa chọn (BR-5; AC-3, AC-4) | 16 | 12 | 2 | 0 | 0 | 2 | 0 |
| F07-DO · 3. Đọc câu trả lời (AC-1, AC-7; BR-7) | 21 | 11 | 5 | 0 | 5 | 0 | 0 |
| F07-VT · 4. Đọc viết tắt, số, đơn vị (BR-3; AC-2) | 20 | 4 | 13 | 0 | 2 | 1 | 0 |
| F07-DG · 5. Dừng đọc (BR-7; AC-3, AC-7, AC-8) | 17 | 7 | 4 | 0 | 2 | 4 | 0 |
| F07-NL · 6. Phần đọc chỉ tải khi bật (BR-4) | 10 | 8 | 0 | 1 | 0 | 0 | 1 |
| F07-MC · 7. Không dùng micro (BR-6; AC-6) | 8 | 7 | 0 | 0 | 1 | 0 | 0 |
| F07-KS · 8. Kiosk (F09) — phần của F07 | 5 | 2 | 0 | 1 | 2 | 0 | 0 |
| F07-TN · 9. Trợ năng (WCAG 2.1 AA) | 11 | 6 | 0 | 0 | 2 | 3 | 0 |
| F07-BM · 10. Bảo mật (CLAUDE.md > Bảo mật) | 19 | 16 | 3 | 0 | 0 | 0 | 0 |
| F07-HN · 11. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9) | 9 | 6 | 2 | 0 | 0 | 1 | 0 |
| F07-HD · 12. Tích hợp PostgreSQL (T09) | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| **Tổng** | **162** | **100** | **31** | **2** | **17** | **11** | **1** |

Ghi chú ký hiệu: **Đạt** = tester đã chạy (Playwright, xUnit trên PostgreSQL thật, script trên bản publish Release) và kết quả đúng kỳ vọng. **Đạt*** = ca thuộc suite Vitest/xUnit của dev, suite xanh nhưng tester chưa đối chiếu từng khẳng định. **Chờ** = cần thiết bị/giọng/trình đọc màn hình thật hoặc tài liệu vận hành chưa có. **Chưa chạy** = chưa có ca tự động tương ứng trong lượt này.

**Ca Đạt (100):** GD: 01–11, 13–14 · BT: 01–04, 06, 08–12, 14–15 · DO: 01–04, 06–07, 10–12, 14–15 · VT: 01, 17–19 · DG: 01–03, 05–06, 11, 15 · NL: 01–07, 10 · MC: 01–07 · KS: 02–03 · TN: 01–05, 11 · BM: 01, 04–10, 12–19 · HN: 01–04, 06, 09 · HD: 01–08

**Ca Đạt* (31):** GD: 12, 15 · BT: 07, 13 · DO: 08–09, 13, 16, 19 · VT: 02–05, 07–10, 12–16 · DG: 07–08, 10, 17 · BM: 02–03, 11 · HN: 07–08

Ca không phải Đạt (từng ca):

| Case | AC/BR | Kết quả | Ghi chú |
|---|---|---|---|
| F07-KS-01 | C01 AC-2 | Trượt | nút đọc ở kiosk 1080×1920 cao/rộng 47,5 px < 48 px (testcases KS-01, C01 AC-2); vị trí giữa tên khung và ✕ đúng. Lỗi F7-2 (Thấp) · do: 47.5×47.5 px; do: 47.5×47.5 px |
| F07-NL-08 | BR-4 | Trượt | chunk docCauTraLoi-*.js = 3.900 byte gzip -9 (9,4 KB thô, đã obfuscate) > 3 KB của kế hoạch ("vượt → báo planner"); khung 20,5 KiB gzip ≤ 25. Lỗi F7-1 (Thấp) |
| F07-NL-09 | BR-4 | Ghi nhận | index 28,7 KiB, vendor 122,8 KiB, KhungTroLy 20,5 KiB gzip -9; không có số đo trước F07 để so "tăng 0 byte" |
| F07-DG-04 | AC-8 (tiếng thật) | Chờ | thử tay: tiếng thật ngừng khi đóng khung / bấm Bắt đầu lại |
| F07-DG-16 | BR-7 (giọng thật, kiosk) | Chờ | thử tay: tiếng thật ngừng khi đóng khung / bấm Bắt đầu lại |
| F07-DO-05 | AC-1 (Chrome) | Chờ | thử tay: Chrome/iPhone thật (đọc hết, không dừng giữa chừng, có tiếng sau mở khoá) |
| F07-DO-17 | plan Q6 | Chờ | thử tay: Chrome/iPhone thật (đọc hết, không dừng giữa chừng, có tiếng sau mở khoá) |
| F07-DO-18 | plan Q8 (iOS) | Chờ | thử tay: Chrome/iPhone thật (đọc hết, không dừng giữa chừng, có tiếng sau mở khoá) |
| F07-DO-20 | plan §4.5 | Chờ | thử tay: Chrome/iPhone thật (đọc hết, không dừng giữa chừng, có tiếng sau mở khoá) |
| F07-DO-21 | Chrome thật | Chờ | thử tay: Chrome/iPhone thật (đọc hết, không dừng giữa chừng, có tiếng sau mở khoá) |
| F07-GD-16 | BR-2, AC-5 (thiết bị thật) | Chờ | thử tay: giọng thật Windows/Android/iOS/kiosk; ghi tỷ lệ máy có nút (Cần hỏi 4) |
| F07-GD-17 | BR-2 (Cần hỏi 4) | Chờ | thử tay: giọng thật Windows/Android/iOS/kiosk; ghi tỷ lệ máy có nút (Cần hỏi 4) |
| F07-GD-18 | BR-2 (kiosk) | Chờ | thử tay: giọng thật Windows/Android/iOS/kiosk; ghi tỷ lệ máy có nút (Cần hỏi 4) |
| F07-KS-04 | plan §9 mục 5 (vận hành) | Chờ | thử tay trên kiosk thật / tài liệu vận hành |
| F07-KS-05 | plan §8 rủi ro 3 | Chờ | thử tay trên kiosk thật / tài liệu vận hành |
| F07-MC-08 | AC-6 (thiết bị thật) | Chờ | thử tay: trình duyệt thật không hỏi quyền micro |
| F07-TN-06 | plan §4.2 | Chờ | thử tay NVDA/TalkBack |
| F07-TN-07 | plan §4.2 (xung đột) | Chờ | thử tay NVDA/TalkBack |
| F07-VT-11 | plan Q9 (ngày, điều khoản) | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F07-VT-20 | BR-3 (nghe thật) | Chờ | thử tay: nghe thử "thủ tục hành chính", "quyết định Ủy ban nhân dân" |
| F07-BT-05 | AC-3 | Chưa chạy | Tải lại trang, mở khung |
| F07-BT-16 | BR-5 (kiosk) | Chưa chạy | Quan sát |
| F07-DG-09 | plan Q7 | Chưa chạy | Quan sát sau khi bảng về |
| F07-DG-12 | BR-7 (popup) | Chưa chạy | Mở popup chi tiết từ khung (khung inert, khungDangMo vẫn đúng) |
| F07-DG-13 | BR-7 (SPA) | Chưa chạy | Chuyển trang / → /thu-tuc bằng thanh điều hướng |
| F07-DG-14 | BR-7 | Chưa chạy | Chuyển tab trình duyệt (visibilitychange) |
| F07-HN-05 | plan §5 | Chưa chạy | Đếm setInterval/setTimeout do F07 tạo |
| F07-TN-08 | WCAG 1.4.3 | Chưa chạy | Đo tương phản |
| F07-TN-09 | WCAG 1.4.10 | Chưa chạy | Xem đầu khung |
| F07-TN-10 | plan §4.2 (ẩn nút) | Chưa chạy | Xem đầu khung |
| F07-VT-06 | BR-3 (ký tự đặc biệt) | Chưa chạy | b |

### Số đo và hành vi đáng ghi

- **BR-1/BR-2 chọn giọng**: chỉ giọng `localService` và `lang` `vi`, `vi-VN`, `vi_VN` được nhận; giọng mạng ("Online (Natural)", "Google Tiếng Việt"), `en-US`, `vie` → **không nút, không lỗi console**; không có `speechSynthesis`, `getVoices` ném lỗi → không nút, không `pageerror`; mọi `utterance` gán `voice` cục bộ và `lang` của giọng đó; thứ tự nhận xác định (vi-VN trước, rồi theo tên → "Alpha"). Giọng về trễ: hiện nút nhờ `voiceschanged` hoặc lần kiểm lại sau 1 s; cờ `doc-bat=1` mà máy không giọng → nút ẩn, không `speak`, cờ giữ nguyên.
- **BR-5**: mặc định tắt (không cờ, không `speak`); bật → `aria-pressed="true"`, `doc-bat="1"`; tắt → `cancel()` ngay, `doc-bat="0"`; bấm 10 lần liền nhất quán; `localStorage` bị chặn vẫn bật được trong phiên; storage chỉ có `doc-bat`/`cach-xem`; tải lại giữ nguyên lựa chọn; bật khi trên màn hình đã có đáp án **không** đọc câu cũ.
- **BR-3 / AC-2**: "Danh mục TTHC … QĐ-UBND … đk hộ tịch" → văn bản đọc "thủ tục hành chính", "quyết định Ủy ban nhân dân", "đăng ký"; **chữ trên màn hình vẫn "TTHC"**. Đổi bảng viết tắt (route `viet-tat`) → đọc theo bảng mới; `viet-tat` lỗi 500 → đọc nguyên văn, không báo lỗi. Câu dài 40 câu → nhiều `utterance` ≤ 180 ký tự đúng thứ tự; `**`, emoji, dấu ngoặc kép bị bỏ khỏi văn bản đọc; `rate` = 0,92.
- **BR-7/AC-7/AC-8**: đáp án mới → `cancel()` rồi chỉ phát nội dung mới; đóng bằng ✕, bằng nút "Trợ lý", bằng Esc → `cancel()` ngay (< 1,5 s kể cả chờ giao diện), mở lại không đọc tiếp, hội thoại còn; đáp án đến khi khung đóng không đọc; `pagehide` → `cancel()`; trình duyệt từ chối phát (`not-allowed`) → nút về tắt trong phiên, cờ vẫn "1", không lỗi. **Kiosk**: "Bắt đầu lại" → `cancel()` được gọi, `doc-bat` còn, khung rỗng, không đọc lại.
- **BR-4 nạp lười**: chưa bật → không tải `docCauTraLoi-*.js`, không `GET /api/tro-ly/viet-tat`; bật + đáp án đầu → đúng một lần mỗi thứ, câu sau không tải thêm; chunk nạp lỗi → nút còn, lần sau nạp được. Từ lúc đáp án về đến `speak()` đầu: **107 ms** (< 150 ms sau khi phần đọc đã nạp).
- **BR-6 micro**: 0 lần gọi `getUserMedia`/`SpeechRecognition`/`webkitSpeechRecognition`/`MediaRecorder` khi dùng trang + trợ lý + đọc; `permissions.query('microphone')` không phải đã cấp; không `<input capture>`/`<audio>`/`<video>`; `Permissions-Policy: microphone=()`; mã dự án chỉ nhắc các tên đó ở tệp test.
- **Số đo giao diện**: nút đọc 34×34 px ở 375 (đạt spec C01 ≥ 24 px; testcases TN-04 ghi 44 px) và **47,5×47,5 px ở kiosk (Trượt KS-01, F7-2)**; vị trí giữa tên khung và ✕ đúng; CLS khi nút hiện muộn: 0,0000.
- **Kích thước**: `docCauTraLoi-*.js` 9,4 KB thô / **3,9 KiB gzip -9** (đã obfuscate) so mục tiêu 3 KB (Trượt NL-08, F7-1); `KhungTroLy` 20,5 KiB gzip (≤ 25); bundle chính: JS tải ban đầu `/` 181,6–192,1 KiB (≤ 200); `index` 28,7 KiB, `vendor` 122,8 KiB gzip -9 (không có số đo trước F07 để chứng minh "tăng 0 byte" → NL-09 ghi nhận).

## Kết quả bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Văn bản đọc không rời máy (BR-1): khi đọc, yêu cầu mạng chỉ thêm `GET /api/tro-ly/viet-tat`; không giọng mạng (loại ở `chonGiong`) | **Đạt** |
| `GET /api/tro-ly/viet-tat`: header đầy đủ, ETag + `no-cache` + 304, chỉ hai khoá `chuVietTat`, `dayDu`, POST → 405, `?x` không đổi cache | **Đạt** (xUnit PostgreSQL + script; 300 lần 200 rồi 429 cùng chính sách danh mục) |
| Dữ liệu độc: `dayDu` chỉ vào `utterance.text`, không vào DOM; 0 hộp thoại | **Đạt** |
| Lưu trữ: chỉ cờ `doc-bat`; không nội dung hội thoại; không cookie | **Đạt** |
| CSP/console khi dùng nút đọc | **Đạt**: 0 vi phạm, 0 lỗi |
| Bản build: `.map`, `.pdb`; obfuscate `docCauTraLoi`; `npm audit`; `dotnet list package --vulnerable`; không thêm gói | **Đạt** |
| `dangerouslySetInnerHTML`, chuỗi kết nối | **Đạt**: không có |
| Micro (BR-6): xem trên | **Đạt** |

## Kết quả hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu `/` 375 / 1280 (gzip -9) | 181,6 / 192,1 KiB sau 3,5 s (149,1 lúc load); chunk phần đọc **không** nằm trong đó | ≤ 200 KB, không đổi so với trước F07 |
| Chunk phần đọc `docCauTraLoi-*` | **3,9 KiB** gzip -9 (Trượt, F7-1) | ≤ 3 KB (kế hoạch) |
| Từ đáp án về đến `speak()` | **107 ms** | < 150 ms |
| p95 `GET /api/tro-ly/viet-tat` (1.000 lần, Release) | Mẫu **0,7 ms** · PostgreSQL 408: **0,7 ms** · PostgreSQL 1.000 thủ tục: **1,2 ms** | ≤ 300 ms |
| Lighthouse mobile `/` ×3 | **96 · 96 · 97**; CLS 0,000 | ≥ 85 |
| CLS khi nút hiện muộn | **0,0000** | < 0,1 |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Thấp | **F7-1** Chunk phần đọc `docCauTraLoi-*.js` = 3.900 byte gzip -9 (9,4 KB thô, sau obfuscate), vượt mục tiêu 3 KB của plan (NL-08 ghi "vượt → báo planner, không tự cắt") | `gzip -9 -c src/BackEnd/DichVuCong.Api/wwwroot/assets/docCauTraLoi-*.js \| wc -c` sau `npm run build` | planner (chấp nhận 3,9 KB hay yêu cầu rút luật đọc), chatbot-dev nếu rút |
| Thấp | **F7-2** Nút đọc ở kiosk 1080×1920 rộng/cao **47,5 px** (`2,5rem` × 19 px) < 48 px (testcases KS-01, C01 AC-2); ✕ và các `IconButton` khác cùng cỡ | `npx playwright test -c e2e/ban-build.config.ts them-doc-cau-tra-loi --project=chromium -g "KS-01b"` | ui-core-dev (`IconButton`/token `--control-height` ở kiosk: `max(48px, …)`) |
| Thấp | **F7-3** (tài liệu) testcases TN-04 ghi vùng bấm 44 px (≥ 48 kiosk) nhưng spec C01 chỉ đòi ≥ 24 px; nút 34×34 ở 375 đạt theo spec | F07-TN-04 | tester (chỉnh testcases) |

## Ca thử tay — chờ (liệt kê gọn)

- **GD-16, GD-17, GD-18**: Windows (Chrome/Edge) có và không có giọng tiếng Việt cục bộ; Android Chrome; **iPhone Safari thật** (rủi ro 1: bật đọc rồi hỏi — có tiếng không, `not-allowed` thì nút về tắt); trình duyệt trong Zalo; máy kiosk thật. Ghi **tỷ lệ máy có nút** (Cần hỏi 4).
- **DO-05, DO-17, DO-18, DO-20, DO-21**: câu dài (hồ sơ nhiều giấy tờ) đọc hết không dừng giữa chừng trên Chrome thật; có tiếng sau khi mở khoá ở iOS; tốc độ 0,92 phù hợp người lớn tuổi; hai lần đọc liên tiếp đều có tiếng (không bị bỏ `speak` sau `cancel`).
- **DG-04, DG-16**: tiếng thật ngừng ngay khi đóng khung / bấm "Bắt đầu lại".
- **VT-20**: nghe "thủ tục hành chính", "quyết định Ủy ban nhân dân"; nghe thử câu thật (ngày, số hiệu văn bản, tiền) và ghi câu đọc kém để chatbot-dev thêm luật vào `luatDoc.ts`.
- **KS-04, KS-05, TN-06, TN-07, MC-08**: hướng dẫn vận hành giọng cục bộ cho kiosk; NVDA/TalkBack với nút đọc và khung; trình duyệt thật không hỏi quyền micro.

## Kết quả từng task

- **T09**: `Integration/Chatbot/DocCauTraLoi/VietTatDocServiceTrenPostgreSql.cs` — lớp con hợp đồng (JSON giống hệt Mẫu), `HaiNguon_DichVu_CungJsonTungByte`, `Http_HaiNguon_CungThanTungByte`, nhập lại `tro-ly` thêm "UBND" → API thấy dòng mới, ETag đổi, `If-None-Match` cũ không 304.
- **T10**: `e2e/doc-cau-tra-loi.spec.ts` (37 ca), `e2e/them-doc-cau-tra-loi.spec.ts` (8 ca); axe 0 vi phạm với nút đọc đang bật ở 375 và 1280 (và kiosk, trong `kiosk.spec.ts`); ngân sách JS như trên.
- **T11**: tài liệu này. Giọng thật và các thiết bị: liệt kê ở trên (thử tay — chờ). Điểm F09 đã kiểm: "Bắt đầu lại" dừng đọc, giữ `doc-bat`, khung rỗng (F09-BL, F07-KS-02/03).
