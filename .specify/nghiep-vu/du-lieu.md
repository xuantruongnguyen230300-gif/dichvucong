# Dữ liệu nghiệp vụ

Mô tả dữ liệu ở mức nghiệp vụ. Tên bảng, cột cụ thể do `planner` và `db-dev` quyết, ghi trong `plan.md` của từng chức năng.

Nguồn: file Excel do trung tâm cung cấp, nạp bằng công cụ nhập (F01). Không có màn hình quản trị. Bản đầu của dữ liệu thật: mục "Bản đầu của dữ liệu thật".

Mục này mô tả dữ liệu ở chế độ chạy thật. Chế độ demo (F00 BR-16) dùng dữ liệu mẫu đi kèm bản phát hành, cùng các loại dữ liệu nhưng không nhập được: mục cuối file này.

## Thủ tục

| Trường | Ý nghĩa | Bắt buộc |
|---|---|---|
| Mã thủ tục | Mã TTHC, vd. `1.013314` | ✔ |
| Tên thủ tục | | ✔ |
| Lĩnh vực | | ✔ |
| Danh mục | Cấp xã, cấp tỉnh — một thủ tục có thể thuộc cả hai | ✔ |
| Mức độ | `Toàn trình` hoặc `Một phần` | ✔ |
| Cơ quan thực hiện | | |
| Yêu cầu, điều kiện | Điều kiện người làm thủ tục phải đáp ứng (nhập thêm theo trả lời 2026-10-12; Vàm Cỏ có ở 174/408 thủ tục) | |
| Trạng thái công bố | vd. `Công khai` | |
| Thời hạn giải quyết | vd. `2 ngày làm việc` | |
| Phí, lệ phí | | |
| Hình thức nộp | Trực tuyến, bưu chính, trực tiếp | |
| Trình tự thực hiện | Danh sách bước, có thể chia theo trường hợp | |
| Cách thức thực hiện | Hình thức nộp + thời gian + phí + mô tả | |
| Thành phần hồ sơ | Danh sách giấy tờ cần nộp; mỗi giấy tờ kèm số bản chính, số bản sao (nhập thêm theo trả lời 2026-10-12). Cả hai bằng 0 coi như chưa ghi (câu hỏi mở 38) | |
| Kết quả | Danh sách giấy tờ nhận được | |
| Căn cứ pháp lý | Số ký hiệu + trích yếu văn bản (chỉ hiển thị chữ, không link — giống Vàm Cỏ) | |
| Mã DVC | Mã dịch vụ công trực tuyến | |
| Đơn vị trên Cổng DVC | Tên và mã đơn vị cung cấp dịch vụ trên Cổng DVC Quốc gia, vd. Vàm Cỏ `H53.186`. Cần Giuộc dùng `H53.183` (người dùng chốt 2026-10-12; Trung tâm kiểm lại khi rà dữ liệu — câu hỏi mở 12, [can-giuoc.md](can-giuoc.md) §4) | |

Không có trường "ưu tiên": bỏ khái niệm thủ tục ưu tiên ngày 2026-10-12, vì trong dữ liệu Vàm Cỏ mọi thủ tục cấp xã đều là ưu tiên (câu hỏi mở 8).

Các trường khác của dữ liệu nguồn không nhập: đối tượng thực hiện, loại giấy tờ, ngày hiệu lực căn cứ, cơ quan cấp kết quả, cơ quan ban hành, số và ngày quyết định công bố, tên dịch vụ công, cấp thực hiện (F01 BR-16).

Chữ nhập vào được làm sạch: bỏ khoảng trắng đầu, cuối và ký tự vô hình, kể cả dấu định hướng chữ U+200E, U+200F. Dữ liệu Vàm Cỏ có 30 ký tự U+200E, U+200F lẫn trong chữ (F01 BR-18).

## Thủ tục thường gặp

Danh sách riêng, mỗi dòng: mã thủ tục, thứ tự hiển thị. Khối thủ tục thường gặp trên trang chủ (F03) hiện theo thứ tự này. Trung tâm thêm, bớt, đổi thứ tự bằng file nhập (F01 BR-15). Bản đầu 16 mã: mục cuối.

