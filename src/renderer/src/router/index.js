import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/main'
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/components/routeViews/main/index.vue')
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import('@/components/routeViews/scan/index.vue')
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('@/components/routeViews/setting/index.vue')
    }
  ]
})
