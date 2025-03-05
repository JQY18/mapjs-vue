<template>
  <div class="home">
    <!-- 添加头部 -->
    <div class="header">
      <div class="logo-container">
        <img src="/images/logo.png" alt="湖南师范大学" class="logo">
        <div class="gate-bg"></div>
      </div>
    </div>

    <!-- 顶部选项卡 -->
    <div class="tabs">
      <div 
        v-for="tab in allTabs" 
        :key="tab.id"
        :class="['tab-item', { active: isActive(tab.id) }]"
        @click="navigateTo(tab.id)"
      >
        {{ tab.name }}
      </div>
      <template v-if="!isLoggedIn">
        <div class="tab-item" @click="navigateTo('login')">
          登录
        </div>
      </template>
      <template v-else>
        <div class="tab-item" @click="confirmLogout">
          退出
        </div>
      </template>
    </div>
    
    <!-- 添加确认对话框 -->
    <div v-if="showLogoutConfirm" class="logout-confirm-overlay">
      <div class="logout-confirm-dialog">
        <h3>确认退出</h3>
        <p>确定要退出登录吗？</p>
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="showLogoutConfirm = false">取消</button>
          <button class="confirm-btn" @click="handleLogout">确定</button>
        </div>
      </div>
    </div>

    <!-- 生活措施对话框 -->
    <div v-if="showFacilitiesDialog" class="facilities-dialog-overlay" @click="showFacilitiesDialog = false">
      <div class="facilities-dialog" @click.stop>
        <div class="facilities-header">
          <h3>生活设施</h3>
          <button class="close-btn" @click="showFacilitiesDialog = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="facilities-grid">
          <div v-for="option in facilityOptions" 
               :key="option.id" 
               class="facility-item"
               @click="handleFacilityClick(option)">
            <Icon :icon="option.icon" class="facility-icon" />
            <span class="facility-name">{{ option.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设施列表对话框 -->
    <FacilityList
      v-if="showFacilityList"
      :type="selectedFacilityType"
      @close="showFacilityList = false"
      @select-facility="handleSelectFacility"
    />

    <!-- 内容区域 -->
    <div class="content">
      <router-view v-slot="{ Component }">
        <component :is="Component" @login-success="checkLoginStatus" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '../api/user'
import { Icon } from '@iconify/vue'
import FacilityList from '../components/FacilityList.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const isLoggedIn = ref(false)

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('user')
}

onMounted(() => {
  checkLoginStatus()
})

const allTabs = [
  { id: 'map', name: '地图', path: '/' },
  { id: '3dmap-home', name: '3D地图', path: '/3dmap-home' },
  { id: 'circle', name: '师大圈', path: '/circle' },
  { id: 'facilities', name: '生活设施', path: '#' },
  { id: 'personal', name: '我的', path: '/personal' }
]

const showLogoutConfirm = ref(false)

const confirmLogout = () => {
  showLogoutConfirm.value = true
}

const handleLogout = () => {
  userApi.logout()
  showLogoutConfirm.value = false
  if (route.path === '/personal') {
    router.push('/')
  }
  isLoggedIn.value = false
}

const isActive = (tabId) => {
  const path = route.path
  if (tabId === 'map' && (path === '/' || path.startsWith('/location'))) {
    return true
  }
  if (tabId === '3dmap' && path === '/3dmap') {
    return true
  }
  return path === `/${tabId}`
}

const showFacilitiesDialog = ref(false)

const facilityOptions = [
  { id: 'canteen', name: '食堂餐厅', icon: 'mdi:food-fork-drink' },
  { id: 'shop', name: '购物超市', icon: 'mdi:cart' },
  { id: 'medical', name: '校内医疗', icon: 'mdi:hospital' },
  { id: 'delivery', name: '邮寄快递', icon: 'mdi:truck-delivery' },
  { id: 'dormitory', name: '学生宿舍', icon: 'mdi:shower' },
  { id: 'stadium', name: '校内场馆', icon: 'mdi:stadium' },
  { id: 'print', name: '打字复印', icon: 'mdi:printer' },
  { id: 'bank', name: '银行网点', icon: 'mdi:currency-cny' },
  { id: 'aed', name: 'AED', icon: 'mdi:heart-pulse' },
  { id: 'telecom', name: '通信营业厅', icon: 'mdi:phone' },
  { id: 'parking', name: '停车场', icon: 'mdi:parking' },
  { id: 'entrance', name: '出入口', icon: 'mdi:exit-to-app' }
]

const navigateTo = (tabId) => {
  if (tabId === 'login') {
    router.push('/login')
    return
  }
  
  if (tabId === 'facilities') {
    if (route.path !== '/') {
      router.push('/').then(() => {
        setTimeout(() => {
          showFacilitiesDialog.value = true
        }, 100)
      })
    } else {
      showFacilitiesDialog.value = true
    }
    return
  }

  if(tabId === 'personal'){
    if (isLoggedIn.value) {
      const user = JSON.parse(localStorage.getItem('user'))
      router.push(`/personal/${user.id}`)
    } else {
      router.push('/login')
    }
    return
  }
  
  const tab = allTabs.find(t => t.id === tabId)
  if (tab) {
    router.push(tab.path)
  }
}

const showFacilityList = ref(false)
const selectedFacilityType = ref(null)

const handleFacilityClick = (option) => {
  showFacilitiesDialog.value = false
  selectedFacilityType.value = option
  showFacilityList.value = true
}

const handleSelectFacility = (facility) => {
  showFacilityList.value = false
  router.push({
    path: '/',
    query: {
      facility: selectedFacilityType.value.id,
      id: facility.id,
      coords: facility.coords.join(','),
      name: facility.name,
      description: facility.description,
      showEmergencyMarker: 'true'
    }
  })
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 添加头部样式 */
.header {
  background-color: #990000;  /* 学校红色背景 */
  padding: 10px 20px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  max-width: 1500px;
  margin: 0;
  position: relative;
  height: 50px;
}

.logo {
  height: 50px;
  width: auto;
  margin-left: 0;
}

.gate-bg {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: url('/images/gate.png') no-repeat right center;
  background-size: contain;
  margin-right: 20px;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .logo {
    height: 40px;
    margin-left: 10px;
  }
  
  .gate-bg {
    width: 200px;
    margin-right: 10px;
  }
}

/* 调整原有样式以适应新的头部 */
.tabs {
  display: flex;
  background-color: rgb(107, 1, 1);
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  height: 50px;
}

.tab-item {
  padding: 15px 24px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.tab-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: white;
  border-bottom: 2px solid white;
  background-color: rgba(255, 255, 255, 0.1);
}

.content {
  flex: 1;
  position: relative;
  overflow: hidden;

}

.logout-confirm-overlay {
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

.logout-confirm-dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.logout-confirm-dialog h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.logout-confirm-dialog p {
  margin: 0 0 24px 0;
  color: #666;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  background: #ff4d4f;
  color: white;
}

.confirm-btn:hover {
  background: #ff7875;
}

.facilities-dialog-overlay {
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

.facilities-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.facilities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.facilities-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
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

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.facility-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgb(107, 1, 1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.facility-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.facility-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.facility-name {
  font-size: 14px;
  text-align: center;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .facilities-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
