using DichVuCong.Data.Entities;
using DichVuCong.Data.Text;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Resources;
using TrungTamEntity = DichVuCong.Data.Entities.TrungTam;

namespace DichVuCong.Import.Loai.TrungTam;

internal sealed class DuLieuTrungTam
{
    public TrungTamEntity TrungTam { get; set; } = new();

    public List<GioLamViec> GioLamViec { get; } = [];

    public List<LienKet> LienKet { get; } = [];

    public List<ODichVu> ODichVu { get; } = [];
}

/// <summary>Kiểm <c>trung-tam.xlsx</c>: thông tin Trung tâm, giờ làm việc, liên kết, ô dịch vụ (plan F01 §3.4, §3.6).</summary>
internal static class KiemTraTrungTam
{
    private static readonly Dictionary<string, short> ThuTheoTen = TaoBangThu();

    public static KetQuaKiemTra<DuLieuTrungTam> KiemTra(FileDoc file)
    {
        ArgumentNullException.ThrowIfNull(file);

        var loi = file.Loi;
        var duLieu = new DuLieuTrungTam();

        KiemSheetTrungTam(file[TenSheet.TrungTam], duLieu, loi);
        KiemGioLamViec(file[TenSheet.GioLamViec], duLieu, loi);
        KiemLienKet(file[TenSheet.LienKet], duLieu, loi);
        KiemODichVu(file[TenSheet.ODichVu], duLieu, loi);

        return loi.Xong(duLieu);
    }

    private static void KiemSheetTrungTam(SheetDoc sheet, DuLieuTrungTam duLieu, BoGomLoi loi)
    {
        if (!sheet.HopLe)
        {
            return;
        }

        var giaTri = new Dictionary<string, string?>(StringComparer.Ordinal);
        var dongCuaMuc = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var dong in sheet.Dong)
        {
            var tenMuc = dong.Chu(TenCot.Muc);
            var mucMau = tenMuc is null
                ? null
                : MauExcel.MucTrungTamSheet.FirstOrDefault(m => MauExcel.SoKhop(m.Ten, tenMuc));

            if (tenMuc is not null && mucMau is null)
            {
                dong.Loi(Chuoi.Dinh(ThongBao.LoiMucLa, tenMuc));
            }
            else if (mucMau is not null)
            {
                if (dongCuaMuc.TryGetValue(mucMau.Ten, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.Muc, mucMau.Ten, dongDau));
                }
                else
                {
                    dongCuaMuc[mucMau.Ten] = dong.So;
                    giaTri[mucMau.Ten] = DocGiaTri(dong, mucMau);
                }
            }

