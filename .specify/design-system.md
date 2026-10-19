# Design system — Trung tâm Phục vụ hành chính công xã Cần Giuộc

Trạng thái: **Đã duyệt 2026-10-12** (người dùng duyệt cùng prototype). `ui-core-dev` hiện thực theo bản này (`tokens.css`, font, component lõi, trang xem trước).

Tham chiếu:

- **Màu, bố cục, component:** https://ttpvhcc-canduoc.pages.dev/ — khảo sát 2026-10-08 ở khổ 375, 1366 và 1080×1920. Số đo màu và độ tương phản lấy từ CSS thật của trang đó, tính theo công thức WCAG.
- **Kích thước (chữ, khoảng cách, bo góc, chiều cao điều khiển, font):** https://hccvamco.pages.dev/tracuu_tthc_vamco_v3 — theo yêu cầu 2026-10-09 "giảm size, lấy Vàm Cỏ làm chuẩn". Số đo lấy từ CSS thật của trang đó.

## 1. Nguyên tắc

1. **Trang trọng, đáng tin.** Đây là trang của cơ quan nhà nước: màu chừng mực, không hiệu ứng phô trương, không emoji, không nhân vật hoạt hình.
2. **Gọn và ai cũng dùng được.** Mật độ thông tin như Vàm Cỏ (chữ nhỏ, nhiều nội dung trên một màn hình) nhưng vẫn tương phản cao, không chỉ dựa vào màu, phóng to được. Chế độ kiosk tự phóng to cho màn hình cảm ứng.
3. **Đạt WCAG 2.1 mức AA.** TT 22/2023/TT-BTTTT có tham chiếu WCAG; mức bắt buộc cụ thể đối chiếu ở `nghiep-vu/tuan-thu.md`.
4. **Nhẹ.** Không `backdrop-filter`, không bóng mờ lớn, không ảnh nền nặng — kiosk thường có cấu hình thấp.
5. **Nhất quán.** Mọi màu, cỡ chữ, khoảng cách lấy từ token. Không viết giá trị cứng trong component.

## 2. Giữ và sửa so với Cần Đước

| Cần Đước | Bản của mình | Lý do |
|---|---|---|
| Xanh chủ đạo `#0b66c2`, xanh đậm `#074a90` | **Giữ** | Chữ trắng trên `#0b66c2` đạt 5,7:1 |
| Màu nhấn đỏ `#dc2626` | **Giữ**, chỉ cho 1 hành động quan trọng nhất ("Xem và nộp trên Cổng DVC") | Chữ trắng đạt 4,8:1 |
| Nút nộp hồ sơ chuyển màu đỏ → cam `#f97316` | Đỏ đặc cho nút "Xem và nộp trên Cổng DVC" | Đầu màu cam: chữ trắng chỉ 2,8:1 — **không đạt AA** |
| Nhãn lĩnh vực xanh lá `#10b981` chữ trắng | Nền xanh lá nhạt, chữ `#047857` | Chữ trắng trên `#10b981` chỉ 2,5:1 — **không đạt** |
| Chân trang, dải giờ làm việc chuyển xanh → xanh ngọc `#06b6d4` | Xanh đậm đặc `#074a90` | Chữ trắng trên đầu xanh ngọc khoảng 2,4:1 — **không đạt**; trên `#074a90` đạt 8,8:1 |
| Chữ phụ `#64748b` trên nền `#eef5fc` | Chữ phụ `#475569` | 4,05:1 — **không đạt**; `#475569` đạt 6,9:1 |
| Cỡ chữ, khoảng cách, nút của Cần Đước (to) | **Theo Vàm Cỏ**: nội dung 13px, nhãn 11–12px, nút/ô nhập cao 34px | Yêu cầu 2026-10-09; kiosk vẫn tự phóng to |
| Font Be Vietnam Pro tải từ Google Fonts | Font hệ thống như Vàm Cỏ (Segoe UI / Roboto / Arial) | Theo Vàm Cỏ; không tải font, nhanh hơn; cả 3 font đều đủ dấu tiếng Việt |
| Biểu tượng bằng emoji (🎫🤖💳🏛️) | Bộ icon SVG tự host | Emoji hiển thị khác nhau giữa các máy, thiếu trang trọng, trình đọc màn hình đọc lung tung |
| Bề mặt kính mờ, bóng phát sáng, nhiều gradient | Bề mặt trắng đặc, 2 mức bóng nhẹ | Trang trọng hơn, nhẹ cho kiosk |
| Banner là ảnh có chữ in sẵn | Ảnh trụ sở + tiêu đề là chữ HTML thật | Chữ trong ảnh không đọc được bằng trình đọc màn hình, không phóng to được |
| Trợ lý là ảnh cô gái + "Trợ lý AI" | Tên và biểu tượng trung tính: "Trợ lý thủ tục" | Không dùng hình người; trợ lý không phải AI |
| Nút A+ và đọc to trang ở đầu trang | Bỏ | Đã loại khỏi phạm vi |
| Ô tìm có nút micro | Bỏ | Đã bỏ nhận giọng nói |
| Bo góc 10 / 18 / 26px | 8 / 12 / 14px | Theo Vàm Cỏ |
| Bố cục: đầu trang → banner → ô dịch vụ → thủ tục thường gặp → mạng xã hội → giờ làm việc → chân trang | **Giữ thứ tự** | Đã quen với người dân trong tỉnh |

