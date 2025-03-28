<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-27 10:00:48
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-28 08:10:25
 * @FilePath: \through-baggage-webe:\projects_vscode\company\through-baggage-info-check\web\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
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
    if (data.data.length == 0) {
      ElMessage.warning(`该旅客没有值机信息`)
      reset()
    } else {
      tableData.value = data.data.map(item => ({
        ...item,
        计划起飞时间: dayjs(item.计划起飞时间).format('YYYY-MM-DD HH:mm:ss'),
        计划到港时间: dayjs(item.计划到港时间).format('YYYY-MM-DD HH:mm:ss')
      }));

      await axios.get("/api/statistics/flightInfo").then(res => {
        const checkData = res.data.obj;
        if (checkData.length != 0) {
          tableData.value.forEach(item => {
            checkData.forEach(checkItem => {
              if (item.航班号 == checkItem.inFlightNo && item.计划起飞时间 == dayjs(checkItem.timeStartPlan).format('YYYY-MM-DD HH:mm:ss')) {
                item.PASSENGER_COUNT_WEB = checkItem.passengerTotal ? checkItem.passengerTotal : '/';
                item.BAGGAGE_COUNT_WEB = checkItem.piece ? checkItem.piece : '/';
              }
            })
          })
        }
      })
    }


  } catch (error) {
    console.log(error);
    ElMessage.error(`通程行李信息获取失败: ${error.message}`)
  }
}

const exportExcel = async () => {
  try {
    // 1. 加载 Excel 模板文件
    const response = await fetch('/template.xlsx');  // 确保模板文件放在 `public` 目录下
    const arrayBuffer = await response.arrayBuffer();

    // 2. 读取 Excel 文件
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });

    // 3. 获取第一个 Sheet（假设数据在第一个 Sheet）
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. 读取 Excel 模板的 **合并单元格信息**
    const merges = worksheet['!merges'] || [];

    // 5. 填充数据（假设数据从第 2 行开始填充）
    tableData.value.forEach((item, index) => {
      const rowIndex = index + 7;  // 假设 Excel 第一行为标题，从 A2 开始填充

      worksheet[`A${rowIndex}`] = { v: '', t: 's' }; // 序号
      worksheet[`B${rowIndex}`] = { v: item.航班号, t: 's' };
      worksheet[`C${rowIndex}`] = { v: item.属性, t: 's' };
      worksheet[`D${rowIndex}`] = { v: item.计划起飞时间, t: 's' };
      worksheet[`E${rowIndex}`] = { v: item.计划到港时间, t: 's' };
      worksheet[`F${rowIndex}`] = { v: item.始发地, t: 's' };
      worksheet[`G${rowIndex}`] = { v: item.旅客人数 || '/', t: 'n' };
      worksheet[`H${rowIndex}`] = { v: item.行李件数 || '/', t: 'n' };
      worksheet[`I${rowIndex}`] = { v: item.旅客人数web || '/', t: 'n' };
      worksheet[`J${rowIndex}`] = { v: item.行李件数web || '/', t: 'n' };
    });

    // 6. 重新设置合并单元格，保持模板结构
    worksheet['!merges'] = merges;

    // 7. 生成新的 Excel 文件
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 8. 保存文件
    FileSaver.saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `${date}通程行李检查单.xlsx`
    );

    ElMessage.success("导出成功！");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败，请检查模板文件！");
  }
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
              <el-table-column prop="FLIGHT_NO_FULL" label="航班号" />
              <el-table-column prop="ATTRIBUTE" label="属性" />
              <el-table-column prop="TIME_START_PLAN" label="计划起飞时间" sortable />
              <el-table-column prop="TIME_TERMINAL_PLAN" label="计划到港时间" />
              <el-table-column prop="AIRPORT_START" label="始发地" />
              <el-table-column prop="PASSENGER_COUNT" label="旅客人数" />
              <el-table-column prop="BAGGAGE_COUNT" label="行李件数" />
              <el-table-column prop="PASSENGER_COUNT_WEB" label="旅客人数(web)" />
              <el-table-column prop="BAGGAGE_COUNT_WEB" label="行李件数(web)" />
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