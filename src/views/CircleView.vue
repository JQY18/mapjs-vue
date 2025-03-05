<template>
  <div class="circle-container">
    <!-- 添加搜索框 -->
    <div class="search-box">
      <div class="search-input">
        <Icon icon="mdi:magnify" class="search-icon"/>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索帖子内容..."
          @input="handleSearch"
        />
        <Icon 
          v-if="searchQuery"
          icon="mdi:close" 
          class="clear-icon"
          @click="clearSearch"
        />
      </div>
    </div>

    <!-- 添加发布按钮 -->
    <div class="publish-btn" @click="openPublishDialog">
      <Icon icon="mdi:plus" />
    </div>

    <!-- 添加发布对话框 -->
    <div v-if="showPublishDialog" class="publish-dialog-overlay">
      <div class="publish-dialog">
        <div class="dialog-header">
          <h3>发布新帖子</h3>
          <button class="close-btn" @click="closePublishDialog">
            <Icon icon="mdi:close" />
          </button>
        </div>
        
        <div class="dialog-content">
          <textarea 
            v-model="newPost.content" 
            placeholder="分享你的想法..."
            class="post-content-input"
          ></textarea>
          
          <div class="image-upload-section">
            <div class="image-preview-list">
              <div 
                v-for="(image, index) in newPost.images" 
                :key="index"
                class="image-preview-item"
              >
                <img :src="image.url" />
                <div class="remove-image" @click="removeImage(index)">
                  <Icon icon="mdi:close" />
                </div>
              </div>
              
              <div 
                v-if="newPost.images.length < 9" 
                class="image-upload-btn"
                @click="triggerImageUpload"
              >
                <Icon icon="mdi:image-plus" />
                <input 
                  type="file" 
                  ref="imageInput"
                  accept="image/*"
                  multiple
                  @change="handleImageUpload"
                  style="display: none"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button 
            class="cancel-btn" 
            @click="closePublishDialog"
          >取消</button>
          <button 
            class="publish-submit-btn" 
            :disabled="!newPost.content.trim() && newPost.images.length === 0"
            @click="submitPost"
          >发布</button>
        </div>
      </div>
    </div>

    <!-- 添加一个滚动容器 -->
    <div class="scroll-container">
      <div class="content-list">
        <div v-for="post in filteredPosts" :key="post.id" class="post-card">
          <div class="post-header">
            <img :src="post.avatar" class="avatar" />
            <div class="user-info">
              <div class="username">{{ post.username }}</div>
              <div class="user-detail">
                <!-- <span v-if="post.userSchool">{{ post.userSchool }}</span> -->
                <span v-if="post.userGender" class="gender">{{ post.userGender }}</span>
              </div>
              <div class="post-time">{{ post.time }}</div>
            </div>
          </div>
          <div class="post-content">{{ post.content }}</div>
          <div class="post-actions">
            <div
              class="action-item"
              :class="{ liked: post.isLiked }"
              @click="toggleLike(post)"
            >
              <Icon
                :icon="post.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'"
              />
              {{ post.likes }}
            </div>
            <div class="action-item" @click="openComments(post)">
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
              :class="{ collected: post.isCollected }"
              @click="toggleCollect(post)"
            >
              <Icon
                :icon="post.isCollected ? 'mdi:star' : 'mdi:star-outline'"
              />
              {{ post.isCollected ? "已收藏" : "收藏" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      class="drawer-overlay"
      :class="{ show: showComments }"
      @click="showComments = false"
    ></div>

    <!-- 评论抽屉 -->
    <div class="comments-drawer" :class="{ open: showComments }">
      <div class="drawer-header">
        <h3>评论 ({{ currentPost?.comments || 0 }})</h3>
        <button class="close-btn" @click="closeComments">
          <Icon icon="mdi:close" />
        </button>
      </div>
      <div class="comments-list">
        <div
          v-for="comment in commentsList"
          :key="comment.id"
          class="comment-item"
        >
          <img :src="comment.avatar" class="comment-avatar" />
          <div class="comment-content">
            <div class="comment-user">{{ comment.username }}</div>
            <div class="comment-text bold-red">{{ comment.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ comment.time }}</span>
              <div class="comment-actions">
                <div
                  class="comment-action"
                  :class="{ liked: comment.isLiked }"
                  @click="toggleCommentLike(comment)"
                >
                  <Icon
                    :icon="
                      comment.isLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'
                    "
                  />
                  <span v-if="comment.likes">{{ comment.likes }}</span>
                </div>
                <div class="comment-action" @click="replyToComment(comment)">
                  <Icon icon="mdi:reply" /> 回复
                </div>
                <div
                  v-if="comment.replies?.length"
                  class="comment-action"
                  @click="toggleComment(comment)"
                >
                  <Icon
                    :icon="
                      comment.showReplies
                        ? 'mdi:chevron-up'
                        : 'mdi:chevron-down'
                    "
                  />
                  {{
                    comment.showReplies
                      ? "收起"
                      : `${comment.replies.length}条回复`
                  }}
                </div>
              </div>
            </div>
            <!-- 回复列表 -->
            <div
              class="replies"
              v-if="comment.replies?.length && comment.showReplies"
              :class="{ expanded: comment.showReplies }"
            >
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
              >
                <img :src="reply.avatar" class="reply-avatar" />
                <div class="reply-content">
                  <div class="reply-user">
                    {{ reply.username }}
                    <span v-if="reply.replyTo" class="reply-to">
                      回复
                      <span class="reply-to-name">{{ reply.replyTo }}</span>
                    </span>
                  </div>
                  <div class="reply-text bold-red">{{ reply.content }}</div>
                  <div class="reply-footer">
                    <span class="reply-time">{{ reply.time }}</span>
                    <div class="comment-actions">
                      <div
                        class="comment-action"
                        @click="replyToComment(comment, reply)"
                      >
                        <Icon icon="mdi:reply" /> 回复
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 评论输入框 -->
      <div class="comment-input-container">
        <!-- 添加取消回复按钮 -->
        <div v-if="replyTo" class="cancel-reply" @click="cancelReply">
          <Icon icon="mdi:close" /> 取消回复
        </div>

        <input
          type="text"
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

    <!-- 添加图片查看器组件 -->
    <ImageDialog
      v-model:show="showImageViewer"
      :images="currentImages"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import ImageDialog from "../components/ImageDialog.vue";
import { postApi } from "../api/post";
import request from "../api/request";
import { userApi } from '../api/user'
import { ElMessage } from 'element-plus/es'
import 'element-plus/es/components/message/style/css'

const router = useRouter();

const posts = ref([]);

// const posts = ref([
//   {
//     id: 1,
//     username: "师大学子",
//     avatar: "/public/icon/icon.jpeg",
//     time: "10分钟前",
//     content: "今天在图书馆学习，感觉氛围真好！",
//     images: ["/public/icon/icon.jpeg"],
//     likes: 23,
//     comments: 5,
//     isLiked: false,
//   },
//   {
//     id: 2,
//     username: "校园达人",
//     avatar: "/avatars/default2.png",
//     time: "1小时前",
//     content: "木兰公寓的樱花开了，大家快来看啊！",
//     images: ["/images/cherry.jpg", "/images/cherry2.jpg"],
//     likes: 45,
//     comments: 12,
//   },
//   {
//     id: 3,
//     username: "校园达人",
//     avatar: "/avatars/default2.png",
//     time: "2小时前",
//     content: "今天的晚霞真美！",
//     images: ["/images/cherry.jpg"],
//     likes: 38,
//     comments: 8,
//   },
//   {
//     id: 4,
//     username: "师大新生",
//     avatar: "/avatars/default2.png",
//     time: "3小时前",
//     content: "第一次来到师大，校园真大啊！",
//     images: ["/images/cherry.jpg"],
//     likes: 56,
//     comments: 15,
//   },
// ]);

const showComments = ref(false);
const currentPost = ref(null);

const commentsList = ref([
  {
    id: 1,
    username: "同学A",
    avatar: "/public/icon/icon.jpeg",
    content: "图书馆确实很安静！",
    time: "5分钟前",
    likes: 3,
    isLiked: false,
    showReplies: false,
    replies: [
      {
        id: 11,
        username: "同学C",
        avatar: "/public/icon/icon.jpeg",
        content: "对啊，特别适合学习",
        time: "3分钟前",
        likes: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: 2,
    username: "同学B",
    avatar: "/public/icon/icon.jpeg",
    content: "我也经常去那里学习",
    time: "3分钟前",
  },
]);

const newComment = ref("");
const replyTo = ref(null);

const isLoggedIn = computed(() => {
  return !!localStorage.getItem("user");
});

onMounted(() => {
  fetchPosts()
});

const handleInputClick = () => {
  if (!isLoggedIn.value) {
    router.push("/login");
  }
};

const handleCommentSubmit = () => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  if(!replyTo || !replyTo.value){
    submitComment();
  }
  request.post("/reply/add", {
    fatherId: replyTo.value.comment.id,
    commenterId: replyTo.value.comment.commenterId,
    replierId: JSON.parse(localStorage.getItem("user") || "{}").id,
    content: newComment.value,
  }).then(res => {
    getComments(currentPost.value.id);
    console.log(res)
  }).catch(error => {
    console.log(error)
  });
  newComment.value = "";
  replyTo.value = null;
};

// 获取用户信息的方法
const getUserInfo = async (userId) => {
  try {
    const { data } = await userApi.getUserInfo(userId)
    if (data.code === 1) {
      return data.data
    }
    return null
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return null
  }
}

// 修改获取帖子列表的方法
const fetchPosts = async () => {
  try {
    const { data } = await postApi.getPosts()
    if (data.code === 1) {
      // 获取所有帖子的用户信息
      const postsWithUserInfo = await Promise.all(
        data.data.map(async post => {
          const userInfo = await getUserInfo(post.userId)
          return {
            id: post.id,
            username: userInfo?.nickname || userInfo?.username || `用户${post.userId}`, // 优先使用昵称
            avatar: userInfo?.avatar || "/public/icon/icon.jpeg", // 使用用户头像或默认头像
            time: formatTime(post.createTime),
            content: post.content,
            title: post.title,
            images: post.images,
            likes: post.likes,
            comments: post.comments,
            isLiked: post.isLiked,
            isCollected: post.isCollected,
            // 可以添加其他用户信息
            userSchool: userInfo?.school,
            userGender: userInfo?.gender
          }
        })
      )
      posts.value = postsWithUserInfo
    }
  } catch (error) {
    console.error("获取帖子列表失败:", error)
  }
}

// 添加时间格式化函数
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 小于1小时，显示xx分钟前
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于24小时，显示xx小时前
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 其他情况显示具体日期和时间
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 修改点赞方法
const toggleLike = async (post) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  try {
    // const { data } = post.isLiked
    //   ? await postApi.unlikePost(post.id)
    //   : await postApi.likePost(post.id);
    const res = await postApi.likePost(post.id);

    if (res.data.code === 1) {
      post.isLiked = true;
      post.likes = post.likes + 1;
    }else if(res.data.code === 0){
      post.isLiked = false;
      post.likes = post.likes - 1;
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
  }
};

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
    }
  } catch (error) {
    console.error("收藏操作失败:", error);
  }
};

