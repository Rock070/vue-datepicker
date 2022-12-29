import { computed, ref, watch } from 'vue';

import useActive from '@/composables/useActive';
import { DAYS_NUM_IN_ONE_ROW, MONTH_NAMES } from '@/helpers/const';
import getCalendar from '@/helpers/getCalendar';
import { CalendarBtn, ViewMode } from '@/types/datePicker';
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

export const useCalendarMultiple = (
  date: Ref<Date[]>,
  setDate: (date: Date[]) => void,
  disabledDate: (date: Date) => boolean,
  toggleOpen: (val: boolean) => boolean
) => {
  const [displayDate, setDisplayDate] = useActive(date.value[0]);

  const [viewMode, changeViewMode] = useActive<ViewMode>(ViewMode.Day);

  const dayHeader = ref('');
  const dayBody = ref<CalendarBtn[][]>([]);
  const monthHeader = ref('');
  const monthBody = ref<CalendarBtn[][]>([]);
  const yearHeader = ref('');
  const yearBody = ref<CalendarBtn[][]>([]);
  const decadeHeader = ref('');
  const decadeBody = ref<CalendarBtn[][]>([]);

  // body

  const getDayBody = () => {
    const calendarDisplay = computed<CalendarBtn[][]>(() => {
      if (!displayDate.value) return [];
      const result = getCalendar(displayDate.value).map(item => {
        const value = item.value as Date;

        const isSelected = !!date.value.find(item => isSameDate(item, value));

        const setDateImpl = (val: Date) => {
          setDisplayDate(val);
          setDate([...(toggleArrayValue(date.value, val) as Date[])]);
        };

        const disabled = (function () {
          const compareDate = isToday(value)
            ? getEndTimeOfTheDate(value)
            : value;
          return disabledDate(compareDate);
        })();

        const clickFn = disabled
          ? undefined
          : () => {
              setDateImpl(value);
              toggleOpen(false);
            };

        return {
          ...item,
          clickFn,
          isSelected,
          disabled,
        };
      });

      return splitGroup(result, DAYS_NUM_IN_ONE_ROW);
    });

    dayBody.value = calendarDisplay.value;
  };

  const getDayHeader = () => {
    if (!displayDate.value) return '';
    const { y, m } = get(displayDate.value);

    dayHeader.value = `${MONTH_NAMES[m]} ${y}`;
  };

  const getMonthsHeader = () => {
    if (!displayDate.value) return;
    const { y } = get(displayDate.value);

    monthHeader.value = `${y}`;
  };

  const getMonthsBody = () => {
    if (!displayDate.value) return [];
    const { y } = get(displayDate.value);
    const setDisplayMonth = (monthVal: number) => {
      const selectMonth = new Date(y, monthVal);
      setDisplayDate(selectMonth);
      changeViewMode(ViewMode.Day);
    };

    const transformMonth = (months: string[]): CalendarBtn[] => {
      const getIsSelected = (month: number) => {
        return !!date.value.find(item => item.getMonth() === month);
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
    const years = Array.from({ length: 10 }, (_, index) => year + index + 1);

    const setDisplayYear = (yearVal: number) => {
      const selectYear = new Date(yearVal, 1);
      setDisplayDate(selectYear);
      changeViewMode(ViewMode.Month);
    };

    const getIsSelected = (year: number) => {
      return !!date.value.find(item => item.getFullYear() === year);
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
      return !!date.value.find(item => getDecade(item) === getDecade(itemDate));
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
    monthHeader,
    monthBody,
    yearHeader,
    yearBody,
    decadeHeader,
    decadeBody,
  };
};
