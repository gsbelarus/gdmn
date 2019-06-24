import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import { ISqlProps } from './Sql.types';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import {
  CommandBar,
  ICommandBarItemProps,
  ComboBox,
  SpinButton,
  Checkbox,
  TextField,
  ChoiceGroup,
  Label,
  Grid
} from 'office-ui-fabric-react';

interface ISqlState {
  expression: string;
  viewMode: 'hor' | 'vert';
}

type Action =
  | { type: 'INIT' }
  | { type: 'SET_EXPRESSION'; expression: string }
  | { type: 'CLEAR' }
  | { type: 'RUN' }
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
      return state;
    }
    default:
      return state;
  }
}

export const Sql = CSSModules(
  (props: ISqlProps): JSX.Element => {
    const { url, viewTab, dispatch } = props;
    const [sqlState, sqlDispatch] = useReducer(reducer, { expression: 'select * from gd_contact', viewMode: 'hor' });

    useEffect(() => {
      if (!viewTab) {
        dispatch(
          gdmnActions.addViewTab({
            url,
            caption: 'SQL',
            canClose: true
          })
        );
      }
    }, []);

    const commandBarItems: ICommandBarItemProps[] = [
      {
        key: 'add',
        text: 'Новый',
        iconProps: {
          iconName: 'Add'
        },
        onClick: () => true
      },
      {
        key: 'clear',
        text: 'Очистить',
        disabled: !sqlState.expression || !sqlState.expression.length,
        iconProps: {
          iconName: 'Clear'
        },
        onClick: () => sqlDispatch({ type: 'CLEAR' })
      },
      {
        key: 'run',
        text: 'Выполнить',
        disabled: !sqlState.expression || !sqlState.expression.length,
        iconProps: {
          iconName: 'Play'
        },
        onClick: () => sqlDispatch({ type: 'RUN' })
      },
      {
        key: 'params',
        text: 'Параметры',
        disabled: !sqlState.expression || !sqlState.expression.length,
        iconProps: {
          iconName: 'ThumbnailView'
        },
        onClick: () => sqlDispatch({ type: 'SHOW_PARAMS' })
      },
      {
        key: 'plan',
        text: 'План запроса',
        disabled: !sqlState.expression || !sqlState.expression.length,
        iconProps: {
          iconName: 'OpenSource'
        },
        onClick: () => sqlDispatch({ type: 'SHOW_PLAN' })
      }
    ];

    return (
      <>
        <CommandBar items={commandBarItems} />
        <div className={styles["sql-container"]}>
          <div className="sql-editor">
          <TextField
            value={sqlState.expression}
            multiline
            rows={10}
            resizable={false}
            onChange={e => sqlDispatch({ type: 'SET_EXPRESSION', expression: e.currentTarget.value || '' })}
          />
          </div>
          <div className="sql-data-view">
            Grid with data goes here
          </div>
        </div>
      </>
    );
  },
  styles,
  { allowMultiple: true }
);
