import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChoNutDoc } from './ChoNutDoc';
import { DiemGhepDocContext, type DiemGhepDoc } from './diemGhepDoc';
import { GIONG_ANH, GIONG_VN, GIONG_VN_MANG, giaFetchVietTat, giaSpeech, type SpeechGia } from '../../test-utils/giaSpeech';
import { napNgonNguTroLy } from './i18n';

// Đếm lần gọi nạp chunk phần đọc nhưng vẫn nạp thật (BR-4)
const { demNap } = vi.hoisted(() => ({ demNap: vi.fn() }));
vi.mock('./doc/napPhanDoc', async (goc) => {
  const m = await goc<typeof import('./doc/napPhanDoc')>();
  return {
    napPhanDoc: () => {
      demNap();
      return m.napPhanDoc();
    },
  };
});

beforeAll(() => napNgonNguTroLy());
beforeEach(() => {
  demNap.mockClear();
  giaFetchVietTat();
});
afterEach(() => vi.unstubAllGlobals());

const TEN_NUT = 'Đọc câu trả lời';
const nut = () => screen.getByRole('button', { name: TEN_NUT });
const khongCoNut = () => screen.queryByRole('button', { name: TEN_NUT });
const nghi = (ms: number) => act(() => new Promise<void>((xong) => setTimeout(xong, ms)));

type Cau = DiemGhepDoc['cauTraLoiMoi'];
function Giai({ cau = null, mo = true }: { cau?: Cau; mo?: boolean }) {
  return (
    <DiemGhepDocContext value={{ cauTraLoiMoi: cau, khungDangMo: mo }}>
      <ChoNutDoc />
    </DiemGhepDocContext>
  );
}

function dung(props: Parameters<typeof Giai>[0] = {}, giong = [GIONG_VN]) {
  const speech = giaSpeech(giong);
  const ketQua = render(<Giai {...props} />);
  const veLai = (p: Parameters<typeof Giai>[0]) => ketQua.rerender(<Giai {...p} />);
  return { speech, veLai, ...ketQua };
}
const cho = (speech: SpeechGia) => vi.waitFor(() => expect(speech.chuDaDoc().trim()).not.toBe(''));

describe('Safari iOS: mở khoá (chạy đầu tiên: trạng thái mở khoá ở mức module)', () => {
  it('cờ đã bật từ lần trước: thao tác đầu tiên của trang phát một câu rỗng âm lượng 0 với giọng cục bộ, chỉ một lần', async () => {
    window.localStorage.setItem('doc-bat', '1');
    const { speech } = dung();
    expect(speech.speak).not.toHaveBeenCalled();
    await userEvent.setup().click(document.body);
    expect(speech.speak).toHaveBeenCalledOnce();
    const cau = speech.cacCauDaDoc()[0]!;
    expect(cau.text).toBe('');
    expect(cau.volume).toBe(0);
    expect(cau.voice).toBe(GIONG_VN);
    await userEvent.setup().keyboard('a');
    expect(speech.speak).toHaveBeenCalledOnce();
  });
});

