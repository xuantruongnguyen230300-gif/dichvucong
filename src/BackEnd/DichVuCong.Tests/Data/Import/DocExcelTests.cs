using System.Globalization;
using ClosedXML.Excel;
using DichVuCong.Import;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Data.Import;

public class DocExcelTests
{
    // Mẫu riêng của test, đủ mọi kiểu ô.
    private static readonly FileMau Mau = new("thu.xlsx",
    [
        new SheetMau("Dữ liệu",
        [
            new CotMau("Ma", KieuO.Ma, true, 20),
            new CotMau("Chu", KieuO.Chu),
            new CotMau("Danh dau", KieuO.DanhDau),
            new CotMau("Chon", KieuO.LuaChon, LuaChon: ["Toàn trình", "Một phần"]),
            new CotMau("So duong", KieuO.SoDuong),
            new CotMau("So khong am", KieuO.SoKhongAm),
            new CotMau("Gio", KieuO.Gio),
            new CotMau("Ds", KieuO.DanhSach),
            new CotMau("Url", KieuO.Url),
            new CotMau("Ngan", KieuO.Chu, false, 5),
        ]),
        new SheetMau("Khác", [new CotMau("A", KieuO.Chu)]),
    ]);

    private static readonly string[] CacCot = [.. Mau.Sheet[0].Cot.Select(c => c.Ten)];

    private static XLWorkbook TaoSach(params string[] boSheet)
    {
        var sach = new XLWorkbook();
        foreach (var sheet in Mau.Sheet.Where(s => boSheet.Length == 0 || boSheet.Contains(s.Ten)))
        {
            var ws = sach.AddWorksheet(sheet.Ten);
            for (var i = 0; i < sheet.Cot.Count; i++)
            {
                ws.Cell(1, i + 1).Value = sheet.Cot[i].Ten;
            }
        }

        return sach;
    }

    private static IXLCell O(XLWorkbook sach, int dong, string cot)
        => sach.Worksheet("Dữ liệu").Cell(dong, Array.IndexOf(CacCot, cot) + 1);

    private static (FileDoc File, DongDoc Dong) DocMotDong(Action<XLWorkbook> dat)
    {
        var sach = TaoSach();
        O(sach, 2, "Ma").Value = "1.001";
        dat(sach);
        var file = DocExcel.Doc(sach, Mau, "thu.xlsx");
        return (file, file["Dữ liệu"].Dong.Single());
    }

    [Fact]
    public void Thieu_sheet_la_loi_cau_truc_theo_sheet()
    {
        var file = DocExcel.Doc(TaoSach("Dữ liệu"), Mau, "thu.xlsx");

        var loi = Assert.Single(file.Loi.Loi);
        Assert.Equal("Khác", loi.Sheet);
        Assert.Null(loi.Dong);
        Assert.False(file["Khác"].HopLe);
        Assert.False(file.HopLeCauTruc);
    }

    [Fact]
    public void Thieu_cot_la_loi_cau_truc_nhac_ten_cot()
    {
        var sach = TaoSach();
        sach.Worksheet("Dữ liệu").Column(9).Delete(); // cột "Url"

        var file = DocExcel.Doc(sach, Mau, "thu.xlsx");

        var loi = Assert.Single(file.Loi.Loi);
        Assert.Equal("Dữ liệu", loi.Sheet);
        Assert.Contains("\"Url\"", loi.LyDo, StringComparison.Ordinal);
        Assert.Empty(file["Dữ liệu"].Dong);
    }

    [Fact]
    public void Cot_la_la_loi_nhung_cot_ghi_chu_bi_bo_qua()
    {
        var sach = TaoSach();
        var ws = sach.Worksheet("Dữ liệu");
        ws.Cell(1, 11).Value = "Ghi chú";
        ws.Cell(2, 11).Value = "bất kỳ";
        O(sach, 2, "Ma").Value = "1";
        Assert.True(DocExcel.Doc(sach, Mau, "thu.xlsx").Loi.Loi.Count == 0);

        ws.Cell(1, 12).Value = "Ưu tiên";
        var loi = Assert.Single(DocExcel.Doc(sach, Mau, "thu.xlsx").Loi.Loi);
        Assert.Contains("Ưu tiên", loi.LyDo, StringComparison.Ordinal);
    }

