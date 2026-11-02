<template>
  <Sheet :open="show" @update:open="show = $event">
    <SheetContent side="left" class="w-[80vw] max-w-[80vw] p-0 sm:max-w-[80vw]">
      <SheetHeader>
        <SheetTitle>系统菜单</SheetTitle>
      </SheetHeader>
      <SysMenu v-model:active="menuStore.activeMenu" :data="menuStore.menuRoutes" @change="handleMenuChange" />
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import SysMenu from './common/SysMenu.vue'
import { useMenuStore, useAppStore } from '@/stores'
const show = defineModel<boolean>('show', {
  required: true,
})

const menuStore = useMenuStore()
const appStore = useAppStore()

function handleMenuChange() {
  appStore.toggleMenuDrawer(false)
}
</script>

<style scoped></style>
