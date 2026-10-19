namespace DichVuCong.Api.Features.Chatbot.TimKiem;

/// <summary>Một từ của truy vấn; <see cref="DaSua"/> true nếu là kết quả sửa lỗi gõ (chỉ được tính một phần điểm).</summary>
internal readonly record struct TuTruyVan(string Tu, bool DaSua);

/// <summary>Thủ tục trong chỉ mục. <see cref="TapTu"/>: các từ chấm điểm (đã bỏ từ đệm, "thu", "tuc"), không trùng, theo thứ tự Ordinal.</summary>
internal sealed class ThuTucChiMuc(string ma, string? maDvc, ThuTucNganDto dto, string linhVucMa, string[] tapTu, int thuTu)
{
    public string Ma { get; } = ma;

    public string? MaDvc { get; } = maDvc;

    public ThuTucNganDto Dto { get; } = dto;

    public string LinhVucMa { get; } = linhVucMa;

    public string[] TapTu { get; } = tapTu;

    public int ThuTu { get; } = thuTu;

    /// <summary>Tổng <c>idf</c> của <see cref="TapTu"/> (mẫu số của hệ số Dice).</summary>
    public double TongIdf { get; set; }
}

internal sealed record LinhVucChiMuc(string Ma, string Ten, string[] Tu);

internal sealed record ChuDeChiMuc(int ThuTu, string TenHienThi, string TenLinhVuc, string LinhVucMa);

/// <summary>Một cách hỏi của câu hỏi mẫu. <see cref="TapTu"/> đã bỏ từ đệm chung (không bỏ "thu", "tuc").</summary>
internal sealed class CachHoiChiMuc(int cauThuTu, int thuTu, string[] tapTu)
{
    public int CauThuTu { get; } = cauThuTu;

    public int ThuTu { get; } = thuTu;

    public string[] TapTu { get; } = tapTu;

    public double TongIdf { get; set; }
}

/// <summary>Câu hỏi mẫu: có <see cref="TraLoi"/> hoặc <see cref="MucTrungTam"/> (một trong hai).</summary>
internal sealed record MauChiMuc(int ThuTu, string? TraLoi, string? MucTrungTam, string[] MaThuTuc);

/// <summary>
/// Chỉ mục tìm kiếm trong bộ nhớ (plan F06 §4.2), dựng một lần cho mỗi phiên bản dữ liệu và chỉ đọc sau đó nên dùng chung được
/// giữa các yêu cầu. Mọi thứ bên trong sắp xếp xác định (theo <c>ThuTu</c> rồi <c>Ordinal</c>), không phụ thuộc thứ tự nguồn trả về.
/// </summary>
internal sealed class ChiMucTroLy
{
    private readonly Dictionary<string, ThuTucChiMuc> _theoMa;
    private readonly Dictionary<string, ThuTucChiMuc> _theoMaDvc;
    private readonly Dictionary<string, List<ThuTucChiMuc>> _theoLinhVuc;
    private readonly Dictionary<string, string> _tenLinhVuc;
    private readonly Dictionary<string, int[]> _chiMucNguocThuTuc;
    private readonly Dictionary<string, int[]> _chiMucNguocMau;
    private readonly double _idfLa;
    private readonly double _idfLaMau;

    public ChiMucTroLy(long phienBan, DuLieuChiMuc dl)
    {
        PhienBan = phienBan;
        ThuTucs = dl.ThuTucs;
        LinhVucs = dl.LinhVucs;
        CachHois = dl.CachHois;
        Maus = dl.Maus;
        ChuDes = dl.ChuDes;
        VietTat = dl.VietTat;
        DongNghia = dl.DongNghia;

        _theoMa = new(StringComparer.OrdinalIgnoreCase);
        _theoMaDvc = new(StringComparer.OrdinalIgnoreCase);
        _theoLinhVuc = new(StringComparer.Ordinal);
        foreach (var t in ThuTucs)
        {
            _theoMa.TryAdd(t.Ma, t);
            if (!string.IsNullOrWhiteSpace(t.MaDvc))
            {
                _theoMaDvc.TryAdd(t.MaDvc, t);
            }

            if (!_theoLinhVuc.TryGetValue(t.LinhVucMa, out var ds))
            {
                ds = [];
                _theoLinhVuc.Add(t.LinhVucMa, ds);
            }

            ds.Add(t);
        }

        _tenLinhVuc = LinhVucs.ToDictionary(l => l.Ma, l => l.Ten, StringComparer.Ordinal);
        _chiMucNguocThuTuc = DungChiMucNguoc(ThuTucs.Select(t => t.TapTu));
        _chiMucNguocMau = DungChiMucNguoc(CachHois.Select(c => c.TapTu));
        _idfLa = 0.5 * Math.Log(1 + ThuTucs.Count);
        _idfLaMau = 0.5 * Math.Log(1 + CachHois.Count);

        foreach (var t in ThuTucs)
        {
            t.TongIdf = t.TapTu.Sum(Idf);
        }

        foreach (var c in CachHois)
        {
            c.TongIdf = c.TapTu.Sum(IdfMau);
        }

        TuDien = new TuDien(dl.TuTrongDuLieu, tu => _chiMucNguocThuTuc.TryGetValue(tu, out var p) ? p.Length : 0);
    }

