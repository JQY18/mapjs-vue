<template>
  <div class="map-container">
    <!-- 添加用户位置标记模板 -->
    <div v-if="userLocationMarker" class="user-location-wrapper" :style="userLocationStyle">
      <div class="user-location-dot">
        <div class="user-location-pulse"></div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <Icon icon="ic:baseline-search" class="search-icon" />
        <input type="text" placeholder="搜索校园地点..." v-model="searchQuery" @focus="showSearchResults = true"
          @blur="handleSearchBlur" />
        <!-- 添加麦克风按钮 -->
        <button 
          class="mic-button" 
          @click.stop="toggleVoiceRecognition"
          :class="{ 'recording': isRecording }"
          :disabled="isVoiceDisabled"
        >
          <Icon icon="mdi:microphone" class="mic-icon" />
        </button>
      </div>
      <div class="search-results" v-if="showSearchResults">
        <div v-if="filteredLocations.length">
          <div v-for="location in filteredLocations" :key="location.name" class="search-result-item"
            :class="{ 'highlighted': selectedLocation && selectedLocation.name === location.name }"
            @mousedown="navigateToLocation(location)">
            <Icon icon="mdi:map-marker" class="location-icon" />
            <div class="location-info">
              <div class="location-name">{{ location.name }}</div>
              <div class="location-desc">{{ location.description }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="searchHistory.length && !searchQuery" class="search-history">
          <div class="history-title">最近搜索</div>
          <div v-for="name in searchHistory" :key="name" class="search-result-item" @mousedown="() => {
            const location = locations.value.find(l => l.name === name)
            if (location) navigateToLocation(location)
          }">
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
        <button class="close-btn" @click="closeRoutePanel">
          <Icon icon="ic:baseline-close" />
        </button>
      </div>
      <div class="route-inputs">
        <div class="route-input">
          <Icon icon="ic:baseline-location-on" class="route-icon start" />
          <input type="text" v-model="startPoint" placeholder="选择起点..." @focus="showStartSuggestions = true"
            @blur="handleSuggestionBlur('start')" />
        </div>
        <div class="suggestions" v-if="showStartSuggestions && startSuggestions.length">
          <div v-for="location in startSuggestions" :key="location.name" class="suggestion-item"
            @mousedown="selectStart(location)">
            {{ location.name }}
          </div>
        </div>
        <div class="route-input">
          <Icon icon="ic:baseline-flag" class="route-icon end" />
          <input type="text" v-model="endPoint" placeholder="选择终点..." @focus="showEndSuggestions = true"
            @blur="handleSuggestionBlur('end')" />
        </div>
        <div class="suggestions" v-if="showEndSuggestions && endSuggestions.length">
          <div v-for="location in endSuggestions" :key="location.name" class="suggestion-item"
            @mousedown="selectEnd(location)">
            {{ location.name }}
          </div>
        </div>
      </div>
      <button class="plan-route-btn" @click="planRoute" :disabled="!selectedStart || !selectedEnd">
        规划路线
      </button>
      <div class="recommended-routes">
        <h4>推荐路线</h4>
        <div class="route-list">
          <div v-for="route in recommendedRoutes" :key="route.id" class="route-item"
            @click="selectRecommendedRoute(route)">
            <div class="route-name">{{ route.name }}</div>
            <div class="route-desc">{{ route.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图控制按钮 -->
    <div class="map-controls">
      <button class="control-btn" @click="zoomIn" title="放大">
        <Icon icon="mdi:plus" class="function-icon" />
      </button>
      <button class="control-btn" @click="zoomOut" title="缩小">
        <Icon icon="mdi:minus" class="function-icon" />
      </button>
      <button class="control-btn" @click="resetView" title="返回学校">
        <Icon icon="mdi:home" class="function-icon" />
      </button>
      <button class="control-btn" @click="showRoutePanel = true" title="路线规划">
        <Icon icon="mdi:routes" class="function-icon" />
      </button>
      <!-- 添加定位按钮 -->
      <button class="control-btn" @click="locateUser" :class="{ 'locating': isLocating }" title="定位">
        <Icon icon="mdi:crosshairs-gps" class="function-icon" />
      </button>
      <!-- 保留项目，总体图标显示/隐藏 -->
      <!-- <button class="control-btn" @click="toggleMarkers" title="显示/隐藏地点">
        <Icon :icon="showMarkers ? 'mdi:map-marker-off' : 'mdi:map-marker'" class="function-icon"/>
      </button> -->
      <!-- 新增的分类触发器按钮和弹出按钮组 -->
      <div class="category-controls">
        <button class="control-btn trigger-btn" @click="toggleCategoryPanel" title="地点分类">
          <Icon :icon="isExpanded ? 'meteor-icons:chevron-right' : 'meteor-icons:chevron-left'" class="function-icon" />
        </button>
        <div class="category-buttons" :class="{ 'show-buttons': showCategoryBtns }">
          <button v-for="category in categories" :key="category" class="control-btn category-btn"
            :class="{ active: selectedCategories.includes(category) }"
            :style="{ backgroundColor: categoryColors[category] }" @click="toggleCategory(category)" :title="category">
            <div class="category-btn-content">
              <Icon :icon="categoryButtonIcons[category]" class="function-icon white-icon" />
              <span class="category-text">{{ category }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div id="map" ref="mapRef"></div>

    <LocationModal v-if="showLocationModal" :show="showLocationModal" :location="selectedLocation"
      :clickPosition="modalPosition" @close="showLocationModal = false" @plan-route="handlePlanRoute" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.js'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import LocationModal from './LocationModal.vue'
import { useRoute } from 'vue-router'
import request from '../api/request';
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
const route = useRoute()
const router = useRouter()

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    if (query.openRoute === 'true') {
      showRoutePanel.value = true
      if (query.startPoint) {
        startPoint.value = query.startPoint
        selectedStart.value = locations.value.find(loc => loc.name === query.startPoint)
      }
      if (query.endPoint) {
        endPoint.value = query.endPoint
        selectedEnd.value = locations.value.find(loc => loc.name === query.endPoint)
      }
    }
  },
  { immediate: true }
)


// 重要地点数据
const locations = ref([
  // 食堂
  { name: '兰桂苑', coords: [28.1887, 112.94155], description: '湖南师范大学学生兰桂苑', image: '/images/library.png', detailId: 'lgyCanteen', category: '食堂' },
  { name: '木兰食堂', coords: [28.18940, 112.94155], description: '湖南师范大学木兰食堂', image: '/images/library.png', detailId: 'mlCanteen', category: '食堂' },
  { name: '江边食堂', coords: [28.19045, 112.9487], description: '湖南师范大学江边食堂', image: '/images/jbCanteen.jpg', detailId: 'jbCanteen', category: '食堂' },

  // 教学科研
  { name: '世承书院', coords: [28.19005, 112.94135], description: '湖南师范大学世承书院', image: '/images/shichengshuyuan.png', detailId: 'shichengshuyuan', category: '教学科研' },
  { name: '至善楼', coords: [28.18765, 112.94228], description: '湖南师范大学至善楼', image: '/images/zhishanlou.png', detailId: 'zhishanlou', category: '教学科研' },
  { name: '服装设计系', coords: [28.18615, 112.94148], description: '湖南师范大学服装设计系', image: '/images/designMajor.png', detailId: 'designMajor', category: '教学科研' },
  { name: '理仁楼', coords: [28.18565, 112.94078], description: '湖南师范大学理仁楼', image: '/images/lirenlou.png', detailId: 'lirenlou', category: '教学科研' },
  { name: '外国语学院', coords: [28.1905, 112.94110], description: '湖南师范大学外国语学院', image: '/images/waiguoyulou.png', detailId: 'waiguoyulou', category: '教学科研' },
  { name: '木兰楼', coords: [28.1903, 112.94226], description: '湖南师范大学木兰楼', image: '/images/mulanlou.png', detailId: 'mulanlou', category: '教学科研' },
  { name: '景德楼', coords: [28.1932, 112.94100], description: '湖南师范大学景德楼', image: '/images/jindelou.png', detailId: 'jindelou', category: '教学科研' },
  { name: '经纬楼', coords: [28.1927, 112.94213], description: '湖南师范大学经纬楼', image: '/images/jingweilou.png', detailId: 'jingweilou', category: '教学科研' },
  { name: '研究生院', coords: [28.19362, 112.94248], description: '湖南师范大学研究生院', image: '/images/library.png', detailId: 'yanjiushengyuan', category: '教学科研' },
  { name: '新闻与传播学院', coords: [28.19345, 112.94315], description: '湖南师范大学新闻与传播学院', image: '/images/xcCollege.png', detailId: 'xcCollege', category: '教学科研' },
  { name: '生命科学学院', coords: [28.19225, 112.94500], description: '湖南师范大学生命科学学院', image: '/images/skCollege.png', detailId: 'skCollege', category: '教学科研' },
  { name: '文渊楼', coords: [28.1920, 112.9416], description: '湖南师范大学文渊楼', image: '/images/wenyuanlou.png', detailId: 'wenyuanlou', category: '教学科研' },
  { name: '中和楼', coords: [28.1911, 112.9416], description: '湖南师范大学中和楼', image: '/images/zhonghelou.png', detailId: 'zhonghelou', category: '教学科研' },
  { name: '化工院', coords: [28.1911, 112.9430], description: '湖南师范大学化工院', image: '/images/hxCollege.png', detailId: 'hxCollege', category: '教学科研' },
  { name: '工学院', coords: [28.18805, 112.9443], description: '湖南师范大学工学院', image: '/images/gsCollege.png', detailId: 'gsCollege', category: '教学科研' },
  { name: '理学院', coords: [28.18705, 112.94497], description: '湖南师范大学理学院', image: '/images/lxCollege.png', detailId: 'lxCollege', category: '教学科研' },
  { name: '教育学院', coords: [28.18727, 112.94815], description: '湖南师范大学教育学院', image: '/images/jyCollege.png', detailId: 'jyCollege', category: '教学科研' },

  // 宿舍
  { name: '研六舍', coords: [28.18935, 112.94075], description: '湖南师范大学研六舍', image: '/images/library.png', detailId: 'yan6', category: '宿舍' },
  { name: '研二舍', coords: [28.18815, 112.94135], description: '湖南师范大学研二舍', image: '/images/library.png', detailId: 'yan2', category: '宿舍' },
  { name: '研五舍', coords: [28.18950, 112.94208], description: '湖南师范大学研五舍', image: '/images/library.png', detailId: 'yan5', category: '宿舍' },
  { name: '研三舍', coords: [28.18865, 112.94208], description: '湖南师范大学研三舍', image: '/images/library.png', detailId: 'yan3', category: '宿舍' },
  { name: '研一舍', coords: [28.18765, 112.94138], description: '湖南师范大学研一舍', image: '/images/library.png', detailId: 'yan1', category: '宿舍' },
  { name: '二里半宿舍', coords: [28.19305, 112.94435], description: '湖南师范大学二里半宿舍', image: '/images/library.png', detailId: 'erliban', category: '宿舍' },
  { name: '江边一舍', coords: [28.18880, 112.9484], description: '湖南师范大学江边一舍', image: '/images/library.png', detailId: 'jiangbian1', category: '宿舍' },
  { name: '江边二舍', coords: [28.18933, 112.9484], description: '湖南师范大学江边二舍', image: '/images/library.png', detailId: 'jiangbian1', category: '宿舍' },
  { name: '江边三舍', coords: [28.18990, 112.9485], description: '湖南师范大学江边三舍', image: '/images/library.png', detailId: 'jiangbian3', category: '宿舍' },

  // 文化风景
  { name: '忠烈祠', coords: [28.1926, 112.94025], description: '忠烈祠', image: '/images/zhonglie.png', detailId: 'zhonglie', category: '文化风景' },
  { name: '岳王亭', coords: [28.19247, 112.93953], description: '岳王亭', image: '/images/yuwangting.png', detailId: 'yuewangting', category: '文化风景' },
  { name: '校门', coords: [28.19230, 112.94302], description: '校门', image: '/images/yuwangting.png', detailId: 'yuewangting', category: '文化风景' },

  // 行政
  { name: '红楼', coords: [28.19455, 112.94170], description: '湖南师范大学红楼', image: '/images/honglou.png', detailId: 'honglou', category: '行政' },
  { name: '教务处', coords: [28.19205, 112.9398], description: '湖南师范大学教务处', image: '/images/library.png', detailId: 'jiaowuchu', category: '行政' },
  { name: '校工会', coords: [28.19165, 112.94243], description: '湖南师范大学校工会', image: '/images/library.png', detailId: 'xiaogonghui', category: '行政' },
  { name: '学工处', coords: [28.19041, 112.94898], description: '湖南师范大学学工处', image: '/images/library.png', detailId: 'xuegongchu', category: '行政' },

  // 重要场馆
  { name: '天文馆', coords: [28.19107, 112.94120], description: '湖南师范大学天文馆', image: '/images/library.png', detailId: 'library2', category: '重要场馆' },
  { name: '校医院', coords: [28.19005, 112.94010], description: '湖南师范大学校医院', image: '/images/shichengshuyuan.png', detailId: 'xiaoyiyuan', category: '重要场馆' },
  { name: '图书馆', coords: [28.1895, 112.94335], description: '湖南师范大学逸夫图书馆', image: '/images/library.png', detailId: 'library', category: '重要场馆' },
  { name: '江湾体育馆', coords: [28.18805, 112.9435], description: '湖南师范大学江湾体育馆', image: '/images/jyGym.png', detailId: 'jyGym', category: '重要场馆' },
  { name: '国际学术报告厅', coords: [28.18675, 112.94492], description: '湖南师范大学国际学术报告厅', image: '/images/library.png', detailId: 'baogaoting', category: '重要场馆' },
  { name: '田径场', coords: [28.18723, 112.94695], description: '湖南师范大学田径场', image: '/images/byPlayground.png', detailId: 'byPlayground', category: '重要场馆' }
])

// 在 locations 数组后添加推荐路线数据
const recommendedRoutes = [
  {
    id: 1,
    name: '学术与历史之旅',
    description: '适合对学校的历史和学术研究有兴趣的学生或访客',
    points: ['红楼', '教务处', '忠烈祠', '岳王亭', '世承书院', '外国语学院', '图书馆']
  },
  {
    id: 2,
    name: '校园生活体验',
    description: '了解学生的日常生活，包括饮食、住宿和休闲活动',
    points: ['兰桂苑', '研一舍', '研二舍', '研三舍', '木兰食堂', '江湾体育馆']
  },
  {
    id: 3,
    name: '科技与创新探索',
    description: '展示学校的科研实力，适合对科学和技术感兴趣的访客',
    points: ['理学院', '工学院', '化工院', '生命科学学院', '国际学术报告厅']
  },
  {
    id: 4,
    name: '文化与艺术欣赏',
    description: '参观与文化艺术相关的地点',
    points: ['服装设计系', '理仁楼', '至善楼', '文渊楼', '木兰楼']
  }
]

const mapRef = ref(null)
const map = ref(null)
const markers = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)

