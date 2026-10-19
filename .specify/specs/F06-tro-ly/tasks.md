# F06 · Trợ lý trả lời theo luật — tasks

`[P]` = chạy song song được với task liền trước. Mục, bảng nhắc tới trong task là của `plan.md`. Mọi task BE: `dotnet build src/BackEnd/DichVuCong.sln` sạch (cảnh báo là lỗi) và `dotnet test --solution src/BackEnd/DichVuCong.sln` xanh. Mọi task FE: `npm run lint`, `npm test`, `npm run build` sạch.

Điều kiện bắt đầu:

- **Làm ngay** (không chờ gì): chatbot-dev T01 và T02 (song song), chatbot-dev T09 (hợp đồng FE đã chốt ở `plan.md` §3.3, chưa cần BE chạy); ui-core-dev T08; tester T16.
- chatbot-dev BE theo chuỗi: T03 sau T02; T04 sau T02, T03; T05 sau T01, T03, T04; T06 sau T05; T07 song song T06.
- FE: T10 (ui-core-dev) sau T09; T11 sau T08, T09; T12 song song T11; T13 sau T10, T11, T12.
- T14 (code-reviewer, BE) sau T07; T15 (FE) sau T13. T17 (tester) sau T07. T18 sau T10, T13. T19 sau mọi task khác.
- Không cần task cho db-dev (không đổi bảng, cột, chỉ mục, migration), backend-dev, frontend-dev.
- Không viết SQL, không `AppDbContext`: trợ lý đọc qua `INguonDuLieu` (F00 §9.4 R1–R7), ghi qua `IKhoCauChuaTraLoi` (đã có, F00 T28).
- Không gõ `\uXXXX` qua Edit hay Bash (công cụ đổi thành ký tự thật, vô hình khi review). Ký tự vô hình trong mã hay test: ghép trong một tệp script hoặc dùng `(char)0x200E` / `String.fromCodePoint(0x200e)`. Sau khi ghi tệp, kiểm: `LC_ALL=C.UTF-8 grep -nP "[\x{200B}-\x{200F}\x{FEFF}]" <tệp>` — chỉ được ra ở chỗ chủ ý.
- Các tệp `app/routes.tsx`, `app/i18n.d.ts`, `core/i18n/vi/common.json`, `app/layout/Layout.tsx` cũng bị chức năng khác sửa: đọc lại ngay trước khi sửa, không ghi đè phần của task khác.
- Không thêm gói NuGet hay npm.

## chatbot-dev — BE (`Features/Chatbot/`)

- [x] T01 [chatbot-dev] Che thông tin cá nhân (`plan.md` §4.8; BR-8):
  - `CheThongTinCaNhan.Che(string)` và `Bo(string)`: ba mẫu (email, số liền ≥ 9 chữ số, số có dấu ngăn có 9–15 chữ số), `[GeneratedRegex]` có `matchTimeoutMilliseconds`, thứ tự email → số liền → số có dấu ngăn; `Che` cắt về tối đa `CauChuaTraLoi.DoDaiToiDa` ký tự, không cắt giữa cặp surrogate.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/CheThongTinCaNhan.cs`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/CheThongTinCaNhanTests.cs`
  - xong khi:
    - Test: `0912345678` → `09******78`; `079123456789` → `07********89`; `nguyenvana@gmail.com` → `n***@gmail.com`; `0912 345 678`, `0912.345.678`, `+84 912 345 678` được che; câu AC-8 và AC-16 ra đúng chuỗi ở `plan.md` §9 (câu 29, 30).
    - Test không che: mã thủ tục `1.012784`, `1.001193.02`, ngày `12 05 2026`, số 8 chữ số.
    - `Bo` thay mỗi chỗ khớp bằng đúng một dấu cách; câu 500 ký tự toàn email ngắn sau `Che` không vượt 500.
    - Ghi vào báo cáo hai giới hạn đã biết (số tiền lớn bị che; số điện thoại viết bằng chữ không bị che).

