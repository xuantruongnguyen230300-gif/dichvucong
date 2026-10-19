---
id: F09
ten: Kiosk dùng chung
trang_thai: dang-lam
nguon: Yêu cầu của người dùng ngày 2026-10-08; câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 15, 16, 22, 24, 31, 37); quyết định của người dùng ngày 2026-10-13 (câu hỏi mở 42: "Bắt đầu lại" tải lại trang, lịch sử kiosk, tên miền Cổng DVC)
---

# F09 · Kiosk dùng chung

> **Đổi nghiệp vụ 2026-10-12 (câu hỏi mở 15):** kiosk không tự làm mới. Bỏ toàn bộ quy tắc của bản trước về đếm thời gian không thao tác, cảnh báo "Bạn còn dùng không?", đếm ngược và tự làm mới.

## Mục tiêu

Nhiều người lần lượt dùng một kiosk cảm ứng tại trung tâm. Trang hiện vừa màn hình kiosk, nhắc người dân đăng xuất khi sang Cổng DVC, và có nút "Bắt đầu lại" để xoá những gì người trước đã xem, đã hỏi.

## Phạm vi

- Trong:
  - Chế độ kiosk, chỉ bật trên máy kiosk tại trung tâm.
  - Hiển thị cho màn hình kiosk: chữ và nút lớn hơn (C01 BR-1), danh sách thủ tục mặc định dạng thẻ (F03 BR-6).
  - Dòng nhắc đăng xuất, một dòng ở mỗi nơi có liên kết tới Cổng DVC Quốc gia (BR-4).
  - Giới hạn câu hỏi trợ lý khi nhiều người dùng chung kiosk (BR-5).
  - Nút "Bắt đầu lại", chỉ có ở chế độ kiosk (BR-7).
- Ngoài:
  - Tự làm mới khi không ai thao tác, cảnh báo, đếm ngược (bỏ — câu hỏi mở 15). Nút "Bắt đầu lại" không bao giờ tự chạy.
  - Đóng hoặc đăng xuất trang của đơn vị khác thay người dân: trang tra cứu không làm được.
  - Cấu hình máy và trình duyệt kiosk: ghi trong hướng dẫn vận hành (BR-6), không phải chức năng của trang.
  - QR hoặc link chia sẻ riêng cho từng thủ tục để mang từ kiosk về điện thoại — không làm, giống Vàm Cỏ; người dân dùng QR theo lĩnh vực của F05 (câu hỏi mở 24).
  - Chữ lớn, đọc to cả trang.

## Quy tắc nghiệp vụ

- BR-1: Chế độ kiosk do kỹ thuật bật khi cài máy, bằng link kiosk riêng. Đã bật thì giữ nguyên sau khi tải lại trang. Điện thoại và máy tính thường không ở chế độ kiosk.
- BR-2: Không tự làm mới. Không ai thao tác thì màn hình giữ nguyên: trang đang xem, từ khoá, bộ lọc, popup, hội thoại trợ lý. Không có cảnh báo, không đếm ngược (câu hỏi mở 15).
- BR-3: Hệ quả của BR-2, phải biết khi vận hành: người trước không bấm "Bắt đầu lại" (BR-7) thì người sau thấy những gì người trước để lại trên màn hình, kể cả câu đã gõ vào trợ lý. Câu đó có thể chứa số CCCD, số điện thoại, email; trang không tự xoá. Che thông tin cá nhân ở F06 BR-8 chỉ áp dụng cho dữ liệu lưu lại, không áp dụng cho hội thoại đang hiện trên màn hình.
- BR-4: Nhắc đăng xuất — chỉ ở chế độ kiosk (câu hỏi mở 22):
  - "Liên kết tới Cổng DVC" là liên kết có đích thuộc tên miền dichvucong.gov.vn hoặc tên miền con của nó (`*.dichvucong.gov.vn`), người dùng chốt 2026-10-13 (câu hỏi mở 42). `dichvucong.tayninh.gov.vn` không tính: tên miền không tồn tại, không dùng (`lien-ket.md` §1, mục "Đã bỏ").
  - Cách nhận diện đích: lấy tên máy của địa chỉ, đổi sang chữ thường, bỏ dấu chấm ở cuối. Tên máy đúng bằng `dichvucong.gov.vn` hoặc kết thúc bằng `.dichvucong.gov.vn` thì tính. Mọi trường hợp khác không tính, kể cả địa chỉ chỉ có chữ "dichvucong.gov.vn" ở chỗ khác: `dichvucong.gov.vn.evil.com`, `https://dichvucong.gov.vn@evil.com` (tên máy là `evil.com`), `evildichvucong.gov.vn`, tên máy có chữ lạ giống chữ Latinh (vd. chữ "с" Cyrillic thay chữ "c"), địa chỉ không phân tích được. Cổng không phải 443 vẫn tính theo tên máy.
  - Các nơi có liên kết tính vào quy tắc này: "Xem và nộp trên Cổng DVC" (F03 BR-4), ô dịch vụ tới Cổng DVC (F02), liên kết trong câu trả lời của trợ lý (F06 BR-6, BR-9). Dữ liệu thủ tục không có trường liên kết riêng — liên kết "Xem và nộp" luôn trỏ `dichvucong.gov.vn`. Tên miền con chỉ có thể xuất hiện ở ô dịch vụ (dữ liệu F01) hoặc liên kết trong câu trả lời mẫu của trợ lý.
  - Dòng nhắc "Nhớ đăng xuất khi dùng xong", **một dòng mỗi nơi**, người dân thấy trước khi bấm:
    - Một dòng phía trên danh sách thủ tục (dạng thẻ hoặc bảng) của F03, F04.
    - Một dòng trong popup chi tiết, cạnh liên kết "Xem và nộp trên Cổng DVC".
    - Một dòng phía trên các ô dịch vụ (F02), chỉ khi có ít nhất một ô trỏ tới Cổng DVC (đích thuộc dichvucong.gov.vn).
    - Một dòng trong khung trợ lý, khi hội thoại có câu trả lời chứa liên kết tới Cổng DVC; một dòng cho cả khung, không lặp ở từng câu trả lời.
  - Không lặp dòng nhắc trên từng thẻ, từng dòng bảng, từng ô. Chân trang không có dòng nhắc.
  - Bấm liên kết vẫn mở Cổng DVC ngay theo C01 BR-3, không thêm bước xác nhận.
  - Liên kết tới tên miền khác (cổng thông tin điện tử của xã, của tỉnh) không tính. Ngoài chế độ kiosk không có dòng nhắc.
