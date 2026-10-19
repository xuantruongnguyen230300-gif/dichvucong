# Tra cứu TTHC — Trung tâm Phục vụ Hành chính công xã Cần Giuộc

Trang tra cứu thủ tục hành chính cho người dân xã Cần Giuộc, tỉnh Tây Ninh (điện thoại, kiosk), kết hợp hai trang mẫu:

- Vàm Cỏ — https://hccvamco.pages.dev/tracuu_tthc_vamco_v3: danh mục đầy đủ, QR theo lĩnh vực, trợ lý trả lời theo luật
- Cần Đước — https://ttpvhcc-canduoc.pages.dev/: ô dịch vụ nhanh, thủ tục thường gặp + popup chi tiết, giờ làm việc + liên hệ, giao diện tham khảo cho design system

**Nghiệp vụ nằm hết trong `.specify/`** — bắt đầu từ `.specify/nghiep-vu/tong-quan.md`; kế hoạch và tiến độ ở `.specify/ke-hoach.md`. File này chỉ ghi quy ước kỹ thuật.

Thứ tự ưu tiên: **đơn giản → bảo mật → hiệu năng**. Bảo mật được ưu tiên hơn hiệu năng, nhưng hiệu năng vẫn phải nằm trong ngân sách ở mục Hiệu năng.

Gặp chỗ chưa rõ hoặc phải chọn giữa nhiều cách mà tài liệu chưa nói → hỏi người dùng, không tự quyết.

## Công nghệ

| Phần | Chọn |
|---|---|
| Backend | ASP.NET Core Web API (.NET 10 LTS), controller, chia thư mục theo tính năng |
| Dữ liệu | PostgreSQL 18, EF Core + Npgsql, extension `unaccent` + `pg_trgm`. Thêm nguồn **Mẫu** (nạp file dữ liệu mẫu vào bộ nhớ, không cần DB) cho demo — đổi nguồn bằng cấu hình, cách làm ở `specs/F00-khung-he-thong/plan.md` |
| Frontend | React 19 + Vite + TypeScript, React Router, TanStack Query, CSS Modules |
| Grid | TanStack Table — chỉ dùng qua `core/components/DataTable` |
| Test | xUnit v3 (BE), Vitest (FE), Playwright (E2E) |
| Triển khai | BE phục vụ luôn bản build FE (`wwwroot`) → 1 ứng dụng, 1 tên miền, không cần CORS |

Không có: trang quản trị, đăng nhập, AI/LLM, nhận giọng nói (micro). Dữ liệu nạp bằng công cụ nhập Excel (F01).

## Cấu trúc

```
.specify/                         # TOÀN BỘ nghiệp vụ + kế hoạch
  ke-hoach.md                     # kế hoạch đã duyệt + tiến độ
  design-system.md                # nguyên tắc, token, quy cách component
  nghiep-vu/                      # tong-quan, thuat-ngu, du-lieu, cau-hoi-mo, tuan-thu
  specs/Fxx-<slug>/
    spec.md                       # ba-analyst
    plan.md · tasks.md            # planner
    testcases.md                  # tester
    result/review.md · test.md    # code-reviewer · tester
src/
  BackEnd/
    DichVuCong.sln
    Directory.Build.props         # cấu hình build chung
    Directory.Packages.props      # version gói tập trung
    DichVuCong.Data/              # thư viện dữ liệu — không phụ thuộc ASP.NET Core
      AppDbContext.cs
      Entities/ · Configurations/ · Migrations/
      Text/TiengViet.cs           # bỏ dấu, chuẩn hoá chuỗi tìm kiếm
    DichVuCong.Api/
      Program.cs                  # chỉ ghép các extension, không chứa logic
      Common/                     # Hosting, Security, Errors, RateLimiting, Caching
      Features/<TinhNang>/        # Controller + Service + Dtos theo từng tính năng
        Chatbot/
    DichVuCong.AppHost/           # .NET Aspire chỉ dùng ở dev: chạy Api + Vite + dashboard bằng một lệnh (không ServiceDefaults)
    DichVuCong.Import/            # console: Excel → PostgreSQL
    DichVuCong.DuLieuMau/         # console chỉ dùng ở dev: data-mau/*.json → file Excel đúng mẫu (bản đầu dữ liệu thật)
    DichVuCong.Tests/             # xUnit — Data/ (db-dev), Integration/ (tester), còn lại backend-dev
  FrontEnd/
    src/
      app/                        # router, layout, providers
      core/                       # LÕI DÙNG CHUNG — không biết nghiệp vụ
        i18n/                     # cấu hình react-i18next + vi/common.json
        components/               # DataTable, Modal, Card, Chip, SearchBox, Pager, Badge…
        hooks/                    # useDebounce, useUrlState…
        api/                      # API client có kiểu
        utils/                    # tiengViet.ts (boDau, chuanHoaTimKiem), format…
        styles/                   # tokens.css (màu, cỡ chữ, khoảng cách)
      features/<tinh-nang>/       # màn hình ghép từ core/; i18n/vi.json = câu chữ của tính năng
        chatbot/
    e2e/                          # Playwright
data-mau/                         # dữ liệu mẫu chỉ dùng local — không commit
```

