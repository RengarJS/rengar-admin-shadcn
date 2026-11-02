<template>
  <TooltipProvider>
    <Tooltip v-if="appStore.isPc">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
          @click="jumpToGithub"
        >
          <IMdiGithub></IMdiGithub>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">github</TooltipContent>
    </Tooltip>
    <button
      v-else
      type="button"
      class="flex cursor-pointer items-center justify-center rounded-sm p-1 hover:text-primary"
      @click="jumpToGithub"
    >
      <IMdiGithub></IMdiGithub>
    </button>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
const appStore = useAppStore()

function jumpToGithub() {
  window.open('https://github.com/RengarJS/rengar-admin')
}
</script>

<style scoped></style>