Chất lượng dữ liệu nguồn (phát hiện 2026-10-09 khi làm prototype): 77/408 thủ tục ghi thời hạn giải quyết chỉ là "Khác" (vd. "1 Khác"), không kèm mô tả — giao diện hiện "Chưa ghi rõ — xem trên Cổng DVC Quốc gia". Công cụ nhập (F01) nên cảnh báo các dòng này để trung tâm bổ sung.

Quy mô tham khảo (Vàm Cỏ): 266 thủ tục cấp xã, 408 cấp tỉnh, tổng 408 mã khác nhau, 74 lĩnh vực trong danh mục lĩnh vực (bản mẫu cho Cần Giuộc có 75 vì một lĩnh vực chỉ xuất hiện ở thủ tục). Dữ liệu mẫu cho Cần Giuộc nằm ở `data-mau/` — lấy từ Vàm Cỏ, đã đổi tên đơn vị, chỉ dùng ở máy dev; khác dữ liệu mẫu đi kèm của chế độ demo (mục cuối).

Đối chiếu: bộ TTHC cấp xã tỉnh Tây Ninh công bố ngày 23/6/2025 có khoảng 302 thủ tục (đếm theo tên file, CT), nhiều hơn 266 thủ tục cấp xã của Vàm Cỏ; chênh lệch chưa giải thích. Trung tâm rà các thủ tục còn thiếu trước khi mở cho dân (mục cuối, câu hỏi mở 2, [can-giuoc.md](can-giuoc.md) §4).

## Lĩnh vực

Tên; quầy phụ trách (số nguyên dương, có thể trống — không gán bừa); nơi tiếp nhận chuyển (vd. Đăng ký, quản lý cư trú → Công an).

Phân công lĩnh vực → quầy nằm ở file phân công, nhập riêng. Bản đầu để trống, chờ Trung tâm gửi (câu hỏi mở 6). Lĩnh vực chưa có quầy: trang lĩnh vực ẩn dòng quầy (F05 BR-4); trợ lý không nêu số quầy, chỉ nói nộp tại Trung tâm (F06 BR-3).

## Nhân sự

Tên, xưng hô (anh/chị), chức vụ, quầy (số nguyên dương hoặc trống), mô tả công việc. Bản đầu không có dòng nào, chờ Trung tâm gửi (câu hỏi mở 6).

## Trung tâm

Tên trung tâm, tên đơn vị hành chính, tỉnh, địa chỉ, điện thoại, email, link bản đồ, giờ làm việc (7 dòng, mỗi thứ một dòng có giờ buổi sáng, buổi chiều; ngày nghỉ để trống — trang tự gộp các ngày giống nhau, F02 BR-8), ghi chú ngày nghỉ, mạng xã hội (Zalo OA, YouTube, TikTok…), liên kết hữu ích (gồm cổng/trang thông tin điện tử mà trang trực thuộc).

Thêm cho chân trang (F08, TT 22/2023): cơ quan chủ quản; người chịu trách nhiệm nội dung và chức vụ. Cần Giuộc: cơ quan chủ quản là UBND xã, người chịu trách nhiệm nội dung là người giữ chức Giám đốc Trung tâm; họ tên chỉ có trong file nhập (câu hỏi mở 18). Email: email UBND xã cho tới khi Trung tâm có email riêng (câu hỏi mở 34). Giờ làm việc: bản đầu dùng giờ tạm, Trung tâm xác nhận trước khi chạy thật (câu hỏi mở 13).

Logo không nằm trong file nhập: là file ảnh của trang. Chưa có logo thật thì dùng biểu tượng chung; có logo thì thay file ảnh (F08 BR-14, câu hỏi mở 17).

Tên đơn vị hành chính ghi đủ cả loại đơn vị, vd. "xã Cần Giuộc". Chương trình không tự ghép chữ "xã" hay "phường": nếu xã thành phường thì chỉ nhập lại dữ liệu (câu hỏi mở 35, F08 BR-5).

Mã đơn vị của xã trên Cổng DVC Quốc gia: `H53.183` (câu hỏi mở 12).

Giá trị thật của Cần Giuộc, kèm nguồn và trạng thái xác minh: [can-giuoc.md](can-giuoc.md). Chỉ nhập mục đã xác minh hoặc đã được người dùng, trung tâm chốt; mục còn mở để trống (F08 BR-5 ẩn mục trống).

## Ô dịch vụ nhanh

