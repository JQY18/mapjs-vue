<template>
  <div class="comment-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索评论内容..."
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
        <el-button type="danger" :disabled="!selectedComments.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
    </div>

    <!-- 评论表格 -->
    <el-table
      v-loading="loading"
      :data="commentList"
      @selection-change="handleSelectionChange"
      border
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column label="用户" width="200">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" :src="row.userAvatar" />
            <span>{{ row.username }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
      
      <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip />
      
      <el-table-column prop="createTime" label="评论时间" width="180" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '正常' : '已隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button 
              type="primary" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '隐藏' : '显示' }}
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

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="评论详情"
      width="600px"
    >
      <div class="comment-detail">
        <div class="detail-item">
          <label>用户：</label>
          <div class="user-info">
            <el-avatar :size="32" :src="selectedComment?.userAvatar" />
            <span>{{ selectedComment?.username }}</span>
          </div>
        </div>
        
        <div class="detail-item">
          <label>评论内容：</label>
          <p>{{ selectedComment?.content }}</p>
        </div>
        
        <div class="detail-item">
          <label>地点：</label>
          <span>{{ selectedComment?.location }}</span>
        </div>
        
        <div class="detail-item">
          <label>评论时间：</label>
          <span>{{ selectedComment?.createTime }}</span>
        </div>
        
        <div class="detail-item">
          <label>状态：</label>
          <el-tag :type="selectedComment?.status === 1 ? 'success' : 'info'">
            {{ selectedComment?.status === 1 ? '正常' : '已隐藏' }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Delete
} from '@element-plus/icons-vue'

// 表格数据
const loading = ref(false)
const commentList = ref([])
const selectedComments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 对话框相关
const dialogVisible = ref(false)
const selectedComment = ref(null)

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    // TODO: 调用获取评论列表 API
    // const { data } = await commentApi.getComments({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   query: searchQuery.value
    // })
    
    // 模拟数据
    setTimeout(() => {
      commentList.value = [
        {
          id: 1,
          userAvatar: '/public/icon/icon.jpeg',
          username: 'user1',
          content: '这个地方真不错！',
          location: '图书馆',
          createTime: '2024-01-20 10:00:00',
          status: 1
        }
      ]
      total.value = 1
      loading.value = false
    }, 500)
  } catch (error) {
    loading.value = false
    ElMessage.error('获取评论列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComments()
}

const handleSelectionChange = (selection) => {
  selectedComments.value = selection
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchComments()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchComments()
}

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 1 ? '隐藏' : '显示'}该评论吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用更新评论状态 API
    // await commentApi.updateStatus(row.id, row.status === 1 ? 0 : 1)
    
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('操作成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该评论吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除评论 API
    // await commentApi.deleteComment(row.id)
    
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedComments.value.length} 条评论吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用批量删除 API
    // await commentApi.batchDeleteComments(selectedComments.value.map(comment => comment.id))
    
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
fetchComments()
</script>

<style scoped lang="scss">
.comment-management {
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
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.comment-detail {
  .detail-item {
    margin-bottom: 16px;
    
    label {
      font-weight: 500;
      margin-right: 8px;
      color: #666;
    }
    
    p {
      margin: 8px 0;
      line-height: 1.6;
    }
  }
}
</style> 