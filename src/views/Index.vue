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
            <el-header>
                <div class="header-right">
                    <el-icon><i-ep-user /></el-icon>
                    <span class="username">倾丶几回断肠</span>
                    <el-button type="info">退出登录</el-button>
                    <!-- <el-link>退出登录</el-link> -->
                </div>
            </el-header>
            <el-main>
                <RouterView></RouterView>
            </el-main>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import {useRouter,useRoute} from 'vue-router'

export default defineComponent({
    setup(){
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
        return {
            activeMenu,
            myRouters,
        }
    },
})

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
    background-color: cornsilk;
}

.username {
    padding: 0 20px 0 5px;
}

</style>