    public long PhienBan { get; }

    public IReadOnlyList<ThuTucChiMuc> ThuTucs { get; }

    public IReadOnlyList<LinhVucChiMuc> LinhVucs { get; }

    public IReadOnlyList<CachHoiChiMuc> CachHois { get; }

    public IReadOnlyDictionary<int, MauChiMuc> Maus { get; }

    public IReadOnlyList<ChuDeChiMuc> ChuDes { get; }

    public BangThayDay VietTat { get; }

    public BangThayDay DongNghia { get; }

    public TuDien TuDien { get; }

    /// <summary>Thủ tục theo mã (<c>Ma</c>), không phân biệt hoa thường.</summary>
    public ThuTucChiMuc? TheoMa(string? ma) => ma is not null && _theoMa.TryGetValue(ma, out var t) ? t : null;

    /// <summary>Thủ tục theo <c>Ma</c>, không có thì theo <c>MaDvc</c>.</summary>
    public ThuTucChiMuc? TheoMaHoacMaDvc(string ma)
        => _theoMa.TryGetValue(ma, out var t) || _theoMaDvc.TryGetValue(ma, out t) ? t : null;

    /// <summary>Thủ tục của một lĩnh vực theo mã lĩnh vực, theo <c>ThuTu</c>.</summary>
    public IReadOnlyList<ThuTucChiMuc> CuaLinhVuc(string linhVucMa)
        => _theoLinhVuc.TryGetValue(linhVucMa, out var ds) ? ds : [];

    public string TenLinhVuc(string linhVucMa) => _tenLinhVuc.GetValueOrDefault(linhVucMa, string.Empty);

    /// <summary>Vị trí (trong <see cref="ThuTucs"/> không có, nên trả luôn đối tượng) các thủ tục có từ <paramref name="tu"/> trong tập từ chấm điểm.</summary>
    public IReadOnlyList<ThuTucChiMuc> ThuTucCoTu(string tu)
        => _chiMucNguocThuTuc.TryGetValue(tu, out var viTri) ? [.. viTri.Select(i => ThuTucs[i])] : [];

    public IReadOnlyList<CachHoiChiMuc> CachHoiCoTu(string tu)
        => _chiMucNguocMau.TryGetValue(tu, out var viTri) ? [.. viTri.Select(i => CachHois[i])] : [];

    /// <summary><c>ln(1 + N/df)</c>; từ không thuộc tập từ chấm điểm của thủ tục nào: <c>0,5 × ln(1 + N)</c>.</summary>
    public double Idf(string tu)
        => _chiMucNguocThuTuc.TryGetValue(tu, out var p) ? Math.Log(1 + ((double)ThuTucs.Count / p.Length)) : _idfLa;

    /// <summary>Như <see cref="Idf"/> nhưng trên kho cách hỏi mẫu (một cách hỏi là một tài liệu).</summary>
    public double IdfMau(string tu)
        => _chiMucNguocMau.TryGetValue(tu, out var p) ? Math.Log(1 + ((double)CachHois.Count / p.Length)) : _idfLaMau;

    private static Dictionary<string, int[]> DungChiMucNguoc(IEnumerable<string[]> cacTapTu)
    {
        var ketQua = new Dictionary<string, List<int>>(StringComparer.Ordinal);
        var viTri = 0;
        foreach (var tapTu in cacTapTu)
        {
            foreach (var tu in tapTu)
            {
                if (!ketQua.TryGetValue(tu, out var ds))
                {
                    ds = [];
                    ketQua.Add(tu, ds);
                }

                ds.Add(viTri);
            }

            viTri++;
        }

        return ketQua.ToDictionary(p => p.Key, p => p.Value.ToArray(), StringComparer.Ordinal);
    }
}
