---
id: F02
ten: Trang chủ — ô dịch vụ nhanh, giờ làm việc — test case
spec: spec.md (dang-lam) · plan.md (cập nhật 2026-10-13)
nguoi_viet: tester
cap_nhat: 2026-10-13
trang_thai_chay: đã chạy 2026-10-13 (T08, T10) — xem result/test.md; còn ca Chờ (F09, thử tay, ảnh banner)
---

# F02 · Trang chủ — test case

## 0. Cách đọc

**Cách kiểm**

| Ký hiệu | Nghĩa |
|---|---|
| PW | Playwright, `src/FrontEnd/e2e/trang-chu.spec.ts` (bản build do API phục vụ, `ban-build.config.ts`) |
| AX | `@axe-core/playwright` (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) |
| XU | xUnit + WebApplicationFactory (`Tests/Integration/ThongTinTrungTam/` của F08; F02 không có API mới nên chỉ rà chéo các trường `oDichVu`, `gioLamViec`) |
| VT | Vitest do frontend-dev viết (T02–T05); tester chỉ rà. Chạy `gioLamViec.test.ts` ba lần với `TZ=Asia/Ho_Chi_Minh`, `TZ=America/Los_Angeles`, `TZ=Pacific/Auckland` |
| CURL | `curl -I`, `curl -s` (bản `dotnet run`, `https://localhost:7157`) |
| LH | Lighthouse mobile, 3 lần, lấy trung vị, bản `dotnet publish -c Release` |
| SH | Lệnh shell |
| TAY | Thử tay (NVDA, TalkBack, thiết bị thật) |

**Khổ**: 375 (375×812), 768, 1280, **K** = kiosk 1080×1920 mở bằng `/?kiosk=1`. 320 chỉ cho ca reflow. Mốc lưới ô: 600 và 1024.

**Hai nguồn dữ liệu**: nguồn **Mẫu** (profile `https`) và **PostgreSQL** (profile `https-postgresql`). Ca ghi "2 nguồn" phải cho cùng kết quả. Ca E2E giả dữ liệu bằng `page.route('**/api/trung-tam')` (như F08 T10), dựng trong `e2e/du-lieu/trang-chu.ts`.

**Giả thời gian** (Playwright): `page.clock.install({ time })` đặt giờ máy khách; `page.clock.fastForward(ms)` / `runFor(ms)` tua; múi giờ máy khách đặt qua `browser.newContext({ timezoneId })`. Giờ Việt Nam (UTC+7, không có giờ mùa hè) đổi sang UTC: **trừ 7 giờ**.

**Mốc thời gian dùng trong ca** (ngày 2026-10-12 là thứ Hai; 10-10 thứ Bảy; 10-11 Chủ nhật; 2026-09-02 thứ Tư):

| Mã mốc | Giờ Việt Nam | Mốc UTC (đưa vào `clock`) |
|---|---|---|
| I1 | Thứ Hai 10:00 | 2026-10-12T03:00:00Z |
| I2 | Thứ Hai 12:00 | 2026-10-12T05:00:00Z |
| I3 | Thứ Bảy 09:00 | 2026-10-10T02:00:00Z |
| I4 | Thứ Bảy 14:00 | 2026-10-10T07:00:00Z |
| I5 | Chủ nhật 09:00 | 2026-10-11T02:00:00Z |
| I6 | Thứ Hai 06:59 (UTC còn là Chủ nhật) | 2026-10-11T23:59:00Z |
| I7 | Thứ Hai 07:00 | 2026-10-12T00:00:00Z |
| I8 | Thứ Hai 11:29 | 2026-10-12T04:29:00Z |
| I9 | Thứ Hai 11:30 | 2026-10-12T04:30:00Z |
| I10 | Thứ Hai 13:29 | 2026-10-12T06:29:00Z |
| I11 | Thứ Hai 13:30 | 2026-10-12T06:30:00Z |
| I12 | Thứ Hai 16:59 | 2026-10-12T09:59:00Z |
| I13 | Thứ Hai 17:00 | 2026-10-12T10:00:00Z |
| I14 | Thứ Tư 02/9/2026 10:00 (Quốc khánh) | 2026-09-02T03:00:00Z |
| I15 | Thứ Hai 10:00, ngày Auckland vừa chuyển giờ (2026-09-28) | 2026-09-28T03:00:00Z |
| I16 | Thứ Hai 10:00, ngày New York vừa hết giờ mùa hè (2026-11-02) | 2026-11-02T03:00:00Z |

**Dữ liệu thử** (tên giả; chỉ các ô theo `lien-ket.md` §1 dùng tên thật vì AC-6 yêu cầu):

| Bộ | Nội dung |
|---|---|
| **TT-A** | `ten` "Trung tâm thử A", `coQuanChuQuan` "UBND phường thử B", phần còn lại như bộ A của F08 |
| **TT-B** | Như TT-A nhưng `coQuanChuQuan` trống |
| **TT-C** | `ten` 200 ký tự có dấu cách, `coQuanChuQuan` 120 ký tự |
| **TT-D** | `ten` `Trung tâm "thử" & <b>D</b>`, `coQuanChuQuan` `<script>alert(1)</script>` |
| **G1** (AC-2) | `gioLamViec` thứ 1–5 (Thứ Hai – Thứ Sáu): sáng 07:00–11:30, chiều 13:30–17:00; `ghiChuNgayNghi` trống |
| **G2** (AC-7, AC-9) | G1 + thứ 6 (Thứ Bảy) chỉ sáng 07:00–11:30; Chủ nhật không có dòng |
| **G3** | Như G1 nhưng thiếu Thứ Tư: chỉ có `thu` 1, 2, 4, 5 (Thứ Hai, Thứ Ba, Thứ Năm, Thứ Sáu) → nhóm "Thứ Hai – Thứ Ba" và "Thứ Năm – Thứ Sáu" |
| **G4** | Chỉ `thu` 1 (Thứ Hai) và `thu` 7 (Chủ nhật), cùng giờ 07:00–11:30 / 13:30–17:00 |
| **G5** (buổi hỏng) | `thu` 1: sáng "25:00"–"11:30", chiều tốt; `thu` 2: sáng "11:30"–"07:00" (đầu ≥ cuối), chiều null; `thu` 3: sáng null, chiều "13:30"–null; `thu` 4: sáng "7:00"–"11:30" (thiếu số 0); `thu` 5: sáng "07:00"–"12:60"; `thu` 6 và 7 tốt (07:00–11:30) |
| **G6** | `gioLamViec: []` |
| **G7** | Mỗi ngày một giờ khác nhau, 7 ngày làm việc (`thu` 1–7) |
| **G8** | G1 nhưng chỉ có buổi chiều (sáng null) |
| **G9** | Dòng giờ không theo thứ tự `thu` (5, 1, 3, 2, 4), cùng giờ |
| **G10** | G1 + `ghiChuNgayNghi` = "Trừ ngày nghỉ, lễ, Tết theo quy định" |
| **O6** (AC-6, tên và thứ tự theo `lien-ket.md` §1) | 1 "Bốc số thứ tự / Đặt lịch hẹn" (url null, `boc-so`); 2 "Đánh giá hài lòng" (url null, `danh-gia`); 3 "Tra cứu hồ sơ" (`https://dichvucong.gov.vn/tra-cuu-ho-so`, `tra-cuu-ho-so`); 4 "Thanh toán trực tuyến" (`https://dichvucong.gov.vn/thanh-toan-truc-tuyen`, `thanh-toan`); 5 "Cổng Dịch vụ công Quốc gia" (`https://dichvucong.gov.vn/thu-tuc-hanh-chinh`, `cong-dvc`); 6 "Cổng thông tin điện tử xã Cần Giuộc" (`https://cangiuoc.tayninh.gov.vn`, `cong-thong-tin`) |
| **O6g** (E2E giả) | Như O6 nhưng địa chỉ ô 3–6 là `https://*.example.test` (không gọi ra ngoài thật); ô 3 `https://tracuu.example.test/ho-so` |
| **O7** | O6g + ô thứ 7 "Ô mới thử" (`https://moi.example.test`, `lien-ket`) |
| **OE** (độc hại) | url lần lượt `javascript:alert(1)`, `data:text/html,x`, `//evil.example`, `""`, `"   "`, `ftp://x.example`, `https://`, `HTTP://UPPER.example.test`; `ten` `<b>đậm</b> & "x"` |
| **OD** (dài) | `ten` 120 ký tự có dấu cách; `bieuTuong` lạ `khong-co-khoa` |
| **OX** (tên miền cấm) | Một ô có `url` = `https://motcua.tayninh.gov.vn` — chỉ dùng để chứng minh F02 không có mã chặn (xem DV-18) |

