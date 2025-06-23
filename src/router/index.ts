import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import type { RouteRecordRaw } from 'vue-router'

// Lazy loading des composants avec prefetch
const Dashboard = () => import(/* webpackChunkName: "dashboard", webpackPrefetch: true */ '@/views/Dashboard.vue')
const CreateUser = () => import(/* webpackChunkName: "create-user" */ '@/views/CreateUser.vue')
const UserDetail = () => import(/* webpackChunkName: "user-detail" */ '@/views/UserDetail.vue')
const AuthTest = () => import(/* webpackChunkName: "auth-test" */ '@/views/AuthTest.vue')
const AuditLog = () => import(/* webpackChunkName: "audit-log" */ '@/views/AuditLog.vue')
const ServerlessFunctions = () => import(/* webpackChunkName: "serverless-functions" */ '@/views/ServerlessFunctions.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      prefetch: true,
    },
  },
  {
    path: '/create-user',
    name: 'CreateUser',
    component: CreateUser,
    meta: {
      title: 'Créer un utilisateur',
    },
  },
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: UserDetail,
    props: true,
    meta: {
      title: 'Détail utilisateur',
    },
  },
  {
    path: '/auth-test',
    name: 'AuthTest',
    component: AuthTest,
    meta: {
      title: 'Test d\'authentification',
    },
  },
  {
    path: '/audit-log',
    name: 'AuditLog',
    component: AuditLog,
    meta: {
      title: 'Journal d\'audit',
    },
  },
  {
    path: '/functions',
    name: 'ServerlessFunctions',
    component: ServerlessFunctions,
    meta: {
      title: 'Fonctions Serverless',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Page non trouvée',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Guards pour NProgress et gestion des titres
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  // Mise à jour du titre de la page
  if (to.meta?.title) {
    document.title = `${to.meta.title} - FaaS Dashboard`
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router 