- BR-5: Giới hạn câu hỏi trợ lý theo F06 BR-5: 60 câu mỗi phút cho mỗi địa chỉ mạng. Nhiều người lần lượt dùng chung một kiosk được tính chung một giới hạn (câu hỏi mở 16).
- BR-6: Cấu hình máy kiosk — ghi vào hướng dẫn vận hành, không phải chức năng của trang (câu hỏi mở 22):
  - Trình duyệt kiosk chạy chế độ ẩn danh, tự xoá phiên khi đóng tab.
  - Cán bộ kiểm tra kiosk cuối ngày.
  - Ẩn nút "Quay lại" của trình duyệt kiosk (hoặc dùng chế độ kiosk của trình duyệt không có nút này). Ở kiosk, nút này không đi giữa các trang của trang web (BR-8), nên để hiện chỉ gây khó hiểu.
  - Máy kiosk phải có mạng khi người dân bấm "Bắt đầu lại": nút tải lại trang (BR-7). Mất mạng thì trình duyệt hiện trang lỗi của nó, trang tra cứu không hiện lại cho tới khi có mạng; nội dung người trước để lại không còn trên màn hình.
  - Bật đồng bộ giờ tự động của máy (giờ Việt Nam). Trạng thái "Đang trong giờ làm việc" ở trang chủ tính theo đồng hồ của máy kiosk, nên đồng hồ lệch thì trạng thái sai (F02 BR-9).
- BR-7: Nút "Bắt đầu lại" (câu hỏi mở 37):
  - Chỉ có ở chế độ kiosk. Luôn hiện và bấm được ở mọi trang, kể cả khi popup hoặc khung trợ lý đang mở (cách dùng bàn phím khi popup mở: C01 BR-9). Điện thoại, máy tính thường không có nút này.
  - Nút nổi ở góc dưới bên trái, đối xứng với nút Trợ lý (C01 BR-13). Cuối trang chừa khoảng trống để phần cuối cùng (chân trang) không nằm dưới nút.
  - Khi khung trợ lý đang mở và không có popup: trong thứ tự Tab, nút đi sau các phần tử của khung trợ lý.
  - Bấm → làm ngay, không hỏi lại: xoá hội thoại trợ lý và thủ tục đang nói tới (F06); đóng popup và khung trợ lý; xoá từ khoá, bộ lọc, tab, số trang ở F03, F04, F05 (về như lần mở đầu); về trang chủ, cuộn lên đầu; địa chỉ trang không còn mã thủ tục; dừng ngay câu đang đọc (F07 BR-7).
  - Cách làm (người dùng chốt 2026-10-13, câu hỏi mở 42): trang tải lại, mở trang chủ ở địa chỉ `/?kiosk=1`. Mọi trạng thái trong bộ nhớ của trang đều mất. Chế độ kiosk, lựa chọn bật đọc và thẻ/bảng được giữ vì lưu trong bộ nhớ của trình duyệt. Hệ quả: màn hình có thể chớp trắng khoảng 0,3–1,5 giây trong lúc tải, và cần có mạng (BR-6).
  - Không để lại lịch sử: sau khi bấm, nút "Quay lại" của trình duyệt không khôi phục trạng thái của người trước — từ khoá, bộ lọc, tab, số trang, popup, hội thoại.
  - Sau khi bấm vẫn ở chế độ kiosk (BR-1).
  - Giữ nguyên lựa chọn bật đọc (F07 BR-5) và dạng thẻ / bảng (F03 BR-6).
  - Chỉ chạy khi có người bấm, không bao giờ tự chạy (BR-2).
