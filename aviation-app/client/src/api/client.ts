const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API client that auto-attaches JWT token for authenticated requests.
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    setToken(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    clearToken(): void {
        localStorage.removeItem('auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.error || 'Request failed',
                errorData.code
            );
        }

        return response.json();
    }

    get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    post<T>(path: string, data?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(path: string, data?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    patch<T>(path: string, data?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}

export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