**Cột "Khi chạy"**: "Sau T02/T03/T04/T05" = task đó xong; "Chờ F03" = khối thường gặp (F03 T07, F02 T09); "Chờ F01 T07" = cần công cụ nhập loại `trung-tam`/ô dịch vụ; "Chờ F09/F06" = cần chức năng đó; "T08/T10" = chạy ở task đó. Ca chờ chưa chạy được không tính là lỗi.

**Không áp dụng**: giọng đọc tiếng Việt, đọc to (ngoài phạm vi); khối liên hệ riêng; khối lịch hành chính lưu động (F10 hoãn); khối thống kê (thuộc F04). Có ca âm: BC-03, BC-04.

## 1. Ô dịch vụ nhanh (BR-1, BR-4, BR-6; AC-1, AC-3, AC-6, AC-8)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-DV-01 | AC-1, BR-4 | O6g, mở `/` | Bấm ô "Tra cứu hồ sơ" | Sự kiện `popup`: tab mới mở đúng `https://tracuu.example.test/ho-so` (chặn mạng ra ngoài bằng `route.fulfill`); trang hiện tại không đổi | PW | 1280, 375 | Sau T05 |
| F02-DV-02 | AC-1, C01 BR-3 | Như trên | Đọc thuộc tính ô | `<a target="_blank" rel="noopener noreferrer">`; tab mới có `window.opener === null`; tên đọc có "(mở trang mới)"; có dấu hiệu "trang ngoài" nhìn thấy | PW | 1280 | Sau T05 |
| F02-DV-03 | AC-1 | Như trên | Tab tới ô "Tra cứu hồ sơ"; Enter | Mở tab mới đúng địa chỉ; viền focus nhìn thấy | PW | 1280 | Sau T05 |
| F02-DV-04 | AC-6, BR-1 | O6g | Đọc tên và thứ tự các ô | Đúng 6 ô theo thứ tự trong dữ liệu: Bốc số thứ tự / Đặt lịch hẹn → Đánh giá hài lòng → Tra cứu hồ sơ → Thanh toán trực tuyến → Cổng Dịch vụ công Quốc gia → Cổng thông tin điện tử xã Cần Giuộc | PW | 1280, 375 | Sau T05 |
| F02-DV-05 | AC-6 | O6 (dữ liệu thật qua F01 hoặc nguồn Mẫu) | Đọc `href` của 4 ô có link | Khớp từng địa chỉ trong `lien-ket.md` §1 (dichvucong.gov.vn/tra-cuu-ho-so, …/thanh-toan-truc-tuyen, …/thu-tuc-hanh-chinh, cangiuoc.tayninh.gov.vn); bấm từng ô → tab mới đúng địa chỉ (chặn mạng) | PW | 1280 | Chờ F01 T07 (hoặc nguồn Mẫu nếu khớp) |
| F02-DV-06 | AC-6, BR-6 | Mọi `a[href]` của khu ô dịch vụ (dữ liệu thật / nguồn Mẫu) | So với danh sách "Đã bỏ" (`lien-ket.md` §1) | Không `href` nào thuộc `motcua.tayninh.gov.vn`, `vbdh.tayninh.gov.vn`, `dichvucong.tayninh.gov.vn` (kể cả trang con) | PW | 1280 | Sau T05 + dữ liệu |
| F02-DV-07 | AC-3, BR-1 | Nhập (F01, PostgreSQL) file ô dịch vụ gồm 6 ô O6; sau đó nhập lại file có thêm 1 ô; **không** sửa code, không build lại | Tải lại `/` | Trang hiện thêm ô thứ 7 đúng vị trí cuối; sáu ô cũ giữ thứ tự và màu | PW | 1280 | Chờ F01 T07 |
| F02-DV-08 | AC-3 | O7 (giả) | Mở `/` | 7 ô; ô 7 có biểu tượng `ExternalLink`, mở tab mới đúng địa chỉ | PW | 1280 | Sau T05 |
| F02-DV-09 | AC-3, plan §4.5 | O6g rồi O6g có ô mới chèn **đầu** danh sách | So màu biểu tượng ô "Tra cứu hồ sơ" trước/sau | Màu và biểu tượng theo khoá `bieuTuong`, không đổi khi đổi vị trí | PW | 1280 | Sau T05 |
| F02-DV-10 | AC-3 (biên) | OD (`bieuTuong` = `khong-co-khoa`) | Mở | Dùng biểu tượng mặc định (`lien-ket`); không ném lỗi; không trang trắng | PW | 1280 | Sau T05 |
| F02-DV-11 | AC-8, BR-4 | O6g | Đo hai ô đầu (không link) và ô có link | Hai ô vẫn hiện đúng vị trí 1 và 2; cùng kích thước (rộng, cao) với ô có link; cùng khung, biểu tượng, cỡ chữ | PW (hộp bao) | 1280, 375 | Sau T05 |
| F02-DV-12 | AC-8 | Như trên | Đọc `getComputedStyle` | Không viền nét đứt (`border-style` ≠ dashed); `opacity` = 1 và màu chữ không nhạt hơn ô có link; không dòng chữ ghi chú ("chưa có link", "sắp ra mắt", "Trang ngoài") | PW | 1280 | Sau T05 |
| F02-DV-13 | AC-8 | Như trên | Bấm lần lượt hai ô; theo dõi `popup`, `framenavigated`, URL | Không tab nào mở; trang không đổi, không cuộn, không nhảy | PW | 1280, 375 | Sau T05 |
| F02-DV-14 | AC-8, C01 BR-12 | Như trên | Nhấn Tab qua hàng ô; đếm điểm dừng | Con trỏ dừng ở 4 ô có link, **không** dừng ở hai ô kia (không `tabindex`, không `href`, không `role=link`) | PW | 1280 | Sau T05 |
| F02-DV-15 | AC-8 | Như trên | Đọc cây trợ năng | Hai ô không có vai trò `link`; `getByRole('link', {name: 'Đánh giá hài lòng'})` rỗng; tên ô còn trong văn bản | PW + AX | 1280 | Sau T05 |
| F02-DV-16 | AC-8 | NVDA / TalkBack | Duyệt hàng ô | Đọc tên hai ô như chữ thường, **không** đọc "liên kết"; 4 ô còn lại đọc là liên kết "(mở trang mới)" | TAY | 375, 1280 | Sau T05 |
| F02-DV-17 | BR-4 (độc hại) | OE; `page.on('dialog')` | Mở `/`; bấm từng ô | Mọi ô OE hiện như ô thường: không `<a>`, không `href`, bấm không điều hướng, không hộp thoại; `HTTP://UPPER.example.test` (http/https viết hoa) — ghi hành vi (nhận hay không) | PW | 1280 | Sau T05 |
| F02-DV-18 | BR-6 (ghi nhận) | OX (`motcua.tayninh.gov.vn`) | Mở | F02 **không có mã chặn** (plan §6): ô hiện như bình thường. Ghi nhận: quy tắc BR-6 là về nội dung dữ liệu, kiểm ở DV-06; F01 nên từ chối tên miền "Đã bỏ" — ghi vào mơ hồ | PW | 1280 | Sau T05 |
| F02-DV-19 | BR-4 (tên) | OE (`ten` có `<b>`) và OD (tên 120 ký tự) | Xem ô | Chữ hiện nguyên văn dạng chữ; tên tối đa 2 dòng (cắt gọn "…"), tên đọc đầy đủ; không làm lưới vỡ | PW | 375, 1280 | Sau T05 |
| F02-DV-20 | C01 BR-12 | O6g | Đo số ô mỗi hàng ở 375, 600, 768, 1024, 1280, K | Lưới 2 cột (< 600), 3 cột (600–1023), 6 cột (≥ 1024); các ô cùng hàng cao bằng nhau; không cuộn ngang trang | PW | 375…1280, K | Sau T05 |
| F02-DV-21 | BR-1 | `oDichVu: []` | Mở | Không lưới; khối chỉ có `h2` ẩn; **không** `ErrorState`; các khối khác bình thường | PW | 1280 | Sau T05 |
| F02-DV-22 | BR-1 | Mã nguồn `features/trang-chu`, `core/components/Tile` | `grep -rn "dichvucong.gov.vn\|cangiuoc\|tayninh" src/features/trang-chu src/core` | Không địa chỉ ô dịch vụ viết cứng trong mã (chỉ trong test/dữ liệu thử) | SH | — | Sau T05 |
| F02-DV-23 | plan §4.5 | `moTa` có trong API | Mở | `moTa` không hiển thị ở đâu trên trang (plan: ghi cho ba-analyst) | PW | 1280 | Sau T05 |

