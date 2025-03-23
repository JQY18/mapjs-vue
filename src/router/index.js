import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './admin'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      children: [
        {
          path: 'notice',
          name: 'notice',
          component: () => import('../views/NoticeView.vue')
        },
        {
          path: 'message',
          name: 'message',
          component: () => import('../views/MessageView.vue')
        },
        {
          path: 'mail',
          name: 'mail',
          component: () => import('../views/MailView.vue')
        },
        {
          path: '',
          name: 'map',
          component: () => import('../components/Map.vue')
        },
        {
          path: 'location/:id',
          name: 'LocationDetail',
          component: () => import('../views/LocationDetail.vue')
        },
        {
          path: 'circle',
          name: 'circle',
          component: () => import('../views/CircleView.vue')
        },
        {
          path: 'personal/:id',
          name: 'personal',
          component: () => import('../views/PersonalView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/LoginView.vue')
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('../views/RegisterView.vue')
        },
        {
          path: '/3dmap',
          name: 'ThreeDMap',
          component: () => import('../components/3dmap.vue')
        },
        {
          path: '/3dmap-home',
          name: 'ThreeDMapHome',
          component: () => import('../components/3dmap-home.vue')
        },
        {
          path: '/vr',
          name: 'VRMap',
          component: () => import('../views/vrmap.vue')
        },
        {
          path: '/lost-found',
          name: 'LostFound',
          component: () => import('../views/LostFound.vue')
        },
      ]
    },
    
    ...adminRoutes
  ]
})

// 路由守卫
// router.beforeEach((to, from, next) => {
//   const isLoggedIn = !!localStorage.getItem('user')
//   const isAdmin = !!localStorage.getItem('adminToken')
  
//   // 检查是否需要管理员权限
//   if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
//     if (!isAdmin) {
//       next('/admin/login')
//       return
//     }
//   }
  
//   // 检查普通用户权限
//   if (to.meta.requiresAuth && !isLoggedIn && !to.path.startsWith('/admin')) {
//     localStorage.setItem('redirectPath', to.fullPath)
//     next('/login')
//     return
//   }
  
//   // 如果已登录，访问登录页则重定向到首页
//   if (isLoggedIn && to.path === '/login') {
//     next('/')
//     return
//   }
  
//   // 如果已登录管理员，访问管理员登录页则重定向到管理后台
//   if (isAdmin && to.path === '/admin/login') {
//     next('/admin')
//     return
//   }
  
//   next()
// })

export default router 