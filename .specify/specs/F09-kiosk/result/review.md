ĐẠT

# F09 · Kiosk — review (T01–T04; T05 đã có trong khung trợ lý)

Ngày: 2026-10-13. Tóm tắt: **0 Chặn · 1 Nên sửa · 5 Gợi ý**. Kết quả chạy lệnh dùng chung với F06 (build 0 cảnh báo; 1.047 ca BE đạt, 0 lỗi, 130 bỏ qua do cần PostgreSQL; lint sạch; 1.108 ca FE đạt; build FE sạch; không lỗ hổng npm/NuGet). Không mở trình duyệt.

Đối chiếu trọng tâm của T06:

| Điểm kiểm | Kết quả |
|---|---|
| BR-2: không bộ đếm giờ | Đạt. Không `setTimeout`/`setInterval`/`requestIdleCallback`/`visibilitychange` trong `core/kiosk` (grep); `visibilitychange` còn duy nhất ở `features/trang-chu/useBayGio.ts` chỉ cập nhật đồng hồ; `batDauLai()` chỉ được gọi từ `onClick` của nút (`giaoDienKiosk.tsx:42`) |
| Mở chuyển hướng (open redirect) | Không. `batDauLai` gọi `window.location.replace(`${DUONG_DAN.trangChu}?kiosk=1`)`, đích là hằng cùng nguồn, không lấy từ địa chỉ/dữ liệu. `khoiTaoCheDoKiosk` chỉ đọc `kiosk=1\|0`, xoá tham số rồi `replaceState` với đường dẫn cùng nguồn (đã gộp `//` đầu, bọc `try`) |
| `laLienKetCongDvc` | Phân tích bằng `URL`/`phanLoaiLienKet` (allowlist `http(s)` có tên máy), so tên máy chứ không dò chuỗi con. Kiểm tay: `dichvucong.gov.vn.evil.com` sai; `https://dichvucong.gov.vn@evil.com` → tên máy `evil.com` sai; `evildichvucong.gov.vn` sai; chữ "с" Cyrillic → `xn--…` sai; chữ hoa → `URL` đã hạ chữ thường, đúng; `:8443` đúng. **Còn thiếu**: dấu chấm cuối — xem Nên sửa |
| Cờ kiosk | `sessionStorage["kiosk"]="1"` chỉ cờ, đóng tab thì mất; storage bị chặn không lỗi. `localStorage` không bị `batDauLai` đụng tới (giữ `doc-bat`, `cach-xem` đúng BR-7) |
| Chunk kiosk lười | Đạt. Không import tĩnh `giaoDienKiosk` (grep): chỉ `napGiaoDien.ts` `import()`; `NhacDangXuat` trả `null` trước khi chạm `lazy` ngoài kiosk; chunk `giaoDienKiosk` 2,5 KiB gzip (≤ 5), bundle chính 182,5 KiB |
| Nút "Bắt đầu lại" | Portal ra `<body>` kèm `data-ngoai-popup`; `vongTab.ts` đưa nó vào cuối vòng Tab cả trong khung trợ lý lẫn trong `Modal` |
| Dòng nhắc đăng xuất một dòng / nơi | Đạt (`KhungTroLy` đặt một `NhacDangXuat` với liên kết đầu tiên thuộc Cổng DVC trong hội thoại — `lienKetDapAn.ts`); chuỗi qua `t()` (namespace `kiosk`); không `dangerouslySetInnerHTML` |
| Không dữ liệu cá nhân trong storage/log/`history.state` | Đạt (hội thoại chỉ ở state của khung; `useHoiTroLy` không ghi storage) |

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Nên sửa | `src/FrontEnd/src/core/kiosk/laLienKetCongDvc.ts:12-13` | BR-4 và AC-12 yêu cầu **bỏ dấu chấm ở cuối tên máy** trước khi so (`https://DICHVUCONG.GOV.VN./x` phải có dòng nhắc). `new URL('https://dichvucong.gov.vn./x').hostname` là `dichvucong.gov.vn.` (giữ dấu chấm) nên hàm trả `false`, người dân bấm sang Cổng DVC mà không được nhắc đăng xuất. Hướng sai ít hại (bỏ sót nhắc, không nhắc thừa) nhưng lệch spec; test `laLienKetCongDvc.test.ts` chưa có ca này (testcases F09-NM-05 ghi "chấm cuối: nên đúng") | `const tenMay = new URL(href).hostname.replace(/\.$/, '')`; thêm ca `https://DICHVUCONG.GOV.VN./x` và `https://abc.dichvucong.gov.vn./x` vào test | ui-core-dev |
| Gợi ý | `src/FrontEnd/src/core/kiosk/dieuHuongThayLichSu.ts:2,12` | Gán đè `router.navigate` qua `UNSAFE_DataRouterContext` (API không ổn định của react-router). Nâng phiên bản có thể làm `Link`/`setSearchParams` ngừng đi qua `router.navigate` và kiosk lặng lẽ quay lại thêm mục lịch sử (người sau bấm Quay lại thấy trạng thái người trước — vi phạm BR-8, AC-7). `dieuHuongThayLichSu.test.tsx` có bắt ca này nếu dùng router thật | Giữ test với `createMemoryRouter`/`createBrowserRouter` thật làm chốt chặn; ghi vào plan: khi nâng `react-router` phải chạy lại test này và AC-7 trên máy thật | ui-core-dev |
| Gợi ý | `src/FrontEnd/src/core/kiosk/batDauLai.ts:17` | `document.body.hidden = true` trước khi chuyển trang: nếu `location.replace` thất bại (mất mạng) thì trình duyệt hiện trang lỗi của nó, còn nếu bị chặn thì trang còn lại bị ẩn trống. BR-6 đã ghi "cần mạng" nên chấp nhận được | Giữ nguyên; thêm vào hướng dẫn vận hành: nếu màn hình trắng, tải lại bằng `/?kiosk=1` | planner |
| Gợi ý | `src/FrontEnd/src/features/chatbot/dieuKhienTroLy.ts:18` | `batDauLaiTroLy()` không còn nơi gọi trong mã chạy thật (nút kiosk tải lại trang); phần đăng ký ở `NutTroLy.tsx:26` nằm trong bundle chính | Xoá khi chốt F09 | chatbot-dev |
| Gợi ý | `src/FrontEnd/src/core/kiosk/cheDoKiosk.ts:38-52` | Bất kỳ liên kết `?kiosk=1` nào (ví dụ gửi qua tin nhắn) cũng bật chế độ kiosk cho trình duyệt đó tới khi đóng tab: chữ lớn, thêm nút "Bắt đầu lại", điều hướng thay lịch sử. Không phải lỗ hổng (chỉ hiển thị, không quyền hạn), nhưng spec BR-1 chỉ nói "link kiosk riêng" | Chấp nhận; ghi vào hướng dẫn vận hành là không công bố link kiosk | planner |
| Gợi ý | `.specify/specs/F09-kiosk/tasks.md:82` | T05 (chatbot-dev) chưa đánh dấu xong dù mã và test đã có (`KhungTroLy.kiosk.test.tsx`, `NhacDangXuat.tsx`, dừng đọc khi `pagehide`) | Đánh dấu T05 xong | chatbot-dev |

Ghi chú: các ca cần trình duyệt thật (AC-1, AC-2 15 phút để yên, AC-6, AC-7, AC-10, AC-11) thuộc tester T08; review này chỉ đọc mã và chạy test đơn vị.
