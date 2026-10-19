using System.Security.Cryptography;

namespace DichVuCong.Api.Common.Errors;

/// <summary>
/// Mã tra cứu lỗi (F00 BR-7): 8 ký tự chữ hoa và số, bỏ <c>0 O 1 I L</c>.
/// Không chứa thông tin kỹ thuật hay cá nhân; dùng để tìm đúng lần lỗi trong nhật ký.
/// </summary>
public static class MaTraCuu
{
    public const string TruongJson = "maTraCuu";
    public const int DoDai = 8;
    public const string BangKyTu = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    private static readonly object ItemKey = new();

    public static string Tao() => RandomNumberGenerator.GetString(BangKyTu, DoDai);

    /// <summary>Mã của yêu cầu hiện tại; chưa có thì tạo và giữ lại để mọi nơi (log, ProblemDetails) dùng cùng một mã.</summary>
    public static string LayHoacTao(HttpContext context)
    {
        if (context.Items.TryGetValue(ItemKey, out var co) && co is string ma)
        {
            return ma;
        }

        ma = Tao();
        context.Items[ItemKey] = ma;
        return ma;
    }

    public static bool DaCo(HttpContext context) => context.Items.ContainsKey(ItemKey);
}
