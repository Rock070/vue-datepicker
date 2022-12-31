import { DAY_MS, DAYS_NUM_IN_ONE_ROW } from '@/helpers/const';
import type { CalendarBtn } from '@/types/datePicker';
import {
  get,
  getFirstDayOfMonth,
  getFirstDayOfNextMonth,
  getHowManyDaysInThisMonth,
  getLastDayOfLastMonth,
  getLastDayOfMonth,
  getTimestamp,
} from '@/utils/time/get';

type MonthDate = 'this' | 'last' | 'next';

const getCalendar = (date: Date, firstDayOfWeek = 0): CalendarBtn[] => {
  const { y, m } = get(date);

  const firstDayOfMonth = getFirstDayOfMonth(date);
  const lastDayOfMonth = getLastDayOfMonth(date);
  const { day: firstDayOfMonthDay } = get(firstDayOfMonth);
  const { day: lastDayOfMonthDay } = get(lastDayOfMonth);

  const lastMonthDays = firstDayOfMonthDay - firstDayOfWeek;
  const nextMonthDays =
    DAYS_NUM_IN_ONE_ROW - lastDayOfMonthDay + firstDayOfWeek - 1;
  const daysNumInThisMonth = getHowManyDaysInThisMonth(date);

  const result: CalendarBtn[] = [];

  /**
   * 當月
   */
  const firstDayOfThisMonthTimestamp = new Date(y, m, 1).getTime();
  const thisMonthDates = getMonthDate(
    'this',
    daysNumInThisMonth,
    firstDayOfThisMonthTimestamp
  );
  result.push(...thisMonthDates);
  /**
   * 上月
   */
  const lastDayOfLastMonth = getLastDayOfLastMonth(date);
  const lastDayOfLastMonthTimestamp = getTimestamp(lastDayOfLastMonth);
  const lastMonthDates = getMonthDate(
    'last',
    lastMonthDays,
    lastDayOfLastMonthTimestamp
  );
  result.unshift(...lastMonthDates);

  /**
   * 下月
   */
  const firstDayOfNextMonth = getFirstDayOfNextMonth(date);
  const firstDayOfNextMonthTimestamp = getTimestamp(firstDayOfNextMonth);
  const nextMonthDates = getMonthDate(
    'next',
    nextMonthDays,
    firstDayOfNextMonthTimestamp
  );
  result.push(...nextMonthDates);

  return result;
};

const getMonthDate = (
  type: MonthDate,
  days: number,
  baseTimestamp: number
): CalendarBtn[] => {
  const result = [];
  for (let i = 0; i < days; i++) {
    const timestamp = (function () {
      switch (type) {
        case 'last':
          return baseTimestamp - i * DAY_MS;
        case 'next':
        case 'this':
        default:
          return baseTimestamp + i * DAY_MS;
      }
    })();
    const targetDate = new Date(timestamp);

    result.push({
      value: targetDate,
      timestamp,
      time: get(targetDate),
      clickFn: undefined,
      disabled: false,
      isSelected: false,
      isThisMonth: type === 'this',
    });
  }

  if (type === 'last') return result.reverse();
  return result;
};

export default getCalendar;
