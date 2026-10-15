import axios from 'axios';
import { io } from 'socket.io-client';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket = io('https://imovies-backend-9iio.onrender.com', {
  autoConnect: false,
});