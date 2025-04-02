import request from './request'

export const userApi = {
  // 用户登录
  login(data) {
    return request.post('/user/login', data)
    // 请求体：{ username: string, password: string }
    // 返回：{ code: 1, msg: "success", data: null }
  },

  // 用户注册
  register(data) {
    return request.post('/user/register', data)
    // 请求体：{ nickname: string, username: string, password: string, email: string, code: string }
    // 返回：{ code: 1, msg: "success", data: null }
  },

  // 发送邮箱验证码
  sendEmailCode(email) {
    return request.post('/user/email/code', {
      email
    })
    // 请求体：{ email: string }
    // 返回：{ code: 1, msg: "success", data: null }
  },

  // 使用邮箱验证码注册
  registerWithEmail(data) {
    return request.post('/user/register/email', data)
    // 请求体：{ nickname: string, username: string, password: string, email: string, code: string }
    // 返回：{ code: 1, msg: "success", data: null }
  },

  // 获取当前登录用户信息
  getCurrentUserInfo() {
    return request.get('/api/user/current')
  },

  // 获取当前登录用户的动态列表
  getCurrentUserPosts(userId) {
    // const user = JSON.parse(localStorage.getItem('user'))
    return request.get('/post/all', {
      params: {
        userId: userId
      }
    })
  },

  // 获取当前登录用户的收藏列表
  getCurrentUserCollections(userId) {
    // const user = JSON.parse(localStorage.getItem('user'))
    return request.get('/post/current/collections', {
      params: {
        userId: userId
      }
    })
  },

  // 获取当前登录用户的粉丝列表
  getCurrentUserFollowers() {
    return request.get('/api/user/current/followers')
  },

  // 获取当前登录用户的关注列表
  getCurrentUserFollowing() {
    return request.get('/api/user/current/following')
  },

  // 关注用户
  followUser(userId) {
    return request.post(`/api/user/${userId}/follow`)
  },

  // 取消关注
  unfollowUser(userId) {
    return request.delete(`/api/user/${userId}/follow`)
  },

  // 获取用户信息
  getUserInfo(userId) {
    if (userId === undefined || userId === null) {
      const user = JSON.parse(localStorage.getItem('user'))
      return request.get(`/user/info?userId=${user.id}`)
    }
    return request.get(`/user/info?userId=${userId}`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     id: number,
    //     username: string,
    //     nickname: string,
    //     gender: string,
    //     age: number,
    //     avatar: string,
    //     school: string
    //   }
    // }
  },

  // 退出登录
  logout() {
    // 清除本地存储的用户信息
    localStorage.removeItem('user')
    // 可以添加退出登录的接口请求，如果后端需要
    // return request.post('/user/logout')
  },

  // 更新用户信息
  updateUserInfo(formData) {
    return request({
      url: '/user/update',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // 请求体：FormData 包含以下字段
    // - avatar: File (可选)
    // - nickname: string
    // - gender: string
    // - age: number
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     id: number,
    //     username: string,
    //     nickname: string,
    //     gender: string,
    //     age: number,
    //     avatar: string
    //   }
    // }
  }
}