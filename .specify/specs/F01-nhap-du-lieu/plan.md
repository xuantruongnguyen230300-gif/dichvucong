---
id: F01
ten: Nhập dữ liệu từ Excel — kế hoạch kỹ thuật
spec: spec.md (dang-lam)
cap_nhat: 2026-10-12
---

# F01 · Nhập dữ liệu từ Excel — kế hoạch kỹ thuật

Chuẩn đối chiếu: `CLAUDE.md` trên đĩa và `F00-khung-he-thong/plan.md`. Theo đó: một tài khoản DB, dữ liệu ở project `DichVuCong.Data`, phụ thuộc `Import → Data`, thông báo của công cụ nhập đặt trong `.resx`.

Bản 2026-10-12 sửa theo trả lời 10 câu nhóm A (§14) và spec mới (BR-9 đến BR-18, AC-7 đến AC-16). Chỗ tài liệu chưa nói mà plan phải chọn thì ghi là **đề xuất** và đánh số ở §14 nhóm C.

Bản 2026-10-12 lần 2: khớp với mã db-dev đã làm ở T04–T12 (§3.4, §3.6, §5, §6, §14 câu 19) và thêm nguồn dữ liệu Mẫu của API (F00 plan §9 — §0, §1, §6, §8, §12).

## 0. Thay đổi so với bản 2026-10-08

| Phần | Thay đổi | Nguồn |
|---|---|---|
| Sheet Thủ tục | Bỏ cột "Ưu tiên", "Thường gặp"; thêm cột "Yêu cầu, điều kiện" | BR-10, BR-15, BR-16 |
| `thu-tuc.xlsx` | Thêm sheet "Thường gặp" (Mã thủ tục, Thứ tự) | BR-15 |
| Sheet Thành phần hồ sơ | Thêm cột "Số bản chính", "Số bản sao"; không có số nào lớn hơn 0 thì lưu như chưa ghi | BR-16, A3 |
| Ô dịch vụ | Được để trống link. Danh sách biểu tượng bỏ `mot-cua`, thêm `cong-thong-tin` | BR-11, câu hỏi mở 30, 32 |
| `tro-ly.xlsx` | Câu hỏi mẫu thêm cột "Mục thông tin Trung tâm", câu trả lời không còn bắt buộc; thêm sheet "Chủ đề gợi ý" | BR-12, BR-13 |
| Phân công, nhân sự | Được không có dòng nào | BR-9 |
| Làm sạch chữ | Bỏ thêm U+200E, U+200F; một bộ ký tự dùng chung với tìm kiếm (`TiengViet.BoKyTuVoHinh`) | BR-18 |
| DB | `thu_tuc`: bỏ `uu_tien`, `thuong_gap`; thêm `thu_tu_thuong_gap`, `yeu_cau_dieu_kien`; `thanh_phan_ho_so` đổi từ `text[]` sang `jsonb`. `o_dich_vu.url` được null. `cau_hoi_mau`: `tra_loi` được null, thêm `muc_trung_tam`. Bảng mới `chu_de_goi_y`. Index `cau_chua_tra_loi.lan_gap_cuoi`. Tổng 15 bảng | §4 |
| Câu chưa trả lời | Giữ 90 ngày kể từ lần gặp cuối rồi tự xoá: việc định kỳ trong API (chatbot-dev). Lệnh `xuat` không xuất câu quá hạn | F06 BR-12, câu hỏi mở 21 |
| `DichVuCong.DuLieuMau` | Sinh **bản đầu của dữ liệu thật**: không có phân công, nhân sự; 16 thường gặp; dữ liệu trợ lý lấy từ Vàm Cỏ. Không còn bộ giá trị giả | A9, `du-lieu.md` |
| Cache API | F00 làm chung: khoá cache và ETag gắn với `lan_nhap`. F02–F04 không phải tự xử lý | F00 BR-10 |
| Nguồn dữ liệu Mẫu (lần 2) | `DuLieuMau` thêm lệnh `xuat-json` sinh file dữ liệu mẫu; API đọc qua `INguonDuLieu`; câu chưa trả lời ghi, xoá qua `IKhoCauChuaTraLoi`. Import, migration, `AppDbContext` không đổi; `xuat` chỉ chạy với DB | F00 plan §9, kế hoạch 6.0 |

## 1. Tóm tắt

F01 đưa toàn bộ dữ liệu trang cần dùng từ Excel vào PostgreSQL bằng công cụ dòng lệnh `DichVuCong.Import`. Dự án không có màn hình quản trị, nên đây là cách duy nhất cập nhật dữ liệu. Bản đầu của dữ liệu thật (dữ liệu Vàm Cỏ đổi tên sang Cần Giuộc) sinh bằng `DichVuCong.DuLieuMau`, rồi nạp bằng chính công cụ này.

| Phần | Chạm gì |
|---|---|
| DB (`DichVuCong.Data`) | 15 bảng mới, 3 index GIN trigram, migration `NhapDuLieu`; thêm `TiengViet.TaoMaDuongDan`. `TiengViet.BoKyTuVoHinh` làm ở F00 T15 |
| Công cụ nhập (`DichVuCong.Import`) | Lệnh `nhap`, `xuat`, `tao-mau`; đọc, kiểm, ghi Excel bằng ClosedXML; thông báo trong `Resources/ThongBao.resx` |
| Bản đầu dữ liệu (`DichVuCong.DuLieuMau`) | Project dev mới: `data-mau/*.json` → 4 file Excel đúng mẫu, theo quy tắc bản đầu (§6). Dữ liệu trợ lý của Vàm Cỏ được tải về `data-mau/tro-ly.json` trước (T17). Thêm 2026-10-12: lệnh `xuat-json` sinh file dữ liệu mẫu cho nguồn Mẫu (F00 §9.5, F00 T27) |
| API (`Features/Chatbot/`) | Việc định kỳ xoá câu chưa trả lời quá 90 ngày (F06 BR-12). Đặt task ở đây vì F06 chưa có plan (§8.2). Sửa 2026-10-12: xoá qua `IKhoCauChuaTraLoi`, chạy ở cả hai nguồn (F00 §9.6) |
| Test | `Tests/Data/` (db-dev, không cần DB), `Tests/Integration/` (tester, PostgreSQL local — A10) |
| FE | Không có. F02–F08 đọc các bảng ở §4 — ghi chú bàn giao ở §8 |

## 2. Quyết định chính

| # | Quyết định | Lý do |
|---|---|---|
| Q1 | 4 file Excel theo loại dữ liệu: `thu-tuc`, `phan-cong`, `trung-tam`, `tro-ly`. Mỗi file gồm một hoặc nhiều sheet. Sheet "Thường gặp" nằm trong `thu-tuc.xlsx`; sheet "Chủ đề gợi ý" nằm trong `tro-ly.xlsx` | Spec nhắc tới từng file riêng. Chia theo người cập nhật và tần suất đổi. Một file lỗi không chặn loại khác (AC-6). Thường gặp phải đối chiếu với sheet Thủ tục trong cùng file (BR-14, AC-13) |
| Q2 | Một loại = thay toàn bộ các bảng của loại đó: `DELETE` rồi `INSERT` trong 1 transaction | Đơn giản nhất cho BR-1, BR-6. Dùng `DELETE`, không dùng `TRUNCATE`: `TRUNCATE` khoá bảng, API phải chờ; `DELETE` để API vẫn đọc bản cũ tới lúc commit |
| Q3 | Khoá tự nhiên hoặc thứ tự dòng, không dùng số tự tăng (trừ bảng câu chưa trả lời) | Nhập lại cùng file → mọi bảng giống hệt, kể cả khoá (BR-6, AC-4) |
| Q4 | Danh sách con có nhiều trường (trình tự, cách thức, thành phần hồ sơ, căn cứ) lưu `jsonb`. Danh sách chỉ có tên (kết quả, hình thức nộp) lưu `text[]` | Thành phần hồ sơ nay có số bản chính, số bản sao (BR-16), nên chuyển sang `jsonb`. Các danh sách này chỉ được đọc nguyên cụm khi mở popup (F03) hoặc khi trả lời một mục (F06), không truy vấn quan hệ. Ít bảng, popup đọc 1 dòng. Npgsql 10 hỗ trợ đầy đủ JSON complex type của EF 10 |
| Q5 | Lĩnh vực có mã sinh từ tên (`ho-tich`), mã này ổn định giữa các lần nhập | Bảng thủ tục cần khoá ngoại ổn định. F04, F05 dùng mã này trên địa chỉ trang và trong QR (`lien-ket.md` §3) |
| Q6 | Phân công quầy và chủ đề gợi ý nối với lĩnh vực theo mã, không có khoá ngoại | Lĩnh vực thuộc file thủ tục; phân công, chủ đề thuộc file khác. Mỗi lần nhập chỉ thay bảng của mình, nhập file này không xoá dữ liệu của file kia. Lĩnh vực không có phân công → chưa có quầy (BR-5) |
| Q7 | Chuẩn hoá chuỗi tìm kiếm làm một lần ở công cụ nhập bằng `TiengViet.ChuanHoaTimKiem`, không dùng hàm `unaccent` của DB. Bộ ký tự vô hình bị bỏ đặt ở một chỗ, `TiengViet.BoKyTuVoHinh`: vừa dùng làm sạch chữ khi nhập (BR-18), vừa dùng trong `ChuanHoaTimKiem` | Một thuật toán duy nhất ở BE, FE có bản tương đương (F00 §4). API chuẩn hoá câu người dùng gõ bằng cùng hàm. Chữ lưu vào DB và ô tìm kiếm bỏ cùng một bộ ký tự (BR-18, C01 BR-4) |
| Q8 | Tên sheet và tên cột là định dạng file (hợp đồng dữ liệu), đặt hằng trong `Excel/MauExcel.cs`, không đặt trong `.resx`. Thông báo, hướng dẫn và tiêu đề file xuất thì đặt trong `.resx` | Đổi tên cột là đổi định dạng file, không phải dịch câu chữ (§14 câu 11) |
| Q9 | Thủ tục thường gặp là cột `thu_tu_thuong_gap` của `thu_tuc` (null = không thường gặp), không phải bảng riêng | Cùng lệnh nhập `thu-tuc` ghi cả hai sheet. Một cột là đủ cho F03 (`WHERE … IS NOT NULL ORDER BY …`). UNIQUE và CHECK `> 0` giữ đúng BR-14 ở mức DB |
| Q10 | Giấy tờ không có số bản nào lớn hơn 0 (0 và 0, 0 và trống, hoặc trống cả hai) lưu như chưa ghi: cả hai null | Trả lời A3: cả hai bằng 0 thì coi như chưa ghi, vì nguồn để 0 khi không ghi (675/2.817 giấy tờ của Vàm Cỏ). Plan mở rộng cho trường hợp một số 0, một ô trống. Làm một lần lúc nhập, F03 và F06 không phải biết quy tắc này |
| Q11 | Câu hỏi mẫu có `tra_loi` hoặc `muc_trung_tam`, đúng một trong hai, giữ bằng CHECK ở DB | BR-12. Mục lưu bằng số (enum), không chép giá trị Trung tâm: F06 đọc giá trị lúc trả lời (F06 BR-9) |
| Q12 | `DuLieuMau` chỉ có một đầu ra là bản đầu của dữ liệu thật; máy dev cũng dùng bản này | A9. Không giữ chế độ "dữ liệu mẫu có phân công Vàm Cỏ", để phân công và nhân sự của Vàm Cỏ không thể lọt lên môi trường thật (BR-9). Cần thử số quầy thì soạn một file `phan-cong.xlsx` nhỏ |

## 3. Định dạng file Excel (mẫu của dự án)

### 3.1 Quy ước chung

