import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure o endereço da sua API aqui
// Para testes locais no celular físico, use o IP da sua máquina
// Exemplo: 'http://192.168.1.100:3000'
const API_URL = "http://localhost:3000/api";

// Cria instância do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@GB:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      await AsyncStorage.removeItem("@GB:token");
      await AsyncStorage.removeItem("@GB:user");
      // Você pode redirecionar para login aqui
    }
    return Promise.reject(error);
  },
);

// Auth
export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Students
export const studentService = {
  getAll: async () => {
    const response = await api.get("/students");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },
};

// Check-ins
export const checkinService = {
  create: async (data) => {
    const response = await api.post("/checkins", data);
    return response.data;
  },

  getPending: async () => {
    const response = await api.get("/checkins/pending");
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await api.get(`/checkins/user/${userId}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/checkins/${id}`, { status });
    return response.data;
  },
};

// Stats
export const statsService = {
  getStats: async () => {
    const response = await api.get("/stats");
    return response.data;
  },
};

export default api;
