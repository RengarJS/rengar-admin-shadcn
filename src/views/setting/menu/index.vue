<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-base">菜单管理</CardTitle>
        <Button v-role="'btn0001'" size="sm" @click="handleAddMenu(1)">添加顶级菜单</Button>
      </CardHeader>
      <CardContent class="relative">
        <div class="my-2"><Input v-model="pattern" placeholder="搜索菜单" /></div>
        <div v-if="menuLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <Spinner class="size-6" />
        </div>
        <div v-if="menuTree.length" class="space-y-1">
          <MenuTreeNode
            v-for="node in menuTree"
            :key="node.id"
            :node="node"
            :selected-id="selectedKeys[0]"
            :pattern="pattern"
            @select="handleSelectMenu"
            @copy="handleCopy"
          />
        </div>
        <Empty v-else-if="!menuLoading" class="py-8"
          ><EmptyHeader><EmptyTitle>暂无菜单</EmptyTitle></EmptyHeader></Empty
        >
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="truncate text-base">{{ currentMenu?.name || '菜单详情' }}</CardTitle>
        <div v-if="currentMenu" class="flex items-center gap-2">
          <Button v-role="'btn0002'" size="sm" variant="outline" @click="handleAddMenu(2)">添加子菜单</Button>
          <Button v-role="'btn0003'" size="sm" variant="destructive" @click="handleRemoveMenu">删除</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert v-if="!currentMenu"
          ><AlertTitle>温馨提示</AlertTitle><AlertDescription>点击菜单开始</AlertDescription></Alert
        >
        <form v-else class="my-2 grid gap-4" @submit.prevent="handleSubmit">
          <div class="grid gap-2">
            <Label for="edit-menu-name">菜单名称</Label>
            <Input
              id="edit-menu-name"
              v-model="formData.name"
              placeholder="菜单名称"
              :aria-invalid="!!errors.name"
              @blur="validateField('name')"
              @input="validateField('name')"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="edit-menu-code">菜单code</Label>
            <div class="flex items-center gap-2">
              <Input id="edit-menu-code" v-model="formData.code" disabled placeholder="菜单code" class="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="复制菜单 code"
                @click="handleCopy(formData.code)"
                ><Copy class="size-4"
              /></Button>
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="edit-menu-sort">排序</Label>
            <Input
              id="edit-menu-sort"
              v-model.number="formData.sort"
              type="number"
              min="1"
              step="1"
              placeholder="序号"
              :aria-invalid="!!errors.sort"
              @blur="validateField('sort')"
              @input="validateField('sort')"
            />
            <p v-if="errors.sort" class="text-sm text-destructive">{{ errors.sort }}</p>
          </div>
          <fieldset class="grid gap-2">
            <legend class="text-sm font-medium">状态</legend>
            <RadioGroup
              :model-value="String(formData.status ?? '')"
              class="flex gap-5"
              @update:model-value="handleStatusChange"
            >
              <label class="flex items-center gap-2 text-sm"><RadioGroupItem value="1" />启用</label>
              <label class="flex items-center gap-2 text-sm"><RadioGroupItem value="0" />禁用</label>
            </RadioGroup>
            <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
          </fieldset>
          <div class="flex justify-center">
            <Button v-role="'btn0004'" type="submit" size="sm" :disabled="menuEditLoading"
              ><Spinner v-if="menuEditLoading" class="mr-2 size-4" />保存</Button
            >
          </div>
        </form>
      </CardContent>
    </Card>

    <Card class="md:col-span-2 xl:col-span-1">
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-base">按钮管理</CardTitle>
        <Button v-if="currentMenu" v-role="'btn0006'" size="sm" variant="outline" @click="handleButtonAdd"
          >添加按钮</Button
        >
      </CardHeader>
      <CardContent>
        <Alert v-if="!currentMenu"
          ><AlertTitle>温馨提示</AlertTitle><AlertDescription>点击菜单开始</AlertDescription></Alert
        >
        <AppDataTable
          v-else
          :columns="buttonColumns"
          :data="buttonList"
          :loading="buttonLoading"
          :page="1"
          :page-size="Math.max(buttonList.length, 1)"
          :total="0"
        >
          <template #cell-code="{ row }">
            <div class="flex items-center gap-2">
              <span class="text-sm text-primary">{{ row.code }}</span
              ><button type="button" class="text-primary" aria-label="复制按钮 code" @click="handleCopy(row.code)">
                <Copy class="size-4" />
              </button>
            </div>
          </template>
          <template #cell-status="{ row }"
            ><Badge
              :class="
                row.status === 1
                  ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              "
              >{{ row.status === 1 ? '启用' : '禁用' }}</Badge
            ></template
          >
          <template #cell-action="{ row }">
            <div class="flex items-center gap-2">
              <Button v-role="'btn0007'" size="sm" variant="ghost" @click="handleButtonEdit(row)">编辑</Button>
              <Button
                v-role="'btn0008'"
                size="sm"
                variant="ghost"
                class="text-destructive hover:text-destructive"
                @click="handleButtonDelete(row)"
                >删除</Button
              >
            </div>
          </template>
        </AppDataTable>
      </CardContent>
    </Card>

    <MenuAddModal v-model:show="showMemuModal" :type="addType" :parent="currentMenu" @success="getMenuTree" />
    <ButtonAddModal
      v-model:show="showButtonModal"
      :parent="currentMenu"
      :current-button="currentButton"
      @success="getButtonList"
    />
  </div>
