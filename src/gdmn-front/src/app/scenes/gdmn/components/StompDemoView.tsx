import React from 'react';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, ScalarAttribute } from 'gdmn-orm';
import { Checkbox, ICheckbox, IToggle, Toggle } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { parsePhrase, RusWord } from 'gdmn-nlp';
import { ERTranslatorRU, ICommand } from 'gdmn-nlp-agent';

import { TPingTaskCmd, TTaskActionNames, TTaskFinishStatus, TTaskStatus } from '@gdmn/server-api';
import { NumberTextField } from '@src/app/components/NumberTextField';
import { IViewProps, View } from '@src/app/components/View';
import { apiService } from '@src/app/services/apiService';

interface IStompDemoViewState {
  stressStarted: boolean;
  stressResultTime: number;
  stressResultRequestsCount: number;
  cursorTaskId: string | undefined;
  demoTaskId: string | undefined;
  demoProgress: string | undefined;
  demoError: string | undefined;
}

interface IStompDemoViewProps extends IViewProps {
  erModel?: ERModel;
  apiPing: (cmd: TPingTaskCmd) => void;
  onError: (error: Error, meta?: any) => void;
}

class StompDemoView extends View<IStompDemoViewProps, IStompDemoViewState> {
  initPingDelay: number = 0;
  initPingSteps: number = 0;

  pingDelayFieldRef = React.createRef<NumberTextField>();
  pingStepsFieldRef = React.createRef<NumberTextField>();

  initStressStepDuration: number = 2;
  initStressStepInitRequestsCount: number = 10;
  initStressStepIncRequestsCount: number = 10;

  stressStepDurationFieldRef = React.createRef<NumberTextField>();
  stressStepInitRequestsCountFieldRef = React.createRef<NumberTextField>();
  stressStepIncRequestsCountFieldRef = React.createRef<NumberTextField>();
  stressSchedulingDateFieldRef = React.createRef<ITextField>();
  stressSequentialModeFieldRef = React.createRef<IToggle & { checked?: boolean }>(); // todo
  testChildProcFieldRef = React.createRef<ICheckbox>();

  demoTaskFieldRef = React.createRef<ICheckbox>();

  public state: IStompDemoViewState = {
    stressStarted: false,
    stressResultTime: 0,
    stressResultRequestsCount: 0,
    cursorTaskId: undefined,
    demoTaskId: undefined,
    demoProgress: undefined,
    demoError: undefined
  };

  public getViewCaption(): string {
    return 'Stomp API';
  }

  private handleDemoInterrupt = () => {
    if (!this.state.demoTaskId) {
      return;
    }

    apiService.interruptTask({
      payload: {
        action: TTaskActionNames.INTERRUPT,
        payload: {
          taskKey: this.state.demoTaskId
        }
      }
    });
  };

  private handleSendDemo = () => {
    this.setState(
      {
        demoError: undefined,
        demoProgress: undefined
      },
      () => {

        console.log('handleSendDemo');

        apiService
          .demo({
            payload: {
              action: TTaskActionNames.DEMO,
              payload: {
                withError: this.demoTaskFieldRef.current!.checked || false
              }
            }
          })
          .subscribe(res => {
            console.log(res);

            if (res.error) {
              this.setState({
                demoError: JSON.stringify(res.error)
              });
            }

            if (res.payload.status === TTaskStatus.RUNNING) {
              if (res.meta) {
                this.setState({
                  demoTaskId: res.meta.taskId
                });
              }
            }

            if (res.payload.progress) {
              this.setState({
                demoProgress: JSON.stringify(res.payload.progress)
              });
            }

            if (res.payload.status in TTaskFinishStatus) {
              this.setState({
                demoTaskId: undefined
              });

              if (res.payload.status === TTaskStatus.DONE) {
                // result = res.payload.result
              }
            }
          });
      }
    );
  };

  // stress test

  private handleStressApi = () => {
    this.stressLoop(async () => {
      return await apiService.simplePing({
        payload: {
          action: TTaskActionNames.PING,
          payload: {
            delay: parseInt(this.pingDelayFieldRef.current!.state.value),
            steps: parseInt(this.pingStepsFieldRef.current!.state.value),
            testChildProcesses: this.testChildProcFieldRef.current!.checked || false
          }
        }
      });
    });
  };

