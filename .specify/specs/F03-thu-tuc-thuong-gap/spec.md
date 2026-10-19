---
id: F03
ten: Thủ tục thường gặp và popup chi tiết
trang_thai: dang-lam
nguon: Cần Đước — https://ttpvhcc-canduoc.pages.dev/ (khối "thủ tục thường gặp", popup "Xem chi tiết"); Vàm Cỏ — link tra cứu thủ tục trên Cổng DVC theo mã (DVC_URL); câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 3, 7, 24, 25, 29, 31, 36, 38); design-system.md §3 "Bố cục" (mốc màn hình, người dùng duyệt 2026-10-12); các quyết định của kế hoạch F03 (§4.2, §10 mục 7, 8, 9) ghi vào spec 2026-10-13 theo góp ý của tester
---

# F03 · Thủ tục thường gặp và popup chi tiết

## Mục tiêu

Người dân tìm nhanh các thủ tục hay làm nhất mà không phải lướt cả danh mục, và xem đủ thông tin chuẩn bị hồ sơ ngay trên trang.

## Phạm vi

- Trong:
  - Khối thủ tục thường gặp trên trang chủ (F02); không có trang riêng (câu hỏi mở 31).
  - Danh sách thủ tục thường gặp nhập từ file, có thứ tự (F01 BR-15), kèm số đếm "Hiển thị x/y" (BR-7). Bản đầu 16 thủ tục (`du-lieu.md` mục "Bản đầu của dữ liệu thật"); Trung tâm thêm, bớt, đổi thứ tự bằng file nhập (câu hỏi mở 3).
  - Ô tìm (BR-1); chip lọc lĩnh vực.
  - Chuyển dạng thẻ / dạng bảng; phân trang 12 thủ tục mỗi trang.
  - Popup chi tiết; liên kết "Xem và nộp trên Cổng DVC" ở popup, mỗi thẻ và mỗi dòng bảng (BR-4).
  - Ô tìm, chip, nút chuyển dạng, bảng và thẻ, phân trang, popup dùng thành phần chung C01.
  - Link riêng tới từng thủ tục, mở thẳng popup chi tiết (BR-8).
- Ngoài: chữ lớn, đọc to; nút chia sẻ hoặc sao chép link, QR riêng cho từng thủ tục — giống Vàm Cỏ, chỉ có QR theo lĩnh vực ở F05 (câu hỏi mở 24).

## Quy tắc nghiệp vụ

- BR-1: Tìm kiếm thủ tục — định nghĩa dùng chung cho F03 và F04:
  - Tìm trên: tên, mã, tên lĩnh vực của thủ tục.
  - So khớp theo ô tìm kiếm C01 BR-4 (không dấu, nhiều từ). Mỗi từ nằm ở tên, mã hoặc lĩnh vực đều được.
  - Từ khoá chỉ cần là một phần của tên, mã hoặc lĩnh vực: gõ một phần của mã (vd. "1.0011") cũng ra thủ tục có mã chứa đoạn đó (1.001193), giống cách một phần của tên cũng khớp.
- BR-2: Chỉ hiện chip của lĩnh vực có ít nhất 1 thủ tục thường gặp. Chip "Tất cả" được chọn mặc định. Cách chọn chip: C01 BR-5.
- BR-3: Popup chi tiết gồm:
  - Thông tin chung: tên, mã, lĩnh vực, mức độ, cơ quan thực hiện, thời hạn, phí.
  - Cách làm: yêu cầu, điều kiện; cách thức nộp; thành phần hồ sơ; trình tự; kết quả; căn cứ pháp lý.
  - Mỗi giấy tờ trong thành phần hồ sơ kèm số bản chính, số bản sao khi dữ liệu có (F01 BR-16). Giấy tờ ghi cả 0 bản chính và 0 bản sao coi như chưa ghi: chỉ hiện tên giấy tờ (câu hỏi mở 38). Nói cách khác, số bản chỉ bị ẩn khi dữ liệu không có số bản nào lớn hơn 0 (không ghi, hoặc cả hai bằng 0); chỉ cần một trong hai lớn hơn 0 thì hiện cả hai số, số còn lại có thể là 0 (vd. "Bản chính: 1 · Bản sao: 0").
  - Căn cứ pháp lý chỉ hiện số ký hiệu và trích yếu của từng văn bản, dạng chữ, không có link (`lien-ket.md` §2, câu hỏi mở 26).
  - Mục nào không có dữ liệu thì ẩn.
  - Cuối popup luôn có lời miễn trừ (F08 BR-7).
