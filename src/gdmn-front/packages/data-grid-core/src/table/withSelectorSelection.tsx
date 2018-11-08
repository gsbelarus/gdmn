import React, { ComponentType, PureComponent, ReactChild, ReactType } from 'react';
import { compose, defaultProps, setDisplayName, wrapDisplayName } from 'recompose';
import { Subtract } from '@gdmn/client-core';

import { IInjectedSelectionProps, IWithSelectionProps, withSelection } from './withSelection';

interface IWithSelectorSelectionProps extends IWithSelectionProps {
  renderSelectorCell?: ReactType;
}

interface IInjectedSelectorSelectionProps extends IInjectedSelectionProps {
  selected?: boolean;
  children?: ReactChild | ReactChild[];
}

function withSelectorSelection<P extends IInjectedSelectorSelectionProps>(WrappedComponent: ComponentType<P>) {
  const WrappedSelectableComponent = withSelection<P>(WrappedComponent);

  class WithSelectorSelection extends PureComponent<
    Subtract<P, IInjectedSelectorSelectionProps> & IWithSelectorSelectionProps,
    any
  > {
    public render(): JSX.Element {
      const { renderSelectorCell: SelectorCell, ...selectableProps } = this.props as IWithSelectorSelectionProps;
      const { selectable, onSelectionToggle } = selectableProps;
      const { selected, children } = selectableProps as IInjectedSelectorSelectionProps;
      (selectableProps as IInjectedSelectorSelectionProps).children = undefined;

      return (
        <WrappedSelectableComponent {...selectableProps as any}>
          {SelectorCell &&
            children && (
              <SelectorCell
                selectorDisabled={!selectable}
                selectorChecked={selected}
                onSelectorToggle={() => {
                  // console.log('SelectorCell-onSelectorToggle');
                  // onSelectionToggle();
                }}
              />
            )}
          {children}
        </WrappedSelectableComponent>
      );
    }
  }

  // FIXME compose types
  const enhanced = compose(
    setDisplayName(wrapDisplayName(WrappedSelectableComponent, 'withSelectorSelection')),
    defaultProps({ selectable: true }) // FIXME enhace
  )(WithSelectorSelection as any);

  return enhanced; // hoistStatics(enhanced as any)(WrappedSelectableComponent);
}

export { withSelectorSelection, IWithSelectorSelectionProps, IInjectedSelectorSelectionProps };
