ĐẠT

# F00 · Khung hệ thống — kết quả kiểm thử

> Hai lượt: **lượt 2** (xác nhận sửa L1–L7) nằm ngay dưới; **lượt 1** (T31) giữ nguyên ở phần "Lượt 1". Phạm vi vẫn là T31 và các AC phụ thuộc nguồn dữ liệu; T24 (AC-1…AC-23) chưa chạy nên `trang_thai` của `spec.md` **chưa đổi** (vẫn `dang-lam`).

## Lượt 2 — xác nhận sửa lỗi (2026-10-12 chiều)

- Ngày chạy: 2026-10-12 (chiều). Người chạy: tester. Chạy tuần tự, một trình duyệt tại một thời điểm, không chạy song song.
- Bản kiểm: sau khi ui-core-dev, backend-dev, db-dev sửa L1–L7. Bản build mới (`npm run build` 143,6 KiB gzip), `dotnet publish -c Release` ra thư mục tạm cho các kiểm tra Production (HTTP/HTTPS, cổng 5299/5443/5301…); Playwright chạy trên `dotnet run --launch-profile https` (Development, nguồn Mẫu, `RateLimiting__DanhMuc=100000`) như lượt 1.
- **Kết luận lượt 2:** các lỗi L3, L5, L6, L7 của F00 và L1 (Chặn, thuộc F08) **đã sửa, xác nhận đạt**. Không còn lỗi Chặn hay Nên sửa mở. Còn 1 ghi nhận triển khai (L8) và 1 góp ý nhỏ (bên dưới).

### Kết quả `dotnet test` lượt 2

| Lượt | Tổng | Đạt | Bỏ qua | Đỏ |
|---|---|---|---|---|
| Có `ConnectionStrings__DichVuCongTest` (PostgreSQL local) | 581 | 581 | 0 | 0 |
| Không có biến (máy không có DB) | 581 | 533 | 48 | 0 |

Tổng tăng 572 → 581 (9 ca mới của backend-dev/db-dev cho L3, L5). `dotnet build` 0 cảnh báo, 0 lỗi. `npm run lint` sạch; `npm test` 46 file, 365/365; `npm run build` đạt.

### Xác nhận từng lỗi

| Lỗi | Kiểm tra | Kết quả lượt 2 |
|---|---|---|
| L3 `HEAD /api/trung-tam` | `curl -I` (HTTP và HTTPS Production): **200**, có `ETag`, `Cache-Control: no-cache`, đủ CSP/nosniff/Referrer-Policy/Permissions-Policy (HTTPS thêm HSTS), không `Server`, không thân. `HEAD` kèm `If-None-Match` đúng → **304**. `GET` 200 (1.950 B) và 304; `POST` 405. Ca tự động `F08-BM-02b (L3)` đạt | **Đạt** |
| L5 DB không tới được | Bản publish Production, `DuLieu__Nguon=PostgreSql`: chuỗi trỏ `localhost:5439` (đóng) → `/api/trung-tam` **500 `loi-he-thong` sau 4,8–5,0 s** (4 lần, hai tiến trình mới; một lần đầu 7,5 s ở tiến trình đầu tiên, không lặp lại); `127.0.0.1:5439` → 2,1–2,7 s; **IP 192.0.2.1 không trả lời → 5,0–5,4 s** (đúng `Timeout=5` mặc định). `/health/live` **200** (≤ 0,02 s); `/health/ready` 503 sau 1,1 s; `/` HTML 200 (1,1 s). Mật khẩu thử `SECRETPW123` không xuất hiện trong log hay response (log chỉ có tên máy `tcp://localhost:5439` và tên DB trong thông điệp lỗi của EF/Npgsql) | **Đạt** (≤ ~6 s) |
| L6 publish không `.xml`/`.pdb` | `dotnet publish -c Release`: 0 tệp `.xml`, `.pdb`, `.map` (cả `wwwroot`). Có `appsettings.Development.json` (chỉ `AllowedHosts`; Production không đọc) | **Đạt** |
| L7 `dotnet ef … -- --DuLieu:Nguon=PostgreSql` | `migrations has-pending-model-changes` → "No changes have been made to the model since the last migration."; `migrations list` → `KhoiTao`, `NhapDuLieu`; `database update` → "Done." (DB dev đã ở bản mới nhất, không đổi gì). `CLAUDE.md` mục Lệnh và `tasks.md` T29 đã ghi tham số. Không có tham số → vẫn báo lỗi cấu hình (chủ ý) | **Đạt** |
| L1 (Chặn, thuộc F08) | Lighthouse mobile bản publish: `/` **95–96**, `/linh-vuc` **97**, `/thu-tuc` **97**; CLS **0,02**. Chi tiết ở `F08/result/test.md` | **Đạt** |
| L4 (thuộc F08) | Server và FE đều không có `DC.identifier`/`og:url` ở trang 404. Chi tiết ở `F08/result/test.md` | **Đạt** |

