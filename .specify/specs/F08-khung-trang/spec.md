---
id: F08
ten: Khung trang chung
trang_thai: dang-lam
nguon: Yêu cầu của người dùng ngày 2026-10-08; TT 22/2023/TT-BTTTT Điều 3 khoản 2–4, Điều 4 khoản 7, 9 và Phụ lục IV (xem nghiep-vu/tuan-thu.md); Cần Đước — chân trang (tên trung tâm, địa chỉ và điện thoại, liên kết hữu ích); thông tin Cần Giuộc đã xác minh ngày 2026-10-09 — nghiep-vu/can-giuoc.md, nghiep-vu/lien-ket.md; prototype .specify/prototype/index.html (điều hướng 3 mục); câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 17, 18, 25, 31, 34); kế hoạch F08 câu B11 (địa chỉ không tồn tại vẫn mở được trang) và thẻ thời gian bỏ khi chưa nhập thủ tục — người dùng không phản đối, ghi vào spec 2026-10-12 theo góp ý của tester
---

# F08 · Khung trang chung

## Mục tiêu

Ở trang nào người dân cũng biết đây là trang của trung tâm nào, chuyển được sang trang khác, thấy cách liên hệ; khi đang tải, lỗi hoặc không có kết quả thì biết phải làm gì tiếp.

## Phạm vi

- Trong:
  - Đầu trang: biểu tượng (BR-14), tên trung tâm, địa bàn (tên đơn vị hành chính, tỉnh) — tên và địa bàn lấy từ dữ liệu (BR-5).
  - Điều hướng 3 mục: Trang chủ (F02, có khối thủ tục thường gặp F03), Danh mục thủ tục (F04), Lĩnh vực và mã QR (F05) (câu hỏi mở 31). Liên kết "Bỏ qua, tới nội dung chính".
  - Chân trang: thông tin cơ quan và liên hệ, liên kết hữu ích, mạng xã hội, dòng cập nhật dữ liệu, lời miễn trừ.
  - Tiêu đề và dữ liệu đặc tả cho từng trang; trang 404; chỗ hiện trạng thái đang tải, lỗi, không có kết quả (hình thức và câu chữ ở C01 BR-11).
- Ngoài: chữ lớn, đọc to cả trang; giao diện tiếng Anh; trang giới thiệu, tin tức; trang thủ tục thường gặp riêng; nút menu; sửa đầu/chân trang trên màn hình quản trị (dữ liệu nạp qua F01).

## Quy tắc nghiệp vụ

- BR-1: Đầu trang, điều hướng, chân trang giống nhau và cùng thứ tự ở mọi trang, kể cả trang 404. Mục đang xem được đánh dấu.
- BR-2: Bấm biểu tượng hoặc tên trung tâm → về trang chủ. Không có nút menu (câu hỏi mở 31):
  - Từ 600 px trở lên: nhãn đầy đủ "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR".
  - Dưới 600 px (điện thoại): nhãn ngắn "Trang chủ", "Danh mục", "Lĩnh vực", đủ chỗ trên một hàng; không vuốt ngang; cả trang không cuộn ngang (C01 BR-1). Nhãn ngắn chỉ là chữ hiện trên màn hình; trình đọc màn hình đọc nhãn đầy đủ "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR".
- BR-3: Chân trang luôn hiện đủ 5 mục bắt buộc (TT 22/2023 Điều 3 khoản 3): tên đơn vị, người chịu trách nhiệm, địa chỉ, số điện thoại, email. Công cụ nhập không nhận file thiếu mục nào trong 5 mục này (F01 BR-8).
  - Người chịu trách nhiệm nội dung là người giữ chức Giám đốc Trung tâm; hiện kèm chức vụ khi dữ liệu có chức vụ. Họ tên chỉ có trong file nhập, không ghi trong tài liệu dự án (câu hỏi mở 18).
  - Email: theo `can-giuoc.md` §2 — email UBND xã cho tới khi Trung tâm có email riêng (câu hỏi mở 34).
  - Mục không bắt buộc: cơ quan chủ quản (Cần Giuộc: UBND xã — câu hỏi mở 18), link bản đồ, liên kết hữu ích, mạng xã hội.
  - Liên kết hữu ích theo `lien-ket.md` §1, dòng "Chân trang": Cổng DVC Quốc gia, cổng thông tin điện tử của xã và của tỉnh (TT 22/2023 Điều 4 khoản 7 điểm c — trang trực thuộc cổng nào: câu hỏi mở 14, 20). Không liên kết tới hệ thống nội bộ cho cán bộ: danh sách tên miền ở `lien-ket.md` §1, mục "Đã bỏ — tên miền trang không liên kết tới".
