---
id: F00
ten: Khung hệ thống
trang_thai: dang-lam
nguon: Yêu cầu của người dùng ngày 2026-10-09 (làm từng bước Khung → Component → Nghiệp vụ); khung kỹ thuật đã làm theo specs/F00-khung-he-thong/plan.md; CLAUDE.md mục Bảo mật, Hiệu năng; nghiep-vu/tuan-thu.md; câu chữ lỗi lấy từ file ngôn ngữ đang có; quyết định của bên điều phối ngày 2026-10-09 (mã tra cứu); câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 16, 19, 20, 27, 28 — danh sách trình duyệt chính thức, giới hạn trợ lý, tạm nhắm WCAG 2.1 AA); quyết định của người dùng ngày 2026-10-12 — bản demo chạy không cần cơ sở dữ liệu (ke-hoach.md, mục Quyết định đã chốt)
---

# F00 · Khung hệ thống

## Mục tiêu

Mọi chức năng (C01, F01–F10) chạy trên cùng một nền an toàn, nhanh và ai cũng dùng được. Khi có sự cố, người dân biết phải làm gì, cán bộ có mã để báo lỗi. Câu chữ và các giới hạn chỉnh được mà không phải sửa chương trình.

## Phạm vi

- Trong: điều kiện chung mà mọi màn hình và mọi yêu cầu gửi tới máy chủ phải đạt: truy cập an toàn, xử lý lỗi, giới hạn tần suất, hiệu năng, khả năng tiếp cận, câu chữ tập trung, theo dõi tình trạng, trình duyệt hỗ trợ. Hai chế độ dữ liệu: demo và chạy thật (BR-16).
- Ngoài:
  - Hình thức và cách dùng từng thành phần giao diện (C01). Đầu trang, chân trang, trang 404 (F08).
  - Máy chủ, tên miền, chứng chỉ, sao lưu (kế hoạch giai đoạn 8, câu hỏi mở 10). Cấp độ an ninh mạng (câu hỏi mở 20). Mã giám sát EMC (câu hỏi mở 19).
  - Thông tin riêng của Cần Giuộc: nghiep-vu/can-giuoc.md và các spec F02–F10.

## Quy tắc nghiệp vụ

**An toàn**

- BR-1: Chỉ truy cập qua HTTPS:
  - Chỉ nhận kết nối TLS 1.2 trở lên (tuan-thu T13). Phần này cấu hình khi triển khai (kế hoạch 8.3).
  - Vào bằng `http://` thì trang tự chuyển sang `https://`.
  - Mọi phản hồi qua HTTPS kèm chỉ dẫn "luôn dùng HTTPS", có hiệu lực 1 năm. Nhờ đó, sau lần vào đầu tiên, trình duyệt tự dùng HTTPS cho các lần sau.
- BR-2: Trang chỉ chạy nội dung của chính nó:
  - Mã chạy, kiểu trình bày, phông chữ, ảnh, phần vẽ mã QR đều lấy từ chính tên miền của trang. Không tải gì từ máy chủ khác.
  - Trang không hiện được khi bị nhúng vào khung của trang khác. Trang ở tên miền khác không đọc được dữ liệu của hệ thống.
  - Trang không dùng micro, camera, vị trí (F07 BR-6).
  - Mã giám sát EMC là ngoại lệ duy nhất có thể có, chờ đơn vị CNTT (giai đoạn 8, câu hỏi mở 19). Nếu bắt buộc gắn thì chỉ cho phép thêm đúng một tên miền của hệ thống giám sát, ghi rõ lý do.
