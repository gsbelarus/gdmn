import React from 'react';
import { Button } from 'office-ui-fabric-react';
import { View } from '../../components/View';

export interface IAccountViewProps {
  apiDeleteAccount: () => void;
}

export class AccountView extends View<IAccountViewProps, {}> {
  private handleDeleteAccount = () => {
    this.props.apiDeleteAccount();
  };

  public render() {
    return this.renderOneColumn(
      <Button onClick={this.handleDeleteAccount} text="DELETE ACCOUNT" />
    );
  }
}
