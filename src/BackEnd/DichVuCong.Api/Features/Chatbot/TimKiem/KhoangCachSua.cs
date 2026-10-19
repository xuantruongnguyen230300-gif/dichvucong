namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>
/// Khoảng cách chỉnh sửa Damerau–Levenshtein (dạng "optimal string alignment": chèn, xoá, thay một ký tự,
/// đảo hai ký tự kề nhau, mỗi phép tính 1) có chặn trên, để sửa lỗi gõ từng từ.
/// </summary>
internal static class KhoangCachSua
{
    /// <summary>
    /// Khoảng cách giữa hai từ nếu không vượt <paramref name="toiDa"/>; ngược lại <c>toiDa + 1</c> (trả sớm, không tính hết).
    /// </summary>
    public static int Tinh(ReadOnlySpan<char> a, ReadOnlySpan<char> b, int toiDa)
    {
        if (Math.Abs(a.Length - b.Length) > toiDa)
        {
            return toiDa + 1;
        }

        if (a.Length == 0 || b.Length == 0)
        {
            return Math.Max(a.Length, b.Length);
        }

        // Ba hàng: i-2, i-1, i.
        var truoc2 = new int[b.Length + 1];
        var truoc = new int[b.Length + 1];
        var hienTai = new int[b.Length + 1];
        for (var j = 0; j <= b.Length; j++)
        {
            truoc[j] = j;
        }

        for (var i = 1; i <= a.Length; i++)
        {
            hienTai[0] = i;
            var nhoNhat = hienTai[0];
            for (var j = 1; j <= b.Length; j++)
            {
                var chiPhiThay = a[i - 1] == b[j - 1] ? 0 : 1;
                var d = Math.Min(Math.Min(truoc[j] + 1, hienTai[j - 1] + 1), truoc[j - 1] + chiPhiThay);
                if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1])
                {
                    d = Math.Min(d, truoc2[j - 2] + 1);
                }

                hienTai[j] = d;
                nhoNhat = Math.Min(nhoNhat, d);
            }

            if (nhoNhat > toiDa)
            {
                return toiDa + 1;
            }

            (truoc2, truoc, hienTai) = (truoc, hienTai, truoc2);
        }

        return Math.Min(truoc[b.Length], toiDa + 1);
    }
}
