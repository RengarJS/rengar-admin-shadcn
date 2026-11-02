<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ record ? '编辑用户' : '新增用户' }}</DialogTitle>
      </DialogHeader>
      <form class="my-4 grid gap-4" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="user-username">账户名</Label>
          <Input
            id="user-username"
            v-model="formData.username"
            placeholder="账户名"
            :aria-invalid="!!errors.username"
            @blur="validateField('username')"
            @input="validateField('username')"
          />
          <p v-if="errors.username" class="text-sm text-destructive">{{ errors.username }}</p>
        </div>

        <template v-if="!record">
          <div class="grid gap-2">
            <Label for="user-password">密码</Label>
            <Input
              id="user-password"
              v-model="formData.password"
              type="password"
              placeholder="密码"
              :aria-invalid="!!errors.password"
              @blur="validateField('password')"
              @input="validateField('password')"
            />
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="user-confirm-password">确认密码</Label>
            <Input
              id="user-confirm-password"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="确认密码"
              :aria-invalid="!!errors.confirmPassword"
              @blur="validateField('confirmPassword')"
              @input="validateField('confirmPassword')"
            />
            <p v-if="errors.confirmPassword" class="text-sm text-destructive">{{ errors.confirmPassword }}</p>
          </div>
        </template>

        <div class="grid gap-2">
          <Label>角色绑定</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-between font-normal" :aria-invalid="!!errors.roleIds">
                <span class="truncate">{{ selectedRoleNames || '请绑定角色' }}</span>
                <ChevronDown class="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-[var(--reka-popover-trigger-width)] p-2">
              <div class="max-h-56 space-y-1 overflow-y-auto">
                <label
                  v-for="role in roleList"
                  :key="role.id"
                  class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    :model-value="formData.roleIds.includes(role.id)"
                    @update:model-value="(checked) => toggleRole(role.id, checked === true)"
                  />
                  <span>{{ role.name }}</span>
                </label>
                <p v-if="roleList.length === 0" class="px-2 py-3 text-center text-sm text-muted-foreground">
                  暂无可绑定角色
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <p v-if="errors.roleIds" class="text-sm text-destructive">{{ errors.roleIds }}</p>
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

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="handleOpenChange(false)">取消</Button>
          <Button type="submit" :disabled="loading"><Spinner v-if="loading" class="mr-2 size-4" />确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { userAddApi, userEditApi, userDetailApi } from '@/api/setting/user'
import { roleListEnabledApi } from '@/api/setting/role'
import { to } from 'await-to-js'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { ChevronDown } from '@lucide/vue'

const show = defineModel<boolean>('show', { required: true })
const { record } = defineProps<{ record?: Api.Setting.User }>()
const emit = defineEmits<{ success: [] }>()

const formData = ref<Recordable>({ username: '', status: 1, roleIds: [] })
const errors = reactive({ username: '', password: '', confirmPassword: '', roleIds: '', status: '' })
const roleList = ref<Api.Setting.Role[]>([])
const loading = ref(false)

const selectedRoleIds = computed(() =>
  Array.isArray(formData.value.roleIds) ? (formData.value.roleIds as number[]) : [],
)
const selectedRoleNames = computed(() =>
  roleList.value
    .filter((role) => selectedRoleIds.value.includes(role.id))
    .map((role) => role.name)
    .join('、'),
)

async function getRoleList() {
  const [err, data] = await to(roleListEnabledApi())
  if (err) {
    roleList.value = []
    return
  }
  roleList.value = data
}

getRoleList()

function toggleRole(id: number, checked: boolean) {
  const roleIds = selectedRoleIds.value
  formData.value.roleIds = checked ? [...new Set([...roleIds, id])] : roleIds.filter((roleId) => roleId !== id)
  validateField('roleIds')
}

function handleStatusChange(value: unknown) {
  if (typeof value !== 'string') return
  formData.value.status = Number(value)
  validateField('status')
}

function validateField(field: keyof typeof errors) {
  const value = formData.value[field]
  if (field === 'username' && !value) errors.username = '请输入账户名'
  else if (field === 'password' && !value) errors.password = '请输入密码'
  else if (field === 'confirmPassword' && !value) errors.confirmPassword = '请输入确认密码'
  else if (field === 'roleIds' && (!Array.isArray(value) || value.length === 0)) errors.roleIds = '请绑定角色'
  else if (field === 'status' && typeof value !== 'number') errors.status = '请选择状态'
  else errors[field] = ''
  return !errors[field]
}

function validateForm() {
  const fields: (keyof typeof errors)[] = ['username', 'roleIds', 'status']
  if (!record) fields.push('password', 'confirmPassword')
  return fields.map(validateField).every(Boolean)
}

function handleOpenChange(open: boolean) {
  show.value = open
}

function handleOpen() {
  if (record) getDetail()
}

async function getDetail() {
  const [err, res] = await to(userDetailApi(record!.id))
  if (err) return
  formData.value = res
}

function handleClose() {
  for (const key in formData.value) formData.value[key] = null
  for (const key in errors) errors[key as keyof typeof errors] = ''
}

watch(show, (open) => {
  if (open) handleOpen()
  else handleClose()
})

async function handleSubmit() {
  if (!validateForm()) return
  loading.value = true
  const [err] = await to(
    record ? userEditApi(unref(formData) as Api.Setting.User) : userAddApi(unref(formData) as Api.Setting.User),
  )
  loading.value = false
  if (err) return
  window.$message?.success(`${record ? '编辑' : '新增'}成功`)
  emit('success')
  show.value = false
}
</script>
