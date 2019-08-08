import { getTheme } from "office-ui-fabric-react";

interface IViewTabStyles {
  viewTabsBand: React.CSSProperties;
  viewTab: React.CSSProperties;
  viewTabText: React.CSSProperties;
  viewInactiveTab: React.CSSProperties;
  viewActiveColor: React.CSSProperties;
  inactiveShadow: React.CSSProperties;
  viewTabSpace: React.CSSProperties;
  viewRestSpace: React.CSSProperties;
  viewTabSpinner: React.CSSProperties;
  viewTabCross: React.CSSProperties;
};

export const getViewTabStyles = (theme: string, error?: boolean): IViewTabStyles => (
  {
    viewTabsBand: {
      width: '100%',
      height: '36px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingTop: '4px',
      backgroundColor: getTheme().semanticColors.bodyBackground
    },
    viewTab: {
      backgroundColor: error ? getTheme().palette.red : getTheme().semanticColors.bodyBackground,
      color: error ? getTheme().palette.white : getTheme().semanticColors.bodyText,
      minWidth: '96px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      cursor: 'default'
    },
    viewTabText: {
      flex: '1 0 auto',
      padding: '2px 4px 0px 4px',
      textAlign: 'center',
      minHeight: '27px',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      cursor: 'default',
      borderLeft: '1px solid',
      borderRight: '1px solid',
      borderColor: getTheme().semanticColors.bodyText
    },
    viewInactiveTab: {
      borderTop: '1px solid'
    },
    viewActiveColor: {
      height: '5px',
      borderLeft: '1px solid',
      borderRight: '1px solid',
      borderColor: getTheme().semanticColors.bodyText,
      backgroundColor: error ? getTheme().palette.red : getTheme().palette.themeSecondary
    },
    inactiveShadow: {
      borderColor: getTheme().semanticColors.bodyText,
      backgroundColor: getTheme().semanticColors.bodyDivider,
      height: '6px',
      flex: '0 0 initial',
      justifySelf: 'flex-end',
      borderLeft: '1px solid',
      borderRight: '1px solid',
      borderBottom: '1px solid'
    },
    viewTabSpace: {
      minWidth: '4px',
      backgroundColor: 'transparent',
      borderBottom: '1px solid',
      borderColor: getTheme().semanticColors.bodyText,
      flex: '0 0 initial'
    },
    viewRestSpace: {
      backgroundColor: 'transparent',
      borderBottom: '1px solid',
      flex: '1 1 auto',
      justifySelf: 'flex-end',
      borderColor: getTheme().semanticColors.bodyText
    },
    viewTabSpinner: {
      marginRight: '6px'
    },
    viewTabCross: {
      marginLeft: '6px',
      fontWeight: 'bold'
    }
  }
);