## 3. Token

Tên token dùng tiếng Anh theo thông lệ CSS; đặt ở `src/FrontEnd/src/core/styles/tokens.css`.

### Màu

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--color-primary` | `#0b66c2` | Nút chính, link, chip đang chọn, viền focus |
| `--color-primary-strong` | `#074a90` | Hover nút chính, tiêu đề trang, nền chân trang |
| `--color-primary-soft` | `#e8f1fb` | Nền nhãn lĩnh vực, nền mục đang chọn |
| `--color-accent` | `#dc2626` | Nút "Xem và nộp trên Cổng DVC", vạch nhấn tiêu đề mục |
| `--color-accent-strong` | `#b91c1c` | Hover nút nhấn, chữ lỗi |
| `--color-bg` | `#eef5fc` | Nền trang |
| `--color-surface` | `#ffffff` | Thẻ, bảng, popup, khung chat |
| `--color-border` | `#d3e0ee` | Viền trang trí (thẻ, đường kẻ) |
| `--color-border-strong` | `#6b84a3` | Viền ô nhập, nút viền — đạt 3,8:1 với nền trắng (yêu cầu ≥ 3:1) |
| `--color-text` | `#0f172a` | Chữ chính |
| `--color-text-muted` | `#475569` | Chữ phụ (mã thủ tục, chú thích) |
| `--color-on-primary` | `#ffffff` | Chữ trên nền xanh, đỏ |
| `--color-success` / `--color-success-soft` | `#047857` / `#ecfdf5` | "Toàn trình", "Đang trong giờ làm việc" |
| `--color-warning` / `--color-warning-soft` | `#92400e` / `#fffbeb` | "Một phần" |
| `--color-danger` / `--color-danger-soft` | `#b91c1c` / `#fef2f2` | Lỗi |

Gradient chỉ được dùng ở nền banner (không đặt chữ nhỏ lên đó). Không dùng gradient cho nút, nhãn, chân trang.

### Chữ

