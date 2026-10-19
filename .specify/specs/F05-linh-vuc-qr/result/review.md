ĐẠT

# F05 · Lĩnh vực và mã QR — review (T01–T08)

Ngày: 2026-10-13. Tóm tắt: **0 Chặn · 0 Nên sửa · 5 Gợi ý**. Kết quả chạy lệnh dùng chung với F06 (build 0 cảnh báo; 1.047 ca BE đạt, 0 lỗi, 130 bỏ qua do cần PostgreSQL — gồm `Integration/QuayLinhVuc`, nên truy vấn thật của `GET /api/linh-vuc/quay` chưa được kiểm trong lượt này; lint sạch; 1.108 ca FE đạt; build FE sạch kể cả sau khi nối route `linh-vuc`; không lỗ hổng npm/NuGet). Không mở trình duyệt/Lighthouse.

Đối chiếu:

| Điểm kiểm | Kết quả |
|---|---|
| BE `GET /api/linh-vuc/quay` | Đạt. R1–R3 (`INguonDuLieu.PhanCongLinhVucs`, `Where(Quay != null)`, `Select` hai cột, sắp `Ordinal` trong C#), cache `danh-muc` + ETag, giới hạn `danh-muc`, không nhận tham số, DTO chỉ `LinhVucMa`, `Quay` (không nhân sự, không nơi tiếp nhận chuyển). Route khớp `api/linh-vuc/quay` ↔ `API_QUAY_LINH_VUC`; kiểu `QuayLinhVuc` ↔ `QuayLinhVucDto` (camelCase) khớp `plan.md` §3.1 |
| QR `window.location.origin` | Đúng spec (BR-1, BR-5). Rủi ro vận hành: xem Gợi ý 1 |
| `uqr` | `^0.1.3` (MIT, 0.x: caret chỉ nhận 0.1.x), lockfile có commit; chunk `qr` riêng 3,75 KiB gzip, **không bị obfuscate** (kiểm trực tiếp: đầu chunk là mã gốc đã minify), không nằm trong `vendor`; chỉ `QrLinhVuc` import, `OLinhVuc` nạp bằng `lazy` |
| `jsqr` | `devDependency` (`"dev": true` trong lockfile), chỉ `giaiMaQrThu.ts` import, không vào bundle |
| Vẽ lười | `IntersectionObserver` dùng chung, `rootMargin: 0`, quan sát chính `<li>`, `unobserve` sau khi hiện, không gỡ QR khi cuộn đi; môi trường không có API thì vẽ ngay. `d` của `<path>` chỉ gồm lệnh và số do `taoDuongVe` sinh, màu bằng lớp CSS (hợp CSP `style-src 'self'`), không `dangerouslySetInnerHTML` |
| `cap=tinh` cho lĩnh vực chỉ cấp tỉnh | Đạt: `capCuaLinhVuc` (`soThuTucXa > 0 ? 'xa' : 'tinh'`) dùng chung cho liên kết ô và QR; `encodeURIComponent` mã lĩnh vực |
| Quầy lỗi → ẩn | Đạt: `retry: false`, lỗi coi như rỗng, không báo lỗi; chỉ lỗi `useLinhVuc` hiện `QueryState` |
| i18n / WCAG | Chuỗi qua `t()`; QR có `role="img"` + `aria-label`; viền focus quanh cả ô (`::after`), một điểm dừng Tab; một vùng `role="status"` do `SearchBox` |
| Ngân sách | Trang `LinhVuc` 5,3 KiB gzip lười, QR 1,8 KiB; bundle chính 182,5 KiB. Lighthouse chưa đo (tester) |

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Gợi ý | `src/FrontEnd/src/features/linh-vuc/OLinhVuc.tsx:55` | Nội dung QR lấy từ `window.location.origin`: ai mở trang bằng `localhost`, địa chỉ IP hay tên miền thử rồi in thì QR trỏ sai (spec BR-5 chấp nhận, ghi hướng dẫn vận hành). Phía máy chủ chỉ chặn được khi đã khai `AllowedHosts` đích danh; chưa khai (mặc định `appsettings.json` không có mục này) thì `KiemTraHostMiddleware` nhận mọi `Host`, chỉ có cảnh báo lúc khởi động | Bắt buộc khai `AllowedHosts` khi triển khai (đã có cảnh báo `CanhBaoTenMien`); đưa bước "mở bằng tên miền chính thức" vào hướng dẫn in | planner |
| Gợi ý | `src/FrontEnd/src/features/linh-vuc/LinhVuc.tsx:38,46` | Lưới chờ **cả** `useQuayLinhVuc` xong mới hiện (để khỏi nhảy chiều cao). `http()` không có hạn chờ nên nếu riêng yêu cầu quầy treo, cả lưới kẹt ở khung chờ, trái BR-4 ("quầy lỗi không ảnh hưởng lưới") | Cùng sửa với hạn chờ của `core/api/http` (xem review F06); hoặc đặt trần ~1,5 giây rồi coi quầy là rỗng | ui-core-dev (hạn chờ), frontend-dev (trần chờ) |
| Gợi ý | `src/FrontEnd/src/features/linh-vuc/linkQr.ts:15-17` | Lĩnh vực không có thủ tục nào ở cả hai cấp cũng rơi vào `cap=tinh` → quét ra danh sách rỗng. Dữ liệu mẫu không có ca này (75/75 lĩnh vực có thủ tục) | Chấp nhận; nếu dữ liệu thật có, ẩn QR hoặc ghi vào spec | frontend-dev |
| Gợi ý | `src/FrontEnd/src/features/linh-vuc/giaiMaQrThu.ts` | Công cụ test (import `jsqr`, một `devDependency`) nằm trong cây `src/` chạy thật; hiện không vào bundle nhưng một import nhầm sẽ kéo `jsqr` vào | Dời sang `test-utils/` | frontend-dev |
| Gợi ý | `src/FrontEnd/package.json` (`uqr`) | Thư viện 0.x: API có thể đổi giữa các bản nhỏ; không có lý do phải bám `^` | Ghim phiên bản chính xác `0.1.3` (lockfile đã ghim, chỉ để rõ ý) | ui-core-dev |

Ghi chú: `tasks.md` T09 sẽ do bên điều phối đánh dấu xong. AC-4, AC-5, AC-7, AC-9 (đếm QR theo khung nhìn, đo hiệu năng, quét QR thật) thuộc tester T12.