### Bảo mật lượt 2

| Kiểm tra | Kết quả |
|---|---|
| Header trên HTML, API (GET/HEAD), tài nguyên tĩnh, 404 (HTTPS Production) | Đạt: CSP nguyên văn `CLAUDE.md`, HSTS (`max-age=31536000; includeSubDomains`), nosniff, Referrer-Policy, Permissions-Policy; HTTP → 307 HTTPS |
| Header `Server`, `X-Powered-By` | Không có |
| Bản build/publish: `.map`, `.pdb`, `sourceMappingURL`, `console`/`debugger` | Không có |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | Không có gói dễ tổn thương ở cả 5 project |
| Chuỗi kết nối/mật khẩu trong log và response khi DB hỏng | Không có |
| `Host: evil.example` ở trang 404 | Không phản chiếu |

### Hiệu năng lượt 2

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip -9, tổng mọi `.js` mở `/`) | **143,6 KiB** (lượt 1: 143,4) | ≤ 200 KB |
| `/api/trung-tam`, 100 lần gọi tuần tự (Development, nguồn Mẫu, `curl` qua HTTPS) | p50 10,0 ms · **p95 34,4 ms** · max 55,4 ms | p95 ≤ 300 ms |
| Lighthouse mobile (publish, HTTP, 3 lần mỗi trang) | `/` **95–96** · `/linh-vuc` **97** · `/thu-tuc` **97** · CLS 0,02 · LCP 2,1–2,5 s · TBT 11–83 ms | ≥ 85 |
| API trợ lý, API danh mục | Chờ F06, F04 | ≤ 300 ms |

### Lỗi còn lại sau lượt 2

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Ghi nhận (L8, triển khai) | Production không có `AllowedHosts` thì máy chủ không dựng `DC.identifier`/`og:url` ở mọi trang. Khai `AllowedHosts=localhost` thì có đủ ở `/`, `/thu-tuc`, `/linh-vuc` và vẫn không có ở 404 | Chạy publish Production, `curl /thu-tuc` | điều phối triển khai (hướng dẫn triển khai) |
| Góp ý | `dotnet ef` cảnh báo "tools 10.0.11 cũ hơn runtime 10.0.12" | `dotnet ef … ` | người dùng (`dotnet tool update dotnet-ef`) |

---


# Lượt 1 — F00 · Khung hệ thống — kết quả kiểm thử (phạm vi T31: nguồn dữ liệu Mẫu / PostgreSQL)

- Ngày chạy: 2026-10-12. Người chạy: tester.
- **Phạm vi lượt này:** chỉ T31 (plan §9.10) và các AC phụ thuộc nguồn dữ liệu (AC-7, AC-14, AC-24, AC-25, AC-26), cộng kiểm bảo mật/hiệu năng chung. **Chưa chạy** T24 (toàn bộ AC-1…AC-23 theo `testcases.md`, vì T23 chưa viết); nên `trang_thai` của `spec.md` **chưa đổi**.
- Kết luận phạm vi T31: **22/22 ca đạt**, 0 lỗi Chặn. Có 4 lỗi mức Nhẹ/Nên sửa và 2 ghi nhận (bảng lỗi cuối file).
- Môi trường: Windows, PostgreSQL 18 local (`localhost:5432`), .NET 10.0.400, Docker không chạy (không dùng Testcontainers). DB test tên ngẫu nhiên `dichvucong_thu_<12 ký tự>`, tạo bằng biến `ConnectionStrings__DichVuCongTest` (trỏ `Database=postgres`), chạy migration rồi `DROP DATABASE … WITH (FORCE)`; sau các lượt chạy không còn DB thừa.
- Mã thêm (chỉ ở phần tester): `src/BackEnd/DichVuCong.Tests/Integration/{DbThuNghiem.cs, DuLieu/, ThongTinTrungTam/, Chatbot/}`.

