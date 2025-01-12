<script setup>
import { ref, onMounted } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import gsap from 'gsap'
import { buildingsData } from '../data/buildings'
import { useRouter } from 'vue-router'

const router = useRouter()

const emit = defineEmits(['plan-route', 'set-start', 'set-end'])

// 使用导入的建筑物数据
const buildings = ref(buildingsData.map(building => ({
  ...building,
  position: { x: 0, y: 0 },
  scale: 1
})))

const mapContainer = ref(null)
const mapWrapper = ref(null)
const activeBuilding = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const currentPos = ref({ x: 0, y: 0 })
const scale = ref(1)
const svgPosition = ref({ x: 0, y: 0 })
const svgScale = ref(1)

// 添加当前选中的建筑物
const selectedBuilding = ref(null)

// 添加气泡相关状态
const showPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })

// 添加边界限制函数
const getBoundaries = () => {
  const container = mapContainer.value.getBoundingClientRect()
  const wrapper = mapWrapper.value.getBoundingClientRect()

  // 当缩放比例为1时，不允许拖动
  if (scale.value <= 1) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    }
  }

  // 计算可拖动的范围，这里的0.2表示可以拖出20%的边界
  const maxX = (wrapper.width * scale.value - container.width) * 0.2
  const maxY = (wrapper.height * scale.value - container.height) * 0.2

  return {
    minX: -maxX,
    maxX: maxX,
    minY: -maxY,
    maxY: maxY
  }
}

// 缩放控制
const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = scale.value * delta

  // 限制缩放范围
  if (newScale >= 1 && newScale <= 3) {
    const rect = mapContainer.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 计算新的位置
    const newPos = {
      x: currentPos.value.x - (x - currentPos.value.x) * (delta - 1),
      y: currentPos.value.y - (y - currentPos.value.y) * (delta - 1)
    }

    // 更新缩放
    scale.value = newScale

    // 应用边界限制
    const boundaries = getBoundaries()
    currentPos.value = {
      x: Math.max(boundaries.minX, Math.min(boundaries.maxX, newPos.x)),
      y: Math.max(boundaries.minY, Math.min(boundaries.maxY, newPos.y))
    }
  }
}

// 拖动控制
const startDrag = (e) => {
  // 只响应鼠标左键，且只在放大状态下可拖动
  if (e.button !== 0 || scale.value <= 1) return

  isDragging.value = true
  dragStart.value = {
    x: e.clientX - currentPos.value.x,
    y: e.clientY - currentPos.value.y
  }
}

