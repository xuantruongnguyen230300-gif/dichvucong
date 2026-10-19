# F04 · Danh mục thủ tục — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`.

Điều kiện bắt đầu:

- **Làm ngay** (không chờ gì):
  - backend-dev: T01 **sau F03 T01** (cần `ThoiHanThuTuc` của F03, `plan.md` §3.2); rồi T02 và T03 song song. Nếu F03 T01 chưa xong: backend-dev làm F03 T01 trước (cùng một agent), không khai hàm thứ hai.
  - ui-core-dev: T04, T05, T06 song song (không phụ thuộc BE); T07 sau T05 và T06.
  - tester: T13 (viết `testcases.md` từ spec và plan).
- frontend-dev: T08 sau T04; T09 sau T04 và T05; T10 sau T06, T08, T09 **và** F03 T05–T07 (`DanhSachThuTuc` ở F03 T07, popup trong `Layout` ở F03 T05, T06; `plan.md` §4.5). T08, T09 làm được khi chưa có F03.
- Ngược lại: F03 T07 (phần dữ liệu thật) chờ F04 T04 (`useDanhMucThuTuc`, kiểu `ThuTucDanhMuc`). Làm T04 sớm và báo F03.
- T11 (ui-core-dev) sau T10: nối route và đo kích thước.
- T12 (code-reviewer) sau T11. T14 (tester) sau T03. T15 (tester) sau T11 và T12.
- db-dev, chatbot-dev: không có task trong F04 (không đổi bảng, cột, chỉ mục).
- Không gõ `\uXXXX` qua Edit hay Bash. Mọi tệp mới/sửa: tìm ký tự vô hình bằng `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>`; chỉ được thấy ở chỗ chủ ý. Dữ liệu thử cần ký tự vô hình thì tạo bằng `String.fromCodePoint(0x200e)` (TS) hoặc mã thoát Unicode của C# (U+200E) trong tệp viết qua script; không dán ký tự thật.
- Các tệp `app/routes.tsx`, `app/i18n.d.ts`, `core/i18n/vi/common.json`, `app/xem-truoc/*` cũng bị F02, F03, F05 sửa: đọc lại ngay trước khi sửa, không ghi đè phần của task khác.

## backend-dev

- [x] T01 [backend-dev] Dịch vụ danh mục `Features/DanhMuc/` (§3.1, §3.2):
  - `DanhMucDtos.cs`: `ThuTucRutGonDto`, `LinhVucDto` đúng §3.1 (tên và thứ tự trường).
  - `ThoiHan` = `ThoiHanThuTuc.Chon(...)` của F03 T01 (`using DichVuCong.Api.Features.ChiTietThuTuc`), gọi trong C# sau khi lấy dữ liệu; chiếu thêm `CachThuc` theo cách F03 T01 đã chọn (`plan.md` §3.2). Không viết lại quy tắc "Khác".
  - `IDanhMucService` + `DanhMucService(INguonDuLieu)`: `LayThuTucAsync`, `LayLinhVucAsync` theo §3.2 (R1–R5): chỉ `DanhSachAsync`; `Select` kiểu ẩn danh rồi dựng DTO; mức độ đổi sang `"toan-trinh"` / `"mot-phan"` bằng hàm thuần sau khi lấy (giá trị lạ → `InvalidOperationException`); đếm lĩnh vực trong bộ nhớ; bỏ lĩnh vực không có thủ tục; sắp lĩnh vực theo `TenTimKiem` rồi `Ma` với `StringComparer.Ordinal`.
  - `DanhMucServiceCollectionExtensions.AddDanhMuc()`; `AddApiServices` gọi hàm này (`Program.cs` không đổi).
  - file: `src/BackEnd/DichVuCong.Api/Features/DanhMuc/{DanhMucDtos.cs, DanhMucService.cs, DanhMucServiceCollectionExtensions.cs}`, `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs`
  - xong khi:
    - `dotnet build src/BackEnd/DichVuCong.sln` sạch (cảnh báo = lỗi).
    - `QuyTacTruyVanTests` và test kiến trúc hiện có vẫn xanh (không `StartsWith`/`EndsWith`/`Contains` theo văn hoá, không nhận `AppDbContext`).
    - Thủ tục có `thoi_han` "Khác"/"1 Khác" không bao giờ ra nguyên văn trong `ThoiHan` (kiểm ở T03).
    - Chạy tay với nguồn Mẫu (`dotnet run`): dịch vụ trả 408 thủ tục (xã 266, tỉnh 408) và 75 lĩnh vực — kiểm bằng test ở T03, T02.

