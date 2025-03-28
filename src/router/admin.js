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
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue'),
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
        path: 'location/:detailId/comments',
        name: 'LocationDetailComments',
        component: () => import('../views/admin/LocationDetailCommentsView.vue')
      },
      {
        path: 'admins',
        name: 'AdminManagement',
        component: () => import('../views/admin/AdminManagementView.vue')
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
        path: 'notices',
        name: 'NoticeManagement',
        component: () => import('../views/admin/NoticeManagementView.vue')
      },   
      {
        path: 'posts',
        name: 'PostManagement',
        component: () => import('../views/admin/PostManagementView.vue')
      },
    ]
  }
]

export default adminRoutes 