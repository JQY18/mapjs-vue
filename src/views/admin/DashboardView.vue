<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <div class="stat-cards">
      <el-card v-for="stat in statistics" :key="stat.title" class="stat-card">
        <template #header>
          <div class="card-header">
            <el-icon class="icon" :class="stat.type">
              <component :is="stat.icon" />
            </el-icon>
            <span>{{ stat.title }}</span>
          </div>
        </template>
        <div class="card-content">
          <div class="number">{{ stat.value }}</div>
          <div class="trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ Math.abs(stat.trend) }}% 较上周
            <el-icon><component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>访问趋势</span>
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart" ref="visitChart"></div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>地点分布</span>
          </div>
        </template>
        <div class="chart" ref="locationChart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  Location,
  View,
  ChatDotRound,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

const timeRange = ref('week')

const statistics = ref([
  {
    title: '总用户数',
    value: '1,234',
    trend: 12.5,
    icon: 'User',
    type: 'primary'
  },
  {
    title: '地点总数',
    value: '56',
    trend: 8.2,
    icon: 'Location',
    type: 'success'
  },
  {
    title: '今日访问',
    value: '3,456',
    trend: -2.1,
    icon: 'View',
    type: 'warning'
  },
  {
    title: '评论数',
    value: '789',
    trend: 15.4,
    icon: 'ChatDotRound',
    type: 'danger'
  }
])

onMounted(() => {
  // 初始化访问趋势图表
  const visitChart = echarts.init(document.querySelector('.chart'))
  visitChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }]
  })

  // 初始化地点分布图表
  const locationChart = echarts.init(document.querySelectorAll('.chart')[1])
  locationChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 20, name: '教学楼' },
          { value: 5, name: '图书馆' },
          { value: 10, name: '食堂' },
          { value: 15, name: '宿舍' },
          { value: 6, name: '体育场所' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
})
</script>

<style scoped lang="scss">
.dashboard {
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .stat-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon {
      font-size: 20px;
      
      &.primary { color: #409eff; }
      &.success { color: #67c23a; }
      &.warning { color: #e6a23c; }
      &.danger { color: #f56c6c; }
    }

    .card-content {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .number {
      font-size: 24px;
      font-weight: bold;
    }

    .trend {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &.up { color: #67c23a; }
      &.down { color: #f56c6c; }
    }
  }

  .charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart {
      height: 300px;
    }
  }
}
</style> 