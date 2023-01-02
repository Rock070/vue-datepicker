import { computed } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import getTimeLocale from '@/helpers/getTimeLocale';
import isSameYearMonth from '@/helpers/isSameYearMonth';
import { CalendarBtn, UseFnParams, ViewMode } from '@/types/datePicker';
import createRange from '@/utils/createRange';
import splitGroup from '@/utils/splitGroup';
import { get } from '@/utils/time/get';
import getCentury from '@/utils/time/getCentury';
import getDecade from '@/utils/time/getDecade';
import getEndTimeOfTheDate from '@/utils/time/getEndTimeOfTheDate';
import isSameDate from '@/utils/time/isSameDate';
import isSameDecade from '@/utils/time/isSameDecade';
import isSameYear from '@/utils/time/isSameYear';
import isToday from '@/utils/time/isToday';

import type { Ref } from 'vue';

const useSafeDateValue = (date: Ref<Date | Date[]>) => {
  return computed(() => {
    const value = date.value;
    if (Array.isArray(value)) return value[0] || new Date();
    return value;
  });
};

export const useCalendar = (params: UseFnParams) => {
  const { date, setDate, disabledDate, toggleOpen, firstDayOfWeek, locale } =
    params;

  const safeDate = useSafeDateValue(date);
  const [displayDate, setDisplayDate] = useActive(safeDate.value);
  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);

  const monthStrList = createRange(12).map(item => `2023-${1 + item}-1`);

  const dayHeader = computed(() => {
    const { y, m } = get(displayDate.value);
    const monthList = monthStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { month: 'long' })
    );
    return `${monthList[m]} ${y}`;
  });

  const weekdayDateList = computed(() => {
    const weekDayStrList = createRange(7).map(
      item => `2023-1-${1 + item + firstDayOfWeek.value}`
    ); // 2023-1-1 is Sunday;
    return weekDayStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { weekday: 'short' })
    );
  });

  const dayBody = computed<CalendarBtn[][]>(() => {
    const calendarDisplay: CalendarBtn[][] = (() => {
      const result = getCalendar(displayDate.value, firstDayOfWeek.value).map(
        item => {
          const value = item.value as Date;
          const isSelected = isSameDate(value, safeDate.value);

          const disabled = (() => {
            const compareDate = isToday(value)
              ? getEndTimeOfTheDate(value)
              : value;
            return disabledDate(compareDate);
          })();

          const clickFn = disabled
            ? undefined
            : () => {
                setDisplayDate(value);
                setDate(value);
                toggleOpen(false);
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
    })();

    return calendarDisplay;
  });

  const monthHeader = computed(() => {
    const { y } = get(displayDate.value);
    return `${y}`;
  });

  const monthBody = computed<CalendarBtn[][]>(() => {
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
      return months.map((m, index) => ({
        value: index,
        text: m,
        clickFn: () => setDisplayMonth(index),
        disabled: false,
        isSelected: isSameYearMonth(safeDate.value, new Date(y, index)),
      }));
    };

    return splitGroup(transformMonth(monthList), 3);
  });

  const yearHeader = computed(() => {
    const y = getDecade(displayDate.value);
    return `${y + 1} - ${y + 10}`;
  });

  const yearBody = computed<CalendarBtn[][]>(() => {
    const year = getDecade(displayDate.value);
    const years = Array.from({ length: 10 }, (_, index) => year + index + 1);

    const setDisplayYear = (yearVal: number) => {
      const selectYear = new Date(yearVal, 1);
      setDisplayDate(selectYear);
      changeViewMode(ViewMode.Month);
    };

    const transformYear = (months: number[]): CalendarBtn[] => {
      return months.map((y, index) => ({
        value: index,
        text: String(y),
        clickFn: () => setDisplayYear(y),
        disabled: false,
        isSelected: isSameYear(safeDate.value, new Date(y, 1)),
      }));
    };

    return splitGroup(transformYear(years), 3);
  });
  const decadeHeader = computed(() => {
    const y = getCentury(displayDate.value);

    return `${y + 1} - ${y + 100}`;
  });

  const decadeBody = computed<CalendarBtn[][]>(() => {
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
      if (!Array.isArray(date)) return isSameDecade(safeDate.value, itemDate);

      if (date[0] === undefined) return false;
      if (date[1] === undefined) return isSameDecade(date[0], itemDate);
      return date[0] <= itemDate && itemDate <= date[1];
    };

    const transformDecade = (months: typeof decades): CalendarBtn[] => {
      return months.map(item => ({
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
    dayHeader,
    dayBody,
    weekdayDateList,
    monthHeader,
    monthBody,
    yearHeader,
    yearBody,
    decadeHeader,
    decadeBody,
  };
};
