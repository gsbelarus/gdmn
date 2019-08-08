import React, { useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Label, getTheme } from 'office-ui-fabric-react';
import { gdmnActions, gdmnActionsAsync } from '../actions';
import { IAccountViewProps } from './AccountView.types';


export const AccountView = (props: IAccountViewProps) => {

  const { viewTab, dispatch, url } = props;

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'User profile',
        canClose: true
      }));
    }
  }, []);

  return (
    <div className="ViewOneColumn">
      <Label styles={{ root: { ...getTheme().fonts.xLarge } }}>User Profile</Label>
      <div className="ViewBody">
        <TextField label="Name:" />
        <TextField label="Surname:" />
        <TextField label="email:" />
        <PrimaryButton text="Save changes" />
        <div className="DangerZone">
          <div>Будьте внимательны! Удаление учетной записи необратимая операция.</div>
          <DefaultButton onClick={ () => dispatch(gdmnActionsAsync.apiDeleteAccount) } text="Delete account" />
        </div>
      </div>
    </div>
  )
};