- Font: font hệ thống như Vàm Cỏ — `"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Không tải font web.
- Mã thủ tục: `ui-monospace, "Cascadia Mono", Consolas, monospace`.

| Token | Cỡ | Vàm Cỏ dùng cho | Mình dùng cho |
|---|---|---|---|
| `--font-size-xs` | 11px | Mã thủ tục, nhãn, số thủ tục | Mức nhỏ nhất: nhãn (badge), mã thủ tục, chú thích |
| `--font-size-sm` | 12px | Đầu bảng, ô chọn, nút, tên lĩnh vực | Đầu bảng, chip, nút nhỏ, chữ phụ |
| `--font-size-md` | 13px | Bảng, ô tìm, tab | **Nội dung**, nút, ô nhập, tab, bảng |
| `--font-size-lg` | 14px | — | Tên thủ tục trên thẻ, tiêu đề mục |
| `--font-size-xl` | 18px | Tên trung tâm ở đầu trang | Tên trung tâm, tiêu đề popup |
| `--font-size-2xl` | 20px | Số thống kê ở đầu trang | Tiêu đề banner |
| `--font-size-3xl` | 28px | Số thống kê lớn | Số thống kê |

- Không dùng chữ dưới 11px (Vàm Cỏ có chỗ 9–10px — bỏ).
- Giãn dòng: nội dung 1,4; tiêu đề 1,25; tin nhắn trợ lý 1,55 (như Vàm Cỏ).
- Không viết hoa toàn bộ cho câu dài. Tiêu đề viết hoa chữ đầu.
- Kiosk: cỡ gốc phóng 118,75% (`html { font-size: 118.75% }`); mọi cỡ tính theo `rem` nên tự phóng theo (nội dung 13px → khoảng 15,5px).

### Khoảng cách, bo góc, bóng, lớp

| Nhóm | Token |
|---|---|
| Khoảng cách (bội số 4px) | `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 20 · `--space-6` 24 · `--space-8` 32. Thẻ đệm 12px, vùng nội dung 20–24px (như Vàm Cỏ) |
| Bo góc | `--radius-sm` 8px (nút, ô nhập, phân trang) · `--radius-md` 12px (thẻ) · `--radius-lg` 14px (banner, popup, khung chat) · `--radius-pill` 999px (chip, nhãn) |
| Bóng | `--shadow-sm` `0 1px 4px rgba(15,23,42,.10)` · `--shadow-md` `0 4px 16px rgba(15,23,42,.14)` (như Vàm Cỏ) |
| Lớp (z-index) | đầu trang 10 · nút trợ lý 40 · popup 50 · nút "Bắt đầu lại" (kiosk) 55 |
| Chuyển động | 150ms `ease-out`, chỉ `opacity` và `transform`; tắt hết khi `prefers-reduced-motion: reduce` |
| Chiều cao điều khiển | `--control-height` 34px (nút, ô nhập, ô chọn, phân trang, nút icon); kiosk 48px. Đạt WCAG 2.2 mức AA (vùng bấm ≥ 24px) |

### Bố cục

| Khổ | Điều kiện | Lưới thẻ thủ tục | Lề ngang |
|---|---|---|---|
| Điện thoại | < 600px | 1 cột | 16px |
| Máy tính bảng | 600–1023px | 2 cột | 24px |
| Máy tính | ≥ 1024px | 4–5 cột (`repeat(auto-fill, minmax(240px, 1fr))`, như lưới lĩnh vực của Vàm Cỏ) | 24px |
| Kiosk | bật bằng cấu hình trên máy kiosk (F09), không đoán theo kích thước màn hình | 2 cột; danh sách thủ tục mặc định dạng thẻ, kể cả trang Danh mục (F09 AC-1), vẫn chuyển sang bảng được; chữ phóng 118,75%, điều khiển cao 48px; nút "Bắt đầu lại" luôn hiện; không tự làm mới | 24px |

- Điện thoại (< 600px): danh sách thủ tục luôn dạng thẻ, ẩn nút chuyển "Dạng thẻ / Dạng bảng". Từ 600px trở lên người dùng tự chọn (câu hỏi mở 29).
- Nội dung rộng tối đa 1280px, căn giữa.
- Không có thanh cuộn ngang ở bất kỳ khổ nào.

## 4. Icon

- Bộ đề xuất: **Lucide** (giấy phép ISC), dùng dạng component React (`lucide-react`), chỉ đóng gói icon thực sự dùng.
- Nét 2px; cỡ 16px trong nút và nhãn, 20px đứng riêng.
- Icon trang trí: `aria-hidden="true"`. Nút chỉ có icon: bắt buộc `aria-label`.

