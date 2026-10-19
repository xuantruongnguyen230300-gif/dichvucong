# F03 · Thủ tục thường gặp và popup chi tiết — tasks

`[P]` = chạy song song được với task liền trước. Mục nhắc tới (§…) là của `plan.md`.

Điều kiện bắt đầu:

- **Làm ngay:** T01 (backend-dev), T03 (frontend-dev), T09 (tester). T01 và T03 chạm file khác nhau nên chạy song song.
- **F04 T01 chờ phần `ThoiHanThuTuc` của F03 T01** (F04 dùng `ThoiHanThuTuc.Chon` cho `thoiHan` của danh mục — plan §3.1): backend-dev làm `ThoiHanThuTuc` + test đầu tiên trong T01 và bàn giao ngay, rồi làm tiếp phần còn lại của T01.
- T02 sau T01. T04 sau T03. T05 sau T03 và T04. T06 sau T05. T07 sau T05; riêng phần dữ liệu thật của T07 chờ `useDanhMucThuTuc()` của F04 (`core/api/danhMucThuTuc.ts`, F04 §3.1 — hợp đồng đã chốt, §3.2) — làm trước phần giao diện bằng `fetch` giả đúng hình dạng đó.
- Thứ tự ui-core-dev / frontend-dev xen kẽ (T03 → T04 → T05 → T06) vì `app/` thuộc ui-core-dev còn `features/thu-tuc/` thuộc frontend-dev: T04 phải xong trước khi `useTranslation('thu-tuc')` qua được `tsc`; T06 gắn vào `Layout` thứ đã có sau T05.
- db-dev, chatbot-dev: không có task. Không có migration.
- Đã có: F00 T18 (cache `danh-muc` theo lần nhập), F00 T26/T29 (`INguonDuLieu`, nguồn Mẫu), C01 (mọi component ở §1), F08 (`useTieuDeTabTam`, `common:mien-tru`, `common:khong-tim-thay.thu-tuc`, `RanhGioiKhung`).
- Quy ước chung cho mọi task: không gõ `\uXXXX` qua Edit hoặc Bash (ký tự thoát bị ghi thành ký tự thật, vô hình); cần ký tự vô hình hay thoát thì sinh bằng file script, rồi kiểm lại file: `grep -rnP "[\x{200B}-\x{200F}\x{FEFF}]" <thư mục đã sửa>` không ra dòng nào. Câu chữ giao diện qua i18n. Build C# coi cảnh báo là lỗi.

- [x] T01 [backend-dev] Service chi tiết thủ tục + hàm thời hạn (§3.1 phần Truy vấn, Quy tắc thời hạn; §2):
  - `Features/ChiTietThuTuc/`: các record DTO đúng §3.1; `IChiTietThuTucService` + `ChiTietThuTucService` nhận `INguonDuLieu` (không `AppDbContext`), dùng `DauTienAsync` của `TruyVan`; chiếu sang anonymous rồi ánh xạ sang record mới bằng C# sau khi lấy dữ liệu; tên lĩnh vực qua truy vấn khoá chính trên `nguon.LinhVucs`.
  - Kiểm định dạng mã `^[A-Za-z0-9._-]{1,20}$` (`[GeneratedRegex]`) **trước** khi truy vấn; sai → trả `null`, không chạm nguồn dữ liệu.
  - `ThoiHanThuTuc` (`LamRo`, `Chon(string? thoiHan, IEnumerable<string?> thoiHanCacCachThuc)`) public static, hàm thuần; áp `LamRo` cho `ThoiHan` của từng cách thức. **Làm và bàn giao đầu tiên** (F04 T01 chờ file này).
  - `MucDo` đổi sang `"toan-trinh"` / `"mot-phan"` bằng `switch`.
  - Không `StartsWith`/`EndsWith`/`Contains` kiểu chuỗi trong `Features/` (test `QuyTacTruyVanTests`).
  - Test hợp đồng: `ChiTietThuTucServiceContract` (lớp trừu tượng; hàm trừu tượng dựng `INguonDuLieu` từ `TepDuLieuMau`) + `ChiTietThuTucServiceTrenMau`; bộ dữ liệu thử `DuLieuThu/ThuTucThu.cs` dựng bằng C# (dùng lại được cho lớp con PostgreSQL của tester, T10).
  - file: `src/BackEnd/DichVuCong.Api/Features/ChiTietThuTuc/{ChiTietThuTucDtos.cs, ChiTietThuTucService.cs, ThoiHanThuTuc.cs}`, `src/BackEnd/DichVuCong.Tests/Api/{ChiTietThuTucServiceContract.cs, ChiTietThuTucServiceTrenMau.cs, ThoiHanThuTucTests.cs, DuLieuThu/ThuTucThu.cs}`
  - xong khi:
    - `dotnet build` sạch, `dotnet test` xanh (kể cả `KienTrucTests`, `QuyTacTruyVanTests`).
    - Test hợp đồng trên nguồn Mẫu: đủ trường §3.1; `mucDo` đúng chuỗi; giấy tờ (1,0), (0,1), (null,null) giữ nguyên; thủ tục không có yêu cầu / căn cứ / kết quả → `null` hoặc danh sách rỗng; thứ tự trình tự, giấy tờ, căn cứ giữ nguyên như lưu; mã không có trong dữ liệu → `null`; mã sai định dạng (rỗng, 21 ký tự, `abc<b>x</b>`, có dấu cách, `../x`) → `null` và nguồn giả không bị truy vấn lần nào; gọi hai lần cho cùng kết quả và không đổi đối tượng của nguồn.
    - Test `ThoiHanThuTuc`: `"Khác"`, `"1 Khác"`, `"  3  KHÁC "`, `"khac"`, rỗng, toàn khoảng trắng, `null` → `null`; `"5 ngày làm việc"`, `"Khác biệt theo quy định"` → giữ nguyên; thời hạn thủ tục không rõ thì lấy cách thức rõ đầu tiên; không có cách thức rõ → `null`; `CachThuc[].ThoiHan` "1 Khác" → `null`.
    - Với file nhúng thật (kiểm trong T02): mã 1.001193 → `thoiHan` `null`.