- BR-4: Số điện thoại, email, link ngoài theo C01 BR-3: số điện thoại mở trình gọi, email mở ứng dụng thư, link ngoài mở tab mới.
- BR-5: Thông tin ở đầu/chân trang lấy từ dữ liệu trung tâm (F01), không viết cứng. Tên trung tâm và tên đơn vị hành chính hiện đúng như dữ liệu, kể cả chữ "xã" hay "phường"; trang không tự ghép thêm chữ nào (câu hỏi mở 35). Giá trị thật của Cần Giuộc: `can-giuoc.md` §1–3. Mục không bắt buộc để trống thì ẩn, không hiện chữ giữ chỗ; khối không còn mục nào (vd. mạng xã hội) thì ẩn cả tiêu đề khối. Mạng xã hội chỉ gồm kênh chính thức của cơ quan nhà nước; hiện chưa tìm thấy kênh nào (câu hỏi mở 14). Mục có dữ liệu nhưng link sai định dạng: theo C01 BR-3. Ngoại lệ ngoài khung trang: ô dịch vụ trên trang chủ để trống link vẫn hiện (C01 BR-12, F02 BR-4).
- BR-6: Dòng "Dữ liệu thủ tục cập nhật ngày dd/mm/yyyy" lấy ngày nhập thành công gần nhất của danh mục thủ tục, kể cả khi nhập lại đúng file cũ (F01 BR-7). Lần nhập lỗi không làm đổi ngày. Chưa nhập danh mục thủ tục thành công lần nào → không hiện dòng này, không để chỗ trống. Ở chế độ demo (F00 BR-16) không có lần nhập nào, nhưng dòng này vẫn hiện, với ngày của bộ dữ liệu mẫu (người dùng chốt 2026-10-12, câu hỏi mở 39); trang không ghi chú thêm đây là dữ liệu mẫu.
- BR-7: Lời miễn trừ: "Thông tin chỉ để tham khảo. Thành phần hồ sơ, thời hạn, phí chính thức căn cứ theo Cổng Dịch vụ công Quốc gia." Hiện ở chân trang, cuối popup chi tiết thủ tục (F03 BR-3) và dưới ô nhập của trợ lý (F06).
- BR-8: Nhãn EMC và mã giám sát chỉ gắn khi đơn vị CNTT chốt cách làm (câu hỏi mở 19).
- BR-9: Mỗi trang có tiêu đề riêng trên tab trình duyệt: "<Tên trang> – <Tên trung tâm>". Khi popup chi tiết thủ tục đang mở, tiêu đề tab là tên thủ tục; đóng popup thì về tiêu đề của trang (câu hỏi mở 25). Chỉ tiêu đề trên tab đổi: dữ liệu đặc tả và phần xem trước khi chia sẻ link luôn giữ tiêu đề của trang (BR-13). Trang khai báo ngôn ngữ tiếng Việt.
- BR-10: Trang không tìm thấy:
  - Địa chỉ không tồn tại (link cũ, gõ sai, QR in sai) → trang 404: "Không tìm thấy trang" + nút "Về trang chủ" + nút "Danh mục thủ tục".
  - Địa chỉ không tồn tại vẫn mở được như mọi trang khác: trình duyệt không báo lỗi, trang hiện đủ đầu trang, chân trang và nội dung "Không tìm thấy trang" ở trên (F00 BR-15).
  - Link danh mục có lĩnh vực không còn trong dữ liệu → "Không tìm thấy lĩnh vực" + nút xem toàn bộ danh mục (F04 BR-7, AC-11).
  - Link có mã thủ tục (F03 BR-8) không còn trong dữ liệu, hoặc mã sai định dạng → trang bên dưới hiện bình thường, kèm thông báo "Không tìm thấy thủ tục này. Thủ tục có thể đã đổi mã hoặc không còn áp dụng." + nút "Đóng". Thông báo không nhắc lại mã trên địa chỉ. Đóng → địa chỉ bỏ mã.
