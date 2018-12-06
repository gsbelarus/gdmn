import React from 'react';
import { TextField, DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { View } from '../../components/View';

export interface IAccountViewProps {
  apiDeleteAccount: () => void;
}

export class AccountView extends View<IAccountViewProps, {}> {
  public getViewCaption(): string {
    return 'User profile';
  }

  private handleDeleteAccount = () => {
    this.props.apiDeleteAccount();
  };

  public render() {
    return this.renderOneColumn(
      <div className="ViewBody">
        <TextField label="Name:" />
        <TextField label="Surname:" />
        <TextField label="email:" />
        <PrimaryButton text="Save changes" />
        <div className="DangerZone">
          <div>Будьте внимательны! Удаление учетной записи необратимая операция.</div>
          <DefaultButton onClick={this.handleDeleteAccount} text="Delete account" />
        </div>
      </div>
    );
  }
}
