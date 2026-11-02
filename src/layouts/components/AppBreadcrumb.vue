<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in breadcrumb" :key="item.name">
        <BreadcrumbItem>
          <BreadcrumbPage v-if="index === breadcrumb.length - 1" class="flex items-center gap-1">
            <MenuIcon :options="item.meta" />
            <span>{{ item.meta.title }}</span>
          </BreadcrumbPage>
          <BreadcrumbLink v-else as-child>
            <RouterLink :to="getBreadcrumbRoute(item.name)" class="flex items-center gap-1">
              <MenuIcon :options="item.meta" />
              <span>{{ item.meta.title }}</span>
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumb.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup lang="ts">
const route = useRoute()
import { RouterLink, type RouteLocationRaw, type RouteRecordName } from 'vue-router'
import MenuIcon from '@/components/MenuIcon/index.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
const breadcrumb = computed(() => {
  return route.matched
})

function getBreadcrumbRoute(name: RouteRecordName): RouteLocationRaw {
  return { name } as RouteLocationRaw
}
</script>

<style scoped></style>
