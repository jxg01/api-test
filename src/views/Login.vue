<template>
    <div class="login-container">
        <el-card class="login-card" shadow="hover">
            <h2>登录</h2>
            <el-form :model="loginFormData" label-width="80px" ref="loginForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginFormData.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginFormData.password" placeholder="请输入密码" type="password"></el-input>
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
                    <el-input v-model="registerFormData.password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitRegister">注册</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>

</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

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
}

const InitRegisterForm: RegisterForm = {
    username: '',
    password: ''
}

const router = useRouter()


const loginFormData = ref<LoginForm>(InitLoginForm);
const registerDialogVisible = ref<boolean>(false);
const registerFormData = ref<RegisterForm>(InitRegisterForm);
const dialogTitle = ref<string>('注册');
const registerFormRef = ref(null);
const rules = {
    username: [{required: true, message: '请输入项目名称', trigger: 'blur'}],
    password: [{required: true, message: '请输入项目地址', trigger: 'blur'}],
};

const submitLogin = () => {
    console.log('提交表单', loginFormData)
    router.push('/index')
}

const showRegisterDialog = () => {
    console.log('打开注册弹窗')
    registerDialogVisible.value = true;
    registerFormData.value = { ...InitRegisterForm }

}

const submitRegister = () => {
    console.log('submit register >> ', registerFormData)
    // 请求接口
    registerDialogVisible.value = false
}

</script>

<style>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.login-card {
    width: 400px;
}

.register {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

</style>