describe('nút bật/tắt (AC-3, AC-4, BR-5)', () => {
  it('lần đầu: tắt, aria-pressed=false; có đáp án mới cũng không speak (AC-4)', async () => {
    const { speech, veLai } = dung();
    expect(nut()).toHaveAttribute('aria-pressed', 'false');
    veLai({ cau: { id: 1, vanBan: 'Xin chào.' } });
    await nghi(250);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(demNap).not.toHaveBeenCalled(); // BR-4: chưa bật thì chưa nạp chunk phần đọc
  });

  it('bấm: bật, ghi "1", nạp chunk phần đọc một lần; gắn lại vẫn bật; tắt: ghi "0", cancel(), gắn lại vẫn tắt', async () => {
    const user = userEvent.setup();
    const { speech, unmount } = dung();
    await user.click(nut());
    expect(nut()).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('doc-bat')).toBe('1');
    expect(demNap).toHaveBeenCalledOnce();
    unmount();

    const lai = render(<Giai />);
    expect(nut()).toHaveAttribute('aria-pressed', 'true');

    speech.cancel.mockClear();
    await user.click(nut());
    expect(nut()).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem('doc-bat')).toBe('0');
    expect(speech.cancel).toHaveBeenCalled();
    expect(demNap).toHaveBeenCalledOnce(); // tắt không nạp thêm
    expect(window.localStorage).toHaveLength(1); // chỉ khoá doc-bat

    lai.unmount();
    render(<Giai />);
    expect(nut()).toHaveAttribute('aria-pressed', 'false');
  });

  it('tên nút cố định ở cả hai trạng thái; Tab tới được, Enter và Space đều bật tắt', async () => {
    const user = userEvent.setup();
    dung();
    expect(nut()).toHaveAccessibleName(TEN_NUT);
    await user.tab();
    expect(nut()).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(nut()).toHaveAttribute('aria-pressed', 'true');
    expect(nut()).toHaveAccessibleName(TEN_NUT);
    await user.keyboard(' ');
    expect(nut()).toHaveAttribute('aria-pressed', 'false');
  });

  it('hai icon khác hình theo trạng thái (không chỉ dựa vào màu)', async () => {
    const user = userEvent.setup();
    dung();
    const hinhTat = nut().innerHTML;
    await user.click(nut());
    expect(nut().innerHTML).not.toBe(hinhTat);
  });
});

describe('đọc đáp án (AC-1, AC-2, AC-7)', () => {
  it('bật, đáp án mới khi khung mở: speak() đọc "thủ tục hành chính"; chữ hiển thị không đổi', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    const cau = { id: 1, vanBan: 'Thời hạn TTHC này là 3 ngày.' };
    veLai({ cau });
    await cho(speech);
    expect(speech.chuDaDoc()).toBe('Thời hạn thủ tục hành chính này là 3 ngày.');
    expect(cau.vanBan).toBe('Thời hạn TTHC này là 3 ngày.');
    expect(speech.cacCauDaDoc()[0]!.voice).toBe(GIONG_VN);
  });

  it('cờ đã bật từ lần trước: đáp án đầu tiên nạp chunk phần đọc rồi đọc', async () => {
    window.localStorage.setItem('doc-bat', '1');
    const { speech, veLai } = dung();
    expect(demNap).not.toHaveBeenCalled();
    veLai({ cau: { id: 1, vanBan: 'Xin chào.' } });
    await cho(speech);
    expect(demNap).toHaveBeenCalled();
  });

  it('đang đọc, đáp án mới: cancel() rồi chỉ đọc nội dung mới', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    veLai({ cau: { id: 1, vanBan: 'Câu cũ.' } });
    await cho(speech);
    speech.cancel.mockClear();
    speech.speak.mockClear();
    veLai({ cau: { id: 2, vanBan: 'Câu mới.' } });
    expect(speech.cancel).toHaveBeenCalled();
    await cho(speech);
    expect(speech.chuDaDoc()).toBe('Câu mới.');
  });

  it('bật khi màn hình đã có câu trả lời: không đọc câu cũ, chỉ đọc từ đáp án mới', async () => {
    const user = userEvent.setup();
    const cu = { id: 1, vanBan: 'Câu đã có.' };
    const { speech, veLai } = dung({ cau: cu });
    await user.click(nut());
    await nghi(250);
    expect(speech.cacCauDaDoc().filter((c) => c.text !== '')).toHaveLength(0);
    veLai({ cau: { id: 2, vanBan: 'Đáp án mới.' } });
    await vi.waitFor(() => expect(speech.chuDaDoc()).toContain('Đáp án mới.'));
    expect(speech.chuDaDoc()).not.toContain('Câu đã có.');
  });
});

