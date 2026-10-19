---
id: F09
ten: Kiosk dùng chung — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: chưa chạy — viết ở T07 (code đang làm song song). Chạy ở T08 (E2E, hiệu năng, kết quả); kết quả vào result/test.md. Ca cần trợ lý chờ F06, ca cần đọc chờ F07
---

# F09 · Kiosk dùng chung — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/kiosk.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`). Mở kiosk bằng `/?kiosk=1`; đồng hồ giả bằng `page.clock`; mạng bằng `page.route`, `context.setOffline`; giả `speechSynthesis` bằng `addInitScript` (đếm `cancel`) |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory (`Tests/Integration/` — giới hạn 60 câu/phút, header). F09 không có API mới nên chỉ kiểm cấu hình mặc định và header |
| VT | Vitest do ui-core-dev/frontend-dev/chatbot-dev viết (T01–T05); tester chỉ rà. `laLienKetCongDvc`, `NhacDangXuat`, `batDauLai`, `dieuHuongThayLichSu`, `giaoDienKiosk`, `Layout` |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`) |
| TAY | Thử tay (NVDA, trình duyệt kiosk thật, màn hình cảm ứng) |

**Khổ**: **K** = kiosk 1080×1920 mở bằng `/?kiosk=1` (khổ chính của F09); 375 (375×812) và 1280 cho ca **ngoài kiosk** (AC-4, AC-8); 768 cho dạng thẻ/bảng; 320 chỉ cho ca reflow.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`) và **PostgreSQL** (profile `https-postgresql`). Ô dịch vụ và thông tin Trung tâm giả bằng `page.route('**/api/trung-tam')` đúng hình dạng F08 (`oDichVu[].url`); danh mục/thủ tục giả như F04 (`e2e/du-lieu/`).

**Dữ liệu thử** — tên giả (trừ mã 1.001193 "Thủ tục đăng ký khai sinh", Hộ tịch, ô dịch vụ của `lien-ket.md` §1 mà AC nêu đích danh):

| Bộ | Nội dung |
|---|---|
| **O6** | Sáu ô dịch vụ đúng `lien-ket.md` §1: "Bốc số thứ tự / Đặt lịch hẹn" (url null), "Đánh giá hài lòng" (url null), "Tra cứu hồ sơ" (`https://dichvucong.gov.vn/tra-cuu-ho-so`), "Thanh toán trực tuyến" (`…/thanh-toan-truc-tuyen`), "Cổng Dịch vụ công Quốc gia" (`…/thu-tuc-hanh-chinh`), "Cổng thông tin điện tử xã Cần Giuộc" (`https://cangiuoc.tayninh.gov.vn`) → **ba ô** tới Cổng DVC |
| **O1** | Chỉ "Cổng thông tin điện tử xã Cần Giuộc" và hai ô url null — không ô nào tới Cổng DVC |
| **OC** | Một ô url `https://abc.dichvucong.gov.vn/x` (tên miền con) · **OT** một ô url `https://dichvucong.tayninh.gov.vn/x` (tên miền không tồn tại, "Đã bỏ") |
| **OG** (giả mạo) | url `https://dichvucong.gov.vn.evil.com/`, `https://evildichvucong.gov.vn`, `https://evil.com/?u=dichvucong.gov.vn`, `https://dichvucong.gov.vn@evil.com`, `https://dichvucong.gov.vn%2eevil.com`, `https://dichvucong.gov.vn:pass@evil.com`, và tên miền có chữ Cyrillic giống chữ Latin (sinh bằng `String.fromCodePoint(0x0441)`, không gõ \u) |
| **N** | Nguồn Mẫu nhúng (M408): 408 thủ tục, 266 cấp xã, 408 cấp tỉnh; có 1.001193 (Hộ tịch); 6 chủ đề; câu hỏi mẫu; Zalo OA trống |
| **N60** | 60 thủ tục "Thủ tục hộ tịch thử 01…60" (cho phân trang 25 · 25 · 10) |
| **N0** | Danh mục rỗng `[]` |
| **HT-A** (hành trình AC-6) | Ở kiosk: bật đọc; chọn dạng bảng; vào danh mục; tab "Thủ tục cấp tỉnh"; gõ "khai sinh"; lọc "Hộ tịch"; mở trợ lý; hỏi "làm giấy khai sinh cần gì"; bấm "Xem chi tiết" → popup 1.001193 mở trên khung; đang "đọc" |
| **PII** | Câu "số 0912345678 của tôi nộp hồ sơ chưa" |
| **KS-URL** | `/?kiosk=1`, `/thu-tuc?kiosk=1`, `/linh-vuc?kiosk=1`, `/?kiosk=0`; địa chỉ lạ `?kiosk=abc`, `?kiosk=`, `?kiosk=true`, `?kiosk=1&kiosk=0`, `?kiosk=<script>alert(1)</script>` |

**Cột "Khi chạy"**: "Sau T0x" = task xong; "T08" = E2E/hiệu năng; "Chờ F06" = cần khung trợ lý thật (F06 T11–T13) và BE; "Chờ F07" = cần đọc (giả `speechSynthesis` đủ cho ca tự động nhưng cần `ChoNutDoc` thật); "Chờ thiết bị" = trình duyệt kiosk thật (câu hỏi mở 10); "Chờ tài liệu vận hành" = kế hoạch 8.5. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: tự làm mới, cảnh báo, đếm ngược (đã bỏ — câu hỏi mở 15; chỉ còn ca **âm** ở nhóm KT); QR hoặc link chia sẻ riêng từng thủ tục (câu hỏi mở 24: không làm); đóng/đăng xuất trang của đơn vị khác (ngoài phạm vi); chữ lớn đọc to cả trang.

## 1. Bật chế độ kiosk bằng link, giữ sau khi tải lại (BR-1; AC-1)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-KB-01 | AC-1, BR-1 | N, mở `/?kiosk=1` | Xem trang | `<html>` có lớp `kiosk`; chữ phóng 118,75% (cỡ chữ gốc ≈ 19 px); nút, ô nhập cao ≥ 48 px (C01 AC-2); danh sách thủ tục thường gặp **dạng thẻ**; địa chỉ chuyển thành `/` (tham số `kiosk` bị xoá) | PW | K | T08 |
| F09-KB-02 | AC-1 | Sau KB-01 | Tải lại (F5) khi địa chỉ là `/` | Vẫn ở chế độ kiosk: chữ, nút vẫn lớn, vẫn thẻ (cờ ở `sessionStorage`) | PW | K | T08 |
| F09-KB-03 | BR-1 | Tab mới (không `?kiosk=1`) cùng trình duyệt | Mở `/` | Không kiosk (cờ theo tab); ghi hành vi — đây là lý do hướng dẫn vận hành bắt "mở lại bằng link kiosk" | PW | K | T08 |
| F09-KB-04 | BR-1 | Kiosk đang bật | Mở `/?kiosk=0` | Tắt: lớp `kiosk` mất; nút "Bắt đầu lại" biến mất (không cần tải lại tay); cỡ chữ về thường | PW | K | T08 |
| F09-KB-05 | BR-1 (đầu vào lạ) | KS-URL lạ | Mở từng địa chỉ | `abc`, rỗng, `true`: không đổi trạng thái hiện tại (hoặc ghi hành vi); `1&0`: ghi kết quả; `<script>`: không hiển thị, 0 hộp thoại, địa chỉ chuẩn lại, không lỗi | PW | K, 1280 | T08 |
| F09-KB-06 | plan §4.2 | `sessionStorage` bị chặn (ném lỗi), `/?kiosk=1` | Mở; bấm "Bắt đầu lại" | Vẫn kiosk trong lần tải (nhờ tham số); sau "Bắt đầu lại" (`/?kiosk=1`) vẫn kiosk | PW | K | T08 |
| F09-KB-07 | BR-1 | `/thu-tuc?kiosk=1&cap=tinh&q=khai sinh&lv=ho-tich` | Mở | Kiosk bật; `cap`, `q`, `lv` giữ nguyên; chỉ `kiosk` bị xoá khỏi địa chỉ | PW | K | T08 |
| F09-KB-08 | BR-1 | Điện thoại 375 và máy tính 1280, không link kiosk | Mở `/`, `/thu-tuc`, `/linh-vuc` | Không kiosk; không nút "Bắt đầu lại"; không dòng nhắc; không tải chunk kiosk | PW | 375, 1280 | T08 |
| F09-KB-09 | BR-1 (không đặc quyền) | `/?kiosk=1` | So số lần và loại yêu cầu API với `/` thường | Không thêm API hay dữ liệu nào (chỉ chữ lớn + nút + dòng nhắc) | PW | K, 1280 | T08 |
| F09-KB-10 | BR-1, F04 DH-04 | Kiosk, chưa chọn dạng | Mở `/thu-tuc` | Dạng thẻ, có nút chuyển dạng; chọn bảng rồi tải lại → vẫn bảng | PW | K | T08 |
| F09-KB-11 | BR-1 (kiosk khổ nhỏ) | `/?kiosk=1` ở 375 | Xem | Không tràn ngang (`scrollWidth` ≤ `clientWidth`), nút "Bắt đầu lại" không che nút Trợ lý. Cũng kiểm 320 và 414: không tràn | PW | 375 | T08 |
| F09-KB-12 | BR-1 (vận hành) | Hướng dẫn vận hành (kế hoạch 8.5) | Tìm đoạn về link kiosk | Có link `https://<tên-miền>/?kiosk=1` đặt làm trang khởi động; `?kiosk=0` để tắt; cờ mất khi đóng tab nên mở lại phải vào đúng link | SH / đọc tài liệu | — | Chờ tài liệu vận hành |

