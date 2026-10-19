using Microsoft.AspNetCore.WebUtilities;

namespace DichVuCong.Api.Common.Errors;

/// <summary>
/// Mọi ProblemDetails đi qua đây: thêm <c>code</c> và <c>maTraCuu</c>, đặt <c>title</c> thành cụm chuẩn của mã HTTP,
/// bỏ <c>traceId</c> (mã tra cứu thay vai trò này), và ghi nhật ký kèm mã.
/// </summary>
public static partial class ProblemDetailsCustomizer
{
    public const string TenLogger = "DichVuCong.Api.Errors";

    public static void Apply(ProblemDetailsContext context)
    {
        var http = context.HttpContext;
        var problem = context.ProblemDetails;
        var status = problem.Status ?? http.Response.StatusCode;
        problem.Status = status;
        // Framework không có sẵn `type` cho 429; bổ sung để cùng tập trường với các lỗi khác.
        if (status == StatusCodes.Status429TooManyRequests)
        {
            problem.Type ??= "https://tools.ietf.org/html/rfc6585#section-4";
        }

        problem.Title = ReasonPhrases.GetReasonPhrase(status);
        problem.Extensions[MaLoi.TruongCode] = MaLoi.TuMaHttp(status);
        problem.Extensions.Remove("traceId");

        var daCo = MaTraCuu.DaCo(http);
        var ma = MaTraCuu.LayHoacTao(http);
        problem.Extensions[MaTraCuu.TruongJson] = ma;

        var logger = http.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger(TenLogger);
        using var scope = logger.BeginScope(new Dictionary<string, object> { ["TraceId"] = http.TraceIdentifier });
        if (status < StatusCodes.Status500InternalServerError)
        {
            // Chỉ ghi mẫu route, không ghi đường dẫn và query client gửi (có thể mang số CCCD, điện thoại, từ khoá).
            LogClientError(logger, ma, status, http.Request.Method, NhatKy.MauDuongDan(http, status));
        }
        else if (!daCo)
        {
            // 5xx không qua GlobalExceptionHandler (vd. status code trần): chưa ai log.
            LogServerError(logger, ma, status, http.Request.Method, NhatKy.MauDuongDan(http, status));
        }
    }

    [LoggerMessage(Level = LogLevel.Information,
        Message = "Lỗi {MaTraCuu}: HTTP {MaHttp} {PhuongThuc} {DuongDan}")]
    private static partial void LogClientError(ILogger logger, string maTraCuu, int maHttp, string phuongThuc, string duongDan);

    [LoggerMessage(Level = LogLevel.Error,
        Message = "Lỗi {MaTraCuu}: HTTP {MaHttp} {PhuongThuc} {DuongDan}")]
    private static partial void LogServerError(ILogger logger, string maTraCuu, int maHttp, string phuongThuc, string duongDan);
}
