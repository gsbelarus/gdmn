import React, { Component } from 'react';
import { MessageBar, MessageBarButton, MessageBarType } from 'office-ui-fabric-react';

interface ILostConnectWarnMsgBarProps {
  opened: boolean;
  onDismiss: () => void;
  onYesAction: () => void;
}

class LostConnectWarnMsgBar extends Component<ILostConnectWarnMsgBarProps> {
  public render() {
    return (
      this.props.opened ? (
        <MessageBar
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
        ) : null
    );
  }
}

export { LostConnectWarnMsgBar, ILostConnectWarnMsgBarProps };
