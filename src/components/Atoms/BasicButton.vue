<script setup lang="ts">
import { useAttrs } from 'vue';
interface BasicButtonProps {
  dataCy?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<BasicButtonProps>(), {
  dataCy: '',
  type: 'button',
  className: '',
});

const attrs = useAttrs();
</script>

<template>
  <button
    :type="type"
    v-bind="attrs"
    :data-cy="dataCy"
    class="py-0.5 px-1"
    :class="[
      className,
      {
        'calendar__date--disabled': disabled,
        'hover:bg-gray-2': !disabled,
      }
    ]"
  >
    <slot />
  </button>
</template>
