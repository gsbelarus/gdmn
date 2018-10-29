declare module "koa-error" {

  import * as Koa from "koa";

  interface IOptions {
    template?: string;
    engine?: string;
    cache?: boolean;
    env?: string;
    accepts?: string[];
  }

  export default function error(options?: IOptions): Koa.Middleware;
}
