import { reactive, shallowRef } from 'vue'
import { toast } from 'vue-sonner'

export interface ConfirmDialogOptions {
  title: string
  content?: string
  positiveText?: string
  negativeText?: string
  onPositiveClick?: () => boolean | void | Promise<boolean | void>
}

export interface ConfirmDialogInstance {
  loading: boolean
  destroy: () => void
}

export type DialogTone = 'warning' | 'success' | 'error' | 'info'

export interface ActiveConfirmDialog {
  tone: DialogTone
  options: ConfirmDialogOptions
  loading: boolean
}

export interface DialogService {
  warning: (options: ConfirmDialogOptions) => ConfirmDialogInstance
  success: (options: ConfirmDialogOptions) => ConfirmDialogInstance
  error: (options: ConfirmDialogOptions) => ConfirmDialogInstance
  info: (options: ConfirmDialogOptions) => ConfirmDialogInstance
}

export interface LoadingBarService {
  start: () => void
  finish: () => void
  error: () => void
}

export const activeConfirmDialog = shallowRef<ActiveConfirmDialog | null>(null)

function openConfirmDialog(tone: DialogTone, options: ConfirmDialogOptions): ConfirmDialogInstance {
  const state = reactive({ tone, options, loading: false })
  activeConfirmDialog.value = state

  return {
    get loading() {
      return state.loading
    },
    set loading(value: boolean) {
      state.loading = value
    },
    destroy() {
      if (activeConfirmDialog.value === state) activeConfirmDialog.value = null
    },
  }
}

export const dialogService: DialogService = {
  warning: (options) => openConfirmDialog('warning', options),
  success: (options) => openConfirmDialog('success', options),
  error: (options) => openConfirmDialog('error', options),
  info: (options) => openConfirmDialog('info', options),
}

export const loadingBarState = reactive({
  visible: false,
  error: false,
  progress: 0,
})

let progressTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

function clearProgressTimers() {
  if (progressTimer) clearTimeout(progressTimer)
  if (closeTimer) clearTimeout(closeTimer)
}

function startLoadingBar() {
  clearProgressTimers()
  loadingBarState.visible = true
  loadingBarState.error = false
  loadingBarState.progress = 15
  progressTimer = setTimeout(() => {
    loadingBarState.progress = 80
  }, 200)
}

function closeLoadingBar(error: boolean) {
  clearProgressTimers()
  loadingBarState.error = error
  loadingBarState.progress = 100
  closeTimer = setTimeout(() => {
    loadingBarState.visible = false
    closeTimer = setTimeout(() => {
      loadingBarState.progress = 0
      loadingBarState.error = false
    }, 200)
  }, 180)
}

export const loadingBarService: LoadingBarService = {
  start: startLoadingBar,
  finish: () => closeLoadingBar(false),
  error: () => closeLoadingBar(true),
}

export { toast }
