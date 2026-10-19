using System.Text.RegularExpressions;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Text;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Loai.ThuTuc;

/// <summary>Dữ liệu đã kiểm và chuẩn hoá của <c>thu-tuc.xlsx</c>, sẵn sàng ghi.</summary>
internal sealed class DuLieuThuTuc
{
    public List<Data.Entities.ThuTuc> ThuTuc { get; } = [];

    public List<LinhVuc> LinhVuc { get; } = [];

    public int ThuongGap => ThuTuc.Count(t => t.ThuTuThuongGap is not null);

    public int CapXa => ThuTuc.Count(t => t.ThuocDanhMucXa);

    public int CapTinh => ThuTuc.Count(t => t.ThuocDanhMucTinh);

    /// <summary>Mọi mã thủ tục xuất hiện ở sheet Thủ tục (kể cả dòng có lỗi khác) — để đối chiếu chéo.</summary>
    public HashSet<string> MaThuTuc { get; } = new(StringComparer.Ordinal);

    public HashSet<string> MaLinhVuc => LinhVuc.Select(l => l.Ma).ToHashSet(StringComparer.Ordinal);
}

/// <summary>Kiểm sheet Thủ tục, Thường gặp và các sheet con (plan F01 §3.2, §3.6).</summary>
internal static partial class KiemTraThuTuc
{
    private const int SoDongToiDaTrongCanhBao = 10;