- [x] T02 [backend-dev] Endpoint `GET /api/thu-tuc/{ma}` (§3.1) — sau T01:
  - `ChiTietThuTucController`: `[Route("api/thu-tuc")]`, `[HttpGet("{ma}")]` + `[HttpHead("{ma}")]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`; **không** gắn `[DanhMucQuery]`; service trả `null` → `NotFound()`.
  - `AddChiTietThuTuc()`; `AddApiServices` gọi hàm này.
  - Test HTTP với service giả và `IPhienBanDuLieu` giả (mẫu `ThongTinTrungTamTests`, `DanhMucCacheTests`).
  - file: `src/BackEnd/DichVuCong.Api/Features/ChiTietThuTuc/{ChiTietThuTucController.cs, ChiTietThuTucServiceCollectionExtensions.cs}`, `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs`, `src/BackEnd/DichVuCong.Tests/Api/ChiTietThuTucTests.cs`
  - xong khi:
    - Build sạch, `dotnet test` xanh.
    - Test HTTP: 200 JSON camelCase đủ trường, trường null vẫn có mặt; mã lạ → 404, có `code` = `khong-tim-thay` và `maTraCuu`, thân không chứa mã; mã sai định dạng → 404; POST → 405 (`phuong-thuc-khong-hop-le`); HEAD → 200 không thân; 200 có `ETag` và `Cache-Control: no-cache`; `If-None-Match` khớp → 304 và service không chạy; hai mã khác nhau → hai kết quả khác nhau (cache theo đường dẫn); `?x=1` và `?x=2` cùng một mục cache (số lần service chạy = 1); 404 không bị cache (gọi hai lần → service chạy hai lần); `RateLimiting:DanhMuc` = 1 → yêu cầu thứ hai 429.
    - Test với file nhúng thật (nguồn Mẫu, không DB): `/api/thu-tuc/1.001193` trả "Thủ tục đăng ký khai sinh", `linhVuc` "Hộ tịch", `mucDo` `toan-trinh`, `thoiHan` `null`, 33 giấy tờ; mã lớn nhất 1.013229 trả 200.
    - Chạy tay với `dotnet run` (profile `https`, nguồn Mẫu): `curl https://localhost:7157/api/thu-tuc/1.001193` đúng JSON ở §3.1; response không có trường nào ngoài §3.1; `/api/thu-tuc/9.999999` → ProblemDetails 404.

