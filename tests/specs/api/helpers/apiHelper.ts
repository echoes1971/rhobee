interface LoginRequest {
  login: string;
  pwd: string;
}

interface ApiResponse {
  status: number;
  body: any;
}

export class ApiTestHelper {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'http://localhost:1971') {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse> {
    const url = `${this.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await response.json() : await response.text();
      return {
        status: response.status,
        body,
      };
    } catch (error) {
      throw new Error(`API request failed: ${error}`);
    }
  }

  /**
   * Health check endpoint
   * Endpoint: GET /ping
   */
  async ping(): Promise<ApiResponse> {
    return this.request('GET', '/ping');
  }

  /**
   * Sends a login request to the backend API
   * Endpoint: POST /login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.request('POST', '/login', credentials);
  }

  /**
   * Sends a logout request to the backend API
   * Endpoint: POST /logout
   * @param token - JWT token from login response
   */
  async logout(token: string): Promise<ApiResponse> {
    return this.request('POST', '/logout', {}, { Authorization: `Bearer ${token}` });
  }

  /**
   * Generic GET request helper
   */
  async get(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request('GET', endpoint, undefined, headers);
  }

  /**
   * Generic POST request helper
   */
  async post(endpoint: string, data: any, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request('POST', endpoint, data, headers);
  }

  /**
   * Generic PUT request helper
   */
  async put(endpoint: string, data: any, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request('PUT', endpoint, data, headers);
  }

  /**
   * Generic DELETE request helper
   */
  async delete(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse> {
    return this.request('DELETE', endpoint, undefined, headers);
  }
}
