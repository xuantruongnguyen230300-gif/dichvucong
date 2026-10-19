namespace DichVuCong.Import.KiemTra;

/// <summary>Một dòng lỗi. <paramref name="Dong"/> là số dòng Excel; null với lỗi cấu trúc (theo sheet).</summary>
internal sealed record LoiDong(string Sheet, int? Dong, string LyDo);

/// <summary>Cảnh báo: in ra nhưng vẫn nhập.</summary>
internal sealed record CanhBao(string NoiDung);

/// <summary>Kết quả kiểm một loại dữ liệu. <see cref="DuLieu"/> luôn có, nhưng chỉ dùng để ghi khi <see cref="HopLe"/>.</summary>
internal sealed record KetQuaKiemTra<T>(T DuLieu, IReadOnlyList<LoiDong> Loi, IReadOnlyList<CanhBao> CanhBao)
{
    public bool HopLe => Loi.Count == 0;
}

/// <summary>Gom mọi lỗi và cảnh báo trong lúc kiểm, không dừng ở lỗi đầu tiên.</summary>
internal sealed class BoGomLoi
{
    private readonly List<LoiDong> _loi = [];
    private readonly List<CanhBao> _canhBao = [];

    public IReadOnlyList<LoiDong> Loi => _loi;

    public IReadOnlyList<CanhBao> CanhBao => _canhBao;

    public void Them(string sheet, int? dong, string lyDo) => _loi.Add(new LoiDong(sheet, dong, lyDo));

    /// <summary>Đẩy lỗi của một dòng (nếu có) thành đúng một <see cref="LoiDong"/>.</summary>
    public void Them(Excel.DongDoc dong)
    {
        ArgumentNullException.ThrowIfNull(dong);
        if (dong.LyDo.Count > 0)
        {
            _loi.Add(new LoiDong(dong.Sheet, dong.So, string.Join("; ", dong.LyDo)));
        }
    }

    public void ThemCanhBao(string noiDung) => _canhBao.Add(new CanhBao(noiDung));

    public KetQuaKiemTra<T> Xong<T>(T duLieu) => new(duLieu, _loi.ToArray(), _canhBao.ToArray());
}
