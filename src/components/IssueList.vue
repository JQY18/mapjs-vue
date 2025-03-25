<template>
  <div class="issue-list">
    <!-- 问题列表表格 -->
    <el-table :data="issues" style="width: 100%">
      <el-table-column prop="title" label="问题标题" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="created_at" label="提交时间" />
      <el-table-column prop="solved_at" label="解决时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="handleDetail(scope.row)">查看详情</el-button>
          <el-button v-if="isAdmin" @click="handleResolve(scope.row)">
            {{ scope.row.status === "待定" ? "解决" : "重新处理" }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @size-change="handlePageSize"
      @current-change="handlePageChange"
    />
  </div>
</template>
  
  <script setup>
import { ref, computed, onMounted } from "vue";
import { userApi } from "../api/user";

// 状态管理
const issues = ref([
  {
    title: "湖师大天马公寓为何频繁跳闸？", // 修正字段名
    status: "已解决",
    created_at: "2024-12-01",
    solved_at: "2024-12-15",
  },
  {
    title: "天马食堂到底什么时候开门？",
    status: "已解决",
    created_at: "2024-4-20",
    solved_at: "2025-2-17",
  },
  {
    title: "热水时间段能不能延长？",
    status: "待定",
    created_at: "2025-3-18",
    solved_at: "待定",
  },
  {
    title: "江湾体育馆的羽毛球场地什么时候开放？",
    status: "待定",
    created_at: "2025-3-18",
    solved_at: "待定",
  },
  {
    title: "图书馆的座位能不能增加？",
    status: "待定",
    created_at: "2025-3-18",
    solved_at: "待定",
  },
  {
    title: "食堂的菜能不能换换口味？",
    status: "待定",
    created_at: "2025-3-18",
    solved_at: "待定",
  },
  {
    title: "宿舍的网速能不能快点？",
    status: "待定",
    created_at: "2025-3-18",
    solved_at: "待定",
  },
  {
    title: "天马学生公寓能不能装洗衣机",
    status: "已解决",
    created_at: "2024-3-18",
    solved_at: "2024-10-9",
  },
]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => issues.value.length);

// 弹窗状态

const selectedIssue = ref(null);

// API 调用
const fetchIssues = async () => {
  const res = await userApi.getIssues();
  issues.value = res.data;
};

const handleResolve = async (issue) => {
  await userApi.resolveIssue(issue.id);
  await fetchIssues(); // 刷新列表
};

// 事件处理
const handleDetail = (issue) => {};

const handlePageSize = (size) => (pageSize.value = size);
const handlePageChange = (page) => (currentPage.value = page);

// 权限控制（示例）
const isAdmin = ref(localStorage.getItem("admin_token") === "true");
</script>
  
  <style scoped>
.issue-list {
  padding: 20px;
}

.el-table {
  margin-bottom: 20px;
}

el-pagination {
  margin-top: 20px;
}
</style>