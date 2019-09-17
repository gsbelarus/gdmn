import { mergeStyleSets } from '@uifabric/merge-styles';

export interface IGridColors {
  currentCellBackground: string;
  currentRowBackground: string;
  currentRowBackgroundColor: string;
  fixedBackground: string;
  gridColumnDraggingBackground: string;
  evenRowBackground: string;
  oddRowBackground: string;
  selectedBackground: string;
  groupHeaderBackground: string;
  edited: string;
  deleted: string;
  headerCell: string;
  headerGrid: string;
  rightSideCellFooter: string;
  bodyGrid: string;
  sideFooterGrid: string;
  bodyFooter: string;
  footerCell: string;
  gridColumnSortCodeColor: string;
  gridColumnSortColor: string;
  gridColumnSort: string;
  bodyHeaderColor: string;
  sideFooterGridColor: string;
  bodyFooterColor: string;
  dragHandleIconColor: string;
  footerCellColor: string;
  textColor: string;
  borderBottom: string;
  fixedBorderBottomRight: string;
  fixedBorderTopLeft: string;
  fixedCellColor: string;
};

export interface IGridCSSClassNames {
  GridBody: string;
  GridContainer: string;
  CurrentCellBackground: string;
  CurrentRowBackground: string;
  FixedBackground: string;
  EvenRowBackground: string;
  OddRowBackground: string;
  CellColumn: string;
  BorderRight: string;
  BorderBottom: string;
  FixedBorder: string;
  SelectedBackground: string;
  GroupHeaderBackground: string;
  Edited: string;
  Deleted: string;
  HeaderCell: string;
  GridColumnSort: string;
  GridColumnSortCode: string;
  GrayText: string;
  TextColor: string;
  SideHeader: string;
  HeaderGrid: string;
  RightSideCellFooter: string;
  LeftSideCellFooter: string;
  SideFooter: string;
  SideContainer: string;
  BodyHeader: string;
  BodyRows: string;
  BodyGrid: string;
  BodyGridNoVScroll: string;
  BodyGridNoHScroll: string;
  BodyGridVScroll: string;
  BodyGridHScroll: string;
  SideRows: string;
  LeftSideGrid: string;
  SideFooterGrid: string;
  BodyFooter: string;
  BodyFooterGrid: string;
  BodyContainer: string;
  RightSideGrid: string;
  DragHandleIcon: string;
  CellRow: string;
  ResizingColumn: string;
  CellMarkArea: string;
  DisplayNone: string;
  GridColumnDragging: string;
  DataCellRight: string;
  DataCellCenter: string;
  DataCellLeft: string;
  FixedCell: string;
  FooterCell: string;
  CellCaption: string;
};

