using DichVuCong.Data.Mau;
using DichVuCong.Import;
using DichVuCong.Import.Excel;
using DichVuCong.Import.Lenh;
using DichVuCong.Import.Loai.PhanCong;
using DichVuCong.Import.Loai.ThuTuc;
using DichVuCong.Import.Loai.TroLy;
using DichVuCong.Import.Loai.TrungTam;
using TrungTamEntity = DichVuCong.Data.Entities.TrungTam;

namespace DichVuCong.DuLieuMau;

/// <summary>
/// Lệnh <c>xuat-json</c> (plan F00 §9.5): data-mau/*.json → 4 file Excel trong thư mục tạm → đọc, kiểm bằng cùng bộ <c>KiemTra*</c>
/// của <c>nhap tat-ca</c> → <see cref="TepDuLieuMau"/> → ghi. Có lỗi thì không ghi gì.
/// Câu chữ in ra để thẳng trong mã: công cụ dành cho lập trình viên (CLAUDE.md, i18n không áp cho mục này).
/// </summary>
internal static class XuatJson
{
    public const string TenLenh = "xuat-json";

    private const string GhiChuTep = "Dữ liệu mẫu cho demo, sinh bằng DichVuCong.DuLieuMau. Không dùng làm dữ liệu thật.";

    /// <summary>Chạy lệnh; <paramref name="thamSo"/> là các tham số sau tên lệnh. Trả mã thoát của <see cref="MaThoat"/>.</summary>
    public static async Task<int> ChayAsync(string[] thamSo, TimeProvider thoiGian, TextWriter ra, TextWriter loi, CancellationToken huy)
    {
        var tach = ThamSoDongLenh.Tach(thamSo);
        if (tach.Loi is not null)
        {
            await loi.WriteLineAsync(tach.Loi);
            return (int)MaThoat.SaiLenh;
        }

        if (tach.ViTri.Count != 2)
        {
            await loi.WriteLineAsync(
                $"Cách dùng: DichVuCong.DuLieuMau {TenLenh} <thư-mục-nguồn> <file-ra> {ThamSoDongLenh.CoNguoiChiuTrachNhiem} \"<nhãn>\"");
            return (int)MaThoat.SaiLenh;
        }

        var (nguon, fileRa) = (tach.ViTri[0], tach.ViTri[1]);
        if (!Directory.Exists(nguon))
        {
            await loi.WriteLineAsync($"Không tìm thấy thư mục nguồn: {nguon}");
            return (int)MaThoat.SaiLenh;
        }

        var tam = Directory.CreateTempSubdirectory("dvc-xuat-json-");
        try
        {
            ThamSoDongLenh.SinhExcel(nguon, tam.FullName, tach.NguoiChiuTrachNhiem);

            List<MucNhap> cacMuc;
            try
            {
                cacMuc = NhapDuLieu.DocTatCa(tam.FullName);
            }
            catch (LoiFileException e)
            {
                await loi.WriteLineAsync(e.Message);
                return (int)MaThoat.SaiLenh;
            }

            var coLoi = cacMuc.Where(m => !m.HopLe).ToList();
            if (coLoi.Count > 0)
            {
                foreach (var muc in coLoi)
                {
                    await NhapDuLieu.InLoiAsync(muc, loi);
                }

                await loi.WriteLineAsync($"Không ghi {fileRa}.");
                return (int)MaThoat.FileCoLoi;
            }

            var tep = DungTep(cacMuc, thoiGian.GetUtcNow());
            var noiDung = GhiRaBoNho(tep);

            var thuMucRa = Path.GetDirectoryName(Path.GetFullPath(fileRa));
            if (!string.IsNullOrEmpty(thuMucRa))
            {
                Directory.CreateDirectory(thuMucRa);
            }

            await File.WriteAllBytesAsync(fileRa, noiDung, huy);

            foreach (var muc in cacMuc)
            {
                foreach (var dong in muc.TomTat())
                {
                    await ra.WriteLineAsync(dong);
                }
            }

            await ra.WriteLineAsync($"Đã ghi {fileRa}: {noiDung.Length:N0} byte.");
            return (int)MaThoat.ThanhCong;
        }
        catch (Exception e) when (e is InvalidDataException or FileNotFoundException or IOException or UnauthorizedAccessException)
        {
            await loi.WriteLineAsync(e.Message);
            return (int)MaThoat.SaiLenh;
        }
        finally
        {
            tam.Delete(recursive: true);
        }
    }

    /// <summary>Ghép kết quả kiểm của bốn file (thứ tự của <c>DocTatCa</c>: thủ tục, phân công, Trung tâm, trợ lý).</summary>
    private static TepDuLieuMau DungTep(List<MucNhap> cacMuc, DateTimeOffset bayGio)
    {
        var thuTuc = ((MucNhap<DuLieuThuTuc>)cacMuc[0]).DuLieu;
        var phanCong = ((MucNhap<DuLieuPhanCong>)cacMuc[1]).DuLieu;
        var trungTam = ((MucNhap<DuLieuTrungTam>)cacMuc[2]).DuLieu;
        var troLy = ((MucNhap<DuLieuTroLy>)cacMuc[3]).DuLieu;

        // Cắt tới giây: giá trị này là phiên bản dữ liệu và nằm trong file, không cần phần lẻ.
        var thoiDiem = new DateTimeOffset(bayGio.Ticks - (bayGio.Ticks % TimeSpan.TicksPerSecond), bayGio.Offset);
        var tep = new TepDuLieuMau { ThoiDiem = thoiDiem, GhiChu = GhiChuTep };
        tep.LinhVuc.AddRange(thuTuc.LinhVuc);
        tep.ThuTuc.AddRange(thuTuc.ThuTuc);
        tep.PhanCongLinhVuc.AddRange(phanCong.PhanCong);
        tep.NhanSu.AddRange(phanCong.NhanSu);
        trungTam.TrungTam.Id = TrungTamEntity.IdDuyNhat;
        tep.TrungTam = trungTam.TrungTam;
        tep.GioLamViec.AddRange(trungTam.GioLamViec);
        tep.LienKet.AddRange(trungTam.LienKet);
        tep.ODichVu.AddRange(trungTam.ODichVu);
        tep.CauHoiMau.AddRange(troLy.CauHoiMau);
        tep.ChuDeGoiY.AddRange(troLy.ChuDeGoiY);
        tep.TuDongNghia.AddRange(troLy.TuDongNghia);
        tep.VietTat.AddRange(troLy.VietTat);
        return tep;
    }

    /// <summary>Ghi vào bộ nhớ rồi đọc lại cho chắc file sẽ nạp được, trước khi đụng tới file đích.</summary>
    private static byte[] GhiRaBoNho(TepDuLieuMau tep)
    {
        using var bo = new MemoryStream();
        tep.Ghi(bo);
        var bytes = bo.ToArray();
        _ = TepDuLieuMau.Doc(new MemoryStream(bytes));
        return bytes;
    }
}
