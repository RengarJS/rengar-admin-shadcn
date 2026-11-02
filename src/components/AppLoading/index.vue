<template>
  <div
    class="relative w-viewport h-viewport"
    :style="{
      color: primaryColor,
    }"
  >
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <SvgIcon local-icon="loading" class="text-[60px]" />
    </div>

    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10">
      <SvgIcon local-icon="logo" class="text-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { userConfig } from '@/config/app'
let primaryColor = ''
const appStr = localStorage.getItem('app')
if (appStr) {
  const app = JSON.parse(appStr)
  primaryColor = app.themeOverrides.common.primaryColor
} else {
  primaryColor = userConfig.primaryColor
}
</script>

<style scoped></style>
