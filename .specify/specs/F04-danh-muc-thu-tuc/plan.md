---
id: F04
ten: Danh mục thủ tục cấp xã / cấp tỉnh — kế hoạch kỹ thuật
spec: spec.md (da-duyet)
nguon: spec.md; CLAUDE.md; F00 plan §1 (cache theo lần nhập), §9 (nguồn dữ liệu, R1–R7); C01 plan §3–§4 (component, hook đã làm); F08 plan §4.1, §4.12; F03 spec (BR-1, BR-4, BR-6, BR-8); prototype/index.html (veDanhMuc, ketQuaDanhMuc — đã duyệt)
cap_nhat: 2026-10-13
---

# F04 · Danh mục thủ tục cấp xã / cấp tỉnh — kế hoạch kỹ thuật

Đã đối chiếu plan F03 và F02 (2026-10-13). F04 dùng lại phần của F03 ở `features/thu-tuc/` với đúng tên F03 đã chốt (§4.5) và dùng hàm `ThoiHanThuTuc.Chon` của F03 (§3.2). Plan này **sở hữu** hợp đồng `GET /api/thu-tuc` và `GET /api/linh-vuc` (§3.1): F02, F03, F05, F06 tham chiếu mục đó, không định nghĩa lại.

## 1. Tóm tắt

Trang `/thu-tuc`: hai tab Cấp xã / Cấp tỉnh, ô tìm bỏ dấu, lọc lĩnh vực và mức độ, thống kê 3 ô, nút "Xoá bộ lọc" trên thanh lọc, danh sách thẻ hoặc bảng 25 dòng mỗi trang. Mọi trạng thái (tab, lĩnh vực, mức độ, từ khoá, số trang) nằm trên địa chỉ. Danh mục tải một lần ở dạng rút gọn rồi lọc phía trình duyệt.

| Phần | Chạm gì |
|---|---|
| DB | **Không đổi.** Không entity, cột, chỉ mục, migration. Đọc `thu_tuc`, `linh_vuc` qua `INguonDuLieu` (hai nguồn Mẫu và PostgreSql) |
| BE | `Features/DanhMuc/`: `GET /api/thu-tuc` (danh mục rút gọn), `GET /api/linh-vuc` (lĩnh vực kèm số thủ tục xã/tỉnh). Cache `danh-muc` theo lần nhập, ETag/304, giới hạn tần suất `danh-muc` (đã có ở F00) |
| FE `core/` (ui-core-dev) | Kiểu + hook dữ liệu `core/api/danhMucThuTuc.ts`, `core/api/linhVuc.ts` (dùng chung F03, F05); `dinhDangSo`; **2 component mới**: `Select`, `Tabs` (C01 plan §11 đã dự kiến `Select`) |
| FE `features/danh-muc/` (frontend-dev) | Màn hình, thanh lọc, thống kê, hàm lọc, câu chữ `i18n/vi.json` |
| FE `app/` (ui-core-dev) | Đổi route `/thu-tuc` từ `TrangTam` sang màn hình F04; đăng ký namespace `danh-muc` |
| Trợ lý | Không đụng |

Không thêm thư viện npm hay gói NuGet.

## 2. Dữ liệu

Không có thay đổi. Dùng các cột đã có:

| Bảng.cột | Dùng cho |
|---|---|
| `thu_tuc`: `ma`, `ten`, `ten_tim_kiem`, `linh_vuc_ma`, `muc_do`, `thuoc_danh_muc_xa`, `thuoc_danh_muc_tinh`, `thu_tu`, `thu_tu_thuong_gap`, `thoi_han`, `co_quan_thuc_hien`, và `cach_thuc` (jsonb — chỉ để chọn `thoiHan`, không trả) | Danh mục rút gọn |
| `linh_vuc`: `ma`, `ten`, `ten_tim_kiem` | Lĩnh vực |

- Không trả: `phi`, `yeu_cau_dieu_kien`, `trinh_tu`, `thanh_phan_ho_so`, `ket_qua`, `can_cu`, `ma_dvc`, `don_vi_*`, `trang_thai_cong_bo`, `hinh_thuc_nop` (chi tiết chỉ tải khi mở popup — F03).
- Chỉ mục: không cần thêm. Cả hai truy vấn đọc toàn bảng (≈ 1.000 và ≈ 75 dòng), sắp theo `thu_tu`; `thu_tu` do công cụ nhập gán theo số dòng sheet (F01) nên không trùng.
- Migration: **không có**. db-dev không có task.
- Kích thước đo trên file mẫu nhúng (408 thủ tục): JSON §3.1 ≈ 189 KB thô, ≈ 32 KB gzip, ≈ 26 KB Brotli. Ngoại suy 1.000 thủ tục thật (chưa lặp chữ): ≈ 460 KB thô, ≈ 60–80 KB nén. `GET /api/linh-vuc`: 75 dòng ≈ 9 KB thô.

## 3. API — hợp đồng giữa BE và FE

### 3.1 Hợp đồng dùng chung (F02, F03, F05, F06 tham chiếu)

Chữ ký, tên trường, ý nghĩa dưới đây do F04 giữ. Cần thêm trường → sửa mục này (và DTO), không tạo API song song.

**`GET /api/thu-tuc`** — danh mục rút gọn, tải một lần, chỉ các thủ tục thuộc ít nhất một cấp.

```csharp
// src/BackEnd/DichVuCong.Api/Features/DanhMuc/DanhMucDtos.cs
public sealed record ThuTucRutGonDto(
    string Ma,
    string Ten,
    string TenTimKiem,        // đã chuẩn hoá (bỏ dấu, chữ thường) — lấy từ cột ten_tim_kiem
    string LinhVucMa,         // khoá của LinhVucDto.Ma
    string MucDo,             // "toan-trinh" | "mot-phan"
    bool CapXa,
    bool CapTinh,
    int? ThuTuThuongGap,      // null = không thuộc nhóm thường gặp; F03 lọc ra và sắp theo cột này
    string? ThoiHan,          // thời hạn rõ ràng: ThoiHanThuTuc.Chon của F03 (§3.2); null = chưa ghi rõ — FE hiện câu "Chưa ghi rõ…" (F03)
    string? CoQuanThucHien);
```

```ts
// src/FrontEnd/src/core/api/danhMucThuTuc.ts
export type MucDo = 'toan-trinh' | 'mot-phan';
export interface ThuTucRutGon {
  ma: string;
  ten: string;
  tenTimKiem: string;
  linhVucMa: string;
  mucDo: MucDo;
  capXa: boolean;
  capTinh: boolean;
  thuTuThuongGap: number | null;
  thoiHan: string | null;       // đã qua ThoiHanThuTuc.Chon; null = chưa ghi rõ
  coQuanThucHien: string | null;
}
```

