function promisify<T>(fn: Function, context = null): (...args: any[]) => Promise<T> {
  return (...args) =>
    new Promise<T>((resolve, reject) => {
      fn.call(
        context,
        ...[
          ...args,
          (err: any, ...results: any[]) => {
            err ? reject(err) : resolve(results.length ? results[0] : results);
          }
        ]
      );
    });
}

function isDevMode() {
  // @ts-ignore
  return JSON.stringify(process.env.NODE_ENV) !== 'production';
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

const round = (value: number) => Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
const bytesToMb = (value: number) => (value > 0 ? round(value / 1024 / 1024) : 0);

function formatDateToLocalLong(date: Date, locale: string = 'ru-RU') {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

function generateGuid() {
  return (
    generateS4() +
    generateS4() +
    '-' +
    generateS4() +
    '-' +
    generateS4() +
    '-' +
    generateS4() +
    '-' +
    generateS4() +
    generateS4() +
    generateS4()
  );
}

function generateS4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function stringfyValues(obj: any): { [key: string]: string } {
    Object.keys(obj).forEach(key => {
      typeof obj[key] === 'object' ? stringfyValues(obj[key]) : obj[key] = '' + obj[key];
    });

    return obj;
}

export { promisify, isDevMode, Subtract, bytesToMb, formatDateToLocalLong, generateGuid, stringfyValues };
