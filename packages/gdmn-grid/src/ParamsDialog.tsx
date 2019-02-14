import React, { PureComponent } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Columns } from '.';
import { ParamsPanel } from './ParamsPanel';

export interface IParamsField {
  fieldname: string;
}

interface IParamsDialogProps {
  onCancel: () => void;
  columns: Columns;
  onToggle: (columnName: string) => void;
}

class ParamsDialog extends PureComponent<IParamsDialogProps> {
  public render() {
    const { onCancel, columns, onToggle } = this.props;
    return (
      <div>
        <Panel isOpen={true} onDismiss={onCancel} headerText="Column options" type={PanelType.smallFixedFar}>
          <ParamsPanel columns={columns} onToggle={onToggle} />
        </Panel>
      </div>
    );
  }
}

export { ParamsDialog };
