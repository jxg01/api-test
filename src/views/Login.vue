<template>
    <div class="login-container">
        <el-card class="login-card" shadow="hover">
            <h2>登录</h2>
            <el-form :model="loginForm" label-width="80px" ref="loginForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginForm.password" placeholder="请输入密码" type="password"></el-input>
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
        <el-dialog title="注册" v-model="registerDialogVisible" width="25%">
            <el-form :model="registerFrom" label-width="80px" ref="registerForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerFrom.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerFrom.password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitRegister">注册</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
    data(){
        return {
            loginForm: {
                username: '',
                password: ''
            },
            registerDialogVisible: false,
            registerFrom: {
                username: '',
                password: ''
            }
        }
    },
    methods: {
        submitLogin(){
            console.log('提交表单', this.loginForm)
        },
        showRegisterDialog(){
            console.log('打开注册弹窗')
            this.registerDialogVisible = true;
            console.log('>>> ', this.registerDialogVisible)
        },
        submitRegister(){
            console.log('submit register >> ', this.registerFrom)
            // 请求接口
            this.registerDialogVisible = false
        }
    }


})

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
