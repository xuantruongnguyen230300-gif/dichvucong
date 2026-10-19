import { screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ThongTinTrungTam } from '../../core/api/trungTam';
import { renderApp, type PhanHoiTrungTam } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { napNgonNguTrangChu } from './i18n';
import { TrangChu } from './TrangChu';

// Khối thủ tục thường gặp (F03) có test riêng; ở đây chỉ kiểm chỗ ghép: thứ tự và việc các khối không ảnh hưởng nhau
const kieuThuongGap = vi.hoisted(() => ({ giaTri: 'co' as 'co' | 'rong' | 'loi' }));
vi.mock('../thu-tuc/KhoiThuongGap', () => ({
  KhoiThuongGap: () => {
    if (kieuThuongGap.giaTri === 'rong') return null;
    if (kieuThuongGap.giaTri === 'loi') {
      return (
        <section aria-labelledby="tg-thu">
          <h2 id="tg-thu">Thủ tục thường gặp</h2>
          <div role="alert">Lỗi thử của khối thường gặp</div>
        </section>
      );
    }
    return (
      <section aria-labelledby="tg-thu">
        <h2 id="tg-thu">Thủ tục thường gặp</h2>
      </section>
    );
  },
}));

beforeAll(napNgonNguTrangChu);
afterEach(() => {
  kieuThuongGap.giaTri = 'co';
});
afterEach(() => vi.unstubAllGlobals());

const GIO_HAI_DEN_SAU = [1, 2, 3, 4, 5].map((thu) => ({ thu, sangTu: '07:00', sangDen: '11:30', chieuTu: '13:30', chieuDen: '17:00' }));
const DU_LIEU: ThongTinTrungTam = {
  ...TRUNG_TAM_THU,
  oDichVu: [
    { ten: 'Bốc số thử', bieuTuong: 'boc-so', url: null },
    { ten: 'Tra cứu hồ sơ thử', bieuTuong: 'tra-cuu-ho-so', url: 'https://tracuu.example.gov.vn' },
  ],
  gioLamViec: GIO_HAI_DEN_SAU,
  ghiChuNgayNghi: 'Nghỉ lễ, Tết theo quy định.',
};

const dung = (trungTam: PhanHoiTrungTam) => renderApp([{ path: '*', element: <TrangChu /> }], { trungTam });

describe('TrangChu — có dữ liệu', () => {
  it('đúng một h1 là tên Trung tâm; ba h2 cho ba khối; thứ tự banner → ô → thường gặp → giờ', async () => {
    const { container } = dung(DU_LIEU);
    await screen.findByRole('heading', { level: 1, name: 'Trung tâm thử A' });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trung tâm thử A');
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(['Dịch vụ nhanh', 'Thủ tục thường gặp', 'Thời gian làm việc']);
    const thuTu = [...container.querySelectorAll('h1, h2')].map((h) => h.textContent);
    expect(thuTu).toEqual(['Trung tâm thử A', 'Dịch vụ nhanh', 'Thủ tục thường gặp', 'Thời gian làm việc']);
  });

  it('banner có dòng cơ quan chủ quản và câu mô tả', async () => {
    dung(DU_LIEU);
    const banner = (await screen.findByRole('heading', { level: 1, name: 'Trung tâm thử A' })).closest('section')!;
    expect(within(banner).getByText('Cơ quan thử D')).toBeInTheDocument();
    expect(within(banner).getByText('Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.')).toBeInTheDocument();
  });

  it('coQuanChuQuan null hoặc chỉ khoảng trắng → không có dòng cơ quan', async () => {
    for (const coQuanChuQuan of [null, '   ']) {
      const { unmount } = dung({ ...DU_LIEU, coQuanChuQuan });
      const banner = (await screen.findByRole('heading', { level: 1, name: 'Trung tâm thử A' })).closest('section')!;
      expect(banner.querySelectorAll('p')).toHaveLength(1); // chỉ còn câu mô tả
      expect(within(banner).queryByText('Cơ quan thử D')).toBeNull();
      unmount();
    }
  });

  it('tên và cơ quan rất dài: h1 và dòng cơ quan vẫn chứa đủ chữ (cắt bằng CSS), kèm title; không thêm dòng nào', async () => {
    const ten = 'Trung tâm ' + 'rất dài '.repeat(30).trim();
    const coQuan = 'Cơ quan ' + 'chủ quản '.repeat(15).trim();
    dung({ ...DU_LIEU, ten, coQuanChuQuan: coQuan });
    const h1 = await screen.findByRole('heading', { level: 1, name: ten });
    expect(h1).toHaveAttribute('title', ten);
    expect(screen.getByText(coQuan)).toHaveAttribute('title', coQuan);
  });

  it('một yêu cầu /api/trung-tam duy nhất cho cả ba khối', async () => {
    const { fetchGia } = dung(DU_LIEU);
    await screen.findByRole('heading', { level: 1, name: 'Trung tâm thử A' });
    expect(fetchGia).toHaveBeenCalledTimes(1);
  });
});

