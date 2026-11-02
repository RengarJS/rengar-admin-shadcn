<template>
  <div class="h-full flex items-center justify-center gap-4 text-xl text-primary">
    <SvgIcon v-if="showLogo" local-icon="logo" class="text-4xl"></SvgIcon>
    <div v-if="showTitle" class="whitespace-nowrap text-center">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
const title = import.meta.env.VITE_APP_TITLE

const { showLogo = true, showTitle = true } = defineProps<{
  showTitle?: boolean
  showLogo?: boolean
}>()
</script>

<style scoped></style>
