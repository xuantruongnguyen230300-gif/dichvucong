import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { linkDvc } from '../thu-tuc/linkDvc';
import { CHI_TIET_KHAI_SINH, DiaChiHienTai, phanHoiLoi } from '../thu-tuc/thuTucMau';
import { ThuTucPopup } from '../thu-tuc/ThuTucPopup';
import type { CauTraLoi, ChuDeGoiY } from './api/troLy';
import { NutTroLy } from './NutTroLy';
import {
  CHU_DE_MAU,
  DAP_AN_HO_SO,
  DAP_AN_KHONG_HIEU,
  THU_TUC_KET_HON,
  THU_TUC_KHAI_SINH,
  THU_TUC_KHAI_SINH_LAI,
  dapAnThuTuc,
  dungKhungTrongRouter,
  giaFetchTroLy,
  type CauHinhFetchTroLy,
} from '../../test-utils/troLyMau';

afterEach(() => vi.unstubAllGlobals());

/** Vỏ nút + popup F03 + địa chỉ, như `Layout` ghép lại: kiểm luồng người dân qua cả hai chức năng. */
function UngDungThu() {
  return (
    <>
      <h1>Trang thử</h1>
      <NutTroLy />
      <ThuTucPopup />
      <DiaChiHienTai />
    </>
  );
}

const nutTroLy = () => screen.getByRole('button', { name: /^Trợ lý$/ });
const khung = () => document.getElementById('khung-tro-ly');
const oNhap = () => screen.getByRole('textbox', { name: 'Câu hỏi' });
const diaChi = () => screen.getByTestId('dia-chi').textContent;

function dung(cauHinh: CauHinhFetchTroLy = {}, diaChiDau = '/') {
  const fetchGia = giaFetchTroLy({ chiTiet: () => Response.json(CHI_TIET_KHAI_SINH), ...cauHinh });
  const user = userEvent.setup();
  const ketQua = dungKhungTrongRouter(<UngDungThu />, diaChiDau);
  return { fetchGia, user, ...ketQua };
}

async function moKhung(user: ReturnType<typeof userEvent.setup>) {
  await user.click(nutTroLy());
  await waitFor(() => expect(khung()).toBeVisible());
}
const hoi = (user: ReturnType<typeof userEvent.setup>, cau: string) => user.type(oNhap(), `${cau}{Enter}`);

