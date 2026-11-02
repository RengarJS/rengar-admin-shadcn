<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader
        ><DialogTitle>{{ record ? '编辑角色' : '新增角色' }}</DialogTitle></DialogHeader
      >
      <form class="my-4 grid gap-4" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="role-name">角色名称</Label>
          <Input
            id="role-name"
            v-model="formData.name"
            placeholder="角色名称"
            :aria-invalid="!!errors.name"
            @blur="validateName"
            @input="validateName"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
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
import { roleAddApi, roleEditApi } from '@/api/setting/role'
import { to } from 'await-to-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

const show = defineModel<boolean>('show', { required: true })
const { record } = defineProps<{ record?: Api.Setting.Role }>()
const emit = defineEmits<{ success: [] }>()

const formData = ref<Api.Setting.Role>({ id: 0, name: '', status: 1 })
const errors = reactive({ name: '', status: '' })
const loading = ref(false)

function validateName() {
  errors.name = formData.value.name ? '' : '请输入角色名称'
  return !errors.name
}

function validateStatus() {
  errors.status = typeof formData.value.status === 'number' ? '' : '请选择状态'
  return !errors.status
}

function handleStatusChange(value: unknown) {
  if (typeof value !== 'string') return
  if (value === '1') formData.value.status = 1
  else if (value === '0') formData.value.status = 0
  else return
  validateStatus()
}

function handleOpenChange(open: boolean) {
  show.value = open
}

function handleOpen() {
  if (record) formData.value = record
}

function handleClose() {
  formData.value = { id: 0, name: '', status: 1 }
  errors.name = ''
  errors.status = ''
}

watch(show, (open) => {
  if (open) handleOpen()
  else handleClose()
})

async function handleSubmit() {
  if (![validateName(), validateStatus()].every(Boolean)) return
  loading.value = true
  const [err] = await to(record ? roleEditApi(unref(formData)) : roleAddApi(unref(formData)))
  loading.value = false
  if (err) return
  window.$message?.success(`${record ? '编辑' : '新增'}成功`)
  emit('success')
  show.value = false
}
</script>
