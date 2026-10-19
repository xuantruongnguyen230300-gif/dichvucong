using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;
using DichVuCong.Tests.Data.Mau;
using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Tests.Data.DuLieu;

/// <summary><see cref="NguonDuLieuMau"/> và 5 hàm <see cref="TruyVan"/> trên nguồn Mẫu (plan F00 §9.3, §9.4, T26).</summary>
public class NguonDuLieuMauTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static NguonDuLieuMau Nguon() => new(MauThu.TuMa());

    private static NguonDuLieuMau NguonRong() => new(new TepDuLieuMau { ThoiDiem = MauThu.ThoiDiem });

    [Fact]
    public async Task Moi_tap_tra_dung_du_lieu_cua_tep()
    {
        var nguon = Nguon();

        Assert.Equal(3, await nguon.ThuTucs.DemAsync(Ct));
        Assert.Equal(2, await nguon.LinhVucs.DemAsync(Ct));
        Assert.Equal(2, await nguon.PhanCongLinhVucs.DemAsync(Ct));
        Assert.Equal(2, await nguon.NhanSus.DemAsync(Ct));
        Assert.Equal(1, await nguon.TrungTams.DemAsync(Ct));
        Assert.Equal(2, await nguon.GioLamViecs.DemAsync(Ct));
        Assert.Equal(1, await nguon.LienKets.DemAsync(Ct));
        Assert.Equal(2, await nguon.ODichVus.DemAsync(Ct));
        Assert.Equal(2, await nguon.CauHoiMaus.DemAsync(Ct));
        Assert.Equal(3, await nguon.CauHoiMauCachHois.DemAsync(Ct));
        Assert.Equal(1, await nguon.ChuDeGoiYs.DemAsync(Ct));
        Assert.Equal(1, await nguon.TuDongNghias.DemAsync(Ct));
        Assert.Equal(1, await nguon.VietTats.DemAsync(Ct));
        Assert.Equal(4, await nguon.LanNhaps.DemAsync(Ct));
    }

    [Fact]
    public async Task Entity_la_chinh_doi_tuong_cua_tep_va_navigation_da_noi()
    {
        var tep = MauThu.TuMa();
        var nguon = new NguonDuLieuMau(tep);

        var khaiSinh = await nguon.ThuTucs.Where(t => t.Ma == "1.001193").DauTienAsync(Ct);

        Assert.Same(tep.ThuTuc[0], khaiSinh);
        Assert.Same(tep.LinhVuc[0], khaiSinh!.LinhVuc);
        Assert.Same(tep.TrungTam, await nguon.TrungTams.DauTienAsync(Ct));
    }

    [Fact]
    public async Task Select_ra_DTO_va_loc_theo_cot_tim_kiem_cho_ket_qua_dung()
    {
        var nguon = Nguon();

        var ten = await nguon.ThuTucs
            .Where(t => t.TenTimKiem.Contains("khai sinh") && t.ThuocDanhMucXa)
            .OrderBy(t => t.ThuTu)
            .Select(t => new { t.Ma, t.Ten })
            .DanhSachAsync(Ct);

        var mot = Assert.Single(ten);
        Assert.Equal("1.001193", mot.Ma);
    }

    // ---- 5 hàm TruyVan ----

    [Fact]
    public async Task DanhSachAsync_tra_danh_sach_theo_thu_tu_truy_van()
    {
        var ma = await Nguon().ThuTucs.OrderBy(t => t.ThuTu).Select(t => t.Ma).DanhSachAsync(Ct);

        Assert.Equal(["1.000894", "1.001193", "2.000815"], ma);
    }

    [Fact]
    public async Task DanhSachAsync_tap_rong_tra_danh_sach_rong()
        => Assert.Empty(await NguonRong().ThuTucs.DanhSachAsync(Ct));

    [Fact]
    public async Task DauTienAsync_tra_phan_tu_dau_hoac_null_khi_rong()
    {
        Assert.Equal("1.000894", (await Nguon().ThuTucs.OrderBy(t => t.ThuTu).DauTienAsync(Ct))!.Ma);
        Assert.Null(await Nguon().ThuTucs.Where(t => t.Ma == "khong-co").DauTienAsync(Ct));
        Assert.Null(await NguonRong().ThuTucs.DauTienAsync(Ct));
        Assert.Null(await NguonRong().TrungTams.DauTienAsync(Ct));
    }

    [Fact]
    public async Task DemAsync_dem_ca_khi_co_dieu_kien_va_khi_rong()
    {
        Assert.Equal(2, await Nguon().ThuTucs.Where(t => t.ThuocDanhMucXa).DemAsync(Ct));
        Assert.Equal(0, await Nguon().ThuTucs.Where(t => t.Ma == "khong-co").DemAsync(Ct));
        Assert.Equal(0, await NguonRong().ThuTucs.DemAsync(Ct));
    }

    [Fact]
    public async Task CoAsync_dung_sai_theo_dieu_kien_va_sai_khi_rong()
    {
        Assert.True(await Nguon().ThuTucs.CoAsync(Ct));
        Assert.True(await Nguon().ThuTucs.Where(t => t.Ma == "1.001193").CoAsync(Ct));
        Assert.False(await Nguon().ThuTucs.Where(t => t.Ma == "khong-co").CoAsync(Ct));
        Assert.False(await NguonRong().ThuTucs.CoAsync(Ct));
    }

    [Fact]
    public async Task LonNhatAsync_tra_gia_tri_lon_nhat_cua_cot()
    {
        Assert.Equal(MauThu.ThoiDiem, await Nguon().LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct));
        Assert.Equal(3, await Nguon().ThuTucs.LonNhatAsync(t => t.ThuTu, Ct));
        Assert.Equal(1, await Nguon().ThuTucs.LonNhatAsync(t => t.ThuTuThuongGap, Ct));
    }

    [Fact]
    public async Task LonNhatAsync_tap_rong_voi_kieu_nullable_tra_null()
    {
        Assert.Null(await Nguon().LanNhaps.Where(l => l.Loai == "khong-co").LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, Ct));
        Assert.Null(await NguonRong().ThuTucs.LonNhatAsync(t => t.ThuTuThuongGap, Ct));
        Assert.Null(await Nguon().ThuTucs.Where(t => t.Ma == "khong-co").LonNhatAsync(t => t.ThuTuThuongGap, Ct));
    }

    [Fact]
    public async Task LonNhatAsync_tap_rong_voi_kieu_khong_cho_null_bao_loi_trong_Task_nhu_EF()
    {
        var task = NguonRong().ThuTucs.LonNhatAsync(t => t.ThuTu, Ct);

        await Assert.ThrowsAsync<InvalidOperationException>(() => task);
    }

    [Fact]
    public async Task Huy_truoc_khi_chay_tra_Task_da_huy()
    {
        using var huy = new CancellationTokenSource();
        await huy.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => Nguon().ThuTucs.DanhSachAsync(huy.Token));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => Nguon().ThuTucs.DemAsync(huy.Token));
    }

    // ---- Quy tắc R1 ----

    [Fact]
    public async Task R1_ham_async_cua_EF_nem_loi_tren_nguon_Mau()
    {
        var nguon = Nguon();

        await Assert.ThrowsAsync<InvalidOperationException>(() => nguon.ThuTucs.ToListAsync(Ct));
        await Assert.ThrowsAsync<InvalidOperationException>(() => nguon.ThuTucs.FirstOrDefaultAsync(Ct));
        await Assert.ThrowsAsync<InvalidOperationException>(() => nguon.ThuTucs.CountAsync(Ct));
        await Assert.ThrowsAsync<InvalidOperationException>(() => nguon.ThuTucs.AnyAsync(Ct));
    }

    [Fact]
    public void Nguon_Mau_khong_theo_doi_thay_doi_va_khong_phai_provider_cua_EF()
        => Assert.False(Nguon().ThuTucs.Provider is Microsoft.EntityFrameworkCore.Query.IAsyncQueryProvider);

    [Fact]
    public void Tao_nguon_tu_tep_chua_noi_se_tu_noi()
    {
        var tep = MauThu.TuMa();

        _ = new NguonDuLieuMau(tep);

        Assert.Equal(4, tep.LanNhap.Count);
        Assert.NotNull(tep.ThuTuc[0].LinhVuc);
    }

    [Fact]
    public void Tep_null_bi_tu_choi()
        => Assert.Throws<ArgumentNullException>(() => new NguonDuLieuMau(null!));
}

