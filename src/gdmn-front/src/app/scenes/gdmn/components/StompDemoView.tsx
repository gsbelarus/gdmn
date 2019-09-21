import React from 'react';
import { EntityLink, EntityLinkField, EntityQuery, ERModel, ScalarAttribute } from 'gdmn-orm';
import { Checkbox, ICheckbox, IToggle, Toggle } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { parsePhrase, RusWord, RusPhrase } from 'gdmn-nlp';
import { ERTranslatorRU, ICommand } from 'gdmn-nlp-agent';

import { TPingTaskCmd, TTaskStatus } from '@gdmn/server-api';
import { NumberTextField } from '@src/app/components/NumberTextField';
import { IViewProps, View } from '@src/app/components/View';
import { apiService } from '@src/app/services/apiService';

export interface IStompDemoViewState {
  stressStarted: boolean;
  stressResultTime: number;
  stressResultRequestsCount: number;
  cursor?: {
    taskKey?: string;
  };
  demo?: {
    taskKey?: string;
    progress?: string;
  };
}

export interface IStompDemoViewProps extends IViewProps {
  erModel?: ERModel;
  apiPing: (cmd: TPingTaskCmd) => void;
  onError: (error: Error, meta?: any) => void;
}

export class StompDemoView extends View<IStompDemoViewProps, IStompDemoViewState> {
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
    cursor: undefined,
    demo: undefined
  };

  public getViewCaption(): string {
    return 'Stomp API';
  }

  private handleDemoInterrupt = async () => {
    if (!this.state.demo || !this.state.demo.taskKey) {
      return;
    }

    await apiService.interruptTask({
      taskKey: this.state.demo.taskKey
    });
  };

  private handleSendDemo = () => {
    this.setState({demo: {}},
      () => {

        console.log('handleSendDemo');

        apiService
          .demo({
            withError: this.demoTaskFieldRef.current!.checked || false
          })
          .subscribe(res => {
            switch (res.payload.status) {
              case TTaskStatus.RUNNING: {
                this.setState({
                  demo: {
                    ...this.state.demo,
                    taskKey: res.meta && res.meta.taskKey,
                    progress: res.payload.progress && `${res.payload.progress.min}-${res.payload.progress.max}; ` +
                      `current: ${res.payload.progress.value}; description: ${res.payload.progress.description}`
                  }
                });
                break;
              }
              case TTaskStatus.INTERRUPTED: // work with interrupted status if needed
              case TTaskStatus.FAILED: // work with error if needed
              case TTaskStatus.SUCCESS: {  // work with result
                this.setState({demo: undefined});
                break;
              }
            }
          });
      }
    );
  };

  // stress test

  private handleStressApi = () => {
    this.stressLoop(async () => {
      await apiService.simplePing({
        delay: parseInt(this.pingDelayFieldRef.current!.state.value),
        steps: parseInt(this.pingStepsFieldRef.current!.state.value),
        testChildProcesses: this.testChildProcFieldRef.current!.checked || false
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
          new EntityLinkField(
            Object.values(entity!.attributes)
              .filter(value => value instanceof ScalarAttribute)
              .pop()!
          )
        ])
      );

      return await apiService.query({
        query: query.inspect()
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
    if (!this.state.cursor || !this.state.cursor.taskKey) {
      return;
    }

    await apiService.interruptTask({
      taskKey: this.state.cursor.taskKey
    });
  };

  private handleCreateCursor = () => {
    this.setState({cursor: {}});

    const entity = Object.values(this.props.erModel!.entities)[0];
    const query = new EntityQuery(
      new EntityLink(entity, 'alias', [
        new EntityLinkField(
          Object.values(entity!.attributes)
            .filter(value => value instanceof ScalarAttribute)
            .pop()!
        )
      ])
    );

    apiService
      .prepareQuery({
        query: query.inspect()
      })
      .subscribe(value => {
        console.log('QUERY result', value);

        switch (value.payload.status) {
          case TTaskStatus.RUNNING: {
            this.setState({
              cursor: {
                ...this.state.cursor,
                taskKey: value.meta && value.meta.taskKey
              }
            });
            break;
          }
          case TTaskStatus.INTERRUPTED:
          case TTaskStatus.FAILED:
          case TTaskStatus.SUCCESS: {
            this.setState({cursor: undefined});
            break;
          }
        }
      });
  };

  private handleCursorNext = async () => {
    if (!this.state.cursor || !this.state.cursor.taskKey) {
      return;
    }

    const value = await apiService.fetchQuery({
      taskKey: this.state.cursor.taskKey,
      rowsCount: 1
    });

    if (value.payload.status === TTaskStatus.SUCCESS) {
      console.log('data.length', value.payload.result!.data.length);
    }
  };

  private handleSendNlpQuery = async () => {
    const phrase = 'покажи всех организации из минска и пинска';
    const parsedPhrase = parsePhrase<RusWord>(phrase);

    if (!parsedPhrase || !this.props.erModel) {
      return;
    }

    let cmds: ICommand[] = [];
    try {
      cmds = new ERTranslatorRU(this.props.erModel).process(parsedPhrase.map(item => item.phrase).reduce((phrases, item) => item ? [...phrases, item as RusPhrase] : phrases, [] as RusPhrase[]));
    } catch (e) {
      this.props.onError(e);
    }

    await Promise.all(
      cmds.map(value => apiService.query({
        query: value.payload.inspect()
      }))
    );
  };

  public componentWillUnmount(): void {
    this.handleDestroyCursor().catch(console.error);
    this.handleDemoInterrupt().catch(console.error);
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
              <PrimaryButton onClick={this.handleSendDemo} text="CREATE DEMO-TASK" disabled={!!this.state.demo} />
              <br />
              <Checkbox
                componentRef={this.demoTaskFieldRef}
                label="with error"
                defaultChecked={false}
                disabled={!!this.state.demo}
              />
              <br />
              <DefaultButton
                onClick={this.handleDemoInterrupt}
                text="INTERRUPT DEMO-TASK"
                disabled={!this.state.demo || !this.state.demo.taskKey}
              />
              <br />
              <span style={{ fontSize: 16 }}>Progress: {this.state.demo && this.state.demo.progress}</span>
            </div>
          </div>

          <div className="ViewBody" style={{ width: 'max-content', marginLeft: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <PrimaryButton
                onClick={this.handleCreateCursor}
                text="CREATE CURSOR"
                disabled={!this.props.erModel || !!this.state.cursor}
              />
              <br />
              <DefaultButton
                onClick={this.handleCursorNext}
                text="CURSOR NEXT"
                disabled={!this.state.cursor || !this.state.cursor.taskKey}
              />
              <br />
              <DefaultButton
                onClick={this.handleDestroyCursor}
                text="DESTROY CURSOR (interrupt)"
                disabled={!this.state.cursor || !this.state.cursor.taskKey}
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