## 2. Không tự làm mới (BR-2, BR-3; AC-2)

Nhóm này chủ yếu là ca **âm**: chứng minh không có gì tự chạy.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-KT-01 | AC-2, BR-2 | Kiosk, N. Danh mục, gõ "khai sinh", lọc "Hộ tịch"; mở trợ lý, hỏi "làm giấy khai sinh cần gì", bấm "Xem chi tiết" → popup trên khung | `page.clock.fastForward` 15 phút | Popup, khung trợ lý, hội thoại, từ khoá, bộ lọc còn nguyên; địa chỉ không đổi; **không** cảnh báo, hộp thoại, đếm ngược ("Bạn còn dùng không?") | PW | K | T08 · Chờ F06 |
| F09-KT-02 | BR-2 | Kiosk, mở `/thu-tuc` đã lọc | Tua 15 phút rồi 2 giờ | Không sự kiện `framenavigated`, `load`; không yêu cầu mạng mới do trang tự phát (trừ đồng hồ giờ làm việc cập nhật chữ trạng thái trong trang); nội dung giữ nguyên | PW | K | T08 |
| F09-KT-03 | BR-2 | Kiosk | `grep` `setTimeout`, `setInterval`, `requestIdleCallback`, `visibilitychange`, `beforeunload` trong `core/kiosk` | Không bộ đếm nào tự xoá hoặc tự tải lại; `batDauLai` chỉ được gọi từ `onClick` của nút | SH + VT (rà) | — | Sau T02 |
| F09-KT-04 | BR-2 | Kiosk, đồng hồ giả | Đếm `setInterval`/`setTimeout` do mô-đun kiosk tạo (bọc timer trước khi tải) | Không có | VT / PW | K | Sau T02 / T08 |
| F09-KT-05 | BR-2 | Kiosk, đang đọc (giả) | Để 15 phút | Không tự dừng/tự đọc thêm; không làm mới | PW | K | T08 · Chờ F07 |
| F09-KT-06 | BR-2 | Kiosk, mất mạng 15 phút rồi có lại | Quan sát | Không tự tải lại; nội dung giữ nguyên | PW | K | T08 |
| F09-KT-07 | BR-2 (ngoài kiosk) | Điện thoại 375 | Tua 15 phút | Cũng không đổi gì (không có cơ chế làm mới ở bất kỳ chế độ nào) | PW | 375 | T08 |
| F09-KT-08 | BR-3 (hệ quả) | Kiosk, hỏi PII (trợ lý) | **Không** bấm "Bắt đầu lại"; mở lại khung | Câu "số 0912345678 …" còn trên màn hình: đúng thiết kế (BR-3: người sau thấy dữ liệu người trước; che chỉ cho dữ liệu lưu). Ghi nhận, kiểm tài liệu vận hành nói rõ hệ quả | PW + SH | K | T08 · Chờ F06 |
| F09-KT-09 | BR-3, BR-6 (vận hành) | Hướng dẫn vận hành | Tìm | Nói rõ: người trước không bấm "Bắt đầu lại" thì người sau thấy câu đã gõ; không có tự xoá; cán bộ bấm khi thấy kiosk bỏ không; cuối ngày kiểm tra kiosk | SH / đọc tài liệu | — | Chờ tài liệu vận hành |

## 3. Dòng nhắc "Nhớ đăng xuất khi dùng xong" (BR-4; AC-3, AC-4, AC-12)

