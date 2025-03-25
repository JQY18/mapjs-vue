<template>
    <form class="submit-form">
      <el-form :model="form" label-width="120px" ref = "formRef" :rules="rules">
        <el-form-item label="问题标题" prop="title">
          <el-input v-model="form.title" required />
        </el-form-item>
        <el-form-item label="详细描述" prop="content">
          <el-input type="textarea" :rows="4" v-model="form.content" required />
        </el-form-item>
  
        <el-form-item label="附件上传" prop="files">
          <el-upload
            limit="3"
            action="/api/upload"
            :on-preview="handlePreview"
            :on-success="handleUpload"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :auto-upload="false"
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
  
  const cleanForm = () => {
    form.value.title = '';
    form.value.content = '';
    form.value.file = null;
  };
  
  
  
  
  const rules = ref({
    title: [
      { required: true, message: '请输入问题标题', trigger: 'blur' },
    ],
    content: [
      { required: true, message: '请输入详细描述', trigger: 'blur' },
    ],
    file: [
      { required: true, message: '请上传附件', trigger: 'blur' },
    ],
  });
  
  
  
  
  const handleSubmit = () => {
    if (!form.value.title || !form.value.content) {
      ElMessage.error('请填写完整信息');
      return;
    }
    else {
      ElMessage.success('提交成功,请等待管理员审核');
      cleanForm();
      }
    }
  
  
  const handleUpload = (res) => {
    form.value.file = res.data;
  };
  </script>
  