    public static KetQuaKiemTra<DuLieuThuTuc> KiemTra(FileDoc file)
    {
        ArgumentNullException.ThrowIfNull(file);

        var loi = file.Loi;
        var duLieu = new DuLieuThuTuc();

        var thuTuc = file[TenSheet.ThuTuc];
        var thuongGap = file[TenSheet.ThuongGap];

        // Mã có trong sheet Thủ tục, để các sheet khác đối chiếu. Sheet Thủ tục lỗi cấu trúc thì bỏ qua đối chiếu.
        var doiChieuDuoc = thuTuc.HopLe;
        var theoMa = new Dictionary<string, Data.Entities.ThuTuc>(StringComparer.Ordinal);
        var theoThuTu = new List<Data.Entities.ThuTuc>();
        var dongCuaMa = new Dictionary<string, int>(StringComparer.Ordinal);
        var linhVucTheoMa = new Dictionary<string, LinhVuc>(StringComparer.Ordinal);
        var dongThoiHanKhac = new List<int>();
        var canhBaoDaBao = new HashSet<string>(StringComparer.Ordinal);

        foreach (var dong in thuTuc.Dong)
        {
            var ma = dong.Ma(TenCot.MaThuTuc);
            var ten = dong.Chu(TenCot.TenThuTuc);
            var tenLinhVuc = dong.Chu(TenCot.LinhVuc);
            var xa = dong.DanhDau(TenCot.DanhMucXa);
            var tinh = dong.DanhDau(TenCot.DanhMucTinh);
            var mucDo = dong.LuaChon(TenCot.MucDo);
            var coQuan = dong.Chu(TenCot.CoQuanThucHien);
            var yeuCau = dong.Chu(TenCot.YeuCauDieuKien);
            var trangThai = dong.Chu(TenCot.TrangThaiCongBo);
            var thoiHan = dong.Chu(TenCot.ThoiHanGiaiQuyet);
            var phi = dong.Chu(TenCot.PhiLePhi);
            var hinhThuc = dong.DanhSach(TenCot.HinhThucNop);
            var maDvc = dong.Ma(TenCot.MaDvc);
            var tenDonVi = dong.Chu(TenCot.TenDonViDvc);
            var maDonVi = dong.Ma(TenCot.MaDonViDvc);

            if (ma is not null)
            {
                duLieu.MaThuTuc.Add(ma);
                if (dongCuaMa.TryGetValue(ma, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.MaThuTuc, ma, dongDau));
                }
                else
                {
                    dongCuaMa[ma] = dong.So;
                }
            }

            if (!xa && !tinh)
            {
                dong.Loi(ThongBao.LoiDanhMuc);
            }

            var maLinhVuc = string.Empty;
            if (tenLinhVuc is not null)
            {
                maLinhVuc = TiengViet.TaoMaDuongDan(tenLinhVuc);
                if (maLinhVuc.Length == 0)
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiKhongCoChuSo, TenCot.LinhVuc));
                }
            }

            if (thoiHan is not null && ThoiHanKhac().IsMatch(TiengViet.ChuanHoaTimKiem(thoiHan)))
            {
                dongThoiHanKhac.Add(dong.So);
            }

            if (dong.LyDo.Count == 0 && ma is not null && ten is not null && tenLinhVuc is not null && mucDo is not null)
            {
                GopLinhVuc(linhVucTheoMa, maLinhVuc, tenLinhVuc, loi, canhBaoDaBao);

                var moi = new Data.Entities.ThuTuc
                {
                    Ma = ma,
                    Ten = ten,
                    TenTimKiem = TiengViet.ChuanHoaTimKiem(ten),
                    LinhVucMa = maLinhVuc,
                    ThuocDanhMucXa = xa,
                    ThuocDanhMucTinh = tinh,
                    MucDo = (MucDo)(MauExcel.MucDo.ToList().IndexOf(mucDo) + 1),
                    CoQuanThucHien = coQuan,
                    YeuCauDieuKien = yeuCau,
                    TrangThaiCongBo = trangThai,
                    ThoiHan = thoiHan,
                    Phi = phi,
                    HinhThucNop = hinhThuc,
                    MaDvc = maDvc,
                    DonViTen = tenDonVi,
                    DonViMa = maDonVi,
                    ThuTu = theoThuTu.Count + 1,
                };
                theoMa[ma] = moi;
                theoThuTu.Add(moi);
            }

            loi.Them(dong);
        }

        KiemThuongGap(thuongGap, doiChieuDuoc, duLieu.MaThuTuc, theoMa, loi);
        KiemSheetCon(file, duLieu.MaThuTuc, doiChieuDuoc, theoMa, loi);

        if (dongThoiHanKhac.Count > 0)
        {
            var danhSach = string.Join(", ", dongThoiHanKhac.Take(SoDongToiDaTrongCanhBao));
            if (dongThoiHanKhac.Count > SoDongToiDaTrongCanhBao)
            {
                danhSach += ", …";
            }

            loi.ThemCanhBao(Chuoi.Dinh(ThongBao.CanhBaoThoiHanKhac, dongThoiHanKhac.Count, danhSach));
        }

        duLieu.ThuTuc.AddRange(theoThuTu);
        duLieu.LinhVuc.AddRange(linhVucTheoMa.Values);
        return loi.Xong(duLieu);
    }

    private static void GopLinhVuc(
        Dictionary<string, LinhVuc> theoMa,
        string ma,
        string ten,
        BoGomLoi loi,
        HashSet<string> daBao)
    {
        if (theoMa.TryGetValue(ma, out var daCo))
        {
            if (daCo.Ten != ten && daBao.Add(ten + "|" + ma))
            {
                loi.ThemCanhBao(Chuoi.Dinh(ThongBao.CanhBaoLinhVucGop, daCo.Ten, ten, ma));
            }

            return;
        }

        theoMa[ma] = new LinhVuc { Ma = ma, Ten = ten, TenTimKiem = TiengViet.ChuanHoaTimKiem(ten) };
    }

    private static void KiemThuongGap(
        SheetDoc sheet,
        bool doiChieuDuoc,
        HashSet<string> maTrongSheet,
        Dictionary<string, Data.Entities.ThuTuc> theoMa,
        BoGomLoi loi)
    {
        var dongCuaMa = new Dictionary<string, int>(StringComparer.Ordinal);
        var dongCuaThuTu = new Dictionary<int, int>();

        foreach (var dong in sheet.Dong)
        {
            var ma = dong.Ma(TenCot.MaThuTuc);
            var thuTu = dong.SoDuong(TenCot.ThuTu);

            if (ma is not null)
            {
                if (doiChieuDuoc && !maTrongSheet.Contains(ma))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiMaKhongCo, ma));
                }

                if (dongCuaMa.TryGetValue(ma, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.MaThuTuc, ma, dongDau));
                }
                else
                {
                    dongCuaMa[ma] = dong.So;
                }
            }

            if (thuTu is not null)
            {
                if (dongCuaThuTu.TryGetValue(thuTu.Value, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.ThuTu, thuTu.Value, dongDau));
                }
                else
                {
                    dongCuaThuTu[thuTu.Value] = dong.So;
                }
            }

            if (dong.LyDo.Count == 0 && ma is not null && thuTu is not null && theoMa.TryGetValue(ma, out var thuTuc))
            {
                thuTuc.ThuTuThuongGap = thuTu;
            }

            loi.Them(dong);
        }
    }

    private static string? BoTienTo(string? chuoi) => chuoi is null ? null : DocExcel.BoTienToDanhSach(chuoi);

    private static void KiemSheetCon(
        FileDoc file,
        HashSet<string> maTrongSheet,
        bool doiChieuDuoc,
        Dictionary<string, Data.Entities.ThuTuc> theoMa,
        BoGomLoi loi)
    {
        foreach (var dong in file[TenSheet.TrinhTu].Dong)
        {
            var thuTuc = LayThuTuc(dong, maTrongSheet, doiChieuDuoc, theoMa);
            var truongHop = dong.Chu(TenCot.TruongHop);
            var noiDung = BoTienTo(dong.Chu(TenCot.NoiDung));
            if (dong.LyDo.Count == 0 && thuTuc is not null && noiDung is not null)
            {
                thuTuc.TrinhTu.Add(new BuocTrinhTu { TruongHop = truongHop, NoiDung = noiDung });
            }

            loi.Them(dong);
        }

        foreach (var dong in file[TenSheet.CachThuc].Dong)
        {
            var thuTuc = LayThuTuc(dong, maTrongSheet, doiChieuDuoc, theoMa);
            var cach = new CachThucNop
            {
                HinhThuc = dong.Chu(TenCot.HinhThucNop),
                ThoiHan = dong.Chu(TenCot.ThoiHan),
                Phi = dong.Chu(TenCot.PhiLePhi),
                MoTa = dong.Chu(TenCot.MoTa),
            };

            if (cach is { HinhThuc: null, ThoiHan: null, Phi: null, MoTa: null } && dong.LyDo.Count == 0)
            {
                dong.Loi(Chuoi.Dinh(
                    ThongBao.LoiCanItNhatMot,
                    string.Join(", ", TenCot.HinhThucNop, TenCot.ThoiHan, TenCot.PhiLePhi, TenCot.MoTa)));
            }

            if (dong.LyDo.Count == 0 && thuTuc is not null)
            {
                thuTuc.CachThuc.Add(cach);
            }

            loi.Them(dong);
        }

        foreach (var dong in file[TenSheet.ThanhPhanHoSo].Dong)
        {
            var thuTuc = LayThuTuc(dong, maTrongSheet, doiChieuDuoc, theoMa);
            var ten = BoTienTo(dong.Chu(TenCot.TenGiayTo));
            var banChinh = dong.SoKhongAm(TenCot.SoBanChinh);
            var banSao = dong.SoKhongAm(TenCot.SoBanSao);

            // Q10: không có số bản nào lớn hơn 0 thì coi như chưa ghi (nguồn để 0 khi không ghi).
            if (banChinh is not > 0 && banSao is not > 0)
            {
                banChinh = null;
                banSao = null;
            }

            if (dong.LyDo.Count == 0 && thuTuc is not null && ten is not null)
            {
                thuTuc.ThanhPhanHoSo.Add(new GiayTo { Ten = ten, BanChinh = banChinh, BanSao = banSao });
            }

            loi.Them(dong);
        }

        var ketQua = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var dong in file[TenSheet.KetQua].Dong)
        {
            var thuTuc = LayThuTuc(dong, maTrongSheet, doiChieuDuoc, theoMa);
            var ten = BoTienTo(dong.Chu(TenCot.TenKetQua));
            if (dong.LyDo.Count == 0 && thuTuc is not null && ten is not null)
            {
                if (!ketQua.TryGetValue(thuTuc.Ma, out var ds))
                {
                    ketQua[thuTuc.Ma] = ds = [];
                }

                ds.Add(ten);
            }

            loi.Them(dong);
        }

        foreach (var (ma, ds) in ketQua)
        {
            theoMa[ma].KetQua = [.. ds];
        }

        foreach (var dong in file[TenSheet.CanCu].Dong)
        {
            var thuTuc = LayThuTuc(dong, maTrongSheet, doiChieuDuoc, theoMa);
            var soKyHieu = dong.Chu(TenCot.SoKyHieu);
            var trichYeu = dong.Chu(TenCot.TrichYeu);
            if (soKyHieu is null && trichYeu is null && dong.LyDo.Count == 0)
            {
                dong.Loi(Chuoi.Dinh(ThongBao.LoiCanItNhatMot, string.Join(", ", TenCot.SoKyHieu, TenCot.TrichYeu)));
            }

            if (dong.LyDo.Count == 0 && thuTuc is not null)
            {
                thuTuc.CanCu.Add(new VanBanCanCu { SoKyHieu = soKyHieu, TrichYeu = trichYeu });
            }

            loi.Them(dong);
        }
    }

    /// <summary>Đọc "Mã thủ tục" của dòng con; ghi lỗi nếu mã không có trong sheet Thủ tục. Trả về thủ tục hợp lệ tương ứng (nếu có).</summary>
    private static Data.Entities.ThuTuc? LayThuTuc(
        DongDoc dong,
        HashSet<string> maTrongSheet,
        bool doiChieuDuoc,
        Dictionary<string, Data.Entities.ThuTuc> theoMa)
    {
        var ma = dong.Ma(TenCot.MaThuTuc);
        if (ma is null)
        {
            return null;
        }

        if (doiChieuDuoc && !maTrongSheet.Contains(ma))
        {
            dong.Loi(Chuoi.Dinh(ThongBao.LoiMaKhongCo, ma));
            return null;
        }

        return theoMa.GetValueOrDefault(ma);
    }

    // Thời hạn chỉ ghi "Khác" (vd. "1 Khác") sau khi chuẩn hoá.
    [GeneratedRegex(@"^(\d+ )?khac$", RegexOptions.CultureInvariant)]
    private static partial Regex ThoiHanKhac();
}
