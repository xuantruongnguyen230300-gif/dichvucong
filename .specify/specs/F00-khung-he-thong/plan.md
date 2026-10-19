---
id: F00
ten: Khung hệ thống
spec: spec.md (da-duyet)
nguon: .specify/ke-hoach.md — giai đoạn 1, 4, 5 (duyệt 2026-10-08); spec.md (duyệt 2026-10-09, cập nhật 2026-10-12)
cap_nhat: 2026-10-12
---

# F00 · Khung hệ thống — kế hoạch kỹ thuật

Hạ tầng kỹ thuật cho C01, F01–F10. Mọi chức năng sau phải theo đúng cấu trúc ở đây. Quy ước chung (bảo mật, hiệu năng, đặt tên) ở `CLAUDE.md`.

Plan này viết trước `spec.md`; phần khung đã làm xong (T01–T12, T14). Bản 2026-10-12 đối chiếu với spec và thêm:

| Thêm | Spec | Mục | Task |
|---|---|---|---|
| Trợ lý 60 câu/phút (thay 20) | BR-8, câu hỏi mở 16 | §1 Cấu hình | T16 |
| Bỏ thêm U+200E, U+200F khi chuẩn hoá tìm kiếm, BE và FE cùng bộ ký tự | F01 BR-18, C01 BR-4 | §1 Data, §4 | T15, T19 |
| Mã tra cứu 8 ký tự cho mỗi lỗi | BR-7 (chưa có trong bản đầu của plan) | §1 "Mã tra cứu", §2b | T17, T20 |
| Cache dữ liệu theo lần nhập: khoá cache, ETag gắn `lan_nhap` | BR-10, AC-11 | §1 "Cache dữ liệu theo lần nhập" | T18 |
| Dòng hướng dẫn khi trình duyệt quá cũ; ghi rõ mức trình duyệt khi build | BR-14, AC-15, AC-23 | §5 | T21 |
| Truy vết BR/AC, kiểm thử theo spec | toàn bộ | §6 | T22–T24 |
| Nguồn dữ liệu **Mẫu**: demo chạy không cần DB, đổi nguồn bằng cấu hình (kế hoạch 6.0, quyết định 2026-10-12) | quyết định kỹ thuật; ảnh hưởng BR-5, BR-13 — ghi cho ba-analyst ở §9.16 | §9; sửa tại chỗ §1, §3 | T25–T31; F08 T11 |

## 1. Backend — `src/BackEnd/`

### Solution

| Project | Loại | Tham chiếu | Chứa |
|---|---|---|---|
| `DichVuCong.Data` | classlib | — | `AppDbContext`, `Entities/`, `Configurations/`, `Migrations/`, `Text/TiengViet.cs`, `DuLieu/` (lớp nguồn dữ liệu — §9.3), `Mau/` (file dữ liệu mẫu nhúng — §9.5) |
| `DichVuCong.Api` | web | Data | `Program.cs`, `Common/`, `Features/` |
| `DichVuCong.Import` | console | Data | công cụ nhập Excel |
| `DichVuCong.DuLieuMau` | console, không publish | Import | sinh bản đầu dữ liệu (F01 §6) và file dữ liệu mẫu (§9.5) |
| `DichVuCong.Tests` | xUnit v3 | Api, Data, Import | test đơn vị + `WebApplicationFactory` |

- Phụ thuộc một chiều: `Api → Data`, `Import → Data`, `DuLieuMau → Import`. `Data` không tham chiếu ASP.NET Core.
- `Directory.Build.props` (đã có): net10.0, Nullable, ImplicitUsings, cảnh báo = lỗi, `AnalysisLevel latest`, `EnforceCodeStyleInBuild`, lockfile, bản Release không có `.pdb`.
- `Directory.Packages.props` (đã có): version tập trung. Thêm gói thì thêm `PackageVersion` ở đây và ghi lý do trong báo cáo.

### `DichVuCong.Data` — db-dev

- `AppDbContext`:
  - `HasPostgresExtension("unaccent")`, `HasPostgresExtension("pg_trgm")`.
  - `ApplyConfigurationsFromAssembly` — mỗi entity một `IEntityTypeConfiguration<T>` trong `Configurations/`.
- `DataServiceCollectionExtensions.AddDichVuCongData(this IServiceCollection services, string connectionString)`:
  - `AddDbContextPool<AppDbContext>` + `UseNpgsql` + `UseSnakeCaseNamingConvention`.
  - Chữ ký hàm giữ nguyên — Import gọi thẳng; Api gọi qua `AddNguonDuLieu` khi `DuLieu:Nguon` = `PostgreSql` (§9.2). Thêm đăng ký `INguonDuLieu` (§9.3).
- `AddDichVuCongDataMau()` (thêm 2026-10-12): nguồn Mẫu, không có `AppDbContext` (§9.3).
- Migration đầu `KhoiTao`: chỉ tạo 2 extension. Các bảng nghiệp vụ: F01 migration `NhapDuLieu`.
- `Text/TiengViet.cs` (static):
  - `BoDau(string)`: chuẩn hoá Unicode NFD → bỏ dấu kết hợp → `đ/Đ` → `d/D` → trả về NFC.
  - `BoKyTuVoHinh(string)` (thêm 2026-10-12, public): bỏ U+200B–U+200F (gồm dấu định hướng chữ U+200E, U+200F) và U+FEFF. Công cụ nhập dùng hàm này để làm sạch chữ trước khi lưu (F01 BR-18).
  - `ChuanHoaTimKiem(string)`: `BoDau` → chữ thường (invariant) → `BoKyTuVoHinh` → gộp khoảng trắng → trim.
  - `TaoMaDuongDan(string)`: F01 §4.
  - Dùng ở công cụ nhập (làm sạch chữ, tính cột tìm kiếm) và ở API (chuẩn hoá câu hỏi). FE có bản tương đương — hai bên phải cho cùng kết quả với bộ mẫu §4.
  - Trong mã nguồn, ký tự vô hình viết bằng escape (`\u200E`), không dán ký tự thật — ký tự thật không nhìn thấy khi review.

### `DichVuCong.Api` — backend-dev

`Program.cs` chỉ ghép extension, không chứa logic:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.AddApiHosting();                                  // Kestrel: tắt header Server, giới hạn kích thước body
builder.Services.AddApiServices(builder.Configuration);   // controller, ProblemDetails, rate limit, nén, cache, health, OpenAPI,
                                                          // nguồn dữ liệu theo DuLieu:Nguon (§9.2), AddChatbot(nguon)
