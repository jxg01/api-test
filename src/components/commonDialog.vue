<template>
    <el-dialog
      v-model="visit"
      title="删除"
      width="30%"
      :append-to-body="true"
    >
      <div class="dialog-content">
        <span>确定删除？</span>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="canceled">取消</el-button>
          <el-button type="danger" @click="submited">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </template>

<script lang="ts">
import { ref, defineComponent, computed } from 'vue'

export default defineComponent({
  props: {
    deleteDialogVisible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
    }
  },
  setup(props, {emit}){
    const visit = computed({
      get(){
        return props.deleteDialogVisible
      },
      set(value){
        emit('update:deleteDialogVisible', value)
      }
    });

    const canceled = () => {
      emit('update:deleteDialogVisible', false)
    };

    const submited = () => {
      console.log('submit delete  => ', props.formData)
      emit('update:deleteDialogVisible', false)
    };



    return {
      visit,
      canceled,
      submited
    }


  }

  



})




</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}

.dialog-content {
  font-size: large;
  text-align: center;
}

</style>