// 获取评论列表
const getComments = async (postId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const { data } = await postApi.getComments(postId, user.id)
    if (data.code === 1) {
      // 转换评论数据格式
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
          likes: 0,  // 回复暂时没有点赞数
          isLiked: false  // 回复暂时没有点赞状态
        }))
      }))
    }
  } catch (error) {
    console.error("获取评论失败:", error)
  }
}

// 修改打开评论方法
const openComments = async (post) => {
  currentPost.value = post
  showComments.value = true
  await getComments(post.id)
}

// 修改评论点赞方法
const toggleCommentLike = async (comment) => {
  if (!isLoggedIn.value) {
    router.push("/login")
    return
  }

  try {
    // const { data } = comment.isLiked
    //   ? await postApi.unlikeComment(comment.id)
    //   : await postApi.likeComment(comment.id)

    const { data } = await postApi.likeComment(comment.id,comment.likes,comment.isLiked)


    if (data.code === 1) {
      comment.isLiked = !comment.isLiked
      comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1
    }
  } catch (error) {
    console.error("评论点赞失败:", error)
  }
}

// 修改提交评论方法
const submitComment = async () => {
  if (!newComment.value.trim() || !currentPost.value) return;

  try {

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    // window.alert(JSON.stringify(currentPost.value.id))
    // window.alert(JSON.stringify(user.id))
    // window.alert(JSON.stringify(newComment.value))
    
    const { data } = await postApi.addComment(currentPost.value.id, 
      // replyTo.value?.reply?.id || replyTo.value?.comment.id,
      user.id,
      newComment.value
    );

    if (data.code === 1) {
      // 重新加载评论列表
      await getComments(currentPost.value.id);
      newComment.value = "";
      replyTo.value = null;
    }
  } catch (error) {
    console.error("发表评论失败:", error);
  }
};