Phụ thuộc chỉ một chiều:

- Backend: `Api → Data`, `Import → Data`. `Data` không tham chiếu project nào.
- Frontend: `features → core`; `core` không import từ `features`.

## Quy trình và sở hữu

| Bước | Agent | Ghi vào |
|---|---|---|
| 1 | `ba-analyst` | `.specify/nghiep-vu/`, `specs/*/spec.md` |
| 2 | `ba-reviewer` | `trang_thai` trong spec.md |
| 3 | `planner` | `plan.md`, `tasks.md` |
| 4 | `db-dev` | `DichVuCong.Data/`, `DichVuCong.Import/`, `DichVuCong.DuLieuMau/`, `DichVuCong.Tests/Data/` |
| 5 | `backend-dev` | `DichVuCong.Api/` (trừ `Features/Chatbot/`), `DichVuCong.AppHost/`, `DichVuCong.Tests/` (trừ `Data/`, `Integration/`, `Api/Chatbot/`) |
| 5 | `chatbot-dev` | `Features/Chatbot/`, `DichVuCong.Tests/Api/Chatbot/`, `src/FrontEnd/src/features/chatbot/` |
| 6 | `ui-core-dev` | `src/FrontEnd/src/core/`, `app/`, cấu hình build FE |
| 7 | `frontend-dev` | `src/FrontEnd/src/features/*` (trừ chatbot) |
| 8 | `code-reviewer` | `result/review.md` |
| 9 | `tester` | `testcases.md`, `result/test.md`, `e2e/`, `DichVuCong.Tests/Integration/` |

- Lỗi từ review/test: agent sở hữu file đó sửa — không có agent sửa lỗi riêng.
- Trạng thái spec (`trang_thai`): `nhap` → `da-duyet` (ba-reviewer) → `dang-lam` (planner) → `xong` (tester).

## Dùng agent tiết kiệm

Repo chỉ dùng 10 agent ở trên. Các plugin VNR (vnr-bakit, vnr-scc-devkit, vnr-qckit, vnr-swe) đã tắt cho repo này trong `.claude/settings.json`.

| Loại việc | Gọi agent nào |
|---|---|
| Hỏi đáp, đọc code, sửa chữ hoặc CSS, lỗi rõ ràng ở 1 chỗ | Không gọi — làm thẳng |
| Sửa lỗi theo `review.md` / `test.md` | Chỉ agent sở hữu file đó |
| Thay đổi nhỏ trong 1 tầng, không đổi nghiệp vụ | Agent sở hữu → `code-reviewer` |
| Sửa nghiệp vụ chức năng đã có, hoặc chức năng mới | Đủ quy trình: `ba-analyst` → `ba-reviewer` → `planner` → dev có task → `code-reviewer` → `tester` |

- Chỉ gọi dev có task trong `tasks.md`; không gọi agent "cho chắc".
- Không chạy lại agent khi chưa có thay đổi mới kể từ lần chạy trước.
- Agent làm trên các file khác nhau (vd. `backend-dev` và `chatbot-dev`) thì chạy song song.

## Quy ước code

