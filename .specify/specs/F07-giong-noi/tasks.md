# F07 · Đọc câu trả lời — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`. Mọi task BE: `dotnet build src/BackEnd/DichVuCong.sln` sạch (cảnh báo là lỗi) và `dotnet test --solution src/BackEnd/DichVuCong.sln` xanh. Mọi task FE: `npm run lint`, `npm test`, `npm run build` sạch.

Điều kiện bắt đầu:

- **Làm ngay** (không chờ F06): chatbot-dev T01 (BE), T02, T03, T05 (FE thuần, chưa cần khung chat); tester T08.
- **Chờ F06:** T04 chờ F06 T11 (khung chat thật, `ChoNutDoc.tsx` rỗng, `diemGhepDoc.ts`, `vanBanDoc.ts`) và F06 T09 (`i18n/vi.json`, `i18n/index.ts`). T10 chờ T04 và F06 T13; phần kiosk của T10 chờ thêm F09 T02. T09 (tester) chờ T01.
- T06 (đo kích thước) sau T04. T07 (code-reviewer) sau T01–T06. T11 (tester) sau T10.
- Không cần task cho db-dev (không đổi bảng, cột, chỉ mục, migration), backend-dev, frontend-dev, ui-core-dev (dùng `IconButton` có sẵn, không thêm gì vào `core/`).
- Không viết SQL, không `AppDbContext`: service đọc qua `INguonDuLieu` (F00 §9.4 R1–R7).
- Không gõ `\uXXXX` qua Edit hay Bash (công cụ đổi thành ký tự thật, vô hình khi review). Ký tự vô hình trong mã hay test: ghép trong một tệp script hoặc dùng `String.fromCodePoint(0x200e)` / `(char)0x200E`. Sau khi ghi tệp, kiểm: `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>` — chỉ được ra ở chỗ chủ ý.
- Tệp dùng chung với F06: `features/chatbot/i18n/vi.json`, `Features/Chatbot/ChatbotServiceCollectionExtensions.cs` — đọc lại ngay trước khi sửa, không ghi đè phần của task khác.
- Không thêm gói NuGet hay npm.
- Quyết định đang chờ xác nhận mà các task dưới đây đã làm theo đề xuất: Cần hỏi 1 (ẩn nút khi không có giọng), 2 (dừng khi có câu trả lời mới), 3 (luật đọc số và đơn vị), 4 (chỉ giọng `localService`) — xem `plan.md` §9.

## chatbot-dev — BE (`Features/Chatbot/`)

