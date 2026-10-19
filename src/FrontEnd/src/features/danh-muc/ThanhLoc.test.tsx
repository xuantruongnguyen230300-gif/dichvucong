import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { DANH_MUC_MAU } from '../../test-utils/danhMucMau';
import { napNgonNguDanhMuc } from './i18n';
import { luaChonLinhVuc } from './loc';
import { ThanhLoc, type ThanhLocProps } from './ThanhLoc';

beforeAll(napNgonNguDanhMuc);

function dung(rieng: Partial<ThanhLocProps> = {}) {
  const props: ThanhLocProps = {
    cap: 'xa',
    tuKhoa: '',
    onDoiTuKhoa: vi.fn(),
    linhVuc: luaChonLinhVuc(DANH_MUC_MAU.linhVuc, 'xa', ''),
    linhVucMa: '',
    onDoiLinhVuc: vi.fn(),
    mucDo: '',
    onDoiMucDo: vi.fn(),
    onXoaBoLoc: vi.fn(),
    cachXem: 'bang',
    onDoiCachXem: vi.fn(),
    ...rieng,
  };
  render(<ThanhLoc {...props} />);
  return props;
}

const nhanCacMuc = (ten: string) =>
  Array.from(screen.getByRole('combobox', { name: ten }).querySelectorAll('option')).map((op) => op.textContent);

describe('ThanhLoc', () => {
  it('có ô tìm, hai ô chọn, nút "Xoá bộ lọc" và chọn dạng thẻ/bảng', () => {
    dung();
    expect(screen.getByRole('searchbox', { name: 'Tìm theo tên, mã thủ tục hoặc lĩnh vực' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lĩnh vực' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Mức độ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xoá bộ lọc' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Cách hiển thị' })).toBeInTheDocument();
  });

  it('AC-3: "Xoá bộ lọc" có mặt khi chưa lọc gì và gọi hàm truyền vào', async () => {
    const props = dung();
    await userEvent.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));
    expect(props.onXoaBoLoc).toHaveBeenCalledTimes(1);
  });

  it('ô lĩnh vực: "Tất cả lĩnh vực" rồi "Tên (n)" theo cấp xã', () => {
    dung();
    expect(nhanCacMuc('Lĩnh vực')).toEqual(['Tất cả lĩnh vực', 'Đất đai (1)', 'Hộ tịch (3)']);
  });

  it('cấp tỉnh: số đếm theo cấp tỉnh', () => {
    dung({ cap: 'tinh', linhVuc: luaChonLinhVuc(DANH_MUC_MAU.linhVuc, 'tinh', '') });
    expect(nhanCacMuc('Lĩnh vực')).toEqual(['Tất cả lĩnh vực', 'Đất đai (2)', 'Hộ tịch (1)', 'Thuỷ lợi (1)']);
  });

  it('lĩnh vực đang chọn có 0 thủ tục ở cấp này vẫn hiện với "(0)" và đang được chọn', () => {
    dung({ linhVucMa: 'thuy-loi', linhVuc: luaChonLinhVuc(DANH_MUC_MAU.linhVuc, 'xa', 'thuy-loi') });
    expect(screen.getByRole('combobox', { name: 'Lĩnh vực' })).toHaveValue('thuy-loi');
    expect(screen.getByRole('option', { name: 'Thuỷ lợi (0)' })).toBeInTheDocument();
  });

  it('ô mức độ: Tất cả mức độ, Toàn trình, Một phần', () => {
    dung();
    expect(nhanCacMuc('Mức độ')).toEqual(['Tất cả mức độ', 'Toàn trình', 'Một phần']);
  });

  it('đổi lĩnh vực, mức độ, từ khoá, cách xem gọi đúng hàm với đúng giá trị', async () => {
    const props = dung();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Lĩnh vực' }), 'ho-tich');
    expect(props.onDoiLinhVuc).toHaveBeenCalledWith('ho-tich');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Mức độ' }), 'mot-phan');
    expect(props.onDoiMucDo).toHaveBeenCalledWith('mot-phan');
    await userEvent.type(screen.getByRole('searchbox'), 'k');
    expect(props.onDoiTuKhoa).toHaveBeenCalledWith('k');
    await userEvent.click(screen.getByRole('button', { name: 'Dạng thẻ' }));
    expect(props.onDoiCachXem).toHaveBeenCalledWith('the');
  });

  it('chọn lại "Tất cả mức độ" → mức độ rỗng', async () => {
    const props = dung({ mucDo: 'toan-trinh' });
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Mức độ' }), '');
    expect(props.onDoiMucDo).toHaveBeenCalledWith('');
  });

  it('hiện giá trị đang lọc truyền vào', () => {
    dung({ tuKhoa: 'khai sinh', linhVucMa: 'ho-tich', mucDo: 'toan-trinh' });
    expect(screen.getByRole('searchbox')).toHaveValue('khai sinh');
    expect(screen.getByRole('combobox', { name: 'Lĩnh vực' })).toHaveValue('ho-tich');
    expect(screen.getByRole('combobox', { name: 'Mức độ' })).toHaveValue('toan-trinh');
  });

  it('ô tìm không tự báo số kết quả (dòng số kết quả của màn hình là vùng duy nhất)', async () => {
    dung();
    await userEvent.type(screen.getByRole('searchbox'), 'k');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
