---
id: F06
ten: Trợ lý trả lời theo luật — kế hoạch kỹ thuật
spec: spec.md (da-duyet; đổi sang dang-lam khi lập xong tasks.md)
nguon: spec.md; CLAUDE.md; .specify/nghiep-vu/{du-lieu, can-giuoc, lien-ket, cau-hoi-mo}.md; .specify/design-system.md §5 (ChatPanel); .specify/prototype/index.html (khung chat đã duyệt); plan F00 §1, §9 (nguồn dữ liệu, R1–R7, §9.6 kho câu chưa trả lời, §9.7 tìm gần đúng, §9.16 câu 3); plan F01 §4, §8; plan F03 §3, §4.9; plan F04 §3.1; plan F08 §3.1, §4.12; plan C01 §4.5, §4.9; spec F07, F09; mã thật trong src/. Trang Vàm Cỏ chỉ đọc để hiểu thuật toán (dữ liệu không tin cậy, không chạy mã, bỏ phần Gemini/micro)
cap_nhat: 2026-10-13
---

# F06 · Trợ lý trả lời theo luật — kế hoạch kỹ thuật

## 1. Tóm tắt

Người dân hỏi bằng lời thường, máy chủ trả lời bằng **luật + dữ liệu đã nhập**, không AI. Toàn bộ nghiệp vụ nằm ở BE (BR-4); trình duyệt chỉ gửi câu hỏi kèm mã thủ tục đang nói tới và vẽ đáp án có cấu trúc. Câu khuôn mẫu ("Hồ sơ nộp tại…", "Chưa có thông tin…") nằm ở file ngôn ngữ FE (CLAUDE.md, mục i18n).

| Phần | Chạm gì |
|---|---|
| DB (`DichVuCong.Data`) | **Không đổi.** Không entity, cột, chỉ mục, migration (§2). db-dev không có task |
| BE `Features/Chatbot/` (chatbot-dev) | 3 endpoint dưới `/api/tro-ly` (§3), thuật toán trả lời (§4), che thông tin cá nhân (§4.8), chỉ mục tìm kiếm trong bộ nhớ theo phiên bản dữ liệu (§4.2). Dùng lại `IKhoCauChuaTraLoi`/`AddChatbot(nguon)` (F00 T28, T29) và `IChiTietThuTucService` (F03) |
| FE `features/chatbot/` (chatbot-dev) | Vỏ nút "Trợ lý" ≤ 1 KB gzip trong bundle chính; khung chat + logic **nạp lười hoàn toàn** khi mở (§5) |
| FE `core/`, `app/` (ui-core-dev) | Trích hàm vòng Tab của `Modal` ra `core/utils/vongTab.ts`; nối `<NutTroLy />` vào `Layout`; khoá `common:tro-ly.nut`; khai báo kiểu cho namespace `chatbot` (§5.6). **Không thêm component mới vào `core/`** |
| F07, F09 | Không làm ở đây. Điểm ghép (props, hàm, vị trí trong khung) ở §6 |
| backend-dev, db-dev, frontend-dev | Không có task |

Không thêm gói NuGet hay npm.

### Quyết định chính

| # | Quyết định | Lý do |
|---|---|---|
| Q1 | **`POST /api/tro-ly/hoi`**, câu hỏi nằm trong body JSON, không đưa lên URL | Câu có thể chứa CCCD, điện thoại, email. URL bị ghi vào nhật ký của reverse proxy, trình duyệt, công cụ giám sát; body thì không. Chặn sớm được bằng giới hạn body 64 KB đã có (`Hosting:MaxRequestBodyBytes` = 65536) |
| Q2 | **Ngữ cảnh hội thoại do FE giữ và gửi kèm** (`maThuTuc`); BE không nhớ gì giữa hai câu | Không có phiên phía máy chủ nên không có gì để lộ, để dọn, hay lẫn giữa nhiều người dùng chung một địa chỉ mạng (kiosk). "Bắt đầu lại" (F09) chỉ cần xoá state FE. Mã nhận từ FE được kiểm định dạng và phải có trong dữ liệu; sai thì coi như không có ngữ cảnh |
| Q3 | **Một thuật toán C# cho cả hai nguồn**, không dùng `pg_trgm` (chốt Cần hỏi 3 của F00 §9.16, phương án a) | Hai nguồn cho kết quả **giống hệt** (cùng mã, cùng đầu vào, sắp xếp xác định) thay vì "lệch trong mức chấp nhận" ở F00 §9.7. Một bộ mã, một bộ test. Dữ liệu chỉ khoảng 1.000 tên thủ tục và vài chục cách hỏi: chỉ mục trong bộ nhớ tốn vài MB, trả lời vài mili giây. Index GIN `gin_trgm_ops` đã có vẫn giữ nguyên (không migration) nhưng F06 không dùng; thêm `pg_trgm` chỉ khi đo thấy cần hiệu năng |
| Q4 | **Chấm điểm bằng độ phủ có trọng số IDF (hệ số Dice) trên từ đã bỏ dấu**, kèm **sửa lỗi gõ theo từng từ** (khoảng cách chỉnh sửa Damerau–Levenshtein tới từ điển của dữ liệu), không so trigram cả tên | Từ hiếm ("khai", "sinh") nặng hơn từ phổ biến ("thủ", "tục", "đăng ký"). Dice phạt tên dài nên "Thủ tục đăng ký khai sinh" đứng trước "…khai sinh lưu động" khi người dân chỉ gõ "khai sinh". Sửa lỗi theo từng từ giải được "khai sjnh" (AC-5) và giải thích được kết quả; trigram cả tên thì "khai sjnh" chỉ đạt điểm thấp, khó đặt ngưỡng |
| Q5 | **Đáp án là đối tượng có cấu trúc** (`loai` + dữ liệu thô); FE ghép câu bằng `t()` | CLAUDE.md: BE không trả câu chữ giao diện. Nội dung riêng (câu trả lời mẫu, tên thủ tục, địa chỉ) vẫn lấy từ DB và hiện nguyên văn dạng chữ thuần |
| Q6 | **Chỉ mục tìm kiếm** (thủ tục, lĩnh vực, cách hỏi mẫu, từ đồng nghĩa, viết tắt, chủ đề) **lưu trong bộ nhớ theo phiên bản dữ liệu** (`IPhienBanDuLieu`); **Trung tâm, giờ làm việc, liên kết, phân công, nhân sự đọc mỗi lần cần** | Phiên bản đổi ở mọi lần nhập nên chỉ mục dựng lại ngay khi nhập (AC-24, AC-25, AC-26). Các bảng nhỏ (dưới 10 dòng) đọc theo yêu cầu thì câu trả lời luôn theo dữ liệu hiện tại (AC-18) và không phải giữ gì |
| Q7 | **Chi tiết một mục của thủ tục lấy từ `IChiTietThuTucService` của F03**, dựng DTO nhỏ từ đó | Dùng lại, không viết lại truy vấn jsonb và quy tắc thời hạn ("Khác" → chưa ghi rõ). Một truy vấn khoá chính cho mỗi câu |
| Q8 | **Hội thoại chỉ ở bộ nhớ trang**: không `localStorage`, không `sessionStorage`; tải lại trang là mất | Riêng tư trên kiosk dùng chung (F09 BR-3). Đơn giản |
| Q9 | **Che thông tin cá nhân ngay đầu xử lý**: hai bản — `Che` (giữ 2 đầu 2 cuối, để lưu) và `Bo` (thay bằng dấu cách, để so khớp) | Số và email không có ích cho việc tìm thủ tục, lại làm nhiễu điểm (§4.8). Câu gốc không bao giờ vào kho, log hay bộ so khớp |
| Q10 | **Khung chat giữ nguyên khi đóng** (ẩn bằng `hidden`, không huỷ); "Bắt đầu lại" huỷ bằng cách đổi `key` | BR-6: đóng popup thì hội thoại còn nguyên; F07 AC-8: mở lại không tự đọc tiếp. Đổi `key` xoá sạch state một chỗ |

## 2. Dữ liệu

Không có thay đổi. Bảng được đọc qua `INguonDuLieu` (F00 §9.3, quy tắc R1–R5), không bao giờ qua `AppDbContext`:

| Bảng | Đọc khi nào | Dùng cho |
|---|---|---|
| `thu_tuc` (`ma`, `ten`, `ten_tim_kiem`, `linh_vuc_ma`, `muc_do`, `thuoc_danh_muc_xa/tinh`, `ma_dvc`, `thu_tu`) | Dựng chỉ mục (theo phiên bản) | Tìm thủ tục, danh sách, chủ đề |
| `linh_vuc` (`ma`, `ten`, `ten_tim_kiem`) | Dựng chỉ mục | Tên lĩnh vực trong đáp án; nhận ra lĩnh vực trong câu hỏi |
| `cau_hoi_mau`, `cau_hoi_mau_cach_hoi` | Dựng chỉ mục | Bước 1 (nhóm Trung tâm) và bước 2 (câu trả lời mẫu). Đọc hai bảng riêng rồi ghép trong bộ nhớ theo `CauHoiMauThuTu`, không đọc navigation (R2) |
| `tu_dong_nghia`, `viet_tat` | Dựng chỉ mục | Mở rộng câu hỏi (BR-2) |
| `chu_de_goi_y` | Dựng chỉ mục | Chip chủ đề, đáp án chủ đề (BR-11) |
| `trung_tam`, `gio_lam_viec`, `lien_ket` | Mỗi lần cần (bước Trung tâm, "không hiểu", quầy) | BR-9, BR-10 |
| `phan_cong_linh_vuc`, `nhan_su` | Mỗi lần cần (hỏi quầy, nhân sự, nơi nộp, chủ đề) | BR-3 |
| `thu_tuc` (jsonb, một dòng) | Qua `IChiTietThuTucService` | Đáp án theo mục (BR-1 bước 3) |
| `lan_nhap` | Qua `IPhienBanDuLieu` | Khoá chỉ mục |
| `cau_chua_tra_loi` | Ghi qua `IKhoCauChuaTraLoi.GhiAsync` | BR-7, BR-8, BR-12 |

- Migration: **không có**. `pg_trgm` và ba chỉ mục GIN của F01 giữ nguyên, không dùng (Q3).
- Hằng có sẵn dùng lại: `CauChuaTraLoi.DoDaiToiDa` = 500, `CauChuaTraLoi.ThoiGianGiu` = 90 ngày (việc xoá do F00 T28 làm).
- Dữ liệu mẫu nhúng (`Mau/du-lieu-mau.json`) đã có 11 câu hỏi mẫu (6 tách thửa, 5 Trung tâm), 6 chủ đề, 45 dòng từ đồng nghĩa, 12 viết tắt, phân công và nhân sự rỗng. Chỉ có bộ này, không thêm dữ liệu cho F06; test dựng biến thể bằng C# (§9).

## 3. API — hợp đồng giữa BE và FE

Vị trí mã: `src/BackEnd/DichVuCong.Api/Features/Chatbot/` (chatbot-dev). Controller `TroLyController`, route `api/tro-ly`.

| Method + route | Làm gì | Giới hạn tần suất | Cache |
|---|---|---|---|
| `POST /api/tro-ly/hoi` | Trả lời một câu hỏi | `tro-ly` (60/phút/IP) | Không |
| `POST /api/tro-ly/chu-de` | Trả lời khi bấm một chủ đề gợi ý (BR-11) | `tro-ly` (cùng bộ đếm với câu hỏi — AC-28) | Không |
| `GET /api/tro-ly/chu-de` | Danh sách chip chủ đề theo thứ tự trong dữ liệu | `danh-muc` (300/phút/IP) | Policy `danh-muc` (ETag theo lần nhập, 304) |

- Hai endpoint POST không dùng output cache (F00 §1: trợ lý không dùng cache `danh-muc`), không gắn `[DanhMucQuery]`.
- Nhận `application/json` (`[Consumes]`); kiểu khác bị từ chối ở mức framework (4xx → `du-lieu-khong-hop-le`).
- Body ≤ 64 KB: đã áp toàn cục bởi `RequestSizeLimitMiddleware` (Content-Length) và Kestrel (chunked); lỗi 413 `yeu-cau-qua-lon` có sẵn. Không thêm cơ chế riêng.
- Ngoài khoá `RateLimiting:TroLy` (đã là 60) không có cấu hình mới. Ngưỡng thuật toán là hằng trong mã (§4.9).

### 3.1 Yêu cầu (C#)

```csharp
// Features/Chatbot/TroLyDtos.cs
public sealed record HoiRequest(
    [property: Required, StringLength(500, MinimumLength = 1)] string CauHoi,
    [property: StringLength(20)] string? MaThuTuc);        // thủ tục đang nói tới; null = chưa có

public sealed record HoiChuDeRequest(
    [property: Range(1, 1000)] int ThuTu,                  // thứ tự của chủ đề trong GET /api/tro-ly/chu-de
    [property: StringLength(20)] string? MaThuTuc);
```

- `CauHoi` không có chữ nhìn thấy nào (chỉ khoảng trắng, ký tự vô hình U+200B–U+200F, U+FEFF) → 400 `du-lieu-khong-hop-le`. Độ dài tính theo ký tự .NET (UTF-16), cùng cách với `maxLength` của ô nhập.
- `MaThuTuc` sai định dạng (`ChiTietThuTucService.LaMaHopLe`) hoặc không có trong dữ liệu → **bỏ qua** (coi như null), không báo lỗi. Lý do: sau khi nhập lại dữ liệu, mã cũ có thể không còn; FE không phải xử lý thêm nhánh.

