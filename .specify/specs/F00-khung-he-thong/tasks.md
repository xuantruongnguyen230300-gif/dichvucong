# F00 · Khung hệ thống — tasks

`[P]` = chạy song song được với task liền trước.

Bản 2026-10-12: thêm T15–T24 theo `spec.md` và `plan.md` (bảng đầu plan). T01–T12, T14 đã xong, không phải làm lại.

Điều kiện bắt đầu:

- Làm ngay: T15 (db-dev), T16, T17 (backend-dev), T19, T20 (ui-core-dev).
- T18 chờ F01 T03 (bảng `lan_nhap`).
- T21: phần phát hiện trình duyệt cũ làm ngay; phần số điện thoại chờ `plan.md` §8 câu 1.

Bản 2026-10-12 (lần 2): thêm T25–T31 — nguồn dữ liệu Mẫu, demo chạy không cần DB (`plan.md` §9, kế hoạch 6.0). Thứ tự:

1. T25 → T26 (db-dev).
2. Sau T26, chạy song song: T27 (db-dev), T28 (chatbot-dev), F08 T11 (backend-dev).
3. T29 (backend-dev) sau T27, T28, F08 T11. T29 gồm luôn F01 T19.
4. T30 (code-reviewer) sau T29; T31 (tester) song song với T30.

- Cần hỏi ở `plan.md` §9.16: câu 1 (không mặc định ở Production) và câu 5 (không dấu hiệu bản chạy thử) **đã chốt 2026-10-12**; câu 2 → T27, câu 6 → T29 làm theo đề xuất nếu người dùng không phản đối. Người dùng chọn khác thì planner sửa plan trước.
- Mỗi task: `dotnet build` sạch, `dotnet test --solution src/BackEnd/DichVuCong.sln` xanh (333 test hiện có + test mới).
- Ký tự vô hình (U+200B–U+200F, U+FEFF) trong mã hay test: không gõ chuỗi mã thoát qua công cụ Edit/Bash (công cụ đổi thành ký tự thật). Ghép escape trong một file script, hoặc dùng `char.ConvertFromUtf32(0x200E)` / `(char)0x200E`. Sửa xong thì kiểm: `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <file>` không ra dòng nào.