- [x] T02 [backend-dev] [P] Hai endpoint và test HTTP (§3.1, §3.2, §8):
  - `ThuTucDanhMucController` (`api/thu-tuc`) và `LinhVucController` (`api/linh-vuc`): chỉ `[HttpGet]` và `[HttpHead]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, **không** gắn `[DanhMucQuery]`. Trả mảng trực tiếp (`[]` khi rỗng, không 404).
  - Test `DanhMucTests`: dựng như `ThongTinTrungTamTests` (service giả, `IPhienBanDuLieu` giả).
  - file: `src/BackEnd/DichVuCong.Api/Features/DanhMuc/{ThuTucDanhMucController.cs, LinhVucController.cs}`, `src/BackEnd/DichVuCong.Tests/Api/DanhMucTests.cs`
  - xong khi:
    - `dotnet build` sạch, `dotnet test` xanh.
    - Test: JSON camelCase đúng tên trường §3.1 (`linhVucMa`, `capXa`, `capTinh`, `thuTuThuongGap`, `soThuTucXa`…), trường null vẫn có mặt; 200 có `ETag` và `Cache-Control: no-cache`; `If-None-Match` khớp → 304 và service không chạy; đổi phiên bản → 200 dữ liệu mới; POST → 405 `phuong-thuc-khong-hop-le`; vượt giới hạn danh mục → 429 `qua-nhieu-yeu-cau`; `?x=1` và `?x=2` cùng một mục cache; service ném lỗi → 500 `loi-he-thong` có `maTraCuu`, không có stack trace; danh sách rỗng → 200 `[]`.
    - Chạy tay: `curl -k https://localhost:7157/api/thu-tuc` và `/api/linh-vuc` trả đúng dạng §3.1, không có trường nào ngoài hợp đồng.

- [x] T03 [backend-dev] [P] Test hợp đồng của dịch vụ trên nguồn Mẫu (§8, F00 §9.10 R7):
  - `DuLieuThu/DanhMucThu.cs`: bộ dữ liệu thử dựng bằng C# (nội dung ở §8).
  - `DanhMucServiceContract` (lớp trừu tượng, hàm `TaoNguon(TepDuLieuMau)`) + `DanhMucServiceTrenMau` — cùng mẫu `ThongTinTrungTamServiceContract` / `…TrenMau`.
  - file: `src/BackEnd/DichVuCong.Tests/Api/DuLieuThu/DanhMucThu.cs`, `src/BackEnd/DichVuCong.Tests/Api/{DanhMucServiceContract.cs, DanhMucServiceTrenMau.cs}`
  - xong khi:
    - `dotnet test` xanh. Các ca: thứ tự theo `ThuTu` (dữ liệu thử cố ý đảo); `MucDo` đúng chuỗi; `CapXa`/`CapTinh` đủ ba tổ hợp (chỉ xã, chỉ tỉnh, cả hai); trường null có mặt; `ThuTuThuongGap` đúng; `ThoiHan`: "Khác", "1 Khác" → không ra nguyên văn (null, hoặc thời hạn rõ đầu tiên của cách thức); thời hạn rõ giữ nguyên; lĩnh vực không có thủ tục bị bỏ; `SoThuTucXa`/`SoThuTucTinh` đúng; thứ tự lĩnh vực theo `TenTimKiem` Ordinal; nguồn không có thủ tục → `[]`.
    - Ca trên file nhúng `TepDuLieuMau.Nhung`: 408 thủ tục, xã 266, tỉnh 408, 75 lĩnh vực, 16 thủ tục có `ThuTuThuongGap` (khớp F04 AC-7, `du-lieu.md`).
    - Lớp trừu tượng không phụ thuộc nguồn nào, để tester (T14) viết lớp con PostgreSQL.

