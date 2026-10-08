---
id: F00
ten: Khung hệ thống
nguon: .specify/ke-hoach.md — giai đoạn 1, 4, 5 (duyệt 2026-10-08)
---

# F00 · Khung hệ thống — kế hoạch kỹ thuật

Không có spec nghiệp vụ: đây là hạ tầng kỹ thuật cho F01–F09. Mọi chức năng sau phải theo đúng cấu trúc ở đây. Quy ước chung (bảo mật, hiệu năng, đặt tên) ở `CLAUDE.md`.

## 1. Backend — `src/BackEnd/`

### Solution

| Project | Loại | Tham chiếu | Chứa |
|---|---|---|---|
| `DichVuCong.Data` | classlib | — | `AppDbContext`, `Entities/`, `Configurations/`, `Migrations/`, `Text/TiengViet.cs` |
| `DichVuCong.Api` | web | Data | `Program.cs`, `Common/`, `Features/` |
| `DichVuCong.Import` | console | Data | công cụ nhập Excel |
| `DichVuCong.Tests` | xUnit v3 | Api, Data | test đơn vị + `WebApplicationFactory` |

- Phụ thuộc một chiều: `Api → Data`, `Import → Data`. `Data` không tham chiếu ASP.NET Core.
- `Directory.Build.props` (đã có): net10.0, Nullable, ImplicitUsings, cảnh báo = lỗi, `AnalysisLevel latest`, `EnforceCodeStyleInBuild`, lockfile, bản Release không có `.pdb`.
- `Directory.Packages.props` (đã có, đủ gói cho F00): version tập trung. Thêm gói thì thêm `PackageVersion` ở đây và ghi lý do trong báo cáo.

### `DichVuCong.Data` — db-dev

- `AppDbContext`:
  - `HasPostgresExtension("unaccent")`, `HasPostgresExtension("pg_trgm")`.
  - `ApplyConfigurationsFromAssembly` — mỗi entity một `IEntityTypeConfiguration<T>` trong `Configurations/`.
- `DataServiceCollectionExtensions.AddDichVuCongData(this IServiceCollection services, string connectionString)`:
  - `AddDbContextPool<AppDbContext>` + `UseNpgsql` + `UseSnakeCaseNamingConvention`.
  - Chữ ký hàm giữ nguyên — `Program.cs` của Api và Import gọi nó.
- Migration đầu `KhoiTao`: chỉ tạo 2 extension.
- `Text/TiengViet.cs` (static):
  - `BoDau(string)`: chuẩn hoá Unicode NFD → bỏ dấu kết hợp → `đ/Đ` → `d/D` → trả về NFC.
  - `ChuanHoaTimKiem(string)`: `BoDau` → chữ thường (invariant) → gộp khoảng trắng → trim.
  - Dùng ở công cụ nhập (tính cột tìm kiếm) và ở API (chuẩn hoá câu hỏi). FE có bản tương đương — hai bên phải cho cùng kết quả với bộ mẫu §4.

### `DichVuCong.Api` — backend-dev

