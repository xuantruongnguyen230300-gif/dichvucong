---
id: F08
ten: Khung trang chung — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-12, A1 = b)
nguoi_viet: tester
cap_nhat: 2026-10-12
trang_thai_chay: đã chạy 2026-10-12 (T10) — xem result/test.md
---

# F08 · Khung trang chung — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/khung-trang.spec.ts` |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory, `src/BackEnd/DichVuCong.Tests/Integration/ThongTinTrungTam/`; DB thật qua Testcontainers PostgreSQL nếu máy có Docker |
| VT | Vitest do ui-core-dev/backend-dev viết (T01–T07); tester chỉ rà |
| CURL | `curl -I`, `curl -s` |
| LH | Lighthouse mobile |
| TAY | Thử tay (trình đọc màn hình, Zalo, thiết bị thật) |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 có `?kiosk=1`. 320 chỉ cho ca reflow.

**Hai cách đọc dữ liệu đặc tả** (T09): (H) "mở thẳng" — gọi `request.get(url)` hoặc `curl`, đọc HTML máy chủ trả, không chạy JavaScript (giống Zalo); (D) "điều hướng" — mở trang rồi bấm điều hướng trong ứng dụng, đọc DOM. Hai cách phải ra cùng tập thẻ (plan §3.3, rủi ro 4).

**Phụ thuộc F01 (nhập dữ liệu)**: mọi ca đọc dữ liệu Trung tâm cần dữ liệu nhập vào DB bằng `dotnet run --project src/BackEnd/DichVuCong.Import -- nhap ...` (db-dev đang làm; cần F01 T05 loại `thu-tuc` và T07 loại `trung-tam`). Trước khi công cụ nhập sẵn sàng, bộ dữ liệu thử có thể chèn tay vào DB dev; các ca có chữ "nhập lại" thì **chờ F01 T05/T07**.

**Bộ dữ liệu thử** (soạn riêng, không dựa vào dữ liệu thật; tên giả, không tên cán bộ thật)

| Bộ | Nội dung |
|---|---|
| **A** (đầy đủ) | `ten` "Trung tâm thử A"; `xa` "phường thử B"; `tinh` "tỉnh thử C"; `coQuanChuQuan` "UBND phường thử B"; `nguoiChiuTrachNhiem` "Người thử"; `chucVu` "Giám đốc (dữ liệu thử)"; `diaChi` "Địa chỉ thử, phường thử B"; `dienThoai` "0000.000.000"; `email` "thu@example.gov.vn"; `banDo` "https://maps.example.test/thu"; liên kết hữu ích đủ 3 dòng "Chân trang" như `lien-ket.md` §1 (Cổng DVC Quốc gia, cổng thông tin xã, cổng thông tin tỉnh — địa chỉ giả `https://*.example.test`); mạng xã hội: Zalo OA `https://zalo.example.test/thu`; `ngayCapNhatThuTuc` 2026-10-08 |
| **B** (tối thiểu) | Như A nhưng `coQuanChuQuan` trống, `chucVu` trống, `banDo` trống, mạng xã hội trống hết, `lienKet` rỗng |
| **C** (tên hóc búa) | `ten` `Trung tâm "thử" & <b>C</b>`; `xa` `phường <script>alert(1)</script>`; `coQuanChuQuan` `UBND 'thử' &amp;` — kiểm mã hoá HTML. (Nếu F01 từ chối ký tự này thì chèn thẳng DB dev) |
| **D** (rất dài) | `ten` 200 ký tự có dấu cách; `diaChi` 500 ký tự; `lienKet` 15 dòng, tên 100 ký tự |
| **E** (link độc hại) | `lienKet[0].url` = `javascript:alert(1)`, `banDo` = `data:text/html,x`, `mangXaHoi.facebook` = `//evil.example`. F01 không nhận; chèn thẳng DB dev để thử phòng thủ lớp FE |
| **F** (thiếu địa bàn) | A nhưng (F1) `xa` trống; (F2) `tinh` trống; (F3) cả hai trống |
| **G** (thật) | Dữ liệu Cần Giuộc ở `nghiep-vu/can-giuoc.md` — chỉ dùng cho ca AC-14 phần "nhập lại với Cần Giuộc" và AC-15 |

**Đường dẫn dùng trong ca**: `/` (trang chủ), `/thu-tuc` (danh mục, tạm là `TrangTam` tới khi có F04), `/linh-vuc` (tạm tới khi có F05), `/abc-xyz` (404).

**Cột "Khi chạy"**: "Sau T07" = có thể chạy khi T01–T07 xong (kể cả khi F02–F06 chưa có). "Chờ Fxx" = cần chức năng đó (plan §8). Ca chờ chưa chạy được không tính là lỗi.

## 1. Khung chung, đánh dấu, điều hướng (BR-1, BR-2, AC-1, AC-2, AC-3)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-KH-01 | AC-1, BR-1 | Bộ A | Mở lần lượt `/`, `/thu-tuc`, `/linh-vuc`, `/abc-xyz`; ở mỗi trang chụp ảnh đầu trang, điều hướng, chân trang và ghi thứ tự phần tử | Đầu trang, điều hướng, chân trang giống nhau, cùng thứ tự, kể cả trang 404 (so DOM đoạn `<header>`, `<nav>`, `<footer>`, trừ trạng thái mục đang xem) | PW | 1280, 375 | Sau T07 |
| F08-KH-02 | AC-1 | Như trên | Đọc `nav` | Có đúng 3 mục theo thứ tự: "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR"; không có nút menu (không `button` có tên chứa "menu") | PW | 1280, 375, 768 | Sau T05 |
| F08-KH-03 | AC-1, BR-1 | Như trên | Ở mỗi trang đọc `aria-current` | Mục của trang đang xem có `aria-current=page` và gạch dưới 3 px; hai mục còn lại không có. Ở trang 404 không mục nào đang xem. Đen trắng vẫn phân biệt (gạch dưới, không chỉ màu) | PW + TAY (đen trắng) | 1280, 375 | Sau T05 |
| F08-KH-04 | AC-2, BR-2 | Bộ A, đang ở `/thu-tuc` | Bấm biểu tượng đầu trang | Về `/` | PW | 1280, 375 | Sau T05 |
| F08-KH-05 | AC-2, BR-2 | Như trên | Quay lại `/thu-tuc`; bấm tên trung tâm | Về `/` | PW | 1280, 375 | Sau T05 |
| F08-KH-06 | BR-2 | Như trên | Tab tới liên kết thương hiệu; Enter | Về `/`; liên kết thương hiệu là một `<a>` duy nhất bao biểu tượng + tên + địa bàn (một điểm dừng Tab) | PW | 1280 | Sau T05 |
| F08-KH-07 | AC-3, BR-2 | Bộ A, khổ 375 | Mở `/`; đo thanh điều hướng | Không có nút menu; 3 mục "Trang chủ", "Danh mục", "Lĩnh vực" trên **một hàng**; nhìn thấy cả ba không phải vuốt ngang (`scrollWidth` thanh ≤ `clientWidth`); trang không cuộn ngang | PW | 375 | Sau T05 |
| F08-KH-08 | AC-3 | Như trên | Bấm "Danh mục" | Mở `/thu-tuc`; mục "Danh mục" `aria-current=page` | PW | 375 | Sau T05 |
| F08-KH-09 | AC-3, BR-2 | Khổ 375 | Dùng `getByRole('link', {name: 'Danh mục thủ tục'})`, `{name:'Lĩnh vực và mã QR'}`, `{name:'Trang chủ'}` | Cả ba tìm thấy (tên đọc luôn là nhãn đầy đủ dù nhãn hiện ngắn); chữ nhìn thấy là "Danh mục", "Lĩnh vực" (`innerText` của phần hiện); nhãn ngắn `aria-hidden` | PW + AX | 375 | Sau T05 |
| F08-KH-10 | AC-3 | NVDA hoặc TalkBack, khổ 375 | Đi qua thanh điều hướng | Nghe "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR" (không nghe "Danh mục" rồi "thủ tục" bị lặp) | TAY | 375 | Sau T05 |
| F08-KH-11 | AC-3 | Khổ 600 và 1280 | Đọc chữ hiện ra | Nhãn đầy đủ hiện trên màn hình | PW | 600, 768, 1280, K | Sau T05 |
| F08-KH-12 | BR-2 (biên) | Khổ 320 và phóng 200% (dùng 640×360 với `deviceScaleFactor` 2) | Xem điều hướng | Chữ xuống dòng thay vì tràn; không cuộn ngang trang | PW | 320 | Sau T05 |
| F08-KH-13 | BR-2 | Bộ A | Cuộn trang dài (trang tạm kéo dài bằng khối đệm hoặc dùng trang có nhiều nội dung) | Thanh điều hướng dính đầu màn hình (`position: sticky`, z 10) | PW | 1280, 375 | Sau T05 |
| F08-KH-14 | BR-1 | Chế độ kiosk, khổ 1080×1920 | Mở `/` | Đầu trang, điều hướng, chân trang giống hệt; nhãn đầy đủ; chữ và nút lớn theo kiosk; không cuộn ngang | PW | K | Sau T05 |
| F08-KH-15 | BR-1 | Bộ A | Điều hướng giữa trang bằng bấm, rồi bấm "Quay lại" trình duyệt | Mục đang xem đúng theo trang; đầu/chân trang không nhấp nháy tải lại (không tải lại toàn bộ trang) | PW | 1280 | Sau T05 |
| F08-KH-16 | BR-1 (cuộn) | Bộ A | Sang trang khác bằng điều hướng khi đang cuộn giữa trang | Về đầu trang mới (`ScrollRestoration` theo `pathname`); đổi tham số trên cùng trang (`?x=1`) không nhảy | PW | 1280 | Sau T05 |
| F08-KH-17 | BR-1 | Không có dữ liệu Trung tâm (DB chưa nhập, API 404) | Mở `/` | Đầu trang chỉ còn biểu tượng + điều hướng (liên kết thương hiệu có tên đọc "Trang chủ"); chân trang chỉ còn lời miễn trừ; trang không lỗi trắng (plan B10) | PW | 1280 | Sau T06 |

