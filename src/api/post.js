import request from './request'

export const postApi = {
  // 获取帖子列表
  getPosts() {
    const user = JSON.parse(localStorage.getItem('user')) || {}
    return request.get('/post/all', {
      params: {
        currentUserId: user.id
      }
    })
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
      url: '/post/addPost',
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
    const user = JSON.parse(localStorage.getItem('user'))
    return request.post(`/post/${postId}/like/${user.id}`)
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     likes: number
    //   }
    // }
  },
  // 获取评论
  getComments(postId, userId) {
    return request.get(`/comments/${postId}`, {
      params: {
        userId: userId
      }
    })
  },

  //data:{content:string,replyTo:number || null}
  //添加评论
  addComment(postId, userId,content) {
    return request.post("/comments/add", {
      postId: postId,
      commenterId: userId,
      content: content
    })
  },

  // 取消点赞帖子
  unlikePost(postId) {
    const user = JSON.parse(localStorage.getItem('user'))
    return request.delete(`/post/${postId}/like/${user.id}`)
    // 返回格式同 likePost
  },

  // 收藏帖子
  collectPost(postId) {
    return request.post(`/post/${postId}/collect`)
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
    return request.post(`/post/${postId}/collect`)
    // 返回格式同 collectPost
  },

  // 点赞评论
  // 取消点赞评论
  likeComment(commentId,to,isLiked) {
    return request.post("/comments/like",{
      commentId: commentId,
      likerId: JSON.parse(localStorage.getItem('user')).id,
      to: to,
      isLiked: isLiked?1:0
    })
    // 返回格式：
    // {
    //   code: 1,
    //   msg: "success",
    //   data: {
    //     likes: number
    //   }
    // }
  },

}