var app = builder.Build();
app.UseApiPipeline();
app.MapApiEndpoints();
app.Run();
```

Tên hàm có thể khác, nhưng `Program.cs` phải giữ đúng hình dạng này. Sửa 2026-10-12 (T29): bỏ dòng `AddDichVuCongData(...)`; `AddApiServices` đọc `DuLieu:Nguon` một lần rồi đăng ký nguồn dữ liệu, kiểm tra sẵn sàng và kho của trợ lý theo nguồn đó (§9.2). Dịch vụ của chức năng đăng ký qua extension của chức năng đó, gọi từ `AddApiServices` (vd. `AddChatbot(nguon)` — §9.6).

`Common/`:

| Thư mục | Nội dung |
|---|---|
| `Hosting/` | Các extension ở trên; chọn nguồn dữ liệu theo `DuLieu:Nguon` (§9.2); đọc chuỗi kết nối khi nguồn là PostgreSql — thiếu thì dừng khởi động với thông báo nêu tên khoá, không in giá trị |
| `Security/` | Middleware header bảo mật; giá trị CSP và các header đặt ở **một** chỗ, đúng như `CLAUDE.md` |
| `Errors/` | `IExceptionHandler` → ProblemDetails; ngoài Development không có chi tiết lỗi. Danh mục mã lỗi (§2b). Mã tra cứu (bên dưới) |
| `RateLimiting/` | Hằng tên policy `danh-muc`, `tro-ly`; ngưỡng đọc từ cấu hình `RateLimiting:DanhMuc`, `RateLimiting:TroLy` (số yêu cầu / phút / IP) |
| `Caching/` | Output cache policy `danh-muc`; thời gian từ cấu hình; khoá cache và ETag theo phiên bản dữ liệu (bên dưới) |

Thứ tự pipeline (đã chỉnh theo bản hiện thực ở T06):

1. Header bảo mật — đứng đầu để mọi response, kể cả chuyển hướng và lỗi, đều có header. HSTS gắn trong chính middleware này, chỉ khi ngoài Development và request là HTTPS (không dùng `UseHsts` vì nó bỏ qua `localhost` và giá trị phải nằm một chỗ).
2. Exception handler
3. HTTPS redirection
4. Response compression (Brotli, Gzip)
5. Static files: file có hash → cache 1 năm `immutable`; `index.html` → `no-cache`
6. Routing → Rate limiter → Output cache
7. Controller, health check
8. Fallback `index.html` (handler riêng `SpaFallback`) cho GET/HEAD không bắt đầu bằng `/api` hoặc `/health`; `/api/*` không khớp → 404 ProblemDetails; thiếu `index.html` → 404, không lỗi

Endpoint của khung:

- `/health/live` — không kiểm DB.
- `/health/ready` — nguồn PostgreSql: kiểm kết nối DB, thời gian chờ `Hosting:ReadyTimeout` (mặc định 1 giây — BR-13). Nguồn Mẫu: dữ liệu mẫu đã nạp (§9.9).
- Cả hai dùng policy giới hạn `danh-muc` (BR-8, BR-13). Ai theo dõi, có chặn từ Internet không: chờ câu hỏi mở 28.
- OpenAPI (`MapOpenApi`) chỉ ở Development.

Chưa bật ForwardedHeaders: phụ thuộc cách triển khai (câu hỏi mở 10). Khi bật, rate limit theo IP mới đúng sau reverse proxy (BR-8).

Cấu hình:

- `appsettings.json`: không có secret; có `RateLimiting`, `Caching`, `Hosting` (giới hạn body, thời gian chờ health).
- `RateLimiting`: `DanhMuc` = 300, `TroLy` = **60** (đổi từ 20 — F00 BR-8, F06 BR-5, câu hỏi mở 16). Giá trị ngoài khoảng cho phép (vd. 0) → không khởi động, báo tên mục (đã có, `RateLimitingOptions`).
- `DuLieu:Nguon` = `Mau` | `PostgreSql` (thêm 2026-10-12 — §9.2).
- `Properties/launchSettings.json`: https://localhost:7157, http://localhost:5157.

#### Mã tra cứu (BR-7) — thêm 2026-10-12

- `Common/Errors/MaTraCuu.cs`: tạo mã 8 ký tự bằng `RandomNumberGenerator`, lấy từ 31 ký tự `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (chữ hoa A–Z và chữ số, bỏ `0`, `O`, `1`, `I`, `L`).
- Mọi ProblemDetails có thêm trường `maTraCuu`, khác nhau mỗi lần. Bỏ `traceId` khỏi response: mã tra cứu thay vai trò này, response chỉ có trường màn hình cần dùng.
- Ghi nhật ký kèm mã để cán bộ tìm đúng lần lỗi:
  - 5xx: `GlobalExceptionHandler` log mức Error, kèm mã và exception. Mã tạo trước khi log, giữ trong `HttpContext.Items` để ProblemDetails dùng đúng mã đó.
  - 4xx: log mức Information gồm mã, mã HTTP, phương thức, đường dẫn **không kèm query string** (query có thể chứa từ khoá người dân gõ).
  - Log scope có cả `TraceId` để kỹ thuật nối với log khác.
- FE: `ApiError.maTraCuu` (§2). Màn hình chỉ hiện mã với lỗi loại "Lỗi hệ thống" — trạng thái lỗi của C01 BR-11.

#### Cache dữ liệu theo lần nhập (BR-10, AC-11) — thêm 2026-10-12

Công cụ nhập (F01) là tiến trình khác, không xoá được output cache của API. Nếu chỉ dựa vào thời gian hết hạn (`Caching:DanhMuc` = 10 phút), dữ liệu mới hiện chậm tới 10 phút. Cách làm:

- `Common/Caching/PhienBanDuLieu.cs`: `IPhienBanDuLieu.LayAsync(ct)` đọc `max(thoi_diem)` của bảng `lan_nhap` (F01 §4) bằng một truy vấn `AsNoTracking`. Trả về số tick UTC, hoặc 0 khi chưa có lần nhập nào. Mọi lần nhập đều đổi phiên bản — đơn giản hơn tách theo loại, mà số lần nhập rất ít. Sửa 2026-10-12 (T29): đọc qua `INguonDuLieu`; nguồn Mẫu cho phiên bản = thời điểm ghi trong file dữ liệu mẫu (§9.8).
- Policy `danh-muc` thành một `IOutputCachePolicy` riêng:
  - Chỉ GET/HEAD; chỉ lưu response 200.
  - Thêm phiên bản dữ liệu vào khoá cache (`CacheVaryByRules.VaryByValues`). Khoá vẫn gồm đường dẫn và query như mặc định.
  - Response có `ETag` = phiên bản dữ liệu + mã bản build (`AssemblyInformationalVersion`), để cả nhập dữ liệu lẫn triển khai bản mới đều đổi ETag. Có thêm `Cache-Control: no-cache`, để trình duyệt luôn hỏi lại bằng `If-None-Match`.
  - `If-None-Match` khớp → 304, không chạy endpoint.
  - `Caching:DanhMuc` vẫn là thời gian giữ trong bộ nhớ máy chủ; độ đúng của dữ liệu không còn phụ thuộc vào con số này.
- Mỗi yêu cầu tốn thêm một truy vấn khoá chính trên bảng 4 dòng (dưới 1 ms). Không giữ phiên bản trong bộ nhớ, vì sẽ mở lại khoảng thời gian thấy dữ liệu cũ.
- DB không kết nối được → yêu cầu lỗi 500 như mọi lỗi khác; không trả bản cache cũ.
- Endpoint đọc dữ liệu nhập của F02–F08 chỉ cần gắn `CacheOutput(CachePolicies.DanhMuc)` và `RequireRateLimiting(RateLimitPolicies.DanhMuc)`. Trợ lý (F06) không dùng cache này.
- Phụ thuộc: bảng `lan_nhap` (F01 T03).

### `DichVuCong.Import` — db-dev

Console dùng Generic Host: cấu hình (appsettings + user-secrets + biến môi trường) → DI → `AddDichVuCongData`. Lệnh thật: F01.

### `DichVuCong.Tests`

| Thư mục | Agent | Test |
|---|---|---|
| `Api/` | backend-dev | `/health/live` trả 200, có đủ header bảo mật và CSP; lỗi không bắt được → ProblemDetails, không lộ stack trace (môi trường Production); mã tra cứu; cache theo phiên bản dữ liệu |
| `Data/` | db-dev | `TiengViet` theo bộ mẫu §4 |
| `Integration/` | tester | F01 trở đi |

Test không phụ thuộc DB local: `ApiFactory` chạy nguồn Mẫu, không có chuỗi kết nối (sửa 2026-10-12, T29); test cần đường PostgreSQL (vd. `/health/ready` khi DB không tới được) dùng factory có chuỗi kết nối giả. `/health/live` không chạm dữ liệu. Test cache dùng `IPhienBanDuLieu` giả và một endpoint chỉ có trong test. Test hợp đồng của service chạy trên nguồn Mẫu: §9.10.

## 2. Frontend — `src/FrontEnd/` — ui-core-dev

Đợt này chỉ làm hạ tầng. `tokens.css` và component lõi làm theo plan C01.

```
src/FrontEnd/
  index.html                  # lang="vi", không script/style inline; dòng hướng dẫn trình duyệt cũ (§5)
  package.json                # engines: node >= 20.19
  vite.config.ts
  eslint.config.js
  tsconfig*.json
  playwright.config.ts
  build/                      # plugin build: obfuscate, kiểm trình duyệt (§5)
  src/
    main.tsx
    app/                      # App, providers (QueryClient), router (lazy), layout khung trống
    core/
      api/http.ts             # fetch có kiểu; lỗi → ApiError mang ProblemDetails (code, maTraCuu); hỗ trợ AbortSignal
      hooks/                  # useDebounce, useUrlState
      utils/tiengViet.ts      # boDau, chuanHoaTimKiem — cùng thuật toán với BE
      components/             # plan C01
      styles/global.css       # reset tối thiểu
    features/trang-chu/       # trang tạm để kiểm route
  e2e/smoke.spec.ts
```

- Script: `dev`, `build` (tsc + vite), `preview`, `lint`, `test` (Vitest), `e2e` (Playwright).
- `vite.config.ts`:
  - Dev: proxy `/api` và `/health` → https://localhost:7157 (`secure: false`).
  - Build: `outDir` = `../BackEnd/DichVuCong.Api/wwwroot`, `emptyOutDir`; `sourcemap: false`; bỏ `console`/`debugger`; chunk `vendor` riêng.
  - `build.target` ghi rõ `['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4']` (thêm 2026-10-12). Đây đang là mặc định của Vite 8 và trùng danh sách chính thức ở BR-14; ghi rõ để nâng Vite không tự đổi mức trình duyệt hỗ trợ.
  - Obfuscate chỉ chunk của dự án, chỉ khi build production, đúng mức ghi trong `CLAUDE.md`. Hash tên file tính trước khi obfuscate → đổi version hay tuỳ chọn obfuscator thì phải đổi `seed` (để tên file đổi, trình duyệt không dùng bản cache cũ).
  - Chunk `vendor` chỉ gồm phần lõi chạy ngay lúc khởi động (react, react-dom, react-router, @tanstack/react-query, i18next và phụ thuộc trực tiếp của chúng). Thư viện chỉ dùng ở một chức năng (QR, đọc câu trả lời…) phải được nạp bằng `import()` ở chức năng đó để tách thành chunk riêng. Thêm thư viện cần chạy lúc khởi động → thêm vào nhóm `vendor` trong `vite.config.ts`.
- TypeScript strict, thêm `noUncheckedIndexedAccess`.
- ESLint: typescript-eslint, react-hooks; cấm `core/**` import `features/**`; cấm `dangerouslySetInnerHTML`.
- Không thư viện gọi HTTP ngoài `fetch`. Dùng chế độ cache mặc định của `fetch`, để trình duyệt tự hỏi lại bằng ETag (BR-10).
- Vitest cho `utils/`, `hooks/`. Playwright: 2 khổ (375×812, 1080×1920) + 1 smoke test mở trang chủ.

## 2b. i18n (T14 — quyết định 2026-10-08)

### Frontend — ui-core-dev

- react-i18next + i18next; file ngôn ngữ đóng gói khi build. Chỉ tiếng Việt (`vi`), nhưng không viết gì khoá chặt vào một ngôn ngữ.
- `core/i18n/`: khởi tạo i18next, `vi/common.json` (chuỗi dùng chung: nút chung, trạng thái tải/lỗi, mã lỗi API).
- Mỗi tính năng một namespace, file đặt cạnh tính năng: `features/<x>/i18n/vi.json`. Namespace của tính năng nạp lười cùng route (không đẩy vào JS tải ban đầu).
- Khoá có kiểu TypeScript (`CustomTypeOptions`) — gõ sai khoá là lỗi `tsc`.
- ESLint chặn chuỗi chữ viết thẳng trong JSX (trừ ký hiệu, số).
- `core/api/http.ts`: `ApiError` mang `code` từ ProblemDetails; hiển thị bằng `t('common:loi.<code>')`, mã lạ → `loi.mac-dinh`.
- Chuỗi trong `index.html` (tiêu đề, dòng hướng dẫn trình duyệt cũ) chèn lúc build từ `common.json` (§5).

### Backend — backend-dev

Mọi response lỗi có `code` (phần mở rộng của ProblemDetails). Danh mục mã đặt một chỗ ở `Common/Errors/`:

| HTTP | `code` |
|---|---|
| 400 | `du-lieu-khong-hop-le` |
| 404 | `khong-tim-thay` |
| 405 | `phuong-thuc-khong-hop-le` |
| 413 | `yeu-cau-qua-lon` |
| 429 | `qua-nhieu-yeu-cau` |
| 500 | `loi-he-thong` |

`title` giữ cụm chuẩn theo mã HTTP; FE không hiển thị `title` / `detail`, chỉ dùng `code`. 4xx ngoài bảng → `du-lieu-khong-hop-le`; mọi 5xx → `loi-he-thong`. Mọi ProblemDetails (kể cả 429 của rate limiter) có cùng tập trường, gồm `code` và `maTraCuu` (BR-7 — thay `traceId` từ 2026-10-12).

Mã chỉ có ở FE (không do BE trả): `mat-ket-noi` — fetch thất bại vì mất mạng hoặc máy chủ không phản hồi (F08 BR-11). Lỗi này không có mã tra cứu (BR-7).

`<title>` trong `index.html` được chèn lúc build từ khoá `common:ung-dung.tieu-de` (một nguồn duy nhất; Zalo và công cụ tìm kiếm không chạy JS nên tiêu đề phải có sẵn trong HTML). Chức năng sau cần mã riêng (vd. F06 vượt giới hạn câu hỏi) thì thêm vào danh mục này và vào `common.json`.

### Import — db-dev (làm cùng F01)

Thông báo cho người vận hành đặt trong `Resources/*.resx`.

## 3. Chạy local

Sửa 2026-10-12: có hai nguồn dữ liệu (§9). Lệnh chi tiết: §9.12.

Nguồn Mẫu — demo, không cần PostgreSQL:

1. `cd src/FrontEnd && npm ci && npm run build` — một lần, và mỗi khi FE đổi (bản build vào `wwwroot`, không commit).
2. `dotnet run --project src/BackEnd/DichVuCong.Api` → https://localhost:7157 (profile mặc định `https` đặt `DuLieu__Nguon=Mau`).

Khi sửa FE, thay bước 1 bằng `npm run dev` (Vite proxy `/api` tới 7157).

Nguồn PostgreSql:

1. `dotnet user-secrets set "ConnectionStrings:DichVuCong" "Host=localhost;Port=5432;Database=dichvucong;Username=postgres;Password=postgres" --project src/BackEnd/DichVuCong.Api`
2. `dotnet ef database update --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api`
3. Nạp dữ liệu bằng công cụ nhập (F01): `dotnet run --project src/BackEnd/DichVuCong.Import -- nhap tat-ca <thư-mục>`
4. `dotnet run --project src/BackEnd/DichVuCong.Api --launch-profile https-postgresql`
5. FE như trên.

## 4. Bộ mẫu chuẩn hoá tiếng Việt (BE và FE phải cho cùng kết quả)

| Vào | `BoDau` | `ChuanHoaTimKiem` |
|---|---|---|
| `Đăng ký khai sinh` | `Dang ky khai sinh` | `dang ky khai sinh` |
| `  HỘ   TỊCH ` | `  HO   TICH ` | `ho tich` |
| `Chứng thực bản sao` | `Chung thuc ban sao` | `chung thuc ban sao` |
| `Thủy lợi – Thuỷ sản` | `Thuy loi – Thuy san` | `thuy loi – thuy san` |
| `Đất đai` (dạng NFD — dấu tách rời) | `Dat dai` | `dat dai` |
| `ĐƯỜNG Ở` | `DUONG O` | `duong o` |
| *(chuỗi rỗng)* | *(chuỗi rỗng)* | *(chuỗi rỗng)* |
| `a`␣NBSP`b`TAB`c`U+0085`d`U+FEFF`e`U+200B`f` | *(giữ nguyên)* | `a b c def` |
| `đăng k`U+200E`ý` (thêm 2026-10-12 — dữ liệu Vàm Cỏ) | `dang k`U+200E`y` | `dang ky` |
| `a`U+200F`b`U+200C`c`U+200D`d` (thêm 2026-10-12) | *(giữ nguyên)* | `abcd` |

`BoKyTuVoHinh` bỏ U+200B–U+200F và U+FEFF. `ChuanHoaTimKiem` bỏ các ký tự này trước, rồi gộp mọi khoảng trắng (gồm cả NBSP và U+0085) thành một dấu cách. BE và FE phải dùng đúng tập ký tự này. `BoKyTuVoHinh` cho bộ mẫu: `đăng k`U+200E`ý` → `đăng ký`.

Khác biệt đã biết và chấp nhận (không có trong dữ liệu tiếng Việt): dấu kết hợp ngoài BMP (BE giữ, FE bỏ); chữ Σ cuối từ (FE ra `ς`, BE ra `σ`).

## 5. Trình duyệt hỗ trợ và trình duyệt quá cũ (BR-14, AC-15, AC-23) — thêm 2026-10-12

Danh sách chính thức (BR-14): Chrome, Edge, Cốc Cốc, Samsung Internet bản tương đương Chrome 111 trở lên; Firefox 114 trở lên; Safari iOS / macOS 16.4 trở lên; trình duyệt trong Zalo dùng trình duyệt hệ thống đạt mức trên. Trùng mức `build.target` ở §2.

Vấn đề: trình duyệt quá cũ không chạy được mã của trang, nên thông báo không thể nằm trong React.

- Internet Explorer 11 bỏ qua `<script type="module">` → trang trắng.
- Safari iOS 15 chạy module, nhưng gặp cú pháp mới hơn mức nó hiểu thì dừng → trang trắng hoặc hỏng giữa chừng.

Cách làm:

- `index.html` có sẵn một đoạn `<p id="trinh-duyet-cu" hidden>`: câu hướng dẫn dùng trình duyệt khác, kèm số điện thoại Trung tâm (nguồn số: §8 câu 1). Câu chữ chèn lúc build từ khoá `common:trinh-duyet-cu.huong-dan`, giống cách chèn `<title>` hiện nay (một nguồn, đúng quy tắc i18n). Không có `style` hay `script` inline (CSP).
- Một script kiểm tra trình duyệt:
  - File JS thường (không phải module), viết ES5, không dùng thư viện. Nạp bằng `<script src>` đặt trước script module trong `index.html`.
  - Plugin build phát file này vào `/assets/` có hash, nên được cache `immutable` như asset khác, không phải sửa BE.
  - Kiểm vài tính năng có từ đúng mức hỗ trợ, vd. regex lookbehind (Safari 16.4), màu `oklch()` qua `CSS.supports` (Chrome 111, Firefox 113). Thiếu tính năng → bỏ `hidden` của dòng hướng dẫn và gỡ `#root`, để ứng dụng không chạy dở. Đủ → không làm gì.
  - `main.tsx`: không thấy `#root` thì dừng lặng lẽ, không ném lỗi.
- Script này không qua javascript-obfuscator, chỉ minify (§8 câu 2): phải chạy được trên IE11, không chứa logic nghiệp vụ, dưới 1 KB.
- Kết quả: IE11 chỉ chạy script kiểm tra → hiện dòng hướng dẫn. iOS 15 → script kiểm tra hiện dòng hướng dẫn trước khi module chạy. Trình duyệt trong danh sách → không thấy gì khác.
- Không dùng `<noscript>`: IE11 và Safari iOS 15 vẫn bật JavaScript, nên `<noscript>` không hiện ra. Không hiện sẵn dòng hướng dẫn rồi để React thay thế: trên mạng chậm, người dùng trình duyệt mới sẽ thấy câu "trình duyệt đã cũ" trong lúc chờ tải.
- Kiểm thử:
  - Playwright trên Chromium, Firefox, WebKit bản hiện có: không thấy dòng hướng dẫn, trang chạy.
  - `page.addInitScript` làm hỏng tính năng được kiểm (vd. `CSS.supports` trả `false`) → thấy dòng hướng dẫn, không còn `#root`.
  - AC-15, AC-23 thử tay trên thiết bị hoặc trình duyệt thật (tester).

API mới hơn mức hỗ trợ (vd. `Array.prototype.toSorted` cần Firefox 115) không được Vite hạ cấp, và script kiểm tra không bắt được. Xem rủi ro 1 ở §7.

## 6. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 HTTPS, HSTS 1 năm, TLS 1.2+ | §1 pipeline (HTTPS redirection, HSTS trong middleware header). TLS khi triển khai | T06 (xong); kế hoạch 8.3 |
| BR-2 chỉ chạy nội dung của trang | CSP, `frame-ancestors`, `Permissions-Policy` (`CLAUDE.md`); tài nguyên tự host | T06 (xong) |
| BR-3 lỗi không lộ thông tin kỹ thuật | §1 `Errors/`, tắt header `Server`; §2b | T06, T07, T14 (xong) |
| BR-4 bảo vệ mã nguồn | §2 build: không source map, bỏ console, obfuscate; publish không `.pdb` | T09 (xong); ngoại lệ script kiểm tra (§5) |
| BR-5 thông tin nhạy cảm | §1 `Hosting/` (chuỗi kết nối — chỉ bắt buộc với nguồn PostgreSql, §9.2). Che câu hỏi trước khi ghi log: F06 (chatbot-dev); khung không ghi body yêu cầu vào log | T06 (xong), T29; F06 |
| BR-6 thông báo theo loại lỗi | §2b | T14 (xong) |
| BR-7 mã tra cứu | §1 "Mã tra cứu", §2b | T17, T20; hiển thị: C01 |
| BR-8 giới hạn tần suất, kích thước | §1 `RateLimiting/`, cấu hình (trợ lý 60) | T06 (xong), T16; ForwardedHeaders chờ câu hỏi mở 10 |
| BR-9 ngân sách hiệu năng | `CLAUDE.md` Hiệu năng; §2 chunk `vendor`, nạp lười | T09 (xong); đo ở từng chức năng và T24; `npm run build` tự kiểm JS tải đầu ở `/` (entry + chunk import tĩnh + trang chủ, gzip): cảnh báo > 190 KiB, lỗi > 200 KiB (`build/kiem-tra-kich-thuoc.ts`) |
| BR-10 cache không làm thấy nội dung cũ | §1 static files (xong); "Cache dữ liệu theo lần nhập" | T06 (xong), T18 |
| BR-11 khả năng tiếp cận | `design-system.md` §6, C01 | C01; T24 |
| BR-12 câu chữ tập trung | §2b | T14 (xong) |
| BR-13 theo dõi tình trạng | §1 endpoint của khung; nguồn Mẫu: §9.9 | T06 (xong), T29; T24 kiểm AC-14 với nguồn PostgreSql |
| BR-14 trình duyệt hỗ trợ | §2 `build.target`, §5 | T21 |
| BR-15 mở thẳng mọi địa chỉ | §1 `SpaFallback`; trang 404: F08 | T06 (xong); F08 |
| AC-1, AC-17 HTTPS, TLS | — | T24 trên bản triển khai (giai đoạn 8) |
| AC-2, AC-3 nguồn tài nguyên, nhúng khung, quyền | CSP, header | T24 |
| AC-4, AC-5 lỗi, mã tra cứu | §1, §2b | T17, T20, C01; T24 |
| AC-6 không source map, không tệp gỡ lỗi | §2 build | T24 |
| AC-7 thiếu cấu hình, cấu hình sai | §1 `Hosting/`, `RateLimitingOptions`; `DuLieu:Nguon` sai (§9.2) | T29; T24 (phần thiếu thông tin kết nối: với nguồn PostgreSql) |
| AC-8 giới hạn danh mục | §1 `RateLimiting/` | T24 |
| AC-9, AC-10, AC-18, AC-19 hiệu năng | `CLAUDE.md` Hiệu năng | T24 (AC-18, AC-19 trên bản triển khai) |
| AC-11 cache | §1 "Cache dữ liệu theo lần nhập" | T18; T24 sau khi có endpoint danh mục (F04) |
| AC-12 khả năng tiếp cận | C01 | T24 sau C01 |
| AC-13, AC-21 câu chữ | §2b | T24 |
| AC-14 theo dõi tình trạng | §1; §9.9 | T24 với nguồn PostgreSql |
| AC-15, AC-23 trình duyệt | §5 | T21; T24 thử tay |
| AC-16 mở thẳng địa chỉ | §1 `SpaFallback` | T24 sau F04, F08 |
| AC-20 nạp lười | §2 | T24 sau F05, F06, F07 |
| AC-22 che thông tin cá nhân trong log | F06 | T24 sau F06 |

## 7. Rủi ro

1. **API mới hơn mức hỗ trợ** (vd. `Array.prototype.toSorted` cần Firefox 115): Vite chỉ hạ cấp cú pháp, không thêm API thiếu, nên trang hỏng trên Firefox 114 mà script kiểm tra không phát hiện. Giảm thiểu: AC-15 thử bản thấp nhất của từng trình duyệt. Có thể thêm `eslint-plugin-compat` (chỉ dùng lúc dev, không vào bản build) — chưa thêm, cần đồng ý khi muốn.
2. **Script kiểm tra báo nhầm** trên trình duyệt được hỗ trợ → trang không dùng được. Giảm thiểu: chỉ kiểm tính năng có từ đúng hoặc sớm hơn mức hỗ trợ; e2e trên 3 engine; AC-15.
3. **Cache theo phiên bản cần DB mỗi yêu cầu:** DB chậm thì danh mục chậm theo. Truy vấn trên bảng 4 dòng, nên chấp nhận được.
4. **Health "Sẵn sàng" với DB không trả lời:** đúng 2 giây phụ thuộc Npgsql huỷ kết nối theo token. AC-14 phải thử bằng cách chặn mạng thật, không chỉ tắt DB.
5. **Log 4xx tăng mạnh khi bị dội yêu cầu** (mỗi 429 một dòng Information). Chấp nhận ở quy mô một xã; xem lại ở giai đoạn 8 cùng câu hỏi mở 28.
6. **Một số AC chỉ kiểm được trên bản triển khai** (AC-1, AC-17, AC-18, AC-19) và một số chờ chức năng khác (AC-11, AC-12, AC-16, AC-20, AC-22). F00 chỉ chuyển `xong` sau giai đoạn 8.
7. Rủi ro của nguồn dữ liệu Mẫu: §9.15.

## 8. Cần hỏi

| # | Câu hỏi | Phương án | Đề xuất |
|---|---|---|---|
| 1 | **Cần trả lời trước phần số điện thoại của T21.** Số điện thoại Trung tâm trong dòng hướng dẫn trình duyệt cũ lấy từ đâu, khi trang chưa tải được dữ liệu? | (a) Script kiểm tra gọi API thông tin Trung tâm của F08 bằng `XMLHttpRequest` (chạy được trên IE11), có số thì điền vào. API lỗi → dòng hướng dẫn không có số. Một nguồn số là file nhập; đổi số không phải build lại. Cần endpoint của F08. **Người dùng chọn (a) — 2026-10-12.** (b) BE chèn số vào `index.html` lúc trả trang, đọc từ `trung_tam`. Số có sẵn trong HTML, dùng được cả cho trạng thái lỗi của C01 BR-11 khi API hỏng; nhưng `index.html` thành trang động, việc trả trang phụ thuộc DB. (c) Số đặt cố định lúc build, trong file cấu hình FE. Đơn giản nhất, nhưng số điện thoại có hai nguồn; Trung tâm đổi số thì phải build lại FE | (a) |
| 2 | Script kiểm tra trình duyệt không obfuscate, chỉ minify — một ngoại lệ có chủ đích của mục Bảo mật trong `CLAUDE.md` | Làm theo đề xuất nếu người dùng không phản đối | Đồng ý ngoại lệ: phải chạy trên IE11 (ES5), không chứa logic nghiệp vụ, dưới 1 KB — **đã chấp nhận 2026-10-12** |

Câu hỏi của nguồn dữ liệu Mẫu (kế hoạch 6.0): §9.16.

## 9. Nguồn dữ liệu Mẫu và PostgreSQL — kế hoạch 6.0 (quyết định 2026-10-12)

Người dùng quyết định: demo chạy không cần DB. API đọc dữ liệu qua một lớp nguồn dữ liệu, có hai nguồn:

- **Mẫu:** file dữ liệu mẫu đi kèm bản build, nạp vào bộ nhớ lúc khởi động. File đã làm sạch, được commit.
- **PostgreSql:** như hiện nay.

Đổi nguồn bằng cấu hình. Giữ nguyên `AppDbContext`, migration, công cụ nhập: DB phát triển tiếp sau.

### 9.1 Chọn cách làm

| Hướng | Đánh giá |
|---|---|
| (a) Interface đọc theo từng chức năng, mỗi chức năng hai cài đặt (EF và bộ nhớ) | Đúng, không có gì ngầm. Nhưng F02–F07 mỗi chức năng viết truy vấn hai lần; hai bản dễ lệch nhau, chỉ test chạy đủ hai nguồn mới bắt được |
| **(b) Interface chung trả `IQueryable<T>` cho từng bảng — chọn** | Truy vấn viết một lần. PostgreSql: `DbSet.AsNoTracking()`, EF dịch ra SQL như hiện nay. Mẫu: `List<T>.AsQueryable()`. Chỗ vướng `ToListAsync` của EF: thay bằng 5 hàm trợ giúp tự chọn bản EF hay bản chạy trong bộ nhớ (§9.3). Phần không dùng chung được (ghi dữ liệu, trigram) đặt sau interface riêng (§9.6, §9.7) |
| (c) EF Core InMemory | Loại: không chạy `ExecuteDeleteAsync`, `ExecuteSql`, hàm trigram; cột JSON (complex collection) có thể không được hỗ trợ; Microsoft khuyên không dùng; thêm gói. Dù dùng vẫn phải có interface riêng cho trợ lý |
| (d) Nạp toàn bộ dữ liệu vào bộ nhớ ở cả hai nguồn (nguồn PostgreSql nạp lại khi `lan_nhap` đổi) | Kết quả giống hệt nhau, nhưng đổi cách đọc của nguồn PostgreSql: bỏ truy vấn trực tiếp, bỏ pg_trgm, phải đọc nhất quán 14 bảng mỗi lần nạp lại. Trái hướng "DB phát triển tiếp sau". Không chọn |

Lý do chọn (b):

- Ít mã nhất: một interface 14 thuộc tính, hai cài đặt mỏng, 5 hàm trợ giúp. Mỗi chức năng chỉ một bản truy vấn.
- Nguồn PostgreSql giữ nguyên SQL như hiện nay (`AsNoTracking` + `Select` thẳng ra DTO).
- Chỗ có thể lệch giữa hai nguồn chỉ còn ở ngữ nghĩa LINQ: EF dịch ra SQL, còn nguồn Mẫu chạy LINQ trên đối tượng. Chặn bằng quy tắc §9.4 và test hợp đồng chạy trên cả hai nguồn (§9.10).
- Test trên nguồn Mẫu tự bắt lỗi lỡ gọi `ToListAsync`… của EF: các hàm này ném lỗi khi nguồn không phải EF.

### 9.2 Cấu hình

Khoá `DuLieu:Nguon`, nhận đúng `Mau` hoặc `PostgreSql` (phân biệt hoa thường).

| Cách chạy | Nguồn | Đặt ở đâu |
|---|---|---|
| `dotnet run --project src/BackEnd/DichVuCong.Api`, Visual Studio, Rider (profile `https`) | Mau | `Properties/launchSettings.json`: profile `https` thêm biến `DuLieu__Nguon=Mau` |
| `dotnet run … --launch-profile https-postgresql` | PostgreSql | Profile mới, đặt biến `DuLieu__Nguon=PostgreSql` (không còn mặc định trong `appsettings.json`) |
| `dotnet ef …` | PostgreSql | EF chạy design-time ở môi trường Development nhưng không đọc `launchSettings.json`; `appsettings.json` lại không có `DuLieu:Nguon` (BR-16) → lệnh `dotnet ef` thêm `-- --DuLieu:Nguon=PostgreSql` ở cuối (EF chuyển tham số sau `--` cho `Program`). Cần hỏi 6 |
| Test (`WebApplicationFactory`) | Mau | `ApiFactory` đặt khoá; factory riêng cho đường PostgreSql |
| Môi trường triển khai (Production) | **Bắt buộc khai**, không có mặc định | `appsettings.json` không có mục `DuLieu:Nguon`. Không khai → không khởi động, báo thiếu mục (F00 BR-16, AC-26; người dùng chốt 2026-10-12, câu hỏi mở 39) |
| Máy demo đã triển khai | Mau | Biến môi trường `DuLieu__Nguon=Mau` |
| Máy chạy thật | PostgreSql | Biến môi trường `DuLieu__Nguon=PostgreSql` cùng `ConnectionStrings__DichVuCong` |

Vì sao đặt mặc định Mẫu ở launch profile, không ở `appsettings.Development.json`: EF design-time cũng chạy môi trường Development (user-secrets nạp được là nhờ vậy). Đặt ở `appsettings.Development.json` thì `dotnet ef` sẽ chạy nguồn Mẫu, không có `AppDbContext`, và lệnh migration hỏng.

Kiểm lúc khởi động (`GetValidatedOptions`, như các mục cấu hình khác):

| Tình huống | Kết quả |
|---|---|
| Thiếu `DuLieu:Nguon` (ở mọi môi trường, kể cả Production — không tự chọn nguồn nào), hoặc giá trị khác hai giá trị trên (vd. `Postgres`, `mau`) | Không khởi động; không dữ liệu mẫu nào được phục vụ. Thông báo nêu mục `DuLieu:Nguon` còn thiếu hay sai và hai giá trị hợp lệ (`[Required]`, `[AllowedValues("Mau", "PostgreSql")]`) — AC-26 |
| `PostgreSql`, thiếu chuỗi kết nối | Như cũ: không khởi động, "Thiếu cấu hình ConnectionStrings:DichVuCong.", không in giá trị |
| `Mau`, có hay không có chuỗi kết nối | Khởi động; bỏ qua chuỗi kết nối, không đăng ký `AppDbContext` |
| `Mau`, file dữ liệu mẫu hỏng (chỉ xảy ra khi bản build lỗi) | Không khởi động. Thông báo nêu lý do ngắn (vd. phiên bản định dạng, khoá trùng), không chép nội dung file |

Đăng ký — `Common/Hosting/` (backend-dev):

- `DuLieuOptions` (mục `DuLieu`).
- `AddNguonDuLieu(...)`, gọi trong `AddApiServices`, trả về loại nguồn:
  - Mẫu: `AddDichVuCongDataMau()` + kiểm tra sẵn sàng `du-lieu` (§9.9).
  - PostgreSql: `AddDichVuCongData(GetRequiredConnectionString("DichVuCong"))` + `DbSanSangCheck` (§9.9) thay `AddDbContextCheck`.
- `AddApiServices` gọi `AddChatbot(nguon)` (§9.6).
- `Program.cs` bỏ dòng `AddDichVuCongData` (§1).

### 9.3 Lớp nguồn dữ liệu — `DichVuCong.Data/DuLieu/` (db-dev)

```csharp
public enum LoaiNguonDuLieu { Mau, PostgreSql }

/// <summary>Dữ liệu nhập (F01), chỉ đọc. Không có cau_chua_tra_loi (§9.6). Tên thuộc tính như AppDbContext.</summary>
public interface INguonDuLieu
{
    IQueryable<ThuTuc> ThuTucs { get; }
    IQueryable<LinhVuc> LinhVucs { get; }
    IQueryable<PhanCongLinhVuc> PhanCongLinhVucs { get; }
    IQueryable<NhanSu> NhanSus { get; }
    IQueryable<TrungTam> TrungTams { get; }
    IQueryable<GioLamViec> GioLamViecs { get; }
    IQueryable<LienKet> LienKets { get; }
    IQueryable<ODichVu> ODichVus { get; }
    IQueryable<CauHoiMau> CauHoiMaus { get; }
    IQueryable<CauHoiMauCachHoi> CauHoiMauCachHois { get; }
    IQueryable<ChuDeGoiY> ChuDeGoiYs { get; }
    IQueryable<TuDongNghia> TuDongNghias { get; }
    IQueryable<VietTat> VietTats { get; }
    IQueryable<LanNhap> LanNhaps { get; }
}
```

| Cài đặt | Vòng đời | Mỗi thuộc tính |
|---|---|---|
| `NguonDuLieuPostgreSql(AppDbContext db)` | scoped | `db.<DbSet>.AsNoTracking()` |
| `NguonDuLieuMau(TepDuLieuMau tep)` | singleton | Danh sách trong `tep`, `.AsQueryable()`; navigation đã nối khi nạp (§9.5) |

`TruyVan` — hàm mở rộng trên `IQueryable<T>`, dùng thay các hàm async của EF:

| Hàm | Nguồn PostgreSql (EF) | Nguồn Mẫu |
|---|---|---|
| `DanhSachAsync(ct)` | `ToListAsync` | `ToList()` |
| `DauTienAsync(ct)` | `FirstOrDefaultAsync` | `FirstOrDefault()` |
| `DemAsync(ct)` | `CountAsync` | `Count()` |
| `CoAsync(ct)` | `AnyAsync` | `Any()` |
| `LonNhatAsync(chon, ct)` | `MaxAsync(chon)` | `Max(chon)` |

- Chọn nhánh theo `query.Provider is IAsyncQueryProvider` (provider của EF). Không thêm gói.
- Plan F02–F07 cần hàm khác (vd. tổng) thì db-dev thêm theo cùng mẫu.

DI — `DataServiceCollectionExtensions`:

- `AddDichVuCongData(string connectionString)`: chữ ký giữ nguyên; thêm `AddScoped<INguonDuLieu, NguonDuLieuPostgreSql>()`. Import cũng gọi hàm này, không bị ảnh hưởng.
- `AddDichVuCongDataMau()`: nạp file nhúng ngay khi gọi (lỗi thì ném, khởi động dừng); đăng ký `TepDuLieuMau` và `INguonDuLieu` → `NguonDuLieuMau`, singleton. Không đăng ký `AppDbContext`. Thêm một bản nhận sẵn `TepDuLieuMau` (cho test).

### 9.4 Quy tắc viết truy vấn — mọi chức năng đọc dữ liệu

| # | Quy tắc | Vì sao |
|---|---|---|
| R1 | Service nhận `INguonDuLieu`, không nhận `AppDbContext`. Lấy kết quả bằng hàm `TruyVan`, không dùng `ToListAsync`, `FirstOrDefaultAsync`… của EF | Hàm của EF ném lỗi trên nguồn Mẫu. Test kiến trúc chặn `AppDbContext` trong `DichVuCong.Api` (§9.10) |
| R2 | `Select` thẳng ra DTO trước khi lấy kết quả. Không trả entity, không đọc navigation trên entity đã lấy ra | Nguồn Mẫu trả đúng các đối tượng dùng chung: sửa vào là hỏng dữ liệu của mọi yêu cầu sau. EF không nạp navigation khi không `Select`/`Include`, nguồn Mẫu thì có sẵn — kết quả lệch |
| R3 | Không sắp theo chuỗi trong truy vấn. Sắp theo khoá số hoặc khoá duy nhất (`ThuTu`, `Thu`, `ThuTuThuongGap`). Cần sắp theo tên thì lấy kết quả về rồi sắp trong C# với `StringComparer` ghi rõ. `Take`, `Skip` luôn đứng sau `OrderBy` theo khoá duy nhất | Thứ tự chuỗi của PostgreSQL theo collation của DB, khác thứ tự của .NET |
| R4 | Trong biểu thức LINQ chỉ dùng thuộc tính, phép so sánh, toán tử; không gọi hàm C# tự viết, không `EF.Functions`. **Không `StartsWith` / `EndsWith` / `Contains` trên chuỗi theo văn hoá (hoặc kèm comparer, `StringComparison`, `ignoreCase`) trong LINQ truy vấn trên `IQueryable`**, vì so sánh theo văn hoá khác nhau giữa hai nguồn (EF dịch ra SQL theo collation của DB, nguồn Mẫu so theo .NET). Test `QuyTacTruyVanTests` (`Tests/Data/DuLieu/`) quét văn bản `Api/Features/**/*.cs`; ngoại lệ ghi `// R4-ngoai-le: lý do` cùng dòng hoặc dòng trên. Chuẩn hoá chữ người dùng gõ (`TiengViet.ChuanHoaTimKiem`) trước khi đưa vào truy vấn | EF không dịch được hàm C# (chỉ lỗi ở nguồn PostgreSql); `EF.Functions` không chạy trên nguồn Mẫu |
| R5 | So khớp chữ trên cột `*TimKiem` (đã chuẩn hoá: chữ thường, không dấu) | So sánh, `Contains` trên chuỗi đã chuẩn hoá cho cùng kết quả ở hai nguồn |
| R6 | Ghi dữ liệu và phép riêng của PostgreSQL (trigram, `ON CONFLICT`, `ExecuteDelete`) đặt sau interface riêng của chức năng, mỗi nguồn một cài đặt. Mẫu: `IKhoCauChuaTraLoi` (§9.6) | Phần này không viết chung được |
| R7 | Mỗi service có test hợp đồng chạy trên cả hai nguồn (§9.10) | Bắt chỗ lệch R1–R5 mà review bỏ sót |

