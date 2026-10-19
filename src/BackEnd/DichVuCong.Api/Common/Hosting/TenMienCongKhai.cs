namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Tên miền được phép theo <c>AllowedHosts</c> (khai ở cấu hình triển khai; Development: <c>appsettings.Development.json</c>).
/// Lọc <c>Host</c> do <see cref="KiemTraHostMiddleware"/> làm (đứng sau middleware header bảo mật, nên response 400 cũng có đủ header
/// và là ProblemDetails; host filtering của framework bị tắt vì nó đứng ngoài cùng). Khi đã khai đích danh, <c>Host</c> tới được
/// <c>TrangHtml</c> là giá trị tin được. Chưa khai, hoặc khai <c>*</c>: <c>Host</c> là chuỗi bất kỳ của client, không dùng để dựng địa chỉ.
/// </summary>
public sealed class TenMienCongKhai
{
    private readonly (string Host, int? Cong)[] _mau;

    public TenMienCongKhai(string? allowedHosts)
    {
        var muc = (allowedHosts ?? string.Empty)
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        HostTinCay = muc.Length > 0 && !muc.Contains("*", StringComparer.Ordinal);
        _mau = [.. muc.Select(m =>
        {
            var host = new HostString(m);
            return (host.Host, host.Port);
        })];
    }

    /// <summary>True khi <c>AllowedHosts</c> có ít nhất một tên và không có mục <c>*</c>.</summary>
    public bool HostTinCay { get; }

    public static TenMienCongKhai TuCauHinh(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        return new TenMienCongKhai(configuration["AllowedHosts"]);
    }

    /// <summary>
    /// <c>Host</c> có được phép không. Chưa khai đích danh thì mọi Host hợp lệ; Host rỗng luôn qua (như framework).
    /// Mẫu: tên đúng, <c>*.tên</c> (tên con), kèm cổng thì phải đúng cổng; không phân biệt hoa thường.
    /// </summary>
    public bool HopLe(HostString host)
    {
        if (!HostTinCay || !host.HasValue)
        {
            return true;
        }

        var ten = host.Host;
        foreach (var (mauHost, mauCong) in _mau)
        {
            if (mauCong is not null && mauCong != host.Port)
            {
                continue;
            }

            if (string.Equals(mauHost, ten, StringComparison.OrdinalIgnoreCase)
                || (mauHost.StartsWith("*.", StringComparison.Ordinal)
                    && ten.Length > mauHost.Length - 1
                    && ten.EndsWith(mauHost.AsSpan(1), StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>Địa chỉ tuyệt đối của trang, hoặc null khi <c>Host</c> không tin được.</summary>
    public string? DiaChiTuyetDoi(HttpRequest request, string duongDan)
    {
        ArgumentNullException.ThrowIfNull(request);

        return HostTinCay ? $"{request.Scheme}://{request.Host.Value}{duongDan}" : null;
    }
}

/// <summary>Host không nằm trong <c>AllowedHosts</c> → 400 ProblemDetails (mã <c>du-lieu-khong-hop-le</c>), không phản chiếu Host.</summary>
public sealed class KiemTraHostMiddleware(RequestDelegate next, TenMienCongKhai tenMien, IProblemDetailsService problems)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!tenMien.HopLe(context.Request.Host))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = context });
            return;
        }

        await next(context);
    }
}

/// <summary>Cảnh báo lúc khởi động ngoài Development khi chưa khai <c>AllowedHosts</c> đích danh.</summary>
internal sealed partial class CanhBaoTenMien(TenMienCongKhai tenMien, IHostEnvironment environment, ILogger<CanhBaoTenMien> logger) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (!tenMien.HostTinCay && !environment.IsDevelopment())
        {
            LogChuaKhai(logger);
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Chưa khai AllowedHosts (hoặc khai '*'): mọi Host đều được nhận; trang không có og:url và DC.identifier. Khai AllowedHosts bằng tên miền công khai.")]
    private static partial void LogChuaKhai(ILogger logger);
}
