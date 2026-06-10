import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

const placeholderRoutes = [
  {
    path: '/attendance',
    name: 'attendance',
    title: 'Chấm công',
    description: 'Theo dõi vào ra, ca làm việc và các lần chấm công bất thường.',
  },
  {
    path: '/reports',
    name: 'reports',
    title: 'Báo cáo',
    description: 'Tổng hợp dữ liệu chấm công và xuất báo cáo theo tháng.',
  },
  {
    path: '/settings',
    name: 'settings',
    title: 'Cài đặt',
    description: 'Thiết lập cấu hình hệ thống, quyền truy cập và thông báo.',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: {
        layout: 'auth',
      },
    },
    {
      path: '/',
      name: 'dashboard',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/profile',
      name: 'account-profile',
      component: () => import('../views/account/AccountProfileView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/change-password',
      name: 'account-change-password',
      component: () => import('../views/account/ChangePasswordView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/permissions',
      name: 'permissions',
      component: () => import('../views/permissions/PermissionsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/roles/RolesView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('../views/users/UsersView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    ...placeholderRoutes.map(({ title, description, ...route }) => ({
      ...route,
      component: PlaceholderView,
      props: {
        title,
        description,
      },
      meta: {
        requiresAuth: true,
      },
    })),
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.name === 'login' && isAuthenticated) {
    return {
      name: 'dashboard',
    }
  }

  return true
})

export default router