## 2. Liên kết bỏ qua, bàn phím (BR-12, AC-4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-BQ-01 | AC-4, BR-12 | Bộ A, chuột chưa bấm vào trang | Mở trang; nhấn Tab một lần | Thấy liên kết "Bỏ qua, tới nội dung chính" (hiện ở góc trên, có viền focus); là phần tử đầu tiên nhận focus | PW | 1280, 375 | Sau T05 |
| F08-BQ-02 | AC-4 | Như trên | Nhấn Enter | `document.activeElement` là `<main id="noi-dung">`; trang cuộn tới `main`; địa chỉ không đổi (không thêm `#noi-dung`); `main` không có viền focus; Tab tiếp rơi vào phần tử tương tác đầu tiên trong nội dung | PW | 1280, 375 | Sau T05 |
| F08-BQ-03 | BR-12 | Lần lượt `/`, `/thu-tuc`, `/linh-vuc`, `/abc-xyz` | Tab một lần ở mỗi trang | Liên kết bỏ qua có ở mọi trang kể cả 404, và luôn đầu tiên | PW | 1280 | Sau T05 |
| F08-BQ-04 | BR-12 | Liên kết bỏ qua chưa focus | Đọc vị trí | Ẩn khỏi màn hình khi chưa focus nhưng còn trong cây trợ năng (không `display: none`) | PW + AX | 1280 | Sau T05 |
| F08-BQ-05 | BR-1, BR-12 | Mọi trang | Tab thứ tự đầy đủ | Bỏ qua, biểu tượng + tên, 3 mục điều hướng, nội dung, chân trang (thứ tự DOM = Tab = đọc); sau chân trang chỉ còn nút "Trợ lý" nổi; ô nhập tìm kiếm có viền focus ở khung bao (`:focus-within`), không phải ở `<input>` | PW | 1280, 375 | Sau T06 |
| F08-BQ-06 | AC-4 | Kiosk | Tab, Enter | Như BQ-01/02 | PW | K | Sau T05 |