- BR-4: Liên kết ra trang ngoài "Xem và nộp trên Cổng DVC" (C01 BR-3), mở ở tab mới — giống Vàm Cỏ:
  - Có ở: popup chi tiết; mỗi thẻ và mỗi dòng bảng thủ tục của F03, F04; mỗi thủ tục trong câu trả lời của trợ lý (F06 BR-6) (câu hỏi mở 36).
  - Ở mọi chỗ là cùng một link: trang tra cứu thủ tục trên Cổng DVC Quốc gia theo mã thủ tục, đúng dạng link của Vàm Cỏ (`lien-ket.md` §2). Người dân xem và nộp hồ sơ trực tuyến từ trang đó.
  - Mỗi thủ tục chỉ có một liên kết ra Cổng DVC ở mỗi chỗ; không có nút "Nộp trực tuyến" riêng (câu hỏi mở 7).
  - Không dẫn tới hệ thống nội bộ cho cán bộ của tỉnh (danh sách tên miền: `lien-ket.md` §1, mục "Đã bỏ").
- BR-5: Popup chi tiết dùng chung cho F03, F04 và câu trả lời của trợ lý (F06).
- BR-6: Dạng hiển thị:
  - Điện thoại (màn hình dưới 600 px): luôn dạng thẻ, không có nút chuyển dạng (câu hỏi mở 29).
  - Từ 600 px trở lên có nút chuyển dạng (C01 BR-6). Mặc định khi chưa chọn: dạng thẻ ở máy tính bảng (600–1023 px) và chế độ kiosk (F09); dạng bảng ở máy tính (từ 1024 px). Mốc theo design-system §3 "Bố cục".
  - Người dùng tự chọn thì nhớ lựa chọn đó cho lần sau, kể cả trên kiosk (kiosk không tự làm mới — F09 BR-2). Lựa chọn dùng chung với danh mục (F04 BR-9). Màn hình thu xuống dưới 600 px thì vẫn dạng thẻ; nới rộng lại thì về dạng đã chọn.
- BR-7: Phân trang theo C01 BR-8, 12 thủ tục mỗi trang, ở cả dạng thẻ và dạng bảng. Dạng thẻ chia đều 1–4 cột tuỳ độ rộng màn hình; 4 là số cột tối đa mà F03 đặt theo C01 BR-7. Số đếm "Hiển thị x/y": x là số thủ tục khớp, y là tổng số thủ tục thường gặp.
- BR-8: Link thủ tục — dùng chung cho mọi nơi mở popup (F03, F04, F06):
  - Popup đang mở → địa chỉ trang có thêm mã thủ tục, giữ nguyên phần còn lại (vd. bộ lọc của F04).
  - Mở link có mã (gõ, dán, bấm link được chia sẻ) → trang đó hiện, popup của đúng thủ tục mở sẵn.
  - Đóng popup → địa chỉ bỏ mã thủ tục.
  - Bấm "Quay lại" của trình duyệt khi popup đang mở → popup đóng, trang bên dưới giữ nguyên (ngoại lệ trên kiosk: xem dưới).
  - Mở thẳng bằng link có mã (gõ, dán, bấm link được chia sẻ), không có trang nào của trang web này đứng trước: bấm "Quay lại" khi popup đang mở → popup đóng, địa chỉ bỏ mã, người dùng ở lại trang, không bị đưa ra khỏi trang web (câu hỏi mở 40).
  - Ngoại lệ trên kiosk (ngoại lệ của C01 BR-9 về nút "Quay lại"): popup mở bằng cách thay mục hiện tại trong lịch sử trình duyệt, không thêm mục mới, để "Bắt đầu lại" (F09 BR-7) không để lại dấu vết. Vì vậy trên kiosk bấm "Quay lại" không đóng popup. Trên kiosk popup đóng bằng nút ✕, phím Esc hoặc bấm vùng tối bên ngoài (C01 BR-9).
  - Mã không có trong dữ liệu → F08 BR-10.
  - Mã thủ tục trên địa chỉ phải đúng nguyên mã. Mã chỉ là một phần của mã có thật (vd. "1.0011") không mở popup nào mà hiện thông báo không tìm thấy (F08 BR-10). Khác với ô tìm kiếm (BR-1), nơi một phần của mã vẫn khớp.
  - Tiêu đề tab khi popup mở, và phần xem trước khi chia sẻ link thủ tục: F08 BR-9, BR-13 (câu hỏi mở 25).
