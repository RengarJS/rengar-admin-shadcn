export {}
import type { DialogService, LoadingBarService } from '@/services/ui-feedback'
import type { toast } from 'vue-sonner'

declare global {
  interface Window {
    $loadingBar?: LoadingBarService
    $dialog: DialogService
    $message: typeof toast
  }
}
