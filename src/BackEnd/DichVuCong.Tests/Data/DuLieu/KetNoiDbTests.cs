using DichVuCong.Data;
using Npgsql;

namespace DichVuCong.Tests.Data.DuLieu;

/// <summary>Timeout mặc định của chuỗi kết nối (F00 L5) — không cần DB.</summary>
public class KetNoiDbTests
{
    private const string Goc = "Host=localhost;Database=dichvucong;Username=u;Password=p";

    [Fact]
    public void Chua_khai_thi_dat_timeout_ket_noi_5s_va_lenh_10s()
    {
        var b = new NpgsqlConnectionStringBuilder(KetNoiDb.ApDungTimeoutMacDinh(Goc));

        Assert.Equal(5, b.Timeout);
        Assert.Equal(10, b.CommandTimeout);
        Assert.Equal("localhost", b.Host);
        Assert.Equal("dichvucong", b.Database);
        Assert.Equal("p", b.Password);
    }

    [Theory]
    [InlineData("Timeout=30;Command Timeout=60", 30, 60)]
    [InlineData("Timeout=30;CommandTimeout=60", 30, 60)]
    [InlineData("Timeout=0;Command Timeout=0", 0, 0)]
    public void Da_khai_thi_giu_nguyen(string them, int ketNoi, int lenh)
    {
        var b = new NpgsqlConnectionStringBuilder(KetNoiDb.ApDungTimeoutMacDinh(Goc + ";" + them));

        Assert.Equal(ketNoi, b.Timeout);
        Assert.Equal(lenh, b.CommandTimeout);
    }

    [Fact]
    public void Khai_mot_trong_hai_thi_chi_bo_sung_cai_con_lai()
    {
        var b = new NpgsqlConnectionStringBuilder(KetNoiDb.ApDungTimeoutMacDinh(Goc + ";Timeout=20"));

        Assert.Equal(20, b.Timeout);
        Assert.Equal(10, b.CommandTimeout);
    }

    [Theory]
    [InlineData("Host=localhost;Password=bi-mat;Port=khong-phai-so")]
    [InlineData("Password=bi-mat;Timeout=abc")]
    [InlineData("Host=may-bi-mat;Password=bi-mat;khong-co-dau-bang")]
    [InlineData("Password=bi-mat;Ten Khoa La=1")]
    public void Chuoi_sai_cu_phap_nem_thong_bao_chung_khong_lo_noi_dung(string chuoi)
    {
        var loi = Assert.Throws<ArgumentException>(() => KetNoiDb.ApDungTimeoutMacDinh(chuoi));

        Assert.Contains("ConnectionStrings:DichVuCong", loi.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("bi-mat", loi.Message, StringComparison.Ordinal);
        Assert.Null(loi.InnerException);
        Assert.DoesNotContain("bi-mat", loi.ToString(), StringComparison.Ordinal);
    }
}
