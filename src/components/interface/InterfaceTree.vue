<template>
  <div class="tree-container">
    <el-scrollbar max-height="80vh">
      <el-tree
        :data="treeData"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        ref="treeRef"
        :expand-on-click-node="false"
        :highlight-current="true"
        :default-expand-all="true"
      >
        <template #default="{ node, data }">
          <TreeNode :node="node" :data="data" />
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>
  
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useInterfaceStore } from '@/stores/interface'
import TreeNode from '@/components/interface/TreeNode.vue'

const store = useInterfaceStore()
const { treeData, searchText } = storeToRefs(store)
const treeRef = ref<any>(null)

// 节点过滤方法
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return (data.label ?? '').toString().toLowerCase().includes(String(value).toLowerCase())
}

// 监听搜索文本，触发 el-tree 的过滤
watch(searchText, (val) => {
  // el-tree 的 filter 需要在 nextTick 确保 tree 已渲染
  nextTick(() => { treeRef.value?.filter?.(val ?? '') })
})

// 监听 treeData 变更，刷新 tree 的过滤/渲染（确保切换项目时界面同步）
watch(treeData, () => {
  nextTick(() => {
    // 传入当前 searchText 值，触发重绘/过滤
    treeRef.value?.filter?.(searchText.value ?? '')
    // 如果需要展开全部可以调用 setCurrentKey 或 expandAll（根据需求）
    // treeRef.value?.expandAll?.()
  }, { flush: 'post' })
})

// 节点点击处理
const handleNodeClick = (data: any) => {
  if (data.type === 'case') {
    store.addTab({
      id: data.originData.id,
      label: data.originData.name,
      detail: {
        method: data.originData.method,
        path: data.originData.path,
        headers: data.originData.headers,
        module: data.originData.module,
        name: data.originData.name,
        id: data.originData.id,
      }
    })
  }
}
</script>

<style scoped>
.tree-container {
  overflow: hidden;
  border: 3px solid #8f8f8c;
  border-radius: 14px;
  box-shadow: #ebeef5;
}
</style>
