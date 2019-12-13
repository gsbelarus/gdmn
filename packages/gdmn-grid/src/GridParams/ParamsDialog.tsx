import React, { useRef, useEffect } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ParamsPanel } from './ParamsPanel';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Columns } from '../Grid';
import { IUserColumnsSettings } from '../types';

interface IParamsDialogProps {
  onRevert: () => void;
  onChanged: (userColunsSettings: IUserColumnsSettings | undefined) => void;
  onDismiss: () => void;
  columns: Columns;
  initialColumnsWidth: number;
  userSettings?: IUserColumnsSettings;
};

export const ParamsDialog = (props: IParamsDialogProps): JSX.Element => {
  const { onRevert, columns, onDismiss, userSettings, onChanged, initialColumnsWidth } = props;

  return (
    <div>
      <Panel
        data-is-scrollable={false}
        isOpen={true}
        headerText="Column options"
        onDismiss={onDismiss}
        onRenderFooterContent={
          () =>
            <div>
              <PrimaryButton
                disabled={Object.getOwnPropertyNames(userSettings ? userSettings : {}).length === 0}
                onClick={onRevert}
                style={{ marginRight: '8px' }}>
                Revert
              </PrimaryButton>
            </div>
        }
        type={PanelType.medium}>
        <div>
          <ParamsPanel
            columns={columns}
            onChanged={onChanged}
            userSettings={userSettings}
            initialColumnsWidth={initialColumnsWidth}
          />
        </div>
      </Panel>
    </div>
  );
}