### 3.2 Đáp án (C#)

Một record phẳng, `Loai` quyết định các trường có nghĩa; các trường khác là `null` (cùng quy ước null-vẫn-có-mặt với F03, F04, F08). Danh sách không bao giờ `null` ở loại dùng nó (rỗng thì `[]`).

```csharp
public static class LoaiCauTraLoi
{
    public const string ThuTuc = "thu-tuc";                   // BR-1 bước 3
    public const string ThuTucDanhSach = "thu-tuc-danh-sach"; // BR-1 bước 4
    public const string ChuDe = "chu-de";                     // BR-11
    public const string CauHoiMau = "cau-hoi-mau";            // BR-1 bước 2
    public const string TrungTam = "trung-tam";               // BR-9
    public const string Quay = "quay";                        // BR-1 bước 1, BR-3
    public const string KhongHieu = "khong-hieu";             // BR-1 bước 5
}
// Muc của thu-tuc:  "thoi-han" | "ho-so" | "phi" | "noi-nop" | "trinh-tu" | "ket-qua" | "can-cu"
// Muc của trung-tam: "dia-chi" | "gio-lam-viec" | "dien-thoai" | "email" | "nop-truc-tuyen"
// Muc của quay:     "quay" | "can-bo"

public sealed record ThuTucNganDto(string Ma, string Ten, string LinhVuc, string MucDo, bool CapXa, bool CapTinh);
                                                                  // MucDo = "toan-trinh" | "mot-phan" (MucDoChuoi của F03)
public sealed record TrungTamNganDto(string Ten, string DiaChi);
public sealed record LienHeTroLyDto(string DienThoai, string? ZaloOa);   // nút gọi luôn có; nút Zalo chỉ khi ZaloOa khác null (BR-10)
public sealed record CanBoDto(string HoTen, string? XungHo, string? ChucVu, int? Quay, string? MoTa);
public sealed record ChuDeTraLoiDto(string TenHienThi, string LinhVuc);  // LinhVuc = tên lĩnh vực trong danh mục
public sealed record ChuDeGoiYDto(int ThuTu, string TenHienThi);

// Các mục của một thủ tục; tái dùng GiayToDto, BuocTrinhTuDto, CanCuDto của F03 (Features/ChiTietThuTuc)
public sealed record NoiDungMucDto(
    string? ThoiHan,                               // muc thoi-han; null = chưa ghi rõ (ThoiHanThuTuc.Chon của F03)
    string? Phi,                                   // muc phi; null = chưa có
    IReadOnlyList<string>? HinhThucNop,            // muc noi-nop
    IReadOnlyList<GiayToDto>? ThanhPhanHoSo,       // muc ho-so, tối đa 8
    IReadOnlyList<BuocTrinhTuDto>? TrinhTu,        // muc trinh-tu, tối đa 2 bước, mỗi bước ≤ 500 ký tự (cắt thì thêm "…")
    IReadOnlyList<string>? KetQua,                 // muc ket-qua, tối đa 6
    IReadOnlyList<CanCuDto>? CanCu,                // muc can-cu, tối đa 6, trích yếu ≤ 200 ký tự
    int? Tong);                                    // tổng số phần tử của danh sách đã bị cắt bớt; null = không cắt

// Dữ liệu Trung tâm theo mục (BR-9); tái dùng GioLamViecDto, LienKetDto của F08
public sealed record ThongTinTrungTamMucDto(
    bool CoDuLieu,                                 // false = mục được hỏi chưa có dữ liệu → FE hiện "chưa có thông tin" + nút gọi
    string? DiaChi, string? BanDo,                 // dia-chi (BanDo null → FE không hiện liên kết)
    IReadOnlyList<GioLamViecDto>? GioLamViec,      // gio-lam-viec: nguyên các dòng của gio_lam_viec; FE gộp ngày
    string? GhiChuNgayNghi,
    string? DienThoai,                             // dien-thoai
    string? Email,                                 // email
    LienKetDto? LienKet);                          // nop-truc-tuyen: liên kết tên "Cổng Dịch vụ công Quốc gia"

public sealed record CauTraLoiDto(
    string Loai,
    string? ThuTucDangNoi = null,                          // mã thủ tục để FE gửi kèm câu kế tiếp (Q2). Luôn gán lại state FE bằng giá trị này
    string? Muc = null,
    ThuTucNganDto? ThuTuc = null,                          // thu-tuc: thủ tục được trả lời
    IReadOnlyList<ThuTucNganDto>? ThuTucKhac = null,       // thu-tuc: tối đa 3 thủ tục gần nghĩa khác ("nếu không đúng, chọn lại")
    IReadOnlyList<ThuTucNganDto>? DanhSachThuTuc = null,   // thu-tuc-danh-sach (≤ 5), chu-de (≤ 10), cau-hoi-mau (thủ tục liên quan)
    int? Tong = null,                                      // chu-de: tổng số thủ tục của lĩnh vực; quay/can-bo: tổng cán bộ
    ChuDeTraLoiDto? ChuDe = null,
    string? TraLoi = null,                                 // cau-hoi-mau: chữ thuần, giữ xuống dòng, không HTML
    NoiDungMucDto? NoiDung = null,
    ThongTinTrungTamMucDto? ThongTin = null,
    string? LinhVuc = null,                                // quay: tên lĩnh vực được hỏi
    int? Quay = null,                                      // noi-nop, chu-de, quay: số quầy; null = lĩnh vực chưa có quầy → KHÔNG nêu quầy (BR-3)
    string? NoiTiepNhanChuyen = null,
    IReadOnlyList<CanBoDto>? CanBo = null,                 // quay/can-bo; rỗng khi chưa có nhân sự (BR-3)
    TrungTamNganDto? TrungTam = null,                      // noi-nop, chu-de, quay: để viết "nộp hồ sơ tại Trung tâm …, địa chỉ …"
    LienHeTroLyDto? LienHe = null);                        // khong-hieu; trung-tam khi CoDuLieu = false
```

Bảng trường theo loại (ô trống = `null`):

| `loai` | `muc` | Trường có nghĩa |
|---|---|---|
| `thu-tuc` | 7 giá trị | `thuTuc`, `thuTucKhac`, `noiDung`; riêng `noi-nop` thêm `quay`, `noiTiepNhanChuyen`, `trungTam` |
| `thu-tuc-danh-sach` | — | `danhSachThuTuc` (1–5) |
| `chu-de` | — | `chuDe`, `tong`, `danhSachThuTuc` (≤ 10, có thể rỗng), `quay`, `noiTiepNhanChuyen`, `trungTam` |
| `cau-hoi-mau` | — | `traLoi`, `danhSachThuTuc` (thủ tục liên quan của câu mẫu, có thể rỗng) |
| `trung-tam` | 5 giá trị | `thongTin`; `lienHe` khi `thongTin.coDuLieu` = false |
| `quay` | `quay` hoặc `can-bo` | `linhVuc`, `quay`, `noiTiepNhanChuyen`, `canBo`, `tong`, `trungTam` |
| `khong-hieu` | — | `lienHe` |

`thuTucDangNoi` có ở mọi loại của `POST /hoi` và `POST /chu-de` (bằng ngữ cảnh mới, hoặc giữ nguyên ngữ cảnh gửi lên khi không đổi — §4.7).

### 3.3 Kiểu TypeScript — `src/FrontEnd/src/features/chatbot/api/troLy.ts`

```ts
export type MucThuTuc = 'thoi-han' | 'ho-so' | 'phi' | 'noi-nop' | 'trinh-tu' | 'ket-qua' | 'can-cu';
export type MucTrungTam = 'dia-chi' | 'gio-lam-viec' | 'dien-thoai' | 'email' | 'nop-truc-tuyen';

export interface ThuTucNgan { ma: string; ten: string; linhVuc: string; mucDo: 'toan-trinh' | 'mot-phan'; capXa: boolean; capTinh: boolean }
export interface TrungTamNgan { ten: string; diaChi: string }
export interface LienHeTroLy { dienThoai: string; zaloOa: string | null }
export interface CanBo { hoTen: string; xungHo: string | null; chucVu: string | null; quay: number | null; moTa: string | null }
export interface ChuDeGoiY { thuTu: number; tenHienThi: string }

// Phần tử con dùng đúng kiểu của F03 / F08 (tên trường trùng): ChiTietThuTuc['thanhPhanHoSo' | 'trinhTu' | 'canCu'], ThongTinTrungTam['gioLamViec' | 'lienKet'][number]
export interface NoiDungMuc {
  thoiHan: string | null; phi: string | null; hinhThucNop: string[] | null;
  thanhPhanHoSo: ChiTietThuTuc['thanhPhanHoSo'] | null; trinhTu: ChiTietThuTuc['trinhTu'] | null;
  ketQua: string[] | null; canCu: ChiTietThuTuc['canCu'] | null; tong: number | null;
}
export interface ThongTinTrungTamMuc {
  coDuLieu: boolean; diaChi: string | null; banDo: string | null;
  gioLamViec: ThongTinTrungTam['gioLamViec'] | null; ghiChuNgayNghi: string | null;
  dienThoai: string | null; email: string | null; lienKet: ThongTinTrungTam['lienKet'][number] | null;
}

interface Chung { thuTucDangNoi: string | null }
export type CauTraLoi =
  | (Chung & { loai: 'thu-tuc'; muc: MucThuTuc; thuTuc: ThuTucNgan; thuTucKhac: ThuTucNgan[]; noiDung: NoiDungMuc;
               quay: number | null; noiTiepNhanChuyen: string | null; trungTam: TrungTamNgan | null })
  | (Chung & { loai: 'thu-tuc-danh-sach'; danhSachThuTuc: ThuTucNgan[] })
  | (Chung & { loai: 'chu-de'; chuDe: { tenHienThi: string; linhVuc: string }; tong: number; danhSachThuTuc: ThuTucNgan[];
               quay: number | null; noiTiepNhanChuyen: string | null; trungTam: TrungTamNgan | null })
  | (Chung & { loai: 'cau-hoi-mau'; traLoi: string; danhSachThuTuc: ThuTucNgan[] })
  | (Chung & { loai: 'trung-tam'; muc: MucTrungTam; thongTin: ThongTinTrungTamMuc; lienHe: LienHeTroLy | null })
  | (Chung & { loai: 'quay'; muc: 'quay' | 'can-bo'; linhVuc: string | null; quay: number | null; noiTiepNhanChuyen: string | null;
               canBo: CanBo[]; tong: number; trungTam: TrungTamNgan | null })
  | (Chung & { loai: 'khong-hieu'; lienHe: LienHeTroLy | null });

export const API_TRO_LY = '/api/tro-ly';
export function hoiTroLy(cauHoi: string, maThuTuc: string | null, signal?: AbortSignal): Promise<CauTraLoi>;       // POST /hoi
export function hoiChuDe(thuTu: number, maThuTuc: string | null, signal?: AbortSignal): Promise<CauTraLoi>;        // POST /chu-de
export function useChuDeGoiY(mo: boolean): UseQueryResult<ChuDeGoiY[]>;                                             // GET /chu-de
```

- `hoiTroLy`, `hoiChuDe` gọi `http()` trực tiếp, **không** qua `useMutation`/`useQuery`: câu hỏi không được nằm trong bộ nhớ đệm của TanStack Query (kiosk, F09 BR-3).
- `useChuDeGoiY`: khoá `['tro-ly', 'chu-de']`, `enabled` khi khung đã mở lần đầu; mỗi lần mở lại khung gọi `refetch` (yêu cầu có điều kiện, 304 không thân) để AC-25 thấy ngay dữ liệu mới. Lỗi tải chip: ẩn khu vực chủ đề, không báo lỗi (trợ lý vẫn dùng được).

### 3.4 Mã trả lời

| HTTP | Khi nào | `code` (F00 §2b) |
|---|---|---|
| 200 | Có đáp án (kể cả `khong-hieu`) | — |
| 400 | `CauHoi` rỗng, > 500 ký tự, thiếu; `ThuTu` ngoài khoảng; body không phải JSON hợp lệ | `du-lieu-khong-hop-le` |
| 404 | `POST /chu-de` với `thuTu` không có trong dữ liệu | `khong-tim-thay` |
| 405 | Phương thức khác | `phuong-thuc-khong-hop-le` |
| 413 | Body > 64 KB | `yeu-cau-qua-lon` |
| 429 | Vượt `RateLimiting:TroLy` (hoặc `DanhMuc` với GET) | `qua-nhieu-yeu-cau` — FE hiện đúng câu của `common:loi.qua-nhieu-yeu-cau` (AC-7) |
| 500 | Lỗi không bắt được; có `maTraCuu` | `loi-he-thong` |

Lỗi 400 không nhắc lại nội dung câu hỏi (ProblemDetails mặc định chỉ nêu tên trường; test kiểm). Không thêm mã lỗi riêng: câu 501 ký tự chỉ đến được máy chủ khi bỏ qua ô nhập (AC-13), thông báo chung đủ.

