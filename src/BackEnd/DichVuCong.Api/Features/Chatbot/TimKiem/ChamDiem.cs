namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>Một thủ tục ứng viên và điểm của nó (plan F06 §4.3).</summary>
/// <param name="ThuTuc">Thủ tục trong chỉ mục.</param>
/// <param name="Dice">Hệ số Dice có trọng số IDF: <c>2 × chung / (Q + D)</c>.</param>
/// <param name="Phu">Độ phủ truy vấn: <c>chung / Q</c>.</param>
/// <param name="SoTuKhop">Số từ truy vấn có trong tên thủ tục.</param>
/// <param name="DuLienQuan">Đủ liên quan để hiện ở bước 4.</param>
/// <param name="DuChac">Đủ chắc để coi là thủ tục xác định được (bước 3).</param>
internal sealed record UngVien(ThuTucChiMuc ThuTuc, double Dice, double Phu, int SoTuKhop, bool DuLienQuan, bool DuChac);

/// <summary>Cách hỏi mẫu khớp nhất và điểm Dice của nó.</summary>
internal sealed record KhopMau(CachHoiChiMuc Cach, double Dice);

/// <summary>
/// Chấm điểm bằng độ phủ có trọng số IDF (hệ số Dice) trên từ đã bỏ dấu (plan F06 Q4, §4.3). Từ hiếm nặng hơn từ phổ biến;
/// Dice phạt tên dài nên "đăng ký khai sinh" đứng trước "đăng ký khai sinh lưu động" khi chỉ gõ "khai sinh".
/// Ngưỡng nằm ở <see cref="ChamDiemOptions"/>.
/// </summary>
internal static class ChamDiem
{
    /// <summary>Số chữ số thập phân khi so điểm: hai điểm sai khác do làm tròn số thực coi là bằng nhau, rồi xếp theo <c>ThuTu</c>.</summary>
    private const int SoChuSoLamTron = 9;

    /// <summary>
    /// Ứng viên thủ tục, điểm giảm dần (hoà thì <c>ThuTu</c> tăng dần, rồi <c>Ma</c> Ordinal). Thủ tục nhận từ mã trong câu là
    /// ứng viên duy nhất, chắc chắn. <c>TuNoiDung</c> rỗng thì không có ứng viên.
    /// </summary>
    public static IReadOnlyList<UngVien> TimThuTuc(ChiMucTroLy chiMuc, CauDaPhanTich cau, ChamDiemOptions opt)
    {
        ArgumentNullException.ThrowIfNull(chiMuc);
        ArgumentNullException.ThrowIfNull(cau);
        ArgumentNullException.ThrowIfNull(opt);

        if (cau.ThuTucTheoMa is { } theoMa)
        {
            return [new UngVien(theoMa, 1, 1, Math.Max(1, cau.TuNoiDung.Length), true, true)];
        }

        var tu = cau.TuNoiDung;
        if (tu.Length == 0)
        {
            return [];
        }

        var q = tu.Sum(t => chiMuc.Idf(t.Tu));
        var chung = new Dictionary<ThuTucChiMuc, (double Diem, int So)>();
        foreach (var t in tu)
        {
            var idf = chiMuc.Idf(t.Tu) * (t.DaSua ? opt.HeSoTuSuaLoi : 1);
            foreach (var thuTuc in chiMuc.ThuTucCoTu(t.Tu))
            {
                chung[thuTuc] = chung.TryGetValue(thuTuc, out var cu) ? (cu.Diem + idf, cu.So + 1) : (idf, 1);
            }
        }

        var soTuToiThieu = Math.Min(2, tu.Length);

        return [.. chung
            .Select(p =>
            {
                var phu = q > 0 ? p.Value.Diem / q : 0;
                var dice = q + p.Key.TongIdf > 0 ? 2 * p.Value.Diem / (q + p.Key.TongIdf) : 0;
                var lienQuan = phu >= opt.NguongLienQuanPhu && p.Value.So >= soTuToiThieu;
                var chac = lienQuan && phu >= opt.NguongChacPhu && dice >= opt.NguongChacDice;

                return new UngVien(p.Key, dice, phu, p.Value.So, lienQuan, chac);
            })
            .OrderByDescending(u => Math.Round(u.Dice, SoChuSoLamTron))
            .ThenBy(u => u.ThuTuc.ThuTu)
            .ThenBy(u => u.ThuTuc.Ma, StringComparer.Ordinal)];
    }

    /// <summary>
    /// Cách hỏi mẫu khớp nhất với <c>TuMau</c> nếu <c>dice ≥ NguongMauDice</c>; hoà thì câu mẫu có <c>ThuTu</c> nhỏ hơn,
    /// rồi cách hỏi có <c>ThuTu</c> nhỏ hơn.
    /// </summary>
    public static KhopMau? TimMau(ChiMucTroLy chiMuc, CauDaPhanTich cau, ChamDiemOptions opt)
    {
        ArgumentNullException.ThrowIfNull(chiMuc);
        ArgumentNullException.ThrowIfNull(cau);
        ArgumentNullException.ThrowIfNull(opt);

        var tu = cau.TuMau;
        if (tu.Length == 0)
        {
            return null;
        }

        var q = tu.Sum(t => chiMuc.IdfMau(t.Tu));
        var chung = new Dictionary<CachHoiChiMuc, double>();
        foreach (var t in tu)
        {
            var idf = chiMuc.IdfMau(t.Tu) * (t.DaSua ? opt.HeSoTuSuaLoi : 1);
            foreach (var cach in chiMuc.CachHoiCoTu(t.Tu))
            {
                chung[cach] = chung.GetValueOrDefault(cach) + idf;
            }
        }

        return chung
            .Select(p => new KhopMau(p.Key, q + p.Key.TongIdf > 0 ? 2 * p.Value / (q + p.Key.TongIdf) : 0))
            .Where(k => k.Dice >= opt.NguongMauDice)
            .OrderByDescending(k => Math.Round(k.Dice, SoChuSoLamTron))
            .ThenBy(k => k.Cach.CauThuTu)
            .ThenBy(k => k.Cach.ThuTu)
            .FirstOrDefault();
    }
}
