<template>
  <div class="relative h-viewport w-full overflow-hidden bg-background">
    <header
      class="relative z-[1] flex border-b"
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
          children-field="list"
          v-model:active="menuStore.topActiveName"
        />
      </AppHeader>
    </header>

    <div
      class="absolute inset-x-0 flex"
      :style="{
        top: numberToPx(userConfig.headerHeight),
        bottom: 0,
      }"
    >
      <aside
        v-if="showAppAside"
        class="shrink-0 overflow-y-auto border-r"
        :class="userConfig.invertedAside ? 'bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground'"
        :style="{
          width: numberToPx(systemConfig.asideCollapse ? systemConfig.asideCollapseWidth : userConfig.asideWidth),
        }"
      >
        <SysMenu
          :inverted="userConfig.invertedAside"
          v-model:active="menuStore.activeMenu"
          :data="menuStore.subMenuRoutes"
          :collapsed="systemConfig.asideCollapse"
        />
      </aside>

      <div class="relative min-w-0 flex-1">
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
            backgroundColor: appStore.theme === 'light' ? bgColor : 'transparent',
          }"
        >
          <AppFooter />
        </footer>
      </div>
    </div>

    <AppConfigDrawer v-model:show="showConfigDrawer" />
    <AppMobieDrawer v-model:show="showMenuDrawer" />
    <AppSearchModal v-model:show="showSearchModal" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useMenuStore } from '@/stores'
import { bgColor } from '@/config/app'
import { numberToPx } from '@/utils/tools'
import AppFooter from '@/layouts/components/AppFooter.vue'
import AppTabs from '@/layouts/components/AppTabs.vue'
import AppHeader from '@/layouts/components/AppHeader.vue'
import AppRouterView from '@/layouts/components/AppRouterView.vue'
import AppConfigDrawer from '@/layouts/components/AppConfigDrawer.vue'
import AppMobieDrawer from '@/layouts/components/AppMobieDrawer.vue'
import SysMenu from '@/layouts/components/common/SysMenu.vue'
import AppSearchModal from '@/layouts/components/AppSearchModal.vue'

const appStore = useAppStore()
const { userConfig, systemConfig, showConfigDrawer, showMenuDrawer, showRouterView, isPc, showSearchModal } =
  storeToRefs(appStore)

const layoutContentStyle = computed(() => {
  const style = {
    top: userConfig.value.showTabs ? numberToPx(userConfig.value.tabHeight) : '0px',
    bottom: userConfig.value.showFooter ? numberToPx(userConfig.value.footerHeight) : '0px',
    padding: numberToPx(userConfig.value.gap),
    backgroundColor: appStore.theme === 'light' ? bgColor : 'transparent',
  }
  return style
})

const menuStore = useMenuStore()

const showAppAside = computed(() => {
  if (!isPc.value) return false
  if (menuStore.subMenuRoutes.length > 0) return true
  return false
})

const showAsideControl = computed(() => {
  if (!isPc.value) return false
  if (menuStore.subMenuRoutes.length === 0) return false
  return true
})
</script>

<style scoped></style>
