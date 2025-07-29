<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-27 10:00:48
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-07-25 12:09:35
 * @FilePath: \through-baggage-webe:\projects_vscode\company\through-baggage-info-check\web\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs'
import * as XLSXStyle from 'xlsx-js-style';
import axios from 'axios'
// import { dayjs } from 'element-plus'
dayjs.extend(isBetween);

const tableData = ref([])
const loading = ref(false)
console.log(dayjs().hour(), dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
const date = dayjs().hour() < 9 ? dayjs().subtract(1, 'day').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')

function isWithinPast24Hours(time) {
  const now = dayjs();
  const target = dayjs(time);
  const diffInMs = now.diff(target);

  const currentHour = dayjs().hour()
  const isMorningPeriod = currentHour < 9

  return diffInMs > 0 && diffInMs < 24 * 60 * 60 * 1000;
}

function isTargetInRange(targetTime) {
  const now = dayjs();
  const today9am = now.startOf('day').add(9, 'hour');

  let start, end;

  if (now.isBefore(today9am)) {
    // 当前时间在今日9点前，判断目标是否在 [昨天9点, 今天9点]
    start = today9am.subtract(1, 'day');
    end = today9am;
  } else {
    // 当前时间在今日9点后，判断目标是否在 [今天9点, 明天9点]
    start = today9am;
    end = today9am.add(1, 'day');
  }

  // 使用 isBetween 判断，并包含边界值
  return dayjs(targetTime).isBetween(start, end, null, '[]');
}

const getData = async () => {
  try {
    let { data } = await axios.get("/api/queryThroughBaggageInfo");
    if (data.data.length == 0) {
      ElMessage.warning(`没有通程行李信息`)
      reset()
    } else {
      console.log(data);
      tableData.value.length = 0
      data.data.forEach(item => {
        let obj = {
          ...item,
          TIME_START_PLAN: dayjs(item.TIME_START_PLAN).format('YYYY-MM-DD HH:mm:ss'),
          TIME_TERMINAL_PLAN: dayjs(item.TIME_TERMINAL_PLAN).format('YYYY-MM-DD HH:mm:ss')
        }

        if (isTargetInRange(obj.TIME_START_PLAN)) {
          tableData.value.push(obj)
        } else {
          return null
        }
      });

      let res = await axios.get("/api/statistics/flightInfo")
      const webData = res.data.obj;
      console.log(webData);
      if (webData.length != 0) {
        tableData.value.forEach(item => {
          webData.forEach(webItem => {
            if (item.FLIGHT_NO_FULL == webItem.inFlightNo && item.TIME_START_PLAN == dayjs(webItem.timeStartPlan).format('YYYY-MM-DD HH:mm:ss')) {
              item.PASSENGER_COUNT = item.PASSENGER_COUNT == webItem.passengerTotal ? item.PASSENGER_COUNT : webItem.passengerTotal;
              item.BAGGAGE_COUNT = item.BAGGAGE_COUNT == webItem.piece ? item.BAGGAGE_COUNT : webItem.piece;
              // item.PASSENGER_COUNT != webItem.passengerTotal || item.BAGGAGE_COUNT != webItem.piece ? item.warningStyle = true : '';
            }
          })
        })
      } else {
        ElMessage.warning(`没有通程航班`)
      }

      res = await axios.get("/flight/baggage")
      console.log(res);
      const json = JSON.parse(res.data)
      log("通程行李信息", json);
      const SSdata = json.data;
      console.log(SSdata);
      tableData.value.forEach(item => {
        SSdata.forEach(SSitem => {
          if (item.FLIGHT_NO_FULL == SSitem.flightNo && item.TIME_START_PLAN == dayjs(SSitem.timestartPlan).format('YYYY-MM-DD HH:mm:ss')) {
            item.PASSENGER_COUNT_SS = SSitem.tcLkCount;
            item.BAGGAGE_COUNT_SS = SSitem.tcPackageCount;
            item.PASSENGER_COUNT != SSitem.tcLkCount || item.BAGGAGE_COUNT != SSitem.tcPackageCount ? item.warningStyle = true : '';
          }
        })
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
      // border: {
      //   top: { style: 'thin' },
      //   bottom: { style: 'thin' },
      //   left: { style: 'thin' },
      //   right: { style: 'thin' }
      // }
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
      const row = index + 6 // 从第7行开始填充数据
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
        I: createCell(item.PASSENGER_COUNT_SS, isWarningRow),
        J: createCell(item.BAGGAGE_COUNT_SS, isWarningRow)
      }

      // 将单元格加入工作表
      Object.entries(cells).forEach(([col, cell]) => {
        const cellAddress = XLSXStyle.utils.encode_cell({ c: col.charCodeAt(0) - 65, r: row })
        worksheet[cellAddress] = cell
      })
    })

    // 7. 处理合并单元格的样式
    if (worksheet['!merges']) {
      console.log(worksheet);
      worksheet.C1.h = `${date}值班日通程数据提取检查`;
      worksheet.C1.r = `${date}值班日通程数据提取检查`;
      worksheet.C1.v = `${date}值班日通程数据提取检查`;
      worksheet.C1.w = `${date}值班日通程数据提取检查`;

      worksheet['!merges'].forEach(merge => {
        for (let r = merge.s.r; r <= merge.e.r; r++) {
          for (let c = merge.s.c; c <= merge.e.c; c++) {
            const cellAddress = XLSXStyle.utils.encode_cell({ r, c })
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
              <el-table-column prop="PASSENGER_COUNT_SS" label="旅客人数(盛视)" />
              <el-table-column prop="BAGGAGE_COUNT_SS" label="行李件数(盛视)" />
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