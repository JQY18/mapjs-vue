// 定义位置对象的结构
export const createLocation = (data) => {
  return {
    name: data.name || '',
    coords: data.coords || [0, 0],
    description: data.description || '',
    image: data.image || '',
    images: data.images || [],
    videos: data.videos || [],
    detailId: data.detailId || '',
    category: data.category || '教学科研'
  }
}

// 定义详情对象的结构
export const createDetail = (data) => {
  return {
    name: data.name || '',
    description: data.description || '',
    images: data.images || [],
    videos: data.videos || []
  }
}

// 定义评论对象的结构
export const createComment = (data) => {
  return {
    id: data.id || '',
    username: data.username || '',
    content: data.content || '',
    time: data.time || ''
  }
}

// 导出工厂函数用于创建对象实例
export const LocationFactory = {
  createLocation,
  createDetail,
  createComment
} 