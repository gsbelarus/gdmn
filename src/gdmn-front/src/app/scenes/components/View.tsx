import React, { Component } from 'react';

export class View<P, S> extends Component<P, S> {

  public renderOneColumn(content: JSX.Element): JSX.Element {
    return (
      <div className="ViewOneColumn">
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
