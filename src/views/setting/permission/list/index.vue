<template>
  <Card>
    <CardContent class="pt-6">
      <AppDataTable
        class="mt-4"
        :columns
        :data="tableData"
        :loading
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.itemCount"
        :scroll-x="620"
        @update:page="handlePageChange"
      >
        <template #cell-status="{ row }">
          <Badge
            :class="
              row.status === 1
                ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            "
          >
            {{ row.status === 1 ? '启用' : '禁用' }}
          </Badge>
        </template>
      </AppDataTable>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { permissionPageListApi } from '@/api/setting/permission'
import { to } from 'await-to-js'
import AppDataTable from '@/components/AppDataTable/index.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const loading = ref(false)
const tableData = ref<Api.Setting.Permission[]>([])
const columns = [
  { title: 'id', key: 'id' },
  { title: '权限名', key: 'name' },
  { title: '路由', key: 'path' },
  { title: '状态', key: 'status' },
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
})

function handlePageChange(page: number) {
  pagination.page = page
  getPageList()
}

async function getPageList() {
  loading.value = true
  const [err, data] = await to(
    permissionPageListApi({
      current: pagination.page,
      size: pagination.pageSize,
    }),
  )
  loading.value = false
  if (err) {
    tableData.value = []
    return
  }
  tableData.value = data.records
  pagination.itemCount = data.total
}

getPageList()
</script>
