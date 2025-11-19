// client/src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext.jsx'; // <--- AuthContext import

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [allowRegistration, setAllowRegistration] = useState(false); // <--- Registration status
    const { login } = useAuth(); // <--- AuthContext se login function

    const navigate = useNavigate();
    const location = useLocation(); // <--- For reset password message

    useEffect(() => {
        // Check if registration is allowed (first admin registration)
        const checkRegistrationStatus = async () => {
            try {
                const res = await axios.get('/api/auth/registration-status');
                setAllowRegistration(res.data.allowRegistration);
            } catch (err) {
                console.error("Failed to fetch registration status:", err);
                // toast.error("Failed to fetch registration status."); // No need for toast here
            }
        };
        checkRegistrationStatus();

        // Show password reset success message if navigated from ResetPasswordPage
        if (location.state?.message) {
            toast.success(location.state.message);
            // Clear the state so it doesn't show again on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/login', { email, password });
            login(res.data.token); // Use AuthContext's login function
            toast.success("Login successful!");
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-20">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-primary">
                    Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input with Eye Icon and Forgot Password Link */}
                    <div className="space-y-1"> {/* This div was causing issues */}
                        <Label htmlFor="password">Password</Label>
                        <div className="relative"> {/* Keep this relative for icon positioning */}
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10" // Add pr-10 for padding on right
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1" // Added p-1 for clickable area
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Forgot Password Link - Now correctly aligned */}
                        <div className="flex justify-end mt-1"> {/* Adjusted margin-top */}
                            <Link
                                to="/forgot-password"
                                className="text-xs text-muted-foreground hover:text-primary font-medium"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-lg" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Login"}
                    </Button>
                </form>

                {allowRegistration && (
                    <p className="text-center text-muted-foreground text-sm mt-6">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary hover:underline">
                            Register here
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;