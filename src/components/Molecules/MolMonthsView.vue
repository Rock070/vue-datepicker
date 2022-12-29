<script setup lang="ts">
import BasicTable from '@/components/Atoms/BasicTable.vue';
import MolButtonArrowPair from '@/components/Molecules/MolButtonArrowPair.vue';
import setCalculatedTime from '@/helpers/setCalculatedTime';
import {
  CalendarBtn,
  ViewMode,
} from '@/types/datePicker';
import add from '@/utils/time/add';
import minus from '@/utils/time/minus';

interface MolMonthsProps {
  monthHeader: string;
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  changeViewMode: (mode: ViewMode) => void;
  monthBody: CalendarBtn[][];
}

const props = withDefaults(defineProps<MolMonthsProps>(), {});
</script>

<template>
  <BasicTable>
    <template #header>
      <tr>
        <th>
          <MolButtonArrowPair
            :display-title="monthHeader"
            is-double-arrow
            @handler:title="changeViewMode(ViewMode.Year)"
            @handler:left="setCalculatedTime(displayDate, minus, { years: 1 }, setDisplayDate)"
            @handler:double-left="setCalculatedTime(displayDate, minus, { years: 10 }, setDisplayDate)"
            @handler:right="setCalculatedTime(displayDate, add, { years: 1 }, setDisplayDate)"
            @handler:double-right="setCalculatedTime(displayDate, add, { years: 10 }, setDisplayDate)"
          />
        </th>
      </tr>
    </template>
    <template #body>
      <tr>
        <td>
          <BasicTable>
            <template #body>
              <tr
                v-for="(group, index) in monthBody"
                :key="index"
              >
                <td
                  v-for="(item, id) in group"
                  :key="id"
                >
                  <button
                    data-cy="calendar-month-btn"
                    type="button"
                    class="w-full py-3 text-center"
                    :class="{
                      'hover:bg-gray-2': !item.isSelected && !item.disabled,
                      'bg-blue-300 hover:bg-blue-300': item.isSelected
                    }"
                    @click="item.clickFn"
                  >
                    {{ item.text }}
                  </button>
                </td>
              </tr>
            </template>
          </BasicTable>
        </td>
      </tr>
    </template>
  </BasicTable>
</template>
