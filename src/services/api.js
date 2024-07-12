// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-backend-api-url', // Replace with your backend API URL
});

export default api;
