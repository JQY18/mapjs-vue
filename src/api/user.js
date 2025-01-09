import request from './request'

export const userApi = {
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
  }
} 