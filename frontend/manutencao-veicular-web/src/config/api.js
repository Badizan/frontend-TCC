import axios from 'axios';

export const API_URL = 'http://localhost:3333'

const api = axios.create({
  baseURL: API_URL,
});

// Adiciona o token JWT em todas as requisições se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@manutencao:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api }; 