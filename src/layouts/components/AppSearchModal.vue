<template>
  <Dialog :open="show" @update:open="show = $event">
    <DialogContent
      class="fixed left-1/2 top-5 flex max-h-[calc(100dvh-2.5rem)] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 translate-y-0 flex-col overflow-hidden p-0"
    >
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>搜索</DialogTitle>
        <DialogDescription class="sr-only">搜索菜单页面并使用方向键切换结果</DialogDescription>
      </DialogHeader>

      <Command
        :loop="true"
        class="min-h-0 flex-1 rounded-none bg-transparent"
        @highlight="handleHighlight"
        @keydown.delete="handleDelete"
      >
        <div class="relative">
          <CommandInput v-model="searchContent" placeholder="搜索菜单页面" class="pr-10" />
          <Button
            v-if="searchContent"
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="清空搜索"
            class="absolute right-2 top-1/2 -translate-y-1/2"
            @click="searchContent = ''"
          >
            <SvgIcon icon="mdi:close" />
          </Button>
        </div>

        <CommandList class="max-h-[50vh] px-2">
          <div v-if="searchContent && !searchRoutes.length" class="py-8 text-center text-sm text-muted-foreground">
            没有匹配的菜单
          </div>

          <CommandGroup v-show="!searchContent && searchHistoryMenus.length" heading="历史记录">
            <div class="flex items-center justify-end px-2 py-1">
              <Button variant="link" size="sm" @click="handleClearHistory">清空</Button>
            </div>
            <CommandItem
              v-for="route in searchHistoryMenus"
              :key="route.name"
              :value="String(route.name)"
              :disabled="!!searchContent"
              class="my-1 min-h-11 rounded-md px-3 py-3 text-base"
              @select="handleClick(route)"
            >
              <MenuIcon :options="route.meta" />
              <span>{{ route.meta?.title }}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="删除搜索历史"
                class="ml-auto"
                @click.stop="handleRemoveHistory(route)"
              >
                <IAntDesignCloseOutlined />
              </Button>
            </CommandItem>
          </CommandGroup>

          <div v-if="!searchContent && !searchHistoryMenus.length" class="py-8 text-center text-muted-foreground">
            暂无数据
          </div>

          <CommandGroup v-show="!!searchContent" heading="搜索结果">
            <CommandItem
              v-for="route in searchableRoutes"
              :key="route.name"
              :value="String(route.name)"
              :disabled="!searchContent"
              class="my-1 min-h-11 rounded-md px-3 py-3 text-base"
              @select="handleClick(route)"
            >
              <MenuIcon :options="route.meta" />
              <span>{{ route.meta?.title }}</span>
              <IAntDesignEnterOutlined class="ml-auto" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <DialogFooter
        class="flex-row flex-wrap justify-start gap-2 border-t px-6 py-3 text-sm text-muted-foreground sm:justify-start"
      >
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
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMenuStore } from '@/stores'
import { useRouterHook } from '@/hooks/router'
import type { RouteRecordRaw } from 'vue-router'

const show = defineModel<boolean>('show', {
  required: true,
})

const menuStore = useMenuStore()
const { menuRoutes, searchHistoryMenus } = storeToRefs(menuStore)

const searchContent = ref('')
const highlightedValue = ref<string>()
const { routerPushByName } = useRouterHook()

function flattenSearchableRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const results: RouteRecordRaw[] = []

  function walk(items: RouteRecordRaw[]) {
    for (const item of items) {
      if (item.component && typeof item.name === 'string' && typeof item.meta?.title === 'string' && item.meta.title) {
        results.push(item)
      }

      if (item.children?.length) {
        walk(item.children)
      }
    }
  }

  walk(routes)
  return results
}

const searchableRoutes = computed(() => flattenSearchableRoutes(menuRoutes.value))
const searchRoutes = computed(() => {
  const keyword = searchContent.value.trim().toLocaleLowerCase()
  if (!keyword) {
    return []
  }

  return searchableRoutes.value.filter((route) => {
    const title = route.meta?.title
    return typeof title === 'string' && title.toLocaleLowerCase().includes(keyword)
  })
})

function handleHighlight(payload?: { value: unknown }) {
  highlightedValue.value = typeof payload?.value === 'string' ? payload.value : undefined
}

function handleDelete(event: KeyboardEvent) {
  if (searchContent.value || !highlightedValue.value) {
    return
  }

  const route = searchHistoryMenus.value.find((item) => String(item.name) === highlightedValue.value)
  if (!route) {
    return
  }

  event.preventDefault()
  handleRemoveHistory(route)
}

async function handleClick(route: RouteRecordRaw) {
  routerPushByName(route.name as RouteRecordName)
  show.value = false
  searchContent.value = ''
  await nextTick()
  menuStore.addSearchHistoryMenu(route)
}

function handleClearHistory() {
  menuStore.clearSearchHistoryMenus()
}

function handleRemoveHistory(route: RouteRecordRaw) {
  menuStore.removeSearchHistoryMenu(route)
  if (highlightedValue.value === String(route.name)) {
    highlightedValue.value = undefined
  }
}

watch(show, (value) => {
  if (!value) {
    nextTick(() => {
      searchContent.value = ''
      highlightedValue.value = undefined
    })
  }
})
</script>
