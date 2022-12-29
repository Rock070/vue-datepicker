export const isArray = (p: any): p is any[] => Array.isArray(p);
export const isDate = (val: any) => val instanceof Date;
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isValidDate = (val: any) =>
  val instanceof Date && !isNaN(val.getTime());
