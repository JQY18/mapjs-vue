<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <img src="/public/icon/icon.jpeg" alt="Logo" class="logo" />
        <span v-if="!isCollapsed" class="logo-text">管理系统</span>
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
        
        <el-menu-item index="/admin/admins">
          <el-icon><User /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/locations">
          <el-icon><Location /></el-icon>
          <span>地点管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
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
              <el-avatar 
                :size="32" 
                :icon="User"
                class="admin-avatar"
              />
              <span class="level">{{ adminLevel }}:</span>
              <span class="username">{{ adminName }}</span>
              <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">修改密码</el-dropdown-item>
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

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="updating"
          @click="handleUpdatePassword"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DataBoard,
  User,
  Location,
  ChatDotRound,
  Expand,
  Fold,
  CaretBottom
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../../api/admin'

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const adminAvatar = ref('/public/icon/icon.jpeg')

// 管理员等级
const adminLevel = ref("普通管理员")

const adminName = ref('Admin')
// 管理员权限
const adminLocationId = ref(null)


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


onMounted(() => {
  const adminId = localStorage.getItem('adminId')
  if (!adminId) {
    router.push('/admin/login')
  }
  adminApi.getInfo().then(({ data }) => {
    if (data.code === 1) {
      adminName.value = data.data.username
      adminLocationId.value = data.data.locationId
      if (data.data.locationId === 0) {
        adminLevel.value = "超级管理员"
      } else{
        adminLevel.value = "普通管理员"
      }
    }
  })
})

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const updating = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleCommand = (command) => {
  if (command === 'profile') {
    // 重置表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    passwordDialogVisible.value = true
  } else if (command === 'logout') {
    localStorage.removeItem('adminId')
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    updating.value = true
    
    const { data } = await adminApi.updatePassword({
      id: localStorage.getItem('adminId'),
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (data.code === 1) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    } else {
      ElMessage.error(data.msg || '密码修改失败')
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    updating.value = false
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
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }

  .admin-avatar {
    background-color: #1890ff;
    color: #fff;
  }

  .level {
    font-size: 13px;
    color: #666;
    font-weight: 500;
  }

  .username {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .dropdown-icon {
    font-size: 12px;
    color: #999;
    margin-left: 4px;
  }
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
