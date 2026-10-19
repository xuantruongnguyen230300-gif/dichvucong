using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using DichVuCong.Data.Entities;
using LanNhapDb = DichVuCong.Data.Entities.LanNhap;

namespace DichVuCong.Data.Mau;

/// <summary>
/// File dữ liệu mẫu (plan F00 §9.5): các bảng nhập của F01 chép nguyên, kể cả cột <c>*TimKiem</c>.
/// Không có <c>lan_nhap</c> và <c>cau_chua_tra_loi</c>: <see cref="LanNhap"/> do bộ đọc tạo.
/// Thứ tự thuộc tính trong lớp này là thứ tự trong file.
/// </summary>
/// <remarks>
/// Mọi lỗi đọc, ghi, kiểm đều là <see cref="InvalidDataException"/> với lý do ngắn; thông báo không chép nội dung file.
/// Đối tượng sau khi đọc được dùng chung cho mọi yêu cầu của nguồn Mẫu: không sửa (plan §9.4 R2).
/// </remarks>
public sealed class TepDuLieuMau
{
    /// <summary>Phiên bản định dạng mà mã này hiểu. Bộ đọc chỉ nhận đúng phiên bản này.</summary>
    public const int PhienBanDinhDang = 1;

    /// <summary>Tên file khi ghi ra, và <c>TenFile</c> của các dòng <see cref="LanNhap"/>.</summary>
    public const string TenFile = "du-lieu-mau.json";

    /// <summary><c>LogicalName</c> của tài nguyên nhúng trong <c>DichVuCong.Data.dll</c>. Khai ở <c>DichVuCong.Data.csproj</c> (T27).</summary>
    public const string TenTaiNguyen = "DichVuCong.Data.Mau.du-lieu-mau.json";

    private static ReadOnlySpan<byte> Bom => [0xEF, 0xBB, 0xBF];

    private static readonly JsonSerializerOptions TuyChonGhi = TaoTuyChon(khiDoc: false);
    private static readonly JsonSerializerOptions TuyChonDoc = TaoTuyChon(khiDoc: true);
    private static readonly Lazy<TepDuLieuMau> _nhung = new(() => DocTaiNguyen(typeof(TepDuLieuMau).Assembly, TenTaiNguyen));

    private readonly Lock _khoa = new();
    private volatile bool _daNoi;
    private IReadOnlyList<CauHoiMauCachHoi> _cachHoi = [];
    private IReadOnlyList<LanNhapDb> _lanNhap = [];
    private IReadOnlyList<TrungTam> _trungTams = [];

    [JsonRequired]
    public int PhienBan { get; set; } = PhienBanDinhDang;

    /// <summary>Thời điểm sinh file. Là <c>ThoiDiem</c> của cả bốn dòng <see cref="LanNhap"/>, nên là phiên bản dữ liệu (plan §9.8).</summary>
    [JsonRequired]
    public DateTimeOffset ThoiDiem { get; set; }

    public string GhiChu { get; set; } = string.Empty;

    public List<LinhVuc> LinhVuc { get; } = [];

    public List<ThuTuc> ThuTuc { get; } = [];

    public List<PhanCongLinhVuc> PhanCongLinhVuc { get; } = [];

    public List<NhanSu> NhanSu { get; } = [];

    /// <summary>Null là chưa có thông tin Trung tâm (bảng <c>trung_tam</c> rỗng).</summary>
    public TrungTam? TrungTam { get; set; }

    public List<GioLamViec> GioLamViec { get; } = [];

    public List<LienKet> LienKet { get; } = [];

    public List<ODichVu> ODichVu { get; } = [];

    /// <summary>Mỗi câu mang theo các cách hỏi của nó (<see cref="CauHoiMau.CachHoi"/>).</summary>
    public List<CauHoiMau> CauHoiMau { get; } = [];

    public List<ChuDeGoiY> ChuDeGoiY { get; } = [];

    public List<TuDongNghia> TuDongNghia { get; } = [];

    public List<VietTat> VietTat { get; } = [];

    /// <summary>Mọi cách hỏi của mọi câu, theo (câu, thứ tự). Có sau <see cref="Doc"/> hoặc <see cref="KiemTraVaNoi"/>.</summary>
    [JsonIgnore]
    public IReadOnlyList<CauHoiMauCachHoi> CauHoiMauCachHoi => _cachHoi;

    /// <summary>Bốn dòng, <see cref="ThoiDiem"/> và <see cref="TenFile"/> như nhau. Có sau <see cref="Doc"/> hoặc <see cref="KiemTraVaNoi"/>.</summary>
    [JsonIgnore]
    public IReadOnlyList<LanNhapDb> LanNhap => _lanNhap;

