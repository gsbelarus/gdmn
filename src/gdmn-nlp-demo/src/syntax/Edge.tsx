import React, { Component } from 'react';

export interface IEdgeProps {
  points: Array<{ x: number; y: number }>;
};

export class Edge extends Component<IEdgeProps, {}> {
  public render() {
    const { points } = this.props;
    const d = points.reduce((prev, p, idx) => prev + (idx ? 'L ' : 'M ') + p.x + ' ' + p.y + ' ', '');

    return <path d={d} markerEnd="url(#arrow)" />;
  }
};
