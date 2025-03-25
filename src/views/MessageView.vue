<template>
  <div class="message-container">
    <!-- 左侧会话列表 -->
    <div class="conversation-list">
      <div class="list-header">
        <div class="header-top">
          <h3>消息列表</h3>
          <div class="create-group-btn" @click="showCreateGroupDialog = true">
            <Icon icon="mdi:account-group-outline" />
            创建群聊
          </div>
        </div>
        <el-radio-group v-model="chatType" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="private">私聊</el-radio-button>
          <el-radio-button label="group">群聊</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索聊天"
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 会话列表 -->
      <div class="conversation-items">
        <div
          v-for="chat in filteredChats"
          :key="chat.id"
          class="chat-item"
          :class="{ active: currentChat?.id === chat.id }"
          @click="selectChat(chat)"
        >
          <el-avatar :size="40" :src="chat.avatar" />
          <div class="chat-info">
            <div class="chat-header">
              <div class="chat-title-wrapper">
                <span class="chat-name">{{ chat.name }}</span>
                <el-tag
                  size="small"
                  :type="chat.type === 'private' ? 'info' : 'warning'"
                  class="chat-type-tag"
                >
                  {{ chat.type === "private" ? "私聊" : "群聊" }}
                </el-tag>
              </div>
              <span class="chat-time">{{
                formatTime(chat.lastMessage?.createdTime)
              }}</span>
            </div>
            <div class="chat-message">
              <span class="message-preview">{{
                chat.lastMessage?.content
              }}</span>
              <el-badge
                v-if="chat.unreadCount"
                :value="chat.unreadCount"
                class="unread-badge"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area" v-if="currentChat">
      <div class="chat-header">
        <div class="chat-title">
          <span>{{ currentChat.name }}</span>
          <span class="online-status" v-if="currentChat.type === 'private'">
            <el-tag
              size="small"
              :type="currentChat.online ? 'success' : 'info'"
            >
              {{ currentChat.online ? "在线" : "离线" }}
            </el-tag>
          </span>
          <span class="member-count" v-else>
            <el-tag size="small" type="info"
              >{{ currentChat.memberCount }}人</el-tag
            >
          </span>
        </div>
        <div class="chat-actions">
          <template v-if="currentChat.type === 'private'">
            <el-popconfirm
              title="确定要删除该好友吗？"
              @confirm="handleDeleteFriend"
              confirm-button-text="确定"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button size="small" type="danger">删除好友</el-button>
              </template>
            </el-popconfirm>
          </template>
          <template v-else>
            <el-button size="small" @click="showGroupMembers">
              成员列表
            </el-button>
            <el-popconfirm
              :title="
                isGroupOwner ? '确定要解散该群聊吗？' : '确定要退出该群聊吗？'
              "
              @confirm="handleGroupAction"
              confirm-button-text="确定"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  {{ isGroupOwner ? "解散群聊" : "退出群聊" }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageList">
        <div
          v-for="msg in currentChat.messages"
          :key="msg.id"
          class="message-item"
          :class="{ 'message-mine': msg.senderId === currentUserId }"
        >
          <div class="message-avatar">
            <el-avatar :size="36" :src="msg.senderAvatar" />
          </div>
          <div class="message-content">
            <div class="message-info">
              <span class="sender-name">{{ msg.senderName }}</span>
              <span class="message-time">{{
                formatTime(msg.createdTime)
              }}</span>
            </div>
            <div class="message-bubble">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="toolbar">
          <el-button size="small" @click="handleUploadImage">
            <el-icon><Picture /></el-icon>图片</el-button
          >
          <el-button size="small" @click="handleUploadVideo">
            <el-icon><VideoCamera /></el-icon>视频</el-button>

          <el-button size="small" @click="handleUploadFile"
            ><el-icon><Files /></el-icon>文件</el-button
          >
        </div>
        <div class="message-editor">
          <el-input
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @keyup.enter.exact="sendMessage"
          />
          <el-button
            type="primary"
            @click="sendMessage"
            :disabled="!messageText.trim()"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="选择一个聊天开始会话" />
    </div>

    <!-- 群成员对话框 -->
    <el-dialog v-model="showMembersDialog" title="群成员" width="400px">
      <div class="member-list">
        <template v-for="role in ['owner', 'admin', 'member']" :key="role">
          <div v-if="getMembersByRole(role).length > 0" class="role-section">
            <div class="role-title">
              {{ getRoleTitle(role) }}
              <span class="role-count"
                >({{ getMembersByRole(role).length }})</span
              >
            </div>
            <div
              v-for="member in getMembersByRole(role)"
              :key="member.id"
              class="member-item"
            >
              <el-avatar :size="32" :src="member.avatar" />
              <span class="member-name">{{ member.nickname }}</span>
              <el-tag size="small" :type="getRoleTagType(role)">
                {{ getRoleLabel(role) }}
              </el-tag>
            </div>
          </div>
        </template>
      </div>
    </el-dialog>

    <!-- 添加创建群聊对话框 -->
    <div v-if="showCreateGroupDialog" class="dialog-overlay">
      <div class="create-group-dialog">
        <div class="dialog-header">
          <h3>创建群聊</h3>
          <button class="close-btn" @click="showCreateGroupDialog = false">
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div class="dialog-content">
          <div class="group-name-input">
            <label>群聊名称</label>
            <input v-model="groupName" placeholder="请输入群聊名称" />
          </div>

          <div class="friends-list">
            <div class="list-header">选择好友</div>
            <div class="friends-container">
              <div
                v-for="chat in privateChatList"
                :key="chat.id"
                class="friend-item"
                :class="{ selected: selectedFriends.includes(chat.userId) }"
                @click="toggleFriendSelection(chat.userId)"
              >
                <img :src="chat.avatar" class="friend-avatar" />
                <div class="friend-info">
                  <div class="friend-name">{{ chat.name }}</div>
                </div>
                <Icon
                  :icon="
                    selectedFriends.includes(chat.userId)
                      ? 'mdi:checkbox-marked-circle'
                      : 'mdi:checkbox-blank-circle-outline'
                  "
                  class="select-icon"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-btn" @click="showCreateGroupDialog = false">
            取消
          </button>
          <button
            class="submit-btn"
            :disabled="!groupName.trim() || selectedFriends.length === 0"
            @click="handleCreateGroup"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { Search, Picture, Files, VideoCamera } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import request from "../api/request";
import websocketService from "../utils/websocketService";
import { Icon } from "@iconify/vue";

// 状态变量
const chatType = ref("all");
const searchText = ref("");
const currentChat = ref(null);
const messageText = ref("");
const showMembersDialog = ref(false);
const messageList = ref(null);
const currentUserId = ref(1); // 当前用户ID，实际应从用户状态获取
const currentUser = ref(null);
const showCreateGroupDialog = ref(false);
const groupName = ref("");
const selectedFriends = ref([]);

// 聊天列表数据
// const chats = ref([
//   {
//     id: 1,
//     type: 'private',
//     name: '张三',
//     avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
//     online: true,
//     lastMessage: {
//       content: '好的，那就这样吧！',
//       createdTime: '2024-03-20 14:30:00'
//     },
//     unreadCount: 2,
//     messages: [
//       {
//         id: 1,
//         senderId: 2,
//         senderName: '张三',
//         senderAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
//         content: '你好，在吗？',
//         createdTime: '2024-03-20 14:25:00'
//       },
//       {
//         id: 2,
//         senderId: 1,
//         senderName: '我',
//         senderAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
//         content: '在的，什么事？',
//         createdTime: '2024-03-20 14:26:00'
//       },
//       {
//         id: 3,
//         senderId: 2,
//         senderName: '张三',
//         senderAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
//         content: '关于上次讨论的项目，我觉得可以这样做',
//         createdTime: '2024-03-20 14:28:00'
//       },
//       {
//         id: 4,
//         senderId: 2,
//         senderName: '张三',
//         senderAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
//         content: '好的，那就这样吧！',
//         createdTime: '2024-03-20 14:30:00'
//       }
//     ]
//   },
//   {
//     id: 2,
//     type: 'private',
//     name: '李四',
//     avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
//     online: false,
//     lastMessage: {
//       content: '晚点再聊！',
//       createdTime: '2024-03-20 10:15:00'
//     },
//     unreadCount: 0,
//     messages: []
//   },
//   {
//     id: 3,
//     type: 'group',
//     name: '项目开发群',
//     avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
//     memberCount: 5,
//     lastMessage: {
//       content: '[图片]',
//       createdTime: '2024-03-20 13:20:00'
//     },
//     unreadCount: 5,
//     messages: [],
//     members: [
//       {
//         id: 1,
//         name: '张三',
//         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
//         isAdmin: true
//       },
//       {
//         id: 2,
//         name: '李四',
//         avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
//         isAdmin: false
//       },
//       {
//         id: 3,
//         name: '王五',
//         avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
//         isAdmin: false
//       }
//     ]
//   },
//   {
//     id: 4,
//     type: 'group',
//     name: '技术交流群',
//     avatar: 'https://cube.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
//     memberCount: 88,
//     lastMessage: {
//       content: '有谁了解Vue3的新特性吗？',
//       createdTime: '2024-03-19 18:30:00'
//     },
//     unreadCount: 0,
//     messages: [],
//     members: []
//   }
// ]);
const chats = ref([]);

// 过滤后的聊天列表
const filteredChats = computed(() => {
  return chats.value
    .filter((chat) => chatType.value === "all" || chat.type === chatType.value)
    .filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
        chat.lastMessage?.content
          .toLowerCase()
          .includes(searchText.value.toLowerCase())
    );
});