// 湖南师范大学的坐标
const HNNU_CENTER = [28.1910, 112.9440]
const INITIAL_ZOOM = 16

// 搜索结果过滤
const filteredLocations = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return locations.value.filter(location =>
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
  // 先关闭已经打开的 modal
  showLocationModal.value = false

  // 设置选中的位置
  selectedLocation.value = location


  // 添加一次性事件监听器，等待地图移动完成
  const onMoveEnd = () => {
    // 获取 marker 在屏幕上的像素坐标
    const point = map.value.latLngToContainerPoint(location.coords)
    modalPosition.value = {
      x: point.x,
      y: point.y
    }

    // 显示 modal
    showLocationModal.value = true

    // 移除事件监听器
    map.value.off('moveend', onMoveEnd)
  }

  // 添加事件监听器
  map.value.on('moveend', onMoveEnd)

  // 移动地图到目标位置
  map.value?.setView(location.coords, 18)

  // 更新其他状态
  markers.value.forEach(marker => {
    if (marker.getLatLng().equals(location.coords)) {
      marker.openPopup()
    }
  })

  addToHistory(location)
  showSearchResults.value = false
  searchQuery.value = location.name
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
  return locations.value.filter(location =>
    location.name.toLowerCase().includes(startPoint.value.toLowerCase())
  )
})