- [x] T01 [điều phối] `global.json`, `.editorconfig`, `.gitattributes`, `.nvmrc`, `.gitignore` — xong
- [x] T02 [điều phối] Solution + 4 project + `Directory.Build.props` + `Directory.Packages.props`; build sạch — xong
- [x] T03 [db-dev] `AppDbContext` hoàn chỉnh + `AddDichVuCongData` (pool, snake_case) + `Text/TiengViet.cs` + `Tests/Data/TiengVietTests.cs` theo bộ mẫu §4 — xong khi: test xanh
- [x] T04 [db-dev] Migration `KhoiTao` (unaccent, pg_trgm); user-secrets `dichvucong`; `dotnet ef database update` tạo DB `dichvucong` — xong khi: trong DB thấy 2 extension
- [x] T05 [db-dev] Import: Generic Host + cấu hình + DI; in hướng dẫn lệnh — xong khi: chạy không tham số in hướng dẫn, mã thoát 0
- [x] T06 [backend-dev] [P] `Program.cs` + `Common/` (Hosting, Security, Errors, RateLimiting, Caching); health live/ready; static + fallback; OpenAPI ở dev; `appsettings.json`, `launchSettings.json` — xong khi: build sạch; `curl -k -I https://localhost:7157/health/live` → 200 + đủ header, không có header `Server`; `/health/ready` → 200 khi DB chạy
- [x] T07 [backend-dev] `Tests/Api/`: health + header + ProblemDetails — xong khi: `dotnet test` xanh
- [x] T08 [ui-core-dev] [P] Khởi tạo Vite + React 19 + TS strict, ESLint, Vitest; cấu trúc thư mục theo plan §2
- [x] T09 [ui-core-dev] `vite.config.ts`: proxy, `outDir` wwwroot, không source map, bỏ console, chunk vendor, obfuscate — xong khi: `npm run build` ra wwwroot, không có file `.map`; báo kích thước từng chunk (gzip)
- [x] T10 [ui-core-dev] `app/`, `core/api/http.ts`, `core/hooks/`, `core/utils/tiengViet.ts` + test theo bộ mẫu §4, `features/trang-chu` tạm — xong khi: `npm test` và `npm run lint` sạch
- [x] T11 [ui-core-dev] Playwright 2 khổ + smoke test — xong khi: chạy được với BE + Vite dev đang chạy
- [x] T12 [code-reviewer] Review F00 → `result/review.md` — ĐẠT; 5 lỗi Nên sửa đã sửa
- [x] T13 [ui-core-dev] `tokens.css` (kích thước theo Vàm Cỏ, font hệ thống — không tải font web), component lõi, trang xem trước design system — design system đã duyệt 2026-10-12; làm theo plan C01 khi có
- [x] T14 [ui-core-dev] [backend-dev] (sau khi chốt thư viện) i18n: hạ tầng `core/i18n`, file ngôn ngữ `vi`; chuyển chuỗi đang viết cứng sang khoá; BE trả mã lỗi trong ProblemDetails
  - T14 phần BE (backend-dev): xong — `Common/Errors/MaLoi.cs` (danh mục mã), `ProblemDetailsCustomizer` (thêm `code`, `title` = cụm chuẩn HTTP), `RequestSizeLimitMiddleware` (413); 42 test xanh. Phần FE (ui-core-dev): xong.
- [x] T15 [db-dev] `TiengViet.BoKyTuVoHinh` (plan §1, §4; F01 BR-18, C01 BR-4):
  - Hàm public, bỏ U+200B–U+200F và U+FEFF; `ChuanHoaTimKiem` gọi lại hàm này.
  - Viết ký tự bằng escape `\u200E`, không dán ký tự thật vào mã.
  - Test thêm 2 dòng mới của bộ mẫu §4 và ví dụ `BoKyTuVoHinh`.
  - file: `src/BackEnd/DichVuCong.Data/Text/TiengViet.cs`, `src/BackEnd/DichVuCong.Tests/Data/TiengVietTests.cs`
  - xong khi: test xanh cho toàn bộ bộ mẫu §4; `dotnet build` sạch.