## 3. Chân trang, 5 mục bắt buộc, ẩn mục trống (BR-3, BR-4, BR-5, AC-5, AC-6, AC-16, AC-19)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-CT-01 | AC-5, BR-3 | Bộ A đã nhập (qua công cụ nhập) | Mở `/`; đọc chân trang | Hiện đúng 5 mục: "Trung tâm thử A", "Người chịu trách nhiệm nội dung: Người thử – Giám đốc (dữ liệu thử)", địa chỉ, điện thoại "0000.000.000", email "thu@example.gov.vn" — đúng như dữ liệu, không thêm bớt chữ | PW | 1280, 375 | Sau T06 + **F01 T07** |
| F08-CT-02 | AC-5, BR-3 | Điện thoại di động hoặc giả lập | Bấm số điện thoại | `href="tel:..."`; không mở tab mới; mở trình gọi đúng số (kiểm `href`; trên thiết bị thật quan sát trình gọi) | PW + TAY (thiết bị thật) | 375 | Sau T06 |
| F08-CT-03 | AC-5 | Bộ A có chức vụ | Đọc dòng người chịu trách nhiệm | Có chức vụ "Giám đốc (dữ liệu thử)" kèm họ tên | PW | 1280 | Sau T06 + F01 T07 |
| F08-CT-04 | AC-5 | Nhập lại bộ A với `chucVu` trống | Đọc dòng | Chỉ "Người chịu trách nhiệm nội dung: Người thử"; không có dấu "–" hay khoảng trắng thừa ở cuối | PW | 1280 | Sau T06 + **F01 T07 (nhập lại)** |
| F08-CT-05 | AC-19, BR-3 | Bộ A có cơ quan chủ quản | Đọc chân trang | Có dòng "Cơ quan chủ quản: UBND phường thử B" | PW | 1280 | Sau T06 + F01 T07 |
| F08-CT-06 | AC-19 | Nhập lại bộ A với cơ quan chủ quản trống | Đọc chân trang | Không có dòng cơ quan chủ quản; không để trống nhãn | PW | 1280 | Sau T06 + F01 T07 |
| F08-CT-07 | AC-6, BR-5 | Bộ B (bản đồ, mạng xã hội, liên kết hữu ích trống) | Đọc chân trang | Không có mục "Xem bản đồ"; không có khối "Mạng xã hội" kể cả tiêu đề; không có khối "Liên kết hữu ích" khi rỗng; không ô trống, không chữ giữ chỗ (như "N/A", "-", "null") | PW | 1280, 375 | Sau T06 + F01 T07 |
| F08-CT-08 | AC-6, BR-5 | Bộ A | Nhập lại với số điện thoại mới "0000.111.222" (không sửa code) | Chân trang hiện số mới ở lần tải trang kế tiếp; `tel:` đổi theo | PW + XU (so `If-None-Match`) | 1280 | **Chờ F01 T07** |
| F08-CT-09 | AC-6 | Bộ A | Thử nhập lại với `email` trống | Công cụ nhập từ chối (F01 AC-6); chân trang giữ dữ liệu cũ | XU/PW | 1280 | **Chờ F01 T07** |
| F08-CT-10 | AC-16, BR-4 | Bộ A | Bấm email | `href="mailto:thu@example.gov.vn"`; không mở tab mới | PW | 1280 | Sau T06 |
| F08-CT-11 | AC-16, BR-4 | Bộ A có bản đồ | Bấm "Xem bản đồ" | Mở tab mới; `rel` có `noopener noreferrer`; trang mới `window.opener === null`; tên đọc có "(mở trang mới)" | PW | 1280 | Sau T06 |
| F08-CT-12 | BR-5 | Bộ D (tên 200 ký tự, địa chỉ 500 ký tự, 15 liên kết) | Xem chân trang | Chữ xuống dòng; không cuộn ngang; chân trang không che nội dung; liên kết hữu ích đủ 15 mục | PW | 375, 1280 | Sau T06 + F01 T07 |
| F08-CT-13 | BR-5 (biên) | Bộ E (link độc hại) | Xem chân trang; Đăng ký `page.on('dialog')`; bấm các mục | Mục `lienKet[0]` hiện như chữ thường (không `<a>`); "Xem bản đồ" không là liên kết; Facebook sai định dạng không là liên kết; không hộp thoại; không điều hướng | PW | 1280 | Sau T06 (chèn tay DB) |
| F08-CT-14 | BR-5 (HTML trong dữ liệu) | Bộ C | Xem chân trang, đầu trang | Hiện đúng chữ `Trung tâm "thử" & <b>C</b>` dạng chữ; DOM không có thẻ `<b>` hay `<script>` sinh từ dữ liệu; không hộp thoại | PW | 1280 | Sau T06 (chèn tay DB) |
| F08-CT-15 | BR-3 | Bộ A | Tìm mọi liên kết trong chân trang | Không có liên kết tới hệ thống quản lý hồ sơ nội bộ của tỉnh (`can-giuoc.md` §4): kiểm danh sách `href` không chứa tên miền cấm do ba-analyst liệt kê; không có dòng nhắc đăng xuất (F09 BR-4) | PW | 1280 | Sau T06 |
| F08-CT-16 | BR-5 | Bộ A | Đọc tên 5 mục bắt buộc trong DOM | Tất cả nằm trong `<footer>`; mỗi khối là `<section>` có `<h2>` | PW + AX | 1280 | Sau T06 |
| F08-CT-17 | AC-6 | Trang chủ, khi `trung-tam` chưa từng nhập; hoặc API trả 404 | Đọc chân trang | Chỉ lời miễn trừ; không "undefined"/"null" | PW (`route` trả 404) | 1280 | Sau T06 |
| F08-CT-18 | AC-6 | Khi API chậm hoặc chưa về | Đọc chân trang | Hiện `Skeleton` trong các khối, lời miễn trừ vẫn hiện. **Từ 2026-10-14**: chân trang ẩn trong lúc trang còn khung chờ (sửa CLS; xem TL-04/N1) nên ca chờ tới khi chân trang hiện rồi mới kiểm lời miễn trừ và khối chờ | PW (`route` chậm) | 375 | Sau T06 |
| F08-CT-19 | BR-5, BR-3 | Mạng xã hội: nhập `zaloOa`, `facebook` | Xem | Mỗi kênh một liên kết ngoài, có tên kênh, `rel="noopener noreferrer"` | PW | 1280 | **Chờ F01 T07** (kênh chính thức: chưa có — câu hỏi mở 14) |
| F08-CT-20 | BR-5, AC-14 | Chân trang | Đọc dòng bản quyền | "© Trung tâm thử A" lấy từ dữ liệu, không ghi năm | PW | 1280 | Sau T06 |

## 4. Ngày cập nhật dữ liệu (BR-6, AC-7)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-NG-01 | AC-7 | Nhập danh mục thủ tục thành công ngày 08/10/2026 (đặt `lan_nhap.thoi_diem` loại `thu-tuc` = `2026-10-08T05:00:00Z`) | Mở `/` | Chân trang ghi "Dữ liệu thủ tục cập nhật ngày 08/10/2026" | PW + XU | 1280 | **Chờ F01 T05** |
| F08-NG-02 | AC-7 | Hôm sau nhập file lỗi | Mở `/` | Vẫn 08/10/2026 (lần nhập lỗi không ghi `lan_nhap`) | XU + PW | 1280 | **Chờ F01 T05** |
| F08-NG-03 | BR-6 | Nhập lại **đúng file cũ** | Mở `/` | Ngày đổi sang ngày nhập lại (F01 BR-7) | XU | — | **Chờ F01 T05** |
| F08-NG-04 | BR-6 (biên múi giờ) | `lan_nhap.thoi_diem` = `2026-10-07T17:00:00Z` và `2026-10-07T16:59:59Z` | `GET /api/trung-tam` | `ngayCapNhatThuTuc` = `2026-10-08` và `2026-10-07` (UTC+7) | XU | — | Sau T01 |
| F08-NG-05 | BR-6 | Chưa nhập thủ tục lần nào (không dòng `thu-tuc`) | Mở `/` | `ngayCapNhatThuTuc` null; chân trang không có dòng ngày; không "Invalid Date" | XU + PW | 1280 | Sau T06 |
| F08-NG-06 | BR-6, AC-7 | Ngày `2026-01-05` | Xem | Hiện "05/01/2026" (2 chữ số ngày/tháng); không phụ thuộc múi giờ trình duyệt (đặt `timezoneId` 'America/Los_Angeles' vẫn 05/01/2026) | PW | 1280 | Sau T06 |

## 5. Lời miễn trừ (BR-7, AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-MT-01 | AC-8, BR-7 | Bộ A | Mở `/`; đọc chân trang | Có đúng câu: "Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia." | PW (so với `common.json`, khoá `mien-tru`) | 1280, 375 | Sau T06 |
| F08-MT-02 | AC-8 | Mở popup chi tiết thủ tục | Cuộn cuối popup | Có lời miễn trừ cùng câu | PW | 1280, 375 | **Chờ F03** |
| F08-MT-03 | AC-8 | Mở khung trợ lý | Xem dưới ô nhập | Có lời miễn trừ cùng câu | PW | 1280, 375 | **Chờ F06** |
| F08-MT-04 | BR-7 | API lỗi (chân trang ở trạng thái lỗi) | Xem | Chỉ lời miễn trừ vẫn hiện | PW | 1280 | Sau T06 |