- File `.xlsx`, tối đa 20 MB. Không nhận `.xls`, `.xlsm`.
- Dòng 1 là tiêu đề cột, dữ liệu từ dòng 2. **Số dòng báo lỗi là số dòng Excel** người vận hành nhìn thấy.
- Tên sheet và tên cột so khớp sau `ChuanHoaTimKiem`: không phân biệt hoa thường, dấu, khoảng trắng thừa. Cột xếp theo thứ tự nào cũng được.
- Thiếu sheet hoặc thiếu cột → lỗi cấu trúc, báo theo sheet (BR-2). Sheet lạ → bỏ qua; sheet "Hướng dẫn" do `tao-mau` tạo cũng bị bỏ qua.
- **Cột lạ → lỗi**, trừ cột tên "Ghi chú" (bỏ qua) — BR-2. Lý do: gõ sai tên một cột không bắt buộc sẽ làm mất dữ liệu mà không ai biết. File cũ còn cột "Ưu tiên" hoặc "Thường gặp" ở sheet Thủ tục cũng bị báo lỗi cột lạ.
- Sheet chỉ có dòng tiêu đề là sheet hợp lệ, 0 bản ghi. Số dòng tối thiểu do từng loại quy định: Trung tâm phải có 5 mục (BR-8); phân công, nhân sự được 0 dòng (BR-9).
- Dòng trống hoàn toàn → bỏ qua.
- Thứ tự hiển thị (thủ tục, ô dịch vụ, liên kết, nhân sự, câu hỏi mẫu, chủ đề gợi ý, các danh sách con) là thứ tự dòng trong sheet. Riêng thường gặp xếp theo cột "Thứ tự" (BR-15).
- Danh sách con nối với thủ tục bằng cột "Mã thủ tục". Các dòng của một thủ tục không cần nằm liền nhau.

Kiểu ô:

| Kiểu | Quy tắc |
|---|---|
| Chữ | Lấy giá trị đã lưu trong ô. Làm sạch (BR-18): NFC; bỏ ký tự vô hình bằng `TiengViet.BoKyTuVoHinh` (U+200B–U+200F, U+FEFF — cùng bộ với ô tìm kiếm, C01 BR-4); bỏ ký tự điều khiển (trừ xuống dòng, tab); CRLF → LF; trim. Ô chỉ có khoảng trắng coi là trống |
| Chữ dạng mã | Mã thủ tục (ở mọi sheet), mã DVC, mã đơn vị, điện thoại. **Ô kiểu số → lỗi** "nhập dạng chữ". Lý do: Excel tự đổi `1.013980` thành số — mất số 0 cuối, hoặc thành `1013980` nếu máy dùng dấu chấm phân cách hàng nghìn — và bỏ số 0 đầu của số điện thoại |
| Đánh dấu | `x` (không phân biệt hoa thường) là có, trống là không, giá trị khác → lỗi |
| Lựa chọn | So sau `ChuanHoaTimKiem`. Mức độ: `Toàn trình`, `Một phần`. Mục thông tin Trung tâm: `Địa chỉ`, `Giờ làm việc`, `Điện thoại`, `Email`, `Nộp trực tuyến`. Biểu tượng: §3.4 |
| Số nguyên dương | Quầy, thứ tự thường gặp: ô số nguyên hoặc ô chữ chỉ gồm chữ số. `2a`, `0`, `1.5` → lỗi |
| Số nguyên ≥ 0 | Số bản chính, số bản sao: như trên nhưng nhận `0`. `một` → lỗi |
| Giờ | `HH:mm` (vd. `07:00`) hoặc ô kiểu giờ của Excel |
| Danh sách trong ô | Phân cách bằng `;` hoặc xuống dòng; bỏ phần tử trống |
| Địa chỉ web | URL tuyệt đối, chỉ `http` hoặc `https` (BR-14). Mọi dạng khác bị chặn, gồm `javascript:`, `data:`, đường dẫn tương đối (§10) |
| Email | Một `@`, không có khoảng trắng, tối đa 254 ký tự |
| Điện thoại | Chỉ có chữ số, dấu cách, `.`, `-`, `(`, `)`, `+` ở đầu; 8–15 chữ số |

- Ô có công thức: dùng giá trị đã tính và lưu trong file, không tính lại. Ô báo lỗi công thức (`#N/A`, `#NAME?`…) → lỗi dòng.
- Mẫu do `tao-mau` tạo đặt sẵn định dạng Text (`@`) cho cột chữ, để Excel không hiểu `- Tờ khai…` là công thức. Dữ liệu Vàm Cỏ có 1.301 thành phần hồ sơ bắt đầu bằng dấu `-`. Mẫu cũng có sẵn danh sách chọn cho các cột lựa chọn và cột đánh dấu.

Độ dài tối đa (vượt → lỗi dòng):

| Trường | Tối đa |
|---|---|
| Mã thủ tục | 20 |
| Mã DVC, mã đơn vị, điện thoại | 30 |
| Xưng hô, biểu tượng | 20, 30 |
| Tên hiển thị của chủ đề gợi ý | 50 |
| Tên lĩnh vực | 200 |
| Email | 254 |
| Địa chỉ web | 2.000 |
| Câu hỏi mẫu, mỗi cách hỏi | 500 (bằng giới hạn câu hỏi của F06 BR-5) |
| Chữ khác | 32.767 (giới hạn ô Excel); DB dùng `text` |

### 3.2 `thu-tuc.xlsx` — danh mục thủ tục, thường gặp và chi tiết

Một mã thủ tục là **một dòng** trong sheet "Thủ tục" (BR-3, A1). Hai cột đánh dấu cho biết thủ tục thuộc danh mục nào; một thủ tục có thể thuộc cả hai. Như vậy mỗi mã chỉ có một bản chi tiết (BR-4).

Sheet **Thủ tục**:

| Cột | Bắt buộc | Kiểu | Ghi chú |
|---|---|---|---|
| Mã thủ tục | ✔ | chữ dạng mã | Không trùng trong sheet |
| Tên thủ tục | ✔ | chữ | |
| Lĩnh vực | ✔ | chữ | Tên lĩnh vực; tạo danh mục lĩnh vực (§4). Phải có ít nhất một chữ hoặc số |
| Danh mục cấp xã | ✔* | đánh dấu | *Phải đánh dấu ít nhất một trong hai cột danh mục |
| Danh mục cấp tỉnh | ✔* | đánh dấu | |
| Mức độ | ✔ | lựa chọn | `Toàn trình` / `Một phần` |
| Cơ quan thực hiện | | chữ | |
| Yêu cầu, điều kiện | | chữ | BR-16 |
| Trạng thái công bố | | chữ | vd. `Công khai` |
| Thời hạn giải quyết | | chữ | Chỉ ghi "Khác" → cảnh báo (§3.6) |
| Phí, lệ phí | | chữ | |
| Hình thức nộp | | danh sách trong ô | vd. `Trực tuyến; Bưu chính; Trực tiếp` |
| Mã DVC | | chữ dạng mã | |
| Tên đơn vị trên Cổng DVC | | chữ | |
| Mã đơn vị trên Cổng DVC | | chữ dạng mã | Cần Giuộc: `H53.183` (câu hỏi mở 12) |

Không có cột "Ưu tiên" (BR-10) và cột "Thường gặp" (nay là sheet riêng — BR-15).

Sheet **Thường gặp** (BR-15):

| Cột | Bắt buộc | Kiểu | Ghi chú |
|---|---|---|---|
| Mã thủ tục | ✔ | chữ dạng mã | Có trong sheet Thủ tục; không trùng |
| Thứ tự | ✔ | số nguyên dương | Không trùng. F03 hiện theo thứ tự tăng dần. Các số không cần liền nhau |

Sheet con — mỗi dòng là một phần tử, cột đầu là "Mã thủ tục" (bắt buộc, phải có trong sheet Thủ tục):

| Sheet | Cột (ngoài Mã thủ tục) | Bắt buộc |
|---|---|---|
| Trình tự | Trường hợp, Nội dung | Nội dung |
| Cách thức | Hình thức nộp, Thời hạn, Phí, lệ phí, Mô tả | Ít nhất một cột có giá trị |
| Thành phần hồ sơ | Tên giấy tờ, Số bản chính, Số bản sao | Tên giấy tờ. Số bản là số nguyên ≥ 0 hoặc để trống; không có số nào lớn hơn 0 thì lưu như chưa ghi (Q10) |
| Kết quả | Tên kết quả | Tên kết quả |
| Căn cứ pháp lý | Số ký hiệu, Trích yếu | Ít nhất một cột có giá trị. Không có cột link văn bản — giống Vàm Cỏ, căn cứ chỉ hiển thị chữ (quyết định 2026-10-09) |

Không nhập (BR-16): đối tượng thực hiện, loại giấy tờ, ngày hiệu lực căn cứ, cơ quan cấp kết quả, cơ quan ban hành, số và ngày quyết định công bố, tên dịch vụ công, cấp thực hiện. Link Cổng DVC dựng từ mã thủ tục (F03 BR-4).

Ví dụ — sheet Thủ tục (một số cột):

| Mã thủ tục | Tên thủ tục | Lĩnh vực | Danh mục cấp xã | Danh mục cấp tỉnh | Mức độ | Yêu cầu, điều kiện | Phí, lệ phí | Hình thức nộp | Mã DVC |
|---|---|---|---|---|---|---|---|---|---|
| 1.001193 | Thủ tục đăng ký khai sinh | Hộ tịch | x | x | Toàn trình | | Lệ phí: 0 VNĐ | Trực tuyến; Bưu chính; Trực tiếp | 1.001193.02 |
| 1.012784 | Tách thửa hoặc hợp thửa đất. | Đất đai | | x | Một phần | … | Phí: 0 VNĐ (Theo quy định…) | Trực tuyến; Bưu chính; Trực tiếp | 1.012784.01 |

Sheet Thường gặp:

| Mã thủ tục | Thứ tự |
|---|---|
| 1.001193 | 1 |
| 1.000894 | 2 |
| 1.000656 | 3 |

Sheet Trình tự:

| Mã thủ tục | Trường hợp | Nội dung |
|---|---|---|
| 1.001193 | | - Nếu lựa chọn hình thức nộp hồ sơ trực tiếp, người yêu cầu… *(nhiều dòng trong một ô)* |
| 2.002635 | Trường hợp đăng ký trực tiếp hoặc qua dịch vụ bưu chính | … |
| 2.002635 | Trường hợp đăng ký trên môi trường điện tử | … |

Sheet Thành phần hồ sơ:

| Mã thủ tục | Tên giấy tờ | Số bản chính | Số bản sao |
|---|---|---|---|
| 1.001193 | - Tờ khai đăng ký khai sinh theo mẫu | 1 | 0 |
| 1.001193 | - Văn bản ủy quyền (được chứng thực) theo quy định của pháp luật… | 0 | 0 |

Dòng thứ hai lưu như chưa ghi số bản (Q10).

### 3.3 `phan-cong.xlsx` — phân công lĩnh vực → quầy, nhân sự

| Sheet | Cột | Bắt buộc | Ghi chú |
|---|---|---|---|
| Phân công | Lĩnh vực, Quầy, Nơi tiếp nhận chuyển | Lĩnh vực | Quầy để trống nếu chưa có (BR-5). Lĩnh vực không trùng (so theo mã lĩnh vực) |
| Nhân sự | Họ tên, Xưng hô, Chức vụ, Quầy, Mô tả công việc | Họ tên | |

- Cả hai sheet được không có dòng nào (BR-9, A6). Bản đầu như vậy. File vẫn phải có đủ hai sheet và dòng tiêu đề.
- Quầy là số nguyên dương hoặc để trống. F06 tìm cán bộ của một lĩnh vực qua số quầy (F06 AC-12).

| Lĩnh vực | Quầy | Nơi tiếp nhận chuyển |
|---|---|---|
| Hộ tịch | 3 | |
| Đăng ký, quản lý cư trú | 4 | Công an và Phòng Kinh tế |
| Chưa phân loại | | |