## ui-core-dev

- [x] T04 [ui-core-dev] [P] Kiểu và hook dữ liệu danh mục — hợp đồng dùng chung (§3.1):
  - `core/api/danhMucThuTuc.ts`: `MucDo`, `ThuTucRutGon`, `ThuTucDanhMuc`, `DanhMucThuTuc`, `API_THU_TUC`, `API_LINH_VUC`, `KHOA_DANH_MUC_THU_TUC`, `useDanhMucThuTuc()` (gọi hai API song song bằng `http`, một `useQuery`, `tim` và `linhVucTheoMa` tính trong `queryFn`; `ThuTucDanhMuc.linhVuc` là **tên** lĩnh vực (gán được cho `MucThuTuc` của F03; thủ tục không có lĩnh vực → chuỗi rỗng); retry như `useThongTinTrungTam`: 404 không thử lại).
  - `core/api/linhVuc.ts`: `LinhVuc`, `KHOA_LINH_VUC`, `layLinhVuc`, `useLinhVuc()`.
  - `core/utils/dinhDang.ts`: thêm `dinhDangSo(n: number): string` (dấu chấm nghìn kiểu Việt, `Intl.NumberFormat('vi-VN')`).
  - `core/i18n/vi/common.json`: thêm `muc-do.toan-trinh` ("Toàn trình"), `muc-do.mot-phan` ("Một phần") nếu F03 chưa thêm.
  - `src/test-utils/danhMucMau.ts`: hàm dựng dữ liệu thử cho test (danh sách `ThuTucRutGon` và `LinhVuc` có tham số: số lượng, cấp, mức độ, lĩnh vực) và hàm giả `fetch` cho `/api/thu-tuc` + `/api/linh-vuc` — frontend-dev dùng lại ở T08, T10.
  - file: `src/FrontEnd/src/core/api/{danhMucThuTuc.ts, linhVuc.ts}`, `src/FrontEnd/src/core/utils/dinhDang.ts`, `src/FrontEnd/src/core/i18n/vi/common.json`, `src/FrontEnd/src/test-utils/danhMucMau.ts`, test cạnh từng tệp
  - xong khi:
    - `npm test`, `npm run lint`, `npx tsc -b` sạch.
    - Test: gọi đúng `/api/thu-tuc` và `/api/linh-vuc`; `tim` chứa tên đã bỏ dấu, mã, tên lĩnh vực bỏ dấu (gõ "1.001193" và "ho tich" khớp với `taoBoLocTuKhoa`); lỗi HTTP → `ApiError`; `dinhDangSo(1000)` = `1.000`, `dinhDangSo(266)` = `266`.
    - Hai bản kiểu TS khớp từng trường với record C# của T01.

- [x] T05 [ui-core-dev] [P] Component `Select` (§4.6):
  - `<select>` gốc, nhãn bắt buộc (ẩn mặc định), `appearance: none` + icon `ChevronDown` (`aria-hidden`), cao `--control-height`, chỉ dùng token, nhãn dài cắt bằng `ellipsis`, không làm trang cuộn ngang ở 320 px.
  - file: `src/FrontEnd/src/core/components/Select/{Select.tsx, Select.module.css, Select.test.tsx, index.ts}`
  - xong khi:
    - Lint, `tsc`, test xanh: có `<label>` (tên đọc = `nhan`); đổi giá trị gọi `onDoi` đúng giá trị; `ref` chuyển xuống `<select>`; chọn bằng bàn phím được.
    - Vùng bấm ≥ 24 × 24 px; viền focus hiện; chữ ở kiosk lớn theo `--control-height`.

