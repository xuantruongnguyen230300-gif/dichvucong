import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Skeleton } from '../../core/components/Skeleton';
import { Tabs } from '../../core/components/Tabs';
import { useCachXem } from '../../core/hooks/useCachXem';
import { KhungNhacKiosk } from '../thu-tuc/KhungNhacKiosk';
import styles from './DanhMuc.module.css';
import { docCap, type Cap } from './loc';
import { ThanhLoc } from './ThanhLoc';
import { ThongKe } from './ThongKe';

/** Số thẻ/dòng của khung chờ: gần một trang thật để trang không giật khi dữ liệu về. */
const SO_MUC_KHUNG_CHO = 12;

const khongLam = () => undefined;
const KHONG_CO_LINH_VUC: readonly never[] = [];
/** Giá trị của hai tab trên địa chỉ (`cap`), không phải chữ hiển thị. */
const CAP_XA: Cap = 'xa';
const CAP_TINH: Cap = 'tinh';

/**
 * Khung chờ của `/thu-tuc`: ba ô thống kê, hai tab, thanh lọc, dòng số kết quả và danh sách. Phần trên là CHÍNH các
 * thành phần thật (không tương tác, ẩn khỏi trình đọc màn hình) nên cao đúng bằng trang thật ở mọi khổ — số cột ô thống
 * kê, thanh lọc xuống dòng ở 375 px, hàng lọc của kiosk — không phải ước lượng bằng số. Chỉ ba con số được che
 * bằng khối xám (chưa có dữ liệu). Dùng như phần tử con trực tiếp của `.trang` để nhịp khoảng cách giống trang thật.
 * Danh sách là `Skeleton`, cũng là thứ báo `Layout` ẩn chân trang trong lúc chờ.
 */
export function KhungChoDanhMuc() {
  const { t } = useTranslation(['danh-muc', 'common']);
  const { cachXem } = useCachXem();
  const [params] = useSearchParams();
  const idBang = useId();
  const cap = docCap(params.get('cap') ?? '');

  return (
    <>
      <div className={styles.thongKeKhungCho} aria-hidden="true" inert>
        <ThongKe soXa={0} soTinh={0} soLinhVuc={0} />
      </div>
      <div aria-hidden="true" inert>
        <Tabs
          nhan={t('tab.nhan')}
          luaChon={[
            { giaTri: CAP_XA, nhan: t('tab.xa') },
            { giaTri: CAP_TINH, nhan: t('tab.tinh') },
          ]}
          giaTri={cap}
          onDoi={khongLam}
          idBang={idBang}
        />
      </div>
      <div className={styles.bang}>
        <div aria-hidden="true" inert>
          <ThanhLoc
            cap={cap}
            tuKhoa=""
            onDoiTuKhoa={khongLam}
            linhVuc={KHONG_CO_LINH_VUC}
            linhVucMa=""
            onDoiLinhVuc={khongLam}
            mucDo=""
            onDoiMucDo={khongLam}
            onXoaBoLoc={khongLam}
            cachXem={cachXem}
            onDoiCachXem={khongLam}
          />
        </div>
        <p className={styles.soKetQua} aria-hidden="true" />
        <KhungNhacKiosk />
        <Skeleton dang="the" soMuc={SO_MUC_KHUNG_CHO} />
      </div>
    </>
  );
}
