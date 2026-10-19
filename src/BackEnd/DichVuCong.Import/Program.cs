using System.Text;
using DichVuCong.Data;
using DichVuCong.Import;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// Không dùng câu lệnh cấp cao nhất: lớp "Program" tự sinh sẽ trùng với "Program" của DichVuCong.Api
// trong project Tests, nơi cả hai cùng được tham chiếu.
internal static class ChuongTrinhNhap
{
    private static async Task<int> Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;

        // Môi trường Development (launchSettings.json) tự nạp user-secrets, đứng trước biến môi trường.
        // Không truyền args cho host: tham số dòng lệnh là lệnh của công cụ, không phải cấu hình.
        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            ContentRootPath = AppContext.BaseDirectory,
        });

        var chuoiKetNoi = builder.Configuration.GetConnectionString("DichVuCong");
        if (!string.IsNullOrWhiteSpace(chuoiKetNoi))
        {
            builder.Services.AddDichVuCongData(chuoiKetNoi);
        }

        builder.Services.AddSingleton(TimeProvider.System);

        using var host = builder.Build();
        using var huy = new CancellationTokenSource();

        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            huy.Cancel();
        };

        return await UngDung.ChayAsync(args, host.Services, Console.Out, Console.Error, huy.Token);
    }
}
