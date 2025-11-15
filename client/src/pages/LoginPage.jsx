// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios'; // <-- Yeh 'axios' import karega
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // --- YEH LINE SABSE ZAROORI HAI ---
            // Hum 'axios' (default) nahi, 'api' (custom instance) ka istemal karenge
            // Lekin login ke liye default axios bhi theek hai, bas URL sahi hona chahiye
            const response = await axios.post('/api/auth/login', { email, password });
            // --- YEH LINE SABSE ZAROORI HAI ---

            localStorage.setItem('adminToken', response.data.token);
            navigate('/admin/dashboard');

        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Invalid Credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin Login</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Admin account nahi hai?{" "}
                    <Link
                        to="/register"
                        className="text-primary hover:underline font-medium"
                    >
                        Yahaan register karein
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;