- BR-3: Lỗi không lộ thông tin kỹ thuật. Thông báo trên màn hình không có mã kỹ thuật (thuat-ngu). Dữ liệu máy chủ trả về không có dấu vết lỗi, tên tệp, câu lệnh truy vấn dữ liệu, tên hay phiên bản phần mềm máy chủ.
- BR-4: Mã nguồn được bảo vệ khi triển khai:
  - Phần xử lý nghiệp vụ (trợ lý tìm và trả lời câu hỏi, truy xuất dữ liệu) chạy ở máy chủ. Người dùng không tải được phần này.
  - Phần chạy trên trình duyệt được nén và làm rối, không kèm bản đồ mã nguồn, không còn lệnh gỡ lỗi. Làm rối chỉ khiến mã khó đọc chứ không giấu được hẳn, nên phần này không được chứa bí mật hay logic cần giấu.
  - Bản cài đặt máy chủ không kèm tệp gỡ lỗi.
- BR-5: Thông tin nhạy cảm không lộ ra:
  - Thông tin kết nối dữ liệu (địa chỉ, tài khoản, mật khẩu) chỉ nằm trong cấu hình của máy đang chạy. Thông tin này không có trong kho mã, tệp cài đặt, phần tải về trình duyệt, thông báo lỗi hay nhật ký.
  - Ở chế độ chạy thật, nếu thiếu thông tin kết nối, hệ thống không khởi động và báo tên mục cấu hình còn thiếu, không in giá trị. Chế độ demo không cần thông tin kết nối. Thiếu khai chế độ ở môi trường triển khai cũng không khởi động (BR-16).
  - Câu hỏi gửi trợ lý có thể chứa số CCCD, số điện thoại, email. Nhật ký máy chủ có ghi câu hỏi thì phải che các thông tin này trước khi ghi, theo cùng cách che ở F06 BR-8. F06 BR-8 chỉ quy định cho danh sách câu chưa trả lời; quy tắc này mở rộng cách che đó cho nhật ký.

**Khi có lỗi**

- BR-6: Thông báo lỗi thân thiện, tuỳ theo loại lỗi. Máy chủ chỉ báo loại lỗi; câu hiển thị lấy từ file ngôn ngữ (BR-12). Cột cuối dưới đây là nội dung đang có trong file ngôn ngữ, chép lại để tester so. Đổi câu trong file ngôn ngữ thì cập nhật bảng này.

  | Loại | Khi nào | Câu hiển thị |
  |---|---|---|
  | Mất kết nối | Máy mất mạng, hoặc máy chủ không phản hồi | Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng rồi thử lại. |
  | Quá nhiều yêu cầu | Vượt giới hạn tần suất ở BR-8 | Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại. |
  | Không tìm thấy | Nội dung cần xem không có | Không tìm thấy nội dung bạn cần. |
  | Lỗi hệ thống | Máy chủ gặp sự cố | Hệ thống đang gặp sự cố. Vui lòng thử lại sau. |
  | Không hợp lệ | Thông tin gửi đi sai | Thông tin gửi đi chưa hợp lệ. Vui lòng kiểm tra lại. |
  | Quá dài | Yêu cầu vượt giới hạn kích thước ở BR-8 | Nội dung gửi đi quá dài. |
  | Không hỗ trợ | Thao tác hệ thống không nhận | Yêu cầu không được hỗ trợ. |
  | Khác | Loại lỗi chưa có trong file ngôn ngữ | Có lỗi xảy ra. Vui lòng thử lại. |

  Chức năng có thể dùng câu riêng cho đúng ngữ cảnh, ví dụ F06 AC-7, F08 BR-10. Trên màn hình, lỗi hiện theo trạng thái lỗi ở C01 BR-11.
- BR-7: Mã tra cứu (thuat-ngu):
  - Mỗi lỗi máy chủ trả về có một mã tra cứu riêng. Mã gồm 8 ký tự, chỉ dùng chữ hoa A–Z và chữ số, bỏ các ký tự dễ nhầm `0`, `O`, `1`, `I`, `L`.
  - Lỗi loại "Lỗi hệ thống": màn hình hiện mã này để người dân đọc cho cán bộ.
  - Cán bộ hoặc kỹ thuật dùng mã này tìm được đúng lần lỗi trong nhật ký máy chủ.
  - Mã tra cứu không phải mã kỹ thuật: không chứa thông tin kỹ thuật hay thông tin cá nhân. Lỗi mất kết nối không có mã.

