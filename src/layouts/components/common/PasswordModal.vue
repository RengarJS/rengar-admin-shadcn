<template>
  <Dialog :open="show" @update:open="show = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader><DialogTitle>修改密码</DialogTitle></DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="old-password">旧密码</Label>
          <Input
            id="old-password"
            v-model="formValue.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            :aria-invalid="!!errors.oldPassword"
            @blur="validateField('oldPassword')"
            @input="validateField('oldPassword')"
          />
          <p v-if="errors.oldPassword" class="text-sm text-destructive">{{ errors.oldPassword }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="new-password">新密码</Label>
          <Input
            id="new-password"
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
          <Label for="confirm-password">确认密码</Label>
          <Input
            id="confirm-password"
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
          <Button type="button" variant="outline" @click="show = false">取消</Button>
          <Button type="submit" :disabled="loading"><Spinner v-if="loading" class="mr-2 size-4" />确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { authPasswordApi } from '@/api/common/auth'
import { to } from 'await-to-js'
import { useRouterHook } from '@/hooks/router'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

const show = defineModel<boolean>('show', { required: true })
const formValue = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const { routerReplaceToLogin } = useRouterHook()
const authStore = useAuthStore()
const router = useRouter()

function validateField(field: keyof typeof errors) {
  const value = formValue[field]
  if (field === 'oldPassword' && !value) errors.oldPassword = '请输入旧密码'
  else if (field === 'newPassword' && !value) errors.newPassword = '请输入新密码'
  else if (field === 'confirmPassword' && !value) errors.confirmPassword = '请再次输入新密码'
  else if (field === 'confirmPassword' && value !== formValue.newPassword)
    errors.confirmPassword = '两次输入的密码不一致'
  else errors[field] = ''
  return !errors[field]
}

async function handleSubmit() {
  const valid = [validateField('oldPassword'), validateField('newPassword'), validateField('confirmPassword')].every(
    Boolean,
  )
  if (!valid) return
  loading.value = true
  const [err] = await to(authPasswordApi(toRaw(formValue)))
  loading.value = false
  if (err) return
  window.$message.success('修改密码成功，请重新登录')
  authStore.reset()
  routerReplaceToLogin(router.currentRoute.value.fullPath)
  show.value = false
}
</script>
