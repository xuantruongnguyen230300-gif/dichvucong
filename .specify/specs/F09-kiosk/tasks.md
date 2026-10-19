# F09 · Kiosk dùng chung — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`.

Điều kiện bắt đầu:

- **Làm ngay:** T01 (ui-core-dev) và T07 (tester, viết `testcases.md`). Nền đã có: C01 (cờ kiosk `core/kiosk/`, `Modal` với `data-ngoai-popup`, `FloatingButton`, `--fab-clearance`), F08 (`Layout` có chỗ chừa), F02/F03/F04 (chỗ chừa dòng nhắc).
- T02 chờ T01 (cần câu chữ `kiosk` và `giaoDienKiosk.tsx`). T03 và T04 chờ T01 (cần `NhacDangXuat`) và làm song song với T02. T05 chờ T01 và **khung trợ lý của F06** (chưa có plan khi lập; khi plan/tasks F06 có thì ghi số task của khung vào dòng "Chờ" của T05). T06 sau T02–T04. T08 sau T06; AC cần trợ lý (AC-2, AC-5, AC-6, AC-9) chờ T05 và F06 xong.
- db-dev, backend-dev: không có task trong F09 (không bảng, không endpoint, không đổi cấu hình). Giới hạn 60 câu/phút là mặc định của F06 (F06 BR-5).
- Hướng dẫn vận hành (BR-6) **không có task** (không agent sở hữu): nội dung ở `plan.md` §9, chuyển vào kế hoạch 8.5 (`plan.md` Cần hỏi A4).
- Quyết định đang chờ xác nhận mà các task dưới đây đã làm theo đề xuất: A1 (tải lại trang), A2 (kiosk luôn `replace`), A3 (tên miền con của Cổng DVC). Nếu người dùng đổi A1: planner sửa lại T02, T05 trước khi làm.
- Các tệp `app/layout/Layout.tsx`, `app/i18n.d.ts`, `features/thu-tuc/DanhSachThuTuc.tsx`, `features/thu-tuc/ChiTietThuTuc.tsx` cũng bị F03, F04, F06 sửa: đọc lại ngay trước khi sửa, không ghi đè phần của task khác.
- Quy ước khi viết file: không gõ `\uXXXX` qua Edit hoặc Bash. Sau khi ghi tệp có chữ tiếng Việt, tìm ký tự vô hình bằng `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>` (chỉ được thấy ở chỗ chủ ý) và đọc lại chữ xem có vỡ dấu không. Dữ liệu thử cần ký tự đặc biệt thì dựng bằng `String.fromCodePoint(...)`.

## ui-core-dev

