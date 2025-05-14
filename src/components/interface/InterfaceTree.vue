<template>
    <el-tree
      :data="store.treeData"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      ref="treeRef"
    >
      <template #default="{ node, data }">
        <TreeNode :node="node" :data="data" @delete="handleDelete" />
      </template>
    </el-tree>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useInterfaceStore } from '@/stores/interface'
  import TreeNode from '@/components/interface/TreeNode.vue'
  
  const store = useInterfaceStore()
  const { searchText } = storeToRefs(store)
  const treeRef = ref()
  
  // 节点过滤方法
  const filterNode = (value: string, data: TreeNode) => {
    return data.label.includes(value)
  }
  watch(searchText, (val) => {
    treeRef.value!.filter(val)
  })
  
  // 节点点击处理
  const handleNodeClick = (data: TreeNode) => {
    console.log('Node clicked:', data)
    if (data.type === 'case') {
      store.addTab({
        id: data.id,
        label: data.label,
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
  
  // 删除处理
  const handleDelete = (data: TreeNode) => {
    console.log('Delete node:', data)
    // 实现删除逻辑
    // 例如：store.deleteNode(data.id)

  }
  </script>