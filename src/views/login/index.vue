<template>
  <div class="relative overflow-hidden bg-primary-100 h-viewport dark:bg-primary-900">
    <Card
      class="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 border-0 shadow-lg"
    >
      <CardContent class="p-8">
        <div class="flex items-center justify-center text-2xl text-primary">
          <ThemeControl />
        </div>

        <div class="mt-4 flex items-center justify-center gap-4 text-primary">
          <SvgIcon local-icon="logo" class="text-6xl text-primary" />
          <div class="text-3xl">{{ title }}</div>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-1">
            <div class="relative">
              <Input
                v-model="formData.username"
                placeholder="请输入用户名"
                autocomplete="username"
                class="h-10 rounded-md pr-10"
                :aria-invalid="Boolean(fieldErrors.username)"
                @update:model-value="validateField('username')"
                @blur="validateField('username')"
              />
              <Button
                v-if="formData.username"
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="清空用户名"
                class="absolute right-1 top-1/2 -translate-y-1/2"
                @click="formData.username = ''"
              >
                <SvgIcon icon="mdi:close" />
              </Button>
            </div>
            <p v-if="fieldErrors.username" class="text-sm text-destructive">{{ fieldErrors.username }}</p>
          </div>

          <div class="space-y-1">
            <div class="relative">
              <Input
                v-model="formData.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="请输入密码"
                autocomplete="current-password"
                class="h-10 rounded-md pr-16"
                :aria-invalid="Boolean(fieldErrors.password)"
                @update:model-value="validateField('password')"
                @blur="validateField('password')"
              />
              <Button
                v-if="formData.password"
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="清空密码"
                class="absolute right-8 top-1/2 -translate-y-1/2"
                @click="formData.password = ''"
              >
                <SvgIcon icon="mdi:close" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
                class="absolute right-1 top-1/2 -translate-y-1/2"
                @mousedown.prevent="passwordVisible = true"
                @mouseup="passwordVisible = false"
                @mouseleave="passwordVisible = false"
                @touchstart.prevent="passwordVisible = true"
                @touchend="passwordVisible = false"
                @touchcancel="passwordVisible = false"
                @keydown.space.prevent="passwordVisible = true"
                @keyup.space="passwordVisible = false"
                @keydown.enter.prevent="passwordVisible = true"
                @keyup.enter="passwordVisible = false"
              >
                <SvgIcon :icon="passwordVisible ? 'mdi:eye-off' : 'mdi:eye'" />
              </Button>
            </div>
            <p v-if="fieldErrors.password" class="text-sm text-destructive">{{ fieldErrors.password }}</p>
          </div>

          <div class="space-y-1">
            <div class="flex items-start gap-4">
              <div class="relative min-w-0 flex-1">
                <Input
                  v-model="formData.captchaCode"
                  placeholder="请输入验证码"
                  autocomplete="one-time-code"
                  class="h-10 rounded-md pr-10"
                  :aria-invalid="Boolean(fieldErrors.captchaCode)"
                  @update:model-value="validateField('captchaCode')"
                  @blur="validateField('captchaCode')"
                />
                <Button
                  v-if="formData.captchaCode"
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="清空验证码"
                  class="absolute right-1 top-1/2 -translate-y-1/2"
                  @click="formData.captchaCode = ''"
                >
                  <SvgIcon icon="mdi:close" />
                </Button>
              </div>
              <button
                type="button"
                class="relative h-10 w-[120px] shrink-0 overflow-hidden rounded-md border bg-background"
                aria-label="刷新验证码"
                :disabled="captchaLoading"
                @click="getChapter"
              >
                <img class="size-full cursor-pointer object-cover" :src="captchaImage" alt="验证码，点击刷新" />
                <Spinner
                  v-if="captchaLoading"
                  class="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2"
                />
              </button>
            </div>
            <p v-if="fieldErrors.captchaCode" class="text-sm text-destructive">{{ fieldErrors.captchaCode }}</p>
          </div>

          <Button type="submit" class="h-10 w-full rounded-full" :disabled="loading">
            <Spinner v-if="loading" class="size-4" />
            登录
          </Button>
        </form>
      </CardContent>
    </Card>
    <TopWave />
    <BottomWave />
    <FooterInfo />
  </div>
</template>

<script setup lang="ts">
import { to } from 'await-to-js'
import { reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/stores'
import { useLoading } from '@/hooks/loading'
import { generateCaptchaApi } from '@/api/common/capcha'
import BottomWave from './components/BottomWave.vue'
import TopWave from './components/TopWave.vue'
import ThemeControl from '@/layouts/components/common/ThemeControl.vue'
import FooterInfo from './components/FooterInfo.vue'
const title = import.meta.env.VITE_APP_TITLE

const formData = reactive({
  username: 'preview001',
  password: 'rengaradmin2025',
  captchaId: 0,
  captchaCode: '',
})
type LoginField = 'username' | 'password' | 'captchaCode'
const fieldErrors = reactive<Record<LoginField, string>>({
  username: '',
  password: '',
  captchaCode: '',
})

const fieldMessages: Record<LoginField, string> = {
  username: '请输入用户名',
  password: '请输入密码',
  captchaCode: '请输入验证码',
}

const passwordVisible = ref(false)

function validateField(field: LoginField) {
  fieldErrors[field] = formData[field] ? '' : fieldMessages[field]
}

function validateForm() {
  const fields: LoginField[] = ['username', 'password', 'captchaCode']
  fields.forEach(validateField)
  return fields.every((field) => formData[field])
}

const captchaLoading = ref(false)
const captchaImage = ref('')

async function getChapter() {
  captchaLoading.value = true
  formData.captchaCode = ''
  const [err, res] = await to(generateCaptchaApi())
  captchaLoading.value = false
  if (err) {
    formData.captchaCode = ''
    return
  }
  captchaImage.value = res.image
  formData.captchaId = res.captchaId
}

getChapter()

const authStore = useAuthStore()

const { loading, startLoading, endLoading } = useLoading()

const route = useRoute()
const router = useRouter()
const redirect = route.query.redirect ? decodeURIComponent(route.query.redirect as string) : undefined
async function handleSubmit() {
  startLoading()
  if (!validateForm()) {
    endLoading()
    return
  }
  const [loginErr] = await to(authStore.authLoginAction(formData))
  if (loginErr) {
    getChapter()
    endLoading()
    return
  }
  window.$message.success('登录成功')
  router.replace(redirect || '/')
}
</script>

<style scoped></style>
