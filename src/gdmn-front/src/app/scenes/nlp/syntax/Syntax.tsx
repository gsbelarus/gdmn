import { ISyntaxProps } from "./Syntax.types";
import { useTab } from "@src/app/hooks/useTab";
import React from "react";

export const Syntax = (props: ISyntaxProps): JSX.Element => {

  const { viewTab, url, dispatch, theme } = props;

  useTab(viewTab, url, 'Syntax', true, dispatch);

  return (
    <div>
      Syntax
    </div>
  );
};
