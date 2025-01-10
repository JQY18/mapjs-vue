<template>
  <div class="location-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索地点..."
          prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加地点
        </el-button>
      </div>
    </div>

    <!-- 地点表格 -->
    <el-table
      v-loading="loading"
      :data="locationList"
      border
      style="width: 100%"
    >
      <el-table-column label="预览图" width="120">
        <template #default="{ row }">
          <el-image
            :src="row.image"
            :preview-src-list="[row.image]"
            fit="cover"
            class="location-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      
      <el-table-column prop="name" label="地点名称" width="150" />
      
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      
      <el-table-column label="坐标" width="200">
        <template #default="{ row }">
          <div class="coordinates">
            <span>{{ row.coords[0] }}, {{ row.coords[1] }}</span>
            <el-button type="primary" link @click="showOnMap(row)">
              <el-icon><Location /></el-icon>
              在地图中查看
            </el-button>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 地点表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加地点' : '编辑地点'"
      width="600px"
    >
      <el-form
        ref="locationFormRef"
        :model="locationForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="预览图" prop="image">
          <el-upload
            class="location-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="locationForm.image" :src="locationForm.image" class="preview-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="名称" prop="name">
          <el-input v-model="locationForm.name" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="locationForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="坐标" required>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="latitude">
                <el-input
                  v-model.number="locationForm.latitude"
                  placeholder="纬度"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="longitude">
                <el-input
                  v-model.number="locationForm.longitude"
                  placeholder="经度"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="locationForm.category" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Picture,
  Location
} from '@element-plus/icons-vue'

// 分类选项
const categories = [
  '食堂',
  '教学科研',
  '宿舍',
  '文化风景',
  '行政',
  '重要场馆'
]

// 表格数据
const loading = ref(false)
const locationList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const locationFormRef = ref(null)
const locationForm = reactive({
  image: '',
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  category: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入地点名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入地点描述', trigger: 'blur' }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { type: 'number', message: '纬度必须为数字', trigger: 'blur' }
  ],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { type: 'number', message: '经度必须为数字', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 获取地点列表
const fetchLocations = async () => {
  loading.value = true
  try {
    // TODO: 调用获取地点列表 API
    // const { data } = await locationApi.getLocations({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   query: searchQuery.value
    // })
    
    // 模拟数据
    setTimeout(() => {
      locationList.value = [
        {
          id: 1,
          image: '/images/library.png',
          name: '图书馆',
          description: '湖南师范大学图书馆',
          coords: [28.1895, 112.9433],
          category: '重要场馆'
        }
      ]
      total.value = 1
      loading.value = false
    }, 500)
  } catch (error) {
    loading.value = false
    ElMessage.error('获取地点列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLocations()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLocations()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLocations()
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  locationForm.image = ''
  locationForm.name = ''
  locationForm.description = ''
  locationForm.latitude = ''
  locationForm.longitude = ''
  locationForm.category = ''
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  locationForm.image = row.image
  locationForm.name = row.name
  locationForm.description = row.description
  locationForm.latitude = row.coords[0]
  locationForm.longitude = row.coords[1]
  locationForm.category = row.category
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该地点吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除地点 API
    // await locationApi.deleteLocation(row.id)
    
    ElMessage.success('删除成功')
    fetchLocations()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleImageSuccess = (response) => {
  locationForm.image = response.url
}

const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const showOnMap = (row) => {
  // TODO: 在地图中显示该地点
  ElMessage.info('功能开发中...')
}

const handleSubmit = async () => {
  if (!locationFormRef.value) return
  
  try {
    await locationFormRef.value.validate()
    
    const locationData = {
      ...locationForm,
      coords: [locationForm.latitude, locationForm.longitude]
    }
    
    // TODO: 调用添加/编辑地点 API
    // if (dialogType.value === 'add') {
    //   await locationApi.createLocation(locationData)
    // } else {
    //   await locationApi.updateLocation(locationData)
    // }
    
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
    dialogVisible.value = false
    fetchLocations()
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '编辑失败')
  }
}

// 初始化
fetchLocations()
</script>

<style scoped lang="scss">
.location-management {
  .action-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    
    .search-section {
      width: 300px;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }
  
  .location-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
  }
  
  .image-error {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 4px;
    color: #999;
    font-size: 24px;
  }
  
  .coordinates {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    span {
      color: #666;
      font-size: 13px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.location-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
  
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
    line-height: 120px;
  }
  
  .preview-image {
    width: 120px;
    height: 120px;
    display: block;
    object-fit: cover;
  }
}
</style> 