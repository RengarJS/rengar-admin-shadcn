<template>
  <Dialog :open="show" @update:open="show = $event">
    <DialogContent
      class="fixed left-1/2 top-5 max-h-[calc(100dvh-2.5rem)] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 translate-y-0 overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>搜索</DialogTitle>
        <DialogDescription class="sr-only">搜索菜单页面并使用方向键切换结果</DialogDescription>
      </DialogHeader>
      <div>
        <div class="relative">
          <Input
            v-model="searchContent"
            autofocus
            placeholder="搜索菜单页面"
            class="h-10 pr-10"
            @keypress.enter="handleEnter"
            @keydown="handleKeyDown"
            @blur="isComposing = false"
          />
          <Button
            v-if="searchContent"
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="清空搜索"
            class="absolute right-1 top-1/2 -translate-y-1/2"
            @click="searchContent = ''"
          >
            <SvgIcon icon="mdi:close" />
          </Button>
        </div>

        <div class="max-h-[50vh] overflow-y-auto pr-1">
          <div v-if="!searchContent && searchHistoryMenus.length" class="mt-6">
            <div class="flex items-center justify-between">
              <div>历史记录</div>
              <Button variant="link" size="sm" @click="menuStore.clearSearchHistoryMenus">清空</Button>
            </div>
            <Card
              v-for="(route, index) in searchHistoryMenus"
              :key="route.name"
              class="mt-3 cursor-pointer gap-0 p-0 transition-colors hover:bg-accent"
              @click="handleClick(route)"
            >
              <CardContent :class="computedContentClass(index)">
                <div class="flex items-center gap-3 text-base">
                  <MenuIcon :options="route.meta" />
                  <div>{{ route.meta?.title }}</div>
                </div>
                <IAntDesignCloseOutlined
                  aria-label="删除搜索历史"
                  class="cursor-pointer"
                  @click.stop="menuStore.removeSearchHistoryMenu(route)"
                />
              </CardContent>
            </Card>
          </div>
          <div
            v-if="!searchHistoryMenus.length && !searchRoutes.length"
            class="mt-6 py-8 text-center text-muted-foreground"
          >
            暂无数据
          </div>
          <div v-if="searchRoutes.length" class="mt-6">
            <Card
              v-for="(route, index) in searchRoutes"
              :key="route.name"
              class="cursor-pointer gap-0 p-0 transition-colors hover:bg-accent"
              :class="index > 0 ? 'mt-3' : ''"
              @click="handleClick(route)"
            >
              <CardContent :class="computedContentClass(index)">
                <div class="flex items-center gap-3 text-base">
                  <MenuIcon :options="route.meta" />
                  <div>{{ route.meta?.title }}</div>
                </div>
                <IAntDesignEnterOutlined />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-row flex-wrap justify-start gap-2 text-sm text-muted-foreground sm:justify-start">
        <div class="flex items-center gap-2">
          <kbd class="rounded border px-1 py-0.5"><IAntDesignEnterOutlined /></kbd>
          <span class="mr-2">选择</span>
        </div>
        <div class="flex items-center gap-2">
          <kbd class="rounded border px-1 py-0.5"><IAntDesignArrowUpOutlined /></kbd>
          <kbd class="rounded border px-1 py-0.5"><IAntDesignArrowDownOutlined /></kbd>
          <span class="mr-2">切换</span>
        </div>
        <div class="flex items-center gap-2">
          <kbd class="rounded border px-1 py-0.5">Del</kbd>
          <span>删除</span>
        </div>
        <div class="flex items-center gap-2">
          <kbd class="rounded border px-1 py-0.5">Esc</kbd>
          <span>关闭</span>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useMenuStore } from '@/stores'
import { useRouterHook } from '@/hooks/router'
import { useMagicKeys, whenever } from '@vueuse/core'
import type { RouteRecordRaw } from 'vue-router'

const show = defineModel<boolean>('show', {
  required: true,
})

const menuStore = useMenuStore()

const { menuRoutes, searchHistoryMenus } = storeToRefs(menuStore)

const searchContent = ref('')
const activeIndex = ref(-1) // 修改默认值为-1，表示无选中项

let isComposing = false
function handleKeyDown(e: KeyboardEvent) {
  isComposing = e.isComposing
}

const {
  ArrowUp,
  ArrowDown,
  Enter,
  Delete: DeleteKey,
} = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (['ArrowUp', 'ArrowDown', 'Enter', 'Delete'].includes(e.key) && e.type === 'keydown') {
      e.preventDefault()
    }
  },
})

// 监听上下箭头键
whenever(ArrowUp!, () => {
  if (isComposing) {
    return
  }
  if (searchContent.value && searchRoutes.value.length > 0) {
    // 搜索模式
    activeIndex.value = (activeIndex.value - 1 + searchRoutes.value.length) % searchRoutes.value.length
  } else if (!searchContent.value && searchHistoryMenus.value.length > 0) {
    // 历史记录模式
    activeIndex.value = (activeIndex.value - 1 + searchHistoryMenus.value.length) % searchHistoryMenus.value.length
  }
})

whenever(ArrowDown!, () => {
  if (isComposing) {
    return
  }
  if (searchContent.value && searchRoutes.value.length > 0) {
    // 搜索模式
    activeIndex.value = (activeIndex.value + 1) % searchRoutes.value.length
  } else if (!searchContent.value && searchHistoryMenus.value.length > 0) {
    // 历史记录模式
    activeIndex.value = (activeIndex.value + 1) % searchHistoryMenus.value.length
  }
})

