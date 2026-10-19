using Microsoft.Extensions.Configuration;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary><see cref="IConfiguration"/> trong bộ nhớ cho test (host thật luôn đăng ký sẵn).</summary>
internal static class CauHinhGia
{
    public static IConfiguration Tu(params (string Khoa, string Gia)[] cacMuc) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(cacMuc.Select(m => new KeyValuePair<string, string?>(m.Khoa, m.Gia)))
            .Build();
}
