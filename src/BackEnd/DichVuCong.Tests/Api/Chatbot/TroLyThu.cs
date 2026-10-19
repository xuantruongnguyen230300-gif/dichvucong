using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Bộ dữ liệu thử cho trợ lý (F06), dựng bằng C#: biến thể của <see cref="TepDuLieuMau.Nhung"/> (file mẫu nhúng, 408 thủ tục)
/// và <see cref="TaoLon"/> (khoảng 1.000 thủ tục). Mỗi hàm trả một bản <b>mới</b>, sửa thoải mái không ảnh hưởng bản dùng chung.
/// Dùng chung cho lớp con nguồn Mẫu và lớp con PostgreSQL của tester (F06 T17).
/// </summary>
public static class TroLyThu
{
    public const string DiaChiA = "Địa chỉ thử A";
    public const string DiaChiB = "Địa chỉ thử B";
    public const string ZaloThu = "https://zalo.me/thu-nghiem";
    public const string CauMauThem = "điều kiện tách thửa đất";
    public const string TraLoiMauThem = "Trả lời mẫu thử: điều kiện tách thửa đất.";

    /// <summary>Lĩnh vực thử có đúng 15 thủ tục (chủ đề thứ tự 7).</summary>
    public const string LinhVuc15 = "thu-15";

    /// <summary>Lĩnh vực thử không có thủ tục nào (chủ đề thứ tự 8).</summary>
    public const string LinhVuc0 = "thu-0";

    public const int ThuTuChuDe15 = 7;
    public const int ThuTuChuDe0 = 8;

    private static readonly Lazy<byte[]> GocJson = new(DocGoc);

    /// <summary>Bản sao mới của file mẫu nhúng, chưa sửa gì.</summary>
    public static TepDuLieuMau Nen() => TepDuLieuMau.Doc(new MemoryStream(GocJson.Value, writable: false));