- BR-11: Trạng thái đang tải, lỗi, không có kết quả dùng chung cho F02–F06. Hình thức và câu chữ theo C01 BR-11; loại lỗi theo F00 BR-6. Các trạng thái này chỉ chiếm vùng nội dung. Đầu trang và điều hướng luôn hiện ngay. Chân trang hiện sau khi phần nội dung của trang đã dựng xong (người dùng chốt 2026-10-14, câu hỏi mở 43), để chân trang không bị đẩy xuống khi nội dung về (độ xô lệch bố cục trước đây 0,38 ở màn rộng, 0,18 ở kiosk):
  - Trong lúc trang còn khung chờ "Đang tải…" (dữ liệu chưa về), chân trang ẩn.
  - Nội dung dựng xong (có dữ liệu, hiện thông báo lỗi, hiện thông báo không có kết quả, hay là trang 404) thì chân trang hiện; không bao giờ ẩn chân trang vĩnh viễn: yêu cầu lấy dữ liệu chờ tối đa 15 giây rồi chuyển sang thông báo lỗi (C01 BR-11), lúc đó chân trang hiện.
  - Khi chân trang hiện ra, độ xô lệch bố cục (CLS) của trang nhỏ hơn 0,05 (F00 BR-9, Lighthouse).
- BR-12: Liên kết "Bỏ qua, tới nội dung chính" là mục đầu tiên khi dùng phím Tab, có ở mọi trang (WCAG 2.0 tiêu chí 2.4.1).
- BR-13: Mọi trang có dữ liệu đặc tả bắt buộc (TT 22/2023 Phụ lục IV), gồm 6 yếu tố. Yếu tố nào có mặt thì không trống:
  - Tiêu đề: tiêu đề của trang theo mẫu "<Tên trang> – <Tên trung tâm>" (BR-9), không đổi khi mở popup. Mô tả: một câu tóm tắt nội dung trang.
  - Người tạo: tên trung tâm. Cơ quan ban hành: cơ quan chủ quản, chưa có thì dùng tên đơn vị.
  - Thời gian: ngày ở BR-6 (chế độ demo: ngày của bộ dữ liệu mẫu). Chưa có ngày cập nhật (chế độ chạy thật, chưa nhập danh mục thủ tục thành công lần nào) thì bỏ yếu tố thời gian; 5 yếu tố còn lại vẫn đủ.
  - Yếu tố định danh: địa chỉ trang.
  - Link thủ tục (F03 BR-8) không có dữ liệu đặc tả riêng: chia sẻ link thủ tục (vd. qua Zalo) thì phần xem trước dùng tiêu đề và mô tả của trang, không có tên thủ tục (câu hỏi mở 25).
- BR-14: Biểu tượng đầu trang (câu hỏi mở 17):
  - Chưa có logo thật của Trung tâm → dùng biểu tượng chung hình toà nhà hành chính, đặt cạnh tên trung tâm và địa bàn. Không dùng Quốc huy.
  - Có logo thật → chỉ thay file ảnh, không sửa chương trình.

## Tiêu chí chấp nhận

AC có bước nhập dữ liệu (F01) kiểm ở chế độ chạy thật (F00 BR-16), trừ AC-22.

