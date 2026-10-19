import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import { ExternalLink } from '../../core/components/ExternalLink';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { NhacDangXuat } from '../../core/kiosk/NhacDangXuat';
import type { ChiTietThuTuc as DuLieuChiTiet } from './api/chiTietThuTuc';
import styles from './ChiTietThuTuc.module.css';
import { linkDvc } from './linkDvc';
import { nhanMucDo } from './mucDo';

/** Có chữ thật (không null, không toàn khoảng trắng). */
function coChu(s: string | null | undefined): s is string {
  return s !== null && s !== undefined && s.trim() !== '';
}

/** Giấy tờ chỉ hiện số bản khi có ít nhất một số lớn hơn 0 (0/0 và chưa ghi coi như chưa ghi số bản). */
function coSoBan(banChinh: number | null, banSao: number | null): boolean {
  return (banChinh ?? 0) > 0 || (banSao ?? 0) > 0;
}

interface ChiTietProps {
  chiTiet: DuLieuChiTiet;
}

/** Nhãn lĩnh vực, mức độ và mã thủ tục phía trên tên thủ tục (`phanTrenTieuDe` của Modal). */
export function PhanTrenTieuDeChiTiet({ chiTiet }: ChiTietProps) {
  const { t } = useTranslation(['thu-tuc', 'common']);
  const nhan = nhanMucDo(t, chiTiet.mucDo);
  return (
    <div className={styles.nhan}>
      <Badge loai="info">{chiTiet.linhVuc}</Badge>
      {nhan !== null && <Badge loai={chiTiet.mucDo === 'toan-trinh' ? 'success' : 'warning'}>{nhan}</Badge>}
      <span className={styles.ma}>{t('chi-tiet.ma', { ma: chiTiet.ma })}</span>
    </div>
  );
}

/**
 * Chân popup: đúng MỘT liên kết ra Cổng DVC (F03 BR-4). Ở kiosk, đứng trước nút này có đúng một
 * dòng nhắc đăng xuất (F09 BR-4); chân popup `flex-wrap` nên ở màn hình hẹp dòng và nút tự xuống hàng.
 */
export function ChanPopupChiTiet({ ma }: { ma: string }) {
  const { t } = useTranslation(['thu-tuc', 'common']);
  return (
    <>
      <NhacDangXuat />
      <ExternalLink href={linkDvc(ma)} bienThe="nut-accent">
        {t('cong-dvc')}
      </ExternalLink>
    </>
  );
}

function Muc({ tieuDe, children }: { tieuDe: string; children: ReactNode }) {
  return (
    <section className={styles.muc}>
      <h3 className={styles.tieuMuc}>{tieuDe}</h3>
      {children}
    </section>
  );
}

