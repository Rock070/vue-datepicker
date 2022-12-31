<script setup lang="ts">
import { createPopper } from '@popperjs/core';
import { onClickOutside as useClickOutside, useToggle } from '@vueuse/core';
import { format } from 'date-fns';
import { computed, nextTick, onUnmounted, ref, toRef, watch } from 'vue';

import MolDay from '@/components/Molecules/MolDaysView.vue';
import MolDecade from '@/components/Molecules/MolDecadesView.vue';
import MolMonth from '@/components/Molecules/MolMonthsView.vue';
import MolYear from '@/components/Molecules/MolYearsView.vue';
import getNavigatorLocale from '@/helpers/getNavigatorLocale';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarMultiple } from '@/hooks/useCalendarMultiple';
import { useDateRange } from '@/hooks/useDateRange.js';
import {
  Mode,
  PopperOffsetCtx,
  UseFnParams,
  ViewMode,
} from '@/types/datePicker';
import { isArray, isValidDate } from '@/utils/is';

import type { Placement } from '@popperjs/core';
import type { Ref } from 'vue';

export type PopperInstance = ReturnType<typeof createPopper>;

// TODO: start-day-of-week, lang, shortcut,
export interface CalendarProps {
  modelValue?: Date | Date[];
  mode?: Mode;
  format?: string;
  disabledDate?: (date: Date) => boolean;
  firstDayOfWeek?: number | string;
  width?: number;
  locale?: Intl.LocalesArgument;
  placement?: Placement;
}

interface CalendarEmits {
  (type: 'update:model-value', val: Date | Date[]): void;
  (type: 'open'): void;
  (type: 'close'): void;
  (type: 'click-outside', event: PointerEvent): void;
}

const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: undefined,
  width: 300,
  mode: Mode.DatePicker,
  format: 'yyyy-MM-dd',
  firstDayOfWeek: 0, // Sets the day that determines the first week of the year, starting with 0 for Sunday.
  disabledDate: () => false,
  placement: 'auto',
  locale: getNavigatorLocale(),
});

const emits = defineEmits<CalendarEmits>();

const inputRef = ref<HTMLInputElement | null>(null);
const calendarRef = ref<HTMLDivElement | null>(null);
const modelValue = toRef(props, 'modelValue');
const [isOpen, toggleOpen] = useToggle(false);

const setDate = (val: Date | Date[]) => {
  emits('update:model-value', val);
};

if (props.modelValue == undefined) {
  // eslint-disable-next-line no-console
  console.error(
    'date is undefined, it has to be value as Date type with default mode or Date[] type with multiple, range mode'
  );
}

if (props.mode == undefined) {
  // eslint-disable-next-line no-console
  console.error('mode');
}
if (props.mode === Mode.DateRange && !isArray(props.modelValue)) {
  // eslint-disable-next-line no-console
  console.error('Date need to be array type');
}

const useFn = (function () {
  const params = {
    date: modelValue as Ref<Date>,
    setDate: setDate as (date: Date) => void,
    disabledDate: props.disabledDate,
    toggleOpen,
    firstDayOfWeek: computed(() =>
      Math.round(Number(props.firstDayOfWeek) % 7)
    ),
    locale: computed(() => props.locale),
  };
  switch (props.mode) {
    // case Mode.DateRange:
    //   return () =>
    //     useDateRange(
    //       modelValue as Ref<Date[]>,
    //       setDate as (date: Date[]) => any,
    //       props.disabledDate,
    //       toggleOpen
    //     );
    // case Mode.DatePickerMultiple:
    //   return () =>
    //     useCalendarMultiple(
    //       modelValue as Ref<Date[]>,
    //       setDate as (date: Date[]) => any,
    //       props.disabledDate,
    //       toggleOpen
    //     );
    case Mode.DatePicker:
    default:
      return () => useCalendar(params);
  }
})();