- [x] T03 [frontend-dev] [P] Nền tảng `features/thu-tuc/` (§4.1, §4.6) — làm ngay, không phụ thuộc BE:
  - `types.ts` (`MucThuTuc` với `tenLinhVuc`, `MucDoThuTuc` — §3.2), `maThuTuc.ts` (`KHOA_MA`, `laMaHopLe`), `linkDvc.ts`.
  - `api/chiTietThuTuc.ts`: kiểu `ChiTietThuTuc`, `MucDoThuTuc`; `layChiTietThuTuc`; `useChiTietThuTuc` (khoá `['chi-tiet-thu-tuc', ma]`, `enabled` khi mã hợp lệ, không thử lại khi 404); `useNapTruocChiTiet`.
  - `i18n/vi.json` (nhóm khoá §4.6, câu theo spec và prototype) + `i18n/index.ts` (`napNgonNguThuTuc`, theo mẫu `features/trang-chu/i18n` nhưng **nhớ promise** để gọi nhiều lần chỉ nạp một lần và dùng được với `use()`).
  - file: `src/FrontEnd/src/features/thu-tuc/{types.ts, maThuTuc.ts, linkDvc.ts, api/chiTietThuTuc.ts, i18n/vi.json, i18n/index.ts}` và test cạnh từng file
  - xong khi:
    - `npm test`, `npm run lint` sạch; `tsc` sạch sau khi T04 xong.
    - `laMaHopLe`: `1.001193`, `9.999999`, `2.000815` đúng; rỗng, 21 ký tự, `abc<b>x</b>`, có dấu cách, `../x`, `1.001193%20` sai.
    - `linkDvc('1.001193')` bằng đúng chuỗi `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.001193&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD`; `linkDvc('a b/c')` có `keyword=a%20b%2Fc`.
    - `layChiTietThuTuc('1.001193')` gọi `/api/thu-tuc/1.001193`; 404 ném `ApiError` có `status` 404 và `code` `khong-tim-thay`; `useChiTietThuTuc('abc<b>x</b>')` không gọi `fetch`; `useChiTietThuTuc('9.999999')` khi 404 không thử lại; `useNapTruocChiTiet` không gọi `fetch` với mã sai định dạng.

- [x] T04 [ui-core-dev] Khai báo namespace `thu-tuc` và nạp ở trang chủ (§4.8 mục 1, 2) — sau T03:
  - `app/i18n.d.ts`: thêm `thu-tuc` vào `resources` (kiểu từ `features/thu-tuc/i18n/vi.json`).
  - `app/routes.tsx`: hàm `lazy` của trang chủ thêm `napNgonNguThuTuc()` vào `Promise.all` (tối ưu để namespace về song song; khối vẫn tự nạp nếu thiếu). Nếu task F02 T10 đã thêm thì bỏ qua và ghi rõ trong báo cáo. Đọc lại file ngay trước khi sửa (F02, F04, F05 cũng sửa).
  - file: `src/FrontEnd/src/app/{i18n.d.ts, routes.tsx}`
  - xong khi:
    - `tsc` sạch: `useTranslation('thu-tuc')` với khoá có trong `vi.json` qua; khoá gõ sai báo lỗi build.
    - `npm test` sạch (test `routes`/`Layout` hiện có vẫn xanh); `npm run lint` sạch.