- BR-8: Lịch sử trình duyệt ở chế độ kiosk (câu hỏi mở 42): mọi điều hướng trong trang (bấm điều hướng, liên kết nội bộ, đổi bộ lọc hay từ khoá, mở popup) thay mục hiện tại trong lịch sử, không thêm mục. Hệ quả: nút "Quay lại" của trình duyệt kiosk không đi giữa các trang của trang web, và không đóng popup (ngoại lệ ở F03 BR-8, C01 BR-9). Trên kiosk người dân dùng nút trên trang (✕, Esc, vùng ngoài popup, các mục điều hướng) và nút "Bắt đầu lại". Cách xử lý ở máy: ẩn nút "Quay lại" của trình duyệt (BR-6).

## Tiêu chí chấp nhận

- AC-1: Mở trang bằng link kiosk ở khổ 1080×1920 → chữ, nút lớn theo C01 AC-2; danh sách thủ tục dạng thẻ. Tải lại trang → vẫn ở chế độ kiosk: chữ, nút vẫn lớn.
- AC-2: Ở chế độ kiosk, vào danh mục, gõ "khai sinh", lọc "Hộ tịch". Mở trợ lý, hỏi "làm giấy khai sinh cần gì", bấm nút xem chi tiết trong câu trả lời → popup mở trên khung trợ lý (F06 AC-17). Để yên 15 phút → không có cảnh báo hay đếm ngược; popup, khung trợ lý, hội thoại, từ khoá, bộ lọc còn nguyên.
- AC-3: Ở chế độ kiosk, dòng nhắc "Nhớ đăng xuất khi dùng xong":
  - Trang chủ: đúng một dòng phía trên các ô dịch vụ; đúng một dòng phía trên danh sách thủ tục thường gặp, ở cả dạng thẻ và dạng bảng. Không thẻ, dòng bảng, ô nào có dòng nhắc riêng. Nhập lại file ô dịch vụ chỉ còn ô "Cổng thông tin điện tử xã Cần Giuộc" và hai ô chưa có link (không ô nào trỏ tới Cổng DVC) → không có dòng nhắc phía trên các ô dịch vụ.
  - Danh mục, ở cả hai tab, dạng thẻ và dạng bảng: đúng một dòng phía trên danh sách.
  - Popup thủ tục 1.001193: một dòng cạnh liên kết "Xem và nộp trên Cổng DVC". Bấm liên kết → Cổng DVC mở ngay, không có bước xác nhận.
  - Trợ lý: hỏi "kết hôn", rồi hỏi "nộp hồ sơ trực tuyến ở đâu" (cả hai câu trả lời có liên kết tới Cổng DVC) → khung trợ lý có đúng một dòng nhắc, không lặp ở từng câu trả lời. Bấm "Bắt đầu lại", mở trợ lý, hỏi "mấy giờ làm việc" (câu trả lời không có liên kết tới Cổng DVC) → khung không có dòng nhắc.
  - Chân trang: không có dòng nhắc.
- AC-4: Mở các chỗ ở AC-3 trên điện thoại (không qua link kiosk) → không có dòng nhắc nào.
- AC-5: Giới hạn câu hỏi trợ lý để mặc định. Từ một kiosk, hỏi 60 câu trong 1 phút → đều có trả lời; câu thứ 61 → thông báo "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại." (F00 BR-6, F06 AC-7), trang không lỗi.
- AC-6: Ở chế độ kiosk: bật đọc, chọn dạng bảng. Vào danh mục, chọn tab Cấp tỉnh, gõ "khai sinh", lọc "Hộ tịch". Mở trợ lý, hỏi "làm giấy khai sinh cần gì"; bấm nút xem chi tiết trong câu trả lời → popup thủ tục 1.001193 mở trên khung trợ lý (F06 AC-17). Khi tiếng đọc câu trả lời chưa hết, bấm "Bắt đầu lại" →
  - Tiếng đọc dừng ngay (F07 BR-7).
  - Về trang chủ, ở đầu trang; popup và khung trợ lý đóng; địa chỉ trang không còn mã thủ tục.
  - Vẫn ở chế độ kiosk: nút "Bắt đầu lại" vẫn hiện, chữ và nút vẫn lớn.
  - Mở trợ lý → hội thoại trống như lần mở đầu. Hỏi "mấy ngày" → không ra thời hạn của thủ tục đăng ký khai sinh.
  - Mở danh mục → tab như lần mở đầu, ô tìm trống, không lọc, trang 1.
  - Vẫn đang bật đọc; danh sách vẫn dạng bảng.
