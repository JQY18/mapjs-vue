<template>
  <div class="media-management">
    <!-- 上传按钮 -->
    <div class="action-bar">
      <el-upload
        class="upload-btn"
        action="/api/upload"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        multiple
      >
        <el-button type="primary">
          <el-icon><Upload /></el-icon>上传文件
        </el-button>
      </el-upload>
      
      <div class="filter-section">
        <el-radio-group v-model="mediaType" @change="handleFilterChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="image">图片</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 媒体网格 -->
    <div v-loading="loading" class="media-grid">
      <el-empty v-if="!mediaList.length" description="暂无媒体文件" />
      
      <div v-else class="grid-container">
        <div
          v-for="item in mediaList"
          :key="item.id"
          class="media-item"
        >
          <!-- 图片预览 -->
          <div v-if="item.type === 'image'" class="media-preview">
            <el-image
              :src="item.url"
              :preview-src-list="[item.url]"
              fit="cover"
              class="preview-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="item.type === 'video'" class="media-preview video-preview">
            <video
              :src="item.url"
              class="preview-video"
              @mouseover="handleVideoHover"
              @mouseout="handleVideoLeave"
            />
            <div class="video-overlay">
              <el-icon><VideoPlay /></el-icon>
            </div>
          </div>
          
          <!-- 文件信息 -->
          <div class="media-info">
            <div class="info-text">
              <div class="filename" :title="item.name">{{ item.name }}</div>
              <div class="filesize">{{ formatSize(item.size) }}</div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="media-actions">
              <el-tooltip content="复制链接">
                <el-button
                  type="primary"
                  link
                  @click="copyUrl(item.url)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="删除">
                <el-button
                  type="danger"
                  link
                  @click="handleDelete(item)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Picture,
  VideoPlay,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue'

// 状态
const loading = ref(false)
const mediaType = ref('all')
const mediaList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(24)

// 获取媒体列表
const fetchMediaList = async () => {
  loading.value = true
  try {
    // TODO: 调用获取媒体列表 API
    // const { data } = await mediaApi.getMediaList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   type: mediaType.value
    // })
    
    // 模拟数据
    setTimeout(() => {
      mediaList.value = [
        {
          id: 1,
          name: 'example.jpg',
          url: '/images/library.png',
          type: 'image',
          size: 1024 * 1024 * 1.5 // 1.5MB
        }
      ]
      total.value = 1
      loading.value = false
    }, 500)
  } catch (error) {
    loading.value = false
    ElMessage.error('获取媒体列表失败')
  }
}

// 处理文件上传
const handleUploadSuccess = (response) => {
  ElMessage.success('上传成功')
  fetchMediaList()
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isImage && !isVideo) {
    ElMessage.error('只能上传图片或视频文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB!')
    return false
  }
  return true
}

// 处理视频预览
const handleVideoHover = (event) => {
  event.target.play()
}

const handleVideoLeave = (event) => {
  event.target.pause()
  event.target.currentTime = 0
}

// 复制链接
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 删除媒体
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该文件吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除媒体 API
    // await mediaApi.deleteMedia(item.id)
    
    ElMessage.success('删除成功')
    fetchMediaList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 工具函数
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 分页和筛选
const handleFilterChange = () => {
  currentPage.value = 1
  fetchMediaList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchMediaList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchMediaList()
}

// 初始化
fetchMediaList()
</script>

<style scoped lang="scss">
.media-management {
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .filter-section {
    :deep(.el-radio-button__inner) {
      padding: 8px 20px;
    }
  }
  
  .media-grid {
    min-height: 400px;
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 4px;
    }
  }
  
  .media-item {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      
      .media-actions {
        opacity: 1;
      }
    }
  }
  
  .media-preview {
    position: relative;
    padding-bottom: 100%;
    background: #f5f5f5;
    
    .preview-image,
    .preview-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .video-preview {
    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-size: 32px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover .video-overlay {
      opacity: 1;
    }
  }
  
  .media-info {
    padding: 12px;
    position: relative;
    
    .info-text {
      padding-right: 40px;
    }
    
    .filename {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .filesize {
      font-size: 12px;
      color: #999;
    }
  }
  
  .media-actions {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 32px;
}
</style> 