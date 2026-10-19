import { useSyncExternalStore } from 'react';
import { dangKyNgheKiosk, layCheDoKiosk } from './cheDoKiosk';

/** Đang ở chế độ kiosk không. */
export function useCheDoKiosk(): boolean {
  return useSyncExternalStore(dangKyNgheKiosk, layCheDoKiosk, () => false);
}
