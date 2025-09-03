<template>
  <div class="login-container">
    <!-- 全屏 Canvas：背景图 + 雪花 -->
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <!-- 卡片容器，负责 Perspective -->
    <div class="card-wrapper">
      <transition name="flip" mode="out-in">
        <div class="login-box" :key="mode">
          <!-- 标题 -->
          <h2 class="login-title">{{ modeTitles[mode] }}</h2>

          <!-- 登录表单 -->
          <el-form
            v-if="mode === 'login'"
            :model="loginForm"
            :rules="loginRules"
            ref="formRef"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button class="login-btn" @click="onLogin" :loading="loading">
                登录
              </el-button>
            </el-form-item>

            <div class="login-links">
              <el-link type="primary" @click="mode = 'forgot'">忘记密码</el-link>
              <el-link type="warning" @click="mode = 'register'">注册账号</el-link>
            </div>
          </el-form>

          <!-- 注册表单 -->
          <el-form
            v-if="mode === 'register'"
            :model="registerForm"
            :rules="registerRules"
            ref="formRef"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                @click="onRegisterSubmit"
                :loading="loading"
              >
                注册
              </el-button>
            </el-form-item>

            <div class="login-links">
              <el-link type="primary" @click="mode = 'login'">已有账号，返回登录</el-link>
            </div>
          </el-form>

          <!-- 找回密码表单 -->
          <el-form
            v-if="mode === 'forgot'"
            :model="forgotForm"
            :rules="forgotRules"
            ref="formRef"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="forgotForm.email" placeholder="请输入注册时使用的邮箱" />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                @click="onResetSubmit"
                :loading="loading"
              >
                发送重置链接
              </el-button>
            </el-form-item>

            <div class="login-links">
              <el-link type="primary" @click="mode = 'login'">返回登录</el-link>
              <el-link type="success" @click="mode = 'register'">注册账号</el-link>
            </div>
          </el-form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import bgImageUrl from '@/assets/login-bg2.png'

import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

// 控制当前模式
const mode = ref<'login' | 'register' | 'forgot'>('login')
const modeTitles = {
  login: '登录',
  register: '注册账号',
  forgot: '找回密码'
}

// formRefs
const formRef = ref<FormInstance>()
const loading = ref(false)

// 登录表单 & 校验
interface LoginForm { username: string; password: string }
const loginForm = reactive<LoginForm>({ username: '', password: '' })
const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
// 登录提交
const onLogin = async () => {
  try {
    loading.value = true
    await formRef.value?.validate()
    const res = await userStore.login(loginForm)
    ElMessage.success(res)
    router.push('/index')
    loading.value = false
  } catch (error) {
    loading.value = false
    console.log('登录失败:', error)
  }
}

// 注册表单 & 校验
interface RegisterForm {
  username: string; email: string; password: string; confirmPassword: string
}
const registerForm = reactive<RegisterForm>({
  username: '', email: '', password: '', confirmPassword: ''
})
const registerRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value !== registerForm.password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur'
    }
  ]
}
const onRegisterSubmit = async () => {
  try {
    loading.value = true
    // 请求接口
    await formRef.value?.validate()
    const res = await userStore.register(registerForm)
    ElMessage.success(res)
    loading.value = false

    // 清空注册表单
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''

    mode.value = 'login' // 切换回登录
  }  catch (error) {
    loading.value = false
    console.error('error => ', error)
  }
}

// 找回密码表单 & 校验
interface ForgotForm { email: string }
const forgotForm = reactive<ForgotForm>({ email: '' })
const forgotRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
}
const onResetSubmit = () => {
  formRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        loading.value = false
        console.log('已发送重置链接到', forgotForm.email)
      }, 1500)
    }
  })
}

// Canvas 背景图 + 雪花
const bgCanvas = ref<HTMLCanvasElement | null>(null)
onMounted(() => {
  if (!bgCanvas.value) return
  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')!
  let w = (canvas.width = window.innerWidth)
  let h = (canvas.height = window.innerHeight)

  const bgImg = new Image()
  bgImg.src = bgImageUrl

  type Flake = { x: number; y: number; r: number; d: number }
  const flakes: Flake[] = []
  const maxFlakes = 80
  for (let i = 0; i < maxFlakes; i++) {
    flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 4 + 1, d: Math.random() * maxFlakes })
  }

  let angle = 0
  const updateFlakes = () => {
    angle += 0.01
    for (const f of flakes) {
      f.x += Math.sin(angle) * 0.5
      f.y += Math.cos(angle + f.d) + 1 + f.r / 2
      if (f.y > h) {
        f.y = 0
        f.x = Math.random() * w
      }
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    // 背景图
    ctx.drawImage(bgImg, 0, 0, w, h)
    // 雪花
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    for (const f of flakes) {
      ctx.moveTo(f.x, f.y)
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
    }
    ctx.fill()
    updateFlakes()
    requestAnimationFrame(draw)
  }

  bgImg.onload = draw
  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  })
})
</script>

<style scoped>
/* 容器 & Canvas 背景 */
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.bg-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

/* 卡片透视容器 */
.card-wrapper {
  position: absolute;
  top: 50%; left: 50%;
  width: 380px;
  transform: translate(-50%, -50%);
  perspective: 1000px;
}

/* 公共卡片样式 */
.login-box {
  width: 100%;
  padding: 40px;
  /* background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3); */
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  /* backdrop-filter: blur(12px); */ /* 移除，改为伪元素 */
  transform-style: preserve-3d;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative; /* 让伪元素定位 */
  overflow: hidden; /* 保证伪元素不溢出圆角 */
}

/* 在伪元素上绘制模糊背景和半透明边框，内容置于上层 */
.login-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  z-index: 0;
  pointer-events: none;
}

/* 确保卡片内部实际内容在伪元素之上，不受模糊影响 */
.login-box > * {
  position: relative;
  z-index: 1;
}

.login-box:hover {
  transform: scale(1.01);
  box-shadow: 0 16px 56px rgba(0, 0, 0, 0.3);
}

/* 卡片翻转动画 */
.flip-enter-active, .flip-leave-active {
  transition: transform 0.6s;
}
.flip-enter-from  { transform: rotateY(90deg); }
.flip-leave-to    { transform: rotateY(-90deg); }
.flip-enter-to,
.flip-leave-from  { transform: rotateY(0deg); }

/* 表单 & 标题 & 链接 */
.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 26px;
  font-weight: bold;
  color: #333;
}
.login-btn {
  width: 100%;
  background-color: black;
  color: white;
}
.login-btn:hover {
  background-color: #444;
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: -10px;
}

/* 输入框玻璃风 */
.el-input__inner {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: 8px !important;
  color: #333 !important;
  transition: border-color 0.3s, box-shadow 0.3s !important;
}
.el-input__inner::placeholder {
  color: rgba(51, 51, 51, 0.6) !important;
}
.el-input__inner:focus {
  border-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.6) !important;
}
</style>
