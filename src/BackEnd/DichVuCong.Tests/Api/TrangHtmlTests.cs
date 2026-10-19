using System.Net;
using DichVuCong.Api.Features.ThongTinTrungTam;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DichVuCong.Tests.Api;

public class TrangFactory : ApiFactory
{
    public const string KhoiMacDinh = "<title>Mặc định</title><meta name=\"description\" content=\"mô tả mặc định\">";

    public const string IndexCoDau =
        "<!doctype html><html lang=\"vi\"><head>\n<!--dac-ta-->\n" + KhoiMacDinh + "\n<!--/dac-ta-->\n</head><body></body></html>";

    public const string Json = """
        {
          "mauTieuDe": "{{trang}} – {{trungTam}}",
          "khongTimThay": { "ten": "Không tìm thấy trang", "moTa": "Không tìm thấy trang bạn cần." },
          "trang": {
            "/": { "ten": "Trang chủ", "moTa": "Mô tả trang chủ." },
            "/thu-tuc": { "ten": "Danh mục thủ tục", "moTa": "Mô tả danh mục." },
            "/linh-vuc": { "ten": "Lĩnh vực và mã QR", "moTa": "Mô tả lĩnh vực." }
          }
        }
        """;

    public DichVuTrungTamGia DichVu { get; } = new();

    protected override string? IndexHtml => IndexCoDau;

    protected override string? AllowedHosts => "localhost";

    protected override string? DacTaTrangJson => Json;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IThongTinTrungTamService>();
            services.AddSingleton<IThongTinTrungTamService>(DichVu);
        });
    }
}

public sealed class TrangDbLoiFactory : TrangFactory
{
    public TrangDbLoiFactory() => DichVu.NemLoi = true;
}

public sealed class TrangThieuDauFactory : TrangFactory
{
    protected override string? IndexHtml => "<!doctype html><title>x</title>";
}

public sealed class TrangThieuJsonFactory : TrangFactory
{
    protected override string? DacTaTrangJson => null;
}

public sealed class TrangJsonHongFactory : TrangFactory
{
    protected override string? DacTaTrangJson => "{ khong phai json";
}