- [x] T05 [frontend-dev] Popup chi tiết và hook mở/đóng (§4.2, §4.3, §5 phần hiện popup ngay) — sau T03, T04 (dữ liệu thật sau T02):
  - `useMoThuTuc` (`mo`, `dong`, nhánh `push` + `state.popupThuTuc`, nhánh `replace`, kiosk dùng `replace`, `preventScrollReset`, giữ tham số khác).
  - `ThuTucPopup` (đọc `ma`, nạp lười `PopupChiTiet` + `napNgonNguThuTuc()`, `key={ma}`; xuất `napTruocPopupChiTiet`).
  - `PopupChiTiet` (tải, 404 và mã sai định dạng, lỗi khác với `ErrorState`, nút "Đóng"; `useTieuDeTabTam`) và `ChiTietThuTuc` (đủ mục §4.3, ẩn mục trống, thời hạn "Chưa ghi rõ", số bản, căn cứ chỉ chữ, miễn trừ, một liên kết `linkDvc` ở chân popup, chỗ cho dòng nhắc của F09).
  - CSS Modules chỉ dùng token; popup ở 375 px toàn màn hình, không cuộn ngang.
  - file: `src/FrontEnd/src/features/thu-tuc/{useMoThuTuc.ts, ThuTucPopup.tsx, PopupChiTiet.tsx, ChiTietThuTuc.tsx, *.module.css}` và test cạnh file
  - xong khi:
    - Vitest (`fetch` giả theo đường dẫn; router bộ nhớ):
      - `useMoThuTuc`: `mo` thêm `ma` giữ nguyên `q`, `lv`, `trang`; ngoài kiosk `navigate(-1)` khi đóng và địa chỉ về như trước (AC-17); mở thẳng bằng địa chỉ có `ma` rồi đóng → địa chỉ bỏ `ma`, không rời trang (AC-15, AC-16); ở kiosk mở rồi đóng không thêm mục lịch sử.
      - Popup: thủ tục đủ dữ liệu có đủ 7 mục theo thứ tự §4.3; mỗi mục trống không có tiêu đề và không có chỗ trống (AC-23: có / không có "Yêu cầu, điều kiện"); giấy tờ (1,0) hiện "Bản chính: 1 · Bản sao: 0", (null,null) chỉ có tên (AC-23); `thoiHan` null → "Chưa ghi rõ — xem trên Cổng DVC Quốc gia"; mục "Căn cứ pháp lý" không có `<a>` và không có phần tử Tab được; không có căn cứ → không có mục mà vẫn có lời miễn trừ đúng câu BR-7 (AC-6); đúng một liên kết "Xem và nộp trên Cổng DVC" có `href` bằng `linkDvc` và `target="_blank"` + `rel` có `noopener noreferrer` (AC-9, AC-10); không có nút "Nộp trực tuyến".
      - 404 và `ma=abc<b>x</b>`: Modal có câu `common:khong-tim-thay.thu-tuc` và nút "Đóng", không có chữ của mã trên trang, mã sai định dạng không gọi `fetch` (AC-18); lỗi mạng → `ErrorState` có "Thử lại" (bấm gọi lại `fetch`).
      - Tiêu đề tab = tên thủ tục khi có dữ liệu, về tiêu đề cũ khi đóng (AC-21); `DC.title` của `DacTaTrang` không đổi.
      - Esc, ✕, bấm vùng tối đều gọi đóng; con trỏ trong popup (kế thừa C01 — chỉ kiểm có tích hợp).
    - Chạy tay (`npm run dev` + `dotnet run`, nguồn Mẫu): `/?ma=1.001193` mở thẳng popup; Quay lại, Esc, ✕ hoạt động; ở 375 px toàn màn hình; popup thủ tục dài (1.013229) cuộn trong thân, tiêu đề và ✕ luôn thấy.
    - `npm run build`: báo kích thước gzip của chunk popup và mức tăng của chunk chính (mục tiêu chunk popup ≤ 12 KB, chunk chính tăng ≤ 2 KB).

- [x] T06 [ui-core-dev] Gắn popup vào `Layout` (§4.8 mục 3) — sau T05:
  - `app/layout/Layout.tsx`: `<RanhGioiKhung><ThuTucPopup /></RanhGioiKhung>`; cập nhật `Layout.test.tsx`.
  - file: `src/FrontEnd/src/app/layout/{Layout.tsx, Layout.test.tsx}`
  - xong khi:
    - Test: địa chỉ không có `ma` → không có `role="dialog"` và không gọi API chi tiết; `/?ma=1.001193`, `/thu-tuc?ma=1.001193&lv=ho-tich`, `/linh-vuc?ma=1.001193` đều mở popup đúng thủ tục; thứ tự Tab của `Layout` không đổi (test hiện có vẫn xanh).
    - Chunk popup không nằm trong phần tải ban đầu: `npm run build` rồi kiểm `wwwroot/index.html` không `modulepreload` chunk popup; báo kích thước JS ban đầu so với 147 KB trước F03.

