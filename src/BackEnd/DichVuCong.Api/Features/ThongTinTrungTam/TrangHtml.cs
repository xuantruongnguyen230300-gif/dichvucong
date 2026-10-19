using System.Globalization;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Text.Json;
using DichVuCong.Api.Common.Caching;
using DichVuCong.Api.Common.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.FileProviders;

namespace DichVuCong.Api.Features.ThongTinTrungTam;

/// <summary>
/// Chèn tiêu đề và dữ liệu đặc tả (F08 plan §3.2, §3.3) vào index.html khi trả trang, để công cụ không chạy JavaScript
/// (Zalo, thu thập) thấy tên Trung tâm. Hợp đồng file <c>dac-ta-trang.json</c> nằm ở plan §3.2.
/// Mọi lỗi (DB, thiếu dấu đánh dấu, thiếu hay hỏng JSON) đều rơi về nguyên file index.html.
/// </summary>
public sealed partial class TrangHtml(
    IWebHostEnvironment environment,
    IThongTinTrungTamService service,
    IMemoryCache cache,
    CachingOptions caching,
    HostingOptions hosting,
    TenMienCongKhai tenMien,
    ILogger<TrangHtml> logger) : ITrangHtml
{
    public const string TepDacTa = "dac-ta-trang.json";
    public const string DauMo = "<!--dac-ta-->";
    public const string DauDong = "<!--/dac-ta-->";

    private const string KhoaCache = "dac-ta-trang:trung-tam";
    private const string KhoaKhoaNap = "dac-ta-trang:khoa-nap";
    private const string KhoaTepDacTa = "dac-ta-trang:tep";
    private const string KhoaTepNoiDung = "dac-ta-trang:noi-dung:";
    private static readonly Lock KhoaTaoKhoaNap = new();
    private static readonly TimeSpan ThoiGianCacheLoi = TimeSpan.FromSeconds(5);
    // Vẫn mã hoá < > & " ' ; chỉ để nguyên chữ có dấu cho dễ đọc (mặc định mã hoá cả chữ Việt thành &#x...).
    private static readonly HtmlEncoder Encoder = HtmlEncoder.Create(UnicodeRanges.All);
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<string> TaoAsync(HttpContext context, CancellationToken cancellationToken)
    {
        var html = await DocAsync(StaticAssets.IndexFile, cancellationToken)
            ?? throw new FileNotFoundException("Không có index.html trong web root.");

        try
        {
            return await ChenDacTaAsync(context, html, cancellationToken);
        }
#pragma warning disable CA1031 // Trang HTML không được hỏng vì file đặc tả hay dữ liệu: mọi lỗi rơi về index.html nguyên bản.
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
#pragma warning restore CA1031
        {
            LogLoiChen(logger, ex.GetType().Name);
            return html;
        }
    }

    private async Task<string> ChenDacTaAsync(HttpContext context, string html, CancellationToken cancellationToken)
    {
        var batDau = html.IndexOf(DauMo, StringComparison.Ordinal);
        var ketThuc = html.IndexOf(DauDong, StringComparison.Ordinal);
        if (batDau < 0 || ketThuc < batDau + DauMo.Length)
        {
            return html;
        }

        var dacTa = await DocDacTaTrangAsync(cancellationToken);
        if (dacTa is null)
        {
            return html;
        }

        var duLieu = await LayDuLieuAsync(cancellationToken);
        if (duLieu is null)
        {
            return html;
        }

        var duongDan = ChuanHoaDuongDan(context.Request.Path.Value);
        // Tên đường dẫn viết đúng như trong file đặc tả, nên /THU-TUC cũng cho og:url là /thu-tuc.
        var khoaChuan = dacTa.BangTrang.Keys.FirstOrDefault(k => string.Equals(k, duongDan, StringComparison.OrdinalIgnoreCase));
        var trangBiet = khoaChuan is null ? null : dacTa.BangTrang[khoaChuan];
        var trang = trangBiet ?? dacTa.KhongTimThay;
        if (trang is null)
        {
            return html;
        }

        // Địa chỉ chỉ dựng cho trang có thật và khi Host đã được AllowedHosts xác nhận; đường dẫn lạ không bị phản chiếu.
        var dinhDanh = trangBiet is null ? null : tenMien.DiaChiTuyetDoi(context.Request, khoaChuan!);
        var khoi = DungKhoi(dinhDanh, dacTa.MauTieuDe, trang, duLieu);

        return string.Concat(html.AsSpan(0, batDau + DauMo.Length), khoi, html.AsSpan(ketThuc));
    }

    /// <summary>Bỏ dấu "/" cuối (trừ gốc). So không phân biệt hoa thường nhờ từ điển ở <see cref="DocDacTaTrangAsync"/>.</summary>
    internal static string ChuanHoaDuongDan(string? duongDan)
    {
        var ketQua = (duongDan ?? string.Empty).TrimEnd('/');
        return ketQua.Length == 0 ? "/" : ketQua;
    }

    private static string DungKhoi(string? dinhDanh, string mauTieuDe, TrangDacTa trang, DacTaTrungTam duLieu)
    {
        var tieuDe = mauTieuDe
            .Replace("{{trang}}", trang.Ten, StringComparison.Ordinal)
            .Replace("{{trungTam}}", duLieu.Ten, StringComparison.Ordinal);
        var coQuan = string.IsNullOrWhiteSpace(duLieu.CoQuanChuQuan) ? duLieu.Ten : duLieu.CoQuanChuQuan;

        var sb = new StringBuilder();
        sb.Append('\n');
        sb.Append("    <title>").Append(Ma(tieuDe)).Append("</title>\n");
        Meta(sb, "name", "description", trang.MoTa);
        sb.Append("    <link rel=\"schema.DC\" href=\"https://purl.org/dc/elements/1.1/\">\n");
        Meta(sb, "name", "DC.title", tieuDe);
        Meta(sb, "name", "DC.description", trang.MoTa);
        Meta(sb, "name", "DC.creator", duLieu.Ten);
        Meta(sb, "name", "DC.publisher", coQuan);
        if (duLieu.NgayCapNhatThuTuc is { } ngay)
        {
            Meta(sb, "name", "DC.date", ngay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
        }

        if (dinhDanh is not null)
        {
            Meta(sb, "name", "DC.identifier", dinhDanh);
        }

        Meta(sb, "name", "DC.language", "vi");
        Meta(sb, "property", "og:title", tieuDe);
        Meta(sb, "property", "og:description", trang.MoTa);
        if (dinhDanh is not null)
        {
            Meta(sb, "property", "og:url", dinhDanh);
        }

        Meta(sb, "property", "og:type", "website");
        sb.Append("    ");

        return sb.ToString();
    }

    private static string Ma(string giaTri) => Encoder.Encode(giaTri);

    // Giá trị rỗng thì bỏ thẻ.
    private static void Meta(StringBuilder sb, string loaiKhoa, string khoa, string noiDung)
    {
        if (string.IsNullOrEmpty(noiDung))
        {
            return;
        }

        sb.Append("    <meta ").Append(loaiKhoa).Append("=\"").Append(khoa).Append("\" content=\"")
            .Append(Ma(noiDung)).Append("\">\n");
    }

    private async Task<DacTaTrungTam?> LayDuLieuAsync(CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(KhoaCache, out DacTaTrungTam? coSan))
        {
            return coSan;
        }

        // Một yêu cầu nạp, các yêu cầu đồng thời chờ rồi dùng kết quả (không đổ dồn vào DB khi cache hết hạn).
        // GetOrCreate không nguyên tử: hai yêu cầu đầu tiên có thể mỗi bên tạo một khoá riêng rồi cùng nạp. Tạo khoá trong lock.
        SemaphoreSlim khoaNap;
        lock (KhoaTaoKhoaNap)
        {
            khoaNap = cache.GetOrCreate(KhoaKhoaNap, _ => new SemaphoreSlim(1, 1))!;
        }

        await khoaNap.WaitAsync(cancellationToken);
        try
        {
            if (cache.TryGetValue(KhoaCache, out coSan))
            {
                return coSan;
            }

            return await NapTuDichVuAsync(cancellationToken);
        }
        finally
        {
            khoaNap.Release();
        }
    }

    private async Task<DacTaTrungTam?> NapTuDichVuAsync(CancellationToken cancellationToken)
    {
        DacTaTrungTam? duLieu = null;
        var hanCache = caching.DacTaTrang;
        try
        {
            using var het = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            het.CancelAfter(hosting.ReadyTimeout);
            duLieu = await service.LayDacTaAsync(het.Token);
        }
#pragma warning disable CA1031 // Trang HTML không được hỏng vì DB: mọi lỗi rơi về khối mặc định, chỉ ghi log.
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
#pragma warning restore CA1031
        {
            LogLoiDacTa(logger, ex.GetType().Name);
            // Lỗi chỉ nhớ ngắn để DB phục hồi thì trang có dữ liệu lại sớm, và không chờ hết giờ ở mỗi yêu cầu.
            hanCache = ThoiGianCacheLoi < hanCache ? ThoiGianCacheLoi : hanCache;
        }

        cache.Set(KhoaCache, duLieu, hanCache);

        return duLieu;
    }

    private async Task<DacTaFile?> DocDacTaTrangAsync(CancellationToken cancellationToken)
    {
        var file = environment.WebRootFileProvider.GetFileInfo(TepDacTa);
        if (!file.Exists)
        {
            return null;
        }

        if (cache.TryGetValue(KhoaTepDacTa, out BanTep<DacTaFile>? coSan) && coSan!.Khop(file))
        {
            return coSan.NoiDung;
        }

        var ketQua = PhanTichDacTa(await DocFileAsync(file, cancellationToken));
        cache.Set(KhoaTepDacTa, new BanTep<DacTaFile>(file.LastModified, file.Length, ketQua));

        return ketQua;
    }

    private DacTaFile? PhanTichDacTa(string noiDung)
    {
        try
        {
            var file = JsonSerializer.Deserialize<DacTaFile>(noiDung, JsonOptions);
            if (string.IsNullOrEmpty(file?.MauTieuDe))
            {
                return null;
            }

            // Khoá so không phân biệt hoa thường; hai khoá chỉ khác hoa thường thì lấy khoá đầu. Giá trị null bị bỏ.
            var trang = new Dictionary<string, TrangDacTa>(StringComparer.OrdinalIgnoreCase);
            foreach (var (khoa, gia) in file.Trang ?? [])
            {
                if (khoa is not null && gia is not null)
                {
                    trang.TryAdd(khoa, gia);
                }
            }

            file.BangTrang = trang;

            return file;
        }
#pragma warning disable CA1031 // File đặc tả sai hình dạng kiểu gì cũng rơi về index.html nguyên bản, không 500.
        catch (Exception)
#pragma warning restore CA1031
        {
            LogJsonHong(logger);
            return null;
        }
    }

    /// <summary>Nội dung file trong web root, nhớ theo thời gian sửa và kích thước: không đọc lại đĩa mỗi yêu cầu.</summary>
    private async Task<string?> DocAsync(string ten, CancellationToken cancellationToken)
    {
        var file = environment.WebRootFileProvider.GetFileInfo(ten);
        if (!file.Exists)
        {
            return null;
        }

        var khoa = KhoaTepNoiDung + ten;
        if (cache.TryGetValue(khoa, out BanTep<string>? coSan) && coSan!.Khop(file))
        {
            return coSan.NoiDung;
        }

        var noiDung = await DocFileAsync(file, cancellationToken);
        cache.Set(khoa, new BanTep<string>(file.LastModified, file.Length, noiDung));

        return noiDung;
    }

    private static async Task<string> DocFileAsync(IFileInfo file, CancellationToken cancellationToken)
    {
        await using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream, Encoding.UTF8);

        return await reader.ReadToEndAsync(cancellationToken);
    }

    private sealed record BanTep<T>(DateTimeOffset Sua, long Dai, T? NoiDung)
    {
        public bool Khop(IFileInfo file) => Sua == file.LastModified && Dai == file.Length;
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Không lấy được dữ liệu đặc tả trang từ DB ({LoaiLoi}); trả khối mặc định.")]
    private static partial void LogLoiDacTa(ILogger logger, string loaiLoi);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Không chèn được dữ liệu đặc tả vào trang ({LoaiLoi}); trả index.html nguyên bản.")]
    private static partial void LogLoiChen(ILogger logger, string loaiLoi);

    [LoggerMessage(Level = LogLevel.Warning, Message = "dac-ta-trang.json không đọc được; trả index.html nguyên bản.")]
    private static partial void LogJsonHong(ILogger logger);

    /// <summary>Cấu trúc <c>dac-ta-trang.json</c> (F08 plan §3.2). Khoá <c>trang</c> là đường dẫn, vd. "/thu-tuc".</summary>
    private sealed class DacTaFile
    {
        public string MauTieuDe { get; set; } = string.Empty;

        public TrangDacTa? KhongTimThay { get; set; }

        public Dictionary<string, TrangDacTa?>? Trang { get; set; } = [];

        /// <summary>Bản đã lọc của <see cref="Trang"/>: khoá không phân biệt hoa thường, không có giá trị null.</summary>
        [System.Text.Json.Serialization.JsonIgnore]
        public Dictionary<string, TrangDacTa> BangTrang { get; set; } = [];
    }

    private sealed class TrangDacTa
    {
        // null trong file → chuỗi rỗng.
        public string Ten { get; set => field = value ?? string.Empty; } = string.Empty;

        public string MoTa { get; set => field = value ?? string.Empty; } = string.Empty;
    }
}
