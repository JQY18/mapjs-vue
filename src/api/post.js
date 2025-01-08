import request from './request'

export const postApi = {
  // 获取帖子列表
  getPosts() {
    return request.get('/api/posts')
  },

  // 发布帖子
  createPost(data) {
    return request.post('/api/posts', data)
  },

  // 点赞帖子
  likePost(postId) {
    return request.post(`/api/posts/${postId}/like`)
  },

  // 取消点赞
  unlikePost(postId) {
    return request.delete(`/api/posts/${postId}/like`)
  },

  // 收藏帖子
  collectPost(postId) {
    return request.post(`/api/posts/${postId}/collect`)
  },

  // 取消收藏
  uncollectPost(postId) {
    return request.delete(`/api/posts/${postId}/collect`)
  },

  // 获取帖子评论
  getComments(postId, params) {
    return request.get(`/api/posts/${postId}/comments`, { params })
  },

  // 发表评论
  addComment(postId, data) {
    return request.post(`/api/posts/${postId}/comments`, data)
  },

  // 点赞评论
  likeComment(commentId) {
    return request.post(`/api/comments/${commentId}/like`)
  },

  // 取消点赞评论
  unlikeComment(commentId) {
    return request.delete(`/api/comments/${commentId}/like`)
  }
} 