## 5. Component

Cột "Ở đâu": `core` = component lõi dùng chung, không biết nghiệp vụ; `feature` = riêng của một chức năng.

| Component | Ở đâu | Quy cách |
|---|---|---|
| `Button` | core | Biến thể: `primary` (xanh đặc), `accent` (đỏ đặc — chỉ "Xem và nộp trên Cổng DVC"), `secondary` (nền trắng, viền `--color-border-strong`, chữ xanh), `ghost`. Cao `--control-height` (34px), chữ 13px, đệm ngang 12px. Trạng thái: hover, focus, đang xử lý, vô hiệu |
| `IconButton` | core | Vuông bằng `--control-height`, bắt buộc `aria-label` |
| `ExternalLink` | core | Tự thêm `target="_blank" rel="noopener noreferrer"`, icon mở trang mới, chữ ẩn "(mở trang mới)" cho trình đọc màn hình. Nhắc đăng xuất ở kiosk (người dùng chọn 2026-10-12): **một dòng mỗi nơi** có liên kết tới Cổng DVC Quốc gia — xác định theo đích `dichvucong.gov.vn` — không lặp ở từng thẻ, từng dòng, từng câu trả lời: một dòng phía trên danh sách thủ tục (thẻ hoặc bảng), một dòng phía trên các ô dịch vụ (khi có ô tới Cổng DVC), một dòng trong popup cạnh nút "Xem và nộp trên Cổng DVC", một dòng trong khung trợ lý (một lần cho cả khung). Chân trang không có dòng nhắc (F09 BR-4). Chữ "Nhớ đăng xuất khi dùng xong" 12px, chữ phụ, icon đăng xuất; người dân thấy trước khi bấm, không thêm bước xác nhận. Ngoài kiosk không có; link tới trang không cần đăng nhập (Cổng TTĐT xã) không tính (F09 BR-4) |
| `Card` | core | Nền trắng, viền `--color-border`, bo `--radius-md`, `--shadow-sm`; các thẻ cùng hàng cao bằng nhau |
| `Tile` | core | Ô dịch vụ: icon trong ô vuông màu đặc + nhãn tối đa 2 dòng + dòng nhỏ "Trang ngoài"; cả ô là một link ra trang ngoài. **Ô chưa có link hoặc link sai định dạng** (không phải `http`/`https`): vẫn hiện, trông như ô thường — giữ icon màu đặc và tên, không mờ, không viền nét đứt, không chữ giữ chỗ ("Chưa có liên kết"…); bỏ dòng "Trang ngoài". Ô này là khối thường: không phải `<a>`, không `role="link"`/`button`, không `tabindex` (Tab bỏ qua), bấm không mở gì, không đổi viền/bóng khi rê chuột (câu hỏi mở 30) |
| `Badge` | core | Nhãn tròn: `info` (lĩnh vực), `success` (Toàn trình), `warning` (Một phần), `neutral` (thời hạn, phí — có icon đi kèm). Luôn có chữ, không chỉ có màu |
| `Chip` | core | Bộ lọc lĩnh vực: viền xám → đang chọn nền xanh, chữ trắng, có dấu ✓ (icon); `aria-pressed`. Hàng chip cuộn ngang được trên điện thoại, có nút cuộn trên máy tính |
| `SegmentedControl` | core | Chuyển "Dạng thẻ / Dạng bảng"; mục đang chọn nền xanh. Có ở mọi danh sách thủ tục (thường gặp, Danh mục); lựa chọn được nhớ và dùng chung. Mặc định khi chưa chọn: thẻ ở 600–1023px và ở kiosk, bảng từ 1024px. Ẩn trên điện thoại (< 600px) — ở khổ đó danh sách luôn dạng thẻ |
| `SearchBox` | core | Có nhãn (có thể ẩn bằng `sr-only`), icon kính lúp, nút xoá; không có micro |
| `SectionTitle` | core | Vạch đỏ 4px bên trái + tiêu đề 14px, đậm 700 |
| `DataTable` | core | Bọc TanStack Table: chế độ bảng (đầu bảng dính, dòng có hover) và chế độ thẻ (`renderCard`). Trên điện thoại (< 600px) luôn là thẻ, không có nút chuyển dạng (câu hỏi mở 29) |
| `Pager` | core | Trước / số trang / Sau; trang hiện tại `aria-current="page"` |
| `Modal` | core | Popup chi tiết: rộng tối đa 680px, toàn màn hình trên điện thoại; giữ focus bên trong; đóng bằng ✕ / Esc / bấm ra ngoài; trả focus về nút đã mở |
| `Skeleton`, `EmptyState`, `ErrorState` | core | Đang tải (khối xám, không hiệu ứng lấp lánh nặng) / không có kết quả: trang có nút "Xoá bộ lọc" trên thanh bộ lọc thì thông báo chỉ gợi ý bằng chữ, không lặp nút; trang không có nút đó trên thanh bộ lọc thì thông báo có nút "Xoá bộ lọc" / lỗi (nút "Thử lại") |
| `StatusPill` | core | Trạng thái giờ làm việc: icon + chữ + màu (`success` khi mở, `neutral` khi đóng) |
| `AppHeader`, `AppFooter` | app/layout | Đầu trang: biểu tượng chung (§8), tên trung tâm và địa bàn — **lấy từ dữ liệu trung tâm, không phải chữ cố định** (F08 BR-5, BR-14): tên hiện nguyên văn trường tên trung tâm, địa bàn là "<xã> – <tỉnh>" từ dữ liệu, không tự ghép thêm chữ "xã", "tỉnh", "phường", không tự viết hoa; chữ trên trang xem trước và prototype chỉ là mẫu. Điều hướng 3 mục: "Trang chủ", "Danh mục thủ tục", "Lĩnh vực và mã QR" (thủ tục thường gặp nằm trong trang chủ — câu hỏi mở 31). Dưới 600px: nhãn ngắn "Trang chủ · Danh mục · Lĩnh vực", 3 mục chia đều, vừa 375px, không cuộn ngang, không nút menu; tên đầy đủ vẫn là tên đọc của link (chữ ẩn cho trình đọc màn hình), mục đang chọn có `aria-current="page"`. Từ 600px: nhãn đầy đủ. Chân trang nền `#074a90`, chữ trắng: cơ quan chủ quản, người chịu trách nhiệm nội dung dạng "Người chịu trách nhiệm nội dung: <Họ tên> – <Chức vụ>" (TT 22/2023 yêu cầu họ tên; họ tên, chức vụ lấy từ dữ liệu nhập; chức vụ trống thì bỏ cả "– …"; trang xem trước và prototype dùng chữ giữ chỗ "Họ tên (dữ liệu mẫu) – Giám đốc Trung tâm", không dùng tên người thật), địa chỉ, điện thoại (link `tel:`), email (link `mailto:`), liên kết hữu ích, mạng xã hội, ngày cập nhật dữ liệu, lời miễn trừ, bản quyền |
| `NutBatDauLai` | app/layout | Chỉ ở kiosk. Luôn hiện: nút nổi góc trái dưới (đối xứng nút "Trợ lý" góc phải), nằm trên cả popup và khung trợ lý để bấm được khi chúng đang mở; `primary` bo tròn, icon làm mới + chữ "Bắt đầu lại", cao ≥ 48px. Chừa chỗ để nút không che nội dung: chân trang có khoảng trống cuối như với nút Trợ lý; popup ở kiosk chừa dải dưới để nút không che nút hành động và lời miễn trừ cuối popup. Bàn phím: khi popup mở ở kiosk, nút là phần tử cuối trong vòng Tab của popup (Tab / Shift+Tab đi vòng gồm cả nút); Enter / Space = bấm. Bấm: xoá hội thoại trợ lý, đóng popup, xoá từ khoá và bộ lọc, về trang chủ; thay mục lịch sử (`history.replaceState`/`location.replace`) để "Quay lại" không mở lại trạng thái cũ. Giữ nguyên lựa chọn dạng thẻ / bảng và bật đọc (F09 BR-7). Kiosk không tự làm mới, không đếm giờ, không cảnh báo (F09 BR-2) |
| `HeroBanner` | feature trang-chu | Ảnh trụ sở (WebP/AVIF ≤ 150 KB) + tiêu đề chữ HTML 20px; cao tối đa 160px trên máy tính |
| `ThuTucCard` | feature thu-tuc | Từ `Card` (đệm 12px): nhãn lĩnh vực + mã thủ tục (mono 11px, chữ phụ) → tên thủ tục (14px, đậm 600, tối đa 3 dòng) → thời hạn, phí → "Xem chi tiết" (`secondary`) + "Xem và nộp trên Cổng DVC" (`accent`, link ra trang ngoài có icon mở trang mới). Chữ trên nút không xuống dòng; thẻ hẹp thì 2 nút xếp dọc |
| `ThuTucBang` | feature thu-tuc | Cột cho `DataTable` ở dạng bảng (danh mục, thủ tục thường gặp, danh sách theo lĩnh vực): STT, Mã, Tên thủ tục (bấm mở popup), Lĩnh vực, Mức độ, Cơ quan thực hiện, cột cuối "Cổng DVC" — link gọn "Xem và nộp trên Cổng DVC" (chữ xanh đậm 600, icon mở trang mới, không xuống dòng; cùng link với nút ở thẻ) |
| `ChiTietThuTuc` | feature thu-tuc | Nội dung popup chi tiết, đặt trong `Modal`. Chân popup có đúng 1 nút `accent` "Xem và nộp trên Cổng DVC" — link ra Cổng DVC Quốc gia theo mã thủ tục, mở trang mới (câu hỏi mở 7). Khi popup mở, tiêu đề tab là đúng tên thủ tục; đóng thì trả lại tiêu đề chung của trang; mã không tồn tại thì "Không tìm thấy thủ tục" (câu hỏi mở 25). Có mục "Yêu cầu, điều kiện" khi dữ liệu có. "Thành phần hồ sơ": mỗi giấy tờ kèm dòng nhỏ "Bản chính: n · Bản sao: m" (12px, chữ phụ); giấy tờ có cả hai số bằng 0 coi như chưa ghi → không hiện số bản. Mục không có dữ liệu thì ẩn |
| `QrLinhVuc` | feature linh-vuc | QR trên nền trắng, chừa lề quanh mã, chú thích tên lĩnh vực bên dưới |
| `ChatPanel` | feature chatbot | Nút nổi góc phải dưới (cao 44px): icon hộp thoại + chữ "Trợ lý". Khung chat 370 × 530px trên máy tính (như Vàm Cỏ), toàn màn hình trên điện thoại; tin nhắn 12,5px. Tin của người dân nền xanh chữ trắng, của trợ lý nền trắng; câu gợi ý dạng `Chip`; nút "Gọi Trung tâm", "Mở Zalo"; nút bật/tắt đọc. Câu trả lời về một thủ tục kèm "Xem chi tiết" (`secondary`) + "Xem và nộp trên Cổng DVC" (`accent`) |

