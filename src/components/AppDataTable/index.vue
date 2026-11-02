<template>
  <div class="w-full">
    <div class="w-full overflow-x-auto rounded-md border">
      <Table class="min-w-[620px]" :style="{ minWidth: `${scrollX}px` }">
        <TableHeader class="bg-muted/50">
          <TableRow class="hover:bg-transparent">
            <TableHead
              v-for="column in columns"
              :key="column.key"
              class="px-4 font-medium text-muted-foreground"
              :class="columnClass(column)"
            >
              {{ column.title }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="hover:bg-transparent">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              <span class="inline-flex items-center gap-2"><Spinner class="size-4" />加载中...</span>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="data.length === 0" class="hover:bg-transparent">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">暂无数据</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="(row, index) in data" :key="rowKey(row, index)" class="hover:bg-muted/40">
              <TableCell v-for="column in columns" :key="column.key" class="px-4 py-3" :class="columnClass(column)">
                <slot :name="`cell-${column.key}`" :row="row" :value="cellValue(row, column.key)">
                  {{ cellValue(row, column.key) }}
                </slot>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div v-if="total > 0" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>共 {{ total }} 条</span>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1 || loading" @click="emit('update:page', page - 1)"
          >上一页</Button
        >
        <span class="min-w-16 text-center">{{ page }} / {{ pageCount }}</span>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= pageCount || loading"
          @click="emit('update:page', page + 1)"
          >下一页</Button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Column = {
  title: string
  key: string
  class?: string
  fixed?: 'right'
}

const props = withDefaults(
  defineProps<{
    columns: Column[]
    data: T[]
    loading?: boolean
    page: number
    pageSize: number
    total: number
    scrollX?: number
  }>(),
  { loading: false, scrollX: 620 },
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function columnClass(column: Column) {
  return [
    column.class,
    column.fixed === 'right' ? 'sticky right-0 z-[1] bg-card shadow-[-6px_0_8px_-8px] shadow-border' : '',
  ]
}

function cellValue(row: T, key: string) {
  return (row as Record<string, unknown>)[key]
}

function rowKey(row: T, index: number) {
  const key = (row as Record<string, unknown>).id
  return key == null ? index : String(key)
}
</script>
