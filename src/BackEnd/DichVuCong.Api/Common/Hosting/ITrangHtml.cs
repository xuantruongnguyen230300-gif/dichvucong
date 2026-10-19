namespace DichVuCong.Api.Common.Hosting;

/// <summary>Dựng HTML của trang cho route của React. Đã đăng ký thì <see cref="SpaFallback"/> dùng; không thì trả file index.html.</summary>
public interface ITrangHtml
{
    /// <summary>Nội dung index.html, đã chèn dữ liệu đặc tả theo đường dẫn. Cần index.html tồn tại trong web root.</summary>
    Task<string> TaoAsync(HttpContext context, CancellationToken cancellationToken);
}
