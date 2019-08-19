import { IRectangle } from "./types";

export const isSingleCell = (rect?: IRectangle) => rect && rect.left === rect.right && rect.top === rect.bottom;
export const inRect = (rect: IRectangle | undefined, x: number, y: number) => rect && x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom;
export const rectIntersect = (rect1: IRectangle, rect2: IRectangle) => inRect(rect1, rect2.left, rect2.top)
  || inRect(rect1, rect2.right, rect2.top)
  || inRect(rect1, rect2.right, rect2.bottom)
  || inRect(rect1, rect2.left, rect2.bottom);

export const makeRect = (rect: IRectangle, x: number, y: number) => inRect(rect, x, y)
  ?
    {
      left: rect.left,
      top: rect.top,
      right: x,
      bottom: y
    }
  :
    {
      left: Math.min(rect.left, x),
      top: Math.min(rect.top, y),
      right: Math.max(rect.right, x),
      bottom: Math.max(rect.bottom, y),
    };
