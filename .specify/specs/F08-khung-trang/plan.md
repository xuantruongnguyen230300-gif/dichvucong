---
id: F08
ten: Khung trang chung — kế hoạch kỹ thuật
spec: spec.md (dang-lam)
cap_nhat: 2026-10-12
---

# F08 · Khung trang chung — kế hoạch kỹ thuật

Chuẩn đối chiếu: `CLAUDE.md`, `F00-khung-he-thong/plan.md` (cache theo lần nhập — T18, mã tra cứu, trình duyệt cũ — T21, nguồn dữ liệu Mẫu — §9), `F01-nhap-du-lieu/plan.md` §4 và §8.1, `design-system.md` và `prototype/index.html` (cùng duyệt 2026-10-12).

Sửa 2026-10-12 (lần 2): service đọc qua lớp nguồn dữ liệu `INguonDuLieu` để chạy được cả với nguồn Mẫu, không cần DB (F00 §9, kế hoạch 6.0) — §1, §2, §3.1, §5, §7, §8, rủi ro 3, task T11. Nhóm B ở §10 đã được chấp nhận.

Component lõi do plan C01 định nghĩa (đang lập song song). Plan này chỉ dùng tên component có trong `design-system.md` §5, ghi "của C01". Chỗ tài liệu chưa nói mà plan phải chọn: ghi ở §10 — nhóm A phải trả lời trước khi làm task liên quan; nhóm B là đề xuất, làm theo nếu người dùng không phản đối.

## 1. Tóm tắt

Ở trang nào người dân cũng thấy cùng một đầu trang (biểu tượng, tên Trung tâm, địa bàn), cùng thanh điều hướng 3 mục, cùng chân trang theo TT 22/2023. Trang có tiêu đề tab và dữ liệu đặc tả riêng, có trang 404. Khi đang tải hay lỗi, chỉ vùng nội dung đổi.

| Phần | Chạm gì |
|---|---|
| DB | Không đổi, không migration. Chỉ đọc `trung_tam`, `gio_lam_viec`, `lien_ket`, `o_dich_vu`, `lan_nhap` (F01 T03 đã tạo), qua lớp nguồn dữ liệu `INguonDuLieu`: PostgreSQL hoặc nguồn Mẫu (F00 §9 — sửa 2026-10-12) |
| BE (`Features/ThongTinTrungTam/`) | `GET /api/trung-tam` — một API cho đầu trang, chân trang, ô dịch vụ và giờ làm việc (F02 dùng lại), nút gọi và Zalo của trợ lý (F06), script trình duyệt cũ (F00 T21). Chèn dữ liệu đặc tả vào HTML khi trả trang (§3.2 — phụ thuộc câu A1) |
| FE `app/` (ui-core-dev) | `Layout`, `AppHeader` (gồm điều hướng), `AppFooter`, liên kết bỏ qua, trang 404, trang tạm cho `/thu-tuc` và `/linh-vuc`, tiêu đề tab và dữ liệu đặc tả, router |
| FE `core/` (ui-core-dev) | Kiểu và hook dữ liệu Trung tâm, hằng đường dẫn trang, kho tiêu đề tab, định dạng ngày; câu chữ dùng chung trong `common.json` |
| FE `features/` | Không có task. "Không tìm thấy lĩnh vực" thuộc F04 (F04 BR-7), "Không tìm thấy thủ tục này" thuộc F03 (F03 BR-8); F08 chỉ đặt câu chữ dùng chung |
| Trợ lý | Không có task. F06 dùng lại lời miễn trừ (`common:mien-tru`) và hook Trung tâm |
| Build FE | `index.html` có khối dữ liệu đặc tả mặc định giữa hai dấu đánh dấu. Phát `dac-ta-trang.json` cho BE (chỉ khi A1 = b) |

Không thêm thư viện. Icon dùng bộ của C01 (Lucide, design-system DS-2). Không thêm gói NuGet.

## 2. Dữ liệu

Không có bảng, cột, chỉ mục hay migration mới. Mọi truy vấn đi theo khoá chính:

| Bảng | Đọc | Khoá dùng |
|---|---|---|
| `trung_tam` | Một dòng, `id = 1` | PK |
| `lien_ket` | Mọi dòng, `ORDER BY thu_tu` | PK `thu_tu` |
| `o_dich_vu` | Mọi dòng, `ORDER BY thu_tu` | PK `thu_tu` |
| `gio_lam_viec` | Mọi dòng, `ORDER BY thu` (chỉ có ngày làm việc — F01 §4) | PK `thu` |
| `lan_nhap` | Dòng `loai = 'thu-tuc'` (`LanNhap.ThuTuc`) | PK `loai` |

- Nguồn dữ liệu (sửa 2026-10-12): service đọc qua `INguonDuLieu` (F00 §9.3). Nguồn PostgreSql chạy đúng các truy vấn theo khoá chính ở bảng trên. Nguồn Mẫu đọc cùng các bảng đó trong bộ nhớ, nạp từ file dữ liệu mẫu; `lan_nhap` có 4 dòng mang thời điểm ghi trong file (F00 §9.8). Chế độ demo vẫn hiện dòng "Dữ liệu thủ tục cập nhật ngày …" với ngày của bộ mẫu (`thoiDiem` của file), không để trống, và dữ liệu đặc tả có đủ 6 yếu tố (F08 BR-6, AC-22; F00 BR-16). Không có dấu hiệu "bản chạy thử" nào (F00 §9.16 câu 5): API không trả cờ nguồn, `AppFooter` không có nhánh riêng cho demo.
- Ngày cập nhật (BR-6): `lan_nhap.thoi_diem` của loại `thu-tuc`, đổi sang giờ Việt Nam (UTC+7 cố định, không có giờ mùa hè — cùng quy ước với F01 §5.1) rồi lấy ngày. F01 ghi dòng này trong cùng transaction với dữ liệu, nhập lại đúng file cũ vẫn đổi ngày, nhập lỗi không đổi (F01 BR-7). Chưa nhập thủ tục lần nào → `null`.
- Lần nhập nào cũng đổi phiên bản dữ liệu của cache `danh-muc` (F00 T18), nên nhập lại `trung-tam` hay `thu-tuc` thì lần tải trang kế tiếp thấy dữ liệu mới (AC-6, AC-7).

## 3. API

### 3.1 `GET /api/trung-tam` — thông tin Trung tâm

Đường dẫn và tên trường `dienThoai` ở gốc JSON **giữ đúng** như script trình duyệt cũ đang gọi (F00 T21 đã làm: hằng `API_THONG_TIN_TRUNG_TAM = '/api/trung-tam'`, `TRUONG_DIEN_THOAI = 'dienThoai'` ở đầu `src/FrontEnd/build/trinh-duyet-cu.ts`). ui-core-dev không phải đổi hai hằng này; chỉ sửa chú thích "F08 chưa có plan" (T04).

Vị trí mã: `src/BackEnd/DichVuCong.Api/Features/ThongTinTrungTam/`. Không đặt tên thư mục `TrungTam` vì namespace `Features.TrungTam` sẽ che lớp entity `TrungTam`.

