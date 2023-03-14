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
            <el-table-column prop="id" label="编号" width="60"></el-table-column>
            <el-table-column prop="project_name" label="项目名称"></el-table-column>
            <el-table-column prop="project_url" label="项目地址"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="owner" label="创建人"></el-table-column>
            <el-table-column prop="create_at" label="创建时间"></el-table-column>
            <el-table-column prop="update_at" label="修改时间"></el-table-column>
            <el-table-column label="操作" width="135">
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
        <AddProjectDialog v-model:dialog-visible="dialogVisible" v-model:is-edit="isEdit" v-model:form-data="dialogData"></AddProjectDialog>
        <commonDialog v-model:deleteDialogVisible="deleteDialogVisible" v-model:form-data="dialogData"></commonDialog>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import AddUserDialog from '../components/AddUserDialog.vue';
import CommonDialog from '../components/CommonDialog.vue'

interface ProjectData {
    id: number,
    project_name: string,
    project_url: string,
    description: string,
    owner: string,
    create_at: string,
    update_at: string,
}

const InitProjectFormData: ProjectData = {
    id: 0,
    project_name: '',
    project_url: '',
    description: '',
    owner: '',
    create_at: '',
    update_at: ''
}


export default defineComponent({
    components: {
        AddUserDialog,
        CommonDialog
    },
    setup(){
    
        const searchVal = ref<string>('');
        const dialogVisible = ref<boolean>(false);
        const deleteDialogVisible = ref<boolean>(false);
        const dialogData = ref<ProjectData>(InitProjectFormData)
        const isEdit = ref<boolean>(false);

        const currentPage = ref<number>(1);
        const pageSize = ref<number>(10);
        const tableData = ref<ProjectData[]>([
            {'id': 1, 'project_name': 'csm', 'project_url': 'http://www', 'description': '系统A', 'owner': 'eddy', 'create_at': '2023-03-13 20:00:00', 'update_at': '2023-03-13 23:00:00'},
            {'id': 2, 'project_name': 'LTD', 'project_url': 'http://uuu', 'description': '系统B', 'owner': 'eddy', 'create_at': '2023-03-13 20:00:00', 'update_at': '2023-03-13 23:00:00'},
        ]);

        const handleSearch = () => {
            console.log('搜索 >> ', searchVal.value)
        };

        const handlePageChange = (page: number) => {
            currentPage.value = page
        };

        const filterData = computed(() => {
            return tableData.value.filter((item) => {
                return item.project_name.includes(searchVal.value.trim());
            });
        });
        const pageData = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value;
            const end = start + pageSize.value;
            return filterData.value.slice(start, end);
        })

        const openAddDialog = () => {
            isEdit.value = false;
            dialogVisible.value = true;
            dialogData.value = InitProjectFormData
            console.log('in open', dialogVisible.value)
        };

        const openEditDialog = (index: Number, row: ProjectData) => {
            isEdit.value = true;
            dialogVisible.value = true;
            console.log('row data: ', row)
            dialogData.value = row
        }
        const openDeleteDialog = (row: ProjectData) => {
            deleteDialogVisible.value = true
            dialogData.value = row
            console.log('click delete button  => ', deleteDialogVisible.value)
        }
        

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

    },


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
