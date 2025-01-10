import request from './request'

export const adminApi = {
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
  }
} 