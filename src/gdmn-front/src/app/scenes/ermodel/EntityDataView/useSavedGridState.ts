import { Dispatch } from "redux";
import { GdmnAction, gdmnActions } from "../../gdmn/actions";
import { GDMNGrid, IGridState } from "gdmn-grid";
import { useRef, useEffect, MutableRefObject } from "react";
import { IViewTab } from "../../gdmn/types";

type TRefGrid = MutableRefObject<GDMNGrid | undefined>;
type TGetSavedState = () => IGridState | undefined;

export const useSaveGridState = (dispatch: Dispatch<GdmnAction>, viewTab?: IViewTab, name?: string): [TRefGrid, TGetSavedState] => {
  const gridRef = useRef<GDMNGrid | undefined>();
  const paramName = `savedGridState${name ? '-' + name : ''}`;

  useEffect( () => {
    return () => {
      if (gridRef.current && viewTab) {
        dispatch(gdmnActions.saveSessionData({
          viewTabURL: viewTab.url,
          sessionData: { ...viewTab.sessionData, [paramName]: gridRef.current.state }
        }));
      }
    }
  }, []);

  const getSavedState = () => {
    const savedGridState = viewTab && viewTab.sessionData ? viewTab.sessionData[paramName] : undefined;

    if (savedGridState instanceof Object) {
      return savedGridState as IGridState;
    } else {
      return undefined;
    }
  };

  return [gridRef, getSavedState];
};