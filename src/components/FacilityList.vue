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

// 这里后续会根据实际数据进行修改
onMounted(() => {
  // 模拟数据，后续替换为真实数据
  facilities.value = []
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
}

.facility-list-item:hover {
  background: #f5f5f5;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
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
</style> 