Tên, mô tả ngắn, biểu tượng, link, thứ tự hiển thị. Mô tả ngắn được nhập nhưng chưa hiển thị ở đâu (F02 BR-11). Link có thể để trống: ô vẫn hiện, bấm không mở gì (C01 BR-12, câu hỏi mở 30).

## Câu hỏi mẫu (trợ lý)

Câu hỏi, các cách hỏi khác hoặc từ khoá, thủ tục liên quan (nếu có), và **một trong hai**:

- Câu trả lời viết sẵn.
- Mục thông tin Trung tâm: địa chỉ, giờ làm việc, điện thoại, email, nộp trực tuyến ở đâu. Trợ lý trả lời bằng giá trị đang có trong dữ liệu Trung tâm tại lúc hỏi (F06 BR-9).

Ví dụ câu trả lời viết sẵn: điều kiện tách thửa theo quyết định của tỉnh (Vàm Cỏ trả lời theo QĐ 139/2026/QĐ-UBND, hiệu lực 29/9/2026 — mới có nguồn báo chí, chưa thấy bản gốc; xem [can-giuoc.md](can-giuoc.md) §6).

**Nhóm câu hỏi về Trung tâm** là các câu hỏi mẫu gắn với mục thông tin Trung tâm. Câu trả lời mẫu không chép giá trị (địa chỉ, giờ, số điện thoại…), để đổi dữ liệu Trung tâm thì trợ lý trả lời theo ngay. Trung tâm thêm cách hỏi bằng file nhập.

## Chủ đề gợi ý (trợ lý)

Nút bấm nhanh trong khung trợ lý, mỗi chủ đề gắn với một lĩnh vực: tên hiển thị (ngắn, vd. "Bảo trợ XH"), tên lĩnh vực đúng như trong danh mục (vd. "Bảo trợ xã hội"), thứ tự hiển thị. Cách trả lời: F06 BR-11.

## Lịch hành chính lưu động (F10 — hoãn 2026-10-12, câu hỏi mở 33)

Mỗi buổi một dòng: ngày, buổi (sáng / chiều), ấp (tên ghi đủ, vd. "Ấp thử A" — chương trình không tự ghép chữ "Ấp"; F10 BR-1), địa điểm, lĩnh vực nhận hồ sơ, ghi chú (nếu có). Nạp qua công cụ nhập (F01) khi làm lại F10.

## Quy ước file nhập (F01)

Dùng cho quy tắc dòng lỗi ở F01 BR-14. Giá trị lấy theo kế hoạch F01; người dùng đồng ý quy tắc dòng lỗi ngày 2026-10-12.

- **Dấu đánh dấu** (vd. cột danh mục cấp xã, cấp tỉnh): chữ `x`, không phân biệt hoa thường (`x` hay `X` đều được). Ô trống là không đánh dấu. Giá trị khác là dòng lỗi.
- **Khoá biểu tượng ô dịch vụ:** `boc-so`, `danh-gia`, `tra-cuu-ho-so`, `thanh-toan`, `cong-dvc`, `cong-thong-tin`, `lien-ket`. Để trống thì dùng `lien-ket`. Khoá khác là dòng lỗi. Không còn `mot-cua` (đã bỏ ô "Hệ thống Một cửa tỉnh" — câu hỏi mở 32).
- **Nội dung chính của từng dòng chi tiết thủ tục:**

  | Chi tiết | Bắt buộc |
  |---|---|
  | Trình tự | Nội dung |
  | Cách thức | Ít nhất một trong: hình thức nộp, thời hạn, phí, mô tả |
  | Thành phần hồ sơ | Tên giấy tờ |
  | Kết quả | Tên kết quả |
  | Căn cứ pháp lý | Ít nhất một trong: số ký hiệu, trích yếu |

- **Độ dài tối đa** (vượt là dòng lỗi):

  | Trường | Tối đa (ký tự) |
  |---|---|
  | Mã thủ tục | 20 |
  | Mã DVC, mã đơn vị trên Cổng DVC, điện thoại | 30 |
  | Xưng hô | 20 |
  | Khoá biểu tượng | 30 |
  | Tên lĩnh vực | 200 |
  | Email | 254 |
  | Địa chỉ web | 2.000 |
  | Câu hỏi mẫu, mỗi cách hỏi khác | 500 (bằng giới hạn câu hỏi của F06 BR-5) |
  | Chữ khác | 32.767 (giới hạn một ô Excel) |

