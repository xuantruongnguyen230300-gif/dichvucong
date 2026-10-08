# F00 · Khung hệ thống — tasks

`[P]` = chạy song song được với task liền trước.

- [x] T01 [điều phối] `global.json`, `.editorconfig`, `.gitattributes`, `.nvmrc`, `.gitignore` — xong
- [x] T02 [điều phối] Solution + 4 project + `Directory.Build.props` + `Directory.Packages.props`; build sạch — xong
- [ ] T03 [db-dev] `AppDbContext` hoàn chỉnh + `AddDichVuCongData` (pool, snake_case) + `Text/TiengViet.cs` + `Tests/Data/TiengVietTests.cs` theo bộ mẫu §4 — xong khi: test xanh
- [ ] T04 [db-dev] Migration `KhoiTao` (unaccent, pg_trgm); user-secrets `dichvucong`; `dotnet ef database update` tạo DB `dichvucong` — xong khi: trong DB thấy 2 extension
- [ ] T05 [db-dev] Import: Generic Host + cấu hình + DI; in hướng dẫn lệnh — xong khi: chạy không tham số in hướng dẫn, mã thoát 0
- [ ] T06 [backend-dev] [P] `Program.cs` + `Common/` (Hosting, Security, Errors, RateLimiting, Caching); health live/ready; static + fallback; OpenAPI ở dev; `appsettings.json`, `launchSettings.json` — xong khi: build sạch; `curl -k -I https://localhost:7157/health/live` → 200 + đủ header, không có header `Server`; `/health/ready` → 200 khi DB chạy
- [ ] T07 [backend-dev] `Tests/Api/`: health + header + ProblemDetails — xong khi: `dotnet test` xanh
- [ ] T08 [ui-core-dev] [P] Khởi tạo Vite + React 19 + TS strict, ESLint, Vitest; cấu trúc thư mục theo plan §2
- [ ] T09 [ui-core-dev] `vite.config.ts`: proxy, `outDir` wwwroot, không source map, bỏ console, chunk vendor, obfuscate — xong khi: `npm run build` ra wwwroot, không có file `.map`; báo kích thước từng chunk (gzip)
- [ ] T10 [ui-core-dev] `app/`, `core/api/http.ts`, `core/hooks/`, `core/utils/tiengViet.ts` + test theo bộ mẫu §4, `features/trang-chu` tạm — xong khi: `npm test` và `npm run lint` sạch
- [ ] T11 [ui-core-dev] Playwright 2 khổ + smoke test — xong khi: chạy được với BE + Vite dev đang chạy
- [ ] T12 [code-reviewer] Review F00 → `result/review.md`
- [ ] T13 [ui-core-dev] (sau khi design system được duyệt) `tokens.css`, font tự host, component lõi, trang xem trước design system
