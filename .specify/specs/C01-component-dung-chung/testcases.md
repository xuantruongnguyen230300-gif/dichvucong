---
id: C01
ten: Thành phần giao diện dùng chung — test case
spec: spec.md (da-duyet 2026-10-12) · plan.md (cập nhật 2026-10-12)
nguoi_viet: tester
cap_nhat: 2026-10-12
trang_thai_chay: đã chạy 2026-10-12 (T14) — xem result/test.md
---

# C01 · Thành phần giao diện dùng chung — test case

## 0. Cách đọc

**Cột "Cách kiểm · khi chạy"**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, file `src/FrontEnd/e2e/thanh-phan.spec.ts` (T14) |
| AX | `@axe-core/playwright`, thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` |
| VT | Vitest do ui-core-dev viết ở T02–T10; tester chỉ rà xem đã có và xanh, không viết lại |
| TAY | Thử tay (trình đọc màn hình, bộ gõ, đen trắng, bảng hiệu ứng) |
| SH | Lệnh shell (`grep`, `curl`, đo kích thước) |
| **XT** | Chạy ngay được trên trang xem trước `/dev/design-system` (chạy bằng `npm run dev`) |
| **Chờ Fxx** | Chỉ chạy được khi chức năng Fxx có (plan §8). Trước đó ghi "chưa chạy được", không tính là lỗi |

**Cột "Khổ"**: 375 (điện thoại, 375×812), 768, 1280, **K** = kiosk 1080×1920 có bật chế độ kiosk. "Mọi khổ" = cả bốn.

**Chế độ kiosk trên trang xem trước**: dùng nút bật/tắt kiosk của trang (plan §4.11), hoặc mở `/dev/design-system?kiosk=1` (xem C01-KS-03).

**Dữ liệu thử**: dữ liệu mẫu có sẵn của trang xem trước (`duLieuMau.ts`, khoảng 40 mục, 12 mục mỗi trang, có "Thủy" và "Thuỷ", có U+200E trong "đăng ký"). Tên giả: "Trung tâm thử A", "phường thử B". Không dùng tên cán bộ thật. Ký tự vô hình trong test tạo bằng `String.fromCodePoint(0x200e)`, không dán ký tự thật. Kết quả mong đợi của các ca tìm kiếm tính từ chính `duLieuMau.ts` bằng hàm chuẩn hoá độc lập của test, không đọc kết quả từ giao diện.

**Phụ thuộc F01**: C01 không đọc DB. Mọi ca "Chờ F02/F03/F04/F05" cần dữ liệu thủ tục nhập bằng `dotnet run --project src/BackEnd/DichVuCong.Import -- nhap ...` (db-dev đang làm); ghi rõ ở từng ca.

**Cần hỏi 2 (plan §9) — tiêu chí câu đọc "đã chọn"**: chip, nút chuyển dạng dùng `aria-pressed` (đề xuất a). Ca đạt khi trình đọc màn hình đọc câu mang nghĩa đang chọn/đang bật ("đã nhấn", "pressed", "đã chọn" đều chấp nhận) và nút khác trong nhóm đọc ngược lại ("chưa nhấn"/"not pressed"). Máy kiểm tự động: `aria-pressed="true"` ở đúng một nút trong nhóm. Nếu người dùng chọn phương án b hoặc c, sửa mục này và các ca C01-CH-01, C01-VG-01, C01-PT-xx trước khi chạy.

**Cần hỏi 4 — câu 4 gợi ý**: các ca EmptyState kiểm theo `common.json`, so từng gợi ý với khoá `rong.goi-y.*`, không so với chuỗi gõ cứng trong test.

## 1. Bàn phím và focus (BR-1, AC-1)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-BP-01 | AC-1, BR-1 | Mở `/dev/design-system`, chế độ thường | 1. Nhấn Tab liên tục từ đầu trang tới hết.<br>2. Ghi thứ tự phần tử nhận focus.<br>3. Shift+Tab đi ngược toàn bộ. | Thứ tự Tab trùng thứ tự đọc trên màn hình (trên xuống dưới, trái sang phải). Shift+Tab đúng ngược lại. Nút, liên kết, ô tìm, chip, nút chuyển dạng, số trang, ô dịch vụ có link, nút nổi đều nhận focus. Không phần tử nào bị nhảy cóc | PW · XT | 1280 |
| C01-BP-02 | AC-1, BR-1 | Như trên | Tab tới từng loại: nút (thường), nút bật/tắt, liên kết ngoài, chip, số trang. Enter. Với `<button>` thử thêm phím cách | Enter kích hoạt mọi nút và liên kết. Phím cách kích hoạt nút, chip, nút bật/tắt, số trang. Phím cách không kích hoạt liên kết (đúng chuẩn trình duyệt) | PW · XT | 1280 |
| C01-BP-03 | BR-1 | Như trên | Tab qua mọi phần tử bấm được; ở mỗi phần tử đọc `getComputedStyle` của `:focus-visible` | Viền (outline) rộng ≥ 2 px (thiết kế 3 px, offset 2 px) và màu khác nền kề, nhìn thấy. Không phần tử nào `outline: none` mà không có thay thế | PW · XT | 1280, K |
| C01-BP-04 | BR-1, AC-1 | Khối `data-nen-dam` (nền xanh đậm) trên trang xem trước | Tab vào nút/liên kết trong khối | Viền focus màu trắng (`--color-focus-on-dark`), tương phản ≥ 3:1 với nền xanh đậm | PW + chụp ảnh đối chiếu · XT | 1280 |
| C01-BP-05 | BR-1 | Trang xem trước có nút vô hiệu và nhãn (Badge) | Tab qua khu vực có nút `disabled`, `Badge`, `Tile` không link | Tab bỏ qua nút `disabled`, nhãn, ô không link. Nút đang xử lý (`aria-disabled`) thì vẫn nhận focus (plan §4.5) | PW · XT | 1280 |
| C01-BP-06 | AC-1 | Dữ liệu thủ tục đã nhập; chờ F02, F04, F05, F08 | Chỉ dùng bàn phím ở trang chủ, danh mục, lĩnh vực: tới mọi nút, liên kết, ô tìm, chip, chuyển dạng, phân trang, ô dịch vụ, nút Trợ lý | Tới được tất cả theo thứ tự đọc; Enter kích hoạt được; focus luôn nhìn thấy | PW + TAY · **Chờ F02, F04, F05, F08** | 1280, 375 |
| C01-BP-07 | AC-1, BR-1 | Chờ F08 (chân trang nền xanh đậm) | Tab qua mọi liên kết trong chân trang | Mỗi liên kết có viền focus trắng nhìn thấy | PW + chụp ảnh · **Chờ F08** | 1280 |
| C01-BP-08 | BR-1 | Vùng bảng dạng `bang` (plan §4.8: vùng cuộn có `tabIndex=0`) | Tab tới vùng bảng; nhấn mũi tên xuống/phải | Vùng bảng nhận focus có viền; mũi tên cuộn nội dung trong vùng; Tab tiếp đi tới phần tử kế, không kẹt (WCAG 2.1.2) | PW · XT | 1280 |
| C01-BP-09 | BR-1, AC-1 | Hàng chip dài, thiết bị có chuột | Tab qua từng chip tới chip cuối khuất | Trình duyệt tự cuộn chip vào tầm nhìn; nút cuộn trái/phải KHÔNG nằm trong vòng Tab (`tabIndex=-1`, `aria-hidden`) | PW · XT | 1280 |

## 2. Kích thước, kiosk, cuộn ngang (BR-1, AC-2)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-KS-01 | AC-2, BR-1 | `/dev/design-system`, chế độ thường | Đo `getBoundingClientRect` của nút, ô tìm, chip, số trang, nút chuyển dạng | Nút, ô tìm, số trang cao ≥ 34 px (`--control-height` 2.125rem); chip ≥ 28 px. Mọi vùng bấm ≥ 24×24 px | PW · XT | 375 |
| C01-KS-02 | AC-2, BR-1 | Như trên, bật kiosk | Bật kiosk, đo lại như C01-KS-01 | `<html>` có class `kiosk`; cỡ chữ gốc ≈ 118,75% (13 px thành khoảng 15,5 px); nút, ô tìm, chip, số trang cao ≥ 40 px (2.5rem ≈ 48 px thực); chip cao bằng nút. Không phần tử nào cao hơn trước mà chữ bị cắt | PW · XT | K |
| C01-KS-03 | AC-2 | Trình duyệt mới (chưa có `sessionStorage`) | 1. Mở `/dev/design-system?kiosk=1&q=a`.<br>2. Đọc địa chỉ và `<html>`.<br>3. Tải lại trang.<br>4. Mở `?kiosk=0`.<br>5. Đóng tab, mở tab mới. | Bước 1-2: có class `kiosk`; địa chỉ còn `?q=a` (đã xoá `kiosk`). Bước 3: vẫn là kiosk. Bước 4: tắt. Bước 5: không còn kiosk (`sessionStorage` mất theo tab) | PW · XT | K |
| C01-KS-04 | AC-2 | Chặn `sessionStorage` (ghi đè `Storage.prototype.setItem` ném lỗi bằng `addInitScript`) | Mở `?kiosk=1` | Trang không lỗi; lần tải này vẫn là kiosk | PW · XT | K |
| C01-KS-05 | AC-2, BR-1 | Kiosk bật, mọi khối của trang xem trước | Với mọi phần tử chứa chữ: so `scrollWidth` với `clientWidth` và `scrollHeight` với `clientHeight` | Không phần tử chứa chữ nào bị cắt (`scrollWidth ≤ clientWidth` khi `overflow: hidden` / `text-overflow`, trừ nhãn `rutGon` chủ ý có "…" và có đủ câu ở chỗ khác). Nút không xuống dòng | PW · XT | K |
| C01-KS-06 | BR-1, AC-2 | Mọi khối của trang xem trước | `document.documentElement.scrollWidth` so với `clientWidth` | Bằng nhau: cả trang không cuộn ngang | PW · XT | Mọi khổ |
| C01-KS-07 | BR-1 (WCAG 1.4.10) | Cửa sổ 320×568 | Mở trang xem trước, rà cuộn ngang | Không cuộn ngang trang; chỉ vùng bảng được cuộn ngang | PW · XT | 320 |
| C01-KS-08 | BR-1 (WCAG 1.4.12) | Trang xem trước | Chèn CSS giãn chữ (`line-height: 1.5`, `letter-spacing: .12em`, `word-spacing: .16em`, khoảng cách đoạn `2em`) bằng `addStyleTag`; chụp | Không chữ nào bị cắt hoặc chồng; nút/thẻ giãn theo (chỉ `min-height`, không chiều cao cố định) | PW + TAY nhìn ảnh · XT | 375, K |
| C01-KS-09 | BR-1 | Trang xem trước, phóng 200% (`deviceScaleFactor` 2 hoặc zoom trình duyệt) | Rà phân trang 20 trang và hàng nút | Phân trang xuống dòng (`flex-wrap`) thay vì tràn; không cuộn ngang | PW · XT | 375 |

## 3. Đen trắng, tương phản, axe (BR-1, AC-3, AC-4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-DT-01 | AC-3, BR-1 | Trang xem trước có chip đang chọn, trang hiện tại, dạng xem đang chọn, nhãn Toàn trình/Một phần | Bật chế độ đen trắng (Chrome DevTools > Rendering > Emulate vision deficiency: achromatopsia, hoặc `filter: grayscale(1)` lên `<html>`). Nhìn từng nhóm | Phân biệt được không cần màu: chip chọn có dấu ✓ và nền đậm; trang hiện tại có gạch chân + đậm; dạng xem chọn có dấu ✓ thay icon thường; Toàn trình/Một phần phân biệt bằng chữ; nút bật có viền dưới 2 px; nút vô hiệu có viền nét đứt | TAY (chụp ảnh lưu kèm test.md) · XT | 1280, 375 |
| C01-DT-02 | AC-3 | Như trên | Tự động: chip đang chọn chứa icon Check (`svg` trong nút `aria-pressed=true`); `Pager` trang hiện tại có `aria-current=page` và `text-decoration` có `underline`; nút vô hiệu có `border-style: dashed` | Đủ ba dấu hiệu không dựa vào màu | PW · XT | 1280 |
| C01-DT-03 | AC-4 | Trang xem trước chế độ thường | Chạy axe (4 thẻ WCAG) trên toàn trang | 0 vi phạm về `color-contrast`, `button-name`, `link-name`, `label`, `aria-*`, `scrollable-region-focusable`, `image-alt` | AX · XT | 375 |
| C01-DT-04 | AC-4 | Như trên | Như C01-DT-03 | Như trên | AX · XT | 1280 |
| C01-DT-05 | AC-4 | Bật kiosk | Như C01-DT-03 | Như trên | AX · XT | K |
| C01-DT-06 | AC-4 | Bật kiosk, khổ 375 (kiểm cả kiosk trên màn hẹp, không có trong spec nhưng plan §8 chạy cả hai chế độ ở hai khổ) | Như C01-DT-03 | Như trên | AX · XT | 375 (kiosk) |
| C01-DT-07 | BR-1 | Bảng màu token của trang xem trước | Đo độ tương phản mọi cặp chữ/nền được dùng: `text/surface`, `text-muted/surface`, `on-primary/primary`, `on-primary/primary-strong`, `danger/danger-soft`, `warning/warning-soft`, `success/success-soft`, chữ trắng/6 màu `tile-*` | Chữ thường ≥ 4,5:1; chữ lớn và biểu tượng, viền điều khiển ≥ 3:1; icon trắng trên màu ô dịch vụ ≥ 5:1 (plan §4.1) | PW (tính từ computed style) + AX · XT | 1280 |
| C01-DT-08 | BR-1 | Xem trước | Hover từng nút, chip, dòng bảng | Đổi màu ngay (không transition màu); sau hover vẫn đủ tương phản | PW · XT | 1280 |

## 4. Nút (BR-2, AC-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-NU-01 | AC-5, BR-2 | Nút "đang xử lý" của trang xem trước (xử lý giả 2 giây) | Bấm hai lần thật nhanh (`dblclick` hoặc 2 `click` cách ≤ 50 ms) | Bộ đếm hành động tăng đúng 1; trong lúc chờ nút có `aria-busy=true`, `aria-disabled=true`; kích thước nút không đổi so với trước (so `boundingBox`); có chữ ẩn "Đang xử lý"; xong 2 giây trở lại bình thường | PW · XT | 1280 |
| C01-NU-02 | AC-5 | Như trên | Khi đang xử lý, Tab vào nút; nhấn Enter, phím cách | Nút nhận focus; Enter/phím cách không gọi thêm | PW · XT | 1280 |
| C01-NU-03 | AC-5 | Trợ lý có ô nhập và nút "Gửi"; chờ F06 | Gõ "dang ky khai sinh"; bấm "Gửi" hai lần nhanh | Chỉ một câu hỏi được gửi (đếm request `POST` tới API trợ lý = 1) | PW · **Chờ F06** | 1280, 375 |
| C01-NU-04 | AC-5, BR-2 | Pager đứng riêng 20 trang, trang 1 | Bấm nút "Trước"; đọc thuộc tính; Tab | Nút Trước `disabled`: không đổi trang; `getByRole('button', {name:'Trang trước'})` có `toBeDisabled()`; Tab bỏ qua; hình thức có viền nét đứt và mờ | PW · XT | 1280 |
| C01-NU-05 | AC-5 | Pager trang 20 | Bấm nút "Sau" | Như C01-NU-04 cho nút Sau | PW · XT | 1280 |
| C01-NU-06 | AC-5, BR-2 | Nút bật/tắt của trang xem trước | 1. Đọc `aria-pressed`.<br>2. Bấm.<br>3. Đọc lại và chụp.<br>4. Bấm lại. | `false` rồi `true` rồi `false`. Khi bật: nền đặc, chữ trắng, viền dưới 2 px; khi tắt trông khác bật | PW · XT | 1280 |
| C01-NU-07 | AC-5 | Nút bật/tắt + NVDA (Chrome) | Tab tới nút, nghe; bấm; nghe | Đọc tên nút kèm "nút bật tắt, đã nhấn/chưa nhấn" (nghĩa đang bật/tắt) | TAY · XT | 1280 |
| C01-NU-08 | AC-5 | Nút "đọc câu trả lời" của F07 | Bấm, nghe | Như C01-NU-06/07 | PW + TAY · **Chờ F07** | 1280, 375 |
| C01-NU-09 | BR-2 | Trang xem trước, nút chữ dài (chuỗi 60 ký tự) | Xem nút ở 375 | Chữ trên nút không xuống dòng (`white-space: nowrap`); nút không làm trang cuộn ngang (nếu phải thì nút tự co/cắt theo thiết kế, không tràn trang) | PW · XT | 375 |
| C01-NU-10 | BR-2 | Nút có `bieuTuong` và IconButton | Đọc cây trợ năng | IconButton có tên từ `nhan`; icon `aria-hidden=true`; nút "chính/phụ/nền trong/liên kết" có tên là chữ hiện ra (WCAG 2.5.3) | AX + PW (`getByRole`) · XT | Mọi khổ |
| C01-NU-11 | BR-2 | Trang xem trước | Tìm nút có kiểu "nhấn" (accent) dạng `<button>` | Không có. Kiểu nhấn chỉ xuất hiện trên liên kết "Xem và nộp trên Cổng DVC" (`ExternalLink nut-accent`) | PW · XT; thật **Chờ F03** | 1280 |

## 5. Liên kết ra trang ngoài (BR-3, AC-6)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-LK-01 | AC-6, BR-3 | Liên kết web mẫu `https://example.com/` trên trang xem trước | 1. Đọc thuộc tính.<br>2. Bấm, bắt trang mới (`context.waitForEvent('page')`).<br>3. Ở trang mới chạy `window.opener` và `document.referrer`. | `target="_blank"`, `rel` có `noopener` và `noreferrer`; có icon "mở trang mới" `aria-hidden`; tên đọc kết thúc bằng "(mở trang mới)". Trang mới: `window.opener === null`, `document.referrer === ''` | PW · XT (chặn mạng ngoài, trả trang rỗng bằng `route.fulfill`) | 1280 |
| C01-LK-02 | AC-6, BR-3 | Liên kết `tel:` và `mailto:` mẫu | Đọc thuộc tính, bấm (chặn điều hướng) | `href` dạng `tel:...` và `mailto:...`; không `target`; không icon "mở trang mới"; không chữ ẩn "(mở trang mới)" | PW · XT | 1280 |
| C01-LK-03 | AC-6, BR-3 | Liên kết `javascript:alert(1)` trên trang xem trước | Đăng ký `page.on('dialog')`. Tìm `<a>`. Bấm vào chữ. Tab qua khu vực | Không có `<a>` nào có `href` bắt đầu bằng `javascript:`; hiện như chữ thường (`<span>`, không `role`); bấm không phát sinh hộp thoại, không đổi địa chỉ; Tab bỏ qua | PW · XT | 1280 |
| C01-LK-04 | AC-6, BR-3 | Ô dịch vụ có `href = javascript:alert(1)` | Như C01-LK-03 | Hiện như ô chưa có link (không phải liên kết); bấm không có gì; không hộp thoại | PW · XT | 1280 |
| C01-LK-05 | AC-6, BR-3 (biên) | Danh sách giá trị link độc hại bơm vào component qua trang xem trước hoặc test đơn vị: `JaVaScRiPt:alert(1)`, ` javascript:alert(1)` (khoảng trắng đầu), `java` + ký tự tab + `script:alert(1)`, `data:text/html,<b>x</b>`, `vbscript:x`, `//evil.example`, `/thu-tuc`, `https://`, chuỗi rỗng, `null`, `undefined`, `http://user:pass@host`, chuỗi 5.000 ký tự | Cho từng giá trị vào `ExternalLink` và `Tile` | Giá trị web hợp lệ (`https://`, `http://` có host) thành `<a>`; mọi giá trị còn lại thành chữ thường / ô không link. Không giá trị nào làm trang lỗi | VT (T02, T06) — tester rà bảng giá trị đủ chưa; PW cho giá trị chọn lọc · XT | 1280 |
| C01-LK-06 | AC-6 | Liên kết "Xem và nộp trên Cổng DVC" thật; dữ liệu thủ tục đã nhập (F01) | Mở popup thủ tục; bấm liên kết; kiểm trang mới như C01-LK-01 | Tab mới, `window.opener === null`, không có Referer, tên đọc có "(mở trang mới)" | PW · **Chờ F03** | 1280 |
| C01-LK-07 | BR-3 | Kiosk | Rà liên kết tới Cổng DVC ở trang thật | Mỗi nơi có liên kết có đúng 1 dòng nhắc đăng xuất, không lặp trên từng liên kết (việc của F09 BR-4; C01 chỉ kiểm không lặp trong `ExternalLink`) | PW · **Chờ F09** | K |
| C01-LK-08 | BR-3 | Mọi mã nguồn FE | `grep -rn 'target="_blank"\|target: .\_blank' src` ngoài `ExternalLink` | Không có `target="_blank"` nào ở ngoài `ExternalLink` (hoặc có thì kèm `rel="noopener noreferrer"`) | SH | — |

