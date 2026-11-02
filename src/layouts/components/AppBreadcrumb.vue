<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in breadcrumb" :key="item.name">
        <BreadcrumbItem>
          <BreadcrumbPage v-if="index === breadcrumb.length - 1" class="flex items-center gap-1">
            <MenuIcon :options="item.meta" />
            <span>{{ item.meta.title }}</span>
          </BreadcrumbPage>
          <span v-else class="flex items-center gap-1 text-muted-foreground">
            <MenuIcon :options="item.meta" />
            <span>{{ item.meta.title }}</span>
          </span>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumb.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup lang="ts">
const route = useRoute()
import MenuIcon from '@/components/MenuIcon/index.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
const breadcrumb = computed(() => {
  return route.matched
})
</script>

<style scoped></style>
