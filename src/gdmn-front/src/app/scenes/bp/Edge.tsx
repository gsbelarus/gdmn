import React from 'react';

export interface IEdgeProps {
  points: Array<{ x: number; y: number }>;
};

export function Edge(props: IEdgeProps) {
  const { points } = props;
  const d = points.length === 3
    ? 'M ' + points[0].x + ' ' + points[0].y + ' ' +
      'S ' + points[1].x + ' ' + points[1].y + ', ' + points[2].x + ' ' + points[2].y
    : points.reduce((prev, p, idx) => prev + (idx ? 'L ' : 'M ') + p.x + ' ' + p.y + ' ', '');

  return <path d={d} markerEnd="url(#arrow)" />;
};
