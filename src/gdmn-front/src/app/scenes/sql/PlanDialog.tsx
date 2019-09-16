import React, { PureComponent } from 'react';
import {
  Dialog,
  mergeStyleSets,
  DialogType,
  Pivot,
  PivotItem,
  DialogFooter,
  PrimaryButton,
  getTheme,
  TextField
} from 'office-ui-fabric-react';

const theme = getTheme();
const classNames = mergeStyleSets({
  wrapper: {
    overflow: 'hidden'
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

export interface IPlanDialogProps {
  plan: string;
  onClose: () => void;
}

export const PlanDialog = (props: IPlanDialogProps) => {
  const { plan, onClose } = props;

  return (
    <Dialog
      minWidth="70vh"
      hidden={false}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.close,
        title: 'SQL plan'
      }}
      modalProps={{
        className: classNames.wrapper,
        titleAriaId: 'showSQLTitleID',
        subtitleAriaId: 'showSQLSubTitleID',
        isBlocking: false
      }}
    >
      <div>
        {plan}
      </div>
      <DialogFooter>
        <PrimaryButton onClick={onClose} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};
