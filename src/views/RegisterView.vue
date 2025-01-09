<template>
  <div class="register-container">
    <div class="register-box">
      <div class="header">
        <h2>注册账号</h2>
        <p class="subtitle">欢迎加入我们的社区</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="nickname">
            <Icon icon="mdi:account" class="input-icon"/>
            昵称
          </label>
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            required
            placeholder="请输入昵称"
            class="input-with-icon"
          />
        </div>

        <div class="form-group">
          <label for="username">
            <Icon icon="mdi:account-key" class="input-icon"/>
            用户名
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="请输入用户名"
            class="input-with-icon"
          />
        </div>
        
        <div class="form-group">
          <label for="password">
            <Icon icon="mdi:lock" class="input-icon"/>
            密码
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="请输入密码"
            class="input-with-icon"
          />
        </div>

        <div class="error-message" v-if="errorMessage">
          <Icon icon="mdi:alert-circle" class="error-icon"/>
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          <span class="button-content">
            <Icon :icon="isLoading ? 'mdi:loading' : 'mdi:account-plus'" 
                  class="button-icon" 
                  :class="{ 'spin': isLoading }"/>
            {{ isLoading ? '注册中...' : '立即注册' }}
          </span>
        </button>

        <div class="login-link">
          已有账号？<router-link to="/login" class="link">去登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api/user'
import { Icon } from '@iconify/vue'

const router = useRouter()
const nickname = ref('')
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (isLoading.value) return
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const { data } = await userApi.register({
      nickname: nickname.value,
      username: username.value,
      password: password.value
    })
    
    if (data.code === 1) {
      // 注册成功，跳转到登录页
      router.push('/login')
    } else {
      errorMessage.value = data.msg || '注册失败，请重试'
    }
  } catch (error) {
    errorMessage.value = '注册失败，请检查网络连接'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
}

.input-icon {
  font-size: 18px;
  color: #666;
}

.input-with-icon {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-with-icon:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  outline: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff4d4f;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 8px 12px;
  background: #fff2f0;
  border-radius: 6px;
}

.error-icon {
  font-size: 16px;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-button:hover:not(:disabled) {
  background: #40a9ff;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background: #bfbfbf;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-icon {
  font-size: 20px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
  }

  h2 {
    font-size: 24px;
  }
}
</style> 