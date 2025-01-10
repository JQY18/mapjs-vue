import { createRouter, createWebHistory } from 'vue-router'

const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagementView.vue')
      },
      {
        path: 'comments',
        name: 'CommentManagement',
        component: () => import('../views/admin/CommentManagementView.vue')
      },
      {
        path: 'locations',
        name: 'LocationManagement',
        component: () => import('../views/admin/LocationManagementView.vue')
      },
      {
        path: 'media',
        name: 'MediaManagement',
        component: () => import('../views/admin/MediaManagementView.vue')
      }
    ]
  }
]

export default adminRoutes 