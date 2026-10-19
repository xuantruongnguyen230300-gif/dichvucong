using System.Globalization;
using ClosedXML.Excel;
using DichVuCong.Data.Entities;
using DichVuCong.Import;
using DichVuCong.Import.Excel;
using DichVuCong.Import.Lenh;
using DichVuCong.Import.Loai.PhanCong;
using DichVuCong.Import.Loai.ThuTuc;
using DichVuCong.Import.Loai.TrungTam;
using DichVuCong.Import.Loai.TroLy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Data.Import;

public sealed class TaoMauTests : IDisposable
{
    private readonly string _thuMuc = Directory.CreateTempSubdirectory("dvc-mau-").FullName;

    public void Dispose() => Directory.Delete(_thuMuc, recursive: true);

    [Fact]
    public async Task Tao_mau_ra_4_file_doc_lai_khong_loi_cau_truc_va_0_ban_ghi()
    {
        var (ma, ra, _) = await Chay(["tao-mau", _thuMuc]);

        Assert.Equal((int)MaThoat.ThanhCong, ma);
        foreach (var mau in MauExcel.TatCa)
        {
            Assert.True(File.Exists(Path.Combine(_thuMuc, mau.TenFile)));
            Assert.Contains(mau.TenFile, ra, StringComparison.Ordinal);
        }

        using (var s = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileThuTuc)))
        {
            var kq = KiemTraThuTuc.KiemTra(DocExcel.Doc(s, MauExcel.ThuTuc, "thu-tuc.xlsx"));
            Assert.True(kq.HopLe);
            Assert.Empty(kq.DuLieu.ThuTuc);
        }

        using (var s = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFilePhanCong)))
        {
            var kq = KiemTraPhanCong.KiemTra(DocExcel.Doc(s, MauExcel.PhanCong, "phan-cong.xlsx"), null);
            Assert.True(kq.HopLe);
            Assert.Empty(kq.DuLieu.PhanCong);
        }

        using (var s = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileTroLy)))
        {
            var kq = KiemTraTroLy.KiemTra(DocExcel.Doc(s, MauExcel.TroLy, "tro-ly.xlsx"), null, null);
            Assert.True(kq.HopLe);
            Assert.Empty(kq.DuLieu.CauHoiMau);
        }
    }

    [Fact]
    public async Task File_mau_trung_tam_chi_bao_thieu_dung_5_muc_bat_buoc()
    {
        await Chay(["tao-mau", _thuMuc]);

        using var s = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileTrungTam));
        var file = DocExcel.Doc(s, MauExcel.TrungTam, "trung-tam.xlsx");
        var kq = KiemTraTrungTam.KiemTra(file);

        Assert.True(file.HopLeCauTruc);
        Assert.Equal(5, kq.Loi.Count);
        Assert.All(kq.Loi, l => Assert.Null(l.Dong));
        Assert.Empty(kq.DuLieu.GioLamViec); // 7 thứ có sẵn nhưng chưa điền giờ → ngày nghỉ
    }

    [Fact]
    public async Task File_mau_co_dinh_dang_text_danh_sach_chon_gio_lam_viec_va_sheet_huong_dan()
    {
        await Chay(["tao-mau", _thuMuc]);

        using var tt = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileThuTuc));
        var ws = tt.Worksheet(TenSheet.ThuTuc);
        var cotTen = XlTest.SoCot(MauExcel.ThuTuc, TenSheet.ThuTuc, TenCot.TenThuTuc);
        var cotMucDo = XlTest.SoCot(MauExcel.ThuTuc, TenSheet.ThuTuc, TenCot.MucDo);
        Assert.Equal("@", ws.Column(cotTen).Style.NumberFormat.Format);
        Assert.Contains(ws.DataValidations, v => v.Ranges.Any(r => r.RangeAddress.FirstAddress.ColumnNumber == cotMucDo));
        Assert.True(tt.Worksheets.Contains(TenSheet.HuongDan));
        Assert.True(tt.Worksheets.Contains(TenSheet.ThuongGap));

        using var tl = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileTroLy));
        Assert.True(tl.Worksheets.Contains(TenSheet.ChuDeGoiY));

        using var tm = DocExcel.Mo(Path.Combine(_thuMuc, MauExcel.TenFileTrungTam));
        var gio = tm.Worksheet(TenSheet.GioLamViec);
        Assert.Equal(MauExcel.TenThu, Enumerable.Range(2, 7).Select(r => gio.Cell(r, 1).GetString()));
        var bieuTuong = tm.Worksheet(TenSheet.ODichVu).DataValidations.SelectMany(v => new[] { v.MinValue }).First();
        Assert.Contains("cong-thong-tin", bieuTuong, StringComparison.Ordinal);
        Assert.DoesNotContain("mot-cua", bieuTuong, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Chay_lai_vao_thu_muc_da_co_file_thi_ma_2_va_khong_ghi_de()
    {
        await Chay(["tao-mau", _thuMuc]);
        var duongDan = Path.Combine(_thuMuc, MauExcel.TenFileThuTuc);
        File.WriteAllText(duongDan, "du lieu cua nguoi dung");

        var (ma, _, loi) = await Chay(["tao-mau", _thuMuc]);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
        Assert.Contains(MauExcel.TenFileThuTuc, loi, StringComparison.Ordinal);
        Assert.Equal("du lieu cua nguoi dung", File.ReadAllText(duongDan));
    }

    internal static async Task<(int Ma, string Ra, string Loi)> Chay(string[] args, bool coChuoiKetNoi = false)
    {
        var cauHinh = new ConfigurationBuilder()
            .AddInMemoryCollection(coChuoiKetNoi ? new Dictionary<string, string?> { [UngDung.KhoaChuoiKetNoi] = "Host=khong-co" } : [])
            .Build();
        using var dichVu = new ServiceCollection().AddSingleton<IConfiguration>(cauHinh).BuildServiceProvider();
        using var ra = new StringWriter(CultureInfo.InvariantCulture);
        using var loi = new StringWriter(CultureInfo.InvariantCulture);

        var ma = await UngDung.ChayAsync(args, dichVu, ra, loi, TestContext.Current.CancellationToken);
        return (ma, ra.ToString(), loi.ToString());
    }
}

