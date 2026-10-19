import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Bảo vệ F07 BR-1 và BR-6 bằng cách quét mã nguồn: trang không bao giờ dùng micro hay nhận giọng nói, và chỉ thư mục `doc/`
 * của trợ lý được phát tiếng. Dịch vụ đọc ngoài thì bị chặn thêm bởi CSP `connect-src 'self'` (kiểm ở e2e).
 */
const GOC_SRC = join(process.cwd(), 'src'); // vitest chạy ở thư mục FrontEnd
const TEN_TEP_NAY = 'khongMicro.test.ts';

const CAM_MICRO: ReadonlyArray<readonly [string, RegExp]> = [
  ['SpeechRecognition', /SpeechRecognition/],
  ['webkitSpeechRecognition', /webkitSpeechRecognition/i],
  ['getUserMedia', /getUserMedia/],
  ['MediaRecorder', /MediaRecorder/],
  ['mediaDevices', /mediaDevices/],
  ['thuộc tính capture=', /\bcapture\s*=/],
];
const PHAT_TIENG = /speechSynthesis\s*\.\s*speak\b/;

function cacTepNguon(): string[] {
  return readdirSync(GOC_SRC, { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .map((f) => join(GOC_SRC, f))
    .filter((f) => !f.endsWith(sep + TEN_TEP_NAY));
}

describe('quét mã nguồn FE (BR-1, BR-6)', () => {
  const cacTep = cacTepNguon();

  it('quét được mã nguồn (không quét hụt thư mục)', () => {
    expect(cacTep.length).toBeGreaterThan(100);
    expect(cacTep.some((f) => f.endsWith(join('chatbot', 'doc', 'docCauTraLoi.ts')))).toBe(true);
  });

  it.each(CAM_MICRO)('không tệp nào dùng %s', (_ten, mau) => {
    const viPham = cacTep.filter((f) => mau.test(readFileSync(f, 'utf8'))).map((f) => relative(GOC_SRC, f));
    expect(viPham).toEqual([]);
  });

  it('chỉ features/chatbot/doc/ được gọi speechSynthesis.speak', () => {
    const thuMucDoc = join(GOC_SRC, 'features', 'chatbot', 'doc') + sep;
    const viPham = cacTep
      .filter((f) => !f.startsWith(thuMucDoc) && PHAT_TIENG.test(readFileSync(f, 'utf8')))
      .map((f) => relative(GOC_SRC, f));
    expect(viPham).toEqual([]);
  });

  it('bắt được vi phạm giả (mẫu quét hoạt động)', () => {
    expect(CAM_MICRO.every(([, mau]) => !mau.test('const x = 1;'))).toBe(true);
    expect(CAM_MICRO[1]![1].test('new webkitSpeechRecognition()')).toBe(true);
    expect(CAM_MICRO[2]![1].test('navigator.mediaDevices.getUserMedia({audio:true})')).toBe(true);
    expect(CAM_MICRO[5]![1].test('<input capture="user">')).toBe(true);
    expect(PHAT_TIENG.test('window.speechSynthesis.speak(u)')).toBe(true);
  });
});
