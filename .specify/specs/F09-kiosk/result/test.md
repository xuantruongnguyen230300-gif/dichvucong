CHƯA ĐẠT

# F09 · Kiosk dùng chung — kết quả kiểm thử (T08)

## Lượt xác nhận (2026-10-14)

Kết quả mới nhất của F09 nằm ở mục này; các mục bên dưới là lượt 2026-10-13 (giữ để đối chiếu).

- **Kết luận: CHƯA ĐẠT** — **1 ca trượt mới** mức *Nên sửa*: **F09-KB-11** (K5: ở chế độ kiosk, màn hình hẹp ≤ 414 px, trang `/` và `/thu-tuc` ở dạng thẻ **cuộn ngang** — nút "Xem và nộp trên Cổng DVC" của thẻ tràn ra phải; không xảy ra ngoài kiosk và không xảy ra từ 600 px trở lên). Ca này đạt ở lượt 2026-10-13, nên là lỗi mới do thay đổi của vòng sửa (nghi cỡ chữ/nút kiosk). Hai ca CLS cũ **F09-NH-29, F09-HN-04 nay đạt** (K1, K3 đã sửa). Số ca (171): Đạt **121** · Đạt\* **18** · Trượt **1** · Chờ **9** · Chưa chạy **21** · Ghi nhận **1** (trước: 120 · 18 · 2 · 9 · 21 · 1).
- Mọi AC 1–12 vẫn có ít nhất một ca đạt. `kiosk.spec.ts` **26/26** (gồm 60/61 câu/phút với `E2E_RL_URL`), `bo-sung-kiosk.spec.ts` **10/11** (KB-11 trượt).
- `trang_thai` của `spec.md` vẫn `dang-lam`: còn K5 và 9 ca Chờ (tài liệu vận hành BR-6 chưa có, thiết bị kiosk thật).
- Ngày chạy: 2026-10-14 (lượt xác nhận cuối sau khi dev sửa các lỗi lượt 2026-10-13). Người chạy: tester. Tuần tự, một trình duyệt tại một thời điểm. Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`postgres`); Docker không chạy nên không có Testcontainers (ca DB thật dùng `DbThuNghiem`, biến `ConnectionStrings__DichVuCongTest`).
- Bản kiểm: `npm run build` mới (JS ban đầu **184,9 KiB** gzip) rồi `dotnet publish -c Release` (không `.pdb`/`.map`). Máy chủ: **S1** `https://localhost:7157` (Development, nguồn Mẫu, giới hạn 100000/phút) chạy e2e; **S2** `https://localhost:5443` (Production, giới hạn mặc định 300/60 mỗi phút) cho header, 429, Lighthouse; **S3** `http://localhost:5555` (Production, nguồn PostgreSql, DB tạm `dichvucong_t15` dựng bằng `DuLieuMau` → `dotnet ef database update` → công cụ nhập, có 3 phân công quầy + 3 nhân sự; đã xoá sau khi chạy).

### Xác nhận

