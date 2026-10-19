using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.Chatbot.DocCauTraLoi;

public interface IVietTatDocService
{
    /// <summary>Bảng viết tắt theo <c>ThuTu</c> của dữ liệu; rỗng thì <c>[]</c>.</summary>
    Task<IReadOnlyList<VietTatDocDto>> LayAsync(CancellationToken cancellationToken);
}

/// <summary>Đọc bảng viết tắt qua <see cref="INguonDuLieu"/> (R1–R3): sắp theo khoá số, <c>Select</c> thẳng ra DTO.</summary>
public sealed class VietTatDocService(INguonDuLieu nguon) : IVietTatDocService
{
    public async Task<IReadOnlyList<VietTatDocDto>> LayAsync(CancellationToken cancellationToken)
        => await nguon.VietTats
            .OrderBy(v => v.ThuTu)
            .Select(v => new VietTatDocDto(v.ChuVietTat, v.DayDu))
            .DanhSachAsync(cancellationToken);
}