const doDrag = (e) => {
  if (!isDragging.value) return

  const boundaries = getBoundaries()
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y

  // 应用边界限制
  currentPos.value = {
    x: Math.max(boundaries.minX, Math.min(boundaries.maxX, newX)),
    y: Math.max(boundaries.minY, Math.min(boundaries.maxY, newY))
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// 处理建筑物悬停
const handleBuildingHover = (building) => {
  activeBuilding.value = building
  gsap.to(`#building-${building.id}`, {
    opacity: 0.9,
    duration: 0.3,
    ease: 'power2.out'
  })
}

const handleBuildingLeave = (building) => {
  activeBuilding.value = null
  gsap.to(`#building-${building.id}`, {
    opacity: 0.4,
    duration: 0.3,
    ease: 'power2.out'
  })
}

// 重置视图
const resetView = () => {
  gsap.to(scale, {
    value: 1,
    duration: 0.5,
    ease: 'power2.out'
  })
  gsap.to(currentPos.value, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
}

// 添加位置调整函数
const adjustStep = ref({
  position: 10,  // 位置调整步长
  scale: 0.1     // 缩放调整步长
})

// 修改位置调整函数
const adjustSvgPosition = (dx = 0, dy = 0, ds = 0) => {
  if (!selectedBuilding.value) return

  // 更新建筑物在buildings数组中的位置
  const buildingIndex = buildings.value.findIndex(b => b.id === selectedBuilding.value.id)
  if (buildingIndex !== -1) {
    const building = buildings.value[buildingIndex]
    building.position = {
      x: building.position.x + dx * adjustStep.value.position,
      y: building.position.y + dy * adjustStep.value.position
    }
    building.scale = Math.max(0.1, building.scale + ds * adjustStep.value.scale)

    // 同步更新selectedBuilding的值
    selectedBuilding.value = building

    // 输出当前位置和缩放信息
    console.log(`当前建筑: ${building.name}`)
    console.log(`位置: X:${building.position.x}, Y:${building.position.y}`)
    console.log(`缩放: ${building.scale}`)
  }
}

// 修改重置位置函数
const resetSvgPosition = () => {
  if (!selectedBuilding.value) return

  const buildingIndex = buildings.value.findIndex(b => b.id === selectedBuilding.value.id)
  if (buildingIndex !== -1) {
    buildings.value[buildingIndex].position = { x: 0, y: 0 }
    buildings.value[buildingIndex].scale = 1
    selectedBuilding.value = buildings.value[buildingIndex]
  }
}

// 修改建筑物选择函数
const selectBuilding = (building) => {
  const buildingIndex = buildings.value.findIndex(b => b.id === building.id)
  if (buildingIndex !== -1) {
    selectedBuilding.value = buildings.value[buildingIndex]
  }
}

// 处理建筑物点击
const handleBuildingClick = (building, event) => {
  event.stopPropagation()

  // 如果点击的是当前选中的建筑物，只关闭气泡，不清除选中状态
  if (selectedBuilding.value === building) {
    showPopup.value = false
    return
  }

  // 更新选中的建筑物（使用 selectBuilding 函数来确保正确的引用）
  selectBuilding(building)
  showPopup.value = true

  // 计算气泡位置（相对于视口）
  const rect = event.target.getBoundingClientRect()
  const viewportHeight = window.innerHeight

  // 如果是文渊楼或者建筑物在视口上半部分，气泡向下展示，如果是江湾体育馆，气泡向上展示
  if (building.name === '江湾体育馆') {
    popupPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 120  // 在建筑物上方显示
    }
  } else if (building.name === '文渊楼' || rect.top < viewportHeight / 2) {
    popupPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10  // 在建筑物下方显示
    }
  } else {
    popupPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10  // 在建筑物上方显示
    }
  }
}

// 关闭气泡
const closePopup = () => {
  showPopup.value = false
}

// 点击地图空白处关闭气泡
const handleMapClick = () => {
  // 只关闭气泡，不清除选中状态
  showPopup.value = false
}

// 添加控制面板拖动相关的状态
const debugPanelPos = ref({ x: 20, y: 20 }) // 初始位置
const isDraggingPanel = ref(false)
const panelDragStart = ref({ x: 0, y: 0 })

// 添加控制面板拖动相关的方法
const startPanelDrag = (e) => {
  isDraggingPanel.value = true
  panelDragStart.value = {
    x: e.clientX - debugPanelPos.value.x,
    y: e.clientY - debugPanelPos.value.y
  }
}

const doPanelDrag = (e) => {
  if (!isDraggingPanel.value) return
  debugPanelPos.value = {
    x: e.clientX - panelDragStart.value.x,
    y: e.clientY - panelDragStart.value.y
  }
}

const stopPanelDrag = () => {
  isDraggingPanel.value = false
}

// 添加处理按钮点击的方法
const goToDetail = (building) => {
  if (building?.detailId) {
    router.push(`/location/${building.detailId}`)
  }
}

const planRoute = () => {
  // 触发规划路线事件
  emit('plan-route')
}

const setAsStart = (building) => {
  emit('set-start', building)
  closePopup()
  router.push({
    path: '/',
    query: {
      openRoute: 'true',
      startPoint: building.name
    }
  })
}

const setAsEnd = (building) => {
  emit('set-end', building)
  closePopup()
  router.push({
    path: '/',
    query: {
      openRoute: 'true',
      endPoint: building.name
    }
  })
}