| Điểm | Kết quả | Bằng chứng |
|---|---|---|
| K1/K3 CLS ở kiosk | **Đã sửa** | `/` kiosk **0,0043** (API tức thì) · **0,0163** (trễ 3 s); `/thu-tuc` và `/linh-vuc` kiosk **0,0000** (cả hai chế độ trễ); trước 0,176 · 0,180 · 0,0511. Bảng đủ khổ ở dưới; `san-xuat.spec.ts` CLS kiosk 1080×1920 trễ 5 s < 0,05 |
| R1 / F09-KT-01 (K2) | **Đã sửa** | F09-KT-01 lặp 8 lần: 8/8 (trước 6/8); `tranh-ghi-dia-chi.spec.ts`: kiosk 60/60 (+40) + thường 40/40 + R1b 54/54, popup luôn mở và `q` còn |
| Nút "Bắt đầu lại" và nút đọc ở kiosk ≥ 48 px | **Đạt** | F09-NV-02/04/05, F09-TN-05, F07-KS-01b (nút đọc và mọi `IconButton` trong khung) |
| `laLienKetCongDvc` với `https://DICHVUCONG.GOV.VN./x` | **Đúng** | Vitest + ca e2e mới trong F09-NH-21…26 (bản obfuscate): 1 dòng nhắc; `dichvucong.gov.vn..evil.com` và `.evil.com.` → 0 dòng |
| `http()` có hạn chờ | **Đạt** | quầy treo → lưới hiện sau ≤ ~4–5 s (F05-QY-15); trợ lý treo → báo lỗi sau ≈ 15 s, nút Gửi không kẹt (F06-GH-30) |
| QR lỗi chunk chỉ mất QR của ô; `/linh-vuc` dùng chung cache | **Đạt** | F05-VE-14, F05-TL-10 |
| Kiosk ở 375 không cuộn ngang | **TRƯỢT (K5)** | F09-KB-11: `scrollWidth` 436 > `clientWidth` 375 ở `/?kiosk=1`; 409 > 320; 456 > 414; 600 px trở lên và mọi khổ ngoài kiosk: không tràn |

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
- JS tải ban đầu (gzip -9, đo thật lúc 3,5 s): `/` 375 **184,9 KiB** · 1280 **195,3 KiB** (còn 4,7 KiB so với trần 200 KiB — sát) · kiosk **187,5 KiB**; `/thu-tuc` 177,2 · 187,6 · 181,1; `/linh-vuc` 171,3 · 171,3 · 175,1. Chunk kiosk 2,5 KiB gzip.
- p95 (1.000 lần, bản Release, máy dev): nguồn Mẫu — `GET /api/thu-tuc` **4,0 ms**, `/api/linh-vuc` 1,1, `/api/linh-vuc/quay` 0,8, `/api/trung-tam` 0,9, `/api/tro-ly/chu-de` 0,9, `/api/thu-tuc/{ma}` 1,2, `POST /api/tro-ly/hoi` **6,5 ms**; PostgreSQL 408 thủ tục — 3,9 · 1,0 · 0,8 · 0,7 · 0,7 · 1,1 · **3,7 ms**; ngân sách ≤ 300 ms.
- Bảo mật:

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

### Lỗi còn lại của F09

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa | **K5** (mới) Kiosk + màn hình hẹp (≤ 414 px): thẻ thủ tục ở `/` và `/thu-tuc` tràn ngang — `A.nut.accent` "Xem và nộp trên Cổng DVC — …" kéo từ x = 199 tới 436 trong khung 375 (cuộn ngang trang 61 px). Chữ kiosk 118,75% + nút ≥ 48 px làm nút không còn xuống dòng/thu hẹp trong ô lưới. Kiosk thật là 1080×1920 nên ít ảnh hưởng thực tế, nhưng F09-KB-11 ("kiosk ở 375 không cuộn ngang") đã đạt trước đây | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts bo-sung-kiosk --project=chromium -g "KB-11"`; hoặc mở `/?kiosk=1` ở 375×812 | ui-core-dev (`core/kiosk/giaoDienKiosk.module.css`, `Button`/`luoiThe`: cho nút co/xuống dòng, `min-width: 0`), frontend-dev nếu ở thẻ thủ tục |
| Thấp | **K4** 9 ca VH và BL-26 chờ tài liệu vận hành (kế hoạch 8.5) | — | planner |

Đã đóng: K1, K2 (= R1), K3. R1c (test đơn vị chập chờn khi máy tải): xem F06.

### Ca thử tay — chờ (không đổi)

VH-01…VH-08 (hướng dẫn vận hành), BL-26 (bấm "Bắt đầu lại" trên kiosk thật: độ chớp, tiếng ngừng, "Quay lại"), KS-05 của F07, NV-15 (chạm một lần), TN-08 (NVDA đọc dòng nhắc theo thứ tự trang, không đọc hai lần), câu hỏi mở 10 (trình duyệt/hệ điều hành kiosk thật).

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T05 (ui-core-dev, frontend-dev, chatbot-dev); `review.md` ĐẠT (0 Chặn). F06 (khung trợ lý) và F07 (đọc) đã xong nên **các ca AC-2, AC-5, AC-6, AC-9 trước đây "chờ F06/F07" đã chạy ở lượt này**.
- **Kết luận: CHƯA ĐẠT** — không có lỗi *Chặn*. Còn **1 lỗi *Nên sửa*** (K1: CLS ở kiosk 1080×1920 trên `/thu-tuc` 0,176 và `/linh-vuc` 0,180, mục tiêu ≤ 0,05) và **R1** (cạnh tranh ghi địa chỉ, chập chờn, làm ca KT-01 lúc đạt lúc trượt — ghi ở F06). Mọi AC 1–12 có ít nhất một ca đạt: AC-1 (chữ ≈ 19 px, thẻ, giữ sau tải lại), AC-2 (đồng hồ giả 15 phút không đổi gì), AC-3/AC-12 (đúng một dòng nhắc mỗi nơi; 5 tên miền giả mạo không lọt), AC-4 (ngoài kiosk không nút, không dòng, không tải chunk), AC-5 (60/61 câu, "Bắt đầu lại" không đặt lại), AC-6/AC-9/AC-10 ("Bắt đầu lại" xoá hết, giữ kiosk + `doc-bat` + `cach-xem`, **195 ms**), AC-7/AC-11 (`history.length` không tăng), AC-8 (nút không che chữ chân trang ở 1080×1920 và 1280×800).
- Số ca (171): Đạt **120** · Đạt\* **18** · Trượt **2** (F09-NH-29, F09-HN-04: cùng một lỗi K1) · Chờ **9** · Chưa chạy **21** · Ghi nhận **1** (tổng 171). Playwright: `kiosk.spec.ts` 26 ca (24 đạt + 1 trượt + 1 cần `E2E_RL_URL`, chạy riêng đạt), `bo-sung-kiosk.spec.ts` 11/11.
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn K1 và 9 ca Chờ (tài liệu vận hành BR-6 chưa có, NVDA/TalkBack, trình duyệt kiosk thật — câu hỏi mở 10). Đổi sang `xong` khi K1 được sửa và các ca Chờ đạt.

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
| `npm test` (Vitest) | **1.116/1.116** (107 tệp); lượt đầu 1 ca `dieuHuongThayLichSu` "ngoài kiosk: vẫn PUSH" quá hạn 15 s lúc máy tải, chạy riêng và chạy lại đạt |
| `npm run build` (`tsc -b` gồm `e2e/`) | sạch |
| `npm run e2e:san-xuat` | **20/20** |
| Playwright F09 (S1, Chromium; 1080×1920 trừ ca ghi khác) | `kiosk.spec.ts`: 24 đạt · 1 trượt (NH-29) · 1 bỏ qua (GH-01/02 cần `E2E_RL_URL`; chạy riêng với S2: đạt) · `bo-sung-kiosk.spec.ts`: **11/11**. Chạy lại `NH-01/02`, `NH-06/07/17`, `NH-12/13` trên API **PostgreSql** (S3): 3/3 |
| `dotnet test --solution` có `ConnectionStrings__DichVuCongTest` | **1.392/1.392** đạt, 0 bỏ qua |
| `dotnet test --solution` không có DB thử | 1.129 đạt · **263 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` / `dotnet list package --vulnerable --include-transitive` | 0 lỗ hổng / không gói nào |

