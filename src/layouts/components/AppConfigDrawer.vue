<template>
  <Sheet :open="show" @update:open="show = $event">
    <SheetContent class="w-full max-w-[400px] p-0 sm:max-w-[400px]">
      <SheetHeader class="border-b px-6 py-4">
        <SheetTitle>系统配置</SheetTitle>
        <SheetDescription class="sr-only">调整系统布局、主题和显示选项</SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <h3 class="text-sm font-semibold">布局模式</h3>
            <Separator class="flex-1" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-center gap-3 rounded-md border p-2 text-sm transition-colors hover:bg-accent"
              :class="userConfig.layoutMode === 'aside' ? 'border-primary' : 'border-transparent'"
              :aria-pressed="userConfig.layoutMode === 'aside'"
              @click="handleChangeLayout('aside')"
            >
              <div class="flex h-[80px] w-full gap-2">
                <div class="w-5 rounded bg-primary"></div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="h-5 rounded bg-primary-300"></div>
                  <div class="flex-1 rounded bg-primary-300"></div>
                </div>
              </div>
              <span>经典布局</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-center gap-3 rounded-md border p-2 text-sm transition-colors hover:bg-accent"
              :class="userConfig.layoutMode === 'top' ? 'border-primary' : 'border-transparent'"
              :aria-pressed="userConfig.layoutMode === 'top'"
              @click="handleChangeLayout('top')"
            >
              <div class="flex h-[80px] w-full flex-col gap-2">
                <div class="h-5 rounded bg-primary"></div>
                <div class="flex-1 rounded bg-primary-300"></div>
              </div>
              <span>顶部菜单布局</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-center gap-3 rounded-md border p-2 text-sm transition-colors hover:bg-accent"
              :class="userConfig.layoutMode === 'top-aside' ? 'border-primary' : 'border-transparent'"
              :aria-pressed="userConfig.layoutMode === 'top-aside'"
              @click="handleChangeLayout('top-aside')"
            >
              <div class="flex h-[80px] w-full gap-2">
                <div class="w-5 rounded bg-primary"></div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="h-5 rounded bg-primary"></div>
                  <div class="flex-1 rounded bg-primary-300"></div>
                </div>
              </div>
              <span>一级菜单顶部</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-center gap-3 rounded-md border p-2 text-sm transition-colors hover:bg-accent"
              :class="userConfig.layoutMode === 'aside-double' ? 'border-primary' : 'border-transparent'"
              :aria-pressed="userConfig.layoutMode === 'aside-double'"
              @click="handleChangeLayout('aside-double')"
            >
              <div class="flex h-[80px] w-full gap-1">
                <div class="w-5 rounded bg-primary"></div>
                <div class="w-4 rounded bg-primary"></div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="h-5 rounded bg-primary-300"></div>
                  <div class="flex-1 rounded bg-primary-300"></div>
                </div>
              </div>
              <span>左侧双布局</span>
            </button>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <h3 class="text-sm font-semibold">路由动画</h3>
            <Separator class="flex-1" />
          </div>
          <RadioGroup v-model="userConfig.transitionName" class="grid grid-cols-2 gap-2">
            <Label
              v-for="item in transitionOptions"
              :key="item.value"
              :for="`transition-${item.value}`"
              class="cursor-pointer rounded-md border p-2"
            >
              <RadioGroupItem :id="`transition-${item.value}`" :value="item.value" />
              {{ item.label }}
            </Label>
          </RadioGroup>
        </section>

        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <h3 class="text-sm font-semibold">主题色</h3>
            <Separator class="flex-1" />
          </div>
          <div class="flex items-center justify-between rounded-md border p-3">
            <Label for="primary-color">主色</Label>
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted-foreground">{{ primaryColor }}</span>
              <input
                id="primary-color"
                type="color"
                :value="primaryColor"
                class="h-9 w-12 cursor-pointer rounded border bg-background p-1"
                aria-label="选择主题色"
                @input="handlePrimaryColorInput"
              />
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <h3 class="text-sm font-semibold">网站配置</h3>
            <Separator class="flex-1" />
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-4">
              <Label for="header-height">头部高度</Label
              ><Input id="header-height" v-model.number="userConfig.headerHeight" type="number" step="1" class="w-24" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="tab-height">标签栏高度</Label
              ><Input id="tab-height" v-model.number="userConfig.tabHeight" type="number" step="1" class="w-24" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="aside-width">侧边栏宽度</Label
              ><Input id="aside-width" v-model.number="userConfig.asideWidth" type="number" step="1" class="w-24" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="footer-height">底部高度</Label
              ><Input id="footer-height" v-model.number="userConfig.footerHeight" type="number" step="1" class="w-24" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="layout-gap">间隙</Label
              ><Input id="layout-gap" v-model.number="userConfig.gap" type="number" step="1" class="w-24" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="show-breadcrumb">显示面包屑</Label
              ><Switch id="show-breadcrumb" v-model:checked="userConfig.showBreadcrumb" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="show-tabs">显示标签栏</Label><Switch id="show-tabs" v-model:checked="userConfig.showTabs" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="show-footer">显示底部</Label
              ><Switch id="show-footer" v-model:checked="userConfig.showFooter" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="inverted-header">头部颜色反转</Label
              ><Switch id="inverted-header" v-model:checked="userConfig.invertedHeader" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="inverted-aside">侧边栏颜色反转</Label
              ><Switch id="inverted-aside" v-model:checked="userConfig.invertedAside" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="show-watermark">全局水印</Label
              ><Switch id="show-watermark" v-model:checked="userConfig.showWaterMark" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="color-weak-mode">色弱模式</Label
              ><Switch id="color-weak-mode" v-model:checked="userConfig.colorWeakMode" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <Label for="gray-mode">灰色模式</Label><Switch id="gray-mode" v-model:checked="userConfig.grayMode" />
            </div>
          </div>
        </section>
      </div>

      <SheetFooter class="border-t px-6 py-4">
        <div class="flex w-full justify-between gap-3">
          <Button @click="handleCopy">复制</Button>
          <Button variant="outline" @click="handleReset">重置</Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores'