Đếm bằng `getByText('Nhớ đăng xuất khi dùng xong')`. Chuỗi phải khớp nguyên văn, không dấu chấm cuối.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-NH-01 | AC-3 | Kiosk, O6, N, trang chủ | Đếm dòng nhắc | **Đúng 2**: một phía trên các ô dịch vụ, một phía trên danh sách thủ tục thường gặp; không thẻ, dòng bảng, ô nào có dòng riêng | PW | K | T08 |
| F09-NH-02 | AC-3 | Như trên, dạng thẻ rồi dạng bảng | Đếm | Cả hai dạng: vẫn đúng 2 (một mỗi nơi) | PW | K | T08 |
| F09-NH-03 | AC-3 | Như trên | Đọc vị trí trong DOM và toạ độ | Dòng "ô dịch vụ" đứng **trước** lưới ô và có toạ độ y nhỏ hơn ô đầu; dòng "thường gặp" đứng trước danh sách | PW | K | T08 |
| F09-NH-04 | AC-3 | Kiosk, O1 (không ô nào tới Cổng DVC) | Mở trang chủ | **Không** dòng phía trên ô dịch vụ; vẫn 1 dòng phía trên thường gặp | PW | K | T08 |
| F09-NH-05 | AC-3 | Kiosk, `oDichVu` rỗng; đang tải; lỗi 500 | Mở trang chủ | Không dòng phía trên ô | PW | K | T08 |
| F09-NH-06 | AC-3 | Kiosk, N, danh mục 4 tổ hợp: tab Cấp xã × thẻ, Cấp xã × bảng, Cấp tỉnh × thẻ, Cấp tỉnh × bảng | Đếm | Mỗi tổ hợp đúng 1 dòng phía trên danh sách | PW | K | T08 |
| F09-NH-07 | AC-3 | Kiosk, N60 | Sang trang 2, 3; đổi thẻ ↔ bảng | Vẫn đúng 1 dòng, không nhân bản | PW | K | T08 |
| F09-NH-08 | AC-3 | Kiosk, N, không có kết quả ("xyzxyz"); N0; đang tải | Đếm | 0 dòng (danh sách trống thì không dòng); khi lọc còn 1 thủ tục → 1 dòng | PW | K | T08 |
| F09-NH-09 | AC-3 | Kiosk, N | Mở popup thủ tục 1.001193 | **Một** dòng cạnh liên kết "Xem và nộp trên Cổng DVC" (đứng trước liên kết trong DOM, cùng chân popup) | PW | K | T08 |
| F09-NH-10 | AC-3 | Như trên | Bấm "Xem và nộp trên Cổng DVC" | Tab mới mở **ngay** `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.001193&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD`; không bước xác nhận (không `dialog`, không modal mới) | PW (chặn mạng ra ngoài) | K | T08 |
| F09-NH-11 | BR-4 ("một dòng mỗi nơi") | Kiosk, danh mục có popup mở | Đếm tổng | 2 dòng (danh sách + popup), mỗi nơi 1 | PW | K | T08 |
| F09-NH-12 | AC-3 | Kiosk, trợ lý, N | Hỏi "kết hôn", rồi "nộp hồ sơ trực tuyến ở đâu" | Khung có **đúng một** dòng nhắc, dưới thanh tiêu đề, trên danh sách tin; không lặp ở từng đáp án | PW | K | T08 · Chờ F06 |
| F09-NH-13 | AC-3 | Như trên | Bấm "Bắt đầu lại", mở trợ lý, hỏi "mấy giờ làm việc" | Khung **không** có dòng nhắc (đáp án không có liên kết Cổng DVC) | PW | K | T08 · Chờ F06 |
| F09-NH-14 | BR-4 | Kiosk, trợ lý | Hỏi lần lượt chỉ để có đáp án không liên kết Cổng DVC: "số điện thoại trung tâm" (`tel:`), "email trung tâm" (`mailto:`), "giá vàng hôm nay" (nút gọi), "trung tâm ở đâu" với link bản đồ | Mỗi lần 0 dòng | PW | K | T08 · Chờ F06 |
| F09-NH-15 | BR-4 | Kiosk, trợ lý, chỉ lời chào | Mở khung | 0 dòng | PW | K | T08 · Chờ F06 |
| F09-NH-16 | BR-4 | Kiosk, khung có >60 tin, tin chứa liên kết Cổng DVC bị bỏ khỏi state | Quan sát | Ghi hành vi: dòng nhắc còn hay mất khi tin chứa liên kết rơi khỏi 60 tin gần nhất | PW | K | T08 · Chờ F06 |
| F09-NH-17 | AC-3 | Kiosk, cuộn tới cuối mọi trang | Tìm dòng nhắc trong chân trang | Chân trang **không** có dòng (dù có liên kết "Cổng Dịch vụ công Quốc gia" trong chân trang, `lien-ket.md` §1) | PW | K | T08 |
| F09-NH-18 | BR-4 | Kiosk | `/linh-vuc`, trang 404 | 0 dòng (không có liên kết Cổng DVC) | PW | K | T08 |
| F09-NH-19 | AC-4 | Điện thoại 375 (không link kiosk) | Mở trang chủ, danh mục (hai tab × thẻ/bảng), popup, trợ lý (hỏi "kết hôn", "nộp hồ sơ trực tuyến ở đâu") | **0** dòng ở mọi chỗ; chunk kiosk không được tải | PW | 375 | T08 |
| F09-NH-20 | AC-4 | Máy tính 1280 (không kiosk) | Như trên | 0 dòng | PW | 1280 | T08 |
| F09-NH-21 | AC-12 | Kiosk, OC (ô url tên miền con) | Mở trang chủ | Có dòng nhắc phía trên ô dịch vụ (nơi có liên kết đó) | PW | K | T08 |
| F09-NH-22 | AC-12 | Kiosk, OT (`dichvucong.tayninh.gov.vn`) | Mở trang chủ | **Không** dòng nhắc phía trên ô (tên miền khác, "Đã bỏ"); tester kiểm thêm dữ liệu thật không chứa tên miền này (`lien-ket.md` §1) | PW + SH | K | T08 |
| F09-NH-23 | AC-12 (mơ hồ) | Kiosk | Tìm "thủ tục có liên kết tới tên miền con" | Dữ liệu thủ tục không có trường liên kết riêng (liên kết "Xem và nộp" luôn `dichvucong.gov.vn` qua `linkDvc`); ca dùng **ô dịch vụ** (OC) và **liên kết Cổng DVC Quốc gia trong câu trả lời** của trợ lý (url tên miền con); ghi vào mục mơ hồ | PW | K | T08 |
| F09-NH-24 | AC-12 | Kiosk, trợ lý, liên kết nộp trực tuyến của Trung tâm = `https://abc.dichvucong.gov.vn/x` | Hỏi "nộp hồ sơ trực tuyến ở đâu" | Khung có đúng một dòng nhắc | PW | K | T08 · Chờ F06 |
| F09-NH-25 | BR-4 | Kiosk, O6 | Đếm dòng khi ba ô cùng tới Cổng DVC | Vẫn **một** dòng (không một dòng mỗi ô) | PW | K | T08 |
| F09-NH-26 | BR-4 (liên kết khác tên miền) | Kiosk, ô tới `https://cangiuoc.tayninh.gov.vn` và `https://tayninh.gov.vn` | Đếm | 0 dòng riêng cho các ô này | PW | K | T08 |
| F09-NH-27 | BR-4 (nhập lại, CHAY-THAT) | PostgreSQL; nhập lại file ô dịch vụ chỉ còn "Cổng thông tin điện tử xã Cần Giuộc" và hai ô chưa link, không build lại | Tải lại trang chủ kiosk | Không dòng phía trên ô (AC-3 phần nhập lại) | PW + XU | K | T08 · Chờ F01 |
| F09-NH-28 | plan §4.4 | Kiosk | Đọc thuộc tính của dòng | Là văn bản thuần (không liên kết, không nút, không tabbable); icon `aria-hidden`; không `aria-live`; chữ phụ `--color-text-muted`, tương phản ≥ 4.5:1 | PW + AX | K | T08 |
| F09-NH-29 | plan §5 (CLS) | Kiosk, chunk kiosk trễ 3 giây (chặn tạm) | Mở `/` và `/thu-tuc`, đo CLS | CLS ≤ 0,05 (mục tiêu như F02); ghi nếu dòng chèn muộn làm đẩy nội dung (rủi ro Suspense `fallback={null}`). Ma trận đầy đủ (`/`, `/thu-tuc`, `/linh-vuc` × 375/768/1280/kiosk × API tức thì/trễ 3 s) ở `e2e/cls-ma-tran.spec.ts` | PW (đo CLS) | K | T08 |
| F09-NH-30 | BR-4 (nội dung) | Kiosk | Đọc chữ | Đúng "Nhớ đăng xuất khi dùng xong" (qua `t('kiosk:nhac-dang-xuat')`) | PW | K | T08 |
| F09-NH-31 | BR-4, C01 BR-3 | Kiosk | Bấm liên kết ô "Tra cứu hồ sơ" | Mở tab mới ngay, đúng `https://dichvucong.gov.vn/tra-cuu-ho-so`; `rel` có `noopener noreferrer`; không bước xác nhận | PW | K | T08 |

## 4. Nhận diện liên kết Cổng DVC (`laLienKetCongDvc`; BR-4; AC-12)