**Giới hạn**

- BR-8: Giới hạn tần suất truy cập, tính theo địa chỉ mạng của người dùng và theo từng phút:
  - Trợ lý giới hạn chặt hơn tra cứu danh mục. Mặc định: danh mục 300 yêu cầu/phút; trợ lý 60 câu/phút (người dùng chốt 2026-10-12 — F06 BR-5, câu hỏi mở 16). Điểm kiểm tra tình trạng (BR-13) cũng bị giới hạn; con số theo cấu hình, do kế hoạch F00 quy định.
  - Vượt giới hạn thì hiện thông báo loại "Quá nhiều yêu cầu" (BR-6), trang không hỏng. Sang phút sau dùng tiếp được.
  - Mỗi yêu cầu gửi lên có giới hạn kích thước, mặc định 64 KB. Vượt thì báo lỗi loại "Quá dài".
  - Mọi con số chỉnh bằng cấu hình, không sửa code. Con số sai (ví dụ 0) thì hệ thống không khởi động và báo tên mục sai.
  - Nếu đặt sau máy chủ trung gian, hệ thống phải nhận đúng địa chỉ của từng người dùng. Nếu không, mọi người dùng bị tính chung một giới hạn (câu hỏi mở 10).

**Hiệu năng** (vượt là lỗi chặn)

- BR-9: Ngân sách hiệu năng:
  - Mở trang lần đầu trên điện thoại qua mạng 4G (đo bằng chế độ giả lập 4G chậm): điểm hiệu năng Lighthouse cho điện thoại ≥ 85. Phần mã tải lúc mở trang ≤ 200 KB sau nén.
  - Gõ tìm kiếm: kết quả hiện trong ≤ 200 ms tính từ phím cuối, với khoảng 1.000 thủ tục (F04 AC-4).
  - Máy chủ trả dữ liệu danh mục và câu trả lời của trợ lý: 95% yêu cầu xong trong ≤ 300 ms.
  - Trợ lý, mã QR, phần đọc câu trả lời chỉ tải khi dùng tới (F05 BR-2, F07 BR-4).
  - Đạt các chỉ tiêu của TT 22/2023 (tuan-thu T17, T18):
    - Ở băng thông 100 Mbps: nội dung đầu tiên hiện < 3 giây; nội dung lớn nhất hiện < 4 giây; tải đủ nội dung < 5,8 giây; mỗi yêu cầu khi tải trang < 0,6 giây.
    - Chịu được 500 truy cập đồng thời, trong đó ít nhất 1/6 (84 người) đang thao tác: thời gian phản hồi trung bình < 2,5 giây, chậm nhất < 30 giây.
  - Điều kiện đo: khi đo thời gian phản hồi và chịu tải, giới hạn tần suất ở môi trường đo được đặt đủ lớn (BR-8 cho phép chỉnh) để không yêu cầu nào bị chặn.
- BR-10: Bộ nhớ đệm không được làm người dùng thấy nội dung cũ:
  - Lần mở sau không tải lại phần mã đã có. Khi triển khai bản mới, lần mở trang kế tiếp nhận bản mới mà không phải xoá bộ nhớ đệm.
  - Ở chế độ chạy thật, sau một lần nhập dữ liệu thành công (F01), lần tải trang kế tiếp thấy dữ liệu mới, không phải chờ bộ nhớ đệm hết hạn.

**Dùng chung**

