import { createGrid, deleteGrid, GDMNGrid, setCursorCol, TSetCursorPosEvent } from 'gdmn-grid';
import { IDataRow, RecordSet, rsActions, TFieldType } from 'gdmn-recordset';
import { List } from 'immutable';
import { CommandBar, ICommandBarItemProps, TextField } from 'office-ui-fabric-react';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import CSSModules from 'react-css-modules';

import { TTaskStatus } from '@gdmn/server-api';
import { apiService } from '@src/app/services/apiService';
import { rsMetaActions } from '@src/app/store/rsmeta';

import { gdmnActions } from '../gdmn/actions';
import { ISqlProps } from './Sql.types';
import styles from './styles.css';
import { sql2fd } from './utils';
import { v1 } from 'uuid';
import { createQuery } from './data/actions';

interface ISqlState {
  expression: string;
  params: any;
  viewMode: 'hor' | 'ver';
}

type Action =
  | { type: 'INIT' }
  | { type: 'SET_EXPRESSION'; expression: string }
  | { type: 'CLEAR' }
  | { type: 'CHANGE_VIEW' }
  | { type: 'SHOW_PARAMS' }
  | { type: 'SHOW_PLAN' };

function reducer(state: ISqlState, action: Action): ISqlState {
  switch (action.type) {
    case 'SET_EXPRESSION': {
      return { ...state, expression: action.expression };
    }
    case 'CLEAR': {
      return { ...state, expression: '' };
    }
    case 'CHANGE_VIEW': {
      return { ...state, viewMode: state.viewMode === 'hor' ? 'ver' : 'hor' };
    }
    default:
      return state;
  }
}

export const Sql = CSSModules(
  (props: ISqlProps): JSX.Element => {
    const { url, viewTab, dispatch, rs, gcs, sqlName } = props;
    const [state, sqlDispatch] = useReducer(reducer, {
      expression: 'select * from gd_good',
      params: [],
      viewMode: 'hor'
    });

    // const sqlName = 'SQL';

    /*     useEffect(() => {
      const id = v1();
      dispatch(createQuery(state.expression, id))
    }, []) */

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
              caption: `${sqlName}`,
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
              caption: `${sqlName}`,
              canClose: true
            })
          );
        }
      }
    }, [rs, viewTab]);

    useEffect(() => {
      // Создаём грид из RS
      console.log('create grid', rs);
      if (!gcs && rs) {
        dispatch(
          createGrid({
            name: sqlName,
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
        dispatch(rsActions.setCurrentRow({ name: sqlName, currentRow: event.cursorRow }));
        dispatch(setCursorCol({ name: sqlName, cursorCol: event.cursorCol }));
      });

    const handleExecuteSql = useCallback(() => {
      dispatch(async (dispatch, getState) => {
        dispatch(rsMetaActions.setRsMeta(sqlName, {}));

        apiService
          .prepareSqlQuery({
            select: state.expression,
            params: state.params
          })
          .subscribe(async value => {
            switch (value.payload.status) {
              case TTaskStatus.RUNNING: {
                const taskKey = value.meta!.taskKey!;

                if (!getState().rsMeta[sqlName]) {
                  console.warn('ViewTab was closing, interrupt task');
                  apiService.interruptTask({ taskKey }).catch(console.error);
                  return;
                }
                dispatch(rsMetaActions.setRsMeta(sqlName, { taskKey }));

                const response = await apiService.fetchSqlQuery({
                  rowsCount: 100,
                  taskKey
                });

                const rsm = getState().rsMeta[sqlName];
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
                      name: sqlName,
                      fieldDefs,
                      data: List(response.payload.result!.data as IDataRow[]),
                      sequentially: !!rsm.taskKey,
                      sql: { select: state.expression, params: state.params }
                    });

                    if (getState().grid[sqlName]) {
                      dispatch(deleteGrid({ name: sqlName }));
                    }
                    console.log(rs);
                    if (getState().recordSet[sqlName]) {
                      dispatch(rsActions.setRecordSet(rs));
                    } else {
                      dispatch(rsActions.createRecordSet({ name: rs.name, rs }));
                    }
                    break;
                  }
                  case TTaskStatus.FAILED: {
                    if (rsm) {
                      dispatch(rsMetaActions.setRsMeta(sqlName, {}));
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
                if (getState().rsMeta[sqlName]) {
                  dispatch(rsMetaActions.setRsMeta(sqlName, {}));
                }
                break;
              }
              case TTaskStatus.SUCCESS: {
                if (getState().rsMeta[sqlName]) {
                  dispatch(rsMetaActions.setRsMeta(sqlName, {}));
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
          onClick: () => console.log('click add sql')
        },
        {
          key: 'clear',
          text: 'Очистить',
          disabled: !state.expression || !state.expression.length,
          iconProps: {
            iconName: 'Clear'
          },
          onClick: () => sqlDispatch({ type: 'CLEAR' })
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
          onClick: () => sqlDispatch({ type: 'SHOW_PARAMS' })
        },
        {
          key: 'plan',
          text: 'План запроса',
          disabled: !rs,
          iconProps: {
            iconName: 'OpenSource'
          },
          onClick: () => sqlDispatch({ type: 'SHOW_PLAN' })
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
          onClick: () => sqlDispatch({ type: 'CHANGE_VIEW' })
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
              value={state.expression}
              resizable={false}
              multiline
              rows={8}
              onChange={e => sqlDispatch({ type: 'SET_EXPRESSION', expression: e.currentTarget.value || '' })}
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
