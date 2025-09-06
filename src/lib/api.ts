const API_BASE_URL = 'https://permit-management-backend-2.onrender.com/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Permits API
  async getPermits(params: {
    city?: string;
    workClass?: string;
    contractor?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return this.request(`/permits${queryString ? `?${queryString}` : ''}`);
  }

  async getPermitStats() {
    return this.request('/permits/stats');
  }

  async scrapePermits(city: string = 'Austin, TX') {
    return this.request('/permits/scrape', {
      method: 'POST',
      body: JSON.stringify({ city }),
    });
  }

  async exportPermits(params: {
    city?: string;
    workClass?: string;
    contractor?: string;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/permits/export${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permits_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Clients API
  async getClients() {
    return this.request('/clients');
  }

  async createClient(client: { company: string; email: string; industry: string }) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: string, client: { company: string; email: string; industry: string }) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Email Subscriptions API
  async getEmailSubscriptions(): Promise<any> {
    return this.request('/email/subscriptions');
  }

  async createEmailSubscription(subscriptionData: {
    email: string;
    name: string;
    city: string;
    workClass: string;
    frequency: string;
  }): Promise<any> {
    return this.request('/email/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateEmailSubscription(id: string, subscriptionData: {
    email?: string;
    name?: string;
    city?: string;
    workClass?: string;
    frequency?: string;
    isActive?: boolean;
  }): Promise<any> {
    return this.request(`/email/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  }

  async deleteEmailSubscription(id: string): Promise<any> {
    return this.request(`/email/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  async sendTestEmail(email: string): Promise<any> {
    return this.request('/email/test', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async sendEmailReport(subscriptionIds: string[]): Promise<any> {
    return this.request('/email/send-report', {
      method: 'POST',
      body: JSON.stringify({ subscriptionIds }),
    });
  }
}

export const apiClient = new ApiClient();
