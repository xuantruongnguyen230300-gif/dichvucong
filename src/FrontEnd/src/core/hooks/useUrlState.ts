import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Trạng thái lưu trong query string (`?key=value`) để chia sẻ và quay lại được.
 * Đặt về chuỗi rỗng hoặc về `defaultValue` thì bỏ khoá khỏi URL. Không thêm mục vào lịch sử.
 */
export function useUrlState(key: string, defaultValue = ''): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next === '' || next === defaultValue) params.delete(key);
          else params.set(key, next);
          return params;
        },
        { replace: true },
      );
    },
    [key, defaultValue, setSearchParams],
  );

  return [value, setValue];
}
