import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { datCheDoKiosk } from './cheDoKiosk';

const CHU = 'Nhớ đăng xuất khi dùng xong';

// Bọc `napGiaoDienKiosk` thật bằng spy để kiểm "ngoài kiosk không nạp chunk" (AC-4)
const { napThat } = vi.hoisted(() => ({ napThat: vi.fn() }));
vi.mock('./napGiaoDien', async (goc) => {
  const m = await goc<typeof import('./napGiaoDien')>();
  napThat.mockImplementation(m.napGiaoDienKiosk);
  return { napGiaoDienKiosk: napThat };
});

import { NhacDangXuat } from './NhacDangXuat';

const DVC = 'https://dichvucong.gov.vn/tra-cuu-ho-so';
const XA = 'https://cangiuoc.tayninh.gov.vn';

describe('NhacDangXuat', () => {
  beforeEach(() => napThat.mockClear());

  it('ngoài kiosk: không ra gì và không nạp chunk kiosk (AC-4)', () => {
    const { container } = render(<NhacDangXuat />);
    expect(container).toBeEmptyDOMElement();
    expect(napThat).not.toHaveBeenCalled();
  });

  it('kiosk, không truyền cacLienKet: đúng một dòng', async () => {
    datCheDoKiosk(true);
    render(<NhacDangXuat />);
    expect(await screen.findAllByText(CHU)).toHaveLength(1);
  });

  it.each([[[XA, null, undefined]], [[]], [[null, null]]])(
    'kiosk, cacLienKet %j không có đích Cổng DVC: không dòng',
    async (cacLienKet) => {
      datCheDoKiosk(true);
      // Dòng đối chứng (không truyền cacLienKet) hiện ra thì chunk đã nạp xong; chỉ có đúng dòng của nó
      render(
        <>
          <NhacDangXuat cacLienKet={cacLienKet} />
          <NhacDangXuat className="doi-chung" />
        </>,
      );
      expect(await screen.findByText(CHU)).toHaveClass('doi-chung');
      expect(screen.getAllByText(CHU)).toHaveLength(1);
    },
  );

  it('kiosk, nhiều đích Cổng DVC: vẫn đúng một dòng', async () => {
    datCheDoKiosk(true);
    render(<NhacDangXuat cacLienKet={[DVC, XA, 'https://www.dichvucong.gov.vn/x']} />);
    expect(await screen.findAllByText(CHU)).toHaveLength(1);
  });

  it('className được áp; dòng không phải liên kết và không có phần tử Tab được', async () => {
    datCheDoKiosk(true);
    const { container } = render(<NhacDangXuat className="ngoai" />);
    const dong = await screen.findByText(CHU);
    expect(dong).toHaveClass('ngoai');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[tabindex], a, button')).toBeNull();
  });
});
