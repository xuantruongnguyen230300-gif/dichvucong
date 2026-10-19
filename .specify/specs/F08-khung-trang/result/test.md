CHƯA ĐẠT

# F08 · Khung trang chung — kết quả kiểm thử (T10)

## Lượt xác nhận (2026-10-14)

- **Kết luận: CHƯA ĐẠT** — **1 ca trượt**: **F08-TL-04** (ca mới; BR-11 và AC-13: "đầu, điều hướng và **chân trang** hiện trước, vùng nội dung hiện Đang tải… tới khi có dữ liệu"). Sau khi ui-core-dev sửa CLS (K1/L1), `Layout` **ẩn chân trang trong lúc trang còn khung chờ** (`khungCho.ts`, `chanTrangAn`), nên chân trang (và lời miễn trừ) không hiện cho tới khi dữ liệu về (≥ 3 s ở ca thử). Đây là **xung đột giữa spec F08 và cách sửa CLS**, không phải lỗi chức năng; cần quyết định (N1, bảng lỗi). Ca sẽ đạt ngay khi spec được sửa (tester đổi ca) hoặc chân trang hiện lại với chiều cao giữ chỗ.
- Trước đó F08: ĐẠT (lượt 2, 2026-10-12). Playwright `khung-trang.spec.ts` lượt này: **66 đạt · 1 trượt** (TL-04). Các ca đã chỉnh vì chân trang không còn hiện trong lúc chờ hoặc vì dữ liệu/DOM đổi (ghi ở đây để không mất dấu): F08-CT-18 (chờ tới khi chân trang hiện), F08-BQ-05 (Tab tới 200 lần vì chân trang chỉ hiện sau nội dung đầy đủ; sau chân trang còn nút "Trợ lý" nổi; `<input>` ô tìm không có viền riêng — viền ở khung bao), F08-TN-02/03 (trang có danh sách phân trang có thêm `nav` tên "Phân trang": một "Điều hướng chính" + tối đa một "Phân trang"), F08-BM-07 (`oDichVu[]` chỉ còn `bieuTuong`, `ten`, `url` — `moTa` đã bỏ khỏi phản hồi, khớp plan F08 §3.1).
- **F08-TL-03** (CLS khi `/api/trung-tam` chậm 5 s) nay dùng dữ liệu thật có ô dịch vụ và giờ làm việc: **0,0077** (375) · **0,0000** (1280), ngưỡng siết còn ≤ 0,05. Ca **F08-TL-03c** (mới, ghi nhận): với dữ liệu *rỗng* ô dịch vụ và giờ làm việc (bộ A) CLS là 0,2787 (375) và 0,1264 (1280) vì khung chờ cao hơn nội dung thật — không gặp khi vận hành (Trung tâm luôn có ô và giờ), nên chỉ ghi nhận.
- Ngày chạy: 2026-10-14 (lượt xác nhận cuối sau khi dev sửa các lỗi lượt 2026-10-13). Người chạy: tester. Tuần tự, một trình duyệt tại một thời điểm. Windows 10, Node 20.19.2, .NET 10.0.400, PostgreSQL 18 cục bộ (`postgres`); Docker không chạy nên không có Testcontainers (ca DB thật dùng `DbThuNghiem`, biến `ConnectionStrings__DichVuCongTest`).
- Bản kiểm: `npm run build` mới (JS ban đầu **184,9 KiB** gzip) rồi `dotnet publish -c Release` (không `.pdb`/`.map`). Máy chủ: **S1** `https://localhost:7157` (Development, nguồn Mẫu, giới hạn 100000/phút) chạy e2e; **S2** `https://localhost:5443` (Production, giới hạn mặc định 300/60 mỗi phút) cho header, 429, Lighthouse; **S3** `http://localhost:5555` (Production, nguồn PostgreSql, DB tạm `dichvucong_t15` dựng bằng `DuLieuMau` → `dotnet ef database update` → công cụ nhập, có 3 phân công quầy + 3 nhân sự; đã xoá sau khi chạy).

### Lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Nên sửa | **N1** Chân trang ẩn khi có khung chờ (cách sửa CLS) trái BR-11/AC-13 của F08 ("chân trang vẫn hiện"). Hệ quả: lời miễn trừ, địa chỉ, liên hệ ở chân trang chưa hiện trong 3 s đầu khi API chậm. Cần chọn: (a) cập nhật spec F08 (BR-11, AC-13) cho phép ẩn chân trang tới khi nội dung xong, hoặc (b) giữ chân trang hiện nhưng đẩy xuống dưới màn hình đầu bằng khung chờ cao ≥ 1 màn hình | `E2E_BASE_URL=https://localhost:7157 npx playwright test -c e2e/ban-build.config.ts khung-trang --project=chromium -g "F08-TL-04"` | ba-analyst (nếu chọn a) hoặc ui-core-dev (nếu chọn b) — cần người dùng quyết định |

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

> Hai lượt: **lượt 2** (xác nhận sửa L1–L7) nằm ngay dưới; **lượt 1** giữ nguyên ở phần "Lượt 1" (kết luận lượt 1: CHƯA ĐẠT vì lỗi Chặn L1).