- [x] T02 [chatbot-dev] [P] Nền tìm kiếm: tách từ, ngôn ngữ hỏi, khoảng cách sửa (`plan.md` §4, §4.4):
  - `TimKiem/ChuoiTu.cs`: chuẩn hoá bằng `TiengViet.ChuanHoaTimKiem`, tách ở ký tự ngoài `[a-z0-9]`; hàm tìm dãy từ liền nhau, thay dãy dài nhất trước (cho viết tắt, từ đồng nghĩa, cụm). Mọi `StartsWith`/`EndsWith`/`Contains` kèm so sánh (nếu có) chỉ ở tệp này, mỗi chỗ ghi `// R4-ngoai-le: so khớp trong bộ nhớ trên chuỗi đã chuẩn hoá, không phải truy vấn`.
  - `TimKiem/NgonNguHoi.cs`: hằng đúng như §4.4 — từ đệm chung, cụm đệm lời dẫn, cụm hỏi chung, bảng 7 mục hỏi (thứ tự `thoi-han`, `noi-nop`, `ho-so`, `phi`, `trinh-tu`, `ket-qua`, `can-cu`), cụm quầy/cán bộ, cụm hỏi tình trạng hồ sơ cá nhân.
  - `TimKiem/KhoangCachSua.cs`: Damerau–Levenshtein (chèn, xoá, thay, đảo hai ký tự kề) có chặn trên theo ngưỡng.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/TimKiem/{ChuoiTu.cs, NgonNguHoi.cs, KhoangCachSua.cs}`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/TimKiem/`
  - xong khi:
    - Test `ChuoiTu`: `Đăng ký` (NFD), `HỘ   TỊCH`, chuỗi có U+200E giữa chữ và U+FEFF cho cùng dãy từ như bộ mẫu F00 §4; "QĐ-UBND" → `qd ubnd`; dấu câu thành ranh giới từ; `1.001193` → `1`, `001193` (mã thủ tục nhận ở bước khác, không bằng dãy từ).
    - Test thay dãy: "đám cưới" thắng "cưới"; hai cụm chồng nhau chọn dài nhất; không thay giữa từ ("cuoi" không khớp trong "cuoi cung" như một từ riêng — khớp theo từ nguyên).
    - Test `KhoangCachSua`: `sjnh`→`sinh` = 1, `hno`→`hon` = 1 (đảo), `khaii`→`khai` = 1; chặn trên trả "quá xa" sớm.
    - Tìm kiếm `Ordinal`/chọn xác định: hai ứng viên cùng khoảng cách → chọn `df` lớn hơn, hoà nữa → thứ tự `Ordinal` nhỏ hơn (test dựng từ điển nhỏ).
    - `QuyTacTruyVanTests` xanh.

- [x] T03 [chatbot-dev] Chỉ mục trong bộ nhớ và chấm điểm (`plan.md` §4.2, §4.3, §4.9) — sau T02:
  - `TimKiem/ChiMucTroLy.cs` + `KhoChiMuc.cs` (singleton, `SemaphoreSlim`, kiểm hai lần, khoá theo `IPhienBanDuLieu`): dựng từ `INguonDuLieu` đúng bảng ở §4.2, chỉ `DanhSachAsync`, `Select` ra kiểu ẩn danh, sắp trong truy vấn theo khoá số hoặc trong C# bằng `Ordinal`, không đọc navigation (cách hỏi mẫu ghép trong bộ nhớ theo `CauHoiMauThuTu`).
  - `TimKiem/ChamDiem.cs` (`ThamSo` khởi điểm ở §4.9; `TimThuTuc`, `TimMau`) và `PhanTichCauHoi` (6 bước §4.3: `Bo`, viết tắt, đồng nghĩa, sửa lỗi gõ, nhận cụm, rút `tuMau`/`tuNoiDung`); nhận mã thủ tục/`MaDvc` bằng tra bảng.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/TimKiem/{ChiMucTroLy.cs, KhoChiMuc.cs, ChamDiem.cs, PhanTichCauHoi.cs}`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/TimKiem/`
  - xong khi:
    - Trên `TepDuLieuMau.Nhung`, đối chiếu bảng "Số đo tham khảo" của §4.3 (sai số ≤ 0,01): "khai sinh", "khai tu" (bản gốc đứng trước bản "lại"), "ket hon" (5 thủ tục có "kết hôn"), "khai sjnh" (`phu` ≈ 0,74, đủ chắc), "gia vang hom" và "xem boi" không đủ liên quan.
    - `TimMau`: "dieu kien tach thua" với câu mẫu thêm → 0,93 và thắng câu hợp thửa; "van phong nam cho nao" → câu địa chỉ; "tach thua dat" và "tach thua can giay to gi" → không khớp mẫu.
    - Nhận mã: "1.001193 mấy ngày" ra thủ tục `1.001193` (điểm 1, đủ chắc); mã `MaDvc`.
    - Đồng nghĩa/viết tắt: "cưới vợ" → `ket hon`; "đk kết hôn" → `dang ky ket hon`; câu có từ đệm "cho tôi hỏi … ạ" ra cùng `tuNoiDung` như câu không có.
    - Chỉ mục dựng lại khi `IPhienBanDuLieu` đổi, không dựng lại khi không đổi; 20 yêu cầu song song cùng phiên bản mới → đúng một lần dựng (đếm bằng nguồn dữ liệu giả).
    - Xếp hạng xác định: đảo thứ tự đọc của nguồn dữ liệu giả (cùng dữ liệu) cho cùng danh sách.
    - Báo: thời gian dựng và bộ nhớ ước với 408 và với 1.000 thủ tục (`TroLyThu.TaoLon` — T07 tạo; dùng bản tạm nếu T07 chưa xong).

