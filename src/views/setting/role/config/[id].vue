<template>
  <div class="max-w-[600px]">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle class="text-base">菜单管理</CardTitle>
        <Button v-role="'btn0014'" :disabled="saveLoading" @click="handleSave"
          ><Spinner v-if="saveLoading" class="mr-2 size-4" />保存</Button
        >
      </CardHeader>
      <CardContent class="relative">
        <div class="my-2"><Input v-model="pattern" placeholder="搜索菜单" /></div>
        <div v-if="menuLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <Spinner class="size-6" />
        </div>
        <div v-if="menuTree.length" class="space-y-1">
          <PermissionTreeNode
            v-for="node in menuTree"
            :key="node.id"
            :node="node"
            :checked-keys="displayCheckedKeys"
            :indeterminate-keys="indeterminateKeys"
            :pattern="pattern"
            @toggle="handleToggleNode"
          />
        </div>
        <Empty v-else-if="!menuLoading" class="py-8"
          ><EmptyHeader><EmptyTitle>暂无菜单</EmptyTitle></EmptyHeader></Empty
        >
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { menuButtonEnabledTreeApi } from '@/api/setting/menu'
import { roleConfigApi, roleConfigDetailApi } from '@/api/setting/role'
import { to } from 'await-to-js'
import PermissionTreeNode from './PermissionTreeNode.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

const route = useRoute<'setting-role-config'>()
const id = Number(route.params.id)
const checkedKeys = ref<number[]>([])
const menuTree = ref<Api.Setting.MenuTree[]>([])
const menuLoading = ref(false)
const saveLoading = ref(false)
const pattern = ref('')

function extractLeafIds(nodes: Api.Setting.MenuTree[], rawIdSet: Set<number>): number[] {
  const leafIds: number[] = []
  function traverse(node: Api.Setting.MenuTree) {
    const isLeaf = !node.children || node.children.length === 0
    if (isLeaf) {
      if (rawIdSet.has(node.id)) leafIds.push(node.id)
    } else {
      node.children!.forEach(traverse)
    }
  }
  nodes.forEach(traverse)
  return leafIds
}

function collectLeafIds(node: Api.Setting.MenuTree): number[] {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(collectLeafIds)
}

function collectCheckedIds(nodes: Api.Setting.MenuTree[], selectedLeafIds: Set<number>): number[] {
  return nodes.flatMap((node) => {
    const leafIds = collectLeafIds(node)
    const childIds = node.children?.length ? collectCheckedIds(node.children, selectedLeafIds) : []
    return [...childIds, ...(leafIds.every((leafId) => selectedLeafIds.has(leafId)) ? [node.id] : [])]
  })
}

function collectIndeterminateIds(nodes: Api.Setting.MenuTree[], selectedLeafIds: Set<number>): number[] {
  return nodes.flatMap((node) => {
    if (!node.children?.length) return []
    const leafIds = collectLeafIds(node)
    const checkedCount = leafIds.filter((leafId) => selectedLeafIds.has(leafId)).length
    return [
      ...collectIndeterminateIds(node.children, selectedLeafIds),
      ...(checkedCount > 0 && checkedCount < leafIds.length ? [node.id] : []),
    ]
  })
}

const selectedLeafIds = computed(() => new Set(extractLeafIds(menuTree.value, new Set(checkedKeys.value))))
const displayCheckedKeys = computed(() => collectCheckedIds(menuTree.value, selectedLeafIds.value))
const indeterminateKeys = computed(() => collectIndeterminateIds(menuTree.value, selectedLeafIds.value))

async function getMenuTree() {
  menuLoading.value = true
  const [err, tree] = await to(menuButtonEnabledTreeApi())
  const [detailErr, menuIds] = await to(roleConfigDetailApi(id))
  menuLoading.value = false
  if (err || detailErr) return
  menuTree.value = tree
  checkedKeys.value = extractLeafIds(tree, new Set(menuIds))
}
getMenuTree()

function handleToggleNode(payload: { node: Api.Setting.MenuTree; checked: boolean }) {
  const nextLeafIds = new Set(selectedLeafIds.value)
  for (const leafId of collectLeafIds(payload.node)) {
    if (payload.checked) nextLeafIds.add(leafId)
    else nextLeafIds.delete(leafId)
  }
  checkedKeys.value = collectCheckedIds(menuTree.value, nextLeafIds)
}

async function handleSave() {
  saveLoading.value = true
  const halfIds = indeterminateKeys.value
  const [err] = await to(
    roleConfigApi({
      id,
      menuIds: [...new Set([...unref(checkedKeys), ...halfIds])],
    }),
  )
  saveLoading.value = false
  if (err) return
  window.$message.success('保存成功')
}
</script>
