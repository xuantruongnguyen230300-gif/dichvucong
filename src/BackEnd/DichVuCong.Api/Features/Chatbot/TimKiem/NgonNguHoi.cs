using System.Collections.Frozen;

namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>Một mục thủ tục (hoặc nhóm cụm) và các cụm từ nhận ra nó.</summary>
internal sealed record NhomCum(string Muc, string[][] Cum);

/// <summary>
/// Luật của tiếng Việt khi hỏi (plan F06 §4.4): từ đệm, cụm lời dẫn, cụm chỉ mục được hỏi, cụm hỏi quầy và cán bộ.
/// Đây là luật của ngôn ngữ, không phải dữ liệu của Trung tâm nên đặt trong mã. Mọi từ là chữ thường không dấu.
/// Quy tắc đưa từ vào danh sách từ đệm: không đưa từ nằm trong tên thủ tục mang nghĩa thủ tục — bỏ dấu làm nhiều từ trùng nhau
/// (chi, ban, the, boi, minh, di, cho, co, dang, ky…). Lời dẫn dài xử lý bằng cụm, không bằng từ đơn.
/// </summary>
internal static class NgonNguHoi
{
    /// <summary>Từ đệm chung: bỏ khỏi truy vấn và khỏi tập từ chấm điểm của tên thủ tục để hai phía đối xứng.</summary>
    public static readonly FrozenSet<string> TuDem = new[]
    {
        "a", "ay", "bi", "da", "em", "gi", "giup", "ha", "hay", "hoac", "hoi", "khi", "khong", "la", "lam", "may", "muon", "nao",
        "nen", "neu", "nhe", "nhieu", "nhu", "nhung", "o", "ong", "oi", "se", "thi", "toi", "va", "vay", "ve", "voi", "xin",
    }.ToFrozenSet(StringComparer.Ordinal);

    /// <summary>Hai từ luôn có trong tên thủ tục nên không phân biệt được thủ tục; bỏ khỏi truy vấn tìm thủ tục và tập từ chấm điểm.</summary>
    public static readonly FrozenSet<string> TuThuTuc = new[] { "thu", "tuc" }.ToFrozenSet(StringComparer.Ordinal);

    /// <summary>Cụm lời dẫn: cả cụm bị bỏ khỏi truy vấn.</summary>
    public static readonly string[][] CumDemLoiDan = Cum(
        "cho toi hoi", "cho minh hoi", "cho em hoi", "cho hoi", "xin cho hoi", "xin hoi", "nho giup", "lam on", "xin loi", "cam on", "vui long",
        "thu tuc hanh chinh");

    /// <summary>Cụm hỏi chung: chỉ bỏ khỏi truy vấn tìm thủ tục (câu hỏi mẫu giữ vì có "ở đâu", "là gì").</summary>
    public static readonly string[][] CumHoiChung = Cum(
        "o dau", "tai dau", "la gi", "the nao", "ra sao", "bao nhieu", "duoc khong", "co khong");

    /// <summary>Bảy mục được hỏi, theo thứ tự ưu tiên khi nhiều mục cùng khớp ("nơi nộp" trước "hồ sơ").</summary>
    public static readonly IReadOnlyList<NhomCum> CacMucHoi =
    [
        new(MucThuTucTroLy.ThoiHan, Cum("thoi han", "bao lau", "mat bao lau", "may ngay", "mat may ngay", "bao nhieu ngay", "mat bao nhieu ngay", "mat bao nhieu thoi gian",
            "thoi gian giai quyet", "thoi gian xu ly", "khi nao co ket qua")),
        new(MucThuTucTroLy.NoiNop, Cum(
            "nop o dau", "nop tai dau", "noi nop", "nop dau", "nop ho so o dau", "nop ho so tai dau", "hinh thuc nop",
            "nop truc tuyen", "nop ho so truc tuyen", "nop truc tiep")),
        new(MucThuTucTroLy.HoSo, Cum(
            "ho so", "giay to", "thanh phan ho so", "can giay", "can gi", "can nhung gi", "nop giay", "chuan bi gi", "mang theo")),
        new(MucThuTucTroLy.Phi, Cum("phi", "le phi", "bao nhieu tien", "mat tien", "dong tien", "mien phi")),
        new(MucThuTucTroLy.TrinhTu, Cum(
            "cac buoc", "may buoc", "buoc nao", "trinh tu", "quy trinh", "thuc hien the nao", "lam the nao", "cach lam",
            "phai lam gi", "can lam gi", "lam sao", "thu tuc ra sao", "thu tuc the nao", "huong dan")),
        new(MucThuTucTroLy.KetQua, Cum("ket qua", "nhan duoc gi", "cap giay gi", "duoc cap gi")),
        new(MucThuTucTroLy.CanCu, Cum(
            "can cu phap ly", "can cu", "van ban nao", "van ban phap luat", "quy dinh o dau", "nghi dinh nao", "thong tu nao", "luat nao")),
    ];

    /// <summary>Hỏi cán bộ phụ trách (BR-1 bước 1).</summary>
    public static readonly string[][] CumHoiCanBo = Cum(
        "ai phu trach", "phu trach", "gap ai", "ai truc", "ai tiep nhan", "ai giai quyet", "ai xu ly", "can bo nao", "can bo phu trach");

    /// <summary>Hỏi tình trạng hồ sơ cá nhân: trang không tra cứu hồ sơ nên đi thẳng tới bước 5.</summary>
    public static readonly string[][] CumTinhTrangHoSo = Cum(
        "ho so cua toi dau", "ho so cua toi den dau", "ho so cua toi chua", "ho so cua toi xong chua", "nop ho so chua",
        "tinh trang ho so", "tra cuu tinh trang");

    /// <summary>Động từ đứng trước tên người ("gặp Cường", "liên hệ chị Nhung").</summary>
    public static readonly string[][] CumGoiTen = Cum("gap", "lien he", "tim", "goi dien", "noi chuyen");

    public static readonly string[] TuQuay = ["quay"];

    public static readonly string[] TuAnh = ["anh"];

    public static readonly string[] TuChi = ["chi"];

    /// <summary>Mọi từ xuất hiện trong luật ngôn ngữ, để từ điển sửa lỗi gõ biết (không sửa nhầm chúng thành từ khác).</summary>
    public static IEnumerable<string> MoiTu()
    {
        foreach (var tu in TuDem.Concat(TuThuTuc).Concat(TuQuay).Concat(TuAnh).Concat(TuChi))
        {
            yield return tu;
        }

        var cacNhom = new IEnumerable<string[]>[]
        {
            CumDemLoiDan, CumHoiChung, CumHoiCanBo, CumTinhTrangHoSo, CumGoiTen, CacMucHoi.SelectMany(n => n.Cum),
        };
        foreach (var tu in cacNhom.SelectMany(n => n).SelectMany(c => c))
        {
            yield return tu;
        }
    }

    private static string[][] Cum(params string[] cum) => [.. cum.Select(c => c.Split(' '))];
}
