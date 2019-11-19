export function isValidDate(date: any) {
  return !!date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
};

const dateFormat = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export function isValidDateString(value: any) {
  return typeof value === "string" && value.length >= 24 && value.length <= 29 && dateFormat.test(value);
};

export function detectAndParseDate(value: any) {
  return (typeof value === "string" && value.length >= 24 && value.length <= 29 && dateFormat.test(value))
    ? new Date(value)
    : value;
};