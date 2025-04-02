<template>
  <div class="register-container">
    <div class="register-content">
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
              @blur="validateNickname"
            />
            <div class="field-error" v-if="errors.nickname">{{ errors.nickname }}</div>
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
              @blur="validateUsername"
            />
            <div class="field-error" v-if="errors.username">{{ errors.username }}</div>
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
              @blur="validatePassword"
            />
            <div class="field-error" v-if="errors.password">{{ errors.password }}</div>
          </div>
          
          <div class="form-group">
            <label for="email">
              <Icon icon="mdi:email" class="input-icon"/>
              邮箱
            </label>
            <div class="input-with-button">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="请输入邮箱"
                class="input-with-icon"
                @blur="validateEmail"
              />
              <button 
                type="button" 
                @click="sendCode" 
                :disabled="!canSendCode || isCodeSending || cooldown > 0" 
                class="code-button"
              >
                {{ cooldown > 0 ? `${cooldown}秒后重试` : '发送验证码' }}
              </button>
            </div>
            <div class="field-error" v-if="errors.email">{{ errors.email }}</div>
          </div>
          
          <div class="form-group">
            <label for="code">
              <Icon icon="mdi:numeric" class="input-icon"/>
              验证码
            </label>
            <input
              id="code"
              v-model="code"
              type="text"
              required
              placeholder="请输入验证码"
              class="input-with-icon"
              @blur="validateCode"
            />
            <div class="field-error" v-if="errors.code">{{ errors.code }}</div>
          </div>

          <div class="error-message" v-if="errorMessage">
            <Icon icon="mdi:alert-circle" class="error-icon"/>
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="!canSubmit || isLoading" class="submit-button">
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
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api/user'
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
const router = useRouter()
const nickname = ref('')
const username = ref('')
const password = ref('')
const email = ref('')
const code = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const isCodeSending = ref(false)
const cooldown = ref(0)
let cooldownTimer = null

// 错误信息对象
const errors = ref({
  nickname: '',
  username: '',
  password: '',
  email: '',
  code: ''
})

// 验证昵称
const validateNickname = () => {
  if (!nickname.value) {
    errors.value.nickname = '请输入昵称'
    return false
  }
  if (nickname.value.length < 2 || nickname.value.length > 20) {
    errors.value.nickname = '昵称长度应为2-20个字符'
    return false
  }
  errors.value.nickname = ''
  return true
}

// 验证用户名
const validateUsername = () => {
  if (!username.value) {
    errors.value.username = '请输入用户名'
    return false
  }
  if (username.value.length < 4 || username.value.length > 20) {
    errors.value.username = '用户名长度应为4-20个字符'
    return false
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    errors.value.username = '用户名只能包含字母、数字和下划线'
    return false
  }
  errors.value.username = ''
  return true
}

// 验证密码
const validatePassword = () => {
  if (!password.value) {
    errors.value.password = '请输入密码'
    return false
  }
  if (password.value.length < 6 || password.value.length > 20) {
    errors.value.password = '密码长度应为6-20个字符'
    return false
  }
  errors.value.password = ''
  return true
}

// 验证邮箱
const validateEmail = () => {
  if (!email.value) {
    errors.value.email = '请输入邮箱'
    return false
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址'
    return false
  }
  errors.value.email = ''
  return true
}

// 验证验证码
const validateCode = () => {
  if (!code.value) {
    errors.value.code = '请输入验证码'
    return false
  }
  if (!/^[a-zA-Z0-9]{6}$/.test(code.value)) {
    errors.value.code = '验证码应为6位字母或数字'
    return false
  }
  errors.value.code = ''
  return true
}

// 验证所有基本字段（不包括验证码）
const validateBasicFields = () => {
  const isNicknameValid = validateNickname()
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  const isEmailValid = validateEmail()
  
  return isNicknameValid && isUsernameValid && isPasswordValid && isEmailValid
}

// 判断是否可以发送验证码
const canSendCode = computed(() => {
  return validateBasicFields()
})

// 判断是否可以提交表单
const canSubmit = computed(() => {
  return canSendCode.value && validateCode()
})

// 发送验证码
const sendCode = async () => {
  if (isCodeSending.value || cooldown.value > 0 || !canSendCode.value) return
  
  errorMessage.value = ''
  isCodeSending.value = true
  
  try {
    const { data } = await userApi.sendEmailCode(email.value)
    
    if (data.code === 1) {
      // 发送成功，开始倒计时
      cooldown.value = 60
      cooldownTimer = setInterval(() => {
        cooldown.value--
        if (cooldown.value <= 0) {
          clearInterval(cooldownTimer)
        }
      }, 1000)
    } else {
      errorMessage.value = data.msg || '验证码发送失败，请重试'
    }
  } catch (error) {
    errorMessage.value = '验证码发送失败，请检查网络连接'
    console.error(error)
  } finally {
    isCodeSending.value = false
  }
}

// 注册提交
const handleSubmit = async () => {
  if (isLoading.value || !canSubmit.value) return
  
  // 再次验证所有字段
  if (!validateBasicFields() || !validateCode()) {
    return
  }
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const { data } = await userApi.register({
      nickname: nickname.value,
      username: username.value,
      password: password.value,
      email: email.value,
      code: code.value
    })
    
    if (data.code === 1) {
      ElMessage.success("注册成功!")
      // 注册成功，跳转到登录页
      router.push('/login')
    } else {
      errorMessage.value = data.msg || '注册失败，请重试'
    }
  } catch (error) {
    errorMessage.value = '注册失败，请检查网络连接'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 组件销毁时清除定时器
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
.register-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.register-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-box {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}

label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
}

.input-icon {
  font-size: 16px;
  color: #666;
}

.input-with-icon {
  width: 95%;
  padding: 10px 0px 10px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button .input-with-icon {
  flex: 1;
}

.code-button {
  min-width: 110px;
  white-space: nowrap;
  padding: 0 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.code-button:hover:not(:disabled) {
  background: #40a9ff;
}

.code-button:disabled {
  background: #bfbfbf;
  cursor: not-allowed;
}

.input-with-icon:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  outline: none;
}

.field-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  padding-left: 2px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff4d4f;
  margin-bottom: 12px;
  font-size: 13px;
  padding: 6px 10px;
  background: #fff2f0;
  border-radius: 6px;
}

.error-icon {
  font-size: 16px;
}

.submit-button {
  width: 100%;
  padding: 10px;
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
  font-size: 18px;
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
  margin-top: 14px;
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
    padding: 25px 15px;
  }

  h2 {
    font-size: 22px;
  }
  
  .form-group {
    margin-bottom: 14px;
  }
  
  .input-with-icon {
    padding: 8px 0px 8px 12px;
  }
}

@media (max-height: 700px) {
  .header {
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 12px;
  }
  
  .input-with-icon {
    padding: 8px 0px 8px 12px;
  }
}
</style> 