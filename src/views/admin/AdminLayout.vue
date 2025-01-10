<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <img src="/images/logo.png" alt="Logo" class="logo" />
        <br>
        <span v-if="!isCollapsed" class="logo-text">管理后台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapsed"
        @select="handleSelect"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/admin">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/locations">
          <el-icon><Location /></el-icon>
          <template #title>地点管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/media">
          <el-icon><Picture /></el-icon>
          <template #title>媒体管理</template>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button 
          type="text" 
          class="collapse-btn"
          @click="toggleCollapse"
        >
          <el-icon>
            <component :is="isCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>
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
  ChatDotRound,
  Location,
  Picture,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import { adminApi } from '../../api/admin'
import { ElMessage } from 'element-plus'

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
    '/admin/comments': '评论管理',
    '/admin/locations': '地点管理',
    '/admin/media': '媒体管理'
  }
  return routeMap[route.path] || '仪表盘'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleSelect = (index) => {
  router.push(index)
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await adminApi.logout()
      localStorage.removeItem('adminToken')
      router.push('/admin/login')
      ElMessage.success('退出成功')
    } catch (error) {
      ElMessage.error('退出失败')
    }
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  
  &.collapsed {
    width: 64px;
  }
}

.logo-container {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .logo-text {
    color: white;
    font-size: 18px;
    font-weight: 500;
  }
}

.sidebar-menu {
  flex: 1;
  border: none;
  
  :deep(.el-menu-item) {
    &:hover, &.is-active {
      background-color: #1890ff !important;
    }
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .collapse-btn {
    width: 100%;
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
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
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-right {
  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    .username {
      font-size: 14px;
      color: #666;
    }
  }
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 