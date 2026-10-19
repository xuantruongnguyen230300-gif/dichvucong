import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ApiError, MA_MAT_KET_NOI } from '../../api/http';
import { Skeleton } from '../Skeleton';
import { QueryState } from './QueryState';

function Thu({ hanh }: { hanh: () => Promise<string> }) {
  const truyVan = useQuery({ queryKey: ['thu'], queryFn: hanh, retry: false });
  return (
    <QueryState truyVan={truyVan} khungCho={<Skeleton dang="dong" />}>
      {(duLieu) => <p>{`Dữ liệu: ${duLieu}`}</p>}
    </QueryState>
  );
}

describe('QueryState', () => {
  it('đang tải → khung chờ, xong → dữ liệu', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <Thu hanh={() => Promise.resolve('ok')} />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
    expect(await screen.findByText('Dữ liệu: ok')).toBeInTheDocument();
  });

  it('lỗi → bấm "Thử lại" → khung chờ hiện trong lúc tải lại → hiện dữ liệu', async () => {
    let lanGoi = 0;
    let hoanThanh: (v: string) => void = () => undefined;
    const hanh = () => {
      lanGoi++;
      if (lanGoi === 1) return Promise.reject(new ApiError(0, { code: MA_MAT_KET_NOI }));
      return new Promise<string>((giai) => {
        hoanThanh = giai;
      });
    };
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Thu hanh={hanh} />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Chưa tải được dữ liệu.');
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    // đang tải lại: khung chờ, không còn thông báo lỗi
    expect(await screen.findByRole('status')).toHaveTextContent('Đang tải…');
    expect(screen.queryByRole('alert')).toBeNull();
    hoanThanh('moi');
    expect(await screen.findByText('Dữ liệu: moi')).toBeInTheDocument();
  });
});
