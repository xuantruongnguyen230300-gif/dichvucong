---
id: F03
ten: Thủ tục thường gặp và popup chi tiết — kế hoạch kỹ thuật
spec: spec.md (da-duyet 2026-10-12; đổi sang dang-lam khi lập xong tasks.md)
nguon: spec.md; .specify/nghiep-vu/{du-lieu, lien-ket, cau-hoi-mo, can-giuoc}.md; .specify/design-system.md §5 (ThuTucCard, ThuTucBang, ChiTietThuTuc); .specify/prototype/index.html (popup, thẻ, bảng, khối thường gặp); plan F00 §1, §9; plan C01 §3–§4; plan F08 §4.7, §4.12; mã thật trong src/
cap_nhat: 2026-10-13 (đối chiếu plan F02, F04)
---

# F03 · Thủ tục thường gặp và popup chi tiết — kế hoạch kỹ thuật

## 1. Tóm tắt

Hai việc, chia theo thứ người dân thấy:

1. **Popup chi tiết một thủ tục**, dùng chung cho F02, F03, F04, F05, F06 (F03 BR-5). Mở bằng mã trên địa chỉ (`?ma=…`), chi tiết chỉ tải khi mở.
2. **Khối thủ tục thường gặp** (F03 BR-1…BR-10) trên trang chủ, và **danh sách thẻ / bảng thủ tục** (`ThuTucCard`, cột bảng) mà F04 dùng lại.

| Phần | Chạm gì |
|---|---|
| DB | Không đổi, không migration, không chỉ mục mới (§2) |
| BE | Một endpoint mới `GET /api/thu-tuc/{ma}` (§3), thư mục `Features/ChiTietThuTuc/`. Dùng lại cache `danh-muc`, rate limit `danh-muc`, `INguonDuLieu` |
| FE `features/thu-tuc/` (frontend-dev) | Hook mở/đóng popup, popup, nội dung chi tiết, thẻ + cột bảng + `DanhSachThuTuc`, `KhoiThuongGap`, `linkDvc`, câu chữ `thu-tuc` (§4) |
| FE `app/` (ui-core-dev) | Hai task nhỏ (§4.8): T04 khai báo kiểu cho namespace `thu-tuc` và nạp namespace ở route trang chủ; T06 gắn `ThuTucPopup` vào `Layout`. Không thêm gì vào `core/` |
| Trợ lý | F06 chỉ **dùng** `useMoThuTuc` và `linkDvc` (§4.9). F03 không sửa mã của F06 |
| db-dev, chatbot-dev | Không có task |

Không thêm thư viện npm hay NuGet.

Mã đã có và được dùng lại (đọc ở `src/`, đúng tên và chữ ký):

- BE: `INguonDuLieu.ThuTucs`, `LinhVucs`; `TruyVan.DauTienAsync`; `CachePolicies.DanhMuc`, `RateLimitPolicies.DanhMuc`; `MaLoi`; mẫu controller của `ThongTinTrungTamController` (HEAD, `[OutputCache]`, `[EnableRateLimiting]`).
- FE: `Modal` (`mo`, `onDong`, `tieuDe`, `phanTrenTieuDe`, `chanPopup`), `Card` + `CardActions`, `Badge`, `ExternalLink` (`nut-accent`, `dam`), `Button` (`lien-ket`), `SectionTitle` (`phu`), `SearchBox`, `ChipGroup`, `ViewToggle`, `DataTable` + `CotBang`, `QueryState`, `EmptyState`, `ErrorState`, `Skeleton`, `useCachXem`, `useDanhSachUrl`, `useCheDoKiosk`, `useTieuDeTabTam`, `ghepChuoiTimKiem`, `taoBoLocTuKhoa`, `http`/`ApiError`, `common:mien-tru`, `common:khong-tim-thay.thu-tuc`.

## 2. Dữ liệu

Không có entity, bảng, cột, chỉ mục hay migration mới. Endpoint chi tiết đọc một dòng `thu_tuc` theo khoá chính `ma` (đã có) và một dòng `linh_vuc` theo khoá chính.

| Cột / thuộc tính đọc | Trả ra |
|---|---|
| `ma`, `ten`, `muc_do`, `co_quan_thuc_hien`, `thoi_han`, `phi`, `hinh_thuc_nop`, `yeu_cau_dieu_kien`, `ket_qua` | Có |
| `trinh_tu`, `cach_thuc`, `thanh_phan_ho_so`, `can_cu` (jsonb) | Có, theo thứ tự đã lưu (F01 giữ thứ tự dòng) |
| `linh_vuc.ten` (qua `linh_vuc_ma`) | Có — tên lĩnh vực |
| `ten_tim_kiem`, `linh_vuc_ma`, `thuoc_danh_muc_xa/tinh`, `trang_thai_cong_bo`, `ma_dvc`, `don_vi_ten`, `don_vi_ma`, `thu_tu`, `thu_tu_thuong_gap` | **Không** — màn hình chi tiết không dùng (§10 mục 5) |

Kích thước đo trên `Mau/du-lieu-mau.json` (408 thủ tục): chi tiết trung bình khoảng 10,7 KB JSON (khoảng 3 KB sau nén), lớn nhất 55,8 KB (mã 1.013229, khoảng 4,6 KB sau nén). Nhiều nhất là cột `trinh_tu` (một bước dài tới 9,3 KB, có xuống dòng). Đọc một dòng theo khoá chính, không cần chỉ mục thêm.

## 3. API — hợp đồng giữa BE và FE

### 3.1 `GET /api/thu-tuc/{ma}` — chi tiết thủ tục cho popup (F03 sở hữu)

Vị trí mã: `src/BackEnd/DichVuCong.Api/Features/ChiTietThuTuc/`. Dùng thư mục riêng, không dùng chung với F04 (F04 có `GET /api/thu-tuc`); hai controller cùng tiền tố `api/thu-tuc` không xung đột vì khác route.

| File | Nội dung |
|---|---|
| `ChiTietThuTucController.cs` | `[ApiController]`, `[Route("api/thu-tuc")]`; một action `[HttpGet("{ma}")]` + `[HttpHead("{ma}")]`, gắn `[OutputCache(PolicyName = CachePolicies.DanhMuc)]` và `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]` (middleware 304 của F00 chỉ nhận policy gắn đúng cách này). Service trả `null` → `NotFound()` (thân rỗng; `UseStatusCodePages` biến thành ProblemDetails `khong-tim-thay`) |
| `ChiTietThuTucService.cs` | `IChiTietThuTucService.LayAsync(string ma, CancellationToken)` → DTO hoặc `null`. Nhận `INguonDuLieu`, không nhận `AppDbContext` (R1) |
| `ChiTietThuTucDtos.cs` | Các record bên dưới |
| `ThoiHanThuTuc.cs` | Hàm thuần chọn thời hạn rõ ràng (bên dưới) |
| `ChiTietThuTucServiceCollectionExtensions.cs` | `AddChiTietThuTuc()`; `AddApiServices` (`Common/Hosting/ApiHostingExtensions.cs`) gọi, như `AddThongTinTrungTam()`. `Program.cs` không đổi |

**Route, cache, đầu vào** (trả lời câu "cache `danh-muc` + `[DanhMucQuery]` hay route param"):

- Mã nằm ở **route** (`{ma}`), không phải query. Khoá output cache gồm đường dẫn nên mỗi mã một mục cache riêng, kèm phiên bản dữ liệu (F00 T18). Endpoint **không** gắn `[DanhMucQuery]` → mọi query (`?x=…`) bị bỏ khỏi khoá, không thổi được cache bằng query ngẫu nhiên.
- Policy chỉ lưu response 200 (`ServeResponseAsync`), nên mã lạ (404) không chiếm bộ nhớ cache: số mục tối đa bằng số thủ tục (khoảng 1.000 × 11 KB ≈ 11 MB, dưới giới hạn 100 MB mặc định của output cache).
- Mã đúng định dạng khi khớp `^[A-Za-z0-9._-]{1,20}$` (20 = độ dài tối đa của `thu_tuc.ma`). Sai định dạng → trả `null` ngay, **không** chạm DB → 404 `khong-tim-thay` (cùng kết quả với mã không có trong dữ liệu; F08 BR-10 cũng xử lý hai trường hợp như nhau). Không dùng 400, để FE chỉ có một nhánh "không tìm thấy".
- So khớp mã bằng `t.Ma == ma` (bằng nhau theo thứ tự byte, không phải so sánh theo văn hoá — an toàn với R4 ở cả hai nguồn).