### 3.4 `trung-tam.xlsx` — thông tin trung tâm, giờ làm việc, liên kết, ô dịch vụ

Sheet **Trung tâm** dạng hai cột `Mục | Giá trị`. Mỗi mục một dòng, không trùng; mục lạ → lỗi; không có dòng của một mục thì coi như mục đó trống. Có **16 mục**, tên mục là hằng trong `MauExcel.cs` (bảng dưới gộp 4 mục mạng xã hội vào một dòng). Thiếu một trong 5 mục bắt buộc → lỗi báo theo sheet, không có số dòng (sửa 2026-10-12 theo mã đã làm).

| Mục | Bắt buộc | Kiểu |
|---|---|---|
| Tên đơn vị | ✔ BR-8 | chữ |
| Người chịu trách nhiệm | ✔ BR-8 | chữ (họ tên) |
| Chức vụ người chịu trách nhiệm | | chữ |
| Cơ quan chủ quản | | chữ (câu hỏi mở 18) |
| Địa chỉ | ✔ BR-8 | chữ |
| Điện thoại | ✔ BR-8 | điện thoại |
| Email | ✔ BR-8 | email |
| Xã | | chữ — tên đơn vị hành chính, ghi đủ loại đơn vị (`du-lieu.md`), vd. "xã Cần Giuộc"; chương trình không tự ghép chữ "xã". Đổi nhãn mục: §14 câu 19 |
| Tỉnh | | chữ, ghi đủ loại đơn vị, vd. "tỉnh Tây Ninh" |
| Mã đơn vị trên Cổng DVC | | chữ dạng mã (câu hỏi mở 12) |
| Bản đồ | | địa chỉ web |
| Zalo OA · Facebook · YouTube · TikTok (4 mục riêng) | | địa chỉ web |
| Ghi chú ngày nghỉ | | chữ (F02 BR-3) |

Logo không nhập qua Excel. Logo là ảnh tĩnh tự host do F08 xử lý (F08 BR-14).

| Sheet | Cột | Bắt buộc | Ghi chú |
|---|---|---|---|
| Giờ làm việc | Thứ, Sáng từ, Sáng đến, Chiều từ, Chiều đến | Thứ | 7 dòng, mỗi thứ một dòng; ngày nghỉ để trống giờ (BR-17, A4). Thứ nhận `Thứ Hai`…`Thứ Bảy`, `Chủ nhật`, `Thứ 2`…`Thứ 7`, `CN`. Giờ đi theo cặp, giờ bắt đầu trước giờ kết thúc. Thiếu dòng của một thứ thì coi như ngày nghỉ |
| Liên kết | Tên, Địa chỉ web | cả hai | Liên kết hữu ích ở chân trang (F08 BR-3). Liên kết tên "Cổng Dịch vụ công Quốc gia" còn được F06 dùng để trả lời "nộp trực tuyến ở đâu" (§14 câu 17) |
| Ô dịch vụ | Tên, Mô tả, Biểu tượng, Địa chỉ web | Tên | Địa chỉ web được để trống: ô vẫn được nhập và vẫn hiện, bấm không mở gì (BR-11, C01 BR-12). Có ghi thì phải hợp lệ. Biểu tượng chọn trong danh sách bên dưới; trống → `lien-ket` |

Danh sách biểu tượng: `boc-so`, `danh-gia`, `tra-cuu-ho-so`, `thanh-toan`, `cong-dvc`, `cong-thong-tin`, `lien-ket`. Bỏ `mot-cua` vì đã bỏ ô "Hệ thống Một cửa tỉnh" (câu hỏi mở 32); `cong-thong-tin` dùng cho ô "Cổng thông tin điện tử xã Cần Giuộc". Danh sách nằm ở `MauExcel.cs`; F02 gán mỗi khoá với một icon Lucide. Thêm khoá thì sửa cả hai nơi.

| Thứ | Sáng từ | Sáng đến | Chiều từ | Chiều đến |
|---|---|---|---|---|
| Thứ Hai | 07:00 | 11:30 | 13:30 | 17:00 |
| … | | | | |
| Thứ Bảy | | | | |
| Chủ nhật | | | | |

### 3.5 `tro-ly.xlsx` — câu hỏi mẫu, chủ đề gợi ý, từ đồng nghĩa, viết tắt

| Sheet | Cột | Bắt buộc | Ghi chú |
|---|---|---|---|
| Câu hỏi mẫu | Câu hỏi, Cách hỏi khác, Câu trả lời, Mục thông tin Trung tâm, Mã thủ tục liên quan | Câu hỏi; **đúng một** trong hai cột Câu trả lời, Mục thông tin Trung tâm (BR-12) | Cách hỏi khác và mã thủ tục là danh sách trong ô. Mã phải có trong danh mục thủ tục. Câu hỏi không trùng (sau chuẩn hoá). Câu trả lời là chữ thuần, giữ xuống dòng, không HTML. Mục là một trong 5 lựa chọn ở §3.1. Câu gắn mục thì không chép giá trị Trung tâm (`du-lieu.md`) |
| Chủ đề gợi ý | Tên hiển thị, Lĩnh vực | cả hai | BR-13. Thứ tự hiển thị là thứ tự dòng. Lĩnh vực ghi đúng tên trong danh mục, so theo mã lĩnh vực (`TaoMaDuongDan`). Tên không có chữ hay số nào coi như thiếu |
| Từ đồng nghĩa | Từ, Cách nói khác | cả hai | Cách nói khác là danh sách trong ô. Từ không trùng (sau chuẩn hoá) |
| Viết tắt | Viết tắt, Dạng đầy đủ | cả hai | Viết tắt không trùng (sau chuẩn hoá: `đk` trùng `ĐK`) |

| Câu hỏi | Cách hỏi khác | Câu trả lời | Mục thông tin Trung tâm | Mã thủ tục liên quan |
|---|---|---|---|---|
| Điều kiện tách thửa đất là gì? | điều kiện tách thửa; tách thửa cần điều kiện gì | Theo Quyết định 139/2026/QĐ-UBND… | | 1.012784 |
| Trung tâm ở đâu? | địa chỉ trung tâm; văn phòng nằm chỗ nào | | Địa chỉ | |
| Nộp hồ sơ trực tuyến ở đâu? | nộp online ở đâu; nộp qua mạng | | Nộp trực tuyến | |

| Tên hiển thị | Lĩnh vực |
|---|---|
| Bảo trợ XH | Bảo trợ xã hội |
| Xây dựng | Hoạt động xây dựng |

| Viết tắt | Dạng đầy đủ |
|---|---|
| TTHC | thủ tục hành chính |
| đk | đăng ký |

### 3.6 Quy tắc dòng lỗi

Theo BR-14. Mỗi dòng lỗi in **một dòng** gồm sheet, số dòng và mọi lý do của dòng đó (AC-2). Lỗi cấu trúc (thiếu sheet, thiếu cột, cột lạ) và lỗi thiếu mục bắt buộc của sheet Trung tâm in theo sheet, không có số dòng.

| Sheet | Dòng lỗi khi |
|---|---|
| Thủ tục | Thiếu mã, tên hoặc lĩnh vực; mức độ khác `Toàn trình` / `Một phần`; mã trùng (dòng trùng ghi số dòng gặp mã lần đầu); không đánh dấu danh mục nào; ô đánh dấu khác `x`; ô mã kiểu số; tên lĩnh vực không có chữ hay số nào |
| Thường gặp | Mã trống, ô mã kiểu số, mã không có trong sheet Thủ tục, mã trùng; thứ tự trống, không phải số nguyên dương, hoặc trùng |
| Trình tự, Cách thức, Thành phần hồ sơ, Kết quả, Căn cứ pháp lý | Mã thủ tục trống, ô mã kiểu số, mã không có trong sheet Thủ tục; thiếu nội dung chính của dòng (§3.2); số bản chính, số bản sao có ghi mà không phải số nguyên ≥ 0 |
| Trung tâm | Thiếu một trong 5 mục (BR-8) — báo theo sheet, không có số dòng; email, điện thoại sai dạng; ô điện thoại kiểu số; địa chỉ web không hợp lệ; mục lạ hoặc trùng |
| Giờ làm việc | Thứ không hợp lệ hoặc trùng; giờ sai dạng; buổi có giờ bắt đầu mà thiếu giờ kết thúc, hoặc ngược lại; giờ bắt đầu không trước giờ kết thúc |
| Liên kết | Thiếu tên hoặc địa chỉ web; địa chỉ web không hợp lệ |
| Ô dịch vụ | Thiếu tên; địa chỉ web có ghi mà không hợp lệ; biểu tượng ngoài danh sách |
| Phân công | Thiếu lĩnh vực; lĩnh vực trùng (so theo mã); quầy không phải số nguyên dương |
| Nhân sự | Thiếu họ tên; quầy không phải số nguyên dương |
| Câu hỏi mẫu | Thiếu câu hỏi; trái BR-12 (có cả câu trả lời và mục, không có cả hai, hoặc mục ngoài 5 lựa chọn); câu hỏi trùng; mã thủ tục liên quan không có trong danh mục |
| Chủ đề gợi ý | Thiếu tên hiển thị hoặc tên lĩnh vực |
| Từ đồng nghĩa | Thiếu từ hoặc cách nói khác; từ trùng |
| Viết tắt | Thiếu chữ viết tắt hoặc dạng đầy đủ; chữ viết tắt trùng |
| Mọi sheet | Vượt độ dài ở §3.1; ô lỗi công thức |

- "Mã thủ tục liên quan không có trong danh mục": `nhap tro-ly` chạy riêng thì so với bảng `thu_tuc`; `nhap tat-ca` so với file thủ tục trong cùng lần chạy.
- Lỗi kéo theo: mã ở sheet Thủ tục nằm trong ô kiểu số thì bị báo lỗi, và các dòng con hay dòng thường gặp ghi mã đó (dạng chữ) cũng bị báo "không có trong sheet Thủ tục". Công cụ không lọc lỗi kéo theo, vì không suy được mã đúng từ ô số. File thử cho AC-13 ("mã 1.013980 nhập ở ô dạng số") dùng một thủ tục không có dòng con và không nằm trong sheet Thường gặp.

Cảnh báo — in ra nhưng vẫn nhập:

- Hai tên lĩnh vực khác cách viết nhưng cùng mã (vd. `Thủy lợi` và `Thuỷ lợi`) → gộp làm một, lấy tên gặp trước.
- Thủ tục có thời hạn giải quyết chỉ ghi "Khác" (vd. `1 Khác`, sau chuẩn hoá khớp `^(\d+ )?khac$`): một dòng cảnh báo, liệt kê số dòng, để Trung tâm bổ sung (`du-lieu.md`). Dữ liệu Vàm Cỏ có 73 thủ tục như vậy.
- Phân công có lĩnh vực không nằm trong danh mục thủ tục hiện có.
- Chủ đề gợi ý có lĩnh vực không nằm trong danh mục thủ tục hiện có. F06 vẫn hiện chủ đề và trả lời "chưa có thủ tục nào thuộc lĩnh vực này" (F06 BR-11).
- File trung tâm không có liên kết tên "Cổng Dịch vụ công Quốc gia" (§14 câu 17).

Bỏ cảnh báo "ưu tiên nhưng không thuộc danh mục cấp xã" của bản trước (BR-10).

Ví dụ kết quả khi có lỗi (AC-2):

```
Không nhập. File thu-tuc.xlsx có 3 dòng lỗi:
  Thủ tục · dòng 7: thiếu Tên thủ tục
  Thủ tục · dòng 12: Mức độ "Toàn phần" không phải "Toàn trình" hoặc "Một phần"
  Thường gặp · dòng 4: Mã 9.999999 không có trong sheet Thủ tục
```