- [x] T16 [backend-dev] [P] Trợ lý 60 câu/phút (BR-8, câu hỏi mở 16) — file: `src/BackEnd/DichVuCong.Api/appsettings.json` (`RateLimiting:TroLy` = 60) — xong khi: giá trị là 60; `dotnet test` xanh.
- [x] T17 [backend-dev] Mã tra cứu (BR-7, plan §1 "Mã tra cứu", §2b):
  - `Common/Errors/MaTraCuu.cs`: 8 ký tự từ `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, `RandomNumberGenerator`.
  - Mọi ProblemDetails (kể cả 429, 413, 404 của `/api`) có `maTraCuu`; bỏ `traceId`.
  - Log: 5xx mức Error kèm mã và exception; 4xx mức Information kèm mã, mã HTTP, phương thức, đường dẫn không có query string.
  - file: `src/BackEnd/DichVuCong.Api/Common/Errors/`, `src/BackEnd/DichVuCong.Tests/Api/`
  - xong khi:
    - Test: mã đúng 8 ký tự, chỉ gồm ký tự cho phép; 3 lỗi 500 liên tiếp → 3 mã khác nhau; log ghi lại (bắt bằng logger giả) có đúng mã của response; response không có `traceId`, không có stack trace ở môi trường Production.
    - Test 4xx: log không chứa query string.
- [x] T18 [backend-dev] Cache dữ liệu theo lần nhập (BR-10, AC-11; plan §1 "Cache dữ liệu theo lần nhập") — chờ F01 T03:
  - `Common/Caching/PhienBanDuLieu.cs` (`IPhienBanDuLieu`): `max(lan_nhap.thoi_diem)` → tick UTC, 0 khi chưa nhập.
  - Policy `danh-muc` thành `IOutputCachePolicy` riêng: khoá cache gồm phiên bản; `ETag` = phiên bản + mã bản build; `Cache-Control: no-cache`; `If-None-Match` khớp → 304; chỉ lưu response 200 của GET/HEAD.
  - file: `src/BackEnd/DichVuCong.Api/Common/Caching/`, `src/BackEnd/DichVuCong.Tests/Api/`
  - xong khi:
    - Test với `IPhienBanDuLieu` giả và endpoint chỉ có trong test: gọi 2 lần cùng phiên bản → endpoint chạy 1 lần, response có `ETag` và `Cache-Control: no-cache`; gửi `If-None-Match` → 304; đổi phiên bản → endpoint chạy lại, `ETag` mới.
    - Chạy tay với DB dev: sửa `lan_nhap.thoi_diem` → yêu cầu kế tiếp không lấy bản cache cũ.
- [x] T19 [ui-core-dev] [P] `chuanHoaTimKiem` bỏ thêm U+200E, U+200F (cùng tập với T15) — file: `src/FrontEnd/src/core/utils/tiengViet.ts`, `tiengViet.test.ts` — xong khi: test theo toàn bộ bộ mẫu §4 xanh; `npm run lint` sạch.
- [x] T20 [ui-core-dev] `ApiError.maTraCuu` (BR-7): `ProblemDetails.maTraCuu?`, `ApiError.maTraCuu: string | null`; mất kết nối thì không có mã — file: `src/FrontEnd/src/core/api/http.ts`, `http.test.ts` — xong khi: test đọc đúng mã từ ProblemDetails; lỗi mất kết nối có `maTraCuu` null.
- [x] T21 [ui-core-dev] Trình duyệt quá cũ (BR-14, AC-23; plan §2, §5):
  - `build.target` ghi rõ 5 mục ở plan §2.
  - `index.html`: đoạn `#trinh-duyet-cu` có `hidden`, câu chèn lúc build từ `common:trinh-duyet-cu.huong-dan`.
  - Script kiểm tra ES5, phát vào `/assets/` có hash, không obfuscate (plan §8 câu 2).
  - `main.tsx` dừng lặng lẽ khi không có `#root`.
  - Số điện thoại: làm sau khi người dùng trả lời plan §8 câu 1.
  - file: `src/FrontEnd/{index.html, vite.config.ts, build/, src/main.tsx, src/core/i18n/vi/common.json, e2e/}`, `playwright.config.ts`
  - xong khi:
    - `npm run build`: `index.html` có dòng hướng dẫn (đang ẩn), không có `script`/`style` inline; script kiểm tra nằm trong `/assets/` có hash.
    - Playwright trên Chromium, Firefox, WebKit: không thấy dòng hướng dẫn, trang chạy. Làm hỏng tính năng được kiểm bằng `addInitScript` → thấy dòng hướng dẫn, không còn `#root`, không có lỗi trên màn hình.
    - Mở bản build qua API: không có vi phạm CSP.
    - JS tải ban đầu vẫn ≤ 200 KB gzip; báo kích thước script kiểm tra.