- [x] T01 [chatbot-dev] `GET /api/tro-ly/viet-tat` (`plan.md` §3; BR-3):
  - `DocCauTraLoi/VietTatDocDtos.cs` (`VietTatDocDto(string ChuVietTat, string DayDu)`), `VietTatDocService.cs` (`IVietTatDocService.LayAsync`: `nguon.VietTats` sắp theo `ThuTu`, `Select` thẳng ra DTO, lấy bằng `TruyVan` — R1, R2, R3), `VietTatDocController.cs` (`[Route("api/tro-ly/viet-tat")]`, `[HttpGet]` `[HttpHead]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, không `[DanhMucQuery]`, mẫu `ThongTinTrungTamController`).
  - Đăng ký `IVietTatDocService` (scoped) trong `AddChatbot(nguon)` — không đổi phần của F06.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/DocCauTraLoi/{VietTatDocDtos.cs, VietTatDocService.cs, VietTatDocController.cs}`, `src/BackEnd/DichVuCong.Api/Features/Chatbot/ChatbotServiceCollectionExtensions.cs`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/DocCauTraLoi/{VietTatDocServiceContract.cs, VietTatDocServiceTrenMau.cs, VietTatDocTests.cs}`
  - xong khi:
    - Test hợp đồng (F00 §9.10, R7) trên nguồn Mẫu: dữ liệu mẫu trả đủ 12 dòng đúng thứ tự `ThuTu`, ví dụ `TTHC` → `thủ tục hành chính`, `đk` → `đăng ký`, `QĐ-UBND` → `quyết định Ủy ban nhân dân`; bảng rỗng → `[]`. Lớp con cho PostgreSql do tester (T09).
    - Test HTTP (`ApiFactory`, nguồn Mẫu): 200 JSON camelCase, **chỉ** hai trường `chuVietTat`, `dayDu` (không `thuTu`, không `chuVietTatTimKiem`); có `ETag`, `Cache-Control: no-cache`; 304 khi `If-None-Match` khớp; đổi phiên bản dữ liệu → thân mới; POST → 405 `phuong-thuc-khong-hop-le`; vượt giới hạn `danh-muc` → 429 `qua-nhieu-yeu-cau`.
    - `QuyTacTruyVanTests`, `KienTrucTests` xanh. `dotnet run` nguồn Mẫu: `curl -k https://localhost:7157/api/tro-ly/viet-tat` trả mảng đúng dạng `plan.md` §3.

## chatbot-dev — FE (`features/chatbot/`)

- [x] T02 [chatbot-dev] [P] Chuẩn bị văn bản đọc (`plan.md` §4.4; BR-3, AC-2):
  - `doc/luatDoc.ts` (hằng: số, đơn vị, emoji, dấu ngoặc kép, ký hiệu markdown), `doc/chuanBiVanBan.ts` (`chuanBiVanBanDoc(vanBan, bang): string[]` đúng 5 bước §4.4: dọn ký tự, số + đơn vị, viết tắt bằng một biểu thức dựng từ bảng, xuống dòng → dấu chấm, tách câu ≤ 180 ký tự). Hàm thuần, không đụng DOM; không dùng `\b` (sai với chữ có dấu).
  - file: `src/FrontEnd/src/features/chatbot/doc/{luatDoc.ts, chuanBiVanBan.ts, chuanBiVanBan.test.ts}`
  - xong khi (Vitest):
    - Ví dụ `plan.md` §4.4 ra đúng chuỗi: `"Theo QĐ-UBND, TTHC này mất 3 ngày, diện tích 30m2, mã 1.001193."` → `"Theo quyết định Ủy ban nhân dân, thủ tục hành chính này mất 3 ngày, diện tích 30 mét vuông, mã 1001193."`
    - Viết tắt: khoá dài thắng khoá ngắn (`QĐ-UBND` trước `UBND`); không phân biệt hoa thường (`tthc`, `ĐK` với khoá `đk`); có biên (`TTHCX`, `ATTHC` không bị thay); hai viết tắt liền nhau cách một dấu cách đều được thay; khoá có ký tự đặc biệt (`QĐ-UBND`, `NĐ-CP`, `C++`) không làm hỏng biểu thức; khoá rỗng, dài hơn 50 ký tự, bảng quá 200 dòng bị bỏ; bảng rỗng → văn bản chỉ qua các bước khác.
    - Số và đơn vị: `1.001193` → `1001193`; `2.000.000` → `2000000`; `0,5` giữ nguyên; `15km`, `15 km`, `30m2`, `30m²`, `3m`, `5cm`, `4mm` đúng thứ tự dài trước ngắn (không ra "métét"); `am`, `km` không đứng sau chữ số thì không đổi; "tháng 3 m" không bị nuốt.
    - Dọn ký tự: emoji, ký tự vô hình (tạo bằng `String.fromCodePoint`), dấu ngoặc kép thẳng và cong, `**đậm**`, `- ` đầu dòng bị bỏ; chữ có dấu giữ nguyên (NFC).
    - Xuống dòng thành dấu chấm khi dòng trước chưa có dấu kết; câu dài 400 ký tự bị cắt tại dấu phẩy/dấu cách, mỗi phần ≤ 180; chuỗi chỉ có khoảng trắng/emoji → `[]`.
    - Hàm không sửa chuỗi gốc (so sánh trước/sau) — chữ hiển thị không đổi.
    - `npm run lint` sạch.

- [x] T03 [chatbot-dev] [P] Dò giọng, lưu cờ, phát âm, nạp lười (`plan.md` §4.1, §4.2, §4.5, Q1, Q4, Q6, Q7, Q8; BR-1, BR-4, BR-5):
  - `doc/giongDoc.ts` (tĩnh): `hoTroDoc`, `chonGiong` (`vi*` và `localService`, ưu tiên `vi-VN`, chọn xác định), `ngheGiongDoi` (`voiceschanged`), `moKhoaDoc` (câu rỗng âm lượng 0), `dungDoc` + `phienHienTai` (số phiên, `cancel()` trong `try/catch`).
  - `doc/luuLuaChon.ts` (tĩnh): `docCoBat()`, `ghiCoBat(bat)` — khoá `doc-bat`, `"1"`/`"0"`, `try/catch` khi storage bị chặn (giữ trong bộ nhớ).
  - `doc/napPhanDoc.ts` (tĩnh): nhớ promise của `import('./docCauTraLoi')`, lỗi nạp thì quên để lần sau thử lại.
  - `doc/bangVietTat.ts` + `doc/docCauTraLoi.ts` (lười): `taiBangVietTat` (nhớ promise; kiểm hình dạng, bỏ phần tử sai; thất bại → quên promise, trả `[]`), `docMoi(vanBan)` theo mã mẫu §4.5 (số phiên, chờ 80 ms, `voice` tường minh, `lang`, `rate` = hằng `TOC_DO_DOC` 0,92, giữ tham chiếu `utterance` ở mức module, `onerror` xử lý `canceled`/`interrupted`/`not-allowed`/khác).
  - file: `src/FrontEnd/src/features/chatbot/doc/{giongDoc.ts, luuLuaChon.ts, napPhanDoc.ts, bangVietTat.ts, docCauTraLoi.ts}` và `*.test.ts` cạnh từng tệp
  - xong khi (Vitest, `speechSynthesis` và `SpeechSynthesisUtterance` giả, `fetch` giả, đồng hồ giả):
    - `chonGiong`: chọn `vi-VN` cục bộ; bỏ `vi-VN` không cục bộ (BR-1); bỏ `en-US`; không có giọng nào → `null`; hai giọng `vi` → luôn chọn cùng một giọng dù đảo thứ tự danh sách; `speechSynthesis` không tồn tại → `hoTroDoc()` sai, không ném lỗi.
    - `luuLuaChon`: mặc định tắt; `"1"` bật; giá trị lạ tắt; `localStorage` ném lỗi → không ném, giữ được trong bộ nhớ trang; chỉ ghi khoá `doc-bat`.
    - `docMoi`: gọi `cancel()` rồi chỉ `speak()` sau 80 ms; mỗi phần tử của `chuanBiVanBanDoc` là một `utterance` có `voice` = giọng đã chọn, `lang`, `rate`; **không `speak()` nếu `dungDoc()` được gọi giữa lúc chờ (cả lúc chờ bảng viết tắt lẫn 80 ms)**; hai `docMoi` liên tiếp chỉ phát câu sau; không có giọng → không `speak()`; có `utterance` giữ tham chiếu cho tới khi câu cuối `end`; `onerror` `not-allowed` gọi hàm báo (để `ChoNutDoc` đưa nút về tắt), `canceled` bị bỏ qua.
    - `taiBangVietTat`: gọi `GET /api/tro-ly/viet-tat` đúng một lần dù gọi nhiều lần; lỗi 500/mạng → `docMoi` vẫn đọc nguyên văn, lần sau tải lại; JSON có phần tử sai (thiếu `dayDu`, không phải chuỗi) → bỏ phần tử đó.
    - Không có `fetch` nào mang văn bản đọc (kiểm các lần gọi `fetch` chỉ là `GET` địa chỉ trên, không `body`) — BR-1.
    - `napPhanDoc` không gọi `import()` cho tới khi được gọi; gọi hai lần chỉ nạp một lần; nạp lỗi rồi gọi lại vẫn nạp được.
    - `npm run lint` sạch.

- [x] T04 [chatbot-dev] Nút bật/tắt đọc trong khung và nối vào điểm ghép F06 (`plan.md` §4.2, §4.3, §4.6; BR-2, BR-5, BR-7, AC-1…AC-8) — sau T02, T03, F06 T09, F06 T11:
  - `useDoCauTraLoi.ts`: `bat` (khởi tạo từ `docCoBat()`), `coGiong` (từ `chonGiong()`, cập nhật khi `voiceschanged` và một lần kiểm lại sau 1 giây), `useDiemGhepDoc()`, `idDaXem`; các quy tắc của bảng §4.3 (câu mới → `dungDoc` rồi đọc nếu `bat && khungDangMo && coGiong`; `khungDangMo` sai → `dungDoc`; tắt → `dungDoc`; gỡ → `dungDoc`; `pagehide` → `dungDoc`); mở khoá Safari iOS (Q8): khi `bat` và chưa mở khoá, lắng nghe một lần `pointerdown`/`keydown` ở `document` rồi `moKhoaDoc()`; lỗi `not-allowed` → `bat` về sai trong phiên, không `ghiCoBat`.
  - `ChoNutDoc.tsx`: thay bản rỗng của F06. `hoTroDoc()` sai hoặc `coGiong` sai → `null`. Ngược lại `IconButton` (`bienThe="tren-nen-dam"`, `dangBat={bat}`, `nhan={t('doc.nhan')}`, icon `Volume2` khi bật, `VolumeX` khi tắt). Bấm: đảo `bat`, `ghiCoBat`, bật → `moKhoaDoc()` + `napPhanDoc()` (nạp trước), tắt → `dungDoc()`.
  - `i18n/vi.json`: thêm khoá `doc.nhan` = "Đọc câu trả lời" (đọc lại tệp trước khi sửa).
  - Đối chiếu F06: `cauTraLoiMoi` chỉ được đặt cho đáp án từ API (không lời chào, tin chờ, tin lỗi); nếu F06 T11 đặt khác → sửa `useHoiTroLy.ts` cho đúng (cùng chủ sở hữu) và ghi vào báo cáo.
  - file: `src/FrontEnd/src/features/chatbot/{ChoNutDoc.tsx, useDoCauTraLoi.ts, ChoNutDoc.test.tsx, useDoCauTraLoi.test.tsx, i18n/vi.json}`
  - xong khi (Vitest + React Testing Library, `speechSynthesis` giả, `DiemGhepDoc` do test cấp):
    - Lần đầu (không khoá) → nút `aria-pressed="false"`, không có `speak()` dù có câu trả lời mới (AC-4, Q5). Bấm → `aria-pressed="true"`, `localStorage["doc-bat"] = "1"`; gắn lại thành phần (mô phỏng tải lại) → vẫn bật; tắt → `"0"`, `cancel()` được gọi, gắn lại vẫn tắt (AC-3).
    - Bật, `cauTraLoiMoi` {id: 1, "…TTHC…"} và `khungDangMo` = đúng → `speak()` với văn bản chứa "thủ tục hành chính" (AC-1, AC-2); bảng viết tắt lấy từ `fetch` giả.
    - Đang đọc, id 2 → `cancel()` rồi chỉ phát nội dung mới (AC-7).
    - Đang đọc, `khungDangMo` = sai → `cancel()` ngay; `khungDangMo` = đúng lại, id không đổi → **không** `speak()` (AC-8). Id mới đến lúc khung đang đóng → không `speak()`.
    - Không giọng tiếng Việt (hoặc không có `speechSynthesis`) → không render nút, không lỗi, không gọi `speak()` (AC-5); giọng xuất hiện sau (`voiceschanged`) → nút hiện.
    - Bật khi màn hình đã có câu trả lời (id có sẵn) → không đọc câu cũ.
    - Gỡ thành phần → `cancel()`; `window` bắn `pagehide` → `cancel()`.
    - `speak()` lỗi `not-allowed` → nút về `aria-pressed="false"`, `localStorage` vẫn `"1"`.
    - Nút có tên đọc "Đọc câu trả lời" cố định ở cả hai trạng thái; Tab/Enter/Space bật tắt được; `axe` (vitest-axe nếu dự án đã có, nếu không thì kiểm thuộc tính) không báo lỗi.
    - Chưa bấm bật thì chunk `docCauTraLoi` chưa được nạp (kiểm bằng `napPhanDoc` giả đếm lần gọi); bấm bật → nạp đúng một lần.
    - `npm run lint` sạch (không chuỗi viết cứng trong JSX); khoá `doc.nhan` có kiểu (sai khoá là lỗi build).

- [x] T05 [chatbot-dev] [P] Bảo vệ BR-6 bằng test quét mã nguồn (`plan.md` §6; BR-6, AC-6):
  - Một test Vitest đọc mọi tệp `src/**/*.{ts,tsx}` (không gồm chính nó) và không được thấy `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `mediaDevices`, `MediaRecorder`, thuộc tính `capture=`; không được thấy `speechSynthesis.speak` ngoài `features/chatbot/doc/`.
  - file: `src/FrontEnd/src/features/chatbot/doc/khongMicro.test.ts`
  - xong khi: test xanh; thử thêm tạm một dòng `new webkitSpeechRecognition()` vào một tệp khác thì test đỏ (ghi vào báo cáo, rồi gỡ dòng thử).

- [x] T06 [chatbot-dev] Đo kích thước, kiểm nạp lười (`plan.md` §5; BR-4) — sau T04:
  - `npm run build` (Release, đã obfuscate): ghi gzip của (a) chunk phần đọc, (b) chunk khung trước và sau F07, (c) `index`/`vendor` ở `/` 1280 px trước và sau.
  - Kiểm bằng `vite preview` + Playwright tạm hoặc `curl`: chưa mở khung → không tải chunk khung và chunk phần đọc; mở khung → chỉ tải chunk khung; bật đọc → tải chunk phần đọc và `GET /api/tro-ly/viet-tat` (tên chunk có thể thấy trong `dist/assets`).
  - file: không sửa mã (chỉ báo cáo vào phần trả về của task); chỉnh mã trong `features/chatbot/doc/` nếu vượt trần.
  - xong khi: bundle chính **tăng 0 byte** so với trước F07 (báo số cụ thể); chunk phần đọc **≤ 3 KB gzip** (vượt: dừng, báo planner, không tự cắt luật đọc); chunk khung tăng ≤ 2 KB; chunk phần đọc không nằm trong danh sách tải đầu của `index.html`.

## code-reviewer

- [ ] T07 [code-reviewer] Review T01–T06 theo `CLAUDE.md`, `plan.md` → `result/review.md` (tạo): trọng tâm — **BR-1: không đường nào gửi văn bản đọc ra ngoài**, chọn giọng chỉ `localService` và `utterance.voice` luôn được gán; BR-6: không API micro (T05 xanh); không `dangerouslySetInnerHTML`, bảng viết tắt chỉ vào `utterance.text`; khoá `RegExp` được `escape`; `localStorage` chỉ khoá `doc-bat`, không nội dung; bundle chính không đổi (báo cáo T06); chuỗi chữ qua `t()`; endpoint: R1–R3, chỉ trả hai trường, không `AppDbContext`; số phiên chặn mọi đường phát sau khi dừng (kể cả `setTimeout`, tải bảng); dọn hiệu ứng (`pagehide`, `voiceschanged`, `pointerdown`/`keydown`) khi gỡ; không `console`; điểm ghép F06 đúng tên (`ChoNutDoc`, `useDiemGhepDoc`, `vanBanDoc`) — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn đã được chatbot-dev sửa.

## tester

- [x] T08 [tester] [P] `testcases.md` cho F07 — mọi BR-1…BR-7 và AC-1…AC-8, mỗi mục có ít nhất một ca thử (cách làm, dữ liệu, kết quả mong đợi); ghi rõ ca nào tự động (Vitest, Playwright với `speechSynthesis` giả), ca nào bắt buộc thử tay với giọng thật (Windows, Android Chrome, Safari iOS, kiosk thật, Zalo/WebView), ca nào chờ F06 (khung chat) hoặc F09 (nút "Bắt đầu lại"). Thêm ca: Cần hỏi 4 (đếm máy có giọng cục bộ), bảng viết tắt đổi bằng Excel rồi tải lại trang → đọc theo bảng mới, câu thật nghe thử (ngày, số hiệu văn bản, tiền) — file: `.specify/specs/F07-giong-noi/testcases.md` — xong khi: mỗi BR/AC có ca thử; bảng truy vết BR/AC → ca.

- [x] T09 [tester] Integration BE (`plan.md` §3, §7) — sau T01:
  - `Tests/Integration/Chatbot/DocCauTraLoi/VietTatDocServiceTrenPostgreSql.cs`: lớp con của `VietTatDocServiceContract` (tạo DB riêng, chạy migration, chèn cùng bộ dữ liệu bằng `AppDbContext` như `DanhMucServiceTrenPostgreSql`); **JSON giống hệt** với nguồn Mẫu.
  - Sau khi `nhap tro-ly` (Import) với file có thêm một dòng viết tắt → `GET /api/tro-ly/viet-tat` thấy dòng mới, ETag đổi (nhập lại → phiên bản đổi).
  - file: `src/BackEnd/DichVuCong.Tests/Integration/Chatbot/DocCauTraLoi/`
  - xong khi: mọi ca có kết quả; `dotnet test` xanh khi có DB thử, bỏ qua (không đỏ) khi không có.

- [x] T10 [tester] E2E, truy cập, ngân sách (`plan.md` §5, §6, §7) — sau T04, F06 T13 (khung chat và BE chạy); các ca kiosk sau F09 T02:
  - `e2e/doc-cau-tra-loi.spec.ts` (Playwright, Chromium): `addInitScript` thay `speechSynthesis`, `SpeechSynthesisUtterance` bằng bản giả ghi lại `getVoices`, `speak`, `cancel` (Chromium không giọng sẵn); bẫy `SpeechRecognition`, `webkitSpeechRecognition`, `navigator.mediaDevices.getUserMedia` và đếm lần gọi.
  - Ca: AC-4 lần đầu tắt; AC-1 bật, hỏi → có `speak`; AC-2 đáp án chứa "TTHC" (dùng `page.route` trả đáp án có "TTHC" nếu dữ liệu mẫu không có) → văn bản đọc chứa "thủ tục hành chính", chữ trên màn hình vẫn "TTHC"; AC-3 tắt → có `cancel`, tải lại vẫn tắt, bật rồi tải lại vẫn bật; AC-5 giả lập không có giọng → không thấy nút, không lỗi console; AC-6 dùng trang + trợ lý → số lần gọi API micro = 0 và không có hộp thoại quyền; AC-7 đang đọc, hỏi câu mới → `cancel` rồi chỉ đọc câu mới; AC-8 đóng bằng ✕, bằng nút "Trợ lý", bằng Esc → `cancel` ngay, mở lại không `speak` thêm; `pagehide` (điều hướng đi) → `cancel`.
  - BR-1: khi đọc, danh sách yêu cầu mạng chỉ có `GET /api/tro-ly/viet-tat` (không có yêu cầu mang văn bản đọc). BR-4: chưa bật → không có yêu cầu tới chunk phần đọc và `viet-tat`; bật → có.
  - Kiosk 1080×1920: bật đọc, bấm "Bắt đầu lại" → `cancel` được gọi, sau khi tải lại nút vẫn bật (`doc-bat` còn), khung rỗng. Kiểm F09 AC-9: trong `localStorage` chỉ còn các khoá cho phép (`cach-xem`, `doc-bat`), không có nội dung hội thoại.
  - axe ở khung mở có nút đọc (thường và kiosk); nút có tên "Đọc câu trả lời", `aria-pressed` đổi đúng, vùng bấm ≥ 44 px (≥ 48 px ở kiosk); đi hết khung bằng bàn phím, nút đọc đứng giữa tên khung và ✕ trong thứ tự Tab.
  - Ngân sách: JS tải đầu ≤ 200 KB gzip ở `/` 375 và 1280 px (bản Release), không đổi so với trước F07.
  - file: `src/FrontEnd/e2e/doc-cau-tra-loi.spec.ts`
  - xong khi: spec chạy xanh trên Chromium; ghi kích thước gzip chunk phần đọc vào báo cáo.

- [x] T11 [tester] Chạy `testcases.md`, thử tay với giọng thật → `.specify/specs/F07-giong-noi/result/test.md`:
  - Chạy mọi ca. Thử tay: Windows (Chrome/Edge, có và không có giọng tiếng Việt cục bộ), Android Chrome, **iPhone Safari thật (rủi ro 1: bật đọc rồi hỏi — có tiếng không)**, trình duyệt trong Zalo, máy kiosk thật khi có (câu hỏi mở 10). Nghe thử câu thật: thành phần hồ sơ, thời hạn, phí, căn cứ pháp lý (số hiệu văn bản), giờ làm việc; ghi câu nào đọc kém để chatbot-dev thêm luật vào `luatDoc.ts`.
  - Chrome: câu trả lời dài (hồ sơ nhiều giấy tờ) đọc hết, không dừng giữa chừng.
  - Báo: tỷ lệ máy thử có nút (Cần hỏi 4); điểm F09 chưa kiểm được (nếu F09 chưa xong).
  - xong khi: mọi ca có kết quả. Đạt hết → đổi `trang_thai` của `spec.md` sang `xong`.