## Kết quả `dotnet test`

| Lượt | Tổng | Đạt | Bỏ qua | Đỏ |
|---|---|---|---|---|
| Trước khi thêm Integration | 523 | 523 | 0 | 0 |
| Có `ConnectionStrings__DichVuCongTest` | 572 | 572 | 0 | 0 |
| Không có biến (máy không có DB) | 572 | 524 | 48 | 0 |

`dotnet build` 0 cảnh báo, 0 lỗi (cảnh báo = lỗi vẫn bật cho test).

## Bảng ca

| Case | AC | Kết quả | Ghi chú |
|---|---|---|---|
| F00-ND-01 | §9.4 R7 | Đạt | Lớp con PostgreSQL của `ThongTinTrungTamServiceContract`: 8 ca hợp đồng (chưa có Trung tâm, đầy đủ, liên kết/ô dịch vụ theo `thu_tu`, giờ làm việc `HH:mm`, ngày cập nhật, đặc tả, tối thiểu, gọi lại nhiều lần) đạt như nguồn Mẫu |
| F00-ND-02 | §9.3 | Đạt | `ngayCapNhatThuTuc = null` khi không có dòng `lan_nhap` nào, và khi chỉ có dòng `trung-tam`; `LayAsync` và `LayDacTaAsync` đều null, không lỗi. 20:00 UTC → ngày kế tiếp giờ Việt Nam đúng trên DB thật |
| F00-ND-03 | §9.3 | Đạt | 10 ca 5 hàm `TruyVan` nhánh EF. `Provider is IAsyncQueryProvider` đúng với PostgreSql, sai với Mẫu. Kết quả hai nhánh giống nhau; tập rỗng nullable → null, không nullable → `InvalidOperationException`; token huỷ → `OperationCanceledException`; chuỗi `x'); DROP TABLE…`, `100%`, `_`, `<script>`, 5.000 ký tự trong biểu thức `Contains` không gây lỗi SQL |
| F00-ND-04 | §9.10 | Đạt | Nạp 408 thủ tục, 75 lĩnh vực, 16 thường gặp, 11 câu hỏi mẫu… từ file nhúng vào DB; đọc qua hai nguồn: **14/14 tập cho JSON giống nhau** (kể cả `ThuTuc` có cột JSON `trinh_tu`, `cach_thuc`, `thanh_phan_ho_so`, `can_cu`; `LanNhap` so theo `UtcTicks`). Hai tập rỗng (phân công, nhân sự) cũng khớp. `CauHoiMau` và `CauHoiMauCachHoi` phải `Select` bỏ navigation mới so được (đúng quy tắc R2) |
| F00-ND-05 | §9.6 | Đạt | Một dòng, `so_lan_gap` = 2, nội dung giữ bản đầu "Đăng ký khai sinh?", `lan_gap_cuoi` = giờ đồng hồ giả |
| F00-ND-06 | §9.6 | Đạt | 40 lượt ghi song song bằng 40 `DbContext` → `so_lan_gap` = 40 (không mất lần gặp) |
| F00-ND-07 | §9.6 | Đạt | Xoá dòng trước mốc, giữ dòng đúng mốc và sau mốc; trả đúng số dòng; bảng rỗng trả 0 |
| F00-ND-08 | §9.6 | Đạt | 501 ký tự → `ArgumentOutOfRangeException`, không ghi dòng; 500 ghi được; rỗng và khoảng trắng → `ArgumentException` |
| F00-ND-09 | CLAUDE.md | Đạt | Câu có `'`, `<script>`, `%`, tiếng Nhật, emoji lưu nguyên văn; bảng còn nguyên; gộp đúng 2 lần gặp |
| F00-ND-10 | §9.10 | Đạt | Không có biến môi trường: 48 ca bỏ qua, 0 đỏ, kèm lý do |
| F00-ND-11 | AC-24 | Đạt | Bản publish Production, `DuLieu__Nguon=Mau`, không DB, không chuỗi kết nối: khởi động → sẵn sàng sau **738 ms** (gồm lúc đợi), bộ nhớ ~87 MB; `/health/live` 200, `/health/ready` 200 (≤ 0,1 s); `/api/trung-tam` 200 (6 ô dịch vụ trong đó 2 `url` null, 3 liên kết, 5 dòng giờ, email `cangiuoc@tayninh.gov.vn`, ngày `2026-10-12`); log nêu "Nguồn dữ liệu: Mau (…phiên bản định dạng 1, thời điểm …, 408 thủ tục)". Thêm chuỗi kết nối trỏ cổng 5439 (đóng) → vẫn 200, log không có chuỗi kết nối. Phần giao diện (trang chủ, danh mục, lĩnh vực, trợ lý, chân trang 5 mục) xem F08: chân trang đủ 5 mục. Danh mục, lĩnh vực, trợ lý: **Chờ F04, F05, F06** |
| F00-ND-12 | AC-25 | Đạt | DB tạm `dichvucong_ac25` (migrate + chèn "Trung tâm thử A"): `Mau` → tiêu đề "Trang chủ – Trung tâm Phục vụ hành chính công xã Cần Giuộc"; `PostgreSql` → "Trang chủ – Trung tâm thử A"; `Mau` lại → dữ liệu mẫu. Chỉ đổi biến môi trường |
| F00-ND-13 | AC-26 | Đạt | Không khai / `Postgres` / `mau` / rỗng → ngoại lệ lúc dựng "Cấu hình DuLieu:Nguon phải khai và nhận đúng một trong hai giá trị: Mau, PostgreSql (phân biệt hoa thường)", mã thoát khác 0, không có cổng nào mở; `PostgreSql` thiếu chuỗi → "Thiếu cấu hình ConnectionStrings:DichVuCong."; `Mau` chạy bằng dữ liệu mẫu; `PostgreSql` + chuỗi thật chạy bằng dữ liệu nhập. `appsettings.json` bản publish không có mục `DuLieu` |
| F00-ND-14 | AC-26 | Đạt | HTML của `/` ở nguồn Mẫu: 0 lần "chạy thử"/"dữ liệu mẫu"; API không có cờ nguồn; giao diện giống chạy thật (nhãn "(dữ liệu mẫu)" chỉ nằm trong giá trị người chịu trách nhiệm của API) |
| F00-ND-15 | AC-7 | Đạt | `PostgreSql` thiếu chuỗi kết nối → dừng, nêu `ConnectionStrings:DichVuCong`. `RateLimiting:DanhMuc=0` → "Cấu hình mục RateLimiting không hợp lệ. The field DanhMuc must be between 1 and 100000."; `TroLy=0` tương tự. Không in giá trị nào |
| F00-ND-16 | AC-14 | Đạt | Chuỗi trỏ cổng đóng: `/health/ready` 503 sau 1,0–1,1 s; trỏ IP 192.0.2.1 (không trả lời): 503 sau 1,0–1,4 s; sai mật khẩu: 503 (0,1–1,5 s). Thân chỉ "Unhealthy". `/health/live` luôn 200 (≤ 0,06 s). Log không có mật khẩu, `Host=`, `Username=`. **Không** tắt PostgreSQL dùng chung (theo yêu cầu). Chưa thử "bật lại DB → ready tốt" bằng cách dừng/bật dịch vụ; đã thấy `ready` 200 khi chuỗi đúng |
| F00-ND-17 | §9.2 | Đạt (kèm ghi nhận) | `--launch-profile https-postgresql` (Development, user-secrets): log "Nguồn dữ liệu: PostgreSql", đọc DB dev, `/health/ready` 200. Profile `https`: Mẫu. `dotnet ef database update … -- --DuLieu:Nguon=PostgreSql` chạy. **`dotnet ef migrations has-pending-model-changes` không có tham số khai nguồn bị lỗi** ("Cấu hình DuLieu:Nguon phải khai…") — trái dòng "không thêm tham số" của T29 nhưng đúng với plan §9.2 và Cần hỏi 6 (a). Xem lỗi L7 |
| F00-ND-18 | T31 | Đạt | `DuLieuMau data-mau … --nguoi-chiu-trach-nhiem "(dữ liệu mẫu)"` → 4 Excel; `nhap tat-ca` vào DB tạm: 408 thủ tục, 75 lĩnh vực, 16 thường gặp, 11 câu hỏi mẫu, 6 chủ đề, 45 từ đồng nghĩa, 12 viết tắt. `GET /api/trung-tam` nguồn PostgreSql và nguồn Mẫu **giống nhau trừ `ETag`** (và `ngayCapNhatThuTuc` chỉ bằng nhau vì cùng ngày 2026-10-12; `ETag` khác: PostgreSql theo giờ nhập, Mẫu theo `thoiDiem` của file) |
| F00-ND-19 | F08 AC-22 | Đạt | Nguồn Mẫu: `ngayCapNhatThuTuc` = `2026-10-12` (ngày Việt Nam của `thoiDiem` 07:56 UTC); `DC.date` cùng ngày; chân trang "Dữ liệu thủ tục cập nhật ngày 12/10/2026" (Playwright F08-NG-01 nguồn Mẫu) |
| F00-ND-20 | Bảo mật | Đạt | Xem bảng bảo mật |
| F00-ND-21 | Bảo mật | Đạt | Bản publish không `.pdb`, không `.map`; không `ConnectionStrings` trong `appsettings.json`; `grep Password=\|Host=localhost\|Username=postgres` trong `wwwroot` và bản publish: 0. Có `DichVuCong.Api.xml`, `DichVuCong.Data.xml` (xem L6) |
| F00-ND-22 | AC-8 (chặn tần suất) | Đạt | 330 yêu cầu `/api/trung-tam` trong một phút: đúng 300 × 200 rồi 30 × 429 `{"status":429,"maTraCuu":"…","code":"qua-nhieu-yeu-cau"}`, `Retry-After: 60`, không stack trace. Câu hiển thị phía FE: xem F08-BM-12 |

