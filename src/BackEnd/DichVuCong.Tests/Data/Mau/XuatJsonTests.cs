using DichVuCong.Data.Mau;
using DichVuCong.DuLieuMau;
using DichVuCong.Import;
using DichVuCong.Import.Excel;

namespace DichVuCong.Tests.Data.Mau;

/// <summary>
/// Lệnh <c>xuat-json</c> và lệnh xuất Excel cũ của <c>DichVuCong.DuLieuMau</c> (plan F00 §9.5, §9.12; T27).
/// <c>data-mau/</c> chỉ có ở máy dev (không commit): thiếu thì các ca cần nó bỏ qua.
/// </summary>
public sealed class XuatJsonTests : IDisposable
{
    private const string NhanGiuCho = "(dữ liệu mẫu)";

    private static readonly DateTimeOffset GioThu = new(2026, 10, 12, 9, 0, 0, TimeSpan.Zero);

    private readonly string _thuMuc = Directory.CreateTempSubdirectory("dvc-xuat-json-test-").FullName;

    public void Dispose() => Directory.Delete(_thuMuc, recursive: true);

    private sealed class GioCoDinh(DateTimeOffset gio) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => gio;
    }

    private static string? ThuMucDuLieuMau()
    {
        for (var thuMuc = new DirectoryInfo(AppContext.BaseDirectory); thuMuc is not null; thuMuc = thuMuc.Parent)
        {
            var ung = Path.Combine(thuMuc.FullName, "data-mau");
            if (File.Exists(Path.Combine(ung, "thu-tuc.json")))
            {
                return ung;
            }
        }

        return null;
    }

    private static string CanDuLieuMau()
    {
        var nguon = ThuMucDuLieuMau();
        Assert.SkipWhen(nguon is null, "Không có data-mau/ ở máy này (dữ liệu mẫu chỉ dùng local, không commit).");
        return nguon!;
    }

    private static async Task<(int Ma, string Ra, string Loi)> Chay(params string[] thamSo)
    {
        var ra = new StringWriter();
        var loi = new StringWriter();
        var ma = await XuatJson.ChayAsync(thamSo, new GioCoDinh(GioThu), ra, loi, TestContext.Current.CancellationToken);
        return (ma, ra.ToString(), loi.ToString());
    }

    [Fact]
    public async Task Xuat_json_ma_0_in_so_ban_ghi_va_file_doc_lai_duoc()
    {
        var nguon = CanDuLieuMau();
        var fileRa = Path.Combine(_thuMuc, "thu-muc-con", "du-lieu-mau.json");

        var (ma, ra, loi) = await Chay(nguon, fileRa, "--nguoi-chiu-trach-nhiem", NhanGiuCho);

        Assert.Equal(0, ma);
        Assert.Equal(string.Empty, loi);
        Assert.Contains("Thủ tục: 408", ra, StringComparison.Ordinal);
        Assert.Contains("Lĩnh vực: 75", ra, StringComparison.Ordinal);
        Assert.Contains("Phân công: 0 · Nhân sự: 0", ra, StringComparison.Ordinal);
        Assert.Contains("Câu hỏi mẫu: 11", ra, StringComparison.Ordinal);

        using var luong = File.OpenRead(fileRa);
        var tep = TepDuLieuMau.Doc(luong);
        Assert.Equal(408, tep.ThuTuc.Count);
        Assert.Equal(NhanGiuCho, tep.TrungTam!.NguoiChiuTrachNhiem);
        Assert.Equal(GioThu, tep.ThoiDiem);
    }

    [Fact]
    public async Task Xuat_hai_lan_cung_gio_cho_file_giong_tung_byte()
    {
        var nguon = CanDuLieuMau();
        var a = Path.Combine(_thuMuc, "a.json");
        var b = Path.Combine(_thuMuc, "b.json");

        Assert.Equal(0, (await Chay(nguon, a, "--nguoi-chiu-trach-nhiem", NhanGiuCho)).Ma);
        Assert.Equal(0, (await Chay(nguon, b, "--nguoi-chiu-trach-nhiem", NhanGiuCho)).Ma);

        var bytesA = await File.ReadAllBytesAsync(a, TestContext.Current.CancellationToken);
        var bytesB = await File.ReadAllBytesAsync(b, TestContext.Current.CancellationToken);
        Assert.True(bytesA.AsSpan().SequenceEqual(bytesB));
    }

    [Fact]
    public async Task Thieu_nguoi_chiu_trach_nhiem_ma_1_bao_thieu_muc_va_khong_ghi_file()
    {
        var nguon = CanDuLieuMau();
        var fileRa = Path.Combine(_thuMuc, "du-lieu-mau.json");

        var (ma, _, loi) = await Chay(nguon, fileRa);

        Assert.Equal((int)MaThoat.FileCoLoi, ma);
        Assert.Contains("Người chịu trách nhiệm", loi, StringComparison.Ordinal);
        Assert.False(File.Exists(fileRa));
    }

    [Fact]
    public async Task Co_loi_thi_giu_nguyen_file_cu()
    {
        var nguon = CanDuLieuMau();
        var fileRa = Path.Combine(_thuMuc, "du-lieu-mau.json");
        await File.WriteAllTextAsync(fileRa, "cũ", TestContext.Current.CancellationToken);

        var (ma, _, _) = await Chay(nguon, fileRa);

        Assert.Equal((int)MaThoat.FileCoLoi, ma);
        Assert.Equal("cũ", await File.ReadAllTextAsync(fileRa, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Sai_tham_so_ma_2_va_khong_ghi_file()
    {
        var fileRa = Path.Combine(_thuMuc, "du-lieu-mau.json");

        var khongCoThuMuc = await Chay(Path.Combine(_thuMuc, "khong-co"), fileRa, "--nguoi-chiu-trach-nhiem", NhanGiuCho);
        var thieuGiaTri = await Chay(_thuMuc, fileRa, "--nguoi-chiu-trach-nhiem");
        var thieuFileRa = await Chay(_thuMuc);

        Assert.Equal((int)MaThoat.SaiLenh, khongCoThuMuc.Ma);
        Assert.Equal((int)MaThoat.SaiLenh, thieuGiaTri.Ma);
        Assert.Equal((int)MaThoat.SaiLenh, thieuFileRa.Ma);
        Assert.False(File.Exists(fileRa));
    }

    [Fact]
    public async Task Lenh_xuat_excel_cu_van_ra_4_file()
    {
        var nguon = CanDuLieuMau();
        var ra = Path.Combine(_thuMuc, "excel");

        var ma = await ChuongTrinhDuLieuMau.Main([nguon, ra, "--nguoi-chiu-trach-nhiem", NhanGiuCho]);

        Assert.Equal(0, ma);
        foreach (var mau in MauExcel.TatCa)
        {
            Assert.True(File.Exists(Path.Combine(ra, mau.TenFile)), mau.TenFile);
        }
    }

    [Fact]
    public async Task Main_chuyen_lenh_xuat_json()
    {
        var nguon = CanDuLieuMau();
        var fileRa = Path.Combine(_thuMuc, "du-lieu-mau.json");

        var ma = await ChuongTrinhDuLieuMau.Main([XuatJson.TenLenh, nguon, fileRa, "--nguoi-chiu-trach-nhiem", NhanGiuCho]);

        Assert.Equal(0, ma);
        Assert.True(File.Exists(fileRa));
    }
}
