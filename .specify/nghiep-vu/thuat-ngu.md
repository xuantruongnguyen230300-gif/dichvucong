# Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| TTHC | Thủ tục hành chính |
| Mã TTHC | Mã thủ tục trên Cơ sở dữ liệu quốc gia về TTHC, vd. `1.013314` |
| Cổng DVC Quốc gia | dichvucong.gov.vn — nơi tra cứu thủ tục, nộp hồ sơ, tra cứu hồ sơ, thanh toán trực tuyến |
| Mã DVC | Mã dịch vụ công trực tuyến của thủ tục tại địa phương, vd. `1.013314.02` |
| Trung tâm PVHCC | Trung tâm Phục vụ Hành chính công cấp xã — nơi tiếp nhận hồ sơ và trả kết quả. Ở Cần Giuộc: chức năng, nhiệm vụ, 4 bộ phận theo QĐ 04/2025/QĐ-UBND (can-giuoc.md §2) |
| Trang tra cứu TTHC của tỉnh | thutuchanhchinh.tayninh.gov.vn — trang tra cứu TTHC cấp xã dùng chung cho mọi xã của tỉnh Tây Ninh. Khác trang tra cứu này; chỉ dùng để đối chiếu dữ liệu, không làm nguồn file nhập (can-giuoc.md §4) |
| Bộ TTHC cấp xã của tỉnh | Danh mục TTHC cấp xã do UBND tỉnh Tây Ninh công bố (QĐ 1607–1615/QĐ-UBND ngày 23/6/2025 và các QĐ sửa đổi sau đó); dạng DOCX/PDF (can-giuoc.md §4) |
| Lĩnh vực | Nhóm thủ tục theo ngành: Hộ tịch, Đất đai, Chứng thực, Cư trú… |
| Danh mục cấp xã / cấp tỉnh | Hai danh sách thủ tục; một thủ tục có thể nằm ở cả hai |
| Toàn trình | Dịch vụ công trực tuyến toàn trình: nộp hồ sơ và nhận kết quả hoàn toàn trực tuyến |
| Một phần | Dịch vụ công trực tuyến một phần: có bước phải làm trực tiếp tại cơ quan |
| Thủ tục ưu tiên | **Không dùng** (bỏ 2026-10-12, câu hỏi mở 8). Vàm Cỏ gắn nhãn ⭐ "Ưu tiên", nhưng mọi thủ tục cấp xã của Vàm Cỏ đều được đánh dấu, nên nhãn trùng với danh mục cấp xã |
| Thủ tục thường gặp | Danh sách chọn lọc các thủ tục người dân hay làm, hiện thành một khối trên trang chủ (F03). Cần Đước: 43 thủ tục; Cần Giuộc bản đầu: 16 (du-lieu.md) |
| Quầy | Quầy tiếp nhận tại trung tâm; mỗi lĩnh vực được phân công cho một quầy. Bản đầu chưa có phân công: trang lĩnh vực ẩn dòng quầy, trợ lý chỉ nói nộp tại Trung tâm (câu hỏi mở 6) |
| Tiếp nhận chuyển | Lĩnh vực trung tâm nhận hồ sơ rồi chuyển cơ quan khác xử lý, vd. Cư trú → Công an |
| Ô dịch vụ nhanh | Nút trên trang chủ mở dịch vụ bên ngoài: bốc số/đặt lịch, đánh giá hài lòng, tra cứu hồ sơ, thanh toán, Cổng DVC, Cổng TTĐT xã. Ô chưa có link vẫn hiện nhưng bấm không mở gì (C01 BR-12) |
| Trợ lý | Chatbot trả lời theo luật từ dữ liệu có sẵn, không dùng AI |
| Câu hỏi mẫu | Câu hỏi soạn sẵn cho trợ lý, kèm các cách hỏi khác; trả lời bằng câu viết sẵn hoặc bằng một mục thông tin Trung tâm (du-lieu.md) |
| Nhóm câu hỏi về Trung tâm | Các câu hỏi mẫu về địa chỉ, giờ làm việc, điện thoại, email, nơi nộp trực tuyến; trợ lý trả lời bằng dữ liệu Trung tâm đang có, không chép giá trị vào câu trả lời mẫu (F06 BR-9) |
| Chủ đề gợi ý | Nút bấm nhanh trong khung trợ lý, mỗi nút gắn với một lĩnh vực (vd. "Chăn nuôi"); bấm thì trợ lý liệt kê thủ tục của đúng lĩnh vực đó (F06 BR-11) |
| Bản đầu của dữ liệu thật | Bộ file nhập đầu tiên cho môi trường thật: dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc, chưa có phân công quầy, nhân sự. Khác dữ liệu mẫu `data-mau/` chỉ dùng ở máy dev, và khác dữ liệu mẫu đi kèm của chế độ demo (du-lieu.md) |
| Chế độ chạy thật | Chế độ dữ liệu dùng dữ liệu nhập qua công cụ nhập (F01), lưu trong cơ sở dữ liệu. Bắt buộc khi mở cho dân (F00 BR-16) |
| Chế độ demo | Chế độ dữ liệu dùng dữ liệu mẫu đi kèm bản phát hành, không cần cơ sở dữ liệu. Mọi màn hình chạy như chạy thật; không nhập được dữ liệu; câu trợ lý chưa trả lời được chỉ giữ tới khi tắt ứng dụng. Không dùng để mở cho dân (F00 BR-16). Khác "chế độ kiosk" |
| Dữ liệu mẫu đi kèm | Bộ dữ liệu dùng cho chế độ demo, lưu trong kho mã, đã làm sạch: không phân công quầy, không nhân sự, không họ tên người thật. Khác `data-mau/` (du-lieu.md mục cuối) |
| Xem và nộp trên Cổng DVC | Liên kết duy nhất từ popup chi tiết ra Cổng DVC Quốc gia, tra cứu theo mã thủ tục; thay hai nút cũ "Xem trên Cổng DVC" và "Nộp trực tuyến" (F03 BR-4) |
| Câu chưa trả lời | Câu người dân hỏi mà trợ lý không trả lời được; dùng để bổ sung câu hỏi mẫu |
| Mã đơn vị (Cổng DVC) | Mã của đơn vị cung cấp dịch vụ trên Cổng DVC Quốc gia, vd. Vàm Cỏ `H53.186`; Cần Giuộc dùng `H53.183` (người dùng chốt 2026-10-12, Trung tâm kiểm lại khi rà dữ liệu — câu hỏi mở 12, can-giuoc.md) |
| Mã ĐVHC | Mã đơn vị hành chính do Thủ tướng ban hành; xã Cần Giuộc là 28159 (QĐ 19/2025/QĐ-TTg). Khác mã đơn vị trên Cổng DVC |
| Cổng TTĐT xã | Cổng thông tin điện tử của UBND xã Cần Giuộc, thuộc hệ thống cổng tỉnh Tây Ninh (can-giuoc.md). Khác trang tra cứu này |
| Hệ thống nội bộ của tỉnh | Hệ thống cho cán bộ xử lý văn bản, hồ sơ TTHC (vd. hệ thống quản lý hồ sơ, hệ thống văn bản điều hành); người dân không dùng. Trang không liên kết tới; danh sách tên miền: lien-ket.md §1, mục "Đã bỏ" (can-giuoc.md §4) |
| Ấp | Đơn vị dân cư dưới xã. Mốc xã Cần Giuộc đổi "khu phố" thành "ấp" chưa chắc: nguồn bách khoa ghi 6/2026, văn bản 7/2025 đã dùng "ấp". Đợt sắp xếp, đổi tên ấp năm 2026: can-giuoc.md §1. Tên ấp ghi đủ trong dữ liệu, kể cả chữ "Ấp" (câu hỏi mở 35) |
| Tổ hành chính lưu động | Tổ cán bộ của Trung tâm đến nhà văn hóa ấp nhận hồ sơ theo lịch. Cổng xã gọi mô hình là "Hành chính lưu động – Phục vụ tận nơi" (can-giuoc.md §5). Đưa lịch lên trang: F10 — hoãn 2026-10-12 (câu hỏi mở 33) |
| Buổi lưu động | Một lần tổ hành chính lưu động làm việc: một ngày, một buổi, một địa điểm (F10) |
| Đọc câu trả lời | Trợ lý đọc câu trả lời bằng giọng tiếng Việt cài sẵn trên máy (F07). Không nhận giọng nói qua micro |
| Khung trang | Phần giống nhau ở mọi trang: đầu trang, thanh điều hướng, chân trang (F08) |
| Chân trang | Phần cuối mọi trang. Tối thiểu có tên đơn vị, người chịu trách nhiệm, địa chỉ, điện thoại, email (TT 22/2023/TT-BTTTT) |
| Cơ quan chủ quản | Cơ quan quản lý trực tiếp trang. Trang này: UBND xã Cần Giuộc (câu hỏi mở 18) |
| Người chịu trách nhiệm nội dung | Người ghi ở chân trang là chịu trách nhiệm về nội dung trang. Trang này: người giữ chức Giám đốc Trung tâm PVHCC; họ tên chỉ có trong file nhập (câu hỏi mở 18) |
| Biểu tượng đầu trang | Hình ở đầu trang, cạnh tên Trung tâm. Chưa có logo thật thì dùng biểu tượng chung hình toà nhà hành chính, không dùng Quốc huy (F08 BR-14) |
| Lời miễn trừ | Câu nhắc thông tin trên trang chỉ để tham khảo; căn cứ chính thức là Cổng DVC Quốc gia (F08 BR-7) |
| Chế độ kiosk | Chế độ chỉ bật trên máy kiosk tại trung tâm: chữ, nút lớn hơn; liên kết tới Cổng DVC có dòng nhắc đăng xuất; có nút "Bắt đầu lại". Không tự làm mới (F09) |
| Tự làm mới | **Không dùng** (bỏ 2026-10-12, câu hỏi mở 15). Trước đây: kiosk tự về trang chủ sạch khi không ai thao tác. Nay kiosk giữ nguyên màn hình (F09 BR-2) |
| Dòng nhắc đăng xuất | Câu "Nhớ đăng xuất khi dùng xong", chỉ hiện ở chế độ kiosk, một dòng ở mỗi nơi có liên kết tới Cổng DVC (đích thuộc dichvucong.gov.vn): trên danh sách thủ tục, trong popup, trên các ô dịch vụ, trong khung trợ lý (F09 BR-4) |
| Bắt đầu lại | Nút chỉ có ở chế độ kiosk: bấm thì xoá hội thoại trợ lý, đóng popup, xoá từ khoá và bộ lọc, về trang chủ, không để lại lịch sử để "Quay lại". Không bao giờ tự chạy (F09 BR-7) |
| Hướng dẫn vận hành | Tài liệu cho kỹ thuật, cán bộ: cài đặt, cấu hình máy kiosk, việc kiểm tra hằng ngày. Không phải chức năng của trang (F09 BR-6) |
| EMC | Hệ thống giám sát, đo lường mức độ cung cấp và sử dụng dịch vụ Chính phủ số. TT 22/2023 yêu cầu cổng/trang thông tin điện tử gắn mã giám sát; trang này có phải gắn không: câu hỏi mở 19 |
| WCAG | Hướng dẫn của W3C về khả năng tiếp cận nội dung web cho mọi người, kể cả người khuyết tật |
| Cấp độ an ninh mạng | Cấp độ 1–5 của hệ thống thông tin, quyết định biện pháp bảo vệ phải có (NĐ 331/2026/NĐ-CP). NĐ 85/2016/NĐ-CP gọi là cấp độ an toàn hệ thống thông tin — xem tuan-thu.md |
| Link thủ tục | Địa chỉ trang có mã thủ tục; mở link thì popup chi tiết của thủ tục đó mở sẵn (F03 BR-8) |
| Khung hệ thống | Các điều kiện chung mọi chức năng phải đạt: an toàn, xử lý lỗi, giới hạn tần suất, hiệu năng, khả năng tiếp cận, câu chữ tập trung, theo dõi tình trạng (F00) |
| Thành phần dùng chung | Phần giao diện dùng lại ở nhiều chức năng với cùng hình thức và cách dùng: nút, ô tìm, chip, popup, phân trang… (C01) |
| Mã tra cứu | Mã 8 ký tự (chữ hoa A–Z và chữ số, bỏ các ký tự dễ nhầm 0, O, 1, I, L) đi kèm một lỗi máy chủ. Hiện trên màn hình với lỗi loại "Lỗi hệ thống". Người dân đọc mã cho cán bộ; cán bộ dùng mã tìm đúng lần lỗi trong nhật ký máy chủ. Không phải mã kỹ thuật (F00 BR-7) |
| Mã kỹ thuật | Mã HTTP (vd. 404, 500), tên lỗi, đường dẫn nội bộ, dòng lỗi của chương trình. Không bao giờ hiện cho người dân (F00 BR-3, C01 BR-11) |
| File ngôn ngữ | Nơi quản lý tập trung mọi câu chữ cố định trên giao diện. Đổi câu chữ chỉ cần sửa file này (F00 BR-12) |
| Giới hạn tần suất | Số yêu cầu tối đa mỗi phút từ một địa chỉ mạng; vượt thì phải đợi sang phút sau (F00 BR-8) |
| Điểm kiểm tra tình trạng | Hai địa chỉ để kỹ thuật biết hệ thống "còn chạy" và "sẵn sàng" — dữ liệu dùng được: chế độ chạy thật là còn kết nối cơ sở dữ liệu, chế độ demo là đã nạp xong dữ liệu mẫu (F00 BR-13) |
| Chip lọc | Nút nhỏ bo tròn để lọc nhanh danh sách theo một nhóm, vd. lĩnh vực (C01 BR-5) |
| Popup | Khung hiện nổi trên trang để xem chi tiết mà không rời trang (C01 BR-9) |
| Focus | Phần tử đang được chọn để thao tác bằng bàn phím; luôn có viền nhìn thấy (C01 BR-1) |
| Trình đọc màn hình | Phần mềm đọc to nội dung trang cho người khiếm thị; khác với đọc câu trả lời của trợ lý (F07) |
