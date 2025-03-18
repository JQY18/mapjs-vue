<template>
    <form class="submit-form">
      <el-form :model="form" label-width="120px">
        <el-form-item label="问题标题">
          <el-input v-model="form.title" required />
        </el-form-item>
        <el-form-item label="详细描述">
          <el-textarea v-model="form.content" rows="4" required />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            action="/api/upload"
            :on-success="handleUpload"
          >
            <el-button type="primary">上传文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  
  const form = ref({
    title: '',
    content: '',
    file: null
  });
  
  const handleSubmit = async () => {
    try {
      await userApi.submitSuggestion(form.value);
      ElMessage.success('提交成功！');
      form.value = { title: '', content: '', file: null };
    } catch (error) {
      ElMessage.error('提交失败，请重试');
    }
  };
  
  const handleUpload = (res) => {
    form.value.file = res.data;
  };
  </script>