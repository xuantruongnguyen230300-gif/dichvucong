using DichVuCong.Data.Entities;
using DichVuCong.Data.Text;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Loai.TroLy;

internal sealed class DuLieuTroLy
{
    public List<CauHoiMau> CauHoiMau { get; } = [];

    public List<ChuDeGoiY> ChuDeGoiY { get; } = [];

    public List<TuDongNghia> TuDongNghia { get; } = [];

    public List<VietTat> VietTat { get; } = [];

    public int CauTheoMuc => CauHoiMau.Count(c => c.MucTrungTam is not null);
}

/// <summary>Kiểm <c>tro-ly.xlsx</c>: câu hỏi mẫu, chủ đề gợi ý, từ đồng nghĩa, viết tắt (plan F01 §3.5, §3.6).</summary>
internal static class KiemTraTroLy
{
    /// <param name="file">File đã đọc.</param>
    /// <param name="maThuTuc">Mã thủ tục có trong danh mục (từ file thủ tục cùng lần chạy, hoặc từ DB); null thì bỏ qua đối chiếu.</param>
    /// <param name="maLinhVuc">Mã lĩnh vực có trong danh mục; null thì bỏ qua cảnh báo.</param>
    public static KetQuaKiemTra<DuLieuTroLy> KiemTra(FileDoc file, ISet<string>? maThuTuc, ISet<string>? maLinhVuc)
    {
        ArgumentNullException.ThrowIfNull(file);

        var loi = file.Loi;
        var duLieu = new DuLieuTroLy();

        KiemCauHoiMau(file[TenSheet.CauHoiMau], maThuTuc, duLieu, loi);
        KiemChuDe(file[TenSheet.ChuDeGoiY], maLinhVuc, duLieu, loi);
        KiemTuDongNghia(file[TenSheet.TuDongNghia], duLieu, loi);
        KiemVietTat(file[TenSheet.VietTat], duLieu, loi);

        return loi.Xong(duLieu);
    }

    private static void KiemCauHoiMau(SheetDoc sheet, ISet<string>? maThuTuc, DuLieuTroLy duLieu, BoGomLoi loi)
    {
        var dongCuaCau = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var dong in sheet.Dong)
        {
            var cauHoi = dong.Chu(TenCot.CauHoi);
            var cachHoi = dong.DanhSach(TenCot.CachHoiKhac);
            var traLoi = dong.Chu(TenCot.CauTraLoi);
            var muc = dong.LuaChon(TenCot.MucThongTinTrungTam);
            var maLienQuan = dong.DanhSachMa(TenCot.MaThuTucLienQuan);

            var coLoiMuc = dong.Tho(TenCot.MucThongTinTrungTam).Loai != LoaiO.Trong && muc is null;

            // BR-12: đúng một trong hai. Ô mục sai giá trị đã có lỗi riêng nên không báo thêm.
            if (!coLoiMuc && (traLoi is null) == (muc is null))
            {
                dong.Loi(ThongBao.LoiCauHoiBR12);
            }

            if (cauHoi is not null)
            {
                var khoa = TiengViet.ChuanHoaTimKiem(cauHoi);
                if (dongCuaCau.TryGetValue(khoa, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.CauHoi, cauHoi, dongDau));
                }
                else
                {
                    dongCuaCau[khoa] = dong.So;
                }
            }

            foreach (var ma in maLienQuan.Where(m => maThuTuc is not null && !maThuTuc.Contains(m)))
            {
                dong.Loi(Chuoi.Dinh(ThongBao.LoiMaThuTucLienQuan, ma));
            }

