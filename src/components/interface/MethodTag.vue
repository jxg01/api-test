<template>
    <el-tag :type="tagType" effect="dark">
        {{ method.toUpperCase() }}
    </el-tag>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    const props = defineProps<{
    method: string
    }>()
    const tagType = computed(() => {
    const methodMap: Record<string, string> = {
    get: 'success',
    post: 'warning',
    put: 'info',
    delete: 'danger',
    patch: 'primary'
    }
    return methodMap[props.method.toLowerCase()] || 'info'
    })
</script>
    
    
