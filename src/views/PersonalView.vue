<template>
  <div class="personal-container">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <img :src="userInfo.avatar" class="user-avatar" />
      <h2 class="username">{{ userInfo.name }}</h2>
      <div class="user-stats">
        <div 
          class="stat-item"
          :class="{ active: currentTab === 'posts' }"
          @click="switchTab('posts')"
        >
          <div class="stat-value">{{ userInfo.posts }}</div>
          <div class="stat-label">动态</div>
        </div>
        <div 
          class="stat-item"
          :class="{ active: currentTab === 'followers' }"
          @click="switchTab('followers')"
        >
          <div class="stat-value">{{ userInfo.followers }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div 
          class="stat-item"
          :class="{ active: currentTab === 'following' }"
          @click="switchTab('following')"
        >
          <div class="stat-value">{{ userInfo.following }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div 
          class="stat-item"
          :class="{ active: currentTab === 'collections' }"
          @click="switchTab('collections')"
        >
          <div class="stat-value">{{ userInfo.collections }}</div>
          <div class="stat-label">收藏</div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="scroll-container">
        <!-- 动态列表 -->
        <div v-if="currentTab === 'posts'" class="tab-content">
          <div v-for="post in userPosts" :key="post.id" class="post-card">
            <div class="post-header">
              <img :src="post.avatar" class="avatar" />
              <div class="user-info">
                <div class="username">{{ post.username }}</div>
                <div class="post-time">{{ post.time }}</div>
              </div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-actions">
              <div 
                class="action-item"
                :class="{ 'liked': post.isLiked }"
                @click="toggleLike(post)"
              >
                <Icon :icon="post.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'" /> 
                {{ post.likes }}
              </div>
              <div 
                class="action-item"
                @click="openComments(post)"
              >
                <Icon icon="mdi:comment-outline" /> {{ post.comments }}
              </div>
              <div 
                v-if="post.images?.length"
                class="action-item"
                @click="openImageViewer(post.images)"
              >
                <Icon icon="mdi:image" /> {{ post.images.length }}
              </div>
              <div 
                class="action-item"
                :class="{ 'collected': post.isCollected }"
                @click="toggleCollect(post)"
              >
                <Icon :icon="post.isCollected ? 'mdi:star' : 'mdi:star-outline'" /> 
                {{ post.isCollected ? '已收藏' : '收藏' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 粉丝列表 -->
        <div v-if="currentTab === 'followers'" class="tab-content">
          <div v-for="user in followers" :key="user.id" class="user-item">
            <img :src="user.avatar" class="user-item-avatar" />
            <div class="user-item-info">
              <div class="user-item-name">{{ user.name }}</div>
              <div class="user-item-bio">{{ user.bio }}</div>
            </div>
            <button 
              class="follow-btn"
              :class="{ following: user.isFollowing }"
              @click="toggleFollow(user)"
            >
              {{ user.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
        </div>

        <!-- 关注列表 -->
        <div v-if="currentTab === 'following'" class="tab-content">
          <div v-for="user in following" :key="user.id" class="user-item">
            <img :src="user.avatar" class="user-item-avatar" />
            <div class="user-item-info">
              <div class="user-item-name">{{ user.name }}</div>
              <div class="user-item-bio">{{ user.bio }}</div>
            </div>
            <button 
              class="follow-btn following"
              @click="toggleFollow(user)"
            >
              已关注
            </button>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div v-if="currentTab === 'collections'" class="tab-content">
          <div v-for="post in collections" :key="post.id" class="post-card">
            <div class="post-header">
              <img :src="post.avatar" class="avatar" />
              <div class="user-info">
                <div class="username">{{ post.username }}</div>
                <div class="post-time">{{ post.time }}</div>
              </div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-actions">
              <div 
                class="action-item"
                :class="{ 'liked': post.isLiked }"
                @click="toggleLike(post)"
              >
                <Icon :icon="post.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'" /> 
                {{ post.likes }}
              </div>
              <div 
                class="action-item"
                @click="openComments(post)"
              >
                <Icon icon="mdi:comment-outline" /> {{ post.comments }}
              </div>
              <div 
                v-if="post.images?.length"
                class="action-item"
                @click="openImageViewer(post.images)"
              >
                <Icon icon="mdi:image" /> {{ post.images.length }}
              </div>
              <div 
                class="action-item"
                :class="{ 'collected': post.isCollected }"
                @click="toggleCollect(post)"
              >
                <Icon :icon="post.isCollected ? 'mdi:star' : 'mdi:star-outline'" /> 
                {{ post.isCollected ? '已收藏' : '收藏' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加图片查看器组件 -->
    <ImageDialog
      v-model:show="showImageViewer"
      :images="currentImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />

    <!-- 添加评论抽屉相关组件 -->
    <div 
      class="drawer-overlay"
      :class="{ 'show': showComments }"
      @click="showComments = false"
    ></div>

    <div 
      class="comments-drawer"
      :class="{ 'open': showComments }"
    >
      <div class="drawer-header">
        <h3>评论 ({{ currentPost?.comments || 0 }})</h3>
        <button class="close-btn" @click="closeComments">
          <Icon icon="mdi:close" />
        </button>
      </div>
      <div class="comments-list">
        <div v-for="comment in commentsList" :key="comment.id" class="comment-item">
          <img :src="comment.avatar" class="comment-avatar" />
          <div class="comment-content">
            <div class="comment-user">{{ comment.username }}</div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ comment.time }}</span>
              <div class="comment-actions">
                <div 
                  class="comment-action"
                  :class="{ 'liked': comment.isLiked }"
                  @click="toggleCommentLike(comment)"
                >
                  <Icon :icon="comment.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'" />
                  {{ comment.likes || 0 }}
                </div>
                <div 
                  class="comment-action"
                  @click="replyToComment(comment)"
                >
                  回复
                </div>
              </div>
            </div>
            <!-- 回复列表 -->
            <div class="replies" v-if="comment.replies?.length">
              <div class="replies-header" @click="toggleReplies(comment)">
                <span>{{ comment.showReplies ? '收起' : `查看${comment.replies.length}条回复` }}</span>
                <Icon :icon="comment.showReplies ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
              </div>
              <div class="replies-content" :class="{ 'expanded': comment.showReplies }">
                <div 
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="reply-item"
                >
                  <img :src="reply.avatar" class="reply-avatar" />
                  <div class="reply-content">
                    <div class="reply-user">
                      {{ reply.username }}
                      <span class="reply-to" v-if="reply.replyTo">
                        回复 <span class="reply-to-name">@{{ reply.replyTo }}</span>
                      </span>
                    </div>
                    <div class="reply-text">{{ reply.content }}</div>
                    <div class="reply-footer">
                      <span class="reply-time">{{ reply.time }}</span>
                      <div class="comment-actions">
                        <div 
                          class="comment-action"
                          :class="{ 'liked': reply.isLiked }"
                          @click="toggleCommentLike(reply)"
                        >
                          <Icon :icon="reply.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'" />
                          {{ reply.likes || 0 }}
                        </div>
                        <div 
                          class="comment-action"
                          @click="replyToComment(comment, reply)"
                        >
                          回复
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="comment-input-container">
        <div v-if="replyTo" class="cancel-reply" @click="cancelReply">
          <Icon icon="mdi:close" />
          取消回复
        </div>
        <input
          v-model="newComment"
          :placeholder="getInputPlaceholder()"
          @click="handleInputClick"
          @keyup.enter="handleCommentSubmit"
        />
        <button 
          class="submit-btn" 
          :disabled="!newComment.trim() || !isLoggedIn"
          @click="handleCommentSubmit"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import ImageDialog from '../components/ImageDialog.vue'
import { userApi } from '../api/user'
import { postApi } from '../api/post'

interface Comment {
  id: number
  username: string
  avatar: string
  content: string
  time: string
  likes?: number
  isLiked?: boolean
  replies?: Reply[]
  showReplies?: boolean
}

interface Reply {
  id: number
  username: string
  avatar: string
  content: string
  time: string
  likes?: number
  isLiked?: boolean
  replyTo?: string
}

interface ReplyState {
  comment: Comment
  reply?: Reply
  username: string
}

interface Post {
  id: number
  username: string
  avatar: string
  time: string
  content: string
  images?: string[]
  likes: number
  comments: number
  isLiked?: boolean
  isCollected?: boolean
}

const currentTab = ref('posts')  // 默认显示动态

const switchTab = (tab: string) => {
  currentTab.value = tab
}

const userInfo = ref({
  name: '师大同学',
  avatar: '/avatars/default.png',
  posts: 12,
  followers: 56,
  following: 34,
  collections: 8
})

// 用户动态数据
const userPosts = ref([
  {
    id: 1,
    username: '师大同学',
    avatar: '/public/icon/icon.jpeg',
    content: '今天在图书馆学习，感觉氛围真好！',
    images: ['/public/icon/icon.jpeg'],
    time: '2小时前',
    likes: 23,
    comments: 5,
    isLiked: false,
    isCollected: false
  }
])

// 粉丝数据
const followers = ref([
  {
    id: 1,
    name: '张同学',
    avatar: '/avatars/default.png',
    bio: '师大计算机系学生',
    isFollowing: true
  },
  // ... 更多粉丝
])

// 关注数据
const following = ref([
  {
    id: 1,
    name: '李同学',
    avatar: '/avatars/default.png',
    bio: '热爱摄影的师大学子',
    isFollowing: true
  },
  // ... 更多关注
])

// 添加收藏数据
const collections = ref([
  {
    id: 1,
    username: '校园达人',
    avatar: '/public/icon/icon.jpeg',
    content: '逸夫图书馆是一座现代化的多功能图书馆，建筑面积达50,000平方米...',
    images: ['/public/icon/icon.jpeg'],
    time: '2024-03-15',
    likes: 45,
    comments: 12,
    isLiked: false,
    isCollected: true
  }
])

const removeCollection = (post: any) => {
  userInfo.value.collections--
  const index = collections.value.findIndex(p => p.id === post.id)
  if (index > -1) {
    collections.value.splice(index, 1)
  }
}

// 关注/取消关注
const toggleFollow = async (user: any) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  try {
    const { data } = user.isFollowing
      ? await userApi.unfollowUser(user.id)
      : await userApi.followUser(user.id)
    
    if (data.code === 0) {
      user.isFollowing = !user.isFollowing
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 添加交互方法
const toggleLike = (post: any) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

// 添加评论相关的状态和方法
const showComments = ref(false)
const currentPost = ref<Post | null>(null)
const commentsList = ref<Comment[]>([])
const newComment = ref('')
const replyTo = ref<ReplyState | null>(null)

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})

const openComments = (post: Post) => {
  currentPost.value = post
  showComments.value = true
  // 这里可以加载评论数据
  commentsList.value = [
    {
      id: 1,
      username: '同学A',
      avatar: '/public/icon/icon.jpeg',
      content: '图书馆确实很安静！',
      time: '5分钟前',
      likes: 3,
      isLiked: false,
      showReplies: false,
      replies: []
    }
  ]
}

const closeComments = () => {
  showComments.value = false
  replyTo.value = null
  newComment.value = ''
}

const toggleCollect = (post: any) => {
  post.isCollected = !post.isCollected
  if (post.isCollected) {
    userInfo.value.collections++
    collections.value.unshift(post)
  } else {
    userInfo.value.collections--
    const index = collections.value.findIndex(p => p.id === post.id)
    if (index > -1) {
      collections.value.splice(index, 1)
    }
  }
}

// 添加图片查看器状态
const showImageViewer = ref(false)
const currentImages = ref<string[]>([])
const currentImageIndex = ref(0)

// 添加图片查看器方法
const openImageViewer = (images: string[]) => {
  currentImages.value = images
  currentImageIndex.value = 0
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const toggleCommentLike = (comment: Comment | Reply) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  comment.isLiked = !comment.isLiked
  comment.likes = (comment.likes || 0) + (comment.isLiked ? 1 : -1)
}

const replyToComment = (comment: Comment, reply?: Reply) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  replyTo.value = {
    comment,
    reply,
    username: reply ? reply.username : comment.username
  }
}

const router = useRouter()

const handleInputClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

const handleCommentSubmit = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  submitComment()
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (replyTo.value) {
    // 添加回复
    const reply: Reply = {
      id: Date.now(),
      username: user.username || '访客用户',
      avatar: user.avatar || '/public/icon/icon.jpeg',
      content: newComment.value,
      time: '刚刚',
      likes: 0,
      isLiked: false,
      replyTo: replyTo.value.reply ? replyTo.value.username : replyTo.value.comment.username
    }

    if (!replyTo.value.comment.replies) {
      replyTo.value.comment.replies = []
    }
    replyTo.value.comment.replies.push(reply)
  } else {
    // 添加新评论
    const comment: Comment = {
      id: Date.now(),
      username: user.username || '访客用户',
      avatar: user.avatar || '/public/icon/icon.jpeg',
      content: newComment.value,
      time: '刚刚',
      likes: 0,
      isLiked: false,
      replies: []
    }
    commentsList.value.unshift(comment)
  }

  newComment.value = ''
  replyTo.value = null
}

const getInputPlaceholder = () => {
  if (!isLoggedIn.value) return '登录后发表评论'
  if (replyTo.value) return `回复 ${replyTo.value.username}`
  return '写下你的评论...'
}

const cancelReply = () => {
  replyTo.value = null
  newComment.value = '' // 可选：是否清空输入框内容
}

const toggleReplies = (comment: Comment) => {
  comment.showReplies = !comment.showReplies
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const { data } = await userApi.getCurrentUserInfo()
    if (data.code === 0) {
      userInfo.value = data.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户动态
const fetchUserPosts = async () => {
  try {
    const { data } = await userApi.getCurrentUserPosts()
    if (data.code === 0) {
      userPosts.value = data.data.posts
    }
  } catch (error) {
    console.error('获取用户动态失败:', error)
  }
}

// 获取收藏列表
const fetchCollections = async () => {
  try {
    const { data } = await userApi.getCurrentUserCollections()
    if (data.code === 0) {
      collections.value = data.data.posts
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  }
}

// 获取粉丝列表
const fetchFollowers = async () => {
  try {
    const { data } = await userApi.getCurrentUserFollowers()
    if (data.code === 0) {
      followers.value = data.data.users
    }
  } catch (error) {
    console.error('获取粉丝列表失败:', error)
  }
}

// 获取关注列表
const fetchFollowing = async () => {
  try {
    const { data } = await userApi.getCurrentUserFollowing()
    if (data.code === 0) {
      following.value = data.data.users
    }
  } catch (error) {
    console.error('获取关注列表失败:', error)
  }
}

// 监听标签切换
watch(currentTab, (newTab) => {
  switch (newTab) {
    case 'posts':
      fetchUserPosts()
      break
    case 'collections':
      fetchCollections()
      break
    case 'followers':
      fetchFollowers()
      break
    case 'following':
      fetchFollowing()
      break
  }
})

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
  fetchUserPosts() // 默认加载动态列表
})
</script>

<style scoped>
.personal-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.user-header {
  flex-shrink: 0;  /* 防止头部被压缩 */
  background: white;
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 12px;
}

.username {
  margin: 0 0 16px 0;
  color: #333;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 0 32px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.stat-item.active {
  background-color: #e6f7ff;
}

.stat-item.active .stat-value {
  color: #1890ff;
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding: 8px;
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
  margin-top: 1px;
}

.post-content {
  margin-bottom: 8px;
  line-height: 1.5;
  font-size: 14px;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  font-size: 13px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-item:hover {
  background-color: #f5f5f5;
}

.action-item.liked {
  color: #1890ff;
}

.action-item.collected {
  color: #faad14;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-item-info {
  flex: 1;
}

.user-item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.user-item-bio {
  font-size: 12px;
  color: #999;
}

.follow-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #1890ff;
  background: white;
  color: #1890ff;
  cursor: pointer;
}

.follow-btn.following {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #666;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 998;
}

.drawer-overlay.show {
  opacity: 1;
  visibility: visible;
}

.content-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  height: 100%;
  background: white;
  transition: right 0.3s;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .content-drawer {
    width: 500px;
  }
}

.content-drawer.open {
  right: 0;
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

.collection-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: white;
}

.collection-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.collection-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.collection-time {
  font-size: 12px;
  color: #999;
}

.uncollect-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.uncollect-btn:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 优化滚动条样式 */
.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 评论抽屉样式 */
.comments-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 90%;
  max-width: 500px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease;
  z-index: 1000;
}

.comments-drawer.open {
  right: 0;
}

.comments-list {
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 140px);
  padding-bottom: 60px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: 600;
  color: #1890ff;
  font-size: 14px;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.comment-action.liked {
  color: #1890ff;
}

.comment-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.comment-input-container input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
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

.replies {
  margin-left: 44px;
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.reply-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.reply-content {
  flex: 1;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.replies {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
}

.cancel-reply {
  position: absolute;
  top: -28px;
  right: 16px;
  font-size: 12px;
  color: #ff4d4f;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.reply-content {
  flex: 1;
  font-size: 13px;
}

.reply-user {
  font-weight: 600;
  color: #1890ff;
  font-size: 13px;
  margin-bottom: 2px;
}

.reply-text {
  font-size: 13px;
  margin-top: 2px;
}

.replies-header {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 0;
}

.replies-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.replies-content.expanded {
  max-height: 1000px;
  transition: max-height 0.3s ease-in;
}
</style> 