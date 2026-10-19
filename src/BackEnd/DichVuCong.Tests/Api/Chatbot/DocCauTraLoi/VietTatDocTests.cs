using System.Net;
using System.Text.Json;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using Microsoft.Net.Http.Headers;

namespace DichVuCong.Tests.Api.Chatbot.DocCauTraLoi;

/// <summary>HTTP của <c>GET /api/tro-ly/viet-tat</c> (F07 plan §3).</summary>
public sealed class VietTatDocTests(TroLyFactory factory) : IClassFixture<TroLyFactory>
{
    private static readonly Uri Duong = new("/api/tro-ly/viet-tat", UriKind.Relative);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Tra200_JsonCamelCase_ChiHaiTruong_CoETagVaNoCache()
    {
        using var client = factory.CreateHttpsClient();

        using var response = await client.GetAsync(Duong, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(12, json.RootElement.GetArrayLength());
        Assert.Equal(["chuVietTat", "dayDu"], json.RootElement[0].EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        Assert.Equal("TTHC", json.RootElement[0].GetProperty("chuVietTat").GetString());
        Assert.Equal("thủ tục hành chính", json.RootElement[0].GetProperty("dayDu").GetString());
        Assert.NotNull(response.Headers.ETag);
        Assert.Equal("no-cache", response.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task IfNoneMatchKhop_Tra304()
    {
        using var client = factory.CreateHttpsClient();
        using var lanDau = await client.GetAsync(Duong, Ct);

        using var request = new HttpRequestMessage(HttpMethod.Get, Duong);
        request.Headers.TryAddWithoutValidation(HeaderNames.IfNoneMatch, lanDau.Headers.ETag!.ToString());
        using var response = await client.SendAsync(request, Ct);

        Assert.Equal(HttpStatusCode.NotModified, response.StatusCode);
    }

    [Fact]
    public async Task DoiPhienBanDuLieu_ThanMoi()
    {
        await using var rieng = new TroLyFactory();
        using var client = rieng.CreateHttpsClient();
        using var truoc = await client.GetAsync(Duong, Ct);
        using var jsonTruoc = JsonDocument.Parse(await truoc.Content.ReadAsStringAsync(Ct));
        var tep = TroLyThu.Nen();
        tep.VietTat.Clear();
        tep.VietTat.Add(new VietTat { ThuTu = 1, ChuVietTat = "XYZ", ChuVietTatTimKiem = "xyz", DayDu = "chữ thử" });

        rieng.Nguon.Goc = new NguonDuLieuMau(tep);
        rieng.PhienBan.GiaTri += 1;
        using var sau = await client.GetAsync(Duong, Ct);
        using var jsonSau = JsonDocument.Parse(await sau.Content.ReadAsStringAsync(Ct));

        Assert.Equal(12, jsonTruoc.RootElement.GetArrayLength());
        Assert.Equal(1, jsonSau.RootElement.GetArrayLength());
        Assert.Equal("XYZ", jsonSau.RootElement[0].GetProperty("chuVietTat").GetString());
    }

    [Fact]
    public async Task Post_Tra405_PhuongThucKhongHopLe()
    {
        using var client = factory.CreateHttpsClient();
        using var noiDung = new StringContent(string.Empty);

        using var response = await client.PostAsync(Duong, noiDung, Ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal("phuong-thuc-khong-hop-le", json.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task VuotGioiHanDanhMuc_Tra429_QuaNhieuYeuCau()
    {
        await using var rieng = new GioiHanChatFactory();
        using var client = rieng.CreateHttpsClient();

        using var dau = await client.GetAsync(Duong, Ct);
        using var bi = await client.GetAsync(Duong, Ct);
        using var json = JsonDocument.Parse(await bi.Content.ReadAsStringAsync(Ct));

        Assert.Equal(HttpStatusCode.OK, dau.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, bi.StatusCode);
        Assert.Equal("qua-nhieu-yeu-cau", json.RootElement.GetProperty("code").GetString());
    }
}