## 4. Dữ liệu — `DichVuCong.Data`

Entity ở `Entities/`, mỗi entity một `IEntityTypeConfiguration<T>` ở `Configurations/`, thêm `DbSet<T>` vào `AppDbContext`. Tên bảng, cột snake_case theo `UseSnakeCaseNamingConvention`. Chuỗi không ghi độ dài là `text`.

| Entity → bảng | Khoá | Cột | Ràng buộc, chỉ mục |
|---|---|---|---|
| `ThuTuc` → `thu_tuc` | `Ma` varchar(20) | `Ten`, `TenTimKiem`, `LinhVucMa` → `linh_vuc`, `ThuocDanhMucXa` bool, `ThuocDanhMucTinh` bool, `MucDo` smallint (enum `MucDo`: `ToanTrinh` = 1, `MotPhan` = 2), `CoQuanThucHien`?, `YeuCauDieuKien`?, `TrangThaiCongBo`?, `ThoiHan`?, `Phi`?, `HinhThucNop` text[], `MaDvc`? varchar(30), `DonViTen`?, `DonViMa`? varchar(30), `ThuTu` int, `ThuTuThuongGap` int?, `TrinhTu` jsonb, `CachThuc` jsonb, `ThanhPhanHoSo` jsonb, `KetQua` text[], `CanCu` jsonb | CHECK `thuoc_danh_muc_xa OR thuoc_danh_muc_tinh`; CHECK `muc_do IN (1,2)`; CHECK `thu_tu_thuong_gap > 0`; UNIQUE `thu_tu_thuong_gap`; index `linh_vuc_ma`; **GIN `ten_tim_kiem gin_trgm_ops`** |
| `LinhVuc` → `linh_vuc` | `Ma` varchar(200) — `TiengViet.TaoMaDuongDan(Ten)` | `Ten`, `TenTimKiem` | **GIN `ten_tim_kiem gin_trgm_ops`** |
| `PhanCongLinhVuc` → `phan_cong_linh_vuc` | `LinhVucMa` varchar(200), không khoá ngoại (Q6) | `TenLinhVuc` (tên như trong file), `Quay` int?, `NoiTiepNhanChuyen`? | CHECK `quay > 0` |
| `NhanSu` → `nhan_su` | `ThuTu` int | `HoTen`, `XungHo`? varchar(20), `ChucVu`?, `Quay` int?, `MoTa`? | CHECK `quay > 0` |
| `TrungTam` → `trung_tam` | `Id` smallint | `Ten`, `NguoiChiuTrachNhiem`, `ChucVuNguoiChiuTrachNhiem`?, `CoQuanChuQuan`?, `DiaChi`, `DienThoai` varchar(30), `Email` varchar(254), `Xa`?, `Tinh`?, `MaDonViCongDvc`? varchar(30), `BanDo`?, `ZaloOa`?, `Facebook`?, `YouTube`?, `TikTok`?, `GhiChuNgayNghi`? | CHECK `id = 1` (một dòng duy nhất) |
| `GioLamViec` → `gio_lam_viec` | `Thu` smallint (1 = Thứ Hai … 7 = Chủ nhật) | `SangTu`, `SangDen`, `ChieuTu`, `ChieuDen` — `TimeOnly?` → `time` | CHECK `thu BETWEEN 1 AND 7`; mỗi cặp cùng có hoặc cùng trống; giờ bắt đầu < giờ kết thúc. Chỉ lưu ngày có ít nhất một buổi |
| `LienKet` → `lien_ket` | `ThuTu` int | `Ten`, `Url` | |
| `ODichVu` → `o_dich_vu` | `ThuTu` int | `Ten`, `MoTa`?, `BieuTuong` varchar(30), `Url`? (null = chưa có link — BR-11) | |
| `CauHoiMau` → `cau_hoi_mau` | `ThuTu` int | `CauHoi`, `TraLoi`?, `MucTrungTam` smallint? (enum `MucTrungTam`: `DiaChi` = 1, `GioLamViec` = 2, `DienThoai` = 3, `Email` = 4, `NopTrucTuyen` = 5), `MaThuTuc` text[] | CHECK `(tra_loi IS NULL) <> (muc_trung_tam IS NULL)` (Q11); CHECK `muc_trung_tam BETWEEN 1 AND 5` |
| `CauHoiMauCachHoi` → `cau_hoi_mau_cach_hoi` | (`CauHoiMauThuTu`, `ThuTu`) | `NoiDung`, `NoiDungTimKiem`. `ThuTu` 1 là câu hỏi chính, từ 2 là các cách hỏi khác | FK → `cau_hoi_mau` ON DELETE CASCADE; **GIN `noi_dung_tim_kiem gin_trgm_ops`** |
| `ChuDeGoiY` → `chu_de_goi_y` | `ThuTu` int | `TenHienThi` varchar(50), `TenLinhVuc` (tên như trong file), `LinhVucMa` varchar(200) — không khoá ngoại (Q6) | |
| `TuDongNghia` → `tu_dong_nghia` | `ThuTu` int | `Tu`, `TuTimKiem`, `CachNoiKhac` text[] | UNIQUE `tu_tim_kiem` |
| `VietTat` → `viet_tat` | `ThuTu` int | `ChuVietTat`, `ChuVietTatTimKiem`, `DayDu` | UNIQUE `chu_viet_tat_tim_kiem` |
| `CauChuaTraLoi` → `cau_chua_tra_loi` | `Id` bigint identity | `NoiDung` (đã che thông tin cá nhân), `KhoaGop` = `ChuanHoaTimKiem(NoiDung)`, `SoLanGap` int, `LanGapCuoi` timestamptz | UNIQUE `khoa_gop` (F06 BR-7 gộp bằng `ON CONFLICT`); CHECK `so_lan_gap >= 1`; CHECK `char_length(noi_dung) <= 500`; **index `lan_gap_cuoi`** (xoá định kỳ — §8.2) |
| `LanNhap` → `lan_nhap` | `Loai` varchar(20): `thu-tuc`, `phan-cong`, `trung-tam`, `tro-ly` | `ThoiDiem` timestamptz (UTC), `TenFile` (chỉ tên file, không có đường dẫn) | CHECK `loai` thuộc 4 giá trị |

`?` là cột cho phép null. Các cột còn lại `NOT NULL`. Danh sách rỗng lưu `[]` hoặc `{}`, không lưu null. Ô dịch vụ không có link lưu null, không lưu chuỗi rỗng hay `#`.

Hằng `CauChuaTraLoi.ThoiGianGiu` = 90 ngày (F06 BR-12), đặt trong entity. Đây là nguồn duy nhất cho việc xoá định kỳ ở API và lệnh `xuat` ở Import; đổi thời hạn chỉ sửa một chỗ.

Kiểu JSON (EF 10 `ComplexCollection(...).ToJson()`, được Npgsql 10 hỗ trợ):

- `BuocTrinhTu { TruongHop?, NoiDung }`
- `CachThucNop { HinhThuc?, ThoiHan?, Phi?, MoTa? }`
- `GiayTo { Ten, BanChinh? int, BanSao? int }` — null là chưa ghi số bản (Q10)
- `VanBanCanCu { SoKyHieu?, TrichYeu? }` — không lưu link văn bản (giống Vàm Cỏ, quyết định 2026-10-09)

Cột tìm kiếm — mọi cột `*TimKiem` đều là `TiengViet.ChuanHoaTimKiem(<cột gốc>)`, do công cụ nhập tính:

- `thu_tuc.ten_tim_kiem`: F06 tìm gần đúng ("khai sjnh"). F03, F04 lọc phía client với tên, mã và tên lĩnh vực đã chuẩn hoá.
- `linh_vuc.ten_tim_kiem`: F05 tìm lĩnh vực; F06 nhận ra lĩnh vực trong câu hỏi.
- `cau_hoi_mau_cach_hoi.noi_dung_tim_kiem`: F06 BR-1 bước 1 (nhóm câu hỏi về Trung tâm) và bước 2.

Với khoảng 1.000 dòng, index GIN gần như không tốn gì. Thêm index để F06 dùng được `%` / `similarity` mà không phải đọc hết bảng.

`TiengViet.TaoMaDuongDan(string)`: `ChuanHoaTimKiem` → mỗi chuỗi ký tự ngoài `[a-z0-9]` thay bằng một `-` → bỏ `-` ở đầu và cuối. Bộ mẫu cho test:

| Vào | Ra |
|---|---|
| `Hộ tịch` | `ho-tich` |
| `Đăng ký, quản lý cư trú` | `dang-ky-quan-ly-cu-tru` |
| `Thủy lợi – Thuỷ sản` | `thuy-loi-thuy-san` |
| `bảo vệ quyền lợi người tiêu dùng` | `bao-ve-quyen-loi-nguoi-tieu-dung` |
| `  Đất   đai ` | `dat-dai` |
| `– – –` | *(rỗng — công cụ nhập báo lỗi dòng)* |

Dữ liệu Vàm Cỏ: 75 tên lĩnh vực cho 75 mã khác nhau, mã dài nhất 69 ký tự.

`TiengViet.BoKyTuVoHinh(string)` (bỏ U+200B–U+200F, U+FEFF) là hàm công khai, `ChuanHoaTimKiem` gọi lại hàm này. Làm ở F00 T15 (db-dev); bản FE tương đương ở F00 T19.

Migration: **`NhapDuLieu`** — tạo 15 bảng, CHECK, index. Không có dữ liệu seed.

Bảng nào do lệnh nhập nào ghi:

| Loại | Xoá rồi chèn | Ghi `lan_nhap` |
|---|---|---|
| `thu-tuc` | `thu_tuc` (gồm thứ tự thường gặp), rồi `linh_vuc` (chèn theo thứ tự ngược lại) | `thu-tuc` — F08 BR-6 dùng dòng này |
| `phan-cong` | `phan_cong_linh_vuc`, `nhan_su` | `phan-cong` |
| `trung-tam` | `trung_tam`, `gio_lam_viec`, `lien_ket`, `o_dich_vu` | `trung-tam` |
| `tro-ly` | `cau_hoi_mau` (cascade `cau_hoi_mau_cach_hoi`), `chu_de_goi_y`, `tu_dong_nghia`, `viet_tat` | `tro-ly` |

`cau_chua_tra_loi` do F06 ghi và do việc định kỳ trong API xoá (§8.2). Công cụ nhập chỉ đọc bảng này để xuất.

## 5. Công cụ nhập — `DichVuCong.Import`

### 5.1 Lệnh

```
dotnet run --project src/BackEnd/DichVuCong.Import -- <lệnh>

nhap thu-tuc   <file.xlsx> [--chi-kiem]
nhap phan-cong <file.xlsx> [--chi-kiem]
nhap trung-tam <file.xlsx> [--chi-kiem]
nhap tro-ly    <file.xlsx> [--chi-kiem]
nhap tat-ca    <thư-mục>   [--chi-kiem]    # đọc thu-tuc.xlsx, phan-cong.xlsx, trung-tam.xlsx, tro-ly.xlsx
xuat cau-chua-tra-loi <file-ra.xlsx>
tao-mau <thư-mục>                          # 4 file mẫu trống: tiêu đề, định dạng Text, danh sách chọn, sheet "Hướng dẫn"
(không tham số) | help                     # in hướng dẫn
```