- [ ] T22 [code-reviewer] Review T15–T21 theo `CLAUDE.md`, `plan.md` → bổ sung `result/review.md` — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được agent sở hữu sửa.
- [ ] T23 [tester] [P] `testcases.md` cho F00 — AC-1…AC-23, ghi rõ AC nào kiểm được ngay, AC nào chờ chức năng khác hoặc chờ bản triển khai (plan §6) — file: `.specify/specs/F00-khung-he-thong/testcases.md` — xong khi: mỗi BR/AC có ít nhất một ca thử, có cách làm và kết quả mong đợi.
- [ ] T24 [tester] Chạy `testcases.md` → `.specify/specs/F00-khung-he-thong/result/test.md`:
  - Chạy ngay các AC không phụ thuộc chức năng khác. Các AC còn lại chạy khi điều kiện ở plan §6 có (vd. AC-11 sau F04, AC-22 sau F06, AC-1, AC-17, AC-18, AC-19 trên bản triển khai).
  - AC-14: thử cả tắt DB lẫn chặn mạng tới DB.
  - AC-7 (phần thiếu thông tin kết nối), AC-14: chạy với nguồn PostgreSql — profile `https-postgresql` hoặc bản publish (plan §9.2, §9.9; sửa 2026-10-12).
  - AC-15, AC-23: thử tay trên trình duyệt hoặc thiết bị thật (bản thấp nhất được hỗ trợ, bản mới nhất, IE11, Safari iOS 15, Zalo trên Android và iPhone).
  - xong khi: mọi ca có kết quả. Đạt hết → đổi `trang_thai` của `spec.md` sang `xong`.

### Nguồn dữ liệu Mẫu — kế hoạch 6.0 (thêm 2026-10-12, `plan.md` §9)

- [x] T25 [db-dev] Định dạng file dữ liệu mẫu, đọc và ghi (plan §9.5):
  - `Data/Mau/TepDuLieuMau.cs`: gốc file (`phienBan`, `thoiDiem`, `ghiChu`, `trungTam` và 11 danh sách; cách hỏi nằm trong từng câu hỏi mẫu, `lan_nhap` do bộ đọc tạo), hằng phiên bản định dạng = 1; `Doc(Stream)`, `Ghi(Stream)`; `Nhung` — đọc tài nguyên nhúng theo `LogicalName` cố định, nạp một lần mỗi tiến trình; chưa có tài nguyên (T27 thêm) → lỗi nêu rõ.
  - Một bộ tuỳ chọn JSON cho đọc và ghi: camelCase, thụt lề 2, `NewLine = "\n"`, chữ tiếng Việt để nguyên, enum theo tên; khi đọc thêm `UnmappedMemberHandling.Disallow`, `RespectNullableAnnotations`, `PreferredObjectCreationHandling = Populate`.
  - `[JsonIgnore]` trên `ThuTuc.LinhVuc`, `LinhVuc.ThuTucs`, `CauHoiMauCachHoi.CauHoiMau`.
  - Bộ đọc: kiểm phiên bản, khoá trùng, `ThuTuc.LinhVucMa` có trong lĩnh vực, không quá một `trungTam`; nối lại navigation; tạo 4 dòng `LanNhap` mang `thoiDiem`, `TenFile` = `du-lieu-mau.json`. Lỗi → `InvalidDataException` nêu lý do ngắn, không chép nội dung file.
  - file: `src/BackEnd/DichVuCong.Data/Mau/TepDuLieuMau.cs`, `src/BackEnd/DichVuCong.Data/Entities/{ThuTuc.cs, LinhVuc.cs, CauHoiMauCachHoi.cs}`, `src/BackEnd/DichVuCong.Tests/Data/Mau/`
  - xong khi:
    - Test khứ hồi: bộ dữ liệu nhỏ lấy từ `KiemTra*` của Import (workbook dựng trong bộ nhớ như `Tests/Data/Import/`) → ghi → đọc → ghi lại: giống từng byte. Bộ dữ liệu có đủ kiểu cột: danh sách JSON (trình tự, giấy tờ…), mảng chuỗi, giờ, enum, giá trị null.
    - Test từ chối, mỗi ca một thông báo nêu đúng lý do: phiên bản 2; thuộc tính lạ; mã thủ tục trùng; `linhVucMa` không có; null ở trường không cho null; JSON hỏng.
    - Test nối: `ThuTuc.LinhVuc`, `LinhVuc.ThuTucs` (theo `ThuTu`), `CauHoiMauCachHoi.CauHoiMau` đúng đối tượng; 4 dòng `LanNhap` mang `thoiDiem`.
    - File ghi ra: xuống dòng LF; "Hộ tịch" giữ nguyên chữ, không đổi thành mã thoát; enum là tên (`ToanTrinh`).
    - `dotnet ef migrations has-pending-model-changes` báo không có thay đổi. `Data` không thêm gói.

