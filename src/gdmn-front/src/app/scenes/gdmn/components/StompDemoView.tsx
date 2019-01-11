import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, IEntityQueryInspector, ScalarAttribute } from 'gdmn-orm';
import { parsePhrase, RusWord } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { ICommand } from 'gdmn-nlp-agent/dist/definitions';
import { TPingTaskCmd, TTaskActionNames, TTaskStatus } from '@gdmn/server-api';

import { IViewProps, View } from '@src/app/components/View';
import { NumberTextField } from '@src/app/components/NumberTextField';
import { apiService } from '@src/app/services/apiService';
import { filter, first } from 'rxjs/operators';
// import { queue } from 'rxjs/internal/scheduler/queue';
// import { asyncScheduler, interval } from 'rxjs';
// import { async } from 'rxjs/internal/scheduler/async';
// import { asap } from 'rxjs/internal/scheduler/asap';

interface IStompDemoViewState {
  /* ping */
  pingDelay: string;
  pingSteps: string;
  /* stress */
  stressStarted: boolean;
  stressResultTime: number;
  stressResultRequestsCount: number;
}

interface IStompDemoViewProps extends IViewProps {
  erModel?: ERModel;
  apiPing: (cmd: TPingTaskCmd) => void;
  apiGetData: (queryInspector: IEntityQueryInspector) => void;
  onError: (error: Error, meta?: any) => void;
}

class StompDemoView extends View<IStompDemoViewProps, IStompDemoViewState> {
  initStressStepDuration: number = 2;
  initStressStepInitRequestsCount: number = 10;
  initStressStepIncRequestsCount: number = 10;

  stressStepDurationFieldRef = React.createRef<NumberTextField>();
  stressStepInitRequestsCountFieldRef = React.createRef<NumberTextField>();
  stressStepIncRequestsCountFieldRef = React.createRef<NumberTextField>();

  // requestsCount: number = 0;
  // responseCount: number = 0;

  public state: IStompDemoViewState = {
    pingDelay: '3000',
    pingSteps: '2',
    stressStarted: false,
    stressResultTime: 0,
    stressResultRequestsCount: 0
  };

  public getViewCaption(): string {
    return 'Stomp protocol';
  }

  private handleStressApi = () => {
    this.stressLoop((resolve: any) => {
      //-//console.log('[test] stressLoop')
      apiService
        .ping({
          payload: {
            action: TTaskActionNames.PING,
            payload: {
              delay: 0,
              steps: 0
            }
          }
        })
        .pipe(
          filter(value => Reflect.has(value.payload, 'result') && value.payload.status === TTaskStatus.DONE),
          first()
          // observeOn(async)
        )
        .subscribe(value => {
          //-//console.log('[test] result', value);
          // this.responseCount++;

          resolve();
        });
    });
  };

  private handleStressDb = () => {
    this.stressLoop((resolve: any, reject: any) => {
      if (!this.props.erModel || Object.keys(this.props.erModel.entities).length === 0) {
        reject(new Error('[test] erModel empty!'));
        return;
      }

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
        .pipe(
          filter(value => Reflect.has(value.payload, 'result') && value.payload.status === TTaskStatus.DONE),
          first()
        )
        .subscribe(value => {
          //-//console.log('[test] result', value);
          // this.responseCount++;

          resolve();
        });
    });
  };

  // private handleStopStress = () => {
  //   this.setState({
  //     stressStarted: false
  //   });
  // };

  private stressLoop = (cb: Function) => {
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

        // interval(stepDuration * 1000)
        //   .pipe(
        //     takeWhile(() => this.state.stressStarted),
        //     observeOn(asap)
        //   )
        //   .subscribe(() => {
        //     //-//console.log('[test] setInterval');
        //     if (this.responseCount < this.requestsCount) {
        //       //-//console.log('[test] setInterval: stop');
        //       this.setState({
        //         stressStarted: false
        //       });
        //     }
        //   });

        let timeStart;

        do {
          //-//console.log('[test] do');
          timeStart = window.performance.now();

          await Promise.all(
            new Array(maxRequestsCount).fill(0).map(
              value =>
                new Promise((resolve, reject) => {
                  //-//console.log('[test] Promise');
                  // cb(resolve);
                  setTimeout(() => cb(resolve, reject), 0);
                })
            )
          );

          maxRequestsCount += incRequestsCount;
        } while (window.performance.now() - timeStart < stepDuration);

        const stressResultTime = window.performance.now() - timeStart;
        const stressResultRequestsCount = maxRequestsCount - incRequestsCount;

        // this.responseCount = 0;
        // this.requestsCount = 0;

        this.setState({
          stressStarted: false,
          stressResultTime,
          stressResultRequestsCount
        });

        // const f = () => {
        //   //-//console.log('[test] requestsCount: ', this.requestsCount);
        //   //-//console.log('[test] responseCount: ', this.responseCount);
        //
        //   if (this.requestsCount < maxRequestsCount) {
        //     //-//console.log('[test] do');
        //
        //     cb();
        //
        //     this.requestsCount++; // todo
        //   } else if (this.responseCount >= this.requestsCount) {
        //     /* add step*/
        //     maxRequestsCount += incRequestsCount;
        //
        //     //-//console.log(
        //       '[test] step: ',
        //       (maxRequestsCount - parseInt(this.stressStepInitRequestsCountFieldRef.current!.state.value)) /
        //         incRequestsCount
        //     );
        //   }
        //
        //   if (this.state.stressStarted) {
        //     setTimeout(() => {
        //       f();
        //     }, 0);
        //   } else {
        //     //-//console.log('[test] clearInterval');
        //
        //     this.responseCount = 0;
        //     this.requestsCount = 0;
        //
        //     this.setState({
        //       stressStarted: false
        //     });
        //   }
        // };
        //
        // f();
      }
    );
  };

  public render() {
    return this.renderOneColumn(
      <div>
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
        <div className="ViewBody" style={{ width: 'max-content', marginTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            <br />
            <PrimaryButton
              disabled={this.state.stressStarted}
              onClick={this.handleStressApi}
              text="STRESS API (PING-TASK)"
            />
            <br />
            <PrimaryButton
              disabled={this.state.stressStarted || !this.props.erModel}
              onClick={this.handleStressDb}
              text="STRESS DB (QUERY-TASK)"
            />
            {/*<br />*/}
            {/*<PrimaryButton disabled={!this.state.stressStarted} onClick={this.handleStopStress} text="STOP STRESS" />*/}

            <br />
            <span style={{ fontSize: 20 }}>Stress result:</span>
            <br />
            <span style={{ fontSize: 16 }}>Time (ms): {this.state.stressResultTime.toFixed()}</span>
            <span style={{ fontSize: 16 }}>Requests count: {this.state.stressResultRequestsCount}</span>
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
          delay: parseInt(this.state.pingDelay),
          steps: parseInt(this.state.pingSteps)
        }
      }
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

  // todo refs

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
