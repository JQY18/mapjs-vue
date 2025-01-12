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
  },
  // 获取地点详细信息
  getLocationDetail(detailId) {
    return request.get(`/locations/detail/${detailId}`)
  },
  updateLocationDetail(formData){
    return request.post(`/locationDetails/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadLocationDetailImages(formData){
    return request.post(`/locationDetails/images/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  deleteDetailImage(formData){
    return request.post(`/locationDetails/images/delete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadLocationDetailVideos(formData){
    return request.post(`/locationDetails/videos/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  deleteDetailVideo(formData){
    return request.post(`/locationDetails/videos/delete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

} 