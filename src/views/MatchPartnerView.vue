<template>
  <div class="match-partner-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>匹配搭子</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h2>匹配搭子</h2>
      <el-button type="primary" @click="showCreateDialog">发布匹配</el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="selectedInterest" placeholder="选择兴趣" clearable @change="handleInterestChange">
        <el-option
          v-for="interest in interests"
          :key="interest.id"
          :label="interest.name"
          :value="interest.id"
        />
      </el-select>
    </div>

    <!-- 匹配列表 -->
    <div class="match-list">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="实时匹配" name="realtime">
          <div class="realtime-match-container">
            <div v-if="realtimeStatus.isMatching" class="matching-status">
              <el-card class="matching-card">
                <template #header>
                  <div class="card-header">
                    <span>正在匹配中...</span>
                    <el-tag type="warning">{{realtimeStatus.currentNum}}/{{realtimeStatus.limited}}人</el-tag>
                  </div>
                </template>
                <div class="matching-info">
                  <div class="interest-info">
                    <span>选择的兴趣：</span>
                    <el-tag>{{ getInterestName(realtimeStatus.interestId) }}</el-tag>
                  </div>
                  <div class="countdown">
                    <span>倒计时：</span>
                    <span class="time">{{ formatCountdown(countdown) }}</span>
                  </div>
                  <div class="matching-description">
                    系统正在为您匹配相同兴趣的搭子，请耐心等待...
                  </div>
                  <div class="action-buttons">
                    <el-button type="danger" @click="handleCancelRealTimeMatch">取消匹配</el-button>
                  </div>
                </div>
              </el-card>
            </div>
            
            <div v-else class="start-matching">
              <el-card class="start-match-card">
                <template #header>
                  <div class="card-header">
                    <span>开始实时匹配</span>
                  </div>
                </template>
                <div class="start-match-form">
                  <el-form :model="realtimeMatchForm" label-width="100px">
                    <el-form-item label="选择兴趣">
                      <el-select v-model="realtimeMatchForm.interestId" placeholder="请选择兴趣">
                        <el-option
                          v-for="interest in interests"
                          :key="interest.id"
                          :label="interest.name"
                          :value="interest.id"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="匹配人数">
                      <el-input-number v-model="realtimeMatchForm.limited" :min="2" :max="10" />
                    </el-form-item>
                  </el-form>
                  <div class="action-buttons">
                    <el-button type="primary" @click="handleStartRealTimeMatch">开始匹配</el-button>
                  </div>
                  <div class="match-tips">
                    <p>提示：实时匹配将在60秒内为您匹配相同兴趣的搭子，如果在规定时间内匹配成功，系统将自动创建群聊。</p>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="全部匹配" name="all">
          <div v-loading="loading.all" class="match-cards">
            <template v-if="matches.length > 0">
              <el-card v-for="match in matches" :key="match.id" class="match-card">
                <div class="match-header">
                  <span class="interest-tag">{{ getInterestName(match.interestId) }}</span>
                  <span class="member-count">{{ match.currentNum }}/{{ match.limited }}人</span>
                </div>
                <div class="match-description">{{ match.description }}</div>
                <div class="match-footer">
                  <span class="create-time">{{ formatTime(match.createdTime) }}</span>
                  <div class="match-actions">
                    <template v-if="isPublishedByMe(match)">
                      <el-button 
                        v-if="match.currentNum === match.limited"
                        type="danger" 
                        size="small" 
                        @click="handleDelete(match)"
                      >
                        删除记录
                      </el-button>
                      <el-button 
                        v-else
                        type="danger" 
                        size="small" 
                        @click="handleQuit(match)"
                      >
                        取消发布
                      </el-button>
                    </template>
                    <template v-else>
                      <template v-if="match.currentNum === match.limited">
                        <el-tag type="success" size="small">已完成</el-tag>
                      </template>
                      <template v-else>
                        <el-button 
                          v-if="!match.joined" 
                          type="primary" 
                          size="small" 
                          @click="handleJoin(match)"
                        >
                          加入
                        </el-button>
                        <el-button 
                          v-else 
                          type="danger" 
                          size="small" 
                          @click="handleQuit(match)"
                        >
                          退出
                        </el-button>
                      </template>
                    </template>
                  </div>
                </div>
              </el-card>
            </template>
            <el-empty v-else description="暂无匹配" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="我发布的" name="published">
          <div v-loading="loading.published" class="match-cards">
            <template v-if="myPublishedMatches.length > 0">
              <el-card v-for="match in myPublishedMatches" :key="match.id" class="match-card">
                <div class="match-header">
                  <span class="interest-tag">{{ getInterestName(match.interestId) }}</span>
                  <span class="member-count">{{ match.currentNum }}/{{ match.limited }}人</span>
                </div>
                <div class="match-description">{{ match.description }}</div>
                <div class="match-footer">
                  <span class="create-time">{{ formatTime(match.createdTime) }}</span>
                  <div class="match-actions">
                    <el-button 
                      v-if="match.currentNum === match.limited"
                      type="danger" 
                      size="small" 
                      @click="handleDelete(match)"
                    >
                      删除记录
                    </el-button>
                    <el-button 
                      v-else
                      type="danger" 
                      size="small" 
                      @click="handleQuit(match)"
                    >
                      取消发布
                    </el-button>
                  </div>
                </div>
              </el-card>
            </template>
            <el-empty v-else description="暂无发布的匹配" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="我参与的" name="joined">
          <div v-loading="loading.joined" class="match-cards">
            <template v-if="myJoinedMatches.length > 0">
              <el-card v-for="match in myJoinedMatches" :key="match.id" class="match-card">
                <div class="match-header">
                  <span class="interest-tag">{{ getInterestName(match.interestId) }}</span>
                  <span class="member-count">{{ match.currentNum }}/{{ match.limited }}人</span>
                </div>
                <div class="match-description">{{ match.description }}</div>
                <div class="match-footer">
                  <span class="create-time">{{ formatTime(match.createdTime) }}</span>
                  <div class="match-actions">
                    <template v-if="isPublishedByMe(match)">
                      <el-button 
                        v-if="match.currentNum === match.limited"
                        type="danger" 
                        size="small" 
                        @click="handleDelete(match)"
                      >
                        删除记录
                      </el-button>
                      <el-button 
                        v-else
                        type="danger" 
                        size="small" 
                        @click="handleQuit(match)"
                      >
                        取消发布
                      </el-button>
                    </template>
                    <template v-else>
                      <template v-if="match.currentNum === match.limited">
                        <el-tag type="success" size="small">已完成</el-tag>
                      </template>
                      <template v-else>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="handleQuit(match)"
                        >
                          退出
                        </el-button>
                      </template>
                    </template>
                  </div>
                </div>
              </el-card>
            </template>
            <el-empty v-else description="暂无参与的匹配" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 发布匹配对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="发布匹配"
      width="500px"
    >
      <el-form :model="newMatch" label-width="80px">
        <el-form-item label="兴趣">
          <el-select v-model="newMatch.interestId" placeholder="请选择兴趣">
            <el-option
              v-for="interest in interests"
              :key="interest.id"
              :label="interest.name"
              :value="interest.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newMatch.description"
            type="textarea"
            :rows="3"
            placeholder="请输入匹配描述"
          />
        </el-form-item>
        <el-form-item label="人数限制">
          <el-input-number v-model="newMatch.limited" :min="1" :max="25" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import matchApi, { createMatchEventSource } from '@/api/match'
