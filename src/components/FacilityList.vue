<template>
  <div class="facility-list-overlay" @click="$emit('close')">
    <div class="facility-list-container" @click.stop>
      <div class="facility-list-header">
        <div class="header-content">
          <Icon :icon="currentType.icon" class="header-icon" />
          <h3>{{ currentType.name }}</h3>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <Icon icon="mdi:close" />
        </button>
      </div>
      
      <div class="facility-items">
        <div v-if="facilities.length === 0" class="no-data">
          暂无数据
        </div>
        <div v-else v-for="facility in facilities" 
             :key="facility.id" 
             class="facility-list-item"
             @click="handleItemClick(facility)">
          <div class="item-info">
            <div class="item-name">{{ facility.name }}</div>
            <div class="item-desc">{{ facility.description }}</div>
          </div>
          <Icon icon="mdi:chevron-right" class="item-arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'select-facility'])

const currentType = ref(props.type)
const facilities = ref([])

// 添加 AED 设施数据
const aedLocations = [
  {
    id: 'aed-1',
    name: '红楼大厅',
    description: '位于红楼一楼大厅',
    coords: [28.19455, 112.94170]
  },
  {
    id: 'aed-2',
    name: '中和楼中厅',
    description: '位于中和楼中厅',
    coords: [28.1911, 112.9416]
  },
  {
    id: 'aed-3',
    name: '化工学院',
    description: '位于化学楼正门入口处',
    coords: [28.1911, 112.9430]
  },
  {
    id: 'aed-4',
    name: '兰桂苑食堂',
    description: '位于木兰路兰桂苑食堂中门入口处',
    coords: [28.1887, 112.94155]
  },
  {
    id: 'aed-5',
    name: '校医院',
    description: '位于校医院正门入口处',
    coords: [28.19005, 112.94010]
  },
  {
    id: 'aed-6',
    name: '至善楼',
    description: '位于至善楼大厅入口处',
    coords: [28.18765, 112.94228]
  },
  {
    id: 'aed-7',
    name: '图书馆',
    description: '位于图书馆正门入口处',
    coords: [28.1895, 112.9430]
  },
  {
    id: 'aed-8',
    name: '格物楼',
    description: '位于格物楼正门入口处',
    coords: [28.18705, 112.94497]
  },
  {
    id: 'aed-9',
    name: '体育场医务室',
    description: '位于体育场内医务室',
    coords: [28.19005, 112.94010]
  },
  {
    id: 'aed-10',
    name: '江边三舍',
    description: '位于江边三舍正门入口处',
    coords: [28.18990, 112.9485]
  }
]

// 添加食堂设施数据
const canteenLocations = [
  {
    id: 'canteen-1',
    name: '兰桂苑',
    description: '湖南师范大学兰桂苑食堂',
    coords: [28.1887, 112.94155]
  },
  {
    id: 'canteen-2',
    name: '木兰食堂',
    description: '湖南师范大学木兰食堂',
    coords: [28.18940, 112.94155]
  },
  {
    id: 'canteen-3',
    name: '江边食堂',
    description: '湖南师范大学江边食堂',
    coords: [28.19045, 112.9487]
  }
]
// 添加购物超市设施数据
const supermarketLocations = [
  {
    id: 'supermarket-1',
    name: '佳旺超市',
    description: '湖南师范大学兰桂苑食堂一楼',
    coords: [28.1887, 112.94155]
  },
  {
    id: 'supermarket-2',
    name: '**超市',
    description: '湖南师范大学校工会一楼',
    coords: [28.19165, 112.94243]
  }
]

// 添加校内医疗设施数据
const medicalLocations = [
  {
    id: 'medical-1',
    name: '校医院',
    description: '湖南师范大学校医院',
    coords: [28.19005, 112.94010]
  }
]

//添加校内场馆设施数据
const stadiumLocations = [
  {
    id: 'stadium-1',
    name: '江湾体育馆',
    description: '湖南师范大学江湾体育馆',
    coords: [28.18805, 112.9435]
  },
  {
    id: 'stadium-2',
    name: '田径场',
    description: '湖南师范大学田径场',
    coords: [28.18723, 112.94695]
  },
  {
    id: 'stadium-3',
    name: '天文馆',
    description: '湖南师范大学中和楼顶楼',
    coords: [28.19107, 112.94120]
  }
]

//添加停车场设施数据
const parkingLocations = [
  {
    id: 'parking-1',
    name: '停车场',
    description: '湖南师范大学停车场',
    coords: [28.19077, 112.94220]
    
  }
]

//添加银行设施数据
const bankLocations = [
  {
    id: 'bank-1',
    name: '中国银行',
    description: '湖南师范大学中国银行',
    coords: [28.19047, 112.94320]
  },
  {
    id: 'bank-2',
    name: '中国建设银行（长沙师大支行）',
    description: '湖南师范大学中国建设银行',
    coords: [28.19165, 112.94243]
  }
]