- [x] T04 [chatbot-dev] DTO, trả lời Trung tâm, trả lời quầy và nhân sự (`plan.md` §3.2, §4.4, §4.6; BR-3, BR-9, BR-10) — sau T02, T03:
  - `TroLyDtos.cs`: đúng các record ở §3.2 (tên và thứ tự trường); tái dùng `GiayToDto`, `BuocTrinhTuDto`, `CanCuDto` (F03), `GioLamViecDto`, `LienKetDto` (F08). `HoiRequest`, `HoiChuDeRequest` có thuộc tính kiểm.
  - `TraLoi/TraLoiTrungTam.cs`: 5 mục, `CoDuLieu`, `LienKet` theo tên "Cổng Dịch vụ công Quốc gia" (hằng `TenLienKetCongDvc`, so sau `ChuanHoaTimKiem`), `lienHe` khi `CoDuLieu` = false; đọc `trung_tam`, `gio_lam_viec`, `lien_ket` lúc hỏi.
  - `TraLoi/TraLoiQuay.cs`: xác định lĩnh vực (tên trong câu → thủ tục đủ chắc → ngữ cảnh), `Quay` và `NoiTiepNhanChuyen` từ `phan_cong_linh_vuc`, `CanBo` từ `nhan_su` theo số quầy, `TimTheoTen` (§4.4); không có quầy hoặc nhân sự → `CanBo` rỗng, không tên.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/{TroLyDtos.cs, TraLoi/TraLoiTrungTam.cs, TraLoi/TraLoiQuay.cs}`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/`
  - xong khi:
    - Test trên nguồn Mẫu với biến thể dữ liệu: địa chỉ có/không `BanDo`; giờ làm việc có/không (AC-22); điện thoại, email; Cổng DVC có/không trong `lien_ket`; Zalo OA có/không trong `lienHe` (AC-23); đổi địa chỉ Trung tâm rồi hỏi lại ra địa chỉ mới (AC-18).
    - Quầy (AC-3, AC-12, AC-24): Hộ tịch → quầy 3; lĩnh vực chưa có dòng phân công → `Quay` null; không có phân công → `Quay` null và `CanBo` rỗng; có phân công + một cán bộ ở quầy 4 → "ai phụ trách đất đai" ra đúng người; "quầy 4 ai phụ trách" ra người đó; số quầy không có nhân sự → `Quay` null; `TimTheoTen` khớp "chị Nhung", "gặp Cường", họ tên đủ, không khớp "nhưng" hay tên một mình.
    - Không trường hợp nào có `Quay` khác null hoặc `CanBo` khác rỗng khi dữ liệu không có (đếm trên toàn bộ biến thể).
    - `trung_tam` trống: mọi đáp án vẫn dựng được, không ném lỗi.

- [x] T05 [chatbot-dev] Ghép dịch vụ trả lời 5 bước (`plan.md` §4.5–§4.7; BR-1, BR-7, BR-8, BR-11, BR-12) — sau T01, T03, T04:
  - `TroLyService` (`ITroLyService`: `HoiAsync`, `HoiChuDeAsync`, `LayChuDeAsync`): thứ tự bước theo pseudo-code §4.5, ngữ cảnh §4.7, bỏ qua mẫu Trung tâm theo BR-9, hỏi tình trạng hồ sơ cá nhân → bước 5.
  - `TraLoi/TraLoiThuTuc.cs`: gọi `IChiTietThuTucService.LayAsync`, cắt theo §4.6 (hồ sơ 8, trình tự 2 × 500, kết quả 6, căn cứ 6 × 200, `Tong`), `ThuTucKhac` ≤ 3 khi tìm bằng tìm kiếm; `noi-nop` thêm `Quay`, `NoiTiepNhanChuyen`, `TrungTam`.
  - `TraLoi/TraLoiChuDe.cs`: so `LinhVucMa`, mỗi thủ tục một lần, 10 đầu, `Tong`, quầy.
  - Bước 5: `IKhoCauChuaTraLoi.GhiAsync(Che(cau))`; lỗi ghi chỉ log Warning (loại lỗi, không nội dung) và vẫn trả đáp án.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/{TroLyService.cs, TraLoi/TraLoiThuTuc.cs, TraLoi/TraLoiChuDe.cs}`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/`
  - xong khi:
    - Bộ 42 câu ở `plan.md` §9 chạy qua `TroLyService` trên nguồn Mẫu và cho đúng `loai`, `muc`, mã, ngữ cảnh (tạm viết thành test riêng; T07 chuyển thành test hợp đồng).
    - Test ngữ cảnh: sau "kết hôn" → `thuTucDangNoi` = `1.000894`; Trung tâm/quầy/không hiểu giữ nguyên ngữ cảnh gửi lên; ngữ cảnh mã không tồn tại bị bỏ và không phát lại.
    - Test ghi kho (kho giả): chỉ `khong-hieu` ghi; nội dung ghi là bản đã che; hai lần "giá vàng hôm nay" → kho thật (Mẫu) một dòng, 2 lần gặp; kho ném lỗi → vẫn trả `khong-hieu`; log không chứa nội dung câu.
    - Chủ đề: lĩnh vực 15 thủ tục → `tong` 15 với 10 phần tử; 0 thủ tục → `tong` 0 rỗng; "Chăn nuôi" không lẫn "Nuôi con nuôi"; thủ tục thuộc cả hai cấp chỉ một lần.
    - `QuyTacTruyVanTests`, `KienTrucTests` xanh.