## 6. Ô tìm kiếm (BR-4, AC-7, AC-8, AC-9)

Dữ liệu: danh sách mẫu 40 mục của trang xem trước. Tập kết quả mong đợi tính độc lập từ `duLieuMau.ts`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-TK-01 | AC-7, BR-4 | Mục mẫu có "Đăng ký khai sinh" | Gõ lần lượt: `dang ky khai sinh`; `ĐĂNG KÝ KHAI SINH`; `  khai   sinh  đăng ký ` | Cả ba cho đúng cùng một tập kết quả (cùng số lượng, cùng thứ tự) | PW · XT | 1280 |
| C01-TK-02 | AC-8, BR-4 | Mục mẫu có "Thủy" và "Thuỷ" | Gõ `thuy` | Ra cả mục "Thủy" và mục "Thuỷ" | PW · XT | 1280 |
| C01-TK-03 | AC-8 | Chuỗi tạo bằng `'đăng ký'.normalize('NFD')` | Điền vào ô (dấu tách rời) | Cùng kết quả như `'đăng ký'.normalize('NFC')` | PW · XT | 1280 |
| C01-TK-04 | AC-8 | Chuỗi `"kh" + String.fromCodePoint(0x200b) + "ai sinh"`; chuỗi `String.fromCodePoint(0x200b) + "khai sinh"` | Điền từng chuỗi | Cả hai cho kết quả như gõ `khai sinh` | PW · XT | 1280 |
| C01-TK-05 | AC-8 | Mục mẫu "đăng ký" có U+200E giữa "k" và "ý" | Điền `đăng ký` (không có ký tự vô hình); điền biến thể có U+200E, U+200F, U+FEFF giữa "k" và "ý" | Cả ba cho cùng kết quả, trong đó có mục chứa U+200E | PW · XT | 1280 |
| C01-TK-06 | BR-4 | Như trên | Gõ `đ` rồi `d`; ví dụ `dat dai` và `đất đai` | "đ" khớp "d" hai chiều; cùng kết quả | PW · XT | 1280 |
| C01-TK-07 | BR-4 | Như trên | Gõ hai từ ở hai trường khác nhau của cùng mục (ví dụ một từ ở tên, một từ ở lĩnh vực — lấy cặp từ có thật trong `duLieuMau.ts`), đảo thứ tự hai từ | Mục chứa đủ cả hai từ ở bất kỳ trường nào đều ra; đảo thứ tự cùng kết quả; mục chỉ có một từ không ra | PW · XT | 1280 |
| C01-TK-08 | BR-4 | Như trên | Để ô trống; gõ 3 khoảng trắng; gõ `khai` rồi xoá hết | Ô trống hoặc chỉ khoảng trắng → toàn bộ danh sách (40 mục, 4 trang với 12 mục/trang) | PW · XT | 1280 |
| C01-TK-09 | BR-4 (biên: không có kết quả) | Như trên | Gõ `xyzxyz` | Danh sách trống, hiện EmptyState (xem nhóm 14), trang không lỗi | PW · XT | 1280 |
| C01-TK-10 | BR-4 (biên: rất dài) | Như trên | Điền 100 ký tự `a`; rồi thử dán chuỗi 5.000 ký tự | Ô giữ tối đa 100 ký tự (`maxLength`); trang vẫn mượt; không cuộn ngang; từ khoá dài trong EmptyState xuống dòng, không tràn khỏi khung | PW · XT | 375 |
| C01-TK-11 | BR-4 (biên: ký tự đặc biệt, HTML) | Như trên | Điền lần lượt: `<script>alert(1)</script>`, `<b>abc</b>`, `"'&;%00`, `\\`, `.*+?^${}()|[]`, `%`, emoji | Không hộp thoại; không lỗi biểu thức chính quy; kết quả "không tìm thấy" (hoặc đúng nếu khớp thật); ký tự hiện nguyên dạng chữ; console không lỗi | PW · XT | 1280 |
| C01-TK-12 | BR-4 | Như trên | Gõ một ký tự; đo thời gian từ phím cuối tới khi danh sách cập nhật; không nhấn Enter | Danh sách cập nhật không cần Enter hay nút tìm; ô vẫn nhập mượt (không rớt phím). Số đo cụ thể: ≤ 200 ms với 1.000 mục khi có dữ liệu thật (xem C01-HN-04) | PW · XT | 1280 |
| C01-TK-13 | AC-9, BR-4 | Như trên | Gõ `khai sinh`; bấm nút ✕ (tên "Xoá từ khoá") | Ô trống; `document.activeElement` là ô tìm; danh sách đầy đủ ở trang 1; nút ✕ biến mất | PW · XT | 1280, 375 |
| C01-TK-14 | AC-9 | Như trên | Rà mọi ô tìm trên trang xem trước và trang thật | Không có nút/biểu tượng micro, không thuộc tính nhận giọng nói (`x-webkit-speech`, `webkitspeech`); không có phần tử nào có tên chứa "micro"/"giọng nói" | PW (`getByRole`, `locator('[aria-label*=micro i]')`) · XT; thật **Chờ F03, F04, F05** | 1280 |
| C01-TK-15 | BR-4 | Trang xem trước | Đọc nhãn ô tìm bằng cây trợ năng; nhìn placeholder | `<label>` gắn với `<input type="search">` (nhãn có thể ẩn trên màn hình); placeholder không thay nhãn; có icon kính lúp `aria-hidden`; `autocomplete=off`, `spellcheck=false` | AX + PW · XT | 1280 |
| C01-TK-16 | BR-4 | Như trên | Gõ `khai`; chờ 500 ms; đọc vùng `role=status` ẩn; gõ `xyzxyz` | Sau khi gõ và đứng yên 500 ms: "Có n kết quả." đúng n; với `xyzxyz`: "Không có kết quả."; lúc mới mở trang vùng này rỗng; con trỏ vẫn ở ô tìm | PW · XT | 1280 |
| C01-TK-17 | BR-4 | NVDA | Gõ trong ô, nghe | Số kết quả được thông báo sau khi dừng gõ, không đọc từng phím; con trỏ ở ô | TAY · XT | 1280 |
| C01-TK-18 | BR-4, AC-8 | Bộ gõ Unikey (Telex và VNI) trên Chrome Windows | Gõ `dduwowcj` (Telex, "được") và `d9u7o7c5` (VNI) từng ký tự thật qua bộ gõ | Ô hiện đúng chữ có dấu, không mất chữ khi bộ gõ xoá rồi gõ lại; danh sách lọc đúng kết quả của "được" | TAY · XT | 1280 |
| C01-TK-19 | BR-4 | Safari iOS (hoặc giả lập WebKit) | Gõ nhanh 30 ký tự | Không lỗi "Too many calls to replaceState" ở console; địa chỉ ghi 1 lần sau 300 ms; ô không mất chữ | TAY + PW (WebKit, đếm `history.replaceState`) · XT | 375 |
| C01-TK-20 | BR-4, BR-8 | Đang ở trang 3, địa chỉ có `?trang=3` | Gõ một ký tự vào ô tìm | Về trang 1 ngay (trong lúc chờ ghi địa chỉ, `trang` coi như rỗng); sau 300 ms địa chỉ có `q` và không còn `trang` | PW · XT | 1280 |
| C01-TK-21 | BR-4, BR-8 | Địa chỉ `?q=khai&trang=2` | 1. Gõ thêm ký tự.<br>2. Nhấn "Quay lại" của trình duyệt (cùng trang). | Địa chỉ cập nhật theo (replace, không thêm mục lịch sử: "Quay lại" rời trang xem trước chứ không lùi từng ký tự); mở lại link đó đúng từ khoá và trang | PW · XT | 1280 |
| C01-TK-22 | BR-4 | Đổi địa chỉ từ bên ngoài (`page.goto` cùng route với `?q=thuy`) | Quan sát ô tìm | Ô hiện `thuy`, danh sách đã lọc | PW · XT | 1280 |

