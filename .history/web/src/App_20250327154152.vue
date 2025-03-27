<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-27 15:41:51
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
    if (data.data.length == 0) {
      ElMessage.warning(`没有通程行李信息`)
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
                item.旅客人数web = checkItem.passengerTotal ? checkItem.passengerTotal : '/';
                item.行李件数web = checkItem.piece ? checkItem.piece : '/';
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
    const response = await fetch('/template.xlsx');  // 确保模板放在 `public` 目录下
    const arrayBuffer = await response.arrayBuffer();

    // 2. 读取 Excel 文件（启用 `cellStyles: true` 以保留样式）
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });

    // 3. 获取第一个 Sheet（假设数据在第一个 Sheet）
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. 读取 Excel 模板的 **合并单元格信息**
    const merges = worksheet['!merges'] || [];

    // 5. 定义单元格样式（居中 & 添加边框）
    const cellStyle = {
      alignment: { horizontal: 'center', vertical: 'center' }, // 居中
      border: { // 边框
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
      font: { bold: false, name: 'Arial', sz: 12 }, // 字体
    };

    // 6. 填充数据（假设数据从第 2 行开始填充）
    tableData.value.forEach((item, index) => {
      const rowIndex = index + 2;  // 假设 Excel 第一行为标题，从 A2 开始填充

      const dataMap = {
        A: index + 1,  // 序号
        B: item.航班号,
        C: item.属性,
        D: item.计划起飞时间,
        E: item.计划到港时间,
        F: item.始发地,
        G: item.旅客人数 || '/',
        H: item.行李件数 || '/',
        I: item.旅客人数web || '/',
        J: item.行李件数web || '/'
      };

      // 逐个单元格填充数据，并应用样式
      Object.keys(dataMap).forEach(col => {
        const cellRef = `${col}${rowIndex}`;
        worksheet[cellRef] = { v: dataMap[col], t: 's', s: cellStyle };
      });
    });

    // 7. 重新设置合并单元格，保持模板结构
    worksheet['!merges'] = merges;

    // 8. 生成新的 Excel 文件
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 9. 保存文件
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
              <el-table-column prop="航班号" label="航班号" />
              <el-table-column prop="属性" label="属性" />
              <el-table-column prop="计划起飞时间" label="计划起飞时间" sortable />
              <el-table-column prop="计划到港时间" label="计划到港时间" />
              <el-table-column prop="始发地" label="始发地" />
              <el-table-column prop="旅客人数" label="旅客人数" />
              <el-table-column prop="行李件数" label="行李件数" />
              <el-table-column prop="旅客人数web" label="旅客人数web" />
              <el-table-column prop="行李件数web" label="行李件数web" />
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