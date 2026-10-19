// Chỉ cho máy dev: một lệnh chạy Api + Vite dev server + dashboard. Không ServiceDefaults, không container.
//   dotnet run --project src/BackEnd/DichVuCong.AppHost                              nguồn dữ liệu Mẫu (không cần DB)
//   dotnet run --project src/BackEnd/DichVuCong.AppHost --launch-profile https-postgresql   PostgreSQL local
const string NguonMau = "Mau";
const string NguonPostgreSql = "PostgreSql";
const int CongApiHttps = 7157; // khớp AllowedHosts Development, vite.config.ts, tài liệu và Api/Properties/launchSettings.json
const int CongApiHttp = 5157;
const int CongVite = 5173;

var builder = DistributedApplication.CreateBuilder(args);

// Nguồn dữ liệu do launch profile của AppHost chọn (biến DuLieu__Nguon), sai tên thì dừng ngay như Api.
// Chuỗi kết nối PostgreSQL KHÔNG đi qua AppHost: Api tự đọc từ user-secrets (UserSecretsId "dichvucong") ở Development.
var nguon = builder.Configuration["DuLieu:Nguon"] ?? NguonMau;
if (nguon is not (NguonMau or NguonPostgreSql))
{
    throw new InvalidOperationException($"DuLieu:Nguon chỉ nhận '{NguonMau}' hoặc '{NguonPostgreSql}'.");
}

// Cổng cố định và không qua proxy của Aspire: Api nhận kết nối trực tiếp như khi chạy bằng 'dotnet run' (IP máy gọi thật,
// Host đúng 'localhost:7157'), nên giới hạn tần suất theo IP và lọc Host của Api hành xử y như thường.
var api = builder.AddProject<Projects.DichVuCong_Api>("api", launchProfileName: "https")
    .WithEndpoint("https", endpoint => { endpoint.Port = CongApiHttps; endpoint.IsProxied = false; })
    .WithEndpoint("http", endpoint => { endpoint.Port = CongApiHttp; endpoint.IsProxied = false; })
    .WithEnvironment("DuLieu__Nguon", nguon)
    // Aspire 13.6.1 không đặt biến này cho Api (đã kiểm trên dashboard); đặt tường minh false để lần nâng Aspire sau không vô tình
    // bật cơ chế tin mọi nguồn X-Forwarded-* (plan F00 §9.17: chỉ bật bằng Hosting:ForwardedHeaders với proxy đã khai).
    .WithEnvironment("ASPNETCORE_FORWARDEDHEADERS_ENABLED", "false")
    .WithHttpHealthCheck("/health/ready");

// Vite nhận địa chỉ Api qua API_URL và cổng qua PORT (Aspire đặt PORT theo endpoint); xem src/FrontEnd/vite.config.ts.
// Đã có node_modules thì không cài lại (không đụng lockfile lúc người khác đang sửa FE); chưa có thì 'npm ci' đúng lockfile.
var daCoNodeModules = Directory.Exists(Path.Combine(builder.AppHostDirectory, "..", "..", "FrontEnd", "node_modules"));
builder.AddViteApp("fe", Path.Combine("..", "..", "FrontEnd"))
    .WithNpm(install: !daCoNodeModules, installCommand: "ci")
    .WithEndpoint("http", endpoint => { endpoint.Port = CongVite; endpoint.IsProxied = false; })
    .WithEnvironment("API_URL", api.GetEndpoint("https"))
    .WaitFor(api);

builder.Build().Run();
