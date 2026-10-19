---
id: F06
ten: Trợ lý trả lời câu hỏi
trang_thai: dang-lam
nguon: Vàm Cỏ — lớp trả lời theo luật của chatbot (detectIntent, answerIntent, answerQuayPhuTrach, timTheoTen; chủ đề gợi ý CHIPS, aichatAskLinhVuc, searchByLinhVucExact; SYNONYM_MAP); Cần Đước — nút "Gọi Trung tâm", "Mở Zalo" trong khung chat; câu hỏi về Trung tâm — prototype .specify/prototype/index.html và yêu cầu của bên điều phối ngày 2026-10-09; câu trả lời của người dùng ngày 2026-10-12 (câu hỏi mở 6, 9, 14, 16, 21, 33, 36); quyết định của người dùng ngày 2026-10-12 về chế độ demo (F00 BR-16); các quyết định của kế hoạch F06 (Cần hỏi 1–7) ghi vào spec 2026-10-13 theo góp ý của tester
---

# F06 · Trợ lý trả lời câu hỏi

## Mục tiêu

Người dân hỏi bằng lời thường ("làm khai sinh cần gì", "nộp ở quầy mấy") và nhận câu trả lời từ dữ liệu có sẵn, không dùng AI, không tốn phí.

## Phạm vi

- Trong:
  - Nút trợ lý nổi, khung chat, chủ đề gợi ý (BR-11).
  - Trả lời từ dữ liệu thủ tục, phân công quầy, nhân sự, câu hỏi mẫu, thông tin Trung tâm (BR-9).
  - Nhớ thủ tục đang nói tới để hỏi tiếp.
  - Ghi lại câu chưa trả lời được.
  - Nút gọi trung tâm / mở Zalo (BR-10).
  - Câu hỏi chung về tổ hành chính lưu động: trả lời bằng câu hỏi mẫu, nếu Trung tâm thêm vào file nhập (câu hỏi mở 33).
- Ngoài: trả lời bằng AI/LLM (để sau, thiết kế chừa chỗ gắn thêm); đọc câu trả lời (F07); hỏi bằng giọng nói qua micro (đã bỏ — quyết định 2026-10-08); lịch lưu động theo buổi (F10 hoãn).

## Quy tắc nghiệp vụ

- BR-1: Thứ tự xử lý một câu hỏi:
  1. Hỏi về quầy hoặc nhân sự → trả lời theo bảng phân công (BR-3). Khớp một câu thuộc nhóm câu hỏi về Trung tâm → trả lời theo BR-9.
  2. Khớp câu hỏi mẫu đủ chắc → trả câu trả lời mẫu.
  3. Hỏi một mục cụ thể (đúng 7 mục: thời hạn, hồ sơ, phí, nơi nộp, trình tự, kết quả, căn cứ) và xác định được thủ tục → trả đúng mục đó. Xác định thủ tục bằng: tìm được thủ tục đủ chắc, hoặc dùng thủ tục đang nói tới. Không có mục "điều kiện, yêu cầu": trợ lý không trả lời riêng mục này, người dân xem trong popup chi tiết (F03 BR-3).
  4. Chỉ tìm được thủ tục → tối đa 5 thủ tục gần nhất, kèm gợi ý hỏi tiếp.
  5. Không khớp gì → câu xin lỗi + nút gọi trung tâm / mở Zalo (BR-10); ghi câu đó vào danh sách câu chưa trả lời. Cũng vào bước này:
     - Hỏi một mục cụ thể nhưng không xác định được thủ tục (vừa mở trợ lý, hoặc sau "Bắt đầu lại"; vd. chỉ hỏi "mấy ngày").
     - Lời chào, cảm ơn ("xin chào", "cảm ơn"): coi như không hiểu, trợ lý không đáp lời chào.
  - Ngoại lệ không ghi vào danh sách câu chưa trả lời: hỏi quầy hoặc nơi nộp mà không nêu được lĩnh vực hay thủ tục (vd. "nộp ở quầy nào") → trả "hồ sơ nộp tại Trung tâm" kèm gợi ý nêu lĩnh vực hoặc tên thủ tục (BR-3).
