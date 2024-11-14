<template>
    <el-dialog :title="dialogTitle" v-model="visible" 
        :close-on-click-modal="false" :append-to-body="true" width="30%"
        :destroy-on-close="true"
        @close="cancel"
        @open="open"
    >
        <el-form :model="form" :rules="rules" ref="dialogRef" label-width="80px">
            <el-form-item label="接口名称" prop="api_name">
                <el-input v-model="form.api_name"></el-input>
            </el-form-item>
            <el-form-item label="接口路径" prop="path">
                <el-input v-model="form.path"></el-input>
            </el-form-item>
            <el-form-item label="请求方式" prop="method">
                <!-- <el-input v-model="form.method"></el-input> -->
                <el-select v-model="form.method">
                    <el-option
                        v-for="m in api_methods"
                        :key="m.id"
                        :label="m.name"
                        :value="m.name"
                    ></el-option>
                </el-select>
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

interface ApiData {
    id: number,
    api_name: string,
    path: string,
    method: string,
    owner: string,
    create_at: string,
    update_at: string,
}

const ApiFormData: ApiData = {
    id: 0,
    api_name: '',
    path: '',
    method: '',
    owner: '',
    create_at: '',
    update_at: '',
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
        const form = ref<ApiData>(ApiFormData);
        const dialogRef = ref(null);
        const rules = {
            api_name: [{required: true, message: '请输入接口名称', trigger: 'blur'}],
            path: [{required: true, message: '请输入接口路径', trigger: 'blur'}],
            method: [{required: true, message: '请选择请求方式', trigger: 'blur'}],
        };
        const submitting = ref<boolean>(false);
        const cancel = () => {
            emit('update:dialogVisible', false)
            nextTick(() => {
                form.value = { ...ApiFormData }
                // dialogRef.value.clearValidate()
                // dialogRef.value.resetFields()
            })
        };
        // 打开dialog前，修改title，修改默认值
        const open = () => {
            if (props.isEdit == true) {
                dialogTitle.value = "编辑接口"
                // 三个点的写法是合并 例如：a = {x: 1, y: 2} b = {n: 1}  c = { ...a, ...b } output: c = {x: 1, y: 2, n: 1}
                form.value = { ...props.formData }
            } else {
                dialogTitle.value = "新增接口"
                form.value = { ...ApiFormData }
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
        const api_methods = [
            {id: 1, name: 'get'},
            {id: 2, name: 'post'},
        ]
        return {
            dialogTitle,
            form,
            rules,
            submit,
            submitting,
            cancel,
            visible,
            dialogRef,
            open,
            api_methods
        }
    }


})


</script>
