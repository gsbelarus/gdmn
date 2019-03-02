import React, { Fragment, PureComponent } from 'react';
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Panel,
  PanelType,
  SelectionMode
} from 'office-ui-fabric-react';

interface IStompPanelStateProps {
  logItems: { message: string }[];
}
interface IStompLogPanelState {
  stompLogOpened: boolean;
}

class StompLogPanel extends PureComponent<IStompPanelStateProps, IStompLogPanelState> {
  public static columns = [
    {
      key: 'message',
      name: 'FRAME',
      fieldName: 'message',
      minWidth: 100,
      maxWidth: 500,
      isResizable: true,
      isMultiline: true
    }
  ];

  public state: IStompLogPanelState = {
    stompLogOpened: false
  };

  private onTogglePanel = (checked?: boolean): void => {
    this.setState({ stompLogOpened: checked !== undefined ? checked : !this.state.stompLogOpened });
  };

  public render() {
    const { logItems } = this.props;
    const { stompLogOpened } = this.state;
    return (
      <Fragment>
        <DefaultButton
          iconProps={{ iconName: 'List' }}
          disabled={false}
          toggle={true}
          checked={stompLogOpened}
          text={stompLogOpened ? 'hide stomp log' : 'show stomp log'}
          onClick={() => this.onTogglePanel(undefined)}
        />
        <Panel
          style={{ overflow: 'scroll' }}
          isBlocking={false}
          isOpen={stompLogOpened}
          type={PanelType.medium}
          headerText="STOMP log"
          hasCloseButton={true}
          onDismiss={() => this.onTogglePanel(false)}
        >
          <DetailsList
            selectionMode={SelectionMode.none}
            data-is-scrollable="true"
            items={logItems}
            columns={StompLogPanel.columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.fixedColumns}
            compact={true}
          />
        </Panel>
      </Fragment>
    );
  }
}

export { StompLogPanel, IStompPanelStateProps };