### 9.5 File dữ liệu mẫu — `DichVuCong.Data/Mau/` (db-dev)

**Vị trí:** `src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json`, tài nguyên nhúng (`EmbeddedResource`, `LogicalName` cố định) của `DichVuCong.Data.dll`. File thuộc repo (commit khi người dùng bảo); không nằm trong `data-mau/` nên `.gitignore` không bỏ qua.

Chọn tài nguyên nhúng trong `Data`, không chọn file nội dung trong `Api`:

- Không cần cấu hình đường dẫn; không có lỗi "thiếu file" khi triển khai.
- Không nằm trong `wwwroot`, nên không bị phục vụ ra ngoài.
- Một agent sở hữu trọn: định dạng, bộ ghi, bộ đọc, file và test đều của db-dev.
- Đổi lại: `DichVuCong.Data.dll` nặng thêm khoảng 4,6 MB ở cả Api lẫn Import (dữ liệu công khai, đã làm sạch). Đổi dữ liệu phải build lại — cũng là quy trình bình thường: sinh lại, commit, build.

**Định dạng:** JSON UTF-8, xuống dòng LF, thụt lề 2 (git diff đọc được), chữ tiếng Việt để nguyên (không đổi thành mã thoát), enum ghi bằng tên, tên thuộc tính camelCase theo entity. Ví dụ rút gọn:

