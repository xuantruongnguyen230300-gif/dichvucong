import { Download, Landmark, Plus, Volume2, FileText, Building2, QrCode, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../core/components/Badge';
import { Button } from '../../core/components/Button';
import { ExternalLink } from '../../core/components/ExternalLink';
import { IconButton } from '../../core/components/IconButton';
import { SectionTitle } from '../../core/components/SectionTitle';
import { Tile, TileGrid } from '../../core/components/Tile';
import {
  CAP_MAU,
  LINK_XAU_MAU,
  SO_DIEN_THOAI_MAU,
  TOKEN_BO_GOC,
  TOKEN_BONG,
  TOKEN_CHU,
  TOKEN_KHOANG_CACH,
  TOKEN_MAU,
  tiLeTuongPhan,
} from './duLieuMau';
import styles from './XemTruoc.module.css';

export function KhoiToken() {
  const { t } = useTranslation('xem-truoc');
  return (
    <section className={styles.khoi} aria-labelledby="xt-token">
      <SectionTitle cap={2} id="xt-token">
        {t('token.tieu-de')}
      </SectionTitle>
      <p className={styles.nhanNho}>{t('token.mau')}</p>
      <div className={styles.luoiNho}>
        {TOKEN_MAU.map((token) => (
          <div key={token} className={styles.mau}>
            <div className={styles.matMau} style={{ background: `var(${token})` }} />
            <code>{token}</code>
          </div>
        ))}
      </div>
      <p className={styles.nhanNho}>{t('token.cap-mau')}</p>
      <div className={styles.luoiNho}>
        {CAP_MAU.map((cap) => (
          <div
            key={`${cap.chu}-${cap.nen}`}
            className={styles.capMau}
            style={{ color: `var(${cap.chu})`, background: `var(${cap.nen})` }}
          >
            <span>
              {t('token.tuong-phan', {
                chu: cap.chu.replace('--color-', ''),
                nen: cap.nen.replace('--color-', ''),
                ti: tiLeTuongPhan(cap.hexChu, cap.hexNen).toFixed(1),
              })}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.nhanNho}>{t('token.chu')}</p>
      <div className={styles.khungTrang}>
        {TOKEN_CHU.map((c) => (
          <div key={c.token} style={{ fontSize: `var(${c.token})` }}>
            {c.ten} — {t('token.chu-mau-dai')}
          </div>
        ))}
      </div>
      <p className={styles.nhanNho}>{t('token.khoang-cach')}</p>
      <div className={styles.khungTrang}>
        {TOKEN_KHOANG_CACH.map((token) => (
          <div key={token} className={styles.hang}>
            <code style={{ minWidth: '6rem' }}>{token}</code>
            <div className={styles.vienKhoangCach} style={{ width: `var(${token})` }} />
          </div>
        ))}
      </div>
      <p className={styles.nhanNho}>{t('token.bo-goc')}</p>
      <div className={styles.hang}>
        {TOKEN_BO_GOC.map((token) => (
          <div
            key={token}
            className={styles.mau}
            style={{ borderRadius: `var(${token})`, width: '7rem', background: 'var(--color-primary-soft)' }}
          >
            <code>{token}</code>
          </div>
        ))}
      </div>
      <p className={styles.nhanNho}>{t('token.bong')}</p>
      <div className={styles.hang}>
        {TOKEN_BONG.map((token) => (
          <div key={token} className={styles.mau} style={{ boxShadow: `var(${token})`, width: '9rem' }}>
            <code>{token}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KhoiNut() {
  const { t } = useTranslation('xem-truoc');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [bat, setBat] = useState(false);

  const xuLyGia = () => {
    setDangXuLy(true);
    window.setTimeout(() => setDangXuLy(false), 2000);
  };

  const bienThe = [
    { bienThe: 'primary', nhan: t('nut.primary') },
    { bienThe: 'secondary', nhan: t('nut.secondary') },
    { bienThe: 'ghost', nhan: t('nut.ghost') },
    { bienThe: 'lien-ket', nhan: t('nut.lien-ket') },
  ] as const;

  return (
    <section className={styles.khoi} aria-labelledby="xt-nut">
      <SectionTitle cap={2} id="xt-nut">
        {t('nut.tieu-de')}
      </SectionTitle>
      {bienThe.map((b) => (
        <div key={b.bienThe} className={styles.hang}>
          <Button bienThe={b.bienThe}>{b.nhan}</Button>
          <Button bienThe={b.bienThe} bieuTuong={<Plus size={16} aria-hidden="true" />}>
            {t('nut.thuong')}
          </Button>
          <Button bienThe={b.bienThe} disabled>
            {t('nut.vo-hieu')}
          </Button>
          <Button bienThe={b.bienThe} dangXuLy={dangXuLy} onClick={xuLyGia}>
            {dangXuLy ? t('nut.dang-xu-ly') : t('nut.bam-de-xu-ly')}
          </Button>
          <Button bienThe={b.bienThe} dangBat={bat} onClick={() => setBat(!bat)}>
            {t('nut.bat-tat')}: {bat ? t('nut.bat') : t('nut.tat')}
          </Button>
        </div>
      ))}
      <p className={styles.nhanNho}>{t('nut.lien-ket-noi-bo')}</p>
      <div className={styles.hang}>
        <Button to="/" bienThe="primary">
          {t('nut.xem-chi-tiet')}
        </Button>
        <Button to="/" bienThe="secondary">
          {t('nut.xem-chi-tiet')}
        </Button>
      </div>
      <p className={styles.nhanNho}>{t('nut.icon')}</p>
      <div className={styles.hang}>
        <IconButton nhan={t('nut.nhan-icon')} bieuTuong={<Plus size={16} aria-hidden="true" />} />
        <IconButton nhan={t('nut.nhan-icon')} bieuTuong={<Plus size={16} aria-hidden="true" />} bienThe="ghost" />
        <IconButton nhan={t('nut.nhan-icon')} bieuTuong={<Plus size={16} aria-hidden="true" />} disabled />
        <IconButton
          nhan={t('nut.nhan-icon-bat')}
          bieuTuong={<Volume2 size={16} aria-hidden="true" />}
          dangBat={bat}
          onClick={() => setBat(!bat)}
        />
      </div>
      <p className={styles.nhanNho}>{t('nut.nen-dam')}</p>
      <div className={styles.nenDam} data-nen-dam="">
        <div className={styles.hang}>
          <Button bienThe="secondary">{t('nut.tren-nen-dam')}</Button>
          <IconButton
            nhan={t('nut.nhan-icon-bat')}
            bieuTuong={<Volume2 size={16} aria-hidden="true" />}
            bienThe="tren-nen-dam"
            dangBat={bat}
            onClick={() => setBat(!bat)}
          />
          <a href="#xt-nut" className={styles.lienTrang}>
            {t('nut.tren-nen-dam')}
          </a>
        </div>
      </div>
    </section>
  );
}

export function KhoiLienKet() {
  const { t } = useTranslation('xem-truoc');
  return (
    <section className={styles.khoi} aria-labelledby="xt-lien-ket">
      <SectionTitle cap={2} id="xt-lien-ket">
        {t('lien-ket.tieu-de')}
      </SectionTitle>
      <div className={styles.hang}>
        <ExternalLink href="https://dichvucong.gov.vn/p/home">{t('lien-ket.web')}</ExternalLink>
        <ExternalLink href="https://dichvucong.gov.vn/p/home" bienThe="dam">
          {t('lien-ket.dam')}
        </ExternalLink>
        <ExternalLink href="https://dichvucong.gov.vn/p/home" bienThe="nut-accent">
          {t('lien-ket.nop')}
        </ExternalLink>
        <ExternalLink href="https://dichvucong.gov.vn/p/home" bienThe="nut-secondary">
          {t('lien-ket.nut-phu')}
        </ExternalLink>
      </div>
      <div className={styles.hang}>
        <ExternalLink href={`tel:${SO_DIEN_THOAI_MAU}`}>{t('lien-ket.dien-thoai')}</ExternalLink>
        <ExternalLink href="mailto:trungtam@example.vn">{t('lien-ket.thu')}</ExternalLink>
        <ExternalLink href={LINK_XAU_MAU}>{t('lien-ket.xau')}</ExternalLink>
      </div>
    </section>
  );
}

export function KhoiODichVu() {
  const { t } = useTranslation('xem-truoc');
  return (
    <section className={styles.khoi} aria-labelledby="xt-o">
      <SectionTitle cap={2} id="xt-o">
        {t('o-dich-vu.tieu-de')}
      </SectionTitle>
      <TileGrid>
        <Tile ten={t('o-dich-vu.co-lien-ket')} href="https://dichvucong.gov.vn" bieuTuong={<Landmark size={20} aria-hidden="true" />} mau="blue" />
        <Tile ten={t('o-dich-vu.co-lien-ket')} href="https://dichvucong.gov.vn" bieuTuong={<FileText size={20} aria-hidden="true" />} mau="indigo" />
        <Tile ten={t('o-dich-vu.khong-lien-ket')} href={null} bieuTuong={<Building2 size={20} aria-hidden="true" />} mau="teal" />
        <Tile ten={t('o-dich-vu.lien-ket-xau')} href={LINK_XAU_MAU} bieuTuong={<QrCode size={20} aria-hidden="true" />} mau="orange" />
        <Tile ten={t('o-dich-vu.co-lien-ket')} href="https://dichvucong.gov.vn" bieuTuong={<Users size={20} aria-hidden="true" />} mau="pink" />
        <Tile ten={t('o-dich-vu.co-lien-ket')} href="https://dichvucong.gov.vn" bieuTuong={<Download size={20} aria-hidden="true" />} mau="navy" />
      </TileGrid>
    </section>
  );
}

export function KhoiNhan() {
  const { t } = useTranslation('xem-truoc');
  return (
    <section className={styles.khoi} aria-labelledby="xt-nhan">
      <SectionTitle cap={2} id="xt-nhan">
        {t('nhan.tieu-de')}
      </SectionTitle>
      <div className={styles.hang}>
        <Badge loai="info">{t('nhan.info')}</Badge>
        <Badge loai="success">{t('nhan.toan-trinh')}</Badge>
        <Badge loai="warning">{t('nhan.mot-phan')}</Badge>
        <Badge loai="neutral">{t('nhan.thoi-han')}</Badge>
        <Badge loai="neutral">{t('nhan.phi')}</Badge>
        <Badge loai="success" kichThuoc="vua">
          {t('nhan.dang-mo')}
        </Badge>
        <Badge loai="neutral" kichThuoc="vua">
          {t('nhan.da-dong')}
        </Badge>
      </div>
      <p className={styles.nhanNho}>{t('nhan.khung-hep')}</p>
      <div className={styles.khungHep}>
        <Badge loai="info">{t('nhan.dai')}</Badge>
      </div>
      <div className={styles.khungHep}>
        <Badge loai="info" rutGon>
          {t('nhan.rut-gon')}
        </Badge>
      </div>
    </section>
  );
}