- [x] T01 [ui-core-dev] Dòng nhắc đăng xuất, câu chữ `kiosk`, vỏ nạp lười (`plan.md` §3, §4.1, §4.4, §4.6, §5):
  - `core/kiosk/laLienKetCongDvc.ts`: dùng `phanLoaiLienKet` (chỉ loại `web`), so tên máy đã phân tích bằng `URL` (chữ thường): đúng `dichvucong.gov.vn` hoặc kết thúc bằng `.dichvucong.gov.vn`. Không `includes`, không so chuỗi thô.
  - `core/kiosk/i18n/{vi.json, index.ts}`: namespace `kiosk` với đúng hai khoá `bat-dau-lai` ("Bắt đầu lại") và `nhac-dang-xuat` ("Nhớ đăng xuất khi dùng xong"); `napNgonNguKiosk` theo mẫu `features/trang-chu/i18n/index.ts`. `app/i18n.d.ts` thêm `kiosk` vào `resources` (khoá có kiểu).
  - `core/kiosk/giaoDienKiosk.tsx` (+ `giaoDienKiosk.module.css`): tạm chỉ xuất `NhacDangXuatNoiDung` (T02 thêm `LopKiosk`). Có `cacLienKet` mà không đích nào thuộc Cổng DVC → `null`; ngược lại `<p>` gồm icon `LogOut` 14 px `aria-hidden` + chữ; `--color-text-muted`, `--font-size-sm`; không margin ngoài (nơi gọi chỉnh bằng `className`).
  - `core/kiosk/napGiaoDien.ts`: `napGiaoDienKiosk = () => Promise.all([import('./giaoDienKiosk'), napNgonNguKiosk()]).then(([m]) => m)`; mọi chỗ nạp chunk kiosk đều gọi hàm này (để bundler gộp một chunk).
  - `core/kiosk/NhacDangXuat.tsx`: vỏ theo `NhacDangXuatProps` (§3); `useCheDoKiosk()` sai → `null` **trước khi** chạm tới `lazy`; đúng → `<Suspense fallback={null}>` + `lazy(() => napGiaoDienKiosk().then(m => ({ default: m.NhacDangXuatNoiDung })))`.
  - Trang xem trước (chỉ dev) `app/xem-truoc/`: thêm một ví dụ `NhacDangXuat` (hiện khi bật kiosk) để duyệt hình thức; câu chữ qua `xem-truoc/i18n/vi.json`.
  - file: `src/FrontEnd/src/core/kiosk/{laLienKetCongDvc.ts, laLienKetCongDvc.test.ts, napGiaoDien.ts, NhacDangXuat.tsx, NhacDangXuat.test.tsx, giaoDienKiosk.tsx, giaoDienKiosk.module.css, i18n/index.ts, i18n/vi.json}`, `src/FrontEnd/src/app/i18n.d.ts`, `src/FrontEnd/src/app/xem-truoc/*`
  - xong khi:
    - Vitest `laLienKetCongDvc`: đúng với `https://dichvucong.gov.vn/tra-cuu-ho-so`, `http://dichvucong.gov.vn`, `https://www.dichvucong.gov.vn/x`, `HTTPS://DichVuCong.Gov.VN/`, kết quả `linkDvc('1.001193')`; sai với `null`, `undefined`, `''`, `javascript:alert(1)`, `tel:02723893900`, `//dichvucong.gov.vn` (tương đối), `https://dichvucong.gov.vn.evil.com`, `https://evildichvucong.gov.vn`, `https://dichvucong.tayninh.gov.vn`, `https://cangiuoc.tayninh.gov.vn`, `https://tayninh.gov.vn`, `https://evil.com/?u=dichvucong.gov.vn`, `https://dichvucong.gov.vn@evil.com`.
    - Vitest `NhacDangXuat`: ngoài kiosk → không ra gì và `napGiaoDienKiosk` không được gọi (AC-4); ở kiosk không truyền `cacLienKet` → đúng một dòng "Nhớ đăng xuất khi dùng xong"; `cacLienKet` không có đích Cổng DVC (kể cả mảng rỗng, toàn `null`) → không dòng; có ít nhất một đích Cổng DVC → đúng một dòng dù có nhiều đích; `className` được áp.
    - Dòng nhắc không phải liên kết, không có nút (không phần tử tab được).
    - `npm run lint` (kể cả luật chữ viết cứng), `tsc` sạch; kiểu khoá `kiosk` sai khoá là lỗi build.
    - Kiểm ký tự vô hình theo quy ước ở đầu tệp.

