<template>
  <div class="home">
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
  { id: 'circle', name: '师大圈', path: '/circle' },
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
  return path === `/${tabId}`
}

const navigateTo = (tabId) => {
  if (tabId === 'login') {
    router.push('/login')
    return
  }
  
  const tab = allTabs.find(t => t.id === tabId)
  if (tab) {
    router.push(tab.path)
  }
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

.tabs {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item:hover {
  background-color: #e8e8e8;
}

.tab-item.active {
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
}

.content {
  flex: 1;
  position: relative;
  padding: 0;
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
</style>