import { formatTime } from '@/utils/time'

// 数据
const activeTab = ref('realtime')
const matches = ref([])
const myPublishedMatches = ref([])
const myJoinedMatches = ref([])
const interests = ref([])
const selectedInterest = ref('')
const createDialogVisible = ref(false)
const loading = ref({
  all: false,
  published: false,
  joined: false
})

const newMatch = ref({
  interestId: '',
  description: '',
  limited: 2
})

// 实时匹配相关数据
const realtimeMatchForm = ref({
  interestId: '',
  limited: 2
})

const realtimeStatus = ref({
  isMatching: false,
  interestId: null,
  limited: 0,
  currentNum: 0,
  startTime: null,
  userId: null
})

const countdown = ref(60)
let countdownTimer = null
let eventSource = null

// 方法
const loadInterests = async () => {
  try {
    const res = await matchApi.getInterests()
    if (res.data && res.data.data) {
      interests.value = res.data.data
    } else {
      ElMessage.warning('兴趣列表数据格式不正确')
    }
  } catch (error) {
    console.error('获取兴趣列表失败:', error)
    ElMessage.error('获取兴趣列表失败')
  }
}

const loadMatches = async () => {
  loading.value.all = true
  try {
    const res = await matchApi.getList(selectedInterest.value)
    if (res.data && res.data.data) {
      matches.value = res.data.data
    } else {
      matches.value = []
    }
  } catch (error) {
    console.error('获取匹配列表失败:', error)
    ElMessage.error('获取匹配列表失败')
    matches.value = []
  } finally {
    loading.value.all = false
  }
}

