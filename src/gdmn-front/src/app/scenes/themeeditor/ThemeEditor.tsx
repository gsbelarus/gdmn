import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './style.css';
import { IThemeEditorProps } from './ThemeEditor.types';
import { gdmnActions } from '../gdmn/actions';
import { ChoiceGroup, IChoiceGroupOption, Label, PrimaryButton, DefaultButton, createTheme, Customizer, loadTheme, getTheme } from 'office-ui-fabric-react';
import { themes } from './themes';

export const ThemeEditor = CSSModules( (props: IThemeEditorProps): JSX.Element => {

  const { viewTab, dispatch, url, theme } = props;

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'Theme editor',
        canClose: true
      }));
    }
  }, []);

  return (
    <>
      <ChoiceGroup
        label="Pick theme"
        selectedKey={theme}
        onChange={
          (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
            if (option) {
              loadTheme(themes.find( t => t.name === option.key )!.theme);
              dispatch(gdmnActions.selectTheme(option.key));
            }
          }
        }
        options={themes.map( t => {
          const theme = createTheme(t.theme);

          return {
            key: t.name,
            iconProps: { iconName: 'Color', styles: { root: { color: theme.semanticColors.primaryButtonBackground } } },
            text: t.name,
            styles: {
              root: {
                backgroundColor: theme.semanticColors.bodyBackground,
                color: theme.semanticColors.bodyText,
                selectors: {
                  ':hover': {
                    color: theme.semanticColors.bodyText,
                  }
                }
              }
            }
          }
        })}
      />
      <Label>Examples</Label>
      <PrimaryButton>Primary button</PrimaryButton>
      <DefaultButton>Test</DefaultButton>
    </>
  )
}, styles, { allowMultiple: true });