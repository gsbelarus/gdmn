import React, { Component } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { RouteComponentProps } from 'react-router';
import { IViewTab } from '../scenes/gdmn/types';

export interface IViewProps<R = any> extends RouteComponentProps<R> {
  viewTab?: IViewTab;
  addToTabList: (viewTab: IViewTab) => void;
}

export class View<P extends IViewProps<R>, S = {}, R = any> extends Component<P, S> {
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
    return <CommandBar items={this.getCommandBarItems()} />;
  }

  public getCommandBarItems(): ICommandBarItemProps[] { return []; }

  public componentDidMount() {
    const { addToTabList, match } = this.props;

    if (!match || !match.url) {
      throw new Error(`Invalid view ${this.getViewCaption()}`);
    }

    addToTabList({
      caption: this.getViewCaption(),
      url: match.url
    });
  }

  public render() {
    return <div>{this.getViewCaption()}</div>;
  }
}
