<template>
  <TooltipProvider>
    <Tooltip v-if="appStore.isPc">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
          @click="toggle"
        >
          <IOouiExitFullscreen v-if="isFullscreen"></IOouiExitFullscreen>
          <IOouiFullScreen v-else></IOouiFullScreen>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ isFullscreen ? '退出全屏' : '全屏' }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { useAppStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
const appStore = useAppStore()
const { isFullscreen, toggle } = useFullscreen()
</script>

<style scoped></style>
