import React, { ReactNode } from "react";
import { getTheme, Label } from "office-ui-fabric-react";

interface IFrameProps {
  marginLeft?: boolean;
  marginTop?: boolean;
  marginRight?: boolean;
  marginBottom?: boolean;
  border?: boolean;
  attention?: boolean;
  selected?: boolean;
  subTitle?: string;
  scroll?: boolean;
  height?: string;
  children: ReactNode;
  readOnly?: boolean;
  caption?: string;
  onClick?: () => void;
};

export const Frame = (props: IFrameProps): JSX.Element => {
  const { marginTop, marginRight, marginBottom, marginLeft, border, attention, selected, subTitle, children, scroll, height, onClick, readOnly, caption } = props;

  const ifMargin = (m?: boolean) => m ? '16px' : 'none';
  const ifBorder = (defPadding = '16px') => border ? defPadding : 'inherit';

  const withMargin = (ch: ReactNode) => {
    return (
      <div
        style={{
          position: 'relative',
          height,
          marginLeft: ifMargin(marginLeft),
          marginTop: ifMargin(marginTop),
          marginRight: ifMargin(marginRight),
          marginBottom: ifMargin(marginBottom),
          border: ifBorder('1px solid ' + (attention ? getTheme().palette.red : getTheme().palette.themeDark)),
          borderRadius: border
            ? scroll
            ? '4px 0 0 4px'
            : '4px'
            : 'none',
          backgroundColor: selected
            ? getTheme().palette.themeLighter
            : readOnly
            ? getTheme().palette.neutralLight
            : getTheme().semanticColors.bodyBackground
        }}
        onClick={onClick}
      >
        {
          caption && border
            ?
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '-10px',
                  marginBottom: ifMargin(marginBottom),
                  height: '22px',
                  border: '1px solid ' + getTheme().palette.themeDark,
                  borderRadius: '3px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  paddingBottom: '2px',
                  backgroundColor: getTheme().palette.themeLighter,
                  color: getTheme().semanticColors.bodyText
                }}
              >
                {caption}
              </div>
          : undefined
        }
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowY: scroll ? 'scroll' : 'hidden',
            paddingLeft: ifBorder(),
            paddingTop: ifBorder(subTitle ? '8px' : '16px'),
            paddingRight: ifBorder(),
            paddingBottom: ifBorder(),
          }}
        >
          {ch}
        </div>
      </div>
    );
  };

  const withSubTitle = (ch: ReactNode) => {
    if (subTitle) {
      return (
        <>
          <Label styles={{
            root: {
              marginBottom: '8px'
            }
          }}>
            {subTitle}
          </Label>
          {ch}
        </>
      )
    } else {
      return ch;
    }
  };

  return withMargin(withSubTitle(children)) as JSX.Element;
};