public sealed class XuatTests : IDisposable
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 3, 0, 0, TimeSpan.Zero);

    private readonly string _thuMuc = Directory.CreateTempSubdirectory("dvc-xuat-").FullName;

    public void Dispose() => Directory.Delete(_thuMuc, recursive: true);

    private static CauChuaTraLoi Cau(string noiDung, int soLan, DateTimeOffset lanCuoi)
        => new() { NoiDung = noiDung, KhoaGop = noiDung.ToLowerInvariant(), SoLanGap = soLan, LanGapCuoi = lanCuoi };

    [Fact]
    public void Chi_xuat_cau_con_han_90_ngay_89_ngay_co_91_ngay_khong()
    {
        var chon = XuatDuLieu.ChonCauXuat(
            [
                Cau("89 ngày", 1, BayGio.AddDays(-89)),
                Cau("91 ngày", 5, BayGio.AddDays(-91)),
                Cau("vừa xong", 1, BayGio),
            ],
            BayGio);

        Assert.Equal(["vừa xong", "89 ngày"], chon.Select(c => c.NoiDung).Order().Reverse());
        Assert.DoesNotContain(chon, c => c.NoiDung == "91 ngày");
        Assert.Equal(CauChuaTraLoi.ThoiGianGiu, TimeSpan.FromDays(90));
    }

    [Fact]
    public void Sap_theo_so_lan_giam_dan_roi_lan_gap_cuoi_giam_dan()
    {
        var chon = XuatDuLieu.ChonCauXuat(
            [
                Cau("b", 2, BayGio.AddDays(-1)),
                Cau("a", 2, BayGio.AddDays(-2)),
                Cau("c", 9, BayGio.AddDays(-30)),
                Cau("d", 2, BayGio.AddHours(-1)),
            ],
            BayGio);

        Assert.Equal(["c", "d", "b", "a"], chon.Select(c => c.NoiDung));
    }

    [Fact]
    public void File_xuat_co_3_cot_dung_so_lan_gio_viet_nam_va_cau_bat_dau_bang_dau_bang_la_chu()
    {
        var cau = XuatDuLieu.ChonCauXuat(
            [
                Cau("=HYPERLINK(\"http://x\")", 3, new DateTimeOffset(2026, 10, 11, 23, 30, 0, TimeSpan.Zero)),
                Cau("+84 hỏi gì đó", 1, new DateTimeOffset(2026, 10, 1, 0, 5, 0, TimeSpan.Zero)),
            ],
            BayGio);
        var duongDan = Path.Combine(_thuMuc, "ra.xlsx");

        using (var sach = GhiExcel.TaoXuat(cau))
        {
            GhiExcel.LuuMoi(sach, duongDan);
        }

        using var doc = DocExcel.Mo(duongDan);
        var ws = doc.Worksheets.First();
        Assert.Equal(3, ws.LastColumnUsed()!.ColumnNumber());
        Assert.Equal(3, ws.LastRowUsed()!.RowNumber());

        Assert.Equal("=HYPERLINK(\"http://x\")", ws.Cell(2, 1).GetString());
        Assert.True(ws.Cell(2, 1).DataType == XLDataType.Text);
        Assert.False(ws.Cell(2, 1).HasFormula);
        Assert.Equal(3, ws.Cell(2, 2).GetDouble());
        Assert.Equal("12/10/2026 06:30", ws.Cell(2, 3).GetString()); // 23:30 UTC = 06:30 hôm sau (UTC+7)
        Assert.Equal("01/10/2026 07:05", ws.Cell(3, 3).GetString());
        Assert.Equal("+84 hỏi gì đó", ws.Cell(3, 1).GetString());
    }

    [Fact]
    public void Khong_co_cau_nao_van_co_dong_tieu_de()
    {
        var duongDan = Path.Combine(_thuMuc, "trong.xlsx");

        using (var sach = GhiExcel.TaoXuat(XuatDuLieu.ChonCauXuat([], BayGio)))
        {
            GhiExcel.LuuMoi(sach, duongDan);
        }

        using var doc = DocExcel.Mo(duongDan);
        var ws = doc.Worksheets.First();
        Assert.Equal(1, ws.LastRowUsed()!.RowNumber());
        Assert.Equal(3, ws.LastColumnUsed()!.ColumnNumber());
    }

    [Fact]
    public async Task File_ra_da_ton_tai_thi_ma_2_va_khong_ghi_de()
    {
        var duongDan = Path.Combine(_thuMuc, "da-co.xlsx");
        File.WriteAllText(duongDan, "cu");

        var (ma, _, loi) = await TaoMauTests.Chay(["xuat", "cau-chua-tra-loi", duongDan], coChuoiKetNoi: true);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
        Assert.NotEqual(string.Empty, loi);
        Assert.Equal("cu", File.ReadAllText(duongDan));
    }

    [Fact]
    public async Task File_ra_sai_duoi_thi_ma_2()
    {
        var (ma, _, _) = await TaoMauTests.Chay(["xuat", "cau-chua-tra-loi", Path.Combine(_thuMuc, "ra.csv")], coChuoiKetNoi: true);

        Assert.Equal((int)MaThoat.SaiLenh, ma);
    }

    [Fact]
    public async Task Co_chuoi_ket_noi_nhung_khong_co_db_thi_ma_3_va_khong_in_chuoi_ket_noi()
    {
        var (ma, ra, loi) = await TaoMauTests.Chay(["xuat", "cau-chua-tra-loi", Path.Combine(_thuMuc, "moi.xlsx")], coChuoiKetNoi: true);

        Assert.Equal((int)MaThoat.LoiHeThong, ma);
        Assert.DoesNotContain("khong-co", ra + loi, StringComparison.Ordinal);
        Assert.False(File.Exists(Path.Combine(_thuMuc, "moi.xlsx")));
    }
}
