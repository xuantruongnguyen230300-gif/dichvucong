using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data.Entities;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Che số CCCD, điện thoại, email (F06 BR-8, AC-8, AC-16; plan §4.8).</summary>
public sealed class CheThongTinCaNhanTests
{
    [Theory]
    [InlineData("0912345678", "09******78")]
    [InlineData("079123456789", "07********89")]
    [InlineData("nguyenvana@gmail.com", "n***@gmail.com")]
    [InlineData("0912 345 678", "09******78")]
    [InlineData("0912.345.678", "09******78")]
    [InlineData("0912-345-678", "09******78")]
    [InlineData("+84 912 345 678", "+84*******78")]
    [InlineData("084912345678", "08********78")]
    [InlineData("số 0912345678 của tôi nộp hồ sơ chưa", "số 09******78 của tôi nộp hồ sơ chưa")]
    [InlineData("CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu", "CCCD 07********89, email n***@gmail.com, hồ sơ của tôi đâu")]
    [InlineData("liên hệ a.b+c@sub.example.vn nhé", "liên hệ a***@sub.example.vn nhé")]
    [InlineData("gọi 0912345678 hoặc 0987654321", "gọi 09******78 hoặc 09******21")]
    [InlineData("123456789", "12*****89")]
    // Điện thoại cách quãng nhóm 2, ngoặc, dấu chấm cuối câu (lỗi Chặn review F06).
    [InlineData("09 12 34 56 78", "09******78")]
    [InlineData("09-12-34-56-78", "09******78")]
    [InlineData("0912 34 56 78", "09******78")]
    [InlineData("(028) 3822 1234", "(02*******34")]
    [InlineData("(028)38221234", "(02*******34")]
    [InlineData("028.3822.1234", "02*******34")]
    [InlineData("028 3822 1234", "02*******34")]
    [InlineData("+84 9 1234 5678", "+84*******78")]
    [InlineData("(+84) 912 345 678", "(+84*******78")]
    [InlineData("(84) 912345678", "(84*******78")]
    [InlineData("84912345678", "84*******78")]
    [InlineData("84.912.345.678", "84*******78")]
    [InlineData("09123456789", "09*******89")]
    [InlineData("0123-456-789", "01******89")]
    [InlineData("gọi 0912345678.", "gọi 09******78.")]
    [InlineData("gọi 0912 345 678.", "gọi 09******78.")]
    [InlineData("tel:0912345678", "tel:09******78")]
    [InlineData("sđt 84 28 3822 1234", "sđt 84********34")]
    // CCCD 12 chữ số và CMND 9 chữ số, phân cách tuỳ ý.
    [InlineData("079 123 456 789", "07********89")]
    [InlineData("079-123-456-789", "07********89")]
    [InlineData("079.123.456.789", "07********89")]
    [InlineData("0 7 9 1 2 3 4 5 6 7 8 9", "07********89")]
    [InlineData("CCCD: 079 123 456 789.", "CCCD: 07********89.")]
    [InlineData("123 456 789", "12*****89")]
    [InlineData("123-456-789", "12*****89")]
    [InlineData("9 12 345 678", "91*****78")]
    [InlineData("1 2 3 4 5 6 7 8 9", "12*****89")]
    // Nhiều số / số kề mã thủ tục và ngày.
    [InlineData("0912345678 0987654321", "09******78 09******21")]
    [InlineData("0912345678 và 079123456789", "09******78 và 07********89")]
    [InlineData("20 05 2026 0912345678", "20 05 2026 09******78")]
    [InlineData("1.001193 0912345678", "1.001193 09******78")]
    [InlineData("Số 09 12 34 56 78 và email a@b.vn", "Số 09******78 và email a***@b.vn")]
    public void Che_ChePhanNhayCam(string cau, string mongDoi) => Assert.Equal(mongDoi, CheThongTinCaNhan.Che(cau));

    [Theory]
    [InlineData("1.012784")]
    [InlineData("mã 1.001193.02 mấy ngày")]
    [InlineData("1.001193.000.00.00.H53")]
    [InlineData("ngày 12 05 2026 tôi nộp")]
    [InlineData("12.05.2026")]
    [InlineData("ngày 12-05-2026")]
    [InlineData("số 12345678 là 8 chữ số")]
    [InlineData("thủ tục 2.000806")]
    [InlineData("mã 1.001193 và mã 2.000806 khác nhau thế nào")]
    [InlineData("quầy 4 ai phụ trách")]
    [InlineData("khai sinh")]
    [InlineData("Nghị định 123/2024/NĐ-CP")]
    [InlineData("Thông tư 01/2021/TT-BNV ngày 08/06/2021")]
    [InlineData("Quyết định 1234/QĐ-UBND năm 2024")]
    [InlineData("hồ sơ năm 2024 và 2025")]
    [InlineData("phí 200.000 đồng")]
    [InlineData("lệ phí 50.000đ")]
    [InlineData("phí 100.000.000 đồng")]
    [InlineData("mức phạt 1.000.000.000 đồng")]
    [InlineData("làm việc từ 7h30 đến 17h")]
    [InlineData("tuổi từ 18 đến 60 tuổi")]
    [InlineData("điều 12 khoản 3 điểm a")]
    public void Che_KhongCheMaThuTucNgayPhiVaSoNganHon9ChuSo(string cau) => Assert.Equal(cau, CheThongTinCaNhan.Che(cau));

