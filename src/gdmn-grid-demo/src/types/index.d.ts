declare module 'node-fetch' {
  const fetch: GlobalFetch['fetch'];
  export default fetch;
}