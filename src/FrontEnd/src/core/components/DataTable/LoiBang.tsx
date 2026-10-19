import { Component, type ReactNode } from 'react';
import { ErrorState } from '../ErrorState';

interface Props {
  children: ReactNode;
  /** Bấm "Thử lại": cha nạp lại chunk bảng rồi dựng lại ranh giới này (đổi `key`). */
  onThuLai: () => void;
  /** Phần phụ bên dưới thông báo lỗi (vd. nút quay về dạng thẻ). */
  hanhDongPhu?: ReactNode;
}

interface State {
  loi: unknown;
  coLoi: boolean;
}

/**
 * Ranh giới lỗi riêng của vùng bảng: chunk `BangDuLieu` lỗi tải chỉ làm hỏng vùng này; ô tìm, bộ lọc, phân trang
 * và cả trang vẫn nguyên. Không hiện thông điệp kỹ thuật của lỗi (ErrorState chỉ hiện câu theo loại lỗi).
 */
export class LoiBang extends Component<Props, State> {
  override state: State = { loi: null, coLoi: false };

  static getDerivedStateFromError(loi: unknown): State {
    return { loi, coLoi: true };
  }

  override render(): ReactNode {
    if (!this.state.coLoi) return this.props.children;
    return (
      <>
        <ErrorState loi={this.state.loi} onThuLai={this.props.onThuLai} />
        {this.props.hanhDongPhu}
      </>
    );
  }
}
