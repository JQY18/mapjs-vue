<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="请输入密码"
          />
        </div>

        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (isLoading.value) return
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟登录成功
    const user = {
      id: 1,
      username: username.value,
      avatar: '/public/icon/icon.jpeg'
    }
    
    localStorage.setItem('user', JSON.stringify(user))
    
    // 获取重定向路径
    const redirectPath = localStorage.getItem('redirectPath') || '/'
    localStorage.removeItem('redirectPath')
    
    // 触发登录成功事件
    router.push(redirectPath)
  } catch (error) {
    errorMessage.value = '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-box {
  background: white;
  padding: 32px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 24px 0;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  border-color: #1890ff;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #40a9ff;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4d4f;
  margin-bottom: 16px;
  font-size: 14px;
}
</style> 