- [x] T06 [chatbot-dev] Controller, đăng ký dịch vụ và test HTTP (`plan.md` §3, §3.4) — sau T05:
  - `TroLyController` (`api/tro-ly`): `POST hoi` và `POST chu-de` (`[EnableRateLimiting(RateLimitPolicies.TroLy)]`, `[Consumes("application/json")]`, không output cache); `GET chu-de` (`[HttpGet]` `[HttpHead]`, `[OutputCache(PolicyName = CachePolicies.DanhMuc)]`, `[EnableRateLimiting(RateLimitPolicies.DanhMuc)]`, không `[DanhMucQuery]`); chủ đề không có → `NotFound()` (thân rỗng, `UseStatusCodePages` đổi thành ProblemDetails `khong-tim-thay`).
  - `AddChatbot(nguon)`: thêm `AddScoped<ITroLyService, TroLyService>()`, `AddSingleton<KhoChiMuc>()` (giữ kho câu chưa trả lời, việc xoá định kỳ, `TimeProvider` như cũ).
  - Kiểm `CauHoi` có chữ nhìn thấy (sau bỏ ký tự vô hình) → 400.
  - file: `src/BackEnd/DichVuCong.Api/Features/Chatbot/{TroLyController.cs, ChatbotServiceCollectionExtensions.cs}`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/TroLyTests.cs`
  - xong khi:
    - Test HTTP đúng bảng "TroLyTests" ở `plan.md` §9: JSON camelCase và đủ trường kể cả `null`; 400 cho rỗng, toàn khoảng trắng, 501 ký tự — và kho **không** có dòng (AC-13); 500 ký tự → 200; 404 chủ đề; 405; 413 (body > 64 KB); 429 ở ngưỡng 5 (câu 6 bị chặn, hết phút lại được — AC-7) và 60/61 (AC-28); chip chủ đề cùng bộ đếm; GET chip có `ETag`, `Cache-Control: no-cache`, 304 khi `If-None-Match` khớp, đổi phiên bản → dữ liệu mới.
    - 400 và log của yêu cầu không chứa nội dung câu hỏi (bắt bằng `BoGhiLog`).
    - `dotnet run` nguồn Mẫu: `curl -k -X POST https://localhost:7157/api/tro-ly/hoi -H "Content-Type: application/json" -d '{"cauHoi":"khai sinh","maThuTuc":null}'` trả đúng dạng §3.5; `GET /api/tro-ly/chu-de` trả 6 chủ đề.

- [x] T07 [chatbot-dev] [P] Test hợp đồng hai nguồn, bộ thử ≥ 30 câu, hiệu chỉnh ngưỡng (`plan.md` §9; F00 §9.10, R7):
  - `Tests/Api/DuLieuThu/TroLyThu.cs`: biến thể của `TepDuLieuMau.Nhung` bằng C# (phân công + nhân sự; câu mẫu "điều kiện tách thửa đất"; địa chỉ Trung tâm thử A/B; bỏ giờ làm việc; thêm/bỏ Zalo OA; bỏ liên kết Cổng DVC; từ đồng nghĩa "giấy khai sinh"; lĩnh vực 15 và 0 thủ tục) và `TaoLon(1000)` (tên ghép từ từ vựng thật, mã không trùng).
  - `Tests/Api/Chatbot/TroLyServiceContract.cs` (42 ca ở `plan.md` §9, so sánh `loai`, `muc`, mã, ngữ cảnh, và nội dung kho cho các ca ghi) + `TroLyServiceTrenMau.cs` (dựng `INguonDuLieu` như `ThongTinTrungTamServiceTrenMau`).
  - Hiệu chỉnh `ChamDiem.ThamSo` nếu có ca không đạt; không đổi cấu trúc thuật toán.
  - file: `src/BackEnd/DichVuCong.Tests/Api/DuLieuThu/TroLyThu.cs`, `src/BackEnd/DichVuCong.Tests/Api/Chatbot/{TroLyServiceContract.cs, TroLyServiceTrenMau.cs}`
  - xong khi:
    - 42 ca xanh trên nguồn Mẫu. Báo ngưỡng cuối cùng (nếu khác §4.9) và lý do.
    - Thêm ít nhất 8 ca ngoài bảng: câu có lỗi gõ khác (đảo chữ, thiếu dấu cách "khaisinh" — ghi rõ là **không** hỗ trợ nếu không đạt), câu hỏi lẫn từ đệm, câu hai thủ tục, câu rất ngắn ("kết"), mã thủ tục viết hoa/thường, "TTHC" trong câu, câu có dấu U+200E; mỗi ca có kỳ vọng rõ.
    - Báo thời gian trung bình mỗi câu trên nguồn Mẫu với 408 thủ tục và với `TaoLon(1000)` (đo thô; p95 chính thức do tester ở T17).