## 6. Trang không tìm thấy (BR-10, AC-9, AC-10; F00 BR-15, AC-16)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-404-01 | AC-9, BR-10, F00 AC-16 | Bộ A | Gõ thẳng `/abc-xyz` | "Không tìm thấy trang"; nút "Về trang chủ" và nút "Danh mục thủ tục"; có đủ đầu trang, điều hướng, chân trang; HTTP 200 (plan B11) | PW | 1280, 375 | Sau T05 |
| F08-404-02 | AC-9 | Như trên | Bấm "Về trang chủ"; quay lại; bấm "Danh mục thủ tục" | Về `/`; rồi `/thu-tuc` | PW | 1280 | Sau T05 |
| F08-404-03 | BR-10 | Như trên | Đọc loại phần tử hai nút | Là liên kết (`<a>`) trình bày như nút, không phải `<button>` | PW + AX | 1280 | Sau T05 |
| F08-404-04 | BR-10 (biên) | Địa chỉ lạ | Mở: `/abc-xyz/`, `/THU-TUC` (hoa), `/thu-tuc/`, `/%3Cscript%3Ealert(1)%3C/script%3E`, `/a/b/c/d/e/f`, `/..%2f..%2fetc/passwd`, `/` + chuỗi 2.000 ký tự | `/THU-TUC`, `/thu-tuc/` khớp trang danh mục (không phân biệt hoa/thường, bỏ `/` cuối — plan §3.2); các đường dẫn khác → 404 của React; không hiện chữ lấy từ địa chỉ; không lỗi kỹ thuật; không hộp thoại | PW | 1280 | Sau T05 |
| F08-404-05 | BR-10, F00 BR-15 | `/abc-xyz` | `curl -I`, `curl -s` | 200; HTML có `<title>Không tìm thấy trang – Trung tâm thử A</title>` do máy chủ chèn | CURL / XU | — | Sau T02 |
| F08-404-06 | AC-10, BR-10 | Link danh mục có lĩnh vực không còn (ví dụ `/thu-tuc?lv=khong-ton-tai`) | Mở | "Không tìm thấy lĩnh vực" + nút xem toàn bộ danh mục; không lỗi kỹ thuật | PW | 1280, 375 | **Chờ F04** |
| F08-404-07 | AC-10 | Link có mã thủ tục `?ma=9.999999` (không có trong dữ liệu) | Mở | Danh mục hiện bình thường + thông báo "Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng." + nút "Đóng"; không có popup trống | PW | 1280, 375 | **Chờ F03, F04** |
| F08-404-08 | AC-10 | Như trên | Bấm "Đóng" | Địa chỉ không còn tham số mã | PW | 1280 | **Chờ F03, F04** |
| F08-404-09 | AC-10 (bảo mật) | Link có mã sai định dạng: `?ma=abc<b>x</b>`, `?ma=%3Cscript%3Ealert(1)%3C%2Fscript%3E`, `?ma="><img src=x onerror=alert(1)>`, `?ma=` + 5.000 ký tự | Mở từng link; đăng ký `page.on('dialog')` | Cùng thông báo "Không tìm thấy thủ tục này..."; chữ trên địa chỉ không hiện ra trang; không hộp thoại; thông báo không nhắc lại mã | PW | 1280 | **Chờ F03, F04** |
| F08-404-10 | AC-10 | Mọi trường hợp trên | Tìm `Error`, `Exception`, `404`, `undefined`, `stack` trong trang | Không có thông báo kỹ thuật | PW | 1280 | **Chờ F03, F04** |
| F08-404-11 | AC-9, BR-1 | Trang 404 | Chạy axe | 0 lỗi; `<h1>` duy nhất | AX | 375, 1280 | Sau T05 |

## 7. Đang tải, lỗi, không có kết quả (BR-11, AC-11, AC-12, AC-13)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-TL-01 | AC-13, BR-11 | CDP giả lập 3G chậm (~400 kbps, độ trễ 400 ms); bản build | Mở danh mục (`/thu-tuc`) | Đầu trang, điều hướng, chân trang hiện trước; vùng `<main>` hiện khung giữ chỗ và "Đang tải…" tới khi có dữ liệu; đầu và chân trang không biến mất khi chuyển trang | PW | 375 | Sau T05 (nội dung đầy đủ **Chờ F04**) |
| F08-TL-02 | AC-13 | Như trên | Đo thời điểm vẽ header (`performance` / `waitForSelector('header')`) so với tải chunk trang | Header và nav hiện trước khi chunk của trang về (`Suspense` nằm trong `<main>`, không dùng `lazy` của route) | PW | 375 | Sau T05 |
| F08-TL-03 | BR-11 | API `/api/trung-tam` chậm 5 giây (`route.fulfill` trễ) | Mở trang | Đầu trang giữ chiều cao (≥ 60 px) với khung chờ; không nhảy bố cục khi dữ liệu về: **CLS ≤ 0,05** với dữ liệu thật (có ô dịch vụ và giờ làm việc). TL-03c (ghi nhận): dữ liệu rỗng ô/giờ thì khung chờ cao hơn nội dung thật, CLS 0,28/0,13 — không gặp khi vận hành | PW (Layout Instability) | 375, 1280 | Sau T05 |
| F08-TL-04 | AC-11 | Mở `/` (đã tải trung tâm); tắt mạng (`context.setOffline(true)`); danh mục chưa tải lần nào | Bấm "Danh mục thủ tục" | Vùng nội dung: "Chưa tải được dữ liệu…", câu mất kết nối, nút "Thử lại", số điện thoại trung tâm (còn nhờ dữ liệu cũ của TanStack Query); đầu/chân trang vẫn hiện | PW | 1280, 375 | **Chờ F04** |
| F08-TL-05 | AC-11 | Như trên; bật mạng | Bấm "Thử lại" | Chuyển khung chờ rồi hiện danh sách | PW | 1280 | **Chờ F04** |
| F08-TL-06 | AC-11 | Máy chủ ngừng (dừng API) | Làm lại | Cùng thông báo; trang không trắng | PW + TAY | 1280 | **Chờ F04** |
| F08-TL-07 | AC-11, BR-11 | Mở thẳng `/thu-tuc` khi chưa từng tải trung tâm và mất mạng | Xem | Thông báo lỗi nhưng ẩn dòng số điện thoại (không có dữ liệu); không "undefined" | PW | 1280 | **Chờ F04** |
| F08-TL-08 | BR-11 | Chunk trang lỗi tải (chặn `assets/*.js` của trang) | Mở `/thu-tuc` | `LoiTrang` (ErrorState) trong vùng nội dung; đầu/chân trang còn; "Thử lại" tải lại trang; không trang lỗi mặc định của React Router, không lộ thông điệp lỗi | PW | 1280 | Sau T05 |
| F08-TL-09 | AC-12, BR-11 | Danh mục có dữ liệu | Gõ `xyzxyz` trong ô tìm | "Không tìm thấy thủ tục phù hợp với 'xyzxyz'" kèm gợi ý; nội dung còn nguyên ở các phần khác | PW | 1280, 375 | **Chờ F04** |
| F08-TL-10 | AC-12 (bảo mật) | Như trên | Gõ `<b>abc</b>` | Hiện nguyên chữ | PW | 1280 | **Chờ F04** |
| F08-TL-11 | BR-11 | Mỗi trạng thái trên | Chạy axe; kiểm `role=alert` ở lỗi | 0 lỗi; lỗi tự đọc | AX + PW | 1280 | **Chờ F04** |

