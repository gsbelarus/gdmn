import React, { Component } from 'react';

export class View<P, S> extends Component<P, S> {

  public getViewCaption(): string {
    return 'The View...'
  }

  public renderOneColumn(content: JSX.Element): JSX.Element {
    return (
      <div className="ViewOneColumn">
        <div className="ViewCaption">
          {this.getViewCaption()}
        </div>
        {content}
      </div>
    );
  }

  public render() {
    return (
      <div>
        The View...
      </div>
    );
  }
}
