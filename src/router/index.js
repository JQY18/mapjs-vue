import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Map from '../components/Map.vue'
import LocationDetail from '../views/LocationDetail.vue'
import CircleView from '../views/CircleView.vue'
import PersonalView from '../views/PersonalView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import adminRoutes from './admin'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '',
          name: 'map',
          component: Map
        },
        {
          path: 'location/:id',
          name: 'LocationDetail',
          component: LocationDetail
        },
        {
          path: 'circle',
          name: 'circle',
          component: CircleView
        },
        {
          path: 'personal/:id',
          name: 'personal',
          component: PersonalView,
          meta: { requiresAuth: true }
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView
        },
        {
          path: '/register',
          name: 'register',
          component: RegisterView
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