            if (dong.LyDo.Count == 0 && cauHoi is not null)
            {
                var cau = new CauHoiMau
                {
                    ThuTu = duLieu.CauHoiMau.Count + 1,
                    CauHoi = cauHoi,
                    TraLoi = traLoi,
                    MucTrungTam = muc is null ? null : (MucTrungTam)(MauExcel.MucTrungTam.ToList().IndexOf(muc) + 1),
                    MaThuTuc = maLienQuan,
                };

                // Cách hỏi số 1 là chính câu hỏi; từ 2 là các cách hỏi khác.
                var thuTu = 1;
                foreach (var noiDung in new[] { cauHoi }.Concat(cachHoi))
                {
                    cau.CachHoi.Add(new CauHoiMauCachHoi
                    {
                        CauHoiMauThuTu = cau.ThuTu,
                        ThuTu = thuTu++,
                        NoiDung = noiDung,
                        NoiDungTimKiem = TiengViet.ChuanHoaTimKiem(noiDung),
                    });
                }

                duLieu.CauHoiMau.Add(cau);
            }

            loi.Them(dong);
        }
    }

    private static void KiemChuDe(SheetDoc sheet, ISet<string>? maLinhVuc, DuLieuTroLy duLieu, BoGomLoi loi)
    {
        foreach (var dong in sheet.Dong)
        {
            var ten = dong.Chu(TenCot.TenHienThi);
            var linhVuc = dong.Chu(TenCot.LinhVuc);

            var ma = string.Empty;
            if (linhVuc is not null)
            {
                ma = TiengViet.TaoMaDuongDan(linhVuc);
                if (ma.Length == 0)
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.OThieu, TenCot.LinhVuc));
                }
            }

            if (dong.LyDo.Count == 0 && ten is not null && linhVuc is not null)
            {
                duLieu.ChuDeGoiY.Add(new ChuDeGoiY
                {
                    ThuTu = duLieu.ChuDeGoiY.Count + 1,
                    TenHienThi = ten,
                    TenLinhVuc = linhVuc,
                    LinhVucMa = ma,
                });

                if (maLinhVuc is not null && !maLinhVuc.Contains(ma))
                {
                    loi.ThemCanhBao(Chuoi.Dinh(ThongBao.CanhBaoChuDeLinhVuc, linhVuc, dong.So));
                }
            }

            loi.Them(dong);
        }
    }

    private static void KiemTuDongNghia(SheetDoc sheet, DuLieuTroLy duLieu, BoGomLoi loi)
    {
        var dongCuaTu = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var dong in sheet.Dong)
        {
            var tu = dong.Chu(TenCot.Tu);
            var cachNoi = dong.DanhSach(TenCot.CachNoiKhac);
            var khoa = tu is null ? null : TiengViet.ChuanHoaTimKiem(tu);

            if (khoa is not null)
            {
                if (dongCuaTu.TryGetValue(khoa, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.Tu, tu, dongDau));
                }
                else
                {
                    dongCuaTu[khoa] = dong.So;
                }
            }

            if (dong.LyDo.Count == 0 && tu is not null && khoa is not null)
            {
                duLieu.TuDongNghia.Add(new TuDongNghia
                {
                    ThuTu = duLieu.TuDongNghia.Count + 1,
                    Tu = tu,
                    TuTimKiem = khoa,
                    CachNoiKhac = cachNoi,
                });
            }

            loi.Them(dong);
        }
    }

    private static void KiemVietTat(SheetDoc sheet, DuLieuTroLy duLieu, BoGomLoi loi)
    {
        var dongCuaChu = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var dong in sheet.Dong)
        {
            var vietTat = dong.Chu(TenCot.VietTat);
            var dayDu = dong.Chu(TenCot.DayDu);
            var khoa = vietTat is null ? null : TiengViet.ChuanHoaTimKiem(vietTat);

            if (khoa is not null)
            {
                if (dongCuaChu.TryGetValue(khoa, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.VietTat, vietTat, dongDau));
                }
                else
                {
                    dongCuaChu[khoa] = dong.So;
                }
            }

            if (dong.LyDo.Count == 0 && vietTat is not null && khoa is not null && dayDu is not null)
            {
                duLieu.VietTat.Add(new VietTat
                {
                    ThuTu = duLieu.VietTat.Count + 1,
                    ChuVietTat = vietTat,
                    ChuVietTatTimKiem = khoa,
                    DayDu = dayDu,
                });
            }

            loi.Them(dong);
        }
    }
}
