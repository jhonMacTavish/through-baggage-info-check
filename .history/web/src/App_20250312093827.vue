<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <template>
          <el-page-header icon="">
            <template #content>
              <div class="flex items-center">
                <el-avatar :size="32" class="mr-3"
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="text-large font-600 mr-3"> Title </span>
                <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                  Sub title
                </span>
                <el-tag>Default</el-tag>
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <el-button>Print</el-button>
                <el-button type="primary" class="ml-2">Edit</el-button>
              </div>
            </template>
          </el-page-header>
        </template>
      </el-header>
      <el-main>Main</el-main>
    </el-container>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
