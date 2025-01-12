<template>
  <div v-if="show" class="popup-modal" :style="popupStyle" @click.self="$emit('close')">
    <div class="popup-content" :class="{ 'location-mode': !isLocateMode }" @click.stop>
      <button class="close-button" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>
      
      <template v-if="!isLocateMode">
        <div class="location-image" @click="goToDetail">
          <img :src="location?.image" :alt="location?.name" />
          <div class="image-overlay">点击查看详情</div>
        </div>
        
        <div class="location-info">
          <h2>{{ location?.name }}</h2>
          <p>{{ location?.description }}</p>
        </div>
        
        <div class="action-buttons">
          <button class="detail-button" @click="goToDetail">
            查看详细信息
          </button>
          <button class="route-button" @click="planRoute">
            规划路线
          </button>
          <button class="vr-button" @click="goToVR">
            <Icon icon="mdi:panorama" class="button-icon" />
            VR全景
          </button>
        </div>

        <div class="route-action-buttons">
          <button class="start-button" @click="setAsStart">
            <Icon icon="mdi:flag-outline" class="button-icon" />
            从这出发
          </button>
          <button class="end-button" @click="setAsEnd">
            <Icon icon="mdi:flag-checkered" class="button-icon" />
            到这去
          </button>
        </div>
      </template>

      <template v-else>
        <div class="locate-mode-content">
          <h3>找到最近的位置点</h3>
          <p>是否从{{ location?.name }}出发规划路线？</p>
          <div class="locate-buttons">
            <button class="confirm-button" @click="setAsStart">
              <Icon icon="mdi:flag-outline" class="button-icon" />
              确定
            </button>
            <button class="cancel-button" @click="$emit('close')">
              取消
            </button>
          </div>
        </div>
      </template>
      
      <div class="popup-arrow"></div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  location: Object,
  clickPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  isLocateMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'plan-route', 'set-start', 'set-end'])

const router = useRouter()

// 计算弹窗位置
const popupStyle = computed(() => {
  const { x, y } = props.clickPosition
  return {
    left: `${x}px`,
    top: `${y - 10}px`, // 向上偏移10px，为箭头留出空间
  }
})

const goToDetail = () => {
  if (props.location?.detailId) {
    router.push(`/location/${props.location.detailId}`)
  }
}

const planRoute = () => {
  emit('plan-route')
}

const setAsStart = () => {
  emit('set-start', props.location)
  emit('close')
  router.push({
    path: '/',
    query: {
      openRoute: 'true',
      startPoint: props.location.name
    }
  })
}

const setAsEnd = () => {
  emit('set-end', props.location)
  emit('close')
  router.push({
    path: '/',
    query: {
      openRoute: 'true',
      endPoint: props.location.name
    }
  })
}

const goToVR = () => {
  // 获取当前地点的 ID
  const locationId = props.location?.id || props.location?.detailId
  
  if (!locationId) {
    console.warn('未找到地点ID，无法跳转到VR图')
    return
  }

  // 根据地点 ID 映射到 VR 文件夹名称
  const vrLocationMap = {
    'library': 'library',
    'erliban': 'erliban',
    'xiaomen': 'gate',
    'byPlayground': 'playground',
    'zhonghelou': 'zhonghe',
    'zhonglieci': 'zhonglieci',
    'yuewangting': 'yuewangting',
    'zhishanlou': 'zhishan'
    // 添加更多地点映射...
  }

  const vrLocation = vrLocationMap[locationId]
  
  if (!vrLocation) {
    console.warn('该地点暂无VR全景图')
    return
  }

  router.push({
    path: '/vr',
    query: { 
      location: vrLocation
    }
  })
  emit('close')
}
</script>

<script>
export default {
  name: 'LocationModal'
}
</script>

<style scoped>
.popup-modal {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
}

.popup-content {
  background: white;
  border-radius: 8px;
  width: 300px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: relative;
}

.popup-content.location-mode {
  width: 300px;
}

/* 定位模式的样式 */
.locate-mode-content {
  padding: 10px 5px;
}

.locate-mode-content h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.locate-mode-content p {
  margin: 10px 0;
  color: #666;
}

.locate-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.confirm-button,
.cancel-button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.confirm-button {
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.confirm-button:hover {
  background: #40a9ff;
}

.cancel-button {
  background: #f5f5f5;
  color: #666;
}

.cancel-button:hover {
  background: #e8e8e8;
}

/* 其他样式保持不变 */
.popup-arrow {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid white;
}

.close-button {
  position: absolute;
  right: 8px;
  top: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #666;
  z-index: 10;
  padding: 4px;
}

.location-image {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 6px;
  height: 150px;
  margin-top: 15px;
}

.location-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.location-image:hover .image-overlay {
  transform: translateY(0);
}

.location-info {
  margin: 15px 0;
}

.location-info h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2em;
}

.location-info p {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.action-buttons button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.detail-button {
  background: #3388ff;
  color: white;
}

.route-button {
  background: #4CAF50;
  color: white;
}

.route-action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.start-button,
.end-button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s;
  font-size: 0.9em;
}

.start-button {
  background: #e6f4ff;
  color: #1890ff;
}

.start-button:hover {
  background: #bae0ff;
}

.end-button {
  background: #f6ffed;
  color: #52c41a;
}

.end-button:hover {
  background: #d9f7be;
}

.button-icon {
  font-size: 16px;
}

.vr-button {
  background: #722ed1;
  color: white;
  transition: all 0.3s;
}

.vr-button:hover {
  background: #8c51e0;
}
</style> 