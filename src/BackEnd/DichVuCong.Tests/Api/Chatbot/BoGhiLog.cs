using System.Threading.Channels;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Ghi lại log của một category; test chờ từng dòng bằng <see cref="DocAsync"/>.</summary>
internal sealed class BoGhiLog(string category) : ILoggerProvider
{
    private static readonly TimeSpan ThoiGianCho = TimeSpan.FromSeconds(10);

    private readonly Channel<GhiLog> _kenh = Channel.CreateUnbounded<GhiLog>();

    public ILogger CreateLogger(string categoryName) =>
        categoryName == category ? new BoGhi(_kenh.Writer) : NullLogger.Instance;

    /// <summary>Dòng log kế tiếp; quá 10 giây không có thì lỗi.</summary>
    public async Task<GhiLog> DocAsync()
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
        cts.CancelAfter(ThoiGianCho);
        return await _kenh.Reader.ReadAsync(cts.Token);
    }

    public bool ConDongChuaDoc => _kenh.Reader.TryPeek(out _);

    public void Dispose()
    {
    }

    private sealed class BoGhi(ChannelWriter<GhiLog> writer) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var thuocTinh = state is IReadOnlyList<KeyValuePair<string, object?>> ds
                ? ds.ToDictionary(p => p.Key, p => p.Value)
                : [];
            writer.TryWrite(new GhiLog(logLevel, formatter(state, exception), thuocTinh, exception));
        }
    }
}

internal sealed record GhiLog(LogLevel MucDo, string NoiDung, IReadOnlyDictionary<string, object?> ThuocTinh, Exception? Loi);
