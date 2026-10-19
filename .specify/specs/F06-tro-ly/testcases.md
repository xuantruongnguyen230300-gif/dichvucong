---
id: F06
ten: Trợ lý trả lời câu hỏi — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: chưa chạy — viết ở T16 (code đang làm song song). Chạy ở T17 (tích hợp, hiệu năng BE), T18 (E2E, truy cập, ngân sách), T19 (toàn bộ + thử tay); kết quả vào result/test.md
---

# F06 · Trợ lý trả lời câu hỏi — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/tro-ly.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`). Đồng hồ giả bằng `page.clock.install({ time })` |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory. Ca nhóm chatbot-dev: `Tests/Api/Chatbot/` (T01–T07; tester chỉ rà). Ca nhóm tester: `Tests/Integration/Chatbot/` (T17) — DB thật qua Testcontainers PostgreSQL nếu máy có Docker, không có thì bỏ qua và ghi vào `result/test.md` |
| VT | Vitest do chatbot-dev viết (T09, T11–T13); tester chỉ rà |
| CURL | `curl -I`, `curl -s -X POST` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell (`find`, `grep`, `gzip`, `npm`, `dotnet`) |
| TAY | Thử tay (NVDA, TalkBack, điện thoại thật, kiosk thật, Unikey) |
| CHAY-THAT | Ca cần **chế độ chạy thật** (F00 BR-16: profile `https-postgresql`, `nhap tat-ca`, `xuat cau-chua-tra-loi`) — AC-8, AC-14, AC-16, AC-27 và các ca nhập lại dữ liệu |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/?kiosk=1`. 320 chỉ cho ca reflow. Dưới 600 px khung trợ lý toàn màn hình.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`, không DB) và **PostgreSQL** (profile `https-postgresql`). Ca ghi "2 nguồn" phải cho **JSON đáp án giống hệt** (plan Q3, không dùng mức chấp nhận của F00 §9.7). Ca E2E giả đáp án bằng `page.route('**/api/tro-ly/hoi')`, `'**/api/tro-ly/chu-de'` đúng hình dạng `CauTraLoiDto` (plan §3.2); dựng trong `e2e/du-lieu/tro-ly.ts`.

**Giả thời gian**: giờ Việt Nam là UTC+7, đổi sang UTC bằng cách **trừ 7 giờ**. Ngày 2026-10-12 là thứ Hai, 2026-10-10 thứ Bảy.

| Mốc | Giờ Việt Nam | UTC (đưa vào `clock`) |
|---|---|---|
| I1 | Thứ Hai 10:00 | 2026-10-12T03:00:00Z |
| I2 | Thứ Hai 12:00 | 2026-10-12T05:00:00Z |
| I3 | Thứ Bảy 09:00 | 2026-10-10T02:00:00Z |

**Dữ liệu thử** — tên giả (trừ mã 1.001193 "Thủ tục đăng ký khai sinh", 1.000894 "Thủ tục đăng ký kết hôn", 1.012784 thủ tục tách thửa của dữ liệu mẫu mà bộ thử ở plan §9 nêu đích danh; câu PII lấy đúng từ spec):

| Bộ | Nội dung |
|---|---|
| **N** | Nguồn Mẫu nhúng (`TepDuLieuMau.Nhung`): 408 thủ tục (có 1.001193, 1.000894, 1.012784, 1.004884, 1.000656), 75 lĩnh vực, **11 câu hỏi mẫu** (6 tách thửa, 5 Trung tâm), **6 chủ đề** (Đất đai, Hộ tịch, Bảo trợ xã hội, Chăn nuôi, Trẻ em, Xây dựng → "Hoạt động xây dựng"), 45 dòng từ đồng nghĩa, **12 viết tắt**, phân công và nhân sự **rỗng**, Zalo OA **trống**, bản đồ **trống**, giờ làm việc thứ Hai–thứ Sáu (5 dòng, 07:00–11:30 và 13:30–17:00) |
| **+PC** | N cộng phân công (Hộ tịch → quầy 3, Đất đai → quầy 4) và nhân sự: "Lê Văn Thử" (ông, chuyên viên, quầy 4), "Phạm Thị Nhung" (bà, chuyên viên, quầy 3), "Trần Quốc Cường" (ông, chuyên viên, quầy 5, không có phân công lĩnh vực) |
| **+Mau** | N cộng câu mẫu "điều kiện tách thửa đất" có câu trả lời nhiều dòng "Câu trả lời mẫu thử về điều kiện tách thửa." / "Dòng hai." |
| **+ĐN** | N cộng từ đồng nghĩa "giấy khai sinh" ~ "khai sinh" |
| **+Zalo** | N cộng Zalo OA `https://zalo.me/thu-nghiem` |
| **+A / +B** | N với địa chỉ Trung tâm "Địa chỉ thử A" / "Địa chỉ thử B" |
| **+VP** | N cộng cách hỏi "văn phòng nằm chỗ nào" cho mục địa chỉ |
| **−giờ / −CổngDVC / −5CĐ** | N bỏ giờ làm việc · N bỏ liên kết "Cổng Dịch vụ công Quốc gia" · N chỉ còn 5 chủ đề |
| **+15 / +0** | Chủ đề gắn lĩnh vực có 15 thủ tục (cả hai cấp) · gắn lĩnh vực không có thủ tục nào |
| **L1000** | `TroLyThu.TaoLon(1000)`: 1.000 thủ tục, tên ghép từ từ vựng thật, mã không trùng |
| **PII** | `0912345678`, `0912 345 678`, `0912.345.678`, `+84 912 345 678`, `079123456789` (CCCD 12 số), `123456789` (CMND 9 số), `nguyenvana@gmail.com`, `a@b.vn`, `12345678` (8 số — không che), `1.012784` (mã thủ tục — không che), `12 05 2026` (ngày — không che) |
| **XSS** | `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `"><svg onload=alert(1)>`, `javascript:alert(1)`, `{{7*7}}`, `${7*7}`, `=HYPERLINK("http://evil.example","x")` |

**Cột "Khi chạy"**: "Sau T0x" = task BE/FE xong; "T17" = tích hợp PostgreSQL; "T18" = E2E; "T19" = chạy tổng + thử tay; "Chờ F01" = cần công cụ nhập (nhập lại dữ liệu không sửa code); "Chờ F07/F09" = cần chức năng đó; "Chờ thiết bị" = máy thật. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: AI/LLM (spec mục Ngoài); hỏi bằng micro (đã bỏ — F07 BR-6, có ca cấm ở nhóm bảo mật); đọc câu trả lời (F07, chỉ kiểm điểm ghép); lịch lưu động theo buổi (F10 hoãn); nhận biết lời chào/cảm ơn (spec không có — plan Cần hỏi 2, ca ghi hành vi).

## 1. Bộ thử 42 câu — hợp đồng hai nguồn (plan §9)

Mã `F06-BT-nn` ứng với dòng số `nn` của bảng "Bộ thử ≥ 30 câu" ở plan §9 (kiểm `loai`, `muc`, mã thủ tục, `thuTucDangNoi`, nội dung kho). Chạy qua `TroLyServiceContract` ở `Tests/Api/Chatbot/` (nguồn Mẫu, T07) rồi lớp con PostgreSQL (T17); **JSON giống hệt giữa hai nguồn**. Cột "Bước" ghi câu hỏi (ctx = `maThuTuc` gửi kèm).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-BT-01 | AC-1, BR-1 b3 | N | "làm giấy khai sinh cần giấy tờ gì" | `thu-tuc` / `ho-so`, `thuTuc.ma` = 1.001193, `thuTucDangNoi` = 1.001193, `thuTucKhac` ≤ 3 | XU | — | Sau T07 |
| F06-BT-02 | AC-2 | N | "mấy ngày" (ctx 1.001193) | `thu-tuc` / `thoi-han` 1.001193; `thoiHan` null (nguồn ghi "1 Khác" → chưa ghi rõ) | XU | — | Sau T07 |
| F06-BT-03 | BR-1 b5 (Cần hỏi 1) | N | "mấy ngày" (không ctx) | `khong-hieu`; kho có đúng 1 dòng | XU | — | Sau T07 |
| F06-BT-04 | AC-3 | N+PC | "hộ tịch nộp quầy mấy" | `quay`, `linhVuc` "Hộ tịch", `quay` = 3 | XU | — | Sau T07 |
| F06-BT-05 | AC-24, BR-3 | N | "hộ tịch nộp quầy mấy" | `quay`, `quay` null, `canBo` rỗng | XU | — | Sau T07 |
| F06-BT-06 | AC-3, BR-3 | N+PC | "chứng thực nộp quầy mấy" | `quay`, `quay` null (lĩnh vực chưa có quầy) | XU | — | Sau T07 |
| F06-BT-07 | AC-4, AC-23 | N | "giá vàng hôm nay" | `khong-hieu`, `lienHe.zaloOa` null | XU | — | Sau T07 |
| F06-BT-08 | AC-5 | N | "khai sjnh" | `thu-tuc-danh-sach`, đầu danh sách 1.001193 | XU | — | Sau T07 |
| F06-BT-09 | AC-5 | N | "khai sinh" | `thu-tuc-danh-sach`, đầu 1.001193, `thuTucDangNoi` = 1.001193 | XU | — | Sau T07 |
| F06-BT-10 | AC-11 | N | "kết hôn" | `thu-tuc-danh-sach` đúng 5 mục, tên nào cũng có "kết hôn", `thuTucDangNoi` = 1.000894 | XU | — | Sau T07 |
| F06-BT-11 | AC-11 | N | "cần giấy tờ gì" (ctx từ BT-10) | `thu-tuc` / `ho-so` 1.000894 | XU | — | Sau T07 |
| F06-BT-12 | AC-10, BR-1 b2 | N+Mau | "dieu kien tach thua" | `cau-hoi-mau` đúng `traLoi` của câu thêm, **không** phải danh sách thủ tục | XU | — | Sau T07 |
| F06-BT-13 | AC-15 | N+ĐN | "xin giấy khai sinh" | `thu-tuc-danh-sach`, đầu 1.001193 | XU | — | Sau T07 |
| F06-BT-14 | AC-15 | N | "đk kết hôn cần gì" | `thu-tuc` / `ho-so` 1.000894 | XU | — | Sau T07 |
| F06-BT-15 | BR-2 | N | "cưới vợ" | `thu-tuc-danh-sach`, đầu 1.000894 | XU | — | Sau T07 |
| F06-BT-16 | AC-12 | N+PC | "ai phụ trách đất đai" | `quay` / `can-bo`, `quay` = 4, `canBo[0]` = "Lê Văn Thử" | XU | — | Sau T07 |
| F06-BT-17 | AC-24 | N | "ai phụ trách đất đai" | `quay` / `can-bo`, `quay` null, `canBo` rỗng | XU | — | Sau T07 |
| F06-BT-18 | AC-21, AC-24 | N | "đăng ký khai sinh nộp ở đâu" | `thu-tuc` / `noi-nop` 1.001193, `quay` null, `hinhThucNop` 3 phần tử | XU | — | Sau T07 |
| F06-BT-19 | AC-24 | N+PC | "đăng ký khai sinh nộp ở đâu" | Như BT-18 nhưng `quay` = 3 | XU | — | Sau T07 |
| F06-BT-20 | AC-21 | N | "nộp hồ sơ trực tuyến ở đâu" | `trung-tam` / `nop-truc-tuyen`, `lienKet.url` là Cổng DVC Quốc gia | XU | — | Sau T07 |
| F06-BT-21 | AC-21, BR-9 bullet cuối | N | "nộp hồ sơ trực tuyến ở đâu" (ctx 1.001193) | `thu-tuc` / `noi-nop` (không phải câu về Trung tâm) | XU | — | Sau T07 |
| F06-BT-22 | AC-18, AC-22 | N | "trung tâm ở đâu" | `trung-tam` / `dia-chi`, `diaChi` = địa chỉ Trung tâm, `banDo` null | XU | — | Sau T07 |
| F06-BT-23 | AC-18 | N+B (đổi địa chỉ) | "trung tâm ở đâu" | `diaChi` = "Địa chỉ thử B" | XU | — | Sau T07 |
| F06-BT-24 | AC-26 | N+VP | "van phong nam cho nao" | `trung-tam` / `dia-chi` | XU | — | Sau T07 |
| F06-BT-25 | AC-19 | N | "mấy giờ làm việc" | `trung-tam` / `gio-lam-viec`, `coDuLieu` đúng, 5 dòng | XU | — | Sau T07 |
| F06-BT-26 | AC-22 | N−giờ | "giờ làm việc" | `coDuLieu` false, `lienHe.dienThoai` có | XU | — | Sau T07 |
| F06-BT-27 | AC-20 | N | "số điện thoại trung tâm" | `trung-tam` / `dien-thoai`, đúng số trong dữ liệu | XU | — | Sau T07 |
| F06-BT-28 | AC-20 | N | "email trung tâm" | `trung-tam` / `email`, đúng email trong dữ liệu | XU | — | Sau T07 |
| F06-BT-29 | AC-8, BR-8 | N | "số 0912345678 của tôi nộp hồ sơ chưa" | `khong-hieu`; kho có `số 09******78 của tôi nộp hồ sơ chưa`, không có số đầy đủ | XU | — | Sau T07 · CHAY-THAT ở T17 |
| F06-BT-30 | AC-16, BR-8 | N | "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu" | `khong-hieu`; kho có `07********89` và `n***@gmail.com`, không có số/email đầy đủ | XU | — | Sau T07 · CHAY-THAT ở T17 |
| F06-BT-31 | AC-14, BR-7 | N | "giá vàng hôm nay" hỏi hai lần | Kho một dòng, số lần gặp = 2 | XU | — | Sau T07 · CHAY-THAT ở T17 |
| F06-BT-32 | AC-27 | N | "xem bói" | `khong-hieu` (một từ khớp, không đủ liên quan) | XU | — | Sau T07 |
| F06-BT-33 | AC-23 | N+Zalo | "giá vàng hôm nay" | `lienHe.zaloOa` có giá trị | XU | — | Sau T07 |
| F06-BT-34 | AC-25 | N | Chủ đề thứ tự 4 "Chăn nuôi" | `chu-de`, `tong` = số thủ tục lĩnh vực `chan-nuoi`, không thủ tục nào của `nuoi-con-nuoi` | XU | — | Sau T07 |
| F06-BT-35 | AC-25 | N | Chủ đề thứ tự 6 "Xây dựng" | `chu-de`, `chuDe.linhVuc` = "Hoạt động xây dựng" | XU | — | Sau T07 |
| F06-BT-36 | AC-25 | N+15 / N+0 | Chủ đề lĩnh vực 15 thủ tục / 0 thủ tục | `tong` 15 với `danhSachThuTuc` 10 phần tử / `tong` 0, danh sách rỗng | XU | — | Sau T07 |
| F06-BT-37 | BR-1 b3 | N | "1.001193 mấy ngày" | `thu-tuc` / `thoi-han` 1.001193 (nhận bằng mã) | XU | — | Sau T07 |
| F06-BT-38 | plan Q2 | N | "mấy ngày" (ctx 9.999999 không có trong dữ liệu) | Như BT-03; ngữ cảnh lạ bị bỏ, không phát lại | XU | — | Sau T07 |
| F06-BT-39 | BR-2 (từ đệm) | N | "cho tôi hỏi làm giấy khai sinh cần giấy tờ gì ạ" | Như BT-01 | XU | — | Sau T07 |
| F06-BT-40 | AC-10, plan rủi ro 4 | N+Mau | "tách thửa cần giấy tờ gì" | `thu-tuc` / `ho-so` 1.012784 (không bị câu mẫu tách thửa chiếm) | XU | — | Sau T07 |
| F06-BT-41 | AC-26 | N | "Trung tâm ở đâu?" có U+200E chen giữa chữ (sinh bằng `(char)0x200E`, không gõ \u) | Như BT-22 (ký tự vô hình bị bỏ) | XU | — | Sau T07 |
| F06-BT-42 | AC-13 | N | Câu 501 ký tự gửi thẳng bằng `POST` | 400 `du-lieu-khong-hop-le`; kho không thêm dòng | XU | — | Sau T07 |

