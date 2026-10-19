using System.Globalization;
using System.Text.Json;
using DichVuCong.Data.Text;
using DichVuCong.Import.Excel;

namespace DichVuCong.DuLieuMau;

/// <summary>
/// Chuyển <c>data-mau/*.json</c> thành 4 file Excel đúng mẫu của công cụ nhập (dùng <see cref="MauExcel"/> và <see cref="GhiExcel"/>).
/// Không làm sạch chữ: giữ nguyên ký tự U+200E của nguồn để công cụ nhập làm sạch (BR-18, AC-16).
/// Quy tắc bản đầu: <c>.specify/nghiep-vu/du-lieu.md</c> mục "Bản đầu của dữ liệu thật".
/// </summary>
internal static class SinhFile
{
    private const string MaDonVi = "H53.183";
    private const string MaTachThua = "1.012784";

    /// <summary>16 thủ tục thường gặp, đúng thứ tự ở du-lieu.md (người dùng chốt 2026-10-12).</summary>
    private static readonly string[] ThuongGap =
    [
        "1.001193", "1.000894", "1.000656", "2.000815", "2.000884", "1.004873", "2.000635", "1.004837",
        "1.001022", "1.012812", "1.012784", "1.012783", "1.013992", "1.001776", "1.013314", "1.012753",
    ];

    // ----- thu-tuc.xlsx -----

    public static void ThuTuc(string nguon, string duongDanRa)
    {
        using var json = Doc(nguon, "thu-tuc.json");
        var danhSach = json.RootElement.EnumerateArray().ToList();
        var mau = MauExcel.ThuTuc;
        using var sach = GhiExcel.TaoMau(mau, dienSan: false);

        var thuTuc = GhiExcel.Bang(sach, mau[TenSheet.ThuTuc]);
        var trinhTu = GhiExcel.Bang(sach, mau[TenSheet.TrinhTu]);
        var cachThuc = GhiExcel.Bang(sach, mau[TenSheet.CachThuc]);
        var hoSo = GhiExcel.Bang(sach, mau[TenSheet.ThanhPhanHoSo]);
        var ketQua = GhiExcel.Bang(sach, mau[TenSheet.KetQua]);
        var canCu = GhiExcel.Bang(sach, mau[TenSheet.CanCu]);

        var soDong = new Dictionary<string, int>();
        foreach (var t in danhSach)
        {
            var ma = Chu(t, "ma") ?? throw new InvalidDataException("Thủ tục không có mã.");
            var danhMuc = t.GetProperty("danhMuc").EnumerateArray().Select(x => x.GetString()).ToList();
            var donVi = t.TryGetProperty("donVi", out var dv) && dv.ValueKind == JsonValueKind.Object ? dv : (JsonElement?)null;

            thuTuc.Them(
                (TenCot.MaThuTuc, ma),
                (TenCot.TenThuTuc, Chu(t, "ten")),
                (TenCot.LinhVuc, Chu(t, "linhVuc")),
                (TenCot.DanhMucXa, danhMuc.Contains("xa")),
                (TenCot.DanhMucTinh, danhMuc.Contains("tinh")),
                (TenCot.MucDo, Chu(t, "mucDo")),
                (TenCot.CoQuanThucHien, Chu(t, "coQuanThucHien")),
                (TenCot.YeuCauDieuKien, Chu(t, "yeuCauDieuKien")),
                (TenCot.TrangThaiCongBo, Chu(t, "trangThai")),
                (TenCot.ThoiHanGiaiQuyet, Chu(t, "thoiHan")),
                (TenCot.PhiLePhi, Chu(t, "phi")),
                (TenCot.HinhThucNop, string.Join("; ", t.GetProperty("hinhThucNop").EnumerateArray().Select(x => x.GetString()))),
                (TenCot.MaDvc, Chu(t, "maDvc")),
                (TenCot.TenDonViDvc, donVi is null ? null : Chu(donVi.Value, "ten")),
                (TenCot.MaDonViDvc, donVi is null ? null : Chu(donVi.Value, "ma")));

            foreach (var b in t.GetProperty("trinhTu").EnumerateArray())
            {
                if (Chu(b, "moTa") is { } noiDung)
                {
                    trinhTu.Them((TenCot.MaThuTuc, ma), (TenCot.TruongHop, Chu(b, "truongHop")), (TenCot.NoiDung, noiDung));
                }
            }

            foreach (var c in t.GetProperty("cachThuc").EnumerateArray())
            {
                string?[] giaTri = [Chu(c, "hinhThuc"), Chu(c, "thoiGian"), Chu(c, "phi"), Chu(c, "moTa")];
                if (giaTri.Any(g => g is not null))
                {
                    cachThuc.Them(
                        (TenCot.MaThuTuc, ma),
                        (TenCot.HinhThucNop, giaTri[0]),
                        (TenCot.ThoiHan, giaTri[1]),
                        (TenCot.PhiLePhi, giaTri[2]),
                        (TenCot.MoTa, giaTri[3]));
                }
            }

            foreach (var g in t.GetProperty("thanhPhanHoSo").EnumerateArray())
            {
                if (Chu(g, "ten") is { } ten)
                {
                    // Nguồn ghi số bản dạng chuỗi "0", "1", "2"; cả hai "0" nghĩa là chưa ghi — công cụ nhập sẽ lưu null.
                    hoSo.Them((TenCot.MaThuTuc, ma), (TenCot.TenGiayTo, ten), (TenCot.SoBanChinh, SoNguyen(g, "banChinh")), (TenCot.SoBanSao, SoNguyen(g, "banSao")));
                }
            }

            foreach (var k in t.GetProperty("ketQua").EnumerateArray())
            {
                if (Chu(k, "ten") is { } ten)
                {
                    ketQua.Them((TenCot.MaThuTuc, ma), (TenCot.TenKetQua, ten));
                }
            }

            foreach (var c in t.GetProperty("canCu").EnumerateArray())
            {
                // Không lấy url, ngayHieuLuc (BR-16, quyết định 2026-10-09).
                var (so, trich) = (Chu(c, "soKyHieu"), Chu(c, "trichYeu"));
                if (so is not null || trich is not null)
                {
                    canCu.Them((TenCot.MaThuTuc, ma), (TenCot.SoKyHieu, so), (TenCot.TrichYeu, trich));
                }
            }

            soDong[ma] = soDong.Count + 2;
        }

        // Thường gặp: thiếu mã nào trong nguồn thì dừng, không bỏ qua lặng lẽ.
        var thuongGap = GhiExcel.Bang(sach, mau[TenSheet.ThuongGap]);
        for (var i = 0; i < ThuongGap.Length; i++)
        {
            if (!soDong.ContainsKey(ThuongGap[i]))
            {
                throw new InvalidDataException($"Thủ tục thường gặp {ThuongGap[i]} không có trong thu-tuc.json.");
            }

            thuongGap.Them((TenCot.MaThuTuc, ThuongGap[i]), (TenCot.ThuTu, i + 1));
        }

        GhiExcel.LuuDe(sach, duongDanRa);
        Console.WriteLine($"thu-tuc.xlsx: {danhSach.Count} thủ tục, {ThuongGap.Length} thường gặp");
    }

