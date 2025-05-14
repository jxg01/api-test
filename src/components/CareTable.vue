<template>
    <div class="txx">
        <el-table
            :data="items"
            style="width: 100%"
            :row-class-name="tableRowClassName"
            >
            <el-table-column prop="date" label="Date" width="180" />
            <el-table-column prop="name" label="Name" width="180" />
            <el-table-column prop="address" label="Address" />

            <el-table-column fixed="right" label="Operations" min-width="120">
                <template #default="scope">
                    <el-button
                    link
                    type="primary"
                    size="small"
                    @click.prevent="deleteRow(scope.$index)"
                    >
                    Remove
                    </el-button>

                    <el-icon @click="moveUp(scope.$index)" v-show="scope.$index"><CaretTop /></el-icon>

                    <!-- <el-button type="primary" @click="moveUp(scope.$index)">Up</el-button> -->

                        
                    <el-icon @click="moveDown(scope.$index)" v-show="scope.$index !== items.length - 1"><CaretBottom /></el-icon>

                    <!-- <el-button @click="moveDown(scope.$index)">Down </el-button> -->
                </template>
            </el-table-column>
        </el-table>
    </div>
  </template>

  <script setup>
  import { reactive, ref } from 'vue';

  const items = ref([
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
])

const tableRowClassName = ({
  row,
  rowIndex,
}) => {
  if (rowIndex === 1) {
    return 'warning-row'
  } else if (rowIndex === 2 || rowIndex === 3) {
    return 'success-row'
  }
  return ''
}
   
  const push_data = reactive({
    case_id: 1,
    order: 1,
  });
   
  function moveUp(index) {
    console.log('index => ', index)
    if (index > 0) {
      const item = items.value[index];
      items.value.splice(index, 1); // 移除当前项
      items.value.splice(index - 1, 0, item); // 在上一位置插入项
    }
  }
   
  function moveDown(index) {
    if (index < items.value.length - 1) {
      const item = items.value[index];
      items.value.splice(index, 1); // 移除当前项
      items.value.splice(index + 1, 0, item); // 在下一位置插入项
    }
  }

    function deleteRow(index) {
        console.log('item => ', items.value)
        for (let i = 0; i < items.value.length; i++) {
            if (i === index) {
                items.value.splice(i, 1);
            }
            console.log('items.value => ', items.value)
        }
    }


  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  button {
    margin-right: 5px;
  }
  .txx {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
    color: black;
  }
  </style>