## 2. Hỏi thủ tục, gõ sai, ngữ cảnh (BR-1 bước 3–4, BR-2; AC-1, AC-2, AC-5, AC-11, AC-15)

Ca E2E dùng nguồn Mẫu thật (không giả route) trừ khi ghi khác. Gõ vào ô nhập của khung rồi Enter.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-TH-01 | AC-1 | N, `/`, khung mở | Gõ "làm giấy khai sinh cần giấy tờ gì" | Tin của người dân; đáp án có dòng đầu "[1.001193] Thủ tục đăng ký khai sinh" và danh sách thành phần hồ sơ | PW | 1280, 375 | T18 |
| F06-TH-02 | AC-2 | Tiếp TH-01 | Gõ "mấy ngày" | Thời hạn của đúng 1.001193 (hoặc "chưa ghi rõ, xem trên Cổng DVC Quốc gia" vì dữ liệu mẫu ghi "1 Khác"); yêu cầu gửi lên có `maThuTuc` = "1.001193" (đọc body) | PW | 1280 | T18 |
| F06-TH-03 | AC-5 | N | Gõ "khai sjnh" | Danh sách thủ tục, đầu danh sách "Thủ tục đăng ký khai sinh"; dòng "Tìm thấy n thủ tục liên quan, sát nhất ở trên cùng" | PW | 1280 | T18 |
| F06-TH-04 | AC-11 | N | Gõ "kết hôn" | Đúng 5 thủ tục có chữ "kết hôn" (tối đa 5); dưới danh sách có dòng gợi ý và 4 chip "Cần giấy tờ gì?", "Mấy ngày?", "Phí bao nhiêu?", "Nộp ở đâu?" | PW | 1280, 375 | T18 |
| F06-TH-05 | AC-11 | Tiếp TH-04 | Bấm chip "Cần giấy tờ gì?" | Tin người dân "Cần giấy tờ gì?"; đáp án là hồ sơ của "Thủ tục đăng ký kết hôn" (1.000894); chip chỉ còn ở đáp án cuối | PW | 1280 | T18 |
| F06-TH-06 | AC-15, BR-2 | +ĐN | Gõ "xin giấy khai sinh" | Ra thủ tục đăng ký khai sinh | PW | 1280 | T18 |
| F06-TH-07 | AC-15, BR-2 | N | Gõ "đk kết hôn cần gì" | Thành phần hồ sơ của thủ tục đăng ký kết hôn | PW | 1280 | T18 |
| F06-TH-08 | BR-2 (dấu, hoa thường) | N | Gõ lần lượt: "LÀM GIẤY KHAI SINH CẦN GIẤY TỜ GÌ"; "lam giay khai sinh can giay to gi"; câu có dấu dạng NFD; "lam giấy khai sinh can giay tờ gì" (lẫn dấu) | Cả bốn cho cùng đáp án như TH-01 | PW | 1280 | T18 |
| F06-TH-09 | BR-2 (lỗi gõ) | N | Gõ "khai snih" (đảo), "khai sin" (thiếu), "khaii sinh" (thừa), "kêt hôn" (sai dấu), "dang ky ket hon" | Mỗi câu ra danh sách có thủ tục khai sinh / kết hôn đúng; ghi câu nào không đạt (giao chatbot-dev, T07) | XU + PW | 1280 | Sau T07 |
| F06-TH-10 | BR-2 (biên) | N | Gõ "khaisinh" (thiếu dấu cách) | Ghi hành vi: plan T07 cho phép **không hỗ trợ**; không 500; nếu không hiểu thì `khong-hieu` | XU | — | Sau T07 |
| F06-TH-11 | BR-2 (câu rất ngắn) | N | Gửi "kết", "a", "?", "ạ", ".", "123", "ơ" | Không lỗi, không 500; mỗi câu ra danh sách hợp lý hoặc `khong-hieu`; ghi kết quả từng câu | XU + PW | 1280 | Sau T07 |
| F06-TH-12 | BR-2 (từ đệm) | N | Gửi "cho tôi hỏi", "xin hỏi", "nhờ giúp", "làm ơn" đứng trước câu TH-01; thêm "ạ", "nhé", "với" ở cuối | Cùng đáp án như TH-01 (từ đệm và cụm đệm bị bỏ) | XU | — | Sau T07 |
| F06-TH-13 | BR-2 (viết tắt đời thường) | N | Gửi "đk khai sinh ko dc", "k cần giấy gì" | Ghi hành vi (teencode "ko", "dc", "k" không nằm trong spec); không lỗi | XU | — | Sau T07 |
| F06-TH-14 | BR-1 b4 | N | Gửi "khai sinh và kết hôn" | Ghi hành vi (danh sách có cả hai hoặc chỉ một); không lỗi; ≤ 5 thủ tục | XU | — | Sau T07 |
| F06-TH-15 | BR-1 b3 (mã) | N | Gửi "1.001193 mấy ngày", "(1.001193)", "1.001193?", "mã 1.001193 cần giấy gì", mã `MaDvc`, "9.999999 mấy ngày" | Hai câu đầu nhận bằng mã → thời hạn/hồ sơ của 1.001193; mã lạ → `khong-hieu`; mã không bị regex hoá hay SQL hoá | XU | — | Sau T07 |
| F06-TH-16 | BR-2 (viết tắt TTHC) | N | Gửi "TTHC khai sinh", "tthc kết hôn" | Ra thủ tục khai sinh / kết hôn (viết tắt mở rộng); không lỗi | XU | — | Sau T07 |
| F06-TH-17 | BR-1 b3 | N, ctx 1.001193 | Gửi lần lượt "bao lâu", "cần giấy tờ gì", "lệ phí bao nhiêu", "nộp ở đâu", "làm thế nào", "nhận được gì", "căn cứ pháp lý" | Mỗi câu ra đúng `muc`: `thoi-han`, `ho-so`, `phi`, `noi-nop`, `trinh-tu`, `ket-qua`, `can-cu` của 1.001193 | XU | — | Sau T07 |
| F06-TH-18 | BR-1 b3 (nhiều mục) | N, ctx 1.001193 | Gửi "nộp ở đâu và mất bao lâu" | Ghi hành vi (mục lấy theo thứ tự bảng: `thoi-han` trước `noi-nop`); không lỗi | XU | — | Sau T07 |
| F06-TH-19 | plan §4.6 | N | "mấy ngày" (ctx); "1.001193 mấy ngày"; "khai sinh cần gì" | `thuTucKhac` rỗng ở hai câu đầu (từ ngữ cảnh và từ mã), ≤ 3 ở câu thứ ba; giao diện có "Nếu không đúng thủ tục, chọn lại bên dưới:" khi có | XU + PW | 1280 | Sau T07 / T18 |
| F06-TH-20 | plan Q2, §4.7 | N | Hỏi "khai sinh" → "giờ làm việc" → "phí" | "phí" vẫn của 1.001193 (câu Trung tâm giữ nguyên ngữ cảnh); body yêu cầu thứ ba có `maThuTuc` = 1.001193 | PW | 1280 | T18 |
| F06-TH-21 | plan §4.7 | N | Hỏi "kết hôn" (ứng viên đầu đủ chắc) rồi một câu mơ hồ không đủ chắc "xem thủ tục" | Ngữ cảnh sau câu đầu là 1.000894; câu mơ hồ **không** đổi ngữ cảnh (giữ cũ) | XU | — | Sau T07 |
| F06-TH-22 | plan Q8 | N | Hỏi "khai sinh"; tải lại trang; mở trợ lý; gõ "mấy ngày" | Khung rỗng (chỉ lời chào); câu "mấy ngày" ra `khong-hieu` (ngữ cảnh đã mất, ghi vào kho) | PW | 1280 | T18 |
| F06-TH-23 | plan §3.1 (mã ngữ cảnh lạ) | N, `POST` trực tiếp | `maThuTuc`: "9.999999", `abc<b>`, 20 ký tự, `' OR 1=1--`, `%00`, chuỗi rỗng, null; và **21 ký tự** | Mã lạ dài ≤ 20 ký tự: 200, như không có ngữ cảnh; đáp án không phát lại mã lạ. **21 ký tự trở lên: 400** (`[StringLength(20)]`, kiểm đầu vào đúng CLAUDE.md; giao diện không bao giờ gửi mã > 10 ký tự) | XU / CURL | — | Sau T06 |
| F06-TH-24 | plan §4.3 | N | Gửi "đất đai" (một mình); "hộ tịch" | Ghi hành vi (danh sách thủ tục có chữ "đất đai" hoặc `khong-hieu`); không lỗi | XU | — | Sau T07 |
| F06-TH-25 | BR-1 b2 vs b3 | +Mau | Gửi "tách thửa đất" (ngắn hơn cách hỏi mẫu) và "tách thửa cần giấy tờ gì" | Câu đầu: không phải câu mẫu (điểm 0,57 < 0,7) → danh sách thủ tục tách thửa; câu sau: hồ sơ 1.012784 (BT-40) | XU | — | Sau T07 |

## 3. Câu hỏi mẫu (BR-1 bước 2; AC-10, AC-26)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-MA-01 | AC-10 | +Mau | Hỏi "dieu kien tach thua" | Hiện nguyên văn "Câu trả lời mẫu thử về điều kiện tách thửa." và "Dòng hai." (giữ xuống dòng); **không** có danh sách thủ tục thay thế | PW | 1280 | T18 |
| F06-MA-02 | AC-10 (CHAY-THAT) | PostgreSQL; nhập file câu hỏi mẫu có "điều kiện tách thửa đất" + câu trả lời; không sửa code | Hỏi lại | Nhận đúng câu trả lời mẫu mới | PW + XU | 1280 | T17 · Chờ F01 |
| F06-MA-03 | AC-10 (biên điểm) | +Mau | Gửi "tach thua dat" và "tach thua can giay to gi" | Không phải câu mẫu (điểm 0,57 và 0,42 < 0,7); ra thủ tục tách thửa | XU | — | Sau T07 |
| F06-MA-04 | AC-10 | +Mau | Gửi "điều kiện tách thửa", "điều kiện để tách thửa đất là gì", "dieu kien tach thua dat" | Ghi câu nào ra câu mẫu; không lẫn sang câu "hợp thửa" | XU | — | Sau T07 |
| F06-MA-05 | AC-10 | +Mau | Gửi "điều kiện hợp thửa" | Đúng câu trả lời của "hợp thửa" (điểm 0,73 so với 0,93 của "tách thửa"), không nhầm | XU | — | Sau T07 |
| F06-MA-06 | BR-6 | Câu mẫu có `MaThuTuc` (1 thủ tục tồn tại, 1 mã đã mất) | Hỏi | Danh sách thủ tục liên quan chỉ gồm mã còn tồn tại, mỗi thủ tục một cặp nút; mã mất bị bỏ; khi đúng một thủ tục liên quan thì `thuTucDangNoi` = mã đó | XU + PW | 1280 | Sau T07 |
| F06-MA-07 | plan Q5 | Câu mẫu có `<b>x</b> & "y"` | Hỏi | Hiện chữ thuần, không HTML, giữ xuống dòng | PW | 1280 | T18 |
| F06-MA-08 | plan §5.3 | Câu mẫu 5.000 ký tự | Hỏi ở 320 | Bong bóng ngắt dòng, không tràn, không cuộn ngang trang | PW | 320 | T18 |
| F06-MA-09 | AC-26 (CHAY-THAT) | +VP, nhập lại file câu hỏi mẫu (thêm cách hỏi "văn phòng nằm chỗ nào" cho mục địa chỉ), không sửa code | Hỏi "van phong nam cho nao" | Địa chỉ Trung tâm trong dữ liệu | PW + XU | 1280 | T17 · Chờ F01 |
| F06-MA-10 | BR-1 (thứ tự) | +Mau | Gửi câu vừa giống câu mẫu vừa có tên thủ tục (ví dụ "điều kiện tách thửa đất cần giấy tờ gì") | Ghi hành vi: bước 2 (mẫu) ưu tiên bước 3 (mục) theo BR-1; không lỗi | XU | — | Sau T07 |

