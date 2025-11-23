import axios, { AxiosInstance } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Product,
  TransferData,
  CaptchaData,
  UploadResponse,
  User
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private api: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // Importante para enviar cookies
    });

    // Interceptor para agregar el token JWT a las peticiones
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Agregar CSRF token si está disponible y es una petición que lo necesita
      if (this.csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
        config.headers['X-CSRF-Token'] = this.csrfToken;
        config.headers['CSRF-Token'] = this.csrfToken;
      }

      return config;
    });
  }

  // Obtener token CSRF
  async getCsrfToken(): Promise<string> {
    try {
      const response = await this.api.get<{ csrfToken: string }>('/api/csrf-token');
      this.csrfToken = response.data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('Error obteniendo CSRF token:', error);
      throw error;
    }
  }

  // Autenticación
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/login', credentials);
    // Obtener CSRF token después del login
    await this.getCsrfToken();
    return response.data;
  }

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/api/register', data);
    return response.data;
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const response = await this.api.post<{ valid: boolean; user: User }>('/api/auth/verify');
    // Obtener CSRF token si la verificación es exitosa
    if (response.data.valid) {
      await this.getCsrfToken();
    }
    return response.data;
  }

  // Vulnerabilidad: Brute Force / Blind SQL Injection
  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const response = await this.api.post<{ exists: boolean }>('/api/check-username', { username });
    return response.data;
  }

  // Vulnerabilidad: Command Injection
  async ping(host: string): Promise<{ output: string }> {
    const response = await this.api.post<{ output: string }>('/api/ping', { host });
    return response.data;
  }

  // Vulnerabilidad: CSRF - AHORA PROTEGIDO
  async transfer(data: TransferData): Promise<{ message: string }> {
    // Asegurarse de tener token CSRF antes de transferir
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }
    const response = await this.api.post<{ message: string }>('/api/transfer', data);
    return response.data;
  }

  // Vulnerabilidad: SQL Injection
  async getProducts(params: { category?: string; search?: string }): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/api/products', { params });
    return response.data;
  }

  // Vulnerabilidad: File Inclusion
  async readFile(filename: string): Promise<string> {
    const response = await this.api.get<string>('/api/file', {
      params: { filename },
      responseType: 'text' as any
    });
    return response.data;
  }

  // Vulnerabilidad: File Upload - AHORA PROTEGIDO
  async uploadFile(file: File): Promise<UploadResponse> {
    // Asegurarse de tener token CSRF antes de subir
    if (!this.csrfToken) {
      await this.getCsrfToken();
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Vulnerabilidad: Insecure CAPTCHA
  async getCaptcha(): Promise<CaptchaData> {
    const response = await this.api.get<CaptchaData>('/api/captcha');
    return response.data;
  }

  async verifyCaptcha(captchaId: string, captchaText: string): Promise<{ valid: boolean }> {
    const response = await this.api.post<{ valid: boolean }>('/api/verify-captcha', {
      captchaId,
      captchaText
    });
    return response.data;
  }
}

export default new ApiService();