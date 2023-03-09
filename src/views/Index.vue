<template>
    <div class="container">
        <div class="left-sidebar">
            <el-scrollbar>
                <!-- <el-menu v-for="n in myRouters" :key="n.path" router>
                    <el-menu-item :index="n.path" v-if="n.children.length < 1">
                        <el-icon>x</el-icon>
                        <span>{{ n.meta.title }}</span>
                    </el-menu-item>
                    <el-sub-menu v-else :index="n.path">
                        <template #title>
                            <el-icon>2</el-icon>
                            <el-span>{{ n.meta.title }}</el-span>
                        </template>
                        <el-menu-item v-for="cn in n.children" :key="cn.path" :index="cn.path">
                            {{ cn.meta.title }}
                        </el-menu-item>
                    </el-sub-menu>
                </el-menu> -->


                <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleMenuSelect">
                    <el-menu-item index="dashboard">
                        <el-icon><i-ep-Histogram /></el-icon>
                        <span>首页</span>
                    </el-menu-item>
                    <el-menu-item index="user">
                        <el-icon><i-ep-User /></el-icon>
                        <span>用户管理</span>
                    </el-menu-item>
                    <el-menu-item index="project">
                        <el-icon><i-ep-ChromeFilled /></el-icon>
                        <span>项目管理</span>
                    </el-menu-item>
                    <el-sub-menu index="automation">
                        <template #title>
                            <el-icon><i-ep-Aim /></el-icon>
                            <span>自动化测试</span>
                        </template>
                        <el-menu-item index="interface">接口管理</el-menu-item>
                        <el-menu-item index="testcase">用例管理</el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </div>
        <div class="right-content">
            <el-header>
                <div class="header-right">
                    <el-icon><i-ep-user /></el-icon>
                    <span>倾丶几回断肠</span>
                    <el-button>退出登录</el-button>
                </div>
            </el-header>
            <el-main>
                <RouterView></RouterView>
            </el-main>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import router from '../router'
import { useRouter} from 'vue-router'

export default defineComponent({
    setup(){
        const rt = useRouter()

        const myRouters = rt.getRoutes()
        .filter(v => {
            return v.meta.isShow == true
        })

        const activeMenu = ref<string>(rt.currentRoute.value.path);

        const handleMenuSelect = (index: string) => {
            activeMenu.value = index
            console.log('点击：', activeMenu.value)
            router.push(activeMenu.value)
            console.log('my router >> ', myRouters)
            console.log('current router: ', rt.currentRoute.value.path)
        };


        return {
            activeMenu,
            handleMenuSelect,
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


</style>