## 4. Thông tin Trung tâm (BR-9; AC-18…AC-22, AC-26)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-TT-01 | AC-18 | +A | Hỏi "trung tâm ở đâu" | "Địa chỉ thử A" | PW | 1280 | T18 |
| F06-TT-02 | AC-18 (CHAY-THAT) | PostgreSQL; nhập lại Trung tâm với "Địa chỉ thử B", không sửa file câu hỏi mẫu, không khởi động lại | Hỏi lại cùng khung | "Địa chỉ thử B" (câu trả lời mẫu không chép địa chỉ; Trung tâm đọc mỗi lần hỏi) | PW + XU | 1280 | T17 · Chờ F01 |
| F06-TT-03 | AC-19 | N, đồng hồ I1 (thứ Hai 10:00) | Hỏi "mấy giờ làm việc" | Giờ sáng 07:00–11:30, giờ chiều 13:30–17:00, dòng "Thứ Hai – Thứ Sáu", kèm "Đang trong giờ làm việc" | PW | 1280, 375 | T18 |
| F06-TT-04 | AC-19 | Đồng hồ I2 (thứ Hai 12:00) | Hỏi lại | Kèm "Ngoài giờ làm việc" | PW | 1280 | T18 |
| F06-TT-05 | AC-19 (ảnh chụp) | Hỏi ở I1, rồi `clock.fastForward` tới I2 | Xem lại tin cũ | Tin cũ vẫn "Đang trong giờ làm việc" (trạng thái tính một lần lúc đáp án đến); hỏi tin mới → "Ngoài giờ" | PW | 1280 | T18 |
| F06-TT-06 | AC-19 | Đồng hồ I3 (thứ Bảy 09:00), dữ liệu chỉ thứ Hai–thứ Sáu | Hỏi | "Ngoài giờ làm việc"; thứ Bảy làm buổi sáng (biến thể) → "Đang trong giờ làm việc" | PW | 1280 | T18 |
| F06-TT-07 | AC-19 (múi giờ) | Cùng mốc UTC I1, `timezoneId` America/Los_Angeles và Pacific/Auckland | Hỏi | Vẫn "Đang trong giờ làm việc" (tính theo giờ Việt Nam, như F02 BR-2) | PW | 1280 | T18 |
| F06-TT-08 | BR-9 (ngày nghỉ) | Giờ làm việc có ghi chú "Trừ ngày nghỉ, lễ, Tết theo quy định"; đồng hồ 10:00 thứ Tư 02/9/2026 | Hỏi giờ | Có dòng ghi chú; vẫn "Đang trong giờ" | PW | 1280 | T18 |
| F06-TT-09 | AC-20 | N | Hỏi "số điện thoại trung tâm" | Đúng số trong dữ liệu; là liên kết `tel:` (bỏ dấu cách) | PW | 1280, 375 | T18 |
| F06-TT-10 | AC-20 (điện thoại thật) | Điện thoại có SIM | Bấm số trong đáp án | Trình gọi mở đúng số | TAY | — | Chờ thiết bị |
| F06-TT-11 | AC-20 | N | Hỏi "email trung tâm" | Đúng email trong dữ liệu; liên kết `mailto:` | PW | 1280 | T18 |
| F06-TT-12 | AC-21 | N, mở trợ lý mới | Hỏi "nộp hồ sơ trực tuyến ở đâu" | Liên kết "Cổng Dịch vụ công Quốc gia" đúng url trong dữ liệu; bấm → tab mới, `rel` có `noopener noreferrer` | PW (chặn mạng ra ngoài) | 1280 | T18 |
| F06-TT-13 | AC-21 | N | Hỏi "đăng ký khai sinh nộp ở đâu" | Nơi nộp của thủ tục (hình thức nộp), **không** phải câu chung về Trung tâm | PW | 1280 | T18 |
| F06-TT-14 | AC-21 (ngữ cảnh) | Đang nói khai sinh | Hỏi "nộp hồ sơ trực tuyến ở đâu" | Nơi nộp của thủ tục (BR-9 bullet cuối) | PW | 1280 | T18 |
| F06-TT-15 | AC-22 | N (bản đồ trống) | Hỏi "trung tâm ở đâu" | Chỉ có địa chỉ; không liên kết "Xem bản đồ", không chỗ trống | PW | 1280 | T18 |
| F06-TT-16 | AC-22 | Dữ liệu có link bản đồ | Hỏi | Có liên kết "Xem bản đồ" mở tab mới, `rel` đúng | PW | 1280 | T18 |
| F06-TT-17 | AC-22 | N−giờ | Hỏi "giờ làm việc" | "Chưa có thông tin…" + nút "Gọi Trung tâm"; không giờ nào được đoán | PW | 1280 | T18 |
| F06-TT-18 | BR-9 (chưa có dữ liệu) | N−CổngDVC | Hỏi "nộp hồ sơ trực tuyến ở đâu" | "Chưa có thông tin" + nút gọi; không đoán link | PW | 1280 | T18 |
| F06-TT-19 | AC-26 (CHAY-THAT) | +VP | Hỏi "van phong nam cho nao" | Địa chỉ Trung tâm (BT-24), không sửa code | XU / PW | 1280 | T17 · Chờ F01 |
| F06-TT-20 | BR-9 | N | Hỏi "địa chỉ", "ở đâu", "giờ mở cửa", "mấy giờ đóng cửa", "thứ bảy có làm không", "hotline", "gmail" | Ghi mục nhận được cho từng câu; không lỗi | XU | — | Sau T07 |
| F06-TT-21 | BR-9 b6 | N | Hỏi "đăng ký khai sinh ở đâu" | Nơi nộp của thủ tục, không địa chỉ Trung tâm | XU | — | Sau T07 |
| F06-TT-22 | F02 BR-8 | Giờ: thứ Hai–thứ Sáu sáng+chiều, thứ Bảy sáng | Hỏi giờ | Gộp: "Thứ Hai – Thứ Sáu" (sáng, chiều) và "Thứ Bảy" (sáng); không dòng Chủ nhật | PW | 1280 | T18 |
| F06-TT-23 | plan §4.5 | `trung_tam` trống hoàn toàn | Hỏi từng loại (địa chỉ, giờ, số, "giá vàng", "ai phụ trách") | Mọi câu 200; `trungTam`/`lienHe` null; giao diện ẩn dòng/nút tương ứng; không lỗi | XU + PW | 1280 | Sau T04 / T18 |
| F06-TT-24 | plan Q5 | Địa chỉ Trung tâm 500 ký tự hoặc chứa `<b>` | Hỏi địa chỉ | Chữ thuần, ngắt dòng, không vỡ | PW | 375 | T18 |

## 5. Quầy và cán bộ — không đoán (BR-3; AC-3, AC-12, AC-24)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-QU-01 | AC-3 | +PC | Hỏi "hộ tịch nộp quầy mấy" | "Hồ sơ lĩnh vực Hộ tịch nộp tại quầy 3" | PW | 1280 | T18 |
| F06-QU-02 | AC-3 | +PC | Hỏi "chứng thực nộp quầy mấy" | "Nộp hồ sơ tại Trung tâm …, địa chỉ …"; không số quầy nào | PW | 1280 | T18 |
| F06-QU-03 | AC-24 | N (phân công, nhân sự rỗng) | Hỏi "hộ tịch nộp quầy mấy" | Câu nộp hồ sơ tại Trung tâm; không số quầy | PW | 1280 | T18 |
| F06-QU-04 | AC-24 | N | Hỏi "ai phụ trách đất đai" | Câu nộp hồ sơ tại Trung tâm; không tên cán bộ | PW | 1280 | T18 |
| F06-QU-05 | AC-24 | N | Hỏi "đăng ký khai sinh nộp ở đâu" | Nơi nộp của thủ tục; không số quầy | PW | 1280 | T18 |
| F06-QU-06 | AC-24 (CHAY-THAT) | PostgreSQL; nhập file phân công có Hộ tịch quầy 3, không sửa code | Hỏi lại QU-03 | "quầy 3" | PW + XU | 1280 | T17 · Chờ F01 |
| F06-QU-07 | AC-12 | +PC | Hỏi "ai phụ trách đất đai" | Tên "Lê Văn Thử", chức vụ chuyên viên, quầy 4 | PW | 1280 | T18 |
| F06-QU-08 | AC-12 (CHAY-THAT) | Nhập file nhân sự (một cán bộ phụ trách Đất đai ở quầy 4) và phân công Đất đai → quầy 4 | Hỏi | Như QU-07 (AC-12 cần cả phân công lẫn nhân sự) | XU | — | T17 · Chờ F01 |
| F06-QU-09 | AC-12 | +PC | Hỏi "quầy 4 ai phụ trách" | Cán bộ ở quầy 4 theo số quầy trong câu | XU | — | Sau T04 |
| F06-QU-10 | BR-3 (Cần hỏi 3) | Phân công Hộ tịch → quầy 3, nhân sự rỗng | Hỏi "ai phụ trách hộ tịch" | Nêu quầy 3 (dữ liệu thật), **không** nêu tên; ghi vào mục mơ hồ (đọc chặt BR-3 có thể đòi "nộp tại Trung tâm") | XU | — | Sau T04 |
| F06-QU-11 | BR-3 | +PC | Hỏi "quầy 5 ai phụ trách" | Cán bộ quầy 5 ("Trần Quốc Cường") theo số quầy trong câu; không gán sai lĩnh vực | XU | — | Sau T04 |
| F06-QU-12 | plan §4.4 (TimTheoTen) | +PC | Hỏi "chị Nhung ở quầy nào", "gặp Cường", "Lê Văn Thử" (họ tên đủ); và "nhưng", "hàng", "Nhung" đứng một mình | Ba câu đầu ra đúng người; ba câu sau **không** khớp tên | XU | — | Sau T04 |
| F06-QU-13 | plan §4.6 | 12 cán bộ cùng quầy 4 | Hỏi "ai phụ trách đất đai" | `canBo` tối đa 10, `tong` = 12; giao diện hiện 10 và nói còn lại | XU + PW | 1280 | Sau T04 / T18 |
| F06-QU-14 | plan Cần hỏi 4 | N | Hỏi "nộp ở quầy nào" (không nêu lĩnh vực/thủ tục) | "Hồ sơ nộp tại Trung tâm…" + gợi ý nêu lĩnh vực hoặc thủ tục; không số quầy; ghi hành vi (có ghi kho không) | XU | — | Sau T04 |
| F06-QU-15 | BR-3 | +PC | Hỏi "đăng ký khai sinh nộp quầy mấy" và (đang nói khai sinh) "quầy mấy" | Quầy 3 (lĩnh vực Hộ tịch lấy từ thủ tục / ngữ cảnh) | XU | — | Sau T04 |
| F06-QU-16 | plan §4.6 | Dòng phân công có `noiTiepNhanChuyen` | Hỏi quầy | Hiện nơi tiếp nhận chuyển khi có; không dòng rỗng khi không có | XU + PW | 1280 | Sau T04 |
| F06-QU-17 | BR-3 (biên số) | +PC | Hỏi "quầy 99999999999 ai phụ trách", "quầy -1", "quầy 0" | Không lỗi (không tràn số nguyên); `canBo` rỗng; không tên bịa | XU | — | Sau T04 |
| F06-QU-18 | BR-3 | N | Lặp 42 câu của bộ thử rồi quét văn bản/JSON đáp án | Không đáp án nào có `quay` khác null hay `canBo` khác rỗng; trên màn hình không có chuỗi khớp "quầy <số>" (kiểm cả DOM ở PW) | XU + PW | 1280 | Sau T04 / T18 |
| F06-QU-19 | plan Q5 | Tên cán bộ chứa `<b>Thử</b>`, mô tả 500 ký tự | Hỏi | Chữ thuần; ngắt dòng | PW | 375 | T18 |
| F06-QU-20 | BR-3 | Cả hai nguồn | BT-04, 05, 06, 16, 17, 19 | JSON giống hệt | XU | — | T17 |

## 6. Không hiểu, nút gọi, nút Zalo (BR-1 bước 5, BR-10; AC-4, AC-23)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-LH-01 | AC-4 | N | Hỏi "giá vàng hôm nay" | Câu xin lỗi + nút "Gọi Trung tâm" (không nút Zalo vì Zalo OA trống) | PW | 1280, 375 | T18 |
| F06-LH-02 | AC-4 (CHAY-THAT) | PostgreSQL | Hỏi LH-01 rồi `xuat cau-chua-tra-loi` | File xuất có dòng "giá vàng hôm nay" (F01 AC-5) | XU | — | T17 · Chờ F01 |
| F06-LH-03 | AC-23 | N | Đọc nút gọi | Là liên kết `tel:` đúng số Trung tâm; không nút Zalo | PW | 1280 | T18 |
| F06-LH-04 | AC-23 | +Zalo | Hỏi lại | Có thêm nút "Mở Zalo"; bấm → tab mới, đúng link Zalo, `rel` có `noopener noreferrer` | PW | 1280 | T18 |
| F06-LH-05 | AC-23 (CHAY-THAT) | PostgreSQL; nhập lại dữ liệu có Zalo OA, không khởi động lại | Hỏi lại cùng khung | Có nút Zalo (Zalo OA đọc mỗi lần cần) | PW + XU | 1280 | T17 · Chờ F01 |
| F06-LH-06 | AC-23 (điện thoại thật) | Zalo OA thật, điện thoại cài Zalo | Bấm "Mở Zalo" | Mở trang/ứng dụng Zalo OA đúng | TAY | — | Chờ thiết bị |
| F06-LH-07 | BR-10 | Zalo OA = `javascript:alert(1)`, `data:text/html,x`, `ftp://x`, chuỗi không phải url | Hỏi "giá vàng" | Nút Zalo không hiện hoặc không bấm được (chỉ http/https); 0 hộp thoại | PW | 1280 | T18 |
| F06-LH-08 | plan §4.5 | `trung_tam` trống | Hỏi "giá vàng hôm nay" | Câu xin lỗi, không nút gọi (không có số), không lỗi | PW | 1280 | T18 |
| F06-LH-09 | plan §4.4 | N | Hỏi "hồ sơ của tôi đâu", "tra cứu tình trạng hồ sơ", "hồ sơ của tôi xong chưa", "nộp hồ sơ chưa" | Thẳng `khong-hieu` dù có chữ "hồ sơ" (trang không tra cứu hồ sơ) | XU | — | Sau T07 |
| F06-LH-10 | Cần hỏi 2 | N | Hỏi "xin chào", "cảm ơn", "ok" | Ghi hành vi: `khong-hieu` và ghi vào kho (spec không có lời chào) | XU | — | Sau T07 |
| F06-LH-11 | BR-1 b5 | N | Hỏi "how to register a birth", câu chữ Hán, 100 emoji | `khong-hieu`; không lỗi; kho lưu UTF-8 hợp lệ | XU | — | Sau T07 |
| F06-LH-12 | BR-1 b5 | N | Hỏi "giá vàng hôm nay" khi đã có ngữ cảnh khai sinh | `khong-hieu`; ngữ cảnh gửi lên được giữ (`thuTucDangNoi` = 1.001193) | XU | — | Sau T07 |
| F06-LH-13 | BR-10 (hai nguồn) | BT-07, BT-33 | So JSON hai nguồn | Giống hệt | XU | — | T17 |

