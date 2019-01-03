import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';

import { IViewProps, View } from '@src/app/components/View';

export interface IAccountViewProps extends IViewProps {
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
