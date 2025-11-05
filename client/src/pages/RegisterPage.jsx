// client/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx'; // Ab yeh file hai
import { AlertCircle } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Pehla admin account banane ke liye
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Backend API ko call karein
            await axios.post('/api/auth/register', { email, password });

            // Register success hone par login page par bhej dein
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="container mx-auto max-w-sm px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin Register</h1>
            <p className="text-center text-muted-foreground mb-6">
                (Yeh sirf pehla admin account banane ke liye hai)
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Admin Email</label>
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
                    <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Admin Password</label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full">Register Admin</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
                Pehle se account hai? <Link to="/login" className="text-primary hover:underline">Yahaan login karein</Link>
            </p>
        </div>
    );
};

export default RegisterPage;