- [x] T07 [frontend-dev] Danh sách thủ tục và khối thường gặp (§4.4, §4.5, §5) — sau T05; phần dữ liệu thật chờ F04:
  - `ThuTucCard`, `cotThuTuc`, `DanhSachThuTuc` (nạp trước chunk popup bằng `setTimeout` ~2 giây; `onPointerDown`/`onFocus` gọi `useNapTruocChiTiet`), `KhoiThuongGap` (tìm, chip, `ViewToggle`, số đếm, phân trang 12, `EmptyState`, `QueryState`).
  - Dùng `useDanhMucThuTuc()` và `ThuTucDanhMuc` (có `tim`, `tenLinhVuc`) của F04 (`core/api/danhMucThuTuc.ts`); lọc bằng `tim`, không tự ghép chuỗi tìm kiếm. Chưa có thì viết trước với `fetch` giả trả `/api/thu-tuc` và `/api/linh-vuc` đúng `ThuTucRutGonDto` / `LinhVucDto` của F04 §3.1.
  - `KhoiThuongGap` không props, tự bọc `h2`, tự xử lý tải/lỗi/rỗng và tự nạp namespace (`Suspense` + `use(napNgonNguThuTuc())`) — F02 chỉ đặt `<KhoiThuongGap />` (§4.5).
  - Chừa chỗ (không làm) cho dòng nhắc đăng xuất của F09 phía trên danh sách.
  - file: `src/FrontEnd/src/features/thu-tuc/{ThuTucCard.tsx, cotThuTuc.tsx, DanhSachThuTuc.tsx, KhoiThuongGap.tsx, *.module.css}` và test cạnh file
  - xong khi:
    - Vitest (danh mục giả 43 mục thường gặp có khai sinh 1.001193 thứ 2 và các mục Đất đai "thế chấp"; thêm mục không thường gặp để kiểm bị loại):
      - Gõ "dang ky the chap" → có "Đăng ký thế chấp" (AC-1); chọn chip "Đất đai" rồi gõ "the chap" → chỉ còn mục Đất đai có "thế chấp", số đếm đổi (AC-2); "1.001193" → chỉ khai sinh; "ho tich khai sinh" → mục Hộ tịch có "khai sinh" (AC-7).
      - Mở trang: chip "Tất cả" được chọn, "Hiển thị 43/43"; lĩnh vực không có mục thường gặp không có chip (AC-8); `lv` lạ trên địa chỉ → "Tất cả", không lọc; không có mục thường gặp nào → không vẽ khối.
      - 43 mục → 4 trang 12·12·12·7; trang 2 là mục 13–24; ở trang 3 chọn chip khác → trang 1 (AC-13); `q`, `lv`, `trang` ghi lên địa chỉ bằng `replace`, mở lại địa chỉ → cùng chip, từ khoá, trang (AC-19); số trang sai → trang 1 hoặc trang cuối (kế thừa C01).
      - Thứ tự theo `thuTuThuongGap`: "Thủ tục đăng ký kết hôn" (1.000894, thứ 1) trước "Thủ tục đăng ký khai sinh" (thứ 2) ở thẻ và bảng, còn đúng thứ tự sau khi chọn chip "Hộ tịch" (AC-22).
      - Bộ 16 mục bản đầu → "Hiển thị 16/16", 2 trang (12, 4), chip chỉ gồm "Tất cả" và lĩnh vực có trong 16 mục; bỏ 1 mục khỏi dữ liệu giả → "Hiển thị 15/15" (AC-20, phần FE).
      - Mỗi thẻ và mỗi dòng bảng của 1.001193 có đúng một liên kết "Xem và nộp trên Cổng DVC" cùng `href` với popup; không có nút "Nộp trực tuyến" (AC-10); bấm "Xem chi tiết" / tên thủ tục → địa chỉ có `ma` (AC-15).
      - Khổ 375: dạng thẻ, không có nút chuyển dạng; 768: thẻ, có nút; 1280: bảng, có nút; kiosk 1080: thẻ; chọn bảng ở 1280 rồi thu 375 → thẻ, nới lại → bảng; tải lại vẫn bảng (AC-5, AC-12) — dùng `datKhoMan` của `test-utils/khoMan`.
      - `KhoiThuongGap` render khi namespace chưa nạp: hiện `Skeleton`, sau đó đủ chữ (không hiện khoá thô); không props.
      - Không kết quả → `EmptyState` có nút "Xoá bộ lọc"; bấm → con trỏ về ô tìm.
    - Chạy tay: trang chủ có thể xem đủ 16 mục bản đầu (bằng dữ liệu mẫu và F04 đã có); thẻ thành hàng đầy ở 375, 600, 1024, 1280 px (AC-14).
    - `npm run build`: báo kích thước gzip chunk chính, `TrangChu`, chunk popup, `grid` trước và sau; JS ban đầu ≤ 200 KB gzip (dự kiến ≈ 170–175 KB); chunk trang chủ > 30 KB gzip thì báo ngay (rủi ro 2).

