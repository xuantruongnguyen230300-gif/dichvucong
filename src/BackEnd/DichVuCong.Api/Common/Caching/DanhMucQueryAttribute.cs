namespace DichVuCong.Api.Common.Caching;

/// <summary>
/// Khai các tham số query mà endpoint gắn policy <c>danh-muc</c> thật sự dùng; chỉ các tham số này vào khoá cache.
/// Endpoint không gắn thuộc tính này (không có tham số) thì bỏ qua toàn bộ query: <c>?x=1</c>, <c>?x=2</c>… cùng một mục cache,
/// kẻ xấu không thổi cache bằng query ngẫu nhiên.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public sealed class DanhMucQueryAttribute(params string[] khoa) : Attribute
{
    public IReadOnlyList<string> Khoa { get; } = khoa;
}
