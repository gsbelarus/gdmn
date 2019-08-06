import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './style.css';
import { IThemeEditorProps } from './ThemeEditor.types';
import { gdmnActions } from '../gdmn/actions';

export const ThemeEditor = CSSModules( (props: IThemeEditorProps): JSX.Element => {

  const { viewTab, dispatch, url } = props;

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'Theme editor',
        canClose: true
      }));
    }
  }, []);

  return <div styleName="ThemeEditor">Theme editor</div>
}, styles, { allowMultiple: true });