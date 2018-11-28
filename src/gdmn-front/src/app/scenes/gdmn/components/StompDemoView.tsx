import React, { PureComponent } from 'react';
import { TPingTaskCmd, TTaskActionNames } from '@gdmn/server-api';
import { Button, TextField } from 'office-ui-fabric-react';

interface IStompDemoViewState {
  pingDelay: number;
  pingSteps: number;
}

interface IStompDemoViewProps {
  log: string;
  apiPing: (cmd: TPingTaskCmd) => void;
}

class StompDemoView extends PureComponent<IStompDemoViewProps, IStompDemoViewState> {
  public state: IStompDemoViewState = {
    pingDelay: 3000,
    pingSteps: 2
  };

  public render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <TextField label="delay" value={this.state.pingDelay.toString()} onChange={this.handlePingDelayChange} />
          <TextField label="steps" value={this.state.pingSteps.toString()} onChange={this.handlePingStepsChange} />
          <Button onClick={this.handlePingClick} text="SEND PING-TASK" />
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
