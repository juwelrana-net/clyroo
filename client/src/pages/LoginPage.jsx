// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx'; // Label import karein
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'; // Icons import karein

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // --- Nayi State ---
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state

    const navigate = useNavigate();

    // --- Naya Handler: Password Toggle ---
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // --- Update Handler: Form Submit (Loading state ke saath) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true); // Loading shuru

        try {
            // Backend API ko call karein
            const response = await axios.post('/api/auth/login', { email, password });

            // Token ko localStorage mein save karein
            localStorage.setItem('adminToken', response.data.token);

            // Admin dashboard par redirect karein
            navigate('/admin/dashboard');

        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Invalid Credentials.');
        } finally {
            setLoading(false); // Loading khatam
        }
    };

    // --- NAYA UI ---
    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin Login</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Error Message */}
                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Email Input */}
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

                    {/* Password Input (Show/Hide ke saath) */}
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"} // Type ko state se control karein
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10" // Icon ke liye jagah banayein
                            />
                            {/* Toggle Button */}
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

                    {/* Submit Button */}
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