  private handleStressDb = () => {
    if (!this.props.erModel || Object.keys(this.props.erModel.entities).length === 0) {
      console.log('[test] erModel empty!');
      return;
    }

    this.stressLoop(async () => {
      const entity = Object.values(this.props.erModel!.entities)[0];
      const query = new EntityQuery(
        new EntityLink(entity, 'alias', [
          new EntityQueryField(
            Object.values(entity!.attributes)
              .filter(value => value instanceof ScalarAttribute)
              .pop()!
          )
        ])
      );

      return await apiService.query({
        payload: {
          action: TTaskActionNames.QUERY,
          payload: {
            query: query.inspect()
          }
        }
      });
    });
  };

  private stressLoop = (getTaskResult: () => Promise<any>) => {
    this.setState(
      {
        stressStarted: true,
        stressResultTime: 0,
        stressResultRequestsCount: 0
      },
      async () => {
        let maxRequestsCount: number = parseInt(this.stressStepInitRequestsCountFieldRef.current!.state.value);
        const incRequestsCount: number = parseInt(this.stressStepIncRequestsCountFieldRef.current!.state.value);
        const stepDuration: number = parseInt(this.stressStepDurationFieldRef.current!.state.value) * 1000;
        const sequentialMode: boolean = this.stressSequentialModeFieldRef.current!.checked || false;
        let schedulingDate;
        try {
          schedulingDate = new Date(this.stressSchedulingDateFieldRef.current!.value || '');
        } catch (e) {
          schedulingDate = new Date();
        }

        setTimeout(async () => {
          let timeStart;

          do {
            timeStart = window.performance.now();

            try {
              if (sequentialMode) {
                for (let i = 0; i < maxRequestsCount; i++) {
                  await getTaskResult();
                }
              } else {
                await Promise.all(new Array(maxRequestsCount).fill(0).map(() => getTaskResult()));
              }
            } catch (e) {
              console.log('d1-> error', e);
            }

            maxRequestsCount += incRequestsCount;
          } while (window.performance.now() - timeStart < stepDuration);

          const stressResultTime = window.performance.now() - timeStart;
          const stressResultRequestsCount = maxRequestsCount - incRequestsCount;

          this.setState({
            stressStarted: false,
            stressResultTime,
            stressResultRequestsCount
          });
        }, schedulingDate.getTime() - Date.now());
      }
    );
  };

  // api test

  private handleDestroyCursor = async () => {
    if (!this.state.cursorTaskId) {
      return;
    }

    await apiService.interruptTask({
      payload: {
        action: TTaskActionNames.INTERRUPT,
        payload: {
          taskKey: this.state.cursorTaskId
        }
      }
    });
  };

  private handleCreateCursor = () => {
    this.setState({
      cursorTaskId: undefined
    });

    const entity = Object.values(this.props.erModel!.entities)[0];
    const query = new EntityQuery(
      new EntityLink(entity, 'alias', [
        new EntityQueryField(
          Object.values(entity!.attributes)
            .filter(value => value instanceof ScalarAttribute)
            .pop()!
        )
      ])
    );

    apiService
      .prepareQuery({
        payload: {
          action: TTaskActionNames.PREPARE_QUERY,
          payload: {
            query: query.inspect()
          }
        }
      })
      .subscribe(value => {
        console.log('QUERY result', value);

        if (value.payload.status === TTaskStatus.RUNNING) {
          if (value.meta) {
            console.log('taskId', value.meta.taskId);

            this.setState({
              cursorTaskId: value.meta.taskId
            });
          }
        } else {
          this.setState({
            cursorTaskId: undefined
          });
        }
      });
  };

  private handleCursorNext = async () => {
    if (!this.state.cursorTaskId) {
      return;
    }

    const value = await apiService.fetchQuery({
      payload: {
        action: TTaskActionNames.FETCH_QUERY,
        payload: {
          taskKey: this.state.cursorTaskId,
          rowsCount: 1
        }
      }
    });

    if (value.payload.status === TTaskStatus.DONE) {
      console.log('data.length', value.payload.result!.data.length);
    }
  };

  private handleSendNlpQuery = async () => {
    const phrase = 'покажи всех организации из минска и пинска';
    const parsedPhrase = parsePhrase<RusWord>(phrase).phrase;

    if (!parsedPhrase || !this.props.erModel) {
      return;
    }

    let cmds: ICommand[] = [];
    try {
      cmds = new ERTranslatorRU(this.props.erModel).process(parsedPhrase);
    } catch (e) {
      this.props.onError(e);
    }

    await Promise.all(cmds.map(value => apiService.query({
        payload: {
          action: TTaskActionNames.QUERY,
          payload: {
            query: value.payload.inspect()
          }
        }
      })
    ));
  };

