<template>
  <Card>
    <CardContent class="pt-6">
      <Button v-role="'btn0016'" @click="handleAdd">新增用户</Button>
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
        <template #cell-operation="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <Button v-role="'btn0017'" size="sm" variant="outline" @click="handleEdit(row)">编辑</Button>
            <Button v-role="'btn0019'" size="sm" variant="outline" @click="handlePassword(row)">修改密码</Button>
            <Button v-role="'btn0018'" size="sm" variant="destructive" @click="handleDelete(row)">删除</Button>
          </div>
        </template>
      </AppDataTable>
      <AddOrEditModal v-model:show="showModal" :record @success="getPageList" />
      <PasswordModal v-model:show="showPasswordModal" :record />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { userPageListApi, userDeleteApi } from '@/api/setting/user'
import { to } from 'await-to-js'
import AddOrEditModal from './components/AddOrEditModal.vue'
import PasswordModal from './components/PasswordModal.vue'
import AppDataTable from '@/components/AppDataTable/index.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const loading = ref(false)
const tableData = ref<Api.Setting.User[]>([])
const columns = [
  { title: 'id', key: 'id' },
  { title: '账户名', key: 'username' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'operation', fixed: 'right' as const },
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
    userPageListApi({
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

const showModal = ref(false)
const record = ref<Api.Setting.User>()

function handleAdd() {
  record.value = undefined
  showModal.value = true
}

function handleEdit(row: Api.Setting.User) {
  record.value = row
  showModal.value = true
}

function handleDelete(data: Api.Setting.User) {
  const dialogInstance = window.$dialog.warning({
    title: '温馨提示',
    content: `确定要删除“${data.username}”吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      dialogInstance.loading = true
      const [err] = await to(userDeleteApi(data.id))
      dialogInstance.loading = false
      if (err) return false
      window.$message.success('删除成功')
      getPageList()
      return true
    },
  })
}

const showPasswordModal = ref(false)
function handlePassword(data: Api.Setting.User) {
  record.value = data
  showPasswordModal.value = true
}
</script>
