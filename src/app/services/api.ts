import axios from 'axios';

// Configuração da URL base - no app nativo, usar IP da máquina
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gb_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gb_auth_token');
      localStorage.removeItem('gb_current_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'student' | 'admin';
    name: string;
    studentId?: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },
};

export const studentService = {
  async getAll() {
    const { data } = await api.get('/students');
    return data;
  },
  
  async getById(id: string) {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },
  
  async create(student: any) {
    const { data } = await api.post('/students', student);
    return data;
  },
  
  async update(id: string, student: any) {
    const { data } = await api.put(`/students/${id}`, student);
    return data;
  },
};

export const attendanceService = {
  async getAll(studentId?: string) {
    const { data } = await api.get('/attendance', {
      params: studentId ? { studentId } : {},
    });
    return data;
  },
  
  async create(attendance: any) {
    const { data } = await api.post('/attendance', attendance);
    return data;
  },
  
  async update(id: string, updates: any) {
    const { data } = await api.patch(`/attendance/${id}`, updates);
    return data;
  },
};

export const classService = {
  async getAll() {
    const { data } = await api.get('/classes');
    return data;
  },
};

export default api;