```json
{
  "phienBan": 1,
  "thoiDiem": "2026-10-12T09:00:00+00:00",
  "ghiChu": "Dữ liệu mẫu cho demo, sinh bằng DichVuCong.DuLieuMau. Không dùng làm dữ liệu thật.",
  "linhVuc": [{ "ma": "ho-tich", "ten": "Hộ tịch", "tenTimKiem": "ho tich" }],
  "thuTuc": [{
    "ma": "1.001193", "ten": "…", "tenTimKiem": "…", "linhVucMa": "ho-tich",
    "thuocDanhMucXa": true, "thuocDanhMucTinh": true, "mucDo": "ToanTrinh",
    "hinhThucNop": ["Trực tuyến", "Bưu chính", "Trực tiếp"], "donViMa": "H53.183", "thuTu": 1, "thuTuThuongGap": 1,
    "trinhTu": [{ "truongHop": null, "noiDung": "…" }],
    "thanhPhanHoSo": [{ "ten": "…", "banChinh": 1, "banSao": null }],
    "ketQua": ["…"], "canCu": [{ "soKyHieu": "…", "trichYeu": "…" }]
  }],
  "phanCongLinhVuc": [],
  "nhanSu": [],
  "trungTam": { "ten": "…", "nguoiChiuTrachNhiem": "(dữ liệu mẫu)", "chucVuNguoiChiuTrachNhiem": "Giám đốc", "email": "cangiuoc@tayninh.gov.vn" },
  "gioLamViec": [{ "thu": 1, "sangTu": "07:00:00", "sangDen": "11:30:00", "chieuTu": "13:30:00", "chieuDen": "17:00:00" }],
  "lienKet": [], "oDichVu": [],
  "cauHoiMau": [{ "thuTu": 1, "cauHoi": "…", "traLoi": "…", "mucTrungTam": null, "maThuTuc": ["1.012784"],
                  "cachHoi": [{ "thuTu": 1, "noiDung": "…", "noiDungTimKiem": "…" }] }],
  "chuDeGoiY": [], "tuDongNghia": [], "vietTat": []
}
```