## 7. Chip lọc (BR-5, AC-10)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-CH-01 | AC-10, BR-5 | Nhóm chip mẫu có "Tất cả", "Đất đai", "Hộ tịch", ... (chip chọn sẵn = "Tất cả") | Bấm "Đất đai" | Chip "Đất đai": nền đậm, có dấu ✓, `aria-pressed=true`; "Tất cả" chuyển `aria-pressed=false`, mất ✓; danh sách về trang 1; nhóm có `role=group` + `aria-label` | PW · XT | 1280 |
| C01-CH-02 | AC-10 | NVDA | Tab tới chip đang chọn và chip khác | Chip chọn: đọc nghĩa "đã chọn/đã nhấn"; chip khác: ngược lại (theo mục 0) | TAY · XT | 1280 |
| C01-CH-03 | AC-10, BR-5 | Hàng chip dài hơn khổ | Khổ 375: vuốt ngang hàng chip (`touchscreen` hoặc kéo cuộn); đo `document.documentElement.scrollWidth` | Hàng cuộn được ngang; trang không cuộn ngang | PW · XT | 375 |
| C01-CH-04 | BR-5 | Máy có chuột (hover: hover) | Khi còn chip khuất: nút cuộn phải hiện; bấm; chip cuối hiện; nút cuộn trái hiện, nút phải ẩn | Nút cuộn chỉ hiện khi còn phần khuất; mỗi lần bấm cuộn khoảng 80% bề rộng; không cuộn mượt | PW · XT | 1280 |
| C01-CH-05 | BR-5 | Chip gợi ý lẻ của trợ lý (`Chip` không truyền `daChon`) | Đọc thuộc tính | Không có `aria-pressed` | PW · XT; thật **Chờ F06** | 1280 |
| C01-CH-06 | BR-5 (biên) | Chip có tên rất dài (60 ký tự) | Xem ở 375 | Chip co, không làm trang cuộn ngang; chữ không bị cắt khỏi vùng bấm | PW · XT | 375 |
| C01-CH-07 | BR-5, AC-10 | Dữ liệu thủ tục đã nhập (F01); chờ F03 | Chip "Đất đai" trên khối thủ tục thường gặp | Như C01-CH-01 với dữ liệu thật; chip chọn sẵn do F03 BR-2 quyết | PW · **Chờ F03** | 1280, 375 |

