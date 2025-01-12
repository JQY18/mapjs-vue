<template>
  <div class="location-detail-edit">
    <div class="page-header">
      <el-button @click="handleBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回地点管理
      </el-button>
      <h2>{{ locationName }} - 详细信息编辑</h2>
    </div>
    
    <div class="detail-content">
      <div class="title-section">
        <div class="section-header">
          <span class="label">地点名称</span>
          <el-button 
            type="primary" 
            size="small"
            @click="handleUpdateName"
            :loading="loadingStates.name"
          >
            {{ form.name ? '更新名称' : '添加名称' }}
          </el-button>
        </div>
        <el-input v-model="form.name" placeholder="请输入地点名称" />
      </div>

      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="详细描述" name="description">
          <div class="description-section">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="6"
              placeholder="请输入详细描述"
            />
            <el-button 
              type="primary"
              @click="handleUpdateDescription"
              :loading="loadingStates.description"
            >
              {{ form.description ? '更新描述' : '添加描述' }}
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="图片集" name="images">
          <div class="media-section">
            <div v-if="!form.images.length" class="empty-tip">
              暂无图片，请上传
            </div>
            <el-carousel 
              v-else
              height="400px"
              :autoplay="false"
              indicator-position="outside"
              arrow="always"
            >
              <el-carousel-item v-for="(img, index) in form.images" :key="index">
                <div class="carousel-item">
                  <img :src="img" @click="handlePreview(img)" />
                  <el-button 
                    type="danger"
                    size="small"
                    @click="handleDeleteImage(index)"
                    :loading="loadingStates.deleteImage"
                  >
                    删除当前图片
                  </el-button>
                </div>
              </el-carousel-item>
            </el-carousel>

            <div class="upload-section">
              <el-upload
                :auto-upload="false"
                :show-file-list="true"
                accept="image/*"
                @change="handleImageSelect"
              >
                <el-button type="primary">选择图片</el-button>
              </el-upload>
              <el-button 
                type="success"
                @click="handleUploadImages"
                :loading="loadingStates.uploadImage"
                :disabled="!selectedImages.length"
              >
                上传选中图片
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="视频集" name="videos">
          <div class="media-section">
            <div v-if="!form.videos.length" class="empty-tip">
              暂无视频，请上传
            </div>
            <el-carousel 
              v-else
              height="400px"
              :autoplay="false"
              indicator-position="outside"
              arrow="always"
            >
              <el-carousel-item v-for="(video, index) in form.videos" :key="index">
                <div class="carousel-item">
                  <video :src="video" controls></video>
                  <el-button 
                    type="danger"
                    size="small"
                    @click="handleDeleteVideo(index)"
                    :loading="loadingStates.deleteVideo"
                  >
                    删除当前视频
                  </el-button>
                </div>
              </el-carousel-item>
            </el-carousel>

            <div class="upload-section">
              <el-upload
                :auto-upload="false"
                :show-file-list="true"
                accept="video/*"
                @change="handleVideoSelect"
              >
                <el-button type="primary">选择视频</el-button>
                <template #tip>
                  <div class="upload-tip">
                    支持mp4、webm等格式，最多上传3个视频，总大小不超过1000MB
                  </div>
                </template>
              </el-upload>
              <el-button 
                type="success"
                @click="handleUploadVideos"
                :loading="loadingStates.uploadVideo"
                :disabled="!selectedVideos.length"
              >
                上传选中视频
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <image-preview
      v-model:show="previewVisible"
      :image-url="previewImage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { locationApi } from '../../api/location'
import ImagePreview from '../../components/ImagePreview.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('description')
const previewVisible = ref(false)
const previewImage = ref('')
const selectedImages = ref([])
const selectedVideos = ref([])

const form = ref({
  name: '',
  description: '',
  images: [],
  videos: []
})

const loadingStates = ref({
  name: false,
  description: false,
  uploadImage: false,
  deleteImage: false,
  uploadVideo: false,
  deleteVideo: false
})

const detailId = ref(route.params.detailId)
const locationName = ref(route.query.name || '')

const fetchDetailInfo = async () => {
  try {
    const { data } = await locationApi.getLocationDetail(detailId.value)
    form.value = {
      name: data.code === 1 ? data.data.name : '',
      description: data.code === 1 ? data.data.description : '',
      images: data.code === 1 ? data.data.images : [],
      videos: data.code === 1 ? data.data.videos : []
    }
    
    if (data.code !== 1) {
      ElMessage.info('该地点暂无详细信息，请添加')
    }
  } catch (error) {
    ElMessage.error('获取详细信息失败')
  }
}

