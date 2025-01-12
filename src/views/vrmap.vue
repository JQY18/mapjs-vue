<template>
  <div class="vr-map">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <Icon icon="mdi:arrow-left" /> 返回
      </button>
      <h1>{{ currentLocation?.name || 'VR全景' }}</h1>
    </div>

    <div class="vr-container">
      <div id="panorama" class="vr-view"></div>
      <div v-if="!currentLocation" class="no-vr">
        请选择要查看的地点
      </div>
    </div>

    <div class="location-selector">
      <select v-model="selectedLocationId" @change="handleLocationChange">
        <option value="">选择地点</option>
        <option v-for="location in locations" 
                :key="location.id" 
                :value="location.id">
          {{ location.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const selectedLocationId = ref('')
const isDragging = ref(false)

// 示例位置数据
const locations = [
  {
    id: 'library',
    name: '逸夫图书馆',
    front: '/vr/front.jpg',
    right: '/vr/right.jpg',
    back: '/vr/back.jpg',
    left: '/vr/left.jpg',
    up: '/vr/up.jpg',
    down: '/vr/down.jpg'
  },
  {
    id: 'zhishanlou',
    name: '至善楼',
    vrView: '/vr/zhishanlou.jpg'
  },
  // 添加更多位置...
]

const currentLocation = computed(() => 
  locations.find(loc => loc.id === selectedLocationId.value)
)

let viewer = null

const handleLocationChange = () => {
  if (!window.pannellum) return
  
  // 如果已存在viewer，先销毁
  if (viewer) {
    viewer.destroy()
  }
  
  // 创建新的viewer
  if (currentLocation.value) {
    viewer = pannellum.viewer('panorama', {
      type: 'cubemap',
      cubeMap: [
        currentLocation.value.front,
        currentLocation.value.right,
        currentLocation.value.back,
        currentLocation.value.left,
        currentLocation.value.up,
        currentLocation.value.down
      ],
      autoLoad: true,
      showZoomCtrl: true,
      mouseZoom: true,
      hfov: 110,
      pitch: 10,
      yaw: 180
    })
  }
}

const handleMouseDown = () => {
  isDragging.value = true
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 修改脚本加载函数
const addPannellumScripts = () => {
  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
    script.onload = resolve
    document.body.appendChild(script)
  })
}

onMounted(async () => {
  await addPannellumScripts()
  // 设置默认选中第一个位置
  selectedLocationId.value = locations[0].id
  handleLocationChange()
})

// 监听位置变化
watch(selectedLocationId, () => {
  handleLocationChange()
})

// 组件销毁时清理
onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
  }
})
</script>

<style scoped>
.vr-map {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.vr-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

.vr-view {
  width: 100%;
  height: 100%;
}

.no-vr {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
}

.location-selector {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.location-selector select {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.location-selector select option {
  background: #000;
  color: white;
}
</style>
