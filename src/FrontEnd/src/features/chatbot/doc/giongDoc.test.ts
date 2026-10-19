import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  baoKhongDuocPhep,
  chonGiong,
  dungDoc,
  hoTroDoc,
  moKhoaDoc,
  ngheGiongDoi,
  ngheKhongDuocPhep,
  phienHienTai,
} from './giongDoc';
import { CauDocGia, GIONG_ANH, GIONG_VN, GIONG_VN_MANG, giaSpeech, type GiongGia } from '../../../test-utils/giaSpeech';

afterEach(() => vi.unstubAllGlobals());

const GIONG_VI: GiongGia = { name: 'Giọng vi', lang: 'vi', localService: true };
const GIONG_VN_ANDROID: GiongGia = { name: 'Android vi', lang: 'vi_VN', localService: true };

describe('chonGiong (BR-1, BR-2)', () => {
  it('chọn vi-VN chạy trên máy', () => {
    giaSpeech([GIONG_ANH, GIONG_VN]);
    expect(chonGiong()).toBe(GIONG_VN);
  });

  it('bỏ giọng vi-VN chạy qua mạng: máy chỉ có giọng mạng coi như không có giọng', () => {
    giaSpeech([GIONG_VN_MANG, GIONG_ANH]);
    expect(chonGiong()).toBeNull();
    expect(hoTroDoc()).toBe(true);
  });

  it('bỏ en-US; không giọng nào thì null', () => {
    giaSpeech([GIONG_ANH]);
    expect(chonGiong()).toBeNull();
    giaSpeech([]);
    expect(chonGiong()).toBeNull();
  });

  it('có giọng mạng và giọng cục bộ: chọn đúng giọng cục bộ', () => {
    giaSpeech([GIONG_VN_MANG, GIONG_VI]);
    expect(chonGiong()).toBe(GIONG_VI);
  });

  it('nhận lang vi, vi_VN (Android); ưu tiên vi-VN', () => {
    giaSpeech([GIONG_VI, GIONG_VN_ANDROID]);
    expect(chonGiong()).toBe(GIONG_VN_ANDROID);
    giaSpeech([GIONG_VI, GIONG_VN]);
    expect(chonGiong()).toBe(GIONG_VN);
  });

  it('không nhận lang bắt đầu bằng "vi" nhưng không phải tiếng Việt', () => {
    giaSpeech([{ name: 'Lạ', lang: 'vis-XX', localService: true }]);
    expect(chonGiong()).toBeNull();
  });

  it('hai giọng vi-VN: luôn chọn cùng một giọng dù đảo thứ tự danh sách', () => {
    const a: GiongGia = { name: 'An', lang: 'vi-VN', localService: true };
    const b: GiongGia = { name: 'Binh', lang: 'vi-VN', localService: true };
    giaSpeech([a, b]);
    const truoc = chonGiong();
    giaSpeech([b, a]);
    expect(chonGiong()).toBe(truoc);
    expect(truoc).toBe(a);
  });

  it('không có speechSynthesis: hoTroDoc sai, không ném lỗi', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(hoTroDoc()).toBe(false);
    expect(chonGiong()).toBeNull();
    expect(() => dungDoc()).not.toThrow();
    expect(() => moKhoaDoc()).not.toThrow();
    expect(ngheGiongDoi(() => undefined)()).toBeUndefined();
  });

  it('có speechSynthesis nhưng thiếu SpeechSynthesisUtterance: không hỗ trợ', () => {
    giaSpeech([GIONG_VN]);
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    expect(hoTroDoc()).toBe(false);
  });

  it('getVoices ném lỗi: không giọng, không ném', () => {
    const g = giaSpeech([GIONG_VN]);
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => {
        throw new Error('hỏng');
      },
      speak: g.speak,
      cancel: g.cancel,
    });
    expect(chonGiong()).toBeNull();
  });
});

describe('ngheGiongDoi', () => {
  it('gọi lại khi voiceschanged; hàm gỡ ngừng nghe', () => {
    const g = giaSpeech([]);
    const khiDoi = vi.fn();
    const go = ngheGiongDoi(khiDoi);
    expect(g.soNguoiNghe()).toBe(1);
    g.datGiong([GIONG_VN]);
    expect(khiDoi).toHaveBeenCalledOnce();
    go();
    expect(g.soNguoiNghe()).toBe(0);
  });
});

describe('dungDoc và số phiên', () => {
  it('mỗi lần dừng: cancel() và tăng số phiên', () => {
    const g = giaSpeech();
    const truoc = phienHienTai();
    const moi = dungDoc();
    expect(moi).toBe(truoc + 1);
    expect(phienHienTai()).toBe(moi);
    expect(g.cancel).toHaveBeenCalledOnce();
  });

  it('cancel() ném lỗi: không ném ra ngoài, phiên vẫn tăng', () => {
    const g = giaSpeech();
    g.cancel.mockImplementation(() => {
      throw new Error('hỏng');
    });
    const truoc = phienHienTai();
    expect(() => dungDoc()).not.toThrow();
    expect(phienHienTai()).toBe(truoc + 1);
  });
});

describe('moKhoaDoc (Safari iOS)', () => {
  it('phát một câu rỗng âm lượng 0 với giọng cục bộ, chỉ một lần', async () => {
    vi.resetModules();
    const giongMoi = await import('./giongDoc');
    const g = giaSpeech([GIONG_VN]);
    giongMoi.moKhoaDoc();
    giongMoi.moKhoaDoc();
    expect(g.speak).toHaveBeenCalledOnce();
    const cau = g.cacCauDaDoc()[0] as CauDocGia;
    expect(cau.text).toBe('');
    expect(cau.volume).toBe(0);
    expect(cau.voice).toBe(GIONG_VN);
    expect(giongMoi.daMoKhoaDoc()).toBe(true);
  });

  it('không giọng cục bộ: không phát gì (không để trình duyệt tự chọn giọng)', async () => {
    vi.resetModules();
    const giongMoi = await import('./giongDoc');
    const g = giaSpeech([GIONG_VN_MANG]);
    giongMoi.moKhoaDoc();
    expect(g.speak).not.toHaveBeenCalled();
    expect(giongMoi.daMoKhoaDoc()).toBe(false);
  });
});

describe('ngheKhongDuocPhep', () => {
  it('báo cho người nghe, gỡ thì thôi', () => {
    const khi = vi.fn();
    const go = ngheKhongDuocPhep(khi);
    baoKhongDuocPhep();
    expect(khi).toHaveBeenCalledOnce();
    go();
    baoKhongDuocPhep();
    expect(khi).toHaveBeenCalledOnce();
  });
});
