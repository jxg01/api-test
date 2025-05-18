<template>
  <el-tabs 
    v-model="store.activeTab" 
    type="card" 
    class="case-tabs"
  >
    <template #default>
      <div class="tabs-container-wrapper">
        <div class="tabs-container">
          <div 
            v-for="pane in store.tabs"
            :key="pane.name"
            class="custom-tab-item"
            :class="{ 'is-active': store.activeTab === pane.name }"
          >
            <div 
              class="tab-content"
              @click="store.setActiveTab(pane.name)"
            >
              <span class="tab-title">{{ pane.title }}</span>
              <el-icon
                v-if="pane.name !== 'list'"
                class="close-icon"
                :class="{ 'always-visible': store.activeTab === pane.name }"
                @click.stop="store.removeEditTab(pane.name)"
              >
                <Close />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-tooltip content="新增用例" placement="bottom">
            <el-icon class="action-icon" @click="store.addNewCase">
              <Plus />
            </el-icon>
          </el-tooltip>
          
          <el-tooltip 
            content="关闭全部" 
            placement="bottom"
            :disabled="store.editTabs.length === 0"
          >
            <el-icon
              class="action-icon"
              :class="{ 'disabled': store.editTabs.length === 0 }"
              @click="store.closeAllTabs"
            >
              <Delete />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
    </template>
  </el-tabs>
</template>

<script setup lang="ts">
import { Close, Plus, Delete } from '@element-plus/icons-vue'
import { useCaseStore } from '@/stores/testcase'

const store = useCaseStore()
</script>

<style scoped>
/* 隐藏默认header */
:deep(.el-tabs__header) {
  display: none !important;
}

/* 选中状态文字颜色 */
.custom-tab-item.is-active .tab-title {
  color: #409eff; /* Element Plus 主题蓝色 */
}

/* 非列表标签样式 */
.custom-tab-item.non-list-tab {
  .close-icon {
    /* 默认状态 */
    visibility: hidden;
    opacity: 0;
    transition: all 0.2s;
    
    /* 激活状态 */
    &.always-visible {
      visibility: visible;
      opacity: 1;
    }
  }
  /* 悬停状态 */
  &:hover .close-icon {
    visibility: visible;
    opacity: 1;
  }
}

.tabs-container-wrapper {
  display: flex;
  align-items: center;
  height: 40px;
  background: #fff;
}


.custom-tab-item {
  min-width: 120px;
  flex-shrink: 0;
  .tab-content {
    padding: 0 20px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      .close-icon {
        visibility: visible;
      }
    }
  }
}

.tab-title {
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
  &:hover {
    color: #409eff;
  }
}

.close-icon {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
  visibility: hidden;
  
  &:hover {
    color: #409eff;
    background-color: #f0f7ff;
    border-radius: 50%;
  }
}

.action-icon {
  padding: 16px;
  border-radius: 4px;
  color: #409eff;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f7ff;
  }
  
  &.disabled {
    color: #c0c4cc;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
    }
  }
}

.tabs-container {
  display: flex;
  flex: 1;
  overflow-x: auto; /* 横向滚动，纵向隐藏 */
}


</style>