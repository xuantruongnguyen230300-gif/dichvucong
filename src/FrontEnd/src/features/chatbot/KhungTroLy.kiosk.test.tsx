import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { napNgonNguTroLy } from './i18n';
import { KhungTroLy } from './KhungTroLy';
import { DAP_AN_DANH_SACH, DAP_AN_HO_SO, DAP_AN_KHONG_HIEU, dungKhungTrongRouter, giaFetchTroLy } from '../../test-utils/troLyMau';

beforeAll(() => napNgonNguTroLy());
afterEach(() => {
  vi.unstubAllGlobals();
  datCheDoKiosk(false);
});

const NHAC = 'Nhớ đăng xuất khi dùng xong';

function dung(dapAn: Parameters<typeof giaFetchTroLy>[0]) {
  giaFetchTroLy({ chuDe: [], ...dapAn });
  const user = userEvent.setup();
  dungKhungTrongRouter(<KhungTroLy mo onDong={() => undefined} />);
  return user;
}
const hoi = (user: ReturnType<typeof userEvent.setup>, cau: string) =>
  user.type(screen.getByRole('textbox', { name: 'Câu hỏi' }), `${cau}{Enter}`);

describe('dòng nhắc đăng xuất trong khung trợ lý (F09 BR-4)', () => {
  it('kiosk: một dòng cho cả khung dù có nhiều đáp án chứa liên kết Cổng DVC', async () => {
    datCheDoKiosk(true);
    let lan = 0;
    const user = dung({ hoi: () => (lan++ === 0 ? DAP_AN_HO_SO : DAP_AN_DANH_SACH) });
    expect(screen.queryByText(NHAC)).not.toBeInTheDocument(); // chưa có liên kết nào
    await hoi(user, 'khai sinh');
    expect(await screen.findByText(NHAC)).toBeInTheDocument();
    await hoi(user, 'kết hôn');
    await screen.findByText(/Tìm thấy 2 thủ tục/);
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
  });

  it('kiosk nhưng hội thoại chưa có liên kết tới Cổng DVC: không có dòng nhắc', async () => {
    datCheDoKiosk(true);
    const user = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await hoi(user, 'giá vàng');
    await screen.findByText(/Xin lỗi/);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(NHAC)).not.toBeInTheDocument();
  });

  it('ngoài kiosk: không bao giờ có dòng nhắc', async () => {
    const user = dung({ hoi: () => DAP_AN_HO_SO });
    await hoi(user, 'khai sinh');
    await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh');
    await waitFor(() => expect(screen.queryByText(NHAC)).not.toBeInTheDocument());
  });
});
