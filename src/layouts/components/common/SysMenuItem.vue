<template>
  <div class="relative min-w-0" :class="mode === 'horizontal' ? 'group/menu-item' : 'mt-1.5 first:mt-0'">
    <RouterLink
      v-if="isLeaf && !route.meta?.href"
      :to="routeTo"
      class="flex h-[42px] min-w-0 items-center gap-3 rounded-md px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :class="[
        activeKey === active ? 'bg-primary/10 font-medium text-primary' : '',
        collapsed ? 'justify-center px-2' : '',
        inverted ? 'text-zinc-200 hover:bg-white/10 hover:text-white' : '',
      ]"
      :title="collapsed ? String(route.meta?.title ?? '') : undefined"
      @click="emitSelect"
    >
      <MenuIcon :options="route.meta" class="size-5 shrink-0" />
      <span v-if="!collapsed" class="truncate">{{ route.meta?.title }}</span>
    </RouterLink>

    <a
      v-else-if="route.meta?.href"
      :href="route.meta.href"
      target="_blank"
      class="flex h-[42px] min-w-0 items-center gap-3 rounded-md px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :class="[
        activeKey === active ? 'bg-primary/10 font-medium text-primary' : '',
        collapsed ? 'justify-center px-2' : '',
        inverted ? 'text-zinc-200 hover:bg-white/10 hover:text-white' : '',
      ]"
      :title="collapsed ? String(route.meta?.title ?? '') : undefined"
      @click="emitSelect"
    >
      <MenuIcon :options="route.meta" class="size-5 shrink-0" />
      <span v-if="!collapsed" class="truncate">{{ route.meta?.title }}</span>
    </a>

    <button
      v-else
      type="button"
      class="flex h-[42px] w-full min-w-0 items-center gap-3 rounded-md px-3 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :class="[
        activeKey === active ? 'bg-primary/10 font-medium text-primary' : '',
        collapsed ? 'justify-center px-2' : '',
        inverted ? 'text-zinc-200 hover:bg-white/10 hover:text-white' : '',
      ]"
      :aria-expanded="open"
      :title="collapsed ? String(route.meta?.title ?? '') : undefined"
      @click="handleBranchClick"
    >
      <MenuIcon :options="route.meta" class="size-5 shrink-0" />
      <span v-if="!collapsed" class="min-w-0 flex-1 truncate">{{ route.meta?.title }}</span>
      <ChevronDown v-if="!collapsed" class="size-4 shrink-0 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <div
      v-if="children.length && open"
      class="z-50"
      :class="
        mode === 'horizontal' || collapsed
          ? [
              'absolute left-full top-0 ml-1 mt-1 min-w-48 rounded-md border p-1 shadow-md',
              inverted ? 'border-white/10 bg-zinc-900 text-zinc-100' : 'bg-popover text-popover-foreground',
            ]
          : 'ml-5 min-w-0 pl-2'
      "
    >
      <SysMenuItem
        v-for="child in children"
        :key="String(child.name)"
        :route="child"
        :children-field="childrenField"
        :active-key="activeKey"
        :collapsed="false"
        :inverted="inverted"
        mode="vertical"
        @select="handleChildSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import { ChevronDown } from '@lucide/vue'
import MenuIcon from '@/components/MenuIcon/index.vue'

defineOptions({ name: 'SysMenuItem' })

const props = withDefaults(
  defineProps<{
    route: RouteRecordRaw
    activeKey?: RouteRecordName
    collapsed?: boolean
    inverted?: boolean
    mode?: 'horizontal' | 'vertical'
    childrenField?: string
  }>(),
  { collapsed: false, inverted: false, mode: 'vertical', childrenField: 'children' },
)

const emit = defineEmits<{ select: [name: RouteRecordName] }>()
const open = ref(false)
const routeTo = computed(() => ({ name: props.route.name }) as unknown as RouteLocationRaw)
const children = computed(() => {
  const value = (props.route as unknown as Record<string, unknown>)[props.childrenField]
  return Array.isArray(value) ? (value as RouteRecordRaw[]) : []
})
const active = computed(() => props.route.meta?.activeMenu || props.route.name)
const isLeaf = computed(() => children.value.length === 0)

function routeContainsActive(route: RouteRecordRaw, activeKey?: RouteRecordName): boolean {
  if (!activeKey) return false
  if ((route.meta?.activeMenu || route.name) === activeKey) return true
  const nested = (route as unknown as Record<string, unknown>)[props.childrenField]
  return Array.isArray(nested) && nested.some((child) => routeContainsActive(child as RouteRecordRaw, activeKey))
}

const hasActiveChild = computed(() => children.value.some((child) => routeContainsActive(child, props.activeKey)))

watch(
  () => [props.activeKey, props.mode] as const,
  ([, mode]) => {
    if (mode === 'vertical' && hasActiveChild.value) open.value = true
  },
  { immediate: true },
)

function emitSelect() {
  if (props.route.name) emit('select', active.value as RouteRecordName)
}

function handleBranchClick() {
  emitSelect()
  open.value = !open.value
}

function handleChildSelect(name: RouteRecordName) {
  open.value = false
  emit('select', name)
}
</script>