## Bảng case

| Nhóm | Số ca | Đạt | Đạt* | Trượt | Chờ | Chưa chạy | Ghi nhận |
|---|---|---|---|---|---|---|---|
| F09-KB · 1. Bật chế độ kiosk bằng link, giữ sau khi tải lại (BR-1; A… | 12 | 10 | 0 | 0 | 0 | 1 | 1 |
| F09-KT · 2. Không tự làm mới (BR-2, BR-3; AC-2) | 9 | 7 | 1 | 0 | 0 | 1 | 0 |
| F09-NH · 3. Dòng nhắc "Nhớ đăng xuất khi dùng xong" (BR-4; AC-3, AC-… | 31 | 24 | 0 | 1 | 0 | 6 | 0 |
| F09-NM · 4. Nhận diện liên kết Cổng DVC (laLienKetCongDvc; BR-4; A… | 9 | 0 | 9 | 0 | 0 | 0 | 0 |
| F09-NV · 5. Nút "Bắt đầu lại" — vị trí, thứ tự Tab, bàn phím (BR-7; … | 17 | 16 | 0 | 0 | 0 | 1 | 0 |
| F09-BL · 6. Bắt đầu lại — xoá trạng thái, giữ kiosk, giữ lựa chọn (B… | 26 | 23 | 0 | 0 | 1 | 2 | 0 |
| F09-LS · 7. Lịch sử trình duyệt ở kiosk (BR-8; AC-7, AC-11) | 12 | 8 | 2 | 0 | 0 | 2 | 0 |
| F09-GH · 8. Giới hạn câu hỏi dùng chung kiosk (BR-5; AC-5) | 7 | 2 | 5 | 0 | 0 | 0 | 0 |
| F09-VH · 9. Tài liệu vận hành (BR-6, BR-1, BR-3) | 8 | 0 | 0 | 0 | 8 | 0 | 0 |
| F09-TN · 10. Trợ năng (WCAG 2.1 AA) | 11 | 7 | 1 | 0 | 0 | 3 | 0 |
| F09-BM · 11. Bảo mật (CLAUDE.md > Bảo mật) | 16 | 14 | 0 | 0 | 0 | 2 | 0 |
| F09-HN · 12. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9) | 10 | 7 | 0 | 1 | 0 | 2 | 0 |
| F09-HD · 13. Nguồn dữ liệu và nhập lại (F00 §9) | 3 | 2 | 0 | 0 | 0 | 1 | 0 |
| **Tổng** | **171** | **120** | **18** | **2** | **9** | **21** | **1** |

Ghi chú ký hiệu: **Đạt** = tester đã chạy (Playwright, xUnit trên PostgreSQL thật, script trên bản publish Release) và kết quả đúng kỳ vọng. **Đạt*** = ca thuộc suite Vitest/xUnit của dev, suite xanh nhưng tester chưa đối chiếu từng khẳng định. **Chờ** = cần thiết bị/giọng/trình đọc màn hình thật hoặc tài liệu vận hành chưa có. **Chưa chạy** = chưa có ca tự động tương ứng trong lượt này.

**Ca Đạt (120):** KB: 01–02, 04–11 · KT: 01–02, 04–08 · NH: 01–02, 06–15, 17–22, 24–26, 28, 30–31 · NV: 01–14, 16–17 · BL: 01–15, 18–25 · LS: 01–04, 08–10, 12 · GH: 01–02 · TN: 01–03, 05–07, 09 · BM: 01–09, 12–16 · HN: 01–03, 05–08 · HD: 01, 03

**Ca Đạt* (18):** KT: 03 · NM: 01–09 · LS: 05–06 · GH: 03–07 · TN: 04

Ca không phải Đạt (từng ca):

| Case | AC/BR | Kết quả | Ghi chú |
|---|---|---|---|
| F09-HN-04 | plan §5 (CLS) | Trượt | CLS kiosk 1080×1920: / = 0,046 (đạt), /thu-tuc = 0,176 và /linh-vuc = 0,180 (> 0,05): chân trang đang hiện lúc chờ rồi bị đẩy khỏi màn hình khi danh sách về. Lỗi K1 |
| F09-NH-29 | plan §5 (CLS) | Trượt | CLS kiosk 1080×1920: / = 0,046 (đạt), /thu-tuc = 0,176 (> 0,05); chunk + API trễ 1,5 s: / = 0,051. Lỗi K1, K3 · cls: /?kiosk=1 trễ 0 ms: 0.0459; cls: /?kiosk=1 trễ 1500 ms: 0.0511; cls: /thu-tuc?kiosk=1 trễ 0 ms: 0.1762; cls: /?kiosk=1 trễ 0 ms: 0.0459; cls: /?kiosk=1 trễ 1500 ms: 0.0511; cls: /thu… |
| F09-KB-03 | BR-1 | Ghi nhận | cờ kiosk ở sessionStorage: mở tab mới không có ?kiosk=1 thì không kiosk (đúng thiết kế BR-1) |
| F09-BL-26 | BR-7 (thiết bị thật) | Chờ | thử tay trên kiosk thật: độ chớp, tiếng ngừng, Quay lại |
| F09-VH-01 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-02 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-03 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-04 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-05 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-06 | BR-6 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-07 | BR-6 (F07) | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-VH-08 | BR-6, câu hỏi mở 10 | Chờ | tài liệu vận hành (kế hoạch 8.5) và thử tay trên kiosk thật (câu hỏi mở 10) |
| F09-BL-16 | plan §5 (dữ liệu mới) | Chưa chạy | Bấm; xem chân trang/khối liên hệ |
| F09-BL-17 | BR-6 | Chưa chạy | Xem |
| F09-BM-10 | KB-05 | Chưa chạy | Mở |
| F09-BM-11 | CLAUDE.md > Header (clickja… | Chưa chạy | Mở |
| F09-HD-02 | AC-3 | Chưa chạy | chưa nhập lại ô dịch vụ trên PostgreSQL |
| F09-HN-09 | plan §4.3 | Chưa chạy | Đo thời gian điều hướng 3 mục có và không useDieuHuongThayLichSu |
| F09-HN-10 | plan §5 | Chưa chạy | Đo heap tab |
| F09-KB-12 | BR-1 (vận hành) | Chưa chạy | Tìm đoạn về link kiosk |
| F09-KT-09 | BR-3, BR-6 (vận hành) | Chưa chạy | Tìm |
| F09-LS-07 | plan §10 rủi ro 2 | Chưa chạy | Điều hướng trong khoảng đó |
| F09-LS-11 | BR-6 (vận hành) | Chưa chạy | Tìm |
| F09-NH-03 | AC-3 | Chưa chạy | Đọc vị trí trong DOM và toạ độ |
| F09-NH-04 | AC-3 | Chưa chạy | Mở trang chủ |
| F09-NH-05 | AC-3 | Chưa chạy | Mở trang chủ |
| F09-NH-16 | BR-4 | Chưa chạy | xem ca liên quan đã chạy: NH-01…13, 21/22/25/26, 28, 31 |
| F09-NH-23 | AC-12 (mơ hồ) | Chưa chạy | xem ca liên quan đã chạy: NH-01…13, 21/22/25/26, 28, 31 |
| F09-NH-27 | BR-4 (nhập lại, CHAY-THAT) | Chưa chạy | xem ca liên quan đã chạy: NH-01…13, 21/22/25/26, 28, 31 |
| F09-NV-15 | BR-7 (cảm ứng) | Chưa chạy | Chạm một lần |
| F09-TN-08 | plan §4.4 | Chưa chạy | TN-01 (axe có color-contrast) đạt |
| F09-TN-10 | C01 AC-3 | Chưa chạy | Xem nút, dòng nhắc |
| F09-TN-11 | i18n | Chưa chạy | npm run lint; tìm chữ "Bắt đầu lại", "Nhớ đăng xuất" ngoài kiosk/i18n/vi.json |

### Số đo và hành vi đáng ghi

- **AC-3 · số dòng nhắc "Nhớ đăng xuất khi dùng xong"**: trang chủ đúng **2** (một phía trên ô dịch vụ, đứng trước ô đầu; một phía trên danh sách thường gặp) ở cả thẻ lẫn bảng; danh mục 2 tab × thẻ/bảng: **1**; popup `1.001193`: **1**, đứng **trước** liên kết "Xem và nộp trên Cổng DVC", bấm mở thẳng `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.001193…` ở tab mới (rel `noopener noreferrer`, 0 hộp thoại); khung trợ lý: **1** dưới thanh tiêu đề, trên danh sách tin khi có đáp án với liên kết Cổng DVC, **0** khi chỉ hỏi giờ làm việc/điện thoại/email/địa chỉ/giá vàng; chân trang, `/linh-vuc`, 404: **0**; danh sách trống: 0, lọc còn 1 thủ tục: 1; ngoài kiosk (375 và 1280): 0 ở mọi chỗ và **không tải** `giaoDienKiosk-*`.
- **AC-12 · ô dịch vụ theo dữ liệu**: có liên kết `dichvucong.gov.vn` (hoặc `www.`) → 1 dòng; chỉ `cangiuoc.tayninh.gov.vn` → 0; `dichvucong.gov.vn.evil.com`, `evildichvucong.gov.vn`, `dichvucong.gov.vn@evil.com`, `dichvucong.tayninh.gov.vn`, `https://evil.com/?u=dichvucong.gov.vn` → **0** (không lọt).
- **AC-2/BR-2**: đồng hồ giả tiến 15 phút 30 giây: không `framenavigated`, không yêu cầu POST/lạ do trang tự phát, popup + khung + 2 tin + từ khoá "khai sinh" còn nguyên, không `alertdialog`/`timer`; `grep` `core/kiosk`: 0 `setTimeout`/`setInterval`/`requestIdleCallback`/`visibilitychange`.
- **AC-6/AC-9/AC-10 "Bắt đầu lại"** (đã bật đọc, bảng, tab Cấp tỉnh, tìm "khai sinh", hỏi `số 0912345678 của tôi nộp hồ sơ chưa`, mở popup từ câu trả lời): bấm → về `/` ở đầu trang **sau 195 ms**; vẫn `html.kiosk` + nút; popup đóng; khung chưa có trong cây (nạp lười), mở lại **rỗng**, ô nhập rỗng, `autocomplete="off"`; "mấy ngày" → xin lỗi (ngữ cảnh mất); `/thu-tuc` về tab Cấp xã, ô tìm trống, **vẫn bảng**; `localStorage` chỉ `doc-bat` và `cach-xem`; `sessionStorage` chỉ `kiosk` và `react-router-scroll-positions`; không cookie; `speechSynthesis.cancel()` được gọi; **toàn bộ trạng thái (HTML, storage, cookie, `window.name`) không còn "0912345678"**. Trước khi bấm cũng không có số ở storage/cookie/`history.state`/URL; không bấm thì câu vẫn còn trên màn hình khi đóng/mở khung (đúng BR-3).
- **BR-7 · thứ tự Tab**: nút "Bắt đầu lại" là phần tử tab được **cuối cùng của tài liệu**, kể cả khi khung trợ lý mở (mọi phần tử khung đứng trước); popup mở: Tab đi qua nút ở **cuối vòng** rồi quay về đầu popup, Shift+Tab ngược lại; Esc chỉ đóng popup; Enter và Space đều kích hoạt, có viền focus; nút con trực tiếp của `<body>`, `data-ngoai-popup`, không `inert`, hit-test đúng nút khi popup mở, không che liên kết Cổng DVC của popup; ở 1080×1920 nút cao ≥ 48 px, góc dưới **trái**, khung ở phải, không che ô nhập/nút Gửi/nút Trợ lý (cả ở 375).
- **BR-8**: ở kiosk `history.length` giữ nguyên khi đổi trang, gõ tìm, đổi tab, mở và đóng popup; "Quay lại" không trả về trạng thái cũ. Ngoài kiosk vẫn thêm mục lịch sử và "Quay lại" về trang trước.
- **AC-8**: nút không che chữ ở chân trang (so hộp chữ thật) ở `/`, `/thu-tuc`, `/linh-vuc` khi cuộn tới cuối: 1080×1920 và 1280×800. Chunk kiosk về chậm 3 s: chưa có nút trong khoảng đó, về rồi xuất hiện, không lỗi.
- **Hiệu năng/CLS (kiosk 1080×1920)**: `/` = **0,046** (chunk và API trễ 1,5 s: 0,051); `/thu-tuc` = **0,176**; `/linh-vuc` = **0,180** (xem K1). Chunk kiosk 2,6 KiB gzip -9; `Cache-Control: public,max-age=31536000,immutable`.

## Kết quả bảo mật

| Kiểm tra | Kết quả |
|---|---|
| `curl -I` `/?kiosk=1`, `/thu-tuc`, `/linh-vuc` và một chunk `.js`; 17 loại phản hồi | **Đạt**: CSP nguyên văn, HSTS, nosniff, Referrer-Policy, Permissions-Policy; không `Server`, CORS |
| Đích "Bắt đầu lại" không lấy từ địa chỉ/dữ liệu (open redirect) | **Đạt**: hằng `/?kiosk=1`; bấm luôn về `/` |
| `laLienKetCongDvc` không bị đánh lừa (5 tên miền giả) | **Đạt**: 0 dòng nhắc cho cả 5 |
| Hội thoại và dữ liệu cá nhân không sống sót qua "Bắt đầu lại" (storage, cookie, `history.state`, URL, `window.name`, DOM) | **Đạt** |
| Giới hạn 60 câu/phút theo IP, kiosk không có đặc quyền | **Đạt**: 60 × 200 rồi 429; "Bắt đầu lại" không đặt lại; kiosk không thêm API nào so với trang thường |
| CSP/console/yêu cầu ra ngoài ở kiosk | **Đạt**: 0 vi phạm, 0 lỗi console |
| Bản build: `.map`, `.pdb`; obfuscate chunk kiosk và chức năng vẫn chạy sau obfuscate | **Đạt**: 0; mọi ca kiosk chạy trên bản build đã obfuscate |
| `dangerouslySetInnerHTML`/`innerHTML` ở `core/kiosk`; lint chữ cứng | **Đạt**: không có; lint sạch |
| `npm audit --omit=dev`, `dotnet list package --vulnerable`; không thêm gói; chuỗi kết nối | **Đạt** |

## Kết quả hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu `/` thường 375 / 1280 (gzip -9; lúc load → sau 3,5 s) | 149,1 → **181,6** / 149,1 → **192,1** KiB | ≤ 200 KB |
| JS tải ban đầu `/?kiosk=1` 1080×1920 | **185,5** KiB (gồm chunk kiosk 2,6 KiB) | ≤ 200 KB |
| Chế độ thường `/`, `/thu-tuc` có tải chunk kiosk không | **Không** (0 yêu cầu `giaoDienKiosk-*`); kiosk tải đúng **một** chunk | không tải khi thường |
| Chunk kiosk | **2,6 KiB** gzip -9, `immutable` | ≤ 5 KB |
| Lighthouse mobile `/` ×3 (không kiosk) | **96 · 96 · 97**; CLS 0,000 | ≥ 85, CLS < 0,1 |
| "Bắt đầu lại" → trang chủ kiosk sẵn sàng | **195 ms** (localhost) | ≤ 1,5 s |
| CLS kiosk 1080×1920 `/` | **0,046** (trễ 1,5 s: 0,051) | ≤ 0,05 |
| CLS kiosk 1080×1920 `/thu-tuc`, `/linh-vuc` | **0,176 · 0,180** (Trượt, K1) | ≤ 0,05 |
| Timer do F09 thêm | 0 (`grep` + KT-01) | 0 |
| p95 API mọi endpoint (1.000 lần, Release) | ≤ 7,7 ms (xem F06) | ≤ 300 ms |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa | **K1** CLS lớn ở màn hình dọc 1080×1920 (kiosk thật): `/thu-tuc` **0,176**, `/linh-vuc` **0,180** (ca F09-NH-29, HN-04 đòi ≤ 0,05; ngưỡng "tốt" của Web Vitals là 0,1). Nguồn: khung chờ ngắn nên **chân trang đang nằm trong màn hình** rồi bị đẩy ra khi danh sách/lưới về (`FOOTER` 1569 → ra khỏi khung nhìn). Cùng nguyên nhân với F05 L1 (1280×800: 0,3755). `/` đạt sát (0,046). Lighthouse mobile 375 không bị (0,000) | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts kiosk --project=chromium -g "NH-29"` | ui-core-dev (`Layout`/`Skeleton`: giữ chỗ cho vùng nội dung hoặc chỉ hiện chân trang khi route xong), frontend-dev (`KhungCho` của `DanhMuc`) |
| Nên sửa | **K2 (= R1 ở F06)** Cạnh tranh ghi địa chỉ làm F09-KT-01 chập chờn: popup mở từ khung trợ lý có thể không mở khi vừa gõ ô tìm của trang (xem bảng lỗi F06) | `... kiosk --project=chromium -g "F09-KT-01" --repeat-each=8` | ui-core-dev, frontend-dev |
| Thấp | **K3** Khi chunk kiosk và API Trung tâm cùng về chậm 1,5 s, CLS của `/` là 0,0511 (vượt 0,05 một chút; ngưỡng "tốt" 0,1 vẫn đạt) | NH-29 (biến thể trễ 1,5 s) | frontend-dev (giữ chỗ cho dòng nhắc) |
| Thấp | **K4** (tài liệu/test) 9 ca VH và BL-26 phụ thuộc tài liệu vận hành (kế hoạch 8.5) chưa có — ghi "Chờ", không tính lỗi | — | planner (ghi hướng dẫn vận hành) |

## Ca thử tay — chờ (liệt kê gọn)

- **VH-01…VH-08**: hướng dẫn vận hành (trình duyệt kiosk ẩn danh, kiểm tra cuối ngày, ẩn nút "Quay lại", mạng khi bấm, đồng bộ giờ, giọng cục bộ) — chờ tài liệu giai đoạn 8 (kế hoạch 8.5).
- **BL-26**: bấm "Bắt đầu lại" trên trình duyệt kiosk thật: độ chớp, tiếng đọc dừng, "Quay lại" không khôi phục; **KS-05 của F07, NV-15** (chạm một lần), **TN-08** (NVDA đọc dòng nhắc theo thứ tự trang, không đọc hai lần).
- Câu hỏi mở 10: kết luận từ trình duyệt/hệ điều hành kiosk thật (có nút đọc hay không, thanh địa chỉ, nút Quay lại).

## Kết quả từng task

- **T08**: `e2e/kiosk.spec.ts` (26 ca), `e2e/bo-sung-kiosk.spec.ts` (11 ca); integration BE cho AC-5 (60/61 câu/phút với cấu hình mặc định) làm bằng script trên bản Production (60 × 200, câu 61 → 429, sau 1 phút hỏi lại được; 200 yêu cầu song song → 60 × 200 + 140 × 429; `X-Forwarded-For` giả không lách được) và ca trình duyệt khi có `E2E_RL_URL`.
