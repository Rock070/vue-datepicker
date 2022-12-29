<script setup lang="ts">
import { Icon } from '@iconify/vue';

import BasicButton from '@/components/Atoms/BasicButton.vue';

type Handler = (...arg: any[]) => any;

interface MolButtonArrowPairProps {
  displayTitle: string;
  titleDisabled?: boolean;
  isDoubleArrow?: boolean;
}

interface MolButtonArrowPairEmits {
  (type: 'handler:left', event: Event): void;
  (type: 'handler:right', event: Event): void;
  (type: 'handler:double-left', event: Event): void;
  (type: 'handler:double-right', event: Event): void;
  (type: 'handler:title', event: Event): void;
}

const props = withDefaults(defineProps<MolButtonArrowPairProps>(), {
  displayTitle: '',
  titleDisabled: false,
  isDoubleArrow: false,
});
const emits = defineEmits<MolButtonArrowPairEmits>();
</script>

<template>
  <div class="flex justify-between items-center">
    <div>
      <BasicButton
        v-if="isDoubleArrow"
        @click="$emit('handler:double-left')"
      >
        <Icon icon="ant-design:double-left-outlined" />
      </BasicButton>

      <BasicButton @click="$emit('handler:left')">
        <Icon icon="akar-icons:chevron-left" />
      </BasicButton>
    </div>
    <BasicButton
      data-cy="calendar-range-btn"
      :disabled="titleDisabled"
      @click="$emit('handler:title')"
    >
      {{ displayTitle }}
    </BasicButton>
    <div>
      <BasicButton @click="$emit('handler:right')">
        <Icon icon="akar-icons:chevron-right" />
      </BasicButton>
      <BasicButton
        v-if="isDoubleArrow"
        @click="$emit('handler:double-right')"
      >
        <Icon icon="ant-design:double-right-outlined" />
      </BasicButton>
    </div>
  </div>
</template>
