<template>
  <div class="dashboard">
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in stats" :key="stat.title">
          <el-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="stat-icon">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>访问统计</span>
                <el-radio-group v-model="visitTimeRange" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart" ref="visitChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>用户活跃度</span>
                <el-radio-group v-model="userTimeRange" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart" ref="userChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="recent-activities">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button type="text">查看全部</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="activity.type"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { User, Comment, Location, Picture } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const stats = [
  { title: '用户总数', value: '1,234', icon: 'User' },
  { title: '评论数', value: '5,678', icon: 'Comment' },
  { title: '地点数', value: '42', icon: 'Location' },
  { title: '媒体文件', value: '892', icon: 'Picture' }
]

// 图表相关
const visitChartRef = ref(null)
const userChartRef = ref(null)
const visitChart = ref(null)
const userChart = ref(null)
const visitTimeRange = ref('week')
const userTimeRange = ref('week')

// 最近活动
const recentActivities = [
  {
    id: 1,
    content: '新用户注册: 张三',
    time: '2024-01-20 10:00:00',
    type: 'success'
  },
  {
    id: 2,
    content: '新增评论: "图书馆环境真好"',
    time: '2024-01-20 09:30:00',
    type: 'info'
  },
  {
    id: 3,
    content: '更新地点信息: 图书馆',
    time: '2024-01-20 09:00:00',
    type: 'warning'
  }
]

// 初始化图表
const initCharts = () => {
  if (visitChartRef.value && userChartRef.value) {
    visitChart.value = echarts.init(visitChartRef.value)
    userChart.value = echarts.init(userChartRef.value)
    
    const visitOption = {
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
    }
    
    const userOption = {
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'bar'
      }]
    }
    
    visitChart.value.setOption(visitOption)
    userChart.value.setOption(userOption)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  visitChart.value?.resize()
  userChart.value?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dashboard {
  .stats-cards {
    margin-bottom: 24px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    
    .stat-icon {
      font-size: 48px;
      color: #1890ff;
      margin-right: 16px;
    }
    
    .stat-info {
      .stat-title {
        font-size: 14px;
        color: #666;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 500;
        color: #333;
        margin-top: 4px;
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;
    
    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart {
        height: 300px;
      }
    }
  }

  .recent-activities {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style> 