<template>
  <div v-if="show" class="dialog-overlay" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <span class="image-counter" v-if="images.length > 1">
          {{ currentIndex + 1 }}/{{ images.length }}
        </span>
        <button class="close-btn" @click="handleClose">
          <Icon icon="mdi:close" />
        </button>
      </div>
      
      <div class="image-container">
        <button 
          v-if="images.length > 1" 
          class="nav-btn prev"
          @click="() => changeImage('prev')"
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        
        <div class="image-wrapper">
          <img 
            :src="images[currentIndex]" 
            :alt="`Image ${currentIndex + 1}`"
          />
        </div>
        
        <button 
          v-if="images.length > 1" 
          class="nav-btn next"
          @click="() => changeImage('next')"
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <div v-if="images.length > 1" class="thumbnails">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        >
          <img :src="image" :alt="`Thumbnail ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageDialog'
}
</script>

<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: Boolean,
  images: Array,
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:show', 'close'])

const currentIndex = ref(props.initialIndex)

watch(() => props.show, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex || 0
  }
})

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const changeImage = (direction) => {
  if (direction === 'next') {
    currentIndex.value = currentIndex.value === props.images.length - 1 
      ? 0  // 如果是最后一张，则切换到第一张
      : currentIndex.value + 1
  } else {
    currentIndex.value = currentIndex.value === 0 
      ? props.images.length - 1  // 如果是第一张，则切换到最后一张
      : currentIndex.value - 1
  }
}

const closeDialog = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.image-counter {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  transform: scale(1.1);
  color: #333;
}

.image-container {
  width: 60vw;
  height: 60vh;
  max-width: 800px;
  max-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 20px;
  background: #f8f8f8;
}

.image-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  transition: transform 0.3s ease;
  animation: fadeIn 0.3s ease;
}

.nav-btn {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 28px;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.nav-btn.prev {
  left: 24px;
}

.nav-btn.next {
  right: 24px;
}

.thumbnails {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  overflow-x: auto;
  border-top: 1px solid #eee;
  position: relative;
  z-index: 1;
}

.thumbnail {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail.active {
  opacity: 1;
  border-color: #1890ff;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.thumbnails::-webkit-scrollbar {
  height: 6px;
}

.thumbnails::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.thumbnails::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style> 