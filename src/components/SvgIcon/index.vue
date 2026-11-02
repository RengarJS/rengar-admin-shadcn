<template>
  <template v-if="icon">
    <Icon v-if="typeof icon === 'string'" :icon="formatIcon(icon)" :="$attrs"></Icon>
    <component v-else :is="icon" :="$attrs"></component>
  </template>
  <span v-if="localIconUrl" :style="localIconStyle" :="$attrs"></span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  inheritAttrs: false,
})

const { icon, localIcon } = defineProps<{
  icon?: string | Component
  localIcon?: string
}>()

const localIconUrls = import.meta.glob<string>('/src/assets/svg-icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const localIconName = computed(() => localIcon?.replace(/^i-local-/, '').replace(/^local-/, ''))
const localIconUrl = computed(() => {
  const name = localIconName.value
  return name ? localIconUrls[`/src/assets/svg-icons/${name}.svg`] : undefined
})

const localIconStyle = computed(() => {
  const iconUrl = localIconUrl.value
  if (!iconUrl) return undefined

  return {
    display: 'inline-block',
    width: '1em',
    height: '1em',
    backgroundColor: 'currentColor',
    maskImage: `url("${iconUrl}")`,
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain',
    WebkitMaskImage: `url("${iconUrl}")`,
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain',
  }
})

const formatIcon = (iconString: string) => {
  if (!iconString) return ''
  if (iconString.startsWith('i-')) {
    return iconString.slice(2)
  }
  return iconString
}
</script>

<style scoped></style>
