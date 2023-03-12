<template>
    <div>
        <div class="toolBar">
            <el-col :span="4">
                <el-input v-model="searchVal" class="searchInput"></el-input>
            </el-col>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="openAddDialog">添加</el-button>
        </div>
        <el-table :data="pageData" border>
            <!-- <el-table-column prop="id" label="编号"></el-table-column> -->
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="age" label="年龄"></el-table-column>
            <el-table-column prop="sex" label="性别"></el-table-column>
            <el-table-column label="操作">
                <template #default="scoped">
                    <el-button type="primary" size="small" @click="openEditDialog(scoped.$index, scoped.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="openDeleteDialog(scoped.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                layout="total, size, prev, pager, next, jumper"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="filterData.length"
                :current-change="handlePageChange"
                background
            ></el-pagination>
        </div>
        <AddUserDialog v-model:dialog-visible="dialogVisible" v-model:is-edit="isEdit" v-model:form-data="dialogData"></AddUserDialog>
        <commonDialog v-model:showDeleteDialog="deleteDialogVisible"></commonDialog>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import AddUserDialog from '../components/AddUserDialog.vue';
import commonDialog from '../components/commonDialog.vue'

interface User {
    name: string,
    age: string,
    sex: string
}

const initUserForm: User = {
    name: '',
    age: '',
    sex: ''
}

export default defineComponent({
    components: {
        AddUserDialog,
        commonDialog
    },
    setup(){
        const searchVal = ref<string>('');
        const dialogVisible = ref<boolean>(false);
        const dialogData = ref<User>(initUserForm)
        const isEdit = ref<boolean>(false);

        const deleteDialogVisible = ref<boolean>(false);

        const tableData = ref<User[]>([
            {'name': 'test1', 'age': '18', 'sex': 'man'},
            {'name': 'test2', 'age': '22', 'sex': 'feman'},
        ]);

        const currentPage = ref<number>(1);
        const pageSize = ref<number>(10);

        const handleSearch = () => {
            console.log('搜索 >> ', searchVal.value)
        };

        const pageData = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value;
            const end = start + pageSize.value;
            return filterData.value.slice(start, end);
        })

        const filterData = computed(() => {
            return tableData.value.filter((item) => {
                return item.name.includes(searchVal.value.trim());
            });
        });

        const handlePageChange = (page: number) => {
            currentPage.value = page
        };

        const openAddDialog = () => {
            isEdit.value = false;
            dialogVisible.value = true;
            dialogData.value = initUserForm
            console.log('in open', dialogVisible.value)
        };

        const openEditDialog = (index: Number, row: User) => {
            isEdit.value = true;
            dialogVisible.value = true;
            console.log('row data: ', row)
            dialogData.value = row
        }
        const openDeleteDialog = (row: User) => {
            
            deleteDialogVisible.value = true
            console.log('click delete button  => ', deleteDialogVisible.value)
        }


        watch(() => dialogVisible.value, (val) => {
            console.log('监听：', val)
        });

        return {
            searchVal,
            pageData,
            currentPage,
            pageSize,
            handleSearch,
            filterData,
            handlePageChange,
            dialogVisible,
            isEdit,
            dialogData,
            openAddDialog,
            openEditDialog,
            openDeleteDialog,
            deleteDialogVisible
        };
    }
})
</script>

<style scoped>
.toolBar {
    display: flex;
    margin-bottom: 20px;
    width: 100%;
    /* padding-left: 20px; */
}

.pagination {
    /* display + justify-content => 组合写可以指定元素位置 */
    display: flex;
    justify-content: start;
    padding: 20px;
}

.searchInput {
    padding-right: 3px;
}

</style>
