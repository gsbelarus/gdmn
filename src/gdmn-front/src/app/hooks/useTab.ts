import { IViewTab } from "../scenes/gdmn/types";
import { useEffect } from "react";
import { GdmnAction, gdmnActions } from "../scenes/gdmn/actions";
import { Dispatch } from "redux";

export const useTab = (viewTab: IViewTab | undefined, url: string, caption: string, canClose: boolean, dispatch: Dispatch<GdmnAction>) => {
  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption,
        canClose
      }));
    }
  }, []);
};