- [ ] T08 [code-reviewer] Review F03 (T01–T07) theo `CLAUDE.md`, `plan.md` → `.specify/specs/F03-thu-tuc-thuong-gap/result/review.md` — sau T07. Trọng tâm:
  - R1–R7 của F00 §9.4 (không `AppDbContext`, không `ToListAsync`, `Select` ra DTO, không navigation, không so sánh chuỗi theo văn hoá); không trả trường thừa; mã đi qua `encodeURIComponent`; ESLint i18n sạch; không `dangerouslySetInnerHTML`; `ma` không bao giờ hiện ra trang; không `[DanhMucQuery]` trên endpoint chi tiết; mọi link ra ngoài qua `ExternalLink`; không tên miền trong danh sách "Đã bỏ" của `lien-ket.md` §1; chunk popup không lọt vào phần tải ban đầu.
  - xong khi: có kết luận ĐẠT / KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được agent sở hữu file sửa.

- [x] T09 [tester] [P] `testcases.md` — làm ngay:
  - Đủ BR-1…BR-10, AC-1…AC-23; ghi rõ AC nào kiểm được sau T07 và AC nào chờ chức năng khác: AC-11 (danh mục F04, trợ lý F06), AC-20 (nhập bằng F01 ở PostgreSQL), AC-3 (mạng 4G giả lập, trên bản build), kiosk (F09).
  - Mỗi ca có cách làm, dữ liệu vào, kết quả mong đợi. Dữ liệu 43 mục thường gặp soạn riêng (chặn `GET /api/thu-tuc` như F08 làm với `/api/trung-tam`), không dựa vào bản đầu dữ liệu thật; AC-20 dùng 16 mục bản đầu.
  - Thêm ca ngoài spec nhưng có trong plan: mã sai định dạng không gọi API; `lv` lạ; không có thủ tục thường gặp; kiosk mở popup không thêm lịch sử; hai mã khác nhau không trùng cache; query ngẫu nhiên không thổi cache; 404 không bị cache; thời hạn "Khác" / "1 Khác" hiện "Chưa ghi rõ"; popup 1.013229 (lớn nhất) ở 375 px.
  - file: `.specify/specs/F03-thu-tuc-thuong-gap/testcases.md`
  - xong khi: mỗi BR/AC có ít nhất một ca.

- [x] T10 [tester] Chạy kiểm thử → `.specify/specs/F03-thu-tuc-thuong-gap/result/test.md` — sau T02, T06, T07 và hợp đồng F04 (AC-11 phần danh mục / trợ lý chờ F04, F06):
  - Integration với PostgreSQL: `Tests/Integration/ChiTietThuTuc/` — lớp con `ChiTietThuTucServiceTrenPostgreSql` của test hợp đồng (F00 T31); tương đương nguồn Mẫu và PostgreSQL: với từng mã trong 408 mã, cùng JSON; mã không có và mã sai định dạng → 404; đo p95 ≤ 300 ms (100 yêu cầu liên tiếp trên mã 1.013229 và 1.001193, sau khi tắt cache bằng khoá khác, rồi có cache).
  - E2E: `src/FrontEnd/e2e/thu-tuc-thuong-gap.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`; thêm tên file vào `testMatch`), khổ 375, 768, 1280, kiosk 1080×1920; axe-core ở popup (thường và kiosk); AC-3 bằng CDP giả lập 4G: bấm "Xem chi tiết" → popup trong thân ≤ 1 giây, nội dung đủ ≤ 1 giây.
  - Kiểm bảo mật nhanh: mọi liên kết ra ngoài trong popup, thẻ, bảng có `rel="noopener noreferrer"`; không `href` nào thuộc danh sách "Đã bỏ"; thân JSON không có trường ngoài §3.1; `Server` header không có; `?ma=<script>` không hiện ra trang.
  - AC-20: nhập `thu-tuc.xlsx` có sheet Thường gặp 16 dòng (F01), kiểm "Hiển thị 16/16"; bỏ 1 dòng, nhập lại → "Hiển thị 15/15" không build lại; đổi thứ tự → khối đổi theo (AC-22).
  - file: `src/BackEnd/DichVuCong.Tests/Integration/ChiTietThuTuc/`, `src/FrontEnd/e2e/thu-tuc-thuong-gap.spec.ts`, `src/FrontEnd/e2e/ban-build.config.ts`, `.specify/specs/F03-thu-tuc-thuong-gap/result/test.md`
  - xong khi: mọi ca có kết quả. Đạt hết (kể cả các ca chờ F04, F06, F09 đã chạy) → đổi `trang_thai` của `spec.md` sang `xong`.
