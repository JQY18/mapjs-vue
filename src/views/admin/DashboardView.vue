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
            本周新增：{{ Math.abs(stat.trend) }} 
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
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  Location,
  View,
  ChatDotRound,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import request from '../../api/request'


const timeRange = ref('week')

const statistics = ref([
  {
    title: '总用户数',
    value: 0,
    trend: 0,
    icon: 'User',
    type: 'primary'
  },
  {
    title: '总地点数',
    value: 0,
    trend: 0,
    icon: 'Location',
    type: 'success'
  },
  {
    title: '总访问量',
    value: 0,
    trend: 0,
    icon: 'View',
    type: 'warning'
  }
])

onMounted(() => {
  request.get('/admin/dashboard/countUser').then(res => {
    statistics.value[0].value = res.data.data.userCount
    statistics.value[0].trend = res.data.data.userTrend
  })
  request.get('/admin/dashboard/countLocation').then(res => {
    statistics.value[1].value = res.data.data.locationCount
    statistics.value[1].trend = res.data.data.locationTrend
  })
  request.get('/visit/all').then(res => {
    statistics.value[2].value = res.data.data.visitCount
    statistics.value[2].trend = res.data.data.visitTrend
  })

  // 初始化访问趋势图表
  const visitChart = echarts.init(document.querySelector('.chart'))
  
  // 设置初始配置
  const initOption = {
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
      data: [],
      type: 'line',
      smooth: true
    }]
  }
  
  visitChart.setOption(initOption)

  const updateChartData = (range) => {
    const url = range === 'week' ? '/visit/week' : '/visit/month'
    const xAxisData = range === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
      : Array.from({ length: 30 }, (_, i) => i + 1) // 假设月数据为30天
    
    request.get(url).then(res => {
      visitChart.setOption({
        xAxis: {
          data: xAxisData
        },
        series: [{
          data: res.data.data
        }]
      })
    })
  }

  // 初始加载周数据
  updateChartData(timeRange.value)

  // 监听时间范围变化
  watch(timeRange, (newRange) => {
    updateChartData(newRange)
  })

  // 初始化地点分布图表
  const locationChart = echarts.init(document.querySelectorAll('.chart')[1])
  const locationChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      padding: 20
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  locationChart.setOption(locationChartOption)

  // 获取地点分布数据
  request.get('/locations').then(res => {
    if (res.data.code === 1) {
      // 按category分类统计数量
      const categoryCount = res.data.data.reduce((acc, item) => {
        const category = item.category || '其他'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
      
      // 转换为饼图所需的数据格式
      const pieData = Object.entries(categoryCount).map(([category, count]) => ({
        name: category,
        value: count
      }))

      locationChart.setOption({
        series: [{
          data: pieData
        }]
      })
    }
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