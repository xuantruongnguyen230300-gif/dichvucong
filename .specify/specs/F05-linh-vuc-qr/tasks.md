# F05 · Lĩnh vực và mã QR — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`.

Điều kiện bắt đầu:

- **Làm ngay** (không chờ gì):
  - backend-dev: T01.
  - ui-core-dev: T03, T04 (song song, không phụ thuộc BE).
  - tester: T10 (viết `testcases.md` từ spec và plan).
- frontend-dev: T05 sau T04 (cần `giaLapGiaoCat`); T06 sau T03 (cần gói `uqr` và nhóm chunk `qr`); T07 sau T05 và T06. Dữ liệu thật của quầy chờ T01, nhưng T05–T07 chạy bằng `fetch` giả nên không cần chờ.
- T02 (backend-dev) sau T01. T11 (tester) sau T02.
- T08 (ui-core-dev) sau T07: nối route, đo kích thước.
- T09 (code-reviewer) sau T08. T12 (tester) sau T08 và T09.
- db-dev, chatbot-dev: không có task trong F05 (không đổi bảng, cột, chỉ mục; trợ lý không đụng).
- Đã có từ F04, dùng lại không viết lại: `useLinhVuc()` (`core/api/linhVuc.ts`), `GET /api/linh-vuc`, `src/test-utils/danhMucMau.ts` (`taoLinhVuc`, `giaFetchDanhMuc`), `useDanhSachUrl`, `taoBoLocTuKhoa`, `dinhDangSo`.
- Không gõ `\uXXXX` qua Edit hay Bash. Mọi tệp mới/sửa: tìm ký tự vô hình bằng `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>`; chỉ được thấy ở chỗ chủ ý. Dữ liệu thử cần ký tự vô hình thì tạo bằng `String.fromCodePoint(0x200e)` (TS) hoặc mã thoát Unicode của C# trong tệp viết qua script.
- Các tệp `app/routes.tsx`, `app/i18n.d.ts`, `package.json`, `vite.config.ts` cũng bị F02, F03, F04 sửa: đọc lại ngay trước khi sửa, không ghi đè phần của task khác.
- Câu hỏi mở (`plan.md` §10): câu 1 (tên miền = `window.location.origin`), 3 (cấp của QR theo thủ tục), 4 (in lười = ghi chú vận hành BR-5), 6 (chú thích) **đã chốt 2026-10-13**; còn câu 2 (endpoint quầy riêng hay thêm vào `LinhVucDto` — nếu chọn thêm vào `LinhVucDto` thì bỏ T01, T02, T11). Không task nào bị chặn.

## backend-dev

- [x] T01 [backend-dev] Dịch vụ và endpoint `GET /api/linh-vuc/quay` (§3.1, §3.2):
  - `QuayLinhVucDtos.cs`: `QuayLinhVucDto(string LinhVucMa, int Quay)`.
  - `IQuayLinhVucService` + `QuayLinhVucService(INguonDuLieu)`: `LayAsync(ct)` theo §3.2 — `PhanCongLinhVucs.Where(p => p.Quay != null).Select(kiểu ẩn danh)` → `DanhSachAsync`; sắp theo `LinhVucMa` `StringComparer.Ordinal` trong C#; dựng DTO. R1–R5: không hàm async của EF, không sắp chuỗi trong truy vấn, không so sánh theo văn hoá.
  - `QuayLinhVucController`: `[Route("api/linh-vuc/quay")]`, `[HttpGet] [HttpHead]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, **không** gắn `[DanhMucQuery]`. Trả mảng trực tiếp (`[]` khi rỗng, không 404).
  - `AddQuayLinhVuc()`; `AddApiServices` gọi hàm này (`Program.cs` không đổi).
  - file: `src/BackEnd/DichVuCong.Api/Features/QuayLinhVuc/{QuayLinhVucDtos.cs, QuayLinhVucService.cs, QuayLinhVucController.cs, QuayLinhVucServiceCollectionExtensions.cs}`, `src/BackEnd/DichVuCong.Api/Common/Hosting/ApiHostingExtensions.cs`
  - xong khi:
    - `dotnet build src/BackEnd/DichVuCong.sln` sạch (cảnh báo = lỗi).
    - `QuyTacTruyVanTests` và test kiến trúc hiện có vẫn xanh.
    - Chạy tay (`dotnet run`, nguồn Mẫu): `curl -k https://localhost:7157/api/linh-vuc/quay` trả `[]`; `/api/linh-vuc` vẫn trả 75 lĩnh vực; response không có trường nào ngoài `linhVucMa`, `quay`.

