<template>
  <TooltipProvider>
    <AppWaterMark />
    <AppFeedback />
    <App />
  </TooltipProvider>
</template>

<script setup lang="ts">
import App from '@/App.vue'
import AppWaterMark from '@/layouts/components/AppWaterMark.vue'
import AppFeedback from '@/components/AppFeedback/index.vue'
import { TooltipProvider } from '@/components/ui/tooltip'

defineOptions({
  name: 'AppProvider',
})
</script>

<style scoped></style>
