import { computed, ref, watch } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW, MONTH_NAMES } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import { CalendarBtn, ViewMode } from '@/types/datePicker';
import inRange from '@/utils/inRange';
import pipe from '@/utils/pipe';
import splitGroup from '@/utils/splitGroup';
import { get } from '@/utils/time/get';
import getCentury from '@/utils/time/getCentury';
import getDecade from '@/utils/time/getDecade';
import getEndTimeOfTheDate from '@/utils/time/getEndTimeOfTheDate';
import getStartTimeOfTheDate from '@/utils/time/getStartTimeOfTheDate';
import isSameDate from '@/utils/time/isSameDate';
import isToday from '@/utils/time/isToday';

import type { Ref } from 'vue';

export const useDateRange = (
  date: Ref<Date[]>,
  setDate: (date: Date[]) => void,
  disabledDate: (date: Date) => boolean,
  toggleOpen: (val: boolean) => boolean
) => {
  const [displayDate, setDisplayDate] = useActive(date.value[0]);
  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);
  const [hoverDate, setHoverDate] = useActive(date.value[0]);

  const dayHeader = ref('');
  const dayBody = ref<CalendarBtn[][]>([]);
  const monthHeader = ref('');
  const monthBody = ref<CalendarBtn[][]>([]);
  const yearHeader = ref('');
  const yearBody = ref<CalendarBtn[][]>([]);
  const decadeHeader = ref('');
  const decadeBody = ref<CalendarBtn[][]>([]);

  const getDayHeader = () => {
    if (!displayDate.value) return;
    const { y, m } = get(displayDate.value);

    dayHeader.value = `${MONTH_NAMES[m]} ${y}`;
  };

  const getDayBody = () => {
    if (!displayDate.value) return [];

    const isChoosingDateRange = computed(
      () => date.value[0] !== undefined && date.value[1] === undefined
    );
    const isRangeHoverHandler = (itemDate: Date) => {
      if (!isChoosingDateRange.value || !hoverDate.value || !date.value[0])
        return false;

      if (hoverDate.value < date.value[0])
        return itemDate < date.value[0] && itemDate > hoverDate.value;
      return itemDate > date.value[0] && itemDate < hoverDate.value;
    };

    // copy from old file
    // const [hoverDate, setHoverDate] = useActive(date.value);
    //  const isRangeHoverHandler = (itemDate: Date) => {
    //   if (!Array.isArray(date)) return false;
    //   if (hoverDate < date[0])
    //     return itemDate < date[0] && itemDate > hoverDate.value;
    //   return itemDate > date[0] && itemDate < hoverDate.value;
    // };

    const result = getCalendar(displayDate.value).map(item => {
      if (!displayDate.value) return [];

      const value = item.value as Date;
      const isSelected = (function () {
        const [date1, date2] = date.value;
        if (date1 === undefined) return false;
        if (isChoosingDateRange.value) return isSameDate(value, date1);
        if (date1 === undefined || date2 === undefined) return false;

        const transformDate1 = getStartTimeOfTheDate(date1);
        const transformDate2 = getStartTimeOfTheDate(date2);

        return inRange(value, transformDate1, transformDate2);
      })();

      const disabled = (function () {
        const compareDate = isToday(value) ? getEndTimeOfTheDate(value) : value;
        return disabledDate(compareDate);
      })();

      const clickFn = disabled
        ? undefined
        : () => {
            setDisplayDate(value);
            if (isChoosingDateRange.value) {
              if (date.value[0] === undefined) return;
              if (value < date.value[0]) setDate([value, ...date.value]);
              else setDate([...date.value, value]);
            } else setDate([value]);

            toggleOpen(false);
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
    }) as CalendarBtn[];
    if (result.length === 0) return [];
    dayBody.value = splitGroup(result, DAYS_NUM_IN_ONE_ROW);
  };

  const getMonthsHeader = () => {
    if (!displayDate.value) return;
    const { y } = get(displayDate.value);
    monthHeader.value = `${y}`;
  };

  const getMonthsBody = () => {
    if (!displayDate.value) return '';
    const { y } = get(displayDate.value);
    const setDisplayMonth = (monthVal: number) => {
      const selectMonth = new Date(y, monthVal);
      setDisplayDate(selectMonth);
      changeViewMode(ViewMode.Day);
    };

    const transformMonth = (months: string[]): CalendarBtn[] => {
      const getIsSelected = (month: number) => {
        const [date1, date2] = date.value;
        if (date1 === undefined || date2 === undefined) return false;
        const target = new Date(y, month);
        return inRange(target, date1, date2);
      };
      return months.map((m, index) => ({
        value: index,
        text: m,
        clickFn: () => setDisplayMonth(index),
        disabled: false,
        isSelected: getIsSelected(index),
      }));
    };
    const pipeLine = pipe(transformMonth, (months: CalendarBtn[]) =>
      splitGroup(months, 3)
    );
    const monthGroup = pipeLine(MONTH_NAMES) as CalendarBtn[][];

    monthBody.value = monthGroup;
  };

  const getYearsHeader = () => {
    if (!displayDate.value) return '';
    const y = getDecade(displayDate.value);
    yearHeader.value = `${y + 1} - ${y + 10}`;
  };

  const getYearsBody = () => {
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
      const [date1, date2] = date.value;
      if (date1 === undefined || date2 === undefined) return false;

      const target = new Date(year, 1);
      return inRange(target, date1, date2);
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
    const pipeLine = pipe(transformYear, (years: CalendarBtn[]) =>
      splitGroup(years, 3)
    );
    const yearGroup = pipeLine(years) as CalendarBtn[][];

    yearBody.value = yearGroup;
  };
  const getDecadesHeader = () => {
    if (!displayDate.value) return '';
    const y = getCentury(displayDate.value);

    decadeHeader.value = `${y + 1} - ${y + 100}`;
  };

  const getDecadesBody = () => {
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
      const [date1, date2] = date.value;
      if (date1 === undefined || date2 === undefined) return false;
      return inRange(itemDate, date1, date2);
    };

    const transformDecade = (decade: typeof decades): CalendarBtn[] => {
      return decade.map(item => ({
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
    [date, displayDate, viewMode, hoverDate],
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
    monthHeader,
    monthBody,
    yearHeader,
    yearBody,
    decadeHeader,
    decadeBody,
  };
};
