<template>
  <div class="user-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>用户管理</h2>
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input
              v-model="searchForm.nickname"
              placeholder="请输入昵称"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="学校">
            <el-input
              v-model="searchForm.school"
              placeholder="请输入学校"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="users" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="school" label="学校" width="120" />
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteUser(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5,10, 20, 30, 50]"
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
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../api/request';

const users = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索表单数据
const searchForm = ref({
  username: '',
  nickname: '',
  school: ''
});

async function fetchUsers() {
  loading.value = true;
  try {
    request.get('/user/page', {
      params: {
        pageNo: currentPage.value,
        pageSize: pageSize.value,
        ...searchForm.value
      }
    }).then(response => {
        if (response.data.code === 1) {
          users.value = response.data.data.result;
          total.value = response.data.data.total;
        } else {
          ElMessage.error('获取用户列表失败');
        }
    });

  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchUsers();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    nickname: '',
    school: ''
  };
  currentPage.value = 1;
  fetchUsers();
};

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchUsers();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

function handleAdd() {
  // 实现添加用户的逻辑
  console.log('Add User');
}

function editUser(user) {
  // 实现编辑用户的逻辑
  console.log('Edit User', user);
}

async function deleteUser(id) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    request.delete(`/user/${id}`).then(response => {
      if (response.data.code === 1) {
        ElMessage.success('删除成功');
        fetchUsers();
      } else {
        ElMessage.error('删除失败');
      }
    });

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

:deep(.el-pagination) {
  padding: 0;
  margin: 16px 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}
</style>
