<template>
  <div class="location-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <Icon icon="mdi:arrow-left" /> 返回
      </button>
      <h1>{{ detail?.name }}</h1>
    </div>

    <div class="main-container">
      <div class="content">
        <div class="content-wrapper">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              :class="['tab-button', { active: currentTab === tab.value }]"
              @click="currentTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <div v-if="currentTab === 'description'" class="description-tab">
              <div class="description-content">
                <p>{{ detail?.description }}</p>
              </div>
            </div>

            <div v-if="currentTab === 'images'" class="carousel-container">
              <div class="carousel">
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                  <img 
                    v-for="(image, index) in detail?.images" 
                    :key="index"
                    :src="image"
                    :alt="`${detail?.name} - 图片 ${index + 1}`"
                  >
                </div>
                <button class="carousel-btn prev" @click="prevImage" v-if="detail?.images?.length > 1">
                  <Icon icon="mdi:chevron-left" />
                </button>
                <button class="carousel-btn next" @click="nextImage" v-if="detail?.images?.length > 1">
                  <Icon icon="mdi:chevron-right" />
                </button>
                <div class="carousel-counter" v-if="detail?.images?.length > 1">
                  {{ currentImageIndex + 1 }}/{{ detail?.images?.length }}
                </div>
                <div class="carousel-indicators" v-if="detail?.images?.length > 1">
                  <button 
                    v-for="(_, index) in detail?.images" 
                    :key="index"
                    :class="['indicator', { active: currentImageIndex === index }]"
                    @click="currentImageIndex = index"
                  ></button>
                </div>
              </div>
            </div>

            <div v-if="currentTab === 'videos'" class="carousel-container">
              <div class="carousel">
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentVideoIndex * 100}%)` }">
                  <video 
                    v-for="(video, index) in detail?.videos"
                    :key="index"
                    controls
                    :src="video"
                  ></video>
                </div>
                <button class="carousel-btn prev" @click="prevVideo" v-if="detail?.videos?.length > 1">
                  <Icon icon="mdi:chevron-left" />
                </button>
                <button class="carousel-btn next" @click="nextVideo" v-if="detail?.videos?.length > 1">
                  <Icon icon="mdi:chevron-right" />
                </button>
                <div class="carousel-indicators" v-if="detail?.videos?.length > 1">
                  <button 
                    v-for="(_, index) in detail?.videos" 
                    :key="index"
                    :class="['indicator', { active: currentVideoIndex === index }]"
                    @click="currentVideoIndex = index"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="comments-wrapper" :class="{ 'comments-open': showComments }">
        <button class="toggle-comments" @click="showComments = !showComments">
          <Icon :icon="showComments ? 'mdi:close' : 'ic:baseline-comment'" class="comment-icon"/>
        </button>
        
        <div class="comments-section" v-show="showComments">
          <h2>访客评论</h2>
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              :placeholder="isLoggedIn ? '写下你的评论...' : '登录后发表评论'"
              @click="handleCommentClick"
              :disabled="!isLoggedIn"
            ></textarea>
            <button 
              class="submit-btn"
              @click="handleAddComment"
              :disabled="!isLoggedIn || !newComment.trim()"
            >
              {{ isLoggedIn ? '发表评论' : '请先登录' }}
            </button>
          </div>

          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <div class="comment-header">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ comment.time }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import request from '../api/request'

const route = useRoute()
const router = useRouter()

const detail = ref(null)

// api获取地点详情
onMounted(() => {
  // window.alert(route.params.id)

  // 请求地点详情
  request.get(`/locations/detail/${route.params.id}`)
    .then(res => {
      // locationData = res.data.data
      // detail.value = res.data.data
      const val = res.data.data
      if (val) {
        detail.value = val
      }else {
        detail.value = locationData[route.params.id] || null
      }
    })

    // 请求地点评论
    request.get(`/locations/comments/${route.params.id}`).then(res => {
    comments.value = res.data.data
  })
})


//地点详情
const locationData = {
  'library': {
    name: "逸夫图书馆",
    description: `中央图书馆是一座现代化的多功能图书馆，建筑面积达50,000平方米，共有8层。
    
    馆内设施：
    - 24小时自习室
    - 电子阅览室
    - 多媒体学习中心
    - 研讨间
    - 报刊阅览区
    
    图书馆藏书量超过200万册，订阅中外文期刊4000余种，并提供丰富的电子资源和数据库访问服务。`,
    images: [
      "https://images.unsplash.com/photo-1568667256549-094345857637",
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    ],
    videos: ["/videos/video.mp4"]
  },
  'zhishanlou': {
    name: "至善楼",
    description: `至善楼是学校的标志性建筑之一，位于校园中心位置。

    建筑特点：
    - 古典与现代相结合的建筑风格
    - 宽敞明亮的教室
    - 现代化的多媒体设备
    - 舒适的学习环境
    
    主要用途：
    - 日常授课
    - 学术讲座
    - 各类会议
    `,
    images: [
      "/images/zhishanlou.png"
    ],
    videos: []
  },
  'yuewangting': {
    name: "岳王亭",
    description: `岳王亭坐落于校园的最高处，是观赏校园风景的绝佳位置。

    建筑特色：
    - 传统中式园林建筑风格
    - 八角攒尖顶设计
    - 精美的木质雕刻装饰
    - 环形围栏设计
    
    历史文化：
    - 纪念民族英雄岳飞
    - 彰显忠义精神
    - 校园文化地标
    
    特色亮点：
    - 是校园内最佳的观景点
    。。。- 视野开阔，可俯瞰整个校园
    - 晨昏景色尤其优美
    - 学生摄影与写生的热门场所
    - 文化活动举办地点`,
    images: ["/images/yuewangting.png"],
    videos: []
  },
  'zhonghelou': {
    name: "中和楼",
    description: `中和楼是学校重要的教学与行政办公大楼，体现"中和"校训精神。

    建筑功能：
    - 现代化多媒体教室
    - 院系办公区域
    - 学术报告厅
    - 会议中心
    
    设施配置：
    - 智能化教学设备
    - 学生自习区
    - 休闲交流空间
    - 教师办公室
    - 空中花园`,
    images: ["/images/zhonghelou.png"],
    videos: []
  },
  'zhonglie': {
    name: "忠烈祠",
    description: `忠烈祠是校园内重要的历史文化遗迹，承载着深厚的历史记忆。

    历史价值：
    - 始建于民国时期
    - 纪念为国捐躯的英烈
    - 省级文物保护单位
    
    建筑特色：
    - 仿古建筑群落
    - 青砖黛瓦
    - 传统牌坊式大门
    - 庄严肃穆的氛围
    
    文化功能：
    - 爱国主义教育基地
    - 校史教育展览
    - 传统文化传承场所
    - 重要节日纪念活动场地`,
    images: ["/images/zhonglie.png"],
    videos: []
  },
  'xcCollege': {
    name: "新传学院",
    description: `新闻传播学院是培养新时代传媒人才的重要基地。

    院系特色：
    - 全媒体实验教学中心
    - 专业演播厅
    - 融媒体实训基地
    - 新媒体创新工作室
    
    教学设施：
    - 数字化编辑室
    - 摄影摄像实验室
    - 非线性编辑室
    - 广播录音室
    
    人才培养：
    - 新闻学专业
    - 广播电视学专业
    - 网络与新媒体专业
    - 广告学专业
    
    实践平台：
    - 校园电视台
    - 校园广播站
    - 新媒体运营中心
    - 学生记者站`,
    images: ["/images/xcCollege.png"],
    videos: []
  },
  'shichengshuyuan': {
    name: "世承书院",
    description: `世承书院是学校重要的人文学术机构，致力于传承中华优秀传统文化。

    教学特色：
    - 国学经典研习
    - 传统文化讲座
    - 书法篆刻教学
    - 诗词吟诵活动
    
    文化功能：
    - 传统文化教育基地
    - 学术研讨中心
    - 文化交流平台
    - 师生互动空间`,
    images: ["/images/shichengshuyuan.png"],
    videos: []
  },
  'lirenlou': {
    name: "理仁楼",
    description: `理仁楼是重要的理科教学楼，以"理"与"仁"为育人理念。

    功能布局：
    - 现代化实验室
    - 科研创新中心
    - 学术报告厅
    - 教师研究室
    
    教学特色：
    - 理工科专业课程
    - 实验教学基地
    - 科研项目开发
    - 学术交流中心`,
    images: ["/images/lirenlou.png"],
    videos: []
  },
  'mulanlou': {
    name: "木兰楼",
    description: `木兰楼是学校重要的教学楼，以巾帼英雄花木兰命名。

    建筑特点：
    - 现代化教学设施
    - 多功能报告厅
    - 研讨室与会议室
    - 休闲学习空间
    
    主要功能：
    - 日常教学活动
    - 学术交流活动
    - 学生社团活动
    - 文化展示空间`,
    images: ["/images/mulanlou.png"],
    videos: []
  },
  'jindelou': {
    name: "景德楼",
    description: `景德楼是学校标志性教学楼之一，体现"景行行止，德润身心"的育人理念。

    教学设施：
    - 智慧教室
    - 专业实验室
    - 研究生工作室
    - 教师办公区
    
    功能特色：
    - 本科教学基地
    - 研究生培养
    - 学术研讨
    - 教师科研`,
    images: ["/images/jindelou.png"],
    videos: []
  },
  'jingweilou': {
    name: "经纬楼",
    description: `经纬楼是重要的教学科研大楼，承载着培养创新人才的使命。

    建筑功能：
    - 专业实验室群
    - 科研创新中心
    - 学术交流空间
    - 教师科研办公区
    
    教学特色：
    - 跨学科教学
    - 创新实验平台
    - 产学研合作
    - 学术研讨活动`,
    images: ["/images/jingweilou.png"],
    videos: []
  },
  'waiguoyulou': {
    name: "外国语学院",
    description: `外国语学院是培养国际化语言人才的重要基地。

    教学特色：
    - 多语种教学
    - 语音实验室
    - 同声传译实训室
    - 跨文化交际中心
    
    学科设置：
    - 英语专业
    - 日语专业
    - 俄语专业
    - 翻译专业
    
    实践平台：
    - 国际交流中心
    - 外语竞赛基地
    - 外语角活动
    - 留学生交流项目`,
    images: ["/images/waiguoyulou.png"],
    videos: []
  },
  'wenyuanlou': {
    name: "文渊楼",
    description: `文渊楼是人文学科教学与研究的重要场所。

    建筑功能：
    - 人文学科教室
    - 学术研讨厅
    - 教师研究室
    - 资料查阅室
    
    学科特色：
    - 文学研究
    - 历史研究
    - 哲学研究
    - 艺术教育
    
    文化活动：
    - 学术讲座
    - 读书会
    - 文化沙龙
    - 艺术展览`,
    images: ["/images/wenyuanlou.png"],
    videos: []
  },
  'hxCollege': {
    name: "化工院",
    description: `化工院是化学工程与技术人才培养的专业基地。

    实验设施：
    - 化学实验室群
    - 分析测试中心
    - 工艺实训室
    - 科研创新平台
    
    专业方向：
    - 化学工程
    - 应用化学
    - 材料科学
    - 环境工程
    
    科研特色：
    - 新材料研发
    - 绿色化工
    - 环境治理
    - 产学研合作`,
    images: ["/images/hxCollege.png"],
    videos: []
  },
  'gsCollege': {
    name: "工学院",
    description: `工学院是培养工程技术人才的重要基地。

    实验设施：
    - 工程实验中心
    - 机械加工车间
    - 电气实验室
    - 自动化实训室
    
    专业方向：
    - 机械工程
    - 电气工程
    - 自动化技术
    - 工业设计
    
    创新平台：
    - 创新创业基地
    - 科技竞赛中心
    - 工程训练中心
    - 产学研基地`,
    images: ["/images/gsCollege.png"],
    videos: []
  },
  'lxCollege': {
    name: "理学院",
    description: `理学院是基础科学研究与人才培养的重要基地。

    实验设施：
    - 物理实验中心
    - 数学建模实验室
    - 计算机实验室
    - 科学计算中心
    
    学科方向：
    - 数学
    - 物理学
    - 计算科学
    - 应用统计
    
    特色项目：
    - 基础研究
    - 交叉学科研究
    - 科普教育
    - 学科竞赛`,
    images: ["/images/lxCollege.png"],
    videos: []
  },
  'jyCollege': {
    name: "教育学院",
    description: `教育学院是培养教育人才的专业学院。

    教学特色：
    - 教育理论研究
    - 教学实践基地
    - 心理咨询中心
    - 教育技术实验室
    
    专业方向：
    - 教育学
    - 心理学
    - 教育技术学
    - 学前教育
    
    实践平台：
    - 教育实习基地
    - 心理实验室
    - 教学技能训练室
    - 教育研究中心`,
    images: ["/images/jyCollege.png"],
    videos: []
  },
  'lgyCanteen': {
    name: "兰桂苑",
    description: `兰桂苑是学校重要的学生餐厅，以其优质的服务和多样的美食闻名。

    餐厅特色：
    - 多层用餐区域
    - 开放式厨房
    - 清真餐区
    - 特色风味档口
    
    美食类型：
    - 湘菜特色
    - 粤式早茶
    - 西式快餐
    - 特色小吃
    
    服务设施：
    - 自助打饭系统
    - 电子支付
    - 净菜配送
    - 就餐环境监控`,
    images: ["/images/library.png"],
    videos: []
  },
  'mlCanteen': {
    name: "木兰食堂",
    description: `木兰食堂以其现代化的设施和丰富的菜品种类著称。

    餐厅布局：
    - 一层大众餐区
    - 二层特色餐区
    - 教工就餐区
    - 休闲茶点区
    
    特色服务：
    - 营养配餐
    - 定制套餐
    - 外带打包
    - 微信点餐
    
    就餐环境：
    - 空调dining区
    - 露台就餐区
    - 包厢区域
    - 休闲座位`,
    images: ["/images/library.png"],
    videos: []
  },
  'jbCanteen': {
    name: "江边食堂",
    description: `江边食堂坐落于湘江畔，是集餐饮和休闲于一体的特色食堂。

    地理位置：
    - 临江而建
    - 景观优美
    - 通风良好
    - 视野开阔
    
    特色菜品：
    - 江鲜水产
    - 农家风味
    - 特色小炒
    - 休闲饮品
    
    配套设施：
    - 观江露台
    - 休闲座椅
    - 自助微波
    - 饮水设备`,
    images: ["/images/jbCanteen.jpg"],
    videos: []
  },
  'xiaoyiyuan': {
    name: "校医院",
    description: `校医院为师生提供全面的医疗保健服务。

    医疗科室：
    - 全科诊室
    - 专科门诊
    - 急诊处置室
    - 检验科室
    
    服务项目：
    - 常见病诊治
    - 健康体检
    - 预防保健
    - 心理咨询
    
    特色功能：
    - 医保定点
    - 24小时急诊
    - 绿色通道
    - 预约挂号`,
    images: ["/images/shichengshuyuan.png"],
    videos: []
  },
  'jyGym': {
    name: "江湾体育馆",
    description: `江湾体育馆是学校重要的体育活动和赛事场地。

    场馆设施：
    - 标准篮球场
    - 羽毛球场地
    - 乒乓球室
    - 健身房
    
    功能区域：
    - 观众看台
    - 器材室
    - 更衣室
    - 休息区
    
    活动开展：
    - 体育课程
    - 校园赛事
    - 社团活动
    - 文艺演出`,
    images: ["/images/jyGym.png"],
    videos: []
  },
  'byPlayground': {
    name: "田径场",
    description: `田径场是学校重要的体育教学和训练场地。

    场地设施：
    - 标准跑道
    - 足球场
    - 跳远沙坑
    - 投掷区
    
    功能用途：
    - 体育教学
    - 运动训练
    - 体育考试
    - 大型活动
    
    配套设施：
    - LED显示屏
    - 看台座椅
    - 照明系统
    - 体育器材室`,
    images: ["/images/byPlayground.png"],
    videos: []
  },
  'yan6': {
    name: "研六舍",
    description: `研六舍是研究生公寓，为研究生提供舒适的住宿环境。

    房间配置：
    - 四人间/六人间
    - 独立卫浴
    - 空调设施
    - 网络覆盖
    
    公共设施：
    - 洗衣房
    - 开水房
    - 自习室
    - 晾衣区
    
    周边环境：
    - 近邻食堂
    - 便利店
    - 快递点
    - 自动售货机`,
    images: ["/images/library.png"],
    videos: []
  },
  'yan2': {
    name: "研二舍",
    description: `研二舍是研究生宿舍楼，以其便利的位置和完善的设施著称。

    宿舍设施：
    - 标准间配置
    - 中央空调
    - 太阳能热水
    - 电梯服务
    
    生活服务：
    - 24小时热水
    - 门禁系统
    - 快递服务点
    - 维修服务
    
    周边配套：
    - 临近图书馆
    - 运动场地
    - 小卖部
    - 打印店`,
    images: ["/images/library.png"],
    videos: []
  },
  'erliban': {
    name: "二里半宿舍",
    description: `二里半宿舍区是学校重要的学生生活区。

    区域布局：
    - 多栋宿舍楼
    - 生活服务区
    - 文体活动区
    - 绿化休闲区
    
    生活设施：
    - 公共浴室
    - 洗衣中心
    - 自习室
    - 健身区域
    
    便民服务：
    - 快递中心
    - 小型超市
    - 理发店
    - 维修点`,
    images: ["/images/library.png"],
    videos: []
  },
  'honglou': {
    name: "红楼",
    description: `红楼是学校重要的行政办公楼，承担着学校管理职能。

    办公部门：
    - 校长办公室
    - 党委办公室
    - 人事处
    - 财务处
    
    功能区域：
    - 会议中心
    - 接待室
    - 档案室
    - 多功能厅
    
    标志性：
    - 校园地标
    - 历史建筑
    - 文化象征
    - 形象窗口`,
    images: ["/images/honglou.png"],
    videos: []
  },
  'jiaowuchu': {
    name: "教务处",
    description: `教务处是负责学校教学管理和服务的重要部门。

    主要职能：
    - 教学管理
    - 课程安排
    - 考务管理
    - 教务信息
    
    服务内容：
    - 选课系统
    - 成绩管理
    - 学籍管理
    - 教学评估
    
    办事大厅：
    - 综合服务窗口
    - 自助打印区
    - 等候区域
    - 咨询台`,
    images: ["/images/library.png"],
    videos: []
  },
  'xiaogonghui': {
    name: "校工会",
    description: `校工会是教职工之家，服务全校教职员工。

    主要职能：
    - 教职工权益维护
    - 文体活动组织
    - 福利发放
    - 帮扶服务
    
    活动场所：
    - 多功能厅
    - 活动室
    - 休息室
    - 会议室
    
    特色服务：
    - 教职工活动
    - 节日庆祝
    - 文化建设
    - 健康关怀`,
    images: ["/images/library.png"],
    videos: []
  },
  'yan5': {
    name: "研五舍",
    description: `研五舍是研究生宿舍楼，环境优美，设施完善。

    宿舍设施：
    - 四人间配置
    - 独立卫浴
    - 空调配备
    - 高速网络
    
    公共空间：
    - 休闲区域
    - 自习室
    - 洗衣房
    - 晾衣平台
    
    生活服务：
    - 24小时热水
    - 安保系统
    - 物业服务
    - 快递收发`,
    images: ["/images/library.png"],
    videos: []
  },
  'yan3': {
    name: "研三舍",
    description: `研三舍为研究生提供温馨舒适的住宿环境。

    房间设施：
    - 标准四人间
    - 基础家具配置
    - 空调暖气
    - 网络接口
    
    配套设施：
    - 公共浴室
    - 开水房
    - 储物室
    - 值班室
    
    周边环境：
    - 绿化景观
    - 休闲座椅
    - 健身器材
    - 自行车棚`,
    images: ["/images/library.png"],
    videos: []
  },
  'yan1': {
    name: "研一舍",
    description: `研一舍是历史悠久的研究生宿舍楼。

    基础设施：
    - 标准间布局
    - 公共卫浴
    - 电扇配备
    - 网络覆盖
    
    生活设施：
    - 饮水设备
    - 洗衣设备
    - 储物空间
    - 公共厨房
    
    环境特色：
    - 传统建筑风格
    - 成熟植被
    - 文化氛围浓厚
    - 生活便利`,
    images: ["/images/library.png"],
    videos: []
  },
  'jiangbian1': {
    name: "江边一舍",
    description: `江边一舍坐落于湘江畔，环境优美。

    宿舍特色：
    - 临江而建
    - 通风良好
    - 景观优美
    - 生态环境好
    
    基础设施：
    - 标准间配置
    - 公共浴室
    - 洗衣房
    - 晾衣区
    
    周边配套：
    - 江边食堂
    - 运动场地
    - 休闲步道
    - 观景平台`,
    images: ["/images/library.png"],
    videos: []
  },
  'jiangbian2': {
    name: "江边二舍",
    description: `江边二舍与江边一舍相邻，同享江景资源。

    住宿条件：
    - 标准间布局
    - 基础设施完善
    - 空调配备
    - 网络覆盖
    
    公共设施：
    - 公共浴室
    - 洗衣设备
    - 开水房
    - 自习室
    
    环境优势：
    - 江景视野
    - 空气清新
    - 环境安静
    - 交通便利`,
    images: ["/images/library.png"],
    videos: []
  },
  'jiangbian3': {
    name: "江边三舍",
    description: `江边三舍是江边宿舍群的重要组成部分。

    房间配置：
    - 多人间布局
    - 基础家具
    - 电扇空调
    - 网络设施
    
    生活设施：
    - 公共浴室
    - 洗衣房
    - 饮水设备
    - 储物空间
    
    地理优势：
    - 临近江边
    - 环境优美
    - 生活便利
    - 交通方便`,
    images: ["/images/library.png"],
    videos: []
  },
  'xuegongchu': {
    name: "学工处",
    description: `学工处是负责学生工作的重要职能部门。

    主要职责：
    - 学生管理
    - 奖助学金
    - 心理辅导
    - 就业指导
    
    服务内容：
    - 学生事务办理
    - 困难生资助
    - 心理咨询
    - 职业规划
    
    工作特色：
    - 一站式服务
    - 信息化管理
    - 人性化服务
    - 全程跟踪`,
    images: ["/images/library.png"],
    videos: []
  },
  'baogaoting': {
    name: "国际学术报告厅",
    description: `国际学术报告厅是学校重要的学术交流场所。

    场地设施：
    - 多媒体系统
    - 同声传译设备
    - 专业音响
    - 照明系统
    
    功能用途：
    - 学术报告
    - 国际会议
    - 专题讲座
    - 文化活动
    
    特色优势：
    - 大容量座席
    - 先进设备
    - 完善服务
    - 专业团队`,
    images: ["/images/library.png"],
    videos: []
  },
  'designMajor': {
    name: "服装设计系",
    description: `服装设计系是培养时尚创意人才的专业基地。

    专业设施：
    - 服装工作室
    - 面料实验室
    - CAD制图室
    - 展示厅
    
    教学特色：
    - 创意设计
    - 工艺制作
    - 时尚营销
    - 品牌策划
    
    实践平台：
    - 时装工作坊
    - 创意工作室
    - 时装秀场
    - 产学研基地
    
    特色活动：
    - 毕业时装秀
    - 设计大赛
    - 时尚讲座
    - 产业对接`,
    images: ["/images/designMajor.png"],
    videos: []
  }
}

const showComments = ref(false)
const currentTab = ref('description')

const tabs = [
  { label: '描述', value: 'description' },
  { label: '图片', value: 'images' },
  { label: '视频', value: 'videos' }
]


//评论区内容
const comments = ref([
  {
    id: "1",
    username: "张同学",
    time: "2024-03-15 14:30",
    content: "图书馆环境很好，自习室经常爆满，建议早点来占座。"
  },
  {
    id: "2", 
    username: "李同学",
    time: "2024-03-14 16:20",
    content: "一楼的借阅大厅藏书很丰富，工作人员服务态度也很好。"
  },
  {
    id: "3",
    username: "王老师",
    time: "2024-03-13 09:45", 
    content: "图书馆的电子资源非常全面，对教学科研很有帮助。"
  },
  {
    id: "4",
    username: "刘同学",
    time: "2024-03-12 20:15",
    content: "晚上自习的时候环境安静，空调温度也很舒适。"
  }
])

const newComment = ref('')

const currentImageIndex = ref(0)
const currentVideoIndex = ref(0)

const nextImage = () => {
  if (!detail.value?.images) return
  currentImageIndex.value = (currentImageIndex.value + 1) % detail.value.images.length
}

const prevImage = () => {
  if (!detail.value?.images) return
  currentImageIndex.value = currentImageIndex.value === 0 
    ? detail.value.images.length - 1 
    : currentImageIndex.value - 1
}

const nextVideo = () => {
  if (!detail.value?.videos) return
  currentVideoIndex.value = (currentVideoIndex.value + 1) % detail.value.videos.length
}

const prevVideo = () => {
  if (!detail.value?.videos) return
  currentVideoIndex.value = currentVideoIndex.value === 0 
    ? detail.value.videos.length - 1 
    : currentVideoIndex.value - 1
}

// onMounted(async () => {
//   // 根据路由参数获取对应的位置数据
//   const locationId = route.params.id
//   // 在实际项目中，这里应该是API调用
//   // const response = await fetchLocationDetail(locationId)
//   // detail.value = response.data
  
//   // 现在使用本地数据
//   detail.value = locationData[locationId] || null
// })

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})


// 点击评输入框
const handleCommentClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

// 提交评论
const handleAddComment = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) return
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const myContent = newComment.value

  request.post('/locations/comments/add',{
    detailId: route.params.id,
    userId: user.id,
    content: newComment.value,
  }).then(response => {

    comments.value.unshift({
      id: String(comments.value.length + 1),
      username: response.data.data,
      time: new Date().toLocaleString(),
      content: myContent
    })

  }).catch(error => {
    console.log(error)
  })
  
  newComment.value = ''
}
</script>

<style scoped>
.location-detail {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 20px;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  background: white;
}

.main-container {
  display: flex;
  position: relative;
  gap: 20px;
  flex: 1;
  overflow: visible;
  background: #f5f5f5;
}

.content {
  flex: 1;
  padding: 0 20px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  justify-content: center;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333333;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #e0e0e0;
}

.tab-button.active {
  background: #1a73e8;
  color: white;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  overflow: visible;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.description-tab {
  padding: 20px;
  height: 100%;
  background: white;
  border-radius: 12px;
}

.description-content {
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.8;
  white-space: pre-line;
  font-size: 15px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-grid img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-list video {
  width: 100%;
  border-radius: 8px;
}

.comments-wrapper {
  position: fixed;
  right: -400px;
  top: 0;
  height: 100%;
  width: 400px;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
}

.comments-wrapper.comments-open {
  right: 0;
}

.toggle-comments {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px 0 0 8px;
  background: #1a73e8;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.comment-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  font-size: 20px;
}

.comments-section {
  max-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
}

.time {
  color: #666;
  font-size: 0.9em;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.carousel-container {
  width: 100%;
  min-height: 400px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.carousel-inner {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.carousel-inner img,
.carousel-inner video {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  object-fit: contain;
  background: #f5f5f5;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: background 0.3s;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.carousel-counter {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333333;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.back-button:hover {
  background: #e0e0e0;
}

h1 {
  font-size: 20px;
  margin: 0;
}

.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.comment-form textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.submit-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.description-content p {

  color: #333333;
  margin: 1rem 0;
  line-height: 1.5;

}
</style> 