- Tên theo nghiệp vụ, tiếng Việt không dấu: `ThuTuc`, `LinhVuc`, `Quay`, `NhanSu`, `CauHoiMau`.
- C# PascalCase · bảng/cột DB snake_case · JSON camelCase · route kebab-case (`/api/thu-tuc`).
- React: component `PascalCase.tsx`; thư mục feature kebab-case.
- **Không viết cứng câu chữ hiển thị cho người dùng trong code — dùng i18n** (quyết định 2026-10-08):
  - FE: react-i18next, file ngôn ngữ đóng gói khi build. Mỗi tính năng một namespace, file đặt cạnh tính năng (`features/<x>/i18n/vi.json`); chuỗi dùng chung ở `core/i18n/vi/common.json`. Khoá có kiểu TypeScript — gõ sai khoá là lỗi build. Mọi chuỗi giao diện (nhãn, nút, thông báo, placeholder, `aria-label`, tiêu đề trang) đi qua `t()`.
  - BE: lỗi trả mã lỗi (`code` trong ProblemDetails, danh mục mã ở `Common/Errors`); FE hiển thị câu theo mã. Câu trả lời của trợ lý trả dạng cấu trúc; câu khuôn mẫu nằm ở file ngôn ngữ FE; nội dung riêng (câu hỏi mẫu, dữ liệu thủ tục) lấy từ DB.
  - Công cụ nhập (Import): thông báo cho người vận hành đặt trong file tài nguyên `.resx`.
  - Không áp cho log và lỗi cấu hình dành cho lập trình viên.
- `.editorconfig` là chuẩn định dạng; build C# coi cảnh báo là lỗi — sửa gốc rễ, không tắt cảnh báo cho qua. Buộc phải tắt thì tắt đúng chỗ và ghi lý do.
- Thêm gói NuGet/npm: ghi lý do (và kích thước gzip với gói FE) trong plan.md hoặc báo cáo. Version NuGet khai ở `Directory.Packages.props`.

## Bảo mật

Ưu tiên trên hiệu năng. Vi phạm mục này là lỗi Chặn.

**Mã nguồn**

- Logic nghiệp vụ (trợ lý, tìm kiếm, dữ liệu) nằm ở BE. Mã .NET không bao giờ tới tay người dùng.
- FE production: không source map; bỏ `console`, `debugger`; minify. Mã của dự án qua javascript-obfuscator mức vừa:
  - Bật: đổi tên định danh (hexadecimal); string array mã hoá base64; `controlFlowFlattening` với ngưỡng ≤ 0.3.
  - Tắt: `deadCodeInjection`, `selfDefending`, `debugProtection` — phình file, chậm, dễ gây lỗi.
  - Thư viện bên thứ ba không obfuscate — mã nguồn mở sẵn, obfuscate chỉ làm chậm.
- Mã FE không thể giấu tuyệt đối; obfuscate chỉ làm khó đọc. Không đặt bí mật hay logic cần giấu ở FE.
- BE publish: `dotnet publish -c Release`, không kèm `.pdb`.

**Trình duyệt**

- Mọi tài nguyên tự host (font, thư viện QR, icon, ảnh) — không CDN, không Google Fonts.
- Header bắt buộc trên mọi response:
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
  - `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`
- Không `dangerouslySetInnerHTML`. Link ngoài: `rel="noopener noreferrer"`.

**API**

- Chỉ HTTPS. FE và BE cùng tên miền nên không mở CORS.
- Kiểm tra đầu vào, giới hạn kích thước request, rate limiting theo IP (trợ lý chặt hơn danh mục).
- Response chỉ có trường màn hình cần dùng. Lỗi dạng ProblemDetails, không stack trace. Tắt header `Server`. OpenAPI chỉ ở Development.
- Không nối chuỗi SQL.

**Dữ liệu**

- Hai nguồn dữ liệu (quyết định 2026-10-12): **Mẫu** — nạp file dữ liệu mẫu đi kèm bản build vào bộ nhớ, không cần DB, dùng cho demo; **PostgreSQL** — chạy thật. Feature đọc qua lớp nguồn dữ liệu, không gọi thẳng `AppDbContext`, để đổi nguồn chỉ bằng cấu hình.
- Một tài khoản DB. Máy dev dùng `postgres` local.
- Chuỗi kết nối `ConnectionStrings:DichVuCong` chỉ nằm ở user-secrets (dev, `UserSecretsId` = `dichvucong`, dùng chung cho Api và Import) hoặc biến môi trường `ConnectionStrings__DichVuCong` (triển khai). Không có trong repo, `appsettings*.json`, bản build, log hay response lỗi.
- Câu hỏi của người dân có thể chứa số CCCD, số điện thoại, email → che trước khi lưu nhật ký. Log không ghi dữ liệu cá nhân.
- `data-mau/` là dữ liệu nguồn (lấy từ Vàm Cỏ, đổi tên sang Cần Giuộc) — không commit, không đưa nguyên thư mục lên môi trường thật. File dữ liệu mẫu cho nguồn **Mẫu** thì commit: sinh bằng `DichVuCong.DuLieuMau`, đã làm sạch (không phân công, nhân sự, họ tên thật). Bản đầu của dữ liệu thật sinh từ đây bằng `DichVuCong.DuLieuMau` (không có phân công quầy, nhân sự — xem `du-lieu.md`); Trung tâm rà lại rồi mới nhập lên môi trường thật (quyết định 2026-10-12).

