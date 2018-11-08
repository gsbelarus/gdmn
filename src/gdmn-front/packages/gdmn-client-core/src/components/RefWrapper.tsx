import React, { Children, PureComponent, ReactChild } from 'react';

/**
 * Refs don't work on SFC
 * ReactDOM.findDOMNode(wrapperRef) effectively returns a ref to the stateless component
 */

interface IRefWrapperProps {
  children: ReactChild | ReactChild[];
  [t: string]: any;
}

class RefWrapper extends PureComponent<IRefWrapperProps, any> {
  public render(): JSX.Element {
    return Children.only(this.props.children);
  }
}

export { RefWrapper, IRefWrapperProps };