## Bảng bảo mật

| Kiểm tra | Kết quả |
|---|---|
| Header trên HTML, 404, API (200, 404, 429), tài nguyên tĩnh, `/health/live` qua HTTPS (bản publish Production) | Đạt: CSP đúng nguyên văn `CLAUDE.md`; `Strict-Transport-Security: max-age=31536000; includeSubDomains`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy: microphone=(), camera=(), geolocation=()` |
| Header `Server`, `X-Powered-By` | Không có |
| HSTS ở Development | Không có (cố ý: chỉ ngoài Development và chỉ qua HTTPS, `SecurityHeadersMiddleware`). Kiểm HSTS phải dùng Production HTTPS |
| HTTP → HTTPS | 307 tới `https://localhost:5443/` (khi khai `ASPNETCORE_HTTPS_PORT`); response chuyển hướng vẫn có CSP |
| `HEAD` | `HEAD /`, `/health/live`, `/assets/*` 200; **`HEAD /api/trung-tam` 404** (lỗi L3) |
| Cấu hình sai không lộ giá trị | Đạt: thông báo chỉ nêu tên mục; log khi DB hỏng không có mật khẩu/chuỗi kết nối |
| Phương thức sai | 405 `phuong-thuc-khong-hop-le`, ProblemDetails, không stack trace (POST/PUT/DELETE) |
| Host lạ | `Host: evil.example` → 200, **không** phản chiếu vào HTML (không `DC.identifier`/`og:url`); `Host` chứa `"><script>` → 400 từ Kestrel |
| Lỗi 500 | `{"title":"Internal Server Error","status":500,"maTraCuu":"…","code":"loi-he-thong"}`, không `traceId`, không stack |
| `.map`, `.pdb` trong bản build và bản publish | Không có; không `sourceMappingURL`; `console`/`debugger` 0 trong `wwwroot/assets`; mã dự án đã obfuscate (`_0x…`), `vendor` nguyên |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `dotnet list package --vulnerable --include-transitive` | Không có gói dễ tổn thương ở cả 5 project |
| Chuỗi kết nối trong repo/bản build/log | Không có |

