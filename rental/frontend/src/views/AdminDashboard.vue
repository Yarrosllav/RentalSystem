<!-- src/views/AdminDashboard.vue -->

<template>
  <div class="admin-dashboard">
    <div class="container">
      <h2 class="section-title">Адміністративна Панель</h2>

      <!-- Форма для створення об'єкта оренди -->
      <form @submit.prevent="createAsset">
        <div class="form-group">
          <label for="name">Назва Об'єкта</label>
          <input type="text" id="name" v-model="name" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="type">Тип Об'єкта</label>
          <select id="type" v-model="type" required class="form-control">
            <option disabled value="">Виберіть тип</option>
            <option v-for="typeOption in assetTypes" :key="typeOption" :value="typeOption">
              {{ typeOption }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">Опис</label>
          <textarea id="description" v-model="description" class="form-control"></textarea>
        </div>
        <div class="form-group">
          <label for="price_per_day">Ціна за День (₴)</label>
          <input type="number" id="price_per_day" v-model="pricePerDay" required class="form-control" min="0" step="0.01" />
        </div>
        <button type="submit" class="btn btn--primary">Створити Об'єкт</button>
      </form>
      <div v-if="successMessage" class="alert alert-success mt-3">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <!-- Список створених об'єктів оренди -->
      <h3 class="section-subtitle mt-5">Керування Об'єктами Оренди</h3>
      <div v-if="assets.length > 0" class="assets-list">
        <div v-for="asset in assets" :key="asset.id" class="asset-item card"> <!-- Використання asset.id -->
          <h4>{{ asset.name }}</h4>
          <p>Тип: {{ asset.type }}</p>
          <p>Ціна за день: {{ asset.price_per_day }}₴</p>
          <p>Статус: {{ asset.status }}</p>
          <button @click="deleteAsset(asset.id)" class="btn btn--danger">Видалити</button> <!-- Використання asset.id -->
          <button v-if="asset.status === 'Доступно'" @click="setMaintenance(asset.id)" class="btn btn--warning">На обслуговування</button> <!-- Використання asset.id -->
          <button v-if="asset.status === 'На обслуговуванні'" @click="setAvailable(asset.id)" class="btn btn--success">Встановити Доступно</button> <!-- Використання asset.id -->
        </div>
      </div>
      <div v-else class="no-data">
        Немає об'єктів оренди.
      </div>

      <!-- Список оренд -->
      <h3 class="section-subtitle mt-5">Керування Орендами</h3>
      <div v-if="rentals.length > 0" class="rentals-list">
        <div v-for="rental in rentals" :key="rental.id" class="rental-item card"> <!-- Використання rental.id -->
          <h4>Оренда ID: {{ rental.id }}</h4> <!-- Використання rental.id -->
          <p>Об'єкт: {{ rental.asset_name }}</p>
          <p>Користувач: {{ rental.username }}</p>
          <p>Статус: {{ rental.status }}</p>
          <p>Дата початку: {{ formatDate(rental.start_date) }}</p>
          <p>Дата закінчення: {{ formatDate(rental.end_date) }}</p>
          <p>Сума: {{ rental.total_cost }}₴</p>
          <button @click="deleteRental(rental.id)" class="btn btn--danger">Видалити</button> <!-- Використання rental.id -->
          <button v-if="rental.status === 'Активний'" @click="cancelRental(rental.id)" class="btn btn--secondary">Скасувати Оренду</button> <!-- Використання rental.id -->
        </div>
      </div>
      <div v-else class="no-data">
        Немає активних оренд.
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      name: '',
      type: '',
      description: '',
      pricePerDay: '',
      assetTypes: ['Автомобілі', 'Електросамокати', 'Велосипеди'],
      assets: [], // Список об'єктів оренди
      rentals: [], // Список оренд
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    /**
     * Створити новий об'єкт оренди.
     */
    async createAsset() {
      try {
        const payload = {
          name: this.name,
          type: this.type,
          description: this.description,
          price_per_day: parseFloat(this.pricePerDay),
        };
        const response = await axios.post('/objects/', payload);
        if (response.status === 201) {
          this.successMessage = 'Об\'єкт оренди створено успішно!';
          this.errorMessage = '';
          // Очистити форму
          this.name = '';
          this.type = '';
          this.description = '';
          this.pricePerDay = '';
          // Оновити список об'єктів
          this.fetchAssets();
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося створити об\'єкт оренди.';
        }
        this.successMessage = '';
      }
    },
    /**
     * Завантажити список об'єктів оренди.
     */
    async fetchAssets() {
      try {
        const response = await axios.get('/objects/');
        if (response.status === 200) {
          this.assets = response.data;
          console.log('Отримані об\'єкти:', this.assets); // Додано для перевірки
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = 'Не вдалося завантажити об\'єкти оренди.';
      }
    },
    /**
     * Видалити об'єкт оренди.
     * @param {number} asset_id - Ідентифікатор об'єкта.
     */
    async deleteAsset(asset_id) {
      if (!confirm('Ви впевнені, що хочете видалити цей об\'єкт?')) return;
      try {
        const response = await axios.delete(`/objects/${asset_id}`); // Використовуємо asset.id
        if (response.status === 200) {
          this.successMessage = 'Об\'єкт оренди видалено успішно!';
          this.errorMessage = '';
          this.fetchAssets();
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося видалити об\'єкт оренди.';
        }
        this.successMessage = '';
      }
    },
    /**
     * Встановити статус об'єкта на 'На обслуговуванні'.
     * @param {number} asset_id - Ідентифікатор об'єкта.
     */
    async setMaintenance(asset_id) {
      try {
        const response = await axios.post(`/objects/${asset_id}/maintenance`); // Використовуємо asset.id
        if (response.status === 200) {
          this.successMessage = 'Статус об\'єкта оренди встановлено на "На обслуговуванні".';
          this.errorMessage = '';
          this.fetchAssets();
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося встановити статус на "На обслуговуванні".';
        }
        this.successMessage = '';
      }
    },
    /**
     * Встановити статус об'єкта на 'Доступно'.
     * @param {number} asset_id - Ідентифікатор об'єкта.
     */
    async setAvailable(asset_id) {
      try {
        const response = await axios.post(`/objects/${asset_id}/available`); // Використовуємо asset.id
        if (response.status === 200) {
          this.successMessage = 'Статус об\'єкта оренди встановлено на "Доступно".';
          this.errorMessage = '';
          this.fetchAssets();
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося встановити статус на "Доступно".';
        }
        this.successMessage = '';
      }
    },
    /**
     * Завантажити список оренд.
     */
    async fetchRentals() {
      try {
        const response = await axios.get('/rentals/');
        if (response.status === 200) {
          this.rentals = response.data;
          console.log('Отримані оренди:', this.rentals); // Додано для перевірки
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = 'Не вдалося завантажити оренди.';
      }
    },
    /**
     * Видалити оренду.
     * @param {number} rental_id - Ідентифікатор оренди.
     */
    async deleteRental(rental_id) {
      if (!confirm('Ви впевнені, що хочете видалити цю оренду?')) return;
      try {
        const response = await axios.delete(`/rentals/${rental_id}`); // Використовуємо rental.id
        if (response.status === 200) {
          this.successMessage = 'Оренда видалена успішно!';
          this.errorMessage = '';
          this.fetchRentals();
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося видалити оренду.';
        }
        this.successMessage = '';
      }
    },
    /**
     * Скасувати оренду.
     * @param {number} rental_id - Ідентифікатор оренди.
     */
    async cancelRental(rental_id) {
      try {
        const response = await axios.post(`/rentals/${rental_id}/cancel`); // Використовуємо rental.id
        if (response.status === 200) {
          this.successMessage = 'Оренда скасована успішно!';
          this.errorMessage = '';
          this.fetchRentals();
          this.fetchAssets(); // Оновлюємо статус об'єктів
        }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          this.errorMessage = error.response.data.msg;
        } else {
          this.errorMessage = 'Не вдалося скасувати оренду.';
        }
        this.successMessage = '';
      }
    },
    /**
     * Форматує дату для відображення.
     * @param {string} dateStr - Дата у форматі ISO.
     * @returns {string} - Відформатована дата.
     */
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleDateString('uk-UA');
    },
  },
  created() {
    this.fetchAssets();
    this.fetchRentals();
  },
};
</script>

<style scoped>
.admin-dashboard {
  padding: 5rem 0;
}

.admin-dashboard .container {
  max-width: 1200px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

.assets-list,
.rentals-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.asset-item,
.rental-item {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: var(--gray-50);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease;
}

.asset-item:hover,
.rental-item:hover {
  box-shadow: var(--shadow-md);
}

.asset-item h4,
.rental-item h4 {
  margin-top: 0;
}

.asset-item p,
.rental-item p {
  margin: 5px 0;
}

.btn--danger {
  background-color: #dc3545;
  color: #fff;
  border: none;
  margin-right: 0.5rem;
}

.btn--warning {
  background-color: #ffc107;
  color: #212529;
  border: none;
  margin-right: 0.5rem;
}

.btn--success {
  background-color: #28a745;
  color: #fff;
  border: none;
  margin-right: 0.5rem;
}

.btn--secondary {
  background-color: #6c757d;
  color: #fff;
  border: none;
}

.btn--primary {
  background-color: #007bff;
  color: #fff;
  border: none;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  opacity: 0.9;
}

.alert {
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
}

.section-subtitle {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.no-data {
  text-align: center;
  color: var(--gray-500);
  padding: 2rem 0;
  font-size: 1.2rem;
}
</style>
