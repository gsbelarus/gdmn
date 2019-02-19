import React, { Fragment } from 'react';
import { RecordSet, IDataRow } from 'gdmn-recordset';
import { IViewProps, View } from '@src/app/components/View';
import { TextField, ICommandBarItemProps } from 'office-ui-fabric-react';
import { ERModel } from 'gdmn-orm';

export enum DlgState {
  dsBrowse,
  dsInsert,
  dsEdit
}

export interface IDlgViewMatchParams {
  entityName: string,
  id: string
}

export interface IDlgViewProps extends IViewProps<IDlgViewMatchParams> {
  src?: RecordSet,
  erModel?: ERModel,
  dlgState: DlgState,
}

export interface IDlgViewState {
  rs: RecordSet
}

export class DlgView extends View<IDlgViewProps, IDlgViewState, IDlgViewMatchParams> {

  /*
  static getDerivedStateFromProps(props: IDlgViewProps, state: IDlgViewState) {
    return state;
  }
  */

  public getViewCaption(): string {
    if (this.props.match) {
      const entityName = this.props.match.params.entityName;
      return this.props.dlgState === DlgState.dsInsert ? `add ${entityName}`  : `edit ${entityName}`;
    } else {
      return ''
    }
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    return [
      {
        key: 'save',
        text: 'Save',
        iconProps: {
          iconName: 'Save'
        },
      },
      {
        key: 'cancel',
        text: 'Cancel',
        iconProps: {
          iconName: 'Cancel'
        },
      }
    ];

  }

  public render() {
    const { rs } = this.state;

    if (!rs) {
      return this.renderLoading();
    }

      /*
      console.log(rs.get(this.props.match.params.id));
      return this.renderWide( (
        <div className="dlgView">
          {rs.fieldDefs.map((f, idx) =>
          <Fragment key={idx}>
            <span>
              {f.caption}
            </span>
            <TextField
              value={this.props.dlgState === DlgState.dsEdit ? rs.getString(this.props.match.params.currentRow, f.fieldName, '') : ''}
            />
          </Fragment>
          )}
        </div>
      )
      )
    }
    */

    return this.renderLoading();
  }
}


