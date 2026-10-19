using System.Text;
using DichVuCong.Data.Entities;
using DichVuCong.Data.Mau;

namespace DichVuCong.Tests.Data.Mau;

/// <summary>Định dạng file dữ liệu mẫu: khứ hồi giống từng byte, bộ đọc từ chối file sai, nối navigation (plan F00 §9.5, T25).</summary>
public class TepDuLieuMauTests
{
    private static byte[] GhiRa(TepDuLieuMau tep)
    {
        using var luong = new MemoryStream();
        tep.Ghi(luong);
        return luong.ToArray();
    }

    private static TepDuLieuMau DocTu(byte[] byteJson)
    {
        using var luong = new MemoryStream(byteJson);
        return TepDuLieuMau.Doc(luong);
    }

    private static TepDuLieuMau DocTu(string json) => DocTu(Encoding.UTF8.GetBytes(json));

    private static string Chu(byte[] byteJson) => Encoding.UTF8.GetString(byteJson);

    private static InvalidDataException TuChoi(string json) => Assert.Throws<InvalidDataException>(() => DocTu(json));

    // Chèn một đoạn vào trong JSON tối thiểu, sau thoiDiem.
    private static string ThemVaoToiThieu(string phanThem)
        => MauThu.JsonToiThieu[..^1] + "," + phanThem + "}";

    private const string LinhVucHoTich = """{"ma":"ho-tich","ten":"Hộ tịch","tenTimKiem":"ho tich"}""";

    private static string ThuTucJson(string ma = "A", string linhVucMa = "ho-tich", string them = "")
        => $$"""{"ma":"{{ma}}","ten":"Tên","tenTimKiem":"ten","linhVucMa":"{{linhVucMa}}","thuocDanhMucXa":true,"thuocDanhMucTinh":false,"mucDo":"ToanTrinh","coQuanThucHien":null,"yeuCauDieuKien":null,"trangThaiCongBo":null,"thoiHan":null,"phi":null,"hinhThucNop":[],"maDvc":null,"donViTen":null,"donViMa":null,"thuTu":1,"thuTuThuongGap":null,"trinhTu":[],"cachThuc":[],"thanhPhanHoSo":[],"ketQua":[],"canCu":[]{{them}}}""";

    // ---- Khứ hồi ----

    [Fact]
    public void Doc_roi_ghi_lai_giong_tung_byte_bo_dung_ma()
    {
        var dau = GhiRa(MauThu.TuMa());

        var docLai = DocTu(dau);

        Assert.Equal(dau, GhiRa(docLai));
    }

    [Fact]
    public void Doc_roi_ghi_lai_giong_tung_byte_bo_tu_KiemTra_cua_Import()
    {
        var dau = GhiRa(MauThu.TuKiemTraImport());

        var docLai = DocTu(dau);

        Assert.Equal(dau, GhiRa(docLai));
        Assert.Equal(2, docLai.ThuTuc.Count);
        Assert.Equal(2, docLai.CauHoiMau.Count);
        Assert.Equal([1, 2, 3], docLai.CauHoiMau[0].CachHoi.Select(c => c.ThuTu));
    }

    [Fact]
    public void Ghi_hai_lan_cung_du_lieu_ra_cung_byte()
    {
        var tep = MauThu.TuMa();

        Assert.Equal(GhiRa(tep), GhiRa(tep));
        Assert.Equal(GhiRa(MauThu.TuMa()), GhiRa(MauThu.TuMa()));
    }

