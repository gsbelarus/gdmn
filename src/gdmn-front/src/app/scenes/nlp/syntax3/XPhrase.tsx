import React from "react";
import { IXParseResultSuccess } from "gdmn-nlp";
import { XPhraseSyntaxTree } from "./XPhraseSyntaxTree";

export const XPhrase = ({ parsed }: { parsed: IXParseResultSuccess }) => {
  return <XPhraseSyntaxTree parsed={parsed} />;
};