## 8. Tên, địa bàn, biểu tượng (BR-5, BR-14, AC-14, AC-21)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-TD-01 | AC-14, BR-5, BR-9 | Bộ A | Mở `/thu-tuc` | `document.title` = "Danh mục thủ tục – Trung tâm thử A"; đầu trang có "Trung tâm thử A" và "phường thử B"; **không có chữ "xã"** ở đầu trang | PW | 1280 | Sau T07 + F01 T07 |
| F08-TD-02 | AC-14 | Nhập lại bộ G (Cần Giuộc: "Trung tâm Phục vụ hành chính công xã Cần Giuộc", "xã Cần Giuộc") | Mở `/thu-tuc` | Tab và đầu trang đổi theo, không sửa code | PW | 1280 | **Chờ F01 T07** |
| F08-TD-03 | BR-5 | Bộ F1, F2, F3 | Xem đầu trang | F1 chỉ hiện tỉnh; F2 chỉ hiện xã; F3 ẩn dòng địa bàn; không dấu "–" thừa; không thêm chữ nào | PW | 1280, 375 | Sau T05 + F01 T07 |
| F08-TD-04 | BR-5 | Bộ A | Đọc địa bàn | Mẫu "{{xa}} – {{tinh}}" → "phường thử B – tỉnh thử C"; không tự viết hoa, không ghép "xã"/"tỉnh" | PW | 1280 | Sau T05 |
| F08-TD-05 | BR-5 (biên) | Bộ D (tên 200 ký tự) | Xem đầu trang ở 375 | Tên xuống dòng hoặc cắt trong khung; không cuộn ngang; liên kết vẫn bấm được | PW | 375 | Sau T05 |
| F08-TD-06 | BR-5 (biên) | Bộ C | Xem đầu trang, tab | Chữ hiện nguyên (`"`, `&`, `<b>`), tab ghi đúng | PW | 1280 | Sau T05 |
| F08-TD-07 | AC-21, BR-14 | Chưa có logo thật (file mặc định `logo.svg`) | Mở mọi trang | Có biểu tượng toà nhà hành chính cạnh tên trung tâm; `<img width="40" height="40" alt="">`; không có Quốc huy (kiểm tra bằng mắt + tên file, không có ảnh `quoc-huy`) | PW + TAY | 1280, 375 | Sau T05 |
| F08-TD-08 | AC-21 | Thư mục `app/layout/logo/` | Đếm tệp | Đúng 1 tệp ảnh (`.svg`/`.png`/`.webp`) | SH hoặc VT | — | Sau T05 |
| F08-TD-09 | AC-21 | Thay `logo.svg` bằng ảnh thử (tạm: tệp `.png` 40×40), build, chạy lại | Mở mọi trang | Ảnh thử hiện ở đầu mọi trang; tên tệp trong HTML có hash đổi; không sửa dòng mã | PW (build) | 1280 | Sau T05 (làm tay, một lần) |
| F08-TD-10 | BR-14 | Logo | Kiểm `img-src` | Logo cùng nguồn (`/assets/...`), CSP `img-src 'self' data:` không bị vi phạm | PW | 1280 | Sau T05 |
| F08-TD-11 | BR-14 | Chưa có dữ liệu Trung tâm | Xem đầu trang | Vẫn có biểu tượng | PW | 1280 | Sau T05 |

## 9. Liên kết hữu ích (BR-3, AC-15)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-LK-01 | AC-15 | Nhập đúng các dòng "Chân trang" ở `lien-ket.md` §1 (bộ A với địa chỉ giả cùng tên) | Mở `/` | Chân trang có đủ: Cổng Dịch vụ công Quốc gia, cổng thông tin điện tử của xã, của tỉnh, đúng thứ tự `thu_tu` | PW | 1280 | Sau T06 + F01 T07 |
| F08-LK-02 | AC-15 | Như trên | Bấm từng liên kết (bắt trang mới) | Mỗi liên kết mở tab mới, đúng địa chỉ trong dữ liệu, `rel="noopener noreferrer"`, `window.opener === null`, có "(mở trang mới)" | PW | 1280 | Sau T06 |
| F08-LK-03 | AC-15 | Như trên | Tìm liên kết tới hệ thống quản lý hồ sơ nội bộ của tỉnh | Không có | PW | 1280 | Sau T06 |
| F08-LK-04 | AC-15 | Dữ liệu thật (bộ G) | Đối chiếu địa chỉ với `lien-ket.md` §1 dòng "Chân trang" | Khớp từng địa chỉ | PW | 1280 | **Chờ F01 T07** |
| F08-LK-05 | BR-3 | Bộ A | Bàn phím | Mỗi liên kết có viền focus trắng, Enter mở tab mới | PW | 1280 | Sau T06 |

## 10. Tiêu đề tab và dữ liệu đặc tả (BR-9, BR-13, AC-17, AC-18, AC-20)

Mỗi ca ghi rõ cách H (mở thẳng, đọc HTML máy chủ trả) và/hoặc D (đi tới bằng điều hướng, đọc DOM).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-DT-01 | AC-17, BR-9 | Bộ A | (H) Lấy HTML của `/`, `/thu-tuc`, `/linh-vuc`, `/abc-xyz` | `<title>` lần lượt "Trang chủ – Trung tâm thử A", "Danh mục thủ tục – Trung tâm thử A", "Lĩnh vực và mã QR – Trung tâm thử A", "Không tìm thấy trang – Trung tâm thử A"; bốn tiêu đề khác nhau | XU / CURL | — | Sau T02 + F01 T07 |
| F08-DT-02 | AC-17 | Bộ A | (D) Mở `/`, bấm lần lượt qua 3 mục điều hướng, rồi `/abc-xyz`; đọc `document.title` | Cùng 4 tiêu đề như DT-01 | PW | 1280 | Sau T07 |
| F08-DT-03 | AC-17 | Mọi trang | Chạy axe | Không báo thiếu tiêu đề trang (`document-title`) hoặc thiếu ngôn ngữ (`html-has-lang`, `html-lang-valid`); `<html lang="vi">` | AX | 375, 1280 | Sau T07 |
| F08-DT-04 | AC-18, BR-13 | Bộ A | (H) Lấy HTML của `/` và `/thu-tuc` | Đủ thẻ theo plan §3.3: `<title>`, `DC.title`, `og:title` (= tiêu đề trang); `description`, `DC.description`, `og:description` (mô tả một câu của trang, plan B7); `DC.creator` = "Trung tâm thử A"; `DC.publisher` = "UBND phường thử B"; `DC.date` = `2026-10-08`; `DC.identifier` và `og:url` = `https://<host>/thu-tuc` (không query); `schema.DC` link; `DC.language` = vi; `og:type` = website. Không thẻ nào `content` rỗng | XU / CURL | — | Sau T02 + F01 |
| F08-DT-05 | AC-18 | Bộ A | (D) Đi tới `/thu-tuc` bằng điều hướng; đọc `<head>` | Cùng tập thẻ, cùng giá trị như DT-04 cho cùng trang (so sánh khoá-giá trị với kết quả H); không thẻ trùng (mỗi `DC.title` đúng 1) | PW | 1280 | Sau T07 |
| F08-DT-06 | AC-18 | Như trên | So H và D cho 4 trang | Hai cách trùng nhau (rủi ro 4) | PW + XU | 1280 | Sau T07 |
| F08-DT-07 | AC-19, BR-13 | Bộ A có cơ quan chủ quản | (H) và (D) | `DC.publisher` = "UBND phường thử B" | XU + PW | — | Sau T02 |
| F08-DT-08 | AC-19 | Nhập lại với cơ quan chủ quản trống | (H) và (D) | `DC.publisher` = "Trung tâm thử A" (không trống) | XU + PW | — | **Chờ F01 T07** |
| F08-DT-09 | AC-18, BR-13 | Chưa có `lan_nhap` loại `thu-tuc` | (H) | Không có thẻ `DC.date` (plan §3.3); **ghi vào lỗi/mơ hồ nếu spec "không yếu tố nào trống" mâu thuẫn** | XU | — | Sau T02 |
| F08-DT-10 | AC-20, BR-9 | Bộ A + thủ tục 1.001193 "Thủ tục đăng ký khai sinh" đã nhập | Ở `/`, mở popup thủ tục 1.001193 | `document.title` = "Thủ tục đăng ký khai sinh" | PW | 1280, 375 | **Chờ F03** |
| F08-DT-11 | AC-20 | Như trên | Đóng popup | Tiêu đề về "Trang chủ – Trung tâm thử A" như trước khi mở | PW | 1280 | **Chờ F03** |
| F08-DT-12 | AC-20, BR-13 | Như trên | (H) Lấy HTML của `/?ma=1.001193` và `/` | Hai HTML **giống hệt nhau** (so chuỗi); phần xem trước (`og:title`, `og:description`) là của trang chủ, không có tên thủ tục | XU / CURL | — | Sau T02 (ca HTML chạy được không cần F03) |
| F08-DT-13 | AC-20 | Zalo | Gửi link `https://<tên miền thật>/?ma=1.001193` qua Zalo | Phần xem trước có tiêu đề và mô tả của trang chủ, không tên thủ tục, giống khi gửi link trang chủ không mã | TAY | — | Triển khai thật (giai đoạn 8) |
| F08-DT-14 | AC-20, BR-9 | Popup đang mở | Đọc `DC.title`, `og:title` trong `<head>` | Vẫn là tiêu đề của trang (không đổi theo popup) | PW | 1280 | **Chờ F03** |
| F08-DT-15 | BR-9 | Dữ liệu về trễ khi popup đang mở | Mở popup trước khi `/api/trung-tam` về | Tiêu đề tạm (tên thủ tục) không bị ghi đè khi dữ liệu về | PW | 1280 | **Chờ F03** |
| F08-DT-16 | BR-13 (bảo mật) | Bộ C (`<script>`, `"`, `&`) | (H) Lấy HTML `/` | Giá trị đã mã hoá HTML: `&lt;script&gt;`, `&quot;`, `&amp;`; không còn chuỗi `<script>alert(1)</script>` nguyên dạng trong `<head>`; không thuộc tính bị thoát khỏi `content="..."` | XU / CURL | — | Sau T02 |
| F08-DT-17 | BR-13 (bảo mật) | Bất kỳ | (H) `GET /?ma="><script>alert(1)</script>`; `GET /thu-tuc?q=<img src=x onerror=alert(1)>`; `GET /<script>` | Chuỗi từ query/đường dẫn không xuất hiện trong HTML; `DC.identifier` và `og:url` không chứa query | XU / CURL | — | Sau T02 |
| F08-DT-18 | BR-13 (bảo mật) | Bất kỳ | Gửi `Host: evil.example"><script>x</script>` (qua `HttpClient` với `Host` tuỳ ý) | `DC.identifier`/`og:url` mã hoá HTML, không tạo được thẻ script; (ghi nhận: khi triển khai cần `AllowedHosts` — plan §6) | XU | — | Sau T02 |
| F08-DT-19 | BR-13 | DB ngừng/chậm | (H) Lấy HTML `/` | Vẫn 200, khối mặc định (title/description mặc định); trang không hỏng | XU (service lỗi, `ReadyTimeout`) | — | Sau T02 |
| F08-DT-20 | BR-13 | Bộ A | (H) Lấy `/thu-tuc` hai lần trong 30 giây; giữa hai lần đổi DB | Lần hai vẫn dữ liệu cũ (cache `Caching:DacTaTrang`); sau khi vượt thời hạn (đặt cấu hình thử 1 giây) lấy mới | XU | — | Sau T02 |
| F08-DT-21 | BR-9 | Mọi trang | `<html lang>` | `vi` trong HTML trả từ máy chủ (H) | CURL | — | Sau T04 |
| F08-DT-22 | BR-13 | `index.html` bản build | Kiểm dấu đánh dấu | `<!--dac-ta-->` và `<!--/dac-ta-->` còn; `dac-ta-trang.json` có 3 trang + `khongTimThay`; không script/style inline | SH | — | Sau T04 |
| F08-DT-23 | BR-13 | `dac-ta-trang.json` | `curl` | Công khai, toàn chữ công khai; không dữ liệu nhạy cảm | CURL | — | Sau T04 |
| F08-DT-24 | BR-13 | Bộ A | Đọc `description` của 4 trang | Mỗi trang một câu; không chứa tên đơn vị (tên đã có trong tiêu đề) | XU/PW | — | Sau T04 |
| F08-DT-25 | BR-13 (biên) | `/THU-TUC/` | (H) | Khớp trang danh mục: `DC.identifier` ghi đường dẫn đã chuẩn hoá hoặc đường dẫn gốc (ghi nhận hành vi), không lỗi | XU | — | Sau T02 |

