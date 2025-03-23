<template>
  <div class="item-list">
    <div class="list-controls">
      <el-input
        v-model="searchQuery"
        placeholder="搜索物品"
        prefix-icon="el-icon-search"
        clearable
        class="search-input"
        @input="handleSearch"
      />
      
      <el-radio-group v-model="currentType" size="small" @change="handleTypeChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="lost">寻物</el-radio-button>
        <el-radio-button label="found">招领</el-radio-button>
      </el-radio-group>
      
      <el-select v-model="sortBy" placeholder="排序方式" size="small" @change="handleSort">
        <el-option label="最新发布" value="newest"></el-option>
        <el-option label="最早发布" value="oldest"></el-option>
      </el-select>
    </div>
    
    <el-empty v-if="displayItems.length === 0" description="暂无数据"></el-empty>
    
    <transition-group name="list" tag="div" class="items-container">
      <el-card v-for="item in displayItems" :key="item.id" class="item-card">
        <div class="item-card-content">
          <div class="item-image">
            <img v-if="item.image" :src="item.image" alt="物品图片" />
            <div v-else class="no-image">
              <i :class="getItemIcon(item.title)"></i>
            </div>
          </div>
          
          <div class="item-info">
            <div class="item-header">
              <h3 class="item-title">{{ item.title }}</h3>
              <el-tag :type="item.type === 'lost' ? 'danger' : 'success'" size="small">
                {{ item.type === 'lost' ? '寻物' : '招领' }}
              </el-tag>
            </div>
            
            <div class="item-details">
              <p class="item-location">
                <i class="el-icon-location-information"></i>
                {{ item.location }}
              </p>
              <p class="item-time">
                <i class="el-icon-time"></i>
                {{ formatTime(item.time) }}
              </p>
              <div class="item-keywords">
                <el-tag 
                  v-for="(keyword, index) in item.keywords" 
                  :key="index"
                  size="mini"
                  :type="item.type === 'lost' ? 'info' : 'success'"
                  effect="plain"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
            
            <div class="item-description">{{ truncateText(item.description, 100) }}</div>
            
            <div class="item-actions">
              <el-button type="text" @click="showDetail(item)">查看详情</el-button>
              <el-button type="text" @click="contactOwner(item)">
                联系{{ item.type === 'lost' ? '失主' : '拾主' }}
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </transition-group>
    
    <div class="pagination-container" v-if="totalItems > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>
    
    <el-dialog
      v-model="detailVisible"
      :title="currentItem ? (currentItem.type === 'lost' ? '丢失物品详情' : '拾取物品详情') : ''"
      width="75%"
    >
      <div v-if="currentItem" class="item-detail">
        <div class="item-detail-header">
          <h2>{{ currentItem.title }}</h2>
          <el-tag :type="currentItem.type === 'lost' ? 'danger' : 'success'">
            {{ currentItem.type === 'lost' ? '寻物启事' : '招领启事' }}
          </el-tag>
        </div>
        
        <div class="item-detail-content">
          <div class="item-detail-image" v-if="currentItem.image">
            <img :src="currentItem.image" alt="物品图片" />
          </div>
          
          <div class="item-detail-info">
            <p><strong>位置：</strong>{{ currentItem.location }}</p>
            <p><strong>时间：</strong>{{ formatTime(currentItem.time) }}</p>
            <p><strong>描述：</strong>{{ currentItem.description }}</p>
            
            <div class="item-detail-keywords">
              <strong>特征关键词：</strong>
              <div class="keyword-container">
                <el-tag 
                  v-for="(keyword, index) in currentItem.keywords" 
                  :key="index"
                  :type="currentItem.type === 'lost' ? 'info' : 'success'"
                  effect="dark"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <div class="item-detail-footer">
          <el-button type="primary" @click="contactOwner(currentItem)">
            联系{{ currentItem.type === 'lost' ? '失主' : '拾主' }}
          </el-button>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ItemList',
  props: {
    type: {
      type: String,
      default: 'all',
      validator: value => ['all', 'lost', 'found'].includes(value)
    }
  },
  data() {
    return {
      searchQuery: '',
      currentType: 'all',
      sortBy: 'newest',
      currentPage: 1,
      pageSize: 10,
      detailVisible: false,
      currentItem: null,
      // 模拟数据
      items: [
        {
          id: '1',
          title: '黑色水杯',
          type: 'lost',
          location: '图书馆3楼',
          time: new Date(Date.now() - 3600000 * 24 * 2),
          description: '一个黑色保温杯，有轻微擦痕，品牌是膳魔师，丢失在图书馆3楼自习室。',
          image: null,
          keywords: ['黑色水杯', '图书馆3楼', '保温杯', '膳魔师']
        },
        {
          id: '2',
          title: '蓝色钱包',
          type: 'found',
          location: '教学楼B区',
          time: new Date(Date.now() - 3600000 * 10),
          description: '一个蓝色钱包，内有少量现金和一张学生卡，拾到于教学楼B区二楼走廊。',
          image: null,
          keywords: ['蓝色钱包', '教学楼B区', '学生卡']
        },
        {
          id: '3',
          title: 'AirPods耳机',
          type: 'lost',
          location: '食堂二楼',
          time: new Date(Date.now() - 3600000 * 5),
          description: '白色AirPods耳机，充电盒上有一个小贴纸，丢失在食堂二楼用餐区域。',
          image: null,
          keywords: ['AirPods', '食堂二楼', '耳机', '苹果']
        },
        {
          id: '4',
          title: '学生证',
          type: 'found',
          location: '操场',
          time: new Date(Date.now() - 3600000 * 36),
          description: '一张学生证，姓名张某，学号2021XXXXX，拾到于田径场跑道旁。',
          image: null,
          keywords: ['学生证', '操场', '证件']
        }
      ]
    };
  },
  computed: {
    filteredItems() {
      let result = [...this.items];
      
      // 根据类型筛选
      if (this.currentType !== 'all') {
        result = result.filter(item => item.type === this.currentType);
      }
      
      // 根据搜索关键词筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(query))
        );
      }
      
      // 排序
      if (this.sortBy === 'newest') {
        result.sort((a, b) => new Date(b.time) - new Date(a.time));
      } else {
        result.sort((a, b) => new Date(a.time) - new Date(b.time));
      }
      
      return result;
    },
    
    displayItems() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredItems.slice(start, end);
    },
    
    totalItems() {
      return this.filteredItems.length;
    }
  },
  watch: {
    type: {
      immediate: true,
      handler(val) {
        this.currentType = val;
      }
    }
  },
  methods: {
    formatTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    },
    
    getItemIcon(title) {
      if (title.includes('手机') || title.includes('电话')) return 'el-icon-mobile-phone';
      if (title.includes('钱包') || title.includes('卡包')) return 'el-icon-wallet';
      if (title.includes('书') || title.includes('笔记')) return 'el-icon-notebook-1';
      if (title.includes('钥匙')) return 'el-icon-key';
      if (title.includes('证')) return 'el-icon-document';
      return 'el-icon-goods';
    },
    
    handleSearch() {
      this.currentPage = 1;
    },
    
    handleTypeChange() {
      this.currentPage = 1;
    },
    
    handleSort() {
      this.currentPage = 1;
    },
    
    handlePageChange(page) {
      this.currentPage = page;
    },
    
    showDetail(item) {
      this.currentItem = item;
      this.detailVisible = true;
    },
    
    contactOwner(item) {
      this.$message.success(`已发送联系请求给${item.type === 'lost' ? '失主' : '拾主'}`);
      // 实际项目中应该调用联系API
    },
    
    // 加载数据方法（实际项目中应该调用API）
    async loadItems() {
      // 模拟API请求
      // const { data } = await this.$api.lostFound.getItems({
      //   type: this.currentType,
      //   sortBy: this.sortBy,
      //   page: this.currentPage,
      //   pageSize: this.pageSize,
      //   search: this.searchQuery
      // });
      // this.items = data.items;
      // this.totalItems = data.total;
    }
  }
};
</script>

<style scoped>
.item-list {
  padding: 20px 0;
}

.list-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  max-width: 300px;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.item-card-content {
  display: flex;
  gap: 15px;
}

.item-image {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image i {
  font-size: 36px;
  color: #909399;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.item-title {
  margin: 0;
  font-size: 18px;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.item-location, .item-time {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}

.item-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.keyword-tag {
  margin-right: 5px;
}

.item-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
  line-height: 1.5;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  gap: 15px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.item-detail {
  padding: 20px;
}

.item-detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.item-detail-header h2 {
  margin: 0;
}

.item-detail-content {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.item-detail-image {
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.item-detail-image img {
  width: 100%;
  height: auto;
}

.item-detail-info {
  flex: 1;
}

.item-detail-info p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.item-detail-keywords {
  margin-top: 15px;
}

.keyword-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.item-detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@media (max-width: 768px) {
  .item-card-content {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 150px;
  }
  
  .item-detail-content {
    flex-direction: column;
  }
  
  .item-detail-image {
    max-width: 100%;
  }
}
</style> 