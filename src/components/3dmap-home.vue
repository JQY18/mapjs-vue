<script setup>
import { ref, onMounted } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import gsap from 'gsap'
import { buildingsData } from '../data/buildings'

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
const startPos = ref({ x: 0, y: 0 })
const currentPos = ref({ x: 0, y: 0 })
const scale = ref(1)
const svgPosition = ref({ x: 0, y: 0 })
const svgScale = ref(1)

// 添加当前选中的建筑物
const selectedBuilding = ref(null)

// 添加气泡相关状态
const showPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })

// 缩放控制
const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = scale.value * delta
  
  // 限制缩放范围
  if (newScale >= 0.5 && newScale <= 3) {
    const rect = mapContainer.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 计算新的位置，使缩放以鼠标位置为中心
    currentPos.value = {
      x: currentPos.value.x - (x - currentPos.value.x) * (delta - 1),
      y: currentPos.value.y - (y - currentPos.value.y) * (delta - 1)
    }
    
    scale.value = newScale
  }
}

// 拖动控制
const startDrag = (e) => {
  isDragging.value = true
  startPos.value = {
    x: e.clientX - currentPos.value.x,
    y: e.clientY - currentPos.value.y
  }
}

const doDrag = (e) => {
  if (!isDragging.value) return
  
  currentPos.value = {
    x: e.clientX - startPos.value.x,
    y: e.clientY - startPos.value.y
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
  
  selectedBuilding.value.position = {
    x: selectedBuilding.value.position.x + dx * adjustStep.value.position,
    y: selectedBuilding.value.position.y + dy * adjustStep.value.position
  }
  selectedBuilding.value.scale = Math.max(0.1, selectedBuilding.value.scale + ds * adjustStep.value.scale)
  
  // 输出当前位置和缩放信息
  console.log(`当前建筑: ${selectedBuilding.value.name}`)
  console.log(`位置: X:${selectedBuilding.value.position.x}, Y:${selectedBuilding.value.position.y}`)
  console.log(`缩放: ${selectedBuilding.value.scale}`)
}

// 重置当前选中建筑物的位置
const resetSvgPosition = () => {
  if (!selectedBuilding.value) return
  selectedBuilding.value.position = { x: 0, y: 0 }
  selectedBuilding.value.scale = 1
}

// 选择建筑物
const selectBuilding = (building) => {
  selectedBuilding.value = building
}

// 处理建筑物点击
const handleBuildingClick = (building, event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  // 如果点击的是当前选中的建筑物，则关闭气泡
  if (selectedBuilding.value === building) {
    closePopup()
    return
  }
  
  selectedBuilding.value = building
  showPopup.value = true
  
  // 计算气泡位置（相对于视口）
  const rect = event.target.getBoundingClientRect()
  popupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10  // 在建筑物上方显示
  }
}

// 关闭气泡
const closePopup = () => {
  showPopup.value = false
  selectedBuilding.value = null
}

// 点击地图空白处关闭气泡
const handleMapClick = () => {
  closePopup()
}

onMounted(() => {
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('mousemove', doDrag)
  
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
    '外国语学院': { x: 515, y: 240, scale: 0.88 }
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
    switch(e.key) {
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
  <div class="map-container" 
       ref="mapContainer"
       @wheel="handleWheel"
       @mousedown="startDrag"
       @mouseleave="stopDrag"
       @click="handleMapClick">
    <div class="map-controls">
      <button @click="resetView" class="control-button">
        <span>重置视图</span>
      </button>
      <div class="zoom-info">
        缩放: {{ Math.round(scale * 100) }}%
      </div>
    </div>
    
    <div class="map-wrapper" 
         ref="mapWrapper"
         :style="{
           transform: `translate(${currentPos.x}px, ${currentPos.y}px) scale(${scale})`
         }">
      <img src="/1-1.png" alt="Campus Map" class="map-image" />
      
      <!-- 调整 SVG 容器 -->
      <svg class="buildings-layer" 
           viewBox="0 0 2000 2000"
           preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="building-glow">
            <feDropShadow 
              dx="0" 
              dy="0" 
              stdDeviation="10"
              flood-color="#ffffff"
              flood-opacity="1"
            />
          </filter>
        </defs>
        
        <g v-for="building in buildings" 
           :key="building.id"
           :style="{
             transform: `translate(${building.position.x}px, ${building.position.y}px) scale(${building.scale})`,
             transformOrigin: 'center'
           }">
          <path :id="`building-${building.id}`"
                :d="building.path"
                :fill="building.color"
                :class="['building-path', { 'active': activeBuilding === building }]"
                stroke="rgba(255, 255, 255, 0.8)"
                stroke-width="2"
                @mouseenter="handleBuildingHover(building)"
                @mouseleave="handleBuildingLeave(building)"
                @click="handleBuildingClick(building, $event)" />
        </g>
      </svg>
    </div>

    <!-- 更新调试控制面板 -->
    <div v-if="showDebugControls" class="debug-controls">
      <div class="debug-header">
        <h3>SVG 控制面板</h3>
        <button @click="resetSvgPosition" class="reset-button">重置</button>
      </div>

      <!-- 添加建筑物选择 -->
      <div class="control-section">
        <h4>选择建筑物</h4>
        <div class="building-selector">
          <select v-model="selectedBuilding" class="building-select">
            <option :value="null">请选择建筑物</option>
            <option v-for="building in buildings" 
                    :key="building.id"
                    :value="building">
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
                <input 
                  type="number" 
                  v-model.number="selectedBuilding.position.x"
                  step="1"
                />
                <div class="input-controls">
                  <button @click="adjustSvgPosition(-1, 0)">-</button>
                  <button @click="adjustSvgPosition(1, 0)">+</button>
                </div>
              </div>
            </div>
            
            <div class="input-group">
              <label>Y 坐标:</label>
              <div class="input-with-controls">
                <input 
                  type="number" 
                  v-model.number="selectedBuilding.position.y"
                  step="1"
                />
                <div class="input-controls">
                  <button @click="adjustSvgPosition(0, -1)">-</button>
                  <button @click="adjustSvgPosition(0, 1)">+</button>
                </div>
              </div>
            </div>
            
            <div class="input-group">
              <label>缩放比例:</label>
              <div class="input-with-controls">
                <input 
                  type="number" 
                  v-model.number="selectedBuilding.scale"
                  step="0.01"
                  min="0.1"
                  max="3"
                />
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
      <div v-if="showPopup && selectedBuilding" 
           class="building-popup"
           :style="{
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
            <span class="info-value">江湾校区</span>
          </div>
          <div class="info-row">
            <span class="info-label">功能：</span>
            <span class="info-value">教学楼</span>
          </div>
          <div class="info-row">
            <span class="info-label">开放时间：</span>
            <span class="info-value">周一至周日 7:00-22:00</span>
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
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  color: white;
  z-index: 1000;
  width: 240px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  transform: translate(-50%, -100%);
  color: white;
  z-index: 1000;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.building-popup::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(0, 0, 0, 0.85);
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