## 7. Chủ đề gợi ý (BR-11; AC-25)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-CD-01 | AC-25 | N | Mở trợ lý | 6 chip theo thứ tự trong file: Đất đai, Hộ tịch, Bảo trợ xã hội, Chăn nuôi, Trẻ em, Xây dựng; nhóm có nhãn "Chủ đề gợi ý" | PW | 1280, 375 | T18 |
| F06-CD-02 | AC-25 (CHAY-THAT) | PostgreSQL; nhập lại file chỉ còn 5 chủ đề, không sửa code, không tải lại trang | Đóng rồi mở lại khung | Khung hiện 5 chip (yêu cầu có điều kiện; ETag đổi) | PW + XU | 1280 | T17 · Chờ F01 |
| F06-CD-03 | AC-25 | N | Bấm "Chăn nuôi" | Tin người dân "Chăn nuôi"; đáp án "Lĩnh vực … có n thủ tục" với n đúng; **không** thủ tục của lĩnh vực "Nuôi con nuôi" | PW | 1280 | T18 |
| F06-CD-04 | AC-25 | N | Bấm "Xây dựng" | Các thủ tục lĩnh vực "Hoạt động xây dựng" | PW | 1280 | T18 |
| F06-CD-05 | AC-25 | +15 | Bấm chủ đề | Ghi "15 thủ tục", hiện 10, "Hiển thị 10 trong 15 thủ tục", mỗi thủ tục một cặp nút | PW | 1280 | T18 |
| F06-CD-06 | AC-25 | +0 | Bấm chủ đề | "Chưa có thủ tục nào thuộc lĩnh vực này."; không quầy, không Trung tâm | PW | 1280 | T18 |
| F06-CD-07 | BR-11 | Lĩnh vực có thủ tục thuộc cả hai cấp | Bấm chủ đề | Mỗi mã thủ tục một lần; đúng thứ tự `ThuTu` | XU | — | Sau T05 |
| F06-CD-08 | BR-11, BR-3 | +PC rồi N | Bấm "Hộ tịch" | +PC: nơi nộp quầy 3; N: nơi nộp tại Trung tâm, không số quầy | PW | 1280 | T18 |
| F06-CD-09 | BR-11 | N | Sau đáp án chủ đề | Có gợi ý "Gõ tên thủ tục để hỏi thêm." ở đáp án cuối; **không có 4 chip hỏi tiếp** (chủ ý: máy chủ không gán thủ tục đang nói tới sau đáp án chủ đề) | PW | 1280 | T18 |
| F06-CD-10 | BR-11 | Bảng chủ đề rỗng | Mở trợ lý | Không có khu vực chủ đề (không nhãn, không hàng trống); khung dùng bình thường | PW | 1280 | T18 |
| F06-CD-11 | plan §3.3 | `GET /api/tro-ly/chu-de` trả 500 và 429 | Mở trợ lý | Khu vực chủ đề ẩn, không thông báo lỗi; hỏi bằng gõ vẫn được | PW | 1280 | T18 |
| F06-CD-12 | plan §3.4 | Chip cũ còn trên màn hình, dữ liệu đã đổi (chủ đề không còn) | Bấm chip | `POST /chu-de` → 404; tin lỗi "Không tìm thấy nội dung bạn cần."; trang không lỗi; lần mở khung sau chip được làm mới | PW | 1280 | T18 |
| F06-CD-13 | plan §4.7 | N | Bấm chủ đề có đúng 1 thủ tục; bấm chủ đề nhiều thủ tục | Một thủ tục → `thuTucDangNoi` = mã đó; nhiều → giữ ngữ cảnh gửi lên | XU | — | Sau T05 |
| F06-CD-14 | plan §3.1 | `POST /chu-de` với `thuTu` 0, -1, 1001, "a", null, 99 (không có) | Gửi | 0, -1, 1001, "a", null → 400; 99 → 404 `khong-tim-thay` | XU | — | Sau T06 |
| F06-CD-15 | plan §5.2 | Tên hiển thị 80 ký tự và chứa `<b>` | Mở khung ở 320 | Chip ngắt dòng/cắt; chữ thuần | PW | 320 | T18 |
| F06-CD-16 | plan §3 | `GET /api/tro-ly/chu-de` | CURL | 6 phần tử đúng `thuTu`, `tenHienThi`; `ETag`; 304; lạ query bị bỏ | CURL / XU | — | Sau T06 |
| F06-CD-17 | BR-11 (hai nguồn) | BT-34…BT-36 | So JSON | Giống hệt | XU | — | T17 |

## 8. Che thông tin cá nhân (BR-8; AC-8, AC-16)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-CN-01 | AC-8 (CHAY-THAT) | PostgreSQL, profile `https-postgresql` | Hỏi "số 0912345678 của tôi nộp hồ sơ chưa"; `xuat cau-chua-tra-loi` | File ghi "…09******78…"; không có "0912345678" | XU + SH | — | T17 |
| F06-CN-02 | AC-16 (CHAY-THAT) | Như trên | Hỏi "CCCD 079123456789, email nguyenvana@gmail.com, hồ sơ của tôi đâu"; xuất | Ghi "07********89" và "n***@gmail.com"; không có số và email đầy đủ | XU + SH | — | T17 |
| F06-CN-03 | BR-8 (định dạng số) | PII | Che `0912 345 678`, `0912.345.678`, `0912-345-678`, `+84 912 345 678`, `(0912) 345 678` | Mỗi số bị che (2 đầu 2 cuối); ghi dạng nào không che | XU (rà bảng T01) | — | Sau T01 |
| F06-CN-04 | BR-8 (độ dài) | PII | Che `123456789` (9 số), `0912345678` (10), `079123456789` (12), 15 số, 20 số liền; không che `12345678` (8 số) | 9 số → `12*****89`; 12 số → `07********89`; 8 số giữ nguyên | XU | — | Sau T01 |
| F06-CN-05 | BR-8 (không che) | Mã/ngày/giờ | Câu có `1.012784`, `1.001193.02`, `12 05 2026`, `12/05/2026`, `07:00-11:30` | Không bị che (giữ để tìm thủ tục); tiền `1.000.000.000` bị che (chấp nhận, ghi) | XU | — | Sau T01 |
| F06-CN-06 | BR-8 (email) | PII | `a@b.vn`; `Nguyen.Van+tag@Gmail.com`; email cuối câu có dấu chấm; hai email trong một câu | `a***@b.vn`; ký tự đầu + `***` + từ `@`; dấu chấm cuối câu không bị nuốt vào email; cả hai email bị che | XU | — | Sau T01 |
| F06-CN-07 | BR-8 (thứ tự) | PII | `0912345678@gmail.com` | Che theo email trước (`0***@gmail.com`), không còn số | XU | — | Sau T01 |
| F06-CN-08 | BR-8 (nhiều loại) | PII | Câu có CCCD, điện thoại và email | Mọi loại đều bị che | XU | — | Sau T01 |
| F06-CN-09 | plan Q9 | PII | Hỏi "số 0912345678 khai sinh" | Vẫn ra thủ tục khai sinh (bản `Bo` thay số bằng dấu cách, không gây nhiễu); **không** ghi kho (câu không phải `khong-hieu`) | XU | — | Sau T05 |
| F06-CN-10 | BR-8, BR-12 | 500 ký tự toàn email ngắn, và chuỗi có emoji ở biên cắt | Che rồi cắt | Kết quả ≤ 500 ký tự; không cắt giữa cặp surrogate; ghi kho không lỗi | XU | — | Sau T01 |
| F06-CN-11 | plan §11 rủi ro 7 | Số điện thoại viết bằng chữ "không chín một hai …"; "0912x345y678"; chữ số full-width | Hỏi | **Không** bị che (giới hạn đã biết, ghi báo cáo T01); không lỗi | XU | — | Sau T01 |
| F06-CN-12 | F00 AC-22 | PII | Gửi các câu PII ở đường 200, 400 (501 ký tự chứa PII), 429, 500 (service ném), exception; đọc log API | Log **không** chứa "0912345678", "079123456789", "nguyenvana"; chỉ loại đáp án, thời gian, loại lỗi | XU + SH | — | Sau T06 / T19 |
| F06-CN-13 | BR-8 (DB) | PostgreSQL sau CN-02 | `SELECT` bảng `cau_chua_tra_loi` | Không có bản gốc; chỉ bản đã che | XU | — | T17 |
| F06-CN-14 | F09 BR-3 | N | Hỏi "số 0912345678 …" | Tin người dân trên màn hình hiện **nguyên văn** số đó (che chỉ cho dữ liệu lưu); đáp án không lặp lại số | PW | 1280 | T18 |
| F06-CN-15 | plan §4.8 | PII | Đọc đáp án JSON của CN-01, CN-02 | Không echo câu hỏi (`khong-hieu` chỉ có `lienHe`) | XU | — | Sau T06 |
| F06-CN-16 | BR-7, BR-8 | Hai số khác nhau cùng đầu/cuối: "số 0912345678 …", "số 0987654378 …" | Hỏi lần lượt (câu còn lại giống nhau) | Sau che đều là `09******78` → gộp 1 dòng, lần gặp 2 (hệ quả gộp theo bản đã che); ghi hành vi | XU | — | T17 |

## 9. Câu chưa trả lời — kho, gộp, giữ 90 ngày (BR-7, BR-12; AC-4, AC-14, AC-27)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-KH-01 | AC-14 (CHAY-THAT) | PostgreSQL | Hỏi "giá vàng hôm nay" hai lần; xuất | Một dòng cho câu này, số lần gặp 2 | XU + SH | — | T17 |
| F06-KH-02 | BR-7 | N | Hỏi "giá vàng hôm nay", "Giá vàng hôm nay?", "GIÁ VÀNG HÔM NAY", "gia vang hom nay", "  giá   vàng  hôm  nay " | Gộp thành 1 dòng, lần gặp 5; "giá vàng hôm qua" là dòng khác | XU | — | Sau T07 |
| F06-KH-03 | AC-27 (CHAY-THAT) | `TimeProvider` giả; "giá vàng hôm nay" gặp lần cuối 91 ngày trước, "xem bói" 89 ngày trước | Chạy tác vụ xoá (hoặc để chạy định kỳ); xuất | Chỉ còn "xem bói" | XU | — | T17 |
| F06-KH-04 | AC-27 | Tiếp KH-03: hỏi lại "xem bói" hôm nay | Tua 89 ngày; xuất. Tua 91 ngày; xuất | Sau 89 ngày vẫn còn (tính lại 90 ngày từ lần gặp mới); sau 91 ngày bị xoá | XU | — | T17 |
| F06-KH-05 | BR-12 (biên) | `TimeProvider` giả | Câu gặp cuối đúng 90 ngày trừ 1 phút / đúng 90 ngày / cộng 1 phút | Giữ / ghi hành vi / xoá | XU | — | T17 |
| F06-KH-06 | BR-12 (tự động) | Ứng dụng chạy | Không chạy lệnh nào, tua thời gian qua chu kỳ xoá | Dòng quá hạn biến mất khỏi file xuất; không cần người chạy lệnh | XU | — | T17 |
| F06-KH-07 | BR-12 (demo) | Profile demo (F00 BR-16) | Hỏi "giá vàng hôm nay"; khởi động lại ứng dụng | Kho rỗng sau khởi động lại; vẫn che và gộp trong lúc chạy; không có đường xuất | XU | — | T17 |
| F06-KH-08 | plan §9.6 | Kho Mẫu (trần 1.000 dòng) | Gửi 1.200 câu không hiểu khác nhau | Không quá 1.000 dòng; bộ nhớ ổn; mọi yêu cầu vẫn 200; ghi cách xử lý khi đầy | XU | — | T17 |
| F06-KH-09 | plan §4.5 | Kho giả ném lỗi | Hỏi "giá vàng hôm nay" | Vẫn 200 `khong-hieu`; log Warning chỉ nêu loại lỗi, không nội dung câu | XU | — | Sau T05 |
| F06-KH-10 | BR-1 b5 | N | Chạy 42 câu bộ thử; đọc kho | Chỉ câu `khong-hieu` được ghi (BT-03, 07, 29, 30, 31, 32, 33, 38); câu thủ tục, quầy, Trung tâm, mẫu, chủ đề **không** vào kho | XU | — | Sau T07 |
| F06-KH-11 | Cần hỏi 1 | N | Vừa mở khung gõ "mấy ngày" | Theo plan: xin lỗi và **ghi kho**; ghi mơ hồ (người dân hỏi tiếp hợp lệ nhưng làm bẩn kho) | XU | — | Sau T07 |
| F06-KH-12 | BR-7, BR-12 | Câu 500 ký tự `khong-hieu`; câu 501 qua POST | Gửi | 500: lưu đủ; 501: 400, không lưu | XU | — | Sau T06 |
| F06-KH-13 | BR-7 | PostgreSQL | Gửi 50 yêu cầu song song cùng một câu mới | Một dòng, số lần gặp 50 (không mất lần đếm, không dòng trùng) | XU | — | T17 |
| F06-KH-14 | F01 (xuất) | PostgreSQL | Hỏi `=HYPERLINK("http://evil.example","x")`, `+1+1`, `-2+3`, `@SUM(1)`; xuất Excel | Ô trong file xuất là **chuỗi chữ**, không phải công thức (phòng chèn công thức); nếu không thì giao F01/db-dev | XU + TAY (mở bằng Excel) | — | T17 · Chờ F01 |
| F06-KH-15 | BR-12 | PostgreSQL | Khởi động lại ứng dụng giữa chừng | Kho giữ nguyên (lưu DB); lần gặp không mất | XU | — | T17 |