    // ----- phan-cong.xlsx -----

    /// <summary>Hai sheet chỉ có dòng tiêu đề (BR-9): không nhập phân công, nhân sự của Vàm Cỏ.</summary>
    public static void PhanCong(string duongDanRa)
    {
        using var sach = GhiExcel.TaoMau(MauExcel.PhanCong, dienSan: false);
        GhiExcel.LuuDe(sach, duongDanRa);
        Console.WriteLine("phan-cong.xlsx: chỉ có dòng tiêu đề");
    }

    // ----- trung-tam.xlsx -----

    public static void TrungTam(string nguon, string duongDanRa, string? nguoiChiuTrachNhiem)
    {
        using var tt = Doc(nguon, "trung-tam.json");
        using var o = Doc(nguon, "o-dich-vu.json");
        var goc = tt.RootElement;
        var mau = MauExcel.TrungTam;
        using var sach = GhiExcel.TaoMau(mau, dienSan: false);

        var website = Chu(goc, "website") ?? throw new InvalidDataException("trung-tam.json thiếu website.");

        var muc = GhiExcel.Bang(sach, mau[TenSheet.TrungTam]);
        void Muc(string ten, string? giaTri) => muc.Them((TenCot.Muc, ten), (TenCot.GiaTri, giaTri));

        Muc(MauExcel.MucTenDonVi, Chu(goc, "ten"));
        Muc(MauExcel.MucNguoiChiuTrachNhiem, string.IsNullOrWhiteSpace(nguoiChiuTrachNhiem) ? null : nguoiChiuTrachNhiem.Trim());
        Muc(MauExcel.MucChucVuNguoiChiuTrachNhiem, "Giám đốc");
        Muc(MauExcel.MucCoQuanChuQuan, "UBND xã Cần Giuộc");
        Muc(MauExcel.MucDiaChi, Chu(goc, "diaChi"));
        Muc(MauExcel.MucDienThoai, Chu(goc, "dienThoai"));
        Muc(MauExcel.MucEmail, Chu(goc, "email"));
        Muc(MauExcel.MucXa, "xã " + Chu(goc, "xa"));
        Muc(MauExcel.MucTinh, "tỉnh " + Chu(goc, "tinh"));
        Muc(MauExcel.MucMaDonVi, MaDonVi);
        // Bản đồ, mạng xã hội, ghi chú ngày nghỉ: chưa được chốt (du-lieu.md) nên để trống.
        Muc(MauExcel.MucBanDo, null);
        Muc(MauExcel.MucZalo, null);
        Muc(MauExcel.MucFacebook, null);
        Muc(MauExcel.MucYouTube, null);
        Muc(MauExcel.MucTikTok, null);
        Muc(MauExcel.MucGhiChuNgayNghi, null);

        // Giờ làm việc tạm theo Cần Đước (câu hỏi mở 13), lấy từ trung-tam.json.
        var gio = goc.GetProperty("gioLamViec");
        var (sangTu, sangDen) = KhoangGio(Chu(gio, "sang"));
        var (chieuTu, chieuDen) = KhoangGio(Chu(gio, "chieu"));
        var bangGio = GhiExcel.Bang(sach, mau[TenSheet.GioLamViec]);
        for (var i = 0; i < MauExcel.TenThu.Count; i++)
        {
            var ngayLam = i < 5;
            bangGio.Them(
                (TenCot.Thu, MauExcel.TenThu[i]),
                (TenCot.SangTu, ngayLam ? sangTu : null),
                (TenCot.SangDen, ngayLam ? sangDen : null),
                (TenCot.ChieuTu, ngayLam ? chieuTu : null),
                (TenCot.ChieuDen, ngayLam ? chieuDen : null));
        }

        // Liên kết chân trang theo lien-ket.md §1.
        var lienKet = GhiExcel.Bang(sach, mau[TenSheet.LienKet]);
        lienKet.Them((TenCot.Ten, MauExcel.CongDvcQuocGia), (TenCot.DiaChiWeb, "https://dichvucong.gov.vn"));
        lienKet.Them((TenCot.Ten, "Cổng thông tin điện tử xã Cần Giuộc"), (TenCot.DiaChiWeb, website));
        lienKet.Them((TenCot.Ten, "Cổng thông tin điện tử tỉnh Tây Ninh"), (TenCot.DiaChiWeb, "https://tayninh.gov.vn"));

        // 6 ô dịch vụ theo o-dich-vu.json (hai ô đầu chưa có link), biểu tượng theo thứ tự.
        var oDichVu = GhiExcel.Bang(sach, mau[TenSheet.ODichVu]);
        var oDanhSach = o.RootElement.EnumerateArray().ToList();
        string[] bieuTuong = ["boc-so", "danh-gia", "tra-cuu-ho-so", "thanh-toan", "cong-dvc", "cong-thong-tin"];
        if (oDanhSach.Count != bieuTuong.Length)
        {
            throw new InvalidDataException($"o-dich-vu.json có {oDanhSach.Count} ô, cần {bieuTuong.Length}.");
        }

        for (var i = 0; i < oDanhSach.Count; i++)
        {
            oDichVu.Them((TenCot.Ten, Chu(oDanhSach[i], "ten")), (TenCot.BieuTuong, bieuTuong[i]), (TenCot.DiaChiWeb, Chu(oDanhSach[i], "url")));
        }

        GhiExcel.LuuDe(sach, duongDanRa);
        Console.WriteLine("trung-tam.xlsx: 16 mục, 7 dòng giờ làm việc, 3 liên kết, 6 ô dịch vụ");
    }

