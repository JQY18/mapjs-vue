<template>
    <div class="mailbox-container">
      <!-- 头部信息 -->
      <header class="header">
        <div class="logo-box">
          <img src="/images/logo.png" alt="湖南师大" class="logo">
          <h1>校园信箱</h1>
        </div>
      </header>
  
      <!-- 导航路径 -->
      <nav class="breadcrumb">
        <span>首页 > 信箱 > {{ activeTab }}</span>
      </nav>
  
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
  
        <!-- 管理后台（校方） -->
        <template v-else-if="activeTab === 'manage'">
          <admin-panel 
            :pending-issues="pendingIssues" 
            @resolve="handleResolve"
          />
        </template>
      </main>
  
      <!-- 底部统计 -->
      <footer class="footer">
        <div class="stats">
          <span>已解决问题：{{ resolvedCount }}</span> |
          <span>待处理问题：{{ pendingCount }}</span>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import FormSubmit from '../components/FormSubmit.vue';
  import IssueList from '../components/IssueList.vue';
  import AdminPanel from '../components/AdminPanel.vue';
  
  // 配置标签页
  const tabs = ref([
    { id: 'submit', name: '提交建议' },
    { id: 'list', name: '问题列表' },
    { id: 'manage', name: '管理后台' }
  ]);
  
  // 状态管理
  const activeTab = ref('submit');
  const issues = ref([]);
  const pendingIssues = ref([]);
  const resolvedCount = computed(() => 
    issues.value.filter(i => i.status === 'resolved').length
  );
  const pendingCount = computed(() => 
    issues.value.filter(i => i.status === 'pending').length
  );
  
  // API 调用
  const fetchIssues = async () => {
    const res = await userApi.getIssues();
    issues.value = res.data;
    pendingIssues.value = issues.value.filter(i => i.status === 'pending');
  };
  
  const handleViewIssue = (issue) => {
    router.push(`/mailbox/detail/${issue.id}`);
  };
  
  const handleReply = (issue) => {
    router.push(`/mailbox/reply/${issue.id}`);
  };
  
  const handleResolve = (issueId) => {
    userApi.resolveIssue(issueId);
    fetchIssues(); // 刷新列表
  };
  
  // 事件处理
  const switchTab = (tabId) => {
    activeTab.value = tabId;
    if (tabId === 'manage' && !isAdmin) {
      router.push('/mailbox');
    }
  };
  
  // 成功提交提示
  const showSuccess = () => {
    ElMessage.success('您的建议已提交，我们会尽快处理！');
  };
  
  // 初始化
  onMounted(() => {
    fetchIssues();
    isAdmin.value = localStorage.getItem('admin_token'); // 简单权限验证
  });
  </script>
  
  <style scoped>
  .mailbox-container {
    min-height: 100vh;
    padding: 20px;
    background: #f5f7fb;
  }
  
  .header {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #990000;
    color: white;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .logo-box {
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  
  .logo {
    height: 40px;
    width: auto;
  }
  
  .breadcrumb {
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
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
  
  .footer {
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    text-align: center;
    margin-top: 20px;
  }
  
  .stats span {
    margin: 0 10px;
    font-weight: bold;
  }
  </style>