const loadMyPublishedMatches = async () => {
  loading.value.published = true
  try {
    const res = await matchApi.getMyList()
    if (res.data && res.data.data) {
      myPublishedMatches.value = res.data.data
    } else {
      myPublishedMatches.value = []
    }
  } catch (error) {
    console.error('获取我发布的匹配失败:', error)
    ElMessage.error('获取我发布的匹配失败')
    myPublishedMatches.value = []
  } finally {
    loading.value.published = false
  }
}

const loadMyJoinedMatches = async () => {
  loading.value.joined = true
  try {
    const res = await matchApi.getMyJoinList()
    if (res.data && res.data.data) {
      myJoinedMatches.value = res.data.data
    } else {
      myJoinedMatches.value = []
    }
  } catch (error) {
    console.error('获取我参与的匹配失败:', error)
    ElMessage.error('获取我参与的匹配失败')
    myJoinedMatches.value = []
  } finally {
    loading.value.joined = false
  }
}

const handleInterestChange = () => {
  loadMatches()
}

const showCreateDialog = () => {
  createDialogVisible.value = true
}

const handleCreate = async () => {
  try {
    await matchApi.publish(newMatch.value)
    ElMessage.success('发布成功')
    createDialogVisible.value = false
    loadMatches()
    loadMyPublishedMatches()
  } catch (error) {
    ElMessage.error('发布失败')
  }
}

const getInterestName = (interestId) => {
  const interest = interests.value.find(item => item.id === interestId)
  return interest ? interest.name : '未知兴趣'
}

const isPublishedByMe = (match) => {
  // 假设当前用户ID存储在localStorage中
  const currentUserId = JSON.parse(localStorage.getItem('user')).id 
  return currentUserId && match.publisherId === parseInt(currentUserId)
}

const handleJoin = async (match) => {
  try {
    await matchApi.joinMatch(match.id)
    ElMessage.success('加入成功')
    // 刷新所有列表
    loadMatches()
    loadMyPublishedMatches()
    loadMyJoinedMatches()
  } catch (error) {
    console.error('加入匹配失败:', error)
    ElMessage.error('加入匹配失败')
  }
}