- **Mục thông tin Trung tâm của câu hỏi mẫu:** đúng một trong 5 mục: địa chỉ, giờ làm việc, điện thoại, email, nộp trực tuyến ở đâu.

## Câu chưa trả lời (trợ lý)

Nội dung câu hỏi (đã che thông tin cá nhân), số lần gặp, lần gặp cuối. Xuất ra Excel bằng công cụ nhập để bổ sung câu hỏi mẫu. Giữ 90 ngày kể từ lần gặp cuối rồi tự xoá (câu hỏi mở 21, F06 BR-12). Chế độ demo: chỉ giữ tới khi tắt ứng dụng, không xuất được (F00 BR-16).

## Lần nhập dữ liệu

Loại dữ liệu, ngày nhập thành công gần nhất. Dùng cho dòng "Dữ liệu thủ tục cập nhật ngày …" (F08). Chưa nhập thủ tục lần nào thì không có dòng đó (F08 BR-6). Chế độ demo không có lần nhập; dòng này hiện gì: câu hỏi mở 39.

## Từ đồng nghĩa và viết tắt

- Từ đồng nghĩa: một từ → các cách nói khác, vd. "khai sinh" ~ "giấy khai sinh"; "kết hôn" ~ "lấy vợ", "cưới vợ"; "giấy chứng nhận quyền sử dụng đất" ~ "sổ đỏ".
- Viết tắt → dạng đầy đủ, vd. TTHC → thủ tục hành chính, UBND → ủy ban nhân dân, CCCD → căn cước công dân, đk → đăng ký. Dùng cho hai việc: so khớp câu hỏi của trợ lý (F06) và đọc câu trả lời (F07).

## Bản đầu của dữ liệu thật (người dùng chốt 2026-10-12)

Nguồn: dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc, nạp bằng công cụ nhập (F01) — câu hỏi mở 2. Sau đó Trung tâm tự cập nhật bằng Excel.

Bản đầu là bộ file chuẩn bị riêng cho môi trường thật, không dùng nguyên `data-mau/` (dữ liệu mẫu chỉ dùng ở máy dev). Bộ file do công cụ sinh file Excel của nhóm phát triển tạo ra từ nguồn Vàm Cỏ (kế hoạch F01; người dùng chốt 2026-10-12). Khác dữ liệu mẫu ở:

| Phần | Bản đầu của dữ liệu thật |
|---|---|
| Thủ tục | Như Vàm Cỏ; mã đơn vị trên Cổng DVC `H53.183` thay `H53.186` (câu hỏi mở 12); không có đánh dấu ưu tiên (câu hỏi mở 8) |
| Thường gặp | 16 mã ở bảng dưới, thứ tự theo thứ tự người dùng liệt kê (câu hỏi mở 3) |
| Phân công quầy, nhân sự | Để trống — không nhập phân công, nhân sự của Vàm Cỏ (câu hỏi mở 6) |
| Trung tâm | Giá trị đã xác minh hoặc đã chốt ở [can-giuoc.md](can-giuoc.md); giờ làm việc tạm (câu hỏi mở 13) |
| Ô dịch vụ | 6 ô theo [lien-ket.md](lien-ket.md) §1; 2 ô để trống link (câu hỏi mở 14, 30, 32) |
| Mạng xã hội | Để trống, kể cả Zalo OA — nút Zalo của trợ lý ẩn (câu hỏi mở 14) |
| Trợ lý | Từ Vàm Cỏ, đổi tên: 6 chủ đề gợi ý (Đất đai, Hộ tịch, Bảo trợ XH → Bảo trợ xã hội, Chăn nuôi, Trẻ em, Xây dựng → Hoạt động xây dựng), bảng từ đồng nghĩa (45 dòng, gộp theo từ đích), bảng viết tắt. Thêm nhóm câu hỏi về Trung tâm (câu hỏi mở 9) |

Thủ tục thường gặp — bản đầu. Lĩnh vực và danh mục ghi theo dữ liệu Vàm Cỏ (kiểm 2026-10-12): cả 16 mã đều có; 4 mã chỉ thuộc danh mục cấp tỉnh.