- File chép đúng các bảng nhập của F01, kể cả cột `*TimKiem`, nên bộ đọc không phải tính lại gì.
- `lan_nhap` không ghi trong file: bộ đọc tạo 4 dòng (`thu-tuc`, `phan-cong`, `trung-tam`, `tro-ly`), `ThoiDiem` = `thoiDiem`, `TenFile` = `du-lieu-mau.json`. `cau_chua_tra_loi` không có trong file.
- Navigation (`ThuTuc.LinhVuc`, `LinhVuc.ThuTucs`, `CauHoiMauCachHoi.CauHoiMau`) gắn `[JsonIgnore]`; bộ đọc nối lại sau khi đọc. EF không dùng thuộc tính này: model và migration không đổi.
- `phienBan`: phiên bản định dạng, hiện là 1. Bộ đọc chỉ nhận đúng phiên bản của mã. Đổi entity mà file cũ không còn đọc đúng → tăng phiên bản, sinh lại file.

**Đọc, ghi** — lớp gốc `TepDuLieuMau`: `Doc(Stream)`, `Ghi(Stream)`, `Nhung` (file nhúng, nạp một lần mỗi tiến trình).

- Đọc và ghi dùng chung một bộ tuỳ chọn JSON; khi đọc có thêm:
  - `UnmappedMemberHandling.Disallow`: thuộc tính lạ → lỗi (bắt cột bị đổi tên, bị bỏ).
  - `RespectNullableAnnotations`: null ở chỗ không cho null → lỗi.
  - `PreferredObjectCreationHandling = Populate`: đọc được danh sách chỉ có `get` (vd. `CauHoiMau.CachHoi`).
