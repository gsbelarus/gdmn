import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { branch, compose, renderComponent, setDisplayName, setStatic, wrapDisplayName } from 'recompose';

interface IWithEmptyProps {
  empty: boolean;
  emptySlot: ReactElement<any>;
}

function withEmpty<P>(WrappedComponent: ComponentType<P>) {
    return compose<P, P & IWithEmptyProps>(
    setDisplayName(wrapDisplayName(
        // @ts-ignore // fixme
        WrappedComponent,
        'withEmpty')),
    setStatic('WrappedComponent', WrappedComponent),
    branch<P & IWithEmptyProps>(({ empty }) => !!empty, renderComponent<IWithEmptyProps>(({ emptySlot }) => emptySlot))
  )(WrappedComponent); // todo hoistStatics
}

export { withEmpty };
