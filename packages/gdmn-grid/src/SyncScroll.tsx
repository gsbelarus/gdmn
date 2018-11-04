import React from "react";

export interface OnScrollParams {
  scrollLeft: number;
  scrollTop: number;
};

export type OnScroll = (params: OnScrollParams) => void;

export interface ChildrenParams {
  scrollLeft: number;
  scrollTop: number;
  onScroll: OnScroll,
};

export type Children = (params: ChildrenParams) => JSX.Element;

export interface ISyncScrollProps {
  children: Children;
};

export interface ISyncScrollState {
  scrollLeft: number;
  scrollTop: number;
};

export class SyncScroll extends React.Component<ISyncScrollProps, ISyncScrollState> {
  state: ISyncScrollState = {
    scrollLeft: 0,
    scrollTop: 0
  };

  onScroll: OnScroll = (params: OnScrollParams) => {
    const { scrollLeft, scrollTop } = params;
    this.setState({
      scrollLeft: scrollLeft < 0 ? 0 : scrollLeft,
      scrollTop: scrollTop < 0 ? 0 : scrollTop
    });
  }

  render() {
    const { children } = this.props;
    const { scrollLeft, scrollTop } = this.state;
    return children({
      onScroll: this.onScroll,
      scrollLeft,
      scrollTop
    });
  }
};