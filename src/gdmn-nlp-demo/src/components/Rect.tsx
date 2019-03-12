import React, { Component } from 'react';

export interface IRectProps {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly className: string;
};

export class Rect extends Component<IRectProps, {}> {
  public render() {
    const { x, y, width, height, text, className } = this.props;
    const cx = x + width / 2;
    const cy = y + height / 2;

    return (
      <g>
        <rect x={x} y={y} rx={4} ry={4} width={width} height={height} className="outerRect" />
        <rect x={x + 1} y={y + 1} rx={4} ry={4} width={width - 2} height={height - 2} className={className} />
        <text x={cx} y={cy + 4} textAnchor="middle">
          {text}
        </text>
      </g>
    );
  }
};