<template>
  <Dialog :open="show" @update:open="show = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader
        ><DialogTitle>{{ parent ? '添加按钮' : '编辑按钮' }}</DialogTitle></DialogHeader
      >
      <form class="my-4 grid gap-4" @submit.prevent="handleSubmit">
        <div v-if="parent" class="grid gap-2">
          <Label>上级菜单</Label>
          <Input :model-value="parent?.name" disabled />
        </div>
        <div class="grid gap-2">
          <Label for="button-name">按钮名称</Label>
          <Input
            id="button-name"
            v-model="formData.name"
            placeholder="按钮名称"
            :aria-invalid="!!errors.name"
            @blur="validateField('name')"
            @input="validateField('name')"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="button-sort">排序</Label>
          <Input
            id="button-sort"
            v-model.number="formData.sort"
            type="number"
            min="1"
            step="1"
            placeholder="排序"
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
        <div class="grid gap-2">
          <Label>权限</Label>
          <Popover v-model:open="permissionOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between font-normal">
                <span class="truncate">{{ selectedPermissionLabel || '请选择权限' }}</span>
                <ChevronDown class="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-[var(--reka-popover-trigger-width)] p-2">
              <Input v-model="permissionSearch" placeholder="搜索权限路由" />
              <div class="mt-2 max-h-48 overflow-y-auto">
                <button
                  v-for="option in filteredPermissionOptions"
                  :key="option.id"
                  type="button"
                  class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  @click="selectPermission(option.id)"
                >
                  {{ option.path }}
                </button>
                <p v-if="filteredPermissionOptions.length === 0" class="py-3 text-center text-sm text-muted-foreground">
                  暂无权限
                </p>
              </div>
              <Button
                v-if="formData.permissionId != null"
                type="button"
                variant="ghost"
                size="sm"
                class="mt-2 w-full"
                @click="selectPermission(undefined)"
                >清除选择</Button
              >
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="show = false">取消</Button>
          <Button type="submit" :disabled="loading"><Spinner v-if="loading" class="mr-2 size-4" />确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { menuAddApi, menuEditApi, menuDetailApi } from '@/api/setting/menu'
import { permissionEnabledListApi } from '@/api/setting/permission'
import { to } from 'await-to-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { ChevronDown } from '@lucide/vue'

const show = defineModel<boolean>('show', { required: true })
const { parent, currentButton } = defineProps<{ parent?: Api.Setting.Menu; currentButton?: Api.Setting.Menu }>()
const emit = defineEmits<{ success: [] }>()
const permissionOptions = ref<Recordable[]>([])
const permissionSearch = ref('')
const permissionOpen = ref(false)
const formData = ref<Recordable>({ type: 2 })
const errors = reactive({ name: '', sort: '', status: '' })
const loading = ref(false)

const selectedPermissionLabel = computed(
  () => permissionOptions.value.find((option) => option.id === formData.value.permissionId)?.path ?? '',
)
const filteredPermissionOptions = computed(() => {
  const query = permissionSearch.value.trim().toLocaleLowerCase()
  if (!query) return permissionOptions.value
  return permissionOptions.value.filter((option) => String(option.path).toLocaleLowerCase().includes(query))
})

async function getPermissionOptions() {
  const [err, res] = await to(permissionEnabledListApi())
  if (err) return
  permissionOptions.value = res ?? []
}
getPermissionOptions()

async function getDetail() {
  const [err, res] = await to(menuDetailApi(currentButton!.id))
  if (err) return
  formData.value = res
}

watch(show, (open) => {
  if (open && currentButton) getDetail()
  if (!open) handleClose()
})

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

function selectPermission(id?: number) {
  formData.value.permissionId = id
  permissionOpen.value = false
  permissionSearch.value = ''
}

function handleClose() {
  for (const key in formData.value) formData.value[key] = null
  formData.value.type = 2
  errors.name = ''
  errors.sort = ''
  errors.status = ''
  permissionSearch.value = ''
}

async function handleSubmit() {
  if (![validateField('name'), validateField('sort'), validateField('status')].every(Boolean)) return
  loading.value = true
  const [err] = await to(
    currentButton
      ? menuEditApi(formData.value as Api.Setting.Menu)
      : menuAddApi({ ...(formData.value as Api.Setting.Menu), parentId: parent!.id }),
  )
  loading.value = false
  if (err) return
  window.$message?.success(`${parent ? '新增' : '编辑'}成功`)
  emit('success')
  show.value = false
}
</script>