describe('TrangChu — lỗi (một thông báo, banner dự phòng, giờ ẩn)', () => {
  it.each<PhanHoiTrungTam>(['loi-mang', 'khong-co-du-lieu'])('%s', async (kieu) => {
    dung(kieu);
    expect(await screen.findAllByRole('alert')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tra cứu thủ tục hành chính');
    expect(screen.queryByText('Thời gian làm việc')).toBeNull();
    expect(screen.getByText('Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.')).toBeInTheDocument();
  });
});

describe('TrangChu — đang tải', () => {
  it('có khung giữ chỗ cho ô và giờ; h1 có tên đọc được; câu mô tả hiện ngay; chưa có lỗi', () => {
    dung('treo');
    expect(screen.getAllByRole('status').map((s) => s.textContent)).toEqual(['Đang tải…', 'Đang tải…']);
    expect(screen.getByRole('region', { name: 'Thời gian làm việc' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tra cứu thủ tục hành chính');
    expect(screen.getByText('Tra cứu thủ tục hành chính, hồ sơ cần chuẩn bị và nơi nộp hồ sơ.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('dữ liệu về → khung giữ chỗ biến mất, ô và giờ hiện', async () => {
    const { fetchGia } = dung('treo');
    fetchGia.traLoi(DU_LIEU);
    expect(await screen.findByRole('link', { name: /Tra cứu hồ sơ thử/ })).toBeInTheDocument();
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trung tâm thử A');
  });
});

describe('TrangChu — không dữ liệu giờ', () => {
  it('không có dòng giờ → ẩn khối giờ, ô dịch vụ vẫn hiện', async () => {
    dung({ ...DU_LIEU, gioLamViec: [] });
    expect(await screen.findByRole('link', { name: /Tra cứu hồ sơ thử/ })).toBeInTheDocument();
    expect(screen.queryByText('Thời gian làm việc')).toBeNull();
    expect(screen.queryByText('Ngoài giờ làm việc')).toBeNull();
    expect(screen.queryByText('Đang trong giờ làm việc')).toBeNull();
  });
});

describe('TrangChu — ghép khối thủ tục thường gặp (F03)', () => {
  it('khối thường gặp không vẽ gì (rỗng): ô dịch vụ và giờ làm việc vẫn hiện, còn hai h2', async () => {
    kieuThuongGap.giaTri = 'rong';
    dung(DU_LIEU);
    expect(await screen.findByRole('link', { name: /Tra cứu hồ sơ thử/ })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Dịch vụ nhanh', 'Thời gian làm việc']);
    expect(screen.getByRole('region', { name: 'Thời gian làm việc' })).toBeInTheDocument();
  });

  it('khối thường gặp báo lỗi: ô dịch vụ và giờ làm việc vẫn hiện', async () => {
    kieuThuongGap.giaTri = 'loi';
    dung(DU_LIEU);
    expect(await screen.findByRole('link', { name: /Tra cứu hồ sơ thử/ })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi thử của khối thường gặp');
    expect(screen.getByRole('region', { name: 'Thời gian làm việc' })).toBeInTheDocument();
  });

  it('API trung tâm lỗi: khối thường gặp vẫn hiện (độc lập)', async () => {
    dung('loi-mang');
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Thủ tục thường gặp' })).toBeInTheDocument();
  });
});
