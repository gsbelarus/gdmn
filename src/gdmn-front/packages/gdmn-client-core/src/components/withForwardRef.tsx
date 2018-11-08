import React, { ComponentType, forwardRef, ReactElement } from 'react';
import { compose, setDisplayName, setStatic, wrapDisplayName } from 'recompose';
import hoistNonReactStatics from 'hoist-non-react-statics';

type IWithForwardRefProps = (props: any, ref: any) => ReactElement<any>;

const forwardRefSymbol = '__forwardRef__';

function withForwardRef(WrappedComponent: ComponentType<any>) {
  const WithForwardRef: IWithForwardRefProps = (props: any, ref: any) => (
    <WrappedComponent {...{ [forwardRefSymbol]: ref, ...props }} />
  );

  const enhanced = compose(
    setDisplayName(wrapDisplayName(WrappedComponent, 'withForwardRef')),
    setStatic('WrappedComponent', WrappedComponent)
  )(WithForwardRef as any);


    return hoistNonReactStatics(forwardRef(enhanced as any),
      // @ts-ignore // fixme
      WrappedComponent,
      { $$typeof: true, render: true }); // TODO hoistStatics(forwardRef(enhanced), { $$typeof: true, render: true })(WrappedComponent);
}

// const hasForwardRef = WrappedComponent => WrappedComponent.$$typeof && typeof WrappedComponent.render === 'function';

export { withForwardRef, IWithForwardRefProps, forwardRefSymbol };