- AC-1: Mở lần lượt trang chủ, danh mục, lĩnh vực → đầu trang, điều hướng, chân trang giống nhau, cùng thứ tự; mục đang xem được đánh dấu. Thanh điều hướng có đúng 3 mục: Trang chủ, Danh mục thủ tục, Lĩnh vực và mã QR.
- AC-2: Ở trang danh mục, bấm biểu tượng ở đầu trang → về trang chủ. Quay lại danh mục, bấm tên trung tâm → về trang chủ.
- AC-3: Màn hình 375 px → không có nút menu; thanh điều hướng có đủ 3 mục "Trang chủ", "Danh mục", "Lĩnh vực" trên một hàng, thấy hết mà không phải vuốt ngang; cả trang không cuộn ngang. Chọn "Danh mục" → mở danh mục. Bật trình đọc màn hình ở khổ 375 px, đi qua thanh điều hướng → nghe "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR". Ở khổ 600 px và 1280 px → nhãn hiện trên màn hình là nhãn đầy đủ.
- AC-4: Mở trang, nhấn Tab lần đầu → thấy "Bỏ qua, tới nội dung chính"; nhấn Enter → con trỏ nhảy tới phần nội dung.
- AC-5: Chân trang hiện đúng tên đơn vị, người chịu trách nhiệm, địa chỉ, điện thoại, email như file dữ liệu. Trên điện thoại bấm số → trình gọi mở đúng số. File có chức vụ "Giám đốc (dữ liệu thử)" → người chịu trách nhiệm hiện kèm chức vụ đó; nhập lại với chức vụ trống → chỉ hiện người chịu trách nhiệm, không có dấu ngăn thừa.
- AC-6: Nhập lại dữ liệu trung tâm với số điện thoại mới → chân trang hiện số mới, không sửa code. Bỏ trống link bản đồ và mọi mạng xã hội → chân trang không có các mục đó, không còn tiêu đề khối mạng xã hội, không có ô trống. Bỏ trống email → không nhập được (F01 AC-6), chân trang giữ dữ liệu cũ.
- AC-7: Nhập danh mục thủ tục thành công ngày 08/10/2026 → chân trang ghi "Dữ liệu thủ tục cập nhật ngày 08/10/2026". Hôm sau nhập file lỗi → vẫn ghi 08/10/2026.
- AC-8: Mở popup chi tiết bất kỳ → cuối popup có lời miễn trừ; chân trang và khung trợ lý cũng có.
- AC-9: Gõ địa chỉ `/abc-xyz` → trình duyệt mở trang bình thường, không hiện trang báo lỗi của chính trình duyệt; trang "Không tìm thấy trang" có đủ đầu/chân trang; bấm "Về trang chủ" → về trang chủ.
- AC-10: Không tìm thấy lĩnh vực hoặc thủ tục:
  - Mở link danh mục có lĩnh vực không còn trong dữ liệu → "Không tìm thấy lĩnh vực" + nút xem toàn bộ danh mục.
  - Mở link danh mục có mã thủ tục 9.999999 (không có trong dữ liệu) → danh mục hiện bình thường, kèm thông báo "Không tìm thấy thủ tục này…" + nút "Đóng"; không có popup trống. Bấm "Đóng" → địa chỉ không còn mã.
  - Mở link có mã sai định dạng, vd. `abc<b>x</b>` → cùng thông báo; chữ trên địa chỉ không hiện ra trang.
  - Không trường hợp nào hiện thông báo lỗi kỹ thuật.
- AC-11: Mở trang chủ, rồi tắt mạng của máy (danh mục chưa tải lần nào). Bấm "Danh mục thủ tục" → "Chưa tải được dữ liệu…", nút "Thử lại", số điện thoại. Bật mạng, bấm "Thử lại" → danh sách hiện. Làm lại khi máy chủ đang ngừng → cùng thông báo.
- AC-12: Gõ "xyzxyz" trong ô tìm danh mục → "Không tìm thấy thủ tục phù hợp với 'xyzxyz'" kèm các gợi ý.
- AC-13: Chân trang và trạng thái tải (BR-11):
  - Làm chậm yêu cầu lấy danh mục thủ tục 3 giây, mở danh mục → trong 3 giây đó đầu trang và điều hướng hiện, vùng nội dung hiện "Đang tải…", chân trang không hiện. Khi dữ liệu về → danh sách hiện và chân trang hiện ngay sau đó; độ xô lệch bố cục (CLS) cả lần tải nhỏ hơn 0,05, đo ở khổ 1280 px và ở kiosk 1080×1920.
  - Cho yêu cầu lấy danh mục trả lỗi → thông báo lỗi "Chưa tải được dữ liệu." hiện cùng chân trang đầy đủ.  - Mở `/abc-xyz` → trang 404 có chân trang.
  - Cho yêu cầu không bao giờ trả lời → sau 15 giây hiện thông báo lỗi (C01 AC-19) và chân trang hiện; chân trang không ẩn mãi.
  - Mở danh mục với kết quả tìm không có thủ tục nào → thông báo không có kết quả và chân trang đều hiện.
