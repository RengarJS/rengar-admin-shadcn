<template>
  <nav
    :class="mode === 'horizontal' ? 'flex min-w-0 items-center gap-1' : 'flex min-w-0 flex-col gap-1 p-2'"
    :aria-label="mode === 'horizontal' ? '主导航' : '侧边导航'"
  >
    <SysMenuItem
      v-for="item in data"
      :key="String(item.name)"
      :route="item"
      :children-field="childrenField"
      :active-key="value"
      :collapsed="collapsed"
      :inverted="inverted"
      :mode="mode"
      @select="handleSelect"
    />
  </nav>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import SysMenuItem from './SysMenuItem.vue'

const emit = defineEmits<{ change: [val: RouteRecordName] }>()
const {
  childrenField = 'children',
  mode = 'vertical',
  data,
  collapsed,
  inverted = false,
} = defineProps<{
  mode?: 'horizontal' | 'vertical'
  data: RouteRecordRaw[]
  collapsed?: boolean
  inverted?: boolean
  childrenField?: string
}>()
const value = defineModel<RouteRecordName>('active')

function handleSelect(name: RouteRecordName) {
  value.value = name
  emit('change', name)
}
</script>
