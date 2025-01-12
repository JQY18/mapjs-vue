<template>
  <div class="admin-login">
    <div class="login-box">
      <div class="header">
        <h2>管理员登录</h2>
        <p class="subtitle">请输入管理员账号和密码</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">
            <el-icon><User /></el-icon>
            用户名
          </label>
          <el-input
            id="username"
            v-model="username"
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="password">
            <el-icon><Lock /></el-icon>
            密码
          </label>
          <el-input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          <el-icon><Warning /></el-icon>
          {{ errorMessage }}
        </div>

        <el-button 
          type="primary"
          :loading="loading"
          class="submit-button"
          @click="handleSubmit"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>

        <div class="back-link">
          <el-button 
            type="text" 
            @click="handleBack"
          >
            返回首页
          </el-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../../api/admin'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await adminApi.login({
      username: username.value,
      password: password.value
    })

    if (data.code === 1) {
      // 登录成功
      localStorage.setItem('adminId', data.data.id)
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      errorMessage.value = '用户名或密码错误'
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f4037 0%, #99f2c8 100%);
  padding: 20px;

  .login-box {
    background: white;
    padding: 40px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      margin: 0;
      color: #1f4037;
      font-size: 24px;
    }

    .subtitle {
      margin: 8px 0 0;
      color: #666;
      font-size: 14px;
    }
  }

  .form-group {
    margin-bottom: 20px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #333;
      font-size: 14px;
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f56c6c;
    margin-bottom: 20px;
    padding: 8px 12px;
    background: #fef0f0;
    border-radius: 4px;
    font-size: 14px;
  }

  .submit-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
  }

  .back-link {
    text-align: center;
    margin-top: 16px;
  }
}
</style> 