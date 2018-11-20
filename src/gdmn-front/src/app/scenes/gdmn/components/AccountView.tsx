import React, { PureComponent } from 'react';
import { Button } from '@material-ui/core';

interface IAccountViewProps {
  apiDeleteAccount: () => void;
}

class AccountView extends PureComponent<IAccountViewProps> {
  private handleDeleteAccount = () => {
    this.props.apiDeleteAccount();
  };

  public render() {
    return (
      <div>
        <Button style={{ marginRight: 18 }} variant="contained" size="small" onClick={this.handleDeleteAccount}>
          DELETE ACCOUNT
        </Button>
      </div>
    );
  }
}

export { AccountView };
