<template>
  <div v-if="show" class="preview-wrapper">
    <div class="preview-overlay" @click="handleClose"></div>
    <div class="preview-content">
      <img :src="imageUrl" alt="预览图片">
      <button class="close-btn" @click="handleClose">&times;</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  imageUrl: String
})

const emit = defineEmits(['update:show'])

const handleClose = () => {
  emit('update:show', false)
}
</script>

<style scoped>
.preview-wrapper {
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

.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  z-index: 2001;
}

.preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  border: none;
  background: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  padding: 8px;
}

.close-btn:hover {
  opacity: 0.8;
}
</style> 