    /// <summary>Không hoặc một dòng. Có sau <see cref="Doc"/> hoặc <see cref="KiemTraVaNoi"/>.</summary>
    [JsonIgnore]
    public IReadOnlyList<TrungTam> TrungTams => _trungTams;

    /// <summary>File nhúng trong <c>DichVuCong.Data.dll</c>, nạp một lần mỗi tiến trình.</summary>
    /// <exception cref="InvalidDataException">Chưa có tài nguyên nhúng, hoặc file hỏng.</exception>
    public static TepDuLieuMau Nhung => _nhung.Value;

    /// <summary>Đọc file, kiểm, nối lại navigation.</summary>
    /// <exception cref="InvalidDataException">Phiên bản lạ, thuộc tính lạ, null sai chỗ, khoá trùng, khoá ngoại thiếu, JSON hỏng.</exception>
    public static TepDuLieuMau Doc(Stream stream)
    {
        ArgumentNullException.ThrowIfNull(stream);

        using var boNho = new MemoryStream();
        stream.CopyTo(boNho);
        var json = boNho.GetBuffer().AsSpan(0, (int)boNho.Length);
        if (json.StartsWith(Bom))
        {
            json = json[3..];
        }

        // Kiểm phiên bản trước: file bản mới có thể có thuộc tính mà bản này chưa biết, khi đó lỗi "thuộc tính lạ" che mất lỗi thật.
        int? phienBan;
        TepDuLieuMau? tep;
        try
        {
            phienBan = DocPhienBan(json);
            tep = phienBan is null or PhienBanDinhDang ? JsonSerializer.Deserialize<TepDuLieuMau>(json, TuyChonDoc) : null;
        }
        catch (JsonException ex)
        {
            throw new InvalidDataException($"Tệp dữ liệu mẫu không đọc được. {MoTaLoi(ex)}", ex);
        }
        catch (InvalidOperationException ex)
        {
            // Populate gặp null ở danh sách chỉ có get (vd. "linhVuc": null).
            throw new InvalidDataException($"Tệp dữ liệu mẫu không đọc được. {ex.Message}", ex);
        }

        if (phienBan is not null and not PhienBanDinhDang)
        {
            throw LoiPhienBan(phienBan.Value);
        }

        if (tep is null)
        {
            throw Loi("nội dung là null, cần một đối tượng.");
        }

        tep.KiemTraVaNoi();
        return tep;
    }

    /// <summary>Thông báo của System.Text.Json kèm vị trí khi nó chưa ghi sẵn. Không chứa giá trị trong file.</summary>
    private static string MoTaLoi(JsonException ex)
        => ex.Path is { Length: > 0 } duongDan && !ex.Message.Contains("Path:", StringComparison.Ordinal)
            ? $"{ex.Message} Path: {duongDan}"
            : ex.Message;

    /// <summary>Đọc tài nguyên nhúng tên <paramref name="ten"/> của <paramref name="assembly"/>.</summary>
    public static TepDuLieuMau DocTaiNguyen(Assembly assembly, string ten)
    {
        ArgumentNullException.ThrowIfNull(assembly);
        ArgumentException.ThrowIfNullOrEmpty(ten);

        using var stream = assembly.GetManifestResourceStream(ten)
            ?? throw Loi($"thiếu tài nguyên nhúng '{ten}' trong {assembly.GetName().Name}. Sinh file bằng lệnh xuat-json của DichVuCong.DuLieuMau (plan F00 §9.12).");
        return Doc(stream);
    }

    /// <summary>Kiểm rồi ghi: JSON UTF-8 không BOM, thụt lề 2, xuống dòng LF, kết thúc bằng một LF. Cùng dữ liệu ra cùng từng byte.</summary>
    /// <exception cref="InvalidDataException">Dữ liệu không qua được phép kiểm như khi đọc.</exception>
    public void Ghi(Stream stream)
    {
        ArgumentNullException.ThrowIfNull(stream);

        KiemTra();
        try
        {
            JsonSerializer.Serialize(stream, this, TuyChonGhi);
        }
        catch (JsonException ex)
        {
            throw new InvalidDataException($"Không ghi được tệp dữ liệu mẫu. {MoTaLoi(ex)}", ex);
        }

        stream.WriteByte((byte)'\n');
    }

