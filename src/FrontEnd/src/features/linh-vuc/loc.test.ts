import { describe, expect, it } from 'vitest';
import { taoLinhVuc } from '../../test-utils/danhMucMau';
import { locLinhVuc } from './loc';

const DS = [
  taoLinhVuc('chung-thuc', 'Chứng thực', 4, 0),
  taoLinhVuc('dat-dai', 'Đất đai', 10, 5),
  taoLinhVuc('dat-dai-kinh-doanh', 'Kinh doanh đất đai', 0, 2),
  taoLinhVuc('ho-tich', 'Hộ tịch', 20, 3),
];

const tenCua = (ds: readonly { ten: string }[]) => ds.map((l) => l.ten);

describe('locLinhVuc (BR-3)', () => {
  it('AC-1: "dat dai" (không dấu) ra Đất đai', () => {
    expect(tenCua(locLinhVuc(DS, 'dat dai'))).toEqual(['Đất đai', 'Kinh doanh đất đai']);
  });

  it('nhiều từ, thứ tự bất kỳ', () => {
    expect(tenCua(locLinhVuc(DS, 'dai kinh'))).toEqual(['Kinh doanh đất đai']);
  });

  it('có dấu, hoa thường đều khớp', () => {
    expect(tenCua(locLinhVuc(DS, 'HỘ TỊCH'))).toEqual(['Hộ tịch']);
  });

  it('từ khoá rỗng hoặc toàn khoảng trắng → đủ danh sách', () => {
    expect(locLinhVuc(DS, '')).toHaveLength(4);
    expect(locLinhVuc(DS, '   ')).toHaveLength(4);
  });

  it('không khớp → rỗng', () => {
    expect(locLinhVuc(DS, 'xyzxyz')).toEqual([]);
  });

  it('giữ thứ tự đầu vào', () => {
    expect(locLinhVuc(DS, 'a').map((l) => l.ma)).toEqual(DS.filter((l) => l.tenTimKiem.includes('a')).map((l) => l.ma));
  });
});
