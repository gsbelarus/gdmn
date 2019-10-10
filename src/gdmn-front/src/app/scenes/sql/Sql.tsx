import { createGrid, deleteGrid, GDMNGrid } from 'gdmn-grid';
import { IEntityInsertFieldInspector } from 'gdmn-orm';
import { IDataRow, RecordSet, rsActions, TFieldType } from 'gdmn-recordset';
import { List } from 'immutable';
import { CommandBar, ICommandBarItemProps, TextField, Text } from 'office-ui-fabric-react';
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import CSSModules from 'react-css-modules';
import { v1 } from 'uuid';

import { TTaskStatus } from '@gdmn/server-api';
import { apiService } from '@src/app/services/apiService';
import { rsMetaActions } from '@src/app/store/rsmeta';

import { bindGridActions } from '../ermodel/utils';
import { gdmnActions } from '../gdmn/actions';
import { HistoryDialogContainer } from './HistoryDialog/HistoryDialogContainer';
import { ParamsDialog } from './ParamsDialog';
import { PlanDialog } from './PlanDialog';
import { ISQLProps } from './Sql.types';
import styles from './styles.css';
import { sql2fd, sqlParams2params } from './utils';
import { SplitView } from './SplitView';

export interface ISQLField {
  name: string,
  type: TFieldType;
  value?: any;
}

export interface INamedParams {
  [alias: string]: any;
}

interface ISQLViewState {
  expression: string;
  paramList: ISQLField[];
  fieldList: ISQLField[];
  params: INamedParams;
  plan: string;
  viewMode: 'horizontal' | 'vertical';
  showParams: boolean;
  showPlan: boolean;
  showHistory: boolean;
}

type Action =
  | { type: 'INIT'; state: ISQLViewState }
  | { type: 'CHANGE_VIEW' }
  | { type: 'SET_EXPRESSION'; expression: string }
  | { type: 'CLEAR_EXPRESSION' }
  | { type: 'LOAD_PARAMS'; paramList: ISQLField[], fieldList: ISQLField[] }
  | { type: 'SET_PARAMS'; params: INamedParams }
  | { type: 'SHOW_PARAMS'; showParams: boolean }
  | { type: 'SET_PLAN'; plan: string }
  | { type: 'SHOW_PLAN'; showPlan: boolean }
  | { type: 'SHOW_HISTORY'; showHistory: boolean };

function reducer(state: ISQLViewState, action: Action): ISQLViewState {
  switch (action.type) {
    case 'INIT':
      return action.state;
    case 'SET_EXPRESSION':
      return { ...state, expression: action.expression, fieldList: [], params: {} };
    case 'SET_PLAN':
      return { ...state, plan: action.plan};
    case 'CLEAR_EXPRESSION':
      return { ...state, expression: '', paramList: [], fieldList: [], params: {} };
    case 'SHOW_PARAMS':
      return { ...state, showParams: action.showParams };
    case 'LOAD_PARAMS':
        return { ...state, paramList: action.paramList, fieldList: action.fieldList };
    case 'SET_PARAMS':
      return { ...state, params: action.params };
    case 'SHOW_PLAN':
      return { ...state, showPlan: action.showPlan };
    case 'CHANGE_VIEW':
      return { ...state, viewMode: state.viewMode === 'horizontal' ? 'vertical' : 'horizontal' };
    case 'SHOW_HISTORY':
      return { ...state, showHistory: action.showHistory };
    default:
      return state;
  }
}

const initialState: ISQLViewState = {
  expression: 'select * from gd_good where name = :name',
  plan: '',
  params: {}, /* {name: 'Золото'}, */
  paramList: [], /* [{name: 'name', type: TFieldType.String, value: 'Зотоло'}], */
  fieldList: [],
  viewMode: 'vertical',
  showPlan: false,
  showParams: false,
  showHistory: false
};