    [Fact]
    public void Khu_hoi_giu_gia_tri_moi_kieu_cot()
    {
        var tep = DocTu(GhiRa(MauThu.TuMa()));

        var t = tep.ThuTuc.Single(x => x.Ma == "1.001193");
        Assert.Equal(MucDo.ToanTrinh, t.MucDo);
        Assert.Equal(["Trực tuyến", "Bưu chính", "Trực tiếp"], t.HinhThucNop);
        Assert.Equal(1, t.ThuTuThuongGap);
        Assert.Null(tep.ThuTuc.Single(x => x.Ma == "2.000815").ThuTuThuongGap);
        Assert.Equal("Bước 1\nDòng 2", t.TrinhTu[0].NoiDung);
        Assert.Null(t.TrinhTu[0].TruongHop);
        Assert.Equal((1, (int?)null), (t.ThanhPhanHoSo[0].BanChinh, t.ThanhPhanHoSo[0].BanSao));
        Assert.Equal("Thông tư <phí> & lệ phí", t.CanCu[0].TrichYeu);
        Assert.Empty(tep.ThuTuc.Single(x => x.Ma == "2.000815").HinhThucNop);

        Assert.Equal(new TimeOnly(11, 30), tep.GioLamViec[0].SangDen);
        Assert.Null(tep.GioLamViec[1].ChieuTu);
        Assert.Equal(MucTrungTam.DiaChi, tep.CauHoiMau[1].MucTrungTam);
        Assert.Null(tep.CauHoiMau[1].TraLoi);
        Assert.Equal(["cưới vợ", "lấy chồng"], tep.TuDongNghia[0].CachNoiKhac);
        Assert.Null(tep.ODichVu[0].Url);
        Assert.Equal(MauThu.ThoiDiem, tep.ThoiDiem);
        Assert.Null(tep.TrungTam!.BanDo);
        Assert.Equal(TrungTam.IdDuyNhat, tep.TrungTam.Id);
    }

    // ---- Dạng file ghi ra ----

    [Fact]
    public void File_ghi_ra_dung_dinh_dang()
    {
        var byteJson = GhiRa(MauThu.TuMa());
        var json = Chu(byteJson);

        Assert.DoesNotContain('\r', json);
        Assert.EndsWith("}\n", json, StringComparison.Ordinal);
        Assert.False(byteJson.AsSpan().StartsWith((ReadOnlySpan<byte>)[0xEF, 0xBB, 0xBF]), "không có BOM");
        Assert.StartsWith("{\n  \"phienBan\": 1,\n  \"thoiDiem\": \"2026-10-12T09:00:00+00:00\",\n", json, StringComparison.Ordinal);
        Assert.Contains("\"ten\": \"Hộ tịch\"", json, StringComparison.Ordinal);
        Assert.Contains("\"mucDo\": \"ToanTrinh\"", json, StringComparison.Ordinal);
        Assert.Contains("\"mucDo\": \"MotPhan\"", json, StringComparison.Ordinal);
        Assert.Contains("\"mucTrungTam\": \"DiaChi\"", json, StringComparison.Ordinal);
        Assert.Contains("\"sangTu\": \"07:00:00\"", json, StringComparison.Ordinal);
        Assert.Contains("\"oDichVu\"", json, StringComparison.Ordinal);
        Assert.Contains("\"trichYeu\": \"Thông tư <phí> & lệ phí\"", json, StringComparison.Ordinal);
        Assert.DoesNotContain("\\u", json, StringComparison.Ordinal);
        Assert.DoesNotContain("linhVuc\": {", json, StringComparison.Ordinal);
    }

    [Fact]
    public void Navigation_va_cot_khoa_ngoai_khong_nam_trong_file()
    {
        var tep = MauThu.TuMa();
        tep.KiemTraVaNoi();

        var json = Chu(GhiRa(tep));

        Assert.DoesNotContain("thuTucs", json, StringComparison.Ordinal);
        Assert.DoesNotContain("cauHoiMauThuTu", json, StringComparison.Ordinal);
        Assert.DoesNotContain("lanNhap", json, StringComparison.Ordinal);
        Assert.DoesNotContain("trungTams", json, StringComparison.Ordinal);
        Assert.DoesNotContain("cauHoiMauCachHoi", json, StringComparison.Ordinal);
    }