## Lượt 2 — xác nhận sửa lỗi (2026-10-12 chiều)

- Ngày chạy: 2026-10-12 (chiều). Người chạy: tester. Chạy tuần tự, một trình duyệt tại một thời điểm.
- Bản kiểm: sau khi ui-core-dev, backend-dev, db-dev sửa L1–L7. Bản build mới (`npm run build`). Lighthouse, header, `curl`: bản `dotnet publish -c Release` (Production). Playwright `khung-trang.spec.ts`: `https://localhost:7157` (profile `https`, nguồn Mẫu, `RateLimiting__DanhMuc=100000`), như lượt 1.
- Mã thêm lượt 2 (`e2e/`): `F08-DT-06 (L4)`, `F08-DT-06b (L4)`, `F08-BM-02b (L3)`, `F08-HN-08b` trong `khung-trang.spec.ts`; `ban-build.config.ts` thêm 3 project (chromium, firefox, webkit) để chạy `trinh-duyet-cu.spec.ts` trên bản build.
- **Kết luận lượt 2: ĐẠT** — không còn ca trượt, không còn lỗi Chặn hay Nên sửa. Ca **trượt 2 → 0**: `F08-TL-03` (CLS), `F08-HN-02` (Lighthouse `/`) nay đạt; `F08-HN-03` và `F08-DT-06` từ "Đạt một phần" lên "Đạt".
- **`trang_thai` của `spec.md` vẫn `dang-lam`** (không đổi sang `xong`): còn 25 ca Chờ (F03, F04, F06, F09, thiết bị/người thật, bản triển khai), 10 ca chưa chạy (cần Import qua tiến trình, nhập lại dữ liệu). Chuyển `xong` khi các ca này đạt.
- Số ca (167): Đạt **119** · Đạt một phần **12** · Trượt **0** · Chờ **25** · Chưa chạy **10** · Ghi nhận **1**. (Lượt 1: 115 · 14 · 2 · 25 · 10 · 1.)
- Tự động: Playwright `khung-trang.spec.ts` **64/64 đạt** (lượt 1: 59/61; lượt 2 thêm 4 ca mới và 2 ca CLS nay xanh); `trinh-duyet-cu.spec.ts` trên bản build **9/9** (Chromium, Firefox, WebKit); `smoke.spec.ts` và `trinh-duyet-cu.spec.ts` qua Vite dev + API: 16/16 (xem ghi chú Firefox). `npm test` 365/365, `npm run lint` sạch, `dotnet test` 581/581 (có DB) hoặc 533 đạt + 48 bỏ qua (không DB) — xem F00.

### Ca đổi kết quả hoặc kiểm lại ở lượt 2

| Case | Lượt 1 | Lượt 2 | Ghi chú |
|---|---|---|---|
| F08-TL-03 | Trượt | **Đạt** | CLS khi `/api/trung-tam` chậm 5 s: **0,045 ở 375px**, **0,015 ở 1280px** (lượt 1: 0,337 và 0,076). Nguồn dịch chuyển còn lại là `FOOTER` (0,045) nhưng dưới 0,1 |
| F08-TL-03b | (đo) | Đạt | API thật không trễ: CLS **0,010 ở 375px**, **0,000 ở 1280px** (lượt 1: 0,308 / 0,057) |
| F08-HN-02 | Trượt | **Đạt** | Lighthouse mobile `/` (publish, 3 lần): **96, 96, 95**; CLS 0,02; LCP 2,5 s; TBT 11–83 ms |
| F08-HN-03 | Đạt một phần | **Đạt** | `/linh-vuc` **97, 97, 97**; `/thu-tuc` **97, 97, 97**; CLS 0,02 |
| F08-HN-08b (mới) | — | Đạt | `index.html`: `trinh-duyet-cu-*.js` có `defer`; mọi `<script>` là `defer` hoặc `type="module"`. Lighthouse chỉ còn CSS (~0,16 s) là tài nguyên chặn hiển thị, script cũ không còn |
| F08-DT-06 | Đạt một phần | **Đạt** | (H) và (D) khớp ở trang 404 (L4): xem dưới |
| F08-DT-06 (L4), DT-06b (mới) | — | Đạt | Máy chủ: `/abc-xyz` không có `DC.identifier`/`og:url` (có `DC.title`, `DC.date`, `og:title`…); `/`, `/thu-tuc`, `/linh-vuc` có đủ khi khai `AllowedHosts`. FE: đi tới `/abc-xyz` bằng điều hướng trong ứng dụng (pushState) và vào thẳng → `<head>` có 0 thẻ `DC.identifier`, 0 thẻ `og:url`, tiêu đề "Không tìm thấy trang – …"; rời 404 sang Danh mục thì số thẻ về như trước, không trùng |
| F08-BM-02b (L3, mới) | — | Đạt | `HEAD /api/trung-tam` 200 + `ETag`, đủ header bảo mật, không `Server`, thân rỗng; kèm `If-None-Match` → 304 |
| F08-CT-11 (chập chờn) | Đạt | **Đạt, không tái hiện** | Chạy riêng 3 lần: 3/3; `--repeat-each=10`: 10/10; trong lượt chạy toàn bộ: 1/1 → **14/14 đạt (tỉ lệ lỗi 0%)**. |
| F08-KH-… tất cả ca còn lại | như lượt 1 | như lượt 1 | Chạy lại cả 64 ca Playwright, không ca nào đổi kết quả |
| F08-TL-08, BM-12 | Đạt | Đạt | Không ảnh hưởng bởi sửa lỗi |

