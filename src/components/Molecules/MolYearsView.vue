<script setup lang="ts">
import BasicButton from '@/components/Atoms/BasicButton.vue';
import BasicTable from '@/components/Atoms/BasicTable.vue';
import MolButtonArrowPair from '@/components/Molecules/MolButtonArrowPair.vue';
import setCalculatedTime from '@/helpers/setCalculatedTime';
import { CalendarBtn, ViewMode } from '@/types/datePicker';
import add from '@/utils/time/add';
import minus from '@/utils/time/minus';

interface MolYearHeaderProps {
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  changeViewMode: (mode: ViewMode) => void;

  header: string;
  body: CalendarBtn[][];
}

const props = withDefaults(defineProps<MolYearHeaderProps>(), {});
</script>

<template>
  <BasicTable>
    <template #header>
      <tr>
        <th>
          <MolButtonArrowPair
            :display-title="header"
            is-double-arrow
            @handler:title="changeViewMode(ViewMode.Decade)"
            @handler:double-left="setCalculatedTime(displayDate, minus, { years: 100 }, setDisplayDate)"
            @handler:left="setCalculatedTime(displayDate, minus, { years: 10 }, setDisplayDate)"
            @handler:right="setCalculatedTime(displayDate, add, { years: 10 }, setDisplayDate)"
            @handler:double-right="setCalculatedTime(displayDate, add, { years: 100 }, setDisplayDate)"
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
                v-for="(group, index) in body"
                :key="index"
              >
                <td
                  v-for="(item, id) in group"
                  :key="id"
                >
                  <BasicButton
                    data-cy="calendar-year-btn"
                    class="w-full px-3 py-3 text-center"
                    :class="{
                      'bg-blue-300 hover:bg-blue-300': item.isSelected,
                    }"
                    @click="item.clickFn"
                  >
                    {{ item.text }}
                  </BasicButton>
                </td>
              </tr>
            </template>
          </BasicTable>
        </td>
      </tr>
    </template>
  </BasicTable>
</template>
