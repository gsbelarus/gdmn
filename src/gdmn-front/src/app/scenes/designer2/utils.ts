import { IRectangle, IObject } from "./types";
import { getTheme, IStyle } from "office-ui-fabric-react";

export const isSingleCell = (rect?: IRectangle) => rect && rect.left === rect.right && rect.top === rect.bottom;
export const inRect = (rect: IRectangle | undefined, x: number, y: number) => rect && x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom;
export const rectIntersect = (rect1: IRectangle, rect2: IRectangle) => !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.top > rect2.bottom || rect1.bottom < rect2.top);
export const isValidRect = (rect: IRectangle) => rect.left <= rect.right && rect.bottom >= rect.top;
export const outOfBorder = (rect: IRectangle, borders: IRectangle) => rect.left < borders.left || rect.top < borders.top || rect.right > borders.right || rect.bottom > borders.bottom;
export const rect = (left: number, top: number, right: number, bottom: number) => ({left, top, right, bottom});
export const sameRect = (rect1: IRectangle, rect2: IRectangle) => rect1.left === rect2.left && rect1.top === rect2.top && rect1.right === rect2.right && rect1.bottom === rect2.bottom;

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

export const getColor = (color: string | undefined, defColor?: string) => {
  let res;

  if (color) {
    const [objName, colorName] = color.split('.');

    if (objName === 'palette') {
      res = (getTheme().palette as any)[colorName];
    }

    else if (objName === 'semanticColors') {
      res = (getTheme().semanticColors as any)[colorName];
    }

  }

  return res ? res : defColor;
};

export const object2style = (object: IObject): React.CSSProperties => ({
  backgroundColor: getColor(object.backgroundColor),
  color: getColor(object.color),
});

export const object2IStyle = (object: IObject): IStyle => ({
  backgroundColor: getColor(object.backgroundColor),
  color: getColor(object.color),
});