const handleUpdateName = async () => {
  try {
    loadingStates.value.name = true
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    formData.append('name', form.value.name)
    
    const { data } = await locationApi.updateLocationDetail(formData)
    if (data.code === 1) {
      ElMessage.success(form.value.name ? '名称更新成功' : '名称添加成功')
    }
  } catch (error) {
    ElMessage.error(form.value.name ? '名称更新失败' : '名称添加失败')
  } finally {
    loadingStates.value.name = false
  }
}

const handleUpdateDescription = async () => {
  try {
    loadingStates.value.description = true
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    formData.append('description', form.value.description)
    
    const { data } = await locationApi.updateLocationDetail(formData)
    if (data.code === 1) {
      ElMessage.success(form.value.description ? '描述更新成功' : '描述添加成功')
    }
  } catch (error) {
    ElMessage.error(form.value.description ? '描述更新失败' : '描述添加失败')
  } finally {
    loadingStates.value.description = false
  }
}

const handleImageSelect = (file) => {
  selectedImages.value.push(file.raw)
}

const handleUploadImages = async () => {
  try {
    loadingStates.value.uploadImage = true
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    selectedImages.value.forEach(file => {
      formData.append('images', file)
    })
    
    const { data } = await locationApi.uploadLocationDetailImages(formData)
    if (data.code === 1) {
      ElMessage.success('图片上传成功')
      selectedImages.value = []
      await fetchDetailInfo()
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  } finally {
    loadingStates.value.uploadImage = false
  }
}

const handleDeleteImage = async (index) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这张图片吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loadingStates.value.deleteImage = true
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    formData.append('imageUrl', form.value.images[index])
    
    const { data } = await locationApi.deleteDetailImage(formData)
    if (data.code === 1) {
      ElMessage.success('图片删除成功')
      await fetchDetailInfo()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('图片删除失败')
    }
  } finally {
    loadingStates.value.deleteImage = false
  }
}

const handleVideoSelect = (file) => {
  // 检查视频数量限制
  if (form.value.videos.length + selectedVideos.value.length >= 3) {
    ElMessage.warning('最多只能上传3个视频')
    return false
  }
  
  // 检查单个视频大小（MB）
  const videoSize = file.raw.size / 1024 / 1024
  
  // 计算当前已选视频的总大小
  const currentTotalSize = selectedVideos.value.reduce((total, video) => {
    return total + video.size / 1024 / 1024
  }, 0)
  
  // 检查总大小限制
  if (currentTotalSize + videoSize > 1000) {
    ElMessage.warning('视频总大小不能超过1000MB')
    return false
  }
  
  selectedVideos.value.push(file.raw)
}

const handleUploadVideos = async () => {
  try {
    loadingStates.value.uploadVideo = true
    
    // 再次检查总大小限制（以防万一）
    const totalSize = selectedVideos.value.reduce((total, video) => {
      return total + video.size / 1024 / 1024
    }, 0)
    
    if (totalSize > 1000) {
      ElMessage.warning('视频总大小不能超过1000MB')
      return
    }
    
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    selectedVideos.value.forEach(file => {
      formData.append('videos', file)
    })
    
    const { data } = await locationApi.uploadLocationDetailVideos(formData)
    if (data.code === 1) {
      ElMessage.success('视频上传成功')
      selectedVideos.value = []
      await fetchDetailInfo()
    }
  } catch (error) {
    ElMessage.error('视频上传失败')
  } finally {
    loadingStates.value.uploadVideo = false
  }
}

const handleDeleteVideo = async (index) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个视频吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loadingStates.value.deleteVideo = true
    const formData = new FormData()
    formData.append('detailId', detailId.value)
    formData.append('videoUrl', form.value.videos[index])
    
    const { data } = await locationApi.deleteDetailVideo(formData)
    if (data.code === 1) {
      ElMessage.success('视频删除成功')
      await fetchDetailInfo()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('视频删除失败')
    }
  } finally {
    loadingStates.value.deleteVideo = false
  }
}

const handlePreview = (url) => {
  previewImage.value = url
  previewVisible.value = true
}

const handleBack = () => {
  router.push('/admin/locations')
}

onMounted(() => {
  fetchDetailInfo()
})
</script>

<style scoped lang="scss">
.location-detail-edit {
  padding: 20px;

  .page-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    h2 {
      margin: 0;
    }
  }

  .detail-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .title-section {
      margin-bottom: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .label {
          font-weight: bold;
          font-size: 16px;
        }
      }
    }

    .description-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .media-section {
      .empty-tip {
        text-align: center;
        color: #909399;
        font-size: 14px;
        padding: 40px 0;
        background: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 20px;
      }

      .carousel-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        img, video {
          max-height: 350px;
          object-fit: contain;
        }

        .el-button {
          margin-top: 10px;
        }
      }

      .upload-section {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        align-items: flex-start;

        .upload-tip {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
      }
    }
  }
}
</style> 