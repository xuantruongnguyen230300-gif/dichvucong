import { taoBoNap } from '../napKhung';

/**
 * Chunk phần đọc (chuẩn bị văn bản, bảng viết tắt, phát âm): chỉ nạp khi người dân bật đọc lần đầu,
 * hoặc có đáp án mới khi cờ đã bật từ lần trước (BR-4). Nhớ promise; nạp lỗi thì quên để lần sau thử lại.
 */
export const napPhanDoc = taoBoNap(() => import('./docCauTraLoi'));
