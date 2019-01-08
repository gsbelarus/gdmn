import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, IEntityQueryInspector, ScalarAttribute } from 'gdmn-orm';
import { parsePhrase, RusWord } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { ICommand } from 'gdmn-nlp-agent/dist/definitions';
import { TPingTaskCmd, TTaskActionNames } from '@gdmn/server-api';

import { IViewProps, View } from '@src/app/components/View';

interface IStompDemoViewState {
  pingDelay: string;
  pingSteps: string;
}

interface IStompDemoViewProps extends IViewProps {
  erModel?: ERModel;
  apiPing: (cmd: TPingTaskCmd) => void;
  apiGetData: (queryInspector: IEntityQueryInspector) => void;
  onError: (error: Error, meta?: any) => void;
}

class StompDemoView extends View<IStompDemoViewProps, IStompDemoViewState> {
  public state: IStompDemoViewState = {
    pingDelay: '3000',
    pingSteps: '2'
  };

  public getViewCaption(): string {
    return 'Stomp protocol';
  }

  public render() {
    return this.renderOneColumn(
      <div className="ViewBody" style={{ width: 'max-content' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            label="delay"
            value={this.state.pingDelay.toString()}
            onChange={e => this.handlePingDelayChange(e)}
          />
          <TextField
            label="steps"
            value={this.state.pingSteps.toString()}
            onChange={e => this.handlePingStepsChange(e)}
          />
          <PrimaryButton onClick={this.handlePingClick} text="SEND PING-TASK" />
          <br />
          <PrimaryButton onClick={this.handleSendQueryClick} text="SEND QUERY-TASK" disabled={!this.props.erModel} />
          <br />
          <PrimaryButton
            onClick={this.handleSendNlpQueryClick}
            text="покажи все организации из минска и пинска"
            disabled={!this.props.erModel}
          />
        </div>
      </div>
    );
  }

  private handlePingClick = () => {
    this.props.apiPing({
      payload: {
        action: TTaskActionNames.PING,
        payload: {
          delay: parseInt(this.state.pingDelay),
          steps: parseInt(this.state.pingSteps)
        }
      }
    });
  };

  private handlePingDelayChange = (event: any) => {
    this.setState({
      pingDelay: event.target.value
    });
  };

  private handlePingStepsChange = (event: any) => {
    this.setState({
      pingSteps: event.target.value
    });
  };

  private handleSendQueryClick = () => {
    if (!this.props.erModel || Object.keys(this.props.erModel.entities).length === 0) return;

    const entity = Object.values(this.props.erModel.entities)[0];
    const query = new EntityQuery(
      new EntityLink(
        entity,
        'alias',
        Object.values(entity!.attributes)
          .filter(value => value instanceof ScalarAttribute)
          .map(value => new EntityQueryField(value))
      )
    );
    this.props.apiGetData(query.inspect());
  };

  private handleSendNlpQueryClick = () => {
    const phrase = 'покажи всех организации из минска и пинска';
    const parsedPhrase = parsePhrase<RusWord>(phrase).phrase;

    if (!parsedPhrase || !this.props.erModel) return;

    let cmds: ICommand[] = [];
    try {
      cmds = new ERTranslatorRU(this.props.erModel).process(parsedPhrase);
    } catch (e) {
      this.props.onError(e);
    }

    cmds.forEach(value => {
      this.props.apiGetData(value.payload.inspect());
    });
  };
}

export { StompDemoView, IStompDemoViewProps, IStompDemoViewState };