- BR-9: Trạng thái danh sách thường gặp nằm trên địa chỉ trang: từ khoá, chip lĩnh vực, số trang. Định nghĩa giống F04 BR-3: chia sẻ link hay bấm "Quay lại" đều mở đúng kết quả và đúng trang. Dạng thẻ / bảng không nằm trên địa chỉ (BR-6). Trên kiosk, bấm "Bắt đầu lại" thì các trạng thái này không còn trong lịch sử trình duyệt (F09 BR-7).
  - Đổi từ khoá hay chip thì địa chỉ được cập nhật thay cho mục hiện tại, không thêm mục lịch sử mới (cùng quy tắc F04 BR-3).
  - Lĩnh vực trên địa chỉ không khớp chip nào (mã lạ, hoặc lĩnh vực có trong danh mục nhưng không có thủ tục thường gặp) → coi như chip "Tất cả": không lọc, không báo lỗi, mã lạ không hiện ra trang.
- BR-10: Danh sách thường gặp hiện theo thứ tự trong dữ liệu (F01 BR-15), ở cả dạng thẻ và dạng bảng. Tìm hay chọn chip thì các thủ tục còn lại vẫn giữ thứ tự đó.
- BR-11: Chưa có thủ tục thường gặp nào trong dữ liệu (danh sách rỗng) → trang chủ không hiện khối này: không tiêu đề, không số đếm "Hiển thị 0/0", không thông báo không có kết quả. Các khối khác của trang chủ vẫn hiện bình thường.

## Tiêu chí chấp nhận

Dữ liệu thử (trừ AC-20): 43 thủ tục thường gặp, có "Thủ tục đăng ký khai sinh" (mã 1.001193, Hộ tịch) và các thủ tục Đất đai có chữ "thế chấp".