- `--chi-kiem`: chỉ đọc và kiểm, không mở transaction ghi. In "hợp lệ" và số bản ghi sẽ nhập, hoặc in danh sách lỗi.
- Kết quả (số bản ghi, cảnh báo, "hợp lệ", hướng dẫn) in ra stdout; lỗi in ra stderr (sửa 2026-10-12 theo mã đã làm).
- `tao-mau`: không ghi đè file đã có — gặp file trùng tên thì mã 2, như `xuat`.
- `nhap tat-ca`: phải có đủ 4 file. Kiểm cả 4 trước, có lỗi ở bất kỳ file nào thì không ghi gì. Ghi theo thứ tự `thu-tuc` → `phan-cong` → `trung-tam` → `tro-ly` trong **một** transaction. Khi kiểm, mã thủ tục liên quan, lĩnh vực của chủ đề gợi ý và lĩnh vực của phân công so với file thủ tục trong cùng lần chạy, không so với DB.
- `nhap tro-ly` chạy riêng: mã thủ tục liên quan và lĩnh vực của chủ đề so với bảng `thu_tuc`, `linh_vuc` hiện có.
- `xuat`:
  - Không ghi đè file đã có (mã 2).
  - Cột: Câu hỏi, Số lần gặp, Lần gặp cuối — tiêu đề lấy từ `.resx`.
  - **Chỉ xuất câu có lần gặp cuối trong 90 ngày** (`CauChuaTraLoi.ThoiGianGiu`), để file xuất không có câu quá hạn dù việc xoá định kỳ chưa chạy tới (F06 AC-27). Giờ hiện tại lấy qua `TimeProvider` để test giả lập được ngày.
  - Thời gian theo giờ Việt Nam (UTC+7, không có giờ mùa hè), dạng `dd/MM/yyyy HH:mm`. Sắp theo số lần gặp giảm dần, rồi lần gặp cuối giảm dần. Không có câu nào → vẫn tạo file có dòng tiêu đề.
- Câu `HuongDan` trong `.resx`: thêm "thường gặp" vào dòng `nhap thu-tuc`, "chủ đề gợi ý" vào dòng `nhap tro-ly`.

**Quyết định bổ sung 2026-10-08:** `--chi-kiem` không cần chuỗi kết nối với `thu-tuc`, `phan-cong`, `trung-tam`, `tat-ca` (chỉ đọc file; `tat-ca` đối chiếu trong các file cùng lần chạy). Chỉ `tro-ly` chạy riêng cần DB để đối chiếu; thiếu → mã 3. `nhap` không có `--chi-kiem` luôn cần chuỗi kết nối, `xuat` luôn cần chuỗi kết nối; `tao-mau` không cần.

Riêng `phan-cong --chi-kiem`: cảnh báo "lĩnh vực không có trong danh mục" cần DB; không có chuỗi kết nối thì bỏ qua cảnh báo này, không báo lỗi.

### 5.2 Quy trình một lần nhập

1. Mở file: kiểm đuôi và kích thước, mở `FileStream` chỉ đọc với `FileShare.ReadWrite` (file đang mở trong Excel vẫn đọc được).
2. Kiểm cấu trúc: đủ sheet, đủ cột, không có cột lạ.
3. Đọc từng dòng, làm sạch và chuẩn hoá ô theo §3.1.
4. Kiểm toàn bộ (§3.6), gom **mọi** lỗi, không dừng ở lỗi đầu tiên. Tính sẵn cột `*TimKiem`, mã lĩnh vực, thứ tự, số bản (Q10).
5. Có lỗi → in lỗi, thoát mã 1, không mở kết nối ghi (BR-2).
6. Không có lỗi:
   - Kiểm migration chưa chạy (`GetPendingMigrationsAsync`). Còn migration → mã 3.
   - Mở transaction, lấy `pg_try_advisory_xact_lock(<hằng>)`. Đang có lần nhập khác → mã 3.
   - `ExecuteDeleteAsync` các bảng của loại; `AddRange` + `SaveChangesAsync`; upsert `lan_nhap`; commit.
   - Lỗi bất kỳ (kể cả Ctrl+C) → rollback, dữ liệu cũ và `lan_nhap` giữ nguyên (BR-1, BR-7).
7. In số bản ghi theo từng loại (AC-1) và các cảnh báo.

```
Đã nhập thu-tuc.xlsx:
  Thủ tục: 408 — cấp xã 266, cấp tỉnh 408
  Lĩnh vực: 75 · Thường gặp: 16
Cảnh báo:
  Thủ tục: 73 thủ tục có thời hạn giải quyết chỉ ghi "Khác" — dòng 5, 9, 14, …

Đã nhập phan-cong.xlsx:
  Phân công: 0 · Nhân sự: 0

Đã nhập tro-ly.xlsx:
  Câu hỏi mẫu: 11 (5 câu theo mục thông tin Trung tâm) · Chủ đề gợi ý: 6 · Từ đồng nghĩa: 45 · Viết tắt: 12
```

Không in mục "Ưu tiên" (BR-10, AC-8). Câu chữ của các dòng in ra nằm trong `.resx`.

Kết quả xác định (BR-6): cùng file → cùng dòng, cùng khoá, cùng thứ tự, cùng giá trị. Chỉ `lan_nhap.thoi_diem` đổi — kể cả khi nhập lại đúng file cũ (BR-7, A8).

### 5.3 Mã thoát

| Mã | Khi nào |
|---|---|
| 0 | Thành công; `--chi-kiem` hợp lệ; in hướng dẫn |
| 1 | File có lỗi cấu trúc hoặc lỗi dòng — không ghi gì |
| 2 | Sai lệnh hoặc tham số; không tìm thấy hay không mở được file; sai đuôi, quá 20 MB; file xuất (`xuat`) hoặc file mẫu (`tao-mau`) đã tồn tại |
| 3 | Lỗi cấu hình hoặc CSDL: thiếu chuỗi kết nối (nêu tên khoá, không in giá trị); không kết nối được; còn migration chưa chạy; đang có lần nhập khác; lỗi khi ghi (đã rollback) |

### 5.4 Cấu trúc mã

```
DichVuCong.Import/
  Program.cs                 # lớp ChuongTrinhNhap (Main): Generic Host + cấu hình + DI → return await UngDung.ChayAsync(...)
                             # không dùng câu lệnh cấp cao nhất: lớp Program tự sinh sẽ trùng Program của Api trong Tests
  UngDung.cs                 # public: nhận args, IServiceProvider, TextWriter ra/lỗi → mã thoát (test gọi trực tiếp)
  MaThoat.cs
  Lenh/                      # LenhNhap, LenhXuat, LenhTaoMau
  Excel/
    MauExcel.cs              # NGUỒN DUY NHẤT: 4 file, sheet, cột, bắt buộc, kiểu, độ dài, các danh sách lựa chọn (mức độ, mục Trung tâm, biểu tượng)
    DocExcel.cs              # mở file, kiểm cấu trúc, đọc + làm sạch ô → bảng dòng (sheet, số dòng, giá trị)
    GhiExcel.cs              # tạo workbook theo MauExcel (tao-mau, xuat, DuLieuMau dùng lại)
  KiemTra/                   # LoiDong, CanhBao, KetQuaKiemTra<T>
  Loai/
    ThuTuc/  PhanCong/  TrungTam/  TroLy/     # mỗi loại: KiemTra*.cs (thuần, không chạm DB) + Ghi*.cs
  Resources/ThongBao.resx    # mọi câu chữ in cho người vận hành, hướng dẫn, tiêu đề file xuất
  appsettings.json           # Logging: Microsoft.EntityFrameworkCore = Warning
```

- Phần kiểm là hàm thuần: vào là bảng dòng, ra là lỗi + dữ liệu đã chuẩn hoá. Test đơn vị dựng workbook trong bộ nhớ, không cần DB.
- `.resx`: ngôn ngữ trung tính là tiếng Việt (`NeutralResourcesLanguage("vi")`). Lớp truy cập có kiểu sinh lúc build bằng metadata `StronglyTyped*` của `EmbeddedResource` (đã làm ở T01). Câu có tham số dùng `string.Format(CultureInfo.CurrentCulture, …)`.
- `Console.OutputEncoding = UTF8` để in tiếng Việt trên console Windows.
- Content root đặt về `AppContext.BaseDirectory`, `appsettings.json` chép ra thư mục build. Đường dẫn file trong tham số tính theo thư mục đang đứng.
- Không thêm thư viện phân tích tham số: chỉ có 3 lệnh.
- `TimeProvider` lấy từ DI (`TimeProvider.System`), test thay bằng bản giả.
- Môi trường thật: `dotnet publish -c Release src/BackEnd/DichVuCong.Import`, chạy với biến môi trường `ConnectionStrings__DichVuCong`. Dùng cùng tài khoản DB với API.

## 6. Bản đầu của dữ liệu thật — `DichVuCong.DuLieuMau`

Đã chốt (A9): console project `src/BackEnd/DichVuCong.DuLieuMau/`, chủ sở hữu db-dev. Người dùng thêm project vào bảng Cấu trúc và Sở hữu của `CLAUDE.md`; planner không sửa `CLAUDE.md`.

- Tham chiếu `DichVuCong.Import` để dùng lại `MauExcel` + `GhiExcel`. File sinh ra luôn đúng mẫu mà không phải chép định nghĩa cột.
- `<IsPublishable>false</IsPublishable>`. Có trong `.sln` để luôn được build và không bị bỏ quên khi mẫu đổi. Công cụ nhập chạy thật không chứa dòng mã nào của phần này.
- Câu chữ in ra để thẳng trong mã, không qua `.resx`: công cụ chỉ dành cho lập trình viên (`CLAUDE.md`: quy tắc i18n không áp cho thông báo dành cho lập trình viên).
- Đọc JSON bằng `System.Text.Json`; không thêm gói.
- Không làm sạch chữ: giữ nguyên ký tự U+200E của nguồn để công cụ nhập làm sạch (BR-18). Nguồn có 30 chỗ, đều nằm trong thành phần hồ sơ và trình tự; tên thủ tục không có (db-dev kiểm 2026-10-12). Vì vậy AC-16 (U+200E trong tên thủ tục) thử bằng file soạn riêng (T05), không bằng bản đầu.

```
dotnet run --project src/BackEnd/DichVuCong.DuLieuMau -- data-mau data-mau/excel [--nguoi-chiu-trach-nhiem "<họ tên>"]
dotnet run --project src/BackEnd/DichVuCong.Import   -- nhap tat-ca data-mau/excel
```

Thêm 2026-10-12: lệnh `xuat-json` sinh file dữ liệu mẫu (đã làm sạch, được commit) cho nguồn Mẫu của API, qua chính đường kiểm của công cụ nhập — F00 plan §9.5, F00 T27. Lệnh xuất Excel ở trên giữ nguyên.

Kết quả ghi vào `data-mau/excel/`, nằm trong `data-mau/` nên đã được `.gitignore` bỏ qua: không commit. Dùng ở máy dev như dữ liệu chạy thử. Trước khi nạp lên môi trường thật, Trung tâm rà và sửa chính các file này (kế hoạch 8.5b: phân công, thủ tục còn thiếu so với bộ khoảng 302 TTHC cấp xã, mã đơn vị, giờ làm việc, người chịu trách nhiệm).

Phương án khác: một lệnh ẩn trong `Import`, chỉ build ở Debug (`#if DEBUG`). Không chọn, vì dễ lọt vào bản Release và trộn mã dev vào công cụ chạy thật.

Nguồn vào:

| File | Nội dung |
|---|---|
| `data-mau/thu-tuc.json`, `trung-tam.json`, `o-dich-vu.json`, `qd-tach-thua.json` | Đã có (`data-mau/README.md`) |
| `data-mau/tro-ly.json` | Mới — T17 tải từ trang Vàm Cỏ: `CHIPS` (chủ đề gợi ý), `SYNONYM_MAP` (từ đồng nghĩa), `SPEECH_ABBR` (viết tắt), cùng các câu trả lời viết sẵn nếu trang có. Ghi nguồn (địa chỉ file JS) và ngày tải; đổi "Vàm Cỏ" thành "Cần Giuộc" nếu có trong nội dung |
| `data-mau/linh-vuc.json`, `nhan-su.json` | Không dùng: phân công, nhân sự của Vàm Cỏ không vào bản đầu (BR-9) |

