import { IGridColors } from "gdmn-grid";
import { useState, useEffect } from "react";
import { getTheme } from "office-ui-fabric-react";

const calcGridColors = (): IGridColors => {
  const theme = getTheme();
  return {
    currentCellBackground: theme.palette.themeSecondary,
    currentRowBackground: theme.palette.themeTertiary,
    currentRowBackgroundColor: theme.semanticColors.bodyBackground,
    fixedBackground: theme.semanticColors.primaryButtonBackground,
    groupHeaderBackground: theme.semanticColors.primaryButtonBackground,
    oddRowBackground: theme.semanticColors.bodyStandoutBackground,
    evenRowBackground: theme.semanticColors.buttonBackground,
    gridColumnDraggingBackground: theme.semanticColors.primaryButtonBackground,
    headerCell: theme.semanticColors.bodyStandoutBackground,
    headerGrid: theme.semanticColors.bodyBackground,
    rightSideCellFooter: theme.semanticColors.bodyBackground,
    bodyGrid: theme.semanticColors.bodyBackground,
    sideFooterGrid: theme.semanticColors.bodyBackground,
    bodyFooter: theme.semanticColors.bodyBackground,
    footerCell: theme.semanticColors.buttonBackgroundChecked,
    gridColumnSortCodeColor: theme.semanticColors.buttonText,
    gridColumnSortColor: theme.semanticColors.buttonText,
    gridColumnSort: theme.semanticColors.variantBorderHovered,
    bodyHeaderColor: theme.semanticColors.buttonText,
    sideFooterGridColor: theme.semanticColors.buttonText,
    bodyFooterColor: theme.semanticColors.buttonText,
    dragHandleIconColor: theme.semanticColors.buttonText,
    footerCellColor: theme.semanticColors.buttonTextChecked,
    textColor: theme.semanticColors.buttonText,
    fixedBorderBottomRight: theme.semanticColors.buttonBorder,
    fixedBorderTopLeft: theme.semanticColors.variantBorder,
    borderBottom: theme.semanticColors.buttonBorder,
    fixedCellColor: theme.semanticColors.buttonText,
    selectedBackground: theme.semanticColors.primaryButtonBackground,
    deleted: theme.palette.red,
    edited: theme.palette.green
  };
};

export const useGridColors = (theme: string): IGridColors => {
  const [gridColors, setGridColors] = useState(calcGridColors());
  useEffect( () => setGridColors(calcGridColors()), [theme]);
  return gridColors;
};