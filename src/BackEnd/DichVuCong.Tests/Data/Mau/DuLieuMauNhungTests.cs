using System.Diagnostics;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DichVuCong.Data.Mau;
using DichVuCong.Data.Text;

namespace DichVuCong.Tests.Data.Mau;

/// <summary>File dữ liệu mẫu nhúng trong <c>DichVuCong.Data.dll</c> (plan F00 §9.5, T27): số bản ghi, làm sạch, trôi định dạng, thời gian nạp.</summary>
public sealed partial class DuLieuMauNhungTests
{
    private static readonly string[] MaThuongGap =
    [
        "1.001193", "1.000894", "1.000656", "2.000815", "2.000884", "1.004873", "2.000635", "1.004837",
        "1.001022", "1.012812", "1.012784", "1.012783", "1.013992", "1.001776", "1.013314", "1.012753",
    ];

    // Số di động Việt Nam (đầu 03, 05, 07, 08, 09 hoặc +84), có hoặc không có dấu cách, chấm, gạch.
    [GeneratedRegex(@"(?<!\d)(0|\+?84)[ .-]?[35789]\d{1,2}[ .-]?\d{3}[ .-]?\d{3,4}(?!\d)")]
    private static partial Regex SoDiDong();

    [GeneratedRegex(@"[\w.+-]+@[\w-]+(\.[\w-]+)+")]
    private static partial Regex Email();

    private static TepDuLieuMau Tep => TepDuLieuMau.Nhung;

    private static byte[] BytesNhung()
    {
        using var luong = typeof(TepDuLieuMau).Assembly.GetManifestResourceStream(TepDuLieuMau.TenTaiNguyen)
            ?? throw new InvalidOperationException("Thiếu tài nguyên nhúng.");
        using var bo = new MemoryStream();
        luong.CopyTo(bo);
        return bo.ToArray();
    }

    /// <summary>Mọi giá trị chuỗi trong file (không kể tên thuộc tính).</summary>
    private static List<string> MoiChuoi()
    {
        using var json = JsonDocument.Parse(BytesNhung());
        var ra = new List<string>();
        Di(json.RootElement, ra);
        return ra;
    }

    private static void Di(JsonElement e, List<string> ra)
    {
        switch (e.ValueKind)
        {
            case JsonValueKind.String:
                ra.Add(e.GetString()!);
                break;
            case JsonValueKind.Array:
                foreach (var x in e.EnumerateArray())
                {
                    Di(x, ra);
                }

                break;
            case JsonValueKind.Object:
                foreach (var p in e.EnumerateObject())
                {
                    Di(p.Value, ra);
                }

                break;
        }
    }

    // ---- Số bản ghi ----

    [Fact]
    public void Danh_muc_408_thu_tuc_75_linh_vuc_xa_266_tinh_408()
    {
        Assert.Equal(408, Tep.ThuTuc.Count);
        Assert.Equal(75, Tep.LinhVuc.Count);
        Assert.Equal(266, Tep.ThuTuc.Count(t => t.ThuocDanhMucXa));
        Assert.Equal(408, Tep.ThuTuc.Count(t => t.ThuocDanhMucTinh));
        Assert.Equal(4, Tep.LanNhap.Count);
    }

    [Fact]
    public void Muoi_sau_thu_tuc_thuong_gap_dung_ma_va_thu_tu()
    {
        var thuongGap = Tep.ThuTuc.Where(t => t.ThuTuThuongGap is not null).OrderBy(t => t.ThuTuThuongGap).ToList();

        Assert.Equal(MaThuongGap, thuongGap.Select(t => t.Ma));
        Assert.Equal(Enumerable.Range(1, 16), thuongGap.Select(t => (int)t.ThuTuThuongGap!.Value));
    }

    [Fact]
    public void Khong_phan_cong_khong_nhan_su()
    {
        Assert.Empty(Tep.PhanCongLinhVuc);
        Assert.Empty(Tep.NhanSu);
    }

    [Fact]
    public void Trung_tam_dung_email_ma_don_vi_nhan_giu_cho_va_muc_chua_chot_de_trong()
    {
        var tt = Tep.TrungTam;

        Assert.NotNull(tt);
        Assert.Equal("cangiuoc@tayninh.gov.vn", tt.Email);
        Assert.Equal("H53.183", tt.MaDonViCongDvc);
        Assert.Contains("(dữ liệu mẫu)", tt.NguoiChiuTrachNhiem, StringComparison.Ordinal);
        Assert.Null(tt.BanDo);
        Assert.Null(tt.ZaloOa);
        Assert.Null(tt.Facebook);
        Assert.Null(tt.YouTube);
        Assert.Null(tt.TikTok);
        Assert.Null(tt.GhiChuNgayNghi);
    }

    [Fact]
    public void Moi_thu_tuc_co_ma_don_vi_deu_la_H53_183()
    {
        var coMa = Tep.ThuTuc.Where(t => t.DonViMa is not null).ToList();

        Assert.NotEmpty(coMa);
        Assert.All(coMa, t => Assert.Equal("H53.183", t.DonViMa));
    }

