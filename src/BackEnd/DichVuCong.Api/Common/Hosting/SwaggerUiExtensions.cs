namespace DichVuCong.Api.Common.Hosting;

/// <summary>
/// Giao diện Swagger UI cho máy dev, đọc tài liệu OpenAPI có sẵn (<c>/openapi/v1.json</c>); không có bộ sinh tài liệu thứ hai.
/// Chỉ biên dịch ở cấu hình Debug (gói Swashbuckle.AspNetCore.SwaggerUI không vào bản Release/publish) và chỉ bật ở môi trường Development.
/// <para>
/// CSP giữ nguyên văn (không <c>unsafe-inline</c>). Hai chỗ mặc định của Swagger UI trái CSP nên được thay:
/// script khởi tạo nội tuyến (trang mặc định đã tách ra <c>index.js</c>, ở đây dùng <c>khoi-tao.js</c> cùng nguồn), và
/// <c>StandaloneLayout</c> (thanh trên cùng có logo SVG chứa thẻ <c>&lt;style&gt;</c> nội tuyến, bị <c>style-src 'self'</c> chặn,
/// báo lỗi CSP ở console) — dùng <c>BaseLayout</c>, không có thanh trên cùng.
/// </para>
/// </summary>
internal static class SwaggerUiExtensions
{
    internal const string RoutePrefix = "swagger";

#if DEBUG
    private const string KhoiTaoPath = "/" + RoutePrefix + "/khoi-tao.js";

    // Các tệp swagger-ui.css, swagger-ui-bundle.js, index.css, favicon do middleware của gói phục vụ (tài nguyên nhúng, cùng nguồn).
    private const string TrangChu = """
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>%(DocumentTitle)</title>
            <link rel="stylesheet" type="text/css" href="swagger-ui.css">
            <link rel="stylesheet" type="text/css" href="index.css">
            <link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32">
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="swagger-ui-bundle.js" charset="utf-8"></script>
            <script src="khoi-tao.js" charset="utf-8"></script>
        </body>
        </html>
        """;

    private const string KhoiTaoJs = """
        window.onload = function () {
            window.ui = SwaggerUIBundle({
                url: '/openapi/v1.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis],
                layout: 'BaseLayout',
                validatorUrl: null,
                deepLinking: true
            });
        };
        """;
#endif

    public static WebApplication UseSwaggerUiChoDev(this WebApplication app)
    {
#if DEBUG
        if (app.Environment.IsDevelopment())
        {
            app.UseSwaggerUI(options =>
            {
                options.RoutePrefix = RoutePrefix;
                options.DocumentTitle = "Dich vu cong - API";
                options.IndexStream = () => new MemoryStream(System.Text.Encoding.UTF8.GetBytes(TrangChu));
            });
            app.Use(PhucVuKhoiTaoAsync);
        }
#endif

        return app;
    }

#if DEBUG
    private static Task PhucVuKhoiTaoAsync(HttpContext context, RequestDelegate next)
    {
        if (!HttpMethods.IsGet(context.Request.Method) || !context.Request.Path.Equals(KhoiTaoPath, StringComparison.Ordinal))
        {
            return next(context);
        }

        context.Response.ContentType = "text/javascript; charset=utf-8";
        return context.Response.WriteAsync(KhoiTaoJs);
    }
#endif
}
