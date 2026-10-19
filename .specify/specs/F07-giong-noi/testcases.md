---
id: F07
ten: Đọc câu trả lời — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: chưa chạy — viết ở T08 (code đang làm song song). Chạy ở T09 (tích hợp BE), T10 (E2E, truy cập, ngân sách), T11 (toàn bộ + thử tay với giọng thật); kết quả vào result/test.md
---

# F07 · Đọc câu trả lời — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/doc-cau-tra-loi.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`). Chromium không có giọng sẵn nên `addInitScript` thay `speechSynthesis`, `SpeechSynthesisUtterance` bằng **bản giả** ghi lại `getVoices`, `speak` (kèm `text`, `voice`, `lang`, `rate`, thời điểm), `cancel`; bẫy `SpeechRecognition`, `webkitSpeechRecognition`, `navigator.mediaDevices.getUserMedia` và đếm lần gọi |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory. Ca nhóm chatbot-dev: `Tests/Api/Chatbot/DocCauTraLoi/` (T01; tester chỉ rà). Ca nhóm tester: `Tests/Integration/Chatbot/DocCauTraLoi/` (T09) — DB thật qua Testcontainers PostgreSQL nếu máy có Docker, không có thì bỏ qua và ghi vào `result/test.md` |
| VT | Vitest do chatbot-dev viết (T02–T05); tester chỉ rà. Giả `speechSynthesis`, `fetch`, đồng hồ |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`, `npm`, `dotnet`) |
| TAY | **Thử tay với giọng thật** (Windows, Android Chrome, Safari iOS, macOS, Zalo/WebView, kiosk thật, NVDA/TalkBack). Không thay được bằng bản giả |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/?kiosk=1`. 320 chỉ cho ca reflow.

**Hai nguồn dữ liệu**: chỉ áp cho bảng viết tắt (`GET /api/tro-ly/viet-tat`): nguồn **Mẫu** (profile `https`) và **PostgreSQL** (profile `https-postgresql`) phải cho JSON giống từng byte.

**Dữ liệu thử** — tên giả:

