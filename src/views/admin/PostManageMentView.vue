<template>
  <div class="post-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>帖子管理</h2>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="searchForm.content"
              placeholder="请输入内容关键词"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 帖子列表 -->
      <el-table :data="posts" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar" />
              <span class="username">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="300">
          <template #default="scope">
            <div class="post-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="150">
          <template #default="scope">
            <div v-if="scope.row.images && scope.row.images.length > 0" class="image-list">
              <el-image
                :src="scope.row.images[0]"
                fit="cover"
                class="table-image"
                @click="openImagePreview(scope.row.images)"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-if="scope.row.images.length > 1" class="image-count-badge">
                <el-tag size="small" type="info">+{{ scope.row.images.length - 1 }}</el-tag>
              </div>
            </div>
            <span v-else class="no-image">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="互动数据" width="150">
          <template #default="scope">
            <div class="interaction-info">
              <el-tooltip content="点赞数" placement="top">
                <span><i class="el-icon-thumb"></i> {{ scope.row.likes }}</span>
              </el-tooltip>
              <el-tooltip content="评论数" placement="top">
                <span><i class="el-icon-chat-dot-round"></i> {{ scope.row.comments }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 30, 50]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 查看帖子详情对话框 -->
    <el-dialog
      title="帖子详情"
      v-model="dialogVisible"
      width="60%"
    >
      <div class="post-detail" v-if="currentPost">
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="50" :src="currentPost.avatar" />
            <div class="user-meta">
              <div class="username">{{ currentPost.username }}</div>
              <div class="post-time">{{ formatTime(currentPost.createTime) }}</div>
            </div>
          </div>
        </div>
        <div class="post-body">
          <div class="content">{{ currentPost.content }}</div>
          <div class="images" v-if="currentPost.images && currentPost.images.length > 0">
            <el-image
              v-for="(img, index) in currentPost.images"
              :key="index"
              :src="img"
              :preview-src-list="currentPost.images"
              fit="cover"
              class="detail-image"
            />
          </div>
        </div>
        <div class="post-footer">
          <div class="interaction-data">
            <span><i class="el-icon-thumb"></i> {{ currentPost.likes }} 点赞</span>
            <span><i class="el-icon-chat-dot-round"></i> {{ currentPost.comments }} 评论</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览模态框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      width="800px"
      :close-on-click-modal="false"
      class="image-preview-dialog"
      :title="`图片预览 (${currentImageIndex + 1}/${previewImages.length})`"
    >
      <div class="image-preview-container">
        <div class="preview-main">
          <el-icon 
            class="preview-arrow left" 
            v-if="previewImages.length > 1"
            @click="prevImage"
          >
            <ArrowLeft />
          </el-icon>
          <img 
            :src="previewImages[currentImageIndex]" 
            class="preview-image"
            @load="handleImageLoad"
          >
          <el-icon 
            class="preview-arrow right" 
            v-if="previewImages.length > 1"
            @click="nextImage"
          >
            <ArrowRight />
          </el-icon>
        </div>
        <div class="preview-thumbnails" v-if="previewImages.length > 1">
          <div 
            v-for="(img, index) in previewImages" 
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentImageIndex === index }"
            @click="currentImageIndex = index"
          >
            <img :src="img" :alt="'缩略图' + (index + 1)">
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../api/request';
import { Picture, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// 列表数据
const posts = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 对话框相关
const dialogVisible = ref(false);
const currentPost = ref(null);

// 搜索表单数据
const searchForm = ref({
  username: '',
  content: '',
  timeRange: []
});

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      content: searchForm.value.content,
      startTime: searchForm.value.timeRange?.[0],
      endTime: searchForm.value.timeRange?.[1]
    };

    const response = await request.get('/post/page', { params });
    if (response.data.code === 1) {
      posts.value = response.data.data.result;
      total.value = response.data.data.total;
    } else {
      ElMessage.error('获取帖子列表失败');
    }
  } catch (error) {
    ElMessage.error('获取帖子列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchPosts();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchPosts();
};

// 查看帖子详情
const handleView = (post) => {
  currentPost.value = post;
  dialogVisible.value = true;
};

// 删除帖子
const handleDelete = async (post) => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const response = await request.delete(`/post/${post.id}`);
    if (response.data.code === 1) {
      ElMessage.success('删除成功');
      fetchPosts();
    } else {
      ElMessage.error(response.data.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchPosts();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    content: '',
    timeRange: []
  };
  currentPage.value = 1;
  fetchPosts();
};

// 时间格式化
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
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 图片预览相关
const imagePreviewVisible = ref(false);
const previewImages = ref([]);
const currentImageIndex = ref(0);

// 打开图片预览
const openImagePreview = (images) => {
  previewImages.value = images;
  currentImageIndex.value = 0;
  imagePreviewVisible.value = true;
};

// 上一张图片
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = previewImages.value.length - 1;
  }
};