- [x] T26 [db-dev] Lớp nguồn dữ liệu (plan §9.3, §9.4):
  - `Data/DuLieu/`: `LoaiNguonDuLieu`, `INguonDuLieu` (14 tập, tên như `AppDbContext`), `NguonDuLieuPostgreSql` (`AsNoTracking`), `NguonDuLieuMau`, `TruyVan` (`DanhSachAsync`, `DauTienAsync`, `DemAsync`, `CoAsync`, `LonNhatAsync`).
  - `AddDichVuCongData(string)`: chữ ký giữ nguyên, thêm `INguonDuLieu` scoped. `AddDichVuCongDataMau()` (nạp `TepDuLieuMau.Nhung` ngay khi gọi; tới T27 mới có file nên trước đó ném lỗi thiếu tài nguyên) và bản nhận sẵn `TepDuLieuMau`.
  - file: `src/BackEnd/DichVuCong.Data/{DuLieu/, DataServiceCollectionExtensions.cs}`, `src/BackEnd/DichVuCong.Tests/Data/DuLieu/`
  - xong khi:
    - Test trên nguồn Mẫu: 5 hàm `TruyVan` đúng kết quả, kể cả tập rỗng (`DauTienAsync` → null; `LonNhatAsync` với kiểu nullable → null); gọi `ToListAsync` của EF trên nguồn Mẫu → `InvalidOperationException` (test ghi lại quy tắc R1).
    - Test DI: `AddDichVuCongData` → `INguonDuLieu` là `NguonDuLieuPostgreSql`, scoped; `AddDichVuCongDataMau(tep)` → `NguonDuLieuMau` singleton, không có `AppDbContext`.
    - Import chạy như cũ (test `Tests/Data/Import/` xanh). Nhánh EF của `TruyVan` được tester kiểm với PostgreSQL ở T31.

