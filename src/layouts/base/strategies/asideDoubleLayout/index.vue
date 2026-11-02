<template>
  <div class="relative flex h-viewport w-full overflow-hidden bg-background">
    <aside
      v-if="isPc"
      class="z-10 h-full shrink-0 border-r"
      :class="userConfig.invertedAside ? 'bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground'"
      :style="{
        width: numberToPx(
          systemConfig.asideCollapse ? systemConfig.asideCollapseWidth : systemConfig.doubleFirstAideWidth,
        ),
      }"
    >
      <div class="flex h-full w-full flex-col">
        <div :style="{ height: numberToPx(userConfig.headerHeight) }">
          <SysLogo :show-title="false" />
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SysMenu
            :inverted="userConfig.invertedAside"
            v-model:active="menuStore.topActiveName"
            :data="menuStore.menuRoutes"
            @change="handleFirstLevenChange"
          />
        </div>
      </div>
    </aside>

    <aside
      v-if="isPc && userConfig.fixedSubMenu && showSecondAside"
      class="z-10 h-full shrink-0 border-r"
      :class="userConfig.invertedAside ? 'bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground'"
      :style="{
        width: numberToPx(systemConfig.asideCollapse ? systemConfig.asideCollapseWidth : userConfig.asideWidth),
      }"
    >
      <div class="flex h-full w-full flex-col">
        <div :style="{ height: numberToPx(userConfig.headerHeight) }">
          <div class="flex h-full items-center justify-between px-4">
            <SysLogo v-if="!systemConfig.asideCollapse" :show-logo="false" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <button
                    type="button"
                    class="flex items-center justify-center p-1"
                    aria-label="取消固定侧边栏"
                    @click="toggleFixedSubMenu(false)"
                  >
                    <IPixelThumbtackSolid class="cursor-pointer text-xl text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">取消固定</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SysSubMenu
            :data="menuStore.subMenuRoutes"
            v-model:active="menuStore.activeMenu"
            :collapsed="systemConfig.asideCollapse"
          />
        </div>
      </div>
    </aside>

    <div class="relative min-w-0 flex-1">
      <header
        class="relative z-[1] flex shrink-0 border-b"
        :class="userConfig.invertedHeader ? 'bg-zinc-900 text-zinc-100' : 'bg-background'"
        :style="{ height: numberToPx(userConfig.headerHeight) }"
      >
        <AppHeader :show-logo="!isPc" :show-aside-control="showAsideControl">
          <AppBreadcrumb v-if="showAppBreadcrumb" />
        </AppHeader>
      </header>
      <header
        v-if="userConfig.showTabs"
        class="relative z-[1] shrink-0 border-b bg-background"
        :style="{ height: numberToPx(userConfig.tabHeight) }"
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

      <div
        v-if="isPc && showSubMenu && !userConfig.fixedSubMenu && showSecondAside"
        ref="target"
        class="absolute bottom-0 left-0 top-0 z-20 shadow-lg"
        :class="userConfig.invertedAside ? 'bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground'"
        :style="{ width: numberToPx(userConfig.asideWidth) }"
      >
        <header class="flex border-b" :style="{ height: numberToPx(userConfig.headerHeight) }">
          <div class="flex h-full w-full items-center justify-between px-4">
            <SysLogo :show-logo="false" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <button
                    type="button"
                    class="flex items-center justify-center p-1"
                    aria-label="固定侧边栏"
                    @click="toggleFixedSubMenu(true)"
                  >
                    <IPixelThumbtack class="cursor-pointer text-xl text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">固定</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        <div class="absolute inset-x-0 bottom-0 overflow-y-auto" :style="{ top: numberToPx(userConfig.headerHeight) }">
          <SysSubMenu
            :data="menuStore.subMenuRoutes"
            v-model:active="menuStore.activeMenu"
            @change="handleSubmenuChange"
          />
        </div>
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
import AppBreadcrumb from '@/layouts/components/AppBreadcrumb.vue'
import SysLogo from '@/layouts/components/common/SysLogo.vue'
import SysMenu from './components/SysMenu.vue'
import AppSearchModal from '@/layouts/components/AppSearchModal.vue'
import SysSubMenu from './components/SysSubMenu.vue'
import { onClickOutside } from '@vueuse/core'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const menuStore = useMenuStore()
const appStore = useAppStore()
const { userConfig, systemConfig, showConfigDrawer, isMobile, showMenuDrawer, showRouterView, isPc, showSearchModal } =
  storeToRefs(appStore)

const layoutContentStyle = computed(() => ({
  top: `calc(${numberToPx(userConfig.value.headerHeight)} + ${userConfig.value.showTabs ? numberToPx(userConfig.value.tabHeight) : '0px'})`,
  bottom: userConfig.value.showFooter ? numberToPx(userConfig.value.footerHeight) : '0px',
  padding: numberToPx(userConfig.value.gap),
  backgroundColor: appStore.theme === 'light' ? bgColor : 'transparent',
}))

const showAppBreadcrumb = computed(() => userConfig.value.showBreadcrumb && !isMobile.value)
const showAsideControl = computed(() => isPc.value)
const showSubMenu = ref(false)
const target = useTemplateRef<HTMLElement>('target')

onClickOutside(target, () => {
  showSubMenu.value = false
})

const showSecondAside = computed(() => isPc.value && menuStore.subMenuRoutes.length > 0)

function handleSubmenuChange() {
  showSubMenu.value = false
}

function toggleFixedSubMenu(fixed: boolean) {
  appStore.userConfig.fixedSubMenu = fixed
}

function handleFirstLevenChange(show: boolean) {
  showSubMenu.value = Boolean(show)
}
</script>
