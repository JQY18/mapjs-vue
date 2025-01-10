<template>
  <div class="user-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户..."
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
          <el-icon><Plus /></el-icon>添加用户
        </el-button>
        <el-button type="danger" :disabled="!selectedUsers.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
      border
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="40" :src="row.avatar" />
        </template>
      </el-table-column>
      
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      
      <el-table-column prop="createTime" label="注册时间" />
      
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            :active-value="1"
            :inactive-value="0"
          />
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
  Delete
} from '@element-plus/icons-vue'

// 表格数据
const loading = ref(false)
const userList = ref([])
const selectedUsers = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const userFormRef = ref(null)
const userForm = reactive({
  avatar: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 1
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 方法
const fetchUsers = async () => {
  loading.value = true
  try {
    // TODO: 调用获取用户列表 API
    // const { data } = await userApi.getUsers({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   query: searchQuery.value
    // })
    
    // 模拟数据
    setTimeout(() => {
      userList.value = [
        {
          id: 1,
          avatar: '/public/icon/icon.jpeg',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 1,
          createTime: '2024-01-20 10:00:00'
        }
      ]
      total.value = 1
      loading.value = false
    }, 500)
  } catch (error) {
    loading.value = false
    ElMessage.error('获取用户列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  userForm.avatar = ''
  userForm.username = ''
  userForm.email = ''
  userForm.password = ''
  userForm.role = 'user'
  userForm.status = 1
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(userForm, row)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除用户 API
    // await userApi.deleteUser(row.id)
    
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用批量删除 API
    // await userApi.batchDeleteUsers(selectedUsers.value.map(user => user.id))
    
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    // TODO: 调用更新用户状态 API
    // await userApi.updateUserStatus(row.id, row.status)
    
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1 // 回滚状态
  }
}

const handleAvatarSuccess = (response) => {
  userForm.avatar = response.url
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    // TODO: 调用添加/编辑用户 API
    // if (dialogType.value === 'add') {
    //   await userApi.createUser(userForm)
    // } else {
    //   await userApi.updateUser(userForm)
    // }
    
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '编辑失败')
  }
}

// 初始化
fetchUsers()
</script>

<style scoped lang="scss">
.user-management {
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
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.avatar-uploader {
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
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
}
</style> 