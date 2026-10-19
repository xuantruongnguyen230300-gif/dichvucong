import { Hourglass } from 'lucide-react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, type LinkProps } from 'react-router';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Button.module.css';

export type BienTheNut = 'primary' | 'secondary' | 'ghost' | 'lien-ket';

const LOP_BIEN_THE = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  'lien-ket': styles.lienKet,
  accent: styles.accent,
} as const;

/** Class của nút; ExternalLink dùng chung để liên kết trình bày như nút. */
export function lopNut(bienThe: BienTheNut | 'accent'): string {
  return cx(styles.nut, LOP_BIEN_THE[bienThe]);
}

interface ChungProps {
  bienThe?: BienTheNut; // mặc định 'secondary'
  bieuTuong?: ReactNode; // icon đứng trước chữ
  children?: ReactNode;
}

export interface ButtonNutProps
  extends ChungProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  to?: undefined;
  type?: 'button' | 'submit';
  dangXuLy?: boolean; // "đang xử lý": chặn bấm lặp, kích thước không đổi
  dangBat?: boolean; // có prop → nút bật/tắt, render aria-pressed
  ref?: Ref<HTMLButtonElement>;
}

/** Dạng liên kết nội bộ (React Router): đi tới trang khác thì là liên kết, không phải `<button>`. */
export interface ButtonLienKetProps
  extends ChungProps,
    Omit<LinkProps, 'className' | 'children' | 'to' | 'ref'> {
  to: string;
  ref?: Ref<HTMLAnchorElement>;
}

export type ButtonProps = ButtonNutProps | ButtonLienKetProps;

export function Button(props: ButtonProps) {
  if (props.to !== undefined) return <ButtonLienKet {...props} />;
  return <ButtonNut {...props} />;
}

function ButtonLienKet({ bienThe = 'secondary', bieuTuong, children, ...conLai }: ButtonLienKetProps) {
  return (
    <Link {...conLai} className={lopNut(bienThe)}>
      {bieuTuong}
      {children}
    </Link>
  );
}

function ButtonNut({
  bienThe = 'secondary',
  bieuTuong,
  children,
  type = 'button',
  dangXuLy = false,
  dangBat,
  onClick,
  ref,
  ...conLai
}: ButtonNutProps) {
  const { t } = useTranslation('common');

  const khiBam = (e: MouseEvent<HTMLButtonElement>) => {
    if (dangXuLy) {
      e.preventDefault(); // chặn cả gửi form
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      {...conLai}
      ref={ref}
      type={type}
      className={lopNut(bienThe)}
      onClick={khiBam}
      aria-pressed={dangBat}
      aria-busy={dangXuLy || undefined}
      aria-disabled={dangXuLy || undefined}
    >
      <span className={cx(styles.noiDung, dangXuLy && styles.giuCho)}>
        {bieuTuong}
        {children}
      </span>
      {dangXuLy && (
        <>
          <span className={styles.bieuTuongXuLy} aria-hidden="true">
            <Hourglass size={16} aria-hidden="true" />
          </span>
          <VisuallyHidden>{t('trang-thai.dang-xu-ly')}</VisuallyHidden>
        </>
      )}
    </button>
  );
}
