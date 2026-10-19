ĐẠT

# F00 · Khung hệ thống — review (T12)

- Phạm vi: `git diff a4e19f6` cộng các file chưa track trong `src/BackEnd/`, `src/FrontEnd/` (không tính `node_modules`, `test-results`, `playwright-report`) và `global.json`.
- Chuẩn đối chiếu: `CLAUDE.md` và `plan.md` hiện có trên đĩa. Theo đó: một tài khoản DB, `Api → Data`, `Import → Data`, `Permissions-Policy: microphone=()`.
- Kết luận: **0 Chặn · 5 Nên sửa · 17 Góp ý**. Không có lỗi Chặn nên **ĐẠT**. Nên xử lý 5 lỗi Nên sửa trước khi bắt đầu F01, vì F01–F09 sẽ dựng trên khung này.

## Kết quả lệnh

| Lệnh | Kết quả |
|---|---|
| `dotnet build src/BackEnd/DichVuCong.sln` (Debug và Release, `--no-incremental`) | 0 cảnh báo, 0 lỗi. `bin/Release` không có `.pdb` |
| `dotnet test --solution src/BackEnd/DichVuCong.sln` | 23/23 đạt |
| `dotnet list package --vulnerable --include-transitive` | Không có gói có lỗ hổng |
| `npm run lint` | Sạch |
| `npm test -- --run` | 4 file, 28/28 đạt |
| `npm run build` | Ra `wwwroot`, không có file `.map`, không có `sourceMappingURL` |
| `npm audit --omit=dev` (và `npm audit` đầy đủ) | 0 lỗ hổng |
| `dotnet run --project src/BackEnd/DichVuCong.Import` | In hướng dẫn, mã thoát 0 |

Kích thước chunk (gzip):

| Chunk | Thô | Gzip | Tải ban đầu |
|---|---|---|---|
| `vendor-*.js` | 334,92 KB | 104,75 KB | có |
| `index-*.js` (đã obfuscate) | 5,81 KB | 2,56 KB | có |
| `rolldown-runtime-*.js` | 0,58 KB | 0,36 KB | có |
| `TrangChu-*.js` (đã obfuscate, nạp lười) | 2,29 KB | 1,10 KB | không |
| `index-*.css` | 0,18 KB | 0,16 KB | có |

Tổng JS tải ban đầu khoảng **107,7 KB gzip**, trong ngân sách 200 KB.

## Đã kiểm, không có lỗi

- Chạy API ở môi trường Production, phục vụ bản build trong `wwwroot`:
  - Mọi response có CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, đúng từng ký tự như `CLAUDE.md`. Gồm `/health/*`, `/`, asset, 404 ProblemDetails và lỗi 500.
  - Không có header `Server`. Asset có hash trả `immutable`, nén `br`. `index.html` trả `no-cache`.
- Mở bản build production qua API bằng Chromium (Playwright), ở `/` và ở một route lạ: không có vi phạm CSP, không có lỗi console. Mã obfuscate chạy được với `script-src 'self'`.
- Obfuscate:
  - Chỉ áp cho `index-*` và `TrangChu-*`. `vendor` và `rolldown-runtime` để nguyên.
  - Chuỗi trong mã dự án đã mã hoá, không còn đọc được dạng thô.
  - Tuỳ chọn đúng `CLAUDE.md`: hexadecimal, string array base64, `controlFlowFlatteningThreshold` 0,3, tắt `deadCodeInjection`, `selfDefending`, `debugProtection`.
  - Không còn `console.` hay `debugger` trong mọi chunk.
- Kiến trúc:
  - `Program.cs` đúng hình dạng trong plan. `Data` không tham chiếu ASP.NET Core.
  - `Import` chỉ tham chiếu `Data`.
  - `core/` không import `features/` hay `app/`.
  - Không có file mẫu của template (WeatherForecast, `vite.svg`, `App.css`, `.http`…).
