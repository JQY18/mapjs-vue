<template>
  <div class="location-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2>地点管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加地点
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索地点名称"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="categoryFilter" placeholder="地点类型" clearable>
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 地点列表 -->
    <div class="location-list">
      <el-table :data="filteredLocations" stripe style="width: 100%">
        <el-table-column prop="detailId" label="DETAIL_ID" width="120" />
        <el-table-column prop="name" label="地点名称" />
        <el-table-column label="地点图片" width="120">
          <template #default="{ row }">
            <img
              :src="row.image"
              class="location-image"
              @click="handlePreview(row.image)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类型">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="坐标" width="180">
          <template #default="{ row }">
            <div class="coords">
              <span>{{ row.coords[0] }}</span>
              <span>{{ row.coords[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <div class="action-buttons">
              <div class="button-row">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="handleEdit(row)"
                >
                  <el-icon><Edit /></el-icon>
                  <span>编辑</span>
                </el-button>
                
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDelete(row)"
                >
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-button>
              </div>
              
              <div class="button-row">
                <el-button
                  type="success"
                  size="small"
                  @click="handleEditDetail(row)"
                  class="detail-button"
                >
                  <el-icon><Document /></el-icon>
                  <span>详细信息</span>
                </el-button>
                
                <el-button
                  type="warning"
                  size="small"
                  @click="handleAddAdmin(row)"
                  v-if="isSuper"
                >
                  <el-icon><User /></el-icon>
                  <span>添加管理员</span>
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑地点对话框 -->
    <base-dialog
      v-model="dialogVisible"
      :title="editingLocation ? '编辑地点' : '添加地点'"
      @confirm="handleSubmit"
    >
      <el-form
        :model="locationForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="地点名称" prop="name">
          <el-input v-model="locationForm.name" />
        </el-form-item>
        
        <el-form-item label="地点类型" prop="category">
          <el-select v-model="locationForm.category" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="地点描述" prop="description">
          <el-input v-model="locationForm.description" type="textarea" :rows="4" />
        </el-form-item>
        
        <el-form-item label="地点图片" prop="image">
          <el-upload
            class="location-upload"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileChange"
          >
            <img v-if="locationForm.image" :src="locationForm.image" class="preview-image">
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="地点坐标">
          <div class="coordinate-inputs">
            <el-input v-model="locationForm.coords[0]" placeholder="纬度">
              <template #prefix>Lat:</template>
            </el-input>
            <el-input v-model="locationForm.coords[1]" placeholder="经度">
              <template #prefix>Lng:</template>
            </el-input>
          </div>
        </el-form-item>
      </el-form>
    </base-dialog>

    <!-- 图片预览模态框 -->
    <image-preview
      v-model:show="previewVisible"
      :image-url="previewImage"
    />

    <!-- 添加管理员对话框 -->
    <el-dialog
      v-model="adminDialogVisible"
      title="添加管理员"
      width="400px"
    >
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="adminForm.password" 
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmitAdmin"
          :loading="submittingAdmin"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Document,
  Upload,
  User
} from '@element-plus/icons-vue'
import { locationApi } from '../../api/location'
import { adminApi } from '../../api/admin'
import BaseDialog from '../../components/BaseDialog.vue'
import ImagePreview from '../../components/ImagePreview.vue'
import { useRouter } from 'vue-router'

// 地点类型选项
const categoryOptions = [
  { label: '食堂', value: '食堂' },
  { label: '教学科研', value: '教学科研' },
  { label: '重要场馆', value: '重要场馆' },
  { label: '宿舍', value: '宿舍' },
  { label: '体育场所', value: '体育场所' },
  { label: '办公楼', value: '办公楼' },
  { label: '文化风景', value: '文化风景' },
  { label: '行政', value: '行政' },
  { label: '校门', value: '校门' },
  { label: '其他', value: '其他' }
]

// 创建响应式表单数据
const createEmptyForm = () => ({
  id: null,
  name: '',
  category: '',
  description: '',
  image: '',
  imageFile: null,
  coords: ['', ''],
  detailId: ''
})

// 状态管理
const searchQuery = ref('')
const categoryFilter = ref('')
const dialogVisible = ref(false)
const editingLocation = ref(null)
const locations = ref([])
const locationForm = ref(createEmptyForm())

const rules = {
  name: [
    { required: true, message: '请输入地点名称', trigger: ['blur', 'change'] }
  ],
  category: [
    { required: true, message: '请选择地点类型', trigger: ['blur', 'change'] }
  ],
  description: [
    { required: true, message: '请输入地点描述', trigger: ['blur', 'change'] }
  ]
}

// 获取所有地点
const fetchLocations = async () => {
  try {
    const { data } = await locationApi.getLocations()
    if (data.code === 1) {
      locations.value = data.data
    }
  } catch (error) {
    console.error('获取地点列表失败:', error)
    ElMessage.error('获取地点列表失败')
  }
}

// 计算属性：过滤后的地点列表
const filteredLocations = computed(() => {
  let result = locations.value
  
  // 先按类型筛选
  if (categoryFilter.value) {
    result = result.filter(item => item.category === categoryFilter.value)
  }

  // 再按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  return result
})

// 获取类型标签样式
const getCategoryTagType = (category) => {
  const typeMap = {
    '食堂': 'warning',
    '教学科研': 'primary',
    '重要场馆': 'success',
    '宿舍': 'info',
    '体育场所': 'danger',
    '办公楼': '',
    '校门': '',
    '其他': 'info'
  }
  return typeMap[category] || ''
}


const router = useRouter()

const handleEditDetail = (row) => {
  router.push({
    name: 'LocationDetailEdit',
    params: {
      detailId: row.detailId
    },
    query: {
      name: row.name
    }
  })
}


const handleFileChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  // 保存文件对象
  locationForm.value.imageFile = file.raw
  
  // 创建本地预览URL
  locationForm.value.image = URL.createObjectURL(file.raw)
}

// 处理添加地点
const handleAdd = () => {
  editingLocation.value = null
  locationForm.value = createEmptyForm()
  dialogVisible.value = true
}

// 处理编辑地点
const handleEdit = (row) => {
  editingLocation.value = row
  locationForm.value = {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    image: row.image,
    coords: [...row.coords],
    detailId: row.detailId
  }
  dialogVisible.value = true
}

// 处理删除地点
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该地点？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const { data } = await locationApi.deleteLocation(row.id)
    if (data.code === 1) {
      ElMessage.success('删除成功')
      fetchLocations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}


// 处理表单提交
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      editingLocation.value ? '确认修改该地点？' : '确认添加该地点？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 创建 FormData
    const formData = new FormData()
    
    // 添加ID（如果是编辑模式）
    if (editingLocation.value) {
      formData.append('id', locationForm.value.id)
    }
    
    // 添加基本信息
    formData.append('name', locationForm.value.name)
    formData.append('category', locationForm.value.category)
    formData.append('description', locationForm.value.description)
    
    // 添加坐标
    formData.append('coords', locationForm.value.coords)
    
    // 只在有新图片时添加图片文件
    if (locationForm.value.imageFile && (!editingLocation.value || locationForm.value.image !== editingLocation.value.image)) {
      formData.append('imageFile', locationForm.value.imageFile)
    }

    const api = editingLocation.value
      ? locationApi.updateLocation
      : locationApi.addLocation
    
    const { data } = await api(formData)
    
    if (data.code === 1) {
      ElMessage.success(editingLocation.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      fetchLocations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(editingLocation.value ? '更新失败' : '添加失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  locationForm.value = createEmptyForm()
  editingLocation.value = null
}

// 图片预览状态
const previewVisible = ref(false)
const previewImage = ref('')

// 处理图片预览
const handlePreview = (imageUrl) => {
  previewImage.value = imageUrl
  previewVisible.value = true
}

// 添加日期格式化函数
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 添加管理员相关
const adminDialogVisible = ref(false)
const adminFormRef = ref(null)
const submittingAdmin = ref(false)
const isSuper = ref(false)

const adminForm = ref({
  username: '',
  password: '',
  locationId: null
})

const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

onMounted(async () => {
  // 获取当前管理员权限
  try {
    const { data } = await adminApi.getInfo()
    if (data.code === 1) {
      isSuper.value = data.data.locationId === 0
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error)
  }
  
  fetchLocations()
})

// 添加管理员相关方法
const handleAddAdmin = (row) => {
  adminForm.value = {
    username: '',
    password: '',
    locationId: row.id
  }
  adminDialogVisible.value = true
}

const handleSubmitAdmin = async () => {
  if (!adminFormRef.value) return
  
  try {
    // 表单验证
    await adminFormRef.value.validate()
    
    // 额外验证
    if (!adminForm.value.username.trim()) {
      ElMessage.warning('用户名不能为空')
      return
    }
    
    if (!adminForm.value.password || adminForm.value.password.length < 6) {
      ElMessage.warning('密码不能为空且长度不能小于6位')
      return
    }
    
    submittingAdmin.value = true
    
    const { data } = await adminApi.createAdmin(adminForm.value)
    
    if (data.code === 1) {
      ElMessage.success('添加管理员成功')
      adminDialogVisible.value = false
      adminForm.value = {
        username: '',
        password: '',
        locationId: null
      }
    } else {
      ElMessage.error(data.msg || '添加管理员失败')
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submittingAdmin.value = false
  }
}
</script>

<style scoped lang="scss">
.location-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }
  }

  .location-list {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .coordinate-inputs {
    display: flex;
    gap: 16px;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .button-row {
      display: flex;
      gap: 8px;
      
      .el-button {
        margin-left: 0;
        flex: 1;
      }
    }
  }
}

.location-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.location-image:hover {
  transform: scale(1.05);
}

.coords {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.location-upload {
  .preview-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .upload-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }
}
</style> 