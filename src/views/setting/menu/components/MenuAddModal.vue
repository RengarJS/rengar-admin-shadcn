<template>
  <Dialog :open="show" @update:open="show = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader
        ><DialogTitle>{{ type === 1 ? '添加顶级菜单' : '添加子菜单' }}</DialogTitle></DialogHeader
      >
      <form class="my-4 grid gap-4" @submit.prevent="handleSubmit">
        <div v-if="type === 2" class="grid gap-2">
          <Label>上级菜单</Label>
          <Input :model-value="parent?.name" disabled />
        </div>
        <div class="grid gap-2">
          <Label for="new-menu-name">菜单名称</Label>
          <Input
            id="new-menu-name"
            v-model="formData.name"
            placeholder="菜单名称"
            :aria-invalid="!!errors.name"
            @blur="validateField('name')"
            @input="validateField('name')"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="new-menu-sort">排序</Label>
          <Input
            id="new-menu-sort"
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
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="show = false">取消</Button>
          <Button type="submit" :disabled="loading"><Spinner v-if="loading" class="mr-2 size-4" />确定</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { menuAddApi } from '@/api/setting/menu'
import { to } from 'await-to-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

const show = defineModel<boolean>('show', { required: true })
const { parent, type } = defineProps<{ type: 1 | 2; parent?: Api.Setting.Menu }>()
const emit = defineEmits<{ success: [] }>()
const formData = ref<Recordable>({ type: 1 })
const errors = reactive({ name: '', sort: '', status: '' })
const loading = ref(false)

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

function handleClose() {
  for (const key in formData.value) formData.value[key] = null
  formData.value.type = 1
  errors.name = ''
  errors.sort = ''
  errors.status = ''
}

watch(show, (open) => {
  if (!open) handleClose()
})

async function handleSubmit() {
  if (![validateField('name'), validateField('sort'), validateField('status')].every(Boolean)) return
  loading.value = true
  const [err] = await to(
    menuAddApi({
      ...unref(formData as unknown as Api.Setting.Menu),
      parentId: type === 1 ? 0 : parent!.id,
    }),
  )
  loading.value = false
  if (err) return
  window.$message?.success('新增成功')
  emit('success')
  show.value = false
}
</script>
