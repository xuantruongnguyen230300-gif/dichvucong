using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;
using DichVuCong.Data.DuLieu;
using DichVuCong.Data.Entities;
using Microsoft.Extensions.DependencyInjection;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Hợp đồng chung của hai kho (F00 plan §9.6): cùng kiểm tra đầu vào, cùng cách báo lỗi (qua <see cref="Task"/>, không ném
/// đồng bộ), cùng cách làm sạch. Mỗi ca chạy trên cả kho Mẫu lẫn kho PostgreSQL (DB giả).
/// </summary>
public sealed class KhoCauChuaTraLoiHopDongTests
{
    private static readonly DateTimeOffset BayGio = new(2026, 10, 12, 8, 0, 0, TimeSpan.Zero);

    public static TheoryData<LoaiNguonDuLieu> CacNguon => new() { LoaiNguonDuLieu.Mau, LoaiNguonDuLieu.PostgreSql };

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    /// <summary>Câu không hợp lệ → loại lỗi mong đợi. Thêm dòng khi gặp câu mới làm hai kho lệch nhau.</summary>
    public static TheoryData<LoaiNguonDuLieu, string?, Type> CauKhongHopLe()
    {
        var data = new TheoryData<LoaiNguonDuLieu, string?, Type>();
        foreach (var nguon in new[] { LoaiNguonDuLieu.Mau, LoaiNguonDuLieu.PostgreSql })
        {
            data.Add(nguon, null, typeof(ArgumentNullException));
            data.Add(nguon, string.Empty, typeof(ArgumentException));
            data.Add(nguon, "   ", typeof(ArgumentException));
            data.Add(nguon, "\0", typeof(ArgumentException));
            data.Add(nguon, " \0 \0 ", typeof(ArgumentException));
            data.Add(nguon, new string((char)0x200B, 3), typeof(ArgumentException));
            data.Add(nguon, new string('a', CauChuaTraLoi.DoDaiToiDa + 1), typeof(ArgumentOutOfRangeException));
            data.Add(nguon, new string('a', CauChuaTraLoi.DoDaiToiDa) + "\0\0 x", typeof(ArgumentOutOfRangeException));
        }

        return data;
    }

    [Theory]
    [MemberData(nameof(CauKhongHopLe))]
    public async Task Cau_khong_hop_le_tra_Task_loi_dung_loai_khong_nem_dong_bo(LoaiNguonDuLieu nguon, string? cau, Type loaiLoi)
    {
        await using var dichVu = TaoDichVu(nguon, out var db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        // Gọi không await: nếu kho ném đồng bộ thì dòng này đã ném, test hỏng.
        var tac = kho.GhiAsync(cau!, Ct);

        var loi = await Record.ExceptionAsync(() => tac);
        Assert.NotNull(loi);
        Assert.Equal(loaiLoi, loi.GetType());
        Assert.Empty(db.CacLenh);
    }

    /// <summary>Đúng 500 ký tự sau khi bỏ NUL thì được ghi; NUL không tính vào độ dài.</summary>
    [Theory]
    [MemberData(nameof(CacNguon))]
    public async Task Cau_500_ky_tu_sau_khi_bo_NUL_duoc_ghi(LoaiNguonDuLieu nguon)
    {
        await using var dichVu = TaoDichVu(nguon, out var db);
        await using var scope = dichVu.CreateAsyncScope();
        var kho = scope.ServiceProvider.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync(new string('a', CauChuaTraLoi.DoDaiToiDa) + "\0\0", Ct);

        Assert.Equal(1, nguon == LoaiNguonDuLieu.Mau ? ((KhoCauChuaTraLoiMau)kho).ChupCacDong().Count : db.CacLenh.Count);
    }

    /// <summary>NUL bị bỏ khỏi nội dung lẫn khoá gộp: "khai\0 sinh" cùng một dòng với "khai sinh".</summary>
    [Fact]
    public async Task Kho_Mau_bo_NUL_va_gop_voi_cau_khong_co_NUL()
    {
        await using var dichVu = TaoDichVu(LoaiNguonDuLieu.Mau, out _);
        var kho = (KhoCauChuaTraLoiMau)dichVu.GetRequiredService<IKhoCauChuaTraLoi>();

        await kho.GhiAsync("Khai\0 sinh", Ct);
        await kho.GhiAsync("khai sinh", Ct);

        var dong = Assert.Single(kho.ChupCacDong());
        Assert.Equal("Khai sinh", dong.NoiDung);
        Assert.Equal("khai sinh", dong.KhoaGop);
        Assert.Equal(2, dong.SoLanGap);
    }

    /// <summary>Kho Mẫu: token đã huỷ → Task bị huỷ, không ném đồng bộ, không ghi.</summary>
    [Fact]
    public async Task Kho_Mau_da_huy_tra_Task_bi_huy_khong_ghi()
    {
        await using var dichVu = TaoDichVu(LoaiNguonDuLieu.Mau, out _);
        var kho = (KhoCauChuaTraLoiMau)dichVu.GetRequiredService<IKhoCauChuaTraLoi>();
        using var cts = new CancellationTokenSource();
        await cts.CancelAsync();

        var ghi = kho.GhiAsync("cau", cts.Token);
        var xoa = kho.XoaQuaHanAsync(BayGio, cts.Token);

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => ghi);
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => xoa);
        Assert.Empty(kho.ChupCacDong());
    }

    private static ServiceProvider TaoDichVu(LoaiNguonDuLieu nguon, out DbGiaLap db)
    {
        var dbGiaLap = new DbGiaLap();
        db = dbGiaLap;
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<TimeProvider>(new DongHoGia(BayGio));
        if (nguon == LoaiNguonDuLieu.PostgreSql)
        {
            services.AddDichVuCongData("Host=khong-co-may-nay;Database=x;Username=x;Password=x");
            services.ConfigureDbContext<AppDbContext>(o => o.AddInterceptors(dbGiaLap), ServiceLifetime.Singleton);
            services.AddSingleton(CauHinhGia.Tu());
        }

        services.AddChatbot(nguon);
        services.ThemPhuThuocTroLy();

        return services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
    }
}