## 10. Giới hạn gửi: 500 ký tự, 64 KB, số câu mỗi phút (BR-5; AC-7, AC-13, AC-28)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-GH-01 | AC-13 | N, khung mở | Gõ hoặc dán 600 ký tự vào ô nhập | Ô dừng ở 500; hiện "Tối đa 500 ký tự" trong vùng `role="status"` nối bằng `aria-describedby`; gõ thêm phím không đổi gì | PW | 1280, 375 | T18 |
| F06-GH-02 | AC-13 | N | Gửi câu đúng 500 ký tự (ví dụ "khai sinh " lặp) | Có trả lời (200); không báo lỗi | PW | 1280 | T18 |
| F06-GH-03 | AC-13 | N | Gửi thẳng 501 ký tự bằng `POST` (bỏ qua ô nhập) | 400 `du-lieu-khong-hop-le`; kho không thêm dòng; ProblemDetails không nhắc lại câu | XU / CURL | — | Sau T06 |
| F06-GH-04 | AC-13 (UTF-16) | N | 250 emoji (500 đơn vị UTF-16) và 251 emoji; câu 500 ký tự NFD | 250 emoji: ô nhận đủ, BE 200; 251: ô chặn / BE 400; ô nhập và BE đếm cùng cách (UTF-16); ghi hành vi | PW + XU | 1280 | T18 |
| F06-GH-05 | AC-13 | N | Gửi chuỗi rỗng; toàn khoảng trắng; toàn ký tự vô hình (U+200B…U+200F, U+FEFF — sinh bằng script) | Giao diện không gửi; qua `POST` → 400 | PW + XU | 1280 | Sau T06 / T18 |
| F06-GH-06 | plan §3.4 | N | `POST` với `cauHoi` null, thiếu, số, mảng, đối tượng; JSON hỏng; thân rỗng | Luôn 400 `du-lieu-khong-hop-le`, không 500 | XU / CURL | — | Sau T06 |
| F06-GH-07 | F00 BR-8 | N | `POST` với `Content-Length` 65.537; thân 70 KB gửi chunked không `Content-Length`; thân đúng 65.536 byte | 413 `yeu-cau-qua-lon` (hai ca đầu); ca cuối ghi hành vi; giao diện (nếu tới) hiện "Nội dung gửi đi quá dài." | XU / CURL | — | Sau T06 |
| F06-GH-08 | AC-7 | `RateLimiting:TroLy` = 5 | Hỏi 5 câu trong 1 phút, rồi câu thứ 6 | 5 câu đều có trả lời; câu 6: 429 `qua-nhieu-yeu-cau`, giao diện "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại."; khung, hội thoại, trang còn nguyên | PW + XU | 1280 | Sau T06 / T18 |
| F06-GH-09 | AC-7 | Tiếp GH-08 | Đợi hết phút (hoặc đồng hồ giới hạn tần suất); hỏi tiếp | Hỏi được; bấm "Thử lại" ở tin lỗi cũng ra đáp án | PW + XU | 1280 | T18 |
| F06-GH-10 | AC-28 | Mặc định 60 | Từ một địa chỉ mạng hỏi 60 câu trong 1 phút, rồi câu 61 | 60 câu đều trả lời; câu 61 → 429 + câu thông báo như AC-7; trang không lỗi | XU (HTTP) + PW (giả nhanh) | 1280 | Sau T06 / T18 |
| F06-GH-11 | AC-28 | Mặc định 60 | 30 yêu cầu `POST /hoi` + 30 `POST /chu-de` (chip), rồi một yêu cầu nữa | Yêu cầu thứ 61 bất kể loại → 429 (chung bộ đếm); `GET /chu-de` (lấy danh sách chip) không tính vào 60 của hai POST | XU | — | Sau T06 |
| F06-GH-12 | BR-5, F09 AC-5 | Mặc định 60 | Ba "người" cùng một IP (20 + 20 + 21 câu), "Bắt đầu lại" giữa các lượt | Câu thứ 61 trong cùng phút bị chặn: "Bắt đầu lại" không đặt lại giới hạn | PW | K | Chờ F09 |
| F06-GH-13 | BR-5 (cấu hình) | Đổi `RateLimiting__TroLy` bằng biến môi trường | Khởi động lại; đặt 0 và -1 | Giá trị mới có hiệu lực không sửa code; 0/-1 → không khởi động và báo tên mục sai, không in giá trị; `appsettings.json` không ghi đè 60 | XU + SH | — | Sau T06 |
| F06-GH-14 | F00 BR-6 | 429 | Đọc header và thân | `Retry-After` có; ProblemDetails `code=qua-nhieu-yeu-cau`; không stack trace | XU / CURL | — | Sau T06 |
| F06-GH-15 | BR-5 (cửa sổ) | Mặc định 60 | 60 câu ở giây 55 của phút 1 rồi 60 câu ở giây 5 của phút 2 | Ghi hành vi cửa sổ (cố định hay trượt); spec chỉ nói "mỗi phút" | XU | — | Sau T06 |
| F06-GH-16 | BR-5 (lách) | Không có proxy tin cậy khai | 100 yêu cầu từ một IP, mỗi yêu cầu `X-Forwarded-For` khác nhau | Vẫn bị chặn sau 60 (không lách được bằng header giả) | XU / CURL | — | Sau T06 |
| F06-GH-17 | BR-5 | Hai IP khác nhau (IPv4 khác nhau; `::1` và `127.0.0.1`) | Hỏi từ mỗi IP | Bộ đếm riêng từng địa chỉ | XU | — | Sau T06 |
| F06-GH-18 | BR-5 (đồng thời) | Mặc định 60 | 200 yêu cầu song song từ một IP | Đúng 60 thành công, 140 bị 429 (không vượt do tranh chấp) | XU | — | Sau T06 |
| F06-GH-19 | C01 AC-5 | N | Bấm Enter 3 lần nhanh; bấm "Gửi" 2 lần nhanh | Chỉ một yêu cầu đang bay (nút `dangXuLy`); không tin người dân trùng | PW | 1280 | T18 |
| F06-GH-20 | plan §3 | N | `GET`, `PUT`, `DELETE`, `PATCH` tới `/api/tro-ly/hoi` và `/chu-de`; `OPTIONS` có `Origin: https://evil.example`; `Content-Type` text/plain, form, multipart, thiếu | 405 `phuong-thuc-khong-hop-le` (riêng `GET` tới `/hoi` kèm `Allow: POST`); OPTIONS không `Access-Control-Allow-Origin`; kiểu nội dung khác JSON → 4xx, không xử lý | XU / CURL | — | Sau T06 |

## 11. Popup chi tiết và liên kết Cổng DVC trong câu trả lời (BR-6; AC-9, AC-17, AC-29)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-PU-01 | AC-9 | N, câu trả lời AC-1 | Bấm "Xem chi tiết" | Popup của đúng "Thủ tục đăng ký khai sinh" (tiêu đề, mã 1.001193) | PW | 1280, 375 | T18 |
| F06-PU-02 | AC-17 | N, trang chủ | Bấm "Xem chi tiết"; đọc địa chỉ | Địa chỉ có `ma=1.001193` | PW | 1280 | T18 |
| F06-PU-03 | AC-17 | Tiếp PU-02 | Đóng bằng ✕ | Popup đóng, địa chỉ bỏ `ma`, **khung chat và hội thoại còn nguyên** | PW | 1280 | T18 |
| F06-PU-04 | AC-17 | Tiếp PU-02 | Bấm "Quay lại" của trình duyệt | Popup đóng, địa chỉ bỏ `ma`, khung và hội thoại còn | PW | 1280 | T18 |
| F06-PU-05 | AC-17 | Như trên | Đóng bằng Esc; bằng bấm vùng tối | Như PU-03; con trỏ về nút "Xem chi tiết" đã mở | PW | 1280 | T18 |
| F06-PU-06 | BR-6 | Popup mở trên khung | Tab trong popup; kiểm `inert` | Khung và nút Trợ lý `inert`; Tab chỉ trong popup; popup trên khung (z 50 > 45); đóng popup gõ tiếp ô nhập được | PW | 1280 | T18 |
| F06-PU-07 | AC-29 | N, câu trả lời AC-11 ("kết hôn") | Đếm liên kết "Xem và nộp trên Cổng DVC" | Mỗi thủ tục trong 5 dòng đúng một liên kết | PW | 1280 | T18 |
| F06-PU-08 | AC-29 | Như trên | Bấm liên kết của "Thủ tục đăng ký kết hôn" | Tab mới mở `https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach?keyword=1.000894&showAdvanced=false&formalityType=STANDARD&limit=10&activeKey=STANDARD`; khung chat còn nguyên | PW (chặn mạng ra ngoài, kiểm URL) | 1280 | T18 |
| F06-PU-09 | BR-6 | Đáp án `thu-tuc` (có `thuTucKhac` 3), danh sách 5, chủ đề 10, câu mẫu có thủ tục | Đếm cặp nút | Mỗi thủ tục nhắc tới đúng **một** cặp "Xem chi tiết" + "Xem và nộp trên Cổng DVC" | PW | 1280 | T18 |
| F06-PU-10 | BR-6 | Như trên | Đọc `a[target=_blank]` | `rel` có `noopener noreferrer`; `href` chỉ `dichvucong.gov.vn`; mã trong `keyword=` đã mã hoá | PW | 1280 | T18 |
| F06-PU-11 | WCAG 2.5.3 | Danh sách | Đọc tên đọc nút | "Xem chi tiết <tên thủ tục>" chứa chữ nhìn thấy | PW | 375 | T18 |
| F06-PU-12 | AC-17 (kiosk) | `/?kiosk=1` | Mở popup từ khung; bấm "Quay lại" | Mở popup dùng thay mục lịch sử (F09 BR-8): "Quay lại" **không** đóng popup; ✕/Esc đóng; khung còn | PW | K | Chờ F09 |
| F06-PU-13 | BR-6 | Đang ở `/thu-tuc?cap=tinh&q=khai sinh`, `/linh-vuc` | Mở popup từ khung | Popup mở trên trang đó; đóng → trang đó giữ nguyên bộ lọc | PW | 1280 | T18 |
| F06-PU-14 | F03 BR-5 | Đáp án có mã đã mất sau khi nhập lại dữ liệu | Bấm "Xem chi tiết" | Popup "Không tìm thấy thủ tục này…" + nút Đóng (F03 AC-18); khung còn | PW | 1280 | T18 |
| F06-PU-15 | F03 BR-8 | Mở `/?ma=1.001193` | Quan sát khung | Khung đóng, hội thoại rỗng; chỉ có một popup (không popup thứ hai từ trợ lý) | PW | 1280 | T18 |
| F06-PU-16 | BR-6 | Đang chờ đáp án (trễ 3 giây) | Mở popup từ đáp án trước; đáp án mới về | Đáp án mới thêm vào hội thoại bình thường, popup không bị đóng, khung không mất | PW | 1280 | T18 |

