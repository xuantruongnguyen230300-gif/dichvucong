using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Biến thể dữ liệu thử của <see cref="TroLyThu"/> (cột "Dữ liệu" trong bộ thử ở plan F06 §9).</summary>
public enum DuLieuThu
{
    Nen,
    PhanCong,
    CauMau,
    DongNghia,
    DiaChiA,
    BoGio,
    Zalo,
    ChuDeThu,
}

/// <summary>
/// Một dòng của bảng câu hỏi → loại trả lời / thủ tục mong đợi. <see cref="Ma"/>: mã thủ tục trả lời (<c>thuTuc.ma</c>) hoặc thủ tục
/// đầu danh sách. <see cref="TuDangNoi"/>: <c>thuTucDangNoi</c> mong đợi (null: không kiểm). Mỗi lần sửa một câu trả lời sai
/// thì thêm một dòng vào <see cref="TroLyBang.Cac"/>.
/// </summary>
public sealed record CaTroLy(
    string Ten, DuLieuThu Du, string Hoi, string? NguCanh, string Loai, string? Muc = null, string? Ma = null, string? TuDangNoi = null)
{
    public override string ToString() => Ten;
}

/// <summary>Bảng bộ thử (plan F06 §9, 42 câu; câu 42 là HTTP nên ở <c>TroLyTests</c>) và các ca bổ sung của T07.</summary>
public static class TroLyBang
{
    public static readonly IReadOnlyList<CaTroLy> Cac =
    [
        new("01 giấy khai sinh cần giấy tờ", DuLieuThu.Nen, "làm giấy khai sinh cần giấy tờ gì", null, "thu-tuc", "ho-so", "1.001193", "1.001193"),
        new("02 mấy ngày có ngữ cảnh", DuLieuThu.Nen, "mấy ngày", "1.001193", "thu-tuc", "thoi-han", "1.001193", "1.001193"),
        new("03 mấy ngày không ngữ cảnh", DuLieuThu.Nen, "mấy ngày", null, "khong-hieu", TuDangNoi: null),
        new("04 hộ tịch nộp quầy mấy có phân công", DuLieuThu.PhanCong, "hộ tịch nộp quầy mấy", null, "quay", "quay"),
        new("05 hộ tịch nộp quầy mấy chưa phân công", DuLieuThu.Nen, "hộ tịch nộp quầy mấy", null, "quay", "quay"),
        new("06 chứng thực nộp quầy mấy", DuLieuThu.PhanCong, "chứng thực nộp quầy mấy", null, "quay", "quay"),
        new("07 giá vàng hôm nay", DuLieuThu.Nen, "giá vàng hôm nay", null, "khong-hieu"),
        new("08 khai sjnh", DuLieuThu.Nen, "khai sjnh", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        new("09 khai sinh", DuLieuThu.Nen, "khai sinh", null, "thu-tuc-danh-sach", Ma: "1.001193", TuDangNoi: "1.001193"),
        new("10 kết hôn", DuLieuThu.Nen, "kết hôn", null, "thu-tuc-danh-sach", Ma: "1.000894", TuDangNoi: "1.000894"),
        new("11 cần giấy tờ gì sau kết hôn", DuLieuThu.Nen, "cần giấy tờ gì", "1.000894", "thu-tuc", "ho-so", "1.000894", "1.000894"),
        new("12 điều kiện tách thửa là câu mẫu", DuLieuThu.CauMau, "dieu kien tach thua", null, "cau-hoi-mau"),
        new("13 xin giấy khai sinh", DuLieuThu.DongNghia, "xin giấy khai sinh", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        new("14 đk kết hôn cần gì", DuLieuThu.Nen, "đk kết hôn cần gì", null, "thu-tuc", "ho-so", "1.000894"),
        new("15 cưới vợ", DuLieuThu.Nen, "cưới vợ", null, "thu-tuc-danh-sach", Ma: "1.000894"),
        new("16 ai phụ trách đất đai có nhân sự", DuLieuThu.PhanCong, "ai phụ trách đất đai", null, "quay", "can-bo"),
        new("17 ai phụ trách đất đai chưa có dữ liệu", DuLieuThu.Nen, "ai phụ trách đất đai", null, "quay", "can-bo"),
        new("18 khai sinh nộp ở đâu chưa phân công", DuLieuThu.Nen, "đăng ký khai sinh nộp ở đâu", null, "thu-tuc", "noi-nop", "1.001193"),
        new("19 khai sinh nộp ở đâu có phân công", DuLieuThu.PhanCong, "đăng ký khai sinh nộp ở đâu", null, "thu-tuc", "noi-nop", "1.001193"),
        new("20 nộp hồ sơ trực tuyến ở đâu", DuLieuThu.Nen, "nộp hồ sơ trực tuyến ở đâu", null, "trung-tam", "nop-truc-tuyen"),
        new("21 nộp trực tuyến ở đâu có ngữ cảnh", DuLieuThu.Nen, "nộp hồ sơ trực tuyến ở đâu", "1.001193", "thu-tuc", "noi-nop", "1.001193"),
        new("22 trung tâm ở đâu", DuLieuThu.Nen, "trung tâm ở đâu", null, "trung-tam", "dia-chi"),
        new("23 địa chỉ đã đổi", DuLieuThu.DiaChiA, "trung tâm ở đâu", null, "trung-tam", "dia-chi"),
        new("24 văn phòng nằm chỗ nào", DuLieuThu.Nen, "van phong nam cho nao", null, "trung-tam", "dia-chi"),
        new("25 mấy giờ làm việc", DuLieuThu.Nen, "mấy giờ làm việc", null, "trung-tam", "gio-lam-viec"),
        new("26 giờ làm việc chưa có", DuLieuThu.BoGio, "giờ làm việc", null, "trung-tam", "gio-lam-viec"),
        new("27 số điện thoại trung tâm", DuLieuThu.Nen, "số điện thoại trung tâm", null, "trung-tam", "dien-thoai"),
        new("28 email trung tâm", DuLieuThu.Nen, "email trung tâm", null, "trung-tam", "email"),
        new("29 số điện thoại cá nhân", DuLieuThu.Nen, "số 0912345678 của tôi nộp hồ sơ chưa", null, "khong-hieu"),
        new("30 CCCD và email", DuLieuThu.Nen, "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu", null, "khong-hieu"),
        new("31 giá vàng hôm nay lần nữa", DuLieuThu.Nen, "giá vàng hôm nay", null, "khong-hieu"),
        new("32 xem bói", DuLieuThu.Nen, "xem bói", null, "khong-hieu"),
        new("33 giá vàng có Zalo", DuLieuThu.Zalo, "giá vàng hôm nay", null, "khong-hieu"),
        new("37 mã thủ tục trong câu", DuLieuThu.Nen, "1.001193 mấy ngày", null, "thu-tuc", "thoi-han", "1.001193", "1.001193"),
        new("38 ngữ cảnh không tồn tại", DuLieuThu.Nen, "mấy ngày", "9.999999", "khong-hieu", TuDangNoi: null),
        new("39 từ đệm lời dẫn", DuLieuThu.Nen, "cho tôi hỏi làm giấy khai sinh cần giấy tờ gì ạ", null, "thu-tuc", "ho-so", "1.001193", "1.001193"),
        new("40 tách thửa cần giấy tờ không bị câu mẫu chiếm", DuLieuThu.Nen, "tách thửa cần giấy tờ gì", null, "thu-tuc", "ho-so", "1.012784"),
        new("40b tách thửa cần giấy tờ với câu mẫu thêm", DuLieuThu.CauMau, "tách thửa cần giấy tờ gì", null, "thu-tuc", "ho-so", "1.012784"),
        new("41 ký tự vô hình giữa chữ", DuLieuThu.Nen, "Trung t" + (char)0x200E + "âm ở đâu?", null, "trung-tam", "dia-chi"),
        // Ngoài bảng plan §9 (T07): lỗi gõ, từ đệm, câu ngắn, mã, viết tắt, ký tự vô hình, lời chào. Mỗi lần sửa một câu trả lời sai thì thêm một dòng ở đây.
        new("43 lỗi gõ đảo chữ", DuLieuThu.Nen, "khia sinh", null, "thu-tuc-danh-sach", Ma: "1.001193", TuDangNoi: "1.001193"),
        new("44 dính liền không dấu cách (không hỗ trợ)", DuLieuThu.Nen, "khaisinh", null, "khong-hieu"),
        new("45 từ đệm lẫn trong câu", DuLieuThu.Nen, "cho mình hỏi với khai sinh nha", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        new("46 câu hai thủ tục (không tách đôi)", DuLieuThu.Nen, "khai sinh và kết hôn", null, "thu-tuc-danh-sach"),
        new("47 câu rất ngắn", DuLieuThu.Nen, "kết", null, "thu-tuc-danh-sach", Ma: "1.000894"),
        new("48 mã thủ tục viết hoa", DuLieuThu.Nen, "1.001193 PHÍ", null, "thu-tuc", "phi", "1.001193", "1.001193"),
        new("49 mã thủ tục lẫn trong câu", DuLieuThu.Nen, "xem phí của 1.001193 nhé", null, "thu-tuc", "phi", "1.001193"),
        new("50 TTHC trong câu", DuLieuThu.Nen, "TTHC khai sinh cần gì", null, "thu-tuc", "ho-so", "1.001193"),
        new("51 ký tự vô hình giữa chữ", DuLieuThu.Nen, "kh" + (char)0x200E + "ai sinh", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        new("52 mất bao lâu", DuLieuThu.Nen, "đăng ký kết hôn mất bao lâu", null, "thu-tuc", "thoi-han", "1.000894"),
        new("53 lời chào coi như không hiểu", DuLieuThu.Nen, "xin chào", null, "khong-hieu"),
        new("54 chỉ nêu mục hồ sơ, chưa có thủ tục", DuLieuThu.Nen, "hồ sơ", null, "khong-hieu"),
        new("55 ngữ cảnh rồi hỏi phí", DuLieuThu.Nen, "phí bao nhiêu", "1.001193", "thu-tuc", "phi", "1.001193", "1.001193"),
        new("56 hỏi tình trạng hồ sơ cá nhân", DuLieuThu.Nen, "hồ sơ của tôi xong chưa", null, "khong-hieu"),
        new("57 tách thửa đất ngắn không phải câu mẫu", DuLieuThu.CauMau, "tach thua dat", null, "thu-tuc-danh-sach", Ma: "1.012784"),
        new("58 mấy ngày ngay sau khi hỏi nơi nộp", DuLieuThu.Nen, "mấy ngày", "1.000894", "thu-tuc", "thoi-han", "1.000894", "1.000894"),
        // F06 G2: số/ngày/năm không được tính như từ khoá khi chấm thủ tục (không khớp số hiệu văn bản trong tên thủ tục).
        new("59 xem bói kèm ngày tháng năm", DuLieuThu.Nen, "xem bói 12 05 2026", null, "khong-hieu", TuDangNoi: null),
        new("60 thời tiết kèm ngày tháng năm", DuLieuThu.Nen, "thời tiết ngày 12 05 2026", null, "khong-hieu", TuDangNoi: null),
        new("61 khai sinh kèm năm vẫn ra thủ tục", DuLieuThu.Nen, "khai sinh 2026", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        // F06: sửa lỗi gõ không được biến câu ngoài phạm vi thành thủ tục ("vàng" → "đang"/"vùng"/"văn").
        new("62 giá vàng đứng một mình", DuLieuThu.Nen, "giá vàng", null, "khong-hieu", TuDangNoi: null),
        new("63 giá vàng hôm nay không bị sửa lỗi gõ", DuLieuThu.Nen, "giá vàng hôm nay", null, "khong-hieu", TuDangNoi: null),
        new("64 thời tiết", DuLieuThu.Nen, "thời tiết", null, "khong-hieu", TuDangNoi: null),
        new("65 xem bói đứng một mình", DuLieuThu.Nen, "xem bói", null, "khong-hieu", TuDangNoi: null),
        new("66 khai sjnh vẫn ra khai sinh", DuLieuThu.Nen, "khai sjnh", null, "thu-tuc-danh-sach", Ma: "1.001193", TuDangNoi: "1.001193"),
        new("67 khai sjnh cần gì", DuLieuThu.Nen, "khai sjnh cần gì", null, "thu-tuc", "ho-so", "1.001193"),
        new("68 dang ky khai sjnh", DuLieuThu.Nen, "dang ky khai sjnh", null, "thu-tuc-danh-sach", Ma: "1.001193"),
        new("69 khia sinh", DuLieuThu.Nen, "khia sinh", null, "thu-tuc-danh-sach", Ma: "1.001193"),
    ];

    public static CaTroLy Lay(int viTri) => Cac[viTri];

    public static TepDuLieuMau TaoDuLieu(DuLieuThu du) => du switch
    {
        DuLieuThu.Nen => TroLyThu.Nen(),
        DuLieuThu.PhanCong => TroLyThu.CoPhanCong(),
        DuLieuThu.CauMau => TroLyThu.CoCauMau(),
        DuLieuThu.DongNghia => TroLyThu.CoDongNghiaGiayKhaiSinh(),
        DuLieuThu.DiaChiA => TroLyThu.DoiDiaChi(TroLyThu.DiaChiA),
        DuLieuThu.BoGio => TroLyThu.BoGioLamViec(),
        DuLieuThu.Zalo => TroLyThu.CoZaloOa(),
        DuLieuThu.ChuDeThu => TroLyThu.CoChuDeThu(),
        _ => throw new ArgumentOutOfRangeException(nameof(du), du, null),
    };
}

/// <summary>
/// Test hợp đồng của trợ lý (plan F00 §9.4 R7, §9.10): cùng một bộ câu hỏi chạy trên mọi nguồn dữ liệu và phải cho cùng kết quả.
/// Lớp con chỉ nói cách dựng <see cref="INguonDuLieu"/> từ một <see cref="TepDuLieuMau"/>.
/// </summary>
public abstract class TroLyServiceContract
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected abstract INguonDuLieu TaoNguon(TepDuLieuMau tep);

    internal TroLyHarness Dung(DuLieuThu du) => TroLyHarness.Dung(TaoNguon(TroLyBang.TaoDuLieu(du)));

    public static TheoryData<int> CacCa()
    {
        var ds = new TheoryData<int>();
        for (var i = 0; i < TroLyBang.Cac.Count; i++)
        {
            ds.Add(i);
        }

        return ds;
    }

    [Theory]
    [MemberData(nameof(CacCa))]
    public async Task BoThu_TraDungLoaiMucVaThuTuc(int viTri)
    {
        var ca = TroLyBang.Lay(viTri);
        using var h = Dung(ca.Du);

        var cau = await h.HoiAsync(ca.Hoi, ca.NguCanh);

        Assert.True(ca.Loai == cau.Loai, $"{ca.Ten}: mong đợi loại {ca.Loai} nhưng được {cau.Loai} (muc {cau.Muc}, thuTuc {cau.ThuTuc?.Ma}, ds {string.Join(",", cau.DanhSachThuTuc?.Select(t => t.Ma) ?? [])}).");
        if (ca.Muc is not null)
        {
            Assert.Equal(ca.Muc, cau.Muc);
        }

        if (ca.Ma is not null)
        {
            Assert.Equal(ca.Ma, cau.ThuTuc?.Ma ?? cau.DanhSachThuTuc?.FirstOrDefault()?.Ma);
        }

        if (ca.TuDangNoi is not null || ca.Loai == "khong-hieu")
        {
            Assert.Equal(ca.TuDangNoi, cau.ThuTucDangNoi);
        }
    }

    [Fact]
    public async Task ChuDe_ChanNuoiKhongLanNuoiConNuoi_XayDungDungLinhVuc()
    {
        using var h = Dung(DuLieuThu.Nen);
        var tep = TepDuLieuMau.Nhung;

        var chanNuoi = await h.Service.HoiChuDeAsync(4, null, Ct);
        var xayDung = await h.Service.HoiChuDeAsync(6, null, Ct);

        Assert.Equal(tep.ThuTuc.Count(t => t.LinhVucMa == "chan-nuoi"), chanNuoi!.Tong);
        Assert.Empty(chanNuoi.DanhSachThuTuc!.Select(t => t.Ma).Intersect(tep.ThuTuc.Where(t => t.LinhVucMa == "nuoi-con-nuoi").Select(t => t.Ma)));
        Assert.Equal("Hoạt động xây dựng", xayDung!.ChuDe!.LinhVuc);
    }

    [Fact]
    public async Task ChuDe_LinhVucMuoiLamThuTucVaLinhVucTrong()
    {
        using var h = Dung(DuLieuThu.ChuDeThu);

        var muoiLam = await h.Service.HoiChuDeAsync(TroLyThu.ThuTuChuDe15, null, Ct);
        var trong = await h.Service.HoiChuDeAsync(TroLyThu.ThuTuChuDe0, null, Ct);

        Assert.Equal(15, muoiLam!.Tong);
        Assert.Equal(10, muoiLam.DanhSachThuTuc!.Count);
        Assert.Equal(0, trong!.Tong);
        Assert.Empty(trong.DanhSachThuTuc!);
    }
}
