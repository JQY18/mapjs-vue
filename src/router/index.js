import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Map from '../components/Map.vue'
import LocationDetail from '../views/LocationDetail.vue'
import CircleView from '../views/CircleView.vue'
import PersonalView from '../views/PersonalView.vue'
import LoginView from '../views/LoginView.vue'

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
          path: 'personal',
          name: 'personal',
          component: PersonalView,
          meta: { requiresAuth: true }
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('user')
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 保存用户想要访问的页面
    localStorage.setItem('redirectPath', to.fullPath)
    next('/login')
  } else {
    next()
  }
})

export default router 