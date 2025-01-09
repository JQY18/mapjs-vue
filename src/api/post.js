import request from './request'

export const postApi = {
  // 获取帖子列表
  getPosts() {
    return request.get('/post/all')
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: [{
    //     id: number,
    //     userId: number,
    //     category: number,
    //     title: string,
    //     content: string,
    //     images: string[],
    //     createTime: string
    //   }]
    // }
  },

  // 获取帖子评论
  getComments(postId, userId) {
    return request.get(`/comments/${postId}?userId=${userId}`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: [{
    //     id: number,
    //     postId: number,
    //     commenterId: number,
    //     commenterNickname: string,
    //     commenterAvatar: string,
    //     content: string,
    //     like: number,
    //     createTime: string,
    //     reply: [{
    //       id: number,
    //       fatherId: number,
    //       commenterId: number,
    //       commenterNickname: string,
    //       commenterAvatar: string,
    //       content: string,
    //       replierId: number,
    //       replierNickname: string,
    //       replierAvatar: string,
    //       createTime: string
    //     }],
    //     isLiked: boolean
    //   }]
    // }
  },

  // 发表评论
  addComment(postId, data) {
    return request.post(`/api/post/${postId}/comment`, data)
    // 请求参数：
    // {
    //   content: string,
    //   replyTo?: number  // 回复某条评论时需要
    // }
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     id: number,
    //     content: string,
    //     createTime: string
    //   }
    // }
  },

  // 点赞帖子
  likePost(postId) {
    return request.post(`/api/post/${postId}/like`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     likes: number
    //   }
    // }
  },

  // 取消点赞帖子
  unlikePost(postId) {
    return request.delete(`/api/post/${postId}/like`)
    // 返回格式同 likePost
  },

  // 收藏帖子
  collectPost(postId) {
    return request.post(`/api/post/${postId}/collect`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     collected: boolean
    //   }
    // }
  },

  // 取消收藏帖子
  uncollectPost(postId) {
    return request.delete(`/api/post/${postId}/collect`)
    // 返回格式同 collectPost
  },

  // 点赞评论
  likeComment(commentId) {
    return request.post(`/api/comment/${commentId}/like`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     likes: number
    //   }
    // }
  },

  // 取消点赞评论
  unlikeComment(commentId) {
    return request.delete(`/api/comment/${commentId}/like`)
    // 返回格式同 likeComment
  }
} 