<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-03-06 18:13:22
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-06 22:53:49
 * @FilePath: \through-baggage-webe:\projects_vscode\github\vue3-admin-main\src\views\Main.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="main-container">
    <el-form :inline="true" :model="form" label-width="auto">
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
    tableData.value = [
      {
        "ID": 66527994,
        "FLIGHT_DATE": "2025-02-28T16:00:00.000Z",
        "FLIGHT_NO": "ZH9542",
        "BOARD_NO": 96,
        "SEAT_NO": "9A",
        "NAME": "卢鹏",
        "NAME_EN": "LUPENG",
        "ID_TYPE": "NI",
        "ID_CARD": "52222520050227721X",
        "AIRPORT_START": "TFU",
        "AIRPORT_TERMINAL": "WUX",
        "GATES": "55",
        "STATE": "BD",
        "GENDER": "M",
        "PASSENGER_TYPE": 0,
        "ICS": "MZLWR3",
        "PCLASS": "Y",
        "BCLASS": "L",
        "INF": null,
        "CONCAT_INFO": "SZH001-16FEB25-1958-95080B2CTK20250216114806596",
        "E_TICKET": "4794263904492",
        "GROUP_NO": null,
        "BAGGAGE_NUM": 0,
        "BAGGAGE_WEIGHT": 0,
        "FLIGHT_START_PLAN": "2025-02-28T23:40:00.000Z",
        "FLIGHT_SHARE": null,
        "CHECKIN_ID": "150340",
        "CHECKIN_AGENT": "8765",
        "CHECKIN_TIME": "2025-02-28T21:41:00.000Z",
        "CHECKIN_OFFCIE": "TFU101",
        "CHECKIN_WAY": "COUNTER",
        "REMARK": null,
        "CREATE_TIME": "2025-02-28T21:41:50.000Z",
        "UPDATE_TIME": "2025-02-28T23:02:30.000Z",
        "ATTRIBUTE": "DOM",
        "TERMINALL": "T2",
        "UNPACK_AUTHORIZE": 0,
        "SEND_STATUS": 1,
        "CHECKIN_WAY_HISTORY": null
      },
      {
        "ID": 66552853,
        "FLIGHT_DATE": "2025-02-28T16:00:00.000Z",
        "FLIGHT_NO": "HU7152",
        "BOARD_NO": 124,
        "SEAT_NO": "40B",
        "NAME": "卢鹏",
        "NAME_EN": "LUPENG",
        "ID_TYPE": "NI",
        "ID_CARD": "420982198810014315",
        "AIRPORT_START": "TFU",
        "AIRPORT_TERMINAL": "CAN",
        "GATES": "224",
        "STATE": "BD",
        "GENDER": "M",
        "PASSENGER_TYPE": 0,
        "ICS": "PC16TN",
        "PCLASS": "Y",
        "BCLASS": "A",
        "INF": null,
        "CONCAT_INFO": "HKK068-25FEB25-1812-95339",
        "E_TICKET": "8802170172150",
        "GROUP_NO": null,
        "BAGGAGE_NUM": 1,
        "BAGGAGE_WEIGHT": 10,
        "FLIGHT_START_PLAN": "2025-03-01T06:00:00.000Z",
        "FLIGHT_SHARE": null,
        "CHECKIN_ID": "138182",
        "CHECKIN_AGENT": "44916",
        "CHECKIN_TIME": "2025-03-01T03:57:00.000Z",
        "CHECKIN_OFFCIE": "TFU001",
        "CHECKIN_WAY": "COUNTER",
        "REMARK": null,
        "CREATE_TIME": "2025-03-01T03:57:21.000Z",
        "UPDATE_TIME": "2025-03-01T05:31:40.000Z",
        "ATTRIBUTE": "DOM",
        "TERMINALL": "T2",
        "UNPACK_AUTHORIZE": 0,
        "SEND_STATUS": 1,
        "CHECKIN_WAY_HISTORY": null
      },
    ]
    await axios.get("/query", { params }).then(async (res) => {
      console.log(res.data);
      tableData.value = JSON.parse(JSON.stringify(res.data));
      await nextTick(); 
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