const goToVR = (building) => {
  if (!building.detailId) {
    console.warn('未找到地点ID，无法跳转到VR图')
    return
  }
  else {
    router.push({
      path: '/vr',
      query: {
        location: building.detailId
      }
    })
    closePopup()
  }

}

onMounted(() => {
  // 移除原有的监听
  document.addEventListener('mousemove', (e) => {
    if (isDragging.value) {
      doDrag(e)
    }
  })

  document.addEventListener('mouseup', stopDrag)

  // 添加控制面板拖动事件监听
  document.addEventListener('mousemove', doPanelDrag)
  document.addEventListener('mouseup', stopPanelDrag)

  // 设置所有建筑物的初始位置和缩放
  const buildingPositions = {
    '文渊楼': { x: 1382, y: -117, scale: 0.88 },
    '中和楼': { x: 1025, y: 30, scale: 0.88 },
    '江湾体育馆': { x: 540, y: 1530, scale: 0.88 },
    '图书馆': { x: 995, y: 1015, scale: 0.88 },
    '化学楼南栋（中国银行）': { x: 1440, y: 670, scale: 0.88 },
    '化学楼北栋': { x: 1630, y: 340, scale: 0.88 },
    '木兰楼': { x: 1010, y: 460, scale: 0.88 },
    '研5舍': { x: 690, y: 690, scale: 0.88 },
    '篮球场': { x: 540, y: 970, scale: 0.88 },
    '研3舍': { x: 420, y: 1020, scale: 0.88 },
    '网球场': { x: 210, y: 1250, scale: 0.88 },
    '至善楼': { x: -210, y: 1350, scale: 0.88 },
    '兰桂苑': { x: -670, y: 1060, scale: 0.88 },
    '世承书院': { x: 0, y: 600, scale: 0.88 },
    '木兰路食堂': { x: -350, y: 810, scale: 0.88 },
    '外国语学院': { x: 515, y: 240, scale: 0.88 },
    '中和楼-世承书院': { x: 310, y: 340, scale: 0.88 },
    '中和楼-图书馆': { x: 620, y: -70, scale: 0.46 },
    '中和楼-至善楼': { x: -200, y: -70, scale: 0.46 },
    '中和楼-木兰食堂': { x: -390, y: -60, scale: 0.46 }
  }

  // 为每个建筑物设置位置和缩放
  buildings.value.forEach(building => {
    const position = buildingPositions[building.name]
    if (position) {
      building.position = { x: position.x, y: position.y }
      building.scale = position.scale
    }
  })

  // 添加快捷键控制（可选）
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        adjustSvgPosition(-10, 0)
        break
      case 'ArrowRight':
        adjustSvgPosition(10, 0)
        break
      case 'ArrowUp':
        adjustSvgPosition(0, -10)
        break
      case 'ArrowDown':
        adjustSvgPosition(0, 10)
        break
      case '+':
        adjustSvgPosition(0, 0, 0.1)
        break
      case '-':
        adjustSvgPosition(0, 0, -0.1)
        break
    }
  })
})

// 修改为默认显示调试控制面板
const showDebugControls = ref(true)
</script>

