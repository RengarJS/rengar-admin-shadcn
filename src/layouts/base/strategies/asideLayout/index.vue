<template>
  <div class="relative flex h-viewport w-full overflow-hidden bg-background">
    <aside
      v-if="isPc"
      class="z-10 h-full shrink-0 border-r"
      :class="userConfig.invertedAside ? 'bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground'"
      :style="{
        width: numberToPx(systemConfig.asideCollapse ? systemConfig.asideCollapseWidth : userConfig.asideWidth),
      }"
    >
      <div class="h-full w-full flex flex-col">
        <div
          :style="{
            height: numberToPx(userConfig.headerHeight),
          }"
        >
          <SysLogo :show-title="!systemConfig.asideCollapse" />
        </div>

        <div
          class="[&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] min-h-0 flex-1 overflow-y-auto"
        >
          <SysMenu
            :inverted="userConfig.invertedAside"
            v-model:active="menuStore.activeMenu"
            :data="menuStore.menuRoutes"
            :collapsed="systemConfig.asideCollapse"
          />
        </div>
      </div>
    </aside>
    <div class="relative min-w-0 flex-1">
      <header
        class="relative z-[1] flex shrink-0 border-b"
        :class="userConfig.invertedHeader ? 'bg-zinc-900 text-zinc-100' : 'bg-background'"
        :style="{
          height: numberToPx(userConfig.headerHeight),
        }"
      >
        <AppHeader :show-logo="!isPc" :show-aside-control="showAsideControl">
          <AppBreadcrumb v-if="showAppBreadcrumb" />
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
    <AppMobieDrawer v-model:show="showMenuDrawer" />
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
import AppMobieDrawer from '@/layouts/components/AppMobieDrawer.vue'
import AppBreadcrumb from '@/layouts/components/AppBreadcrumb.vue'
import SysLogo from '@/layouts/components/common/SysLogo.vue'
import SysMenu from '@/layouts/components/common/SysMenu.vue'
import AppSearchModal from '@/layouts/components/AppSearchModal.vue'

const menuStore = useMenuStore()

const appStore = useAppStore()
const { userConfig, systemConfig, showConfigDrawer, isMobile, showMenuDrawer, showRouterView, isPc, showSearchModal } =
  storeToRefs(appStore)

const layoutContentStyle = computed(() => {
  const style = {
    top: `calc(${numberToPx(userConfig.value.headerHeight)} + ${userConfig.value.showTabs ? numberToPx(userConfig.value.tabHeight) : '0px'})`,
    bottom: userConfig.value.showFooter ? numberToPx(userConfig.value.footerHeight) : '0px',
    padding: numberToPx(userConfig.value.gap),
  }
  return style
})

const showAppBreadcrumb = computed(() => {
  if (!userConfig.value.showBreadcrumb) return false
  if (isMobile.value) return false
  return true
})

const showAsideControl = computed(() => {
  if (!isPc.value) return false
  return true
})
</script>

<style scoped></style>
