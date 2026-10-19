using System.Diagnostics;
using DichVuCong.Data.DuLieu;

namespace DichVuCong.Tests.Api.Chatbot;

/// <summary>
/// Chốt chặn thô cho AC-6 (p95 ≤ 300 ms với ~1.000 thủ tục): số đo chính thức do tester ở T17 trên bản Release.
/// Ở đây chỉ bắt hồi quy lớn — ngưỡng rộng gấp hàng chục lần số đo thực (trung bình vài mili giây).
/// </summary>
public sealed class TroLyDoNhanhTests
{
    [Fact]
    public async Task MotNghin_ThuTuc_TraLoiNhanh_VaChiMucDungMotLan()
    {
        var tep = TroLyThu.TaoLon(1000);
        var nguon = new NguonDuLieuMau(tep);
        using var h = TroLyHarness.Dung(nguon);
        await h.HoiAsync("khai sinh");
        var cacCau = TroLyBang.Cac.Where(c => c.Du == DuLieuThu.Nen).Select(c => (c.Hoi, c.NguCanh)).ToArray();
        var thoiGian = new List<double>();

        for (var vong = 0; vong < 3; vong++)
        {
            foreach (var (hoi, ngCanh) in cacCau)
            {
                var batDau = Stopwatch.GetTimestamp();
                await h.HoiAsync(hoi, ngCanh);
                thoiGian.Add(Stopwatch.GetElapsedTime(batDau).TotalMilliseconds);
            }
        }

        thoiGian.Sort();
        Assert.Equal(1000, tep.ThuTuc.Count);
        Assert.Equal(1, h.KhoChiMuc.SoLanDung);
        Assert.True(thoiGian[(int)(thoiGian.Count * 0.95)] < 150, $"p95 = {thoiGian[(int)(thoiGian.Count * 0.95)]:F1} ms");
    }
}
