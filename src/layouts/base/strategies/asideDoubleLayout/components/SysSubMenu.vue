<template>
  <SysMenu
    :data="data"
    :collapsed="collapsed"
    :inverted="appStore.userConfig.invertedAside"
    v-model:active="active"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import SysMenu from '@/layouts/components/common/SysMenu.vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const { data, collapsed } = defineProps<{ data: RouteRecordRaw[]; collapsed?: boolean }>()
const active = defineModel<RouteRecordName>('active')
const emit = defineEmits<{ change: [val: RouteRecordName] }>()

function handleChange(name: RouteRecordName) {
  emit('change', name)
}
</script>
