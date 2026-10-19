using System.Net;

namespace DichVuCong.Tests.Api;

/// <summary>Lần lỡ cache và lần trúng cache nén ra cùng kích thước (xem <c>DemPhanHoiDanhMucFilter</c>).</summary>
public sealed class NenPhanHoiTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static async Task<(HttpStatusCode Ma, string? MaHoa, int KichThuoc)> LayAsync(HttpClient client, string duong, string maHoa)
    {
        using var yeuCau = new HttpRequestMessage(HttpMethod.Get, new Uri(duong, UriKind.Relative));
        yeuCau.Headers.AcceptEncoding.ParseAdd(maHoa);
        using var response = await client.SendAsync(yeuCau, Ct);
        var bytes = await response.Content.ReadAsByteArrayAsync(Ct);

        return (response.StatusCode, response.Content.Headers.ContentEncoding.SingleOrDefault(), bytes.Length);
    }

    [Theory]
    [InlineData("/api/thu-tuc", "br")]
    [InlineData("/api/thu-tuc", "gzip")]
    [InlineData("/api/thu-tuc/1.013229", "br")]
    [InlineData("/api/linh-vuc", "br")]
    public async Task LanLoCache_NenGiongLanTrungCache(string duong, string maHoa)
    {
        await using var rieng = new ApiFactory();
        using var client = rieng.CreateHttpsClient();

        var lanDau = await LayAsync(client, duong, maHoa);
        var lanHai = await LayAsync(client, duong, maHoa);

        Assert.Equal(HttpStatusCode.OK, lanDau.Ma);
        Assert.Equal(maHoa, lanDau.MaHoa);
        Assert.Equal(maHoa, lanHai.MaHoa);
        // Trước khi gom thân response, lần đầu lớn gấp 2-4 lần (71.211 B so với 37.250 B).
        Assert.InRange(lanDau.KichThuoc, lanHai.KichThuoc - 32, lanHai.KichThuoc + 32);
    }
}
