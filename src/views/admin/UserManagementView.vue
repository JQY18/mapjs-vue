<template>
  <div class="user-management">
    <!-- 页面标题和搜索栏 -->
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/昵称"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <el-table :data="filteredUsers" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar" />
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="nickname">{{ row.nickname }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="registerTime" label="注册时间" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="handleStatusChange(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 状态和数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const users = ref([
  {
    id: 1,
    username: 'user1',
    nickname: '用户1',
    avatar: '/public/icon/icon.jpeg',
    email: 'user1@example.com',
    registerTime: '2024-01-01',
    status: 1
  }
  // ... 更多用户数据
])

// 计算属性：过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.nickname.toLowerCase().includes(query)
  )
})

// 处理状态改变
const handleStatusChange = (user) => {
  const action = user.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}该用户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用API更新状态
      user.status = user.status === 1 ? 0 : 1
      ElMessage.success(`${action}成功`)
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

// 处理删除
const handleDelete = (user) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用删除API
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新获取数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新获取数据
}
</script>

<style scoped lang="scss">
.user-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-bar {
    .search-input {
      width: 300px;
    }
  }

  .user-list {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details {
      .username {
        font-weight: bold;
      }
      .nickname {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 