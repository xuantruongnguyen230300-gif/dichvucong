using System.Text;
using DichVuCong.DuLieuMau;

// Sinh bản đầu của dữ liệu thật: data-mau/*.json (dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc) → 4 file Excel đúng mẫu.
//   dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- <thư-mục-nguồn> <thư-mục-ra> [--nguoi-chiu-trach-nhiem "<họ tên>"]
// Sinh file dữ liệu mẫu nhúng vào DichVuCong.Data (plan F00 §9.5):
//   dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- xuat-json <thư-mục-nguồn> <file-ra> --nguoi-chiu-trach-nhiem "<nhãn>"
// Công cụ dành cho lập trình viên nên câu chữ in ra để thẳng trong mã (CLAUDE.md: i18n không áp cho thông báo của lập trình viên).
internal static class ChuongTrinhDuLieuMau
{
    internal static async Task<int> Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;

        if (args.Length > 0 && args[0] == XuatJson.TenLenh)
        {
            return await XuatJson.ChayAsync(args[1..], TimeProvider.System, Console.Out, Console.Error, CancellationToken.None);
        }

        var tach = ThamSoDongLenh.Tach(args);
        if (tach.Loi is not null)
        {
            return Loi(tach.Loi);
        }

        if (tach.ViTri.Count != 2)
        {
            Console.Error.WriteLine($"Cách dùng: DichVuCong.DuLieuMau <thư-mục-nguồn> <thư-mục-ra> [{ThamSoDongLenh.CoNguoiChiuTrachNhiem} \"<họ tên>\"]");
            Console.Error.WriteLine($"           DichVuCong.DuLieuMau {XuatJson.TenLenh} <thư-mục-nguồn> <file-ra> {ThamSoDongLenh.CoNguoiChiuTrachNhiem} \"<nhãn>\"");
            return 2;
        }

        var (nguon, ra) = (tach.ViTri[0], tach.ViTri[1]);
        if (!Directory.Exists(nguon))
        {
            return Loi($"Không tìm thấy thư mục nguồn: {nguon}");
        }

        try
        {
            ThamSoDongLenh.SinhExcel(nguon, ra, tach.NguoiChiuTrachNhiem);
        }
        catch (Exception e) when (e is InvalidDataException or FileNotFoundException or IOException)
        {
            return Loi(e.Message);
        }

        if (string.IsNullOrWhiteSpace(tach.NguoiChiuTrachNhiem))
        {
            Console.WriteLine($"Chưa có {ThamSoDongLenh.CoNguoiChiuTrachNhiem}: ô \"Người chịu trách nhiệm\" để trống, lệnh nhập sẽ từ chối cho tới khi điền.");
        }

        return 0;
    }

    private static int Loi(string thongBao)
    {
        Console.Error.WriteLine(thongBao);
        return 2;
    }
}