- Kiểm như các ràng buộc DB mà truy vấn dựa vào:
  - Khoá không trùng: mã thủ tục, mã lĩnh vực, `Thu` của giờ làm việc, `ThuTu` của từng bảng, `ThuTuThuongGap`, (`CauHoiMauThuTu`, `ThuTu`).
  - `ThuTuc.LinhVucMa` có trong danh sách lĩnh vực.
  - Không có hoặc có đúng một `trungTam`.
- Lỗi → `InvalidDataException` nêu lý do ngắn (phiên bản, khoá trùng, khoá ngoại thiếu, vị trí JSON lỗi), không chép nội dung file.
- Ghi: LF (`NewLine = "\n"`), thứ tự thuộc tính theo khai báo → cùng dữ liệu ra cùng file, từng byte.

**Sinh file** — `DichVuCong.DuLieuMau` thêm lệnh `xuat-json`; lệnh xuất Excel giữ nguyên:

```
dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- xuat-json data-mau src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json --nguoi-chiu-trach-nhiem "(dữ liệu mẫu)"
```

1. Sinh 4 file Excel như lệnh hiện có, vào một thư mục tạm.
2. Đọc và kiểm bằng chính đường nhập của Import (`DocExcel` + `KiemTra*`, như `nhap tat-ca`; đổi `NhapDuLieu.DocTatCa` sang `internal`). Có lỗi → in lỗi ra stderr, mã 1, không ghi file.
3. Lấy dữ liệu đã chuẩn hoá — đúng các entity mà Import sẽ ghi vào DB — dựng `TepDuLieuMau` (`thoiDiem` = giờ chạy lệnh) rồi ghi, đè file cũ. Xoá thư mục tạm.

Nhờ bước 2, file chứa đúng dữ liệu mà `nhap tat-ca` ghi vào DB từ cùng nguồn: cùng làm sạch chữ (F01 BR-18), cột tìm kiếm, mã lĩnh vực, số bản (F01 Q10), thứ tự.

**Làm sạch** — theo `du-lieu.md` mục "Bản đầu của dữ liệu thật"; test ở T27 chặn từng dòng:

| Phần | Trong file |
|---|---|
| Phân công quầy, nhân sự | Rỗng |
| Người chịu trách nhiệm | Nhãn giữ chỗ, truyền qua `--nguoi-chiu-trach-nhiem` (Cần hỏi 2 — đề xuất "(dữ liệu mẫu)"). Nhãn nằm trong file dữ liệu và trong lệnh sinh, không nằm trong mã. Chức vụ "Giám đốc", cơ quan chủ quản "UBND xã Cần Giuộc" như bản đầu |
| Email | `cangiuoc@tayninh.gov.vn` |
| Mã đơn vị trên Cổng DVC | `H53.183`, ở mục Trung tâm và mọi thủ tục có đơn vị |
| Thủ tục thường gặp | 16 mã, đúng thứ tự `du-lieu.md` |
| Trợ lý | 11 câu hỏi mẫu (6 về tách thửa, 5 về Trung tâm), 6 chủ đề gợi ý, 45 từ đồng nghĩa, 12 viết tắt |
| Bản đồ, mạng xã hội, ghi chú ngày nghỉ | Trống |
| Chữ | Không còn U+200B–U+200F, U+FEFF; không còn "Vàm Cỏ", "H53.186" |

**Kích thước, thời gian nạp** — ước tính từ `data-mau/thu-tuc.json` (408 thủ tục, 7.213 dòng con), đã bỏ các trường không nhập:

- File: khoảng 4,6 MB khi thụt lề (4,3 MB nếu không), khoảng 0,4 MB khi nén gzip. Trong git: khoảng 0,4 MB cho mỗi lần sinh lại có đổi.
- Nạp lúc khởi động: ước 0,2–0,5 giây (lần đầu, gồm JIT); bộ nhớ khoảng 15–30 MB.
- T27 đo thật và báo. Ngưỡng: nạp ≤ 1 giây trên máy dev.

### 9.6 Ghi dữ liệu: câu chưa trả lời (chatbot-dev)

```csharp
// Features/Chatbot/IKhoCauChuaTraLoi.cs
public interface IKhoCauChuaTraLoi
{
    /// noiDung đã che thông tin cá nhân (F06), dài tối đa CauChuaTraLoi.DoDaiToiDa.
    /// Gộp theo ChuanHoaTimKiem(noiDung): đã có thì SoLanGap + 1, LanGapCuoi = bây giờ.
    Task GhiAsync(string noiDung, CancellationToken ct);

    /// Xoá dòng có LanGapCuoi < moc; trả số dòng đã xoá.
    Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct);
}
```

| Cài đặt | Vòng đời | Ghi | Xoá |
|---|---|---|---|
| `KhoCauChuaTraLoiPostgreSql(AppDbContext, TimeProvider)` | scoped | Một câu `INSERT … ON CONFLICT (khoa_gop) DO UPDATE SET so_lan_gap = cau_chua_tra_loi.so_lan_gap + 1, lan_gap_cuoi = EXCLUDED.lan_gap_cuoi`, qua `ExecuteSqlAsync` với chuỗi nội suy (tham số hoá, không nối chuỗi — F01 §8.1) | `ExecuteDeleteAsync`, chuyển từ `XoaCauChuaTraLoiHetHan` |
| `KhoCauChuaTraLoiMau(TimeProvider)` | singleton | `Dictionary` theo khoá gộp, có `lock`. Tối đa `SoDongToiDa` = 1.000 dòng; đầy mà gặp câu mới → bỏ dòng có `LanGapCuoi` cũ nhất | Bỏ các dòng `LanGapCuoi < moc` |

- `KhoCauChuaTraLoiPostgreSql` có trần mềm `Chatbot:KhoCauChuaTraLoi:SoDongToiDa` (mặc định 50.000): đã đầy thì từ chối ghi câu **mới** (câu đã có vẫn được cộng số lần gặp), để bị dội câu hỏi không làm phình bảng. Việc xoá sau 90 ngày làm trống dần. Giá trị kiểm khoảng hợp lệ lúc khởi động như các mục cấu hình khác. Kho Mẫu giữ trần cố định 1.000 dòng (bỏ dòng cũ nhất).
- Câu dài hơn `CauChuaTraLoi.DoDaiToiDa` → `ArgumentOutOfRangeException` ở cả hai kho (PostgreSQL vốn chặn bằng CHECK; hai kho phải báo lỗi giống nhau).
- Nguồn Mẫu: câu chưa trả lời mất khi tắt API, không xuất được — lệnh `xuat` của Import chỉ chạy với DB. 1.000 dòng × 500 ký tự ≈ 1 MB: chặn phình bộ nhớ khi bị dội câu hỏi, cùng với giới hạn 60 câu/phút/IP.
- Việc xoá sau 90 ngày **chạy trên bộ nhớ**, không tắt: `XoaCauChuaTraLoiHetHan` giữ lịch (lúc khởi động, rồi mỗi giờ) và mốc (`bây giờ − CauChuaTraLoi.ThoiGianGiu`), chỉ đổi chỗ xoá sang `IKhoCauChuaTraLoi.XoaQuaHanAsync`, lấy trong scope. Một đường mã, một bộ test cho hai nguồn.
- `AddChatbot(LoaiNguonDuLieu nguon)`: đăng ký kho theo nguồn, việc định kỳ, `TimeProvider` (TryAdd như cũ).
- F06 gọi `GhiAsync` sau khi che thông tin cá nhân (F06 BR-7, BR-8), không tự viết câu ghi.

### 9.7 Trợ lý tìm gần đúng (F06 — làm trong plan F06)

- Tìm gần đúng đặt sau interface riêng của trợ lý (vd. `ITimGanDung`, chatbot-dev), mỗi nguồn một cài đặt. Nguồn PostgreSql: pg_trgm, dùng index GIN đã có. Nguồn Mẫu: bản C# cùng thuật toán pg_trgm.
- Bản C#:
  - Tách từ ở mọi ký tự không phải chữ hay số; mỗi từ thêm hai dấu cách ở đầu, một ở cuối; lấy các bộ ba ký tự liên tiếp, bỏ trùng.
  - `similarity = chung / (n1 + n2 − chung)`, tính bằng `float` như kiểu `real` của PostgreSQL. Dùng cùng ngưỡng.
  - Xếp hạng theo điểm giảm dần, rồi theo khoá duy nhất (`ThuTu`, `Ma`) — ở cả hai nguồn.
- Vì sao có thể lệch nhẹ:
  - PostgreSQL xét "chữ hay số" theo locale của DB, .NET theo Unicode. Chỉ khác với ký tự ngoài `[a-z0-9]` còn sót sau `ChuanHoaTimKiem` (vd. dấu gạch "–").
  - Làm tròn số thực sát ngưỡng.
- Mức chấp nhận — test hợp đồng của F06, bộ thử ít nhất 30 câu (gõ sai chính tả, không dấu, viết tắt, câu về Trung tâm):
  - Câu trả lời được chọn (kết quả đứng đầu) giống nhau ở hai nguồn: 100% bộ thử.
  - Chuỗi chỉ gồm `[a-z0-9 ]`: điểm bằng nhau (sai số ≤ 0,000001), danh sách xếp hạng giống nhau.
  - Được khác: ứng viên có điểm cách ngưỡng ≤ 0,001, hoặc chuỗi có ký tự ngoài `[a-z0-9 ]`. Tester ghi từng ca vào `result/test.md` của F06.
  - Khác ngoài các trường hợp trên là lỗi.
- Cần hỏi 3: dùng một bản C# cho cả hai nguồn để hết lệch. **Đã chốt (a) ở plan F06 (2026-10-13):** một thuật toán C# (độ phủ có trọng số IDF + sửa lỗi gõ theo từng từ) cho cả hai nguồn, không dùng `pg_trgm`; mức chấp nhận ở trên không còn áp dụng, tiêu chí thành "JSON đáp án giống hệt giữa hai nguồn" (plan F06 §1 Q3, §9).

### 9.8 Phiên bản dữ liệu, ngày cập nhật, cache

