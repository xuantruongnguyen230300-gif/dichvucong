import { describe, expect, it } from 'vitest';
import { laLienKetCongDvc } from './laLienKetCongDvc';

describe('laLienKetCongDvc (F09 BR-4)', () => {
  it.each([
    'https://dichvucong.gov.vn/tra-cuu-ho-so',
    'http://dichvucong.gov.vn',
    'https://www.dichvucong.gov.vn/x',
    'HTTPS://DichVuCong.Gov.VN/',
    'https://DICHVUCONG.GOV.VN./x',
    'https://dichvucong.gov.vn./x',
    'https://A.DICHVUCONG.GOV.VN./x',
    'https://www.dichvucong.gov.vn../x',
    'https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-nganh-doc.html?ma_thu_tuc=1.001193',
  ])('đúng với %s', (href) => {
    expect(laLienKetCongDvc(href)).toBe(true);
  });

  it.each([
    null,
    undefined,
    '',
    'javascript:alert(1)',
    'tel:02723893900',
    '//dichvucong.gov.vn',
    'https://dichvucong.gov.vn.evil.com',
    'https://evildichvucong.gov.vn',
    'https://dichvucong.tayninh.gov.vn',
    'https://cangiuoc.tayninh.gov.vn',
    'https://tayninh.gov.vn',
    'https://evil.com/?u=dichvucong.gov.vn',
    'https://dichvucong.gov.vn@evil.com',
    'https://dichvucong.gov.vn..evil.com',
    'https://dichvucong.gov.vn.evil.com.',
    'https://evildichvucong.gov.vn.',
  ])('sai với %s', (href) => {
    expect(laLienKetCongDvc(href)).toBe(false);
  });
});
