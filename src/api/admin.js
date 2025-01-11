import request from './request'

export const adminApi = {
  // 登录相关
  login(data) {
    return request({
      url: '/admin/login',
      method: 'post',
      data
    })
  },
  
  logout() {
    return request({
      url: '/admin/logout',
      method: 'post'
    })
  },
  
  // 获取管理员信息
  getInfo() {
    return request({
      url: '/admin/info',
      method: 'get'
    })
  },
  
  // 管理员管理
  getAdminList() {
    return request({
      url: '/admin/list',
      method: 'get'
    })
  },
  
  createAdmin(data) {
    return request({
      url: '/admin/create',
      method: 'post',
      data
    })
  },
  
  updateAdmin(data) {
    return request({
      url: `/admin/update/${data.id}`,
      method: 'put',
      data
    })
  },
  
  deleteAdmin(id) {
    return request({
      url: `/admin/delete/${id}`,
      method: 'delete'
    })
  },
  
  // 场所相关
  getLocationInfo(id) {
    return request({
      url: `/location/info/${id}`,
      method: 'get'
    })
  },
  
  getLocationList() {
    return request({
      url: '/location/list',
      method: 'get'
    })
  }
} 