const endSuggestions = computed(() => {
  if (!endPoint.value) return []
  return locations.value.filter(location =>
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

// 修改 planRoute 
const planRoute = () => {
  if (!selectedStart.value || !selectedEnd.value || !map.value) return;

  clearRoute();

  const startPoint = L.latLng(selectedStart.value.coords[0], selectedStart.value.coords[1]);
  const endPoint = L.latLng(selectedEnd.value.coords[0], selectedEnd.value.coords[1]);

  // 创建路线控制器
  const control = L.Routing.control({
    waypoints: [startPoint, endPoint],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot',  // 使用步行模式
      options: {
        steps: true,
        alternatives: true,  // 显示备选路线
        annotations: false,  // 禁用注释
        geometryOnly: false,
        overview: 'full',
        // 关键修改：添加参数以放宽路径限制
        continue_straight: false,  // 允许转弯
        use_roads: 0,             // 降低对道路的依赖
        use_hills: 0,             // 允许穿越高度差
        use_ferries: false,       // 不使用渡轮
        waypoints_per_route: 2,   // 只使用起点和终点
        walking_speed: 1.4,       // 步行速度（米/秒）
        walking_radius: 50,       // 步行半径（米）
        // 自定义成本因子，使路线更倾向于直线
        weight_name: 'distance',  // 使用距离作为权重
        weight_factor: 1.0,       // 距离权重因子
      }
    }),
    lineOptions: {
      styles: [{
        color: '#3388ff',
        weight: 6,
        opacity: 0.7
      }],
      addWaypoints: false,
      missingRouteTolerance: 10 // 增加容差以更好地吸附到道路
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

  // 添加路由错误处理
  control.on('routingerror', () => {
    ElMessage.error('路线规划失败，请尝试其他路线');
    clearRoute();
  });
};


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
    const bounds = L.latLngBounds(locations.value.map(loc => loc.coords))

    // 初始化地图，调整缩放范围
    const mapInstance = L.map(mapRef.value, {
      attributionControl: false,
      minZoom: 16,
      maxZoom: 18,
      maxBounds: bounds.pad(0.1),
      maxBoundsViscosity: 0.8
    }).setView(HNNU_CENTER, INITIAL_ZOOM)

    map.value = mapInstance

    // 添加图层
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance)

    // 添加地图点击事件监听器
    mapInstance.on('click', () => {
      // 点击地图时关闭 LocationModal
      showLocationModal.value = false
    })

    // 获取位置数据
    request.get('/locations').then(res => {
      // 使用 .value 赋值给响应式引用
      locations.value = res.data.data
      
      // 在获取数据后添加标记
      locations.value.forEach(location => {
        const marker = L.marker(location.coords, {
          icon: categoryIcons[location.category]
        })
          .addTo(mapInstance)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            openLocationModal(location, e)
          })

        // 根据初始类别状态决定是否显示标记
        if (!selectedCategories.value.includes(location.category)) {
          marker.removeFrom(mapInstance)
        }

        markers.value.push(marker)
      })
    }).catch(error => {
      //添加标记
      locations.value.forEach(location => {
        const marker = L.marker(location.coords, {
          icon: categoryIcons[location.category]
        })
          .addTo(mapInstance)
          .on('click', (e) => {
            // 阻止事件冒泡，防止触发地图的点击事件
            L.DomEvent.stopPropagation(e)
            openLocationModal(location, e)
          })

        // 根据初始类别状态决定是否显示标记
        if (!selectedCategories.value.includes(location.category)) {
          marker.removeFrom(mapInstance)
        }

        markers.value.push(marker)
      })
      console.error('获取位置数据失败:', error)
      ElMessage.error('获取位置数据失败，请刷新页面重试')
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



// 添加分类相关的变量
const categories = ['宿舍', '食堂', '文化风景', '教学科研', '行政', '重要场馆']

const categoryColors = {
  '宿舍': '#FF4444',
  '食堂': '#FFA500',
  '文化风景': '#4CAF50',
  '教学科研': '#2196F3',
  '行政': '#9C27B0',
  '重要场馆': '#FFD700'
}

const selectedCategories = ref(categories.slice())
const showCategoryBtns = ref(false)

// 修改分类切换方法
const toggleCategory = (category) => {
  // 如果当前分类已经被选中，则显示所有分类
  if (selectedCategories.value.length === 1 && selectedCategories.value[0] === category) {
    selectedCategories.value = categories.slice() // 重置为所有分类
  } else {
    // 否则只显示选中的分类
    selectedCategories.value = [category]
  }

  // 更新地图上的标记显示状态
  locations.value.forEach((location, idx) => {
    const marker = markers.value[idx]
    if (selectedCategories.value.includes(location.category)) {
      if (!map.value.hasLayer(marker)) {
        marker.addTo(map.value)
      }
    } else {
      if (map.value.hasLayer(marker)) {
        marker.removeFrom(map.value)
      }
    }
  })
}

const isExpanded = ref(false)

const toggleCategoryPanel = () => {
  showCategoryBtns.value = !showCategoryBtns.value
  isExpanded.value = !isExpanded.value
}


// 修改关闭路线规划面板的处理方法
const closeRoutePanel = () => {
  showRoutePanel.value = false
  // 清除路线和输入
  clearRoute()
  startPoint.value = ''
  endPoint.value = ''
  selectedStart.value = null
  selectedEnd.value = null
}

const modalPosition = ref({ x: 0, y: 0 })

// 修改打开modal的方法
const openLocationModal = (location, event) => {
  selectedLocation.value = location
  // 获取点击位置相对于视口的坐标
  const point = map.value.latLngToContainerPoint(location.coords);

  // 计算header和tabs的总高度
  const headerHeight = 70;  // header高度 (50px + padding)

  modalPosition.value = {
    x: point.x + 20, // 向右偏移20px，为箭头留出空间
    y: point.y - headerHeight
  }
  showLocationModal.value = true
}

// 在marker点击事件中调用
markers.value.forEach(location => {
  const marker = L.marker(location.coords)
    .addTo(mapInstance)
    .on('click', (e) => {
      openLocationModal(location, e.originalEvent)
    })
})

const selectRecommendedRoute = (route) => {
  clearRoute()

  const waypoints = route.points.map(pointName => {
    const location = locations.value.find(loc => loc.name === pointName)
    return location ? L.latLng(location.coords[0], location.coords[1]) : null
  }).filter(point => point !== null)

  const control = L.Routing.control({
    waypoints,
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot',
      geometryOnly: true
    }),
    lineOptions: {
      styles: [
        {
          color: getRouteColor(route.id),
          weight: 4,
          opacity: 0.8,
          dashArray: '12, 12',  // 添加虚线样式
          className: 'animated-path' // 添加动画类名
        },
        {
          color: '#fff',  // 白色边框
          weight: 8,
          opacity: 0.3,
          offset: -2
        }
      ],
      extendedOptions: {
        animate: {
          duration: 3000,
          iterations: Infinity
        }
      }
    },
    createMarker: (i, wp, nWps) => {
      const isLastPoint = i === nWps - 1
      return L.marker(wp.latLng, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class='marker-circle' style='background-color: ${getRouteColor(route.id)}'>
              <span class='marker-number'>${i + 1}</span>
              ${!isLastPoint ? '<div class="route-arrow">▶</div>' : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      })
    },
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    show: false
  })

  routingControl.value = control
  control.addTo(map.value)

  startPoint.value = route.points[0]
  endPoint.value = route.points[route.points.length - 1]
  selectedStart.value = locations.value.find(loc => loc.name === route.points[0])
  selectedEnd.value = locations.value.find(loc => loc.name === route.points[route.points.length - 1])
}

const getRouteColor = (routeId) => {
  const colors = {
    1: '#FF6B6B',
    2: '#4ECDC4',
    3: '#45B7D1',
    4: '#96CEB4'
  }
  return colors[routeId] || '#3388ff'
}

// 添加紧急设施标记变量
const emergencyMarker = ref(null)

// 在 script setup 中添加新的响应式变量
const userLocationMarker = ref(null)
const isLocating = ref(false)

// 添加定位方法
const locateUser = () => {
  isLocating.value = true;

  // 检查浏览器是否支持地理定位
  if (!navigator.geolocation) {
    ElMessage.error('您的浏览器不支持地理定位');
    isLocating.value = false;
    return;
  }

  // 获取用户位置
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;

      // 给坐标添加偏移量（根据需求调整偏移值）
      const offsetLatitude = 0.00148 // 纬度偏移量
      const offsetLongitude = -0.0009; // 经度偏移量

      latitude += offsetLatitude;
      longitude += offsetLongitude;

      // 更新用户位置标记
      if (userLocationMarker.value) {
        userLocationMarker.value = { lat: latitude, lng: longitude };
      } else {
        userLocationMarker.value = { lat: latitude, lng: longitude };
      }

      // 更新标记位置样式
      userLocationStyle.value = {
        display: 'block',
        position: 'absolute',
        left: '0px',
        top: '0px',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      };
      const closeLocationModal = () => {
        showLocationModal.value = false;
        isLocateMode.value = false;
        // 移除所有 moveend 事件监听器，确保不会再次触发显示气泡
        map.value?.off('moveend');
      }
      // 查找最近的位置点
      const nearestLocation = findNearestLocation(latitude, longitude);

      // 添加一次性事件监听器，等待地图移动完成
      const onMoveEnd = () => {
        // 获取 marker 在屏幕上的像素坐标
        const point = map.value.latLngToContainerPoint(nearestLocation.coords);
        modalPosition.value = {
          x: point.x + 20,
          y: point.y - 70
        };

        // 显示气泡提示
        selectedLocation.value = nearestLocation;
        showLocationModal.value = true;
        isLocateMode.value = true;

        // 移除事件监听器
        map.value.off('moveend', onMoveEnd);
      };

      // 移动地图到用户位置，并添加一次性事件监听器
      map.value?.once('moveend', onMoveEnd);
      map.value?.setView([latitude, longitude], 18);

      // 添加用户位置更新的事件监听器
      map.value?.on('move', updateUserLocationPosition);

      // 立即更新位置
      updateUserLocationPosition();

      isLocating.value = false;
    },
    (error) => {
      let errorMessage = '获取位置失败';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '您拒绝了位置访问请求';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用';
          break;
        case error.TIMEOUT:
          errorMessage = '获取位置超时';
          break;
      }
      ElMessage.error(errorMessage);
      isLocating.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

// 修改关闭 modal 的方法
const closeLocationModal = () => {
  showLocationModal.value = false;
  isLocateMode.value = false;
  // 移除所有 moveend 事件监听器，确保不会再次触发显示气泡
  map.value?.off('moveend');
}

// 添加查找最近位置点的方法
const findNearestLocation = (latitude, longitude) => {
  let nearestLocation = locations.value[0];
  let minDistance = calculateDistance(latitude, longitude, locations.value[0].coords[0], locations.value[0].coords[1]);

  locations.value.forEach(location => {
    const distance = calculateDistance(latitude, longitude, location.coords[0], location.coords[1]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  });

  return nearestLocation;
};

// 添加计算两点之间距离的方法（使用 Haversine 公式）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（千米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 添加更新用户位置标记位置的方法
const updateUserLocationPosition = () => {
  if (userLocationMarker.value) {
    const point = map.value.latLngToContainerPoint([
      userLocationMarker.value.lat,
      userLocationMarker.value.lng
    ]);
    userLocationStyle.value = {
      display: 'block',
      position: 'absolute',
      left: `${point.x}px`,
      top: `${point.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    };
  }
};

// 添加用户位置样式计算
const userLocationStyle = ref({
  display: 'none',
  left: '0px',
  top: '0px'
})

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    // 处理紧急设施显示
    if (query.showEmergencyMarker === 'true' && query.coords) {
      // 隐藏所有常规标记
      markers.value.forEach(marker => {
        marker.removeFrom(map.value)
      })

      // 移除已存在的紧急标记
      if (emergencyMarker.value) {
        emergencyMarker.value.removeFrom(map.value)
      }

      // 创建紧急标记的自定义图标
      const coords = query.coords.split(',').map(Number)
      const customIcon = L.divIcon({
        className: 'emergency-marker',
        html: `
          <div class="emergency-marker-inner">
            <div class="emergency-pulse"></div>
            <div class="emergency-icon">
              <Icon icon="mdi:heart-pulse" />
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })

      // 添加新的紧急标记
      emergencyMarker.value = L.marker(coords, { icon: customIcon })
        .addTo(map.value)
        .bindPopup(`
          <div class="emergency-popup">
            <h3>${query.name}</h3>
            <p>${query.description}</p>
            <button class="emergency-navigate-btn" onclick="window.handleEmergencyNavigate()">到这去</button>
          </div>
        `, {
          // 添加 popup 关闭事件处理
          closeOnClick: false,
          closeButton: true,
          className: 'emergency-popup-container'
        })
        .on('popupclose', () => {
          // 当弹窗关闭时，移除紧急标记并返回主页
          if (emergencyMarker.value) {
            emergencyMarker.value.removeFrom(map.value)
            emergencyMarker.value = null
          }
          // 恢复所有常规标记
          markers.value.forEach(marker => {
            marker.addTo(map.value)
          })
          // 使用路由导航回主页
          router.push('/')
        })

      // 设置地图视图到紧急标记位置
      map.value.setView(coords, 18)

      // 自动打开弹窗
      emergencyMarker.value.openPopup()
    } else {
      // 如果不显示紧急标记，恢复所有常规标记
      if (emergencyMarker.value) {
        emergencyMarker.value.removeFrom(map.value)
      }
      markers.value.forEach(marker => {
        marker.addTo(map.value)
      })
    }
  },
  { immediate: true }
)