- AC-7: Sau AC-6, bấm "Quay lại" của trình duyệt nhiều lần → không thấy lại tab Cấp tỉnh, từ khoá "khai sinh", lọc "Hộ tịch", popup thủ tục 1.001193 hay hội thoại trước đó.
- AC-8: Mở trang chủ, danh mục, lĩnh vực trên điện thoại và máy tính (không qua link kiosk) → không có nút "Bắt đầu lại". Ở chế độ kiosk, nút có ở cả ba trang, ở góc dưới bên trái; cuộn tới cuối trang → nút không che chữ ở chân trang.
- AC-9: Ở chế độ kiosk, hỏi trợ lý "số 0912345678 của tôi nộp hồ sơ chưa", rồi bấm "Bắt đầu lại", mở lại trợ lý → trên màn hình không còn câu có số 0912345678.
- AC-10: Ở chế độ kiosk, vào danh mục, chọn tab Cấp tỉnh, gõ "khai sinh", rồi bấm "Bắt đầu lại" → trang tải lại; địa chỉ là `/?kiosk=1` rồi chuyển thành `/` (tham số kiosk được xoá khỏi địa chỉ nhưng vẫn ở chế độ kiosk); chữ, nút vẫn lớn; bật đọc và dạng thẻ/bảng vẫn như trước; không còn trạng thái nào trong bộ nhớ của trang (hội thoại, từ khoá, bộ lọc, popup). Trang chủ hiện đầy đủ sau tối đa 1,5 giây trên mạng của Trung tâm.
- AC-11: Ở chế độ kiosk, đi lần lượt Trang chủ → Danh mục → Lĩnh vực bằng thanh điều hướng, mở một popup thủ tục, rồi bấm "Quay lại" của trình duyệt nhiều lần → không quay lại Danh mục hay Trang chủ trong trang web, popup không đóng. Ngoài kiosk (điện thoại, máy tính) làm lại → "Quay lại" đi về từng trang trước và đóng popup (F03 AC-17).
- AC-12: Nhận diện đích Cổng DVC, ở chế độ kiosk. Dữ liệu thử ở file ô dịch vụ (ô thứ nhất ở mỗi bước, các ô còn lại không trỏ Cổng DVC), mở trang chủ:
  - Link ô `https://dichvucong.gov.vn/tra-cuu-ho-so` → có đúng một dòng "Nhớ đăng xuất khi dùng xong" phía trên các ô dịch vụ.
  - `https://abc.dichvucong.gov.vn/x`, `https://DICHVUCONG.GOV.VN./x` (chữ hoa, dấu chấm cuối), `https://dichvucong.gov.vn:8443/x` → có dòng nhắc.
  - `https://dichvucong.gov.vn.evil.com/x`, `https://dichvucong.gov.vn@evil.com/x`, `https://evildichvucong.gov.vn/x`, `https://dichvucong.tayninh.gov.vn/x`, `https://dichvuсong.gov.vn/x` (chữ "с" là Cyrillic) → không có dòng nhắc.
  - Câu trả lời mẫu của trợ lý có liên kết `https://abc.dichvucong.gov.vn/x` → khung trợ lý có dòng nhắc; liên kết `https://dichvucong.gov.vn.evil.com/x` → khung không có dòng nhắc.
  - Thủ tục 1.001193: liên kết "Xem và nộp trên Cổng DVC" trong popup luôn có dòng nhắc (đích luôn là `dichvucong.gov.vn`).
  - Ngoài chế độ kiosk, mọi trường hợp trên đều không có dòng nhắc.

## Câu hỏi mở

- Câu hỏi mở 10 — trình duyệt của máy kiosk (chờ đơn vị CNTT).
- Đã trả lời 2026-10-13: câu 42 (BR-4, BR-6, BR-7, BR-8).
- Đã trả lời 2026-10-12: câu 15 (không tự làm mới), 16 (60 câu/phút), 22 (hướng dẫn vận hành, nhắc đăng xuất), 24 (không có QR riêng cho từng thủ tục), 31 (không có nút menu), 37 (nút "Bắt đầu lại").