- Thứ tự mảng: theo `thu_tu` (thứ tự dòng trong file nhập). F03, F04 giữ nguyên thứ tự này (C01 plan §1); F03 sắp lại theo `thuTuThuongGap` cho khối thường gặp.
- Mức độ là chuỗi kebab (trùng giá trị `md` trên địa chỉ), không phải số enum.
- Dữ liệu rỗng → `200` với `[]` (không phải 404).
- Không nhận tham số. Query lạ bị bỏ qua và không vào khoá cache (không gắn `[DanhMucQuery]`).
- **Trả đủ cả hai cấp, không lọc theo cấp ở BE** (xác nhận với F03: 4/16 mã thường gặp bản đầu chỉ thuộc cấp tỉnh, khối thường gặp không phân cấp). Cấp nằm ở `capXa`, `capTinh`.
- **Phương án dự phòng, chưa làm:** nếu Lighthouse trang chủ < 85 vì phải tải cả danh mục (F03 §10 mục 3), thêm tham số `thuongGap=1` trả 16 dòng: gắn `[DanhMucQuery("thuongGap")]`, lọc `ThuTuThuongGap != null` ở dịch vụ, F03 đổi hook. Khi đó mới có task riêng; hợp đồng §3.1 giữ nguyên.

**`GET /api/linh-vuc`** — lĩnh vực có ít nhất một thủ tục, kèm số thủ tục mỗi cấp.

```csharp
public sealed record LinhVucDto(
    string Ma,                // mã sinh từ tên, vd. "ho-tich" — dùng trên địa chỉ và QR (F05)
    string Ten,
    string TenTimKiem,
    int SoThuTucXa,
    int SoThuTucTinh);
```

```ts
// src/FrontEnd/src/core/api/linhVuc.ts
export interface LinhVuc {
  ma: string;
  ten: string;
  tenTimKiem: string;
  soThuTucXa: number;
  soThuTucTinh: number;
}
```

- Chỉ trả lĩnh vực có `SoThuTucXa + SoThuTucTinh > 0`. Số lĩnh vực của thống kê (BR-4) = độ dài mảng.
- Thứ tự: theo `TenTimKiem` (so sánh `StringComparer.Ordinal`), rồi `Ma`, sắp trong C# (R3). F05 dùng cùng thứ tự. Không trả quầy: F05 lấy riêng (F05 BR-4).
- Rỗng → `200` với `[]`.

**Mã trả lời (cả hai endpoint)**

| HTTP | Khi nào | `code` (F00 §2b) |
|---|---|---|
| 200 | Có dữ liệu hoặc `[]`. Kèm `ETag` = phiên bản dữ liệu + mã bản build, `Cache-Control: no-cache` | — |
| 304 | `If-None-Match` khớp phiên bản hiện tại (middleware F00 T18, trước khi endpoint chạy) | — |
| 405 | Phương thức khác GET/HEAD | `phuong-thuc-khong-hop-le` |
| 429 | Vượt giới hạn `danh-muc` (300/phút/IP) | `qua-nhieu-yeu-cau` |
| 500 | Lỗi nguồn dữ liệu; có `maTraCuu` | `loi-he-thong` |

**Kiểu đã làm giàu cho FE** (cũng nằm ở hợp đồng dùng chung, vì F03 cần cùng chuỗi tìm để đúng F03 BR-1 và F04 BR-1):

```ts
export interface ThuTucDanhMuc extends ThuTucRutGon {
  linhVuc: string;      // TÊN lĩnh vực, tra từ linhVuc; mất khoá thì '' (tên này để gán được cho MucThuTuc của F03)
  tim: string;          // `${tenTimKiem} ${chuanHoaTimKiem(ma)} ${linhVuc.tenTimKiem}` — chuỗi để so khớp
}
export interface DanhMucThuTuc {
  thuTuc: readonly ThuTucDanhMuc[];
  linhVuc: readonly LinhVuc[];
  linhVucTheoMa: ReadonlyMap<string, LinhVuc>;
}
export const API_THU_TUC = '/api/thu-tuc';
export const API_LINH_VUC = '/api/linh-vuc';
export const KHOA_DANH_MUC_THU_TUC = ['danh-muc-thu-tuc'] as const;
export const KHOA_LINH_VUC = ['linh-vuc'] as const;
export function useDanhMucThuTuc(): UseQueryResult<DanhMucThuTuc>; // gọi cả hai API song song, một kết quả cho QueryState
export function useLinhVuc(): UseQueryResult<LinhVuc[]>;           // F05
```

`ThuTucDanhMuc` gán được cho `MucThuTuc` của F03 (`features/thu-tuc/types.ts`: `ma`, `ten`, `linhVucMa`, `linhVuc`, `mucDo`, `coQuanThucHien`, `thoiHan`, `thuTuThuongGap`) nhờ so khớp cấu trúc. **Lệch nhỏ với F03 §3.2:** F03 giả định `useDanhMucThuTuc()` trả mảng; hook thật trả `DanhMucThuTuc`, nên `KhoiThuongGap` dùng `data.thuTuc` (đã có tên lĩnh vực và `tim`), không cần tự ghép chuỗi tìm hay gọi thêm `GET /api/linh-vuc`; chip lĩnh vực lấy từ `linhVucMa` + `linhVuc`.

`tim` tính một lần trong `queryFn` (không tính lại mỗi lần gõ). Từ khoá lọc dùng `taoBoLocTuKhoa` có sẵn (`core/utils/timKiem.ts`): mỗi từ nằm ở tên, mã hoặc lĩnh vực đều khớp (F03 BR-1).

### 3.2 Backend — `src/BackEnd/DichVuCong.Api/Features/DanhMuc/` (backend-dev)

Tên thư mục `DanhMuc` (namespace `Features.DanhMuc`) không trùng tên entity nào, tránh che entity `LinhVuc`, `ThuTuc` như đã gặp với `TrungTam` (F08 §3.1).

