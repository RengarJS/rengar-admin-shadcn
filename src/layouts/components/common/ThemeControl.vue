<template>
  <TooltipProvider>
    <Tooltip v-if="appStore.isPc">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
          @click="appStore.toggleTheme"
        >
          <LightModeIcon v-if="appStore.themeMode === 'light'" />
          <DarkModeIcon v-else-if="appStore.themeMode === 'dark'" />
          <AutoModeIcon v-else />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span v-if="appStore.themeMode === 'light'">浅色</span>
        <span v-else-if="appStore.themeMode === 'dark'">深色</span>
        <span v-else>跟随系统</span>
      </TooltipContent>
    </Tooltip>

    <button
      v-else
      type="button"
      class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
      @click="appStore.toggleTheme"
    >
      <LightModeIcon v-if="appStore.themeMode === 'light'" />
      <DarkModeIcon v-else-if="appStore.themeMode === 'dark'" />
      <AutoModeIcon v-else />
    </button>
  </TooltipProvider>
</template>

<script setup lang="ts">
import LightModeIcon from '~icons/material-symbols/light-mode-outline'
import DarkModeIcon from '~icons/material-symbols/dark-mode-outline'
import AutoModeIcon from '~icons/material-symbols/hdr-auto-outline'
import { useAppStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
const appStore = useAppStore()
</script>

<style scoped></style>
