<script lang="ts">
// eslint-disable-next-line import/order
import { Mode } from '@/types/datePicker';

const modeOptions = [
  {
    label: 'DatePicker',
    value: Mode.DatePicker,
    disabled: false,
  },
  {
    label: 'DateRange',
    value: Mode.DateRange,
    disabled: false,
  },
  {
    label: 'DatePickerMultiple',
    value: Mode.DatePickerMultiple,
    disabled: false,
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

const formatOptions = [
  // {
  // label: 'yyyy/MM/dd hh:mm:ss',
  // value: 'yyyy/MM/dd hh:mm:ss',
  // },
  // {
  // label: 'yyyy/MM/dd HH:mm:ss',
  // value: 'yyyy/MM/dd HH:mm:ss',
  // },
  {
    label: 'yyyy/MM/dd',
    value: 'yyyy/MM/dd',
  },
  {
    label: 'yy/MM/dd',
    value: 'yy/MM/dd',
  },
];
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

import OrgCalendar from '@/components/Organisms/OrgCalendar.vue';

const date = ref(new Date());

// ---------------- test state ----------------
const mode = ref(Mode.DatePickerMultiple);
const locale = ref('zh-tw');
const format = ref('yyyy/MM/dd');
const firstDayOfWeek = ref(0);

const disabledDate = (date: Date) => {
  if (firstDayOfWeek.value % 2) return date.getDay() % 2 === 0;
  return false;
};

const dateLocaleString = computed(() => {
  if (Array.isArray(date.value))
    return date.value.map(item => item.toLocaleDateString());
  return date.value.toLocaleDateString();
});
</script>

<template>
  <div
    :key="mode"
    class="w-[calc(100vw+300px)] h-[calc(100vh+400px)] flex flex-col items-center justify-center space-y-4"
  >
    <!-- 測試狀態區 -->
    <div>
      <strong class="font-bold text-xl mb-4 block">選狀態</strong>
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
              :disabled="modeItem.disabled"
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
            class="w-[160px]"
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
        <!-- format -->
        <div>
          <label for="format">format</label>
          <br>
          <select
            id="format"
            v-model="format"
            class="w-[160px]"
          >
            <option
              v-for="formatItem in formatOptions"
              :key="formatItem.value"
              :value="formatItem.value"
            >
              {{ formatItem.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <hr class="w-full w-min-screen h-px !my-10">
    <div class="relative flex flex-col space-y-10 items-center text-center">
      <section class="space-y-3">
        <div>Calendar</div>
        <div class="max-w-[40vw] max-h-20 overflow-scroll">
          {{ dateLocaleString }}
        </div>
        <OrgCalendar
          :key="mode"
          v-model="date"
          :format="format"
          :mode="mode"
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
