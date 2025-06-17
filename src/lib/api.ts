
interface User {
  id: string;
  email: string;
  created_at: string;
  balance: number;
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          return { error: errorData.message || `HTTP ${response.status}` };
        } catch {
          return { error: errorText || `HTTP ${response.status}` };
        }
      }

      const data = await response.json();
      console.log('API success response:', data);

      return { data };
    } catch (error) {
      console.error('Network error:', error);
      return { error: 'Network error: Unable to connect to server' };
    }
  }

  // Auth methods
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.token) {
      this.token = result.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      return {
        user: result.data.user,
        session: {
          user: result.data.user,
          access_token: result.data.token,
          expires_at: Date.now() + 86400000, // 24 hours
        },
      };
    }

    return {
      error: result.error,
    };
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.token) {
      this.token = result.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      return {
        user: result.data.user,
        session: {
          user: result.data.user,
          access_token: result.data.token,
          expires_at: Date.now() + 86400000, // 24 hours
        },
      };
    }

    return {
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

  // Game data methods
  async saveGameHistory(userId: string, gameData: {
    multiplier: number;
    bet_amount: number;
    payout: number;
    crashed: boolean;
  }): Promise<{ error?: string }> {
    return this.request(`/users/${userId}/games`, {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getGameHistory(userId: string): Promise<{ data?: any[]; error?: string }> {
    return this.request<any[]>(`/users/${userId}/games`);
  }
}

export const api = new ApiClient();
export type { User, Session, AuthResponse, DepositResponse };