- [x] T06 [ui-core-dev] [P] Component `Tabs` (§4.6):
  - `Tabs<T extends string>` + `idTab(idBang, giaTri)`: `role="tablist"`, tab là `<button role="tab" aria-selected aria-controls>`, roving tabindex, ← → Home End, Enter/phím cách; `onDoi` chỉ gọi khi đổi sang tab khác; hai tab chia đều chiều ngang dưới 600 px; tab đang chọn có gạch chân đậm + chữ đậm.
  - file: `src/FrontEnd/src/core/components/Tabs/{Tabs.tsx, Tabs.module.css, Tabs.test.tsx, index.ts}`
  - xong khi:
    - Lint, `tsc`, test xanh: `aria-selected` đúng; chỉ tab đang chọn có `tabIndex=0`; ← → chuyển và kích hoạt; Home/End; bấm lại tab đang chọn không gọi `onDoi`; `idTab` ổn định.
    - Vùng bấm ≥ 24 × 24 px; hai tab vừa khổ 375 px không cuộn ngang.

- [x] T07 [ui-core-dev] Thêm `Select` và `Tabs` vào trang xem trước `/dev/design-system` (C01 plan §4.11):
  - Khối "Ô chọn và tab": `Select` có nhãn dài, `Tabs` hai tab điều khiển một tabpanel mẫu; câu chữ qua namespace `xem-truoc`.
  - file: `src/FrontEnd/src/app/xem-truoc/{KhoiCoBan.tsx hoặc khối mới, XemTruocThanhPhan.tsx, i18n/vi.json}`
  - xong khi: `npm run dev` thấy hai component ở thường và kiosk; `npm test`, lint, `tsc` sạch; `npm run build` không có chunk của trang xem trước (C01 T11 vẫn đúng).

## frontend-dev

- [x] T08 [frontend-dev] Hàm lọc `loc.ts` (§4.3):
  - `docCap`, `docMucDo`, `locThuTuc`, `luaChonLinhVuc` đúng chữ ký §4.3; `docCap`: chỉ `tinh` là tỉnh, còn lại `xa`; `docMucDo`: chỉ `toan-trinh`, `mot-phan`, còn lại `''`; `locThuTuc` giữ thứ tự của đầu vào.
  - file: `src/FrontEnd/src/features/danh-muc/{loc.ts, loc.test.ts}`
  - xong khi:
    - `npm test`, lint, `tsc` sạch.
    - Test với `danhMucMau` (T04): AC-1 ("ho tich" ra mọi thủ tục lĩnh vực Hộ tịch); AC-12 ("1.001193" chỉ ra "Thủ tục đăng ký khai sinh"); từ khoá nhiều từ không phụ thuộc thứ tự; "thuy" khớp "Thủy" và "Thuỷ"; lọc kết hợp từ khoá + lĩnh vực + mức độ (AC-2) đúng giao; chỉ thủ tục thuộc cấp đang chọn; thủ tục cả hai cấp có ở cả hai; thứ tự đầu vào được giữ; `docCap('abc')` = `xa`, `docMucDo('abc')` = `''`; `luaChonLinhVuc` chỉ lĩnh vực có thủ tục ở cấp đó, thêm lĩnh vực đang chọn nếu có trong dữ liệu mà 0 thủ tục ở cấp này.
    - Đo: lọc 1.000 mục với từ khoá 3 từ < 50 ms trong Vitest (cơ sở cho AC-4).

- [x] T09 [frontend-dev] [P] `ThongKe`, `ThanhLoc` và câu chữ (§4.4, §4.7):
  - `ThongKe`: đúng 3 ô, số qua `dinhDangSo`, nhãn qua `t()`; không có ô hay nhãn "Ưu tiên" (BR-6). Màu viền trái theo prototype nhưng chỉ dùng token (`--color-primary`, `--color-success`, `--color-warning`).
  - `ThanhLoc`: `SearchBox` (không truyền `soKetQua`), hai `Select`, `Button` "Xoá bộ lọc" (`secondary`, icon `X`) luôn hiện, `ViewToggle`; nhận mọi giá trị và hàm qua props (không tự đọc địa chỉ).
  - `i18n/vi.json` đủ khoá §4.7, `i18n/index.ts` (`napNgonNguDanhMuc`), `*.module.css` (hàng lọc xuống dòng ở khổ hẹp).
  - file: `src/FrontEnd/src/features/danh-muc/{ThongKe.tsx, ThanhLoc.tsx, ThongKe.module.css, ThanhLoc.module.css, i18n/vi.json, i18n/index.ts}` và test cạnh từng tệp
  - xong khi:
    - Lint (không chuỗi chữ viết thẳng trong JSX), `tsc`, test xanh.
    - Test: ba ô đúng số; nhập 267 thủ tục xã → ô xã ghi `267` (AC-7) khi dữ liệu đổi; không có chữ "Ưu tiên" (AC-8); nút "Xoá bộ lọc" có mặt khi chưa lọc gì và gọi hàm truyền vào (AC-3); `Select` lĩnh vực có "Tất cả lĩnh vực" + "Tên (n)".
    - Chưa nối route, chưa có `app/i18n.d.ts` cho namespace mới — T11 làm; test import `i18n/index.ts` trực tiếp.

