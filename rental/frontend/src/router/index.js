// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// Імпортуйте сторінки
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import Registration from '../views/Registration.vue';
import FAQ from '../views/FAQ.vue';
import Features from '../views/Features.vue';
import How from '../views/How.vue';
import Assets from '../views/Assets.vue';
import RentalsView from '../views/RentalsView.vue';
import CreateRental from '../views/CreateRental.vue';
import FinancialSummary from '../views/FinancialSummary.vue';
import AdminDashboard from '../views/AdminDashboard.vue'; // Імпорт AdminDashboard

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration,
    meta: { guest: true },
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ,
  },
  {
    path: '/features',
    name: 'Features',
    component: Features,
  },
  {
    path: '/how',
    name: 'How',
    component: How,
  },
  {
    path: '/assets',
    name: 'Assets',
    component: Assets,
    meta: { requiresAuth: true },
  },
  {
    path: '/rentals',
    name: 'Rentals',
    component: RentalsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/rentals/create/:asset_id',
    name: 'CreateRental',
    component: CreateRental,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/financial-summary',
    name: 'FinancialSummary',
    component: FinancialSummary,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // Додайте інші маршрути за потребою
  { path: '/:pathMatch(.*)*', redirect: '/' }, // Перенаправлення невідомих маршрутів на головну сторінку
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Глобальний охоронник маршрутів
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  const user = store.getters.user;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' });
    } else if (to.matched.some(record => record.meta.requiresAdmin) && !user?.is_admin) {
      next({ name: 'Dashboard' }); // Перенаправлення на користувацький кабінет
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      // Перевірка, чи користувач є адміністратором
      if (user?.is_admin) {
        next({ name: 'AdminDashboard' });
      } else {
        next({ name: 'Dashboard' });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
