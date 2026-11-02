<template>
  <div>
    <div
      class="group flex min-w-0 items-center gap-1 rounded-md pr-2 text-sm transition-colors"
      :class="[
        node.id === selectedId ? 'bg-primary/10 text-primary' : 'hover:bg-accent',
        matches ? 'ring-1 ring-primary/30' : '',
      ]"
    >
      <button
        v-if="node.children?.length"
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        :aria-label="`${open ? '收起' : '展开'}${node.name}`"
        :aria-expanded="open"
        @click="open = !open"
      >
        <ChevronRight class="size-4 transition-transform" :class="open ? 'rotate-90' : ''" />
      </button>
      <span v-else class="size-8 shrink-0" />
      <button type="button" class="min-w-0 flex-1 truncate py-2 text-left" @click="emit('select', node)">
        <span :class="matches ? 'font-semibold text-primary' : ''">{{ node.name }}</span>
      </button>
      <span class="hidden max-w-28 truncate text-xs text-muted-foreground sm:inline">{{ node.code }}</span>
      <button
        type="button"
        class="flex size-7 shrink-0 items-center justify-center rounded-sm text-primary opacity-70 hover:bg-primary/10 hover:opacity-100"
        :aria-label="`复制 ${node.code}`"
        @click.stop="emit('copy', node.code)"
      >
        <Copy class="size-4" />
      </button>
    </div>
    <div v-if="node.children?.length && open" class="ml-4 border-l pl-2">
      <MenuTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :pattern="pattern"
        @select="emit('select', $event)"
        @copy="emit('copy', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Copy } from '@lucide/vue'

defineOptions({ name: 'MenuTreeNode' })
const props = defineProps<{
  node: Api.Setting.MenuTree
  selectedId?: number
  pattern: string
}>()
const emit = defineEmits<{
  select: [node: Api.Setting.MenuTree]
  copy: [code: string]
}>()

const open = ref(false)
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
