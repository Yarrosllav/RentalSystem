// src/axios.js

import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Замініть на ваш URL бекенду
});

// Додаємо інтерцептор для додавання токена у заголовки
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