### Bảng bảo mật lượt 2

| Kiểm tra | Kết quả |
|---|---|
| Header bảo mật đủ và đúng nguyên văn trên HTML, 404, API (GET/HEAD), tài nguyên tĩnh (HTTPS Production) | Đạt (có HSTS; HTTP → 307) |
| Không `Server`, `X-Powered-By` | Đạt |
| Console không lỗi CSP; không script/style inline; không request ra tên miền ngoài (4 trang) | Đạt (`F08-BM-03/04/05`) |
| Host lạ không phản chiếu vào HTML (kể cả 404) | Đạt |
| `.map`, `.pdb`, `.xml`, `sourceMappingURL`, `console`/`debugger` trong bản build/publish | Không có |
| `HEAD /api/trung-tam` | **200** (lỗi L3 đã sửa) |
| Rate limiting 300/phút | Đạt (`F08-BM-13`, và xem F00-ND-22 lượt 1; không đổi) |
| Gửi 501 ký tự, gửi dồn vào API trợ lý | Chờ F06 |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | Không có |

### Bảng hiệu năng lượt 2

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip -9, tổng mọi `.js` mở `/`) | **143,6 KiB** (Vite báo 148,8 kB theo 1 kB = 1000 B; lượt 1: 143,4) | ≤ 200 KB |
| Lighthouse mobile `/` (3 lần) | **96 · 96 · 95** · FCP 2,1 s · LCP 2,5 s · TBT 11–83 ms · **CLS 0,02** | ≥ 85 |
| Lighthouse mobile `/linh-vuc` (3 lần) | **97 · 97 · 97** · CLS 0,02 | ≥ 85 |
| Lighthouse mobile `/thu-tuc` (3 lần) | **97 · 97 · 97** · CLS 0,02 | ≥ 85 |
| CLS Playwright: API thật / API chậm 5 s | 0,010 · 0,045 (375px); 0,000 · 0,015 (1280px) | ≤ 0,1 |
| 3G chậm: đầu trang so với chunk trang | 4,77 s / 5,18 s (đầu trang trước) | đầu trang trước chunk |
| `/api/trung-tam` p95 (100 lần, Development, nguồn Mẫu) | 34,4 ms (gồm bắt tay TLS của `curl`) | ≤ 300 ms |
| API trợ lý, API danh mục | Chờ F06, F04 | ≤ 300 ms |

### Lỗi sau lượt 2

| Mức | Mô tả | Trạng thái | Agent sửa |
|---|---|---|---|
| Chặn (L1) | CLS chân trang kéo Lighthouse `/` và `/linh-vuc` xuống 84 | **Đã sửa, xác nhận** (95–97, CLS 0,02) | — |
| Nên sửa (L3) | `HEAD /api/trung-tam` 404 | **Đã sửa, xác nhận** (200/304) | — |
| Nhẹ (L4) | Trang 404: (H) không có `DC.identifier`/`og:url`, (D) có | **Đã sửa, xác nhận** (cả hai không có) | — |
| Góp ý | Script `trinh-duyet-cu` đồng bộ chặn hiển thị | **Đã sửa, xác nhận** (`defer`; chạy được ở Chromium, Firefox, WebKit) | — |
| Góp ý (L8) | Production không có `AllowedHosts` → không có `DC.identifier`/`og:url` ở mọi trang; nhớ khai khi triển khai | **Còn** (ghi nhận, không phải lỗi mã) | điều phối triển khai |
| Góp ý | Logo SVG nhúng data URI nên AC-21 "tên tệp có hash" không áp dụng theo nghĩa đen | **Còn** (CSP cho phép; chưa quyết định) | ui-core-dev hoặc ba-analyst (sửa AC-21) |
| Ghi nhận | Playwright + Firefox (Windows) thỉnh thoảng lỗi hạ tầng, không thuộc ứng dụng: `browserContext.close … _maybeDontRestoreTabs undefined` (2/9 lượt đầu) và `NS_ERROR_CONNECTION_REFUSED` khi máy chủ Vite do Playwright tự bật chưa sẵn sàng. Khi chạy lại với máy chủ dựng sẵn: 4/4 lượt xanh; trên bản build: 9/9 | Theo dõi | — |

---


# Lượt 1 — F08 · Khung trang chung — kết quả kiểm thử (T10)