## 2. Trạng thái "đang trong giờ làm việc" (BR-2, BR-3, BR-7; AC-2, AC-5, AC-7)

Mỗi ca đặt `page.clock.install({ time })` **trước** khi mở trang; múi giờ máy mặc định `Asia/Ho_Chi_Minh` trừ khi ghi khác (xem nhóm MG).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-GL-01 | AC-2, BR-2 | G1, mốc I1 (Thứ Hai 10:00) | Mở `/` | Nhãn "Đang trong giờ làm việc" (có icon và chữ) | PW | 1280, 375 | Sau T05 |
| F02-GL-02 | AC-2 | G1, mốc I2 (Thứ Hai 12:00) | Mở | "Ngoài giờ làm việc" | PW | 1280 | Sau T05 |
| F02-GL-03 | AC-2 | G1, mốc I3 (Thứ Bảy 09:00) | Mở | "Ngoài giờ làm việc" (G1 không có Thứ Bảy) | PW | 1280 | Sau T05 |
| F02-GL-04 | AC-7, BR-7 | G2, mốc I3 | Mở | "Đang trong giờ làm việc" | PW | 1280 | Sau T05 |
| F02-GL-05 | AC-7 | G2, mốc I4 (Thứ Bảy 14:00) | Mở | "Ngoài giờ làm việc" (Thứ Bảy chỉ có buổi sáng) | PW | 1280 | Sau T05 |
| F02-GL-06 | AC-7 | G2, mốc I5 (Chủ nhật 09:00) | Mở | "Ngoài giờ làm việc" (ngày không có giờ là ngày nghỉ) | PW | 1280 | Sau T05 |
| F02-GL-07 | AC-5, BR-3 | G10, mốc I14 (02/9/2026, thứ Tư, Quốc khánh) | Mở | "Đang trong giờ làm việc" **và** dòng ghi chú "Trừ ngày nghỉ, lễ, Tết theo quy định" (ngày lễ không tính vào trạng thái) | PW | 1280, 375 | Sau T05 |
| F02-GL-08 | AC-5 | G10 | Đọc khối giờ | Hiện dòng ghi chú đúng nguyên văn dữ liệu, ở cuối khối | PW | 1280 | Sau T05 |
| F02-GL-09 | AC-5 (biên) | G1 (ghi chú trống), G10 sau khi bỏ ghi chú | Đọc khối giờ | Không dòng ghi chú, không khoảng trống | PW | 1280 | Sau T05 |
| F02-GL-10 | BR-2 | G1, mốc I6 (Thứ Hai 06:59, UTC còn Chủ nhật) | Mở | "Ngoài giờ làm việc" (06:59 chưa tới 07:00) | PW | 1280 | Sau T05 |
| F02-GL-11 | BR-7 | G7 (mỗi ngày một giờ), lần lượt các mốc trong từng ngày | Mở | Trạng thái tính theo giờ của đúng ngày hôm đó (vd. giờ đang mở của Thứ Hai nhưng ngoài giờ của Thứ Ba) | PW | 1280 | Sau T05 |
| F02-GL-12 | BR-7 | G8 (chỉ chiều), mốc I1 (10:00) và mốc 14:00 | Mở | 10:00 → ngoài giờ; 14:00 (07:00Z) → đang trong giờ | PW | 1280 | Sau T05 |
| F02-GL-13 | BR-2 | G6 (`[]`) | Mở | **Ẩn cả khối** giờ làm việc, kể cả nhãn trạng thái (plan B4; spec chưa nói — ghi mơ hồ); trang không lỗi | PW | 1280, 375 | Sau T05 |
| F02-GL-14 | BR-2 (biên) | G5 (buổi hỏng) | Mở; lần lượt mốc trong từng ngày hỏng | Buổi hỏng bị bỏ qua, không ném lỗi, không hiện chữ lạ ("25:00", "NaN", "undefined"); ngày không còn buổi nào = nghỉ; ngày tốt (thu 6, 7) vẫn đúng; console không lỗi | PW | 1280 | Sau T05 |
| F02-GL-15 | BR-2 (nhất quán) | G5 | So nhãn trạng thái với các dòng giờ hiển thị | Trạng thái và dòng giờ cùng một nguồn chuẩn hoá: không có chuyện nhãn "Đang" mà dòng giờ của ngày đó không hiển thị | PW | 1280 | Sau T05 |
| F02-GL-16 | BR-2 | G1, giờ máy khách sai (đặt 3 giờ lệch) | Mở với `clock` 10:00 VN rồi 13:00 VN | Nhãn theo giờ máy (ghi nhận rủi ro 2: kiosk lệch giờ → trạng thái sai); khuyến nghị đồng bộ giờ (F09 BR-6) | PW | 1280 | Sau T05 |
| F02-GL-17 | BR-3 | G1, mốc ngày lễ khác (01/01/2027 Thứ Sáu 10:00 VN = 2027-01-01T03:00:00Z) | Mở | "Đang trong giờ làm việc" (không xét ngày lễ) | PW | 1280 | Sau T05 |
| F02-GL-18 | BR-2 | Giờ thật (không giả `clock`) | Mở | Nhãn khớp giờ VN thực lúc chạy (so với phép tính trong test) | PW | 1280 | Sau T05 |

### 2a. Ranh giới buổi (plan B2: đầu gồm, cuối không gồm; spec chưa nói)

Dữ liệu G1. Mỗi mốc mở trang riêng (hoặc tua đồng hồ).

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-RG-01 | BR-2 (biên) | G1, I6 (06:59) rồi I7 (07:00) | Mở | 06:59 → Ngoài; 07:00 → **Đang** (đầu gồm) | PW | 1280 | Sau T05 |
| F02-RG-02 | BR-2 (biên) | G1, I8 (11:29) rồi I9 (11:30) | Mở | 11:29 → Đang; 11:30 → **Ngoài** (cuối không gồm) | PW | 1280 | Sau T05 |
| F02-RG-03 | BR-2 (biên) | G1, I10 (13:29) rồi I11 (13:30) | Mở | 13:29 → Ngoài; 13:30 → Đang | PW | 1280 | Sau T05 |
| F02-RG-04 | BR-2 (biên) | G1, I12 (16:59) rồi I13 (17:00) | Mở | 16:59 → Đang; 17:00 → Ngoài | PW | 1280 | Sau T05 |
| F02-RG-05 | BR-2 (biên) | G1, nửa đêm: Thứ Hai 00:00 (2026-10-11T17:00:00Z), Thứ Hai 23:59 (2026-10-12T16:59:00Z), Thứ Ba 00:00 (2026-10-12T17:00:00Z) | Mở từng mốc | Đều "Ngoài giờ"; không lệch ngày; Chủ nhật 23:59 → Ngoài | PW | 1280 | Sau T05 |
| F02-RG-06 | BR-2 | VT `gioLamViec.test.ts` | Chạy với `TZ=Asia/Ho_Chi_Minh`, `America/Los_Angeles`, `Pacific/Auckland` | `thoiDiemVietNam('2026-10-12T03:00:00Z')` → thứ 1, 600 phút; `'2026-10-11T23:30:00Z'` → thứ 1, 390 phút; `'2026-10-11T17:00:00Z'` → thứ 1, 0 phút — giống nhau ở cả ba | VT (rà) | — | Sau T02 |

## 3. Giờ Việt Nam khi máy khách đặt múi giờ khác (BR-2; AC-2, AC-7)

