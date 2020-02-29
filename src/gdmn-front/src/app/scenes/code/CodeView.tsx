import { ICodeViewProps } from "./CodeView.types";
import React from "react";
import { useTab } from "@src/app/hooks/useTab";

export const CodeView = (props: ICodeViewProps): JSX.Element => {

  const { viewTab, url, dispatch } = props;

  useTab(viewTab, url, 'Code', true, dispatch);

  return <div>abc</div>
};
