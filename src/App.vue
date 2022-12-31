<script setup lang="ts">
import BasicButton from '@/components/Atoms/BasicButton.vue';
import OrgCalendar from '@/components/Organisms/OrgCalendar.vue';
import useActive from '@/composables/useActive';
import { Mode } from '@/types/datePicker';
const [date, setDate] = useActive(new Date());
const [MultiDate, setMultiDate] = useActive([new Date()]);
const [rangeDate, setRangeDate] = useActive([new Date()]);

const disabledDate = (date: Date) => {
  return false;
  // return date.getDay() % 2 === 0;
};
</script>

<template>
  <div class="w-[4000px] h-[2000px] flex flex-col items-center justify-center">
    <div class="relative flex flex-col space-y-10 items-center text-center">
      <section>
        <div>Calendar</div>
        <div>{{ date.toLocaleDateString() }}</div>
        <OrgCalendar
          v-model="date"
          format="yyyy/MM/dd hh:mm:ss"
          :mode="Mode.DatePicker"
          first-day-of-week="3"
          locale="zho"
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