- [x] T02 [backend-dev] Test dịch vụ và HTTP (§8):
  - `DuLieuThu/QuayLinhVucThu.cs`: bộ thử bằng C# (có quầy; `Quay` null; mã không có trong `linh_vuc`; mã sắp lẫn lộn; không dòng nào).
  - `QuayLinhVucServiceContract` (lớp trừu tượng, hàm `TaoNguon(TepDuLieuMau)`) + `QuayLinhVucServiceTrenMau` — cùng mẫu `DanhMucServiceContract` / `…TrenMau`.
  - `QuayLinhVucTests`: dựng như `DanhMucTests` (service giả, `IPhienBanDuLieu` giả).
  - file: `src/BackEnd/DichVuCong.Tests/Api/DuLieuThu/QuayLinhVucThu.cs`, `src/BackEnd/DichVuCong.Tests/Api/{QuayLinhVucServiceContract.cs, QuayLinhVucServiceTrenMau.cs, QuayLinhVucTests.cs}`
  - xong khi:
    - `dotnet test` xanh. Hợp đồng: chỉ dòng có quầy; thứ tự `LinhVucMa` Ordinal; `Quay` đúng; nguồn không dòng nào → `[]`; trên `TepDuLieuMau.Nhung` (phân công rỗng) → `[]` (AC-6).
    - HTTP: JSON camelCase `linhVucMa`, `quay`; 200 có `ETag` và `Cache-Control: no-cache`; `If-None-Match` khớp → 304 và service không chạy; đổi phiên bản → 200 dữ liệu mới; POST → 405 `phuong-thuc-khong-hop-le`; vượt giới hạn → 429 `qua-nhieu-yeu-cau`; `?x=1` và `?x=2` cùng một mục cache; service ném lỗi → 500 `loi-he-thong` có `maTraCuu`, không stack trace; rỗng → 200 `[]`; `GET /api/linh-vuc` vẫn chạy cùng lúc (hai route không đụng nhau).
    - Lớp trừu tượng không phụ thuộc nguồn nào, để tester (T11) viết lớp con PostgreSQL.

## ui-core-dev

