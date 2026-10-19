using System.Collections.Concurrent;
using System.Data.Common;
using System.Net.Sockets;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Thay DB thật cho test không cần PostgreSQL: không mở kết nối, ghi lại câu lệnh không trả dòng (DELETE…)
/// và trả <see cref="SoDongXoa"/>. Bật <see cref="MatKetNoi"/> thì mở kết nối ném lỗi như khi DB không tới được.
/// </summary>
internal sealed class DbGiaLap : IDbConnectionInterceptor, IDbCommandInterceptor
{
    private readonly ConcurrentQueue<LenhDaChay> _cacLenh = new();
    private volatile bool _matKetNoi;

    public bool MatKetNoi
    {
        get => _matKetNoi;
        set => _matKetNoi = value;
    }

    /// <summary>host:port nằm trong message lỗi giả lập; log không được chứa chuỗi này.</summary>
    public const string MayChuGia = "10.1.2.3:5432";

    public int SoDongXoa { get; init; }

    public IReadOnlyCollection<LenhDaChay> CacLenh => _cacLenh;

    public ValueTask<InterceptionResult> ConnectionOpeningAsync(
        DbConnection connection, ConnectionEventData eventData, InterceptionResult result,
        CancellationToken cancellationToken = default) =>
        MatKetNoi
            ? throw new NpgsqlException($"Giả lập DB không tới được {MayChuGia}", new SocketException((int)SocketError.ConnectionRefused))
            : ValueTask.FromResult(InterceptionResult.Suppress());

    public ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        _cacLenh.Enqueue(new LenhDaChay(command.CommandText, [.. command.Parameters.Cast<DbParameter>().Select(p => p.Value)]));
        return ValueTask.FromResult(InterceptionResult<int>.SuppressWithResult(SoDongXoa));
    }
}

internal sealed record LenhDaChay(string Sql, IReadOnlyList<object?> ThamSo);
