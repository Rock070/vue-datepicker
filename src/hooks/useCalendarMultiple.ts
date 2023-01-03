import { computed } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import getTimeLocale from '@/helpers/getTimeLocale';
import { CalendarBtn, UseFnParams, ViewMode } from '@/types/datePicker';
import createRange from '@/utils/createRange';
import pipe from '@/utils/pipe';
import splitGroup from '@/utils/splitGroup';
import { get } from '@/utils/time/get';
import getCentury from '@/utils/time/getCentury';
import getDecade from '@/utils/time/getDecade';
import getEndTimeOfTheDate from '@/utils/time/getEndTimeOfTheDate';
import isSameDate from '@/utils/time/isSameDate';
import isToday from '@/utils/time/isToday';
import toggleArrayValue from '@/utils/toggleArrayValue';

import type { Ref } from 'vue';
const useSafeArrayDateValue = (date: Ref<Date | Date[]>) => {
  return computed(() => {
    const value = date.value;
    if (Array.isArray(value)) return value;
    return [value];
  });
};

export const useCalendarMultiple = (params: UseFnParams) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { date, setDate, disabledDate, toggleOpen, firstDayOfWeek, locale } =
    params;

  const safeDate = useSafeArrayDateValue(date);
  const [displayDate, setDisplayDate] = useActive(safeDate.value[0]);

  const monthStrList = createRange(12).map(item => `2023-${1 + item}-1`);

  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);
  const weekdayDateList = computed(() => {
    const weekDayStrList = createRange(7).map(
      item => `2023-1-${1 + item + firstDayOfWeek.value}`
    ); // 2023-1-1 is Sunday;
    return weekDayStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { weekday: 'short' })
    );
  });

  const dayBody = computed(() => {
    const calendarDisplay = computed<CalendarBtn[][]>(() => {
      if (!displayDate.value) return [];
      const result = getCalendar(displayDate.value, firstDayOfWeek.value).map(
        item => {
          const value = item.value as Date;

          const isSelected = !!safeDate.value.find(item =>
            isSameDate(item, value)
          );

          const setDateImpl = (val: Date) => {
            setDisplayDate(val);
            setDate([...(toggleArrayValue(safeDate.value, val) as Date[])]);
          };

          const disabled = (function () {
            const compareDate = isToday(value)
              ? getEndTimeOfTheDate(value)
              : value;
            return disabledDate(compareDate);
          })();
          /* FIXME: 日期應比較大小插入
           * ["2023/1/3", "2023/1/17", "2023/1/20", "2023/1/6", "2023/1/4"] => ["2023/1/3", "2023/1/4", "2023/1/6", "2023/1/17", "2023/1/20"]
           */
          const clickFn = disabled
            ? undefined
            : () => {
                setDateImpl(value);
                // toggleOpen(false);
              };

          return {
            ...item,
            clickFn,
            isSelected,
            disabled,
          };
        }
      );

      return splitGroup(result, DAYS_NUM_IN_ONE_ROW);
    });

    return calendarDisplay.value;
  });

  const dayHeader = computed(() => {
    if (!displayDate.value) return '';
    const { y, m } = get(displayDate.value);
    const monthList = monthStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { month: 'long' })
    );

    return `${monthList[m]} ${y}`;
  });

  const monthHeader = computed(() => {
    if (!displayDate.value) return;
    const { y } = get(displayDate.value);

    return `${y}`;
  });

  const monthBody = computed(() => {
    if (!displayDate.value) return [];
    const { y } = get(displayDate.value);

    const monthList = monthStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { month: 'short' })
    );
    const setDisplayMonth = (monthVal: number) => {
      const selectMonth = new Date(y, monthVal);
      setDisplayDate(selectMonth);
      changeViewMode(ViewMode.Day);
    };

    const transformMonth = (months: string[]): CalendarBtn[] => {
      const getIsSelected = (month: number) => {
        return !!safeDate.value.find(item => item.getMonth() === month);
      };
      return months.map((m, index) => ({
        value: index,
        text: m,
        clickFn: () => setDisplayMonth(index),
        disabled: false,
        // FIXME: 判斷月份應該要也要判斷年份
        isSelected: getIsSelected(index),
      }));
    };
    const pipeLine = pipe(transformMonth, (months: CalendarBtn[]) =>
      splitGroup(months, 3)
    );
    const monthGroup = pipeLine(monthList) as CalendarBtn[][];

    return monthGroup;
  });

  const yearHeader = computed(() => {
    if (!displayDate.value) return '';
    const y = getDecade(displayDate.value);
    return `${y + 1} - ${y + 10}`;
  });

  const yearBody = computed(() => {
    if (!displayDate.value) return [];
    const year = getDecade(displayDate.value);
    const years = Array.from({ length: 10 }, (_, index) => year + index + 1);

    const setDisplayYear = (yearVal: number) => {
      const selectYear = new Date(yearVal, 1);
      setDisplayDate(selectYear);
      changeViewMode(ViewMode.Month);
    };

    const getIsSelected = (year: number) => {
      return !!safeDate.value.find(item => item.getFullYear() === year);
    };

    const transformYear = (months: number[]): CalendarBtn[] => {
      return months.map((y, index) => ({
        value: index,
        text: String(y),
        clickFn: () => setDisplayYear(y),
        disabled: false,
        isSelected: getIsSelected(y),
      }));
    };

    return splitGroup(transformYear(years), 3);
  });
  const decadeHeader = computed(() => {
    if (!displayDate.value) return '';
    const y = getCentury(displayDate.value);
    return `${y + 1} - ${y + 100}`;
  });

  const decadeBody = computed(() => {
    if (!displayDate.value) return [];
    const decade = getCentury(displayDate.value);
    const decades = Array.from({ length: 10 }, (_, index) => {
      const RATE = 10;

      return {
        value: decade + index * RATE,
        text: `${decade + index * RATE + 1} - ${decade + (index + 1) * RATE}`,
      };
    });

    const setDisplayDecade = (yearVal: number) => {
      const selectDecade = new Date(yearVal, 1);
      setDisplayDate(selectDecade);
      changeViewMode(ViewMode.Year);
    };

    const getIsSelected = (itemDate: Date) => {
      return !!safeDate.value.find(
        item => getDecade(item) === getDecade(itemDate)
      );
    };

    const transformDecade = (decade: typeof decades): CalendarBtn[] => {
      return decade.map(item => ({
        ...item,
        clickFn: () => setDisplayDecade(item.value),
        disabled: false,
        isSelected: getIsSelected(new Date(item.value, 1)),
      }));
    };

    return splitGroup(transformDecade(decades), 3);
  });

  return {
    displayDate,
    setDisplayDate,
    viewMode,
    changeViewMode,
    weekdayDateList,
    dayHeader,
    dayBody,
    monthHeader,
    monthBody,
    yearHeader,
    yearBody,
    decadeHeader,
    decadeBody,
  };
};
