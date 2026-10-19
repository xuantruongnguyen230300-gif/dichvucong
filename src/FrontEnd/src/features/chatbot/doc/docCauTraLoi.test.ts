import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { phanHoiLoi } from '../../thu-tuc/thuTucMau';
import { CauDocGia, GIONG_ANH, GIONG_VN, GIONG_VN_MANG, giaFetchVietTat, giaSpeech } from '../../../test-utils/giaSpeech';

// Mỗi ca nạp lại module (promise bảng viết tắt, hàng đợi ở mức module) và dùng đồng hồ giả
beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function dung(giong = [GIONG_VN]) {
  const speech = giaSpeech(giong);
  const fetchGia = giaFetchVietTat();
  const doc = await import('./docCauTraLoi');
  const giongDoc = await import('./giongDoc');
  return { speech, fetchGia, doc, giongDoc };
}

describe('docMoi', () => {
  it('gọi cancel() rồi chỉ speak() sau 80 ms; chữ viết tắt được đọc đầy đủ', async () => {
    const { speech, doc } = await dung();
    await doc.docMoi('Xem TTHC này.');
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(79);
    expect(speech.speak).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(speech.speak).toHaveBeenCalledOnce();
    expect(speech.chuDaDoc()).toBe('Xem thủ tục hành chính này.');
  });

  it('mỗi câu một utterance: voice = giọng đã chọn, lang, rate 0,92', async () => {
    const { speech, doc } = await dung([GIONG_ANH, GIONG_VN]);
    await doc.docMoi('Câu một. Câu hai. Câu ba.');
    await vi.advanceTimersByTimeAsync(80);
    const cau = speech.cacCauDaDoc();
    expect(cau.map((c) => c.text)).toEqual(['Câu một.', 'Câu hai.', 'Câu ba.']);
    for (const c of cau) {
      expect(c.voice).toBe(GIONG_VN);
      expect(c.lang).toBe('vi-VN');
      expect(c.rate).toBe(doc.TOC_DO_DOC);
      expect(c.volume).toBe(1);
    }
    expect(doc.TOC_DO_DOC).toBe(0.92);
  });

  it('không giọng cục bộ (chỉ giọng mạng hoặc tiếng khác): không speak()', async () => {
    const { speech, doc } = await dung([GIONG_VN_MANG, GIONG_ANH]);
    await doc.docMoi('Xin chào.');
    await vi.advanceTimersByTimeAsync(500);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('dungDoc() giữa lúc chờ 80 ms: không speak()', async () => {
    const { speech, doc, giongDoc } = await dung();
    await doc.docMoi('Xin chào.');
    await vi.advanceTimersByTimeAsync(40);
    giongDoc.dungDoc();
    await vi.advanceTimersByTimeAsync(200);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('dungDoc() giữa lúc chờ bảng viết tắt: không speak()', async () => {
    const speech = giaSpeech();
    let xong!: (r: Response) => void;
    const treo = new Promise<Response>((r) => (xong = r));
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockReturnValue(treo));
    const doc = await import('./docCauTraLoi');
    const giongDoc = await import('./giongDoc');
    const dangDoc = doc.docMoi('Xin chào.');
    await vi.advanceTimersByTimeAsync(10);
    giongDoc.dungDoc();
    xong(Response.json([]));
    await dangDoc;
    await vi.advanceTimersByTimeAsync(300);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('số phiên cũ (đã có dungDoc sau đó): bỏ ngay, không nạp bảng', async () => {
    const { speech, fetchGia, doc, giongDoc } = await dung();
    const cu = giongDoc.dungDoc();
    giongDoc.dungDoc();
    await doc.docMoi('Xin chào.', cu);
    await vi.advanceTimersByTimeAsync(300);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('hai docMoi liên tiếp: chỉ phát câu sau', async () => {
    const { speech, doc } = await dung();
    const a = doc.docMoi('Câu cũ.');
    const b = doc.docMoi('Câu mới.');
    await Promise.all([a, b]);
    await vi.advanceTimersByTimeAsync(300);
    expect(speech.chuDaDoc()).toBe('Câu mới.');
  });

  it('lỗi tải bảng viết tắt: vẫn đọc nguyên văn', async () => {
    const speech = giaSpeech();
    giaFetchVietTat(() => phanHoiLoi(500, 'loi-he-thong'));
    const doc = await import('./docCauTraLoi');
    await doc.docMoi('Xem TTHC này.');
    await vi.advanceTimersByTimeAsync(80);
    expect(speech.chuDaDoc()).toBe('Xem TTHC này.');
  });

  it('văn bản không có chữ: không speak()', async () => {
    const { speech, doc } = await dung();
    await doc.docMoi('   ');
    await vi.advanceTimersByTimeAsync(300);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('không fetch nào mang văn bản đọc: chỉ GET địa chỉ bảng viết tắt, không body (BR-1)', async () => {
    const { speech, fetchGia, doc } = await dung();
    await doc.docMoi('Số CCCD 012345678901 của tôi.');
    await doc.docMoi('Số CCCD 012345678901 của tôi.');
    await vi.advanceTimersByTimeAsync(80);
    expect(speech.speak).toHaveBeenCalled();
    expect(fetchGia).toHaveBeenCalledOnce();
    const [dia, tuyChon] = fetchGia.mock.calls[0]!;
    expect(String(dia)).toBe('/api/tro-ly/viet-tat');
    expect(tuyChon?.method).toBe('GET');
    expect(tuyChon?.body).toBeUndefined();
  });

  it('giữ tham chiếu utterance tới khi câu cuối end (không bị thu gom)', async () => {
    const { speech, doc } = await dung();
    await doc.docMoi('Một. Hai.');
    await vi.advanceTimersByTimeAsync(80);
    const [dau, cuoi] = speech.cacCauDaDoc();
    expect(dau?.onend).toBeNull();
    expect(cuoi?.onend).toBeTypeOf('function');
    cuoi!.onend!();
    expect(() => cuoi!.onend!()).not.toThrow();
  });
});

describe('onerror của utterance', () => {
  const phatMotCau = async () => {
    const ctx = await dung();
    await ctx.doc.docMoi('Một. Hai.');
    await vi.advanceTimersByTimeAsync(80);
    ctx.speech.cancel.mockClear();
    return { ...ctx, cau: ctx.speech.cacCauDaDoc() as CauDocGia[] };
  };

  it('canceled và interrupted bị bỏ qua', async () => {
    const { speech, cau } = await phatMotCau();
    cau[0]!.onerror!({ error: 'canceled' });
    cau[0]!.onerror!({ error: 'interrupted' });
    expect(speech.cancel).not.toHaveBeenCalled();
  });

  it('not-allowed: dừng hàng đợi và báo để nút về tắt', async () => {
    const { speech, giongDoc, cau } = await phatMotCau();
    const bao = vi.fn();
    giongDoc.ngheKhongDuocPhep(bao);
    cau[0]!.onerror!({ error: 'not-allowed' });
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(bao).toHaveBeenCalledOnce();
  });

  it('lỗi khác: dừng hàng đợi, không báo', async () => {
    const { speech, giongDoc, cau } = await phatMotCau();
    const bao = vi.fn();
    giongDoc.ngheKhongDuocPhep(bao);
    cau[0]!.onerror!({ error: 'synthesis-failed' });
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(bao).not.toHaveBeenCalled();
  });
});

describe('nap', () => {
  it('nạp trước bảng viết tắt (một lần)', async () => {
    const { fetchGia, doc } = await dung();
    await doc.nap();
    await doc.nap();
    expect(fetchGia).toHaveBeenCalledOnce();
  });
});
