<template>
  <div class="admin-management">
    <!-- 无权限提示 -->
    <el-empty
      v-if="!isSuper"
      description="您没有权限访问此页面"
    >
      <el-button type="primary" @click="$router.push('/admin/dashboard')">
        返回首页
      </el-button>
    </el-empty>

    <!-- 管理员列表内容 -->
    <div v-else>
      <!-- 页面标题和搜索栏 -->
      <div class="page-header">
        <h2>管理员信息</h2>
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索管理员用户名"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-button 
            type="primary"
            @click="handleAdd"
            v-if="isSuper"
          >
            <el-icon><Plus /></el-icon>添加超级管理员
          </el-button>
        </div>
      </div>

      <!-- 管理员列表 -->
      <div class="admin-list">
        <el-table :data="filteredAdmins" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="管理员信息">
            <template #default="{ row }">
              <div class="admin-info">
                <el-avatar :size="32" :icon="User" class="admin-avatar" />
                <div class="admin-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="level">{{ row.locationId === 0 ? '超级管理员' : '普通管理员' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="locationId" label="可管理地点" width="150">
            <template #default="{ row }">
              {{ row.locationName }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.createdTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button-group>
                <el-button 
                  type="primary"
                  @click="handleEdit(row)"
                  :disabled="!canEdit(row)"
                >
                  修改
                </el-button>
                <el-button 
                  type="danger"
                  @click="handleDelete(row)"
                  :disabled="!canDelete(row)"
                >
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员' : '添加超级管理员'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input 
            v-model="form.password" 
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../../api/admin'
import { locationApi } from '../../api/location'

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return '暂无数据'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const searchQuery = ref('')
const adminList = ref([])
const locations = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const currentAdminId = ref(localStorage.getItem('adminId'))
const adminLocationId = ref(0)
const isSuper = computed(() => adminLocationId.value === 0)


const formRef = ref(null)
const form = ref({
  username: '',
  password: '',
  locationId: 0
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const filteredAdmins = computed(() => {
  // 先过滤搜索结果
  const filtered = adminList.value.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  // 对结果进行排序：当前管理员置顶，其他按ID排序
  return filtered.sort((a, b) => {
    if (a.id === currentAdminId.value) return -1
    if (b.id === currentAdminId.value) return 1
    return a.id - b.id
  })
})

const fetchData = async () => {
  try {
    const [adminRes, locationRes] = await Promise.all([
      adminApi.getAdminList(),
      locationApi.getLocations()
    ])
    
    if (adminRes.data.code === 1) {
      adminList.value = adminRes.data.data
    }
    
    if (locationRes.data.code === 1) {
      locations.value = locationRes.data.data
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    username: '',
    password: '',
    locationId: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = {
    id: row.id,
    username: row.username,
    locationId: row.locationId
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该管理员吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const { data } = await adminApi.deleteAdmin(row.id)
      if (data.code === 1) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(data.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const api = isEdit.value ? adminApi.updateAdmin : adminApi.createAdmin
    const { data } = await api(form.value)
    
    if (data.code === 1) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(data.msg || (isEdit.value ? '修改失败' : '添加失败'))
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 权限控制函数
const canEdit = (admin) => {
  // 只能修改自己
  if (admin.id === currentAdminId.value) {
    return true
  }
  if(admin.locationId !== 0){
    return true
  }
  // 其他管理员（包括超级管理员）都不能修改
  return false
}

const canDelete = (admin) => {
  // 当前登录的超级管理员不能删除
  if (admin.id === currentAdminId.value) {
    return false
  }
  // 其他超级管理员不能删除
  if (admin.locationId === 0) {
    return false
  }
  // 普通管理员可以删除
  return true
}

onMounted(() => {
  // 获取当前管理员信息
  adminApi.getInfo().then(res => {
    adminLocationId.value = res.data.data.locationId
  })
  // 如果不是超级管理员，直接返回首页
  if (!isSuper.value) {
    ElMessage.warning('您没有权限访问此页面')
    return
  }
  fetchData()
})
</script>

<style scoped lang="scss">
.admin-management {
  min-height: 400px;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .search-bar {
    display: flex;
    gap: 16px;
    align-items: center;

    .search-input {
      width: 300px;
    }
  }

  .admin-list {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .admin-avatar {
      background: #1890ff;
      color: #fff;
    }

    .admin-details {
      .username {
        font-weight: 500;
        color: #333;
      }
      
      .level {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }
    }
  }
}
</style> 