    /// <summary>
    /// Kiểm rồi nối navigation (<c>ThuTuc.LinhVuc</c>, <c>LinhVuc.ThuTucs</c> theo <c>ThuTu</c>, <c>CauHoiMauCachHoi.CauHoiMau</c>)
    /// và tạo <see cref="LanNhap"/>. <see cref="Doc"/> đã gọi sẵn; gọi cho đối tượng dựng bằng mã. Chạy một lần, an toàn khi gọi từ nhiều luồng.
    /// Sửa danh sách sau khi gọi thì kết quả nối không còn đúng.
    /// </summary>
    public void KiemTraVaNoi()
    {
        if (_daNoi)
        {
            return;
        }

        lock (_khoa)
        {
            if (_daNoi)
            {
                return;
            }

            KiemTra();
            Noi();
            _daNoi = true;
        }
    }

    private static JsonSerializerOptions TaoTuyChon(bool khiDoc) => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        IndentSize = 2,
        NewLine = "\n",
        // Giữ nguyên chữ tiếng Việt, không đổi thành mã thoát.
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        Converters = { new JsonStringEnumConverter(allowIntegerValues: false) },
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        RespectNullableAnnotations = true,
        PreferredObjectCreationHandling = JsonObjectCreationHandling.Populate,
        UnmappedMemberHandling = khiDoc ? JsonUnmappedMemberHandling.Disallow : JsonUnmappedMemberHandling.Skip,
        AllowDuplicateProperties = !khiDoc,
    };

    private static int? DocPhienBan(ReadOnlySpan<byte> json)
    {
        var reader = new Utf8JsonReader(json);
        if (!reader.Read() || reader.TokenType != JsonTokenType.StartObject)
        {
            return null;
        }

        while (reader.Read() && reader.TokenType == JsonTokenType.PropertyName)
        {
            var laPhienBan = reader.ValueTextEquals("phienBan"u8);
            reader.Read();
            if (laPhienBan)
            {
                return reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var so) ? so : null;
            }

            reader.Skip();
        }

        return null;
    }

    private static InvalidDataException Loi(string lyDo) => new($"Tệp dữ liệu mẫu không hợp lệ: {lyDo}");

    private static InvalidDataException LoiPhienBan(int phienBan)
        => Loi($"phiên bản định dạng {phienBan} không được hỗ trợ (mã này đọc phiên bản {PhienBanDinhDang}). Sinh lại file bằng bản mới.");

    private static void KhongTrung<T, TKhoa>(IEnumerable<T> danhSach, Func<T, TKhoa> khoa, string ten)
        where TKhoa : notnull
    {
        var daCo = new HashSet<TKhoa>();
        foreach (var phanTu in danhSach)
        {
            var k = khoa(phanTu);
            if (!daCo.Add(k))
            {
                throw Loi($"khoá trùng ở '{ten}': {k}.");
            }
        }
    }

    // RespectNullableAnnotations không kiểm phần tử của danh sách và mảng, nên kiểm ở đây (null trong "hinhThucNop": [null] sẽ làm hỏng truy vấn).
    private static void KhongCoNull<T>(IEnumerable<T?> danhSach, string ten)
        where T : class
    {
        var viTri = 0;
        foreach (var phanTu in danhSach)
        {
            if (phanTu is null)
            {
                throw Loi($"phần tử null ở '{ten}[{viTri}]', không cho null.");
            }

            viTri++;
        }
    }

    private void KiemPhanTuNull()
    {
        KhongCoNull(LinhVuc, "linhVuc");
        KhongCoNull(ThuTuc, "thuTuc");
        KhongCoNull(PhanCongLinhVuc, "phanCongLinhVuc");
        KhongCoNull(NhanSu, "nhanSu");
        KhongCoNull(GioLamViec, "gioLamViec");
        KhongCoNull(LienKet, "lienKet");
        KhongCoNull(ODichVu, "oDichVu");
        KhongCoNull(CauHoiMau, "cauHoiMau");
        KhongCoNull(ChuDeGoiY, "chuDeGoiY");
        KhongCoNull(TuDongNghia, "tuDongNghia");
        KhongCoNull(VietTat, "vietTat");

        for (var i = 0; i < ThuTuc.Count; i++)
        {
            var t = ThuTuc[i];
            var goc = $"thuTuc[{i}]";
            KhongCoNull(t.HinhThucNop, $"{goc}.hinhThucNop");
            KhongCoNull(t.TrinhTu, $"{goc}.trinhTu");
            KhongCoNull(t.CachThuc, $"{goc}.cachThuc");
            KhongCoNull(t.ThanhPhanHoSo, $"{goc}.thanhPhanHoSo");
            KhongCoNull(t.KetQua, $"{goc}.ketQua");
            KhongCoNull(t.CanCu, $"{goc}.canCu");
        }

        for (var i = 0; i < CauHoiMau.Count; i++)
        {
            var c = CauHoiMau[i];
            KhongCoNull(c.MaThuTuc, $"cauHoiMau[{i}].maThuTuc");
            KhongCoNull(c.CachHoi, $"cauHoiMau[{i}].cachHoi");
        }

        for (var i = 0; i < TuDongNghia.Count; i++)
        {
            KhongCoNull(TuDongNghia[i].CachNoiKhac, $"tuDongNghia[{i}].cachNoiKhac");
        }
    }

    /// <summary>Các ràng buộc DB mà truy vấn dựa vào (khoá chính, chỉ mục duy nhất, khoá ngoại).</summary>
    private void KiemTra()
    {
        if (PhienBan != PhienBanDinhDang)
        {
            throw LoiPhienBan(PhienBan);
        }

        KiemPhanTuNull();

        KhongTrung(LinhVuc, l => l.Ma, "linhVuc.ma");
        KhongTrung(ThuTuc, t => t.Ma, "thuTuc.ma");
        KhongTrung(ThuTuc.Where(t => t.ThuTuThuongGap is not null), t => t.ThuTuThuongGap!.Value, "thuTuc.thuTuThuongGap");
        KhongTrung(PhanCongLinhVuc, p => p.LinhVucMa, "phanCongLinhVuc.linhVucMa");
        KhongTrung(NhanSu, n => n.ThuTu, "nhanSu.thuTu");
        KhongTrung(GioLamViec, g => g.Thu, "gioLamViec.thu");
        KhongTrung(LienKet, l => l.ThuTu, "lienKet.thuTu");
        KhongTrung(ODichVu, o => o.ThuTu, "oDichVu.thuTu");
        KhongTrung(CauHoiMau, c => c.ThuTu, "cauHoiMau.thuTu");
        KhongTrung(ChuDeGoiY, c => c.ThuTu, "chuDeGoiY.thuTu");
        KhongTrung(TuDongNghia, t => t.ThuTu, "tuDongNghia.thuTu");
        KhongTrung(TuDongNghia, t => t.TuTimKiem, "tuDongNghia.tuTimKiem");
        KhongTrung(VietTat, v => v.ThuTu, "vietTat.thuTu");
        KhongTrung(VietTat, v => v.ChuVietTatTimKiem, "vietTat.chuVietTatTimKiem");

        foreach (var cau in CauHoiMau)
        {
            KhongTrung(cau.CachHoi, c => c.ThuTu, $"cauHoiMau[{cau.ThuTu}].cachHoi.thuTu");
        }

        var maLinhVuc = LinhVuc.Select(l => l.Ma).ToHashSet(StringComparer.Ordinal);
        foreach (var thuTuc in ThuTuc.Where(t => !maLinhVuc.Contains(t.LinhVucMa)))
        {
            throw Loi($"thủ tục '{thuTuc.Ma}' có linhVucMa '{thuTuc.LinhVucMa}' không có trong danh sách lĩnh vực.");
        }

        if (TrungTam is { Id: not Entities.TrungTam.IdDuyNhat } trungTam)
        {
            throw Loi($"trungTam.id là {trungTam.Id}, bảng Trung tâm chỉ có một dòng với id {Entities.TrungTam.IdDuyNhat}.");
        }
    }

    private void Noi()
    {
        var linhVucTheoMa = LinhVuc.ToDictionary(l => l.Ma, StringComparer.Ordinal);
        foreach (var linhVuc in LinhVuc)
        {
            linhVuc.ThuTucs.Clear();
        }

        foreach (var thuTuc in ThuTuc.OrderBy(t => t.ThuTu))
        {
            var linhVuc = linhVucTheoMa[thuTuc.LinhVucMa];
            thuTuc.LinhVuc = linhVuc;
            linhVuc.ThuTucs.Add(thuTuc);
        }

        var cachHoi = new List<CauHoiMauCachHoi>();
        foreach (var cau in CauHoiMau.OrderBy(c => c.ThuTu))
        {
            foreach (var cach in cau.CachHoi.OrderBy(c => c.ThuTu))
            {
                cach.CauHoiMauThuTu = cau.ThuTu;
                cach.CauHoiMau = cau;
                cachHoi.Add(cach);
            }
        }

        _cachHoi = cachHoi;
        _lanNhap =
        [
            Dong(LanNhapDb.ThuTuc),
            Dong(LanNhapDb.PhanCong),
            Dong(LanNhapDb.TrungTam),
            Dong(LanNhapDb.TroLy),
        ];
        _trungTams = TrungTam is null ? [] : [TrungTam];
    }

    private LanNhapDb Dong(string loai) => new() { Loai = loai, ThoiDiem = ThoiDiem, TenFile = TenFile };
}