- BR-11: Khả năng tiếp cận theo tuan-thu (A1, A2, T16, W1–W5) và design-system §6. Nhắm WCAG 2.1 mức AA (người dùng chốt 2026-10-12, dùng trong lúc chờ đơn vị CNTT xác nhận mức bắt buộc — câu hỏi mở 20).
  - Dùng được toàn bộ bằng bàn phím; luôn nhìn thấy phần tử đang được chọn (focus).
  - Tương phản đủ. Không truyền thông tin chỉ bằng màu.
  - Phóng to 200% không mất nội dung, không phải cuộn ngang.
  - Có khai báo ngôn ngữ, tiêu đề trang, lối bỏ qua khối lặp (F08 BR-9, BR-12).
  - Máy đã tắt hiệu ứng chuyển động thì trang không chạy hiệu ứng.
  - Yêu cầu chi tiết cho từng thành phần: C01 BR-1.
- BR-12: Câu chữ quản lý tập trung:
  - Mọi câu chữ cố định trên giao diện (nhãn, nút, thông báo, tiêu đề tab) nằm trong file ngôn ngữ. Muốn đổi câu chữ thì chỉ sửa file ngôn ngữ rồi đóng gói lại, không sửa màn hình hay logic.
  - Còn câu chữ viết thẳng trong màn hình thì không đóng gói được.
  - Máy chủ không trả câu chữ, chỉ trả loại lỗi. Loại lỗi lạ thì hiện câu của loại "Khác" ở BR-6.
  - Thông báo của công cụ nhập dữ liệu (F01) nằm trong tệp thông báo riêng, tách khỏi chương trình.
  - Không thuộc file ngôn ngữ: dữ liệu nạp qua F01 (thủ tục, thông tin trung tâm, ô dịch vụ, câu trả lời mẫu), và dữ liệu mẫu đi kèm ở chế độ demo (BR-16).
- BR-13: Theo dõi tình trạng. Kỹ thuật hoặc công cụ giám sát dùng hai điểm kiểm tra:
  - "Còn chạy": ứng dụng còn trả lời, không cần dữ liệu.
  - "Sẵn sàng": kiểm thêm dữ liệu đã dùng được chưa. Điểm kiểm tra trả kết quả trong ≤ 2 giây, kể cả khi không kết nối được dữ liệu.
    - Chế độ chạy thật: kiểm kết nối tới cơ sở dữ liệu. Thời gian chờ khi kiểm kết nối mặc định 1 giây, chỉnh bằng cấu hình.
    - Chế độ demo: báo tốt khi dữ liệu mẫu đã nạp xong; không kiểm cơ sở dữ liệu (BR-16).
  - Kết quả chỉ ghi tốt hoặc không tốt, không kèm thông tin kỹ thuật.
  - Tạm thời hai điểm kiểm tra mở công khai, có giới hạn tần suất (BR-8). Ai theo dõi, báo cho ai, có chặn truy cập từ Internet không: chờ đơn vị CNTT, xem lại ở giai đoạn 8 (câu hỏi mở 28).
- BR-14: Trình duyệt hỗ trợ — danh sách chính thức (người dùng chốt 2026-10-12, câu hỏi mở 27):
  - Chrome, Edge, Cốc Cốc, Samsung Internet: bản tương đương Chrome 111 trở lên.
  - Firefox 114 trở lên.
  - Safari trên iOS / macOS 16.4 trở lên.
  - Trình duyệt mở link trong Zalo, trên máy có trình duyệt hệ thống đạt mức ở trên.

  Trên mọi trình duyệt trong danh sách, các luồng chính chạy đúng và hiện đúng tiếng Việt (tuan-thu T15). Không hỗ trợ bản cũ hơn (vd. iPhone không lên được iOS 16.4) và Internet Explorer: trang chỉ hiện một dòng hướng dẫn dùng trình duyệt khác, kèm số điện thoại Trung tâm lấy từ dữ liệu Trung tâm (F01); không lấy được số thì chỉ hiện dòng hướng dẫn, không có số (người dùng chốt 2026-10-12). Trình duyệt của kiosk: câu hỏi mở 10.