  public componentWillUnmount(): void {
    this.handleDestroyCursor().catch(console.error);
  }

  public render() {
    return this.renderOneColumn(
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
        <div className="ViewBody" style={{ width: 'max-content', marginTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              componentRef={this.stressSchedulingDateFieldRef}
              label="scheduling run datetime (YYYY-MM-DD HH:mm:ss)"
            />
            <NumberTextField
              ref={this.stressStepDurationFieldRef}
              initialValue={this.initStressStepDuration.toString()}
              label="step duration (seconds)"
            />
            <NumberTextField
              ref={this.stressStepInitRequestsCountFieldRef}
              label="initial requests count"
              initialValue={this.initStressStepInitRequestsCount.toString()}
            />
            <NumberTextField
              ref={this.stressStepIncRequestsCountFieldRef}
              label="increment requests count"
              initialValue={this.initStressStepIncRequestsCount.toString()}
            />
            <Toggle
              componentRef={this.stressSequentialModeFieldRef}
              label={' '}
              onText="sequential mode ON"
              offText="sequential mode OFF (concurrent requests)"
              defaultChecked={false}
            />
            <br />
            <div className="ViewBody" style={{ alignItems: 'stretch' }}>
              <NumberTextField
                ref={this.pingDelayFieldRef}
                label="delay"
                initialValue={this.initPingDelay.toString()}
              />
              <NumberTextField
                ref={this.pingStepsFieldRef}
                label="steps"
                initialValue={this.initPingSteps.toString()}
              />
              <br />
              <Checkbox componentRef={this.testChildProcFieldRef} label="test child-processes" defaultChecked={true} />
              <br />
              <PrimaryButton
                disabled={this.state.stressStarted}
                onClick={this.handleStressApi}
                text="STRESS API (PING-TASK)"
              />
            </div>
            <br />
            <div className="ViewBody" style={{ alignItems: 'stretch' }}>
              <PrimaryButton
                disabled={this.state.stressStarted || !this.props.erModel}
                onClick={this.handleStressDb}
                text="STRESS DB (QUERY-TASK)"
              />
            </div>
            <br />
            <span style={{ fontSize: 20 }}>Stress result:</span>
            <br />
            <span style={{ fontSize: 16 }}>Time (ms): {this.state.stressResultTime.toFixed()}</span>
            <span style={{ fontSize: 16 }}>Requests count: {this.state.stressResultRequestsCount}</span>
            <span style={{ fontSize: 16 }}>
              Requests count/sec:{' '}
              {this.state.stressResultRequestsCount && this.state.stressResultTime
                ? ((this.state.stressResultRequestsCount / this.state.stressResultTime) * 1000).toFixed()
                : 0}
            </span>
          </div>
        </div>
        <div>
          <div className="ViewBody" style={{ width: 'max-content', marginLeft: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <PrimaryButton onClick={this.handleSendDemo} text="CREATE DEMO-TASK" disabled={!!this.state.demoTaskId} />
              <br />
              <Checkbox componentRef={this.demoTaskFieldRef} label="with error" defaultChecked={false} />
              <br />
              <DefaultButton
                onClick={this.handleDemoInterrupt}
                text="INTERRUPT DEMO-TASK"
                disabled={!this.state.demoTaskId}
              />
              <br />
              <span style={{ fontSize: 16 }}>Progress: {this.state.demoProgress}</span>
              <br />
              <span style={{ fontSize: 16 }}>Error: {this.state.demoError}</span>
            </div>
          </div>

          <div className="ViewBody" style={{ width: 'max-content', marginLeft: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <PrimaryButton
                onClick={this.handleCreateCursor}
                text="CREATE CURSOR"
                disabled={!this.props.erModel || !!this.state.cursorTaskId}
              />
              <br />
              <DefaultButton onClick={this.handleCursorNext} text="CURSOR NEXT" disabled={!!!this.state.cursorTaskId} />
              <br />
              <DefaultButton
                onClick={this.handleDestroyCursor}
                text="DESTROY CURSOR (interrupt)"
                disabled={!!!this.state.cursorTaskId}
              />
            </div>
          </div>

          <div className="ViewBody" style={{ width: 'max-content', marginLeft: 16, marginTop: 16 }}>
            <PrimaryButton
              onClick={this.handleSendNlpQuery}
              text="покажи все организации из минска и пинска"
              disabled={!this.props.erModel}
            />
          </div>
        </div>
      </div>
    );
  }
}

export { StompDemoView, IStompDemoViewProps, IStompDemoViewState };
