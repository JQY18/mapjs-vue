<template>
  <div class="map-container">
    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <Icon icon="ic:baseline-search" class="search-icon"/>
        <input 
          type="text" 
          placeholder="搜索校园地点..." 
          v-model="searchQuery"
          @focus="showSearchResults = true"
          @blur="handleSearchBlur"
        />
      </div>
      <div class="search-results" v-if="showSearchResults">
        <div v-if="filteredLocations.length">
          <div 
            v-for="location in filteredLocations" 
            :key="location.name"
            class="search-result-item"
            @mousedown="navigateToLocation(location)"
          >
            <Icon icon="mdi:map-marker" class="location-icon" />
            <div class="location-info">
              <div class="location-name">{{ location.name }}</div>
              <div class="location-desc">{{ location.description }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="searchHistory.length && !searchQuery" class="search-history">
          <div class="history-title">最近搜索</div>
          <div 
            v-for="name in searchHistory" 
            :key="name"
            class="search-result-item"
            @mousedown="() => {
              const location = locations.find(l => l.name === name)
              if (location) navigateToLocation(location)
            }"
          >
            <Icon icon="mdi:history" class="history-icon" />
            <span>{{ name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 路线规划面板 -->
    <div class="route-panel" v-if="showRoutePanel">
      <div class="route-header">
        <h3>路线规划</h3>
        <button class="close-btn" @click="showRoutePanel = false">
          <Icon icon="ic:baseline-close" />
        </button>
      </div>
      <div class="route-inputs">
        <div class="route-input">
          <Icon icon="ic:baseline-location-on" class="route-icon start" />
          <input 
            type="text" 
            v-model="startPoint"
            placeholder="选择起点..."
            @focus="showStartSuggestions = true"
            @blur="handleSuggestionBlur('start')"
          />
        </div>
        <div class="suggestions" v-if="showStartSuggestions && startSuggestions.length">
          <div 
            v-for="location in startSuggestions" 
            :key="location.name"
            class="suggestion-item"
            @mousedown="selectStart(location)"
          >
            {{ location.name }}
          </div>
        </div>
        <div class="route-input">
          <Icon icon="ic:baseline-flag" class="route-icon end" />
          <input 
            type="text" 
            v-model="endPoint"
            placeholder="选择终点..."
            @focus="showEndSuggestions = true"
            @blur="handleSuggestionBlur('end')"
          />
        </div>
        <div class="suggestions" v-if="showEndSuggestions && endSuggestions.length">
          <div 
            v-for="location in endSuggestions" 
            :key="location.name"
            class="suggestion-item"
            @mousedown="selectEnd(location)"
          >
            {{ location.name }}
          </div>
        </div>
      </div>
      <button 
        class="plan-route-btn" 
        @click="planRoute"
        :disabled="!selectedStart || !selectedEnd"
      >
        规划路线
      </button>
    </div>

    <!-- 地图控制按钮 -->
    <div class="map-controls">
      <button class="control-btn" @click="zoomIn" title="放大">
        <Icon icon="mdi:plus" class="function-icon"/>
      </button>
      <button class="control-btn" @click="zoomOut" title="缩小">
        <Icon icon="mdi:minus" class="function-icon"/>
      </button>
      <button class="control-btn" @click="resetView" title="返回学校">
        <Icon icon="mdi:home" class="function-icon"/>
      </button>
      <button class="control-btn" @click="showRoutePanel = true" title="路线规划">
        <Icon icon="mdi:routes" class="function-icon"/>
      </button>
      <!-- 保留项目，总体图标显示/隐藏 -->
      <!-- <button class="control-btn" @click="toggleMarkers" title="显示/隐藏地点">
        <Icon :icon="showMarkers ? 'mdi:map-marker-off' : 'mdi:map-marker'" class="function-icon"/>
      </button> -->
      <!-- 新增的分类触发器按钮和弹出按钮组 -->
      <div class="category-controls">
        <button class="control-btn trigger-btn" @click="toggleCategoryPanel" title="地点分类">
          <Icon :icon="isExpanded ? 'meteor-icons:chevron-right' : 'meteor-icons:chevron-left'" class="function-icon"/>
        </button>
        <div class="category-buttons" :class="{ 'show-buttons': showCategoryBtns }">
          <button 
            v-for="category in categories" 
            :key="category"
            class="control-btn category-btn"
            :class="{ active: selectedCategories.includes(category) }"
            :style="{ backgroundColor: categoryColors[category] }"
            @click="toggleCategory(category)"
            :title="category"
          >
            <Icon :icon="categoryButtonIcons[category]" class="function-icon white-icon"/>
          </button>
        </div>
      </div>
    </div>

    <div id="map" ref="mapRef"></div>

    <LocationModal
      v-if="showLocationModal"
      :show="showLocationModal"
      :location="selectedLocation"
      @close="showLocationModal = false"
      @plan-route="handlePlanRoute"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.js'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import LocationModal from './LocationModal.vue'

// 重要地点数据
const locations = [
  { name: '兰桂苑', coords: [28.18875, 112.94125], description: '湖南师范大学学生兰桂苑', image: '/images/library.png', detailId: 'library', category: '食堂' },
  { name: '木兰食堂', coords: [28.18940, 112.94155], description: '湖南师范大学木兰食堂', image: '/images/library.png', detailId: 'library', category: '食堂' },
  // ... 其他位置数据保持不变
]

const mapRef = ref(null)
const map = ref(null)
const markers = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)

// 湖南师范大学的坐标
const HNNU_CENTER = [28.1875, 112.9440]
const INITIAL_ZOOM = 16

// 搜索结果过滤
const filteredLocations = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return locations.filter(location => 
    location.name.toLowerCase().includes(query) ||
    (location.description?.toLowerCase().includes(query) || false)
  ).slice(0, 5)
})

