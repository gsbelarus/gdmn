/**
 * Type definitions for `dom-helpers` `3.0.0`
 */

declare module 'dom-helpers' {
  // root
  function ownerDocument(node: Node): Document;
  function ownerWindow(node: Node): Window;

  /**
   * doc: optional, if not passed defaults to root document
   * returns: activeElement
   */
  function activeElement(doc?: Document): Element;

  // events

  const events: IEventsModule;

  // query
  const query: IQueryModule;

  // style
  // function style(node, property: string | {}, value?: any) : string;

  // utils
  function requestAnimationFrame(callback: FrameRequestCallback): number;
  namespace requestAnimationFrame {
    function cancel(id: number): void;
  }
}

interface IEventsModule {
  /**
   * node:
   * event:
   */
  on(node: EventTarget, event: string, handler: Function): void;
  off(node: EventTarget, event: string, handler: Function): void;

  filter(selector: string, handler: Function): (e: Event) => void;
  // function filter(selector: string, handler: (e: Event) => void): (e: Event) => void;
  /**
   * returns a function to cancel listening.
   */
  listen(node: Node, eventName: string, handler: Function, capture: any): () => void;
}

type TBox = { top: number; left: number; height: number; width: number };

interface IQueryModule {
  // query
  matches(node: Node, selector: string): boolean;
  height(node: Element, client?: any): number;
  width(node: Element, client?: any): number;

  offset(node: Node): TBox | undefined;
  offsetParent(node: Node): HTMLElement;

  position(node: Node, offsetParent: HTMLElement): TBox | undefined;

  contains(context: any, node: Node): boolean;

  scrollPrarent(node: Node): Node;
  scrollTop(node: Node | Window): number;
  scrollTop(node: Node | Window, val?: number): void;

  querySelectorAll(element: Node, selector: string): any[];

  closest(node: Node, selector: string, context: any): Node;
}

// declare module 'dom-helpers/events' {
//    export = IEventsModule;
// }

declare module 'dom-helpers/class' {
  function addClass(element: Element, className: string): void;
  function removeClass(element: Element, className: string): void;
  function hasClass(element: Element, className: string): boolean;
}

declare module 'dom-helpers/util/scrollbarSize' {
  function scrollbarSize(recalc?: boolean): number;
  export = scrollbarSize;
}

declare module 'dom-helpers/util/inDOM' {
  const inDOM: boolean;
  export = inDOM;
}

declare module 'dom-helpers/query/isWindow' {
  function getWindow(node: Node): Window;
  export = getWindow;
}

declare module 'dom-helpers/transition/properties' {
  const transform: string;
  const end: string;
  const property: string;
  const timing: string;
  const delay: string;
  const duration: string;
}

declare module 'dom-helpers/style' {
  function style(node: Element, property: string | {}, value?: any): string;
  export = style;
}