// 下一张图片
const nextImage = () => {
  if (currentImageIndex.value < previewImages.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

// 处理图片加载
const handleImageLoad = (e) => {
  // 可以在这里添加图片加载完成后的处理逻辑
};

// 初始化
fetchPosts();
</script>

<style scoped>
.post-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 500;
  color: #303133;
}

.post-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.image-count {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.interaction-info {
  display: flex;
  gap: 16px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 帖子详情样式 */
.post-detail {
  padding: 20px;
}

.post-header {
  margin-bottom: 20px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-body {
  margin-bottom: 20px;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: break-all;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.detail-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.post-footer {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.interaction-data {
  display: flex;
  gap: 24px;
  color: #606266;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-button) {
  margin-left: 8px;
}

:deep(.el-table) {
  margin-top: 10px;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}

:deep(.el-range-editor.el-input__wrapper) {
  width: 240px;
}

/* 添加以下全局样式来提高图片预览的层级 */
:deep(.el-image-viewer__wrapper) {
  z-index: 2100 !important; /* 确保高于其他元素 */
}

:deep(.el-image-viewer__mask) {
  z-index: 2099 !important;
}

/* 确保图片预览的操作按钮也在最上层 */
:deep(.el-image-viewer__btn) {
  z-index: 2101 !important;
}

:deep(.el-image-viewer__actions) {
  z-index: 2101 !important;
}

.image-list {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.table-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

.table-image:hover {
  transform: scale(1.05);
}

.image-count-badge {
  position: absolute;
  right: 4px;
  bottom: 4px;
  z-index: 1;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 20px;
}

.no-image {
  color: #909399;
  font-size: 13px;
}

/* 图片预览相关样式 */
:deep(.el-image-viewer__wrapper) {
  position: fixed;
  z-index: 3000;
}

:deep(.el-image-viewer__mask) {
  background-color: rgba(0, 0, 0, 0.9);
}

:deep(.el-image-viewer__close) {
  color: #fff;
}

:deep(.el-image-viewer__img) {
  background-color: transparent;
  max-width: 100%;
  max-height: 100%;
}

:deep(.el-image-viewer__prev), 
:deep(.el-image-viewer__next) {
  color: #fff;
  font-size: 32px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  line-height: 44px;
}

:deep(.el-image-viewer__actions) {
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
}

:deep(.el-image-viewer__actions__inner) {
  color: #fff;
}

/* 优化图片加载过渡效果 */
:deep(.el-image__inner) {
  transition: opacity 0.3s ease;
}

:deep(.el-image__error) {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  background: #f5f7fa;
  color: #909399;
  height: 100%;
}

/* 确保预览时的层级正确 */
:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}

:deep(.el-image-viewer__mask) {
  z-index: 2999 !important;
}

:deep(.el-image-viewer__actions) {
  z-index: 3001 !important;
}

:deep(.el-image-viewer__btn) {
  z-index: 3001 !important;
}

:deep(.el-image-viewer__canvas) {
  z-index: 3000 !important;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  background-color: #000;
}

.image-preview-container {
  width: 100%;
  background-color: #000;
}

.preview-main {
  position: relative;
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s;
  font-size: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.preview-arrow:hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.preview-arrow.left {
  left: 30px;
}

.preview-arrow.right {
  right: 30px;
}

/* 添加图标样式 */
.preview-arrow :deep(.el-icon) {
  font-size: 28px;
  font-weight: bold;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

/* 优化缩略图导航样式 */
.preview-thumbnails {
  padding: 15px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  background-color: rgba(26, 26, 26, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.thumbnail-item {
  width: 70px;
  height: 70px;
  border: 3px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.thumbnail-item.active {
  border-color: #409EFF;
  transform: scale(1.05);
}

.thumbnail-item:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 优化预览图片容器 */
.preview-main {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(18, 18, 18);
}

.preview-image {
  max-width: calc(100% - 120px);
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* 优化对话框样式 */
.image-preview-dialog :deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  background-color: rgb(18, 18, 18);
}

.image-preview-dialog :deep(.el-dialog__header) {
  background-color: rgb(26, 26, 26);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.image-preview-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.image-preview-dialog :deep(.el-dialog__headerbtn) {
  width: 40px;
  height: 40px;
}

.image-preview-dialog :deep(.el-dialog__close) {
  font-size: 20px;
  color: #fff;
  transition: all 0.3s;
}

.image-preview-dialog :deep(.el-dialog__close:hover) {
  color: #409EFF;
  transform: scale(1.1);
}
</style>