- [x] T02 [ui-core-dev] Nút "Bắt đầu lại", điều hướng thay lịch sử, ghép vào `Layout` (`plan.md` §4.2, §4.3, §5) — sau T01:
  - `core/kiosk/batDauLai.ts`: `thaoTacTrinhDuyet.diToi` (mặc định `window.location.replace`) và `batDauLai()` đúng như `plan.md` §4.2: `document.body.hidden = true`, `speechSynthesis?.cancel()` trong `try`, rồi `diToi(`${DUONG_DAN.trangChu}?kiosk=1`)`. Không đụng `localStorage`/`sessionStorage`.
  - `core/kiosk/dieuHuongThayLichSu.ts`: `useDieuHuongThayLichSu()` theo §4.3 (`UNSAFE_DataRouterContext`; gán lại `router.navigate` với `replace: true` khi `to` không phải số; cleanup trả bản gốc; không có router thì không làm gì).
  - `core/kiosk/giaoDienKiosk.tsx`: thêm `LopKiosk` (gọi `useDieuHuongThayLichSu`, vẽ `NutBatDauLai`) và `NutBatDauLai`: `createPortal(<FloatingButton viTri="trai" trenPopup data-ngoai-popup="" bieuTuong={<RotateCcw …/>} onClick={batDauLai}>{t('kiosk:bat-dau-lai')}</FloatingButton>, document.body)`; lớp CSS riêng `min-height: max(48px, var(--fab-height))`.
  - `app/layout/Layout.tsx`: thay comment chừa chỗ bằng `lazy(() => napGiaoDienKiosk().then(m => ({ default: m.LopKiosk })))` chỉ vẽ khi `useCheDoKiosk()`, bọc `RanhGioiKhung` + `Suspense fallback={null}`, đặt sau `<AppFooter>` như F08 §4.2 (giữ comment cho nút Trợ lý của F06). Không import tĩnh `giaoDienKiosk`.
  - Đo: `npm run build`; ghi vào báo cáo (cách đo như F00 T09, gzip -9):
    - chunk kiosk là **một** tệp chứa cả `NutBatDauLai` và `NhacDangXuatNoiDung`; kích thước ≤ 5 KB gzip;
    - tổng JS tải ban đầu ở `/` 1280 px trước và sau T01–T04: tăng ≤ 1 KB; chunk kiosk không có trong `<link rel="modulepreload">`/`<script>` của `index.html` và không nằm trong các chunk của route `/`, `/thu-tuc` ở chế độ thường (xem `dist`/`wwwroot`);
    - build qua obfuscate vẫn chạy được (`document.body.hidden`, `speechSynthesis` không bị đổi tên sai).
  - file: `src/FrontEnd/src/core/kiosk/{batDauLai.ts, batDauLai.test.ts, dieuHuongThayLichSu.ts, dieuHuongThayLichSu.test.tsx, giaoDienKiosk.tsx, giaoDienKiosk.module.css, giaoDienKiosk.test.tsx}`, `src/FrontEnd/src/app/layout/{Layout.tsx, Layout.test.tsx}`
  - xong khi:
    - `batDauLai.test.ts`: gọi → `diToi` nhận đúng `/?kiosk=1`; `speechSynthesis.cancel` được gọi; `document.body.hidden === true`; `speechSynthesis` không tồn tại hoặc `cancel` ném lỗi → vẫn gọi `diToi`; `localStorage` (`cach-xem`, khoá bật đọc giả) không bị đổi.
    - `dieuHuongThayLichSu.test.tsx` (`createMemoryRouter` + `renderApp`): ở kiosk, bấm `Link`, `NavLink` (3 mục điều hướng), `setSearchParams` không `replace`, `navigate('/x')` đều cho `router.state.historyAction === 'REPLACE'`; `navigate(-1)` vẫn là POP; ngoài kiosk vẫn `PUSH`; unmount trả lại `router.navigate` gốc; StrictMode không gói lồng hai lần.
    - `giaoDienKiosk.test.tsx` và `Layout.test.tsx`:
      - kiosk → có đúng một nút "Bắt đầu lại", là **con trực tiếp của `<body>`**, mang `data-ngoai-popup`, không bị `inert` khi popup mở; ngoài kiosk → không có nút và chunk không được nạp;
      - mở popup (`?ma=`) ở kiosk, Tab/Shift+Tab đi vòng và đi qua nút này, nút là phần tử cuối vòng (C01 AC-24); Esc chỉ đóng popup; bấm nút khi popup mở → `diToi` được gọi;
      - thứ tự Tab ở kiosk không popup: nút "Bắt đầu lại" là phần tử tab được **cuối cùng** của tài liệu (sau chân trang); với một khung giả nằm trong `#root` thì nút đi sau mọi phần tử của khung;
      - đồng hồ giả: để qua 15 phút → `diToi` không được gọi, DOM không đổi (AC-2, BR-2); không có `setTimeout`/`setInterval` do mô-đun kiosk tạo;
      - nút cao ≥ 48 px ở kiosk (đo bằng công cụ trình duyệt, ghi số đo); ở góc dưới trái, không che chữ chân trang khi cuộn tới cuối ở 1080×1920 và 1280×800 (kiosk).
    - `npm run lint`, `tsc`, `npm test` sạch; số đo kích thước ghi vào báo cáo của task.
    - Kiểm ký tự vô hình.

