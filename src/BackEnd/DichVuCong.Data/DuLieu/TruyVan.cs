using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace DichVuCong.Data.DuLieu;

/// <summary>
/// Lấy kết quả của <see cref="IQueryable{T}"/> từ <see cref="INguonDuLieu"/> (plan F00 §9.3, §9.4 R1).
/// Nguồn PostgreSql (provider của EF) chạy bản async của EF; nguồn Mẫu chạy LINQ trên bộ nhớ, đã sẵn dữ liệu nên hoàn thành ngay.
/// Dùng thay <c>ToListAsync</c>, <c>FirstOrDefaultAsync</c>… của EF: các hàm đó ném lỗi khi nguồn là Mẫu.
/// </summary>
public static class TruyVan
{
    public static Task<List<T>> DanhSachAsync<T>(this IQueryable<T> query, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        return LaEf(query) ? query.ToListAsync(ct) : ChayBoNho(query, q => q.ToList(), ct);
    }

    /// <summary>Phần tử đầu, hoặc <c>default</c> khi rỗng.</summary>
    public static Task<T?> DauTienAsync<T>(this IQueryable<T> query, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        return LaEf(query) ? query.FirstOrDefaultAsync(ct) : ChayBoNho(query, q => q.FirstOrDefault(), ct);
    }

    public static Task<int> DemAsync<T>(this IQueryable<T> query, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        return LaEf(query) ? query.CountAsync(ct) : ChayBoNho(query, q => q.Count(), ct);
    }

    public static Task<bool> CoAsync<T>(this IQueryable<T> query, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        return LaEf(query) ? query.AnyAsync(ct) : ChayBoNho(query, q => q.Any(), ct);
    }

    /// <summary>Giá trị lớn nhất của <paramref name="chon"/>. Tập rỗng: <c>null</c> nếu kiểu kết quả cho null, không thì <see cref="InvalidOperationException"/> (như LINQ và EF).</summary>
    public static Task<TKetQua> LonNhatAsync<T, TKetQua>(this IQueryable<T> query, Expression<Func<T, TKetQua>> chon, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(query);
        ArgumentNullException.ThrowIfNull(chon);

        return LaEf(query) ? query.MaxAsync(chon, ct) : ChayBoNho<T, TKetQua>(query, q => q.Max(chon)!, ct);
    }

    private static bool LaEf<T>(IQueryable<T> query) => query.Provider is IAsyncQueryProvider;

    private static Task<TKetQua> ChayBoNho<T, TKetQua>(IQueryable<T> query, Func<IQueryable<T>, TKetQua> chay, CancellationToken ct)
    {
        // Lỗi trả về trong Task như bản async của EF, để người gọi bắt lỗi ở chỗ await.
        if (ct.IsCancellationRequested)
        {
            return Task.FromCanceled<TKetQua>(ct);
        }

        try
        {
            return Task.FromResult(chay(query));
        }
#pragma warning disable CA1031 // Chuyển nguyên lỗi vào Task, không nuốt.
        catch (Exception ex)
#pragma warning restore CA1031
        {
            return Task.FromException<TKetQua>(ex);
        }
    }
}