// 地图控制函数
const zoomIn = () => map.value?.zoomIn()
const zoomOut = () => map.value?.zoomOut()
const resetView = () => map.value?.setView(HNNU_CENTER, INITIAL_ZOOM)

// 添加搜索历史记录功能
const searchHistory = ref([])

const addToHistory = (location) => {
  const index = searchHistory.value.indexOf(location.name)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(location.name)
  if (searchHistory.value.length > 5) {
    searchHistory.value.pop()
  }
}

// 添加控制弹窗显示的响应式变量
const showLocationModal = ref(false)
const selectedLocation = ref(null)

const navigateToLocation = (location) => {
  map.value?.setView(location.coords, 18)
  markers.value.forEach(marker => {
    if (marker.getLatLng().equals(location.coords)) {
      marker.openPopup()
    }
  })
  addToHistory(location)
  showSearchResults.value = false
  searchQuery.value = location.name
  selectedLocation.value = location
  showLocationModal.value = true
}

const handleSearchBlur = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

// 添加新的响应式变量
const showRoutePanel = ref(false)
const startPoint = ref('')
const endPoint = ref('')
const showStartSuggestions = ref(false)
const showEndSuggestions = ref(false)
const selectedStart = ref(null)
const selectedEnd = ref(null)


// 添加建议列表计算属性
const startSuggestions = computed(() => {
  if (!startPoint.value) return []
  return locations.filter(location => 
    location.name.toLowerCase().includes(startPoint.value.toLowerCase())
  )
})

const endSuggestions = computed(() => {
  if (!endPoint.value) return []
  return locations.filter(location => 
    location.name.toLowerCase().includes(endPoint.value.toLowerCase())
  )
})

// 添加选择起点和终点的方法
const selectStart = (location) => {
  selectedStart.value = location
  startPoint.value = location.name
  showStartSuggestions.value = false
}

const selectEnd = (location) => {
  selectedEnd.value = location
  endPoint.value = location.name
  showEndSuggestions.value = false
}

const handleSuggestionBlur = (type) => {
  setTimeout(() => {
    if (type === 'start') {
      showStartSuggestions.value = false
    } else {
      showEndSuggestions.value = false
    }
  }, 200)
}

// 清除现有路线
const clearRoute = () => {
  if (routingControl.value) {
    map.value?.removeControl(routingControl.value)
    routingControl.value = null
  }
}

// 添加路由控制变量
const routingControl = ref(null)

// 修改 planRoute 函数以不使用 nearest API
const planRoute = () => {
  if (!selectedStart.value || !selectedEnd.value || !map.value) return;

  clearRoute();

  const control = L.Routing.control({
    waypoints: [
      L.latLng(selectedStart.value.coords[0], selectedStart.value.coords[1]),
      L.latLng(selectedEnd.value.coords[0], selectedEnd.value.coords[1])
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot',
      options: {
      continue_straight: true // 尽量避免掉头
    }
    }),
    lineOptions: {
      styles: [{ color: '#3388ff', weight: 6, opacity: 0.7, dashArray: '10, 10' }]
    },
    createMarker: () => null,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    show: false
  });

  routingControl.value = control;
  control.addTo(map.value);
}

// 添加样式
const customizeRoutingControl = () => {
  const routingContainer = document.querySelector('.leaflet-routing-container')
  if (routingContainer) {
    routingContainer.classList.add('custom-routing')
  }
}

// 在组件卸载时清理
onUnmounted(() => {
  clearRoute()
})

