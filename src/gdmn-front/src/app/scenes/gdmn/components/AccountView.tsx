import React, { useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Stack } from 'office-ui-fabric-react';
import { gdmnActions, gdmnActionsAsync } from '../actions';
import { IAccountViewProps } from './AccountView.types';
import { Frame } from './Frame';
import { CenteredColumn } from './CenteredColumn';

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
    <CenteredColumn label="User Profile">
      <Stack>
        <TextField label="Name:" />
        <TextField label="Surname:" />
        <TextField label="email:" />
        <Frame marginTop>
          <PrimaryButton text="Save changes" />
        </Frame>
        <Frame marginTop border attention subTitle="Будьте внимательны! Удаление учетной записи необратимая операция.">
          <DefaultButton onClick={ () => dispatch(gdmnActionsAsync.apiDeleteAccount) } text="Delete account" />
        </Frame>
      </Stack>
    </CenteredColumn>
  )
};
