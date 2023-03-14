<template>
    <el-dialog :title="dialogTitle" v-model="visible" 
        :close-on-click-modal="false" :append-to-body="true" width="30%"
        :destroy-on-close="true"
        @close="cancel"
        @open="open"
    >
        <el-form :model="form" :rules="rules" ref="dialogRef" label-width="80px">
            <el-form-item label="项目名称" prop="project_name">
                <el-input v-model="form.project_name"></el-input>
            </el-form-item>
            <el-form-item label="项目地址" prop="project_url">
                <el-input v-model="form.project_url"></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <el-input v-model="form.description"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="submit" :loading="submitting">确定</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

</template>


<script lang="ts">
import { defineComponent, ref, computed, nextTick } from 'vue'

interface ProjectForm {
    'id': number,
    'project_name': string,
    'project_url': string,
    'description': string,
    'owner': string,
    'create_at': string,
    'update_at': string,
}

const initialFormData: ProjectForm = {
    'id': 0,
    'project_name': '',
    'project_url': '',
    'description': '',
    'owner': '',
    'create_at': '',
    'update_at': '',
}

export default defineComponent({
    
    props: {
        dialogVisible: {
            type: Boolean,
            required: true
        },
        isEdit: {
            type: Boolean,
            required: true
        },
        formData: {
            type: Object,
            required: true
        }
    },

    setup(props, { emit }){
        const dialogTitle = ref<string>('');
        const form = ref<ProjectForm>(initialFormData);
        const dialogRef = ref(null);
        const rules = {
            project_name: [{required: true, message: '请输入项目名称', trigger: 'blur'}],
            project_url: [{required: true, message: '请输入项目地址', trigger: 'blur'}],
            description: [{required: true, message: '请输入描述', trigger: 'blur'}],
        };
        const submitting = ref<boolean>(false);
        const cancel = () => {
            emit('update:dialogVisible', false)
            nextTick(() => {
                form.value = { ...initialFormData }
                // dialogRef.value.clearValidate()
                // dialogRef.value.resetFields()
            })
        };
        // 打开dialog前，修改title，修改默认值
        const open = () => {
            if (props.isEdit == true) {
                dialogTitle.value = "编辑用户"
                // 三个点的写法是合并 例如：a = {x: 1, y: 2} b = {n: 1}  c = { ...a, ...b } output: c = {x: 1, y: 2, n: 1}
                form.value = { ...props.formData }
            } else {
                dialogTitle.value = "新增用户"
                form.value = { ...initialFormData }
            }
        }

        const submit = () => {
            (props.isEdit? editUser(): addUser()).then(() => {
                submitting.value = false;
                emit('update:dialogVisible', false);
            })
        };
        // 调用添加用户接口
        const addUser = () => {
            //
            console.log('add user form data => ', form.value)
            return Promise.resolve();
        };
        // 调用 编辑用户接口
        const editUser = () => {
            //
            console.log('edit user form data => ', form.value)
            return Promise.resolve();
        };

        // 获取 props 中的数据，然后再 return，然后再使用
        // 值有变动后，通知父组件修改对应的值
        const visible = computed({
            get(){
                return props.dialogVisible
            },
            set(value) {
                emit('update:dialogVisible', value)
            }
        });
        return {
            dialogTitle,
            form,
            rules,
            submit,
            submitting,
            cancel,
            visible,
            dialogRef,
            open
        }
    }


})


</script>