    [Fact]
    public void Doc_bo_qua_BOM_o_dau_file()
    {
        var voiBom = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(MauThu.JsonToiThieu)).ToArray();

        var tep = DocTu(voiBom);

        Assert.Equal(MauThu.ThoiDiem, tep.ThoiDiem);
    }

    // ---- Nối navigation, lan_nhap ----

    [Fact]
    public void Noi_navigation_dung_doi_tuong_va_xep_theo_ThuTu()
    {
        var tep = DocTu(GhiRa(MauThu.TuMa()));

        var hoTich = tep.LinhVuc.Single(l => l.Ma == "ho-tich");
        var khaiSinh = tep.ThuTuc.Single(t => t.Ma == "1.001193");
        var ketHon = tep.ThuTuc.Single(t => t.Ma == "1.000894");

        Assert.Same(hoTich, khaiSinh.LinhVuc);
        Assert.Same(hoTich, ketHon.LinhVuc);
        Assert.Equal(["1.000894", "1.001193"], hoTich.ThuTucs.Select(t => t.Ma)); // ThuTu 1, 2 (trong file ghi 2 trước 1)
        Assert.Same(tep.ThuTuc.Single(t => t.Ma == "2.000815"), Assert.Single(tep.LinhVuc.Single(l => l.Ma == "dat-dai").ThuTucs));

        Assert.Equal(3, tep.CauHoiMauCachHoi.Count);
        Assert.Equal([(1, 1), (1, 2), (2, 1)], tep.CauHoiMauCachHoi.Select(c => (c.CauHoiMauThuTu, c.ThuTu)));
        Assert.All(tep.CauHoiMauCachHoi, c => Assert.Same(tep.CauHoiMau.Single(q => q.ThuTu == c.CauHoiMauThuTu), c.CauHoiMau));
        Assert.Same(tep.CauHoiMau[0].CachHoi[1], tep.CauHoiMauCachHoi[1]);
    }

    [Fact]
    public void Bon_dong_LanNhap_mang_ThoiDiem_va_ten_file()
    {
        var tep = DocTu(GhiRa(MauThu.TuMa()));

        Assert.Equal(["thu-tuc", "phan-cong", "trung-tam", "tro-ly"], tep.LanNhap.Select(l => l.Loai));
        Assert.All(tep.LanNhap, l =>
        {
            Assert.Equal(MauThu.ThoiDiem, l.ThoiDiem);
            Assert.Equal("du-lieu-mau.json", l.TenFile);
        });
    }

    [Fact]
    public void TrungTams_co_mot_dong_hoac_khong()
    {
        Assert.Single(DocTu(GhiRa(MauThu.TuMa())).TrungTams);
        Assert.Empty(DocTu(MauThu.JsonToiThieu).TrungTams);
    }

    [Fact]
    public void KiemTraVaNoi_cho_doi_tuong_dung_bang_ma_va_chay_mot_lan()
    {
        var tep = MauThu.TuMa();
        Assert.Empty(tep.LanNhap);

        tep.KiemTraVaNoi();
        var lan = tep.LanNhap;
        tep.KiemTraVaNoi();

        Assert.Equal(4, tep.LanNhap.Count);
        Assert.Same(lan, tep.LanNhap);
        Assert.Same(tep.LinhVuc[0], tep.ThuTuc.Single(t => t.Ma == "1.001193").LinhVuc);
    }

    [Fact]
    public void Chi_co_hai_truong_bat_buoc_la_doc_duoc()
    {
        var tep = DocTu(MauThu.JsonToiThieu);

        Assert.Equal(1, tep.PhienBan);
        Assert.Empty(tep.ThuTuc);
        Assert.Null(tep.TrungTam);
        Assert.Equal(4, tep.LanNhap.Count);
    }

    // ---- Từ chối ----

    [Fact]
    public void Phien_ban_khac_1_bi_tu_choi_va_neu_phien_ban()
    {
        var ex = TuChoi(MauThu.JsonToiThieu.Replace("\"phienBan\":1", "\"phienBan\":2", StringComparison.Ordinal));

        Assert.Contains("phiên bản định dạng 2", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Phien_ban_moi_co_thuoc_tinh_la_van_bao_loi_phien_ban_truoc()
    {
        var ex = TuChoi("""{"thuocTinhMoi":[1,2,{"a":3}],"phienBan":2,"thoiDiem":"2026-10-12T09:00:00+00:00","khac":1}""");

        Assert.Contains("phiên bản định dạng 2", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Thieu_phien_ban_bi_tu_choi()
    {
        var ex = TuChoi("""{"thoiDiem":"2026-10-12T09:00:00+00:00"}""");

        Assert.Contains("phienBan", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Thieu_thoi_diem_bi_tu_choi()
    {
        var ex = TuChoi("""{"phienBan":1}""");

        Assert.Contains("thoiDiem", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Thuoc_tinh_la_o_goc_bi_tu_choi_va_neu_ten_thuoc_tinh()
    {
        var ex = TuChoi(ThemVaoToiThieu("\"cotLa\":1"));

        Assert.Contains("cotLa", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Thuoc_tinh_la_trong_thu_tuc_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThucTucCoCotLa()}]"));

        Assert.Contains("tenCotLa", ex.Message, StringComparison.Ordinal);
        Assert.Contains("ThuTuc", ex.Message, StringComparison.Ordinal);
    }

    private static string ThucTucCoCotLa() => ThuTucJson(them: ",\"tenCotLa\":\"x\"");

    [Fact]
    public void Navigation_ghi_trong_file_bi_bo_qua_va_duoc_noi_lai_tu_khoa()
    {
        var tep = DocTu(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich[..^1]},\"thuTucs\":[]}}]"));

        Assert.Empty(Assert.Single(tep.LinhVuc).ThuTucs);
    }

    [Fact]
    public void Thuoc_tinh_trung_trong_json_bi_tu_choi()
    {
        var ex = TuChoi("""{"phienBan":1,"thoiDiem":"2026-10-12T09:00:00+00:00","ghiChu":"a","ghiChu":"b"}""");

        Assert.Contains("ghiChu", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Null_o_truong_khong_cho_null_bi_tu_choi_va_neu_vi_tri()
    {
        var ex = TuChoi(ThemVaoToiThieu("\"linhVuc\":[{\"ma\":\"ho-tich\",\"ten\":null,\"tenTimKiem\":\"ho tich\"}]"));

        Assert.Contains("$.linhVuc[0].ten", ex.Message, StringComparison.Ordinal);
        Assert.Contains("'ten'", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Null_o_danh_sach_khong_cho_null_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu("\"linhVuc\":null"));

        Assert.Contains("null", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Null_trong_mang_chuoi_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThuTucJson().Replace("\"hinhThucNop\":[]", "\"hinhThucNop\":[null]", StringComparison.Ordinal)}]"));

        Assert.Contains("thuTuc[0].hinhThucNop", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Phan_tu_null_trong_danh_sach_bi_tu_choi_voi_vi_tri()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich},null]"));

        Assert.Contains("linhVuc[1]", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Null_o_truong_cho_phep_null_duoc_nhan()
    {
        var tep = DocTu(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThuTucJson()}],\"trungTam\":null"));

        var t = Assert.Single(tep.ThuTuc);
        Assert.Null(t.CoQuanThucHien);
        Assert.Null(tep.TrungTam);
    }

    [Fact]
    public void Ma_thu_tuc_trung_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThuTucJson("A")},{ThuTucJson("A")}]"));

        Assert.Contains("khoá trùng", ex.Message, StringComparison.Ordinal);
        Assert.Contains("thuTuc.ma", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Ma_linh_vuc_trung_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich},{LinhVucHoTich}]"));

        Assert.Contains("linhVuc.ma", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ThuTuThuongGap_trung_bi_tu_choi_nhung_nhieu_null_thi_khong()
    {
        var thuongGap1 = (string ma) => ThuTucJson(ma).Replace("\"thuTuThuongGap\":null", "\"thuTuThuongGap\":1", StringComparison.Ordinal);

        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{thuongGap1("A")},{thuongGap1("B")}]"));
        Assert.Contains("thuTuThuongGap", ex.Message, StringComparison.Ordinal);

        var tep = DocTu(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThuTucJson("A")},{ThuTucJson("B")}]"));
        Assert.Equal(2, tep.ThuTuc.Count);
    }

    [Fact]
    public void Khoa_trung_o_cac_bang_con_bi_tu_choi()
    {
        Assert.Contains("gioLamViec.thu", TuChoi(ThemVaoToiThieu("\"gioLamViec\":[{\"thu\":1,\"sangTu\":null,\"sangDen\":null,\"chieuTu\":null,\"chieuDen\":null},{\"thu\":1,\"sangTu\":null,\"sangDen\":null,\"chieuTu\":null,\"chieuDen\":null}]")).Message, StringComparison.Ordinal);
        Assert.Contains("vietTat.thuTu", TuChoi(ThemVaoToiThieu("\"vietTat\":[{\"thuTu\":1,\"chuVietTat\":\"A\",\"chuVietTatTimKiem\":\"a\",\"dayDu\":\"x\"},{\"thuTu\":1,\"chuVietTat\":\"B\",\"chuVietTatTimKiem\":\"b\",\"dayDu\":\"y\"}]")).Message, StringComparison.Ordinal);
        Assert.Contains("vietTat.chuVietTatTimKiem", TuChoi(ThemVaoToiThieu("\"vietTat\":[{\"thuTu\":1,\"chuVietTat\":\"A\",\"chuVietTatTimKiem\":\"a\",\"dayDu\":\"x\"},{\"thuTu\":2,\"chuVietTat\":\"a\",\"chuVietTatTimKiem\":\"a\",\"dayDu\":\"y\"}]")).Message, StringComparison.Ordinal);
        Assert.Contains("tuDongNghia.tuTimKiem", TuChoi(ThemVaoToiThieu("\"tuDongNghia\":[{\"thuTu\":1,\"tu\":\"A\",\"tuTimKiem\":\"a\",\"cachNoiKhac\":[]},{\"thuTu\":2,\"tu\":\"a\",\"tuTimKiem\":\"a\",\"cachNoiKhac\":[]}]")).Message, StringComparison.Ordinal);
        Assert.Contains("cachHoi.thuTu", TuChoi(ThemVaoToiThieu("\"cauHoiMau\":[{\"thuTu\":1,\"cauHoi\":\"c\",\"traLoi\":\"t\",\"mucTrungTam\":null,\"maThuTuc\":[],\"cachHoi\":[{\"thuTu\":1,\"noiDung\":\"a\",\"noiDungTimKiem\":\"a\"},{\"thuTu\":1,\"noiDung\":\"b\",\"noiDungTimKiem\":\"b\"}]}]")).Message, StringComparison.Ordinal);
    }

    [Fact]
    public void LinhVucMa_khong_co_trong_danh_sach_linh_vuc_bi_tu_choi()
    {
        var ex = TuChoi(ThemVaoToiThieu($"\"linhVuc\":[{LinhVucHoTich}],\"thuTuc\":[{ThuTucJson("A", "khong-co")}]"));

        Assert.Contains("'A'", ex.Message, StringComparison.Ordinal);
        Assert.Contains("khong-co", ex.Message, StringComparison.Ordinal);
        Assert.Contains("lĩnh vực", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Trung_tam_id_khac_1_bi_tu_choi()
    {
        var json = Chu(GhiRa(MauThu.TuMa())).Replace("\"id\": 1", "\"id\": 2", StringComparison.Ordinal);

        var ex = TuChoi(json);

        Assert.Contains("trungTam.id", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Ten_enum_la_hoac_so_bi_tu_choi()
    {
        var json = Chu(GhiRa(MauThu.TuMa()));

        Assert.Contains("mucDo", TuChoi(json.Replace("\"mucDo\": \"ToanTrinh\"", "\"mucDo\": \"KhongCo\"", StringComparison.Ordinal)).Message, StringComparison.Ordinal);
        Assert.Contains("mucDo", TuChoi(json.Replace("\"mucDo\": \"ToanTrinh\"", "\"mucDo\": 1", StringComparison.Ordinal)).Message, StringComparison.Ordinal);
    }

    [Fact]
    public void JSON_hong_bi_tu_choi_voi_vi_tri()
    {
        var ex = TuChoi("{\"phienBan\":1,\n\"thoiDiem\":");

        Assert.Contains("không đọc được", ex.Message, StringComparison.Ordinal);
        Assert.IsAssignableFrom<System.Text.Json.JsonException>(ex.InnerException);
    }

    [Theory]
    [InlineData("")]
    [InlineData("null")]
    [InlineData("[]")]
    public void Noi_dung_khong_phai_doi_tuong_bi_tu_choi(string json)
        => Assert.Throws<InvalidDataException>(() => DocTu(json));

    [Fact]
    public void Thong_bao_loi_khong_chep_noi_dung_file()
    {
        const string BiMat = "NOIDUNGKHONGDUOCLOGRA";
        var ex = TuChoi(ThemVaoToiThieu($"\"ghiChu\":\"{BiMat}\",\"cotLa\":\"{BiMat}\",\"linhVuc\":[{{\"ma\":\"{BiMat}\",\"ten\":null,\"tenTimKiem\":\"x\"}}]"));

        Assert.DoesNotContain(BiMat, ex.Message, StringComparison.Ordinal);
    }

    // ---- Ghi từ chối dữ liệu sai như khi đọc ----

    [Fact]
    public void Ghi_tu_choi_du_lieu_khong_qua_duoc_phep_kiem()
    {
        var tep = MauThu.TuMa();
        tep.ThuTuc.Add(new ThuTuc { Ma = "1.001193", LinhVucMa = "ho-tich", ThuocDanhMucXa = true });

        using var luong = new MemoryStream();
        var ex = Assert.Throws<InvalidDataException>(() => tep.Ghi(luong));

        Assert.Contains("thuTuc.ma", ex.Message, StringComparison.Ordinal);
        Assert.Equal(0, luong.Length);
    }

    [Fact]
    public void Ghi_tu_choi_null_o_truong_khong_cho_null()
    {
        var tep = MauThu.TuMa();
        tep.LinhVuc[0].Ten = null!;

        using var luong = new MemoryStream();
        Assert.Throws<InvalidDataException>(() => tep.Ghi(luong));
    }

    [Fact]
    public void Ghi_tu_choi_phien_ban_khac_1()
    {
        var tep = MauThu.TuMa();
        tep.PhienBan = 2;

        using var luong = new MemoryStream();
        Assert.Throws<InvalidDataException>(() => tep.Ghi(luong));
    }

    // ---- Tài nguyên nhúng ----

    [Fact]
    public void Thieu_tai_nguyen_nhung_bao_loi_neu_ten_tai_nguyen()
    {
        var ex = Assert.Throws<InvalidDataException>(() => TepDuLieuMau.DocTaiNguyen(typeof(TepDuLieuMau).Assembly, "khong-co-tai-nguyen.json"));

        Assert.Contains("khong-co-tai-nguyen.json", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Ten_tai_nguyen_nhung_co_dinh()
        => Assert.Equal("DichVuCong.Data.Mau.du-lieu-mau.json", TepDuLieuMau.TenTaiNguyen);
}