## ui-core-dev

- [x] T08 [ui-core-dev] [P] Trích vòng Tab của `Modal` ra `core/utils/vongTab.ts` (`plan.md` §5.6):
  - Chuyển `layVongTab`, `bamDuoc`, `dangHienThi`, hằng `data-ngoai-popup` và bộ chọn phần tử Tab được sang `core/utils/vongTab.ts`; xuất `layVongTab(khung)` và `xuLyPhimTab(e: KeyboardEvent, khung: HTMLElement)` (đi vòng trong khung rồi tới các `[data-ngoai-popup]`); `Modal` gọi lại, hành vi không đổi.
  - file: `src/FrontEnd/src/core/utils/{vongTab.ts, vongTab.test.ts}`, `src/FrontEnd/src/core/components/Modal/Modal.tsx`
  - xong khi: `Modal.test.tsx` giữ nguyên và xanh; test mới cho `vongTab`: vòng gồm phần tử trong khung rồi `[data-ngoai-popup]`, bỏ phần tử `disabled`, `tabindex="-1"`, ẩn, hoặc trong `[inert]`; Shift+Tab từ đầu nhảy về cuối; `npm run lint` sạch (core không import features).

- [x] T10 [ui-core-dev] Nối vỏ trợ lý vào khung trang và đo ngân sách (`plan.md` §5.6, §7) — sau T09:
  - `core/i18n/vi/common.json`: khoá `tro-ly.nut` ("Trợ lý").
  - `app/i18n.d.ts`: thêm namespace `chatbot` (`import type` từ `features/chatbot/i18n/vi.json`).
  - `app/layout/Layout.tsx`: thay chú thích F06 bằng `<RanhGioiKhung><NutTroLy /></RanhGioiKhung>` (sau chân trang); cập nhật `Layout.test.tsx` nếu cần (không có yêu cầu mạng mới khi chưa bấm nút).
  - Đo trước và sau khi gắn vỏ bằng `npm run build` (bản Release, đã obfuscate): kích thước gzip của từng chunk ban đầu ở `/` 375 và 1280 px.
  - file: `src/FrontEnd/src/core/i18n/vi/common.json`, `src/FrontEnd/src/app/{i18n.d.ts, layout/Layout.tsx, layout/Layout.test.tsx}`
  - xong khi:
    - Mọi trang có nút "Trợ lý" ở góc phải dưới (`FloatingButton`); cuộn tới cuối: nút không che chữ chân trang (`--fab-clearance`); `npm test`, `npm run lint`, `npm run build` sạch.
    - **JS tải đầu tăng ≤ 1 KB gzip** so với trước khi gắn (báo số cụ thể: `index`, `vendor`, tổng); chunk `KhungTroLy` và namespace `chatbot` **không** nằm trong danh sách tải đầu (kiểm `index.html` và mạng ở Playwright/`vite preview`). Tăng hơn 1 KB: **dừng, báo người dùng**, không tự cắt tính năng.
    - Bấm nút → chunk khung tải, nút `aria-expanded` đổi (kiểm với khung tạm của T09 hoặc T11 nếu đã có).

## chatbot-dev — FE (`features/chatbot/`)