// 获取聊天列表
const fetchChats = async () => {
  try {
    const response = await request.get("/chat/list");
    if (response.data.code === 1) {
      chats.value = response.data.data;
      // 获取到聊天列表后再连接 WebSocket
      websocketService.connect(currentUserId.value, chats.value);
    }
  } catch (error) {
    ElMessage.error("获取聊天列表失败");
  }
};

// 选择聊天
const selectChat = async (chat) => {
  currentChat.value = chat;

  // 获取聊天历史记录
  try {
    const response = await request.get(`/chat/messages/${chat.id}`);
    if (response.data.code === 1) {
      currentChat.value.messages = response.data.data;
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    ElMessage.error("获取聊天记录失败");
  }

  // 更新已读状态
  if (chat.unreadCount > 0) {
    try {
      const response = await request.post(`/chat/read/${chat.id}`, {
        lastMessageId: chat.messages[chat.messages.length - 1].id,
      });
      if (response.data.code === 1) {
        chat.unreadCount = 0;
      }
    } catch (err) {
      ElMessage.error("更新已读状态失败");
    }
  }

  // 获取当前私聊对方在线状态
  if (chat.type === "private") {
    try {
      const response = await request.get(`/chat/online/${chat.userId}`);
      if (response.data.code === 1) {
        chat.online = response.data.data;
      }
    } catch (error) {
      ElMessage.error("获取在线状态失败");
    }
  }

  // 获取群聊成员列表
  if (chat.type === "group") {
    try {
      const response = await request.get(`/chat/members/${chat.id}`);
      if (response.data.code === 1) {
        currentChat.value.members = response.data.data;
        currentChat.value.memberCount = response.data.data.length;
      }
    } catch (error) {
      ElMessage.error("获取群聊成员列表失败");
    }
  }
};

// 获取用户信息
const fetchUserInfo = async (userId) => {
  try {
    const response = await request.get(`/user/info?userId=${userId}`);
    if (response.data.code === 1) {
      currentUser.value = response.data.data;
    } else {
      ElMessage.error("获取用户信息失败");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    ElMessage.error("获取用户信息失败");
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim()) return;

  const message = {
    content: messageText.value,
    chatId: currentChat.value.id,
    senderId: currentUserId.value,
    senderName: currentUser.value?.nickname || "用户" + currentUserId.value,
    senderAvatar:
      currentUser.value?.avatar ||
      "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    createdTime: new Date().toISOString(),
    tempId: Date.now(), // 添加临时ID
    status: "sending",
  };

  try {
    // 添加消息到本地聊天记录（状态为发送中）
    addMessageToChat(currentChat.value, message);

    // 清空输入框
    messageText.value = "";

    // 发送消息
    if (currentChat.value.type === "private") {
      websocketService.sendPrivateMessage(currentChat.value.userId, message);
    } else {
      websocketService.sendGroupMessage(currentChat.value.id, message);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("发送消息失败");
    // 更新消息状态为发送失败
    const failedMessage = currentChat.value.messages.find(
      (m) => m.tempId === message.tempId
    );
    if (failedMessage) {
      failedMessage.status = "failed";
    }
  }
};

// 显示群成员
const showGroupMembers = () => {
  showMembersDialog.value = true;
};

// 处理文件上传
const handleUploadImage = () => {
  // 实现图片上传逻辑
};

const handleUploadVideo = () => {
  // 实现视频上传逻辑
};

const handleUploadFile = () => {
  // 实现文件上传逻辑
};

// 滚动到底部
const scrollToBottom = () => {
  const container = messageList.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 今天的消息显示时间
  if (diff < 86400000) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 一周内的消息显示星期几
  if (diff < 604800000) {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `星期${days[date.getDay()]}`;
  }

  // 其他显示完整日期
  return date.toLocaleDateString("zh-CN");
};

// 初始化
onMounted(async () => {
  const userJson = localStorage.getItem("user");
  if (userJson) {
    const userData = JSON.parse(userJson);
    currentUserId.value = userData.id;
    // 获取完整的用户信息
    await fetchUserInfo(userData.id);
  } else {
    ElMessage.error("用户未登录");
    return;
  }

  // 设置消息处理回调
  websocketService.onMessage((type, data) => {
    handleWebSocketMessage(type, data);
  });

  // 获取聊天列表
  fetchChats();
});

onUnmounted(() => {
  // 断开 WebSocket 连接
  websocketService.disconnect();
});

// 处理 WebSocket 消息
const handleWebSocketMessage = (type, data) => {
  if (type === "private") {
    handlePrivateMessage(data);
  } else if (type === "group") {
    handleGroupMessage(data);
  }
};

// 处理群聊消息
const handleGroupMessage = (data) => {
  const chat = chats.value.find(
    (c) => c.type === "group" && c.id === data.sendTo
  );

  if (chat) {
    // 将有新消息的群聊移到列表开头
    const index = chats.value.indexOf(chat);
    if (index > 0) {
      chats.value.splice(index, 1);
      chats.value.unshift(chat);
    }

    // 如果是发送者收到自己的消息确认
    if (data.senderId === currentUserId.value) {
      const existingMessage = chat.messages.find(
        (m) => m.tempId === data.tempId
      );
      if (existingMessage) {
        // 更新现有消息的状态和ID
        Object.assign(existingMessage, {
          id: data.id,
          status: "sent",
          createdTime: data.createdTime,
        });
      }
    } else {
      // 如果是接收到他人的消息
      addMessageToChat(chat, {
        ...data,
        status: "received",
      });
    }
  }
};

// 处理私聊消息
const handlePrivateMessage = (data) => {
  const chat = chats.value.find(
    (c) =>
      c.type === "private" &&
      (c.userId === data.senderId || c.userId === data.targetUserId)
  );

  if (chat) {
    // 将有新消息的会话移到列表开头
    const index = chats.value.indexOf(chat);
    if (index > 0) {
      chats.value.splice(index, 1);
      chats.value.unshift(chat);
    }

    // 如果是发送者收到自己的消息确认
    if (data.senderId === currentUserId.value) {
      const existingMessage = chat.messages.find(
        (m) => m.tempId === data.tempId
      );
      if (existingMessage) {
        // 更新现有消息的状态和ID
        Object.assign(existingMessage, {
          id: data.id,
          status: "sent",
          createdTime: data.createdTime,
        });
      }
    } else {
      // 如果是接收到他人的消息
      addMessageToChat(chat, {
        ...data,
        status: "received",
      });
    }
  }
};

// 获取群聊信息
const fetchGroupInfo = async (groupId) => {
  try {
    const response = await request.get(`/chat/group/${groupId}`);
    if (response.data.code === 1) {
      return response.data.data;
    }
  } catch (error) {
    console.error("获取群聊信息失败:", error);
    ElMessage.error("获取群聊信息失败");
  }
  return null;
};

// 向聊天添加消息
const addMessageToChat = (chat, message) => {
  chat.messages = chat.messages || [];

  // 更新最后一条消息
  chat.lastMessage = {
    content: message.content,
    createdTime: message.createdTime,
    contentType: message.contentType || "text",
  };

  // 如果不是发送中的消息，直接添加
  if (
    message.status !== "sending" ||
    !chat.messages.find((m) => m.tempId === message.tempId)
  ) {
    chat.messages.push(message);
  }

  // 如果消息不是自己发的，且不是当前聊天，增加未读计数
  if (
    message.senderId !== currentUserId.value &&
    currentChat.value?.id !== chat.id
  ) {
    chat.unreadCount = (chat.unreadCount || 0) + 1;
  }

  // 如果是当前聊天，滚动到底部
  if (currentChat.value?.id === chat.id) {
    nextTick(() => {
      scrollToBottom();
    });
  }
};

// 获取私聊列表
const privateChatList = computed(() => {
  return chats.value.filter((chat) => chat.type === "private");
});

// 选择/取消选择好友
const toggleFriendSelection = (userId) => {
  const index = selectedFriends.value.indexOf(userId);
  if (index === -1) {
    selectedFriends.value.push(userId);
  } else {
    selectedFriends.value.splice(index, 1);
  }
};

// 创建群聊
const handleCreateGroup = async () => {
  if (!groupName.value.trim() || selectedFriends.value.length === 0) return;

  try {
    const response = await request.post("/chat/group/add", {
      name: groupName.value.trim(),
      userIds: selectedFriends.value,
    });

    if (response.data.code === 1) {
      ElMessage.success("创建群聊成功");
      showCreateGroupDialog.value = false;
      groupName.value = "";
      selectedFriends.value = [];
      // 刷新聊天列表
      await fetchChats();
    } else {
      ElMessage.error(response.data.msg || "创建群聊失败");
    }
  } catch (error) {
    console.error("创建群聊失败:", error);
    ElMessage.error("创建群聊失败");
  }
};

// 根据角色获取成员列表
const getMembersByRole = (role) => {
  return (
    currentChat.value?.members?.filter((member) => member.role === role) || []
  );
};

// 获取角色标题
const getRoleTitle = (role) => {
  const titles = {
    owner: "群主",
    admin: "管理员",
    member: "群成员",
  };
  return titles[role];
};

// 获取角色标签
const getRoleLabel = (role) => {
  const labels = {
    owner: "群主",
    admin: "管理员",
    member: "成员",
  };
  return labels[role];
};

// 获取角色标签类型
const getRoleTagType = (role) => {
  const types = {
    owner: "danger",
    admin: "warning",
    member: "info",
  };
  return types[role];
};

// 判断是否为群主
const isGroupOwner = computed(() => {
  if (!currentChat.value || currentChat.value.type !== "group") return false;
  const currentMember = currentChat.value.members?.find(
    (m) => m.id === currentUserId.value
  );
  return currentMember?.role === "owner";
});

// 处理删除好友
const handleDeleteFriend = async () => {
  try {
    const response = await request.delete(
      `/user/deleteFriend/${currentChat.value.userId}`
    );
    if (response.data.code === 1) {
      ElMessage.success("删除好友成功");
      // 从聊天列表中移除
      const index = chats.value.findIndex((c) => c.id === currentChat.value.id);
      if (index > -1) {
        chats.value.splice(index, 1);
      }
      // 清空当前聊天
      currentChat.value = null;
    } else {
      ElMessage.error(response.data.msg || "删除好友失败");
    }
  } catch (error) {
    console.error("删除好友失败:", error);
    ElMessage.error("删除好友失败");
  }
};

// 处理群聊操作（退出或解散）
const handleGroupAction = async () => {
  try {
    const chatId = currentChat.value.id;
    const url = isGroupOwner.value
      ? `/chat/group/delete/${chatId}`
      : `/chat/group/exit/${chatId}`;

    const response = await request.delete(url);
    if (response.data.code === 1) {
      ElMessage.success(isGroupOwner.value ? "解散群聊成功" : "退出群聊成功");
      // 从聊天列表中移除
      const index = chats.value.findIndex((c) => c.id === chatId);
      if (index > -1) {
        chats.value.splice(index, 1);
      }
      // 清空当前聊天
      currentChat.value = null;
    } else {
      ElMessage.error(
        response.data.msg ||
          (isGroupOwner.value ? "解散群聊失败" : "退出群聊失败")
      );
    }
  } catch (error) {
    console.error("群聊操作失败:", error);
    ElMessage.error(isGroupOwner.value ? "解散群聊失败" : "退出群聊失败");
  }
};
</script>

<style scoped>
.message-container {
  display: flex;
  height: calc(100vh - 100px);
  margin: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.conversation-list {
  width: 300px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  color: #303133;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-items: center;
  gap: 12px;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 180px;
  overflow: hidden;
}

.chat-type-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 16px;
  border-radius: 4px;
}

.chat-name {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.chat-time {
  font-size: 12px;
  color: #909399;
}

.chat-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-preview {
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message-item.message-mine {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 60%;
}

.message-info {
  margin-bottom: 4px;
}

.sender-name {
  font-size: 13px;
  color: #909399;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: 8px;
}

.message-bubble {
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.message-mine .message-bubble {
  background-color: #ecf5ff;
}

.input-area {
  border-top: 1px solid #ebeef5;
  padding: 4px;
  padding-bottom: 24px;
  background-color: #fff;
  border-radius: 0 0 8px 0;
  margin-bottom: 10px;
}

.toolbar {
  padding: 4px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.message-editor {
  padding: 8px;
  padding-bottom: 12px;
  display: flex;
  gap: 12px;
}

.message-editor .el-textarea {
  flex: 1;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 12px;
}

.role-section {
  margin-bottom: 16px;
}

.role-title {
  font-size: 14px;
  color: #606266;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 8px;
}

.role-count {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  transition: all 0.3s;
}

.member-item:hover {
  background-color: #f5f7fa;
}

.member-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.el-tag {
  min-width: 48px;
  text-align: center;
}

.create-group-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.create-group-btn:hover {
  background: #40a9ff;
}

.create-group-btn .iconify {
  font-size: 16px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.create-group-dialog {
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
}

.dialog-content {
  padding: 20px;
}

.group-name-input {
  margin-bottom: 20px;
}

.group-name-input label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.group-name-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.friends-list {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.list-header {
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
}

.friends-container {
  max-height: 300px;
  overflow-y: auto;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.friend-item:hover {
  background: #f5f5f5;
}

.friend-item.selected {
  background: #e6f7ff;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 14px;
  color: #333;
}

.select-icon {
  font-size: 20px;
  color: #1890ff;
}

.dialog-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.submit-btn {
  background: #1890ff;
  border: none;
  color: white;
}

.submit-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>