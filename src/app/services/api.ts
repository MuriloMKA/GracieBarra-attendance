import axios from 'axios';

const configuredApiUrl = (import.meta as any).env?.VITE_API_URL;
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

// Localhost usa API local por padrão; produção continua no Railway quando VITE_API_URL não vier definido.
const API_URL =
  configuredApiUrl ||
  (isLocalHost
    ? 'http://localhost:3001/api'
    : 'https://graciebarra-attendance-production.up.railway.app/api');

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
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
    const url: string = error.config?.url || '';
    const isLoginRoute = url.includes('/auth/login') || url.includes('/auth/change-password');
    // 401 = Token não fornecido, 403 = Token inválido/expirado
    // Não redireciona em rotas de autenticação para que o erro apareça na tela
    if (!isLoginRoute && (error.response?.status === 401 || error.response?.status === 403)) {
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
    token: string;
  };
  profiles: Array<{
    id: string;
    email: string;
    role: 'student' | 'admin';
    name: string;
    studentId?: string;
    token: string;
  }>;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      return data;
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
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

  async delete(id: string) {
    const { data } = await api.delete(`/attendance/${id}`);
    return data;
  },
};

export const classService = {
  async getAll() {
    const { data } = await api.get('/classes');
    return data;
  },
  
  async getById(id: string) {
    const { data } = await api.get(`/classes/${id}`);
    return data;
  },
  
  async create(classData: any) {
    const { data } = await api.post('/classes', classData);
    return data;
  },
  
  async update(id: string, classData: any) {
    const { data } = await api.put(`/classes/${id}`, classData);
    return data;
  },
  
  async delete(id: string) {
    const { data } = await api.delete(`/classes/${id}`);
    return data;
  },
};

export const notificationService = {
  async create(notification: {
    title: string;
    message: string;
    audience?: "all" | "students" | "teachers" | "admins";
    targetStudentId?: string | null;
  }) {
    const { data } = await api.post("/notifications", notification);
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  async getRecent(limit = 5) {
    const { data } = await api.get("/notifications/recent", {
      params: { limit },
    });
    return data;
  },
};

export default api;
