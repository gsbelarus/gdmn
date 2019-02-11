import React from 'react';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { filter, first } from 'rxjs/operators';
import { Checkbox, ICheckbox, IToggle, Toggle } from 'office-ui-fabric-react';
import { Observable } from 'rxjs';

import { EntityLink, EntityQuery, EntityQueryField, ERModel, ScalarAttribute } from 'gdmn-orm';
import { parsePhrase, RusWord } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { ICommand } from 'gdmn-nlp-agent/dist/definitions';
import { TPingTaskCmd, TTaskActionNames, TTaskStatus } from '@gdmn/server-api';
import { IViewProps, View } from '@src/app/components/View';
import { NumberTextField } from '@src/app/components/NumberTextField';
import { apiService } from '@src/app/services/apiService';

const EndTaskStatuses = [TTaskStatus.DONE, TTaskStatus.ERROR, TTaskStatus.INTERRUPTED];

interface IStompDemoViewState {
  stressStarted: boolean;
  stressResultTime: number;
  stressResultRequestsCount: number;
  sendQueryLoading: boolean;
  loadingQueryTaskId: string | undefined;
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

  public state: IStompDemoViewState = {
    stressStarted: false,
    stressResultTime: 0,
    stressResultRequestsCount: 0,
    sendQueryLoading: false,
    loadingQueryTaskId: undefined
  };

  public getViewCaption(): string {
    return 'Stomp protocol';
  }

  // stress test

  private handleStressApi = () => {
    this.stressLoop(() => {
      return apiService.ping({
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

    this.stressLoop(() => {
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

      return apiService.getData({
        payload: {
          action: TTaskActionNames.QUERY,
          payload: query.inspect()
        }
      });
    });
  };

  private stressLoop = (getTaskResultObservable: () => Observable<any>) => {
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
            // console.log('do')
            timeStart = window.performance.now();

            try {
              if (sequentialMode) {
                for (let i = 0; i < maxRequestsCount; i++) {
                  await getTaskResultObservable()
                    .pipe(
                      filter(
                        value => Reflect.has(value.payload, 'result') && EndTaskStatuses.includes(value.payload.status)
                      ),
                      first()
                    )
                    .toPromise();
                }
              } else {
                await Promise.all(
                  new Array(maxRequestsCount).fill(0).map(() =>
                    getTaskResultObservable()
                      .pipe(
                        filter(
                          value =>
                            Reflect.has(value.payload, 'result') && EndTaskStatuses.includes(value.payload.status)
                        ),
                        first()
                      )
                      .toPromise()
                  )
                );
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

  private handleSendQuery = () => {
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

    apiService
      .getData({
        payload: {
          action: TTaskActionNames.QUERY,
          payload: query.inspect()
        }
      })
      .subscribe(value => {
        if (value.error || value.payload.status === TTaskStatus.RUNNING) {
          this.setState({
            sendQueryLoading: true,
            loadingQueryTaskId: value.meta && value.meta.taskId ? value.meta.taskId : undefined
          });
        } else if (!!value.payload.status) {
          this.setState({
            sendQueryLoading: false,
            loadingQueryTaskId: undefined
          });
        }
      });
  };

  private handleInterruptQueryTask = async () => {
    if (!!!this.state.loadingQueryTaskId) return;

    await apiService.interruptTask({
      payload: {
        action: TTaskActionNames.INTERRUPT,
        payload: {
          taskKey: this.state.loadingQueryTaskId
        }
      }
    });

    this.setState({
      sendQueryLoading: false,
      loadingQueryTaskId: undefined
    });
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
      apiService.getData({
        payload: {
          action: TTaskActionNames.QUERY,
          payload: value.payload.inspect()
        }
      });
    });
  };

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
        <div className="ViewBody" style={{ width: 'max-content', marginLeft: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PrimaryButton onClick={this.handleSendQuery} text="SEND QUERY-TASK" disabled={!this.props.erModel} />
            <br />
            <DefaultButton
              onClick={this.handleInterruptQueryTask}
              text="INTERRUPT QUERY-TASK"
              disabled={!!!this.state.loadingQueryTaskId}
            />
            <br />
            <br />
            <PrimaryButton
              onClick={this.handleSendNlpQueryClick}
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