- AC-14: Nhập dữ liệu trung tâm có tên trung tâm "Trung tâm thử A", đơn vị hành chính "phường thử B" → ở trang danh mục, tab trình duyệt ghi "Danh mục thủ tục – Trung tâm thử A"; đầu trang hiện "Trung tâm thử A" và "phường thử B", không có chữ "xã" nào. Nhập lại với "Trung tâm Phục vụ hành chính công xã Cần Giuộc", "xã Cần Giuộc" → tab và đầu trang đổi theo, không sửa code.
- AC-15: Nhập liên kết hữu ích đúng các dòng "Chân trang" ở `lien-ket.md` §1 → chân trang có đủ các link đó: Cổng Dịch vụ công Quốc gia, cổng thông tin điện tử của xã, của tỉnh. Bấm từng link → mở tab mới, đúng địa chỉ trong dữ liệu. Không link nào trong đầu trang, chân trang trỏ tới tên miền có trong danh sách "Đã bỏ" ở `lien-ket.md` §1, kể cả trang con của các tên miền đó.
- AC-16: Bấm email ở chân trang → mở ứng dụng thư, người nhận là email trung tâm. Bấm link bản đồ → mở tab mới.
- AC-17: Mở lần lượt trang chủ, danh mục, lĩnh vực, trang 404 → mỗi trang có tiêu đề tab khác nhau, đúng mẫu BR-9. Công cụ kiểm tra khả năng tiếp cận không báo thiếu tiêu đề trang hay thiếu khai báo ngôn ngữ.
- AC-18: Dữ liệu đặc tả:
  - Đã nhập danh mục thủ tục: xem dữ liệu đặc tả của trang chủ và trang danh mục → đủ 6 yếu tố của BR-13, không yếu tố nào trống; thời gian bằng ngày ở AC-7.
  - Chưa nhập danh mục thủ tục lần nào (chỉ có dữ liệu Trung tâm): xem lại hai trang đó → không có yếu tố thời gian; 5 yếu tố còn lại có đủ, không yếu tố nào trống. Chân trang không có dòng "Dữ liệu thủ tục cập nhật ngày …".
- AC-19: Nhập dữ liệu trung tâm có cơ quan chủ quản → chân trang có dòng cơ quan chủ quản; dữ liệu đặc tả ghi cơ quan ban hành là cơ quan đó. Nhập lại với cơ quan chủ quản trống → chân trang không có dòng này; cơ quan ban hành trong dữ liệu đặc tả là tên đơn vị, không trống.
- AC-20: Tiêu đề tab và xem trước khi chia sẻ:
  - Ở trang chủ, mở popup thủ tục 1.001193 → tiêu đề tab là "Thủ tục đăng ký khai sinh". Đóng popup → tiêu đề tab về "Trang chủ – <Tên trung tâm>" như trước khi mở.
  - Gửi link trang chủ có mã 1.001193 qua Zalo → phần xem trước có tiêu đề và mô tả của trang chủ, không có tên thủ tục; giống hệt khi gửi link trang chủ không có mã.
- AC-21: Biểu tượng đầu trang:
  - Chưa có logo thật → mọi trang có biểu tượng toà nhà hành chính cạnh tên trung tâm và địa bàn; không trang nào có hình Quốc huy.
  - Thay file ảnh biểu tượng bằng một ảnh thử rồi triển khai lại → mọi trang hiện ảnh thử ở đầu trang; không sửa dòng chương trình nào.
- AC-22: Chế độ demo, không có cơ sở dữ liệu (F00 AC-24) → chân trang ghi "Dữ liệu thủ tục cập nhật ngày dd/mm/yyyy" với ngày của bộ dữ liệu mẫu, không để trống. Dữ liệu đặc tả của trang chủ có đủ 6 yếu tố, thời gian là ngày đó. Trang không có dòng nào báo đây là bản chạy thử.

## Câu hỏi mở

- Câu hỏi mở 13 — dữ liệu chân trang còn thiếu: số nhà, bản đồ (giá trị đã xác minh: `can-giuoc.md`). Mạng xã hội bản đầu để trống (câu hỏi mở 14).
- Câu hỏi mở 19, 20 — nhãn EMC, trang có là thành phần của cổng tỉnh không (chờ đơn vị CNTT).
- Câu hỏi mở 35 — xã có thể thành phường: tên đơn vị, tên trung tâm, tên miền có thể đổi (người dùng chốt 2026-10-12: không chuẩn bị thêm, có nghị quyết thì nhập lại dữ liệu).
- Đã trả lời 2026-10-14: câu 43 (chân trang hiện sau khi nội dung dựng xong — BR-11, AC-13).
- Đã trả lời 2026-10-12: câu 39 (chế độ demo vẫn hiện dòng ngày cập nhật — BR-6), câu 17 (biểu tượng chung), 18 (cơ quan chủ quản, người chịu trách nhiệm), 25 (tiêu đề tab, xem trước), 31 (điều hướng 3 mục, nhãn ngắn trên điện thoại), 34 (email).
