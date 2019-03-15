import {IViewProps, View} from "@src/app/components/View";
import {ICommandBarItemProps, TextField} from "office-ui-fabric-react";
import React from "react";

export interface ISqlViewProps extends IViewProps {
  run: () => void;
  onChange: (ev: any, text?: string) => void;
}

export interface ISqlViewState {

}

export class SqlView extends View<ISqlViewProps, ISqlViewState> {

  public getViewCaption(): string {
    return "SQL";
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = super.getCommandBarItems();

    items.push({
      key: "reloadERModel",
      text: "Run",
      iconProps: {
        iconName: "Play"
      },
      onClick: this.props.run
    });
    return items;
  }

  public render() {
    return this.renderWide(undefined,
      <div>
        <TextField multiline rows={10} resizable={false} onChange={this.props.onChange}/>
      </div>
    );
  }
}
