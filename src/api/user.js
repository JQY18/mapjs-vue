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
    // 请求体：{ nickname: string, username: string, password: string }
    // 返回：{ code: 1, msg: "success", data: null }
  },

  // 获取当前登录用户信息
  getCurrentUserInfo() {
    return request.get('/api/user/current')
  },

  // 获取当前登录用户的动态列表
  getCurrentUserPosts() {
    return request.get('/api/user/current/posts')
  },

  // 获取当前登录用户的收藏列表
  getCurrentUserCollections() {
    return request.get('/api/user/current/collections')
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
    return request.get(`/user/info?postUserId=${userId}`)
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
  }
} 