- BR-2: So khớp không dấu, chịu được lỗi gõ nhẹ và từ đồng nghĩa, viết tắt (du-lieu.md).
- BR-3: Không đoán quầy, không đoán cán bộ (câu hỏi mở 6):
  - Lĩnh vực chưa có quầy → nói nộp hồ sơ tại Trung tâm; không nêu số quầy, tên cán bộ nào.
  - Lĩnh vực đã có quầy nhưng chưa có nhân sự (hỏi "ai phụ trách …") → nêu số quầy theo phân công, không nêu tên cán bộ nào. Số quầy là dữ liệu thật, không phải đoán.
  - Chưa có dữ liệu nhân sự nào và cũng chưa có phân công → nói nộp hồ sơ tại Trung tâm, không số quầy, không tên.
  - Hỏi quầy hoặc nơi nộp mà không nêu được lĩnh vực hay thủ tục → "hồ sơ nộp tại Trung tâm", kèm gợi ý nêu lĩnh vực hoặc tên thủ tục; không ghi vào danh sách câu chưa trả lời.
  - Áp dụng cho mọi câu trả lời có nhắc tới quầy: hỏi quầy, hỏi cán bộ phụ trách, hỏi nơi nộp của một thủ tục, chủ đề gợi ý (BR-11).
  - Bản đầu chưa có phân công, nhân sự (F01 BR-9). Nhập file sau đó → câu trả lời có số quầy, cán bộ, không sửa code.
- BR-4: Việc xử lý câu hỏi nằm ở máy chủ. Trình duyệt chỉ gửi câu hỏi và thủ tục đang nói tới, nhận về câu trả lời.
- BR-5: Câu hỏi tối đa 500 ký tự. Giới hạn 60 câu mỗi phút cho mỗi địa chỉ mạng, tính cả trường hợp nhiều người dùng chung kiosk (F09 BR-5, câu hỏi mở 16). Con số đặt trong cấu hình, đổi không sửa code. "Mỗi phút" là cửa sổ cố định theo cấu hình giới hạn tần suất sẵn có (F00 BR-8): trong mỗi cửa sổ 1 phút được tối đa 60 câu, hết cửa sổ thì đếm lại từ đầu. Không phải "60 câu trong 60 giây bất kỳ"; sát ranh giới hai cửa sổ có thể nhận hơn 60 câu trong thời gian ngắn.
- BR-6: Câu trả lời có nhắc tới thủ tục thì mỗi thủ tục có nút mở popup chi tiết (F03 BR-5) và liên kết "Xem và nộp trên Cổng DVC" (F03 BR-4, giống Vàm Cỏ — câu hỏi mở 36). Popup mở từ trợ lý cũng đưa mã thủ tục lên địa chỉ trang (F03 BR-8). Đóng popup thì khung chat và hội thoại vẫn còn nguyên.
- BR-7: Câu chưa trả lời giống nhau được gộp, tăng số lần gặp.
- BR-8: Câu hỏi có thể chứa thông tin cá nhân (số CCCD, số điện thoại, email). Phải che các thông tin này trước khi lưu vào danh sách câu chưa trả lời:
  - Số CCCD, số điện thoại: giữ 2 chữ số đầu và 2 chữ số cuối, các chữ số giữa thay bằng `*`.
  - Email: giữ ký tự đầu và phần từ `@` trở đi, phần còn lại thay bằng `***`.