- AC-1: Gõ "dang ky the chap" → ra "Đăng ký thế chấp".
- AC-2: Chọn chip "Đất đai" rồi gõ "the chap" → chỉ còn các thủ tục đất đai có chữ "thế chấp"; số đếm cập nhật theo.
- AC-3: Bấm "Xem chi tiết" → popup hiện ngay; nội dung chi tiết hiện đủ trong ≤ 1 giây trên mạng 4G.
- AC-4: Popup chi tiết đóng được và giữ con trỏ bên trong theo C01 BR-9: đạt C01 AC-15, AC-16.
- AC-5: Ở khổ 1280 px, chuyển sang dạng bảng rồi tải lại trang → vẫn là dạng bảng.
- AC-6: Thủ tục có căn cứ pháp lý → mục "Căn cứ pháp lý" hiện số ký hiệu và trích yếu của từng văn bản; không chữ nào trong mục này bấm được, Tab không dừng trong mục. Thủ tục không có căn cứ pháp lý → popup không hiện mục "Căn cứ pháp lý"; cuối popup vẫn có lời miễn trừ.
- AC-7: Gõ "1.001193" → chỉ ra "Thủ tục đăng ký khai sinh". Gõ "ho tich khai sinh" → các thủ tục lĩnh vực Hộ tịch có chữ "khai sinh".
- AC-8: Mở trang → chip "Tất cả" đang chọn, số đếm "Hiển thị 43/43". Lĩnh vực có trong dữ liệu nhưng không có thủ tục thường gặp nào → không có chip của lĩnh vực đó.
- AC-9: Ở popup thủ tục 1.001193, bấm "Xem và nộp trên Cổng DVC" → tab mới mở trang tra cứu thủ tục 1.001193 trên dichvucong.gov.vn, địa chỉ đúng dạng ở `lien-ket.md` §2.
- AC-10: Với thủ tục 1.001193: thẻ (dạng thẻ), dòng (dạng bảng) và popup mỗi chỗ có đúng một liên kết "Xem và nộp trên Cổng DVC"; bấm ở từng chỗ → tab mới mở cùng một địa chỉ như AC-9. Không chỗ nào có nút "Nộp trực tuyến".
- AC-11: Bấm một thủ tục ở danh mục (F04 AC-6) hoặc nút trong câu trả lời của trợ lý (F06 AC-9) → mở cùng popup này, đủ các mục như khi mở từ danh sách thường gặp.
- AC-12: Dạng hiển thị theo khổ màn hình:
  - Mở lần đầu ở khổ 375 px → dạng thẻ, không có nút chuyển dạng. Ở khổ 768 px → dạng thẻ, có nút chuyển dạng. Ở khổ 1280 px → dạng bảng, có nút chuyển dạng. Mở bằng link kiosk ở khổ 1080×1920 → dạng thẻ, có nút chuyển dạng.
  - Ở khổ 1280 px chọn dạng bảng, thu cửa sổ xuống 375 px → dạng thẻ, không có nút chuyển dạng; nới lại 1280 px → dạng bảng.
