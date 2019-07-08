import React from 'react';
import {
  Dialog,
  mergeStyleSets,
  DialogType,
  Pivot,
  PivotItem,
  DialogFooter,
  PrimaryButton,
  getTheme
} from 'office-ui-fabric-react';

import { ISQLParam } from './Sql';

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
        <Pivot>
          <PivotItem headerText="SQL Select" className={classNames.textContent}>
            <pre>
              first
              {/* {rs.sql && rs.sql.select} */}
            </pre>
          </PivotItem>
          <PivotItem headerText="SQL Params" className={classNames.textContent}>
            <pre>
              second
              {/* {rs.sql && rs.sql.params && JSON.stringify(rs.sql.params, undefined, 2)} */}
            </pre>
          </PivotItem>
          <PivotItem headerText="EntityQuery" className={classNames.textContent}>
            <pre>
              third
              {/* {rs.eq && JSON.stringify(rs.eq.inspect(), undefined, 2)} */}
            </pre>
          </PivotItem>
        </Pivot>
      </div>
      <DialogFooter>
        <PrimaryButton onClick={onClose} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};
