import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, IEntityQueryInspector, ScalarAttribute } from 'gdmn-orm';
import { ERTranslatorRU, ICommand } from 'gdmn-nlp-agent';
import { RusPhrase } from 'gdmn-nlp';
import { TPingTaskCmd, TTaskActionNames } from '@gdmn/server-api';

import { View } from '../../components/View';

function createNlpCommand(erTranslatorRU: ERTranslatorRU, parsedTextPhrase: RusPhrase): ICommand | never {
  return erTranslatorRU.process(parsedTextPhrase);
}

interface IStompDemoViewState {
  pingDelay: number;
  pingSteps: number;
}

interface IStompDemoViewProps {
  erModel?: ERModel;
  apiPing: (cmd: TPingTaskCmd) => void;
  apiGetData: (queryInspector: IEntityQueryInspector) => void;
}

class StompDemoView extends View<IStompDemoViewProps, IStompDemoViewState> {
  public state: IStompDemoViewState = {
    pingDelay: 3000,
    pingSteps: 2
  };

  public getViewCaption(): string {
    return 'Stomp protocol';
  }

  public render() {
    return this.renderOneColumn(
      <div className="ViewBody">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <TextField label="delay" value={this.state.pingDelay.toString()} onChange={this.handlePingDelayChange} />
            <TextField label="steps" value={this.state.pingSteps.toString()} onChange={this.handlePingStepsChange} />
            <PrimaryButton onClick={this.handlePingClick} text="SEND PING-TASK" />
          </div>
          <div>
            <PrimaryButton onClick={this.handleSendQueryClick} text="SEND QUERY-TASK" disabled={!this.props.erModel} />
          </div>
        </div>
      </div>
    );
  }

  private handlePingClick = () => {
    this.props.apiPing({
      payload: {
        action: TTaskActionNames.PING,
        payload: {
          delay: this.state.pingDelay,
          steps: this.state.pingSteps
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
    // -- BEGIN
    if (!this.props.erModel || Object.keys(this.props.erModel.entities).length === 0) return;
    console.log('handleSendQueryClick');
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
    // -- END

    /*
    // -- BEGIN
    const phrase = 'покажи все организации и школы из минска и пинска';
    const parsedPhrase = parsePhrase<RusWord>(phrase).phrase;

    if (!parsedPhrase || !this.props.erModel) return;

    const erTranslatorRU = new ERTranslatorRU(this.props.erModel);
    try {
      const nlpCmd: ICommand = createNlpCommand(erTranslatorRU, parsedPhrase);
      const queries = EQueryTranslator.process(nlpCmd);

        queries.map(query => {
          this.props.apiGetData(query.inspect()); // query.serialize());
        })
    } catch (e) {
      console.log('createCommand() error:', e);
    }
    // -- END
    */
  };
}

export { StompDemoView, IStompDemoViewProps, IStompDemoViewState };
