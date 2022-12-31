
<script setup lang="ts">
import BasicButton from '@/components/Atoms/BasicButton.vue';
import BasicTable from '@/components/Atoms/BasicTable.vue';
import MolButtonArrowPair from '@/components/Molecules/MolButtonArrowPair.vue';
import setCalculatedTime from '@/helpers/setCalculatedTime';
import type { CalendarBtn } from '@/types/datePicker';
import add from '@/utils/time/add';
import minus from '@/utils/time/minus';

interface MolDecadeProps {
  displayDate: Date;
  setDisplayDate: (date: Date) => void;

  header: string;
  body: CalendarBtn[][];
}

const props = withDefaults(defineProps<MolDecadeProps>(), {});
</script>

<template>
  <BasicTable>
    <template #header>
      <tr>
        <th>
          <MolButtonArrowPair
            :title-disabled="true"
            :display-title="header"
            @handler:left="setCalculatedTime(displayDate, minus, { years: 100 }, setDisplayDate)"
            @handler:right="setCalculatedTime(displayDate, add, { years: 100 }, setDisplayDate)"
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
                    data-cy="calendar-decade-btn"
                    class="w-full px-1 py-3 text-center"
                    :class="{
                      'bg-blue-300 hover:bg-blue-300':item.isSelected,
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