## 8. Chuyển dạng thẻ / bảng (BR-6, AC-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-VG-01 | AC-11, BR-6 | `localStorage` sạch; danh sách 40 mục, 12/trang | Khổ 1280. Đi tới trang 3 (3 chữ số thứ tự các mục). Bấm "Dạng thẻ" rồi "Dạng bảng" | Vẫn ở trang 3 (địa chỉ `trang=3`); cùng các mục theo cùng thứ tự (so dãy khoá hàng); lựa chọn đang dùng `aria-pressed=true` có ✓ | PW · XT | 1280 |
| C01-VG-02 | AC-11 | Như trên | Gõ `khai sinh`; chuyển dạng thẻ/bảng | Từ khoá giữ nguyên; kết quả không đổi | PW · XT | 1280 |
| C01-VG-03 | AC-11, BR-6 | Chưa chọn gì | Khổ 375 | Không có nút chuyển dạng (không hiện, không trong cây trợ năng); danh sách dạng thẻ | PW · XT | 375 |
| C01-VG-04 | AC-11 | Mở 1280, chọn "Dạng bảng" | `setViewportSize` 375×812; sau đó 1280×800 | 375: dạng thẻ, nút chuyển dạng biến mất. Nới lại 1280: dạng bảng, nút hiện lại | PW · XT | 1280 ↔ 375 |
| C01-VG-05 | BR-6 | `localStorage` sạch | Mở lần lượt: 768 (600–1023), 1280, kiosk | Mặc định: 768 → thẻ; 1280 → bảng; kiosk → thẻ (plan §4.4) | PW · XT | 768, 1280, K |
| C01-VG-06 | BR-6 | Đã chọn "Dạng bảng" ở 1280 | Tải lại | Giữ dạng bảng (`localStorage` khoá `cach-xem`); `localStorage` bị chặn thì giữ trong bộ nhớ, trang không lỗi | PW · XT | 1280 |
| C01-VG-07 | BR-6 | Hai nơi dùng cùng hook (khối thường gặp F03 + danh mục F04) | Đổi ở một nơi | Nơi kia đổi theo (một store) | PW · **Chờ F03, F04** | 1280 |
| C01-VG-08 | BR-6, BR-7 | Danh sách thủ tục thường gặp thật | Như C01-VG-01/02/04 với dữ liệu thật | Như trên | PW · **Chờ F03** (dữ liệu F01) | 1280, 375 |

## 9. Danh sách dạng bảng và thẻ (BR-7, AC-12)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-DS-01 | AC-12, BR-7 | Dạng bảng, 12 dòng/trang | Đọc cây trợ năng | `<table>` có `<caption>` (ẩn); mọi `<th>` có `scope=col`; trình đọc màn hình đọc tên cột của ô (`getByRole('cell')` ứng với `columnheader`); mục mở được chi tiết có phần tử bấm được (tên) dùng Tab/Enter | AX + PW · XT | 1280 |
| C01-DS-02 | AC-12, BR-7 | Dạng bảng | 1. Cuộn vùng bảng xuống cuối.<br>2. Cuộn cả trang xuống cuối.<br>3. Chụp. | (1) Dòng tiêu đề cột dính đầu vùng bảng (`position: sticky`, `top` của đầu bảng = đỉnh vùng) và nhìn thấy. (2) Ghi nhận ở trường hợp rủi ro 1 (plan §10): nếu đỉnh vùng bảng trượt khỏi màn hình thì tiêu đề khuất theo — **báo là lỗi Nhẹ hay Chặn tuỳ người dùng quyết**; AC-12 nêu cả hai cách cuộn nên ghi kết quả từng cách | PW · XT | 1280 |
| C01-DS-03 | AC-12, BR-7 | Dạng bảng, thêm cột rộng (hoặc cửa sổ hẹp ≥ 600) | Thu cửa sổ xuống 640 | Chỉ vùng bảng cuộn ngang (`scrollWidth` vùng bảng > `clientWidth`); trang không cuộn ngang | PW · XT | 768 |
| C01-DS-04 | AC-12, BR-7 | Dạng thẻ | Đo chiều cao các thẻ cùng hàng; toạ độ `top` của nút cuối thẻ | Thẻ cùng hàng cao bằng nhau; nút cuối thẻ thẳng hàng (cùng `top` ± 1 px) dù nội dung thẻ dài ngắn khác nhau (dữ liệu mẫu có thẻ tên 1 dòng và 4 dòng) | PW · XT | 1280, 768 |
| C01-DS-05 | BR-7 | Dạng thẻ | Đo số cột: 375, 768, 1024, 1280, K; với `soCotToiDa = 4` | 375: 1 cột; 600–1023: 2 cột; ≥ 1024: tối đa 4 cột, mỗi thẻ ≥ 240 px; kiosk: 2 cột | PW · XT | 375, 768, 1280, K |
| C01-DS-06 | BR-7 | Thẻ hẹp (cột 240 px) có 2 nút | Xem | Các nút xếp dọc, đủ rộng, không tràn | PW · XT | 1280 |
| C01-DS-07 | BR-7 | Hai dạng | Đọc dãy khoá hàng/thẻ ở cùng trang | Cùng mục, cùng thứ tự, cùng phân trang | PW · XT | 1280 |
| C01-DS-08 | BR-7 | Dạng bảng ở khổ 1280 | Mạng chặn chunk TanStack Table (`route.abort`) | Hiện khung chờ rồi lỗi ranh giới; trang còn lại không sập; (ghi nhận hành vi, phản hồi cho ui-core-dev nếu trang trắng) | PW · XT | 1280 |
| C01-DS-09 | BR-7 (biên: không có kết quả) | Danh sách rỗng | Xem | Không vẽ bảng/thẻ rỗng; chỉ EmptyState | PW · XT | 1280 |
| C01-DS-10 | BR-7 | Tên thủ tục rất dài (200 ký tự không dấu cách) | Xem thẻ và hàng bảng | Xuống dòng hoặc cắt trong ô; thẻ/bảng không làm trang cuộn ngang | PW · XT | 375, 1280 |

