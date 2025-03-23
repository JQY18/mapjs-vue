import {
  Client
} from '@stomp/stompjs';
import {
  ElMessage
} from 'element-plus';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect(userId, groups = []) {
    this.stompClient = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${localStorage.getItem('token')}`,
      connectHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 如果浏览器不支持 WebSocket，则使用 SockJS
    if (typeof WebSocket !== 'function') {
      ElMessage.error('当前浏览器不支持 WebSocket');
      this.stompClient.webSocketFactory = () => {
        console.log('创建 SockJS 连接...');
        const sockjs = new SockJS(`http://localhost:8080/ws?token=${localStorage.getItem('token')}`);

        sockjs.onopen = () => {
          console.log('SockJS 连接已打开:', sockjs.url);
        };

        sockjs.onclose = (e) => {
          console.log('SockJS 连接已关闭:', e.reason);
        };

        return sockjs;
      }
    }

    this.stompClient.onConnect = async () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket 连接成功');

      // 订阅用户私聊频道
      this.subscribeToPrivateChat(userId);

      // 订阅所有群聊频道
      groups.forEach(group => {
        if (group.type === 'group') {
          this.subscribeToGroupChat(group.id);
        }
      });
      console.log(`已订阅 ${groups.filter(g => g.type === 'group').length} 个群聊频道`);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket 连接错误:', frame);
      console.error('错误详情:', {
        command: frame.command,
        headers: frame.headers,
        body: frame.body
      });
      // this.handleConnectionError();
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket 底层错误:', event);
      console.error('错误详情:', {
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        eventPhase: event.eventPhase,
        timeStamp: event.timeStamp,
        isTrusted: event.isTrusted
      });
      // this.handleConnectionError();
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.error('WebSocket 连接关闭:', event);
      console.error('关闭详情:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timeStamp: event.timeStamp
      });
      this.handleConnectionError();
    };

    try {
      console.log('正在尝试激活 WebSocket 连接...');
      console.log('连接配置:', {
        brokerURL: this.stompClient.brokerURL,
        connectHeaders: this.stompClient.connectHeaders,
        reconnectDelay: this.stompClient.reconnectDelay,
        heartbeatIncoming: this.stompClient.heartbeatIncoming,
        heartbeatOutgoing: this.stompClient.heartbeatOutgoing
      });
      this.stompClient.activate();
    } catch (error) {
      console.error('WebSocket 激活失败:', error);
      console.error('错误堆栈:', error.stack);
      // this.handleConnectionError();
    }
  }

  // 订阅私聊频道
  subscribeToPrivateChat(userId) {
    if (!this.connected) return;

    const subscription = this.stompClient.subscribe(
      `/user/${userId}/private`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          this.handleMessage('private', data);
        } catch (error) {
          console.error('处理私聊消息错误:', error);
        }
      }
    );

    this.subscriptions.set(`private_${userId}`, subscription);
  }

  // 订阅群聊频道
  subscribeToGroupChat(groupId) {
    if (!this.connected) return;

    const subscription = this.stompClient.subscribe(
      `/topic/group/${groupId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          this.handleMessage('group', data);
        } catch (error) {
          console.error('处理群聊消息错误:', error);
        }
      }
    );

    this.subscriptions.set(`group_${groupId}`, subscription);
  }

  // 取消订阅群聊
  unsubscribeFromGroupChat(groupId) {
    const subscription = this.subscriptions.get(`group_${groupId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`group_${groupId}`);
    }
  }

  // 发送私聊消息
  sendPrivateMessage(targetUserId, message) {
    if (!this.connected) {
      ElMessage.error('WebSocket 未连接');
      return;
    }

    this.stompClient.publish({
      destination: '/app/private-message',
      body: JSON.stringify({
        sendTo: targetUserId,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        createdTime: message.createdTime,
        content: message.content
      })
    });
  }

  // 发送群聊消息
  sendGroupMessage(groupId, message) {
    if (!this.connected) {
      ElMessage.error('WebSocket 未连接');
      return;
    }

    this.stompClient.publish({
      destination: '/app/group-message',
      body: JSON.stringify({
        sendTo: groupId,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        createdTime: message.createdTime,
        content: message.content
      })
    });
  }

  // 处理接收到的消息
  handleMessage(type, data) {
    if (this.messageCallback) {
      this.messageCallback(type, data);
    }
  }

  // 设置消息处理回调
  onMessage(callback) {
    this.messageCallback = callback;
  }

  // 处理连接错误
  handleConnectionError() {
    this.connected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    } else {
      ElMessage.error('WebSocket 连接失败，请刷新页面重试');
    }
  }

  // 断开连接
  disconnect() {
    if (this.stompClient) {
      // 清理所有订阅
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.stompClient.deactivate();
      this.connected = false;
      this.stompClient = null;
    }
  }
}

export default new WebSocketService();