    /// <summary>Hộ tịch quầy 3, Đất đai quầy 4 (phân công), một cán bộ ở quầy 4 (nhân sự).</summary>
    public static TepDuLieuMau CoPhanCong()
    {
        var tep = Nen();
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "ho-tich", TenLinhVuc = "Hộ tịch", Quay = 3, NoiTiepNhanChuyen = null });
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "dat-dai", TenLinhVuc = "Đất đai", Quay = 4, NoiTiepNhanChuyen = "Chi nhánh thử" });
        tep.NhanSu.Add(new NhanSu { ThuTu = 1, HoTen = "Nguyễn Văn Cường", XungHo = "ông", ChucVu = "Chuyên viên", Quay = 4, MoTa = "Phụ trách đất đai" });
        tep.NhanSu.Add(new NhanSu { ThuTu = 2, HoTen = "Trần Thị Nhung", XungHo = "bà", ChucVu = "Phó Giám đốc", Quay = 3, MoTa = null });

        return tep;
    }

    /// <summary>Có phân công cho Hộ tịch nhưng không có nhân sự quầy đó; Chứng thực chưa có dòng phân công.</summary>
    public static TepDuLieuMau CoPhanCongKhongNhanSu()
    {
        var tep = Nen();
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "ho-tich", TenLinhVuc = "Hộ tịch", Quay = 3, NoiTiepNhanChuyen = null });
        tep.PhanCongLinhVuc.Add(new PhanCongLinhVuc { LinhVucMa = "dat-dai", TenLinhVuc = "Đất đai", Quay = null, NoiTiepNhanChuyen = null });

        return tep;
    }

    /// <summary>Thêm câu hỏi mẫu <see cref="CauMauThem"/> kèm câu trả lời (tính lại liên kết cách hỏi bằng ghi rồi đọc lại).</summary>
    public static TepDuLieuMau CoCauMau()
    {
        var tep = Nen();
        var cau = new CauHoiMau { ThuTu = 100, CauHoi = CauMauThem, TraLoi = TraLoiMauThem, MaThuTuc = ["1.012784"] };
        cau.CachHoi.Add(new CauHoiMauCachHoi { ThuTu = 1, NoiDung = CauMauThem, NoiDungTimKiem = "dieu kien tach thua dat" });
        tep.CauHoiMau.Add(cau);

        return GhiRoiDoc(tep);
    }

    /// <summary>Thêm cách nói "giấy khai sinh" cho "khai sinh" (AC-15).</summary>
    public static TepDuLieuMau CoDongNghiaGiayKhaiSinh()
    {
        var tep = Nen();
        var khaiSinh = tep.TuDongNghia.Single(t => t.TuTimKiem == "khai sinh");
        khaiSinh.CachNoiKhac = [.. khaiSinh.CachNoiKhac, "giấy khai sinh"];

        return tep;
    }

    public static TepDuLieuMau DoiDiaChi(string diaChi)
    {
        var tep = Nen();
        tep.TrungTam!.DiaChi = diaChi;

        return tep;
    }

    public static TepDuLieuMau BoGioLamViec()
    {
        var tep = Nen();
        tep.GioLamViec.Clear();

        return tep;
    }

    public static TepDuLieuMau CoZaloOa()
    {
        var tep = Nen();
        tep.TrungTam!.ZaloOa = ZaloThu;

        return tep;
    }

    public static TepDuLieuMau CoBanDo(string banDo)
    {
        var tep = Nen();
        tep.TrungTam!.BanDo = banDo;

        return tep;
    }

    public static TepDuLieuMau BoLienKetCongDvc()
    {
        var tep = Nen();
        tep.LienKet.RemoveAll(l => l.Ten.Contains("Cổng Dịch vụ công Quốc gia", StringComparison.Ordinal));

        return tep;
    }

    /// <summary>Chưa có dòng Trung tâm, giờ làm việc, liên kết.</summary>
    public static TepDuLieuMau BoTrungTam()
    {
        var tep = Nen();
        tep.TrungTam = null;
        tep.GioLamViec.Clear();
        tep.LienKet.Clear();

        return GhiRoiDoc(tep);
    }

    /// <summary>Thêm hai chủ đề: lĩnh vực 15 thủ tục (thuộc cả hai cấp) và lĩnh vực không có thủ tục.</summary>
    public static TepDuLieuMau CoChuDeThu()
    {
        var tep = Nen();
        tep.LinhVuc.Add(new LinhVuc { Ma = LinhVuc15, Ten = "Lĩnh vực thử mười lăm", TenTimKiem = "linh vuc thu muoi lam" });
        tep.LinhVuc.Add(new LinhVuc { Ma = LinhVuc0, Ten = "Lĩnh vực thử trống", TenTimKiem = "linh vuc thu trong" });
        var thuTu = tep.ThuTuc.Max(t => t.ThuTu);
        for (var i = 1; i <= 15; i++)
        {
            tep.ThuTuc.Add(TaoThuTuc($"TH.{i:000}", ++thuTu, $"Hồ sơ thử số {i}", $"ho so thu so {i}", LinhVuc15, i % 2 == 0));
        }

        tep.ChuDeGoiY.Add(new ChuDeGoiY { ThuTu = ThuTuChuDe15, TenHienThi = "Thử mười lăm", TenLinhVuc = "Lĩnh vực thử mười lăm", LinhVucMa = LinhVuc15 });
        tep.ChuDeGoiY.Add(new ChuDeGoiY { ThuTu = ThuTuChuDe0, TenHienThi = "Thử trống", TenLinhVuc = "Lĩnh vực thử trống", LinhVucMa = LinhVuc0 });

        return GhiRoiDoc(tep);
    }

    public const string MaThuTucDai = "DAI.001";

    /// <summary>Thêm một thủ tục có nhiều giấy tờ, bước, kết quả, căn cứ hơn giới hạn của đáp án (12 giấy tờ, 4 bước, 9 kết quả, 9 căn cứ).</summary>
    public static TepDuLieuMau CoThuTucDai()
    {
        var tep = Nen();
        var dai = TaoThuTuc(MaThuTucDai, tep.ThuTuc.Max(t => t.ThuTu) + 1, "Thủ tục thử rất dài", "thu tuc thu rat dai", "ho-tich", caHaiCap: true);
        dai.ThoiHan = "3 ngày làm việc";
        dai.Phi = "Lệ phí 10.000 đồng";
        dai.HinhThucNop = ["Trực tuyến", "Trực tiếp"];
        dai.ThanhPhanHoSo = [.. Enumerable.Range(1, 12).Select(i => new GiayTo { Ten = $"Giấy tờ số {i}", BanChinh = i % 2, BanSao = null })];
        dai.TrinhTu =
        [
            new BuocTrinhTu { TruongHop = null, NoiDung = new string('a', 700) },
            new BuocTrinhTu { TruongHop = "Trường hợp hai", NoiDung = "Bước hai" },
            new BuocTrinhTu { TruongHop = null, NoiDung = "Bước ba" },
            new BuocTrinhTu { TruongHop = null, NoiDung = "Bước bốn" },
        ];
        dai.KetQua = [.. Enumerable.Range(1, 9).Select(i => $"Kết quả số {i}")];
        dai.CanCu = [.. Enumerable.Range(1, 9).Select(i => new VanBanCanCu { SoKyHieu = $"{i}/2026", TrichYeu = new string('b', 300) })];
        tep.ThuTuc.Add(dai);

        return GhiRoiDoc(tep);
    }

    /// <summary>Chỉ còn 5 chủ đề (AC-25).</summary>
    public static TepDuLieuMau BotMotChuDe()
    {
        var tep = Nen();
        tep.ChuDeGoiY.RemoveAt(tep.ChuDeGoiY.Count - 1);

        return tep;
    }

    /// <summary>
    /// File mẫu cộng thêm thủ tục cho đủ <paramref name="tongSo"/>. Tên ghép từ từ vựng thật của các tên thủ tục có sẵn,
    /// mã không trùng ("L.000001"…). Xác định (cùng đầu vào, cùng kết quả).
    /// </summary>
    public static TepDuLieuMau TaoLon(int tongSo)
    {
        var tep = Nen();
        var tuVung = tep.ThuTuc
            .SelectMany(t => t.TenTimKiem.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            .Distinct(StringComparer.Ordinal)
            .Order(StringComparer.Ordinal)
            .ToArray();
        var linhVuc = tep.LinhVuc.Select(l => l.Ma).Order(StringComparer.Ordinal).ToArray();
        var thuTu = tep.ThuTuc.Max(t => t.ThuTu);
        for (var i = 1; tep.ThuTuc.Count < tongSo; i++)
        {
            var soTu = 3 + (i % 5);
            var tu = Enumerable.Range(0, soTu).Select(j => tuVung[((i * 7919) + (j * 104729)) % tuVung.Length]);
            var ten = string.Join(' ', tu);
            tep.ThuTuc.Add(TaoThuTuc($"L.{i:000000}", ++thuTu, ten, ten, linhVuc[i % linhVuc.Length], i % 2 == 0));
        }

        return GhiRoiDoc(tep);
    }

    private static ThuTuc TaoThuTuc(string ma, int thuTu, string ten, string tenTimKiem, string linhVucMa, bool caHaiCap) => new()
    {
        Ma = ma,
        Ten = ten,
        TenTimKiem = tenTimKiem,
        LinhVucMa = linhVucMa,
        ThuocDanhMucXa = true,
        ThuocDanhMucTinh = caHaiCap,
        MucDo = MucDo.ToanTrinh,
        ThuTu = thuTu,
        HinhThucNop = ["Trực tuyến"],
    };

    private static TepDuLieuMau GhiRoiDoc(TepDuLieuMau tep)
    {
        using var boNho = new MemoryStream();
        tep.Ghi(boNho);
        boNho.Position = 0;

        return TepDuLieuMau.Doc(boNho);
    }

    private static byte[] DocGoc()
    {
        using var stream = typeof(TepDuLieuMau).Assembly.GetManifestResourceStream(TepDuLieuMau.TenTaiNguyen)
            ?? throw new InvalidOperationException("Thiếu tài nguyên nhúng du-lieu-mau.json.");
        using var boNho = new MemoryStream();
        stream.CopyTo(boNho);

        return boNho.ToArray();
    }
}
