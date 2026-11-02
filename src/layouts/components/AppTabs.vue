<template>
  <div class="h-full flex items-center">
    <div class="back-wrapper h-full" :class="{ 'back-show': showBack, 'back-hide': !showBack }">
      <div
        v-if="showBack"
        class="back-container h-full flex items-center cursor-pointer gap-2 border-r border-border px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="handleBack"
      >
        <IMaterialSymbolsArrowBackIosNew></IMaterialSymbolsArrowBackIosNew>
        <div>返回</div>
      </div>
    </div>
    <VueDraggable
      v-model="tabsList"
      target=".sort-target"
      handle=".handle"
      class="scrollbar-hide mx-3 min-w-0 flex-1 overflow-x-auto"
      v-dragscroll
    >
      <TransitionGroup
        type="transition"
        tag="div"
        name="fade"
        class="sort-target h-full w-max flex select-none gap-4 px-4 pt-1 text-sm"
      >
        <div v-for="(item, index) in tabsList" :key="item.fullPath" class="inline-flex">
          <ContextMenu>
            <ContextMenuTrigger as-child>
              <div
                class="tab-item px-3 py-1"
                :class="[
                  item.fullPath === route.fullPath
                    ? 'text-primary dark:text-white bg-primary-100 dark:bg-primary-700'
                    : '',
                ]"
                :ref="(el) => setItemRef(el as HTMLElement, item.fullPath)"
                @click="handleJump(item.fullPath)"
              >
                <div
                  class="flex items-center gap-2 rounded-lg px-3 py-1"
                  :class="[item.fullPath === route.fullPath ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700']"
                >
                  <MenuIcon :options="item" class="handle cursor-move" />
                  <div class="max-w-[60px] truncate whitespace-nowrap">{{ item.title }}</div>
                  <button
                    v-if="!item.fixedInTab"
                    type="button"
                    class="group/tab-close relative inline-flex size-5 cursor-pointer items-center justify-center text-lg"
                    aria-label="关闭标签"
                    @click.stop="tabStore.removeTabsAction(item)"
                  >
                    <CloseTabIcon class="absolute group-hover/tab-close:hidden" />
                    <CloseTabHoverIcon class="absolute hidden group-hover/tab-close:block" />
                  </button>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem :disabled="Boolean(item.fixedInTab)" @select="handleSelect('closeCurrent', item)">
                <IconClose />关闭
              </ContextMenuItem>
              <ContextMenuItem @select="handleSelect('closeOther', item)"> <IconCloseOther />关闭其它 </ContextMenuItem>
              <ContextMenuItem :disabled="index === 0" @select="handleSelect('closeLeft', item)">
                <IconCloseLeft />关闭左侧
              </ContextMenuItem>
              <ContextMenuItem :disabled="index === tabsList.length - 1" @select="handleSelect('closeRight', item)">
                <IconCloseRight />关闭右侧
              </ContextMenuItem>
              <ContextMenuItem @select="handleSelect('closeAll', item)"> <IconCloseAll />关闭所有 </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </TransitionGroup>
    </VueDraggable>

    <div class="h-full flex items-center gap-4 border-l border-border px-4 text-lg">
      <Tooltip v-if="isPc">
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon-sm" aria-label="刷新" @click="appStore.refreshRouterView">
            <IOouiReload />
          </Button>
        </TooltipTrigger>
        <TooltipContent>刷新</TooltipContent>
      </Tooltip>
      <div
        v-else
        class="flex items-center justify-center cursor-pointer rounded-sm p-1 hover:text-primary"
        @click="appStore.refreshRouterView"
      >
        <IOouiReload />
      </div>

      <Tooltip v-if="isPc">
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon-sm" aria-label="内容全屏" @click="toggle">
            <IOouiExitFullscreen v-if="isFullscreen" />
            <IOouiFullScreen v-else />
          </Button>
        </TooltipTrigger>
        <TooltipContent>内容全屏</TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useTabStore, useAppStore } from '@/stores'
import { useWindowSize, useDebounceFn, useFullscreen } from '@vueuse/core'
import { VueDraggable } from 'vue-draggable-plus'
import CloseTabIcon from '~icons/material-symbols/close-rounded'
import CloseTabHoverIcon from '~icons/material-symbols/cancel-rounded'
import IconClose from '~icons/ant-design/close-outlined'
import IconCloseOther from '~icons/ant-design/column-width-outlined'
import IconCloseLeft from '~icons/mdi/format-horizontal-align-left'
import IconCloseRight from '~icons/mdi/format-horizontal-align-right'
import IconCloseAll from '~icons/ant-design/line-outlined'
import type { Directive } from 'vue'
import { Button } from '@/components/ui/button'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const route = useRoute()
const router = useRouter()
const showBack = computed(() => Boolean(route.meta.showBack))
const appStore = useAppStore()
const { layoutContentRef, isPc } = storeToRefs(appStore)
const { isFullscreen, toggle } = useFullscreen(layoutContentRef)
function handleBack() {
  router.back()
}

