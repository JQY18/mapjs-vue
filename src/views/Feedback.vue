<template>
  <div class="feedback-container">
    <div class="feedback-header">
      <h2>用户反馈</h2>
      <p>您的意见对我们非常重要，请在下方提交您的反馈。</p>
    </div>
    
    <div class="feedback-form">
      <el-form :model="formData" :rules="rules" ref="feedbackForm" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择反馈类型">
            <el-option label="功能建议" value="feature"></el-option>
            <el-option label="问题报告" value="bug"></el-option>
            <el-option label="体验反馈" value="experience"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="formData.content" 
            type="textarea" 
            :rows="5" 
            placeholder="请详细描述您的反馈内容...">
          </el-input>
        </el-form-item>
        
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="formData.contact" placeholder="可选填，便于我们与您联系"></el-input>
        </el-form-item>
        
        <el-form-item label="截图">
          <el-upload
            class="upload-demo"
            action="/api/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :limit="3"
            list-type="picture"
            :auto-upload="false"
            multiple
          >
            <el-button type="primary" @click.prevent>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交反馈</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-dialog v-model="dialogVisible" title="提交成功">
      <div class="success-message">
        <div class="status-icon">
          <i class="el-icon-success"></i>
        </div>
        <p>感谢您的反馈！我们已经收到您的意见，会尽快处理。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="goBack">返回首页</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'FeedbackView',
  setup() {
    const router = useRouter()
    const feedbackForm = ref(null)
    const dialogVisible = ref(false)
    
    const formData = reactive({
      type: '',
      title: '',
      content: '',
      contact: '',
      images: []
    })
    
    const rules = {
      type: [
        { required: true, message: '请选择反馈类型', trigger: 'change' }
      ],
      title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { min: 3, max: 50, message: '标题长度应在3到50个字符之间', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入反馈内容', trigger: 'blur' },
        { min: 10, max: 500, message: '内容长度应在10到500个字符之间', trigger: 'blur' }
      ]
    }
    
    const handleRemove = (file, fileList) => {
      console.log(file, fileList)
      // 从文件列表中移除
    }
    
    const handlePreview = (file) => {
      console.log(file)
      // 预览文件
    }
    
    const beforeUpload = (file) => {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt5M = file.size / 1024 / 1024 < 5
      
      if (!isJPGOrPNG) {
        ElMessage.error('只能上传JPG或PNG格式的图片!')
        return false
      }
      
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过5MB!')
        return false
      }
      
      // 将文件添加到表单数据中
      formData.images.push(file)
      return false // 阻止自动上传
    }
    
    const submitForm = () => {
      if (feedbackForm.value) {
        feedbackForm.value.validate((valid) => {
          if (valid) {
            // 模拟上传过程
            ElMessage.success('反馈提交成功！')
            dialogVisible.value = true
            // 在实际应用中这里将调用API提交数据
            console.log('提交的表单数据:', formData)
          } else {
            return false
          }
        })
      }
    }
    
    const resetForm = () => {
      if (feedbackForm.value) {
        feedbackForm.value.resetFields()
      }
    }
    
    const goBack = () => {
      router.push('/')
    }
    
    return {
      formData,
      rules,
      feedbackForm,
      dialogVisible,
      handleRemove,
      handlePreview,
      beforeUpload,
      submitForm,
      resetForm,
      goBack
    }
  }
}
</script>

<style scoped>
.feedback-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.feedback-header {
  text-align: center;
  margin-bottom: 30px;
}

.feedback-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.feedback-header p {
  color: #666;
  font-size: 14px;
}

.feedback-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 上传组件样式 */
.upload-demo :deep(.el-upload-list__item) {
  transition: all 0.3s;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.status-icon {
  margin-bottom: 20px;
}

.status-icon i {
  font-size: 48px;
  color: #67c23a;
}
</style>