So khớp theo nhãn tên máy đã phân tích bằng `URL`, **không** `includes`/`endsWith` trên chuỗi thô.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-NM-01 | BR-4, AC-12 | VT | `laLienKetCongDvc` với `https://dichvucong.gov.vn/tra-cuu-ho-so`, `http://dichvucong.gov.vn`, `https://www.dichvucong.gov.vn/x`, `https://abc.dichvucong.gov.vn/x`, `HTTPS://DichVuCong.Gov.VN/`, kết quả `linkDvc('1.001193')`, `https://dichvucong.gov.vn:8443/x` | Tất cả **đúng** | VT (rà) + PW (qua ô OC) | — | Sau T01 |
| F09-NM-02 | BR-4 | VT | `null`, `undefined`, `''`, khoảng trắng, `javascript:alert(1)`, `tel:02723893900`, `mailto:a@b.vn`, `data:text/html,x`, `//dichvucong.gov.vn` (tương đối), `/thu-tuc` | Tất cả **sai**; không ném lỗi | VT | — | Sau T01 |
| F09-NM-03 | BR-4 (giả mạo) | OG / VT | `https://dichvucong.gov.vn.evil.com`, `https://evildichvucong.gov.vn`, `https://evil.com/?u=dichvucong.gov.vn`, `https://dichvucong.gov.vn@evil.com`, `https://dichvucong.gov.vn%2eevil.com`, `https://dichvucong.gov.vn:pass@evil.com` | Tất cả **sai** (không lọt `dichvucong.gov.vn.evil.com`) | VT + PW (ô OG: 0 dòng nhắc) | K | Sau T01 / T08 |
| F09-NM-04 | BR-4 (khác tên miền) | VT | `https://dichvucong.tayninh.gov.vn`, `https://cangiuoc.tayninh.gov.vn`, `https://tayninh.gov.vn`, `https://motcua.tayninh.gov.vn` | Tất cả **sai** | VT | — | Sau T01 |
| F09-NM-05 | BR-4 (biên) | VT | `https://a.b.dichvucong.gov.vn` (nhiều tầng); `https://dichvucong.gov.vn./x` (dấu chấm cuối); `https://DICHVUCONG.GOV.VN` | Nhiều tầng **đúng**; chấm cuối và hoa: ghi hành vi (nên đúng); không lỗi | VT | — | Sau T01 |
| F09-NM-06 | BR-4 (đồng hình) | VT | `https://dichvucong.gov.vn` với chữ `с` Cyrillic thay cho `c` (sinh bằng `String.fromCodePoint`), punycode `xn--…` | **Sai** (tên miền khác) | VT | — | Sau T01 |
| F09-NM-07 | BR-4 (chuỗi lạ) | VT | Chuỗi 100.000 ký tự, chuỗi có ký tự điều khiển, `https://`, `https://dichvucong.gov.vn` + 10.000 ký tự đường dẫn | Không treo (< 50 ms), không lỗi; đúng/sai hợp lý | VT | — | Sau T01 |
| F09-NM-08 | BR-4 | Mã nguồn | `grep` `includes(`, `endsWith(`, `indexOf(` trên chuỗi URL thô trong `core/kiosk/laLienKetCongDvc.ts` | Không dùng; chỉ so tên máy đã phân tích | SH | — | Sau T01 |
| F09-NM-09 | BR-4 | `NhacDangXuat` có `cacLienKet` | Mảng rỗng; toàn `null`; một đích Cổng DVC lẫn đích khác; hai đích Cổng DVC | Rỗng/toàn null → không dòng; có ≥ 1 đích Cổng DVC → đúng 1 dòng dù có nhiều đích | VT (rà) | — | Sau T01 |

## 5. Nút "Bắt đầu lại" — vị trí, thứ tự Tab, bàn phím (BR-7; AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-NV-01 | AC-8 | Điện thoại 375, máy tính 1280, không link kiosk | Mở `/`, `/thu-tuc`, `/linh-vuc` | **Không** có nút "Bắt đầu lại"; chunk kiosk không tải | PW | 375, 1280 | T08 |
| F09-NV-02 | AC-8, BR-7 | Kiosk | Mở `/`, `/thu-tuc`, `/linh-vuc` | Nút có ở cả ba trang, góc dưới **bên trái** (toạ độ trái, đáy), cùng độ cao với nút "Trợ lý" (đối xứng) | PW | K | T08 |
| F09-NV-03 | AC-8 | Kiosk, cuộn tới cuối từng trang | Đo hộp bao nút và chân trang | Nút **không che** chữ ở chân trang (hai hộp không giao nhau; `--fab-clearance`) | PW | K, 1280 (kiosk) | T08 |
| F09-NV-04 | BR-7 | Kiosk | Đo kích thước và tên | Cao ≥ 48 px; tên đọc "Bắt đầu lại"; có icon `RotateCcw` | PW | K | T08 |
| F09-NV-05 | plan §4.2 | Kiosk | Đọc DOM | Nút là **con trực tiếp của `<body>`**, mang `data-ngoai-popup`, `z-index` lớn hơn popup (50) và khung trợ lý (45) | PW + VT | K | T08 / Sau T02 |
| F09-NV-06 | BR-7 | Kiosk, popup mở | Hit-test tâm nút (`elementFromPoint`); bấm | Nút nằm trên lớp phủ popup, không `inert`, bấm được; dải dưới 88 px của popup không bị nút che chân popup (kể cả chân popup xuống hai hàng) | PW | K | T08 |
| F09-NV-07 | BR-7 | Kiosk, khung trợ lý mở | Xem bố cục | Nút ở trái, khung ở phải; không che ô nhập, nút "Gửi" | PW | K | T08 · Chờ F06 |
| F09-NV-08 | BR-7 | Kiosk, không popup, khung đóng | Tab liên tục từ đầu trang | Nút "Bắt đầu lại" là phần tử tab được **cuối cùng** của tài liệu (sau chân trang) | PW | K | T08 |
| F09-NV-09 | BR-7 | Kiosk, khung trợ lý mở, không popup | Tab liên tục | Mọi phần tử của khung đứng **trước** nút "Bắt đầu lại" (khung nằm trong `#root`, không portal) | PW | K | T08 · Chờ F06 |
| F09-NV-10 | BR-7, C01 BR-9 | Kiosk, popup mở | Tab và Shift+Tab qua nhiều vòng | Vòng gồm các phần tử của popup rồi nút "Bắt đầu lại" (cuối vòng); Shift+Tab từ phần tử đầu nhảy về nút; không thoát ra nền | PW | K | T08 |
| F09-NV-11 | BR-7 | Kiosk, popup mở | Esc | **Chỉ** đóng popup; không kích hoạt "Bắt đầu lại" | PW | K | T08 |
| F09-NV-12 | BR-7 | Kiosk | Tab tới nút; Enter; làm lại với Space | Kích hoạt "Bắt đầu lại"; có viền focus nhìn thấy | PW | K | T08 |
| F09-NV-13 | BR-7 | Kiosk, popup và khung trợ lý cùng mở | Bấm nút | Bấm được; xử lý như BL-12 | PW | K | T08 · Chờ F06 |
| F09-NV-14 | plan §4.1 | Bản build | `grep` "Bắt đầu lại" trong `common.json` và chunk chính; ở chunk kiosk | Chữ nằm ở namespace `kiosk` (chunk kiosk), không ở bundle chính | SH | — | Sau T01 |
| F09-NV-15 | BR-7 (cảm ứng) | Màn hình cảm ứng kiosk thật | Chạm một lần | Kích hoạt một lần (không cần chạm đúp); vùng chạm đủ lớn cho ngón tay | TAY | K | T08 · Chờ thiết bị |
| F09-NV-16 | BR-7 | Kiosk 375 | Xem | Nút không che nút "Trợ lý" và nội dung chính; ghi hành vi | PW | 375 | T08 |
| F09-NV-17 | BR-7 | Kiosk | Quan sát trước khi chunk kiosk về (chặn 3 giây) | Chưa có nút trong khoảng đó (ghi: hở nhỏ, rủi ro 5); khi chunk về nút xuất hiện không lỗi | PW | K | T08 |

