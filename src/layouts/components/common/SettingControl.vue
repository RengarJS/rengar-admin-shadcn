<template>
  <TooltipProvider>
    <Tooltip v-if="appStore.isPc">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
          @click="appStore.toggleConfigDrawer"
        >
          <IClaritySettingsLine></IClaritySettingsLine>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">系统配置</TooltipContent>
    </Tooltip>

    <button
      v-else
      type="button"
      class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
      @click="appStore.toggleConfigDrawer"
    >
      <IClaritySettingsLine></IClaritySettingsLine>
    </button>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
const appStore = useAppStore()
</script>

<style scoped></style>
