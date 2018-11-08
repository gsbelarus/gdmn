import React, { PureComponent, ReactChild } from 'react';
import CSSModules from 'react-css-modules';

const styles = require('./SizeMeasurer.css');

interface ISizeMeasurerProps {
  children: ({ width, height }: { width: number; height: number }) => ReactChild | ReactChild[];
  style?: object;
}

// todo auto-size? resizable ? scrollable ?
// https://github.com/Theadd/react-panels/blob/master/src/jsx/addons/resizable-content.js
// https://github.com/nrako/react-component-resizable

interface ISizeMeasurerState {
  size: { width: number; height: number };
}

@CSSModules(styles)
class SizeMeasurer extends PureComponent<ISizeMeasurerProps, ISizeMeasurerState> {
  public state = {
    size: { width: 0, height: 0 }
  };

  public static defaultProps = {
    style: {}
  };

  private ref: HTMLDivElement | null = null;
  private expandRef: HTMLDivElement | null = null;
  private contractRef: HTMLDivElement | null = null;
  private expandTriggerRef: HTMLDivElement | null = null;

  constructor(props: ISizeMeasurerProps) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
  }

  public componentDidMount() {
    this.handleScroll();
  }

  private handleScroll() {
    if (!this.ref) return;

    const size = { height: this.ref.offsetHeight, width: this.ref.offsetWidth };

    if (this.contractRef) {
      this.contractRef.scrollTop = size.height;
      this.contractRef.scrollLeft = size.width;
    }
    if (this.expandTriggerRef) {
      this.expandTriggerRef.style.width = `${size.width + 1}px`;
      this.expandTriggerRef.style.height = `${size.height + 1}px`;
    }
    if (this.expandRef) {
      this.expandRef.scrollTop = 1;
      this.expandRef.scrollLeft = 1;
    }

    this.setState({ size });
  }

  public render(): JSX.Element {
    const { children, style } = this.props;
    const { size } = this.state;

    return (
      <div
        ref={node => {
          this.ref = node;
        }}
        styleName="root"
        style={style}
      >
        {children(size)}
        <div styleName="triggers">
          <div
            styleName="expand"
            ref={node => {
              this.expandRef = node;
            }}
            onScroll={this.handleScroll}
          >
            <div
              ref={node => {
                this.expandTriggerRef = node;
              }}
            />
          </div>
          <div
            styleName="contract"
            ref={node => {
              this.contractRef = node;
            }}
            onScroll={this.handleScroll}
          >
            <div styleName="contract-trigger" />
          </div>
        </div>
      </div>
    );
  }
}

export { SizeMeasurer, ISizeMeasurerProps };