| Thứ tự | Mã | Thủ tục (tên ngắn) | Lĩnh vực | Danh mục |
|---|---|---|---|---|
| 1 | 1.001193 | Đăng ký khai sinh | Hộ tịch | xã, tỉnh |
| 2 | 1.000894 | Đăng ký kết hôn | Hộ tịch | xã, tỉnh |
| 3 | 1.000656 | Đăng ký khai tử | Hộ tịch | xã, tỉnh |
| 4 | 2.000815 | Chứng thực bản sao từ bản chính | Chứng thực | xã, tỉnh |
| 5 | 2.000884 | Chứng thực chữ ký | Chứng thực | xã, tỉnh |
| 6 | 1.004873 | Xác nhận tình trạng hôn nhân | Hộ tịch | xã, tỉnh |
| 7 | 2.000635 | Cấp bản sao trích lục hộ tịch | Hộ tịch | tỉnh |
| 8 | 1.004837 | Đăng ký giám hộ | Hộ tịch | xã, tỉnh |
| 9 | 1.001022 | Đăng ký nhận cha, mẹ, con | Hộ tịch | xã, tỉnh |
| 10 | 1.012812 | Hoà giải tranh chấp đất đai | Đất đai | xã, tỉnh |
| 11 | 1.012784 | Tách thửa hoặc hợp thửa đất | Đất đai | tỉnh |
| 12 | 1.012783 | Cấp đổi giấy chứng nhận | Đất đai | tỉnh |
| 13 | 1.013992 | Chuyển mục đích sử dụng đất | Đất đai | tỉnh |
| 14 | 1.001776 | Trợ cấp xã hội hằng tháng | Bảo trợ xã hội | xã, tỉnh |
| 15 | 1.013314 | Xác nhận diện tích nhà ở để đăng ký thường trú | Đăng ký, quản lý cư trú | xã, tỉnh |
| 16 | 1.012753 | Đăng ký đất đai lần đầu | Đất đai | xã, tỉnh |

Trước khi mở cho dân, Trung tâm rà lại: phân công quầy, nhân sự; các thủ tục còn thiếu so với bộ khoảng 302 TTHC cấp xã của tỉnh; mã đơn vị `H53.183`; giờ làm việc.

## Dữ liệu mẫu đi kèm (chế độ demo — người dùng quyết 2026-10-12)

Dùng cho chế độ demo (F00 BR-16): bản demo chạy được mà không cần cơ sở dữ liệu. Đổi sang chạy thật bằng cấu hình; cơ sở dữ liệu phát triển tiếp sau.

- Đi kèm bản phát hành, lưu trong kho mã.
- Đã làm sạch: không có phân công quầy, không có nhân sự, không có họ tên người thật (kể cả người chịu trách nhiệm nội dung ở chân trang).
- Có đủ các loại dữ liệu để mọi màn hình có nội dung: thủ tục cấp xã và cấp tỉnh kèm chi tiết, lĩnh vực, thủ tục thường gặp, thông tin Trung tâm (đủ 5 mục bắt buộc của chân trang — F08 BR-3), ô dịch vụ, dữ liệu trợ lý.
- Không nhập, không sửa được khi đang chạy (F01 chỉ áp cho chế độ chạy thật); chỉ đổi khi có bản phát hành mới.
- Nội dung cụ thể (lấy từ đâu, bao nhiêu thủ tục) và cách làm sạch: kế hoạch F00.
- Không dùng để mở cho dân. Trước khi mở cho dân phải chuyển sang chạy thật và nhập bản đầu của dữ liệu thật (kế hoạch 8.5b).

Ba bộ dữ liệu, không lẫn với nhau:

| Bộ | Dùng ở | Lưu trong kho mã | Phân công quầy, nhân sự | Đưa vào hệ thống |
|---|---|---|---|---|
| `data-mau/` | Máy dev | Không | Phân công của Vàm Cỏ; nhân sự "Cán bộ mẫu" | Không trực tiếp — chỉ là dữ liệu gốc lấy từ Vàm Cỏ |
| Dữ liệu mẫu đi kèm | Chế độ demo | Có | Không có | Có sẵn trong bản phát hành, không nhập |
| Bản đầu của dữ liệu thật | Chế độ chạy thật | Không | Không có, chờ Trung tâm (câu hỏi mở 6) | Công cụ nhập (F01) |