- Ngày chạy: 2026-10-12. Người chạy: tester. Chạy tuần tự, một trình duyệt (Chromium), không chạy song song.
- **Kết luận:** CHƯA ĐẠT vì có **1 lỗi Chặn (L1)**: Lighthouse mobile của `/` và `/linh-vuc` là **84** (< 85) do dịch chuyển bố cục (CLS 0,24–0,26) ở chân trang. Ngoài ra không có ca nào khác trượt.
- Số ca: **167** (testcases.md). Đạt **115** · Đạt một phần **14** · Trượt **2** · Chờ (chức năng khác/thiết bị thật/bản triển khai) **25** · Chưa chạy **10** · Ghi nhận **1**.
- `trang_thai` của `spec.md` **giữ nguyên** (chưa `xong`): còn lỗi Chặn, còn ca Chờ F03/F04/F06/F09 và ca thử tay.
- Môi trường: bản build (`npm run build`) do API phục vụ. Playwright chạy trên `https://localhost:7157` (profile `https`, nguồn Mẫu; đặt `RateLimiting__DanhMuc=100000` để các ca không tự chặn nhau). Header, TLS, tần suất, hiệu năng, Lighthouse: bản `dotnet publish -c Release`, môi trường Production. Ca cần dữ liệu riêng (bộ A, B, C, D, E, F): chặn `GET /api/trung-tam` và trả bộ thử, kiểm lớp phòng thủ của FE.
- Mã thêm: `src/FrontEnd/e2e/khung-trang.spec.ts` (61 ca Playwright), `src/FrontEnd/e2e/ban-build.config.ts`; `src/BackEnd/DichVuCong.Tests/Integration/ThongTinTrungTam/` (10 ca PostgreSQL).
- Chạy lại `e2e/smoke.spec.ts` (`dien-thoai` và `kiosk`, qua Vite dev + API): **4/4 đạt** (3 lần liên tiếp); hai ca "đường dẫn lạ" đã hết đỏ sau khi đổi khoá i18n. Ca "mở trang chủ" trước đó chập chờn: kiểm tiêu đề `/Tra cứu thủ tục hành chính/` đổi thành "Trang chủ – <tên trung tâm>" khi dữ liệu Trung tâm về (F08), nên đạt hay không tuỳ thời điểm; đã sửa biểu thức chấp nhận cả hai tiêu đề (tester sở hữu `e2e/`).
- Kết quả tự động: Playwright `khung-trang.spec.ts` **59/61 đạt** (lượt chạy cuối), 2 ca đỏ cùng một nguyên nhân (CLS). `npm test` 355/355, `npm run lint` sạch, `dotnet test` 572/572 (có DB) — xem F00 `result/test.md`.

## Bảng ca

