namespace DichVuCong.DuLieuMau;

/// <summary>Tách tham số dòng lệnh dùng chung cho lệnh xuất Excel và lệnh <c>xuat-json</c>, và bước sinh 4 file Excel.</summary>
internal static class ThamSoDongLenh
{
    public const string CoNguoiChiuTrachNhiem = "--nguoi-chiu-trach-nhiem";

    internal sealed record KetQuaTach(string? NguoiChiuTrachNhiem, List<string> ViTri, string? Loi);

    public static KetQuaTach Tach(IReadOnlyList<string> args)
    {
        string? nguoiChiuTrachNhiem = null;
        var viTri = new List<string>();
        for (var i = 0; i < args.Count; i++)
        {
            if (args[i] == CoNguoiChiuTrachNhiem)
            {
                if (i + 1 >= args.Count)
                {
                    return new KetQuaTach(null, viTri, $"Thiếu giá trị sau {CoNguoiChiuTrachNhiem}.");
                }

                nguoiChiuTrachNhiem = args[++i];
            }
            else
            {
                viTri.Add(args[i]);
            }
        }

        return new KetQuaTach(nguoiChiuTrachNhiem, viTri, null);
    }

    /// <summary>Sinh 4 file Excel đúng mẫu vào <paramref name="thuMucRa"/> (tạo nếu chưa có).</summary>
    public static void SinhExcel(string nguon, string thuMucRa, string? nguoiChiuTrachNhiem)
    {
        Directory.CreateDirectory(thuMucRa);
        SinhFile.ThuTuc(nguon, Path.Combine(thuMucRa, "thu-tuc.xlsx"));
        SinhFile.PhanCong(Path.Combine(thuMucRa, "phan-cong.xlsx"));
        SinhFile.TrungTam(nguon, Path.Combine(thuMucRa, "trung-tam.xlsx"), nguoiChiuTrachNhiem);
        SinhFile.TroLy(nguon, Path.Combine(thuMucRa, "tro-ly.xlsx"));
    }
}