- [x] T10 [frontend-dev] Màn hình `DanhMuc` (§4.1, §4.2, §4.4, §4.5):
  - `DanhMuc.tsx` (h1 ẩn + `QueryState` với `useDanhMucThuTuc()`, khung chờ `Skeleton dang="the"`) và `DanhMucNoiDung.tsx`: `useDanhSachUrl({ boLoc: ['lv', 'md'] })`; ghi `cap=xa` bằng `replace` khi thiếu hoặc sai (giữ `trang`, `ma`); `Tabs` (đổi tab → `dat({ cap, lv: null })`); vùng `tabpanel`; dòng số kết quả (`aria-live="polite"`); khối "Không tìm thấy lĩnh vực" (nút "Xem toàn bộ danh mục" → `xoaBoLoc()`, rồi đưa con trỏ về ô tìm bằng `ref`); `EmptyState` (`nutXoaTrenThanhLoc = true`); `DanhSachThuTuc` của F03 với `soMucMoiTrang={25}`, `capTieuDeThe={2}`, `tieuDeBang`, `trang`, `onDoiTrang` (§4.4, §4.5). **Không** gắn popup (F03 đã gắn `ThuTucPopup` trong `Layout`), không gọi `useMoThuTuc` hay `linkDvc` trực tiếp, không import `ThuTucCard`/`cotThuTuc`.
  - Chừa chỗ (comment) ngay trên danh sách cho dòng "Nhớ đăng xuất khi dùng xong" của F09; không làm dòng đó.
  - file: `src/FrontEnd/src/features/danh-muc/{DanhMuc.tsx, DanhMucNoiDung.tsx, DanhMuc.module.css, DanhMuc.test.tsx}`
  - xong khi:
    - Lint, `tsc`, `npm test` xanh. Test trong `MemoryRouter` + `fetch` giả (`danhMucMau`):
      - AC-2: chọn "Hộ tịch" + "Toàn trình" → dòng "<n> thủ tục (đang lọc)"; mở tab Cấp xã chưa lọc với 266 thủ tục → "266 thủ tục", không có "(đang lọc)".
      - AC-3: tab Cấp tỉnh + "Đất đai" + "Một phần" + "the chap" → bấm "Xoá bộ lọc" → ô tìm trống, hai ô chọn về "tất cả", vẫn tab Cấp tỉnh, không còn `trang`; nút có ở cả hai tab khi chưa lọc.
      - AC-5: `?cap=xa&lv=ho-tich` → tab xã, đã lọc Hộ tịch.
      - AC-9: 60 kết quả → 3 trang (25, 25, 10); `?trang=2` → dòng đầu là kết quả thứ 26.
      - AC-10: địa chỉ có `cap`, `lv`, `q` sau khi chọn và gõ; `?cap=tinh&trang=3` mở đúng trang 3; vào `/thu-tuc` trần → địa chỉ thành `?cap=xa`; `cap=abc`, `md=abc` → xã, tất cả mức độ, không báo lỗi.
      - AC-11: `?lv=khong-co` → "Không tìm thấy lĩnh vực" + nút "Xem toàn bộ danh mục"; không có mã lỗi, không có chữ từ địa chỉ; bấm nút → danh sách đầy đủ, con trỏ ở ô tìm.
      - AC-14: "xyzxyz" + lĩnh vực → thông báo "Không tìm thấy thủ tục phù hợp với 'xyzxyz'" + 4 gợi ý bằng chữ, **không** có nút "Xoá bộ lọc" trong vùng thông báo; nút trên thanh lọc vẫn có và đưa về danh sách đầy đủ trang 1.
      - AC-16: khổ 375 → thẻ, không `ViewToggle`; khổ 768 → thẻ, có nút; khổ 1280 → bảng; chọn dạng ở đây rồi đọc `useCachXem` ở nơi khác → cùng giá trị.
      - AC-6, AC-15: bấm tên thủ tục đổi địa chỉ thêm `ma` mà vẫn giữ `cap`, `lv`, `md`, `q`, `trang`; liên kết "Xem và nộp trên Cổng DVC" là `<a target="_blank" rel="noopener noreferrer">` đúng địa chỉ `lien-ket.md` §2, bấm không đổi địa chỉ trang (dùng `DanhSachThuTuc` thật của F03; popup không cần dựng vì nằm ở `Layout`, test kiểm địa chỉ).
      - Lỗi API → `ErrorState` có "Thử lại"; mã tra cứu chỉ khi `loi-he-thong`.
    - `grep -P` ký tự vô hình sạch.

