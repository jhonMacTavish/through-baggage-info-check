<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-03-06 18:13:22
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-06 22:33:19
 * @FilePath: \through-baggage-webe:\projects_vscode\github\vue3-admin-main\src\views\Main.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="main-container">
    <el-form :inline="true" :model="form" label-width="auto" class="demo-form-inline">
      <el-form-item label="筛选条件">
        <el-checkbox-group :min="1" v-model="form.type">
          <el-checkbox value="姓名" name="type">
            姓名
          </el-checkbox>
          <el-checkbox value="航班号" name="type">
            航班号
          </el-checkbox>
          <el-checkbox value="身份证号" name="type">
            身份证号
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-select v-model="form.time" placeholder="请选择时间范围">
          <el-option label="一周内" value="week" />
          <el-option label="一月内" value="month" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.type.includes('姓名')" label="姓名">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item v-if="form.type.includes('航班号')" label="航班号">
        <el-input v-model="form.flight" />
      </el-form-item>
      <el-form-item v-if="form.type.includes('身份证号')" label="身份证号">
        <el-input v-model="form.IDcard" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="ID" label="PASSENGER_ID" width="180" />
      <el-table-column prop="FLIGHT_DATE" label="FLIGHT_DATE" width="180" />
      <el-table-column prop="FLIGHT_NO" label="FLIGHT_NO" />
      <el-table-column prop="NAME" label="NAME" />
      <el-table-column prop="ID_CARD" label="ID_CARD" />
      <el-table-column prop="STATE" label="STATE" />
      <el-table-column prop="CHECKIN_TIME" label="CHECKIN_TIME" />
      <el-table-column prop="CHECKIN_WAY" label="CHECKIN_WAY" />
    </el-table>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, reactive } from 'vue';

const tableData = ref([]);

const form = reactive({
  name: '',
  flight: '',
  IDcard: '',
  time: 'week',
  type: ["姓名"],
});

const onSubmit = async () => {
  const { name, flight, IDcard, time } = form;
  const params = {
    name,
    flight,
    IDcard,
    time
  }
  try {
    await axios.get("/query", { params }).then((res) => {
      console.log(res.data);
      tableData.value.length = 0
      res.data.forEach(item => {
        tableData.value.push(item);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  // const main = document.getElementsByClassName('main-container');
  // const windowHeight = window.innerHeight;
  // main.style.height = `${windowHeight - 100}px`;
});
</script>

<style scoped>
.main-container {}

.demo-form-inline .el-input {
  --el-input-width: 120px;
}

.demo-form-inline .el-select {
  --el-select-width: 120px;
}
</style>