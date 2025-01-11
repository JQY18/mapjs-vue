<template>
  <div v-if="show" class="modal-wrapper">
    <div class="modal-overlay" @click="handleClose"></div>
    <div class="modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button class="btn" @click="handleClose">取消</button>
          <button class="btn primary" @click="$emit('confirm')">确定</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['update:show', 'confirm'])

const handleClose = () => {
  emit('update:show', false)
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: relative;
  background: white;
  border-radius: 8px;
  min-width: 400px;
  max-width: 90%;
  z-index: 1001;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:hover {
  opacity: 0.8;
}

.btn.primary {
  background: #4CAF50;
  color: white;
}
</style> 