- AC-13: 43 thủ tục → 4 trang: 12, 12, 12, 7. Bấm trang 2 → thấy thủ tục thứ 13–24. Đang ở trang 3, chọn chip khác → về trang 1.
- AC-14: Dạng thẻ ở mọi độ rộng: trang đủ 12 thẻ xếp thành các hàng đầy (1, 2, 3 hoặc 4 cột), không có hàng thiếu.
- AC-15: Mở popup thủ tục 1.001193 → địa chỉ trang có mã 1.001193. Sao chép địa chỉ, mở ở trình duyệt khác → trang chủ hiện, popup của thủ tục 1.001193 mở sẵn.
- AC-16: Đóng popup bằng ✕, Esc hoặc bấm ra ngoài → địa chỉ không còn mã thủ tục; danh sách bên dưới giữ nguyên.
- AC-17: Gõ "khai sinh", sang trang 2, mở popup một thủ tục, bấm "Quay lại" của trình duyệt → popup đóng; vẫn ở trang 2 với từ khoá "khai sinh".
- AC-18: Mở link có mã thủ tục không có trong dữ liệu → như F08 AC-10.
- AC-19: Chọn chip "Tất cả", sang trang 3 → địa chỉ trang có số trang 3. Chọn chip "Hộ tịch", gõ "khai sinh" → địa chỉ có lĩnh vực và từ khoá, số trang về 1. Mở từng địa chỉ đó ở trình duyệt khác → cùng chip, cùng từ khoá, cùng trang, cùng kết quả.
- AC-20: Nhập bản đầu (16 thủ tục thường gặp ở `du-lieu.md`) → khối thường gặp ghi "Hiển thị 16/16", có 2 trang (12, 4); chỉ có chip "Tất cả" và chip của các lĩnh vực có trong 16 thủ tục đó. Nhập lại file đã bỏ 1 dòng ở sheet Thường gặp → "Hiển thị 15/15", không sửa code.
- AC-21: Mở popup thủ tục 1.001193 → tiêu đề tab là tên thủ tục "Thủ tục đăng ký khai sinh" (F08 AC-20). Đóng popup → tiêu đề tab về tiêu đề của trang chủ.
- AC-22: Dữ liệu thường gặp có thứ tự: 1.000894 thứ 1, 1.001193 thứ 2 → khối thường gặp hiện "Thủ tục đăng ký kết hôn" trước "Thủ tục đăng ký khai sinh", ở cả dạng thẻ và bảng. Chọn chip "Hộ tịch" → hai thủ tục vẫn theo thứ tự đó. Đổi thứ tự trong file rồi nhập lại → khối đổi theo, không sửa code.
- AC-23: Thủ tục có "Yêu cầu, điều kiện" → popup có mục này; thủ tục không có → không có mục, không có chỗ trống. Giấy tờ ghi 1 bản chính, 0 bản sao → hiện cạnh tên giấy tờ; giấy tờ không ghi số bản, hoặc ghi 0 bản chính và 0 bản sao → chỉ có tên giấy tờ, không có số bản nào. Giấy tờ ghi 0 bản chính, 2 bản sao → hiện "Bản chính: 0 · Bản sao: 2".
- AC-24: Mở thẳng `/?ma=1.001193` trong tab mới (chưa có trang nào của trang web này trước đó), popup mở. Bấm "Quay lại" của trình duyệt → popup đóng, địa chỉ không còn mã, trang chủ vẫn hiện; không bị đưa ra khỏi trang web. Mở lại link, bấm ✕ → cũng ở lại trang chủ.
- AC-25: Trên kiosk (link kiosk, khổ 1080×1920), bấm một thủ tục để mở popup rồi bấm "Quay lại" của trình duyệt → popup vẫn mở. Bấm ✕, hoặc Esc, hoặc vùng tối bên ngoài → popup đóng, địa chỉ bỏ mã. Sau khi bấm "Bắt đầu lại" rồi "Quay lại" nhiều lần, không thấy lại popup của người trước (F09 AC-7).
- AC-26: Mở `/?lv=khong-co-lv` và `/?lv=` → chip "Tất cả" đang chọn, "Hiển thị 43/43" (dữ liệu thử), không thông báo lỗi, chữ "khong-co-lv" không hiện ra trang. Mở `/?lv=<lĩnh vực có trong danh mục nhưng không có thủ tục thường gặp>` → cũng như vậy.
- AC-27: Chưa nhập thủ tục thường gặp nào (dữ liệu thường gặp rỗng, danh mục vẫn có thủ tục) → trang chủ không có khối thủ tục thường gặp: không tiêu đề khối, không "Hiển thị 0/0", không thông báo "Không tìm thấy"; ô dịch vụ, giờ làm việc vẫn hiện.
- AC-28: Tìm theo mã. Gõ "1.0011" trong ô tìm → ra thủ tục 1.001193 (mã chứa đoạn vừa gõ). Mở `/?ma=1.0011` (không phải mã đầy đủ của thủ tục nào) → không có popup thủ tục, hiện thông báo "Không tìm thấy thủ tục này…" (F08 AC-10).

## Câu hỏi mở

- Câu hỏi mở 40 — "Quay lại" khi mở thẳng bằng link (BR-8): đề xuất của bên điều phối, chưa chốt với người dùng; cần planner xác nhận làm được.
- Đã trả lời 2026-10-12: câu 3, 7, 12, 22 (nhắc đăng xuất trên kiosk — F09 BR-4), 24, 25, 29, 31, 36 (liên kết Cổng DVC trên thẻ, dòng bảng), 38 (0 bản chính và 0 bản sao coi như chưa ghi).
