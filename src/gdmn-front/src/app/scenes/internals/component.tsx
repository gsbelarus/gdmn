import React from "react";
import { ERModel } from "gdmn-orm";
import { IViewProps, View } from "@src/app/components/View";
import { RecordSetReducerState } from "gdmn-recordset";
import { IRsMetaState } from "@src/app/store/reducer";

export interface IInternalsProps extends IViewProps<any> {
  erModel?: ERModel;
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
};

export class Internals extends View<IInternalsProps, {}> {

  public getViewHeaderHeight() {
    return 120;
  }

  render () {

    const { erModel, recordSet, rsMeta } = this.props;

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
              <li>
                {name} -- {rs.size} records, {rs.fieldDefs.length} fields, srcEoF: {rs.srcEoF ? 'true' : 'false'}
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
                  <li>
                    {name} -- taskKey: {rsm.taskKey ? rsm.taskKey : undefined}, query: {rsm.q ? JSON.stringify(rsm.q.inspect(), undefined, 2) : 'undefined'}
                  </li>
                :
                  <li>{name}</li>
              ))
            }
            </ol>
          </div>
        }
      </>
    );
  }
}