## 12. Khung chat — hành vi và giao diện

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-UI-01 | plan §5.1 | Bản build | Mở `/`, `/thu-tuc`, `/linh-vuc`, trang 404 | Nút "Trợ lý" ở góc phải dưới mọi trang; cuộn tới cuối không che chữ chân trang (`--fab-clearance`); chưa bấm → 0 yêu cầu tới chunk khung, `chu-de` | PW | 375, 768, 1280, K | T18 |
| F06-UI-02 | plan §5.2 | Như trên | Bấm nút | Khung rộng 370 px (rem) cao tối đa 530 px ở ≥ 600; dưới 600 toàn màn hình, **ở 375 px khung rộng đúng 375 px** (lấp cả dải cuộn cố định của trang trên trình duyệt có thanh cuộn cổ điển; điểm sát mép phải khung nhìn thuộc khung, không hở); con trỏ vào ô nhập; nút `aria-expanded=true`, `aria-controls`; lời chào là tin đầu; hàng chip chủ đề; lời miễn trừ (`common:mien-tru`) dưới ô nhập | PW | 375, 768, 1280 | T18 |
| F06-UI-03 | plan §5.2 | Khung mở | Đóng bằng ✕; bằng bấm lại nút; bằng Esc (con trỏ trong khung, không popup) | Khung ẩn, **con trỏ về nút "Trợ lý"**; mở lại: hội thoại còn, con trỏ ô nhập | PW | 1280, 375 | T18 |
| F06-UI-04 | plan §5.2 | Khung mở | Gửi bằng Enter; bằng nút "Gửi" | Tin người dân; tin chờ "Đang tìm câu trả lời…" (`aria-busy`, không hoạt ảnh); rồi đáp án; con trỏ ở ô nhập; câu cắt khoảng trắng hai đầu | PW | 1280 | T18 |
| F06-UI-05 | C01 AC-5 | Như trên | Bấm Gửi hai lần nhanh | Một yêu cầu (đếm bằng `page.route`) | PW | 1280 | T18 |
| F06-UI-06 | plan §5.2 | Mạng tắt / 500 / 400 / 413 / 429 (route) | Gửi | Tin lỗi dùng câu của `common:loi.*` đúng nguyên văn (F00 BR-6); 500 có mã tra cứu; mất kết nối không mã; nút "Thử lại" gửi lại **đúng câu** đó; khung và hội thoại còn | PW | 1280, 375 | T18 |
| F06-UI-07 | plan §5.2 | Lỗi rồi thành công | Bấm "Thử lại" | Đáp án xuất hiện, không nhân đôi tin người dân, tin lỗi được thay | PW | 1280 | T18 |
| F06-UI-08 | plan §5.2 | Đáp án dài (thủ tục nhiều giấy tờ, trình tự) | Nhận đáp án | Cuộn sao cho **đầu** câu trả lời hiện ra, không nhảy xuống cuối | PW | 375, 1280 | T18 |
| F06-UI-09 | plan §5.2 | Giả route | Gửi 35 câu (70 tin) | Trong state tối đa 60 tin (bỏ cũ nhất); không lỗi; ghi lời chào còn hay mất | PW + VT | 1280 | T18 |
| F06-UI-10 | plan §5.2 | Đáp án list/chủ đề | Xem chip hỏi tiếp | 4 chip chỉ ở đáp án cuối; tin trước đó không còn chip; bấm "Mấy ngày?" gửi như câu hỏi với ngữ cảnh đúng | PW | 1280 | T18 |
| F06-UI-11 | plan §5.2 | Mọi trang | Chip chủ đề | Chip lẻ, không `aria-pressed`; thứ tự theo API; nhãn nhóm "Chủ đề gợi ý" | PW | 1280 | T18 |
| F06-UI-12 | plan §5.1 | Kiosk 1080×1920 | Mở khung | Khung theo rem (to hơn), nằm trên nút nổi, không che nút "Bắt đầu lại" ở góc trái | PW | K | Chờ F09 |
| F06-UI-13 | plan §5.2 | iPhone Safari, Android Chrome | Mở khung, gõ | Bàn phím ảo không che ô nhập; khung dùng `dvh`; có thể cuộn hội thoại | TAY | — | Chờ thiết bị |
| F06-UI-14 | plan §6 (F07/F09) | Khung mở | Quan sát đầu khung và dòng nhắc | `ChoNutDoc` rỗng không chiếm chỗ lệch, không lỗi; `NhacDangXuat` rỗng; chỗ cho nút đọc giữa tên khung và ✕ | PW | 1280 | T18 |
| F06-UI-15 | plan §6 | VT `useDiemGhepDoc` | Đáp án API, lời chào, tin chờ, tin lỗi | `cauTraLoiMoi.id` đổi **chỉ** với đáp án từ API; `khungDangMo` đổi khi mở/đóng | VT (rà) | — | Sau T11 |
| F06-UI-16 | plan §6 | VT | `batDauLaiTroLy()` | Đóng khung, xoá hội thoại, ngữ cảnh, ô nhập; mở lại chỉ còn lời chào; "mấy ngày" → `khong-hieu` | VT (rà) | — | Sau T09 / T11 |
| F06-UI-17 | plan §5.2 | Hội thoại có tin | Chuyển SPA từ `/` sang `/thu-tuc`; tải lại trang | Chuyển trang: khung và hội thoại còn; tải lại: khung đóng, hội thoại mất, không dùng `localStorage` | PW | 1280 | T18 |
| F06-UI-18 | plan Q8 | Hai tab cùng trang | Hỏi ở tab A | Tab B không thấy gì (hội thoại độc lập) | PW | 1280 | T18 |
| F06-UI-19 | C01 AC-23 | `prefers-reduced-motion: reduce` | Mở khung | Hiệu ứng mở (chỉ độ mờ ≤ 150 ms) tắt | PW | 1280 | T18 |
| F06-UI-20 | plan rủi ro 9 | Chặn chunk khung | Bấm nút; bỏ chặn; bấm lại | Nút còn; lần bấm sau mở được; không trang trắng (ghi: chưa có thông báo riêng) | PW | 1280 | T18 |
| F06-UI-21 | plan §5.2 | Ô nhập | Đọc thuộc tính | `maxLength=500`, `autocomplete=off`, `enterkeyhint=send`; label ẩn "Câu hỏi" | PW | 1280 | T18 |
| F06-UI-22 | CLAUDE.md > i18n | Mã nguồn | `npm run lint` | Không chuỗi chữ viết cứng trong JSX; khoá có kiểu (sai khoá là lỗi build) | SH | — | Sau T09, T11, T12 |
| F06-UI-23 | plan §5.2 (hiệu năng gõ) | Trang có ô tìm (URL đổi mỗi 300 ms) | Gõ ở ô tìm trong khi khung có 60 tin | Danh sách tin không vẽ lại (`React.memo`); không giật | VT (rà) | — | Sau T11 |
| F06-UI-24 | plan Q10 | Khung đóng | Kiểm DOM | Khung ẩn bằng `hidden` (không huỷ); không nhận Tab khi ẩn | PW | 1280 | T18 |

## 13. Hiển thị từng loại đáp án (plan §5.3)

Dùng JSON giả dựng theo plan §3.2 (route giả), thêm biến thể; kiểm cả bằng Vitest (T12).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-VW-01 | BR-1 b3 | `thu-tuc` / `ho-so`, 12 giấy tờ, một giấy tờ có bản chính 1 bản sao 2 | Xem | Dòng đầu "[mã] tên" (cắt 90 ký tự); đúng 8 giấy tờ; "bản chính/bản sao"; "và 4 giấy tờ nữa — xem chi tiết" | VT + PW | 1280 | Sau T12 |
| F06-VW-02 | AC-2 | `thoi-han` có / null | Xem | Có → hiện; null → "chưa ghi rõ, xem trên Cổng DVC Quốc gia" | VT + PW | 1280 | Sau T12 |
| F06-VW-03 | BR-1 b3 | `phi` có / null | Xem | Có → hiện; null → "chưa có thông tin" (theo i18n) | VT | — | Sau T12 |
| F06-VW-04 | BR-3 | `noi-nop` với `quay` có / null, có `noiTiepNhanChuyen` | Xem | Có quầy: hình thức nộp + "quầy N" (+ nơi tiếp nhận chuyển); null: "nộp hồ sơ tại <Trung tâm>, địa chỉ …", không chữ "quầy" | VT + PW | 1280 | Sau T12 |
| F06-VW-05 | plan §4.6 | `trinh-tu` 5 bước, mỗi bước 800 ký tự | Xem | 2 bước, mỗi bước ≤ 500 ký tự kết thúc "…"; ghi tổng số bước | VT | — | Sau T12 |
| F06-VW-06 | plan §4.6 | `ket-qua` 9 phần tử; `can-cu` 9 phần tử trích yếu 400 ký tự | Xem | ≤ 6 kết quả; ≤ 6 căn cứ, trích yếu ≤ 200 ký tự, chữ thuần | VT | — | Sau T12 |
| F06-VW-07 | plan §5.3 | `thuTucKhac` 3 phần tử | Xem | Dòng "Nếu không đúng thủ tục, chọn lại bên dưới:" + 3 thủ tục, mỗi thủ tục một cặp nút | VT + PW | 1280 | Sau T12 |
| F06-VW-08 | BR-1 b4 | `thu-tuc-danh-sach` 1 và 5 phần tử | Xem | "Tìm thấy n thủ tục liên quan, sát nhất ở trên cùng:"; mỗi dòng có mã · cấp · lĩnh vực · mức độ (huy hiệu có chữ) | VT + PW | 1280 | Sau T12 |
| F06-VW-09 | BR-11 | `chu-de` tong 15 / 3 / 0 | Xem | 15: hiện 10 + "Hiển thị 10 trong 15"; 3: hiện 3; 0: "Chưa có thủ tục nào thuộc lĩnh vực này." | VT | — | Sau T12 |
| F06-VW-10 | AC-10 | `cau-hoi-mau` nhiều dòng | Xem | `white-space: pre-line`; không HTML | VT | — | Sau T12 |
| F06-VW-11 | BR-9 | `trung-tam` đủ 5 mục; `coDuLieu` false cho từng mục | Xem | Mỗi mục đúng; `coDuLieu` false: "Chưa có thông tin về …" + nút gọi (+ Zalo nếu có); không giờ/địa chỉ đoán | VT + PW | 1280 | Sau T12 |
| F06-VW-12 | BR-3 | `quay` / `can-bo` với `canBo` rỗng và có | Xem | Có: tên, chức vụ, mô tả; rỗng: không tên nào | VT | — | Sau T12 |
| F06-VW-13 | BR-10 | `khong-hieu` với `zaloOa` null / có | Xem | Có "Gọi Trung tâm" luôn; "Mở Zalo" chỉ khi có | VT | — | Sau T12 |
| F06-VW-14 | plan Q5 | Tên thủ tục có `<b>x</b>`, `&amp;`, 300 ký tự không dấu cách | Xem ở 320 | Chữ thuần; ngắt dòng; không tràn bong bóng | PW | 320 | T18 |
| F06-VW-15 | plan §3.2 | Mọi trường `null` có mặt | Xem mọi loại | Không chữ "null", "undefined", "NaN"; không dòng rỗng | VT | — | Sau T12 |
| F06-VW-16 | plan §3.2 | `loai` lạ (máy chủ mới hơn trình duyệt) | Xem | Ghi hành vi: không vỡ khung; không lỗi chưa xử lý | VT | — | Sau T12 |
| F06-VW-17 | plan Q5 | `tong` ≥ 1.000 | Xem | Số có chấm nghìn (`dinhDangSo`) | VT | — | Sau T12 |
| F06-VW-18 | C01 BR-3 | Số điện thoại, email, link bản đồ | Xem | Bấm được theo phân loại (`tel:`, `mailto:`, web mở tab mới) | PW | 1280 | T18 |

## 14. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-TN-01 | C01 AC-4 | Khung mở, đủ các loại đáp án (route giả) | axe | 0 vi phạm | AX | 375, 768, 1280, K | T18 |
| F06-TN-02 | C01 AC-1 | Bản build | Chỉ bàn phím: Tab tới nút Trợ lý, Enter mở, gõ, Enter gửi, Tab qua chip/nút/liên kết, Esc đóng | Đi hết khung; thứ tự logic; viền focus nhìn thấy; không bẫy | PW | 1280, 375 | T18 |
| F06-TN-03 | plan §5.2 | Khung mở, không popup | Tab và Shift+Tab từ phần tử đầu/cuối | Đi vòng qua các phần tử bấm được trong khung rồi tới `[data-ngoai-popup]` (nút "Bắt đầu lại" ở kiosk, đứng **cuối** vòng); không thoát ra nền | PW | 1280, K | T18 · kiosk Chờ F09 |
| F06-TN-04 | C01 BR-9 | Popup mở trên khung | Tab trong popup, Esc | Khung `inert`; Tab chỉ trong popup; Esc chỉ đóng popup; con trỏ về nút đã mở | PW | 1280 | T18 |
| F06-TN-05 | plan §5.2 | NVDA/TalkBack | Gửi 3 câu liên tiếp | Danh sách tin `role="log"` `aria-live="polite"` `aria-relevant="additions"`: đọc **tin mới một lần**, không đọc lại cả danh sách; tin chờ `aria-busy` | TAY | 1280, 375 | T19 |
| F06-TN-06 | plan §5.2 | Cây trợ năng | Đọc tên | Khung `role="dialog"` (không modal) `aria-label` "Trợ lý thủ tục"; danh sách `aria-label` "Hội thoại với trợ lý"; ô nhập label "Câu hỏi"; chip nhóm "Chủ đề gợi ý"; ✕ "Đóng trợ lý"; nút Trợ lý `aria-expanded` | PW | 1280 | T18 |
| F06-TN-07 | AC-13 | Ô nhập đạt 500 | Đọc | "Tối đa 500 ký tự" `role="status"` nối bằng `aria-describedby`, đọc một lần | PW + TAY | 1280 | T18 |
| F06-TN-08 | WCAG 1.4.3 | Khung | Đo tương phản | Tin người dân, tin trợ lý, đầu khung, chip, liên kết ≥ 4.5:1; focus ≥ 3:1 | AX + PW | 1280 | T18 |
| F06-TN-09 | WCAG 1.4.10 | 320×568 và phóng 200% ở 1280 | Mở khung | Không cuộn ngang; bong bóng ngắt dòng; ô nhập và nút Gửi vẫn thấy | PW | 320, 1280 | T18 |
| F06-TN-10 | WCAG 1.4.12 | CSS giãn chữ | Xem khung | Không cắt, không chồng | PW | 375, K | T18 |
| F06-TN-11 | WCAG 2.5.8 | 375 | Kích thước chạm: Gửi, ✕, chip, nút xem chi tiết, liên kết Cổng DVC | Vùng bấm ≥ 24×24 px (spec C01 AC-2); ≥ 48 px ở kiosk | PW | 375, K | T18 |
| F06-TN-12 | WCAG 1.4.1 | Đen trắng | Xem hội thoại | Phân biệt tin người dân và trợ lý không chỉ bằng màu (căn lề, viền) | PW + TAY | 1280 | T18 |
| F06-TN-13 | plan §5.2 | Sau gửi và sau nhận đáp án | Quan sát focus | Con trỏ ở ô nhập, không bị đáp án cướp | PW | 1280 | T18 |
| F06-TN-14 | WCAG 2.4.3 | iPhone VoiceOver, Android TalkBack | Mở khung, đọc đáp án, bấm liên kết | Mở đúng; đọc được tên nút; nhận thông báo đáp án mới | TAY | — | Chờ thiết bị |

