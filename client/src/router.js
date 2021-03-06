import Vue from 'vue'
import Router from 'vue-router'
import Store from './store/index'

Vue.use(Router)

async function requireAuth (to, from, next) {
  function proceed () {
    if (Store.state.AuthStore.isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  }
  await Store.dispatch('loadUser')
  proceed()
}

async function requireUserAuth (to, from, next) {
  function proceed () {
    if (Store.state.AuthStore.role === 'user') {
      next()
    } else {
      next('/login')
    }
  }
  await Store.dispatch('loadUser')
  proceed()
}

async function requireAdminAuth (to, from, next) {
  function proceed () {
    if (Store.state.AuthStore.role === 'admin') {
      next()
    } else {
      next('/login')
    }
  }
  await Store.dispatch('loadUser')
  proceed()
}

async function alreadyLoggedIn (to, from, next) {
  function proceed () {
    if (Store.state.AuthStore.isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  }
  await Store.dispatch('loadUser')
  proceed()
}

const Login = () => import('./views/LoginView.vue')
const Dashboard = () => import('./views/DashboardView.vue')
const Logs = () => import('./views/LogsView.vue')
const Users = () => import('./views/UsersView.vue')
const Items = () => import('./views/ItemsView.vue')
const UserProfile = () => import('./views/UserProfileView.vue')

export default new Router({
  scrollBehavior: (to, from, savedPosition) => ({ y: 0 }), // scroll to top of the page every time route changes
  mode: 'history',
  linkActiveClass: 'active', // router-link active class name
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/login', name: 'login', component: Login },
    { path: '/logs', name: 'logs', component: Logs, beforeEnter: requireAdminAuth },
    { path: '/users', name: 'users', component: Users, beforeEnter: requireAdminAuth },
    { path: '/items', name: 'items', component: Items, beforeEnter: requireAuth },
    { path: '/userprofile', name: 'userprofile', component: UserProfile, beforeEnter: requireUserAuth }
  ]
})