<template>
  <div class="map-container" ref="mapContainer" @wheel="handleWheel" @mousedown="startDrag" @mouseleave="stopDrag"
    @click="handleMapClick">
    <div class="map-controls">
      <button @click="resetView" class="control-button">
        <span>重置视图</span>
      </button>
      <div class="zoom-info">
        缩放: {{ Math.round(scale * 100) }}%
      </div>
    </div>

    <div class="map-wrapper" ref="mapWrapper" :style="{
      transform: `translate(${currentPos.x}px, ${currentPos.y}px) scale(${scale})`
    }">
      <img src="/1-1.png" alt="Campus Map" class="map-image" />

      <!-- 调整 SVG 容器 -->
      <svg class="buildings-layer" viewBox="0 0 2000 2000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="building-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#ffffff" flood-opacity="1" />
          </filter>
        </defs>

        <g v-for="building in buildings" :key="building.id" :style="{
          transform: `translate(${building.position.x}px, ${building.position.y}px) scale(${building.scale})`,
          transformOrigin: 'center'
        }">
          <path :id="`building-${building.id}`" :d="building.path" :fill="building.color"
            :class="['building-path', { 'active': activeBuilding === building }]" stroke="rgba(255, 255, 255, 0.8)"
            stroke-width="2" @mouseenter="handleBuildingHover(building)" @mouseleave="handleBuildingLeave(building)"
            @click="handleBuildingClick(building, $event)" />
        </g>
      </svg>
    </div>

    <!-- 更新调试控制面板 -->
    <div v-if="showDebugControls" class="debug-controls" :style="{
      left: debugPanelPos.x + 'px',
      top: debugPanelPos.y + 'px'
    }">
      <div class="debug-header" @mousedown.prevent="startPanelDrag" style="cursor: move;">
        <h3>SVG 控制面板</h3>
        <button @click="resetSvgPosition" class="reset-button">重置</button>
      </div>

      <!-- 添加建筑物选择 -->
      <div class="control-section">
        <h4>选择建筑物</h4>
        <div class="building-selector">
          <select v-model="selectedBuilding" class="building-select">
            <option :value="null">请选择建筑物</option>
            <option v-for="building in buildings" :key="building.id" :value="building">
              {{ building.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 当有建筑物被选中时显示控制面板 -->
      <template v-if="selectedBuilding">
        <div class="control-section">
          <h4>位置和缩放 - {{ selectedBuilding.name }}</h4>
          <div class="coordinate-inputs">
            <div class="input-group">
              <label>X 坐标:</label>
              <div class="input-with-controls">
                <input type="number" v-model.number="selectedBuilding.position.x" step="1" />
                <div class="input-controls">
                  <button @click="adjustSvgPosition(-1, 0)">-</button>
                  <button @click="adjustSvgPosition(1, 0)">+</button>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label>Y 坐标:</label>
              <div class="input-with-controls">
                <input type="number" v-model.number="selectedBuilding.position.y" step="1" />
                <div class="input-controls">
                  <button @click="adjustSvgPosition(0, -1)">-</button>
                  <button @click="adjustSvgPosition(0, 1)">+</button>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label>缩放比例:</label>
              <div class="input-with-controls">
                <input type="number" v-model.number="selectedBuilding.scale" step="0.01" min="0.1" max="3" />
                <div class="input-controls">
                  <button @click="adjustSvgPosition(0, 0, -1)">-</button>
                  <button @click="adjustSvgPosition(0, 0, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h4>快速调整</h4>
          <div class="quick-controls">
            <div class="arrow-controls">
              <button @click="adjustSvgPosition(0, -1)" class="arrow up">↑</button>
              <div class="horizontal-arrows">
                <button @click="adjustSvgPosition(-1, 0)" class="arrow">←</button>
                <button @click="adjustSvgPosition(1, 0)" class="arrow">→</button>
              </div>
              <button @click="adjustSvgPosition(0, 1)" class="arrow down">↓</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 建筑物信息气泡 -->
    <Transition name="fade">
      <div v-if="showPopup && selectedBuilding" class="building-popup" :style="{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`
      }">
        <div class="popup-header">
          <h3>{{ selectedBuilding.name }}</h3>
          <button class="close-button" @click.stop="closePopup">×</button>
        </div>
        <div class="popup-content">
          <div class="info-row">
            <span class="info-label">位置：</span>
            <span class="info-value">二里半校区</span>
          </div>
          <div class="info-row">
            <span class="info-label">功能：</span>
            <span class="info-value">教学楼</span>
          </div>
          <div class="info-row">
            <span class="info-label">开放时间：</span>
            <span class="info-value">周一至周日 7:00-22:00</span>
          </div>

          <div class="action-buttons">
            <button class="detail-button" @click="goToDetail(selectedBuilding)">
              查看详情
            </button>
            <button class="route-button" @click="planRoute">
              规划路线
            </button>
            <button class="vr-button" @click="goToVR(selectedBuilding)">
              VR全景
            </button>
          </div>

          <div class="route-action-buttons">
            <button class="start-button" @click="setAsStart(selectedBuilding)">
              从这出发
            </button>
            <button class="end-button" @click="setAsEnd(selectedBuilding)">
              到这去
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
  cursor: grab;
}

