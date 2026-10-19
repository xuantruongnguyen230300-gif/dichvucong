namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Từ điển của dữ liệu (mọi từ gặp trong tên thủ tục, lĩnh vực, cách hỏi mẫu, từ đồng nghĩa, viết tắt, luật ngôn ngữ)
/// để sửa lỗi gõ từng từ: "sjnh" → "sinh" (plan F06 §4.3 bước 4).
/// </summary>
internal sealed class TuDien
{
    private readonly HashSet<string> _tu;
    private readonly Dictionary<int, string[]> _theoDoDai;
    private readonly Func<string, int> _df;

    /// <param name="cacTu">Mọi từ của từ điển.</param>
    /// <param name="df">Số thủ tục có từ đó trong tập từ chấm điểm (để chọn giữa hai ứng viên cùng khoảng cách).</param>
    public TuDien(IEnumerable<string> cacTu, Func<string, int> df)
    {
        _tu = new HashSet<string>(cacTu, StringComparer.Ordinal);
        _df = df;
        _theoDoDai = _tu
            .GroupBy(t => t.Length)
            .ToDictionary(g => g.Key, g => g.Order(StringComparer.Ordinal).ToArray());
    }

    public int SoTu => _tu.Count;

    public bool Co(string tu) => _tu.Contains(tu);

    /// <summary>
    /// Từ trong từ điển gần <paramref name="tu"/> nhất trong số phép sửa cho phép; null nếu không cần sửa (đã có trong từ điển,
    /// toàn chữ số, có chữ số, quá ngắn) hoặc không có từ nào đủ gần (từ sửa phải giữ nguyên chữ cái đầu). Hoà khoảng cách thì <c>df</c> lớn hơn, hoà nữa thì thứ tự
    /// <c>Ordinal</c> nhỏ hơn — kết quả xác định.
    /// </summary>
    public string? Sua(string tu, ChamDiemOptions opt)
    {
        ArgumentNullException.ThrowIfNull(opt);

        if (tu.Length < opt.DoDaiToiThieuDeSuaLoi || Co(tu) || tu.Any(char.IsAsciiDigit))
        {
            return null;
        }

        var toiDa = tu.Length >= opt.DoDaiTuDai ? opt.SoPhepSuaTuDai : opt.SoPhepSuaTuNgan;
        string? tot = null;
        var khoangTot = int.MaxValue;
        var dfTot = -1;
        for (var doDai = tu.Length - toiDa; doDai <= tu.Length + toiDa; doDai++)
        {
            if ((doDai < tu.Length && tu.Length < opt.DoDaiToiThieuDeSuaBangXoaChu) || !_theoDoDai.TryGetValue(doDai, out var ungVien))
            {
                continue;
            }

            foreach (var uv in ungVien)
            {
                if (uv[0] != tu[0] || LaDoiNguyenAm(tu, uv))
                {
                    continue; // lỗi gõ hiếm khi đổi chữ cái đầu ("vàng" không thành "đang") hay thay nguyên âm bằng nguyên âm ("vàng" không thành "vùng")
                }

                var khoang = KhoangCachSua.Tinh(tu, uv, Math.Min(toiDa, khoangTot));
                if (khoang > toiDa || khoang > khoangTot)
                {
                    continue;
                }

                var df = _df(uv);
                if (khoang < khoangTot || df > dfTot || (df == dfTot && string.CompareOrdinal(uv, tot) < 0))
                {
                    tot = uv;
                    khoangTot = khoang;
                    dfTot = df;
                }
            }
        }

        return tot;
    }

    /// <summary>
    /// Hai từ cùng độ dài, khác đúng một chữ và cả hai chữ đó là nguyên âm ("vang" / "vung"): thường là hai từ thật khác nhau,
    /// không phải lỗi gõ (lỗi gõ hay thay bằng phím bên cạnh như "sjnh" / "sinh", hoặc đảo hai chữ).
    /// </summary>
    private static bool LaDoiNguyenAm(string tu, string ungVien)
    {
        if (tu.Length != ungVien.Length)
        {
            return false;
        }

        var soKhac = 0;
        var nguyenAm = true;
        for (var i = 0; i < tu.Length && soKhac < 2; i++)
        {
            if (tu[i] != ungVien[i])
            {
                soKhac++;
                nguyenAm &= LaNguyenAm(tu[i]) && LaNguyenAm(ungVien[i]);
            }
        }

        return soKhac == 1 && nguyenAm;
    }

    private static bool LaNguyenAm(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u' or 'y';
}
