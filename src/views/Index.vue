<template>
    <div class="container">
        <div class="left-sidebar">
            <el-scrollbar>
                <el-menu v-for="n in myRouters" :key="n.path" 
                    class="el-menu-vertical-demo"
                    active-text-color="#ffd04b"
                    background-color="#545c64"
                    text-color="#fff"
                    :default-active="activeMenu"
                    router
                >
                    <el-menu-item :index="n.path" v-if="n.children.length<1">
                        <el-icon><component :is="n.meta.icon"></component></el-icon>
                        <span>{{ n.meta.title }}</span>
                    </el-menu-item>
                    
                    <el-sub-menu v-else :index="n.name">
                        <template #title>
                            <el-icon><component :is="n.meta.icon"></component></el-icon>
                            <span>{{ n.meta.title }}</span>
                        </template>
                        <template v-for="cn in n.children" :key="cn.path">
                            <el-menu-item :index="`${n.path}/${cn.path}`">
                                <el-icon><component :is="cn.meta.icon"></component></el-icon>
                                <span>{{ cn.meta.title }}</span>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </div>
        <div class="right-content">
            <el-header style="text-align: right; font-size: 22px;">
                <BaseHeader :name="name" @logout="logout" />
            </el-header>

            <el-main>
                <RouterView></RouterView>
            </el-main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {useRouter,useRoute} from 'vue-router'
import BaseHeader from '../components/BaseHeader.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const name = ref(localStorage.getItem('username') ||'倾丶几回断肠')

const router = useRouter()
const route = useRoute()
const myRouters = router.getRoutes()
.filter(v => {
    return v.meta.isShow == true
})

const activeMenu = ref<string>(route.path);
watch(() => route.path, (newPath) => {
    activeMenu.value = newPath
})

const logout = () => {
    userStore.logout()
    router.push('/login');
}

</script>

<style scoped>
.container {
    display: flex;
    height: 100vh;
}

.left-sidebar {
    flex: 0 0 200px;
    background-image: url('../assets/bg3.jpg');
}

.right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
}

.el-header {
        background-color:#d4e6e6;
        color: #333;
        line-height: 60px;
    }

</style>
