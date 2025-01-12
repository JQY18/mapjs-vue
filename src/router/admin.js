import { createRouter, createWebHistory } from 'vue-router'

const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/LoginView.vue'),
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'locations',
        name: 'LocationManagement',
        component: () => import('../views/admin/LocationManagementView.vue')
      },
      {
        path: 'location/:detailId/edit',
        name: 'LocationDetailEdit',
        component: () => import('../views/admin/LocationDetailEditView.vue')
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
      }
    ]
  }
]

export default adminRoutes 