    // ----- tro-ly.xlsx -----

    public static void TroLy(string nguon, string duongDanRa)
    {
        using var troLy = Doc(nguon, "tro-ly.json");
        using var tachThua = Doc(nguon, "qd-tach-thua.json");
        var mau = MauExcel.TroLy;
        using var sach = GhiExcel.TaoMau(mau, dienSan: false);

        var cau = GhiExcel.Bang(sach, mau[TenSheet.CauHoiMau]);
        var soTachThua = 0;
        foreach (var (hoi, cachHoi, traLoi) in CauTachThua.Tao(tachThua.RootElement))
        {
            cau.Them((TenCot.CauHoi, hoi), (TenCot.CachHoiKhac, string.Join("; ", cachHoi)), (TenCot.CauTraLoi, traLoi), (TenCot.MaThuTucLienQuan, MaTachThua));
            soTachThua++;
        }

        // Nhóm câu hỏi về Trung tâm (câu hỏi mở 9): trả lời bằng giá trị Trung tâm đọc lúc hỏi, nên chỉ ghi mục.
        (string Hoi, string[] CachHoi, string Muc)[] veTrungTam =
        [
            ("Trung tâm ở đâu?", ["trung tâm ở đâu", "địa chỉ trung tâm", "trung tâm nằm ở đâu", "văn phòng nằm chỗ nào"], "Địa chỉ"),
            ("Trung tâm làm việc mấy giờ?", ["mấy giờ làm việc", "giờ làm việc của trung tâm", "giờ mở cửa"], "Giờ làm việc"),
            ("Số điện thoại của Trung tâm là gì?", ["số điện thoại trung tâm", "liên hệ trung tâm qua điện thoại", "số hotline"], "Điện thoại"),
            ("Email của Trung tâm là gì?", ["email trung tâm", "địa chỉ email của trung tâm", "gửi thư điện tử cho trung tâm"], "Email"),
            ("Nộp hồ sơ trực tuyến ở đâu?", ["nộp online ở đâu", "nộp qua mạng", "nộp hồ sơ qua mạng ở đâu"], "Nộp trực tuyến"),
        ];
        foreach (var (hoi, cachHoi, muc) in veTrungTam)
        {
            cau.Them((TenCot.CauHoi, hoi), (TenCot.CachHoiKhac, string.Join("; ", cachHoi)), (TenCot.MucThongTinTrungTam, muc));
        }

        var chuDe = GhiExcel.Bang(sach, mau[TenSheet.ChuDeGoiY]);
        var dsChuDe = troLy.RootElement.GetProperty("chuDeGoiY").EnumerateArray().ToList();
        foreach (var c in dsChuDe)
        {
            chuDe.Them((TenCot.TenHienThi, Chu(c, "tenHienThi")), (TenCot.LinhVuc, Chu(c, "linhVuc")));
        }

        var dongNghia = GhiExcel.Bang(sach, mau[TenSheet.TuDongNghia]);
        var dsDongNghia = troLy.RootElement.GetProperty("tuDongNghia").EnumerateArray().ToList();
        foreach (var d in dsDongNghia)
        {
            dongNghia.Them(
                (TenCot.Tu, Chu(d, "tu")),
                (TenCot.CachNoiKhac, string.Join("; ", d.GetProperty("cachNoiKhac").EnumerateArray().Select(x => x.GetString()))));
        }

        // Viết tắt: từ SPEECH_ABBR của Vàm Cỏ; thêm CCCD và "đk" nếu thiếu (du-lieu.md).
        var vietTat = GhiExcel.Bang(sach, mau[TenSheet.VietTat]);
        var daCo = new HashSet<string>(StringComparer.Ordinal);
        var soVietTat = 0;
        void ThemVietTat(string chu, string dayDu)
        {
            if (daCo.Add(TiengViet.ChuanHoaTimKiem(chu)))
            {
                vietTat.Them((TenCot.VietTat, chu), (TenCot.DayDu, dayDu));
                soVietTat++;
            }
        }

        foreach (var v in troLy.RootElement.GetProperty("vietTat").EnumerateArray())
        {
            ThemVietTat(Chu(v, "chuVietTat")!, Chu(v, "dayDu")!);
        }

        ThemVietTat("CCCD", "căn cước công dân");
        ThemVietTat("đk", "đăng ký");

        GhiExcel.LuuDe(sach, duongDanRa);
        Console.WriteLine(
            $"tro-ly.xlsx: {soTachThua + veTrungTam.Length} câu hỏi mẫu ({soTachThua} tách thửa + {veTrungTam.Length} về Trung tâm), "
            + $"{dsChuDe.Count} chủ đề, {dsDongNghia.Count} từ đồng nghĩa, {soVietTat} viết tắt");
    }