| File | Nội dung |
|---|---|
| `ThuTucDanhMucController.cs` | `[ApiController] [Route("api/thu-tuc")]`, một action `[HttpGet] [HttpHead]` gắn `[OutputCache(PolicyName = CachePolicies.DanhMuc)]` và `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, giống `ThongTinTrungTamController`. F03 thêm `GET api/thu-tuc/{ma}` ở controller riêng — hai route không đụng nhau |
| `LinhVucController.cs` | Như trên, `[Route("api/linh-vuc")]` |
| `DanhMucService.cs` | `IDanhMucService` + `DanhMucService(INguonDuLieu)`: `LayThuTucAsync(ct)`, `LayLinhVucAsync(ct)` |
| `DanhMucDtos.cs` | Hai record ở §3.1 |
| `DanhMucServiceCollectionExtensions.cs` | `AddDanhMuc()` (scoped); `AddApiServices` gọi hàm này; `Program.cs` không đổi |

Quy tắc viết truy vấn (F00 §9.4):

- R1: nhận `INguonDuLieu`; lấy kết quả bằng `DanhSachAsync`; không dùng hàm async của EF.
- R2: `Select` ra kiểu ẩn danh trước khi lấy, không đọc navigation, không trả entity.
- `LayThuTucAsync`: `ThuTucs.Where(t => t.ThuocDanhMucXa || t.ThuocDanhMucTinh).OrderBy(t => t.ThuTu).Select(...)` → `DanhSachAsync` → dựng DTO. Đổi `MucDo` sang chuỗi bằng hàm thuần trong C# **sau** khi lấy (không đặt biểu thức điều kiện trong truy vấn). Giá trị enum lạ → ném `InvalidOperationException` (lỗi dữ liệu, ra 500).
- `ThoiHan` (**thứ tự task: F04 T01 sau F03 T01**): F03 T01 tạo `ThoiHanThuTuc` (`Features/ChiTietThuTuc/ThoiHanThuTuc.cs`, public, hàm thuần; "Khác", "1 Khác" → làm rõ hoặc null). F04 chỉ `using` và gọi `ThoiHanThuTuc.Chon(thoiHan, các thời hạn của cách thức)` theo đúng chữ ký F03 T01, không viết lại, không khai hàm thứ hai. Phép chọn chạy trong C# sau khi lấy dữ liệu (R4). Truy vấn chiếu thêm `CachThuc` (chỉ phần cần để chọn, không chiếu `TrinhTu`, `ThanhPhanHoSo`…); nếu EF không chiếu được cột jsonb trong `Select` (F03 rủi ro 3), theo cách F03 T01 đã chọn. Chi phí: đọc `cach_thuc` của ≈ 1.000 thủ tục khi lỡ cache; output cache và ETag giữ kết quả theo phiên bản dữ liệu, tester đo lần gọi đầu và p95 (T15).
- `LayLinhVucAsync`: hai truy vấn nhỏ — (1) `LinhVucs.Select(Ma, Ten, TenTimKiem)`; (2) `ThuTucs.Select(LinhVucMa, ThuocDanhMucXa, ThuocDanhMucTinh)`. Đếm theo lĩnh vực **trong bộ nhớ** (không `GroupBy` trong truy vấn, để hai nguồn cho cùng kết quả mà không phụ thuộc cách EF dịch), bỏ lĩnh vực không có thủ tục, sắp theo `TenTimKiem` Ordinal rồi `Ma` Ordinal.
- R3: không sắp theo chuỗi trong truy vấn; không phân trang phía máy chủ.
- R4/R5: không dùng so sánh chuỗi theo văn hoá. Mọi việc tìm kiếm làm ở FE; BE chỉ trả `TenTimKiem`.

Pipeline giữ nguyên (F00 §1): giới hạn tần suất → 304 theo `If-None-Match` → output cache theo phiên bản dữ liệu → controller. Nhập dữ liệu mới thì `lan_nhap` đổi, phiên bản đổi, lần tải kế tiếp thấy ngay dữ liệu mới (F04 AC-7, F00 AC-11).

## 4. Frontend

### 4.1 Route và cấu trúc

- Route `DUONG_DAN.danhMuc` (`/thu-tuc`), `handle.trang = 'danh-muc'` (đã có). `app/routes.tsx` đổi `Component` từ `TrangTam` sang `DanhMuc` nạp bằng `React.lazy` + `napNgonNguDanhMuc()` song song, theo đúng mẫu `TrangChu` hiện có (nạp lười, `Suspense` nằm trong `<main>` của `Layout`).
- Tiêu đề tab và dữ liệu đặc tả: do `DacTaTrang` của F08 lo (`common:trang.danh-muc.*`); F04 không làm.
- Thư mục `src/FrontEnd/src/features/danh-muc/`:

| File | Nội dung |
|---|---|
| `DanhMuc.tsx` | Export `DanhMuc`. `<h1>` ẩn (`VisuallyHidden`, chữ `common:trang.danh-muc.ten`) + `QueryState` quanh `DanhMucNoiDung`. Khung chờ: `Skeleton dang="the"` |
| `DanhMucNoiDung.tsx` | Mọi hook trạng thái địa chỉ và lọc; ghép các khối bên dưới |
| `ThongKe.tsx` | 3 ô số liệu |
| `ThanhLoc.tsx` | Ô tìm, 2 `Select`, nút "Xoá bộ lọc", `ViewToggle` |
| `loc.ts` | Hàm thuần: `docCap`, `docMucDo`, `locThuTuc`, `luaChonLinhVuc` |
| `*.module.css` | Bố cục (chỉ `var(--…)` từ `tokens.css`) |
| `i18n/vi.json`, `i18n/index.ts` | Namespace `danh-muc`, `napNgonNguDanhMuc` giống `features/trang-chu/i18n/index.ts` |

### 4.2 Trạng thái trên địa chỉ

Khoá trên địa chỉ (theo `lien-ket.md` §3): `cap` (`xa` | `tinh`), `lv` (mã lĩnh vực), `md` (`toan-trinh` | `mot-phan`), `q`, `trang`; `ma` do F03.

- Dùng `useDanhSachUrl({ boLoc: ['lv', 'md'] })` của C01. `cap` **không** liệt kê trong `boLoc` nên "Xoá bộ lọc" giữ tab và `coDieuKien` không tính tab (đúng BR-8, EmptyState). Không truyền `khac` (hook hiện chưa dùng tuỳ chọn này).
- Hook đã có: từ khoá ghi lên địa chỉ chậm 300 ms, mọi lần ghi thay mục lịch sử (`replace`), đổi từ khoá hoặc bộ lọc thì bỏ `trang` (BR-5), `xoaBoLoc()` xoá `q`, `trang`, `lv`, `md`.
- Giá trị đọc từ địa chỉ được chuẩn hoá, không bao giờ báo lỗi (an toàn, không hiện lại chữ từ địa chỉ):
  - `cap`: chỉ `tinh` là cấp tỉnh; mọi giá trị khác (thiếu, sai) là `xa`.
  - `md`: chỉ `toan-trinh`, `mot-phan`; giá trị khác coi như "tất cả".
  - `trang`: `chuanHoaSoTrang` của `DataTable`.
  - `lv`: mã không có trong `linhVucTheoMa` → thông báo "Không tìm thấy lĩnh vực" (§4.4).
- **Địa chỉ luôn có `cap`** (AC-10 "có tab"): lần vẽ đầu, nếu địa chỉ thiếu `cap` hoặc `cap` không hợp lệ thì `useSearchParams` ghi `cap=xa` bằng `replace`, giữ nguyên các khoá khác kể cả `trang` và `ma` (không dùng `dat()` vì nó bỏ `trang`). Link QR `?cap=xa&lv=…` không đổi. Hỏi lại ở §10 câu 4.
- Đổi tab: `dat({ cap: moi, lv: null })` — về trang 1 (BR-5), bỏ lĩnh vực (lĩnh vực có thể không có thủ tục ở tab kia), **giữ từ khoá và mức độ**. Đã chốt theo prototype (`data-act="cap"`); nhờ ba-analyst ghi vào BR-5 (§10 câu 3).
- Kiosk: không có trạng thái nào ngoài địa chỉ (trừ chữ đang gõ) nên "Bắt đầu lại" của F09 chỉ cần thay địa chỉ (F09 BR-7). `cach-xem` là lựa chọn được giữ (F09 BR-7 giữ dạng thẻ/bảng).

### 4.3 Lọc và xếp dữ liệu — `loc.ts`

```ts
export type Cap = 'xa' | 'tinh';
export interface BoLoc { cap: Cap; linhVucMa: string; mucDo: MucDo | ''; boLocTuKhoa: (tim: string) => boolean }
export const docCap = (tho: string): Cap;
export const docMucDo = (tho: string): MucDo | '';
export function locThuTuc(ds: readonly ThuTucDanhMuc[], bo: BoLoc): ThuTucDanhMuc[]; // giữ thứ tự của ds
export function luaChonLinhVuc(linhVuc: readonly LinhVuc[], cap: Cap, dangChon: string): LinhVuc[];
```

- Tổng của tab (để quyết định "(đang lọc)", BR-10) = số thủ tục có `capXa` (hoặc `capTinh`). `locThuTuc` trả danh sách khớp; "(đang lọc)" khi `khop.length < tong`.
- Danh sách theo cấp tách sẵn một lần (`useMemo` theo dữ liệu), mỗi lần gõ chỉ lọc trên danh sách của tab: tối đa vài trăm đến ≈ 1.000 phép `includes` mỗi từ.
- Dùng `url.tuKhoaLoc` (đã `useDeferredValue`) để lọc, `url.tuKhoa` cho ô nhập (C01 plan §4.4).
- `luaChonLinhVuc`: lĩnh vực có số thủ tục > 0 ở tab hiện tại, giữ thứ tự của API. Nếu `dangChon` có trong dữ liệu nhưng không có thủ tục ở tab này thì vẫn thêm vào để ô chọn khớp địa chỉ, nhãn "(0)"; kết quả rỗng hiện `EmptyState` bình thường.

### 4.4 Màn hình — `DanhMucNoiDung`

Thứ tự trong trang (theo prototype):

1. `ThongKe` — 3 ô: số thủ tục cấp xã (`thuTuc.filter(capXa).length`), cấp tỉnh, lĩnh vực (`linhVuc.length`); số có dấu chấm nghìn qua `dinhDangSo`. Đếm từ dữ liệu, không viết cứng (BR-4, AC-7).
2. `Tabs` Cấp xã / Cấp tỉnh (component mới §4.5); nhãn "Thủ tục cấp xã", "Thủ tục cấp tỉnh" (giữ tên, BR/phạm vi: câu hỏi mở 35).
3. Vùng `role="tabpanel"` (một vùng dùng chung hai tab, `aria-labelledby` = tab đang chọn) gồm:
   - `ThanhLoc`: `SearchBox` (nhãn "Tìm theo tên, mã thủ tục hoặc lĩnh vực", không truyền `soKetQua` vì dòng số kết quả là vùng thông báo duy nhất — tránh đọc hai lần), `Select` lĩnh vực ("Tất cả lĩnh vực" + "Tên (n)"), `Select` mức độ ("Tất cả mức độ", "Toàn trình", "Một phần"), `Button` secondary "Xoá bộ lọc" kèm icon `X` — **luôn hiện, ở cả hai tab, kể cả chưa lọc** (BR-8), `ViewToggle` (ẩn dưới 600 px theo C01). Cùng một hàng; hẹp thì xuống dòng.
   - Dòng số kết quả: `"{{so}} thủ tục"` hoặc `"{{so}} thủ tục (đang lọc)"` (hai khoá riêng, không ghép chuỗi), `aria-live="polite"`.
   - Chỗ dành cho dòng "Nhớ đăng xuất khi dùng xong" của F09 (ngay trên danh sách): F04 không làm, F09 thêm (F09 BR-4).
   - Kết quả:
     - `lv` không có trong dữ liệu → khối "Không tìm thấy lĩnh vực" (`common:khong-tim-thay.linh-vuc.tieu-de`) + nút "Xem toàn bộ danh mục" (`.xem-danh-muc`) → `url.xoaBoLoc()` (giữ tab), rồi đưa con trỏ về ô tìm (nút biến mất). Không nhắc lại mã trên địa chỉ, không mã lỗi (F08 BR-10, AC-11). Ẩn danh sách và dòng số kết quả.
     - 0 kết quả → `EmptyState` (`doiTuong` = "thủ tục", `tuKhoa` = `url.tuKhoa`, `coBoLoc` = có `lv` hoặc `md`, `nutXoaTrenThanhLoc = true`): 4 gợi ý bằng chữ, **không** có nút trong thông báo (BR-8, AC-14).
     - Còn lại → `DanhSachThuTuc` của F03 (§4.5): `duLieu={ketQua}`, `cachXem` từ `useCachXem()`, `soMucMoiTrang={25}`, `capTieuDeThe={2}` (trang có `<h1>` ẩn nên thẻ là mục cấp 2; không để nhảy từ h1 xuống h3), `tieuDeBang` (`ket-qua.bang-xa` / `.bang-tinh`), `trang={url.trang}`, `onDoiTrang={url.datTrang}`.
4. Popup: F04 **không gắn gì**. `ThuTucPopup` của F03 nằm trong `Layout` và tự mở theo `ma` trên địa chỉ (§4.5).

Hai truy vấn dữ liệu lỗi hoặc đang tải: `QueryState` (C01) — khung chờ, lỗi với "Thử lại", mã tra cứu chỉ khi `loi-he-thong` (C01 BR-11). Đầu trang, điều hướng, chân trang vẫn hiện (F08 BR-11).

### 4.5 Phần dùng chung với F03 (tên theo plan F03 §4.1, §4.4)

F04 **dùng, không tự viết lại**, các phần sau trong `src/FrontEnd/src/features/thu-tuc/` (F03 BR-4, BR-6, BR-8):

| Cần | Tên F03 đã chốt | F04 dùng thế nào |
|---|---|---|
| Danh sách thẻ / bảng | `DanhSachThuTuc<T extends MucThuTuc>` (gói `DataTable` + `ThuTucCard` + `cotThuTuc`) | Truyền `duLieu`, `cachXem`, `tieuDeBang`, `soMucMoiTrang={25}`, `soCotToiDa` (mặc định), `trang`, `onDoiTrang`, `capTieuDeThe={2}` (§4.4). Không import `ThuTucCard` hay `cotThuTuc` riêng |
| Kiểu dữ liệu một mục | `MucThuTuc` (`types.ts`) | `ThuTucDanhMuc` (§3.1) gán được; F04 không import kiểu của F03 và F03 không import kiểu của F04 |
| Mở popup | `useMoThuTuc(): { ma, mo(ma), dong() }` | F04 **không gọi trực tiếp**: `DanhSachThuTuc` gọi `mo(ma)` khi bấm tên hoặc "Xem chi tiết". `mo` giữ mọi tham số khác (`cap`, `lv`, `md`, `q`, `trang`); ngoài kiosk thêm mục lịch sử, ở kiosk `replace` (F03 §4.2) |
| Popup | `ThuTucPopup` (đã gắn trong `Layout`) | F04 không gắn popup. Mã không có trong dữ liệu, tiêu đề tab khi mở, "Quay lại": F03 lo |
| Link Cổng DVC | `linkDvc(ma)` (`linkDvc.ts`) | F04 không gọi trực tiếp; thẻ và dòng bảng trong `DanhSachThuTuc` đã có liên kết (AC-15) |
| Dòng nhắc đăng xuất ở kiosk | F09 thêm vào `DanhSachThuTuc` | F04 không làm |

Trường F03 cần cho thẻ và cột đã có trong §3.1. Cần thêm trường khác → F03 báo để sửa §3.1. `phi` **không** có trong danh mục rút gọn (prototype không hiện phí ở thẻ và bảng; design-system §5 có nhắc "thời hạn, phí" — hỏi ở §10 câu 2).

### 4.6 Component mới cho `core/` (ui-core-dev)

C01 chưa có ô chọn và tab. Hai component dùng chung, mỗi cái một thư mục `core/components/<Ten>/` (`<Ten>.tsx`, `.module.css`, `.test.tsx`, `index.ts`), quy ước C01 §3.1.

**`Select`** (C01 plan §11 đã dự kiến):

```ts
interface SelectProps {
  nhan: string;                 // bắt buộc, mặc định ẩn bằng VisuallyHidden
  hienNhan?: boolean;
  giaTri: string;
  onDoi: (giaTri: string) => void;
  luaChon: readonly { giaTri: string; nhan: string }[];   // mục đầu là "tất cả" (giaTri '')
  ref?: Ref<HTMLSelectElement>;
}
```

- Dùng `<select>` gốc (bàn phím và trình đọc màn hình sẵn có, cuộn được danh sách 75 mục trên điện thoại), `appearance: none`, mũi tên là icon `ChevronDown` (`aria-hidden`) đè lên bằng CSS.
- Cao `--control-height`, viền như `SearchBox`, bo `--radius-sm`, viền focus theo `global.css`. Nhãn dài thì cắt bằng `text-overflow: ellipsis`, không làm trang cuộn ngang ở 320 px. Chỉ dùng token.

**`Tabs`** (mẫu ARIA tabs):

```ts
interface TabsProps<T extends string> {
  nhan: string;                       // aria-label của tablist
  luaChon: readonly { giaTri: T; nhan: string }[];
  giaTri: T;
  onDoi: (giaTri: T) => void;         // chỉ gọi khi đổi sang tab khác
  idBang: string;                     // id của tabpanel dùng chung
}
export function idTab(idBang: string, giaTri: string): string;  // để tabpanel dùng aria-labelledby
```

- `role="tablist"`; mỗi tab `<button role="tab" id={idTab(...)} aria-selected aria-controls={idBang}>`; tab đang chọn `tabIndex=0`, tab còn lại `-1`; ← → chuyển tab và kích hoạt ngay (nội dung đã có sẵn trong bộ nhớ), Home/End; Enter và phím cách cũng kích hoạt.
- Tab đang chọn: nền hoặc gạch chân đậm + chữ đậm (không chỉ dựa vào màu — C01 BR-1). Hai tab chia đều chiều ngang dưới 600 px, vừa 375 px.
- `Tabs` chỉ vẽ tablist; tabpanel do nơi dùng tự vẽ.

Cả hai thêm vào trang xem trước (`/dev/design-system`) để axe và tester kiểm (C01 plan §4.11).

### 4.7 Câu chữ

Mọi chữ đi qua `t()`. Khoá dùng chung thêm vào `core/i18n/vi/common.json`: `muc-do.toan-trinh` ("Toàn trình"), `muc-do.mot-phan` ("Một phần") — F03 cũng dùng (ai làm trước thì thêm; người sau dùng lại).

`features/danh-muc/i18n/vi.json`:

| Khoá | Câu |
|---|---|
| `thong-ke.nhan` | Thống kê danh mục |
| `thong-ke.xa` · `.tinh` · `.linh-vuc` | Thủ tục cấp xã · Thủ tục cấp tỉnh · Lĩnh vực |
| `tab.nhan` | Danh mục |
| `tab.xa` · `.tinh` | Thủ tục cấp xã · Thủ tục cấp tỉnh |
| `loc.nhan-tim` | Tìm theo tên, mã thủ tục hoặc lĩnh vực |
| `loc.linh-vuc` · `.tat-ca-linh-vuc` · `.linh-vuc-co-so` | Lĩnh vực · Tất cả lĩnh vực · {{ten}} ({{so}}) |
| `loc.muc-do` · `.tat-ca-muc-do` | Mức độ · Tất cả mức độ |
| `ket-qua.so` · `.so-dang-loc` | {{so}} thủ tục · {{so}} thủ tục (đang lọc) |
| `ket-qua.doi-tuong` | thủ tục |
| `ket-qua.bang-xa` · `.bang-tinh` | Danh sách thủ tục cấp xã · Danh sách thủ tục cấp tỉnh (tên vùng bảng) |

Nút "Xoá bộ lọc" dùng `common:nut.xoa-bo-loc`; thông báo không có kết quả dùng `common:rong.*`; "Không tìm thấy lĩnh vực" dùng `common:khong-tim-thay.linh-vuc.*`. `app/i18n.d.ts` thêm namespace `danh-muc` (gõ sai khoá là lỗi `tsc`).

## 5. Hiệu năng

- **Tải dữ liệu:** hai yêu cầu song song khi vào `/thu-tuc` (≈ 26 KB + 2 KB Brotli với 408 thủ tục; ước 60–80 KB với 1.000). Một lần cho mỗi phiên: `staleTime` mặc định 60 giây của `Providers`, sau đó tải lại là yêu cầu có điều kiện (ETag) nhận `304` không thân. F03 trên trang chủ dùng chung khoá `['danh-muc-thu-tuc']` nên không tải lần hai khi chuyển trang.
- **Lọc phía client, không gọi API khi gõ:** `tim` tính sẵn khi nạp; mỗi lần gõ chỉ lọc danh sách của tab (≤ ≈ 1.000 mục) qua `useDeferredValue`; chỉ 25 dòng được vẽ mỗi trang. Mục tiêu ≤ 200 ms từ phím cuối với 1.000 thủ tục (AC-4, F00 BR-9). Đo ở khổ 375, 4G giả lập, bản `dotnet publish`.
- **BE p95 ≤ 300 ms:** phần lớn yêu cầu trả từ output cache (một truy vấn phiên bản + đọc cache) hoặc `304`. Lỡ cache: hai truy vấn đọc bảng nhỏ. Nguồn Mẫu: đọc trong bộ nhớ. Nén Brotli ở middleware nén (đứng trước output cache nên cache giữ bản chưa nén, mỗi yêu cầu nén lại ≈ vài ms với 200–500 KB); nếu đo thấy p95 gần ngưỡng thì xem lại.
- **Ngân sách JS (≤ 200 KB gzip lúc tải đầu):** nền hiện ≈ 149 KB (F08 `result/test.md` ghi 143,6 KiB). Mở `/thu-tuc`:
  - Chunk route F04 (`DanhMuc`, `ThongKe`, `ThanhLoc`, `loc.ts`, câu chữ): ước 5–8 KB.
  - Component lõi lần đầu dùng ở trang này: `SearchBox`, `Pager`, `DataTable` (vỏ, chưa có TanStack), `Select`, `Tabs`, `EmptyState`, `ExternalLink`, `Card`, `Badge`, `Skeleton`, các icon: ước 12–18 KB (dùng chung với F03, tính một lần).
  - TanStack Table (chunk `grid`) chỉ nạp ở dạng bảng: máy tính ≥ 1024 px mở mặc định dạng bảng nên chunk này tính vào tải đầu ở khổ đó: ước ≈ 15–20 KB.
  - Popup do F03 nạp lười (`ThuTucPopup`), không tính vào tải đầu; F03 nạp trước chunk popup sau ≈ 2 giây khi danh sách vẽ xong hoặc khi người dùng nhấn/focus vào "Xem chi tiết" (F03 §5). Trang chủ và trang danh mục cùng dùng `DanhSachThuTuc` nên chunk này tính một lần.
  - Ước tính xấu nhất ở 1280 px: 149 + 8 + 18 + 20 ≈ 195 KB — **sát ngưỡng**. T11 đo số thật (entry, vendor, chunk route, `grid`) ở 375 và 1280 px và ghi vào báo cáo. Vượt 200 KB: dừng, báo người dùng trước khi cắt tính năng. Chỗ xem xét trước: icon thừa, phần bị kéo nhầm vào chunk dùng chung, nội dung `vendor`.
- CSS Module theo chunk; không CSS-in-JS; không tệp font; không ảnh mới.

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Dữ liệu ra trình duyệt | Chỉ trường §3.1: không `phi`, `ma_dvc`, mã đơn vị, nội dung chi tiết. Toàn dữ liệu công khai của thủ tục. Không dữ liệu cá nhân, không nhật ký từ khoá (lọc phía client, từ khoá không gửi lên máy chủ) |
| Đầu vào | API không nhận tham số (không có chỗ cho SQL/đầu vào độc). Tham số trên địa chỉ trang (`cap`, `md`, `lv`, `trang`, `q`) chỉ dùng phía client: `cap`, `md` theo danh sách cho phép; `trang` chỉ nhận chuỗi chữ số; `lv` so với mã có trong dữ liệu; `q` tối đa 100 ký tự ở ô nhập và chỉ so khớp chuỗi |
| Chèn nội dung | Tên thủ tục, từ khoá, lĩnh vực hiển thị bằng nút chữ của React; không `dangerouslySetInnerHTML`. Từ khoá trong `EmptyState` là chữ thường (C01). "Không tìm thấy lĩnh vực" không nhắc lại mã trên địa chỉ |
| Liên kết ra ngoài | Chỉ `linkDvc(ma)` của F03, qua `ExternalLink` trong `DanhSachThuTuc` (`rel="noopener noreferrer"`, tab mới), `encodeURIComponent(ma)`. Mã lấy từ dữ liệu, không từ địa chỉ |
| Giới hạn tần suất | Policy `danh-muc` 300 yêu cầu/phút/IP (F00); trang mở tốn 2 yêu cầu. Kiosk dùng chung IP không chạm ngưỡng ở mức dùng thường |
| Thổi cache bằng query | Không gắn `[DanhMucQuery]` nên query ngẫu nhiên không tạo thêm mục cache (F00 T18) |
| Lỗi | ProblemDetails có `code`, `maTraCuu`; FE hiện câu theo mã (C01 `ErrorState`), không hiện mã HTTP hay chi tiết |
| CSP | Không script/style inline; biến CSS qua CSSOM nếu cần; không tài nguyên ngoài |

## 7. Truy vết

| Spec | Phần plan | Task |
|---|---|---|
| BR-1 tìm tên, mã, lĩnh vực, không dấu, nhiều từ | §3.1 (`tim`, `taoBoLocTuKhoa`), §4.3 | T04, T08 |
| BR-2 từ khoá, lĩnh vực, mức độ kết hợp | §4.3 | T08, T10 |
| BR-3 trạng thái trên địa chỉ | §4.2 | T10 |
| BR-4 thống kê 3 con số từ dữ liệu | §3.1 (`linh-vuc` chỉ trả lĩnh vực có thủ tục), §4.4 `ThongKe` | T01, T09 |
| BR-5 phân trang 25; đổi tab về trang 1 | §4.2, §4.4 (`DataTable`) | T10 |
| BR-6 không "ưu tiên" | DTO không có trường ưu tiên (§3.1); không nhãn, không ô thống kê | T01, T09 |
| BR-7 lĩnh vực không còn | §4.4 | T10 |
| BR-8 nút "Xoá bộ lọc" trên thanh lọc; không nút trong thông báo | §4.2, §4.4 | T09, T10 |
| BR-9 thẻ/bảng, dùng chung với F03 | §4.4 (`useCachXem`, `ViewToggle`, `DataTable`), §4.5 | T10 (F03) |
| BR-10 dòng "<số> thủ tục (đang lọc)" | §4.3, §4.4, §4.7 | T08, T10 |
| AC-1 "ho tich" | §4.3 | T08 |
| AC-2 lọc Hộ tịch + Toàn trình; "266 thủ tục" | §4.3, §4.4 | T08, T10 |
| AC-3 "Xoá bộ lọc", luôn hiện | §4.2, §4.4 | T09, T10 |
| AC-4 gõ ≤ 200 ms với 1.000 thủ tục | §5 | T08 (đo phép lọc), T15 |
| AC-5 link lĩnh vực của tab cấp xã | §4.2 | T10 |
| AC-6 bấm thủ tục mở popup | §4.5 (F03) | T10 |
| AC-7 thống kê 266/408/75; nhập lại thành 267 | §3.1, §4.4; cache F00 T18 | T01, T03, T09, T14 |
| AC-8 không nhãn/ô "Ưu tiên" | §3.1, §4.4 | T09, T15 |
| AC-9 60 dòng → 25, 25, 10 | §4.4 (`DataTable`) | T10 |
| AC-10 địa chỉ theo tab, lĩnh vực, từ khoá, trang | §4.2 | T10, T15 |
| AC-11 lĩnh vực không còn | §4.4 | T10, T15 |
| AC-12 gõ "1.001193" | §3.1 (`tim` có mã), §4.3 | T04, T08 |
| AC-13 popup giữ bộ lọc; "Quay lại" | §4.2, §4.5 | T10 (F03), T15 |
| AC-14 không kết quả: 4 gợi ý, không nút trong thông báo | §4.4 | T10, T15 |
| AC-15 liên kết Cổng DVC trên dòng/thẻ | §4.5 (F03) | T10 (F03), T15 |
| AC-16 dạng thẻ/bảng theo khổ; chia sẻ với khối thường gặp | §4.4, `useCachXem` đã có | T10, T15 |
| Hiệu năng: JS tải đầu ≤ 200 KB, p95 ≤ 300 ms, Lighthouse ≥ 85 | §5 | T11 (đo kích thước), T15 |
| Hai nguồn dữ liệu cho cùng kết quả (R1–R7) | §3.2 | T01, T03, T14 |
| ETag/cache theo lần nhập | §3.2 | T02, T14 |

## 8. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Api/DuLieuThu/DanhMucThu.cs` | backend-dev | Bộ dữ liệu thử dựng bằng C# (`TepDuLieuMau`): thủ tục chỉ xã, chỉ tỉnh, cả hai; hai mức độ; có/không `ThuTuThuongGap`; `CoQuanThucHien` null; `ThoiHan` các dạng "Khác", "1 Khác", rõ, và thời hạn thủ tục không rõ nhưng cách thức có thời hạn rõ; lĩnh vực có thủ tục ở cả hai cấp, chỉ một cấp, và một lĩnh vực **không** có thủ tục; `ThuTu` cố ý đảo thứ tự; tên lĩnh vực có "Đ", "Thủy"/"Thuỷ" để kiểm thứ tự |
| `Tests/Api/DanhMucServiceContract.cs` + `DanhMucServiceTrenMau.cs` | backend-dev | Test hợp đồng (F00 §9.10, R7): thứ tự theo `ThuTu`; `MucDo` đúng chuỗi; `CapXa`/`CapTinh`; trường null có mặt; `ThoiHan` đúng như `ThoiHanThuTuc.Chon` ("Khác"/"1 Khác" không bao giờ ra nguyên văn); lĩnh vực không thủ tục bị bỏ; số thủ tục mỗi cấp đúng; thứ tự lĩnh vực theo `TenTimKiem` Ordinal; nguồn rỗng → `[]`. Ca trên file nhúng `TepDuLieuMau.Nhung`: tổng 408, xã 266, tỉnh 408, 75 lĩnh vực, 16 thủ tục có `ThuTuThuongGap`, cho khớp F04 AC-7 |
| `Tests/Api/DanhMucTests.cs` | backend-dev | Service giả + `IPhienBanDuLieu` giả: JSON camelCase đúng tên trường §3.1; GET 200 có `ETag`, `Cache-Control: no-cache`; `If-None-Match` → 304 và service không chạy; đổi phiên bản → 200 dữ liệu mới; POST → 405 `phuong-thuc-khong-hop-le`; vượt giới hạn → 429; query lạ không tạo mục cache mới; service ném lỗi → 500 `loi-he-thong` có `maTraCuu`, không lộ chi tiết |
| `Tests/Data/DuLieu/QuyTacTruyVanTests` (có sẵn) | — | Tự quét `Features/DanhMuc/` (R4); kiểm tra kiến trúc (không nhận `AppDbContext`) có sẵn |
| `Tests/Integration/DanhMuc/DanhMucServiceTrenPostgreSql.cs` | tester | Lớp con PostgreSQL của `DanhMucServiceContract`; DTO từ hai nguồn trên cùng `TepDuLieuMau` tuần tự hoá giống từng byte; nhập lại có thêm 1 thủ tục xã → API trả 267 (AC-7) |
| `src/FrontEnd/src/core/api/*.test.ts(x)` | ui-core-dev | `fetch` giả: gọi đúng `/api/thu-tuc`, `/api/linh-vuc`; `tim` có tên, mã, lĩnh vực; thiếu khoá lĩnh vực → `linhVuc` (tên) rỗng; `ThuTucDanhMuc` gán được cho kiểu cấu trúc `MucThuTuc` của F03; lỗi HTTP → `ApiError` |
| `core/components/Select`, `Tabs` `.test.tsx` | ui-core-dev | Select: nhãn, đổi giá trị, tên đọc; Tabs: `aria-selected`, roving tabindex, ← → Home End, `onDoi` chỉ gọi khi đổi |
| `features/danh-muc/loc.test.ts` | frontend-dev | AC-1 ("ho tich" ra thủ tục Hộ tịch, có thể kèm thủ tục khác chứa cả hai từ), AC-12 (mã), lọc kết hợp, giữ thứ tự, `docCap`/`docMucDo` với giá trị lạ, `luaChonLinhVuc` (kể cả lĩnh vực 0 thủ tục), 1.000 mục lọc < 50 ms |
| `features/danh-muc/DanhMuc.test.tsx` | frontend-dev | Màn hình trong `MemoryRouter` + `fetch` giả: AC-2, AC-3, AC-5, AC-9 (60 dòng → 3 trang), AC-10 (địa chỉ), AC-11, AC-14, thống kê, ô tìm không báo hai lần |
| `e2e/danh-muc.spec.ts` | tester | Trình duyệt thật, dữ liệu từ nguồn Mẫu và một bản 1.000 thủ tục (`page.route`): AC-4 (đo như C01 AC-25), AC-6, AC-10, AC-13, AC-15, AC-16 (375, 768, 1280, 1080×1920 kiosk), axe ở thường và kiosk |
| Lighthouse, p95 | tester | `/thu-tuc` mobile ≥ 85, tổng JS ≤ 200 KB ở 375 và 1280 (bản `Release`); p95 API với 1.000 yêu cầu (F00 AC-10) trên bộ 1.000 thủ tục |