// 在 script setup 部分添加全局处理函数
const handleEmergencyNavigate = () => {
  const query = route.query
  if (!query.coords || !query.name) return

  // 关闭弹窗
  emergencyMarker.value?.closePopup()

  // 打开路线规划面板并设置终点
  showRoutePanel.value = true
  selectedEnd.value = {
    name: query.name,
    coords: query.coords.split(',').map(Number)
  }
  endPoint.value = query.name
}

// 将处理函数挂载到 window 对象
onMounted(() => {
  window.handleEmergencyNavigate = handleEmergencyNavigate
})

// 在组件卸载时清理
onUnmounted(() => {
  delete window.handleEmergencyNavigate
})

// 添加相应的 CSS 样式
const style = document.createElement('style')
style.textContent = `
  .emergency-navigate-btn {
    background: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    margin-top: 8px;
    cursor: pointer;
    width: 100%;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .emergency-navigate-btn:hover {
    background: #ff7875;
  }
`
document.head.appendChild(style)

// 新增语音识别相关状态
const isRecording = ref(false)
const isVoiceDisabled = ref(false)
const recognition = ref(null)

// 语音识别初始化
onMounted(() => {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.continuous = false
    recognition.value.lang = 'zh-CN'
    recognition.value.interimResults = false

    recognition.value.onresult = (event) => {
      const rawTranscript = event.results[0][0].transcript
      console.log('原始语音识别结果:', rawTranscript)
      
      // 处理语音识别结果，提取关键词
      const processedText = extractKeywords(rawTranscript)
      searchQuery.value = processedText
      showSearchResults.value = true
      
      // 如果有匹配的地点，自动选择第一个
      if (filteredLocations.value.length === 1) {
        setTimeout(() => {
          navigateToLocation(filteredLocations.value[0])
        }, 500)
      }
    }

    recognition.value.onerror = (event) => {
      console.error('语音识别错误:', event.error)
      ElMessage.error('识别失败，请重试')
    }

    recognition.value.onend = () => {
      isRecording.value = false
    }
  } else {
    isVoiceDisabled.value = true
    ElMessage.warning('当前浏览器不支持语音识别')
  }
})

