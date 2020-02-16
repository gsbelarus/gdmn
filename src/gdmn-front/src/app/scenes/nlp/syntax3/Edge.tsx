import React from 'react';

interface IEdgeProps {
  points: Array<{ x: number; y: number }>;
};

export const Edge = ({ points }: IEdgeProps) => {
  const d = points.reduce((prev, p, idx) => prev + (idx ? 'L ' : 'M ') + p.x + ' ' + p.y + ' ', '');
  return <path d={d} markerEnd="url(#arrow)" style={{ fill: 'none', stroke: 'black', strokeWidth: '1px' }} />;
};