| Case | Kết quả | Ghi chú |
|---|---|---|
| F08-KH-01 | Đạt | PW 1280 và 375: header/nav/footer cùng cấu trúc ở /, /thu-tuc, /linh-vuc, /abc-xyz |
| F08-KH-02 | Đạt | đúng 3 mục theo thứ tự; tên đọc là nhãn đầy đủ; không nút menu |
| F08-KH-03 | Đạt một phần | aria-current + gạch dưới/viền đạt (PW); phần xem đen trắng bằng mắt (TAY) chưa làm |
| F08-KH-04 | Đạt |  |
| F08-KH-05 | Đạt |  |
| F08-KH-06 | Đạt | một <a> duy nhất bao biểu tượng + tên + địa bàn |
| F08-KH-07 | Đạt | 375px: 1 hàng, không cuộn ngang, chữ hiện "Trang chủ/Danh mục/Lĩnh vực" |
| F08-KH-08 | Đạt |  |
| F08-KH-09 | Đạt | tên đọc đầy đủ, nhãn ngắn aria-hidden; axe 0 lỗi |
| F08-KH-10 | Chờ | cần NVDA/TalkBack (TAY) |
| F08-KH-11 | Đạt | 600, 768, 1280 (kiosk ở KH-14) |
| F08-KH-12 | Đạt | 320px và 640x360: không cuộn ngang ở 4 trang |
| F08-KH-13 | Đạt | position: sticky, dính đầu ở 1280 và 375 |
| F08-KH-14 | Đạt | kiosk 1080x1920 |
| F08-KH-15 | Đạt | không tải lại (cờ window còn nguyên), Quay lại đúng mục đang xem |
| F08-KH-16 | Chưa chạy | trang hiện tại ngắn, không cuộn được; làm khi F02/F04 có nội dung dài |
| F08-KH-17 | Đạt | API 404: chỉ còn biểu tượng + điều hướng + lời miễn trừ, không lỗi console |
| F08-BQ-01 | Đạt | 1280, 375, kiosk |
| F08-BQ-02 | Đạt | focus vào <main id=noi-dung>, địa chỉ không đổi, main không viền |
| F08-BQ-03 | Đạt |  |
| F08-BQ-04 | Đạt | ẩn ngoài màn hình nhưng không display:none/visibility:hidden |
| F08-BQ-05 | Đạt | thứ tự: bỏ qua, thương hiệu, 3 mục, nội dung, chân trang; viền focus trắng ở chân trang |
| F08-BQ-06 | Đạt |  |
| F08-CT-01 | Đạt | dữ liệu Mẫu so khớp API; bộ A giả lập đúng chữ |
| F08-CT-02 | Đạt một phần | href tel: đạt (PW); mở trình gọi trên thiết bị thật (TAY) chưa làm |
| F08-CT-03 | Đạt |  |
| F08-CT-04 | Đạt | không có "–" thừa |
| F08-CT-05 | Đạt |  |
| F08-CT-06 | Đạt |  |
| F08-CT-07 | Đạt | bộ B: không bản đồ, không khối mạng xã hội, không liên kết hữu ích, không chữ giữ chỗ |
| F08-CT-08 | Chưa chạy | cần nhập lại số mới vào PostgreSQL rồi tải lại (Import đã có) |
| F08-CT-09 | Chưa chạy | Import có test đơn vị TrungTamTests xanh; chưa thử qua UI |
| F08-CT-10 | Đạt |  |
| F08-CT-11 | Đạt | tab mới, rel noopener noreferrer, opener null, "(mở trang mới)" |
| F08-CT-12 | Đạt | bộ D ở 375 và 1280 |
| F08-CT-13 | Đạt | bộ E: chữ thường, không hộp thoại, không điều hướng |
| F08-CT-14 | Đạt | bộ C: hiện nguyên chữ, không <b>/<script> |
| F08-CT-15 | Đạt | đối chiếu 3 tên miền ở lien-ket.md §1 "Đã bỏ"; không "đăng xuất" |
| F08-CT-16 | Đạt |  |
| F08-CT-17 | Đạt |  |
| F08-CT-18 | Đạt | API chậm 3 giây: khối chờ + lời miễn trừ |
| F08-CT-19 | Đạt một phần | Zalo OA (bộ A giả lập): tab mới + rel đạt; kênh chính thức chưa có (câu hỏi mở 14) |
| F08-CT-20 | Đạt | "© <tên>", không ghi năm |
| F08-NG-01 | Đạt một phần | định dạng dd/mm/yyyy khớp ngày API (Mẫu) và bộ A; nhập thật ngày 08/10 qua F01 chưa làm |
| F08-NG-02 | Chưa chạy | cần nhập file lỗi; chưa chạy |
| F08-NG-03 | Chưa chạy | cần nhập lại đúng file cũ; chưa chạy |
| F08-NG-04 | Đạt | xUnit NgayVietNam (backend-dev) + Integration PostgreSQL: 20:00 UTC → ngày kế tiếp |
| F08-NG-05 | Đạt | FE (ngày null) + Integration PG (không dòng thu-tuc) |
| F08-NG-06 | Đạt | timezoneId America/Los_Angeles, Pacific/Kiritimati, Asia/Ho_Chi_Minh đều "05/01/2026" |
| F08-MT-01 | Đạt |  |
| F08-MT-02 | Chờ | chờ F03 |
| F08-MT-03 | Chờ | chờ F06 |
| F08-MT-04 | Đạt |  |
| F08-404-01 | Đạt |  |
| F08-404-02 | Đạt |  |
| F08-404-03 | Đạt |  |
| F08-404-04 | Đạt | /THU-TUC, /thu-tuc/ khớp; 5 địa chỉ lạ → 404 React, không hiện chữ từ địa chỉ, không hộp thoại |
| F08-404-05 | Đạt | HTTP 200; <title>Không tìm thấy trang – <tên></title> do máy chủ chèn |
| F08-404-06 | Chờ | chờ F03, F04 |
| F08-404-07 | Chờ | chờ F03, F04 |
| F08-404-08 | Chờ | chờ F03, F04 |
| F08-404-09 | Chờ | chờ F03, F04 |
| F08-404-10 | Chờ | chờ F03, F04 |
| F08-404-11 | Đạt |  |
| F08-TL-01 | Đạt một phần | trang chủ ở 3G: đầu/điều hướng hiện trước; nội dung đầy đủ chờ F04 |
| F08-TL-02 | Đạt | 3G chậm: đầu trang 4,7 s, chunk trang về 5,1 s |
| F08-TL-03 | Trượt | CLS 0,337 ở 375 (nguồn: <footer>); 0,076 ở 1280. Lỗi L1 |
| F08-TL-04 | Chờ | chờ F04 |
| F08-TL-05 | Chờ | chờ F04 |
| F08-TL-06 | Chờ | chờ F04 |
| F08-TL-07 | Chờ | chờ F04 |
| F08-TL-08 | Đạt | LoiTrang trong vùng nội dung, khung còn, "Thử lại" tải lại, không lộ thông điệp lỗi |
| F08-TL-09 | Chờ | chờ F04 |
| F08-TL-10 | Chờ | chờ F04 |
| F08-TL-11 | Chờ | chờ F04 |
| F08-TD-01 | Đạt |  |
| F08-TD-02 | Đạt một phần | nguồn Mẫu = dữ liệu Cần Giuộc nên tab/đầu trang đúng; nhập lại không sửa code chưa thử |
| F08-TD-03 | Đạt | F1, F2, F3 và xa toàn khoảng trắng |
| F08-TD-04 | Đạt |  |
| F08-TD-05 | Đạt |  |
| F08-TD-06 | Đạt |  |
| F08-TD-07 | Đạt | logo 40x40 alt rỗng, nhưng nhúng data URI (không /assets/..svg): ghi nhận, CSP cho phép |
| F08-TD-08 | Đạt | thư mục app/layout/logo/ có đúng 1 tệp ảnh (logo.svg) |
| F08-TD-09 | Chưa chạy | thay logo thử rồi build: chưa làm |
| F08-TD-10 | Đạt |  |
| F08-TD-11 | Đạt |  |
| F08-LK-01 | Đạt | dữ liệu Mẫu: 3 liên kết đúng thứ tự |
| F08-LK-02 | Đạt |  |
| F08-LK-03 | Đạt |  |
| F08-LK-04 | Đạt | khớp lien-ket.md §1 dòng "Chân trang" |
| F08-LK-05 | Đạt một phần | viền focus đạt; Enter mở tab mới chưa thử riêng |
| F08-DT-01 | Đạt | (H) 4 tiêu đề khác nhau, đúng "<Tên trang> – <Tên trung tâm>" |
| F08-DT-02 | Đạt |  |
| F08-DT-03 | Đạt | axe 0 lỗi, lang=vi, 4 trang × 375/1280/kiosk |
| F08-DT-04 | Đạt | đủ thẻ, không trùng, không content rỗng; trang 404 không có DC.identifier/og:url (cố ý, L4) |
| F08-DT-05 | Đạt |  |
| F08-DT-06 | Đạt một phần | /, /thu-tuc, /linh-vuc trùng nhau; trang 404 lệch DC.identifier/og:url (L4) |
| F08-DT-07 | Đạt |  |
| F08-DT-08 | Đạt một phần | có test dev xanh (DacTaTrang.test, TrangHtmlTests); tester chưa chạy riêng |
| F08-DT-09 | Đạt | xUnit (không có DC.date khi ngày null) + FE ngày null |
| F08-DT-10 | Chờ | chờ F03 |
| F08-DT-11 | Chờ | chờ F03 |
| F08-DT-12 | Đạt | HTML của /?ma=… giống hệt "/" |
| F08-DT-13 | Chờ | cần Zalo + tên miền thật (giai đoạn 8) |
| F08-DT-14 | Chờ | chờ F03 |
| F08-DT-15 | Chờ | chờ F03 |
| F08-DT-16 | Đạt | xUnit TrangHtmlTests.TenChuaScript_DuocMaHoa + bộ C ở FE |
| F08-DT-17 | Đạt | query/đường dẫn độc hại không xuất hiện trong HTML |
| F08-DT-18 | Đạt | Host lạ → không phản chiếu; Host có thẻ script → 400 (Kestrel) |
| F08-DT-19 | Đạt | xUnit + chạy tay: DB không tới được → "/" 200 khối mặc định (lần đầu 1,2 s) |
| F08-DT-20 | Đạt một phần | xUnit HaiYeuCauTrong30Giay xanh; chưa đổi DB giữa hai lần |
| F08-DT-21 | Đạt |  |
| F08-DT-22 | Đạt |  |
| F08-DT-23 | Đạt |  |
| F08-DT-24 | Đạt |  |
| F08-DT-25 | Đạt | xUnit DuongDanHoaThuongVaDauGachCuoi_KhopDanhMuc |
| F08-TN-01 | Đạt | axe wcag2a/2aa/21a/21aa: 0 vi phạm (4 trang × 375, 1280, kiosk) |
| F08-TN-02 | Đạt |  |
| F08-TN-03 | Đạt |  |
| F08-TN-04 | Đạt |  |
| F08-TN-05 | Đạt |  |
| F08-TN-06 | Chờ | NVDA (TAY) |
| F08-TN-07 | Đạt |  |
| F08-TN-08 | Đạt |  |
| F08-TN-09 | Đạt | axe color-contrast 0 lỗi |
| F08-TN-10 | Chờ | TAY (đen trắng) |
| F08-TN-11 | Chờ | TalkBack/VoiceOver thật |
| F08-TN-12 | Chờ | trình đọc màn hình |
| F08-TN-13 | Chờ | chờ F03, F09 |
| F08-TN-14 | Đạt một phần | đệm dưới chân trang ≥ 80 px (375) và ≥ 96 px (kiosk) đạt; nút thật chờ F06, F09 |
| F08-BM-01 | Đạt | curl Production HTTPS: đủ 5 header đúng nguyên văn, không Server |
| F08-BM-02 | Đạt | HTML, 404, API (200/404/405/429), tài nguyên tĩnh; (304: xem HN-05) |
| F08-BM-03 | Đạt |  |
| F08-BM-04 | Đạt | 0 script inline, 0 <style> chèn lúc chạy |
| F08-BM-05 | Đạt | không request ra tên miền ngoài |
| F08-BM-06 | Đạt | bản build và bản publish: không .map/.pdb/sourceMappingURL |
| F08-BM-07 | Đạt |  |
| F08-BM-08 | Đạt |  |
| F08-BM-09 | Đạt |  |
| F08-BM-10 | Đạt |  |
| F08-BM-11 | Đạt | curl: đúng 300 × 200 rồi 429, Retry-After 60, code qua-nhieu-yeu-cau |
| F08-BM-12 | Đạt |  |
| F08-BM-13 | Đạt | 400 GET / không 429 |
| F08-BM-14 | Đạt |  |
| F08-BM-15 | Đạt |  |
| F08-BM-16 | Đạt | DB hỏng: API 500 loi-he-thong + maTraCuu; HTML 200 khối mặc định; log không có mật khẩu |
| F08-BM-17 | Đạt |  |
| F08-BM-18 | Ghi nhận | tài liệu: design-system.md §5 ghi "không ghi họ tên" mâu thuẫn TT 22/2023 — nhắc ba-analyst |
| F08-HN-01 | Đạt | 143,4 KiB gzip tổng mọi .js mở "/" (Vite báo 148,8 kB) |
| F08-HN-02 | Trượt | Lighthouse mobile: / = 84 (3 lần), CLS 0,24. Lỗi L1 (Chặn) |
| F08-HN-03 | Đạt một phần | /thu-tuc = 85 (trang tạm, đúng ngưỡng); /linh-vuc = 84 |
| F08-HN-04 | Đạt | p95 17,9 ms (Mẫu), 38,5 ms (PostgreSql) |
| F08-HN-05 | Đạt |  |
| F08-HN-06 | Đạt | p95 13,5 ms (HTML "/") |
| F08-HN-07 | Chưa chạy | chưa đếm câu SQL |
| F08-HN-08 | Đạt | đầu trang trước chunk trang (xem TL-02) |
| F08-HN-09 | Đạt một phần | Brotli đạt (Content-Encoding: br); JSON 1,95 KB thô, 0,68 KB Brotli |
| F08-HN-10 | Đạt |  |
| F08-IT-01 | Đạt | contract trên PostgreSQL |
| F08-IT-02 | Đạt |  |
| F08-IT-03 | Đạt |  |
| F08-IT-04 | Chưa chạy | cache theo phiên bản trên DB thật: chưa chạy (có DanhMucCacheTests với phiên bản giả) |
| F08-IT-05 | Đạt | DB rỗng: /api/trung-tam 404 khong-tim-thay + maTraCuu; "/" 200 khối mặc định |
| F08-IT-06 | Đạt một phần | DC.publisher = cơ quan hoặc tên (contract + xUnit); chưa thử qua Import |
| F08-IT-07 | Chưa chạy | cần Import qua tiến trình |
| F08-IT-08 | Chưa chạy | cần Import qua tiến trình |
| F08-KH-18 | Đạt |  |

