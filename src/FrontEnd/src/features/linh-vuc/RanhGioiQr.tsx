import { Component, type ReactNode } from 'react';

interface RanhGioiQrProps {
  children: ReactNode;
  /** Hiện thay mã QR khi nạp hay vẽ mã lỗi. */
  fallback: ReactNode;
  /** Gọi một lần khi bắt được lỗi (để nơi dùng chuẩn bị lần nạp lại). */
  khiLoi?: () => void;
}

/**
 * Ranh giới lỗi nhỏ quanh MỘT mã QR (F05 L3): chunk `QrLinhVuc` nạp lỗi (mạng, Cloudflare) thì chỉ ô đó mất mã, còn tên,
 * số thủ tục, liên kết của ô và cả lưới vẫn như thường. Không hiện thông điệp lỗi (QR chỉ là phần thêm cho người dân,
 * liên kết của ô vẫn dùng được).
 */
export class RanhGioiQr extends Component<RanhGioiQrProps, { coLoi: boolean }> {
  override state = { coLoi: false };

  static getDerivedStateFromError(): { coLoi: boolean } {
    return { coLoi: true };
  }

  override componentDidCatch(): void {
    this.props.khiLoi?.();
  }

  override render(): ReactNode {
    return this.state.coLoi ? this.props.fallback : this.props.children;
  }
}
