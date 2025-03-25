<template>
  <div class="mailbox-container">
    <!-- 标签页切换 -->
    <div class="tab-switcher">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 主要内容区 -->
    <main class="content-area">
      <!-- 提交建议表单 -->
      <template v-if="activeTab === 'submit'">
        <form-submit @success="showSuccess" />
      </template>

      <!-- 问题列表 -->
      <template v-else-if="activeTab === 'list'">
        <issue-list
          :issues="issues"
          @view="handleViewIssue"
          @reply="handleReply"
        />
      </template>
    </main>

    <!-- 底部统计 -->
    <footer class="footer">
      <div class="stats">
        <span>已解决问题：{{ resolvedCount }}</span>
        <span>待处理问题：{{ pendingCount }}</span>
      </div>
    </footer>
  </div>
</template>
  
  <script setup>
import { ref, computed, onMounted } from "vue";
import FormSubmit from "../components/FormSubmit.vue";
import IssueList from "../components/IssueList.vue";

// 配置标签页
const tabs = ref([
  { id: "submit", name: "提交建议" },
  { id: "list", name: "问题列表" },
]);

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

// 状态管理
const activeTab = ref("submit");
// MailView.vue（父组件）

const resolvedCount = computed(
  () => issues.value.filter((i) => i.status === "已解决").length
);
const pendingCount = computed(
  () => issues.value.filter((i) => i.status === "待定").length
);

// API 调用
const fetchIssues = async () => {
  const res = await userApi.getIssues();
  issues.value = res.data;
};

const handleViewIssue = (issue) => {
  router.push(`/mailbox/detail/${issue.id}`);
};

const handleReply = (issue) => {
  router.push(`/mailbox/reply/${issue.id}`);
};

// 事件处理
const switchTab = (tabId) => {
  activeTab.value = tabId;
};

// 成功提交提示
const showSuccess = () => {
  ElMessage.success("您的建议已提交，我们会尽快处理！");
};

// 初始化
onMounted(() => {
  fetchIssues();
});
</script>
  
  <style scoped>
.mailbox-container {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fb;
}

.footer {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}

.tab-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-switcher button {
  padding: 10px 20px;
  background: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-switcher button.active {
  background: #007bff;
  color: white;
}

.content-area {
  flex: 1;
  overflow: auto;
}

.stats span {
  margin: 0 10px;
  font-weight: bold;
}
</style>
  