// 监听 Enter 键
whenever(Enter!, () => {
  if (isComposing) {
    return
  }
  if (searchContent.value && searchRoutes.value.length > 0) {
    // 搜索模式
    if (activeIndex.value >= 0 && searchRoutes.value[activeIndex.value]) {
      handleClick(searchRoutes.value[activeIndex.value]!)
    } else if (searchRoutes.value.length > 0) {
      // 如果没有选择任何项，选择第一项
      handleClick(searchRoutes.value[0]!)
    }
  } else if (!searchContent.value && searchHistoryMenus.value.length > 0) {
    // 历史记录模式
    if (activeIndex.value >= 0 && searchHistoryMenus.value[activeIndex.value]) {
      handleClick(searchHistoryMenus.value[activeIndex.value]!)
    } else if (searchHistoryMenus.value.length > 0) {
      // 如果没有选择任何项，选择第一项
      handleClick(searchHistoryMenus.value[0]!)
    }
  }
})

// 监听 Delete 键，只在历史记录模式下有效
whenever(DeleteKey!, () => {
  if (isComposing) {
    return
  }
  if (!searchContent.value && searchHistoryMenus.value.length > 0 && activeIndex.value >= 0) {
    // 删除当前选中的历史记录项
    const currentRoute = searchHistoryMenus.value[activeIndex.value]
    handleRemove(currentRoute!)
  }
})

function handleRemove(route: RouteRecordRaw) {
  // 记录当前选中项的索引
  const currentIndex = activeIndex.value
  menuStore.removeSearchHistoryMenu(route)

  // 如果删除的是当前选中的项，需要重新设置选中状态
  nextTick(() => {
    if (searchHistoryMenus.value.length === 0) {
      // 如果历史记录为空，将选中索引设为-1
      activeIndex.value = -1
    } else if (currentIndex < searchHistoryMenus.value.length) {
      // 如果删除后还有历史记录且当前索引仍在范围内，保持当前索引
      activeIndex.value = currentIndex
    } else {
      // 如果当前索引超出范围，则选中最后一项
      activeIndex.value = Math.max(0, searchHistoryMenus.value.length - 1)
    }
  })
}

const { routerPushByName } = useRouterHook()

function handleEnter() {
  if (searchContent.value && searchRoutes.value.length > 0) {
    // 搜索模式
    if (activeIndex.value >= 0 && searchRoutes.value[activeIndex.value]) {
      handleClick(searchRoutes.value[activeIndex.value]!)
    } else if (searchRoutes.value.length > 0) {
      // 如果没有选择任何项，选择第一项
      handleClick(searchRoutes.value[0]!)
    }
  } else if (!searchContent.value && searchHistoryMenus.value.length > 0) {
    // 历史记录模式
    if (activeIndex.value >= 0 && searchHistoryMenus.value[activeIndex.value]) {
      handleClick(searchHistoryMenus.value[activeIndex.value]!)
    } else if (searchHistoryMenus.value.length > 0) {
      // 如果没有选择任何项，选择第一项
      handleClick(searchHistoryMenus.value[0]!)
    }
  }
}

function handleClick(route: RouteRecordRaw) {
  routerPushByName(route.name as RouteRecordName)
  show.value = false
  menuStore.addSearchHistoryMenu(route)
}

/**
 * 递归遍路由（包括嵌套 children），扁平化筛选出 meta.title 包含关键词的项，排除没有component 的项
 * 并仅返回 { name, path, meta } 字段。
 */
function flattenAndSearchRoutes(routes: RouteRecordRaw[], keyword: string): Array<RouteRecordRaw> {
  if (!keyword.trim()) {
    return []
  }

  const lowerKeyword = keyword.toLowerCase()
  const results: Array<RouteRecordRaw> = []

  function walk(items: RouteRecordRaw[]) {
    for (const item of items) {
      if (
        item.component &&
        typeof item.name === 'string' &&
        item.meta?.title &&
        typeof item.meta.title === 'string' &&
        item.meta.title.toLowerCase().includes(lowerKeyword)
      ) {
        results.push(item)
      }
      if (item.children) {
        walk(item.children)
      }
    }
  }

  walk(routes)
  return results
}

const searchRoutes = computed(() => {
  const result = flattenAndSearchRoutes(menuRoutes.value, searchContent.value)
  if (result.length > 0) {
    activeIndex.value = 0
  } else {
    activeIndex.value = -1
  }
  return result
})

function computedContentClass(index: number) {
  const classes = [
    'flex items-center justify-between',
    'p-3',
    index === activeIndex.value ? 'bg-primary/20 dark:bg-primary/30 rounded' : '',
  ]
  return classes.filter(Boolean).join(' ')
}

watch(show, (value) => {
  if (!value) {
    nextTick(() => {
      // 关闭弹框时重置所有状态
      activeIndex.value = -1
      searchContent.value = ''
    })
  } else {
    nextTick(() => {
      // 打开弹框时，根据是否有搜索内容设置高亮项
      if (searchContent.value && searchRoutes.value.length > 0) {
        activeIndex.value = 0
      } else if (!searchContent.value && searchHistoryMenus.value.length > 0) {
        activeIndex.value = 0 // 默认高亮历史记录的第一项
      } else {
        activeIndex.value = -1
      }
    })
  }
})

// 监听searchContent变化，当清空搜索内容时，自动高亮历史记录第一项
watch(
  searchContent,
  (newVal) => {
    if (!newVal && searchHistoryMenus.value.length > 0) {
      activeIndex.value = 0
    } else if (newVal && searchRoutes.value.length > 0) {
      activeIndex.value = 0
    }
  },
  { immediate: true },
)
</script>

<style scoped></style>
