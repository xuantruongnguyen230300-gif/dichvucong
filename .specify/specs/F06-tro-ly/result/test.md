ĐẠT

# F06 · Trợ lý trả lời theo luật — kết quả kiểm thử (T17, T18, T19)

## Lượt xác nhận (2026-10-14)

Kết quả mới nhất của F06 nằm ở mục này; các mục bên dưới là lượt 2026-10-13 (giữ để đối chiếu).

- **Kết luận: ĐẠT** — 0 ca trượt, không còn lỗi *Chặn*/*Nên sửa*. Số ca (338, thêm 3 ca mới: F06-GH-30, F06-PU-R1, F06-PU-R1b): Đạt **239** · Đạt\* **73** · Trượt **0** · Chờ **6** · Chưa chạy **19** · Ghi nhận **1** (trước: 234 · 73 · 2 · 6 · 19 · 1 = 335). Hai ca trượt cũ nay đạt: F06-GH-20, F06-TH-23 (chỉnh kỳ vọng).
- `trang_thai` của `spec.md` vẫn `dang-lam`: còn 6 ca Chờ (NVDA/TalkBack, điện thoại thật, Zalo OA thật) và lỗi Thấp G4, G7, R1c.
- Ngày chạy: 2026-10-14 (lượt xác nhận cuối sau khi dev sửa các lỗi lượt 2026-10-13). Người chạy: tester. Tuần tự, một trình duyệt tại một thời điểm. Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`postgres`); Docker không chạy nên không có Testcontainers (ca DB thật dùng `DbThuNghiem`, biến `ConnectionStrings__DichVuCongTest`).
- Bản kiểm: `npm run build` mới (JS ban đầu **184,9 KiB** gzip) rồi `dotnet publish -c Release` (không `.pdb`/`.map`). Máy chủ: **S1** `https://localhost:7157` (Development, nguồn Mẫu, giới hạn 100000/phút) chạy e2e; **S2** `https://localhost:5443` (Production, giới hạn mặc định 300/60 mỗi phút) cho header, 429, Lighthouse; **S3** `http://localhost:5555` (Production, nguồn PostgreSql, DB tạm `dichvucong_t15` dựng bằng `DuLieuMau` → `dotnet ef database update` → công cụ nhập, có 3 phân công quầy + 3 nhân sự; đã xoá sau khi chạy).

### Xác nhận các điểm cần kiểm lại

| Điểm | Kết quả | Bằng chứng |
|---|---|---|
| "giá vàng", "giá vàng hôm nay", "xem bói", "thời tiết" | **Đạt** — `khong-hieu` | API thật (S1) và `TroLyServiceContract` |
| "khai sjnh", "khia sinh", "dang ky khai sjnh" | **Đạt** — `thu-tuc-danh-sach`, `thuTucDangNoi` = `1.001193` | như trên |
| "xem bói 12 05 2026", "xem bói 12/05/2026", "thời tiết ngày 12 05 2026", "giá vàng 12 05 2026" | **Đạt** — `khong-hieu` (G2 đã sửa); "khai sinh 2026" vẫn ra khai sinh | API thật |
| Bộ 42 câu + các dòng mới (nay 68 ca hợp đồng) trên hai nguồn dữ liệu | **Đạt** — JSON đáp án **giống từng byte** Mẫu và PostgreSQL | xUnit `TroLyHaiNguonTests` trên PostgreSQL thật: 68/68 |
| 13 biến thể SĐT/CCCD/email vẫn che trước khi lưu kho câu | **Đạt** | xUnit `CN_BienTheCheQuaApi_NoiDungLuuKhongConSoGocVaEmailGoc` qua API thật trên PostgreSQL (13 biến thể) + `CheThongTinCaNhanTests` |
| `GET /api/tro-ly/hoi` | **Đạt** — **405** `phuong-thuc-khong-hop-le` kèm `Allow: POST` (G1 đã sửa); `PUT`/`DELETE`/`PATCH`/`OPTIONS` cũng 405 (xem G7) | `curl` S1 |
| `POST` `maThuTuc` dài 21 ký tự | **Đạt (kỳ vọng được chỉnh)**: 400 là đúng (`[StringLength(20)]`); 20 ký tự trở xuống → 200 như không có ngữ cảnh | `testcases.md` TH-23 đã sửa |
| Khung chat 375 px, thanh cuộn cổ điển không hở | **Đạt** — F06-UI-02 siết: khung `x = 0`, rộng **đúng 375 px**, cao bằng khung nhìn; điểm sát mép phải khung nhìn thuộc khung (G3 đã sửa) | `tro-ly.spec.ts` |
| R1: gõ ô tìm rồi mở Trợ lý ngay, bấm "Xem chi tiết" | **Đã sửa** — popup luôn mở và `q` còn trên địa chỉ: kiosk **60/60** (gồm một lần 40), thường 1280×800 **20/20**, 375×812 **20/20**; R1b (không qua Trợ lý, bấm thẻ 0–400 ms sau phím cuối): 1280 và kiosk **54/54**; F09-KT-01 lặp 8 lần: **8/8** (trước 6/8) | `e2e/tranh-ghi-dia-chi.spec.ts` (mới) |
| `http()` có hạn chờ: trợ lý treo → báo lỗi, nút Gửi không kẹt | **Đạt** — F06-GH-30 (mới): POST `/hoi` không bao giờ trả lời → sau ≈ 15 s hiện tin lỗi mất kết nối + "Thử lại", hết "Đang tìm câu trả lời…", gõ câu mới và hỏi lại được khi máy chủ trả lời | `tro-ly.spec.ts` |
| Dưới đáp án chủ đề không có 4 chip (chủ ý) | **Đạt (kỳ vọng được chỉnh)**: CD-09 | `testcases.md` |
| Vùng bấm (testcases ghi 44 px, spec C01 đòi ≥ 24 px) | **Đạt (kỳ vọng được chỉnh)**: TN-11 ≥ 24 px; ≥ 48 px ở kiosk | `testcases.md` |

### Hiệu năng và bảo mật (lượt này)

- Lighthouse mobile 12.8 (Production S2, 3 lần mỗi trang): `/` **96 · 96 · 96** (LCP 2,5 s, TBT 70–90 ms, CLS 0); `/thu-tuc` **97 · 96 · 96** (LCP 2,3 s); `/linh-vuc` **98 · 98 · 98** (LCP 2,1 s); Accessibility, Best practices, SEO đều 100; ngân sách ≥ 85.
- JS tải ban đầu (gzip -9, đo thật lúc 3,5 s): `/` 375 **184,9 KiB** · 1280 **195,3 KiB** (còn 4,7 KiB so với trần 200 KiB — sát) · kiosk **187,5 KiB**; `/thu-tuc` 177,2 · 187,6 · 181,1; `/linh-vuc` 171,3 · 171,3 · 175,1. Chunk `KhungTroLy` 19,8 KiB gzip (≤ 25).
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

### Lỗi còn lại của F06

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Thấp | **R1c** Cạnh tranh ghi địa chỉ còn lộ trong test đơn vị khi máy tải nặng: `useDanhSachUrl.tranhGhi.test.tsx` "lặp 10 lần với thời gian lệch nhau" đỏ ở lần 8 (`q` = null sau khi mở popup, chờ 240 ms trước khi bấm, tức sát hạn 300 ms của lần ghi `q`): 1/2 lần chạy cả bộ Vitest, 2/6 lần khi chạy 6 tiến trình song song. Trình duyệt thật không tái hiện (R1 100 + R1b 54 lần đều đạt), nên khả năng chỉ gặp trên máy rất chậm | `npx vitest run src/core/hooks/useDanhSachUrl.tranhGhi.test.tsx` chạy 6 bản cùng lúc | ui-core-dev (`core/hooks/useDanhSachUrl`: lần ghi `q` trễ không được đè/bị đè bởi lần ghi `ma`) |
| Thấp | **G7** (mới) `PUT`/`DELETE`/`PATCH`/`OPTIONS` tới `/api/tro-ly/hoi` trả 405 nhưng `Allow: GET, HEAD, POST` — liệt kê cả `GET` dù `GET` cũng 405 (route dự phòng của SPA). Không hệ quả bảo mật | `curl -si -X PUT https://localhost:7157/api/tro-ly/hoi` | backend-dev (`Common/Hosting/SpaFallback`: `Allow` đúng theo route khớp) |
| Thấp | **G4** (còn từ `review.md`, chưa đổi) Kho câu chưa trả lời đầy trần 50.000 thì câu mới bị bỏ (đã có cảnh báo log mỗi giờ) | `KhoDay_TranMacDinh50000…` (xUnit) | chatbot-dev / planner (chọn cách xử lý khi đầy) |

Đã đóng: R1 (e2e), G1, G2, G3, G5, G6 (xem bảng trên).

### Ca thử tay — chờ (không đổi)

TT-10 (bấm số điện thoại trên điện thoại thật), LH-06 (Zalo OA thật), TN-14 và các ca TAY còn lại (NVDA/TalkBack với `aria-live`, kiosk thật).

- Ngày chạy: 2026-10-13. Người chạy: tester. Bản kiểm: sau T01–T13 (chatbot-dev, ui-core-dev). `review.md` ghi KHÔNG ĐẠT vì 1 lỗi *Chặn* (che số điện thoại nhóm 2 chữ số); **đã sửa và kiểm lại ở đây** (13 biến thể qua API thật trên PostgreSQL, thêm 45 mẫu che đúng + 22 mẫu không che của `CheThongTinCaNhanTests`).
- **Kết luận: CHƯA ĐẠT** — không có lỗi *Chặn*. Còn **1 lỗi *Nên sửa* chập chờn** (R1: gõ ô tìm của trang rồi mở Trợ lý ngay, bấm "Xem chi tiết" trong khung thì popup có thể không mở — 2/8 lần ở kiosk, F09-KT-01) và **2 ca trượt mức Thấp** (F06-GH-20: `GET /api/tro-ly/hoi` trả 404 thay vì 405; F06-TH-23: `maThuTuc` 21 ký tự trả 400 thay vì 200). Mọi AC có ít nhất một ca đạt; bộ 42 câu đạt trên **cả hai nguồn dữ liệu và JSON đáp án giống hệt từng ca**; p95 `POST /api/tro-ly/hoi` ≤ 7,7 ms (Release, PostgreSQL).
- Số ca (335): Đạt **234** · Đạt\* **73** · Trượt **2** · Chờ **6** · Chưa chạy **19** · Ghi nhận **1** (tổng 335). Playwright: `tro-ly.spec.ts` 42/42 (ca 60/61 câu chạy với `E2E_RL_URL`), `hien-thi-tro-ly.spec.ts` 28/28. xUnit tích hợp PostgreSQL (T17): 135 ca trong `Integration/Chatbot` đạt (gồm lớp con hợp đồng 55 ca, 55 ca JSON hai nguồn, 9 ca chủ đề, 9 ca HTTP/ghi thật).
- **`trang_thai` của `spec.md` giữ `dang-lam`**: còn R1, GH-20, TH-23 và 6 ca Chờ (NVDA/TalkBack, điện thoại thật, Zalo OA thật). Đổi sang `xong` khi các lỗi được sửa và ca Chờ đạt.
- Điểm F07/F09 đã kiểm ở đây: AC-6/AC-9 của F09 (hội thoại sạch sau "Bắt đầu lại", không còn số điện thoại), AC-8 của F07 (đóng khung dừng đọc) — xem `F07`, `F09` `result/test.md`. Ghi cho F00 T24: **AC-20** (khung và namespace `chatbot` nạp lười) đạt; **AC-22** (log không chứa dữ liệu cá nhân) đạt.

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
| `npm test` (Vitest) | **1.116/1.116** (107 tệp); lượt đầu 1 ca quá hạn lúc máy tải nặng (`dieuHuongThayLichSu`), chạy lại đạt |
| `npm run build` (`tsc -b` gồm `e2e/`) | sạch |
| `npm run e2e:san-xuat` | **20/20** |
| Playwright F06 (S1, Chromium) | `tro-ly.spec.ts` **41 đạt + 1 bỏ qua có chủ đích** (GH-10 cần `E2E_RL_URL`; chạy riêng với S2: đạt) · `hien-thi-tro-ly.spec.ts` **28/28** |
| `dotnet test --solution` có `ConnectionStrings__DichVuCongTest` | **1.392/1.392** đạt, 0 bỏ qua |
| `dotnet test --solution` không có DB thử | 1.129 đạt · **263 bỏ qua có thông báo** · 0 lỗi |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | không có gói nào |

## Bảng case

| Nhóm | Số ca | Đạt | Đạt* | Trượt | Chờ | Chưa chạy | Ghi nhận |
|---|---|---|---|---|---|---|---|
| F06-BT · 1. Bộ thử 42 câu — hợp đồng hai nguồn (plan §9) | 42 | 42 | 0 | 0 | 0 | 0 | 0 |
| F06-TH · 2. Hỏi thủ tục, gõ sai, ngữ cảnh (BR-1 bước 3–4, BR-2; AC-1… | 25 | 11 | 12 | 1 | 0 | 1 | 0 |
| F06-MA · 3. Câu hỏi mẫu (BR-1 bước 2; AC-10, AC-26) | 10 | 3 | 4 | 0 | 0 | 3 | 0 |
| F06-TT · 4. Thông tin Trung tâm (BR-9; AC-18…AC-22, AC-26) | 24 | 17 | 4 | 0 | 1 | 2 | 0 |
| F06-QU · 5. Quầy và cán bộ — không đoán (BR-3; AC-3, AC-12, AC-24) | 20 | 12 | 8 | 0 | 0 | 0 | 0 |
| F06-LH · 6. Không hiểu, nút gọi, nút Zalo (BR-1 bước 5, BR-10; AC-4,… | 13 | 6 | 5 | 0 | 1 | 1 | 0 |
| F06-CD · 7. Chủ đề gợi ý (BR-11; AC-25) | 17 | 10 | 4 | 0 | 0 | 2 | 1 |
| F06-CN · 8. Che thông tin cá nhân (BR-8; AC-8, AC-16) | 16 | 9 | 7 | 0 | 0 | 0 | 0 |
| F06-KH · 9. Câu chưa trả lời — kho, gộp, giữ 90 ngày (BR-7, BR-12; A… | 15 | 6 | 9 | 0 | 0 | 0 | 0 |
| F06-GH · 10. Giới hạn gửi: 500 ký tự, 64 KB, số câu mỗi phút (BR-5; … | 20 | 17 | 0 | 1 | 0 | 2 | 0 |
| F06-PU · 11. Popup chi tiết và liên kết Cổng DVC trong câu trả lời (… | 16 | 14 | 1 | 0 | 0 | 1 | 0 |
| F06-UI · 12. Khung chat — hành vi và giao diện | 24 | 20 | 3 | 0 | 1 | 0 | 0 |
| F06-VW · 13. Hiển thị từng loại đáp án (plan §5.3) | 18 | 8 | 10 | 0 | 0 | 0 | 0 |
| F06-TN · 14. Trợ năng (WCAG 2.1 AA) | 14 | 11 | 0 | 0 | 3 | 0 | 0 |
| F06-BM · 15. Bảo mật (CLAUDE.md > Bảo mật) | 31 | 27 | 4 | 0 | 0 | 0 | 0 |
| F06-HN · 16. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9; AC-6) | 14 | 12 | 0 | 0 | 0 | 2 | 0 |
| F06-HD · 17. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9; T17) | 10 | 4 | 1 | 0 | 0 | 5 | 0 |
| F06-GP · 18. Điểm ghép F07 / F09 (kiểm khi hai chức năng đó xong) | 6 | 5 | 1 | 0 | 0 | 0 | 0 |
| **Tổng** | **335** | **234** | **73** | **2** | **6** | **19** | **1** |

Ghi chú ký hiệu: **Đạt** = tester đã chạy (Playwright, xUnit trên PostgreSQL thật, script trên bản publish Release) và kết quả đúng kỳ vọng. **Đạt*** = ca thuộc suite Vitest/xUnit của dev, suite xanh nhưng tester chưa đối chiếu từng khẳng định. **Chờ** = cần thiết bị/giọng/trình đọc màn hình thật hoặc tài liệu vận hành chưa có. **Chưa chạy** = chưa có ca tự động tương ứng trong lượt này.

**Ca Đạt (234):** BT: 01–42 · TH: 01–09, 20, 22 · MA: 01, 07–08 · TT: 01, 03–09, 11–12, 15–18, 22–24 · QU: 01–08, 13, 16, 18–19 · LH: 01–04, 07–08 · CD: 01, 03–06, 08, 10–12, 16 · CN: 01–03, 05, 12–16 · KH: 01, 03–04, 08, 12, 14 · GH: 01–12, 14, 16–19 · PU: 01–11, 13–14, 16 · UI: 01–12, 14, 17–22, 24 · VW: 01–02, 04, 07–08, 11, 14, 18 · TN: 01–06, 08–11, 13 · BM: 01–15, 18–20, 22–30 · HN: 01–05, 07–13 · HD: 01–03, 07 · GP: 01–05

**Ca Đạt* (73):** TH: 10, 12–19, 21, 24–25 · MA: 03–05, 10 · TT: 13–14, 20–21 · QU: 09–12, 14–15, 17, 20 · LH: 09–13 · CD: 07, 13–14, 17 · CN: 04, 06–11 · KH: 02, 05–07, 09–11, 13, 15 · PU: 12 · UI: 15–16, 23 · VW: 03, 05–06, 09–10, 12–13, 15–17 · BM: 16–17, 21, 31 · HD: 04 · GP: 06

Ca không phải Đạt (từng ca):

| Case | AC/BR | Kết quả | Ghi chú |
|---|---|---|---|
| F06-GH-20 | plan §3 | Trượt | PUT → 405, OPTIONS → 405 không ACAO, content-type sai → 415; nhưng GET /api/tro-ly/hoi trả 404 khong-tim-thay (route dự phòng SPA nhận GET) thay vì 405. Lỗi G1 (Thấp) |
| F06-TH-23 | plan §3.1 (mã ngữ cảnh lạ) | Trượt | maThuTuc: "9.999999", "abc<b>", "' OR 1=1--", "%00", NUL, "", null → 200 như không ngữ cảnh; nhưng 21 ký tự → 400 (testcases kỳ vọng 200). Lỗi G6 |
| F06-CD-09 | BR-11 | Ghi nhận | theo mã nguồn: dưới đáp án chủ đề chỉ có dòng "Gõ tên thủ tục để hỏi thêm." và KHÔNG có 4 chip hỏi tiếp (chủ ý của dev: máy chủ không gán thủ tục đang nói tới sau chủ đề); testcases CD-09 kỳ vọng 4 chip → chỉnh testcases |
| F06-LH-06 | AC-23 (điện thoại thật) | Chờ | thử tay: mở Zalo OA thật |
| F06-TN-07 | AC-13 | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F06-TN-12 | WCAG 1.4.1 | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F06-TN-14 | WCAG 2.4.3 | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F06-TT-10 | AC-20 (điện thoại thật) | Chờ | thử tay: điện thoại thật bấm tel: |
| F06-UI-13 | plan §5.2 | Chờ | thử tay (thiết bị/giọng/trình đọc màn hình/điện thoại thật) |
| F06-CD-02 | AC-25 (CHAY-THAT) | Chưa chạy | Đóng rồi mở lại khung |
| F06-CD-15 | plan §5.2 | Chưa chạy | Mở khung ở 320 |
| F06-GH-13 | BR-5 (cấu hình) | Chưa chạy | Khởi động lại; đặt 0 và -1 |
| F06-GH-15 | BR-5 (cửa sổ) | Chưa chạy | 60 câu ở giây 55 của phút 1 rồi 60 câu ở giây 5 của phút 2 |
| F06-HD-05 | F00 BR-10, AC-18/24/25/26 | Chưa chạy | Gọi API ngay |
| F06-HD-06 | F00 BR-16 | Chưa chạy | Nhập lại |
| F06-HD-08 | F00 §9 | Chưa chạy | So kết quả |
| F06-HD-09 | plan §2 | Chưa chạy | Chạy 42 câu |
| F06-HD-10 | plan §11 rủi ro 6 | Chưa chạy | 50 yêu cầu liên tục |
| F06-HN-06 | plan §7 | Chưa chạy | chưa đếm lệnh SQL mỗi câu hỏi |
| F06-HN-14 | plan §7 (bộ nhớ) | Chưa chạy | 200 câu liên tiếp (giả route) |
| F06-LH-05 | AC-23 (CHAY-THAT) | Chưa chạy | Hỏi lại cùng khung |
| F06-MA-02 | AC-10 (CHAY-THAT) | Chưa chạy | Hỏi lại |
| F06-MA-06 | BR-6 | Chưa chạy | Hỏi |
| F06-MA-09 | AC-26 (CHAY-THAT) | Chưa chạy | Hỏi "van phong nam cho nao" |
| F06-PU-15 | F03 BR-8 | Chưa chạy | Quan sát khung |
| F06-TH-11 | BR-2 (câu rất ngắn) | Chưa chạy | Gửi "kết", "a", "?", "ạ", ".", "123", "ơ" |
| F06-TT-02 | AC-18 (CHAY-THAT) | Chưa chạy | Hỏi lại cùng khung |
| F06-TT-19 | AC-26 (CHAY-THAT) | Chưa chạy | Hỏi "van phong nam cho nao" |

### Số đo và hành vi đáng ghi

- **Bộ 42 câu (BT-01…42) + 16 ca ngoài bảng** chạy qua `TroLyServiceContract` trên **nguồn Mẫu và PostgreSQL thật** (cùng dữ liệu nạp bằng `AppDbContext`): đạt cả hai; `TroLyHaiNguonTests` so **JSON đáp án và nội dung ghi kho từng ca giữa hai nguồn: giống hệt từng byte** (55 ca + 9 chủ đề).
- **AC-8/AC-16/AC-14 ghi thật (PostgreSQL, qua HTTP)**: `số 0912345678 của tôi nộp hồ sơ chưa` → kho `số 09******78 của tôi nộp hồ sơ chưa`; `CCCD 079123456789, email nguyenvana@gmail.com…` → `07********89`, `n***@gmail.com`; "giá vàng hôm nay" hỏi hai lần (khác hoa/khoảng trắng) → **một dòng, `so_lan_gap` = 2**. File xuất bằng công cụ nhập thật không còn số/email gốc; mọi ô bắt đầu bằng `=`, `+`, `-`, `@` (kể cả `=HYPERLINK("http://evil.test/x","bấm vào")`) có kiểu **Text**, không công thức.
- **13 biến thể che** qua API (0912.345.678, 0912 345 678, +84 912 345 678, 0912-345-678, (028) 3822 1234, 09 12 34 56 78, 09-12-34-56-78, "Số: 0912345678.", hai số, email có dấu chấm/cộng/chữ hoa, `a@b.vn`, CCCD 12 số, CMND 9 số): **0 biến thể còn dữ liệu gốc trong kho**. Không che nhầm: `12 05`, `12/05`, `12345678` (8 chữ số).
- **AC-27** trên PostgreSQL thật (đồng hồ giả): lần cuối 0 ngày → xoá ở +91 ngày; câu gặp lại ở +80 ngày tính lại 90 ngày (còn ở +169, xoá ở +171). **Kho đầy**: 50.000 dòng → câu mới bị bỏ, câu có sẵn vẫn cộng lần gặp, **đúng một cảnh báo log mỗi giờ**.
- **ReDoS**: 12 chuỗi 500 ký tự (125 nhóm số 1 chữ số, nhóm 2/3 chữ số, 499 chữ số, "0912 " ×100, "a@" ×250, "a@a." ×125, "(1)-" ×125, 70 từ lạ…) trên PostgreSQL: **3–57 ms mỗi câu**, 0 lỗi 5xx.
- **Giới hạn/tần suất (Production https, mặc định)**: 60 câu đầu 200 (dù mỗi câu kèm `X-Forwarded-For` khác nhau → **không lách được**); câu 61 → **429** `qua-nhieu-yeu-cau` + `Retry-After: 60` + `maTraCuu`; `POST /chu-de` cùng bộ đếm; `GET /chu-de` bộ đếm danh mục riêng (200); sau ~62 s hỏi lại được; **200 yêu cầu song song → đúng 60 × 200 và 140 × 429**; nguồn IPv6 `[::1]` có bộ đếm riêng (khi `127.0.0.1` bị chặn vẫn 200); 301 yêu cầu danh mục → lần 301 là 429. Trong trình duyệt (kiosk): 60 câu rồi "Bắt đầu lại", câu kế vẫn bị chặn (không đặt lại).
- **Body**: 501 ký tự → 400 `du-lieu-khong-hop-le`, **không ghi kho, không nhắc lại câu**; 500 ký tự → 200; body 70 KB → 413 `yeu-cau-qua-lon`; JSON hỏng → 400; `Content-Type` form → 415; `PUT` → 405.
- **Riêng tư (PW)**: câu hỏi chỉ trong body POST (URL không query), storage chỉ có `cach-xem`/`doc-bat` (không câu hỏi), `history.state`/cookie/URL không có; tab khác không thấy hội thoại; tải lại → khung đóng, hội thoại mất, ngữ cảnh mất ("mấy ngày" → xin lỗi).
- **Log yêu cầu** (mức Trace, yêu cầu 200/400/413): không chứa CCCD, email, số điện thoại (kể cả bản đã che), câu 501 ký tự hay phần body 70 KB.
- **Số đo giao diện (375)**: ✕ 34×34 px, Gửi 47×34, chip chủ đề 65×28 — đạt spec C01 (≥ 24 px); testcases TN-11 ghi 44 px nên lệch (sẽ chỉnh testcases). Bấm "Trợ lý" → khung hiện, con trỏ ở ô nhập: 121 ms. Enter → đáp án (4G giả lập 1,6 Mbps, trễ 150 ms): 223 / 232 / 245 ms. Mở lại khung phát một `GET /chu-de` mới (staleTime 0) — đúng thiết kế.

## Kết quả bảo mật

| Kiểm tra | Kết quả |
|---|---|
| `curl -I` `/` và `/api/tro-ly/chu-de`; header trên 17 loại phản hồi (HTML, JS, JSON, `POST /hoi` 200/400/413, 404, 405, 429) | **Đạt**: CSP nguyên văn `CLAUDE.md`, HSTS, nosniff, Referrer-Policy, Permissions-Policy; không `Server`, `X-Powered-By`, CORS |
| Playwright: CSP/console/yêu cầu ra ngoài khi dùng khung (hỏi kết hôn, giá vàng) | **Đạt**: 0 vi phạm CSP, 0 lỗi console, 0 yêu cầu ra ngoài gốc, 0 lần gọi micro |
| XSS: câu hỏi `<script>`, `"><img onerror>`, `{{7*7}} ${7*7} {0}`, SQL | **Đạt**: hiện nguyên văn chữ, 0 hộp thoại, không phần tử sinh ra; dữ liệu (tên thủ tục, địa chỉ, câu mẫu) chứa `<b>`, `{{ma}}` cũng hiện nguyên văn |
| Liên kết nguy hiểm từ dữ liệu (`javascript:`, `data:`, `vbscript:` ở Zalo OA, bản đồ, Cổng DVC) | **Đạt**: không thành liên kết bấm được, 0 hộp thoại; liên kết ngoài `target="_blank"` + `rel="noopener noreferrer"` |
| Che thông tin cá nhân (BR-8) trước khi lưu; xuất Excel; công thức | **Đạt** (xem số đo) |
| Câu hỏi không nằm trên URL / storage / cookie / `history.state`; log không chứa nội dung | **Đạt** |
| Rate limit theo IP: 60/phút trợ lý, 300/phút danh mục, `X-Forwarded-For` giả, IPv6, song song | **Đạt** (xem số đo). `ForwardedHeaders` tắt mặc định; xUnit `GioiHanTheoIpTests` (IPv6 /64, proxy tin cậy) xanh |
| Kích thước/đầu vào: 501 ký tự, 64 KB+, JSON hỏng, content-type | **Đạt** |
| ReDoS: chuỗi dài nhiều nhóm số | **Đạt** (≤ 57 ms) |
| Bản build: `.map`, `.pdb`, `.xml`, `sourceMappingURL`; obfuscate | **Đạt**: 0; chunk `KhungTroLy`, `docCauTraLoi` đã obfuscate |
| `npm audit --omit=dev`; `dotnet list package --vulnerable --include-transitive` | **Đạt**: 0 / không gói nào; F06 không thêm gói |
| `dangerouslySetInnerHTML`, chuỗi kết nối trong `wwwroot`/bản publish/`appsettings*` | **Đạt**: không có |
| OpenAPI chỉ ở Development; lỗi ProblemDetails không stack trace; 404 `GET` chỉ route mẫu trong log | **Đạt** |

## Kết quả hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| p95 `POST /api/tro-ly/hoi` — nguồn Mẫu 408 thủ tục (Release, 24 câu luân phiên, 1.000 lần) | **7,7 ms** (p50 3,9 · p99 9,5 · max 23) | ≤ 300 ms |
| p95 — PostgreSQL 408 thủ tục (nhân sự đọc mỗi câu) | **4,2 ms** (p99 5,6) | ≤ 300 ms |
| p95 — PostgreSQL **1.000 thủ tục** + 14 nhân sự + 3 phân công | **4,3 ms** (p99 6,3 · max 10,1); 100 lần: 6,9 ms | ≤ 300 ms |
| p95 `POST /api/tro-ly/chu-de` / `GET /chu-de` / `GET /viet-tat` (1.000 lần) | 2,2 · 0,8 · 1,2 ms (PostgreSQL 1.000 thủ tục) | ≤ 300 ms |
| Tải 50 luồng song song × 200 câu (10.000 yêu cầu, PostgreSQL 1.000 thủ tục) | 0 lỗi, p50 27 · p95 46 · p99 242 · max 802 ms (1.474 yêu cầu/s) | không 5xx, p95 trong ngân sách |
| 500 kết nối đồng thời (trang chủ, thủ tục, lĩnh vực, trung tâm) + 84 người hỏi liên tục | 0 lỗi; chậm nhất 1,37 s (có Playwright chạy cùng lúc); 84 người: p95 88 ms | trung bình < 2,5 s, chậm nhất < 30 s |
| Dựng chỉ mục + câu đầu tiên (xUnit, Debug) | Mẫu 408: 45 ms · Mẫu 1.000: 142 ms · PostgreSQL 408: 244 ms · PostgreSQL 1.000: 89 ms | ≤ 300 ms |
| JS tải ban đầu (gzip -9) `/` 375 / 1280 (lúc load → sau 3,5 s) | 149,1 → **181,6** / 149,1 → **192,1** KiB; **không** tải `KhungTroLy`, không gọi `/api/tro-ly/*` khi chưa bấm | ≤ 200 KB |
| Chunk `KhungTroLy` | **20,5 KiB** gzip -9 (nạp lười lúc bấm "Trợ lý") | 14–25 KB |
| Lighthouse mobile `/` ×3 (Production) | **96 · 96 · 97**; Accessibility/Best practices/SEO 100; LCP 2,19–2,40 s; TBT 23–81 ms; **CLS 0,000** | ≥ 85, CLS < 0,1 |
| Bấm "Trợ lý" → khung + con trỏ ở ô nhập | **121 ms** | ≤ 1 s |
| Enter → đáp án (4G giả lập) | **223–245 ms** | ≤ 1 s |

## Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa | **R1** Cạnh tranh ghi địa chỉ (chập chờn): gõ vào ô tìm của trang rồi mở "Trợ lý" ngay, hỏi, bấm "Xem chi tiết" trong khung thì **popup không mở (URL chỉ còn `q`) hoặc `q` bị mất khỏi URL** (popup mở). Ở lúc bấm, địa chỉ vẫn chưa có `q` dù đã gõ > 1,5 s trước: lần ghi `q` bị trì hoãn rồi đè/bị đè bởi lần ghi `ma`. Lặp 8 lần ở kiosk 1080×1920: 1 lần popup không mở, 1 lần mất `q`, 6 lần đúng. Chờ ≥ 2,5 s trước khi bấm thì 10/10 đúng | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts kiosk --project=chromium -g "F09-KT-01" --repeat-each=8` (chập chờn); trình tự tay: mở `/thu-tuc`, gõ "khai sinh", bấm "Trợ lý" ngay, hỏi "kết hôn", bấm "Xem chi tiết" ngay khi đáp án hiện | ui-core-dev (`core/hooks/useDanhSachUrl`, ghi địa chỉ có `startTransition`/hẹn giờ), frontend-dev (`features/thu-tuc/useMoThuTuc` — lấy tham số địa chỉ mới nhất khi điều hướng) |
| Thấp | **G1** `GET /api/tro-ly/hoi` (đường chỉ nhận POST) trả **404 `khong-tim-thay`** thay vì 405 `phuong-thuc-khong-hop-le` (testcases GH-20, plan §3.4); `PUT`/`DELETE`/`OPTIONS` đúng 405. Nguyên nhân: route dự phòng của SPA nhận mọi `GET` nên lớp chọn phương thức coi là khớp. Không có hệ quả bảo mật | `curl -si https://localhost:5443/api/tro-ly/hoi` | backend-dev (`Common/Hosting/SpaFallback`: loại `/api/*` khỏi route dự phòng) hoặc chatbot-dev (nhận `GET` rồi trả 405) |
| Thấp | **G6** `POST /api/tro-ly/hoi` với `maThuTuc` dài 21 ký tự trả **400** (testcases TH-23, plan §3.1 nói "bỏ qua nếu sai, luôn 200"); mọi giá trị khác (mã lạ, `abc<b>`, `' OR 1=1--`, `%00`, NUL, rỗng, null) đều 200 như không có ngữ cảnh. Giao diện không bao giờ gửi mã > 10 ký tự nên không ảnh hưởng người dân | `node` gửi `{"cauHoi":"mấy ngày","maThuTuc":"xxxxxxxxxxxxxxxxxxxxx"}` | chatbot-dev (đổi `[StringLength]` thành bỏ qua, hoặc sửa plan/testcases) |
| Thấp | **G2** Câu vô nghĩa có số ngày tháng kèm năm vẫn ra danh sách thủ tục: "xem bói 12 05 2026" → 1.004179 (Điều 12 … khoản 12 Điều 2 Nghị định …/2026), "giá vàng 12 05 2026" → 1.115148; bỏ năm ("giá vàng 12 05") thì đúng là `khong-hieu`. Số trong câu hỏi khớp với số hiệu văn bản trong tên thủ tục nâng điểm lên "đủ liên quan" | `node` gửi `{"cauHoi":"xem bói 12 05 2026"}` tới `POST /api/tro-ly/hoi` | chatbot-dev (`ChamDiem`: không tính điểm cho từ chỉ gồm chữ số trừ khi là mã thủ tục) |
| Thấp | **G3** Dưới 600 px khung phủ `inset: 0` nhưng rộng = khung nhìn − 15 px khi trình duyệt có thanh cuộn cổ điển (do `scrollbar-gutter: stable` ở `global.css`): hở 15 px bên phải trên cửa sổ hẹp (desktop). Điện thoại thật dùng thanh cuộn nổi nên không ảnh hưởng | mở `/` ở 375×812 bằng Chromium desktop, bấm "Trợ lý": `getBoundingClientRect().width` = 360 | chatbot-dev (`KhungTroLy.module.css`: dùng `100dvw`/`position: fixed; left:0; right:0` không dựa gutter) |
| Thấp | **G4** (còn từ `review.md`) Kho câu chưa trả lời đầy trần 50.000 thì **câu mới bị bỏ** (đã có cảnh báo log mỗi giờ). Một nguồn gửi 60 câu lạ/phút làm đầy kho sau ≈ 14 giờ, câu thật bị bỏ cho tới khi quá 90 ngày | `KhoDay_TranMacDinh50000…` (xUnit, PostgreSQL thật) cho thấy hành vi | chatbot-dev / planner (chọn: xoá dòng `so_lan_gap = 1` cũ nhất khi đầy, hoặc trần theo ngày) |
| Thấp | **G5** (tài liệu) testcases ghi vùng bấm 44 px (TN-11), `GET /chu-de` 304 khi mở lại (HN-11): spec C01 chỉ đòi ≥ 24 px; mở lại khung phát yêu cầu có điều kiện (Chromium trả 200 cho trang) nên không đo được 304 ở trình duyệt, 304 đã kiểm ở mức API | — | tester (chỉnh testcases) |

## Ca thử tay — chờ (liệt kê gọn)

- TT-10: bấm số điện thoại trên điện thoại thật (mở trình gọi đúng số). LH-06: mở Zalo OA thật khi dữ liệu có Zalo OA.
- TN-14 và các ca TAY còn lại: NVDA/TalkBack với `aria-live` của khung (đọc **tin mới** một lần, không đọc lại lịch sử), kiosk thật.
- F07/F09 liên quan: giọng thật, kiosk thật (xem `result/test.md` của F07, F09).

## Kết quả từng task

- **T17**: `Integration/Chatbot/TroLyTrenPostgreSqlTests.cs` (lớp con hợp đồng + `TroLyHaiNguonTests` + `TroLyHttpTrenPostgreSqlTests`); p95 đo trên bản Release ở nguồn Mẫu (408) và PostgreSQL (408 và 1.000 thủ tục). `dotnet test` xanh có DB thử, bỏ qua có thông báo khi không có.
- **T18**: `e2e/tro-ly.spec.ts`, `e2e/hien-thi-tro-ly.spec.ts`; axe 0 vi phạm với khung mở ở 375/768/1280 (và kiosk, trong `kiosk.spec.ts`); đi hết khung bằng bàn phím; popup mở trên khung; JS ban đầu 181,6–192,1 KiB; chunk khung không tải khi chưa bấm; Lighthouse 96–97.
- **T19**: tài liệu này. Ca chờ F07/F09 đã kiểm ở bên F07, F09.
