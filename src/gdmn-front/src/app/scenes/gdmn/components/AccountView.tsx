import React, { PureComponent } from 'react';
import { Button } from 'office-ui-fabric-react';

export interface IAccountViewProps {
  apiDeleteAccount: () => void;
};

export class AccountView extends PureComponent<IAccountViewProps> {
  private handleDeleteAccount = () => {
    this.props.apiDeleteAccount();
  };

  public render() {
    return (
      <div>
        <Button onClick={this.handleDeleteAccount} text="DELETE ACCOUNT" />
      </div>
    );
  }
};