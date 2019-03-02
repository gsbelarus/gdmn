import React, { PureComponent } from 'react';
import { MessageBar, MessageBarButton, MessageBarType } from 'office-ui-fabric-react';

export interface ILostConnectWarnMsgBarProps {
  onDismiss: () => void;
  onYesAction: () => void;
}

export class LostConnectWarnMsgBar extends PureComponent<ILostConnectWarnMsgBarProps> {
  public render() {
    return (
      <MessageBar
        styles={{
          root: {
            background: 'rgb(255, 193, 168)'
          }
        }}
        messageBarType={MessageBarType.severeWarning}
        actions={
          <div>
            <MessageBarButton
              onClick={() => {
                this.props.onDismiss();
                this.props.onYesAction();
              }}
            >
              Yes
            </MessageBarButton>
            <MessageBarButton
              onClick={() => {
                this.props.onDismiss();
              }}
            >
              No
            </MessageBarButton>
          </div>
        }
      >
        <span>Unable to connect to server. Abort connection attempts? </span>
      </MessageBar>
    );
  }
}

