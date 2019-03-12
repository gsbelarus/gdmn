import React, { PureComponent } from 'react';
import { Dialog, mergeStyleSets, DialogType, DialogFooter, PrimaryButton, getTheme } from 'office-ui-fabric-react';
import { IEntity } from 'gdmn-orm';

const theme = getTheme();

const classNames = mergeStyleSets({
  wrapper: {
    overflow: 'hidden',
  },
  textContent: {
    margin: '15px 0px',
    overflow: 'auto',
    height: '50vh',
    border: '1px solid ' + theme.palette.neutralSecondary,
    padding: '0.5em',
    fontSize: '12px'
  }
});

export interface IInspectorFormProps {
  serializedEntity: IEntity,
  onDismiss: () => void
}

export class InspectorForm extends PureComponent<IInspectorFormProps> {
  public render() {
    const { onDismiss, serializedEntity } = this.props;
    return (
      <Dialog
        minWidth="70vw"
        hidden={false}
        onDismiss={onDismiss}
        dialogContentProps={{
          type: DialogType.close,
          title: 'Entity Inspector'
        }}
        modalProps={{
          className: classNames.wrapper,
          titleAriaId: 'showInspectorTitleID',
          isBlocking: false
        }}
      >
        <pre className={classNames.textContent}>
          {JSON.stringify(serializedEntity, undefined, 2)}
        </pre>
        <DialogFooter>
          <PrimaryButton onClick={onDismiss} text="Close" />
        </DialogFooter>
      </Dialog>
    );
  }
}
