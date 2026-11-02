<template>
  <Card class="h-full gap-0 overflow-hidden p-0">
    <CardContent class="h-full min-h-0 p-0">
      <iframe :src :title class="size-full border-0"></iframe>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  src: string
  title: string
}>()
</script>

<style scoped></style>