- `PhienBanDuLieu` đọc `max(ThoiDiem)` của `LanNhaps` qua `INguonDuLieu` + `LonNhatAsync`: một đường mã cho hai nguồn.
  - PostgreSql: như F00 T18.
  - Mẫu: 4 dòng `lan_nhap` do bộ đọc tạo đều mang `thoiDiem` của file → phiên bản = `thoiDiem.UtcTicks`.
- "Dữ liệu thủ tục cập nhật ngày" (F08 BR-6) đọc dòng `lan_nhap` loại `thu-tuc` → nguồn Mẫu cho ngày Việt Nam của `thoiDiem` (vd. `2026-10-12T09:00Z` → 12/10/2026). Chế độ demo vẫn hiện dòng này, không để trống (F00 BR-16, F08 AC-22). Dữ liệu đặc tả của trang chủ có đủ 6 yếu tố, `DC.date` là ngày đó (qua `LayDacTaAsync`, cùng đường với PostgreSql). Không có dòng nào báo "bản chạy thử" (Cần hỏi 5).
- ETag = phiên bản + băm ngắn của mã bản build (từ `ModuleVersionId`, không dùng `AssemblyInformationalVersion` vì có SHA commit; sửa 2026-10-13), không đổi cách tính. Sinh lại file → `thoiDiem` mới → ETag mới. Triển khai bản build mới → mã bản build mới. Trong một tiến trình, dữ liệu Mẫu không đổi, nên không có lúc thấy dữ liệu cũ. Output cache và 304 chạy như với PostgreSql.
- Sửa 2026-10-13: phiên bản dữ liệu giữ trong bộ nhớ `Caching:PhienBanDuLieu` giây (mặc định 3, `BoNhoPhienBanDuLieu` singleton), và mỗi yêu cầu chỉ đọc một lần (`PhienBanDuLieu` scoped), thay cho một truy vấn ở mỗi bước pipeline. Hệ quả: nhập xong, API danh mục thấy dữ liệu mới sau tối đa chừng đó. Mã thủ tục sai định dạng bị chặn ngay ở route (`{ma:maThuTuc}`), không chạm nguồn dữ liệu. Test mặc định đặt TTL = 0 (`ApiFactory.PhienBanDuLieuGiu`). Kestrel trả 400 thân rỗng cho `%00` trong đường dẫn, trước pipeline ứng dụng: chấp nhận.

### 9.9 `/health/ready`, khởi động, log

- PostgreSql: `DbSanSangCheck` thay `AddDbContextCheck<AppDbContext>`: tự cắt thời gian chờ ở `Hosting:ReadyTimeout` (mặc định 1 giây) để kết quả trả trong ≤ 2 giây (BR-13) kể cả khi DB không trả lời.
- Mẫu: kiểm tra `du-lieu` (tag `ready`) — tốt khi `INguonDuLieu` có dòng `lan_nhap`, tức dữ liệu đã nạp.
  - File nạp ngay lúc đăng ký dịch vụ, trước khi máy chủ nhận yêu cầu. Nạp lỗi thì API không chạy; API đã chạy là đã sẵn sàng.
  - Kết quả vẫn chỉ ghi tốt hoặc không tốt (BR-13). `/health/live` không đổi.
- **Host:** nguồn Mẫu bỏ host filtering của framework (`AllowedHosts`); `KiemTraHostMiddleware` thay thế, đứng ngay sau `SecurityHeadersMiddleware` (nên response lỗi vẫn có đủ header bảo mật) và trả ProblemDetails 400 (`du-lieu-khong-hop-le`, có `maTraCuu`) khi `Host` không hợp lệ. Test: `Host` sai → 400 có header bảo mật, không lộ chi tiết.
- Lúc khởi động ghi một dòng log mức Information nêu nguồn đang dùng; với nguồn Mẫu kèm phiên bản định dạng, `thoiDiem`, số thủ tục. Không ghi chuỗi kết nối.

### 9.10 Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Data/Mau/` | db-dev | Đọc, ghi, kiểm, nối navigation; file nhúng: số bản ghi, làm sạch, đọc rồi ghi lại giống từng byte |
| `Tests/Data/DuLieu/` | db-dev | `NguonDuLieuMau`, 5 hàm `TruyVan` trên nguồn Mẫu; DI hai nguồn |
| `Tests/Api/` | backend-dev | `ApiFactory` mặc định nguồn Mẫu, không có chuỗi kết nối; factory PostgreSql (chuỗi giả) cho test đường DB; cấu hình sai; `/health/ready` hai nguồn; phiên bản và ETag trên file nhúng; `GET /api/trung-tam` trên file nhúng; test kiến trúc (không type nào trong `DichVuCong.Api` nhận `AppDbContext` qua constructor, trừ `KhoCauChuaTraLoiPostgreSql`); test hợp đồng service trên nguồn Mẫu |
| `Tests/Api/Chatbot/` | chatbot-dev (thư mục test có từ F01 T18) | Kho Mẫu; kho PostgreSql (`DbGiaLap`); việc định kỳ với kho giả |
| `Tests/Integration/` | tester | Tương đương dữ liệu hai nguồn; lớp con PostgreSql của test hợp đồng; nhánh EF của `TruyVan`; kho PostgreSql với DB thật |

- **Test hợp đồng:** một lớp trừu tượng `<Service>Contract` chứa các ca, có hàm trừu tượng tạo `INguonDuLieu` từ một `TepDuLieuMau`.
  - Lớp con `…TrenMau` ở `Tests/Api` (dev của service).
  - Lớp con `…TrenPostgreSql` ở `Tests/Integration` (tester): tạo DB riêng, chạy migration, chèn cùng bộ dữ liệu bằng `AppDbContext`.
  - Cùng ca, cùng kỳ vọng. Bộ dữ liệu thử dựng bằng C# ở `Tests/Api/DuLieuThu/`.
- **Tương đương dữ liệu** (tester): chèn nội dung file nhúng vào DB riêng → với từng tập trong 14 tập, đọc qua `NguonDuLieuPostgreSql` và `NguonDuLieuMau` bằng cùng một phép `Select` (sắp theo khoá) → tuần tự hoá JSON → giống nhau.
- Bộ 333 test hiện có vẫn xanh. Các test API đang dùng service giả giữ nguyên.

### 9.11 Ảnh hưởng tới plan đã có

| Plan, task | Đổi | Task |
|---|---|---|
| F00 §1: `Program.cs`, `Hosting/`, health, cache, test | Đã sửa tại chỗ theo §9.2, §9.8, §9.9 | T29 |
| F00 T18 `IPhienBanDuLieu` | Đọc qua `INguonDuLieu` | T29 |
| F08 T01 `ThongTinTrungTamService` | Đọc qua `INguonDuLieu` (F08 plan §2, §3.1 đã sửa) | F08 T11 |
| F08 T02 `TrangHtml` | Không đổi: lấy dữ liệu qua service | — |
| F01 T18 việc xoá định kỳ | Gọi `IKhoCauChuaTraLoi` | T28 |
| F01 T19 gọi `AddChatbot()` | Thành `AddChatbot(nguon)`, gộp vào T29 | T29 |
| F01 Import, migration, `AppDbContext` | Không đổi. `xuat` chỉ chạy với DB | — |
| F01 `DuLieuMau` | Thêm `xuat-json`; lệnh Excel giữ nguyên | T27 |
| F02–F07 (chưa có plan) | Viết service qua `INguonDuLieu` ngay từ đầu, theo §9.4. Ghi dữ liệu và phép riêng của PostgreSQL đặt sau interface riêng, hai cài đặt. Test hợp đồng hai nguồn. F06: §9.6, §9.7. F04, F05 cần sắp lĩnh vực theo tên: sắp trong C# (R3) | Plan từng chức năng |

### 9.12 Lệnh chạy

Để cập nhật mục Lệnh của `CLAUDE.md`:

```
# Demo — nguồn Mẫu, không cần PostgreSQL
cd src/FrontEnd && npm ci && npm run build          # một lần, và mỗi khi FE đổi
dotnet run --project src/BackEnd/DichVuCong.Api     # https://localhost:7157

# Nguồn PostgreSQL
dotnet run --project src/BackEnd/DichVuCong.Api --launch-profile https-postgresql

# Môi trường triển khai: BẮT BUỘC khai DuLieu__Nguon=Mau (demo) hoặc PostgreSql (chạy thật); thiếu thì API không khởi động

# dotnet ef: thêm khai nguồn ở cuối, vd.
dotnet ef database update --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api -- --DuLieu:Nguon=PostgreSql

# Sinh lại file dữ liệu mẫu (cần data-mau/)
dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- xuat-json data-mau src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json --nguoi-chiu-trach-nhiem "(dữ liệu mẫu)"
```

Lệnh `dotnet test` và công cụ nhập giữ nguyên; `dotnet ef …` thêm phần `-- --DuLieu:Nguon=PostgreSql` (Cần hỏi 6).

### 9.13 Bảo mật, hiệu năng

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Không đổi: API chỉ trả DTO như cũ. File mẫu không nằm trong `wwwroot`, không có endpoint nào trả file |
| Dữ liệu cá nhân trong file | Không phân công, không nhân sự, không họ tên thật — test T27 chặn |
| Bí mật | Nguồn Mẫu không cần chuỗi kết nối. Nguồn PostgreSql như cũ: chỉ user-secrets hoặc biến môi trường |
| Cấu hình sai | Dừng khởi động, nêu tên mục (§9.2) |
| Câu chưa trả lời ở nguồn Mẫu | Chỉ câu đã che (F06), trong bộ nhớ, tối đa 1.000 dòng, không ghi nội dung vào log |
| SQL | Ghi ở nguồn PostgreSql dùng `ExecuteSqlAsync` với chuỗi nội suy (tham số hoá), không nối chuỗi |
| Nguồn Mẫu trên máy chủ thật | Chỉ khi khai tường minh `DuLieu__Nguon=Mau` (máy demo; chế độ demo không dùng để mở cho dân — BR-16). Không khai thì không khởi động, nên không lộ dữ liệu mẫu do quên cấu hình |

| Hiệu năng | Ảnh hưởng |
|---|---|
| FE, ngân sách JS | Không đổi |
| Khởi động, nguồn Mẫu | Thêm 0,2–0,5 giây (ước), ≤ 1 giây (T27 đo); bộ nhớ thêm 15–30 MB |
| Mỗi yêu cầu, nguồn Mẫu | Đọc trong bộ nhớ, kể cả phiên bản; nhanh hơn PostgreSql |
| Mỗi yêu cầu, nguồn PostgreSql | Như cũ: cùng SQL, thêm một lớp gọi hàm |
| Kích thước | `DichVuCong.Data.dll` thêm khoảng 4,6 MB; repo thêm khoảng 0,4 MB (nén trong git) |