## Bảng hiệu năng

| Chỉ số | Đo được | Ngân sách |
|---|---|---|
| JS tải ban đầu (gzip, tổng mọi `.js` mở `/`) | **143,4 KB** (Brotli 125,0 KB) | ≤ 200 KB |
| API `/api/trung-tam`, nguồn Mẫu, 100 lần gọi tuần tự (đo bằng `curl`, gồm chi phí tạo tiến trình ~10 ms) | p50 3,4 ms · **p95 17,9 ms** · max 56 ms | p95 ≤ 300 ms |
| Như trên, nguồn PostgreSql, output cache nóng | p50 7,0 ms · **p95 38,5 ms** · max 119 ms | ≤ 300 ms |
| Như trên, PostgreSql, mỗi lần một query khác (tránh cache) | p50 2,5 ms · **p95 56,3 ms** · max 146 ms | ≤ 300 ms |
| HTML `/` (100 lần) | p95 13,5 ms | ≤ 300 ms |
| API trợ lý | **Chờ F06** (chưa có) | ≤ 300 ms |
| API danh mục thủ tục | **Chờ F04** (chưa có) | ≤ 300 ms |
| Lighthouse mobile (bản publish, `http://localhost`, 3 lần lặp) | `/` **84**, `/linh-vuc` **84**, `/thu-tuc` 85 (CLS 0,24–0,26) — xem `F08/result/test.md` lỗi Chặn | ≥ 85 |
| Khởi động nguồn Mẫu tới sẵn sàng | 738 ms (bộ nhớ ~87 MB) | ≤ 1 s (T27) |
| `DichVuCong.Data.dll` | — (không đo) | — |

