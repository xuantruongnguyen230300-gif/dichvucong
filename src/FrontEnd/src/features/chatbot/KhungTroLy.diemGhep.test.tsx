import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { phanHoiLoi } from '../thu-tuc/thuTucMau';
import { useDiemGhepDoc } from './diemGhepDoc';
import { napNgonNguTroLy } from './i18n';
import { KhungTroLy } from './KhungTroLy';
import { DAP_AN_HO_SO, DAP_AN_KHONG_HIEU, dungKhungTrongRouter, giaFetchTroLy, type CauHinhFetchTroLy } from '../../test-utils/troLyMau';

// F07 thay ChoNutDoc; ở đây thay bằng một bản đọc DiemGhepDoc để kiểm điểm ghép (plan §6)
vi.mock('./ChoNutDoc', () => ({
  ChoNutDoc: () => {
    const { cauTraLoiMoi, khungDangMo } = useDiemGhepDoc();
    return <output data-testid="diem-ghep">{JSON.stringify({ cauTraLoiMoi, khungDangMo })}</output>;
  },
}));

beforeAll(() => napNgonNguTroLy());
afterEach(() => {
  vi.unstubAllGlobals();
  datCheDoKiosk(false);
});

const diemGhep = () =>
  JSON.parse(screen.getByTestId('diem-ghep').textContent ?? '{}') as {
    cauTraLoiMoi: { id: number; vanBan: string } | null;
    khungDangMo: boolean;
  };

function dung(cauHinh: CauHinhFetchTroLy, mo = true) {
  giaFetchTroLy({ chuDe: [], ...cauHinh });
  const user = userEvent.setup();
  const ketQua = dungKhungTrongRouter(<KhungTroLy mo={mo} onDong={() => undefined} />);
  return { user, ...ketQua };
}
const hoi = (user: ReturnType<typeof userEvent.setup>, cau: string) =>
  user.type(screen.getByRole('textbox', { name: 'Câu hỏi' }), `${cau}{Enter}`);

describe('điểm ghép F07 (DiemGhepDoc)', () => {
  it('lời chào không phải câu trả lời mới; khungDangMo theo prop', () => {
    dung({}, true);
    expect(diemGhep()).toEqual({ cauTraLoiMoi: null, khungDangMo: true });
  });

  it('khung ẩn: khungDangMo = false', () => {
    dung({}, false);
    expect(diemGhep().khungDangMo).toBe(false);
  });

  it('đáp án từ máy chủ: id đổi mỗi câu, vanBan là chữ thuần không có nhãn nút', async () => {
    const { user } = dung({ hoi: () => DAP_AN_HO_SO });
    await hoi(user, 'khai sinh');
    await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh');
    const dau = diemGhep().cauTraLoiMoi;
    expect(dau?.vanBan).toContain('1.001193 – Thủ tục đăng ký khai sinh');
    expect(dau?.vanBan).toContain('Tờ khai đăng ký khai sinh theo mẫu');
    expect(dau?.vanBan).toContain('và 6 giấy tờ nữa');
    expect(dau?.vanBan).not.toMatch(/Xem chi tiết|Xem và nộp|Gọi Trung tâm/);

    await hoi(user, 'cần gì nữa');
    await vi.waitFor(() => expect(diemGhep().cauTraLoiMoi?.id).not.toBe(dau?.id));
    expect(diemGhep().cauTraLoiMoi!.id).toBeGreaterThan(dau!.id);
  });

  it('tin lỗi không đặt cauTraLoiMoi mới (giữ đáp án trước)', async () => {
    let lan = 0;
    const { user } = dung({ hoi: () => (lan++ === 0 ? DAP_AN_KHONG_HIEU : phanHoiLoi(429, 'qua-nhieu-yeu-cau')) });
    await hoi(user, 'giá vàng');
    await screen.findByText(/Xin lỗi/, { selector: 'p' });
    const truoc = diemGhep().cauTraLoiMoi;
    expect(truoc?.vanBan).toContain('Xin lỗi');
    await hoi(user, 'câu hai');
    await screen.findByText(/thao tác quá nhanh/);
    expect(diemGhep().cauTraLoiMoi).toEqual(truoc);
  });
});