## 11. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-TN-01 | AC-17, BR-1 | Bộ A, bốn trang | Chạy axe | 0 vi phạm (tương phản, tên nút/liên kết, landmark, ngôn ngữ, tiêu đề) | AX | 375, 1280, K | Sau T07 |
| F08-TN-02 | BR-1 | Mọi trang | Đếm landmark | Đúng một `banner` (`<header>`), một `navigation` có tên "Điều hướng chính" (trang có danh sách phân trang có thêm một `nav` tên "Phân trang" — hợp lệ, mọi `nav` có tên riêng), một `main`, một `contentinfo` (`<footer>`) | PW + AX | 1280 | Sau T06 |
| F08-TN-03 | BR-1 | Mọi trang | Đếm `<h1>` | Mỗi trang đúng một `<h1>`; thứ tự `h1` → `h2` không nhảy cấp (chân trang dùng `<h2>`) | PW + AX | 1280 | Sau T06 |
| F08-TN-04 | AC-4 | Bàn phím | Tab thứ tự toàn trang ở 3 trang | Thứ tự logic; không bẫy; viền focus nhìn thấy kể cả chân trang nền xanh (viền trắng) | PW | 1280, 375 | Sau T06 |
| F08-TN-05 | BR-2 (WCAG 2.5.3) | Khổ 375 | Với mỗi mục điều hướng, tên đọc có chứa chữ nhìn thấy | "Danh mục thủ tục" chứa "Danh mục"; "Lĩnh vực và mã QR" chứa "Lĩnh vực" | PW | 375 | Sau T05 |
| F08-TN-06 | AC-3 | NVDA, khổ 375 | Đi qua điều hướng bằng Tab và bằng mũi tên | Nghe nhãn đầy đủ; mục hiện tại nghe "trang hiện tại" | TAY | 375 | Sau T05 |
| F08-TN-07 | BR-1 (WCAG 1.4.10) | 320×568 và phóng 200% | Xem 3 trang | Không cuộn ngang; không mất nội dung | PW | 320 | Sau T06 |
| F08-TN-08 | BR-1 (WCAG 1.4.12) | Chèn CSS giãn chữ (`line-height 1.5`, `letter-spacing .12em`, `word-spacing .16em`) | Xem đầu/chân trang | Không bị cắt, không chồng nhau | PW | 375, K | Sau T06 |
| F08-TN-09 | BR-1 | Tương phản chân trang (chữ trắng trên `#074a90`) | Đo | ≥ 4,5:1; liên kết trong chân trang phân biệt được (gạch chân hoặc dấu hiệu khác ngoài màu) | AX + PW | 1280 | Sau T06 |
| F08-TN-10 | BR-1 | Đen trắng (achromatopsia) | Xem điều hướng và chân trang | Phân biệt được mục đang xem; liên kết nhận ra được | TAY | 1280 | Sau T06 |
| F08-TN-11 | AC-3 | TalkBack/VoiceOver thật | Điều hướng ở 375 | Như TN-06 | TAY | 375 | Sau T05 |
| F08-TN-12 | BR-12 | Trình đọc màn hình | Nhấn Tab đầu; nghe | Đọc "Bỏ qua, tới nội dung chính"; Enter → đọc nội dung `main` | TAY | 1280 | Sau T05 |
| F08-TN-13 | BR-1 (kiosk) | Kiosk 1080×1920; vòng Tab trong popup có nút "Bắt đầu lại" (C01 BR-9, AC-24) | Mở popup chi tiết bằng bàn phím (khi F03 và F09 có) ; Tab liên tục | Focus đi qua phần tử trong popup, tới "Bắt đầu lại" cuối vòng rồi về đầu; Shift+Tab từ đầu → "Bắt đầu lại"; không ra trang sau | PW | K | **Chờ F03, F09** (phần lõi chạy bằng nút giả ở C01-PP-16) |
| F08-TN-14 | BR-1 (kiosk) | Kiosk | Đo chỗ chừa cuối chân trang | Chân trang có đệm dưới ≥ `--fab-clearance` (kiosk ≥ 96 px = 16 + 80); cuối trang cuộn tới đáy không bị nút Trợ lý/"Bắt đầu lại" che chữ | PW (chồng lấn hộp bao) | K, 375 | Sau T06 (nút thật **Chờ F06, F09**; kiểm bằng nút giả của C01) |