## frontend-dev

- [x] T03 [frontend-dev] Dòng nhắc phía trên danh sách thủ tục và trong popup (`plan.md` §4.4) — sau T01:
  - `features/thu-tuc/DanhSachThuTuc.tsx`: thêm `<NhacDangXuat />` ngay trên `DataTable` (gốc component thành fragment); khoảng cách bằng token qua `className`. Cập nhật comment đầu hàm.
  - `features/thu-tuc/ChiTietThuTuc.tsx` (`ChanPopupChiTiet`): thêm `<NhacDangXuat />` đứng **trước** `ExternalLink` "Xem và nộp trên Cổng DVC"; chân popup `flex-wrap` nên ở màn hình hẹp dòng và nút tự xuống hàng. Cập nhật comment đầu hàm.
  - `features/danh-muc/DanhMucNoiDung.tsx`: gỡ comment "F09 thêm dòng … ở đây" (đã nằm trong `DanhSachThuTuc`).
  - Import tĩnh `NhacDangXuat` từ `core/kiosk/NhacDangXuat` (vỏ nhỏ); **không** import `giaoDienKiosk`.
  - file: `src/FrontEnd/src/features/thu-tuc/{DanhSachThuTuc.tsx, ChiTietThuTuc.tsx, DanhSachThuTuc.test.tsx, ThuTucPopup.test.tsx}`, `src/FrontEnd/src/features/danh-muc/DanhMucNoiDung.tsx`, `src/FrontEnd/src/features/danh-muc/DanhMuc.test.tsx`
  - xong khi:
    - Vitest ở kiosk: danh sách 12 thẻ → **đúng một** "Nhớ đăng xuất khi dùng xong" (không lặp từng thẻ); dạng bảng → đúng một; danh mục tab Cấp xã và tab Cấp tỉnh, thẻ và bảng → đúng một; không có kết quả (`EmptyState`) → không dòng; popup thủ tục (`CHI_TIET_KHAI_SINH`) → đúng một dòng, đứng trước liên kết "Xem và nộp trên Cổng DVC" trong DOM; liên kết vẫn `target="_blank"`, `rel="noopener noreferrer"`, không bước xác nhận (AC-3).
    - Ngoài kiosk: không dòng nào ở các chỗ trên (AC-4).
    - Chân trang không có dòng (không đổi `AppFooter`).
    - Kiểm bằng trình duyệt: khoảng cách đẹp với `ThanhLoc` và khối thường gặp ở 375, 768, 1080×1920 kiosk; popup kiosk 1080×1920 chân popup không bị nút "Bắt đầu lại" che (dải 88 px của C01 còn đủ khi chân popup xuống 2 hàng — nếu không đủ, báo ui-core-dev chỉnh `--modal-ke-duoi`); ghi số đo.
    - `npm run lint`, `tsc`, `npm test` sạch; kiểm ký tự vô hình.

