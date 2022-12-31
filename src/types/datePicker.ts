import type { Placement } from '@popperjs/core';
import type { ComputedRef, Ref } from 'vue';

export interface CalendarBtn {
  value: Date | number;
  text?: string | number;

  time?: Time;
  timestamp?: number;

  isSelected: boolean;
  disabled: boolean;
  isThisMonth?: boolean;

  clickFn?: () => void;
  isRangeHover?: boolean;
  onMouseEnter?: (...arg: any[]) => void;
  mouseFn?: () => void;
}

// TODO 整合 BTN TYPE
export interface Time {
  y: number;
  m: number;
  d: number;
  t: number;
  day: number;
}

export interface TimeItem {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const enum Mode {
  DatePicker = 1,
  DatePickerMultiple = 1 << 1,
  DateRange = 1 << 2,
}

export const enum ViewMode {
  Day = 1,
  Month = 1 << 1,
  Year = 1 << 2,
  Decade = 1 << 3,
}

export const enum WheelDirection {
  NONE,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
}

export interface PopperOffsetCtx {
  reference: DOMRect;
  popper: DOMRect;
  placement: Placement;
}

export interface UseFnParams {
  date: Ref<Date>;
  setDate: (date: Date) => void;
  disabledDate: (date: Date) => boolean;
  toggleOpen: (value?: boolean | undefined) => boolean;
  locale: ComputedRef<Intl.LocalesArgument>;
  firstDayOfWeek: ComputedRef<number>;
}