    [Theory]
    [InlineData("số 0912345678 nhé", "số   nhé")]
    [InlineData("0912 345 678", " ")]
    [InlineData("09 12 34 56 78", " ")]
    [InlineData("(028) 3822 1234", "( ")]
    [InlineData("1.001193 0912345678", "1.001193  ")]
    [InlineData("a nguyenvana@gmail.com b", "a   b")]
    [InlineData("CCCD 079123456789 xong", "CCCD   xong")]
    [InlineData("mã 1.001193 mấy ngày", "mã 1.001193 mấy ngày")]
    public void Bo_ThayMoiChoKhopBangDungMotDauCach(string cau, string mongDoi) => Assert.Equal(mongDoi, CheThongTinCaNhan.Bo(cau));

    [Fact]
    public void Che_CauToanEmailNganKhongVuot500KyTu()
    {
        var cau = string.Join(' ', Enumerable.Repeat("a@b.co", 83))[..500];

        var che = CheThongTinCaNhan.Che(cau);

        Assert.True(che.Length <= CauChuaTraLoi.DoDaiToiDa);
        Assert.DoesNotContain("a@b.co", che, StringComparison.Ordinal);
    }

    [Fact]
    public void Che_CatKhongGiuaCapSurrogate()
    {
        // 499 ký tự rồi một cặp surrogate (U+1F600) khiến ký tự thứ 500 là nửa đầu cặp.
        var cau = new string('a', 499) + "\U0001F600" + "bcd";

        var che = CheThongTinCaNhan.Che(cau);

        Assert.Equal(499, che.Length);
        Assert.False(char.IsHighSurrogate(che[^1]));
    }

    [Fact]
    public void Che_CauDuoi500KyTuGiuNguyenDoDai()
    {
        var cau = new string('x', 500);

        Assert.Equal(cau, CheThongTinCaNhan.Che(cau));
    }

    [Fact]
    public void Che_KhongBaoGioChuaLaiSoDayDuHayEmailDayDu()
    {
        string[] cau =
        [
            "0912345678", "079123456789", "nguyenvana@gmail.com", "0912 345 678", "+84 912 345 678", "tôi là a@b.vn, số 0987654321 hoặc 0123-456-789",
            "09 12 34 56 78", "09-12-34-56-78", "(028) 3822 1234", "0912.345.678", "gọi 09 12 34 56 78.", "079 123 456 789",
        ];

        foreach (var c in cau)
        {
            var che = CheThongTinCaNhan.Che(c);
            Assert.DoesNotMatch(@"\d{5}", che);
            Assert.DoesNotContain("nguyenvana", che, StringComparison.Ordinal);
            Assert.DoesNotContain("a@b.vn", che, StringComparison.Ordinal);
            Assert.DoesNotContain("12 34", che, StringComparison.Ordinal);
            Assert.DoesNotContain("3822", che, StringComparison.Ordinal);
        }
    }

    // Hai bản cùng quyết định: chỗ nào Che đổi thì Bo cũng đổi, chỗ nào Che giữ thì Bo giữ.
    [Theory]
    [InlineData("09 12 34 56 78")]
    [InlineData("(028) 3822 1234")]
    [InlineData("gọi 0912.345.678 nhé")]
    [InlineData("1.001193.02 mấy ngày")]
    [InlineData("phí 100.000.000 đồng")]
    public void CheVaBo_CungQuyetDinh(string cau) =>
        Assert.Equal(CheThongTinCaNhan.Che(cau) == cau, CheThongTinCaNhan.Bo(cau) == cau);

    // ReDoS: dãy rất nhiều nhóm ngắn trong 500 ký tự vẫn xử lý nhanh và không mất kết quả.
    [Theory]
    [InlineData("1 ")]
    [InlineData("1-")]
    [InlineData("1.")]
    [InlineData("1 (")]
    [InlineData("12 ")]
    public void DayNhomDaiKhongLamChamVaKhongNo(string don)
    {
        var cau = string.Concat(Enumerable.Repeat(don, (500 / don.Length) + 1))[..500];
        var dongHo = System.Diagnostics.Stopwatch.StartNew();

        var che = CheThongTinCaNhan.Che(cau);
        var bo = CheThongTinCaNhan.Bo(cau);

        Assert.True(dongHo.ElapsedMilliseconds < 1000, $"chậm: {dongHo.ElapsedMilliseconds} ms");
        Assert.True(che.Length <= CauChuaTraLoi.DoDaiToiDa);
        Assert.NotEmpty(bo);
    }

    // Giới hạn đã biết: số điện thoại viết bằng chữ không bị che; liệt kê 9 chữ số lẻ bị che nhầm.
    [Fact]
    public void GioiHanDaBiet_SoBangChuKhongBiChe()
    {
        Assert.Equal("không chín một hai ba", CheThongTinCaNhan.Che("không chín một hai ba"));
    }
}