- [x] T09 [chatbot-dev] Nền FE: kiểu và gọi API, câu chữ, điều khiển, vỏ nút (`plan.md` §3.3, §5.1, §5.5):
  - `api/troLy.ts`: kiểu ở §3.3, `hoiTroLy`, `hoiChuDe` (gọi `http()` trực tiếp, không TanStack), `useChuDeGoiY(mo)` (khoá `['tro-ly','chu-de']`).
  - `i18n/vi.json` (đủ khoá cho §5.2–§5.4, câu theo spec) và `i18n/index.ts` (`napNgonNguTroLy`, mẫu của `features/thu-tuc/i18n`).
  - `dieuKhienTroLy.ts`: `batDauLaiTroLy()` và hàm đăng ký lắng nghe (không import gì nặng).
  - `NutTroLy.tsx`: vỏ theo §5.1 (nạp lười khung bằng `import()` song song `napNgonNguTroLy()`, nhớ promise, lỗi nạp thì thử lại lần bấm sau; nạp trước khi `pointerdown`/`focus`; mở/đóng; trả con trỏ về nút; `phien`/`key`). Kèm `KhungTroLy.tsx` **tạm** (khung rỗng có nút ✕) để dựng được; T11 thay.
  - file: `src/FrontEnd/src/features/chatbot/{api/troLy.ts, i18n/index.ts, i18n/vi.json, dieuKhienTroLy.ts, NutTroLy.tsx, KhungTroLy.tsx}` và `*.test.ts(x)` cạnh từng tệp
  - xong khi:
    - Test (`fetch` giả): `hoiTroLy` gọi `POST /api/tro-ly/hoi` với body `{cauHoi, maThuTuc}`; `hoiChuDe` gọi `POST /api/tro-ly/chu-de`; lỗi 429 ném `ApiError` có `code` = `qua-nhieu-yeu-cau`; kiểu `CauTraLoi` biên dịch với bốn ví dụ JSON của §3.5 (thêm vào `tsc`).
    - Test vỏ: chưa bấm thì không có yêu cầu mạng và không tải chunk khung; bấm → tải; bấm lại → đóng và con trỏ về nút; `batDauLaiTroLy()` đóng và đổi `key`; nạp lỗi rồi bấm lần nữa vẫn mở được.
    - Vỏ không import (trực tiếp hay gián tiếp) `KhungTroLy`, `api/troLy`, `Chip`, `Modal`, `gioLamViec`, `vi.json` của `chatbot`: kiểm bằng kết quả `npm run build` ở T10.
    - `npm run lint` sạch (không chuỗi viết cứng trong JSX).

- [x] T11 [chatbot-dev] Khung chat: bố cục, trạng thái hội thoại, truy cập, điểm ghép F07/F09 (`plan.md` §5.2, §6) — sau T08, T09:
  - `KhungTroLy.tsx` thật (thay bản tạm), `useHoiTroLy.ts` (reducer: tin nhắn tối đa 60, đang chờ, `thuTucDangNoi`, cờ `coLienKetCongDvc`; gửi, gửi chủ đề, thử lại; huỷ yêu cầu khi gỡ khung), `TinNhan.tsx`, chip chủ đề + chip hỏi tiếp, ô nhập 500 ký tự, lời miễn trừ, tin chờ, tin lỗi (dùng `useThongBaoLoi`).
  - Truy cập: `role="log"` `aria-live="polite"`; mở → con trỏ vào ô nhập; Esc đóng (không khi có popup); vòng Tab bằng `core/utils/vongTab` (gồm `[data-ngoai-popup]`); cuộn tới đầu câu trả lời mới; hiệu ứng chỉ độ mờ ≤ 150 ms, tắt khi giảm chuyển động.
  - Điểm ghép: `ChoNutDoc.tsx` (rỗng), `NhacDangXuat.tsx` (rỗng, nhận `coLienKetCongDvc`), `diemGhepDoc.ts` (context + `useDiemGhepDoc`), `vanBanDoc.ts` (chữ thuần của đáp án, bỏ nhãn nút) — đúng tên và dạng ở §6.
  - CSS Module chỉ dùng `var(--…)` (370 × 530 px theo rem, toàn màn hình dưới 600 px, `--z-chat`).
  - Dùng `CauTraLoiView` của T12 (đến khi T12 xong dùng bản tạm in `loai`).
  - file: `src/FrontEnd/src/features/chatbot/{KhungTroLy.tsx, KhungTroLy.module.css, useHoiTroLy.ts, TinNhan.tsx, ChoNutDoc.tsx, NhacDangXuat.tsx, diemGhepDoc.ts, vanBanDoc.ts}`
  - xong khi:
    - Gửi câu hỏi → hiện tin của người dân, tin chờ, rồi đáp án; ngữ cảnh gửi kèm câu sau và được gán lại bằng `thuTucDangNoi`; bấm chip chủ đề gọi `hoiChuDe`.
    - Ô nhập dừng ở 500 ký tự và hiện "Tối đa 500 ký tự" (`role="status"`); bấm "Gửi" hai lần nhanh → một yêu cầu; câu rỗng không gửi.
    - 429 → tin lỗi đúng câu "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại." với nút "Thử lại"; khung và hội thoại còn nguyên.
    - Không có chủ đề → không có hàng chip; đóng rồi mở lại khung: hội thoại còn, chip được tải lại (yêu cầu có điều kiện).
    - `batDauLaiTroLy()` → khung đóng, mở lại thì rỗng (chỉ còn lời chào), ô nhập rỗng, ngữ cảnh mất ("mấy ngày" sau đó không ra thời hạn thủ tục cũ).
    - Mở popup từ khung (qua T12) rồi đóng/"Quay lại": khung và hội thoại còn.
    - Chạy tay: Tab đi vòng đúng; Esc đóng; con trỏ về nút Trợ lý.