const handleQuit = async (match) => {
  try {
    const action = isPublishedByMe(match) ? '取消发布' : '退出'
    await ElMessageBox.confirm(`确定要${action}该匹配吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (isPublishedByMe(match)) {
      await matchApi.cancelPublish(match.id)
    } else {
      await matchApi.quitMatch(match.id)
    }
    
    ElMessage.success(`${action}成功`)
    // 刷新所有列表
    loadMatches()
    loadMyPublishedMatches()
    loadMyJoinedMatches()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (match) => {
  try {
    await ElMessageBox.confirm('确定要删除该匹配记录吗？删除后将无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await matchApi.deleteMatch(match.id)
    ElMessage.success('删除成功')
    
    // 刷新所有列表
    loadMatches()
    loadMyPublishedMatches()
    loadMyJoinedMatches()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 保存匹配状态到localStorage
const saveMatchStatusToLocalStorage = () => {
  if (realtimeStatus.value.isMatching) {
    localStorage.setItem('realtimeMatchStatus', JSON.stringify({
      isMatching: true,
      interestId: realtimeStatus.value.interestId,
      limited: realtimeStatus.value.limited,
      startTime: realtimeStatus.value.startTime,
      userId: realtimeStatus.value.userId
    }))
  } else {
    localStorage.removeItem('realtimeMatchStatus')
  }
}

// 从localStorage恢复匹配状态
const restoreMatchStatusFromLocalStorage = () => {
  const savedStatus = localStorage.getItem('realtimeMatchStatus')
  if (savedStatus) {
    try {
      const parsedStatus = JSON.parse(savedStatus)
      
      // 检查匹配是否超时（60秒）
      const elapsedTime = (new Date().getTime() - parsedStatus.startTime) / 1000
      if (elapsedTime > 60) {
        // 已超时，清除localStorage
        localStorage.removeItem('realtimeMatchStatus')
        return false
      }
      
      // 恢复匹配状态
      realtimeStatus.value = {
        isMatching: true,
        interestId: parsedStatus.interestId,
        limited: parsedStatus.limited,
        currentNum: 1, // 初始值，会通过SSE更新
        startTime: parsedStatus.startTime,
        userId: parsedStatus.userId
      }
      
      // 尝试重新连接SSE
      startEventSource()
      
      // 重新开始倒计时
      startCountdown()
      
      return true
    } catch (error) {
      console.error('解析保存的匹配状态失败:', error)
      localStorage.removeItem('realtimeMatchStatus')
      return false
    }
  }
  return false
}

// 修改handleStartRealTimeMatch方法，在匹配开始时保存状态
const handleStartRealTimeMatch = async () => {
  if (!realtimeMatchForm.value.interestId) {
    ElMessage.warning('请选择兴趣')
    return
  }
  
  try {
    const res = await matchApi.startRealTimeMatch(realtimeMatchForm.value)
    ElMessage.success('开始匹配')
    
    // 从后端返回值中获取userId
    const userId = res.data && res.data.data ? res.data.data : null
    
    if (!userId) {
      ElMessage.error('获取用户ID失败')
      return
    }
    
    // 使用后端返回的数据更新状态，并添加userId
    realtimeStatus.value = {
      isMatching: true,
      interestId: realtimeMatchForm.value.interestId,
      limited: realtimeMatchForm.value.limited,
      currentNum: 1, // 开始匹配时默认自己已加入
      startTime: new Date().getTime(),
      userId: userId // 保存用户ID
    }
    
    // 保存匹配状态到localStorage
    saveMatchStatusToLocalStorage()
    
    // 开始倒计时
    countdown.value = 60
    startCountdown()
    
    // 开始SSE监听，传入用户ID
    startEventSource()
  } catch (error) {
    console.error('开始实时匹配失败:', error)
    ElMessage.error('开始匹配失败')
  }
}

// 修改handleCancelRealTimeMatch方法，在取消匹配时清除状态
const handleCancelRealTimeMatch = async () => {
  try {
    await ElMessageBox.confirm('确定要取消匹配吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 发送取消请求时只携带兴趣ID和目标人数
    await matchApi.cancelRealTimeMatch({
      interestId: realtimeStatus.value.interestId,
      limited: realtimeStatus.value.limited
    })
    ElMessage.success('已取消匹配')
    
    // 重置状态
    realtimeStatus.value.isMatching = false
    stopCountdown()
    closeEventSource()
    
    // 清除localStorage中的匹配状态
    localStorage.removeItem('realtimeMatchStatus')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消匹配失败:', error)
      ElMessage.error('取消匹配失败')
    }
  }
}

// 修改handleMatchSuccess方法，在匹配成功时清除状态
const handleMatchSuccess = () => {
  stopCountdown()
  closeEventSource()
  
  // 匹配成功提示
  ElMessage.success({
    message: '匹配成功！系统已自动创建群聊',
    duration: 5000
  })
  
  // 重置状态
  realtimeStatus.value.isMatching = false
  
  // 清除localStorage中的匹配状态
  localStorage.removeItem('realtimeMatchStatus')
}

// 修改handleTimeoutMatch方法，在超时时清除状态
const handleTimeoutMatch = async () => {
  try {
    // 发送取消请求
    await matchApi.cancelRealTimeMatch({
      interestId: realtimeStatus.value.interestId,
      limited: realtimeStatus.value.limited
    })
    
    // 更新UI状态
    ElMessage.info('匹配超时，已自动取消')
    realtimeStatus.value.isMatching = false
    stopCountdown()
    closeEventSource()
    
    // 清除localStorage中的匹配状态
    localStorage.removeItem('realtimeMatchStatus')
  } catch (error) {
    console.error('取消匹配失败:', error)
    
    // 即使请求失败，也重置前端状态
    realtimeStatus.value.isMatching = false
    stopCountdown()
    closeEventSource()
    localStorage.removeItem('realtimeMatchStatus')
  }
}

// 修改loadRealtimeMatchStatus方法
const loadRealtimeMatchStatus = async () => {
  // 先尝试从localStorage恢复状态
  if (restoreMatchStatusFromLocalStorage()) {
    // 已从localStorage恢复状态，不需要从后端加载
    return
  }
  
  // 如果无法从localStorage恢复，则从后端加载
  try {
    // 只在初始加载时请求一次状态
    const res = await matchApi.getRealTimeMatchStatus()
    if (res.data && res.data.data) {
      const statusData = res.data.data
      
      // 检查状态数据是否包含用户ID
      if (statusData.isMatching) {
        // 从状态数据中获取userId
        const userId = statusData.userId
        
        if (userId) {
          realtimeStatus.value = {
            isMatching: statusData.isMatching,
            interestId: statusData.interestId,
            limited: statusData.limited,
            currentNum: statusData.currentNum,
            startTime: statusData.startTime,
            userId: userId
          }
          
          // 保存匹配状态到localStorage
          saveMatchStatusToLocalStorage()
          
          // 如果正在匹配，开始倒计时和SSE监听
          if (realtimeStatus.value.isMatching) {
            startCountdown()
            startEventSource()
          }
        } else {
          realtimeStatus.value.isMatching = false
        }
      } else {
        realtimeStatus.value.isMatching = false
      }
    } else {
      realtimeStatus.value.isMatching = false
    }
  } catch (error) {
    console.error('获取实时匹配状态失败:', error)
    realtimeStatus.value.isMatching = false
  }
}

const startCountdown = () => {
  // 清除可能存在的计时器
  stopCountdown()
  
  // 计算剩余时间（如果是重新加载页面）
  if (realtimeStatus.value.startTime) {
    const elapsedTime = Math.floor((new Date().getTime() - realtimeStatus.value.startTime) / 1000)
    countdown.value = Math.max(0, 60 - elapsedTime)
  } else {
    countdown.value = 60
  }
  
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
      // 如果倒计时结束还在匹配状态，则主动发送取消请求
      if (realtimeStatus.value.isMatching) {
        handleTimeoutMatch()
      }
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startEventSource = () => {
  // 关闭可能存在的连接
  closeEventSource()
  
  // 确保有用户ID
  if (!realtimeStatus.value.userId) {
    console.error('没有用户ID，无法建立SSE连接')
    return
  }
  
  try {
    // 创建SSE连接，传入用户ID、兴趣ID和目标人数
    eventSource = createMatchEventSource(
      realtimeStatus.value.userId,
      realtimeStatus.value.interestId,
      realtimeStatus.value.limited
    )
    
    // 监听状态更新事件
    eventSource.addEventListener('matchUpdate', (event) => {
      try {
        // 后端直接发送当前人数作为数据
        const currentNum = parseInt(event.data)
        if (!isNaN(currentNum)) {
          // 更新当前人数，保留其他状态不变
          realtimeStatus.value.currentNum = currentNum
          
          // 如果匹配成功（人数达到要求）
          if (realtimeStatus.value.currentNum >= realtimeStatus.value.limited) {
            // 不主动触发匹配成功逻辑，等待后端发送matchSuccess事件
            console.log('匹配人数已满，等待后端确认...')
          }
        }
      } catch (error) {
        console.error('处理matchUpdate事件失败:', error)
      }
    })
    
    // 监听匹配成功事件
    eventSource.addEventListener('matchSuccess', (event) => {
      // 后端只发送简单消息，不包含额外数据
      handleMatchSuccess()
    })
    
    // 监听匹配超时事件
    eventSource.addEventListener('matchTimeout', (event) => {
      // 后端只发送简单消息，不包含额外数据
      handleTimeoutMatch()
    })
    
    // 监听错误
    eventSource.addEventListener('error', (error) => {
      console.error('SSE连接错误:', error)
      // 如果连接出错且正在匹配，尝试重新连接
      if (realtimeStatus.value.isMatching) {
        fallbackToPolling()
      }
    })
  } catch (error) {
    console.error('创建SSE连接失败:', error)
    fallbackToPolling()
  }
}

const closeEventSource = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

// 完全移除fallbackToPolling方法的实现，不再使用轮询
const fallbackToPolling = () => {
  console.warn('SSE连接失败，尝试重新连接')
  // 延迟2秒后重新连接SSE
  setTimeout(() => {
    if (realtimeStatus.value.isMatching) {
      startEventSource()
    }
  }, 2000)
}

const formatCountdown = (seconds) => {
  return `${seconds}秒`
}

const handleTabClick = (tab) => {
  const tabName = tab.props.name
  if (tabName === 'all') {
    loadMatches()
  } else if (tabName === 'published') {
    loadMyPublishedMatches()
  } else if (tabName === 'joined') {
    loadMyJoinedMatches()
  } else if (tabName === 'realtime') {
    loadRealtimeMatchStatus()
  }
}

// 生命周期
onMounted(() => {
  loadInterests()
  loadRealtimeMatchStatus()
  
  // 根据当前标签页加载对应数据
  if (activeTab.value === 'all') {
    loadMatches()
  } else if (activeTab.value === 'published') {
    loadMyPublishedMatches()
  } else if (activeTab.value === 'joined') {
    loadMyJoinedMatches()
  }
})

onUnmounted(() => {
  // 清除所有计时器和事件源
  stopCountdown()
  closeEventSource()
})
</script>
<style scoped>
.match-partner-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.match-list {
  margin-top: 20px;
}

.match-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  min-height: 200px;
}

.match-card {
  height: 100%;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.interest-tag {
  padding: 4px 8px;
  background-color: #f0f9eb;
  color: #67c23a;
  border-radius: 4px;
  font-size: 12px;
}

.member-count {
  color: #909399;
  font-size: 14px;
}

.match-description {
  margin: 10px 0;
  color: #606266;
  font-size: 14px;
}

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.create-time {
  color: #909399;
  font-size: 12px;
}

.match-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 实时匹配相关样式 */
.realtime-match-container {
  padding: 20px 0;
}

.matching-card, .start-match-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.matching-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.interest-info, .countdown {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.matching-description {
  margin: 15px 0;
  color: #606266;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.start-match-form {
  padding: 10px 0;
}

.match-tips {
  margin-top: 20px;
  padding: 10px;
  background-color: #f4f4f5;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}
</style> 