    // ----- hàm dùng chung -----

    private static JsonDocument Doc(string thuMuc, string tenFile)
    {
        var duongDan = Path.Combine(thuMuc, tenFile);
        if (!File.Exists(duongDan))
        {
            throw new FileNotFoundException($"Không tìm thấy {duongDan}.");
        }

        return JsonDocument.Parse(File.ReadAllBytes(duongDan));
    }

    /// <summary>Chuỗi của thuộc tính; null nếu thiếu, null hoặc rỗng.</summary>
    private static string? Chu(JsonElement e, string ten)
    {
        if (!e.TryGetProperty(ten, out var v) || v.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        var s = v.GetString();
        return string.IsNullOrWhiteSpace(s) ? null : s;
    }

    private static int? SoNguyen(JsonElement e, string ten)
        => int.TryParse(Chu(e, ten), NumberStyles.None, CultureInfo.InvariantCulture, out var v) ? v : null;

    /// <summary>"07:00-11:30" → ("07:00", "11:30").</summary>
    private static (string Tu, string Den) KhoangGio(string? khoang)
    {
        var phan = khoang?.Split('-', StringSplitOptions.TrimEntries);
        return phan is { Length: 2 }
            ? (phan[0], phan[1])
            : throw new InvalidDataException($"Khoảng giờ không đúng dạng HH:mm-HH:mm: \"{khoang}\".");
    }
}
