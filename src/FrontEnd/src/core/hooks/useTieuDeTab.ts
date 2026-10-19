import { useEffect } from 'react';

/**
 * Kho tiêu đề tab (F08 §4.7): `document.title` = tiêu đề tạm nếu có, không thì tiêu đề trang.
 * Hai giá trị giữ riêng, nên dữ liệu về trễ khi popup đang mở không ghi đè tên thủ tục.
 */
let tieuDeTrang: string | null = null;
let tieuDeTam: string | null = null;
let tieuDeNen: string | null = null; // tiêu đề có sẵn khi tiêu đề tạm bắt đầu mà trang chưa có tiêu đề

function ap(): void {
  const tieuDe = tieuDeTam ?? tieuDeTrang ?? tieuDeNen;
  if (tieuDe !== null && document.title !== tieuDe) document.title = tieuDe;
}

/** Tiêu đề của trang. `null` → không đổi `document.title` (giữ tiêu đề có sẵn trong HTML). */
export function useTieuDeTab(tieuDe: string | null): void {
  useEffect(() => {
    tieuDeTrang = tieuDe;
    ap();
    return () => {
      if (tieuDeTrang === tieuDe) tieuDeTrang = null;
    };
  }, [tieuDe]);
}

/** Tiêu đề tạm khi còn gắn (vd. tên thủ tục lúc popup mở). Gỡ → về tiêu đề trang. `null` → không làm gì. */
export function useTieuDeTabTam(tieuDe: string | null): void {
  useEffect(() => {
    if (tieuDe === null) return;
    if (tieuDeTam === null && tieuDeTrang === null) tieuDeNen = document.title;
    tieuDeTam = tieuDe;
    ap();
    return () => {
      if (tieuDeTam !== tieuDe) return;
      tieuDeTam = null;
      ap();
      if (tieuDeTrang === null) tieuDeNen = null;
    };
  }, [tieuDe]);
}
