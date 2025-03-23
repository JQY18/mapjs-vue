<template>
  <div class="lost-item-form">
    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef" 
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="物品名称" prop="title">
        <el-input 
          v-model="formData.title" 
          placeholder="请简要描述物品，如'黑色水杯'"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="丢失位置" prop="location">
        <el-input 
          v-model="formData.location" 
          placeholder="请填写丢失地点，如'图书馆3楼'"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="丢失时间" prop="lostTime">
        <el-date-picker
          v-model="formData.lostTime"
          type="datetime"
          placeholder="选择大致丢失时间"
          format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
      
      <el-form-item label="详细描述" prop="description">
        <el-input
          type="textarea"
          v-model="formData.description"
          :rows="4"
          placeholder="请尽可能详细描述物品特征，如颜色、大小、品牌、特殊标记等"
        />
      </el-form-item>
      
      <el-form-item label="图片" prop="images">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :limit="3"
          :file-list="imageList"
          :on-change="handleImageChange"
          :on-remove="handleImageRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <div class="el-upload__tip">上传物品照片可以提高匹配准确率</div>
      </el-form-item>
      
      <el-form-item label="联系方式" prop="contact">
        <el-input 
          v-model="formData.contact" 
          placeholder="请填写您的联系方式，如手机号或邮箱"
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          提交信息
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="keywords-section" v-if="showKeywords">
      <h4>关键词提取</h4>
      <div class="keywords-container">
        <el-tag 
          v-for="(keyword, index) in extractedKeywords" 
          :key="index"
          effect="dark"
          class="keyword-tag"
        >
          {{ keyword }}
        </el-tag>
      </div>
      <div class="keywords-explanation">
        <p>我们使用NLP技术提取关键信息，这将帮助我们更准确地匹配物品。</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LostItemForm',
  data() {
    return {
      formData: {
        title: '',
        location: '',
        lostTime: '',
        description: '',
        contact: '',
        type: 'lost'
      },
      rules: {
        title: [
          { required: true, message: '请输入物品名称', trigger: 'blur' },
          { min: 2, max: 20, message: '名称长度在2到20个字符之间', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入丢失位置', trigger: 'blur' }
        ],
        lostTime: [
          { required: true, message: '请选择丢失时间', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入详细描述', trigger: 'blur' },
          { min: 10, max: 200, message: '描述长度应在10-200字符之间', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { 
            pattern: /(^1[3-9]\d{9}$)|(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)/,
            message: '请输入有效的手机号或邮箱',
            trigger: 'blur'
          }
        ]
      },
      imageList: [],
      submitting: false,
      showKeywords: false,
      extractedKeywords: []
    }
  },
  methods: {
    handleImageChange(file, fileList) {
      this.imageList = fileList.slice(-3);
    },
    
    handleImageRemove(file, fileList) {
      this.imageList = fileList;
    },
    
    async submitForm() {
      try {
        this.submitting = true;
        await this.$refs.formRef.validate();
        
        // 使用NLP提取关键词
        this.extractKeywords();
        
        const formData = {
          ...this.formData,
          images: this.imageList.map(img => img.raw),
          keywords: this.extractedKeywords
        };
        
        // 提交表单数据
        this.$emit('item-submitted', formData);
      } catch (error) {
        console.error(error);
      } finally {
        this.submitting = false;
      }
    },
    
    resetForm() {
      this.$refs.formRef.resetFields();
      this.imageList = [];
      this.showKeywords = false;
      this.extractedKeywords = [];
    },
    
    extractKeywords() {
      // 模拟NLP提取关键词，实际应该调用后端API
      const { title, location, description } = this.formData;
      
      // 简单提取
      this.extractedKeywords = [
        title,
        location,
        ...description.split(/\s+/).filter(word => word.length > 1).slice(0, 3)
      ];
      
      // 特征识别（模拟）
      if (title.includes('手机')) this.extractedKeywords.push('电子设备');
      if (title.includes('水杯')) this.extractedKeywords.push('日用品');
      if (location.includes('图书馆')) this.extractedKeywords.push('学习区域');
      
      // 显示提取结果
      this.showKeywords = true;
    },
    
    handleSubmit() {
      this.submitForm();
    }
  }
}
</script>

<style scoped>
.lost-item-form {
  padding: 20px 0;
}

.keywords-section {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  animation: fadeIn 0.6s;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.keyword-tag {
  font-size: 14px;
}

.keywords-explanation {
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 