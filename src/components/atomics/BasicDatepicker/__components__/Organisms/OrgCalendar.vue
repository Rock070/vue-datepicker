<script setup lang="ts">
import { onClickOutside as useClickOutside, useToggle } from '@vueuse/core';
import { format } from 'date-fns';
import { computed, ref, toRef, watch } from 'vue';

import MolDay from '@/components/Molecules/MolDaysView.vue';
import MolDecade from '@/components/Molecules/MolDecadesView.vue';
import MolMonth from '@/components/Molecules/MolMonthsView.vue';
import MolYear from '@/components/Molecules/MolYearsView.vue';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarMultiple } from '@/hooks/useCalendarMultiple';
import { useDateRange } from '@/hooks/useDateRange.js';
import { Mode, ViewMode } from '@/types/datePicker';
import { isArray, isValidDate } from '@/utils/is';

import type { Ref } from 'vue';

// TODO: start-day-of-week, lang, shortcut,
export interface CalendarProps {
  modelValue?: Date | Date[];
  mode?: Mode;
  format?: string;
  disabledDate?: (date: Date) => boolean;
  width?: number;
}

interface CalendarEmits {
  (type: 'update:model-value', val: Date | Date[]): void;
}

const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: undefined,
  width: 350,
  mode: Mode.DatePicker,
  format: 'yyyy-MM-dd',
  disabledDate: () => false,
});

const emits = defineEmits<CalendarEmits>();

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
if (props.mode & Mode.DateRange && !isArray(props.modelValue)) {
  // eslint-disable-next-line no-console
  console.error('Date need to be array type');
}

const useFn = (function () {
  switch (props.mode) {
    case Mode.DateRange:
      return () =>
        useDateRange(
          modelValue as Ref<Date[]>,
          setDate as (date: Date[]) => any,
          props.disabledDate,
          toggleOpen
        );
    case Mode.DatePickerMultiple:
      return () =>
        useCalendarMultiple(
          modelValue as Ref<Date[]>,
          setDate as (date: Date[]) => any,
          props.disabledDate,
          toggleOpen
        );
    case Mode.DatePicker:
    default:
      return () =>
        useCalendar(
          modelValue as Ref<Date>,
          setDate as (date: Date) => any,
          props.disabledDate,
          toggleOpen
        );
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

const inputRef = ref<HTMLInputElement | null>(null);
const calendarRef = ref<HTMLDivElement | null>(null);

const calendarStyle = ref<Record<string, string | undefined> | undefined>(
  undefined
);
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

watch(isOpen, val => {
  if (!val || !inputRef.value) return;

  const inputRect = inputRef.value.getBoundingClientRect();

  // bottom: 479
  // height: 194
  // left: 0
  // right: 350
  // top: 285
  // width: 350
  // x: 0
  // y: 285
  const CALENDAR_HEIGHT = 250;
  // FIXME TODO: 優化算法(根據剩餘空間計算，彈窗打開就鎖住 scroll)、偏移 props
  // if (window?.innerHeight)
  const y =
    inputRect.top < inputRect.bottom
      ? { top: `${inputRect.top + inputRect.height + 2}px` }
      : { bottom: `${inputRect.bottom - inputRect.height - 2}px` };
  const x =
    inputRect.left < inputRect.right
      ? { left: `${inputRect.left - inputRect.width / 2}px` }
      : { right: `${inputRect.right + inputRect.width / 2}px` };

  calendarStyle.value = {
    width: `${props.width}px`,
    ...y,
    ...x,
  };
});

useClickOutside(calendarRef, event => {
  toggleOpen(false);
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
        :style="calendarStyle"
        class="absolute text-sm bg-gray-500 rounded-md p-2 shadow-sm shadow-gray"
      >
        <component
          :is="displayViewComponentPkg.component"
          :display-date="displayDate"
          :change-view-mode="changeViewMode"
          :set-display-date="setDisplayDate"
          :decade-header="decadeHeader"
          :year-header="yearHeader"
          :month-header="monthHeader"
          :day-header="dayHeader"
          :decade-body="decadeBody"
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