## 9. Rủi ro

1. **Phụ thuộc F03 theo hai chiều.** (a) BE: F04 T01 chờ F03 T01 (`ThoiHanThuTuc`). (b) FE: T10 chờ `DanhSachThuTuc` (F03 T07) và popup trong `Layout` (F03 T05, T06). Ngược lại F03 T07 (phần dữ liệu thật) chờ F04 T04 (`useDanhMucThuTuc`): làm T04 sớm. T02–T09 không phụ thuộc F03.
2. **Ngân sách JS ở 1280 px sát ngưỡng** (§5): nền ≈ 149 KB + chunk route + component lõi + chunk bảng. Đo ở T11; vượt thì báo trước khi cắt.
3. **`thu_tu` không có chỉ mục duy nhất.** Thứ tự danh sách dựa vào `thu_tu` do công cụ nhập gán theo số dòng, nên không trùng. Nếu có nguồn khác gán trùng, thứ tự giữa các dòng trùng không xác định ở PostgreSql (R3). Chưa cần migration.
4. **Hai nguồn lệch kết quả** (R1–R7): giảm bằng cách đếm trong bộ nhớ, `Select` ra kiểu ẩn danh, test hợp đồng chạy cả hai nguồn (T03, T14).
5. **Nén Brotli mỗi yêu cầu** vì output cache giữ bản chưa nén: ảnh hưởng nhỏ ở quy mô một xã; xem lại nếu p95 gần 300 ms.
6. **Trình đọc màn hình** đọc dòng số kết quả (`aria-live`) mỗi khi gõ làm đổi số: chấp nhận được vì chỉ đọc khi số đổi; tester thử NVDA (C01 rủi ro 3 áp tương tự).
7. **Sửa chung tệp với F02, F03, F05:** `app/routes.tsx`, `app/i18n.d.ts`, `core/i18n/vi/common.json`, `app/xem-truoc/*` đều do ui-core-dev sửa ở nhiều plan. Mỗi task đọc lại tệp ngay trước khi sửa, không ghi đè phần của task khác.
8. **Dữ liệu chất lượng:** 73/408 thủ tục có `thoi_han` dạng "Khác" ("2 Khác"…): `ThoiHanThuTuc.Chon` làm rõ hoặc trả null, FE hiện câu "Chưa ghi rõ" (F03). 5/408 thủ tục có `thoi_han` dài trên 60 ký tự (tối đa ≈ 1.200): vẫn trả nguyên văn, thẻ dùng nhãn `rutGon`.
9. **Đọc `cach_thuc` cho cả danh mục** để chọn thời hạn: lỡ cache thì đọc jsonb của ≈ 1.000 thủ tục. Giảm thiểu: chỉ chiếu phần cần; output cache + ETag; đo ở T15. Nếu chậm: F03 và F04 cùng bàn cách tính sẵn khi nhập (F01), không sửa trong F04.
10. **Ký tự vô hình** khi sửa tệp (C01 rủi ro 8): không gõ `\uXXXX` qua Edit; sau khi ghi, tìm U+200B–U+200F, U+FEFF bằng `grep -P "[\x{200B}-\x{200F}\x{FEFF}]"` (lệnh đúng ở `tasks.md`).

