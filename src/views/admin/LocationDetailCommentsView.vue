<template>
  <div class="comments-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="$router.back()" icon="ArrowLeft">返回</el-button>
            <h2>{{locationName}} - 评论管理</h2>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="评论内容">
            <el-input
              v-model="searchForm.content"
              placeholder="请输入关键词"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="comments" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="scope">
            <div class="comment-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="评论时间" width="180" />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="deleteComment(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="comments.length === 0 && !loading" description="暂无评论" />

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
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
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../api/request';

const route = useRoute();
const router = useRouter();
const comments = ref([]);
const loading = ref(false);
const detailId = route.params.detailId;
const locationName = ref(route.query.name || '');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索表单数据
const searchForm = ref({
  content: '',
  timeRange: []
});

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 获取评论列表
async function fetchComments() {
  loading.value = true;
  try {
    const params = {
        detailId,
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      content: searchForm.value.content,
      startTime: searchForm.value.timeRange?.[0],
      endTime: searchForm.value.timeRange?.[1]
    };

    const response = await request.get("/locations/comments/page", { params });
    if (response.data.code === 1) {
      comments.value = response.data.data.result;
      total.value = response.data.data.total;
    } else {
      ElMessage.error('获取评论列表失败');
    }
  } catch (error) {
    ElMessage.error('获取评论列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchComments();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    content: '',
    timeRange: []
  };
  currentPage.value = 1;
  fetchComments();
};

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchComments();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchComments();
};

// 删除评论
async function deleteComment(id) {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const response = await request.delete(`/locations/comments/${id}`);
    if (response.data.code === 1) {
      ElMessage.success('删除成功');
      fetchComments(); // 重新加载评论列表
    } else {
      ElMessage.error(response.data.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
}

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.comments-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.comment-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-button) {
  margin-left: 8px;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table .cell) {
  word-break: break-word;
}

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}
</style>