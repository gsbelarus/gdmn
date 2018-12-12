import React, { Component } from 'react';

export class View<P, S> extends Component<P, S> {
  public getViewCaption(): string {
    return 'The View...';
  }

  public renderOneColumn(content: JSX.Element): JSX.Element {
    return (
      <div className="ViewOneColumn">
        <div className="ViewCaption">{this.getViewCaption()}</div>
        {content}
      </div>
    );
  }

  public renderWide(content: JSX.Element): JSX.Element {
    return (
      <div className="ViewWide">
        {this.renderCommandBar()}
        {content}
      </div>
    );
  }

  public renderLoading(): JSX.Element {
    return <div>Loading...</div>;
  }

  public renderCommandBar(): JSX.Element | undefined {
    return undefined;
  }

  public render() {
    return <div>{this.getViewCaption()}</div>;
  }
}
