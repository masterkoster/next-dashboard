import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';

interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    tier: string;
    emailVerified?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        if (api.isAuthenticated()) {
            api.get<{ user: User }>('/api/auth/me')
                .then((data) => setUser(data.user))
                .catch(() => {
                    api.clearToken();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/api/auth/login', {
            username,
            password,
        });
        api.setToken(data.token);
        setUser(data.user);
    };

    const signup = async (username: string, email: string, password: string, name?: string) => {
        const data = await api.post<{ token: string; user: User }>('/api/auth/signup', {
            username,
            email,
            password,
            name,
        });
        api.setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        api.clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
