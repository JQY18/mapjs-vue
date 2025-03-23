<template>
  <div class="lost-found-container">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>失物招领</el-breadcrumb-item>
    </el-breadcrumb>

    <h4 class="page-title">
      <i class="el-icon-search"></i>
      失物招领中心
    </h4>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="我丢失了物品" name="lost">
        <LostItemForm @item-submitted="handleItemSubmitted" />
      </el-tab-pane>
      <el-tab-pane label="我捡到了物品" name="found">
        <FoundItemForm @item-submitted="handleItemSubmitted" />
      </el-tab-pane>
      <el-tab-pane label="物品列表" name="list">
        <ItemList :type="listType" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="matchDialogVisible"
      title="找到可能相符的物品"
      width="75%"
    >
      <div v-if="matchedItems.length > 0">
        <h4>我们发现以下可能符合的物品：</h4>
        <el-card v-for="(item, index) in matchedItems" :key="index" class="match-card">
          <div class="match-header">
            <span>{{ item.title }}</span>
            <el-tag>{{ item.location }}</el-tag>
            <el-tag type="success">相似度: {{ item.similarity }}%</el-tag>
          </div>
          <div class="match-content">{{ item.description }}</div>
          <div class="match-footer">
            <el-button type="primary" size="small" @click="contactOwner(item)">
              联系{{ item.type === 'lost' ? '失主' : '拾主' }}
            </el-button>
          </div>
        </el-card>
      </div>
      <div v-else class="no-match">
        <el-empty description="暂无匹配物品" />
        <p>别担心，我们会记录您的信息。当有匹配时会通知您。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LostItemForm from '../components/lost-found/LostItemForm.vue';
import FoundItemForm from '../components/lost-found/FoundItemForm.vue';
import ItemList from '../components/lost-found/ItemList.vue';

export default {
  name: 'LostFound',
  components: {
    LostItemForm,
    FoundItemForm,
    ItemList
  },
  data() {
    return {
      activeTab: 'lost',
      matchDialogVisible: false,
      matchedItems: [],
      listType: 'all'
    };
  },
  watch: {
    activeTab(val) {
      if (val === 'list') {
        this.listType = 'all';
      }
    }
  },
  methods: {
    async handleItemSubmitted(itemData) {
      try {
        // 这里模拟调用AI匹配服务
        const matchedItems = await this.findMatchingItems(itemData);
        
        this.matchedItems = matchedItems;
        this.matchDialogVisible = true;
        
        // 保存物品信息到数据库
        // await this.$api.lostFound.saveItem(itemData);
        
        if (matchedItems.length === 0) {
          this.$message.success('信息已记录，我们会持续为您匹配');
        }
      } catch (error) {
        this.$message.error('提交失败：' + error.message);
      }
    },
    
    async findMatchingItems(itemData) {
      // 模拟AI匹配过程，实际项目中应该调用后端API
      return new Promise(resolve => {
        setTimeout(() => {
          // 模拟数据
          if (Math.random() > 0.5) {
            resolve([
              {
                id: '1',
                title: '黑色水杯',
                location: '图书馆3楼',
                description: '一个黑色保温杯，有轻微擦痕',
                type: itemData.type === 'lost' ? 'found' : 'lost',
                similarity: 89
              }
            ]);
          } else {
            resolve([]);
          }
        }, 1000);
      });
    },
    
    contactOwner(item) {
      // 实际项目中应该调用联系人API
      this.$message.success(`已发送联系请求给${item.type === 'lost' ? '失主' : '拾主'}`);
      this.matchDialogVisible = false;
    }
  }
};
</script>

<style scoped>
.lost-found-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  padding-bottom: 100px;
  margin-bottom: 100px  ;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 40px);
  max-height: 25vh;
  overflow-y: auto;
  position: relative;
}

.breadcrumb {
  margin-bottom: 25px;
}

.page-title {
  text-align: center;
  margin-bottom: 35px;
  color: #2c3e50;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: fadeInUp 0.6s;
}

.main-tabs {
  margin-bottom: 120px;
}

.match-card {
  margin-bottom: 15px;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

.match-content {
  color: #606266;
  margin-bottom: 15px;
}

.match-footer {
  text-align: right;
}

.no-match {
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .lost-found-container {
    margin: 10px;
    padding: 20px;
    padding-bottom: 80px;
    max-width: calc(100% - 20px);
  }

  .page-title {
    font-size: 20px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 