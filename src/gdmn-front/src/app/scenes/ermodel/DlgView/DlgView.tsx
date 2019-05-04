import {disposeMutex, getMutex} from "@src/app/components/dataViewMutexes";
import {IViewProps, View} from "@src/app/components/View";
import {Semaphore} from "gdmn-internals";
import {ERModel, EntityQuery, EntityQueryOptions, EntityLink, EntityLinkField} from "gdmn-orm";
import {RecordSet} from "gdmn-recordset";
import {ICommandBarItemProps, TextField, IComboBoxOption} from "office-ui-fabric-react";
import React, {Fragment} from "react";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
import { prepareDefaultEntityQuery } from "../entityData/utils";
import { apiService } from "@src/app/services/apiService";

export enum DlgState {
  dsBrowse,
  dsInsert,
  dsEdit
};

export interface IDlgViewMatchParams {
  entityName: string;
  pkSet: string;
};

export interface IDlgViewProps extends IViewProps<IDlgViewMatchParams> {
  src?: RecordSet;
  rs?: RecordSet;
  erModel: ERModel;
  dlgState: DlgState;
  attachRs: (mutex?: Semaphore) => void;
};

export interface IDlgViewState {
};

export class DlgView extends View<IDlgViewProps, IDlgViewState, IDlgViewMatchParams> {

  public getViewCaption(): string {
    if (this.props.match) {
      return this.props.match.params.entityName;
    } else {
      return "";
    }
  }

  public getDataViewKey() {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    const {entityName, pkSet} = this.props.match.params;

    if (!entityName || !pkSet) {
      throw new Error("Invalid entity name or pk values");
    }

    return [`${entityName}/${pkSet}`];
  }

  public isDataLoaded(): boolean {
    return !!this.props.rs;
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    return [
      {
        key: "save",
        text: "Save",
        iconProps: {
          iconName: "Save"
        }
      },
      {
        key: "cancel",
        text: "Cancel",
        iconProps: {
          iconName: "Cancel"
        }
      }
    ];
  }

  public addViewTab() {
    const {addViewTab, match} = this.props;

    addViewTab({
      caption: this.getViewCaption(),
      url: match.url,
      rs: this.getRecordSetList()
    });
  }

  public componentDidMount() {
    const {rs} = this.props;
    if (!rs) {
      this.props.attachRs(getMutex(this.getDataViewKey()));
    }

    super.componentDidMount();
  }

  public componentDidUpdate(prevProps: IDlgViewProps) {
    const {attachRs} = this.props;
    if (prevProps.erModel !== this.props.erModel) {
      attachRs(getMutex(this.getDataViewKey()));
    }
  }

  public componentWillUnmount() {
    disposeMutex(this.getDataViewKey());
  }

  public render() {
    const { rs, erModel } = this.props;

    if (!rs) {
      return this.renderLoading();
    }

    return this.renderWide(undefined,
      <div className="dlgView">
        <div>
          <LookupComboBox
            name="12345"
            preSelectedOption={{ key: 1, text: 'abc '}}
            onLookup={
              (filter: string, limit: number) => {
                const entity = erModel.entities['TgdcFunction'];

                const eq = new EntityQuery(
                  new EntityLink(entity, 'z', [
                    new EntityLinkField(entity.attributes['ID']),
                    new EntityLinkField(entity.attributes['NAME'])
                  ]),
                  new EntityQueryOptions(
                    limit + 1,
                    undefined,
                    filter ?
                      [{
                        contains: [
                          {
                            alias: 'z',
                            attribute: entity.attributes['NAME'],
                            value: filter!
                          }
                        ]
                      }]
                    : undefined
                  )
                );

                return apiService.query({ query: eq.inspect() })
                  .then( response => {
                    const result = response.payload.result!;
                    const idAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z' && data.attribute === 'ID' )![0];
                    const nameAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z' && data.attribute === 'NAME' )![0];
                    return result.data.map( (r): IComboBoxOption => ({
                      key: r[idAlias],
                      text: r[nameAlias]
                    }));
                  });
              }
            }
          />
        </div>
        <div>
          {rs.fieldDefs.map((f, idx) => (
            <Fragment key={idx}>
              <span>{f.caption}</span>
              <TextField value={this.props.dlgState === DlgState.dsEdit ? rs.getString(f.fieldName, 0, "") : ""}/>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
};