<template>
  <Toaster :theme="appStore.theme" position="top-center" rich-colors />

  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
    :class="{ 'opacity-0': !loadingBarState.visible }"
  >
    <div
      class="h-full transition-[width] duration-200 ease-out"
      :class="loadingBarState.error ? 'bg-destructive' : 'bg-primary'"
      :style="{ width: `${loadingBarState.progress}%` }"
    />
  </div>

  <AlertDialog :open="activeConfirmDialog !== null" @update:open="handleDialogOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ activeConfirmDialog?.options.title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ activeConfirmDialog?.options.content }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel v-if="activeConfirmDialog?.options.negativeText" as-child>
          <Button variant="outline" :disabled="activeConfirmDialog.loading">
            {{ activeConfirmDialog.options.negativeText }}
          </Button>
        </AlertDialogCancel>
        <Button :disabled="activeConfirmDialog?.loading" @click="handlePositiveClick">
          <Spinner v-if="activeConfirmDialog?.loading" class="size-4" />
          {{ activeConfirmDialog?.options.positiveText || '确定' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/sonner'
import { activeConfirmDialog, dialogService, loadingBarService, loadingBarState, toast } from '@/services/ui-feedback'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

window.$dialog = dialogService
window.$message = toast
window.$loadingBar = loadingBarService

async function handlePositiveClick() {
  const dialog = activeConfirmDialog.value
  if (!dialog) return

  const result = await dialog.options.onPositiveClick?.()
  if (result !== false) activeConfirmDialog.value = null
}

function handleDialogOpenChange(open: boolean) {
  if (!open) activeConfirmDialog.value = null
}
</script>

<style scoped></style>
