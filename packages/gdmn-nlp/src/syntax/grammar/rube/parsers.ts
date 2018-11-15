import { vpParser1, vpVisitor1 } from "./VPParser1Visitor";
import { vpParser2, vpVisitor2 } from "./VPParser2Visitor";

export const parsers = [
  {
    parser: vpParser1,
    visitor: vpVisitor1
  },
  {
    parser: vpParser2,
    visitor: vpVisitor2
  },
];