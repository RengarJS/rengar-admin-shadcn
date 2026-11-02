<template>
  <nav aria-label="主导航" class="flex flex-col gap-2 p-2">
    <template v-if="!appStore.systemConfig.asideCollapse">
      <button
        v-for="item in data"
        :key="String(item.name)"
        type="button"
        class="aspect-square flex flex-col cursor-pointer items-center justify-center gap-2 rounded"
        :class="getClass(item)"
        @click="handleClick(item)"
      >
        <MenuIcon :options="item.meta" class="text-2xl" />
        <span class="max-w-full truncate">{{ item.meta?.title }}</span>
      </button>
    </template>
    <TooltipProvider v-else>
      <Tooltip v-for="item in data" :key="String(item.name)">
        <TooltipTrigger as-child>
          <button
            type="button"
            class="aspect-square flex flex-col cursor-pointer items-center justify-center gap-2 rounded"
            :class="
              item.name === menuStore.topActiveName
                ? 'bg-primary-100 text-primary dark:bg-primary-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            "
            :aria-label="String(item.meta?.title ?? '')"
            @click="handleClick(item)"
          >
            <MenuIcon :options="item.meta" class="text-2xl" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{{ item.meta?.title }}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </nav>
</template>

<script setup lang="ts">
import MenuIcon from '@/components/MenuIcon/index.vue'
import { useMenuStore, useAppStore } from '@/stores'
import type { RouteRecordRaw } from 'vue-router'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const menuStore = useMenuStore()
const value = defineModel<RouteRecordName>('active')
const appStore = useAppStore()
const { data } = defineProps<{ data: RouteRecordRaw[] }>()
const emit = defineEmits<{ change: [show: boolean] }>()
const router = useRouter()

function getClass(item: RouteRecordRaw) {
  if (appStore.userConfig.invertedAside) {
    return item.name === menuStore.topActiveName ? 'bg-primary text-white' : 'text-zinc-300 hover:text-white'
  }
  return item.name === menuStore.topActiveName
    ? 'bg-primary-100 text-primary dark:bg-primary-800'
    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
}

function handleClick(item: RouteRecordRaw) {
  value.value = item.name as RouteRecordName
  if (!item.children) {
    router.push({ name: item.name as RouteRecordName })
    emit('change', false)
    return
  }
  emit('change', true)
}
</script>
