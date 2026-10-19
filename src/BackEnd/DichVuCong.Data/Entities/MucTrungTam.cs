namespace DichVuCong.Data.Entities;

/// <summary>Mục thông tin Trung tâm mà một câu hỏi mẫu trả lời bằng giá trị đọc lúc hỏi. Lưu ở <c>cau_hoi_mau.muc_trung_tam</c>.</summary>
public enum MucTrungTam : short
{
    DiaChi = 1,
    GioLamViec = 2,
    DienThoai = 3,
    Email = 4,
    NopTrucTuyen = 5,
}