// 提取关键词函数
const extractKeywords = (text) => {
  // 1. 去除标点符号
  let processed = text.replace(/[.,，。！？!?;；：:""''（）()【】[\]]/g, '')
  
  // 2. 去除常见的无关词语
  const stopWords = ['我要', '我想', '我需要', '去', '到', '前往', '找', '搜索', 
                     '帮我', '请', '麻烦', '查询', '查找', '在哪', '怎么走']
  
  stopWords.forEach(word => {
    processed = processed.replace(new RegExp(word, 'g'), '')
  })
  
  // 3. 尝试与地点列表匹配
  const potentialPlaces = []
  locations.value.forEach(location => {
    if (processed.includes(location.name)) {
      potentialPlaces.push(location.name)
    }
  })
  
  // 如果找到了匹配的地点名称，使用最长的那个
  if (potentialPlaces.length > 0) {
    return potentialPlaces.sort((a, b) => b.length - a.length)[0]
  }
  
  // 4. 如果没有直接匹配，返回处理过的文本
  console.log('处理后的关键词:', processed)
  return processed.trim()
}

// 语音识别开关
const toggleVoiceRecognition = () => {
  if (!isRecording.value) {
    startRecognition()
  } else {
    stopRecognition()
  }
}

const startRecognition = () => {
  if (recognition.value) {
    isRecording.value = true
    recognition.value.start()
    ElMessage.info('请说出您想查找的地点...')
  }
}