- [x] T12 [chatbot-dev] [P] Giao diện từng loại đáp án (`plan.md` §5.3, §5.4) — sau T09:
  - `CauTraLoiView.tsx` và `view/`: `TraLoiThuTuc` (7 mục + `thuTucKhac`), `DanhSachThuTuc`, `TraLoiChuDe`, `TraLoiCauHoiMau`, `TraLoiTrungTam` + `GioLamViecView` (dùng `gopNgay`, `dangLamViec` của `features/trang-chu/gioLamViec`; trạng thái tính một lần lúc đáp án đến), `TraLoiQuay`, `KhongHieu`, `NutLienHe` (nút gọi `tel:` luôn có; nút Zalo chỉ khi `zaloOa`), `LoiTinNhan`.
  - Mỗi thủ tục nhắc tới = cặp nút "Xem chi tiết" (`useMoThuTuc().mo(ma)`) và "Xem và nộp trên Cổng DVC" (`ExternalLink nut-accent`, `linkDvc(ma)`); dùng `NutMoThuTuc` của F03 nếu phù hợp.
  - BR-3: `quay` null → không có chữ "quầy" nào và không tên cán bộ; hiện "nộp hồ sơ tại <Trung tâm>, địa chỉ …".
  - Tên, `traLoi`, địa chỉ là chữ thuần (`white-space: pre-line` cho câu mẫu); không `dangerouslySetInnerHTML`.
  - file: `src/FrontEnd/src/features/chatbot/{CauTraLoiView.tsx, view/*.tsx, view/*.module.css}`
  - xong khi:
    - Test từng `loai` với JSON mẫu của `plan.md` §3.5 và biến thể: mục `thoi-han` có/không (`null` → "chưa ghi rõ"), `ho-so` kèm "bản chính/bản sao" và "và n giấy tờ nữa", `noi-nop` có/không quầy, `chu-de` 10 trong 15 và `tong` 0, `trung-tam` đủ 5 mục kể cả `coDuLieu` false (có nút gọi, không có giờ/địa chỉ đoán), `banDo` null không có liên kết, `zaloOa` null không có nút Zalo, `quay` có/không.
    - Giờ làm việc với đồng hồ giả: 10:00 thứ Hai "Đang trong giờ làm việc"; 12:00 "Ngoài giờ làm việc"; hai đáp án hỏi ở hai thời điểm giữ trạng thái riêng.
    - Liên kết Cổng DVC trùng `linkDvc(ma)`, `target="_blank"`, `rel` có `noopener noreferrer`; liên kết nộp trực tuyến mở tab mới đúng `url`.
    - Không có `quay` thì không có chữ "quầy" trong DOM của đáp án `quay`/`thu-tuc noi-nop` (test tìm chữ).

- [x] T13 [chatbot-dev] Kiểm FE tổng và báo kích thước (`plan.md` §7, §9) — sau T10, T11, T12:
  - Test tích hợp trong `MemoryRouter` + `fetch` giả: luồng AC-1 → AC-9 (nút xem chi tiết mở popup đúng thủ tục `1.001193` và địa chỉ có `ma`), AC-13 (ô nhập), AC-17 (đóng popup/Quay lại, khung còn), AC-25 (6 chủ đề → 5), AC-29 (liên kết Cổng DVC mỗi thủ tục).
  - `npm run build`: báo kích thước gzip của chunk khung và của namespace `chatbot`, và `index`/`vendor` ở `/` (so với T10).
  - file: `src/FrontEnd/src/features/chatbot/*.test.tsx`
  - xong khi: test xanh; báo cáo kích thước: chunk khung ước 14–20 KB gzip (vượt 25 KB: báo); tổng JS tải đầu không tăng so với T10.

## code-reviewer

- [ ] T14 [code-reviewer] Review BE T01–T07 theo `CLAUDE.md`, `plan.md` → `result/review.md` (tạo): trọng tâm — không SQL nối chuỗi, không `AppDbContext`, R1–R7 (đặc biệt R2, R3 và ngoại lệ R4 chỉ ở `ChuoiTu.cs`), **log không chứa nội dung câu hỏi** (kể cả đường lỗi và exception), che thông tin cá nhân trước khi lưu và trước khi so khớp, đầu vào được kiểm, kết quả xác định (không phụ thuộc thứ tự đọc nguồn), mọi nhánh BR-3 không đoán quầy/cán bộ, không thêm gói — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn (nếu có) đã được chatbot-dev sửa.

