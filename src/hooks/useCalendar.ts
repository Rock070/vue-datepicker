import { computed, ref, watch } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import getTimeLocale from '@/helpers/getTimeLocale';
import isSameYearMonth from '@/helpers/isSameYearMonth';
import { CalendarBtn, UseFnParams, ViewMode } from '@/types/datePicker';
import createRange from '@/utils/createRange';
import pipe from '@/utils/pipe';
import splitGroup from '@/utils/splitGroup';
import { get } from '@/utils/time/get';
import getCentury from '@/utils/time/getCentury';
import getDecade from '@/utils/time/getDecade';
import getEndTimeOfTheDate from '@/utils/time/getEndTimeOfTheDate';
import isSameDate from '@/utils/time/isSameDate';
import isSameDecade from '@/utils/time/isSameDecade';
import isSameYear from '@/utils/time/isSameYear';
import isToday from '@/utils/time/isToday';

export const useCalendar = (params: UseFnParams) => {
  const { date, setDate, disabledDate, toggleOpen, firstDayOfWeek, locale } =
    params;
  const [displayDate, setDisplayDate] = useActive(date.value);
  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);
  const decadeHeader = ref('');
  const monthHeader = ref('');
  const yearHeader = ref('');
  const dayHeader = ref('');
  const decadeBody = ref<CalendarBtn[][]>([]);
  const yearBody = ref<CalendarBtn[][]>([]);
  const monthBody = ref<CalendarBtn[][]>([]);
  const dayBody = ref<CalendarBtn[][]>([]);

  // body
  const getDayHeader = () => {
    const { y, m } = get(displayDate.value);
    const monthStrList = createRange(12).map(item => `2023-${1 + item}-1`);
    const monthList = monthStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { month: 'long' })
    );
    dayHeader.value = `${monthList[m]} ${y}`;
  };

  const weekdayDateList = computed(() => {
    const weekDayStrList = createRange(7).map(
      item => `2023-1-${1 + item + firstDayOfWeek.value}`
    ); // 2023-1-1 is Sunday);
    return weekDayStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { weekday: 'short' })
    );
  });

  const getDayBody = () => {
    const [hoverDate, setHoverDate] = useActive(date.value);

    const isRangeHoverHandler = (itemDate: Date) => {
      if (!Array.isArray(date)) return false;
      if (hoverDate < date[0])
        return itemDate < date[0] && itemDate > hoverDate.value;
      return itemDate > date[0] && itemDate < hoverDate.value;
    };

    const calendarDisplay = computed<CalendarBtn[][]>(() => {
      const result = getCalendar(displayDate.value, firstDayOfWeek.value).map(
        item => {
          const value = item.value as Date;
          const isSelected = isSameDate(value, date.value);

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
                setDate(value);
                toggleOpen(false);
              };

          return {
            ...item,
            clickFn,
            mouseseEnter: () => {
              // TODO: 可以優化成用 css hover + not:hover + tailwind group
              setHoverDate(value);
            },
            isRangeHover: isRangeHoverHandler(value),
            isSelected,
            disabled,
          };
        }
      );

      return splitGroup(result, DAYS_NUM_IN_ONE_ROW);
    });

    dayBody.value = calendarDisplay.value;
  };

  const getMonthsHeader = () => {
    const { y } = get(displayDate.value);
    monthHeader.value = `${y}`;
  };

  const getMonthsBody = () => {
    const monthStrList = createRange(12).map(item => `2023-${1 + item}-1`);
    const monthList = monthStrList.map(item =>
      getTimeLocale(new Date(item), locale.value, { month: 'short' })
    );

    const { y } = get(displayDate.value);
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
        isSelected: isSameYearMonth(date.value, new Date(y, index)),
      }));
    };
    const pipeLine = pipe(transformMonth, (months: CalendarBtn[]) =>
      splitGroup(months, 3)
    );
    const monthGroup = pipeLine(monthList) as CalendarBtn[][];
    monthBody.value = monthGroup;
  };

  const getYearsHeader = () => {
    const y = getDecade(displayDate.value);
    yearHeader.value = `${y + 1} - ${y + 10}`;
  };

  const getYearsBody = () => {
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
        isSelected: isSameYear(date.value, new Date(y, 1)),
      }));
    };
    const pipeLine = pipe(transformYear, (years: CalendarBtn[]) =>
      splitGroup(years, 3)
    );
    const yearGroup = pipeLine(years) as CalendarBtn[][];
    yearBody.value = yearGroup;
  };
  const getDecadesHeader = () => {
    const y = getCentury(displayDate.value);

    decadeHeader.value = `${y + 1} - ${y + 100}`;
  };

  const getDecadesBody = () => {
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
      if (!Array.isArray(date)) return isSameDecade(date.value, itemDate);

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
    const pipeLine = pipe(transformDecade, (decades: CalendarBtn[]) =>
      splitGroup(decades, 3)
    );
    const decadeGroup = pipeLine(decades) as CalendarBtn[][];
    decadeBody.value = decadeGroup;
  };

  watch(
    [date, displayDate, viewMode],
    () => {
      switch (viewMode.value) {
        case ViewMode.Day:
          getDayHeader();
          getDayBody();
          break;
        case ViewMode.Month:
          getMonthsHeader();
          getMonthsBody();
          break;
        case ViewMode.Year:
          getYearsHeader();
          getYearsBody();
          break;
        case ViewMode.Decade:
          getDecadesHeader();
          getDecadesBody();
          break;
      }
    },
    {
      immediate: true,
    }
  );

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
