<script setup lang="ts">
import { useAttrs } from 'vue';

import BasicButton from '@/components/Atoms/BasicButton.vue';
import BasicTable from '@/components/Atoms/BasicTable.vue';
import MolButtonArrowPair from '@/components/Molecules/MolButtonArrowPair.vue';
import { CALENDER_HEADER } from '@/helpers/const';
import setCalculatedTime from '@/helpers/setCalculatedTime';
import { CalendarBtn, ViewMode } from '@/types/datePicker';
import add from '@/utils/time/add';
import minus from '@/utils/time/minus';
interface MolDayProps {
  dayHeader: string;
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  changeViewMode: (mode: ViewMode) => void;
  dayBody: CalendarBtn[][];
}

const props = defineProps<MolDayProps>();
</script>

<template>
  <BasicTable>
    <template #header>
      <tr>
        <th>
          <MolButtonArrowPair
            :display-title="dayHeader"
            :is-double-arrow="true"
            @handler:left="setCalculatedTime(displayDate, minus, { months: 1 }, setDisplayDate)"
            @handler:title="changeViewMode(ViewMode.Month)"
            @handler:double-left="setCalculatedTime(displayDate, minus, { years: 1 }, setDisplayDate)"
            @handler:right="setCalculatedTime(displayDate, add, { months: 1 }, setDisplayDate)"
            @handler:double-right="setCalculatedTime(displayDate, add, { years: 1 }, setDisplayDate)"
          />
        </th>
      </tr>
    </template>
    <template #body>
      <tr>
        <td>
          <BasicTable>
            <template #header>
              <tr>
                <th
                  v-for="item in CALENDER_HEADER"
                  :key="item"
                  class="p-1 m-1"
                >
                  {{ item }}
                </th>
              </tr>
            </template>
            <template #body>
              <tr
                v-for="(group, index) in dayBody"
                :key="index"
              >
                <td
                  v-for="item in group"
                  :key="item.timestamp"
                  role="button"
                  :aria-disabled="item.disabled"
                  :tabIndex="0"
                  data-cy="calendar-date"
                  :data-test-id="item.isThisMonth ? 'calendar-this-month-date' : undefined"
                  class="p-1 text-center cursor-pointer select-none"
                  :class="{
                    'text-gray-700': !item.isThisMonth,
                    'bg-blue-300 text-white': !item.disabled && item.isSelected,

                    'hover:bg-gray-200': !item.isSelected && !item.disabled,

                    'bg-gray-200': item.isRangeHover,

                    'calendar__date--disabled': item.disabled,
                  }"
                  @click="item.clickFn"
                  @mouseenter="item.onMouseEnter"
                >
                  {{ item?.time?.d }}
                </td>
              </tr>
            </template>
          </BasicTable>
        </td>
      </tr>
    </template>
  </BasicTable>
</template>