## Bảng bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Header bảo mật đủ và đúng nguyên văn (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy) trên HTML, 404, API, tài nguyên tĩnh | Đạt (Production HTTPS: có HSTS; Development không có HSTS theo thiết kế) |
| Không header `Server`, `X-Powered-By` | Đạt |
| Console không lỗi vi phạm CSP (`securitypolicyviolation`) ở 4 trang | Đạt |
| Không `<script>`/`<style>` inline; không request tự động ra tên miền ngoài | Đạt |
| Không `.map`, `.pdb`, `sourceMappingURL`, `console`, `debugger`; mã dự án đã obfuscate | Đạt |
| XSS: tên Trung tâm có `<b>`, `<script>`, `&amp;`; đường dẫn và query độc hại; `Host` độc hại | Đạt (hiện nguyên chữ, không hộp thoại, không phản chiếu vào HTML) |
| Liên kết `javascript:`, `data:`, `//host` trong dữ liệu | Đạt (thành chữ thường) |
| Liên kết ngoài `rel="noopener noreferrer"`, `window.opener === null` | Đạt |
| Tên miền đã bỏ (`motcua`, `vbdh`, `dichvucong.tayninh.gov.vn`) | Không có trong chân trang và dữ liệu |
| Rate limiting: 330 yêu cầu/phút → 300 × 200 rồi 429 ProblemDetails, `Retry-After`; 400 yêu cầu HTML không bị 429 | Đạt |
| Gửi 501 ký tự, gửi dồn vào API trợ lý | **Chờ F06** (chưa có API trợ lý) |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | Không có |
| `HEAD /api/trung-tam` | 404 (lỗi L3, Nên sửa) |

