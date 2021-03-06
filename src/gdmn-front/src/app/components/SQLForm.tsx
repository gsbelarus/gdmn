import React, { PureComponent } from 'react';
import { Dialog, mergeStyleSets, DialogType, Pivot, PivotItem, DialogFooter, PrimaryButton, getTheme } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';

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
  rs: RecordSet,
  onCloseSQL: () => void
}

export class SQLForm extends PureComponent<ISQLFormProps> {

  public render() {
    const { rs, onCloseSQL } = this.props;

    return (
      <Dialog
        className={classNames.wrapper}
        minWidth='70vh'
        hidden={false}
        onDismiss={onCloseSQL}
        dialogContentProps={{
          type: DialogType.close,
          title: 'SQL'
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
                {rs.sql && rs.sql.select}
              </pre>
            </PivotItem>
            <PivotItem headerText="SQL Params" className={classNames.textContent}>
              <pre>
                {rs.sql && rs.sql.params && JSON.stringify(rs.sql.params, undefined, 2)}
              </pre>
            </PivotItem>
            <PivotItem headerText="EntityQuery" className={classNames.textContent}>
              <pre>
                {rs.eq && JSON.stringify(rs.eq.inspect(), undefined, 2)}
              </pre>
            </PivotItem>
          </Pivot>
        </div>
        <DialogFooter>
          <PrimaryButton onClick={onCloseSQL} text="Close" />
        </DialogFooter>
      </Dialog>
    );
  }
}
