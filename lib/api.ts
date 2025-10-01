import { ApiResponse } from './types';

// Simulate network latency and random errors
async function simulateApiCall<T>(data: T): Promise<ApiResponse<T>> {
  // Random delay between 200-800ms
  const delay = Math.random() * 600 + 200;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 5% chance of error
  if (Math.random() < 0.05) {
    throw new Error('Network error - please try again');
  }
  
  return {
    data,
    success: true,
    timestamp: new Date().toISOString()
  };
}

// API client wrapper
export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`API PUT ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`API DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
