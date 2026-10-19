ĐẠT

# F07 · Đọc câu trả lời — review (T01–T06)

Ngày: 2026-10-13. Tóm tắt: **0 Chặn · 0 Nên sửa · 4 Gợi ý**. Kết quả chạy lệnh dùng chung với F06 (build 0 cảnh báo; 1.047 ca BE đạt, 0 lỗi, 130 bỏ qua do cần PostgreSQL; lint sạch; 1.108 ca FE đạt; build FE sạch; `npm audit --omit=dev` và `dotnet list package --vulnerable --include-transitive` không có lỗ hổng). Không mở trình duyệt nên chưa thử tay với giọng thật (việc của tester T11).

Đối chiếu trọng tâm của T07:

| Điểm kiểm | Kết quả |
|---|---|
| BR-1: văn bản đọc không ra ngoài | Đạt. `chonGiong()` chỉ nhận giọng `localService` và `vi`/`vi-VN`/`vi_VN`; `taoCauDoc` và `moKhoaDoc` luôn gán `utterance.voice`; không `fetch` nội dung đáp án; bảng viết tắt chỉ vào `utterance.text`. CSP `connect-src 'self'` không chặn được dịch vụ giọng nội bộ của trình duyệt — xem Gợi ý 1 |
| BR-2: không giọng cục bộ thì ẩn nút, không lỗi | Đạt (`ChoNutDoc` trả `null`; `try/catch` quanh mọi gọi `speechSynthesis`) |
| BR-3: `GET /api/tro-ly/viet-tat` | Đạt. R1–R3 (`INguonDuLieu.VietTats`, `OrderBy(ThuTu)`, `Select` ra DTO hai trường), cache `danh-muc` + ETag, giới hạn `danh-muc`, không `AppDbContext`; FE lọc dữ liệu sai hình dạng, khoá thoát ký tự trước khi dựng `RegExp`, tối đa 200 dòng và khoá ≤ 50 ký tự, mẫu không lồng lượng từ nên không ReDoS |
| BR-4: nạp lười | Đạt. `docCauTraLoi` là chunk riêng (3,7 KiB gzip), chỉ `import()` khi bật đọc hoặc có đáp án mới lúc cờ đã bật; bundle chính không đổi (182,5 KiB gzip) |
| BR-5: `localStorage["doc-bat"]` chỉ là cờ | Đạt (`luuLuaChon.ts`: `'1'`/`'0'`, storage bị chặn thì giữ trong bộ nhớ trang) |
| BR-6: không micro / nhận giọng nói | Đạt. `khongMicro.test.ts` quét `src` tìm `SpeechRecognition`, `getUserMedia`, `MediaRecorder`, `mediaDevices`, `capture=`; chạy lại bằng `grep` ngoài test không thấy; chỉ `features/chatbot/doc/` được gọi `speechSynthesis.speak` |
| BR-7: dừng đúng chỗ | Đạt. Số phiên `phien` kiểm sau mỗi chỗ chờ (nạp chunk, tải bảng, 80 ms); dừng khi: đáp án mới, tắt, đóng khung (`khungDangMo`), `pagehide`, gỡ khung (F09 đổi `key`); không dừng khi popup mở hay đổi trang trong ứng dụng (vỏ nút ở `Layout` không gỡ). Không đọc đáp án đến lúc khung đóng, không đọc câu có sẵn lúc bật (`idDaXem`) |
| Dọn hiệu ứng | Đạt. `pagehide`, `voiceschanged`, `pointerdown`/`keydown` (pha bắt) đều gỡ khi gỡ khung; hẹn giờ kiểm giọng gỡ bằng `clearTimeout` |
| Không `console`, không `dangerouslySetInnerHTML`, chuỗi qua `t()` | Đạt (`luatDoc.ts` chữ để phát âm, không phải chữ giao diện — có ghi chú) |
| Điểm ghép F06 | Đạt, đúng tên `ChoNutDoc`, `useDiemGhepDoc`, `vanBanDoc` |

| Mức | File:dòng | Vấn đề | Đề xuất | Agent sửa |
|---|---|---|---|---|
| Gợi ý | `src/FrontEnd/src/features/chatbot/doc/giongDoc.ts:31-40` | BR-1 dựa vào cờ `localService` do trình duyệt tự khai; mã không ép được (một số WebView/điện thoại khai sai theo cả hai hướng) và CSP không phủ dịch vụ giọng của hệ điều hành/trình duyệt | Ghi vào hướng dẫn vận hành (F09 BR-6): kiểm giọng đã cài là giọng chạy trên máy ở từng loại máy kiosk trước khi bật; tester thử tay với giọng thật (T11) | planner, tester |
| Gợi ý | `src/FrontEnd/src/features/chatbot/doc/giaSpeech.ts` | Đồ giả test (import `vitest`) nằm trong cây mã chạy thật; hiện không vào bundle | Dời sang `test-utils/` | chatbot-dev |
| Gợi ý | `src/FrontEnd/src/features/chatbot/KhungTroLy.tsx:91-97` | `vanBanDoc()` dựng văn bản đọc cho **mọi** đáp án (kể cả khi đọc tắt, phần lớn người dùng) rồi mới truyền xuống `useDoCauTraLoi` | Dựng chậm: truyền `() => vanBanDoc(…)` và chỉ gọi khi thật sự đọc | chatbot-dev |
| Gợi ý | `src/FrontEnd/src/features/chatbot/doc/giongDoc.ts:71-85` | `moKhoaDoc()` bỏ qua im lặng nếu `speechSynthesis.speaking`; lần bật đầu có thể không mở khoá được trên Safari iOS nếu đang có tiếng khác | Chấp nhận; để tester thử tay trên iOS | tester |

Ghi chú: `tasks.md` T07 sẽ do bên điều phối đánh dấu xong. Dòng "Máy dev có `NODE_TLS_REJECT_UNAUTHORIZED=0`" xem review F06 — không phải lỗi của repo.
