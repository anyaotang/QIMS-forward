<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const { locale } = useI18n()

const elementLocale = computed(() => {
  return locale.value === 'zh-CN' ? zhCn : en
})
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <RouterView />
  </el-config-provider>
</template>

<style>
/* 全局样式在 main.ts 中导入 */
</style>
