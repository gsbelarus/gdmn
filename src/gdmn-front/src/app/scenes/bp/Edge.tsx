import React from 'react';

export interface IEdgeProps {
  points: Array<{ x: number; y: number }>;
};

export function Edge(props: IEdgeProps) {
  const { points } = props;
  const d = points.reduce((prev, p, idx) => prev + (idx ? 'L ' : 'M ') + p.x + ' ' + p.y + ' ', '');

  return <path d={d} markerEnd="url(#arrow)" />;
};
