using System.Globalization;
using ClosedXML.Excel;
using DichVuCong.Data;
using DichVuCong.Import;
using DichVuCong.Import.Excel;
using DichVuCong.Tests.Data.Import;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Integration;

/// <summary>Một thủ tục để ghi vào <c>thu-tuc.xlsx</c> của bộ thử.</summary>
internal sealed record ThuTucNhap(string Ma, string Ten, string LinhVuc, bool Xa, bool Tinh, string MucDo = "Toàn trình");

/// <summary>Một dòng của sheet "Phân công" (<c>phan-cong.xlsx</c>).</summary>
internal sealed record PhanCongNhap(string LinhVuc, int? Quay, string? NoiTiepNhanChuyen = null);

/// <summary>Một dòng của sheet "Nhân sự" (<c>phan-cong.xlsx</c>).</summary>
internal sealed record NhanSuNhap(string HoTen, string? XungHo, string? ChucVu, int? Quay, string? MoTa = null);

/// <summary>
/// Dựng bốn file Excel hợp lệ trong thư mục tạm rồi chạy công cụ nhập thật (<c>nhap tat-ca</c>) vào DB thử:
/// cách tester thay "nhập lại bằng công cụ nhập" (F04 AC-7, F03 AC-20/AC-22).
/// </summary>
internal static class BoFileNhap
{
    public static void Tao(string thuMuc, IReadOnlyList<ThuTucNhap> thuTuc, IReadOnlyList<string> thuongGap, string tenTrungTam = "Trung tâm thử A", IReadOnlyList<PhanCongNhap>? phanCong = null, IReadOnlyList<NhanSuNhap>? nhanSu = null, IReadOnlyList<(string VietTat, string DayDu)>? vietTatThem = null)
    {
        var tt = GhiExcel.TaoMau(MauExcel.ThuTuc, dienSan: false);
        var bangThuTuc = XlTest.Bang(tt, MauExcel.ThuTuc, TenSheet.ThuTuc);
        foreach (var t in thuTuc)
        {
            bangThuTuc.Them(
                (TenCot.MaThuTuc, t.Ma), (TenCot.TenThuTuc, t.Ten), (TenCot.LinhVuc, t.LinhVuc),
                (TenCot.DanhMucXa, t.Xa), (TenCot.DanhMucTinh, t.Tinh), (TenCot.MucDo, t.MucDo),
                (TenCot.ThoiHanGiaiQuyet, "5 ngày làm việc"));
        }

        var bangThuongGap = XlTest.Bang(tt, MauExcel.ThuTuc, TenSheet.ThuongGap);
        for (var i = 0; i < thuongGap.Count; i++)
        {
            bangThuongGap.Them((TenCot.MaThuTuc, thuongGap[i]), (TenCot.ThuTu, i + 1));
        }

        Luu(tt, Path.Combine(thuMuc, MauExcel.TenFileThuTuc));

        var pc = GhiExcel.TaoMau(MauExcel.PhanCong, dienSan: false);
        var bangPhanCong = XlTest.Bang(pc, MauExcel.PhanCong, TenSheet.PhanCong);
        foreach (var p in phanCong ?? [])
        {
            var cot = new List<(string, object)> { (TenCot.LinhVuc, p.LinhVuc) };
            if (p.Quay is { } q)
            {
                cot.Add((TenCot.Quay, q));
            }

            if (p.NoiTiepNhanChuyen is { } n)
            {
                cot.Add((TenCot.NoiTiepNhanChuyen, n));
            }

            bangPhanCong.Them([.. cot]);
        }

        var bangNhanSu = XlTest.Bang(pc, MauExcel.PhanCong, TenSheet.NhanSu);
        foreach (var n in nhanSu ?? [])
        {
            var cot = new List<(string, object)> { (TenCot.HoTen, n.HoTen) };
            if (n.XungHo is { } x)
            {
                cot.Add((TenCot.XungHo, x));
            }

            if (n.ChucVu is { } cv)
            {
                cot.Add((TenCot.ChucVu, cv));
            }

            if (n.Quay is { } q)
            {
                cot.Add((TenCot.Quay, q));
            }

            if (n.MoTa is { } m)
            {
                cot.Add((TenCot.MoTaCongViec, m));
            }

            bangNhanSu.Them([.. cot]);
        }

        Luu(pc, Path.Combine(thuMuc, MauExcel.TenFilePhanCong));

        var tm = GhiExcel.TaoMau(MauExcel.TrungTam, dienSan: false);
        var bang = XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.TrungTam);
        bang.Them((TenCot.Muc, MauExcel.MucTenDonVi), (TenCot.GiaTri, tenTrungTam));
        bang.Them((TenCot.Muc, MauExcel.MucNguoiChiuTrachNhiem), (TenCot.GiaTri, "Người thử"));
        bang.Them((TenCot.Muc, MauExcel.MucDiaChi), (TenCot.GiaTri, "Địa chỉ thử"));
        bang.Them((TenCot.Muc, MauExcel.MucDienThoai), (TenCot.GiaTri, "0000 000 000"));
        bang.Them((TenCot.Muc, MauExcel.MucEmail), (TenCot.GiaTri, "thu@example.gov.vn"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.GioLamViec).Them((TenCot.Thu, "Thứ Hai"), (TenCot.SangTu, "07:00"), (TenCot.SangDen, "11:30"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.LienKet).Them((TenCot.Ten, MauExcel.CongDvcQuocGia), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn"));
        XlTest.Bang(tm, MauExcel.TrungTam, TenSheet.ODichVu).Them((TenCot.Ten, "Đánh giá hài lòng"), (TenCot.BieuTuong, "danh-gia"));
        Luu(tm, Path.Combine(thuMuc, MauExcel.TenFileTrungTam));

        var tl = GhiExcel.TaoMau(MauExcel.TroLy, dienSan: false);
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.CauHoiMau).Them((TenCot.CauHoi, "Trung tâm ở đâu?"), (TenCot.MucThongTinTrungTam, "Địa chỉ"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.ChuDeGoiY).Them((TenCot.TenHienThi, "Hộ tịch"), (TenCot.LinhVuc, thuTuc.Count > 0 ? thuTuc[0].LinhVuc : "Hộ tịch"));
        XlTest.Bang(tl, MauExcel.TroLy, TenSheet.TuDongNghia).Them((TenCot.Tu, "ket hon"), (TenCot.CachNoiKhac, "cuoi vo"));
        var bangVietTat = XlTest.Bang(tl, MauExcel.TroLy, TenSheet.VietTat);
        bangVietTat.Them((TenCot.VietTat, "TTHC"), (TenCot.DayDu, "thủ tục hành chính"));
        foreach (var (vt, dayDu) in vietTatThem ?? [])
        {
            bangVietTat.Them((TenCot.VietTat, vt), (TenCot.DayDu, dayDu));
        }

        Luu(tl, Path.Combine(thuMuc, MauExcel.TenFileTroLy));
    }

    private static void Luu(XLWorkbook s, string duongDan)
    {
        GhiExcel.LuuDe(s, duongDan);
        s.Dispose();
    }

    /// <summary>Chạy <c>nhap tat-ca &lt;thuMuc&gt;</c> vào DB có chuỗi kết nối <paramref name="chuoiKetNoi"/>.</summary>
    public static async Task<(int Ma, string Ra, string Loi)> NhapAsync(string chuoiKetNoi, string thuMuc)
    {
        var cauHinh = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { [UngDung.KhoaChuoiKetNoi] = chuoiKetNoi })
            .Build();
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(cauHinh);
        services.AddDichVuCongData(chuoiKetNoi);
        services.AddSingleton(TimeProvider.System);
        using var dichVu = services.BuildServiceProvider();
        using var ra = new StringWriter(CultureInfo.InvariantCulture);
        using var loi = new StringWriter(CultureInfo.InvariantCulture);

        var ma = await UngDung.ChayAsync(["nhap", "tat-ca", thuMuc], dichVu, ra, loi, TestContext.Current.CancellationToken);
        return (ma, ra.ToString(), loi.ToString());
    }
}
