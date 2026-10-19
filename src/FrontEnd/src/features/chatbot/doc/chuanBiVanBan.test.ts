import { describe, expect, it } from 'vitest';
import { chuanBiVanBanDoc, type VietTatDoc } from './chuanBiVanBan';

// Bảng viết tắt của dữ liệu mẫu (12 dòng, F07 plan §2) — phần dùng trong test.
const bang: readonly VietTatDoc[] = [
  { chuVietTat: 'TTHC', dayDu: 'thủ tục hành chính' },
  { chuVietTat: 'QĐ-UBND', dayDu: 'quyết định Ủy ban nhân dân' },
  { chuVietTat: 'NĐ-CP', dayDu: 'nghị định Chính phủ' },
  { chuVietTat: 'UBND', dayDu: 'Ủy ban nhân dân' },
  { chuVietTat: 'QSDĐ', dayDu: 'quyền sử dụng đất' },
  { chuVietTat: 'CCCD', dayDu: 'căn cước công dân' },
  { chuVietTat: 'đk', dayDu: 'đăng ký' },
];

// Tránh gõ ký tự vô hình trực tiếp trong nguồn.
const kyTu = (ma: number) => String.fromCodePoint(ma);

const doc = (vanBan: string, b: readonly VietTatDoc[] = bang) => chuanBiVanBanDoc(vanBan, b).join(' ');

describe('chuanBiVanBanDoc — ví dụ của plan', () => {
  it('thay viết tắt, đơn vị và dấu chấm giữa số', () => {
    expect(chuanBiVanBanDoc('Theo QĐ-UBND, TTHC này mất 3 ngày, diện tích 30m2, mã 1.001193.', bang)).toEqual([
      'Theo quyết định Ủy ban nhân dân, thủ tục hành chính này mất 3 ngày, diện tích 30 mét vuông, mã 1001193.',
    ]);
  });
});

describe('chuanBiVanBanDoc — viết tắt', () => {
  it('khoá dài thắng khoá ngắn: QĐ-UBND trước UBND', () => {
    expect(doc('Xem QĐ-UBND và UBND xã')).toBe('Xem quyết định Ủy ban nhân dân và Ủy ban nhân dân xã');
  });

  it('không phân biệt hoa thường, phân biệt dấu', () => {
    expect(doc('tthc và ĐK và đk và dk')).toBe('thủ tục hành chính và đăng ký và đăng ký và dk');
  });

  it('có biên: TTHCX và ATTHC không bị thay', () => {
    expect(doc('TTHCX ATTHC TTHC')).toBe('TTHCX ATTHC thủ tục hành chính');
  });

  it('hai viết tắt liền nhau cách một dấu cách đều được thay', () => {
    expect(doc('CCCD QSDĐ')).toBe('căn cước công dân quyền sử dụng đất');
  });

  it('khoá có ký tự đặc biệt không làm hỏng biểu thức', () => {
    const b: VietTatDoc[] = [
      { chuVietTat: 'C++', dayDu: 'xê cộng cộng' },
      { chuVietTat: 'a.b', dayDu: 'a chấm b' },
      { chuVietTat: '(x)', dayDu: 'ích' },
      { chuVietTat: 'NĐ-CP', dayDu: 'nghị định Chính phủ' },
      { chuVietTat: '[y]', dayDu: 'ngoặc y' },
      { chuVietTat: 'a|b', dayDu: 'a hoặc b' },
    ];
    expect(doc('Dùng C++ và NĐ-CP, a.b, axb, [y] và a|b', b)).toBe('Dùng xê cộng cộng và nghị định Chính phủ, a chấm b, axb, ngoặc y và a hoặc b');
  });

  it('dayDu chứa ký tự $ không bị hiểu là mẫu thay', () => {
    expect(doc('Phí TTHC', [{ chuVietTat: 'TTHC', dayDu: 'giá $& và $1' }])).toBe('Phí giá $& và $1');
  });

  it('khoá rỗng hoặc dài hơn 50 ký tự bị bỏ', () => {
    const dai = 'x'.repeat(51);
    const b: VietTatDoc[] = [
      { chuVietTat: '', dayDu: 'rỗng' },
      { chuVietTat: '   ', dayDu: 'trắng' },
      { chuVietTat: dai, dayDu: 'dài' },
      { chuVietTat: 'ok', dayDu: 'được' },
    ];
    expect(doc(`ok ${dai}`, b)).toBe(`được ${dai}`);
  });

  it('bảng quá 200 dòng bị bỏ cả bảng; bảng rỗng chỉ qua các bước khác', () => {
    const lon: VietTatDoc[] = Array.from({ length: 201 }, (_v, i) => ({ chuVietTat: `k${i}`, dayDu: `d${i}` }));
    expect(doc('k1 và TTHC', [...lon, { chuVietTat: 'TTHC', dayDu: 'bị bỏ' }])).toBe('k1 và TTHC');
    expect(doc('TTHC 2.000 m', [])).toBe('TTHC 2000 mét');
  });

  it('phần tử sai kiểu trong bảng không làm hỏng', () => {
    const hong = [{ chuVietTat: 5, dayDu: 'x' }, { chuVietTat: 'TTHC' }, null] as unknown as VietTatDoc[];
    expect(() => doc('TTHC', hong.filter((d) => d !== null))).not.toThrow();
  });
});

