import { IViewProps, View } from '@src/app/components/View';
import { ICommandBarItemProps, IComponentAsProps, TextField } from 'office-ui-fabric-react';
import React from 'react';

import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';

export interface ISqlViewProps extends IViewProps {
  expression: string;
  run: (expression: string) => void;
  clear: () => void;
  onChange: (ev: any, text?: string) => void;
}

export interface ISqlViewState {}

export class SqlView extends View<ISqlViewProps, ISqlViewState> {
  public getViewCaption(): string {
    return 'SQL';
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };
    const items = super.getCommandBarItems();

    items.push({
      key: 'run',
      text: 'Run',
      iconProps: {
        iconName: 'Play'
      },
      onClick: () => this.props.run(this.props.expression, ),
    });
    items.push({
      key: 'clear',
      text: 'Clear',
      disabled: !this.props.expression || !this.props.expression.length,
      iconProps: {
        iconName: 'Clear'
      },
      onClick: this.props.clear
    });
    return items;
  }

  public render() {
    return this.renderWide(
      undefined,
      <div>
        <TextField value={this.props.expression} multiline rows={10} resizable={false} onChange={this.props.onChange} />
      </div>
    );
  }
}
