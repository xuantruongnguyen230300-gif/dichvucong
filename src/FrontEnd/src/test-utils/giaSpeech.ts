import { vi } from 'vitest';

/** Đồ giả cho test: `speechSynthesis` và `SpeechSynthesisUtterance` (jsdom không có). Không dùng trong mã chạy thật. */
export interface GiongGia {
  name: string;
  lang: string;
  localService: boolean;
}

export class CauDocGia {
  text: string;
  voice: GiongGia | null = null;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text = '') {
    this.text = text;
  }
}

export const GIONG_VN: GiongGia = { name: 'Giọng VN trên máy', lang: 'vi-VN', localService: true };
export const GIONG_VN_MANG: GiongGia = { name: 'Google tiếng Việt', lang: 'vi-VN', localService: false };
export const GIONG_ANH: GiongGia = { name: 'English', lang: 'en-US', localService: true };

export interface SpeechGia {
  speak: ReturnType<typeof vi.fn<(c: CauDocGia) => void>>;
  cancel: ReturnType<typeof vi.fn<() => void>>;
  /** Đổi danh sách giọng rồi bắn `voiceschanged`. */
  datGiong: (giong: GiongGia[]) => void;
  /** Mọi câu đã `speak()` theo thứ tự. */
  cacCauDaDoc: () => CauDocGia[];
  /** Mọi chữ đã `speak()` ghép lại. */
  chuDaDoc: () => string;
  soNguoiNghe: () => number;
}

/** Cài `speechSynthesis` giả; gỡ bằng `vi.unstubAllGlobals()`. */
export function giaSpeech(giong: GiongGia[] = [GIONG_VN]): SpeechGia {
  let danhSach = giong;
  const nguoiNghe = new Set<() => void>();
  const speak = vi.fn<(c: CauDocGia) => void>();
  const cancel = vi.fn<() => void>();
  const kho = {
    speaking: false,
    getVoices: () => danhSach,
    speak,
    cancel,
    addEventListener: (_ten: string, f: () => void) => nguoiNghe.add(f),
    removeEventListener: (_ten: string, f: () => void) => nguoiNghe.delete(f),
  };
  vi.stubGlobal('speechSynthesis', kho);
  vi.stubGlobal('SpeechSynthesisUtterance', CauDocGia);
  return {
    speak,
    cancel,
    datGiong: (moi) => {
      danhSach = moi;
      for (const f of [...nguoiNghe]) f();
    },
    cacCauDaDoc: () => speak.mock.calls.map(([c]) => c),
    chuDaDoc: () => speak.mock.calls.map(([c]) => c.text).join(' '),
    soNguoiNghe: () => nguoiNghe.size,
  };
}

export const BANG_VIET_TAT_MAU = [
  { chuVietTat: 'TTHC', dayDu: 'thủ tục hành chính' },
  { chuVietTat: 'QĐ-UBND', dayDu: 'quyết định Ủy ban nhân dân' },
  { chuVietTat: 'đk', dayDu: 'đăng ký' },
];

/** Cài `fetch` giả cho `GET /api/tro-ly/viet-tat`; ghi lại mọi lần gọi. */
export function giaFetchVietTat(tra: () => Response = () => Response.json(BANG_VIET_TAT_MAU)) {
  const fn = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(tra()));
  vi.stubGlobal('fetch', fn);
  return fn;
}