## 6. Bắt đầu lại — xoá trạng thái, giữ kiosk, giữ lựa chọn (BR-7; AC-6, AC-9, AC-10)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-BL-01 | AC-6 | HT-A, giả `speechSynthesis` đang "đọc" | Bấm "Bắt đầu lại" | `speechSynthesis.cancel()` được gọi (tiếng đọc dừng ngay — F07 BR-7) | PW | K | T08 · Chờ F06, F07 |
| F09-BL-02 | AC-6 | Như trên | Xem trang sau khi tải xong | Ở **trang chủ**, đầu trang; popup và khung trợ lý **đóng**; địa chỉ không còn `ma` | PW | K | T08 · Chờ F06 |
| F09-BL-03 | AC-6 | Như trên | Xem | **Vẫn kiosk**: nút "Bắt đầu lại" vẫn hiện, chữ và nút vẫn lớn | PW | K | T08 |
| F09-BL-04 | AC-6 | Như trên | Mở trợ lý; hỏi "mấy ngày" | Hội thoại trống như lần mở đầu (chỉ lời chào); "mấy ngày" **không** ra thời hạn của thủ tục đăng ký khai sinh | PW | K | T08 · Chờ F06 |
| F09-BL-05 | AC-6 | Như trên | Mở danh mục | Tab "Thủ tục cấp xã" như lần mở đầu; ô tìm trống; không lọc; trang 1 | PW | K | T08 |
| F09-BL-06 | AC-6, AC-10 | Như trên | Xem bật đọc và dạng danh sách | Vẫn **đang bật đọc** (`doc-bat` còn); danh sách vẫn **dạng bảng** (`cach-xem` còn) | PW | K | T08 · Chờ F07 |
| F09-BL-07 | AC-10 | Kiosk, N. Vào danh mục, tab "Thủ tục cấp tỉnh", gõ "khai sinh" | Bấm "Bắt đầu lại"; ghi các địa chỉ thấy được | Trang tải lại; địa chỉ `/?kiosk=1` rồi chuyển thành `/` (tham số `kiosk` bị xoá, vẫn kiosk); chữ, nút lớn; bật đọc và thẻ/bảng như trước; không trạng thái nào trong bộ nhớ trang (hội thoại, từ khoá, bộ lọc, popup) | PW | K | T08 |
| F09-BL-08 | AC-10 | Như trên, mạng "của Trung tâm" giả lập (Fast 4G và 100 Mbps) | Đo từ click đến trang chủ hiện đầy đủ | ≤ **1,5 giây**; ghi số cho từng cấu hình mạng (spec chưa nói băng thông "mạng của Trung tâm" — ghi mơ hồ) | PW (đo `load`, LCP) | K | T08 |
| F09-BL-09 | plan §4.2 | Kiosk, nội dung người trước đang hiển thị | Bấm; chụp màn hình 50 ms sau click | Nội dung người trước **biến mất ngay** (`body.hidden`), không chờ trang mới tải | PW | K | T08 |
| F09-BL-10 | BR-7 | Kiosk | Bấm "Bắt đầu lại" | Làm ngay, không hộp thoại xác nhận (`dialog` = 0, không modal) | PW | K | T08 |
| F09-BL-11 | BR-7 | Kiosk | Bấm hai lần rất nhanh | Một lần tải trang; không lỗi (nút đã ẩn sau lần đầu) | PW | K | T08 |
| F09-BL-12 | BR-7 | Kiosk | Bấm khi: (a) popup mở; (b) khung trợ lý mở, không popup; (c) cả hai mở; (d) ở `/linh-vuc`; (e) ở `/thu-tuc?cap=tinh&q=a&lv=ho-tich&md=toan-trinh&trang=2&ma=1.001193`; (f) ở trang 404 | Cả sáu: về `/`, đầu trang, sạch popup/khung/bộ lọc, vẫn kiosk | PW | K | T08 · (b)(c) Chờ F06 |
| F09-BL-13 | BR-7 | Kiosk, đã gõ vào ô tìm danh mục và ô tìm lĩnh vực | Bấm; xem các ô tìm | Ô tìm trống (`replace` không khôi phục nội dung ô nhập như `reload`); ô nhập trợ lý trống | PW + TAY (Firefox) | K | T08 |
| F09-BL-14 | plan §2 | Kiosk | Quét `localStorage`, `sessionStorage` trước/sau | `cach-xem` và `doc-bat` còn; `sessionStorage kiosk` còn; không khoá mới nào | PW | K | T08 |
| F09-BL-15 | plan §6 | Địa chỉ hiện tại chứa `?next=https://evil.example` hoặc `?redirect=//evil.example` | Bấm | Luôn tới `/?kiosk=1` (đích là hằng cùng nguồn); không open redirect | PW | K | T08 |
| F09-BL-16 | plan §5 (dữ liệu mới) | Kiosk, `GET /api/trung-tam` đổi địa chỉ giữa hai lần | Bấm; xem chân trang/khối liên hệ | Hiện địa chỉ mới ngay sau "Bắt đầu lại" (bộ đệm TanStack mất, tải mới); `index.html` `no-cache` hỏi lại ETag | PW | K | T08 |
| F09-BL-17 | BR-6 | Kiosk, `context.setOffline(true)` rồi bấm | Xem | Nội dung người trước **không còn** trên màn hình; trình duyệt hiện trang lỗi của nó (trang tra cứu không hiện lại); bật mạng + vào link kiosk → dùng lại bình thường | PW | K | T08 |
| F09-BL-18 | BR-7 (chớp trắng) | Kiosk thật hoặc giả lập mạng chậm | Bấm; đo khoảng màn hình trắng | 0,3–1,5 giây (spec); ghi số; JS/CSS lấy từ bộ nhớ đệm, mạng chỉ `index.html` (304) + API | PW + TAY | K | T08 · Chờ thiết bị |
| F09-BL-19 | BR-7 | Kiosk, `Layout` | Sau tải lại | Nút "Trợ lý" đóng (`aria-expanded=false`); con trỏ ở đầu trang; không phần tử nào giữ trạng thái cũ | PW | K | T08 |
| F09-BL-20 | BR-7 (không tự chạy) | Kiosk | Để 15 phút (KT-01) | `batDauLai` không được gọi; kiểm `location.replace` spy | PW | K | T08 |
| F09-BL-21 | AC-9 | Kiosk, PII | Hỏi "số 0912345678 của tôi nộp hồ sơ chưa"; bấm "Bắt đầu lại"; mở lại trợ lý | Màn hình không còn câu có "0912345678"; hội thoại trống | PW | K | T08 · Chờ F06 |
| F09-BL-22 | AC-9 | Như BL-21 | `page.content()`, `localStorage`, `sessionStorage`, cookie, IndexedDB, `history.state`, URL | Không chứa "0912345678"; không `document.cookie` | PW | K | T08 · Chờ F06 |
| F09-BL-23 | AC-9 | Như BL-21 | Bấm "Quay lại" nhiều lần sau khi bấm | Không thấy lại câu PII | PW | K | T08 · Chờ F06 |
| F09-BL-24 | plan §8.2 | Kiosk, hỏi PII | **Trước** khi bấm: quét storage/cookie/`history.state`/URL | Hội thoại chỉ ở bộ nhớ trang; không nơi nào sống sót qua tải trang chứa câu hỏi | PW | K | T08 · Chờ F06 |
| F09-BL-25 | plan §4.2 | Kiosk, ô tìm trợ lý | Đọc thuộc tính | `autocomplete="off"` | PW | K | T08 · Chờ F06 |
| F09-BL-26 | BR-7 (thiết bị thật) | Trình duyệt kiosk thật | Bấm "Bắt đầu lại" sau khi dùng đầy đủ HT-A | Độ chớp, giọng đọc dừng, "Quay lại" (nếu có) không khôi phục; ghi trình duyệt/hệ điều hành | TAY | K | T08 · Chờ thiết bị |