`Program.cs` chỉ ghép extension, không chứa logic:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.AddApiHosting();                                  // Kestrel: tắt header Server, giới hạn kích thước body
builder.Services.AddApiServices(builder.Configuration);   // controller, ProblemDetails, rate limit, nén, cache, health, OpenAPI
builder.Services.AddDichVuCongData(builder.Configuration.GetRequiredConnectionString("DichVuCong"));
var app = builder.Build();
app.UseApiPipeline();
app.MapApiEndpoints();
app.Run();
```

Tên hàm có thể khác, nhưng `Program.cs` phải giữ đúng hình dạng này.

`Common/`:

| Thư mục | Nội dung |
|---|---|
| `Hosting/` | Các extension ở trên; đọc chuỗi kết nối — thiếu thì dừng khởi động với thông báo nêu tên khoá, không in giá trị |
| `Security/` | Middleware header bảo mật; giá trị CSP và các header đặt ở **một** chỗ, đúng như `CLAUDE.md` |
| `Errors/` | `IExceptionHandler` → ProblemDetails; ngoài Development không có chi tiết lỗi |
| `RateLimiting/` | Hằng tên policy `danh-muc`, `tro-ly`; ngưỡng đọc từ cấu hình `RateLimiting:DanhMuc`, `RateLimiting:TroLy` (số yêu cầu / phút / IP) |
| `Caching/` | Output cache policy `danh-muc`; thời gian từ cấu hình |

Thứ tự pipeline:

1. Exception handler
2. HSTS (ngoài Development) → HTTPS redirection
3. Header bảo mật
4. Response compression (Brotli, Gzip)
5. Static files: file có hash → cache 1 năm `immutable`; `index.html` → `no-cache`
6. Routing → Rate limiter → Output cache
7. Controller, health check
8. Fallback `index.html` cho mọi đường dẫn không bắt đầu bằng `/api` hoặc `/health`

Endpoint của khung:

- `/health/live` — không kiểm DB.
- `/health/ready` — kiểm kết nối DB.
- OpenAPI (`MapOpenApi`) chỉ ở Development.

Chưa bật ForwardedHeaders: phụ thuộc cách triển khai (câu hỏi mở 10). Khi bật, rate limit theo IP mới đúng sau reverse proxy.

Cấu hình:

- `appsettings.json`: không có secret; có `RateLimiting`, `Caching`, giới hạn body.
- `Properties/launchSettings.json`: https://localhost:7157, http://localhost:5157.
- `Features/`: trống cho tới F01.

### `DichVuCong.Import` — db-dev

Console dùng Generic Host: cấu hình (appsettings + user-secrets + biến môi trường) → DI → `AddDichVuCongData`. Đợt này chỉ in hướng dẫn lệnh; lệnh thật làm ở F01.

### `DichVuCong.Tests`

| Thư mục | Agent | Test |
|---|---|---|
| `Api/` | backend-dev | `/health/live` trả 200, có đủ header bảo mật và CSP; lỗi không bắt được → ProblemDetails, không lộ stack trace (môi trường Production) |
| `Data/` | db-dev | `TiengViet` theo bộ mẫu §4 |
| `Integration/` | tester | (sau) |

Test không phụ thuộc DB local: `WebApplicationFactory` cấp chuỗi kết nối giả; `/health/live` không chạm DB.

## 2. Frontend — `src/FrontEnd/` — ui-core-dev

Đợt này chỉ làm hạ tầng. `tokens.css`, font và component lõi làm sau khi `.specify/design-system.md` được duyệt.

```
src/FrontEnd/
  index.html                  # lang="vi", không script/style inline
  package.json                # engines: node >= 20.19
  vite.config.ts
  eslint.config.js
  tsconfig*.json
  playwright.config.ts
  src/
    main.tsx
    app/                      # App, providers (QueryClient), router (lazy), layout khung trống
    core/
      api/http.ts             # fetch có kiểu; lỗi → ApiError mang ProblemDetails; hỗ trợ AbortSignal
      hooks/                  # useDebounce, useUrlState
      utils/tiengViet.ts      # boDau, chuanHoaTimKiem — cùng thuật toán với BE
      components/             # (sau design system)
      styles/global.css       # reset tối thiểu
    features/trang-chu/       # trang tạm để kiểm route
  e2e/smoke.spec.ts
```

- Script: `dev`, `build` (tsc + vite), `preview`, `lint`, `test` (Vitest), `e2e` (Playwright).
- `vite.config.ts`:
  - Dev: proxy `/api` và `/health` → https://localhost:7157 (`secure: false`).
  - Build: `outDir` = `../BackEnd/DichVuCong.Api/wwwroot`, `emptyOutDir`; `sourcemap: false`; bỏ `console`/`debugger`; chunk `vendor` riêng.
  - Obfuscate chỉ chunk của dự án, chỉ khi build production, đúng mức ghi trong `CLAUDE.md`.
- TypeScript strict, thêm `noUncheckedIndexedAccess`.
- ESLint: typescript-eslint, react-hooks; cấm `core/**` import `features/**`; cấm `dangerouslySetInnerHTML`.
- Không thư viện gọi HTTP ngoài `fetch`.
- Vitest cho `utils/`, `hooks/`. Playwright: 2 khổ (375×812, 1080×1920) + 1 smoke test mở trang chủ.

## 3. Chạy local

1. `dotnet user-secrets set "ConnectionStrings:DichVuCong" "Host=localhost;Port=5432;Database=dichvucong;Username=postgres;Password=postgres" --project src/BackEnd/DichVuCong.Api`
2. `dotnet ef database update --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api`
3. `dotnet run --project src/BackEnd/DichVuCong.Api`
4. `cd src/FrontEnd && npm install && npm run dev`

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