- BR-15: Mở thẳng hoặc tải lại bất kỳ địa chỉ nào của trang (link chia sẻ, QR, link thủ tục) thì hiện đúng trang đó. Địa chỉ không có thì hiện trang 404 của F08 BR-10, không báo lỗi hệ thống.

**Chế độ dữ liệu**

- BR-16: Hai chế độ dữ liệu (người dùng quyết 2026-10-12). Kỹ thuật chọn chế độ bằng cấu hình, không sửa chương trình.
  - **Chạy thật**: dùng dữ liệu nhập qua công cụ nhập (F01), lưu trong cơ sở dữ liệu.
  - **Demo**: dùng bộ dữ liệu mẫu đi kèm bản phát hành (du-lieu.md mục "Dữ liệu mẫu đi kèm"); không cần cơ sở dữ liệu.
  - Ở chế độ demo:
    - Mọi màn hình chạy như chạy thật, trên dữ liệu mẫu: trang chủ, danh mục, lĩnh vực và mã QR, popup chi tiết, trợ lý, đọc câu trả lời, kiosk. Các quy tắc khác của F00 vẫn áp dụng (an toàn, lỗi, giới hạn tần suất, câu chữ).
    - Câu trợ lý chưa trả lời được chỉ giữ tới khi tắt ứng dụng, thay cho 90 ngày ở F06 BR-12.
    - Không nhập dữ liệu mới được: F01 chỉ áp cho chế độ chạy thật, kể cả lệnh xuất câu chưa trả lời. Dữ liệu mẫu chỉ đổi khi có bản phát hành mới.
    - "Sẵn sàng" báo tốt khi dữ liệu mẫu đã nạp xong (BR-13).
  - Chế độ demo không dùng để mở cho dân. Trước khi mở cho dân phải chuyển sang chạy thật và nhập dữ liệu thật (kế hoạch 8.5b).
  - Tiêu chí chấp nhận của mọi spec có bước nhập dữ liệu, xuất câu chưa trả lời, hoặc dừng cơ sở dữ liệu thì kiểm ở chế độ chạy thật.
  - Chọn chế độ (người dùng chốt 2026-10-12, câu hỏi mở 39):
    - Máy phát triển mặc định chạy chế độ demo.
    - Môi trường triển khai bắt buộc khai chế độ. Không khai thì ứng dụng không khởi động và báo tên mục cấu hình còn thiếu, không tự chọn chế độ nào. Vì vậy quên đổi sang chạy thật thì lộ ngay, không chạy âm thầm bằng dữ liệu mẫu.
  - Trang không có dấu hiệu "bản chạy thử" nào: ở chế độ demo, giao diện giống hệt chạy thật.
  - Dòng "Dữ liệu thủ tục cập nhật ngày …" vẫn hiện ở chế độ demo, với ngày của bộ dữ liệu mẫu (F08 BR-6).

## Tiêu chí chấp nhận

Kiểm trên bản đóng gói như khi triển khai, không phải bản đang phát triển. Kiểm ở chế độ chạy thật, trừ AC-24, AC-25, AC-26 và chỗ ghi rõ chế độ demo.

- AC-1: Gõ `http://<tên miền>` → trang tự chuyển sang `https://` và hiện bình thường.
- AC-2: Mở trang chủ, danh mục, lĩnh vực, popup chi tiết, khung trợ lý, xem bằng công cụ dành cho nhà phát triển của trình duyệt → mọi tệp đều tải từ chính tên miền; không có cảnh báo vi phạm chính sách nội dung.
- AC-3: Nhúng trang vào khung của một trang khác → trình duyệt không hiện trang. Dùng hết các trang và trợ lý → trình duyệt không lần nào hỏi quyền micro, camera hay vị trí.
- AC-4: Gây lỗi máy chủ ở môi trường thử:
  - Màn hình hiện câu "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.", nút "Thử lại", số điện thoại trung tâm và mã tra cứu.
  - Mã tra cứu có đúng 8 ký tự, chỉ gồm chữ hoa A–Z và chữ số, không có ký tự nào trong `0 O 1 I L`.
  - Gây lỗi thêm 2 lần → mỗi lần một mã khác nhau. Tìm từng mã trong nhật ký máy chủ → thấy đúng lần lỗi tương ứng.
  - Dữ liệu máy chủ trả về không có dấu vết lỗi, tên tệp, câu lệnh, tên hay phiên bản phần mềm.
