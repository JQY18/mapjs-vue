<template>
  <div class="notice-container">
    <el-card class="notice-card">
      <template #header>
        <div class="card-header">
          <h3>最新公告</h3>
        </div>
      </template>

      <el-timeline v-loading="loading">
        <el-timeline-item
          v-for="notice in notices"
          :key="notice.id"
          :timestamp="formatTime(notice.createTime)"
          placement="top"
          :type="notice.type === 'important' ? 'danger' : 'primary'"
        >
          <el-card class="notice-item">
            <h4>{{ notice.title }}</h4>
            <div class="notice-content">{{ notice.content }}</div>
            <div class="notice-footer">
              <span class="publisher">发布人：{{ notice.publisher }}</span>
              <el-tag 
                :type="notice.type === 'important' ? 'danger' : 'info'" 
                size="small"
              >
                {{ notice.type === 'important' ? '重要' : '普通' }}
              </el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty v-if="notices.length === 0 && !loading" description="暂无公告" />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 30]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../api/request';

const notices = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 获取公告列表
const fetchNotices = async () => {
  loading.value = true;
  try {
    const response = await request.get('/notices/page', {
      params: {
        pageNo: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    if (response.data.code === 1) {
      notices.value = response.data.data.result;
      total.value = response.data.data.total;
    } else {
      ElMessage.error('获取公告列表失败');
    }
  } catch (error) {
    ElMessage.error('获取公告列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchNotices();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchNotices();
};

onMounted(() => {
  fetchNotices();
});


// 添加时间格式化函数
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
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
.notice-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.notice-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.notice-item {
  margin-bottom: 10px;
}

.notice-item h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.notice-content {
  color: #606266;
  line-height: 1.6;
  margin: 10px 0;
  white-space: pre-wrap;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  color: #909399;
}

.publisher {
  font-size: 13px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-timeline-item__node--normal) {
  left: -2px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style> 