## 10. Phân trang (BR-8, AC-13, AC-14)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-PT-01 | AC-13 | Pager 20 trang (khối riêng của trang xem trước) | Mở trang 1, 2, 10, 19, 20 lần lượt; đọc chuỗi nút | Trang 1: `Trước 1 2 … 20 Sau`. Trang 2: `Trước 1 2 3 … 20 Sau`. Trang 10: `Trước 1 … 9 10 11 … 20 Sau`. Trang 19: `Trước 1 … 18 19 20 Sau`. Trang 20: `Trước 1 … 19 20 Sau` | PW · XT | 1280 |
| C01-PT-02 | AC-13, BR-8 | Như trên | Với mỗi trang trên: kiểm trang hiện tại | Đúng một nút `aria-current=page`, nền đậm, đậm chữ, gạch chân; "…" là `aria-hidden` | PW · XT | 1280 |
| C01-PT-03 | AC-13, BR-8 | Trang 10, 20 trang | Bấm "11"; đo `window.scrollY` và vị trí vùng kết quả | Trang đổi 11; danh sách cuộn về đầu (đầu vùng kết quả trong khung nhìn; không cuộn mượt); trang không giật ngang | PW · XT | 1280 |
| C01-PT-04 | BR-8 (Cần hỏi 3) | Như trên | Sau khi bấm sang trang khác, đọc `document.activeElement` | Con trỏ ở vùng kết quả (`tabIndex=-1`), tên đọc "Kết quả, trang 11 trên 20"; Tab tiếp vào mục đầu. Nếu người dùng chọn phương án b của Cần hỏi 3 thì đổi tiêu chí | PW + TAY · XT | 1280 |
| C01-PT-05 | BR-8 | Lần tải đầu có `?trang=5` | Mở trang | Không tự cuộn (chỉ cuộn khi người dùng bấm) | PW · XT | 1280 |
| C01-PT-06 | AC-14, BR-8 | Danh sách 5 mục, 12 mục/trang (1 trang) | Xem | Không có phân trang (DOM không có `nav` phân trang) | PW · XT | 1280 |
| C01-PT-07 | AC-14 | Danh sách 3 trang | Mở `?trang=99` | Hiện trang 3 (nút 3 là `aria-current`) | PW · XT | 1280 |
| C01-PT-08 | AC-14 | Như trên | Mở lần lượt `?trang=abc`, `?trang=-1`, `?trang=0`, `?trang=1.5`, `?trang=2abc`, `?trang=`, `?trang=<script>alert(1)</script>`, `?trang=99999999999999999999` | Mọi giá trị không hợp lệ → trang 1 (riêng số quá lớn → trang cuối hoặc trang 1 theo mô tả "lớn hơn số trang → trang cuối"; ghi nhận hành vi thực tế); giá trị lạ không hiện ra trang; địa chỉ không bị viết lại | PW · XT | 1280 |
| C01-PT-09 | BR-8 | Trang đầu / cuối | Đọc nút Trước/Sau | Có tên "Trang trước", "Trang sau"; nút số có tên "Trang n"; từ 600 px có chữ "Trước"/"Sau"; dưới 600 px chỉ icon nhưng tên đọc vẫn chứa chữ | PW · XT | 375, 1280 |
| C01-PT-10 | BR-8 | 20 trang | Khổ 375: đo bề rộng dãy trang dài nhất (trang 10) | Vừa một hàng ở 375 px (khoảng 294 px), không cuộn ngang; mỗi nút ≥ 24×24 | PW · XT | 375 |
| C01-PT-11 | BR-8 | Trang n | Kiểm mục đầu mỗi trang | Trang n bắt đầu từ mục thứ 12×(n−1)+1 | PW · XT | 1280 |
| C01-PT-12 | BR-8, AC-13 | Trang 3, đổi từ khoá / chip / bộ lọc | Đổi | Về trang 1 | PW · XT | 1280 |
| C01-PT-13 | BR-8, AC-14 | Danh mục thủ tục thật, mở link có `?trang=` | Như C01-PT-07/08 với danh mục thật | Như trên | PW · **Chờ F04** (dữ liệu F01) | 1280 |
| C01-PT-14 | BR-8 | Danh mục: "Quay lại" từ trang khác, mở link chia sẻ, quét QR | Mở lại địa chỉ có `?trang=2&q=...` | Đúng trang, từ khoá | PW · **Chờ F03, F04** | 1280 |

## 11. Popup (BR-9, AC-15, AC-16, AC-24)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-PP-01 | AC-15, BR-9 | Popup mẫu (nội dung dài; có popup thứ hai lồng) | Tab tới nút mở, Enter | `role=dialog`, `aria-modal=true`, `aria-labelledby` trỏ tiêu đề; `document.activeElement` nằm trong popup; trình đọc đọc tiêu đề | PW · XT | 1280 |
| C01-PP-02 | AC-15 | Popup đang mở | Nhấn Tab 30 lần; Shift+Tab 30 lần | Focus luôn trong popup, đi vòng; không ra trang phía sau | PW · XT | 1280 |
| C01-PP-03 | AC-15 | Như trên | Nhấn Esc | Popup đóng; focus về đúng nút đã mở | PW · XT | 1280 |
| C01-PP-04 | AC-16 | Trang cuộn tới giữa (`scrollY` = y0) | Mở popup; đóng bằng ✕; mở lại, đóng bằng Esc; mở lại, đóng bằng bấm vùng tối | Cả ba cách đóng; `scrollY` sau đóng = y0; nội dung trang giữ nguyên; focus về nút mở | PW · XT | 1280 |
| C01-PP-05 | AC-16, BR-9 | Popup mở | `page.mouse.wheel(0, 800)` trên vùng tối; đọc `scrollY` | Trang phía sau không cuộn (`html.khoa-cuon`); `scrollbar-gutter` giữ trang không giật ngang | PW · XT | 1280 |
| C01-PP-06 | BR-9 | Popup mở | Đọc `inert` của các con của `<body>` | Mọi con khác (trừ popup và `[data-ngoai-popup]`) có `inert`; đóng thì gỡ hết | PW · XT | 1280 |
| C01-PP-07 | BR-9 | Popup có chữ để chọn | Nhấn chuột trong popup, kéo ra vùng tối, thả | Không đóng (cả `pointerdown` và `click` phải ở vùng tối) | PW · XT | 1280 |
| C01-PP-08 | BR-9 | Hai popup lồng | Mở popup 2; Esc | Chỉ popup 2 đóng; Esc lần nữa đóng popup 1; focus trả đúng nút theo từng lớp | PW · XT | 1280 |
| C01-PP-09 | AC-16, BR-9 | Popup nội dung dài | Khổ 375: mở popup | Chiếm toàn màn hình, không bo góc; cuộn thân popup vẫn thấy tiêu đề, nút ✕ và chân (nút hành động, lời miễn trừ) | PW · XT | 375 |
| C01-PP-10 | BR-9 | Khổ 1280 | Đo | Rộng tối đa 680 px; cao tối đa `100dvh − 32 px`; thân `overflow: auto` | PW · XT | 1280 |
| C01-PP-11 | BR-9 | Có nút nổi giả (z 40) và khung giả (z 45) | Mở popup | Popup nằm trên cả hai (z 50); hai thứ bị `inert` | PW · XT; thật **Chờ F06** | 1280 |
| C01-PP-12 | BR-9 | Ô tìm nằm trong popup | Esc khi con trỏ ở ô tìm | Popup đóng | PW · XT | 1280 |
| C01-PP-13 | BR-9, AC-16 | Nút mở popup bị xoá khỏi DOM trước khi đóng | Đóng popup | Không lỗi; focus về `body` hoặc phần tử hợp lý, trang không sập | PW · XT | 1280 |
| C01-PP-14 | AC-15 | Popup đã đóng, mở bằng chuột | Đóng bằng Esc | Focus về nút vừa bấm | PW · XT | 1280 |
| C01-PP-15 | BR-9 | Popup thủ tục có địa chỉ riêng (F03 BR-8) | Mở popup; nhấn "Quay lại" của trình duyệt | Popup đóng; trang giữ nguyên | PW · **Chờ F03** | 1280, 375 |
| C01-PP-16 | AC-24, BR-9 | Kiosk bật; nút giả `data-ngoai-popup` (portal vào `<body>`, "chỉ để thử vòng Tab") | Mở popup bằng Enter. Nhấn Tab liên tục, ghi thứ tự | Tab đi qua các phần tử trong popup, tới nút giả là phần tử cuối, rồi quay về phần tử đầu của popup; không ra trang sau | PW · XT | K |
| C01-PP-17 | AC-24 | Như trên | Từ phần tử đầu trong popup nhấn Shift+Tab | Focus tới nút giả | PW · XT | K |
| C01-PP-18 | AC-24 | Như trên | Đặt focus ở nút giả; Enter; rồi phím cách | Nút giả được kích hoạt (bộ đếm tăng 2 lần); popup không đóng | PW · XT (nút giả); hành vi thật F09 BR-7 **Chờ F09** | K |
| C01-PP-19 | AC-24, BR-9 | Kiosk, popup có nút "Xem và nộp trên Cổng DVC" và lời miễn trừ ở chân | Cuộn tới cuối popup; đo chồng lấn giữa nút "Bắt đầu lại" (hoặc nút giả) và chân popup | Hộp bao của nút không chồng lên liên kết và lời miễn trừ (vùng tối chừa dải dưới 88 px) | PW · XT (nút giả); thật **Chờ F03, F09** | K |
| C01-PP-20 | AC-24 | Không kiosk | Mở popup, Tab hết vòng | Vòng chỉ gồm phần tử trong popup; không có nút "Bắt đầu lại" | PW · XT | 1280 |
| C01-PP-21 | AC-24 | Kiosk, nút giả có `z-index` 55 | Mở popup | Nút giả nhìn thấy, bấm được, nằm trên popup (`elementFromPoint` tại tâm nút trả về chính nút) | PW · XT | K |
| C01-PP-22 | BR-9 | NVDA | Mở popup | Đọc tiêu đề popup khi mở; sau khi đóng, đọc tên nút đã mở | TAY · XT | 1280 |

