import { computed } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import getTimeLocale from '@/helpers/getTimeLocale';
import { CalendarBtn, UseFnParams, ViewMode } from '@/types/datePicker';
import createRange from '@/utils/createRange';
import inRange from '@/utils/inRange';
import splitGroup from '@/utils/splitGroup';
import { get } from '@/utils/time/get';
import getCentury from '@/utils/time/getCentury';
import getDecade from '@/utils/time/getDecade';
import getEndTimeOfTheDate from '@/utils/time/getEndTimeOfTheDate';
import getStartTimeOfTheDate from '@/utils/time/getStartTimeOfTheDate';
import isSameDate from '@/utils/time/isSameDate';
import isToday from '@/utils/time/isToday';

import type { Ref } from 'vue';
const useSafeDateValue = (date: Ref<Date | Date[]>, index: 0 | 1) => {
  return computed(() => {
    const value = date.value;
    if (Array.isArray(value)) return value[index];
    return value;
  });
};

export default useSafeDateValue;

export const useDateRange = (params: UseFnParams) => {
  const { date, setDate, disabledDate, toggleOpen, firstDayOfWeek, locale } =
    params;

  const date1 = useSafeDateValue(date, 0);
  const date2 = useSafeDateValue(date, 1);

  const [displayDate, setDisplayDate] = useActive(date1.value);
  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);
  const [hoverDate, setHoverDate] = useActive(date1.value);

  const monthStrList = createRange(12).map(item => `2023-${1 + item}-1`);

  const dayHeader = computed(() => {
    if (!displayDate.value) return '';
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

  const dayBody = computed(() => {
    if (!displayDate.value) return [];

    const isChoosingDateRange = computed(
      () => date1.value !== undefined && date2.value === undefined
    );
    const isRangeHoverHandler = (itemDate: Date) => {
      if (!isChoosingDateRange.value || !hoverDate.value || !date1.value)
        return false;

      if (hoverDate.value < date1.value)
        return itemDate < date1.value && itemDate > hoverDate.value;
      return itemDate > date1.value && itemDate < hoverDate.value;
    };

    // copy from old file
    // const [hoverDate, setHoverDate] = useActive(date.value);
    //  const isRangeHoverHandler = (itemDate: Date) => {
    //   if (!Array.isArray(date)) return false;
    //   if (hoverDate < date[0])
    //     return itemDate < date[0] && itemDate > hoverDate.value;
    //   return itemDate > date[0] && itemDate < hoverDate.value;
    // };

    const result = getCalendar(displayDate.value, firstDayOfWeek.value).map(
      item => {
        if (!displayDate.value) return [];

        const value = item.value as Date;
        const isSelected = (function () {
          // const [date1, date2] = date.value;
          if (date1.value === undefined) return false;
          if (isChoosingDateRange.value) return isSameDate(value, date1.value);
          if (date1.value === undefined || date2.value === undefined)
            return false;

          const transformDate1 = getStartTimeOfTheDate(date1.value);
          const transformDate2 = getStartTimeOfTheDate(date2.value);

          return inRange(value, transformDate1, transformDate2);
        })();

        const disabled = (function () {
          const compareDate = isToday(value)
            ? getEndTimeOfTheDate(value)
            : value;
          return disabledDate(compareDate);
        })();

        const clickFn = disabled
          ? undefined
          : () => {
              setDisplayDate(value);
              if (isChoosingDateRange.value) {
                if (date1.value === undefined) return;
                if (value < date1.value) setDate([value, date1.value]);
                else setDate([date1.value, value]);
                toggleOpen(false);
              } else setDate([value]);
            };

        return {
          ...item,
          clickFn,
          onMouseEnter: () => {
            // TODO: 可以優化成用 css hover + not:hover + tailwind group
            setHoverDate(value);
          },
          isRangeHover: isRangeHoverHandler(value),
          isSelected,
          disabled,
        };
      }
    ) as CalendarBtn[];
    if (result.length === 0) return [];
    return splitGroup(result, DAYS_NUM_IN_ONE_ROW);
  });

  const monthHeader = computed(() => {
    if (!displayDate.value) return;
    const { y } = get(displayDate.value);
    return `${y}`;
  });

  const monthBody = computed(() => {
    if (!displayDate.value) return '';
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
        if (date1.value === undefined || date2.value === undefined)
          return false;
        const target = new Date(y, month);
        return inRange(target, date1.value, date2.value);
      };
      return months.map((m, index) => ({
        value: index,
        text: m,
        clickFn: () => setDisplayMonth(index),
        disabled: false,
        isSelected: getIsSelected(index),
      }));
    };

    return splitGroup(transformMonth(monthList), 3);
  });

  const yearHeader = computed(() => {
    if (!displayDate.value) return '';
    const y = getDecade(displayDate.value);
    return `${y + 1} - ${y + 10}`;
  });

  const yearBody = computed(() => {
    if (!displayDate.value) return [];

    const year = getDecade(displayDate.value);
    // FIXME: 年度 selected 壞掉
    const years = Array.from({ length: 10 }, (_, index) => year + index + 1);

    const setDisplayYear = (yearVal: number) => {
      const selectYear = new Date(yearVal, 1);
      setDisplayDate(selectYear);
      changeViewMode(ViewMode.Month);
    };

    const getIsSelected = (year: number) => {
      if (date1.value === undefined || date2.value === undefined) return false;

      const target = new Date(year, 1);
      return inRange(target, date1.value, date2.value);
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
      if (date1.value === undefined || date2.value === undefined) return false;
      return inRange(itemDate, date1.value, date2.value);
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