## 6. Truy cập (bắt buộc với mọi màn hình)

- Tương phản: chữ ≥ 4,5:1; chữ lớn (≥ 24px, hoặc ≥ 19px đậm) và viền điều khiển ≥ 3:1.
- Focus luôn nhìn thấy: viền 3px `--color-primary`, cách 2px (trên nền xanh đậm dùng viền trắng).
- Có link "Bỏ qua đến nội dung chính" ở đầu trang.
- Dùng được toàn bộ bằng bàn phím; thứ tự Tab theo thứ tự đọc.
- `lang="vi"`; tiêu đề h1 → h2 → h3 không nhảy cấp; có vùng `header` / `nav` / `main` / `footer`.
- Không truyền thông tin chỉ bằng màu (Toàn trình / Một phần luôn có chữ).
- Phóng to 200% không mất nội dung, không cuộn ngang.
- Kiểm tự động bằng axe-core trong Playwright (ke-hoach 5.5).

## 7. Nội dung và giọng văn

- Viết tên cơ quan theo quy tắc viết hoa của Nghị định 30/2020/NĐ-CP (Phụ lục II): "Trung tâm Phục vụ hành chính công xã Cần Giuộc", "Ủy ban nhân dân xã Cần Giuộc".
- Tiếng Việt có dấu đầy đủ, thống nhất "Ủy" (không lẫn "Uỷ"). Ngày `dd/mm/yyyy`, giờ 24 giờ `07:00`.
- Câu ngắn, rõ, trang trọng; không tiếng lóng, không emoji, không "bà con ơi".
- Nút ghi rõ hành động: "Xem chi tiết", "Xem và nộp trên Cổng DVC", "Xoá bộ lọc" — không ghi "Bấm vào đây".
- Link ra ngoài ghi rõ đích: "Mở Cổng Dịch vụ công Quốc gia".

