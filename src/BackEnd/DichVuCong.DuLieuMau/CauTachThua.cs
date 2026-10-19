using System.Text.Json;

namespace DichVuCong.DuLieuMau;

/// <summary>
/// Các câu hỏi – trả lời viết sẵn về quy định tách thửa, ghép từ <c>qd-tach-thua.json</c> (nguồn Vàm Cỏ, áp dụng cho cả tỉnh Tây Ninh).
/// Chữ trả lời lấy nguyên từ nguồn, chỉ thêm tiêu đề; Trung tâm rà lại trước khi chạy thật.
/// </summary>
internal static class CauTachThua
{
    public static IEnumerable<(string Hoi, string[] CachHoi, string TraLoi)> Tao(JsonElement q)
    {
        var tiepGiap = q.GetProperty("tiepGiap");
        var datO = q.GetProperty("datO");
        var nongNghiep = q.GetProperty("datNongNghiep");
        var dacBiet = q.GetProperty("dieu14_dacBiet");
        var hopThua = q.GetProperty("hopThua");

        var soHieu = q.GetProperty("soHieu").GetString();
        var thayThe = string.Join("; ", q.GetProperty("thayThe").EnumerateArray().Select(x => x.GetString()));

        yield return (
            "Quy định về tách thửa đất hiện hành là gì?",
            ["văn bản quy định tách thửa đất", "tách thửa đất theo quy định nào", "quyết định tách thửa đất của tỉnh"],
            $"{q.GetProperty("tenVanBan").GetString()}.\n"
            + $"Số hiệu: {soHieu}, ký ngày {q.GetProperty("ngayKy").GetString()}. {q.GetProperty("hieuLuc").GetString()}.\n"
            + $"Thay thế: {thayThe}.");

        var bang = string.Join(
            "\n",
            datO.GetProperty("bang").EnumerateArray().Select(d =>
                $"- {d.GetProperty("dk").GetString()}: mức 1 {d.GetProperty("kt1").GetString()}, {d.GetProperty("dt1").GetString()}; "
                + $"mức 2 {d.GetProperty("kt2").GetString()}, {d.GetProperty("dt2").GetString()}"));
        yield return (
            "Diện tích tối thiểu tách thửa đất ở là bao nhiêu?",
            ["tách thửa đất ở tối thiểu bao nhiêu mét", "diện tích tối thiểu đất ở được tách thửa", "kích thước tối thiểu tách thửa đất ở"],
            $"Theo {soHieu}, kích thước và diện tích tối thiểu khi tách thửa đất ở:\n{bang}\n{datO.GetProperty("ghiChu").GetString()}");

        yield return (
            "Diện tích tối thiểu tách thửa đất nông nghiệp là bao nhiêu?",
            ["tách thửa đất nông nghiệp tối thiểu bao nhiêu", "diện tích tối thiểu đất nông nghiệp được tách thửa", "tách thửa đất trồng lúa"],
            $"Theo {soHieu}: {nongNghiep.GetProperty("moTa").GetString()}\n{nongNghiep.GetProperty("vungDacThu").GetString()}");

        yield return (
            "Đất không tiếp giáp đường có được tách thửa không?",
            ["đất không giáp đường có tách thửa được không", "tách thửa đất không có lối đi", "đất không có đường vào có tách thửa được không"],
            $"{tiepGiap.GetProperty("khongGiapDuong").GetString()}\n{tiepGiap.GetProperty("loiDi").GetString()}");

        var dieuKien = string.Join("\n", hopThua.GetProperty("dieuKien").EnumerateArray().Select(x => "- " + x.GetString()));
        var truongHopKhac = string.Join("\n", hopThua.GetProperty("truongHopKhac").EnumerateArray().Select(x => "- " + x.GetString()));
        yield return (
            "Điều kiện hợp thửa đất là gì?",
            ["hợp thửa đất cần điều kiện gì", "điều kiện để hợp thửa", "hợp thửa đất theo quy định nào"],
            $"Theo {soHieu}, điều kiện hợp thửa đất:\n{dieuKien}\nCác trường hợp khác:\n{truongHopKhac}");

        var doiTuong = string.Join("\n", dacBiet.GetProperty("doiTuong").EnumerateArray().Select(x => "- " + x.GetString()));
        yield return (
            "Trường hợp đặc biệt nào được tách thửa nhỏ hơn mức tối thiểu?",
            ["đất nhỏ hơn mức tối thiểu có được tách thửa không", "tách thửa diện tích nhỏ trường hợp đặc biệt", "tặng cho con đất nhỏ có tách thửa được không"],
            $"Theo {soHieu}, các trường hợp được xét:\n{doiTuong}\n"
            + $"Điều kiện riêng: {dacBiet.GetProperty("dieuKienRieng").GetString()}.\n{dacBiet.GetProperty("luuY").GetString()}");
    }
}
