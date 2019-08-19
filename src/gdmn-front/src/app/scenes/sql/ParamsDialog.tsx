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

import { ISQLParam } from './Sql';
import { TFieldType } from 'gdmn-recordset';

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

export interface ISQLFormProps {
  params: ISQLParam[];
  onClose: () => void;
}

export const ParamsDialog = (props: ISQLFormProps) => {
  const { params, onClose } = props;

  return (
    <Dialog
      className={classNames.wrapper}
      minWidth="70vh"
      hidden={false}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.close,
        title: 'SQL params'
      }}
      modalProps={{
        titleAriaId: 'showSQLTitleID',
        subtitleAriaId: 'showSQLSubTitleID',
        isBlocking: false
      }}
    >
      <div>
        {params.map(i => {
          switch (i.type) {
            case TFieldType.Integer:
                return( <TextField label={i.name} key={i.name} value={i.value} />)

            default:
                return(<TextField label={i.name} key={i.name} value={i.value} />);
          }
        })}
      </div>
      <DialogFooter>
        <PrimaryButton onClick={onClose} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};