interface DragScrollHTMLElement extends HTMLElement {
  _dragscroll?: {
    isDown: boolean
    startX: number
    scrollLeft: number
    handleMouseDown: (e: MouseEvent) => void
    handleMouseLeave: () => void
    handleMouseUp: () => void
    handleMouseMove: (e: MouseEvent) => void
  }
}

const vDragscroll: Directive<DragScrollHTMLElement> = {
  mounted(el) {
    let isDown = false
    let startX: number
    let scrollLeft: number

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      el.style.cursor = 'grabbing'
    }

    const handleMouseLeave = () => {
      isDown = false
      el.style.cursor = 'grab'
    }

    const handleMouseUp = () => {
      isDown = false
      el.style.cursor = 'grab'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 2
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('mousedown', handleMouseDown)
    el.addEventListener('mouseleave', handleMouseLeave)
    el.addEventListener('mouseup', handleMouseUp)
    el.addEventListener('mousemove', handleMouseMove)

    // 保存引用以便卸载时使用
    el._dragscroll = {
      isDown,
      startX: 0,
      scrollLeft: 0,
      handleMouseDown,
      handleMouseLeave,
      handleMouseUp,
      handleMouseMove,
    }
  },
  unmounted(el) {
    // 清理事件监听
    const handlers = el._dragscroll
    if (handlers) {
      el.removeEventListener('mousedown', handlers.handleMouseDown)
      el.removeEventListener('mouseleave', handlers.handleMouseLeave)
      el.removeEventListener('mouseup', handlers.handleMouseUp)
      el.removeEventListener('mousemove', handlers.handleMouseMove)
    }
  },
}

const tabStore = useTabStore()
const { tabsList } = storeToRefs(tabStore)

function handleSelect(key: string, tab: App.Tab) {
  switch (key) {
    case 'closeCurrent':
      tabStore.removeTabsAction(tab)
      break
    case 'closeOther':
      tabStore.closeOtherTabsAction(tab)
      break
    case 'closeLeft':
      tabStore.closeLeftTabsAction(tab)
      break
    case 'closeRight':
      tabStore.closeRightTabsAction(tab)
      break
    case 'closeAll':
      tabStore.closeAllTabsAction()
      break
  }
}

const tabRefs = ref<Record<string | number, HTMLElement>>({})
function setItemRef(el: HTMLElement | null, path: string) {
  if (el) {
    tabRefs.value[path] = el
  }
}

function scrollIntoView() {
  nextTick(() => {
    const element = tabRefs.value[route.fullPath]
    if (!element) return
    element.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    })
  })
}

const debouncedScrollIntoView = useDebounceFn(scrollIntoView, 400)

watch(
  () => route.fullPath,
  () => debouncedScrollIntoView(),
  {
    immediate: true,
  },
)

const { width } = useWindowSize()
function handleJump(path: string) {
  router.push(path)
}
watch(width, () => scrollIntoView())
</script>
<style scoped>
.tab-item {
  margin: 0 -16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  -webkit-mask-image:
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M100 100C44.772 100 0 55.228 0 0v100h100z' fill='%23F8EAE7'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 100c55.228 0 100-44.772 100-100v100H0z' fill='%23F8EAE7'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><rect rx='12' width='100%' height='100%' fill='%23F8EAE7'/></svg>");
  -webkit-mask-size:
    12px 12px,
    12px 12px,
    calc(100% - 24px) calc(100% + 12px);
  -webkit-mask-position:
    right bottom,
    left bottom,
    center top;
  -webkit-mask-repeat: no-repeat;
}

.tab-item.active {
  background: var(--color-primary-100);
}

/* tab 动画 */
.sort-target {
  position: relative;
}

/*
 * 其他tab补位动画
 * Vue TransitionGroup FLIP 动画依赖这个
 */
.fade-move {
  transition: transform 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

/*
 * 新tab进入
 */
.fade-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

/*
 * 删除tab
 */
.fade-leave-active {
  position: absolute;
  z-index: -1;
  pointer-events: none;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

/*
 * 进入前状态
 */
.fade-enter-from {
  opacity: 0;

  /*
   * 从右侧展开
   */
  transform: translateX(20px) scaleX(0.8);

  transform-origin: right center;
}

/*
 * 删除后状态
 */
.fade-leave-to {
  opacity: 0;

  /*
   * 从右往左收缩
   */
  transform: scaleX(0);

  transform-origin: right center;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
}

.back-wrapper {
  width: 0;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.back-show {
  width: 75px;
}

.back-hide {
  width: 0;
}

.back-container {
  width: 75px;
}
</style>
