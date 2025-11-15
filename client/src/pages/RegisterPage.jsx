// client/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx'; // Label import karein
import { AlertCircle, Eye, EyeOff, User, Loader2 } from 'lucide-react'; // Icons import karein

const RegisterPage = () => {
    // --- Nayi State ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null); // File object save karega
    const [imagePreview, setImagePreview] = useState(null); // Image preview URL save karega

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state

    const navigate = useNavigate();

    // --- Naya Handler: Image Select ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            // File ko preview karne ke liye URL banayein
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- Naya Handler: Password Toggle ---
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // --- Update Handler: Form Submit (Ab FormData bhejega) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // File upload ke liye humein FormData ka istemal karna hoga
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        if (profileImage) {
            formData.append('profileImage', profileImage); // File ko append karein
        }

        try {
            // Backend API ko FormData bhej
            // Axios 'Content-Type': 'multipart/form-data' khud set kar dega
            await axios.post('/api/auth/register', formData);

            // Register success hone par login page par bhej dein
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // --- NAYA UI ---
    return (
        <div className="container mx-auto max-w-md px-4 py-12">
            <div className="bg-background border border-border rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-primary">Create Admin Account</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* --- Naya: Profile Image Upload --- */}
                    <div className="flex flex-col items-center space-y-2">
                        <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                        <div className="relative">
                            {/* Image Preview ya Placeholder */}
                            <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                            {/* File Input (hidden) */}
                            <Input
                                id="profileImage"
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {/* File Input Trigger Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full"
                                onClick={() => document.getElementById('profileImage').click()}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* --- Naya: Name Input --- */}
                    <div className="space-y-1">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Aapka poora naam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                        {loading ? "Registering..." : "Create Account"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Pehle se account hai?{" "}
                    <Link
                        to="/login"
                        className="text-primary hover:underline font-medium"
                    >
                        Yahaan login karein
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;