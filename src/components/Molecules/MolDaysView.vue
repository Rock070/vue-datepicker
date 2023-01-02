<script setup lang="ts">
import BasicButton from '@/components/Atoms/BasicButton.vue';
import BasicTable from '@/components/Atoms/BasicTable.vue';
import MolButtonArrowPair from '@/components/Molecules/MolButtonArrowPair.vue';
import setCalculatedTime from '@/helpers/setCalculatedTime';
import { CalendarBtn, ViewMode } from '@/types/datePicker';
import add from '@/utils/time/add';
import minus from '@/utils/time/minus';
interface MolDayProps {
  weekdayDateList: string[];

  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  changeViewMode: (mode: ViewMode) => void;

  header: string;
  body: CalendarBtn[][];
}

const props = withDefaults(defineProps<MolDayProps>(), {});
</script>

<template>
  <BasicTable>
    <template #header>
      <tr>
        <th>
          <MolButtonArrowPair
            :display-title="header"
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
                  v-for="item in weekdayDateList"
                  :key="item"
                  class="p-1 m-1"
                >
                  {{ item }}
                </th>
              </tr>
            </template>
            <template #body>
              <tr
                v-for="(group, index) in body"
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
                    'text-gray-700': !item.isThisMonth && !item.disabled,
                    'bg-blue-300 text-white': !item.disabled && item.isSelected,

                    'hover:bg-gray-200 hover:text-gray-700': !item.isSelected && !item.disabled && !item.isRangeHover,

                    'calendar__date--hover': item.isRangeHover,

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