- BR-9: Câu hỏi về Trung tâm. Trợ lý nhận ra nhờ nhóm câu hỏi về Trung tâm trong file nhập: mỗi câu, kèm các cách hỏi khác, gắn với một mục thông tin Trung tâm (du-lieu.md, F01 BR-12). Trung tâm thêm cách hỏi bằng file nhập, không sửa code. Câu trả lời lấy từ thông tin Trung tâm đã nhập (F01) tại lúc hỏi; câu trả lời mẫu không chép các giá trị này. Giá trị thật: `can-giuoc.md`.
  - Địa chỉ, "trung tâm ở đâu" → địa chỉ, kèm link bản đồ nếu có.
  - Giờ làm việc → giờ của các ngày làm việc, gộp ngày như F02 BR-8, ghi chú ngày nghỉ (nếu có), kèm trạng thái đang trong / ngoài giờ tính như F02 BR-2.
  - Điện thoại, email → số điện thoại và email của Trung tâm, bấm được theo C01 BR-3.
  - Nộp hồ sơ trực tuyến ở đâu → liên kết "Cổng Dịch vụ công Quốc gia" trong danh sách liên kết của Trung tâm (`lien-ket.md` §1).
  - Mục được hỏi chưa có dữ liệu → nói rõ chưa có thông tin, kèm nút gọi trung tâm; không đoán.
  - Câu có nêu thủ tục, hoặc hỏi nơi nộp khi đang nói tới một thủ tục → không theo quy tắc này mà theo bước 3 của BR-1 (nơi nộp của thủ tục đó).
- BR-10: Nút gọi trung tâm dùng số điện thoại của Trung tâm. Nút mở Zalo chỉ hiện khi dữ liệu có Zalo OA; không có thì chỉ còn nút gọi. Bản đầu để trống Zalo OA nên nút Zalo ẩn; có link thì nhập lại file (câu hỏi mở 14).
- BR-11: Chủ đề gợi ý (như Vàm Cỏ; bản đầu 6 chủ đề — du-lieu.md):
  - Khung trợ lý hiện các chủ đề theo thứ tự trong dữ liệu (F01 BR-13). Không có chủ đề nào thì không có khu vực chủ đề.
  - Bấm một chủ đề → câu trả lời liệt kê thủ tục thuộc đúng lĩnh vực gắn với chủ đề, ở cả danh mục cấp xã và cấp tỉnh, mỗi thủ tục một lần. Không lẫn lĩnh vực khác có chung chữ (vd. "Chăn nuôi" không ra thủ tục lĩnh vực "Nuôi con nuôi").
  - Câu trả lời ghi tổng số thủ tục của lĩnh vực, hiện tối đa 10 thủ tục (như Vàm Cỏ), mỗi thủ tục có nút mở popup (BR-6), kèm gợi ý gõ tên thủ tục để hỏi thêm; kèm nơi nộp theo BR-3.
  - Lĩnh vực của chủ đề không có thủ tục nào → câu "chưa có thủ tục nào thuộc lĩnh vực này".
- BR-12: Câu chưa trả lời (đã che theo BR-8) giữ 90 ngày kể từ lần gặp cuối, rồi tự xoá, không cần ai chạy lệnh. Gặp lại trước hạn thì tính lại 90 ngày từ lần gặp mới (câu hỏi mở 21).
  - Ngoại lệ ở chế độ demo (F00 BR-16): câu chưa trả lời chỉ giữ tới khi tắt ứng dụng, vẫn che và gộp theo BR-7, BR-8. Không xuất ra Excel được, vì F01 chỉ áp cho chế độ chạy thật.
- BR-13: Hội thoại chỉ nằm trên màn hình của trình duyệt đang mở, không lưu ở đâu khác (kiosk dùng chung, F09 BR-3). Tải lại trang (hoặc bấm "Bắt đầu lại" trên kiosk) thì hội thoại và thủ tục đang nói tới mất. Đóng khung chat rồi mở lại, đổi trang trong ứng dụng thì hội thoại vẫn còn.
- BR-14: Giới hạn số mục trong một câu trả lời (như Vàm Cỏ): hồ sơ 8 giấy tờ; trình tự 2 bước, mỗi bước tối đa 500 ký tự; kết quả 6; căn cứ pháp lý 6 văn bản, mỗi văn bản 200 ký tự; cán bộ phụ trách 10; thủ tục gần nhất 3 (ngoài thủ tục chính); danh sách thủ tục 5 (BR-1 bước 4), chủ đề 10 (BR-11). Quá giới hạn thì cắt, phần còn lại xem trong popup chi tiết.

## Tiêu chí chấp nhận

Dữ liệu thử của trợ lý có nhóm câu hỏi về Trung tâm và 6 chủ đề gợi ý như bản đầu (du-lieu.md), trừ khi AC ghi khác. AC có bước nhập dữ liệu hoặc xuất câu chưa trả lời (F01) kiểm ở chế độ chạy thật (F00 BR-16).

