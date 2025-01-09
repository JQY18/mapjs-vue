<LocationModal
  v-if="showLocationModal"
  :show="showLocationModal"
  :location="selectedLocation"
  @close="showLocationModal = false"
  @plan-route="handlePlanRoute"
  @set-start="handleSetStart"
  @set-end="handleSetEnd"
/>

<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: Boolean,
  location: Object
})

const emit = defineEmits(['close', 'plan-route', 'set-start', 'set-end'])

const router = useRouter()

const goToDetail = () => {
  if (props.location?.detailId) {
    router.push(`/location/${props.location.detailId}`)
  }
}

const planRoute = () => {
  emit('plan-route')
}

const handleSetStart = (location) => {
  showLocationModal.value = false
  showRoutePanel.value = true
  selectedStart.value = location
  startPoint.value = location.name
  selectedEnd.value = null
  endPoint.value = ''
  clearRoute()
}

const handleSetEnd = (location) => {
  showLocationModal.value = false
  showRoutePanel.value = true
  selectedEnd.value = location
  endPoint.value = location.name
  if (!selectedStart.value) {
    selectedStart.value = null
    startPoint.value = ''
  }
  clearRoute()
}

const handlePlanRoute = () => {
  if (selectedLocation.value) {
    showLocationModal.value = false
    showRoutePanel.value = true
    selectedEnd.value = selectedLocation.value
    endPoint.value = selectedLocation.value.name
    if (!selectedStart.value) {
      selectedStart.value = null
      startPoint.value = ''
    }
    clearRoute()
  }
}
</script>

<style scoped>
/* 保留原有样式 */

/* 添加新的路线按钮组样式 */
.route-action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.start-button,
.end-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
}

.start-button {
  background: #e6f4ff;
  color: #1890ff;
}

.start-button:hover {
  background: #bae0ff;
}

.end-button {
  background: #f6ffed;
  color: #52c41a;
}

.end-button:hover {
  background: #d9f7be;
}

.button-icon {
  font-size: 18px;
}
</style> 