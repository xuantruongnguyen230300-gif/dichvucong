import { afterEach, describe, expect, it, vi } from 'vitest';
import { caiGiaoCat, type BoDieuKhienGiaoCat } from './giaLapGiaoCat';

let dieuKhien: BoDieuKhienGiaoCat | undefined;
afterEach(() => {
  dieuKhien?.go();
  dieuKhien = undefined;
});

const taoPhanTu = () => document.createElement('div');

describe('caiGiaoCat', () => {
  it('mặc định jsdom không có IntersectionObserver; cài xong có, go() trả lại như cũ', () => {
    expect('IntersectionObserver' in globalThis).toBe(false);
    dieuKhien = caiGiaoCat();
    expect('IntersectionObserver' in globalThis).toBe(true);
    dieuKhien.go();
    expect('IntersectionObserver' in globalThis).toBe(false);
  });

  it('go() khôi phục bản đã có trước đó', () => {
    const goc = class {} as unknown as typeof IntersectionObserver;
    vi.stubGlobal('IntersectionObserver', goc);
    const d = caiGiaoCat();
    expect(globalThis.IntersectionObserver).not.toBe(goc);
    d.go();
    expect(globalThis.IntersectionObserver).toBe(goc);
    vi.unstubAllGlobals();
  });

  it('hienRa chỉ gọi callback cho phần tử đang được quan sát, đúng dạng entry', () => {
    dieuKhien = caiGiaoCat();
    const callback = vi.fn();
    const a = taoPhanTu();
    const b = taoPhanTu();
    const o = new IntersectionObserver(callback, { rootMargin: '0px', threshold: 0 });
    o.observe(a);

    dieuKhien.hienRa(b); // b không được quan sát
    expect(callback).not.toHaveBeenCalled();

    dieuKhien.hienRa(a);
    expect(callback).toHaveBeenCalledOnce();
    const [entries, nguoiQuanSat] = callback.mock.calls[0] as [IntersectionObserverEntry[], IntersectionObserver];
    expect(entries).toHaveLength(1);
    expect(entries[0]?.target).toBe(a);
    expect(entries[0]?.isIntersecting).toBe(true);
    expect(nguoiQuanSat).toBe(o);
  });

  it('an báo isIntersecting false; unobserve rồi thì hienRa không gọi nữa', () => {
    dieuKhien = caiGiaoCat();
    const callback = vi.fn();
    const a = taoPhanTu();
    const o = new IntersectionObserver(callback);
    o.observe(a);
    dieuKhien.an(a);
    expect((callback.mock.calls[0] as [IntersectionObserverEntry[]])[0][0]?.isIntersecting).toBe(false);

    o.unobserve(a);
    dieuKhien.hienRa(a);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('hienRaHet báo mọi phần tử đang quan sát; dangQuanSat phản ánh observe/unobserve/disconnect', () => {
    dieuKhien = caiGiaoCat();
    const callback = vi.fn();
    const [a, b, c] = [taoPhanTu(), taoPhanTu(), taoPhanTu()];
    const o = new IntersectionObserver(callback);
    o.observe(a);
    o.observe(b);
    o.observe(c);
    o.unobserve(c);
    expect(dieuKhien.dangQuanSat()).toEqual([a, b]);

    dieuKhien.hienRaHet();
    expect(callback).toHaveBeenCalledTimes(2);

    o.disconnect();
    expect(dieuKhien.dangQuanSat()).toEqual([]);
  });

  it('callback tự unobserve trong lúc được báo vẫn chạy đúng', () => {
    dieuKhien = caiGiaoCat();
    const a = taoPhanTu();
    const o = new IntersectionObserver((ds, ob) => ds.forEach((m) => ob.unobserve(m.target)));
    o.observe(a);
    dieuKhien.hienRaHet();
    expect(dieuKhien.dangQuanSat()).toEqual([]);
    expect(dieuKhien.soLan.unobserve).toBe(1);
  });

  it('ghi lại options và số lần observe/unobserve/disconnect', () => {
    dieuKhien = caiGiaoCat();
    new IntersectionObserver(vi.fn(), { rootMargin: '0px', threshold: 0 });
    const o2 = new IntersectionObserver(vi.fn());
    expect(dieuKhien.options).toEqual([{ rootMargin: '0px', threshold: 0 }, {}]);

    const a = taoPhanTu();
    o2.observe(a);
    o2.observe(a);
    o2.unobserve(a);
    o2.disconnect();
    expect(dieuKhien.soLan).toEqual({ observe: 2, unobserve: 1, disconnect: 1 });
  });
});