- AC-1: "làm giấy khai sinh cần giấy tờ gì" → thành phần hồ sơ của thủ tục đăng ký khai sinh.
- AC-2: Hỏi tiếp "mấy ngày" → thời hạn của chính thủ tục đăng ký khai sinh.
- AC-3: Hỏi về quầy (dữ liệu có phân công):
  - "hộ tịch nộp quầy mấy" → số quầy theo bảng phân công.
  - Hỏi lĩnh vực chưa có quầy → câu nộp hồ sơ tại Trung tâm, không có số quầy nào.
- AC-4: "giá vàng hôm nay" → câu xin lỗi + nút gọi trung tâm / mở Zalo; câu này có trong file xuất câu chưa trả lời (F01 AC-5).
- AC-5: Gõ "khai sinh" sai thành "khai sjnh" → vẫn ra thủ tục đăng ký khai sinh.
- AC-6: Thời gian trả lời phía máy chủ p95 ≤ 300 ms với ~1.000 thủ tục. Khi đo, giới hạn số câu mỗi phút ở môi trường đo được đặt đủ lớn để không câu nào bị chặn (F00 BR-9, AC-10).
- AC-7: Đặt giới hạn 5 câu/phút trong cấu hình. Hỏi 5 câu trong 1 phút → đều có trả lời; câu thứ 6 → thông báo đúng câu của loại "Quá nhiều yêu cầu" ở F00 BR-6: "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.", trang không lỗi; hết phút đó → hỏi được tiếp.
- AC-8: Hỏi "số 0912345678 của tôi nộp hồ sơ chưa" (không trả lời được) → file xuất câu chưa trả lời ghi "09******78", không có số đầy đủ.
- AC-9: Câu trả lời ở AC-1 có nút xem chi tiết → bấm → mở popup của đúng thủ tục đăng ký khai sinh (F03 BR-5).
- AC-10: File câu hỏi mẫu có câu "điều kiện tách thửa đất" kèm câu trả lời mẫu → hỏi "dieu kien tach thua" → nhận đúng câu trả lời mẫu, không phải danh sách thủ tục (BR-1 bước 2).
- AC-11: Hỏi "kết hôn" (không nêu mục nào) → tối đa 5 thủ tục có chữ "kết hôn", kèm gợi ý hỏi tiếp như "cần giấy tờ gì", "mấy ngày" (BR-1 bước 4).
- AC-12: File nhân sự ghi một cán bộ phụ trách Đất đai ở quầy 4 → hỏi "ai phụ trách đất đai" → tên, chức vụ, quầy 4 của cán bộ đó (BR-1 bước 1).
- AC-13: Gửi câu dài đúng 500 ký tự → có trả lời. Ô nhập không nhận ký tự thứ 501 và báo "Tối đa 500 ký tự". Câu 501 ký tự gửi thẳng tới máy chủ (bỏ qua ô nhập) → bị từ chối, không được lưu.
- AC-14: Hỏi "giá vàng hôm nay" 2 lần → file xuất câu chưa trả lời có 1 dòng cho câu này, số lần gặp 2.
- AC-15: Bảng từ đồng nghĩa có "giấy khai sinh" ~ "khai sinh" → hỏi "xin giấy khai sinh" → ra thủ tục đăng ký khai sinh. Bảng viết tắt có "đk" → "đăng ký" → hỏi "đk kết hôn cần gì" → thành phần hồ sơ của thủ tục đăng ký kết hôn.
- AC-16: Hỏi "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu" (không trả lời được) → file xuất ghi "07********89" và "n***@gmail.com"; không có số và email đầy đủ.
- AC-17: Ở trang chủ, bấm nút xem chi tiết trong câu trả lời về đăng ký khai sinh → địa chỉ trang có mã 1.001193. Đóng popup hoặc bấm "Quay lại" → popup đóng, địa chỉ bỏ mã, khung chat và hội thoại vẫn còn.
- AC-18: Dữ liệu Trung tâm có địa chỉ "Địa chỉ thử A" → hỏi "trung tâm ở đâu" → trả lời "Địa chỉ thử A". Nhập lại dữ liệu Trung tâm với "Địa chỉ thử B", không sửa file câu hỏi mẫu → hỏi lại → "Địa chỉ thử B".
- AC-19: Giờ làm việc như F02 AC-2 (dữ liệu thử). 10:00 thứ Hai hỏi "mấy giờ làm việc" → giờ sáng, giờ chiều, các ngày làm việc, kèm "Đang trong giờ làm việc". 12:00 thứ Hai hỏi lại → kèm "Ngoài giờ làm việc".
- AC-20: Hỏi "số điện thoại trung tâm" → đúng số trong dữ liệu; bấm trên điện thoại → trình gọi mở đúng số. Hỏi "email trung tâm" → đúng email trong dữ liệu.
- AC-21: Mở trợ lý mới, hỏi "nộp hồ sơ trực tuyến ở đâu" → liên kết Cổng DVC Quốc gia đúng địa chỉ trong dữ liệu, bấm mở tab mới. Hỏi "đăng ký khai sinh nộp ở đâu" → nơi nộp của thủ tục đăng ký khai sinh, không phải câu trả lời chung về Trung tâm.
- AC-22: Dữ liệu Trung tâm không có link bản đồ → hỏi "trung tâm ở đâu" → chỉ có địa chỉ, không có link hay chỗ trống. Dữ liệu chưa có giờ làm việc → hỏi "giờ làm việc" → câu "chưa có thông tin" kèm nút gọi trung tâm, không có giờ nào được đoán.
- AC-23: Dữ liệu Trung tâm không có Zalo OA → hỏi "giá vàng hôm nay" → câu xin lỗi chỉ có nút gọi trung tâm, không có nút Zalo. Nhập lại dữ liệu có Zalo OA → hỏi lại → có thêm nút mở Zalo, mở tab mới đúng link.
- AC-24: Dữ liệu chưa có phân công và nhân sự (F01 AC-7):
  - "hộ tịch nộp quầy mấy" → câu nộp hồ sơ tại Trung tâm, không có số quầy nào.
  - "ai phụ trách đất đai" → câu nộp hồ sơ tại Trung tâm, không có tên cán bộ nào.
  - "đăng ký khai sinh nộp ở đâu" → nơi nộp của thủ tục, không có số quầy nào.
  - Nhập file phân công có Hộ tịch ở quầy 3 → hỏi lại câu đầu → "quầy 3", không sửa code.
