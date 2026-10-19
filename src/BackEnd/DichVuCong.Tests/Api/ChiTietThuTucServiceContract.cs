using System.Text;
using System.Text.Json;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Test hợp đồng của <see cref="ChiTietThuTucService"/> (plan F00 §9.4 R7): cùng các ca chạy trên mọi nguồn dữ liệu.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract class ChiTietThuTucServiceContract
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    private ChiTietThuTucService TaoService(TepDuLieuMau tep) => new(TaoNguon(tep));

    private static string Json(object? dto) => JsonSerializer.Serialize(dto, Web);

    private static string NoiDungTep(TepDuLieuMau tep)
    {
        using var stream = new MemoryStream();
        tep.Ghi(stream);
        return Encoding.UTF8.GetString(stream.ToArray());
    }

    [Fact]
    public async Task DayDu_TraDungCacTruong()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(ThuTucThu.MaDayDu, dto.Ma);
        Assert.Equal("Thủ tục đầy đủ", dto.Ten);
        Assert.Equal(ThuTucThu.TenLinhVuc, dto.LinhVuc);
        Assert.Equal("toan-trinh", dto.MucDo);
        Assert.Equal("Ủy ban nhân dân cấp xã", dto.CoQuanThucHien);
        Assert.Equal("5 ngày làm việc", dto.ThoiHan);
        Assert.Equal("Lệ phí: 0 VNĐ", dto.Phi);
        Assert.Equal(["Trực tuyến", "Bưu chính", "Trực tiếp"], dto.HinhThucNop);
        Assert.Equal("Điều kiện thử.\nDòng hai.", dto.YeuCauDieuKien);
        Assert.Equal(["Kết quả Z", "Kết quả A"], dto.KetQua);
    }

    [Fact]
    public async Task MucDo_DoiSangChuoiKebab()
    {
        var service = TaoService(ThuTucThu.Bo());

        Assert.Equal("toan-trinh", (await service.LayAsync(ThuTucThu.MaDayDu, Ct))!.MucDo);
        Assert.Equal("mot-phan", (await service.LayAsync(ThuTucThu.MaThoiHanKhac, Ct))!.MucDo);
    }

    [Fact]
    public async Task TrinhTuGiayToCanCuCachThuc_GiuNguyenThuTuLuu()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [new BuocTrinhTuDto(null, "Bước một.\nXuống dòng."), new BuocTrinhTuDto("Trường hợp B", "Bước hai."), new BuocTrinhTuDto("Trường hợp A", "Bước ba.")],
            dto.TrinhTu);
        Assert.Equal(["Giấy tờ Z", "Giấy tờ M", "Giấy tờ A"], dto.ThanhPhanHoSo.Select(g => g.Ten));
        Assert.Equal(["85/2019/TT-BTC", "04/2020/NĐ-CP", null], dto.CanCu.Select(c => c.SoKyHieu));
        Assert.Equal(["Trực tuyến", "Trực tiếp"], dto.CachThuc.Select(c => c.HinhThuc));
    }

    [Fact]
    public async Task GiayTo_GiuNguyenSoBan_KeCaNullNull()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [new GiayToDto("Giấy tờ Z", 1, 0), new GiayToDto("Giấy tờ M", 0, 1), new GiayToDto("Giấy tờ A", null, null)],
            dto.ThanhPhanHoSo);
    }

    [Fact]
    public async Task CanCu_ChiLaChuVaGiuTruongNull()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [new CanCuDto("85/2019/TT-BTC", "Thông tư thử"), new CanCuDto("04/2020/NĐ-CP", null), new CanCuDto(null, "Chỉ có trích yếu")],
            dto.CanCu);
    }

    [Fact]
    public async Task CachThuc_ThoiHanKhacThanhNull_ConLaiGiuNguyen()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [new CachThucNopDto("Trực tuyến", "3 ngày", "0 đồng", "Qua Cổng DVC"), new CachThucNopDto("Trực tiếp", null, null, null)],
            dto.CachThuc);
    }

    [Fact]
    public async Task ThoiHanThuTucKhongRo_LayCachThucRoDauTien()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaThoiHanTuCachThuc, Ct);

        Assert.NotNull(dto);
        Assert.Equal("3 ngày làm việc", dto.ThoiHan);
        // Bảng cách thức giữ cả dòng "Khác" ở dạng null, không bỏ dòng.
        Assert.Equal([null, "3 ngày làm việc", "7 ngày"], dto.CachThuc.Select(c => c.ThoiHan));
    }

    [Theory]
    [InlineData(ThuTucThu.MaThoiHanKhac)]
    [InlineData(ThuTucThu.MaThoiHanKhacKhongCachThuc)]
    [InlineData(ThuTucThu.MaToiThieu)]
    public async Task KhongCoThoiHanRo_ThoiHanLaNull(string ma)
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ma, Ct);

        Assert.NotNull(dto);
        Assert.Null(dto.ThoiHan);
        Assert.All(dto.CachThuc, c => Assert.Null(c.ThoiHan));
    }

    [Fact]
    public async Task ToiThieu_TruongTuyChonNull_DanhSachRong()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaToiThieu, Ct);

        Assert.NotNull(dto);
        Assert.Equal("Đất đai", dto.LinhVuc);
        Assert.Equal("mot-phan", dto.MucDo);
        Assert.Null(dto.CoQuanThucHien);
        Assert.Null(dto.Phi);
        Assert.Null(dto.YeuCauDieuKien);
        Assert.Empty(dto.HinhThucNop);
        Assert.Empty(dto.TrinhTu);
        Assert.Empty(dto.CachThuc);
        Assert.Empty(dto.ThanhPhanHoSo);
        Assert.Empty(dto.KetQua);
        Assert.Empty(dto.CanCu);
    }

    [Theory]
    [InlineData("9.999999")]
    [InlineData("t.001")]
    [InlineData("T.00")]
    public async Task MaKhongCoTrongDuLieu_TraNull(string ma)
    {
        // Mã phân biệt hoa thường: "t.001" không phải "T.001".
        Assert.Null(await TaoService(ThuTucThu.Bo()).LayAsync(ma, Ct));
    }

    [Fact]
    public async Task NguonRong_TraNull() =>
        Assert.Null(await TaoService(ThuTucThu.Rong()).LayAsync(ThuTucThu.MaDayDu, Ct));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("123456789012345678901")]
    [InlineData("abc<b>x</b>")]
    [InlineData("T.001 ")]
    [InlineData("T 001")]
    [InlineData("../x")]
    [InlineData("T.001\n")]
    [InlineData("T.001%20")]
    [InlineData("T.001'; DROP TABLE thu_tuc;--")]
    [InlineData("Thủ.tục")]
    [InlineData(".")]
    [InlineData("..")]
    [InlineData("...")]
    [InlineData("....................")]
    public async Task MaSaiDinhDang_TraNull_VaKhongTruyVanNguon(string? ma)
    {
        var nguon = new NguonDemTruyCap(TaoNguon(ThuTucThu.Bo()));
        var service = new ChiTietThuTucService(nguon);

        Assert.Null(await service.LayAsync(ma, Ct));
        Assert.Equal(0, nguon.SoLanTruyCap);
    }

    [Fact]
    public async Task MaDai20KyTu_DungDinhDang_CoTruyVanNguon()
    {
        var nguon = new NguonDemTruyCap(TaoNguon(ThuTucThu.Bo()));
        var service = new ChiTietThuTucService(nguon);

        // Đúng định dạng nhưng không có trong dữ liệu: có chạm nguồn, kết quả null.
        Assert.Null(await service.LayAsync("12345678901234567890", Ct));
        Assert.True(nguon.SoLanTruyCap > 0);
    }

    [Fact]
    public async Task GoiHaiLan_CungKetQua_VaKhongDoiDoiTuongCuaNguon()
    {
        var tep = ThuTucThu.Bo();
        var service = TaoService(tep);
        var truoc = NoiDungTep(tep);

        var lan1 = await service.LayAsync(ThuTucThu.MaDayDu, Ct);
        var lan2 = await service.LayAsync(ThuTucThu.MaDayDu, Ct);

        Assert.Equal(Json(lan1), Json(lan2));
        Assert.Equal(truoc, NoiDungTep(tep));
        // Mỗi lần một danh sách riêng: người gọi sửa danh sách của lần này không ảnh hưởng nguồn hay lần sau.
        Assert.NotSame(lan1!.ThanhPhanHoSo, lan2!.ThanhPhanHoSo);
        Assert.NotSame(lan1.KetQua, lan2.KetQua);
    }

    [Fact]
    public async Task Json_CoDungTapTruongCuaHopDong()
    {
        var dto = await TaoService(ThuTucThu.Bo()).LayAsync(ThuTucThu.MaDayDu, Ct);

        using var json = JsonDocument.Parse(Json(dto));

        Assert.Equal(
            [
                "cachThuc", "canCu", "coQuanThucHien", "hinhThucNop", "ketQua", "linhVuc", "ma", "mucDo", "phi",
                "ten", "thanhPhanHoSo", "thoiHan", "trinhTu", "yeuCauDieuKien",
            ],
            [.. json.RootElement.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal)]);
    }
}