- [x] T27 [db-dev] Lệnh `xuat-json` của `DuLieuMau` và file dữ liệu mẫu (plan §9.5) — sau T26:
  - `DuLieuMau`: lệnh `xuat-json <thư-mục-nguồn> <file-ra> --nguoi-chiu-trach-nhiem "<nhãn>"`; lệnh xuất Excel cũ giữ nguyên.
  - Các bước: sinh 4 file Excel vào thư mục tạm → đọc, kiểm bằng `DocExcel` + `KiemTra*` (đổi `NhapDuLieu.DocTatCa` sang `internal`) → dựng `TepDuLieuMau` → ghi, đè file cũ → xoá thư mục tạm. Có lỗi → in ra stderr, mã 1, không ghi file.
  - Sinh `src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json` — file thuộc repo (commit khi người dùng bảo), nhãn người chịu trách nhiệm theo Cần hỏi 2 (đề xuất "(dữ liệu mẫu)"). Khai `EmbeddedResource` trong `DichVuCong.Data.csproj`, `LogicalName` khớp tên `TepDuLieuMau.Nhung` đọc.
  - file: `src/BackEnd/DichVuCong.DuLieuMau/`, `src/BackEnd/DichVuCong.Import/Lenh/NhapDuLieu.cs`, `src/BackEnd/DichVuCong.Data/{DichVuCong.Data.csproj, Mau/du-lieu-mau.json}`, `src/BackEnd/DichVuCong.Tests/Data/Mau/`
  - xong khi:
    - Lệnh ở plan §9.12 → mã 0, in số bản ghi. Thiếu `--nguoi-chiu-trach-nhiem` → mã 1, báo thiếu "Người chịu trách nhiệm" (đúng BR-8), không ghi file. Lệnh Excel cũ ra 4 file như trước.
    - Test file nhúng: 408 thủ tục (xã 266, tỉnh 408), 75 lĩnh vực; 16 thường gặp đúng mã và thứ tự ở `du-lieu.md`; phân công 0, nhân sự 0. Trung tâm: email `cangiuoc@tayninh.gov.vn`, mã đơn vị `H53.183`, người chịu trách nhiệm chứa "(dữ liệu mẫu)"; bản đồ, mạng xã hội, ghi chú ngày nghỉ trống. Mọi thủ tục có mã đơn vị đều là `H53.183`. Giờ làm việc 5 ngày, liên kết 3, ô dịch vụ 6 (2 ô không có link). Câu hỏi mẫu 11 (5 theo mục), chủ đề gợi ý 6, từ đồng nghĩa 45, viết tắt 12.
    - Test làm sạch: không chuỗi nào trong file, sau `ChuanHoaTimKiem`, chứa "vam co" hay "h53.186"; không còn U+200B–U+200F, U+FEFF.
    - Test trôi định dạng: đọc file nhúng rồi `Ghi` lại → giống từng byte.
    - Báo: kích thước file (thô, gzip); thời gian nạp lần đầu trong tiến trình và bộ nhớ. Nạp ≤ 1 giây trên máy dev.
    - `git check-ignore` không bỏ qua file. Bản publish của Import vẫn không có `DichVuCong.DuLieuMau.dll`.

