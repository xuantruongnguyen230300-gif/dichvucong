using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Api.Features.Chatbot.TimKiem;
using DichVuCong.Api.Features.ChiTietThuTuc;
using DichVuCong.Data.DuLieu;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>Kho câu chưa trả lời giả: ghi lại nội dung đã nhận (để kiểm câu đã che), có thể bật ném lỗi.</summary>
internal sealed class KhoGhiLai : IKhoCauChuaTraLoi
{
    private readonly List<string> _cacCau = [];

    public IReadOnlyList<string> CacCau
    {
        get
        {
            lock (_cacCau)
            {
                return [.. _cacCau];
            }
        }
    }

    public bool NemLoi { get; set; }

    public Task GhiAsync(string noiDung, CancellationToken ct)
    {
        if (NemLoi)
        {
            return Task.FromException(new InvalidOperationException("Giả lập kho lỗi, có chứa câu: " + noiDung));
        }

        lock (_cacCau)
        {
            _cacCau.Add(noiDung);
        }

        return Task.CompletedTask;
    }

    public Task<int> XoaQuaHanAsync(DateTimeOffset moc, CancellationToken ct) => Task.FromResult(0);
}

/// <summary>Phiên bản dữ liệu đọc thẳng từ nguồn (như bản thật), cho phép đặt tay để thử dựng lại chỉ mục.</summary>
internal sealed class PhienBanTheoNguon(INguonDuLieu nguon) : IPhienBanDuLieu
{
    public long? DatTay { get; set; }

    public async Task<long> LayAsync(CancellationToken cancellationToken)
    {
        if (DatTay is { } v)
        {
            return v;
        }

        var thoiDiem = await nguon.LanNhaps.LonNhatAsync(l => (DateTimeOffset?)l.ThoiDiem, cancellationToken);

        return thoiDiem?.UtcTicks ?? 0;
    }
}

/// <summary>
/// Dựng <see cref="ITroLyService"/> bằng đúng đăng ký của <c>AddChatbot</c> trên một nguồn dữ liệu cho sẵn, với kho câu chưa trả lời giả
/// và phiên bản dữ liệu đọc từ nguồn. Dùng chung cho test nguồn Mẫu và nguồn PostgreSQL.
/// </summary>
internal sealed class TroLyHarness : IDisposable
{
    private readonly ServiceProvider _goc;
    private readonly IServiceScope _scope;

    private TroLyHarness(ServiceProvider goc, KhoGhiLai kho, PhienBanTheoNguon phienBan)
    {
        _goc = goc;
        _scope = goc.CreateScope();
        Kho = kho;
        PhienBan = phienBan;
    }

    public KhoGhiLai Kho { get; }

    public PhienBanTheoNguon PhienBan { get; }

    public ITroLyService Service => _scope.ServiceProvider.GetRequiredService<ITroLyService>();

    public KhoChiMuc KhoChiMuc => _goc.GetRequiredService<KhoChiMuc>();

    public static TroLyHarness Dung(INguonDuLieu nguon, Action<IServiceCollection>? tuyChinh = null, IDictionary<string, string?>? cauHinh = null)
    {
        var kho = new KhoGhiLai();
        var phienBan = new PhienBanTheoNguon(nguon);
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(cauHinh ?? new Dictionary<string, string?>()).Build());
        services.AddSingleton(nguon);
        services.AddSingleton<IPhienBanDuLieu>(phienBan);
        services.AddChiTietThuTuc();
        services.AddChatbot(LoaiNguonDuLieu.Mau);
        services.AddSingleton<IKhoCauChuaTraLoi>(kho);
        tuyChinh?.Invoke(services);

        return new TroLyHarness(services.BuildServiceProvider(), kho, phienBan);
    }

    public Task<CauTraLoiDto> HoiAsync(string cau, string? maThuTuc = null)
        => Service.HoiAsync(cau, maThuTuc, TestContext.Current.CancellationToken);

    public void Dispose()
    {
        _scope.Dispose();
        _goc.Dispose();
    }
}