export const Sql = CSSModules(
  (props: ISQLProps): JSX.Element => {
    const { url, viewTab, dispatch, rs, gcs, id, history, gridColors } = props;

    const [state, setState] = useReducer(reducer, initialState);

    const refState = useRef(state);
    const isMounted = useRef(false);

    const addNewSql = useCallback(() => {
      const id = v1();
      history.push(`/spa/gdmn/sql/${id}`);
    }, []);

    useEffect(() => {
      isMounted.current = true;

      if (viewTab && viewTab.sessionData) {
        setState({
          type: 'INIT',
          state: viewTab.sessionData.state
        });
      }

      return () => {
        dispatch(
          gdmnActions.saveSessionData({
            viewTabURL: url,
            sessionData: { state: refState.current }
          })
        );
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      refState.current = state;
    }, [state]);

    useEffect(() => {
      if (rs) {
        if (viewTab && (!viewTab.rs || !viewTab.rs.length)) {
          dispatch(
            gdmnActions.updateViewTab({
              url,
              viewTab: {
                rs: [rs.name]
              }
            })
          );
        } else if (!viewTab) {
          dispatch(
            gdmnActions.addViewTab({
              url,
              caption: 'SQL',
              canClose: true,
              rs: [rs.name]
            })
          );
        }
      } else {
        if (!viewTab) {
          dispatch(
            gdmnActions.addViewTab({
              url,
              caption: 'SQL',
              canClose: true
            })
          );
        }
      }
    }, [rs, viewTab]);

    useEffect(() => {
      // Создаём грид из RS
      if (!gcs && rs) {
        dispatch(
          createGrid({
            name: id,
            columns: rs.fieldDefs.map(fd => ({
              name: fd.fieldName,
              caption: [fd.caption || fd.fieldName],
              fields: [{ ...fd }],
              width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
            })),
            leftSideColumns: 0,
            rightSideColumns: 0,
            hideFooter: true
          })
        );
      }
    }, [rs]);

    useEffect(()=>{
      if (!(Object.entries(state.params).length === 0 && state.params.constructor === Object)) executeSql();
    }, [state.params])

    const handleClosePlan = () => setState({ type: 'SHOW_PLAN', showPlan: false });

    const handleCloseParams = () => setState({ type: 'SHOW_PARAMS', showParams: false });

    const handleSaveParams = (paramList: ISQLField[]) => {
      setState({ type: 'SHOW_PARAMS', showParams: false});
      setState({ type: 'LOAD_PARAMS', ...state, paramList });

      const params = paramList.reduce((map, obj) => {
        map[obj.name] = obj.type = 5 ? new Date(obj.value) : obj.value || '';
        return map
      }, {} as {[x:string]: any});
      setState({ type: 'SET_PARAMS', params });
    }

    const handleCloseHistory = () => setState({ type: 'SHOW_HISTORY', showHistory: false });

    const handleSelectExpression = (expression: string) => {
      setState({ type: 'SHOW_HISTORY', showHistory: false });
      setState({ type: 'SET_EXPRESSION', expression });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'F9':
            handleRunExecuteSql();
          break;
        default:
          return;
        }
        e.preventDefault();
        e.stopPropagation();
    }

    const handleRunExecuteSql = useCallback(() => {
      dispatch(async (dispatch, getState) => {
        dispatch(rsMetaActions.setRsMeta(id, {}));

        apiService
          .sqlPrepare({
            sql: state.expression
          })
          .subscribe(async value => {
            switch (value.payload.status) {
              case TTaskStatus.RUNNING: {
                const taskKey = value.meta!.taskKey!;

                if (!getState().rsMeta[id]) {
                  console.warn('ViewTab was closing, interrupt task');
                  apiService.interruptTask({ taskKey }).catch(console.error);
                  return;
                }
                dispatch(rsMetaActions.setRsMeta(id, { taskKey }));
              }
              case TTaskStatus.INTERRUPTED:
              case TTaskStatus.FAILED: {
                if (getState().rsMeta[id]) {
                  dispatch(rsMetaActions.setRsMeta(id, {}));
                }
                /*
                  Логика при ошибке получения данных с свервера
                    1) Очищаем предыдущий план (возможно, до обращения к серверу надо очищать)
                */
                setState({ type: 'SET_PLAN', plan: '' });
                break;
              }
              case TTaskStatus.SUCCESS: {
                /*
                  Логика при получении данных с свервера
                    1) Обновляем план
                    2) Сохраняем параметры (предусмотреть вариант без очистки предыдущих значений
                       параметров. Например, добвили новый параметр => в старых параметрах надо сохранить значения)
                    3) Список выходных полей перезаписываем
                */
                const newParams = (value.payload.result!.paramList || [])
                  .map(i => sqlParams2params({name: i.name, type: i.type}))

                const paramList = [
                    ...state.paramList.filter(opk => newParams.find(i => opk.name === i.name)),
                    ...newParams.filter(npk => !state.paramList.find(i => npk.name === i.name))
                ];

                const fieldList  = (value.payload.result!.fieldList || [])
                  .map(i => sqlParams2params({name: i.name, type: i.type}))

                if (getState().rsMeta[id]) {
                  dispatch(rsMetaActions.setRsMeta(id, {}));
                }
                setState({ type: 'SET_PLAN', plan: value.payload.result!.plan || ''});
                setState({ type: 'LOAD_PARAMS', paramList, fieldList});

                if (paramList.length === 0) {
                  // Если нет параметров в запросе то сразу выполняем sql зпрос
                  executeSql();
                } else {
                  setState({ type: 'SHOW_PARAMS', showParams: true});
                }

                break;
              }
            }
          });
          return;
      })
    }, [state]);

    const executeSql = useCallback(() => {
      dispatch(async (dispatch, getState) => {

        dispatch(rsMetaActions.setRsMeta(id, {}));

        apiService
          .prepareSqlQuery({
            select: state.expression,
            params: state.params
          })
          .subscribe(async value => {
            switch (value.payload.status) {
              case TTaskStatus.RUNNING: {
                const taskKey = value.meta!.taskKey!;

                if (!getState().rsMeta[id]) {
                  console.warn('ViewTab was closing, interrupt task');
                  apiService.interruptTask({ taskKey }).catch(console.error);
                  return;
                }
                dispatch(rsMetaActions.setRsMeta(id, { taskKey }));

                const response = await apiService.fetchSqlQuery({
                  rowsCount: 100,
                  taskKey
                });

                const rsm = getState().rsMeta[id];
                if (!rsm) {
                  console.warn('ViewTab was closed, interrupt task');
                  apiService.interruptTask({ taskKey }).catch(console.error);
                  return;
                }

                switch (response.payload.status) {
                  case TTaskStatus.SUCCESS: {
                    const fieldDefs = Object.entries(response.payload.result!.aliases).map(([fieldAlias, data]) =>
                      sql2fd(fieldAlias, data)
                    );

                    const rs = RecordSet.create({
                      name: id,
                      fieldDefs,
                      data: List(response.payload.result!.data as IDataRow[]),
                      sequentially: !!rsm.taskKey,
                      sql: {
                        select: state.expression,
                        params: state.params
                      }
                    });

                    if (getState().grid[id]) {
                      dispatch(deleteGrid({ name: id }));
                    }
                    if (getState().recordSet[id]) {
                      dispatch(rsActions.setRecordSet(rs));
                    } else {
                      dispatch(rsActions.createRecordSet({ name: rs.name, rs }));
                    }

                    // Сохраняем SQL в историю запросов
                    const fields: IEntityInsertFieldInspector[] = [
                      {
                        attribute: 'SQL_TEXT',
                        value: state.expression
                      },
                      {
                        attribute: 'CREATORKEY',
                        value: 650002
                      },
                      {
                        attribute: 'EDITORKEY',
                        value: 650002
                      }
                    ];

                    const insertResponse = await apiService.insert({
                      insert: {
                        entity: 'TgdcSQLHistory',
                        fields
                      }
                    });

                    if (insertResponse.error) {
                      dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: insertResponse.error.message } }));
                      return;
                    }

                    break;
                  }
                  case TTaskStatus.FAILED: {
                    if (rsm) {
                      dispatch(rsMetaActions.setRsMeta(id, {}));
                    }
                    break;
                  }
                  case TTaskStatus.INTERRUPTED:
                  case TTaskStatus.PAUSED:
                  default:
                    throw new Error('Never thrown');
                }
                break;
              }
              case TTaskStatus.INTERRUPTED:
              case TTaskStatus.FAILED: {
                if (getState().rsMeta[id]) {
                  dispatch(rsMetaActions.setRsMeta(id, {}));
                }
                break;
              }
              case TTaskStatus.SUCCESS: {
                if (getState().rsMeta[id]) {
                  dispatch(rsMetaActions.setRsMeta(id, {}));
                }
                break;
              }
              case TTaskStatus.PAUSED:
              default: {
                throw new Error('Unsupported');
              }
            }
          });
      });

    }, [state]);

    const commandBarItems: ICommandBarItemProps[] = useMemo(
      () => [
        {
          key: 'add',
          text: 'Новый',
          iconProps: {
            iconName: 'Add'
          },
          onClick: addNewSql
        },
        {
          key: 'clear',
          text: 'Очистить',
          disabled: !state.expression || !state.expression.length,
          iconProps: {
            iconName: 'ClearFormatting'
          },
          onClick: () => setState({ type: 'CLEAR_EXPRESSION' })
        },
        {
          key: 'execute',
          text: 'Выполнить',
          disabled: !state.expression || !state.expression.length,
          iconProps: {
            iconName: 'Play'
          },
          onClick: handleRunExecuteSql
        },
        {
          key: 'plan',
          text: 'План запроса',
          disabled: state.plan === '',
          iconProps: {
            iconName: 'OpenSource'
          },
          onClick: () => setState({ type: 'SHOW_PLAN', showPlan: true })
        },
/*         {
          key: 'params',
          text: 'Параметры запроса',
          disabled: state.paramList.length === 0,
          iconProps: {
            iconName: 'OpenSource'
          },
          onClick: () => setState({ type: 'SHOW_PARAMS', showParams: true })
        },
 */        {
          key: 'histoty',
          text: 'История',
          iconProps: {
            iconName: 'FullHistory'
          },
          onClick: () => setState({ type: 'SHOW_HISTORY', showHistory: true })
        },
        {
          key: 'form-view',
          text: 'Вид',
          iconProps: {
            iconName: 'ViewAll2'
          },
          onClick: () => {
            setState({ type: 'CHANGE_VIEW' });
          }
        }
      ],
      [state, rs]
    );

    const { ...gridActions } = bindGridActions(dispatch);

    return (
      <>
        {state.showParams && state.expression.length > 0 && (
          <ParamsDialog params={state.paramList} onClose={handleCloseParams} onSave={handleSaveParams}/>
        )}
        {state.showPlan && state.plan.length > 0 && (
          <PlanDialog plan={state.plan} onClose={handleClosePlan} />
        )}
        {state.showHistory && (
          <HistoryDialogContainer
            id={`dialog${id}`}
            onClose={handleCloseHistory}
            onSelect={handleSelectExpression}
          />
        )}
        <CommandBar items={commandBarItems} />
        <SplitView split={state.viewMode} border marginLeft>
          <div onKeyDown={handleKeyDown}>
            <TextField
              style={{height: state.viewMode === 'horizontal' ? 'calc(100vh - 180px)' : ''}}
              name="sql-expression"
              resizable={false}
              multiline
              rows={10}
              value={state.expression}
              onChange={(_e, newValue?: string) => {
                if (newValue !== undefined) {
                  setState({ type: 'SET_EXPRESSION', expression: newValue || '' });
                }
              }}
            />
            <Text block>{state.plan}</Text>
          </div>
          {rs && gcs && <GDMNGrid {...gcs} rs={rs} {...gridActions} colors={gridColors}/>}
        </SplitView>
      </>
    );
  },
  styles,
  { allowMultiple: true }
);
