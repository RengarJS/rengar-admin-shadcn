<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="flex items-center justify-center p-1 hover:bg-primary-100 dark:hover:bg-primary-700"
        >
          <ILineMdMenuUnfoldLeft
            v-if="!appStore.systemConfig.asideCollapse"
            class="cursor-pointer text-xl text-primary"
            @click="appStore.toggleAsideCollapse"
          ></ILineMdMenuUnfoldLeft>

          <ILineMdMenuUnfoldRight
            v-else
            class="cursor-pointer text-2xl text-primary"
            @click="appStore.toggleAsideCollapse"
          ></ILineMdMenuUnfoldRight>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ appStore.systemConfig.asideCollapse ? '展开菜单' : '收起菜单' }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
const appStore = useAppStore()
</script>

<style scoped></style>
