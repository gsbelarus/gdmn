import React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Columns } from '.';
import { ParamsPanel } from './ParamsPanel';

interface IParamsDialogProps {
  onCancel: () => void;
  columns: Columns;
  onToggle: (columnName: string) => void;
}

export const ParamsDialog = (props: IParamsDialogProps): JSX.Element => {
    const { onCancel, columns, onToggle } = props;
    return (
      <div>
        <Panel 
          data-is-scrollable={false} 
          isOpen={true} 
          onDismiss={onCancel} 
          headerText="Column options" 
          type={PanelType.medium}>
          <div>
            <ParamsPanel 
            columns={columns} 
            onToggle={onToggle}  />
          </div>          
        </Panel> 
      </div>
    );
}
