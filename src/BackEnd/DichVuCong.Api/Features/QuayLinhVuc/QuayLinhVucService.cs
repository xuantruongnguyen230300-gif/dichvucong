using DichVuCong.Data.DuLieu;

namespace DichVuCong.Api.Features.QuayLinhVuc;

public interface IQuayLinhVucService
{
    /// <summary>Lĩnh vực đã có quầy, theo mã (Ordinal). Rỗng khi chưa nhập phân công hoặc không dòng nào có quầy.</summary>
    Task<IReadOnlyList<QuayLinhVucDto>> LayAsync(CancellationToken cancellationToken);
}

public sealed class QuayLinhVucService(INguonDuLieu nguon) : IQuayLinhVucService
{
    public async Task<IReadOnlyList<QuayLinhVucDto>> LayAsync(CancellationToken cancellationToken)
    {
        // Dòng chỉ có nơi tiếp nhận chuyển (Quay null) coi như chưa có quầy. Chỉ chiếu hai cột cần, không lấy nhân sự hay nơi tiếp nhận chuyển.
        var dong = await nguon.PhanCongLinhVucs
            .Where(p => p.Quay != null)
            .Select(p => new { p.LinhVucMa, p.Quay })
            .DanhSachAsync(cancellationToken);

        // Sắp theo mã Ordinal trong C# sau khi lấy: không phụ thuộc collation của DB (R3).
        return
        [
            .. dong
                .OrderBy(d => d.LinhVucMa, StringComparer.Ordinal)
                .Select(d => new QuayLinhVucDto(d.LinhVucMa, d.Quay!.Value)),
        ];
    }
}
