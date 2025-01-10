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

onMounted(() => {
  // 根据设施类型加载对应数据
  if (props.type.id === 'aed') {
    facilities.value = aedLocations
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