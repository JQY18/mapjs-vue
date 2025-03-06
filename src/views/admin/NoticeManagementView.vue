<template>
  <div class="notice-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>公告管理</h2>
          <el-button type="primary" @click="handleAdd">发布公告</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入标题"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择类型"
              clearable
            >
              <el-option label="普通" value="normal" />
              <el-option label="重要" value="important" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 公告列表 -->
      <el-table :data="notices" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="content" label="内容" min-width="300">
          <template #default="scope">
            <div class="notice-content">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'important' ? 'danger' : 'info'">
              {{ scope.row.type === "important" ? "重要" : "普通" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="发布人" width="120" />

        <el-table-column prop="createTime" label="发布时间" width="180" >
            <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 添加/编辑公告对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="noticeFormRef"
        :model="noticeForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="noticeForm.type">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="important">重要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../api/request";

const currentAdmin = ref(JSON.parse(localStorage.getItem("adminId")));

// 列表数据
const notices = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 搜索表单
const searchForm = ref({
  title: "",
  type: "",
  timeRange: [],
});


// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const dialogTitle = computed(() =>
  dialogType.value === "add" ? "发布公告" : "编辑公告"
);

// 表单相关
const noticeFormRef = ref(null);
const noticeForm = ref({
  id: "",
  title: "",
  content: "",
  type: "normal",
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入公告标题", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  content: [
    { required: true, message: "请输入公告内容", trigger: "blur" },
    { min: 5, max: 500, message: "长度在 5 到 500 个字符", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择公告类型", trigger: "change" }],
};

// 获取公告列表
const fetchNotices = async () => {
  loading.value = true;
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.value.title,
      type: searchForm.value.type,
      startTime: searchForm.value.timeRange?.[0],
      endTime: searchForm.value.timeRange?.[1],
    };

    const response = await request.get("/notices/page", { params });
    if (response.data.code === 1) {
      notices.value = response.data.data.result;
      total.value = response.data.data.total;
    } else {
      ElMessage.error("获取公告列表失败");
    }
  } catch (error) {
    ElMessage.error("获取公告列表失败");
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchNotices();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    title: "",
    type: "",
    timeRange: [],
  };
  currentPage.value = 1;
  fetchNotices();
};

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchNotices();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchNotices();
};

// 添加公告
const handleAdd = () => {
  dialogType.value = "add";
  noticeForm.value = {
    title: "",
    content: "",
    type: "normal",
    publisher: currentAdmin.value
  };
  dialogVisible.value = true;
};

// 编辑公告
const handleEdit = (row) => {
  dialogType.value = "edit";
//   noticeForm.value = { ...row };
  noticeForm.value = {
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type,
    publisher: currentAdmin.value
  };
  dialogVisible.value = true;
};

// 删除公告
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该公告吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const response = await request.delete(`/notices/${row.id}`);
    if (response.data.code === 1) {
      ElMessage.success("删除成功");
      fetchNotices();
    } else {
      ElMessage.error(response.data.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false;
  if (noticeFormRef.value) {
    noticeFormRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!noticeFormRef.value) return;

  await noticeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url =
          dialogType.value === "add"
            ? "/notices"
            : `/notices/${noticeForm.value.id}`;
        const method = dialogType.value === "add" ? "post" : "put";

        const response = await request[method](url, noticeForm.value);
        if (response.data.code === 1) {
          ElMessage.success(
            dialogType.value === "add" ? "发布成功" : "更新成功"
          );
          dialogVisible.value = false;
          fetchNotices();
        } else {
          ElMessage.error(
            response.data.msg ||
              (dialogType.value === "add" ? "发布失败" : "更新失败")
          );
        }
      } catch (error) {
        ElMessage.error(dialogType.value === "add" ? "发布失败" : "更新失败");
      }
    }
  });
};

// 初始化
fetchNotices();

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
.notice-management {
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

.notice-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>
