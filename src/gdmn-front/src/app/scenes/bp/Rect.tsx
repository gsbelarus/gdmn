import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';

export interface IRectProps {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly className: string;
};

export const Rect = CSSModules( (props: IRectProps): JSX.Element => {
  const { x, y, width, height, text, className } = props;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g>
      <rect x={x} y={y} rx={4} ry={4} width={width} height={height} styleName="outerRect" />
      <rect x={x + 1} y={y + 1} rx={4} ry={4} width={width - 2} height={height - 2} styleName={className} />
      <text x={cx} y={cy + 4} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}, styles, { allowMultiple: true });