// 回复评论
const replyToComment = (comment, reply) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }
  replyTo.value = {
    comment,
    reply,
    username: reply ? reply.username : comment.username,
  };
};

const getInputPlaceholder = () => {
  if (!isLoggedIn.value) return "登录后发表评论";
  if (replyTo.value) return `回复 ${replyTo.value.username}`;
  return "写下你的评论...";
};

const closeComments = () => {
  showComments.value = false;
  replyTo.value = null;
  newComment.value = "";
};

const toggleComment = (comment) => {
  comment.showReplies = !comment.showReplies;
};

// 添加取消回复方法
const cancelReply = () => {
  replyTo.value = null;
  newComment.value = ""; // 可选：是否清空输入框内容
};

// 图片查看器状态
const showImageViewer = ref(false);
const currentImages = ref([]);
const currentImageIndex = ref(0);

// 图片查看器方法
const openImageViewer = (images) => {
  currentImages.value = images;
  currentImageIndex.value = 0;
  showImageViewer.value = true;
};

const closeImageViewer = () => {
  showImageViewer.value = false;
};

// 发布相关的状态
const showPublishDialog = ref(false)
const imageInput = ref(null)
const newPost = ref({
  content: '',
  images: []
})

// 发布相关的方法
const openPublishDialog = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  showPublishDialog.value = true
}

