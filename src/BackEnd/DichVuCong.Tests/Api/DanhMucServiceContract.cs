using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DichVuCong.Api.Features.DanhMuc;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Test hợp đồng của <see cref="DanhMucService"/> (plan F00 §9.4 R7): cùng các ca chạy trên mọi nguồn dữ liệu.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract partial class DanhMucServiceContract
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    private DanhMucService TaoService(TepDuLieuMau tep) => new(TaoNguon(tep));

    private static string NoiDungTep(TepDuLieuMau tep)
    {
        using var stream = new MemoryStream();
        tep.Ghi(stream);
        return Encoding.UTF8.GetString(stream.ToArray());
    }

    // ---- Thủ tục ----

    [Fact]
    public async Task ThuTuc_SapTheoThuTu_DuLieuThuThemDao()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);

        Assert.Equal(["D.01", "D.02", "D.03", "D.04", "D.05", "D.06", "D.07", "D.08"], ds.Select(t => t.Ma));
    }

    [Fact]
    public async Task ThuTuc_MucDoDungChuoi()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);

        Assert.Equal(
            ["toan-trinh", "toan-trinh", "toan-trinh", "mot-phan", "toan-trinh", "toan-trinh", "mot-phan", "mot-phan"],
            ds.Select(t => t.MucDo));
    }

    [Fact]
    public async Task ThuTuc_CapXaCapTinh_DuBaToHop()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);
        var theoMa = ds.ToDictionary(t => t.Ma);

        Assert.Equal((true, false), (theoMa["D.01"].CapXa, theoMa["D.01"].CapTinh));
        Assert.Equal((false, true), (theoMa["D.04"].CapXa, theoMa["D.04"].CapTinh));
        Assert.Equal((true, true), (theoMa["D.02"].CapXa, theoMa["D.02"].CapTinh));
    }

    [Fact]
    public async Task ThuTuc_TruongDayDuVaTruongNullVanCo()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);
        var theoMa = ds.ToDictionary(t => t.Ma);

        Assert.Equal(
            new ThuTucRutGonDto("D.01", "Thủ tục D.01", "thu tuc d.01", "ho-tich", "toan-trinh", true, false, null, "5 ngày làm việc", "Ủy ban nhân dân cấp xã"),
            theoMa["D.01"]);
        Assert.Equal(
            new ThuTucRutGonDto("D.03", "Thủ tục D.03", "thu tuc d.03", "chung-thuc", "toan-trinh", true, false, 1, "30 ngày", null),
            theoMa["D.03"]);
        Assert.Equal(2, theoMa["D.04"].ThuTuThuongGap);
        Assert.Null(theoMa["D.02"].ThuTuThuongGap);
    }

    [Fact]
    public async Task ThuTuc_ThoiHan_KhacKhongBaoGioRaNguyenVan()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);
        var theoMa = ds.ToDictionary(t => t.Ma, t => t.ThoiHan);

        Assert.Equal("5 ngày làm việc", theoMa["D.01"]);
        // "Khác" ở thủ tục, cách thức đầu "Khác" → lấy cách thức rõ đầu tiên.
        Assert.Equal("2 ngày", theoMa["D.02"]);
        Assert.Equal("30 ngày", theoMa["D.03"]);
        // "1 Khác", cách thức đầu rỗng → cách thức rõ kế tiếp.
        Assert.Equal("10 ngày làm việc", theoMa["D.04"]);
        // "  3  KHÁC " và không có cách thức → null.
        Assert.Null(theoMa["D.05"]);
        Assert.Null(theoMa["D.06"]);
        Assert.Null(theoMa["D.07"]);
        Assert.Equal("7 ngày", theoMa["D.08"]);
    }

    [Fact]
    public async Task ThuTuc_JsonChiCoMuoiTruongCuaHopDong()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayThuTucAsync(Ct);

        using var json = JsonDocument.Parse(JsonSerializer.Serialize(ds[0], Web));

        Assert.Equal(
            ["capTinh", "capXa", "coQuanThucHien", "linhVucMa", "ma", "mucDo", "ten", "tenTimKiem", "thoiHan", "thuTuThuongGap"],
            [.. json.RootElement.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }

    [Fact]
    public async Task ThuTuc_NguonKhongCoThuTuc_TraDanhSachRong()
    {
        Assert.Empty(await TaoService(DanhMucThu.Rong()).LayThuTucAsync(Ct));
        Assert.Empty(await TaoService(DanhMucThu.ChiCoLinhVuc()).LayThuTucAsync(Ct));
    }

    // ---- Lĩnh vực ----

    [Fact]
    public async Task LinhVuc_BoLinhVucKhongCoThuTuc()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayLinhVucAsync(Ct);

        Assert.DoesNotContain(ds, l => l.Ma == "trong");
        Assert.Equal(7, ds.Count);
    }

    [Fact]
    public async Task LinhVuc_SoThuTucMoiCapDung()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayLinhVucAsync(Ct);
        var theoMa = ds.ToDictionary(l => l.Ma);

        Assert.Equal(new LinhVucDto("ho-tich", "Hộ tịch", "ho tich", 2, 1), theoMa["ho-tich"]);
        Assert.Equal(new LinhVucDto("thuy-san", "Thuỷ sản", "thuy san", 1, 1), theoMa["thuy-san"]);
        Assert.Equal(new LinhVucDto("dau-tu", "Đầu tư", "dau tu", 0, 1), theoMa["dau-tu"]);
        Assert.Equal(new LinhVucDto("chung-thuc", "Chứng thực", "chung thuc", 1, 0), theoMa["chung-thuc"]);
        Assert.Equal(new LinhVucDto("dat-dai", "Đất đai", "dat dai", 0, 1), theoMa["dat-dai"]);
    }

    [Fact]
    public async Task LinhVuc_SapTheoTenTimKiemOrdinal_RoiTheoMa()
    {
        var ds = await TaoService(DanhMucThu.Bo()).LayLinhVucAsync(Ct);

        // "Đ" đã bỏ dấu xếp cùng "D"; hai "thuy loi" trùng tên tìm kiếm thì theo mã.
        Assert.Equal(
            ["chung-thuc", "dat-dai", "dau-tu", "ho-tich", "thuy-loi", "thuy-loi-2", "thuy-san"],
            ds.Select(l => l.Ma));
    }

    [Fact]
    public async Task LinhVuc_NguonKhongCoThuTuc_TraDanhSachRong()
    {
        Assert.Empty(await TaoService(DanhMucThu.Rong()).LayLinhVucAsync(Ct));
        Assert.Empty(await TaoService(DanhMucThu.ChiCoLinhVuc()).LayLinhVucAsync(Ct));
    }

    [Fact]
    public async Task GoiHaiLan_CungKetQua_VaKhongDoiDoiTuongCuaNguon()
    {
        var tep = DanhMucThu.Bo();
        var service = TaoService(tep);
        var truoc = NoiDungTep(tep);

        var thuTuc1 = JsonSerializer.Serialize(await service.LayThuTucAsync(Ct), Web);
        var linhVuc1 = JsonSerializer.Serialize(await service.LayLinhVucAsync(Ct), Web);
        var thuTuc2 = JsonSerializer.Serialize(await service.LayThuTucAsync(Ct), Web);
        var linhVuc2 = JsonSerializer.Serialize(await service.LayLinhVucAsync(Ct), Web);

        Assert.Equal(thuTuc1, thuTuc2);
        Assert.Equal(linhVuc1, linhVuc2);
        Assert.Equal(truoc, NoiDungTep(tep));
    }

    // ---- Trên bộ dữ liệu mẫu nhúng (F04 AC-7, du-lieu.md) ----

    [Fact]
    public async Task FileNhung_408ThuTuc_Xa266_Tinh408_75LinhVuc_16ThuongGap()
    {
        var service = TaoService(TepDuLieuMau.Nhung);

        var thuTuc = await service.LayThuTucAsync(Ct);
        var linhVuc = await service.LayLinhVucAsync(Ct);

        Assert.Equal(408, thuTuc.Count);
        Assert.Equal(266, thuTuc.Count(t => t.CapXa));
        Assert.Equal(408, thuTuc.Count(t => t.CapTinh));
        Assert.Equal(75, linhVuc.Count);
        Assert.Equal(16, thuTuc.Count(t => t.ThuTuThuongGap is not null));
        Assert.Equal(266, linhVuc.Sum(l => l.SoThuTucXa));
        Assert.Equal(408, linhVuc.Sum(l => l.SoThuTucTinh));
        Assert.Equal(thuTuc.Select(t => t.LinhVucMa).Distinct().Order(StringComparer.Ordinal), linhVuc.Select(l => l.Ma).Order(StringComparer.Ordinal));
    }

    [Fact]
    public async Task FileNhung_KhongThoiHanNaoLaChuKhac_VaDungThuTuNhap()
    {
        var thuTuc = await TaoService(TepDuLieuMau.Nhung).LayThuTucAsync(Ct);

        Assert.DoesNotContain(thuTuc, t => t.ThoiHan is not null && ChiLaKhac().IsMatch(t.ThoiHan));
        Assert.Equal(
            TepDuLieuMau.Nhung.ThuTuc.OrderBy(t => t.ThuTu).Select(t => t.Ma),
            thuTuc.Select(t => t.Ma));
        Assert.Equal(
            thuTuc.Where(t => t.ThuTuThuongGap is not null).Select(t => t.ThuTuThuongGap!.Value).Order(),
            Enumerable.Range(1, 16));
    }

    [GeneratedRegex(@"^\s*\d*\s*(khác|khac)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex ChiLaKhac();
}