- AC-25: Chủ đề gợi ý:
  - Mở trợ lý → thấy 6 chủ đề theo thứ tự trong file. Nhập lại file chỉ còn 5 chủ đề → khung hiện 5, không sửa code.
  - Bấm "Chăn nuôi" → các thủ tục lĩnh vực Chăn nuôi, có tổng số; không có thủ tục lĩnh vực "Nuôi con nuôi".
  - Bấm "Xây dựng" (gắn lĩnh vực "Hoạt động xây dựng") → các thủ tục lĩnh vực Hoạt động xây dựng.
  - Dữ liệu thử: chủ đề gắn lĩnh vực có 15 thủ tục → câu trả lời ghi 15, hiện 10 thủ tục. Chủ đề gắn lĩnh vực không có thủ tục nào → "chưa có thủ tục nào thuộc lĩnh vực này".
- AC-26: Thêm cách hỏi "văn phòng nằm chỗ nào" vào câu hỏi về địa chỉ trong file nhập → hỏi "van phong nam cho nao" → địa chỉ Trung tâm trong dữ liệu; không sửa code.
- AC-27: Giả lập ngày hệ thống. Câu "giá vàng hôm nay" gặp lần cuối 91 ngày trước, câu "xem bói" gặp lần cuối 89 ngày trước → xuất câu chưa trả lời (F01 AC-5): chỉ còn "xem bói". Hỏi lại "xem bói" hôm nay → sau 89 ngày nữa vẫn còn trong file xuất.
- AC-28: Để giới hạn mặc định, từ một địa chỉ mạng hỏi 60 câu trong 1 phút → đều có trả lời; câu thứ 61 → thông báo "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại." (F00 BR-6, như AC-7).
- AC-29: Câu trả lời ở AC-11 → mỗi thủ tục có liên kết "Xem và nộp trên Cổng DVC"; bấm liên kết của thủ tục đăng ký kết hôn → tab mới mở trang tra cứu đúng mã đó trên Cổng DVC (`lien-ket.md` §2); khung chat vẫn còn nguyên.
- AC-30: Mở trợ lý mới (chưa nói tới thủ tục nào), hỏi "mấy ngày" → câu xin lỗi + nút gọi Trung tâm, không có thời hạn của thủ tục nào; câu này có trong file xuất câu chưa trả lời (F01 AC-5). Làm lại sau khi bấm "Bắt đầu lại" trên kiosk → kết quả như vậy.
- AC-31: Hỏi "xin chào", rồi "cảm ơn" → mỗi câu cho câu xin lỗi + nút gọi Trung tâm (không đáp lời chào); cả hai có trong file xuất câu chưa trả lời.
- AC-32: Dữ liệu có phân công Đất đai ở quầy 4 nhưng chưa có nhân sự nào → hỏi "ai phụ trách đất đai" → câu nêu "Quầy 4", không có tên cán bộ nào. Dữ liệu chưa có cả phân công lẫn nhân sự → câu nộp hồ sơ tại Trung tâm, không số quầy, không tên (F06 AC-24).
- AC-33: Hỏi "nộp ở quầy nào" (không nêu lĩnh vực hay thủ tục, không có thủ tục đang nói tới) → câu "hồ sơ nộp tại Trung tâm" kèm gợi ý nêu lĩnh vực hoặc tên thủ tục; không có số quầy; câu này không có trong file xuất câu chưa trả lời.
- AC-34: Hỏi "điều kiện đăng ký khai sinh là gì" → không có câu trả lời riêng về điều kiện, yêu cầu; kết quả là danh sách thủ tục (nút mở popup xem đủ mục, kể cả điều kiện) hoặc câu xin lỗi.
- AC-35: Hỏi "làm giấy khai sinh cần giấy tờ gì" để có hội thoại, rồi tải lại trang (F5), mở trợ lý → hội thoại trống như lần mở đầu; hỏi "mấy ngày" → không ra thời hạn của đăng ký khai sinh (AC-30). Chỉ đóng rồi mở lại khung chat (không tải lại) → hội thoại còn nguyên.
- AC-36: Giới hạn mỗi phút là cửa sổ cố định (BR-5). Để giới hạn mặc định, từ một địa chỉ mạng hỏi 60 câu trong một cửa sổ → đều có trả lời, câu thứ 61 trong cùng cửa sổ bị từ chối (AC-28); sang cửa sổ kế tiếp hỏi được lại, bộ đếm bắt đầu từ 0. Không kiểm "60 câu trong 60 giây bất kỳ".

## Câu hỏi mở

- Câu hỏi mở 13 — giờ làm việc chính thức, bản đồ.
- Đã chấp nhận 2026-10-13: các câu "Cần hỏi" 1–7 của kế hoạch F06 — "mấy ngày" khi chưa có thủ tục → xin lỗi + ghi kho (BR-1, AC-30); chào, cảm ơn coi như không hiểu (AC-31); có quầy chưa có nhân sự → nêu quầy không nêu tên (BR-3, AC-32); hỏi quầy không nêu lĩnh vực → nộp tại Trung tâm, không ghi kho (BR-3, AC-33); số mục tối đa (BR-14); không hỏi "điều kiện, yêu cầu" (BR-1, AC-34); hội thoại mất khi tải lại (BR-13, AC-35).
- Đã trả lời 2026-10-12: câu 6 (quầy, nhân sự để trống), 9 (dữ liệu trợ lý ban đầu), 14 (Zalo OA để trống), 16 (60 câu/phút), 21 (giữ 90 ngày), 33 (F10 hoãn), 34 (email), 36 (liên kết Cổng DVC trong câu trả lời), 37 (nút "Bắt đầu lại" trên kiosk — F09 BR-7).
