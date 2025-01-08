<template>
  <div class="location-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <Icon icon="mdi:arrow-left" /> 返回
      </button>
      <h1>{{ detail?.name }}</h1>
    </div>

    <div class="main-container">
      <div class="content">
        <div class="content-wrapper">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              :class="['tab-button', { active: currentTab === tab.value }]"
              @click="currentTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <div v-if="currentTab === 'description'" class="description-tab">
              <div class="description-content">
                <p>{{ detail?.description }}</p>
              </div>
            </div>

            <div v-if="currentTab === 'images'" class="carousel-container">
              <div class="carousel">
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                  <img 
                    v-for="(image, index) in detail?.images" 
                    :key="index"
                    :src="image"
                    :alt="`${detail?.name} - 图片 ${index + 1}`"
                  >
                </div>
                <button class="carousel-btn prev" @click="prevImage" v-if="detail?.images?.length > 1">
                  <Icon icon="mdi:chevron-left" />
                </button>
                <button class="carousel-btn next" @click="nextImage" v-if="detail?.images?.length > 1">
                  <Icon icon="mdi:chevron-right" />
                </button>
                <div class="carousel-counter" v-if="detail?.images?.length > 1">
                  {{ currentImageIndex + 1 }}/{{ detail?.images?.length }}
                </div>
                <div class="carousel-indicators" v-if="detail?.images?.length > 1">
                  <button 
                    v-for="(_, index) in detail?.images" 
                    :key="index"
                    :class="['indicator', { active: currentImageIndex === index }]"
                    @click="currentImageIndex = index"
                  ></button>
                </div>
              </div>
            </div>

            <div v-if="currentTab === 'videos'" class="carousel-container">
              <div class="carousel">
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentVideoIndex * 100}%)` }">
                  <video 
                    v-for="(video, index) in detail?.videos"
                    :key="index"
                    controls
                    :src="video"
                  ></video>
                </div>
                <button class="carousel-btn prev" @click="prevVideo" v-if="detail?.videos?.length > 1">
                  <Icon icon="mdi:chevron-left" />
                </button>
                <button class="carousel-btn next" @click="nextVideo" v-if="detail?.videos?.length > 1">
                  <Icon icon="mdi:chevron-right" />
                </button>
                <div class="carousel-indicators" v-if="detail?.videos?.length > 1">
                  <button 
                    v-for="(_, index) in detail?.videos" 
                    :key="index"
                    :class="['indicator', { active: currentVideoIndex === index }]"
                    @click="currentVideoIndex = index"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="comments-wrapper" :class="{ 'comments-open': showComments }">
        <button class="toggle-comments" @click="showComments = !showComments">
          <Icon :icon="showComments ? 'mdi:close' : 'ic:baseline-comment'" class="comment-icon"/>
        </button>
        
        <div class="comments-section" v-show="showComments">
          <h2>访客评论</h2>
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              :placeholder="isLoggedIn ? '写下你的评论...' : '登录后发表评论'"
              @click="handleCommentClick"
              :disabled="!isLoggedIn"
            ></textarea>
            <button 
              class="submit-btn"
              @click="handleAddComment"
              :disabled="!isLoggedIn || !newComment.trim()"
            >
              {{ isLoggedIn ? '发表评论' : '请先登录' }}
            </button>
          </div>

          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <div class="comment-header">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ comment.time }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

const detail = ref({
  name: "逸夫图书馆",
  description: `中央图书馆是一座现代化的多功能图书馆，建筑面积达50,000平方米，共有8层。
  
  馆内设施：
  - 24小时自习室
  - 电子阅览室
  - 多媒体学习中心
  - 研讨间
  - 报刊阅览区
  
  图书馆藏书量超过200万册，订阅中外文期刊4000余种，并提供丰富的电子资源和数据库访问服务。`,
  images: [
    "https://images.unsplash.com/photo-1568667256549-094345857637",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3",
    "https://images.unsplash.com/photo-1526721940322-10fb6e3ae94a",
    "https://images.unsplash.com/photo-1562932831-afcfe48b5786"
  ],
  videos: [
    "/videos/video.mp4",
  ]
})

const showComments = ref(false)
const currentTab = ref('description')

const tabs = [
  { label: '描述', value: 'description' },
  { label: '图片', value: 'images' },
  { label: '视频', value: 'videos' }
]

const comments = ref([
  {
    id: "1",
    username: "张同学",
    time: "2024-03-15 14:30",
    content: "图书馆环境很好，自习室经常爆满，建议早点来占座。"
  },
  {
    id: "2", 
    username: "李同学",
    time: "2024-03-14 16:20",
    content: "一楼的借阅大厅藏书很丰富，工作人员服务态度也很好。"
  },
  {
    id: "3",
    username: "王老师",
    time: "2024-03-13 09:45", 
    content: "图书馆的电子资源非常全面，对教学科研很有帮助。"
  },
  {
    id: "4",
    username: "刘同学",
    time: "2024-03-12 20:15",
    content: "晚上自习的时候环境安静，空调温度也很舒适。"
  }
])

const newComment = ref('')

const currentImageIndex = ref(0)
const currentVideoIndex = ref(0)

const nextImage = () => {
  if (!detail.value?.images) return
  currentImageIndex.value = (currentImageIndex.value + 1) % detail.value.images.length
}

const prevImage = () => {
  if (!detail.value?.images) return
  currentImageIndex.value = currentImageIndex.value === 0 
    ? detail.value.images.length - 1 
    : currentImageIndex.value - 1
}

const nextVideo = () => {
  if (!detail.value?.videos) return
  currentVideoIndex.value = (currentVideoIndex.value + 1) % detail.value.videos.length
}

const prevVideo = () => {
  if (!detail.value?.videos) return
  currentVideoIndex.value = currentVideoIndex.value === 0 
    ? detail.value.videos.length - 1 
    : currentVideoIndex.value - 1
}

onMounted(async () => {
  // 这里需要根据 route.params.id 获取位置详情
  // 实际项目中应该从API获取数据
})

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})

const handleCommentClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

const handleAddComment = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) return
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  comments.value.unshift({
    id: String(comments.value.length + 1),
    username: user.username || '访客用户',
    time: new Date().toLocaleString(),
    content: newComment.value
  })
  
  newComment.value = ''
}
</script>

<style scoped>
.location-detail {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 20px;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  background: white;
}

.main-container {
  display: flex;
  position: relative;
  gap: 20px;
  flex: 1;
  overflow: visible;
  background: #f5f5f5;
}

.content {
  flex: 1;
  padding: 0 20px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  justify-content: center;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #e0e0e0;
}

.tab-button.active {
  background: #1a73e8;
  color: white;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  overflow: visible;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.description-tab {
  padding: 20px;
  height: 100%;
  background: white;
  border-radius: 12px;
}

.description-content {
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.8;
  white-space: pre-line;
  font-size: 15px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-grid img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-list video {
  width: 100%;
  border-radius: 8px;
}

.comments-wrapper {
  position: fixed;
  right: -400px;
  top: 0;
  height: 100%;
  width: 400px;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
}

.comments-wrapper.comments-open {
  right: 0;
}

.toggle-comments {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px 0 0 8px;
  background: #1a73e8;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.comment-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  font-size: 20px;
}

.comments-section {
  max-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
}

.time {
  color: #666;
  font-size: 0.9em;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.carousel-container {
  width: 100%;
  min-height: 400px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.carousel-inner {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.carousel-inner img,
.carousel-inner video {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  object-fit: contain;
  background: #f5f5f5;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: background 0.3s;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.carousel-counter {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.back-button:hover {
  background: #e0e0e0;
}

h1 {
  font-size: 20px;
  margin: 0;
}

.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.comment-form textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.submit-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 