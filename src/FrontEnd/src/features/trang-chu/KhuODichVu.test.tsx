/// <reference types="node" />
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useThongTinTrungTam, type BieuTuongODichVu, type ThongTinTrungTam } from '../../core/api/trungTam';
import { datCheDoKiosk } from '../../core/kiosk/cheDoKiosk';
import { NhacDangXuat } from '../../core/kiosk/NhacDangXuat';
import { renderApp, type PhanHoiTrungTam } from '../../test-utils/renderApp';
import { TRUNG_TAM_THU } from '../../test-utils/trungTamMau';
import { napNgonNguTrangChu } from './i18n';
import { KhuODichVu } from './KhuODichVu';
import styles from './KhuODichVu.module.css';

beforeAll(napNgonNguTrangChu);
afterEach(() => vi.unstubAllGlobals());

type ODichVu = ThongTinTrungTam['oDichVu'][number];
const o = (ten: string, bieuTuong: string, url: string | null): ODichVu => ({
  ten,
  bieuTuong: bieuTuong as BieuTuongODichVu,
  url,
});

/** 6 ô như lien-ket.md §1: hai ô đầu chưa có link. */
const SAU_O: ODichVu[] = [
  o('Bốc số thử', 'boc-so', null),
  o('Đánh giá thử', 'danh-gia', null),
  o('Tra cứu hồ sơ thử', 'tra-cuu-ho-so', 'https://tracuu.example.gov.vn/ho-so'),
  o('Thanh toán thử', 'thanh-toan', 'https://thanhtoan.example.gov.vn'),
  o('Cổng dịch vụ công thử', 'cong-dvc', 'https://dvc.example.gov.vn'),
  o('Cổng thông tin thử', 'cong-thong-tin', 'https://thongtin.example.gov.vn'),
];
const voi = (oDichVu: ODichVu[]): ThongTinTrungTam => ({ ...TRUNG_TAM_THU, oDichVu });

function ManHinh() {
  const truyVan = useThongTinTrungTam();
  return <KhuODichVu truyVan={truyVan} />;
}
const dung = (trungTam: PhanHoiTrungTam) => renderApp([{ path: '*', element: <ManHinh /> }], { trungTam });

