import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { napNgonNguXemTruoc } from './i18n';
import { SO_MUC_TIM_KIEM, taoDanhSach1000 } from './duLieuMau';
import { KhoiTim1000 } from './KhoiTim1000';
import { ghepChuoiTimKiem, taoBoLocTuKhoa } from '../../core/utils/timKiem';

beforeAll(async () => {
  await napNgonNguXemTruoc();
});

describe('taoDanhSach1000', () => {
  it('sinh đủ 1.000 tên khác nhau, có ký tự vô hình ghép bằng mã', () => {
    const ten = taoDanhSach1000();
    expect(ten).toHaveLength(SO_MUC_TIM_KIEM);
    expect(new Set(ten).size).toBe(SO_MUC_TIM_KIEM);
    expect(ten.some((t) => t.includes(String.fromCodePoint(0x200e)))).toBe(true);
    expect(ten.some((t) => t.includes(String.fromCodePoint(0x200b)))).toBe(true);
  });

  it('"dang ky" khớp đúng 100 mục kể cả mục có ký tự vô hình', () => {
    const khop = taoBoLocTuKhoa('dang ky');
    const so = taoDanhSach1000().filter((t) => khop(ghepChuoiTimKiem(t))).length;
    expect(so).toBe(100);
  });
});

describe('KhoiTim1000', () => {
  it('hiện số mục khớp khi gõ, và đủ 1.000 khi chưa gõ', async () => {
    const user = userEvent.setup();
    render(<KhoiTim1000 />);
    const ketQua = screen.getByTestId('so-ket-qua-tim-1000');
    expect(ketQua).toHaveAttribute('data-so', '1000');

    await user.type(screen.getByRole('searchbox'), 'dang ky');
    await waitFor(() => expect(ketQua).toHaveAttribute('data-so', '100'));

    await user.type(screen.getByRole('searchbox'), ' khai sinh');
    await waitFor(() => expect(ketQua).toHaveAttribute('data-so', '4'));
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});