Không thêm gói NuGet hay npm.

### 9.14 Truy vết — yêu cầu của kế hoạch 6.0

| Yêu cầu | Mục | Task |
|---|---|---|
| 1. Lớp nguồn dữ liệu; hai nguồn cho cùng kết quả; cùng bộ test chạy trên nguồn Mẫu | §9.1, §9.3, §9.4, §9.10 | T26, F08 T11, T29, T31 |
| 1. Trợ lý tìm gần đúng ở hai nguồn, mức lệch chấp nhận | §9.7 | Plan F06 |
| 2. Cấu hình, mặc định, báo lỗi lúc khởi động | §9.2 | T29 |
| 3. File dữ liệu mẫu: vị trí, định dạng, sinh, làm sạch, kích thước, thời gian nạp | §9.5 | T25, T27 |
| 4. Ghi ở nguồn Mẫu; xoá sau 90 ngày; `xuat` chỉ với DB | §9.6 | T28 |
| 5. `IPhienBanDuLieu`, ngày cập nhật, ETag | §9.8 | T29 |
| 6. `/health/ready` | §9.9 | T29 |
| 7. Lệnh chạy demo | §9.12 | T29 (chạy tay), T31 |
| 8. Ảnh hưởng tới plan đã có | §9.11 | F08 T11, T28, T29 |
| 9. Chia task | `tasks.md` T25–T31; F08 `tasks.md` T11 | — |

### 9.15 Rủi ro

1. **LINQ chạy được trên nguồn Mẫu nhưng EF không dịch được** (hoặc ngược lại) → chỉ lộ khi chạy với PostgreSQL. Giảm thiểu: quy tắc §9.4; test hợp đồng chạy hai nguồn (T31 và tester của từng chức năng); review.
2. **Đối tượng dùng chung ở nguồn Mẫu bị sửa** → dữ liệu hỏng cho mọi yêu cầu sau, tới khi khởi động lại. Giảm thiểu: R2 (luôn `Select` ra DTO); review. Chưa làm entity bất biến vì entity còn dùng chung với EF.
3. **File mẫu lệch model khi entity đổi.** Giảm thiểu: thuộc tính lạ, null sai chỗ → lỗi khi đọc; test đọc rồi ghi lại giống từng byte (T27) báo khi entity có thêm thuộc tính; phiên bản định dạng.
4. **Chỉ máy có `data-mau/` mới sinh lại được file** (`data-mau/` không commit) — như F01 rủi ro 5.
5. **Dữ liệu mẫu trông như thật:** địa chỉ, số điện thoại, email là của xã; thủ tục lấy từ Vàm Cỏ, chưa được Trung tâm rà. Người xem demo có thể tin là chính thức. Giảm thiểu: nhãn "(dữ liệu mẫu)" ở chân trang; Cần hỏi 5.
6. **Profile `https` mặc định nguồn Mẫu:** người làm DB quên chọn profile PostgreSql sẽ thấy dữ liệu mẫu. Giảm thiểu: log khởi động ghi rõ nguồn.
7. **Môi trường triển khai không có mặc định nguồn:** quên khai `DuLieu__Nguon` → API không khởi động, báo thiếu mục. Lỗi lộ ngay, không có chuyện trang thật chạy âm thầm bằng dữ liệu mẫu (đã chốt, Cần hỏi 1).
8. **Câu chưa trả lời ở nguồn Mẫu mất khi tắt API** — đúng quyết định của người dùng.
9. **F06 lệch kết quả giữa hai nguồn** nếu giữ pg_trgm (§9.7, Cần hỏi 3).
10. **Thư viện nặng thêm:** `DichVuCong.Data.dll` thêm khoảng 4,6 MB, cả ở công cụ nhập; không ảnh hưởng thời gian chạy của Import.

### 9.16 Cần hỏi

Làm theo đề xuất nếu người dùng không phản đối. Người dùng chọn khác thì planner sửa plan trước.

| # | Câu hỏi | Phương án | Đề xuất | Ảnh hưởng |
|---|---|---|---|---|
| 1 | Bản publish (Production) mặc định nguồn nào? | **Đã chốt 2026-10-12 (câu hỏi mở 39, F00 BR-16, AC-26): không mặc định.** Production thiếu `DuLieu__Nguon` → không khởi động, báo tên mục thiếu. Máy dev (profile `https`) mặc định Mau. (Hai phương án cũ — PostgreSql hay Mau làm mặc định — bỏ) | Đã chốt | T29 (`appsettings.json` không có mục `DuLieu`; test AC-26) |
| 2 | Nhãn giữ chỗ cho người chịu trách nhiệm trong file mẫu | Chân trang hiện "<họ tên> – <chức vụ>" (F08 B4), chức vụ bản đầu là "Giám đốc". (a) "(dữ liệu mẫu)" → "Người chịu trách nhiệm nội dung: (dữ liệu mẫu) – Giám đốc". (b) "Giám đốc Trung tâm (dữ liệu mẫu)" → "… Giám đốc Trung tâm (dữ liệu mẫu) – Giám đốc", lặp chữ "Giám đốc" | (a) | T27 (tham số lệnh sinh) |
| 3 | Trợ lý tìm gần đúng thế nào ở hai nguồn? | (a) Một bản C# cho cả hai nguồn: đọc câu hỏi mẫu, tên thủ tục qua `INguonDuLieu`, giữ trong bộ nhớ theo phiên bản dữ liệu (§9.8). Kết quả giống hệt, một bộ mã; index GIN chưa dùng tới (vẫn giữ). Khoảng 1.000 tên và 100 cách hỏi: vài mili giây mỗi câu. (b) pg_trgm ở PostgreSql, bản C# ở nguồn Mẫu, chấp nhận lệch theo §9.7: hai bộ mã | (a). **Đã chốt ở plan F06 (2026-10-13): chọn (a)**; không chặn 6.0 | Plan F06 |
| 4 | Demo có cần đúng một lệnh, kể cả FE? | (a) Giữ hai bước: build FE một lần, rồi `dotnet run`. (b) `DichVuCong.Api.csproj` tự chạy `npm ci && npm run build` khi chưa có `wwwroot/index.html`: build BE phụ thuộc Node, chậm hơn, khó chạy CI | (a) | Không có task |
| 5 | Trang có báo "đang dùng dữ liệu mẫu" khi chạy nguồn Mẫu? | **Đã chốt 2026-10-12 (F00 BR-16, AC-26): không có dấu hiệu "bản chạy thử" nào trên trang**, giao diện giống hệt chạy thật; API không trả cờ nguồn. Nhãn "(dữ liệu mẫu)" chỉ là chữ trong dữ liệu người chịu trách nhiệm (Cần hỏi 2), không phải dấu hiệu của trang | Đã chốt | Không có task; test AC-26 kiểm không có chữ "chạy thử"/"dữ liệu mẫu" ngoài dữ liệu người chịu trách nhiệm |
| 6 | (thêm 2026-10-12) `dotnet ef` cần khai nguồn vì Production-like không mặc định | (a) Thêm `-- --DuLieu:Nguon=PostgreSql` vào các lệnh `dotnet ef` (cập nhật mục Lệnh của `CLAUDE.md`). (b) Thêm `IDesignTimeDbContextFactory` trong `Data` đọc user-secrets/biến môi trường: lệnh `dotnet ef` giữ nguyên, nhưng thêm mã và một chỗ đọc chuỗi kết nối nữa | (a): đơn giản nhất | T29 (ghi lệnh vào báo cáo) |

### Đã được spec ghi (2026-10-12)

ba-analyst đã ghi vào spec các điểm trước đây plan nêu: F00 BR-16 (hai chế độ, bắt buộc khai chế độ ở môi trường triển khai, không dấu hiệu bản chạy thử), BR-5, BR-13 (chỉ chạy thật kiểm kết nối), AC-26; F08 BR-6, AC-22 (dòng ngày cập nhật ở chế độ demo = ngày của bộ mẫu). Plan khớp: §9.2, §9.8, §9.9, Cần hỏi 1 và 5. Tester kiểm AC-7, AC-14 với nguồn PostgreSql; AC-26 với cả ba cách khai.

### 9.17 Reverse proxy và IP máy gọi (thêm 2026-10-13, theo review F06)

Giới hạn tốc độ đếm theo IP của kết nối tới Kestrel, và IPv6 gộp theo tiền tố /64 (IPv4-mapped `::ffff:a.b.c.d` coi là IPv4) cho cả ba chính sách (danh mục, trợ lý, health). Mô hình triển khai (IIS, Docker, reverse proxy) chưa chốt — câu hỏi mở 10 — nên **`X-Forwarded-*` mặc định không được đọc**.

Cách bật (khi biết mô hình triển khai): khai mục `Hosting:ForwardedHeaders` bằng biến môi trường hoặc cấu hình triển khai, vd.

```
Hosting__ForwardedHeaders__KnownProxies__0=10.0.0.5          # IP của proxy
Hosting__ForwardedHeaders__KnownNetworks__0=172.18.0.0/16    # hoặc cả mạng (CIDR), vd. mạng Docker
Hosting__ForwardedHeaders__ForwardLimit=1                    # số tầng proxy đứng trước API (1–5)
```

- Chỉ bật `UseForwardedHeaders` khi có ít nhất một proxy hoặc mạng được khai. Danh sách mặc định của framework (loopback) bị xoá: chỉ nguồn đã khai được tin.
- Khi bật, nguồn tin cậy được đọc `X-Forwarded-For` (IP gốc cho giới hạn), `X-Forwarded-Proto` (HSTS, redirect HTTPS) và `X-Forwarded-Host` (lọc `AllowedHosts`, `og:url`). Header từ nguồn khác bị bỏ qua. Cấu hình sai (không phải IP/CIDR, `ForwardLimit` ngoài 1–5) làm API không khởi động và nêu tên mục.
- Rủi ro nếu không bật khi có proxy: cả xã dùng chung một IP (IP của proxy) nên chung một bộ đếm (trợ lý 60 câu/phút cho tất cả). Rủi ro nếu khai quá rộng (vd. `0.0.0.0/0`) hoặc khai sai proxy: ai cũng giả được IP bằng `X-Forwarded-For` để lách giới hạn, giả scheme/host. Chỉ khai đúng IP/mạng của proxy; proxy phải ghi đè (không nối thêm) header từ client nếu `ForwardLimit` = 1.
- Đừng đặt biến môi trường `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` (có sẵn ở một số môi trường như Azure App Service/IIS tích hợp): cơ chế đó của framework tin mọi nguồn, bỏ qua danh sách trên.
- Chưa tự quyết: giá trị thật của `KnownProxies`/`KnownNetworks` và có bật hay không — chờ câu hỏi mở 10.
