import { taiBangVietTat } from './bangVietTat';
import { chuanBiVanBanDoc } from './chuanBiVanBan';
import { baoKhongDuocPhep, chonGiong, dungDoc, phienHienTai } from './giongDoc';

/** Tốc độ đọc: chậm nhẹ cho người lớn tuổi (plan Cần hỏi 5). */
export const TOC_DO_DOC = 0.92;
/** Chrome và Safari âm thầm bỏ `speak()` gọi sát ngay sau `cancel()` (Q7). */
const CHO_SAU_HUY_MS = 80;

/** Giữ tham chiếu: Chrome có thể thu gom `utterance` đang đọc và không bắn `end` (Q6). */
let hangDoi: SpeechSynthesisUtterance[] = [];

/** Gọi sớm (khi vừa bấm bật) để câu trả lời đầu không phải chờ bảng viết tắt. */
export function nap(): Promise<unknown> {
  return taiBangVietTat();
}

function taoCauDoc(chu: string, giong: SpeechSynthesisVoice): SpeechSynthesisUtterance {
  const cau = new SpeechSynthesisUtterance(chu);
  cau.voice = giong; // luôn gán tường minh: không gán thì trình duyệt có thể chọn giọng chạy trên máy chủ (BR-1)
  cau.lang = giong.lang;
  cau.rate = TOC_DO_DOC;
  cau.pitch = 1;
  cau.volume = 1;
  cau.onerror = (e) => {
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    dungDoc(); // lỗi khác: dừng cả hàng đợi, không báo
    if (e.error === 'not-allowed') baoKhongDuocPhep();
  };
  return cau;
}

/**
 * Đọc một câu trả lời mới. `phien` là số phiên lấy từ `dungDoc()` lúc có câu trả lời; sau mỗi chỗ chờ (nạp chunk, tải bảng,
 * 80 ms) mà phiên đã đổi (tắt, đóng khung, câu mới hơn) thì bỏ, không phát.
 */
export async function docMoi(vanBan: string, phien: number = dungDoc()): Promise<void> {
  if (phien !== phienHienTai()) return;
  const giong = chonGiong();
  if (!giong) return;
  const bang = await taiBangVietTat();
  if (phien !== phienHienTai()) return;
  const cacCau = chuanBiVanBanDoc(vanBan, bang);
  if (cacCau.length === 0) return;
  window.setTimeout(() => {
    if (phien !== phienHienTai()) return;
    const danhSach = cacCau.map((c) => taoCauDoc(c, giong));
    const cuoi = danhSach.at(-1);
    if (cuoi) {
      cuoi.onend = () => {
        if (hangDoi === danhSach) hangDoi = [];
      };
    }
    hangDoi = danhSach;
    try {
      for (const cau of danhSach) window.speechSynthesis.speak(cau);
    } catch {
      dungDoc(); // trình duyệt từ chối phát: im lặng, không lỗi
    }
  }, CHO_SAU_HUY_MS);
}
