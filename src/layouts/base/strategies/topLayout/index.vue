<template>
  <div class="relative flex h-viewport w-full overflow-hidden bg-background">
    <div class="relative min-w-0 flex-1">
      <header
        class="relative z-[1] flex shrink-0 border-b"
        :class="userConfig.invertedHeader ? 'bg-zinc-900 text-zinc-100' : 'bg-background'"
        :style="{
          height: numberToPx(userConfig.headerHeight),
        }"
      >
        <AppHeader :show-logo="true" :show-aside-control="showAsideControl">
          <SysMenu
            v-if="isPc"
            :inverted="userConfig.invertedHeader"
            mode="horizontal"
            :data="menuStore.menuRoutes"
            v-model:active="menuStore.activeMenu"
          >
          </SysMenu>
        </AppHeader>
      </header>
      <header
        v-if="userConfig.showTabs"
        class="relative z-[1] shrink-0 border-b bg-background"
        :style="{
          height: numberToPx(userConfig.tabHeight),
        }"
      >
        <AppTabs />
      </header>

      <main
        class="absolute left-0 right-0 overflow-auto"
        :style="layoutContentStyle"
        :ref="(el) => el && appStore.setLayoutContentRef(el as HTMLElement)"
      >
        <AppRouterView v-if="showRouterView" />
      </main>
      <footer
        v-if="userConfig.showFooter"
        class="absolute inset-x-0 bottom-0 z-[1] border-t bg-background"
        :style="{
          height: numberToPx(userConfig.footerHeight),
        }"
      >
        <AppFooter />
      </footer>
    </div>

    <AppConfigDrawer v-model:show="showConfigDrawer" />
    <AppMobileDrawer v-model:show="showMenuDrawer" />
    <AppSearchModal v-model:show="showSearchModal" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useMenuStore } from '@/stores'
import { numberToPx } from '@/utils/tools'
import AppFooter from '@/layouts/components/AppFooter.vue'
import AppTabs from '@/layouts/components/AppTabs.vue'
import AppHeader from '@/layouts/components/AppHeader.vue'
import AppRouterView from '@/layouts/components/AppRouterView.vue'
import AppConfigDrawer from '@/layouts/components/AppConfigDrawer.vue'
import AppMobileDrawer from '@/layouts/components/AppMobieDrawer.vue'
import SysMenu from '@/layouts/components/common/SysMenu.vue'
import AppSearchModal from '@/layouts/components/AppSearchModal.vue'

const appStore = useAppStore()

const { userConfig, showConfigDrawer, showMenuDrawer, showRouterView, isPc, showSearchModal } = storeToRefs(appStore)

const layoutContentStyle = computed(() => {
  const style = {
    top: `calc(${numberToPx(userConfig.value.headerHeight)} + ${userConfig.value.showTabs ? numberToPx(userConfig.value.tabHeight) : '0px'})`,
    bottom: userConfig.value.showFooter ? numberToPx(userConfig.value.footerHeight) : '0px',
    padding: numberToPx(userConfig.value.gap),
  }
  return style
})

const menuStore = useMenuStore()

const showAsideControl = computed(() => {
  if (!isPc.value) return false
  return true
})
</script>

<style scoped></style>