- AC-5: Ở môi trường thử, gây lần lượt từng loại lỗi ở BR-6 trên màn hình không đặt câu riêng: tắt mạng; vượt giới hạn tần suất; mở nội dung không có; gây lỗi máy chủ; gửi dữ liệu sai; gửi yêu cầu lớn hơn 64 KB; gửi yêu cầu bằng thao tác hệ thống không nhận (ví dụ yêu cầu xoá gửi tới địa chỉ danh mục — loại "Không hỗ trợ") → mỗi trường hợp hiện đúng nguyên văn câu ở cột "Câu hiển thị" của loại đó. Không trường hợp nào hiện mã kỹ thuật.
- AC-6: Tải về mọi tệp của trang → không có bản đồ mã nguồn. Tên biến và chuỗi chữ trong mã của dự án không đọc được ở dạng thường. Không có thông tin kết nối dữ liệu hay mật khẩu. Thư mục cài đặt máy chủ không có tệp gỡ lỗi.
- AC-7: Ở chế độ chạy thật, khởi động máy chủ khi thiếu thông tin kết nối dữ liệu → máy chủ dừng, báo tên mục còn thiếu, không in giá trị nào. Ở cả hai chế độ: đặt giới hạn tần suất bằng 0 → máy chủ không khởi động, báo tên mục sai.
- AC-8: Đặt giới hạn danh mục 5 yêu cầu/phút rồi tải lại trang danh mục liên tục:
  - Từ lần thứ 6 trong cùng một phút, trang hiện đúng câu "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại." và không hỏng.
  - Sang phút sau, trang dùng lại được.
  - Đổi giới hạn về 300 rồi khởi động lại → giới hạn mới có hiệu lực, không sửa code.
- AC-9: Đo trang chủ, danh mục, lĩnh vực bằng Lighthouse chế độ điện thoại → mỗi trang đạt ≥ 85 điểm hiệu năng; phần mã tải lúc mở trang ≤ 200 KB sau nén.
- AC-10: Đặt giới hạn tần suất ở môi trường đo đủ lớn để không yêu cầu nào bị chặn (BR-9, điều kiện đo). Với dữ liệu khoảng 1.000 thủ tục, gửi 1.000 yêu cầu danh mục và 1.000 câu hỏi trợ lý → không yêu cầu nào bị từ chối vì giới hạn; 95% có trả lời trong ≤ 300 ms, tính tại máy chủ.
- AC-11: Mở trang lần thứ hai → phần mã đã có không tải lại. Triển khai bản mới rồi mở lại trang → thấy ngay bản mới, không phải xoá bộ nhớ đệm. Nhập dữ liệu thủ tục mới thành công rồi tải lại trang danh mục → thấy ngay dữ liệu mới.
- AC-12: Khả năng tiếp cận:
  - Chạy công cụ kiểm tra khả năng tiếp cận tự động trên mọi trang, kể cả popup, khung trợ lý, trang 404 → không còn lỗi mức nghiêm trọng hay cao.
  - Chỉ dùng bàn phím để tìm một thủ tục, mở chi tiết, đóng, rồi hỏi trợ lý → làm được hết.
  - Phóng to 200% ở khổ 1280 px → không mất nội dung, không phải cuộn ngang.
  - Bật "giảm chuyển động" trên máy → trang không còn hiệu ứng chuyển động.
