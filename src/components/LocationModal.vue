<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>
      
      <div class="location-image" @click="goToDetail">
        <img :src="location?.image" :alt="location?.name" />
        <div class="image-overlay">点击查看详情</div>
      </div>
      
      <div class="location-info">
        <h2>{{ location?.name }}</h2>
        <p>{{ location?.description }}</p>
      </div>
      
      <div class="action-buttons">
        <button class="detail-button" @click="goToDetail">
          查看详细信息
        </button>
        <button class="route-button" @click="planRoute">
          规划路线
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: Boolean,
  location: Object
})

const emit = defineEmits(['close', 'plan-route'])

const router = useRouter()

const goToDetail = () => {
  if (props.location?.detailId) {
    router.push(`/location/${props.location.detailId}`)
  }
}

const planRoute = () => {
  emit('plan-route')
}
</script>

<script>
export default {
  name: 'LocationModal'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
  position: relative;
}

.close-button {
  position: absolute;
  right: 12px;
  top: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
}

.location-image {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
}

.location-image img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.location-image:hover .image-overlay {
  transform: translateY(0);
}

.location-info {
  margin: 20px 0;
}

.location-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.location-info p {
  margin: 0;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.detail-button {
  background: #3388ff;
  color: white;
}

.route-button {
  background: #4CAF50;
  color: white;
}
</style> 