## 12. Nhãn trạng thái (BR-10, AC-17)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-NH-01 | AC-17, BR-10 | Các biến thể nhãn (`info`, `success`, `warning`, `neutral`) | Đọc text và chụp ở đen trắng | Mọi nhãn có chữ; "Toàn trình" và "Một phần" phân biệt được bằng chữ khi bỏ màu | PW + TAY · XT | 1280 |
| C01-NH-02 | AC-17 | Thẻ thủ tục thật; chờ F03 | Tìm nhãn "Ưu tiên" trên mọi thẻ/popup/danh mục | Không có chuỗi "Ưu tiên" ở đâu cả | PW · **Chờ F03, F04** | 1280, 375 |
| C01-NH-03 | AC-17, BR-10 | Một thẻ có nhãn | Tab qua thẻ | Focus không dừng ở nhãn (không `tabindex`, không vai trò) | PW · XT; thẻ thật **Chờ F03** | 1280 |
| C01-NH-04 | AC-17 | Nhãn `rutGon` với câu thời hạn 200 ký tự | Đo `scrollWidth` và hộp bao của nhãn so với khung chứa | Một dòng, kết thúc bằng "…" (`text-overflow: ellipsis`), `max-width: 100%`, không tràn thẻ; trình đọc đọc đủ câu; popup có đủ câu | PW · XT; thật **Chờ F03** | 375, 1280 |
| C01-NH-05 | AC-17 | Nhãn lĩnh vực với tên dài ("Lĩnh vực ... " 80 ký tự có dấu cách) | Xem | Xuống dòng, không cắt chữ, không tràn | PW · XT | 375 |
| C01-NH-06 | BR-10 (biên) | Nhãn rỗng, nhãn chuỗi một từ dài 100 ký tự không dấu cách, nhãn chứa `<b>x</b>` | Xem | Nhãn rỗng không vẽ; từ dài bị bẻ hoặc cắt trong khung, không tràn trang; `<b>x</b>` hiện nguyên chữ | PW · XT | 375 |
| C01-NH-07 | BR-10 | Nhãn giờ làm việc F02 (`kichThuoc=vua`) | Xem | Có chữ "Trong giờ"/"Ngoài giờ" (theo F02); có dấu hiệu không chỉ màu | PW · **Chờ F02** | 1280 |

## 13. Đang tải (BR-11, AC-18)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-DTAI-01 | AC-18 | Skeleton 3 dạng (`the`, `bang`, `dong`) trên trang xem trước | Xem; đọc cây trợ năng | Mỗi nhóm có `role=status` đọc "Đang tải…"; khối xám `aria-hidden`; khối chứa `aria-busy=true`; hình dạng gần giống nội dung (thẻ: nhãn + 2 dòng tên + nhãn phụ + khối nút) | PW + AX · XT | 1280, 375 |
| C01-DTAI-02 | AC-18, BR-1 | Như trên | Đọc `getAnimations()` và `animation-name` mọi khối skeleton; `emulateMedia` thường và `reduce` | Không có animation, không hiệu ứng chạy liên tục; vị trí khối đứng yên qua 2 lần chụp cách nhau 1 giây | PW · XT | 1280 |
| C01-DTAI-03 | AC-18 | Danh mục thật; mạng 3G chậm (CDP `Network.emulateNetworkConditions` ~400 kbps, 400 ms) | Mở danh mục | Vùng nội dung hiện khối giữ chỗ; trình đọc đọc "Đang tải…"; không nhảy bố cục (CLS khi dữ liệu về ≤ 0,1) | PW + TAY · **Chờ F04, F08** | 375 |
| C01-DTAI-04 | AC-18 | NVDA | Mở trang xem trước có skeleton | Nghe "Đang tải…" | TAY · XT | 1280 |

## 14. Lỗi (BR-11, AC-19)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-LOI-01 | AC-19 | ErrorState `mat-ket-noi`, `LienHeProvider` số mẫu "0000.000.000" | Xem | Dòng "Chưa tải được dữ liệu."; câu "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng rồi thử lại."; nút "Thử lại"; số gọi được (`href="tel:0000000000"`); không có "Mã tra cứu" | PW · XT | 1280, 375 |
| C01-LOI-02 | AC-19 | ErrorState `qua-nhieu-yeu-cau` | Xem | Câu của loại lỗi đúng nguyên văn F00 BR-6; không mã tra cứu | PW · XT | 1280 |
| C01-LOI-03 | AC-19 | ErrorState `loi-he-thong` + `maTraCuu` mẫu | Xem | Câu "Hệ thống đang gặp sự cố. Vui lòng thử lại sau." + "Mã tra cứu: ..." | PW · XT | 1280 |
| C01-LOI-04 | AC-19 | Mọi biến thể lỗi | Tìm chuỗi mã kỹ thuật: `500`, `404`, `ProblemDetails`, `Exception`, `stack`, `TypeError`, `/api/`, tên field `title`, `detail` | Không xuất hiện trên trang | PW (`textContent`) · XT | 1280 |
| C01-LOI-05 | AC-19 | Khung lỗi | Đọc thuộc tính, dùng `page.evaluate` bắt `aria-live` | Khung có `role=alert` (đọc ngay khi hiện) | PW · XT | 1280 |
| C01-LOI-06 | AC-19 | NVDA | Kích hoạt lỗi; không di chuyển con trỏ | NVDA tự đọc thông báo lỗi | TAY · XT | 1280 |
| C01-LOI-07 | AC-19, BR-11 | Danh mục thật; `context.setOffline(true)` rồi mở danh mục | Quan sát; `setOffline(false)`; bấm "Thử lại" | Hiện lỗi mất kết nối như C01-LOI-01; bấm "Thử lại": chuyển sang khung chờ rồi hiện danh sách | PW · **Chờ F04, F08** | 1280, 375 |
| C01-LOI-08 | AC-19 | Chặn API (`route` trả 500 ProblemDetails `code=loi-he-thong`, `maTraCuu=ABC123`) | Mở danh mục | Câu hệ thống + mã tra cứu `ABC123`; không hiện `title`/`detail` của ProblemDetails | PW · **Chờ F04** | 1280 |
| C01-LOI-09 | AC-19 | Không có `LienHeProvider` (hoặc số null) | Xem ErrorState | Ẩn dòng gọi số, không còn "undefined"/"null" trên trang | PW · XT | 1280 |
| C01-LOI-10 | BR-11 (biên) | Số trung tâm chứa ký tự lạ (`<b>1</b>` hoặc chuỗi rất dài) | Xem | `tel:` không chứa ký tự nguy hiểm; không bị coi là HTML; không tràn | PW · XT | 375 |
| C01-LOI-11 | BR-11 | QueryState | Bấm "Thử lại" khi API vẫn lỗi | Khung chờ, rồi lỗi lại; không vòng lặp tự gọi liên tục (đếm request ≤ 1 mỗi lần bấm) | PW · XT hoặc **Chờ F04** | 1280 |

