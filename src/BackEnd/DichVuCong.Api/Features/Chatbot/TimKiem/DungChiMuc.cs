using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>Dữ liệu đã đọc và xử lý, đủ để dựng <see cref="ChiMucTroLy"/>.</summary>
internal sealed record DuLieuChiMuc(
    IReadOnlyList<ThuTucChiMuc> ThuTucs,
    IReadOnlyList<LinhVucChiMuc> LinhVucs,
    IReadOnlyList<CachHoiChiMuc> CachHois,
    IReadOnlyDictionary<int, MauChiMuc> Maus,
    IReadOnlyList<ChuDeChiMuc> ChuDes,
    BangThayDay VietTat,
    BangThayDay DongNghia,
    IReadOnlyCollection<string> TuTrongDuLieu);

/// <summary>
/// Dựng chỉ mục từ <see cref="INguonDuLieu"/> (plan F06 §4.2). Chỉ dùng <c>DanhSachAsync</c>, <c>Select</c> thẳng ra kiểu ẩn danh
/// (R1, R2), sắp theo khoá số trong truy vấn và sắp chuỗi trong C# bằng <c>Ordinal</c> (R3).
/// </summary>
internal static class DungChiMuc
{
    public static async Task<ChiMucTroLy> DungAsync(INguonDuLieu nguon, long phienBan, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(nguon);

        var linhVucDong = await nguon.LinhVucs.Select(l => new { l.Ma, l.Ten, l.TenTimKiem }).DanhSachAsync(ct);
        var thuTucDong = await nguon.ThuTucs
            .OrderBy(t => t.ThuTu)
            .Select(t => new { t.Ma, t.Ten, t.TenTimKiem, t.LinhVucMa, t.MucDo, t.ThuocDanhMucXa, t.ThuocDanhMucTinh, t.MaDvc, t.ThuTu })
            .DanhSachAsync(ct);
        var cauDong = await nguon.CauHoiMaus.OrderBy(c => c.ThuTu).Select(c => new { c.ThuTu, c.TraLoi, c.MucTrungTam, c.MaThuTuc }).DanhSachAsync(ct);
        var cachDong = await nguon.CauHoiMauCachHois
            .OrderBy(c => c.CauHoiMauThuTu)
            .ThenBy(c => c.ThuTu)
            .Select(c => new { c.CauHoiMauThuTu, c.ThuTu, c.NoiDungTimKiem })
            .DanhSachAsync(ct);
        var dongNghiaDong = await nguon.TuDongNghias.OrderBy(t => t.ThuTu).Select(t => new { t.ThuTu, t.Tu, t.CachNoiKhac }).DanhSachAsync(ct);
        var vietTatDong = await nguon.VietTats.OrderBy(v => v.ThuTu).Select(v => new { v.ThuTu, v.ChuVietTat, v.DayDu }).DanhSachAsync(ct);
        var chuDeDong = await nguon.ChuDeGoiYs.OrderBy(c => c.ThuTu).Select(c => new { c.ThuTu, c.TenHienThi, c.TenLinhVuc, c.LinhVucMa }).DanhSachAsync(ct);

        var tuDien = new HashSet<string>(NgonNguHoi.MoiTu(), StringComparer.Ordinal);

        var linhVucs = linhVucDong
            .OrderBy(l => l.Ma, StringComparer.Ordinal)
            .Select(l => new LinhVucChiMuc(l.Ma, l.Ten, Them(tuDien, ChuoiTu.Tach(l.TenTimKiem.Length > 0 ? l.TenTimKiem : l.Ten))))
            .ToList();
        var tenLinhVuc = linhVucs.ToDictionary(l => l.Ma, l => l.Ten, StringComparer.Ordinal);

        var thuTucs = thuTucDong
            .OrderBy(t => t.ThuTu)
            .ThenBy(t => t.Ma, StringComparer.Ordinal)
            .Select(t => TaoThuTuc(t.Ma, t.MaDvc, t.Ten, t.TenTimKiem, t.LinhVucMa, tenLinhVuc, t.MucDo, t.ThuocDanhMucXa, t.ThuocDanhMucTinh, t.ThuTu, tuDien))
            .ToList();

        var cachHois = cachDong.Select(c =>
            new CachHoiChiMuc(c.CauHoiMauThuTu, c.ThuTu, Duy(Them(tuDien, ChuoiTu.Tach(c.NoiDungTimKiem)).Where(t => !NgonNguHoi.TuDem.Contains(t))))).ToList();
        var maus = cauDong.ToDictionary(
            c => c.ThuTu,
            c => new MauChiMuc(c.ThuTu, c.TraLoi, c.MucTrungTam is null ? null : MucTrungTamChuoi.Tu(c.MucTrungTam.Value), [.. c.MaThuTuc]));

        var dongNghia = new BangThayDay();
        foreach (var d in dongNghiaDong)
        {
            var chuan = Them(tuDien, ChuoiTu.Tach(d.Tu));
            foreach (var cach in d.CachNoiKhac)
            {
                dongNghia.Them(Them(tuDien, ChuoiTu.Tach(cach)), chuan);
            }
        }

        var vietTat = new BangThayDay();
        foreach (var v in vietTatDong)
        {
            vietTat.Them(Them(tuDien, ChuoiTu.Tach(v.ChuVietTat)), Them(tuDien, ChuoiTu.Tach(v.DayDu)));
        }

        var chuDes = chuDeDong.Select(c => new ChuDeChiMuc(c.ThuTu, c.TenHienThi, c.TenLinhVuc, c.LinhVucMa)).ToList();

        return new ChiMucTroLy(
            phienBan,
            new DuLieuChiMuc(thuTucs, linhVucs, cachHois, maus, chuDes, vietTat, dongNghia, tuDien));
    }

