import React, { Component } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { RouteComponentProps } from 'react-router';
import { IViewTab } from '../scenes/gdmn/types';

export interface IViewProps<R = any> extends RouteComponentProps<R> {
  viewTab?: IViewTab;
  addViewTab: (viewTab: IViewTab) => void;
}

export abstract class View<P extends IViewProps<R>, S = {}, R = any> extends Component<P, S> {

  public getViewCaption(): string {
    return 'The View...';
  }

  public getViewHeaderHeight() {
    return 42;
  }

  public renderOneColumn(content: JSX.Element): JSX.Element {
    return (
      <div className="ViewOneColumn">
        <div className="ViewCaption">{this.getViewCaption()}</div>
        {content}
      </div>
    );
  }

  public renderWide(header: JSX.Element | undefined, content: JSX.Element): JSX.Element {
    const viewDataHeight = `calc(100% - ${this.getViewHeaderHeight().toString()}px)`;
    return (
      <div className="ViewWide">
        <div className="ViewHeader" style={{ height: this.getViewHeaderHeight() }}>
          {this.renderCommandBar()}
          {header}
        </div>
        <div className="ViewData" style={{ height: viewDataHeight }}>
          {content}
        </div>
      </div>
    );
  }

  public renderModal(): JSX.Element | undefined {
    return undefined;
  }

  public renderLoading(): JSX.Element {
    return <div>Loading...</div>;
  }

  public renderCommandBar(): JSX.Element | undefined {
    if (this.getCommandBarItems().length) {
      return <CommandBar items={this.getCommandBarItems()} />;
    } else {
      return undefined;
    }
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    return [];
  }

  public addViewTab() {
    const { addViewTab, match } = this.props;

    addViewTab({
      caption: this.getViewCaption(),
      url: match.url
    });
  }

  public componentDidMount() {
    const { viewTab, match } = this.props;

    if (!match || !match.url) {
      throw new Error(`Invalid view ${this.getViewCaption()}`);
    }

    if (!viewTab) {
      this.addViewTab();
    }
  }

  public render() {
    return <div>{this.getViewCaption()}</div>;
  }
}