- [x] T04 [frontend-dev] [P] Dòng nhắc phía trên các ô dịch vụ (`plan.md` §4.4) — sau T01:
  - `features/trang-chu/KhuODichVu.tsx`: ngay trên `TileGrid`, `<NhacDangXuat cacLienKet={trungTam.oDichVu.map((o) => o.url)} />`; gỡ comment chừa chỗ. Không tự kiểm tên miền trong `KhuODichVu` (việc của `laLienKetCongDvc`).
  - file: `src/FrontEnd/src/features/trang-chu/{KhuODichVu.tsx, KhuODichVu.test.tsx, TrangChu.test.tsx}`
  - xong khi:
    - Vitest ở kiosk với 6 ô đúng `lien-ket.md` §1 (hai ô đầu `url` null; ba ô tới `dichvucong.gov.vn`; một ô tới `cangiuoc.tayninh.gov.vn`) → đúng một dòng phía trên lưới; không `Tile` nào có dòng riêng.
    - Chỉ còn ô "Cổng thông tin điện tử xã Cần Giuộc" và hai ô `url` null → không dòng (AC-3).
    - `oDichVu` rỗng, đang tải, lỗi → không dòng.
    - Trang chủ ở kiosk đủ khối thường gặp: tổng đúng **hai** dòng (một phía trên ô, một phía trên danh sách thường gặp), cả thẻ và bảng (AC-3); ngoài kiosk không dòng nào.
    - Kiểm bằng trình duyệt: 375 và 1080×1920 kiosk, CLS ≤ 0,05 (dòng không làm nhảy bố cục khi chunk kiosk về sau dữ liệu); ghi số đo.
    - `npm run lint`, `tsc`, `npm test` sạch; kiểm ký tự vô hình.

## chatbot-dev

- [x] T05 [chatbot-dev] Khung trợ lý và kiosk (`plan.md` §4.4, §8) — **Chờ:** T01 và khung trợ lý của F06 (ghi số task F06 vào đây khi có tasks.md F06). Làm cùng đợt với F06 FE nếu F06 chưa xong khung:
  - Dòng nhắc: `<NhacDangXuat cacLienKet={…} />` **một lần** trong khung, ngay dưới thanh tiêu đề, phía trên danh sách tin nhắn; `cacLienKet` = mọi đích liên kết (nút/liên kết "Xem và nộp trên Cổng DVC", liên kết Cổng DVC trong câu về nộp trực tuyến) trong các câu trả lời hiện có. Không đặt trong từng câu trả lời.
  - Vị trí trong cây: khung trợ lý và nút Trợ lý nằm trong cây `Layout` (`#root`), **không** `createPortal` ra `<body>`. Nếu F06 buộc phải portal → dừng, báo planner (`plan.md` §8 điều 1).
  - Hội thoại và thủ tục đang nói tới chỉ ở bộ nhớ: không ghi `localStorage`, `sessionStorage`, cookie, `history.state`, `IndexedDB`, địa chỉ. Ô nhập `autoComplete="off"`.
  - F07: dừng đọc khi `pagehide` (gọi `speechSynthesis.cancel()` và huỷ hàng đợi đọc của F07); nếu F07 không dùng Web Speech API → báo planner.
  - file: `src/FrontEnd/src/features/chatbot/**` (theo plan F06), kèm `*.test.tsx` cùng thư mục
  - xong khi:
    - Vitest ở kiosk: hỏi "kết hôn", rồi "nộp hồ sơ trực tuyến ở đâu" (cả hai trả lời có liên kết Cổng DVC) → khung có **đúng một** dòng nhắc; hội thoại mới chỉ có câu "mấy giờ làm việc" (không liên kết Cổng DVC) → không dòng; ngoài kiosk → không dòng (AC-3, AC-4).
    - Hỏi "số 0912345678 của tôi nộp hồ sơ chưa": sau đó `localStorage`, `sessionStorage`, `document.cookie`, `history.state`, địa chỉ **không** chứa `0912345678`.
    - Thứ tự Tab ở kiosk, khung mở, không popup: mọi phần tử của khung đứng trước nút "Bắt đầu lại" (kiểm bằng `Layout` thật).
    - `pagehide` khi đang đọc → `speechSynthesis.cancel` được gọi.
    - `dotnet build`/lint/`npm test` sạch phần liên quan; kiểm ký tự vô hình.

