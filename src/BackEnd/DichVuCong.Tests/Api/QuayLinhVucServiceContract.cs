using System.Text.Json;
using DichVuCong.Api.Features.QuayLinhVuc;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Test hợp đồng của <see cref="QuayLinhVucService"/> (plan F00 §9.4 R7): cùng các ca chạy trên mọi nguồn dữ liệu.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract class QuayLinhVucServiceContract
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    private QuayLinhVucService TaoService(TepDuLieuMau tep) => new(TaoNguon(tep));

    [Fact]
    public async Task ChiTraDongCoQuay_BoDongQuayTrong()
    {
        var ds = await TaoService(QuayLinhVucThu.Bo()).LayAsync(Ct);

        Assert.DoesNotContain(ds, q => q.LinhVucMa == "chung-thuc");
        Assert.Equal(5, ds.Count);
    }

    [Fact]
    public async Task SapTheoLinhVucMaOrdinal_DuLieuThuThemLanLon()
    {
        var ds = await TaoService(QuayLinhVucThu.Bo()).LayAsync(Ct);

        Assert.Equal(["dat-dai", "dat-dai-2", "ho-tich", "khong-co-trong-linh-vuc", "thuy-loi"], ds.Select(q => q.LinhVucMa));
    }

    [Fact]
    public async Task QuayDung_VaMaKhongCoTrongLinhVucVanTra()
    {
        var ds = await TaoService(QuayLinhVucThu.Bo()).LayAsync(Ct);
        var theoMa = ds.ToDictionary(q => q.LinhVucMa, q => q.Quay);

        Assert.Equal(5, theoMa["dat-dai"]);
        Assert.Equal(7, theoMa["dat-dai-2"]);
        Assert.Equal(3, theoMa["ho-tich"]);
        Assert.Equal(12, theoMa["thuy-loi"]);
        Assert.Equal(9, theoMa["khong-co-trong-linh-vuc"]);
    }

    [Fact]
    public async Task JsonChiCoHaiTruong()
    {
        var ds = await TaoService(QuayLinhVucThu.Bo()).LayAsync(Ct);

        Assert.Equal(
            """[{"linhVucMa":"dat-dai","quay":5},{"linhVucMa":"dat-dai-2","quay":7},{"linhVucMa":"ho-tich","quay":3},{"linhVucMa":"khong-co-trong-linh-vuc","quay":9},{"linhVucMa":"thuy-loi","quay":12}]""",
            JsonSerializer.Serialize(ds, Web));
    }

    [Fact]
    public async Task NguonKhongCoPhanCong_TraDanhSachRong()
    {
        Assert.Empty(await TaoService(QuayLinhVucThu.Rong()).LayAsync(Ct));
    }

    [Fact]
    public async Task ToanDongQuayTrong_TraDanhSachRong()
    {
        Assert.Empty(await TaoService(QuayLinhVucThu.ChiQuayTrong()).LayAsync(Ct));
    }

    [Fact]
    public async Task FileNhung_PhanCongRong_TraDanhSachRong()
    {
        // AC-6: bản đầu chưa có phân công, không ô nào có dòng quầy.
        Assert.Empty(await TaoService(TepDuLieuMau.Nhung).LayAsync(Ct));
    }

    [Fact]
    public async Task GoiHaiLan_CungKetQua()
    {
        var service = TaoService(QuayLinhVucThu.Bo());

        var lan1 = JsonSerializer.Serialize(await service.LayAsync(Ct), Web);
        var lan2 = JsonSerializer.Serialize(await service.LayAsync(Ct), Web);

        Assert.Equal(lan1, lan2);
    }
}