| Bộ | Nội dung |
|---|---|
| **G** (giọng giả) | G1 `vi-VN` cục bộ ("Giọng Thử An") · G2 `vi-VN` **không cục bộ** (`localService=false`, kiểu "Google tiếng Việt") · G3 `en-US` cục bộ · G4 `vi` cục bộ (không vùng) · G5 `vi_VN` (gạch dưới) cục bộ · G6 `VI-vn` (hoa thường lẫn) cục bộ · G7a/G7b hai giọng `vi-VN` cục bộ tên "Zeta" và "Alpha" · G8 `vie-VN` cục bộ · G9 `vi-VN` có `localService` không khai (undefined) |
| **B12** | Bảng viết tắt của dữ liệu mẫu nhúng (12 dòng, theo `ThuTu`): TTHC → thủ tục hành chính · QĐ-UBND → quyết định Ủy ban nhân dân · NĐ-CP · HCC · UBND · QSDĐ · KCN · CCN · TMDV · QH15 · CCCD · đk → đăng ký |
| **B0** | Bảng rỗng `[]` |
| **BX** (bảng độc, giả `route`) | Khoá `.*`, `(`, `[`, `\`, `^$`, `C++`, `a|b`, chuỗi 60 ký tự, khoá rỗng, 201 dòng, phần tử thiếu `dayDu`, `dayDu` là số, `dayDu` = `$&$&`, `$1`, `$$`, `<img src=x onerror=alert(1)>` |
| **T** (văn bản để đọc) | T1: `Theo QĐ-UBND, TTHC này mất 3 ngày, diện tích 30m2, mã 1.001193.` → kỳ vọng `Theo quyết định Ủy ban nhân dân, thủ tục hành chính này mất 3 ngày, diện tích 30 mét vuông, mã 1001193.` · T2: đáp án thủ tục khai sinh (nhiều giấy tờ, > 180 ký tự mỗi dòng) · T3: câu mẫu nhiều dòng · T4: văn bản có emoji, `**đậm**`, `- gạch đầu dòng`, dấu ngoặc kép |
| **Đ** (đáp án giả) | Giả `POST /api/tro-ly/hoi` trả đáp án có "TTHC" (khi dữ liệu mẫu không có) để kiểm AC-2 |

**Cột "Khi chạy"**: "Sau T0x" = task xong; "T10" = E2E; "T11" = chạy tổng + thử tay; "Chờ F06" = cần khung chat thật (F06 T11, T13); "Chờ F09" = cần nút "Bắt đầu lại" (F09 T02); "Chờ thiết bị" = máy thật. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: nhận giọng nói qua micro (spec mục Ngoài; chỉ có ca cấm ở nhóm MC); nút "nghe lại" từng tin và tạm dừng (plan Cần hỏi 6: không làm); thông báo "máy chưa có giọng" (plan Cần hỏi 1: ẩn nút, im lặng); đọc to cả trang.

## 1. Chọn giọng và hiện nút (BR-1, BR-2; AC-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-GD-01 | BR-2, BR-1 | G1 | Mở khung trợ lý | Có nút "Đọc câu trả lời" | PW + VT | 1280, 375 | Sau T04 / T10 |
| F07-GD-02 | BR-1 | Chỉ G2 (`vi-VN` không cục bộ) | Mở khung | **Không** nút (giọng mạng bị loại — plan Q1); không lỗi | PW + VT | 1280 | Sau T04 / T10 |
| F07-GD-03 | BR-2, AC-5 | Chỉ G3 (`en-US`) | Mở khung | Không nút; không lỗi console | PW | 1280 | T10 |
| F07-GD-04 | AC-5 | `getVoices()` rỗng | Mở khung | Không nút; không lỗi; khung dùng bình thường | PW | 1280 | T10 |
| F07-GD-05 | AC-5 | `speechSynthesis` không tồn tại (xoá bằng `addInitScript`) | Mở khung, hỏi một câu | Không nút; không ném lỗi; không `pageerror`; hỏi đáp bình thường | PW | 1280 | T10 |
| F07-GD-06 | AC-5 | Có `speechSynthesis` nhưng thiếu `SpeechSynthesisUtterance` | Mở khung | Không nút, không lỗi | VT | — | Sau T03 |
| F07-GD-07 | BR-2 | Giọng tới trễ: `getVoices()` rỗng, sau 500 ms bắn `voiceschanged` có G1 | Mở khung, đợi | Nút xuất hiện sau khi có giọng, không nhảy bố cục đáng kể | PW + VT | 1280 | T10 |
| F07-GD-08 | BR-2 | Giọng tới mà **không** bắn `voiceschanged` (Chrome Android), có sau 700 ms | Mở khung, đợi 1,2 giây | Nút hiện nhờ lần kiểm lại sau 1 giây | VT | — | Sau T04 |
| F07-GD-09 | BR-1 | G7a (Zeta) và G7b (Alpha), đảo thứ tự danh sách | Bật đọc, hỏi | Luôn chọn cùng một giọng (ưu tiên `vi-VN`, rồi theo `name` Ordinal → "Alpha") dù đảo thứ tự | VT | — | Sau T03 |
| F07-GD-10 | BR-1 | Chỉ G4 (`vi`), rồi chỉ G5 (`vi_VN`), rồi chỉ G6 (`VI-vn`) | Mở khung | Cả ba được nhận (lang bắt đầu `vi`, phân biệt `-`/`_`/hết chuỗi, không phân biệt hoa thường) | VT | — | Sau T03 |
| F07-GD-11 | BR-1 (biên) | Chỉ G8 (`vie-VN`) | Mở khung | Ghi hành vi: không nhận (chuẩn `vi`, không phải `vie`); không lỗi | VT | — | Sau T03 |
| F07-GD-12 | BR-1 (biên) | Chỉ G9 (`localService` undefined) | Mở khung | Không nút (chỉ `localService === true`); ghi hành vi | VT | — | Sau T03 |
| F07-GD-13 | BR-1 | G1 | Bật đọc, hỏi, đọc đối số của `speak` | **Mọi** `utterance.voice` là G1 (gán tường minh), `lang` = lang của G1; bản giả báo lỗi nếu `voice` rỗng | PW + VT | 1280 | Sau T03 / T10 |
| F07-GD-14 | BR-2 (cờ bật, máy không giọng) | `localStorage doc-bat = "1"`, không giọng | Mở khung, hỏi | Nút ẩn; không `speak`; cờ vẫn "1" | PW | 1280 | T10 |
| F07-GD-15 | BR-2 | Kiểm tra mã nguồn | `grep` `getVoices`, `localService` trong `features/chatbot/doc` | `chonGiong` ở một tệp, dùng `localService === true`; không đường nào gọi `speak` mà không `voice` | SH + VT | — | Sau T03 |
| F07-GD-16 | BR-2, AC-5 (thiết bị thật) | Windows 11 Chrome và Edge **có** và **không** cài gói giọng tiếng Việt cục bộ | Mở khung | Có giọng cục bộ → có nút; chỉ có giọng mạng ("Online (Natural)", "Google …") → **không** nút; ghi tên giọng đã nhận | TAY | — | T11 · Chờ thiết bị |
| F07-GD-17 | BR-2 (Cần hỏi 4) | Android Chrome (Google), iPhone Safari, macOS Safari/Chrome, trình duyệt trong Zalo | Mở khung | Ghi **tỷ lệ máy thử có nút** và giọng nào nhận; giọng Android khai `localService=false` thì nút ẩn (đúng BR-1) | TAY | — | T11 · Chờ thiết bị |
| F07-GD-18 | BR-2 (kiosk) | Máy kiosk thật (câu hỏi mở 10) | Mở khung | Ghi trình duyệt/hệ điều hành và có nút hay không; nếu không → ghi vào hướng dẫn vận hành (cài giọng cục bộ) | TAY | K | T11 · Chờ thiết bị |

## 2. Nút bật/tắt, mặc định, nhớ lựa chọn (BR-5; AC-3, AC-4)

Xoá `localStorage` trước mỗi ca trừ khi ghi khác.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-BT-01 | AC-4, BR-5 | G1, chưa có khoá `doc-bat` | Mở trang lần đầu, mở khung | Nút `aria-pressed="false"` (tắt); icon `VolumeX` | PW + VT | 1280, 375 | Sau T04 / T10 |
| F07-BT-02 | AC-4 | Như trên | Hỏi một câu khi chưa bấm gì | **Không** `speak` nào (Q5) | PW | 1280 | T10 |
| F07-BT-03 | BR-5, AC-1 | G1 | Bấm nút | `aria-pressed="true"`; `localStorage["doc-bat"] = "1"`; icon đổi sang `Volume2` (hai hình khác nhau, không chỉ màu) | PW + VT | 1280 | Sau T04 / T10 |
| F07-BT-04 | AC-3, BR-5 | Đang bật | Bấm tắt | `aria-pressed="false"`; `localStorage["doc-bat"] = "0"`; `cancel()` được gọi; hỏi thêm → không `speak` | PW | 1280 | T10 |
| F07-BT-05 | AC-3 | Sau BT-04 | Tải lại trang, mở khung | Vẫn tắt (không `speak`, nút `aria-pressed="false"`) | PW | 1280 | T10 |
| F07-BT-06 | BR-5 | Bật, rồi tải lại; rồi mở trang trong tab mới cùng trình duyệt | Mở khung | Vẫn bật (cờ đọc ở `localStorage`) | PW | 1280 | T10 |
| F07-BT-07 | BR-5 (giá trị lạ) | `doc-bat` = `true`, `2`, chuỗi rỗng, `"on"`, `"1 "` | Mở khung | Tất cả coi là **tắt** (chỉ `"1"` là bật) | VT | — | Sau T03 |
| F07-BT-08 | BR-5 (storage chặn) | `localStorage` ném `SecurityError` | Bấm bật, hỏi; tải lại | Bật được trong phiên (giữ trong bộ nhớ trang), không lỗi, không `pageerror`; tải lại → tắt | PW + VT | 1280 | Sau T03 / T10 |
| F07-BT-09 | plan §2 | Luồng đầy đủ | Đọc `localStorage` | Chỉ có `doc-bat` (và `cach-xem` nếu đã chọn thẻ/bảng); **không** nội dung câu hỏi, đáp án | PW | 1280 | T10 |
| F07-BT-10 | plan §4.2 | G1, có sẵn câu trả lời trên màn hình | Bấm bật | **Không** đọc câu cũ (chỉ đọc câu trả lời mới, Q5) | PW + VT | 1280 | Sau T04 / T10 |
| F07-BT-11 | plan §4.2 (đa tab) | Bật ở tab A, tab B đang mở | Quan sát tab B; mở tab C mới | B không tự đổi (ghi nhận); C bật | PW | 1280 | T10 |
| F07-BT-12 | WCAG 2.1.1 | G1 | Tab tới nút; Enter; Space | Bật tắt được bằng bàn phím; viền focus nhìn thấy | PW | 1280 | T10 |
| F07-BT-13 | plan Q8 | G1 | Bấm bật; đếm lần phát | "Mở khoá" gọi một lần: một câu rỗng âm lượng 0 (không nghe thấy tiếng); không phát lại ở lần bấm sau trong cùng trang | VT | — | Sau T04 |
| F07-BT-14 | plan §4.2 | G1 | Bấm nút 10 lần thật nhanh | Trạng thái cuối nhất quán với `aria-pressed` và `localStorage`; không lỗi; không phát tiếng | PW | 1280 | T10 |
| F07-BT-15 | BR-5 (kiosk) | `/?kiosk=1`, bật đọc | Bấm "Bắt đầu lại"; mở khung | Trang tải lại, **vẫn bật** (`doc-bat` còn), khung rỗng | PW | K | Chờ F09 |
| F07-BT-16 | BR-5 (kiosk) | Kiosk, bật đọc, để máy 15 phút (đồng hồ giả) | Quan sát | Không tự đọc, không tự đổi, không tự làm mới (F09 BR-2) | PW | K | Chờ F09 |

## 3. Đọc câu trả lời (AC-1, AC-7; BR-7)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-DO-01 | AC-1 | G1, bật đọc | Hỏi "làm giấy khai sinh cần giấy tờ gì" | `speak` ít nhất một lần; văn bản đọc gồm nội dung đáp án (có "đăng ký khai sinh"); `voice` = G1; `rate` = 0,92 | PW | 1280, 375 | T10 · Chờ F06 |
| F07-DO-02 | AC-1 | Bật đọc, giả route trả từng `loai` (thu-tuc, danh sách, chủ đề, câu mẫu, Trung tâm, quầy, không hiểu) | Hỏi từng loại | Mỗi loại có `speak`; văn bản **không** chứa nhãn nút ("Xem chi tiết", "Xem và nộp trên Cổng DVC"), đường dẫn, dòng nhắc đăng xuất (`vanBanDoc`) | VT + PW | 1280 | Sau T04 / T10 |
| F07-DO-03 | plan §4.3 | Bật đọc | Mở khung (lời chào), gửi câu và đang chờ ("Đang tìm câu trả lời…"), gây lỗi (tin lỗi) | Lời chào, tin chờ, tin lỗi **không** được đọc (`cauTraLoiMoi` chỉ đặt cho đáp án API) | PW + VT | 1280 | T10 · Chờ F06 |
| F07-DO-04 | AC-1 (câu dài) | Đáp án T2 (nhiều giấy tờ, dòng > 180 ký tự) | Hỏi | Văn bản tách thành nhiều `utterance` ≤ 180 ký tự, `speak` liên tiếp đúng thứ tự, cắt tại dấu `, ;` hoặc dấu cách | VT + PW | 1280 | Sau T02 / T10 |
| F07-DO-05 | AC-1 (Chrome) | Windows Chrome, giọng cục bộ thật, đáp án rất dài (hồ sơ nhiều giấy tờ) | Hỏi, nghe hết | Đọc hết, **không dừng giữa chừng** (Q6: hàng đợi câu ngắn, giữ tham chiếu) | TAY | — | T11 · Chờ thiết bị |
| F07-DO-06 | AC-7, BR-7 | G1, bật đọc, đáp án dài đang đọc | Gửi câu hỏi mới | Khi đáp án mới đến: `cancel()` rồi chỉ phát nội dung mới (spy theo thứ tự); không lẫn câu cũ | PW | 1280 | T10 · Chờ F06 |
| F07-DO-07 | AC-7 (Cần hỏi 2) | Như trên | Đo từ lúc gửi tới lúc `cancel()` | Ghi: dừng khi **đáp án mới đến**, không phải lúc gửi (BR-7 và hợp đồng `DiemGhepDoc`); khoảng im lặng ≈ thời gian trả lời. Spec AC-7 viết "gửi câu hỏi mới → câu cũ dừng": ghi mơ hồ | PW | 1280 | T10 |
| F07-DO-08 | AC-7 | Hai đáp án đến cách nhau < 80 ms | Quan sát `speak` | Chỉ câu sau được phát (số phiên Q7) | VT | — | Sau T03 |
| F07-DO-09 | plan Q7 | Bật đọc | Đo từ `cancel()` đến `speak()` | ≥ 80 ms (không gọi `speak` sát ngay sau `cancel`) | VT | — | Sau T03 |
| F07-DO-10 | plan §4.3 | Bật đọc, yêu cầu đang bay | Đóng khung lúc đáp án về | Đáp án đến khi khung đang đóng **không** được đọc; mở lại cũng không đọc | PW | 1280 | T10 |
| F07-DO-11 | AC-7 | Gửi 5 câu liên tiếp | Quan sát | Mỗi lần chỉ đọc đáp án của câu đó; không lẫn | PW | 1280 | T10 |
| F07-DO-12 | AC-1 | Bấm chip chủ đề "Chăn nuôi" | Quan sát | Đáp án chủ đề được đọc | PW | 1280 | T10 · Chờ F06 |
| F07-DO-13 | plan §4.4 | T3 (câu mẫu nhiều dòng) | Hỏi | Xuống dòng thành dấu chấm (ngắt hơi); không đọc chữ "xuống dòng" | VT | — | Sau T02 |
| F07-DO-14 | plan §4.4 | T4 | Chuẩn bị văn bản | Emoji, `**`, gạch đầu dòng, dấu ngoặc kép bị bỏ khỏi văn bản đọc; **chữ hiển thị trong DOM không đổi** | VT + PW | 1280 | Sau T02 / T10 |
| F07-DO-15 | plan §4.5 (Safari) | Bản giả: `speak` ném `not-allowed` | Bật, hỏi | Nút về `aria-pressed="false"` trong phiên, `localStorage` vẫn "1"; bấm lại → các câu sau được đọc | VT + PW | 1280 | Sau T04 / T10 |
| F07-DO-16 | plan §4.5 | Bản giả: `onerror` `canceled`, `interrupted`, `synthesis-failed` | Đọc | `canceled`/`interrupted` bỏ qua; lỗi khác dừng hàng đợi, không báo người dùng, không `console` | VT | — | Sau T03 |
| F07-DO-17 | plan Q6 | Đọc đáp án 3 phút (giọng thật) | Nghe | `end` bắn đúng; hàng đợi giải phóng; không bị thu gom giữa chừng | TAY | — | T11 · Chờ thiết bị |
| F07-DO-18 | plan Q8 (iOS) | **iPhone Safari thật** | Bật đọc, hỏi một câu (đáp án đến sau `fetch`) | Có tiếng (rủi ro 1); nếu không: ghi bản iOS, `not-allowed`, nút về tắt; bấm lại thì câu sau có tiếng | TAY | — | T11 · Chờ thiết bị |
| F07-DO-19 | plan §4.5 | Bật đọc, đáp án `khong-hieu` | Hỏi "số 0912345678 của tôi nộp hồ sơ chưa" | Văn bản đọc **không** chứa "0912345678" (chỉ đáp án được đọc, không đọc lại câu hỏi) — kiosk dùng loa chung | PW | K | T10 · Chờ F06 |
| F07-DO-20 | plan §4.5 | G1 | Đọc rate | `rate` = hằng `TOC_DO_DOC` (0,92); cảm nhận tốc độ phù hợp người lớn tuổi (ghi nhận xét) | VT + TAY | — | Sau T03 / T11 |
| F07-DO-21 | Chrome thật | Cùng đáp án, đọc 2 lần liên tiếp | Nghe | Cả hai lần có tiếng (không bị bỏ `speak` sau `cancel`) | TAY | — | T11 · Chờ thiết bị |

## 4. Đọc viết tắt, số, đơn vị (BR-3; AC-2)

Phần chuẩn bị văn bản (`chuanBiVanBanDoc`) là hàm thuần: kiểm chính bằng Vitest (rà), thêm PW cho AC-2.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-VT-01 | AC-2 | G1, bật đọc, B12, đáp án Đ chứa "TTHC" | Hỏi | Văn bản đọc chứa "thủ tục hành chính"; **chữ trên màn hình vẫn là "TTHC"** | PW | 1280 | T10 · Chờ F06 |
| F07-VT-02 | BR-3 | T1, B12 | `chuanBiVanBanDoc` | Đúng chuỗi kỳ vọng ở bộ T1 | VT (rà) | — | Sau T02 |
| F07-VT-03 | BR-3 (khoá dài thắng) | B12; "Theo QĐ-UBND và UBND" | Chuẩn bị | "quyết định Ủy ban nhân dân" (khoá dài trước) và "Ủy ban nhân dân" cho UBND đứng riêng | VT | — | Sau T02 |
| F07-VT-04 | BR-3 (hoa thường) | B12 | "tthc", "TtHc", "TTHC", "ĐK", "đk" | Tất cả được thay (so khớp không phân biệt hoa thường, phân biệt dấu) | VT | — | Sau T02 |
| F07-VT-05 | BR-3 (biên từ) | B12 | "TTHCX", "ATTHC", "(TTHC)", "TTHC,", "TTHC.", "TTHC-2026", "TTHC TTHC" | "TTHCX" và "ATTHC" **không** bị thay; các dạng còn lại thay đúng; hai viết tắt liền nhau cách một dấu cách đều được thay | VT | — | Sau T02 |
| F07-VT-06 | BR-3 (ký tự đặc biệt) | BX: khoá `.*`, `(`, `[`, `\`, `^$`, `C++`, `a|b` | Chuẩn bị văn bản có các chuỗi đó | Khoá được `escape`; không làm hỏng biểu thức; không khớp mọi chỗ; không ném lỗi | VT | — | Sau T02 |
| F07-VT-07 | BR-3 (dữ liệu hỏng) | BX: khoá rỗng, khoá 60 ký tự, 201 dòng, phần tử thiếu `dayDu`, `dayDu` là số | Tải bảng rồi chuẩn bị | Phần tử sai bị bỏ; khoá rỗng/ > 50 ký tự bị bỏ; bảng > 200 dòng bị bỏ (hoặc cắt); không lỗi | VT | — | Sau T02 / T03 |
| F07-VT-08 | BR-3 (thay thế đặc biệt) | BX: `dayDu` = `$&$&`, `$1`, `$$` | Chuẩn bị | `dayDu` chèn **nguyên văn** (không bị hiểu là mẫu thay thế của `replace`) | VT | — | Sau T02 |
| F07-VT-09 | BR-3 (bảng rỗng) | B0 | Chuẩn bị T1 | Bỏ bước viết tắt; các bước số, đơn vị vẫn chạy | VT | — | Sau T02 |
| F07-VT-10 | plan Q9 | Văn bản: `1.001193`, `2.000.000`, `0,5`, `1.5` | Chuẩn bị | `1001193`, `2000000`, `0,5` giữ, `1.5` → `15` (ghi nhận: dấu chấm kiểu Mỹ bị gộp) | VT | — | Sau T02 |
| F07-VT-11 | plan Q9 (ngày, điều khoản) | Văn bản `12.05.2026`, `Điều 5.2`, `12/05/2026`, `123/2024/NĐ-CP`, `1.000.000 đồng`, `30.000đ` | Chuẩn bị rồi **nghe thử** bằng giọng thật | Ghi hành vi và nghe: ngày `12.05.2026` → `12052026` đọc sai (luật `(\d)\.(\d)`); số hiệu văn bản, tiền đọc ra sao; điểm kém giao chatbot-dev thêm luật vào `luatDoc.ts` (rủi ro 5) | VT + TAY | — | T11 |
| F07-VT-12 | plan Q9 (đơn vị) | `30m2`, `30m²`, `15km`, `15 km`, `5cm`, `4mm`, `3m`, "am", "tháng 3 m", "100 km/h" | Chuẩn bị | "30 mét vuông" (hai dạng), "15 ki lô mét", "5 xen ti mét", "4 mi li mét", "3 mét"; "am" không đổi; "tháng 3 m" không bị nuốt; không ra "métét" | VT | — | Sau T02 |
| F07-VT-13 | plan §4.4 | NFC/NFD; ký tự vô hình (U+200B…U+200F, U+FEFF sinh bằng `String.fromCodePoint`) | Chuẩn bị | Dạng chuẩn NFC; ký tự vô hình bị bỏ; chữ có dấu giữ nguyên | VT | — | Sau T02 |
| F07-VT-14 | plan §4.4 | Chuỗi chỉ có emoji/khoảng trắng/ký tự vô hình | Chuẩn bị | Ra `[]` → không `speak`, không lỗi | VT | — | Sau T02 |
| F07-VT-15 | plan §4.4 | Câu 400 ký tự; chuỗi 5.000 ký tự **không** dấu cách; 100 KB văn bản + bảng 200 khoá | Chuẩn bị | Mỗi phần ≤ 180 ký tự; chuỗi không dấu cách xử lý không treo (ghi cách cắt); dưới 50 ms (hiệu năng); không lỗi | VT | — | Sau T02 |
| F07-VT-16 | plan §4.4 | Gọi hàm hai lần với cùng chuỗi | Chuẩn bị | Không sửa chuỗi gốc; kết quả giống nhau (hàm thuần) | VT | — | Sau T02 |
| F07-VT-17 | BR-3 (nhập lại) | PostgreSQL; nhập `tro-ly` có thêm viết tắt "XYZ → thử nghiệm"; tải lại trang | Bật đọc, đáp án có "XYZ" | Đọc theo bảng mới (bảng tải mỗi lần tải trang) | PW + XU | 1280 | T09 / T10 · Chờ F01 |
| F07-VT-18 | BR-3 (lỗi bảng) | `/api/tro-ly/viet-tat` trả 500, 429, mạng chặn | Bật đọc, hỏi câu chứa "TTHC" | Đọc **nguyên văn** ("T-T-H-C" theo giọng), không báo lỗi; câu sau thử tải lại bảng, có bảng thì thay | PW + VT | 1280 | Sau T03 / T10 |
| F07-VT-19 | BR-3 | Hỏi nhiều câu | Đếm yêu cầu `viet-tat` | Đúng một yêu cầu cho cả phiên tải trang (nhớ promise) | PW | 1280 | T10 |
| F07-VT-20 | BR-3 (nghe thật) | Giọng thật | Nghe "TTHC", "QĐ-UBND", "CCCD", "đk" | Nghe "thủ tục hành chính", "quyết định Ủy ban nhân dân", đúng dạng đầy đủ trong bảng; ghi tự nhiên hay máy móc | TAY | — | T11 · Chờ thiết bị |

## 5. Dừng đọc (BR-7; AC-3, AC-7, AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-DG-01 | AC-8 | G1, bật đọc, đáp án dài đang đọc | Đóng khung bằng nút ✕ | `cancel()` gọi ngay (< 100 ms kể từ click); tiếng dừng | PW | 1280, 375 | T10 · Chờ F06 |
| F07-DG-02 | AC-8 | Như trên | Đóng bằng bấm lại nút "Trợ lý"; bằng Esc | Như DG-01 | PW | 1280 | T10 · Chờ F06 |
| F07-DG-03 | AC-8 | Sau DG-01 | Mở lại khung | **Không** tự đọc tiếp câu cũ (không `speak` thêm); hội thoại còn | PW | 1280 | T10 · Chờ F06 |
| F07-DG-04 | AC-8 (tiếng thật) | Giọng thật, đáp án dài | Đóng khung khi đang đọc | Tiếng ngừng ngay, không đọc nốt câu | TAY | — | T11 · Chờ thiết bị |
| F07-DG-05 | AC-3, BR-7 | Đang đọc | Bấm tắt đọc | `cancel()` ngay; tiếng ngừng | PW | 1280 | T10 |
| F07-DG-06 | BR-7 | Đang đọc | Điều hướng đi (đổi địa chỉ khác nguồn, đóng tab) → `pagehide` | `cancel()` được gọi | PW + VT | 1280 | Sau T04 / T10 |
| F07-DG-07 | F09 BR-7 | Đang đọc | `batDauLaiTroLy()` (khung bị huỷ khi đổi `key`) | `cancel()` được gọi khi gỡ `ChoNutDoc`; mở lại khung rỗng, không đọc | VT | — | Sau T04 |
| F07-DG-08 | plan Q7 | Bật → tắt trong 80 ms sau khi đáp án đến | Quan sát | **Không** `speak` (số phiên đổi, việc đã hẹn bị bỏ) | VT | — | Sau T03 |
| F07-DG-09 | plan Q7 | Bảng viết tắt trễ 2 giây; tắt đọc trong lúc chờ | Quan sát sau khi bảng về | Không `speak` sau khi bảng về | PW + VT | 1280 | Sau T03 / T10 |
| F07-DG-10 | plan Q7 | Bật, đáp án đến; đóng khung trong lúc chờ 80 ms | Quan sát | Không `speak` | VT | — | Sau T03 |
| F07-DG-11 | AC-8 | Đóng khung; đáp án mới đến sau đó (yêu cầu bay lúc đóng) | Quan sát; rồi mở lại | Không đọc cả lúc đến lẫn khi mở lại | PW | 1280 | T10 · Chờ F06 |
| F07-DG-12 | BR-7 (popup) | Đang đọc | Mở popup chi tiết từ khung (khung `inert`, `khungDangMo` vẫn đúng) | Ghi hành vi: đọc tiếp hay dừng (spec chưa nói); đóng popup khung còn | PW | 1280 | T10 · Chờ F06 |
| F07-DG-13 | BR-7 (SPA) | Đang đọc | Chuyển trang `/` → `/thu-tuc` bằng thanh điều hướng | Ghi hành vi: khung ở `Layout` nên vẫn đọc tiếp (spec chưa nói) | PW | 1280 | T10 |
| F07-DG-14 | BR-7 | Đang đọc | Chuyển tab trình duyệt (`visibilitychange`) | Ghi hành vi (spec chưa nói); không lỗi | PW | 1280 | T10 |
| F07-DG-15 | F09 BR-7 (kiosk) | Kiosk, đang đọc | Bấm "Bắt đầu lại" | Tiếng đọc dừng ngay (`cancel` từ `batDauLai` và `pagehide`) | PW | K | Chờ F09 |
| F07-DG-16 | BR-7 (giọng thật, kiosk) | Kiosk thật | Như DG-15 | Tiếng ngừng khi màn hình chớp; nút vẫn bật sau tải lại | TAY | K | T11 · Chờ thiết bị |
| F07-DG-17 | plan §4.3 | `ChoNutDoc` bị gỡ khi đổi trang | Dọn hiệu ứng | Gỡ lắng nghe `pagehide`, `voiceschanged`, `pointerdown`/`keydown` (không rò) | VT | — | Sau T04 |

## 6. Phần đọc chỉ tải khi bật (BR-4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-NL-01 | BR-4 | G1, bản build, chưa mở khung | Mở `/`, ghi mạng | Không chunk khung, không chunk phần đọc, không `GET /api/tro-ly/viet-tat` | PW | 375, 1280 | T10 |
| F07-NL-02 | BR-4 | Mở khung, **chưa bật** | Ghi mạng | Có chunk khung (và namespace `chatbot`); **không** chunk phần đọc, không `viet-tat` | PW | 1280 | T10 · Chờ F06 |
| F07-NL-03 | BR-4 | Bấm bật lần đầu | Ghi mạng | Tải chunk phần đọc và `GET /api/tro-ly/viet-tat` song song, mỗi thứ một lần | PW | 1280 | T10 |
| F07-NL-04 | BR-4 | Tắt rồi bật lại | Ghi mạng | Không tải thêm (đã nhớ promise) | PW | 1280 | T10 |
| F07-NL-05 | BR-4 | Cờ đã bật từ lần trước; mở khung | Ghi mạng trước và sau câu trả lời đầu | Khi mở khung chưa hỏi: không tải chunk phần đọc; tải khi đáp án đầu tiên đến (plan §5); ghi thời điểm | PW | 1280 | T10 |
| F07-NL-06 | BR-4 | Máy không giọng, cờ bật | Hỏi | Không tải chunk phần đọc, không `viet-tat` | PW | 1280 | T10 |
| F07-NL-07 | BR-4 | Chặn chunk phần đọc | Bật; bỏ chặn; bật lại | Bật lần đầu lỗi nạp: nút vẫn còn, không lỗi trang; lần bấm sau nạp được (quên promise lỗi) | VT + PW | 1280 | Sau T03 / T10 |
| F07-NL-08 | BR-4 | `npm run build` | `ls dist/assets`, `gzip -9` | Chunk phần đọc **≤ 3 KB gzip** (mục tiêu 1,8–2,5); vượt → báo planner, không tự cắt luật; chunk phần đọc không nằm trong `<link modulepreload>`/`<script>` của `index.html` | SH | — | Sau T06 |
| F07-NL-09 | BR-4 | Như trên | So `index`/`vendor` trước và sau F07 | Bundle chính **tăng 0 byte**; chunk khung tăng ≤ 2 KB gzip; khung tổng ≤ 25 KB | SH | — | Sau T06 |
| F07-NL-10 | BR-4 | Kiểm mã | `grep` import tĩnh `docCauTraLoi`, `chuanBiVanBan`, `bangVietTat`, `luatDoc` ngoài `napPhanDoc.ts` | Chỉ `napPhanDoc.ts` dùng `import()`; không nơi nào import tĩnh | SH + VT | — | Sau T03 |

## 7. Không dùng micro (BR-6; AC-6)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-MC-01 | AC-6 | G1, bẫy `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `mediaDevices` | Dùng toàn bộ trang (trang chủ, danh mục, lĩnh vực) và trợ lý, bật đọc, hỏi nhiều câu | Số lần gọi API micro = **0**; không hộp thoại quyền | PW | 1280, 375 | T10 · Chờ F06 |
| F07-MC-02 | AC-6 | Chromium với `permissions` mặc định | Lắng nghe `permissions.query({name:'microphone'})` và sự kiện quyền | Trạng thái không đổi (không từng bị hỏi) | PW | 1280 | T10 |
| F07-MC-03 | BR-6 | Mã nguồn FE | `khongMicro.test.ts` quét `src/**/*.{ts,tsx}` | Không `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `mediaDevices`, `MediaRecorder`, `capture=`; không `speechSynthesis.speak` ngoài `features/chatbot/doc/` | VT (rà) | — | Sau T05 |
| F07-MC-04 | BR-6 | Thêm tạm `new webkitSpeechRecognition()` vào một tệp khác | Chạy `khongMicro.test.ts` | Test **đỏ**; gỡ dòng thử | SH | — | Sau T05 |
| F07-MC-05 | BR-6 | Bản build | `grep -rE "SpeechRecognition\|getUserMedia\|mediaDevices\|MediaRecorder" wwwroot` | 0 kết quả (nếu `vendor` có chuỗi do thư viện, ghi tên thư viện và chứng minh không gọi) | SH | — | T10 |
| F07-MC-06 | BR-6 | Bản build | `curl -sI /`; `document.permissionsPolicy.allowsFeature('microphone')` | Header `Permissions-Policy: microphone=(), camera=(), geolocation=()`; `allowsFeature` = false | CURL + PW | 1280 | T10 |
| F07-MC-07 | BR-6 | Mã nguồn + DOM | Tìm `<input type=file capture>`, `<audio>`, `<video>`, `getDisplayMedia` | Không có | SH + PW | 1280 | T10 |
| F07-MC-08 | AC-6 (thiết bị thật) | Chrome Android, iPhone Safari, Windows Chrome | Dùng trang và trợ lý 10 phút, bật đọc | Trình duyệt **không hỏi quyền micro lần nào**; không biểu tượng micro đang dùng | TAY | — | T11 · Chờ thiết bị |

## 8. Kiosk (F09) — phần của F07

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-KS-01 | C01 AC-2 | Kiosk 1080×1920, G1 | Mở khung | Nút đọc đứng giữa tên khung và ✕, vùng bấm ≥ 48 px (cả nút đọc lẫn mọi `IconButton` khác trong khung, vd. ✕), không bị nút "Bắt đầu lại" che | PW | K | Chờ F09 |
| F07-KS-02 | F09 AC-9 | Kiosk, bật đọc, đã hỏi | Bấm "Bắt đầu lại" | Quét `localStorage`: chỉ khoá được phép (`cach-xem`, `doc-bat`); không nội dung hội thoại | PW | K | Chờ F09 |
| F07-KS-03 | F09 BR-7 | Kiosk, bật đọc | Bấm "Bắt đầu lại"; mở khung | Vẫn bật; khung rỗng; không đọc lại câu cũ | PW | K | Chờ F09 |
| F07-KS-04 | plan §9 mục 5 (vận hành) | Hướng dẫn vận hành F09 §9 | Đọc mục "cài giọng đọc tiếng Việt" | Nói rõ **giọng cục bộ** (giọng mạng không dùng được); Windows: gói ngôn ngữ; Android: dữ liệu giọng ngoại tuyến | SH / đọc tài liệu | — | Chờ tài liệu vận hành |
| F07-KS-05 | plan §8 rủi ro 3 | Máy kiosk thật | Ghi kết quả GD-18 | Có nút hay không; kết luận cho câu hỏi mở 10 | TAY | K | T11 · Chờ thiết bị |

## 9. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-TN-01 | C01 AC-4 | G1, khung mở có nút đọc | axe | 0 vi phạm (thường và kiosk) | AX | 375, 1280, K | T10 · Chờ F06 |
| F07-TN-02 | WCAG 4.1.2 | Nút ở hai trạng thái | Đọc tên và trạng thái | Tên cố định "Đọc câu trả lời" ở cả hai trạng thái; trạng thái nằm ở `aria-pressed` | PW | 1280 | T10 |
| F07-TN-03 | WCAG 1.4.1 | Bật/tắt | Xem | Hai icon khác hình (`Volume2` / `VolumeX`), không chỉ khác màu; đen trắng vẫn phân biệt được | PW + TAY | 1280 | T10 |
| F07-TN-04 | WCAG 2.5.8 | 375 và kiosk | Đo vùng bấm | Vùng bấm ≥ 24×24 px (spec C01 AC-2; nút đọc đo 34×34 ở 375); ≥ 48×48 px ở kiosk | PW | 375, K | T10 |
| F07-TN-05 | C01 AC-1 | Khung mở | Tab từ đầu khung | Thứ tự: tên khung → nút đọc → ✕ → …; Enter/Space bật tắt; không bẫy | PW | 1280 | T10 · Chờ F06 |
| F07-TN-06 | plan §4.2 | NVDA/VoiceOver/TalkBack | Bấm nút | Đọc "Đọc câu trả lời, nút bật tắt, đã nhấn / chưa nhấn"; **không** thông báo `aria-live` riêng | TAY | — | T11 · Chờ thiết bị |
| F07-TN-07 | plan §4.2 (xung đột) | NVDA bật + đọc của trang bật | Hỏi một câu | Ghi hành vi: NVDA đọc tin mới (`aria-live`) và giọng của trang đọc cùng lúc có chồng tiếng không; người dùng NVDA không cần bật đọc | TAY | — | T11 · Chờ thiết bị |
| F07-TN-08 | WCAG 1.4.3 | Nút trên nền đầu khung | Đo tương phản | Biểu tượng ≥ 3:1 (thành phần giao diện) trên `--color-primary-strong`; viền focus ≥ 3:1 | AX + PW | 1280 | T10 |
| F07-TN-09 | WCAG 1.4.10 | 320×568 và phóng 200% | Xem đầu khung | Nút đọc không đẩy ✕ ra ngoài; không cuộn ngang | PW | 320, 1280 | T10 |
| F07-TN-10 | plan §4.2 (ẩn nút) | Không giọng | Xem đầu khung | Không có khoảng trống lạ hay nút cụt; tên khung và ✕ căn đúng | PW | 1280 | T10 |
| F07-TN-11 | i18n | Mã nguồn | `npm run lint`; `grep` chữ "Đọc câu trả lời" | Chỉ qua `t('chatbot:doc.nhan')`; không chuỗi viết cứng; khoá có kiểu | SH | — | Sau T04 |

## 10. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-BM-01 | BR-1 | G1, bật đọc | Hỏi nhiều câu, ghi mọi request | Chỉ `GET /api/tro-ly/viet-tat` (không body, không query) phát sinh do F07; **không** request nào mang văn bản đọc; không request tới tên miền ngoài | PW | 1280 | T10 · Chờ F06 |
| F07-BM-02 | BR-1 | G2 (giọng mạng) cùng G1 | Hỏi | `speak` không bao giờ nhận G2; nếu chỉ có G2 thì không `speak` | VT | — | Sau T03 |
| F07-BM-03 | BR-1 | CSP `connect-src 'self'` | Kiểm | Không đường nào gửi văn bản đi nơi khác; mọi `fetch` do `features/chatbot/doc` chỉ `GET` địa chỉ trên (kiểm các lần gọi `fetch`, không `body`) | VT + SH | — | Sau T03 |
| F07-BM-04 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` `/api/tro-ly/viet-tat` (200, 304) | CSP đúng nguyên văn CLAUDE.md, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By`; `ETag` + `Cache-Control: no-cache` | CURL | — | Sau T01 |
| F07-BM-05 | plan §3 | `GET /api/tro-ly/viet-tat` | So tập khoá JSON | Mỗi phần tử đúng hai khoá `chuVietTat`, `dayDu`; **không** `thuTu`, `chuVietTatTimKiem`; thứ tự theo `ThuTu`; B0 → `[]` | XU / CURL | — | Sau T01 |
| F07-BM-06 | CLAUDE.md > API | Endpoint | POST, PUT, DELETE, PATCH, OPTIONS; HEAD | POST/PUT/DELETE/PATCH → 405 `phuong-thuc-khong-hop-le`; HEAD → 200 không thân; OPTIONS không `Access-Control-Allow-Origin`; không stack trace | XU | — | Sau T01 |
| F07-BM-07 | plan §3 (đầu vào) | `?x=<script>&y='--&z=%00` | Gửi | 200 như không query; `ETag` giống nhau; thân không phản chiếu query | CURL / XU | — | Sau T01 |
| F07-BM-08 | plan §3 (cache) | Service giả đếm lần chạy | 1.000 `?x=<ngẫu nhiên>`; `If-None-Match` khớp | Service chạy 1 lần; khớp → 304 trước khi service chạy; đổi phiên bản → thân mới | XU | — | Sau T01 |
| F07-BM-09 | CLAUDE.md (rate limit) | `RateLimiting:DanhMuc` 300/phút | 350 yêu cầu `viet-tat` trong 1 phút | Từ yêu cầu 301: 429 `qua-nhieu-yeu-cau` + `Retry-After`; FE vẫn đọc nguyên văn, không báo lỗi | XU | — | Sau T01 |
| F07-BM-10 | plan §6 (dữ liệu độc) | BX: `dayDu` = `<img src=x onerror=alert(1)>`, `javascript:alert(1)` | Hỏi câu chứa khoá tương ứng; `page.on('dialog')` | `dayDu` chỉ đi vào `utterance.text`; không vào DOM; 0 hộp thoại; không `innerHTML` | PW + VT | 1280 | Sau T03 / T10 |
| F07-BM-11 | plan §6 (ReDoS) | BX: 200 khoá 50 ký tự dạng lặp (`aaaa…`), văn bản 100 KB toàn "aaaa" | Chuẩn bị văn bản | Biểu thức dựng từ chuỗi cố định có biên (đã `escape`); xong dưới 100 ms; không treo trang | VT | — | Sau T02 |
| F07-BM-12 | plan §6 (lưu trữ) | Luồng đầy đủ | Đọc `localStorage`, `sessionStorage`, cookie, IndexedDB | F07 chỉ ghi `doc-bat` (`"1"`/`"0"`); không nội dung | PW | 1280 | T10 |
| F07-BM-13 | CLAUDE.md > Trình duyệt | Luồng đầy đủ: mở, bật, hỏi, tắt, đóng | Bắt `console`, `securitypolicyviolation` | 0 vi phạm CSP; 0 `console.error`; **không** `console.log` nội dung đọc | PW | 375, 1280 | T10 |
| F07-BM-14 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `grep -rl sourceMappingURL wwwroot`; tìm tên `docMoi`, `chuanBiVanBanDoc`, `chonGiong` trong chunk | Không `.map`, không `.pdb`; tên định danh dự án đã bị đổi | SH | — | T10 |
| F07-BM-15 | CLAUDE.md > Thư viện | Cuối F07 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json`, `Directory.Packages.props` | Không High/Critical; F07 **không** thêm gói npm hay NuGet | SH | — | T11 |
| F07-BM-16 | plan §6 | Mã nguồn | `grep -rn "dangerouslySetInnerHTML\|innerHTML" src/FrontEnd/src/features/chatbot/doc`; `QuyTacTruyVanTests` quét `Features/Chatbot/DocCauTraLoi` | 0 kết quả; xanh (R1–R3: không `AppDbContext`, sắp theo `ThuTu` trong truy vấn, DTO thẳng) | SH + XU | — | Sau T01, T04 |
| F07-BM-17 | CLAUDE.md > Dữ liệu | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | T11 |
| F07-BM-18 | plan §3 | PostgreSQL ngừng | `GET /api/tro-ly/viet-tat` | 500 `loi-he-thong` + `maTraCuu`; FE đọc nguyên văn, không báo | XU | — | T09 |
| F07-BM-19 | plan §6 (kiosk loa chung) | Kiosk, người trước hỏi câu có số điện thoại | Người sau bật đọc; hỏi | Chỉ đáp án của người sau được đọc; không đọc lại hội thoại cũ (F07 chỉ đọc đáp án mới) | PW | K | Chờ F09 |

## 11. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-HN-01 | F00 BR-9, plan §5 | `npm run build` | Mở `/` ở 375 và 1280; ghi mọi `.js` tải đầu; `gzip -9`; cộng | **≤ 200 KB gzip**; F07 thêm **0 KB** vào tải đầu (so với trước F07); chunk khung và phần đọc không tải khi chưa bấm | SH + PW | 375, 1280 | T10 |
| F07-HN-02 | plan §5 | Như NL-08 | Đo từng chunk | Chunk phần đọc ≤ 3 KB gzip; chunk khung +1–1,5 KB (tối đa +2 KB); ghi bảng | SH | — | Sau T06 |
| F07-HN-03 | plan §5 | Nguồn Mẫu và PostgreSQL | 1.000 yêu cầu `GET /api/tro-ly/viet-tat` (cache trúng) và 100 yêu cầu lỡ cache | p95 ≤ **300 ms**; thân < 1 KB; 304 không thân; báo p50, p95, lớn nhất | XU / script đo | — | T09 |
| F07-HN-04 | plan §5 | Bật đọc, chunk phần đọc và bảng đã nạp | Đo từ lúc đáp án về đến `speak()` | < 150 ms (80 ms chờ sau `cancel` + xử lý); lần đầu chưa nạp: ghi thêm thời gian tải | PW | 1280 | T10 · Chờ F06 |
| F07-HN-05 | plan §5 | Bật đọc | Đếm `setInterval`/`setTimeout` do F07 tạo | Không có timer nền: chỉ một `setTimeout` 80 ms mỗi câu và một lần kiểm giọng sau 1 giây khi gắn nút | PW (bọc timer) + VT | 1280 | T10 |
| F07-HN-06 | F00 BR-9 | Bản `dotnet publish -c Release` | Lighthouse mobile `/` ×3 | Performance ≥ **85**; CLS < 0,1 (F07 không đổi) | LH | 375 | T10 |
| F07-HN-07 | plan §5 | VT | `chuanBiVanBanDoc` với 10.000 ký tự + bảng 200 khoá | < 50 ms | VT | — | Sau T02 |
| F07-HN-08 | plan Q6 | Bật đọc; 100 câu liên tiếp (bản giả) | Đếm tham chiếu `hangDoi` | Giải phóng sau câu cuối; không rò; không tăng đơn điệu | VT | — | Sau T03 |
| F07-HN-09 | plan §5 | Nút đọc hiện trễ vì giọng tới sau | CLS | Không nhảy bố cục đáng kể (đầu khung có chỗ trống giữa tên và ✕); CLS < 0,1 | PW | 375, 1280 | T10 |

## 12. Tích hợp PostgreSQL (T09)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/Chatbot/DocCauTraLoi/` (lớp con `VietTatDocServiceTrenPostgreSql` của `VietTatDocServiceContract`, `DbThuNghiem`). Máy không có Docker: bỏ qua có thông báo, ghi vào `result/test.md`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F07-HD-01 | plan §3 | `TepDuLieuMau.Nhung` nạp vào DB riêng | Gọi `VietTatDocService` trên nguồn Mẫu và PostgreSQL; tuần tự hoá | JSON giống từng byte | XU (Integration) | — | T09 |
| F07-HD-02 | plan §2 | B12 | Đếm và đối chiếu | Đủ 12 dòng đúng thứ tự `ThuTu`; `TTHC` → `thủ tục hành chính`, `đk` → `đăng ký`, `QĐ-UBND` → `quyết định Ủy ban nhân dân` | XU | — | Sau T01 / T09 |
| F07-HD-03 | plan §3 | Nguồn không có dòng viết tắt | `GET` | 200 với `[]` (không 404) | XU | — | Sau T01 |
| F07-HD-04 | BR-3 | PostgreSQL; `nhap tro-ly` với file có thêm một dòng viết tắt | `GET` trước/sau; `If-None-Match` cũ | Thấy dòng mới; `ETag` đổi; `If-None-Match` cũ → 200, không 304 cũ | XU | — | T09 · Chờ F01 |
| F07-HD-05 | F00 BR-10 | PostgreSQL | Nhập lại; gọi ngay | Thấy dữ liệu mới ngay, không chờ hết hạn cache | XU | — | T09 · Chờ F01 |
| F07-HD-06 | plan §3 | Route `/api/tro-ly/viet-tat`, `POST /api/tro-ly/hoi`, `GET /api/tro-ly/chu-de` | Gọi cả ba | Không đụng nhau; `/api/tro-ly/viet-tat` không bị route F06 bắt nhầm | XU | — | Sau T01 |
| F07-HD-07 | F00 BR-16 | Chế độ demo | `GET` | Luôn bảng của dữ liệu mẫu nhúng; không nhập được | XU | — | T09 |
| F07-HD-08 | plan §2 | Dòng `ChuVietTat` trùng khoá nhưng khác hoa thường (`TTHC`, `tthc`) | `GET` | Trả cả hai (FE chọn); ghi hành vi | XU | — | T09 |

## 13. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F07-GD-01, GD-02, GD-09…GD-13, GD-15, BM-01…BM-03 |
| BR-2 | F07-GD-01…GD-18, TN-10 |
| BR-3 | F07-VT-01…VT-20, HD-02, HD-04 |
| BR-4 | F07-NL-01…NL-10, HN-01, HN-02 |
| BR-5 | F07-BT-01…BT-16, KS-03 |
| BR-6 | F07-MC-01…MC-08 |
| BR-7 | F07-DO-06…DO-10, DG-01…DG-17 |
| AC-1 | F07-DO-01…DO-05, DO-12, BT-03 |
| AC-2 | F07-VT-01, VT-02, VT-20 |
| AC-3 | F07-BT-04, BT-05, DG-05 |
| AC-4 | F07-BT-01, BT-02 |
| AC-5 | F07-GD-03…GD-06, GD-14, GD-16 |
| AC-6 | F07-MC-01, MC-02, MC-08 |
| AC-7 | F07-DO-06…DO-08, DO-11 |
| AC-8 | F07-DG-01…DG-04, DG-11 |
| Bảo mật (CLAUDE.md) | F07-BM-01…BM-19, MC-03…MC-07 |
| Trợ năng | F07-TN-01…TN-11 |
| Hiệu năng (F00 BR-9) | F07-HN-01…HN-09, NL-08, NL-09 |
| Hai nguồn / tích hợp | F07-HD-01…HD-08 |
| Kiosk (F09) | F07-KS-01…KS-05, BT-15, BT-16, DG-15, DG-16 |

## 14. Tóm tắt

- **Số ca**: GD 18 · BT 16 · DO 21 · VT 20 · DG 17 · NL 10 · MC 8 · KS 5 · TN 11 · BM 19 · HN 9 · HD 8 = **162 ca**. Mỗi BR (1…7) và mỗi AC (1…8) có ít nhất một ca.
- **Tự động được**: Vitest (rà) cho chọn giọng, lưu cờ, chuẩn bị văn bản, phát âm với `speechSynthesis` giả; Playwright với bản giả ghi `speak`/`cancel`; xUnit cho endpoint viết tắt.
- **Bắt buộc thử tay với giọng thật** (`TAY`): GD-16…GD-18 (giọng cục bộ trên Windows, Android, iOS, macOS, Zalo, kiosk; tỷ lệ máy có nút — Cần hỏi 4), DO-05, DO-17, DO-18 (**iPhone Safari**, rủi ro 1), DO-20, DO-21, VT-11, VT-20 (nghe thử ngày, số hiệu, tiền, viết tắt), DG-04, DG-16, MC-08, TN-06, TN-07 (NVDA chồng tiếng).
- **Chờ chức năng khác**: F06 (khung chat thật, `ChoNutDoc`, `diemGhepDoc`, `vanBanDoc`: DO-01, DO-03, DO-06, DO-10…DO-12, DO-19, DG-01…DG-03, DG-11…DG-12, NL-02, MC-01, BM-01, TN-01, TN-05, HN-04); F09 (nút "Bắt đầu lại": BT-15, BT-16, DG-15, KS-01…KS-03, BM-19); F01 (nhập lại `tro-ly`: VT-17, HD-04, HD-05); thiết bị thật; hướng dẫn vận hành (KS-04).
- **AC khó kiểm tự động**: AC-1 và AC-2 phần **nghe được** (bản giả chỉ chứng minh đã gọi `speak` với đúng văn bản, không chứng minh có tiếng); AC-5 trên máy thật (phụ thuộc giọng cài trên máy); AC-6 trên thiết bị thật (không có chỉ báo micro và không có hộp thoại quyền); AC-7 và AC-8 "dừng ngay" (đo `cancel()` bằng bản giả, tiếng thật cần tai nghe); Safari iOS chặn `speak` sau `fetch` (chỉ iPhone thật biết).
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): (1) AC-7 "gửi câu hỏi mới → câu cũ dừng" nhưng BR-7 và plan chỉ dừng khi **đáp án mới đến** (Cần hỏi 2; DO-07); (2) BR-2 "máy không có giọng tiếng Việt" nhưng plan Q1 coi giọng mạng ("Google tiếng Việt", "Online (Natural)") là không có → nhiều máy không có nút dù trình duyệt "có tiếng Việt" (Cần hỏi 4; GD-02, GD-16, GD-17); (3) khi đọc, mở popup, chuyển trang trong ứng dụng, chuyển tab trình duyệt có dừng không (spec chỉ nói câu mới và đóng khung — DG-12…DG-14); (4) luật đọc số: `12.05.2026` thành `12052026`, `Điều 5.2` thành `52` (VT-10, VT-11; rủi ro 5); (5) yêu cầu của bên điều phối nói "thông báo rõ" khi không giọng nhưng spec/plan ẩn nút (Cần hỏi 1; GD-04); (6) lang `vie`, `localService` undefined, `vi_VN` có nhận không (GD-10…GD-12); (7) NVDA và giọng của trang đọc chồng nhau (TN-07); (8) cờ bật mà chưa hỏi gì: chunk phần đọc tải lúc mở khung hay lúc có đáp án đầu (NL-05).

## Cập nhật sau lượt chạy T09/T10/T11 (2026-10-13)

- Kết quả ở `result/test.md`. Sửa kỳ vọng cho khớp spec/thiết kế: **TN-04** vùng bấm ≥ 24 px (spec C01 AC-2; nút 34×34); **KS-01** ≥ 48 px ở kiosk (số đo 47,5 px → lỗi F7-2); **NL-08** chunk phần đọc ≤ 3 KB gzip (số đo 3,9 KiB → lỗi F7-1). Giọng đọc ở e2e là bản giả; ca giọng thật vẫn "thử tay — chờ".

## Cập nhật lượt xác nhận (2026-10-14)

- **KS-01** (≥ 48 px ở kiosk) nay đạt, kể cả mọi nút chỉ có biểu tượng trong khung. **TN-04** vùng bấm ≥ 24 px theo spec C01 AC-2 (nút đọc 34×34 ở 375). **NL-08** (chunk ≤ 3 KB) vẫn trượt: 4,15 KiB gzip -9 (F7-1, chờ planner).