.map-container:active {
  cursor: grabbing;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}

.buildings-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.buildings-layer {
  /* border: 1px solid rgba(255, 0, 0, 0.3); */
}

.building-path {
  pointer-events: all;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.4;
}

.building-path.active {
  opacity: 0.9;
  filter: url(#building-glow);
  stroke: #ffffff;
  stroke-width: 3;
}

.building-path:hover:not(.active) {
  opacity: 0.6;
}

.building-label {
  fill: white;
  font-size: 16px;
  text-anchor: middle;
  dominant-baseline: middle;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.8));
  pointer-events: none;
  font-weight: bold;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-button:hover {
  background-color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.zoom-info {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .buildings-layer {
    width: 90%;
    height: 90%;
  }
}

.debug-controls {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  color: white;
  z-index: 1000;
  width: 240px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
  /* 防止拖动时选中文本 */
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
}

.control-section {
  margin-bottom: 16px;
}

.control-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.position-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.horizontal-controls {
  display: flex;
  gap: 4px;
}

.scale-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scale-value {
  font-family: monospace;
  padding: 0 8px;
}

.step-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-controls label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.step-controls input {
  width: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 4px;
}

.position-info {
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-controls button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debug-controls button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reset-button {
  background: rgba(255, 82, 82, 0.2) !important;
}

.reset-button:hover {
  background: rgba(255, 82, 82, 0.4) !important;
}

.building-selector {
  margin-bottom: 16px;
}

.building-select {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.building-select option {
  background: #333;
  color: white;
}

/* 高亮当前选中的建筑物 */
.building-path.selected {
  opacity: 0.8;
  stroke: #fff;
  stroke-width: 2;
}

.coordinate-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.input-with-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-with-controls input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px;
  color: white;
  width: 100px;
  font-family: monospace;
}

.input-controls {
  display: flex;
  gap: 4px;
}

.input-controls button {
  padding: 4px 8px;
  min-width: 28px;
}

.quick-controls {
  margin-top: 8px;
}

.arrow-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.horizontal-arrows {
  display: flex;
  gap: 4px;
}

.arrow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 美化输入框 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.building-popup {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  transform: translate(-50%, 0);
  color: white;
  z-index: 1000;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.building-popup::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}

.building-popup.popup-top::after {
  bottom: -8px;
  border-top: 8px solid rgba(0, 0, 0, 0.85);
}

.building-popup.popup-bottom::after {
  top: -8px;
  border-bottom: 8px solid rgba(0, 0, 0, 0.85);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-button:hover {
  color: white;
}

.popup-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.info-row {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
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
  color: white;
  transition: all 0.3s;
}

.detail-button {
  background: #3388ff;
}

.detail-button:hover {
  background: #4499ff;
}

.route-button {
  background: #4CAF50;
}

.route-button:hover {
  background: #5DBF61;
}

.vr-button {
  background: #722ed1;
}

.vr-button:hover {
  background: #8c51e0;
}

.route-action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.start-button:hover {
  background: rgba(24, 144, 255, 0.2);
}

.end-button {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.end-button:hover {
  background: rgba(82, 196, 26, 0.2);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 建筑物悬停和点击效果 */
.building-path {
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.4;
}

.building-path:hover {
  opacity: 0.8;
  filter: url(#building-glow);
}

.building-path.active {
  opacity: 0.9;
  filter: url(#building-glow);
}
</style>