## ui-core-dev (nối route)

- [x] T11 [ui-core-dev] Nối route và đo kích thước (§4.1, §4.7, §5):
  - `app/routes.tsx`: `danh-muc` dùng `DanhMuc` nạp lười như `TrangChu` (`React.lazy` + `napNgonNguDanhMuc()` song song); bỏ `TrangTam` ở route này (giữ cho `linh-vuc` tới F05).
  - `app/i18n.d.ts`: thêm namespace `danh-muc`.
  - Báo kích thước gzip (từng tệp trong `wwwroot/assets`) trước và sau: entry, `vendor`, chunk `danh-muc`, `grid`, tổng JS tải đầu khi mở `/thu-tuc` ở 375 px và 1280 px (cách đo như F00 T09). Ghi cả danh sách chunk nạp thêm khi mở popup.
  - file: `src/FrontEnd/src/app/{routes.tsx, i18n.d.ts}`; sửa `Layout.test.tsx` hoặc test route nếu đang kỳ vọng `TrangTam` ở `/thu-tuc`
  - xong khi:
    - `npm run build`, `npm test`, lint, `tsc` sạch; mở `/thu-tuc` ở `dotnet run` (nguồn Mẫu, `npm run build` trước) thấy đủ màn hình với dữ liệu mẫu 408 thủ tục.
    - Tổng JS tải đầu ở `/thu-tuc` ≤ 200 KB gzip ở cả 375 và 1280 px. **Vượt: dừng và báo người dùng** (rủi ro 2), không tự cắt tính năng.
    - `wwwroot` không có source map; chunk popup chỉ nạp khi có `ma` hoặc khi bấm (nếu F03 chưa xong: ghi vào báo cáo để kiểm lại).

## code-reviewer

- [ ] T12 [code-reviewer] Rà soát F04 (sau T11) — ghi `result/review.md`:
  - BE: R1–R7 (§3.2); không trường ngoài hợp đồng; không `[DanhMucQuery]`; kiểu TS khớp record C#.
  - FE: mọi chữ qua `t()`; không `dangerouslySetInnerHTML`; `cap`/`md` theo danh sách cho phép; từ khoá, mã lĩnh vực trên địa chỉ không hiện thành chữ trong thông báo lỗi; mọi ghi địa chỉ của F04 là `replace` (việc mở popup nằm trong `useMoThuTuc` của F03); không import chéo `features/*`→`app`; `core` không import `features`.
  - Hiệu năng: `tim` tính một lần; lọc không chạy lại khi chỉ đổi trang; kích thước chunk khớp báo cáo T11.
  - Truy vết BR/AC (`plan.md` §7) đủ task và test.
  - file: `.specify/specs/F04-danh-muc-thu-tuc/result/review.md`
  - xong khi: mọi phát hiện mức Chặn có người sở hữu và đã sửa; ghi rõ phần chưa kiểm được vì chờ F03.

## tester

