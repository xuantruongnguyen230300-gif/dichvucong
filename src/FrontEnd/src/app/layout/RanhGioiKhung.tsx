import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Hiện thay phần bị lỗi; mặc định không hiện gì. */
  fallback?: ReactNode;
}

/**
 * Ranh giới lỗi riêng cho đầu trang và chân trang: lỗi dựng một trong hai không được kéo sập `<main>` và phần còn lại
 * (route gốc có `LoiTrang` sẽ thay cả khung). Không hiện thông điệp lỗi.
 */
export class RanhGioiKhung extends Component<Props, { coLoi: boolean }> {
  override state = { coLoi: false };

  static getDerivedStateFromError(): { coLoi: boolean } {
    return { coLoi: true };
  }

  override render(): ReactNode {
    return this.state.coLoi ? (this.props.fallback ?? null) : this.props.children;
  }
}
