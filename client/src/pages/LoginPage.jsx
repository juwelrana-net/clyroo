// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Backend API ko call karein
            const response = await axios.post('/api/auth/login', { email, password });

            // SABSE ZAROORI: Token ko localStorage mein save karein
            localStorage.setItem('adminToken', response.data.token);

            // Admin dashboard par redirect karein (Yeh hum next banayenge)
            navigate('/admin/dashboard');

        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Invalid Credentials.');
        }
    };

    return (
        <div className="container mx-auto max-w-sm px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin Login</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full">Login</Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an admin account?{" "}
                <Link
                    to="/register"
                    className="text-primary hover:underline"
                >
                    Register here
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;