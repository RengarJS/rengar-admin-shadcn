<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader><DialogTitle>修改密码</DialogTitle></DialogHeader>
      <form class="my-4 grid gap-4" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="reset-new-password">新密码</Label>
          <Input
            id="reset-new-password"
            v-model="formValue.newPassword"
            type="password"
            placeholder="请输入新密码"
            :aria-invalid="!!errors.newPassword"
            @blur="validateField('newPassword')"
            @input="validateField('newPassword')"
          />
          <p v-if="errors.newPassword" class="text-sm text-destructive">{{ errors.newPassword }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="reset-confirm-password">确认密码</Label>
          <Input
            id="reset-confirm-password"
            v-model="formValue.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            :aria-invalid="!!errors.confirmPassword"
            @blur="validateField('confirmPassword')"
            @input="validateField('confirmPassword')"
          />
          <p v-if="errors.confirmPassword" class="text-sm text-destructive">{{ errors.confirmPassword }}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="handleOpenChange(false)">取消</Button>
          <Button type="submit" :disabled="loading"><Spinner v-if="loading" class="mr-2 size-4" />确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { userPasswordApi } from '@/api/setting/user'
import { to } from 'await-to-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

const show = defineModel<boolean>('show', { required: true })
const { record } = defineProps<{ record?: Api.Setting.User }>()

const formValue = ref<Api.Setting.PasswordDTO>({ id: 0, newPassword: '', confirmPassword: '' })
const errors = reactive({ newPassword: '', confirmPassword: '' })
const loading = ref(false)

function validateField(field: keyof typeof errors) {
  if (field === 'newPassword' && !formValue.value.newPassword) errors.newPassword = '请输入新密码'
  else if (field === 'confirmPassword' && !formValue.value.confirmPassword) errors.confirmPassword = '请再次输入新密码'
  else if (field === 'confirmPassword' && formValue.value.confirmPassword !== formValue.value.newPassword)
    errors.confirmPassword = '两次输入的密码不一致'
  else errors[field] = ''
  return !errors[field]
}

function handleOpenChange(open: boolean) {
  show.value = open
}

function handleClose() {
  formValue.value = { id: 0, newPassword: '', confirmPassword: '' }
  errors.newPassword = ''
  errors.confirmPassword = ''
}

function handleOpen() {
  if (record) formValue.value.id = record.id
}

watch(show, (open) => {
  if (open) handleOpen()
  else handleClose()
})

async function handleSubmit() {
  if (![validateField('newPassword'), validateField('confirmPassword')].every(Boolean)) return
  loading.value = true
  const [err] = await to(userPasswordApi(unref(formValue)))
  loading.value = false
  if (err) return
  window.$message?.success('修改密码成功')
  show.value = false
}
</script>