**Thư viện**

- Commit lockfile (`package-lock.json`, `packages.lock.json`).
- Trước khi phát hành: `npm audit --omit=dev` và `dotnet list package --vulnerable` không còn mức High/Critical.

## Hiệu năng

Ngân sách đã chừa phần chi phí của obfuscate. Vượt là lỗi Chặn:

- JS tải ban đầu ≤ 200 KB gzip · Lighthouse mobile ≥ 85 · API danh mục/trợ lý p95 ≤ 300 ms.

Cách đạt:

- Danh mục (~1.000 thủ tục) tải 1 lần bản rút gọn kèm chuỗi đã bỏ dấu, lọc phía client; chi tiết chỉ tải khi mở popup.
- Nạp lười theo route; trợ lý, QR, phần đọc câu trả lời chỉ tải khi dùng tới.
- BE: `AsNoTracking` + `Select` thẳng ra DTO; Output cache + ETag cho danh mục; nén Brotli.
- Ảnh WebP/AVIF, khai `width`/`height`.

## Lệnh

```
# Một lần cho máy dev
dotnet user-secrets set "ConnectionStrings:DichVuCong" "Host=localhost;Port=5432;Database=dichvucong;Username=postgres;Password=postgres" --project src/BackEnd/DichVuCong.Api

# Demo — nguồn Mẫu, không cần PostgreSQL (DuLieu:Nguon=Mau; profile https của Api đã đặt sẵn)
cd src/FrontEnd && npm ci && npm run build        # một lần, và mỗi khi FE đổi
dotnet run --project src/BackEnd/DichVuCong.Api   # https://localhost:7157
# Ở Development chỉ cho phép Host localhost/127.0.0.1 (AllowedHosts); thử bằng IP LAN trên điện thoại thì đặt biến môi trường AllowedHosts. Triển khai: khai AllowedHosts bằng tên miền thật (thiếu thì trang bỏ og:url và DC.identifier).
# Chạy với PostgreSQL: thêm --launch-profile https-postgresql. Máy đã triển khai: biến môi trường DuLieu__Nguon=Mau|PostgreSql (bắt buộc khai ở Production)

# Chạy bằng .NET Aspire (chỉ dev): Api + Vite (hot reload) + dashboard bằng một lệnh; mặc định nguồn Mẫu
dotnet run --project src/BackEnd/DichVuCong.AppHost                                      # Api https://localhost:7157 · Vite http://localhost:5173 · dashboard https://localhost:17000 (token in ra console)
dotnet run --project src/BackEnd/DichVuCong.AppHost --launch-profile https-postgresql    # nguồn PostgreSQL (Api đọc chuỗi kết nối từ user-secrets)
# Lần đầu cần mạng (Aspire CLI tải qua dnx), khởi động ~30 s. Không có ServiceDefaults/OpenTelemetry (đường dẫn URL có thể chứa dữ liệu cá nhân).
# Swagger UI: https://localhost:7157/swagger — chỉ Development + bản Debug; bản Release không chứa Swashbuckle. CSP giữ nguyên văn, không nới.

# Backend
dotnet build src/BackEnd/DichVuCong.sln
dotnet test --solution src/BackEnd/DichVuCong.sln          # Microsoft.Testing.Platform (global.json); lọc: --filter-namespace
dotnet ef migrations add <Ten> --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api -- --DuLieu:Nguon=PostgreSql
dotnet ef database update      --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api -- --DuLieu:Nguon=PostgreSql
dotnet run --project src/BackEnd/DichVuCong.Api            # https://localhost:7157
dotnet run --project src/BackEnd/DichVuCong.Import -- <lệnh>
# Sinh lại file dữ liệu mẫu cho demo (cần data-mau/)
dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- xuat-json data-mau src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json --nguoi-chiu-trach-nhiem "(dữ liệu mẫu)"

# Frontend
cd src/FrontEnd
npm run dev | npm run build | npm run lint | npm test | npx playwright test
```