| File | Nội dung |
|---|---|
| `ThongTinTrungTamController.cs` | `[ApiController]`, `[Route("api/trung-tam")]`, một action `[HttpGet]` gắn `[OutputCache(PolicyName = CachePolicies.DanhMuc)]` và `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`. Middleware 304 của F00 T18 chỉ nhận policy gắn đúng cách này |
| `ThongTinTrungTamService.cs` | `IThongTinTrungTamService.LayAsync(ct)` → DTO hoặc `null` khi chưa có dòng `trung_tam`. `LayDacTaAsync(ct)` → (tên, cơ quan chủ quản, ngày cập nhật) cho §3.2. Đọc qua `INguonDuLieu` và các hàm `TruyVan` (F00 §9.3, §9.4), `Select` thẳng ra DTO; không nhận `AppDbContext` (sửa 2026-10-12 — T11) |
| `ThongTinTrungTamDtos.cs` | Các record bên dưới |
| `ThongTinTrungTamServiceCollectionExtensions.cs` | `AddThongTinTrungTam()`; `AddApiServices` gọi hàm này (như `AddChatbot()`); `Program.cs` không đổi |

Response (C#, JSON camelCase như mặc định của ASP.NET Core):

```csharp
public sealed record ThongTinTrungTamDto(
    string Ten,
    string? Xa,
    string? Tinh,
    string? CoQuanChuQuan,
    string NguoiChiuTrachNhiem,
    string? ChucVuNguoiChiuTrachNhiem,
    string DiaChi,
    string DienThoai,
    string Email,
    string? BanDo,
    MangXaHoiDto MangXaHoi,
    IReadOnlyList<LienKetDto> LienKet,
    IReadOnlyList<ODichVuDto> ODichVu,
    IReadOnlyList<GioLamViecDto> GioLamViec,
    string? GhiChuNgayNghi,
    DateOnly? NgayCapNhatThuTuc);   // ngày Việt Nam, JSON "yyyy-MM-dd"

public sealed record MangXaHoiDto(string? ZaloOa, string? Facebook, string? YouTube, string? TikTok);
public sealed record LienKetDto(string Ten, string Url);
public sealed record ODichVuDto(string Ten, string? MoTa, string BieuTuong, string? Url);
public sealed record GioLamViecDto(int Thu, string? SangTu, string? SangDen, string? ChieuTu, string? ChieuDen); // "HH:mm"; Thu 1 = Thứ Hai … 7 = Chủ nhật
```

Kiểu TypeScript tương ứng — `src/FrontEnd/src/core/api/trungTam.ts`:

```ts
export type BieuTuongODichVu =
  | 'boc-so' | 'danh-gia' | 'tra-cuu-ho-so' | 'thanh-toan' | 'cong-dvc' | 'cong-thong-tin' | 'lien-ket';

export interface ThongTinTrungTam {
  ten: string;
  xa: string | null;
  tinh: string | null;
  coQuanChuQuan: string | null;
  nguoiChiuTrachNhiem: string;
  chucVuNguoiChiuTrachNhiem: string | null;
  diaChi: string;
  dienThoai: string;
  email: string;
  banDo: string | null;
  mangXaHoi: { zaloOa: string | null; facebook: string | null; youTube: string | null; tikTok: string | null };
  lienKet: { ten: string; url: string }[];
  oDichVu: { ten: string; bieuTuong: BieuTuongODichVu; url: string | null }[];
  gioLamViec: { thu: number; sangTu: string | null; sangDen: string | null; chieuTu: string | null; chieuDen: string | null }[];
  ghiChuNgayNghi: string | null;
  ngayCapNhatThuTuc: string | null;
}
```

Danh sách khoá biểu tượng có ở 3 nơi: `MauExcel.cs` (F01), union trên, bảng gán icon của F02. Thêm khoá thì sửa cả ba (F01 §3.4).

Ví dụ (dữ liệu thử của AC-14; giá trị thật của Cần Giuộc ở `can-giuoc.md`, không chép vào đây):

```json
{
  "ten": "Trung tâm thử A",
  "xa": "phường thử B",
  "tinh": "tỉnh thử C",
  "coQuanChuQuan": null,
  "nguoiChiuTrachNhiem": "Người thử",
  "chucVuNguoiChiuTrachNhiem": "Giám đốc (dữ liệu thử)",
  "diaChi": "Địa chỉ thử",
  "dienThoai": "0000.000.000",
  "email": "thu@example.gov.vn",
  "banDo": null,
  "mangXaHoi": { "zaloOa": null, "facebook": null, "youTube": null, "tikTok": null },
  "lienKet": [{ "ten": "Cổng Dịch vụ công Quốc gia", "url": "https://dichvucong.gov.vn" }],
  "oDichVu": [{ "ten": "Đánh giá hài lòng", "bieuTuong": "danh-gia", "url": null }],
  "gioLamViec": [{ "thu": 1, "sangTu": "07:00", "sangDen": "11:30", "chieuTu": "13:30", "chieuDen": "17:00" }],
  "ghiChuNgayNghi": null,
  "ngayCapNhatThuTuc": "2026-10-08"
}
```

Chỉ có trường màn hình dùng. Không trả: `MaDonViCongDvc` (link Cổng DVC dựng từ mã thủ tục — F03 BR-4), `Id`, `ThuTu`, `lan_nhap.ten_file`, thời điểm nhập có giờ.

| Mã HTTP | Khi nào | `code` (F00 §2b) |
|---|---|---|
| 200 | Có dữ liệu. Kèm `ETag`, `Cache-Control: no-cache` (F00 T18) | — |
| 304 | `If-None-Match` khớp phiên bản hiện tại (F00 T18) | — |
| 404 | Chưa nhập dữ liệu Trung tâm lần nào (câu B10) | `khong-tim-thay` |
| 405 | Phương thức khác GET | `phuong-thuc-khong-hop-le` |
| 429 | Vượt giới hạn `danh-muc` (300/phút/IP) | `qua-nhieu-yeu-cau` |
| 500 | Lỗi DB hoặc lỗi khác; có `maTraCuu` | `loi-he-thong` |

- Không nhận tham số. Query lạ bị bỏ qua.
- Truy vấn: 5 câu theo khoá chính ở §2. Output cache giữ kết quả theo phiên bản dữ liệu, nên phần lớn yêu cầu không chạm các bảng này (chỉ một truy vấn phiên bản — F00 T18).
- Đổi giờ: hàm thuần `NgayVietNam(DateTimeOffset)` và `DinhDangGio(TimeOnly?)` để test không cần DB.

### 3.2 Dữ liệu đặc tả trong HTML khi trả trang — chỉ làm khi câu A1 chọn (b)

Vì sao cần: Zalo và công cụ thu thập không chạy JavaScript, chỉ đọc HTML. Tiêu đề "<Tên trang> – <Tên trung tâm>" (BR-9), người tạo, cơ quan ban hành, thời gian (BR-13) đều là dữ liệu từ DB, không viết cứng được (BR-5). Vậy chúng chỉ có trong HTML nếu máy chủ chèn vào lúc trả trang.

Cách làm:

1. **Build FE (ui-core-dev, T04).** `index.html` có một khối giữa `<!--dac-ta-->` và `<!--/dac-ta-->`, chứa `<title>` và `<meta name="description">` mặc định lấy từ `common.json` (chèn lúc build như `%TIEU_DE%` hiện nay). Plugin build phát thêm `wwwroot/dac-ta-trang.json`, lấy chữ từ `common.json` và đường dẫn từ `core/duongDan.ts` (một nguồn):

   ```json
   {
     "mauTieuDe": "{{trang}} – {{trungTam}}",
     "khongTimThay": { "ten": "Không tìm thấy trang", "moTa": "…" },
     "trang": {
       "/": { "ten": "Trang chủ", "moTa": "…" },
       "/thu-tuc": { "ten": "Danh mục thủ tục", "moTa": "…" },
       "/linh-vuc": { "ten": "Lĩnh vực và mã QR", "moTa": "…" }
     }
   }
   ```

   Câu chữ vẫn chỉ nằm ở file ngôn ngữ FE; BE chỉ ghép. File này công khai được (toàn chữ công khai).

2. **BE (backend-dev, T02).**
   - `Common/Hosting/ITrangHtml.cs`: `Task<string> TaoAsync(HttpContext context, CancellationToken ct)`. `SpaFallback.Handle` dùng service này nếu đã đăng ký, nếu không thì trả file như hiện nay. Thiếu `index.html` → 404 như cũ.
   - `Features/ThongTinTrungTam/TrangHtml.cs` (đăng ký trong `AddThongTinTrungTam()`):
     - Đọc `index.html` và `dac-ta-trang.json` từ web root mỗi lần (file nhỏ, hệ điều hành đã cache; build lại FE không cần khởi động lại API).
     - Chọn trang theo `Request.Path`: bỏ `/` cuối (trừ gốc), so không phân biệt hoa thường (React Router cũng vậy). Không khớp → `khongTimThay`. Query (vd. `?ma=1.001193`) không ảnh hưởng — link thủ tục dùng dữ liệu đặc tả của trang (BR-13, AC-20).
     - Dữ liệu từ `IThongTinTrungTamService.LayDacTaAsync`, giữ trong `IMemoryCache` theo `Caching:DacTaTrang` (mặc định 30 giây — câu B12). Thời gian chờ DB = `Hosting:ReadyTimeout`. Lỗi hay quá giờ → ghi log Warning, giữ khối mặc định, vẫn trả 200: trang không bao giờ hỏng vì DB.
     - Thay cả khối giữa hai dấu đánh dấu bằng các thẻ ở §3.3. Mọi giá trị qua `HtmlEncoder.Default`.
     - Không có dấu đánh dấu hoặc không đọc được JSON → trả nguyên file (test hiện có của `SpaFallback` vẫn đúng).
   - Mã HTTP giữ 200 cho mọi trang, kể cả trang 404 (câu B11).

Phương án (a) của câu A1 bỏ toàn bộ mục này; chỉ còn phần trình duyệt tự cập nhật ở §4.7.

### 3.3 Thẻ dữ liệu đặc tả (BR-13, TT 22/2023 Phụ lục IV)

BE (§3.2) và FE (§4.7) dùng **cùng một tập thẻ**, để trang mở thẳng và trang đi tới bằng điều hướng trong ứng dụng giống nhau. Tên thẻ theo Dublin Core; đơn vị CNTT đối chiếu Phụ lục IV khi rà (câu hỏi mở 20).

| Yếu tố BR-13 | Thẻ | Giá trị |
|---|---|---|
| Tiêu đề | `<title>`, `meta name="DC.title"`, `meta property="og:title"` | "<Tên trang> – <Tên trung tâm>" — không đổi khi mở popup |
| Mô tả | `meta name="description"`, `DC.description`, `og:description` | Một câu của trang (câu B7) |
| Người tạo | `DC.creator` | Tên trung tâm |
| Cơ quan ban hành | `DC.publisher` | Cơ quan chủ quản; trống thì tên trung tâm (AC-19) |
| Thời gian | `DC.date` | Ngày BR-6, dạng `yyyy-MM-dd`. Chưa nhập thủ tục lần nào thì không có thẻ này |
| Yếu tố định danh | `DC.identifier`, `og:url` | `scheme://host/đường-dẫn`, không có query |
| — | `link rel="schema.DC" href="https://purl.org/dc/elements/1.1/"`, `meta name="DC.language" content="vi"`, `meta property="og:type" content="website"` | Cố định |

`<html lang="vi">` có sẵn trong `index.html` (F00).

## 4. Frontend

### 4.1 Route

| Đường dẫn | Trang (`handle.trang`) | Thành phần | Ghi chú |
|---|---|---|---|
| `/` | `trang-chu` | `features/trang-chu/TrangChu` (F02 thay bản tạm hiện có) | |
| `/thu-tuc` | `danh-muc` | `app/TrangTam` cho tới khi F04 có màn hình (câu B8) | F04 đổi sang `features/danh-muc/…` |
| `/linh-vuc` | `linh-vuc` | `app/TrangTam` cho tới F05 | F05 đổi |
| `*` | `khong-tim-thay` | `app/KhongTimThay` (BR-10) | |

- Hằng đường dẫn: `core/duongDan.ts` — `DUONG_DAN = { trangChu: '/', danhMuc: '/thu-tuc', linhVuc: '/linh-vuc' } as const`. Router, điều hướng, trang 404, plugin build (§3.2), và sau này F04, F05 (link, QR) cùng dùng. Đặt ở `core` vì feature không import được `app` (câu B1).
- Mỗi route có `handle: { trang: KhoaTrang }`. `KhoaTrang` là union kiểu TypeScript, trùng khoá `common:trang.*`.
- Nạp lười bằng `React.lazy` + `<Suspense>` đặt **trong** `<main>`, thay `lazy` của route (câu B9). Lý do: `lazy` của route chặn lần vẽ đầu tới khi tải xong chunk của trang, nên trên mạng chậm cả đầu và chân trang cũng chưa hiện (AC-13). Hàm nạp vẫn gọi song song `import()` của trang và `napNgonNgu…()` như hiện nay.
- Mỗi route con và route gốc có `ErrorBoundary: LoiTrang` (app). `LoiTrang` hiện `ErrorState` của C01 với câu loại "Khác" (F00 BR-6); "Thử lại" = tải lại trang (lỗi nạp chunk sau khi triển khai bản mới chỉ hết khi tải lại). Không dùng trang lỗi mặc định của React Router: trang đó in thông điệp lỗi (trái F00 BR-3).
- `<ScrollRestoration getKey={(l) => l.pathname} />`: sang trang khác thì về đầu trang; đổi tham số trên cùng trang (lọc, `?ma=`) không nhảy.

### 4.2 `Layout` — `app/layout/Layout.tsx`

```
<a class="bo-qua">Bỏ qua, tới nội dung chính</a>   ← phần tử đầu tiên nhận Tab (BR-12)
<AppHeader />                                     ← <header> + <nav> (BR-1, BR-2, BR-14)
<main id="noi-dung" tabIndex={-1}>
  <Suspense fallback={Skeleton của C01}><Outlet /></Suspense>
</main>
<AppFooter />                                     ← <footer> (BR-3–BR-7)
{/* F06: nút Trợ lý nổi (C01 BR-13) */}
{/* F09: NutBatDauLai — chỉ ở kiosk */}
<DacTaTrang />                                    ← tiêu đề tab + thẻ đặc tả (§4.7)
<ScrollRestoration … />
```

- Liên kết bỏ qua: bấm hoặc Enter → `preventDefault`, `main.focus()` (cuộn tới `main`). Không đổi địa chỉ trang (không thêm `#noi-dung`). Ẩn tới khi nhận focus; khi focus hiện ở góc trên như prototype.
- `main` không có viền focus (như prototype); phần tử bên trong vẫn có.
- Thứ tự DOM = thứ tự Tab = thứ tự đọc: bỏ qua → biểu tượng và tên → 3 mục điều hướng → nội dung → chân trang.
- Trạng thái đang tải, lỗi, không có kết quả của trang (BR-11) chỉ nằm trong `<main>`; `Layout` không bao giờ bị thay bằng trạng thái lỗi.

### 4.3 `AppHeader` — `app/layout/AppHeader.tsx`

- Một `<Link to="/">` gồm biểu tượng + tên Trung tâm + địa bàn (BR-2: bấm biểu tượng hay tên đều về trang chủ — AC-2).
- **Biểu tượng (BR-14, câu B2).** Thư mục `src/FrontEnd/src/app/layout/logo/` chứa đúng một file ảnh (`.svg`, `.png` hoặc `.webp`). Mã lấy file bằng `import.meta.glob('./logo/*.{svg,png,webp}', { eager: true, query: '?url', import: 'default' })` nên tên file ra có hash: thay file rồi build và triển khai lại thì mọi trang hiện ảnh mới, trình duyệt không giữ bản cũ, không sửa dòng mã nào (AC-21). File mặc định `logo.svg`: icon `Landmark` (Lucide, ISC — ghi chú giấy phép trong file) màu trắng trên hình tròn `#074a90` (design-system §8). Không dùng Quốc huy. `<img width="40" height="40" alt="">` — ảnh trang trí vì tên đọc của liên kết đã là tên Trung tâm.
- **Tên và địa bàn (BR-5).** Tên = `ten`, đúng nguyên văn. Địa bàn = `xa` và `tinh` nối bằng mẫu `common:dau-trang.dia-ban` = "{{xa}} – {{tinh}}"; thiếu một thì chỉ hiện cái còn lại, thiếu cả hai thì ẩn dòng. Không ghép thêm chữ "xã", "tỉnh", "phường", không tự viết hoa (câu B6) — AC-14.
- Đang tải: biểu tượng + 2 dòng `Skeleton` của C01, giữ chiều cao (tối thiểu 60px như prototype) để trang không nhảy. Lỗi hoặc chưa có dữ liệu: chỉ còn biểu tượng; liên kết có tên đọc "Trang chủ" (chữ ẩn) để không thành liên kết không tên.
- Cỡ chữ theo design-system: tên `--font-size-xl`, dưới 600px `--font-size-lg`; địa bàn `--font-size-sm`, chữ phụ.

### 4.4 Điều hướng chính

- `<nav aria-label="Điều hướng chính">` (chữ từ i18n), 3 `NavLink`: Trang chủ (`end`), Danh mục thủ tục, Lĩnh vực và mã QR (AC-1). Icon nhà, danh sách, lưới như prototype; icon `aria-hidden`.
- `NavLink` tự gắn `aria-current="page"` cho mục đang xem. Đánh dấu bằng màu chữ + gạch dưới 3px (không chỉ màu — C01 BR-1).
- Từ 600px: nhãn đầy đủ. Dưới 600px (BR-2, AC-3):
  - Mỗi mục có hai `span`: nhãn đầy đủ (dưới 600px chuyển thành chữ ẩn cho trình đọc màn hình — lớp ẩn chữ của C01) và nhãn ngắn `aria-hidden="true"` (chỉ hiện dưới 600px). Tên đọc luôn là nhãn đầy đủ; nhãn ngắn nằm trong nhãn đầy đủ nên đạt WCAG 2.5.3. Mục "Trang chủ" chỉ có một nhãn.
  - 3 mục `flex: 1 1 0; min-width: 0`, chia đều, không `overflow-x`, không nút menu. Màn hình hẹp hơn 375px hoặc phóng to: chữ xuống dòng thay vì tràn — cả trang không bao giờ cuộn ngang.
- Thanh điều hướng dính đầu màn hình khi cuộn (`position: sticky`, lớp 10 — design-system §3), như prototype.

### 4.5 `AppFooter` — `app/layout/AppFooter.tsx`

Nền `--color-primary-strong`, chữ trắng, viền focus trắng (design-system §6). Lưới khối tự xuống hàng (`repeat(auto-fit, minmax(220px, 1fr))`).

| Khối (`<section>` + `<h2>`) | Nội dung | Ẩn khi |
|---|---|---|
| Tên đơn vị (`ten`) | "Cơ quan chủ quản: …" · "Người chịu trách nhiệm nội dung: <họ tên>" hoặc "… <họ tên> – <chức vụ>" (hai khoá i18n riêng, không có dấu ngăn thừa — AC-5; câu B4) | Dòng cơ quan chủ quản ẩn khi trống (AC-19) |
| "Địa chỉ và liên hệ" | Địa chỉ · điện thoại (`tel:`) · email (`mailto:`) · "Xem bản đồ" (link ngoài) | Bản đồ ẩn khi trống (AC-6) |
| "Liên kết hữu ích" | `lienKet` theo thứ tự, mỗi mục một link ngoài | Cả khối khi danh sách rỗng |
| "Mạng xã hội" | Zalo OA, Facebook, YouTube, TikTok — mục nào có link thì hiện | Cả khối kể cả tiêu đề khi không mục nào có link (BR-5, AC-6) |
| Dòng cuối | "Dữ liệu thủ tục cập nhật ngày dd/mm/yyyy" (BR-6) · lời miễn trừ (BR-7) · "© <Tên trung tâm>" (câu B5) | Dòng ngày ẩn khi `ngayCapNhatThuTuc` null |

- 5 mục bắt buộc (BR-3) luôn có khi API trả 200, vì F01 BR-8 không cho nhập thiếu.
- Mọi link ra ngoài, `tel:`, `mailto:` dùng `ExternalLink` của C01 (C01 BR-3: tab mới, `rel="noopener noreferrer"`, chữ "(mở trang mới)"; `tel:`/`mailto:` không mở tab mới; link sai định dạng hiện như chữ thường). Số gọi lấy từ số hiển thị bằng hàm tạo link điện thoại của C01 (`ErrorState` cũng cần); C01 chưa có thì ui-core-dev thêm `core/utils/lienHe.ts` trong T03. Chân trang không có dòng nhắc đăng xuất (F09 BR-4).
- Mạng xã hội: chỉ hiện tên kênh và icon mở trang mới (bộ icon không có icon thương hiệu).
- Ngày: `dinhDangNgay('2026-10-08')` → `08/10/2026` (`core/utils/dinhDang.ts`), tách chuỗi, không qua múi giờ trình duyệt.
- Lời miễn trừ: khoá `common:mien-tru` = đúng câu BR-7. F03 (cuối popup) và F06 (dưới ô nhập) dùng lại khoá này (AC-8).
- Đang tải: `Skeleton` của C01 trong các khối, lời miễn trừ vẫn hiện. Lỗi: chỉ còn lời miễn trừ.
- Chừa khoảng trống cuối chân trang để nút nổi không che chữ: luôn chừa cho nút Trợ lý (cao 44px — C01 BR-13); ở kiosk chừa thêm cho nút "Bắt đầu lại" (≥ 48px — F09 BR-7). Số đo theo prototype (`+64px`, kiosk `+80px`), dùng token của C01.

### 4.6 Trang 404, trang tạm, lỗi trong trang

- `app/KhongTimThay.tsx` (sửa file đang có): `<h1>` "Không tìm thấy trang" + hai liên kết trình bày như nút: "Về trang chủ" (`primary`) và "Danh mục thủ tục" (`secondary`) (BR-10, AC-9). Đây là đi tới trang khác nên là liên kết, không phải `<button>` (C01 BR-2). Cần `Button` của C01 hiển thị được dạng liên kết nội bộ (§4.10). Có đủ đầu và chân trang vì nằm trong `Layout`.
- `app/TrangTam.tsx`: chỉ có `<h1>` tên trang (từ `handle.trang`). Dùng cho `/thu-tuc`, `/linh-vuc` tới khi F04, F05 có màn hình, để kiểm AC-1–AC-3 ngay.
- "Không tìm thấy lĩnh vực" (F04) và "Không tìm thấy thủ tục này" (F03): F08 đặt câu chữ trong `common.json` (§4.9); màn hình làm ở F03, F04. Thông báo không nhắc lại mã trên địa chỉ, không hiện chữ từ địa chỉ (BR-10, AC-10).

### 4.7 Tiêu đề tab và dữ liệu đặc tả phía trình duyệt (BR-9, BR-13)

- **Kho tiêu đề tab** `core/hooks/useTieuDeTab.ts` (không biết nghiệp vụ):
  - `useTieuDeTab(tieuDe: string | null)` — tiêu đề của trang (app gọi).
  - `useTieuDeTabTam(tieuDe: string | null)` — tiêu đề tạm khi còn gắn (F03 gọi khi popup mở, truyền tên thủ tục).
  - `document.title` = tiêu đề tạm nếu có, không thì tiêu đề trang. Gỡ tiêu đề tạm → về tiêu đề trang (AC-20). Hai giá trị giữ riêng, nên dữ liệu Trung tâm về trễ khi popup đang mở không ghi đè tên thủ tục.
  - Giá trị `null` → không đổi `document.title`, giữ tiêu đề có sẵn trong HTML.
- **`app/layout/DacTaTrang.tsx`** (không vẽ gì):
  - Lấy `handle.trang` của route khớp cuối (`useMatches`), tên và mô tả từ `common:trang.<khoa>.ten` / `.mo-ta`, dữ liệu từ `useThongTinTrungTam()`.
  - Có dữ liệu → `useTieuDeTab(t('ung-dung.mau-tieu-de', { trang, trungTam }))` và cập nhật đúng tập thẻ §3.3 (tìm thẻ có sẵn rồi đổi `content`, chưa có thì tạo; không tạo thẻ trùng). Chưa có dữ liệu → tiêu đề tab là tên trang (khi đi tới trang khác trong ứng dụng), không đụng thẻ đặc tả.
  - Thẻ đặc tả luôn theo trang, không theo popup (BR-13).
- Bỏ dòng `document.title = i18n.t('ung-dung.tieu-de')` trong `core/i18n/index.ts`: dòng này ghi đè tiêu đề máy chủ đã chèn (§3.2).

### 4.8 Trạng thái tải, lỗi, không có kết quả (BR-11)

- Hình thức, câu chữ: `Skeleton`, `ErrorState`, `EmptyState` của C01 (C01 BR-11). Từng trang (F02–F06) tự đặt trong vùng nội dung.
- F08 bảo đảm: đầu trang, điều hướng, chân trang nằm ngoài `<main>`, có trong bundle chính, hiện ngay khi JS chạy, trước khi chunk và dữ liệu của trang về (AC-13).
- Số điện thoại trong `ErrorState` (C01 BR-11, AC-11) lấy từ `useThongTinTrungTam().data?.dienThoai`: đã tải một lần (vd. ở trang chủ) thì vẫn có khi mất mạng sau đó, vì TanStack Query giữ dữ liệu cũ. Chưa từng tải được thì ẩn số (như F00 BR-14). Nối bằng prop hay để `ErrorState` tự gọi hook: theo plan C01.

### 4.9 Câu chữ — `core/i18n/vi/common.json`

Thêm hoặc đổi (khoá có kiểu, gõ sai là lỗi build):

| Nhóm khoá | Nội dung |
|---|---|
| `ung-dung.mo-ta`, `ung-dung.mau-tieu-de` | Mô tả mặc định của `index.html`; "{{trang}} – {{trungTam}}" |
| `trang.trang-chu`, `trang.danh-muc`, `trang.linh-vuc`, `trang.khong-tim-thay` | `ten` (tiêu đề trang, nhãn đầy đủ của điều hướng), `ten-ngan` ("Trang chủ", "Danh mục", "Lĩnh vực"), `mo-ta` (câu B7). Đổi `trang.khong-tim-thay.tieu-de` hiện có thành `ten` |
| `bo-qua` | "Bỏ qua, tới nội dung chính" |
| `dieu-huong.nhan` | "Điều hướng chính" |
| `dau-trang.dia-ban` | "{{xa}} – {{tinh}}" |
| `chan-trang.*` | Cơ quan chủ quản, người chịu trách nhiệm (2 mẫu), "Địa chỉ và liên hệ", "Xem bản đồ", "Liên kết hữu ích", "Mạng xã hội", tên 4 kênh, "Dữ liệu thủ tục cập nhật ngày {{ngay}}", "© {{ten}}" |
| `mien-tru` | "Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia." |
| `khong-tim-thay.linh-vuc` | "Không tìm thấy lĩnh vực" · "Xem toàn bộ danh mục" (F04 dùng) |
| `khong-tim-thay.thu-tuc` | "Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng." (F03, F04 dùng; nút "Đóng" = `nut.dong` có sẵn) |

Câu của đầu, chân trang nằm ở `common` (đóng gói sẵn) vì `Layout` có mặt ở mọi trang. Tăng khoảng 1,5 KB trước nén.

### 4.10 Phần dùng từ C01

| Cần | Dùng | Ghi chú cho plan C01 |
|---|---|---|
| Token màu, chữ, khoảng cách, lớp, bộ chọn kiosk | `tokens.css` của C01 | F08 dùng đúng bộ chọn kiosk C01 đặt (vd. lớp trên `html`) để chừa chỗ ở chân trang |
| Liên kết trình bày như nút (trang 404) | `Button` của C01 | Cần biến thể liên kết nội bộ (vd. `Button` nhận `to`, hoặc `ButtonLink`). Không có → báo planner |
| Link ngoài, `tel:`, `mailto:` | `ExternalLink` của C01 | Gồm cả quy tắc link sai định dạng (C01 BR-3) |
| Hàm tạo link điện thoại | của C01 | Không có → ui-core-dev thêm `core/utils/lienHe.ts` (T03) |
| Khối giữ chỗ | `Skeleton` của C01 | Đầu trang, chân trang, `Suspense` trong `main` |
| Lỗi trang | `ErrorState` của C01 | `LoiTrang`; nhận hàm "Thử lại" |
| Icon | bộ icon của C01 (Lucide) | Nhà, danh sách, lưới, ghim bản đồ, điện thoại, thư, toà nhà, người, cảnh báo |
| Chữ ẩn cho trình đọc màn hình | lớp hoặc thành phần ẩn chữ của C01 | Nhãn đầy đủ dưới 600px, tên đọc của liên kết thương hiệu khi chưa có dữ liệu |

Thành phần mới do F08 thêm, đều ở `app/layout/` (ui-core-dev): `Layout`, `AppHeader`, `AppFooter`, `DacTaTrang`, `LoiTrang`, `KhongTimThay`, `TrangTam`. Không thêm gì vào `core/components`.

### 4.11 Chế độ kiosk — ranh giới với F09

| Việc | F08 | F09 |
|---|---|---|
| Bật, giữ chế độ kiosk (F09 BR-1), phóng chữ và điều khiển | Không làm; khung dùng token nên tự phóng | Làm |
| Đầu trang, điều hướng, chân trang | Giống hệt ở kiosk; khổ 1080px hiện nhãn đầy đủ | — |
| Khoảng trống cuối chân trang cho nút nổi | Làm cả phần kiosk (§4.5) | — |
| Nút "Bắt đầu lại" | `Layout` chừa chỗ đặt (sau chân trang) | `NutBatDauLai` và hành vi (F09 BR-7) |
| Điều hướng không để lại lịch sử ở kiosk | Không làm; `NavLink`, liên kết thương hiệu, liên kết trang 404 là liên kết thường | F09 quyết; nếu thêm `replace` ở kiosk thì sửa ngay các liên kết này trong `app/` (cùng chủ sở hữu ui-core-dev) |
| Dòng nhắc đăng xuất | Chân trang không có (F09 BR-4) | Các nơi khác |
| Dữ liệu mới trên kiosk không bao giờ tải lại trang | Không làm | Đề xuất: "Bắt đầu lại" gọi `queryClient.invalidateQueries()` — F09 quyết |

### 4.12 Bàn giao

- F02: dùng `useThongTinTrungTam()` cho ô dịch vụ (`oDichVu`, `url` null → ô không bấm được), giờ làm việc (`gioLamViec`, `ghiChuNgayNghi`). Không gọi API riêng. Trạng thái giờ làm việc (F02 BR-2) tính ở FE hay BE: plan F02 quyết.
- F03: `useTieuDeTabTam(tenThuTuc)` khi popup mở; lời miễn trừ `common:mien-tru`; câu `khong-tim-thay.thu-tuc`.
- F04: câu `khong-tim-thay.linh-vuc`; đổi route `/thu-tuc` từ `TrangTam` sang màn hình F04 (task ui-core-dev trong plan F04); dùng `DUONG_DAN`.
- F05: đổi route `/linh-vuc`; QR dùng `DUONG_DAN.danhMuc`.
- F06: lời miễn trừ; `dienThoai`, `mangXaHoi.zaloOa` từ `useThongTinTrungTam()` (Zalo trống → ẩn nút — F06 BR-10). Nút Trợ lý nổi đặt trong `Layout` (chỗ đã chừa).
- F09: §4.11.
- F00 T21: không phải đổi gì ngoài chú thích (§3.1).

## 5. Hiệu năng

- **Tải dữ liệu:** `useThongTinTrungTam()` (khoá `['trung-tam']`, cấu hình mặc định của `Providers`) chạy khi `Layout` vẽ lần đầu, song song với chunk của trang. Một yêu cầu cho mỗi lần mở trang; trang sau trong cùng phiên dùng lại kết quả. F02, F06 dùng chung khoá, không gọi thêm.
- **Cache:** máy chủ — output cache `danh-muc` theo phiên bản dữ liệu; trình duyệt — `Cache-Control: no-cache` + ETag, lần mở sau nhận 304 (F00 T18). Kích thước JSON khoảng 1,5 KB trước nén.
- **p95 ≤ 300 ms:** phần lớn yêu cầu trả từ output cache, chỉ thêm một truy vấn phiên bản (F00 T18). Khi lỡ cache: 5 truy vấn theo khoá chính trên bảng dưới 10 dòng. Nguồn Mẫu: mọi bước đọc trong bộ nhớ, kể cả phiên bản (F00 §9.13).
- **HTML (A1 = b):** mỗi lần trả trang đọc 2 file nhỏ và dữ liệu đặc tả trong bộ nhớ (làm mới tối đa mỗi 30 giây), không truy vấn DB mỗi yêu cầu.
- **Ngân sách JS (≤ 200 KB gzip lúc tải đầu):** khung nằm trong bundle chính — ước tính thêm 6–10 KB gzip (`Layout`, đầu trang, điều hướng, chân trang, `DacTaTrang`, khoảng 10 icon, câu chữ). Không thêm thư viện. T05 báo kích thước chunk chính trước và sau.
- **Lighthouse ≥ 85:** đầu trang giữ chiều cao cố định khi đang tải (tránh dịch bố cục); biểu tượng khai `width`/`height`; không tải font. Trang con nạp lười như cũ.

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Chỉ thông tin công khai của Trung tâm (§3.1). Không có mã đơn vị, khoá nội bộ, tên file nhập, giờ nhập. Họ tên người chịu trách nhiệm là thông tin công khai theo TT 22/2023 (F01 §10) |
| Link độc hại trong dữ liệu (`javascript:`, `data:`) | F01 chỉ nhận `http`/`https`, email và điện thoại đúng dạng. FE kiểm lại qua `ExternalLink` của C01 (link sai hiện như chữ thường) |
| Chữ từ dữ liệu có HTML | React hiển thị dạng chữ; cấm `dangerouslySetInnerHTML` (ESLint). BE: mọi giá trị chèn vào HTML qua `HtmlEncoder` (§3.2) |
| Chữ từ địa chỉ trang | Không hiện ra trang (BR-10, AC-10). BE chỉ dùng đường dẫn để tra bảng; `DC.identifier` không có query, đã mã hoá HTML |
| `Host` giả trong `DC.identifier`, `og:url` | Đã mã hoá HTML, response `no-cache`. Khi triển khai đặt `AllowedHosts` đúng tên miền (kế hoạch 8.3, câu hỏi mở 10) |
| Mở tab mới | `rel="noopener noreferrer"` qua `ExternalLink` (C01 BR-3) |
| CSP | Không script, style inline; biểu tượng là file cùng nguồn (`img-src 'self'`); favicon `data:,` (`img-src` cho phép `data:`). `link rel="schema.DC"` không tải gì |
| Giới hạn tần suất | `/api/trung-tam`: `danh-muc` (300/phút/IP). Trang HTML: không gắn giới hạn — không chạm DB mỗi yêu cầu (§3.2), để không bao giờ trả 429 dạng JSON thay cho trang |
| Lỗi | ProblemDetails có `code`, `maTraCuu`; trang lỗi của React Router bị thay bằng `LoiTrang` (§4.1) — không lộ thông điệp lỗi |

## 7. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Api/ThongTinTrungTamTests.cs` | backend-dev | Service giả: JSON camelCase, `dienThoai` ở gốc, trường null có mặt, giờ "HH:mm", ngày "yyyy-MM-dd"; service trả null → 404 `khong-tim-thay`; POST → 405; có `ETag`, `Cache-Control: no-cache`; `If-None-Match` → 304 (`IPhienBanDuLieu` giả); vượt giới hạn → 429. Hàm thuần: `2026-10-07T17:00Z` → ngày `2026-10-08`, `16:59:59Z` → `2026-10-07` |
| `Tests/Api/ThongTinTrungTamServiceContract.cs`, `…TrenMau.cs` (thêm 2026-10-12) | backend-dev | Test hợp đồng của service (F00 §9.10): cùng các ca chạy trên nguồn Mẫu dựng từ bộ dữ liệu thử `Tests/Api/DuLieuThu/` — đủ trường, thứ tự theo khoá, null, ngày theo `lan_nhap` loại `thu-tuc`, không có `trung_tam` → null. Lớp con PostgreSQL: tester (F00 T31) |
| `Tests/Api/TrangHtmlTests.cs` (A1 = b) | backend-dev | `/thu-tuc` → `<title>Danh mục thủ tục – Trung tâm thử A</title>`; `/?ma=1.001193` cho HTML giống hệt `/`; `/THU-TUC/` khớp danh mục; `/abc-xyz` → tên trang 404; cơ quan chủ quản trống → `DC.publisher` = tên; tên chứa `<script>` → đã mã hoá; service lỗi → khối mặc định, 200; thiếu dấu đánh dấu hoặc thiếu JSON → nguyên file (test `SpaFallback` cũ vẫn xanh); query không xuất hiện trong HTML |
| `Tests/Integration/ThongTinTrungTam/` | tester | PostgreSQL thật: lớp con PostgreSQL của test hợp đồng (F00 T31); thứ tự liên kết, ô dịch vụ, giờ; null; ngày theo `lan_nhap` loại `thu-tuc`; nhập lại → response mới (AC-6, AC-7) |
| `src/FrontEnd/src/**/*.test.tsx` | ui-core-dev | Đầu trang: địa bàn đủ/thiếu một/thiếu cả hai, không thêm chữ; điều hướng: 3 mục, `aria-current`, tên đọc đầy đủ; chân trang: ẩn mục và khối trống, chức vụ có/không (không dấu ngăn thừa), ngày `08/10/2026`, lời miễn trừ đúng câu; kho tiêu đề tab: tạm đè rồi trả lại; `DacTaTrang`: không tạo thẻ trùng; thư mục logo có đúng 1 file |
| `e2e/khung-trang.spec.ts` | tester | AC-1–AC-21 phần chạy tự động được, khổ 375 và 1280, axe-core (nếu C01 đã thêm `@axe-core/playwright`; chưa có thì kiểm bằng công cụ trình duyệt) |

## 8. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 khung giống nhau mọi trang, đánh dấu mục đang xem | §4.2, §4.4 | T05 |
| BR-2 về trang chủ; 3 mục; nhãn ngắn dưới 600px, đọc nhãn đầy đủ | §4.3, §4.4 | T05 |
| BR-3 5 mục bắt buộc; cơ quan chủ quản; chức vụ; liên kết hữu ích | §3.1, §4.5 | T01, T06 |
| BR-4 điện thoại, email, link ngoài | §4.5 (`ExternalLink` của C01) | T06 |
| BR-5 lấy từ dữ liệu; không ghép chữ; trống thì ẩn | §3.1, §4.3, §4.5 | T01, T05, T06 |
| BR-6 ngày cập nhật | §2, §3.1, §4.5 | T01, T06 |
| BR-7 lời miễn trừ | §4.5, §4.9 | T04, T06; popup F03, trợ lý F06 |
| BR-8 EMC | Không làm — chờ câu hỏi mở 19 | — |
| BR-9 tiêu đề tab, popup, `lang` | §3.2, §4.7 | T02, T03, T07; popup F03 |
| BR-10 trang 404; lĩnh vực, thủ tục không có | §4.6, §4.9 | T05, T04; giao diện F04, F03 |
| BR-11 trạng thái chỉ ở vùng nội dung | §4.1, §4.2, §4.8 | T05; thành phần C01; từng trang F02–F06 |
| BR-12 liên kết bỏ qua | §4.2 | T05 |
| BR-13 dữ liệu đặc tả | §3.2, §3.3, §4.7 | T02, T04, T07 |
| BR-14 biểu tượng | §4.3 | T05 |
| AC-1 3 mục, giống nhau, đánh dấu | §4.1, §4.4 | T05 → T10 |
| AC-2 bấm biểu tượng, tên | §4.3 | T05 → T10 |
| AC-3 375px, trình đọc màn hình, 600/1280px | §4.4 | T05 → T10 |
| AC-4 Tab đầu tiên | §4.2 | T05 → T10 |
| AC-5 5 mục, gọi được, chức vụ | §3.1, §4.5 | T01, T06 → T10 (dữ liệu: F01 T07) |
| AC-6 đổi số, bỏ trống mục | §2, §4.5 | T01, T06; F00 T18 → T10 |
| AC-7 ngày, nhập lỗi không đổi | §2, §4.5 | T01, T06 → T10 (dữ liệu: F01 T05) |
| AC-8 lời miễn trừ ở 3 nơi | §4.5, §4.9 | T06 → T10; popup sau F03, trợ lý sau F06 |
| AC-9 `/abc-xyz` | §4.6 | T05 → T10 |
| AC-10 lĩnh vực, thủ tục không có | §4.6, §4.9 | T04 → T10 sau F04, F03 |
| AC-11 mất mạng, thử lại, số điện thoại | §4.8 | T03; C01; T10 sau F04 |
| AC-12 không có kết quả | `EmptyState` của C01 | T10 sau F04 |
| AC-13 3G chậm: khung trước, "Đang tải…" | §4.1, §4.8 | T05 → T10 (đầy đủ sau F04) |
| AC-14 tên, địa bàn, tiêu đề tab theo dữ liệu | §3.1–§3.3, §4.3, §4.7 | T01, T02, T05, T07 → T10 |
| AC-15 liên kết hữu ích | §4.5 | T06 → T10 |
| AC-16 email, bản đồ | §4.5 | T06 → T10 |
| AC-17 tiêu đề khác nhau, `lang` | §3.2, §4.7 | T02, T07 → T10 |
| AC-18 6 yếu tố đặc tả | §3.2, §3.3, §4.7 | T02, T07 → T10 |
| AC-19 cơ quan chủ quản ở chân trang và đặc tả | §3.3, §4.5 | T02, T06, T07 → T10 |
| AC-20 tiêu đề tab khi popup; xem trước Zalo | §3.2, §4.7 | T02, T03 → T10 sau F03 |
| AC-21 biểu tượng, thay file | §4.3 | T05 → T10 |
| F00 BR-15, AC-16 mở thẳng địa chỉ không có | §4.1 route `*` | T05 → T10 |
| F00 BR-14 số điện thoại cho trình duyệt cũ | §3.1 | T01 (API); F00 T21 đã làm phần FE |
| Nguồn dữ liệu Mẫu (F00 §9, kế hoạch 6.0 — 2026-10-12) | §1, §2, §3.1, §7 | T11; F00 T29–T31 |
| AC-22 chế độ demo: dòng ngày cập nhật = ngày bộ mẫu, đặc tả đủ 6 yếu tố, không dấu hiệu bản chạy thử | §2, §4.5, F00 §9.8 | T11, F00 T29 → T10 |

## 9. Rủi ro

1. **Câu A1 đã trả lời (b), 2026-10-12** — rủi ro dưới đây không còn. Nếu chọn (a): Zalo, công cụ tìm kiếm thấy tiêu đề và mô tả chung "Tra cứu thủ tục hành chính", không có tên Trung tâm; mã nguồn HTML thiếu người tạo, cơ quan ban hành, thời gian. AC-18 chỉ đạt khi xem DOM sau khi JS chạy; AC-20 chỉ đạt ở nghĩa "giống hệt khi không có mã".
2. **C01 chưa xong:** T05, T06 cần token, `Button` dạng liên kết, `ExternalLink`, `Skeleton`, `ErrorState`, icon. Thiếu biến thể liên kết của `Button` → phải bổ sung C01 trước.
3. **F01 T05, T07 chưa xong:** tester chưa có dữ liệu thật cho AC-5–AC-7, AC-14–AC-16, AC-19. Tạm chèn tay vào DB dev được, nhưng AC "nhập lại → đổi" cần công cụ nhập. Cập nhật 2026-10-12: F01 T05, T07 đã xong; nguồn Mẫu (F00 §9) cho xem giao diện với dữ liệu mẫu mà không cần DB. AC dùng dữ liệu thử riêng (AC-5, AC-14, AC-19) và AC nhập lại (AC-6, AC-7) vẫn chạy với nguồn PostgreSql.
4. **Hai nơi giữ danh sách thẻ đặc tả** (BE §3.2, FE §4.7) có thể lệch nhau. Giảm thiểu: một bảng ở §3.3; tester so cả trang mở thẳng lẫn trang tới bằng điều hướng.
5. **Dấu đánh dấu `<!--dac-ta-->` bị mất khi build** nếu sau này bật nén HTML. T04 kiểm bản build còn dấu.
6. **`Host` giả** trong `DC.identifier`: cần `AllowedHosts` khi triển khai (§6).
7. **Kiosk không tải lại trang** nên chân trang, tiêu đề có thể cũ tới khi tải lại (§4.11 — F09 quyết).
8. **Đầu trang lặp địa bàn:** tên Trung tâm trong dữ liệu đã có "xã Cần Giuộc", dòng địa bàn ghi lại "xã Cần Giuộc – tỉnh Tây Ninh". Đúng BR-5, AC-14 nhưng khác hình mẫu design-system §5 (tên rút gọn). Dữ liệu không có trường tên rút gọn.
9. **Output cache theo mọi query** (F00 T18: `QueryKeys = "*"`): `/api/trung-tam?x=1…n` tạo nhiều bản cache, chặn bởi giới hạn bộ nhớ mặc định 100 MB của output cache. Rủi ro chung của policy F00, không riêng F08.

## 10. Cần hỏi

### A. Cần trả lời trước khi làm task liên quan

| # | Câu hỏi | Phương án | Đề xuất |
|---|---|---|---|
| A1 | **Chặn T02 và phần `dac-ta-trang.json` của T04.** Tiêu đề "<Tên trang> – <Tên trung tâm>" và dữ liệu đặc tả (người tạo, cơ quan ban hành, thời gian) lấy từ DB. Zalo và công cụ thu thập không chạy JavaScript. F00 §2b đang chèn tiêu đề chung lúc build, chưa tính tới BR-9, BR-13 của F08 | (a) Chỉ trình duyệt cập nhật (§4.7). Đơn giản; `index.html` vẫn tĩnh. Zalo thấy "Tra cứu thủ tục hành chính" + mô tả chung, không có tên Trung tâm; HTML gốc thiếu 3 yếu tố đặc tả. (b) Máy chủ chèn dữ liệu đặc tả vào HTML khi trả trang (§3.2), trình duyệt cập nhật khi đi tới trang khác (§4.7). Thêm 1 task BE và một plugin build; trang HTML phụ thuộc DB nhưng có dự phòng (DB lỗi vẫn trả trang với khối mặc định) | **(b) — người dùng chọn 2026-10-12.** Đúng BR-9, BR-13, AC-18, AC-20 cả khi đọc bằng máy không chạy JS (Zalo, công cụ đánh giá trang) |

### B. Đề xuất — đã chấp nhận 2026-10-12 (người dùng không phản đối B1–B12)

| # | Nội dung | Đề xuất | Lý do |
|---|---|---|---|
| B1 | Đặt kiểu, hàm gọi và hook dữ liệu Trung tâm ở đâu | `core/api/trungTam.ts` + `useThongTinTrungTam()` — **đã chấp nhận 2026-10-12** | `app` (đầu, chân trang), F02, F06 và `ErrorState` (C01) cùng cần; feature không import được `app`, `core` không import được feature |
| B2 | Thay logo mà không sửa mã | Thư mục `app/layout/logo/` chứa đúng 1 file `.svg`/`.png`/`.webp`, nạp bằng `import.meta.glob`; thay file → build, triển khai lại — **đã chấp nhận 2026-10-12** | Tên file có hash nên trình duyệt nhận ngay (file ngoài `/assets` hiện không có `Cache-Control`); logo thật có thể không phải SVG |
| B3 | Favicon | Chưa có tới khi có logo chính thức (design-system §8); `index.html` khai `<link rel="icon" href="data:,">` — **đã chấp nhận 2026-10-12** | Không tự làm favicon từ biểu tượng chung; trình duyệt không gọi `/favicon.ico` (đường dẫn này hiện rơi vào trang HTML) |
| B4 | Cách ghi người chịu trách nhiệm | "Người chịu trách nhiệm nội dung: <Họ tên> – <Chức vụ>"; chức vụ trống → bỏ cả "– …" — **đã chấp nhận 2026-10-12** | Theo spec BR-3, AC-5 (hiện họ tên). design-system §5 ghi "ghi chức danh, không ghi họ tên" — trái spec, xem ghi chú dưới |
| B5 | Dòng bản quyền (design-system §5 có, spec không nói) | Giữ "© <Tên trung tâm>", không ghi năm — **đã chấp nhận 2026-10-12** | Không phải viết cứng năm; tên lấy từ dữ liệu |
| B6 | Viết hoa đầu dòng địa bàn | Không tự viết hoa — hiện nguyên văn dữ liệu (vd. "xã Cần Giuộc – tỉnh Tây Ninh"). Muốn viết hoa thì nhập "Xã Cần Giuộc" — **đã chấp nhận 2026-10-12** | BR-5 "hiện đúng như dữ liệu", AC-14 |
| B7 | Mô tả từng trang (BR-13) | Trang chủ: "Tra cứu thủ tục hành chính, giờ làm việc và các dịch vụ trực tuyến của Trung tâm Phục vụ hành chính công." · Danh mục: "Danh mục thủ tục hành chính cấp xã, cấp tỉnh: thành phần hồ sơ, thời hạn giải quyết, phí, lệ phí." · Lĩnh vực: "Thủ tục hành chính theo từng lĩnh vực, kèm mã QR để mở nhanh trên điện thoại." · 404: "Không tìm thấy trang bạn cần." — **đã chấp nhận 2026-10-12** | Câu ngắn, không chứa tên đơn vị (tên đã có trong tiêu đề). Sửa được trong file ngôn ngữ |
| B8 | `/thu-tuc`, `/linh-vuc` trước khi có F04, F05 | Trang tạm `app/TrangTam` chỉ có tiêu đề trang — **đã chấp nhận 2026-10-12** | Kiểm được AC-1–AC-3, AC-17 ngay; frontend-dev không có task trong F08 |
| B9 | Cách nạp lười trang | `React.lazy` + `Suspense` trong `<main>` thay `lazy` của route — **đã chấp nhận 2026-10-12** | Đầu, chân trang hiện ngay (AC-13) |
| B10 | Chưa nhập dữ liệu Trung tâm lần nào | API trả 404 `khong-tim-thay`; đầu trang chỉ còn biểu tượng và điều hướng; chân trang chỉ còn lời miễn trừ — **đã chấp nhận 2026-10-12** | Chỉ xảy ra trước lần nhập đầu |
| B11 | Mã HTTP của địa chỉ không tồn tại | Giữ 200, React hiện trang 404 — **đã chấp nhận 2026-10-12** | Đơn giản; người dùng thấy đúng trang (F00 BR-15). Đổi sang 404 được nếu muốn (A1 = b đã có danh sách đường dẫn ở BE) |
| B12 | Dữ liệu đặc tả trong HTML (A1 = b) cũ tới bao lâu | Giữ trong bộ nhớ máy chủ 30 giây (`Caching:DacTaTrang`) — **đã chấp nhận 2026-10-12** | Trang HTML không truy vấn DB mỗi lần mở, không cần giới hạn tần suất. Chữ hiện trên tab và chân trang vẫn mới ngay vì trình duyệt lấy từ API |

### Ghi cho ba-analyst (không chặn)

- `design-system.md` §5 `AppFooter` ghi "người chịu trách nhiệm nội dung (ghi chức danh, không ghi họ tên)"; spec BR-3, AC-5 và F01 BR-8 hiện họ tên. Plan theo spec.
- `design-system.md` §5 `AppHeader` ghi chữ cố định "Trung tâm Phục vụ hành chính công", "Xã Cần Giuộc – Tỉnh Tây Ninh"; spec BR-5, AC-14 lấy từ dữ liệu. Plan theo spec (rủi ro 8).
- Prototype: trang 404 chỉ có "Về trang chủ", lời miễn trừ khác câu BR-7, liên kết "Cổng Dịch vụ công Quốc gia" ở chân trang viết cứng. Plan theo spec (BR-10 hai nút, BR-7 nguyên văn, liên kết từ dữ liệu).
- `cau-hoi-mo.md` câu 31: phần trả lời đầu ghi "màn hình hẹp thì thanh điều hướng cuộn ngang", phần bổ sung ghi "không vuốt ngang". Plan theo phần bổ sung (BR-2).
