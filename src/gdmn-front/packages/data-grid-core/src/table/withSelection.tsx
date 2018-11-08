import React, { ComponentType, MouseEvent, PureComponent } from 'react';
import { compose, defaultProps, setDisplayName, setStatic, wrapDisplayName } from 'recompose';
import { Subtract } from '@gdmn/client-core';

interface IWithSelectionProps {
  uid: any; // todo tmp
  selectable: boolean;
  onSelectionToggle: (key: any) => void;
}

interface IInjectedSelectionProps {
  // selected?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

function withSelection<P extends IInjectedSelectionProps>(WrappedComponent: ComponentType<P>) {
  class WithSelection extends PureComponent<Subtract<P, IInjectedSelectionProps> & IWithSelectionProps, any> {
    public render(): JSX.Element {
      const { uid, selectable, onSelectionToggle, ...componentProps } = this.props as IWithSelectionProps;

      // console.log('render withSelectorSelection: ' + uid);

      return <WrappedComponent {...componentProps} onClick={e => (selectable ? onSelectionToggle(uid) : () => null)} />;
    }
  }

  const enhanced = compose(
    setDisplayName(wrapDisplayName(
        // @ts-ignore // fixme
        WrappedComponent,
        'withSelection')),
    setStatic('WrappedComponent', WrappedComponent),
    defaultProps({ selectable: true })
  )(WithSelection as any);

  return enhanced; // (FIXME IN selectorselection) // hoistStatics(enhanced as any)(WrappedComponent); // FIXME compose types
}

export { withSelection, IWithSelectionProps, IInjectedSelectionProps };
