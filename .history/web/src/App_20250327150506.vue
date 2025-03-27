<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-27 15:02:47
 * @FilePath: \passengerInfoSearch\web\src\App.vue
-->
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { dayjs } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const date = dayjs().format('YYYY-MM-DD')

const getData = async () => {
  try {
    const { data } = await axios.get("/api/queryThroughBaggageInfo", {
      params: {}
    });

    await axios.get("/api/statistics/flightInfo").then(res => {
      console.log(res)
    })

    if (data.data.length == 0) {
      ElMessage.warning(`没有通程行李信息`)
    } else {
      tableData.value = data.data.map(item => ({
        ...item,
        计划起飞时间: dayjs(item.计划起飞时间).format('YYYY-MM-DD HH:mm:ss'),
        计划到港时间: dayjs(item.计划到港时间).format('YYYY-MM-DD HH:mm:ss')
      }))
    }
  } catch (error) {
    console.log(error);
    ElMessage.error(`通程行李信息获取失败: ${error.message}`)
  }
}

const exportExcel = () => {
  // 1.生成Excel工作簿对象
  var wb = XLSX.utils.table_to_book(document.querySelector('#educe-table'));
  // 2.手机号，身份证号等会默认使用科学计数法表示，则需要这样设置
  var wb = XLSX.utils.table_to_book(
    document.querySelector("#educe-table"),
    { raw: true }
  );
  // 获取二进制字符串作为输出
  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    book: true,
    type: 'array',
  })
  try {
    FileSaver.saveAs(
      // Blob: 对象表示一个不可变 原始数据的类文件对象,不一定是JS原生格式的数据。
      // File: 基于Blob，继承了blob的功能并将其扩展使其支持用户系统上的文件。  
      new Blob([wbout], { type: 'appliction/octet-stream' }),
      // 设置导出的文件名称可随意
      `${date}通程行李检查单.xlsx`
    )
  } catch (e) {
    if (typeof console != 'undefined') console.log(e, wbout);
  }
  // 返回一个新创建的Blob对象，其内容由参数中给定的数组串联组成。
  return wbout
}

onMounted(() => {
  getData();
})

</script>

<template>
  <div class="container">
    <el-container>
      <!-- 头部区域 -->
      <el-header class="header-wrapper">
        <el-card shadow="hover" class="header-card">
          <!-- <Header @emitSearch="queryPassenger" @emitReset="reset" /> -->
          <h3 class="hader-title">{{ date }}通程巡检单</h3>
          <el-button type="primary" class="btn-seal" @click="exportExcel">导出结果</el-button>
        </el-card>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="main-wrapper">
        <!-- 乘客信息卡片 -->
        <el-card shadow="hover" class="table-card">
          <el-skeleton :loading="loading" :rows="6" animated>
            <el-table id="educe-table" :data="tableData" stripe highlight-current-row empty-text="暂无行李数据">
              <el-table-column prop="航班号" label="航班号" />
              <el-table-column prop="属性" label="属性" />
              <el-table-column prop="计划起飞时间" label="计划起飞时间" sortable />
              <el-table-column prop="计划到港时间" label="计划到港时间" />
              <el-table-column prop="始发地" label="始发地" />
              <el-table-column prop="旅客人数" label="旅客人数" />
              <el-table-column prop="行李件数" label="行李件数" />
            </el-table>
          </el-skeleton>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-wrapper {
  height: auto;
  padding: 0;
  margin-bottom: 24px;

  .header-card {
    position: relative;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
    border: none;

    .hader-title {
      text-align: center;
    }

    .btn-seal {
      position: absolute;
      right: 24px;
      top: 40%;
    }
  }
}

.main-wrapper {
  padding: 0;

  .table-card {
    border-radius: 12px;
    margin-bottom: 24px;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-table) {
      --el-table-border-color: transparent;
      --el-table-header-bg-color: #f8fafd;
    }
  }
}

.custom-divider {
  margin: 32px 0;
  color: #909399;

  .divider-text {
    margin: 0 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .el-icon {
    vertical-align: middle;
  }
}

.name-btn {
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateX(3px);
    color: var(--el-color-primary) !important;
  }
}

.pass-photo {
  // width: 120px;
  // height: 80px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.03);
    cursor: zoom-in;
  }
}

.image-error {
  @apply flex flex-col items-center justify-center h-full text-gray-400;

  .el-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
}
</style>