Mỗi ca tạo `browser.newContext({ timezoneId })` rồi giả `clock` đúng mốc UTC. Kết quả không được đổi theo múi giờ máy.

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-MG-01 | AC-2 | G1; `timezoneId` ∈ {`Asia/Ho_Chi_Minh`, `UTC`, `America/New_York`, `America/Los_Angeles`, `Pacific/Auckland`, `Pacific/Kiritimati` (UTC+14), `Asia/Kolkata` (UTC+5:30), `Pacific/Pago_Pago` (UTC−11)} | Với mỗi múi giờ mở `/` ở mốc I1 | "Đang trong giờ làm việc" ở **cả 8** múi giờ | PW | 1280 | Sau T05 |
| F02-MG-02 | AC-2 | Như trên | Mốc I2 (Thứ Hai 12:00 VN) | "Ngoài giờ làm việc" ở cả 8 múi giờ | PW | 1280 | Sau T05 |
| F02-MG-03 | AC-2 | Như trên (G1) | Mốc I3 | "Ngoài giờ làm việc" ở cả 8 (Thứ Bảy theo giờ VN; ở `Pago_Pago` giờ máy vẫn là thứ Sáu) | PW | 1280 | Sau T05 |
| F02-MG-04 | AC-7 | G2, các múi giờ như MG-01 | Mốc I3 và I4, I5 | I3 "Đang"; I4 "Ngoài"; I5 "Ngoài" ở cả 8 múi giờ | PW | 1280 | Sau T05 |
| F02-MG-05 | BR-2 (biên) | G1, `America/Los_Angeles` | Mốc I1 (ở máy là **Chủ nhật** 20:00 PDT) | Vẫn "Đang trong giờ làm việc" (không dùng ngày/giờ của máy) | PW | 1280 | Sau T05 |
| F02-MG-06 | BR-2 (biên) | G1, `Pacific/Kiritimati` | Mốc I6 (Thứ Hai 06:59 VN = Thứ Hai 13:59 máy) | "Ngoài giờ làm việc" (máy ở giờ làm việc nhưng VN chưa) | PW | 1280 | Sau T05 |
| F02-MG-07 | BR-2 (biên) | G1, `Asia/Kolkata` (+5:30) | Mốc I8 rồi I9 | 11:29 VN "Đang"; 11:30 VN "Ngoài" (lệch nửa giờ không ảnh hưởng) | PW | 1280 | Sau T05 |
| F02-MG-08 | BR-2 (biên) | G1, `Pacific/Auckland`, ngày đổi sang giờ mùa hè | Mốc I15 | "Đang trong giờ làm việc" | PW | 1280 | Sau T05 |
| F02-MG-09 | BR-2 (biên) | G1, `America/New_York`, ngày hết giờ mùa hè | Mốc I16 | "Đang trong giờ làm việc" | PW | 1280 | Sau T05 |
| F02-MG-10 | BR-2 | Giờ hiển thị trong dòng giờ ("07:00 – 11:30") | Đổi múi giờ máy | Giờ trong khối là nguyên văn dữ liệu (`HH:mm` của Việt Nam), **không** đổi theo múi giờ máy | PW | 1280 | Sau T05 |
| F02-MG-11 | BR-2 | Máy đặt `locale` `en-US`, `ar` (số Ả Rập), `ja-JP` | Mở | Giờ và nhãn không dùng `toLocale…`; số vẫn dạng "07:00"; nhãn tiếng Việt | PW | 1280 | Sau T05 |
| F02-MG-12 | BR-2 | VT, `TZ=...` đổi bằng biến môi trường | Chạy toàn bộ `gioLamViec.test.ts` ở ba `TZ` | Cùng kết quả; không phụ thuộc `Date` cục bộ | VT (rà) | — | Sau T02 |

## 4. Gộp ngày liền nhau có cùng giờ (BR-8; AC-9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-GD-01 | AC-9, BR-8 | G2 | Đếm dòng trong khối giờ | **Đúng 2 dòng**: "Thứ Hai – Thứ Sáu" kèm "Buổi sáng 07:00 – 11:30" và "Buổi chiều 13:30 – 17:00"; "Thứ Bảy" kèm "Buổi sáng 07:00 – 11:30" (không "Buổi chiều") | PW | 1280, 375 | Sau T05 |
| F02-GD-02 | AC-9 | G2 | Tìm "Chủ nhật" | Không có dòng Chủ nhật | PW | 1280 | Sau T05 |
| F02-GD-03 | AC-9 | G1 | Đếm dòng | **Đúng 1 dòng** "Thứ Hai – Thứ Sáu" | PW | 1280 | Sau T05 |
| F02-GD-04 | BR-8 | G3 (thiếu Thứ Tư) | Đếm dòng | 2 dòng: "Thứ Hai – Thứ Ba" và "Thứ Năm – Thứ Sáu" (ngày nghỉ chen giữa cắt nhóm; hai ngày liền nhau gộp bằng "–") | PW | 1280 | Sau T05 |
| F02-GD-05 | BR-8 | G4 (Thứ Hai và Chủ nhật cùng giờ) | Đếm dòng | 2 dòng: "Thứ Hai" và "Chủ nhật" (không nối vòng tuần) | PW | 1280 | Sau T05 |
| F02-GD-06 | BR-8 | G9 (dữ liệu không theo thứ tự `thu`) | Đọc | Vẫn gộp đúng "Thứ Hai – Thứ Sáu" một dòng; dòng sắp theo thứ trong tuần | PW | 1280 | Sau T05 |
| F02-GD-07 | BR-8 | G7 (mỗi ngày khác giờ) | Đếm dòng | 7 dòng, mỗi ngày một dòng; ở 375 không tràn ngang; đọc được | PW | 375, 1280 | Sau T05 |
| F02-GD-08 | BR-8 | G8 (chỉ chiều) | Đọc | Dòng chỉ có "Buổi chiều 13:30 – 17:00", không "Buổi sáng" | PW | 1280 | Sau T05 |
| F02-GD-09 | BR-8 | Một ngày một buổi, một ngày hai buổi, cùng ngày kề nhau | Đọc | Hai ngày khác buổi **không** gộp | PW | 1280 | Sau T05 |
| F02-GD-10 | BR-8 | VT `gopNgay` | Chạy | Rỗng → mảng rỗng; giờ nguyên văn `HH:mm` (không rút "7:00"); gộp chỉ khi cả hai buổi trùng từng giá trị | VT (rà) | — | Sau T02 |
| F02-GD-11 | BR-1, BR-8 | PostgreSQL; nhập file giờ mới (thêm Thứ Bảy sáng); **không** sửa code | Tải lại `/` | Khối đổi theo: thêm dòng "Thứ Bảy" | PW | 1280 | Chờ F01 T07 |
| F02-GD-12 | BR-1 | Mã nguồn | `grep -rn "07:00\|11:30\|13:30\|17:00" src/features/trang-chu` (trừ test) | Không giờ làm việc viết cứng | SH | — | Sau T05 |

## 5. Đồng hồ khi trang mở lâu (plan §4.4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-DH-01 | BR-2 | G1, `clock` Thứ Hai 11:28:30 (2026-10-12T04:28:30Z); mở `/` | Đọc nhãn; `clock.fastForward(60 s)` đọc; thêm `fastForward(60 s)` đọc | "Đang" → "Đang" (11:29:30) → **"Ngoài"** (11:30:30) mà không tải lại trang; số yêu cầu mạng không tăng | PW (`page.clock`) | 1280 | Sau T05 |
| F02-DH-02 | BR-2 | G1, 12:59:30 → 13:30:30 | Tua | "Ngoài" → "Đang" khi qua 13:30, không tải lại | PW | 1280 | Sau T05 |
| F02-DH-03 | BR-2 | G1, tab ẩn: giả `document.visibilityState = hidden`; tua 3 giờ (qua 17:00); bật lại `visible` + phát `visibilitychange` | Đọc | Cập nhật **ngay** khi tab hiện lại (không chờ bộ đếm 60 giây) | PW | 1280 | Sau T05 |
| F02-DH-04 | BR-2 | G1; từ `/` sang `/thu-tuc` rồi về `/`; đếm bộ đếm | Theo dõi `setInterval` (hook `clock`) | Rời trang chủ thì gỡ bộ đếm và trình nghe; không rò; chỉ khối giờ vẽ lại mỗi phút, khối thường gặp (F03) không vẽ lại | PW + VT (rà) | 1280 | Sau T05 |
| F02-DH-05 | BR-2 (kiosk) | `/?kiosk=1`, G1, để yên 15 phút (tua `clock`) | Đọc nhãn khi qua mốc 11:30 | Đổi nhãn không cần tải lại (kiosk không tự làm mới — F09 BR-2); popup/khung trợ lý nếu đang mở còn nguyên | PW | K | Sau T05 |
| F02-DH-06 | plan §4.4 | G1 | Đọc `aria-live` của nhãn | Nhãn trạng thái **không** là vùng `aria-live` (không đọc tự động mỗi lần đổi) | PW | 1280 | Sau T05 |