### 3.5 Ví dụ

`POST /api/tro-ly/hoi` `{ "cauHoi": "làm giấy khai sinh cần giấy tờ gì", "maThuTuc": null }` →

```json
{
  "loai": "thu-tuc", "thuTucDangNoi": "1.001193", "muc": "ho-so",
  "thuTuc": { "ma": "1.001193", "ten": "Thủ tục đăng ký khai sinh", "linhVuc": "Hộ tịch", "mucDo": "toan-trinh", "capXa": true, "capTinh": true },
  "thuTucKhac": [ { "ma": "1.004884", "ten": "Thủ tục đăng ký lại khai sinh", "linhVuc": "Hộ tịch", "mucDo": "toan-trinh", "capXa": true, "capTinh": true } ],
  "noiDung": { "thoiHan": null, "phi": null, "hinhThucNop": null,
               "thanhPhanHoSo": [ { "ten": "- Tờ khai đăng ký khai sinh theo mẫu", "banChinh": 1, "banSao": null } ],
               "trinhTu": null, "ketQua": null, "canCu": null, "tong": 7 },
  "quay": null, "noiTiepNhanChuyen": null, "trungTam": null
}
```

Câu "giá vàng hôm nay" (dữ liệu mẫu, chưa có Zalo OA):

```json
{ "loai": "khong-hieu", "thuTucDangNoi": null, "lienHe": { "dienThoai": "02723 893 900", "zaloOa": null } }
```

(Các trường `null` khác có mặt nhưng được lược ở ví dụ.)

## 4. Thuật toán trả lời — BE (chatbot-dev)

Mọi so khớp chạy trên **chuỗi từ**: `TiengViet.ChuanHoaTimKiem(chuỗi)` (bỏ dấu, chữ thường, bỏ ký tự vô hình U+200B–U+200F và U+FEFF, gộp khoảng trắng) rồi tách ở mọi ký tự ngoài `[a-z0-9]`. Phép tách và các hàm so khớp dãy từ (`ChuaDay`, `ThayDay`) nằm trong **một tệp** `TimKiem/ChuoiTu.cs`; trong tệp này, nếu dùng `StartsWith`/`EndsWith`/`Contains` kèm so sánh thì ghi `// R4-ngoai-le: so khớp trong bộ nhớ trên chuỗi đã chuẩn hoá, không phải truy vấn` (test `QuyTacTruyVanTests` quét `Features/`). Không dùng hàm đó ở nơi khác.

### 4.1 Cấu trúc tệp (gợi ý; chatbot-dev có thể gộp/tách nhưng mỗi tệp ≤ 250 dòng)

```
Features/Chatbot/
  TroLyController.cs · TroLyDtos.cs · TroLyService.cs (ITroLyService)
  CheThongTinCaNhan.cs                       # §4.8
  TimKiem/
    ChuoiTu.cs                               # tách từ, so khớp dãy từ
    NgonNguHoi.cs                            # từ đệm, cụm chỉ mục hỏi, cụm quầy/cán bộ (§4.4)
    KhoangCachSua.cs                         # Damerau–Levenshtein có chặn trên
    ChiMucTroLy.cs · KhoChiMuc.cs            # chỉ mục + bộ nhớ đệm theo phiên bản (§4.2)
    ChamDiem.cs                              # Dice có trọng số, ngưỡng (§4.3, §4.9)
  TraLoi/
    TraLoiThuTuc.cs · TraLoiTrungTam.cs · TraLoiQuay.cs · TraLoiChuDe.cs
```

### 4.2 Chỉ mục trong bộ nhớ

`KhoChiMuc` (singleton) giữ **một** `ChiMucTroLy` mới nhất, khoá bằng `IPhienBanDuLieu.LayAsync` (một truy vấn khoá chính ở PostgreSql, đọc bộ nhớ ở nguồn Mẫu). Mỗi yêu cầu: lấy phiên bản → nếu khác phiên bản đang giữ thì dựng lại bằng `INguonDuLieu` của chính yêu cầu đó (`SemaphoreSlim`, kiểm hai lần để nhiều yêu cầu cùng lúc chỉ dựng một lần). Phiên bản trong lúc dựng đổi tiếp thì lần sau dựng lại; không ném lỗi.