## 15. Không có kết quả (BR-11, AC-20)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-RONG-01 | AC-20 | Khối thường gặp có chip "Hộ tịch"; dữ liệu F01 đã nhập | Chọn chip "Hộ tịch", gõ `xyzxyz` | "Không tìm thấy thủ tục phù hợp với 'xyzxyz'"; đủ 4 gợi ý (kiểm chính tả, xoá bộ lọc, hỏi trợ lý, gọi trung tâm); nút "Xoá bộ lọc"; focus vẫn ở ô tìm | PW · **Chờ F03** | 1280 |
| C01-RONG-02 | AC-20 | Như trên | Bấm "Xoá bộ lọc" | Ô tìm trống; chip "Tất cả" chọn; danh sách đầy đủ trang 1; focus về ô tìm (plan §4.10) | PW · **Chờ F03** | 1280 |
| C01-RONG-03 | AC-20 | Danh mục chọn lĩnh vực "Hộ tịch" | Gõ `xyzxyz` | Thông báo như trên, đủ 4 gợi ý bằng chữ, KHÔNG có nút "Xoá bộ lọc" trong thông báo; nút "Xoá bộ lọc" trên thanh bộ lọc vẫn có | PW · **Chờ F04** | 1280, 375 |
| C01-RONG-04 | AC-20 | Khối riêng của trang xem trước, mô phỏng F03 (`nutXoaTrenThanhLoc=false`) | Gõ `<b>abc</b>` | Thông báo hiện đúng chuỗi `<b>abc</b>` dạng chữ; DOM không có thẻ `<b>`; không in đậm | PW · XT; thật **Chờ F03** | 1280 |
| C01-RONG-05 | AC-20 | Trang lĩnh vực | Gõ `xyzxyz` | "Không tìm thấy lĩnh vực phù hợp với 'xyzxyz'" | PW · **Chờ F05** | 1280 |
| C01-RONG-06 | AC-20 | Danh sách luôn rỗng của trang xem trước; ô tìm trống, không chọn bộ lọc | Xem | Có thông báo không có kết quả; chỉ 2 gợi ý (hỏi trợ lý, gọi trung tâm); không nút "Xoá bộ lọc"; không gợi ý "kiểm tra chính tả", "xoá bộ lọc"; câu không có phần "với ..." | PW · XT | 1280 |
| C01-RONG-07 | AC-20 | Như trên | Gõ `xyzxyz` | Nút "Xoá bộ lọc" và đủ 4 gợi ý hiện lại | PW · XT | 1280 |
| C01-RONG-08 | AC-20 | Như trên, chỉ chọn chip (ô tìm trống) | Xem | Câu không có phần "với ..." ("Không tìm thấy <đối tượng> phù hợp") | PW · XT | 1280 |
| C01-RONG-09 | AC-20 | Như trên | Gõ khoảng trắng đầu/cuối: `  xyzxyz  ` | Từ khoá hiện đã cắt khoảng trắng hai đầu | PW · XT | 1280 |
| C01-RONG-10 | AC-20 (biên: rất dài, đặc biệt) | Như trên | Điền 100 ký tự không khoảng trắng; điền `'; DROP TABLE x;--`; điền `{{so}}`; điền `${1+1}` | Từ khoá hiện nguyên chữ, xuống dòng không tràn khung; không nội suy mẫu i18n (`{{so}}` hiện nguyên); không lỗi | PW · XT | 375 |
| C01-RONG-11 | AC-20 | EmptyState trong 3 khổ | Kiểm gợi ý "gọi trung tâm" | Có số khi `LienHeProvider` có số; không có số thì "Hỏi cán bộ tại Trung tâm." (theo `common.json`) | PW · XT | Mọi khổ |
| C01-RONG-12 | AC-20 | Không `role=alert` trên EmptyState | Đọc | Không `role=alert`, không lấy focus | PW · XT | 1280 |

## 16. Ô dịch vụ (BR-12, AC-21)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-OD-01 | AC-21 | Ô có link `https://example.com/` | Bấm; kiểm trang mới | Mở tab mới theo C01-LK-01; có dòng "Trang ngoài" (aria-hidden); tên đọc = tên ô + "(mở trang mới)"; chỉ 1 điểm dừng Tab | PW · XT | 1280 |
| C01-OD-02 | AC-21 | Ô `href=null` và ô `javascript:alert(1)` | So với ô có link: `boundingBox`, màu nền biểu tượng, `border`, `opacity` | Cùng khung, biểu tượng, tên, chiều cao; không viền nét đứt; `opacity` = 1; không chữ ghi chú; không "Trang ngoài" | PW · XT | 1280 |
| C01-OD-03 | AC-21 | Như trên | Bấm ô không link; Tab; đọc cây trợ năng | Không có gì xảy ra; Tab bỏ qua; không `role=link`; không `href`, `tabindex`; tên đọc là chữ thường | PW + AX · XT | 1280 |
| C01-OD-04 | AC-21, BR-12 | `TileGrid` với 6 ô | Đo số ô mỗi hàng; chiều cao ô cùng hàng | 375: 2 cột; 600–1023: 3 cột; ≥ 1024: 6 cột; ô cùng hàng cao bằng nhau (kể cả tên 1 dòng so với 2 dòng) | PW · XT | 375, 768, 1280 |
| C01-OD-05 | BR-12 (biên) | Tên ô 120 ký tự | Xem | Tối đa 2 dòng, cắt có "…" hoặc xuống dòng trong khung; không tràn | PW · XT | 375 |
| C01-OD-06 | BR-12 | Hover ô có link | Rê chuột | Đổi viền và bóng ngay, không transition màu; ô không link không đổi | PW · XT | 1280 |
| C01-OD-07 | AC-21 | Trang chủ thật, dữ liệu `trung-tam` nhập có ô để trống link (F01) | Như C01-OD-01..03 | Ô chưa link vẫn hiện đúng vị trí theo thứ tự dữ liệu | PW · **Chờ F02** (dữ liệu F01) | 1280, 375 |

## 17. Nút trợ lý nổi (BR-13, AC-22)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-FAB-01 | AC-22 | FloatingButton mẫu trên trang xem trước | Xem | `position: fixed` góc phải dưới, cách `--gutter`; cao ≥ 44 px; có icon + chữ; bo tròn | PW · XT | 375, 1280 |
| C01-FAB-02 | AC-22 | `dangMo` bật/tắt | Bấm nút mẫu | `aria-expanded` đổi true/false; có `aria-controls` | PW · XT | 1280 |
| C01-FAB-03 | AC-22 | Mọi trang thật; chờ F06, F08 | Xem ở trang chủ, danh mục, lĩnh vực, 404 | Nút "Trợ lý" ở góc phải dưới ở mọi trang | PW · **Chờ F06, F08** | 375, 1280 |
| C01-FAB-04 | AC-22 | Như trên | Cuộn tới cuối; đo chồng lấn nút nổi với chữ cuối chân trang | Nút không che chữ ở chân trang (`--fab-clearance`) ở thường và kiosk | PW · **Chờ F08** | 375, K |
| C01-FAB-05 | AC-22 | Chờ F06 | Bấm nút; đóng bằng ✕ | Mở khung, focus ở ô nhập; ✕ → focus về nút "Trợ lý" | PW · **Chờ F06** | 1280, 375 |
| C01-FAB-06 | AC-22 | Chờ F03, F06 | Mở popup từ câu trả lời trợ lý | Popup nằm trên khung trợ lý và nút (z 50 > 45 > 40) | PW · **Chờ F03, F06** | 1280 |
| C01-FAB-07 | BR-13 | Kiosk, nút giả trái | Xem | Hai nút đối xứng góc dưới trái/phải; không che nhau ở 1080 | PW · XT; thật **Chờ F09** | K |

## 18. Hiệu ứng (BR-1, AC-23)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-HU-01 | AC-23 | Trang xem trước, chế độ thường | Mở/đóng popup, bật khung nút nổi, hover nút/chip/hàng bảng; ghi `document.getAnimations()` và `transition-property`/`transition-duration` của mọi phần tử | Mọi `transition-property` chỉ gồm `opacity`, `transform` (hoặc `none`); mọi thời lượng ≤ 150 ms; không animation lặp (`animation-iteration-count: infinite`) | PW · XT | 1280 |
| C01-HU-02 | AC-23 | `emulateMedia({ reducedMotion: 'reduce' })` | Làm lại như C01-HU-01 | Không còn animation hay transition nào (thời lượng 0 hoặc `none`) | PW · XT | 1280 |
| C01-HU-03 | AC-23 | Bảng hiệu ứng DevTools | Mở bảng Animations, mở popup, hover | Xem bằng mắt khớp C01-HU-01 | TAY · XT | 1280 |
| C01-HU-04 | BR-1 | Mã nguồn CSS | `grep -rnE "transition[^;]*(color|background|border|box-shadow|width|height|all)"` trong `core/**/*.css` và `app/**/*.css`; `grep -rn "behavior: *'smooth'\|scroll-behavior: *smooth"` | Không có kết quả | SH | — |
| C01-HU-05 | AC-23 | Cuộn về đầu sau đổi trang | Quan sát | Cuộn tức thì, không cuộn mượt | PW · XT | 1280 |

