import type { TimeItem } from '@/types/datePicker';

const add = (date: Date, addItem?: TimeItem) => {
  if (addItem == null) return date;
  const baseYears = date.getFullYear();
  const baseMonths = date.getMonth();
  const baseDays = date.getDate();
  const baseHours = date.getHours();
  const baseMinutes = date.getMinutes();
  const baseSeconds = date.getSeconds();

  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = addItem;

  return new Date(
    baseYears + years,
    baseMonths + months,
    baseDays + days + weeks * 7,
    baseHours + hours,
    baseMinutes + minutes,
    baseSeconds + seconds
  );
};

export default add;