- [x] T28 [chatbot-dev] [P] Kho câu chưa trả lời theo nguồn (plan §9.6; sửa phần xoá của F01 T18) — sau T26:
  - `Features/Chatbot/IKhoCauChuaTraLoi.cs`; `KhoCauChuaTraLoiPostgreSql` (ghi: một câu `INSERT … ON CONFLICT` tham số hoá; xoá: `ExecuteDeleteAsync` chuyển từ việc định kỳ); `KhoCauChuaTraLoiMau` (singleton, `lock`, tối đa 1.000 dòng, đầy thì bỏ dòng có lần gặp cuối cũ nhất).
  - `XoaCauChuaTraLoiHetHan` gọi `XoaQuaHanAsync` của kho lấy trong scope; lịch, mốc, log, xử lý lỗi giữ như cũ.
  - `AddChatbot(LoaiNguonDuLieu nguon)`.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/`
  - xong khi:
    - Test kho Mẫu (đồng hồ giả): câu mới → 1 lần gặp; "Đăng ký khai sinh?" rồi "dang ky khai sinh?" → một dòng, 2 lần gặp, lần gặp cuối theo đồng hồ; dòng mới thứ 1.001 bỏ dòng cũ nhất, còn 1.000; `XoaQuaHanAsync` bỏ dòng trước mốc, giữ dòng đúng mốc; 1.000 lần ghi song song → tổng số lần gặp đúng.
    - Câu dài hơn 500 ký tự → `ArgumentOutOfRangeException` ở cả hai kho.
    - Test kho PostgreSql (`DbGiaLap`): ghi = đúng một câu `INSERT … ON CONFLICT (khoa_gop)`, giá trị nằm trong tham số, không nằm trong chuỗi SQL; xoá = như test hiện có.
    - Test việc định kỳ với kho giả: chạy lúc khởi động rồi mỗi giờ; kho ném lỗi → Warning, lượt sau thử lại (các ca hiện có giữ ý nghĩa).
    - `AddChatbot(Mau)` → kho Mẫu singleton; `AddChatbot(PostgreSql)` → kho PostgreSql scoped; cả hai có việc định kỳ; `TimeProvider` có sẵn được giữ.

- [x] T29 [backend-dev] Chọn nguồn bằng cấu hình (plan §9.2, §9.8, §9.9; gồm F01 T19) — sau T27, T28, F08 T11:
  - `Common/Hosting/`: `DuLieuOptions` (`DuLieu:Nguon`, `[Required]`, `[AllowedValues("Mau", "PostgreSql")]`); `AddNguonDuLieu` (Mẫu: `AddDichVuCongDataMau()` + kiểm tra sẵn sàng `du-lieu`; PostgreSql: `AddDichVuCongData(GetRequiredConnectionString("DichVuCong"))` + `AddDbContextCheck`), gọi trong `AddApiServices`; `AddChatbot(nguon)`. `Program.cs` bỏ dòng `AddDichVuCongData`.
  - `Common/Caching/PhienBanDuLieu.cs` đọc qua `INguonDuLieu` + `LonNhatAsync`.
  - Một dòng log Information lúc khởi động nêu nguồn (Mẫu: kèm phiên bản định dạng, `thoiDiem`, số thủ tục).
  - `appsettings.json` **không có** mục `DuLieu` — Production bắt buộc khai, không mặc định (F00 BR-16, AC-26; Cần hỏi 1 đã chốt). `launchSettings.json`: profile `https` thêm `DuLieu__Nguon=Mau`; thêm profile `https-postgresql` (cùng địa chỉ, đặt `DuLieu__Nguon=PostgreSql`).
  - Ghi vào báo cáo: lệnh `dotnet ef` thêm `-- --DuLieu:Nguon=PostgreSql` ở cuối (Cần hỏi 6) để người dùng cập nhật `CLAUDE.md`.
  - Test: `ApiFactory` mặc định nguồn Mẫu, bỏ chuỗi kết nối giả; thêm factory PostgreSql (chuỗi giả) cho test cần đường DB. Test kiến trúc: không type nào trong `DichVuCong.Api` nhận `AppDbContext` qua constructor, trừ `KhoCauChuaTraLoiPostgreSql`.
  - file: `src/BackEnd/DichVuCong.Api/{Program.cs, appsettings.json, Properties/launchSettings.json, Common/Hosting/, Common/Caching/PhienBanDuLieu.cs}`, `src/BackEnd/DichVuCong.Tests/Api/`
  - xong khi:
    - Test cấu hình: thiếu `DuLieu:Nguon`, giá trị `Postgres`, giá trị `mau` → không khởi động, thông báo nêu mục `DuLieu:Nguon` và hai giá trị hợp lệ. PostgreSql thiếu chuỗi kết nối → nêu `ConnectionStrings:DichVuCong`, không in giá trị. Mẫu không có chuỗi kết nối → khởi động được.
    - Test AC-26 (môi trường Production, đọc `appsettings.json` thật của bản build): (1) không khai gì → `Program` ném lỗi khi dựng, thông báo nêu `DuLieu:Nguon`, và không có `INguonDuLieu`/`TepDuLieuMau` nào được đăng ký (không phục vụ dữ liệu mẫu); (2) khai `Mau` → khởi động, `GET /api/trung-tam` 200; (3) khai `PostgreSql` với chuỗi kết nối giả → khởi động, `/health/ready` 503. Kèm ca Development không khai (không có launch profile) → cũng không khởi động.
    - Test không dấu hiệu bản chạy thử: nguồn Mẫu — `GET /api/trung-tam` không có trường báo nguồn; HTML trang không chứa "chạy thử" hay "dữ liệu mẫu" ngoài giá trị người chịu trách nhiệm; `ngayCapNhatThuTuc` khác null.
    - Test sẵn sàng: Mẫu → `/health/ready` 200. PostgreSql, DB không tới được → 503 trong ≤ 2 giây (test hiện có, chạy trên factory PostgreSql).
    - Test trên file nhúng, không service giả: `GET /api/trung-tam` 200; `email` = `cangiuoc@tayninh.gov.vn`; 6 ô dịch vụ (2 `url` null); 3 liên kết; 5 dòng giờ; `ngayCapNhatThuTuc` = ngày Việt Nam của `thoiDiem` trong file; `ETag` chứa `thoiDiem.UtcTicks`; gửi lại `If-None-Match` → 304.
    - Test kiến trúc xanh.
    - Chạy tay khi không có PostgreSQL chạy: `dotnet run --project src/BackEnd/DichVuCong.Api` → log nêu nguồn Mẫu; `/health/ready` 200; `/api/trung-tam` 200. `--launch-profile https-postgresql` với DB dev → đọc từ DB.
    - `dotnet ef migrations has-pending-model-changes --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api` chạy được khi thêm `-- --DuLieu:Nguon=PostgreSql` ở cuối (EF design-time dựng host, cần khai nguồn; `CLAUDE.md` mục Lệnh đã ghi).

- [ ] T30 [code-reviewer] Review T25–T29 và F08 T11 theo `CLAUDE.md`, `plan.md` §9 → bổ sung `result/review.md`. Trọng tâm: quy tắc §9.4; không còn `AppDbContext` trong feature (trừ kho PostgreSql của trợ lý); file mẫu đã làm sạch; không nối chuỗi SQL; cấu hình sai báo rõ, không lộ giá trị — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được agent sở hữu sửa.

- [x] T31 [tester] [P] Kiểm nguồn dữ liệu (plan §9.10) → thêm mục "Nguồn dữ liệu" vào `testcases.md` và `result/test.md` — xong 2026-10-12: 22/22 ca đạt, 572 test xanh (xem `result/test.md`):
  - Integration (biến `ConnectionStrings__DichVuCongTest`; không có thì bỏ qua, không đỏ):
    - Tương đương dữ liệu: tạo DB riêng, chạy migration, chèn nội dung file nhúng bằng `AppDbContext` → với từng tập trong 14 tập, đọc qua `NguonDuLieuPostgreSql` và `NguonDuLieuMau` bằng cùng một phép `Select` (sắp theo khoá) → tuần tự hoá JSON → giống nhau.
    - 5 hàm `TruyVan` trên nhánh EF.
    - Lớp con PostgreSql của `ThongTinTrungTamServiceContract` (dùng `Tests/Api/DuLieuThu/`).
    - `KhoCauChuaTraLoiPostgreSql` với DB thật: ghi hai câu cùng khoá gộp → một dòng, 2 lần gặp; xoá quá hạn.
  - Chạy tay:
    - Máy không có PostgreSQL: lệnh demo ở plan §9.12 với bản build FE → trang chủ, chân trang hiện dữ liệu mẫu; dòng "cập nhật ngày" đúng ngày của file.
    - Cấu hình sai (3 ca ở T29) → thông báo đúng.
    - AC-26 trên bản publish: không khai chế độ → không khởi động; khai `Mau` → chạy dữ liệu mẫu, trang không có dấu hiệu bản chạy thử, chân trang có dòng "Dữ liệu thủ tục cập nhật ngày" đúng ngày của bộ mẫu (F08 AC-22); khai `PostgreSql` → chạy dữ liệu nhập.
    - Có `data-mau/`: `DuLieuMau` sinh Excel → `nhap tat-ca` vào DB → `GET /api/trung-tam` ở nguồn PostgreSql và nguồn Mẫu giống nhau, trừ `ngayCapNhatThuTuc` và `ETag`.
  - file: `src/BackEnd/DichVuCong.Tests/Integration/{DuLieu/, ThongTinTrungTam/, Chatbot/}`, `.specify/specs/F00-khung-he-thong/{testcases.md, result/test.md}`
  - xong khi: mọi ca có kết quả; `dotnet test` xanh khi có DB test, bỏ qua khi không có.