/** Thân popup (F03 BR-3). Mục không có dữ liệu thì ẩn hẳn; chữ từ dữ liệu luôn là nút chữ của React. */
export function ChiTietThuTuc({ chiTiet }: ChiTietProps) {
  const { t } = useTranslation(['thu-tuc', 'common']);
  const khongCo = t('khong-co');

  const trinhTu = chiTiet.trinhTu.filter((b) => coChu(b.noiDung) || coChu(b.truongHop));
  const ketQua = chiTiet.ketQua.filter(coChu);
  const canCu = chiTiet.canCu.filter((c) => coChu(c.soKyHieu) || coChu(c.trichYeu));

  return (
    <div className={styles.than}>
      <Muc tieuDe={t('chi-tiet.muc.thong-tin-chung')}>
        <dl className={styles.dl}>
          {coChu(chiTiet.coQuanThucHien) && (
            <>
              <dt>{t('chi-tiet.nhan.co-quan')}</dt>
              <dd>{chiTiet.coQuanThucHien}</dd>
            </>
          )}
          <dt>{t('chi-tiet.nhan.thoi-han')}</dt>
          <dd>{coChu(chiTiet.thoiHan) ? chiTiet.thoiHan : t('chi-tiet.thoi-han-chua-ro')}</dd>
          {coChu(chiTiet.phi) && (
            <>
              <dt>{t('chi-tiet.nhan.phi')}</dt>
              <dd>{chiTiet.phi}</dd>
            </>
          )}
          {chiTiet.hinhThucNop.length > 0 && (
            <>
              <dt>{t('chi-tiet.nhan.cach-nop')}</dt>
              <dd>{chiTiet.hinhThucNop.join(', ')}</dd>
            </>
          )}
        </dl>
      </Muc>

      {coChu(chiTiet.yeuCauDieuKien) && (
        <Muc tieuDe={t('chi-tiet.muc.yeu-cau')}>
          <p className={styles.chuDai}>{chiTiet.yeuCauDieuKien}</p>
        </Muc>
      )}

      {chiTiet.cachThuc.length > 0 && (
        <Muc tieuDe={t('chi-tiet.muc.cach-thuc')}>
          <table className={styles.bang}>
            <caption>
              <VisuallyHidden>{t('chi-tiet.cach-thuc-bang')}</VisuallyHidden>
            </caption>
            <thead>
              <tr>
                <th scope="col">{t('chi-tiet.cot.hinh-thuc')}</th>
                <th scope="col">{t('chi-tiet.cot.thoi-gian')}</th>
                <th scope="col">{t('chi-tiet.cot.phi')}</th>
              </tr>
            </thead>
            <tbody>
              {chiTiet.cachThuc.map((c, i) => (
                <tr key={i}>
                  <td>
                    {coChu(c.hinhThuc) ? c.hinhThuc : khongCo}
                    {coChu(c.moTa) && <span className={styles.phu}>{c.moTa}</span>}
                  </td>
                  <td>{coChu(c.thoiHan) ? c.thoiHan : khongCo}</td>
                  <td>{coChu(c.phi) ? c.phi : khongCo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Muc>
      )}

      {chiTiet.thanhPhanHoSo.length > 0 && (
        <Muc tieuDe={t('chi-tiet.muc.thanh-phan')}>
          <ol className={styles.danhSach}>
            {chiTiet.thanhPhanHoSo.map((g, i) => (
              <li key={i}>
                {g.ten}
                {coSoBan(g.banChinh, g.banSao) && (
                  <span className={styles.phu}>{t('chi-tiet.so-ban', { chinh: g.banChinh ?? 0, sao: g.banSao ?? 0 })}</span>
                )}
              </li>
            ))}
          </ol>
        </Muc>
      )}

      {trinhTu.length > 0 && (
        <Muc tieuDe={t('chi-tiet.muc.trinh-tu')}>
          <div className={styles.cacBuoc}>
            {trinhTu.map((b, i) => (
              <div key={i}>
                {coChu(b.truongHop) && <strong className={styles.truongHop}>{b.truongHop}</strong>}
                {coChu(b.noiDung) && <p className={styles.chuDai}>{b.noiDung}</p>}
              </div>
            ))}
          </div>
        </Muc>
      )}

      {ketQua.length > 0 && (
        <Muc tieuDe={t('chi-tiet.muc.ket-qua')}>
          <ul className={styles.danhSach}>
            {ketQua.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </Muc>
      )}

      {canCu.length > 0 && (
        <Muc tieuDe={t('chi-tiet.muc.can-cu')}>
          <ul className={styles.danhSach}>
            {canCu.map((c, i) => (
              <li key={i}>
                {coChu(c.soKyHieu) && <strong>{c.soKyHieu}</strong>}
                {coChu(c.soKyHieu) && coChu(c.trichYeu) && t('chi-tiet.can-cu-noi')}
                {coChu(c.trichYeu) && c.trichYeu}
              </li>
            ))}
          </ul>
        </Muc>
      )}

      <p className={styles.mienTru}>{t('common:mien-tru')}</p>
    </div>
  );
}
