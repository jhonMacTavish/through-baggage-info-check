<template>
  <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <el-form-item label="姓名">
      <el-input v-model="formInline.name" placeholder="Approved by" clearable />
    </el-form-item>
    <el-form-item label="航班号">
      <el-input v-model="formInline.name" placeholder="Approved by" clearable />
    </el-form-item>
    <el-form-item label="身份证号">
      <el-input v-model="formInline.name" placeholder="Approved by" clearable />
    </el-form-item>
    <el-form-item label="时间范围">
      <el-select
        v-model="formInline.time"
        placeholder="Activity zone"
        clearable
      >
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Query</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const formInline = reactive({
  name: '',
  flight: '',
  IDcard: '',
  time: ''
})

const onSubmit = () => {
  console.log('submit!')
}
</script>

<style>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
</style>
