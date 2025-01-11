<template>
  <div v-if="modelValue" class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
      
      <div class="dialog-body">
        <slot></slot>
      </div>
      
      <div class="dialog-footer">
        <slot name="footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="$emit('confirm')">确定</el-button>
        </slot>
      </div>
    </div>
    <div class="dialog-mask" @click="handleOverlayClick"></div>
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}
</script>

<style scoped lang="scss">
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
  }

  .close-icon {
    cursor: pointer;
    font-size: 20px;
    color: #909399;
    
    &:hover {
      color: #409eff;
    }
  }
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 