- [x] T03 [ui-core-dev] [P] Thư viện QR và nhóm chunk riêng (§5):
  - `package.json`: thêm `uqr` (dependencies) và `jsqr` (devDependencies); cập nhật `package-lock.json`. Ghi lý do và kích thước vào báo cáo task (đã có ở `plan.md` §5: `uqr` 3,8 KB gzip, `jsqr` chỉ test).
  - `vite.config.ts`: thêm vào `codeSplitting.groups` nhóm `{ name: 'qr', test: <biểu thức khớp node_modules/uqr> }` cạnh nhóm `grid`; **không** thêm `uqr` vào `lopLoiVendor`. Sửa chú thích đầu tệp nếu cần.
  - `build/`: test nhỏ kiểm biểu thức nhóm `qr` khớp đường dẫn `node_modules/uqr/dist/index.mjs` (cả dấu `/` và `\`), không khớp `node_modules/react/...` và `src/...`.
  - file: `src/FrontEnd/{package.json, package-lock.json, vite.config.ts}`, test cạnh trong `src/FrontEnd/build/`
  - xong khi:
    - `npm ci`, `npm run lint`, `npx tsc -b`, `npm test` sạch; `npm run build` vẫn xanh (chưa có chunk `qr` vì chưa ai import `uqr` — kiểm lại ở T06, T08).
    - `npm audit --omit=dev` không có mức High/Critical.

- [x] T04 [ui-core-dev] [P] Giả lập `IntersectionObserver` cho test (§4.4, §8):
  - `src/test-utils/giaLapGiaoCat.ts`: `caiGiaoCat()` cài một `IntersectionObserver` giả lên `globalThis` và trả bộ điều khiển: `hienRa(phanTu)`, `hienRaHet()`, `an(phanTu)`, danh sách phần tử đang quan sát, các `options` đã nhận (`rootMargin`, `threshold`), số `observe`/`unobserve`/`disconnect`; `go()` trả lại trạng thái trước. Gọi callback đúng dạng `IntersectionObserverEntry` (`target`, `isIntersecting`).
  - Không đổi `test-setup.ts` (mặc định jsdom không có `IntersectionObserver`; code F05 coi là "hiện ngay").
  - file: `src/FrontEnd/src/test-utils/{giaLapGiaoCat.ts, giaLapGiaoCat.test.ts}`
  - xong khi: lint, `tsc`, test xanh; test chứng minh `hienRa` chỉ gọi callback cho phần tử đang được quan sát và `go()` khôi phục.

## frontend-dev

- [x] T05 [frontend-dev] Logic thuần, hook quầy, hook vẽ-khi-hiện (§3.1, §4.3, §4.4, §4.5):
  - `features/linh-vuc/linkQr.ts`: `taoLinkDanhMuc(cap, ma)` → `/thu-tuc?cap=xa&lv=ho-tich` (đường dẫn từ `DUONG_DAN.danhMuc`, mã qua `encodeURIComponent`); `capCuaLinhVuc(l)` = `l.soThuTucXa > 0 ? 'xa' : 'tinh'` (BR-1); `taoLinkQr(goc, l)` = `${goc}${taoLinkDanhMuc(capCuaLinhVuc(l), l.ma)}`. Liên kết ô và QR cùng dùng `capCuaLinhVuc`.
  - `features/linh-vuc/loc.ts`: `locLinhVuc(ds, tuKhoa)` bằng `taoBoLocTuKhoa` trên `tenTimKiem`, giữ thứ tự.
  - `features/linh-vuc/api/quayLinhVuc.ts`: kiểu `QuayLinhVuc`, `API_QUAY_LINH_VUC`, `KHOA_QUAY_LINH_VUC`, `useQuayLinhVuc()` (dựng `Map`, `retry: false`) qua `http` của `core/api`.
  - `features/linh-vuc/useHienTrenManHinh.ts`: một observer dùng chung (khởi tạo lười), `rootMargin: '0px'`, `threshold: 0`; ô hiện lần đầu → `true` rồi `unobserve`, không quay lại `false`; dọn đúng khi gỡ; không có `IntersectionObserver` → `true` ngay.
  - file: `src/FrontEnd/src/features/linh-vuc/{linkQr.ts, loc.ts, useHienTrenManHinh.ts, api/quayLinhVuc.ts}` và test cạnh từng tệp
  - xong khi:
    - `npm test`, lint, `npx tsc -b` sạch.
    - Test (`linkQr.test.ts`): `taoLinkQr('https://x.vn', { ma: 'ho-tich', soThuTucXa: 5 })` = `https://x.vn/thu-tuc?cap=xa&lv=ho-tich`; lĩnh vực có `soThuTucXa: 0` (chỉ cấp tỉnh) → `https://x.vn/thu-tuc?cap=tinh&lv=…`; `soThuTucXa: 1` → `cap=xa`; `capCuaLinhVuc` ở biên 0 và 1; `goc` khác (`http://localhost:5173`) → địa chỉ chứa đúng `goc` đó (AC-2); mã có ký tự lạ được mã hoá; `locLinhVuc` — AC-1 ("dat dai" ra "Đất đai"), nhiều từ không phụ thuộc thứ tự, từ khoá rỗng ra đủ, không khớp ra `[]`, giữ thứ tự; hook: dùng bộ giả T04 — `rootMargin` đúng `'0px'`, chỉ phần tử `hienRa` mới `true`, `an` sau đó không đổi lại `false`, `unobserve` sau khi hiện, thiếu `IntersectionObserver` → `true`; hook quầy: gọi đúng `/api/linh-vuc/quay`, `[]` → `Map` rỗng, lỗi 500 không thử lại.

- [x] T06 [frontend-dev] `QrLinhVuc` — phần vẽ QR, chunk nạp lười (§4.4, §5):
  - `QrLinhVuc.tsx`: `import { encode } from 'uqr'` (tĩnh, chỉ trong tệp này); `encode(link, { ecc: 'M', border: 0, boostEcc: true })`; `<svg viewBox="-4 -4 n+8 n+8" role="img" aria-label=… data-qr={ma} shape-rendering="crispEdges">`: một `<rect>` nền + **một** `<path>` gộp dãy ô đen theo hàng; màu bằng lớp CSS Module (`QrLinhVuc.module.css`: `fill` nền `var(--color-surface)`, mã `var(--color-text)`; rộng/cao 9 rem). Không `style` inline, không `dangerouslySetInnerHTML`.
  - Props: `link`, `ten`, `ma`. Nhãn từ `t('linh-vuc:qr.nhan', { ten })` (khoá thêm ở T07 — làm trước khoá trong `i18n/vi.json` nếu T07 chưa xong).
  - file: `src/FrontEnd/src/features/linh-vuc/{QrLinhVuc.tsx, QrLinhVuc.module.css, QrLinhVuc.test.tsx}`
  - xong khi:
    - lint, `tsc`, `npm test` sạch.
    - Test: giải mã bằng `jsqr` — dựng ảnh điểm RGBA từ `<path>`/ma trận (mỗi ô ≥ 4 điểm, có lề trắng 4 ô) rồi `jsQR` ra đúng `link`, với ba link dài ≈ 55, ≈ 100, ≈ 140 byte; `role="img"`, `aria-label` có tên lĩnh vực, `data-qr` đúng mã; đúng một `<path>`; `viewBox` có lề 4 ô; không thuộc tính `style`; hai mã khác nhau cho ma trận khác nhau.
    - `npm run build` ra chunk `qr-*.js` chỉ chứa `uqr` (ghi tên và kích thước gzip vào báo cáo; kiểm không có mã `src/` và không bị obfuscate — kiểm chính thức ở T08).

- [x] T07 [frontend-dev] Màn hình `LinhVuc` (§4.1–§4.4, §4.6):
  - `LinhVuc.tsx` (`<h1>` ẩn + `QueryState` với `useLinhVuc()`, khung chờ `Skeleton dang="the"`), `LinhVucNoiDung.tsx`: `useDanhSachUrl()` (chỉ `q`), `useQuayLinhVuc()` — khung chờ tới khi quầy xong hoặc lỗi (lỗi quầy → coi như không quầy, không báo); `SectionTitle cap={2}` + `phu` số lĩnh vực; dòng hướng dẫn; `SearchBox` (`soKetQua = ds.length`); lưới `<ul role="list" aria-label>`; rỗng → `EmptyState` (`doiTuong` "lĩnh vực", `nutXoaTrenThanhLoc = false`, `onXoaBoLoc` xoá từ khoá + đưa con trỏ về ô tìm).
  - `OLinhVuc.tsx`: `Card as="li"`; icon + `<Link>` (liên kết cả ô bằng `::after`, viền focus quanh ô) tới `taoLinkDanhMuc(soThuTucXa > 0 ? 'xa' : 'tinh', ma)`; dòng "n cấp xã · m cấp tỉnh"; dòng "Quầy X" **chỉ khi** có quầy (không render phần tử khi không có); `useHienTrenManHinh` trên chính `<li>`; chưa hiện → `KhungQr`; hiện → `<Suspense fallback={<KhungQr/>}>` + `lazy(() => import('./QrLinhVuc'))` (khai `lazy` ở cấp module; **không** `import` tĩnh `QrLinhVuc` hay `uqr` ở nơi nào khác); `KhungQr` cùng kích thước 9 rem; chú thích "Quét để xem thủ tục". `taoLinkQr(window.location.origin, ma)`.
  - `i18n/vi.json`, `i18n/index.ts` (`napNgonNguLinhVuc`), `*.module.css` (lưới `repeat(auto-fill, minmax(220px, 1fr))`, chỉ `var(--…)`, không cuộn ngang ở 320 px).
  - Chưa nối route, chưa có `app/i18n.d.ts` cho namespace mới — T08 làm; test import `i18n/index.ts` trực tiếp.
  - file: `src/FrontEnd/src/features/linh-vuc/{LinhVuc.tsx, LinhVucNoiDung.tsx, OLinhVuc.tsx, LinhVuc.module.css, OLinhVuc.module.css, i18n/vi.json, i18n/index.ts, LinhVuc.test.tsx}`
  - xong khi:
    - lint (không chuỗi chữ viết thẳng trong JSX), `tsc`, `npm test` sạch. Test trong `MemoryRouter` + `fetch` giả (mở rộng `giaFetchDanhMuc` bằng đường `/api/linh-vuc/quay` trong tệp test) + `caiGiaoCat()`:
      - AC-1: gõ "dat dai" → có ô "Đất đai".
      - AC-3: bấm ô "Chứng thực" → địa chỉ thành `/thu-tuc?cap=xa&lv=chung-thuc`; bấm ô lĩnh vực chỉ có thủ tục cấp tỉnh → `/thu-tuc?cap=tinh&lv=…`.
      - AC-5 (mức component): 75 ô, giả lập hiện 3 → đúng 3 `svg[data-qr]`; hiện thêm 2 → 5; hiện hết → 75 và không ô nào có hai `svg`; ô đã hiện rồi `an` → QR vẫn còn; chưa ô nào hiện → 0 QR và chưa tải `QrLinhVuc`.
      - AC-6: quầy `[]` → không có chữ "Quầy", "Nộp tại Trung tâm", "Chưa có thông tin quầy" ở ô nào, ô không có phần tử rỗng; quầy `[{ho-tich, 3}]` → chỉ ô Hộ tịch có "Quầy 3"; quầy trả lỗi 500 → lưới vẫn hiện, không quầy, không thông báo lỗi.
      - AC-7: bộ thử 75 lĩnh vực trong đó 18 chỉ cấp tỉnh → đủ 75 QR khi hiện hết; QR lĩnh vực chỉ cấp tỉnh giải mã (bằng `jsqr`) ra `cap=tinh` và `lv=<mã>`, lĩnh vực có thủ tục xã ra `cap=xa`; liên kết ô cùng cấp với QR.
      - AC-2: QR chứa `window.location.origin` (đặt `origin` khác trong test → QR đổi theo).
      - AC-8: mỗi QR đã vẽ có dòng "Quét để xem thủ tục" ngay dưới mã.
      - AC-9: chỉ chặn `/api/linh-vuc/quay` (mạng lỗi và 500) → vẫn đủ ô và QR, không dòng quầy, không thông báo lỗi, không phần tử trống; chỉ chặn `/api/linh-vuc` → "Chưa tải được dữ liệu." + "Thử lại".
      - Rỗng: "xyzxyz" → "Không tìm thấy lĩnh vực phù hợp với 'xyzxyz'" + gợi ý + nút "Xoá bộ lọc"; bấm nút → ô tìm trống, con trỏ ở ô tìm, đủ 75 ô. Dữ liệu `[]` → trang không lỗi, "0 lĩnh vực".
      - Lỗi `GET /api/linh-vuc` → `ErrorState` có "Thử lại"; mã tra cứu chỉ khi `loi-he-thong`.
      - Từ khoá lên địa chỉ (`?q=`), mở lại địa chỉ đó thì ô tìm đã điền và lưới đã lọc.
    - `grep -P` ký tự vô hình sạch.

## ui-core-dev (nối route)

- [x] T08 [ui-core-dev] Nối route, dọn `TrangTam`, đo kích thước (§4.1, §5):
  - `app/routes.tsx`: route `linh-vuc` dùng `LinhVuc` nạp lười (`React.lazy` + `napNgonNguLinhVuc()` song song), bỏ `TrangTam`.
  - `app/i18n.d.ts`: thêm namespace `linh-vuc`.
  - Xoá `app/TrangTam.tsx` và `TrangTam.module.css` nếu không còn nơi nào dùng (tìm lại trước khi xoá); sửa test route/`Layout` nếu đang kỳ vọng `TrangTam` ở `/linh-vuc`.
  - Báo kích thước gzip (từng tệp trong `wwwroot/assets`) trước và sau: entry, `vendor`, chunk `LinhVuc`, `QrLinhVuc`, `qr`, chunk dùng chung kéo theo, tổng JS khi mở `/linh-vuc` ở 375 px và 1280 px sau khi QR đầu tiên vẽ xong (cách đo như F00 T09). Ghi tổng JS khi mở `/` để so (không được tăng).
  - file: `src/FrontEnd/src/app/{routes.tsx, i18n.d.ts}`; xoá `src/FrontEnd/src/app/TrangTam.tsx`, `TrangTam.module.css`
  - xong khi:
    - `npm run build`, `npm test`, lint, `npx tsc -b` sạch; `dotnet run` (nguồn Mẫu, sau `npm run build`) mở `/linh-vuc` thấy 75 ô, QR vẽ khi cuộn, không ô nào có dòng quầy.
    - `wwwroot/assets/qr-*.js` chỉ chứa `uqr` (không mã `src/`, không bị obfuscate); `QrLinhVuc-*.js` bị obfuscate như các chunk dự án; `vendor` không chứa `uqr`; mở `/` không tải `qr-*`/`QrLinhVuc-*`.
    - Tổng JS tải lúc mở `/linh-vuc` ≤ 200 KB gzip ở 375 và 1280 px (ước ≈ 175–178). **Vượt: dừng và báo người dùng** (rủi ro 7, `plan.md` §5), không tự cắt tính năng.
    - Không có source map trong `wwwroot`.

## code-reviewer

- [ ] T09 [code-reviewer] Rà soát F05 (sau T08) — ghi `result/review.md`:
  - BE: R1–R7 (§3.2); không trường ngoài hợp đồng; không `[DanhMucQuery]`; route mới không đụng `api/linh-vuc`.
  - FE: mọi chữ qua `t()`; không `dangerouslySetInnerHTML`, không `style` inline; QR vẽ chỉ khi `daHien`; `rootMargin` 0 và quan sát chính ô (không quan sát khung QR); `QrLinhVuc`/`uqr` chỉ được import động (tìm mọi `import` tới chúng); mọi `link` QR đi qua `taoLinkQr` (không ghép chuỗi tại chỗ); `core` không import `features`; lỗi quầy không lộ ra người dùng.
  - Bảo mật: chunk `qr` không obfuscate, không chứa mã dự án; không tài nguyên ngoài; `uqr` đã khoá version; ma trận/`d` không chứa chuỗi người dùng.
  - Hiệu năng: kích thước chunk khớp báo cáo T08; không `useEffect` quan sát thừa (một observer chung).
  - Truy vết BR/AC (`plan.md` §7) đủ task và test.
  - file: `.specify/specs/F05-linh-vuc-qr/result/review.md`
  - xong khi: mọi phát hiện mức Chặn có người sở hữu và đã sửa.

## tester

- [x] T10 [tester] Viết `testcases.md` (làm được ngay):
  - Mỗi BR (kể cả BR-5), AC (AC-1 đến AC-9) của spec có ít nhất một ca. Thêm ca ngoài AC: mã lĩnh vực dài nhất (69 ký tự) quét được, dữ liệu `[]`, lĩnh vực đổi tên (QR cũ → "Không tìm thấy lĩnh vực"), `q` trên địa chỉ, thao tác chỉ bàn phím (Tab qua từng ô, Enter mở), phóng 200 %, kiosk 1080×1920. BR-5 là ghi chú vận hành: ca kiểm tài liệu vận hành (giai đoạn 8) có ba ý (tên miền chính thức, cuộn hết trang trước khi in, quét thử cả hai loại lĩnh vực) và ca ghi nhận hành vi in khi chưa cuộn hết (ô chưa cuộn tới trống QR, đúng BR-2).
  - file: `.specify/specs/F05-linh-vuc-qr/testcases.md`
  - xong khi: bảng truy vết BR/AC → ca đủ, không AC nào thiếu; ca AC-2 đánh dấu chờ tên miền chính thức (câu hỏi mở 10), khi thử dùng tên miền đang mở.

- [x] T11 [tester] Test tích hợp PostgreSQL (sau T02):
  - `QuayLinhVucServiceTrenPostgreSql` (lớp con của `QuayLinhVucServiceContract`, `DbThuNghiem`), cùng mẫu `DanhMucServiceTrenPostgreSql`.
  - Tương đương hai nguồn: DTO của `QuayLinhVucService` trên `NguonDuLieuPostgreSql` và `NguonDuLieuMau` tuần tự hoá giống từng byte.
  - AC-6: nhập bằng công cụ nhập file `phan-cong` không dòng nào → API `[]`; nhập lại file có "Hộ tịch" quầy 3 → API trả `{"linhVucMa":"ho-tich","quay":3}`, `ETag` đổi, yêu cầu kế tiếp không trả 304 cũ; dòng chỉ có nơi tiếp nhận chuyển (quầy trống) không xuất hiện.
  - file: `src/BackEnd/DichVuCong.Tests/Integration/QuayLinhVuc/`
  - xong khi: xanh với DB thật (bỏ qua có thông báo khi không có DB thử); báo cáo trong `result/test.md`.

- [x] T12 [tester] E2E, hiệu năng, kết quả (sau T08 và T09):
  - `e2e/linh-vuc.spec.ts` (dữ liệu 75 lĩnh vực; thêm đường `page.route` cho `/api/linh-vuc/quay` trong `e2e/du-lieu/`): AC-1, AC-3, AC-5 ở khổ 375×667 (đợi mạng yên rồi đếm `svg[data-qr]`, so với số ô có phần nằm trong khung nhìn tính bằng `getBoundingClientRect`; cuộn từng màn hình, số QR tăng đúng số ô mới; tới cuối đủ 75, mỗi ô một `svg`), AC-6 (quầy `[]`, rồi "Hộ tịch" quầy 3, không sửa code), AC-2 (chụp ảnh QR của "Hộ tịch", giải mã bằng `jsqr` → địa chỉ `<origin>/thu-tuc?cap=xa&lv=ho-tich` → mở được, tab cấp xã, đã lọc Hộ tịch; mở trang bằng `localhost` thì QR chứa `localhost`), AC-7 (giải mã QR một lĩnh vực chỉ cấp tỉnh → `cap=tinh`, mở ra có thủ tục; một lĩnh vực có thủ tục xã → `cap=xa`; đủ 75 QR sau khi cuộn hết), AC-8 (chú thích "Quét để xem thủ tục" dưới mỗi QR), AC-9 (chặn riêng `/api/linh-vuc/quay` → lưới và QR đủ, không dòng quầy, không thông báo lỗi; chặn riêng `/api/linh-vuc` → "Chưa tải được dữ liệu."), F00 AC-20 (mở `/`: không có yêu cầu tới `qr-*`/`QrLinhVuc-*`; vào `/linh-vuc`: có, sau khi ô đầu tiên hiện), axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) ở thường và kiosk, không cuộn ngang ở 320 px, phóng 200 % ở 1280 px.
  - Lighthouse mobile `/linh-vuc` (3 lần, bản `dotnet publish -c Release`) ≥ 85; tổng JS lúc mở ≤ 200 KB ở 375 và 1280 px; không yêu cầu nào > 0,6 giây khi tải trang (F00 AC-18); p95 `GET /api/linh-vuc/quay` và `/api/linh-vuc` ≤ 300 ms với 1.000 yêu cầu (F00 AC-10, giới hạn tần suất đặt đủ lớn khi đo).
  - Thử tay: quét QR bằng iPhone và Android từ màn hình và từ bản in cỡ 3 cm (mã ngắn "ho-tich", mã dài nhất, và một lĩnh vực chỉ cấp tỉnh — BR-5); NVDA đọc ô lĩnh vực và thông báo số kết quả; chỉ bàn phím.
  - Chuyển `trang_thai` spec sang `xong` chỉ khi mọi AC đạt (kể cả AC-2 bằng điện thoại thật; ghi rõ tên miền đã dùng khi thử).
  - file: `src/FrontEnd/e2e/linh-vuc.spec.ts`, `.specify/specs/F05-linh-vuc-qr/result/test.md`
  - xong khi: `result/test.md` ghi kết quả từng AC, số đo (đếm QR từng bước cuộn, tổng JS, Lighthouse, p95), kết quả quét tay, và lỗi (nếu có) giao đúng agent sở hữu tệp.

## Tóm tắt

| Agent | Task | Số task |
|---|---|---|
| db-dev | — | 0 |
| backend-dev | T01, T02 | 2 |
| chatbot-dev | — | 0 |
| ui-core-dev | T03, T04, T08 | 3 |
| frontend-dev | T05, T06, T07 | 3 |
| code-reviewer | T09 | 1 |
| tester | T10, T11, T12 | 3 |
| **Tổng** | | **12** |