## code-reviewer

- [ ] T06 [code-reviewer] Review F09 (T01–T04; T05 khi xong) theo `CLAUDE.md` và `plan.md` → `.specify/specs/F09-kiosk/result/review.md` — sau T02, T03, T04. Trọng tâm:
  - BR-2: tìm mọi `setTimeout`/`setInterval`/`requestIdleCallback`/`visibilitychange` có thể tự xoá hoặc tự tải lại; không có đường nào gọi `batDauLai` ngoài `onClick` của nút.
  - Ngân sách: chế độ thường không import tĩnh `giaoDienKiosk`; keo trong bundle chính ≤ 1 KB, chunk kiosk ≤ 5 KB, tổng JS ban đầu ≤ 200 KB (số đo của T02, nhưng đo lại).
  - Bảo mật: đích `location.replace` là hằng cùng nguồn; `laLienKetCongDvc` không dùng so chuỗi thô; không `dangerouslySetInnerHTML`; không chuỗi viết cứng (i18n); không dữ liệu cá nhân vào storage/log; nút là con trực tiếp của `<body>` kèm `data-ngoai-popup`.
  - `useDieuHuongThayLichSu`: hoàn nguyên khi unmount; không rò sang chế độ thường; không phá `navigate(-1)`.
  - Dòng nhắc: đúng một dòng mỗi nơi, không có ở `AppFooter`, `ThuTucCard`, hàng bảng, `Tile`.
  - Nếu T05 chưa xong: ghi rõ phần chưa review, review T05 cùng F06.
  - xong khi: `review.md` liệt kê lỗi theo mức (Chặn / Cao / Thấp), mỗi lỗi giao đúng agent sở hữu tệp.

## tester

- [x] T07 [tester] Viết `testcases.md` (làm được ngay sau khi có plan và tasks):
  - Từ spec, plan và `result/` cũ: mỗi AC-1…AC-9 một hoặc nhiều ca (dữ liệu, thao tác, kết quả mong đợi); thêm ca cho BR-2 (không tự làm mới), BR-7 (thứ tự Tab, không lịch sử), nhận diện tên miền (các ca giả mạo ở T01), CLS, ngân sách JS.
  - Đánh dấu ca chờ F06/F07 (AC-2, AC-5, AC-6, AC-9) và ca thử tay (NVDA/TalkBack, trình duyệt kiosk thật — câu hỏi mở 10).
  - Bảng truy vết BR/AC → ca.
  - file: `.specify/specs/F09-kiosk/testcases.md`
  - xong khi: mọi AC có ít nhất một ca; không AC nào thiếu; ca phụ thuộc agent khác ghi rõ.

