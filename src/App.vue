<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue';

import BasicButton from '@/components/Atoms/BasicButton.vue';
import OrgCalendar from '@/components/Organisms/OrgCalendar.vue';
import { Mode } from '@/types/datePicker';
import useActive from '@/composables/useActive';
const [date, setDate] = useActive(new Date());
const [MultiDate, setMultiDate] = useActive([new Date()]);
const [rangeDate, setRangeDate] = useActive([new Date()]);

const disabledDate = (date: Date) => {
  return false;
  // return date.getDay() % 2 === 0;
};
</script>

<template>
  <div class="w-screen flex flex-col items-center justify-start">
    <!-- <a
      href="https://vitejs.dev"
      target="_blank"
    >
      <img
        src="/vite.svg"
        class="logo"
        alt="Vite logo"
      >
    </a>
    <a
      href="https://vuejs.org/"
      target="_blank"
    >
      <img
        src="./assets/vue.svg"
        class="logo vue"
        alt="Vue logo"
      >
    </a> -->

    <div class="flex flex-col space-y-10 items-center text-center">
      <section>
        <div>Calendar</div>
        <div>{{ date.toLocaleDateString() }}</div>
        <OrgCalendar
          v-model="date"
          format="yyyy/MM/dd hh:mm:ss"
          :mode="Mode.DatePicker"
          :disabled-date="disabledDate"
        />
      </section>
      <section>
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
      </section>
    </div>
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
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