const {
  viewMode,
  changeViewMode,
  displayDate,
  setDisplayDate,
  decadeHeader,
  yearHeader,
  monthHeader,
  dayHeader,
  decadeBody,
  weekdayDateList,
  yearBody,
  monthBody,
  dayBody,
} = useFn();

const dateString = computed(() => {
  if (modelValue.value === undefined) return '';
  if (isArray(modelValue.value))
    return modelValue.value.map(item => format(item, props.format)).toString();
  return format(modelValue.value, props.format);
});

const onInputChange = (event: Event) => {
  if (!event.target) return;
  let val = (event.target as HTMLInputElement).value;
  const newVal = new Date(val);
  if (!isValidDate(newVal)) {
    (event.target as HTMLInputElement).blur();
    (event.target as HTMLInputElement).value = dateString.value;
    toggleOpen(false);
    return;
  }
  setDate(newVal);
  setDisplayDate(newVal);
  toggleOpen(false);
};

useClickOutside(calendarRef, event => {
  emits('click-outside', event);
  toggleOpen(false);
});

const displayViewComponentPkg = computed(() => {
  switch (viewMode.value) {
    case ViewMode.Decade:
      return {
        key: 'decade',
        component: MolDecade,
        header: decadeHeader.value,
        body: decadeBody,
      };
    case ViewMode.Year:
      return {
        key: 'year',
        component: MolYear,
        header: yearHeader.value,
        body: yearBody,
      };
    case ViewMode.Month:
      return {
        key: 'month',
        component: MolMonth,
        header: monthHeader.value,
        body: monthBody,
      };
    case ViewMode.Day:
    default:
      return {
        key: 'day',
        component: MolDay,
        header: dayHeader.value,
        body: dayBody.value,
      };
  }
});

let instance: PopperInstance | null = null;

const destroyAndCreatePopperInstanceHandler = () => {
  if (!calendarRef.value || !inputRef.value) return;

  // calendarRef.value.getClientRects()

  if (instance) {
    instance.destroy();
    instance = null;
  }

  instance = createPopper(inputRef.value, calendarRef.value, {
    placement: props.placement,
    // placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset(ctx: PopperOffsetCtx) {
            const { placement } = ctx;
            if (/top/.test(placement)) {
              return [0, 10];
            }
            return [0, 5];
          },
        },
      },
    ],
  });
};
watch(isOpen, val => {
  if (!val) return emits('close');
  if (!inputRef.value) return;

  emits('open');
});

watch([isOpen, () => props.placement], pkg => {
  const [isOpenVal, placement] = pkg;

  if (!isOpenVal) return;

  nextTick(() => {
    destroyAndCreatePopperInstanceHandler();
  });
});

onUnmounted(() => {
  if (instance) {
    instance.destroy();
    instance = null;
  }
});
</script>

<template>
  <div
    data-cy="calendar"
    class="space-y-6"
  >
    <input
      ref="inputRef"
      :value="dateString"
      type="text"
      @input.prevent
      @change="onInputChange"
      @click.self="toggleOpen(true)"
    >
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="calendarRef"
        class="text-sm bg-gray-500 rounded-md p-2 shadow-sm shadow-gray"
        :style="{ width: `${width}px`}"
      >
        <component
          :is="displayViewComponentPkg.component"
          :display-date="displayDate"
          :locale="locale"
          :first-day-of-week="firstDayOfWeek"
          :change-view-mode="changeViewMode"
          :set-display-date="setDisplayDate"
          :decade-header="decadeHeader"
          :year-header="yearHeader"
          :month-header="monthHeader"
          :day-header="dayHeader"
          :decade-body="decadeBody"
          :weekday-date-list="weekdayDateList"
          :year-body="yearBody"
          :month-body="monthBody"
          :day-body="dayBody"
        />
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss">
.calendar {
  &__date--disabled {
    @apply bg-gray-300 cursor-not-allowed pointer-events-none;
  }
}
</style>