    [Fact]
    public void Gio_lam_viec_lien_ket_o_dich_vu()
    {
        Assert.Equal(5, Tep.GioLamViec.Count);
        Assert.Equal(3, Tep.LienKet.Count);
        Assert.Equal(6, Tep.ODichVu.Count);
        Assert.Equal(2, Tep.ODichVu.Count(o => o.Url is null));
    }

    [Fact]
    public void Du_lieu_tro_ly()
    {
        Assert.Equal(11, Tep.CauHoiMau.Count);
        Assert.Equal(5, Tep.CauHoiMau.Count(c => c.MucTrungTam is not null));
        Assert.Equal(6, Tep.ChuDeGoiY.Count);
        Assert.Equal(45, Tep.TuDongNghia.Count);
        Assert.Equal(12, Tep.VietTat.Count);
    }

    // ---- Làm sạch ----

    [Fact]
    public void Khong_chuoi_nao_chua_vam_co_hay_h53_186()
    {
        foreach (var chuoi in MoiChuoi())
        {
            var chuan = TiengViet.ChuanHoaTimKiem(chuoi);
            Assert.DoesNotContain("vam co", chuan, StringComparison.Ordinal);
            Assert.DoesNotContain("h53.186", chuan, StringComparison.Ordinal);
        }
    }

    [Fact]
    public void Khong_ky_tu_vo_hinh_va_ky_tu_dieu_khien()
    {
        var chu = Encoding.UTF8.GetString(BytesNhung());

        // U+200B–U+200F, U+FEFF, U+2028, U+2029, U+202A–U+202E, U+2060, U+00AD (viết bằng mã số, không gõ \uXXXX).
        var voHinh = chu.Where(c =>
            (c >= (char)0x200B && c <= (char)0x200F)
            || c == (char)0xFEFF
            || c == (char)0x2028
            || c == (char)0x2029
            || (c >= (char)0x202A && c <= (char)0x202E)
            || c == (char)0x2060
            || c == (char)0x00AD).ToList();
        Assert.Empty(voHinh);

        // Chỉ có LF (xuống dòng thụt lề); \r, \t trong chuỗi được ghi dạng mã thoát nên không xuất hiện thô.
        Assert.DoesNotContain(chu, c => char.IsControl(c) && c != '\n');
    }

    [Fact]
    public void Khong_so_di_dong_va_chi_co_email_trung_tam()
    {
        var chuoi = MoiChuoi();

        Assert.All(chuoi, c => Assert.False(SoDiDong().IsMatch(c), "Có chuỗi giống số di động."));

        var email = chuoi.SelectMany(c => Email().Matches(c).Select(m => m.Value)).Distinct().ToList();
        Assert.Equal(["cangiuoc@tayninh.gov.vn"], email);
    }

    [Fact]
    public void Nguoi_chiu_trach_nhiem_la_nhan_giu_cho_va_khong_co_nhan_su()
    {
        Assert.Equal("(dữ liệu mẫu)", Tep.TrungTam!.NguoiChiuTrachNhiem);
        Assert.Empty(Tep.NhanSu);
    }

    // ---- Trôi định dạng, kích thước, thời gian ----

    [Fact]
    public void Doc_file_nhung_roi_ghi_lai_giong_tung_byte()
    {
        var goc = BytesNhung();
        using var ra = new MemoryStream();

        Tep.Ghi(ra);

        Assert.True(goc.AsSpan().SequenceEqual(ra.ToArray()), "Ghi lại khác file nhúng: định dạng đã trôi, sinh lại file.");
    }

    [Fact]
    public void File_dung_LF_va_ket_thuc_bang_mot_LF()
    {
        var goc = BytesNhung();

        Assert.DoesNotContain((byte)'\r', goc);
        Assert.Equal((byte)'\n', goc[^1]);
        Assert.NotEqual((byte)'\n', goc[^2]);
    }

    [Fact]
    public void Nap_lan_dau_khong_qua_1_giay_va_bao_kich_thuoc()
    {
        var goc = BytesNhung();
        long gzip;
        using (var bo = new MemoryStream())
        {
            using (var gz = new GZipStream(bo, CompressionLevel.Optimal, leaveOpen: true))
            {
                gz.Write(goc);
            }

            gzip = bo.Length;
        }

        var truoc = GC.GetTotalMemory(forceFullCollection: true);
        var dongHo = Stopwatch.StartNew();
        var tep = TepDuLieuMau.DocTaiNguyen(typeof(TepDuLieuMau).Assembly, TepDuLieuMau.TenTaiNguyen);
        dongHo.Stop();
        var sau = GC.GetTotalMemory(forceFullCollection: false);
        GC.KeepAlive(tep);

        TestContext.Current.TestOutputHelper?.WriteLine(
            $"du-lieu-mau.json: {goc.Length:N0} byte thô, {gzip:N0} byte gzip; nạp (đọc, kiểm, nối) {dongHo.ElapsedMilliseconds} ms; bộ nhớ thêm khoảng {(sau - truoc) / 1024.0 / 1024.0:N1} MB.");
        Assert.True(dongHo.Elapsed <= TimeSpan.FromSeconds(1), $"Nạp mất {dongHo.ElapsedMilliseconds} ms, ngưỡng 1000 ms.");
    }
}
