import React from 'react';

interface IRectProps {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  rectStyle: React.CSSProperties;
};

export const Rect = ({ x, y, width, height, text, rectStyle }: IRectProps) => {
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g>
      <rect x={x} y={y} rx={4} ry={4} width={width} height={height} style={{ stroke: 'none', fill: 'gray' }} />
      <rect x={x + 1} y={y + 1} rx={4} ry={4} width={width - 2} height={height - 2} style={rectStyle} />
      <text x={cx} y={cy + 4} textAnchor="middle" style={{ fill: 'black', fontSize: '14px' }}>
        {text}
      </text>
    </g>
  );
};