## 6. Banner và bố cục trang (phạm vi; BR-5)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-BN-01 | Mục tiêu | TT-A | Mở `/` | Đúng một `h1` = "Trung tâm thử A"; dòng nhỏ "UBND phường thử B"; một câu mô tả cố định ("Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.") | PW | 1280, 375 | Sau T05 |
| F02-BN-02 | Mục tiêu | TT-B (cơ quan chủ quản trống) | Mở | Không có dòng cơ quan, không khoảng trống thừa; `h1` đúng | PW | 1280, 375 | Sau T05 |
| F02-BN-03 | Mục tiêu (biên) | TT-C (tên 200 ký tự, cơ quan 120) | Mở ở 375 và 1280 | Tên xuống dòng; không tràn, không cuộn ngang; các khối bên dưới không bị che; CLS ≤ 0,05 khi dữ liệu về | PW | 375, 1280 | Sau T05 |
| F02-BN-04 | Mục tiêu (HTML) | TT-D | Mở; `dialog` | Tên và cơ quan hiện nguyên văn dạng chữ; không `<b>`, `<script>` sinh ra; 0 hộp thoại | PW | 1280 | Sau T05 |
| F02-BN-05 | Mục tiêu | API 500 / 404 | Mở | `h1` dự phòng "Tra cứu thủ tục hành chính" (không ẩn `h1`) | PW | 1280 | Sau T05 |
| F02-BN-06 | Mục tiêu | API trễ 5 giây | Mở | Câu mô tả hiện ngay khi chunk về (không chờ API); tên/cơ quan là khối giữ chỗ `aria-hidden` rồi chữ thật | PW | 375 | Sau T05 |
| F02-BN-07 | BR-5 | Bản build | Đếm request ảnh khi mở `/` | 0 ảnh trong banner (chưa có ảnh trụ sở: banner chữ trên nền gradient); BR-5 ("ảnh không làm chậm") được thoả vì không có ảnh | PW | 375, 1280 | Sau T05 |
| F02-BN-08 | BR-5 (khi có ảnh) | Chỉ khi Trung tâm cung cấp ảnh banner | Mở; đo | Ảnh WebP/AVIF ≤ 150 KB, khai `width`/`height`, khung giữ chỗ cố định; LCP không chờ ảnh; Lighthouse ≥ 85 | LH + PW | 375 | **Chờ ảnh banner** (chưa có task) |
| F02-BN-09 | Mục tiêu | Mọi khổ | Đo tương phản chữ trắng trên gradient (từ `--color-primary-strong` đến `--color-primary`) tại điểm sáng nhất | ≥ 4,5:1 (chữ nhỏ), ≥ 3:1 (chữ lớn) | AX + PW | 375, 1280 | Sau T05 |
| F02-BN-10 | Mục tiêu | `grep` mã CSS/TSX của banner | `grep -rnE "#[0-9a-fA-F]{3,8}\|rgb\(" src/features/trang-chu` | Không màu viết cứng; gradient dùng token | SH | — | Sau T05 |
| F02-BN-11 | Mục tiêu (ghi nhận) | TT-A | Đọc đầu trang (F08) và `h1` banner | Tên Trung tâm xuất hiện hai lần (đầu trang + `h1`) — đúng prototype; người dùng trình đọc màn hình nghe hai lần; ghi nhận rủi ro 7 | PW | 1280 | Sau T05 |
| F02-BC-01 | Mục tiêu | TT-A, G2, O6g, T43 (F03) | Đọc thứ tự DOM | Banner → Dịch vụ nhanh → Thủ tục thường gặp → Thời gian làm việc | PW | 1280, 375 | Chờ F03 |
| F02-BC-02 | Mục tiêu | Như trên | Đếm tiêu đề | Đúng 1 `h1`; ba `h2`: "Dịch vụ nhanh" (ẩn chữ), "Thủ tục thường gặp" (F03), "Thời gian làm việc"; không nhảy cấp | PW + AX | 1280 | Chờ F03 |
| F02-BC-03 | Ngoài phạm vi | TT-A | Đếm số lần địa chỉ, điện thoại, email trên toàn trang | Mỗi thứ đúng **1 lần** (trong chân trang); không khối liên hệ riêng ở trang chủ | PW | 1280 | Sau T05 |
| F02-BC-04 | Ngoài phạm vi | TT-A | Tìm khối mạng xã hội, lịch hành chính lưu động, thống kê, nút chữ lớn, nút đọc to ở nội dung | Không có | PW | 1280 | Sau T05 |
| F02-BC-05 | Mục tiêu (lối vào) | TT-A | Tìm lối vào F04, F05, F06 | Điều hướng có "Danh mục thủ tục", "Lĩnh vực và mã QR" (F08); nút nổi "Trợ lý" (C01 BR-13, F06); trang chủ không lặp lối vào riêng | PW | 1280, 375 | Sau T05 (nút Trợ lý **Chờ F06**) |
| F02-BC-06 | Phạm vi | T0 (không thủ tục thường gặp) | Mở | Không khoảng trống chỗ khối thường gặp; ô dịch vụ và giờ vẫn liền nhau | PW | 1280 | Chờ F03 |
| F02-BC-07 | Phạm vi | Chặn `/api/thu-tuc` (500) | Mở | Khối thường gặp có `ErrorState` riêng; ô dịch vụ, giờ làm việc, banner vẫn bình thường | PW | 1280 | Chờ F03 |
| F02-BC-08 | Phạm vi | Chặn `/api/trung-tam` (500) | Mở | Banner `h1` dự phòng; ô dịch vụ `ErrorState` (duy nhất); giờ làm việc ẩn; khối thường gặp vẫn hiện | PW | 1280 | Chờ F03 |
| F02-BC-09 | Phạm vi | `/?ma=1.001193` | Mở | Popup do F03 mở; F02 không mount thêm dialog (đúng 1 `role=dialog`); ô dịch vụ ở nền bị vô hiệu theo popup | PW | 1280 | Chờ F03 |
| F02-BC-10 | Phạm vi | Tab từ đầu trang | Thứ tự Tab | Bỏ qua → thương hiệu → điều hướng → 4 ô có link → (khối thường gặp) → chân trang; hai ô thường không dừng; thứ tự DOM = Tab = đọc | PW | 1280, 375 | Sau T05 |
| F02-BC-11 | Phạm vi | Khoảng cách giữa khối | Đo | Dùng token (`--space-5/6`); không chồng khối ở 375 và 1280 | PW | 375, 1280 | Sau T05 |

