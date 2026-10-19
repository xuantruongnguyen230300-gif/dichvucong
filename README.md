# Tra cứu TTHC — Trung tâm Phục vụ Hành chính công xã Cần Giuộc

Trang tra cứu thủ tục hành chính cho người dân (điện thoại, kiosk). Nghiệp vụ và kế hoạch nằm trong `.specify/` (bắt đầu từ `.specify/nghiep-vu/tong-quan.md`); quy ước kỹ thuật ở `CLAUDE.md`.

## Cần có trên máy

- .NET SDK 10 (phiên bản khoá trong `global.json`)
- Node.js 24 LTS (`.nvmrc`; Node 20 vẫn build được)
- Chứng chỉ HTTPS dev: `dotnet dev-certs https --trust` (một lần)
- PostgreSQL 18 — **chỉ khi** chạy nguồn PostgreSQL; demo không cần

## Chạy demo (nguồn dữ liệu Mẫu, không cần PostgreSQL)

```
cd src/FrontEnd
npm ci
npm run build          # build FE vào wwwroot của Api; chạy lại mỗi khi FE đổi
cd ../..
dotnet run --project src/BackEnd/DichVuCong.Api    # https://localhost:7157
```

Hoặc một lệnh bằng .NET Aspire (Api + Vite có hot reload + dashboard; lần đầu cần mạng, khởi động khoảng 30 giây):

```
dotnet run --project src/BackEnd/DichVuCong.AppHost    # Vite http://localhost:5173 · dashboard https://localhost:17000
```

Swagger UI (chỉ Development): https://localhost:7157/swagger

## Chạy với PostgreSQL

```
dotnet user-secrets set "ConnectionStrings:DichVuCong" "Host=localhost;Port=5432;Database=dichvucong;Username=postgres;Password=postgres" --project src/BackEnd/DichVuCong.Api
dotnet ef database update --project src/BackEnd/DichVuCong.Data --startup-project src/BackEnd/DichVuCong.Api -- --DuLieu:Nguon=PostgreSql
dotnet run --project src/BackEnd/DichVuCong.Api --launch-profile https-postgresql
```

Chuỗi kết nối chỉ để ở user-secrets hoặc biến môi trường `ConnectionStrings__DichVuCong`, không đưa vào repo.

## Kiểm tra

```
dotnet build src/BackEnd/DichVuCong.sln
dotnet test --solution src/BackEnd/DichVuCong.sln     # không có PostgreSQL thì các ca cần DB tự bỏ qua
cd src/FrontEnd
npm run lint && npm test
npx playwright install chromium && npx playwright test   # e2e, lần đầu cần tải trình duyệt
```

## Không có trong repo

- `data-mau/` (dữ liệu nguồn lấy từ Vàm Cỏ): chỉ dùng local, không commit. Nguồn Mẫu dùng file đã làm sạch `src/BackEnd/DichVuCong.Data/Mau/du-lieu-mau.json`; muốn sinh lại thì cần `data-mau/` (lệnh ở `CLAUDE.md`).
- Chuỗi kết nối DB, khoá và mật khẩu thật.