const closePublishDialog = () => {
  showPublishDialog.value = false
  newPost.value = {
    content: '',
    images: []
  }
}

const triggerImageUpload = () => {
  imageInput.value.click()
}

const handleImageUpload = (event) => {
  const files = event.target.files
  if (files) {
    Array.from(files).forEach(file => {
      newPost.value.images.push({
        file: file,
        url: URL.createObjectURL(file)
      })
    })
  }
}

const removeImage = (index) => {
  newPost.value.images.splice(index, 1)
}

const submitPost = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    // 创建 FormData 对象
    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('content', newPost.value.content)
    
    // 添加图片文件
    newPost.value.images.forEach(image => {
      formData.append('images', image.file)
    })

    const { data } = await postApi.createPost(formData)

    if (data.code === 1) {
      // 发布成功后刷新帖子列表
      fetchPosts()
      // 清空表单
      newPost.value = {
        content: '',
        images: []
      }
      closePublishDialog()
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

// 添加搜索相关的状态
const searchQuery = ref('')
const searchTimeout = ref(null)

// 添加过滤后的帖子计算属性
const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value
  
  const query = searchQuery.value.toLowerCase()
  return posts.value.filter(post => {
    return (
      post.content.toLowerCase().includes(query) ||
      post.username.toLowerCase().includes(query) ||
      (post.title && post.title.toLowerCase().includes(query))
    )
  })
})

// 添加搜索处理方法
const handleSearch = () => {
  // 防抖处理
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    // 这里可以添加额外的搜索逻辑
  }, 300)
}