**Response** (C#, JSON camelCase như mặc định ASP.NET Core; thuộc tính null vẫn có mặt):

```csharp
public sealed record ChiTietThuTucDto(
    string Ma,
    string Ten,
    string LinhVuc,                       // tên lĩnh vực
    string MucDo,                         // "toan-trinh" | "mot-phan" (cùng giá trị với tham số md của F04)
    string? CoQuanThucHien,
    string? ThoiHan,                      // thời hạn rõ ràng, null = chưa ghi rõ (quy tắc bên dưới)
    string? Phi,
    IReadOnlyList<string> HinhThucNop,    // vd. ["Trực tuyến", "Bưu chính"]; rỗng nếu không có
    string? YeuCauDieuKien,
    IReadOnlyList<BuocTrinhTuDto> TrinhTu,
    IReadOnlyList<CachThucNopDto> CachThuc,
    IReadOnlyList<GiayToDto> ThanhPhanHoSo,
    IReadOnlyList<string> KetQua,
    IReadOnlyList<CanCuDto> CanCu);

public sealed record BuocTrinhTuDto(string? TruongHop, string NoiDung);
public sealed record CachThucNopDto(string? HinhThuc, string? ThoiHan, string? Phi, string? MoTa);
public sealed record GiayToDto(string Ten, int? BanChinh, int? BanSao);   // null và null = chưa ghi số bản (F01 Q10)
public sealed record CanCuDto(string? SoKyHieu, string? TrichYeu);        // chỉ chữ, không có link
```

Kiểu TypeScript tương ứng — `src/FrontEnd/src/features/thu-tuc/api/chiTietThuTuc.ts`:

```ts
export type MucDoThuTuc = 'toan-trinh' | 'mot-phan';

export interface ChiTietThuTuc {
  ma: string;
  ten: string;
  linhVuc: string;
  mucDo: MucDoThuTuc;
  coQuanThucHien: string | null;
  thoiHan: string | null;
  phi: string | null;
  hinhThucNop: string[];
  yeuCauDieuKien: string | null;
  trinhTu: { truongHop: string | null; noiDung: string }[];
  cachThuc: { hinhThuc: string | null; thoiHan: string | null; phi: string | null; moTa: string | null }[];
  thanhPhanHoSo: { ten: string; banChinh: number | null; banSao: number | null }[];
  ketQua: string[];
  canCu: { soKyHieu: string | null; trichYeu: string | null }[];
}
```

Ví dụ (rút gọn, thủ tục 1.001193 trong dữ liệu mẫu):

```json
{
  "ma": "1.001193", "ten": "Thủ tục đăng ký khai sinh", "linhVuc": "Hộ tịch", "mucDo": "toan-trinh",
  "coQuanThucHien": "Ủy ban nhân dân cấp xã", "thoiHan": null, "phi": "Lệ phí: 0 VNĐ",
  "hinhThucNop": ["Trực tuyến", "Bưu chính", "Trực tiếp"], "yeuCauDieuKien": null,
  "trinhTu": [{ "truongHop": null, "noiDung": "- Nếu lựa chọn hình thức nộp hồ sơ trực tiếp, …" }],
  "cachThuc": [{ "hinhThuc": "Trực tuyến", "thoiHan": null, "phi": "Lệ phí: 0 VNĐ", "moTa": null }],
  "thanhPhanHoSo": [{ "ten": "…", "banChinh": 1, "banSao": 0 }, { "ten": "…", "banChinh": null, "banSao": null }],
  "ketQua": ["…"], "canCu": [{ "soKyHieu": "…", "trichYeu": "…" }]
}
```

Ở ví dụ, nguồn ghi thời hạn "1 Khác" nên `thoiHan` là `null` (quy tắc dưới đây).

**Quy tắc thời hạn rõ ràng** (`ThoiHanThuTuc`, hàm thuần chạy trong C# sau khi đã lấy dữ liệu — không nằm trong biểu thức LINQ, đúng R4). `du-lieu.md` ghi 77/408 thủ tục có thời hạn chỉ là "Khác" hoặc "1 Khác":

- `LamRo(s)`: `null` nếu rỗng, toàn khoảng trắng, hoặc khớp `^\s*\d*\s*(khác|khac)\s*$` không phân biệt hoa thường (Unicode); còn lại trả nguyên `s`.
- `Chon(thoiHan, cacCachThuc)`: `LamRo(thoiHan)`; nếu `null` thì thời hạn rõ ràng đầu tiên trong các cách thức; không có thì `null`. Đây là hàm `thoiHan` của prototype đã duyệt.
- `CachThuc[].ThoiHan` cũng qua `LamRo` (bảng cách thức không hiện "1 Khác").
- BE không trả câu "Chưa ghi rõ — xem trên Cổng DVC Quốc gia": FE hiện câu này từ file ngôn ngữ khi `thoiHan` là `null` (đúng quy ước i18n: BE trả dữ liệu, FE đặt chữ).
- **Đã chốt với F04 (2026-10-13):** `thoiHan` của `ThuTucRutGonDto` (danh mục) cũng đi qua `ThoiHanThuTuc.Chon`. **F03 T01 tạo hàm** (public static, `DichVuCong.Api.Features.ChiTietThuTuc.ThoiHanThuTuc`, chữ ký `Chon(string? thoiHan, IEnumerable<string?> thoiHanCacCachThuc)` và `LamRo(string?)`); F04 gọi, không viết lại. Thứ tự: **F03 T01 (phần `ThoiHanThuTuc` + test, làm đầu tiên) trước F04 T01**. F04 phải lấy `thoiHan` của từng cách thức vào bộ nhớ rồi gọi `Chon` sau khi lấy kết quả (không đặt trong biểu thức LINQ — R4).

**Truy vấn** (R1–R5 của F00 §9.4): một truy vấn `nguon.ThuTucs.Where(t => t.Ma == ma).Select(…anonymous…).DauTienAsync(ct)` lấy các cột ở §2, rồi một truy vấn khoá chính lấy tên lĩnh vực từ `nguon.LinhVucs` (không đọc navigation `t.LinhVuc` — R2). Ánh xạ sang record DTO bằng C# **sau** khi lấy dữ liệu, tạo danh sách mới; không giữ, không sửa đối tượng của nguồn Mẫu. `MucDo` đổi sang chuỗi bằng `switch` trong C#. Không dùng `StartsWith`, `EndsWith`, `Contains` kiểu chuỗi trong `Features/` (test `QuyTacTruyVanTests` quét văn bản). Chưa kiểm được trước: EF có chiếu (project) trực tiếp cột jsonb `List<…>` trong `Select` hay không — nếu không, đọc entity bằng `AsNoTracking` rồi ánh xạ ngay sang DTO và bỏ entity (rủi ro 3, §9).

| Mã HTTP | Khi nào | `code` (F00 §2b) |
|---|---|---|
| 200 | Có thủ tục. Kèm `ETag`, `Cache-Control: no-cache` (F00 T18) | — |
| 304 | `If-None-Match` khớp phiên bản hiện tại | — |
| 404 | Mã không có trong dữ liệu **hoặc** sai định dạng | `khong-tim-thay` |
| 405 | Phương thức khác GET, HEAD | `phuong-thuc-khong-hop-le` |
| 429 | Vượt giới hạn `danh-muc` (300/phút/IP) | `qua-nhieu-yeu-cau` |
| 500 | Lỗi DB hoặc lỗi khác; có `maTraCuu` | `loi-he-thong` |

Chỉ có trường màn hình cần. Không trả: `ThuTu`, `ThuTuThuongGap`, `TrangThaiCongBo`, `MaDvc`, `DonViMa`, `DonViTen`, cờ cấp xã/cấp tỉnh, `TenTimKiem`. Lỗi không nhắc lại mã trong `title`/`detail` (FE cũng không hiện — F08 BR-10).

### 3.2 Hợp đồng F03 dùng từ F04 (F04 §3.1 — F04 sở hữu, F03 không định nghĩa lại)

Đã đối chiếu với `specs/F04-danh-muc-thu-tuc/plan.md` §3.1 (2026-10-13). F03 dùng đúng các tên sau:

- `GET /api/thu-tuc` → `ThuTucRutGonDto` gồm `ma, ten, tenTimKiem, linhVucMa, mucDo, capXa, capTinh, thuTuThuongGap, thoiHan, coQuanThucHien`; `GET /api/linh-vuc` → `LinhVucDto`. Trả đủ thủ tục thuộc ít nhất một cấp, kể cả thủ tục chỉ thuộc cấp tỉnh (4/16 mã thường gặp bản đầu), nên khối thường gặp không phân cấp.
- FE `core/api/danhMucThuTuc.ts`: `ThuTucRutGon`, `ThuTucDanhMuc` (thêm `tenLinhVuc` và `tim` = tên + mã + lĩnh vực đã chuẩn hoá), `MucDo`, `useDanhMucThuTuc(): UseQueryResult<DanhMucThuTuc>` với `DanhMucThuTuc = { thuTuc, linhVuc, linhVucTheoMa }`. Khối thường gặp dùng `data.thuTuc`, lọc `thuTuThuongGap !== null`, sắp tăng theo `thuTuThuongGap`, và lọc bằng `tim` (BR-1) — F03 **không** tự ghép chuỗi tìm kiếm.
- `thoiHan` trong danh mục đã qua `ThoiHanThuTuc.Chon` (§3.1): thẻ và bảng hiện thẳng, `null` thì không hiện nhãn thời hạn.
- F03 chỉ khai kiểu cấu trúc tối thiểu cho thành phần dùng chung; `ThuTucDanhMuc` gán được cho nó nhờ so khớp cấu trúc của TypeScript:

```ts
// features/thu-tuc/types.ts (F03)
export type MucDoThuTuc = 'toan-trinh' | 'mot-phan';  // trùng MucDo của F04
export interface MucThuTuc {
  ma: string;
  ten: string;
  linhVucMa: string;                  // chip và tham số lv trên địa chỉ
  tenLinhVuc: string;                 // tên lĩnh vực (ThuTucDanhMuc.tenLinhVuc)
  mucDo: MucDoThuTuc;
  coQuanThucHien: string | null;
  thoiHan: string | null;             // null = chưa ghi rõ
  thuTuThuongGap: number | null;
}
```

- Danh mục tải một lần và dùng chung bộ nhớ với trang danh mục (khoá `['danh-muc-thu-tuc']` của F04); trang chủ vì thế gọi cả `/api/thu-tuc` và `/api/linh-vuc` (§5).

## 4. FE

### 4.1 Cấu trúc `src/FrontEnd/src/features/thu-tuc/` (frontend-dev)

Tên theo design-system §5 (`ThuTucCard`, `ThuTucBang`, `ChiTietThuTuc`). Các file nhỏ mà chức năng khác import (`useMoThuTuc`, `linkDvc`, `maThuTuc`) tách riêng, không kéo theo popup hay danh sách.

```
features/thu-tuc/
  types.ts                  # MucThuTuc, MucDoThuTuc (§3.2)
  maThuTuc.ts               # KHOA_MA = 'ma'; laMaHopLe(ma): ^[A-Za-z0-9._-]{1,20}$
  linkDvc.ts                # linkDvc(ma) — một nguồn duy nhất
  useMoThuTuc.ts            # { ma, mo(ma), dong() } — §4.2
  ThuTucPopup.tsx           # <ThuTucPopup /> không props: đọc ?ma=, nạp lười PopupChiTiet — chỉ gắn một lần ở Layout; napTruocPopupChiTiet()
  PopupChiTiet.tsx          # Modal + trạng thái tải/lỗi/không tìm thấy + ChiTietThuTuc (nạp lười)
  ChiTietThuTuc.tsx         # nội dung chi tiết (§4.3)
  ThuTucCard.tsx            # thẻ (§4.4)
  cotThuTuc.tsx             # cột bảng ThuTucBang (§4.4)
  DanhSachThuTuc.tsx        # DataTable + thẻ + cột; F04 dùng lại (§4.4)
  KhoiThuongGap.tsx         # khối trên trang chủ (§4.5) — F02 ghép
  api/chiTietThuTuc.ts      # kiểu (§3.1), layChiTietThuTuc, useChiTietThuTuc, useNapTruocChiTiet
  i18n/{index.ts, vi.json}  # namespace 'thu-tuc'; napNgonNguThuTuc()
  *.module.css, *.test.ts(x)
```

**`linkDvc(ma)`** — trùng từng ký tự với Vàm Cỏ (`lien-ket.md` §2): `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=` + `encodeURIComponent(ma)` + `&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD`. Phần gốc `https://dichvucong.gov.vn/…` là hằng ở đầu file. Mọi nơi (popup, thẻ, dòng bảng, câu trả lời trợ lý) gọi hàm này và hiện bằng `ExternalLink` (mở tab mới, `rel="noopener noreferrer"`, chữ ẩn "(mở trang mới)" — C01 BR-3). Không có link nào khác ra Cổng DVC; không có nút "Nộp trực tuyến".

**`api/chiTietThuTuc.ts`:**

- `API_THU_TUC = '/api/thu-tuc'`; `layChiTietThuTuc(ma, signal?)` gọi `http<ChiTietThuTuc>(\`${API_THU_TUC}/${encodeURIComponent(ma)}\`)`.
- Khoá cache `['chi-tiet-thu-tuc', ma]` (gốc khoá riêng, không trùng khoá danh mục của F04, để `invalidateQueries` bên đó không động tới chi tiết).
- `useChiTietThuTuc(ma: string | null)`: `enabled` khi `ma !== null && laMaHopLe(ma)`; không thử lại khi `ApiError.status === 404` (giống `useThongTinTrungTam`); lỗi khác theo cấu hình mặc định (`retry: 1`).
- `useNapTruocChiTiet()` trả hàm `(ma) => void` gọi `queryClient.prefetchQuery` (bỏ qua mã sai định dạng).

### 4.2 Mở, đóng popup và địa chỉ (F03 BR-8)

```ts
// useMoThuTuc.ts
export function useMoThuTuc(): { ma: string | null; mo: (ma: string) => void; dong: () => void };
```

- `ma`: giá trị tham số `ma` trên địa chỉ (`useSearchParams`); `null` khi không có tham số. Tham số có mặt nhưng rỗng hay sai định dạng vẫn là "đang mở" (hiện thông báo không tìm thấy — F08 BR-10).
- `mo(ma)`: `navigate({ search: <tham số hiện tại + ma> }, { replace: kiosk, preventScrollReset: true, state: { popupThuTuc: true } })`. Giữ nguyên mọi tham số khác (`q`, `lv`, `trang`, `cap`, `md`…) — F04 AC-13, F03 AC-17. `kiosk` = `useCheDoKiosk()`: **ở kiosk mở popup bằng `replace`**, không thêm mục lịch sử, để "Bắt đầu lại" (F09 BR-7) không phải xoá thêm gì (như prototype). Ngoài kiosk là `push`.
- `dong()`: nếu mục lịch sử hiện tại có `state.popupThuTuc === true` (popup mở bằng `mo` ở máy thường) → `navigate(-1)`. Ngược lại (mở thẳng bằng link, hoặc kiosk) → `navigate({ search: <bỏ ma> }, { replace: true, preventScrollReset: true })`. Hai nhánh cho cùng kết quả nhìn thấy: địa chỉ bỏ `ma`, danh sách bên dưới giữ nguyên (AC-16); "Quay lại" của trình duyệt đóng popup, trang giữ nguyên từ khoá và số trang (AC-17), vì `useDanhSachUrl` luôn ghi bằng `replace` nên một trạng thái danh sách chỉ có một mục lịch sử.
- `ScrollRestoration` của `Layout` dùng khoá `pathname` nên đổi `?ma=` không làm trang nhảy; `preventScrollReset` là lớp bảo đảm thêm.

**`ThuTucPopup`** (nằm trong `Layout`, bọc `RanhGioiKhung` sẵn có để lỗi tải chunk không sập cả khung):

- `ma === null` → không vẽ gì.
- Ngược lại `<Suspense fallback={null}><PopupChiTiet key={ma} ma={ma} onDong={dong} /></Suspense>`, với `PopupChiTiet = lazy(() => Promise.all([import('./PopupChiTiet'), napNgonNguThuTuc()]) …)`.
- Vì mở ở mọi trang (kể cả trang chủ, danh mục, lĩnh vực), một chỗ gắn duy nhất ở `Layout` phục vụ F02, F03, F04, F05, F06; không trang nào tự dựng popup.
- Xuất thêm `napTruocPopupChiTiet()` (`import('./PopupChiTiet')`) để danh sách nạp trước chunk (§5).

**`PopupChiTiet`** (`ma` đã có chắc chắn):

| Tình huống | Hiển thị |
|---|---|
| `laMaHopLe(ma)` sai | Không gọi API. Thông báo không tìm thấy (dòng dưới) |
| Đang tải (`isPending`) | `Modal` đã hiện: tiêu đề `common:trang-thai.dang-tai`, thân `Skeleton dang="dong"` — popup hiện ngay, chờ chi tiết (AC-3) |
| 404 | `Modal` có `tieuDe` = `common:khong-tim-thay.thu-tuc` ("Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng."), không có thân, chân popup là nút "Đóng" (`primary`, `common:nut.dong`). Không nhắc lại mã; chữ trên địa chỉ không bao giờ hiện ra trang (AC-18; F08 AC-10) |
| Lỗi khác (mất mạng, 429, 500) | `ErrorState` của C01 trong thân (nút "Thử lại" gọi `refetch`, số điện thoại, `maTraCuu` với `loi-he-thong`); chân popup nút "Đóng" |
| Có dữ liệu | `ChiTietThuTuc` (§4.3) |

- Tiêu đề tab: `useTieuDeTabTam(data?.ten ?? null)` khi có dữ liệu — popup mở thì tab là đúng tên thủ tục; gỡ popup thì tự về tiêu đề trang (AC-21; F08 BR-9). Chưa có dữ liệu hay không tìm thấy: không đặt (giữ tiêu đề trang). Dữ liệu đặc tả và phần xem trước chia sẻ không đổi (đã đúng nhờ `DacTaTrang`, popup không đụng tới).
- `Modal` lo: giữ con trỏ trong popup, Esc, bấm vùng tối, khoá cuộn, trả con trỏ về nút đã mở (C01 BR-9). F03 không viết lại.

### 4.3 Nội dung chi tiết — `ChiTietThuTuc.tsx` (F03 BR-3)

`Modal` nhận:

- `phanTrenTieuDe`: `Badge info` tên lĩnh vực, `Badge` mức độ (`success` "Toàn trình" / `warning` "Một phần", luôn có chữ — C01 BR-10), mã thủ tục (chữ đơn cách, nhỏ, chữ phụ).
- `tieuDe`: tên thủ tục.
- `chanPopup`: một `ExternalLink bienThe="nut-accent"` "Xem và nộp trên Cổng DVC" tới `linkDvc(ma)`. Đúng một liên kết ra Cổng DVC trong popup. Dành một chỗ trước nút cho dòng nhắc đăng xuất của F09 (F09 thêm, F03 không làm).

Thân, theo thứ tự này (thứ tự spec BR-3; prototype xếp khác một chút — §10 mục 6). **Mục nào không có dữ liệu thì ẩn hẳn, không để chỗ trống:**

| Mục | Điều kiện hiện | Cách hiện |
|---|---|---|
| Thông tin chung (`<dl>`) | Từng dòng ẩn riêng khi trống | Cơ quan thực hiện; **Thời hạn giải quyết** (luôn hiện; `thoiHan === null` → "Chưa ghi rõ — xem trên Cổng DVC Quốc gia"); Phí, lệ phí; Cách nộp (`hinhThucNop` nối bằng ", ") |
| Yêu cầu, điều kiện | `yeuCauDieuKien` khác trống | Đoạn chữ, giữ xuống dòng (`white-space: pre-line`) |
| Cách thức nộp | `cachThuc.length > 0` | Bảng 3 cột Hình thức · Thời gian · Phí, lệ phí, có `<caption>` ẩn và `<th scope="col">`; `moTa` (nếu có) là dòng nhỏ dưới hình thức; ô thời gian/phí trống hiện "—" (`thu-tuc:khong-co`). Không cuộn ngang ở 375 px |
| Thành phần hồ sơ | `thanhPhanHoSo.length > 0` | `<ol>`; mỗi giấy tờ có dòng nhỏ "Bản chính: n · Bản sao: m" **khi** `banChinh` hoặc `banSao` khác `null` (giá trị `null` kia hiện là 0). Cả hai `null` → chỉ tên giấy tờ (AC-23; BR không phải biết quy tắc 0/0, F01 đã đổi sang `null`) |
| Trình tự thực hiện | `trinhTu.length > 0` | Mỗi bước: `truongHop` (nếu có) in đậm, rồi nội dung giữ xuống dòng. Nội dung là chữ thuần |
| Kết quả | `ketQua.length > 0` | `<ul>` |
| Căn cứ pháp lý | `canCu.length > 0` | `<ul>`; mỗi dòng "**số ký hiệu** — trích yếu", chỉ chữ: không `<a>`, không `tabIndex`; Tab không dừng ở mục này (AC-6). Một trong hai trống thì chỉ hiện cái còn lại |
| Lời miễn trừ | Luôn có | `common:mien-tru`, cuối thân popup (đúng câu F08 BR-7; AC-6 yêu cầu có kể cả khi không có căn cứ pháp lý) |

Tiêu đề mục là `<h3>` (tiêu đề popup là `<h2>` do `Modal`). Toàn bộ là nút chữ của React; không `dangerouslySetInnerHTML`.

### 4.4 Thẻ, cột bảng, `DanhSachThuTuc` (F03 BR-4, BR-6, BR-7; F04 dùng lại)

- **`ThuTucCard`** (`Card as="article"`; prototype `veThe`): hàng đầu `Badge info` lĩnh vực + mã; `<h3>` tên (cấp tiêu đề nhận qua prop, mặc định 3); nhãn mức độ + nhãn thời hạn (`Badge neutral`, icon đồng hồ, `rutGon`, chỉ khi `thoiHan` khác `null`); `CardActions`: `Button` "Xem chi tiết" (`secondary`) + `ExternalLink nut-accent` "Xem và nộp trên Cổng DVC". Tên đọc của nút "Xem chi tiết" là "Xem chi tiết <tên thủ tục>" (bắt đầu bằng chữ nhìn thấy — WCAG 2.5.3). Một thẻ có đúng một liên kết ra Cổng DVC (AC-10).
- **`cotThuTuc`** (`CotBang<MucThuTuc>[]`, mảng ổn định khai ngoài component): STT · Mã · Tên thủ tục (`Button bienThe="lien-ket"` mở popup) · Lĩnh vực · Mức độ (`Badge`) · Cơ quan thực hiện · Cổng DVC (`ExternalLink bienThe="dam"`, một liên kết mỗi dòng).
- **`DanhSachThuTuc<T extends MucThuTuc>`**: gói `DataTable` với `cot={cotThuTuc}`, `renderCard`, `khoaDong={t => t.ma}`.

  ```ts
  interface DanhSachThuTucProps<T extends MucThuTuc> {
    duLieu: readonly T[];        // đã lọc, đúng thứ tự
    cachXem: CachXem;            // từ useCachXem()
    tieuDeBang: string;          // đã qua t()
    soMucMoiTrang: number;       // F03: 12, F04: 25
    soCotToiDa?: number;         // dạng thẻ; F03 = 4
    trang: string | null;        // useDanhSachUrl().trang
    onDoiTrang: (so: number) => void;
    capTieuDeThe?: 2 | 3;        // mặc định 3
  }
  ```

  Nút "Xem chi tiết" và nút tên thủ tục trong bảng gọi `useMoThuTuc().mo(ma)`. Dòng nhắc đăng xuất của F09 đứng phía trên danh sách: F09 thêm vào component này.
- Dạng hiển thị theo `useCachXem` (C01 BR-6): điện thoại luôn thẻ và không có nút chuyển dạng; mặc định máy tính bảng và kiosk là thẻ, từ 1024 px là bảng; lựa chọn nhớ trong `localStorage` và dùng chung với F04 — tất cả đã có trong C01, F03 không thêm gì. Dạng thẻ 1–4 cột: `soCotToiDa={4}`; vì 12 chia hết cho 1, 2, 3, 4 nên trang đủ 12 thẻ luôn là hàng đầy (AC-14).

### 4.5 `KhoiThuongGap` — F02 ghép vào trang chủ

```ts
// features/thu-tuc/KhoiThuongGap.tsx
export function KhoiThuongGap(): JSX.Element;   // không có props
```

**Hợp đồng với F02 (đã đối chiếu `specs/F02-trang-chu/plan.md` §4.5, đồng ý):**

- F02 chỉ đặt `<KhoiThuongGap />` **không props** vào trang chủ, import trực tiếp từ `features/thu-tuc/KhoiThuongGap` (không có barrel `index.ts`; F02 giả định `index.ts`, chỉ là đổi đường import).
- Khối **tự bọc** `<section aria-labelledby>` + `SectionTitle cap={2}` ("Thủ tục thường gặp", `h2`) và số đếm; **tự xử lý** tải (`Skeleton`), lỗi (`ErrorState`, "Thử lại"), rỗng (`EmptyState`; không có thủ tục thường gặp nào thì không vẽ khối); **tự nạp** phần nặng (chunk popup, chunk bảng) và **tự nạp câu chữ** namespace `thu-tuc`: bên trong khối bọc `Suspense` + `use(napNgonNguThuTuc())` (hàm nhớ promise, nạp một lần), nên F02 không phải làm gì thêm. Dòng nạp ở `lazy` của route trang chủ (T04) chỉ là tối ưu để namespace về song song với chunk trang; F02 T10 đã thêm thì T04 bỏ qua dòng đó.
- Lỗi của khối độc lập với khối khác trên trang chủ (F02 §4.5).

Hành vi:

1. Dữ liệu: `useDanhMucThuTuc()` (F04, `core/api/danhMucThuTuc.ts`) qua `QueryState<DanhMucThuTuc>` (`Skeleton dang="the" soMuc={12}`, `ErrorState` có "Thử lại"). Có dữ liệu: `thuongGap` = các mục của `data.thuTuc` có `thuTuThuongGap !== null` sắp tăng theo `thuTuThuongGap` (BR-10), lọc theo `tim` có sẵn của F04 (BR-1: tên, mã, tên lĩnh vực). `thuongGap` rỗng → không vẽ khối (§10 mục 8).
2. Địa chỉ: `useDanhSachUrl({ boLoc: ['lv'] })` — khoá `q`, `lv`, `trang` (`lien-ket.md` §3; BR-9). Ghi bằng `replace`, từ khoá chậm 300 ms; đổi từ khoá hay chip → về trang 1. Dạng thẻ/bảng không nằm trên địa chỉ.
3. Chip (BR-2): "Tất cả" + chip của từng lĩnh vực có ≥ 1 thủ tục thường gặp, theo thứ tự xuất hiện đầu tiên trong danh sách thường gặp (như prototype). Giá trị chip = `linhVucMa`; `lv` trên địa chỉ không khớp chip nào thì coi như "Tất cả" và không lọc (§10 mục 7).
4. Lọc: chip `lv` và `taoBoLocTuKhoa(tuKhoaLoc)` trên `tim`; giữ nguyên thứ tự của `thuongGap`.
5. Số đếm: `SectionTitle cap={2}` với `phu` = "Hiển thị {{so}}/{{tong}}" (`so` = số khớp, `tong` = `thuongGap.length`) (BR-7; AC-8, AC-20).
6. Thanh công cụ: `SearchBox` (`soKetQua` = số khớp, `ref` giữ để trả con trỏ), `ViewToggle` (`useCachXem()`), `ChipGroup`.
7. Danh sách: `DanhSachThuTuc` với `soMucMoiTrang={12}`, `soCotToiDa={4}`.
8. Không có kết quả: `EmptyState doiTuong={t('khoi.doi-tuong')} tuKhoa coBoLoc nutXoaTrenThanhLoc={false} onXoaBoLoc` → `xoaBoLoc()` rồi đưa con trỏ về ô tìm (C01 plan §4.10).
9. Kiosk: dòng "Nhớ đăng xuất khi dùng xong" phía trên danh sách thuộc F09 (F09 BR-4), đặt trong `DanhSachThuTuc`; "Bắt đầu lại" xoá `q`, `lv`, `trang`, `ma` khỏi địa chỉ (F09). F03 không làm hai việc này.

### 4.6 Câu chữ — `features/thu-tuc/i18n/vi.json` (namespace `thu-tuc`)

Mọi chuỗi giao diện đi qua `t()`. Nhóm khoá (câu cụ thể do frontend-dev điền, theo spec và prototype):

| Nhóm | Gồm |
|---|---|
| `khoi.*` | tiêu đề "Thủ tục thường gặp", `hien-thi` "Hiển thị {{so}}/{{tong}}", nhãn ô tìm "Tìm theo tên, mã thủ tục hoặc lĩnh vực", nhãn nhóm chip "Lọc theo lĩnh vực", `tat-ca`, `doi-tuong` "thủ tục" (cho `EmptyState`), tên vùng bảng |
| `the.*` | "Xem chi tiết", tên đọc "Xem chi tiết {{ten}}" |
| `bang.*` | tiêu đề cột: STT, Mã, Tên thủ tục, Lĩnh vực, Mức độ, Cơ quan thực hiện, Cổng DVC |
| `muc-do.*` | `toan-trinh` "Toàn trình", `mot-phan` "Một phần" |
| `cong-dvc` | "Xem và nộp trên Cổng DVC" |
| `chi-tiet.*` | tiêu đề các mục, nhãn `<dl>`, `thoi-han-chua-ro` "Chưa ghi rõ — xem trên Cổng DVC Quốc gia", `ban-chinh` "Bản chính: {{so}}", `ban-sao` "Bản sao: {{so}}", cột bảng cách thức, `khong-co` "—" |

Chuỗi dùng chung đã có ở `common`: `mien-tru`, `khong-tim-thay.thu-tuc`, `nut.dong`, `nut.thu-lai`, `trang-thai.dang-tai`, `cach-xem.*`, `phan-trang.*`, `rong.*`, `loi.*`. Biến nội suy đặt tên `so`, `tong`, `ten` (không dùng `count` — C01 §3.1).

### 4.7 Phần lấy từ `core/` — và việc ui-core-dev phải thêm vào `core/`

Mọi thành phần cần đã có trong `core/` (liệt kê ở §1). **ui-core-dev không phải thêm gì vào `core/`.** Không có component mới cho `core/`: `ThuTucCard`, `cotThuTuc`, `ChiTietThuTuc` mang nghiệp vụ thủ tục nên ở `features/thu-tuc/`.

### 4.8 Việc ở `app/` (ui-core-dev — hai task nhỏ T04 và T06, vì `app/` thuộc ui-core-dev)

1. (T04) `app/i18n.d.ts`: thêm `import type thuTuc from '../features/thu-tuc/i18n/vi.json'` và `'thu-tuc': typeof thuTuc` vào `resources`. Làm **trước** khi frontend-dev viết `useTranslation('thu-tuc')`, nếu không `tsc` báo lỗi khoá.
2. (T04) `app/routes.tsx`: hàm nạp của route trang chủ thêm `napNgonNguThuTuc()` vào `Promise.all` (cùng `import()` của trang và `napNgonNguTrangChu()`), để khối thường gặp có câu chữ ngay khi trang vẽ. Nếu task F02 đã thêm dòng này thì bỏ qua.
3. (T06) `app/layout/Layout.tsx`: gắn `<RanhGioiKhung><ThuTucPopup /></RanhGioiKhung>` trong khung (sau `<main>`, trước hoặc sau chân trang; Modal portal vào `<body>` nên vị trí DOM không ảnh hưởng). Cập nhật `Layout.test.tsx` nếu cần (mọi test dùng `fetch` giả chỉ trả `/api/trung-tam`; `ThuTucPopup` không gọi gì khi địa chỉ không có `ma`).

`app/` import `features/thu-tuc/ThuTucPopup` — hướng `app → features` được phép (chỉ `core → features` bị cấm).

### 4.9 Bàn giao cho chức năng khác

| Chức năng | Dùng gì (import cụ thể, không qua barrel) |
|---|---|
| F02 | `import { KhoiThuongGap } from '../thu-tuc/KhoiThuongGap'`, `<KhoiThuongGap />` không props (§4.5). Khối tự bọc `h2`, tự xử lý tải/lỗi/rỗng, tự nạp câu chữ |
| F04 | Import đúng 5 tên: `DanhSachThuTuc` (25 mục mỗi trang, `capTieuDeThe`), `useMoThuTuc` (**trả `{ ma, mo, dong }`**, F04 dùng `const { mo } = useMoThuTuc()`; F04 đề xuất bản trả hàm — lệch, F04 sửa), `MucThuTuc`, `ThuTucPopup` (**đã gắn ở `Layout`: F04 không render thêm**, nếu không popup mở hai lần; F04 §4.4 mục 4 bỏ), `linkDvc` (F04 đề xuất `taoLinkCongDvc` ở `core/utils/lienKet.ts` — bỏ, dùng `linkDvc`). Thẻ và cột bảng nằm trong `DanhSachThuTuc`, F04 không import riêng (`useCotThuTuc` của đề xuất F04 không có). Dùng `ThoiHanThuTuc.Chon` ở BE (§3.1) |
| F05 | Danh sách thủ tục theo lĩnh vực (nếu có): `DanhSachThuTuc`, `useMoThuTuc` |
| F06 (chatbot-dev) | `import { useMoThuTuc } from '…/thu-tuc/useMoThuTuc'` (nút xem chi tiết trong câu trả lời), `import { linkDvc } from '…/thu-tuc/linkDvc'` (liên kết "Xem và nộp trên Cổng DVC" qua `ExternalLink`). Hai module nhỏ, không kéo theo popup hay danh sách. Popup mở trên khung trợ lý (F06 AC-17): `Modal` đã đặt `--z-modal` 50 trên khung trợ lý 45 |
| F09 | Dòng "Nhớ đăng xuất khi dùng xong": một dòng phía trên `DanhSachThuTuc`, một dòng trong `chanPopup` của popup, cạnh nút "Xem và nộp trên Cổng DVC". Nút "Bắt đầu lại" xoá `ma` khỏi địa chỉ (đã có thể vì kiosk mở popup bằng `replace`) |
| F08 | Đã có: `useTieuDeTabTam`, `common:mien-tru`, `common:khong-tim-thay.thu-tuc`. F03 không sửa gì ở F08 |

## 5. Hiệu năng

- **Chi tiết chỉ tải khi mở popup.** Không có dữ liệu chi tiết trong danh mục. Chunk popup (`Modal` + nội dung chi tiết + CSS) nạp lười, chỉ tải khi có `ma` trên địa chỉ — `Modal` hiện không thuộc chunk nào chạy lúc khởi động (kiểm trên mã: chỉ trang xem trước `dev/design-system` import nó), nên ngân sách JS ban đầu không tăng vì popup.
- **Hiện popup ngay (AC-3).** Hai việc chạy song song, không chờ nhau: (a) khi `DanhSachThuTuc` vẽ xong, `window.setTimeout` ~2 giây rồi `napTruocPopupChiTiet()` nạp chunk popup (không dùng `requestIdleCallback`: Safari 16.4 chưa có); (b) khi người dùng nhấn xuống (`onPointerDown`) hoặc nhận con trỏ (`onFocus`) trên "Xem chi tiết" / tên thủ tục, gọi `useNapTruocChiTiet()(ma)` để chi tiết đã đang tải lúc popup mở. Không nạp theo `hover` (tránh 12 yêu cầu khi rê chuột qua danh sách).
- **Cache.** Máy chủ: output cache `danh-muc` theo (đường dẫn, phiên bản dữ liệu), ETag/304 (F00 T18). Trình duyệt: `Cache-Control: no-cache` + ETag; TanStack Query `staleTime` 60 giây (cấu hình mặc định của `Providers`). Mở lại cùng thủ tục trong 60 giây không gọi mạng.
- **p95 ≤ 300 ms (BE).** Một truy vấn khoá chính (+ một truy vấn tên lĩnh vực) trên bảng dưới 1.000 dòng, hoặc trả từ output cache. Nguồn Mẫu: đọc bộ nhớ. Brotli nén chi tiết 11 KB xuống khoảng 3 KB. Tester đo bằng 100 yêu cầu liên tiếp trên mã lớn nhất (1.013229).
- **Ngân sách JS ≤ 200 KB gzip ban đầu.** Hiện tại (đo 2026-10-13 trên `wwwroot`, đã obfuscate): `index` 22,8 KB + `vendor` 122,1 KB + `TrangChu` 1,2 KB + `rolldown-runtime` 0,4 KB + `trinh-duyet-cu` 0,4 KB + `vi` 0,1 KB ≈ **147 KB**; chưa có thành phần C01 nào trong bản build (chưa feature nào import). F03 thêm vào phần ban đầu: `ThuTucPopup` + `useMoThuTuc` + `maThuTuc` + `linkDvc` ≈ 1–1,5 KB (vào chunk chính qua `Layout`). Khối thường gặp (kèm `SearchBox`, `ChipGroup`, `ViewToggle`, `DataTable`, `Pager`, `Card`, `Badge`, `ExternalLink` của C01, ước 10–15 KB theo plan C01 §5) đi theo chunk trang chủ, ước thêm 8–12 KB phần của F03. Tổng cho F03 vào khoảng 20–28 KB → ≈ 170–175 KB, còn khoảng 25 KB cho F02, F04, F06 và F09. **Tight**; task T07 đo và báo kích thước từng chunk trước/sau. TanStack Table (`grid`) vẫn là chunk riêng, chỉ tải khi hiện dạng bảng (máy ≥ 1024 px).
- **Tìm kiếm** chạy ở client trên 16 mục (chuỗi tìm kiếm tính một lần), `useDeferredValue` của `useDanhSachUrl` — không có vấn đề 200 ms.
- **Dữ liệu danh mục cho trang chủ.** Khối thường gặp dùng `useDanhMucThuTuc()` của F04 (toàn bộ ~1.000 thủ tục cộng danh sách lĩnh vực, hai yêu cầu song song, tải một lần, dùng chung bộ nhớ với trang danh mục) rồi lọc 16 mục. Đây là thiết kế đã chọn ở `CLAUDE.md`; chi phí là trang chủ tải cả danh mục (ước 25–70 KB sau nén). Nếu Lighthouse mobile < 85 vì việc này, phương án thay: F04 thêm tham số `thuongGap` (`[DanhMucQuery("thuongGap")]`) trả 16 dòng — chỉ đổi hook, không đổi hợp đồng ở §3.2 (§10 mục 3).
- **Lighthouse ≥ 85:** khối giữ chỗ khi tải có đúng hình dạng thẻ (Skeleton) để không dịch bố cục; không tải font hay ảnh.

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Chỉ trường màn hình dùng (§3.1). Không mã DVC, mã đơn vị, trạng thái công bố, thứ tự, cột tìm kiếm |
| Mã trên địa chỉ là đầu vào không tin cậy | Kiểm `laMaHopLe` ở FE và cùng quy tắc ở BE trước khi dùng; mã đi vào đường dẫn API qua `encodeURIComponent`; BE không nối chuỗi SQL (EF tham số hoá). Mã sai định dạng không gọi API, không chạm DB |
| Chữ từ địa chỉ hiện ra trang | Không bao giờ: thông báo không tìm thấy không nhắc lại mã (F08 BR-10, AC-10). Không đặt mã vào tiêu đề tab khi chưa có dữ liệu |
| Chữ từ dữ liệu có HTML | Toàn bộ qua nút chữ của React; cấm `dangerouslySetInnerHTML` (ESLint). Xuống dòng bằng CSS `white-space: pre-line`, không chèn `<br>` từ chuỗi |
| Liên kết ngoài | Chỉ một loại: `linkDvc(ma)`, dựng từ mã đã mã hoá URL, qua `ExternalLink` (`rel="noopener noreferrer"`, `target="_blank"`). Căn cứ pháp lý không có link (không có `<a>` trong mục) |
| Không dẫn tới hệ thống nội bộ | `linkDvc` cố định tên miền `dichvucong.gov.vn`; không có tên miền nào ở danh sách "Đã bỏ" của `lien-ket.md` §1. Tester kiểm (F03 BR-4) |
| Liệt kê mã / dội yêu cầu | Rate limit `danh-muc` 300/phút/IP. Dữ liệu công khai nên liệt kê không lộ gì thêm. 404 không vào cache; mã sai định dạng không chạm DB |
| Thổi cache bằng query ngẫu nhiên | Không có `[DanhMucQuery]` → query bị bỏ khỏi khoá cache |
| Lỗi | ProblemDetails có `code` + `maTraCuu`; log 4xx không kèm query string (F00 BR-7). FE chỉ hiện câu theo `code` |
| Trạng thái trình duyệt lưu | Chỉ `cach-xem` (đã có, C01). Không lưu mã hay từ khoá |

## 7. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Api/ChiTietThuTucServiceContract.cs` + `…TrenMau.cs` + `DuLieuThu/ThuTucThu.cs` | backend-dev | Test hợp đồng (F00 §9.4 R7, §9.10) chạy trên nguồn Mẫu dựng từ `TepDuLieuMau` bằng C#: đủ trường; `mucDo` đúng chuỗi; giấy tờ 1/0, 0/1, null/null; `thoiHan` rõ / "Khác" / "1 Khác" / "  3  KHÁC " / rỗng / lấy từ cách thức rõ đầu tiên / không có → `null`; `cachThuc[].thoiHan` "1 Khác" → `null`; mã không có → `null`; mã sai định dạng (rỗng, 21 ký tự, `abc<b>x</b>`, có dấu cách, `../`) → `null` và **không** truy vấn nguồn (nguồn giả đếm lần gọi); thủ tục không có căn cứ / yêu cầu / kết quả → danh sách rỗng hay `null`; không sửa đối tượng của nguồn (gọi hai lần cho cùng kết quả). Hàm thuần `ThoiHanThuTuc` có bộ test riêng |
| `Tests/Api/ChiTietThuTucTests.cs` | backend-dev | HTTP với service giả và `IPhienBanDuLieu` giả: 200 JSON camelCase đủ trường kể cả null; mã lạ → 404 có `code` = `khong-tim-thay` và `maTraCuu`, thân không có mã; mã sai định dạng → 404; POST → 405; HEAD → 200 không thân; 200 có `ETag` + `Cache-Control: no-cache`, `If-None-Match` → 304; **hai mã khác nhau cho hai kết quả khác nhau** (cache theo đường dẫn) và `?x=1`, `?x=2` cho cùng một mục cache (đếm số lần service chạy); 404 không bị cache; vượt giới hạn → 429; với file nhúng thật (nguồn Mẫu): `/api/thu-tuc/1.001193` trả tên "Thủ tục đăng ký khai sinh", `thoiHan` `null` |
| `Tests/Integration/ChiTietThuTuc/` | tester | Lớp con PostgreSQL của test hợp đồng (F00 T31: DB riêng, migration, chèn cùng bộ dữ liệu) — kiểm cả việc EF đọc cột jsonb đúng thứ tự; tương đương nguồn Mẫu và PostgreSQL với mọi 408 mã (cùng JSON); đo p95 ≤ 300 ms |
| `src/FrontEnd/src/features/thu-tuc/**/*.test.ts(x)` | frontend-dev | `laMaHopLe`; `linkDvc` đúng từng ký tự với Vàm Cỏ và mã có ký tự đặc biệt được mã hoá; `useMoThuTuc` (push/replace ở kiosk, `navigate(-1)` khi mở bằng `mo`, giữ tham số khác); popup (đủ mục, ẩn mục trống, "Chưa ghi rõ", số bản AC-23, căn cứ không có link và Tab không dừng, miễn trừ có kể cả khi không có căn cứ, một liên kết Cổng DVC, 404 không nhắc lại mã, lỗi khác có "Thử lại", tiêu đề tab tạm); thẻ và dòng bảng mỗi nơi một liên kết ra Cổng DVC; khối thường gặp (xem bảng truy vết) |
| `src/FrontEnd/e2e/thu-tuc-thuong-gap.spec.ts` | tester | AC-1…AC-23 phần chạy tự động được, khổ 375, 768, 1280, kiosk 1080×1920; axe-core ở popup (thường và kiosk); chặn `GET /api/thu-tuc` để dựng bộ 43 thủ tục (AC-1…AC-19, AC-22) hoặc 16 thủ tục (AC-20) như F08 đã làm với `/api/trung-tam` |

## 8. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 tìm theo tên, mã, tên lĩnh vực, không dấu, nhiều từ | §3.2 (`tim` của F04), §4.5 (4) — `taoBoLocTuKhoa` của C01 | T07 |
| BR-2 chip lĩnh vực có thủ tục thường gặp, "Tất cả" mặc định | §4.5 (3) | T07 |
| BR-3 nội dung popup, số bản, căn cứ chỉ chữ, ẩn mục trống, miễn trừ | §3.1, §4.3 | T01, T02, T05 |
| BR-4 liên kết "Xem và nộp trên Cổng DVC": một link, mọi chỗ | §4.1 `linkDvc`, §4.3, §4.4 | T03, T05, T07 |
| BR-5 popup dùng chung | §4.2 `ThuTucPopup`, §4.8, §4.9 | T05, T06 |
| BR-6 dạng thẻ/bảng theo khổ màn hình, nhớ lựa chọn | §4.4 (`useCachXem`, `ViewToggle`, `DataTable` của C01) | T07 |
| BR-7 phân trang 12, 1–4 cột, "Hiển thị x/y" | §4.4, §4.5 (5, 7) | T07 |
| BR-8 link thủ tục `?ma=`, đóng, Quay lại, mã không có, tiêu đề tab | §4.2 | T03, T05, T06 |
| BR-9 trạng thái danh sách trên địa chỉ | §4.5 (2) — `useDanhSachUrl`; kiosk: §4.2 | T05, T07 |
| BR-10 thứ tự theo dữ liệu | §3.2, §4.5 (1) | T07 |
| AC-1, AC-2, AC-7 tìm kiếm, chip + tìm | §4.5 | T07 → T10 |
| AC-3 popup hiện ngay, nội dung ≤ 1 giây | §3.1, §5 | T01, T02, T05 → T10 |
| AC-4 đóng được, con trỏ trong popup | `Modal` C01; §4.2 | T05 → T10 |
| AC-5 dạng bảng nhớ sau khi tải lại | `useCachXem` C01 | T07 → T10 |
| AC-6 căn cứ pháp lý chỉ chữ; không có căn cứ vẫn có miễn trừ | §4.3 | T05 → T10 |
| AC-8 mặc định "Tất cả", "Hiển thị 43/43", không chip rỗng | §4.5 | T07 → T10 |
| AC-9, AC-10 link Cổng DVC đúng dạng, một link mỗi chỗ | §4.1, §4.3, §4.4 | T03, T05, T07 → T10 |
| AC-11 danh mục, trợ lý mở cùng popup | §4.8, §4.9 | T05, T06; F04, F06 → T10 |
| AC-12 dạng hiển thị theo khổ | §4.4 | T07 → T10 |
| AC-13 4 trang 12·12·12·7, đổi chip về trang 1 | §4.5 (2, 7) | T07 → T10 |
| AC-14 hàng thẻ đầy | §4.4 (`soCotToiDa` = 4) | T07 → T10 |
| AC-15 link `?ma=` mở thẳng popup | §4.2 | T05, T06 → T10 |
| AC-16 đóng bằng ✕, Esc, bấm ngoài → bỏ `ma` | §4.2 | T05 → T10 |
| AC-17 Quay lại đóng popup, giữ trang 2 + từ khoá | §4.2 | T05 → T10 |
| AC-18 mã không có / sai định dạng | §3.1 (404), §4.2 (`PopupChiTiet`) | T01, T02, T05 → T10 |
| AC-19 địa chỉ phản ánh chip, từ khoá, trang | §4.5 (2) | T07 → T10 |
| AC-20 16 mã bản đầu; bỏ 1 dòng → 15/15, không sửa mã | §4.5; dữ liệu: F01 | T07; T10 (nhập lại bằng F01 ở PostgreSQL) |
| AC-21 tiêu đề tab = tên thủ tục | §4.2 | T05 → T10 |
| AC-22 thứ tự theo dữ liệu, giữ khi chọn chip | §4.5 (1, 4) | T07 → T10 |
| AC-23 yêu cầu điều kiện; số bản chính, bản sao | §3.1, §4.3 | T01, T05 → T10 |
| F00 BR-9 hiệu năng | §5 | T02, T07, T10 |
| Hai nguồn dữ liệu cho cùng kết quả (F00 §9) | §3.1 (R1–R5), §7 | T01, T02; T10 |

## 9. Rủi ro

1. **Phụ thuộc F04** (§3.2, đã chốt hợp đồng): T07 cần `useDanhMucThuTuc()` thật; F04 T01 chờ `ThoiHanThuTuc` của F03 T01. Giảm thiểu: T01 làm `ThoiHanThuTuc` trước và bàn giao ngay; F03 chỉ khai `MucThuTuc` theo cấu trúc; T05 (popup) và BE không phụ thuộc F04.
2. **Ngân sách JS tight** (~170–175 KB sau F03, còn ~25 KB cho F02, F04, F06, F09). Giảm thiểu: popup nạp lười; `useMoThuTuc`, `linkDvc`, `maThuTuc` tách file nhỏ; T07 đo từng chunk, báo ngay nếu chunk trang chủ > 30 KB gzip.
3. **EF chưa chắc chiếu được cột jsonb trong `Select`.** Phương án dự phòng ở §3.1 (đọc entity rồi ánh xạ ngay). Lộ ra khi chạy với PostgreSQL thật: test hợp đồng lớp con PostgreSQL (T10) là chốt kiểm.
4. **Hai nguồn dữ liệu lệch:** nguồn Mẫu trả đối tượng dùng chung. Giảm thiểu: R2 — ánh xạ sang record mới, test "gọi hai lần" và review.
5. **Mã thủ tục có ký tự ngoài `[A-Za-z0-9._-]`** sẽ không mở được popup. F01 chưa giới hạn ký tự của mã (chỉ độ dài 20); 408 mã hiện có chỉ gồm số và dấu chấm. Giảm thiểu: ghi ở §10 mục 4 để F01 kiểm lúc nhập.
6. **Mất lịch sử trình duyệt kỳ lạ:** `state.popupThuTuc` nằm trong mục lịch sử; sao chép địa chỉ sang tab khác không mang `state` → `dong()` dùng nhánh `replace`, đúng. Người dùng tự gõ lại địa chỉ có `ma` cùng tab cũng là mục mới không có `state`. Đã xử lý bằng hai nhánh của `dong()`; test hai nhánh.
7. **`navigate(-1)` khi `state` còn mà mục trước đã bị thay** (hiếm: người dùng đổi bộ lọc bằng `replace` khi popup đang mở). Popup mở thì phần dưới bị `inert`, không đổi bộ lọc được; chấp nhận.
8. **Nút "Xem chi tiết" trên Safari/Firefox macOS không nhận focus khi bấm chuột** → `Modal` không có nút để trả con trỏ. Giảm thiểu: chấp nhận (người dùng bàn phím vẫn đúng); ghi cho tester.
9. **Mọi thủ tục ở danh mục đều chạm `ThoiHanThuTuc`** (nếu F04 dùng): lỗi regex ảnh hưởng cả hai nơi. Giảm thiểu: bộ test của hàm thuần; dùng `[GeneratedRegex]` với thời gian chờ.

## 10. Cần hỏi / phối hợp

Không có câu cần người dùng chọn trước khi bắt đầu. Đã đối chiếu plan F02 và F04 (2026-10-13); còn cần F06, F09. Các điểm dưới đây là chỗ phối hợp hoặc lựa chọn nhỏ do planner đề xuất — làm theo đề xuất nếu không ai phản đối.

| # | Nội dung | Đề xuất | Ảnh hưởng |
|---|---|---|---|
| 1 | **Hợp đồng danh mục rút gọn:** đã chốt theo F04 §3.1 (xem §3.2). Còn lệch tên ở F04 plan cần F04 sửa: `ThuTucPopup` không render ở trang F04 (đã gắn ở `Layout`); `useMoThuTuc` trả `{ ma, mo, dong }`; link Cổng DVC là `linkDvc` ở `features/thu-tuc/linkDvc.ts` (không phải `taoLinkCongDvc`); không có `useCotThuTuc` (cột nằm trong `DanhSachThuTuc`) | F04 sửa §4.4 mục 4 và §4.5 | T07; F04 |
| 2 | **Thời hạn rõ ràng dùng chung BE — đã chốt:** F03 T01 tạo `ThoiHanThuTuc` (`LamRo`, `Chon`); F04 `ThuTucRutGonDto.ThoiHan` đi qua `Chon` (F04 sửa chú thích "nguyên văn dữ liệu"). Thứ tự: F03 T01 trước F04 T01. F04 phải đọc `thoiHan` của các cách thức (jsonb) cho ~1.000 thủ tục để tính | Như bên trái | T01; F04 T01 |
| 3 | **Trang chủ tải cả danh mục** (`/api/thu-tuc` + `/api/linh-vuc`) chỉ để lấy 16 mục. Giữ (theo `CLAUDE.md`). Phương án thay khi đo xấu: F04 thêm `?thuongGap=1` (`[DanhMucQuery]`) | Giữ; đo ở T07/T10 | T07, T10 |
| 4 | **Định dạng mã thủ tục:** FE và BE cùng chấp nhận `^[A-Za-z0-9._-]{1,20}$`. F01 chưa chặn ký tự lạ ở mã | db-dev (F01) có thể thêm kiểm này lúc nhập — không chặn F03 | Rủi ro 5 |
| 5 | **Brief nhắc "mã đơn vị"** trong chi tiết: plan **không** trả `donViMa`, `maDvc`, `donViTen`, vì spec BR-3 không hiển thị và link Cổng DVC dựng từ mã thủ tục (`lien-ket.md` §2; F08 cũng không trả `MaDonViCongDvc`). Cần thì thêm một trường, không đổi gì khác | Không trả | §3.1 |
| 6 | **Lệch nhỏ giữa spec, design-system, prototype** — plan theo spec: (a) thứ tự mục popup theo BR-3 (yêu cầu → cách thức nộp → thành phần hồ sơ → trình tự → kết quả → căn cứ), prototype xếp cách thức sau trình tự; (b) không có dòng "Danh mục (cấp xã/tỉnh)" trong thông tin chung, vì BR-3 không liệt kê; (c) thẻ chỉ có mức độ + thời hạn, không có phí (design-system §5 ghi "thời hạn, phí", prototype không có phí; danh mục rút gọn của F04 chưa nêu `phi`); (d) lời miễn trừ ở cuối thân popup như prototype | Như bên trái; đổi thứ tự hay thêm dòng là sửa CSS/JSX nhỏ | T05, T07 |
| 7 | **`lv` trên địa chỉ không khớp chip nào** (lĩnh vực không có thủ tục thường gặp, hoặc mã lạ): coi như "Tất cả", không lọc, không báo lỗi. Spec chưa nói | Như bên trái | T07 (có ca thử) |
| 8 | **Chưa nhập thủ tục thường gặp nào** (y = 0): không vẽ cả khối, trang chủ không có khối trống. Spec chưa nói | Như bên trái | T07 (có ca thử) |
| 9 | **Kiosk mở popup bằng `replace`** (không thêm mục lịch sử), như prototype; nút "Bắt đầu lại" của F09 không phải xoá thêm gì | F09 xác nhận khi lập plan | T05 |
| 11 | **F09 chưa có plan:** F09 phải có task (a) thêm dòng "Nhớ đăng xuất khi dùng xong" phía trên danh sách trong `DanhSachThuTuc` và trong `chanPopup` của `ChiTietThuTuc` (cạnh nút Cổng DVC); (b) "Bắt đầu lại" xoá `q`, `lv`, `trang`, `ma` khỏi địa chỉ. F03 chừa chỗ, không làm | Ghi vào plan F09 | F09 |
| 10 | **ui-core-dev có 2 task nhỏ** (T04, T06) dù brief liệt kê bốn agent: `app/i18n.d.ts`, `app/routes.tsx`, `app/layout/Layout.tsx` thuộc `app/` (CLAUDE.md). Không có task vào `core/` | Giữ | T04, T06 |
