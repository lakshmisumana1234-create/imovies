import axios from 'axios';
import { io } from 'socket.io-client';

export const api = axios.create({
  baseURL: 'https://imovies-backend-91io.onrender.com/api',
});

// Attach JWT token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket = io('https://imovies-backend-91io.onrender.com', {
  autoConnect: false,
});