## 7. Đang tải, lỗi (F08 BR-11, C01 BR-11)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-TL-01 | F08 BR-11 | `/api/trung-tam` trễ 5 giây | Mở `/` | Đầu/chân trang hiện ngay; banner câu mô tả hiện; ô dịch vụ là `Skeleton` 6 khối ("Đang tải…" cho trình đọc màn hình); dải giờ có tiêu đề và khung giữ chỗ; sau 5 giây thay bằng nội dung | PW | 375, 1280 | Sau T05 |
| F02-TL-02 | C01 AC-19 | `/api/trung-tam` 500 rồi 200 | Mở; bấm "Thử lại" ở khối ô dịch vụ | `ErrorState` đúng **một** chỗ (khối ô dịch vụ); "Thử lại" làm mới khoá `trung-tam` (đầu/chân trang cũng làm mới); sau đó đủ nội dung | PW | 1280, 375 | Sau T05 |
| F02-TL-03 | B6 | `/api/trung-tam` 500 | Đếm `ErrorState` | Đúng 1 (không ba thông báo lỗi liền nhau); khối giờ ẩn; banner `h1` dự phòng | PW | 1280 | Sau T05 |
| F02-TL-04 | B6 | `/api/trung-tam` 404 `khong-tim-thay` (chưa nhập Trung tâm) | Mở | Như TL-03; câu lỗi theo `code`; không "undefined"/"null"/mã HTTP | PW | 1280 | Sau T05 |
| F02-TL-05 | B6 | 429 `qua-nhieu-yeu-cau` | Mở | Như TL-03, câu quá nhiều yêu cầu; sau 1 phút "Thử lại" thành công | PW | 1280 | Sau T05 |
| F02-TL-06 | F08 AC-11 | Mất mạng (offline) sau khi đã tải xong | Bấm vào trang khác rồi về `/`, tắt mạng, "Thử lại" | `ErrorState` mất kết nối; số điện thoại có (đã từng tải); bật mạng, "Thử lại" ra nội dung | PW | 1280 | Sau T05 |
| F02-TL-07 | BR-1 | `oDichVu: []`, `gioLamViec: []`, các trường khác ổn | Mở | Trang không lỗi; khối ô chỉ có `h2` ẩn; khối giờ ẩn; banner đầy đủ | PW | 1280 | Sau T05 |
| F02-TL-08 | F08 BR-11 | Chunk trang chủ lỗi tải (chặn `assets/*TrangChu*.js`) | Mở | `LoiTrang` trong vùng nội dung; đầu/chân trang còn; "Thử lại" tải lại | PW | 1280 | Sau T05 |
| F02-TL-09 | plan §3 | Dữ liệu `gioLamViec` chứa trường lạ / thiếu khoá (`sangTu` undefined) | Mở | Không ném lỗi; coi buổi đó không hợp lệ | PW | 1280 | Sau T05 |
| F02-TL-10 | plan §3 | `ghiChuNgayNghi` rất dài (500 ký tự) và chứa `<script>` | Mở | Xuống dòng, không tràn; hiện chữ nguyên văn | PW | 375 | Sau T05 |

## 8. Kiosk (F09) — phần của F02

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-KS-01 | C01 AC-2 | `/?kiosk=1`, 1080×1920, TT-A, G2, O6g | Mở | Chữ và ô lớn theo kiosk; lưới ô không cắt chữ; không cuộn ngang; dải giờ đọc được | PW | K | Sau T05 |
| F02-KS-02 | F09 BR-4 | Kiosk, O6g (có ô tới `dichvucong.gov.vn`) | Xem phía trên lưới ô | Có đúng một dòng "Nhớ đăng xuất khi dùng xong" ngay trên lưới ô (F09); không lặp trên từng ô | PW | K | Chờ F09 |
| F02-KS-03 | F09 BR-4 | Kiosk, O6g chỉ gồm ô không link tới Cổng DVC (giả) | Xem | Không dòng nhắc (chỉ khi có ít nhất một ô tới `dichvucong.gov.vn`) | PW | K | Chờ F09 |
| F02-KS-04 | F09 BR-2 | Kiosk | Xem DH-05 | Trạng thái giờ đúng sau khi để yên | PW | K | Sau T05 |
| F02-KS-05 | C01 AC-24 | Kiosk, mở popup (F03) bằng bàn phím | Tab liên tục | Vòng Tab có "Bắt đầu lại" cuối vòng | PW | K | Chờ F03, F09 |
| F02-KS-06 | C01 AC-2 | Kiosk | Đo kích thước chạm ô, nhãn | Lớn theo kiosk (≥ 56 px nếu design-system nêu) | PW | K | Sau T05 |

## 9. Trợ năng (WCAG 2.1 AA)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-TN-01 | C01 AC-4 | TT-A, G2, O6g | Chạy axe ở `/` | 0 vi phạm (tương phản banner và dải giờ, tên liên kết, landmark, thứ tự tiêu đề) | AX | 375, 1280, K | Sau T05 |
| F02-TN-02 | C01 AC-4 | Các trạng thái: đang tải, lỗi, giờ ẩn, `oDichVu` rỗng | Chạy axe | 0 vi phạm | AX | 375, 1280 | Sau T05 |
| F02-TN-03 | WCAG 1.4.1 | Nhãn trạng thái giờ | Xem ở chế độ đen trắng (`filter: grayscale(1)`) | "Đang"/"Ngoài" phân biệt được nhờ icon và chữ, không chỉ màu | PW + TAY | 1280 | Sau T05 |
| F02-TN-04 | C01 AC-1 | Bàn phím | Tab qua trang chủ | Tới được 4 ô có link; Enter mở tab mới; viền focus nhìn thấy (kể cả trên nền xanh của dải giờ nếu có phần tử focus) | PW | 1280, 375 | Sau T05 |
| F02-TN-05 | plan §4.2 | Landmark | Đếm `section` có `aria-labelledby`; `nav` | Mỗi khối là `section` có tiêu đề; không `nav` thứ hai trong nội dung (đã có nav chính) | PW | 1280 | Sau T05 |
| F02-TN-06 | AC-8 | NVDA / TalkBack | Duyệt ô dịch vụ, khối giờ | Ô đọc tên; ô có link đọc "liên kết (mở trang mới)"; khối giờ đọc tiêu đề "Thời gian làm việc", nhãn trạng thái, từng dòng | TAY | 375, 1280 | Sau T05 |
| F02-TN-07 | WCAG 1.4.10 | 320×568, phóng 200% | Xem trang chủ (TT-C, G7, OD) | Không cuộn ngang; không mất nội dung | PW | 320 | Sau T05 |
| F02-TN-08 | WCAG 1.4.12 | CSS giãn chữ | Xem banner, ô, dải giờ | Không cắt, không chồng | PW | 375, K | Sau T05 |
| F02-TN-09 | WCAG 2.5.3 | Tên ô có link | Tên đọc chứa chữ nhìn thấy | Đúng ("Tra cứu hồ sơ" nằm trong tên đọc "Tra cứu hồ sơ (mở trang mới)") | PW | 1280 | Sau T05 |
| F02-TN-10 | C01 BR-1 | Chế độ giảm chuyển động | Mở trang, tua đồng hồ | Không hiệu ứng chạy liên tục; cập nhật nhãn không nhấp nháy | PW | 1280 | Sau T05 |
| F02-TN-11 | WCAG 1.4.3 | Dải giờ nền `--color-primary-strong` | Đo tương phản chữ trắng, nhãn `Badge` success/neutral trên nền xanh | ≥ 4,5:1 | AX | 1280 | Sau T05 |
| F02-TN-12 | WCAG 2.4.1 | Liên kết "Bỏ qua, tới nội dung chính" | Tab đầu, Enter | Con trỏ vào `main`, Tab tiếp rơi vào phần tử tương tác đầu của trang chủ (ô dịch vụ đầu có link) | PW | 1280 | Sau T05 |
| F02-TN-13 | WCAG 2.5.8 | 375 | Kích thước chạm ô | ≥ 44×44 px | PW | 375 | Sau T05 |
| F02-TN-14 | WCAG 1.3.1 | Khối giờ | Cấu trúc | Dòng giờ là danh sách / bảng có nhãn; "Thứ Hai – Thứ Sáu" gắn với "Buổi sáng …" (đọc đúng cặp) | PW + TAY | 1280 | Sau T05 |

