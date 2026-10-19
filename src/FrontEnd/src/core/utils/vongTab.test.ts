import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { layVongTab, xuLyPhimTab } from './vongTab';

let khung: HTMLElement;

/** Dựng `<div id=khung>` chứa `html` và một nút ngoài khung (con trực tiếp của body, có data-ngoai-popup). */
function dung(html: string, ngoai = '<button data-ngoai-popup="">Bắt đầu lại</button>') {
  document.body.innerHTML = `<div id="khung" tabindex="-1">${html}</div>${ngoai}`;
  khung = document.getElementById('khung') as HTMLElement;
}

const ten = (ds: HTMLElement[]) => ds.map((e) => e.textContent || e.getAttribute('aria-label'));

function nhanTab(shift = false): KeyboardEvent {
  const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, cancelable: true, bubbles: true });
  xuLyPhimTab(e, khung);
  return e;
}

beforeEach(() => {
  document.body.innerHTML = '';
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('layVongTab', () => {
  it('phần tử trong khung theo thứ tự DOM, rồi phần tử [data-ngoai-popup]', () => {
    dung('<button>Một</button><a href="/x">Hai</a><input aria-label="Ba" />');
    expect(ten(layVongTab(khung))).toEqual(['Một', 'Hai', 'Ba', 'Bắt đầu lại']);
  });

  it('bỏ disabled, tabindex=-1, hidden, display:none, visibility:hidden và phần tử trong [inert]', () => {
    dung(`
      <button disabled>Tắt</button>
      <button tabindex="-1">Không Tab</button>
      <button hidden>Ẩn thuộc tính</button>
      <div style="display:none"><button>Ẩn cha</button></div>
      <button style="visibility:hidden">Ẩn thấy</button>
      <div inert><button>Inert</button></div>
      <input type="hidden" />
      <button>Còn lại</button>`);
    expect(ten(layVongTab(khung))).toEqual(['Còn lại', 'Bắt đầu lại']);
  });

  it('phần tử [tabindex="0"] và [contenteditable] được tính; a không href thì không', () => {
    dung('<div tabindex="0">Cuộn</div><a>Không href</a><div contenteditable="true">Sửa</div>');
    expect(ten(layVongTab(khung))).toEqual(['Cuộn', 'Sửa', 'Bắt đầu lại']);
  });

  it('[data-ngoai-popup] là vùng chứa: lấy các phần tử Tab được bên trong; nút ngoài bị ẩn hoặc inert thì bỏ', () => {
    dung('<button>Một</button>', '<div data-ngoai-popup=""><button>A</button><button disabled>B</button></div>');
    expect(ten(layVongTab(khung))).toEqual(['Một', 'A']);
    dung('<button>Một</button>', '<button data-ngoai-popup="" hidden>Ẩn</button>');
    expect(ten(layVongTab(khung))).toEqual(['Một']);
    dung('<button>Một</button>', '<div inert><button data-ngoai-popup="">Inert</button></div>');
    expect(ten(layVongTab(khung))).toEqual(['Một']);
  });

  it('khung rỗng: chỉ còn phần tử ngoài', () => {
    dung('<p>Chữ</p>');
    expect(ten(layVongTab(khung))).toEqual(['Bắt đầu lại']);
  });
});

describe('xuLyPhimTab', () => {
  it('Tab đi tiếp qua khung rồi nút ngoài rồi quay về đầu; chặn hành vi mặc định', () => {
    dung('<button>Một</button><button>Hai</button>');
    const [mot, hai] = khung.querySelectorAll('button');
    const ngoai = document.querySelector<HTMLElement>('[data-ngoai-popup]');
    mot?.focus();
    expect(nhanTab().defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(hai);
    nhanTab();
    expect(document.activeElement).toBe(ngoai);
    nhanTab();
    expect(document.activeElement).toBe(mot);
  });

  it('Shift+Tab từ đầu nhảy về cuối (nút ngoài), rồi lùi dần', () => {
    dung('<button>Một</button><button>Hai</button>');
    const [mot, hai] = khung.querySelectorAll('button');
    const ngoai = document.querySelector<HTMLElement>('[data-ngoai-popup]');
    mot?.focus();
    nhanTab(true);
    expect(document.activeElement).toBe(ngoai);
    nhanTab(true);
    expect(document.activeElement).toBe(hai);
  });

  it('con trỏ đang ở chính khung (ngoài vòng): Tab vào phần tử đầu, Shift+Tab vào phần tử cuối', () => {
    dung('<button>Một</button><button>Hai</button>');
    const [mot] = khung.querySelectorAll('button');
    const ngoai = document.querySelector<HTMLElement>('[data-ngoai-popup]');
    khung.focus();
    nhanTab();
    expect(document.activeElement).toBe(mot);
    khung.focus();
    nhanTab(true);
    expect(document.activeElement).toBe(ngoai);
  });

  it('vòng rỗng: giữ con trỏ ở khung', () => {
    dung('<p>Chữ</p>', '');
    nhanTab();
    expect(document.activeElement).toBe(khung);
  });

  it('phím khác Tab bị bỏ qua', () => {
    dung('<button>Một</button>');
    const e = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    xuLyPhimTab(e, khung);
    expect(e.defaultPrevented).toBe(false);
  });
});
