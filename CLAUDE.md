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
| Dữ liệu | PostgreSQL 18, EF Core + Npgsql, extension `unaccent` + `pg_trgm` |
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
    DichVuCong.Import/            # console: Excel → PostgreSQL
    DichVuCong.Tests/             # xUnit — Data/ (db-dev), Integration/ (tester), còn lại backend-dev
  FrontEnd/
    src/
      app/                        # router, layout, providers
      core/                       # LÕI DÙNG CHUNG — không biết nghiệp vụ
        components/               # DataTable, Modal, Card, Chip, SearchBox, Pager, Badge…
        hooks/                    # useDebounce, useUrlState…
        api/                      # API client có kiểu
        utils/                    # tiengViet.ts (boDau, chuanHoaTimKiem), format…
        styles/                   # tokens.css (màu, cỡ chữ, khoảng cách)
      features/<tinh-nang>/       # màn hình ghép từ core/
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
| 4 | `db-dev` | `DichVuCong.Data/`, `DichVuCong.Import/`, `DichVuCong.Tests/Data/` |
| 5 | `backend-dev` | `DichVuCong.Api/` (trừ `Features/Chatbot/`), `DichVuCong.Tests/` (trừ `Data/`, `Integration/`) |
| 5 | `chatbot-dev` | `Features/Chatbot/`, `src/FrontEnd/src/features/chatbot/` |
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

- Một tài khoản DB. Máy dev dùng `postgres` local.
- Chuỗi kết nối `ConnectionStrings:DichVuCong` chỉ nằm ở user-secrets (dev, `UserSecretsId` = `dichvucong`, dùng chung cho Api và Import) hoặc biến môi trường `ConnectionStrings__DichVuCong` (triển khai). Không có trong repo, `appsettings*.json`, bản build, log hay response lỗi.
- Câu hỏi của người dân có thể chứa số CCCD, số điện thoại, email → che trước khi lưu nhật ký. Log không ghi dữ liệu cá nhân.
- `data-mau/` là dữ liệu mẫu (lấy từ Vàm Cỏ, đổi tên sang Cần Giuộc) — chỉ dùng local, không commit, không đưa lên môi trường thật.

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

# Backend
dotnet build src/BackEnd/DichVuCong.sln
dotnet test  src/BackEnd/DichVuCong.sln
dotnet ef migrations add <Ten> --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api
dotnet ef database update      --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api
dotnet run --project src/BackEnd/DichVuCong.Api            # https://localhost:7157
dotnet run --project src/BackEnd/DichVuCong.Import -- <lệnh>

# Frontend
cd src/FrontEnd
npm run dev | npm run build | npm run lint | npm test | npx playwright test
```