## 7. Lịch sử trình duyệt ở kiosk (BR-8; AC-7, AC-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-LS-01 | AC-7 | Sau BL-01…BL-06 (HT-A + Bắt đầu lại) | `page.goBack()` nhiều lần (10 lần) | Không bao giờ thấy lại tab Cấp tỉnh, từ khoá "khai sinh", lọc "Hộ tịch", popup 1.001193 hay hội thoại trước đó (địa chỉ luôn `/` hoặc thoát khỏi trang, không phải trạng thái cũ) | PW | K | T08 · Chờ F06 |
| F09-LS-02 | AC-11 | Kiosk, N | Trang chủ → Danh mục → Lĩnh vực bằng thanh điều hướng; mở popup; `goBack()` nhiều lần | Không quay lại Danh mục hay Trang chủ trong trang web; popup **không** đóng | PW | K | T08 |
| F09-LS-03 | AC-11 | **Ngoài kiosk** (điện thoại/máy tính), làm lại LS-02 | `goBack()` | Đi về từng trang trước và đóng popup (F03 AC-17) | PW | 375, 1280 | T08 |
| F09-LS-04 | BR-8 | Kiosk | Đo `history.length` sau: bấm `Link`, `NavLink` (3 mục), gõ ô tìm, đổi bộ lọc, đổi tab, đổi trang, mở popup, đóng popup, bấm ô lĩnh vực | Không tăng ở bước nào (mọi điều hướng thay mục hiện tại) | PW | K | T08 |
| F09-LS-05 | BR-8 | `createMemoryRouter` ở kiosk | Bấm `Link`, `NavLink`, `setSearchParams`, `navigate('/x')`; `navigate(-1)` | `historyAction` luôn `REPLACE` cho bốn thao tác đầu; `navigate(-1)` vẫn `POP`; ngoài kiosk vẫn `PUSH` | VT (rà) | — | Sau T02 |
| F09-LS-06 | BR-8 | Kiosk rồi `?kiosk=0` trong phiên | Điều hướng | Hoàn nguyên: lại `PUSH` (cleanup trả `router.navigate` gốc); unmount trả lại gốc | VT | — | Sau T02 |
| F09-LS-07 | plan §10 rủi ro 2 | Kiosk, chặn chunk kiosk 3 giây | Điều hướng trong khoảng đó | Mục lịch sử thêm (hở nhỏ chấp nhận); mục đó không chứa trạng thái người trước (trang vừa tải mới); ghi nhận | PW | K | T08 |
| F09-LS-08 | plan §10 rủi ro 2 | Nâng phiên bản react-router | Chạy `dieuHuongThayLichSu.test.tsx` + LS-04 | Cả hai xanh (phát hiện hỏng lặng lẽ khi nâng phiên bản) | VT + PW | K | Sau T02 |
| F09-LS-09 | BR-8 | Kiosk | Phím Alt+← và Backspace (trình duyệt) | Như "Quay lại": không đi giữa các trang của trang web; không đóng popup | PW | K | T08 |
| F09-LS-10 | BR-8 | Kiosk, mở popup bằng liên kết `?ma=` rồi đóng bằng ✕/Esc/vùng tối | `history.length` | Không tăng cả khi mở và khi đóng | PW | K | T08 |
| F09-LS-11 | BR-6 (vận hành) | Hướng dẫn vận hành | Tìm | Có: ẩn nút "Quay lại" của trình duyệt kiosk (hệ quả BR-8); nêu rõ trên kiosk dùng nút trên trang (✕, Esc, vùng ngoài popup, mục điều hướng) và "Bắt đầu lại" | SH / đọc tài liệu | — | Chờ tài liệu vận hành |
| F09-LS-12 | BR-8 | Kiosk | Chuyển trang `/` → `/thu-tuc` → `/linh-vuc` rồi "Bắt đầu lại" | `history.length` vẫn 1 (hoặc bằng lúc mở); không mục dư | PW | K | T08 |

## 8. Giới hạn câu hỏi dùng chung kiosk (BR-5; AC-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-GH-01 | AC-5 | Cấu hình **mặc định** (không ghi đè `RateLimiting:TroLy`) | Từ một kiosk hỏi 60 câu trong 1 phút; câu 61 | 60 câu đều có trả lời; câu 61 → thông báo "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại."; trang không lỗi | XU (HTTP) + PW | K | T08 · Chờ F06 |
| F09-GH-02 | BR-5 | Mặc định | Ba "người" cùng IP: 20 + 20 + 21 câu, "Bắt đầu lại" giữa các lượt, trong cùng phút | Câu thứ 61 bị chặn: giới hạn tính chung, "Bắt đầu lại" không đặt lại | PW | K | T08 · Chờ F06 |
| F09-GH-03 | BR-5 | Sau GH-01 | Đợi sang phút sau, hỏi | Hỏi được tiếp | PW | K | T08 · Chờ F06 |
| F09-GH-04 | plan §8.6 | Mã nguồn + cấu hình | `grep` `RateLimiting` trong `appsettings*.json` | Không đặt `TroLy` khác 60 | SH | — | Sau T05 |
| F09-GH-05 | BR-5 | Hai kiosk sau cùng một NAT | Ghi nhận | Dùng chung giới hạn (đã chấp nhận — câu hỏi mở 16); ghi vào mục mơ hồ vận hành | SH / đọc tài liệu | — | T08 |
| F09-GH-06 | plan §5 (chi phí tải lại) | Kiosk, mặc định `RateLimiting:DanhMuc` 300/phút | Bấm "Bắt đầu lại" liên tục 100 lần trong 1 phút (script) | Mỗi lần tải lại tốn vài yêu cầu GET; quá 300/phút → một số GET trả 429, trang hiện `ErrorState` nhã nhặn, sau 1 phút dùng lại được (ghi nhận: kiosk thực tế không bấm dồn như vậy) | PW | K | T08 |
| F09-GH-07 | BR-5 | Mặc định | 429 | Có `Retry-After`; ProblemDetails `qua-nhieu-yeu-cau`; không stack trace | XU | — | T08 · Chờ F06 |

## 9. Tài liệu vận hành (BR-6, BR-1, BR-3)

BR-6 không phải chức năng của trang (kế hoạch giai đoạn 8, mục 8.5). Các ca kiểm **tài liệu** và ghi nhận cấu hình máy thật.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-VH-01 | BR-6 | Tài liệu vận hành | Tìm | Có: trình duyệt kiosk chạy ẩn danh, tự xoá phiên khi đóng tab | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-02 | BR-6 | Như trên | Tìm | Có: cán bộ kiểm tra kiosk cuối ngày (bấm "Bắt đầu lại", đăng xuất Cổng DVC nếu còn phiên, đóng tab, mở lại bằng link kiosk) | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-03 | BR-6 | Như trên | Tìm | Có: ẩn nút "Quay lại" của trình duyệt kiosk (hoặc chế độ kiosk không có nút này) | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-04 | BR-6 | Như trên | Tìm | Có: máy kiosk phải có mạng khi bấm "Bắt đầu lại"; mất mạng thì trình duyệt hiện trang lỗi của nó, nội dung người trước không còn trên màn hình | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-05 | BR-6 | Như trên | Tìm | Có: bật đồng bộ giờ tự động (giờ Việt Nam); đồng hồ lệch thì "Đang trong giờ làm việc" sai (F02 BR-9) | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-06 | BR-6 | Kiosk thật | Đặt đồng hồ máy lệch 2 giờ | Trạng thái "Đang trong giờ làm việc" ở trang chủ sai theo đồng hồ máy (đúng thiết kế, kiểm để tài liệu cảnh báo đúng) | TAY | K | Chờ thiết bị |
| F09-VH-07 | BR-6 (F07) | Như trên | Tìm | Có: cài giọng đọc tiếng Việt **cục bộ** trên máy kiosk (giọng mạng không dùng được — F07 BR-1) | SH / đọc | — | Chờ tài liệu vận hành |
| F09-VH-08 | BR-6, câu hỏi mở 10 | Máy kiosk thật | Lập bảng kiểm: trình duyệt, chế độ kiosk, ẩn danh, thanh địa chỉ khoá, nút Quay lại, giọng đọc, đồng bộ giờ, mạng | Ghi kết quả từng mục và tên trình duyệt/hệ điều hành thật; kết luận cho câu hỏi mở 10 | TAY | K | Chờ thiết bị |

