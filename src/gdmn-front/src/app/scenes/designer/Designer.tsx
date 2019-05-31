import React, { useEffect } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';

export const Designer = CSSModules( (props: IDesignerProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'Designer',
        canClose: true
      }));
    }
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'saveAndClose',
      text: 'Разделить вертикально',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => {}
    }
  ];

  return (
    <>
      <CommandBar items={commandBarItems} />
    </>
  );
}, styles, { allowMultiple: true });