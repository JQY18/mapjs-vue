<template>
  <div class="vr-map">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <Icon icon="mdi:arrow-left" /> 返回
      </button>
      <h1>{{ currentLocation?.name || 'VR全景' }}</h1>
    </div>

    <div class="vr-container">
      <div id="vr-view" class="vr-view"></div>
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
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()
const selectedLocationId = ref('')
const isDragging = ref(false)

// 示例位置数据
const locations = [
  {
    id: 'library',
    name: '逸夫图书馆',
    vrFolder: 'library',  // 对应 public/vr1/library 文件夹
  },
  {
    id: 'erliban',
    name: '二里半',
    vrFolder: 'erliban',  // 对应 public/vr1/erliban 文件夹
  },
  {
    id: 'gate',
    name: '大门',
    vrFolder: 'gate',  // 对应 public/vr1/gate 文件夹
  },
  {
    id: 'playground',
    name: '操场',
    vrFolder: 'playground',  // 对应 public/vr1/playground 文件夹
  },
  {
    id: 'zhonghe',
    name: '中和楼',
    vrFolder: 'zhonghe',  // 对应 public/vr1/zhonghe 文件夹
  },
  {
    id: 'zhonglieci',
    name: '忠烈祠',
    vrFolder: 'zhonglieci',  // 对应 public/vr1/zhonglieci 文件夹
  },
  {
    id: 'yuewangting',
    name: '岳王亭',
    vrFolder: 'yuewangting',  // 对应 public/vr1/yuewangting 文件夹
  },
  {
    id: 'zhishan',
    name: '至善楼',
    vrFolder: 'zhishan',  // 对应 public/vr1/zhishan 文件夹
  },
  // ... 添加更多地点
]

// 添加文件名映射
const fileNameMap = {
  'mobile_b': 'back',
  'mobile_d': 'down',
  'mobile_f': 'front',
  'mobile_l': 'left',
  'mobile_r': 'right',
  'mobile_u': 'up'
}

const currentLocation = computed(() => 
  locations.find(loc => loc.id === selectedLocationId.value)
)

let viewer = null

const handleLocationChange = () => {
  if (!window.pannellum) return
  
  if (viewer) {
    viewer.destroy()
  }
  
  if (currentLocation.value) {
    const folder = currentLocation.value.vrFolder
    try {
      viewer = pannellum.viewer('vr-view', {
        type: 'cubemap',
        cubeMap: [
          `/vr1/${folder}/mobile_f.jpg`,
          `/vr1/${folder}/mobile_r.jpg`,
          `/vr1/${folder}/mobile_b.jpg`,
          `/vr1/${folder}/mobile_l.jpg`,
          `/vr1/${folder}/mobile_u.jpg`,
          `/vr1/${folder}/mobile_d.jpg`
        ],
        autoLoad: true,
        showZoomCtrl: true,
        mouseZoom: true,
        hfov: 110,
        pitch: 10,
        yaw: 180,
        horizonPitch: 0,
        horizonRoll: 0,
        autoRotate: -2,
        compass: true
      })
      
      // 添加加载错误处理
      viewer.on('error', function(e) {
        console.error('VR 加载错误:', e)
      })
    } catch (error) {
      console.error('VR 初始化错误:', error)
    }
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
    script.onload = () => {
      // 确保 DOM 已经准备好
      setTimeout(resolve, 100)
    }
    document.body.appendChild(script)
  })
}

onMounted(async () => {
  await addPannellumScripts()
  // 从 URL 参数获取地点 ID
  const locationId = route.query.location
  if (locationId) {
    selectedLocationId.value = locationId
  } else {
    // 如果没有指定地点，默认选择第一个
    selectedLocationId.value = locations[0].id
  }
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
  height: calc(100vh - 60px);
}

.vr-view {
  width: 100% !important;
  height: 100% !important;
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

:deep(.pnlm-container) {
  background: #000;
  width: 100% !important;
  height: 100% !important;
}
</style>