## 8. Nhận diện

- Chỉ dùng logo chính thức của trung tâm. Chưa có logo → biểu tượng chung (icon `Landmark` của bộ icon, trắng trên ô tròn `--color-primary-strong`) + tên trung tâm bằng chữ; không tự vẽ logo (câu hỏi mở 17).
- Không dùng Quốc huy, Quốc kỳ, ảnh lãnh đạo khi chưa có hướng dẫn của cơ quan.
- Không dùng lại logo, banner, ảnh trợ lý của Cần Đước hoặc Vàm Cỏ.
- Favicon lấy từ logo chính thức.

## 9. Hiệu năng của giao diện

- Font: dùng font hệ thống, không tải file font nào.
- Ảnh: WebP/AVIF, khai `width` / `height`, ảnh dưới màn hình đầu tải lười.
- Icon nằm trong bundle (không tải sprite riêng); chỉ icon được dùng.
- Không `backdrop-filter`, không `filter: blur` lớn, không animation chạy liên tục.

## 10. Trang xem trước

- **Bản đã duyệt 2026-10-12:**
  - `.specify/design-system-xem-truoc.html` — token và component.
  - `.specify/prototype/index.html` — prototype toàn bộ giao diện (trang chủ, danh mục, lĩnh vực + QR, popup có link riêng, trợ lý, trạng thái tải/lỗi/rỗng, 404, kiosk có nút "Bắt đầu lại" và dòng nhắc đăng xuất), chạy bằng dữ liệu mẫu. Dữ liệu sinh bằng `node .specify/prototype/tao-du-lieu-mau.cjs data-mau .specify/prototype/du-lieu-mau.js` (file dữ liệu không commit).
- **Trong app (sau khi duyệt):** route `/dev/design-system` chỉ có ở bản dev (`import.meta.env.DEV`), không có trong bản build production. Trang này bày toàn bộ token và component ở mọi biến thể, trạng thái và ở cả chế độ kiosk.

## 11. Đã duyệt (2026-10-12)

| # | Nội dung | Chốt |
|---|---|---|
| DS-1 | Bảng màu (theo Cần Đước), cỡ chữ, khoảng cách, bo góc, chiều cao điều khiển, font (theo Vàm Cỏ — chỉnh 2026-10-09) ở §3 | Như trên |
| DS-2 | Bộ icon | Lucide (ISC) |
| DS-3 | Tên và biểu tượng trợ lý | "Trợ lý thủ tục", icon hộp thoại, không hình người |
| DS-4 | Cách xưng hô của trợ lý với người dân | Trung tính, tránh đại từ; khi cần thì "ông/bà" |
| DS-5 | Logo chính thức, ảnh trụ sở cho banner | Chờ trung tâm cung cấp; trong lúc chờ dùng biểu tượng chung + tên bằng chữ (§8), banner không ảnh |
| DS-6 | Bật chế độ kiosk | Bằng cấu hình trên máy kiosk (chi tiết ở F09) |