</template>

<script setup lang="ts">
import { menuTreeApi, menuEditApi, menuDeleteApi, buttonListApi } from '@/api/setting/menu'
import { useClipboard } from '@vueuse/core'
import { to } from 'await-to-js'
import { cloneDeep } from 'es-toolkit'
import { Copy } from '@lucide/vue'
import MenuAddModal from './components/MenuAddModal.vue'
import ButtonAddModal from './components/ButtonAddModal.vue'
import MenuTreeNode from './components/MenuTreeNode.vue'
import AppDataTable from '@/components/AppDataTable/index.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

const menuTree = ref<Api.Setting.MenuTree[]>([])
const menuLoading = ref(false)
const selectedKeys = ref<number[]>([])
const formData = ref<Api.Setting.Menu | Recordable>({})
const currentMenu = ref<Api.Setting.Menu>()
const errors = reactive({ name: '', sort: '', status: '' })

async function getMenuTree() {
  menuLoading.value = true
  const [err, data] = await to(menuTreeApi())
  menuLoading.value = false
  if (err) return
  menuTree.value = data
}
getMenuTree()

function handleSelectMenu(option: Api.Setting.MenuTree) {
  if (option.id === currentMenu.value?.id) {
    currentMenu.value = undefined
    selectedKeys.value = []
    return
  }
  currentMenu.value = option as Api.Setting.Menu
  selectedKeys.value = [option.id]
  formData.value = cloneDeep(option)
  errors.name = ''
  errors.sort = ''
  errors.status = ''
}

function resetTreeSelect() {
  currentMenu.value = undefined
  selectedKeys.value = []
}

const { copy } = useClipboard()
async function handleCopy(text: string) {
  const [err] = await to(copy(text))
  if (err) window.$message?.error('复制失败')
  else window.$message?.success('复制成功')
}

const pattern = ref('')
const showMemuModal = ref(false)
const addType = ref<1 | 2>(1)
function handleAddMenu(type: 1 | 2) {
  addType.value = type
  showMemuModal.value = true
}

function validateField(field: keyof typeof errors) {
  const value = formData.value[field]
  if (field === 'name' && !value) errors.name = '请输入菜单名称'
  else if (
    field === 'sort' &&
    (typeof value !== 'number' || Number.isNaN(value) || value < 1 || !Number.isInteger(value))
  )
    errors.sort = '请输入排序'
  else if (field === 'status' && typeof value !== 'number') errors.status = '请选择状态'
  else errors[field] = ''
  return !errors[field]
}

function handleStatusChange(value: unknown) {
  if (typeof value !== 'string') return
  formData.value.status = Number(value)
  validateField('status')
}

const menuEditLoading = ref(false)
async function handleSubmit() {
  if (![validateField('name'), validateField('sort'), validateField('status')].every(Boolean)) return
  menuEditLoading.value = true
  const [err] = await to(menuEditApi(formData.value as Api.Setting.Menu))
  menuEditLoading.value = false
  if (err) return
  window.$message?.success('保存成功')
  getMenuTree()
}

function handleRemoveMenu() {
  const dialogInstance = window.$dialog.warning({
    title: '温馨提示',
    content: `确定要删除“${currentMenu.value?.name}”吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      dialogInstance.loading = true
      const [err] = await to(menuDeleteApi(currentMenu.value!.id))
      dialogInstance.loading = false
      if (err) return false
      window.$message.success('删除成功')
      getMenuTree()
      resetTreeSelect()
      return true
    },
  })
}

const showButtonModal = ref(false)
const currentButton = ref<Api.Setting.Menu>()
const buttonList = ref<Api.Setting.Menu[]>([])
const buttonColumns = [
  { title: '按钮名称', key: 'name' },
  { title: '按钮code', key: 'code' },
  { title: '排序', key: 'sort' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' },
]
const buttonLoading = ref(false)
async function getButtonList() {
  buttonLoading.value = true
  const [err, data] = await to(buttonListApi(currentMenu.value!.id))
  buttonLoading.value = false
  if (err) {
    buttonList.value = []
    return
  }
  buttonList.value = data
}
function handleButtonAdd() {
  currentButton.value = undefined
  showButtonModal.value = true
}

watch(currentMenu, (val) => {
  if (!val) return
  getButtonList()
})

function handleButtonEdit(data: Api.Setting.Menu) {
  currentButton.value = data
  showButtonModal.value = true
}

function handleButtonDelete(data: Api.Setting.Menu) {
  const dialogInstance = window.$dialog.warning({
    title: '温馨提示',
    content: `确定要删除“${data.name}”吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      dialogInstance.loading = true
      const [err] = await to(menuDeleteApi(data.id))
      dialogInstance.loading = false
      if (err) return false
      window.$message.success('删除成功')
      getButtonList()
      return true
    },
  })
}
</script>