## 15. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-BM-01 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` `GET /api/tro-ly/chu-de`; `curl -si -X POST` `/api/tro-ly/hoi` ở các mã 200, 400, 413, 429, 405 | Mọi response: CSP đúng nguyên văn CLAUDE.md, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By`; GET chip có `ETag`; POST không `ETag`, không cache | CURL | — | Sau T06 |
| F06-BM-02 | plan Q1 | Bản build | Hỏi "khai sinh"; bắt mọi request | `POST /api/tro-ly/hoi`, URL **không** query; câu hỏi chỉ nằm trong body JSON; `GET /api/tro-ly/hoi?cauHoi=khai sinh` → 405; địa chỉ trang không đổi; Referer của yêu cầu sau không chứa câu; lịch sử trình duyệt không có câu | PW + CURL | 1280 | T18 |
| F06-BM-03 | F00 AC-22 | PII | Quét log API sau CN-12 | Không dữ liệu cá nhân | XU + SH | — | Sau T06 |
| F06-BM-04 | AC-13 | N | 501 ký tự → 400; 500 → 200 | Đúng; ProblemDetails không có câu hỏi | XU | — | Sau T06 |
| F06-BM-05 | F00 BR-8 | N | Thân 64 KB + 1 → 413 | Đúng mã `yeu-cau-qua-lon`, không đọc hết thân | XU / CURL | — | Sau T06 |
| F06-BM-06 | AC-28 | N | 61 câu/phút → 429 | Đúng; trang không lỗi | XU + PW | — | Sau T06 |
| F06-BM-07 | plan §8 (XSS) | XSS | Gửi từng chuỗi XSS làm câu hỏi; bắt `dialog` | Tin người dân hiện **nguyên văn chữ**; 0 hộp thoại; DOM không sinh `<script>`, `<img>`, `<svg>`; đáp án `khong-hieu`; kho lưu bản đã che dạng chữ | PW | 1280 | T18 |
| F06-BM-08 | plan §8 (dữ liệu độc) | Tên thủ tục, câu mẫu, địa chỉ, tên cán bộ, mô tả, Zalo chứa `<img onerror>`, `javascript:` | Hỏi để hiện từng loại | Chữ thuần; không thẻ sinh ra; `javascript:` không chạy | PW | 1280 | T18 |
| F06-BM-09 | plan §8 (template) | XSS | Câu hỏi `{{7*7}}`, `${7*7}`, `%s %n`, `{0}` | Hiện nguyên văn; không ra "49"; không lỗi nội suy | PW | 1280 | T18 |
| F06-BM-10 | plan §5.5 (i18n) | Tên thủ tục/cán bộ chứa `{{so}}`, `$t(chatbot:khung.ten)` | Hiện đáp án | Hiện nguyên văn, không bị nội suy lại | VT + PW | 1280 | Sau T12 |
| F06-BM-11 | plan §4.8 (ReDoS) | Câu 500 ký tự: "a" lặp; "0" lặp; 499 số + "x"; "0912 " lặp 100 lần; "a@" lặp 250 lần; "a" × 480 + "@" + "b" × 19; "1 " lặp 250; ". " lặp 250; "-" lặp 500; "( " lặp 250 | Gửi từng câu, đo thời gian | Mỗi câu xử lý < 300 ms (p99), không 500, CPU không treo; nếu regex quá hạn thì **không lưu bản chưa che** | XU | — | Sau T06 / T17 |
| F06-BM-12 | plan §4.3 | Từ điển L1000 | Gửi 100 từ lạ dài 20 ký tự; 500 ký tự không dấu cách; 250 từ 1 ký tự | < 300 ms; không 500 (khoảng cách sửa có chặn trên) | XU | — | Sau T07 |
| F06-BM-13 | plan §3.1 | Unicode lạ | Gửi NUL (U+0000), RTL override U+202E, surrogate lẻ, 500 ký tự dấu ghép, emoji ZWJ (sinh bằng script, không gõ \u) | 200 hoặc 400 đúng; không 500; kho lưu UTF-8 hợp lệ; PostgreSQL không lỗi vì NUL | XU + CURL | — | Sau T06 / T17 |
| F06-BM-14 | plan §3.4 | JSON lồng 10.000 tầng; trường trùng/thừa; số cực lớn | `POST` | 400, không 500, không treo, không hết bộ nhớ | XU / CURL | — | Sau T06 |
| F06-BM-15 | CLAUDE.md > API | `Origin: https://evil.example` | `OPTIONS` và `POST` kiểu form/text-plain từ trang khác | Không `Access-Control-Allow-Origin`; POST không phải JSON bị từ chối; không cookie nên không CSRF | CURL | — | Sau T06 |
| F06-BM-16 | plan §8 (dữ liệu ra) | Mọi `loai` | So tập khoá JSON với plan §3.2 | Chỉ các trường §3.2; `thuTuc` đúng 6 khoá; `canBo` 5 khoá; `lienHe` 2 khoá; **không** `maDvc`, `tenTimKiem`, `thuTu`, ID nội bộ; quầy/cán bộ chỉ khi dữ liệu có | XU | — | Sau T06 |
| F06-BM-17 | plan Q2 | Hai client cùng IP | A hỏi khai sinh; B hỏi "mấy ngày" không `maThuTuc` | B nhận `khong-hieu` (BE không nhớ gì giữa các yêu cầu, không lộ ngữ cảnh của người khác) | XU | — | Sau T06 |
| F06-BM-18 | plan Q8 | Hội thoại có PII | Quét `localStorage`, `sessionStorage`, cookie, IndexedDB, `history.state`, URL, `document.title` | Không chứa câu hỏi hay đáp án; chỉ các khoá hợp lệ khác (`cach-xem`, `kiosk`, và `doc-bat` nếu F07) | PW | 1280 | T18 |
| F06-BM-19 | plan §3.3 | VT | `queryClient.getQueryCache()` sau hội thoại | Không có khoá nào của `hoi`/`chu-de` POST (chỉ `['tro-ly','chu-de']` của GET); không `useMutation` | VT (rà) | — | Sau T09 |
| F06-BM-20 | plan §8 (liên kết) | Zalo/bản đồ/Cổng DVC Quốc gia lạ | Hiển thị | Chỉ http/https; `javascript:`, `data:`, `vbscript:` không hiện/không bấm được; `target=_blank` + `rel` đúng; `tel:`/`mailto:` qua phân loại | PW + VT | 1280 | T18 |
| F06-BM-21 | F00 BR-7 | Gây 500 (service ném) | Đọc phản hồi | ProblemDetails `code=loi-he-thong`, `maTraCuu` 8 ký tự A–Z và chữ số, **không** có 0 O 1 I L; không stack trace, không câu hỏi | XU | — | Sau T06 |
| F06-BM-22 | F07 BR-6 | Bản build + mã nguồn | `grep` `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `mediaDevices`; bẫy trong PW khi dùng trợ lý | 0 chỗ; 0 lần gọi; trình duyệt không hỏi quyền micro | SH + PW | 1280 | T18 |
| F06-BM-23 | CLAUDE.md > Trình duyệt | Khung mở, gửi đủ loại đáp án | `securitypolicyviolation`, `console` | 0 vi phạm CSP; 0 `console.error`; không `style` nội tuyến | PW | 375, 1280 | T18 |
| F06-BM-24 | CLAUDE.md > Tài nguyên tự host | Như trên | `page.on('request')` | Mọi request cùng gốc (kể cả khi đang hiện Zalo/bản đồ, chưa bấm) | PW | 1280 | T18 |
| F06-BM-25 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `.pdb`; `grep` tên `hoiTroLy`, `useHoiTroLy`, và chữ "NguongLienQuanPhu", ngưỡng điểm, cụm "bao lau" trong `wwwroot` | Không `.map`, không `.pdb`; tên định danh dự án bị đổi; **không** có luật trả lời ở FE (logic nằm ở BE) | SH | — | T18 |
| F06-BM-26 | CLAUDE.md > Thư viện | Cuối F06 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json`, `Directory.Packages.props` | Không High/Critical; F06 không thêm gói | SH | — | T19 |
| F06-BM-27 | plan §8 | Mã nguồn | `grep -rn "dangerouslySetInnerHTML\|innerHTML" src/FrontEnd/src/features/chatbot`; `QuyTacTruyVanTests`, `KienTrucTests` | 0 kết quả; xanh (không `AppDbContext` trong `Features/Chatbot` trừ kho PostgreSQL; ngoại lệ R4 chỉ ở `ChuoiTu.cs`) | SH + XU | — | Sau T07 |
| F06-BM-28 | CLAUDE.md > Dữ liệu | Chuỗi kết nối | `grep -r "Host=\|Password=" wwwroot`, response, log | Không có | SH | — | T19 |
| F06-BM-29 | plan §3 | `GET /api/tro-ly/chu-de?x=<ngẫu nhiên>` ×1.000 | Gửi | Khoá cache không gồm query: service chạy 1 lần; 200 như không query | XU | — | Sau T06 |
| F06-BM-30 | plan §3.4 | PostgreSQL ngừng | `POST /hoi` | 500 `loi-he-thong` + `maTraCuu`; giao diện tin lỗi + mã; không chuỗi kết nối | XU + PW | 1280 | T17 |
| F06-BM-31 | plan §3.4 | N | `DELETE /api/tro-ly/hoi` 405; `POST /chu-de` `thuTu` không có 404; `POST /api/tro-ly/khong-co` 404 | Đúng mã `phuong-thuc-khong-hop-le`, `khong-tim-thay`; ProblemDetails | XU | — | Sau T06 |

## 16. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9; AC-6)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-HN-01 | AC-6 | Release, `RateLimiting:TroLy` rất lớn, nguồn Mẫu 408 thủ tục | 1.000 yêu cầu trải đều bộ 42 câu | p95 ≤ **300 ms**; báo p50, p95, p99, lớn nhất | XU / script đo | — | T17 |
| F06-HN-02 | AC-6 | Như trên, nguồn Mẫu `TaoLon(1000)` (~1.000 thủ tục) | Như trên | p95 ≤ 300 ms | XU | — | T17 |
| F06-HN-03 | AC-6 | PostgreSQL ~1.000 thủ tục (nhập thật hoặc sinh) | Như trên | p95 ≤ 300 ms; ghi thêm p99 | XU | — | T17 |
| F06-HN-04 | plan §4.2 | Phiên bản dữ liệu mới | 20 yêu cầu song song cùng lúc | Chỉ mục dựng đúng 1 lần (đếm truy vấn nguồn); thời gian dựng 408 / 1.000 thủ tục (dự kiến 10–50 ms); bộ nhớ 2–5 MB | XU | — | Sau T03 / T17 |
| F06-HN-05 | AC-6 | Sau nhập lại (chỉ mục nguội) | Yêu cầu đầu tiên | Ghi thời gian (dựng + trả lời); ≤ 300 ms hoặc báo | XU | — | T17 |
| F06-HN-06 | plan §7 | PostgreSQL bật ghi SQL | Đếm lệnh mỗi câu | 1 truy vấn phiên bản + ≤ 6 bảng nhỏ + 1 khoá chính (bước 3) | XU | — | T17 |
| F06-HN-07 | plan §7 | 50 yêu cầu song song × 1.000 | Đo | Không 5xx; p95 trong ngân sách; bộ nhớ không tăng quá 20 MB | XU | — | T17 |
| F06-HN-08 | F00 BR-9 | `npm run build` | Mở `/` ở 375 và 1280; ghi mọi `.js`; `gzip -9` | **≤ 200 KB gzip**; vỏ F06 tăng ≤ 1 KB gzip so với trước (số T10); chunk khung và namespace `chatbot` **không** tải khi chưa bấm; chunk khung ≤ 25 KB gzip (ước 14–20) | SH + PW | 375, 1280 | T18 |
| F06-HN-09 | plan §7 | Bản build, 4G giả lập | Bấm nút lần đầu; lần hai | Khung hiện ≤ 1 giây lần đầu, tức thì lần hai; nạp trước khi `pointerdown`/`focus` | PW | 375 | T18 |
| F06-HN-10 | F00 BR-9 | Bản `dotnet publish -c Release` | Lighthouse mobile `/` ×3 | Performance ≥ **85**; CLS < 0,1 (nút nổi cố định không dịch bố cục) | LH | 375 | T18 |
| F06-HN-11 | plan §7 | Gõ vào ô nhập; mở lại khung | Đếm yêu cầu | 0 yêu cầu khi gõ; một yêu cầu mỗi câu; mở lại khung phát một `GET /chu-de` có điều kiện (`If-None-Match`); 304 kiểm ở mức API (Chromium trả 200 cho trang nên không đo được 304 ở trình duyệt) | PW | 1280 | T18 |
| F06-HN-12 | plan §7 | 4G giả lập | Từ Enter đến hiện đáp án | ≤ 1 giây (UI + BE); ghi số | PW | 375 | T18 |
| F06-HN-13 | F00 AC-19 | PostgreSQL, 500 truy cập đồng thời, 84 người hỏi | Chịu tải | Trung bình < 2,5 giây, chậm nhất < 30 giây (nếu có môi trường) | script tải | — | T19 (nếu có) |
| F06-HN-14 | plan §7 (bộ nhớ) | Khung mở | 200 câu liên tiếp (giả route) | Heap không tăng liên tục; tin ≤ 60 | PW | 1280 | T18 |

## 17. Hai nguồn dữ liệu và tích hợp PostgreSQL (F00 §9; T17)

Nơi: `src/BackEnd/DichVuCong.Tests/Integration/Chatbot/` (lớp con `TroLyServiceTrenPostgreSql` của `TroLyServiceContract`; đã có sẵn `KhoCauChuaTraLoiPostgreSqlTrenDbThatTests.cs`). Máy không có Docker: bỏ qua có thông báo, ghi vào `result/test.md`.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-HD-01 | plan Q3 | `TepDuLieuMau.Nhung` nạp vào DB riêng | Chạy 42 câu ở nguồn Mẫu và PostgreSQL | **JSON đáp án giống hệt** từng ca | XU (Integration) | — | T17 |
| F06-HD-02 | plan §9 | Biến thể dữ liệu: +PC, +Mau, +A/+B, −giờ, +Zalo, −CổngDVC, +15/+0, +ĐN, −5CĐ | Chạy các câu liên quan | Cùng kết quả hai nguồn | XU | — | T17 |
| F06-HD-03 | T07 | Các ca ngoài bảng (đảo chữ, "khaisinh", hai thủ tục, "kết", mã hoa/thường, "TTHC", U+200E, từ đệm) | Chạy | Cùng kết quả hai nguồn; kỳ vọng rõ từng ca | XU | — | T17 |
| F06-HD-04 | T03 | Nguồn đảo thứ tự đọc | Chạy | Cùng danh sách xếp hạng (xác định) | XU (rà) | — | Sau T03 |
| F06-HD-05 | F00 BR-10, AC-18/24/25/26 | PostgreSQL; nhập lại (Trung tâm, phân công, nhân sự, câu mẫu, chủ đề, từ đồng nghĩa) | Gọi API ngay | Thấy dữ liệu mới ngay, không chờ hết hạn cache, không khởi động lại; chỉ mục dựng lại khi phiên bản đổi | XU | — | T17 · Chờ F01 |
| F06-HD-06 | F00 BR-16 | Chế độ demo | Nhập lại | Không nhập được; kho chỉ trong bộ nhớ (KH-07) | XU | — | T17 |
| F06-HD-07 | AC-8/14/16 | PostgreSQL | Hỏi qua HTTP; `xuat` của Import | Đúng như CN-01, CN-02, KH-01 | XU | — | T17 |
| F06-HD-08 | F00 §9 | Bộ ca E2E nhóm TH, MA, TT, QU, CD trên profile `https` và `https-postgresql` | So kết quả | Cùng kết quả (dữ liệu nhập giống) | PW | 1280 | T19 |
| F06-HD-09 | plan §2 | Nguồn không có thủ tục | Chạy 42 câu | Mọi câu 200; thủ tục → `khong-hieu`; không lỗi | XU | — | Sau T07 |
| F06-HD-10 | plan §11 rủi ro 6 | Nhập lại trong lúc đang dựng chỉ mục | 50 yêu cầu liên tục | Không ném lỗi; lần sau dựng lại | XU | — | T17 |

