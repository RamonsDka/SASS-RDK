const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
}

interface User {
  username: string;
  role: string;
  status: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface SystemMetrics {
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: number;
    usage: string;
    loadAverage: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: string;
  };
  disk: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usagePercent: string;
    mount: string;
  }>;
  network: Array<{
    iface: string;
    rx_bytes: number;
    tx_bytes: number;
    rx_sec: number;
    tx_sec: number;
  }>;
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    hostname: string;
  };
  processes: {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    list: Array<{
      pid: number;
      name: string;
      cpu: number;
      mem: number;
    }>;
  };
  temperature: {
    main: number;
    cores: number[];
    max: number;
  };
  uptime: number;
}

interface HistoryPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  network_rx: number;
  network_tx: number;
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    return response.json();
  }

  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrarse');
    }

    return response.json();
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE_URL}/system/metrics`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener métricas del sistema');
    }

    return response.json();
  }

  async getSystemHistory(): Promise<HistoryPoint[]> {
    const response = await fetch(`${API_BASE_URL}/system/history`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener histórico del sistema');
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return response.json();
  }

  async approveUser(username: string, status: 'approved' | 'rejected', role: string = 'user'): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ username, status, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al aprobar usuario');
    }

    return response.json();
  }
}

export const api = new ApiClient();
