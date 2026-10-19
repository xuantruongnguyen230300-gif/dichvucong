using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Chạy API với nguồn dữ liệu Mẫu (file nhúng thật, không có DB, không có chuỗi kết nối) và một web root tạm,
/// để kết quả không phụ thuộc bản build FE trong wwwroot của máy.
/// Test cần đường PostgreSql dùng <see cref="PostgreSqlApiFactory"/> (chuỗi kết nối giả).
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    /// <summary>Chuỗi kết nối giả: không trỏ tới máy nào.</summary>
    public const string ChuoiKetNoiGia = "Host=khong-co-may-nay;Database=x;Username=x;Password=BI-MAT-KET-NOI";

    private readonly string _webRoot = Directory.CreateTempSubdirectory("dvc-wwwroot-").FullName;

    protected virtual string EnvironmentName => "Production";

    /// <summary>Web root tạm của factory (test ghi đè file ở đây).</summary>
    public string WebRoot => _webRoot;

    /// <summary>Giá trị <c>DuLieu:Nguon</c>; null thì không khai (như bản triển khai quên khai).</summary>
    protected virtual string? NguonDuLieu => "Mau";

    /// <summary>Giá trị <c>ConnectionStrings:DichVuCong</c>; null thì không khai.</summary>
    protected virtual string? ChuoiKetNoi => null;

    /// <summary>Giá trị <c>AllowedHosts</c>; null thì không khai (bản triển khai chưa khai tên miền).</summary>
    protected virtual string? AllowedHosts => null;

    /// <summary>
    /// Giá trị <c>Caching:PhienBanDuLieu</c>. Mặc định "00:00:00" (không giữ trong bộ nhớ): test nhập lại rồi gọi API thấy dữ liệu mới ngay.
    /// Test về bộ nhớ phiên bản ghi đè bằng giá trị thật.
    /// </summary>
    protected virtual string PhienBanDuLieuGiu => "00:00:00";

    /// <summary>Nội dung index.html trong web root tạm; null thì không có file.</summary>
    protected virtual string? IndexHtml => null;

    /// <summary>Nội dung dac-ta-trang.json trong web root tạm; null thì không có file.</summary>
    protected virtual string? DacTaTrangJson => null;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (IndexHtml is not null)
        {
            File.WriteAllText(Path.Combine(_webRoot, "index.html"), IndexHtml);
        }

        if (DacTaTrangJson is not null)
        {
            File.WriteAllText(Path.Combine(_webRoot, "dac-ta-trang.json"), DacTaTrangJson);
        }

        builder.UseEnvironment(EnvironmentName);
        builder.UseSetting("Caching:PhienBanDuLieu", PhienBanDuLieuGiu);
        builder.UseWebRoot(_webRoot);
        // Program.cs đọc cấu hình ngay khi dựng; UseSetting có hiệu lực sớm hơn ConfigureAppConfiguration.
        if (NguonDuLieu is not null)
        {
            builder.UseSetting("DuLieu:Nguon", NguonDuLieu);
        }

        if (ChuoiKetNoi is not null)
        {
            builder.UseSetting("ConnectionStrings:DichVuCong", ChuoiKetNoi);
        }

        if (AllowedHosts is not null)
        {
            builder.UseSetting("AllowedHosts", AllowedHosts);
        }

        builder.ConfigureServices(services => services
            .AddControllers()
            .AddApplicationPart(typeof(ApiFactory).Assembly));
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && Directory.Exists(_webRoot))
        {
            Directory.Delete(_webRoot, recursive: true);
        }
    }

    public HttpClient CreateHttpsClient() =>
        CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
}

/// <summary>Nguồn PostgreSql với chuỗi kết nối giả: dựng được API, nhưng DB không tới được.</summary>
public class PostgreSqlApiFactory : ApiFactory
{
    protected override string? NguonDuLieu => "PostgreSql";

    protected override string? ChuoiKetNoi => ChuoiKetNoiGia;
}

public sealed class DevelopmentApiFactory : ApiFactory
{
    protected override string EnvironmentName => "Development";
}

public sealed class ApiCoIndexFactory : ApiFactory
{
    public const string Noi_dung = "<!doctype html><title>x</title>";

    protected override string? IndexHtml => Noi_dung;
}

public sealed class CauHinhSaiFactory : ApiFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "0");
    }
}

public sealed class GioiHanChatFactory : ApiFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("RateLimiting:DanhMuc", "1");
    }
}