## Bảng hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip) | **143,4 KiB** (gzip -9, 1 KiB = 1024 B; Vite báo 148,8 kB theo 1 kB = 1000 B; Brotli 125,0 KiB) | ≤ 200 KB |
| Lighthouse mobile `/` (3 lần) | **84** · FCP 2,1 s · LCP 2,3 s · TBT 10 ms · **CLS 0,24** · tổng tải 194 KiB | ≥ 85 — **TRƯỢT** |
| Lighthouse mobile `/thu-tuc` | 85 · CLS 0,24 | ≥ 85 (sát ngưỡng) |
| Lighthouse mobile `/linh-vuc` | **84** · CLS 0,263 | ≥ 85 — **TRƯỢT** |
| Lighthouse trợ năng / thực hành tốt / SEO (`/`, `/thu-tuc`) | 100 / 100 / 100 | — |
| CLS khi tải thật (Playwright, API thật) | **0,308 ở 375px** · 0,057 ở 1280px | ≤ 0,1 |
| CLS khi `/api/trung-tam` chậm 5 giây | **0,337 ở 375px** · 0,076 ở 1280px | ≤ 0,1 |
| 3G chậm (400 kbps, 400 ms): đầu trang so với chunk trang | đầu trang 4,7 s, chunk 5,1 s (đầu trang trước) | đầu trang trước chunk |
| API `/api/trung-tam` p95 (100 lần; Mẫu / PostgreSql nóng / PostgreSql không cache) | 17,9 / 38,5 / 56,3 ms | ≤ 300 ms |
| HTML `/` p95 (100 lần) | 13,5 ms | ≤ 300 ms |
| API trợ lý, API danh mục | Chờ F06, F04 | ≤ 300 ms |
| `/api/trung-tam` | 1,95 KB; 304 khi `If-None-Match` đúng; Brotli (0,68 KB) | — |

