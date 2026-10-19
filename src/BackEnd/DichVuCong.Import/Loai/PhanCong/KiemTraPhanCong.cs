using DichVuCong.Data.Entities;
using DichVuCong.Data.Text;
using DichVuCong.Import.Excel;
using DichVuCong.Import.KiemTra;
using DichVuCong.Import.Resources;

namespace DichVuCong.Import.Loai.PhanCong;

internal sealed class DuLieuPhanCong
{
    public List<PhanCongLinhVuc> PhanCong { get; } = [];

    public List<NhanSu> NhanSu { get; } = [];
}

/// <summary>Kiểm và ghi <c>phan-cong.xlsx</c> (plan F01 §3.3). Hai sheet được không có dòng nào (BR-9).</summary>
internal static class KiemTraPhanCong
{
    /// <param name="file">File đã đọc.</param>
    /// <param name="maLinhVucTrongDanhMuc">Mã lĩnh vực của danh mục thủ tục để cảnh báo; null thì bỏ qua cảnh báo.</param>
    public static KetQuaKiemTra<DuLieuPhanCong> KiemTra(FileDoc file, ISet<string>? maLinhVucTrongDanhMuc)
    {
        ArgumentNullException.ThrowIfNull(file);

        var loi = file.Loi;
        var duLieu = new DuLieuPhanCong();
        var dongCuaMa = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var dong in file[TenSheet.PhanCong].Dong)
        {
            var ten = dong.Chu(TenCot.LinhVuc);
            var quay = dong.SoDuong(TenCot.Quay);
            var noiChuyen = dong.Chu(TenCot.NoiTiepNhanChuyen);

            var ma = string.Empty;
            if (ten is not null)
            {
                ma = TiengViet.TaoMaDuongDan(ten);
                if (ma.Length == 0)
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiKhongCoChuSo, TenCot.LinhVuc));
                }
                else if (dongCuaMa.TryGetValue(ma, out var dongDau))
                {
                    dong.Loi(Chuoi.Dinh(ThongBao.LoiTrung, TenCot.LinhVuc, ten, dongDau));
                }
                else
                {
                    dongCuaMa[ma] = dong.So;
                }
            }

            if (dong.LyDo.Count == 0 && ten is not null)
            {
                duLieu.PhanCong.Add(new PhanCongLinhVuc
                {
                    LinhVucMa = ma,
                    TenLinhVuc = ten,
                    Quay = quay,
                    NoiTiepNhanChuyen = noiChuyen,
                });

                if (maLinhVucTrongDanhMuc is not null && !maLinhVucTrongDanhMuc.Contains(ma))
                {
                    loi.ThemCanhBao(Chuoi.Dinh(ThongBao.CanhBaoPhanCongLinhVuc, ten, dong.So));
                }
            }

            loi.Them(dong);
        }

        foreach (var dong in file[TenSheet.NhanSu].Dong)
        {
            var hoTen = dong.Chu(TenCot.HoTen);
            var xungHo = dong.Chu(TenCot.XungHo);
            var chucVu = dong.Chu(TenCot.ChucVu);
            var quay = dong.SoDuong(TenCot.Quay);
            var moTa = dong.Chu(TenCot.MoTaCongViec);

            if (dong.LyDo.Count == 0 && hoTen is not null)
            {
                duLieu.NhanSu.Add(new NhanSu
                {
                    ThuTu = duLieu.NhanSu.Count + 1,
                    HoTen = hoTen,
                    XungHo = xungHo,
                    ChucVu = chucVu,
                    Quay = quay,
                    MoTa = moTa,
                });
            }

            loi.Them(dong);
        }

        return loi.Xong(duLieu);
    }
}
