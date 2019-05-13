import { vpParser1, vpVisitor1 } from "./VPParser1Visitor";
import { vpParser2, vpVisitor2 } from "./VPParser2Visitor";
import { vpParser3, vpVisitor3 } from "./VPParser3Visitor";
import { parser4, visitor4 } from "./Parser4Visitor";
import { parser5, visitor5 } from "./Parser5Visitor";
import { parser6, visitor6 } from './Parser6Visitor';

export const parsers = [
  {
    parser: vpParser1,
    visitor: vpVisitor1
  },
  {
    parser: vpParser2,
    visitor: vpVisitor2
  },
  {
    parser: vpParser3,
    visitor: vpVisitor3
  },
  {
    parser: parser4,
    visitor: visitor4
  },
  {
    parser: parser5,
    visitor: visitor5
  },
  {
    parser: parser6,
    visitor: visitor6
  },
];