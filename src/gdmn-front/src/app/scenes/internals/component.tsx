import React from "react";
import { ERModel } from "gdmn-orm";
import { IViewProps, View } from "@src/app/components/View";
import { RecordSetReducerState } from "gdmn-recordset";
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
                {name} -- {rs.size} records, {rs.fieldDefs.length} fields, srcEoF: {rs.srcEoF ? 'true' : 'false'}
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
                {vt.caption} -- {vt.url}, {vt.rs ? vt.rs.join() : 'no recordsets'}, {vt.savedState ? JSON.stringify(vt.savedState, undefined, 2) : 'no saved state'}
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
                    {name} -- taskKey: {rsm.taskKey ? rsm.taskKey : undefined}, query: {rsm.q ? JSON.stringify(rsm.q.inspect(), undefined, 2) : 'undefined'}
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