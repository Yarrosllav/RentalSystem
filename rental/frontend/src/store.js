// src/store.js

import { createStore } from 'vuex';
import axios from './axios'; // Переконайтеся, що файл axios.js існує в src

const store = createStore({
  state: {
    isAuthenticated: false,
    user: null,
  },
  mutations: {
    /**
     * Встановлює стан автентифікації
     * @param {Object} state - Стан Vuex
     * @param {Boolean} value - Нове значення стану автентифікації
     */
    SET_AUTH(state, value) {
      state.isAuthenticated = value;
    },
    /**
     * Встановлює дані користувача
     * @param {Object} state - Стан Vuex
     * @param {Object} userData - Дані користувача
     */
    SET_USER(state, userData) {
      state.user = userData;
    },
  },
  actions: {
    /**
     * Дія для входу користувача
     * @param {Object} context - Контекст Vuex
     * @param {Object} credentials - Об'єкт з полями username та password
     * @returns {Promise<Object>} - Об'єкт з полями success та message
     */
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await axios.post('/auth/login', credentials);
        if (response.status === 200 && response.data.access_token) {
          // Зберігаємо токен у localStorage
          localStorage.setItem('access_token', response.data.access_token);
          // Встановлюємо стан автентифікації
          commit('SET_AUTH', true);
          // Завантажуємо дані користувача
          await dispatch('fetchUser');
          return { success: true, message: 'Вхід успішний' };
        } else {
          return { success: false, message: 'Несподівана відповідь від сервера' };
        }
      } catch (error) {
        console.error('Помилка входу:', error);
        let message = 'Вхід не вдалося. Спробуйте ще раз.';
        if (error.response && error.response.data && error.response.data.msg) {
          message = error.response.data.msg;
        }
        return { success: false, message };
      }
    },
    /**
     * Дія для реєстрації нового користувача
     * @param {Object} context - Контекст Vuex
     * @param {Object} userData - Об'єкт з полями username, email та password
     * @returns {Promise<Object>} - Об'єкт з полями success та message
     */
    async register({ commit, dispatch }, userData) {
      try {
        const response = await axios.post('/auth/register', userData);
        if (response.status === 201 && response.data.access_token) {
          // Зберігаємо токен у localStorage
          localStorage.setItem('access_token', response.data.access_token);
          // Встановлюємо стан автентифікації
          commit('SET_AUTH', true);
          // Завантажуємо дані користувача
          await dispatch('fetchUser');
          return { success: true, message: 'Реєстрація успішна' };
        } else {
          return { success: false, message: 'Несподівана відповідь від сервера' };
        }
      } catch (error) {
        console.error('Помилка реєстрації:', error);
        let message = 'Реєстрація не вдалася. Спробуйте ще раз.';
        if (error.response && error.response.data && error.response.data.msg) {
          message = error.response.data.msg;
        }
        return { success: false, message };
      }
    },
    /**
     * Дія для завантаження даних користувача
     * @param {Object} context - Контекст Vuex
     * @returns {Promise<void>}
     */
    async fetchUser({ commit }) {
      try {
        const response = await axios.get('/auth/me');
        if (response.status === 200) {
          commit('SET_USER', response.data);
          commit('SET_AUTH', true);
        } else {
          commit('SET_USER', null);
          commit('SET_AUTH', false);
        }
      } catch (error) {
        console.error('Помилка завантаження даних користувача:', error);
        commit('SET_USER', null);
        commit('SET_AUTH', false);
      }
    },
    /**
     * Дія для виходу користувача
     * @param {Object} context - Контекст Vuex
     * @returns {Promise<void>}
     */
    async logout({ commit }) {
      try {
        // Якщо у вас є бекенд-ендпоїнт для виходу, використайте його
        // await axios.post('/auth/logout');
      } catch (error) {
        console.error('Помилка виходу:', error);
        // Навіть якщо запит виходу не вдалося, продовжуємо очищення клієнтських даних
      } finally {
        localStorage.removeItem('access_token');
        commit('SET_USER', null);
        commit('SET_AUTH', false);
      }
    },
    /**
     * Дія для ініціалізації store при запуску додатку
     * @param {Object} context - Контекст Vuex
     * @returns {Promise<void>}
     */
    async initializeStore({ dispatch }) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await dispatch('fetchUser');
        } catch (error) {
          console.error('Помилка ініціалізації store:', error);
          await dispatch('logout');
        }
      }
    },
  },
  getters: {
    /**
     * Геттер для перевірки автентифікації
     * @param {Object} state - Стан Vuex
     * @returns {Boolean}
     */
    isAuthenticated: (state) => state.isAuthenticated,
    /**
     * Геттер для отримання даних користувача
     * @param {Object} state - Стан Vuex
     * @returns {Object|null}
     */
    user: (state) => state.user,
  },
});

export default store;