- Không có secret hay chuỗi kết nối thật trong repo, `appsettings.json` hay bundle FE. Chuỗi giả chỉ có trong test.
- Không có `dangerouslySetInnerHTML`, không có SQL.
- Ký tự vô hình dạng thật: không có trong code tự viết. `TiengViet.cs`, `tiengViet.ts` và hai file test đều viết dạng escape `\uXXXX`. Ngoại lệ là BOM ở các file migration, xem bảng.
- `TiengViet.cs` và `tiengViet.ts` cho cùng kết quả với cả 8 mẫu §4. Khác biệt ngoài bộ mẫu ghi ở bảng.

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs:44-45, 70` | `/health/ready` công khai, không có rate limit hay timeout. Mỗi request mở kết nối DB: khi thử với DB không tới được, mỗi lần mất khoảng 2,5 s. Gọi dồn dập sẽ chiếm pool kết nối của API thật, trái tinh thần "rate limiting theo IP" ở mục Bảo mật. | Gắn policy rate limit cho `/health/*` (`.RequireRateLimiting(...)`), hoặc giới hạn theo host/mạng nội bộ (`RequireHost`). Thêm timeout cho DB check (`AddDbContextCheck(..., timeout: ...)`). Cân nhắc thêm `GlobalLimiter` làm lưới an toàn cho endpoint quên gắn policy. | backend-dev |
| Nên sửa | `src/BackEnd/DichVuCong.Import/Program.cs:6` | `AddUserSecrets` được thêm **sau** nguồn biến môi trường và tham số dòng lệnh mặc định của `Host.CreateApplicationBuilder`, nên user-secrets thắng biến môi trường. Máy có cả hai thì `ConnectionStrings__DichVuCong` bị bỏ qua và công cụ nhập ghi vào DB khác ý muốn. Trái `CLAUDE.md`: user-secrets chỉ dùng cho dev, biến môi trường cho triển khai. | Chỉ nạp user-secrets khi môi trường là Development, đúng vị trí ưu tiên. Ví dụ: thêm `Properties/launchSettings.json` đặt `DOTNET_ENVIRONMENT=Development` rồi bỏ dòng 6, vì host mặc định đã tự nạp user-secrets ở Development. Hoặc chèn user-secrets trước nguồn biến môi trường. | db-dev |
| Nên sửa | `src/BackEnd/DichVuCong.Tests/Api/ApiPipelineTests.cs:21-28` | Test header so response với chính hằng `SecurityHeaders.Always`, nên đổi sai giá trị trong code (thêm `'unsafe-inline'`, bật `microphone=(self)`…) test vẫn xanh. Dòng 26-27 chỉ kiểm hằng số với chính nó, không kiểm response. Test không giữ được giá trị bắt buộc của `CLAUDE.md`. | So với chuỗi literal lấy nguyên từ `CLAUDE.md`, cho CSP, `Permissions-Policy`, `Referrer-Policy`, `nosniff`. Bỏ dòng 26-27. Phụ: `DuongDanKhongPhaiApi_KhongBaoGio500` (dòng 77-85) đổi kỳ vọng theo trạng thái `wwwroot` trên máy; nên dùng web root tạm để kết quả xác định. | backend-dev |
| Nên sửa | `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs:51-64, 77` | `MapFallback` dùng mẫu `{*path:nonfile}`, nên đường dẫn có dấu chấm như `/api/x.json` không vào `SpaFallback` và trả **404 body rỗng**, không phải ProblemDetails (đã thử). 405 do routing cũng trả body rỗng. Lệch plan §1 mục 8 ("`/api/*` không khớp → 404 ProblemDetails") và quy ước "Lỗi dạng ProblemDetails". | Thêm `app.UseStatusCodePages()` sau `UseExceptionHandler`. Đã có `AddProblemDetails`, nên mọi mã lỗi body rỗng sẽ thành ProblemDetails. Thêm test cho `/api/x.json`. | backend-dev |
| Nên sửa | `src/FrontEnd/vite.config.ts:24-26` | Nhóm `vendor` bắt **mọi** module trong `node_modules`. Đã thử bằng một build riêng: thư viện chỉ được `import()` lười vẫn bị gom vào `vendor` và `modulepreload` ngay từ đầu. Khi F05/F06/F07 thêm thư viện QR hay phần đọc câu trả lời, chúng sẽ vào chunk tải ban đầu, trái "trợ lý, QR, phần đọc câu trả lời chỉ tải khi dùng tới" và dễ vượt 200 KB. | Giới hạn nhóm `vendor` vào các thư viện khung luôn dùng: `react`, `react-dom`, `scheduler`, `react-router`, `@tanstack/react-query`. Thư viện còn lại để Rolldown tự tách theo điểm `import()`. Ghi quy tắc này vào plan. | ui-core-dev |
| Góp ý | `Common/Hosting/HostingOptions.cs:8`, `Common/RateLimiting/RateLimitingOptions.cs:8,11`, `Common/Caching/CachingOptions.cs:8`, `appsettings.json:9-18` | Mỗi con số (64 KB, 300, 20, 10 phút) khai hai nơi: mặc định trong class và trong `appsettings.json`. Không kiểm giá trị lúc khởi động: `RateLimiting:DanhMuc = 0` chỉ ném lỗi ở request đầu tiên. Lệch với cách "thiếu thì dừng khởi động" của chuỗi kết nối. | Giữ một nguồn (`appsettings.json`) và kiểm lúc khởi động (`AddOptions<T>().Bind(...).Validate(...).ValidateOnStart()` hoặc kiểm ngay trong extension). | backend-dev |
| Góp ý | `Common/Hosting/ApiHostingExtensions.cs:85-88`, `Common/Hosting/SpaFallback.cs:9, 27` | Hằng `"index.html"` và `"no-cache"` viết lặp ở hai file cho cùng một quy tắc cache của `index.html`. | Gom quy tắc cache tĩnh (`index.html` → `no-cache`, `/assets` → `immutable`) về một chỗ, ví dụ trong `SpaFallback` hoặc một class `StaticFiles` cạnh nó. | backend-dev |
| Góp ý | `Common/Hosting/ApiHostingExtensions.cs:21-25`, `Common/Security/SecurityHeadersMiddleware.cs:22` | `AddServerHeader = false` và `MaxRequestBodySize` chỉ áp cho Kestrel. Nếu triển khai IIS in-process (câu hỏi mở 10) thì IIS vẫn gửi `Server` và dùng giới hạn body riêng. HSTS phụ thuộc `Request.IsHttps`: sau reverse proxy kết thúc TLS mà chưa bật ForwardedHeaders thì không bao giờ gửi HSTS, `UseHttpsRedirection` cũng sai. Plan mới ghi ảnh hưởng tới rate limit. | Khi chốt câu hỏi mở 10: bổ sung cấu hình theo nơi triển khai (`IISServerOptions`, `web.config` `removeServerHeader`, hoặc `UseForwardedHeaders` đứng đầu pipeline) và ghi vào plan. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Data/Text/TiengViet.cs:20-22, 41` · `src/FrontEnd/src/core/utils/tiengViet.ts:10, 22` | Ngoài bộ mẫu §4, hai bản vẫn khác nhau (đã chạy thử). (1) BE duyệt từng `char` nên không bỏ được dấu kết hợp ngoài BMP, ví dụ U+E0100: BE giữ, FE `\p{Mn}/u` bỏ. (2) `toLowerCase()` của JS đổi `Σ` cuối từ thành `ς`, `ToLowerInvariant` thành `σ`. Dữ liệu TTHC tiếng Việt không bị ảnh hưởng. Phụ: tham số đặt tên lệch (`chuoi` ở BE, `text` ở FE). | BE duyệt theo `Rune` (`EnumerateRunes()` + `Rune.GetUnicodeCategory`). Về sigma: chấp nhận và ghi vào §4, hoặc thay `ς` → `σ` ở cả hai bản. Thêm 2 mẫu này vào §4 và vào hai bộ test. Thống nhất tên tham số. | db-dev, ui-core-dev |
| Góp ý | `src/BackEnd/DichVuCong.Import/Program.cs:8-12, 20` | Thiếu chuỗi kết nối thì lặng lẽ bỏ qua việc đăng ký `AppDbContext`. Khi F01 thêm lệnh sẽ ra lỗi DI khó hiểu, khác cách dừng sớm của Api. Hướng dẫn in `-- <file.xlsx>`, trong khi `CLAUDE.md` ghi `-- <lệnh>` và F01 có nhiều lệnh (nhập, xuất câu chưa trả lời theo AC-5). | Ở F01: bắt buộc có chuỗi kết nối với các lệnh cần DB, thông báo nêu tên khoá như Api. Dùng chung một hàm đọc chuỗi kết nối thay vì viết lại, ví dụ đặt ở `Data`. Sửa dòng hướng dẫn thành `-- <lệnh> [tham số]`. | db-dev |
| Góp ý | `src/BackEnd/DichVuCong.Data/Migrations/20261008093522_KhoiTao.cs:1`, `...KhoiTao.Designer.cs:1`, `AppDbContextModelSnapshot.cs:1` | Ba file migration do EF sinh có BOM UTF-8 (U+FEFF dạng thật ở đầu file). Trái `.editorconfig` (`charset = utf-8`) và quy ước không có U+FEFF dạng thật. | Bỏ BOM, hoặc khai `charset = utf-8-bom` cho `[**/Migrations/*.cs]` trong `.editorconfig` để thành ngoại lệ có chủ đích. Migration sau sẽ lặp lại, nên chọn một cách và ghi lại. | db-dev |
| Góp ý | `src/BackEnd/DichVuCong.Tests/Data/TiengVietTests.cs:5, 13, 21-35` | Lối viết lệch `Tests/Api`: tên test kiểu `BoDau_theo_bo_mau`, `Null_bi_tu_choi` so với `HealthLive_Tra200_VaCoDuHeaderBaoMat`; class không `sealed`; ghi đầy đủ `System.Text.NormalizationForm` hai lần thay vì `using`. | Theo lối của `ApiPipelineTests`: tên PascalCase theo cụm, `sealed`, `using System.Text;`. | db-dev |
| Góp ý | `src/BackEnd/DichVuCong.Tests/DichVuCong.Tests.csproj:16, 18` · `global.json:6-8` | `global.json` đã chọn Microsoft.Testing.Platform, nên `Microsoft.NET.Test.Sdk` và `xunit.runner.visualstudio` chỉ còn phục vụ VSTest. | Nếu nhóm không cần chạy kiểu VSTest thì bỏ hai gói này, cả `PackageVersion` trong `Directory.Packages.props`. Nếu giữ thì ghi lý do. | backend-dev |
| Góp ý | `src/FrontEnd/build/obfuscate.ts:7, 19` | Obfuscate ở `generateBundle`, sau khi tên file có hash đã tính. Nâng version `javascript-obfuscator` hoặc đổi tuỳ chọn mà mã nguồn không đổi thì nội dung đổi nhưng tên file giữ nguyên, trong khi asset được cache `immutable` 1 năm. Comment dòng 7 nói quá mức đảm bảo thực tế. | Chấp nhận và sửa comment cho đúng giới hạn (đổi version hoặc tuỳ chọn obfuscate thì phải đổi hash, ví dụ đổi `seed`). Hoặc chuyển sang `renderChunk` để hash tính sau obfuscate. | ui-core-dev |
| Góp ý | `src/FrontEnd/eslint.config.js:6, 7, 18, 32` | Bốn điểm. (1) `tseslint.config()` đã `@deprecated` ở bản typescript-eslint đang cài. (2) `ignores: 'dist'` là phần thừa của template: bản build ra `wwwroot`, không có `dist`. (3) Luật cho `core/**` chỉ chặn `features`, chưa chặn `app`. (4) Luật chặn `dangerouslySetInnerHTML` chỉ bắt dạng thuộc tính JSX. | (1) Dùng `defineConfig` của `eslint/config`. (2) Bỏ `dist`. (3) Thêm `**/app`, `**/app/**` vào luật cấm import của `core`. (4) Thêm selector `Property[key.name='dangerouslySetInnerHTML']`. | ui-core-dev |
| Góp ý | `src/FrontEnd/playwright.config.ts:10, 15` | `trace: 'on-first-retry'` nhưng không đặt `retries`, nên trace không bao giờ được ghi. Khổ điện thoại dùng `Desktop Chrome` chỉ đổi viewport, không có `isMobile`/`hasTouch`. | Đặt `retries` (ví dụ 1 khi CI) hoặc đổi sang `retain-on-failure`. Khổ điện thoại thêm `isMobile: true, hasTouch: true`. | ui-core-dev |
| Góp ý | `.nvmrc:1` · `src/FrontEnd/package.json:7, 28` | `.nvmrc` chọn Node 24, nhưng `@types/node` là `^20.19` và `engines` là `>=20.19`. Máy hiện tại chạy 20.19.2. Chưa rõ nhắm bản Node nào. | Chọn một bản chính. `@types/node` theo đúng bản đó. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/core/api/http.ts:26, 35` | Kiểm `startsWith('/')` để chắc chắn cùng nguồn, nhưng `//host/...` (URL không ghi giao thức) vẫn lọt qua. CSP `connect-src 'self'` đang chặn giúp. `method` có `PUT`/`PATCH`/`DELETE`, trong khi ứng dụng chỉ đọc, không có quản trị: thừa so với nhu cầu. | Từ chối đường dẫn bắt đầu bằng `//` (hoặc bắt buộc `/api/`). Thu `method` về `'GET' \| 'POST'`. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/app/providers.tsx` | File xuất component `Providers` nhưng tên file viết thường, trái quy ước "component `PascalCase.tsx`". Các file khác trong `app/` đều PascalCase. | Đổi thành `Providers.tsx`. `router.tsx` giữ nguyên vì không phải component. | ui-core-dev |
| Góp ý | `src/FrontEnd/src/main.tsx:3-4` | `global.css` (reset) import sau `App`, nên trong bundle CSS reset đứng sau CSS của component nạp sớm. | Import `./core/styles/global.css` trước `App`. | ui-core-dev |
| Góp ý | `src/FrontEnd/playwright.config.ts:9` · `src/FrontEnd/e2e/` | E2E chỉ chạy trên Vite dev, không qua đường production: BE phục vụ `wwwroot`, CSP, mã đã obfuscate, `SpaFallback`. Lần review này đã kiểm tay và đạt, nhưng chưa có test tự động giữ lại. | Thêm một project Playwright, hoặc một bước test, chạy trên bản build do BE phục vụ: kiểm không có vi phạm CSP hay lỗi console, route sâu tải lại được. | tester |
| Góp ý | `.specify/specs/F00-khung-he-thong/plan.md:37` | §1 mô tả `ChuanHoaTimKiem` là "`BoDau` → chữ thường → gộp khoảng trắng → trim", thiếu bước bỏ U+200B–U+200D và U+FEFF. Bước này chỉ ghi ở §4. | Bổ sung bước bỏ ký tự vô hình vào §1 cho khớp §4 và code. | planner |

---

# F00 · Khung hệ thống — review bổ sung (T22)

**Kết luận T22: ĐẠT** (0 Chặn · 2 Nên sửa · 8 Góp ý). Mục này bổ sung cho review T12 ở trên; không sửa kết luận cũ.

- Phạm vi:
  - F00 T15–T21: `TiengViet.BoKyTuVoHinh`, `RateLimiting:TroLy` = 60, mã tra cứu, cache danh mục theo lần nhập, `tiengViet.ts` (U+200E, U+200F), `ApiError.maTraCuu`, script trình duyệt cũ ES5.
  - F01 T03–T12 và T18: thực thể, cấu hình, migration `NhapDuLieu`; công cụ nhập (`Excel/`, `KiemTra/`, `Lenh/`, `Loai/`); `DichVuCong.DuLieuMau`; việc xoá câu chưa trả lời quá 90 ngày (bản đọc lúc 14:40, khi còn dùng `AppDbContext` trực tiếp).
  - F08 T01–T02: `GET /api/trung-tam`, chèn dữ liệu đặc tả vào HTML.
  - Bỏ qua: F00 T25–T31. Trong lúc review, db-dev và backend-dev/chatbot-dev đã sửa song song `Data/DuLieu/`, `Data/Mau/`, `Api/Features/Chatbot/*` (`KhoCauChuaTraLoi*`, `AddChatbot(nguon)`, `XoaCauChuaTraLoiHetHan`), `DuLieuMau/XuatJson.cs` và test kèm; các thay đổi này (T25–T29) **không** nằm trong review này. Vì vậy review không nêu lỗi về việc `AddChatbot()` chưa được gọi: phần đó đã đổi.
- Mốc xem xét: 2026-10-12 khoảng 14:30–15:05. Chuẩn đối chiếu: `CLAUDE.md`, `plan.md` của F00, F01, F08.

## Kết quả lệnh

| Lệnh | Kết quả |
|---|---|
| `dotnet build src/BackEnd/DichVuCong.sln` | 0 cảnh báo, 0 lỗi (14:30 và 15:02) |
| `dotnet test --solution src/BackEnd/DichVuCong.sln` | 14:37: 333/333 đạt. 15:02: 458/458 đạt (gồm test mới của T25–T29) |
| `dotnet list package --vulnerable --include-transitive` | Không có gói có lỗ hổng, cả 5 project |
| `dotnet publish -c Release` Api và Import | Không có `.pdb`. Api không có `ClosedXML`. Bản publish của Import không có `DichVuCong.DuLieuMau.dll`. (Có file `.xml` tài liệu, xem Góp ý) |
| `npm run lint` · `npm test` · `npm run build` | Sạch · 14:59: 41 file, 320/320 đạt · ra `wwwroot`, không `.map` |
| `npm audit --omit=dev` | 0 lỗ hổng |
| `npx playwright test e2e/trinh-duyet-cu.spec.ts` (4 project: điện thoại, kiosk, Firefox, WebKit) | 12/12 đạt (T21: mở `/` thấy trang; thiếu tính năng thì thấy dòng hướng dẫn, không còn `#root`, không lỗi; có số điện thoại thì hiện link `tel:`) |
| `e2e/smoke.spec.ts` (14:50) | Đạt, trừ ca `đường dẫn lạ hiện trang không tìm thấy` (điện thoại, kiosk): F08 T04 đang sửa dở `common.json` lúc đó; đã hết lỗi biên dịch lúc 14:59, chưa chạy lại e2e. Xem review C01, "Ghi chú ngoài phạm vi" |

JS tải ban đầu (gzip) lúc 14:37: `vendor` 118,97 KB, `index` 5,52 KB, `TrangChu` 1,18 KB, `rolldown-runtime` 0,40 KB, `vi` 0,11 KB, script trình duyệt cũ 0,44 KB (0,62 KB thô, dưới mức 1 KB của plan §5): tổng khoảng **126,6 KB**. Lúc 14:59 (đã có khung trang F08): khoảng **148,7 KB**. Cả hai trong ngân sách 200 KB.

## Đã kiểm, không có lỗi

**Bảo mật**

- **Source map, `.pdb`:** không có `.map`, `sourceMappingURL`, `.pdb` ở FE và BE (bản Release).
- **CSP không inline:** `wwwroot/index.html` không có `<script>` hay `<style>` inline; script trình duyệt cũ là file ngoài `/assets/trinh-duyet-cu-<hash>.js`; module chính cũng là file ngoài. Không `style=` trong HTML sinh ra. CSP và 3 header còn lại do `SecurityHeaders.cs` đặt đúng từng ký tự như `CLAUDE.md` (đã kiểm ở T12, không đổi).
- **Mã hoá HTML dữ liệu đặc tả (XSS), `TrangHtml.cs`:**
  - Mọi giá trị chèn vào đi qua `HtmlEncoder` (`Ma()` dòng 112; dùng ở dòng 89 và 116): tiêu đề, mô tả, `DC.*`, `og:*`, và cả `DC.identifier`, `og:url` (dựng từ `Host` và đường dẫn do client gửi, dòng 85). `"`, `<`, `>`, `&`, `'` đều thành thực thể.
  - Tên thẻ và tên thuộc tính là hằng viết cứng; chỉ `content` và nội dung `<title>` nhận giá trị.
  - Query string không vào HTML. Mọi lỗi (DB, thiếu dấu đánh dấu, JSON hỏng) trả nguyên `index.html`; log chỉ ghi tên loại lỗi (`LogLoiDacTa`, dòng 137), không ghi message.
  - Test `TrangHtmlTests` phủ tên chứa `<script>` và `"`. Chưa có test cho `Host` hay đường dẫn lạ (xem Góp ý).
- **Rate limit:** `/api/trung-tam` có `[EnableRateLimiting(DanhMuc)]` (300/phút/IP) và chỉ nhận GET (POST → 405). Trợ lý 60/phút/IP (`appsettings.json:15`, `Range(1, 100000)` kiểm lúc khởi động). `/health/*` có `RequireRateLimiting`. 429 trả ProblemDetails có `Retry-After`.
- **Mã tra cứu:** 8 ký tự từ `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (đúng, bỏ `0 O 1 I L`), sinh bằng `RandomNumberGenerator.GetString`; mọi ProblemDetails (cả 404 của `/api`, 405, 413, 429) có `maTraCuu`, không có `traceId` hay stack trace; chi tiết lỗi chỉ ở Development. 5xx log Error kèm mã và exception; 4xx log Information chỉ có đường dẫn không query string.
- **Không lộ chuỗi kết nối hay dữ liệu cá nhân trong log hay response:** chuỗi kết nối chỉ đọc từ user-secrets (Development) hoặc biến môi trường; không có trong repo, `appsettings*.json`, bản build; thông báo thiếu cấu hình chỉ nêu tên khoá (`ConfigurationExtensions.cs:14`); lỗi DB của Import in "loại lỗi + SQLSTATE", không in message gốc (`GhiChung.cs:95-104`); không `EnableSensitiveDataLogging`; log xoá câu quá hạn chỉ ghi số dòng và mốc thời gian, không ghi nội dung câu.
- **SQL không nối chuỗi:** toàn bộ LINQ và `ExecuteDeleteAsync`; câu duy nhất viết tay là `GhiChung.cs:44` `SqlQuery<bool>($"SELECT pg_try_advisory_xact_lock({KhoaAdvisory})…")`, kiểu `FormattableString` nên `KhoaAdvisory` thành tham số. Các CHECK trong cấu hình entity dùng hằng số, không nhận từ ngoài.
- **Import chặn link không phải http(s):** `DongDoc.LaUrlHopLe` (`DongDoc.cs:208-219`) là danh sách cho phép: `Uri.TryCreate` tuyệt đối, scheme `http`/`https`, có host, không khoảng trắng, phải bắt đầu bằng `scheme://`, ≤ 2.000 ký tự. Dùng cho mọi cột địa chỉ web (liên kết, ô dịch vụ, bản đồ, mạng xã hội). `javascript:`, `data:`, đường dẫn tương đối → lỗi dòng, không ghi gì (BR-2). FE kiểm lần nữa bằng `phanLoaiLienKet`.
- **File Excel độc hại:** chỉ `.xlsx`, ≤ 20 MB, mở chỉ đọc vào bộ nhớ; không tính công thức (dùng giá trị đã lưu); `.xlsm` bị từ chối. Ô lỗi `#N/A` thành lỗi dòng. Ký tự điều khiển và vô hình bị bỏ (BR-18).
- **File xuất:** ô câu hỏi ghi kiểu chuỗi, định dạng `@`; có test với `=HYPERLINK(...)` (`TaoMauVaXuatTests.cs:171-188`). Không ghi đè file đã có.
- **Script ES5 ngoại lệ obfuscate:** đúng lý do ghi ở F00 plan §8 câu 2 và comment `build/trinh-duyet-cu.ts`: chạy trên IE11, không logic nghiệp vụ (chỉ phát hiện tính năng, gọi `GET /api/trung-tam`, đọc `dienThoai`), 0,62 KB. Số điện thoại chỉ được dùng khi khớp `^[0-9 .+()-]{6,20}$`, đặt qua `textContent` và `href` chỉ gồm chữ số và `+`; mọi lỗi nuốt lặng lẽ. Không chèn gì vào HTML thô.
- **Không CDN:** không URL ngoài trong mã FE, CSS, `index.html`; `<link rel="schema.DC" href="https://purl.org/…">` chỉ là siêu dữ liệu, không tải gì.
- **Kiến trúc:** `Api → Data`, `Import → Data`; `DuLieuMau → Import`; `Data` không tham chiếu project nào; `Program.cs` 14 dòng, chỉ ghép extension. Controller mỏng; service dùng `AsNoTracking` + `Select` ra DTO.
- **Thư viện mới:** `ClosedXML 0.105.1` có lý do trong `Directory.Packages.props` và F01 plan §7 (MIT; SixLabors.Fonts 1.x Apache-2.0 gián tiếp); lockfile cập nhật; không lỗ hổng.

**Nghiệp vụ và hợp đồng**

- DTO `ThongTinTrungTamDto` đúng từng trường với F08 plan §3.1 và kiểu `ThongTinTrungTam` ở `core/api/trungTam.ts` (camelCase `oDichVu`, `youTube`, `tikTok`, `zaloOa`; `dienThoai` ở gốc cho script trình duyệt cũ; ngày `yyyy-MM-dd`; giờ `HH:mm`). Không trả trường nào ngoài plan.
- F00 T15/T19: `BoKyTuVoHinh` (BE) và `chuanHoaTimKiem` (FE) cùng tập U+200B–U+200F, U+FEFF; bộ mẫu §4 có đủ hai dòng mới và ví dụ `BoKyTuVoHinh`; hai bên giống nhau từng mẫu. Ký tự vô hình không dán thật vào mã (chỉ BOM của file migration, xem Góp ý).
- F00 T18: cache `danh-muc` theo lần nhập: khoá gồm phiên bản, `ETag` = phiên bản + mã bản build, `Cache-Control: no-cache`, `If-None-Match` khớp → 304, chỉ lưu 200 của GET/HEAD; nén Brotli nằm trước output cache nên bản lưu là bản chưa nén.
- F01: mỗi BR-1…BR-18 và AC-1…AC-16 ở mức DB có test; kiểm toàn bộ rồi mới ghi, một transaction, advisory lock, kiểm migration chưa chạy, kết quả xác định; mã thoát đúng §5.3; `--chi-kiem` không mở transaction ghi.
- `xuat cau-chua-tra-loi` chỉ xuất câu có lần gặp cuối trong 90 ngày qua `TimeProvider`.
- i18n của Import: câu chữ cho người vận hành nằm trong `ThongBao.resx`; chuỗi tiếng Việt còn lại trong mã là tên sheet/cột của mẫu Excel (`MauExcel`, là lược đồ dữ liệu) và thông báo cho lập trình viên (`DuLieuMau`, `ArgumentException`), thuộc phạm vi "không áp cho log và lỗi dành cho lập trình viên".

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/BackEnd/DichVuCong.Api/Common/Caching/DanhMucCachePolicy.cs:63` | `CacheVaryByRules.QueryKeys = "*"`: khoá cache gồm mọi tham số query. `GET /api/trung-tam` không nhận tham số (F08 plan §3.1: "Query lạ bị bỏ qua") nhưng `/api/trung-tam?x=1`, `?x=2`, … mỗi cái là một mục cache mới và chạy lại 5 truy vấn DB. Kẻ xấu thổi cache bằng query ngẫu nhiên, tới 300 yêu cầu/phút/IP, mỗi yêu cầu 5 truy vấn, và đẩy mục thật ra khỏi cache. Trái ý "Output cache + ETag cho danh mục" của `CLAUDE.md`. Chưa có test với query lạ (`ThongTinTrungTamTests`). | Chính sách `danh-muc` mặc định không vary theo query; endpoint nào có tham số (F03, F04) thì khai riêng khoá cần vary (tham số của `DanhMucCachePolicy` hoặc policy thứ hai). Thêm test: `/api/trung-tam?x=1` rồi `?x=2` → endpoint chạy 1 lần. | backend-dev |
| Nên sửa | `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/TrangHtml.cs:85` · `src/BackEnd/DichVuCong.Api/appsettings.json:8` | `DC.identifier` và `og:url` dựng từ `request.Scheme` và `request.Host` do client gửi; `AllowedHosts` là `"*"`, nên gửi `Host: evil.example` thì trang trả về có `og:url="https://evil.example/…"` (đã mã hoá nên không phải XSS). Trang là `no-cache`, nhưng nếu có CDN hay proxy cache đặt trước thì bản chứa tên miền lạ có thể bị lưu và Zalo, công cụ thu thập đọc phải. Sau reverse proxy kết thúc TLS mà chưa bật Forwarded Headers thì `Scheme` còn là `http`. | Khai tên miền công khai trong cấu hình (ví dụ `Hosting:PublicBaseUrl`, kiểm hợp lệ lúc khởi động như các mục khác) và dựng `DC.identifier`, `og:url` từ đó; và/hoặc đặt `AllowedHosts` đúng tên miền ở cấu hình triển khai. Thêm test: `Host` lạ → HTML không chứa tên miền đó. Chọn cách nào là quyết định triển khai; hỏi người dùng nếu cần. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/appsettings.json:2-7` | `Default: Information` mà không hạ `Microsoft.EntityFrameworkCore`. EF ghi mỗi câu SQL ở mức Information (`Executed DbCommand`), và `PhienBanDuLieu` chạy một truy vấn cho mọi yêu cầu danh mục kể cả 304: mỗi yêu cầu sinh ít nhất một dòng log trên console của production. Giá trị tham số không được ghi (không bật sensitive logging) nên không lộ dữ liệu cá nhân, nhưng ồn và tốn. Import đã hạ về Warning (`Import/appsettings.json`). | Thêm `"Microsoft.EntityFrameworkCore": "Warning"` như Import. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Common/Errors/ProblemDetailsCustomizer.cs:35-38` | Mọi 4xx (kể cả 404 của kẻ dò đường và từng 429 khi bị tấn công) ghi một dòng Information kèm `Request.Path.Value`: kẻ tấn công làm đầy log; đường dẫn là chuỗi đã giải mã từ client nên có thể chứa ký tự xuống dòng (`%0A`) để chèn dòng giả vào log console. Chưa thử được ký tự nào Kestrel cho qua. | Với 429 và 404 ghi Debug hoặc đếm gộp; mã hoá hoặc cắt ký tự điều khiển và độ dài của `DuongDan` trước khi ghi. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/TrangHtml.cs:37, 149, 174-186` | Mỗi yêu cầu trang (mọi đường dẫn không phải file và không phải `/api`; không giới hạn tần suất theo F08 plan §6) đọc `index.html` và `dac-ta-trang.json` từ đĩa rồi parse JSON. Khi cache DB hết hạn, nhiều yêu cầu đồng thời cùng gọi DB (mỗi cái chờ tới `ReadyTimeout`), không có khoá chống đổ dồn. Mỗi lần nhỏ nên chưa gây hại, nhưng đây là đường mà quét dò sẽ dội vào. | Nhớ nội dung hai file theo `IFileProvider.Watch` (hoặc theo thời gian sửa), và dùng `SemaphoreSlim` hoặc `Lazy` cho lần nạp DB. Cân nhắc giới hạn tần suất rộng cho trang HTML. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Tests/Api/TrangHtmlTests.cs:149-156` | Test XSS chỉ phủ trường tên Trung tâm. Hai đường vào khác là dữ liệu từ client: đường dẫn (đã giải mã, vd. `/%22%3E%3Cscript%3E`) và `Host`. Code hiện mã hoá đúng nhưng không test nào giữ. | Thêm hai test: đường dẫn chứa `"`, `<`, `>`; `Host` chứa ký tự đặc biệt → HTML không có `<script`, không có `">` thoát thuộc tính. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Import/Excel/DocExcel.cs:55-58, 70-74` | Giới hạn 20 MB tính trên file nén; ClosedXML nạp hết workbook vào bộ nhớ nên file zip bomb (vài chục MB nén ra nhiều GB) làm công cụ hết bộ nhớ. File do cán bộ soạn nên rủi ro thấp; plan §10 chỉ hứa giới hạn 20 MB. | Trước khi mở, đọc `ZipArchive` và cộng `Length` các entry, từ chối khi quá một mức (vd. 200 MB); mã thoát 2. | db-dev |
| Góp ý | `src/FrontEnd/build/trinh-duyet-cu.ts:37` | Kiểm "còn là ES5" chỉ bắt mũi tên, `let`, `const`; bộ minify nhận `target: 'es2015'` nên đầu ra vẫn có thể chứa cú pháp ES2015 khác (thuộc tính viết gọn, `for…of`, tham số mặc định…) mà IE11 không chạy. Script hiện tại sạch (đã đọc đầu ra), nhưng sửa nguồn sau này có thể làm hỏng lặng lẽ. | Phân tích đầu ra bằng trình phân tích ES5 (vd. `acorn` với `ecmaVersion: 5`, hoặc `Linter` của ESLint với `ecmaVersion: 5`) và dừng build khi lỗi. | ui-core-dev |
| Góp ý | `src/BackEnd/Directory.Build.props:10` | `GenerateDocumentationFile` bật cho mọi cấu hình, nên bản publish có `DichVuCong.Api.xml`, `DichVuCong.Data.xml`, `DichVuCong.Import.xml` (chú thích XML tiếng Việt của mã nội bộ) nằm cạnh DLL. Không được phục vụ ra ngoài (không ở web root), nhưng "mã .NET không bao giờ tới tay người dùng" chắc hơn khi các file này không có trong bản triển khai. | `<GenerateDocumentationFile Condition="'$(Configuration)' == 'Debug'">`, hoặc `<PublishDocumentationFile>false</PublishDocumentationFile>` cho Api và Import. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Data/Migrations/20261012030111_NhapDuLieu.cs:1`, `…NhapDuLieu.Designer.cs:1` | Hai file migration mới vẫn có BOM UTF-8 (U+FEFF dạng thật), như ba file cũ đã ghi ở T12. | Bỏ BOM hoặc khai `charset = utf-8-bom` cho `Migrations/*.cs` trong `.editorconfig`. | db-dev |


---

# F00 · Khung hệ thống — review bổ sung (T30: nguồn dữ liệu Mẫu / PostgreSQL)

**Kết luận T30: ĐẠT** (0 Chặn · 1 Nên sửa · 9 Góp ý). Mục này bổ sung cho T12 và T22 ở trên; không sửa kết luận cũ. Lỗi Nên sửa nên xử lý trước khi F06 gọi `GhiAsync`.

- Phạm vi: F00 T25–T29 và F08 T11, đối chiếu `plan.md` §9 (đặc biệt §9.2 cấu hình, §9.4 quy tắc R1–R7, §9.5 file mẫu, §9.6 kho, §9.8 phiên bản, §9.9 sẵn sàng): `DichVuCong.Data/DuLieu/*` (`INguonDuLieu`, `TruyVan`, `NguonDuLieuMau`, `NguonDuLieuPostgreSql`, `LoaiNguonDuLieu`), `Data/Mau/{TepDuLieuMau.cs, du-lieu-mau.json}`, `Data/{DataServiceCollectionExtensions, KetNoiDb}.cs`, `Api/Common/Hosting/{NguonDuLieuExtensions, DuLieuOptions}.cs`, `Api/Common/Caching/{PhienBanDuLieu, DanhMucCachePolicy, DanhMucNotModifiedMiddleware}.cs`, `Api/Features/Chatbot/*`, `Api/Properties/launchSettings.json`, `appsettings*.json`, `DichVuCong.DuLieuMau/XuatJson.cs`, `Import/Excel/DocExcel.cs` (chặn zip bomb), `Import/Excel/DongDoc.cs` (link http/https), `Import/Loai/GhiChung.cs`. Chuẩn: `CLAUDE.md` (đã có mục Lệnh mới).
- Không mở trình duyệt, Playwright hay Lighthouse. Không chạy API thật hay PostgreSQL; nhánh EF của `TruyVan` chỉ kiểm bằng đọc mã (test tương ứng bị bỏ qua vì thiếu `ConnectionStrings__DichVuCongTest`).

## Kết quả lệnh

| Lệnh | Kết quả |
|---|---|
| `dotnet build src/BackEnd/DichVuCong.sln` | 0 cảnh báo, 0 lỗi |
| `dotnet test --solution src/BackEnd/DichVuCong.sln` | 581 test: 533 đạt, 0 lỗi, 48 bỏ qua (cần PostgreSQL) |
| `dotnet list … package --vulnerable --include-transitive` | Không gói nào có lỗ hổng, cả 5 project. Không gói mới so với T22 |
| `dotnet publish -c Release` Api | Không `.pdb`, không `.xml`, không `ClosedXML`, `DichVuCong.Import.dll`, `DichVuCong.DuLieuMau.dll`, không `.map`. `Data.dll` 4,9 MB do nhúng file mẫu |
| `dotnet publish -c Release` Import | Không `.pdb`, không `.xml`, không `DichVuCong.DuLieuMau.dll`; có `ClosedXML` (đúng thiết kế) |

## Đã kiểm, không có lỗi

**Cấu hình và khởi động (BR-16, AC-26)**

- `appsettings.json` và `appsettings.Development.json` không có mục `DuLieu`. `DuLieuOptions.DocNguon` (`[Required]`, `[AllowedValues("Mau", "PostgreSql")]`, phân biệt hoa thường) chạy trong `AddApiServices`, tức trước khi dựng host: thiếu hoặc sai thì ném `InvalidOperationException` nêu `DuLieu:Nguon` và hai giá trị hợp lệ, không chép giá trị đã khai, và chưa đăng ký `INguonDuLieu`/`TepDuLieuMau` nào (nên không phục vụ dữ liệu mẫu). Đúng ở mọi môi trường kể cả Development. `launchSettings.json` (không đi vào bản publish) đặt `Mau` cho profile `https`, `PostgreSql` cho `https-postgresql`.
- Nguồn Mẫu: không gọi `GetRequiredConnectionString`, không đăng ký `AppDbContext`, không đăng ký `AddDbContextCheck`; chuỗi kết nối có hay không cũng không được đọc. Kiểm tra sẵn sàng `du-lieu` chỉ đọc bộ nhớ. File nhúng hỏng → `InvalidDataException` với lý do ngắn (không chép nội dung) ngay khi gọi `AddDichVuCongDataMau`, khởi động dừng.
- Nguồn PostgreSql: thiếu chuỗi kết nối → "Thiếu cấu hình ConnectionStrings:DichVuCong." (không in giá trị). `KetNoiDb.ApDungTimeoutMacDinh` thêm `Timeout` 5 giây và `Command Timeout` 10 giây chỉ khi người dùng chưa khai (kể cả tên đồng nghĩa), có test.
- Log khởi động `GhiLogNguonDuLieu` chỉ nêu nguồn, phiên bản định dạng, thời điểm, số thủ tục; không ghi chuỗi kết nối. Không `EnableSensitiveDataLogging`/`EnableDetailedErrors` ở đâu.

**Quy tắc truy vấn R1–R7 và hành vi hai nguồn**

- R1: `AppDbContext` chỉ xuất hiện ở `NguonDuLieuExtensions.cs` và `KhoCauChuaTraLoiPostgreSql.cs`; bốn test kiến trúc (constructor, trường/thuộc tính/chữ ký, mã nguồn) chặn quay lại. `ThongTinTrungTamService` dùng `DauTienAsync`/`DanhSachAsync`, không `ToListAsync` của EF.
- R2: mọi truy vấn của `ThongTinTrungTamService` và `PhienBanDuLieu` `Select` thẳng ra DTO/kiểu ẩn danh hoặc giá trị; không đọc navigation; không có đoạn mã nào trong `Api` gán vào thuộc tính của entity lấy từ `INguonDuLieu`. DTO chỉ chứa chuỗi bất biến và danh sách mới tạo mỗi lần gọi, không giữ tham chiếu vào danh sách dùng chung.
- R3: chỉ sắp theo khoá số (`ThuTu`, `Thu`); `KhongTrung` trong `TepDuLieuMau.KiemTra` bảo đảm các khoá đó duy nhất ở nguồn Mẫu, khớp ràng buộc của DB. `lan_nhap.loai` là khoá chính nên `DauTienAsync` trên `LanNhaps` không phụ thuộc thứ tự.
- R4/R5: biểu thức chỉ dùng thuộc tính, `==`, `Select`; so sánh chuỗi `==` là so ordinal ở cả LINQ và PostgreSQL (collation không phân biệt cho `=` trên chuỗi bằng nhau từng byte). Các giá trị null (`MoTa`, `Url`, `Xa`…) đi qua `Select` giống nhau.
- Thời gian: `ThoiDiem` của file có offset bất kỳ, của PostgreSQL là UTC; `PhienBanDuLieu` dùng `UtcTicks` và `NgayVietNam` dùng `ToOffset(+7)` nên hai nguồn cho cùng kết quả.
- `TruyVan`: nhánh theo `Provider is IAsyncQueryProvider`; nhánh bộ nhớ chuyển lỗi và huỷ vào `Task` như EF, tập rỗng của `LonNhatAsync` đúng ngữ nghĩa (null với kiểu cho null, ngoại lệ với kiểu không null).
- Thread-safe của `TepDuLieuMau`: `KiemTraVaNoi` double-check với `Lock` và cờ `volatile`, gán `_cachHoi/_lanNhap/_trungTams` trước khi đặt `_daNoi`; sau khi nối chỉ đọc. `Nhung` là `Lazy` an toàn đa luồng. `List<T>.AsQueryable()` cho nhiều luồng đọc đồng thời là an toàn.

**File dữ liệu mẫu (`du-lieu-mau.json`)**

- Quét bằng script (regex và `json.loads`): không số di động, không số điện thoại cá nhân, không CCCD/số 9–12 chữ số; địa chỉ thư duy nhất là `cangiuoc@tayninh.gov.vn` (hộp thư của cơ quan); không có "Vàm Cỏ"/"Cần Đước"; người chịu trách nhiệm là "(dữ liệu mẫu)"; `nhanSu` và `phanCongLinhVuc` rỗng. Điện thoại Trung tâm `02723 893 900` là số bàn công khai, có nguồn ở `can-giuoc.md`. `ghiChu` của file nói rõ "Không dùng làm dữ liệu thật". File không bị `.gitignore` bỏ qua (`git check-ignore` trả 1). 4,8 MB, nhúng trong `Data.dll`; chỉ nạp khi nguồn là Mẫu (`Lazy`).
- `xuat-json` dùng lại `DocExcel` + `KiemTra*` của `nhap tat-ca` nên file mẫu qua cùng phép kiểm với dữ liệu thật; ghi vào bộ nhớ rồi đọc lại trước khi đụng file đích; thư mục tạm xoá trong `finally`.

**Cache và ETag sau nhập**

- Phiên bản = `max(lan_nhap.thoi_diem)`, lấy ở đầu mỗi yêu cầu (`DanhMucCachePolicy.CacheRequestAsync`, `DanhMucNotModifiedMiddleware`): khoá output cache chứa phiên bản, `ETag` = phiên bản + mã bản build. Import ghi dữ liệu và `lan_nhap` trong cùng một transaction (`GhiChung.TrongGiaoDichAsync`) nên người đọc không thấy phiên bản mới mà dữ liệu cũ. Phiên bản được đọc trước dữ liệu nên nếu nhập xen giữa, bản lưu có thể mới hơn khoá của nó (an toàn), không bao giờ cũ hơn. Chỉ lưu 200; 304 trả trước khi endpoint chạy, vẫn qua rate limit và có header bảo mật. Nguồn Mẫu: phiên bản cố định = `thoiDiem` của file.
- Rate limit: `/api/*` danh mục 300/phút/IP, trợ lý 60/phút/IP (policy `tro-ly` đã định nghĩa, chưa có endpoint dùng); `/health/*` có policy. Request body ≤ 64 KB (`RequestSizeLimitMiddleware` và Kestrel).

**Kho câu chưa trả lời (F06 BR-7, BR-8, BR-12)**

- `KhoCauChuaTraLoiPostgreSql.GhiAsync` là một `INSERT … ON CONFLICT` qua `ExecuteSqlAsync` với chuỗi nội suy (giá trị thành tham số, không nối chuỗi); `XoaQuaHanAsync` là `ExecuteDeleteAsync`. Không câu SQL nối chuỗi nào trong `Api`, `Data`, `Import` (câu duy nhất viết tay là `pg_try_advisory_xact_lock({KhoaAdvisory})`, cũng nội suy tham số hoá).
- `KhoCauChuaTraLoiMau`: mọi thao tác đọc/ghi `_cacDong` nằm trong `lock`; `_thuTuGhi` tăng trong khoá nên thứ tự loại bỏ xác định; tối đa 1.000 dòng, đầy thì bỏ dòng có `LanGapCuoi` cũ nhất (bằng nhau thì dòng ghi sớm hơn); khoá gộp là `ChuanHoaTimKiem`, độ dài kiểm trước khi chiếm khoá. Bộ nhớ ≤ khoảng 2 MB.
- `XoaCauChuaTraLoiHetHan` chạy trên cả hai nguồn, mốc `bây giờ − 90 ngày` qua `TimeProvider`, đúng 90 ngày còn giữ; log chỉ ghi số dòng và mốc, không ghi nội dung câu.

**Import**

- Zip bomb: `DocExcel.Mo` đọc file vào bộ nhớ (≤ 20 MB nén), cộng `Length` mọi entry của zip, từ chối khi vượt 200 MB giải nén trước khi giao cho ClosedXML; các lỗi đọc khác đều thành `LoiFileException` với tên file, không in đường dẫn nội bộ hay ngoại lệ gốc. Entry khai kích thước nhỏ hơn thực tế: theo hiểu biết về `ZipArchive` của .NET, luồng giải nén bị cắt theo kích thước khai nên không qua mặt được (chưa thử bằng file giả).
- Link: `DongDoc.LaUrlHopLe` là danh sách cho phép (`http`/`https`, có host, không khoảng trắng, bắt đầu bằng `scheme://`, ≤ 2.000 ký tự); dùng cho mọi cột địa chỉ web. Lỗi DB chỉ in loại lỗi và SQLSTATE (`GhiChung.MoTaLoiDb`).
- Thông báo cho người vận hành nằm trong `ThongBao.resx`.

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/BackEnd/DichVuCong.Api/Features/Chatbot/KhoCauChuaTraLoiPostgreSql.cs:12-26` | Kho Mẫu có trần 1.000 dòng "để bị dội câu hỏi cũng không phình bộ nhớ", còn kho PostgreSQL không có trần nào. Mỗi câu khác nhau là một dòng mới (khoá gộp là chuỗi đã chuẩn hoá), giữ 90 ngày. Với giới hạn 60 câu/phút/IP, một IP gửi được tới khoảng 7,8 triệu dòng × 500 ký tự (cỡ vài GB) trong thời hạn giữ, nhiều IP thì nhanh hơn; bảng có chỉ mục duy nhất trên `khoa_gop` và chỉ mục `lan_gap_cuoi` nên phình cũng làm chậm ghi. Là lỗ hổng từ chối dịch vụ về dung lượng, chưa bị khai thác vì chưa có nơi nào gọi `GhiAsync` (F06). | Giới hạn số dòng như kho Mẫu, ví dụ ghi có điều kiện (`INSERT … SELECT … WHERE (SELECT count(*) FROM cau_chua_tra_loi) < @tran`, hoặc `ON CONFLICT` kèm xoá dòng cũ nhất khi vượt) với trần cấu hình được; hoặc ghi lại quyết định chấp nhận và thêm cảnh báo dung lượng. Thêm test cho trần ở cả hai kho. Cập nhật `plan.md` §9.6. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Common/Caching/DanhMucCachePolicy.cs:16, 22-31` | Mã bản build của `ETag` là `InformationalVersion` = `1.0.0+<sha của HEAD>`. Sha không đổi khi cây làm việc có thay đổi chưa commit (hiện cả dự án đang thế) hoặc khi build từ bản không có git (thì chỉ còn `1.0.0`). Triển khai một bản đổi hình dạng JSON nhưng cùng `lan_nhap` thì trình duyệt gửi `If-None-Match` cũ, nhận 304 và giữ bản JSON cũ cho tới khi có lần nhập mới. Trái ý "ETag = phiên bản + mã bản build" của F00 T18. | Lấy mã từ `Assembly.ManifestModule.ModuleVersionId` (đổi theo mỗi lần biên dịch), hoặc buộc đặt `SourceRevisionId`/`Version` khi publish và ghi vào quy trình triển khai. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs:38` | `AddControllers()` dùng bộ mã hoá JSON mặc định, mã hoá mọi chữ ngoài ASCII thành `\uXXXX`: chữ tiếng Việt phình khoảng 2–3 lần thô (nén Brotli bù một phần). `/api/trung-tam` nhỏ nên chưa đáng kể, nhưng danh mục F04 (~1.000 thủ tục) sẽ thấy rõ trên p95 300 ms và mạng di động. Chưa đo, suy từ hành vi của System.Text.Json. | `AddJsonOptions(o => o.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All))` (vẫn mã hoá `< > & ' "`), cùng cách `TrangHtml` đã làm; làm trước F04. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/Chatbot/KhoCauChuaTraLoiMau.cs:17-25` · `GopCauChuaTraLoi.cs:13-24` | Hai kho lệch nhau ở các chỗ nhỏ, trong khi plan §9.6 muốn "báo lỗi giống nhau": (1) kho Mẫu ném `ArgumentException`/`OperationCanceledException` đồng bộ (không `async`), kho PostgreSQL ném qua `Task`: người gọi giữ `Task` rồi mới `await` ở chỗ khác sẽ gặp hai hành vi; (2) ký tự `\0` và một số ký tự điều khiển: kho Mẫu nhận, PostgreSQL từ chối (`22021`) làm API trả 500; `TaoKhoaGop` không chặn. | Cho `GhiAsync` của kho Mẫu thành `async` (hoặc `Task.FromException`); trong `TaoKhoaGop` từ chối chuỗi chứa ký tự điều khiển (trừ `\n`, `\t` nếu cần) bằng `ArgumentException`, thêm test chạy chung cho cả hai kho. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/Chatbot/IKhoCauChuaTraLoi.cs:6-12` · `GopCauChuaTraLoi.cs` | Việc che CCCD, số điện thoại, email (F06 BR-8) hoàn toàn dựa vào người gọi: kho nhận `noiDung` và ghi nguyên. Quên một lần gọi hàm che là câu chứa dữ liệu cá nhân vào bảng hoặc bộ nhớ, và `TaoKhoaGop` chỉ kiểm độ dài. Hiện chưa có người gọi nên chưa sai. | Khi F06 làm: đặt hàm che ở một chỗ dùng chung (cạnh `GopCauChuaTraLoi`) và gọi trong chính `GhiAsync` của hai kho (hoặc một decorator), để không đường nào bỏ qua; thêm test "câu chứa số CCCD/điện thoại/email → nội dung lưu đã che" chạy cho cả hai kho. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/Chatbot/XoaCauChuaTraLoiHetHan.cs:49-53` | Lỗi xoá được ghi cả `Exception` (`LogKhongXoaDuoc(logger, ex, …)`): với Npgsql, thông báo có địa chỉ và cổng máy chủ DB, lỗi xác thực có cả tên tài khoản. Không phải chuỗi kết nối và không có mật khẩu, nhưng `CLAUDE.md` muốn chuỗi kết nối không lộ ở log; `TrangHtml` và `GhiChung.MoTaLoiDb` đã chọn chỉ ghi loại lỗi. | Ghi loại lỗi và `SqlState` như `MoTaLoiDb` (gom về một hàm dùng chung nếu muốn), giữ stack trace chỉ ở mức Debug. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.Data/KetNoiDb.cs:20` | `new NpgsqlConnectionStringBuilder(chuoiKetNoi)` ném `ArgumentException` khi chuỗi sai cú pháp; với từ khoá lạ Npgsql in tên từ khoá (`Keyword not supported: 'x'`). Chuỗi có mật khẩu chứa `;` không bọc dấu nháy sẽ làm một phần mật khẩu trở thành "từ khoá" và lọt vào thông báo lỗi lúc khởi động, vào log console. Khả năng thấp (cấu hình sai sẵn), nhưng đây là đường duy nhất mà một phần chuỗi kết nối có thể đi vào thông báo lỗi. Suy từ mã: bộ dựng chạy lười (lúc dựng pool lần đầu), nên lỗi hiện ở dịch vụ nền lúc khởi động chứ không ở `AddApiServices`. | Bọc việc dựng trong `try/catch (ArgumentException)` và ném `InvalidOperationException("Chuỗi kết nối ConnectionStrings:DichVuCong sai cú pháp.")` không kèm ngoại lệ gốc; gọi sớm (kiểm ngay trong `AddDichVuCongData`) để lỗi dừng khởi động đúng chỗ. | db-dev |
| Góp ý | `src/BackEnd/DichVuCong.Import/Excel/MauExcel.cs:132` | Mức giải nén tối đa 200 MB là rộng so với dữ liệu thật (vài nghìn dòng): ClosedXML nạp cả workbook vào bộ nhớ, 200 MB XML có thể chiếm nhiều GB, đủ làm máy ít RAM của cán bộ hết bộ nhớ trước khi gặp giới hạn 100.000 dòng (kiểm sau khi nạp). Chưa đo. | Hạ xuống mức thực tế (ví dụ 50 MB) và ghi cơ sở vào plan F01; giữ thông báo hiện có. | db-dev |
| Góp ý | `.specify/specs/F00-khung-he-thong/plan.md` §9.4 (R4, R5) | Quy tắc chưa nêu các hàm chuỗi dễ lệch giữa LINQ trên bộ nhớ và PostgreSQL: `StartsWith`/`EndsWith`/`IndexOf`/`Compare` không kèm `StringComparison` là so sánh theo văn hoá ở .NET nhưng là ordinal ở SQL; `Contains(string)` thì ordinal ở cả hai. EF không dịch được các bản có `StringComparison`. Hiện không truy vấn nào dùng nên chưa sai; F04, F06 sẽ viết nhiều truy vấn tìm kiếm. | Thêm vào R4: chỉ dùng `Contains` (và `==`) cho chuỗi; không `StartsWith`/`EndsWith`/`IndexOf`/`CompareTo`/`string.Compare` trong biểu thức; cần thì lấy về rồi xử lý trong C#. | planner |
| Góp ý | `src/BackEnd/DichVuCong.Tests/Api/KienTrucTests.cs` | Chưa có test giữ hai điều đã kiểm tay lượt này: (1) `DichVuCong.Api` không tham chiếu (kể cả gián tiếp qua assembly) `DichVuCong.Import`, `DichVuCong.DuLieuMau`, `ClosedXML`, và `DichVuCong.Data` không tham chiếu ASP.NET Core; (2) đối tượng dùng chung của nguồn Mẫu không bị sửa: tuần tự hoá `TepDuLieuMau.Nhung` trước và sau khi gọi mọi service/endpoint hiện có phải giống từng byte (R2 hiện chỉ giữ bằng quy ước và review). | Thêm hai test: so sánh `GetReferencedAssemblies()` của `Program`/`INguonDuLieu` với danh sách cấm; test bất biến cho nguồn Mẫu (gọi `LayAsync`, `LayDacTaAsync`, `PhienBanDuLieu` rồi `TepDuLieuMau.Ghi` so với bản trước). | tester |

## Ghi nhận (không tính lỗi)

- Nguồn Mẫu cho phép chạy ở Production khi khai `DuLieu__Nguon=Mau` (máy demo, người dùng chốt 2026-10-12, không dấu hiệu "bản chạy thử"). Cách khai bắt buộc ở Production đã đủ để không vô tình phục vụ dữ liệu mẫu.
- `Data.dll` (4,9 MB) mang file mẫu trong mọi bản publish, kể cả bản chạy PostgreSQL và công cụ Import; không nạp khi không chọn nguồn Mẫu. Chấp nhận theo plan §9.5 (tài nguyên nhúng).
- `XuatJson` và `DichVuCong.DuLieuMau` chỉ dành cho lập trình viên (`IsPublishable=false`), không tham chiếu từ Api.
- 48 test cần PostgreSQL (tương đương dữ liệu hai nguồn, nhánh EF của `TruyVan`, kho PostgreSQL trên DB thật) không chạy trong lượt này; `tasks.md` T31 ghi tester đã đạt 22/22 ca nhóm này (xem `result/test.md`).

---

# F00 · Khung hệ thống — review bổ sung (2026-10-16: AppHost + Swagger UI)

**Kết luận: ĐẠT** (0 Chặn · 2 Nên sửa · 9 Góp ý). Mục này bổ sung cho T12, T22, T30 ở trên; không sửa kết luận cũ. Hai lỗi Nên sửa nên xử lý trước khi dùng AppHost làm cách chạy chính cho cả nhóm.

- Phạm vi: `src/BackEnd/DichVuCong.AppHost/` (`AppHost.cs`, `.csproj`, `Properties/launchSettings.json`, `aspire.config.json`, `packages.lock.json`), `Directory.Packages.props`, `DichVuCong.sln`, `Api/Common/Hosting/{SwaggerUiExtensions, SpaFallback, ApiHostingExtensions}.cs`, `Api/DichVuCong.Api.csproj`, `Tests/Api/SwaggerUiTests.cs`, `FrontEnd/vite.config.ts` + `build/moi-truong-dev.ts` (+ test), `Api/Features/Chatbot/CheThongTinCaNhan.cs` (+ `CheThongTinCaNhanTests`).
- Chỉ đọc mã (theo yêu cầu): không build, test, publish, npm, Playwright hay trình duyệt. Lúc review không có tiến trình nào nghe ở các cổng 5173/5157/7157/17000/21000/22000 nên không đo được địa chỉ lắng nghe thực tế (xem Góp ý 3). Những điều chỉ chạy thật mới biết được ghi ở cuối mục.

## Đã kiểm, không có lỗi

**Bảo mật khi chạy dưới Aspire**
- `AppHost.cs:28` đặt tường minh `ASPNETCORE_FORWARDEDHEADERS_ENABLED=false` cho Api, đăng ký sau lúc `AddProject` nên thắng mọi giá trị Aspire tự đặt. Vite proxy không bật `xfwd`, nên Api không nhận `X-Forwarded-*`. Khớp plan §9.17.
- Cổng cố định 7157/5157 với `IsProxied=false` (dòng 23-24), trùng `Api/Properties/launchSettings.json` và `AllowedHosts` Development (`localhost;127.0.0.1`). Api thấy IP và Host thật như khi `dotnet run` riêng; lọc Host và rate limit hành xử như thường.
- Dashboard: `applicationUrl`, OTLP (21000) và resource service (22000) đều là `https://localhost:*`. Không có `ASPIRE_ALLOW_UNSECURED_TRANSPORT`, không có biến cho phép ẩn danh, nên dashboard giữ chế độ token mặc định (CLAUDE.md dòng 192 ghi token in ra console).
- AppHost không chứa chuỗi kết nối hay mật khẩu. Profile `https-postgresql` chỉ truyền tên nguồn; Api tự đọc chuỗi kết nối từ user-secrets (`UserSecretsId=dichvucong`), nên dashboard không có chuỗi kết nối trong biến môi trường của tài nguyên.
- Biến AppHost truyền đi chỉ có `DuLieu__Nguon`, `ASPNETCORE_FORWARDEDHEADERS_ENABLED`, `API_URL` (và `PORT` do Aspire đặt cho Vite). `DuLieu:Nguon` được đối chiếu danh sách cho phép `Mau`/`PostgreSql` (phân biệt hoa thường, giống `DuLieuOptions`), sai thì ném, thông báo không chép giá trị. Không chép biến lạ từ môi trường.
- `npm ci` chỉ chạy khi chưa có `node_modules` (dòng 33-35), đúng lockfile. Mã AppHost không gọi `dnx` hay tải mã nào; không có script tự viết gọi mạng.
- `IsPublishable=false`. `Api.csproj` không tham chiếu AppHost; chiều phụ thuộc chỉ `AppHost → Api`. `.gitignore` đã loại `bin/`, `obj/`: `git ls-files -o` chỉ liệt kê 5 file nguồn của AppHost.
- `MessagePack` ghim 2.5.307 chỉ ở AppHost (`Directory.Packages.props:27-28`), có comment nêu GHSA-qhrr-8q5h-9q3h, lý do (NU1902 là lỗi vì cảnh báo = lỗi), và điều kiện bỏ. `packages.lock.json` của AppHost ghi `MessagePack` Direct 2.5.307. Không có `ServiceDefaults`, không OpenTelemetry của dự án (OpenTelemetry chỉ là phụ thuộc gián tiếp trong cây Aspire).

**Swagger UI**
- Chỉ bật khi `app.Environment.IsDevelopment()` (`SwaggerUiExtensions.cs:56`) và nằm trong `#if DEBUG`: bản Debug chạy Production vẫn không có Swagger (hai lớp chặn). `MapOpenApi` chỉ ở Development (`ApiHostingExtensions.cs:117`).
- Điều kiện `ExcludeAssets="all"` cho Release giữ nguyên đồ thị restore: `packages.lock.json` của Api có đúng một mục `Swashbuckle.AspNetCore.SwaggerUI` Direct 10.3.0, không có nhánh theo cấu hình. Gói không có phụ thuộc gián tiếp.
- `khoi-tao.js` là chuỗi hằng (`KhoiTaoJs`), không nội suy dữ liệu người dùng. Middleware `PhucVuKhoiTaoAsync` chỉ nhận GET và khớp đúng một đường dẫn `Ordinal`; không mở đường dẫn tuỳ ý, không đọc file. Trang chủ cũng là chuỗi hằng, `validatorUrl: null` nên không gọi bộ kiểm tra trực tuyến.
- CSP không bị nới ở đâu: `SecurityHeadersMiddleware` đứng đầu pipeline và gắn bằng `OnStarting` cho mọi response, kể cả `/swagger/*`. Không thấy `unsafe-inline`, không ngoại lệ theo đường dẫn. Trang dùng `BaseLayout` để tránh logo SVG có `<style>` nội tuyến; mọi `<script>` có `src`.
- `SpaFallback`: `/swagger` và `/openapi` được coi như `/api` và `/health` (ProblemDetails, không bao giờ HTML). Đã dò tay các nhánh: `/swagger/` ngoài Development → `TraLoiApi` → không route khớp → 404; `/api/*` và `/health/*` không đổi nhánh; `/swaggerfoo` vẫn là trang React (so khớp theo segment); đường dẫn React không đổi. Thay đổi phụ: `POST /openapi/v1.json` ở Development nay là 405 `Allow: GET, HEAD` (route `MapOpenApi` chỉ có GET), trước đây 404 vì có đuôi file. Hợp lý và nhất quán với `/api/*`.
- `SwaggerUiTests` kiểm đúng điều quan trọng: so CSP với `SecurityHeaders.ContentSecurityPolicy` bằng `Assert.Single` (đúng một header, đúng nguyên văn) ở 404 ngoài Development, trang React, `/health/live`, `/openapi/v1.json`, `/swagger`, các tệp tĩnh; 404 ProblemDetails (`application/problem+json`) cho 8 đường dẫn ngoài Development và không lọt HTML của ứng dụng. Các ca cần gói nằm trong `#if DEBUG` nên `dotnet test -c Release` vẫn biên dịch được.

**vite.config.ts**
- `docApiUrl` chỉ nhận `http:`/`https:`, trả `url.origin` (bỏ đường dẫn, tài khoản, query); `docPort` yêu cầu `^\d+$` và 1-65535. Thông báo lỗi cố định, không chép giá trị (test `moi-truong-dev.test.ts` kiểm cả điều này). `strictPort: true` nên cổng bận thì dừng thay vì nhảy cổng lặng lẽ.
- `npm run build` (`command === 'build'`): không đọc biến, dùng mặc định; `build.*` không đổi (không source map, `dropConsole`, `dropDebugger`, obfuscate như cũ).

**CheThongTinCaNhan.cs** (đọc toàn bộ file và dò tay với `CheThongTinCaNhanTests`)
- Hai hằng bổ sung `SoChuSoDienThoaiNgan = 10`, `SoChuSoDienThoaiDai = 11` đúng giá trị, dùng ở `LaSoNhayCam`. Mọi tên được dùng đều có khai báo và có thân (`SoChuSoGiuMoiDau`, `SoChuSoCmnd`, `SoChuSoCccd`, `SoChuSoNhomTien`, `Nhom`, `TachNhom`, `TimCuaSoDaiNhat`, `LaSoTien`, `NoiBangDauChamNhom3`, `AppendChuSoDaChe`, `LamMuTatCa`, `CatDoDai`, `Email()`, `DayChuSo()`, `ThayDauCach`, `CheEmail`); không nhánh cụt.
- Đã dò tay với cả hai bộ: 45 mẫu che (đếm đủ: 13 + 18 + 9 + 5) và 22 mẫu không che (đủ 22), cùng các ca `Bo`. Kết quả khớp, kể cả các ca khó: `(028)38221234`, `(+84) 912 345 678` → `(+84*******78`, `20 05 2026 0912345678`, `1.001193 0912345678`, `100.000.000` và `1.000.000.000` (nhận ra là tiền, không che), `0 7 9 1 2 3 4 5 6 7 8 9`, `1 2 3 4 5 6 7 8 9`. Chỉ số mảng ở `NoiBangDauChamNhom3` không ra ngoài biên (`dau > 0` chặn nhóm đầu, kiểm `Dai == 3` trước khi dùng `Dau - 1`).
- Khối `<remarks>` mô tả đúng điều mã làm (10-11 chữ số bắt đầu 0; 11-12 bắt đầu 84; 12; 9; ngoại lệ số tiền; giới hạn đã biết). Hết thời gian regex (`RegexMatchTimeoutException`) rơi về `LamMuTatCa`: không để lọt dữ liệu.
- Không thấy dấu hiệu mất đoạn khác, trừ hằng thừa nêu ở Góp ý 2.

## Lỗi

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/FrontEnd/vite.config.ts:36-43` · `build/moi-truong-dev.ts:1-2` · `playwright.config.ts:30-34` | Comment dòng 39 nói "`npm run build` và test không đụng tới", nhưng Vitest nạp cấu hình với `command === 'serve'` (mode `test`), nên `docApiUrl(process.env.API_URL)` và `docPort(process.env.PORT)` chạy cả khi `npm test`. `PORT` là biến hay có sẵn ở máy, CI hay nền tảng chạy: đặt `PORT=abc` thì cả bộ test FE ném lỗi từ cấu hình; đặt `PORT=3000` thì Vite do Playwright `webServer` (`npm run dev`) nghe cổng 3000 trong khi Playwright chờ `http://localhost:5173` nên hết thời gian. Không phải lỗi bảo mật, nhưng một biến môi trường không liên quan làm gãy test và e2e của người khác. | Chỉ đọc hai biến khi chạy dev server thật: `const dev = command === 'serve' && !process.env.VITEST` (hoặc `mode !== 'test'`). Playwright: khai `env: { PORT: '5173' }` trong `webServer`, hoặc đổi tên biến riêng (vd. `VITE_DEV_PORT`, Aspire đặt được qua `WithEnvironment`). Sửa comment cho đúng; thêm test cho nhánh "Vitest không đọc biến". | ui-core-dev |
| Nên sửa | `src/BackEnd/DichVuCong.AppHost/DichVuCong.AppHost.csproj:1, 8` · `CLAUDE.md:194` · (repo không có `nuget.config`) | Chuỗi cung ứng. Lần chạy đầu AppHost kéo `aspire.cli` (qua `dnx`, giải ra `~/.aspire`, hiện khoảng 365 MB), gói dashboard và DCP (`aspire.dashboard.sdk.win-x64`, `aspire.hosting.orchestration.win-x64`), cộng 73 gói trong `packages.lock.json` của AppHost (Grpc, KubernetesClient, OpenTelemetry, ModelContextProtocol…). Phiên bản đã ghim theo `Aspire.AppHost.Sdk/13.6.1`, nhưng (1) gói ngầm của SDK (`aspire.cli`, dashboard, DCP) không nằm trong `packages.lock.json` nên không có hash cố định; (2) repo không có `nuget.config`, nên restore dùng nguồn nào có trong cấu hình người dùng, không có `packageSourceMapping`, không bắt buộc kiểm chữ ký. Mã tải về chạy với quyền người dùng ở máy dev (không vào bản triển khai). | Thêm `nuget.config` ở gốc repo: `<clear/>` rồi chỉ nuget.org, `packageSourceMapping` cho `*` về nuget.org, `signatureValidationMode=require` kèm `trustedSigners` của Microsoft và .NET Foundation. Ghi vào CLAUDE.md dòng 194: phiên bản cố định 13.6.1, lần đầu cần mạng, kéo gói từ NuGet.org. Khi nâng Aspire: đổi một chỗ (`Sdk` + `Directory.Packages.props`) rồi chạy `dotnet list package --vulnerable`. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/Chatbot/CheThongTinCaNhan.cs:26-27` | Sở hữu và truy vết. File thuộc `chatbot-dev` (`Features/Chatbot/`) nhưng `backend-dev` đã sửa. Nguyên nhân mất hai hằng chưa rõ, và repo chỉ có một commit (a4e19f6) trong khi các file này chưa commit, nên không có lịch sử để đối chiếu xem còn đoạn nào khác bị mất. Hai agent cùng ghi một file cùng lúc là lời giải thích hợp lý nhất. Review này đã dò tay toàn bộ file và hai bộ mẫu, không thấy đoạn nào khác mất. | `chatbot-dev` xác nhận và nhận lại file (chạy `CheThongTinCaNhanTests`, 45 + 22 ca). Giữ nguyên tắc "một file một chủ" khi chạy song song; khi người dùng cho phép commit, commit sớm để có điểm đối chiếu. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/Features/Chatbot/CheThongTinCaNhan.cs:24, 183` | `SoChuSoNhieuNhat = 12` khai nhưng không dùng ở đâu (trùng nghĩa `SoChuSoCccd`; `TimCuaSoDaiNhat` dòng 157 dùng `SoChuSoCccd` làm cận trên): có thể là vết của đoạn đã mất, hoặc dư từ đầu. Dòng 183: vế `or SoChuSoCccd` không bao giờ tới (12 chữ số đã trả `true` ở dòng 173), nên "11–12 bắt đầu 84" trong remarks chỉ đúng nhờ nhánh CCCD. Kết quả không sai. | Bỏ `SoChuSoNhieuNhat`, hoặc dùng nó làm cận trên ở dòng 157 (một nguồn). Rút dòng 183 về `dem is SoChuSoDienThoaiDai && ...` và chỉnh remarks cho khớp. | chatbot-dev |
| Góp ý | `src/BackEnd/DichVuCong.AppHost/AppHost.cs:20-24` | Chưa kiểm được địa chỉ lắng nghe của Api khi `IsProxied=false`. Mong đợi chỉ loopback, không phải mọi giao diện (`0.0.0.0`), vì máy dev có thể nằm chung mạng LAN (thử bằng điện thoại, kiosk). Cũng chưa rõ Vite (không đặt `server.host`, mặc định `localhost`) có bị Aspire thêm `--host`. Nếu ra LAN: Development tắt HSTS và `AllowedHosts` chỉ chặn theo Host, không theo nguồn. | Chạy AppHost rồi `netstat -ano` lọc LISTENING các cổng 7157, 5157, 5173, 17000, 21000, 22000 và xác nhận `127.0.0.1`/`[::1]`. Nếu không, đặt tường minh `endpoint.TargetHost = "localhost"` cho Api và Vite, và ghi một dòng trong CLAUDE.md. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.AppHost/AppHost.cs:33-35` | Có `node_modules` thì không bao giờ chạy lại `npm ci`. Sau khi ai đó đổi `package-lock.json`, người chạy AppHost vẫn dùng thư viện cũ cho đến khi tự `npm ci` (có thể là bản đã biết lỗ hổng). Chọn này có chủ đích (comment nêu lý do), nên chỉ là góp ý. | Giữ nguyên, nhưng ghi vào CLAUDE.md (dòng 190-195) "đổi lockfile thì `npm ci` thủ công". Hoặc so thời gian sửa `package-lock.json` với `node_modules/.package-lock.json` để quyết định `install`. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Tests/Api/SwaggerUiTests.cs` | Thiếu ba điều test nên giữ. (1) `POST /openapi/v1.json` ở Development → 405 kèm `Allow` (thay đổi phụ của `SpaFallback`). (2) Trang Swagger và `khoi-tao.js` không chứa `http://` hay `https://` (giữ quy tắc "không tài nguyên ngoài" và `validatorUrl: null`). (3) Bản Release không nạp Swashbuckle (trong `#if !DEBUG`: dựng `DevelopmentApiFactory` rồi kiểm không assembly nào tên bắt đầu `Swashbuckle`). Chưa có test giữ "Api không tham chiếu `DichVuCong.AppHost`" (cùng chỗ với Góp ý trong `KienTrucTests` của T30). | Bổ sung ba ca trên và một ca vào `KienTrucTests`. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.Api/DichVuCong.Api.csproj:16-20` | Hai dòng `PackageReference` gần như trùng nhau chỉ để đổi `ExcludeAssets` theo cấu hình. Cấu hình khác Debug/Release (nếu thêm sau này) thì gói được tham chiếu nhưng `DEBUG` có thể không định nghĩa: vô hại, nhưng ý định khó đọc. | Một dòng với `ExcludeAssets="$(AssetsBiLoai)"`, `AssetsBiLoai` = `all` khi `Configuration == Release`, rỗng nếu khác; hoặc giữ nguyên. | backend-dev |
| Góp ý | `src/BackEnd/DichVuCong.sln` · `Directory.Packages.props:23-29` | AppHost nằm trong solution nên `dotnet build/test --solution` và `dotnet list package --vulnerable` cấp solution kéo cả cây Aspire. Cổng phát hành của CLAUDE.md ("không còn High/Critical") sẽ phải xử lý lỗ hổng của cây dev này dù nó không vào bản triển khai (MessagePack là ví dụ đã gặp). | Giữ AppHost trong solution, nhưng ghi vào quy trình phát hành: kiểm lỗ hổng cho `Api`, `Data`, `Import` là bắt buộc; kết quả của AppHost chỉ để tham khảo. Cân nhắc kiểm theo từng project. | backend-dev |
| Góp ý | `CLAUDE.md:73-76` · `.specify/specs/F00-khung-he-thong/plan.md` · `tasks.md` | Tài liệu chưa theo kịp. "Phụ thuộc chỉ một chiều" chưa nêu `AppHost → Api` (chỉ dev). `plan.md`/`tasks.md` không có mục nào cho AppHost và Swagger UI (chỉ có comment trong `Directory.Packages.props` và CLAUDE.md dòng 53, 191-195), trong khi CLAUDE.md yêu cầu lý do gói mới ghi ở `plan.md` hoặc báo cáo. Lý do hiện có đủ ý nhưng nằm rải ở comment. | Thêm vào CLAUDE.md "AppHost → Api (chỉ dev)"; thêm một mục ngắn trong `plan.md` liệt kê 3 gói: `Aspire.Hosting.JavaScript` 13.6.1, `MessagePack` 2.5.307 (ghim vì GHSA), `Swashbuckle.AspNetCore.SwaggerUI` 10.3.0, kèm lý do và phạm vi chỉ dev. | planner |
| Góp ý | `src/BackEnd/DichVuCong.AppHost/AppHost.cs:6-8` | Số cổng 7157/5157/5173 lặp ở AppHost, `Api/Properties/launchSettings.json`, `vite.config.ts` + `moi-truong-dev.ts`, `playwright.config.ts` và CLAUDE.md. Đổi cổng phải sửa nhiều nơi; sai một nơi thì AppHost chạy được nhưng proxy hoặc e2e gãy. Comment dòng 6 đã nêu danh sách nơi phải khớp nên rủi ro thấp. | Chấp nhận. Nếu muốn giảm: để AppHost đọc `applicationUrl` từ launchSettings của Api thay vì đặt cổng thứ hai. | backend-dev |

## Việc chỉ chạy thật mới kiểm được (điều phối viên đang chạy build/test nền)

- `dotnet publish src/BackEnd/DichVuCong.Api -c Release`: đầu ra không có `Swashbuckle*.dll`, không có mục Swashbuckle trong `*.deps.json`, không `.pdb`. Ở T30 đầu ra publish đã sạch; cần xác nhận lại vì csproj mới.
- `dotnet restore src/BackEnd/DichVuCong.sln --locked-mode` ở cả `-c Debug` và `-c Release`: lockfile không đổi giữa hai cấu hình (đọc mã cho thấy không đổi, chưa chạy).
- `dotnet build src/BackEnd/DichVuCong.sln -c Release`: không còn lỗi về `SoChuSoDienThoaiNgan`/`SoChuSoDienThoaiDai`; `SoChuSoNhieuNhat` không gây cảnh báo (IDE0051 mặc định mức gợi ý, `.editorconfig` không nâng).
- Chạy AppHost thật: địa chỉ lắng nghe (Góp ý 3), dashboard đòi token, Api và Vite lên healthy (Aspire gọi `/health/ready` định kỳ từ cùng IP, trong hạn mức nhóm DanhMuc).
