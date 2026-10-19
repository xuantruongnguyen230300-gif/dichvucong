/**
 * Giọng đọc của máy (F07 plan §4.2, Q1, Q7, Q8). Nằm trong chunk khung chat: phải biết máy có giọng hay không TRƯỚC khi
 * hiện nút (BR-2), nên phần này không thể là chunk "bật mới tải". Phần phát âm ở `docCauTraLoi.ts` (nạp lười).
 */

/** Giọng tiếng Việt: `vi`, `vi-VN`, `vi_VN` (Android). */
const LA_TIENG_VIET = /^vi([-_]|$)/i;

/** Số phiên: mỗi lần dừng tăng một; việc đã hẹn mà phiên đã đổi thì bỏ (chặn phát sau khi tắt/đóng/có câu mới). */
let phien = 0;
let daMoKhoa = false;
const ngheKhongDuocPhepCuaNut = new Set<() => void>();

/** Trình duyệt có `speechSynthesis` và `SpeechSynthesisUtterance` (Zalo/WebView cũ thường không). */
export function hoTroDoc(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis === 'object' &&
    window.speechSynthesis !== null &&
    typeof globalThis.SpeechSynthesisUtterance === 'function'
  );
}

const soSanh = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const uuTienViVn = (giong: SpeechSynthesisVoice) => (giong.lang.toLowerCase().replace('_', '-') === 'vi-vn' ? 0 : 1);

/**
 * Giọng tiếng Việt CHẠY TRÊN MÁY (`localService`): giọng chạy qua mạng gửi chữ ra ngoài nên không tính (BR-1, BR-2).
 * Ưu tiên `vi-VN`; sắp theo `lang` rồi `name` để luôn chọn cùng một giọng dù danh sách đổi thứ tự. Không có thì `null`.
 */
export function chonGiong(): SpeechSynthesisVoice | null {
  if (!hoTroDoc()) return null;
  try {
    const ungVien = window.speechSynthesis
      .getVoices()
      .filter((g) => g.localService && LA_TIENG_VIET.test(g.lang))
      .sort((a, b) => uuTienViVn(a) - uuTienViVn(b) || soSanh(a.lang, b.lang) || soSanh(a.name, b.name));
    return ungVien[0] ?? null;
  } catch {
    return null;
  }
}

/** Danh sách giọng nạp bất đồng bộ (Chrome): gọi `khiDoi` mỗi lần đổi. Trả hàm gỡ. */
export function ngheGiongDoi(khiDoi: () => void): () => void {
  if (!hoTroDoc()) return () => undefined;
  const kho = window.speechSynthesis;
  kho.addEventListener('voiceschanged', khiDoi);
  return () => kho.removeEventListener('voiceschanged', khiDoi);
}

export const phienHienTai = (): number => phien;

/** Dừng ngay và đổi phiên. Trả số phiên mới để nơi gọi giữ lại. */
export function dungDoc(): number {
  phien += 1;
  if (hoTroDoc()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* trình duyệt không cho huỷ: bỏ qua */
    }
  }
  return phien;
}

/**
 * Safari iOS chỉ cho phát tiếng sau một thao tác người dùng; đáp án đến sau `fetch` đã ra ngoài thao tác.
 * Một câu rỗng âm lượng 0 ở thao tác đầu để mở khoá cho cả trang. Vẫn gán giọng cục bộ (BR-1). Chỉ làm một lần.
 */
export function moKhoaDoc(): void {
  const giong = chonGiong();
  if (daMoKhoa || !giong) return;
  try {
    if (window.speechSynthesis.speaking) return;
    const cau = new SpeechSynthesisUtterance('');
    cau.voice = giong;
    cau.lang = giong.lang;
    cau.volume = 0;
    window.speechSynthesis.speak(cau);
    daMoKhoa = true;
  } catch {
    /* bỏ qua */
  }
}

export const daMoKhoaDoc = (): boolean => daMoKhoa;

/** Trình duyệt từ chối phát (`not-allowed`): nút về trạng thái tắt trong phiên (không đổi cờ đã lưu). */
export function ngheKhongDuocPhep(khi: () => void): () => void {
  ngheKhongDuocPhepCuaNut.add(khi);
  return () => {
    ngheKhongDuocPhepCuaNut.delete(khi);
  };
}

export function baoKhongDuocPhep(): void {
  for (const khi of ngheKhongDuocPhepCuaNut) khi();
}
