import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiemGhepDoc } from './diemGhepDoc';
import {
  chonGiong,
  daMoKhoaDoc,
  dungDoc,
  hoTroDoc,
  moKhoaDoc,
  ngheGiongDoi,
  ngheKhongDuocPhep,
} from './doc/giongDoc';
import { docCoBat, ghiCoBat } from './doc/luuLuaChon';
import { napPhanDoc } from './doc/napPhanDoc';

/** Chrome Android đôi khi không bắn `voiceschanged`: kiểm lại danh sách giọng một lần sau từng này. */
const KIEM_LAI_GIONG_MS = 1000;

export interface DoCauTraLoi {
  /** Có nút để hiện: trình duyệt hỗ trợ và máy có giọng tiếng Việt chạy trên máy (BR-2). */
  coNut: boolean;
  dangBat: boolean;
  chuyen: () => void;
}

const boQuaLoi = () => undefined;

/**
 * Đọc câu trả lời (F07 plan §4.3). Không bao giờ tự đọc khi chưa người dùng bật; không đọc câu đã có trên màn hình lúc bật;
 * không đọc đáp án đến lúc khung đóng. Nội dung cần đọc chỉ ở bộ nhớ, không ghi storage (chỉ cờ `doc-bat`).
 */
export function useDoCauTraLoi(): DoCauTraLoi {
  const { cauTraLoiMoi, khungDangMo } = useDiemGhepDoc();
  const [bat, datBat] = useState(docCoBat);
  const [biChan, datBiChan] = useState(false); // `not-allowed`: tắt trong phiên, không đổi cờ đã lưu
  const [coGiong, datCoGiong] = useState(() => chonGiong() !== null);
  const dangBat = bat && !biChan;
  const coNut = hoTroDoc() && coGiong;

  const id = cauTraLoiMoi?.id;
  const vanBan = cauTraLoiMoi?.vanBan;
  const idDaXem = useRef(id);

  // Giọng nạp bất đồng bộ: nút hiện khi giọng xuất hiện
  useEffect(() => {
    if (!hoTroDoc()) return;
    const capNhat = () => datCoGiong(chonGiong() !== null);
    const goNghe = ngheGiongDoi(capNhat);
    const hen = window.setTimeout(capNhat, KIEM_LAI_GIONG_MS);
    return () => {
      goNghe();
      window.clearTimeout(hen);
    };
  }, []);

  // Rời trang, gỡ khung (F09 "Bắt đầu lại" đổi key): dừng. Không dừng khi mở popup hay đổi trang trong ứng dụng.
  useEffect(() => {
    if (!hoTroDoc()) return;
    window.addEventListener('pagehide', dungDoc);
    const goKhongDuocPhep = ngheKhongDuocPhep(() => datBiChan(true));
    return () => {
      window.removeEventListener('pagehide', dungDoc);
      goKhongDuocPhep();
      dungDoc();
    };
  }, []);

  // Đóng khung: dừng ngay. Mở lại không đọc tiếp (idDaXem đã bằng id cũ).
  useEffect(() => {
    if (!khungDangMo) dungDoc();
  }, [khungDangMo]);

  // Đáp án mới: dừng câu đang đọc, rồi đọc nếu đang bật. `idDaXem` chặn đọc lại khi chỉ đổi cờ hay đóng/mở khung.
  useEffect(() => {
    if (id === undefined || id === idDaXem.current) return;
    idDaXem.current = id;
    const phien = dungDoc();
    if (!dangBat || !khungDangMo || !coNut || vanBan === undefined) return;
    napPhanDoc()
      .then((m) => m.docMoi(vanBan, phien))
      .catch(boQuaLoi);
  }, [id, vanBan, dangBat, khungDangMo, coNut]);

  // Safari iOS: cờ đã bật từ lần trước thì mở khoá ở thao tác đầu tiên của trang
  useEffect(() => {
    if (!dangBat || !coNut || daMoKhoaDoc()) return;
    const sua = () => {
      moKhoaDoc();
      goNghe();
    };
    const goNghe = () => {
      document.removeEventListener('pointerdown', sua, true);
      document.removeEventListener('keydown', sua, true);
    };
    document.addEventListener('pointerdown', sua, true);
    document.addEventListener('keydown', sua, true);
    return goNghe;
  }, [dangBat, coNut]);

  const chuyen = useCallback(() => {
    if (dangBat) {
      ghiCoBat(false);
      datBat(false);
      datBiChan(false);
      dungDoc();
      return;
    }
    ghiCoBat(true);
    datBat(true);
    datBiChan(false);
    moKhoaDoc(); // đang trong thao tác của người dùng
    // Nạp trước phần đọc và bảng viết tắt: câu trả lời đầu không phải chờ
    napPhanDoc()
      .then((m) => m.nap())
      .catch(boQuaLoi);
  }, [dangBat]);

  return { coNut, dangBat, chuyen };
}
