import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, MA_MAT_KET_NOI } from '../../core/api/http';
import { EmptyState } from '../../core/components/EmptyState';
import { ErrorState } from '../../core/components/ErrorState';
import { FloatingButton } from '../../core/components/FloatingButton';
import { LienHeProvider } from '../../core/components/LienHe';
import { SearchBox } from '../../core/components/SearchBox';
import { SectionTitle } from '../../core/components/SectionTitle';
import { Skeleton } from '../../core/components/Skeleton';
import { VisuallyHidden } from '../../core/components/VisuallyHidden';
import { MA_TRA_CUU_MAU, SO_DIEN_THOAI_MAU, TU_KHOA_HTML, TU_KHOA_KHONG_KET_QUA } from './duLieuMau';
import styles from './XemTruoc.module.css';

const LOI_MAT_KET_NOI = new ApiError(0, { code: MA_MAT_KET_NOI });
const LOI_QUA_NHIEU = new ApiError(429, { code: 'qua-nhieu-yeu-cau', maTraCuu: MA_TRA_CUU_MAU });
const LOI_HE_THONG = new ApiError(500, { code: 'loi-he-thong', maTraCuu: MA_TRA_CUU_MAU });
const khongLam = () => undefined;

function DanhSachRong() {
  const { t } = useTranslation('xem-truoc');
  const [tuKhoa, setTuKhoa] = useState('');
  const [soLanXoa, setSoLanXoa] = useState(0);
  return (
    <div className={styles.boLoc}>
      <SearchBox nhan={t('trang-thai.o-tim-rong')} giaTri={tuKhoa} onDoi={setTuKhoa} soKetQua={0} />
      <EmptyState
        doiTuong={t('danh-sach.doi-tuong')}
        tuKhoa={tuKhoa}
        coBoLoc={false}
        nutXoaTrenThanhLoc={false}
        onXoaBoLoc={() => {
          setTuKhoa('');
          setSoLanXoa(soLanXoa + 1);
        }}
      />
      <p className={styles.ghiChu}>{t('trang-thai.da-xoa', { so: soLanXoa })}</p>
    </div>
  );
}

export function KhoiTrangThai() {
  const { t } = useTranslation('xem-truoc');
  const doiTuong = t('danh-sach.doi-tuong');
  return (
    <LienHeProvider soDienThoai={SO_DIEN_THOAI_MAU}>
      <section className={styles.khoi} aria-labelledby="xt-tt">
        <SectionTitle cap={2} id="xt-tt">
          {t('trang-thai.tieu-de')}
        </SectionTitle>
        <p className={styles.nhanNho}>{t('trang-thai.skeleton')}</p>
        <div className={styles.cotTrangThai}>
          <Skeleton dang="the" soMuc={4} />
          <Skeleton dang="bang" soMuc={4} />
          <Skeleton dang="dong" />
          <p className={styles.nhanNho}>{t('trang-thai.o')}</p>
          <Skeleton dang="o" />
        </div>

        <p className={styles.nhanNho}>{t('trang-thai.loi')}</p>
        <div className={styles.cotTrangThai}>
          <div>
            <VisuallyHidden>{t('trang-thai.mat-ket-noi')}</VisuallyHidden>
            <ErrorState loi={LOI_MAT_KET_NOI} onThuLai={khongLam} />
          </div>
          <div>
            <VisuallyHidden>{t('trang-thai.qua-nhieu')}</VisuallyHidden>
            <ErrorState loi={LOI_QUA_NHIEU} onThuLai={khongLam} />
          </div>
          <div>
            <VisuallyHidden>{t('trang-thai.he-thong')}</VisuallyHidden>
            <ErrorState loi={LOI_HE_THONG} onThuLai={khongLam} />
          </div>
        </div>

        <p className={styles.nhanNho}>{t('trang-thai.rong')}</p>
        <p className={styles.ghiChu}>{t('trang-thai.rong-tu-khoa-chip')}</p>
        <EmptyState doiTuong={doiTuong} tuKhoa={TU_KHOA_KHONG_KET_QUA} coBoLoc nutXoaTrenThanhLoc={false} onXoaBoLoc={khongLam} />
        <p className={styles.ghiChu}>{t('trang-thai.rong-nut-tren-thanh')}</p>
        <EmptyState doiTuong={doiTuong} tuKhoa={TU_KHOA_KHONG_KET_QUA} coBoLoc nutXoaTrenThanhLoc />
        <p className={styles.ghiChu}>{t('trang-thai.rong-chi-loc')}</p>
        <EmptyState doiTuong={doiTuong} tuKhoa="" coBoLoc nutXoaTrenThanhLoc={false} onXoaBoLoc={khongLam} />
        <p className={styles.ghiChu}>{t('trang-thai.rong-khong-dieu-kien')}</p>
        <EmptyState doiTuong={doiTuong} tuKhoa="" coBoLoc={false} nutXoaTrenThanhLoc={false} />
        <p className={styles.ghiChu}>{t('trang-thai.rong-html')}</p>
        <EmptyState doiTuong={doiTuong} tuKhoa={TU_KHOA_HTML} coBoLoc={false} nutXoaTrenThanhLoc={false} />

        <p className={styles.nhanNho}>{t('trang-thai.danh-sach-rong')}</p>
        <DanhSachRong />
      </section>
    </LienHeProvider>
  );
}

export function KhoiNutNoi() {
  const { t } = useTranslation('xem-truoc');
  const [mo, setMo] = useState(false);
  return (
    <section className={styles.khoi} aria-labelledby="xt-fab">
      <SectionTitle cap={2} id="xt-fab">
        {t('nut-noi.tieu-de')}
      </SectionTitle>
      <p className={styles.moTa}>{t('nut-noi.mo-ta')}</p>
      <FloatingButton
        viTri="phai"
        bieuTuong={<MessageSquare size={20} aria-hidden="true" />}
        dangMo={mo}
        dieuKhien="xt-khung-gia"
        onClick={() => setMo(!mo)}
      >
        {t('nut-noi.chu')}
      </FloatingButton>
      <div id="xt-khung-gia" hidden={!mo} className={styles.khungTrang}>
        {t('nut-noi.chu')}
      </div>
    </section>
  );
}
