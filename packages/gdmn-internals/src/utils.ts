export function isValidDate(date: any) {
  return !!date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
};

/*
export function parseISettingEnvelope(raw: any) {
  if (typeof raw === 'string') {
    const parsed = JSON.parse(raw,
      (key, value) => {
        if ((key === '_accessed' || key === '_changed') && typeof value === 'string') {
          return new Date(value);
        }
      }
    );

    return isISettingEnvelope(parsed) ? parsed : undefined;
  }
};
*/
