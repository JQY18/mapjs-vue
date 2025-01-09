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

  // 发布帖子
  createPost(formData) {
    return request({
      url: '/post/create',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     id: number,
    //     userId: number,
    //     content: string,
    //     images: string[],
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