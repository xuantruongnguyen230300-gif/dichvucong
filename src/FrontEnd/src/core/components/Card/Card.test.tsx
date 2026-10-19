import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardActions } from './Card';
import styles from './Card.module.css';

describe('Card', () => {
  it('render đúng thẻ HTML theo as', () => {
    const { container } = render(
      <Card as="article">
        <h3>Tên</h3>
      </Card>,
    );
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    expect(container.firstElementChild).toHaveClass(styles.the!);
  });

  it('CardActions đặt đúng class xếp nút', () => {
    render(
      <CardActions>
        <button>A</button>
        <button>B</button>
      </CardActions>,
    );
    expect(screen.getByRole('button', { name: 'A' }).parentElement).toHaveClass(styles.hanhDong!);
  });
});
