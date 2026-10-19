import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { phanHoiLoi } from '../thu-tuc/thuTucMau';
import { BANG_VIET_TAT_MAU, GIONG_VN, giaSpeech } from '../../test-utils/giaSpeech';
import { napNgonNguTroLy } from './i18n';
import { KhungTroLy } from './KhungTroLy';
import {
  DAP_AN_KHONG_HIEU,
  THU_TUC_KHAI_SINH,
  dapAnThuTuc,
  dungKhungTrongRouter,
  giaFetchTroLy,
  type CauHinhFetchTroLy,
} from '../../test-utils/troLyMau';

// Khung thật với nút đọc thật: kiểm vị trí nút và đường đi từ đáp án của máy chủ tới tiếng đọc (F07 T04)
beforeAll(() => napNgonNguTroLy());
afterEach(() => vi.unstubAllGlobals());

const DAP_AN_CO_VIET_TAT = dapAnThuTuc(
  'thoi-han',
  { thoiHan: '3 ngày làm việc' },
  { thuTuc: { ...THU_TUC_KHAI_SINH, ten: 'Thủ tục TTHC mẫu' } },
);

function Chu() {
  const [mo, datMo] = useState(true);
  return (
    <>
      <button type="button" onClick={() => datMo((m) => !m)}>
        doi-khung
      </button>
      <KhungTroLy mo={mo} onDong={() => datMo(false)} />
    </>
  );
}

function dung(cauHinh: CauHinhFetchTroLy) {
  const speech = giaSpeech([GIONG_VN]);
  const fetchTroLy = giaFetchTroLy({ chuDe: [], ...cauHinh });
  // Bảng viết tắt: bản giả của trợ lý không biết địa chỉ này
  vi.stubGlobal('fetch', (dia: RequestInfo | URL, tuyChon?: RequestInit) =>
    String(dia) === '/api/tro-ly/viet-tat' ? Promise.resolve(Response.json(BANG_VIET_TAT_MAU)) : fetchTroLy(dia, tuyChon),
  );
  const user = userEvent.setup();
  dungKhungTrongRouter(<Chu />);
  return { speech, user };
}
const nutDoc = () => screen.getByRole('button', { name: 'Đọc câu trả lời' });
const hoi = (user: ReturnType<typeof userEvent.setup>, cau: string) =>
  user.type(screen.getByRole('textbox', { name: 'Câu hỏi' }), `${cau}{Enter}`);

describe('nút đọc trong khung', () => {
  it('nằm giữa tên khung và nút đóng trong đầu khung, mặc định tắt', () => {
    dung({});
    const dau = screen.getByRole('heading', { name: 'Trợ lý thủ tục' }).parentElement!;
    const cacNut = within(dau).getAllByRole('button');
    expect(cacNut.map((n) => n.getAttribute('aria-label'))).toEqual(['Đọc câu trả lời', 'Đóng trợ lý']);
    expect(nutDoc()).toHaveAttribute('aria-pressed', 'false');
    expect(dau.children[1]).toHaveTextContent('Trợ lý thủ tục');
    expect(dau.children[2]).toBe(nutDoc());
  });

  it('bật rồi hỏi: đáp án của máy chủ được đọc, viết tắt đọc đầy đủ (AC-1, AC-2); chữ trên màn hình vẫn là TTHC', async () => {
    const { speech, user } = dung({ hoi: () => DAP_AN_CO_VIET_TAT });
    await user.click(nutDoc());
    await hoi(user, 'khai sinh');
    await vi.waitFor(() => expect(speech.chuDaDoc().trim()).not.toBe(''));
    expect(speech.chuDaDoc()).toContain('thủ tục hành chính mẫu');
    expect(speech.chuDaDoc()).not.toContain('TTHC');
    expect(screen.getAllByText(/Thủ tục TTHC mẫu/).length).toBeGreaterThan(0);
  });

  it('chưa bật: hỏi cũng không đọc (AC-4)', async () => {
    const { speech, user } = dung({ hoi: () => DAP_AN_CO_VIET_TAT });
    await hoi(user, 'khai sinh');
    await screen.findAllByText(/Thủ tục TTHC mẫu/);
    await new Promise((xong) => setTimeout(xong, 250));
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('tin lỗi không được đọc', async () => {
    const { speech, user } = dung({ hoi: () => phanHoiLoi(429, 'qua-nhieu-yeu-cau') });
    await user.click(nutDoc());
    await hoi(user, 'câu hỏi');
    await screen.findByText(/thao tác quá nhanh/);
    await new Promise((xong) => setTimeout(xong, 250));
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('đang đọc, bấm nút đóng (X) → dừng ngay; mở lại khung không đọc tiếp (AC-8)', async () => {
    const { speech, user } = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await user.click(nutDoc());
    await hoi(user, 'giá vàng');
    await vi.waitFor(() => expect(speech.chuDaDoc().trim()).not.toBe(''));
    const daDoc = speech.speak.mock.calls.length;
    speech.cancel.mockClear();
    await user.click(screen.getByRole('button', { name: 'Đóng trợ lý' }));
    expect(speech.cancel).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'doi-khung' }));
    await new Promise((xong) => setTimeout(xong, 250));
    expect(speech.speak).toHaveBeenCalledTimes(daDoc);
  });
});