import { injectTailwindCssVarToGlobal } from '@/utils/theme'
import { useClipboard } from '@vueuse/core'

const show = defineModel<boolean>('show', {
  required: true,
})

const appStore = useAppStore()

const { userConfig } = storeToRefs(appStore)
const primaryColor = computed(() => appStore.themeOverrides.common.primaryColor)

function handleChangeLayout(layoutMode: App.LayoutMode) {
  appStore.layoutModeChangeAction(layoutMode)
}

const transitionOptions = [
  { label: '淡入淡出', value: 'fade' },
  { label: '从左滑入', value: 'slide-left' },
  { label: '从右滑入', value: 'slide-right' },
  { label: '从上滑入', value: 'slide-up' },
  { label: '从下滑入', value: 'slide-down' },
  { label: '缩放淡入', value: 'scale' },
  { label: '无动画', value: 'none' },
] as const

function handleChangePrimaryColor(color: string) {
  injectTailwindCssVarToGlobal(color, 'primary')
}

function handlePrimaryColorInput(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  appStore.themeOverrides.common.primaryColor = input.value
  handleChangePrimaryColor(input.value)
}

const { copy } = useClipboard()

function handleCopy() {
  const copyStr = `
const userConfig: App.UserConfig = {
  version: ${userConfig.value.version + 1},
  layoutMode: '${userConfig.value.layoutMode}',
  asideWidth: ${userConfig.value.asideWidth},
  headerHeight: ${userConfig.value.headerHeight},
  footerHeight: ${userConfig.value.footerHeight},
  tabHeight: ${userConfig.value.tabHeight},
  gap: ${userConfig.value.gap},
  showTabs: ${userConfig.value.showTabs},
  showBreadcrumb: ${userConfig.value.showBreadcrumb},
  showFooter: ${userConfig.value.showFooter},
  invertedHeader: ${userConfig.value.invertedHeader},
  invertedAside: ${userConfig.value.invertedAside}
}
  `
  copy(copyStr.trim())

  window.$dialog.success({
    title: '复制成功',
    content: '请手动粘贴到 src/config/modules/app.ts 中，覆盖userConfig',
    positiveText: '我知道了',
  })
}

function handleReset() {
  appStore.resetLayoutAndTheme()
}
</script>

<style scoped></style>