describe('dừng đọc (AC-8, BR-7)', () => {
  it('đóng khung: cancel() ngay; mở lại, id không đổi: không đọc tiếp', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    const cau = { id: 1, vanBan: 'Câu dài.' };
    veLai({ cau });
    await cho(speech);
    speech.cancel.mockClear();
    speech.speak.mockClear();
    veLai({ cau, mo: false });
    expect(speech.cancel).toHaveBeenCalled();
    veLai({ cau, mo: true });
    await nghi(250);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('đáp án đến lúc khung đóng: không đọc; mở lại cũng không đọc', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    veLai({ cau: null, mo: false });
    veLai({ cau: { id: 1, vanBan: 'Đến lúc đóng.' }, mo: false });
    await nghi(250);
    expect(speech.speak).not.toHaveBeenCalled();
    veLai({ cau: { id: 1, vanBan: 'Đến lúc đóng.' }, mo: true });
    await nghi(250);
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('gỡ thành phần (khung bị huỷ): cancel(); gỡ trình nghe pagehide', async () => {
    const { speech, unmount } = dung();
    speech.cancel.mockClear();
    unmount();
    expect(speech.cancel).toHaveBeenCalled();
    speech.cancel.mockClear();
    window.dispatchEvent(new Event('pagehide'));
    expect(speech.cancel).not.toHaveBeenCalled();
    expect(speech.soNguoiNghe()).toBe(0);
  });

  it('pagehide: cancel()', () => {
    const { speech } = dung();
    speech.cancel.mockClear();
    window.dispatchEvent(new Event('pagehide'));
    expect(speech.cancel).toHaveBeenCalledOnce();
  });

  it('tắt đọc trong lúc chờ 80 ms: không speak()', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    veLai({ cau: { id: 1, vanBan: 'Sẽ bị tắt.' } });
    await user.click(nut());
    await nghi(300);
    expect(speech.speak).not.toHaveBeenCalled();
  });
});

describe('không có giọng (AC-5, AC-11, BR-2)', () => {
  it('không có speechSynthesis: không nút, không lỗi', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(() => render(<Giai cau={{ id: 1, vanBan: 'Xin chào.' }} />)).not.toThrow();
    expect(khongCoNut()).toBeNull();
  });

  it('máy chỉ có giọng mạng hoặc tiếng khác: không nút, không speak()', async () => {
    window.localStorage.setItem('doc-bat', '1');
    const { speech, veLai } = dung({}, [GIONG_VN_MANG, GIONG_ANH]);
    expect(khongCoNut()).toBeNull();
    veLai({ cau: { id: 1, vanBan: 'Xin chào.' } });
    await nghi(250);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('doc-bat')).toBe('1'); // cờ giữ nguyên
  });

  it('giọng cục bộ xuất hiện sau (voiceschanged): nút hiện; có thêm giọng mạng thì vẫn dùng giọng cục bộ', async () => {
    const { speech, veLai } = dung({}, [GIONG_VN_MANG]);
    expect(khongCoNut()).toBeNull();
    act(() => speech.datGiong([GIONG_VN_MANG, GIONG_VN]));
    expect(nut()).toBeInTheDocument();

    await userEvent.setup().click(nut());
    veLai({ cau: { id: 1, vanBan: 'Có giọng rồi.' } });
    await cho(speech);
    expect(speech.cacCauDaDoc().at(-1)!.voice).toBe(GIONG_VN);
  });

  it('giọng biến mất rồi: nút ẩn lại', () => {
    const { speech } = dung();
    expect(nut()).toBeInTheDocument();
    act(() => speech.datGiong([]));
    expect(khongCoNut()).toBeNull();
  });
});

describe('not-allowed (Q8)', () => {
  it('speak() bị từ chối: nút về tắt trong phiên, cờ đã lưu vẫn "1"; bấm lại thì bật', async () => {
    const user = userEvent.setup();
    const { speech, veLai } = dung();
    await user.click(nut());
    veLai({ cau: { id: 1, vanBan: 'Bị chặn.' } });
    await cho(speech);
    act(() => speech.cacCauDaDoc().at(-1)!.onerror!({ error: 'not-allowed' }));
    expect(nut()).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem('doc-bat')).toBe('1');

    await user.click(nut());
    expect(nut()).toHaveAttribute('aria-pressed', 'true');
  });
});