## 10. Cần hỏi

Làm theo đề xuất nếu người dùng không phản đối. Người dùng chọn khác thì planner sửa plan trước khi làm lại phần liên quan.

| # | Câu hỏi | Đề xuất | Ảnh hưởng |
|---|---|---|---|
| 1 | **Đã khớp plan F03** (tên ở §4.5, `thoiHan` ở §3.2, trả đủ hai cấp ở §3.1). Còn lệch nhỏ cần F03 sửa ở plan của mình: (a) `useDanhMucThuTuc()` trả `DanhMucThuTuc`, không phải mảng (§3.1) — F03 §3.2 đang giả định mảng; (b) F03 §4.5 tự ghép `ghepChuoiTimKiem(ten, ma, linhVuc)` — dùng `tim` có sẵn; (c) F03 §3.2 ghi "F04 chưa có plan" | F03 đổi theo §3.1 | T10; F03 T07 |
| 2 | Thẻ và bảng của danh mục có cột **phí** không? design-system §5 `ThuTucCard` ghi "thời hạn, phí"; prototype đã duyệt chỉ có thời hạn (thẻ), cơ quan thực hiện (bảng). `phi` dài tới ≈ 1.700 ký tự | Không có phí ở danh sách, theo prototype; phí xem trong popup. Nếu muốn có phí: F03 và ba-analyst chốt cách cắt ngắn, rồi thêm `Phi` vào §3.1 | §3.1, T01 |
| 3 | **Đổi tab thì giữ gì?** BR-5 chỉ ghi "về trang 1" | **Đã chốt** theo prototype: bỏ lĩnh vực (có thể không có thủ tục ở tab kia), giữ từ khoá và mức độ. Nhờ ba-analyst cập nhật BR-5 | §4.2, T10 |
| 4 | **Địa chỉ luôn có `cap`:** vào `/thu-tuc` không có `cap` thì trang tự ghi `cap=xa` (thay mục lịch sử) để AC-10 "địa chỉ có tab" đúng ở mọi đường vào. Nếu chỉ cần `cap` khi là cấp tỉnh thì bỏ bước này | Làm như §4.2 | T10 |
| 5 | Thứ tự lĩnh vực trong ô chọn (và lưới F05) | Theo tên, so `TenTimKiem` Ordinal (bỏ dấu, "Đ" xếp cùng "D"); spec chưa nêu | T01 |
| 6 | `lien-ket.md` §4 (danh sách API) cần thêm `GET /api/thu-tuc`, `GET /api/linh-vuc` | Nhờ ba-analyst cập nhật (planner không sửa `nghiep-vu/`) | Không có task |
| 7 | Giá trị lạ của `cap`, `md` trên địa chỉ | Lặng lẽ coi là mặc định (xã, tất cả mức độ), không thông báo, như prototype | T08, T10 |
| 8 | `?thuongGap=1` để trang chủ khỏi tải cả danh mục | Chỉ là phương án dự phòng khi Lighthouse trang chủ < 85 (§3.1); chưa làm | Không có task |
