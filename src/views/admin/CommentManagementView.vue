<template>
  <div class="comment-management">
    <!-- 页面标题和筛选栏 -->
    <div class="page-header">
      <h2>评论管理</h2>
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索评论内容"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="评论状态" clearable>
          <el-option label="正常" value="normal" />
          <el-option label="待审核" value="pending" />
          <el-option label="已隐藏" value="hidden" />
        </el-select>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <el-table :data="filteredComments" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="评论用户">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar" />
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="location" label="评论地点" width="150" />
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                v-if="row.status === 'pending'"
                type="success" 
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button 
                :type="row.status === 'hidden' ? 'success' : 'warning'"
                @click="handleVisibilityToggle(row)"
              >
                {{ row.status === 'hidden' ? '显示' : '隐藏' }}
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

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="评论详情"
      width="600px"
    >
      <div class="comment-detail">
        <div class="detail-item">
          <label>评论用户：</label>
          <span>{{ currentComment?.username }}</span>
        </div>
        <div class="detail-item">
          <label>评论地点：</label>
          <span>{{ currentComment?.location }}</span>
        </div>
        <div class="detail-item">
          <label>评论时间：</label>
          <span>{{ currentComment?.createTime }}</span>
        </div>
        <div class="detail-item">
          <label>评论内容：</label>
          <p class="content">{{ currentComment?.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 状态和数据
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const currentComment = ref(null)

const comments = ref([
  {
    id: 1,
    username: '用户1',
    userAvatar: '/public/icon/icon.jpeg',
    content: '这是一条评论内容',
    location: '图书馆',
    createTime: '2024-01-01 12:00:00',
    status: 'normal'
  }
  // ... 更多评论数据
])

// 计算属性：过滤后的评论列表
const filteredComments = computed(() => {
  let result = comments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(comment => 
      comment.content.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(comment => comment.status === statusFilter.value)
  }

  return result
})

// 获取状态样式
const getStatusType = (status) => {
  const typeMap = {
    normal: 'success',
    pending: 'warning',
    hidden: 'info'
  }
  return typeMap[status]
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    normal: '正常',
    pending: '待审核',
    hidden: '已隐藏'
  }
  return textMap[status]
}

// 处理审核通过
const handleApprove = (comment) => {
  ElMessageBox.confirm(
    '确定通过该评论吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      comment.status = 'normal'
      ElMessage.success('审核通过成功')
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

// 处理显示/隐藏
const handleVisibilityToggle = (comment) => {
  const action = comment.status === 'hidden' ? '显示' : '隐藏'
  ElMessageBox.confirm(
    `确定要${action}该评论吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      comment.status = comment.status === 'hidden' ? 'normal' : 'hidden'
      ElMessage.success(`${action}成功`)
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

// 处理删除
const handleDelete = (comment) => {
  ElMessageBox.confirm(
    '确定要删除该评论吗？此操作不可恢复！',
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
.comment-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .filter-bar {
    display: flex;
    gap: 16px;

    .search-input {
      width: 300px;
    }
  }

  .comment-list {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .comment-detail {
    .detail-item {
      margin-bottom: 16px;

      label {
        font-weight: bold;
        margin-right: 8px;
      }

      .content {
        margin-top: 8px;
        white-space: pre-wrap;
      }
    }
  }
}
</style> 