describe('chuanBiVanBanDoc — số và đơn vị', () => {
  it.each([
    ['mã 1.001193', 'mã 1001193'],
    ['phí 2.000.000 đồng', 'phí 2000000 đồng'],
    ['hệ số 0,5', 'hệ số 0,5'],
    ['xong. Mới', 'xong. Mới'],
  ])('dấu chấm giữa số: %j', (vao, ra) => {
    expect(doc(vao)).toBe(ra);
  });

  it.each([
    ['15km', '15 ki lô mét'],
    ['15 km', '15 ki lô mét'],
    ['30m2', '30 mét vuông'],
    ['30 m2', '30 mét vuông'],
    ['30m\u00B2', '30 mét vuông'],
    ['3m', '3 mét'],
    ['5cm', '5 xen ti mét'],
    ['4mm', '4 mi li mét'],
    ['1.000 m\u00B2', '1000 mét vuông'],
    ['rộng 5m, sâu 15m.', 'rộng 5 mét, sâu 15 mét.'],
  ])('đơn vị sau số: %j → %j', (vao, ra) => {
    expect(doc(vao)).toBe(ra);
  });

  it('dài trước ngắn: không ra "métét" và km không thành "ki lô métét"', () => {
    expect(doc('2km 3m 4m2')).toBe('2 ki lô mét 3 mét 4 mét vuông');
  });

  it('đơn vị không đứng sau chữ số thì không đổi; không đứng trước chữ cái', () => {
    expect(doc('am km cm mm m')).toBe('am km cm mm m');
    expect(doc('5 mét và 5 mm2x và 3 mới')).toBe('5 mét và 5 mm2x và 3 mới');
  });

  it('"tháng 3 m" không mất chữ số hay chữ', () => {
    expect(doc('tháng 3 m')).toBe('tháng 3 mét');
    expect(doc('tháng 3 mười')).toBe('tháng 3 mười');
  });
});

