<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <img src="/public/icon/icon.jpeg" alt="Logo" class="logo" />
        <span v-if="!isCollapsed" class="logo-text">校园地图管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapsed"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/locations">
          <el-icon><Location /></el-icon>
          <span>地点管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
      </el-menu>

      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="adminAvatar" />
              <span class="username">{{ adminName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DataBoard,
  User,
  Location,
  ChatDotRound,
  Expand,
  Fold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const adminAvatar = ref('/public/icon/icon.jpeg')
const adminName = ref('Admin')

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => {
  const routeMap = {
    '/admin': '仪表盘',
    '/admin/users': '用户管理',
    '/admin/locations': '地点管理',
    '/admin/comments': '评论管理'
  }
  return routeMap[route.path] || '仪表盘'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    router.push('/admin/login')
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  height: 100%;
  background-color: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  
  &.collapsed {
    width: 64px;
    
    .logo-text {
      display: none;
    }
  }
}

.logo-container {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: #f0f2f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
