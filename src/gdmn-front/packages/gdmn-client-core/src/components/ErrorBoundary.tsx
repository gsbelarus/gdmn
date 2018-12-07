import React, { ErrorInfo, Fragment, ReactChild, ReactType, SFC } from 'react';

interface IErrorBoundaryProps {
  children?: ReactChild | ReactChild[];
  onError?: (error: Error, info: ErrorInfo) => void;
  renderComponent?: ReactType;
}

interface IErrorBoundaryState {
  error: Error | null;
  info: ErrorInfo | null;
}

interface IDefaultErrorBoundaryComponentProps {
  error: Error;
  stack: string;
}

// TODO test error state
class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  private static renderDefaultErrorBoundary: SFC<IDefaultErrorBoundaryComponentProps> = ({ error, stack }) => (
    <Fragment>
      <h1>Something went wrong! PLEASE, RELOAD THIS PAGE.</h1>
      <br />
      <br />
      <h2>
        ERROR
        <br />
        {error.toString()}
        <br />
        <br />
        LOCATION
        <br />
        {stack}
      </h2>
    </Fragment>
  );

  public static defaultProps = {
    renderComponent: ErrorBoundary.renderDefaultErrorBoundary
  };

  public state: IErrorBoundaryState = {
    error: null,
    info: null
  };

  public componentDidCatch(error: Error, info: ErrorInfo) {
    const { onError } = this.props;

    if (onError) {
      try {
        onError(error, info);
      } catch (err) {
        /**/
      }
    }

    this.setState({ error, info });
  }

  public render(): JSX.Element {
    const { children, renderComponent } = this.props;
    const { error, info } = this.state;

    if (error && renderComponent) {
      const Component = renderComponent as any;
      return <Component error={error} stack={info ? info.componentStack : ''} />
    }

    return <Fragment>{children}</Fragment>;
  }
}

export { ErrorBoundary, IErrorBoundaryProps, IErrorBoundaryState };
