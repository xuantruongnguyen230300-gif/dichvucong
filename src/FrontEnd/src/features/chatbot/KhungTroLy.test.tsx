import { screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { phanHoiLoi } from '../thu-tuc/thuTucMau';
import { napNgonNguTroLy } from './i18n';
import { KhungTroLy } from './KhungTroLy';
import {
  CHU_DE_MAU,
  DAP_AN_DANH_SACH,
  DAP_AN_HO_SO,
  DAP_AN_KHONG_HIEU,
  THU_TUC_KET_HON,
  dapAnThuTuc,
  dungKhungTrongRouter,
  giaFetchTroLy,
  taoClientThu,
  type CauHinhFetchTroLy,
} from '../../test-utils/troLyMau';

beforeAll(() => napNgonNguTroLy());
afterEach(() => vi.unstubAllGlobals());

/** Khung có nút bật/tắt bên ngoài, như vỏ NutTroLy: khung không bị huỷ khi đóng. */
function KhungCoCongTac() {
  const [mo, datMo] = useState(true);
  return (
    <>
      <button type="button" onClick={() => datMo((m) => !m)}>
        bat-tat
      </button>
      <KhungTroLy mo={mo} onDong={() => datMo(false)} />
    </>
  );
}

const CAU_429 = 'Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.';

function dung(cauHinh: CauHinhFetchTroLy = {}, mo = true) {
  const fetchGia = giaFetchTroLy({ chuDe: [], ...cauHinh });
  const onDong = vi.fn();
  const user = userEvent.setup();
  const client = taoClientThu();
  const ketQua = dungKhungTrongRouter(<KhungTroLy mo={mo} onDong={onDong} />, '/', client);
  return { fetchGia, onDong, user, ...ketQua };
}

const oNhap = () => screen.getByRole('textbox', { name: 'Câu hỏi' });
const nutGui = () => screen.getByRole('button', { name: /^(Gửi|Đang xử lý)/ });
const danhSachTin = () => screen.getByRole('log', { name: 'Hội thoại với trợ lý' });

async function hoi(user: ReturnType<typeof userEvent.setup>, cau: string) {
  await user.type(oNhap(), `${cau}{Enter}`);
}

describe('KhungTroLy — bố cục và truy cập', () => {
  it('mở: con trỏ vào ô nhập, có lời chào, tên khung, danh sách tin aria-live, lời miễn trừ', async () => {
    dung();
    const khung = screen.getByRole('dialog', { name: 'Trợ lý thủ tục' });
    expect(khung).toBeVisible();
    expect(oNhap()).toHaveFocus();
    expect(danhSachTin()).toHaveAttribute('aria-live', 'polite');
    expect(danhSachTin()).toHaveAttribute('aria-relevant', 'additions');
    expect(within(danhSachTin()).getByText(/Tôi trả lời câu hỏi về thủ tục hành chính/)).toBeInTheDocument();
    expect(within(khung).getByText(/Thông tin chỉ để tham khảo/)).toBeInTheDocument();
    expect(oNhap()).toHaveAttribute('maxlength', '500');
  });

  it('chưa mở (mo = false): khung ẩn, không tải chip chủ đề', () => {
    const { fetchGia } = dung({}, false);
    expect(document.getElementById('khung-tro-ly')).not.toBeVisible();
    expect(fetchGia).not.toHaveBeenCalled();
  });

  it('nút ✕ và Esc đều gọi onDong', async () => {
    const { user, onDong } = dung();
    await user.click(screen.getByRole('button', { name: 'Đóng trợ lý' }));
    expect(onDong).toHaveBeenCalledTimes(1);
    oNhap().focus();
    await user.keyboard('{Escape}');
    expect(onDong).toHaveBeenCalledTimes(2);
  });

  it('Tab đi vòng trong khung: từ phần tử cuối về phần tử đầu, Shift+Tab ngược lại', async () => {
    const { user } = dung({ chuDe: CHU_DE_MAU });
    await screen.findByRole('button', { name: 'Hộ tịch' });
    const dong = screen.getByRole('button', { name: 'Đóng trợ lý' });
    nutGui().focus();
    await user.tab();
    expect(dong).toHaveFocus();
    await user.tab({ shift: true });
    expect(nutGui()).toHaveFocus();
  });

  it('chữ trong tin là chữ thuần: HTML trong câu hỏi hiện nguyên văn, không thành phần tử', async () => {
    const { user } = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await hoi(user, '<img src=x onerror=alert(1)>');
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(danhSachTin().querySelector('img')).toBeNull();
  });
});

describe('KhungTroLy — gửi câu hỏi và ngữ cảnh', () => {
  it('gửi: hiện tin người dân, rồi đáp án; body {cauHoi, maThuTuc: null}; ô nhập rỗng, con trỏ ở lại ô nhập', async () => {
    const { user, fetchGia } = dung({ hoi: () => DAP_AN_HO_SO });
    await hoi(user, '  làm giấy khai sinh cần giấy tờ gì  ');
    expect(screen.getByText('làm giấy khai sinh cần giấy tờ gì')).toBeInTheDocument();
    expect(await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh')).toBeInTheDocument();
    expect(fetchGia.cacCauHoi()).toEqual([{ cauHoi: 'làm giấy khai sinh cần giấy tờ gì', maThuTuc: null }]);
    expect(oNhap()).toHaveValue('');
    expect(oNhap()).toHaveFocus();
  });

  it('có tin chờ trong lúc máy chủ chưa trả lời, rồi biến mất', async () => {
    let tra: (() => void) | null = null;
    const { user } = dung({
      hoi: () =>
        new Promise((giai) => {
          tra = () => giai(DAP_AN_KHONG_HIEU);
        }),
    });
    await hoi(user, 'giá vàng hôm nay');
    expect(screen.getByText('Đang tìm câu trả lời…')).toBeInTheDocument();
    tra!();
    await screen.findByText(/Xin lỗi, tôi chưa có câu trả lời/);
    expect(screen.queryByText('Đang tìm câu trả lời…')).not.toBeInTheDocument();
  });

  it('thủ tục đang nói tới gửi kèm câu sau và được gán lại bằng thuTucDangNoi của đáp án mới nhất', async () => {
    const dapAn = [
      dapAnThuTuc('ho-so', {}, { thuTucDangNoi: '1.001193' }),
      dapAnThuTuc('thoi-han', {}, { thuTucDangNoi: '1.001193' }),
      DAP_AN_KHONG_HIEU, // thuTucDangNoi null: máy chủ quyết định ngữ cảnh mất
      DAP_AN_KHONG_HIEU,
    ];
    let i = 0;
    const { user, fetchGia } = dung({ hoi: () => dapAn[i++]! });
    await hoi(user, 'khai sinh');
    await waitFor(() => expect(fetchGia.cacCauHoi()).toHaveLength(1));
    await screen.findAllByText('1.001193 – Thủ tục đăng ký khai sinh');
    await hoi(user, 'mấy ngày');
    await waitFor(() => expect(screen.getAllByText('1.001193 – Thủ tục đăng ký khai sinh')).toHaveLength(2));
    await hoi(user, 'phí');
    await screen.findByText(/Xin lỗi/);
    await hoi(user, 'phí bao nhiêu');
    await waitFor(() => expect(fetchGia.cacCauHoi()).toHaveLength(4));
    expect(fetchGia.cacCauHoi().map((c) => c.maThuTuc)).toEqual([null, '1.001193', '1.001193', null]);
  });

  it('câu rỗng hoặc toàn khoảng trắng không gửi', async () => {
    const { user, fetchGia } = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await user.click(nutGui());
    await user.type(oNhap(), '   {Enter}');
    expect(fetchGia.cacCauHoi()).toHaveLength(0);
    expect(oNhap()).toHaveValue('   ');
  });

  it('đang chờ: gõ câu khác rồi bấm Gửi vẫn chỉ có một yêu cầu', async () => {
    let tra: (() => void) | null = null;
    const { user, fetchGia } = dung({
      hoi: () =>
        new Promise((giai) => {
          tra = () => giai(DAP_AN_KHONG_HIEU);
        }),
    });
    await hoi(user, 'câu một');
    await user.type(oNhap(), 'câu hai');
    await user.click(nutGui());
    await user.keyboard('{Enter}');
    expect(fetchGia.cacCauHoi()).toHaveLength(1);
    expect(oNhap()).toHaveValue('câu hai');
    tra!();
    await screen.findByText(/Xin lỗi/);
  });

  it('ô nhập dừng ở 500 ký tự và báo "Tối đa 500 ký tự"; câu 500 ký tự gửi được (AC-13)', async () => {
    const { user, fetchGia } = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await user.click(oNhap());
    await user.paste('a'.repeat(600));
    expect(oNhap()).toHaveValue('a'.repeat(500));
    expect(screen.getByRole('status')).toHaveTextContent('Tối đa 500 ký tự');
    expect(oNhap()).toHaveAccessibleDescription('Tối đa 500 ký tự');
    await user.keyboard('{Enter}');
    await screen.findByText(/Xin lỗi/);
    expect(fetchGia.cacCauHoi()[0]?.cauHoi).toHaveLength(500);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('KhungTroLy — lỗi', () => {
  it('429: đúng câu của F00 BR-6; khung và hội thoại còn; "Thử lại" gửi lại đúng câu đó', async () => {
    let lan = 0;
    const { user, fetchGia } = dung({
      hoi: () => (lan++ === 0 ? phanHoiLoi(429, 'qua-nhieu-yeu-cau') : DAP_AN_HO_SO),
    });
    await hoi(user, 'khai sinh cần gì');
    expect(await screen.findByText(CAU_429)).toBeInTheDocument();
    expect(screen.getByText('khai sinh cần gì')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Trợ lý thủ tục' })).toBeVisible();
    expect(screen.queryByText('Đang tìm câu trả lời…')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh')).toBeInTheDocument();
    expect(fetchGia.cacCauHoi().map((c) => c.cauHoi)).toEqual(['khai sinh cần gì', 'khai sinh cần gì']);
    expect(screen.queryByText(CAU_429)).not.toBeInTheDocument();
    // chỉ một tin của người dân dù đã gửi hai lần
    expect(screen.getAllByText('khai sinh cần gì')).toHaveLength(1);
  });

  it('lỗi hệ thống: có mã tra cứu; mất mạng: câu mất kết nối', async () => {
    let lan = 0;
    const { user } = dung({
      hoi: () => {
        if (lan++ === 0) return phanHoiLoi(500, 'loi-he-thong');
        throw new TypeError('Failed to fetch');
      },
    });
    await hoi(user, 'câu một');
    expect(await screen.findByText(/Hệ thống đang gặp sự cố/)).toBeInTheDocument();
    expect(screen.getByText(/AB12CD34/)).toBeInTheDocument();
    await hoi(user, 'câu hai');
    expect(await screen.findByText(/Không kết nối được tới máy chủ/)).toBeInTheDocument();
  });

  it('lỗi giữ nguyên thủ tục đang nói tới', async () => {
    let lan = 0;
    const { user, fetchGia } = dung({
      hoi: () => (lan++ === 1 ? phanHoiLoi(429, 'qua-nhieu-yeu-cau') : dapAnThuTuc('ho-so')),
    });
    await hoi(user, 'khai sinh');
    await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh');
    await hoi(user, 'mấy ngày');
    await screen.findByText(CAU_429);
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    await screen.findAllByText('1.001193 – Thủ tục đăng ký khai sinh');
    expect(fetchGia.cacCauHoi().map((c) => c.maThuTuc)).toEqual([null, '1.001193', '1.001193']);
  });
});

describe('KhungTroLy — chủ đề gợi ý', () => {
  it('hiện chip theo thứ tự API; bấm chip gọi chu-de với thuTu và thủ tục đang nói tới', async () => {
    const { user, fetchGia } = dung({
      chuDe: CHU_DE_MAU,
      hoi: () => dapAnThuTuc('ho-so'),
      hoiChuDe: () => ({
        loai: 'chu-de',
        thuTucDangNoi: null,
        chuDe: { tenHienThi: 'Đất đai', linhVuc: 'Đất đai' },
        tong: 0,
        danhSachThuTuc: [],
        quay: null,
        noiTiepNhanChuyen: null,
        trungTam: null,
      }),
    });
    const nhom = await screen.findByRole('group', { name: 'Chủ đề gợi ý' });
    expect(within(nhom).getAllByRole('button').map((n) => n.textContent)).toEqual(['Hộ tịch', 'Đất đai', 'Chăn nuôi']);

    await hoi(user, 'khai sinh');
    await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh');
    await user.click(within(nhom).getByRole('button', { name: 'Đất đai' }));
    expect(await screen.findByText('Chưa có thủ tục nào thuộc lĩnh vực này.')).toBeInTheDocument();
    const chuDe = fetchGia.daGui.find((y) => y.phuongThuc === 'POST' && y.duongDan === '/api/tro-ly/chu-de');
    expect(chuDe?.body).toEqual({ thuTu: 2, maThuTuc: '1.001193' });
    // tin của người dân là tên hiển thị của chủ đề
    expect(within(danhSachTin()).getAllByText('Đất đai').length).toBeGreaterThan(0);
  });

  it('không có chủ đề, hoặc tải chủ đề lỗi: không có hàng chip, trợ lý vẫn dùng được', async () => {
    const { fetchGia, unmount } = dung({ chuDe: [] });
    await waitFor(() => expect(fetchGia.demChuDe()).toBe(1));
    expect(screen.queryByRole('group', { name: 'Chủ đề gợi ý' })).not.toBeInTheDocument();
    unmount();

    const lan2 = dung({ chuDe: 'loi', hoi: () => DAP_AN_KHONG_HIEU });
    await waitFor(() => expect(lan2.fetchGia.demChuDe()).toBe(1));
    expect(screen.queryByRole('group', { name: 'Chủ đề gợi ý' })).not.toBeInTheDocument();
    await hoi(lan2.user, 'xin chào');
    expect(await screen.findByText(/Xin lỗi/)).toBeInTheDocument();
  });

  it('đóng rồi mở lại khung: hội thoại còn, chip được tải lại (yêu cầu có điều kiện)', async () => {
    const fetchGia = giaFetchTroLy({ chuDe: CHU_DE_MAU, hoi: () => DAP_AN_KHONG_HIEU });
    const user = userEvent.setup();
    dungKhungTrongRouter(<KhungCoCongTac />);
    await screen.findByRole('group', { name: 'Chủ đề gợi ý' });
    await hoi(user, 'giá vàng');
    await screen.findByText(/Xin lỗi/);
    expect(fetchGia.demChuDe()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'bat-tat' }));
    expect(screen.getByRole('dialog', { hidden: true })).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'bat-tat' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByText('giá vàng')).toBeInTheDocument();
    expect(screen.getByText(/Xin lỗi/)).toBeInTheDocument();
    await waitFor(() => expect(fetchGia.demChuDe()).toBe(2));
    expect(oNhap()).toHaveFocus();
  });
});

describe('KhungTroLy — gợi ý hỏi tiếp', () => {
  it('dưới đáp án danh sách thủ tục mới nhất: 4 chip; bấm là gửi như câu hỏi; hết hiện khi đáp án mới không phải danh sách', async () => {
    const dapAn = [DAP_AN_DANH_SACH, DAP_AN_HO_SO];
    let i = 0;
    const { user, fetchGia } = dung({ hoi: () => dapAn[i++]! });
    await hoi(user, 'kết hôn');
    await screen.findByText(/Tìm thấy 2 thủ tục liên quan/);
    expect(screen.getByText('Bạn có thể hỏi tiếp:')).toBeInTheDocument();
    for (const chip of ['Cần giấy tờ gì?', 'Mấy ngày?', 'Phí bao nhiêu?', 'Nộp ở đâu?']) {
      expect(screen.getByRole('button', { name: chip })).toBeInTheDocument();
    }
    await user.click(screen.getByRole('button', { name: 'Cần giấy tờ gì?' }));
    await screen.findByText('1.001193 – Thủ tục đăng ký khai sinh');
    expect(fetchGia.cacCauHoi().map((c) => [c.cauHoi, c.maThuTuc])).toEqual([
      ['kết hôn', null],
      ['Cần giấy tờ gì?', THU_TUC_KET_HON.ma],
    ]);
    expect(screen.queryByText('Bạn có thể hỏi tiếp:')).not.toBeInTheDocument();
  });

  it('danh sách thủ tục nhưng chưa có thủ tục đang nói tới (thuTucDangNoi null): không có hàng chip hỏi tiếp', async () => {
    const { user, fetchGia } = dung({ hoi: () => ({ ...DAP_AN_DANH_SACH, thuTucDangNoi: null }) });
    await hoi(user, 'kết hôn');
    await screen.findByText(/Tìm thấy 2 thủ tục liên quan/);
    expect(screen.queryByText('Bạn có thể hỏi tiếp:')).not.toBeInTheDocument();
    for (const chip of ['Cần giấy tờ gì?', 'Mấy ngày?', 'Phí bao nhiêu?', 'Nộp ở đâu?']) {
      expect(screen.queryByRole('button', { name: chip })).not.toBeInTheDocument();
    }
    expect(fetchGia.cacCauHoi()).toHaveLength(1);
  });
});

describe('KhungTroLy — gợi ý hỏi tiếp dưới chủ đề', () => {
  it('đáp án chủ đề không có hàng gợi ý hỏi tiếp (máy chủ không gán thủ tục đang nói tới sau chủ đề)', async () => {
    const { user } = dung({
      chuDe: CHU_DE_MAU,
      hoiChuDe: () => ({
        loai: 'chu-de',
        thuTucDangNoi: null,
        chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' },
        tong: 1,
        danhSachThuTuc: [THU_TUC_KET_HON],
        quay: null,
        noiTiepNhanChuyen: null,
        trungTam: null,
      }),
    });
    await user.click(await screen.findByRole('button', { name: 'Hộ tịch' }));
    await screen.findByText('Lĩnh vực Hộ tịch có 1 thủ tục:');
    expect(screen.queryByText('Bạn có thể hỏi tiếp:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mấy ngày?' })).not.toBeInTheDocument();
  });
});

describe('KhungTroLy — riêng tư (BR-13)', () => {
  it('hội thoại không vào storage, cookie hay bộ nhớ đệm TanStack Query', async () => {
    const { user, client } = dung({ chuDe: CHU_DE_MAU, hoi: () => DAP_AN_KHONG_HIEU });
    await hoi(user, 'số 0912345678 của tôi');
    await screen.findByText(/Xin lỗi/);
    expect(window.localStorage).toHaveLength(0);
    expect(window.sessionStorage).toHaveLength(0);
    expect(document.cookie).toBe('');
    const khoa = client.getQueryCache().getAll().map((q) => JSON.stringify(q.queryKey));
    expect(khoa).toEqual([JSON.stringify(['tro-ly', 'chu-de'])]);
    expect(JSON.stringify(client.getQueryCache().getAll().map((q) => q.state.data))).not.toContain('0912345678');
  });

  it('gỡ khung thì huỷ yêu cầu đang bay và không báo lỗi', async () => {
    const { user, fetchGia, unmount } = dung({ hoi: () => new Promise(() => undefined) });
    await hoi(user, 'đang chờ');
    const tuyChon = fetchGia.mock.calls.find(([dau]) => String(dau).endsWith('/hoi'))?.[1];
    expect(tuyChon?.signal?.aborted).toBe(false);
    unmount();
    expect(tuyChon?.signal?.aborted).toBe(true);
  });
});