- AC-13: Đổi câu "Thử lại" thành "Tải lại" trong file ngôn ngữ rồi đóng gói lại → mọi chỗ có câu đó đều đổi theo, không phải sửa tệp màn hình nào. Máy chủ trả một loại lỗi chưa có trong file ngôn ngữ → trang hiện câu "Có lỗi xảy ra. Vui lòng thử lại."
- AC-14: Theo dõi tình trạng ở chế độ chạy thật (thời gian chờ mặc định 1 giây). Chế độ demo: AC-24.
  - Khi dữ liệu đang chạy: hai điểm kiểm tra đều báo tốt.
  - Dừng cơ sở dữ liệu → "Còn chạy" vẫn báo tốt; "Sẵn sàng" báo không tốt, trả kết quả trong ≤ 2 giây.
  - Chặn đường mạng tới cơ sở dữ liệu, để máy chủ dữ liệu không trả lời → "Sẵn sàng" vẫn trả "không tốt" trong ≤ 2 giây, không bị treo.
  - Kết quả không có thông tin kỹ thuật. Bật lại cơ sở dữ liệu → "Sẵn sàng" báo tốt.
- AC-15: Trên từng trình duyệt trong danh sách ở BR-14, thử bản thấp nhất được hỗ trợ và bản mới nhất; với Zalo, mở link trang từ tin nhắn trên một điện thoại Android và một iPhone → tìm thủ tục, mở chi tiết, hỏi trợ lý đều chạy đúng, chữ tiếng Việt hiện đủ dấu.
- AC-16: Mở thẳng địa chỉ danh mục đã lọc "Hộ tịch" rồi tải lại trang → vẫn đúng trang, đúng lọc. Mở `/abc-xyz` → hiện trang 404 (F08 AC-9), không phải thông báo lỗi hệ thống.
- AC-17: Kiểm bản triển khai bằng công cụ kiểm tra cấu hình TLS:
  - Kết nối bằng TLS 1.0 hoặc 1.1 → bị từ chối. Kết nối bằng TLS 1.2 hoặc 1.3 → được.
  - Mọi phản hồi qua HTTPS có header `Strict-Transport-Security` với thời hạn 1 năm.
  - Sau lần vào đầu, gõ lại `http://<tên miền>` → trình duyệt tự đi thẳng `https://`.
- AC-18: Đo trang chủ, danh mục, lĩnh vực ở băng thông 100 Mbps → nội dung đầu tiên hiện < 3 giây, nội dung lớn nhất < 4 giây, tải đủ < 5,8 giây, mỗi yêu cầu khi tải trang < 0,6 giây (tuan-thu T17).
- AC-19: Đặt giới hạn tần suất như AC-10. Thử tải 500 truy cập đồng thời, trong đó 84 người cùng thao tác (tìm, mở chi tiết, hỏi trợ lý) → thời gian phản hồi trung bình < 2,5 giây, chậm nhất < 30 giây (tuan-thu T18).
- AC-20: Mở trang chủ, xem các tệp đã tải bằng công cụ dành cho nhà phát triển → chưa có phần trợ lý, phần vẽ QR, phần đọc câu trả lời.
  - Bấm nút "Trợ lý" → lúc này phần trợ lý mới tải.
  - Vào trang lĩnh vực → phần vẽ QR mới tải.
  - Bật đọc câu trả lời → phần đọc mới tải.
