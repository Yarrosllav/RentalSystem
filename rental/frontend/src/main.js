// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles.css'; // Імпорт глобальних стилів

const app = createApp(App);

// Ініціалізація Store перед монтованням додатку
store.dispatch('initializeStore').then(() => {
  app.use(router).use(store).mount('#app');
});
