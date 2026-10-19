using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Security;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Swagger UI chỉ có ở Development (và chỉ khi biên dịch Debug: gói không vào bản Release/publish).
/// CSP phải giữ nguyên văn ở mọi đường dẫn, kể cả /swagger — không ngoại lệ <c>unsafe-inline</c>.
/// </summary>
public sealed class SwaggerUiTests
{
    private static async Task<(HttpResponseMessage Response, string Body)> GetAsync(ApiFactory factory, string path)
    {
        using var client = factory.CreateHttpsClient();
        var response = await client.GetAsync(path, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        return (response, body);
    }

    private static void KiemCspNguyenVan(HttpResponseMessage response) =>
        Assert.Equal(SecurityHeaders.ContentSecurityPolicy, Assert.Single(response.Headers.GetValues("Content-Security-Policy")));

    [Theory]
    [InlineData("/swagger")]
    [InlineData("/swagger/")]
    [InlineData("/swagger/index.html")]
    [InlineData("/swagger/khoi-tao.js")]
    [InlineData("/swagger/swagger-ui-bundle.js")]
    [InlineData("/swagger/v1/swagger.json")]
    [InlineData("/openapi/v1.json")]
    [InlineData("/openapi/v1")]
    public async Task Ngoai_development_swagger_va_openapi_la_404_problem_details_khong_phai_html_ung_dung(string duongDan)
    {
        // Có index.html của ứng dụng: nếu rơi vào fallback của React thì sẽ trả 200 HTML.
        await using var factory = new ApiCoIndexFactory();

        var (response, body) = await GetAsync(factory, duongDan);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.DoesNotContain(ApiCoIndexFactory.Noi_dung, body, StringComparison.Ordinal);
        using var json = JsonDocument.Parse(body);
        Assert.Equal(404, json.RootElement.GetProperty("status").GetInt32());
        KiemCspNguyenVan(response);
    }

    [Fact]
    public async Task Ngoai_development_cac_duong_dan_react_van_tra_index_html_voi_csp_nguyen_van()
    {
        await using var factory = new ApiCoIndexFactory();

        var (response, body) = await GetAsync(factory, "/tra-cuu");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ApiCoIndexFactory.Noi_dung, body);
        KiemCspNguyenVan(response);
    }

    [Fact]
    public async Task Development_duong_dan_khac_van_giu_csp_nguyen_van()
    {
        await using var factory = new DevelopmentApiFactory();

        var (response, _) = await GetAsync(factory, "/health/live");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        KiemCspNguyenVan(response);
    }

    [Fact]
    public async Task Development_openapi_tra_tai_lieu_va_khong_phai_html()
    {
        await using var factory = new DevelopmentApiFactory();

        var (response, body) = await GetAsync(factory, "/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using var json = JsonDocument.Parse(body);
        Assert.True(json.RootElement.TryGetProperty("paths", out _));
        KiemCspNguyenVan(response);
    }

#if DEBUG
    [Fact]
    public async Task Development_swagger_tra_trang_khong_script_noi_tuyen_voi_csp_nguyen_van()
    {
        await using var factory = new DevelopmentApiFactory();

        // /swagger chuyển hướng tới /swagger/index.html (client tự theo).
        var (response, body) = await GetAsync(factory, "/swagger");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
        KiemCspNguyenVan(response);
        Assert.Contains("id=\"swagger-ui\"", body, StringComparison.Ordinal);
        // Mọi thẻ script đều có src (CSP script-src 'self' chặn script nội tuyến); không thẻ style, không thuộc tính style.
        Assert.DoesNotContain("<script>", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("<style", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(" style=", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("onload=", body, StringComparison.OrdinalIgnoreCase);
        // BaseLayout: StandaloneLayout vẽ logo SVG có thẻ <style> nội tuyến, vi phạm style-src 'self'.
        Assert.Contains("layout: 'BaseLayout'", await LayAsync(factory, "/swagger/khoi-tao.js"), StringComparison.Ordinal);
        Assert.Contains("/openapi/v1.json", await LayAsync(factory, "/swagger/khoi-tao.js"), StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/swagger/khoi-tao.js", "javascript")]
    [InlineData("/swagger/swagger-ui-bundle.js", "javascript")]
    [InlineData("/swagger/swagger-ui.css", "css")]
    [InlineData("/swagger/index.css", "css")]
    public async Task Development_tep_tinh_cua_swagger_tra_200_cung_nguon_voi_csp_nguyen_van(string duongDan, string kieu)
    {
        await using var factory = new DevelopmentApiFactory();

        var (response, _) = await GetAsync(factory, duongDan);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(kieu, response.Content.Headers.ContentType?.MediaType, StringComparison.Ordinal);
        KiemCspNguyenVan(response);
    }

    [Fact]
    public async Task Development_swagger_chi_nhan_get()
    {
        await using var factory = new DevelopmentApiFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.PostAsync("/swagger/index.html", content: null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        KiemCspNguyenVan(response);
    }

    private static async Task<string> LayAsync(ApiFactory factory, string duongDan) => (await GetAsync(factory, duongDan)).Body;
#endif
}
