using DichVuCong.Api.Features.ThongTinTrungTam;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Api.DuLieuThu;

namespace DichVuCong.Tests.Api;

/// <summary>
/// Test hợp đồng của <see cref="ThongTinTrungTamService"/> (plan F00 §9.4 R7): cùng các ca chạy trên mọi nguồn dữ liệu.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract class ThongTinTrungTamServiceContract
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    private ThongTinTrungTamService TaoService(TepDuLieuMau tep) => new(TaoNguon(tep));

    [Fact]
    public async Task ChuaCoTrungTam_LayAsyncVaLayDacTaAsync_TraNull()
    {
        var service = TaoService(TrungTamThu.ChuaCoTrungTam());

        Assert.Null(await service.LayAsync(Ct));
        Assert.Null(await service.LayDacTaAsync(Ct));
    }

    [Fact]
    public async Task DayDu_TraDungCacTruong()
    {
        var dto = await TaoService(TrungTamThu.DayDu()).LayAsync(Ct);

        Assert.NotNull(dto);
        Assert.Equal("Trung tâm thử A", dto.Ten);
        Assert.Equal("xã thử B", dto.Xa);
        Assert.Equal("tỉnh thử C", dto.Tinh);
        Assert.Equal("UBND xã thử B", dto.CoQuanChuQuan);
        Assert.Equal("Người thử", dto.NguoiChiuTrachNhiem);
        Assert.Equal("Giám đốc (dữ liệu thử)", dto.ChucVuNguoiChiuTrachNhiem);
        Assert.Equal("Địa chỉ thử", dto.DiaChi);
        Assert.Equal("0000.000.000", dto.DienThoai);
        Assert.Equal("thu@example.gov.vn", dto.Email);
        Assert.Equal("https://example.gov.vn/ban-do", dto.BanDo);
        Assert.Equal("Nghỉ thứ Bảy, Chủ nhật và ngày lễ.", dto.GhiChuNgayNghi);
        Assert.Equal(new MangXaHoiDto(null, "https://facebook.com/thu", null, "https://tiktok.com/@thu"), dto.MangXaHoi);
    }

    [Fact]
    public async Task LienKetVaODichVu_SapTheoThuTu_VaGiuTruongNull()
    {
        var dto = await TaoService(TrungTamThu.DayDu()).LayAsync(Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [new LienKetDto("Cổng Dịch vụ công Quốc gia", "https://dichvucong.gov.vn"), new LienKetDto("Liên kết thứ hai", "https://example.gov.vn/hai")],
            dto.LienKet);
        Assert.Equal(
            [new ODichVuDto("Đánh giá hài lòng", "danh-gia", null), new ODichVuDto("Tra cứu hồ sơ", "tra-cuu-ho-so", "https://example.gov.vn/tra-cuu")],
            dto.ODichVu);
    }

    [Fact]
    public async Task GioLamViec_SapTheoThu_DinhDangHHmm_VaGioThieuLaNull()
    {
        var dto = await TaoService(TrungTamThu.DayDu()).LayAsync(Ct);

        Assert.NotNull(dto);
        Assert.Equal(
            [
                new GioLamViecDto(1, "07:00", "11:30", "13:30", "17:05"),
                new GioLamViecDto(3, null, null, "13:00", "16:00"),
                new GioLamViecDto(6, "07:00", "11:00", null, null),
            ],
            dto.GioLamViec);
    }

    [Fact]
    public async Task NgayCapNhatThuTuc_LaNgayVietNamCuaLanNhapThuTuc()
    {
        var service = TaoService(TrungTamThu.DayDu());

        var dto = await service.LayAsync(Ct);
        var dacTa = await service.LayDacTaAsync(Ct);

        Assert.Equal(TrungTamThu.NgayCapNhat, dto!.NgayCapNhatThuTuc);
        Assert.Equal(TrungTamThu.NgayCapNhat, dacTa!.NgayCapNhatThuTuc);
    }

    [Fact]
    public async Task LayDacTa_TraTenVaCoQuanChuQuan()
    {
        var dacTa = await TaoService(TrungTamThu.DayDu()).LayDacTaAsync(Ct);

        Assert.Equal(new DacTaTrungTam("Trung tâm thử A", "UBND xã thử B", TrungTamThu.NgayCapNhat), dacTa);
    }

    [Fact]
    public async Task ToiThieu_CacTruongKhongBatBuocLaNull_DanhSachRong()
    {
        var dto = await TaoService(TrungTamThu.ToiThieu()).LayAsync(Ct);

        Assert.NotNull(dto);
        Assert.Equal("Trung tâm thử tối thiểu", dto.Ten);
        Assert.Null(dto.Xa);
        Assert.Null(dto.CoQuanChuQuan);
        Assert.Null(dto.BanDo);
        Assert.Null(dto.GhiChuNgayNghi);
        Assert.Equal(new MangXaHoiDto(null, null, null, null), dto.MangXaHoi);
        Assert.Empty(dto.LienKet);
        Assert.Empty(dto.ODichVu);
        Assert.Empty(dto.GioLamViec);
    }

    [Fact]
    public async Task GoiLaiNhieuLan_CungKetQua_KhongSuaDuLieuNguon()
    {
        var service = TaoService(TrungTamThu.DayDu());

        var lan1 = await service.LayAsync(Ct);
        var lan2 = await service.LayAsync(Ct);

        Assert.Equal(lan1!.GioLamViec, lan2!.GioLamViec);
        Assert.Equal(lan1.LienKet, lan2.LienKet);
        Assert.Equal(lan1.ODichVu, lan2.ODichVu);
        Assert.Equal(lan1.MangXaHoi, lan2.MangXaHoi);
        Assert.Equal(lan1.NgayCapNhatThuTuc, lan2.NgayCapNhatThuTuc);
    }
}
