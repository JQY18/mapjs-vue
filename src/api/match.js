import request from '@/api/request'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 创建SSE连接的函数
export const createMatchEventSource = (userId, interestId, limited) => {
  return new EventSource(`http://${API_BASE_URL}/api/match/realtime/events/${userId}?interestId=${interestId}&limited=${limited}`)
}

const matchApi = {
  // 获取所有兴趣标签
  getInterests() {
    return request({
      url: '/match/interests',
      method: 'get'
    })
  },

  // 发布匹配
  publish(data) {
    return request({
      url: '/match/publish',
      method: 'post',
      data
    })
  },

  // 获取匹配列表
  getList(interestId) {
    return request({
      url: `/match/list`,
      params: { interestId },
      method: 'get'
    })
  },

  // 获取我发布的匹配
  getMyList() {
    return request({
      url: '/match/publish/mine',
      method: 'get'
    })
  },

  // 获取我加入的匹配
  getMyJoinList() {
    return request({
      url: '/match/join/mine',
      method: 'get'
    })
  },

  // 加入匹配
  joinMatch(matchId) {
    return request({
      url: `/match/join/${matchId}`,
      method: 'post'
    })
  },

  // 退出匹配
  quitMatch(matchId) {
    return request({
      url: `/match/quit/${matchId}`,
      method: 'post'
    })
  },

  // 取消发布匹配
  cancelPublish(matchId) {
    return request({
      url: `/match/cancel/${matchId}`,
      method: 'post'
    })
  },

  // 删除匹配记录
  deleteMatch(matchId) {
    return request({
      url: `/match/delete/${matchId}`,
      method: 'post'
    })
  },

  // 开始实时匹配
  startRealTimeMatch(data) {
    return request({
      url: '/match/realtime/start',
      method: 'post',
      data
    })
  },

  // 取消实时匹配
  cancelRealTimeMatch(data) {
    return request({
      url: '/match/realtime/cancel',
      method: 'post',
      data: {
        interestId: data.interestId,
        limited: data.limited
      }
    })
  },

  // 获取当前实时匹配状态
  getRealTimeMatchStatus() {
    return request({
      url: '/match/realtime/status',
      method: 'get'
    })
  }
}

export default matchApi 