using System.Net;
using System.Text.Json;
using DichVuCong.Api.Common.Errors;

namespace DichVuCong.Tests.Api;

public sealed class ApiPipelineTests : IClassFixture<ApiFactory>
{
    private const string ProblemJson = "application/problem+json";

    // Giá trị bắt buộc, chép nguyên văn từ mục Bảo mật của CLAUDE.md — không lấy từ hằng số trong code.
    private const string CspBatBuoc =
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; " +
        "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    private readonly ApiFactory _factory;

    public ApiPipelineTests(ApiFactory factory) => _factory = factory;

    private static string Header(HttpResponseMessage response, string name) =>
        Assert.Single(response.Headers.GetValues(name));

    private static async Task KiemProblemAsync(HttpResponseMessage response, HttpStatusCode status, string code)
    {
        Assert.Equal(status, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        using var json = JsonDocument.Parse(body);
        Assert.Equal(code, json.RootElement.GetProperty("code").GetString());
        Assert.Equal((int)status, json.RootElement.GetProperty("status").GetInt32());
    }

    private static void KiemHeaderBaoMat(HttpResponseMessage response)
    {
        Assert.Equal(CspBatBuoc, Header(response, "Content-Security-Policy"));
        Assert.Equal("nosniff", Header(response, "X-Content-Type-Options"));
        Assert.Equal("strict-origin-when-cross-origin", Header(response, "Referrer-Policy"));
        Assert.Equal("microphone=(), camera=(), geolocation=()", Header(response, "Permissions-Policy"));
    }

    [Fact]
    public async Task Health_live_tra_200_va_du_header_bao_mat()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        KiemHeaderBaoMat(response);
        Assert.Equal("max-age=31536000; includeSubDomains", Header(response, "Strict-Transport-Security"));
    }

    [Fact]
    public async Task Health_ready_nguon_PostgreSql_khi_db_khong_toi_duoc_tra_503_trong_2_giay_khong_lo_thong_tin_db()
    {
        await using var factory = new PostgreSqlApiFactory();
        using var client = factory.CreateHttpsClient();
        // Gọi ready 3 lần (lần đầu gồm khởi động máy chủ thử, JIT Npgsql) và lấy lần nhanh nhất: khi cả bộ test chạy song song,
        // luồng bị đói có thể làm một lần chậm vì lý do ngoài ứng dụng.
        var nhanNhat = TimeSpan.MaxValue;
        HttpResponseMessage? response = null;
        for (var lan = 0; lan < 3; lan++)
        {
            response?.Dispose();
            var dongHo = System.Diagnostics.Stopwatch.StartNew();
            response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);
            nhanNhat = TimeSpan.FromTicks(Math.Min(nhanNhat.Ticks, dongHo.Elapsed.Ticks));
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        }

