using DichVuCong.Data;
using DichVuCong.Import.KiemTra;

namespace DichVuCong.Import.Lenh;

/// <summary>Một file đã đọc và kiểm, sẵn sàng in kết quả hoặc ghi vào cơ sở dữ liệu.</summary>
internal abstract class MucNhap(string duongDan, IReadOnlyList<LoiDong> loi, IReadOnlyList<CanhBao> canhBao)
{
    public string DuongDan { get; } = duongDan;

    public string TenFile => Path.GetFileName(DuongDan);

    public IReadOnlyList<LoiDong> Loi { get; } = loi;

    public IReadOnlyList<CanhBao> CanhBao { get; } = canhBao;

    public bool HopLe => Loi.Count == 0;

    /// <summary>Các dòng "Thủ tục: 408 …" in sau khi nhập hoặc khi <c>--chi-kiem</c>.</summary>
    public abstract IEnumerable<string> TomTat();

    /// <summary>Xoá rồi chèn các bảng của loại này, ghi <c>lan_nhap</c>. Gọi trong transaction.</summary>
    public abstract Task GhiAsync(AppDbContext db, TimeProvider thoiGian, CancellationToken huy);
}

internal sealed class MucNhap<T>(
    string duongDan,
    KetQuaKiemTra<T> ketQua,
    Func<T, IEnumerable<string>> tomTat,
    Func<AppDbContext, T, string, TimeProvider, CancellationToken, Task> ghi)
    : MucNhap(duongDan, ketQua.Loi, ketQua.CanhBao)
{
    public T DuLieu { get; } = ketQua.DuLieu;

    public override IEnumerable<string> TomTat() => tomTat(DuLieu);

    public override Task GhiAsync(AppDbContext db, TimeProvider thoiGian, CancellationToken huy)
        => ghi(db, DuLieu, DuongDan, thoiGian, huy);
}
