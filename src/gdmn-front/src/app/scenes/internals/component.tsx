import React from "react";
import {ERModel} from "gdmn-orm";
import {IViewProps, View} from "@src/app/components/View";
import {RecordSetReducerState, TStatus} from "gdmn-recordset";
import {ISessionInfo, IViewTab} from "../gdmn/types";
import {StompLogPanelContainer, ConnectBtnContainer} from "./container";
import {IRsMetaState} from "@src/app/store/rsmeta";
import {IconButton} from 'office-ui-fabric-react/lib/Button';
import { Frame } from "../gdmn/components/Frame";
import { command2Text } from "gdmn-nlp-agent";
import { IGetServerProcessInfoResponse } from "@gdmn/server-api";
import { apiService } from "@src/app/services/apiService";

export interface IInternalsProps extends IViewProps<any> {
  erModel?: ERModel;
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
  viewTabs: IViewTab[];
  sessionInfo: ISessionInfo[];
  getSessionInfo: () => void;
};

interface IInternalsState {
  processInfo?: IGetServerProcessInfoResponse;
};

export class Internals extends View<IInternalsProps, {}> {

  state: IInternalsState = {};

  public getViewHeaderHeight() {
    return 0;
  }

  public getViewCaption(): string {
    return "Internals";
  }

  public componentDidMount() {
    super.componentDidMount();
    apiService.getServerProcessInfo({})
      .then( res => {
        if (!res.error) {
          this.setState({ processInfo: res.payload.result });
        }
      });
  }

  render() {

    const {erModel, recordSet, rsMeta, viewTabs, sessionInfo, getSessionInfo} = this.props;
    const {processInfo} = this.state;

    return this.renderWide(
      undefined,
      <>
        { processInfo &&
          <Frame border marginTop marginLeft marginRight caption="Server Process">
            <pre>
              {
`RSS: ${Math.floor(processInfo.memoryUsage.rss / 1024 / 1024)} MB
Heap Total: ${Math.floor(processInfo.memoryUsage.heapTotal / 1024 / 1024)} MB
Heap Used: ${Math.floor(processInfo.memoryUsage.heapUsed / 1024 / 1024)} MB
External: ${Math.floor(processInfo.memoryUsage.external / 1024 / 1024)} MB`
              }
            </pre>
          </Frame>
        }
        <Frame border marginTop marginLeft marginRight caption="erModel">
          erModel: {erModel ? `${Object.entries(erModel.entities).length} entites` : 'not loaded'}
        </Frame>
        <Frame border marginTop marginLeft marginRight caption="Recordsets" canMinimize>
          {
            Object.entries(recordSet).map(([name, rs]) => (
              <Frame key={name} border marginTop caption={name}>
                <div>Size: {rs.size} records, {rs.fieldDefs.length} fields</div>
                <div>Status: {TStatus[rs.status]}, changed: {rs.changed}, locked: {rs.locked ? 'true' : 'false'}, queryPhrase: {rs.queryPhrase}</div>
              </Frame>
            ))
          }
        </Frame>
        {rsMeta &&
        <Frame border marginTop marginLeft marginRight caption="rsMeta">
          <ol>
            {
              Object.entries(rsMeta).map(([name, rsm]) => (
                rsm ?
                  <li key={name}>
                    {name} -- {rsm.taskKey !== undefined ? `taskKey: ${rsm.taskKey}` : 'no task key'}{rsm.error ? `, error: ${rsm.error}` : ''}
                  </li>
                  :
                  <li>{name}, no meta info</li>
              ))
            }
          </ol>
        </Frame>
        }
        <Frame border marginTop marginLeft marginRight caption="ViewTabs" canMinimize>
          {
            viewTabs.map(vt => (
              <Frame key={vt.url} border marginTop caption={vt.caption}>
                <div>URL: {vt.url}</div>
                <div>{vt.rs ? `Recordsets: [${vt.rs.join()}]` : 'No recordsets'}</div>
                {vt.translator && <div>NLP command: {command2Text(vt.translator.command)}</div>}
                {vt.sessionData &&
                  <Frame border caption="Session data" marginTop canMinimize>
                    {JSON.stringify(Object.keys(vt.sessionData), undefined, 2)}
                  </Frame>
                }
              </Frame>
            ))
          }
        </Frame>
        <Frame border marginTop marginLeft marginRight caption="Session info">
          <div>
            Refresh
            <IconButton iconProps={{iconName: 'Sync'}} title="Emoji" ariaLabel="Emoji" onClick={getSessionInfo}/>
          </div>
          <ol>
            {
              sessionInfo.map((si, index) => (
                <li key={index}>
                  <div>{index + 1} Database ID: {si.database},</div>
                  <div>{index + 1}.1 Session ID: {si.id},</div>
                  <div>{index + 1}.2 ID user: {si.user},</div>
                  <div>{index + 1}.3 List  transactions: {si.transactions ? si.transactions : " not transactions"},</div>
                  <div>{index + 1}.4 List  sql query: {si.sql ? si.sql : " not sql query"},</div>
                  <ol>
                    {index + 1}.5 uses connections: {
                    si.usesConnections && si.usesConnections.length ? si.usesConnections.map(
                      (usesConnection, index) => (
                      <li key={index}>
                        value: {usesConnection},
                      </li>
                    )) : ' not connections'
                  }
                  </ol>
                  <ol>
                    {index + 1}.6 tasks: {
                    si.tasks ? si.tasks.map((task) => (
                      <li key={task.id}>
                        <div>{index + 1}.6.1 id: {task.id},</div>
                        <div>{index + 1}.6.2 status: {task.status},</div>
                        <div>{index + 1}.6.3.1 command: ID: {task.command && task.command.id},</div>
                        <div>{index + 1}.6.3.2 action: {task.command && task.command.action},</div>
                        <div>{index + 1}.6.3.3 replyMode: {task.command && task.command.replyMode}</div>
                      </li>
                    )) : ' not task'
                  }
                  </ol>
                </li>
              ))
            }
          </ol>
        </Frame>
        <Frame border marginTop marginLeft marginRight caption="Stomp">
          <StompLogPanelContainer/>
        </Frame>
        <Frame border marginTop marginLeft marginRight caption="Connect">
          <ConnectBtnContainer/>
        </Frame>
      </>
    );
  }
}
