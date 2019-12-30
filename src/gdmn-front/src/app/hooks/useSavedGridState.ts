import { Dispatch } from "redux";
import { GdmnAction, gdmnActions } from "../scenes/gdmn/actions";
import { GDMNGrid, IGridState } from "gdmn-grid";
import { useRef, useEffect, MutableRefObject } from "react";
import { IViewTab } from "../scenes/gdmn/types";

type TRefGrid = MutableRefObject<GDMNGrid | undefined>;
type TGetSavedState = () => IGridState | undefined;

export const useSaveGridState = (dispatch: Dispatch<GdmnAction>, url: string, viewTab?: IViewTab, name?: string): [TRefGrid, TGetSavedState] => {
  const gridRef = useRef<GDMNGrid | undefined>();
  const paramName = `savedGridState${name ? '-' + name : ''}`;

  useEffect( () => {
    return () => {
      if (gridRef.current) {
        dispatch(gdmnActions.saveSessionData({
          viewTabURL: url,
          merge: true,
          sessionData: { [paramName]: gridRef.current.state }
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