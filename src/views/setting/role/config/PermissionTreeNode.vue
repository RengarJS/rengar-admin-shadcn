<template>
  <div>
    <div
      class="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
      :class="matches ? 'bg-primary/5' : ''"
    >
      <button
        v-if="node.children?.length"
        type="button"
        class="flex size-6 shrink-0 items-center justify-center text-muted-foreground"
        :aria-label="`${open ? '收起' : '展开'}${node.name}`"
        :aria-expanded="open"
        @click="open = !open"
      >
        <ChevronRight class="size-4 transition-transform" :class="open ? 'rotate-90' : ''" />
      </button>
      <span v-else class="size-6 shrink-0" />
      <Checkbox
        :model-value="checked ? true : indeterminate ? 'indeterminate' : false"
        :aria-label="`选择${node.name}`"
        @update:model-value="emit('toggle', { node, checked: $event === true })"
      />
      <span
        class="min-w-0 flex-1 cursor-pointer truncate"
        @click="emit('toggle', { node, checked: !(checked || indeterminate) })"
        >{{ node.name }}</span
      >
      <span class="hidden max-w-44 truncate text-xs text-muted-foreground sm:inline">{{ node.code }}</span>
    </div>
    <div v-if="node.children?.length && open" class="ml-4 border-l pl-2">
      <PermissionTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :checked-keys="checkedKeys"
        :indeterminate-keys="indeterminateKeys"
        :pattern="pattern"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight } from '@lucide/vue'

defineOptions({ name: 'PermissionTreeNode' })
const props = defineProps<{
  node: Api.Setting.MenuTree
  checkedKeys: number[]
  indeterminateKeys: number[]
  pattern: string
}>()
const emit = defineEmits<{
  toggle: [payload: { node: Api.Setting.MenuTree; checked: boolean }]
}>()

const open = ref(false)
const checked = computed(() => props.checkedKeys.includes(props.node.id))
const indeterminate = computed(() => props.indeterminateKeys.includes(props.node.id))
const matches = computed(
  () => props.pattern.trim() && props.node.name.toLocaleLowerCase().includes(props.pattern.trim().toLocaleLowerCase()),
)
watch(
  () => props.pattern,
  (pattern) => {
    if (pattern) open.value = true
  },
)
</script>