- [ ] T15 [code-reviewer] Review FE T08–T13 → bổ sung `result/review.md` (sau T14): trọng tâm — vỏ không kéo mã khung vào bundle chính (xem báo cáo T10), không chuỗi viết cứng, không `dangerouslySetInnerHTML`, `rel` của liên kết ngoài, câu hỏi không nằm trong cache TanStack Query và không trong `localStorage`/`sessionStorage`, truy cập (`aria-live`, Tab, Esc, tên đọc của nút), điểm ghép F07/F09 đúng tên ở `plan.md` §6, token CSS — xong khi: có kết luận ĐẠT/KHÔNG ĐẠT; lỗi Chặn đã được agent sở hữu tệp sửa.

## tester

- [x] T16 [tester] [P] `testcases.md` cho F06 — mọi BR-1…BR-12 và AC-1…AC-29, mỗi mục có ít nhất một ca thử (cách làm, dữ liệu, kết quả mong đợi); ghi rõ ca nào kiểm ở chế độ chạy thật (AC-8, AC-14, AC-16, AC-27 cần xuất câu chưa trả lời — F00 BR-16), ca nào cần thử tay (đọc bằng trình đọc màn hình, kiosk thật, điện thoại thật mở `tel:`), ca nào chờ F07/F09 — file: `.specify/specs/F06-tro-ly/testcases.md` — xong khi: mỗi BR/AC có ca thử; bảng truy vết BR/AC → ca.

- [x] T17 [tester] Integration và hiệu năng BE (`plan.md` §9) — sau T07:
  - `Tests/Integration/Chatbot/TroLyServiceTrenPostgreSql.cs`: lớp con của `TroLyServiceContract` (tạo DB riêng, chạy migration, chèn cùng bộ dữ liệu bằng `AppDbContext` như `DanhMucServiceTrenPostgreSql`).
  - Test tương đương hai nguồn: chạy 42 câu trên nguồn Mẫu và PostgreSql với cùng dữ liệu → **JSON đáp án giống hệt từng ca** (không dùng mức chấp nhận của F00 §9.7).
  - Ghi thật: AC-8, AC-14, AC-16 qua HTTP + `xuat` của Import (`09******78`, một dòng với số lần gặp 2, `07********89` và `n***@gmail.com`); AC-27 giả lập ngày (91 ngày xoá, 89 ngày giữ, gặp lại tính lại 90 ngày).
  - p95: 1.000 yêu cầu trải đều bộ thử trên bản `Release`, `RateLimiting:TroLy` đặt rất lớn, ở nguồn Mẫu (408 thủ tục và `TaoLon(1000)`) và PostgreSql (AC-6).
  - file: `src/BackEnd/DichVuCong.Tests/Integration/Chatbot/`
  - xong khi: mọi ca có kết quả; p95 ≤ 300 ms ở cả hai nguồn với ~1.000 thủ tục, ghi p95, p99 và thời gian dựng chỉ mục; `dotnet test` xanh khi có DB thử, bỏ qua (không đỏ) khi không có.

- [x] T18 [tester] E2E, truy cập, ngân sách (`plan.md` §9) — sau T10, T13, T15:
  - `e2e/tro-ly.spec.ts` (Playwright): AC-1, AC-2, AC-9, AC-11, AC-13, AC-17 (địa chỉ có `ma=1.001193`, đóng popup/"Quay lại" → khung còn), AC-19 (đồng hồ giả), AC-23, AC-25, AC-28 (60/61 câu), AC-29; kiosk 1080×1920 (khung không che nút "Bắt đầu lại" khi F09 có; nếu chưa, ghi "chờ F09").
  - axe ở khung mở (thường và kiosk); đi hết khung bằng bàn phím; popup mở trên khung.
  - Ngân sách: JS tải đầu ≤ 200 KB gzip ở `/` 375 và 1280 px (bản Release); chunk khung không tải khi chưa bấm; Lighthouse mobile ≥ 85 ở `/`.
  - file: `src/FrontEnd/e2e/tro-ly.spec.ts`
  - xong khi: spec chạy xanh trên Chromium; ghi kích thước gzip từng chunk ban đầu và Lighthouse vào báo cáo.

- [x] T19 [tester] Chạy `testcases.md` → `.specify/specs/F06-tro-ly/result/test.md`:
  - Chạy mọi ca; ca cần chế độ chạy thật làm với PostgreSql (profile `https-postgresql`, `nhap tat-ca`, `xuat cau-chua-tra-loi`).
  - Thử tay: trình đọc màn hình (NVDA/TalkBack) với `aria-live` của khung, bấm số điện thoại trên điện thoại thật, nút Zalo khi nhập dữ liệu có Zalo OA, kiosk.
  - Ghi cho F00 T24: AC-20 (nạp lười trợ lý) và AC-22 (che thông tin cá nhân trong log) đã kiểm ở đây.
  - Báo các điểm F07, F09 chưa kiểm được (AC-6/AC-9 của F09; AC-8 của F07) để chạy lại sau khi hai chức năng đó xong.
  - xong khi: mọi ca có kết quả. Đạt hết → đổi `trang_thai` của `spec.md` sang `xong`.