// 在 script 部分添加自定义图标定义
const categoryIcons = {
  '宿舍': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  '食堂': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  '文化风景': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  '教学科研': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  '行政': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  '重要场馆': L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// 修改类别图标映射
const categoryButtonIcons = {
  '宿舍': 'mdi:bed',
  '食堂': 'mdi:food-fork-drink',
  '文化风景': 'mdi:leaf',
  '教学科研': 'mdi:book-open-page-variant',
  '行政': 'mdi:domain',
  '重要场馆': 'mdi:bank'
};

onMounted(() => {
  // 修复 Leaflet 默认图标路径问题
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
  })

  if (mapRef.value) {
    // 计算所有标记点的边界
    const bounds = L.latLngBounds(locations.map(loc => loc.coords))
    
    // 初始化地图，设置最小缩放级别
    const mapInstance = L.map(mapRef.value, {
      attributionControl: false,
      minZoom: 17,
      maxBounds: bounds.pad(0.05),
      maxBoundsViscosity: 1.0
    }).setView(HNNU_CENTER, INITIAL_ZOOM)
    
    map.value = mapInstance

    // 添加图层
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance)

    // 添加标记
    locations.forEach(location => {
      const marker = L.marker(location.coords, {
        icon: categoryIcons[location.category]
      })
        .addTo(mapInstance)
        .on('click', () => {
          selectedLocation.value = location
          showLocationModal.value = true
        })
      markers.value.push(marker)
    })

    mapInstance.zoomControl.setPosition('bottomright')
  }
})

const handlePlanRoute = () => {
  if (selectedLocation.value) {
    showLocationModal.value = false
    showRoutePanel.value = true
    selectedStart.value = null
    selectedEnd.value = selectedLocation.value
    endPoint.value = selectedLocation.value.name
  }
}

const showMarkers = ref(true)

const toggleMarkers = () => {
  showMarkers.value = !showMarkers.value
  markers.value.forEach(marker => {
    if (showMarkers.value) {
      marker.addTo(map.value)
    } else {
      marker.removeFrom(map.value)
    }
  })
}


// 添加分类相关的变量
const categories = ['宿舍', '食堂', '文化风景', '教学科研', '行政', '重要场馆']

const categoryColors = {
  '宿舍': '#FF4444',
  '食堂': '#FFA500',
  '文化风景': '#4CAF50',
  '教学科研': '#2196F3',
  '行政': '#9C27B0',
  '重要场馆': '#FFD700'
};

const selectedCategories = ref(categories.slice())
const showCategoryBtns = ref(false)

// 添加分类切换方法
const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
  
  markers.value.forEach((marker, index) => {
    const location = locations[index]
    if (selectedCategories.value.includes(location.category)) {
      marker.addTo(map.value)
    } else {
      marker.removeFrom(map.value)
    }
  })
}

// 添加新的响应式变量控制图标状态
const isExpanded = ref(false)

// 修改触发器按钮的点击处理方法
const toggleCategoryPanel = () => {
  showCategoryBtns.value = !showCategoryBtns.value
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
  margin: 0;
  padding: 0;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-btn {
  background: white;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #666;
  position: relative;
}

.control-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
}

:deep(.leaflet-control-attribution) {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.search-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  width: 300px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

input:focus {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


.search-results {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.location-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.location-name {
  font-weight: 500;
}

.location-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.location-icon, .history-icon {
  color: #666;
  font-size: 18px;
  margin-right: 4px;
}

.history-title {
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
  background-color: #f5f5f5;
}

.search-history {
  background: white;
  border-radius: 8px;
  padding: 8px 0;
}

:deep(.leaflet-control-container) {
  z-index: 1000;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

:deep(.leaflet-control-zoom a) {
  border-radius: 8px !important;
  margin-bottom: 5px !important;
}

.route-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 320px;
  padding: 16px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}

.route-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.route-inputs {
  display: flex;
  padding-right: 40px;
  flex-direction: column;
  gap: 12px;
  width: 78%;
}

.route-input {
  position: relative;
  width: 100%;
}

.route-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.route-icon.start {
  color: #4CAF50;
}

.route-icon.end {
  color: #f44336;
}

.route-input input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #eee;
  border-radius: 6px;
  font-size: 14px;
}

.suggestions {
  position: absolute;
  width: 90%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  z-index: 1001;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.plan-route-btn {
  width: 90%;
  background: #3388ff;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
}

.plan-route-btn:hover {
  background: #2979ff;
}

.plan-route-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

:deep(.leaflet-routing-container) {
  display: none;
}

:deep(.leaflet-routing-alt) {
  max-height: none;
}

:deep(.leaflet-routing-geocoder) {
  margin: 0;
}

.function-icon {
  font-size: 24px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 修改分类按钮组的样式 */
.category-controls {
  position: relative;
}

.category-buttons {
  position: absolute;
  right: 50px; /* 修改为向左展开 */
  top: 0;
  display: flex;
  flex-direction: row; /* 改为水平排列 */
  gap: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  transform: translateX(20px); /* 添加位移效果 */
}

.show-buttons {
  opacity: 1;
  visibility: visible;
  transform: translateX(0); /* 展开时恢复位置 */
}

.category-btn {
  color: white;
  transition: all 0.3s ease;
}

.category-btn:hover {
  transform: scale(1.1);
}

.category-btn.active {
  box-shadow: 0 0 0 2px white;
}

.trigger-btn {
  z-index: 1;
}
</style>
