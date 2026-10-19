using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Tests.Api.Chatbot.TimKiem;

public sealed class TuDienTests
{
    private static readonly ChamDiemOptions Opt = new();

    private static TuDien Dung(string[] tu, Dictionary<string, int>? df = null)
        => new(tu, t => df is not null && df.TryGetValue(t, out var v) ? v : 0);

    [Fact]
    public void Sua_SjnhThanhSinh_HnoThanhHon()
    {
        var tuDien = Dung(["khai", "sinh", "ket", "hon"]);

        Assert.Equal("sinh", tuDien.Sua("sjnh", Opt));
        Assert.Null(Dung(["ket", "hon"]).Sua("hnon", Opt)); // từ 4 chữ không sửa bằng cách bỏ chữ (DoDaiToiThieuDeSuaBangXoaChu)
        Assert.Equal("khai", tuDien.Sua("khaii", Opt));
        Assert.Equal("khai", tuDien.Sua("khia", Opt));
    }

    [Fact]
    public void Sua_BoQuaTuDaCoToanSoTuNganVaTuCoChuSo()
    {
        var tuDien = Dung(["khai", "sinh", "qh15"]);

        Assert.Null(tuDien.Sua("sinh", Opt));
        Assert.Null(tuDien.Sua("123456", Opt));
        Assert.Null(tuDien.Sua("qh16", Opt));
        Assert.Null(tuDien.Sua("sin", Opt));
        Assert.Null(tuDien.Sua("kha", Opt));
    }

    [Fact]
    public void Sua_KhongDoiChuCaiDauVaKhongThayNguyenAmBangNguyenAm()
    {
        // F06: "giá vàng" từng bị sửa thành "giá đang" / "giá vùng" rồi ra danh sách thủ tục.
        var tuDien = Dung(["dang", "vung", "sinh", "tinh"]);

        Assert.Null(tuDien.Sua("vang", Opt));
        Assert.Null(tuDien.Sua("tanh", Opt));
        Assert.Equal("sinh", tuDien.Sua("sjnh", Opt));
    }

    [Fact]
    public void Sua_KhongCoTuDuGanThiKhongSua()
    {
        var tuDien = Dung(["khai", "sinh"]);

        Assert.Null(tuDien.Sua("vang", Opt));
        Assert.Null(tuDien.Sua("xyzxyz", Opt));
    }

    [Fact]
    public void Sua_TuNganToiDaMotPhepTuDaiToiDaHaiPhep()
    {
        var tuDien = Dung(["khai", "chuyen", "chuyennhuong"]);

        Assert.Equal("khai", tuDien.Sua("kahi", Opt));
        Assert.Null(tuDien.Sua("kxxi", Opt));
        Assert.Equal("chuyennhuong", tuDien.Sua("chuyennhoung", Opt));
        Assert.Equal("chuyennhuong", tuDien.Sua("chuyennuong", Opt));
        Assert.Equal("chuyennhuong", tuDien.Sua("chuyenhuon", Opt));
        Assert.Null(tuDien.Sua("chuyenhuo", Opt));
    }

    [Fact]
    public void Sua_HoaKhoangCachChonDfLonHon_HoaNuaChonOrdinalNhoHon()
    {
        // "sinh" cách "sinx" 1 phép, "sinp" cũng 1 phép.
        var df = new Dictionary<string, int> { ["sinp"] = 5, ["sinq"] = 9 };
        var tuDien = Dung(["sinp", "sinq"], df);

        Assert.Equal("sinq", tuDien.Sua("sinx", Opt));

        var bang = Dung(["sinq", "sinp"]);
        Assert.Equal("sinp", bang.Sua("sinx", Opt));
        Assert.Equal("sinp", Dung(["sinp", "sinq"]).Sua("sinx", Opt));
    }

    [Fact]
    public void Sua_KhoangCachNhoHonThangDfLonHon()
    {
        var df = new Dictionary<string, int> { ["khai"] = 1, ["khaixx"] = 100 };
        var tuDien = Dung(["khai", "khaixx"], df);

        Assert.Equal("khai", tuDien.Sua("khaii", Opt));
    }
}