    [Fact]
    public void Sheet_chi_co_tieu_de_hop_le_va_0_ban_ghi()
    {
        var file = DocExcel.Doc(TaoSach(), Mau, "thu.xlsx");

        Assert.Empty(file.Loi.Loi);
        Assert.True(file["Dữ liệu"].HopLe);
        Assert.Empty(file["Dữ liệu"].Dong);
    }

    [Fact]
    public void Ten_sheet_va_ten_cot_khac_hoa_thuong_va_dau_van_khop_cot_xep_bat_ky()
    {
        var sach = new XLWorkbook();
        var ws = sach.AddWorksheet("  DU LIEU ");
        // Đảo thứ tự cột, viết hoa và bỏ dấu.
        var ten = CacCot.Reverse().ToArray();
        for (var i = 0; i < ten.Length; i++)
        {
            ws.Cell(1, i + 1).Value = ten[i].ToUpperInvariant();
        }

        ws.Cell(2, 1).Value = "x";
        ws.Cell(2, ten.Length).Value = "1.001";
        sach.AddWorksheet("khac").Cell(1, 1).Value = "a";

        var file = DocExcel.Doc(sach, Mau, "thu.xlsx");

        Assert.Empty(file.Loi.Loi);
        Assert.Equal("1.001", file["Dữ liệu"].Dong.Single().Ma("Ma"));
    }

    [Fact]
    public void O_so_o_cot_ma_la_loi()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Ma").Value = 1.01398);

