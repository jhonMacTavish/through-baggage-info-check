<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-12 15:17:29
 * @FilePath: \passengerInfoSearch\web\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import Header from './components/Header.vue'
import axios from 'axios'
import { dayjs } from 'element-plus'
import { ref } from 'vue'

const passengerData = ref([]);
const verifyData = ref([]);

const search = async (params) => {
  try {
    await axios.get("/api/queryPassenger", { params }).then(res => {
      const data = res.data.data;
      passengerData.value = data.map((item, index) => {
        item.CHECKIN_TIME = dayjs(item.CHECKIN_TIME).add(8, 'hour').format('YYYY-MM-DD HH:mm:ss');
        console.log(item.CHECKIN_TIME);
        return item
      });
    });
  } catch (error) {
    console.log(error);
  }
}

const selectRow = async (row) => {
  const time = dayjs(row.FLIGHT_DATE).diff(dayjs(), 'day');
  const params = {
    PASSENGER_ID: row.ID,
    FLIGHT_DATE: row.FLIGHT_DATE,
    time
  }
  console.log(params);
  try {
    // await axios.get("/api/queryVerify", { params }).then(res => {
    //   verifyData.value = res.data.data;
    // });
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <Header @emitSearch="search" />
      </el-header>
      <el-main>
        <el-table :data="passengerData" style="width: 100%">
          <el-table-column label="NAME" width="80px">
            <template #default="scope">
              <el-button link type="primary" size="small" @click.prevent="selectRow(scope.row)">
                {{ scope.row.NAME }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="FLIGHT_NO" label="FLIGHT_NO" width="110px" />
          <el-table-column prop="ID_CARD" label="ID_CARD" />
          <el-table-column prop="TERMINALL" label="TERMINALL" width="110px" />
          <el-table-column prop="CHECKIN_TIME" label="CHECKIN_TIME" width="220px" />
          <el-table-column prop="CHECKIN_WAY" label="CHECKIN_WAY" />
          <el-table-column prop="BAGGAGE_NUM" label="BAGGAGE_NUM" />
          <el-table-column prop="CHECKIN_AGENT" label="CHECKIN_AGENT" />
          <el-table-column prop="CHECKIN_OFFCIE" label="CHECKIN_OFFCIE" />
        </el-table>
        <hr>
        <el-table :data="verifyData" style="width: 100%">
          <el-table-column prop="NAME" label="NAME" width="80px" />
          <el-table-column prop="FLIGHT_NO" label="FLIGHT_NO" width="110px" />
          <el-table-column prop="ID_CARD" label="ID_CARD" />
          <el-table-column prop="TERMINALL" label="TERMINALL" width="110px" />
        </el-table>
      </el-main>
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
