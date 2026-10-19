import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { giaiMaQr } from './giaiMaQrThu';
import QrLinhVuc from './QrLinhVuc';
import { napNgonNguLinhVuc } from './i18n';

beforeAll(napNgonNguLinhVuc);

const giaiMa = giaiMaQr;

const veQr = (link: string, ten = 'Hộ tịch', ma = 'ho-tich') => {
  const { container } = render(<QrLinhVuc link={link} ten={ten} ma={ma} />);
  return container.querySelector('svg') as SVGSVGElement;
};

const goc = 'https://tracuu.cangiuoc.example.gov.vn';
const LINK_NGAN = `${goc}/thu-tuc?cap=xa&lv=ho-tich`;
const LINK_VUA = `${goc}/thu-tuc?cap=xa&lv=${'dang-ky-kinh-doanh-'.repeat(2)}ho-kinh-doanh`;
const MA_DAI_NHAT = 'x'.repeat(69);
const LINK_DAI = `${goc}/thu-tuc?cap=tinh&lv=${MA_DAI_NHAT}`;

describe('QrLinhVuc — giải mã bằng jsqr (AC-2, AC-7)', () => {
  it.each([
    ['ngắn (~55 byte)', LINK_NGAN],
    ['vừa (~100 byte)', LINK_VUA],
    ['dài nhất (mã 69 ký tự, ~140 byte)', LINK_DAI],
  ])('link %s giải ra đúng địa chỉ', (_ten, link) => {
    expect(giaiMa(veQr(link))).toBe(link);
  });

  it('tên miền khác (localhost) thì mã chứa đúng tên miền đó', () => {
    const link = 'http://localhost:5173/thu-tuc?cap=xa&lv=ho-tich';
    expect(giaiMa(veQr(link))).toBe(link);
  });

  it('hai link khác nhau cho hai ma trận khác nhau', () => {
    const a = veQr(LINK_NGAN).querySelector('path')?.getAttribute('d');
    const b = veQr(`${goc}/thu-tuc?cap=tinh&lv=ho-tich`).querySelector('path')?.getAttribute('d');
    expect(a).not.toBe(b);
  });
});

describe('QrLinhVuc — cấu trúc SVG', () => {
  it('role="img", nhãn có tên lĩnh vực, data-qr là mã lĩnh vực', () => {
    const svg = veQr(LINK_NGAN, 'Hộ tịch', 'ho-tich');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Mã QR của lĩnh vực Hộ tịch');
    expect(svg).toHaveAttribute('data-qr', 'ho-tich');
  });

  it('đúng một <path> cho mọi ô đen, một <rect> nền; viewBox có lề 4 ô mỗi phía', () => {
    const svg = veQr(LINK_NGAN);
    expect(svg.querySelectorAll('path')).toHaveLength(1);
    expect(svg.querySelectorAll('rect')).toHaveLength(1);
    const [x0, y0, rong, cao] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number) as [number, number, number, number];
    expect([x0, y0]).toEqual([-4, -4]);
    expect(rong).toBe(cao);
    const nen = svg.querySelector('rect');
    expect(nen).toHaveAttribute('x', '-4');
    expect(nen).toHaveAttribute('width', String(rong));
    // Cỡ mã = viewBox - 8 lề; phiên bản 1 là 21 ô
    expect((rong - 8 - 21) % 4).toBe(0);
  });

  it('không có thuộc tính style (hợp CSP), không có thẻ script/style', () => {
    const svg = veQr(LINK_NGAN);
    expect(svg.hasAttribute('style')).toBe(false);
    expect(svg.querySelectorAll('[style]')).toHaveLength(0);
    expect(svg.querySelector('script, style')).toBeNull();
  });

  it('thuộc tính d chỉ gồm lệnh M h v z và số (không có chuỗi người dùng)', () => {
    const d = veQr(LINK_NGAN, '<img src=x onerror=1>', 'a"b').querySelector('path')?.getAttribute('d') ?? '';
    expect(d).toMatch(/^(?:M-?\d+ -?\d+h\d+v1h-\d+z)+$/);
  });
});
