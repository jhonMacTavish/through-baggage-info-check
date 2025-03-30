<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-27 10:00:48
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-28 10:25:55
 * @FilePath: \through-baggage-webe:\projects_vscode\company\through-baggage-info-check\web\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import * as XLSXStyle from 'xlsx-js-style';
import axios from 'axios'
import { dayjs } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const date = dayjs().hour() < 9 ? dayjs().subtract(1, 'day').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')

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
        TIME_START_PLAN: dayjs(item.TIME_START_PLAN).format('YYYY-MM-DD HH:mm:ss'),
        TIME_TERMINAL_PLAN: dayjs(item.TIME_TERMINAL_PLAN).format('YYYY-MM-DD HH:mm:ss')
      }));

      await axios.get("/api/statistics/flightInfo").then(res => {
        const checkData = res.data.obj;
        if (checkData.length != 0) {
          tableData.value.forEach(item => {
            checkData.forEach(checkItem => {
              if (item.FLIGHT_NO_FULL == checkItem.inFlightNo && item.TIME_START_PLAN == dayjs(checkItem.timeStartPlan).format('YYYY-MM-DD HH:mm:ss')) {
                item.PASSENGER_COUNT_WEB = checkItem.passengerTotal ? checkItem.passengerTotal : '/';
                item.BAGGAGE_COUNT_WEB = checkItem.piece ? checkItem.piece : '/';
                item.PASSENGER_COUNT != checkItem.passengerTotal || item.BAGGAGE_COUNT != checkItem.piece ? item.warningStyle = true : null;
              }
            })
          })
          const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          tableData.value.forEach(item => {
            item.PASSENGER_COUNT ? null : item.TIME_START_PLAN <= currentTime ? item.PASSENGER_COUNT = '/' : null;
            item.BAGGAGE_COUNT ? null : item.TIME_START_PLAN <= currentTime ? item.BAGGAGE_COUNT = '/' : null;
            item.PASSENGER_COUNT_WEB ? null : item.TIME_START_PLAN <= currentTime ? item.PASSENGER_COUNT_WEB = '/' : null;
            item.BAGGAGE_COUNT_WEB ? null : item.TIME_START_PLAN <= currentTime ? item.BAGGAGE_COUNT_WEB = '/' : null;
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
    // 1. 加载模板
    const response = await fetch('/template.xlsx')
    const arrayBuffer = await response.arrayBuffer()

    // 2. 读取模板文件
    const workbook = XLSXStyle.read(arrayBuffer, { type: 'array', cellStyles: true })

    // 3. 定义居中样式
    const centerStyle = {
      alignment: {
        horizontal: "center",
        vertical: "center"
      },
      // 保留模板原有边框样式（根据实际模板调整）
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    // 4. 获取工作表
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // 5. 创建带样式的单元格
    const createCell = (value, isWarning = false) => {
      const style = isWarning 
        ? { ...centerStyle, fill: { fgColor: { rgb: "FFFF0000" } } }
        : centerStyle
        
      return {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: style
      }
    }

    // 6. 填充数据
    tableData.value.forEach((item, index) => {
      const row = index + 7 // 从第7行开始填充数据
      const isWarningRow = item.warningStyle

      // 创建单元格对象
      const cells = {
        // A: createCell(''), // 空列
        B: createCell(item.FLIGHT_NO_FULL, isWarningRow),
        C: createCell(item.ATTRIBUTE, isWarningRow),
        D: createCell(item.TIME_START_PLAN, isWarningRow),
        E: createCell(item.TIME_TERMINAL_PLAN, isWarningRow),
        F: createCell(item.AIRPORT_START, isWarningRow),
        G: createCell(item.PASSENGER_COUNT, isWarningRow),
        H: createCell(item.BAGGAGE_COUNT, isWarningRow),
        I: createCell(item.PASSENGER_COUNT_WEB, isWarningRow),
        J: createCell(item.BAGGAGE_COUNT_WEB, isWarningRow)
      }

      // 将单元格加入工作表
      Object.entries(cells).forEach(([col, cell]) => {
        const cellAddress = XLSXStyle.utils.encode_cell({ c: col.charCodeAt(0) - 65, r: row })
        worksheet[cellAddress] = cell
      })
    })

    // 7. 处理合并单元格的样式
    if (worksheet['!merges']) {
      worksheet['!merges'].forEach(merge => {
        for (let r = merge.s.r; r <= merge.e.r; r++) {
          for (let c = merge.s.c; c <= merge.e.c; c++) {
            const cellAddress = XLSXStyle.utils.encode_cell({ r, c })
            console.log(cellAddress)
            if (!worksheet[cellAddress]) continue
            worksheet[cellAddress].s = { 
              ...worksheet[cellAddress].s,
              ...centerStyle 
            }
          }
        }
      })
    }

    // 8. 生成文件并保存
    const wbout = XLSXStyle.write(workbook, {
      bookType: 'xlsx',
      type: 'binary',
      bookSST: true
    })

    // 二进制转换函数
    const s2ab = s => {
      const buf = new ArrayBuffer(s.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
      return buf
    }

    FileSaver.saveAs(
      new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
      `${date}通程行李检查单.xlsx`
    )

    ElMessage.success("导出成功！")
  } catch (error) {
    console.error("导出失败:", error)
    ElMessage.error("导出失败，请检查模板文件！")
  }
}

const tableRowClassName = ({ row }) => {
  if (row.warningStyle) {
    return 'warning-row';
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
            <el-table id="educe-table" :data="tableData" stripe highlight-current-row
              :row-class-name="tableRowClassName" empty-text="暂无行李数据">
              <el-table-column prop="FLIGHT_NO_FULL" label="航班号" />
              <el-table-column prop="ATTRIBUTE" label="属性" />
              <el-table-column prop="TIME_START_PLAN" label="计划起飞时间" min-width="120px" sortable />
              <el-table-column prop="TIME_TERMINAL_PLAN" label="计划到港时间" min-width="120px" />
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

<style>
.el-table .warning-row {
  color: red;
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
</style>