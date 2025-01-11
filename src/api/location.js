import request from './request'

export const locationApi = {
  // 获取所有地点
  getLocations() {
    return request.get('/locations')
  },

  // 添加地点
  addLocation(data) {
    return request.post('/locations/add', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 更新地点
  updateLocation(data) {
    return request.post(`/locations/update`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除地点
  deleteLocation(id) {
    return request.delete(`/locations/delete/${id}`)
  }
} 