- AC-21: Đổi một câu thông báo của công cụ nhập dữ liệu trong tệp thông báo riêng, đóng gói lại công cụ → công cụ in câu mới; không sửa dòng lệnh chương trình nào.
- AC-22: Ở môi trường thử, hỏi trợ lý "số 0912345678, CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu" (BR-5). Tìm trong nhật ký máy chủ → không thấy "0912345678", "079123456789", "nguyenvana@gmail.com" ở bất kỳ dòng nào; dòng nào có ghi câu hỏi thì chỉ thấy bản đã che "09******78", "07********89", "n***@gmail.com" (cách che của F06 BR-8).
- AC-23: Mở trang bằng Internet Explorer 11, và bằng Safari trên iPhone chạy iOS 15 → trang chỉ hiện một dòng hướng dẫn dùng trình duyệt khác, kèm số điện thoại Trung tâm; không có trang trắng hay thông báo lỗi kỹ thuật. Dữ liệu Trung tâm thiếu số điện thoại, hoặc không lấy được → chỉ có dòng hướng dẫn, không có số, không có chỗ trống.
- AC-24: Chế độ demo, trên máy không có cơ sở dữ liệu và không có thông tin kết nối:
  - Khai chế độ demo rồi khởi động ứng dụng → chạy bình thường, không báo thiếu thông tin kết nối. "Còn chạy" và "Sẵn sàng" đều báo tốt, trả kết quả trong ≤ 2 giây.
  - Mở trang chủ → thấy ô dịch vụ, giờ làm việc, khối thủ tục thường gặp.
  - Ở danh mục, gõ "dang ky khai sinh" → thủ tục "Đăng ký khai sinh" (mã 1.001193, có trong dữ liệu mẫu) hiện trong kết quả; mở chi tiết → popup có đủ trình tự, thành phần hồ sơ, thời hạn như ở chế độ chạy thật. Vào trang lĩnh vực → thấy các lĩnh vực và mã QR.
  - Xem Trung tâm: chân trang có đủ 5 mục bắt buộc (F08 BR-3); hỏi trợ lý "trung tâm ở đâu" → địa chỉ trong dữ liệu mẫu.
  - Hỏi trợ lý "giá vàng hôm nay" → câu xin lỗi kèm nút gọi Trung tâm (F06 AC-4).
  - Không màn hình nào hiện thông báo lỗi.
- AC-25: Máy có cơ sở dữ liệu, đã nhập qua F01 dữ liệu Trung tâm thử có tên "Trung tâm thử A":
  - Chạy ở chế độ demo → đầu trang hiện tên Trung tâm của dữ liệu mẫu, không phải "Trung tâm thử A".
  - Đổi cấu hình sang chạy thật rồi khởi động lại → đầu trang hiện "Trung tâm thử A"; không sửa chương trình.
  - Đổi cấu hình về demo, khởi động lại → lại hiện dữ liệu mẫu.
- AC-26: Bản đóng gói như khi triển khai, không khai chế độ dữ liệu → ứng dụng không khởi động, báo tên mục cấu hình còn thiếu, không có dữ liệu mẫu nào được phục vụ. Khai chế độ demo → khởi động, chạy bằng dữ liệu mẫu. Khai chế độ chạy thật với đủ thông tin kết nối → khởi động, chạy bằng dữ liệu nhập. Trang ở chế độ demo không có dòng chữ nào ghi "chạy thử" hay "dữ liệu mẫu" (trừ nhãn trong chính dữ liệu mẫu, vd. người chịu trách nhiệm) — giao diện giống chạy thật.

## Câu hỏi mở

- Câu hỏi mở 10 — nơi triển khai, máy chủ trung gian (BR-1, BR-8); trình duyệt của kiosk (BR-14).
- Câu hỏi mở 19 — mã giám sát EMC, ngoại lệ của BR-2 (chờ đơn vị CNTT).
- Câu hỏi mở 20 — mức WCAG bắt buộc (tạm nhắm 2.1 AA), cấp độ an ninh mạng (chờ đơn vị CNTT).
- Câu hỏi mở 28 — ai theo dõi tình trạng hệ thống (chờ đơn vị CNTT; tạm mở công khai có giới hạn tần suất).
- Đã trả lời 2026-10-12: câu 16 (trợ lý 60 câu/phút), câu 27 (danh sách trình duyệt chính thức), câu 39 (chế độ mặc định, dấu hiệu bản demo, dòng ngày cập nhật — BR-16).
