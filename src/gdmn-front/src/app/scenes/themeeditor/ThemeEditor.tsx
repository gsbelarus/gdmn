import React, { useEffect, useReducer, useRef, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './style.css';
import { IThemeEditorProps } from './ThemeEditor.types';
import { gdmnActions } from '../gdmn/actions';
import { ChoiceGroup, IChoiceGroupOption, Label, PrimaryButton, DefaultButton, createTheme, Customizer, loadTheme, getTheme, DetailsList, IColumn, SelectionMode, DetailsListLayoutMode, Selection, MarqueeSelection } from 'office-ui-fabric-react';
import { themes } from './themes';

export const ThemeEditor = CSSModules( (props: IThemeEditorProps): JSX.Element => {

  const getSelectionDetails = (): string => {
    const selectionCount = selection.getSelection().length;
    return selectionCount
      ? `${selectionCount} items selected: ${selection.getSelection().map( (i: any) => i.key ).join('; ')}`
      : 'No items selected';
  }

  const createSelection = () => {
    return new Selection({
      onSelectionChanged: () => setSelectionDetails(getSelectionDetails()),
      getKey: (item: any) => item.key
    });
  };

  const { viewTab, dispatch, url, theme } = props;
  const [selection, setSelection] = useState(createSelection());
  const [selectionDetails, setSelectionDetails] = useState('');

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'Theme editor',
        canClose: true
      }));
    }
  }, []);

  const items = [
    {
      key: '1',
      value: 'sdksdfhdh'
    },
    {
      key: '2',
      value: '398457389457'
    },
    {
      key: '3',
      value: '65234jhsdgbv'
    },
    {
      key: '4',
      value: 'dlfjkkljgmn'
    },
    {
      key: '5',
      value: ';dldfmvkjn834'
    },
  ];

  const columns: IColumn[] = [
    {
      key: 'column1',
      name: 'Key',
      minWidth: 64,
      maxWidth: 96,
      fieldName: 'key'
    },
    {
      key: 'column2',
      name: 'Value',
      minWidth: 64,
      fieldName: 'value'
    }
  ];

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
      <div>
        <Label>{selectionDetails}</Label>
        <MarqueeSelection selection={selection}>
          <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.multiple}
            getKey={ (item: any) => item.key }
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selection={selection}
            selectionPreservedOnEmptyClick={true}
            enterModalSelectionOnTouch={true}
          />
        </MarqueeSelection>
        <DefaultButton
          onClick={
            () => {
              selection.setItems(items);
              for (let i = 1; i <= 3; i++) {
                selection.setKeySelected(`${i}`, true, false);
              }
              setSelectionDetails(getSelectionDetails());
            }
          }
        >
          Set items selected
        </DefaultButton>
      </div>
    </>
  )
}, styles, { allowMultiple: true });