describe('KhuODichVu', () => {
  it('đúng 6 ô theo thứ tự dữ liệu; 4 ô có link đúng href, mở tab mới, rel an toàn', async () => {
    dung(voi(SAU_O));
    const luoi = await screen.findByRole('list');
    const muc = within(luoi).getAllByRole('listitem');
    expect(muc.map((m) => m.textContent)).toEqual([
      'Bốc số thử',
      'Đánh giá thử',
      expect.stringContaining('Tra cứu hồ sơ thử'),
      expect.stringContaining('Thanh toán thử'),
      expect.stringContaining('Cổng dịch vụ công thử'),
      expect.stringContaining('Cổng thông tin thử'),
    ]);
    const lienKet = within(luoi).getAllByRole('link');
    expect(lienKet.map((a) => a.getAttribute('href'))).toEqual([
      'https://tracuu.example.gov.vn/ho-so',
      'https://thanhtoan.example.gov.vn/',
      'https://dvc.example.gov.vn/',
      'https://thongtin.example.gov.vn/',
    ]);
    for (const a of lienKet) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('có một h2 "Dịch vụ nhanh" đặt tên cho vùng, không dùng <nav>', async () => {
    dung(voi(SAU_O));
    await screen.findByRole('list');
    expect(screen.getByRole('heading', { level: 2, name: 'Dịch vụ nhanh' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Dịch vụ nhanh' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it.each([null, '', '   ', 'javascript:alert(1)', 'data:text/html,x'])(
    'url=%j → ô thường: không <a>, không tabindex, không "Trang ngoài"',
    async (url) => {
      dung(voi([o('Ô không link', 'boc-so', url)]));
      const ten = await screen.findByText('Ô không link');
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.queryByText('Trang ngoài')).toBeNull();
      const khung = ten.parentElement!;
      expect(khung).not.toHaveAttribute('tabindex');
      expect(khung).not.toHaveAttribute('href');
    },
  );

  it('Tab đi qua hàng ô chỉ dừng ở 4 ô có link', async () => {
    const nguoiDung = userEvent.setup();
    dung(voi(SAU_O));
    await screen.findByRole('list');
    const dung4: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      await nguoiDung.tab();
      dung4.push(document.activeElement!.getAttribute('href')!);
    }
    expect(dung4.every((h) => h.startsWith('https://'))).toBe(true);
    await nguoiDung.tab();
    expect(document.activeElement).toBe(document.body); // hết ô: không ô thường nào nhận focus
  });

  it('thêm một ô vào dữ liệu → thêm một phần tử, không sửa mã', async () => {
    dung(voi([...SAU_O, o('Ô mới thêm', 'lien-ket', 'https://moi.example.gov.vn')]));
    const luoi = await screen.findByRole('list');
    expect(within(luoi).getAllByRole('listitem')).toHaveLength(7);
    expect(within(luoi).getByRole('link', { name: /Ô mới thêm/ })).toHaveAttribute('href', 'https://moi.example.gov.vn/');
  });

  it('mỗi khoá biểu tượng ra một icon riêng; khoá lạ rơi về icon liên kết, không ném lỗi', async () => {
    const khoa: BieuTuongODichVu[] = ['boc-so', 'danh-gia', 'tra-cuu-ho-so', 'thanh-toan', 'cong-dvc', 'cong-thong-tin', 'lien-ket'];
    dung(voi([...khoa.map((k) => o(`Ô ${k}`, k, null)), o('Ô khoá lạ', 'khoa-chua-biet', null), o('Ô toString', 'toString', null)]));
    const luoi = await screen.findByRole('list');
    const lopIcon = within(luoi)
      .getAllByRole('listitem')
      .map((m) => m.querySelector('svg')!.getAttribute('class')!.split(' ').find((l) => l.startsWith('lucide-') && l !== 'lucide')!);
    expect(new Set(lopIcon.slice(0, 7)).size).toBe(7);
    expect(lopIcon[7]).toBe(lopIcon[6]); // khoá lạ = icon "liên kết"
    expect(lopIcon[8]).toBe(lopIcon[6]); // không nhầm khoá của Object.prototype
  });

  it('màu theo khoá, không theo vị trí: đổi thứ tự thì ô vẫn giữ màu', async () => {
    dung(voi([SAU_O[3]!, SAU_O[1]!]));
    const luoi = await screen.findByRole('list');
    const mau = (ten: string) => within(luoi).getByText(ten).previousElementSibling!.className;
    const thanhToan = mau('Thanh toán thử');
    const danhGia = mau('Đánh giá thử');
    expect(thanhToan).not.toBe(danhGia);
    expect(thanhToan).toMatch(/orange/);
    expect(danhGia).toMatch(/pink/);
  });

  it('không hiển thị moTa', async () => {
    dung(voi([{ ...SAU_O[0]!, moTa: 'Mô tả không được hiện' } as ODichVu]));
    await screen.findByRole('list');
    expect(screen.queryByText('Mô tả không được hiện')).toBeNull();
  });

  it('oDichVu rỗng → không có lưới, không có lỗi', async () => {
    dung(voi([]));
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('đang tải → khung giữ chỗ có "Đang tải…"; chưa có lưới thật', () => {
    dung('treo');
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('lỗi → đúng một ErrorState; "Thử lại" gọi lại API và hiện ô', async () => {
    const nguoiDung = userEvent.setup();
    const { fetchGia, client } = dung('loi-mang');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    const soLanGoi = fetchGia.mock.calls.length;
    fetchGia.mockImplementation(() => Promise.resolve(Response.json(voi(SAU_O))));
    await nguoiDung.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('list')).toBeInTheDocument();
    expect(fetchGia.mock.calls.length).toBeGreaterThan(soLanGoi);
    expect(client.getQueryData(['trung-tam'])).toBeDefined();
  });

  it('404 (chưa nhập dữ liệu Trung tâm) → ErrorState, không ném lỗi', async () => {
    dung('khong-co-du-lieu');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('KhuODichVu: dòng nhắc đăng xuất (F09 BR-4)', () => {
  const NHAC = 'Nhớ đăng xuất khi dùng xong';
  const O_CONG_DVC = [
    o('Bốc số thử', 'boc-so', null),
    o('Đánh giá thử', 'danh-gia', null),
    o('Tra cứu hồ sơ', 'tra-cuu-ho-so', 'https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html'),
    o('Thanh toán', 'thanh-toan', 'https://thanhtoan.dichvucong.gov.vn'),
    o('Cổng DVC', 'cong-dvc', 'https://dichvucong.gov.vn'),
    o('Cổng thông tin xã', 'cong-thong-tin', 'https://cangiuoc.tayninh.gov.vn'),
  ];

  it('kiosk, 6 ô như lien-ket.md §1: đúng một dòng phía trên lưới, không ô nào có dòng riêng', async () => {
    datCheDoKiosk(true);
    dung(voi(O_CONG_DVC));
    const luoi = await screen.findByRole('list');
    const dong = await screen.findByText(NHAC);
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
    expect(luoi).not.toContainElement(dong);
    expect(dong.compareDocumentPosition(luoi) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(luoi).queryByText(NHAC)).toBeNull();
  });

  /**
   * Dựng kèm một dòng đối chứng (`NhacDangXuat` không truyền cacLienKet luôn hiện ở kiosk): khi nó hiện ra thì chunk kiosk
   * đã nạp xong, nên "không có dòng thứ hai" là kết quả thật chứ không phải do chunk chưa kịp về.
   */
  async function dungCoDoiChung(trungTam: PhanHoiTrungTam) {
    datCheDoKiosk(true);
    const kq = renderApp(
      [
        {
          path: '*',
          element: (
            <>
              <ManHinh />
              <NhacDangXuat className="doi-chung" />
            </>
          ),
        },
      ],
      { trungTam },
    );
    expect(await screen.findByText(NHAC)).toHaveClass('doi-chung');
    return kq;
  }

  it('kiosk, chỉ còn ô cổng thông tin xã và các ô không link: không dòng (AC-3)', async () => {
    await dungCoDoiChung(voi([O_CONG_DVC[0]!, O_CONG_DVC[1]!, O_CONG_DVC[5]!]));
    await screen.findByRole('list');
    expect(screen.getAllByText(NHAC)).toHaveLength(1); // chỉ dòng đối chứng
  });

  it.each([
    ['oDichVu rỗng', voi([])],
    ['đang tải', 'treo' as const],
    ['lỗi mạng', 'loi-mang' as const],
  ])('kiosk, %s: không dòng', async (_ten, trungTam) => {
    await dungCoDoiChung(trungTam);
    if (trungTam === 'loi-mang') await screen.findByRole('alert');
    expect(screen.getAllByText(NHAC)).toHaveLength(1);
  });

  it('ngoài kiosk: không dòng dù có ô tới Cổng DVC (AC-4)', async () => {
    dung(voi(O_CONG_DVC));
    await screen.findByRole('list');
    expect(screen.queryByText(NHAC)).toBeNull();
  });

  describe('giữ chỗ dòng nhắc (F09 K3, CLS)', () => {
    it('kiosk, có ô tới Cổng DVC: lưới có sẵn khung giữ chỗ một dòng ngay khi dữ liệu về, trước cả khi dòng nhắc hiện', async () => {
      datCheDoKiosk(true);
      const { container } = dung(voi(O_CONG_DVC));
      await screen.findByRole('list');
      const giuCho = container.querySelector(`.${styles.giuChoNhac!}`);
      expect(giuCho).not.toBeNull();
      expect(giuCho!.nextElementSibling).toBe(screen.getByRole('list')); // ngay phía trên lưới
      await screen.findByText(NHAC);
      expect(giuCho).toContainElement(screen.getByText(NHAC)); // dòng nhắc thay vào đúng chỗ đó
    });

    it('chiều cao khung giữ chỗ tính từ token: một dòng font-size-sm × line-height-body + space-3', () => {
      const css = readFileSync(join(import.meta.dirname, 'KhuODichVu.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(css).toMatch(
        /\.giuChoNhac\s*\{[^}]*min-height:\s*calc\(var\(--font-size-sm\) \* var\(--line-height-body\) \+ var\(--space-3\)\)/,
      );
    });

    it.each([
      ['ngoài kiosk', false, O_CONG_DVC],
      ['kiosk nhưng không ô nào tới Cổng DVC', true, [O_CONG_DVC[0]!, O_CONG_DVC[5]!]],
    ])('%s: không có khung giữ chỗ (không chừa dòng trống)', async (_ten, kiosk, cacO) => {
      datCheDoKiosk(kiosk);
      const { container } = dung(voi(cacO));
      await screen.findByRole('list');
      expect(container.querySelector(`.${styles.giuChoNhac!}`)).toBeNull();
    });
  });
});
