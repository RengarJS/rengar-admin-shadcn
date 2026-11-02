<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button type="button" class="flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1 hover:text-primary">
        <ILineMdAccount class="text-xl" />
        <span v-if="!appStore.isMobile" class="max-w-[120px] truncate text-base">{{ authStore.user?.username }}</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @select="handleSelect('password')">修改密码</DropdownMenuItem>
      <DropdownMenuItem class="text-destructive focus:text-destructive" @select="handleSelect('loginout')"
        >退出登录</DropdownMenuItem
      >
    </DropdownMenuContent>
  </DropdownMenu>

  <PasswordModal v-model:show="showModal" />
</template>

<script setup lang="ts">
import { useAuthStore, useAppStore } from '@/stores'
import { to } from 'await-to-js'
import { useRouterHook } from '@/hooks/router'
import PasswordModal from './PasswordModal.vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const authStore = useAuthStore()
const appStore = useAppStore()

function handleSelect(key: string) {
  switch (key) {
    case 'password':
      handleChangePassword()
      break
    case 'loginout':
      handleLoginOut()
      break
  }
}

const showModal = ref(false)
function handleChangePassword() {
  showModal.value = true
}

const { routerReplaceToLogin } = useRouterHook()

const router = useRouter()
function handleLoginOut() {
  const dialogInstance = window.$dialog.warning({
    title: '温馨提示',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      dialogInstance.loading = true
      const [err] = await to(authStore.authLoginOutAction())
      dialogInstance.loading = false
      if (err) return false
      window.$message.success('退出登录成功')
      routerReplaceToLogin(router.currentRoute.value.fullPath)
      return true
    },
  })
}
</script>

<style scoped></style>