describe('trợ lý trong ứng dụng: AC-1, AC-2, AC-9, AC-17', () => {
  it('hỏi hồ sơ → hỏi tiếp "mấy ngày" gửi kèm thủ tục đang nói tới (AC-1, AC-2)', async () => {
    const { user, fetchGia } = dung({
      hoi: ({ cauHoi }) => (cauHoi.includes('giấy tờ') ? DAP_AN_HO_SO : dapAnThuTuc('thoi-han', { thoiHan: '3 ngày làm việc' })),
    });
    await moKhung(user);
    await hoi(user, 'làm giấy khai sinh cần giấy tờ gì');
    expect(await screen.findByText('Tờ khai đăng ký khai sinh theo mẫu', { exact: false })).toBeInTheDocument();
    await hoi(user, 'mấy ngày');
    expect(await screen.findByText('Thời hạn giải quyết: 3 ngày làm việc')).toBeInTheDocument();
    expect(fetchGia.cacCauHoi().map((c) => c.maThuTuc)).toEqual([null, '1.001193']);
  });

  it('"Xem chi tiết" mở popup đúng thủ tục, địa chỉ có ma; đóng bằng "Quay lại": địa chỉ bỏ ma, khung và hội thoại còn (AC-9, AC-17)', async () => {
    const { user, router } = dung({ hoi: () => DAP_AN_HO_SO });
    await moKhung(user);
    await hoi(user, 'khai sinh cần gì');
    await user.click(await screen.findByRole('button', { name: 'Xem chi tiết Thủ tục đăng ký khai sinh' }));

    const popup = await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' });
    expect(popup).toBeVisible();
    expect(new URLSearchParams(diaChi()!.split('?')[1]).get('ma')).toBe('1.001193');
    // khung và hội thoại vẫn còn dưới popup
    expect(khung()).toBeInTheDocument();
    expect(within(khung()!).getByText('khai sinh cần gì')).toBeInTheDocument();

    await act(() => router.navigate(-1));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' })).not.toBeInTheDocument());
    expect(diaChi()).toBe('/');
    expect(khung()).toBeVisible();
    expect(within(khung()!).getByText('khai sinh cần gì')).toBeInTheDocument();
    expect(within(khung()!).getByText('1.001193 – Thủ tục đăng ký khai sinh')).toBeInTheDocument();
  });

  it('đóng popup bằng nút Đóng: địa chỉ bỏ ma, khung còn', async () => {
    const { user } = dung({ hoi: () => DAP_AN_HO_SO });
    await moKhung(user);
    await hoi(user, 'khai sinh cần gì');
    await user.click(await screen.findByRole('button', { name: 'Xem chi tiết Thủ tục đăng ký khai sinh' }));
    const popup = await screen.findByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' });
    await user.click(within(popup).getByRole('button', { name: 'Đóng' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Thủ tục đăng ký khai sinh' })).not.toBeInTheDocument());
    expect(diaChi()).toBe('/');
    expect(khung()).toBeVisible();
  });
});

describe('trợ lý trong ứng dụng: AC-11, AC-29', () => {
  it('danh sách thủ tục: mỗi thủ tục có liên kết Cổng DVC đúng mã, mở tab mới; khung còn nguyên', async () => {
    const dapAn: CauTraLoi = {
      loai: 'thu-tuc-danh-sach',
      thuTucDangNoi: THU_TUC_KET_HON.ma,
      danhSachThuTuc: [THU_TUC_KET_HON, THU_TUC_KHAI_SINH, THU_TUC_KHAI_SINH_LAI],
    };
    const { user } = dung({ hoi: () => dapAn });
    await moKhung(user);
    await hoi(user, 'kết hôn');
    await screen.findByText(/Tìm thấy 3 thủ tục liên quan/);
    const lienKet = screen.getAllByRole('link', { name: /Xem và nộp trên Cổng DVC/ });
    expect(lienKet.map((l) => l.getAttribute('href'))).toEqual([
      linkDvc(THU_TUC_KET_HON.ma),
      linkDvc(THU_TUC_KHAI_SINH.ma),
      linkDvc(THU_TUC_KHAI_SINH_LAI.ma),
    ]);
    for (const l of lienKet) expect(l).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('button', { name: 'Cần giấy tờ gì?' })).toBeInTheDocument();
    expect(khung()).toBeVisible();
  });
});

describe('trợ lý trong ứng dụng: AC-25 chủ đề gợi ý', () => {
  it('mở thấy 6 chủ đề theo thứ tự; dữ liệu đổi còn 5 → mở lại khung thấy 5', async () => {
    const sau: ChuDeGoiY[] = [
      { thuTu: 1, tenHienThi: 'Hộ tịch' },
      { thuTu: 2, tenHienThi: 'Đất đai' },
      { thuTu: 3, tenHienThi: 'Chăn nuôi' },
      { thuTu: 4, tenHienThi: 'Xây dựng' },
      { thuTu: 5, tenHienThi: 'Kinh doanh' },
    ];
    const truoc: ChuDeGoiY[] = [...sau, { thuTu: 6, tenHienThi: 'Giáo dục' }];
    let dung5 = false;
    const { user } = dung({ chuDe: () => (dung5 ? sau : truoc) });
    await moKhung(user);
    const nhom = await screen.findByRole('group', { name: 'Chủ đề gợi ý' });
    expect(within(nhom).getAllByRole('button').map((n) => n.textContent)).toEqual(truoc.map((c) => c.tenHienThi));

    await user.click(nutTroLy()); // đóng
    expect(khung()).not.toBeVisible();
    dung5 = true;
    await user.click(nutTroLy()); // mở lại
    await waitFor(() => expect(within(screen.getByRole('group', { name: 'Chủ đề gợi ý' })).getAllByRole('button')).toHaveLength(5));
  });

  it('bấm chủ đề: tin của người dân là tên chủ đề, đáp án liệt kê thủ tục kèm tổng', async () => {
    const { user, fetchGia } = dung({
      chuDe: CHU_DE_MAU,
      hoiChuDe: ({ thuTu }) => ({
        loai: 'chu-de',
        thuTucDangNoi: null,
        chuDe: { tenHienThi: 'Hộ tịch', linhVuc: 'Hộ tịch' },
        tong: thuTu === 1 ? 11 : 0,
        danhSachThuTuc: thuTu === 1 ? [THU_TUC_KHAI_SINH, THU_TUC_KET_HON] : [],
        quay: null,
        noiTiepNhanChuyen: null,
        trungTam: null,
      }),
    });
    await moKhung(user);
    await user.click(await screen.findByRole('button', { name: 'Hộ tịch' }));
    expect(await screen.findByText('Lĩnh vực Hộ tịch có 11 thủ tục:')).toBeInTheDocument();
    expect(screen.getByText('Hiển thị 2/11 thủ tục')).toBeInTheDocument();
    expect(fetchGia.daGui.find((y) => y.phuongThuc === 'POST' && y.duongDan === '/api/tro-ly/chu-de')?.body).toEqual({
      thuTu: 1,
      maThuTuc: null,
    });
  });
});

describe('trợ lý trong ứng dụng: bắt đầu lại, Esc, lỗi', () => {
  it('Esc đóng khung và trả con trỏ về nút Trợ lý; mở lại: hội thoại còn', async () => {
    const { user } = dung({ hoi: () => DAP_AN_KHONG_HIEU });
    await moKhung(user);
    await hoi(user, 'giá vàng hôm nay');
    await screen.findByText(/Xin lỗi/);
    await user.keyboard('{Escape}');
    expect(khung()).not.toBeVisible();
    expect(nutTroLy()).toHaveFocus();
    expect(nutTroLy()).toHaveAttribute('aria-expanded', 'false');

    await user.click(nutTroLy());
    expect(khung()).toBeVisible();
    expect(screen.getByText('giá vàng hôm nay')).toBeInTheDocument();
    expect(oNhap()).toHaveFocus();
  });

  it('429 → câu của F00 BR-6; trang không lỗi; hết giới hạn bấm "Thử lại" được trả lời', async () => {
    let lan = 0;
    const { user } = dung({ hoi: () => (lan++ === 0 ? phanHoiLoi(429, 'qua-nhieu-yeu-cau') : DAP_AN_KHONG_HIEU) });
    await moKhung(user);
    await hoi(user, 'giá vàng hôm nay');
    expect(await screen.findByText('Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trang thử' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText(/Xin lỗi, tôi chưa có câu trả lời/)).toBeInTheDocument();
  });
});
