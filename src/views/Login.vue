<template>
    <div class="login-container">
        <el-card class="login-card" shadow="hover">
            <h2>登录</h2>
            <el-form :model="loginFormData" label-width="80px" ref="loginFormRef" :rules="rules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginFormData.username" placeholder="请输入用户名" prefix-icon="User"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginFormData.password" placeholder="请输入密码" type="password" prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitLogin">登录</el-button>
                </el-form-item>
            </el-form>
            <div class="register">
                <span>还没有账号？</span>
                <el-link type="primary" @click="showRegisterDialog">注册</el-link>
            </div>
        </el-card>
        <el-dialog :title="dialogTitle" v-model="registerDialogVisible" 
            :close-on-click-modal="false" :append-to-body="true" width="30%"
            :destroy-on-close="true"
        >
            <el-form :model="registerFormData" label-width="80px" ref="registerFormRef" :rules="rules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerFormData.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerFormData.password"  placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerFormData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitRegister">注册</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

interface LoginForm  {
    username: string,
    password: string
}

const InitLoginForm: LoginForm = {
    username: '',
    password: ''
}

interface RegisterForm {
    username: string,
    password: string
    email: string
}

const InitRegisterForm: RegisterForm = {
    username: '',
    password: '',
    email: ''
}

const loginFormData = ref<LoginForm>(InitLoginForm);
const registerDialogVisible = ref<boolean>(false);
const registerFormData = ref<RegisterForm>(InitRegisterForm);
const dialogTitle = ref<string>('注册');
const registerFormRef = ref<FormInstance>();
const loginFormRef = ref<FormInstance>();
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在4-16个字符', trigger: ['blur'] }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6-20个字符', trigger: ['blur'] }
  ]
}

// 带类型提示的调用
const submitLogin = async () => {
  try {
    await loginFormRef.value?.validate()
    const res = await userStore.login(InitLoginForm)
    ElMessage.success(res)
    router.push('/index')
  } catch (error) {
    console.log('in catch -> ', error)
  }
}

const showRegisterDialog = () => {
    registerDialogVisible.value = true;
    registerFormData.value = { ...InitRegisterForm }
}

const submitRegister = async () => {
    try {
        // 请求接口
        await registerFormRef.value?.validate()
        const res = await userStore.register(registerFormData.value)
        ElMessage.success(res)
        registerDialogVisible.value = false
    }  catch (error) {
        console.error('error => ', error)
    }
}

</script>

<style>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* background-image: url('@/assets/login1.png'); */
    background: linear-gradient(to right, #89f7fe, #4facfe);
}

.login-card {
    width: 400px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background: #fff;
}

.register {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

</style>
