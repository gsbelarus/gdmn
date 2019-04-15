import React from "react";
import { ERModel } from "gdmn-orm";
import { IViewProps, View } from "@src/app/components/View";
import { RecordSetReducerState, TStatus } from "gdmn-recordset";
import { IRsMetaState } from "@src/app/store/reducer";
import { IViewTab } from "../gdmn/types";
import { StompLogPanelContainer, ConnectBtnContainer } from "./container";

export interface IInternalsProps extends IViewProps<any> {
  erModel?: ERModel;
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
  viewTabs: IViewTab[];
};

export class Internals extends View<IInternalsProps, {}> {

  public getViewHeaderHeight() {
    return 120;
  }

  public getViewCaption(): string {
    return "Internals";
  }

  render () {

    const { erModel, recordSet, rsMeta, viewTabs } = this.props;

    return this.renderWide(
      undefined,
      <>
        <div>
          <h2>erModel</h2>
          erModel: {erModel ? `${Object.entries(erModel.entities).length} entites` : 'not loaded'}
        </div>
        <div>
          <h2>Recordsets</h2>
          <ol>
          {
            Object.entries(recordSet).map( ([name, rs]) => (
              <li key={name}>
                {name} -- {rs.size} records, {rs.fieldDefs.length} fields, status: {TStatus[rs.status]}
              </li>
            ))
          }
          </ol>
        </div>
        <div>
          <h2>ViewTabs</h2>
          <ol>
          {
            viewTabs.map( vt => (
              <li key={vt.url}>
                {vt.caption} -- {vt.url}, {vt.rs ? vt.rs.join() : 'no recordsets'}
              </li>
            ))
          }
          </ol>
        </div>
        {rsMeta &&
          <div>
            <h2>rsMeta</h2>
            <ol>
            {
              Object.entries(rsMeta).map( ([name, rsm]) => (
                rsm ?
                  <li key={name}>
                    {name} -- taskKey: {rsm.taskKey}
                  </li>
                :
                  <li>{name}</li>
              ))
            }
            </ol>
          </div>
        }
        <StompLogPanelContainer />
        <ConnectBtnContainer />
      </>
    );
  }
}