Dựng (đọc bằng `DanhSachAsync`, `Select` ra kiểu ẩn danh, sắp theo `ThuTu` trong truy vấn — R1, R2, R3; mọi sắp xếp chuỗi làm trong C# bằng `StringComparer.Ordinal`):

| Thành phần | Nội dung |
|---|---|
| Thủ tục (N dòng, theo `ThuTu` rồi `Ma`) | `Ma`, `ThuTucNganDto` dựng sẵn, **tập từ chấm điểm** = từ duy nhất của `TenTimKiem` **bỏ từ đệm chung (§4.4) và hai từ `thu`, `tuc`** (có tên ghi "Thủ tục đăng ký khai tử", có tên chỉ ghi "Đăng ký lại khai tử": nếu để `thu tuc` trong điểm thì bản "lại" thắng bản gốc), `ThuTu`, bảng tra `Ma` → vị trí, `MaDvc` → `Ma` |
| Từ điển (để sửa lỗi gõ và nhận từ lạ) | **Mọi** từ gặp trong tên thủ tục (chưa lọc), tên lĩnh vực, cách hỏi mẫu, từ đồng nghĩa, viết tắt, cụm chỉ mục hỏi, từ đệm. `df(từ)` = số thủ tục có từ đó trong tập từ chấm điểm |
| `idf(từ)` | `ln(1 + N / df)`; từ không có `df` (không thuộc tập từ chấm điểm của thủ tục nào): `0,5 × ln(1 + N)` (nặng nhưng không tuyệt đối — một từ lạ như "ạ" không được làm hỏng cả câu) |
| Lĩnh vực | `Ma`, `Ten`, dãy từ của `TenTimKiem`; thủ tục của từng lĩnh vực theo `ThuTu` |
| Cách hỏi mẫu | Với mỗi dòng `cau_hoi_mau_cach_hoi`: tập từ của `NoiDungTimKiem` **sau khi bỏ từ đệm chung** (§4.4), `ThuTu` của câu mẫu; `idf` riêng trên kho cách hỏi (tài liệu = một cách hỏi); câu mẫu: `TraLoi` hoặc `MucTrungTam`, `MaThuTuc` |
| Từ đồng nghĩa | `TuDongNghia.Tu` là cụm **chuẩn** (đích); `CachNoiKhac` là các cách nói đời thường → bảng (dãy từ đời thường) → (dãy từ chuẩn). Cả hai chuẩn hoá bằng `ChuanHoaTimKiem` lúc dựng (dữ liệu có thể còn dấu) |
| Viết tắt | `ChuVietTat` → `DayDu`, chuẩn hoá cùng cách; khoá có ký tự ngoài chữ số (vd. `QĐ-UBND`) thành dãy từ `qd ubnd` |
| Chủ đề | Theo `ThuTu`: `TenHienThi`, `TenLinhVuc`, `LinhVucMa` |

Bộ nhớ ước 2–5 MB với 1.000 thủ tục; dựng ước 10–50 ms (đo ở T03).

### 4.3 Chuẩn bị câu hỏi, tìm thủ tục, tìm câu mẫu

**Chuẩn bị** (`PhanTichCauHoi`), theo thứ tự:

1. `cauBo = CheThongTinCaNhan.Bo(cauHoi)` (thay số/email bằng dấu cách) → chuỗi từ.
2. Mở rộng **viết tắt**: quét từ trái sang phải, khớp dãy dài nhất trước; thay bằng dạng đầy đủ (vd. `dk` → `dang ky`).
3. Thay **từ đồng nghĩa**: quét từ trái sang phải, khớp dãy cách nói đời thường dài nhất trước (kiểu "đám cưới" thắng "cưới"), thay bằng dãy chuẩn. Dãy bị thay không còn nằm trong truy vấn (để "sinh con" không còn kéo thủ tục có chữ "con"). Cụm chuẩn có sẵn trong câu giữ nguyên. Đây là phép mở rộng của AC-15 ("xin giấy khai sinh", "đk kết hôn").
4. **Sửa lỗi gõ** từng từ: bỏ qua từ đã có trong từ điển, từ toàn chữ số, từ ≤ 3 ký tự. Từ 4–7 ký tự: tìm từ trong từ điển cách ≤ 1 phép sửa; từ ≥ 8 ký tự: ≤ 2 phép (chèn, xoá, thay, đảo hai ký tự kề nhau). Chọn khoảng cách nhỏ nhất, rồi `df` lớn nhất, rồi thứ tự `Ordinal` nhỏ nhất (xác định). Từ đã sửa đánh dấu `DaSua` (hệ số 0,5 ở dưới). "khai sjnh" → "khai sinh" (AC-5). Kết quả của bước này là **dãy từ đầy đủ** (`day`), dùng để nhận ý hỏi, quầy, cán bộ, lĩnh vực.
5. Nhận **cụm chỉ mục hỏi, cụm đệm, quầy, cán bộ, tình trạng hồ sơ** (§4.4) trên `day` (chưa bỏ từ đệm, vì nhiều cụm chứa "ở đâu", "là gì"). Mọi cụm chỉ mục hỏi khớp đều ghi lại (`MucHoi` lấy cụm đầu theo thứ tự bảng).
6. Hai dãy rút ra từ `day`:
   - `tuMau` = `day` bỏ từ đệm chung và cụm đệm lời dẫn (dùng để tìm câu hỏi mẫu; vẫn giữ chữ của cụm chỉ mục hỏi và cụm hỏi chung vì "nộp hồ sơ trực tuyến ở đâu" là nội dung câu mẫu).
   - `tuNoiDung` = `tuMau` bỏ thêm từ của **mọi** cụm chỉ mục hỏi khớp, mọi cụm hỏi chung khớp, và `thu`, `tuc` (dùng để tìm thủ tục). Giữ thứ tự, bỏ trùng.

**Nhận mã thủ tục** (trước mọi việc): tách `cauBo` theo khoảng trắng, mỗi mảnh bỏ dấu câu ở hai đầu (`( ) , ; : ? !` và dấu chấm cuối), chuyển chữ thường; nếu bằng `Ma` hoặc `MaDvc` của một thủ tục (tra bảng, không regex) → thủ tục đó là **kết quả duy nhất, chắc chắn** (điểm 1). Mã nằm lẫn trong câu dài vẫn nhận ("1.001193 mấy ngày").

**Chấm điểm thủ tục** (`ChamDiem.TimThuTuc`), khi không có mã:

- Ứng viên: thủ tục chứa ít nhất một từ của `tuNoiDung` (tra chỉ mục ngược từ → danh sách thủ tục; không quét 1.000 dòng cho mỗi câu). `tuNoiDung` rỗng → không có ứng viên.
- Với mỗi ứng viên: `chung` = tổng `idf` của các từ truy vấn có trong tập từ chấm điểm của tên (từ `DaSua` chỉ tính `HeSoTuSuaLoi` = 0,5 của `idf`); `Q` = tổng `idf` mọi từ truy vấn (từ đã sửa tính đủ); `D` = tổng `idf` các từ chấm điểm của tên.
  - `phu` = `chung / Q` (độ phủ truy vấn)
  - `dice` = `2 × chung / (Q + D)`
- Sắp theo `dice` giảm dần (làm tròn 9 chữ số thập phân trước khi so), rồi `ThuTu` tăng dần. Hai nguồn cho cùng danh sách vì cùng mã, cùng dữ liệu, cùng thứ tự đọc.
- **Đủ liên quan** (được hiện ở bước 4): `phu ≥ 0,6` **và** số từ khớp ≥ `min(2, số từ truy vấn)`. Điều kiện thứ hai chặn câu như "xem bói" (từ "bói" khớp một thủ tục bồi thường, `phu` = 0,64 nhưng chỉ một từ khớp).
- **Đủ chắc** (dùng làm "thủ tục xác định được" ở bước 3, và để đặt ngữ cảnh): đủ liên quan **và** `phu ≥ 0,7` **và** `dice ≥ 0,45`; hoặc nhận bằng mã.
- Ngưỡng là hằng khởi điểm trong `ChamDiem.ThamSo`; chatbot-dev chỉnh số để bộ thử §9 đạt (không đổi cấu trúc thuật toán) và ghi số cuối trong báo cáo T07.

Số đo tham khảo trên `TepDuLieuMau.Nhung` (408 thủ tục), tính tay bằng đúng công thức trên để chatbot-dev đối chiếu cài đặt (sai lệch lớn nghĩa là cài sai):

| Truy vấn (`tuNoiDung`) | Đầu bảng (`dice`, `phu`) |
|---|---|
| khai sinh | `1.001193` (0,78; 1,0) · `1.004884` đăng ký lại khai sinh (0,66) · `1.003583` khai sinh lưu động (0,52) |
| khai tu | `1.000656` (0,76) đứng trước `1.005461` đăng ký lại khai tử (0,64) |
| ket hon | `1.000894` (0,82) · `1.004746` (0,72) · `1.000593` (0,59) · `2.000806` (0,51) · `2.000513` (0,47): đủ 5 thủ tục có "kết hôn" |
| khai sinh với "sinh" là từ đã sửa (câu "khai sjnh") | `1.001193` (0,58; phu 0,74): vẫn đủ chắc |
| dang ky khai sinh | `1.001193` (1,0) |
| gia vang hom (cả ba từ lạ hoặc rời rạc) | cao nhất `phu` 0,27: không đủ liên quan → bước 5 |
| xem boi | `phu` 0,64 nhưng một từ khớp: không đủ liên quan → bước 5 |

Số đo cho câu mẫu (kho cách hỏi 46 dòng, đã thêm "điều kiện tách thửa đất"): "dieu kien tach thua" → câu thêm 0,93 (câu hợp thửa kế tiếp 0,73); "van phong nam cho nao" → 1,0; "mấy giờ làm việc" → 1,0; "tach thua dat" → cao nhất 0,57 (dưới 0,7: không phải câu mẫu); "tach thua can giay to gi" → 0,42.

**Chấm điểm câu hỏi mẫu** (`ChamDiem.TimMau`): cùng công thức trên kho cách hỏi mẫu, với `tuMau` làm truy vấn (cả hai phía đã bỏ từ đệm chung, không bỏ `thu`, `tuc`). Chọn cách hỏi có `dice` cao nhất (hoà → `ThuTu` câu mẫu nhỏ hơn, rồi `ThuTu` cách hỏi); chấp nhận khi `dice ≥ 0,7`. Nhờ trọng số IDF trên kho mẫu, câu ngắn như "tách thửa đất" không bị nhầm vào cách hỏi dài "tách thửa đất trồng lúa" (các từ chung có `idf` thấp).

### 4.4 Ngôn ngữ hỏi — `NgonNguHoi.cs`

Đây là luật của ngôn ngữ, không phải dữ liệu của Trung tâm; đặt hằng trong mã. Mọi từ ở dạng chữ thường, bỏ dấu.

**Từ đệm chung** (bỏ khỏi truy vấn, và bỏ khỏi tập từ chấm điểm của tên thủ tục để hai phía đối xứng): `a ay bi da em gi giup ha hay hoac hoi khi khong la lam may muon nao nen neu nhe nhieu nhu nhung o ong oi se thi toi va vay ve voi xin`. Quy tắc: **không đưa vào** từ nằm trong tên thủ tục mang nghĩa thủ tục. Bỏ dấu làm nhiều từ trùng nhau: `chi` (chỉ, chi nhánh, "địa chỉ"), `ban` (bản sao, bạn), `the` (thẻ căn cước, "thế nào"), `boi` (bồi thường), `minh` (xác minh), `di` (di chúc, di sản), `cho` (chợ, "cho phép"), `co` (cơ quan, cơ sở), `moi`, `nguoi`, `tai`, `dang`, `ky`… Vàm Cỏ để `dang` trong danh sách của họ nên mất chữ "đăng". Lời dẫn dài như "cho tôi hỏi" xử lý bằng **cụm đệm** (dưới), không bằng từ đơn. Test phải có câu có từ đệm ("cho tôi hỏi làm giấy khai sinh cần giấy tờ gì ạ" → như câu 1).

**Cụm đệm lời dẫn** (cả cụm bị bỏ khỏi `tuMau` và `tuNoiDung`): `cho toi hoi`, `cho minh hoi`, `cho em hoi`, `cho hoi`, `xin cho hoi`, `xin hoi`, `nho giup`, `lam on`, `xin loi`, `cam on`, `vui long`.

**Cụm hỏi chung** (chỉ bỏ khỏi `tuNoiDung`; `tuMau` giữ vì câu mẫu có "ở đâu", "là gì"): `o dau`, `tai dau`, `la gi`, `the nao`, `ra sao`, `bao nhieu`, `duoc khong`, `co khong`. Lý do: `dau` (đâu) trùng `dau` (đầu tư) nên không đưa vào từ đệm đơn; chỉ bỏ khi đi thành cụm.

**Cụm chỉ mục hỏi** — một cụm khớp khi dãy từ nằm liền nhau trong câu. Khi nhiều mục cùng khớp, lấy theo thứ tự bảng (trên xuống):

| `muc` | Cụm |
|---|---|
| `thoi-han` | `thoi han`, `bao lau`, `may ngay`, `bao nhieu ngay`, `thoi gian giai quyet`, `khi nao co ket qua` |
| `noi-nop` | `nop o dau`, `nop tai dau`, `noi nop`, `nop dau`, `nop ho so o dau`, `nop ho so tai dau`, `hinh thuc nop`, `nop truc tuyen`, `nop ho so truc tuyen`, `nop truc tiep` |
| `ho-so` | `ho so`, `giay to`, `thanh phan ho so`, `can giay`, `can gi`, `can nhung gi`, `nop giay`, `chuan bi gi`, `mang theo` |
| `phi` | `phi`, `le phi`, `bao nhieu tien`, `mat tien`, `dong tien`, `mien phi` |
| `trinh-tu` | `cac buoc`, `may buoc`, `buoc nao`, `trinh tu`, `quy trinh`, `thuc hien the nao`, `lam the nao`, `cach lam`, `phai lam gi`, `can lam gi`, `lam sao`, `thu tuc ra sao`, `thu tuc the nao`, `huong dan` |
| `ket-qua` | `ket qua`, `nhan duoc gi`, `cap giay gi`, `duoc cap gi` |
| `can-cu` | `can cu phap ly`, `can cu`, `van ban nao`, `van ban phap luat`, `quy dinh o dau`, `nghi dinh nao`, `thong tu nao`, `luat nao` |

`noi-nop` đứng **trước** `ho-so` để "nộp hồ sơ trực tuyến ở đâu" là câu hỏi nơi nộp, không phải hồ sơ (AC-21). Cụm một từ (`phi`) so theo từ nguyên, không so chuỗi con ("phí" khác "phiên").

**Quầy và cán bộ** (BR-1 bước 1):

- `HoiCanBo`: có cụm `ai phu trach`, `phu trach`, `gap ai`, `ai truc`, `ai tiep nhan`, `ai giai quyet`, `ai xu ly`, `can bo nao`, `can bo phu trach`; hoặc `QuayCuThe` (từ `quay` liền sau là một số); hoặc `TimTheoTen` khớp (bên dưới).
- `HoiQuay`: có từ `quay` (không phải `HoiCanBo`).
- `TimTheoTen` (cổng từ `timTheoTen` của Vàm Cỏ, trên dãy từ, không dùng regex ghép từ dữ liệu): với mỗi nhân sự theo `ThuTu`, `tenGoi` = từ cuối của họ tên chuẩn hoá; khớp khi (a) cả dãy họ tên chuẩn hoá nằm liền trong câu, hoặc (b) `anh` hay `chi` đứng **ngay trước** `tenGoi`, hoặc (c) một trong `gap`, `lien he`, `tim`, `goi dien`, `noi chuyen` đứng trước, cách tối đa một từ `anh`/`chi`, rồi `tenGoi`. Không khớp `tenGoi` đứng một mình (trùng từ thường như "nhưng", "hàng").

**Hỏi tình trạng hồ sơ cá nhân** (trang không tra cứu hồ sơ): có cụm `ho so cua toi dau`, `ho so cua toi den dau`, `ho so cua toi chua`, `ho so cua toi xong chua`, `nop ho so chua`, `tinh trang ho so`, `tra cuu tinh trang` → **thẳng tới bước 5** (không tìm thủ tục). Giữ AC-8 và AC-16 đúng trên dữ liệu thật có thủ tục "căn cước công dân" (câu có "CCCD" sẽ mở rộng thành các từ đó).

### 4.5 Thứ tự xử lý một câu (BR-1)

```
HoiAsync(cauHoi, maThuTucNguCanh):
  0. cauChe = Che(cauHoi); phanTich = PhanTichCauHoi(Bo(cauHoi))             (§4.3)
     ngữ cảnh = maThuTucNguCanh nếu có trong chỉ mục, else null
     ung = TimThuTuc(phanTich)                                              (rỗng nếu tuNoiDung rỗng; tính một lần, dùng ở 1b và 3)
  0b. nếu hỏi tình trạng hồ sơ cá nhân → bước 5
  1a. nếu HoiCanBo hoặc HoiQuay → TraLoiQuay                                  (Loai = quay)
  1b/2. mau = TimMau(phanTich)
        mau có MucTrungTam và không bị bỏ qua → TraLoiTrungTam                (Loai = trung-tam)   [BR-9]
        mau có TraLoi → CauHoiMau                                            (Loai = cau-hoi-mau)
        "bị bỏ qua" (BR-9, bullet cuối) khi: (a) ung[0] đủ chắc, hoặc
                      (b) mục của mẫu là nop-truc-tuyen, câu có MucHoi = noi-nop và có ngữ cảnh
  3.  nếu có MucHoi: thuTuc = ung[0] nếu đủ chắc, else ngữ cảnh               → Loai = thu-tuc, Muc = MucHoi
  4.  nếu ung có phần tử đủ liên quan → thu-tuc-danh-sach (≤ 5)
  5.  khong-hieu: ghi cauChe vào IKhoCauChuaTraLoi; trả lienHe
```

- **Nếu Trung tâm chưa có dữ liệu** (`trung_tam` trống): các đáp án cần nó vẫn trả 200, `trungTam`/`lienHe` = `null`; FE ẩn dòng/nút tương ứng. Không ném lỗi.
- Bước 1b: mẫu Trung tâm khớp nhưng bị bỏ qua thì tiếp tục xuống bước 3 như thể mẫu không khớp; mẫu có `TraLoi` không bị bỏ qua (chỉ bước 2 ưu tiên hơn bước 3 theo BR-1).
- **Mục hỏi nhưng không xác định được thủ tục** (vd. "mấy ngày" khi vừa mở trợ lý, F09 AC-6 sau "Bắt đầu lại"): rơi xuống bước 4 nếu có ứng viên, nếu không thì bước 5 đúng theo BR-1 (xem Cần hỏi 1).
- Bước 5 ghi vào kho dù câu có ngữ cảnh; ghi lỗi (kho đầy, DB lỗi) chỉ log Warning (loại lỗi, không kèm nội dung câu) và **vẫn trả đáp án**.

### 4.6 Từng loại đáp án

**`thu-tuc`** — gọi `IChiTietThuTucService.LayAsync(ma)` (F03). Mỗi mục lấy trường tương ứng:

| `muc` | `noiDung` |
|---|---|
| `thoi-han` | `thoiHan` (đã qua `ThoiHanThuTuc.Chon`; `null` = chưa ghi rõ → FE nói xem trên Cổng DVC) |
| `ho-so` | `thanhPhanHoSo` tối đa 8; `tong` = tổng số giấy tờ khi bị cắt |
| `phi` | `phi` (`null` = chưa có) |
| `noi-nop` | `hinhThucNop`; ngoài `noiDung`: `quay`, `noiTiepNhanChuyen` (từ phân công của lĩnh vực của thủ tục), `trungTam` |
| `trinh-tu` | `trinhTu` tối đa 2 bước, mỗi bước cắt ở 500 ký tự (cắt thì thêm "…"); `tong` = tổng số bước |
| `ket-qua` | `ketQua` tối đa 6 |
| `can-cu` | `canCu` tối đa 6, trích yếu cắt ở 200 ký tự |

`thuTucKhac`: các ứng viên khác đủ liên quan, tối đa 3, chỉ khi `thuTuc` chọn từ tìm kiếm (không phải từ ngữ cảnh hay từ mã). `thuTucDangNoi` = mã của `thuTuc`.

**`thu-tuc-danh-sach`** — tối đa 5. `thuTucDangNoi` = mã của ứng viên đầu **nếu đủ chắc**, không thì giữ ngữ cảnh cũ. Nhờ vậy sau "kết hôn" (AC-11), câu "cần giấy tờ gì" trả hồ sơ của "Thủ tục đăng ký kết hôn", đúng với gợi ý đi kèm.

**`chu-de`** (BR-11, `POST /chu-de`) — chủ đề theo `ThuTu`; không có → 404. Thủ tục: `LinhVucMa` **bằng đúng** `LinhVucMa` của chủ đề (so mã, không tách từ — "Chăn nuôi" không lẫn "Nuôi con nuôi"), mỗi mã thủ tục một lần dù thuộc cả hai cấp, theo `ThuTu`; `tong` = số thủ tục, `danhSachThuTuc` = 10 đầu. `tong` = 0 → `danhSachThuTuc` rỗng, không `quay`, không `trungTam` (FE: "chưa có thủ tục nào thuộc lĩnh vực này"). `quay`, `noiTiepNhanChuyen` từ phân công của lĩnh vực; `thuTucDangNoi` = mã thủ tục duy nhất khi `tong` = 1, còn lại giữ ngữ cảnh gửi lên.

**`cau-hoi-mau`** — `traLoi` nguyên văn chữ thuần; `danhSachThuTuc` = các mã trong `MaThuTuc` của câu mẫu còn tồn tại (bỏ mã đã mất), mỗi thủ tục có nút popup + liên kết Cổng DVC (BR-6).

**`trung-tam`** (BR-9) — đọc `trung_tam`, `gio_lam_viec`, `lien_ket` lúc hỏi:

| `muc` | Điền | `coDuLieu` = false khi |
|---|---|---|
| `dia-chi` | `diaChi`, `banDo` (null thì FE không hiện liên kết — AC-22) | không có dòng `trung_tam` |
| `gio-lam-viec` | `gioLamViec` (đủ các dòng đã lưu), `ghiChuNgayNghi` | không có dòng giờ nào |
| `dien-thoai` | `dienThoai` | không có dòng `trung_tam` |
| `email` | `email` | không có dòng `trung_tam` |
| `nop-truc-tuyen` | `lienKet` = liên kết `lien_ket` có tên (sau `ChuanHoaTimKiem`) bằng "cong dich vu cong quoc gia" (hằng `TenLienKetCongDvc`, khớp F01 §14 câu 17) | không có liên kết đó |

`coDuLieu` = false → thêm `lienHe` (nút gọi). "Đang trong giờ / ngoài giờ" **không** tính ở BE (F02 BR-9: theo đồng hồ máy người dùng): FE dùng `dangLamViec` của F02 tại thời điểm nhận đáp án (§5.4).

**`quay`** (BR-3) — xác định **lĩnh vực**: lĩnh vực có tên liền trong câu (dãy từ dài nhất thắng); không có thì lĩnh vực của thủ tục đủ chắc trong câu; không có thì của thủ tục ngữ cảnh. `quay` = `Quay` của dòng `phan_cong_linh_vuc` cùng `LinhVucMa` (null nếu không có dòng hoặc `Quay` trống). `noiTiepNhanChuyen` từ cùng dòng.
- `muc = can-bo`: `canBo` = nhân sự (theo `ThuTu`) có `Quay` bằng `quay` của lĩnh vực — hoặc bằng số quầy trong câu ("quầy 4 ai phụ trách") — tối đa 10, `tong` = số tìm được; hoặc đúng người `TimTheoTen`. Không có quầy hoặc không có nhân sự khớp → `canBo = []`, không tên nào.
- `muc = quay`: `quay` như trên; `canBo = []`.
- Không xác định được lĩnh vực nào: `linhVuc` = null, `quay` = null, `canBo` = [] (FE nói hồ sơ nộp tại Trung tâm và gợi ý nêu lĩnh vực).
- Quầy lấy từ phân công thật nên được nêu kể cả khi chưa có nhân sự; **tên cán bộ chỉ từ bảng nhân sự** (Cần hỏi 3).

**`khong-hieu`** — `lienHe`: `dienThoai` của Trung tâm; `zaloOa` = `ZaloOa` hay null (BR-10, AC-23).

### 4.7 Ngữ cảnh `thuTucDangNoi`

Đáp án mang lại ngữ cảnh mới ở: `thu-tuc` (mã `thuTuc`), `thu-tuc-danh-sach` (ứng viên đầu nếu đủ chắc), `chu-de` (khi `tong` = 1), `cau-hoi-mau` (khi có đúng một thủ tục liên quan). Mọi trường hợp khác — Trung tâm, quầy, không hiểu — **giữ nguyên** ngữ cảnh gửi lên (người dân hỏi "giờ làm việc" rồi "phí" thì "phí" vẫn của thủ tục trước). FE luôn gán state = `thuTucDangNoi ?? null` của đáp án. Mã gửi lên không có trong chỉ mục → bỏ, và đáp án không phát lại mã đó.

### 4.8 Che thông tin cá nhân — `CheThongTinCaNhan` (BR-8)

Hai hàm tĩnh, cùng bộ mẫu, dùng `[GeneratedRegex]` có `matchTimeoutMilliseconds` (như `ChiTietThuTucService`). Thứ tự áp: email → số liền → số có dấu ngăn.

| Loại | Mẫu | `Che` | Ví dụ |
|---|---|---|---|
| Email | `[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}` | ký tự đầu + `***` + từ `@` trở đi | `nguyenvana@gmail.com` → `n***@gmail.com` |
| Số liền | `(?<!\d)\d{9,}(?!\d)` (CCCD 12 số, CMND 9 số, điện thoại) | 2 số đầu + `*` × (n − 4) + 2 số cuối | `0912345678` → `09******78`; `079123456789` → `07********89` |
| Số có dấu ngăn | `(?<!\d)(?:\+?84\|0)?\d{2,4}(?:[ .\-]\d{2,4}){2,3}(?!\d)`, **chỉ che khi** tổng số chữ số từ 9 đến 15 | như trên (bỏ dấu ngăn) | `0912 345 678` → `09******78` |

- Trong bảng, `\|` là ký tự `|` (hoặc) của biểu thức chính quy; viết thành `(?:\+?84|0)` trong mã.
- `Bo(cau)`: cùng mẫu, mỗi chỗ khớp thay bằng một dấu cách (để so khớp; không dùng để lưu).
- Mã thủ tục `1.012784` (7 chữ số, nhóm đầu 1 chữ số) và ngày tháng 8 chữ số không bị che. Tiền "1.000.000.000" bị che (an toàn hơn là để lọt); chấp nhận.
- Sau khi che, cắt về tối đa `CauChuaTraLoi.DoDaiToiDa` ký tự (che email ngắn có thể dài thêm vài ký tự), không cắt giữa cặp surrogate. Chuỗi này là đối số `IKhoCauChuaTraLoi.GhiAsync`; kho tự chuẩn hoá khoá gộp (BR-7) và tự giữ 90 ngày (BR-12, F00 T28).
- Câu gốc, bản che và kết quả so khớp **không** vào log. Log của F06 chỉ có: loại đáp án, thời gian xử lý, loại lỗi ghi kho.

### 4.9 Hằng và ngưỡng khởi điểm (`ChamDiem.ThamSo`)

| Hằng | Giá trị | Ghi chú |
|---|---|---|
| `HeSoTuSuaLoi` | 0,5 | Phần trọng số từ đã sửa tính vào tử số |
| Độ dài tối thiểu để sửa lỗi / ngưỡng sửa | 4 / (≤ 7: 1; ≥ 8: 2) | |
| `NguongLienQuanPhu` | 0,6 | Hiện ở bước 4 |
| `NguongChacPhu`, `NguongChacDice` | 0,7; 0,45 | "Thủ tục xác định được" |
| `NguongMauDice` | 0,7 | Khớp câu hỏi mẫu |
| Số lượng | 5 danh sách · 3 thủ tục khác · 10 chủ đề · 8 hồ sơ · 2 bước × 500 ký tự · 6 kết quả · 6 căn cứ × 200 ký tự · 10 cán bộ | Số theo Vàm Cỏ (Cần hỏi 5) |

## 5. FE — `src/FrontEnd/src/features/chatbot/` (chatbot-dev)

### 5.1 Hai nửa: vỏ và khung

**Vỏ** (trong bundle chính, ≤ 1 KB gzip):

```
features/chatbot/
  NutTroLy.tsx          # <NutTroLy /> không props: FloatingButton + nạp lười khung
  dieuKhienTroLy.ts     # batDauLaiTroLy(): bus sự kiện tối thiểu (F09)
  i18n/index.ts         # napNgonNguTroLy() — mẫu của features/thu-tuc/i18n
```

- Nút: `FloatingButton` (`viTri="phai"`, có sẵn trong `core/`), icon `MessageSquare` (import đích danh), chữ `t('tro-ly.nut')` từ `common` (đã đóng gói, không nạp namespace nào để vẽ nút), `dangMo`, `dieuKhien="khung-tro-ly"`.
- Bấm lần đầu: `import('./KhungTroLy')` và `napNgonNguTroLy()` chạy song song (`Promise.all`); nhớ promise, lỗi nạp thì quên để bấm lần sau thử lại (nút vẫn còn). `onPointerDown`, `onFocus` trên nút cũng gọi nạp trước (chỉ nạp mã, không gọi API).
- State của vỏ: `mo` (đang mở), `phien` (số nguyên), `Khung` (thành phần đã nạp, null trước đó). Bấm nút khi đang mở = đóng (C01 BR-13). Khi đóng, vỏ trả con trỏ về nút (`ref`).
- `batDauLaiTroLy()` (F09): vỏ đăng ký lắng nghe lúc gắn; khi gọi → `mo = false` và `phien + 1` (khung được dựng lại với `key={phien}`, xoá hội thoại, ngữ cảnh, ô nhập).
- Vỏ **không** import `KhungTroLy`, `api/troLy`, `Chip`, `Modal`, `i18n` của namespace `chatbot`, hay `gioLamViec` của F02 — kiểm bằng báo cáo chunk (T10).

**Khung** (`KhungTroLy.tsx`, chunk riêng, `export function KhungTroLy({ mo, onDong })`), chỉ tải khi mở:

```
KhungTroLy.tsx        # <section id="khung-tro-ly" role="dialog" aria-label=…> (không modal), hidden khi mo = false
useHoiTroLy.ts        # useReducer: tinNhan[], dangCho, thuTucDangNoi; gọi hoiTroLy/hoiChuDe; thử lại
TinNhan.tsx           # một bóng chat
CauTraLoiView.tsx     # switch theo loai → các view dưới
view/ TraLoiThuTuc · DanhSachThuTuc · TraLoiChuDe · TraLoiCauHoiMau · TraLoiTrungTam · GioLamViecView · TraLoiQuay · KhongHieu · NutLienHe · LoiTinNhan
ChoNutDoc.tsx         # chỗ của F07 (§6)
NhacDangXuat.tsx      # chỗ của F09 (§6)
diemGhepDoc.ts · vanBanDoc.ts      # §6
api/troLy.ts · i18n/{vi.json,index.ts} · *.module.css · *.test.ts(x)
```

### 5.2 Khung chat — hành vi

- **Bố cục** (prototype, design-system §5): rộng `23.125rem` (370 px; to theo kiosk vì tính bằng rem), cao `min(33.125rem, 100dvh − khoảng cách)`, cách góc `--gutter`, trên nút nổi, `z-index: var(--z-chat)` (45, dưới Modal 50). Dưới 600 px: toàn màn hình (`inset: 0`, không bo góc). Đầu khung nền `--color-primary-strong`: icon hộp thoại + "Trợ lý thủ tục" (DS-3) + chỗ nút đọc (F07) + `IconButton` ✕ ("Đóng trợ lý"). Tin của người dân nền xanh chữ trắng, của trợ lý nền trắng viền; cỡ chữ tin 12,5 px, giãn dòng `--line-height-chat`. Chỉ `var(--…)`. Hiệu ứng mở: chỉ độ mờ ≤ 150 ms, tắt khi giảm chuyển động (C01 AC-23).
- **Mở:** con trỏ vào ô nhập (C01 BR-13). **Đóng** (✕, bấm lại nút, **Esc** khi con trỏ trong khung và không có popup): vỏ trả con trỏ về nút "Trợ lý". Khung không bị huỷ (Q10).
- **Vòng Tab** (khi con trỏ trong khung): Tab và Shift+Tab đi vòng qua các phần tử bấm được trong khung rồi tới các phần tử `[data-ngoai-popup]` đang hiện (nút "Bắt đầu lại" của kiosk — F09 BR-7: nút đi sau các phần tử của khung), bằng `core/utils/vongTab` (T08). Không giữ khi popup đang mở: `Modal` đặt `inert` lên khung và nút (C01 plan §4.9) rồi trả con trỏ về nút đã mở popup.
- **Danh sách tin** `role="log"` `aria-live="polite"` `aria-relevant="additions"`; `aria-label` "Hội thoại với trợ lý". Tin mới của trợ lý cuộn sao cho **đầu** câu trả lời hiện ra (câu trả lời dài không cuộn xuống cuối). Tối đa 60 tin giữ trong state (bỏ tin cũ nhất). Tin có `React.memo`: URL đổi mỗi 300 ms khi gõ ở ô tìm của trang không làm vẽ lại cả danh sách.
- **Lời chào** là tin đầu của trợ lý khi hội thoại rỗng (không gọi API). Hội thoại có từ 1 tin của người dân thì không còn lời chào "trống" nhưng lời chào vẫn là tin đầu.
- **Chủ đề gợi ý:** hàng `Chip` lẻ (không `aria-pressed`) nhãn nhóm "Chủ đề gợi ý", theo thứ tự API; không có chủ đề → không vẽ hàng. Bấm chip: thêm tin của người dân (tên hiển thị), gọi `hoiChuDe`.
- **Gợi ý hỏi tiếp:** dưới đáp án `thu-tuc-danh-sach` mới nhất và đáp án `chu-de` mới nhất, một hàng chữ gợi ý kèm 4 `Chip` ("Cần giấy tờ gì?", "Mấy ngày?", "Phí bao nhiêu?", "Nộp ở đâu?") bấm là gửi như câu hỏi (AC-11). Chip chỉ hiện ở đáp án cuối cùng của hội thoại.
- **Ô nhập:** `<label>` ẩn "Câu hỏi", `maxLength={500}`, `autoComplete="off"`, `enterKeyHint="send"`. Khi độ dài đạt 500: dòng `role="status"` "Tối đa 500 ký tự" nối bằng `aria-describedby` (AC-13). Enter hoặc nút "Gửi" (`Button` với `dangXuLy` khi chờ → bấm hai lần nhanh chỉ gửi một câu, C01 AC-5). Câu gửi đi đã cắt khoảng trắng hai đầu; rỗng thì không gửi. Sau khi gửi, con trỏ ở lại ô nhập.
- **Lời miễn trừ** `common:mien-tru` dưới ô nhập (F08 AC-8).
- **Đang chờ:** tin tạm "Đang tìm câu trả lời…" (chữ tĩnh, không hoạt ảnh) với `aria-busy`.
- **Lỗi** (mạng, 429, 5xx): tin của trợ lý dùng `useThongBaoLoi()` của `core` (đúng câu của `common:loi.*`, kể cả "Bạn thao tác quá nhanh…" — AC-7), `maTraCuu` khi `loi-he-thong` (C01 BR-11), nút "Thử lại" gửi lại đúng câu đó. Trang không lỗi, khung và hội thoại còn nguyên.

### 5.3 Câu trả lời → giao diện

Mọi chữ qua `t()` (namespace `chatbot`, §5.5). Mọi tên thủ tục, câu mẫu, địa chỉ, tên cán bộ là nội dung dữ liệu, hiện bằng nút chữ của React (không HTML).

| `loai` | Hiện |
|---|---|
| `thu-tuc` | Dòng đầu "[mã] tên thủ tục" (cắt 90 ký tự); nội dung theo `muc`: thời hạn (hoặc "chưa ghi rõ, xem trên Cổng DVC Quốc gia"), danh sách giấy tờ (kèm "bản chính/bản sao" khi có số, như F03 BR-3; "và n giấy tờ nữa — xem chi tiết" khi `tong` lớn hơn), phí, nơi nộp (hình thức nộp + `quay`/Trung tâm theo BR-3), trình tự, kết quả, căn cứ (chỉ chữ). Cuối: nút "Xem chi tiết" + liên kết "Xem và nộp trên Cổng DVC"; nếu có `thuTucKhac`: dòng "Nếu không đúng thủ tục, chọn lại bên dưới:" và danh sách (mỗi thủ tục một cặp nút) |
| `thu-tuc-danh-sach` | "Tìm thấy n thủ tục liên quan, sát nhất ở trên cùng:" rồi danh sách; mỗi dòng: tên, mã · cấp · lĩnh vực · mức độ (`Badge`), cặp nút (AC-29) |
| `chu-de` | "Lĩnh vực **X** có n thủ tục:" + tối đa 10 dòng như trên + (nếu n > 10) "Hiển thị 10 trong n thủ tục" + nơi nộp theo BR-3 + gợi ý gõ tên để hỏi thêm; n = 0: "Chưa có thủ tục nào thuộc lĩnh vực này." |
| `cau-hoi-mau` | `traLoi` giữ xuống dòng (`white-space: pre-line`); thủ tục liên quan (nếu có) như danh sách |
| `trung-tam` | Theo `muc` (§5.4). `coDuLieu` = false: "Chưa có thông tin …" + nút gọi (+ Zalo) |
| `quay` | `quay` khác null: "Hồ sơ lĩnh vực X nộp tại quầy N" (+ nơi tiếp nhận chuyển; + danh sách cán bộ: tên, chức vụ, mô tả khi `canBo` có người). `quay` null: "Hồ sơ nộp tại <Trung tâm>, địa chỉ …" — **không** số quầy, **không** tên (BR-3) |
| `khong-hieu` | Câu xin lỗi + nút "Gọi Trung tâm"; thêm "Mở Zalo" khi `lienHe.zaloOa` (BR-10) |

- **Mỗi thủ tục nhắc tới = một cặp nút** (BR-6): "Xem chi tiết" (`Button secondary`, `useMoThuTuc().mo(ma)` → thêm `?ma=` lên địa chỉ — AC-17) và "Xem và nộp trên Cổng DVC" (`ExternalLink bienThe="nut-accent"`, `linkDvc(ma)`; tab mới). Dùng `NutMoThuTuc` hoặc `useMoThuTuc`/`linkDvc` của F03 (hai module nhỏ, không kéo popup — F03 plan §4.9). Tên đọc của nút "Xem chi tiết" kèm tên thủ tục (WCAG 2.5.3).
- Nút gọi: `ExternalLink` với `tel:` + số (đi qua `phanLoaiLienKet` của C01); nút Zalo: `ExternalLink` tới `zaloOa` (tab mới, `noopener noreferrer`).
- Popup mở lên **trên** khung (Modal `--z-modal` 50 > 45); khung và hội thoại không mất (Q10); đóng popup hoặc "Quay lại" → popup đóng, địa chỉ bỏ `ma` (F03).

### 5.4 Giờ làm việc trong khung chat

`TraLoiTrungTam` (mục `gio-lam-viec`) dùng `gopNgay` và `dangLamViec` có sẵn trong `features/trang-chu/gioLamViec.ts` (F02; hàm thuần, không React). Nhãn thứ ("Thứ Hai – Thứ Sáu", "Buổi sáng", "Buổi chiều") và hai nhãn trạng thái có trong `chatbot/i18n/vi.json` — lặp lại một ít chữ để namespace độc lập, không nạp `trang-chu`. Trạng thái "Đang trong giờ làm việc"/"Ngoài giờ làm việc" **tính một lần lúc đáp án đến** (`luc = Date.now()` lưu trong tin) — một câu trả lời là ảnh chụp tại lúc hỏi, không đổi theo thời gian (AC-19: 10:00 → "Đang trong giờ", 12:00 hỏi lại → "Ngoài giờ"). `gioLamViec` từ API có trường `null`, khớp kiểu `GioNgay` của F02.

### 5.5 Câu chữ — `features/chatbot/i18n/vi.json` (namespace `chatbot`)

Nạp cùng chunk khung (`napNgonNguTroLy()`), không vào bundle chính. Khoá có kiểu (`app/i18n.d.ts`). Các nhóm (câu cụ thể do chatbot-dev điền; câu in đậm là câu spec ghi sẵn):

| Nhóm | Gồm |
|---|---|
| `khung.*` | tên khung "Trợ lý thủ tục", nhãn đóng "Đóng trợ lý", nhãn danh sách tin, lời chào, "Đang tìm câu trả lời…" |
| `nhap.*` | nhãn "Câu hỏi", placeholder "Nhập câu hỏi về thủ tục", "Gửi", **"Tối đa {{so}} ký tự"** (AC-13) |
| `chu-de.*` | nhãn nhóm chip, câu trả lời chủ đề ("Lĩnh vực {{ten}} có {{tong}} thủ tục:", "Hiển thị {{so}}/{{tong}}", **"Chưa có thủ tục nào thuộc lĩnh vực này."**, gợi ý gõ tên) |
| `goi-y.*` | các chip hỏi tiếp, dòng "Bạn có thể hỏi tiếp:" |
| `thu-tuc.*` | tiêu đề từng mục, "chưa ghi rõ…", "bản chính/bản sao", "và {{so}} … nữa", "Nếu không đúng thủ tục, chọn lại:", "Xem chi tiết {{ten}}", "Xem và nộp trên Cổng DVC", "{{so}} thủ tục liên quan, sát nhất ở trên cùng" |
| `trung-tam.*` | từng mục: địa chỉ, giờ làm việc (nhãn thứ, buổi, **"Đang trong giờ làm việc"**, **"Ngoài giờ làm việc"**), điện thoại, email, nộp trực tuyến; "Xem bản đồ"; "Chưa có thông tin về {{muc}}." |
| `quay.*` | nộp tại quầy {{quay}}; nơi tiếp nhận chuyển; nộp tại Trung tâm {{ten}}, địa chỉ {{diaChi}}; cán bộ ({{xungHo}} {{hoTen}} ({{chucVu}}) phụ trách …); nhắc nêu lĩnh vực |
| `khong-hieu.*` | câu xin lỗi, "Gọi Trung tâm", "Mở Zalo" |

Dùng lại từ `common`: `mien-tru`, `loi.*`, `nut.thu-lai`, `nut.dong`, `trang-thai.*`, `lien-ket-ngoai.mo-trang-moi`. Thêm vào `common`: `tro-ly.nut` ("Trợ lý") — cho vỏ. Biến nội suy đặt tên `so`, `ten`, `tong` (không dùng `count`). Lời xưng hô trung tính, tránh đại từ; khi cần dùng "ông/bà" (DS-4, design-system). Không dùng emoji (Vàm Cỏ có, bản này bỏ).

### 5.6 Việc ở `core/` và `app/` (ui-core-dev)

1. `core/utils/vongTab.ts` — trích từ `Modal.tsx`: `layVongTab(khung)` (và các hàm phụ `bamDuoc`, `dangHienThi`, hằng `data-ngoai-popup`) cộng một tiện ích `xuLyPhimTab(e, khung)` dùng chung; `Modal` đổi sang gọi lại. Test của `Modal` không đổi. Chatbot dùng cùng hàm nên khung chat và popup đi vòng giống hệt nhau.
2. `core/i18n/vi/common.json`: khoá `tro-ly.nut`.
3. `app/i18n.d.ts`: thêm namespace `chatbot` (`import type`, không tăng bundle).
4. `app/layout/Layout.tsx`: gắn `<RanhGioiKhung><NutTroLy /></RanhGioiKhung>` ở chỗ đã chừa (sau chân trang, trước popup); Tab vì thế đi: … chân trang → nút Trợ lý → khung (khi mở) → (kiosk) nút "Bắt đầu lại". `AppFooter` đã chừa `--fab-clearance`.

## 6. Điểm ghép với F07 và F09

Hai chức năng này chưa có plan; F06 chừa sẵn các chỗ dưới đây (đã có trong T11), plan của F07 và F09 dùng đúng tên, không sửa hợp đồng.

**F07 — đọc câu trả lời**

| Điểm ghép | Chi tiết |
|---|---|
| Chỗ nút đọc | `ChoNutDoc.tsx` trong đầu khung (giữa tên và ✕). F06 giao bản rỗng (`return null`). F07 thay nội dung: nút bật/tắt đọc (ẩn khi máy không có giọng tiếng Việt — F07 BR-2), nạp lười phần đọc ở lần bật đầu (F07 BR-4). Chip `aria-pressed` theo prototype |
| Dữ liệu cho F07 | Context `DiemGhepDoc` (hook `useDiemGhepDoc()` trong `diemGhepDoc.ts`): `{ cauTraLoiMoi: { id: number; vanBan: string } \| null; khungDangMo: boolean }`. `id` đổi mỗi câu trả lời mới: F07 dừng câu đang đọc rồi đọc câu mới (F07 BR-7, AC-7); `khungDangMo = false` → dừng đọc (F07 AC-8); mở lại không tự đọc tiếp |
| Văn bản để đọc | `vanBanDoc(cau: CauTraLoi, t: TFunction): string` trong `vanBanDoc.ts`: chữ thuần của câu trả lời ghép bằng cùng khoá `t()` với giao diện, **bỏ** nhãn nút, đường dẫn, dòng nhắc đăng xuất. Viết tắt chưa mở rộng: F07 đọc bảng viết tắt (F07 BR-3) |
| Bảng viết tắt | F07 cần dữ liệu `viet_tat` ở FE: nằm ngoài phạm vi F06 (F06 mở rộng viết tắt ở BE cho câu **hỏi**, không phải câu trả lời). Plan F07 định nghĩa endpoint |

**F09 — kiosk**

| Điểm ghép | Chi tiết |
|---|---|
| Xoá hội thoại | `batDauLaiTroLy()` từ `features/chatbot/dieuKhienTroLy.ts` (vỏ, nhẹ): đóng khung, xoá tin nhắn, ngữ cảnh, ô nhập (F09 BR-7, AC-6, AC-9). F07 dừng đọc nhờ khung bị huỷ và `khungDangMo = false`. Hội thoại không ghi vào bất kỳ nơi lưu trữ nào của trình duyệt nên không còn gì khác phải xoá |
| Dòng nhắc đăng xuất | `NhacDangXuat.tsx` đặt giữa đầu khung và danh sách tin (như prototype). Props `{ coLienKetCongDvc: boolean }`; F06 giao bản rỗng. `coLienKetCongDvc` = hội thoại có ít nhất một đáp án chứa liên kết tới Cổng DVC (đáp án `thu-tuc`, `thu-tuc-danh-sach`, `chu-de` với `danhSachThuTuc` khác rỗng, `cau-hoi-mau` có thủ tục liên quan, `trung-tam` mục `nop-truc-tuyen` có `lienKet` thuộc `dichvucong.gov.vn`). Một dòng cho cả khung (F09 BR-4). F06 tính cờ này trong `useHoiTroLy` |
| Vòng Tab | Nút "Bắt đầu lại" mang `data-ngoai-popup`; vòng Tab của khung và `Modal` đã tính nó (§5.2) |
| Lịch sử | Khung không tạo mục lịch sử. Mở popup từ khung: `useMoThuTuc` đã dùng `replace` ở kiosk (F03 plan §4.2) |
| Giới hạn | 60 câu/phút/IP đã là cấu hình; kiosk dùng chung một bộ đếm (F09 BR-5) — không code thêm |

## 7. Hiệu năng

| Mục | Chỉ tiêu | Cách đạt |
|---|---|---|
| JS tải đầu (CLAUDE.md ≤ 200 KB gzip) | Hiện ≈ 188 KB ở `/` 1280 px. **F06 thêm ≤ 1 KB** | Vỏ gồm `FloatingButton` + icon + hàm nạp + bus + khoá `tro-ly.nut` (ước 0,7–1 KB). Khung (UI, reducer, `api/troLy`, view, i18n, `Chip`, `ExternalLink`, `gioLamViec`) ước 14–20 KB gzip, chỉ tải khi mở. T10 đo `index`/`vendor` trước và sau khi gắn vỏ; **vượt +1 KB: dừng, báo người dùng trước khi cắt gì** |
| Mở khung | Hiện khung ≤ 1 giây trên 4G giả lập sau khi bấm; bấm lần sau tức thì | Nạp trước khi `pointerdown`/`focus`; chunk và câu chữ song song |
| API p95 (AC-6) | ≤ 300 ms với ~1.000 thủ tục | Chỉ mục trong bộ nhớ; chỉ mục ngược nên không quét toàn bộ; mỗi câu: 1 truy vấn phiên bản + ≤ 6 truy vấn bảng nhỏ + 1 truy vấn khoá chính (thủ tục, ở bước 3). Lần đầu sau mỗi lần nhập tốn thêm thời gian dựng chỉ mục (10–50 ms, một lần) |
| Bộ nhớ | 2–5 MB chỉ mục; kho Mẫu ≤ 1.000 dòng × 500 ký tự (≈ 1 MB) | |
| Mạng khi gõ | Không gửi gì khi đang gõ; một yêu cầu cho mỗi câu | |
| Lighthouse | Không đổi (khung không có trong trang lúc tải) | Vỏ là một nút `position: fixed` có kích thước cố định → không gây dịch bố cục |

## 8. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Thông tin cá nhân trong câu hỏi | Q1 (POST, không trên URL) · Q9 (che trước khi lưu và trước khi so khớp) · không log nội dung câu · không `useMutation`/`useQuery` cho câu hỏi · không lưu hội thoại ở trình duyệt · kho Mẫu tối đa 1.000 dòng, kho PostgreSql có trần mềm 50.000 (F00 §9.6) |
| Đầu vào | `CauHoi` 1–500, có chữ nhìn thấy; `MaThuTuc` ≤ 20 và đúng định dạng, kiểm có trong dữ liệu; `ThuTu` trong khoảng; JSON sai → 400; body ≤ 64 KB; regex có timeout; không nối chuỗi vào SQL (không viết SQL nào) |
| Giới hạn tần suất | 60 câu/phút/IP cho hai POST (`RateLimiting:TroLy`); chip chủ đề cũng tính (AC-28); GET danh sách chip theo `danh-muc` |
| Dữ liệu ra trình duyệt | Chỉ trường của §3.2; thủ tục chỉ `ma`, `ten`, lĩnh vực, mức độ, hai cờ cấp; không `ma_dvc`, đơn vị, ID nội bộ, `ten_tim_kiem`. Số quầy và tên cán bộ chỉ ra khi dữ liệu có (BR-3). Không dữ liệu của người dân hỏi trước (không có phiên) |
| Chèn nội dung | Tên thủ tục, `traLoi` mẫu, địa chỉ, tên cán bộ: chữ thuần trong nút chữ của React; **không** `dangerouslySetInnerHTML`; câu mẫu giữ xuống dòng bằng CSS |
| Liên kết | Cổng DVC: `linkDvc(ma)` (host cố định, `encodeURIComponent`); Zalo, bản đồ, Cổng DVC Quốc gia: `ExternalLink` (chỉ http/https, `noopener noreferrer`); `tel:`, `mailto:` qua `phanLoaiLienKet`. Mã `ma` đưa lên địa chỉ phải đúng định dạng (`laMaHopLe` của F03) |
| CSP | Không script hay style inline; CSS Module; không tài nguyên ngoài; không micro (F07 BR-6) |
| Chống thổi cache | Hai POST không cache; GET chip không nhận query (không `[DanhMucQuery]`) |
| Lỗi | ProblemDetails có `code`, `maTraCuu`; không nhắc lại câu hỏi; không stack trace |
| Mã nguồn | Toàn bộ luật ở BE; FE chỉ vẽ. Bản build FE theo CLAUDE.md (obfuscate, không source map) |

## 9. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Api/Chatbot/CheThongTinCaNhanTests.cs` | chatbot-dev | Bảng ở §4.8 và AC-8, AC-16; không che mã `1.012784`, ngày 8 chữ số; câu có nhiều số; `Bo` thay bằng dấu cách; cắt 500 ký tự; không cắt giữa cặp surrogate |
| `Tests/Api/Chatbot/TimKiem/*Tests.cs` | chatbot-dev | `ChuoiTu` (tách, ký tự vô hình U+200B–U+200F và U+FEFF bị bỏ), `KhoangCachSua` (thay, chèn, xoá, đảo; giới hạn), sửa lỗi xác định (hoà → `df` rồi thứ tự), mở rộng viết tắt dài nhất trước, thay đồng nghĩa dài nhất trước, Dice thứ tự và làm tròn |
| `Tests/Api/Chatbot/TroLyServiceContract.cs` + `TroLyServiceTrenMau.cs` | chatbot-dev | **Test hợp đồng** (F00 §9.10, R7) với bộ thử bên dưới; lớp con dựng `INguonDuLieu` từ một `TepDuLieuMau`. Bộ dữ liệu thử: `Tests/Api/DuLieuThu/TroLyThu.cs` — nền là `TepDuLieuMau.Nhung` cộng biến thể bằng C# (phân công + nhân sự; thêm câu mẫu "điều kiện tách thửa đất" có câu trả lời; đổi địa chỉ Trung tâm; xoá giờ làm việc; thêm Zalo OA; xoá liên kết Cổng DVC; thêm từ đồng nghĩa "giấy khai sinh"; lĩnh vực 15 thủ tục / 0 thủ tục) |
| `Tests/Api/Chatbot/TroLyTests.cs` | chatbot-dev | HTTP với `ApiFactory` (nguồn Mẫu) và service giả: JSON camelCase đúng tên trường §3.2, `null` có mặt; 200; 400 (rỗng, toàn khoảng trắng, 501 ký tự → không ghi kho — AC-13); 404 chủ đề; 405; 413; 429 ở ngưỡng 5 (AC-7) và 60 (AC-28); chip chủ đề tính chung bộ đếm; GET chip có `ETag`/304; lỗi 400 và log **không chứa** nội dung câu (bắt bằng `BoGhiLog` có sẵn); ghi kho lỗi → vẫn 200 |
| `Tests/Api/KienTrucTests`, `QuyTacTruyVanTests` (có sẵn) | — | Tự quét `Features/Chatbot/`: không `AppDbContext` (chỉ kho PostgreSql), không `StartsWith`/`EndsWith`/`Contains` kèm so sánh ngoài `ChuoiTu.cs` có ghi ngoại lệ |
| `Tests/Integration/Chatbot/TroLyServiceTrenPostgreSql.cs` | tester | Lớp con PostgreSQL của hợp đồng; **JSON đáp án của cả bộ thử giống hệt giữa hai nguồn** (mạnh hơn mức chấp nhận ở F00 §9.7); ghi `cau_chua_tra_loi` thật (AC-8, AC-14, AC-16); giả lập ngày cho AC-27 (hạn 90 ngày); đo p95 (AC-6) |
| `Tests/Integration/Chatbot/TroLyHieuNangTests.cs` | tester | 1.000 thủ tục (`TroLyThu.TaoLon(1000)`: file mẫu + tên ghép từ từ vựng thật), 1.000 yêu cầu trải đều bộ thử, `RateLimiting:TroLy` đặt rất lớn: p95 ≤ 300 ms, p99 ghi lại; riêng lần dựng chỉ mục |
| `src/FrontEnd/src/features/chatbot/**/*.test.tsx` | chatbot-dev | Vitest + `fetch` giả: vỏ không import khung (kiểm bằng `import()` đếm); khung rỗng có lời chào, hàng chip theo API (6 → 5), không chip khi rỗng; gửi → tin người dân + đáp án; ngữ cảnh gửi kèm và gán lại; từng `loai` vẽ đúng (kể cả `quay` null không có chữ "quầy", Zalo ẩn khi null); 429 hiện đúng câu và không lỗi; thử lại; ô nhập dừng ở 500 và báo; Enter; bấm đúp Gửi → một yêu cầu; mở/đóng trả con trỏ; Esc; vòng Tab gồm `[data-ngoai-popup]`; `batDauLaiTroLy` xoá hội thoại và ô nhập; `useMoThuTuc().mo` được gọi đúng mã; `vanBanDoc` bỏ nhãn nút; giờ làm việc với đồng hồ giả (AC-19) |
| `e2e/tro-ly.spec.ts` | tester | AC-1, AC-2, AC-9, AC-11, AC-13, AC-17, AC-19, AC-23, AC-25, AC-28, AC-29 trên trình duyệt thật; kiosk 1080×1920 (khung không che nút "Bắt đầu lại"); axe ở khung mở (thường và kiosk); gõ bàn phím từ đầu đến cuối; popup trên khung |
| Ngân sách | tester | JS tải đầu ≤ 200 KB gzip ở `/` 375 và 1280 px (bản Release, đã obfuscate); chunk khung không tải nếu không bấm; Lighthouse mobile ≥ 85 |

### Bộ thử ≥ 30 câu (hợp đồng cho `TroLyServiceContract`; ghi kỳ vọng bằng `loai`, `muc`, mã)

`N` = file mẫu nhúng; `+PC` = thêm phân công (Hộ tịch → quầy 3, Đất đai → quầy 4) và một cán bộ ở quầy 4; `+Mau` = thêm câu mẫu "điều kiện tách thửa đất" kèm câu trả lời; `ctx` = `maThuTuc` gửi kèm.

| # | Dữ liệu | Câu hỏi (ctx) | Kỳ vọng | AC |
|---|---|---|---|---|
| 1 | N | làm giấy khai sinh cần giấy tờ gì | `thu-tuc`/`ho-so` `1.001193`, `thuTucDangNoi` = `1.001193`, `thuTucKhac` ≤ 3 | 1 |
| 2 | N | mấy ngày (ctx `1.001193`) | `thu-tuc`/`thoi-han` `1.001193`, `thoiHan` null (nguồn ghi "1 Khác") | 2 |
| 3 | N | mấy ngày (không ctx) | `khong-hieu`, có 1 dòng trong kho | 1 (bước 5) |
| 4 | N+PC | hộ tịch nộp quầy mấy | `quay`, `linhVuc` "Hộ tịch", `quay` 3 | 3 |
| 5 | N | hộ tịch nộp quầy mấy | `quay`, `quay` null, `canBo` rỗng | 24 |
| 6 | N+PC | chứng thực nộp quầy mấy | `quay` null (lĩnh vực chưa có quầy) | 3 |
| 7 | N | giá vàng hôm nay | `khong-hieu`, `lienHe.zaloOa` null | 4, 23 |
| 8 | N | khai sjnh | `thu-tuc-danh-sach`, đầu danh sách `1.001193` | 5 |
| 9 | N | khai sinh | `thu-tuc-danh-sach`, đầu `1.001193`, `thuTucDangNoi` `1.001193` | 5 |
| 10 | N | kết hôn | `thu-tuc-danh-sach`, đúng 5 mục, tên nào cũng có "kết hôn", `thuTucDangNoi` `1.000894` | 11 |
| 11 | N | cần giấy tờ gì (ctx từ câu 10) | `thu-tuc`/`ho-so` `1.000894` | 11 |
| 12 | N+Mau | dieu kien tach thua | `cau-hoi-mau` đúng `traLoi` của câu thêm, không phải danh sách | 10 |
| 13 | N+đồng nghĩa | xin giấy khai sinh | `thu-tuc-danh-sach`, đầu `1.001193` | 15 |
| 14 | N | đk kết hôn cần gì | `thu-tuc`/`ho-so` `1.000894` | 15 |
| 15 | N | cưới vợ | `thu-tuc-danh-sach`, đầu `1.000894` | 2 |
| 16 | N+PC | ai phụ trách đất đai | `quay`/`can-bo`, `quay` 4, `canBo[0]` là cán bộ đã thêm | 12 |
| 17 | N | ai phụ trách đất đai | `quay`/`can-bo`, `quay` null, `canBo` rỗng | 24 |
| 18 | N | đăng ký khai sinh nộp ở đâu | `thu-tuc`/`noi-nop` `1.001193`, `quay` null, `hinhThucNop` 3 phần tử | 21, 24 |
| 19 | N+PC | đăng ký khai sinh nộp ở đâu | như 18 nhưng `quay` 3 | 24 |
| 20 | N | nộp hồ sơ trực tuyến ở đâu | `trung-tam`/`nop-truc-tuyen`, `lienKet.url` là Cổng DVC Quốc gia | 21 |
| 21 | N | nộp hồ sơ trực tuyến ở đâu (ctx `1.001193`) | `thu-tuc`/`noi-nop` (BR-9 bullet cuối) | 21 |
| 22 | N | trung tâm ở đâu | `trung-tam`/`dia-chi`, `diaChi` = địa chỉ Trung tâm, `banDo` null | 18, 22 |
| 23 | N đổi địa chỉ | trung tâm ở đâu | `diaChi` = địa chỉ mới | 18 |
| 24 | N | van phong nam cho nao | `trung-tam`/`dia-chi` | 26 |
| 25 | N | mấy giờ làm việc | `trung-tam`/`gio-lam-viec`, `coDuLieu`, 5 dòng | 19 |
| 26 | N bỏ giờ | giờ làm việc | `coDuLieu` false, `lienHe.dienThoai` | 22 |
| 27 | N | số điện thoại trung tâm | `trung-tam`/`dien-thoai` | 20 |
| 28 | N | email trung tâm | `trung-tam`/`email` | 20 |
| 29 | N | số 0912345678 của tôi nộp hồ sơ chưa | `khong-hieu`; kho: `số 09******78 của tôi nộp hồ sơ chưa` | 8 |
| 30 | N | CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu | `khong-hieu`; kho có `07********89` và `n***@gmail.com`, không có số/email đầy đủ | 16 |
| 31 | N | giá vàng hôm nay (hai lần) | kho một dòng, số lần gặp 2 | 14 |
| 32 | N | xem bói | `khong-hieu` | 27 |
| 33 | N+Zalo | giá vàng hôm nay | `lienHe.zaloOa` có giá trị | 23 |
| 34 | N | chủ đề 4 "Chăn nuôi" | `chu-de`, `tong` = số thủ tục lĩnh vực `chan-nuoi`, không thủ tục nào của `nuoi-con-nuoi` | 25 |
| 35 | N | chủ đề 6 "Xây dựng" | `chu-de`, `chuDe.linhVuc` = "Hoạt động xây dựng" | 25 |
| 36 | thử | chủ đề lĩnh vực 15 thủ tục / 0 thủ tục | `tong` 15 với 10 phần tử / `tong` 0, danh sách rỗng | 25 |
| 37 | N | 1.001193 mấy ngày | `thu-tuc`/`thoi-han` `1.001193` (nhận bằng mã) | 1 (bước 3) |
| 38 | N | mấy ngày (ctx `9.999999`) | như câu 3 (ngữ cảnh không có trong dữ liệu bị bỏ) | Q2 |
| 39 | N | cho tôi hỏi làm giấy khai sinh cần giấy tờ gì ạ | như câu 1 (từ đệm) | 1 |
| 40 | N | tách thửa cần giấy tờ gì | `thu-tuc`/`ho-so` `1.012784` (không bị câu mẫu tách thửa chiếm) | 10 |
| 41 | N | Trung tâm ở đâu?  (đã gõ kèm U+200E giữa chữ) | như câu 22 (ký tự vô hình bị bỏ) | 26 |
| 42 | N | 501 ký tự (qua `POST` trực tiếp) | 400; kho không thêm dòng | 13 |

## 10. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 thứ tự 5 bước | §4.5, §4.6 | T05, T07; FE T11, T12 |
| BR-2 không dấu, gõ sai, đồng nghĩa, viết tắt | §4.2, §4.3 | T02, T03, T07 |
| BR-3 không đoán quầy, cán bộ | §4.6 (`quay`), §5.3 | T04, T07, T12 |
| BR-4 xử lý ở máy chủ, FE chỉ gửi câu và thủ tục đang nói tới | Q1, Q2, §3, §5 | T05, T06, T09 |
| BR-5 500 ký tự; 60 câu/phút cấu hình được | §3.1, §3.4, §5.2 | T06, T11; có sẵn `RateLimiting:TroLy` |
| BR-6 nút popup + liên kết Cổng DVC, hội thoại còn khi đóng popup | §5.3, Q10 | T11, T12, T13 |
| BR-7 gộp câu chưa trả lời | §4.5 (bước 5), `GhiAsync` có sẵn | T05, T07 |
| BR-8 che CCCD, điện thoại, email | §4.8 | T01, T05 |
| BR-9 câu hỏi về Trung tâm | §4.5, §4.6 (`trung-tam`) | T04, T05, T07, T12 |
| BR-10 nút gọi, nút Zalo | §4.6 (`khong-hieu`), §5.3 | T04, T12 |
| BR-11 chủ đề gợi ý | §3, §4.6 (`chu-de`), §5.2 | T05, T06, T11, T12 |
| BR-12 giữ 90 ngày, ngoại lệ demo | Có sẵn (F00 T28); F06 chỉ ghi | T05, T17 |
| AC-1, AC-2 | §4.5, §4.6 | T05, T07 |
| AC-3, AC-24 | §4.6 (`quay`) | T04, T07 |
| AC-4, AC-14 | §4.5 (bước 5) | T05, T07, T17 |
| AC-5, AC-15, AC-26 | §4.3 | T03, T07 |
| AC-6 | §7 | T17 |
| AC-7, AC-28 | §3, §5.2 | T06, T18 |
| AC-8, AC-16 | §4.8 | T01, T07, T17 |
| AC-9, AC-17, AC-29 | §5.3 | T12, T13, T18 |
| AC-10 | §4.3 (`TimMau`) | T03, T07 |
| AC-11 | §4.6, §5.2 | T05, T11, T12 |
| AC-12 | §4.4, §4.6 | T04, T07 |
| AC-13 | §3.1, §5.2 | T06, T11, T13 |
| AC-18, AC-20, AC-21, AC-22 | §4.6 (`trung-tam`) | T04, T07, T12 |
| AC-19 | §5.4 | T12, T13, T18 |
| AC-23 | §4.6 (`khong-hieu`), §5.3 | T04, T12, T18 |
| AC-25 | §3, §4.6 (`chu-de`), §5.2 | T05, T06, T11, T18 |
| AC-27 | F00 T28 (xoá), F06 chỉ ghi | T17 |
| Ngân sách JS, nạp lười (F00 AC-20) | §5.1, §7 | T09, T10, T18 |
| F00 AC-22 (che thông tin cá nhân trong log) | §4.8, §8 | T06, T19 |
| Hai nguồn cho cùng kết quả (F00 §9.7) | Q3, §9 | T07, T17 |

## 11. Rủi ro

1. **Ngưỡng khởi điểm chưa đo.** `0,6/0,7/0,45/0,7` chọn từ tính tay trên dữ liệu mẫu. Giảm thiểu: bộ 42 câu ở §9 là tiêu chí nghiệm thu; chatbot-dev chỉnh số, không chỉnh cấu trúc, và thêm ca khi gặp lỗi; tester thêm câu thật từ danh sách câu chưa trả lời sau khi chạy thật.
2. **Từ đệm thiếu hoặc thừa.** Câu có từ lạ ("ạ", "nhỉ", "ơi") làm tụt độ phủ; từ đệm lỡ có nghĩa thủ tục làm mất kết quả. Giảm thiểu: `idf` của từ lạ chỉ bằng nửa mức cao nhất (§4.2); quy tắc "không đưa từ nghĩa thủ tục vào danh sách"; test câu 39.
3. **Sửa lỗi gõ nhầm sang từ khác** ("vàng" → "vùng"). Giảm thiểu: hệ số 0,5 cho từ đã sửa; ngưỡng `phu` làm tụt xuống bước 5 khi cả câu không khớp (câu 7, 32).
4. **Câu hỏi mẫu nuốt câu hỏi thủ tục** ("tách thửa cần giấy tờ gì" bị nhầm vào câu mẫu tách thửa). Giảm thiểu: Dice có IDF trên kho mẫu, ngưỡng 0,7; test câu 40; Trung tâm đặt cách hỏi mẫu đặc trưng.
5. **Thiếu chữ "Cổng Dịch vụ công Quốc gia" trong liên kết** → mục nộp trực tuyến trả "chưa có thông tin". Giảm thiểu: F01 đã cảnh báo khi nhập (F01 §14 câu 17); hằng `TenLienKetCongDvc` ghi rõ nguồn.
6. **Chỉ mục lệch phiên bản trong lúc nhập** (đọc dở): hiếm; lần sau tự dựng lại; không ném lỗi.
7. **Che thông tin cá nhân quá tay hoặc sót.** Quá tay: số tiền lớn; sót: số điện thoại gõ chữ ("không chín một…"). Chấp nhận ở quy mô một xã; câu chưa trả lời chỉ do cán bộ Trung tâm xem. Ghi vào báo cáo T01.
8. **Ngân sách JS sát ngưỡng** (nền ≈ 188 KB). Vỏ được đo ở T10. Nếu F02–F09 cùng thêm, cả dự án vượt: người dùng quyết trước khi cắt.
9. **Nạp khung thất bại** (mạng chập chờn): nút vẫn còn, bấm lại để thử lại; chưa có thông báo riêng (tránh thêm chữ vào bundle chính). Nếu cần, thêm một khoá `common` nhỏ.
10. **AC-12 phụ thuộc cách dựng dữ liệu thử:** cần cả dòng phân công "Đất đai → quầy 4" lẫn nhân sự quầy 4 (F06 AC-12 và F01 BR-9 nói tìm cán bộ qua số quầy). Tester dựng đúng như bảng §9.
11. **Ngữ cảnh mất khi tải lại trang** (Q8): chủ ý. Người dùng hỏi tiếp "mấy ngày" sau khi tải lại sẽ nhận câu xin lỗi (Cần hỏi 1).
12. **Tệp `app/routes.tsx`, `app/i18n.d.ts`, `core/i18n/vi/common.json`, `Layout.tsx` đang được nhiều chức năng sửa:** mỗi task đọc lại tệp ngay trước khi sửa, không ghi đè phần của task khác.
13. **Ký tự vô hình** khi sửa tệp: không gõ mã thoát Unicode qua Edit hay Bash; ghép trong tệp script hoặc `(char)0x200E`; sau khi ghi kiểm bằng lệnh ở `tasks.md`.

## 12. Cần hỏi

Làm theo đề xuất nếu người dùng không phản đối; chọn khác thì planner sửa plan trước khi làm phần liên quan. Các mục cần ba-analyst ghi vào spec nếu chọn khác đề xuất.

| # | Câu hỏi | Phương án | Đề xuất | Ảnh hưởng |
|---|---|---|---|---|
| 1 | **Câu hỏi một mục nhưng không có thủ tục** ("mấy ngày", "cần giấy tờ gì" khi vừa mở trợ lý hoặc sau "Bắt đầu lại") — BR-1 chỉ có 5 bước | (a) Theo đúng chữ: bước 5, xin lỗi + nút gọi + **ghi vào câu chưa trả lời**. (b) Thêm loại đáp án "hỏi lại thủ tục nào" (kèm chip chủ đề), không ghi vào danh sách chưa trả lời | (a) để khớp spec và F09 AC-6; (b) tốt hơn cho người dân và không làm bẩn danh sách — cần ba-analyst thêm BR/AC | T05, T12 |
| 2 | **Lời chào, cảm ơn** ("xin chào", "cảm ơn") — spec không có | (a) Coi như không hiểu (ghi vào danh sách). (b) Đáp lời chào, không ghi | (a); nếu muốn (b), ba-analyst thêm một dòng vào BR-1 | T05 |
| 3 | **Có quầy nhưng chưa có nhân sự**, hỏi "ai phụ trách đất đai": BR-3 đọc được hai cách | (a) Nêu quầy (có trong phân công), không nêu tên. (b) Không nêu quầy, chỉ "nộp tại Trung tâm" (đọc chặt "chưa có dữ liệu nhân sự → không nêu số quầy") | (a): quầy là dữ liệu thật, không phải đoán | T04 |
| 4 | **Hỏi quầy hay nơi nộp mà không nêu được lĩnh vực hay thủ tục** ("nộp ở quầy nào") | (a) Trả "hồ sơ nộp tại Trung tâm …" + gợi ý nêu lĩnh vực hoặc thủ tục, không ghi vào danh sách chưa trả lời. (b) Bước 5 | (a) | T04, T12 |
| 5 | **Số phần tử tối đa** mỗi đáp án (spec chỉ ghi 5 thủ tục, 10 thủ tục của chủ đề) | Hồ sơ 8, trình tự 2 bước × 500 ký tự, kết quả 6, căn cứ 6 × 200 ký tự, cán bộ 10, thủ tục khác 3 — theo Vàm Cỏ | Như bên trái | T05 |
| 6 | **Hỏi về "điều kiện, yêu cầu" của thủ tục** (cột `yeu_cau_dieu_kien`) — spec chỉ có 7 mục hỏi | (a) Không làm (xem trong popup F03). (b) Thêm mục thứ 8 | (a); (b) cần ba-analyst thêm vào BR-1 | — |
| 7 | **Hội thoại có nên còn sau khi tải lại trang?** | (a) Không (Q8). (b) Giữ bằng `sessionStorage` | (a): kiosk dùng chung, đơn giản | T11 |
| 8 | **F00 §9.7 hết hiệu lực** (mức lệch chấp nhận giữa pg_trgm và bản C#) | Thay bằng "JSON đáp án giống hệt giữa hai nguồn". Đã ghi một dòng vào F00 plan §9.7 và §9.16 (câu 3) | Đã làm | T07, T17 |
| 9 | **Kho câu chưa trả lời đầy trần 50.000** (G4 ở `result/test.md`): câu mới bị bỏ, đã có cảnh báo log mỗi giờ | (a) Giữ hành vi, vận hành theo `tong-quan.md` (đọc và xoá bớt kho định kỳ). (b) Xoá dòng `so_lan_gap = 1` cũ nhất khi đầy, hoặc trần theo ngày | **Đã chốt 2026-10-13: (a)** giữ hành vi, vận hành theo `tong-quan.md` | T12 |
