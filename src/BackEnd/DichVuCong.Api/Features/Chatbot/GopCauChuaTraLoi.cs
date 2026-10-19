using DichVuCong.Data.Entities;
using DichVuCong.Data.Text;

namespace DichVuCong.Api.Features.Chatbot;

/// <summary>Câu đã kiểm tra, sẵn sàng ghi: nội dung đã làm sạch và khoá gộp.</summary>
internal readonly record struct CauDaChuanBi(string NoiDung, string KhoaGop);

/// <summary>Quy tắc chung của hai kho câu chưa trả lời, để hai kho kiểm tra, làm sạch và gộp giống nhau.</summary>
internal static class GopCauChuaTraLoi
{
    /// <summary>
    /// Làm sạch, kiểm tra rồi trả nội dung kèm khoá gộp (<c>ChuanHoaTimKiem</c>).
    /// Bỏ ký tự NUL (<c>\0</c>): PostgreSQL không lưu được NUL trong kiểu text, kho Mẫu cũng bỏ để hai kho lưu giống nhau.
    /// Độ dài tính theo ký tự .NET (UTF-16) sau khi bỏ NUL; PostgreSQL đếm theo điểm mã nên chỉ có thể rộng hơn, không chặt hơn.
    /// </summary>
    /// <exception cref="ArgumentNullException">Câu là null.</exception>
    /// <exception cref="ArgumentException">Câu rỗng, chỉ có khoảng trắng hoặc ký tự vô hình (kể cả sau khi bỏ NUL).</exception>
    /// <exception cref="ArgumentOutOfRangeException">Câu dài hơn <see cref="CauChuaTraLoi.DoDaiToiDa"/>.</exception>
    public static CauDaChuanBi ChuanBi(string noiDung)
    {
        ArgumentNullException.ThrowIfNull(noiDung);

        var sach = noiDung.Replace("\0", string.Empty, StringComparison.Ordinal);
        ArgumentException.ThrowIfNullOrWhiteSpace(sach, nameof(noiDung));
        ArgumentOutOfRangeException.ThrowIfGreaterThan(sach.Length, CauChuaTraLoi.DoDaiToiDa, nameof(noiDung));

        var khoa = TiengViet.ChuanHoaTimKiem(sach);
        if (khoa.Length == 0)
        {
            throw new ArgumentException("Câu không có ký tự nhìn thấy được.", nameof(noiDung));
        }

        return new CauDaChuanBi(sach, khoa);
    }
}
