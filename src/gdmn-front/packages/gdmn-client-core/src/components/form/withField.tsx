import React from 'react';
import { compose, mapProps, setDisplayName, wrapDisplayName } from 'recompose';

// TODO types

function withField(mapFieldProps: any, WrappedComponent: any) {
  function propsMapper({ input, meta, ...customProps }: any) {
    return {
      ...mapFieldProps(meta, input),
      ...customProps
    };
  }

  // @ts-ignore // fixme
    if (process.env.NODE_ENV !== 'production') {
    // TODO
    const displayName = wrapDisplayName(WrappedComponent, 'withField');

    return compose(
      setDisplayName(displayName),
      mapProps(propsMapper)
    )(WrappedComponent);
  }

  return mapProps(propsMapper)(WrappedComponent);
}

export { withField };