## Bảng lỗi

| Mức | Mô tả | Cách tái hiện | Agent sửa |
|---|---|---|---|
| Chặn (thuộc F08) | Lighthouse mobile `/` và `/linh-vuc` = 84 < 85 do CLS 0,24–0,26 từ chân trang. Chi tiết ở `F08/result/test.md` (L1) | Xem F08 | ui-core-dev |
| Nên sửa (L3) | `HEAD /api/trung-tam` trả 404 thay vì 200. Controller chỉ `[HttpGet]`; cache và 304 lại xử lý cả HEAD; công cụ kiểm header (`curl -I`) và giám sát thấy 404 | `curl -I http://localhost:5299/api/trung-tam` | backend-dev (`Features/ThongTinTrungTam/ThongTinTrungTamController.cs`) |
| Nên sửa (L5) | Khi PostgreSQL không tới được, `/api/trung-tam` chỉ trả 500 sau 4,2 s (cổng đóng) hoặc 15,4 s (IP không trả lời): chưa có thời gian chờ kết nối/lệnh. Sắp tới F04/F06 sẽ giữ yêu cầu lâu khi DB treo. `/health/ready` đã có hạn 1 s | `DuLieu__Nguon=PostgreSql`, chuỗi kết nối `Host=192.0.2.1;…`, `curl -w "%{time_total}" /api/trung-tam` | db-dev (`AddDichVuCongData`: `Timeout`/`CommandTimeout` trong chuỗi kết nối hoặc `UseNpgsql`) |
| Nhẹ (L7, tài liệu) | `tasks.md` T29 ghi `dotnet ef migrations has-pending-model-changes` "chạy như cũ, không thêm tham số", nhưng thực tế cần `-- --DuLieu:Nguon=PostgreSql`. `CLAUDE.md` mục Lệnh chưa có tham số này | `dotnet ef migrations has-pending-model-changes --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api` → lỗi cấu hình | planner (sửa T29) và người dùng/điều phối (cập nhật `CLAUDE.md`, plan §9.12 đã có) |
| Nhẹ (L6) | Bản publish chứa `DichVuCong.Api.xml`, `DichVuCong.Data.xml` (tài liệu XML tiếng Việt về nội bộ). Không phục vụ ra web, nhưng không cần cho triển khai | `dotnet publish -c Release -o <thư mục>` rồi `ls` | backend-dev / db-dev (tắt `GenerateDocumentationFile` ở Release hoặc loại khỏi publish) |
| Ghi nhận (L8, triển khai) | `appsettings.json` bản Production không có `AllowedHosts` nên máy chủ không dựng `DC.identifier` và `og:url` ở mọi trang (chủ đích, `TenMienCongKhai`). Nếu quên khai `AllowedHosts` đích danh khi triển khai thì F08 AC-18 ("đủ 6 yếu tố đặc tả") thiếu yếu tố định danh | Chạy bản publish Production → `curl /thu-tuc` không có `DC.identifier` | điều phối triển khai (ghi vào hướng dẫn triển khai/giai đoạn 8) |

## Chưa chạy / chờ

- T24: toàn bộ AC-1…AC-23 theo `testcases.md` (T23 chưa viết); AC-1, AC-17, AC-18, AC-19 cần bản triển khai; AC-15, AC-23 cần thiết bị và trình duyệt thật.
- AC-14 phần "dừng hẳn dịch vụ PostgreSQL rồi bật lại": không làm vì PostgreSQL local đang dùng chung.
- Danh mục, trợ lý, QR của AC-24: chờ F04, F05, F06.
- `trang_thai` của `spec.md` giữ nguyên (chưa `xong`).
