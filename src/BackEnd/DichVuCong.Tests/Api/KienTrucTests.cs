using System.Reflection;
using System.Text.RegularExpressions;
using DichVuCong.Api.Features.Chatbot;
using DichVuCong.Data;

namespace DichVuCong.Tests.Api;

/// <summary>Plan F00 §9.4 R1, §9.10: feature đọc dữ liệu qua <c>INguonDuLieu</c>, không qua <c>AppDbContext</c>.</summary>
public sealed partial class KienTrucTests
{
    private const BindingFlags MoiThanhVien =
        BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.DeclaredOnly;

    // Ngoài nơi đăng ký nguồn PostgreSql (NguonDuLieuExtensions), chỉ kho PostgreSql của trợ lý được dùng AppDbContext.
    private static readonly string[] TepDuocDung =
    [
        "Common/Hosting/NguonDuLieuExtensions.cs",
        "Features/Chatbot/KhoCauChuaTraLoiPostgreSql.cs",
    ];

    private static bool LaAppDbContext(Type? kieu)
    {
        while (kieu is not null && (kieu.HasElementType || kieu.IsGenericType))
        {
            if (kieu.IsGenericType && kieu.GetGenericArguments().Any(LaAppDbContext))
            {
                return true;
            }

            kieu = kieu.HasElementType ? kieu.GetElementType() : null;
        }

        return kieu == typeof(AppDbContext);
    }

    private static IEnumerable<Type> KieuTrongApi() =>
        typeof(Program).Assembly.GetTypes().Where(t => !Attribute.IsDefined(t, typeof(System.Runtime.CompilerServices.CompilerGeneratedAttribute)));

    [Fact]
    public void Khong_type_nao_trong_Api_nhan_AppDbContext_qua_constructor_tru_kho_PostgreSql()
    {
        var vipham = KieuTrongApi()
            .Where(t => t != typeof(KhoCauChuaTraLoiPostgreSql))
            .Where(t => t.GetConstructors(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance)
                .Any(c => c.GetParameters().Any(p => LaAppDbContext(p.ParameterType))))
            .Select(t => t.FullName)
            .ToArray();

        Assert.Empty(vipham);
    }

    [Fact]
    public void Chi_kho_PostgreSql_nhan_AppDbContext_va_dung_la_kho_do()
    {
        var kho = typeof(KhoCauChuaTraLoiPostgreSql);

        Assert.Contains(kho.GetConstructors(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance),
            c => c.GetParameters().Any(p => LaAppDbContext(p.ParameterType)));
    }

    [Fact]
    public void Khong_type_nao_trong_Api_giu_AppDbContext_o_truong_thuoc_tinh_hay_chu_ky_ham_tru_kho_PostgreSql()
    {
        var vipham = new List<string>();
        foreach (var kieu in KieuTrongApi().Where(t => t != typeof(KhoCauChuaTraLoiPostgreSql)))
        {
            vipham.AddRange(kieu.GetFields(MoiThanhVien).Where(f => LaAppDbContext(f.FieldType)).Select(f => $"{kieu.FullName}.{f.Name}"));
            vipham.AddRange(kieu.GetProperties(MoiThanhVien).Where(p => LaAppDbContext(p.PropertyType)).Select(p => $"{kieu.FullName}.{p.Name}"));
            vipham.AddRange(kieu.GetMethods(MoiThanhVien)
                .Where(m => LaAppDbContext(m.ReturnType) || m.GetParameters().Any(p => LaAppDbContext(p.ParameterType)))
                .Select(m => $"{kieu.FullName}.{m.Name}"));
        }

        Assert.Empty(vipham);
    }

    [Fact]
    public void Ma_nguon_cua_Api_chi_nhac_AppDbContext_o_noi_dang_ky_nguon_PostgreSql_va_kho_PostgreSql()
    {
        var thuMucApi = TimThuMucApi();
        var vipham = new List<string>();
        foreach (var tep in Directory.EnumerateFiles(thuMucApi, "*.cs", SearchOption.AllDirectories))
        {
            var tuongDoi = Path.GetRelativePath(thuMucApi, tep).Replace('\\', '/');
            if (tuongDoi.StartsWith("obj/", StringComparison.Ordinal) || tuongDoi.StartsWith("bin/", StringComparison.Ordinal)
                || TepDuocDung.Contains(tuongDoi, StringComparer.Ordinal))
            {
                continue;
            }

            // Bỏ dòng chú thích: nhắc tên trong tài liệu không phải là dùng.
            var dongCode = File.ReadLines(tep).Where(d => !d.TrimStart().StartsWith("//", StringComparison.Ordinal));
            if (dongCode.Any(d => TuAppDbContext().IsMatch(d)))
            {
                vipham.Add(tuongDoi);
            }
        }

        Assert.Empty(vipham);
    }

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

    [GeneratedRegex(@"\bAppDbContext\b")]
    private static partial Regex TuAppDbContext();
}
