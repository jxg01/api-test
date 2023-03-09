<template>
    <div class="dashboard">
        <el-container>
            <el-header>head</el-header>
            <el-container>
                <el-aside>
                    <el-scrollbar>
                        <el-menu>
                            <el-menu-item index="1">
                                <el-icon><i-ep-search /></el-icon> 项目管理
                            </el-menu-item>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-main>main</el-main>
            </el-container>
        </el-container>
        
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup(){
        const activeMenu = ref(false);





        return {
            activeMenu,
        }

    },


})

</script>

<style scoped>

</style>