- [x] T08 [tester] E2E, hiệu năng, kết quả → `result/test.md` — sau T06 (AC-2, AC-5, AC-6, AC-9 sau T05 và F06 xong):
  - `src/FrontEnd/e2e/kiosk.spec.ts` (Playwright, bản build, khổ 1080×1920 mở bằng `/?kiosk=1`; thêm khổ 375 không kiosk cho AC-4, AC-8):
    - AC-1: chữ/nút lớn, thẻ; tải lại vẫn kiosk (và không còn `?kiosk=1` trên địa chỉ).
    - AC-3, AC-4: đếm dòng nhắc ở trang chủ (đúng 2: ô dịch vụ + thường gặp, thẻ và bảng), danh mục hai tab × thẻ/bảng (mỗi chỗ 1), popup `1.001193` (1, bấm liên kết mở Cổng DVC ngay không hỏi lại), chân trang (0), điện thoại (0 ở mọi chỗ). Nhập lại file ô dịch vụ chỉ còn ô xã (qua `page.route` `/api/trung-tam`) → 0 dòng trên ô.
    - AC-8: nút có ở `/`, `/thu-tuc`, `/linh-vuc` ở kiosk, góc dưới trái, cuộn tới cuối không che chân trang; không có ở khổ thường.
    - AC-2: `page.clock.fastForward` 15 phút → popup, khung, hội thoại, từ khoá, bộ lọc còn nguyên; không hộp thoại/đếm ngược. *(cần F06)*
    - AC-6, AC-7: bật đọc (giả `speechSynthesis` bằng `addInitScript`, đếm `cancel`), chọn bảng, tab Cấp tỉnh, "khai sinh", lọc "Hộ tịch", hỏi trợ lý, mở popup từ câu trả lời, bấm "Bắt đầu lại" khi đang "đọc" → `cancel` được gọi, về `/`, đầu trang, địa chỉ không còn `ma`/`q`/`lv`/`cap`, vẫn kiosk, mở trợ lý trống, danh mục tab Cấp xã ô tìm trống trang 1, bật đọc và dạng bảng còn nguyên; `goBack()` nhiều lần không bao giờ thấy lại trạng thái cũ. *(cần F06, F07)*
    - AC-9: hỏi "số 0912345678 của tôi nộp hồ sơ chưa" → bấm "Bắt đầu lại" → mở lại trợ lý, `page.content()` và `localStorage`/`sessionStorage`/cookie không chứa `0912345678`. *(cần F06)*
    - BR-7: Tab ở kiosk với khung trợ lý mở → nút "Bắt đầu lại" sau mọi phần tử khung; với popup mở → Tab/Shift+Tab đi vòng qua nút; Enter/Space bấm được; bấm nút khi popup mở. *(khung: cần F06)*
    - axe-core (`wcag2a/aa`, `wcag21a/aa`) ở kiosk trên `/`, `/thu-tuc`, popup; nút và dòng nhắc đạt tương phản.
  - Integration BE: `src/BackEnd/DichVuCong.Tests/Integration/` — với cấu hình mặc định (không ghi đè), 60 câu hỏi/phút từ một địa chỉ đều có trả lời, câu 61 trả mã "Quá nhiều yêu cầu" (AC-5). *(cần F06 BE)*
  - Hiệu năng: ở chế độ thường `/` và `/thu-tuc` **không có request** tới chunk kiosk; ở kiosk có đúng một chunk kiosk; tổng JS tải ban đầu ≤ 200 KB gzip; CLS kiosk 1080×1920 ≤ 0,05 ở `/` và `/thu-tuc`; Lighthouse mobile `/` ≥ 85 (bản `dotnet publish -c Release`).
  - Thử tay (ghi vào `result/test.md`, không chặn): NVDA đọc nút và dòng nhắc; bấm "Bắt đầu lại" trên trình duyệt kiosk thật (câu hỏi mở 10): độ chớp, giọng đọc dừng, Quay lại.
  - Chuyển `trang_thai` của spec sang `xong` khi mọi AC đạt (kể cả ca chờ F06/F07).
  - file: `src/FrontEnd/e2e/kiosk.spec.ts`, `src/BackEnd/DichVuCong.Tests/Integration/`, `.specify/specs/F09-kiosk/result/test.md`
  - xong khi: `result/test.md` ghi kết quả từng AC, số đo (kích thước JS, CLS, Lighthouse), ca chưa chạy được vì chờ F06/F07 (nêu rõ), và lỗi giao đúng agent sở hữu tệp.

## Tóm tắt

| Agent | Task | Số task |
|---|---|---|
| db-dev | — | 0 |
| backend-dev | — | 0 |
| chatbot-dev | T05 | 1 |
| ui-core-dev | T01, T02 | 2 |
| frontend-dev | T03, T04 | 2 |
| code-reviewer | T06 | 1 |
| tester | T07, T08 | 2 |
| **Tổng** | | **8** |

Làm ngay: T01, T07. Sau T01: T02, T03, T04 song song, T05 khi khung F06 có.