Chuyển đổi — theo `du-lieu.md` mục "Bản đầu của dữ liệu thật":

| File · sheet | Nội dung |
|---|---|
| thu-tuc · Thủ tục | 408 thủ tục từ `thu-tuc.json`. `danhMuc` → 2 cột đánh dấu. `yeuCauDieuKien` → "Yêu cầu, điều kiện", giữ nguyên cả các giá trị "Không", "Không quy định" (§14 câu 15). Mã đơn vị `H53.183` như `thu-tuc.json`; 28 thủ tục nguồn không ghi đơn vị để trống. Không có ưu tiên, thường gặp và các trường BR-16 |
| thu-tuc · Thường gặp | 16 dòng, đúng mã và thứ tự ở `du-lieu.md`, viết hằng trong mã. Công cụ kiểm cả 16 mã đều có trong `thu-tuc.json` (đã kiểm tay 2026-10-12: đủ), thiếu thì dừng |
| thu-tuc · sheet con | Trình tự, Cách thức, Kết quả, Căn cứ (không lấy `url`, `ngayHieuLuc`, `coQuan`, `loai`). Thành phần hồ sơ kèm `banChinh`, `banSao` (nguồn là chuỗi `"0"`, `"1"`, `"2"` → ghi ô số) |
| phan-cong | Hai sheet chỉ có dòng tiêu đề (BR-9) |
| trung-tam · Trung tâm | Tên đơn vị: "Trung tâm Phục vụ hành chính công xã Cần Giuộc". Người chịu trách nhiệm: tham số `--nguoi-chiu-trach-nhiem`, không có thì để trống (§14 câu 14). Chức vụ: "Giám đốc". Cơ quan chủ quản: "UBND xã Cần Giuộc". Địa chỉ, Điện thoại, Email: từ `trung-tam.json`. Xã: "xã Cần Giuộc"; Tỉnh: "tỉnh Tây Ninh". Mã đơn vị trên Cổng DVC: `H53.183`. Bản đồ, mạng xã hội, ghi chú ngày nghỉ: để trống vì chưa được chốt (`du-lieu.md`: mục còn mở để trống) — `trung-tam.json` có câu ghi chú ngày nghỉ nhưng chưa chốt, vẫn để trống. Sheet đủ 16 mục |
| trung-tam · Giờ làm việc | 7 dòng: Thứ Hai – Thứ Sáu 07:00–11:30, 13:30–17:00; Thứ Bảy, Chủ nhật để trống (giờ tạm — câu hỏi mở 13) |
| trung-tam · Liên kết | 3 dòng theo phần "Chân trang" của `lien-ket.md` §1: Cổng Dịch vụ công Quốc gia (https://dichvucong.gov.vn), Cổng thông tin điện tử xã Cần Giuộc, Cổng thông tin điện tử tỉnh Tây Ninh |
| trung-tam · Ô dịch vụ | 6 ô theo `o-dich-vu.json` (khớp `lien-ket.md` §1); 2 ô đầu để trống link (BR-11). Biểu tượng lần lượt: `boc-so`, `danh-gia`, `tra-cuu-ho-so`, `thanh-toan`, `cong-dvc`, `cong-thong-tin`. Không có mô tả |
| tro-ly · Câu hỏi mẫu | (a) Câu trả lời viết sẵn lấy từ Vàm Cỏ: khoảng 6 câu về quy định tách thửa, ghép từ `qd-tach-thua.json`, mã liên quan `1.012784`; thêm các câu khác nếu T17 tìm thấy. (b) Nhóm câu hỏi về Trung tâm: 5 câu, mỗi câu gắn một mục, kèm vài cách hỏi khác (vd. "trung tâm ở đâu", "địa chỉ trung tâm"; "mấy giờ làm việc"; "số điện thoại trung tâm"; "email trung tâm"; "nộp hồ sơ trực tuyến ở đâu"). Câu và cách hỏi viết trong mã `DuLieuMau`. Câu trả lời tách thửa ghi bảng diện tích theo "mức 1 / mức 2" như nguồn; Trung tâm cần rà cách ghi này (kế hoạch 8.5b) |
| tro-ly · Chủ đề gợi ý | 6 dòng theo `CHIPS`: Đất đai, Hộ tịch, Bảo trợ XH (lĩnh vực "Bảo trợ xã hội"), Chăn nuôi, Trẻ em, Xây dựng (lĩnh vực "Hoạt động xây dựng"). Công cụ kiểm cả 6 lĩnh vực có trong `thu-tuc.json` (đã kiểm tay: đủ) |
| tro-ly · Từ đồng nghĩa | Từ `SYNONYM_MAP`: **45 dòng** — gộp 119 cặp theo từ đích, bỏ cặp tự trỏ chính nó (T17 báo) |
| tro-ly · Viết tắt | Từ `SPEECH_ABBR`. Thiếu ví dụ nào của `du-lieu.md` (TTHC, UBND, CCCD, đk) thì thêm. Kết quả **12 dòng**: 10 từ nguồn, thêm CCCD và đk |

Số bản ghi mong đợi sau `nhap tat-ca` (có tham số người chịu trách nhiệm): thủ tục 408 (xã 266, tỉnh 408), lĩnh vực 75, thường gặp 16, phân công 0, nhân sự 0, giờ làm việc 5 ngày, liên kết 3, ô dịch vụ 6, câu hỏi mẫu 11 (5 câu theo mục), chủ đề gợi ý 6, từ đồng nghĩa 45, viết tắt 12. Không có tham số → `nhap` báo thiếu "Người chịu trách nhiệm", không nhập gì (đúng BR-8).

## 7. Thư viện — ClosedXML

Kiểm ngày 2026-10-08, qua NuGet API và GitHub API. Đã thêm ở T01.

| Tiêu chí | Kết quả |
|---|---|
| Phiên bản | **0.105.1** (2026-07-25). Trước đó 0.105.0 (2025-05), 0.104.2 (2024-11): khoảng một bản mỗi năm |
| Giấy phép | MIT |
| Bảo trì | Repo không lưu trữ, commit gần nhất 2026-09-18, khoảng 5,7k sao, 470 issue mở |
| .NET 10 | Đóng gói `netstandard2.0` và `netstandard2.1` → chạy được trên net10.0 |
| Lỗ hổng | NuGet không ghi nhận |
| Phụ thuộc | DocumentFormat.OpenXml [3.1.1, 4) MIT · ClosedXML.Parser MIT · ExcelNumberFormat MIT · RBush.Signed MIT · **SixLabors.Fonts [1.0.0, 3)** |

- SixLabors.Fonts: bản 1.x giấy phép Apache-2.0; từ 2.x là "Six Labors Split License". Split License vẫn cho dùng theo Apache-2.0 khi gói là phụ thuộc gián tiếp ("Transitive Package Dependency"), đúng trường hợp này. NuGet chọn bản thấp nhất thoả điều kiện (1.0.0); lockfile giữ cố định. Nâng bản thì kiểm lại giấy phép.
- Chỉ `DichVuCong.Import` (và qua nó là `Tests`, `DuLieuMau`) tham chiếu ClosedXML. `Data` và `Api` không có → API không phình, không thêm bề mặt tấn công.
- Lý do chọn: đọc và ghi trong cùng một thư viện; biết kiểu ô (để bắt ô số ở cột mã); đặt được định dạng Text và danh sách chọn cho file mẫu; MIT.
- Đã cân nhắc: MiniExcel (khó đặt định dạng, danh sách chọn); ExcelDataReader (chỉ đọc); DocumentFormat.OpenXml dùng thẳng (dài dòng); EPPlus (giấy phép Polyform Noncommercial, loại); NPOI (nặng hơn, API cũ).
- Rủi ro: phát hành thưa. Mã chỉ dùng phần cơ bản và gói gọn trong `Excel/`, nên đổi sang thư viện khác chỉ sửa `DocExcel` / `GhiExcel`.

## 8. Bàn giao cho F02–F08 và việc ở API

### 8.1 Các chức năng đọc dữ liệu

F01 không có endpoint và không có giao diện.

Sửa 2026-10-12: các chức năng đọc qua lớp nguồn dữ liệu `INguonDuLieu` (F00 plan §9.3, quy tắc §9.4), không đọc thẳng `AppDbContext`. Bảng dưới là bảng ở nguồn PostgreSql; nguồn Mẫu có cùng dữ liệu, nạp từ file dữ liệu mẫu.

| Chức năng | Bảng |
|---|---|
| F02 | `trung_tam`, `gio_lam_viec` (`Thu` 1 = Thứ Hai, theo ISO; chỉ có ngày làm việc), `o_dich_vu` (`BieuTuong` → icon Lucide; `Url` null → ô không bấm được, C01 BR-12), `lien_ket` |
| F03 | `thu_tuc` có `thu_tu_thuong_gap`, sắp theo cột này (BR-15). Popup: cột `jsonb`, `text[]`, `yeu_cau_dieu_kien`; giấy tờ có `ban_chinh`, `ban_sao` null thì không hiện số bản (F03 BR-3) |
| F04 | `thu_tuc` (bản rút gọn: mã, tên, `ten_tim_kiem`, `linh_vuc_ma`, mức độ, danh mục), `linh_vuc`. Không có ưu tiên (F04 BR-6). Dùng `linh_vuc.ma` trên địa chỉ trang |
| F05 | `linh_vuc` + số thủ tục đếm từ `thu_tuc`; nơi nộp từ `phan_cong_linh_vuc`, bảng này có thể rỗng (F05 BR-4) |
| F06 | `cau_hoi_mau(_cach_hoi)`: `muc_trung_tam` khác null thì trả lời bằng `trung_tam`, `gio_lam_viec`, `lien_ket` đọc lúc hỏi (F06 BR-9); mục "nộp trực tuyến" lấy liên kết tên "Cổng Dịch vụ công Quốc gia" (§14 câu 17). `chu_de_goi_y` theo `thu_tu`, nối `linh_vuc_ma` với `thu_tuc.linh_vuc_ma`, so đúng mã (F06 BR-11). `tu_dong_nghia`, `viet_tat`, `phan_cong_linh_vuc` (nối `linh_vuc.ma`), `nhan_su` (nối số quầy; cả hai có thể rỗng — F06 BR-3), `thu_tuc`. Ghi `cau_chua_tra_loi`: che thông tin cá nhân trước, rồi `INSERT … ON CONFLICT (khoa_gop) DO UPDATE SET so_lan_gap = so_lan_gap + 1, lan_gap_cuoi = <giờ hiện tại>`. Giờ lấy qua `TimeProvider`, cùng nguồn với việc xoá ở §8.2. Sửa 2026-10-12: F06 ghi qua `IKhoCauChuaTraLoi.GhiAsync` (F00 plan §9.6); câu SQL trên nằm trong kho PostgreSql, nguồn Mẫu giữ trong bộ nhớ |
| F07 | `viet_tat` |
| F08 | `trung_tam`, `lien_ket`; ngày cập nhật = `lan_nhap.thoi_diem` của `thu-tuc`, đổi sang ngày Việt Nam |

**Cache:** F00 làm chung (F00 plan §1 mục "Cache dữ liệu theo lần nhập", task F00 T18). Khoá output cache và ETag gắn với `max(lan_nhap.thoi_diem)`; API trả `Cache-Control: no-cache`, trình duyệt hỏi lại bằng ETag. Endpoint đọc dữ liệu nhập của F02–F08 chỉ cần gắn policy `danh-muc`. Nhập xong thì lần tải trang kế tiếp thấy dữ liệu mới (F00 BR-10, AC-11; F01 AC-3, AC-12; F02 AC-3; F08 AC-6, AC-7).

### 8.2 Xoá câu chưa trả lời sau 90 ngày (F06 BR-12) — đề xuất, §14 câu 16

| Phần | Cách làm | Ai, task |
|---|---|---|
| Xoá | `BackgroundService` trong API, `Features/Chatbot/XoaCauChuaTraLoiHetHan.cs`. Chạy lúc khởi động, rồi mỗi giờ. `ExecuteDeleteAsync` các dòng có `lan_gap_cuoi < bây giờ − CauChuaTraLoi.ThoiGianGiu`. Log số dòng đã xoá, không log nội dung câu. Lỗi DB → log Warning, thử lại ở lượt sau, không làm dừng API. Giờ lấy qua `TimeProvider`. Sửa 2026-10-12: câu xoá chuyển vào `KhoCauChuaTraLoiPostgreSql`; việc định kỳ gọi `IKhoCauChuaTraLoi.XoaQuaHanAsync`, chạy cả ở nguồn Mẫu (F00 plan §9.6) | chatbot-dev, T18; sửa ở F00 T28 |
| Đăng ký | `Features/Chatbot/ChatbotServiceCollectionExtensions.AddChatbot()` đăng ký việc định kỳ (F06 thêm dịch vụ của mình vào đây sau). `AddApiServices` gọi `AddChatbot()`; `Program.cs` không đổi. Sửa 2026-10-12: `AddChatbot(nguon)` đăng ký kho theo nguồn dữ liệu | chatbot-dev T18 viết hàm (sửa ở F00 T28); gọi hàm: F00 T29 (gộp T19) |
| Xuất | `xuat` chỉ lấy câu còn hạn (§5.1), đúng cả khi việc xoá chưa chạy tới | db-dev, T10 |
| Chỉ mục | `cau_chua_tra_loi.lan_gap_cuoi` | db-dev, T03 |

Lý do:

- BR-12 yêu cầu tự xoá, "không cần ai chạy lệnh", nên không đặt ở công cụ nhập: Import chỉ chạy khi có người gọi.
- Không dùng `pg_cron`: extension phải cài trên máy chủ DB, môi trường thật chưa chắc có.
- API luôn chạy nên làm định kỳ được. Nhiều bản API cùng chạy thì cùng xoá; không sao, vì xoá lặp lại không đổi kết quả.
- Đặt ở chatbot-dev vì `cau_chua_tra_loi` là dữ liệu của trợ lý.

Khi lập plan F06, F06 tham chiếu T18, T19, không lập task trùng.

## 9. Hiệu năng

- Không ảnh hưởng ngân sách JS hay p95 của API: công cụ nhập chạy ngoài API.
- Đọc: ClosedXML nạp cả workbook vào bộ nhớ. Khoảng 1.000 thủ tục + 7.000 dòng con: dự kiến dưới 30 giây và dưới 500 MB RAM trên máy dev. Đo lại ở T12 với bản đầu (408 thủ tục, khoảng 7.200 dòng con).
- Ghi: một transaction, `DELETE` + `INSERT` theo lô của EF. API vẫn đọc bản cũ tới lúc commit, không bị khoá chờ (Q2).
- Index GIN chỉ tốn thêm phần nhỏ thời gian ghi ở quy mô này.
- Việc xoá định kỳ: một câu `DELETE` mỗi giờ, có index trên `lan_gap_cuoi`, không ảnh hưởng p95 của trợ lý.

## 10. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| XSS qua link (`javascript:`, `data:`) trong ô dịch vụ, liên kết, mạng xã hội, bản đồ — F02, F08 đặt vào `href` | Chỉ nhận URL tuyệt đối `http`/`https` (§3.1, BR-14). Ô dịch vụ không có link lưu null, FE hiện ô không phải liên kết (C01 BR-12). Email, điện thoại kiểm dạng trước khi dùng cho `mailto:`, `tel:` |
| Nội dung có HTML | Lưu chữ thuần; FE hiển thị dạng chữ (đã cấm `dangerouslySetInnerHTML`). Bỏ ký tự điều khiển (PostgreSQL không nhận `\0`) và ký tự vô hình (BR-18) |
| File độc hại | Chỉ `.xlsx`, ≤ 20 MB, mở chỉ đọc. Không tính công thức, không chạy macro (`.xlsm` bị từ chối). OpenXML SDK không xử lý DTD |
| Chèn công thức vào file xuất | Ghi mọi ô câu hỏi dưới kiểu chuỗi, không bao giờ gán công thức. Câu bắt đầu bằng `=` vẫn chỉ là chữ |
| Dữ liệu cá nhân | `cau_chua_tra_loi` chỉ chứa câu F06 đã che. Giữ 90 ngày kể từ lần gặp cuối rồi tự xoá (§8.2, câu hỏi mở 21); file xuất không có câu quá hạn. File xuất chứa câu đã che; người vận hành giữ như tài liệu nội bộ. Họ tên người chịu trách nhiệm, nhân sự là thông tin công khai trên trang |
| Họ tên người chịu trách nhiệm | Chỉ nằm trong file nhập và DB, không nằm trong mã hay tài liệu (câu hỏi mở 18). `DuLieuMau` nhận qua tham số dòng lệnh, không ghi vào mã |
| Dữ liệu tải từ trang Vàm Cỏ (T17) | Chỉ lấy dữ liệu chữ, đi qua cùng bước kiểm và làm sạch như mọi file nhập. Không chạy mã của trang nguồn |
| Chuỗi kết nối | Chỉ đọc từ user-secrets (dev) hoặc biến môi trường. Không in ra khi lỗi. Không bật `EnableSensitiveDataLogging`. Log EF ở mức Warning nên không in SQL |
| Hai lần nhập chồng nhau | Advisory lock trong transaction |
| DB chưa migrate | Kiểm migration chưa chạy trước khi ghi |
| Tài khoản DB | Một tài khoản (`CLAUDE.md`), không cấp quyền riêng theo bảng |

## 11. Kiểm thử

| Nơi | Agent | Nội dung |
|---|---|---|
| `Tests/Data/TiengVietTests.cs` | db-dev | Bộ mẫu `TaoMaDuongDan` (§4); `BoKyTuVoHinh` theo bộ mẫu F00 §4 (F00 T15) |
| `Tests/Data/Import/` | db-dev | Không cần DB. Workbook dựng trong bộ nhớ: cấu trúc (thiếu sheet, thiếu cột, cột lạ, "Ghi chú", tên cột khác hoa và dấu, sheet chỉ có tiêu đề); kiểu ô (ô số ở cột mã, đánh dấu sai, giờ, danh sách trong ô, số nguyên dương, số nguyên ≥ 0, lựa chọn); làm sạch U+200E, U+200F; từng dòng của bảng §3.6; 3 dòng lỗi → đúng 3 dòng in ra (AC-2); BR-8 thiếu từng mục; URL `javascript:` bị chặn; số bản 0/0 → null; thứ tự danh sách con; `tao-mau` → đọc lại không lỗi cấu trúc; `xuat` lọc câu quá hạn với `TimeProvider` giả; mã thoát của `UngDung` với tham số sai |
| `Tests/Integration/` | tester | Cần PostgreSQL (A10: biến môi trường `ConnectionStrings__DichVuCongTest`; không có thì tự bỏ qua). Mỗi lần chạy tạo một DB riêng, chạy migration, xoá khi xong. Gọi `UngDung.ChayAsync` trong cùng tiến trình. AC-1…AC-16 ở mức DB; BR-1 (lỗi giữa chừng: trigger tạm ném lỗi khi chèn vào `o_dich_vu` → dữ liệu cũ và `lan_nhap` giữ nguyên); BR-6 (so toàn bộ bảng sau 2 lần nhập); BR-7; `tat-ca` có một file lỗi → không loại nào được ghi; việc xoá định kỳ (T18) chạy một lượt với `TimeProvider` giả |
| Chạy tay | tester | `DuLieuMau` → `nhap tat-ca` với bản đầu; số bản ghi khớp §6; đo thời gian, bộ nhớ |

`Tests.csproj` đã tham chiếu `DichVuCong.Import` (T02) và `DichVuCong.Api`.

## 12. Truy vết

| Spec | Phần xử lý | Task |
|---|---|---|
| Phạm vi: thủ tục xã, tỉnh + chi tiết; thường gặp có thứ tự | §3.2, §4 `thu_tuc`, `linh_vuc` | T03, T05 |
| Phạm vi: lĩnh vực → quầy, nhân sự | §3.3, §4 | T06 |
| Phạm vi: trung tâm, liên kết, ô dịch vụ | §3.4, §4 | T07 |
| Phạm vi: câu hỏi mẫu, chủ đề gợi ý, đồng nghĩa, viết tắt | §3.5, §4 | T08 |
| Phạm vi: xuất câu chưa trả lời, giữ 90 ngày | §5.1 `xuat`, §8.2 | T10, T18; F00 T28, F00 T29 (gồm T19) |
| Phạm vi: bản đầu của dữ liệu thật | §6 | T17, T12 |
| BR-1 thay toàn bộ, lỗi giữa chừng giữ dữ liệu cũ | Q2, §5.2 bước 6 | T05–T09, T15 |
| BR-2 kiểm toàn bộ trước khi ghi; lỗi cấu trúc theo sheet | §3.1, §5.2 bước 2–5; `tat-ca` kiểm cả 4 file | T04–T09 |
| BR-3 một sheet Thủ tục, hai cột danh mục | §3.2 | T05 |
| BR-4 một mã một bản chi tiết | §3.2 (một dòng mỗi mã), PK `thu_tuc.ma` | T03, T05 |
| BR-5 lĩnh vực chưa có quầy để trống, quầy là số | Q6, §3.3, `quay` null | T06 |
| BR-6 nhập lại cho kết quả không đổi | Q3, §5.2 | T05–T09, T15 |
| BR-7 ngày nhập thành công gần nhất | `lan_nhap` ghi trong cùng transaction | T03, T05, T15 |
| BR-8 đủ 5 mục chân trang | §3.4, §3.6 | T07 |
| BR-9 phân công, nhân sự được rỗng; bản đầu rỗng | §3.3, §6 | T06, T12 |
| BR-10 không nhập ưu tiên | §3.2 (không có cột), §4 (không có cột DB), §5.2 (không in) | T03, T05, T12 |
| BR-11 ô dịch vụ được trống link | §3.4, §4 `o_dich_vu.url` null | T03, T07 |
| BR-12 câu trả lời viết sẵn hoặc mục Trung tâm | §3.5, Q11, CHECK ở §4 | T03, T08 |
| BR-13 chủ đề gợi ý | §3.5, §4 `chu_de_goi_y` | T03, T08 |
| BR-14 dòng lỗi theo loại; link chỉ `http(s)` | §3.1, §3.6 | T04–T08 |
| BR-15 sheet thường gặp có thứ tự | §3.2, Q9 | T03, T05, T12 |
| BR-16 thêm "Yêu cầu, điều kiện" và số bản; bỏ các trường khác | §3.2, Q4, Q10 | T03, T05, T12 |
| BR-17 giờ làm việc 7 dòng | §3.4 | T07, T11, T12 |
| BR-18 làm sạch chữ, cùng bộ ký tự với ô tìm kiếm | §3.1 kiểu Chữ, Q7 | F00 T15, F00 T19, T04, T05 |
| AC-1 in số bản ghi theo loại | §5.2 bước 7 | T05–T09 |
| AC-2 3 dòng lỗi → không nhập, in đúng 3 dòng | §3.6, mã thoát 1 | T04, T05 |
| AC-3 F04 hiện đúng số thủ tục xã, tỉnh | Cột danh mục (mức DB); cache theo lần nhập (F00) | T15, F00 T18, F04 |
| AC-4 nhập 2 lần không đổi | Q3 | T15 |
| AC-5 xuất câu chưa trả lời | §5.1 | T10, T15 |
| AC-6 thiếu email → không nhập, giữ dữ liệu cũ | §3.6, BR-2 | T07, T15 |
| AC-7 phân công, nhân sự rỗng → 0, 0; nhập quầy 3 → hiện | §3.3 | T06, T15; giao diện: F05, F06 |
| AC-8 thường gặp 16 → 15, đổi thứ tự | §3.2, §5.2 | T05, T15; giao diện: F03 |
| AC-9 ô dịch vụ trống link vẫn nhập | §3.4 | T07; giao diện: F02 |
| AC-10 câu hỏi mẫu gắn mục; trái BR-12 → 2 lỗi | §3.5, §3.6 | T08 |
| AC-11 6 chủ đề; chủ đề thiếu lĩnh vực → lỗi | §3.5, §3.6 | T08; giao diện: F06 |
| AC-12 nhập lại đúng file → ngày đổi | `lan_nhap` | T05, T15; giao diện: F08 |
| AC-13 5 file, mỗi file đúng 1 dòng lỗi | §3.6 (ghi chú lỗi kéo theo) | T05, T06, T07, T14 |
| AC-14 yêu cầu, điều kiện và số bản | §3.2, Q10 | T05; giao diện: F03 |
| AC-15 giờ làm việc 7 dòng | §3.4 | T07; giao diện: F02 |
| AC-16 U+200E trong tên → tìm được, không còn U+200E | §3.1 kiểu Chữ, `BoKyTuVoHinh` ở BE và FE | F00 T15, F00 T19, T05; giao diện: F04 |

## 13. Rủi ro

1. **Bản đầu chưa đủ để chạy thật:** chưa có họ tên người chịu trách nhiệm, số nhà, link bản đồ, phân công quầy; danh mục có 266 thủ tục cấp xã so với khoảng 302 của tỉnh; câu trả lời tách thửa ghi "mức 1 / mức 2" theo nguồn, Trung tâm cần rà. Giảm thiểu: `nhap` từ chối khi thiếu người chịu trách nhiệm (BR-8); kế hoạch 8.5b giao Trung tâm rà trước khi nạp lên môi trường thật.
2. **Excel tự đổi dữ liệu:** mã `1.013980` thành số (kết quả còn tuỳ thiết lập vùng của máy), số điện thoại mất số 0 đầu, `- Tờ khai…` thành công thức. Giảm thiểu: mẫu đặt sẵn định dạng Text; công cụ báo lỗi khi gặp ô số ở cột mã, không đoán. Hệ quả: lỗi kéo theo ở sheet con (§3.6).
3. **Cache API trả dữ liệu cũ** nếu F00 T18 chưa xong khi làm F02–F04: các AC "nhập lại → trang đổi" của F01, F02, F04, F08 sẽ trượt. F00 T18 phải xong trước khi tester chạy các AC này.
4. **Nguồn Vàm Cỏ (T17):** trang có thể đổi hoặc không truy cập được; cấu trúc `SYNONYM_MAP`, `SPEECH_ABBR` chưa biết. Giảm thiểu: T17 báo lại cấu trúc và số dòng trước khi T12 dùng; tải được một lần là đủ, kết quả nằm trong `data-mau/`.
5. **`data-mau/` không commit**, nên chỉ máy có `data-mau/` mới sinh lại được bản đầu. Giữ một bản sao `data-mau/` ngoài repo cho tới khi Trung tâm tiếp nhận file Excel.
6. **Dữ liệu thử trong AC khác bản đầu:** F03 dùng 43 thủ tục thường gặp, F06 AC-12 cần nhân sự, F05 AC-6 cần file phân công có quầy 3. Tester soạn file thử cho từng AC, không dựa vào bản đầu.
7. **ClosedXML phát hành thưa** (§7). Phạm vi dùng nhỏ, đổi được.
8. **Chạy migration trên môi trường thật:** chỉ có một tài khoản và `dotnet ef` cần SDK. Công cụ nhập từ chối khi còn migration chưa chạy. Cách chạy migration lúc triển khai thuộc kế hoạch 8.5.
9. **Việc xoá định kỳ nằm trong API:** API dừng lâu thì câu quá hạn còn trong DB tới lần khởi động sau. `xuat` vẫn lọc nên file xuất không có câu quá hạn.
10. **Integration test cần PostgreSQL:** CI trên TFS (kế hoạch 8.1) phải có dịch vụ PostgreSQL, nếu không các test này bị bỏ qua.

## 14. Cần hỏi

### A. Đã trả lời 2026-10-12

| # | Câu hỏi | Trả lời | Áp vào |
|---|---|---|---|
| 1 | Danh mục xã, tỉnh biểu diễn thế nào trong Excel? | Một sheet "Thủ tục", mỗi mã một dòng, 2 cột đánh dấu (theo đề xuất) | §3.2 |
| 2 | "Ưu tiên" và "Thường gặp" nằm ở đâu? | Thường gặp ở sheet riêng (Mã thủ tục, Thứ tự), F03 hiện theo thứ tự. Bỏ hẳn "ưu tiên" (câu hỏi mở 8) | §3.2, Q9, §4 |
| 3 | Có nhập thêm trường ngoài `du-lieu.md`? | Thêm 2 trường: "Yêu cầu, điều kiện"; số bản chính, số bản sao của từng giấy tờ (cả hai bằng 0 coi như chưa ghi). Các trường khác không nhập | §3.2, Q4, Q10 |
| 4 | Giờ làm việc nhập dạng nào? | 7 dòng theo thứ (theo đề xuất) | §3.4 |
| 5 | Quy tắc dòng lỗi cho các sheet khác | Như §3.6, cộng các dòng ba-analyst đưa vào BR-14 | §3.6 |
| 6 | Quầy ghi bằng số? | Số nguyên dương hoặc trống. Phân công, nhân sự được để trống hoàn toàn | §3.3 |
| 7 | Ô dịch vụ chưa có link | **Ngược đề xuất:** được để trống link; F02 vẫn hiện ô, không bấm được. Link có ghi mà không phải `http(s)` vẫn là lỗi | §3.4, §4 |
| 8 | Nhập lại đúng file cũ thì ngày cập nhật đổi? | Có — ngày nhập thành công gần nhất (theo đề xuất) | §4 `lan_nhap`, §5.2 |
| 9 | Thêm project `DichVuCong.DuLieuMau`? | Có, db-dev sở hữu; cũng là công cụ tạo bản đầu của dữ liệu thật | §6 |
| 10 | Integration test chạy với PostgreSQL nào? | PostgreSQL local qua biến môi trường, tự bỏ qua khi không có (theo đề xuất) | §11 |

### B. Đã làm theo đề xuất

| # | Nội dung | Đã chốt |
|---|---|---|
| 11 | Quy ước file | Tên sheet và tên cột tiếng Việt có dấu, so khớp không phân biệt hoa thường và dấu; đặt hằng trong `MauExcel.cs`, không trong `.resx` (Q8). Cột lạ → lỗi (trừ "Ghi chú") — nay là BR-2. Danh sách trong ô phân cách bằng `;` hoặc xuống dòng. Biểu tượng ô dịch vụ chọn trong danh sách khoá cố định (§3.4) |
| 12 | Mã lĩnh vực | Sinh từ tên (`ho-tich`), dùng làm khoá ổn định; F04, F05 dùng trên địa chỉ trang và QR. Đổi tên lĩnh vực → đổi mã → QR đã in hết dùng được (`lien-ket.md` §3) |
| 13 | Xoá câu chưa trả lời | Câu hỏi mở 21 đã trả lời: giữ 90 ngày kể từ lần gặp cuối rồi tự xoá. Cơ chế: câu 16 |

### C. Mới — đề xuất, làm theo nếu người dùng không phản đối

| # | Câu hỏi | Đề xuất | Lý do |
|---|---|---|---|
| 14 | `DuLieuMau` không biết họ tên người chịu trách nhiệm (câu hỏi mở 18: họ tên chỉ nằm trong file nhập) | Nhận qua tham số `--nguoi-chiu-trach-nhiem`. Không có tham số thì để trống ô → `nhap` báo thiếu mục, không nhập gì (BR-8) | Không điền chữ giữ chỗ, để chữ đó không thể lên chân trang thật. Máy dev truyền một tên giả |
| 15 | 32/174 thủ tục Vàm Cỏ ghi "Yêu cầu, điều kiện" là "Không", "Không có", "Không quy định" | Nhập nguyên văn; popup hiện như mọi giá trị khác | Không đoán thay nguồn; "Không" vẫn là thông tin (không có điều kiện riêng). Phương án khác: coi như trống để F03 ẩn mục — cần thêm quy tắc vào F03 BR-3 |
| 16 | Cơ chế tự xoá câu chưa trả lời sau 90 ngày | Việc định kỳ mỗi giờ trong API, chatbot-dev sở hữu; `xuat` lọc thêm (§8.2) | BR-12 "không cần ai chạy lệnh" nên không đặt ở Import. Không cần extension DB. Phương án khác: chỉ xoá khi chạy `xuat` — trái BR-12 |
| 17 | F06 nhận ra liên kết để trả lời "nộp trực tuyến ở đâu" bằng cách nào | Liên kết có tên (sau chuẩn hoá) "Cổng Dịch vụ công Quốc gia" ở sheet Liên kết, đúng chữ F06 BR-9. `nhap trung-tam` cảnh báo khi không có | Không thêm cột hay mục mới vào file. Phương án khác: thêm mục "Cổng nộp hồ sơ trực tuyến" ở sheet Trung tâm — rõ hơn, không phụ thuộc tên, nhưng thêm một trường ngoài `du-lieu.md` |
| 18 | Danh sách biểu tượng ô dịch vụ | Bỏ `mot-cua`, thêm `cong-thong-tin` (§3.4) | Ô "Hệ thống Một cửa tỉnh" đã bỏ, ô thứ 6 là Cổng TTĐT xã (câu hỏi mở 32) |
| 19 | (thêm 2026-10-12) Nhãn mục "Xã" ở sheet Trung tâm. Mã hiện dùng nhãn `Xã`; `du-lieu.md` gọi là "tên đơn vị hành chính", ghi đủ loại đơn vị. Nếu xã thành phường (câu hỏi mở 35), ô ghi "phường …" nằm dưới nhãn "Xã" gây nhầm | Đổi nhãn thành "Đơn vị hành chính (ghi đủ)"; giữ nhãn "Tỉnh". Nhãn cũ "Xã" thành mục lạ (chưa có file thật nào dùng). Task T20 | Đúng `du-lieu.md`; không phải đổi nhãn lần nữa khi đổi loại đơn vị. Đổi tên mục là đổi định dạng file (Q8), nên hỏi trước. Phương án khác: giữ "Xã", chỉ ghi chú ở sheet Hướng dẫn |

### D. Ghi cho ba-analyst (không chặn việc làm)

- Câu hỏi mở 38: trả lời A3 đã chốt "cả hai bằng 0 thì coi như chưa ghi", nhưng cột Trả lời ở `cau-hoi-mo.md` còn trống; spec F01 (mục Câu hỏi mở) và F03 BR-3 vẫn ghi câu 38 còn mở. Plan làm theo A3 (Q10).
- F03 AC-20 còn chữ "nhập lại file bỏ đánh dấu 1 thủ tục". Nay thường gặp là sheet riêng, nên là "bỏ 1 dòng ở sheet Thường gặp" như F01 AC-8.
- (2026-10-12) `du-lieu.md` mục "Bản đầu của dữ liệu thật" đã ghi từ đồng nghĩa 45 dòng; plan khớp (viết tắt 12 dòng).
- (thêm 2026-10-12) `du-lieu.md` ghi "Dữ liệu Vàm Cỏ có 30 ký tự U+200E, U+200F lẫn trong chữ": đúng, nhưng 30 chỗ đều ở thành phần hồ sơ và trình tự, không ở tên thủ tục. Spec AC-16 thử bằng file soạn riêng nên không phải sửa; chỉ cần biết khi đối chiếu.