## 10. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-TN-01 | C01 AC-4 | Kiosk, `/`, `/thu-tuc`, popup 1.001193, khung trợ lý có dòng nhắc | axe | 0 vi phạm | AX | K | T08 · khung Chờ F06 |
| F09-TN-02 | C01 AC-1 | Kiosk | Chỉ bàn phím | Tới được nút "Bắt đầu lại" (cuối vòng), Enter/Space kích hoạt; thứ tự logic; viền focus nhìn thấy | PW | K | T08 |
| F09-TN-03 | WCAG 4.1.2 | Kiosk | Đọc cây trợ năng | Nút có tên "Bắt đầu lại"; icon `aria-hidden`; dòng nhắc là văn bản thường | PW | K | T08 |
| F09-TN-04 | WCAG 1.4.3 | Kiosk | Đo tương phản nút và dòng nhắc | Chữ nút ≥ 4.5:1; chữ phụ dòng nhắc ≥ 4.5:1; viền focus ≥ 3:1 | AX + PW | K | T08 |
| F09-TN-05 | WCAG 2.5.8 | Kiosk | Đo vùng bấm | Nút ≥ 48×48 px | PW | K | T08 |
| F09-TN-06 | WCAG 1.4.4 | Kiosk, phóng 200% | Xem | Không cuộn ngang; nút không che nội dung | PW | K | T08 |
| F09-TN-07 | WCAG 1.4.12 | CSS giãn chữ | Xem dòng nhắc, nút | Không cắt, không chồng | PW | K | T08 |
| F09-TN-08 | plan §4.4 | NVDA/TalkBack | Đi qua trang chủ kiosk | Đọc dòng nhắc theo thứ tự trang (trước danh sách); không đọc hai lần; không thông báo `aria-live` ngoài ý muốn | TAY | K | T08 |
| F09-TN-09 | WCAG 2.4.3 | Kiosk | Sau "Bắt đầu lại" tải trang | Tiêu đề trang và con trỏ ở đầu trang (trình đọc màn hình đọc lại trang chủ); ghi nhận | PW + TAY | K | T08 |
| F09-TN-10 | C01 AC-3 | Đen trắng | Xem nút, dòng nhắc | Phân biệt được (icon + chữ, không chỉ màu) | PW | K | T08 |
| F09-TN-11 | i18n | Mã nguồn | `npm run lint`; tìm chữ "Bắt đầu lại", "Nhớ đăng xuất" ngoài `kiosk/i18n/vi.json` | Chỉ qua `t('kiosk:…')`; khoá có kiểu (sai khoá là lỗi build) | SH | — | Sau T01 |