## 12. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-BM-01 | CLAUDE.md | Bản build chạy bằng API (HTTPS) | `curl -sI https://localhost:7157/` | Đủ: `Content-Security-Policy` đúng nguyên văn (default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'); `Strict-Transport-Security`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server` | CURL | — | Sau T07 |
| F08-BM-02 | CLAUDE.md | Như trên | `curl -sI` cho `/thu-tuc`, `/abc-xyz`, `/api/trung-tam`, `/assets/<js>` | Cùng bộ header ở mọi response (kể cả 404 ProblemDetails và 304) | CURL / XU | — | Sau T01, T07 |
| F08-BM-03 | CLAUDE.md | Bản build | Mở 4 trang bằng Playwright; bắt `console` và `securitypolicyviolation` | Không lỗi vi phạm CSP | PW | 375, 1280 | Sau T07 |
| F08-BM-04 | CLAUDE.md | Như trên | `document.querySelectorAll('script:not([src])').length`; `[style]` trong HTML trả về; thẻ `<style>` | 0 script inline; không thuộc tính `style` trong HTML máy chủ trả (H); không `<style>` chèn lúc chạy; khối `<!--dac-ta-->` chỉ có `<title>`, `<meta>`, `<link rel=schema.DC>` | PW + CURL | 1280 | Sau T07 |
| F08-BM-05 | CLAUDE.md | Như trên | `page.on('request')` suốt khi mở 4 trang | Mọi request cùng gốc; không request nào tự gọi ra tên miền ngoài (kể cả `purl.org` của `schema.DC`: thẻ này không tải gì); không font ngoài | PW | 1280 | Sau T07 |
| F08-BM-06 | CLAUDE.md | Bản build | `find wwwroot -name '*.map' -o -name '*.pdb'`; kiểm bản publish API | Không `.map`, không `.pdb`; không `sourceMappingURL` trong JS | SH | — | Sau T07 |
| F08-BM-07 | plan §6 | `GET /api/trung-tam` | So tập khoá JSON với danh sách cho phép | Chỉ các trường của §3.1 (`oDichVu[]` chỉ có `ten`, `bieuTuong`, `url`: `moTa` không còn trong phản hồi); không có `maDonViCongDvc`, `id`, `thuTu`, `tenFile`, thời điểm nhập có giờ | XU | — | Sau T01 |
| F08-BM-08 | plan §6, CLAUDE.md | Bộ A | Mọi liên kết ra ngoài trên 3 trang | Có `rel` đúng `noopener noreferrer` (hoặc chứa cả hai), có `target="_blank"`; `tel:`/`mailto:` không `target` | PW | 1280 | Sau T06 |
| F08-BM-09 | plan §6 | Bộ E | Link `javascript:`/`data:` trong dữ liệu | Hiện chữ thường, không điều hướng, không hộp thoại | PW | 1280 | Sau T06 |
| F08-BM-10 | plan §6 | Bộ C | Nội dung có HTML trong dữ liệu | React hiển thị dạng chữ; `dangerouslySetInnerHTML` không có trong mã (`npm run lint`) | PW + SH | 1280 | Sau T06 |
| F08-BM-11 | CLAUDE.md | `/api/trung-tam` | Gửi liên tục 350 yêu cầu trong 1 phút từ một IP (không gửi `If-None-Match`) | Vượt 300/phút → 429 ProblemDetails `code=qua-nhieu-yeu-cau`, có `Retry-After`; không stack trace | XU / PW (`APIRequestContext`) | — | Sau T01 |
| F08-BM-12 | CLAUDE.md, plan §6 | Như BM-11 | Trong lúc API bị 429, mở `/` | Trang HTML vẫn mở (không 429 cho HTML); đầu/chân trang hiện trạng thái lỗi nhã nhặn (số điện thoại, "Thử lại") nếu chưa có dữ liệu; console không lỗi chưa xử lý | PW | 1280 | Sau T06 |
| F08-BM-13 | plan §6 | HTML trang | 400 yêu cầu `GET /` trong 1 phút | Không 429 (không gắn giới hạn cho HTML) | XU | — | Sau T02 |
| F08-BM-14 | CLAUDE.md | `POST /api/trung-tam`, `PUT`, `DELETE` | Gửi | 405 `phuong-thuc-khong-hop-le` ProblemDetails, không stack trace | XU | — | Sau T01 |
| F08-BM-15 | CLAUDE.md | `GET /api/trung-tam?x=1&x=2` | Gửi vài trăm query khác nhau | Query lạ bị bỏ qua; ghi nhận rủi ro 9 (nhiều bản output cache); không lỗi 500 | XU | — | Sau T01 |
| F08-BM-16 | CLAUDE.md | Lỗi giả (DB ngừng) | Gọi `/api/trung-tam`; gọi `/` | API: 500 ProblemDetails `loi-he-thong` + `maTraCuu`, không chuỗi kết nối/stack; HTML: 200 khối mặc định; log không ghi dữ liệu cá nhân | XU | — | Sau T01, T02 |
| F08-BM-17 | CLAUDE.md | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | Sau T07 |
| F08-BM-18 | plan §6 | Họ tên người chịu trách nhiệm | Xác nhận | Hiện công khai theo TT 22/2023; ghi nhận thêm nhắc ba-analyst về `design-system.md` §5 ghi "không ghi họ tên" (mâu thuẫn tài liệu, không phải lỗi mã) | Xem tài liệu | — | Sau T06 |

## 13. Hiệu năng

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-HN-01 | CLAUDE.md, plan §5 | `npm run build` | Mở `/` ở 375, ghi mọi `.js`; gzip từng tệp; cộng | ≤ 200 KB gzip (tham chiếu ~124,6 KB trước F08; F08 thêm ước 6–10 KB; C01 thêm ≤ 15 KB). Báo bảng từng chunk trước/sau | SH + PW | 375 | Sau T07 |
| F08-HN-02 | CLAUDE.md | Bản build chạy API | Lighthouse mobile cho `/` | Performance ≥ 85; CLS ≤ 0,1; không tải font | LH | 375 | Sau T07 (trang chủ đầy đủ **Chờ F02**) |
| F08-HN-03 | CLAUDE.md | Như trên | Lighthouse mobile cho `/thu-tuc` | ≥ 85 | LH | 375 | **Chờ F04** (hiện là trang tạm: ghi nhận số đo nền) |
| F08-HN-04 | CLAUDE.md | `GET /api/trung-tam`, bộ A | 100 lần gọi tuần tự; tính p95 (trạng thái 200 và 304) | p95 ≤ 300 ms | XU / script đo | — | Sau T01 |
| F08-HN-05 | plan §5 | Như trên | Gọi với `If-None-Match` đúng | 304, thân rỗng | XU | — | Sau T01 |
| F08-HN-06 | plan §5 | HTML trang | 100 lần `GET /thu-tuc`; tính p95 | p95 ≤ 300 ms (đọc 2 tệp + bộ nhớ đệm, không truy vấn DB mỗi lần) | XU | — | Sau T02 |
| F08-HN-07 | plan §5 | Một `GET /api/trung-tam` khi cache nóng | Đếm câu SQL (bật logging EF trong test) | Cache hit: tối đa 1 truy vấn (phiên bản dữ liệu); cache miss: 5 truy vấn theo khoá chính | XU | — | Sau T01 |
| F08-HN-08 | plan §5 | Mạng chậm | Header/nav hiện trước chunk trang (TL-02) | Ghi thời điểm hiển thị đầu trang (FCP) trên 3G chậm | PW | 375 | Sau T05 |
| F08-HN-09 | plan §5 | Kích thước JSON `/api/trung-tam` | `curl --compressed` | Khoảng 1,5 KB trước nén; Brotli bật (`Content-Encoding: br`) | CURL | — | Sau T01 |
| F08-HN-10 | plan §5 | Biểu tượng | Đọc thuộc tính | `width`/`height` khai; SVG/WebP | PW | 1280 | Sau T05 |

