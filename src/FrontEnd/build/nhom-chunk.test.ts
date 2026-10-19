import { describe, expect, it } from 'vitest';
import { lopBangGrid, lopLoiVendor, lopQr } from './nhom-chunk.ts';

describe('lopQr (nhóm chunk qr, F05)', () => {
  it.each([
    'D:/Manager/dichvucong/src/FrontEnd/node_modules/uqr/dist/index.mjs',
    'D:\\Manager\\dichvucong\\src\\FrontEnd\\node_modules\\uqr\\dist\\index.mjs',
    '/app/node_modules/uqr/dist/index.mjs',
  ])('khớp %s', (duongDan) => {
    expect(lopQr.test(duongDan)).toBe(true);
  });

  it.each([
    'D:/Manager/dichvucong/src/FrontEnd/node_modules/react/index.js',
    'D:/Manager/dichvucong/src/FrontEnd/node_modules/react-dom/client.js',
    'D:/Manager/dichvucong/src/FrontEnd/src/features/linh-vuc/QrLinhVuc.tsx',
    'D:/Manager/dichvucong/src/FrontEnd/src/features/uqr/x.ts',
    'D:/Manager/dichvucong/src/FrontEnd/node_modules/uqr-khac/dist/index.mjs',
    'D:/Manager/dichvucong/src/FrontEnd/node_modules/xuqr/dist/index.mjs',
  ])('không khớp %s', (duongDan) => {
    expect(lopQr.test(duongDan)).toBe(false);
  });

  it('uqr không lọt vào vendor hay grid', () => {
    const uqr = 'D:/x/node_modules/uqr/dist/index.mjs';
    expect(lopLoiVendor.test(uqr)).toBe(false);
    expect(lopBangGrid.test(uqr)).toBe(false);
  });
});

describe('lopLoiVendor, lopBangGrid (giữ nguyên hành vi)', () => {
  it('react, router, query vào vendor; TanStack Table thì không', () => {
    expect(lopLoiVendor.test('D:/x/node_modules/react/index.js')).toBe(true);
    expect(lopLoiVendor.test('D:/x/node_modules/react-router/dist/index.mjs')).toBe(true);
    expect(lopLoiVendor.test('D:/x/node_modules/@tanstack/react-query/build/index.js')).toBe(true);
    expect(lopLoiVendor.test('D:/x/node_modules/@tanstack/react-table/build/index.js')).toBe(false);
  });
  it('TanStack Table vào grid', () => {
    expect(lopBangGrid.test('D:\\x\\node_modules\\@tanstack\\table-core\\build\\index.js')).toBe(true);
    expect(lopBangGrid.test('D:/x/node_modules/@tanstack/react-query/build/index.js')).toBe(false);
  });
});