## 11. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-BM-01 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` `/?kiosk=1`, `/thu-tuc?kiosk=1`, `/linh-vuc?kiosk=1` và một chunk `.js` | CSP đúng nguyên văn CLAUDE.md, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By`; `index.html` `no-cache` + ETag, `.js` có hash `immutable` | CURL | — | T08 |
| F09-BM-02 | plan §6 (open redirect) | Mã nguồn + PW | `grep` `location.replace`, `assign`, `href =`; BL-15 | Đích của "Bắt đầu lại" là hằng `/?kiosk=1`; không lấy từ địa chỉ, ô nhập hay dữ liệu | SH + PW | K | Sau T02 / T08 |
| F09-BM-03 | plan §6 | `?kiosk=1` | So chức năng với thường | Không mở thêm dữ liệu, API hay chức năng; không cần xác thực (KB-09) | PW | K | T08 |
| F09-BM-04 | plan §6 | HT-A | `securitypolicyviolation`, `console` | 0 vi phạm CSP; 0 `console.error`; không `style` nội tuyến (`document.body.hidden` dùng thuộc tính HTML) | PW | K | T08 |
| F09-BM-05 | CLAUDE.md > Tài nguyên tự host | Luồng đầy đủ (không bấm liên kết Cổng DVC) | `page.on('request')` | Mọi request cùng gốc; không tên miền ngoài | PW | K | T08 |
| F09-BM-06 | plan §6 | Mọi `a[target=_blank]` ở kiosk | Đọc `rel` | `noopener noreferrer`; liên kết Cổng DVC qua `ExternalLink` | PW | K | T08 |
| F09-BM-07 | plan §6 (nhận diện) | OG | Xem NM-03 | Không lọt `dichvucong.gov.vn.evil.com` (và không bỏ sót dòng nhắc vì lỗi so khớp) | VT + PW | K | Sau T01 / T08 |
| F09-BM-08 | plan §6 | Dòng nhắc, nút | `grep -rn "dangerouslySetInnerHTML\|innerHTML" src/FrontEnd/src/core/kiosk`; `npm run lint` | 0 kết quả; lint sạch (kể cả quy tắc chữ viết cứng) | SH | — | Sau T01, T02 |
| F09-BM-09 | plan §6, AC-9 | Kiosk, hỏi PII (chờ F06) | Quét nơi lưu trữ và log API | Không dữ liệu cá nhân trong storage/cookie/`history.state`/URL; log API không chứa số (F00 AC-22) | PW + SH | K | T08 · Chờ F06 |
| F09-BM-10 | KB-05 | `?kiosk=<script>alert(1)</script>` | Mở | Không hiển thị, không chạy; 0 hộp thoại | PW | K | T08 |
| F09-BM-11 | CLAUDE.md > Header (clickjacking) | Trang `/?kiosk=1` nhúng trong `<iframe>` của trang khác | Mở | Bị chặn (`frame-ancestors 'none'`) | PW | K | T08 |
| F09-BM-12 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `.pdb`; tên `batDauLai`, `laLienKetCongDvc`, `useDieuHuongThayLichSu` trong chunk kiosk; chạy `document.body.hidden`, `speechSynthesis.cancel` trên bản đã obfuscate | Không `.map`, không `.pdb`; định danh dự án đổi tên; **chức năng vẫn chạy** sau obfuscate | SH + PW | K | T08 |
| F09-BM-13 | CLAUDE.md > Thư viện | Cuối F09 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json`, `Directory.Packages.props` | Không High/Critical; F09 không thêm gói | SH | — | T08 |
| F09-BM-14 | plan §6 | Kiosk | Quét cookie | Không cookie nào do F09 đặt | PW | K | T08 |
| F09-BM-15 | CLAUDE.md > Dữ liệu | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | T08 |
| F09-BM-16 | plan §6 (kiosk loa chung) | Kiosk, người trước bật đọc và hỏi PII | Người sau mở khung | Không đọc lại hội thoại cũ; không tự đọc khi mở lại (F07 AC-8) | PW | K | T08 · Chờ F06, F07 |

## 12. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-HN-01 | plan §5 | Bản build, chế độ thường | Mở `/` và `/thu-tuc` ở 375 và 1280; ghi mạng | **Không** yêu cầu tới chunk kiosk; keo trong bundle chính ≤ 1 KB gzip (so trước/sau T01–T04) | PW + SH | 375, 1280 | T08 |
| F09-HN-02 | plan §5 | Kiosk | Mở `/` | Đúng **một** chunk kiosk (chứa cả `NutBatDauLai` và `NhacDangXuatNoiDung`), ≤ 5 KB gzip (ước 3–4); câu chữ gộp trong chunk; ghi số yêu cầu thêm | PW + SH | K | T08 |
| F09-HN-03 | F00 BR-9 | Bản build | Tổng JS tải ban đầu ở `/` 375 và 1280 (thường) và 1080×1920 (kiosk) | ≤ **200 KB gzip**; F09 thêm ≤ 1 KB ở chế độ thường; chunk kiosk không nằm trong `modulepreload`/`<script>` của `index.html` | SH + PW | 375, 1280, K | T08 |
| F09-HN-04 | plan §5 (CLS) | Kiosk | Đo CLS ở `/` và `/thu-tuc` | ≤ **0,05** | PW | K | T08 |
| F09-HN-05 | F00 BR-9 | Bản `dotnet publish -c Release` | Lighthouse mobile `/` ×3 (không kiosk) | Performance ≥ **85**; CLS < 0,1 | LH | 375 | T08 |
| F09-HN-06 | AC-10 | Kiosk | Đo "Bắt đầu lại" → trang chủ đầy đủ | ≤ 1,5 giây (BL-08) | PW | K | T08 |
| F09-HN-07 | plan §5 | Kiosk | Tải lại lần hai | Chunk kiosk lấy từ bộ nhớ đệm (tên có hash, `immutable`) | PW | K | T08 |
| F09-HN-08 | plan §5 | Kiosk | Đếm `setInterval`/`setTimeout` do F09 thêm | Không có (KT-04) | PW | K | T08 |
| F09-HN-09 | plan §4.3 | Kiosk | Đo thời gian điều hướng 3 mục có và không `useDieuHuongThayLichSu` | Không chậm đáng kể (< 16 ms chênh lệch); ghi số | PW | K | T08 |
| F09-HN-10 | plan §5 | Kiosk, 200 lần "Bắt đầu lại" (script, giãn cách để không vượt giới hạn) | Đo heap tab | Không tăng liên tục (mỗi lần tải trang mới, không rò) | PW / TAY | K | T08 |

## 13. Nguồn dữ liệu và nhập lại (F00 §9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F09-HD-01 | AC-3 | Nguồn Mẫu và PostgreSQL, cùng dữ liệu O6 | Chạy NH-01 | Cùng kết quả (2 dòng ở trang chủ) | PW | K | T08 |
| F09-HD-02 | AC-3 | PostgreSQL; nhập file ô dịch vụ chỉ còn O1 | Tải lại trang chủ kiosk | Không dòng phía trên ô (NH-27); nhập lại O6 → có lại | PW + XU | K | T08 · Chờ F01 |
| F09-HD-03 | F00 BR-16 | Chế độ demo | Mở kiosk | Dòng nhắc và nút hoạt động như thường; dòng "Dữ liệu thủ tục cập nhật ngày …" vẫn hiện (F08 BR-6) | PW | K | T08 |

## 14. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F09-KB-01…KB-12 |
| BR-2 | F09-KT-01…KT-07, HN-08 |
| BR-3 | F09-KT-08, KT-09, BL-21…BL-24 |
| BR-4 | F09-NH-01…NH-31, NM-01…NM-09 |
| BR-5 | F09-GH-01…GH-07 |
| BR-6 | F09-VH-01…VH-08, KB-12, LS-11, BL-17 |
| BR-7 | F09-NV-01…NV-17, BL-01…BL-26 |
| BR-8 | F09-LS-01…LS-12 |
| AC-1 | F09-KB-01, KB-02 |
| AC-2 | F09-KT-01 |
| AC-3 | F09-NH-01…NH-18, NH-27 |
| AC-4 | F09-NH-19, NH-20, KB-08 |
| AC-5 | F09-GH-01 |
| AC-6 | F09-BL-01…BL-06 |
| AC-7 | F09-LS-01 |
| AC-8 | F09-NV-01…NV-03 |
| AC-9 | F09-BL-21…BL-24 |
| AC-10 | F09-BL-07, BL-08, BL-06 |
| AC-11 | F09-LS-02, LS-03 |
| AC-12 | F09-NH-21…NH-24, NM-01…NM-04 |
| Bảo mật (CLAUDE.md) | F09-BM-01…BM-16 |
| Trợ năng | F09-TN-01…TN-11 |
| Hiệu năng (F00 BR-9) | F09-HN-01…HN-10 |
| Nguồn dữ liệu | F09-HD-01…HD-03 |

## 15. Tóm tắt

- **Số ca**: KB 12 · KT 9 · NH 31 · NM 9 · NV 17 · BL 26 · LS 12 · GH 7 · VH 8 · TN 11 · BM 16 · HN 10 · HD 3 = **171 ca**. Mỗi BR (1…8) và mỗi AC (1…12) có ít nhất một ca.
- **Chạy ngay (không chờ F06/F07)**: KB, KT-02…KT-07, NH-01…NH-11, NH-17…NH-23, NM, NV (trừ khung), BL-02…BL-20 (trừ phần trợ lý/đọc), LS, GH-04, TN, BM, HN, sau T01–T04.
- **Chờ chức năng khác**: F06 (khung trợ lý + BE: KT-01, KT-08, NH-12…NH-16, NH-24, NV-07, NV-09, NV-13, BL-01, BL-04, BL-21…BL-24, GH-01…GH-03, LS-01); F07 (BL-01, BL-06, KT-05, BM-16); F01 (nhập lại ô dịch vụ: NH-27, HD-02); tài liệu vận hành giai đoạn 8 (KB-12, KT-09, LS-11, VH-01…VH-07); trình duyệt/thiết bị kiosk thật (câu hỏi mở 10: BL-18, BL-26, NV-15, VH-06, VH-08).
- **AC khó kiểm tự động**: AC-2 (15 phút giả bằng `page.clock` — chứng minh không có timer của trang, không chứng minh trình duyệt kiosk thật không tự làm gì); AC-6 và AC-9 (cần cả trợ lý F06 lẫn đọc F07 chạy thật; tiếng đọc dừng chỉ giả bằng đếm `cancel`); AC-7 và AC-11 (hành vi "Quay lại" khác nhau giữa trình duyệt; kiểm trên Chromium bằng `goBack`, thiết bị kiosk thật cần thử tay); AC-10 "≤ 1,5 giây trên mạng của Trung tâm" (chưa biết băng thông — ghi số theo hai cấu hình giả lập); chớp trắng 0,3–1,5 giây (cảm nhận trên máy thật).
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): (1) AC-12 nói "thủ tục có liên kết tới tên miền con của Cổng DVC" nhưng dữ liệu thủ tục không có trường liên kết riêng (liên kết "Xem và nộp" luôn là `dichvucong.gov.vn` qua `linkDvc`) — ca dùng ô dịch vụ và liên kết Cổng DVC Quốc gia trong câu trả lời (NH-23); (2) "mạng của Trung tâm" ở AC-10 chưa có băng thông cụ thể (BL-08); (3) AC-10 "địa chỉ là `/?kiosk=1` rồi chuyển thành `/`" — cách quan sát (BL-07); (4) tên máy có dấu chấm cuối (`dichvucong.gov.vn.`) và chữ hoa có tính là Cổng DVC không (NM-05); (5) dòng nhắc trong khung trợ lý còn hay mất khi tin chứa liên kết rơi khỏi 60 tin gần nhất (NH-16); (6) AC-7 "Quay lại nhiều lần" khi lịch sử chỉ còn một mục — thoát ra trang ngoài trang web (LS-01); (7) kiosk khổ nhỏ (375) và nút "Bắt đầu lại" so với nút "Trợ lý" (KB-11, NV-16); (8) hở nhỏ khi chunk kiosk chưa về: điều hướng thêm mục lịch sử, nút chưa hiện (LS-07, NV-17); (9) chi phí tải lại làm tiêu hao giới hạn `danh-muc` 300/phút nếu bấm dồn (GH-06); (10) F09 AC-9 "nơi lưu" cho phép khoá `doc-bat` và `cach-xem` — cần nêu trong test để không báo nhầm (BL-14, F07-KS-02).

## Cập nhật sau lượt chạy T08 (2026-10-13)

- Kết quả ở `result/test.md`. F06 và F07 đã xong nên các ca "chờ F06/F07" (AC-2, AC-5, AC-6, AC-9) đã chạy. **NH-29/HN-04** CLS kiosk 1080×1920: `/` 0,046 đạt, `/thu-tuc` 0,176 và `/linh-vuc` 0,180 trượt (lỗi K1). **KT-01** chập chờn do lỗi R1 (F06). **VH-01…VH-08** chờ tài liệu vận hành.

## Cập nhật lượt xác nhận (2026-10-14)

- Ca **F09-NM-10** (mới, e2e trong NH-21…26): `https://DICHVUCONG.GOV.VN./x` (viết hoa, dấu chấm cuối) → 1 dòng nhắc; `https://dichvucong.gov.vn..evil.com`, `https://dichvucong.gov.vn.evil.com.` → 0 dòng.
- **KB-11** nay là khẳng định (không còn "ghi hành vi") và **trượt** ở bản này: kiosk ≤ 414 px thẻ thủ tục tràn ngang (lỗi K5). **KT-01** chạy lặp 8 lần để loại chập chờn do R1 (F06-PU-R1/R1b).