## 10. Bảo mật (CLAUDE.md > Bảo mật)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-BM-01 | CLAUDE.md > Header | Bản build, HTTPS | `curl -sI` tại `/`, `/api/trung-tam`, `/assets/<js>` | Đủ CSP nguyên văn, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: microphone=(), camera=(), geolocation=()`; **không** `Server`, `X-Powered-By` (F08-BM-01…02) | CURL | — | Sau T05 |
| F02-BM-02 | CLAUDE.md | TT-A, G2, O6g | Mở `/`, tua đồng hồ, bấm ô, đổi dạng; bắt `console` và `securitypolicyviolation` | 0 vi phạm CSP, 0 `console.error`; không script/style inline do trang chủ sinh | PW | 375, 1280 | Sau T05 |
| F02-BM-03 | CLAUDE.md > Tài nguyên tự host | Như trên | `page.on('request')` suốt luồng (không bấm ô) | Mọi request cùng gốc; **không** request tự gọi ra tên miền ngoài (không ảnh, không font, không CDN); chỉ `/api/trung-tam` (dùng chung với `Layout`: đúng 1 lần) | PW | 1280 | Sau T05 |
| F02-BM-04 | C01 BR-3 | Mọi ô có link | `rel` | Cả `noopener` và `noreferrer`; `target="_blank"`; ô thường không `target`, không `rel` | PW | 1280 | Sau T05 |
| F02-BM-05 | plan §6 | OE (`javascript:`, `data:`, `//evil.example`…) | Xem DV-17 | Không `href` nguy hiểm trong DOM; bấm không chạy mã | PW | 1280 | Sau T05 |
| F02-BM-06 | plan §6 | TT-D, OE (HTML), `ghiChuNgayNghi` HTML | Mở; `dialog` | Mọi chữ từ dữ liệu hiện nguyên văn dạng chữ; DOM không có thẻ sinh từ dữ liệu; 0 hộp thoại | PW | 1280 | Sau T05 |
| F02-BM-07 | CLAUDE.md > Không `dangerouslySetInnerHTML` | `src/features/trang-chu` | `grep -rn "dangerouslySetInnerHTML\|innerHTML"`; `npm run lint` | 0; lint sạch (kể cả quy tắc i18n) | SH | — | Sau T05 |
| F02-BM-08 | plan §6 | `GET /api/trung-tam` | So tập khoá JSON | Chỉ trường của F08 §3.1; không `maDonViCongDvc`, `id`, `thuTu`, `tenFile`; nếu có `moTa` thì không hiện trên trang (F08-BM-07) | XU / CURL | — | Sau T05 |
| F02-BM-09 | plan §6 | Đồng hồ máy khách | Sửa giờ máy 3 giờ | Chỉ ảnh hưởng nhãn hiển thị; không gửi giờ máy đi đâu (không request mới); không quyết định quyền gì | PW | 1280 | Sau T05 |
| F02-BM-10 | CLAUDE.md > Mã nguồn | Bản build | `find wwwroot -name '*.map'`; `grep -rl sourceMappingURL wwwroot`; tên hàm dự án (`gopNgay`, `dangLamViec`, `thoiDiemVietNam`) trong chunk `TrangChu` | Không `.map`, không `.pdb`; tên định danh dự án đã bị đổi | SH | — | Sau T05 |
| F02-BM-11 | CLAUDE.md > Thư viện | Cuối F02 | `npm audit --omit=dev`; `dotnet list package --vulnerable`; so `package.json` | Không High/Critical; F02 không thêm gói (plan §1) | SH | — | T08 |
| F02-BM-12 | CLAUDE.md > API | `GET /api/trung-tam` ×350 trong 1 phút từ một IP | Gửi | Từ yêu cầu 301: 429 `qua-nhieu-yeu-cau` + `Retry-After`; trong lúc 429 mở `/` → trang HTML vẫn mở, `ErrorState` nhã nhặn (F08-BM-11, BM-12) | XU / PW | 1280 | Sau T05 |
| F02-BM-13 | CLAUDE.md > Dữ liệu | Log ứng dụng khi lỗi | Gây lỗi DB giả | API 500 `loi-he-thong` + `maTraCuu`, không chuỗi kết nối; trang chủ hiện `ErrorState` (F08-BM-16) | XU | — | T08 |
| F02-BM-14 | plan §6 (BR-6) | Dữ liệu thật và nguồn Mẫu | So `href` ô dịch vụ và chân trang | Không tên miền "Đã bỏ" (DV-06); kiểm lại sau mỗi lần nhập file | PW | 1280 | T08 |

## 11. Hiệu năng (CLAUDE.md > Hiệu năng; F00 BR-9; AC-4)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-HN-01 | AC-4, F00 BR-9 | `npm run build` | Mở `/` ở 375; ghi mọi `.js`; `gzip -9` từng tệp; cộng; so trước/sau F02 | Tổng ≤ **200 KB gzip** (nền ~143,6–147 KiB trước F02); phần F02 ≤ **10 KB gzip**; báo bảng từng chunk | SH + PW | 375, 1280 | Sau T05 |
| F02-HN-02 | AC-4 | Như trên, sau khi ghép F03 | Đo lại | Tổng ≤ 200 KB gzip (F03 ước +20…28 KB); chunk trang chủ > 30 KB gzip → báo | SH + PW | 375, 1280 | Chờ F03 (T10) |
| F02-HN-03 | AC-4 | Bản `dotnet publish -c Release`, nguồn Mẫu | Lighthouse mobile `/` ×3 (chưa có F03) | Performance ≥ **85**; CLS < 0,1 (mục tiêu ≤ 0,05) | LH | 375 | Sau T05 |
| F02-HN-04 | AC-4 | Như trên, sau khi ghép F03 | Lighthouse mobile `/` ×3 | ≥ 85; CLS < 0,1 (trang chủ tải cả danh mục cho khối F03 — nếu < 85, báo phương án `?thuongGap=1`) | LH | 375 | Chờ F03 (T10) |
| F02-HN-05 | plan §5 (CLS) | API thật; và API trễ 5 giây; TT-A, TT-B, TT-C | Đo Layout Instability (PerformanceObserver) khi mở `/` | CLS ≤ 0,05 ở 375 và 1280 trong cả bốn tổ hợp (API thật/trễ × `coQuanChuQuan` có/trống/tên dài); lưới ô giữ chỗ cao bằng ô thật (kể cả tên hai dòng, dòng "Trang ngoài"); dải giờ giữ chỗ | PW | 375, 1280 | Sau T05 |
| F02-HN-06 | plan §5 (CLS) | G1 (1 dòng) vs G7 (7 dòng) | Đo CLS khi dải giờ có số dòng khác nhau | Dịch chuyển do số dòng giờ chỉ xảy ra dưới màn hình đầu (hoặc ≤ 0,1); ghi số đo (rủi ro 3) | PW | 375, 1280 | Sau T05 |
| F02-HN-07 | plan §5 | Bản build | Đọc LCP | Phần tử LCP là chữ của banner (câu mô tả cố định) hiện ngay khi chunk về, không chờ API; LCP < 2,5 giây trên 4G giả lập | PW (PerformanceObserver) + LH | 375 | Sau T05 |
| F02-HN-08 | plan §3, §5 | `/` | Đếm yêu cầu tới `/api/*` | `/api/trung-tam` đúng 1 lần (khoá `trung-tam` dùng chung với `Layout`); F02 không thêm API | PW | 1280 | Sau T05 |
| F02-HN-09 | F00 BR-9 | Nguồn Mẫu | 100 lần `GET /api/trung-tam` tuần tự; p95 | p95 ≤ **300 ms** (kể cả 304 và 200) (F08-HN-04) | XU / script | — | Sau T05 |
| F02-HN-10 | plan §5 | Mạng chậm 3G | FCP / FMP đầu trang | Đầu trang và banner hiện trước khi API về; ghi số đo | PW | 375 | Sau T05 |
| F02-HN-11 | plan §5 (không ảnh, font) | Mở `/` | Đếm request ảnh, font | 0 do F02 gây ra | PW | 1280 | Sau T05 |
| F02-HN-12 | plan §4.4 | Trang mở 10 phút (đồng hồ giả) | Đo số lần vẽ lại, TBT | Một lần vẽ lại khối giờ mỗi phút; không vẽ lại cả trang; không tăng bộ nhớ đều (heap) | PW (CDP) | 1280 | Sau T05 |
| F02-HN-13 | F00 BR-9 | Lighthouse | Kiểm lệnh "Preload", "unused JS" | Chunk Trợ lý/QR/đọc câu trả lời không tải khi mở `/` (nạp lười, F00 BR-9) | PW | 375 | Sau T05 |
| F02-HN-14 | TT 22/2023 (F00 BR-9) | 100 Mbps | Nội dung đầu < 3 giây, nội dung lớn nhất < 4 giây, tải đủ < 5,8 giây, mỗi yêu cầu < 0,6 giây | Đạt (ghi số đo) | PW | 1280 | T08 |

## 12. Hai nguồn dữ liệu và tích hợp (F00 §9)