    private static ThuTucChiMuc TaoThuTuc(
        string ma, string? maDvc, string ten, string tenTimKiem, string linhVucMa, Dictionary<string, string> tenLinhVuc,
        Data.Entities.MucDo mucDo, bool capXa, bool capTinh, int thuTu, HashSet<string> tuDien)
    {
        var tuCuaTen = Them(tuDien, ChuoiTu.Tach(tenTimKiem.Length > 0 ? tenTimKiem : ten));
        var tapTu = Duy(tuCuaTen.Where(t => !NgonNguHoi.TuDem.Contains(t) && !NgonNguHoi.TuThuTuc.Contains(t)));
        var dto = new ThuTucNganDto(ma, ten, tenLinhVuc.GetValueOrDefault(linhVucMa, string.Empty), MucDoChuoi.Tu(mucDo), capXa, capTinh);

        return new ThuTucChiMuc(ma, maDvc, dto, linhVucMa, tapTu, thuTu);
    }

    /// <summary>Thêm các từ vào từ điển, trả lại chính các từ đó.</summary>
    private static string[] Them(HashSet<string> tuDien, string[] tu)
    {
        tuDien.UnionWith(tu);

        return tu;
    }

    /// <summary>Từ không trùng, sắp <c>Ordinal</c> (xác định).</summary>
    private static string[] Duy(IEnumerable<string> tu) => [.. tu.Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal)];
}

/// <summary>Chuỗi của mục thông tin Trung tâm trong đáp án (<c>MucTrungTamTroLy</c>).</summary>
internal static class MucTrungTamChuoi
{
    public static string Tu(Data.Entities.MucTrungTam muc) => muc switch
    {
        Data.Entities.MucTrungTam.DiaChi => MucTrungTamTroLy.DiaChi,
        Data.Entities.MucTrungTam.GioLamViec => MucTrungTamTroLy.GioLamViec,
        Data.Entities.MucTrungTam.DienThoai => MucTrungTamTroLy.DienThoai,
        Data.Entities.MucTrungTam.Email => MucTrungTamTroLy.Email,
        Data.Entities.MucTrungTam.NopTrucTuyen => MucTrungTamTroLy.NopTrucTuyen,
        _ => throw new InvalidOperationException($"Mục thông tin Trung tâm ngoài khoảng cho phép: {(short)muc}."),
    };
}