## 14. Kiểm tích hợp với PostgreSQL thật (XU)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/ThongTinTrungTam/`. Dữ liệu: bộ A, B, F cài trực tiếp vào bảng (không phụ thuộc công cụ nhập), thêm ca "qua công cụ nhập" khi F01 T05/T07 sẵn sàng.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-IT-01 | BR-3, BR-5 | Bộ A trong DB | `GET /api/trung-tam` | 200; JSON camelCase; `dienThoai` ở gốc; trường null vẫn có mặt; giờ "HH:mm"; ngày "yyyy-MM-dd" | XU | — | Sau T01 |
| F08-IT-02 | BR-3 | Bộ A | Đọc `lienKet`, `oDichVu`, `gioLamViec` | Đúng thứ tự `thu_tu`/`thu`; chỉ ngày làm việc | XU | — | Sau T01 |
| F08-IT-03 | BR-6 | `lan_nhap` loại `thu-tuc` | Đọc `ngayCapNhatThuTuc` | Đổi sang UTC+7 (xem F08-NG-04) | XU | — | Sau T01 |
| F08-IT-04 | AC-6 | Bộ A rồi cập nhật `trung_tam.dien_thoai` và phiên bản dữ liệu | Gọi hai lần | Lần hai thấy số mới (cache theo phiên bản); `ETag` đổi; `If-None-Match` cũ → 200 | XU | — | Sau T01 + F00 T18 |
| F08-IT-05 | BR-10 (B10) | DB trống | `GET /api/trung-tam` | 404 `khong-tim-thay` + `maTraCuu`; HTML `/` vẫn 200 khối mặc định | XU | — | Sau T01, T02 |
| F08-IT-06 | AC-19, BR-13 | Bộ A có/không cơ quan chủ quản | Đọc HTML (H) | `DC.publisher` đúng (xem DT-07/08) | XU | — | Sau T02 |
| F08-IT-07 | AC-5, AC-6 | Qua công cụ nhập: nhập bộ A, nhập lại với số mới, nhập lại với `chucVu` trống | Gọi API sau mỗi lần nhập | Dữ liệu API đổi theo | XU (gọi `Import` qua tiến trình) | — | **Chờ F01 T07** |
| F08-IT-08 | AC-7 | Nhập `thu-tuc` thành công; nhập file lỗi | Gọi API | Ngày không đổi sau lần lỗi | XU | — | **Chờ F01 T05** |

## 15. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F08-KH-01…03, KH-14, KH-15, KH-17, BQ-05, TN-01…04 |
| BR-2 | F08-KH-04…12, KH-13, TN-05 |
| BR-3 | F08-CT-01…06, CT-15, LK-01…05, IT-01…02 |
| BR-4 | F08-CT-02, CT-10, CT-11, LK-02 |
| BR-5 | F08-CT-07, CT-12…14, CT-20, TD-01, TD-03…06 |
| BR-6 | F08-NG-01…06, IT-03 |
| BR-7 | F08-MT-01…04 |
| BR-8 | Chưa gắn nhãn EMC (chờ câu hỏi mở 19): F08-KH-18 dưới đây |
| BR-9 | F08-DT-01…03, DT-10, DT-11, DT-14, DT-15, DT-21 |
| BR-10 | F08-404-01…11 |
| BR-11 | F08-TL-01…11 |
| BR-12 | F08-BQ-01…06, TN-12 |
| BR-13 | F08-DT-04…25 |
| BR-14 | F08-TD-07…11 |
| AC-1 | F08-KH-01…03 |
| AC-2 | F08-KH-04, KH-05 |
| AC-3 | F08-KH-07…11, TN-06 |
| AC-4 | F08-BQ-01, BQ-02 |
| AC-5 | F08-CT-01…04 |
| AC-6 | F08-CT-07, CT-08, CT-09 |
| AC-7 | F08-NG-01, NG-02 |
| AC-8 | F08-MT-01…03 |
| AC-9 | F08-404-01, 404-02 |
| AC-10 | F08-404-06…10 |
| AC-11 | F08-TL-04…07 |
| AC-12 | F08-TL-09, TL-10 |
| AC-13 | F08-TL-01, TL-02 |
| AC-14 | F08-TD-01…03, CT-20 |
| AC-15 | F08-LK-01…04 |
| AC-16 | F08-CT-10, CT-11 |
| AC-17 | F08-DT-01…03 |
| AC-18 | F08-DT-04…06, DT-09 |
| AC-19 | F08-CT-05, CT-06, DT-07, DT-08 |
| AC-20 | F08-DT-10…15 |
| AC-21 | F08-TD-07…10 |
| F00 AC-16 | F08-404-01, 404-05 |

Ca bổ sung cho BR-8:

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F08-KH-18 | BR-8 | Bộ A | Tìm nhãn EMC hoặc mã giám sát trong chân trang/HTML | Chưa có (chỉ gắn khi đơn vị CNTT chốt cách làm, câu hỏi mở 19); không có chỗ trống hay chữ giữ chỗ | PW | 1280 | Sau T06 |

## 16. Tóm tắt

- Chạy ngay (sau T05–T07): nhóm KH, BQ, TD, TN, BM, phần HTML của DT (cần T02).
- Chờ F01 T05/T07: các ca "nhập lại", ngày cập nhật, dữ liệu thật bộ G.
- Chờ F03/F04/F06/F09: MT-02, MT-03, 404-06…10, TL-04…07, TL-09…11, DT-10, DT-11, DT-14, DT-15, TN-13.
- Thử tay: KH-10, TN-06, TN-10…12, CT-02 (thiết bị thật), DT-13 (Zalo, cần tên miền thật).
- Tổng số ca đã viết: 167 (kể cả F08-KH-18). Kết quả: xem `result/test.md` (chạy 2026-10-12).

## Cập nhật lượt xác nhận (2026-10-14)

- Ca mới **F08-TL-04** (BR-11, AC-13): API chậm 3 giây ở `/thu-tuc` — trong lúc còn khung chờ, **chân trang (kèm lời miễn trừ) phải hiện** trong 1,5 giây (PW, 375). **Trượt** từ 2026-10-14 vì `Layout` ẩn chân trang khi có khung chờ (cách sửa CLS); xung đột giữa spec và thiết kế, chờ quyết định (lỗi N1 ở `result/test.md`). Ca **F08-TL-03c** (ghi nhận): CLS với dữ liệu rỗng ô/giờ.
- Các ca CT-18, BQ-05, TN-02, BM-07, TL-03 đã chỉnh như ghi trong bảng. Ca F02-BN-06, F02-BC-01, F04-TL-01, F05-TL-01 cũng đã bỏ đòi hỏi "chân trang hiện ngay lúc chờ" (xem N1).
