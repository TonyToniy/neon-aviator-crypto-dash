
interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

interface AuthResponse {
  user?: User;
  session?: Session;
  error?: string;
}

interface DepositResponse {
  id: string;
  address: string;
  amount: number;
  tx_hash: string | null;
  confirmations: number;
  status: string;
  created_at: string;
}

class ApiClient {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth methods
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<{ user: User; session: Session }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.session) {
      this.token = result.data.session.access_token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return {
      user: result.data?.user,
      session: result.data?.session,
      error: result.error,
    };
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<{ user: User; session: Session }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.session) {
      this.token = result.data.session.access_token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return {
      user: result.data?.user,
      session: result.data?.session,
      error: result.error,
    };
  }

  async signOut(): Promise<{ error?: string }> {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    return { error: result.error };
  }

  getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Balance methods
  async getUserBalance(userId: string): Promise<{ data?: { balance: number }; error?: string }> {
    return this.request<{ balance: number }>(`/users/${userId}/balance`);
  }

  async updateUserBalance(userId: string, balance: number): Promise<{ error?: string }> {
    return this.request(`/users/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ balance }),
    });
  }

  // Crypto deposit methods
  async getCryptoDeposits(userId: string): Promise<{ data?: DepositResponse[]; error?: string }> {
    return this.request<DepositResponse[]>(`/users/${userId}/deposits`);
  }

  async createCryptoDeposit(userId: string, deposit: {
    address: string;
    amount: number;
    tx_hash: string;
    currency: string;
  }): Promise<{ data?: DepositResponse; error?: string }> {
    return this.request<DepositResponse>(`/users/${userId}/deposits`, {
      method: 'POST',
      body: JSON.stringify(deposit),
    });
  }

  async updateDepositStatus(txHash: string, status: string, confirmations: number): Promise<{ error?: string }> {
    return this.request(`/deposits/${txHash}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, confirmations, confirmed_at: new Date().toISOString() }),
    });
  }
}

export const api = new ApiClient();
export type { User, Session, AuthResponse, DepositResponse };