//添加打印店设施数据
const printLocations = [
  {
    id: 'print-1',
    name: '红梅图文',
    description: '红梅图文',
    coords: [28.19067, 112.94200]
  },
  {
    id: 'print-2',
    name: '师大打印室',
    description: '师大打印室',
    coords: [28.1890, 112.94140]
  },
  {
    id: 'print-3',
    name: '社区便民服务站（启航图文）',
    description: '社区便民服务站（启航图文）',
    coords: [28.1886, 112.94190]
  }
]

//添加通信营业厅设施数据
const communicationLocations = [
  {
    id: 'communication-1',
    name: '中国联通',
    description: '湖南师范大学中国联通',
    coords: [28.18970, 112.94228]
  },
  {
    id: 'communication-2',
    name: '中国电信',
    description: '湖南师范大学中国电信',
    coords: [28.18950, 112.94228]
  }
]

//添加学生宿舍设施数据
const dormitoryLocations = [
  {
    id: 'dormitory-1',
    name: '江边一舍',
    description: '湖南师范大学江边一舍',
    coords: [28.18880, 112.9484]
  },
  {
    id: 'dormitory-2',
    name: '江边二舍',
    description: '湖南师范大学江边二舍',
    coords: [28.18933, 112.9484]
  },
  {
    id: 'dormitory-3',
    name: '江边三舍',
    description: '湖南师范大学江边三舍',
    coords: [28.18990, 112.9485]
  },
  {
    id: 'dormitory-4',
    name: '研一舍',
    description: '湖南师范大学研一舍',
    coords: [28.18765, 112.94138]
  },
  {
    id: 'dormitory-5',
    name: '研二舍',
    description: '湖南师范大学研二舍',
    coords: [28.18815, 112.94135]
  },
  {
    id: 'dormitory-6',
    name: '研三舍',
    description: '湖南师范大学研三舍',
    coords: [28.18865, 112.94208]
  },
  {
    id: 'dormitory-7',
    name: '研五舍',
    description: '湖南师范大学研五舍',
    coords: [28.18950, 112.94208]
  },
  {
    id: 'dormitory-8',
    name: '研六舍',
    description: '湖南师范大学研六舍',
    coords: [28.18935, 112.94075]
  }
]

// 添加邮寄快递设施数据
const deliveryLocations = [
  {
    id: 'delivery-1',
    name: '顺丰速运',
    description: '湖南师范大学顺丰速运',
    coords: [28.18915, 112.94055]
  },
  {
    id: 'delivery-2',
    name: '申通快递',
    description: '湖南师范大学圆通速递',
    coords: [28.18915, 112.94085]
  },
  {
    id: 'delivery-3',
    name: '学堂坡快递驿站',
    description: '湖南师范大学学堂坡快递驿站',
    coords: [28.1895, 112.94470]
  }
]

// 添加出入口设施数据
const entranceLocations = [
  {
    id: 'entrance-1',
    name: '校门',
    description: '湖南师范大学校门',
    coords: [28.19230, 112.94302]
  }
]

onMounted(() => {
  // 根据设施类型加载对应数据
  if (props.type.id === 'aed') {
    facilities.value = aedLocations
  } else if (props.type.id === 'canteen') {
    facilities.value = canteenLocations
  } else if (props.type.id === 'shop') {
    facilities.value = supermarketLocations
  } else if (props.type.id === 'medical') {
    facilities.value = medicalLocations
  } else if (props.type.id === 'stadium') {
    facilities.value = stadiumLocations
  } else if (props.type.id === 'parking') {
    facilities.value = parkingLocations
  } else if (props.type.id === 'bank') {
    facilities.value = bankLocations
  } else if (props.type.id === 'print') {
    facilities.value = printLocations
  } else if (props.type.id === 'telecom') {
    facilities.value = communicationLocations
  } else if (props.type.id === 'dormitory') {
    facilities.value = dormitoryLocations
  } else if (props.type.id === 'delivery') {
    facilities.value = deliveryLocations
  } else if (props.type.id === 'entrance') {
    facilities.value = entranceLocations
  } else {
    facilities.value = [] // 其他类型暂时显示为空
  }
})

const handleItemClick = (facility) => {
  emit('select-facility', facility)
}
</script>

<style scoped>
.facility-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.facility-list-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.facility-list-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 24px;
  color: rgb(107, 1, 1);
}

.header-content h3 {
  margin: 0;
  color: #333;
}

.facility-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.facility-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.facility-list-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.item-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.item-arrow {
  color: #999;
  font-size: 20px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 32px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

/* 添加紧急标识 */
.facility-list-item::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background-color: #ff4d4f;
  border-radius: 50%;
  margin-right: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}
</style> 