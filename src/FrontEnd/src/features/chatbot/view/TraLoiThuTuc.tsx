import { useTranslation } from 'react-i18next';
import type { CauTraLoi } from '../api/troLy';
import { CapNutThuTuc } from './CapNutThuTuc';
import { catChu, coChu } from './chu';
import { DanhSachThuTuc } from './DanhSachThuTuc';
import { NoiNop } from './NoiNop';
import styles from './view.module.css';

type DapAnThuTuc = Extract<CauTraLoi, { loai: 'thu-tuc' }>;

/** Số ký tự tối đa của dòng đầu "[mã] tên thủ tục". */
const DO_DAI_TEN_TOI_DA = 90;

/** Câu trả lời về một mục của thủ tục (BR-1 bước 3): đúng một trong 7 mục, cuối cùng là cặp nút của thủ tục. */
export function TraLoiThuTuc({ cau }: { cau: DapAnThuTuc }) {
  const { t } = useTranslation('chatbot');
  return (
    <>
      <p className={styles.doan}>
        <strong>{t('thu-tuc.dong-dau', { ma: cau.thuTuc.ma, ten: catChu(cau.thuTuc.ten, DO_DAI_TEN_TOI_DA) })}</strong>
      </p>
      <NoiDungMuc cau={cau} />
      <CapNutThuTuc ma={cau.thuTuc.ma} ten={cau.thuTuc.ten} />
      {cau.thuTucKhac.length > 0 && (
        <>
          <p className={styles.doan}>{t('thu-tuc.khac')}</p>
          <DanhSachThuTuc cacThuTuc={cau.thuTucKhac} />
        </>
      )}
    </>
  );
}

function NoiDungMuc({ cau }: { cau: DapAnThuTuc }) {
  const { t } = useTranslation('chatbot');
  const nd = cau.noiDung;
  const catBot = (soHienThi: number) =>
    nd.tong !== null && nd.tong > soHienThi ? (
      <p className={styles.phu}>{t('thu-tuc.cat-bot', { so: soHienThi, tong: nd.tong })}</p>
    ) : null;

  switch (cau.muc) {
    case 'thoi-han':
      return (
        <p className={styles.doan}>
          {coChu(nd.thoiHan) ? t('thu-tuc.thoi-han', { thoiHan: nd.thoiHan }) : t('thu-tuc.thoi-han-chua-ro')}
        </p>
      );
    case 'phi':
      return <p className={styles.doan}>{coChu(nd.phi) ? t('thu-tuc.phi', { phi: nd.phi }) : t('thu-tuc.chua-co.phi')}</p>;
    case 'ho-so': {
      const cacGiayTo = nd.thanhPhanHoSo ?? [];
      if (cacGiayTo.length === 0) return <p className={styles.doan}>{t('thu-tuc.chua-co.ho-so')}</p>;
      const con = nd.tong !== null ? nd.tong - cacGiayTo.length : 0;
      return (
        <>
          <ol className={styles.danhSach}>
            {cacGiayTo.map((g, i) => {
              const ban = [
                (g.banChinh ?? 0) > 0 && t('thu-tuc.so-ban-chinh', { so: g.banChinh }),
                (g.banSao ?? 0) > 0 && t('thu-tuc.so-ban-sao', { so: g.banSao }),
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <li key={i}>
                  {g.ten}
                  {ban && <span className={styles.phu}> ({ban})</span>}
                </li>
              );
            })}
          </ol>
          {con > 0 && <p className={styles.phu}>{t('thu-tuc.con-giay-to', { so: con })}</p>}
        </>
      );
    }
    case 'noi-nop': {
      const hinhThuc = (nd.hinhThucNop ?? []).filter(coChu);
      return (
        <>
          <p className={styles.doan}>
            {hinhThuc.length > 0 ? t('thu-tuc.hinh-thuc-nop', { hinhThuc: hinhThuc.join(', ') }) : t('thu-tuc.chua-co.noi-nop')}
          </p>
          <NoiNop quay={cau.quay} noiTiepNhanChuyen={cau.noiTiepNhanChuyen} trungTam={cau.trungTam} />
        </>
      );
    }
    case 'trinh-tu': {
      const cacBuoc = (nd.trinhTu ?? []).filter((b) => coChu(b.noiDung) || coChu(b.truongHop));
      if (cacBuoc.length === 0) return <p className={styles.doan}>{t('thu-tuc.chua-co.trinh-tu')}</p>;
      return (
        <>
          <ol className={styles.danhSach}>
            {cacBuoc.map((b, i) => (
              <li key={i}>
                {coChu(b.truongHop) && <strong>{b.truongHop}</strong>}
                {coChu(b.noiDung) && <span className={styles.chuDai}>{b.noiDung}</span>}
              </li>
            ))}
          </ol>
          {catBot(cacBuoc.length)}
        </>
      );
    }
    case 'ket-qua': {
      const cacKetQua = (nd.ketQua ?? []).filter(coChu);
      if (cacKetQua.length === 0) return <p className={styles.doan}>{t('thu-tuc.chua-co.ket-qua')}</p>;
      return (
        <>
          <ul className={styles.danhSach}>
            {cacKetQua.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
          {catBot(cacKetQua.length)}
        </>
      );
    }
    case 'can-cu': {
      const cacCanCu = (nd.canCu ?? []).filter((c) => coChu(c.soKyHieu) || coChu(c.trichYeu));
      if (cacCanCu.length === 0) return <p className={styles.doan}>{t('thu-tuc.chua-co.can-cu')}</p>;
      return (
        <>
          <ul className={styles.danhSach}>
            {cacCanCu.map((c, i) => (
              <li key={i}>
                {coChu(c.soKyHieu) && coChu(c.trichYeu)
                  ? t('thu-tuc.can-cu-noi', { soKyHieu: c.soKyHieu, trichYeu: c.trichYeu })
                  : (c.soKyHieu ?? c.trichYeu)}
              </li>
            ))}
          </ul>
          {catBot(cacCanCu.length)}
        </>
      );
    }
  }
}
