<script setup lang="ts">
</script>

<template>
    <!-- 移除:key属性以避免菜单闪烁，内容区域的状态清除由Index.vue中的RouterView负责 -->
    <RouterView></RouterView>
</template>

<style>
#app {
  margin: 0;
  padding: 0;
  max-width: none;
  /* background-image: url('./assets/bg1.jpg'); */
  background-size: cover;
  background-repeat: no-repeat;
  /* background-position: center center; */
  width: 100%;
  height: 100%;
}
</style>
