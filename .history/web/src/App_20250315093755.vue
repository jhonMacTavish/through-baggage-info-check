<!--
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-15 09:37:55
 * @FilePath: \passengerInfoSearch\web\src\App.vue
-->
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Header from './components/Header.vue'
import axios from 'axios'
import { dayjs } from 'element-plus'

const passengerData = ref([])
const verifyData = ref([])
const loading = ref(false)
const photoPreviewVisible = ref(false)

// 防抖处理查询
const queryPassenger = async (params) => {
  try {
    loading.value = true
    const { data } = await axios.get("/api/queryPassenger", { params })
    passengerData.value = data.data.map(item => ({
      ...item,
      CHECKIN_TIME: dayjs(item.CHECKIN_TIME).format('YYYY-MM-DD HH:mm:ss')
    }))
  } catch (error) {
    ElMessage.error(`查询失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const queryVerify = async (row) => {
  try {
    const time = dayjs().diff(row.FLIGHT_DATE, 'day')
    const { data } = await axios.get("/api/queryVerify", {
      params: {
        PASSENGER_ID: row.ID,
        time
      }
    })
    console.log(data);
    console.log(data.length == 0);
    if (data.data.length == 0) {
      ElMessage.warning(`该旅客没有过检信息`)
    } else {
      verifyData.value = data.data.map(item => ({
        ...item,
        VERIFY_TIME: dayjs(item.VERIFY_TIME).format('YYYY-MM-DD HH:mm:ss'),
        BOARD_TIME: dayjs(item.BOARD_TIME).format('YYYY-MM-DD HH:mm:ss')
      }))
    }
  } catch (error) {
    ElMessage.error(`验证信息获取失败: ${error.message}`)
  }
}

const reset = () => {
  passengerData.value = []
  verifyData.value = []
}
</script>

<template>
  <div class="container">
    <el-container>
      <!-- 头部区域 -->
      <el-header class="header-wrapper">
        <el-card shadow="hover" class="header-card">
          <Header @emitSearch="queryPassenger" @emitReset="reset" />
        </el-card>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="main-wrapper">
        <!-- 乘客信息卡片 -->
        <el-card shadow="hover" class="table-card">
          <el-skeleton :loading="loading" :rows="6" animated>
            <el-table :data="passengerData" stripe highlight-current-row @row-click="queryVerify" empty-text="暂无乘客数据">
              <el-table-column label="姓名" width="120">
                <template #default="scope">
                  <el-button link type="primary" class="name-btn" @click.stop="queryVerify(scope.row)">
                    {{ scope.row.NAME }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="FLIGHT_NO" label="航班号" min-width="110" />
              <el-table-column prop="ID_CARD" label="身份证号" min-width="180" />
              <el-table-column prop="TERMINALL" label="航站楼" width="100" />
              <el-table-column prop="CHECKIN_TIME" label="值机时间" width="160" sortable />
              <el-table-column prop="CHECKIN_WAY" label="值机方式" width="100" />
              <el-table-column prop="BAGGAGE_NUM" label="行李数量" width="90" align="center" />
              <el-table-column prop="CHECKIN_AGENT" label="值机代理" min-width="120" />
              <el-table-column prop="CHECKIN_OFFCIE" label="值机柜台" width="110" />
            </el-table>
          </el-skeleton>
        </el-card>

        <!-- 分隔线 -->
        <el-divider class="custom-divider">
          <el-icon><arrow-down /></el-icon>
          <span class="divider-text">验证信息</span>
        </el-divider>

        <!-- 验证信息卡片 -->
        <el-card shadow="hover" class="table-card">
          <el-table :data="verifyData" empty-text="点击上方乘客姓名查看验证信息">
            <el-table-column prop="CARD_NAME" label="证件名称" width="120" />
            <el-table-column prop="FLIGHT_NO" label="航班号" width="110" />
            <el-table-column prop="CHANNEL" label="验证通道" width="120" />
            <el-table-column prop="VERIFY_TIME" label="验证时间" width="160" />
            <el-table-column prop="GATE" label="登机口" width="100" />
            <el-table-column prop="BOARD_TIME" label="登机时间" width="160" />
            <el-table-column label="证件照片">
              <template #default="scope">
                <el-image style="width: 100px; height: 100px" :src="`http://10.33.113.23:8002${scope.row.PASS_PHOTO}`"
                  :zoom-rate="1.2" :max-scale="7" :min-scale="0.2"
                  :preview-src-list="[`http://10.33.113.23:8002${scope.row.PASS_PHOTO}`]" show-progress
                  :initial-index="4" fit="cover" :z-index="9">
                  <template #error>
                    <div class="image-error">
                      <el-icon>
                        <picture />
                      </el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
              </template>
            </el-table-column>
          </el-table>
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
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
    border: none;
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