        using var cuoi = response!;
        var body = await cuoi.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.True(nhanNhat < TimeSpan.FromSeconds(2), $"Mất {nhanNhat}");
        Assert.Equal("Unhealthy", body);
        Assert.DoesNotContain("BI-MAT-KET-NOI", body, StringComparison.Ordinal);
        KiemHeaderBaoMat(cuoi);
    }

    [Fact]
    public async Task Health_ready_nguon_Mau_tra_200_khong_can_db()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", body);
        KiemHeaderBaoMat(response);
    }

    [Fact]
    public async Task Duong_dan_api_khong_khop_tra_404_problem_details()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/khong-co", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        KiemHeaderBaoMat(response);
    }

    [Fact]
    public async Task Duong_dan_api_co_dau_cham_tra_404_problem_details()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/x.json", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Phuong_thuc_sai_tra_405_problem_details()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.PostAsync("/health/live", content: null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Loi_4xx_tu_controller_khong_body_tra_problem_details()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/test-loi/khong-hop-le", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Loi_khong_bat_duoc_o_production_tra_500_problem_details_khong_lo_chi_tiet()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        Assert.DoesNotContain("BI-MAT-KET-NOI", body, StringComparison.Ordinal);
        Assert.DoesNotContain("InvalidOperationException", body, StringComparison.Ordinal);
        Assert.DoesNotContain(" at ", body, StringComparison.Ordinal);
        using var json = JsonDocument.Parse(body);
        Assert.Equal(500, json.RootElement.GetProperty("status").GetInt32());
        Assert.False(json.RootElement.TryGetProperty("detail", out _));
        KiemHeaderBaoMat(response);
    }

    [Fact]
    public async Task Loi_khong_bat_duoc_o_development_co_chi_tiet_va_khong_co_hsts()
    {
        await using var factory = new DevelopmentApiFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Contains("BI-MAT-KET-NOI", body, StringComparison.Ordinal);
        Assert.False(response.Headers.Contains("Strict-Transport-Security"));
    }

    [Fact]
    public async Task Duong_dan_khong_phai_api_khi_chua_co_index_html_tra_404_khong_loi()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/khong-co", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Duong_dan_khong_phai_api_khi_co_index_html_tra_index_khong_cache()
    {
        await using var factory = new ApiCoIndexFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/tra-cuu/thu-tuc", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ApiCoIndexFactory.Noi_dung, body);
        Assert.Equal("no-cache", response.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task Duong_dan_api_khi_co_index_html_van_tra_404_khong_roi_vao_fallback()
    {
        await using var factory = new ApiCoIndexFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/khong-co", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public void Cau_hinh_khong_hop_le_dung_khoi_dong_va_neu_ten_muc()
    {
        using var factory = new CauHinhSaiFactory();

        var loi = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("RateLimiting", loi.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Ma_loi_404_la_khong_tim_thay()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.GetAsync("/api/khong-co", TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.NotFound, "khong-tim-thay");
    }

    [Fact]
    public async Task Ma_loi_404_co_dau_cham_la_khong_tim_thay()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.GetAsync("/api/x.json", TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.NotFound, "khong-tim-thay");
    }

    [Fact]
    public async Task Ma_loi_405_la_phuong_thuc_khong_hop_le()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.PostAsync("/health/live", content: null, TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.MethodNotAllowed, "phuong-thuc-khong-hop-le");
    }

    [Fact]
    public async Task Get_vao_route_api_chi_co_post_tra_405_problem_details_kem_allow()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/tro-ly/hoi", TestContext.Current.CancellationToken);

        await KiemProblemAsync(response, HttpStatusCode.MethodNotAllowed, "phuong-thuc-khong-hop-le");
        Assert.Equal(["POST"], response.Content.Headers.Allow);
        KiemHeaderBaoMat(response);
    }

    [Fact]
    public async Task Get_vao_route_api_chi_co_post_khi_co_index_html_van_tra_405_khong_tra_html()
    {
        await using var factory = new ApiCoIndexFactory();
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/tro-ly/hoi", TestContext.Current.CancellationToken);

        await KiemProblemAsync(response, HttpStatusCode.MethodNotAllowed, "phuong-thuc-khong-hop-le");
        Assert.Equal(["POST"], response.Content.Headers.Allow);
    }

    [Theory]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    [InlineData("PATCH")]
    [InlineData("OPTIONS")]
    public async Task Phuong_thuc_khac_vao_route_api_chi_co_post_tra_405_allow_chi_post_khong_cors(string phuongThuc)
    {
        using var client = _factory.CreateHttpsClient();
        using var request = new HttpRequestMessage(new HttpMethod(phuongThuc), "/api/tro-ly/hoi");

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        await KiemProblemAsync(response, HttpStatusCode.MethodNotAllowed, "phuong-thuc-khong-hop-le");
        Assert.Equal(["POST"], response.Content.Headers.Allow);
        Assert.DoesNotContain(response.Headers, h => h.Key.StartsWith("Access-Control-", StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("POST", "/api/thu-tuc/1.001193")]
    [InlineData("PUT", "/api/thu-tuc/1.001193")]
    [InlineData("DELETE", "/api/thu-tuc/1.001193")]
    [InlineData("PATCH", "/api/thu-tuc/1.001193")]
    [InlineData("POST", "/api/thu-tuc")]
    [InlineData("PUT", "/api/thu-tuc")]
    [InlineData("DELETE", "/api/thu-tuc")]
    [InlineData("PATCH", "/api/thu-tuc")]
    [InlineData("POST", "/api/linh-vuc")]
    [InlineData("PUT", "/api/linh-vuc")]
    [InlineData("DELETE", "/api/linh-vuc")]
    [InlineData("PATCH", "/api/linh-vuc")]
    [InlineData("POST", "/api/linh-vuc/quay")]
    [InlineData("PUT", "/api/linh-vuc/quay")]
    [InlineData("DELETE", "/api/linh-vuc/quay")]
    [InlineData("PATCH", "/api/linh-vuc/quay")]
    [InlineData("POST", "/api/trung-tam")]
    [InlineData("PUT", "/api/trung-tam")]
    [InlineData("DELETE", "/api/trung-tam")]
    [InlineData("PATCH", "/api/trung-tam")]
    [InlineData("OPTIONS", "/health/live")]
    [InlineData("POST", "/tra-cuu/thu-tuc")]
    [InlineData("OPTIONS", "/")]
    public async Task Phuong_thuc_sai_vao_route_chi_doc_hoac_trang_react_tra_405_allow_get_head(string phuongThuc, string duong)
    {
        using var client = _factory.CreateHttpsClient();
        using var request = new HttpRequestMessage(new HttpMethod(phuongThuc), duong);

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal(["GET", "HEAD"], response.Content.Headers.Allow);
        Assert.DoesNotContain(response.Headers, h => h.Key.StartsWith("Access-Control-", StringComparison.OrdinalIgnoreCase));
        if (duong.StartsWith("/api/", StringComparison.Ordinal))
        {
            await KiemProblemAsync(response, HttpStatusCode.MethodNotAllowed, "phuong-thuc-khong-hop-le");
        }
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("POST")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    [InlineData("PATCH")]
    public async Task Ma_thu_tuc_sai_dinh_dang_voi_moi_phuong_thuc_tra_404_khong_tim_thay(string phuongThuc)
    {
        using var client = _factory.CreateHttpsClient();
        using var request = new HttpRequestMessage(new HttpMethod(phuongThuc), "/api/thu-tuc/!!sai");

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        await KiemProblemAsync(response, HttpStatusCode.NotFound, "khong-tim-thay");
        Assert.Empty(response.Content.Headers.Allow);
    }

    [Fact]
    public async Task Duong_dan_api_khong_khop_route_nao_khong_co_allow()
    {
        using var client = _factory.CreateHttpsClient();

        using var response = await client.GetAsync("/api/tro-ly/khong-co", TestContext.Current.CancellationToken);

        await KiemProblemAsync(response, HttpStatusCode.NotFound, "khong-tim-thay");
        Assert.Empty(response.Content.Headers.Allow);
    }

    [Fact]
    public async Task Ma_loi_400_validate_controller_la_du_lieu_khong_hop_le()
    {
        using var client = _factory.CreateHttpsClient();
        using var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
        using var response = await client.PostAsync("/api/test-loi/kiem-tra", content, TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.BadRequest, "du-lieu-khong-hop-le");
    }

    [Fact]
    public async Task Ma_loi_400_khong_body_la_du_lieu_khong_hop_le()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.GetAsync("/api/test-loi/khong-hop-le", TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.BadRequest, "du-lieu-khong-hop-le");
    }

    [Fact]
    public async Task Ma_loi_413_content_length_vuot_gioi_han_la_yeu_cau_qua_lon()
    {
        using var client = _factory.CreateHttpsClient();
        using var content = new ByteArrayContent(new byte[64 * 1024 + 1]);
        using var response = await client.PostAsync("/api/test-loi/kiem-tra", content, TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.RequestEntityTooLarge, "yeu-cau-qua-lon");
    }

    [Fact]
    public async Task Ma_loi_413_tu_kestrel_khi_doc_body_la_yeu_cau_qua_lon()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.PostAsync("/api/test-loi/qua-lon", content: null, TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.RequestEntityTooLarge, "yeu-cau-qua-lon");
    }

    [Fact]
    public async Task Ma_loi_429_la_qua_nhieu_yeu_cau()
    {
        await using var factory = new GioiHanChatFactory();
        using var client = factory.CreateHttpsClient();

        using var dau = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var sau = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        await KiemProblemAsync(sau, HttpStatusCode.TooManyRequests, "qua-nhieu-yeu-cau");
        KiemHeaderBaoMat(sau);
    }

    [Fact]
    public async Task Ma_loi_500_la_loi_he_thong_va_title_la_cum_chuan()
    {
        using var client = _factory.CreateHttpsClient();
        using var response = await client.GetAsync("/api/test-loi", TestContext.Current.CancellationToken);
        await KiemProblemAsync(response, HttpStatusCode.InternalServerError, "loi-he-thong");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal("Internal Server Error", json.RootElement.GetProperty("title").GetString());
    }

    [Theory]
    [InlineData(400, MaLoi.DuLieuKhongHopLe)]
    [InlineData(404, MaLoi.KhongTimThay)]
    [InlineData(405, MaLoi.PhuongThucKhongHopLe)]
    public void Danh_muc_ma_loi_anh_xa_dung(int http, string code) => Assert.Equal(code, MaLoi.TuMaHttp(http));

    [Fact]
    public async Task Body_429_co_cung_tap_truong_voi_404_va_giu_retry_after()
    {
        await using var factory = new GioiHanChatFactory();
        using var client = factory.CreateHttpsClient();
        using var dau = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var qua = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        using var khongCo = await client.GetAsync("/api/khong-co", TestContext.Current.CancellationToken);

        static async Task<string[]> Truong(HttpResponseMessage r)
        {
            using var json = JsonDocument.Parse(await r.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
            return [.. json.RootElement.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)];
        }

        Assert.Equal(await Truong(khongCo), await Truong(qua));
        Assert.Contains("type", await Truong(qua));
        Assert.True(qua.Headers.Contains("Retry-After"));
    }
}