## 18. Điểm ghép F07 / F09 (kiểm khi hai chức năng đó xong)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F06-GP-01 | F09 AC-3 | Kiosk | Hỏi "kết hôn", rồi "nộp hồ sơ trực tuyến ở đâu" | Khung có **đúng một** dòng "Nhớ đăng xuất khi dùng xong", không lặp ở từng đáp án | PW | K | Chờ F09 |
| F06-GP-02 | F09 AC-3 | Kiosk, sau "Bắt đầu lại" | Hỏi "mấy giờ làm việc" (không liên kết Cổng DVC) | Khung không có dòng nhắc | PW | K | Chờ F09 |
| F06-GP-03 | F09 AC-6, AC-9 | Kiosk | Hỏi câu có số 0912345678, bấm "Bắt đầu lại", mở trợ lý | Hội thoại trống (chỉ lời chào); màn hình và nơi lưu không còn "0912345678"; "mấy ngày" không ra thời hạn thủ tục cũ | PW | K | Chờ F09 |
| F06-GP-04 | F09 BR-7 | Kiosk, khung mở | Tab qua khung | Mọi phần tử khung đứng trước nút "Bắt đầu lại" (khung nằm trong `#root`, không portal) | PW | K | Chờ F09 |
| F06-GP-05 | F07 AC-8 | Bật đọc | Đóng khung bằng ✕ khi đang đọc | Tiếng đọc dừng; mở lại không tự đọc tiếp (`khungDangMo`, `cauTraLoiMoi.id`) | PW (giả `speechSynthesis`) | 1280 | Chờ F07 |
| F06-GP-06 | F07 BR-3 | VT `vanBanDoc` | Với từng `loai` | Chữ thuần ghép bằng cùng khoá `t()`, **bỏ** nhãn nút, đường dẫn, dòng nhắc đăng xuất | VT (rà) | — | Sau T11 |

## 19. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F06-BT-01…BT-42, TH-01…TH-25, MA-01…MA-10, LH-09, LH-12 |
| BR-2 | F06-BT-13…BT-15, BT-39, TH-06…TH-16 |
| BR-3 | F06-BT-04…BT-06, BT-16…BT-19, QU-01…QU-20, CD-08, VW-04, VW-12 |
| BR-4 | F06-BM-02, BM-16, BM-17, BM-25, UI-06 |
| BR-5 | F06-GH-01…GH-20, BM-05, BM-06 |
| BR-6 | F06-PU-01…PU-16, MA-06, VW-07 |
| BR-7 | F06-KH-01, KH-02, KH-13, CN-16 |
| BR-8 | F06-BT-29, BT-30, CN-01…CN-16 |
| BR-9 | F06-BT-20…BT-28, TT-01…TT-24 |
| BR-10 | F06-BT-07, BT-33, LH-01…LH-08, VW-13 |
| BR-11 | F06-BT-34…BT-36, CD-01…CD-17, VW-09 |
| BR-12 | F06-KH-03…KH-08, KH-15 |
| AC-1 | F06-BT-01, TH-01 |
| AC-2 | F06-BT-02, TH-02 |
| AC-3 | F06-BT-04, BT-06, QU-01, QU-02 |
| AC-4 | F06-BT-07, LH-01, LH-02, KH-01 |
| AC-5 | F06-BT-08, BT-09, TH-03 |
| AC-6 | F06-HN-01…HN-07 |
| AC-7 | F06-GH-08, GH-09 |
| AC-8 | F06-BT-29, CN-01 |
| AC-9 | F06-PU-01 |
| AC-10 | F06-BT-12, BT-40, MA-01…MA-05 |
| AC-11 | F06-BT-10, BT-11, TH-04, TH-05 |
| AC-12 | F06-BT-16, QU-07…QU-09 |
| AC-13 | F06-BT-42, GH-01…GH-07 |
| AC-14 | F06-BT-31, KH-01 |
| AC-15 | F06-BT-13, BT-14, TH-06, TH-07 |
| AC-16 | F06-BT-30, CN-02 |
| AC-17 | F06-PU-02…PU-05, PU-12 |
| AC-18 | F06-BT-22, BT-23, TT-01, TT-02 |
| AC-19 | F06-BT-25, TT-03…TT-08 |
| AC-20 | F06-BT-27, BT-28, TT-09…TT-11 |
| AC-21 | F06-BT-18, BT-20, BT-21, TT-12…TT-14 |
| AC-22 | F06-BT-22, BT-26, TT-15…TT-18 |
| AC-23 | F06-BT-07, BT-33, LH-03…LH-06 |
| AC-24 | F06-BT-05, BT-17…BT-19, QU-03…QU-06 |
| AC-25 | F06-BT-34…BT-36, CD-01…CD-06 |
| AC-26 | F06-BT-24, BT-41, MA-09, TT-19 |
| AC-27 | F06-BT-32, KH-03…KH-05 |
| AC-28 | F06-GH-10…GH-12 |
| AC-29 | F06-PU-07, PU-08 |
| Bảo mật (CLAUDE.md) | F06-BM-01…BM-31, CN-12 |
| Trợ năng | F06-TN-01…TN-14 |
| Hiệu năng (F00 BR-9) | F06-HN-01…HN-14 |
| Hai nguồn dữ liệu | F06-HD-01…HD-10, BT-01…BT-42 |
| Khung chat, hiển thị | F06-UI-01…UI-24, VW-01…VW-18 |
| Điểm ghép F07/F09 | F06-GP-01…GP-06 |

## 20. Tóm tắt

- **Số ca**: BT 42 · TH 25 · MA 10 · TT 24 · QU 20 · LH 13 · CD 17 · CN 16 · KH 15 · GH 20 · PU 16 · UI 24 · VW 18 · TN 14 · BM 31 · HN 14 · HD 10 · GP 6 = **335 ca**. Mỗi BR (1…12) và mỗi AC (1…29) có ít nhất một ca.
- **Chạy ngay (không cần trình duyệt)**: bộ 42 câu và các ca XU sau T07; ca HTTP/giới hạn/bảo mật BE sau T06; Vitest sau T09, T11, T12.
- **Ca cần chế độ chạy thật (CHAY-THAT)**: AC-8 (CN-01), AC-14 (KH-01), AC-16 (CN-02), AC-27 (KH-03…KH-05), AC-18, AC-24, AC-25, AC-26, AC-23 phần nhập lại, AC-10 phần nhập lại — chạy ở T17 với profile `https-postgresql`, `nhap tat-ca`, `xuat cau-chua-tra-loi`.
- **Chờ chức năng khác**: F01 (công cụ nhập, xuất: QU-06, QU-08, TT-02, TT-19, MA-02, MA-09, LH-02, LH-05, CD-02, KH-14); F07 (GP-05, GP-06); F09 (GH-12, PU-12, UI-12, TN-03 phần kiosk, GP-01…GP-04); thiết bị thật (TT-10, LH-06, UI-13, TN-14).
- **AC khó kiểm tự động**: AC-6 (p95 ≤ 300 ms phụ thuộc máy đo; đo ở Release với giới hạn tần suất đặt lớn, ghi cấu hình máy); AC-19 (giờ làm việc — dùng `page.clock` và múi giờ, trạng thái là ảnh chụp lúc hỏi); AC-20 phần bấm `tel:` và AC-23 phần mở Zalo (điện thoại thật); AC-27 (cần giả lập ngày — `TimeProvider`); AC-18/24/25/26 phần "nhập lại, không sửa code" (cần F01 và PostgreSQL); đọc `aria-live` bằng NVDA/TalkBack (TN-05); BR-12 "tự xoá không cần ai chạy lệnh" (kiểm bằng tua thời gian, không đợi 90 ngày thật).
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): (1) "mấy ngày" khi chưa có thủ tục → bước 5 và **ghi vào kho** (plan Cần hỏi 1; KH-11, BT-03) — làm bẩn danh sách của cán bộ; (2) "xin chào", "cảm ơn" coi như không hiểu và ghi kho (Cần hỏi 2; LH-10); (3) có quầy nhưng chưa có nhân sự, hỏi "ai phụ trách" — nêu quầy hay "nộp tại Trung tâm" (Cần hỏi 3; QU-10), và hỏi "nộp ở quầy nào" không nêu lĩnh vực (Cần hỏi 4; QU-14); (4) cửa sổ giới hạn tần suất "mỗi phút" cố định hay trượt (GH-15), và "hết phút đó" tính từ đâu (GH-09); (5) AC-13 "ô nhập không nhận ký tự thứ 501": đếm theo ký tự hiển thị hay đơn vị UTF-16 (GH-04); (6) giới hạn số phần tử mỗi đáp án (8 giấy tờ, 2 bước × 500, 6 kết quả, 6 căn cứ × 200, 10 cán bộ) chỉ có trong plan, spec không nêu (VW-01, VW-05, VW-06, QU-13); (7) tin vượt trần 60 có làm mất lời chào không (UI-09); (8) kho Mẫu đầy 1.000 dòng thì bỏ cũ hay từ chối, và biên đúng 90 ngày (KH-08, KH-05); (9) gộp câu chưa trả lời theo bản **đã che** làm hai số điện thoại khác nhau cùng đầu/cuối thành một dòng (CN-16); (10) "10:00 thứ Hai" của AC-19 là giờ Việt Nam hay giờ máy người dùng — plan §5.4 dùng đồng hồ máy nhưng tính theo giờ Việt Nam (TT-07); (11) CSV/Excel injection khi xuất câu chưa trả lời (KH-14) chưa có trong spec F01; (12) `ChoNutDoc`/`NhacDangXuat` rỗng ở F06 nên các ca F07/F09 chỉ chạy được khi hai chức năng đó nối vào.

## Cập nhật sau lượt chạy T17/T18/T19 (2026-10-13)

- Kết quả ở `result/test.md`. Sửa kỳ vọng cho khớp spec/thiết kế: **TN-11** vùng bấm ≥ 24 px (spec C01 AC-2; ✕ 34×34, Gửi 47×34, chip 65×28), không phải 44 px; **HN-11** mở lại khung phát một `GET /chu-de` mới (staleTime 0), 304 chỉ kiểm được ở mức API (Chromium báo 200 cho trang); **CD-09** dưới đáp án chủ đề không có 4 chip hỏi tiếp (chủ ý của dev: máy chủ không gán thủ tục đang nói tới sau chủ đề), chỉ dòng "Gõ tên thủ tục để hỏi thêm."; **GH-20** `GET` tới đường chỉ nhận POST hiện trả 404 (lỗi G1); **TH-23** `maThuTuc` 21 ký tự trả 400 (lỗi G6).
- Ghi nhận ngoài bảng: G2 (câu vô nghĩa có số ngày tháng kèm năm ra danh sách thủ tục), R1 (cạnh tranh ghi địa chỉ khi gõ ô tìm rồi mở Trợ lý), G3 (khung < 600 px hở 15 px khi có thanh cuộn cổ điển).

## Cập nhật lượt xác nhận (2026-10-14)

Ca mới:

| Case | AC/BR | Dữ liệu | Bước | Kết quả mong đợi | Cách | Khổ | Task |
|---|---|---|---|---|---|---|---|
| F06-GH-30 | plan §3 (http có hạn chờ 15 s) | N, `POST /api/tro-ly/hoi` không bao giờ trả lời | Mở khung, gõ "khai sinh", gửi | Sau ≤ ~16 giây: tin lỗi mất kết nối + "Thử lại"; hết "Đang tìm câu trả lời…"; nút Gửi không kẹt; bỏ chặn rồi hỏi lại → có đáp án; khung còn | PW | 1280 | T18 |
| F06-PU-R1 | R1 (chạy tranh ghi địa chỉ) | `/thu-tuc` thường và `?kiosk=1`; mỗi khổ ≥ 20 lần, lần chẵn `fill`, lần lẻ gõ từng phím | Gõ "khai sinh" vào ô tìm của trang, bấm "Trợ lý" **ngay**, hỏi "kết hôn", bấm "Xem chi tiết" ngay khi đáp án hiện | Popup luôn mở; địa chỉ có `ma=…` **và** `q=khai sinh`; ô tìm vẫn "khai sinh" | PW (`tranh-ghi-dia-chi.spec.ts`) | K, 1280, 375 | T18 |
| F06-PU-R1b | R1 | `/thu-tuc` ở dạng thẻ | Gõ "khai sinh" rồi bấm "Xem chi tiết" ở thẻ đầu sau 0, 100, 200, 250, 280, 300, 320, 350, 400 ms (3 lần mỗi mốc) | Popup mở; `ma` và `q` cùng có trên địa chỉ | PW | 1280, K | T18 |

Kỳ vọng đã sửa: **UI-02** (dưới 600 px khung rộng đúng 375 px, `x = 0`, điểm sát mép phải thuộc khung — không hở dải cuộn cổ điển), **TH-23** (`maThuTuc` 21 ký tự → 400 là đúng; ≤ 20 ký tự → 200), **GH-20** (`GET` tới `/hoi` → 405 kèm `Allow: POST`), **TN-11** (vùng bấm ≥ 24 px; ≥ 48 px ở kiosk), **HN-11** (mở lại khung phát `GET /chu-de` có điều kiện; 304 kiểm ở mức API), **CD-09** (không có 4 chip hỏi tiếp dưới đáp án chủ đề — chủ ý). Ca vô nghĩa kèm ngày tháng năm ("xem bói 12 05 2026", "thời tiết ngày 12 05 2026") → `khong-hieu` đã vào bộ hợp đồng (dòng 59, 60).
