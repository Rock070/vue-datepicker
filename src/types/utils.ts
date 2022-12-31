import type { ComputedRef, Ref } from 'vue';

export type MaybeRef<T> = T | Ref<T>;

export type MaybeComputedRef<T> = T | ComputedRef<T>;
