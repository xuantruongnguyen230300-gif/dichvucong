import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { encode } from 'uqr';
import styles from './QrLinhVuc.module.css';

/** Lề yên tĩnh quanh mã, tính bằng ô (chuẩn QR: 4). */
const LE = 4;

interface QrLinhVucProps {
  link: string;
  ten: string;
  ma: string;
}

/**
 * Gộp các ô đen thành đoạn thẳng liền nhau trong từng hàng: `M x y h n v1 h-n z`.
 * `d` chỉ gồm chữ cái lệnh và số nguyên do chính hàm này sinh, không có chuỗi người dùng.
 */
function taoDuongVe(ma: readonly (readonly boolean[])[]): string {
  const doan: string[] = [];
  ma.forEach((hang, y) => {
    let x = 0;
    while (x < hang.length) {
      if (!hang[x]) {
        x++;
        continue;
      }
      const dau = x;
      while (x < hang.length && hang[x]) x++;
      const dai = x - dau;
      doan.push(`M${dau} ${y}h${dai}v1h-${dai}z`);
    }
  });
  return doan.join('');
}

/**
 * Mã QR dạng vector (SVG) của một lĩnh vực, in ra giấy nét ở mọi cỡ. Chỉ được nạp lười (`lazy` ở `OLinhVuc`):
 * `uqr` nằm ở chunk `qr` riêng, không bị obfuscate. Mức sửa lỗi M vì mã được in và dán, dễ trầy.
 */
export default function QrLinhVuc({ link, ten, ma }: QrLinhVucProps) {
  const { t } = useTranslation('linh-vuc');
  const { canh, duongVe } = useMemo(() => {
    const { data, size } = encode(link, { ecc: 'M', border: 0, boostEcc: true });
    return { canh: size, duongVe: taoDuongVe(data) };
  }, [link]);

  const kichThuoc = canh + 2 * LE;
  const hopNhin = `${-LE} ${-LE} ${kichThuoc} ${kichThuoc}`;

  return (
    <svg
      className={styles.qr}
      viewBox={hopNhin}
      role="img"
      aria-label={t('qr.nhan', { ten })}
      data-qr={ma}
      shapeRendering="crispEdges"
    >
      <rect className={styles.nen} x={-LE} y={-LE} width={kichThuoc} height={kichThuoc} />
      <path className={styles.ma} d={duongVe} />
    </svg>
  );
}