        Assert.Null(dong.Ma("Ma"));
        Assert.Contains("dạng chữ", Assert.Single(dong.LyDo), StringComparison.Ordinal);
    }

    [Fact]
    public void Ma_dang_chu_giu_nguyen_so_0_cuoi()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Ma").Value = "1.013980");

        Assert.Equal("1.013980", dong.Ma("Ma"));
        Assert.Empty(dong.LyDo);
    }

    [Theory]
    [InlineData("x", true, 0)]
    [InlineData("X", true, 0)]
    [InlineData("", false, 0)]
    [InlineData("có", false, 1)]
    [InlineData("xx", false, 1)]
    public void Danh_dau_chi_nhan_x(string gia, bool mongDoi, int soLoi)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Danh dau").Value = gia);

        Assert.Equal(mongDoi, dong.DanhDau("Danh dau"));
        Assert.Equal(soLoi, dong.LyDo.Count);
    }

    [Theory]
    [InlineData("2", 2)]
    [InlineData(" 12 ", 12)]
    [InlineData("2a", null)]
    [InlineData("0", null)]
    [InlineData("1.5", null)]
    [InlineData("-3", null)]
    public void So_nguyen_duong_dang_chu(string gia, int? mongDoi)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "So duong").Value = gia);

        Assert.Equal(mongDoi, dong.SoDuong("So duong"));
        Assert.Equal(mongDoi is null ? 1 : 0, dong.LyDo.Count);
    }

    [Theory]
    [InlineData(3.0, 3)]
    [InlineData(0.0, null)]
    [InlineData(1.5, null)]
    public void So_nguyen_duong_dang_so(double gia, int? mongDoi)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "So duong").Value = gia);

        Assert.Equal(mongDoi, dong.SoDuong("So duong"));
    }

    [Theory]
    [InlineData("0", 0)]
    [InlineData("2", 2)]
    [InlineData("một", null)]
    [InlineData("1.5", null)]
    public void So_nguyen_khong_am_nhan_0(string gia, int? mongDoi)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "So khong am").Value = gia);

        Assert.Equal(mongDoi, dong.SoKhongAm("So khong am"));
        Assert.Equal(mongDoi is null ? 1 : 0, dong.LyDo.Count);
    }

    [Fact]
    public void So_nguyen_khong_am_o_so_0_duoc_nhan()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "So khong am").Value = 0.0);

        Assert.Equal(0, dong.SoKhongAm("So khong am"));
        Assert.Empty(dong.LyDo);
    }

    [Theory]
    [InlineData("TOAN TRINH", "Toàn trình")]
    [InlineData("một phần", "Một phần")]
    [InlineData("Toàn phần", null)]
    public void Lua_chon_so_khong_phan_biet_hoa_thuong_va_dau(string gia, string? mongDoi)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Chon").Value = gia);

        Assert.Equal(mongDoi, dong.LuaChon("Chon"));
        Assert.Equal(mongDoi is null ? 1 : 0, dong.LyDo.Count);
    }

    [Theory]
    [InlineData("07:00", 7, 0)]
    [InlineData("7:05", 7, 5)]
    [InlineData("17:30", 17, 30)]
    [InlineData("00:00", 0, 0)]
    public void Gio_dang_chu(string gia, int gio, int phut)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Gio").Value = gia);

        Assert.Equal(new TimeOnly(gio, phut), dong.Gio("Gio"));
        Assert.Empty(dong.LyDo);
    }

    [Theory]
    [InlineData("25:00")]
    [InlineData("07:60")]
    [InlineData("7h")]
    [InlineData("sáng")]
    public void Gio_sai_dang_la_loi(string gia)
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Gio").Value = gia);

        Assert.Null(dong.Gio("Gio"));
        Assert.Single(dong.LyDo);
    }

    [Fact]
    public void Gio_dang_gio_cua_excel_ca_ba_cach_luu()
    {
        // Ô giờ của Excel: số phân số của ngày, hoặc ô định dạng giờ; sau khi lưu rồi đọc lại.
        var sach = TaoSach();
        O(sach, 2, "Ma").Value = "a";
        O(sach, 2, "Gio").Value = 7.0 / 24;
        O(sach, 3, "Ma").Value = "b";
        O(sach, 3, "Gio").Value = TimeSpan.FromHours(13.5);
        O(sach, 3, "Gio").Style.NumberFormat.Format = "hh:mm";
        O(sach, 4, "Ma").Value = "c";
        O(sach, 4, "Gio").Value = 17.0 / 24;
        O(sach, 4, "Gio").Style.NumberFormat.Format = "hh:mm";

        var file = DocExcel.Doc(LuuRoiDocSach(sach), Mau, "thu.xlsx");
        var dong = file["Dữ liệu"].Dong;

        Assert.Equal(new TimeOnly(7, 0), dong[0].Gio("Gio"));
        Assert.Equal(new TimeOnly(13, 30), dong[1].Gio("Gio"));
        Assert.Equal(new TimeOnly(17, 0), dong[2].Gio("Gio"));
        Assert.All(dong, d => Assert.Empty(d.LyDo));
    }

    [Fact]
    public void Danh_sach_trong_o_tach_bang_cham_phay_va_xuong_dong_bo_phan_tu_trong()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Ds").Value = "a; b ;;c\nd\r\n\ne");

        Assert.Equal(["a", "b", "c", "d", "e"], dong.DanhSach("Ds"));
        Assert.Empty(dong.LyDo);
    }

    [Fact]
    public void Dong_trong_hoan_toan_bi_bo_qua_va_so_dong_la_so_dong_excel()
    {
        var sach = TaoSach();
        O(sach, 2, "Ma").Value = "a";
        O(sach, 4, "Ma").Value = "   "; // chỉ khoảng trắng coi là trống
        O(sach, 5, "Ma").Value = "b";

        var dong = DocExcel.Doc(sach, Mau, "thu.xlsx")["Dữ liệu"].Dong;

        Assert.Equal([2, 5], dong.Select(d => d.So));
    }

    [Fact]
    public void Ky_tu_vo_hinh_va_dieu_khien_bi_bo()
    {
        string[] voHinh = [.. Enumerable.Range(0x200B, 5).Select(c => ((char)c).ToString()), ((char)0xFEFF).ToString()];
        var gia = "A" + string.Join("B", voHinh) + "C" + (char)1 + "D" + (char)0 + "E";

        var (_, dong) = DocMotDong(s => O(s, 2, "Chu").Value = gia);

        Assert.Equal("ABBBBBCDE", dong.Chu("Chu"));
    }

    [Fact]
    public void Lam_sach_nfc_crlf_va_trim()
    {
        // "ệ" tách thành "e" + dấu mũ + dấu nặng (NFD) → NFC.
        var nfd = "Tie" + (char)0x0302 + (char)0x0323 + "t\r\ndong 2\r\n";

        var s = DocExcel.LamSach(nfd);

        Assert.Equal("Tiệt\ndong 2", s);
        Assert.Equal(string.Empty, DocExcel.LamSach(" \t "));
        Assert.Equal("a\tb", DocExcel.LamSach("a\tb"));
    }

    [Fact]
    public void Ky_tu_u200e_bi_bo_khi_doc_o()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Chu").Value = "Đăng k" + XlTest.U200E + "ý");

        Assert.Equal("Đăng ký", dong.Chu("Chu"));
    }

    [Fact]
    public void O_loi_cong_thuc_la_loi_dong()
    {
        var sach = TaoSach();
        O(sach, 2, "Ma").Value = "a";
        O(sach, 2, "Chu").FormulaA1 = "NA()";
        O(sach, 3, "Ma").Value = "b";
        O(sach, 3, "Chu").FormulaA1 = "\"x\"&\"y\"";
        sach.RecalculateAllFormulas();

        var file = DocExcel.Doc(LuuRoiDocSach(sach), Mau, "thu.xlsx");
        var dong = file["Dữ liệu"].Dong;

        Assert.Null(dong[0].Chu("Chu"));
        Assert.Contains("công thức", Assert.Single(dong[0].LyDo), StringComparison.Ordinal);
        Assert.Equal("xy", dong[1].Chu("Chu")); // dùng giá trị đã lưu
    }

    [Fact]
    public void Chu_dai_qua_gioi_han_cua_cot_la_loi()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Ngan").Value = "123456");

        dong.Chu("Ngan");

        Assert.Contains("dài quá 5", Assert.Single(dong.LyDo), StringComparison.Ordinal);
    }

    [Fact]
    public void Ma_dai_qua_20_la_loi()
    {
        var (_, dong) = DocMotDong(s => O(s, 2, "Ma").Value = new string('1', 21));

        dong.Ma("Ma");

        Assert.Single(dong.LyDo);
    }

    [Theory]
    [InlineData("https://dichvucong.gov.vn/a?b=1", true)]
    [InlineData("http://x.vn", true)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("JAVASCRIPT:alert(1)", false)]
    [InlineData("data:text/html;base64,AAAA", false)]
    [InlineData("//evil.com", false)]
    [InlineData("/duong-dan", false)]
    [InlineData("ftp://x.vn", false)]
    [InlineData("https://", false)]
    [InlineData("https://x.vn/a b", false)]
    [InlineData("vbscript:msgbox(1)", false)]
    public void Dia_chi_web_chi_nhan_http_https_tuyet_doi(string url, bool hopLe)
    {
        Assert.Equal(hopLe, DongDoc.LaUrlHopLe(url));

        var (_, dong) = DocMotDong(s => O(s, 2, "Url").Value = url);
        dong.Url("Url");
        Assert.Equal(hopLe ? 0 : 1, dong.LyDo.Count);
    }

    [Theory]
    [InlineData("a@b.vn", true)]
    [InlineData("cangiuoc@tayninh.gov.vn", true)]
    [InlineData("a@@b.vn", false)]
    [InlineData("a b@c.vn", false)]
    [InlineData("@b.vn", false)]
    [InlineData("a@", false)]
    [InlineData("khong-co-a-cong", false)]
    public void Email(string email, bool hopLe) => Assert.Equal(hopLe, DongDoc.LaEmailHopLe(email));

    [Theory]
    [InlineData("02723 893 900", true)]
    [InlineData("+84 272 389 3900", true)]
    [InlineData("(0272) 3893-900", true)]
    [InlineData("12345", false)]
    [InlineData("0272abc3900", false)]
    [InlineData("1234567890123456", false)]
    public void Dien_thoai(string so, bool hopLe) => Assert.Equal(hopLe, DongDoc.LaDienThoaiHopLe(so));

    [Fact]
    public void Dien_thoai_o_so_la_loi_nhap_dang_chu()
    {
        var sach = TaoSach();
        O(sach, 2, "Ma").Value = 123456789;
        var dong = DocExcel.Doc(sach, Mau, "thu.xlsx")["Dữ liệu"].Dong.Single();

        Assert.Null(dong.Ma("Ma"));
        Assert.Single(dong.LyDo);
    }

    [Fact]
    public void Thieu_o_bat_buoc_la_loi_nhac_ten_cot()
    {
        var sach = TaoSach();
        O(sach, 2, "Chu").Value = "x";
        var dong = DocExcel.Doc(sach, Mau, "thu.xlsx")["Dữ liệu"].Dong.Single();

        Assert.Null(dong.Ma("Ma"));
        Assert.Contains("thiếu Ma", Assert.Single(dong.LyDo), StringComparison.Ordinal);
    }

    [Fact]
    public void Moi_dong_loi_in_dung_mot_loi_dong_gom_moi_ly_do()
    {
        var (_, dong) = DocMotDong(s =>
        {
            O(s, 2, "So duong").Value = "0";
            O(s, 2, "Gio").Value = "abc";
        });
        dong.SoDuong("So duong");
        dong.Gio("Gio");
        var loi = new BoGomLoi();

        loi.Them(dong);

        var mot = Assert.Single(loi.Loi);
        Assert.Equal(2, mot.Dong);
        Assert.Contains(';', mot.LyDo);
    }

    // ----- Tiền tố danh sách (BR-18) -----

    [Theory]
    [InlineData("- Tờ khai", "Tờ khai")]
    [InlineData("+ Tờ khai", "Tờ khai")]
    [InlineData("• Tờ khai", "Tờ khai")]
    [InlineData("  -Tờ khai", "Tờ khai")]
    [InlineData("-   Tờ khai - bản sao", "Tờ khai - bản sao")]
    [InlineData("Tờ khai - bản sao", "Tờ khai - bản sao")]
    [InlineData("1. Tờ khai", "1. Tờ khai")]
    [InlineData("- - Tờ khai", "Tờ khai")]
    [InlineData("-", "-")]
    [InlineData("- -", "- -")]
    [InlineData("", "")]
    public void Bo_tien_to_danh_sach_chi_bo_o_dau_va_giu_phan_con_lai(string vao, string ra)
        => Assert.Equal(ra, DocExcel.BoTienToDanhSach(vao));

    // ----- Mở file -----

    [Fact]
    public void Mo_file_khong_ton_tai_la_loi_file()
        => Assert.Throws<LoiFileException>(() => DocExcel.Mo(Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx")));

    [Theory]
    [InlineData(".xls")]
    [InlineData(".xlsm")]
    [InlineData(".csv")]
    public void Mo_sai_duoi_la_loi_file(string duoi)
    {
        var duongDan = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + duoi);
        File.WriteAllText(duongDan, "x");
        try
        {
            var loi = Assert.Throws<LoiFileException>(() => DocExcel.Mo(duongDan));
            Assert.Contains(".xlsx", loi.Message, StringComparison.Ordinal);
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public void Mo_file_qua_20_MB_la_loi_file()
    {
        var duongDan = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
        using (var f = File.Create(duongDan))
        {
            f.SetLength((20L * 1024 * 1024) + 1);
        }

        try
        {
            var loi = Assert.Throws<LoiFileException>(() => DocExcel.Mo(duongDan));
            Assert.Contains("20", loi.Message, StringComparison.Ordinal);
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public void Mo_file_hong_la_loi_file()
    {
        var duongDan = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
        File.WriteAllText(duongDan, "day khong phai file excel");
        try
        {
            Assert.Throws<LoiFileException>(() => DocExcel.Mo(duongDan));
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public void Mo_file_giai_nen_qua_gioi_han_la_loi_file()
    {
        var duongDan = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
        using (var sach = TaoSach())
        {
            // Phần nội dung giải nén lớn hơn 1 MB nhưng file nén rất nhỏ.
            O(sach, 2, "Ma").Value = "a";
            O(sach, 2, "Chu").Value = new string('x', 30000);
            for (var r = 3; r < 200; r++)
            {
                O(sach, r, "Chu").Value = new string('x', 30000) + r;
            }

            sach.SaveAs(duongDan);
        }

        try
        {
            var loi = Assert.Throws<LoiFileException>(() => DocExcel.Mo(duongDan, 1024 * 1024));
            Assert.Contains("1 MB", loi.Message, StringComparison.Ordinal);

            using var duoc = DocExcel.Mo(duongDan); // giới hạn mặc định 100 MB: vẫn mở được
            Assert.NotEmpty(duoc.Worksheets);
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public void Sheet_qua_so_dong_toi_da_la_loi_cau_truc()
    {
        var sach = TaoSach();
        O(sach, MauExcel.SoDongToiDa + 1, "Ma").Value = "1.001";

        var file = DocExcel.Doc(sach, Mau, "thu.xlsx");

        var loi = Assert.Single(file.Loi.Loi);
        Assert.Equal("Dữ liệu", loi.Sheet);
        Assert.Contains(MauExcel.SoDongToiDa.ToString(CultureInfo.CurrentCulture), loi.LyDo, StringComparison.Ordinal);
        Assert.False(file["Dữ liệu"].HopLe);
        Assert.Empty(file["Dữ liệu"].Dong);
    }

    [Fact]
    public void Doc_duoc_file_dang_mo_trong_excel()
    {
        var duongDan = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
        using (var sach = TaoSach())
        {
            O(sach, 2, "Ma").Value = "a";
            sach.SaveAs(duongDan);
        }

        try
        {
            // Excel giữ file với quyền ghi và chia sẻ đọc.
            using var giu = new FileStream(duongDan, FileMode.Open, FileAccess.ReadWrite, FileShare.Read);
            using var sach = DocExcel.Mo(duongDan);

            Assert.Single(DocExcel.Doc(sach, Mau, "thu.xlsx")["Dữ liệu"].Dong);
        }
        finally
        {
            File.Delete(duongDan);
        }
    }

    [Fact]
    public async Task Ung_dung_tra_ma_2_khi_sai_duoi_hoac_file_qua_lon()
    {
        var thuMuc = Directory.CreateTempSubdirectory().FullName;
        try
        {
            var xlsm = Path.Combine(thuMuc, "a.xlsm");
            File.WriteAllText(xlsm, "x");
            var lon = Path.Combine(thuMuc, "lon.xlsx");
            using (var f = File.Create(lon))
            {
                f.SetLength((20L * 1024 * 1024) + 1);
            }

            foreach (var duongDan in new[] { xlsm, lon })
            {
                using var ra = new StringWriter(CultureInfo.InvariantCulture);
                using var loi = new StringWriter(CultureInfo.InvariantCulture);
                using var dichVu = new ServiceCollection().BuildServiceProvider();

                var ma = await UngDung.ChayAsync(["nhap", "thu-tuc", duongDan, "--chi-kiem"], dichVu, ra, loi, TestContext.Current.CancellationToken);

                Assert.Equal((int)MaThoat.SaiLenh, ma);
                Assert.NotEqual(string.Empty, loi.ToString());
            }
        }
        finally
        {
            Directory.Delete(thuMuc, recursive: true);
        }
    }

    private static XLWorkbook LuuRoiDocSach(XLWorkbook sach) => XlTest.LuuRoiDoc(sach);
}