- [x] T13 [tester] Viết `testcases.md` (làm được ngay sau khi có plan và tasks):
  - Mỗi BR, AC của spec có ít nhất một ca; thêm các ca ngoài AC: `cap`/`md` lạ, `lv` đúng nhưng 0 thủ tục ở tab này, `trang` quá lớn, dữ liệu rỗng, 304/ETag sau khi nhập lại, NVDA đọc dòng số kết quả (thử tay), thao tác chỉ bàn phím (tab, Select, Pager).
  - file: `.specify/specs/F04-danh-muc-thu-tuc/testcases.md`
  - xong khi: bảng truy vết BR/AC → ca đủ, không AC nào thiếu; chỗ phụ thuộc F03 (AC-6, AC-13, AC-15) đánh dấu rõ.

- [x] T14 [tester] Test tích hợp PostgreSQL (sau T03):
  - `DanhMucServiceTrenPostgreSql` (lớp con của `DanhMucServiceContract`, `DbThuNghiem`), cùng mẫu `ThongTinTrungTamServiceTrenPostgreSql`.
  - Tương đương hai nguồn: nạp `TepDuLieuMau.Nhung` vào DB riêng, DTO của `DanhMucService` trên `NguonDuLieuPostgreSql` và `NguonDuLieuMau` tuần tự hoá giống từng byte, cả hai API.
  - AC-7: nhập lại bằng công cụ nhập có thêm 1 thủ tục xã → `/api/thu-tuc` trả thêm 1 thủ tục xã, `ETag` đổi, yêu cầu kế tiếp không trả 304 cũ.
  - file: `src/BackEnd/DichVuCong.Tests/Integration/DanhMuc/`
  - xong khi: xanh với DB thật (bỏ qua có thông báo khi không có DB thử); báo cáo trong `result/test.md`.

- [x] T15 [tester] E2E, hiệu năng, kết quả (sau T11 và T12):
  - `e2e/danh-muc.spec.ts`: AC-4 (khổ 375, 4G giả lập, bản 1.000 thủ tục dựng bằng `page.route` trả `/api/thu-tuc`; đo từ phím cuối tới khi dòng số kết quả đổi, lặp 10 lần lấy giá trị chậm nhất ≤ 200 ms — cách đo như C01 AC-25, ghi rõ vào `result/test.md`), AC-6, AC-10, AC-13, AC-15 (tab mới, địa chỉ đúng `lien-ket.md` §2, popup không mở), AC-16 ở 375, 768, 1280, kiosk 1080×1920; axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) ở thường và kiosk, cả tab xã và tỉnh; không cuộn ngang ở 320 px.
  - Lighthouse mobile `/thu-tuc` (3 lần, bản `dotnet publish -c Release`) ≥ 85; tổng JS tải đầu ≤ 200 KB ở 375 và 1280 px; không yêu cầu nào > 0,6 giây khi tải trang (F00 AC-18).
  - p95 `GET /api/thu-tuc` và `/api/linh-vuc` ≤ 300 ms với 1.000 yêu cầu trên bộ 1.000 thủ tục (đặt giới hạn tần suất đủ lớn khi đo — F00 AC-10).
  - Thử tay: NVDA (tab, ô chọn, dòng số kết quả), Unikey Telex/VNI trong ô tìm, tab + Select bằng bàn phím.
  - Chạy lại AC chờ F03 (AC-6, AC-13, AC-15) khi F03 xong; chuyển `trang_thai` spec sang `xong` chỉ khi mọi AC đạt.
  - file: `src/FrontEnd/e2e/danh-muc.spec.ts`, `.specify/specs/F04-danh-muc-thu-tuc/result/test.md`
  - xong khi: `result/test.md` ghi kết quả từng AC, số đo AC-4 / p95 / Lighthouse / kích thước JS, và lỗi (nếu có) giao đúng agent sở hữu tệp.

## Tóm tắt

| Agent | Task | Số task |
|---|---|---|
| db-dev | — | 0 |
| backend-dev | T01, T02, T03 | 3 |
| chatbot-dev | — | 0 |
| ui-core-dev | T04, T05, T06, T07, T11 | 5 |
| frontend-dev | T08, T09, T10 | 3 |
| code-reviewer | T12 | 1 |
| tester | T13, T14, T15 | 3 |
| **Tổng** | | **15** |
