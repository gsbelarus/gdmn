import { createGrid, deleteGrid, GDMNGrid, setCursorCol, TSetCursorPosEvent } from 'gdmn-grid';
import { IDataRow, RecordSet, rsActions, TFieldType } from 'gdmn-recordset';
import { List } from 'immutable';
import { CommandBar, ICommandBarItemProps, TextField } from 'office-ui-fabric-react';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import CSSModules from 'react-css-modules';

import { TTaskStatus } from '@gdmn/server-api';
import { apiService } from '@src/app/services/apiService';
import { rsMetaActions } from '@src/app/store/rsmeta';

import { gdmnActions } from '../gdmn/actions';
import { ISqlProps } from './Sql.types';
import styles from './styles.css';
import { sql2fd } from './utils';
import { v1 } from 'uuid';
import { ISessionData } from '../gdmn/types';

interface ISQLParam {
  name: string;
  value: any;
}

interface ISQLState {
  expression: string;
  params: ISQLParam[];
  viewMode: 'hor' | 'ver';
}

type Action =
  | { type: 'INIT'; state: ISQLState }
  | { type: 'SET_EXPRESSION'; expression: string }
  | { type: 'CLEAR' }
  | { type: 'CHANGE_VIEW' }
  | { type: 'SHOW_PARAMS' }
  | { type: 'SHOW_PLAN' };

function reducer(state: ISQLState, action: Action): ISQLState {
  switch (action.type) {
    case 'INIT':
      return action.state;
    case 'SET_EXPRESSION':
      return { ...state, expression: action.expression };
    case 'CLEAR':
      return { ...state, expression: '' };
    case 'CHANGE_VIEW':
      return { ...state, viewMode: state.viewMode === 'hor' ? 'ver' : 'hor' };
    default:
      return state;
  }
}

interface ILastEdited {
  fieldName: string;
  value: string | boolean;
}

interface IChangedFields {
  [fieldName: string]: boolean;
}

