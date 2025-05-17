<template>
  <div class="tree-container">
    <el-scrollbar max-height="80vh">
      <el-tree
        :data="store.treeData"
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
  height: 100%;
  overflow: hidden;
  border: 3px solid #8f8f8c;
  border-radius: 14px;
  box-shadow: #ebeef5;
}


</style>
