using DichVuCong.Import;
using DichVuCong.Import.Lenh;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Data.Import;

public class UngDungTests
{
    private const string GiaTriBiMat = "Host=bi-mat;Password=khong-duoc-in";

    [Theory]
    [InlineData("nhap thu-tuc a.xlsx", LoaiNhap.ThuTuc, "a.xlsx", false)]
    [InlineData("nhap phan-cong a.xlsx", LoaiNhap.PhanCong, "a.xlsx", false)]
    [InlineData("nhap trung-tam a.xlsx --chi-kiem", LoaiNhap.TrungTam, "a.xlsx", true)]
    [InlineData("nhap tro-ly --chi-kiem a.xlsx", LoaiNhap.TroLy, "a.xlsx", true)]
    [InlineData("nhap tat-ca thu-muc", LoaiNhap.TatCa, "thu-muc", false)]
    public void PhanTich_nhap_hop_le_ra_lenh_dung(string dong, LoaiNhap loai, string duongDan, bool chiKiem)
    {
        var (lenh, loi) = PhanTichLenh.PhanTich(dong.Split(' '));

        Assert.Null(loi);
        Assert.Equal(new LenhNhap(loai, duongDan, chiKiem), lenh);
    }

    [Fact]
    public void PhanTich_xuat_hop_le_ra_lenh_xuat()
    {
        var (lenh, loi) = PhanTichLenh.PhanTich(["xuat", "cau-chua-tra-loi", "ra.xlsx"]);

        Assert.Null(loi);
        Assert.Equal(new LenhXuat("ra.xlsx"), lenh);
    }

    [Fact]
    public void PhanTich_tao_mau_hop_le_ra_lenh_tao_mau()
    {
        var (lenh, loi) = PhanTichLenh.PhanTich(["tao-mau", "mau"]);

        Assert.Null(loi);
        Assert.Equal(new LenhTaoMau("mau"), lenh);
    }

    [Theory]
    [InlineData]
    [InlineData("help")]
    [InlineData("--help")]
    public void PhanTich_khong_tham_so_hoac_help_ra_huong_dan(params string[] args)
    {
        var (lenh, loi) = PhanTichLenh.PhanTich(args);

        Assert.Null(loi);
        Assert.IsType<LenhHuongDan>(lenh);
    }

    [Theory]
    [InlineData("lenh-la")]
    [InlineData("nhap")]
    [InlineData("nhap thu-tuc")]
    [InlineData("nhap loai-la a.xlsx")]
    [InlineData("nhap thu-tuc a.xlsx thua")]
    [InlineData("xuat")]
    [InlineData("xuat cau-chua-tra-loi")]
    [InlineData("xuat loai-la ra.xlsx")]
    [InlineData("xuat cau-chua-tra-loi ra.xlsx --chi-kiem")]
    [InlineData("tao-mau")]
    [InlineData("tao-mau a b")]
    [InlineData("tao-mau a --chi-kiem")]
    public void PhanTich_sai_cu_phap_tra_loi(string dong)
    {
        var (lenh, loi) = PhanTichLenh.PhanTich(dong.Split(' '));

        Assert.Null(lenh);
        Assert.False(string.IsNullOrWhiteSpace(loi));
    }

    [Theory]
    [InlineData]
    [InlineData("help")]
    public async Task ChayAsync_huong_dan_ma_0_va_in_ra_ra(params string[] args)
    {
        var (ma, ra, loi) = await ChayAsync(args, coChuoiKetNoi: false);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
        Assert.Contains("nhap thu-tuc", ra);
        Assert.Equal(string.Empty, loi);
    }

    [Theory]
    [InlineData("lenh-la")]
    [InlineData("nhap thu-tuc")]
    [InlineData("nhap xyz a.xlsx")]
    public async Task ChayAsync_sai_lenh_ma_2_va_in_ra_loi(string dong)
    {
        var (ma, ra, loi) = await ChayAsync(dong.Split(' '), coChuoiKetNoi: true);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
        Assert.Equal(string.Empty, ra);
        Assert.NotEqual(string.Empty, loi);
    }

    [Theory]
    [InlineData("nhap thu-tuc a.xlsx")]
    [InlineData("nhap tro-ly a.xlsx --chi-kiem")]
    [InlineData("xuat cau-chua-tra-loi ra.xlsx")]
    public async Task ChayAsync_thieu_chuoi_ket_noi_ma_3_neu_ten_khoa_va_khong_in_gia_tri(string dong)
    {
        var (ma, _, loi) = await ChayAsync(dong.Split(' '), coChuoiKetNoi: false);

        Assert.Equal((int)MaThoat.LoiHeThong, ma);
        Assert.Contains(UngDung.KhoaChuoiKetNoi, loi);
        Assert.DoesNotContain(GiaTriBiMat, loi);
    }

    [Theory]
    [InlineData("nhap thu-tuc a.xlsx")]
    [InlineData("nhap tro-ly a.xlsx --chi-kiem")]
    public async Task ChayAsync_co_chuoi_ket_noi_khong_in_gia_tri_ra_dau_ra(string dong)
    {
        var (ma, ra, loi) = await ChayAsync(dong.Split(' '), coChuoiKetNoi: true);

        Assert.NotEqual((int)MaThoat.LoiHeThong, ma);
        Assert.DoesNotContain(GiaTriBiMat, ra + loi);
    }

    [Theory]
    [InlineData("nhap thu-tuc a.xlsx --chi-kiem")]
    [InlineData("nhap phan-cong a.xlsx --chi-kiem")]
    [InlineData("nhap trung-tam a.xlsx --chi-kiem")]
    [InlineData("nhap tat-ca thu-muc --chi-kiem")]
    public async Task ChayAsync_khong_can_chuoi_ket_noi_thi_khong_tra_ma_3(string dong)
    {
        var (ma, _, loi) = await ChayAsync(dong.Split(' '), coChuoiKetNoi: false);

        Assert.NotEqual((int)MaThoat.LoiHeThong, ma);
        Assert.DoesNotContain(UngDung.KhoaChuoiKetNoi, loi);
    }

    private static async Task<(int Ma, string Ra, string Loi)> ChayAsync(string[] args, bool coChuoiKetNoi)
    {
        var cauHinh = new ConfigurationBuilder()
            .AddInMemoryCollection(coChuoiKetNoi
                ? new Dictionary<string, string?> { [UngDung.KhoaChuoiKetNoi] = GiaTriBiMat }
                : [])
            .Build();
        using var dichVu = new ServiceCollection().AddSingleton<IConfiguration>(cauHinh).BuildServiceProvider();
        using var ra = new StringWriter();
        using var loi = new StringWriter();

        var ma = await UngDung.ChayAsync(args, dichVu, ra, loi, TestContext.Current.CancellationToken);

        return (ma, ra.ToString(), loi.ToString());
    }
}
