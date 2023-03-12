<template>
    <el-dialog
      v-model="dialogVisible"
      title="删除"
      width="30%"
    >
      <span>确定删除？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="canceled">取消</el-button>
          <el-button type="primary" @click="submited">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'

const emits = defineEmits(['showDeleteDialog'])

const props = defineProps({
    showDeleteDialog: {
        type: Boolean,
        default: false,
    }
})

const dialogVisible = ref(props.showDeleteDialog)

const canceled = () => {
    dialogVisible.value = false
    // emits('showDeleteDialog', false)
}

const submited = () => {
    dialogVisible.value = false
}




</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>