// 添加清除搜索方法
const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<style scoped>
.circle-container {
  height: 100%;
  background-color: #f5f5f5;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.content-list {
  padding: 16px;
}

.post-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  flex: 1;
  padding-top: 2px;
}

.username {
  font-weight: 600;
  color: #1890ff;
  font-size: 14px;
  line-height: 1;
}

.post-time {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.post-content {
  margin-bottom: 12px;
  line-height: 1.5;
  color: #333;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-item:hover {
  background-color: #f5f5f5;
}

.post-card:last-child {
  margin-bottom: 48px;
}

.action-item.liked {
  color: #1890ff;
}

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

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
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
  padding: 12px 16px;
  gap: 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0;
}

.comment-content {
  flex: 1;
  padding-left: 8px;
}

.comment-user {
  font-weight: 600;
  color: #1890ff;
  font-size: 14px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.comment-text {
  color: #333;
  margin-bottom: 4px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.comment-action:hover {
  background-color: #f5f5f5;
}

.comment-action.liked {
  color: #1890ff;
}

.replies {
  margin-top: 12px;
  margin-left: 24px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-out;
}

.replies.expanded {
  max-height: 1000px;
  transition: max-height 0.3s ease-in;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  margin-top: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
  gap: 0;
}

.reply-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 0;
}

.reply-content {
  flex: 1;
  padding-left: 6px;
}

.reply-user {
  font-weight: 600;
  color: #1890ff;
  font-size: 13px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.reply-text {
  font-size: 13px;
  margin-top: 2px;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.reply-time {
  font-size: 12px;
  color: #999;
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
  transition: all 0.2s;
  border: 1px solid #ffccc7;
}

.cancel-reply:hover {
  color: #ff7875;
  background: white;
  border-color: #ff7875;
}

.comment-input-container input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

.submit-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.drawer-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* 确保评论抽屉在遮罩层之上 */
.comments-drawer {
  z-index: 1000;
}

.reply-to {
  color: #666;
  font-size: 12px;
  margin-left: 4px;
}

.reply-to-name {
  color: #1890ff;
  font-weight: 600;
}

/* 调整回复的缩进，使层级更清晰 */
.reply-item {
  position: relative;
}

.reply-item::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 16px;
  width: 8px;
  height: 1px;
  background-color: #f0f0f0;
}

/* 确保输入框提示文字合适 */
.comment-input-container input::placeholder {
  color: #999;
}

/* 添加未登录状态的输入框样式 */
.comment-input-container input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.action-item.collected {
  color: #faad14;
}

.action-item:hover {
  background-color: #f5f5f5;
}

.user-detail {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.gender {
  margin-left: 8px;
  padding: 0 4px;
  background: #f0f0f0;
  border-radius: 2px;
}

/* 发布按钮样式 */
.publish-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
  z-index: 100;
  transition: all 0.3s;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.45);
}

.publish-btn .iconify {
  font-size: 24px;
}

/* 发布对话框样式 */
.publish-dialog-overlay {
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

.publish-dialog {
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  padding: 20px;
}

.post-content-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 16px;
}

.post-content-input:focus {
  outline: none;
  border-color: #1890ff;
}

.image-upload-section {
  margin-top: 16px;
}

.image-preview-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-preview-item {
  position: relative;
  padding-bottom: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-upload-btn {
  position: relative;
  padding-bottom: 100%;
  border: 2px dashed #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-upload-btn:hover {
  border-color: #1890ff;
}

.image-upload-btn .iconify {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #999;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.publish-submit-btn {
  padding: 8px 20px;
  background: #1890ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.publish-submit-btn:hover {
  background: #40a9ff;
}

.publish-submit-btn:disabled {
  background: #bfbfbf;
  cursor: not-allowed;
}

/* 添加搜索框样式 */
.search-box {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 8px 16px;
}

.search-input input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 8px;
  font-size: 14px;
  outline: none;
}

.search-icon {
  color: #999;
  font-size: 20px;
}

.clear-icon {
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.clear-icon:hover {
  color: #666;
}
</style> 