| Mã | AC / BR | Tiền điều kiện · dữ liệu | Bước | Kết quả mong đợi | Cách kiểm | Khổ | Khi chạy |
|---|---|---|---|---|---|---|---|
| F02-HD-01 | AC-6 | Nguồn Mẫu (profile `https`) | `GET /api/trung-tam`; mở `/` | `oDichVu` có 6 ô theo thứ tự `lien-ket.md` §1 (ghi lệch nếu dữ liệu nhúng khác); `gioLamViec` Thứ Hai – Thứ Sáu 07:00–11:30 và 13:30–17:00 (giờ tạm) | PW + CURL | 1280 | Sau T05 |
| F02-HD-02 | AC-6, F08 | PostgreSQL; nhập bộ A, O6, G1 | Mở `/` ở hai nguồn | Cùng 6 ô và cùng giờ; so `innerText` khối ô và khối giờ | PW | 1280 | Chờ F01 T07 |
| F02-HD-03 | AC-3 | PostgreSQL; nhập lại file có ô mới | Gọi `/api/trung-tam` trước/sau; gửi `If-None-Match` cũ | Dữ liệu mới ngay (F00 BR-10); `ETag` đổi; `If-None-Match` cũ nhận 200 (F08-IT-04) | XU | — | Chờ F01 T07 |
| F02-HD-04 | AC-7, BR-1 | PostgreSQL; nhập giờ mới (thêm Thứ Bảy sáng) | Tải lại `/` | Dòng "Thứ Bảy" xuất hiện; 09:00 Thứ Bảy → "Đang" (mốc I3) | PW | 1280 | Chờ F01 T07 |
| F02-HD-05 | BR-1 | PostgreSQL; nhập giờ có ngày nghỉ chen giữa | Tải lại | Hai nhóm dòng như GD-04 | PW | 1280 | Chờ F01 T07 |
| F02-HD-06 | F01 | Công cụ nhập: giờ buổi hỏng ("25:00", đầu ≥ cuối) | Nhập | F01 từ chối theo AC của F01 (lỗi rõ); nếu lọt, F02 bỏ qua buổi hỏng (GL-14) | XU | — | Chờ F01 T07 |
| F02-HD-07 | F08 | `GET /api/trung-tam` | Giờ trả về | Định dạng `HH:mm`; chỉ ngày làm việc; `thu` 1–7 (F08 §2) | XU | — | Sau T05 |
| F02-HD-08 | F00 BR-16 | Chế độ demo | Nhập lại | Không nhập được; trang chủ luôn dữ liệu nhúng | XU | — | T08 |
| F02-HD-09 | F00 §9 | Bộ ca E2E nhóm DV, GL, GD, BN trên hai profile | So kết quả | Cùng kết quả khi dữ liệu nhập giống nhau | PW | 1280 | T08 + F01 |
| F02-HD-10 | F00 BR-16 | PostgreSQL ngừng | Mở `/` | Trang HTML vẫn mở; `ErrorState` ở ô dịch vụ; banner dự phòng (F08-IT-05) | XU + PW | 1280 | T08 |

## 13. Truy vết

| Spec | Ca kiểm |
|---|---|
| BR-1 | F02-DV-04, DV-07, DV-21, DV-22, GD-11, GD-12, HD-01…05 |
| BR-2 | F02-GL-01…03, GL-10, GL-13…16, RG-01…06, MG-01…12, DH-01…06 |
| BR-3 | F02-GL-07…09, GL-17 |
| BR-4 | F02-DV-01…03, DV-11…17, DV-19, BM-04, BM-05 |
| BR-5 | F02-BN-07, BN-08 |
| BR-6 | F02-DV-06, DV-18, BM-14 |
| BR-7 | F02-GL-04, GL-05, GL-11, GL-12, GD-01 |
| BR-8 | F02-GD-01…12 |
| AC-1 | F02-DV-01…03 |
| AC-2 | F02-GL-01…03, MG-01…03, RG-01…05 |
| AC-3 | F02-DV-07…10, HD-03 |
| AC-4 | F02-HN-01…04 |
| AC-5 | F02-GL-07…09 |
| AC-6 | F02-DV-04…06, HD-01, HD-02 |
| AC-7 | F02-GL-04…06, MG-04, HD-04 |
| AC-8 | F02-DV-11…16, TN-06 |
| AC-9 | F02-GD-01…03 |
| Mục tiêu / Phạm vi | F02-BN-01…11, BC-01…11, TL-01…10 |
| Chạy đúng khi máy khách đặt múi giờ khác | F02-MG-01…12, RG-06 |
| Cập nhật khi trang mở lâu (kiosk) | F02-DH-01…06, KS-04 |
| Hiệu năng (F00 BR-9) | F02-HN-01…14 |
| Hai nguồn dữ liệu | F02-HD-01…10 |
| Bảo mật (CLAUDE.md) | F02-BM-01…14 |
| Trợ năng | F02-TN-01…14 |

## 14. Tóm tắt

- **Số ca**: nhóm DV 23 · GL 18 · RG 6 · MG 12 · GD 12 · DH 6 · BN 11 · BC 11 · TL 10 · KS 6 · TN 14 · BM 14 · HN 14 · HD 10 = **167 ca**. Mỗi BR (1…8) và mỗi AC (1…9) có ít nhất một ca.
- **Chạy ngay (không chờ F03)**: gần hết sau T05 — hàm thuần ở VT (T02), ô dịch vụ (T03), khối giờ (T04), banner (T05).
- **Chờ chức năng khác**: F03 T07 và F02 T09 (BC-01, BC-02, BC-06…BC-09, KS-05, HN-02, HN-04); F01 T07 (DV-05, DV-07, GD-11, HD-02…06); F09 (KS-02, KS-03); F06 (nút Trợ lý trong BC-05); ảnh banner (BN-08 — chưa có task).
- **AC khó kiểm tự động**: AC-8 (đọc "không phải liên kết" cần NVDA/TalkBack — thử tay DV-16, TN-06); AC-3 và AC-6 phần "nhập lại, không sửa code" (cần F01 và PostgreSQL); AC-4 (Lighthouse, CLS cần bản `Release` và đo 3 lần); chạy đúng giờ ở nhiều múi giờ (phải giả `clock` + `timezoneId` đúng cách, dễ sai lệch nếu `page.clock.install` gọi sau khi trang mở); trang mở lâu trên kiosk thật (chỉ giả được bằng đồng hồ giả).
- **Chỗ spec/plan còn mơ hồ** (đã ghi vào ca): ranh giới 11:30 và 17:00 (RG-02, RG-04; plan chọn đầu gồm, cuối không gồm); khi không có dòng giờ nào (GL-13: plan ẩn cả khối); BR-6 chỉ là quy tắc về dữ liệu, F02 không có mã chặn (DV-18); `moTa` của ô không có chỗ hiển thị (DV-23); đồng hồ máy khách sai (GL-16); trùng tên Trung tâm giữa đầu trang và `h1` (BN-11); "ảnh banner nếu có" chưa có ảnh nên BR-5 chưa kiểm được thực chất (BN-07, BN-08); phần giữ chỗ chiều cao dải giờ khi số dòng giờ đổi (HN-06).

## 15. Cập nhật T10 (2026-10-13)

Chạy ở T08 và T10 (gộp một lượt, khối thường gặp của F03 đã có): kết quả ở `result/test.md`. Spec của F02 thêm **BR-9…BR-11** và **AC-10…AC-13** sau khi viết file này; ánh xạ sang ca đã có:

| Spec mới | Ca | Kỳ vọng theo spec |
|---|---|---|
| BR-9, AC-11 | DH-01…DH-06 | Trạng thái tính theo đồng hồ máy (đổi sang giờ Việt Nam), tự cập nhật khi trang mở lâu không tải lại; đồng hồ lệch 3 giờ → nhãn theo giờ máy (hạn chế đã biết) |
| BR-10, AC-12 | GL-13, TL-07 | Không có dòng giờ nào → ẩn cả khối giờ, kể cả nhãn trạng thái; không chữ "Ngoài giờ làm việc"; ô dịch vụ, khối thường gặp vẫn hiện |
| BR-11, AC-13 | DV-23 | Mô tả ngắn của ô không hiển thị ở đâu, kể cả tên đọc của trình đọc màn hình |
| AC-10 | RG-01…RG-05 | 06:59 Ngoài · 07:00 Đang · 11:29 Đang · 11:30 Ngoài · 13:30 Đang · 16:59 Đang · 17:00 Ngoài |

**Ca thêm ở T10** (`e2e/nhap-lai-pg.spec.ts`): PG-4 (ô thứ 7 và giờ Thứ Bảy), PG-5 (xoá giờ Thứ Tư → hai nhóm), PG-6 (giờ "25:00" → công cụ nhập từ chối). F02-HD-10: API nối DB hỏng (`E2E_DB_DOWN=1`).