## Bảng lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| **Chặn (L1)** | Chân trang đổi chiều cao khi dữ liệu Trung tâm về (khối chờ `Skeleton` 3 dòng → 4 khối nội dung), làm bố cục dịch chuyển: CLS 0,24–0,34 ở khổ 375, kéo Lighthouse mobile của `/` và `/linh-vuc` xuống 84 (< 85). Lighthouse báo `layout-shifts` chỉ có `footer._chanTrang` (0,2397). Ở khổ 1280 CLS 0,06–0,08 (đạt). `/thu-tuc` 85 sát ngưỡng. Khi F02/F04 làm trang dài hơn, chân trang nằm dưới màn hình đầu nên điểm có thể đỡ hơn, nhưng lỗi vẫn là CLS của chân trang (F08 BR-11, AC-13, TL-03: "không nhảy bố cục") | `npm run build`; API Production nguồn Mẫu (`DuLieu__Nguon=Mau`, http); `node lighthouse http://localhost:5299/` (mặc định mobile) → performance 84, CLS 0,24 (lặp 3 lần đều 84). Hoặc `npx playwright test -c e2e/ban-build.config.ts khung-trang.spec.ts -g "TL-03"` → CLS 0,337 / 0,308 ở 375. Gợi ý: giữ `min-height` cho `<footer>` khi chờ bằng chiều cao nội dung điển hình (hoặc dựng khối chờ có cùng số khối/chiều cao như khi có dữ liệu) | ui-core-dev (`src/FrontEnd/src/app/layout/AppFooter.tsx`, `AppFooter.module.css`) |
| Nên sửa (L3) | `HEAD /api/trung-tam` trả 404 thay vì 200 | `curl -I http://localhost:5299/api/trung-tam` | backend-dev (`Features/ThongTinTrungTam/ThongTinTrungTamController.cs`) |
| Nhẹ (L4) | Trang 404: máy chủ cố ý không chèn `DC.identifier`/`og:url` (không phản chiếu đường dẫn lạ), nhưng FE (`DacTaTrang.tsx`) vẫn đặt hai thẻ này khi đi tới 404 bằng điều hướng → (H) và (D) lệch ở trang 404, trái plan §3.3 "cùng một tập thẻ" | Mở `/` rồi gõ `/abc-xyz` bằng điều hướng trong ứng dụng: `<head>` có `DC.identifier=/abc-xyz`; `curl /abc-xyz` không có | ui-core-dev (`app/layout/DacTaTrang.tsx`: bỏ hai thẻ ở trang 404) hoặc planner làm rõ plan §3.3 |
| Góp ý (L8) | `appsettings.json` Production không có `AllowedHosts` → không dựng `DC.identifier`/`og:url` ở mọi trang; nhớ khai khi triển khai, nếu không AC-18 thiếu yếu tố định danh | `curl http://localhost:5299/thu-tuc | grep DC.identifier` → rỗng | điều phối triển khai (hướng dẫn triển khai) |
| Góp ý | Logo (SVG < 4 KB) bị Vite nhúng thành data URI nên không có tên tệp băm trong HTML; AC-21 "tên tệp trong HTML có hash đổi" không áp dụng được theo nghĩa đen. CSP `img-src data:` cho phép nên không vi phạm | `document.querySelector('header img').src` | ui-core-dev nếu muốn có tệp ngoài (`build.assetsInlineLimit`), hoặc ba-analyst sửa AC-21 |
| Góp ý | Lighthouse: `trinh-duyet-cu-*.js` (script đồng bộ, không `defer`) tính là chặn hiển thị ~309 ms; CSS chặn ~159 ms | báo cáo Lighthouse `render-blocking-resources` | ui-core-dev (`index.html`; cân nhắc `defer`, cần giữ chạy được trên ES5) |

## Ca Chờ / Chưa chạy

- **Chờ F03:** MT-02, DT-10, DT-11, DT-14, DT-15, 404-07…10 (phần popup), TN-13.
- **Chờ F04:** 404-06…10, TL-04…07, TL-09…11.
- **Chờ F06:** MT-03; gửi 501 ký tự và gửi dồn vào API trợ lý (bảng bảo mật).
- **Cần thiết bị/người thật (TAY):** KH-03 (đen trắng), KH-10, CT-02 (trình gọi), TN-06, TN-10, TN-11, TN-12, DT-13 (Zalo, cần tên miền thật).
- **Chưa chạy dù chạy được (lượt sau):** KH-16 (cuộn khi chuyển trang, cần trang dài), CT-08, CT-09, NG-02, NG-03, IT-07, IT-08 (cần nhập lại bằng Import vào PostgreSQL), TD-09, HN-07, IT-04.