public sealed class TrangHtmlTests(TrangFactory factory) : IClassFixture<TrangFactory>
{
    private static async Task<string> LayAsync(HttpClient client, string duong)
    {
        using var response = await client.GetAsync(new Uri(duong, UriKind.Relative), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task ThuTuc_CoTieuDeVaDuThe()
    {
        using var client = factory.CreateHttpsClient();

        var html = await LayAsync(client, "/thu-tuc");

        Assert.Contains("<title>Danh mục thủ tục – Trung tâm thử A</title>", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"description\" content=\"Mô tả danh mục.\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.title\" content=\"Danh mục thủ tục – Trung tâm thử A\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.description\" content=\"Mô tả danh mục.\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.creator\" content=\"Trung tâm thử A\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.publisher\" content=\"Trung tâm thử A\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.date\" content=\"2026-10-08\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.identifier\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta name=\"DC.language\" content=\"vi\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta property=\"og:title\" content=\"Danh mục thủ tục – Trung tâm thử A\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta property=\"og:description\" content=\"Mô tả danh mục.\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta property=\"og:url\" content=\"https://localhost/thu-tuc\">", html, StringComparison.Ordinal);
        Assert.Contains("<meta property=\"og:type\" content=\"website\">", html, StringComparison.Ordinal);
        Assert.Contains("<link rel=\"schema.DC\" href=\"https://purl.org/dc/elements/1.1/\">", html, StringComparison.Ordinal);
        Assert.DoesNotContain("Mặc định", html, StringComparison.Ordinal);
        Assert.Contains("<html lang=\"vi\">", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task QueryKhongAnhHuong_VaKhongXuatHienTrongHtml()
    {
        using var client = factory.CreateHttpsClient();

        var goc = await LayAsync(client, "/");
        var coMa = await LayAsync(client, "/?ma=1.001193");

        Assert.Equal(goc, coMa);
        Assert.DoesNotContain("1.001193", coMa, StringComparison.Ordinal);
        Assert.Contains("<title>Trang chủ – Trung tâm thử A</title>", coMa, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DuongDanHoaThuongVaDauGachCuoi_KhopDanhMuc()
    {
        using var client = factory.CreateHttpsClient();

        var html = await LayAsync(client, "/THU-TUC/");

        Assert.Contains("<title>Danh mục thủ tục – Trung tâm thử A</title>", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DuongDanLa_DungTrang404NhungMaHttp200()
    {
        using var client = factory.CreateHttpsClient();

        var html = await LayAsync(client, "/abc-xyz");

        Assert.Contains("<title>Không tìm thấy trang – Trung tâm thử A</title>", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CoQuanChuQuanCo_DcPublisherLaCoQuan_NgayNull_KhongCoDcDate()
    {
        await using var rieng = new TrangFactory();
        rieng.DichVu.DacTa = new DacTaTrungTam("Trung tâm thử A", "Cơ quan chủ quản thử", null);
        using var client = rieng.CreateHttpsClient();

        var html = await LayAsync(client, "/");

        Assert.Contains("<meta name=\"DC.publisher\" content=\"Cơ quan chủ quản thử\">", html, StringComparison.Ordinal);
        Assert.DoesNotContain("DC.date", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task TenChuaScript_DuocMaHoa()
    {
        await using var rieng = new TrangFactory();
        rieng.DichVu.DacTa = new DacTaTrungTam("A <script>alert(1)</script> \"x\"", null, null);
        using var client = rieng.CreateHttpsClient();

        var html = await LayAsync(client, "/");

        Assert.DoesNotContain("<script", html, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("\"x\"", html, StringComparison.Ordinal);
        Assert.Contains("&lt;script&gt;", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HaiYeuCauTrong30Giay_ChiGoiDichVuMotLan()
    {
        await using var rieng = new TrangFactory();
        using var client = rieng.CreateHttpsClient();

        await LayAsync(client, "/");
        await LayAsync(client, "/thu-tuc");

        Assert.Equal(1, rieng.DichVu.DemDacTa);
    }

    [Fact]
    public async Task ChuaCoDuLieuTrungTam_TraKhoiMacDinh()
    {
        await using var rieng = new TrangFactory();
        rieng.DichVu.DacTa = null;
        using var client = rieng.CreateHttpsClient();

        var html = await LayAsync(client, "/");

        Assert.Contains(TrangFactory.KhoiMacDinh, html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task TraVeNoCache_ContentTypeHtml_CoCsp()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(new Uri("/", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.True(response.Headers.CacheControl?.NoCache);
        Assert.Contains("script-src 'self'", Assert.Single(response.Headers.GetValues("Content-Security-Policy")), StringComparison.Ordinal);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }
}

public sealed class TrangHtmlDuPhongTests
{
    private static async Task<(HttpStatusCode Ma, string Html)> LayAsync(ApiFactory factory)
    {
        using var client = factory.CreateHttpsClient();
        using var response = await client.GetAsync(new Uri("/thu-tuc", UriKind.Relative), TestContext.Current.CancellationToken);
        return (response.StatusCode, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task DbLoi_Tra200_KhoiMacDinh()
    {
        await using var factory = new TrangDbLoiFactory();

        var (ma, html) = await LayAsync(factory);

        Assert.Equal(HttpStatusCode.OK, ma);
        Assert.Equal(TrangFactory.IndexCoDau, html);
        Assert.DoesNotContain("bi-mat", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ThieuDauDanhDau_TraNguyenFile()
    {
        await using var factory = new TrangThieuDauFactory();

        var (_, html) = await LayAsync(factory);

        Assert.Equal("<!doctype html><title>x</title>", html);
    }

    [Fact]
    public async Task ThieuJson_TraNguyenFile()
    {
        await using var factory = new TrangThieuJsonFactory();

        var (_, html) = await LayAsync(factory);

        Assert.Equal(TrangFactory.IndexCoDau, html);
    }

    [Fact]
    public async Task JsonHong_TraNguyenFile()
    {
        await using var factory = new TrangJsonHongFactory();

        var (_, html) = await LayAsync(factory);

        Assert.Equal(TrangFactory.IndexCoDau, html);
    }
}
