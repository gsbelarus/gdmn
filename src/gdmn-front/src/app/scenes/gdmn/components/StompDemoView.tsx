import React from 'react';
import { TPingTaskCmd, TTaskActionNames } from '@gdmn/server-api';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import { View } from '../../components/View';

interface IStompDemoViewState {
  pingDelay: number;
  pingSteps: number;
}

interface IStompDemoViewProps {
  log: string;
  apiPing: (cmd: TPingTaskCmd) => void;
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
    } as any); // fixme: type
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
}

export { StompDemoView, IStompDemoViewProps, IStompDemoViewState };
