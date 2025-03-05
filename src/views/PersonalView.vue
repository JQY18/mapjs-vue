<template>
  <div class="personal-container">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <img :src="userInfo.avatar" class="user-avatar" />
      <div class="user-info">
        <div class="user-detail">
          <div class="detail-item">
            <span class="label">用户名：</span>
            <span class="value">{{ userInfo.username }}</span>
          </div>
          <div class="detail-item">
            <span class="label">昵称：</span>
            <span class="value">{{ userInfo.nickname }}</span>
          </div>
          <div class="detail-item">
            <span class="label">性别：</span>
            <span class="gender">{{ userInfo.gender }}</span>
          </div>
          <div class="detail-item">
            <span class="label">年龄：</span>
            <span class="age">{{ userInfo.age }}岁</span>
          </div>
          <div class="edit-btn" @click="showEditDialog = true">
            <Icon icon="mdi:edit" />
          </div>
        </div>
      </div>
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
                <div class="post-time">{{ formatTime(post.createTime) }}</div>
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

    <!-- 添加修改信息对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay">
      <div class="edit-dialog">
        <div class="dialog-header">
          <h3>修改个人信息</h3>
          <button class="close-btn" @click="showEditDialog = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        
        <div class="dialog-content">
          <!-- 头像修改 -->
          <div class="avatar-edit">
            <img :src="editForm.avatar || userInfo.avatar" class="preview-avatar" />
            <div class="upload-btn" @click="triggerAvatarUpload">
              <Icon icon="mdi:camera" />
              <input
                type="file"
                ref="avatarInput"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>
          </div>
          
          <!-- 其他信息修改 -->
          <div class="form-item">
            <label>昵称</label>
            <input v-model="editForm.nickname" placeholder="请输入昵称" />
          </div>
          
          <div class="form-item">
            <label>性别</label>
            <select v-model="editForm.gender">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          
          <div class="form-item">
            <label>年龄</label>
            <input type="number" v-model="editForm.age" placeholder="请输入年龄" />
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showEditDialog = false">取消</button>
          <button class="submit-btn" @click="handleSubmit">保存</button>
        </div>
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
import request from '../api/request'
// 修改评论相关方法
const getComments = async (postId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const { data } = await postApi.getComments(postId, user.id)
    if (data.code === 1) {
      commentsList.value = data.data.map(comment => ({
        id: comment.id,
        commenterId: comment.commenterId,
        username: comment.commenterNickname,
        avatar: comment.commenterAvatar,
        content: comment.content,
        time: formatTime(comment.createTime),
        likes: comment.like,
        isLiked: comment.isLiked,
        showReplies: false,
        replies: comment.reply.map(reply => ({
          id: reply.id,
          commenterId: reply.commenterId,
          replierId: reply.replierId,
          username: reply.replierNickname,
          avatar: reply.replierAvatar,
          content: reply.content,
          time: formatTime(reply.createTime),
          replyTo: reply.commenterNickname,
          replyToAvatar: reply.commenterAvatar,
          likes: 0,
          isLiked: false
        }))
      }))
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

// 修改回复评论的方法
const replyToComment = (comment, reply) => {
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

// 修改获取输入框占位符的方法
const getInputPlaceholder = () => {
  if (!isLoggedIn.value) return '登录后发表评论'
  if (replyTo.value) return `回复 ${replyTo.value.username}`
  return '写下你的评论...'
}

// 修改取消回复的方法
const cancelReply = () => {
  replyTo.value = null
  newComment.value = ''
}

const router = useRouter()
const currentTab = ref('posts')  // 默认显示动态

// 添加切换标签的方法
const switchTab = (tab) => {
  currentTab.value = tab
}

// 修改用户信息的初始状态
const userInfo = ref({})

// 用户动态数据
const userPosts = ref([])

// 粉丝数据
const followers = ref([])

// 关注数据
const following = ref([])

// 添加收藏数据
const collections = ref([])

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
const toggleLike = async (post) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  try {
    const res = await postApi.likePost(post.id)
    if (res.data.code === 1) {
      post.isLiked = true
      post.likes = post.likes + 1
    } else if (res.data.code === 0) {
      post.isLiked = false
      post.likes = post.likes - 1
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 添加评论相关的状态
const showComments = ref(false)
const currentPost = ref(null)
const commentsList = ref([])
const newComment = ref('')
const replyTo = ref(null)

// 添加图片查看器状态
const showImageViewer = ref(false)
const currentImages = ref([])
const currentImageIndex = ref(0)

const openComments = async (post) => {
  currentPost.value = post
  showComments.value = true
  await getComments(post.id)
}

const closeComments = () => {
  showComments.value = false
  replyTo.value = null
  newComment.value = ''
}

const toggleCommentLike = async (comment) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  try {
    const { data } = await postApi.likeComment(comment.id, comment.likes, comment.isLiked)
    if (data.code === 1) {
      comment.isLiked = !comment.isLiked
      comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1
    }
  } catch (error) {
    console.error('评论点赞失败:', error)
  }
}

// 图片查看器方法
const openImageViewer = (images) => {
  currentImages.value = images
  currentImageIndex.value = 0
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})

// 修改收藏方法
const toggleCollect = async (post) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  try {
    const { data } = post.isCollected
      ? await postApi.uncollectPost(post.id)
      : await postApi.collectPost(post.id);
    
    if (data.code === 1) {
      post.isCollected = !post.isCollected;
      if(post.isCollected){
        userInfo.value.collections++
      }else{
        userInfo.value.collections--
      }
    }
  } catch (error) {
    console.error("收藏操作失败:", error);
  }
};

const handleInputClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

// 添加提交评论方法
const submitComment = async () => {
  if (!newComment.value.trim() || !currentPost.value) return

  try {
    if (!replyTo.value) {
      // 发表新评论
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const { data } = await postApi.addComment(
        currentPost.value.id,
        user.id,
        newComment.value
      )

      if (data.code === 1) {
        await getComments(currentPost.value.id)
        newComment.value = ''
      }
    } else {
      // 发表回复
      const response = await request.post("/reply/add", {
        fatherId: replyTo.value.comment.id,
        commenterId: replyTo.value.comment.commenterId,
        replierId: JSON.parse(localStorage.getItem("user") || "{}").id,
        content: newComment.value,
      })

      if (response.data.code === 1) {
        await getComments(currentPost.value.id)
        newComment.value = ''
        replyTo.value = null
      }
    }
  } catch (error) {
    console.error('发表评论/回复失败:', error)
  }
}

const handleCommentSubmit = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  submitComment()
}

const toggleReplies = (comment: Comment) => {
  comment.showReplies = !comment.showReplies
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const { data } = await userApi.getUserInfo()
    if (data.code === 1) {
      userInfo.value = {
        username: data.data.username,  // 用户名
        nickname: data.data.nickname,  // 昵称
        avatar: data.data.avatar,
        gender: data.data.gender,
        age: data.data.age,
        id: data.data.id,
        posts: 0,
        followers: 0,
        following: 0,
        collections: data.data.collections
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户动态
const fetchUserPosts = async () => {
  try {
    const { data } = await userApi.getCurrentUserPosts()
    if (data.code === 1) {
      // 更新动态数量
      userInfo.value.posts = data.data.length
      
      // 转换数据格式以匹配前端展示需求
      userPosts.value = data.data.map(post => {
        // 获取用户信息
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        return {
          id: post.id,
          username: userInfo.value.nickname || userInfo.value.username,
          avatar: userInfo.value.avatar,
          content: post.content,
          images: post.images || [],
          time: formatTime(post.createTime),
          title: post.title,
          likes: post.likes || 0,        // 使用后端返回的点赞数
          comments: post.comments || 0,   // 使用后端返回的评论数
          isLiked: post.isLiked || false, // 使用后端返回的点赞状态
          isCollected: post.isCollected || false
        }
      })

      // 按时间倒序排序
      userPosts.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    }
  } catch (error) {
    console.error('获取用户动态失败:', error)
  }
}

// 添加时间格式化函数
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于1小时，显示xx分钟前
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时，显示xx小时前
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 其他情况显示具体日期和时间
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取收藏列表
const fetchCollections = async () => {
  try {
    const { data } = await userApi.getCurrentUserCollections()
    if (data.code === 1) {
      collections.value = data.data;
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

// 监听用户信息变化，当获取到用户信息后再获取动态列表
watch(() => userInfo.value, (newValue) => {
  if (newValue && newValue.id) {
    fetchUserPosts()
  }
}, { immediate: true })

// 组件挂载时获取用户信息
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.id) {
    fetchUserInfo()
  } else {
    router.push('/login')
  }
})

// 添加编辑相关的状态
const showEditDialog = ref(false)
const editForm = ref({
  avatar: '',
  nickname: '',
  gender: '',
  age: null
})

// 打开编辑对话框时初始化表单数据
watch(showEditDialog, (newVal) => {
  if (newVal) {
    editForm.value = {
      avatar: userInfo.value.avatar,
      nickname: userInfo.value.nickname,
      gender: userInfo.value.gender,
      age: userInfo.value.age
    }
  }
})

// 处理头像上传
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    editForm.value.avatar = URL.createObjectURL(file)
    editForm.value.avatarFile = file
  }
}

const avatarInput = ref(null)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 提交修改
const handleSubmit = async () => {
  try {
    const formData = new FormData()
    if (editForm.value.avatarFile) {
      formData.append('avatar', editForm.value.avatarFile)
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    formData.append('id', user.id)
    formData.append('nickname', editForm.value.nickname)
    formData.append('gender', editForm.value.gender)
    formData.append('age', editForm.value.age)

    const { data } = await userApi.updateUserInfo(formData)
    if (data.code === 1) {
      showEditDialog.value = false
      //刷新用户信息
      fetchUserInfo()
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
  }
}
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

.user-info {
  margin-bottom: 16px;
}

.username {
  font-size: 20px;
  color: #333;
  margin: 0 0 8px;
}

.user-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  color: #666;
  font-size: 14px;
  text-align: left;
  padding: 0;
  width: fit-content;
  margin: 16px auto 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 16px;
  white-space: nowrap;
}

.detail-item:last-child {
  margin-right: 0;
}

.label {
  color: #999;
  min-width: 40px;
}

.value {
  color: #333;
}

.nickname {
  color: #1890ff;
}

.gender, .age {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
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
  height: calc(100vh - 250px); /* 增加减去的高度 */
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px 16px 80px; /* 增加底部内边距 */
  box-sizing: border-box;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 40px; /* 增加底部内边距 */
}

.post-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
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

.edit-btn {
  padding: 8px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.edit-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.edit-btn .iconify {
  font-size: 16px;
}

.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-dialog {
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-content {
  padding: 20px;
}

.avatar-edit {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
}

.preview-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.dialog-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.submit-btn {
  background: #1890ff;
  border: none;
  color: white;
}
</style> 