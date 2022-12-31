<script lang="ts">
// eslint-disable-next-line import/order
import { Mode } from '@/types/datePicker';

/**
 * modelValue
 * mode
 * format
 * disabledDate
 * firstDayOfWeek
 * width
 * locale
 * placement
 */
const modeOptions = [
  {
    label: 'DatePicker',
    value: Mode.DatePicker,
  },
  {
    label: 'DateRange',
    value: Mode.DateRange,
  },
  {
    label: 'DatePickerMultiple',
    value: Mode.DatePickerMultiple,
  },
];

const localesOptions = [
  {
    label: '繁體中文',
    value: 'zh-tw',
  },
  {
    label: '韓文',
    value: 'ko',
  },
  {
    label: '越南語',
    value: 'vi',
  },
  {
    label: '英文',
    value: 'en',
  },
  {
    label: '日語',
    value: 'ja-jp',
  },
];
</script>

<script setup lang="ts">
import { ref } from 'vue';

import BasicButton from '@/components/Atoms/BasicButton.vue';
import OrgCalendar from '@/components/Organisms/OrgCalendar.vue';
import useActive from '@/composables/useActive';

const [date, setDate] = useActive(new Date());
const [MultiDate, setMultiDate] = useActive([new Date()]);
const [rangeDate, setRangeDate] = useActive([new Date()]);

// ---------------- test state ----------------
const mode = ref(Mode.DatePicker);
const locale = ref('zh-tw');
const firstDayOfWeek = ref(0);

const disabledDate = (date: Date) => {
  if (firstDayOfWeek.value % 2) return date.getDay() % 2 === 0;
  return false;
};
</script>

<template>
  <div class="w-[4000px] h-[2000px] flex flex-col items-center justify-center">
    <!-- 測試狀態區 -->
    <div>
      <strong>選狀態</strong>
      <br>
      <div class="grid grid-cols-4 space-x-2">
        <!-- 模式 -->
        <div>
          <label for="mode">mode</label>
          <br>
          <select
            id="mode"
            v-model="mode"
          >
            <option
              v-for="modeItem in modeOptions"
              :key="modeItem.value"
              :disabled="modeItem.value !== Mode.DatePicker"
              :value="modeItem.value"
            >
              {{ modeItem.label }}
            </option>
          </select>
        </div>
        <!-- 每週第一天 -->
        <div>
          <label for="first-day-of-week">first-day-of-week</label>
          <br>
          <input
            id="first-day-of-week"
            v-model="firstDayOfWeek"
          >
        </div>
        <!-- 語系 -->
        <div>
          <label for="locale">locale</label>
          <br>
          <select
            id="locale"
            v-model="locale"
          >
            <option
              v-for="localeItem in localesOptions"
              :key="localeItem.value"
              :value="localeItem.value"
            >
              {{ localeItem.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="relative flex flex-col space-y-10 items-center text-center">
      <section>
        <div>Calendar</div>
        <div>{{ date.toLocaleDateString() }}</div>
        <OrgCalendar
          v-model="date"
          format="yyyy/MM/dd hh:mm:ss"
          :mode="Mode.DatePicker"
          :first-day-of-week="firstDayOfWeek"
          :locale="locale"
          :disabled-date="disabledDate"
        />
      </section>
      <!-- <section>
        <div>Multiple</div>
        <div>{{ date.toLocaleDateString() }}</div>
        <OrgCalendar
          v-model="MultiDate"
          :mode="Mode.DatePickerMultiple"
          :disabled-date="disabledDate"
        />
      </section>
      <section>
        <div>rangeDate</div>
        <div>{{ rangeDate }}</div>
        <div>{{ date.toLocaleDateString() }}</div>
        <OrgCalendar
          v-model="rangeDate"
          :mode="Mode.DateRange"
          :disabled-date="disabledDate"
        />
      </section> -->
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
