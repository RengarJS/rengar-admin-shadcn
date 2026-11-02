<template>
  <div
    v-if="appStore.userConfig.showWaterMark"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-[1000]"
    :style="watermarkStyle"
  />
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const content = import.meta.env.VITE_APP_TITLE

const watermarkStyle = computed(() => {
  const text = String(content ?? '').replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }
    return entities[character] ?? character
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><g fill="rgba(128,128,128,.16)" font-family="sans-serif" font-size="16"><text x="12" y="60" transform="rotate(-15 12 60)">${text}</text><text x="172" y="160" transform="rotate(165 172 160)">${text}</text></g></svg>`
  return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: 'repeat' }
})
</script>
