<template>
  <Card class="h-full">
    <CardContent class="flex items-center gap-3 py-6">
      <span class="text-primary">当前计数：{{ count }}</span>
      <Button @click="count++">增加</Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const count = ref(0)
</script>

<style scoped></style>