const stopRecognition = () => {
  if (recognition.value) {
    isRecording.value = false
    recognition.value.stop()
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (recognition.value) {
    recognition.value.stop()
  }
})

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
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
}

input {
  width: 100%;
  padding: 12px 40px 12px 40px;  /* 左右都留出40px的空间 */
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

.mic-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 36px;  /* 固定宽度 */
  height: 36px;  /* 固定高度 */
}

.mic-button:hover {
  color: #3388ff;
  background-color: rgba(51, 136, 255, 0.1);
}

.mic-button.recording {
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
}

.mic-button.recording .mic-icon {
  animation: pulse-icon 1.5s infinite;
}

.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: none;
}

.mic-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse-icon {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
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

.location-icon,
.history-icon {
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
  position: static;
  transform: none;
}

/* 修改分类按钮组的样式 */
.category-controls {
  position: relative;
}

.category-buttons {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.show-buttons {
  opacity: 1;
  visibility: visible;
}

.category-btn {
  width: 100px;
  height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-btn:not(.active) {
  background-color: #f5f5f5 !important;
}

.category-btn:not(.active) .white-icon,
.category-btn:not(.active) .category-text {
  color: #666;
}

.category-btn.active {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-btn-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.white-icon {
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.category-text {
  font-size: 12px;
  color: white;
  text-align: left;
  line-height: 1.2;
  white-space: nowrap;
}

.trigger-btn {
  z-index: 1;
}

.highlighted {
  border: 2px solid #1890ff;
  /* 高亮边框颜色 */
  background-color: rgba(24, 144, 255, 0.1);
  /* 高亮背景颜色 */
}

.recommended-routes {
  margin-top: 20px;
  width: 100%;
}

.recommended-routes h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.route-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.route-item:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.route-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.route-desc {
  font-size: 12px;
  color: #666;
}

.custom-div-icon {
  background: none;
  border: none;
}

.marker-circle {
  width: 32px;
  height: 32px;
  background: #3388ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.marker-number {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  line-height: 1;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.route-arrow {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 14px;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
}

:deep(.animated-path) {
  stroke-dasharray: 12;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -24;
  }
}

/* 隐藏路由控制面板 */
:deep(.leaflet-routing-container) {
  display: none;
}

/* 优化路线样式 */
:deep(.leaflet-routing-alternatives-container) {
  display: none;
}

/* 紧急标记样式 */
:deep(.emergency-marker) {
  background: none;
  border: none;
}

:deep(.emergency-marker-inner) {
  position: relative;
  width: 40px;
  height: 40px;
}

:deep(.emergency-pulse) {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(255, 77, 79, 0.4);
  border-radius: 50%;
  animation: emergency-pulse 2s infinite;
}

:deep(.emergency-icon) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.5);
}

@keyframes emergency-pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

:deep(.emergency-popup) {
  text-align: center;
  padding: 8px;
}

:deep(.emergency-popup h3) {
  color: #ff4d4f;
  margin: 0 0 8px 0;
  font-size: 16px;
}

:deep(.emergency-popup p) {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 定位样式 */
.user-location-marker {
  background: none;
  border: none;
}

.user-location-dot {
  position: relative;
  width: 20px;
  height: 20px;
}

.user-location-dot::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #1890ff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.5);
}

.user-location-pulse {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(24, 144, 255, 0.4);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 修改用户位置标记样式 */
.user-location-wrapper {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}

.user-location-dot {
  position: relative;
  width: 20px;
  height: 20px;
}

.user-location-dot::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #1890ff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.5);
}

.user-location-pulse {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(24, 144, 255, 0.4);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
</style>
