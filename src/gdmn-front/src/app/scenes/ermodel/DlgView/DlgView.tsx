import React, { Fragment } from 'react';
import { RecordSet, SortFields, IDataRow } from 'gdmn-recordset';
import { IViewProps, View } from '@src/app/components/View';
import { TextField, ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';
import { ERModel } from 'gdmn-orm';

export enum IDlgState {
  dsBrowse,
  dsInsert,
  dsEdit
}

export interface IDlgViewProps extends IViewProps {
  rs: RecordSet<IDataRow>;
  erModel?: ERModel,
  dlgState: IDlgState,
  // saveRecord: () => void;
  // cancelRecord: () => void
}

export class DlgView<P extends IDlgViewProps, S, R = any> extends View<P, S, R> {

  public getDataViewKey() {
    const key = this.props.match ? this.props.match.params.entityName : '';

    if (!key) {
      throw new Error(`Invalid data view key`);
    }

    return key;
  }

  public getViewCaption(): string {
    if (this.props.match) {
      const entityName = this.props.match.params.entityName;
      return this.props.dlgState === IDlgState.dsInsert ? `add ${entityName}`  : `edit ${entityName}`;
    } else {
      return ''
    }
  }

  public componentDidMount() {
    const { addToTabList, match } = this.props;

    if (!match || !match.url) {
      throw new Error(`Invalid view ${this.getViewCaption()}`);
    }

    addToTabList({
      caption: this.getViewCaption(),
      url: match.url
    });
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { rs } = this.props;
    return [
      {
        key: `saveRecord${rs.name}`,
        text: 'Save',
        iconProps: {
          iconName: 'Save'
        },
        // onClick: saveRecord
      },
      {
        key: `cancelRecord${rs.name}`,
        text: 'Cancel',
        iconProps: {
          iconName: 'Cancel'
        },
        // onClick: cancelRecord
      }
    ];

  }

  public render() {
    const { rs } = this.props;

    if (rs)  {
      console.log(rs.get(this.props.match.params.currentRow));
      return this.renderWide( (
        <div className="dlgView">
          {rs.fieldDefs.map((f, idx) =>
          <Fragment key={idx}>
            <span>
              {f.caption}
            </span>
            <TextField
              value={this.props.dlgState === IDlgState.dsEdit ? rs.getString(this.props.match.params.currentRow, f.fieldName, '') : ''}
            />
          </Fragment>
          )}
        </div>
      )
      )}
    else {
      return this.renderLoading();
    }
  }
}