            loi.Them(dong);
        }

        // BR-8: thiếu mục bắt buộc (không có dòng, hoặc giá trị trống) → lỗi theo sheet, nêu tên mục.
        foreach (var muc in MauExcel.MucTrungTamSheet.Where(m => m.BatBuoc))
        {
            if (!giaTri.TryGetValue(muc.Ten, out var v) || v is null)
            {
                // Dòng có mục nhưng giá trị sai dạng đã có lỗi dòng riêng; chỉ báo thiếu khi ô thật sự trống.
                var daCoLoiDong = dongCuaMuc.ContainsKey(muc.Ten) && loi.Loi.Any(l => l.Dong == dongCuaMuc[muc.Ten] && l.Sheet == sheet.Mau.Ten);
                if (!daCoLoiDong)
                {
                    loi.Them(sheet.Mau.Ten, null, Chuoi.Dinh(ThongBao.LoiThieuMuc, muc.Ten));
                }
            }
        }

        duLieu.TrungTam = new TrungTamEntity
        {
            Ten = Lay(giaTri, MauExcel.MucTenDonVi) ?? string.Empty,
            NguoiChiuTrachNhiem = Lay(giaTri, MauExcel.MucNguoiChiuTrachNhiem) ?? string.Empty,
            ChucVuNguoiChiuTrachNhiem = Lay(giaTri, MauExcel.MucChucVuNguoiChiuTrachNhiem),
            CoQuanChuQuan = Lay(giaTri, MauExcel.MucCoQuanChuQuan),
            DiaChi = Lay(giaTri, MauExcel.MucDiaChi) ?? string.Empty,
            DienThoai = Lay(giaTri, MauExcel.MucDienThoai) ?? string.Empty,
            Email = Lay(giaTri, MauExcel.MucEmail) ?? string.Empty,
            Xa = Lay(giaTri, MauExcel.MucXa),
            Tinh = Lay(giaTri, MauExcel.MucTinh),
            MaDonViCongDvc = Lay(giaTri, MauExcel.MucMaDonVi),
            BanDo = Lay(giaTri, MauExcel.MucBanDo),
            ZaloOa = Lay(giaTri, MauExcel.MucZalo),
            Facebook = Lay(giaTri, MauExcel.MucFacebook),
            YouTube = Lay(giaTri, MauExcel.MucYouTube),
            TikTok = Lay(giaTri, MauExcel.MucTikTok),
            GhiChuNgayNghi = Lay(giaTri, MauExcel.MucGhiChuNgayNghi),
        };
    }

    private static string? Lay(Dictionary<string, string?> giaTri, string muc) => giaTri.GetValueOrDefault(muc);

    /// <summary>Đọc ô "Giá trị" theo kiểu của mục; ô trống thì trả null (mục bắt buộc được báo thiếu ở bước sau).</summary>
    private static string? DocGiaTri(DongDoc dong, MucTrungTamMau muc) => muc.Kieu switch
    {
        KieuO.DienThoai => dong.DienThoai(TenCot.GiaTri, false, muc.Ten),
        KieuO.Email => dong.Email(TenCot.GiaTri, false, muc.Ten),
        KieuO.Url => dong.Url(TenCot.GiaTri, false, muc.Ten),
        KieuO.Ma => dong.Ma(TenCot.GiaTri, false, muc.DoDai, muc.Ten),
        _ => dong.Chu(TenCot.GiaTri, false, muc.DoDai, muc.Ten),
    };

    private static void KiemGioLamViec(SheetDoc sheet, DuLieuTrungTam duLieu, BoGomLoi loi)
    {
        var dongCuaThu = new Dictionary<short, int>();

        foreach (var dong in sheet.Dong)
        {
            var tenThu = dong.Chu(TenCot.Thu);
            short thu = 0;
            if (tenThu is not null)
            {
                if (!ThuTheoTen.TryGetValue(TiengViet.ChuanHoaTimKiem(tenThu), out thu))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiThuKhongHopLe, tenThu));
                }
                else if (dongCuaThu.TryGetValue(thu, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.Thu, tenThu, dongDau));
                }
                else
                {
                    dongCuaThu[thu] = dong.So;
                }
            }

            var truoc = dong.LyDo.Count;
            var sangTu = dong.Gio(TenCot.SangTu);
            var sangDen = dong.Gio(TenCot.SangDen);
            var saiSang = dong.LyDo.Count != truoc;

            truoc = dong.LyDo.Count;
            var chieuTu = dong.Gio(TenCot.ChieuTu);
            var chieuDen = dong.Gio(TenCot.ChieuDen);
            var saiChieu = dong.LyDo.Count != truoc;

            // Không báo thêm về cặp giờ khi chính ô giờ đã sai dạng (đã có lỗi riêng).
            if (!saiSang)
            {
                KiemCap(dong, TenCot.SangTu, TenCot.SangDen, sangTu, sangDen);
            }

            if (!saiChieu)
            {
                KiemCap(dong, TenCot.ChieuTu, TenCot.ChieuDen, chieuTu, chieuDen);
            }

            if (dong.LyDo.Count == 0 && thu != 0 && (sangTu is not null || chieuTu is not null))
            {
                duLieu.GioLamViec.Add(new GioLamViec
                {
                    Thu = thu,
                    SangTu = sangTu,
                    SangDen = sangDen,
                    ChieuTu = chieuTu,
                    ChieuDen = chieuDen,
                });
            }

            loi.Them(dong);
        }
    }

    private static void KiemCap(DongDoc dong, string cotTu, string cotDen, TimeOnly? tu, TimeOnly? den)
    {
        var nhan = $"{cotTu}/{cotDen}";
        if (tu is null != den is null)
        {
            dong.Loi(Chuoi.Dinh(ThongBao.LoiGioThieuDoi, nhan));
        }
        else if (tu is not null && den is not null && tu >= den)
        {
            dong.Loi(Chuoi.Dinh(ThongBao.LoiGioNguoc, nhan));
        }
    }

    private static void KiemLienKet(SheetDoc sheet, DuLieuTrungTam duLieu, BoGomLoi loi)
    {
        foreach (var dong in sheet.Dong)
        {
            var ten = dong.Chu(TenCot.Ten);
            var url = dong.Url(TenCot.DiaChiWeb);
            if (dong.LyDo.Count == 0 && ten is not null && url is not null)
            {
                duLieu.LienKet.Add(new LienKet { ThuTu = duLieu.LienKet.Count + 1, Ten = ten, Url = url });
            }

            loi.Them(dong);
        }

        if (sheet.HopLe && !duLieu.LienKet.Any(l => MauExcel.SoKhop(l.Ten, MauExcel.CongDvcQuocGia)))
        {
            loi.ThemCanhBao(ThongBao.CanhBaoThieuCongDvc);
        }
    }

    private static void KiemODichVu(SheetDoc sheet, DuLieuTrungTam duLieu, BoGomLoi loi)
    {
        foreach (var dong in sheet.Dong)
        {
            var ten = dong.Chu(TenCot.Ten);
            var moTa = dong.Chu(TenCot.MoTa);
            var bieuTuong = dong.LuaChon(TenCot.BieuTuong);
            var url = dong.Url(TenCot.DiaChiWeb);

            if (dong.LyDo.Count == 0 && ten is not null)
            {
                duLieu.ODichVu.Add(new ODichVu
                {
                    ThuTu = duLieu.ODichVu.Count + 1,
                    Ten = ten,
                    MoTa = moTa,
                    BieuTuong = bieuTuong ?? MauExcel.BieuTuongMacDinh,
                    Url = url,
                });
            }

            loi.Them(dong);
        }
    }

    private static Dictionary<string, short> TaoBangThu()
    {
        var bang = new Dictionary<string, short>(StringComparer.Ordinal);
        for (short i = 0; i < MauExcel.TenThu.Count; i++)
        {
            bang[TiengViet.ChuanHoaTimKiem(MauExcel.TenThu[i])] = (short)(i + 1);
        }

        // Thứ 2 đến Thứ 7 và CN.
        for (short thu = 2; thu <= 7; thu++)
        {
            bang[$"thu {thu}"] = (short)(thu - 1);
        }

        bang["cn"] = 7;
        return bang;
    }
}
