using System.Text.RegularExpressions;

namespace DichVuCong.Tests.Data.DuLieu;

/// <summary>
/// Plan F00 §9.4 R4: trong <c>Features/</c> không dùng <c>StartsWith</c>/<c>EndsWith</c>, hay <c>Contains</c> kèm
/// <c>StringComparison</c>/<c>StringComparer</c>/<c>CultureInfo</c>: so sánh chuỗi theo văn hoá khác nhau giữa EF (SQL) và LINQ trên đối tượng.
/// Quét văn bản. Ngoại lệ (không phải biểu thức truy vấn) phải ghi chú <c>// R4-ngoai-le: lý do</c> ở cùng dòng hoặc dòng ngay trên.
/// </summary>
public sealed partial class QuyTacTruyVanTests
{
    private const string DauNgoaiLe = "R4-ngoai-le:";

    [Fact]
    public void Features_khong_dung_so_sanh_chuoi_theo_van_hoa_trong_truy_van()
    {
        var thuMucFeatures = Path.Combine(TimThuMucApi(), "Features");
        var vipham = new List<string>();

        foreach (var tep in Directory.EnumerateFiles(thuMucFeatures, "*.cs", SearchOption.AllDirectories))
        {
            var dong = File.ReadAllLines(tep);
            for (var i = 0; i < dong.Length; i++)
            {
                var ma = dong[i].TrimStart();
                if (ma.StartsWith("//", StringComparison.Ordinal) || !HamCamDung().IsMatch(dong[i]))
                {
                    continue;
                }

                var coNgoaiLe = dong[i].Contains(DauNgoaiLe, StringComparison.Ordinal)
                    || (i > 0 && dong[i - 1].Contains(DauNgoaiLe, StringComparison.Ordinal));
                if (!coNgoaiLe)
                {
                    vipham.Add($"{Path.GetRelativePath(thuMucFeatures, tep).Replace(Path.DirectorySeparatorChar, '/')}:{i + 1}: {ma}");
                }
            }
        }

        Assert.Empty(vipham);
    }

    [Theory]
    [InlineData("q.Where(x => x.Ten.StartsWith(t))", true)]
    [InlineData("q.Where(x => x.Ten.EndsWith(t, StringComparison.Ordinal))", true)]
    [InlineData("q.Where(x => x.Ten.Contains(t, StringComparison.OrdinalIgnoreCase))", true)]
    [InlineData("q.Where(x => x.Ten.Contains(t, StringComparer.Ordinal))", true)]
    [InlineData("q.Where(x => x.TenTimKiem.Contains(t))", false)]
    [InlineData("q.Where(x => ma.Contains(x.Ma))", false)]
    public void Bo_quet_nhan_dung_ham_bi_cam(string dong, bool biCam)
        => Assert.Equal(biCam, HamCamDung().IsMatch(dong));

    private static string TimThuMucApi()
    {
        for (var thuMuc = new DirectoryInfo(AppContext.BaseDirectory); thuMuc is not null; thuMuc = thuMuc.Parent)
        {
            var api = Path.Combine(thuMuc.FullName, "DichVuCong.Api", "DichVuCong.Api.csproj");
            if (File.Exists(api))
            {
                return Path.GetDirectoryName(api)!;
            }
        }

        throw new InvalidOperationException("Không thấy thư mục DichVuCong.Api.");
    }

    [GeneratedRegex(@"\.(StartsWith|EndsWith)\s*\(|\.Contains\s*\([^)]*(StringComparison|StringComparer|CultureInfo|ignoreCase)")]
    private static partial Regex HamCamDung();
}
