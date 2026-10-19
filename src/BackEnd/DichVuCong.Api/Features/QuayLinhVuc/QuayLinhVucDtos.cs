namespace DichVuCong.Api.Features.QuayLinhVuc;

/// <summary>Quầy phụ trách một lĩnh vực (F05). <paramref name="LinhVucMa"/> là khoá của <c>LinhVucDto.Ma</c>.</summary>
/// <param name="LinhVucMa">Mã lĩnh vực.</param>
/// <param name="Quay">Số quầy, số nguyên dương.</param>
public sealed record QuayLinhVucDto(string LinhVucMa, int Quay);
