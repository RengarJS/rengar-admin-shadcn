<template>
  <div class="flex h-viewport flex-col items-center justify-center gap-8">
    <img :src="Icon" alt="" class="w-[280px]" />
    <span class="text-2xl text-gray-500">页面找不到了</span>
    <div class="flex items-center gap-10">
      <Button variant="outline" @click="handleBack">返回上一页</Button>
      <Button @click="handleHome">返回首页</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/assets/svg-icons/404.svg'
import { Button } from '@/components/ui/button'

const router = useRouter()

function handleBack() {
  router.back()
}

function handleHome() {
  router.replace('/')
}
</script>

<style scoped></style>