describe('chuanBiVanBanDoc — dọn ký tự', () => {
  it('bỏ emoji và ký tự vô hình (tạo bằng mã)', () => {
    const vo = kyTu(0x200e) + kyTu(0x200b) + kyTu(0xfeff);
    expect(doc(`Xin${vo} chào ${kyTu(0x1f600)} bạn ${kyTu(0x2705)}`)).toBe('Xin chào bạn');
  });

  it('bỏ dấu ngoặc kép thẳng và cong', () => {
    expect(doc('Chọn "Gửi" và “Đồng ý” rồi «xong»')).toBe('Chọn Gửi và Đồng ý rồi xong');
  });

  it('bỏ **đậm**, mã, tiêu đề # và gạch đầu dòng', () => {
    expect(doc('**Lưu ý** dùng `mã`')).toBe('Lưu ý dùng mã');
    expect(doc('# Tiêu đề\n- Một\n\u2022 Hai\n* Ba')).toBe('Tiêu đề. Một. Hai. Ba');
  });

  it('chữ có dấu giữ nguyên và chuẩn hoá NFC', () => {
    const nfd = 'Đăng ký khai sinh'.normalize('NFD');
    expect(doc(nfd)).toBe('Đăng ký khai sinh');
    expect(doc(nfd)).toBe(doc('Đăng ký khai sinh'));
  });

  it('chuỗi chỉ có khoảng trắng hoặc emoji thì rỗng', () => {
    expect(chuanBiVanBanDoc('   \n \t ', bang)).toEqual([]);
    expect(chuanBiVanBanDoc(kyTu(0x1f600) + ' ' + kyTu(0x2705), bang)).toEqual([]);
    expect(chuanBiVanBanDoc('', bang)).toEqual([]);
  });
});

describe('chuanBiVanBanDoc — xuống dòng và tách câu', () => {
  it('xuống dòng thành dấu chấm khi dòng trước chưa có dấu kết', () => {
    expect(chuanBiVanBanDoc('Giấy tờ cần có\nTờ khai\nCăn cước:\nBản sao?', bang)).toEqual(['Giấy tờ cần có.', 'Tờ khai.', 'Căn cước: Bản sao?']);
  });

  it('dòng trống và dòng toàn khoảng trắng bị bỏ', () => {
    expect(chuanBiVanBanDoc('A\n\n   \nB', bang)).toEqual(['A.', 'B']);
  });

  it('tách sau dấu . ! ? … kèm khoảng trắng', () => {
    expect(chuanBiVanBanDoc('Một. Hai! Ba? Bốn\u2026 Năm', bang)).toEqual(['Một.', 'Hai!', 'Ba?', 'Bốn\u2026', 'Năm']);
  });

  it('câu dài 400 ký tự bị cắt, mỗi phần tối đa 180 ký tự và không mất chữ', () => {
    const cau = Array.from({ length: 100 }, (_v, i) => `từ${i}`).join(' ');
    const phan = chuanBiVanBanDoc(cau, bang);
    expect(cau.length).toBeGreaterThan(400);
    expect(phan.length).toBeGreaterThanOrEqual(3);
    expect(phan.every((p) => p.length <= 180 && p.length > 0)).toBe(true);
    expect(phan.join(' ')).toBe(cau);
  });

  it('ưu tiên cắt tại dấu phẩy nằm trong khoảng cuối', () => {
    const dau = 'a'.repeat(150);
    const cau = `${dau}, ${'b'.repeat(100)}`;
    expect(chuanBiVanBanDoc(cau, bang)).toEqual([`${dau},`, 'b'.repeat(100)]);
  });

  it('không có dấu cách hay phẩy nào thì cắt cứng ở 180', () => {
    const phan = chuanBiVanBanDoc('x'.repeat(400), bang);
    expect(phan.map((p) => p.length)).toEqual([180, 180, 40]);
  });

  it('văn bản có chữ thì luôn có ít nhất một phần tử', () => {
    expect(chuanBiVanBanDoc('a', bang)).toEqual(['a']);
  });
});

describe('chuanBiVanBanDoc — không sửa chuỗi gốc', () => {
  it('trả chuỗi mới, chuỗi vào và bảng không đổi', () => {
    const vao = 'Theo QĐ-UBND, **TTHC** 1.001193 30m2\n- đk';
    const truoc = vao;
    const bangTruoc = JSON.stringify(bang);

    chuanBiVanBanDoc(vao, bang);

    expect(vao).toBe(truoc);
    expect(JSON.stringify(bang)).toBe(bangTruoc);
  });

  it('gọi hai lần cho cùng kết quả (không dính trạng thái của biểu thức có cờ g)', () => {
    const vao = 'TTHC 30m2 và 1.000 km, QĐ-UBND\nđk';

    expect(chuanBiVanBanDoc(vao, bang)).toEqual(chuanBiVanBanDoc(vao, bang));
  });
});