export const getClassNames = (colors?: IGridColors): IGridCSSClassNames => mergeStyleSets({
  GridBody: {
    width: '100%',
    height: '100%',
    float: 'left'
  },
  GridContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    cursor: 'default'
  },
  CurrentCellBackground: {
    backgroundColor: colors && colors.currentCellBackground ? colors.currentCellBackground : 'aquamarine',
    color: colors && colors.currentRowBackgroundColor ? colors.currentRowBackgroundColor : 'white'
  },
  CurrentRowBackground: {
    backgroundColor: colors && colors.currentRowBackground ? colors.currentRowBackground : 'cadetblue',
    color: colors && colors.currentRowBackgroundColor ? colors.currentRowBackgroundColor : 'white'
  },
  FixedBackground: {
    backgroundColor: colors && colors.fixedBackground ? colors.fixedBackground : 'lightgray',
  },
  EvenRowBackground: {
    backgroundColor: colors && colors.evenRowBackground ? colors.evenRowBackground : 'rgb(247, 243, 231)'
  },
  OddRowBackground: {
    backgroundColor: colors && colors.oddRowBackground ? colors.oddRowBackground : 'rgb(231, 231, 214)'
  },
  CellColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 0.5em 0 0.5em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  BorderRight: {
    borderRight: '1px solid darkgray'
  },
  BorderBottom: {
    borderBottom:'1px solid darkgray',
    borderBottomColor: colors && colors.borderBottom ? colors.borderBottom : 'darkgray'
  },
  FixedBorder: {
    borderTop: '1px solid',
    borderTopColor: colors && colors.fixedBorderTopLeft ? colors.fixedBorderTopLeft : 'whitesmoke',
    borderLeft: '1px solid',
    borderLeftColor: colors && colors.fixedBorderTopLeft ? colors.fixedBorderTopLeft : 'whitesmoke',
    borderBottom: '1px solid',
    borderBottomColor: colors && colors.fixedBorderBottomRight ? colors.fixedBorderBottomRight : 'gray',
    borderRight: '1px solid',
    borderRightColor: colors && colors.fixedBorderBottomRight ? colors.fixedBorderBottomRight : 'gray'
  },
  SelectedBackground: {
    backgroundColor: colors && colors.selectedBackground ? colors.selectedBackground : 'rgba(255, 200, 200)',
    transition: 'background 0.4s',
  },
  GroupHeaderBackground: {
    backgroundColor: colors && colors.groupHeaderBackground ? colors.groupHeaderBackground : 'palegoldenrod'
  },
  Edited: {
    backgroundColor: colors && colors.edited ? colors.edited : 'peachpuff'
  },
  Deleted: {
    backgroundColor: colors && colors.deleted ? colors.deleted : 'blueviolet'
  },
  HeaderCell: {
    fontSize: '0.85em',
    alignItems: 'center',
    borderTop: '1px solid',
    borderTopColor: colors && colors.fixedBorderTopLeft ? colors.fixedBorderTopLeft : 'whitesmoke',
    borderLeft: '1px solid',
    borderLeftColor: colors && colors.fixedBorderTopLeft ? colors.fixedBorderTopLeft : 'whitesmoke',
    borderBottom: '1px solid',
    borderBottomColor: colors && colors.fixedBorderBottomRight ? colors.fixedBorderBottomRight : 'gray',
    borderRight: '1px solid',
    borderRightColor: colors && colors.fixedBorderBottomRight ? colors.fixedBorderBottomRight : 'gray',
    backgroundColor: colors && colors.headerCell ? colors.headerCell : 'lightgray'
  },
  GridColumnSortCode: {
    position: 'absolute',
    left: '2px',
    top: '0',
    color: colors && colors.gridColumnSortCodeColor ? colors.gridColumnSortCodeColor : '#202020',
    fontSize: '1.2em',
  },
  GridColumnSort: {
    fontSize: '0.9em',
    color: colors && colors.gridColumnSortColor ? colors.gridColumnSortColor : '#202020',
    backgroundColor: colors && colors.gridColumnSort ? colors.gridColumnSort : '#202020',
  },
  GrayText: {
    color: 'darkgray'
  },
  TextColor: {
    color: colors && colors.textColor ? colors.textColor : 'black'
  },
  SideHeader: {
    flex: '0 0 initial',
    width: '100%'
  },
  HeaderGrid: {
    width: '100%',
    overflow: 'hidden !important' as any,
    backgroundColor: colors && colors.headerGrid ? colors.headerGrid : 'rgb(247, 243, 231)'
  },
  RightSideCellFooter: {
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
    borderTop: 'whitesmoke 1px solid',
    backgroundColor: colors && colors.rightSideCellFooter ? colors.rightSideCellFooter : 'lightgray'
  },
  LeftSideCellFooter: {
    borderRight: 'none'
  },
  SideFooter: {
    width: '100%',
    flex: '0 0 initial'
  },
  SideContainer: {
    flex: '0 0 initial',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%'
  },
  BodyHeader: {
    width: '100%',
    flex: '0 0 initial',
    color: colors && colors.bodyHeaderColor ? colors.bodyHeaderColor : 'black'
  },
  BodyRows: {
    width: '100%',
    flex: 'auto'
  },
  BodyGrid: {
    width: '100%',
    backgroundColor: colors && colors.bodyGrid ? colors.bodyGrid : 'rgb(247, 243, 231)'
  },
  BodyGridNoVScroll: {
    overflowY: 'hidden !important' as any,
  },
  BodyGridNoHScroll: {
    overflowX: 'hidden !important' as any,
  },
  BodyGridVScroll: {
    overflowY: 'scroll'
  },
  BodyGridHScroll: {
    overflowX: 'scroll'
  },
  SideRows: {
    width: '100%',
    flex: 'auto'
  },
  LeftSideGrid: {
    overflow: 'hidden !important' as any
  },
  SideFooterGrid: {
    width: '100%',
    overflow: 'hidden !important' as any,
    backgroundColor: colors && colors.sideFooterGrid ? colors.sideFooterGrid : 'lightgray',
    color: colors && colors.sideFooterGridColor ? colors.sideFooterGridColor : 'black'
  },
  BodyFooterGrid: {
    width: '100%',
    overflowY: 'hidden !important' as any,
    overflowX: 'scroll !important' as any,
  },
  BodyFooter: {
    width: '100%',
    flex: '0 0 initial',
    backgroundColor: colors && colors.bodyFooter ? colors.bodyFooter : 'lightgray',
    color: colors && colors.bodyFooterColor ? colors.bodyFooterColor : 'black'
  },
  BodyContainer: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%'
  },
  RightSideGrid: {
    overflowY: 'scroll !important' as any,
    overflowX: 'hidden !important' as any,
  },
  DragHandleIcon: {
    display: 'block',
    position: 'absolute',
    right: '0',
    bottom: '0',
    top: '0',
    width: '4px',
    zIndex: 4,
    opacity: '0',
    color: colors && colors.dragHandleIconColor ? colors.dragHandleIconColor : 'cadetblue',
    selectors: {
      ':hover': {
        cursor: 'col-resize'
      }
    }
  },
  CellRow: {
    display: 'flex',
    flexDirection: 'row',
    flexFlow: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  ResizingColumn: {
    cursor: 'col-resize'
  },
  CellMarkArea: {
    paddingLeft: '0.5em',
    minWidth: '1.5em',
    width: '1.5em',
    fontSize: '1.5em',
    fontWeight: 'normal',
    lineHeight: '1.5em',
    textAlign: 'left'
  },
  DisplayNone: {
    display: 'none'
  },
  GridColumnDragging: {
    opacity: '0.5',
    zIndex: 100,
    backgroundColor: colors && colors.gridColumnDraggingBackground ? colors.gridColumnDraggingBackground : 'darkred'
  },
  DataCellRight: {
    textAlign: 'right'
  },
  DataCellCenter: {
    textAlign: 'center'
  },
  DataCellLeft: {
    textAlign: 'left'
  },
  FixedCell: {
    fontWeight: 'bold',
    alignItems: 'flex-start',
    color: colors && colors.fixedCellColor ? colors.fixedCellColor : 'white'
  },
  FooterCell: {
    backgroundColor: colors && colors.footerCell ? colors.footerCell : 'blue',
    color: colors && colors.footerCellColor ? colors.footerCellColor : 'white',
    borderRight: 'lightblue 1px solid'
  },
  CellCaption: {
    width: '100%',
    zIndex: 2,
    margin: '0 auto',
    fontWeight: 'bold',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
});
