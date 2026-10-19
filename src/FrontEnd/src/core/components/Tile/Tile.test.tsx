import { render, screen } from '@testing-library/react';
import { Landmark } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { Tile, TileGrid } from './Tile';

const bieuTuong = <Landmark data-testid="bt" />;

describe('Tile', () => {
  it('có link → đúng 1 <a>, có "Trang ngoài" (aria-hidden), tên đọc gồm tên ô và "(mở trang mới)"', () => {
    render(
      <TileGrid>
        <Tile ten="Cổng DVC Quốc gia" href="https://dichvucong.gov.vn" bieuTuong={bieuTuong} mau="indigo" />
      </TileGrid>,
    );
    const lienKet = screen.getByRole('link', { name: /Cổng DVC Quốc gia \(mở trang mới\)/ });
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(lienKet).toHaveAttribute('target', '_blank');
    expect(lienKet.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getByText('Trang ngoài').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it.each([null, 'javascript:alert(1)', 'tel:0272389', '/trong'])(
    'href=%s → ô thường, không <a>, không role, không tabindex, không "Trang ngoài" (AC-21)',
    (href) => {
      render(
        <TileGrid>
          <Tile ten="Ô thường" href={href} bieuTuong={bieuTuong} mau="teal" />
        </TileGrid>,
      );
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.queryByText('Trang ngoài')).toBeNull();
      const o = screen.getByText('Ô thường').parentElement!;
      expect(o.tagName).toBe('DIV');
      expect(o).not.toHaveAttribute('role');
      expect(o).not.toHaveAttribute('tabindex');
      expect(o).not.toHaveAttribute('href');
    },
  );

  it('ô có link và ô không link dùng cùng khung, biểu tượng, tên', () => {
    render(
      <TileGrid>
        <Tile ten="Có link" href="https://example.vn" bieuTuong={bieuTuong} mau="blue" />
        <Tile ten="Không link" href={null} bieuTuong={bieuTuong} mau="blue" />
      </TileGrid>,
    );
    const a = screen.getByText('Có link').parentElement!;
    const b = screen.getByText('Không link').parentElement!;
    const lopChung = (e: Element) => [...e.classList].filter((l) => !l.includes('coLienKet'));
    expect(lopChung(a)).toEqual(lopChung(b));
    expect(screen.getByText('Có link').className).toBe(screen.getByText('Không link').className);
    expect(screen.getAllByTestId('bt')[0]!.parentElement!.className).toBe(screen.getAllByTestId('bt')[1]!.parentElement!.className);
  });

  it('TileGrid là danh sách, mỗi ô là một mục', () => {
    render(
      <TileGrid>
        <Tile ten="A" href={null} bieuTuong={bieuTuong} mau="pink" />
        <Tile ten="B" href={null} bieuTuong={bieuTuong} mau="navy" />
      </TileGrid>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