## 19. Trợ năng bổ sung (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-TN-01 | BR-1 | NVDA + Chrome, trang xem trước | Đi hết trang bằng mũi tên đọc (Down) | Mỗi nút/liên kết/ô nhập có tên rõ; icon trang trí không bị đọc; nhãn nhóm chip, nhóm chuyển dạng, phân trang (`nav`) được đọc; trang hiện tại đọc "trang hiện tại" | TAY · XT | 1280 |
| C01-TN-02 | BR-1 | AX + PW | Liệt kê mọi `button`/`a`/`input` không có tên đọc (`accessibleName` rỗng) | Danh sách rỗng | AX · XT | Mọi khổ |
| C01-TN-03 | BR-1 | TalkBack hoặc VoiceOver (điện thoại thật) | Vuốt qua chip, phân trang, nút chuyển (ẩn ở điện thoại), popup | Thứ tự hợp lý; popup chặn vuốt ra sau (`inert`) | TAY · XT | 375 |
| C01-TN-04 | BR-1 | Mọi biến thể | Đọc `lang` của `<html>` | `vi` | AX · XT | 1280 |
| C01-TN-05 | BR-1 | Tab qua trang bằng Shift+Tab ngược | Kiểm 2.1.2 không bẫy | Không khu vực nào giữ focus mãi trừ popup (thoát bằng Esc) | PW · XT | 1280 |
| C01-TN-06 | BR-1 | `zoom` 200% / `deviceScaleFactor` 2 trên 640×360 | Dùng trang | Mọi chức năng dùng được, không mất nội dung | PW + TAY · XT | 640 |

## 20. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-BM-01 | BR-3, AC-6 | Mã nguồn | `grep -rn dangerouslySetInnerHTML src`; chạy `npm run lint` | Không có; lint sạch | SH | — |
| C01-BM-02 | CLAUDE.md | Bản build (`npm run build`), chạy bằng API (`dotnet run --project src/BackEnd/DichVuCong.Api`) | `curl -sI https://localhost:7157/` và `curl -sI https://localhost:7157/assets/<file>.js` (hoặc 1 tệp bất kỳ) | Có: `Content-Security-Policy` đúng nguyên văn trong CLAUDE.md; `Strict-Transport-Security`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy: microphone=(), camera=(), geolocation=()`. Không có `Server` | SH (curl) | — |
| C01-BM-03 | CLAUDE.md | Bản build | Mở bản build bằng Playwright; `page.on('console')` và sự kiện `securitypolicyviolation` | Không lỗi vi phạm CSP; `script:not([src])` = 0; không phần tử `[style]` trong HTML trả về; không thẻ `<style>` chèn lúc chạy | PW · bản build (qua F08 hoặc trang tạm) | 375, 1280 |
| C01-BM-04 | CLAUDE.md | Như trên | `page.on('request')` trong lúc mở trang | Mọi request cùng gốc với trang; không CDN, không Google Fonts; không `@font-face`, không `@import url(` trong CSS build | PW + SH | 1280 |
| C01-BM-05 | CLAUDE.md | Bản build | `find wwwroot -name '*.map'`; tìm `//# sourceMappingURL` trong JS | Không `.map`; không `sourceMappingURL`; `console`, `debugger` bị bỏ | SH | — |
| C01-BM-06 | plan §10 rủi ro 6 | Bản build | `grep -rl "xem-truoc" wwwroot`; `curl -s https://localhost:7157/dev/design-system` | Không tệp nào của trang xem trước; mở `/dev/design-system` ra trang 404 của F08 (hoặc `index.html` mặc định trước khi có F08) | SH + PW | 1280 |
| C01-BM-07 | plan §6 | Trang xem trước | Sau khi dùng: đọc `localStorage` và `sessionStorage` | Chỉ có `cach-xem` (localStorage) và cờ `kiosk` (sessionStorage); không dữ liệu cá nhân | PW · XT | 1280 |
| C01-BM-08 | BR-4 | Ô tìm | Gõ nội dung có dạng CCCD (12 số), số điện thoại, email | Không có request nào gửi đi (tìm hoàn toàn phía trình duyệt); không ghi vào `localStorage` | PW (`page.on('request')`) · XT | 1280 |
| C01-BM-09 | BR-3 | Mã nguồn FE | Tìm `eval(`, `new Function`, `innerHTML =`, `document.write` | Không có (hoặc có lý do ghi chú) | SH | — |
| C01-BM-10 | BR-3 | `href` từ dữ liệu | Rà các chỗ khác nhận `href` từ dữ liệu (không qua `ExternalLink`): `grep -rn "href={" src` | Mọi `href` từ dữ liệu đi qua `phanLoaiLienKet`/`ExternalLink` | SH | — |

## 21. Hiệu năng

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm · khi chạy | Khổ |
|---|---|---|---|---|---|---|
| C01-HN-01 | CLAUDE.md, plan §5 | `npm run build` | Cộng gzip của entry, `vendor`, chunk route trang chủ và chunk dùng chung kéo theo (mở `/` ở 375, ghi mọi `.js` đã tải, nén gzip từng tệp) | ≤ 200 KB gzip (tham chiếu 124,6 KB trước C01; C01 thêm dự kiến ≤ 15 KB). Báo bảng từng chunk trước/sau | SH + PW (đếm response) | 375 |
| C01-HN-02 | plan §5 | Như trên | Danh sách chunk | Chunk `@tanstack/react-table` riêng; không có trong chunk `vendor` hoặc chunk trang chủ; ở khổ 375 và kiosk (dạng thẻ) KHÔNG được tải; ở 1280 (dạng bảng) tải sau chunk trang chủ | SH + PW (đếm response) | 375, 1280, K |
| C01-HN-03 | plan §5 | Như trên | Chạy Lighthouse mobile cho `/` và `/thu-tuc` | Điểm Performance ≥ 85 cho cả hai (số đo nằm ở F08/F02/F04; C01 chỉ ghi nhận mức C01 có làm giảm không) | LH · **Chờ F02, F04, F08** | 375 |
| C01-HN-04 | F00 BR-9, BR-4 | Danh mục 1.000 mục (khi F01 nhập xong); hoặc tập mẫu nhân lên 1.000 mục trong trang xem trước | Gõ từng ký tự của `dang ky khai sinh`; đo thời gian từ phím tới khi danh sách vẽ xong (`performance.measure`) | ≤ 200 ms (plan §5); ô nhập không rớt phím | PW · XT (mẫu 1.000 mục) hoặc **Chờ F04** | 1280, 375 |
| C01-HN-05 | plan §5 | Trang xem trước | Chuyển dạng thẻ ↔ bảng 10 lần | Không rò rỉ (số node DOM ổn định ±10%); không treo | PW · XT | 1280 |
| C01-HN-06 | plan §4.10 | Skeleton | Đo CLS khi nội dung thật thay skeleton | CLS ≤ 0,1 | PW (Layout Instability API) · **Chờ F04** | 375 |
| C01-HN-07 | CLAUDE.md | Bản build | Kiểm ảnh trong bản build (nếu có) | Ảnh khai `width`/`height`; WebP/AVIF; icon là SVG trong bundle (không tệp ảnh ngoài) | SH | — |

## 22. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | C01-BP-01…09, KS-01…09, DT-01…08, TN-01…06, HU-01…05 |
| BR-2 | C01-NU-01…11, BP-05 |
| BR-3 | C01-LK-01…08, BM-01, BM-09, BM-10 |
| BR-4 | C01-TK-01…22, BM-08, HN-04 |
| BR-5 | C01-CH-01…07 |
| BR-6 | C01-VG-01…08 |
| BR-7 | C01-DS-01…10 |
| BR-8 | C01-PT-01…14 |
| BR-9 | C01-PP-01…22 |
| BR-10 | C01-NH-01…07 |
| BR-11 | C01-DTAI-01…04, LOI-01…11, RONG-01…12 |
| BR-12 | C01-OD-01…07 |
| BR-13 | C01-FAB-01…07 |
| AC-1 | C01-BP-01…07 |
| AC-2 | C01-KS-01…09 |
| AC-3 | C01-DT-01, DT-02 |
| AC-4 | C01-DT-03…06 |
| AC-5 | C01-NU-01…08 |
| AC-6 | C01-LK-01…06 |
| AC-7 | C01-TK-01 |
| AC-8 | C01-TK-02…05, TK-18 |
| AC-9 | C01-TK-13, TK-14 |
| AC-10 | C01-CH-01…03, CH-07 |
| AC-11 | C01-VG-01…05, VG-08 |
| AC-12 | C01-DS-01…04 |
| AC-13 | C01-PT-01…04 |
| AC-14 | C01-PT-06…08, PT-13 |
| AC-15 | C01-PP-01…03, PP-14 |
| AC-16 | C01-PP-04, PP-05, PP-09 |
| AC-17 | C01-NH-01…05 |
| AC-18 | C01-DTAI-01…04 |
| AC-19 | C01-LOI-01…09 |
| AC-20 | C01-RONG-01…10 |
| AC-21 | C01-OD-01…03, OD-07 |
| AC-22 | C01-FAB-01…07 |
| AC-23 | C01-HU-01…05 |
| AC-24 | C01-PP-16…21 |

## 23. Tóm tắt (do tester khi viết xong)

- Số ca: xem mục 24.
- Chạy ngay trên trang xem trước (XT): phần lớn nhóm 1–19. Chờ chức năng khác: nhóm có "Chờ F02/F03/F04/F05/F06/F07/F08/F09".
- Ca thử tay: DT-01, NU-07, TK-17…19, CH-02, PP-22, DTAI-04, LOI-06, TN-01, TN-03, HU-03.
- C01 chỉ chuyển `xong` khi mọi ca "Chờ Fxx" cũng đạt (plan §8).

## 24. Thống kê

Tổng số ca đã viết: 204. Kết quả: xem `result/test.md` (chạy 2026-10-12).