export const Sql = CSSModules(
  (props: ISqlProps): JSX.Element => {
    const { url, viewTab, dispatch, rs, gcs, id, history } = props;

    const getSavedControlsData = (): ISessionData | undefined => {
      if (viewTab && viewTab.sessionData && viewTab.sessionData.controls instanceof Object) {
        return viewTab.sessionData.controls as ISessionData;
      }
      return undefined;
    };

    const getSavedLastEdit = (): ILastEdited | undefined => {
      if (viewTab && viewTab.sessionData && viewTab.sessionData.lastEdited) {
        return viewTab.sessionData.lastEdited as ILastEdited;
      }
      return undefined;
    };

    const getSavedLastFocused = (): string | undefined => {
      if (viewTab && viewTab.sessionData && typeof viewTab.sessionData.lastFocused === 'string') {
        return viewTab.sessionData.lastFocused;
      }
      return undefined;
    };

    const getSavedChangedFields = (): IChangedFields => {
      if (viewTab && viewTab.sessionData && viewTab.sessionData.changedFields instanceof Object) {
        return viewTab.sessionData.changedFields as IChangedFields;
      }
      return {};
    };

    const lastEdited = useRef(getSavedLastEdit());
    const lastFocused = useRef(getSavedLastFocused());
    const controlsData = useRef(getSavedControlsData());
    const changedFields = useRef(getSavedChangedFields());

    const [state, setState] = useReducer(reducer, {
      expression: 'select * from gd_good',
      params: [],
      viewMode: 'hor'
    });

    const applyLastEdited = () => {
      if (rs && lastEdited.current) {
        const { fieldName, value } = lastEdited.current;
        if (typeof value === 'boolean') {
          dispatch(rsActions.setRecordSet(rs.setBoolean(fieldName, value)));
        } else {
          dispatch(rsActions.setRecordSet(rs.setString(fieldName, value)));
        }
        lastEdited.current = undefined;
      }
    };

    const addNewSql = useCallback(() => {
      const id = v1();
      history.push(`/spa/gdmn/sql/${id}`);
    }, []);

    useEffect(() => {
      return () => {
        dispatch(
          gdmnActions.saveSessionData({
            viewTabURL: url,
            sessionData: {
              lastEdited: lastEdited.current,
              lastFocused: lastFocused.current,
              controls: controlsData.current,
              changedFields: changedFields.current
            }
          })
        );
      };
    }, []);

    useEffect(() => {
      if (viewTab && viewTab.sessionData) {
        console.log('2', viewTab.sessionData);
        setState({
          type: 'INIT',
          state: {
            expression: viewTab.sessionData ? '' || '' : '',
            viewMode: 'hor',
            params: []
          }
        });
      }
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

    const handleGridSelect = (event: TSetCursorPosEvent) =>
      dispatch(dispatch => {
        dispatch(rsActions.setCurrentRow({ name: id, currentRow: event.cursorRow }));
        dispatch(setCursorCol({ name: id, cursorCol: event.cursorCol }));
      });

    const handleExecuteSql = useCallback(() => {
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
                      sql: { select: state.expression, params: state.params }
                    });

                    if (getState().grid[id]) {
                      dispatch(deleteGrid({ name: id }));
                    }
                    if (getState().recordSet[id]) {
                      dispatch(rsActions.setRecordSet(rs));
                    } else {
                      dispatch(rsActions.createRecordSet({ name: rs.name, rs }));
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
            iconName: 'Clear'
          },
          onClick: () => setState({ type: 'CLEAR' })
        },
        {
          key: 'execute',
          text: 'Выполнить',
          disabled: !state.expression || !state.expression.length,
          iconProps: {
            iconName: 'Play'
          },
          onClick: handleExecuteSql
        },
        {
          key: 'params',
          text: 'Параметры',
          disabled: !state.expression || !state.expression.length,
          iconProps: {
            iconName: 'ThumbnailView'
          },
          onClick: () => setState({ type: 'SHOW_PARAMS' })
        },
        {
          key: 'plan',
          text: 'План запроса',
          disabled: !rs,
          iconProps: {
            iconName: 'OpenSource'
          },
          onClick: () => setState({ type: 'SHOW_PLAN' })
        },
        {
          key: 'histoty',
          text: 'История',
          iconProps: {
            iconName: 'FullHistory'
          },
          onClick: () => console.log('click history')
        },
        {
          key: 'form-view',
          text: 'Вид',
          iconProps: {
            iconName: 'ViewAll2'
          },
          onClick: () => {
            lastEdited.current = {
              fieldName: 'viewMode',
              value: state.viewMode
            };
            changedFields.current['viewMode'] = true;
            setState({ type: 'CHANGE_VIEW' });
          }
        }
      ],
      [state, rs]
    );

    return (
      <div styleName="grid-container">
        <CommandBar items={commandBarItems} />
        <div styleName={`sql-container ${state.viewMode}`}>
          <div>
            <TextField
              resizable={false}
              multiline
              rows={8}
              defaultValue={
                lastEdited.current &&
                lastEdited.current.fieldName === 'expression' &&
                typeof lastEdited.current.value === 'string'
                  ? lastEdited.current.value
                  : state.expression
              }
              onChange={(_e, newValue?: string) => {
                if (newValue !== undefined) {
                  lastEdited.current = {
                    fieldName: 'expression',
                    value: newValue
                  };
                  changedFields.current['expression'] = true;
                  setState({ type: 'SET_EXPRESSION', expression: newValue || '' });
                }
              }}
              onFocus={() => {
                lastFocused.current = 'expression';
                if (lastEdited.current && lastEdited.current.fieldName !== 'expression') {
                  applyLastEdited();
                }
              }}
            />
          </div>
          <div>
            {rs && gcs && <GDMNGrid {...gcs} rs={rs} onSetCursorPos={handleGridSelect} onColumnResize={() => false} />}
          </div>
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true }
);
