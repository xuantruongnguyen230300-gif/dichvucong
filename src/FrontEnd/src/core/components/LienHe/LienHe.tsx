import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface LienHe {
  soDienThoai: string | null;
}

const LienHeContext = createContext<LienHe>({ soDienThoai: null });

/** F08 bọc ứng dụng bằng provider này; chưa có số (hoặc chưa có provider) thì thông báo ẩn dòng số. */
export function LienHeProvider({ soDienThoai, children }: { soDienThoai: string | null; children: ReactNode }) {
  const giaTri = useMemo(() => ({ soDienThoai }), [soDienThoai]);
  return <LienHeContext.Provider value={giaTri}>{children}</LienHeContext.Provider>;
}

export function useLienHe(): LienHe {
  return useContext(LienHeContext);
}
