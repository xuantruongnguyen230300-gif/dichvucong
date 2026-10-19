---
id: F07
ten: Đọc câu trả lời — kế hoạch kỹ thuật
spec: spec.md (da-duyet; đổi sang dang-lam khi lập xong tasks.md)
nguon: spec.md; CLAUDE.md; .specify/nghiep-vu/{du-lieu, cau-hoi-mo (10, 15, 37, 42), tuan-thu}.md; .specify/design-system.md (ChatPanel, IconButton); .specify/prototype/index.html (nút đọc đã duyệt: #chat-doc, aria-pressed, khoá doc-bat); plan F06 §5.1, §6 (điểm ghép ChoNutDoc, DiemGhepDoc, vanBanDoc); plan F09 §4.2, §8, §9; plan F00 (cache danh-muc, R1–R7); mã thật trong src/ (INguonDuLieu, ThongTinTrungTamController, core/components/IconButton, core/hooks/useCachXem, vite.config.ts). Trang Vàm Cỏ chỉ đọc để hiểu cách đọc (dữ liệu không tin cậy, không chạy mã, bỏ phần micro)
cap_nhat: 2026-10-13
---

# F07 · Đọc câu trả lời — kế hoạch kỹ thuật

## 1. Tóm tắt

Người dân bật một nút ở đầu khung trợ lý; từ đó mỗi câu trả lời mới được đọc bằng **giọng tiếng Việt cài sẵn trên máy** (Web Speech API, `speechSynthesis`). Không nhận giọng nói, không micro, không gửi nội dung ra ngoài. Chữ viết tắt được thay bằng chữ đầy đủ **chỉ trong văn bản đưa cho máy đọc**; chữ hiển thị không đổi.

| Phần | Chạm gì |
|---|---|
| DB | **Không đổi.** Bảng `viet_tat` đã có (F01 T03), đã có trong `INguonDuLieu.VietTats`. Không migration. db-dev không có task |
| BE `Features/Chatbot/` (chatbot-dev) | **Một endpoint mới** `GET /api/tro-ly/viet-tat` trả bảng viết tắt (§3). F06 plan §6 đã giao việc này cho plan F07. Không đụng thuật toán của F06 |
| FE `features/chatbot/` (chatbot-dev) | Thay `ChoNutDoc.tsx` (F06 giao bản rỗng) bằng nút bật/tắt đọc; thư mục `doc/` mới: chọn giọng, lưu cờ, chuẩn bị văn bản, phát âm. **Phần phát âm + chuẩn bị văn bản là chunk riêng, nạp bằng `import()`** (BR-4) |
| FE `core/`, `app/` (ui-core-dev) | **Không có task.** Dùng `IconButton` có sẵn; khoá chữ nằm ở namespace `chatbot` (kiểu đã nối ở F06 T10) |
| frontend-dev, backend-dev, db-dev | Không có task |
| Ngân sách JS tải đầu | **+0 KB.** Mọi mã F07 nằm trong chunk khung trợ lý (đã lười, F06) hoặc chunk phần đọc (lười hơn nữa). Bundle chính không đổi |

Không thêm gói NuGet hay npm. Dùng `lucide-react` có sẵn: hai icon `Volume2`, `VolumeX` (import đích danh, vào chunk khung, mỗi icon khoảng 0,15 KB gzip).

### Quyết định chính

| # | Quyết định | Lý do |
|---|---|---|
| Q1 | **Chỉ chọn giọng có `lang` bắt đầu bằng `vi` VÀ `localService === true`, và luôn gán `utterance.voice` tường minh** | BR-1. Nếu không gán `voice`, trình duyệt có thể chọn giọng theo `lang` mà đó là giọng chạy trên máy chủ (Chrome "Google tiếng Việt", Edge "Online (Natural)") — nội dung sẽ bị gửi ra ngoài. Hệ quả: máy chỉ có giọng mạng thì coi như không có giọng (nút ẩn, BR-2) |
| Q2 | **Phát hiện giọng nằm trong chunk khung; phần phát âm là chunk riêng** | BR-2 buộc biết có giọng hay không *trước khi* hiện nút, nên phần dò giọng (khoảng 0,4 KB) không thể là chunk "bật mới tải". BR-4 chỉ cần phần *đọc* (chuẩn bị văn bản, bảng viết tắt, phát) tải khi bật lần đầu |
| Q3 | **Bảng viết tắt lấy từ DB qua `GET /api/tro-ly/viet-tat`**, tải một lần cùng lúc nạp chunk phần đọc | du-lieu.md: bảng viết tắt do Trung tâm cập nhật bằng Excel, dùng chung cho F06 (hiểu câu hỏi) và F07 (đọc). Không đóng cứng ở FE. Dữ liệu công khai, nhỏ (khoảng 12 dòng, dưới 1 KB), cache `danh-muc` |
| Q4 | **Lựa chọn bật/tắt lưu `localStorage` khoá `doc-bat` (`"1"`/`"0"`)**, chỉ cờ, không nội dung | BR-5, F09 BR-7 (giữ khi "Bắt đầu lại"). Không mâu thuẫn F06 Q8 ("hội thoại không lưu storage"): hội thoại, câu hỏi, thủ tục đang nói tới vẫn chỉ ở bộ nhớ. Storage chặn (chế độ riêng tư) → giữ trong bộ nhớ trang, không lỗi. Khoá trùng prototype đã duyệt |
| Q5 | **Không bao giờ tự đọc khi chưa bật.** Bật xong mới đọc các câu trả lời **mới**; bật khi đang có câu cũ trên màn hình không đọc câu cũ | AC-3, AC-4, AC-8 (mở lại khung không đọc tiếp câu cũ) |
| Q6 | **Đọc theo hàng đợi các câu ngắn** (≤ 180 ký tự), gọi `speak()` liên tiếp, giữ tham chiếu `SpeechSynthesisUtterance` trong mảng ở mức module cho tới khi đọc xong | Chrome dừng giữa chừng với đoạn dài và có thể thu gom `utterance` đang đọc (sự kiện `end` không bắn). Cách Vàm Cỏ đã dùng, thêm giữ tham chiếu |
| Q7 | **`cancel()` rồi chờ 80 ms mới `speak()`**, kèm "số phiên": mọi lần dừng tăng số phiên, việc đã hẹn mà phiên đã đổi thì bỏ | Chrome và Safari âm thầm bỏ `speak()` gọi sát ngay sau `cancel()`. Số phiên chặn tình huống "tắt đọc / đóng khung trong lúc đang chờ 80 ms hoặc đang tải bảng viết tắt rồi vẫn phát" |
| Q8 | **"Mở khoá" cho Safari iOS:** khi cờ bật, ở thao tác người dùng đầu tiên trong trang (hoặc ngay lúc bấm nút bật), phát một câu rỗng âm lượng 0 | Safari iOS chỉ cho `speak()` sau một thao tác người dùng; câu trả lời đến sau `fetch` (không còn trong thao tác) sẽ bị chặn. Mở khoá một lần là các lần sau trong trang được phát. **Chưa chắc ở mọi bản iOS → bắt buộc thử trên iPhone thật (T11)**. Dự phòng: gặp lỗi `not-allowed` thì nút trở về trạng thái tắt trong phiên (không ghi đè cờ đã lưu); người dùng bấm lại là một thao tác, các câu sau được đọc |
| Q9 | **Quy tắc đọc số và đơn vị là hằng trong mã** (bỏ dấu chấm giữa hai chữ số; `m²`, `m2`, `km`, `cm`, `mm`, `m` sau số → chữ). Bảng viết tắt từ DB | Lấy từ `SPEECH_ABBR` của Vàm Cỏ; `data-mau/tro-ly.json` ghi rõ nhóm này "không đưa vào Excel". Xem **Cần hỏi 3** |

## 2. Dữ liệu

Không có thay đổi. Không entity, cột, chỉ mục, migration.

| Nơi | Nội dung | Ghi chú |
|---|---|---|
| `viet_tat` (`ThuTu`, `ChuVietTat`, `ChuVietTatTimKiem`, `DayDu`) | Đọc qua `INguonDuLieu.VietTats` | Chỉ trả `ChuVietTat` và `DayDu`. `ChuVietTatTimKiem` (bỏ dấu) dành cho F06, không ra trình duyệt. Dữ liệu mẫu nhúng có 12 dòng (TTHC, QĐ-UBND, NĐ-CP, HCC, UBND, QSDĐ, KCN, CCN, TMDV, QH15, CCCD, đk) |
| `localStorage["doc-bat"]` | `"1"` bật, `"0"` tắt; vắng hoặc giá trị lạ = tắt | Cờ duy nhất F07 lưu. F09 giữ khi "Bắt đầu lại" (tải lại trang không xoá `localStorage`) |

## 3. API — hợp đồng giữa BE và FE

Vị trí mã: `src/BackEnd/DichVuCong.Api/Features/Chatbot/DocCauTraLoi/` (chatbot-dev). Không đặt tên thư mục `VietTat` (namespace `Features.Chatbot.VietTat` che lớp entity `VietTat`, cùng lý do với F08 `ThongTinTrungTam`).

| Method + route | Làm gì | Giới hạn tần suất | Cache |
|---|---|---|---|
| `GET /api/tro-ly/viet-tat` | Bảng viết tắt → dạng đầy đủ, theo `ThuTu` | `danh-muc` (300/phút/IP) | Policy `danh-muc` (ETag theo lần nhập, 304); không `[DanhMucQuery]` (không nhận query) |

```csharp
// DocCauTraLoi/VietTatDocDtos.cs
public sealed record VietTatDocDto(string ChuVietTat, string DayDu);

// DocCauTraLoi/VietTatDocController.cs   [ApiController] [Route("api/tro-ly/viet-tat")]
// [HttpGet] [HttpHead] [OutputCache(PolicyName = CachePolicies.DanhMuc)] [EnableRateLimiting(RateLimitPolicies.DanhMuc)]
// Task<ActionResult<IReadOnlyList<VietTatDocDto>>> Get(CancellationToken)

// DocCauTraLoi/VietTatDocService.cs   IVietTatDocService.LayAsync(ct)
//   nguon.VietTats.OrderBy(v => v.ThuTu).Select(v => new VietTatDocDto(v.ChuVietTat, v.DayDu)) → TruyVan (R1–R3)
```

```ts
// src/FrontEnd/src/features/chatbot/doc/bangVietTat.ts  (trong chunk phần đọc)
export interface VietTatDoc { chuVietTat: string; dayDu: string }
export const API_VIET_TAT = '/api/tro-ly/viet-tat';
export function taiBangVietTat(signal?: AbortSignal): Promise<readonly VietTatDoc[]>;  // http() trực tiếp, nhớ promise ở mức module
```

Ví dụ: `GET /api/tro-ly/viet-tat` →

```json
[ { "chuVietTat": "TTHC", "dayDu": "thủ tục hành chính" }, { "chuVietTat": "QĐ-UBND", "dayDu": "quyết định Ủy ban nhân dân" }, { "chuVietTat": "đk", "dayDu": "đăng ký" } ]
```

| HTTP | Khi nào | `code` |
|---|---|---|
| 200 | Luôn (bảng rỗng thì `[]`) | — |
| 304 | `If-None-Match` khớp | — |
| 405 | Phương thức khác | `phuong-thuc-khong-hop-le` |
| 429 | Vượt `RateLimiting:DanhMuc` | `qua-nhieu-yeu-cau` |
| 500 | Lỗi không bắt được | `loi-he-thong` (có `maTraCuu`) |

FE xử lý lỗi bảng viết tắt **không báo người dùng**: đọc nguyên văn (không thay viết tắt) và thử tải lại ở câu trả lời sau (§4.5).

Hợp đồng nội bộ F06 mà F07 dùng, **nguyên văn, không đổi** (F06 plan §6):

```ts
// features/chatbot/diemGhepDoc.ts (F06)
useDiemGhepDoc(): { cauTraLoiMoi: { id: number; vanBan: string } | null; khungDangMo: boolean }
// features/chatbot/vanBanDoc.ts (F06)
vanBanDoc(cau: CauTraLoi, t: TFunction): string
```

## 4. Frontend

### 4.1 Tệp (`src/FrontEnd/src/features/chatbot/`)

```
ChoNutDoc.tsx · useDoCauTraLoi.ts          # thay bản rỗng của F06; trong chunk khung
doc/
  giongDoc.ts            # TĨNH (chunk khung): hoTroDoc, chonGiong, ngheGiongDoi, moKhoaDoc, dungDoc, phienHienTai
  luuLuaChon.ts          # TĨNH: docCoBat(), ghiCoBat(bat)  — khoá "doc-bat"
  napPhanDoc.ts          # TĨNH: napPhanDoc = () => (promise ??= import('./docCauTraLoi'))  — lỗi nạp thì quên promise
  docCauTraLoi.ts        # LƯỜI: docMoi(vanBan), nạp trước bảng viết tắt
  chuanBiVanBan.ts       # LƯỜI: chuanBiVanBanDoc(vanBan, bang) → string[] (các câu để đọc)
  luatDoc.ts             # LƯỜI: biểu thức số, đơn vị, emoji, ký hiệu (hằng)
  bangVietTat.ts         # LƯỜI: taiBangVietTat, dựng một biểu thức từ bảng
  *.test.ts(x)
```

`ChoNutDoc` đứng giữa tên khung và nút ✕ (F06 §5.2). Nút là `IconButton` (`core/components/IconButton`, `bienThe="tren-nen-dam"`, `dangBat={bat}`) — đúng nút `#chat-doc` của prototype đã duyệt (F06 §6 ghi "Chip"; prototype và design-system §5 là `icon-btn` + `aria-pressed`, làm theo prototype).

### 4.2 Nút bật/tắt (BR-2, BR-5, WCAG AA)

- `hoTroDoc()` = `'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'`. Sai → `ChoNutDoc` trả `null`, không đăng ký sự kiện nào (trình duyệt không hỗ trợ).
- `chonGiong()` = trong `speechSynthesis.getVoices()` lấy giọng đầu tiên có `/^vi([-_]|$)/i.test(lang)` và `localService === true`, ưu tiên `lang` đúng `vi-VN` (so `Ordinal` trên `lang`, rồi `name`, để chọn xác định). Không có → `null` → nút ẩn (BR-2), không thông báo, không lỗi (AC-5).
- Giọng nạp bất đồng bộ (Chrome): `coGiong` khởi tạo từ `chonGiong()`, cập nhật khi `voiceschanged`, và kiểm lại một lần sau 1 giây (Chrome Android đôi khi không bắn sự kiện). Giọng xuất hiện sau thì nút hiện sau — không nhảy bố cục đáng kể (đầu khung có chỗ trống giữa tên và ✕).
- Nút: `nhan = t('doc.nhan')` ("Đọc câu trả lời"), **tên cố định**, trạng thái nằm ở `aria-pressed` (WCAG 4.1.2). Hai icon khác hình để trạng thái không chỉ dựa vào màu (WCAG 1.4.1): `Volume2` khi bật, `VolumeX` khi tắt. Vùng bấm theo `IconButton` (≥ 44 px, 48 px ở kiosk), tương phản theo token `tren-nen-dam`.
- Bấm: đảo `bat`; `ghiCoBat(bat)`; bật → `moKhoaDoc()` (Q8) và `napPhanDoc()` chạy trước (không đợi câu trả lời), tắt → `dungDoc()` ngay (AC-3). Không có thông báo `aria-live` riêng: `aria-pressed` đã được trình đọc màn hình đọc khi đổi.
- Mặc định tắt (AC-4): chưa có khoá hoặc giá trị khác `"1"` = tắt.
- Cờ đã bật từ lần trước mà máy hiện không có giọng: nút ẩn, không đọc; cờ giữ nguyên.

### 4.3 Khi nào đọc, khi nào dừng (BR-7, AC-7, AC-8)

`useDoCauTraLoi()` đọc `useDiemGhepDoc()` và giữ `idDaXem` (ref, khởi tạo bằng id hiện có):

| Sự kiện | Việc làm |
|---|---|
| `cauTraLoiMoi.id` đổi | `dungDoc()` (dừng câu đang đọc). Rồi **nếu** `bat && khungDangMo && coGiong` → `napPhanDoc().then(m => m.docMoi(vanBan))`. Đáp án đến khi khung đang đóng (yêu cầu bay lúc đóng) không được đọc |
| `khungDangMo` thành `false` | `dungDoc()` (AC-8: ✕, bấm lại nút "Trợ lý", Esc đều đi qua đây). Mở lại: `idDaXem` đã bằng id cũ nên **không** tự đọc tiếp |
| Tắt đọc | `dungDoc()` |
| Gỡ `ChoNutDoc` (khung bị huỷ khi F06 `batDauLaiTroLy()` đổi `key`) | Dọn hiệu ứng: `dungDoc()` |
| `pagehide` | `dungDoc()` (F09 plan §8.4). Đăng ký ở `ChoNutDoc` khi gắn, gỡ khi dỡ |
| F09 "Bắt đầu lại" | F09 tự gọi `speechSynthesis.cancel()` rồi tải lại trang; `pagehide` bắt thêm một lần. F07 không cần mã riêng. Cờ `doc-bat` còn sau khi tải lại |
| Bật đọc khi đã có câu trên màn hình | Không đọc câu cũ (Q5) |

`dungDoc()` = tăng số phiên + `speechSynthesis.cancel()` trong `try/catch`. `docMoi` bắt đầu bằng `dungDoc()` và ghi nhớ `p = phienHienTai()`; sau mỗi chỗ chờ (tải bảng viết tắt, `setTimeout` 80 ms) nếu `p !== phienHienTai()` thì thoát (Q7). Hai câu trả lời đến sát nhau: câu sau thắng, câu trước không phát.

Giả định cần F06 giữ: `cauTraLoiMoi` chỉ được đặt cho **đáp án từ API** — không cho lời chào, tin chờ, tin lỗi. F06 T11 (cùng chatbot-dev) đối chiếu ở T04 của plan này.

### 4.4 Chuẩn bị văn bản (BR-3, AC-2)

`chuanBiVanBanDoc(vanBan: string, bang: readonly VietTatDoc[]): string[]` — hàm thuần, **không đổi chữ hiển thị** (nhận chuỗi, trả chuỗi mới; chuỗi trong DOM không đụng tới). Thứ tự:

1. `normalize('NFC')`; bỏ ký tự vô hình (U+200B–U+200F, U+FEFF — viết bằng `String.fromCodePoint` hoặc lớp ký tự trong tệp script, không gõ mã thoát qua Edit); bỏ emoji và ký hiệu hình (`\p{Extended_Pictographic}`, cờ `u`); bỏ dấu ngoặc kép các loại; bỏ ký hiệu markdown còn sót (`**`, `` ` ``, `#` đầu dòng, gạch đầu dòng `- ` / `• `).
2. Số và đơn vị (`luatDoc.ts`, hằng; thứ tự từ dài tới ngắn): `(\d)\.(\d)` → `$1$2`; `m²`, `m2` → "mét vuông"; `km` → "ki lô mét"; `cm` → "xen ti mét"; `mm` → "mi li mét"; `m` → "mét" — các đơn vị chỉ khi liền sau chữ số (cho phép một dấu cách) và không đứng trước chữ cái (dùng `(?![\p{L}\p{N}])`, không dùng `\b` vì `\b` sai với chữ có dấu).
3. Viết tắt: dựng **một** biểu thức từ bảng: khoá sắp theo độ dài giảm dần (để "QĐ-UBND" thắng "UBND"), mỗi khoá `escape` ký tự đặc biệt, ghép bằng `|`, bao bằng `(?<![\p{L}\p{N}])(?:…)(?![\p{L}\p{N}])` cờ `giu`. So **không phân biệt hoa thường, phân biệt dấu** (bảng có "đk" chữ thường; câu có thể viết "ĐK" hoặc "TTHC"). Thay bằng `dayDu` tra `Map` theo khoá đã `toLocaleLowerCase('vi')`. Khoá rỗng, dài hơn 50 ký tự, hoặc bảng quá 200 dòng bị bỏ (phòng dữ liệu hỏng). Bảng rỗng → bỏ bước này.
4. Xuống dòng → dấu chấm (thêm "." nếu dòng trước chưa kết thúc bằng `. ! ? … : ;`) để máy ngắt hơi; gộp khoảng trắng.
5. Tách câu: cắt sau `. ! ? …` kèm khoảng trắng bằng `match` (không phụ thuộc lookbehind, dù đích build là Safari 16.4 trở lên); câu dài hơn 180 ký tự cắt tại dấu `, ;` hoặc dấu cách gần nhất trước 180; câu rỗng bỏ. Kết quả luôn có ít nhất một phần tử khi `vanBan` có chữ.

Ví dụ kiểm (T02): `"Theo QĐ-UBND, TTHC này mất 3 ngày, diện tích 30m2, mã 1.001193."` → `"Theo quyết định Ủy ban nhân dân, thủ tục hành chính này mất 3 ngày, diện tích 30 mét vuông, mã 1001193."`

### 4.5 Phát âm — `docCauTraLoi.ts` (BR-1, BR-4)

```ts
export async function docMoi(vanBan: string): Promise<void> {
  dungDoc(); const p = phienHienTai();
  const giong = chonGiong(); if (!giong) return;                      // BR-1/BR-2: không giọng cục bộ → im lặng
  const bang = await taiBangVietTat().catch(() => []);                // lỗi → đọc nguyên văn, không báo
  if (p !== phienHienTai()) return;
  const cau = chuanBiVanBanDoc(vanBan, bang); if (!cau.length) return;
  window.setTimeout(() => {
    if (p !== phienHienTai()) return;
    hangDoi = cau.map((c) => taoUtterance(c, giong));                 // giữ tham chiếu ở mức module
    hangDoi.forEach((u) => speechSynthesis.speak(u));
  }, 80);
}
```

- `taoUtterance`: `voice = giong`, `lang = giong.lang`, `rate = 0,92` (hằng `TOC_DO_DOC`, chậm nhẹ cho người lớn tuổi như Vàm Cỏ), `pitch = 1`, `volume = 1`. `onerror`: lỗi `canceled`/`interrupted` bỏ qua; `not-allowed` → báo `ChoNutDoc` đưa nút về tắt trong phiên (Q8); lỗi khác → dừng hàng đợi, không báo. Câu cuối `onend` → giải phóng `hangDoi`.
- `taiBangVietTat`: một `Promise` ở mức module; gọi `http<VietTatDoc[]>(API_VIET_TAT)`; kiểm hình dạng (mảng, `chuVietTat` và `dayDu` là chuỗi) và bỏ phần tử sai; thất bại → xoá promise (lần sau thử lại), trả `[]` cho lần này. Tải một lần mỗi lần tải trang; kiosk nhận bảng mới sau "Bắt đầu lại" (tải lại trang). Gọi sớm bằng `napPhanDoc().then(m => m.nap())` ngay khi bấm bật để câu trả lời đầu không phải chờ.
- Không `console`, không ghi log nội dung đọc.

### 4.6 Câu chữ (i18n)

Một khoá mới trong `features/chatbot/i18n/vi.json` (namespace `chatbot`, F06 T09): `doc.nhan` = "Đọc câu trả lời". Không thêm `common.json` (không vào bundle chính). Không có chuỗi nào khác: không thông báo "không có giọng" (xem Cần hỏi 1).

### 4.7 Thành phần dùng lại và thành phần mới

| Cần | Dùng | Ghi chú |
|---|---|---|
| Nút icon bật/tắt | `IconButton` (core, có `dangBat`) | Có sẵn; không thêm vào `core/` |
| Gọi API | `http` (core/api) | Đã ở bundle chính |
| Điểm ghép | `useDiemGhepDoc`, `vanBanDoc` (F06) | Dùng đúng tên |

**ui-core-dev không phải thêm gì vào `core/`.**

## 5. Hiệu năng

| Mục | Ước tính (gzip, đã obfuscate) | Chỉ tiêu |
|---|---|---|
| Bundle chính (tải đầu) | **+0 KB** | Còn nguyên ~12 KB cho F05, F06 vỏ, F09 keo. F07 không lấy phần nào |
| Chunk khung (đã lười) | +1,0–1,5 KB: `ChoNutDoc`, `useDoCauTraLoi`, `giongDoc`, `luuLuaChon`, `napPhanDoc`, 2 icon, 1 khoá chữ | F06 ước khung 14–20 KB; cộng F07 vẫn ≤ 25 KB (ngưỡng báo của F06 T13) |
| **Chunk phần đọc** (`docCauTraLoi` + `chuanBiVanBan` + `luatDoc` + `bangVietTat`) | 1,8–2,5 KB trước obfuscate; đo thực 3,9 KB sau obfuscate (hơn 2 KB là chi phí obfuscate) | **Mục tiêu ≤ 4 KB sau obfuscate** (đã chấp nhận 2026-10-13: ≤ 4 KB sau obfuscate; mục tiêu cũ 3 KB, F7-1 ở `result/test.md`) |
| `GET /api/tro-ly/viet-tat` | < 1 KB thân; 304 khi không đổi | p95 ≤ 300 ms (đọc một bảng nhỏ qua khoá chính + output cache) |

- **Khi nào tải gì:** chưa mở khung → không gì. Mở khung → mã dò giọng + nút (trong chunk khung). **Bật đọc lần đầu** (hoặc câu trả lời đầu tiên khi cờ đã bật từ lần trước) → chunk phần đọc + `GET viet-tat`, song song. Tắt rồi bật lại: không tải thêm (promise đã nhớ).
- Độ trễ từ lúc có câu trả lời đến tiếng đầu tiên: bình thường < 150 ms (80 ms chờ sau `cancel`); lần đầu thêm thời gian tải chunk và bảng (đã nạp trước khi bấm bật nên thường không còn).
- Không có timer nào chạy nền: chỉ một `setTimeout` 80 ms mỗi câu và một lần kiểm giọng sau 1 giây khi gắn nút.
- Không ảnh hưởng LCP, CLS (nút nằm trong khung, khung là lớp phủ cố định).

## 6. Bảo mật

| Mối lo | Biện pháp |
|---|---|
| Nội dung câu trả lời không được rời máy (BR-1) | Chỉ giọng `localService`, gán `voice` tường minh (Q1); không `fetch` nào mang văn bản đọc (chỉ `GET viet-tat`, không tham số); không dịch vụ đọc ngoài; CSP `connect-src 'self'` đã chặn mọi đích ngoài. Review T07 kiểm; e2e T10 kiểm danh sách yêu cầu mạng khi đọc |
| Micro (BR-6) | Không dùng `SpeechRecognition`, `webkitSpeechRecognition`, `getUserMedia`, `mediaDevices`. Test quét mã nguồn FE (T05). Header `Permissions-Policy: microphone=()` (F00) chặn thêm một lớp. e2e T10 gắn bẫy các API micro và đếm = 0 |
| Dữ liệu từ BE vào bộ đọc | Bảng viết tắt là chữ thuần đưa thẳng vào `SpeechSynthesisUtterance.text`, **không HTML, không `innerHTML`**. FE kiểm hình dạng, giới hạn 200 dòng, khoá ≤ 50 ký tự; khoá được `escape` trước khi đưa vào `RegExp` (không ReDoS: chỉ các chuỗi cố định nối bằng `|`, có biên) |
| Dữ liệu ra trình duyệt | Chỉ `chuVietTat`, `dayDu` (công khai). Không `thuTu`, không `chuVietTatTimKiem` |
| Lưu trữ | Chỉ `localStorage["doc-bat"]`, giá trị `"1"`/`"0"`. Không nội dung câu hỏi hay trả lời. F09 AC-9 (quét storage không còn dữ liệu người trước) phải cho phép khoá này (T11 ghi vào báo cáo) |
| Giới hạn tần suất | `danh-muc` cho GET. Một lần mỗi lần tải trang |
| Lỗi | ProblemDetails có `code`, không stack trace. FE nuốt lỗi bảng viết tắt (đọc nguyên văn) |
| Mã nguồn | Luật đọc nằm ở FE (không phải logic nghiệp vụ cần giấu). Bản build theo CLAUDE.md (obfuscate, không source map) |

## 7. Truy vết BR/AC → plan → task

| Mục | Phần plan xử lý | Task |
|---|---|---|
| BR-1 chỉ giọng cài sẵn, không gửi ra ngoài | Q1, §4.2, §4.5, §6 | T03, T07, T10 |
| BR-2 không giọng tiếng Việt → ẩn nút | §4.2 | T03, T04, T10 |
| BR-3 đọc viết tắt theo bảng | Q3, Q9, §3, §4.4 | T01, T02, T09, T10 |
| BR-4 phần đọc chỉ tải khi bật lần đầu | Q2, §4.1, §4.5, §5 | T03, T04, T06, T10 |
| BR-5 mặc định tắt, nhớ lựa chọn kể cả kiosk | Q4, §2, §4.2 | T03, T04, T10 |
| BR-6 không xin quyền micro | §6 | T05, T10 |
| BR-7 câu mới hoặc đóng khung → dừng | Q5, Q7, §4.3 | T03, T04, T10 |
| AC-1 bật, hỏi → nghe đọc | §4.3, §4.5 | T04, T10, T11 |
| AC-2 "TTHC" → "thủ tục hành chính" | §4.4 | T01, T02, T10, T11 |
| AC-3 tắt → không phát; tải lại vẫn tắt | §4.2, Q4 | T03, T04, T10 |
| AC-4 lần đầu → tắt | §4.2 | T03, T04, T10 |
| AC-5 không giọng → không nút, không lỗi | §4.2 | T03, T04, T10, T11 |
| AC-6 không hỏi quyền micro | §6 | T05, T10, T11 |
| AC-7 đang đọc, câu mới → dừng, đọc mới | Q7, §4.3 | T03, T04, T10 |
| AC-8 đóng khung → dừng ngay; mở lại không đọc tiếp | §4.3 | T04, T10, T11 |
| F09 BR-7 (dừng khi "Bắt đầu lại", giữ cờ) | §4.3, F09 plan §4.2, §8.4 | T04, T10 |
| Ngân sách JS (CLAUDE.md) | §5 | T06, T10 |

## 8. Rủi ro

1. **Safari iOS chặn đọc sau `fetch`.** Mở khoá (Q8) là cách phổ biến nhưng chưa chắc ở mọi bản iOS. Giảm thiểu: dự phòng `not-allowed` (nút về tắt, bấm lại là đọc); thử iPhone thật ở T11; nếu không đạt, báo planner để cân nhắc nút "Nghe" trên từng tin (cần ba-analyst vì ngoài spec).
2. **Zalo / WebView** thường không có `speechSynthesis` hoặc không có giọng → nút ẩn theo BR-2, không lỗi. Có WebView khai báo có giọng mà không phát tiếng: không phát hiện được từ mã. Ghi vào hướng dẫn vận hành; thử tay ở T11.
3. **Giọng có sẵn nhưng là giọng mạng** (Chrome "Google tiếng Việt", Edge "Online (Natural)") bị loại theo Q1 → trên nhiều máy nút sẽ ẩn dù trình duyệt "có tiếng Việt". Đúng BR-1; phải cài giọng cục bộ (Windows: gói ngôn ngữ tiếng Việt; Android: dữ liệu giọng Việt ngoại tuyến). Ghi vào hướng dẫn vận hành của F09 §9 mục 5 (hiện chỉ nói "cài giọng đọc"). Trình duyệt và hệ điều hành của kiosk: câu hỏi mở 10, còn mở.
4. **Chrome dừng giữa chừng / bỏ `speak()` sau `cancel()`:** xử lý bằng hàng đợi câu ngắn, giữ tham chiếu, chờ 80 ms (Q6, Q7). Không dùng mẹo `pause()/resume()` (Vàm Cỏ ghi là không ổn trên Android).
5. **Chất lượng đọc thực tế** (giọng Việt cục bộ đọc số hiệu văn bản `123/2024/NĐ-CP`, ngày `12/05/2026`, tiền): luật đọc hiện chỉ gồm viết tắt, số liền, đơn vị. Chưa chuẩn hoá ngày và số hiệu. T11 nghe thử câu thật; điểm nào kém ghi vào `result/test.md`, thêm luật vào `luatDoc.ts` ở vòng sau.
6. **Bảng viết tắt khớp nhầm chữ thường** (so không phân biệt hoa thường): khoá ngắn như "đk" khớp "ĐK" nhưng không khớp trong từ (có biên chữ cái/chữ số). Khoá trùng một từ tiếng Việt thật (ví dụ ghi "cp" cho "chính phủ") sẽ thay mọi chữ "cp" — do nội dung bảng, Trung tâm cần biết khi nhập.
7. **Bảng viết tắt chỉ tải một lần mỗi lần tải trang:** sửa bảng (nhập lại Excel) thì máy kiosk đang chạy chưa thấy cho tới "Bắt đầu lại" (tải lại trang). Chấp nhận.
8. **`F06 cauTraLoiMoi` đặt cho cả lời chào hay tin lỗi** → bị đọc. Đối chiếu ở T04.
9. **Tệp dùng chung** `features/chatbot/i18n/vi.json`, `ChatbotServiceCollectionExtensions.cs` còn do F06 sửa: đọc lại ngay trước khi sửa, không ghi đè phần của task khác.
10. **Ký tự vô hình khi sửa tệp:** không gõ mã thoát Unicode qua Edit hay Bash; sau khi ghi tệp có chữ tiếng Việt kiểm bằng lệnh ở `tasks.md`.

## 9. Cần hỏi

Làm theo đề xuất nếu không ai phản đối; chọn khác thì planner sửa plan trước khi làm phần liên quan. Mục cần ba-analyst sửa spec ghi rõ.

| # | Câu hỏi | Phương án | Đề xuất | Ảnh hưởng |
|---|---|---|---|---|
| 1 | **Máy không có giọng tiếng Việt: ẩn nút hay thông báo?** Spec BR-2 và AC-5 nói ẩn nút, không lỗi; yêu cầu bên điều phối nói "thông báo rõ" | (a) Ẩn nút, im lặng (đúng spec). (b) Hiện nút mờ kèm dòng "Máy này chưa có giọng đọc tiếng Việt" — phải sửa BR-2, AC-5 | (a): spec đã duyệt; người dân không cần thấy chức năng họ không dùng được. Hướng dẫn vận hành (F09 §9 mục 5) lo việc cài giọng cho kiosk | §4.2, T04. Chọn (b) → ba-analyst sửa spec rồi planner thêm một khoá chữ và trạng thái nút |
| 2 | **Dừng ngay khi gửi câu hỏi mới hay khi có câu trả lời mới?** BR-7 và hợp đồng `DiemGhepDoc` (F06 §6) chỉ có tín hiệu "câu trả lời mới". AC-7 viết "gửi câu hỏi mới → câu cũ dừng" | (a) Dừng khi câu trả lời mới đến (đúng BR-7, không đổi hợp đồng F06). (b) Dừng ngay lúc gửi: F06 thêm trường `dangCho` vào `DiemGhepDoc` | (a). Khoảng im lặng chỉ bằng thời gian trả lời (p95 ≤ 300 ms + mạng). Chọn (b) thì F06 T11 thêm một trường và F07 T04 dùng nó | §4.3, T04 |
| 3 | **Luật đọc số và đơn vị** (bỏ dấu chấm trong "1.001193" và "2.000 đồng" → "1001193", "2000"; "30m2" → "30 mét vuông"): spec chỉ nói bảng viết tắt | (a) Làm như Vàm Cỏ (hằng trong mã). (b) Chỉ viết tắt, bỏ phần số. (c) Mã thủ tục không đọc (cần F06 `vanBanDoc` bỏ mã) hoặc đọc từng chữ số | (a): máy đọc "1.001193" thành "một chấm không không…" rất khó nghe; luật nhỏ, không đổi chữ hiển thị. Số thập phân dùng dấu phẩy nên không bị ảnh hưởng. (c) để vòng sau nếu nghe thử thấy kém | §4.4, Q9, T02 |
| 4 | **Giọng Android dùng dữ liệu Google nhưng chạy cục bộ** có thể khai `localService = false` → nút ẩn trên một số điện thoại | (a) Theo BR-1 chặt: chỉ `localService`. (b) Cho cả giọng không cục bộ | (a): BR-1 cấm gửi nội dung ra ngoài, không có cách tin cậy để phân biệt. Thử trên vài điện thoại ở T11 để biết tỷ lệ | Q1, T11 |
| 5 | **Tốc độ đọc 0,92** (Vàm Cỏ để chậm nhẹ cho người lớn tuổi) | (a) 0,92. (b) 1,0 | (a), là hằng `TOC_DO_DOC`; chỉnh sau khi nghe thử | §4.5 |
| 6 | **Không có nút "đọc lại" từng tin, không có tạm dừng** (spec và prototype chỉ có một nút bật/tắt) | (a) Giữ như spec. (b) Thêm nút nghe lại trên mỗi tin — ngoài phạm vi, cần ba-analyst | (a). Gợi ý cho vòng sau nếu người dùng thật cần | §4.2 |
