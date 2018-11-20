import React, { PureComponent } from 'react';
import { Button, TextField } from '@material-ui/core';
import { TTaskActionNames } from '@gdmn/server-api';

interface IStompDemoViewState {
  pingDelay: number;
  pingSteps: number;
}

interface IStompDemoViewProps {
  log: string;
  apiPing: (command: any) => void;
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
          <Button style={{ marginRight: 18 }} variant="contained" size="small" onClick={this.handlePingClick}>
            SEND PING-TASK
          </Button>
          <TextField
            style={{ marginRight: 18 }}
            label="delay"
            value={this.state.pingDelay}
            onChange={this.handlePingDelayChange}
            margin="normal"
          />
          <TextField
            label="steps"
            multiline={true}
            value={this.state.pingSteps}
            onChange={this.handlePingStepsChange}
            margin="normal"
          />
        </div>
        {/*<textarea*/}
          {/*style={{ width: '100%', minHeight: 300, resize: 'vertical', marginTop: 20, marginBottom: 20 }}*/}
          {/*disabled={true}*/}
          {/*value={this.props.log}*/}
        {/*/>*/}
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
      } as any // fixme: type
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
}

export { StompDemoView, IStompDemoViewProps, IStompDemoViewState };
