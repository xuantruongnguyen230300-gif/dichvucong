import { useRef, type KeyboardEvent } from 'react';
import styles from './Tabs.module.css';

export interface TabsLuaChon<T extends string> {
  giaTri: T;
  nhan: string;
}

export interface TabsProps<T extends string> {
  nhan: string; // aria-label của tablist
  luaChon: readonly TabsLuaChon<T>[];
  giaTri: T;
  onDoi: (giaTri: T) => void; // chỉ gọi khi đổi sang tab khác
  idBang: string; // id của tabpanel dùng chung; nơi dùng tự vẽ tabpanel
}

/** Id của nút tab, để tabpanel đặt `aria-labelledby`. Ổn định theo (idBang, giaTri). */
export function idTab(idBang: string, giaTri: string): string {
  return `${idBang}-tab-${giaTri}`;
}

/**
 * Các tab theo mẫu ARIA (roving tabindex): chỉ tab đang chọn nằm trong thứ tự Tab; ← → Home End chuyển và
 * kích hoạt ngay (nội dung đã có sẵn). Chỉ vẽ tablist; tabpanel (`role="tabpanel"`, `id={idBang}`,
 * `aria-labelledby={idTab(idBang, giaTri)}`) do nơi dùng vẽ.
 */
export function Tabs<T extends string>({ nhan, luaChon, giaTri, onDoi, idBang }: TabsProps<T>) {
  const nut = useRef(new Map<T, HTMLButtonElement>());

  const chon = (moi: T) => {
    if (moi !== giaTri) onDoi(moi);
  };

  const khiNhanPhim = (e: KeyboardEvent<HTMLDivElement>) => {
    const hienTai = luaChon.findIndex((l) => nut.current.get(l.giaTri) === document.activeElement);
    if (hienTai < 0) return;
    const cuoi = luaChon.length - 1;
    let dich: number;
    switch (e.key) {
      case 'ArrowRight':
        dich = hienTai === cuoi ? 0 : hienTai + 1;
        break;
      case 'ArrowLeft':
        dich = hienTai === 0 ? cuoi : hienTai - 1;
        break;
      case 'Home':
        dich = 0;
        break;
      case 'End':
        dich = cuoi;
        break;
      default:
        return;
    }
    e.preventDefault();
    const tab = luaChon[dich];
    if (!tab) return;
    nut.current.get(tab.giaTri)?.focus();
    chon(tab.giaTri);
  };

  return (
    <div role="tablist" aria-label={nhan} className={styles.nhom} onKeyDown={khiNhanPhim}>
      {luaChon.map((l) => {
        const dangChon = l.giaTri === giaTri;
        return (
          <button
            key={l.giaTri}
            ref={(el) => {
              if (el) nut.current.set(l.giaTri, el);
              else nut.current.delete(l.giaTri);
            }}
            type="button"
            role="tab"
            id={idTab(idBang, l.giaTri)}
            className={styles.tab}
            aria-selected={dangChon}
            aria-controls={idBang}
            tabIndex={dangChon ? 0 : -1}
            onClick={() => chon(l.giaTri)}
          >
            {l.nhan}
          </button>
        );
      })}
    </div>
  );
}
